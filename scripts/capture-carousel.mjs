import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const rootDir = '/home/edsonrmjunior/Local Sites/omniagent';

const carousels = [
  {
    name: 'AC-30-03',
    previewPath: 'squads/social-growth/output/amiclube/social/previews/ac-30-03-reels-frames.html',
    outputDir: 'squads/social-growth/output/amiclube/social/exports/ac-30-03',
    isReels: true
  }
];

async function captureCarousel(c) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

  const filePath = path.join(rootDir, c.previewPath);
  const outDir = path.join(rootDir, c.outputDir);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n[C] Loading ${c.name}...`);
  await page.goto('file://' + filePath);
  await page.waitForTimeout(1500);

  // Get slide count
  const slideCount = await page.evaluate(() => {
    const w = document.getElementById('wrapper');
    if (!w) return 5;
    return w.querySelectorAll('.slide').length;
  });
  console.log(`[C] ${slideCount} slides found`);

  // Capture each slide
  for (let i = 0; i < slideCount; i++) {
    await page.evaluate(({ idx, total }) => {
      const w = document.getElementById('wrapper');
      if (w) {
        const slidePct = 100 / total;
        w.style.transition = 'none';
        w.style.transform = `translateX(-${idx * slidePct}%)`;
      }
      const p = document.getElementById('progress');
      if (p) p.style.width = `${((idx + 1) / total) * 100}%`;
    }, { idx: i, total: slideCount });
    await page.waitForTimeout(400);

    const outPath = path.join(outDir, `${c.name}-slide-${i + 1}.jpg`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`[C] ${c.name} slide ${i + 1}/${slideCount}`);
  }

  await browser.close();
}

async function run() {
  for (const c of carousels) {
    await captureCarousel(c);
  }
  console.log('\n✓ All carousels captured');
}

run().catch(e => { console.error(e); process.exit(1); });