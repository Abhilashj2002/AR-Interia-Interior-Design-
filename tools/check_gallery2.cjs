const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR', err.toString()));
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const hasCategoryGallery = await page.evaluate(() => document.body.innerText.includes('Category Gallery'));
    const openImageCount = await page.evaluate(() => document.querySelectorAll('[data-action="open-image-lightbox"]').length);
    const refImageCount = await page.evaluate(() => {
      const el = document.querySelector('#category-images-view');
      return el ? el.querySelectorAll('img').length : 0;
    });
    console.log('HAS_CATEGORY_GALLERY', hasCategoryGallery);
    console.log('OPEN_IMAGE_COUNT', openImageCount);
    console.log('REF_IMAGE_COUNT', refImageCount);
  } catch (e) {
    console.log('ERROR', e.toString());
  } finally {
    await browser.close();
  }
})();
