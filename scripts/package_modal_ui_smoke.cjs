const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const fail = async (message) => {
    console.error('PACKAGE_MODAL_UI_SMOKE_FAIL', message);
    await browser.close();
    process.exit(1);
  };

  await context.addInitScript(() => {
    const user = {
      id: 'cust-package-ui-smoke',
      name: 'Package UI Smoke',
      email: 'package.ui.smoke@test.local',
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

    const packageOpenButton = page.locator('[data-action="open-package-modal"][data-package-id]').first();
    if ((await packageOpenButton.count()) === 0) {
      await fail('No package card found to open modal');
      return;
    }

    await packageOpenButton.click({ timeout: 10000 });
    const modal = page.locator('[data-modal-inner="true"]');
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    const roomCards = page.locator('[data-action="open-room-preview"]');
    const roomCount = await roomCards.count();
    if (roomCount === 0) {
      await fail('Package modal opened but no room cards are visible');
      return;
    }

    const checks = Math.min(roomCount, 3);
    for (let i = 0; i < checks; i += 1) {
      const card = roomCards.nth(i);
      const imgSrc = await card.locator('img').first().getAttribute('src');
      const descText = (await card.locator('div.text-xs.text-slate-500').first().textContent()) || '';
      if (!imgSrc || !String(imgSrc).trim()) {
        await fail(`Room card ${i + 1} does not have an image source`);
        return;
      }
      if (!String(descText).trim()) {
        await fail(`Room card ${i + 1} does not have a description`);
        return;
      }
    }

    await roomCards.first().click({ timeout: 10000 });
    const previewLink = page.locator('a:has-text("Open Image in New Tab")').first();
    await previewLink.waitFor({ state: 'visible', timeout: 10000 });

    const previewDescription = (await page.locator('div.fixed p.text-slate-300').first().textContent()) || '';
    if (!String(previewDescription).trim()) {
      await fail('Room preview opened but description is empty');
      return;
    }

    await page.locator('[data-action="close-room-preview"]').click({ position: { x: 12, y: 12 } });
    await previewLink.waitFor({ state: 'hidden', timeout: 10000 });

    console.log('PACKAGE_MODAL_UI_SMOKE_OK');
    console.log(`ROOM_CARD_COUNT: ${roomCount}`);

    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error instanceof Error ? error.message : String(error));
  }
})();
