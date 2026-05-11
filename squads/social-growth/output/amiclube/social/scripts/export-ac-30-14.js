const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const htmlPath = '/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/amiclube/social/previews/ac-30-14-export.html';
const outputDir = '/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/amiclube/social/publish/ac-30-14';

async function exportPNGs() {
  const browser = await chromium.launch({ 
    executablePath: '/usr/bin/google-chrome',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 }
  });
  const page = await context.newPage();
  
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'networkidle' });
  
  fs.mkdirSync(outputDir, { recursive: true });
  
  const slides = await page.$$('.slide');
  
  for (let i = 0; i < slides.length; i++) {
    await page.screenshot({
      path: path.join(outputDir, `ac-30-14-0${i+1}.png`),
      clip: { x: 0, y: 0, width: 1080, height: 1350 }
    });
    
    console.log(`Exported ac-30-14-0${i+1}.png`);
  }
  
  await browser.close();
  console.log('Done!');
}

exportPNGs().catch(console.error);