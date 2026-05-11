#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client");
if (!client) {
  console.error("Usage: node validate-social-publish-assets.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const campaignManifestPath = path.join(clientDir, "review", "campaign-manifest.json");
const publishAssetsPath = path.join(clientDir, "publishing", "social-publish-assets.json");
const policyPath = path.join(clientDir, "publishing", "social-publish-assets-policy.json");
const publishQueuePath = path.join(clientDir, "publishing", "social-publish-queue.json");

const failures = [];
const notes = [];

const readJson = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    failures.push(`${label} is not valid JSON`);
    return null;
  }
};

const manifest = readJson(campaignManifestPath, "campaign manifest");
const publishAssets = readJson(publishAssetsPath, "social publish assets");
const policy = fs.existsSync(policyPath)
  ? readJson(policyPath, "social publish assets policy")
  : null;

const normalize = (value) => String(value || "").trim();
const lower = (value) => normalize(value).toLowerCase();
const canonicalStatus = (value) => {
  const status = lower(value);
  if (!status) return "";
  if (status.includes("aprovado") || status.includes("approved")) return "approved";
  if (status.includes("em revisão") || status.includes("revisao") || status.includes("review")) return "review";
  if (status.includes("preview pronto") || status.includes("ready")) return "ready_to_schedule";
  if (status.includes("agendado") || status.includes("scheduled")) return "scheduled";
  if (status.includes("publicado") || status.includes("published")) return "published";
  if (status.includes("planejado") || status.includes("planned")) return "planned";
  return status;
};

const defaultPolicy = {
  enforce_on_social_statuses: ["review", "approved", "ready_to_schedule", "scheduled", "published"],
  type_requirements: {
    carrossel: { min_files: 4, allowed_export_kinds: ["image_sequence_png", "image_sequence_jpeg"], min_width: 1080, min_height: 1080 },
    stories: { min_files: 4, allowed_export_kinds: ["image_sequence_png", "image_sequence_jpeg"], min_width: 1080, min_height: 1920 },
    reels: { min_files: 1, allowed_export_kinds: ["image_sequence_png", "image_sequence_jpeg", "video_mp4"], min_width: 1080, min_height: 1920 },
    post: { min_files: 1, allowed_export_kinds: ["single_image_png", "image_sequence_png", "single_image_jpeg", "image_sequence_jpeg"], min_width: 1080, min_height: 1080 },
    "post estático": { min_files: 1, allowed_export_kinds: ["single_image_png", "image_sequence_png", "single_image_jpeg", "image_sequence_jpeg"], min_width: 1080, min_height: 1080 },
    "post oferta": { min_files: 1, allowed_export_kinds: ["single_image_png", "image_sequence_png", "single_image_jpeg", "image_sequence_jpeg"], min_width: 1080, min_height: 1080 },
  },
  quality: {
    max_duplicate_ratio: 0.0,
    min_dark_pixel_pct: 0.0,
    min_brightness_pct: 5.0,
  },
};

const mergedPolicy = {
  ...defaultPolicy,
  ...(policy || {}),
  type_requirements: {
    ...defaultPolicy.type_requirements,
    ...((policy && policy.type_requirements) || {}),
  },
};

const enforceStatuses = new Set(
  (Array.isArray(mergedPolicy.enforce_on_social_statuses) ? mergedPolicy.enforce_on_social_statuses : [])
    .map((value) => lower(value))
    .filter(Boolean),
);

const socialAssets = Array.isArray(manifest?.assets?.social) ? manifest.assets.social : [];
const exportRows = Array.isArray(publishAssets?.exports) ? publishAssets.exports : [];
const exportById = new Map();
for (const row of exportRows) {
  const id = normalize(row?.asset_id).toUpperCase();
  if (!id) continue;
  exportById.set(id, row);
}

/**
 * Compute MD5 hash of a file.
 */
const md5 = (filePath) => {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex");
};

/**
 * Get image dimensions using `identify` (ImageMagick).
 */
