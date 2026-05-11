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
  console.error("Usage: node monitor-wordpress-future-posts.mjs --client <client-slug> [--now <ISO>] [--window-hours <int>] [--grace-minutes <int>]");
  process.exit(1);
}

const nowIso = getArg("--now");
const windowHours = Number.parseInt(getArg("--window-hours") || "24", 10);
const graceMinutes = Number.parseInt(getArg("--grace-minutes") || "90", 10);
const now = Number.isNaN(Date.parse(nowIso || "")) ? new Date() : new Date(nowIso);

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const publishingDir = path.join(clientDir, "publishing");
const schedulePath = path.join(publishingDir, "schedule-plan.md");
const statusPath = path.join(publishingDir, "wordpress-status.md");
const reportPath = path.join(publishingDir, "wordpress-schedule-monitor.md");

const failures = [];
if (!fs.existsSync(schedulePath)) failures.push(`schedule plan not found: ${path.relative(root, schedulePath)}`);

const parseTableRows = (text) => {
  const rows = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const parts = line.split("|").slice(1, -1).map((v) => v.trim());
    if (parts.length < 5) continue;
    if (parts[0].includes("publish_date") || parts[0].toLowerCase() === "data") continue;
    if (parts.every((value) => value === "---")) continue;
    rows.push(parts);
  }
  return rows;
};

