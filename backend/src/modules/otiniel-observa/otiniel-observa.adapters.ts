import type { ObservationProfileRow } from "./otiniel-observa.repository.js";
import type { SecretResolution } from "./otiniel-observa.secrets.js";
import { createSign } from "node:crypto";

export type ObservationAdapterCheck = {
  name: string;
  status: "ok" | "error" | "warn";
  reason?: string;
};

export type ObservationAdapterValidationResult = {
  status: "active" | "invalid" | "expired" | "pending";
  checks: ObservationAdapterCheck[];
  warnings: string[];
  blockers: string[];
  accountMetadata: Record<string, unknown>;
};

export type ObservationAdapterBundle = {
  ref: string;
  rawEvidence: {
    recordType: string;
    assetExternalRef?: string | null;
    payloadRef?: string | null;
    payloadHash?: string | null;
    notes?: string | null;
    collectedAt?: string | null;
  };
  normalizedRecords: Array<{
    assetId?: string | null;
    channel: string;
    metricName: string;
    metricValue: number;
    metricUnit: string;
    evidenceLevel: "public_only" | "authorized_export" | "direct_api" | "manual_confirmed" | "derived";
    completenessStatus: "complete" | "partial" | "minimal" | "missing";
    notes?: string | null;
    normalizationMetadata?: Record<string, unknown>;
  }>;
  qualitativeEvidence: Array<{
    assetId?: string | null;
    channel: string;
    signalType: string;
    summaryText: string;
    evidenceLevel: "public_only" | "authorized_export" | "direct_api" | "manual_confirmed" | "derived";
  }>;
};

export type ObservationAdapterCollectionResult = {
  warnings: string[];
  blockers: string[];
  accountMetadata: Record<string, unknown>;
  sourceMetadata: Record<string, unknown>;
  bundles: ObservationAdapterBundle[];
  runMetadata: Record<string, unknown>;
};

export type ObservationAdapterContext = {
  profile: ObservationProfileRow;
  secretResolution: SecretResolution;
  periodStart: string;
  periodEnd: string;
  mode: "incremental" | "full" | "backfill";
};

export type ObservationProviderAdapter = {
  provider: string;
  validate(input: ObservationAdapterContext): Promise<ObservationAdapterValidationResult>;
  collect(input: ObservationAdapterContext): Promise<ObservationAdapterCollectionResult>;
  mapAccountMetadata(input: ObservationAdapterContext): Record<string, unknown>;
};

const safeRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const asNumber = (value: unknown, fallback = 0) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
const asBoolean = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

