const { chromium } = require('playwright');

const BASE = process.env.E2E_BASE || 'http://localhost:5500';
const API_BASE = process.env.SWEEP_API_BASE || 'http://localhost:5175/api';
const DEEP_MODE = String(process.env.SWEEP_DEEP_MODE || '1') !== '0';

const ROLE_ROUTES = {
  customer: ['/dashboard', '/gallery', '/categories', '/portfolio', '/services', '/showroom', '/contact', '/design-studio'],
  admin: ['/admin']
};

const SKIP_ACTIONS = new Set([
  'logout',
  'delete-design',
  'delete-category',
  'delete-service',
  'delete-showroom',
  'delete-feedback-video',
  'delete-feedback-reply',
  'delete-booking',
  'remove-booking',
  'remove-design-image',
  'remove-category-image',
  'confirm-delete-booking',
  'confirm-delete-design',
  'confirm-delete-category'
]);

const shouldSkipAction = (action) => {
  if (!action) return true;
  if (SKIP_ACTIONS.has(action)) return true;
  if (action.startsWith('delete-')) return true;
  if (action.includes('-delete-')) return true;
  if (action.startsWith('remove-') && action !== 'remove-preference') return true;
  if (action.includes('upload')) return true;
  return false;
};

const postJson = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { ok: response.ok, status: response.status, payload };
};

const gotoWithRetry = async (page, url, maxAttempts = 3) => {
  let lastError = null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(500);
    }
  }
  throw lastError || new Error(`Navigation failed for ${url}`);
};

const ensureAuthenticatedUser = async (role) => {
  if (role === 'admin') {
    const adminLogin = await postJson(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (adminLogin.ok && adminLogin.payload?.success && adminLogin.payload?.token) {
      return {
        id: String(adminLogin.payload.customer?.id || 'admin'),
        name: String(adminLogin.payload.customer?.name || 'Administrator'),
        email: String(adminLogin.payload.customer?.email || 'admin'),
        role: 'admin',
        password: 'admin123',
        token: String(adminLogin.payload.token || '')
      };
    }

    return {
      id: 'admin-sweep-smoke',
      name: 'Sweep Admin',
      email: 'admin',
      role: 'admin',
      password: 'admin123'
    };
  }

  const customerEmail = 'sweep.customer@test.local';
  const customerPassword = 'password123';

  let customerLogin = await postJson(`${API_BASE}/auth/login`, {
    username: customerEmail,
    password: customerPassword
  });

  if (!(customerLogin.ok && customerLogin.payload?.success && customerLogin.payload?.token)) {
    await postJson(`${API_BASE}/auth/register`, {
      name: 'Sweep Customer',
      email: customerEmail,
      username: 'sweep.customer',
      password: customerPassword
    });

    customerLogin = await postJson(`${API_BASE}/auth/login`, {
      username: customerEmail,
      password: customerPassword
    });
  }

  if (customerLogin.ok && customerLogin.payload?.success && customerLogin.payload?.token) {
    return {
      id: String(customerLogin.payload.customer?.id || 'cust-sweep-smoke'),
      name: String(customerLogin.payload.customer?.name || 'Sweep Customer'),
      email: String(customerLogin.payload.customer?.email || customerEmail),
      role: 'customer',
      password: customerPassword,
      token: String(customerLogin.payload.token || '')
    };
  }

  return {
    id: 'cust-sweep-smoke',
    name: 'Sweep Customer',
    email: customerEmail,
    role: 'customer',
    password: customerPassword
  };
};

const seedAuthState = async (context, role) => {
  const authUser = await ensureAuthenticatedUser(role);
  await context.addInitScript((seedUser) => {
    const usersKey = 'ar_interia_users';
    const currentKey = `${usersKey}_current`;

    localStorage.setItem(currentKey, JSON.stringify(seedUser));

    let users = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(usersKey) || '[]');
      users = Array.isArray(parsed) ? parsed : [];
    } catch {
      users = [];
    }

    const withoutCurrent = users.filter((u) => String(u?.id || '') !== String(seedUser.id));
    withoutCurrent.unshift(seedUser);
    localStorage.setItem(usersKey, JSON.stringify(withoutCurrent));
  }, authUser);
};

const closeOpenDialogs = async (page) => {
  const closeSelectors = [
    '[data-action^="close-"]',
    '[data-action="cancel-fake-payment"]',
    '[data-action="dismiss-payment-success"]',
    'button[aria-label="Close"]',
    'dialog [data-action="ignore"] + button'
  ];

  for (const selector of closeSelectors) {
    const closeBtn = page.locator(selector).first();
    if ((await closeBtn.count()) === 0) continue;
    const visible = await closeBtn.isVisible().catch(() => false);
    if (!visible) continue;
    await closeBtn.click({ timeout: 1200, force: true }).catch(() => {});
    await page.waitForTimeout(60);
  }

  await page.keyboard.press('Escape').catch(() => {});
};

