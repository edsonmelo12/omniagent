import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const projectRoot = '/home/edsonrmjunior/Local Sites/omniagent';
const htmlPath = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/previews/ac-30-03-reels-v2.html');
const outDir = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/publish/ac-30-03');
const baseName = 'ac-30-03';

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Read HTML and create export version
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Remove shield metadata block completely
  html = html.replace(/<div class="shield[^>]*>[\s\S]*?<\/div>\s*<\/div>/g, '');
  
  // Remove body padding/gap that affects layout
  html = html.replace(
    /body \{[^}]*\}/g,
    `body {
      margin: 0;
      padding: 0;
      background: #000;
      display: block;
    }`
  );
  
  // Fix frame-container CSS for exact 1080x1920
  html = html.replace(
    /\.frame-container \{[^}]*\}/g,
    `.frame-container {
      width: 1080px;
      height: 1920px;
      max-width: none;
      min-width: none;
      aspect-ratio: none;
      position: relative;
      overflow: hidden;
      border-radius: 0;
      border: none;
      box-shadow: none;
      background: var(--dark);
    }`
  );
  
  // Write temp HTML for export
  const tempHtml = path.resolve(outDir, 'temp-export.html');
  fs.writeFileSync(tempHtml, html);
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Use exact viewport
  await page.setViewportSize({ width: 1080, height: 1920 });
  
  await page.goto('file://' + tempHtml, { waitUntil: 'networkidle' });
  await page.waitForSelector('.frame-container');
  await page.waitForTimeout(500);
  
  // Verify dimensions
  const actualSize = await page.evaluate(() => {
    const el = document.querySelector('.frame-container');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  console.log('Actual frame-container size:', actualSize);
  
  // Set wrapper to show first frame
  await page.evaluate(() => {
    const wrapper = document.querySelector('.frame-wrapper');
    if (wrapper) wrapper.style.transform = 'translateX(0%)';
  });
  await page.waitForTimeout(300);
  
  // Capture each frame
  const frameCount = await page.evaluate(() => {
    return document.querySelectorAll('.frame').length;
  });
  
  console.log(`Found ${frameCount} frames`);
  
  for (let i = 0; i < frameCount; i++) {
    const offset = -(i * 100) + '%';
    await page.evaluate((off) => {
      const wrapper = document.querySelector('.frame-wrapper');
      if (wrapper) wrapper.style.transform = `translateX(${off})`;
    }, offset);
    
    await page.waitForTimeout(300);
    
    const frameContainer = await page.$('.frame-container');
    if (!frameContainer) {
      console.error(`Frame container not found for frame ${i + 1}`);
      continue;
    }
    
    const outPath = path.join(outDir, `${baseName}-${String(i + 1).padStart(2, '0')}.png`);
    await frameContainer.screenshot({ path: outPath, type: 'png' });
    console.log(`Exported: ${outPath}`);
  }
  
  await browser.close();
  
  // Clean up temp file
  fs.unlinkSync(tempHtml);
  
  console.log('Done: AC-30-03 Reels exported at 1080x1920');
})();