const parseJsonObject = (value: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

const normalizeIsoDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const stripMetaUrlDecorators = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.replace(/^https?:\/\/(www\.)?facebook\.com\//i, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
};

const normalizeMetaAccountTarget = (accountRef: string) => {
  const trimmed = accountRef.trim();
  if (!trimmed) {
    return "";
  }

  return stripMetaUrlDecorators(trimmed).split(/[/?#]/)[0] ?? trimmed;
};

const fetchJson = async (url: string, init: RequestInit = {}): Promise<unknown> => {
  const response = await fetch(url, init);
  const text = await response.text();
  let payload: unknown = null;

  if (text.trim().length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response (${response.status}) from ${url}`);
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? JSON.stringify(payload).slice(0, 250)
        : `${response.status} ${response.statusText}`;
    throw new Error(`Request failed (${response.status}) ${message}`);
  }

  return payload;
};

const sumMetaInsightValues = (record: Record<string, unknown>): number | null => {
  const values = Array.isArray(record.values) ? record.values : [];
  if (values.length === 0) {
    return null;
  }

  let total = 0;
  let found = false;

  for (const item of values) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const value = (item as Record<string, unknown>).value;
    if (typeof value === "number" && Number.isFinite(value)) {
      total += value;
      found = true;
    }
  }

  return found ? total : null;
};

const getMetaMetric = (
  byMetricName: Record<string, Record<string, unknown>>,
  metric: string,
  fallback: number,
) => {
  const record = byMetricName[metric];
  if (!record) {
    return fallback;
  }

  const value = sumMetaInsightValues(record);
  return value ?? fallback;
};

const asBundle = (input: unknown, fallbackRef: string): ObservationAdapterBundle | null => {
  const record = safeRecord(input);
  const rawEvidence = safeRecord(record.rawEvidence);
  const normalizedRecords = Array.isArray(record.normalizedRecords) ? record.normalizedRecords : [];
  const qualitativeEvidence = Array.isArray(record.qualitativeEvidence) ? record.qualitativeEvidence : [];

  const recordType = asString(rawEvidence.recordType, "manual");
  const bundleRef = asString(record.ref, fallbackRef) || fallbackRef;

  return {
    ref: bundleRef,
    rawEvidence: {
      recordType,
      assetExternalRef: typeof rawEvidence.assetExternalRef === "string" ? rawEvidence.assetExternalRef : null,
      payloadRef: typeof rawEvidence.payloadRef === "string" ? rawEvidence.payloadRef : bundleRef,
      payloadHash: typeof rawEvidence.payloadHash === "string" ? rawEvidence.payloadHash : null,
      notes: typeof rawEvidence.notes === "string" ? rawEvidence.notes : null,
      collectedAt: typeof rawEvidence.collectedAt === "string" ? rawEvidence.collectedAt : null,
    },
    normalizedRecords: normalizedRecords.map((value) => {
      const item = safeRecord(value);
      return {
        assetId: typeof item.assetId === "string" ? item.assetId : null,
        channel: asString(item.channel, ""),
        metricName: asString(item.metricName, ""),
        metricValue: asNumber(item.metricValue, 0),
        metricUnit: asString(item.metricUnit, "count"),
        evidenceLevel: (asString(item.evidenceLevel, "derived") as ObservationAdapterBundle["normalizedRecords"][number]["evidenceLevel"]) ?? "derived",
        completenessStatus: (asString(item.completenessStatus, "partial") as ObservationAdapterBundle["normalizedRecords"][number]["completenessStatus"]) ?? "partial",
        notes: typeof item.notes === "string" ? item.notes : null,
        normalizationMetadata: safeRecord(item.normalizationMetadata),
      };
    }),
    qualitativeEvidence: qualitativeEvidence.map((value) => {
      const item = safeRecord(value);
      return {
        assetId: typeof item.assetId === "string" ? item.assetId : null,
        channel: asString(item.channel, ""),
        signalType: asString(item.signalType, "note"),
        summaryText: asString(item.summaryText, ""),
        evidenceLevel: (asString(item.evidenceLevel, "derived") as ObservationAdapterBundle["qualitativeEvidence"][number]["evidenceLevel"]) ?? "derived",
      };
    }),
  };
};

const extractBundles = (metadata: Record<string, unknown>): ObservationAdapterBundle[] => {
  const collection = safeRecord(metadata.mockCollection);
  const bundles = Array.isArray(collection.bundles) ? collection.bundles : [];

  if (bundles.length > 0) {
    return bundles
      .map((bundle, index) => asBundle(bundle, `bundle-${index + 1}`))
      .filter((bundle): bundle is ObservationAdapterBundle => bundle !== null);
  }

  const mockRecords = Array.isArray(collection.records) ? collection.records : [];
  if (mockRecords.length > 0) {
    return mockRecords
      .map((record, index) => asBundle(record, `record-${index + 1}`))
      .filter((bundle): bundle is ObservationAdapterBundle => bundle !== null);
  }

  return [];
};

const buildAccountMetadata = (input: ObservationAdapterContext) => {
  const metadata = safeRecord(input.profile.connection_metadata);

  return {
    provider: input.profile.provider,
    channel: input.profile.channel,
    accountRef: input.profile.account_ref,
    propertyRef: input.profile.property_ref,
    organizationRef: input.profile.organization_ref,
    displayName: input.profile.display_name,
    secretBackend: input.secretResolution.backend,
    secretEnvKey: input.secretResolution.envKey,
    secretReference: input.secretResolution.maskedReference,
    ...safeRecord(metadata.accountMetadata),
  };
};

const buildMetaBundles = (input: ObservationAdapterContext) => {
  const metadata = safeRecord(input.profile.connection_metadata);
  const metaSignals = safeRecord(metadata.metaSignals);
  const bundleRef = `meta-${input.profile.id}-${input.periodStart}`;
  const metrics = [
    ["impressions", "impressions"],
    ["reach", "reach"],
    ["saves", "saves"],
    ["shares", "shares"],
    ["comments", "comments"],
    ["profileVisits", "profile_visits"],
    ["linkClicks", "link_clicks"],
  ] as const;

  const normalizedRecords = metrics
    .map(([sourceKey, metricName]) => {
      const value = metaSignals[sourceKey];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
      }

      return {
        assetId: typeof metaSignals.assetId === "string" ? metaSignals.assetId : null,
        channel: input.profile.channel,
        metricName,
        metricValue: value,
        metricUnit: "count",
        evidenceLevel: "direct_api" as const,
        completenessStatus: "complete" as const,
        notes: typeof metaSignals.notes === "string" ? metaSignals.notes : null,
        normalizationMetadata: {
          provider: "meta",
          sourceKey,
          sourceLabel: typeof metaSignals.sourceLabel === "string" ? metaSignals.sourceLabel : "metaSignals",
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const qualitativeEvidence = typeof metaSignals.notes === "string" && metaSignals.notes.trim().length > 0
    ? [
        {
          assetId: typeof metaSignals.assetId === "string" ? metaSignals.assetId : null,
          channel: input.profile.channel,
          signalType: "meta_note",
          summaryText: metaSignals.notes.trim(),
          evidenceLevel: "manual_confirmed" as const,
        },
      ]
    : [];

  return [
    {
      ref: bundleRef,
      rawEvidence: {
        recordType: "meta_graph_api",
        assetExternalRef: typeof metaSignals.assetId === "string" ? metaSignals.assetId : null,
        payloadRef: `meta://${input.profile.account_ref}/${input.periodStart}`,
        payloadHash: typeof metaSignals.payloadHash === "string" ? metaSignals.payloadHash : null,
        notes: typeof metaSignals.notes === "string" ? metaSignals.notes : null,
        collectedAt: typeof metaSignals.collectedAt === "string" ? metaSignals.collectedAt : new Date().toISOString(),
      },
      normalizedRecords,
      qualitativeEvidence,
    },
  ];
};

const collectMetaLiveBundle = async (
  input: ObservationAdapterContext,
): Promise<{ bundle: ObservationAdapterBundle; sourceLabel: string; appContext: string }> => {
  if (!input.secretResolution.ok) {
    throw new Error("meta secret is unresolved");
  }

  const metadata = safeRecord(input.profile.connection_metadata);
  const metaSettings = safeRecord(metadata.metaSettings);
  const tokenPayload = parseJsonObject(input.secretResolution.value);
  const accessToken =
    typeof tokenPayload?.access_token === "string" && tokenPayload.access_token.trim().length > 0
      ? tokenPayload.access_token.trim()
      : input.secretResolution.value.trim();

  if (!accessToken) {
    throw new Error("meta access token is empty");
  }

  const channel = input.profile.channel.trim().toLowerCase();
  const accountRef = normalizeMetaAccountTarget(input.profile.account_ref);
  if (!accountRef) {
    throw new Error("meta account_ref is empty");
  }

  const since = normalizeIsoDate(input.periodStart);
  const until = normalizeIsoDate(input.periodEnd);
  if (!since || !until) {
    throw new Error("invalid period dates for meta collection");
  }

  const collectedAt = new Date().toISOString();
  const apiVersion = typeof metaSettings.apiVersion === "string" ? metaSettings.apiVersion : "v22.0";
  const bundleRef = `meta-live-${input.profile.id}-${since}`;

  if (channel === "facebook") {
    const pageUrl = new URL(`https://graph.facebook.com/${apiVersion}/${accountRef}`);
    pageUrl.searchParams.set("fields", "id,name,username,link,fan_count,followers_count");
    pageUrl.searchParams.set("access_token", accessToken);

    const response = await fetchJson(pageUrl.toString());
    const page = safeRecord(response);
    const followers = asNumber(page.followers_count, asNumber(page.fan_count, 0));
    const fans = asNumber(page.fan_count, followers);

    return {
      bundle: {
        ref: bundleRef,
        rawEvidence: {
          recordType: "meta_graph_live_page",
          assetExternalRef: typeof page.id === "string" ? page.id : accountRef,
          payloadRef: `meta-live://facebook/${accountRef}/${since}_${until}`,
          payloadHash: null,
          notes: "Collected via Meta Graph API page lookup in live mode.",
          collectedAt,
        },
        normalizedRecords: [
          {
            assetId: null,
            channel: input.profile.channel,
            metricName: "followers",
            metricValue: followers,
            metricUnit: "count",
            evidenceLevel: "direct_api",
            completenessStatus: "complete",
            notes: "Live page lookup",
            normalizationMetadata: { provider: "meta", sourceKey: "followers_count", sourceLabel: "live_api" },
          },
          {
            assetId: null,
            channel: input.profile.channel,
            metricName: "fans",
            metricValue: fans,
            metricUnit: "count",
            evidenceLevel: "direct_api",
            completenessStatus: "complete",
            notes: "Live page lookup",
            normalizationMetadata: { provider: "meta", sourceKey: "fan_count", sourceLabel: "live_api" },
          },
        ],
        qualitativeEvidence: [
          {
            assetId: null,
            channel: input.profile.channel,
            signalType: "facebook_page",
            summaryText: `Page ${asString(page.name, accountRef)} | username=${asString(page.username, accountRef)}`,
            evidenceLevel: "direct_api",
          },
        ],
      },
      sourceLabel: "live_api",
      appContext: "meta-graph-page-live",
    };
  }

  const byMetricName: Record<string, Record<string, unknown>> = {};
  const requests = [
    {
      metrics: ["reach"],
      extra: {} as Record<string, string>,
    },
    {
      metrics: ["saves", "shares", "comments", "profile_views", "website_clicks", "total_interactions"],
      extra: { metric_type: "total_value" },
    },
  ];

  for (const request of requests) {
    const url = new URL(`https://graph.facebook.com/${apiVersion}/${accountRef}/insights`);
    url.searchParams.set("metric", request.metrics.join(","));
    url.searchParams.set("period", "day");
    url.searchParams.set("since", since);
    url.searchParams.set("until", until);
    url.searchParams.set("access_token", accessToken);
    for (const [key, value] of Object.entries(request.extra)) {
      url.searchParams.set(key, value);
    }

    const response = await fetchJson(url.toString());
    const payload = safeRecord(response);
    const data = Array.isArray(payload.data) ? payload.data : [];

    for (const item of data) {
      if (typeof item !== "object" || item === null) {
        continue;
      }

      const record = item as Record<string, unknown>;
      const metricName = typeof record.name === "string" ? record.name : null;
      if (metricName) {
        byMetricName[metricName] = record;
      }
    }
  }

  const reach = getMetaMetric(byMetricName, "reach", 0);
  const signals = {
    impressions: reach,
    reach,
    saves: getMetaMetric(byMetricName, "saves", 0),
    shares: getMetaMetric(byMetricName, "shares", 0),
    comments: getMetaMetric(byMetricName, "comments", 0),
    profileVisits: getMetaMetric(byMetricName, "profile_views", 0),
    linkClicks: getMetaMetric(byMetricName, "website_clicks", 0),
  };

  return {
    bundle: {
      ref: bundleRef,
      rawEvidence: {
        recordType: "meta_graph_live",
        assetExternalRef: null,
        payloadRef: `meta-live://${accountRef}/${since}_${until}`,
        payloadHash: null,
        notes: "Collected via Meta Graph API in live mode.",
        collectedAt,
      },
      normalizedRecords: [
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "impressions",
          metricValue: signals.impressions,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "meta", sourceKey: "reach_proxy", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "reach",
          metricValue: signals.reach,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "meta", sourceKey: "reach", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "saves",
          metricValue: signals.saves,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "meta", sourceKey: "saved", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "shares",
          metricValue: signals.shares,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "meta", sourceKey: "shares", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "comments",
          metricValue: signals.comments,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "meta", sourceKey: "comments", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "profile_visits",
          metricValue: signals.profileVisits,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "meta", sourceKey: "profile_views", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "link_clicks",
          metricValue: signals.linkClicks,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "meta", sourceKey: "website_clicks", sourceLabel: "live_api" },
        },
      ],
      qualitativeEvidence: [],
    },
    sourceLabel: "live_api",
    appContext: "meta-graph-live",
  };
};

