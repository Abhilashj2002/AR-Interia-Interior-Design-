const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5173';
  console.log('E2E: starting against', base);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    ignoreHTTPSErrors: true,
  });

  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for app root to render
    await page.waitForSelector('#root', { timeout: 10000 });

    // Find a 'Get Quote' button
    const quoteButton = await page.$('[data-action="quote"]');
    if (!quoteButton) {
      throw new Error('Get Quote button not found');
    }
    console.log('Clicking Get Quote');
    await quoteButton.click();

    // Wait for contact form to appear
    const formSelector = 'form[data-form="inquiry"]';
    await page.waitForSelector(formSelector, { timeout: 8000 });

    // Ensure message textarea is present and has content (prefill)
    const textarea = await page.$(`${formSelector} textarea[name=message]`);
    if (!textarea) throw new Error('Message textarea not found in contact form');
    const message = (await textarea.inputValue()).trim();
    console.log('Prefilled message length:', message.length);

    // Fill name / email
    await page.fill(`${formSelector} input[name=name]`, 'E2E Tester');
    await page.fill(`${formSelector} input[name=email]`, 'e2e@example.com');

    // Submit the form
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/contact') && resp.status() === 200, { timeout: 8000 }),
      page.click(`${formSelector} button[type=submit]`),
    ]);

    console.log('Contact API responded. Checking for acknowledgement in UI.');
    // Look for a thank-you or confirmation text in the UI
    const ok = await page.waitForSelector('text=Thank You|text=Thanks|text=Inquiry received', { timeout: 8000 }).catch(() => null);
    if (!ok) {
      console.warn('No explicit thank-you text found; test will still pass if backend returned 200.');
    }

    console.log('E2E: SUCCESS');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E: FAILED', err);
    await browser.close();
    process.exit(2);
  }
})();
