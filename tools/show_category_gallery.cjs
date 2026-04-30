const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.evaluate(() => { history.pushState({}, '', '/categories'); if (window.state) window.state.activeTab = 'categories'; if (window.render) window.render(); });
    await page.waitForTimeout(800);
    const info = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h1')).find(e => e.textContent && e.textContent.includes('Category Gallery'));
      if (!h) return { found: false };
      const section = h.closest('div');
      return { found: true, html: section ? section.innerHTML.slice(0,5000) : null };
    });
    console.log('GALLERY', info);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
