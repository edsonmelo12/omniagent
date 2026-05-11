#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client");

if (!client) {
  console.error("Usage: node validate-blog-quality-gate.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const blogDir = path.join(clientDir, "blog");
const previewsDir = path.join(blogDir, "previews");
const manifestPath = path.join(clientDir, "review", "campaign-manifest.json");
const failures = [];
const notes = [];

if (!fs.existsSync(blogDir)) {
  failures.push(`blog directory not found: ${blogDir}`);
}

const planningAlignmentValidation = spawnSync(
  process.execPath,
  [path.join(root, "squads", "social-growth", "scripts", "validate-planning-alignment.mjs"), "--client", client],
  { encoding: "utf8" },
);

let planningAlignmentResult = null;
try {
  planningAlignmentResult = JSON.parse(planningAlignmentValidation.stdout || "{}");
} catch {
  failures.push("could not parse planning alignment validation output");
}
if (planningAlignmentValidation.status !== 0) {
  failures.push("planning alignment validation failed");
}

const contractValidation = spawnSync(
  process.execPath,
  [path.join(root, "squads", "social-growth", "scripts", "validate-blog-contract.mjs"), "--client", client],
  { encoding: "utf8" },
);

let contractResult = null;
try {
  contractResult = JSON.parse(contractValidation.stdout || "{}");
} catch {
  failures.push("could not parse blog contract validation output");
}

if (contractValidation.status !== 0) {
  failures.push("blog contract validation failed");
}

const alignmentValidation = spawnSync(
  process.execPath,
  [path.join(root, "squads", "social-growth", "scripts", "validate-blog-social-alignment.mjs"), "--client", client],
  { encoding: "utf8" },
);

let alignmentResult = null;
try {
  alignmentResult = JSON.parse(alignmentValidation.stdout || "{}");
} catch {
  failures.push("could not parse blog-social alignment validation output");
}
if (alignmentValidation.status !== 0) {
  failures.push("blog-social alignment validation failed");
}

const contractFilePath = path.join(root, "squads", "social-growth", "pipeline", "data", "blog-output-contract.json");
let previewVisibleMin = 900;
let previewToMarkdownRatioMin = 0.75;
if (fs.existsSync(contractFilePath)) {
  try {
    const contractFile = JSON.parse(fs.readFileSync(contractFilePath, "utf8"));
    previewVisibleMin = Number(contractFile.word_count?.preview_visible_min ?? previewVisibleMin);
    previewToMarkdownRatioMin = Number(
      contractFile.word_count?.preview_to_markdown_ratio_min ?? previewToMarkdownRatioMin,
    );
  } catch {
    notes.push("could not parse contract file for preview thresholds; defaults applied");
  }
}

if (!fs.existsSync(previewsDir)) {
  failures.push(`missing blog preview directory: ${previewsDir}`);
}

const previewCandidates = fs.existsSync(previewsDir)
  ? fs
      .readdirSync(previewsDir)
      .filter((file) => file.toLowerCase().endsWith(".html"))
      .map((file) => path.join(previewsDir, file))
  : [];

if (previewCandidates.length === 0) {
  failures.push("no blog preview html found in canonical preview directory");
}

let manifest = null;
if (!fs.existsSync(manifestPath)) {
  failures.push(`campaign manifest missing: ${manifestPath}`);
} else {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    failures.push("campaign manifest is not valid JSON");
  }
}

let latestPreview = null;
const manifestBlogAssets = Array.isArray(manifest?.assets?.blog) ? manifest.assets.blog : [];
const activeManifestBlogAssets = manifestBlogAssets.filter((entry) => {
  const status = String(entry?.status || "").trim().toLowerCase();
  return /review|revis[aã]o|approved|aprov|scheduled|agend|published|public/i.test(status) &&
    String(entry?.canonicalPreviewPath || "").trim().length > 0;
});

const getSection = (markdown, title) => {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  const match = markdown.match(re);
  return match ? match[1].trim() : "";
};
const getBulletValue = (block, label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`-\\s*${escaped}\\s*:\\s*(.+)`, "i");
  const match = block.match(re);
  return match ? match[1].trim() : "";
};
const findLocalAssetPath = (text) => {
  const match = String(text || "").match(/(?:^|[\s`])(assets\/[A-Za-z0-9._/-]+)(?:$|[\s`])/m);
  return match ? match[1] : "";
};

if (manifestBlogAssets.length > 0) {
  const duplicateManifestPreviewPaths = manifestBlogAssets
    .map((entry) => String(entry?.canonicalPreviewPath || ""))
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) !== index);
  if (duplicateManifestPreviewPaths.length > 0) {
    failures.push(`duplicate canonicalPreviewPath in manifest blog assets: ${Array.from(new Set(duplicateManifestPreviewPaths)).join(", ")}`);
  }

  const sortedByTime = [...(activeManifestBlogAssets.length > 0 ? activeManifestBlogAssets : manifestBlogAssets)].sort(
    (a, b) => new Date(b?.updatedAt || 0).getTime() - new Date(a?.updatedAt || 0).getTime(),
  );
  const candidate = sortedByTime[0];
  if (candidate?.canonicalPreviewPath) {
    latestPreview = path.join(clientDir, candidate.canonicalPreviewPath);
    notes.push(`latest preview used for gate (manifest): ${path.relative(root, latestPreview)}`);
  }
}

