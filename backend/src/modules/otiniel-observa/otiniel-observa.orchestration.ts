import {
  buildObservationSummaryDrafts,
} from "./otiniel-observa.analytics.js";
import type { ObservationProfileRow } from "./otiniel-observa.repository.js";
import {
  createCollectionRunRow,
  createEvidenceSourceRow,
  createNormalizedObservationRecordRow,
  createQualitativeEvidenceRow,
  createRawEvidenceRecordRow,
  listNormalizedObservationRecordsByClientId,
  listQualitativeEvidenceByClientId,
  upsertObservationSummaryRow,
  updateCollectionRunRow,
  updateObservationProfileRow,
} from "./otiniel-observa.repository.js";
import type { ObservationAdapterCollectionResult, ObservationAdapterValidationResult, ObservationProviderAdapter } from "./otiniel-observa.adapters.js";
import type { SecretResolution } from "./otiniel-observa.secrets.js";

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const TRANSIENT_ERROR_CODES = new Set([
  "429",
  "503",
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ECONNABORTED",
  "EAI_AGAIN",
  "ETEMPORARY",
  "TEMPORARY_FAILURE",
  "RATE_LIMITED",
  "REQUEST_TIMEOUT",
  "TIMEOUT",
  "TIMEOUT_ERROR",
]);

const isCredentialFailure = (value: string | null | undefined) => {
  if (!value) {
    return false;
  }

  const normalized = value.toUpperCase();
  return normalized.includes("SECRET") || normalized.includes("TOKEN") || normalized.includes("CREDENTIAL");
};

export const isTransientObservationError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as Record<string, unknown>;
  const code = typeof record.code === "string" ? record.code.toUpperCase() : "";
  const statusCode = typeof record.statusCode === "number" ? record.statusCode : null;
  const message = typeof record.message === "string" ? record.message.toLowerCase() : "";

  if (record.retryable === true || record.transient === true) {
    return true;
  }

  if (statusCode !== null && (statusCode === 429 || statusCode >= 500)) {
    return true;
  }

  if (TRANSIENT_ERROR_CODES.has(code)) {
    return true;
  }

  return [
    "rate limit",
    "too many requests",
    "temporarily unavailable",
    "try again",
    "timeout",
    "timed out",
    "network error",
    "service unavailable",
    "connection reset",
  ].some((fragment) => message.includes(fragment));
};

const describeObservationError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: typeof (error as Error & { code?: unknown }).code === "string" ? (error as Error & { code?: string }).code ?? "UNKNOWN" : "UNKNOWN",
    };
  }

  if (typeof error === "string") {
    return { message: error, code: "UNKNOWN" };
  }

  return { message: "unknown error", code: "UNKNOWN" };
};

type ObservationRetryResult<T> = {
  value: T;
  attempts: number;
  failures: Array<{
    attempt: number;
    code: string;
    message: string;
    retryable: boolean;
  }>;
};

type ObservationRetrySummary = {
  attempts: number;
  failures: ObservationRetryResult<unknown>["failures"];
};

const getRetrySummary = (value: unknown): ObservationRetrySummary | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (!record.retrySummary || typeof record.retrySummary !== "object") {
    return null;
  }

  const summary = record.retrySummary as Record<string, unknown>;
  const attempts = typeof summary.attempts === "number" ? summary.attempts : 0;
  const failures = Array.isArray(summary.failures) ? (summary.failures as ObservationRetrySummary["failures"]) : [];

  return { attempts, failures };
};

export const runWithTransientRetries = async <T>(
  operation: () => Promise<T>,
  options?: {
    attempts?: number;
    baseDelayMs?: number;
    label?: string;
  },
): Promise<ObservationRetryResult<T>> => {
  const attempts = options?.attempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 150;
  const failures: ObservationRetryResult<T>["failures"] = [];
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const value = await operation();
      return { value, attempts: attempt, failures };
    } catch (error) {
      lastError = error;
      const retryable = isTransientObservationError(error);
      const described = describeObservationError(error);
      failures.push({
        attempt,
        code: described.code,
        message: described.message,
        retryable,
      });

      if (!retryable || attempt === attempts) {
        if (error && typeof error === "object") {
          (error as Record<string, unknown>).retrySummary = {
            attempts,
            failures,
          };
        }
        throw error;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, baseDelayMs * attempt);
      });
    }
  }

  throw lastError ?? new Error(options?.label ?? "transient operation failed");
};

