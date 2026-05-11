#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const assetId = readArg("asset");
const htmlFile = readArg("html");
const outputDir = readArg("output");

if (!assetId || !htmlFile || !outputDir) {
  console.error("Usage: node export-single-v3.mjs --asset <id> --html <path> --output <dir>");
  process.exit(2);
}

const rootDir = process.cwd();
const htmlPath = path.isAbsolute(htmlFile) ? htmlFile : path.join(rootDir, htmlFile);
const outPath = path.join(rootDir, outputDir);

if (!fs.existsSync(htmlPath)) {
  console.error(`HTML not found: ${htmlPath}`);
  process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, "utf8");

const slidesMatch = htmlContent.match(/(\d+)\s+slides?/);
const framesMatch = htmlContent.match(/(\d+)\s+frames?/);
const isSingle = htmlContent.includes("Facebook Post") || !slidesMatch && !framesMatch;

const count = slidesMatch ? parseInt(slidesMatch[1]) : (framesMatch ? parseInt(framesMatch[1]) : 1);

const dimsMatch = htmlContent.match(/(\d+)x(\d+)/);
const width = dimsMatch ? parseInt(dimsMatch[1]) : 1080;
const height = dimsMatch ? parseInt(dimsMatch[2]) : 1350;

console.log(`Exporting ${assetId}: ${count} slides/frames at ${width}x${height}`);

if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath, { recursive: true });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: width, height: height },
  deviceScaleFactor: 2
});

const page = await context.newPage();

for (let i = 1; i <= count; i++) {
  console.log(`  Capturing ${i}/${count}...`);
  await page.goto(`file://${htmlPath}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  
  const canvas = await page.locator(".carousel-wrapper, .reels-wrapper, .post-wrapper").first();
  const canvasBounds = await canvas.boundingBox();
  
  await page.setViewportSize({ width: Math.ceil(canvasBounds.width * 2), height: Math.ceil(canvasBounds.height * 2) });
  
  const outFile = path.join(outPath, `${assetId}-v3-${String(i).padStart(2, "0")}.png`);
  await page.screenshot({ path: outFile, fullPage: false });
  console.log(`    → ${outFile}`);
}

await browser.close();
console.log(`Done: ${outPath}`);