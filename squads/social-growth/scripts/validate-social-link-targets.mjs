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

const client = readArg("client");
if (!client) {
  console.error("Usage: node validate-social-link-targets.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const manifestPath = path.join(clientDir, "review", "campaign-manifest.json");
const policyPath = path.join(clientDir, "publishing", "social-link-lifecycle.json");

const failures = [];
const notes = [];

if (!fs.existsSync(manifestPath)) {
  failures.push(`campaign manifest missing: ${manifestPath}`);
}

let manifest = null;
let policy = null;

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    failures.push("campaign manifest is not valid JSON");
  }
}

if (fs.existsSync(policyPath)) {
  try {
    policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
  } catch {
    failures.push("social link lifecycle policy is not valid JSON");
  }
} else {
  notes.push("social-link-lifecycle policy not found; using default enforcement");
}

const norm = (value) => String(value || "").trim().toUpperCase();
const lower = (value) => String(value || "").trim().toLowerCase();
const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const enforceStatuses = new Set(
  (Array.isArray(policy?.enforce_on_social_statuses)
    ? policy.enforce_on_social_statuses
    : ["review", "approved", "ready_to_schedule", "scheduled", "published"])
    .map((value) => lower(value))
    .filter(Boolean),
);
const enforceModes = new Set(
  (Array.isArray(policy?.enforce_on_content_modes) ? policy.enforce_on_content_modes : ["blog_derivative"])
    .map((value) => lower(value))
    .filter(Boolean),
);
const publicUrlFields = Array.isArray(policy?.public_url_fields) && policy.public_url_fields.length > 0
  ? policy.public_url_fields
  : ["publicUrl", "publishedUrl", "wordpressPublicUrl", "liveUrl", "permalink"];

const blogAssets = Array.isArray(manifest?.assets?.blog) ? manifest.assets.blog : [];
const socialAssets = Array.isArray(manifest?.assets?.social) ? manifest.assets.social : [];

const blogById = new Map();
for (const blog of blogAssets) {
  const id = norm(blog?.assetId);
  if (!id) continue;
  blogById.set(id, blog);
}

for (const social of socialAssets) {
  const id = norm(social?.assetId);
  const status = lower(social?.status);
  const mode = lower(social?.contentMode);
  const parentId = norm(social?.blogParentId);
  if (!id) continue;
  if (!enforceStatuses.has(status)) continue;
  if (!enforceModes.has(mode)) continue;

  if (!parentId || parentId === "-") {
    failures.push(`social asset ${id} requires blog parent for link target but blogParentId is missing`);
    continue;
  }

  const parent = blogById.get(parentId);
  if (!parent) {
    failures.push(`social asset ${id} references blog parent ${parentId} missing in manifest`);
    continue;
  }

  const hasPublicUrl = publicUrlFields.some((field) => isHttpUrl(parent?.[field]));
  const previewPath = String(parent?.canonicalPreviewPath || "").trim();
  const hasPreview = previewPath.length > 0 && fs.existsSync(path.join(clientDir, previewPath));

  if (!hasPublicUrl && !hasPreview) {
    failures.push(
      `social asset ${id} (status=${status}) has no valid article destination (public URL or canonical preview) for parent ${parentId}`,
    );
  }
}

const result = {
  ok: failures.length === 0,
  client,
  manifestPath: path.relative(root, manifestPath),
  policyPath: path.relative(root, policyPath),
  checkedSocialAssets: socialAssets.length,
  failures,
  notes,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
