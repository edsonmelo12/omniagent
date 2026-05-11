import assert from "node:assert/strict";
import test from "node:test";
import { buildTargetPlatforms, buildValidation } from "../src/modules/publishing/publishing.service.js";
import { resolveCampaignState } from "../src/modules/campaign/campaign.service.js";

test("normaliza plataformas solicitadas e remove duplicatas", () => {
  const targetPlatforms = buildTargetPlatforms({
    requestedPlatforms: [" Instagram ", "linkedin", "instagram", ""],
    schedulePayload: null,
    contentPackagePayload: null,
  });

  assert.deepEqual(targetPlatforms, ["instagram", "linkedin"]);
});

test("usa canais da agenda quando nenhuma plataforma for solicitada", () => {
  const targetPlatforms = buildTargetPlatforms({
    requestedPlatforms: [],
    schedulePayload: {
      cadence: "weekly",
      items: [{ channel: "Instagram" }, { channel: "linkedin" }, { channel: "instagram" }],
    },
    contentPackagePayload: null,
  });

  assert.deepEqual(targetPlatforms, ["instagram", "linkedin"]);
});

test("cai para canais de suporte do pacote quando nao ha agenda", () => {
  const targetPlatforms = buildTargetPlatforms({
    requestedPlatforms: [],
    schedulePayload: null,
    contentPackagePayload: {
      items: [],
      visualDirection: {
        supportChannels: ["instagram", "youtube", "instagram"],
      },
    },
  });

  assert.deepEqual(targetPlatforms, ["instagram", "youtube"]);
});

test("aprova a publicação em dry-run quando os pré-requisitos estão válidos", () => {
  const validation = buildValidation({
    mode: "dry_run",
    confirm: false,
    contentPlanVersion: 3,
    contentPackageVersion: 3,
    scheduleVersion: 3,
    scheduleStatus: "approved",
    contentPackageStatus: "approved",
    contentPackagePayload: {
      contentPlanVersion: 3,
      items: [],
      visualDirection: {
        contentRhythm: "weekly",
      },
    },
    schedulePayload: {
      contentPlanVersion: 3,
      cadence: "weekly",
      items: [{ channel: "instagram" }],
    },
    approvalsPending: 0,
    approvalsApproved: 1,
    targetPlatforms: ["instagram"],
  });

  assert.equal(validation.ready, true);
  assert.deepEqual(validation.blockers, []);
  assert.deepEqual(validation.warnings, []);
});

test("exige confirmação explícita para live e mantém aviso de simulação local", () => {
  const validation = buildValidation({
    mode: "live",
    confirm: false,
    contentPlanVersion: 3,
    contentPackageVersion: 3,
    scheduleVersion: 3,
    scheduleStatus: "approved",
    contentPackageStatus: "approved",
    contentPackagePayload: {
      contentPlanVersion: 3,
      items: [],
      visualDirection: {
        contentRhythm: "weekly",
      },
    },
    schedulePayload: {
      contentPlanVersion: 3,
      cadence: "weekly",
      items: [{ channel: "instagram" }],
    },
    approvalsPending: 0,
    approvalsApproved: 1,
    targetPlatforms: ["instagram"],
  });

  assert.equal(validation.ready, false);
  assert(validation.blockers.includes("Live publication requires explicit confirmation"));
  assert(validation.warnings.includes("Live publication is simulated locally until network adapters are connected."));
});

test("mantém a campanha em publish até a execução de publicação concluir", () => {
  const state = resolveCampaignState({
    client: { id: "client-1", name: "Client 1" },
    profiles: [{ id: "profile-1" }],
    snapshot: { id: "snapshot-1" },
    clientRecord: { status: "approved", version: 3, payload_json: {} },
    marketResearch: { status: "approved", payload_json: { context: { clientRecordVersion: 3 } } },
    proposal: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3 } },
    contentPlan: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3, proposalVersion: 3 } },
    contentPackage: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    schedule: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    publishingExecution: { status: "dry_run_passed", mode: "dry_run" },
    monitoring: null,
    approvals: [{ artifact_type: "schedule", status: "approved" }],
  } as Parameters<typeof resolveCampaignState>[0]);

  assert.equal(state.stage, "publish");
  assert.equal(state.publishExecutionStatus, "dry_run_passed");
  assert.equal(state.publishExecutionMode, "dry_run");
  assert.deepEqual(state.reopenStages, []);
  assert.equal(state.nextValidStage, "monitoring");
  assert(state.blockers.includes("Dry-run passed; live publication is still pending"));
});

