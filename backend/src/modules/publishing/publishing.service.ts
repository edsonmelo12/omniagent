import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { listApprovalsByClientId } from "../approvals/approvals.repository.js";
import { findLatestContentPackageByClientId, findLatestContentPlanByClientId, findLatestScheduleByClientId } from "../content/content.repository.js";
import { listRenderedAssetsByClientId } from "../content/rendered-assets.service.js";
import {
  createPublishingExecution,
  findLatestPublishingExecutionByClientId,
  listPublishingExecutionsByClientId,
  type PublishingExecutionRow,
} from "./publishing.repository.js";
import {
  findPublishingProfileById,
  listPublishingProfilesByClientId,
  type PublishingProfileRow,
} from "../publishing-profiles/publishing-profiles.repository.js";
import { executePublishingAdapter } from "./publishing-adapters.js";
import { buildPublishingManifest } from "./publishing-manifest.js";
import { resolvePublishingSecret } from "./publishing-secrets.js";

type SchedulePayload = {
  contentPlanVersion?: number;
  cadence?: string;
  editorialPautas?: Array<{
    id?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    reason?: string;
    format?: string;
    source?: {
      clientRecordVersion?: number;
      proposalVersion?: number;
      marketResearchVersion?: number | null;
    };
  }>;
  items?: Array<{
    position?: number;
    date?: string;
    channel?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    format?: string;
    status?: string;
  }>;
};

