#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const htmlPath = args[0] || process.cwd();
const outDir = args[1] || path.join(process.cwd(), 'export');
const vpWidth = parseInt(args[2], 10) || 1080;
const vpHeight = parseInt(args[3], 10) || 1350;
const outputPrefix = path.basename(htmlPath, path.extname(htmlPath));

const TRACK_IDS = ['carouselTrack', 'reelsTrack', 'storiesTrack'];

async function exportSlides() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: vpWidth, height: vpHeight },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'networkidle' });

  await page.addStyleTag({ content: 'body.export-mode { display: block !important; }' });
  await page.evaluate(() => document.body.classList.add('export-mode'));

  await page.waitForTimeout(500);

  const { total, trackId } = await page.evaluate((ids) => {
    for (const id of ids) {
      const track = document.getElementById(id);
      if (track) return { total: track.children.length, trackId: id };
    }
    return { total: 0, trackId: null };
  }, TRACK_IDS);

  fs.mkdirSync(outDir, { recursive: true });

  const slideDim = await page.evaluate(({ tId, fallbackWidth, fallbackHeight }) => {
    const track = document.getElementById(tId);
    if (!track || !track.children[0]) return { w: fallbackWidth, dir: 'x' };
    const slide = track.children[0];
    const dir = getComputedStyle(track).flexDirection === 'column' ? 'y' : 'x';
    return { w: dir === 'x' ? slide.offsetWidth : slide.offsetHeight, dir };
  }, { tId: trackId, fallbackWidth: vpWidth, fallbackHeight: vpHeight });
  const slideWidth = slideDim.w;
  const isHorizontal = slideDim.dir === 'x';

  const expected = isHorizontal ? vpWidth : vpHeight;
  if (Math.abs(slideWidth - expected) > 2) {
    console.warn(`⚠  AVISO: slide ${isHorizontal ? 'width' : 'height'} (${slideWidth}px) difere do viewport ${expected}px — export pode mostrar slides adjacentes`);
    console.warn(`   Verifique CSS export-mode: slide precisa de width/min-width/max-width fixos + overflow:hidden`);
  }

  for (let i = 0; i < total; i++) {
    const axis = isHorizontal ? 'X' : 'Y';
    await page.evaluate(({ px, ax, tId }) => {
      const track = document.getElementById(tId);
      if (track) track.style.transform = `translate${ax}(${px}px)`;
    }, { px: -i * slideWidth, ax: axis, tId: trackId });

    await page.waitForTimeout(200);

    const filePath = path.join(outDir, `${outputPrefix}-${String(i + 1).padStart(2, '0')}.png`);
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
