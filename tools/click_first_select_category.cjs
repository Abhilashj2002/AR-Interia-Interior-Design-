const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.click('button[data-action="nav"][data-tab="categories"]');
    await page.waitForTimeout(600);
    const first = await page.$('button[data-action="select-category"]');
    if (first) {
      await first.click();
      await page.waitForTimeout(500);
    }
    const refImageCount = await page.evaluate(() => {
      const el = document.querySelector('#category-images-view');
      return el ? el.querySelectorAll('img').length : 0;
    });
    console.log('AFTER_CLICK_REF_IMAGE_COUNT', refImageCount);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
