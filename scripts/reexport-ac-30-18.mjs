import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const projectRoot = '/home/edsonrmjunior/Local Sites/omniagent';
const htmlPath = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/previews/ac-30-18-carousel-v2.html');
const outDir = path.resolve(projectRoot, 'squads/social-growth/output/amiclube/social/publish/ac-30-18');
const baseName = 'ac-30-18';

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Read HTML and create export version
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Remove shield and preview elements
  html = html.replace(/<header class="shield[^>]*>[\s\S]*?<\/header>/g, '');
  
  // Fix frame/carousel dimensions for exact 1080x1350
  html = html.replace(
    /\.frame \{[^}]*\}/g,
    `.frame {
      width: 1080px !important;
      max-width: none !important;
      aspect-ratio: none !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: var(--card);
    }`
  );
  
  // Fix carousel and wrapper
  html = html.replace(
    /\.carousel \{[^}]*\}/g,
    `.carousel {
      width: 100% !important;
      aspect-ratio: none !important;
      position: relative;
      overflow: hidden;
      background: #0a1015;
    }`
  );
  
  html = html.replace(
    /\.wrapper \{[^}]*\}/g,
    `.wrapper {
      display: flex;
      width: 800% !important;
      height: 100% !important;
      transition: transform .42s cubic-bezier(.65, 0, .35, 1);
    }`
  );
  
  html = html.replace(
    /\.slide \{[^}]*\}/g,
    `.slide {
      width: calc(100% / 8) !important;
      height: 100% !important;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      background: #0a1015;
    }`
  );
  
  // Remove body padding/margin
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
  await page.setViewportSize({ width: 1080, height: 1350 });
  
  await page.goto('file://' + tempHtml, { waitUntil: 'networkidle' });
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
    const offset = -(i * 100) + '%';
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
  
  // Clean up temp file
  fs.unlinkSync(tempHtml);
  
  console.log('Done: AC-30-18 Carousel exported at 1080x1350');
})();
