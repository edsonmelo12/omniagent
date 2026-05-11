import { env } from "../../app/env.js";
import { findLatestScheduleByClientId } from "../content/content.repository.js";
import { logger } from "../../shared/logging/logger.js";
import { listAutoLivePublishingProfiles } from "../publishing-profiles/publishing-profiles.repository.js";
import { executePublishingSystem, hasAutoPublishingExecutionForKey, normalizePlatforms } from "./publishing.service.js";

type SchedulePayload = {
  items?: Array<{
    position?: number;
    date?: string;
    channel?: string;
    status?: string;
  }>;
};

type AutoTickResult = {
  startedAt: string;
  completedAt: string;
  profilesEvaluated: number;
  jobsAttempted: number;
  jobsTriggered: number;
  jobsSkipped: number;
  jobsFailed: number;
  details: Array<{
    clientId: string;
    profileId: string;
    channel: string;
    slot: string;
    status: "triggered" | "skipped" | "failed";
    reason: string;
    executionId?: string;
  }>;
};

const AUTO_SLOT_PREFIX = "auto-publish-slot";
const AUTO_REQUESTED_BY = "system:auto-publisher";

let autoWorkerTimer: NodeJS.Timeout | null = null;
let autoWorkerRunning = false;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const normalizeChannel = (value: string) => normalizePlatforms([value])[0] ?? "";

const readSchedulePayload = (value: unknown): SchedulePayload | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return value as SchedulePayload;
};

const readDate = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
};

const getBrtDate = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
};

const statusBlocksAutoPublish = (value: unknown) => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!normalized) {
    return false;
  }

  return ["published", "postado", "posted", "done", "concluido", "cancelled", "canceled", "hold", "paused"].some((token) =>
    normalized.includes(token),
  );
};

const buildAutoSlotKey = (input: {
  profileId: string;
  scheduleId: string;
  date: string;
  channel: string;
  position: number;
}) => `${AUTO_SLOT_PREFIX}|profile:${input.profileId}|schedule:${input.scheduleId}|date:${input.date}|channel:${input.channel}|position:${input.position}`;

const getDueItemsForChannel = (input: { schedulePayload: SchedulePayload | null; channel: string; todayBrt: string }) => {
  const items = Array.isArray(input.schedulePayload?.items) ? input.schedulePayload?.items : [];
  const dueItems: Array<{
    position: number;
    date: string;
    channel: string;
    status: string | undefined;
  }> = [];

  for (const item of items) {
    const date = readDate(item?.date);
    const channel = normalizeChannel(typeof item?.channel === "string" ? item.channel : "");
    const status = item?.status;

    if (!date || !channel) {
      continue;
    }

    if (channel !== input.channel) {
      continue;
    }

    if (date > input.todayBrt) {
      continue;
    }

    if (statusBlocksAutoPublish(status)) {
      continue;
    }

    dueItems.push({
      position: typeof item?.position === "number" ? item.position : 0,
      date,
      channel,
      status,
    });
  }

  return dueItems.sort((a, b) => {
    if (a.date === b.date) {
      return a.position - b.position;
    }

    return a.date.localeCompare(b.date);
  });
};

export const processPublishingAutoQueueOnce = async (options: { agencyId?: string } = {}): Promise<AutoTickResult | null> => {
  if (!env.PUBLISHING_AUTO_ENABLED) {
    return null;
  }

  if (autoWorkerRunning) {
    return null;
  }

  autoWorkerRunning = true;
  const startedAt = new Date().toISOString();
  const details: AutoTickResult["details"] = [];
  let jobsAttempted = 0;
  let jobsTriggered = 0;
  let jobsSkipped = 0;
  let jobsFailed = 0;

  try {
    const profiles = await listAutoLivePublishingProfiles({ agencyId: options.agencyId });
    const todayBrt = getBrtDate();

    for (const profile of profiles) {
      if (jobsTriggered >= env.PUBLISHING_AUTO_MAX_JOBS_PER_TICK) {
        break;
      }

      const normalizedChannel = normalizeChannel(profile.channel);
      if (!normalizedChannel) {
        continue;
      }

      const schedule = await findLatestScheduleByClientId(profile.client_id);
      if (!schedule) {
        details.push({
          clientId: profile.client_id,
          profileId: profile.id,
          channel: normalizedChannel,
          slot: "none",
          status: "skipped",
          reason: "No schedule found",
        });
        jobsSkipped += 1;
        continue;
      }

      const dueItems = getDueItemsForChannel({
        schedulePayload: readSchedulePayload(schedule.payload_json),
        channel: normalizedChannel,
        todayBrt,
      });

      if (dueItems.length === 0) {
        continue;
      }

      for (const dueItem of dueItems) {
        if (jobsTriggered >= env.PUBLISHING_AUTO_MAX_JOBS_PER_TICK) {
          break;
        }

        jobsAttempted += 1;

        const autoSlotKey = buildAutoSlotKey({
          profileId: profile.id,
          scheduleId: schedule.id,
          date: dueItem.date as string,
          channel: normalizedChannel,
          position: dueItem.position,
        });

        const alreadyExecuted = await hasAutoPublishingExecutionForKey({
          clientId: profile.client_id,
          autoKey: autoSlotKey,
        });

        if (alreadyExecuted) {
          details.push({
            clientId: profile.client_id,
            profileId: profile.id,
            channel: normalizedChannel,
            slot: autoSlotKey,
            status: "skipped",
            reason: "Already executed for this schedule slot",
          });
          jobsSkipped += 1;
          continue;
        }

        try {
          const result = await executePublishingSystem({
            agencyId: profile.agency_id,
            clientId: profile.client_id,
            mode: "live",
            confirm: true,
            platforms: [normalizedChannel],
            publishingProfileId: profile.id,
            notes: autoSlotKey,
            requestedBy: AUTO_REQUESTED_BY,
          });

          details.push({
            clientId: profile.client_id,
            profileId: profile.id,
            channel: normalizedChannel,
            slot: autoSlotKey,
            status: "triggered",
            reason: result.execution.status,
            executionId: result.execution.id,
          });
          jobsTriggered += 1;
        } catch (error) {
          details.push({
            clientId: profile.client_id,
            profileId: profile.id,
            channel: normalizedChannel,
            slot: autoSlotKey,
            status: "failed",
            reason: error instanceof Error ? error.message : "Unexpected error",
          });
          jobsFailed += 1;
        }
      }
    }

    const completedAt = new Date().toISOString();
    const output: AutoTickResult = {
      startedAt,
      completedAt,
      profilesEvaluated: profiles.length,
      jobsAttempted,
      jobsTriggered,
      jobsSkipped,
      jobsFailed,
      details,
    };

    logger.info("publishing auto tick completed", output);

    return output;
  } finally {
    autoWorkerRunning = false;
  }
};

export const startPublishingAutoWorker = (options: { keepAlive?: boolean } = {}) => {
  if (!env.PUBLISHING_AUTO_ENABLED) {
    logger.info("publishing auto worker disabled", { enabled: false });
    return;
  }

  if (autoWorkerTimer) {
    return;
  }

  autoWorkerTimer = setInterval(() => {
    void processPublishingAutoQueueOnce();
  }, env.PUBLISHING_AUTO_INTERVAL_MS);

  if (!options.keepAlive) {
    autoWorkerTimer.unref();
  }

  logger.info("publishing auto worker started", {
    intervalMs: env.PUBLISHING_AUTO_INTERVAL_MS,
    maxJobsPerTick: env.PUBLISHING_AUTO_MAX_JOBS_PER_TICK,
  });

  void processPublishingAutoQueueOnce();
};