test("fecha a etapa de publicação quando a execução foi concluída", () => {
  const state = resolveCampaignState({
    client: { id: "client-1", name: "Client 1" },
    profiles: [{ id: "profile-1" }],
    snapshot: { id: "snapshot-1" },
    clientRecord: { status: "approved", version: 3, payload_json: {} },
    marketResearch: { status: "approved", payload_json: { context: { clientRecordVersion: 3 } } },
    proposal: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3 } },
    contentPlan: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3, proposalVersion: 3 } },
    contentPackage: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    schedule: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    publishingExecution: { status: "published", mode: "live" },
    monitoring: null,
    approvals: [{ artifact_type: "schedule", status: "approved" }],
  } as Parameters<typeof resolveCampaignState>[0]);

  assert.equal(state.stage, "monitoring");
  assert(state.completedStages.includes("publish"));
  assert.equal(state.publishExecutionStatus, "published");
  assert.deepEqual(state.reopenStages, []);
  assert.equal(state.nextValidStage, "adjustment");
});

test("reabre as etapas dependentes quando a pesquisa fica obsoleta", () => {
  const state = resolveCampaignState({
    client: { id: "client-1", name: "Client 1" },
    profiles: [{ id: "profile-1" }],
    snapshot: { id: "snapshot-1" },
    clientRecord: { status: "approved", version: 3, payload_json: { client: { name: "Client 1 updated" }, diagnosis: { archetype: "escala" } } },
    previousClientRecord: { status: "approved", version: 2, payload_json: { client: { name: "Client 1" }, diagnosis: { archetype: "presenca" } } },
    clientRecords: [],
    marketResearch: { status: "approved", payload_json: { context: { clientRecordVersion: 2 } } },
    proposal: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3 } },
    contentPlan: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3, proposalVersion: 3 } },
    contentPackage: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    schedule: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    publishingExecution: null,
    monitoring: null,
    approvals: [{ artifact_type: "schedule", status: "approved" }],
  } as Parameters<typeof resolveCampaignState>[0]);

  assert.equal(state.stage, "research");
  assert.equal(state.clientRecordChangeScope, "identity");
  assert.deepEqual(state.clientRecordChangedSections, ["client", "diagnosis"]);
  assert.deepEqual(state.clientRecordChangedPaths, ["client.name", "diagnosis.archetype"]);
  assert.deepEqual(state.clientRecordChangeDetails, [
    { path: "client.name", section: "client", impact: "research" },
    { path: "diagnosis.archetype", section: "diagnosis", impact: "research" },
  ]);
  assert.deepEqual(state.reopenStages, ["research", "strategy", "content_plan", "content_production_package", "schedule"]);
  assert.equal(state.nextValidStage, "strategy");
});

test("ignora revisao que altera apenas nota", () => {
  const state = resolveCampaignState({
    client: { id: "client-1", name: "Client 1" },
    profiles: [{ id: "profile-1" }],
    snapshot: { id: "snapshot-1" },
    clientRecord: {
      status: "approved",
      version: 3,
      payload_json: {
        client: { name: "Client 1" },
        diagnosis: { archetype: "presenca" },
        narrative: { summary: "Stable summary" },
        offerRecommendation: { mode: "presenca" },
        note: "new note only",
      },
    },
    previousClientRecord: {
      status: "approved",
      version: 2,
      payload_json: {
        client: { name: "Client 1" },
        diagnosis: { archetype: "presenca" },
        narrative: { summary: "Stable summary" },
        offerRecommendation: { mode: "presenca" },
        note: "old note",
      },
    },
    clientRecords: [],
    marketResearch: { status: "approved", payload_json: { context: { clientRecordVersion: 3 } } },
    proposal: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3 } },
    contentPlan: { status: "approved", version: 3, payload_json: { clientRecordVersion: 3, proposalVersion: 3 } },
    contentPackage: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    schedule: { status: "approved", version: 3, payload_json: { contentPlanVersion: 3 } },
    publishingExecution: null,
    monitoring: null,
    approvals: [{ artifact_type: "schedule", status: "approved" }],
  } as Parameters<typeof resolveCampaignState>[0]);

  assert.equal(state.clientRecordChangeScope, "none");
  assert.deepEqual(state.clientRecordChangedSections, []);
  assert.deepEqual(state.clientRecordChangedPaths, []);
  assert.deepEqual(state.clientRecordChangeDetails, []);
  assert.equal(state.stage, "publish");
  assert.deepEqual(state.reopenStages, []);
});
