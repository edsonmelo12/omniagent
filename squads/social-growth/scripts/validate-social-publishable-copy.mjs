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
  console.error("Usage: node validate-social-publishable-copy.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const previewsDir = path.join(root, "squads", "social-growth", "output", client, "social", "previews");
const policyPath = path.join(root, "squads", "social-growth", "pipeline", "data", "social-publishable-copy-policy.json");
const failures = [];
const notes = [];

if (!fs.existsSync(previewsDir)) {
  failures.push(`social previews directory missing: ${previewsDir}`);
  console.log(JSON.stringify({ ok: false, client, failures }, null, 2));
  process.exit(1);
}

const collectHtmlFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
};

const decodeEntities = (input) =>
  input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const toVisibleText = (html) => {
  const noComments = html.replace(/<!--[\s\S]*?-->/g, " ");
  const noScripts = noComments.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
  const noStyles = noScripts.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  const noTags = noStyles.replace(/<[^>]+>/g, " ");
  const decoded = decodeEntities(noTags);
  return decoded.replace(/\s+/g, " ").trim();
};

const defaultForbiddenMarkers = [
  { id: "internal_asset_code", regex: /\bac-\d{2}-\d{2}\b/i, message: "internal asset code in visible copy" },
  { id: "internal_version_tag", regex: /\bv\d+\b/i, message: "internal version tag in visible copy" },
  { id: "episode_code", regex: /epis[oó]dio\s+ac-\d{2}-\d{2}/i, message: "episode+code marker in visible copy" },
  { id: "thesis_marker", regex: /tese do blog/i, message: "process thesis marker in visible copy" },
  { id: "sync_marker", regex: /sincronizado/i, message: "sync/process marker in visible copy" },
  { id: "repurpose_test", regex: /repurpose\s+test/i, message: "test marker in visible copy" },
  { id: "skill_prefix", regex: /\bskill:\b/i, message: "skill metadata in visible copy" },
  { id: "technical_baseline", regex: /baseline\s+premium/i, message: "technical baseline metadata in visible copy" },
  { id: "keyframes_label", regex: /\bkeyframes?\b/i, message: "production keyframe label in visible copy" },
  { id: "asset_label", regex: /\basset:\b/i, message: "asset metadata label in visible copy" },
  { id: "tool_name", regex: /\b(social-visual-system|instagram-carousel|linkedin-carousel|stories-sequence|social-single-post|creative-director)\b/i, message: "tool/skill name in visible copy" },
  { id: "hook_label", regex: /\bhook\b/i, message: "hook label in visible copy" },
  { id: "cta_label", regex: /\bcta\b/i, message: "cta label in visible copy" },
  { id: "briefing_phrase_authority", regex: /\bautoridade de marca\b/i, message: "briefing phrase in visible copy" },
  { id: "briefing_phrase_premium", regex: /\bneg[oó]cio premium\b/i, message: "briefing phrase in visible copy" },
];

const loadPolicyMarkers = () => {
  if (!fs.existsSync(policyPath)) {
    notes.push(`policy file not found, using defaults: ${path.relative(root, policyPath)}`);
    return defaultForbiddenMarkers;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(policyPath, "utf8"));
    const list = Array.isArray(raw?.forbidden_markers) ? raw.forbidden_markers : [];
    const compiled = list
      .map((item) => {
        if (!item?.id || !item?.regex) return null;
        return {
          id: String(item.id).trim(),
          regex: new RegExp(String(item.regex), "i"),
          message: String(item.message || "forbidden marker in visible copy").trim(),
        };
      })
      .filter(Boolean);

    if (compiled.length === 0) {
      notes.push("policy file has no valid markers, using defaults");
      return defaultForbiddenMarkers;
    }

    notes.push(`loaded ${compiled.length} forbidden marker(s) from policy`);
    return compiled;
  } catch (error) {
    notes.push(`policy parse failed, using defaults: ${String(error)}`);
    return defaultForbiddenMarkers;
  }
};

const forbiddenMarkers = loadPolicyMarkers();

const htmlFiles = collectHtmlFiles(previewsDir);
if (htmlFiles.length === 0) {
  failures.push(`no html previews found under: ${previewsDir}`);
}

const violations = [];
for (const filePath of htmlFiles) {
  const rawHtml = fs.readFileSync(filePath, "utf8");
  const visibleText = toVisibleText(rawHtml);

  for (const marker of forbiddenMarkers) {
    const match = visibleText.match(marker.regex);
    if (!match) continue;
    violations.push({
      file: path.relative(root, filePath),
      marker: marker.id,
      message: marker.message,
      matchedText: match[0],
    });
  }
}

if (violations.length > 0) {
  failures.push(`found ${violations.length} publishability violation(s) in social previews`);
}

notes.push(`checked ${htmlFiles.length} html preview file(s)`);

const result = {
  ok: failures.length === 0,
  client,
  previewsDir: path.relative(root, previewsDir),
  policyPath: path.relative(root, policyPath),
  checkedFiles: htmlFiles.length,
  notes,
  failures,
  violations,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
