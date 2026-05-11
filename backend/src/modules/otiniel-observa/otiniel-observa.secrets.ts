import { readFile } from "node:fs/promises";

type SecretBackend = "env" | "bridge" | "inline" | "file";

export type SecretResolution =
  | {
      ok: true;
      value: string;
      backend: SecretBackend;
      envKey: string | null;
      maskedReference: string;
    }
  | {
      ok: false;
      error: string;
      errorCode: string;
      backend: SecretBackend;
      envKey: string | null;
      maskedReference: string;
    };

const sanitizeReferenceSegment = (value: string) =>
  value
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

const maskReference = (reference: string) => {
  const trimmed = reference.trim();
  if (!trimmed) return "[empty]";
  if (trimmed.length <= 10) return `${trimmed.slice(0, 4)}…`;
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
};

const readSecretOverrides = () => {
  const raw = process.env.PUBLISHING_SECRET_OVERRIDES_JSON;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const readOverrideSecret = (reference: string) => {
  const overrides = readSecretOverrides();
  const value = overrides?.[reference];

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return null;
};

const buildBridgeEnvKey = (reference: string) => {
  const prefix = (process.env.PUBLISHING_SECRET_ENV_PREFIX ?? "OMNI_SECRET__").trim().toUpperCase();
  const suffix = sanitizeReferenceSegment(reference);
  return `${prefix}${suffix}`;
};

const resolveFilePath = (reference: string) => {
  const trimmed = reference.trim();
  const rawPath = trimmed.slice("file://".length);

  if (!rawPath) {
    return null;
  }

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
};

export const resolveSecretRef = async (secretRef: string): Promise<SecretResolution> => {
  const trimmed = secretRef.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: "secret_ref is empty",
      errorCode: "SECRET_REF_EMPTY",
      backend: "inline",
      envKey: null,
      maskedReference: "[empty]",
    };
  }

  const override = readOverrideSecret(trimmed);
  if (override) {
    return {
      ok: true,
      value: override,
      backend: "inline",
      envKey: null,
      maskedReference: maskReference(trimmed),
    };
  }

  if (trimmed.startsWith("env://")) {
    const envKey = trimmed.slice("env://".length);
    const value = process.env[envKey];

    if (!value) {
      return {
        ok: false,
        error: `environment secret not found: ${envKey}`,
        errorCode: "SECRET_REF_UNRESOLVED",
        backend: "env",
        envKey,
        maskedReference: maskReference(trimmed),
      };
    }

    return {
      ok: true,
      value,
      backend: "env",
      envKey,
      maskedReference: maskReference(trimmed),
    };
  }

  const bridgeEnvKey = buildBridgeEnvKey(trimmed);
  const bridgeValue = process.env[bridgeEnvKey];

  if (bridgeValue) {
    return {
      ok: true,
      value: bridgeValue,
      backend: "bridge",
      envKey: bridgeEnvKey,
      maskedReference: maskReference(trimmed),
    };
  }

  if (trimmed.startsWith("file://")) {
    const filePath = resolveFilePath(trimmed);

    if (!filePath) {
      return {
        ok: false,
        error: "file secret path is empty",
        errorCode: "SECRET_REF_EMPTY",
        backend: "file",
        envKey: null,
        maskedReference: maskReference(trimmed),
      };
    }

    try {
      const value = await readFile(filePath, "utf8");
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return {
          ok: false,
          error: `file secret is empty: ${filePath}`,
          errorCode: "SECRET_REF_UNRESOLVED",
          backend: "file",
          envKey: filePath,
          maskedReference: maskReference(trimmed),
        };
      }

      return {
        ok: true,
        value: trimmedValue,
        backend: "file",
        envKey: filePath,
        maskedReference: maskReference(trimmed),
      };
    } catch {
      return {
        ok: false,
        error: `file secret not found: ${filePath}`,
        errorCode: "SECRET_REF_UNRESOLVED",
        backend: "file",
        envKey: filePath,
        maskedReference: maskReference(trimmed),
      };
    }
  }

  return {
    ok: false,
    error: `environment secret not found: ${bridgeEnvKey}`,
    errorCode: "SECRET_REF_UNRESOLVED",
    backend: "bridge",
    envKey: bridgeEnvKey,
    maskedReference: maskReference(trimmed),
  };
};
