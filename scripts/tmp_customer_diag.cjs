const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  await page.goto('http://localhost:5500/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.fill('form[data-form="login"] input[name="email"]', 'admin');
  await page.fill('form[data-form="login"] input[name="password"]', 'admin123');
  await page.click('form[data-form="login"] button[type="submit"]');
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    const usersKey = 'ar_interia_users';
    const admin = { id: 'admin-master', name: 'Administrator', email: 'admin', role: 'admin', password: 'admin123' };
    const seedCustomer = {
      id: 'customer-smoke-1',
      name: 'Smoke Customer',
      email: 'smoke.customer@example.com',
      role: 'customer',
      password: 'password123'
    };

    localStorage.setItem(`${usersKey}_current`, JSON.stringify(admin));
    localStorage.setItem(`${usersKey}_admin_acc`, JSON.stringify(admin));
    localStorage.setItem(usersKey, JSON.stringify([admin, seedCustomer]));
  });

  await page.goto('http://localhost:5500/admin', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const data = await page.evaluate(() => {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('ar_interia_users') || '[]');
    } catch {
      users = [];
    }
    return {
      path: location.pathname,
      usersCount: Array.isArray(users) ? users.length : 0,
      customerUsers: Array.isArray(users) ? users.filter((u) => String(u?.role || '').toLowerCase() === 'customer').length : 0,
      viewButtons: document.querySelectorAll('[data-action="view-customer"]').length,
      htmlHasCustomersHeading: !!document.querySelector('h2') && Array.from(document.querySelectorAll('h2')).some((el) => (el.textContent || '').toLowerCase().includes('customers'))
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});