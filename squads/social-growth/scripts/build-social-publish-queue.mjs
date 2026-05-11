#!/usr/bin/env node
/**
 * Build Social Publish Queue
 * 
 * CTA Requirements (Mandatory for all new posts starting 2026-05-05):
 * - Instagram: "👆 Leia a descrição | [original CTA]"
 * - Facebook: Full article link in caption + original CTA
 * - Last slide/frame: "👆 Salve para depois" (recommended - in Portuguese pt-BR)
 * 
 * These requirements apply to all new campaigns. Existing posts remain unchanged.
 * 
 * @see skills/instagram-carousel/SKILL.md - Slide 1 CTA requirements
 * @see skills/facebook-post/SKILL.md - Caption CTA requirements  
 * @see skills/stories-sequence/SKILL.md - Final frame CTA requirements
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
};

const client = getArg("--client");
if (!client) {
  console.error("Usage: node build-social-publish-queue.mjs --client <client-slug> [--default-time 10:00]");
  process.exit(1);
}

const defaultTime = getArg("--default-time") || "10:00";
const instagramTime = getArg("--instagram-time") || "18:30";
const facebookTime = getArg("--facebook-time") || "10:00";
if (!/^\d{2}:\d{2}$/.test(defaultTime)) {
  console.error("Invalid --default-time. Expected HH:MM.");
  process.exit(1);
}
for (const [label, value] of [["--instagram-time", instagramTime], ["--facebook-time", facebookTime]]) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    console.error(`Invalid ${label}. Expected HH:MM.`);
    process.exit(1);
  }
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const publishingDir = path.join(clientDir, "publishing");
const publishDir = path.join(clientDir, "social", "publish");

const schedulePath = path.join(publishingDir, "schedule-plan.md");
const exportsPath = path.join(publishingDir, "social-publish-assets.json");
const captionsPath = path.join(publishingDir, "social-final-captions.json");
const eligibilityPath = path.join(publishingDir, "channel-eligibility.json");
const manifestPath = path.join(clientDir, "review", "campaign-manifest.json");
const outputPath = path.join(publishingDir, "social-publish-queue.json");

const mustExist = [schedulePath, exportsPath, eligibilityPath];
const missing = mustExist.filter((file) => !fs.existsSync(file));
if (missing.length > 0) {
  console.error(
    JSON.stringify(
      {
        status: "FAILED",
        reason: "missing_required_file",
        missing: missing.map((file) => path.relative(root, file)),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const readJson = (file, fallback = null) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};

const scheduleText = fs.readFileSync(schedulePath, "utf8");
const exportsData = readJson(exportsPath, {});
const captionsData = readJson(captionsPath, {});
const eligibilityData = readJson(eligibilityPath, {});
const manifestData = readJson(manifestPath, {});

const normalizeId = (value) => String(value || "").trim().toUpperCase();
const normalizeChannel = (value) => String(value || "").trim().toLowerCase();
const publishTimeForChannel = (channel) => {
  if (channel === "instagram") return instagramTime;
  if (channel === "facebook") return facebookTime;
  return defaultTime;
};

const channelFromLabel = (labelRaw) => {
  const label = normalizeChannel(labelRaw);
  if (label.includes("instagram")) return "instagram";
  if (label.includes("stories")) return "instagram";
  if (label.includes("facebook")) return "facebook";
  if (label.includes("linkedin")) return "linkedin";
  if (label.includes("tiktok")) return "tiktok";
  if (label.includes("youtube")) return "youtube";
  return label || "unknown";
};

const validateLink = (url) => {
  if (!url) return { valid: true, reason: "no_link" };
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD" }, (res) => {
      resolve({ valid: res.statusCode < 400, status: res.statusCode, reason: res.statusCode >= 400 ? `HTTP_${res.statusCode}` : "ok" });
    });
    req.on("error", (err) => resolve({ valid: false, reason: err.code || err.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ valid: false, reason: "timeout" }); });
    req.end();
  });
};

const parseCalendarRows = (text) => {
  const rows = [];
  const section = text.match(/##\s+Calendar([\s\S]*?)(?:\n##\s+|$)/i);
  if (!section) return rows;
  const lines = section[1].split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const cols = line.split("|").slice(1, -1).map((v) => v.trim());
    if (cols.length < 5) continue;
    if (cols[0].toLowerCase() === "data" || cols[0].toLowerCase() === "date") continue;
    if (cols.every((v) => v === "---")) continue;
    rows.push({
      dateCol: cols[0],
      channelCol: cols[1],
      formatCol: cols[2],
      themeCol: cols[3],
      statusCol: cols[4],
    });
  }
  return rows;
};

const parseDate = (dateCol) => {
  const match = String(dateCol).match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
};

const extractAssetId = (themeCol) => {
  const match = String(themeCol).match(/(AC-\d{2}-\d{2}[A-Z]?|CAROUSEL-[A-Z0-9-]+|STORIES-[A-Z0-9-]+|LINKEDIN-[A-Z0-9-]+)/i);
  return match ? normalizeId(match[1]) : "";
};

const socialManifest = Array.isArray(manifestData?.assets?.social) ? manifestData.assets.social : [];
const exportsRows = Array.isArray(exportsData?.exports) ? exportsData.exports : [];
const exportById = new Map(exportsRows.map((row) => [normalizeId(row.asset_id), row]));
const captionsRows = Array.isArray(captionsData?.captions) ? captionsData.captions : [];
const captionById = new Map(captionsRows.map((row) => [normalizeId(row.asset_id), row]));

const captionFieldsFor = (assetId) => {
  const row = captionById.get(assetId);
  if (!row) {
    return {
      first_line_hook: null,
      final_caption: null,
      cta: null,
      hashtags: [],
      link_target: null,
      link_strategy: null,
      alt_text: null,
    };
  }
  return {
    first_line_hook: row.first_line_hook || null,
    final_caption: row.final_caption || null,
    cta: row.cta || null,
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    link_target: row.link_target || null,
    link_strategy: row.link_strategy || null,
    alt_text: row.alt_text || null,
  };
};

const inferExportKind = (format) => {
  const label = String(format || "").toLowerCase();
  if (label.includes("carrossel") || label.includes("stories") || label.includes("reels")) {
    return "image_sequence_png";
  }
  return "single_image_png";
};

const recoverExportFromFiles = (assetId, format) => {
  const assetDir = path.join(publishDir, assetId.toLowerCase());
  if (!fs.existsSync(assetDir)) return null;
  const files = fs
    .readdirSync(assetDir)
    .filter((file) => file.toLowerCase().endsWith(".png"))
    .sort()
    .map((file) => path.relative(root, path.join(assetDir, file)).split(path.sep).join("/"));
  if (files.length === 0) return null;
  return {
    asset_id: assetId,
    type: String(format || ""),
    status: "recovered_from_filesystem",
    source_preview_path: "",
    export_kind: inferExportKind(format),
    selector_used: "(recovered)",
    files,
  };
};

const channelPolicies = new Map();
for (const ch of Array.isArray(eligibilityData?.channels) ? eligibilityData.channels : []) {
  channelPolicies.set(normalizeChannel(ch.id), {
    state: String(ch.state || "ACTIVE").toUpperCase(),
    publish_enabled: ch.publish_enabled === true,
    credentials_valid: ch.credentials_valid === true,
  });
}

const rows = parseCalendarRows(scheduleText);
const queue = [];
const warnings = [];
const failures = [];
const seenScheduleRows = new Set();
const failureSet = new Set();

const addFailure = (message) => {
  if (failureSet.has(message)) return;
  failureSet.add(message);
  failures.push(message);
};

for (const row of rows) {
  const date = parseDate(row.dateCol);
  const channel = channelFromLabel(row.channelCol);
  if (!date) continue;
  if (channel === "blog") continue;

  let assetId = extractAssetId(row.themeCol);
  if (!assetId) {
    const candidate = socialManifest.find((item) => {
      const targetDate = String(item?.targetDate || "");
      const manifestChannel = channelFromLabel(item?.channel || "");
      return targetDate === date && manifestChannel === channel;
    });
    if (candidate?.assetId) assetId = normalizeId(candidate.assetId);
  }
  if (!assetId) {
    const formatLabel = String(row.formatCol || "").toLowerCase();
    const channelLabel = String(row.channelCol || "").toLowerCase();
    if (formatLabel.includes("stories") || channelLabel.includes("stories")) {
      const storyExports = exportsRows.filter((item) => String(item?.type || "").toLowerCase().includes("stories"));
      if (storyExports.length === 1) assetId = normalizeId(storyExports[0].asset_id);
    }
  }

  if (!assetId) {
    warnings.push(`calendar row ${date}/${row.channelCol}/${row.formatCol} has no resolvable asset_id`);
    continue;
  }

  const scheduleKey = `${assetId}|${channel}|${date}|${row.formatCol}`.toLowerCase();
  if (seenScheduleRows.has(scheduleKey)) {
    warnings.push(`duplicate calendar row skipped for ${assetId} on ${date}`);
    continue;
  }
  seenScheduleRows.add(scheduleKey);

  let exportRow = exportById.get(assetId);
  if (!exportRow) {
    exportRow = recoverExportFromFiles(assetId, row.formatCol);
    if (exportRow) {
      warnings.push(`asset ${assetId} recovered from existing PNG files because manifest row was missing`);
      exportById.set(assetId, exportRow);
    }
  }
  const policy = channelPolicies.get(channel) || {
    state: "ACTIVE",
    publish_enabled: false,
    credentials_valid: false,
  };
  const connectorReady = policy.state === "ACTIVE" && policy.publish_enabled && policy.credentials_valid;
  const dispatchMode = connectorReady ? "connector_api" : "manual_export";
  const publishTimeBrt = publishTimeForChannel(channel);
  const publishAtIso = `${date}T${publishTimeBrt}:00-03:00`;
  const publishAtUtc = new Date(publishAtIso).toISOString();

  if (!exportRow) {
    addFailure(`asset ${assetId} scheduled but missing export row in social-publish-assets.json`);
    queue.push({
      queue_id: `${assetId}-${date}-${publishTimeBrt.replace(":", "")}`,
      asset_id: assetId,
      channel,
      format: String(row.formatCol || ""),
      type: String(row.formatCol || ""),
      publish_date: date,
      publish_time_brt: publishTimeBrt,
      publish_at_iso: publishAtIso,
      publish_at_utc: publishAtUtc,
      schedule_status: String(row.statusCol || ""),
      status: "blocked",
      dispatch_mode: dispatchMode,
      connector_ready: connectorReady,
      eligibility: {
        state: policy.state,
        publish_enabled: policy.publish_enabled,
        credentials_valid: policy.credentials_valid,
      },
      export_kind: "",
      files_count: 0,
      files: [],
      attempts: 0,
      last_attempt_at: null,
      last_result: "missing_exported_files",
      ...captionFieldsFor(assetId),
    });
    continue;
  }

  queue.push({
    queue_id: `${assetId}-${date}-${publishTimeBrt.replace(":", "")}`,
    asset_id: assetId,
    channel,
    format: String(row.formatCol || ""),
    type: String(row.formatCol || ""),
    publish_date: date,
    publish_time_brt: publishTimeBrt,
    publish_at_iso: publishAtIso,
    publish_at_utc: publishAtUtc,
    schedule_status: String(row.statusCol || ""),
    status: "scheduled",
    dispatch_mode: dispatchMode,
    connector_ready: connectorReady,
    eligibility: {
      state: policy.state,
      publish_enabled: policy.publish_enabled,
      credentials_valid: policy.credentials_valid,
    },
    export_kind: String(exportRow.export_kind || ""),
    files_count: Array.isArray(exportRow.files) ? exportRow.files.length : 0,
    files: Array.isArray(exportRow.files) ? exportRow.files : [],
    attempts: 0,
    last_attempt_at: null,
    last_result: null,
    ...captionFieldsFor(assetId),
  });
}

const slotMap = new Map();
for (const entry of queue) {
  const slotKey = `${entry.channel}|${entry.publish_at_iso}`;
  const slotRows = slotMap.get(slotKey) || [];
  slotRows.push(entry.asset_id);
  slotMap.set(slotKey, slotRows);
}
for (const [slotKey, assetIds] of slotMap) {
  if (assetIds.length > 1) {
    addFailure(`duplicate publish slot ${slotKey}: ${assetIds.join(", ")}`);
  }
}

const existingPayload = readJson(outputPath, null);
const existingQueue = Array.isArray(existingPayload?.queue) ? existingPayload.queue : [];
const existingByQueueId = new Map(existingQueue.map((e) => [e.queue_id, e]));

// Merge: keep useful execution metadata, but let the current assets manifest clear stale export blocks.
for (const newEntry of queue) {
  const existing = existingByQueueId.get(newEntry.queue_id);

  // ── CAPTION COMPLETENESS CHECK ──
  // Flag assets that have export but no caption — they will block at publish time.
  // Check both newEntry AND existing queue entry to avoid false positives from caption merge.
  const hasNewCaption = String(newEntry.final_caption || newEntry.first_line_hook || "").trim().length > 0;
  const existingEntry = existingByQueueId.get(newEntry.queue_id);
  const hasExistingCaption = existingEntry
    ? String(existingEntry.final_caption || existingEntry.first_line_hook || "").trim().length > 0
    : false;
  const hasCaption = hasNewCaption || hasExistingCaption;
  const isScheduled = newEntry.status === "scheduled";
  if (isScheduled && !hasCaption) {
    warnings.push(`pending_caption:${newEntry.queue_id} — asset has export but no caption in queue`);
  }

  if (existing) {
    const hadMissingExportBlock =
      existing.status === "blocked" || existing.last_result === "missing_exported_files";
    const currentExportState = {
      queue_id: newEntry.queue_id,
      publish_date: newEntry.publish_date,
      publish_time_brt: newEntry.publish_time_brt,
      publish_at_iso: newEntry.publish_at_iso,
      publish_at_utc: newEntry.publish_at_utc,
      channel: newEntry.channel,
      format: newEntry.format,
      type: newEntry.type,
      schedule_status: newEntry.schedule_status,
      export_kind: newEntry.export_kind,
      files_count: newEntry.files_count,
      files: newEntry.files,
      status: hadMissingExportBlock ? newEntry.status : existing.status || newEntry.status,
      last_result: hadMissingExportBlock ? null : existing.last_result ?? newEntry.last_result,
      dispatch_mode: newEntry.dispatch_mode,
      connector_ready: newEntry.connector_ready,
      eligibility: newEntry.eligibility,
      // Preserve existing captions if new ones are missing to avoid false positive warnings
      first_line_hook: newEntry.first_line_hook ?? existing.first_line_hook ?? null,
      final_caption: newEntry.final_caption ?? existing.final_caption ?? null,
      cta: newEntry.cta ?? existing.cta ?? null,
      hashtags: newEntry.hashtags?.length ? newEntry.hashtags : existing.hashtags ?? [],
      link_target: newEntry.link_target ?? existing.link_target ?? null,
      link_strategy: newEntry.link_strategy ?? existing.link_strategy ?? null,
      alt_text: newEntry.alt_text ?? existing.alt_text ?? null,
    };

    Object.assign(newEntry, currentExportState, {
      attempts: Number(existing.attempts || 0),
      last_attempt_at: existing.last_attempt_at ?? newEntry.last_attempt_at,
      needs_link_update: existing.needs_link_update,
      published_post_id: existing.published_post_id,
      published_url: existing.published_url,
      published_at: existing.published_at,
    });
  }
}

const mergedDefaults = existingPayload?.defaults || {};
const mergedQueue = queue.sort(
  (a, b) => (a.publish_at_utc || "").localeCompare(b.publish_at_utc || ""),
);

const payload = {
  version: existingPayload?.version || "1.0.0",
  client,
  generatedAt: existingPayload?.generatedAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  source: {
    schedulePlanPath: path.relative(root, schedulePath),
    socialPublishAssetsPath: path.relative(root, exportsPath),
    socialFinalCaptionsPath: fs.existsSync(captionsPath) ? path.relative(root, captionsPath) : null,
    channelEligibilityPath: path.relative(root, eligibilityPath),
    campaignManifestPath: fs.existsSync(manifestPath) ? path.relative(root, manifestPath) : null,
  },
  defaults: {
    publish_time_brt: defaultTime,
    instagram_time_brt: instagramTime,
    facebook_time_brt: facebookTime,
    timezone: mergedDefaults.timezone || "America/Sao_Paulo",
    operational_windows: mergedDefaults.operational_windows || undefined,
  },
  queue: mergedQueue,
  warnings,
  failures,
  lastWorkerRun: existingPayload?.lastWorkerRun,
};

fs.mkdirSync(publishingDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const output = {
  status: failures.length > 0 ? "ATTENTION" : "OK",
  client,
  queueCount: mergedQueue.length,
  scheduleRowsParsed: queue.length,
  warnings: warnings.length,
  failures: failures.length,
  outputPath: path.relative(root, outputPath),
};
console.log(JSON.stringify(output, null, 2));

if (failures.length > 0) process.exitCode = 2;
