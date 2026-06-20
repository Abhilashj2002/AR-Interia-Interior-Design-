const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://127.0.0.1:5500';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  const gotoWithRetry = async (path, options = {}) => {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await page.goto(`${base}${path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
          ...options,
        });
        return;
      } catch (error) {
        lastError = error;
        await page.waitForTimeout(1000);
      }
    }
    throw lastError || new Error(`Failed to navigate to ${path}`);
  };

  const fail = async (message) => {
    console.error('CUSTOMER_VIEW_SMOKE_FAIL', message);
    await browser.close();
    process.exit(2);
  };

  try {
    await gotoWithRetry('/login');
    await page.locator('form[data-form="login"]').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('form[data-form="login"] input[name="email"]').fill('admin');
    await page.locator('form[data-form="login"] input[name="password"]').fill('admin123');
    await page.locator('form[data-form="login"] button[type="submit"]').click();

    await page.waitForTimeout(1200);
    const onAdmin = await page.evaluate(() => location.pathname === '/admin');
    if (!onAdmin) {
      const adminNav = page.locator('[data-action="nav"][data-tab="admin"]').first();
      if (await adminNav.isVisible().catch(() => false)) {
        await adminNav.click();
      } else {
        await gotoWithRetry('/admin');
      }
    }

    // Ensure admin session and at least one customer exists for the customer detail action.
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
      if (!users.some((u) => String(u?.id || '') === seedCustomer.id || String(u?.email || '') === seedCustomer.email)) {
        users.push(seedCustomer);
      }
      localStorage.setItem(usersKey, JSON.stringify(users));
    });
    await gotoWithRetry('/admin');
    await page.waitForTimeout(1200);

    // Wait for the customers block to mount and settle because admin data can hydrate asynchronously.
    await page.waitForFunction(() => {
      const headingMatches = Array.from(document.querySelectorAll('h2,h3')).some((el) => {
        const text = String(el.textContent || '').toLowerCase();
        return text.includes('customers') || text.includes('customer activity details');
      });
      if (!headingMatches) return false;
      return document.querySelectorAll('[data-action="view-customer"]').length > 0;
    }, { timeout: 20000 }).catch(() => null);

    const viewCustomerButton = page.locator('[data-action="view-customer"]').first();
    const buttonCount = await page.locator('[data-action="view-customer"]').count();
    if (buttonCount === 0) {
      await fail('No view-customer button found in admin customers section');
    }

    await viewCustomerButton.waitFor({ state: 'visible', timeout: 15000 });
    await viewCustomerButton.click();

    const modal = page.locator('h3:has-text("Customer Details")').first();
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    const bookedLabel = page.locator('text=Booked Designs').first();
    await bookedLabel.waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('button[data-action="close-customer-view"]').first().click();
    await page.waitForTimeout(300);

    const stillVisible = await modal.isVisible().catch(() => false);
    if (stillVisible) {
      await fail('Customer modal did not close after close action');
    }

    console.log('CUSTOMER_VIEW_SMOKE_OK');
    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error?.message || String(error));
  }
})();
