import { z } from "zod";
export const strategyRecommendationSchema = z.object({
    productId: z.string().trim().optional(),
    campaignObjective: z.string().trim().max(160).optional(),
    productContext: z.string().trim().max(1000).optional(),
    serviceContext: z.string().trim().max(1000).optional(),
    audienceContext: z.string().trim().max(1000).optional(),
    funnelStage: z.enum(["awareness", "consideration", "decision", "retention", "scale"]).optional(),
});
export const strategyIntelligenceLoadSchema = z.object({
    sourceAnalysisId: z.string().trim().uuid().optional(),
    productId: z.string().trim().uuid().optional(),
});
