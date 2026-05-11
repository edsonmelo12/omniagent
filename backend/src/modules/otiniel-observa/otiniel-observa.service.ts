import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import {
  buildObservationCoverageSnapshot,
  buildObservationSummaryDrafts,
} from "./otiniel-observa.analytics.js";
import { getObservationProviderAdapter } from "./otiniel-observa.adapters.js";
import {
  buildObservationReadinessChecklist,
  resolveObservationLifecycleStatus,
} from "./otiniel-observa.lifecycle.js";
import { executeObservationCollection } from "./otiniel-observa.orchestration.js";
import { resolveSecretRef } from "./otiniel-observa.secrets.js";
import {
  createCollectionRunRow,
  createEvidenceSourceRow,
  createNormalizedObservationRecordRow,
  createQualitativeEvidenceRow,
  createRawEvidenceRecordRow,
  createObservationProfileRow,
  listCollectionRunsByClientIdWithFilters,
  listNormalizedObservationRecordsByClientId,
  listCollectionRunsByClientId,
  listObservationProfilesByClientId,
  listObservationSummariesByClientId,
  listObservationSummariesByClientIdWithWindow,
  listQualitativeEvidenceByClientId,
  findCollectionRunById,
  findObservationProfileById,
  upsertObservationSummaryRow,
  updateObservationProfileRow,
  updateCollectionRunRow,
} from "./otiniel-observa.repository.js";

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

export const listObservationProfiles = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profiles = await listObservationProfilesByClientId(input.clientId);

  return { client, profiles };
};

export const createObservationProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  provider: string;
  channel: string;
  profileType: string;
  accountRef: string;
  propertyRef?: string;
  organizationRef?: string;
  displayName?: string;
  secretRef: string;
  status: string;
  scopes: string[];
  connectionMetadata: Record<string, unknown>;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profile = await createObservationProfileRow({
    agencyId: input.agencyId,
    clientId: input.clientId,
    provider: input.provider,
    channel: input.channel,
    profileType: input.profileType,
    accountRef: input.accountRef,
    propertyRef: input.propertyRef ?? null,
    organizationRef: input.organizationRef ?? null,
    displayName: input.displayName ?? null,
    secretRef: input.secretRef,
    status: input.status,
    scopes: input.scopes,
    connectionMetadata: input.connectionMetadata,
  });

  return { client, profile };
};

export const updateObservationProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  profileId: string;
  displayName?: string;
  status?: string;
  propertyRef?: string;
  organizationRef?: string;
  scopes?: string[];
  connectionMetadata?: Record<string, unknown>;
  secretRef?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const existing = await findObservationProfileById(input.profileId);

  if (!existing || existing.client_id !== input.clientId || existing.agency_id !== input.agencyId) {
    throw createError("NOT_FOUND", "Observation profile not found", 404);
  }

  const profile = await updateObservationProfileRow(input.profileId, {
    displayName: input.displayName,
    status: input.status,
    propertyRef: input.propertyRef,
    organizationRef: input.organizationRef,
    scopes: input.scopes,
    connectionMetadata: input.connectionMetadata,
    secretRef: input.secretRef,
  });

  if (!profile) {
    throw createError("NOT_FOUND", "Observation profile not found", 404);
  }

  return { client, profile };
};

export const validateObservationProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  profileId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profile = await findObservationProfileById(input.profileId);

  if (!profile || profile.client_id !== input.clientId || profile.agency_id !== input.agencyId) {
    throw createError("NOT_FOUND", "Observation profile not found", 404);
  }

  const adapter = getObservationProviderAdapter(profile.provider);
  const resolved = await resolveSecretRef(profile.secret_ref);
  const validatedAt = new Date().toISOString();
  const existingConnectionMetadata = asRecord(profile.connection_metadata);

  const adapterValidation = await adapter.validate({
    profile,
    secretResolution: resolved,
    periodStart: validatedAt,
    periodEnd: validatedAt,
    mode: "incremental",
  });

  const lifecycleStatus = resolveObservationLifecycleStatus({
    profile,
    secretResolution: resolved,
    validation: adapterValidation,
    validatedAt,
  });

  const updatedProfile = await updateObservationProfileRow(input.profileId, {
    status: lifecycleStatus.status,
    lastValidatedAt: validatedAt,
    connectionMetadata: {
      ...existingConnectionMetadata,
      lastValidation: {
        status: lifecycleStatus.status,
        validatedAt,
        backend: resolved.backend,
        envKey: resolved.envKey,
        adapter: adapter.provider,
        checks: adapterValidation.checks,
        warnings: adapterValidation.warnings,
        expiresAt: lifecycleStatus.expiresAt,
        reason: lifecycleStatus.reason,
      },
    },
  });

  return {
    client,
    profile: updatedProfile ?? profile,
    validation: {
      status: lifecycleStatus.status,
      validatedAt,
      checks: adapterValidation.checks,
    },
  };
};

