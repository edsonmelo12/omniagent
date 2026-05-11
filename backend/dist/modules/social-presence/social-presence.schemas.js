import { z } from "zod";
const platformSchema = z.enum([
    "instagram",
    "facebook",
    "linkedin",
    "youtube",
    "tiktok",
    "x",
    "threads",
    "pinterest",
    "other",
]);
const observationStatusSchema = z.enum(["captured", "partial", "unavailable"]);
const captureModeSchema = z.enum(["default", "browser"]);
export const socialPresenceCaptureSchema = z.object({
    sourceSnapshotId: z.string().uuid().optional(),
    note: z.string().optional(),
    mode: captureModeSchema.optional(),
});
export const socialPresenceListSchema = z.object({
    platform: platformSchema.optional(),
    status: observationStatusSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