const buildGa4Bundles = (input: ObservationAdapterContext) => {
  const metadata = safeRecord(input.profile.connection_metadata);
  const ga4Signals = safeRecord(metadata.ga4Signals);
  const bundleRef = `ga4-${input.profile.id}-${input.periodStart}`;

  const normalizedMetrics: Array<[string, unknown]> = [
    ["sessions", ga4Signals.sessions],
    ["engaged_users", ga4Signals.engagedUsers],
    ["engagement_time_seconds", ga4Signals.engagementTimeSeconds],
    ["key_events", ga4Signals.keyEvents],
    ["conversions", ga4Signals.conversions],
  ];
  const normalizedRecords: ObservationAdapterBundle["normalizedRecords"] = [];
  for (const [metricName, value] of normalizedMetrics) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      continue;
    }

    normalizedRecords.push({
      assetId: typeof ga4Signals.assetId === "string" ? ga4Signals.assetId : null,
      channel: input.profile.channel,
      metricName,
      metricValue: value,
      metricUnit: metricName === "engagement_time_seconds" ? "seconds" : "count",
      evidenceLevel: "direct_api",
      completenessStatus: "complete",
      notes: typeof ga4Signals.notes === "string" ? ga4Signals.notes : null,
      normalizationMetadata: {
        provider: "ga4",
        sourceKey: metricName,
        sourceLabel: typeof ga4Signals.sourceLabel === "string" ? ga4Signals.sourceLabel : "ga4Signals",
      },
    });
  }

  const qualitativeSignals: Array<[string, string]> = [
    ["sourceMedium", "source_medium"],
    ["campaign", "campaign"],
    ["landingPage", "landing_page"],
  ];
  const qualitativeEvidence: ObservationAdapterBundle["qualitativeEvidence"] = [];
  for (const [sourceKey, signalType] of qualitativeSignals) {
    const value = ga4Signals[sourceKey];
    if (typeof value !== "string" || value.trim().length === 0) {
      continue;
    }

    qualitativeEvidence.push({
      assetId: typeof ga4Signals.assetId === "string" ? ga4Signals.assetId : null,
      channel: input.profile.channel,
      signalType,
      summaryText: value.trim(),
      evidenceLevel: "direct_api",
    });
  }

  if (typeof ga4Signals.notes === "string" && ga4Signals.notes.trim().length > 0) {
    qualitativeEvidence.unshift({
      assetId: typeof ga4Signals.assetId === "string" ? ga4Signals.assetId : null,
      channel: input.profile.channel,
      signalType: "ga4_note",
      summaryText: ga4Signals.notes.trim(),
      evidenceLevel: "manual_confirmed",
    });
  }

  return [
    {
      ref: bundleRef,
      rawEvidence: {
        recordType: "ga4_export",
        assetExternalRef: typeof ga4Signals.assetId === "string" ? ga4Signals.assetId : null,
        payloadRef: `ga4://${input.profile.property_ref ?? input.profile.account_ref}/${input.periodStart}`,
        payloadHash: typeof ga4Signals.payloadHash === "string" ? ga4Signals.payloadHash : null,
        notes: typeof ga4Signals.notes === "string" ? ga4Signals.notes : null,
        collectedAt: typeof ga4Signals.collectedAt === "string" ? ga4Signals.collectedAt : new Date().toISOString(),
      },
      normalizedRecords,
      qualitativeEvidence,
    },
  ];
};

