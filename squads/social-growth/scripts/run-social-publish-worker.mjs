#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
};

const client = getArg("--client");
if (!client) {
  console.error("Usage: node run-social-publish-worker.mjs --client <client-slug> [--mode dry_run|live_api] [--now <ISO>]");
  process.exit(1);
}

const mode = String(getArg("--mode") || "live_api").trim();
if (!["dry_run", "live_api"].includes(mode)) {
  console.error("Invalid --mode. Use dry_run or live_api.");
  process.exit(1);
}

const nowArg = getArg("--now");
const now = Number.isNaN(Date.parse(nowArg || "")) ? new Date() : new Date(nowArg);
const root = process.cwd();
const squadRoot = path.join(root, "squads", "social-growth");
const publishingDir = path.join(squadRoot, "output", client, "publishing");
const queuePath = path.join(publishingDir, "social-publish-queue.json");
const logPath = path.join(publishingDir, "social-publish-worker-log.md");
const envFile = path.join(squadRoot, `.env.publish.${client}`);

if (!fs.existsSync(queuePath)) {
  console.error(`Queue file not found: ${path.relative(root, queuePath)}`);
  process.exit(1);
}

const queueData = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const queue = Array.isArray(queueData?.queue) ? queueData.queue : [];
const dueRows = queue.filter((row) => {
  const ts = Date.parse(String(row.publish_at_utc || ""));
  if (Number.isNaN(ts)) return false;
  return ts <= now.getTime() && ["scheduled", "failed", "ready_to_publish", "queued"].includes(String(row.status || ""));
});

// ── LINK RESOLUTION CHECK ──
// Load assets manifest to check articleUrl for blog_derivative posts
function loadAssetsManifest() {
  const assetsPath = path.join(publishingDir, "social-publish-assets.json");
  if (!fs.existsSync(assetsPath)) return null;
  return JSON.parse(fs.readFileSync(assetsPath, "utf8"));
}

function getArticleUrl(assetId, assetsData) {
  if (!assetsData?.exports) return null;
  const match = assetsData.exports.find((e) => e.asset_id === assetId);
  return match?.articleUrl || null;
}

const actions = [];

// Resolve env file for the client (resolve-client-secrets should have been called first)
function loadEnv() {
  if (!fs.existsSync(envFile)) return {};
  const env = {};
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return env;
}

function getChannelForAsset(assetId) {
  // Check schedule plan or queue metadata for channel
  const row = queue.find((r) => r.asset_id === assetId);
  if (row?.channel) return row.channel;
  // Infer from dispatch_mode
  if (row?.dispatch_mode === "manual_export") return "manual";
  return "instagram"; // default
}

