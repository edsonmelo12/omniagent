import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const projectRoot = process.argv[2] || '.';
const htmlPath = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/previews/ac-30-03-reels-v2.html');
const outDir = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/publish/ac-30-03');
const baseName = 'ac-30-03';

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const fileUrl = 'file://' + htmlPath;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for frames to render
  await page.waitForSelector('.frame-container');

  // Set viewport to 1080x1920
  await page.setViewportSize({ width: 1080, height: 1920 });

  // Wait for resize
  await page.waitForTimeout(500);

  // Force frame-container to exact 1080x1920 (override CSS constraints with !important)
  await page.evaluate(() => {
    const container = document.querySelector('.frame-container');
    if (container) {
      container.style.setProperty('width', '1080px', 'important');
      container.style.setProperty('height', '1920px', 'important');
      container.style.setProperty('max-width', '1080px', 'important');
      container.style.setProperty('min-width', '1080px', 'important');
      container.style.setProperty('border', 'none', 'important');
      container.style.setProperty('border-radius', '0', 'important');
      container.style.setProperty('margin', '0', 'important');
      container.style.setProperty('aspect-ratio', 'auto', 'important');
    }
    
    // Also fix body/html
    document.body.style.setProperty('margin', '0', 'important');
    document.body.style.setProperty('padding', '0', 'important');
    document.documentElement.style.setProperty('margin', '0', 'important');
    document.documentElement.style.setProperty('padding', '0', 'important');
  });

  await page.waitForTimeout(300);

  // Capture each frame
  const frameCount = await page.evaluate(() => {
    return document.querySelectorAll('.frame').length;
  });

  console.log(`Found ${frameCount} frames`);

  for (let i = 0; i < frameCount; i++) {
    // Slide to frame i
    const offset = -(i * 100) + '%';
    await page.evaluate((off) => {
      const wrapper = document.querySelector('.frame-wrapper');
      if (wrapper) wrapper.style.transform = `translateX(${off})`;
    }, offset);

    await page.waitForTimeout(300);

    // Capture the frame-container with exact clip
    const frameContainer = await page.$('.frame-container');
    if (!frameContainer) {
      console.error(`Frame container not found for frame ${i + 1}`);
      continue;
    }

    // Get bounding box and screenshot with clip
    const box = await frameContainer.boundingBox();
    if (!box) {
      console.error(`Could not get bounding box for frame ${i + 1}`);
      continue;
    }

    const outPath = path.join(outDir, `${baseName}-${String(i + 1).padStart(2, '0')}.png`);
    
    // Take screenshot clipped to exact 1080x1920
    await page.screenshot({
      path: outPath,
      clip: { x: box.x, y: box.y, width: 1080, height: 1920 },
      type: 'png'
    });
    console.log(`Exported: ${outPath}`);
  }

  await browser.close();
  console.log('Done: AC-30-03 Reels exported at 1080x1920');
})();
