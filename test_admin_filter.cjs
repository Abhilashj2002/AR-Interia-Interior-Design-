const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Go to root first to set localStorage
  await page.goto('http://127.0.0.1:5500/');
  await page.evaluate(() => {
    localStorage.setItem('ar_interia_user', JSON.stringify({
      id: 'admin-123',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin'
    }));
  });
  
  // Now go to admin
  await page.goto('http://127.0.0.1:5500/admin');
  await page.waitForTimeout(1000);
  
  const getCount = async () => page.evaluate(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('designs'));
    return span ? span.textContent : 'not found';
  });
  
  console.log('Initial text:', await getCount());
  
  // Set value and trigger change event
  await page.evaluate(() => {
    const select = document.getElementById('admin-design-filter');
    if (select) {
      // Find an option other than 'all'
      const option = Array.from(select.options).find(o => o.value !== 'all');
      if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  
  await page.waitForTimeout(1000);
  console.log('Text after selecting dropdown:', await getCount());
  
  // Click Load Designs button
  await page.click('button[data-action="admin-load-design-category"]');
  console.log('Clicked Load Designs, waiting for fetch...');
  
  await page.waitForTimeout(3000);
  console.log('Final text after load:', await getCount());
  
  await browser.close();
})();
