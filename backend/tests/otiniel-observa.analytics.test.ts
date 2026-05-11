import assert from "node:assert/strict";
import test from "node:test";
import { buildObservationCoverageSnapshot, buildObservationSummaryDrafts } from "../src/modules/otiniel-observa/otiniel-observa.analytics.js";
import { observationCollectionTriggerSchema } from "../src/modules/otiniel-observa/otiniel-observa.schemas.js";

test("gera summary semanal com sinais sociais e qualitativos", () => {
  const drafts = buildObservationSummaryDrafts({
    windowType: "weekly",
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
    normalizedRecords: [
      {
        id: "normalized-1",
        agency_id: "agency-1",
        client_id: "client-1",
        observation_profile_id: "profile-1",
        raw_evidence_record_id: "raw-1",
        raw_source_id: "source-1",
        raw_record_type: "manual",
        raw_asset_external_ref: "asset-1",
        asset_id: null,
        channel: "instagram",
        metric_name: "impressions",
        metric_value: "1200",
        metric_unit: "count",
        period_start: "2026-04-01T00:00:00Z",
        period_end: "2026-04-07T23:59:59Z",
        evidence_level: "manual_confirmed",
        completeness_status: "complete",
        normalization_metadata: {},
        created_at: "2026-04-07T23:59:59Z",
      },
    ],
    qualitativeEvidence: [
      {
        id: "qual-1",
        agency_id: "agency-1",
        client_id: "client-1",
        observation_profile_id: "profile-1",
        asset_id: null,
        channel: "instagram",
        period_start: "2026-04-01T00:00:00Z",
        period_end: "2026-04-07T23:59:59Z",
        signal_type: "manual_note",
        summary_text: "Campanha com forte engajamento.",
        source_ref: "raw-1",
        evidence_level: "manual_confirmed",
        created_at: "2026-04-07T23:59:59Z",
      },
    ],
  });

  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].windowType, "weekly");
  assert.equal(drafts[0].sourceCount, 1);
  assert.equal(drafts[0].completenessStatus, "complete");
  assert.equal(drafts[0].socialSignals.recordCount, 1);
  assert.equal(drafts[0].qualitativeSignals.recordCount, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(drafts[0].qualitativeSignals, "summaryPreview"), false);
  assert.match(drafts[0].notes ?? "", /window=weekly/);
});

test("expõe gaps de cobertura quando nao ha conexoes nem summaries", () => {
  const coverage = buildObservationCoverageSnapshot({
    profiles: [],
    runs: [],
    summaries: [],
    normalizedRecords: [],
    qualitativeEvidence: [],
  });

  assert.equal(coverage.connectedSources, 0);
  assert.equal(coverage.missingSources, 0);
  assert.equal(coverage.domainCoverage.social.profileCount, 0);
  assert(coverage.highRiskGaps.some((gap) => gap.code === "NO_ACTIVE_PROFILES"));
  assert(coverage.highRiskGaps.some((gap) => gap.code === "NO_SUMMARIES"));
});

test("schema de coleta usa modo incremental por padrão", () => {
  const payload = observationCollectionTriggerSchema.parse({
    periodStart: "2026-04-01T00:00:00Z",
    periodEnd: "2026-04-07T23:59:59Z",
  });

  assert.equal(payload.mode, "incremental");
});
