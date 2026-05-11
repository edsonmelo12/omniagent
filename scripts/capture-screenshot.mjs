import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const rootDir = '/home/edsonrmjunior/Local Sites/omniagent';

const assets = [
  {
    name: 'AC-30-17',
    input: 'squads/social-growth/output/amiclube/social/previews/ac-30-17-carousel.html',
    output: 'squads/social-growth/output/amiclube/social/exports/ac-30-17/AC-30-17-carousel.jpg'
  },
  {
    name: 'AC-30-18',
    input: 'squads/social-growth/output/amiclube/social/previews/ac-30-18-carousel.html',
    output: 'squads/social-growth/output/amiclube/social/exports/ac-30-18/AC-30-18-carousel.jpg'
  }
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1600 }
  });

  for (const asset of assets) {
    const filePath = path.join(rootDir, asset.input);
    const outputDir = path.dirname(path.join(rootDir, asset.output));
    fs.mkdirSync(outputDir, { recursive: true });
    
    console.log(`Capturing ${asset.name}...`);
    await page.goto('file://' + filePath);
    await page.waitForTimeout(2000);
    
    const outputPath = path.join(rootDir, asset.output);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Saved: ${outputPath}`);
  }
  
  await browser.close();
  console.log('Done!');
}

capture().catch(console.error);