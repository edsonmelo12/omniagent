import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(__dirname, '../output/amiclube/social/previews/ac-30-17-carousel-v3.html');
const OUTPUT_DIR = join(__dirname, '../output/amiclube/social/publish/ac-30-17-v3');
const TOTAL_SLIDES = 7;
const VIEW_W = 420;
const VIEW_H = 525;
const SCALE = 1080 / 420;

(async () => {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: VIEW_W, height: VIEW_H },
    deviceScaleFactor: SCALE,
  });

  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    document.body.style.cssText = 'padding:0;margin:0;display:block;overflow:hidden;';
    const shield = document.querySelector('.shield');
    if (shield) shield.remove();
    const progress = document.querySelector('.progress');
    if (progress) progress.remove();
    const frame = document.querySelector('.frame');
    if (frame) frame.style.cssText = 'width:420px;border-radius:0;box-shadow:none;overflow:hidden;margin:0;';
    const carousel = document.querySelector('.carousel');
    if (carousel) carousel.style.overflow = 'hidden';
  });

  for (let i = 0; i < TOTAL_SLIDES; i++) {
    await page.evaluate((idx) => {
      const wrapper = document.getElementById('wrapper');
      wrapper.style.transition = 'none';
      wrapper.style.transform = `translateX(${(-idx * (100 / 7))}%)`;
    }, i);

    await page.waitForTimeout(400);

    const outputPath = `${OUTPUT_DIR}/ac-30-17-${String(i+1).padStart(2,'0')}.png`;
    await page.screenshot({
      path: outputPath,
      clip: { x: 0, y: 0, width: VIEW_W, height: VIEW_H }
    });
    console.log(`Exported slide ${i+1}/${TOTAL_SLIDES}: ${outputPath}`);
  }

  await browser.close();
  console.log('Done! PNGs saved to:', OUTPUT_DIR);
})();
