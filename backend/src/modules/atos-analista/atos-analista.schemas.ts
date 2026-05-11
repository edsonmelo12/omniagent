import { z } from "zod";

export const primaryObjectiveSchema = z.enum(["authority", "distribution", "capture", "conversion", "discovery", "consideration"]);
export const returnHorizonSchema = z.enum(["short", "medium", "long", "short_term", "medium_term", "long_term"]);
export const funnelStageSchema = z.enum(["awareness", "consideration", "decision", "discovery", "post_conversion"]);
export const decisionSchema = z.enum(["scale", "repeat_with_adjustment", "redistribute", "archive", "inconclusive"]);
export const confidenceSchema = z.enum(["high", "medium", "low"]);

export const publishingAssetCreateSchema = z.object({
  clientId: z.string().min(1),
  scheduleId: z.string().optional(),
  executionId: z.string().optional(),
  pautaId: z.string().optional(),
  title: z.string().min(1),
  channel: z.string().min(1),
  format: z.string().min(1),
  publishedAt: z.string().datetime().optional(),
  url: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  platformsMetadata: z.record(z.any()).optional(),
  status: z.string().optional(),
});

export const assetIntentCreateSchema = z.object({
  assetId: z.string().min(1),
  clientId: z.string().min(1),
  primaryObjective: primaryObjectiveSchema,
  secondaryObjective: primaryObjectiveSchema.optional(),
  returnHorizon: returnHorizonSchema,
  funnelStage: funnelStageSchema,
  theme: z.string().min(1),
  angle: z.string().min(1),
  editorialThesis: z.string().optional(),
  icp: z.string().optional(),
});

export const assetIntentUpdateSchema = assetIntentCreateSchema.partial().omit({ assetId: true, clientId: true });

export const analyticalVerdictCreateSchema = z.object({
  clientId: z.string().min(1),
  targetType: z.enum(["asset", "group"]),
  targetId: z.string().min(1),
  decision: decisionSchema,
  probableCausality: z.string().optional(),
  confidence: confidenceSchema,
  mainGap: z.string().optional(),
  nextAction: z.string().optional(),
  analystId: z.string().optional(),
});

export const patternGroupCreateSchema = z.object({
  clientId: z.string().min(1),
  groupType: z.enum(["theme", "angle", "format", "objective"]),
  groupKey: z.string().min(1),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});
