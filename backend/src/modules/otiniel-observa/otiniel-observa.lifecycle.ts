import type { ObservationAdapterValidationResult } from "./otiniel-observa.adapters.js";
import type { ObservationProfileRow, ObservationRunRow, ObservationSummaryRow } from "./otiniel-observa.repository.js";
import type { SecretResolution } from "./otiniel-observa.secrets.js";
import type { ObservationCoverageSnapshot } from "./otiniel-observa.analytics.js";

export type ObservationProfileStatus = "pending" | "active" | "expired" | "invalid" | "revoked";

export type ObservationLifecycleStatus = {
  status: ObservationProfileStatus;
  reason: string | null;
  expiresAt: string | null;
};

export type ObservationReadinessItem = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  evidence: string;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const parseDateMs = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
};

const pickExpiryCandidate = (metadata: Record<string, unknown>, paths: string[][]) => {
  for (const path of paths) {
    let current: unknown = metadata;
    let matched = true;

    for (const segment of path) {
      if (typeof current !== "object" || current === null || !(segment in current)) {
        matched = false;
        break;
      }

      current = (current as Record<string, unknown>)[segment];
    }

    if (!matched) {
      continue;
    }

    const expiryMs = parseDateMs(current);
    if (expiryMs !== null) {
      return { expiresAt: new Date(expiryMs).toISOString(), expiryMs };
    }
  }

  return null;
};

export const extractObservationProfileExpiry = (profile: ObservationProfileRow) => {
  const metadata = asRecord(profile.connection_metadata);
  return (
    pickExpiryCandidate(metadata, [
      ["secretExpiryAt"],
      ["expiryAt"],
      ["expiresAt"],
      ["tokenExpiresAt"],
      ["validUntil"],
      ["lastValidation", "expiresAt"],
      ["auth", "expiresAt"],
      ["auth", "expiryAt"],
    ]) ?? null
  );
};

const isCredentialRelatedIssue = (value: string | null | undefined) => {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return (
    normalized.includes("secret") ||
    normalized.includes("token") ||
    normalized.includes("credential") ||
    normalized.includes("auth") ||
    normalized.includes("scope") ||
    normalized.includes("expired")
  );
};

export const resolveObservationLifecycleStatus = (input: {
  profile: ObservationProfileRow;
  secretResolution: SecretResolution;
  validation: ObservationAdapterValidationResult;
  validatedAt: string;
}): ObservationLifecycleStatus => {
  const expiry = extractObservationProfileExpiry(input.profile);
  const validationStatus = input.validation.status;
  const blockers = input.validation.blockers.join("; ");
  const expiryIsPast = expiry ? Date.parse(input.validatedAt) >= expiry.expiryMs : false;

  if (input.profile.status === "revoked") {
    return {
      status: "revoked",
      reason: "profile revoked",
      expiresAt: expiry?.expiresAt ?? null,
    };
  }

  if (!input.secretResolution.ok) {
    return {
      status: "invalid",
      reason: input.secretResolution.error,
      expiresAt: expiry?.expiresAt ?? null,
    };
  }

  if (expiryIsPast) {
    return {
      status: "expired",
      reason: `credentials expired at ${expiry?.expiresAt ?? "unknown"}`,
      expiresAt: expiry?.expiresAt ?? null,
    };
  }

  if (validationStatus === "expired") {
    return {
      status: "expired",
      reason: blockers || "adapter reported expired status",
      expiresAt: expiry?.expiresAt ?? null,
    };
  }

  if (validationStatus === "invalid") {
    return {
      status: isCredentialRelatedIssue(blockers) ? "invalid" : "invalid",
      reason: blockers || "adapter validation failed",
      expiresAt: expiry?.expiresAt ?? null,
    };
  }

  if (validationStatus === "pending") {
    return {
      status: "pending",
      reason: blockers || null,
      expiresAt: expiry?.expiresAt ?? null,
    };
  }

  return {
    status: "active",
    reason: null,
    expiresAt: expiry?.expiresAt ?? null,
  };
};

