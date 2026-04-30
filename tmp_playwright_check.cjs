const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  try {
    await page.goto('http://127.0.0.1:5500/admin', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.evaluate(() => {
      const admin = { id: 'admin-master', name: 'Administrator', email: 'admin', role: 'admin', password: 'admin123' };
      const usersKey = 'ar_interia_users';
      localStorage.setItem(`${usersKey}_current`, JSON.stringify(admin));
      localStorage.setItem(`${usersKey}_admin_acc`, JSON.stringify(admin));
      let users = [];
      try {
        const parsed = JSON.parse(localStorage.getItem(usersKey) || '[]');
        users = Array.isArray(parsed) ? parsed : [];
      } catch {
        users = [];
      }
      if (!users.some((u) => String(u?.id || '') === admin.id || String(u?.email || '') === admin.email)) {
        users.unshift(admin);
      }
      localStorage.setItem(usersKey, JSON.stringify(users));
    });
    await page.goto('http://127.0.0.1:5500/admin', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2000);
    console.log('TITLE', await page.title());
    console.log('PATH', await page.evaluate(() => location.pathname));
    console.log('LUXURY COUNT', await page.locator('h2:has-text("Castle Luxury Editor")').count());
    console.log('SERVICE BTN COUNT', await page.locator('[data-action="admin-edit-service"]').count());
    console.log('SHOWROOM EDIT COUNT', await page.locator('[data-action="admin-edit-showroom"]').count());
    console.log('LOAD CATEGORY BTN COUNT', await page.locator('[data-action="admin-load-designs-for-category"]').count());
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await browser.close();
  }
})();