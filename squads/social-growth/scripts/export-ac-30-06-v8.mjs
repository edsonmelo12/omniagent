import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const HTML_PATH = fileURLToPath(new URL('../output/amiclube/social/previews/ac-30-06-v8.html', import.meta.url));
const OUTPUT_DIR = fileURLToPath(new URL('../output/amiclube/social/publish/ac-30-06', import.meta.url));
const TOTAL_SLIDES = 7;
const VIEW_W = 420;
const VIEW_H = 525;
const SCALE = 1080 / 420; // = 2.5714...

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: VIEW_W, height: VIEW_H },
    deviceScaleFactor: SCALE,
  });

  const htmlContent = readFileSync(HTML_PATH, 'utf-8');
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for Google Fonts

  // Hide IG frame chrome (if modal elements exist)
  await page.evaluate(() => {
    const els = document.querySelectorAll('.ig-header,.ig-dots,.ig-actions,.ig-caption');
    els.forEach(el => el.style.display = 'none');
    
    const frame = document.querySelector('.ig-frame');
    if (frame) {
      frame.style.cssText = 'width:420px;height:525px;max-width:none;border-radius:0;box-shadow:none;overflow:hidden;margin:0;';
    }
    
    const viewport = document.querySelector('.carousel-viewport');
    if (viewport) {
      viewport.style.cssText = 'width:420px;height:525px;aspect-ratio:unset;overflow:hidden;cursor:default;';
    }
    
    document.body.style.cssText = 'padding:0;margin:0;display:block;overflow:hidden;';
  });

  for (let i = 0; i < TOTAL_SLIDES; i++) {
    await page.evaluate((idx) => {
      const track = document.querySelector('.carousel-track');
      track.style.transition = 'none';
      track.style.transform = `translateX(${-idx * 420}px)`;
    }, i);
    
    await page.waitForTimeout(400);
    
    await page.screenshot({
      path: `${OUTPUT_DIR}/ac-30-06-${String(i+1).padStart(2, '0')}.png`,
      clip: { x: 0, y: 0, width: VIEW_W, height: VIEW_H }
    });
    console.log(`Exported slide ${i+1}/${TOTAL_SLIDES}`);
  }

  await browser.close();
  console.log('Done! PNGs saved to:', OUTPUT_DIR);
})();
