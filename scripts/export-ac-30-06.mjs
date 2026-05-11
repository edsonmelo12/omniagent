import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const projectRoot = '/home/edsonrmjunior/Local Sites/omniagent';
const htmlPath = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/previews/ac-30-06-v5.html');
const outDir = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/publish/ac-30-06');
const baseName = 'ac-30-06';

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Use exact viewport
  await page.setViewportSize({ width: 1080, height: 1350 });
  
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.waitForSelector('.carousel');
  await page.waitForTimeout(500);
  
  // Verify dimensions
  const actualSize = await page.evaluate(() => {
    const el = document.querySelector('.carousel');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  console.log('Actual carousel size:', actualSize);
  
  // Capture each slide
  const slideCount = await page.evaluate(() => {
    return document.querySelectorAll('.slide').length;
  });
  
  console.log(`Found ${slideCount} slides`);
  
  for (let i = 0; i < slideCount; i++) {
    // Slide to slide i
    const offset = -(i * (100 / slideCount)) + '%';
    await page.evaluate((off) => {
      const wrapper = document.querySelector('.wrapper');
      if (wrapper) wrapper.style.transform = `translateX(${off})`;
    }, offset);
    
    await page.waitForTimeout(300);
    
    const carousel = await page.$('.carousel');
    if (!carousel) {
      console.error(`Carousel not found for slide ${i + 1}`);
      continue;
    }
    
    const outPath = path.join(outDir, `${baseName}-${String(i + 1).padStart(2, '0')}.png`);
    await carousel.screenshot({ path: outPath, type: 'png' });
    console.log(`Exported: ${outPath}`);
  }
  
  await browser.close();
  
  console.log('Done: AC-30-06 Carousel exported at 1080x1350');
})();
