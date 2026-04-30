const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      history.pushState({}, '', '/categories');
      if (window.state) window.state.activeTab = 'categories';
      if (window.render) window.render();
    });
    await page.waitForTimeout(800);
    const selectCount = await page.evaluate(() => document.querySelectorAll('[data-action="select-category"]').length);
    const refImageCount = await page.evaluate(() => {
      const el = document.querySelector('#category-images-view');
      return el ? el.querySelectorAll('img').length : 0;
    });
    const firstNames = await page.evaluate(() => Array.from(document.querySelectorAll('[data-action="select-category"] .font-semibold')).slice(0,10).map(e => e.textContent.trim()));
    console.log('SELECT_CATEGORY_COUNT', selectCount);
    console.log('REF_IMAGE_COUNT', refImageCount);
    console.log('FIRST_NAMES', firstNames);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