const encodeBase64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const createGoogleJwt = (clientEmail: string, privateKey: string, scope: string) => {
  const normalizedPrivateKey = privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey;
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = encodeBase64Url(signer.sign(normalizedPrivateKey));
  return `${unsignedToken}.${signature}`;
};

const resolveGa4AccessToken = async (input: ObservationAdapterContext): Promise<string> => {
  if (!input.secretResolution.ok) {
    throw new Error("ga4 secret is unresolved");
  }

  const secretValue = input.secretResolution.value.trim();
  if (!secretValue) {
    throw new Error("ga4 secret is empty");
  }

  const parsed = parseJsonObject(secretValue);
  if (
    parsed &&
    typeof parsed.client_email === "string" &&
    typeof parsed.private_key === "string" &&
    parsed.client_email.trim().length > 0 &&
    parsed.private_key.trim().length > 0
  ) {
    const assertion = createGoogleJwt(parsed.client_email.trim(), parsed.private_key, "https://www.googleapis.com/auth/analytics.readonly");
    const response = await fetchJson("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }).toString(),
    });

    const token = safeRecord(response).access_token;
    if (typeof token !== "string" || token.trim().length === 0) {
      throw new Error("ga4 oauth token response missing access_token");
    }

    return token.trim();
  }

  if (parsed && typeof parsed.access_token === "string" && parsed.access_token.trim().length > 0) {
    return parsed.access_token.trim();
  }

  return secretValue;
};

