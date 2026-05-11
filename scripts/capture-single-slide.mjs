import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const rootDir = '/home/edsonrmjunior/Local Sites/omniagent';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

  const filePath = path.join(rootDir, 'squads/social-growth/output/amiclube/social/previews/ac-30-18-carousel-v2.html');
  const outDir = path.join(rootDir, 'squads/social-growth/output/amiclube/social/exports/ac-30-18');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('[R] Loading AC-30-18 V2...');
  await page.goto('file://' + filePath);
  await page.waitForTimeout(1500);

  // Navigate to slide 6 (index 5, 0-based)
  const slideIndex = 5;
  await page.evaluate(({ idx, total }) => {
    const w = document.getElementById('wrapper');
    if (w) {
      const slidePct = 100 / total;
      w.style.transition = 'none';
      w.style.transform = `translateX(-${idx * slidePct}%)`;
    }
    const p = document.getElementById('progress');
    if (p) p.style.width = `${((idx + 1) / total) * 100}%`;
  }, { idx: slideIndex, total: 8 });
  
  await page.waitForTimeout(500);

  const outPath = path.join(outDir, 'AC-30-18-v2-slide-6.jpg');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`[R] Slide 6 captured: ${outPath}`);

  await browser.close();
}

capture().catch(e => { console.error(e); process.exit(1); });