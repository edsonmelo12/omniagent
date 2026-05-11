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
const postPathArg = readArg("post");

if (!client) {
  console.error("Usage: node validate-blog-contract.mjs --client <client-slug> [--post <blog-post-path>]");
  process.exit(2);
}

const root = process.cwd();
const contractPath = path.join(root, "squads", "social-growth", "pipeline", "data", "blog-output-contract.json");
const defaultPostPath = path.join(
  root,
  "squads",
  "social-growth",
  "output",
  client,
  "blog",
  "blog-post.md",
);
const postPath = postPathArg ? path.resolve(root, postPathArg) : defaultPostPath;

const failures = [];
const notes = [];

if (!fs.existsSync(contractPath)) {
  failures.push(`missing contract file: ${contractPath}`);
}

if (!fs.existsSync(postPath)) {
  failures.push(`missing blog post file: ${postPath}`);
}

if (failures.length > 0) {
  console.log(JSON.stringify({ ok: false, client, postPath, failures }, null, 2));
  process.exit(1);
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const markdown = fs.readFileSync(postPath, "utf8");
const findSection = (title) => {
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
const includesForbiddenImagePlaceholder = (text) =>
  /\[imagem\s*:|prompt\s+para\s+gerar|gere\s+uma\s+imagem|imagem\s+conceitual|placeholder\s+de\s+imagem|midjourney|dall-e|stable\s+diffusion/i.test(
    text,
  );

const wordCount = markdown
  .replace(/`[^`]*`/g, " ")
  .replace(/[^\p{L}\p{N}\s-]/gu, " ")
  .split(/\s+/)
  .filter(Boolean).length;

const requiredSections = Array.isArray(contract.required_sections) ? contract.required_sections : [];
const missingSections = requiredSections.filter((section) => {
  const re = new RegExp(`^##\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
  return !re.test(markdown);
});

if (missingSections.length > 0) {
  failures.push(`missing required sections: ${missingSections.join(", ")}`);
}

const targetRangeMatch = markdown.match(/##\s+Word Count Target[\s\S]*?(\d{3,4})\s*[-–]\s*(\d{3,4})/i);
const targetMin = targetRangeMatch
  ? Number(targetRangeMatch[1])
  : Number(contract.word_count?.default_min ?? 1200);
const targetMax = targetRangeMatch
  ? Number(targetRangeMatch[2])
  : Number(contract.word_count?.default_max ?? 1600);
const absoluteMinReject = Number(contract.word_count?.absolute_min_reject ?? 900);

if (wordCount < absoluteMinReject) {
  failures.push(`word count below hard minimum (${wordCount} < ${absoluteMinReject})`);
} else if (wordCount < targetMin || wordCount > targetMax) {
  failures.push(`word count out of target range (${wordCount} not in ${targetMin}-${targetMax})`);
}

const skillEvidenceMatch = markdown.match(
  /##\s+Skill Execution Evidence\s*([\s\S]*?)(\n##\s+|$)/i,
);
if (!skillEvidenceMatch || skillEvidenceMatch[1].trim().length < 20) {
  failures.push("missing or empty `Skill Execution Evidence` section");
}

if (!/##\s+Featured Image Source Search/i.test(markdown)) {
  failures.push("missing `Featured Image Source Search` section");
}

if (!/##\s+Featured Image Selection Criteria/i.test(markdown)) {
  failures.push("missing `Featured Image Selection Criteria` section");
}

const featuredImageBlock = findSection("Featured Image");
const featuredImageSourceBlock = findSection("Featured Image Source Search");

if (includesForbiddenImagePlaceholder(featuredImageBlock) || includesForbiddenImagePlaceholder(featuredImageSourceBlock)) {
  failures.push("featured-image sections contain prompt/generative placeholder language");
}

const implementationNote = getBulletValue(featuredImageBlock, "Implementation note");
const explicitAsset = getBulletValue(featuredImageBlock, "Asset");
const localAssetRefMatch = `${explicitAsset}\n${implementationNote}`.match(/(?:^|[\s`])(assets\/[A-Za-z0-9._/-]+)(?:$|[\s`])/m);
if (!localAssetRefMatch) {
  failures.push("featured image missing local asset path under `assets/`");
}

const sourcePage = getBulletValue(featuredImageSourceBlock, "Source page");
if (!/^https?:\/\//i.test(sourcePage)) {
  failures.push("featured-image source search missing real `Source page` URL");
}

if (!getBulletValue(featuredImageSourceBlock, "Chosen source")) {
  failures.push("featured-image source search missing `Chosen source`");
}

if (!getBulletValue(featuredImageSourceBlock, "License note")) {
  failures.push("featured-image source search missing `License note`");
}

if (!/\b\d{4}-\d{2}-\d{2}\b/.test(getBulletValue(featuredImageSourceBlock, "License check date"))) {
  failures.push("featured-image source search missing valid `License check date`");
}

const localAssetSourceRef = getBulletValue(featuredImageSourceBlock, "Local asset path");
if (localAssetSourceRef && !/^assets\//i.test(localAssetSourceRef)) {
  failures.push("`Local asset path` must point to an `assets/` file");
}

notes.push(`evaluated against contract version ${contract.version ?? "unknown"}`);

const result = {
  ok: failures.length === 0,
  client,
  postPath,
  wordCount,
  targetRange: `${targetMin}-${targetMax}`,
  missingSections,
  notes,
  failures,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
