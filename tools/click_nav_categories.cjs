const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.click('button[data-action="nav"][data-tab="categories"]');
    await page.waitForTimeout(800);
    const selectCount = await page.evaluate(() => document.querySelectorAll('[data-action="select-category"]').length);
    const refImageCount = await page.evaluate(() => {
      const el = document.querySelector('#category-images-view');
      return el ? el.querySelectorAll('img').length : 0;
    });
    console.log('CLICK_NAV_SELECT_COUNT', selectCount);
    console.log('CLICK_NAV_REF_IMAGE_COUNT', refImageCount);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