const imageDimensions = (filePath) => {
  try {
    const out = execSync(`identify -format "%w %h" "${filePath}"`, { encoding: "utf8" }).trim();
    const parts = out.split(" ");
    return { width: parseInt(parts[0], 10), height: parseInt(parts[1], 10) };
  } catch {
    return null;
  }
};

/**
 * Check if image has excessive dark pixels (e.g., mostly black background).
 * Uses ImageMagick to compute mean brightness percentage.
 */
const brightnessPct = (filePath) => {
  try {
    const out = execSync(`identify -format "%[mean]" "${filePath}"`, { encoding: "utf8" }).trim();
    const mean = parseFloat(out);
    if (Number.isNaN(mean)) return null;
    // ImageMagick mean is on a scale: 0-255 (8-bit) or 0-65535 (16-bit)
    // We normalize assuming 16-bit max (Q16 is default in modern ImageMagick)
    const maxVal = mean > 255 ? 65535 : 255;
    return (mean / maxVal) * 100;
  } catch {
    return null;
  }
};

/**
 * Quality checks for a set of exported files.
 */
const checkImageQuality = (assetId, files, type) => {
  const qc = mergedPolicy.quality || {};
  const absFiles = files.map((f) => path.join(root, f)).filter((f) => fs.existsSync(f));
  const results = [];

  for (const f of absFiles) {
    const dims = imageDimensions(f);
    if (!dims) {
      failures.push(`${assetId}: cannot read dimensions for ${path.basename(f)}`);
      continue;
    }

    const req = mergedPolicy.type_requirements[type] || {};
    const minW = req.min_width || 100;
    const minH = req.min_height || 100;
    if (dims.width < minW || dims.height < minH) {
      failures.push(`${assetId}: ${path.basename(f)} dimensions ${dims.width}x${dims.height} below minimum ${minW}x${minH}`);
    }
  }

  // Check for duplicate frames (same MD5 hash)
  if (absFiles.length > 1) {
    const hashes = absFiles.map((f) => ({ file: f, hash: md5(f) }));
    const seen = new Map();
    for (const h of hashes) {
      if (seen.has(h.hash)) {
        const dupOf = path.basename(seen.get(h.hash));
        failures.push(`${assetId}: duplicate frame ${path.basename(h.file)} is identical to ${dupOf} (same content hash)`);
      } else {
        seen.set(h.hash, h.file);
      }
    }
  }

  // Check brightness (detect mostly-black images)
  const minBrightness = qc.min_brightness_pct || 5.0;
  for (const f of absFiles) {
    const bright = brightnessPct(f);
    if (bright !== null && bright < minBrightness) {
      failures.push(`${assetId}: ${path.basename(f)} is too dark (brightness ${bright.toFixed(1)}% < ${minBrightness}% threshold)`);
    }
  }

  return results;
};

/**
 * Validate that a URL is reachable (HEAD request).
 */
const validateUrlReachable = async (url, assetId, label) => {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (res.status >= 400) {
      failures.push(`${assetId}: ${label} returned HTTP ${res.status}: ${url}`);
      return false;
    }
    return true;
  } catch (err) {
    failures.push(`${assetId}: ${label} unreachable: ${url} — ${err.message}`);
    return false;
  }
};

/**
 * Check if a URL looks fabricated (not matching any known article/landing URL).
 */
const validateUrlKnown = (url, assetId, knownUrls, label) => {
  const normalized = url.replace(/\/+$/, "").toLowerCase();
  const match = knownUrls.some((known) => {
    const k = known.replace(/\/+$/, "").toLowerCase();
    return normalized === k || normalized.endsWith(k) || k.endsWith(normalized);
  });
  if (!match) {
    failures.push(`${assetId}: ${label} does not match any known article/landing URL: ${url}`);
  }
  return match;
};

/**
 * Collect all known article/landing URLs from the campaign manifest.
 */