export const submitManualObservationIntake = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  sourceType: string;
  providerName: string;
  channel: string;
  periodStart: string;
  periodEnd: string;
  observationProfileId?: string;
  records: Array<{
    assetExternalRef?: string;
    recordType: string;
    metrics: Array<{ name: string; value: number; unit: string }>;
    notes?: string;
  }>;
  notes?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const createdAt = new Date().toISOString();
  const normalizedRecordCount = input.records.reduce((count, record) => count + record.metrics.length, 0);
  const run = await createCollectionRunRow({
    agencyId: input.agencyId,
    clientId: input.clientId,
    observationProfileId: input.observationProfileId ?? null,
    triggerType: "manual",
    runStatus: "completed",
    startedAt: createdAt,
    finishedAt: createdAt,
    recordsReceived: input.records.length,
    recordsNormalized: normalizedRecordCount,
    runMetadata: {
      sourceType: input.sourceType,
      providerName: input.providerName,
      channel: input.channel,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      notes: input.notes ?? null,
    },
  });

  const source = await createEvidenceSourceRow({
    agencyId: input.agencyId,
    clientId: input.clientId,
    observationProfileId: input.observationProfileId ?? null,
    sourceType: input.sourceType,
    providerName: input.providerName,
    accountRef: input.observationProfileId ?? null,
    accessMode: "manual",
    status: "active",
    sourceMetadata: {
      channel: input.channel,
    },
  });

  for (const record of input.records) {
    const rawRecord = await createRawEvidenceRecordRow({
      agencyId: input.agencyId,
      clientId: input.clientId,
      sourceId: source.id,
      observationProfileId: input.observationProfileId ?? null,
      collectionRunId: run.id,
      collectedAt: new Date().toISOString(),
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      recordType: record.recordType,
      assetExternalRef: record.assetExternalRef ?? null,
      payloadRef: `manual:${run.id}:${record.assetExternalRef ?? "record"}`,
      notes: record.notes ?? input.notes ?? null,
    });

    for (const metric of record.metrics) {
      await createNormalizedObservationRecordRow({
        agencyId: input.agencyId,
        clientId: input.clientId,
        observationProfileId: input.observationProfileId ?? null,
        rawEvidenceRecordId: rawRecord.id,
        assetId: null,
        channel: input.channel,
        metricName: metric.name,
        metricValue: metric.value,
        metricUnit: metric.unit,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        evidenceLevel: "manual_confirmed",
        completenessStatus: "complete",
        normalizationMetadata: {
          sourceType: input.sourceType,
          providerName: input.providerName,
        },
      });
    }

    if (record.notes) {
      await createQualitativeEvidenceRow({
        agencyId: input.agencyId,
        clientId: input.clientId,
        observationProfileId: input.observationProfileId ?? null,
        assetId: null,
        channel: input.channel,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        signalType: "manual_note",
        summaryText: record.notes,
        sourceRef: rawRecord.id,
        evidenceLevel: "manual_confirmed",
      });
    }
  }

  const normalizedRecords = await listNormalizedObservationRecordsByClientId(input.clientId, {
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    assetId: null,
  });
  const qualitativeEvidence = await listQualitativeEvidenceByClientId(input.clientId, {
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    assetId: null,
  });
  const summaryDrafts = buildObservationSummaryDrafts({
    windowType: "weekly",
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    assetId: null,
    normalizedRecords,
    qualitativeEvidence,
  });

  for (const draft of summaryDrafts) {
    await upsertObservationSummaryRow({
      agencyId: input.agencyId,
      clientId: input.clientId,
      ...draft,
    });
  }

  await updateCollectionRunRow(run.id, {
    recordsReceived: input.records.length,
    recordsNormalized: normalizedRecordCount,
    runMetadata: {
      sourceType: input.sourceType,
      providerName: input.providerName,
      channel: input.channel,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      notes: input.notes ?? null,
      summaryCount: summaryDrafts.length,
    },
  });

  return {
    client,
    run,
    recordsReceived: input.records.length,
    recordsNormalized: normalizedRecordCount,
    source,
  };
};

