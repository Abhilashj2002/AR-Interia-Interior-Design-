const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  const results = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  const pass = (name, details = '') => {
    results.push({ name, status: 'PASS', details });
    console.log(`PASS: ${name}${details ? ' - ' + details : ''}`);
  };
  const fail = (name, err) => {
    const details = String(err?.message || err);
    results.push({ name, status: 'FAIL', details });
    console.log(`FAIL: ${name} - ${details}`);
  };

  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    try {
      const playBtn = page.locator('[data-action="play-video"]').first();
      await playBtn.waitFor({ state: 'visible', timeout: 10000 });
      await playBtn.click();
      await page.locator('#video-modal').waitFor({ state: 'visible', timeout: 8000 });
      const hasPlayer = await page.locator('#video-modal video, #video-modal iframe').count();
      if (hasPlayer > 0) {
        pass('Home famous video opens and plays', `players found: ${hasPlayer}`);
      } else {
        throw new Error('Video modal opened but no player found');
      }
      await page.mouse.click(10, 10);
      await page.locator('#video-modal').waitFor({ state: 'hidden', timeout: 8000 });
    } catch (e) {
      fail('Home famous video opens and plays', e);
    }

    try {
      const svcCard = page.locator('button[data-action="nav"][data-tab="services"]:has-text("3D Design Studio")').first();
      await svcCard.waitFor({ state: 'visible', timeout: 10000 });
      await svcCard.click();
      await page.waitForFunction(() => location.pathname === '/services', null, { timeout: 10000 });
      pass('Home services card navigates to services');
    } catch (e) {
      fail('Home services card navigates to services', e);
    }

    try {
      const detailsBtn = page.locator('[data-action="service-details"]').first();
      await detailsBtn.waitFor({ state: 'visible', timeout: 10000 });
      await detailsBtn.click();
      await page.waitForTimeout(1000);
      const modalVisible = await page.locator('#video-modal').isVisible().catch(() => false);
      if (modalVisible || (await page.locator('[data-action="close-video"]').count()) > 0) {
        pass('Services details action is clickable', 'video modal path');
        if (modalVisible) {
          await page.locator('#video-modal [data-action="close-video"]').first().click({ timeout: 5000 }).catch(() => {});
        }
      } else {
        pass('Services details action is clickable', 'non-video path');
      }
    } catch (e) {
      fail('Services details action is clickable', e);
    }

    try {
      await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.locator('form[data-form="login"]').waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('form[data-form="login"] input[name="email"]').fill('admin');
      await page.locator('form[data-form="login"] input[name="password"]').fill('admin123');
      await page.locator('form[data-form="login"] button[type="submit"]').click();

      const adminNav = page.locator('[data-action="nav"][data-tab="admin"]').first();
      await adminNav.waitFor({ state: 'visible', timeout: 12000 });
      await adminNav.click();
      await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 12000 });

      const form = page.locator('form[data-form="chatbot-settings"]');
      await form.waitFor({ state: 'visible', timeout: 12000 });
      await form.locator('input[name="assistantName"]').fill('Aria QA');
      await form.locator('button[type="submit"]').click();
      await page.waitForTimeout(700);

      const resetBtn = page.locator('[data-action="reset-chatbot-settings"]').first();
      await resetBtn.click();
      await page.waitForTimeout(700);

      pass('Admin chatbot settings save/reset', 'form submit + reset click completed');
    } catch (e) {
      fail('Admin chatbot settings save/reset', e);
    }

    console.log('\n--- Smoke Summary ---');
    for (const r of results) {
      console.log(`${r.status} | ${r.name} | ${r.details || ''}`);
    }

    const hasFail = results.some((r) => r.status === 'FAIL');
    await browser.close();
    process.exit(hasFail ? 2 : 0);
  } catch (fatal) {
    console.error('FATAL:', fatal);
    await browser.close();
    process.exit(3);
  }
})();
