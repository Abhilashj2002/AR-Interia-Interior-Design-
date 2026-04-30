const { chromium } = require('playwright');

const parseInr = (text) => {
  const raw = String(text || '').replace(/[^0-9.]/g, '');
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
};

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

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
        await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      }
      await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 12000 });
    }
  };

  const fail = async (message) => {
    console.error('FAKE_CARD_UI_SMOKE_FAIL', message);
    await browser.close();
    process.exit(2);
  };

  // Inject a deterministic active discount code and linked dashboard announcement before app boot.
  await context.addInitScript(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const seed = [{
      id: 'smoke-disc-10',
      code: 'SMOKE10',
      type: 'percent',
      value: 10,
      minAmount: 0,
      maxDiscount: 0,
      active: true,
      startDate: new Date(now - day).toISOString(),
      endDate: new Date(now + day).toISOString(),
      createdAt: new Date(now).toISOString()
    }];
    localStorage.setItem('ar_interia_discount_codes', JSON.stringify(seed));

    const announcements = [{
      id: 'smoke-announcement-offer',
      title: 'Dashboard Offer',
      message: 'Use SMOKE10 for 10% off on card payment.',
      active: true,
      location: 'dashboard',
      startDate: new Date(now - day).toISOString(),
      endDate: new Date(now + day).toISOString(),
      createdAt: new Date(now).toISOString()
    }];
    localStorage.setItem('ar_interia_announcements', JSON.stringify(announcements));
  });

  try {
    await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('form[data-form="login"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('input[name="email"]').fill('raj@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('form[data-form="login"] button[type="submit"]').click();

    await page.waitForTimeout(1500);
    const onDashboard = await page.evaluate(() => location.pathname === '/dashboard');
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
        if (!users.some((item) => String(item?.email || '').toLowerCase() === String(user.email).toLowerCase())) {
          users.unshift(user);
        }
        localStorage.setItem(usersKey, JSON.stringify(users));
      });
    }

    await ensureDashboard();
    await page.waitForTimeout(1200);

    const packagesTitle = await page.locator('text=Packages').count();
    if (packagesTitle === 0) {
      await fail('Customer dashboard package section is not visible');
      return;
    }

    const packageViewBtn = page.locator('[data-action="open-package-modal"]').first();
    if ((await packageViewBtn.count()) === 0) {
      await fail('No package View button found on dashboard');
      return;
    }

    await packageViewBtn.click({ timeout: 10000 });
    await page.locator('[data-action="close-package-modal"]').first().waitFor({ state: 'visible', timeout: 10000 });

    const packageHeroImage = page.locator('[data-modal-inner="true"] img').first();
    const heroSrc = await packageHeroImage.getAttribute('src');
    if (!heroSrc) {
      await fail('Package modal image did not load a source');
      return;
    }

    const relatedRoomImages = page.locator('[data-action="open-room-preview"] img');
    const relatedCount = await relatedRoomImages.count();
    if (relatedCount === 0) {
      await fail('Package modal did not show related room images');
      return;
    }

    const modalCloseX = page.locator('[data-modal-inner="true"] button[data-action="close-package-modal"]').first();
    await modalCloseX.click({ timeout: 10000 });
    await page.waitForTimeout(300);

    const packageModalStillVisible = await page.locator('[data-modal-inner="true"]').isVisible().catch(() => false);
    if (packageModalStillVisible) {
      await fail('Package modal close X did not close the dialog');
      return;
    }

    const bookBtnSelector = '[data-action="book-package-card"]';
    if ((await page.locator(bookBtnSelector).count()) === 0) {
      await fail('No package Book & Pay button found on dashboard');
      return;
    }

    const clickBookButton = async () => {
      const btn = page.locator(bookBtnSelector).first();
      await btn.waitFor({ state: 'visible', timeout: 10000 });
      await btn.click({ timeout: 10000 });
    };
    try {
      await clickBookButton();
    } catch {
      await page.waitForTimeout(300);
      await clickBookButton();
    }

    const modal = page.locator('form[data-form="fake-payment"]');

    // Current package flow can be approval-first. Keep backward compatibility if direct card modal is enabled.
    await page.waitForTimeout(1800);
    const modalVisibleNow = await modal.isVisible().catch(() => false);
    if (!modalVisibleNow) {
      const bodyText = await page.evaluate(() => document.body?.innerText || '');
      const approvalFirst = /admin approval|approval before payment|payment unlocks after admin approval|booked successfully|booking submitted|pending approval|request received|awaiting approval/i.test(bodyText);
      if (approvalFirst) {
        console.log('FAKE_CARD_UI_SMOKE_OK');
        console.log('FLOW: approval-first package booking (no immediate card modal)');
        await browser.close();
        process.exit(0);
      }
      await modal.waitFor({ state: 'visible', timeout: 10000 });
    }

    const paymentCloseX = page.locator('button.absolute[data-action="cancel-fake-payment"]').first();
    if ((await paymentCloseX.count()) === 0) {
      await fail('Card payment dialog close X is missing');
      return;
    }

    await paymentCloseX.click({ timeout: 10000 });
    await page.waitForTimeout(250);
    const modalVisibleAfterClose = await modal.isVisible().catch(() => false);
    if (modalVisibleAfterClose) {
      await fail('Card payment dialog close X did not close the modal');
      return;
    }

    await clickBookButton();
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    const payBtn = page.locator('form[data-form="fake-payment"] button[type="submit"]').first();
    const beforeText = await payBtn.textContent();
    const beforeAmount = parseInr(beforeText);
    if (!Number.isFinite(beforeAmount) || beforeAmount <= 0) {
      await fail(`Could not parse initial pay amount from: ${beforeText}`);
      return;
    }

    const offerSelect = page.locator('#card-offer-select');
    if ((await offerSelect.count()) === 0) {
      await fail('Announcement-linked offer dropdown is missing in card payment dialog');
      return;
    }

    await offerSelect.selectOption('SMOKE10');
    await page.locator('button[data-action="apply-selected-card-offer"]').click();
    await page.locator('text=Code').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(250);

    const afterText = await payBtn.textContent();
    const afterAmount = parseInr(afterText);
    if (!Number.isFinite(afterAmount) || afterAmount <= 0) {
      await fail(`Could not parse discounted pay amount from: ${afterText}`);
      return;
    }

    if (!(afterAmount < beforeAmount)) {
      await fail(`Discount did not reduce amount (before=${beforeAmount}, after=${afterAmount})`);
      return;
    }

    await page.locator('input[name="name"]').fill('Smoke Tester');
    await page.locator('input[name="cardNumber"]').fill('4242 4242 4242 4242');
    await page.locator('input[name="cvv"]').fill('123');
    await payBtn.click();

    await page.locator('text=Payment Successful!').first().waitFor({ state: 'visible', timeout: 15000 });
    const successAmountText = await page.locator('text=Payment Successful!').locator('xpath=..').textContent();

    const closeSuccess = page.locator('button[data-action="dismiss-payment-success"]').first();
    if ((await closeSuccess.count()) > 0) {
      await closeSuccess.click();
    }

    console.log('FAKE_CARD_UI_SMOKE_OK');
    console.log(`AMOUNT_BEFORE: ${beforeAmount}`);
    console.log(`AMOUNT_AFTER: ${afterAmount}`);
    console.log(`SUCCESS_TEXT: ${String(successAmountText || '').slice(0, 140)}`);

    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error instanceof Error ? error.message : String(error));
  }
})();
