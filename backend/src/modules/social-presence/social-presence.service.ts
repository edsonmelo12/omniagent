import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { collectSocialPresenceObservations } from "./social-presence.search.js";
import {
  createSocialPresenceSnapshots,
  ensureSocialPresenceTables,
  listLatestSocialPresenceSnapshotsByClientId,
  listSocialPresenceSnapshotsByClientId,
  type SocialPresenceSnapshotRow,
} from "./social-presence.repository.js";
import { findSocialIntelligenceSnapshotById } from "../social-intelligence/social-intelligence.repository.js";

const formatCompactNumber = (value: number | null) => {
  if (value === null) return null;
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
};

const formatDateTime = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
};

const groupByPlatform = (snapshots: SocialPresenceSnapshotRow[]) => {
  const grouped = new Map<string, SocialPresenceSnapshotRow[]>();

  for (const snapshot of snapshots) {
    const key = snapshot.platform.trim().toLowerCase();
    const list = grouped.get(key) ?? [];
    list.push(snapshot);
    grouped.set(key, list);
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => {
      const collectedDiff = new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime();
      if (collectedDiff !== 0) return collectedDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  return grouped;
};

export const buildSocialPresenceSummary = (snapshots: SocialPresenceSnapshotRow[]) => {
  if (snapshots.length === 0) {
    return {
      summary: "Ainda nao ha presencia social monitorada.",
      totalFollowers: null as number | null,
      totalPosts: null as number | null,
      lastCapturedAt: null as string | null,
      latestPostAt: null as string | null,
      networks: [] as Array<{
        platform: string;
        handle: string | null;
        profileUrl: string;
        collectedAt: string;
        followersCount: number | null;
        followersDelta: number | null;
        postsCount: number | null;
        postsDelta: number | null;
        latestPostAt: string | null;
        observationStatus: string;
        confidence: number;
        notes: string | null;
      }>,
    };
  }

  const grouped = groupByPlatform(snapshots);
  const networks = [...grouped.entries()]
    .map(([platform, rows]) => {
      const latest = rows[0];
      const previous = rows[1] ?? null;

      return {
        platform,
        handle: latest.handle,
        profileUrl: latest.profile_url,
        collectedAt: latest.collected_at,
        followersCount: latest.followers_count,
        followersDelta:
          latest.followers_count !== null && previous?.followers_count !== null && previous?.followers_count !== undefined
            ? latest.followers_count - previous.followers_count
            : null,
        postsCount: latest.posts_count,
        postsDelta:
          latest.posts_count !== null && previous?.posts_count !== null && previous?.posts_count !== undefined
            ? latest.posts_count - previous.posts_count
            : null,
        latestPostAt: formatDateTime(latest.latest_post_at),
        observationStatus: latest.observation_status,
        confidence: latest.confidence,
        notes: latest.notes,
      };
    })
    .sort((a, b) => a.platform.localeCompare(b.platform));

  const totalFollowers = networks.reduce((sum, row) => sum + (row.followersCount ?? 0), 0);
  const totalPosts = networks.reduce((sum, row) => sum + (row.postsCount ?? 0), 0);
  const lastCapturedAt = snapshots.reduce<string | null>((latest, row) => {
    if (!latest) return row.collected_at;
    return new Date(row.collected_at).getTime() > new Date(latest).getTime() ? row.collected_at : latest;
  }, null);
  const latestPostAt = snapshots.reduce<string | null>((latest, row) => {
    if (!row.latest_post_at) return latest;
    if (!latest) return row.latest_post_at;
    return new Date(row.latest_post_at).getTime() > new Date(latest).getTime() ? row.latest_post_at : latest;
  }, null);

  const summaryParts = [
    `${networks.length} rede(s) monitorada(s)`,
    `${formatCompactNumber(totalFollowers) ?? totalFollowers} seguidores`,
    `${formatCompactNumber(totalPosts) ?? totalPosts} postagens`,
  ];

  if (latestPostAt) {
    summaryParts.push(`ultima postagem em ${formatDateTime(latestPostAt)}`);
  }

  return {
    summary: `Presenca social registrada: ${summaryParts.join(" · ")}.`,
    totalFollowers,
    totalPosts,
    lastCapturedAt,
    latestPostAt,
    networks,
  };
};

export const captureSocialPresence = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  sourceSnapshotId?: string;
  note?: string;
  mode?: "default" | "browser";
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  await ensureSocialPresenceTables();

  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  if (client.status.trim().toLowerCase() !== "active") {
    throw createError("FAILED_PRECONDITION", "Social presence capture is only available for active clients", 422);
  }

  const sourceSnapshot = input.sourceSnapshotId ? await findSocialIntelligenceSnapshotById(input.sourceSnapshotId) : null;
  if (input.sourceSnapshotId && !sourceSnapshot) {
    throw createError("NOT_FOUND", "Source social intelligence snapshot not found", 404);
  }
  if (input.sourceSnapshotId && sourceSnapshot && sourceSnapshot.client_id !== input.clientId) {
    throw createError("FAILED_PRECONDITION", "Source snapshot does not belong to this client", 422);
  }

  const profiles = await listSocialProfilesByClientId(input.clientId);

  if (profiles.length === 0) {
    throw createError("FAILED_PRECONDITION", "No social profiles available for presence capture", 422);
  }

  const observations = await collectSocialPresenceObservations({
    profiles: profiles.map((profile) => ({
      platform: profile.platform,
      handle: profile.handle,
      profile_url: profile.profile_url,
      confidence: profile.confidence,
    })),
    mode: input.mode ?? "default",
  });

  const snapshots = await createSocialPresenceSnapshots(
    observations.map((observation) => ({
      agencyId: input.agencyId,
      clientId: input.clientId,
      platform: observation.platform,
      handle: observation.handle,
      profileUrl: observation.profileUrl,
      sourceSnapshotId: sourceSnapshot?.id ?? input.sourceSnapshotId ?? null,
      collectedAt: new Date(),
      followersCount: observation.followersCount,
      postsCount: observation.postsCount,
      latestPostAt: observation.latestPostAt,
      observationStatus: observation.observationStatus,
      confidence: observation.confidence,
      notes: input.note ? `${input.note}\n\n${observation.notes}` : observation.notes,
      payload: observation.payload,
    })),
  );

  const historySnapshots = await listSocialPresenceSnapshotsByClientId(input.clientId);
  const latestSnapshots = await listLatestSocialPresenceSnapshotsByClientId(input.clientId);
  const summary = buildSocialPresenceSummary(historySnapshots);

  return {
    client,
    profiles,
    observations,
    snapshots,
    latestSnapshots,
    summary,
  };
};

export const getSocialPresenceContext = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  await ensureSocialPresenceTables();

  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profiles = await listSocialProfilesByClientId(input.clientId);
  const snapshots = await listSocialPresenceSnapshotsByClientId(input.clientId);
  const latestSnapshots = await listLatestSocialPresenceSnapshotsByClientId(input.clientId);
  const summary = buildSocialPresenceSummary(snapshots);

  return {
    client,
    profiles,
    snapshots,
    latestSnapshots,
    summary,
  };
};

export const listSocialPresenceHistory = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  platform?: string;
  status?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  await ensureSocialPresenceTables();

  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const snapshots = await listSocialPresenceSnapshotsByClientId(input.clientId, {
    platform: input.platform,
    status: input.status,
    from: input.from,
    to: input.to,
    limit: input.limit,
  });
  const latestSnapshots = await listLatestSocialPresenceSnapshotsByClientId(input.clientId);
  const summary = buildSocialPresenceSummary(snapshots);

  return {
    client,
    snapshots,
    latestSnapshots,
    summary,
  };
};
