import { createError } from "../../shared/http/errors.js";
import { 
  createAssetIntentRow, 
  findAssetIntentByAssetId,
  createAnalyticalVerdictRow,
  listVerdictsByTarget,
  createPublishingAssetRow,
  findPublishingAssetById,
  listPublishingAssetsByClientId
} from "./atos-analista.repository.js";
import { 
  assetIntentCreateSchema,
  analyticalVerdictCreateSchema,
  publishingAssetCreateSchema
} from "./atos-analista.schemas.js";
import { listObservationSummaries } from "../otiniel-observa/otiniel-observa.service.js";
import { 
  listNormalizedObservationRecordsByClientId,
  listQualitativeEvidenceByClientId,
  upsertObservationSummaryRow
} from "../otiniel-observa/otiniel-observa.repository.js";
import { buildObservationSummaryDrafts } from "../otiniel-observa/otiniel-observa.analytics.js";
import {
  assertObservationSummarySafeForAtos,
  sanitizeObservationSummaryForAtos,
} from "./atos-analista.observation-contract.js";

// Intelligence & Summarization (Atos as Orchestrator)
export const analyzeAndSummarizePeriod = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  windowType: string;
  periodStart: string;
  periodEnd: string;
  assetId?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  // Fetching raw evidence from Ingestor Oto's jurisdiction
  const normalizedRecords = await listNormalizedObservationRecordsByClientId(input.clientId, {
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    assetId: input.assetId ?? undefined,
    windowType: input.windowType,
  });
  
  const qualitativeEvidence = await listQualitativeEvidenceByClientId(input.clientId, {
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    assetId: input.assetId ?? undefined,
    windowType: input.windowType,
  });

  // Intelligence Phase: Building Summaries
  const summaryDrafts = buildObservationSummaryDrafts({
    windowType: input.windowType as "asset" | "weekly" | "monthly",
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    assetId: input.assetId ?? null,
    normalizedRecords,
    qualitativeEvidence,
  });

  const summaries = [];
  for (const draft of summaryDrafts) {
    summaries.push(
      await upsertObservationSummaryRow({
        agencyId: input.agencyId,
        clientId: input.clientId,
        ...draft,
      }),
    );
  }

  return {
    client,
    summaries,
    intelligenceSnapshot: {
      recordsCount: normalizedRecords.length,
      evidenceCount: qualitativeEvidence.length,
      summaryCount: summaries.length
    }
  };
};

// Intent Management
export const createAssetIntent = async (input: any) => {
  const data = assetIntentCreateSchema.parse(input);
  
  return await createAssetIntentRow({
    asset_id: data.assetId,
    client_id: data.clientId,
    primary_objective: data.primaryObjective,
    secondary_objective: data.secondaryObjective ?? null,
    return_horizon: data.returnHorizon,
    funnel_stage: data.funnelStage,
    theme: data.theme,
    angle: data.angle,
    editorial_thesis: data.editorialThesis ?? null,
    icp: data.icp ?? null,
  });
};

export const getAssetIntent = async (assetId: string) => {
  return await findAssetIntentByAssetId(assetId);
};

// Asset Management
export const createPublishingAsset = async (input: any) => {
  const data = publishingAssetCreateSchema.parse(input);
  
  return await createPublishingAssetRow({
    client_id: data.clientId,
    schedule_id: data.scheduleId ?? null,
    execution_id: data.executionId ?? null,
    pauta_id: data.pautaId ?? null,
    title: data.title,
    channel: data.channel,
    format: data.format,
    published_at: data.publishedAt ? new Date(data.publishedAt) : null,
    url: data.url ?? null,
    thumbnail_url: data.thumbnailUrl ?? null,
    platforms_metadata: data.platformsMetadata ?? {},
    status: data.status ?? "published",
  });
};

export const getPublishingAsset = async (assetId: string) => {
  return await findPublishingAssetById(assetId);
};

export const listAssets = async (clientId: string) => {
  return await listPublishingAssetsByClientId(clientId);
};

// Evidence Bridge (Otiniel Integration)
export const getAssetEvidenceSummary = async (input: { userId: string; agencyId: string; clientId: string; assetId: string }) => {
  const asset = await findPublishingAssetById(input.assetId);
  if (!asset || asset.client_id !== input.clientId) {
    return null;
  }

  // Bridging to Otiniel Observa module
  const response = await listObservationSummaries({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
    assetId: input.assetId,
    windowType: "asset",
    periodStart: "2000-01-01T00:00:00Z", // Wide window to ensure asset fetch
    periodEnd: "2100-01-01T00:00:00Z"
  });

  const sanitizedSummaries = response.summaries.map((summary) => sanitizeObservationSummaryForAtos(summary));
  try {
    sanitizedSummaries.forEach((summary) => assertObservationSummarySafeForAtos(summary));
  } catch (error) {
    const message = error instanceof Error ? error.message : "observation summary contract validation failed";
    throw createError("BAD_REQUEST", message, 400);
  }

  return {
    ...response,
    summaries: sanitizedSummaries,
  };
};

// Verdict Management
export const createVerdict = async (input: any) => {
  const data = analyticalVerdictCreateSchema.parse(input);
  
  return await createAnalyticalVerdictRow({
    client_id: data.clientId,
    target_type: data.targetType,
    target_id: data.targetId,
    decision: data.decision,
    probable_causality: data.probableCausality ?? null,
    confidence: data.confidence,
    main_gap: data.mainGap ?? null,
    next_action: data.nextAction ?? null,
    analyst_id: data.analystId ?? null,
  });
};

export const getVerdicts = async (targetType: string, targetId: string) => {
  return await listVerdictsByTarget(targetType, targetId);
};

// Confidence Calculator (Analytic Rule Implementation)
export const calculateConfidence = (evidence: { summaries: any[] }) => {
  if (!evidence || !evidence.summaries || evidence.summaries.length === 0) {
    return "low";
  }

  const hasHighLevelEvidence = evidence.summaries.some(s => s.evidence_level === "authorized_export" || s.evidence_level === "direct_api");
  const isComplete = evidence.summaries.every(s => s.completeness_status === "complete");

  if (hasHighLevelEvidence && isComplete) {
    return "high";
  }

  if (hasHighLevelEvidence || isComplete) {
    return "medium";
  }

  return "low";
};
