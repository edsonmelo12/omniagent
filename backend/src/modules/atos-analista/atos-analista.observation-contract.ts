const BLOCKED_FIELD_KEYS = new Set([
  "user_id",
  "user_pseudo_id",
  "session_id",
  "email",
  "phone",
  "name",
  "ip",
  "secret_ref",
  "access_token",
  "refresh_token",
  "client_secret",
  "summary_text",
  "comment_text",
  "dm_text",
  "message_text",
  "summaryPreview",
]);

const MASKED_FIELD_KEYS = new Set(["campaign", "source_medium", "landing_page"]);
const ALLOWED_QUERY_PARAMS = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sanitizeLandingPage = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const allowed = new URLSearchParams();
    for (const [key, paramValue] of parsed.searchParams.entries()) {
      if (ALLOWED_QUERY_PARAMS.has(key)) {
        allowed.set(key, paramValue);
      }
    }

    const query = allowed.toString();
    return `${parsed.origin}${parsed.pathname}${query ? `?${query}` : ""}`;
  } catch {
    const trimmed = value.trim();
    const queryIndex = trimmed.indexOf("?");
    if (queryIndex < 0) {
      return trimmed;
    }
    return trimmed.slice(0, queryIndex);
  }
};

const sanitizeMaskedValue = (key: string, value: unknown) => {
  if (key === "landing_page") {
    return sanitizeLandingPage(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  return value.trim().toLowerCase().replace(/\s+/g, " ");
};

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeValue(entry))
      .filter((entry) => entry !== undefined);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const output: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (BLOCKED_FIELD_KEYS.has(key)) {
      continue;
    }

    if (MASKED_FIELD_KEYS.has(key)) {
      output[key] = sanitizeMaskedValue(key, raw);
      continue;
    }

    output[key] = sanitizeValue(raw);
  }

  return output;
};

const collectForbiddenKeys = (value: unknown, path = ""): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectForbiddenKeys(entry, `${path}[${index}]`));
  }

  if (!isPlainObject(value)) {
    return [];
  }

  const violations: string[] = [];
  for (const [key, current] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (BLOCKED_FIELD_KEYS.has(key)) {
      violations.push(nextPath);
      continue;
    }
    violations.push(...collectForbiddenKeys(current, nextPath));
  }

  return violations;
};

export const sanitizeObservationSummaryForAtos = <T>(summary: T): T => sanitizeValue(summary) as T;

export const assertObservationSummarySafeForAtos = (summary: unknown) => {
  const violations = collectForbiddenKeys(summary);
  if (violations.length > 0) {
    throw new Error(`observation summary contains blocked fields: ${violations.join(", ")}`);
  }
};

