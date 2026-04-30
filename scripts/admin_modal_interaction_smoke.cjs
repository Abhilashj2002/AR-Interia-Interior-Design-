const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  const results = [];

  await page.addInitScript(() => {
    const usersKey = 'ar_interia_users';
    const categoriesKey = 'ar_interia_categories_v2';
    const designsKey = 'ar_interia_designs_v5';
    const catalogKey = 'ar_interia_catalog_v2';
    const admin = { id: 'admin-master', name: 'Administrator', email: 'admin', role: 'admin', password: 'admin123' };
    const seedCustomer = {
      id: 'customer-smoke-1',
      name: 'Smoke Customer',
      email: 'smoke.customer@example.com',
      role: 'customer',
      password: 'password123'
    };
    const seedCategory = {
      id: 'cat-smoke-1',
      title: 'Smoke Category',
      name: 'Smoke Category',
      description: 'Seeded smoke category for modal tests.',
      image: '',
      background: '',
      status: 'active'
    };
    const seedDesign = {
      id: 'design-smoke-1',
      title: 'Smoke Design',
      description: 'Seeded smoke design for modal tests.',
      categoryId: seedCategory.id,
      category: seedCategory.title,
      price: 42000,
      cost: 21000,
      previewImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
      availabilityStatus: 'available',
      status: 'active'
    };

    localStorage.setItem(`${usersKey}_current`, JSON.stringify(admin));
    localStorage.setItem(`${usersKey}_admin_acc`, JSON.stringify(admin));

    try {
      const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
      const mergedUsers = Array.isArray(users) ? users : [];
      if (!mergedUsers.some((u) => String(u?.id || '') === admin.id || String(u?.email || '').toLowerCase() === admin.email.toLowerCase())) {
        mergedUsers.unshift(admin);
      }
      if (!mergedUsers.some((u) => String(u?.id || '') === seedCustomer.id || String(u?.email || '').toLowerCase() === seedCustomer.email.toLowerCase())) {
        mergedUsers.push(seedCustomer);
      }
      localStorage.setItem(usersKey, JSON.stringify(mergedUsers));
    } catch {
      localStorage.setItem(usersKey, JSON.stringify([admin, seedCustomer]));
    }

    try {
      localStorage.setItem(categoriesKey, JSON.stringify([seedCategory]));
      localStorage.setItem(designsKey, JSON.stringify([seedDesign]));
      localStorage.setItem(catalogKey, JSON.stringify([seedDesign]));
    } catch {
      // ignore init seeding failures in smoke mode
    }
  });

  const logResult = (name, status, details = '') => {
    results.push({ name, status, details });
    console.log(`${status}: ${name}${details ? ` - ${details}` : ''}`);
  };

  const gotoWithRetry = async (path) => {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        return;
      } catch (error) {
        lastError = error;
        await page.waitForTimeout(800);
      }
    }
    throw lastError || new Error(`Failed to navigate to ${path}`);
  };

  const waitVisible = async (selector, timeout = 12000) => {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
  };

  const tryOpenModalFromSelectors = async (selectors, closeSelector) => {
    for (const selector of selectors) {
      const items = page.locator(selector);
      const count = await items.count();
      if (!count) continue;

      const attempts = Math.min(count, 12);
      for (let i = 0; i < attempts; i += 1) {
        const trigger = items.nth(i);
        const isVisible = await trigger.isVisible().catch(() => false);
        if (!isVisible) continue;

        await dismissVisibleAdminModals();
        await trigger.scrollIntoViewIfNeeded().catch(() => {});
        await trigger.click({ timeout: 10000, force: true }).catch(() => {});

        const opened = await page.locator(closeSelector).first().isVisible().catch(() => false);
        if (opened) return true;
      }
    }
    return false;
  };

  const hasVisibleTrigger = async (selectors) => {
    for (const selector of selectors) {
      const items = page.locator(selector);
      const count = await items.count();
      if (!count) continue;
      const attempts = Math.min(count, 12);
      for (let i = 0; i < attempts; i += 1) {
        const visible = await items.nth(i).isVisible().catch(() => false);
        if (visible) return true;
      }
    }
    return false;
  };

  const dismissVisibleAdminModals = async () => {
    const closeSelectors = [
      'button[data-action="close-booking-view"]',
      'button[data-action="close-inquiry-view"]',
      'button[data-action="close-customer-view"]',
      'button[data-action="close-design-editor"]',
      'button[data-action="close-upload"]',
      'button[data-action="cancel-catalog-action"]'
    ];

    for (const selector of closeSelectors) {
      const closeButton = page.locator(selector).first();
      const visible = await closeButton.isVisible().catch(() => false);
      if (visible) {
        await closeButton.click({ timeout: 4000 }).catch(() => {});
        await page.waitForTimeout(150);
      }
    }
  };

  const loginAsAdmin = async () => {
    await gotoWithRetry('/login');
    await waitVisible('form[data-form="login"]', 15000);

    await page.locator('form[data-form="login"] input[name="email"]').fill('admin');
    await page.locator('form[data-form="login"] input[name="password"]').fill('admin123');
    await page.locator('form[data-form="login"] button[type="submit"]').click();

    await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 5000 }).catch(() => null);
    const onAdmin = await page.evaluate(() => location.pathname === '/admin');

    if (!onAdmin) {
      const nav = page.locator('[data-action="nav"][data-tab="admin"]').first();
      if (await nav.isVisible().catch(() => false)) {
        await nav.click();
      } else {
        await gotoWithRetry('/admin');
      }
    }

    await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 12000 });
    await page.waitForTimeout(1200);
  };

  const ensureAdminSessionFallback = async () => {
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
  };

  const waitForAdminTriggers = async () => {
    await page.waitForFunction(() => {
      return document.querySelectorAll('button[data-action="view-customer"]').length > 0
        || document.querySelectorAll('button[data-action="edit-design"]').length > 0
        || document.querySelectorAll('button[data-action="admin-edit-service"]').length > 0;
    }, null, { timeout: 20000 }).catch(() => null);
  };

  const openAndCloseModal = async ({
    name,
    openSelectors,
    closeSelector,
    backdropCloseSelector = null,
    extraWaitMs = 0,
  }) => {
    await dismissVisibleAdminModals();

    const hasVisible = await hasVisibleTrigger(openSelectors);
    if (!hasVisible) {
      logResult(name, 'SKIP', 'No visible trigger button found');
      return;
    }

    try {
      const opened = await tryOpenModalFromSelectors(openSelectors, closeSelector);
      if (!opened) {
        throw new Error('Could not open modal from available triggers');
      }

      await waitVisible(closeSelector, 10000);
      if (extraWaitMs > 0) await page.waitForTimeout(extraWaitMs);

      if (backdropCloseSelector) {
        await page.locator(backdropCloseSelector).first().click({ timeout: 10000, position: { x: 8, y: 8 } });
      } else {
        await page.locator(closeSelector).first().click({ timeout: 10000, force: true });
      }

      await page.waitForTimeout(250);
      const stillVisible = await page.locator(closeSelector).first().isVisible().catch(() => false);
      if (stillVisible) {
        throw new Error('Modal remained visible after close action');
      }

      logResult(name, 'PASS');
    } catch (error) {
      logResult(name, 'FAIL', error instanceof Error ? error.message : String(error));
    }
  };

  try {
    await loginAsAdmin();
    await ensureAdminSessionFallback();
    await waitForAdminTriggers();

    await openAndCloseModal({
      name: 'Booking modal close button',
      openSelectors: ['button[data-action="view-booking"]'],
      closeSelector: 'button[data-action="close-booking-view"]',
    });

    await openAndCloseModal({
      name: 'Booking modal backdrop close',
      openSelectors: ['button[data-action="view-booking"]'],
      closeSelector: 'button[data-action="close-booking-view"]',
      backdropCloseSelector: 'div[data-action="close-booking-view"]',
      extraWaitMs: 150,
    });

    await openAndCloseModal({
      name: 'Inquiry modal close',
      openSelectors: ['button[data-action="view-inquiry"]'],
      closeSelector: 'button[data-action="close-inquiry-view"]',
    });

    await openAndCloseModal({
      name: 'Customer modal close',
      openSelectors: ['button[data-action="view-customer"]'],
      closeSelector: 'button[data-action="close-customer-view"]',
    });

    await openAndCloseModal({
      name: 'Design editor modal close',
      openSelectors: ['button[data-action="open-design-editor"]', 'button[data-action="edit-design"]', 'button[data-action="admin-edit-design"]'],
      closeSelector: 'button[data-action="close-design-editor"]',
    });

    console.log('\n--- Admin Modal Interaction Smoke Summary ---');
    for (const result of results) {
      console.log(`${result.status} | ${result.name} | ${result.details || ''}`);
    }

    const failed = results.some((r) => r.status === 'FAIL');
    await browser.close();
    process.exit(failed ? 2 : 0);
  } catch (fatal) {
    console.error('ADMIN_MODAL_SMOKE_FATAL', fatal instanceof Error ? fatal.message : String(fatal));
    await browser.close();
    process.exit(3);
  }
})();
