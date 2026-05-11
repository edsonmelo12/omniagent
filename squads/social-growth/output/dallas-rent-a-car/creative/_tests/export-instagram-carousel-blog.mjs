import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputHtml = path.join(__dirname, "instagram-carousel-blog-aluguel-mensal.html");
const outputDir = path.join(__dirname, "instagram-carousel-blog-aluguel-mensal-png");

const viewWidth = 420;
const viewHeight = 525;
const scale = 1080 / 420;

async function exportSlides() {
  await mkdir(outputDir, { recursive: true });

  const html = readFileSync(inputHtml, "utf8");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: viewWidth, height: viewHeight },
    deviceScaleFactor: scale,
  });

  await page.setContent(html, { waitUntil: "load" });
  await page.addStyleTag({
    content: `
      body { padding: 0 !important; margin: 0 !important; background: #111827 !important; }
      .shell { display: block !important; width: auto !important; }
      .notes { display: none !important; }
      .phone { padding: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: transparent !important; }
      .screen { border-radius: 0 !important; }
      .controls { display: none !important; }
    `,
  });

  const totalSlides = await page.evaluate(() => {
    const track = document.getElementById("track");
    return track ? track.children.length : 0;
  });

  for (let index = 0; index < totalSlides; index += 1) {
    await page.evaluate((i) => {
      const track = document.getElementById("track");
      if (!track) return;
      track.style.transition = "none";
      track.style.transform = `translateX(-${i * 100}%)`;
    }, index);

    await page.waitForTimeout(120);
    const outputPath = path.join(outputDir, `slide-${String(index + 1).padStart(2, "0")}.png`);
    await page.screenshot({
      path: outputPath,
      clip: { x: 0, y: 0, width: viewWidth, height: viewHeight },
    });
  }

  await browser.close();

  console.log(`Exported ${totalSlides} slides to ${outputDir}`);
}

exportSlides().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
