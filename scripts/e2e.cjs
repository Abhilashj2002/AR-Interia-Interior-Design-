const { chromium } = require('playwright');

(async () => {
  const base = process.env.E2E_BASE || 'http://localhost:5500';
  console.log('E2E: starting against', base);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    ignoreHTTPSErrors: true,
  });

  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  const gotoWithRetry = async (url, options = {}, attempts = 3) => {
    let lastError;
    for (let i = 1; i <= attempts; i += 1) {
      try {
        await page.goto(url, options);
        return;
      } catch (error) {
        lastError = error;
        if (i < attempts) {
          await page.waitForTimeout(600 * i);
        }
      }
    }
    throw lastError;
  };

  try {
    await gotoWithRetry(base, { waitUntil: 'domcontentloaded', timeout: 15000 }, 3);
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Wait for app to fully render and navigation to be ready
    await page.waitForTimeout(2000);

    // Navigate to luxury showroom and verify related designs change with room selection.
    // On home tab, header nav is not rendered; move to a non-home tab first if needed.
    let showroomNavBtn = page.locator('[data-action="nav"][data-tab="showroom"]').first();
    if ((await showroomNavBtn.count()) === 0) {
      const nonHomeBootstrapNav = page
        .locator('[data-action="nav"][data-tab="gallery"], [data-action="nav"][data-tab="contact"], [data-action="nav"][data-tab="services"]')
        .first();
      if ((await nonHomeBootstrapNav.count()) > 0) {
        await nonHomeBootstrapNav.click();
        await page.waitForTimeout(700);
      }
      showroomNavBtn = page.locator('[data-action="nav"][data-tab="showroom"]').first();
    }
    if ((await showroomNavBtn.count()) === 0) {
      await gotoWithRetry(`${base}/showroom`, { waitUntil: 'domcontentloaded', timeout: 15000 }, 3);
      await page.waitForTimeout(800);
    }

    if ((await showroomNavBtn.count()) > 0) {
      console.log('Navigating to luxury showroom');
      await showroomNavBtn.click();
    }

    const showroomSection = page.locator('.showroom-page').first();
    await showroomSection.waitFor({ state: 'visible', timeout: 10000 });

    const roomButtons = page.locator('[data-action="select-showroom-room"]');
    const roomButtonCount = await roomButtons.count();
    if (roomButtonCount < 2) throw new Error(`Expected at least 2 showroom rooms, found ${roomButtonCount}`);

    const relatedDesignCards = page.locator('.showroom-design-card');
    await page.waitForTimeout(1200);
    const initialDesignCount = await relatedDesignCards.count();
    if (initialDesignCount === 0) throw new Error('No related showroom designs loaded for first room');

    const initialHeading = await page.locator('h3:has-text("Related Designs") span').first().textContent();
    const initialFirstCard = await relatedDesignCards.first().locator('h4').textContent();

    let switched = false;
    for (let index = 1; index < roomButtonCount; index += 1) {
      const targetRoomButton = roomButtons.nth(index);
      const targetRoomName = (await targetRoomButton.locator('.font-semibold, .font-bold').first().textContent()) || `room-${index}`;
      await targetRoomButton.click();
      await page.waitForTimeout(900);

      const nextDesignCount = await relatedDesignCards.count();
      const nextHeading = await page.locator('h3:has-text("Related Designs") span').first().textContent();
      const nextFirstCard = nextDesignCount > 0
        ? await relatedDesignCards.first().locator('h4').textContent()
        : '';

      if ((nextHeading && nextHeading !== initialHeading) || (nextFirstCard && nextFirstCard !== initialFirstCard)) {
        console.log('Showroom switched to room:', targetRoomName, 'designs:', nextDesignCount);
        switched = true;
        break;
      }
    }

    if (!switched) {
      throw new Error('Luxury showroom related designs did not change after switching rooms');
    }
    console.log('Luxury showroom room switching verified');

    // Navigate to contact tab using stable locator API
    const contactNavBtn = page.locator('[data-action="nav"][data-tab="contact"]').first();
    if ((await contactNavBtn.count()) === 0) throw new Error('Contact navigation button not found');
    
    console.log('Navigating to contact tab');
    await contactNavBtn.click();

    // Wait for contact form to appear
    const formSelector = 'form[data-form="inquiry"]';
    await page.waitForSelector(formSelector, { timeout: 10000 });
    
    console.log('Contact form found');

    // Fill form
    const nameInput = page.locator(`${formSelector} input[name="name"]`).first();
    const emailInput = page.locator(`${formSelector} input[name="email"]`).first();
    const messageInput = page.locator(`${formSelector} textarea[name="message"]`).first();

    if ((await nameInput.count()) === 0 || (await emailInput.count()) === 0 || (await messageInput.count()) === 0) {
      throw new Error('Form inputs not found');
    }

    await nameInput.fill('Rahul Mehta');
    await emailInput.fill('rahul.mehta@email.com');
    await messageInput.fill('I would like a consultation for my living room redesign, TV unit, and false ceiling options.');

    console.log('Form filled, submitting...');

    // Submit form and wait for API response
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/contact') && resp.status() === 200, { timeout: 15000 }),
      page.locator(`${formSelector} button[type="submit"]`).first().click(),
    ]);

    const responseData = await response.json();
    console.log('API Response:', responseData);

    // Give UI a moment to show success state
    await page.waitForTimeout(1000);

    console.log('E2E: SUCCESS - Contact form submitted and API responded with 200');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E: FAILED', err.message);
    await browser.close();
    process.exit(2);
  }
})();
