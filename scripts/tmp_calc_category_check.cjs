
// Playwright script: Validates calculator only shows 4 same-category related designs for every category/quality
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5500');

  // Open calculator UI
  await page.click('[data-action="open-calculator"]');
  await page.waitForSelector('[data-calculator-category]');

  // Get all categories
  const categories = await page.$$eval('[data-calculator-category-option]', btns => btns.map(b => b.getAttribute('data-value')));
  // Get all finish qualities (by data-action="calc-set-quality")
  const qualities = await page.$$eval('[data-action="calc-set-quality"]', btns => btns.map(b => b.getAttribute('data-value')));

  let allPass = true;
  for (const category of categories) {
    // Select category
    await page.click(`[data-calculator-category-option="${category}"]`);
    await page.waitForTimeout(200);
    for (const quality of qualities) {
      // Select quality
      await page.$$eval('[data-action="calc-set-quality"]', (btns, q) => {
        const btn = btns.find(b => b.getAttribute('data-value') === q);
        if (btn) btn.click();
      }, quality);
      await page.waitForTimeout(400);

      // Click calculate button to trigger result and related designs
      const calcBtn = await page.$('[data-action="run-calculation"]');
      if (calcBtn) {
        await calcBtn.click();
        await page.waitForTimeout(600);
      }

      // Get related designs
      const related = await page.$$eval('[data-related-design-category]', els => els.map(e => e.getAttribute('data-related-design-category').toLowerCase()));
      if (related.length !== 4) {
        console.error(`FAIL: Category '${category}' Quality '${quality}' - Expected 4 related designs, got ${related.length}`);
        allPass = false;
        continue;
      }
      for (const rel of related) {
        if (!rel.includes(category.toLowerCase())) {
          console.error(`FAIL: Category '${category}' Quality '${quality}' - Related design '${rel}' does not match category`);
          allPass = false;
        }
      }
      console.log(`PASS: Category '${category}' Quality '${quality}' - 4 related designs, all match category`);
    }
  }
  await browser.close();
  if (allPass) {
    console.log('PASS: All categories and qualities show exactly 4 correct related designs.');
    process.exit(0);
  } else {
    console.error('FAIL: Some categories/qualities did not show 4 correct related designs.');
    process.exit(1);
  }
})();
