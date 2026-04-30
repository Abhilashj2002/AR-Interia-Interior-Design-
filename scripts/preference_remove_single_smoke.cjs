const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const fail = async (message) => {
    console.error('PREFERENCE_REMOVE_SINGLE_SMOKE_FAIL', message);
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
    const user = {
      id: 'cust-pref-smoke',
      name: 'Preference Tester',
      email: 'preference-smoke@example.com',
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

    const withoutUser = users.filter((item) => String(item?.email || '').toLowerCase() !== user.email);
    withoutUser.unshift(user);
    localStorage.setItem(usersKey, JSON.stringify(withoutUser));

    localStorage.setItem('ar_interia_likes', JSON.stringify([]));
    localStorage.setItem('ar_interia_feedbacks', JSON.stringify([]));
    localStorage.setItem('ar_interia_bookings', JSON.stringify([]));
    localStorage.setItem('ar_interia_payments', JSON.stringify([]));
  });

  try {
    await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await ensureDashboard();
    await page.waitForTimeout(1500);

    const likedDesignIds = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[data-action="like-design"][data-like="like"]'));
      const uniqueIds = [];
      for (const button of buttons) {
        const designId = String(button.getAttribute('data-design-id') || '').trim();
        if (!designId || uniqueIds.includes(designId)) continue;
        uniqueIds.push(designId);
        if (uniqueIds.length === 2) break;
      }
      return uniqueIds;
    });

    if (!Array.isArray(likedDesignIds) || likedDesignIds.length < 2) {
      await fail('Could not find two visible designs to like on the dashboard');
      return;
    }

    for (const designId of likedDesignIds) {
      await page.locator(`button[data-action="like-design"][data-like="like"][data-design-id="${designId}"]`).first().click({ timeout: 10000 });
      await page.waitForTimeout(250);
    }

    const likedSection = page.locator('section:has-text("Design Preferences")');
    await likedSection.waitFor({ state: 'visible', timeout: 12000 });
    await page.locator('text=Design Preferences').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const [firstDesignId, secondDesignId] = likedDesignIds;
    const firstRemove = page.locator(`button[data-action="remove-preference"][data-design-id="${firstDesignId}"]`).first();
    const secondRemove = page.locator(`button[data-action="remove-preference"][data-design-id="${secondDesignId}"]`).first();

    if ((await firstRemove.count()) === 0) {
      await fail('First liked design did not appear in Design Preferences');
      return;
    }
    if ((await secondRemove.count()) === 0) {
      await fail('Second liked design did not appear in Design Preferences');
      return;
    }

    await firstRemove.click({ timeout: 10000 });

    await page.waitForFunction(() => {
      const raw = localStorage.getItem('ar_interia_likes') || '[]';
      const likes = JSON.parse(raw);
      return Array.isArray(likes) && likes.length === 1;
    }, null, { timeout: 12000 });

    await page.waitForTimeout(800);

    const remainingLikes = await page.evaluate(() => JSON.parse(localStorage.getItem('ar_interia_likes') || '[]'));
    const firstStillVisible = await page.locator(`button[data-action="remove-preference"][data-design-id="${firstDesignId}"]`).count();
    const secondStillVisible = await page.locator(`button[data-action="remove-preference"][data-design-id="${secondDesignId}"]`).count();

    if (firstStillVisible > 0) {
      await fail('Removed preference is still visible after clicking Remove');
      return;
    }
    if (secondStillVisible === 0) {
      await fail('Removing one preference also removed the remaining preference from the dashboard');
      return;
    }
    if (!Array.isArray(remainingLikes) || String(remainingLikes[0]?.designId || '') !== String(secondDesignId)) {
      await fail('Underlying likes storage did not retain the expected remaining preference');
      return;
    }

    console.log('PREFERENCE_REMOVE_SINGLE_SMOKE_OK');
    console.log(`REMOVED_DESIGN: ${firstDesignId}`);
    console.log(`REMAINING_DESIGN: ${secondDesignId}`);

    await browser.close();
    process.exit(0);
  } catch (error) {
    await fail(error instanceof Error ? error.message : String(error));
  }
})();
