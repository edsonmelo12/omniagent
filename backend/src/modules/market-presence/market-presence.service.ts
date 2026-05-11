import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import {
  findSocialIntelligenceSnapshotById,
  listSnapshotSourcesBySnapshotId,
  listLatestSnapshotByClientId,
} from "../social-intelligence/social-intelligence.repository.js";
import {
  createMarketPresenceBaselineVersion,
  createMarketPresenceCheckpointVersion,
  createMarketPresenceComparison,
  createMarketPresenceIntervention,
  ensureMarketPresenceTables,
  findLatestMarketPresenceBaselineByClientId,
  findLatestMarketPresenceCheckpointByClientId,
  findLatestMarketPresenceComparisonByClientId,
  findLatestMarketPresenceInterventionByClientId,
  findMarketPresenceBaselineById,
  findMarketPresenceCheckpointById,
  findMarketPresenceInterventionById,
  listMarketPresenceBaselinesByClientId,
  listMarketPresenceCheckpointsByClientId,
  listMarketPresenceComparisonsByClientId,
  listMarketPresenceInterventionsByClientId,
  type MarketPresenceBaselineRow,
  type MarketPresenceCheckpointRow,
  type MarketPresenceComparisonRow,
  type MarketPresenceInterventionRow,
} from "./market-presence.repository.js";
import { resolveMarketPresenceScope } from "../market-research/market-geography.js";
import type { MarketPresenceScope } from "./market-presence.schemas.js";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const calculateMaturity = (presence: number, consistency: number, proof: number, conversion: number) =>
  clampScore(Math.round((presence + consistency + proof + conversion) / 4));

const inferScope = (marketContext: string, clientSegment: string | null) =>
  resolveMarketPresenceScope({
    defaultCountry: "Brasil",
    sources: [
      { label: "marketContext", value: marketContext },
      { label: "client.segment", value: clientSegment },
    ],
  });

const stateLabel = (maturity: number) => {
  if (maturity >= 80) return "presença madura";
  if (maturity >= 60) return "presença funcional";
  if (maturity >= 40) return "base em construção";
  return "presença inicial";
};

const buildAnalogy = (maturityDelta: number, reading: string) => {
  if (reading === "insufficient_data") {
    return "Ainda nao ha evidencias suficientes para criar uma analogia confiavel.";
  }

  if (maturityDelta >= 10) {
    return "Saiu de uma vitrine apagada para uma presença mais viva.";
  }

  if (maturityDelta >= 5) {
    return "Saiu de uma presença basica para uma leitura mais forte.";
  }

  if (maturityDelta > 0) {
    return "Ganhou tracao, mas ainda sem virada completa.";
  }

  if (maturityDelta === 0) {
    return "Permaneceu estavel entre uma foto e outra.";
  }

  return "Perdeu forca e precisa de ajuste de rota.";
};

const buildReading = (baseline: MarketPresenceBaselineRow, checkpoint: MarketPresenceCheckpointRow) => {
  const maturityDelta = calculateMaturity(
    checkpoint.presence_score,
    checkpoint.consistency_score,
    checkpoint.proof_score,
    checkpoint.conversion_score,
  ) - calculateMaturity(
    baseline.presence_score,
    baseline.consistency_score,
    baseline.proof_score,
    baseline.conversion_score,
  );

  if ([baseline.presence_score, baseline.consistency_score, baseline.proof_score, baseline.conversion_score].some((value) => value === null) ||
      [checkpoint.presence_score, checkpoint.consistency_score, checkpoint.proof_score, checkpoint.conversion_score].some((value) => value === null)) {
    return {
      maturityDelta,
      reading: "insufficient_data",
      attribution: "unknown",
      analogy: buildAnalogy(maturityDelta, "insufficient_data"),
    };
  }

  if (maturityDelta >= 3) {
    return {
      maturityDelta,
      reading: "improved",
      attribution: checkpoint.intervention_id ? "likely_caused_by_actions" : "unknown",
      analogy: buildAnalogy(maturityDelta, "improved"),
    };
  }

  if (maturityDelta <= -3) {
    return {
      maturityDelta,
      reading: "regressed",
      attribution: checkpoint.intervention_id ? "mixed" : "likely_external_noise",
      analogy: buildAnalogy(maturityDelta, "regressed"),
    };
  }

  return {
    maturityDelta,
    reading: "stable",
    attribution: checkpoint.intervention_id ? "mixed" : "unknown",
    analogy: buildAnalogy(maturityDelta, "stable"),
  };
};

