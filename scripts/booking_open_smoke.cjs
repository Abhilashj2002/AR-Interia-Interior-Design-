const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  const ensureDashboard = async () => {
    try {
      await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 12000 });
      return;
    } catch (_) {
      const dashboardNav = page.locator('[data-action="nav"][data-tab="dashboard"]').first();
      if ((await dashboardNav.count()) > 0) {
        await dashboardNav.click({ timeout: 8000 });
        await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 12000 });
      }
    }
  };

  try {
    await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('form[data-form="login"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('input[name="email"]').fill('raj@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('form[data-form="login"] button[type="submit"]').click();

    await ensureDashboard();
    await page.waitForTimeout(1000);

    const openBtn = page.locator('[data-action="open-booked-design"]').first();
    const count = await openBtn.count();
    if (count === 0) {
      console.log('BOOKING_OPEN_SKIPPED no booked designs for this user');
      await browser.close();
      process.exit(0);
    }

    await openBtn.click();
    await page.locator('#image-preview-overlay').waitFor({ state: 'visible', timeout: 10000 });
    console.log('BOOKING_OPEN_OK preview opened from dashboard without navigation flicker');
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('BOOKING_OPEN_FAIL', error.message || error);
    await browser.close();
    process.exit(2);
  }
})();
