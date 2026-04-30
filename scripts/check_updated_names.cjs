const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5500';

const BAD_NAME_PATTERN = /\.(jpg|jpeg|png|webp|gif|avif)$/i;
const BAD_SEPARATOR_PATTERN = /[_-]/;

const checkForBadNames = (values) => values.filter((name) => BAD_NAME_PATTERN.test(name) || BAD_SEPARATOR_PATTERN.test(name));

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const results = [];

  const capture = async (label) => {
    const values = await page.$$eval('[data-image-name]', (els) =>
      els
        .map((el) => (el.getAttribute('data-image-name') || '').trim())
        .filter(Boolean)
    );

    const bad = checkForBadNames(values);
    const uniqueValues = Array.from(new Set(values));

    results.push({
      label,
      total: values.length,
      unique: uniqueValues.length,
      badCount: bad.length,
      badSample: bad.slice(0, 5)
    });
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await capture('home');

    await page.click('[data-action="nav"][data-tab="gallery"]');
    await page.waitForTimeout(900);
    await capture('gallery');

    await page.click('[data-action="nav"][data-tab="categories"]');
    await page.waitForTimeout(900);
    await capture('categories');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.fill('form[data-form="login"] input[name="email"]', 'admin');
    await page.fill('form[data-form="login"] input[name="password"]', 'admin123');
    await page.click('form[data-form="login"] button[type="submit"]');
    await page.locator('[data-action="nav"][data-tab="admin"]').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.click('[data-action="nav"][data-tab="admin"]');
    await page.waitForFunction(() => location.pathname === '/admin', null, { timeout: 15000 });
    await page.waitForTimeout(1200);
    await capture('admin');

    const totalBad = results.reduce((sum, item) => sum + item.badCount, 0);

    results.forEach((item) => {
      console.log(`NAME_CHECK_${item.label.toUpperCase()} total=${item.total} unique=${item.unique} bad=${item.badCount}`);
      if (item.badSample.length > 0) {
        console.log(`NAME_CHECK_${item.label.toUpperCase()}_BAD_SAMPLE`, item.badSample.join(' | '));
      }
    });

    if (totalBad > 0) {
      throw new Error(`Found ${totalBad} image names with filename-style formatting.`);
    }

    console.log('UPDATED_NAMES_CHECK_OK');
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('UPDATED_NAMES_CHECK_FAIL', error?.message || String(error));
    await browser.close();
    process.exit(1);
  }
})();
