const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR', err.toString()));
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const exists = await page.$('#root');
    if (!exists) {
      console.log('NO_ROOT');
    } else {
      const html = await page.$eval('#root', el => el.innerHTML);
      console.log('ROOT_HTML_LENGTH', html.length);
      console.log(html.slice(0, 4000));
    }
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