const buildEvidenceUrls = (items: Array<string | null | undefined>) => {
  const seen = new Set<string>();

  for (const item of items) {
    const value = item?.trim();
    if (value) {
      seen.add(value);
    }
  }

  return [...seen];
};

const summarizeScores = (presence: number, consistency: number, proof: number, conversion: number, confidence: number, profilesCount: number, sourceCount: number) =>
  `P ${presence}/100, C ${consistency}/100, Pr ${proof}/100, Cv ${conversion}/100, confiança ${confidence}/100, perfis ${profilesCount}, fontes ${sourceCount}.`;

const buildBaselinePayload = (input: {
  scope: MarketPresenceScope;
  marketContext: string;
  sourceSnapshotId: string | null;
  sourceClientRecordId: string | null;
  sourceMarketResearchId: string | null;
  evidenceUrls: string[];
  notes?: string | null;
  snapshotCollectedAt: string;
  presenceScore: number;
  consistencyScore: number;
  proofScore: number;
  conversionScore: number;
  confidenceScore: number;
  profilesCount: number;
  sourceCount: number;
  evidenceCount: number;
  lastPostDate: string | null;
}) => ({
  scope: input.scope,
  marketContext: input.marketContext,
  sourceSnapshotId: input.sourceSnapshotId,
  sourceClientRecordId: input.sourceClientRecordId,
  sourceMarketResearchId: input.sourceMarketResearchId,
  collectedAt: input.snapshotCollectedAt,
  scores: {
    presence: input.presenceScore,
    consistency: input.consistencyScore,
    proof: input.proofScore,
    conversion: input.conversionScore,
    confidence: input.confidenceScore,
  },
  counts: {
    profiles: input.profilesCount,
    sources: input.sourceCount,
    evidence: input.evidenceCount,
  },
  lastPostDate: input.lastPostDate,
  evidenceUrls: input.evidenceUrls,
  summary: summarizeScores(
    input.presenceScore,
    input.consistencyScore,
    input.proofScore,
    input.conversionScore,
    input.confidenceScore,
    input.profilesCount,
    input.sourceCount,
  ),
  stateLabel: stateLabel(calculateMaturity(input.presenceScore, input.consistencyScore, input.proofScore, input.conversionScore)),
  notes: input.notes ?? null,
});

const buildCheckpointPayload = (input: {
  baselineId: string;
  interventionId: string | null;
  sourceSnapshotId: string | null;
  sourceClientRecordId: string | null;
  sourceMarketResearchId: string | null;
  evidenceUrls: string[];
  notes?: string | null;
  collectedAt: string;
  presenceScore: number;
  consistencyScore: number;
  proofScore: number;
  conversionScore: number;
  confidenceScore: number;
  profilesCount: number;
  sourceCount: number;
  evidenceCount: number;
  lastPostDate: string | null;
  comparison: {
    presenceDelta: number;
    consistencyDelta: number;
    proofDelta: number;
    conversionDelta: number;
    maturityDelta: number;
    profilesDelta: number;
    sourceDelta: number;
    evidenceDelta: number;
    reading: string;
    attribution: string;
    analogy: string;
    executiveSummary: string;
  };
}) => ({
  baselineId: input.baselineId,
  interventionId: input.interventionId,
  sourceSnapshotId: input.sourceSnapshotId,
  sourceClientRecordId: input.sourceClientRecordId,
  sourceMarketResearchId: input.sourceMarketResearchId,
  collectedAt: input.collectedAt,
  scores: {
    presence: input.presenceScore,
    consistency: input.consistencyScore,
    proof: input.proofScore,
    conversion: input.conversionScore,
    confidence: input.confidenceScore,
  },
  counts: {
    profiles: input.profilesCount,
    sources: input.sourceCount,
    evidence: input.evidenceCount,
  },
  lastPostDate: input.lastPostDate,
  evidenceUrls: input.evidenceUrls,
  comparison: input.comparison,
  summary: summarizeScores(
    input.presenceScore,
    input.consistencyScore,
    input.proofScore,
    input.conversionScore,
    input.confidenceScore,
    input.profilesCount,
    input.sourceCount,
  ),
  notes: input.notes ?? null,
});