const imageOrigins = [];
for (const entry of activeManifestBlogAssets) {
  const sourcePostPath = String(entry?.sourcePostPath || "").trim();
  if (!sourcePostPath) continue;
  const absoluteSourcePostPath = path.resolve(root, sourcePostPath);
  if (!fs.existsSync(absoluteSourcePostPath)) continue;
  const markdown = fs.readFileSync(absoluteSourcePostPath, "utf8");
  const featuredImage = getSection(markdown, "Featured Image");
  const featuredImageSourceSearch = getSection(markdown, "Featured Image Source Search");
  const localAssetPath =
    findLocalAssetPath(getBulletValue(featuredImage, "Asset")) ||
    findLocalAssetPath(getBulletValue(featuredImage, "Implementation note")) ||
    findLocalAssetPath(getBulletValue(featuredImageSourceSearch, "Local asset path"));
  const sourcePage = String(getBulletValue(featuredImageSourceSearch, "Source page") || "").trim();
  imageOrigins.push({
    assetId: String(entry?.assetId || "").trim(),
    localAssetPath,
    sourcePage,
    sourcePostPath,
  });
}

const duplicateLocalAssets = imageOrigins
  .filter((entry) => entry.localAssetPath)
  .filter((entry, index, arr) => arr.findIndex((item) => item.localAssetPath === entry.localAssetPath) !== index);
if (duplicateLocalAssets.length > 0) {
  const grouped = Array.from(new Set(duplicateLocalAssets.map((entry) => entry.localAssetPath))).map((assetPath) => {
    const ids = imageOrigins.filter((entry) => entry.localAssetPath === assetPath).map((entry) => entry.assetId);
    return `${assetPath} -> ${ids.join(", ")}`;
  });
  failures.push(`duplicate featured-image local asset across active blog assets: ${grouped.join(" | ")}`);
}

