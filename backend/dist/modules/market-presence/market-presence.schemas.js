import { z } from "zod";
const scopeSchema = z.enum(["local", "regional", "nacional", "nicho", "hibrido"]);
export const marketPresenceBaselineCreateSchema = z.object({
    scope: scopeSchema.optional(),
    marketContext: z.string().trim().optional(),
    sourceSnapshotId: z.string().uuid().optional(),
    sourceClientRecordId: z.string().uuid().optional(),
    sourceMarketResearchId: z.string().uuid().optional(),
    evidenceUrls: z.array(z.string().url()).default([]),
    notes: z.string().optional(),
});
export const marketPresenceInterventionCreateSchema = z.object({
    baselineId: z.string().uuid().optional(),
    periodStart: z.coerce.date().optional(),
    periodEnd: z.coerce.date().optional(),
    actionsTaken: z.array(z.string().trim()).default([]),
    channelsEdited: z.array(z.string().trim()).default([]),
    contentVolume: z.coerce.number().int().min(0).default(0),
    ctaChanges: z.coerce.number().int().min(0).default(0),
    siteChanges: z.coerce.number().int().min(0).default(0),
    proofChanges: z.coerce.number().int().min(0).default(0),
    notes: z.string().optional(),
});
export const marketPresenceCheckpointCreateSchema = z.object({
    baselineId: z.string().uuid().optional(),
    interventionId: z.string().uuid().optional(),
    sourceSnapshotId: z.string().uuid().optional(),
    sourceClientRecordId: z.string().uuid().optional(),
    sourceMarketResearchId: z.string().uuid().optional(),
    collectedAt: z.coerce.date().optional(),
    evidenceUrls: z.array(z.string().url()).default([]),
    notes: z.string().optional(),
});
export const marketPresenceCompareSchema = z.object({
    baselineId: z.string().uuid(),
    checkpointId: z.string().uuid(),
});
