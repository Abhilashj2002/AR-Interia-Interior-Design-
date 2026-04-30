const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5500/admin');
  await page.waitForTimeout(2000);
  
  const getCount = async () => page.evaluate(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('designs'));
    return span ? span.textContent : 'not found';
  });
  
  console.log('Initial text:', await getCount());
  
  await page.selectOption('select#admin-design-filter', { label: 'Living Room' });
  await page.waitForTimeout(500);
  console.log('Text after selecting:', await getCount());
  
  await page.click('button[data-action="admin-load-design-category"]');
  await page.waitForTimeout(2000);
  console.log('Final text after load:', await getCount());
  
  await browser.close();
})();
