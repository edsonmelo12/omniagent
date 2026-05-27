#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function loadJson(filePath) {
  return JSON.parse(readText(filePath));
}

function findExportedPngs(clientDir, assetId) {
  const assetSlug = slug(assetId);
  const publishDir = path.join(clientDir, "social", "publish");

  if (!fs.existsSync(publishDir)) return [];

  // Try direct slug match first
  const direct = path.join(publishDir, assetSlug);
  if (fs.existsSync(direct)) {
    return fs.readdirSync(direct)
      .filter((f) => f.endsWith(".png"))
      .sort()
      .map((f) => path.join(direct, f).replace(/\\/g, "/"));
  }

  // Fallback: scan all dirs and match slug prefix
  const entries = fs.readdirSync(publishDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());
  for (const entry of entries) {
    if (slug(entry.name) === assetSlug || slug(entry.name).startsWith(assetSlug)) {
      const files = fs.readdirSync(path.join(publishDir, entry.name))
        .filter((f) => f.endsWith(".png"))
        .sort()
        .map((f) => path.join(publishDir, entry.name, f).replace(/\\/g, "/"));
      if (files.length > 0) return files;
    }
  }

  return [];
}

function generateOne(manifest) {
  const composePath = path.join(rootDir, "engine", "compose.mjs");
  const outDir = path.join(manifest._clientDir, "social", "previews");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${slug(manifest.asset_id)}-post-preview.html`);

  const tmpManifest = {
    asset_id: manifest.asset_id,
    client: manifest.client,
    format: "post-preview",
    caption_source: "social-final-captions",
    asset_caption_id: manifest.asset_id,
    exported_images: manifest.exported_images,
    channel: manifest.channel || "",
    objective: manifest.objective || "",
    title: manifest.title || manifest.asset_id,
  };

  const tmpManifestPath = path.join(outDir, `${slug(manifest.asset_id)}-post-preview-manifest.json`);
  fs.writeFileSync(tmpManifestPath, JSON.stringify(tmpManifest, null, 2), "utf8");

  const result = spawnSync("node", [
    composePath,
    "--manifest", tmpManifestPath,
    "--format", "post-preview",
    "--out", outFile,
  ], { cwd: process.cwd(), encoding: "utf8" });

  return { outFile, stdout: result.stdout, stderr: result.stderr, status: result.status };
}

function main() {
  const args = parseArgs(process.argv);
  const client = args.client || "amiclube";
  const clientDir = path.resolve(process.cwd(), "squads", "social-growth", "output", client);
  const captionsPath = path.join(clientDir, "publishing", "social-final-captions.json");
  const campaignManifestPath = path.join(clientDir, "review", "campaign-manifest.json");

  if (!fs.existsSync(captionsPath)) {
    console.error(`social-final-captions.json not found: ${captionsPath}`);
    process.exit(1);
  }

  const captionsData = loadJson(captionsPath);
  const captions = captionsData.captions || [];
  const campaignManifest = fs.existsSync(campaignManifestPath) ? loadJson(campaignManifestPath) : null;

  const objectiveByAsset = new Map();
  if (campaignManifest?.assets?.social) {
    for (const asset of campaignManifest.assets.social) {
      if (asset?.assetId && asset?.objective) {
        objectiveByAsset.set(asset.assetId, asset.objective);
      }
    }
  }

  const results = [];
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of captions) {
    const assetId = entry.asset_id;
    const exportedImages = findExportedPngs(clientDir, assetId);

    if (exportedImages.length === 0) {
      console.log(`SKIP ${assetId}: no PNGs in social/publish/${assetId}/`);
      skipped += 1;
      continue;
    }

    try {
      const result = generateOne({
        asset_id: assetId,
        client,
        exported_images: exportedImages,
        channel: entry.channel || "",
        objective: objectiveByAsset.get(assetId) || entry.objective || entry.format || "",
        title: entry.first_line_hook || assetId,

        _clientDir: clientDir,
      });

      if (result.status === 0) {
        console.log(`OK  ${assetId}: ${path.basename(result.outFile)} (${exportedImages.length} slides)`);
        generated += 1;
        results.push({ asset_id: assetId, status: "generated", path: result.outFile, slides: exportedImages.length });
      } else {
        const errMsg = (result.stderr || "").trim();
        console.log(`FAIL ${assetId}: ${errMsg}`);
        failed += 1;
        results.push({ asset_id: assetId, status: "failed", error: errMsg });
      }
    } catch (err) {
      console.log(`FAIL ${assetId}: ${err.message}`);
      failed += 1;
      results.push({ asset_id: assetId, status: "failed", error: err.message });
    }
  }

  console.log(`\nSummary: ${generated} generated, ${skipped} skipped, ${failed} failed / ${captions.length} total`);

  const reportPath = path.join(clientDir, "social", "previews", "post-preview-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    client,
    summary: { generated, skipped, failed, total: captions.length },
    results,
  }, null, 2), "utf8");
  console.log(`Report: ${reportPath}`);
}

main();
