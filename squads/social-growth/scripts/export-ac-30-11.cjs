const { chromium } = require('playwright');
const path = require('path');

async function exportFrames() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 }
  });

  const htmlPath = path.resolve(__dirname, '../output/amiclube/social/previews/ac-30-11-reels-reputacao.html');
  await page.goto(`file://${htmlPath}`);

  await page.addStyleTag({
    content: `
      .dots { display: none !important; }
      .nav-area { display: none !important; }
      .frame {
        width: 1080px !important;
        height: 1920px !important;
        border-radius: 0 !important;
      }
      .slide { padding: 120px 72px 144px !important; }
      .kicker { font-size: 27px !important; }
      .title { font-size: 96px !important; margin: 24px 0 36px !important; }
      .subtitle { font-size: 42px !important; line-height: 1.5 !important; }
      .card { padding: 54px !important; border-radius: 48px !important; }
      .card-kicker { font-size: 24px !important; letter-spacing: 0.15em !important; margin-bottom: 18px !important; }
      .card-title { font-size: 54px !important; letter-spacing: -0.02em !important; }
      .card-copy { font-size: 36px !important; margin-top: 18px !important; line-height: 1.4 !important; }
      .cta { padding: 42px 72px !important; font-size: 36px !important; border-radius: 72px !important; }
    `
  });

  const outputDir = path.resolve(__dirname, '../output/amiclube/social/publish/ac-30-11');

  for (let i = 0; i < 4; i++) {
    await page.evaluate((idx) => {
      const wrapper = document.getElementById('wrapper');
      wrapper.style.transform = `translateX(-${idx * 25}%)`;
    }, i);

    await page.waitForTimeout(300);

    const frame = await page.$('.frame');
    await frame.screenshot({
      path: `${outputDir}/ac-30-11-0${i + 1}.png`,
      type: 'png'
    });
    console.log(`Exported frame ${i + 1}`);
  }

  await browser.close();
  console.log('Done!');
}

exportFrames().catch(console.error);