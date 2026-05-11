import { createError } from "../../shared/http/errors.js";
import { env } from "../../app/env.js";
import { queryOne } from "../../shared/db/database.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findClientById } from "../clients/clients.repository.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { createSnapshot, createSnapshotSources, listLatestSnapshotByClientId } from "./social-intelligence.repository.js";
import { buildSocialSearchQueries, searchSocialIntelligenceSources } from "./social-intelligence.search.js";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const scorePresence = (profilesCount: number) => {
  if (profilesCount >= 4) return 90;
  if (profilesCount === 3) return 80;
  if (profilesCount === 2) return 70;
  if (profilesCount === 1) return 55;
  return 20;
};

const scoreConsistency = (profilesCount: number) => {
  if (profilesCount >= 4) return 85;
  if (profilesCount === 3) return 75;
  if (profilesCount === 2) return 65;
  if (profilesCount === 1) return 45;
  return 15;
};

const scoreProof = (profilesCount: number) => {
  if (profilesCount >= 3) return 70;
  if (profilesCount === 2) return 55;
  if (profilesCount === 1) return 40;
  return 10;
};

const scoreConversionReadiness = (profilesCount: number) => {
  if (profilesCount >= 4) return 80;
  if (profilesCount === 3) return 70;
  if (profilesCount === 2) return 60;
  if (profilesCount === 1) return 40;
  return 15;
};

const buildGaps = (profilesCount: number) => {
  if (profilesCount === 0) {
    return ["presence", "consistency", "proof", "conversion"];
  }

  if (profilesCount === 1) {
    return ["consistency", "proof", "conversion"];
  }

  if (profilesCount === 2) {
    return ["proof", "conversion"];
  }

  return ["conversion"];
};

const buildOpportunityNotes = (profilesCount: number) => {
  if (profilesCount === 0) {
    return ["Discover official social profiles and establish a clear public footprint."];
  }

  if (profilesCount === 1) {
    return ["Strengthen cadence and clarify one consistent narrative across channels."];
  }

  if (profilesCount === 2) {
    return ["Expand proof points and connect content more directly to conversion signals."];
  }

  return ["The brand can shift from presence to authority and conversion with evidence-led content."];
};

const appendNotes = (baseNotes: string | undefined, additions: string[]) => {
  const content = additions.filter(Boolean).join("\n");

  if (!baseNotes) {
    return content || undefined;
  }

  if (!content) {
    return baseNotes;
  }

  return `${baseNotes}\n\n${content}`;
};

const dedupeSnapshotSources = (
  sources: Array<{
    sourceUrl: string;
    sourceType: string;
    confidence: number;
    notes: string;
  }>,
) => {
  const seen = new Set<string>();
  const unique: Array<{
    sourceUrl: string;
    sourceType: string;
    confidence: number;
    notes: string;
  }> = [];

  for (const source of sources) {
    const key = source.sourceUrl.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(source);
  }

  return unique;
};

export const buildSocialIntelligenceSnapshot = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  publicOnly: boolean;
  confidence?: number;
  rawNotes?: string;
  sourceUrls?: string[];
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profiles = await listSocialProfilesByClientId(input.clientId);

  if (profiles.length === 0 && !client.website_url && !env.BRAVE_SEARCH_API_KEY) {
    throw createError("FAILED_PRECONDITION", "No discovery inputs available for social intelligence", 422);
  }

  const braveSources = await searchSocialIntelligenceSources({
    client,
    profiles,
  });

  const profilesCount = profiles.length;
  const presenceScore = clampScore(scorePresence(profilesCount));
  const consistencyScore = clampScore(scoreConsistency(profilesCount));
  const proofScore = clampScore(scoreProof(profilesCount));
  const conversionReadiness = clampScore(scoreConversionReadiness(profilesCount));
  const snapshotConfidence = clampScore(input.confidence ?? (profilesCount > 0 ? 75 : 45));
  const mainGaps = buildGaps(profilesCount);
  const opportunityNotes = buildOpportunityNotes(profilesCount);
  const searchQueries = buildSocialSearchQueries(client, profiles);
  const enrichedRawNotes = appendNotes(input.rawNotes, [
    braveSources.length > 0
      ? `Brave Search executou ${searchQueries.length} consulta(s) e retornou ${braveSources.length} fonte(s) públicas relevantes.`
      : env.BRAVE_SEARCH_API_KEY
        ? `Brave Search executou ${searchQueries.length} consulta(s), mas não retornou fontes relevantes para este ciclo.`
        : "",
  ]);

  const snapshot = await createSnapshot({
    clientId: input.clientId,
    publicOnly: input.publicOnly,
    confidence: snapshotConfidence,
    presenceScore,
    consistencyScore,
    proofScore,
    conversionReadiness,
    mainGaps,
    opportunityNotes,
    rawNotes: enrichedRawNotes,
  });

  const sourceRows = await createSnapshotSources(
    snapshot.id,
    dedupeSnapshotSources([
      ...(input.sourceUrls ?? []).map((sourceUrl) => ({
        sourceUrl,
        sourceType: "website",
        confidence: 90,
        notes: "Provided in request",
      })),
      ...profiles.map((profile) => ({
        sourceUrl: profile.profile_url,
        sourceType: profile.platform,
        confidence: profile.confidence,
        notes: "Discovered profile",
      })),
      ...braveSources.map((source) => ({
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType,
        confidence: source.confidence,
        notes: source.notes,
      })),
    ]),
  );

  const latest = await listLatestSnapshotByClientId(input.clientId);

  return {
    client,
    profiles,
    snapshot: latest ?? snapshot,
    sources: sourceRows,
  };
};

export const getLatestSocialIntelligence = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const snapshot = await listLatestSnapshotByClientId(input.clientId);

  if (!snapshot) {
    throw createError("NOT_FOUND", "Social intelligence snapshot not found", 404);
  }

  const profiles = await listSocialProfilesByClientId(input.clientId);

  const sources = await queryOne<{ sources: Array<{ source_url: string; source_type: string; confidence: number; notes: string | null }> }>(
    `select coalesce(json_agg(json_build_object(
       'source_url', sis.source_url,
       'source_type', sis.source_type,
       'confidence', sis.confidence,
       'notes', sis.notes
     )), '[]'::json) as sources
     from social_intelligence_sources sis
     where sis.snapshot_id = $1`,
    [snapshot.id],
  );

  return {
    client,
    profiles,
    snapshot,
    sources: sources?.sources ?? [],
  };
};
