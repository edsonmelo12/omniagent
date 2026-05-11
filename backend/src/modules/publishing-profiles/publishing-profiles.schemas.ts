import { z } from "zod";

export const publishingChannelSchema = z.enum(["instagram", "facebook", "linkedin", "pinterest", "tiktok", "youtube"]);
export const publishingProviderSchema = z.enum(["rube", "meta_graph", "linkedin_api", "youtube_api", "buffer", "manual"]);
export const publishingConnectionStatusSchema = z.enum([
  "disconnected",
  "pending_auth",
  "active",
  "reauth_required",
  "paused",
  "revoked",
  "error",
]);
export const publishingApprovalModeSchema = z.enum(["manual", "two_step", "auto"]);
export const publishingModeSchema = z.enum(["dry_run_only", "live_enabled"]);

export const publishingProfileCreateSchema = z.object({
  channel: publishingChannelSchema,
  provider: publishingProviderSchema,
  accountLabel: z.string().trim().min(2).max(180),
  externalAccountId: z.string().trim().min(1).max(255).optional(),
  secretRef: z.string().trim().min(3).max(255),
  approvalMode: publishingApprovalModeSchema.default("manual"),
  publishMode: publishingModeSchema.default("dry_run_only"),
  capabilities: z.record(z.string(), z.unknown()).default({}),
  constraints: z.record(z.string(), z.unknown()).default({}),
});

export const publishingProfileUpdateSchema = z
  .object({
    accountLabel: z.string().trim().min(2).max(180).optional(),
    externalAccountId: z.string().trim().min(1).max(255).nullable().optional(),
    secretRef: z.string().trim().min(3).max(255).optional(),
    connectionStatus: publishingConnectionStatusSchema.optional(),
    approvalMode: publishingApprovalModeSchema.optional(),
    publishMode: publishingModeSchema.optional(),
    capabilities: z.record(z.string(), z.unknown()).optional(),
    constraints: z.record(z.string(), z.unknown()).optional(),
    lastErrorCode: z.string().trim().min(1).max(120).nullable().optional(),
    lastErrorMessage: z.string().trim().min(1).max(1000).nullable().optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one publishing profile field must be provided",
  });