const normalizeGa4PropertyRef = (propertyRef: string | null, accountRef: string) => {
  const trimmedProperty = propertyRef?.trim() ?? "";
  const trimmedAccount = accountRef.trim();
  const source = trimmedProperty || trimmedAccount;
  return source.replace(/^properties\//, "");
};

const parseGa4MetricValues = (response: unknown) => {
  const payload = safeRecord(response);
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const metricHeaders = Array.isArray(payload.metricHeaders) ? payload.metricHeaders : [];
  if (rows.length === 0 || metricHeaders.length === 0) {
    return {
      sessions: 0,
      engagedSessions: 0,
      userEngagementDuration: 0,
      keyEvents: 0,
      conversions: 0,
    };
  }

  const firstRow = safeRecord(rows[0]);
  const metricValues = Array.isArray(firstRow.metricValues) ? firstRow.metricValues : [];
  const metricMap: Record<string, number> = {};

  metricHeaders.forEach((header, index) => {
    const record = safeRecord(header);
    const name = typeof record.name === "string" ? record.name : null;
    const valueRecord = safeRecord(metricValues[index]);
    const rawValue = valueRecord.value;
    const parsedValue = typeof rawValue === "string" ? Number.parseFloat(rawValue) : Number.NaN;
    if (name) {
      metricMap[name] = Number.isFinite(parsedValue) ? parsedValue : 0;
    }
  });

  return {
    sessions: metricMap.sessions ?? 0,
    engagedSessions: metricMap.engagedSessions ?? 0,
    userEngagementDuration: metricMap.userEngagementDuration ?? 0,
    keyEvents: metricMap.keyEvents ?? 0,
    conversions: metricMap.conversions ?? 0,
  };
};

const parseGa4TopDimensionValues = (response: unknown) => {
  const payload = safeRecord(response);
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const dimensionHeaders = Array.isArray(payload.dimensionHeaders) ? payload.dimensionHeaders : [];
  if (rows.length === 0 || dimensionHeaders.length === 0) {
    return {
      sourceMedium: "",
      campaign: "",
      landingPage: "",
    };
  }

  const firstRow = safeRecord(rows[0]);
  const dimensionValues = Array.isArray(firstRow.dimensionValues) ? firstRow.dimensionValues : [];
  const valuesByName: Record<string, string> = {};

  dimensionHeaders.forEach((header, index) => {
    const record = safeRecord(header);
    const name = typeof record.name === "string" ? record.name : null;
    const valueRecord = safeRecord(dimensionValues[index]);
    const value = typeof valueRecord.value === "string" ? valueRecord.value : "";
    if (name) {
      valuesByName[name] = value;
    }
  });

  return {
    sourceMedium: valuesByName.sessionSourceMedium ?? "",
    campaign: valuesByName.sessionCampaignName ?? "",
    landingPage: valuesByName.landingPagePlusQueryString ?? "",
  };
};

const collectGa4LiveBundle = async (
  input: ObservationAdapterContext,
): Promise<{ bundle: ObservationAdapterBundle; sourceLabel: string; appContext: string }> => {
  const propertyId = normalizeGa4PropertyRef(input.profile.property_ref, input.profile.account_ref);
  if (!propertyId) {
    throw new Error("ga4 property_ref is empty");
  }

  const since = normalizeIsoDate(input.periodStart);
  const until = normalizeIsoDate(input.periodEnd);
  if (!since || !until) {
    throw new Error("invalid period dates for ga4 collection");
  }

  const accessToken = await resolveGa4AccessToken(input);
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const baseHeaders = {
    "content-type": "application/json",
    authorization: `Bearer ${accessToken}`,
  };

  const metricsResponse = await fetchJson(endpoint, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({
      dateRanges: [{ startDate: since, endDate: until }],
      metrics: [
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "userEngagementDuration" },
        { name: "keyEvents" },
      ],
      limit: 1,
    }),
  });

  const conversionsResponse = await fetchJson(endpoint, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({
      dateRanges: [{ startDate: since, endDate: until }],
      metrics: [{ name: "conversions" }],
      limit: 1,
    }),
  });

  const topDimensionResponse = await fetchJson(endpoint, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({
      dateRanges: [{ startDate: since, endDate: until }],
      dimensions: [{ name: "sessionSourceMedium" }, { name: "sessionCampaignName" }, { name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 1,
    }),
  });

  const metrics = parseGa4MetricValues(metricsResponse);
  const conversionsMetrics = parseGa4MetricValues(conversionsResponse);
  metrics.conversions = conversionsMetrics.conversions;
  const top = parseGa4TopDimensionValues(topDimensionResponse);
  const collectedAt = new Date().toISOString();

  return {
    bundle: {
      ref: `ga4-live-${input.profile.id}-${since}`,
      rawEvidence: {
        recordType: "ga4_live_report",
        assetExternalRef: null,
        payloadRef: `ga4-live://${propertyId}/${since}_${until}`,
        payloadHash: null,
        notes: "Collected via GA4 Data API in live mode.",
        collectedAt,
      },
      normalizedRecords: [
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "sessions",
          metricValue: metrics.sessions,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "ga4", sourceKey: "sessions", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "engaged_users",
          metricValue: metrics.engagedSessions,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "ga4", sourceKey: "engagedSessions", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "engagement_time_seconds",
          metricValue: metrics.userEngagementDuration,
          metricUnit: "seconds",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "ga4", sourceKey: "userEngagementDuration", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "key_events",
          metricValue: metrics.keyEvents,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "ga4", sourceKey: "keyEvents", sourceLabel: "live_api" },
        },
        {
          assetId: null,
          channel: input.profile.channel,
          metricName: "conversions",
          metricValue: metrics.conversions,
          metricUnit: "count",
          evidenceLevel: "direct_api",
          completenessStatus: "complete",
          notes: "Live API pull",
          normalizationMetadata: { provider: "ga4", sourceKey: "conversions", sourceLabel: "live_api" },
        },
      ],
      qualitativeEvidence: [
        ...(top.sourceMedium
          ? [
              {
                assetId: null,
                channel: input.profile.channel,
                signalType: "source_medium",
                summaryText: top.sourceMedium,
                evidenceLevel: "direct_api" as const,
              },
            ]
          : []),
        ...(top.campaign
          ? [
              {
                assetId: null,
                channel: input.profile.channel,
                signalType: "campaign",
                summaryText: top.campaign,
                evidenceLevel: "direct_api" as const,
              },
            ]
          : []),
        ...(top.landingPage
          ? [
              {
                assetId: null,
                channel: input.profile.channel,
                signalType: "landing_page",
                summaryText: top.landingPage,
                evidenceLevel: "direct_api" as const,
              },
            ]
          : []),
      ],
    },
    sourceLabel: "live_api",
    appContext: "google-analytics-live",
  };
};

