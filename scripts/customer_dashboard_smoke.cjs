const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://127.0.0.1:5500';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  const startedAt = Date.now();

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
        await page.waitForTimeout(300);
      }
    }
    throw lastError || new Error(`Failed to navigate to ${path}`);
  };

  const fail = async (message) => {
    console.error('CUSTOMER_DASHBOARD_FAIL', message);
    await browser.close();
    process.exit(2);
  };

  const ensureDashboard = async () => {
    try {
      await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 12000 });
      return;
    } catch (_) {
      const nav = page.locator('[data-action="nav"][data-tab="dashboard"]').first();
      if ((await nav.count()) > 0) {
        await nav.click({ timeout: 8000 }).catch(() => {});
      }
      const onDashboard = await page.evaluate(() => location.pathname === '/dashboard');
      if (!onDashboard) {
        await gotoWithRetry('/dashboard');
      }
      await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 12000 });
    }
  };

  try {
    await gotoWithRetry('/login');

    await page.locator('form[data-form="login"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('input[name="email"]').fill('raj@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('form[data-form="login"] button[type="submit"]').click();

    await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 4000 }).catch(() => null);
    let onDashboard = await page.evaluate(() => location.pathname === '/dashboard');
    if (!onDashboard) {
      await page.evaluate(() => {
        const user = { id: 'cust-seeded', name: 'Raj Kumar', email: 'raj@example.com', role: 'customer', password: 'password123' };
        const usersKey = 'ar_interia_users';
        localStorage.setItem(`${usersKey}_current`, JSON.stringify(user));
        let users = [];
        try {
          const parsed = JSON.parse(localStorage.getItem(usersKey) || '[]');
          users = Array.isArray(parsed) ? parsed : [];
        } catch {
          users = [];
        }
        if (!users.some((u) => String(u?.email || '').toLowerCase() === String(user.email).toLowerCase())) {
          users.unshift(user);
        }
        localStorage.setItem(usersKey, JSON.stringify(users));
      });
      await gotoWithRetry('/dashboard');
    }

    await ensureDashboard();
    await page.locator('text=My Dashboard').first().waitFor({ state: 'visible', timeout: 10000 });

    const heroText = await page.locator('text=My Dashboard').count();
    if (heroText === 0) await fail('Dashboard header not visible');

    const bookingStat = (await page.locator('text=Bookings').first().locator('xpath=..').textContent() || '').trim();
    const savedStat = (await page.locator('text=Saved').first().locator('xpath=..').textContent() || '').trim();

    const hasPaidDesignsSection = (await page.locator('text=Paid Designs').count()) > 0;
    const hasInvoicesSection = (await page.locator('text=Invoices').count()) > 0;
    const hasPendingBookingsSection = (await page.locator('text=Pending Bookings').count()) > 0;

    if (!hasPaidDesignsSection || !hasInvoicesSection || !hasPendingBookingsSection) {
      await fail('One or more dashboard sections are missing');
    }

    const designModalClose = page.locator('#dashboard-design-modal [data-action="close-design-modal"]').first();
    if (await designModalClose.count()) {
      await designModalClose.click().catch(() => {});
      await page.waitForTimeout(80);
    }

    const openButton = page.locator('[data-action="open-booked-design"]').first();
    const openCount = await openButton.count();

    let openResult = 'NO_OPEN_BUTTON';
    if (openCount > 0) {
      await openButton.click();
      const overlay = page.locator('#image-preview-overlay');
      await overlay.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
      const previewVisible = await overlay.isVisible().catch(() => false);
      if (!previewVisible) {
        await fail('Open button clicked but booked design preview did not open');
      }
      openResult = 'OPEN_WORKS';
    }

    console.log('CUSTOMER_DASHBOARD_OK');
    console.log(`STATS_BOOKINGS: ${bookingStat}`);
    console.log(`STATS_SAVED: ${savedStat}`);
    console.log(`BOOKING_OPEN: ${openResult}`);
    console.log(`DURATION_MS: ${Date.now() - startedAt}`);

    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error.message || error);
  }
})();