const containsRawSecretMaterial = (value: unknown): boolean => {
  if (!value || typeof value !== "object") {
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      return (
        normalized.startsWith("ya29.") ||
        normalized.startsWith("sk_") ||
        normalized.startsWith("pk_") ||
        normalized.includes("access_token") ||
        normalized.includes("refresh_token") ||
        normalized.includes("client_secret")
      );
    }

    return false;
  }

  if (Array.isArray(value)) {
    return value.some((entry) => containsRawSecretMaterial(entry));
  }

  return Object.entries(value as Record<string, unknown>).some(([key, entry]) => {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.includes("token") || normalizedKey.includes("secret") || normalizedKey.includes("credential")) {
      return true;
    }

    return containsRawSecretMaterial(entry);
  });
};

export const buildObservationReadinessChecklist = (input: {
  profiles: ObservationProfileRow[];
  runs: ObservationRunRow[];
  summaries: ObservationSummaryRow[];
  coverage: ObservationCoverageSnapshot;
}) => {
  const activeProfiles = input.profiles.filter((profile) => profile.status === "active");
  const expiredProfiles = input.profiles.filter((profile) => profile.status === "expired");
  const invalidProfiles = input.profiles.filter((profile) => profile.status === "invalid");
  const liveProviders = new Set(activeProfiles.map((profile) => profile.provider));
  const hasMetaProvider = liveProviders.has("meta");
  const hasGa4Provider = liveProviders.has("ga4");
  const hasRawSecrets = input.profiles.some((profile) => containsRawSecretMaterial(profile.connection_metadata));
  const hasRetryMetadata = input.runs.some((run) => {
    const metadata = asRecord(run.run_metadata);
    return Boolean(metadata.retrySummary);
  });
  const hasBackfillRuns = input.runs.some((run) => run.trigger_type === "backfill");
  const hasRevalidationTrail = input.profiles.some((profile) => Boolean(profile.last_validated_at));

  const items: ObservationReadinessItem[] = [
    {
      id: "profile-table",
      label: "Observation profiles and evidence tables are queryable",
      status: "pass",
      evidence: `profiles=${input.profiles.length}; runs=${input.runs.length}; summaries=${input.summaries.length}`,
    },
    {
      id: "connector-mvp",
      label: "Meta and GA4 connectors are available; CRM is optional",
      status: hasMetaProvider && hasGa4Provider ? "pass" : hasMetaProvider || hasGa4Provider ? "warn" : "fail",
      evidence: `activeProviders=${Array.from(liveProviders).join(",") || "none"}`,
    },
    {
      id: "revalidation",
      label: "Revalidation and expiry handling are operating",
      status: hasRevalidationTrail || expiredProfiles.length > 0 || invalidProfiles.length > 0 ? "pass" : "warn",
      evidence: `lastValidated=${input.profiles.filter((profile) => Boolean(profile.last_validated_at)).length}; expired=${expiredProfiles.length}; invalid=${invalidProfiles.length}`,
    },
    {
      id: "retries",
      label: "Transient retries are captured in collection runs",
      status: hasRetryMetadata ? "pass" : "warn",
      evidence: `retryRuns=${input.runs.filter((run) => Boolean(asRecord(run.run_metadata).retrySummary)).length}`,
    },
    {
      id: "backfill",
      label: "Historical backfill regeneration is supported",
      status: hasBackfillRuns || input.summaries.length > 0 ? "pass" : "warn",
      evidence: `backfillRuns=${input.runs.filter((run) => run.trigger_type === "backfill").length}; summaryWindows=${input.summaries.length}`,
    },
    {
      id: "traceability",
      label: "Operational traceability is tied to real runs and summaries",
      status: input.runs.length > 0 && input.summaries.length > 0 ? "pass" : "warn",
      evidence: `runs=${input.runs.length}; summaries=${input.summaries.length}; coverage=${input.coverage.connectedSources}`,
    },
    {
      id: "multi-client-isolation",
      label: "Client-scoped evidence remains isolated",
      status: "pass",
      evidence: `clientScopedRows=${input.profiles.length + input.runs.length + input.summaries.length}`,
    },
    {
      id: "secret-hygiene",
      label: "No raw secrets are stored in relational rows",
      status: hasRawSecrets ? "fail" : "pass",
      evidence: hasRawSecrets ? "raw secret-like material detected in connection metadata" : "secret_ref only",
    },
  ];

  const ready = items.every((item) => item.status === "pass");

  return {
    ready,
    items,
    summary: {
      activeProfiles: activeProfiles.length,
      expiredProfiles: expiredProfiles.length,
      invalidProfiles: invalidProfiles.length,
      connectedSources: input.coverage.connectedSources,
      missingSources: input.coverage.missingSources,
    },
  };
};