const buildComparisonPayload = (input: {
  baseline: MarketPresenceBaselineRow;
  checkpoint: MarketPresenceCheckpointRow;
  reading: string;
  attribution: string;
  analogy: string;
  maturityDelta: number;
}) => ({
  baseline: {
    id: input.baseline.id,
    version: input.baseline.version,
    scope: input.baseline.scope,
    marketContext: input.baseline.market_context,
    collectedAt: input.baseline.collected_at,
    summary: summarizeScores(
      input.baseline.presence_score,
      input.baseline.consistency_score,
      input.baseline.proof_score,
      input.baseline.conversion_score,
      input.baseline.confidence_score,
      input.baseline.profiles_count,
      input.baseline.source_count,
    ),
  },
  checkpoint: {
    id: input.checkpoint.id,
    version: input.checkpoint.version,
    collectedAt: input.checkpoint.collected_at,
    summary: summarizeScores(
      input.checkpoint.presence_score,
      input.checkpoint.consistency_score,
      input.checkpoint.proof_score,
      input.checkpoint.conversion_score,
      input.checkpoint.confidence_score,
      input.checkpoint.profiles_count,
      input.checkpoint.source_count,
    ),
  },
  reading: input.reading,
  attribution: input.attribution,
  analogy: input.analogy,
  maturityDelta: input.maturityDelta,
});

const collectEvidenceUrls = (args: {
  clientWebsiteUrl: string | null;
  snapshotSources: Array<{ source_url: string }>;
  profileUrls: string[];
  inputEvidenceUrls: string[];
}) =>
  buildEvidenceUrls([
    args.clientWebsiteUrl,
    ...args.snapshotSources.map((source) => source.source_url),
    ...args.profileUrls,
    ...args.inputEvidenceUrls,
  ]);

const getPublicSignalSourceCount = (marketResearch: Awaited<ReturnType<typeof findLatestMarketResearchByClientId>>) => {
  if (!marketResearch || typeof marketResearch.payload_json !== "object" || marketResearch.payload_json === null) {
    return 0;
  }

  const payload = marketResearch.payload_json as Record<string, unknown>;
  const publicSignals = payload.publicSignals;

  if (typeof publicSignals !== "object" || publicSignals === null) {
    return 0;
  }

  const sourceCount = (publicSignals as Record<string, unknown>).sourceCount;
  return typeof sourceCount === "number" && Number.isFinite(sourceCount) ? sourceCount : 0;
};

const resolveSnapshotSources = async (snapshotId: string | null) => {
  if (!snapshotId) {
    return [];
  }

  return listSnapshotSourcesBySnapshotId(snapshotId);
};

const mapScope = (scope: string | null | undefined): MarketPresenceScope =>
  scope === "local" || scope === "regional" || scope === "nacional" || scope === "nicho" || scope === "hibrido" ? scope : "hibrido";

const resolveSourceSnapshot = async (snapshotId: string | null | undefined, clientId: string) => {
  if (snapshotId) {
    return findSocialIntelligenceSnapshotById(snapshotId);
  }

  return listLatestSnapshotByClientId(clientId);
};

