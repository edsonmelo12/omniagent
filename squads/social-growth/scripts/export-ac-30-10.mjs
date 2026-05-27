#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const ASSET_ID = "ac-30-10";
const PREVIEW_PATH = "output/amiclube/social/previews/ac-30-10-v4-editorial-myth-carousel.html";
const PUBLISH_DIR = `output/amiclube/social/publish/${ASSET_ID}`;
const EXPORT_W = 1080;
const EXPORT_H = 1350;

async function main() {
  const absPreview = path.join(ROOT, PREVIEW_PATH);
  if (!fs.existsSync(absPreview)) {
    console.error(`Preview not found: ${absPreview}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(ROOT, PUBLISH_DIR), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    viewport: { width: EXPORT_W, height: EXPORT_H },
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${absPreview}`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);

  const slideCount = await page.evaluate(() => document.querySelectorAll(".slide").length);
  console.log(`Found ${slideCount} slides`);

  for (let i = 0; i < slideCount; i++) {
    await page.evaluate(
      ({ idx, w, h }) => {
        const track = document.querySelector(".carousel-track");
        if (track) {
          track.style.transition = "none";
          track.style.transform = `translateX(-${idx * w}px)`;
        }
      },
      { idx: i, w: EXPORT_W, h: EXPORT_H }
    );

    await page.waitForTimeout(1500);

    const fileName = `${ASSET_ID}-${String(i + 1).padStart(2, "0")}.png`;
    const outPath = path.join(ROOT, PUBLISH_DIR, fileName);

    await page.screenshot({ path: outPath, type: "png", clip: { x: 0, y: 0, width: EXPORT_W, height: EXPORT_H } });

    const stats = fs.statSync(outPath);
    console.log(`  Slide ${i + 1}: ${fileName} (${(stats.size / 1024).toFixed(0)} KB)`);
  }

  await browser.close();
  console.log(`\nDone: ${slideCount} PNGs exported to ${PUBLISH_DIR}/`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});