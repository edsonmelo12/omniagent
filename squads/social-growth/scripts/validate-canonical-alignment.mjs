#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client", "amiclube");
const assetFilter = readArg("asset", "");

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const campaignManifestPath = path.join(clientDir, "review", "campaign-manifest.json");
const designManifestDir = path.join(root, "squads", "social-growth", "design-system", "manifests");

const failures = [];
const notes = [];

const readJson = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    failures.push(`${label} is not valid JSON`);
    return null;
  }
};

const normalize = (value) => String(value || "").trim();
const normId = (value) => normalize(value).toUpperCase();
const normLabel = (value) => normalize(value).replace(/\s+/g, " ").toLowerCase();
const normTitle = (value) =>
  normLabel(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const campaignManifest = readJson(campaignManifestPath, "campaign manifest");
const socialEntries = Array.isArray(campaignManifest?.assets?.social) ? campaignManifest.assets.social : [];

if (socialEntries.length === 0) {
  failures.push("campaign manifest has no social assets");
}

const targets = assetFilter
  ? socialEntries.filter((entry) => normId(entry?.assetId) === normId(assetFilter))
  : socialEntries;

if (assetFilter && targets.length === 0) {
  failures.push(`asset not found in campaign manifest: ${assetFilter}`);
}

for (const entry of targets) {
  const assetId = normId(entry?.assetId);
  if (!assetId) {
    failures.push("social asset entry without assetId");
    continue;
  }

  const designPath = path.join(designManifestDir, `${assetId.toLowerCase()}-manifest.json`);
  const previewPath = path.join(clientDir, "social", "previews", `${assetId.toLowerCase()}-post-preview-manifest.json`);
  const design = readJson(designPath, `design-system manifest for ${assetId}`);
  const preview = readJson(previewPath, `preview manifest for ${assetId}`);

  if (!design) {
    notes.push(`design-system manifest missing for ${assetId}`);
  }
  if (!preview) {
    notes.push(`preview manifest missing for ${assetId}`);
  }

  if (design) {
    const expectedTitle = normTitle(design.title || design.headline || "");
    const expectedObjective = normLabel(design.objective || "");
    const expectedChannel = normLabel(design.channel || "");
    const expectedFormat = normLabel(design.format || "");

    if (expectedTitle && normTitle(entry.title) !== expectedTitle) {
      notes.push(`${assetId}: title differs from design manifest (${entry.title} != ${design.title})`);
    }
    if (expectedObjective && normLabel(entry.objective) !== expectedObjective) {
      notes.push(`${assetId}: objective differs from design manifest (${entry.objective} != ${design.objective})`);
    }
    if (expectedChannel && normLabel(entry.channel) !== expectedChannel) {
      notes.push(`${assetId}: channel differs from design manifest (${entry.channel} != ${design.channel})`);
    }
    if (expectedFormat && normLabel(entry.type) !== expectedFormat && expectedFormat !== "post preview") {
      notes.push(`${assetId}: type differs from design format (${entry.type} vs ${design.format}); confirm intentional translation`);
    }
  }

  if (preview) {
    if (normLabel(preview.objective) !== normLabel(entry.objective)) {
      failures.push(`${assetId}: objective drift between campaign manifest and preview manifest (${preview.objective} != ${entry.objective})`);
    }
    if (normLabel(preview.channel) !== normLabel(entry.channel)) {
      failures.push(`${assetId}: channel drift between campaign manifest and preview manifest (${preview.channel} != ${entry.channel})`);
    }
  }
}

const result = {
  ok: failures.length === 0,
  client,
  assetFilter: assetFilter || null,
  campaignManifestPath: path.relative(root, campaignManifestPath),
  targets: targets.map((entry) => normId(entry.assetId)),
  notes,
  failures,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