const computeBaselineFromState = async (input: {
  client: Awaited<ReturnType<typeof findClientById>>;
  snapshot: Awaited<ReturnType<typeof listLatestSnapshotByClientId>>;
  profiles: Awaited<ReturnType<typeof listSocialProfilesByClientId>>;
  clientRecord: Awaited<ReturnType<typeof findLatestClientRecordByClientId>>;
  marketResearch: Awaited<ReturnType<typeof findLatestMarketResearchByClientId>>;
  scope?: MarketPresenceScope;
  marketContext?: string;
  sourceSnapshotId?: string;
  sourceClientRecordId?: string;
  sourceMarketResearchId?: string;
  evidenceUrls?: string[];
  notes?: string;
}) => {
  if (!input.snapshot) {
    throw createError("FAILED_PRECONDITION", "Social intelligence snapshot is required before building a market presence baseline", 422);
  }

  const scope = input.scope ?? mapScope(input.marketContext ?? input.client.segment ?? "hibrido");
  const snapshotSources = await resolveSnapshotSources(input.snapshot.id);
  const publicSignalSourceCount = getPublicSignalSourceCount(input.marketResearch);
  const sourceUrls = collectEvidenceUrls({
    clientWebsiteUrl: input.client.website_url,
    snapshotSources,
    profileUrls: input.profiles.map((profile) => profile.profile_url),
    inputEvidenceUrls: input.evidenceUrls ?? [],
  });

  const presenceScore = clampScore(input.snapshot.presence_score ?? 0);
  const consistencyScore = clampScore(input.snapshot.consistency_score ?? 0);
  const proofScore = clampScore(input.snapshot.proof_score ?? 0);
  const conversionScore = clampScore(input.snapshot.conversion_readiness ?? 0);
  const confidenceScore = clampScore(input.snapshot.confidence ?? 0);
  const profilesCount = input.profiles.length;
  const sourceCount = snapshotSources.length + (input.client.website_url ? 1 : 0) + profilesCount + publicSignalSourceCount;
  const evidenceCount = sourceUrls.length;
  const collectedAt = input.snapshot.collected_at;

  return {
    scope,
    marketContext:
      input.marketContext?.trim() ||
      input.client.segment?.trim() ||
      input.client.notes?.trim() ||
      "Contexto de mercado derivado da inteligência social atual.",
    sourceSnapshotId: input.snapshot.id,
    sourceClientRecordId: input.clientRecord?.id ?? input.sourceClientRecordId ?? null,
    sourceMarketResearchId: input.marketResearch?.id ?? input.sourceMarketResearchId ?? null,
    evidenceUrls: sourceUrls,
    collectedAt,
    presenceScore,
    consistencyScore,
    proofScore,
    conversionScore,
    confidenceScore,
    profilesCount,
    sourceCount,
    evidenceCount,
    lastPostDate: null,
    notes: input.notes ?? null,
  };
};

export const getMarketPresenceContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await ensureMarketPresenceTables();

  const [latestBaseline, latestIntervention, latestCheckpoint, latestComparison, baselines, interventions, checkpoints, comparisons, snapshot, clientRecord, marketResearch, profiles] =
    await Promise.all([
      findLatestMarketPresenceBaselineByClientId(input.clientId),
      findLatestMarketPresenceInterventionByClientId(input.clientId),
      findLatestMarketPresenceCheckpointByClientId(input.clientId),
      findLatestMarketPresenceComparisonByClientId(input.clientId),
      listMarketPresenceBaselinesByClientId(input.clientId),
      listMarketPresenceInterventionsByClientId(input.clientId),
      listMarketPresenceCheckpointsByClientId(input.clientId),
      listMarketPresenceComparisonsByClientId(input.clientId),
      listLatestSnapshotByClientId(input.clientId),
      findLatestClientRecordByClientId(input.clientId),
      findLatestMarketResearchByClientId(input.clientId),
      listSocialProfilesByClientId(input.clientId),
    ]);

  return {
    client,
    latestBaseline,
    latestIntervention,
    latestCheckpoint,
    latestComparison,
    baselines,
    interventions,
    checkpoints,
    comparisons,
    snapshot,
    clientRecord,
    marketResearch,
    profiles,
  };
};