export const listObservationSummaries = async (input: {
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

  const summaries = await listObservationSummariesByClientIdWithWindow(input.clientId, {
    windowType: input.windowType,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    assetId: input.assetId ?? null,
  });

  return {
    client,
    summaries,
    requestedWindow: {
      windowType: input.windowType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      assetId: input.assetId ?? null,
    },
  };
};

export const getObservationCoverage = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profiles = await listObservationProfilesByClientId(input.clientId);
  const runs = await listCollectionRunsByClientId(input.clientId);
  const summaries = await listObservationSummariesByClientId(input.clientId);
  const normalizedRecords = await listNormalizedObservationRecordsByClientId(input.clientId, {});
  const qualitativeEvidence = await listQualitativeEvidenceByClientId(input.clientId, {});

  const coverage = buildObservationCoverageSnapshot({
    profiles,
    runs,
    summaries,
    normalizedRecords,
    qualitativeEvidence,
  });

  return {
    client,
    profiles,
    runs,
    summaries,
    coverage,
  };
};

export const getObservationReadinessChecklist = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profiles = await listObservationProfilesByClientId(input.clientId);
  const runs = await listCollectionRunsByClientId(input.clientId);
  const summaries = await listObservationSummariesByClientId(input.clientId);
  const normalizedRecords = await listNormalizedObservationRecordsByClientId(input.clientId, {});
  const qualitativeEvidence = await listQualitativeEvidenceByClientId(input.clientId, {});

  const coverage = buildObservationCoverageSnapshot({
    profiles,
    runs,
    summaries,
    normalizedRecords,
    qualitativeEvidence,
  });

  const checklist = buildObservationReadinessChecklist({
    profiles,
    runs,
    summaries,
    coverage,
  });

  return {
    client,
    checklist,
    ready: checklist.ready,
    summary: checklist.summary,
  };
};

export const listCollectionRuns = async (input: { userId: string; agencyId: string; clientId: string; profileId?: string; status?: string; limit?: number }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const runs = await listCollectionRunsByClientIdWithFilters(input.clientId, {
    profileId: input.profileId,
    status: input.status,
    limit: input.limit,
  });

  return { client, runs };
};

export const getCollectionRunDetails = async (input: { userId: string; agencyId: string; clientId: string; runId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const run = await findCollectionRunById(input.runId);

  if (!run || run.client_id !== input.clientId || run.agency_id !== input.agencyId) {
    throw createError("NOT_FOUND", "Collection run not found", 404);
  }

  return { client, run };
};

export const triggerCollectionRun = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  profileId: string;
  periodStart: string;
  periodEnd: string;
  mode?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profile = await findObservationProfileById(input.profileId);

  if (!profile || profile.client_id !== input.clientId || profile.agency_id !== input.agencyId) {
    throw createError("NOT_FOUND", "Observation profile not found", 404);
  }

  const secret = await resolveSecretRef(profile.secret_ref);
  const adapter = getObservationProviderAdapter(profile.provider);
  const orchestration = await executeObservationCollection({
    agencyId: input.agencyId,
    clientId: input.clientId,
    profile,
    secretResolution: secret,
    adapter,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    mode: (input.mode as "incremental" | "full" | "backfill") ?? "incremental",
  });
  const run = await findCollectionRunById(orchestration.runId);
  const updatedProfile = await findObservationProfileById(profile.id);

  if (!run) {
    throw createError("NOT_FOUND", "Collection run not found", 404);
  }

  return {
    client,
    profile: updatedProfile ?? profile,
    run,
    secretResolved: orchestration.secretResolved,
  };
};
