const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const data = await page.evaluate(() => {
      const s = window.state || {};
      const cust = s.customer || {};
      return {
        categoriesLength: (cust.categories && cust.categories.length) || 0,
        firstCategory: (cust.categories && cust.categories[0]) || null,
        activeCategory: cust.activeCategory || null
      };
    });
    console.log('STATE_CATEGORIES_LENGTH', data.categoriesLength);
    console.log('STATE_FIRST_CATEGORY', JSON.stringify(data.firstCategory));
    console.log('STATE_ACTIVE_CATEGORY', data.activeCategory);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
