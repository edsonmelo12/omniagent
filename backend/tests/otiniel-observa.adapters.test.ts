import assert from "node:assert/strict";
import test from "node:test";
import { getObservationProviderAdapter } from "../src/modules/otiniel-observa/otiniel-observa.adapters.js";

test("adapter ga4 valida contexto e coleta bundles configurados", async () => {
  const adapter = getObservationProviderAdapter("ga4");

  const validation = await adapter.validate({
    profile: {
      id: "profile-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "ga4",
      channel: "site",
      profile_type: "observation",
      account_ref: "properties/123",
      property_ref: "123",
      organization_ref: null,
      display_name: "GA4 principal",
      secret_ref: "env://GA4_TOKEN",
      status: "pending",
      scopes: ["read:analytics"],
      connection_metadata: {
        mockCollection: {
          bundles: [
            {
              ref: "weekly-asset-1",
              rawEvidence: {
                recordType: "analytics_export",
                assetExternalRef: "asset-1",
                payloadRef: "raw-1",
              },
              normalizedRecords: [
                {
                  assetId: "asset-1",
                  channel: "site",
                  metricName: "sessions",
                  metricValue: 120,
                  metricUnit: "count",
                  evidenceLevel: "authorized_export",
                  completenessStatus: "complete",
                },
              ],
              qualitativeEvidence: [
                {
                  assetId: "asset-1",
                  channel: "site",
                  signalType: "note",
                  summaryText: "Subida observada no período.",
                  evidenceLevel: "manual_confirmed",
                },
              ],
            },
          ],
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "GA4_TOKEN",
      maskedReference: "env://GA4_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(validation.status, "active");
  assert(validation.checks.some((check) => check.name === "secret_resolved" && check.status === "ok"));

  const collection = await adapter.collect({
    profile: {
      id: "profile-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "ga4",
      channel: "site",
      profile_type: "observation",
      account_ref: "properties/123",
      property_ref: "123",
      organization_ref: null,
      display_name: "GA4 principal",
      secret_ref: "env://GA4_TOKEN",
      status: "pending",
      scopes: ["read:analytics"],
      connection_metadata: {
        mockCollection: {
          bundles: [
            {
              ref: "weekly-asset-1",
              rawEvidence: {
                recordType: "analytics_export",
                assetExternalRef: "asset-1",
                payloadRef: "raw-1",
              },
              normalizedRecords: [
                {
                  assetId: "asset-1",
                  channel: "site",
                  metricName: "sessions",
                  metricValue: 120,
                  metricUnit: "count",
                  evidenceLevel: "authorized_export",
                  completenessStatus: "complete",
                },
              ],
              qualitativeEvidence: [
                {
                  assetId: "asset-1",
                  channel: "site",
                  signalType: "note",
                  summaryText: "Subida observada no período.",
                  evidenceLevel: "manual_confirmed",
                },
              ],
            },
          ],
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "GA4_TOKEN",
      maskedReference: "env://GA4_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(collection.bundles.length, 1);
  assert.equal(collection.bundles[0].normalizedRecords[0].metricName, "sessions");
  assert.equal(collection.bundles[0].qualitativeEvidence[0].signalType, "note");
});

test("adapter manual bloqueia coleta automatizada", async () => {
  const adapter = getObservationProviderAdapter("manual");

  const collection = await adapter.collect({
    profile: {
      id: "profile-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "manual",
      channel: "qualitative",
      profile_type: "observation",
      account_ref: "manual://client-1",
      property_ref: null,
      organization_ref: null,
      display_name: "Manual",
      secret_ref: "env://MANUAL_TOKEN",
      status: "pending",
      scopes: [],
      connection_metadata: {},
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "MANUAL_TOKEN",
      maskedReference: "env://MANUAL_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert(collection.blockers.length > 0);
  assert.equal(collection.bundles.length, 0);
});

test("adapter meta valida canal e sintetiza bundles de sinais", async () => {
  const adapter = getObservationProviderAdapter("meta");

  const validation = await adapter.validate({
    profile: {
      id: "profile-meta-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "meta",
      channel: "instagram",
      profile_type: "observation",
      account_ref: "17841400000000000",
      property_ref: null,
      organization_ref: null,
      display_name: "Instagram principal",
      secret_ref: "env://META_TOKEN",
      status: "pending",
      scopes: ["read:insights"],
      connection_metadata: {
        metaSignals: {
          assetId: "asset-meta-1",
          impressions: 800,
          reach: 620,
          saves: 24,
          shares: 17,
          comments: 9,
          profileVisits: 45,
          linkClicks: 31,
          notes: "Meta signals imported from latest graph export.",
          collectedAt: "2026-04-20T00:00:00Z",
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "META_TOKEN",
      maskedReference: "env://META_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(validation.status, "active");
  assert(validation.checks.some((check) => check.name === "channel" && check.status === "ok"));

  const collection = await adapter.collect({
    profile: {
      id: "profile-meta-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "meta",
      channel: "instagram",
      profile_type: "observation",
      account_ref: "17841400000000000",
      property_ref: null,
      organization_ref: null,
      display_name: "Instagram principal",
      secret_ref: "env://META_TOKEN",
      status: "pending",
      scopes: ["read:insights"],
      connection_metadata: {
        metaSignals: {
          assetId: "asset-meta-1",
          impressions: 800,
          reach: 620,
          saves: 24,
          shares: 17,
          comments: 9,
          profileVisits: 45,
          linkClicks: 31,
          notes: "Meta signals imported from latest graph export.",
          collectedAt: "2026-04-20T00:00:00Z",
          sourceLabel: "graph-export",
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "META_TOKEN",
      maskedReference: "env://META_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(collection.bundles.length, 1);
  assert.equal(collection.bundles[0].rawEvidence.recordType, "meta_graph_api");
  assert.equal(collection.bundles[0].normalizedRecords.length, 7);
  assert.equal(collection.bundles[0].normalizedRecords[0].metricName, "impressions");
  assert.equal(collection.bundles[0].normalizedRecords[5].metricName, "profile_visits");
  assert.equal(collection.bundles[0].normalizedRecords[6].metricName, "link_clicks");
  assert.equal(collection.bundles[0].qualitativeEvidence[0].signalType, "meta_note");
});

test("adapter ga4 valida property_ref e sintetiza bundles analiticos", async () => {
  const adapter = getObservationProviderAdapter("ga4");

  const validation = await adapter.validate({
    profile: {
      id: "profile-ga4-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "ga4",
      channel: "site",
      profile_type: "observation",
      account_ref: "properties/123",
      property_ref: "123",
      organization_ref: null,
      display_name: "GA4 principal",
      secret_ref: "env://GA4_TOKEN",
      status: "pending",
      scopes: ["read:analytics"],
      connection_metadata: {
        ga4Signals: {
          assetId: "ga4-asset-1",
          sessions: 1450,
          engagedUsers: 920,
          engagementTimeSeconds: 3800,
          keyEvents: 87,
          conversions: 24,
          sourceMedium: "google / organic",
          campaign: "spring-launch",
          landingPage: "/artigos/otimizacao",
          notes: "GA4 export imported from the latest reporting window.",
          collectedAt: "2026-04-20T00:00:00Z",
          sourceLabel: "analytics-export",
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "GA4_TOKEN",
      maskedReference: "env://GA4_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(validation.status, "active");
  assert(validation.checks.some((check) => check.name === "property_ref" && check.status === "ok"));

  const collection = await adapter.collect({
    profile: {
      id: "profile-ga4-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "ga4",
      channel: "site",
      profile_type: "observation",
      account_ref: "properties/123",
      property_ref: "123",
      organization_ref: null,
      display_name: "GA4 principal",
      secret_ref: "env://GA4_TOKEN",
      status: "pending",
      scopes: ["read:analytics"],
      connection_metadata: {
        ga4Signals: {
          assetId: "ga4-asset-1",
          sessions: 1450,
          engagedUsers: 920,
          engagementTimeSeconds: 3800,
          keyEvents: 87,
          conversions: 24,
          sourceMedium: "google / organic",
          campaign: "spring-launch",
          landingPage: "/artigos/otimizacao",
          notes: "GA4 export imported from the latest reporting window.",
          collectedAt: "2026-04-20T00:00:00Z",
          sourceLabel: "analytics-export",
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "GA4_TOKEN",
      maskedReference: "env://GA4_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(collection.bundles.length, 1);
  assert.equal(collection.bundles[0].rawEvidence.recordType, "ga4_export");
  assert.equal(collection.bundles[0].normalizedRecords.length, 5);
  assert.equal(collection.bundles[0].normalizedRecords[0].metricName, "sessions");
  assert.equal(collection.bundles[0].normalizedRecords[2].metricName, "engagement_time_seconds");
  assert.equal(collection.bundles[0].qualitativeEvidence[0].signalType, "ga4_note");
  assert.equal(collection.bundles[0].qualitativeEvidence[1].signalType, "source_medium");
});

test("adapter crm valida account_ref e sintetiza sinais de negocio", async () => {
  const adapter = getObservationProviderAdapter("crm");

  const validation = await adapter.validate({
    profile: {
      id: "profile-crm-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "crm",
      channel: "business",
      profile_type: "observation",
      account_ref: "hubspot://portal-123",
      property_ref: null,
      organization_ref: "workspace-123",
      display_name: "CRM principal",
      secret_ref: "env://CRM_TOKEN",
      status: "pending",
      scopes: ["read:crm"],
      connection_metadata: {
        crmSignals: {
          assetId: "crm-asset-1",
          leads: 34,
          meetings: 12,
          opportunities: 8,
          proposalRequests: 5,
          revenueInfluenceAmount: 128000,
          pipelineMovement: 3,
          dealStage: "proposal",
          owner: "sales-team",
          pipelineName: "main-pipeline",
          notes: "CRM export from the weekly revenue review.",
          collectedAt: "2026-04-20T00:00:00Z",
          sourceLabel: "crm-export",
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "CRM_TOKEN",
      maskedReference: "env://CRM_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(validation.status, "active");
  assert(validation.checks.some((check) => check.name === "channel" && check.status === "ok"));

  const collection = await adapter.collect({
    profile: {
      id: "profile-crm-1",
      agency_id: "agency-1",
      client_id: "client-1",
      provider: "crm",
      channel: "business",
      profile_type: "observation",
      account_ref: "hubspot://portal-123",
      property_ref: null,
      organization_ref: "workspace-123",
      display_name: "CRM principal",
      secret_ref: "env://CRM_TOKEN",
      status: "pending",
      scopes: ["read:crm"],
      connection_metadata: {
        crmSignals: {
          assetId: "crm-asset-1",
          leads: 34,
          meetings: 12,
          opportunities: 8,
          proposalRequests: 5,
          revenueInfluenceAmount: 128000,
          pipelineMovement: 3,
          dealStage: "proposal",
          owner: "sales-team",
          pipelineName: "main-pipeline",
          notes: "CRM export from the weekly revenue review.",
          collectedAt: "2026-04-20T00:00:00Z",
          sourceLabel: "crm-export",
        },
      },
      last_validated_at: null,
      last_collected_at: null,
      created_at: "2026-04-20T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    } as never,
    secretResolution: {
      ok: true,
      value: "token",
      backend: "env",
      envKey: "CRM_TOKEN",
      maskedReference: "env://CRM_TOKEN",
    },
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    mode: "incremental",
  });

  assert.equal(collection.bundles.length, 1);
  assert.equal(collection.bundles[0].rawEvidence.recordType, "crm_export");
  assert.equal(collection.bundles[0].normalizedRecords.length, 6);
  assert.equal(collection.bundles[0].normalizedRecords[0].metricName, "leads");
  assert.equal(collection.bundles[0].normalizedRecords[4].metricUnit, "currency");
  assert.equal(collection.bundles[0].qualitativeEvidence[0].signalType, "deal_stage");
  assert.equal(collection.bundles[0].qualitativeEvidence[3].signalType, "crm_note");
});

test("adapter meta coleta via live API quando não há mockCollection", async () => {
  const adapter = getObservationProviderAdapter("meta");
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    ({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () =>
        JSON.stringify({
          data: [
            { name: "impressions", values: [{ value: 100 }] },
            { name: "reach", values: [{ value: 90 }] },
            { name: "saved", values: [{ value: 10 }] },
            { name: "shares", values: [{ value: 5 }] },
            { name: "comments", values: [{ value: 3 }] },
            { name: "profile_views", values: [{ value: 7 }] },
            { name: "website_clicks", values: [{ value: 2 }] },
          ],
        }),
    }) as Response) as typeof fetch;

  try {
    const collection = await adapter.collect({
      profile: {
        id: "profile-meta-live-1",
        agency_id: "agency-1",
        client_id: "client-1",
        provider: "meta",
        channel: "instagram",
        profile_type: "observation",
        account_ref: "17841400000000000",
        property_ref: null,
        organization_ref: null,
        display_name: "Instagram principal",
        secret_ref: "env://META_TOKEN",
        status: "pending",
        scopes: ["read:insights"],
        connection_metadata: {},
        last_validated_at: null,
        last_collected_at: null,
        created_at: "2026-04-20T00:00:00Z",
        updated_at: "2026-04-20T00:00:00Z",
      } as never,
      secretResolution: {
        ok: true,
        value: "token",
        backend: "env",
        envKey: "META_TOKEN",
        maskedReference: "env://META_TOKEN",
      },
      periodStart: "2026-04-01T00:00:00Z",
      periodEnd: "2026-04-07T23:59:59Z",
      mode: "incremental",
    });

    assert.equal(collection.bundles.length, 1);
    assert.equal(collection.bundles[0].rawEvidence.recordType, "meta_graph_live");
    assert.equal(collection.sourceMetadata.collectionSource, "live_api");
    assert.equal(collection.bundles[0].normalizedRecords[0].metricValue, 100);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("adapter ga4 cai para metadata quando live API falha", async () => {
  const adapter = getObservationProviderAdapter("ga4");
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    ({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => JSON.stringify({ error: { message: "invalid token" } }),
    }) as Response) as typeof fetch;

  try {
    const collection = await adapter.collect({
      profile: {
        id: "profile-ga4-fallback-1",
        agency_id: "agency-1",
        client_id: "client-1",
        provider: "ga4",
        channel: "site",
        profile_type: "observation",
        account_ref: "properties/123",
        property_ref: "123",
        organization_ref: null,
        display_name: "GA4 principal",
        secret_ref: "env://GA4_TOKEN",
        status: "pending",
        scopes: ["read:analytics"],
        connection_metadata: {
          ga4Signals: {
            sessions: 50,
            engagedUsers: 30,
            engagementTimeSeconds: 900,
            keyEvents: 8,
            conversions: 2,
          },
        },
        last_validated_at: null,
        last_collected_at: null,
        created_at: "2026-04-20T00:00:00Z",
        updated_at: "2026-04-20T00:00:00Z",
      } as never,
      secretResolution: {
        ok: true,
        value: "invalid-token",
        backend: "env",
        envKey: "GA4_TOKEN",
        maskedReference: "env://GA4_TOKEN",
      },
      periodStart: "2026-04-01T00:00:00Z",
      periodEnd: "2026-04-07T23:59:59Z",
      mode: "incremental",
    });

    assert.equal(collection.bundles.length, 1);
    assert.equal(collection.bundles[0].rawEvidence.recordType, "ga4_export");
    assert(collection.warnings.some((warning) => warning.includes("falling back to metadata signals")));
    assert.equal(collection.sourceMetadata.collectionSource, "metadata_snapshot");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
