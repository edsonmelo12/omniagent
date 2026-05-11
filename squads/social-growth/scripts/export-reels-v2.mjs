#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((v) => v === `--${name}`);
  if (index < 0) return fallback;
  return typeof args[index + 1] === "string" && args[index + 1].trim().length > 0 ? args[index + 1].trim() : fallback;
};

const assetId = readArg("asset");
const htmlFile = readArg("html");
const outputDir = readArg("output");
const frameCount = parseInt(readArg("frames", "4"));
const targetW = parseInt(readArg("width", "1080"));
const targetH = parseInt(readArg("height", "1920"));

if (!assetId || !htmlFile || !outputDir) {
  console.error("Usage: node export-reels-v2.mjs --asset AC-30-03 --html <path> --output <dir> [--frames 4] [--width 1080] [--height 1920]");
  process.exit(2);
}

const root = process.cwd();
const htmlPath = path.isAbsolute(htmlFile) ? htmlFile : path.join(root, htmlFile);
const outPath = path.isAbsolute(outputDir) ? outputDir : path.join(root, outputDir);

if (!fs.existsSync(htmlPath)) {
  console.error(`HTML not found: ${htmlPath}`);
  process.exit(1);
}

fs.mkdirSync(outPath, { recursive: true });

console.log(`Exporting ${assetId}: ${frameCount} frames at ${targetW}x${targetH}`);

const cssOverrides = `
  body {
    padding: 0 !important;
    gap: 0 !important;
    background: #0a0f16 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 0 !important;
    min-height: ${targetH}px;
  }
  .shield {
    display: none !important;
  }
  .frame-container {
    width: ${targetW}px !important;
    height: ${targetH}px !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  .frame {
    width: calc(100% / ${frameCount}) !important;
  }
  .frame-wrapper {
    transition: none !important;
  }
  .progress {
    display: none !important;
  }
`;

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (let i = 1; i <= frameCount; i++) {
  console.log(`  Frame ${i}/${frameCount}...`);

  const page = await browser.newPage({
    viewport: { width: targetW, height: targetH },
    deviceScaleFactor: 1,
  });

  try {
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle", timeout: 30000 });
  } catch {
    console.error(`    Page load warning, proceeding anyway`);
  }

  await page.waitForTimeout(1500);

  await page.evaluate((data) => {
    const { frameIdx, total } = data;
    const wrapper = document.getElementById("wrapper");
    if (wrapper) {
      wrapper.style.transform = `translateX(-${((frameIdx - 1) / total) * 100}%)`;
    }
  }, { frameIdx: i, total: frameCount });

  await page.waitForTimeout(300);

  const outFile = path.join(outPath, `${assetId.toLowerCase()}-${String(i).padStart(2, "0")}.png`);

  await page.screenshot({ path: outFile, fullPage: false });

  const info = fs.statSync(outFile);
  console.log(`    → ${outFile} (${(info.size / 1024).toFixed(1)} KB)`);

  await page.close();
}

await browser.close();

console.log(`Done: ${frameCount} frames exported to ${outPath}`);
