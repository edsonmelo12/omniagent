#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const STRICT_NICHE_FIDELITY_CLIENTS = new Set(["amiclube"]);

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client");
const slug = readArg("slug");

if (!client || !slug) {
  console.error("Usage: node validate-blog-asset.mjs --client <client-slug> --slug <article-slug>");
  process.exit(2);
}

const root = process.cwd();
const blogDir = path.join(root, "squads", "social-growth", "output", client, "blog");
const htmlPath = path.join(blogDir, `${slug}.html`);
const manifestPath = path.join(blogDir, "image-source-manifest.md");

const failures = [];
const notes = [];

const ensureFile = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${filePath}`);
    return false;
  }
  return true;
};

if (!ensureFile(htmlPath, "blog html")) {
  console.log(JSON.stringify({ ok: false, client, slug, failures }, null, 2));
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const imgMatch = html.match(/<img[^>]+src="([^"]+)"/i);
if (!imgMatch) {
  failures.push("featured image missing in html (no <img src=...> found)");
}

let imagePath = null;
if (imgMatch) {
  const imageSrc = imgMatch[1];
  imagePath = path.isAbsolute(imageSrc) ? imageSrc : path.resolve(path.dirname(htmlPath), imageSrc);
  if (!ensureFile(imagePath, "featured image")) {
    imagePath = null;
  }
}

const parseDimensionsWithFileCmd = (filePath) => {
  try {
    const output = execSync(`file "${filePath.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    const all = [...output.matchAll(/(\d+)x(\d+)/g)];
    if (all.length === 0) return null;
    const last = all[all.length - 1];
    return { width: Number(last[1]), height: Number(last[2]), raw: output.trim() };
  } catch (error) {
    failures.push(`failed to inspect image dimensions: ${String(error)}`);
    return null;
  }
};

let dimensions = null;
if (imagePath) {
  dimensions = parseDimensionsWithFileCmd(imagePath);
  if (!dimensions) {
    failures.push("could not determine featured image dimensions");
  } else {
    const { width, height } = dimensions;
    const ratioIs16x9 = width * 9 === height * 16;
    const minSizeOk = width >= 1200 && height >= 675;
    if (!ratioIs16x9) {
      failures.push(`featured image is not 16:9 (got ${width}x${height})`);
    }
    if (!minSizeOk) {
      failures.push(`featured image below minimum size 1200x675 (got ${width}x${height})`);
    }
  }
}

if (!ensureFile(manifestPath, "image source manifest")) {
  console.log(JSON.stringify({ ok: false, client, slug, imagePath, failures }, null, 2));
  process.exit(1);
}

const manifest = fs.readFileSync(manifestPath, "utf8");
const expectCropProfile = /crop profile:\s*blog-hero-16x9/i.test(manifest);
if (!expectCropProfile) {
  failures.push("manifest missing crop profile `blog-hero-16x9`");
}

if (imagePath) {
  const imageName = path.basename(imagePath);
  if (!manifest.includes(imageName)) {
    failures.push(`manifest does not reference featured image file (${imageName})`);
  }
}

const strictNicheMode = STRICT_NICHE_FIDELITY_CLIENTS.has(client.toLowerCase());
if (strictNicheMode) {
  const nichePass = /niche fidelity status:\s*pass/i.test(manifest);
  if (!nichePass) {
    failures.push("strict niche-fidelity client requires `niche fidelity status: pass` in manifest");
  }
  notes.push("strict niche-fidelity mode enabled");
}

const result = {
  ok: failures.length === 0,
  client,
  slug,
  htmlPath,
  imagePath,
  dimensions: dimensions ? { width: dimensions.width, height: dimensions.height } : null,
  notes,
  failures,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