const collectKnownUrls = (manifest) => {
  const urls = new Set();
  const articles = manifest?.articles || [];
  for (const a of articles) {
    if (a?.url) urls.add(a.url);
    if (a?.link) urls.add(a.link);
    if (a?.permalink) urls.add(a.permalink);
    if (a?.canonicalUrl) urls.add(a.canonicalUrl);
  }
  const socialAssets = manifest?.assets?.social || [];
  for (const sa of socialAssets) {
    if (sa?.articleUrl) urls.add(sa.articleUrl);
    if (sa?.linkTarget) urls.add(sa.linkTarget);
    if (sa?.link) urls.add(sa.link);
  }
  return Array.from(urls);
};

/**
 * Validate link_target URLs in the publish queue.
 */
const validateQueueUrls = async (queue, knownUrls) => {
  const rows = Array.isArray(queue) ? queue : [];
  const validated = new Set();
  for (const row of rows) {
    const assetId = String(row?.asset_id || "").toUpperCase();
    const linkTarget = String(row?.link_target || "").trim();
    if (!linkTarget || !assetId) continue;
    const key = `${assetId}:${linkTarget}`;
    if (validated.has(key)) continue;
    validated.add(key);

    // Check URL matches known article/landing URLs
    validateUrlKnown(linkTarget, assetId, knownUrls, "link_target");

    // Check URL is reachable (skip for already-published items to avoid noise)
    if (row?.status !== "published") {
      await validateUrlReachable(linkTarget, assetId, "link_target");
    }
  }
};

for (const asset of socialAssets) {
  const assetId = normalize(asset?.assetId).toUpperCase();
  const status = canonicalStatus(asset?.status);
  const type = lower(asset?.type);
  const previewPath = normalize(asset?.canonicalPreviewPath);
  if (!assetId || !enforceStatuses.has(status)) continue;
  if (!previewPath) continue;

  const req = mergedPolicy.type_requirements[type] || mergedPolicy.type_requirements.post;
  if (!req) continue;

  const row = exportById.get(assetId);
  if (!row) {
    failures.push(`asset ${assetId} status=${status} missing publish export row`);
    continue;
  }

  const exportKind = lower(row?.export_kind);
  const allowedKinds = new Set(
    (Array.isArray(req.allowed_export_kinds) ? req.allowed_export_kinds : [])
      .map((value) => lower(value))
      .filter(Boolean),
  );
  if (allowedKinds.size > 0 && !allowedKinds.has(exportKind)) {
    failures.push(
      `asset ${assetId} type=${type} has unsupported export_kind=${row?.export_kind}; allowed=${Array.from(allowedKinds).join(",")}`,
    );
  }

  const files = Array.isArray(row?.files) ? row.files : [];
  const minFiles = Number(req.min_files || 1);
  if (files.length < minFiles) {
    failures.push(`asset ${assetId} type=${type} exported files below minimum (${files.length} < ${minFiles})`);
  }
  for (const relFile of files) {
    const absFile = path.join(root, String(relFile || ""));
    if (!fs.existsSync(absFile)) {
      failures.push(`asset ${assetId} exported file missing: ${relFile}`);
    }
  }

  // Quality checks (dimensions, duplicates, darkness)
  if (files.length > 0) {
    checkImageQuality(assetId, files, type);
  }
}

// ── URL VALIDATION ──
const knownUrls = collectKnownUrls(manifest);
const publishQueue = fs.existsSync(publishQueuePath)
  ? readJson(publishQueuePath, "social publish queue")
  : null;
if (publishQueue && knownUrls.length > 0) {
  await validateQueueUrls(publishQueue, knownUrls);
} else if (!publishQueue) {
  notes.push("publish queue not found; skipping URL validation");
}

const result = {
  ok: failures.length === 0,
  client,
  campaignManifestPath: path.relative(root, campaignManifestPath),
  publishAssetsPath: path.relative(root, publishAssetsPath),
  policyPath: path.relative(root, policyPath),
  checkedSocialAssets: socialAssets.length,
  checkedExports: exportRows.length,
  failures,
  notes,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
