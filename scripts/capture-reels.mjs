import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const rootDir = '/home/edsonrmjunior/Local Sites/omniagent';

const reels = [
  {
    name: 'AC-30-17',
    previewPath: 'squads/social-growth/output/amiclube/social/previews/ac-30-17-carousel-v2.html',
    outputDir: 'squads/social-growth/output/amiclube/social/exports/ac-30-17'
  },
  {
    name: 'AC-30-18',
    previewPath: 'squads/social-growth/output/amiclube/social/previews/ac-30-18-carousel-v2.html',
    outputDir: 'squads/social-growth/output/amiclube/social/exports/ac-30-18'
  }
];

async function captureReels(r) {
  const browser = await chromium.launch({ headless: true });
  // Carousel aspect ratio 4:5 portrait (1080x1350)
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

  const filePath = path.join(rootDir, r.previewPath);
  const outDir = path.join(rootDir, r.outputDir);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n[R] Loading ${r.name}...`);
  await page.goto('file://' + filePath);
  await page.waitForTimeout(1500);

  // Get slide count from the wrapper
  const slideCount = await page.evaluate(() => {
    const w = document.getElementById('wrapper');
    if (!w) return 5;
    // Check for .slide elements (carousel) or .frame (reels)
    const slides = w.querySelectorAll('.slide');
    const frames = w.querySelectorAll('.frame');
    return slides.length || frames.length || 5;
  });
  console.log(`[R] ${slideCount} frames found`);

  // Capture each frame
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
    await page.waitForTimeout(500);

    const outPath = path.join(outDir, `${r.name}-v2-slide-${i + 1}.jpg`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`[R] ${r.name} frame ${i + 1}/${slideCount}`);
  }

  await browser.close();
}

async function run() {
  for (const r of reels) {
    await captureReels(r);
  }
  console.log('\n✓ All reels captured');
}

run().catch(e => { console.error(e); process.exit(1); });