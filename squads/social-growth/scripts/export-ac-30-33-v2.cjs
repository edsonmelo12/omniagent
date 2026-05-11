const { chromium } = require('playwright');
const { readFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, '../output/amiclube/social/previews/ac-30-33-facebook-seguranca.html');
const OUTPUT_DIR = path.join(__dirname, '../output/amiclube/social/publish/ac-30-33');
const VIEW_W = 1200;
const VIEW_H = 800;

(async () => {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: VIEW_W, height: VIEW_H },
    deviceScaleFactor: 1,
  });

  const htmlContent = readFileSync(HTML_PATH, 'utf-8');
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: `${OUTPUT_DIR}/ac-30-33-01.png`,
    clip: { x: 0, y: 0, width: VIEW_W, height: VIEW_H }
  });

  await browser.close();
  console.log('Done! PNG saved to:', OUTPUT_DIR);
})();