const buildCrmBundles = (input: ObservationAdapterContext) => {
  const metadata = safeRecord(input.profile.connection_metadata);
  const crmSignals = safeRecord(metadata.crmSignals);
  const bundleRef = `crm-${input.profile.id}-${input.periodStart}`;
  const metrics: Array<[string, unknown, string]> = [
    ["leads", crmSignals.leads, "count"],
    ["meetings", crmSignals.meetings, "count"],
    ["opportunities", crmSignals.opportunities, "count"],
    ["proposal_requests", crmSignals.proposalRequests, "count"],
    ["revenue_influence", crmSignals.revenueInfluenceAmount ?? crmSignals.revenueInfluence, typeof crmSignals.revenueInfluenceAmount === "number" ? "currency" : "count"],
    ["pipeline_movement", crmSignals.pipelineMovement, "count"],
  ];

  const normalizedRecords: ObservationAdapterBundle["normalizedRecords"] = [];
  for (const [metricName, value, metricUnit] of metrics) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      continue;
    }

    normalizedRecords.push({
      assetId: typeof crmSignals.assetId === "string" ? crmSignals.assetId : null,
      channel: input.profile.channel,
      metricName,
      metricValue: value,
      metricUnit,
      evidenceLevel: "direct_api",
      completenessStatus: "complete",
      notes: typeof crmSignals.notes === "string" ? crmSignals.notes : null,
      normalizationMetadata: {
        provider: "crm",
        sourceKey: metricName,
        sourceLabel: typeof crmSignals.sourceLabel === "string" ? crmSignals.sourceLabel : "crmSignals",
      },
    });
  }

  const qualitativeEvidence: ObservationAdapterBundle["qualitativeEvidence"] = [];
  for (const [sourceKey, signalType] of [
    ["dealStage", "deal_stage"],
    ["owner", "owner"],
    ["pipelineName", "pipeline_name"],
    ["notes", "crm_note"],
  ] as const) {
    const value = crmSignals[sourceKey];
    if (typeof value !== "string" || value.trim().length === 0) {
      continue;
    }

    qualitativeEvidence.push({
      assetId: typeof crmSignals.assetId === "string" ? crmSignals.assetId : null,
      channel: input.profile.channel,
      signalType,
      summaryText: value.trim(),
      evidenceLevel: signalType === "crm_note" ? "manual_confirmed" : "direct_api",
    });
  }

  return [
    {
      ref: bundleRef,
      rawEvidence: {
        recordType: "crm_export",
        assetExternalRef: typeof crmSignals.assetId === "string" ? crmSignals.assetId : null,
        payloadRef: `crm://${input.profile.account_ref}/${input.periodStart}`,
        payloadHash: typeof crmSignals.payloadHash === "string" ? crmSignals.payloadHash : null,
        notes: typeof crmSignals.notes === "string" ? crmSignals.notes : null,
        collectedAt: typeof crmSignals.collectedAt === "string" ? crmSignals.collectedAt : new Date().toISOString(),
      },
      normalizedRecords,
      qualitativeEvidence,
    },
  ];
};

const createMetaAdapter = (): ObservationProviderAdapter => ({
  provider: "meta",
  validate: async (input) => {
    const warnings: string[] = [];
    const blockers: string[] = [];
    const checks: ObservationAdapterCheck[] = [];
    const accountMetadata = buildAccountMetadata(input);
    const channel = input.profile.channel.trim().toLowerCase();

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.errorCode === "SECRET_REF_EMPTY" ? "secret_ref is empty" : input.secretResolution.error);
      checks.push({ name: "secret_resolved", status: "error", reason: input.secretResolution.error });
    } else {
      checks.push({ name: "secret_resolved", status: "ok" });
    }

    if (!input.profile.account_ref.trim()) {
      blockers.push("Meta profiles require an account_ref");
      checks.push({ name: "account_ref", status: "error", reason: "account_ref is missing" });
    } else {
      checks.push({ name: "account_ref", status: "ok" });
    }

    if (!["instagram", "facebook"].includes(channel)) {
      blockers.push("Meta profiles only support instagram or facebook channels");
      checks.push({ name: "channel", status: "error", reason: "channel must be instagram or facebook" });
    } else {
      checks.push({ name: "channel", status: "ok" });
    }

    const metadata = safeRecord(input.profile.connection_metadata);
    if (!metadata.metaSignals && !metadata.mockCollection) {
      warnings.push("Meta profile has no metaSignals or mockCollection payload configured.");
    }

    const status = blockers.length > 0 ? "invalid" : "active";

    return {
      status,
      checks,
      warnings,
      blockers,
      accountMetadata,
    };
  },
  collect: async (input) => {
    const metadata = safeRecord(input.profile.connection_metadata);
    const warnings: string[] = [];
    const blockers: string[] = [];
    const accountMetadata = buildAccountMetadata(input);

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.error);
    }

    if (input.profile.channel.trim().toLowerCase() !== "instagram" && input.profile.channel.trim().toLowerCase() !== "facebook") {
      blockers.push("Meta collection requires instagram or facebook channel");
    }

    const useLiveCollection = asBoolean(safeRecord(metadata.metaSettings).useLiveCollection, true);
    let bundles: ObservationAdapterBundle[] = [];
    let collectionSource = "metadata_snapshot";
    let appContext = "meta-graph";
    if (useLiveCollection && input.secretResolution.ok) {
      try {
        const live = await collectMetaLiveBundle(input);
        bundles = [live.bundle];
        collectionSource = live.sourceLabel;
        appContext = live.appContext;
      } catch (error) {
        warnings.push(`Meta live collection failed, falling back to metadata signals: ${error instanceof Error ? error.message : String(error)}`);
        if (metadata.mockCollection) {
          bundles = extractBundles(metadata);
          collectionSource = "mock_collection";
          appContext = "meta-graph-mock";
        } else {
          bundles = buildMetaBundles(input);
        }
      }
    } else if (metadata.mockCollection) {
      bundles = extractBundles(metadata);
      collectionSource = "mock_collection";
      appContext = "meta-graph-mock";
    } else {
      bundles = buildMetaBundles(input);
    }

    if (bundles.length === 0) {
      warnings.push("Meta profile did not produce any evidence bundles for the requested period.");
    }

    const sourceMetadata = {
      collectedAt: new Date().toISOString(),
      provider: "meta",
      channel: input.profile.channel,
      mode: input.mode,
      appContext,
      collectionSource,
      ...safeRecord(metadata.sourceMetadata),
    };

    return {
      warnings,
      blockers,
      accountMetadata,
      sourceMetadata,
      bundles,
      runMetadata: {
        adapter: "meta",
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        bundleCount: bundles.length,
        sourceType: collectionSource === "live_api" ? "social_api_live" : "social_api",
      },
    };
  },
  mapAccountMetadata: buildAccountMetadata,
});