const interactWithAction = async (page, action) => {
  await closeOpenDialogs(page);

  const locator = page.locator(`[data-action="${action}"]`).first();
  if ((await locator.count()) === 0) return { status: 'missing' };

  const visible = await locator.isVisible().catch(() => false);
  if (!visible) return { status: 'hidden' };

  const metadata = await locator.evaluate((el) => ({
    tagName: el.tagName.toLowerCase(),
    type: (el instanceof HTMLInputElement) ? String(el.type || '').toLowerCase() : '',
    isForm: el.tagName.toLowerCase() === 'form',
    isDisabled: Boolean((el instanceof HTMLButtonElement || el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) ? el.disabled : false)
  })).catch(() => ({ tagName: 'button', type: '', isForm: false, isDisabled: false }));

  if (metadata.isForm) return { status: 'skipped', mode: 'form-action' };
  if (metadata.tagName === 'input' && metadata.type === 'file') return { status: 'skipped', mode: 'file-input' };
  if (metadata.isDisabled) return { status: 'skipped', mode: 'disabled' };

  if (metadata.tagName === 'select') {
    const options = await locator.evaluate((el) => {
      if (!(el instanceof HTMLSelectElement)) return [];
      return Array.from(el.options).map((opt) => opt.value).filter(Boolean);
    }).catch(() => []);

    if (options.length > 1) {
      await locator.selectOption(options[1], { timeout: 3000 });
      await page.waitForTimeout(80);
      return { status: 'ok', mode: 'select' };
    }
    return { status: 'skipped', mode: 'select-no-options' };
  }

  try {
    await locator.click({ timeout: 3000, force: true, noWaitAfter: true });
  } catch (error) {
    const details = String(error?.message || error || '');
    const looksLikeSpaNavigationWait = details.includes('click action done')
      && details.includes('waiting for scheduled navigations to finish');
    if (!looksLikeSpaNavigationWait) throw error;
  }
  await page.waitForTimeout(80);
  await closeOpenDialogs(page);
  return { status: 'ok', mode: 'click' };
};

const collectActionNames = async (page) => page.$$eval('[data-action]', (elements) => {
  const set = new Set();
  elements.forEach((el) => {
    const value = String(el.getAttribute('data-action') || '').trim();
    if (value) set.add(value);
  });
  return Array.from(set);
});

const expandCurrentView = async (page) => {
  const openerActions = await collectActionNames(page);
  const candidates = openerActions.filter((action) => (
    action.startsWith('open-')
    || action.startsWith('show-')
    || action.startsWith('toggle-')
    || action.startsWith('preview-')
  ));

  for (const action of candidates) {
    if (shouldSkipAction(action)) continue;
    await interactWithAction(page, action).catch(() => {});
  }
};

const runSweepForRole = async (role) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  await seedAuthState(context, role);

  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => pageErrors.push(err.message || String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    page.on('response', (resp) => {
      if (resp.status() === 404) consoleErrors.push(`[404] ${resp.url()}`);
    });
  });

  const summary = {
    role,
    routes: [],
    scanned: 0,
    clicked: 0,
    skipped: 0,
    totalActionDurationMs: 0,
    avgActionDurationMs: 0,
    failures: [],
    pageErrors,
    consoleErrors
  };

  try {
    const routes = role === 'admin'
      ? ROLE_ROUTES.admin
      : (DEEP_MODE ? ROLE_ROUTES.customer : ['/dashboard']);

    for (const route of routes) {
      const routeSummary = {
        route,
        scanned: 0,
        clicked: 0,
        skipped: 0,
        durationMs: 0,
        avgActionDurationMs: 0,
        failures: []
      };

      const routeStartedAt = Date.now();
      let routeActionDurationMs = 0;
      await gotoWithRetry(page, `${BASE}${route}`);
      await page.waitForTimeout(500);

      if (DEEP_MODE) await expandCurrentView(page);

      const actions = await collectActionNames(page);
      for (const action of actions) {
        routeSummary.scanned += 1;
        summary.scanned += 1;

        if (shouldSkipAction(action)) {
          routeSummary.skipped += 1;
          summary.skipped += 1;
          continue;
        }

        try {
          const actionStartedAt = Date.now();
          const result = await interactWithAction(page, action);
          const actionDurationMs = Date.now() - actionStartedAt;
          summary.totalActionDurationMs += actionDurationMs;
          routeActionDurationMs += actionDurationMs;
          if (result.status === 'ok') {
            routeSummary.clicked += 1;
            summary.clicked += 1;
          } else {
            routeSummary.skipped += 1;
            summary.skipped += 1;
          }
        } catch (error) {
          const failure = {
            action,
            error: error instanceof Error ? error.message : String(error)
          };
          routeSummary.failures.push(failure);
          summary.failures.push({ route, ...failure });
          await closeOpenDialogs(page);
        }
      }

      routeSummary.durationMs = Date.now() - routeStartedAt;
      routeSummary.avgActionDurationMs = routeSummary.scanned > 0
        ? Math.round((routeActionDurationMs / routeSummary.scanned) * 100) / 100
        : 0;

      summary.routes.push(routeSummary);
    }
  } catch (error) {
    summary.failures.push({
      action: 'sweep-start',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  await browser.close();
  summary.avgActionDurationMs = summary.scanned > 0
    ? Math.round((summary.totalActionDurationMs / summary.scanned) * 100) / 100
    : 0;
  return summary;
};

(async () => {
  const customerSummary = await runSweepForRole('customer');
  const adminSummary = await runSweepForRole('admin');

  const combinedFailures = [
    ...customerSummary.failures,
    ...adminSummary.failures
  ];

  const report = {
    deepMode: DEEP_MODE,
    customer: customerSummary,
    admin: adminSummary,
    totals: {
      scanned: customerSummary.scanned + adminSummary.scanned,
      clicked: customerSummary.clicked + adminSummary.clicked,
      skipped: customerSummary.skipped + adminSummary.skipped,
      failures: combinedFailures.length,
      pageErrors: customerSummary.pageErrors.length + adminSummary.pageErrors.length,
      consoleErrors: customerSummary.consoleErrors.length + adminSummary.consoleErrors.length
    }
  };

  console.log('ACTION_CLICK_SWEEP_REPORT_START');
  console.log(JSON.stringify(report, null, 2));
  console.log('ACTION_CLICK_SWEEP_REPORT_END');

  if (combinedFailures.length > 0) process.exit(2);
  process.exit(0);
})();