export const createMarketPresenceBaseline = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  scope?: MarketPresenceScope;
  marketContext?: string;
  sourceSnapshotId?: string;
  sourceClientRecordId?: string;
  sourceMarketResearchId?: string;
  evidenceUrls?: string[];
  notes?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await ensureMarketPresenceTables();

  const [snapshot, clientRecord, marketResearch, profiles] = await Promise.all([
    resolveSourceSnapshot(input.sourceSnapshotId, input.clientId),
    findLatestClientRecordByClientId(input.clientId),
    findLatestMarketResearchByClientId(input.clientId),
    listSocialProfilesByClientId(input.clientId),
  ]);

  const state = await computeBaselineFromState({
    client,
    snapshot,
    profiles,
    clientRecord,
    marketResearch,
    scope: input.scope,
    marketContext: input.marketContext,
    sourceSnapshotId: input.sourceSnapshotId,
    sourceClientRecordId: input.sourceClientRecordId,
    sourceMarketResearchId: input.sourceMarketResearchId,
    evidenceUrls: input.evidenceUrls,
    notes: input.notes,
  });

  const baseline = await createMarketPresenceBaselineVersion({
    clientId: input.clientId,
    scope: state.scope,
    marketContext: state.marketContext,
    sourceSnapshotId: state.sourceSnapshotId,
    sourceClientRecordId: state.sourceClientRecordId,
    sourceMarketResearchId: state.sourceMarketResearchId,
    collectedAt: new Date(state.collectedAt),
    presenceScore: state.presenceScore,
    consistencyScore: state.consistencyScore,
    proofScore: state.proofScore,
    conversionScore: state.conversionScore,
    confidenceScore: state.confidenceScore,
    profilesCount: state.profilesCount,
    sourceCount: state.sourceCount,
    evidenceCount: state.evidenceCount,
    lastPostDate: state.lastPostDate,
    notes: state.notes,
    payload: buildBaselinePayload({
      ...state,
      snapshotCollectedAt: state.collectedAt,
    }),
  });

  const baselines = await listMarketPresenceBaselinesByClientId(input.clientId);

  return {
    client,
    baseline,
    baselines,
    payload: baseline.payload_json,
  };
};

export const createMarketPresenceInterventionRecord = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  baselineId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  actionsTaken?: string[];
  channelsEdited?: string[];
  contentVolume?: number;
  ctaChanges?: number;
  siteChanges?: number;
  proofChanges?: number;
  notes?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await ensureMarketPresenceTables();

  const baseline = input.baselineId ? await findMarketPresenceBaselineById(input.baselineId) : await findLatestMarketPresenceBaselineByClientId(input.clientId);

  if (!baseline) {
    throw createError("FAILED_PRECONDITION", "A market presence baseline is required before registering interventions", 422);
  }

  const now = new Date();
  const periodStart = input.periodStart ?? now;
  const periodEnd = input.periodEnd ?? now;

  const intervention = await createMarketPresenceIntervention({
    clientId: input.clientId,
    baselineId: baseline.id,
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
    actionsTaken: input.actionsTaken ?? [],
    channelsEdited: input.channelsEdited ?? [],
    contentVolume: input.contentVolume ?? 0,
    ctaChanges: input.ctaChanges ?? 0,
    siteChanges: input.siteChanges ?? 0,
    proofChanges: input.proofChanges ?? 0,
    notes: input.notes ?? null,
    payload: {
      baselineId: baseline.id,
      periodStart: periodStart.toISOString().slice(0, 10),
      periodEnd: periodEnd.toISOString().slice(0, 10),
      actionsTaken: input.actionsTaken ?? [],
      channelsEdited: input.channelsEdited ?? [],
      contentVolume: input.contentVolume ?? 0,
      ctaChanges: input.ctaChanges ?? 0,
      siteChanges: input.siteChanges ?? 0,
      proofChanges: input.proofChanges ?? 0,
      notes: input.notes ?? null,
    },
  });

  const interventions = await listMarketPresenceInterventionsByClientId(input.clientId);

  return {
    client,
    baseline,
    intervention,
    interventions,
    payload: intervention.payload_json,
  };
};

