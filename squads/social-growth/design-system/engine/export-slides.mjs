#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const htmlPath = args[0] || process.cwd();
const outDir = args[1] || path.join(process.cwd(), 'export');

async function exportSlides() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'networkidle' });

  await page.addStyleTag({ content: 'body.export-mode { display: block !important; }' });
  await page.evaluate(() => document.body.classList.add('export-mode'));

  await page.waitForTimeout(500);

  const total = await page.evaluate(() => {
    const track = document.getElementById('carouselTrack');
    if (!track) return 0;
    return track.children.length;
  });

  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < total; i++) {
    await page.evaluate((index) => {
      const track = document.getElementById('carouselTrack');
      if (track) track.style.transform = `translateX(-${index * 100}%)`;
    }, i);

    await page.waitForTimeout(200);

    const filePath = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Exported: ${filePath}`);
  }

  await browser.close();
  console.log('Done!');
}

exportSlides().catch((err) => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
