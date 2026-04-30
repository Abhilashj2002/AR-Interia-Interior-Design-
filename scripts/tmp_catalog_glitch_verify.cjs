const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const base = process.env.E2E_BASE || 'http://localhost:5500';

  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('form[data-form="login"] input[name="email"]', 'admin');
  await page.fill('form[data-form="login"] input[name="password"]', 'admin123');
  await page.click('form[data-form="login"] button[type="submit"]');
  await page.locator('[data-action="nav"][data-tab="admin"]').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.click('[data-action="nav"][data-tab="admin"]');
  await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 15000 });

  const filter = page.locator('#admin-catalog-filter');
  await filter.waitFor({ state: 'visible', timeout: 10000 });

  const values = await filter.locator('option').evaluateAll((opts) => opts.map((o) => o.value).filter((v) => v && v !== 'all'));
  const sampleCategory = values[0];
  if (!sampleCategory) throw new Error('No category option found');

  await filter.selectOption(sampleCategory);
  const selectedBeforeLoad = await filter.inputValue();
  await page.click('[data-action="admin-load-catalog-category"]');
  await page.waitForTimeout(700);
  const selectedAfterLoad = await filter.inputValue();

  await page.click('[data-action="admin-load-catalog-all"]');
  await page.waitForTimeout(700);
  const selectedAfterLoadAll = await filter.inputValue();

  const designCardsAfterLoadAll = await page.locator('[data-action="open-design-editor"][data-model-id]').count();

  console.log(JSON.stringify({
    success: true,
    sampleCategory,
    selectedBeforeLoad,
    selectedAfterLoad,
    selectedAfterLoadAll,
    designCardsAfterLoadAll
  }, null, 2));

  await browser.close();
})().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});
