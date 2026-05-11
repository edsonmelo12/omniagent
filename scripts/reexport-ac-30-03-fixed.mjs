import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const projectRoot = process.argv[2] || '.';
const htmlPath = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/previews/ac-30-03-reels-v2.html');
const outDir = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/publish/ac-30-03');
const baseName = 'ac-30-03';

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Read the HTML and create export version
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Remove shield and preview elements
  html = html.replace(/<div class="shield[^>]*>[\s\S]*?<\/div>\s*<\/div>/g, '');
  
  // Fix frame-container CSS for export
  html = html.replace(
    /\.frame-container \{[^}]*\}/g,
    `.frame-container {
      width: 1080px !important;
      height: 1920px !important;
      max-width: none !important;
      min-width: none !important;
      aspect-ratio: none !important;
      border: none !important;
      border-radius: 0 !important;
      margin: 0 !important;
      position: relative;
      overflow: hidden;
      background: var(--dark);
    }`
  );
  
  // Remove body padding/margin that might affect layout
  html = html.replace(
    /body \{[^}]*\}/g,
    `body {
      margin: 0;
      padding: 0;
      background: #000;
      display: block;
    }`
  );
  
  // Write temp HTML
  const tempHtml = path.resolve(outDir, 'temp-export.html');
  fs.writeFileSync(tempHtml, html);
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Use exact viewport
  await page.setViewportSize({ width: 1080, height: 1920 });
  
  const fileUrl = 'file://' + tempHtml;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
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
