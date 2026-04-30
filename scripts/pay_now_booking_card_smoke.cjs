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

  const fail = async (message) => {
    console.error('PAY_NOW_BOOKING_SMOKE_FAIL', message);
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
        await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      }
      await page.waitForFunction(() => location.pathname === '/dashboard', null, { timeout: 12000 });
    }
  };

  await context.addInitScript(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const user = {
      id: 'cust-seeded',
      name: 'Raj Kumar',
      email: 'raj@example.com',
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

    if (!users.some((item) => String(item?.email || '').toLowerCase() === 'raj@example.com')) {
      users.unshift(user);
      localStorage.setItem(usersKey, JSON.stringify(users));
    }

    const bookingId = 'booking-smoke-pay-now';
    const paymentId = 'payment-smoke-pay-now';

    const bookings = [{
      id: bookingId,
      userId: user.id,
      designId: 'design-living-001',
      designName: 'Heritage Brass Drawing Room',
      categoryId: 'cat-living',
      price: 180000,
      cost: 144000,
      status: 'approved',
      paymentStatus: 'pending',
      createdAt: new Date(now - 5 * 60 * 1000).toISOString()
    }];

    const payments = [{
      id: paymentId,
      bookingId,
      userId: user.id,
      amount: 180000,
      provider: 'card',
      status: 'pending',
      createdAt: new Date(now - 4 * 60 * 1000).toISOString()
    }];

    localStorage.setItem('ar_interia_bookings', JSON.stringify(bookings));
    localStorage.setItem('ar_interia_payments', JSON.stringify(payments));

    const discountCodes = [{
      id: 'smoke-paynow-disc-20',
      code: 'PAYNOW20',
      type: 'percent',
      value: 20,
      minAmount: 0,
      maxDiscount: 0,
      active: true,
      startDate: new Date(now - day).toISOString(),
      endDate: new Date(now + day).toISOString(),
      createdAt: new Date(now).toISOString()
    }];
    localStorage.setItem('ar_interia_discount_codes', JSON.stringify(discountCodes));

    const announcements = [{
      id: 'smoke-paynow-announcement',
      title: 'Dashboard 20% Offer',
      message: 'Use PAYNOW20 on your card payment for 20% OFF.',
      active: true,
      location: 'dashboard',
      startDate: new Date(now - day).toISOString(),
      endDate: new Date(now + day).toISOString(),
      createdAt: new Date(now).toISOString()
    }];
    localStorage.setItem('ar_interia_announcements', JSON.stringify(announcements));
  });

  try {
    await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await ensureDashboard();
    await page.waitForTimeout(1200);

    const payNowBtn = page.locator('button[data-action="pay-and-book"][data-booking-id="booking-smoke-pay-now"]').first();
    if ((await payNowBtn.count()) === 0) {
      await fail('Pay Now button for seeded approved booking not found');
      return;
    }

    await payNowBtn.click({ timeout: 10000 });

    const modal = page.locator('form[data-form="fake-payment"]');
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    const payBtn = page.locator('form[data-form="fake-payment"] button[type="submit"]').first();
    const beforeText = await payBtn.textContent();
    const beforeAmount = parseInr(beforeText);
    if (!Number.isFinite(beforeAmount) || beforeAmount <= 0) {
      await fail(`Could not parse initial Pay Now amount from: ${beforeText}`);
      return;
    }

    const offerSelect = page.locator('#card-offer-select');
    if ((await offerSelect.count()) === 0) {
      await fail('Announcement-linked offer dropdown is missing for Pay Now flow');
      return;
    }

    await offerSelect.selectOption('PAYNOW20');
    await page.locator('button[data-action="apply-selected-card-offer"]').click();
    await page.locator('text=Code').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(250);

    const afterText = await payBtn.textContent();
    const afterAmount = parseInr(afterText);
    if (!Number.isFinite(afterAmount) || afterAmount <= 0) {
      await fail(`Could not parse discounted Pay Now amount from: ${afterText}`);
      return;
    }

    if (!(afterAmount < beforeAmount)) {
      await fail(`Discount did not reduce Pay Now amount (before=${beforeAmount}, after=${afterAmount})`);
      return;
    }

    await page.locator('input[name="name"]').fill('Smoke Tester');
    await page.locator('input[name="cardNumber"]').fill('4242 4242 4242 4242');
    await page.locator('input[name="cvv"]').fill('123');
    await payBtn.click();

    await page.locator('text=Payment Successful!').first().waitFor({ state: 'visible', timeout: 15000 });

    console.log('PAY_NOW_BOOKING_SMOKE_OK');
    console.log(`AMOUNT_BEFORE: ${beforeAmount}`);
    console.log(`AMOUNT_AFTER: ${afterAmount}`);

    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error instanceof Error ? error.message : String(error));
  }
})();
