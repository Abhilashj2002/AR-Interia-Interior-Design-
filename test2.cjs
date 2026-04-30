const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://127.0.0.1:5500/');
  await page.evaluate(() => {
    localStorage.setItem('ar_interia_user', JSON.stringify({
      id: 'admin-123',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin'
    }));
  });
  
  await page.goto('http://127.0.0.1:5500/admin');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_step1.png' });
  
  await page.evaluate(() => {
    const select = document.getElementById('admin-design-filter');
    if (select) {
      select.value = 'living_room';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test_step2.png' });
  
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-action="admin-load-design-category"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test_step3.png' });
  
  console.log('Test complete. Screenshots saved.');
  await browser.close();
})();
