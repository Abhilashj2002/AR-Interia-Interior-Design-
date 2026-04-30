const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const data = await page.evaluate(async () => {
      const res = await fetch('http://localhost:5174/api/categories');
      const json = await res.json();
      return { keys: Object.keys(json), len: (json.categories && json.categories.length) || 0, first: json.categories && json.categories[0] };
    });
    console.log('DIRECT_FETCH', JSON.stringify(data));
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
