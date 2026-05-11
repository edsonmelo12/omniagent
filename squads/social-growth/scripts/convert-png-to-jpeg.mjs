#!/usr/bin/env node
// Convert exported PNG assets to JPEG for Instagram compatibility
// 
// Usage: node convert-png-to-jpeg.mjs --client <client-slug> [--quality 95]

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx === -1 ? null : args[idx + 1] ?? null;
};

const client = getArg("--client");
if (!client) {
  console.error("Usage: node convert-png-to-jpeg.mjs --client <client-slug> [--quality 95]");
  process.exit(1);
}

const quality = parseInt(getArg("--quality") || "95", 10);
const root = process.cwd();

// Directories to scan for PNG files
const searchDirs = [
  path.join(root, "squads", "social-growth", "output", client, "social", "exports"),
  path.join(root, "squads", "social-growth", "output", client, "publishing", "exports"),
];

function findAllPngs(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findAllPngs(fullPath));
    } else if (entry.name.endsWith(".png")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function convertPngToJpeg(pngPath, quality_) {
  const jpegPath = pngPath.replace(/\.png$/i, ".jpg");
  
  // Try sharp first (best quality)
  try {
    const sharp = await import("sharp").catch(() => null);
    if (sharp) {
      await sharp.default(pngPath)
        .jpeg({ quality: quality_ })
        .toFile(jpegPath);
      return { png: pngPath, jpeg: jpegPath, method: "sharp", size: fs.statSync(jpegPath).size };
    }
  } catch {
    // Fall through
  }

  // Fallback: copy as-is with extension change (not ideal but preserves file)
  // This avoids dependency on sharp being installed
  try {
    const { execSync } = await import("node:child_process");
    execSync(`convert "${pngPath}" -quality ${quality_} "${jpegPath}"`, { stdio: "ignore" });
    return { png: pngPath, jpeg: jpegPath, method: "imagemagick", size: fs.statSync(jpegPath).size };
  } catch {
    // Fall through
  }

  // Last resort: copy the PNG as .jpg (Instagram may reject but better than nothing)
  fs.copyFileSync(pngPath, jpegPath);
  return { png: pngPath, jpeg: jpegPath, method: "copy", size: fs.statSync(jpegPath).size, warning: "PNG copied as JPEG — install sharp for proper conversion" };
}

async function main() {
  let allPngs = [];
  for (const dir of searchDirs) {
    allPngs.push(...findAllPngs(dir));
  }

  if (allPngs.length === 0) {
    console.log(JSON.stringify({ status: "OK", client, converted: 0, message: "No PNG files found" }));
    return;
  }

  const results = await Promise.all(allPngs.map((p) => convertPngToJpeg(p, quality)));
  const succeeded = results.filter((r) => r);

  // Remove PNG originals after successful conversion
  for (const r of succeeded) {
    try { fs.unlinkSync(r.png); } catch { /* keep the PNG if delete fails */ }
  }

  console.log(
    JSON.stringify(
      {
        status: "OK",
        client,
        quality,
        converted: succeeded.length,
        files: succeeded.map((r) => ({
          input: path.relative(root, r.png),
          output: path.relative(root, r.jpeg),
          method: r.method,
          sizeBytes: r.size,
          warning: r.warning || null,
        })),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
