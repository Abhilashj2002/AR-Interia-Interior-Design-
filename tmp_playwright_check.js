const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  try {
    await page.goto('http://127.0.0.1:5500/admin', { waitUntil: 'networkidle', timeout: 45000 });
    console.log('PATH', await page.evaluate(() => location.pathname));
    console.log('LUXURY COUNT', await page.locator('h2:has-text("Castle Luxury Editor")').count());
    console.log('SERVICE BTN COUNT', await page.locator('[data-action="admin-edit-service"]').count());
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await browser.close();
  }
})();