async function publishViaInstagramPublisher(images, caption) {
  const env = loadEnv();
  const token = env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = env.INSTAGRAM_USER_ID || process.env.INSTAGRAM_USER_ID;
  const imgbbKey = env.IMGBB_API_KEY || process.env.IMGBB_API_KEY;

  if (!token || !userId || !imgbbKey) {
    return { success: false, error: "Missing Instagram credentials in env file" };
  }

  const publisherScriptCandidates = [
    path.join(squadRoot, "skills", "instagram-publisher", "scripts", "publish.js"),
    path.join(root, "skills", "instagram-publisher", "scripts", "publish.js"),
  ];
  const publisherScript = publisherScriptCandidates.find((candidate) => fs.existsSync(candidate));

  if (!publisherScript) {
    return { success: false, error: `Publisher script not found in: ${publisherScriptCandidates.join(", ")}` };
  }

  const tmpEnv = path.join(squadRoot, `.env.publish.tmp`);
  fs.writeFileSync(tmpEnv, [
    `INSTAGRAM_ACCESS_TOKEN=${token}`,
    `INSTAGRAM_USER_ID=${userId}`,
    `IMGBB_API_KEY=${imgbbKey}`,
  ].join("\n") + "\n", "utf8");

  try {
    const stdout = execFileSync("node", [
      `--env-file=${tmpEnv}`,
      publisherScript,
      "--images",
      images.join(","),
      "--caption",
      caption,
    ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    try { fs.unlinkSync(tmpEnv); } catch {}
    // Parse the output for post ID and URL
    const postIdMatch = stdout.match(/Post ID:\s*(\S+)/);
    const urlMatch = stdout.match(/URL:\s*(\S+)/);
    return {
      success: true,
      postId: postIdMatch ? postIdMatch[1] : null,
      url: urlMatch ? urlMatch[1] : null,
      output: stdout,
    };
  } catch (execErr) {
    try { fs.unlinkSync(tmpEnv); } catch {}
    return { success: false, error: execErr.stderr || execErr.message };
  }
}

function getExportDir() {
  const candidates = [
    path.join(squadRoot, "output", client, "social", "exports"),
    path.join(squadRoot, "output", client, "publishing", "exports"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      // Recursively collect all image files from subdirectories
      const files = [];
      function walk(dirPath) {
        for (const entry of fs.readdirSync(dirPath)) {
          const full = path.join(dirPath, entry);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            walk(full);
          } else if (entry.endsWith(".jpg") || entry.endsWith(".jpeg") || entry.endsWith(".png")) {
            files.push(entry);
          }
        }
      }
      walk(dir);
      if (files.length > 0) return { dir, files };
    }
  }
  return null;
}

function resolveRowFiles(row) {
  const files = Array.isArray(row.files) ? row.files : [];
  return files
    .map((file) => path.resolve(root, String(file || "")))
    .filter((file) => fs.existsSync(file));
}

function minImagesForRow(row) {
  const format = String(row.format || row.type || "").toLowerCase();
  if (format.includes("carrossel") || format.includes("stories")) return 2;
  return 1;
}

function dryRunChecks(row, env) {
  const channel = getChannelForAsset(row.asset_id);
  const rowFiles = resolveRowFiles(row);
  const needs = minImagesForRow(row);
  const hasChannelCreds =
    channel === "facebook"
      ? !!(env.FACEBOOK_ACCESS_TOKEN || env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN)
      : !!(env.INSTAGRAM_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN);
  return {
    credentials: hasChannelCreds,
    assets_exported: rowFiles.length >= needs,
    asset_count: rowFiles.length,
    min_required: needs,
    caption_ready: !!composeCaption(row),
    final_caption_ready: !!String(row.final_caption || "").trim(),
    channel,
  };
}

function composeCaption(row) {
  const base = String(row.final_caption || row.copy_caption || row.caption_preview || "").trim();
  const hashtags = Array.isArray(row.hashtags) ? row.hashtags : [];
  const hashtagText = hashtags
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
  if (!base) return "";
  if (!hashtagText || base.includes(hashtagText)) return base;
  return `${base}\n\n${hashtagText}`;
}

/**
 * Sanitize caption for Instagram API compatibility.
 * Normalizes Unicode, fixes line endings, and validates content.
 */
function sanitizeCaption(caption) {
  if (!caption) return "";
  return caption
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .normalize("NFC");
}

/**
 * Validate that a row has a usable caption before publishing.
 * Returns { ok, reason } — if ok is false, publishing must be blocked.
 */
function validateCaption(row) {
  const raw = String(row.final_caption || row.copy_caption || row.caption_preview || "").trim();
  if (!raw) return { ok: false, reason: "missing_final_caption" };
  const composed = composeCaption(row);
  if (!composed) return { ok: false, reason: "composed_caption_empty" };
  if (composed.length > 2200) return { ok: false, reason: `caption_exceeds_2200_chars:${composed.length}` };
  return { ok: true };
}

for (const row of dueRows) {
  const filesCount = Number(row.files_count || 0);
  const isEligible = row?.eligibility?.state === "ACTIVE" && row?.eligibility?.publish_enabled === true;

  row.attempts = Number(row.attempts || 0) + 1;
  row.last_attempt_at = now.toISOString();

  if (filesCount <= 0) {
    row.status = "blocked";
    row.last_result = "missing_exported_files";
    actions.push({ asset_id: row.asset_id, action: "blocked", reason: row.last_result });
    continue;
  }

  if (!isEligible) {
    row.status = "blocked";
    row.last_result = "channel_not_eligible";
    actions.push({ asset_id: row.asset_id, action: "blocked", reason: row.last_result });
    continue;
  }

  if (mode === "live_api" && row.status !== "published" && !String(row.final_caption || "").trim()) {
    row.status = "blocked";
    row.last_result = "missing_final_caption";
    actions.push({ asset_id: row.asset_id, action: "blocked", reason: row.last_result });
    continue;
  }

  // ── CAPTION VALIDATION GATE ──
  if (mode === "live_api" && row.status !== "published") {
    const captionCheck = validateCaption(row);
    if (!captionCheck.ok) {
      row.status = "blocked";
      row.last_result = `caption_gate:${captionCheck.reason}`;
      actions.push({ asset_id: row.asset_id, action: "blocked", reason: row.last_result });
      continue;
    }
  }

  // ── LINK VALIDATION GATE ──
  // Instagram Stories and Reels don't support clickable links in the post body.
  // Validate only for formats that embed links natively (carrossel, post, facebook).
  const format = String(row.format || row.type || "").toLowerCase();
  const strategy = String(row.link_strategy || "").trim();
  const formatsWithNativeLink = ["carrossel", "post", "facebook", "feed"];
  const skipLinkValidation = !formatsWithNativeLink.some((f) => format.includes(f)) || ["story_interaction", "reels_mention", "no_link"].includes(strategy);

  const linkTarget = String(row.link_target || "").trim();

  // Facebook bridge: resolve channel and articleUrl early
  const channel = getChannelForAsset(row.asset_id);
  const assetsData = loadAssetsManifest();
  const articleUrl = getArticleUrl(row.asset_id, assetsData);

  if (linkTarget && mode === "live_api" && row.status !== "published" && !skipLinkValidation) {
    try {
      const headRes = await fetch(linkTarget, { method: "HEAD", redirect: "follow" });
      if (headRes.status >= 400) {
        row.status = "blocked";
        row.last_result = `link_target_unreachable:${linkTarget} returned HTTP ${headRes.status}`;
        actions.push({ asset_id: row.asset_id, action: "blocked", reason: row.last_result });
        continue;
      }
    } catch (fetchErr) {
      // Network/timeout failure: publish anyway but flag for manual link update.
      // Don't block — link check is a safety net, not a gate.
      row.needs_link_update = true;
      row.last_result = `link_warning:fetch_failed:${fetchErr.message}`;
      actions.push({ asset_id: row.asset_id, action: "link_warning", reason: row.last_result });
    }
  }

  // Facebook: publish without link if URL not available; flag for manual update
  if (channel === "facebook" && !articleUrl && row.contentMode !== "seasonal_offer") {
    row.needs_link_update = true;
  }

  if (row.dispatch_mode === "manual_export") {
    row.status = "ready_to_publish";
    row.last_result = "manual_handoff_required";
    actions.push({ asset_id: row.asset_id, action: "ready_to_publish", reason: row.last_result });
    continue;
  }

  if (mode === "dry_run") {
    const env = loadEnv();
    const checks = dryRunChecks(row, env);

    row.status = "queued";
    row.last_result = `dry_run_ok:${JSON.stringify(checks)}`;
    actions.push({ asset_id: row.asset_id, action: "queued", reason: JSON.stringify(checks) });
    continue;
  }

  // ── LIVE API MODE ──

  if (channel === "manual") {
    row.status = "ready_to_publish";
    row.last_result = "manual_handoff_required";
    actions.push({ asset_id: row.asset_id, action: "ready_to_publish", reason: row.last_result });
    continue;
  }

  async function getSingleImageForAsset(assetRow) {
    const files = resolveRowFiles(assetRow).sort();
    return files[0] || null;
  }

  async function publishViaFacebookPage(imagePath, captionText) {
    const env = loadEnv();
    const token = env.FACEBOOK_ACCESS_TOKEN || env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;
    const pageId = env.FACEBOOK_PAGE_ID || process.env.FACEBOOK_PAGE_ID;
    const imgbbKey = env.IMGBB_API_KEY || process.env.IMGBB_API_KEY;

    if (!token || !pageId || !imgbbKey) {
      return { success: false, error: "Missing Facebook credentials (token, pageId, or imgBB key)" };
    }

    // Upload image to imgBB first
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const absPath = resolve(imagePath);
    const fileBuffer = readFileSync(absPath);
    const b64 = fileBuffer.toString("base64");
    const form = new FormData();
    form.append("key", imgbbKey);
    form.append("image", b64);
    let imgUrl;
    try {
      const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error(`imgBB upload failed: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error("imgBB upload failed");
      imgUrl = json.data.url;
    } catch (e) {
      return { success: false, error: `imgBB upload: ${e.message}` };
    }

    const FB_BASE = "https://graph.facebook.com/v21.0";
    async function resolvePageAccessToken() {
      const params = new URLSearchParams({ fields: "access_token", access_token: token });
      const res = await fetch(`${FB_BASE}/${pageId}?${params}`);
      if (!res.ok) throw new Error(`Facebook page token lookup failed [${res.status}]: ${await res.text()}`);
      const json = await res.json();
      return json.access_token || token;
    }

    try {
      const pageAccessToken = await resolvePageAccessToken();
      const params = new URLSearchParams({ url: imgUrl, caption: captionText, access_token: pageAccessToken });
      const res = await fetch(`${FB_BASE}/${pageId}/photos?${params}`, { method: "POST" });
      if (!res.ok) throw new Error(`Facebook API error [${res.status}]: ${await res.text()}`);
      const json = await res.json();
      return { success: true, postId: json.id, url: `https://facebook.com/${pageId}/posts/${json.id}` };
    } catch (e) {
      return { success: false, error: `Facebook API: ${e.message}` };
    }
  }

  if (channel === "instagram") {
    const assetImages = resolveRowFiles(row).sort();
    const minimumImages = minImagesForRow(row);
    if (assetImages.length < minimumImages) {
      row.status = "blocked";
      row.last_result = `insufficient_images_for_instagram:${assetImages.length}<${minimumImages}`;
      actions.push({ asset_id: row.asset_id, action: "blocked", reason: row.last_result });
      continue;
    }

    const caption = sanitizeCaption(composeCaption(row));
    const result = await publishViaInstagramPublisher(assetImages, caption);

    if (result.success) {
      row.status = "published";
      row.last_result = "published_ok";
      row.published_post_id = result.postId;
      row.published_url = result.url;
      row.published_at = now.toISOString();
      actions.push({
        asset_id: row.asset_id,
        action: "published",
        postId: result.postId,
        url: result.url,
      });
    } else {
      row.status = "failed";
      row.last_result = `live_publish_error:${result.error}`;
      actions.push({ asset_id: row.asset_id, action: "failed", reason: result.error });
    }
    continue;
  }

  if (channel === "facebook") {
    const imagePath = await getSingleImageForAsset(row);
    if (!imagePath) {
      row.status = "blocked";
      row.last_result = "no_exported_images_for_facebook";
      actions.push({ asset_id: row.asset_id, action: "blocked", reason: row.last_result });
      continue;
    }
    const caption = sanitizeCaption(composeCaption(row));
    const result = await publishViaFacebookPage(imagePath, caption);
    if (result.success) {
      row.status = "published";
      row.last_result = "published_ok";
      row.published_post_id = result.postId;
      row.published_url = result.url;
      row.published_at = now.toISOString();
      actions.push({ asset_id: row.asset_id, action: "published", postId: result.postId, url: result.url });
    } else {
      row.status = "failed";
      row.last_result = `live_publish_error:${result.error}`;
      actions.push({ asset_id: row.asset_id, action: "failed", reason: result.error });
    }
    continue;
  }

  // Unknown/unimplemented channel
  row.status = "failed";
  row.last_result = `channel_not_implemented:${channel}`;
  actions.push({ asset_id: row.asset_id, action: "failed", reason: row.last_result });
}

queueData.lastWorkerRun = {
  at: now.toISOString(),
  mode,
  dueRows: dueRows.length,
  actions: actions.length,
};

fs.writeFileSync(queuePath, `${JSON.stringify(queueData, null, 2)}\n`, "utf8");

const log = [
  "# Social Publish Worker Log",
  "",
  "## Run",
  `- Timestamp (UTC): ${now.toISOString()}`,
  `- Mode: ${mode}`,
  `- Due rows: ${dueRows.length}`,
  `- Actions: ${actions.length}`,
  "",
  "## Actions",
  ...(
    actions.length > 0
      ? actions.map((a) => {
          const parts = [`- ${a.asset_id}: ${a.action} (${a.reason})`];
          if (a.postId) parts.push(`  Post ID: ${a.postId}`);
          if (a.url) parts.push(`  URL: ${a.url}`);
          return parts.join("\n");
        })
      : ["- none"]
  ),
  "",
].join("\n");

fs.mkdirSync(publishingDir, { recursive: true });
fs.writeFileSync(logPath, log, "utf8");

console.log(
  JSON.stringify(
    {
      status: "OK",
      client,
      mode,
      dueRows: dueRows.length,
      actions: actions.length,
      published: actions.filter((a) => a.action === "published").length,
      queuePath: path.relative(root, queuePath),
      logPath: path.relative(root, logPath),
    },
    null,
    2,
  ),
);