const createGa4Adapter = (): ObservationProviderAdapter => ({
  provider: "ga4",
  validate: async (input) => {
    const warnings: string[] = [];
    const blockers: string[] = [];
    const checks: ObservationAdapterCheck[] = [];
    const accountMetadata = buildAccountMetadata(input);
    const channel = input.profile.channel.trim().toLowerCase();

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.errorCode === "SECRET_REF_EMPTY" ? "secret_ref is empty" : input.secretResolution.error);
      checks.push({ name: "secret_resolved", status: "error", reason: input.secretResolution.error });
    } else {
      checks.push({ name: "secret_resolved", status: "ok" });
    }

    if (!input.profile.property_ref?.trim()) {
      blockers.push("GA4 profiles require a property_ref");
      checks.push({ name: "property_ref", status: "error", reason: "property_ref is missing" });
    } else {
      checks.push({ name: "property_ref", status: "ok" });
    }

    if (channel !== "site") {
      blockers.push("GA4 profiles only support site channels");
      checks.push({ name: "channel", status: "error", reason: "channel must be site" });
    } else {
      checks.push({ name: "channel", status: "ok" });
    }

    const metadata = safeRecord(input.profile.connection_metadata);
    if (!metadata.ga4Signals && !metadata.mockCollection) {
      warnings.push("GA4 profile has no ga4Signals or mockCollection payload configured.");
    }

    return {
      status: blockers.length > 0 ? "invalid" : "active",
      checks,
      warnings,
      blockers,
      accountMetadata,
    };
  },
  collect: async (input) => {
    const metadata = safeRecord(input.profile.connection_metadata);
    const warnings: string[] = [];
    const blockers: string[] = [];
    const accountMetadata = buildAccountMetadata(input);

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.error);
    }

    if (input.profile.channel.trim().toLowerCase() !== "site") {
      blockers.push("GA4 collection requires a site channel");
    }

    const useLiveCollection = asBoolean(safeRecord(metadata.ga4Settings).useLiveCollection, true);
    let bundles: ObservationAdapterBundle[] = [];
    let collectionSource = "metadata_snapshot";
    let appContext = "google-analytics";
    if (useLiveCollection && input.secretResolution.ok) {
      try {
        const live = await collectGa4LiveBundle(input);
        bundles = [live.bundle];
        collectionSource = live.sourceLabel;
        appContext = live.appContext;
      } catch (error) {
        warnings.push(`GA4 live collection failed, falling back to metadata signals: ${error instanceof Error ? error.message : String(error)}`);
        if (metadata.mockCollection) {
          bundles = extractBundles(metadata);
          collectionSource = "mock_collection";
          appContext = "google-analytics-mock";
        } else {
          bundles = buildGa4Bundles(input);
        }
      }
    } else if (metadata.mockCollection) {
      bundles = extractBundles(metadata);
      collectionSource = "mock_collection";
      appContext = "google-analytics-mock";
    } else {
      bundles = buildGa4Bundles(input);
    }

    if (bundles.length === 0) {
      warnings.push("GA4 profile did not produce any evidence bundles for the requested period.");
    }

    const sourceMetadata = {
      collectedAt: new Date().toISOString(),
      provider: "ga4",
      channel: input.profile.channel,
      mode: input.mode,
      appContext,
      collectionSource,
      ...safeRecord(metadata.sourceMetadata),
    };

    return {
      warnings,
      blockers,
      accountMetadata,
      sourceMetadata,
      bundles,
      runMetadata: {
        adapter: "ga4",
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        bundleCount: bundles.length,
        sourceType: collectionSource === "live_api" ? "analytics_live" : "analytics",
      },
    };
  },
  mapAccountMetadata: buildAccountMetadata,
});

