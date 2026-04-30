const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('request', req => {
    if (req.url().includes('/api/categories')) console.log('REQUEST', req.method(), req.url());
  });
  page.on('response', async res => {
    if (res.url().includes('/api/categories')) {
      console.log('RESPONSE', res.status(), res.url());
      try {
        const json = await res.json();
        console.log('RESPONSE_JSON_KEYS', Object.keys(json));
        if (json.categories) console.log('CATEGORIES_COUNT', json.categories.length);
      } catch (e) {
        console.log('RESPONSE_JSON_ERROR', e.toString());
      }
    }
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