type ContentPackagePayload = {
  contentPlanVersion?: number;
  items?: string[];
  note?: string | null;
  visualDirection?: {
    title?: string;
    owner?: string;
    mechanism?: string;
    firstPass?: string;
    masterAsset?: string;
    supportChannels?: string[];
    productImagePolicy?: string;
    rules?: string[];
    contentRhythm?: string;
    references?: string[];
  };
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const getNumber = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

const getValueAtPath = (value: unknown, path: string[]): unknown => {
  let current: unknown = value;

  for (const key of path) {
    const record = asRecord(current);
    if (!record) return null;
    current = record[key];
  }

  return current;
};

const getVersionAtPath = (value: unknown, path: string[]): number | null => getNumber(getValueAtPath(value, path));

const getSchedulePayload = (schedule: { payload_json: unknown; version: number; id: string } | null): SchedulePayload | null => {
  if (!schedule || typeof schedule.payload_json !== "object" || schedule.payload_json === null) {
    return null;
  }

  return schedule.payload_json as SchedulePayload;
};

const getContentPackagePayload = (contentPackage: { payload_json: unknown; version: number; id: string } | null): ContentPackagePayload | null => {
  if (!contentPackage || typeof contentPackage.payload_json !== "object" || contentPackage.payload_json === null) {
    return null;
  }

  return contentPackage.payload_json as ContentPackagePayload;
};

const readStatus = (value: unknown) => (typeof value === "string" ? value : null);

const isApproved = (status: string | null) => status === "approved";

export const normalizePlatforms = (value: string[]) => Array.from(new Set(value.map((item) => item.trim().toLowerCase()).filter(Boolean)));

export const buildTargetPlatforms = (input: {
  requestedPlatforms: string[];
  schedulePayload: SchedulePayload | null;
  contentPackagePayload: ContentPackagePayload | null;
}) => {
  const requested = normalizePlatforms(input.requestedPlatforms);

  if (requested.length > 0) {
    return requested;
  }

  const scheduleChannels = normalizePlatforms(
    (input.schedulePayload?.items ?? [])
      .map((item) => item?.channel ?? "")
      .filter((item): item is string => typeof item === "string"),
  );

  if (scheduleChannels.length > 0) {
    return scheduleChannels;
  }

  return normalizePlatforms(input.contentPackagePayload?.visualDirection?.supportChannels ?? []);
};

export const buildPublishingPayload = (input: {
  clientName: string;
  mode: "dry_run" | "live";
  confirmed: boolean;
  notes?: string;
  targetPlatforms: string[];
  contentPlanVersion: number | null;
  contentPackageVersion: number | null;
  scheduleVersion: number | null;
  schedulePayload: SchedulePayload | null;
  contentPackagePayload: ContentPackagePayload | null;
  approvalsPending: number;
  approvalsApproved: number;
}) => ({
  clientName: input.clientName,
  requestedMode: input.mode,
  confirmed: input.confirmed,
  notes: input.notes ?? null,
  targetPlatforms: input.targetPlatforms,
  contentPlanVersion: input.contentPlanVersion,
  contentPackageVersion: input.contentPackageVersion,
  scheduleVersion: input.scheduleVersion,
  contentRhythm: input.schedulePayload?.cadence ?? input.contentPackagePayload?.visualDirection?.contentRhythm ?? null,
  scheduleItems: (input.schedulePayload?.items ?? []).map((item) => ({
    position: item.position ?? 0,
    date: item.date ?? null,
    channel: item.channel ?? "instagram",
    title: item.title ?? "",
    pillar: item.pillar ?? "editorial",
    angle: item.angle ?? "positioning",
    objective: item.objective ?? "",
    format: item.format ?? "post",
    status: item.status ?? "planned",
  })),
  editorialPautas: input.schedulePayload?.editorialPautas ?? [],
  visualDirection: input.contentPackagePayload?.visualDirection ?? null,
  approvals: {
    pending: input.approvalsPending,
    approved: input.approvalsApproved,
  },
  generatedAt: new Date().toISOString(),
});

export const buildValidation = (input: {
  mode: "dry_run" | "live";
  confirm: boolean;
  contentPlanVersion: number | null;
  contentPackageVersion: number | null;
  scheduleVersion: number | null;
  scheduleStatus: string | null;
  contentPackageStatus: string | null;
  contentPackagePayload: ContentPackagePayload | null;
  schedulePayload: SchedulePayload | null;
  approvalsPending: number;
  approvalsApproved: number;
  targetPlatforms: string[];
}) => {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (input.contentPlanVersion === null) {
    blockers.push("Content plan is missing");
  }

  if (input.contentPackageVersion === null) {
    blockers.push("Content production package is missing");
  }

  if (input.scheduleVersion === null) {
    blockers.push("Schedule is missing");
  }

  const scheduleContentPlanVersion = getVersionAtPath(input.schedulePayload, ["contentPlanVersion"]);
  const packageContentPlanVersion = getVersionAtPath(input.contentPackagePayload, ["contentPlanVersion"]);

  if (scheduleContentPlanVersion !== null && input.contentPlanVersion !== null && scheduleContentPlanVersion < input.contentPlanVersion) {
    blockers.push("Schedule is stale after content plan changes");
  }

  if (packageContentPlanVersion !== null && input.contentPlanVersion !== null && packageContentPlanVersion < input.contentPlanVersion) {
    blockers.push("Content production package is stale after content plan changes");
  }

  if (!isApproved(input.scheduleStatus)) {
    blockers.push("Schedule still needs approval");
  }

  if (!isApproved(input.contentPackageStatus)) {
    blockers.push("Content production package still needs approval");
  }

  if (input.approvalsPending > 0) {
    blockers.push(`${input.approvalsPending} schedule approval(s) pending`);
  }

  if (input.approvalsApproved === 0) {
    blockers.push("Schedule approval is missing");
  }

  if (input.targetPlatforms.length === 0) {
    blockers.push("No social platforms were resolved for publication");
  }

  if (input.mode === "live" && !input.confirm) {
    blockers.push("Live publication requires explicit confirmation");
  }

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
  };
};

const summarizeExecution = (execution: PublishingExecutionRow) => ({
  id: execution.id,
  publishingProfileId: execution.publishing_profile_id,
  mode: execution.mode,
  status: execution.status,
  platforms: Array.isArray(execution.platforms) ? execution.platforms : [],
  confirmedAt: execution.confirmed_at,
  createdAt: execution.created_at,
});

