const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const nodes = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*')).filter(n => n.textContent && n.textContent.includes('Category Gallery'));
      return all.map(n => ({ tag: n.tagName, text: n.textContent.slice(0,200), outer: n.outerHTML.slice(0,600) }));
    });
    console.log('NODES', JSON.stringify(nodes, null, 2));
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
