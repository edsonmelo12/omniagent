import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const projectRoot = '/home/edsonrmjunior/Local Sites/omniagent';
const htmlPath = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/previews/ac-30-20-v3-stories.html');
const outDir = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/publish/ac-30-20');
const baseName = 'ac-30-20';

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Read HTML and create export version
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Remove preview controls and UI elements
  html = html.replace(/<div class="preview-controls[^>]*>[\s\S]*?<\/div>/g, '');
  
  // Fix stories-viewport and story dimensions for exact 1080x1920
  html = html.replace(
    /\.stories-viewport\{[^}]*\}/g,
    `.stories-viewport {
      width: 1080px !important;
      height: 1920px !important;
      max-width: none !important;
      overflow: hidden;
      position: relative;
      border-radius: 0;
      box-shadow: none;
      cursor: default;
    }`
  );
  
  html = html.replace(
    /\.story\{[^}]*\}/g,
    `.story {
      width: 1080px !important;
      height: 1920px !important;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }`
  );
  
  // Remove body padding/margin
  html = html.replace(
    /body\{[^}]*\}/g,
    `body {
      margin: 0;
      padding: 0;
      background: #111;
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
  
  await page.goto('file://' + tempHtml, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stories-viewport');
  await page.waitForTimeout(500);
  
  // Verify dimensions
  const actualSize = await page.evaluate(() => {
    const el = document.querySelector('.stories-viewport');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  console.log('Actual stories-viewport size:', actualSize);
  
  // Capture each frame
  const frameCount = await page.evaluate(() => {
    return document.querySelectorAll('.story').length;
  });
  
  console.log(`Found ${frameCount} frames`);
  
  for (let i = 0; i < frameCount; i++) {
    // Scroll to frame i (each frame is 1080px wide in the track)
    const offset = -(i * 1080);
    await page.evaluate((off) => {
      const track = document.querySelector('.stories-track');
      if (track) track.style.transform = `translateX(${off}px)`;
    }, offset);
    
    await page.waitForTimeout(300);
    
    const viewport = await page.$('.stories-viewport');
    if (!viewport) {
      console.error(`Viewport not found for frame ${i + 1}`);
      continue;
    }
    
    const outPath = path.join(outDir, `${baseName}-${String(i + 1).padStart(2, '0')}.png`);
    await viewport.screenshot({ path: outPath, type: 'png' });
    console.log(`Exported: ${outPath}`);
  }
  
  await browser.close();
  
  // Clean up temp file
  fs.unlinkSync(tempHtml);
  
  console.log('Done: AC-30-20 Stories exported at 1080x1920');
})();
