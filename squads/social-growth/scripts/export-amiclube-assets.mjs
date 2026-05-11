#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const assets = [
  {
    id: "ac-30-07",
    html: "squads/social-growth/output/amiclube/social/previews/ac-30-07-v4-reels.html",
    output: "squads/social-growth/output/amiclube/social/publish/ac-30-07",
    type: "reels",
    frames: 4,
    width: 1080,
    height: 1920
  },
  {
    id: "ac-30-08",
    html: "squads/social-growth/output/amiclube/social/previews/ac-30-08-instagram-post-estatico.html",
    output: "squads/social-growth/output/amiclube/social/publish/ac-30-08",
    type: "single",
    width: 1080,
    height: 1350
  },
  {
    id: "ac-30-21",
    html: "squads/social-growth/output/amiclube/social/previews/ac-30-21-v4.html",
    output: "squads/social-growth/output/amiclube/social/publish/ac-30-21",
    type: "carousel",
    frames: 7,
    width: 1080,
    height: 1350
  }
];

async function exportAsset(asset) {
  const htmlPath = path.resolve(asset.html);
  const outDir = path.resolve(asset.output);
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ ${asset.id}: HTML not found: ${htmlPath}`);
    return false;
  }
  
  fs.mkdirSync(outDir, { recursive: true });
  
  console.log(`\n📦 Exporting ${asset.id} (${asset.type}) at ${asset.width}x${asset.height}...`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 2160 } });
  
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
  
  // Add export-mode class to body
  await page.evaluate(() => document.body.classList.add("export-mode"));
  
  // Wait for fonts to load
  await page.waitForTimeout(1000);
  
  if (asset.type === "single") {
    // Single frame export
    const clip = { x: 0, y: 0, width: asset.width, height: asset.height };
    await page.screenshot({ 
      path: path.join(outDir, "publish.png"), 
      clip,
      fullPage: false 
    });
    console.log(`✅ ${asset.id}: saved publish.png`);
  } else if (asset.type === "reels" || asset.type === "carousel") {
    // Multi-frame export - one PNG per frame
    for (let i = 0; i < asset.frames; i++) {
      // Navigate to frame i
      const slideW = asset.width;
      await page.evaluate((idx, w) => {
        const track = document.querySelector('.reels-track, .carousel-track');
        if (track) track.style.transform = `translateX(${-idx * w}px)`;
      }, { idx: i, w: slideW });
      
      await page.waitForTimeout(300);
      
      const clip = { x: 0, y: 0, width: asset.width, height: asset.height };
      const frameName = `frame-${String(i + 1).padStart(2, "0")}.png`;
      await page.screenshot({ 
        path: path.join(outDir, frameName), 
        clip,
        fullPage: false 
      });
      console.log(`✅ ${asset.id}: saved ${frameName}`);
    }
  }
  
  await browser.close();
  return true;
}

async function main() {
  console.log("=== Exporting AmiClube Social Assets ===");
  
  let successCount = 0;
  for (const asset of assets) {
    const ok = await exportAsset(asset);
    if (ok) successCount++;
  }
  
  console.log(`\n=== Complete: ${successCount}/${assets.length} assets exported ===`);
  
  if (successCount < assets.length) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Export failed:", err);
  process.exit(1);
});