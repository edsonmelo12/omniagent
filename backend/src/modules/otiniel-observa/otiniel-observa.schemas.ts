import { z } from "zod";

const metricSchema = z.object({
  name: z.string().min(1),
  value: z.coerce.number(),
  unit: z.string().min(1),
});

const observationRecordSchema = z.object({
  assetExternalRef: z.string().min(1).optional(),
  recordType: z.string().min(1).default("manual"),
  metrics: z.array(metricSchema).default([]),
  notes: z.string().optional(),
});

export const observationProfileCreateSchema = z.object({
  provider: z.enum(["meta", "youtube", "ga4", "linkedin", "crm", "manual", "other"]),
  channel: z.string().min(1),
  profileType: z.string().min(1).default("observation"),
  accountRef: z.string().min(1),
  propertyRef: z.string().optional(),
  organizationRef: z.string().optional(),
  displayName: z.string().optional(),
  secretRef: z.string().min(1),
  status: z.enum(["pending", "active", "expired", "invalid", "revoked"]).default("pending"),
  scopes: z.array(z.string().min(1)).default([]),
  connectionMetadata: z.record(z.string(), z.unknown()).default({}),
});

export const observationProfileUpdateSchema = z.object({
  displayName: z.string().optional(),
  status: z.enum(["pending", "active", "expired", "invalid", "revoked"]).optional(),
  propertyRef: z.string().optional(),
  organizationRef: z.string().optional(),
  scopes: z.array(z.string().min(1)).optional(),
  connectionMetadata: z.record(z.string(), z.unknown()).optional(),
  secretRef: z.string().min(1).optional(),
});

export const observationProfileValidateSchema = z.object({
  note: z.string().optional(),
});

export const manualObservationIntakeSchema = z.object({
  sourceType: z.enum(["social_api", "site_analytics", "crm", "spreadsheet_import", "csv_upload", "manual_form", "screenshot_review"]),
  providerName: z.enum(["meta", "youtube", "ga4", "linkedin", "crm", "manual", "other"]),
  channel: z.string().min(1),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  observationProfileId: z.string().uuid().optional(),
  records: z.array(observationRecordSchema).min(1),
  notes: z.string().optional(),
});

export const observationSummaryGenerateSchema = z.object({
  windowType: z.enum(["asset", "weekly", "monthly"]),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  assetId: z.string().uuid().optional(),
});

export const observationCollectionTriggerSchema = z.object({
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  mode: z.enum(["incremental", "full", "backfill"]).default("incremental"),
});

export const observationSummaryQuerySchema = z.object({
  windowType: z.enum(["asset", "weekly", "monthly"]),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  assetId: z.string().uuid().optional(),
});

export const observationCollectionRunQuerySchema = z.object({
  profileId: z.string().uuid().optional(),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});