const toUtcFromBrt = (isoBrt) => {
  const date = new Date(isoBrt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const parseScheduleQueue = (scheduleText) => {
  const rows = [];
  const sectionMatch = scheduleText.match(/##\s+Blog Publish Queue([\s\S]*?)(?:\n##\s+|$)/i);
  const block = sectionMatch ? sectionMatch[1] : "";
  const tableRows = parseTableRows(block);
  for (const columns of tableRows) {
    if (columns.length < 9) continue;
    const [
      publishDate,
      publishTimeBrt,
      publishAtIso,
      channel,
      format,
      articleId,
      theme,
      wordpressTargetStatus,
      status,
    ] = columns;
    const utcIso = toUtcFromBrt(publishAtIso);
    rows.push({
      publishDate,
      publishTimeBrt,
      publishAtIso,
      publishAtUtcIso: utcIso,
      channel,
      format,
      articleId,
      theme,
      wordpressTargetStatus: String(wordpressTargetStatus || "").toLowerCase(),
      status,
    });
  }

  if (rows.length > 0) return rows;

  // Backward compatibility: older schedules use "Blog Publishing Window".
  const legacyMatch = scheduleText.match(/##\s+Blog Publishing Window[^\n]*([\s\S]*?)(?:\n##\s+|$)/i);
  const legacyBlock = legacyMatch ? legacyMatch[1] : "";
  const legacyRows = parseTableRows(legacyBlock);
  for (const columns of legacyRows) {
    if (columns.length < 6) continue;
    const [dateRaw, timeRaw, channel, format, theme, status] = columns;
    const dateMatch = String(dateRaw).match(/(\d{4}-\d{2}-\d{2})/);
    const timeMatch = String(timeRaw).match(/(\d{2}:\d{2})/);
    if (!dateMatch || !timeMatch) continue;
    const publishDate = dateMatch[1];
    const publishTimeBrt = timeMatch[1];
    const publishAtIso = `${publishDate}T${publishTimeBrt}:00-03:00`;
    const articleIdMatch = String(theme).match(/(AC-\d{2}-\d{2}[A-Z]?)/i);
    rows.push({
      publishDate,
      publishTimeBrt,
      publishAtIso,
      publishAtUtcIso: toUtcFromBrt(publishAtIso),
      channel,
      format,
      articleId: articleIdMatch ? articleIdMatch[1] : "",
      theme,
      wordpressTargetStatus: "future",
      status,
    });
  }
  return rows;
};

const parseWordPressStatus = (text) => {
  const readField = (label) => {
    const regex = new RegExp(`-\\s*\\*\\*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*:\\s*(.+)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };
  return {
    status: readField("Status"),
    mode: readField("Publication Mode"),
    wordpressId: readField("WordPress ID"),
    scheduledLocal: readField("Scheduled Local (BRT)"),
    scheduledUtc: readField("Scheduled UTC (date_gmt)"),
    editUrl: readField("Edit URL"),
  };
};

if (failures.length > 0) {
  const report = [
    "# WordPress Schedule Monitor",
    "",
    "## Summary",
    `- Status: FAILED`,
    `- Timestamp (UTC): ${now.toISOString()}`,
    "",
    "## Failures",
    ...failures.map((f) => `- ${f}`),
    "",
  ].join("\n");
  fs.mkdirSync(publishingDir, { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");
  console.error(report);
  process.exit(1);
}

const scheduleText = fs.readFileSync(schedulePath, "utf8");
const queue = parseScheduleQueue(scheduleText);
const statusData = fs.existsSync(statusPath) ? parseWordPressStatus(fs.readFileSync(statusPath, "utf8")) : null;

const alerts = [];
if (queue.length === 0) {
  alerts.push({ severity: "warning", message: "Blog Publish Queue ausente ou vazia no schedule-plan.md." });
}

const windowMs = windowHours * 60 * 60 * 1000;
const graceMs = graceMinutes * 60 * 1000;
const nowTs = now.getTime();

for (const item of queue) {
  if (!item.publishAtUtcIso) {
    alerts.push({
      severity: "critical",
      message: `Linha inválida para ${item.articleId || "sem_id"}: publish_at_iso ausente/inválido.`,
    });
    continue;
  }
  const slotTs = Date.parse(item.publishAtUtcIso);
  const delta = slotTs - nowTs;

  if (delta >= 0 && delta <= windowMs && !statusData) {
    alerts.push({
      severity: "warning",
      message: `Janela próxima para ${item.articleId} sem wordpress-status.md (${item.publishAtIso}).`,
    });
  }

  if (delta < -graceMs && !statusData) {
    alerts.push({
      severity: "critical",
      message: `Slot expirado para ${item.articleId} sem evidência de publicação (${item.publishAtIso}).`,
    });
  }

  if (statusData && item.wordpressTargetStatus === "future") {
    const mode = String(statusData.mode || "").toLowerCase();
    const status = String(statusData.status || "").toLowerCase();
    if (!mode.includes("future") && status !== "future" && status !== "publish" && status !== "published") {
      alerts.push({
        severity: "critical",
        message: `Modo inconsistente para ${item.articleId}: esperado future/publish, recebido status='${statusData.status || "n/a"}' mode='${statusData.mode || "n/a"}'.`,
      });
    }
  }
}

const grouped = {
  critical: alerts.filter((a) => a.severity === "critical"),
  warning: alerts.filter((a) => a.severity === "warning"),
  info: alerts.filter((a) => a.severity === "info"),
};

const overall =
  grouped.critical.length > 0 ? "FAILED" : grouped.warning.length > 0 ? "ATTENTION" : "OK";

const queueLines = queue.length
  ? [
      "| article_id | publish_at_iso | publish_at_utc | target_status | channel | status |",
      "|---|---|---|---|---|---|",
      ...queue.map(
        (item) =>
          `| ${item.articleId || "-"} | ${item.publishAtIso || "-"} | ${item.publishAtUtcIso || "-"} | ${item.wordpressTargetStatus || "-"} | ${item.channel || "-"} | ${item.status || "-"} |`,
      ),
    ]
  : ["- sem itens de blog na fila."];

const wpLines = statusData
  ? [
      `- Status: ${statusData.status || "-"}`,
      `- Mode: ${statusData.mode || "-"}`,
      `- WordPress ID: ${statusData.wordpressId || "-"}`,
      `- Scheduled Local (BRT): ${statusData.scheduledLocal || "-"}`,
      `- Scheduled UTC: ${statusData.scheduledUtc || "-"}`,
      `- Edit URL: ${statusData.editUrl || "-"}`,
    ]
  : ["- wordpress-status.md ausente."];

const alertLines = (list) => (list.length ? list.map((a) => `- ${a.message}`) : ["- none"]);

const report = [
  "# WordPress Schedule Monitor",
  "",
  "## Summary",
  `- Status: ${overall}`,
  `- Timestamp (UTC): ${now.toISOString()}`,
  `- Client: ${client}`,
  `- Lookahead Window (hours): ${windowHours}`,
  `- Late Grace (minutes): ${graceMinutes}`,
  "",
  "## Blog Publish Queue",
  ...queueLines,
  "",
  "## WordPress Status Evidence",
  ...wpLines,
  "",
  "## Alerts",
  "### Critical",
  ...alertLines(grouped.critical),
  "### Warning",
  ...alertLines(grouped.warning),
  "### Info",
  ...alertLines(grouped.info),
  "",
].join("\n");

fs.mkdirSync(publishingDir, { recursive: true });
fs.writeFileSync(reportPath, report, "utf8");

console.log(
  JSON.stringify(
    {
      status: overall,
      client,
      timestampUtc: now.toISOString(),
      queueCount: queue.length,
      alerts: {
        critical: grouped.critical.length,
        warning: grouped.warning.length,
        info: grouped.info.length,
      },
      reportPath: path.relative(root, reportPath),
    },
    null,
    2,
  ),
);
