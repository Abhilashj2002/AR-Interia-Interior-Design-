const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  const fail = async (message) => {
    console.error('ADMIN_CUSTOMER_DETAIL_FAIL', message);
    await browser.close();
    process.exit(2);
  };

  try {
    await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('form[data-form="login"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('input[name="email"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('form[data-form="login"] button[type="submit"]').click();

    const adminNav = page.locator('[data-action="nav"][data-tab="admin"]').first();
    await adminNav.waitFor({ state: 'visible', timeout: 12000 });
    await adminNav.click();
    await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 12000 });
    await page.waitForTimeout(1500);

    const buttons = page.locator('button[data-action="view-customer"]');
    const buttonCount = await buttons.count();
    if (buttonCount === 0) {
      await fail('No admin customer view button found');
      return;
    }

    let opened = false;
    for (let index = 0; index < buttonCount; index += 1) {
      const button = buttons.nth(index);
      if (!(await button.isVisible().catch(() => false))) continue;
      await button.click({ timeout: 10000 }).catch(() => {});
      const closeButton = page.locator('button[data-action="close-customer-view"]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        opened = true;
        break;
      }
    }

    if (!opened) {
      await fail('Customer detail modal did not open after clicking view button');
      return;
    }

    const modal = page.locator('button[data-action="close-customer-view"]').first().locator('xpath=ancestor::div[@data-action="ignore"][1]');
    await modal.locator('text=Booked Designs').first().waitFor({ state: 'visible', timeout: 10000 });
    await modal.locator('text=Phone').first().waitFor({ state: 'visible', timeout: 10000 });
    await modal.locator('text=Payment History').first().waitFor({ state: 'visible', timeout: 10000 });
    await modal.locator('text=Feedback History').first().waitFor({ state: 'visible', timeout: 10000 });

    const modalText = await modal.textContent();
    console.log('ADMIN_CUSTOMER_DETAIL_OK');
    console.log(String(modalText || '').slice(0, 300));

    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error instanceof Error ? error.message : String(error));
  }
})();