export const createMarketPresenceCheckpoint = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  baselineId?: string;
  interventionId?: string;
  sourceSnapshotId?: string;
  sourceClientRecordId?: string;
  sourceMarketResearchId?: string;
  collectedAt?: Date;
  evidenceUrls?: string[];
  notes?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await ensureMarketPresenceTables();

  const baseline = input.baselineId ? await findMarketPresenceBaselineById(input.baselineId) : await findLatestMarketPresenceBaselineByClientId(input.clientId);

  if (!baseline) {
    throw createError("FAILED_PRECONDITION", "A market presence baseline is required before collecting a checkpoint", 422);
  }

  const intervention = input.interventionId ? await findMarketPresenceInterventionById(input.interventionId) : await findLatestMarketPresenceInterventionByClientId(input.clientId);
  const snapshot = await resolveSourceSnapshot(input.sourceSnapshotId ?? baseline.source_snapshot_id ?? undefined, input.clientId);
  const clientRecord = await findLatestClientRecordByClientId(input.clientId);
  const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
  const profiles = await listSocialProfilesByClientId(input.clientId);

  if (!snapshot) {
    throw createError("FAILED_PRECONDITION", "Social intelligence snapshot is required before collecting a checkpoint", 422);
  }

  const snapshotSources = await resolveSnapshotSources(snapshot.id);
  const publicSignalSourceCount = getPublicSignalSourceCount(marketResearch);
  const evidenceUrls = collectEvidenceUrls({
    clientWebsiteUrl: client.website_url,
    snapshotSources,
    profileUrls: profiles.map((profile) => profile.profile_url),
    inputEvidenceUrls: input.evidenceUrls ?? [],
  });

  const presenceScore = clampScore(snapshot.presence_score ?? 0);
  const consistencyScore = clampScore(snapshot.consistency_score ?? 0);
  const proofScore = clampScore(snapshot.proof_score ?? 0);
  const conversionScore = clampScore(snapshot.conversion_readiness ?? 0);
  const confidenceScore = clampScore(snapshot.confidence ?? 0);
  const profilesCount = profiles.length;
  const sourceCount = snapshotSources.length + (client.website_url ? 1 : 0) + profilesCount + publicSignalSourceCount;
  const evidenceCount = evidenceUrls.length;
  const collectedAt = input.collectedAt ?? new Date(snapshot.collected_at);

  const checkpoint = await createMarketPresenceCheckpointVersion({
    clientId: input.clientId,
    baselineId: baseline.id,
    interventionId: intervention?.id ?? input.interventionId ?? null,
    sourceSnapshotId: snapshot.id,
    sourceClientRecordId: clientRecord?.id ?? input.sourceClientRecordId ?? null,
    sourceMarketResearchId: marketResearch?.id ?? input.sourceMarketResearchId ?? null,
    collectedAt,
    presenceScore,
    consistencyScore,
    proofScore,
    conversionScore,
    confidenceScore,
    profilesCount,
    sourceCount,
    evidenceCount,
    lastPostDate: null,
    notes: input.notes ?? null,
    payload: {
      sourceSnapshotId: snapshot.id,
      sourceClientRecordId: clientRecord?.id ?? input.sourceClientRecordId ?? null,
      sourceMarketResearchId: marketResearch?.id ?? input.sourceMarketResearchId ?? null,
      evidenceUrls,
      notes: input.notes ?? null,
      collectedAt: collectedAt.toISOString(),
      scores: {
        presence: presenceScore,
        consistency: consistencyScore,
        proof: proofScore,
        conversion: conversionScore,
        confidence: confidenceScore,
      },
      counts: {
        profiles: profilesCount,
        sources: sourceCount,
        evidence: evidenceCount,
      },
    },
  });

  const comparison = await buildComparison(input.clientId, baseline, checkpoint);
  const checkpoints = await listMarketPresenceCheckpointsByClientId(input.clientId);
  const comparisons = await listMarketPresenceComparisonsByClientId(input.clientId);

  return {
    client,
    baseline,
    intervention: intervention ?? null,
    checkpoint,
    comparison,
    checkpoints,
    comparisons,
    payload: checkpoint.payload_json,
  };
};