const duplicateSourcePages = imageOrigins
  .filter((entry) => /^https?:\/\//i.test(entry.sourcePage))
  .filter((entry, index, arr) => arr.findIndex((item) => item.sourcePage === entry.sourcePage) !== index);
if (duplicateSourcePages.length > 0) {
  const grouped = Array.from(new Set(duplicateSourcePages.map((entry) => entry.sourcePage))).map((sourcePage) => {
    const ids = imageOrigins.filter((entry) => entry.sourcePage === sourcePage).map((entry) => entry.assetId);
    return `${sourcePage} -> ${ids.join(", ")}`;
  });
  failures.push(`duplicate featured-image source page across active blog assets: ${grouped.join(" | ")}`);
}

if (!latestPreview && previewCandidates.length > 0) {
  latestPreview = previewCandidates
    .map((file) => ({ file, mtime: fs.statSync(file).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0].file;
  notes.push(`latest preview used for gate (fallback): ${path.relative(root, latestPreview)}`);
}

let imagePath = null;
let dimensions = null;
let previewVisibleWords = null;
if (latestPreview) {
  const html = fs.readFileSync(latestPreview, "utf8");
  if (/####\s+H3:|####\s+/.test(html)) {
    failures.push("preview exposes raw H3 markdown heading markers");
  }
  previewVisibleWords = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  if (previewVisibleWords < previewVisibleMin) {
    failures.push(
      `preview visible word count below minimum (${previewVisibleWords} < ${previewVisibleMin})`,
    );
  }
  const imgMatch = html.match(/<img[^>]+src="([^"]+)"/i);
  if (!imgMatch) {
    failures.push("preview missing <img src=...> featured image");
  } else {
    const imageSrc = imgMatch[1];
    if (/^https?:\/\//i.test(imageSrc)) {
      failures.push("preview featured image uses remote URL; expected local canonical asset");
    } else {
      imagePath = path.resolve(path.dirname(latestPreview), imageSrc);
      if (!fs.existsSync(imagePath)) {
        failures.push(`preview referenced image does not exist: ${imagePath}`);
      }
    }
  }
}

const markdownWords = Number(contractResult?.wordCount ?? 0);
const postPath = path.join(root, "squads", "social-growth", "output", client, "blog", "blog-post.md");
let editorialWords = markdownWords;
if (fs.existsSync(postPath)) {
  const post = fs.readFileSync(postPath, "utf8");
  const getSection = (title) => {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
    const match = post.match(re);
    return match ? match[1] : "";
  };
  const editorialBlock = [getSection("Intro"), getSection("Body"), getSection("FAQ"), getSection("Conclusion")]
    .join("\n")
    .replace(/`[^`]*`/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ");
  const counted = editorialBlock.split(/\s+/).filter(Boolean).length;
  if (counted > 0) {
    editorialWords = counted;
  }
}

if (editorialWords > 0 && Number.isFinite(previewVisibleWords)) {
  const ratio = previewVisibleWords / editorialWords;
  if (ratio < previewToMarkdownRatioMin) {
    failures.push(
      `preview/editorial text ratio below threshold (${ratio.toFixed(2)} < ${previewToMarkdownRatioMin})`,
    );
  }
}

if (imagePath && fs.existsSync(imagePath)) {
  const identify = spawnSync("identify", ["-format", "%w %h", imagePath], { encoding: "utf8" });
  if (identify.status !== 0) {
    failures.push(`could not inspect preview image dimensions: ${identify.stderr || "identify failed"}`);
  } else {
    const [w, h] = (identify.stdout || "").trim().split(/\s+/).map(Number);
    if (!Number.isFinite(w) || !Number.isFinite(h)) {
      failures.push("invalid dimensions returned by identify");
    } else {
      dimensions = { width: w, height: h };
      const ratioOk = w * 9 === h * 16;
      const minSizeOk = w >= 1200 && h >= 675;
      if (!ratioOk) failures.push(`preview featured image is not 16:9 (${w}x${h})`);
      if (!minSizeOk) failures.push(`preview featured image below minimum 1200x675 (${w}x${h})`);
    }
  }
}

const campaignHubPath = path.join(root, "squads", "social-growth", "output", client, "review", "campaign-hub.html");
if (!fs.existsSync(campaignHubPath)) {
  failures.push(`campaign hub missing: ${campaignHubPath}`);
} else if (manifestBlogAssets.length > 0) {
  if (latestPreview) {
    const hubMtime = fs.statSync(campaignHubPath).mtimeMs;
    const previewMtime = fs.statSync(latestPreview).mtimeMs;
    if (hubMtime < previewMtime) {
      failures.push("campaign hub is older than latest canonical preview");
    }
  }
  const backlogPath = path.join(clientDir, "editorial-backlog.md");
  let plannedBlogIds = [];
  if (fs.existsSync(backlogPath)) {
    plannedBlogIds = fs
      .readFileSync(backlogPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => /^\|/.test(line))
      .map((line) => line.split("|").map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 9 && /^AC-\d{2}-\d{2}[a-z]?$/i.test(cells[1]) && /^Blog$/i.test(cells[4]))
      .map((cells) => cells[1].toUpperCase());
  }
  const hubHtml = fs.readFileSync(campaignHubPath, "utf8");
  const previewLinks = Array.from(
    hubHtml.matchAll(/<a[^>]+class="[^"]*\bcard-preview-link\b[^"]*"[^>]+href="([^"]+)"/gi),
  ).map((match) => match[1]);
  const duplicateHubLinks = previewLinks.filter((value, index, arr) => arr.indexOf(value) !== index);
  if (duplicateHubLinks.length > 0) {
    failures.push(`duplicate canonical preview href in campaign hub: ${Array.from(new Set(duplicateHubLinks)).join(", ")}`);
  }
  const expectedBlogLinks = (activeManifestBlogAssets.length > 0 ? activeManifestBlogAssets : manifestBlogAssets)
    .filter((entry) => {
      const id = String(entry?.assetId || "").toUpperCase();
      return plannedBlogIds.length === 0 ? true : plannedBlogIds.includes(id);
    })
    .map((entry) => String(entry?.canonicalPreviewPath || "").trim())
    .filter(Boolean)
    .map((relativePath) => path.posix.join("..", relativePath.replace(/\\/g, "/")));
  const missingInHub = expectedBlogLinks.filter((href) => !previewLinks.includes(href));
  if (missingInHub.length > 0) {
    failures.push(`campaign hub missing blog links declared in manifest: ${missingInHub.join(", ")}`);
  }
  if (plannedBlogIds.length > 0) {
    const missingPlannedCards = plannedBlogIds.filter((id) => !hubHtml.includes(`${id} ·`));
    if (missingPlannedCards.length > 0) {
      failures.push(`campaign hub missing planned blog cards: ${missingPlannedCards.join(", ")}`);
    }
  }
}

const result = {
  ok: failures.length === 0,
  client,
  latestPreview: latestPreview ? path.relative(root, latestPreview) : null,
  manifestPath: fs.existsSync(manifestPath) ? path.relative(root, manifestPath) : null,
  previewVisibleWords,
  featuredImage: imagePath ? path.relative(root, imagePath) : null,
  dimensions,
  contractValidationStatus: contractValidation.status,
  contractValidation: contractResult,
  socialAlignmentStatus: alignmentValidation.status,
  socialAlignment: alignmentResult,
  planningAlignmentStatus: planningAlignmentValidation.status,
  planningAlignment: planningAlignmentResult,
  editorialWords,
  notes,
  failures,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
