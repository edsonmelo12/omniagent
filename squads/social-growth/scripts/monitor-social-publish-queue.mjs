#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
};

const client = getArg("--client");
if (!client) {
  console.error("Usage: node monitor-social-publish-queue.mjs --client <client-slug> [--now <ISO>] [--grace-minutes <int>]");
  process.exit(1);
}

const nowArg = getArg("--now");
const now = Number.isNaN(Date.parse(nowArg || "")) ? new Date() : new Date(nowArg);
const graceMinutes = Number.parseInt(getArg("--grace-minutes") || "90", 10);
const graceMs = graceMinutes * 60 * 1000;

const root = process.cwd();
const publishingDir = path.join(root, "squads", "social-growth", "output", client, "publishing");
const queuePath = path.join(publishingDir, "social-publish-queue.json");
const reportPath = path.join(publishingDir, "social-publish-monitor.md");

if (!fs.existsSync(queuePath)) {
  const report = [
    "# Social Publish Monitor",
    "",
    "## Summary",
    "- Status: FAILED",
    `- Timestamp (UTC): ${now.toISOString()}`,
    "",
    "## Critical",
    `- queue file missing: ${path.relative(root, queuePath)}`,
    "",
  ].join("\n");
  fs.mkdirSync(publishingDir, { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");
  console.error(report);
  process.exit(1);
}

const queueData = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const queue = Array.isArray(queueData?.queue) ? queueData.queue : [];
const critical = [];
const warning = [];
const info = [];

const nowTs = now.getTime();
for (const row of queue) {
  const ts = Date.parse(String(row.publish_at_utc || ""));
  if (Number.isNaN(ts)) {
    critical.push(`${row.asset_id || "sem_id"} com publish_at_utc inválido.`);
    continue;
  }
  const overdue = nowTs - ts > graceMs;
  const status = String(row.status || "");
  const needsCaption = ["scheduled", "ready_to_publish", "queued", "failed"].includes(status) && row.dispatch_mode !== "manual_export";

  if (needsCaption && !String(row.final_caption || "").trim()) {
    critical.push(`${row.asset_id}: missing final_caption.`);
    continue;
  }

  if (status === "blocked") {
    critical.push(`${row.asset_id}: blocked (${row.last_result || "n/a"})`);
    continue;
  }
  if (overdue && status === "scheduled") {
    critical.push(`${row.asset_id}: overdue e ainda scheduled.`);
    continue;
  }
  if (overdue && ["ready_to_publish", "queued", "failed"].includes(status)) {
    warning.push(`${row.asset_id}: overdue com status ${status}.`);
    continue;
  }
  if (!overdue && status === "scheduled") {
    info.push(`${row.asset_id}: aguardando janela.`);
  }
}

if (Array.isArray(queueData?.failures) && queueData.failures.length > 0) {
  for (const failure of queueData.failures) critical.push(`queue build failure: ${failure}`);
}
if (Array.isArray(queueData?.warnings) && queueData.warnings.length > 0) {
  for (const item of queueData.warnings) warning.push(`queue build warning: ${item}`);
}

const overall = critical.length > 0 ? "FAILED" : warning.length > 0 ? "ATTENTION" : "OK";

const table = [
  "| asset_id | channel | publish_at_iso | status | dispatch_mode | last_result |",
  "|---|---|---|---|---|---|",
  ...queue.map(
    (row) =>
      `| ${row.asset_id || "-"} | ${row.channel || "-"} | ${row.publish_at_iso || "-"} | ${row.status || "-"} | ${row.dispatch_mode || "-"} | ${row.last_result || "-"} |`,
  ),
];

const report = [
  "# Social Publish Monitor",
  "",
  "## Summary",
  `- Status: ${overall}`,
  `- Timestamp (UTC): ${now.toISOString()}`,
  `- Grace Window (minutes): ${graceMinutes}`,
  `- Queue Rows: ${queue.length}`,
  "",
  "## Queue Snapshot",
  ...table,
  "",
  "## Critical",
  ...(critical.length ? critical.map((v) => `- ${v}`) : ["- none"]),
  "",
  "## Warning",
  ...(warning.length ? warning.map((v) => `- ${v}`) : ["- none"]),
  "",
  "## Info",
  ...(info.length ? info.map((v) => `- ${v}`) : ["- none"]),
  "",
].join("\n");

fs.mkdirSync(publishingDir, { recursive: true });
fs.writeFileSync(reportPath, report, "utf8");

console.log(
  JSON.stringify(
    {
      status: overall,
      client,
      queueCount: queue.length,
      alerts: {
        critical: critical.length,
        warning: warning.length,
        info: info.length,
      },
      reportPath: path.relative(root, reportPath),
    },
    null,
    2,
  ),
);

if (overall === "FAILED") process.exitCode = 2;
