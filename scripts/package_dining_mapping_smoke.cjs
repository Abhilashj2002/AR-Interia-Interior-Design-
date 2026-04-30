const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const fail = async (message) => {
    console.error('PACKAGE_DINING_MAPPING_SMOKE_FAIL', message);
    await browser.close();
    process.exit(1);
  };

  await context.addInitScript(() => {
    const user = {
      id: 'cust-dining-smoke',
      name: 'Dining Smoke User',
      email: 'dining.smoke@test.local',
      role: 'customer',
      password: 'password123'
    };

    const usersKey = 'ar_interia_users';
    const currentKey = `${usersKey}_current`;
    localStorage.setItem(currentKey, JSON.stringify(user));

    let users = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(usersKey) || '[]');
      users = Array.isArray(parsed) ? parsed : [];
    } catch {
      users = [];
    }

    if (!users.some((item) => String(item?.id || '') === user.id)) {
      users.unshift(user);
      localStorage.setItem(usersKey, JSON.stringify(users));
    }
  });

  try {
    await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 12000 });

    const targetedCard = page.locator('[data-action="open-package-modal"][data-package-id*="fullhome"]').first();
    if ((await targetedCard.count()) === 0) {
      await fail('No fullhome package card found for dining verification');
      return;
    }

    await targetedCard.click({ timeout: 10000, force: true });
    const modal = page.locator('[data-modal-inner="true"]');
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    const roomCards = page.locator('[data-action="open-room-preview"]');
    const roomCount = await roomCards.count();
    let foundDiningCard = false;

    for (let j = 0; j < roomCount; j += 1) {
      const roomCard = roomCards.nth(j);
      const title = ((await roomCard.locator('div.text-sm.font-bold').first().textContent()) || '').trim().toLowerCase();
      if (!title.includes('dining')) continue;

      foundDiningCard = true;
      const src = await roomCard.locator('img').first().getAttribute('src');
      const normalizedSrc = String(src || '').toLowerCase();
      const isDiningPath = normalizedSrc.includes('/category/diningroom/')
        || normalizedSrc.includes('/api/category-images/diningroom/');

      if (!isDiningPath) {
        await fail(`Dining room image is not from Diningroom category. src=${src}`);
        return;
      }

      break;
    }

    if (!foundDiningCard) {
      await fail('No dining room card was found in package modals to verify mapping');
      return;
    }

    console.log('PACKAGE_DINING_MAPPING_SMOKE_OK');
    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error instanceof Error ? error.message : String(error));
  }
})();