const deriveSourceType = (profile: ObservationProfileRow) => {
  const channel = profile.channel.trim().toLowerCase();
  const provider = profile.provider.trim().toLowerCase();

  if (provider === "crm" || channel.includes("crm") || channel.includes("business")) {
    return "crm";
  }

  if (provider === "ga4" || channel.includes("site") || channel.includes("analytics") || channel.includes("web")) {
    return "site_analytics";
  }

  if (provider === "manual" || channel.includes("manual") || channel.includes("qual")) {
    return "manual_form";
  }

  if (channel.includes("csv") || channel.includes("spreadsheet")) {
    return "csv_upload";
  }

  if (channel.includes("screenshot")) {
    return "screenshot_review";
  }

  return "social_api";
};

export type ObservationCollectionOrchestrationInput = {
  agencyId: string;
  clientId: string;
  profile: ObservationProfileRow;
  secretResolution: SecretResolution;
  adapter: ObservationProviderAdapter;
  periodStart: string;
  periodEnd: string;
  mode: "incremental" | "full" | "backfill";
};

export type ObservationCollectionOrchestrationResult = {
  runId: string;
  sourceId: string | null;
  bundleCount: number;
  recordCount: number;
  normalizedRecordCount: number;
  qualitativeCount: number;
  summaryCount: number;
  validation: ObservationAdapterValidationResult;
  collection: ObservationAdapterCollectionResult | null;
  secretResolved: boolean;
};

const persistCollectionBundles = async (input: {
  agencyId: string;
  clientId: string;
  profileId: string;
  sourceId: string;
  runId: string;
  periodStart: string;
  periodEnd: string;
  bundles: ObservationAdapterCollectionResult["bundles"];
}) => {
  let rawCount = 0;
  let normalizedCount = 0;
  let qualitativeCount = 0;

  for (const bundle of input.bundles) {
    const rawRecord = await createRawEvidenceRecordRow({
      agencyId: input.agencyId,
      clientId: input.clientId,
      sourceId: input.sourceId,
      observationProfileId: input.profileId,
      collectionRunId: input.runId,
      collectedAt: bundle.rawEvidence.collectedAt ?? new Date().toISOString(),
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      recordType: bundle.rawEvidence.recordType,
      assetExternalRef: bundle.rawEvidence.assetExternalRef ?? null,
      payloadRef: bundle.rawEvidence.payloadRef ?? bundle.ref,
      payloadHash: bundle.rawEvidence.payloadHash ?? null,
      notes: bundle.rawEvidence.notes ?? null,
    });

    rawCount += 1;

    for (const normalizedRecord of bundle.normalizedRecords) {
      await createNormalizedObservationRecordRow({
        agencyId: input.agencyId,
        clientId: input.clientId,
        observationProfileId: input.profileId,
        rawEvidenceRecordId: rawRecord.id,
        assetId: normalizedRecord.assetId ?? null,
        channel: normalizedRecord.channel,
        metricName: normalizedRecord.metricName,
        metricValue: normalizedRecord.metricValue,
        metricUnit: normalizedRecord.metricUnit,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        evidenceLevel: normalizedRecord.evidenceLevel,
        completenessStatus: normalizedRecord.completenessStatus,
        normalizationMetadata: normalizedRecord.normalizationMetadata ?? {},
      });
      normalizedCount += 1;
    }

    for (const qualitativeRecord of bundle.qualitativeEvidence) {
      await createQualitativeEvidenceRow({
        agencyId: input.agencyId,
        clientId: input.clientId,
        observationProfileId: input.profileId,
        assetId: qualitativeRecord.assetId ?? null,
        channel: qualitativeRecord.channel,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        signalType: qualitativeRecord.signalType,
        summaryText: qualitativeRecord.summaryText,
        sourceRef: rawRecord.id,
        evidenceLevel: qualitativeRecord.evidenceLevel,
      });
      qualitativeCount += 1;
    }
  }

  return {
    rawCount,
    normalizedCount,
    qualitativeCount,
  };
};

const buildRetryMetadata = <T>(result: ObservationRetryResult<T> | null) =>
  result
    ? {
        attempts: result.attempts,
        failures: result.failures,
      }
    : {
        attempts: 0,
        failures: [],
      };

