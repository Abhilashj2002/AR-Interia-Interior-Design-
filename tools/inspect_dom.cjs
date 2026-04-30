const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const info = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('h3')).filter(h => h.textContent && h.textContent.includes('Featured Categories'));
      if (nodes.length === 0) return { found: false };
      const el = nodes[0].closest('div');
      return { found: true, html: el ? el.innerHTML.slice(0,2000) : null, buttons: el ? el.querySelectorAll('button').length : 0 };
    });
    console.log('INSPECT', JSON.stringify(info));
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
