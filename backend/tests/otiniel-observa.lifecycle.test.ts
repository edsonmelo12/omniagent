import assert from "node:assert/strict";
import test from "node:test";
import {
  buildObservationReadinessChecklist,
  extractObservationProfileExpiry,
  resolveObservationLifecycleStatus,
} from "../src/modules/otiniel-observa/otiniel-observa.lifecycle.js";

test("extrai expiracao declarada do profile", () => {
  const expiry = extractObservationProfileExpiry({
    id: "profile-1",
    agency_id: "agency-1",
    client_id: "client-1",
    provider: "meta",
    channel: "instagram",
    profile_type: "observation",
    account_ref: "17841400000000000",
    property_ref: null,
    organization_ref: null,
    display_name: "Meta",
    secret_ref: "env://META_TOKEN",
    status: "active",
    scopes: [],
    connection_metadata: {
      expiresAt: "2026-05-01T00:00:00Z",
    },
    last_validated_at: null,
    last_collected_at: null,
    created_at: "2026-04-20T00:00:00Z",
    updated_at: "2026-04-20T00:00:00Z",
  } as never);

  assert.equal(expiry?.expiresAt, "2026-05-01T00:00:00.000Z");
});

test("marca profile expirado quando a validade já passou", () => {
  const status = resolveObservationLifecycleStatus({
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
      display_name: "GA4",
      secret_ref: "env://GA4_TOKEN",
      status: "active",
      scopes: [],
      connection_metadata: {
        expiresAt: "2024-01-01T00:00:00Z",
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
    validation: {
      status: "active",
      checks: [],
      warnings: [],
      blockers: [],
      accountMetadata: {},
    },
    validatedAt: "2026-04-20T00:00:00Z",
  });

  assert.equal(status.status, "expired");
});

test("checklist de prontidao fecha quando ha evidencia suficiente", () => {
  const checklist = buildObservationReadinessChecklist({
    profiles: [
      {
        id: "profile-meta",
        agency_id: "agency-1",
        client_id: "client-1",
        provider: "meta",
        channel: "instagram",
        profile_type: "observation",
        account_ref: "17841400000000000",
        property_ref: null,
        organization_ref: null,
        display_name: "Meta",
        secret_ref: "env://META_TOKEN",
        status: "active",
        scopes: [],
        connection_metadata: {},
        last_validated_at: "2026-04-20T00:00:00Z",
        last_collected_at: "2026-04-20T00:00:00Z",
        created_at: "2026-04-20T00:00:00Z",
        updated_at: "2026-04-20T00:00:00Z",
      },
      {
        id: "profile-ga4",
        agency_id: "agency-1",
        client_id: "client-1",
        provider: "ga4",
        channel: "site",
        profile_type: "observation",
        account_ref: "properties/123",
        property_ref: "123",
        organization_ref: null,
        display_name: "GA4",
        secret_ref: "env://GA4_TOKEN",
        status: "active",
        scopes: [],
        connection_metadata: {},
        last_validated_at: "2026-04-20T00:00:00Z",
        last_collected_at: "2026-04-20T00:00:00Z",
        created_at: "2026-04-20T00:00:00Z",
        updated_at: "2026-04-20T00:00:00Z",
      },
    ] as never,
    runs: [
      {
        id: "run-1",
        agency_id: "agency-1",
        client_id: "client-1",
        observation_profile_id: "profile-meta",
        source_id: "source-1",
        trigger_type: "connector",
        run_status: "completed",
        started_at: "2026-04-20T00:00:00Z",
        finished_at: "2026-04-20T00:05:00Z",
        records_received: 2,
        records_normalized: 2,
        error_code: null,
        error_message: null,
        run_metadata: {
          retrySummary: { attempts: 2, failures: [] },
        },
      },
    ] as never,
    summaries: [
      {
        id: "summary-1",
        agency_id: "agency-1",
        client_id: "client-1",
        asset_id: null,
        window_type: "weekly",
        period_start: "2026-04-01T00:00:00Z",
        period_end: "2026-04-07T23:59:59Z",
        social_signals: {},
        site_signals: {},
        business_signals: {},
        qualitative_signals: {},
        observation_profile_ids: [],
        source_count: 1,
        evidence_level: "direct_api",
        completeness_status: "complete",
        notes: null,
        generated_at: "2026-04-20T00:05:00Z",
      },
    ] as never,
    coverage: {
      connectedSources: 2,
      missingSources: 0,
      profileStatusDistribution: { active: 2 },
      domainCoverage: {
        social: {
          profileCount: 1,
          activeProfileCount: 1,
          evidenceCount: 1,
          summaryCount: 1,
          completenessStatus: "complete",
          evidenceLevel: "direct_api",
        },
        site: {
          profileCount: 1,
          activeProfileCount: 1,
          evidenceCount: 1,
          summaryCount: 1,
          completenessStatus: "complete",
          evidenceLevel: "direct_api",
        },
        business: {
          profileCount: 0,
          activeProfileCount: 0,
          evidenceCount: 0,
          summaryCount: 0,
          completenessStatus: "missing",
          evidenceLevel: "derived",
        },
        qualitative: {
          profileCount: 0,
          activeProfileCount: 0,
          evidenceCount: 0,
          summaryCount: 0,
          completenessStatus: "missing",
          evidenceLevel: "derived",
        },
      },
      highRiskGaps: [],
    },
  });

  assert.equal(checklist.ready, true);
  assert(
    checklist.items.some(
      (item) =>
        item.id === "connector-mvp" &&
        item.status === "pass" &&
        item.label.includes("CRM is optional"),
    ),
  );
  assert(checklist.items.some((item) => item.id === "retries" && item.status === "pass"));
});