const toPublishingProfileSummary = (profile: PublishingProfileRow) => ({
  id: profile.id,
  channel: profile.channel,
  provider: profile.provider,
  accountLabel: profile.account_label,
  connectionStatus: profile.connection_status,
  approvalMode: profile.approval_mode,
  publishMode: profile.publish_mode,
  capabilities: asRecord(profile.capabilities_json),
  constraints: asRecord(profile.constraints_json),
  lastValidatedAt: profile.last_validated_at,
});

export const getPublishingContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const [latestExecution, executions, clientRecord, contentPlan, contentPackage, schedule, approvals, publishingProfiles] = await Promise.all([
    findLatestPublishingExecutionByClientId(input.clientId),
    listPublishingExecutionsByClientId(input.clientId),
    findLatestClientRecordByClientId(input.clientId),
    findLatestContentPlanByClientId(input.clientId),
    findLatestContentPackageByClientId(input.clientId),
    findLatestScheduleByClientId(input.clientId),
    listApprovalsByClientId(input.clientId),
    listPublishingProfilesByClientId(input.clientId),
  ]);

  const schedulePayload = getSchedulePayload(schedule);
  const contentPackagePayload = getContentPackagePayload(contentPackage);

  return {
    client,
    latestExecution,
    executions,
    clientRecord,
    contentPlan,
    contentPackage,
    schedule,
    approvals,
    publishingProfiles: publishingProfiles.map(toPublishingProfileSummary),
    schedulePayload,
    contentPackagePayload,
  };
};

