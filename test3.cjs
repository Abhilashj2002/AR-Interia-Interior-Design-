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
  
  const getCount = async () => page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('div.spidey-panel')).find(p => p.textContent.includes('✏️ Designs'));
    if (!section) return 'Section not found';
    const span = Array.from(section.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('designs'));
    return span ? span.textContent : 'Span not found';
  });
  
  console.log('Initial text:', await getCount());
  
  await page.evaluate(() => {
    const select = document.getElementById('admin-design-filter');
    if (select) {
      select.value = 'living_room';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(1000);
  console.log('Text after selecting dropdown:', await getCount());
  
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-action="admin-load-design-category"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);
  console.log('Final text after load:', await getCount());
  
  await browser.close();
})();
