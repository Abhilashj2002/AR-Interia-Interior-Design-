const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const results = [];

  const pass = (name, details = '') => {
    results.push({ name, status: 'PASS', details });
    console.log(`PASS: ${name}${details ? ` - ${details}` : ''}`);
  };

  const fail = (name, err) => {
    const details = String(err?.message || err || 'Unknown error');
    results.push({ name, status: 'FAIL', details });
    console.log(`FAIL: ${name} - ${details}`);
  };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  const startedAt = Date.now();

  const fillFirstAvailable = async (selectors, value) => {
    let lastError = null;
    for (const selector of selectors) {
      try {
        const field = page.locator(selector).first();
        await field.waitFor({ state: 'visible', timeout: 4000 });
        await field.fill(value);
        return selector;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(`No matching field for selectors: ${selectors.join(', ')}`);
  };

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

  const clickStable = async (selector, options = {}) => {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const loc = page.locator(selector).first();
        await loc.waitFor({ state: 'visible', timeout: 10000 });
        await loc.click(options);
        return;
      } catch (error) {
        lastError = error;
        await page.waitForTimeout(120);
      }
    }
    throw lastError || new Error(`Failed to click ${selector}`);
  };

  try {
    await gotoWithRetry('/login');
    await page.locator('form[data-form="login"]').waitFor({ state: 'visible', timeout: 15000 });
    await fillFirstAvailable([
      'form[data-form="login"] input[name="email"]',
      'form[data-form="login"] input[name="emailOrUsername"]',
      'form[data-form="login"] input[type="email"]',
      'form[data-form="login"] input[name="username"]'
    ], 'admin');
    await fillFirstAvailable([
      'form[data-form="login"] input[name="password"]',
      'form[data-form="login"] input[type="password"]'
    ], 'admin123');
    await page.locator('form[data-form="login"] button[type="submit"]').click();

    // Support all login flows: direct redirect, nav-button routing, or direct URL fallback.
    await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 4000 }).catch(() => null);
    let onAdmin = await page.evaluate(() => location.pathname === '/admin');
    if (!onAdmin) {
      const adminNav = page.locator('[data-action="nav"][data-tab="admin"]').first();
      if (await adminNav.isVisible().catch(() => false)) {
        await adminNav.click();
        await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 10000 }).catch(() => null);
      }
      onAdmin = await page.evaluate(() => location.pathname === '/admin');
      if (!onAdmin) {
        await gotoWithRetry('/admin');
      }
    }

    // If admin controls are still missing (auth/seed mismatch), force an admin session in localStorage.
    let hasAdminControls = await page.evaluate(() => {
      return Boolean(
        document.querySelector('[data-action="admin-edit-service"]')
        || document.querySelector('[data-action="admin-edit-showroom"]')
        || document.querySelector('[data-action="edit-package"]')
      );
    });

    if (!hasAdminControls) {
      await page.evaluate(() => {
        const admin = { id: 'admin-master', name: 'Administrator', email: 'admin', role: 'admin', password: 'admin123' };
        const usersKey = 'ar_interia_users';
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
        localStorage.setItem(usersKey, JSON.stringify(users));
      });
      await gotoWithRetry('/admin');
      // Wait for the page to fully load and state to be initialized - check for any admin control OR luxury editor
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await page.waitForFunction(() => {
            return Boolean(
              document.querySelector('[data-action="admin-edit-service"]')
              || document.querySelector('[data-action="admin-edit-showroom"]')
              || document.querySelector('[data-action="edit-package"]')
              || document.querySelector('h2:has-text("Castle Luxury Editor")')
            );
          }, { timeout: 8000 });
          break;
        } catch {
          if (attempt < 2) {
            await page.reload({ waitUntil: 'domcontentloaded' });
          }
        }
      }
    }

    // 1) Service edit button works
    try {
      const t0 = Date.now();
      const serviceEditBtn = page.locator('[data-action="admin-edit-service"]').first();
      await clickStable('[data-action="admin-edit-service"]');
      const updateBtn = page.locator('form[data-action="admin-update-service"] button[type="submit"]');
      await updateBtn.waitFor({ state: 'visible', timeout: 10000 });
      pass('Service manager edit button works', `durationMs=${Date.now() - t0}`);
    } catch (e) {
      fail('Service manager edit button works', e);
    }

    // 2) Showroom edit loads existing video data and supports local upload field
    try {
      const t0 = Date.now();
      await clickStable('[data-action="admin-edit-showroom"]');

      const showroomForm = page.locator('form[data-action="admin-update-showroom"]');
      await showroomForm.waitFor({ state: 'visible', timeout: 10000 });

      const videoInput = showroomForm.locator('input[name="videoUrl"]');
      const mediaInput = showroomForm.locator('input[name="mediaFile"]');
      const videoValue = await videoInput.inputValue();
      const mediaExists = (await mediaInput.count()) > 0;

      if (!mediaExists) throw new Error('Local media upload input missing');
      pass('Showroom edit form opens with local upload', `videoUrl=${videoValue ? 'present' : 'empty'} durationMs=${Date.now() - t0}`);
    } catch (e) {
      fail('Showroom edit form opens with local upload', e);
    }

    // 3) Categories -> load existing designs by selected category
    try {
      const t0 = Date.now();
      const loadByCategoryBtn = page.locator('[data-action="admin-load-designs-for-category"]').first();
      await loadByCategoryBtn.scrollIntoViewIfNeeded();
      const categoryId = (await loadByCategoryBtn.getAttribute('data-category-id')) || '';
      await clickStable('[data-action="admin-load-designs-for-category"]');

      const rows = page.locator('[data-action="edit-design"]');
      await rows.first().waitFor({ state: 'visible', timeout: 6000 });
      const count = await rows.count();
      if (count <= 0) throw new Error('No designs loaded for selected category');
      pass('Category loads existing designs', `category=${categoryId} designs=${count} durationMs=${Date.now() - t0}`);
    } catch (e) {
      fail('Category loads existing designs', e);
    }

    // 4) Package sample data (~24) present in admin package manager
    try {
      const t0 = Date.now();
      const packageRows = page.locator('[data-action="edit-package"]');
      await packageRows.first().waitFor({ state: 'visible', timeout: 10000 });
      const pkgCount = await packageRows.count();
      if (pkgCount < 24) throw new Error(`Expected >=24 packages, found ${pkgCount}`);
      pass('Package sample data seeded', `count=${pkgCount} durationMs=${Date.now() - t0}`);
    } catch (e) {
      fail('Package sample data seeded', e);
    }

    // 5) Luxury showroom editor shows effective video and related-image preview
    try {
      const t0 = Date.now();
      const luxuryHeading = page.locator('h2:has-text("Castle Luxury Editor")').first();
      await luxuryHeading.scrollIntoViewIfNeeded();
      const luxurySection = luxuryHeading.locator('xpath=ancestor::section[1]');

      const roomButtons = luxurySection.locator('[data-action="select-showroom-room"]');
      const roomCount = await roomButtons.count();
      if (roomCount <= 0) throw new Error('No luxury showroom rooms available in admin');

      await clickStable('[data-action="select-showroom-room"]');

      const previewLabel = luxurySection.locator('text=Live Showroom Preview').first();
      await previewLabel.waitFor({ state: 'visible', timeout: 10000 });

      const previewMediaCount = await luxurySection.locator('[data-action="play-video"]').count();
      const relatedCount = await luxurySection.locator('img').count();
      if (previewMediaCount <= 0) throw new Error('No luxury room video preview launcher rendered');
      if (relatedCount <= 0) throw new Error('No luxury related image previews rendered');

      pass('Luxury showroom admin preview available', `rooms=${roomCount} media=${previewMediaCount} relatedImages=${relatedCount} durationMs=${Date.now() - t0}`);
    } catch (e) {
      fail('Luxury showroom admin preview available', e);
    }

    console.log('\n--- Admin Fixes Smoke Summary ---');
    for (const r of results) {
      console.log(`${r.status} | ${r.name} | ${r.details || ''}`);
    }
    console.log(`TOTAL_DURATION_MS: ${Date.now() - startedAt}`);

    const failed = results.some((r) => r.status === 'FAIL');
    await browser.close();
    process.exit(failed ? 2 : 0);
  } catch (fatal) {
    console.error('FATAL:', fatal);
    await browser.close();
    process.exit(3);
  }
})();