export const executePublishing = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  mode: "dry_run" | "live";
  confirm: boolean;
  platforms: string[];
  publishingProfileId?: string;
  notes?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const [clientRecord, contentPlan, contentPackage, schedule, approvals, publishingProfiles, renderedAssets] = await Promise.all([
    findLatestClientRecordByClientId(input.clientId),
    findLatestContentPlanByClientId(input.clientId),
    findLatestContentPackageByClientId(input.clientId),
    findLatestScheduleByClientId(input.clientId),
    listApprovalsByClientId(input.clientId),
    listPublishingProfilesByClientId(input.clientId),
    listRenderedAssetsByClientId(input.clientId),
  ]);

  if (!contentPlan || !contentPackage || !schedule) {
    throw createError("FAILED_PRECONDITION", "Content plan, content production package and schedule are required before publishing", 422);
  }

  const contentPackagePayload = getContentPackagePayload(contentPackage);
  const schedulePayload = getSchedulePayload(schedule);
  const approvalsApproved = approvals.filter((approval) => approval.artifact_type === "schedule" && approval.status === "approved").length;
  const approvalsPending = approvals.filter((approval) => approval.artifact_type === "schedule" && approval.status === "pending").length;
  const targetPlatforms = buildTargetPlatforms({
    requestedPlatforms: input.platforms,
    schedulePayload,
    contentPackagePayload,
  });
  const selectedProfile = input.publishingProfileId ? await findPublishingProfileById(input.publishingProfileId) : null;

  if (selectedProfile && selectedProfile.client_id !== input.clientId) {
    throw createError("BAD_REQUEST", "Publishing profile does not belong to the client", 400);
  }

  if (selectedProfile && targetPlatforms.length > 0 && !targetPlatforms.includes(selectedProfile.channel)) {
    throw createError("BAD_REQUEST", "Publishing profile channel does not match requested platforms", 400);
  }

  const manifests = targetPlatforms.map((platform) =>
    buildPublishingManifest({
      clientName: client.name,
      channel: platform,
      schedulePayload,
      contentPackagePayload,
      renderedAssets,
    }),
  );
  const selectedManifest = selectedProfile
    ? manifests.find((manifest) => manifest.channel === selectedProfile.channel) ?? null
    : null;
  const secretResolution = selectedProfile ? resolvePublishingSecret(selectedProfile.secret_ref) : null;

  const validation = buildValidation({
    mode: input.mode,
    confirm: input.confirm,
    contentPlanVersion: contentPlan.version,
    contentPackageVersion: contentPackage.version,
    scheduleVersion: schedule.version,
    scheduleStatus: schedule.status,
    contentPackageStatus: contentPackage.status,
    contentPackagePayload,
    schedulePayload,
    approvalsPending,
    approvalsApproved,
    targetPlatforms,
  });

  if (input.mode === "live") {
    if (!selectedProfile) {
      validation.blockers.push("Live publication requires a publishing profile");
    } else {
      if (selectedProfile.publish_mode !== "live_enabled") {
        validation.blockers.push("Publishing profile is not enabled for live publishing");
      }

      if (selectedProfile.connection_status !== "active") {
        validation.blockers.push("Publishing profile is not active");
      }

      if (!selectedManifest) {
        validation.blockers.push("No publishing manifest could be resolved for the selected profile channel");
      }

      if (secretResolution && !secretResolution.resolved && selectedProfile.provider !== "manual") {
        validation.blockers.push("Publishing profile secret could not be resolved at runtime");
      }
    }
  }

  if (selectedProfile && selectedProfile.publish_mode === "dry_run_only" && input.mode === "live") {
    validation.blockers.push("Publishing profile only allows dry-run execution");
  }

  const payload = buildPublishingPayload({
    clientName: client.name,
    mode: input.mode,
    confirmed: input.confirm,
    notes: input.notes,
    targetPlatforms,
    contentPlanVersion: contentPlan.version,
    contentPackageVersion: contentPackage.version,
    scheduleVersion: schedule.version,
    schedulePayload,
    contentPackagePayload,
    approvalsPending,
    approvalsApproved,
  });
  const payloadWithProfile = {
    ...payload,
    publishingProfile: selectedProfile ? toPublishingProfileSummary(selectedProfile) : null,
    manifests,
  };

  const adapterResult =
    selectedProfile && selectedManifest && secretResolution
      ? await executePublishingAdapter({
          mode: input.mode,
          profile: selectedProfile,
          manifest: selectedManifest,
          secretResolution,
        })
      : null;

  if (adapterResult?.blockers.length) {
    validation.blockers.push(...adapterResult.blockers);
  }

  if (adapterResult?.warnings.length) {
    validation.warnings.push(...adapterResult.warnings);
  }

  const status = validation.blockers.length > 0
    ? "blocked"
    : adapterResult?.status === "handoff_required"
      ? "queued"
      : adapterResult?.status ?? (input.mode === "dry_run" ? "dry_run_passed" : "published");

  const result = {
    deliveryMode: input.mode === "live" ? "adapter" : "validation",
    mode: input.mode,
    status,
    publishedAt: status === "published" ? new Date().toISOString() : null,
    executionSummary: {
      clientId: input.clientId,
      contentPlanVersion: contentPlan.version,
      contentPackageVersion: contentPackage.version,
      scheduleVersion: schedule.version,
      targetPlatforms,
      manifests,
      publishingProfile: selectedProfile ? toPublishingProfileSummary(selectedProfile) : null,
      availablePublishingProfiles: publishingProfiles.map(toPublishingProfileSummary),
      blockers: validation.blockers,
      warnings: validation.warnings,
    },
    publishingProfileId: selectedProfile?.id ?? null,
    adapter: adapterResult,
    notes: input.notes ?? null,
  };

  const execution = await createPublishingExecution({
    clientId: input.clientId,
    scheduleId: schedule.id,
    publishingProfileId: selectedProfile?.id ?? null,
    mode: input.mode,
    status,
    platforms: targetPlatforms,
    payload: payloadWithProfile,
    validation,
    result,
    requestedBy: input.userId,
    confirmedBy: input.mode === "live" && input.confirm ? input.userId : null,
    confirmedAt: input.mode === "live" && input.confirm ? new Date().toISOString() : null,
  });

  const executions = await listPublishingExecutionsByClientId(input.clientId);

  return {
    client,
    clientRecord,
    contentPlan,
    contentPackage,
    schedule,
    approvals,
    execution,
    executions,
    payload: payloadWithProfile,
    validation,
    result,
    summary: summarizeExecution(execution),
  };
};