const createCrmAdapter = (): ObservationProviderAdapter => ({
  provider: "crm",
  validate: async (input) => {
    const warnings: string[] = [];
    const blockers: string[] = [];
    const checks: ObservationAdapterCheck[] = [];
    const accountMetadata = buildAccountMetadata(input);
    const channel = input.profile.channel.trim().toLowerCase();

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.errorCode === "SECRET_REF_EMPTY" ? "secret_ref is empty" : input.secretResolution.error);
      checks.push({ name: "secret_resolved", status: "error", reason: input.secretResolution.error });
    } else {
      checks.push({ name: "secret_resolved", status: "ok" });
    }

    if (!input.profile.account_ref.trim()) {
      blockers.push("CRM profiles require an account_ref");
      checks.push({ name: "account_ref", status: "error", reason: "account_ref is missing" });
    } else {
      checks.push({ name: "account_ref", status: "ok" });
    }

    if (channel !== "business") {
      blockers.push("CRM profiles only support business channels");
      checks.push({ name: "channel", status: "error", reason: "channel must be business" });
    } else {
      checks.push({ name: "channel", status: "ok" });
    }

    const metadata = safeRecord(input.profile.connection_metadata);
    if (!metadata.crmSignals && !metadata.mockCollection) {
      warnings.push("CRM profile has no crmSignals or mockCollection payload configured.");
    }

    return {
      status: blockers.length > 0 ? "invalid" : "active",
      checks,
      warnings,
      blockers,
      accountMetadata,
    };
  },
  collect: async (input) => {
    const metadata = safeRecord(input.profile.connection_metadata);
    const warnings: string[] = [];
    const blockers: string[] = [];
    const accountMetadata = buildAccountMetadata(input);

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.error);
    }

    if (input.profile.channel.trim().toLowerCase() !== "business") {
      blockers.push("CRM collection requires a business channel");
    }

    const bundles = metadata.mockCollection ? extractBundles(metadata) : buildCrmBundles(input);
    if (bundles.length === 0) {
      warnings.push("CRM profile did not produce any evidence bundles for the requested period.");
    }

    const sourceMetadata = {
      collectedAt: new Date().toISOString(),
      provider: "crm",
      channel: input.profile.channel,
      mode: input.mode,
      appContext: "crm-system",
      ...safeRecord(metadata.sourceMetadata),
    };

    return {
      warnings,
      blockers,
      accountMetadata,
      sourceMetadata,
      bundles,
      runMetadata: {
        adapter: "crm",
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        bundleCount: bundles.length,
        sourceType: "crm",
      },
    };
  },
  mapAccountMetadata: buildAccountMetadata,
});

const createGenericAdapter = (provider: string): ObservationProviderAdapter => ({
  provider,
  validate: async (input) => {
    const warnings: string[] = [];
    const blockers: string[] = [];
    const checks: ObservationAdapterCheck[] = [];
    const accountMetadata = buildAccountMetadata(input);

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.errorCode === "SECRET_REF_EMPTY" ? "secret_ref is empty" : input.secretResolution.error);
      checks.push({
        name: "secret_resolved",
        status: "error",
        reason: input.secretResolution.error,
      });
    } else {
      checks.push({ name: "secret_resolved", status: "ok" });
    }

    if (!input.profile.account_ref.trim()) {
      blockers.push("observation profile account_ref is required");
      checks.push({ name: "account_ref", status: "error", reason: "account_ref is missing" });
    } else {
      checks.push({ name: "account_ref", status: "ok" });
    }

    const collection = safeRecord(input.profile.connection_metadata).mockCollection;
    if (!collection) {
      warnings.push("No mockCollection payload configured; collection will complete with zero bundles.");
    } else {
      checks.push({ name: "mock_collection", status: "warn", reason: "connector is operating in mock/runtime mode" });
    }

    const status = blockers.length > 0 ? "invalid" : input.secretResolution.ok ? "active" : "invalid";

    return {
      status,
      checks,
      warnings,
      blockers,
      accountMetadata,
    };
  },
  collect: async (input) => {
    const metadata = safeRecord(input.profile.connection_metadata);
    const warnings: string[] = [];
    const blockers: string[] = [];
    const bundles = extractBundles(metadata);
    const accountMetadata = buildAccountMetadata(input);
    const sourceMetadata = {
      collectedAt: new Date().toISOString(),
      provider: input.profile.provider,
      channel: input.profile.channel,
      mode: input.mode,
      mockMode: true,
      ...safeRecord(metadata.sourceMetadata),
    };

    if (!input.secretResolution.ok) {
      blockers.push(input.secretResolution.error);
    }

    if (bundles.length === 0) {
      warnings.push("No mock evidence bundles found in connection_metadata.mockCollection.");
    }

    return {
      warnings,
      blockers,
      accountMetadata,
      sourceMetadata,
      bundles,
      runMetadata: {
        adapter: provider,
        mode: input.mode,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        bundleCount: bundles.length,
      },
    };
  },
  mapAccountMetadata: buildAccountMetadata,
});

const createManualAdapter = (): ObservationProviderAdapter => ({
  provider: "manual",
  validate: async (input) => ({
    status: input.secretResolution.ok ? "active" : "invalid",
    checks: input.secretResolution.ok
      ? [{ name: "manual_profile", status: "ok", reason: "manual profiles use intake flows instead of live collection" }]
      : [{ name: "secret_resolved", status: "error", reason: input.secretResolution.error }],
    warnings: ["Manual profiles should be used for intake flows, not connector collection."],
    blockers: input.secretResolution.ok ? [] : [input.secretResolution.error],
    accountMetadata: buildAccountMetadata(input),
  }),
  collect: async (input) => ({
    warnings: ["Manual profiles do not support connector collection. Use the manual intake endpoint."],
    blockers: ["manual profiles require the manual intake flow"],
    accountMetadata: buildAccountMetadata(input),
    sourceMetadata: {
      provider: input.profile.provider,
      channel: input.profile.channel,
      mode: input.mode,
      manualOnly: true,
    },
    bundles: [],
    runMetadata: {
      adapter: "manual",
      mode: input.mode,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      bundleCount: 0,
    },
  }),
  mapAccountMetadata: buildAccountMetadata,
});

const registry: Record<string, ObservationProviderAdapter> = {
  ga4: createGa4Adapter(),
  crm: createCrmAdapter(),
  meta: createMetaAdapter(),
  manual: createManualAdapter(),
};

export const getObservationProviderAdapter = (provider: string): ObservationProviderAdapter =>
  registry[provider] ?? createGenericAdapter(provider);
