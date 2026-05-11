/**
 * AC-30-31 v7 — Export 7 PNG slides via Playwright
 * Canvas: 1080x1350 per slide
 * Fix: serve HTML via HTTP + serve hero image as static file (not data URI)
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(__dirname, '../output/amiclube');
const HTML = path.resolve(ROOT, 'social/previews/ac-30-31-carousel-v7.html');
const OUTDIR = path.resolve(ROOT, 'social/publish/ac-30-31-v7');
const HERO_IMG = path.resolve(ROOT, 'blog/assets/AC-30-09B-seguranca-higiene-hero.jpg');
const TOTAL = 7;
const W = 1080;
const H = 1350;

async function exportSlides() {
  if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

  let htmlContent = fs.readFileSync(HTML, 'utf8');
  htmlContent = htmlContent.replace(
    /url\(['"]?\.\.\/blog\/assets\/AC-30-09B-seguranca-higiene-hero\.jpg['"]?\)/g,
    "url('/blog/assets/AC-30-09B-seguranca-higiene-hero.jpg')"
  );
  const imgBuffer = fs.existsSync(HERO_IMG) ? fs.readFileSync(HERO_IMG) : null;

  const server = http.createServer((req, res) => {
    if (req.url === '/blog/assets/AC-30-09B-seguranca-higiene-hero.jpg' && imgBuffer) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' });
      res.end(imgBuffer);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlContent);
    }
  });

  await new Promise(resolve => server.listen(9980, resolve));

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: W, height: H });
  await page.goto('http://localhost:9980/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const results = [];

  for (let i = 0; i < TOTAL; i++) {
    const outPath = path.join(OUTDIR, `ac-30-31-v7-${String(i + 1).padStart(2, '0')}.png`);

    await page.evaluate((idx) => {
      const track = document.getElementById('track');
      track.style.transform = `translateX(-${idx * 100}%)`;
      track.querySelectorAll('.slide').forEach(s => { s.style.display = ''; });
      document.body.classList.add('export-mode');
    }, i);

    await page.waitForTimeout(500);
    await page.screenshot({ path: outPath, type: 'png', fullPage: false });

    const stat = fs.statSync(outPath);
    results.push({ slide: i + 1, size: stat.size });
    console.log(`Slide ${i + 1}: ${stat.size} bytes`);
  }

  await browser.close();
  server.close();

  console.log('\n=== EXPORT COMPLETE ===');
  results.forEach(x => console.log(`  Slide ${x.slide}: ${x.size} bytes`));
}

exportSlides().catch(e => { console.error(e); process.exit(1); });