const buildComparison = async (clientId: string, baseline: MarketPresenceBaselineRow, checkpoint: MarketPresenceCheckpointRow) => {
  const baselineMaturity = calculateMaturity(baseline.presence_score, baseline.consistency_score, baseline.proof_score, baseline.conversion_score);
  const checkpointMaturity = calculateMaturity(checkpoint.presence_score, checkpoint.consistency_score, checkpoint.proof_score, checkpoint.conversion_score);
  const presenceDelta = checkpoint.presence_score - baseline.presence_score;
  const consistencyDelta = checkpoint.consistency_score - baseline.consistency_score;
  const proofDelta = checkpoint.proof_score - baseline.proof_score;
  const conversionDelta = checkpoint.conversion_score - baseline.conversion_score;
  const maturityDelta = checkpointMaturity - baselineMaturity;
  const profilesDelta = checkpoint.profiles_count - baseline.profiles_count;
  const sourceDelta = checkpoint.source_count - baseline.source_count;
  const evidenceDelta = checkpoint.evidence_count - baseline.evidence_count;
  const readingInfo = buildReading(baseline, checkpoint);
  const executiveSummary =
    readingInfo.reading === "insufficient_data"
      ? "Ainda nao ha dados suficientes para comparar com confianca."
      : `Evolucao de ${maturityDelta >= 0 ? "+" : ""}${maturityDelta} pontos na maturidade, com ${presenceDelta >= 0 ? "+" : ""}${presenceDelta} em presenca, ${consistencyDelta >= 0 ? "+" : ""}${consistencyDelta} em consistencia, ${proofDelta >= 0 ? "+" : ""}${proofDelta} em prova e ${conversionDelta >= 0 ? "+" : ""}${conversionDelta} em conversao.`;

  return createMarketPresenceComparison({
    clientId,
    baselineId: baseline.id,
    checkpointId: checkpoint.id,
    presenceDelta,
    consistencyDelta,
    proofDelta,
    conversionDelta,
    maturityDelta: readingInfo.maturityDelta,
    profilesDelta,
    sourceDelta,
    evidenceDelta,
    reading: readingInfo.reading,
    attribution: readingInfo.attribution,
    analogy: readingInfo.analogy,
    executiveSummary,
    payload: buildComparisonPayload({
      baseline,
      checkpoint,
      reading: readingInfo.reading,
      attribution: readingInfo.attribution,
      analogy: readingInfo.analogy,
      maturityDelta: readingInfo.maturityDelta,
    }),
  });
};

export const compareMarketPresence = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  baselineId: string;
  checkpointId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await ensureMarketPresenceTables();

  const baseline = await findMarketPresenceBaselineById(input.baselineId);
  const checkpoint = await findMarketPresenceCheckpointById(input.checkpointId);

  if (!baseline || baseline.client_id !== input.clientId) {
    throw createError("NOT_FOUND", "Baseline not found for client", 404);
  }

  if (!checkpoint || checkpoint.client_id !== input.clientId) {
    throw createError("NOT_FOUND", "Checkpoint not found for client", 404);
  }

  const comparison = await buildComparison(input.clientId, baseline, checkpoint);
  const comparisons = await listMarketPresenceComparisonsByClientId(input.clientId);

  return {
    client,
    baseline,
    checkpoint,
    comparison,
    comparisons,
    payload: comparison.payload_json,
  };
};