export const executeObservationCollection = async (input: ObservationCollectionOrchestrationInput) => {
  const startedAt = new Date().toISOString();
  const run = await createCollectionRunRow({
    agencyId: input.agencyId,
    clientId: input.clientId,
    observationProfileId: input.profile.id,
    triggerType: "connector",
    runStatus: "running",
    startedAt,
    recordsReceived: 0,
    recordsNormalized: 0,
    runMetadata: {
      adapter: input.adapter.provider,
      mode: input.mode,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      stage: "started",
    },
  });

  let validationAttempt: ObservationRetryResult<ObservationAdapterValidationResult> | null = null;
  let validation: ObservationAdapterValidationResult;
  try {
    validationAttempt = await runWithTransientRetries(
      () =>
        input.adapter.validate({
          profile: input.profile,
          secretResolution: input.secretResolution,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          mode: input.mode,
        }),
      { label: "validation" },
    );
    validation = validationAttempt.value;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const retryable = isTransientObservationError(error);
    const described = describeObservationError(error);
    const retrySummary = getRetrySummary(error);
    await updateCollectionRunRow(run.id, {
      runStatus: "failed",
      finishedAt,
      errorCode: retryable ? "ADAPTER_VALIDATION_TRANSIENT_FAILURE" : "ADAPTER_VALIDATION_FAILED",
      errorMessage: described.message,
      runMetadata: {
        adapter: input.adapter.provider,
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        stage: retryable ? "validation_transient_failed" : "validation_failed",
        validationError: described,
        retryable,
        retrySummary: retrySummary ?? buildRetryMetadata(validationAttempt),
      },
    });

    if (!input.secretResolution.ok || isCredentialFailure(described.message)) {
      await updateObservationProfileRow(input.profile.id, {
        status: "invalid",
        lastValidatedAt: finishedAt,
        connectionMetadata: {
          ...asRecord(input.profile.connection_metadata),
          lastValidation: {
            status: "invalid",
            validatedAt: finishedAt,
            errorCode: input.secretResolution.ok ? "ADAPTER_VALIDATION_FAILED" : "SECRET_REF_UNRESOLVED",
            errorMessage: described.message,
            adapter: input.adapter.provider,
            retryable,
          },
        },
      });
    }

    return {
      runId: run.id,
      sourceId: null,
      bundleCount: 0,
      recordCount: 0,
      normalizedRecordCount: 0,
      qualitativeCount: 0,
      summaryCount: 0,
      validation: {
        status: "invalid",
        checks: [],
        warnings: [],
        blockers: [described.message],
        accountMetadata: input.adapter.mapAccountMetadata({
          profile: input.profile,
          secretResolution: input.secretResolution,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          mode: input.mode,
        }),
      },
      collection: null,
      secretResolved: input.secretResolution.ok,
    };
  }

  const sourceMetadata = {
    ...input.adapter.mapAccountMetadata({
      profile: input.profile,
      secretResolution: input.secretResolution,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      mode: input.mode,
    }),
    validationStatus: validation.status,
    validationWarnings: validation.warnings,
    validationRetrySummary: buildRetryMetadata(validationAttempt),
  };

  const source = await createEvidenceSourceRow({
    agencyId: input.agencyId,
    clientId: input.clientId,
    observationProfileId: input.profile.id,
    sourceType: deriveSourceType(input.profile),
    providerName: input.profile.provider,
    accountRef: input.profile.account_ref,
    accessMode: input.secretResolution.backend === "env" ? "service_account" : "oauth",
    status: validation.status === "active" ? "active" : "inactive",
    sourceMetadata,
  });

  if (validation.blockers.length > 0) {
    const finishedAt = new Date().toISOString();
    await updateCollectionRunRow(run.id, {
      runStatus: "failed",
      finishedAt,
      errorCode: input.secretResolution.ok ? "ADAPTER_VALIDATION_FAILED" : "SECRET_REF_UNRESOLVED",
      errorMessage: validation.blockers.join("; "),
      runMetadata: {
        adapter: input.adapter.provider,
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        stage: "validation_failed",
        validation,
      },
    });

    if (!input.secretResolution.ok || isCredentialFailure(validation.blockers.join("; "))) {
      await updateObservationProfileRow(input.profile.id, {
        status: "invalid",
        lastValidatedAt: finishedAt,
        connectionMetadata: {
          ...asRecord(input.profile.connection_metadata),
          lastValidation: {
            status: "invalid",
            validatedAt: finishedAt,
            errorCode: input.secretResolution.ok ? "ADAPTER_VALIDATION_FAILED" : "SECRET_REF_UNRESOLVED",
            errorMessage: validation.blockers.join("; "),
            adapter: input.adapter.provider,
          },
        },
      });
    }

    return {
      runId: run.id,
      sourceId: source.id,
      bundleCount: 0,
      recordCount: 0,
      normalizedRecordCount: 0,
      qualitativeCount: 0,
      summaryCount: 0,
      validation,
      collection: null,
      secretResolved: input.secretResolution.ok,
    };
  }

  let collectionAttempt: ObservationRetryResult<ObservationAdapterCollectionResult> | null = null;
  let collection: ObservationAdapterCollectionResult;
  try {
    collectionAttempt = await runWithTransientRetries(
      () =>
        input.adapter.collect({
          profile: input.profile,
          secretResolution: input.secretResolution,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          mode: input.mode,
        }),
      { label: "collection" },
    );
    collection = collectionAttempt.value;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const retryable = isTransientObservationError(error);
    const described = describeObservationError(error);
    const retrySummary = getRetrySummary(error);
    await updateCollectionRunRow(run.id, {
      runStatus: "failed",
      finishedAt,
      errorCode: retryable ? "ADAPTER_COLLECTION_TRANSIENT_FAILURE" : "ADAPTER_COLLECTION_FAILED",
      errorMessage: described.message,
      runMetadata: {
        adapter: input.adapter.provider,
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        stage: retryable ? "collection_transient_failed" : "collection_failed",
        collectionError: described,
        retryable,
        retrySummary: retrySummary ?? buildRetryMetadata(collectionAttempt),
      },
    });

    return {
      runId: run.id,
      sourceId: source.id,
      bundleCount: 0,
      recordCount: 0,
      normalizedRecordCount: 0,
      qualitativeCount: 0,
      summaryCount: 0,
      validation,
      collection: null,
      secretResolved: input.secretResolution.ok,
    };
  }

  const collectionBlockers = [...collection.blockers];
  if (collectionBlockers.length > 0) {
    const finishedAt = new Date().toISOString();
    await updateCollectionRunRow(run.id, {
      runStatus: "failed",
      finishedAt,
      errorCode: "ADAPTER_COLLECTION_BLOCKED",
      errorMessage: collectionBlockers.join("; "),
      runMetadata: {
        adapter: input.adapter.provider,
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        stage: "collection_blocked",
        validation,
        collection,
        retrySummary: {
          validation: buildRetryMetadata(validationAttempt),
          collection: buildRetryMetadata(collectionAttempt),
        },
      },
    });
    return {
      runId: run.id,
      sourceId: source.id,
      bundleCount: 0,
      recordCount: 0,
      normalizedRecordCount: 0,
      qualitativeCount: 0,
      summaryCount: 0,
      validation,
      collection,
      secretResolved: input.secretResolution.ok,
    };
  }

  const persisted = await persistCollectionBundles({
    agencyId: input.agencyId,
    clientId: input.clientId,
    profileId: input.profile.id,
    sourceId: source.id,
    runId: run.id,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    bundles: collection.bundles,
  });

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

  const finishedAt = new Date().toISOString();
  await updateCollectionRunRow(run.id, {
    runStatus: "completed",
    finishedAt,
    recordsReceived: persisted.rawCount,
    recordsNormalized: persisted.normalizedCount,
    runMetadata: {
      adapter: input.adapter.provider,
      mode: input.mode,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      stage: "completed",
      validation,
      collection,
      retrySummary: {
        validation: buildRetryMetadata(validationAttempt),
        collection: buildRetryMetadata(collectionAttempt),
      },
      summaryCount: summaryDrafts.length,
    },
  });

  await updateObservationProfileRow(input.profile.id, {
    status: input.profile.status === "revoked" ? input.profile.status : validation.status,
      lastCollectedAt: finishedAt,
      lastValidatedAt: finishedAt,
      connectionMetadata: {
        ...asRecord(input.profile.connection_metadata),
        lastValidation: {
          status: validation.status,
          validatedAt: finishedAt,
          adapter: input.adapter.provider,
          retrySummary: buildRetryMetadata(validationAttempt),
        },
        lastCollection: {
          status: "completed",
          collectedAt: finishedAt,
          adapter: input.adapter.provider,
          bundleCount: collection.bundles.length,
          retrySummary: buildRetryMetadata(collectionAttempt),
        },
      },
    });

  return {
    runId: run.id,
    sourceId: source.id,
    bundleCount: collection.bundles.length,
    recordCount: persisted.rawCount,
    normalizedRecordCount: persisted.normalizedCount,
    qualitativeCount: persisted.qualitativeCount,
    summaryCount: summaryDrafts.length,
    validation,
    collection,
    secretResolved: input.secretResolution.ok,
  };
};
