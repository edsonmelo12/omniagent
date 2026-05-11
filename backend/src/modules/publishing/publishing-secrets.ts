import { env } from "../../app/env.js";

type SecretBackend =
  | "env"
  | "aws-sm"
  | "vault"
  | "azure-kv"
  | "gcp-sm"
  | "inline";

export type PublishingSecretPayload = Record<string, unknown>;

export type PublishingSecretResolution = {
  reference: string;
  backend: SecretBackend;
  resolved: boolean;
  envKey: string | null;
  fields: string[];
  secret: PublishingSecretPayload | null;
  errorCode: string | null;
  errorMessage: string | null;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const sanitizeSecretSegment = (value: string) =>
  value
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

const buildBridgeEnvKey = (reference: string) => {
  const prefix = env.PUBLISHING_SECRET_ENV_PREFIX.trim().toUpperCase();
  const suffix = sanitizeSecretSegment(reference);
  return `${prefix}${suffix}`;
};

const parseSecretPayload = (raw: string): PublishingSecretPayload => {
  try {
    const parsed = JSON.parse(raw);
    const record = asRecord(parsed);
    if (record) {
      return record;
    }
  } catch {
    // Fallback handled below.
  }

  return {
    accessToken: raw,
  };
};

const parseBackend = (reference: string): SecretBackend => {
  if (reference.startsWith("env://")) return "env";
  if (reference.startsWith("aws-sm://")) return "aws-sm";
  if (reference.startsWith("vault://")) return "vault";
  if (reference.startsWith("azure-kv://")) return "azure-kv";
  if (reference.startsWith("gcp-sm://")) return "gcp-sm";
  return "inline";
};

const readOverrideSecret = (reference: string) => {
  const mapping = env.PUBLISHING_SECRET_OVERRIDES_JSON;
  if (!mapping) return null;

  try {
    const parsed = JSON.parse(mapping);
    const record = asRecord(parsed);
    const value = record?.[reference];
    return typeof value === "string" && value.trim().length > 0 ? value : null;
  } catch {
    return null;
  }
};

const resolveRawSecretValue = (reference: string, backend: SecretBackend) => {
  const override = readOverrideSecret(reference);
  if (override) {
    return {
      raw: override,
      envKey: null,
    };
  }

  if (backend === "env") {
    const envKey = reference.replace(/^env:\/\//i, "").trim();
    return {
      raw: process.env[envKey] ?? null,
      envKey,
    };
  }

  const envKey = buildBridgeEnvKey(reference);
  return {
    raw: process.env[envKey] ?? null,
    envKey,
  };
};

export const getSecretString = (secret: PublishingSecretPayload | null, keys: string[]) => {
  if (!secret) return null;

  for (const key of keys) {
    const value = secret[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

export const resolvePublishingSecret = (reference: string): PublishingSecretResolution => {
  const normalizedReference = reference.trim();
  const backend = parseBackend(normalizedReference);
  const { raw, envKey } = resolveRawSecretValue(normalizedReference, backend);

  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      reference: normalizedReference,
      backend,
      resolved: false,
      envKey,
      fields: [],
      secret: null,
      errorCode: "SECRET_UNRESOLVED",
      errorMessage: "Secret reference could not be resolved in the runtime environment.",
    };
  }

  const secret = parseSecretPayload(raw.trim());

  return {
    reference: normalizedReference,
    backend,
    resolved: true,
    envKey,
    fields: Object.keys(secret),
    secret,
    errorCode: null,
    errorMessage: null,
  };
};
