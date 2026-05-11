#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
};

const squad = getArg("--squad") || "social-growth";
const client = getArg("--client");
if (!client) {
  console.error("Usage: node sync-state-approvals.mjs --client <client-slug> [--squad <squad-code>]");
  process.exit(1);
}

const root = process.cwd();
const squadDir = path.join(root, "squads", squad);
const statePath = path.join(squadDir, "state.json");

if (!fs.existsSync(statePath)) {
  console.error(`state.json missing: ${path.relative(root, statePath)}`);
  process.exit(1);
}

const approvalDir = path.join(squadDir, "output", client, "approvals");
const scheduleArtifact = path.join(approvalDir, "schedule-approval.md");
const strategyArtifact = path.join(approvalDir, "strategy-decision-approval.md");

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

const detectApprovalPending = (artifactPath) => {
  if (!fs.existsSync(artifactPath)) {
    return { pending: true, source: "missing", approved: false };
  }

  const raw = fs.readFileSync(artifactPath, "utf8");
  const normalized = raw.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const upper = normalized.toUpperCase();

  const explicitlyPending =
    /## STATUS\s+PENDENTE/.test(upper) ||
    /\bPENDENTE\b/.test(upper) ||
    /AGUARDA CHECKPOINT/.test(upper);

  const explicitlyApproved =
    /RESPOSTA DO USUARIO:\s*-?\s*1\b/.test(upper) ||
    /CONFIRMACAO REGISTRADA/.test(upper) ||
    /## STATUS\s+APROVAD/.test(upper) ||
    /\bAPROVADO PELO USUARIO\b/.test(upper);

  const explicitlyPaused =
    /RESPOSTA DO USUARIO:\s*-?\s*2\b/.test(upper) ||
    /STATUS\s*:\s*PAUSAD/.test(upper);

  if (explicitlyApproved && !explicitlyPending && !explicitlyPaused) {
    return { pending: false, source: "artifact_approved", approved: true };
  }

  return {
    pending: true,
    source: explicitlyPaused ? "artifact_paused" : explicitlyPending ? "artifact_pending" : "artifact_unresolved",
    approved: false,
  };
};

const schedule = detectApprovalPending(scheduleArtifact);
const strategy = detectApprovalPending(strategyArtifact);
const now = new Date().toISOString();

state.approvals = {
  ...(state.approvals && typeof state.approvals === "object" ? state.approvals : {}),
  schedule: {
    pending: schedule.pending,
    artifact: path.relative(root, scheduleArtifact),
    label: "agenda",
    updatedAt: now,
    source: schedule.source,
  },
  strategy: {
    pending: strategy.pending,
    artifact: path.relative(root, strategyArtifact),
    label: "estratégia",
    updatedAt: now,
    source: strategy.source,
  },
};

fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      squad,
      client,
      statePath: path.relative(root, statePath),
      approvals: state.approvals,
    },
    null,
    2,
  ),
);
