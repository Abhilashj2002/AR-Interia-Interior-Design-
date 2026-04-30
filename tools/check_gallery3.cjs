const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const selectCount = await page.evaluate(() => document.querySelectorAll('[data-action="select-category"]').length);
    const names = await page.evaluate(() => Array.from(document.querySelectorAll('[data-action="select-category"] .font-semibold')).slice(0,10).map(e => e.textContent.trim()));
    console.log('SELECT_CATEGORY_COUNT', selectCount);
    console.log('FIRST_NAMES', names);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
