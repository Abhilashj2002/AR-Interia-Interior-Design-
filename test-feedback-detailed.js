import playwright from 'playwright';
import fs from 'fs';

const logFile = './feedback-test-log.txt';
function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

(async () => {
  fs.writeFileSync(logFile, '=== Feedback API Path Fix Test ===\n');
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    log('🔍 Navigating to Services page...');
    await page.goto('http://localhost:5500/services', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    log('✅ Services page loaded successfully');

    // Capture all requests to check their paths
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('feedbacks')) {
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          time: new Date().toISOString()
        });
      }
    });

    // Capture all responses
    const apiResponses = [];
    page.on('response', response => {
      if (response.url().includes('feedbacks')) {
        apiResponses.push({
          status: response.status(),
          url: response.url(),
          time: new Date().toISOString()
        });
        log(`📡 API Response: ${response.status()} ${response.url()}`);
      }
    });

    log('🔎 Looking for feedback form...');
    const feedbackForm = await page.$('form[data-form="feedback-public"]');
    if (!feedbackForm) {
      log('⚠️  Feedback form not found');
      log('Page content sample: ' + (await page.content()).substring(0, 500));
      process.exit(1);
    }
    log('✅ Feedback form found');

    // Fill form
    log('📝 Filling form...');
    await page.fill('input[data-bind="customer.feedbackName"]', 'Test User');
    await page.fill('textarea[data-bind="customer.feedbackText"]', 'Test feedback for API verification');
    
    // Select 5 stars
    const starInputs = await page.$$('input[name="rating-public"]');
    if (starInputs.length >= 5) {
      await starInputs[4].click();
      log('⭐ 5-star rating selected');
    }

    log('🚀 Submitting form...');
    const submitBtn = await page.$('button[data-action="submit-feedback-public"]');
    if (submitBtn) {
      // Wait for potential API calls
      const apiTimeout = new Promise(resolve => setTimeout(() => resolve(null), 3000));
      await submitBtn.click();
      await apiTimeout;
      
      log(`📊 API Requests captured: ${apiRequests.length}`);
      apiRequests.forEach((req, i) => {
        log(`  Request ${i+1}: ${req.method} ${req.url}`);
        if (req.url.includes('/api/api/feedbacks')) {
          log('    ❌ ERROR: Path contains double /api prefix!');
        } else if (req.url.includes('/api/feedbacks')) {
          log('    ✅ Correct path: /api/feedbacks');
        }
      });

      log(`📊 API Responses captured: ${apiResponses.length}`);
      apiResponses.forEach((resp, i) => {
        log(`  Response ${i+1}: ${resp.status} ${resp.url}`);
      });
    }

    await page.waitForTimeout(2000);
    
    // Check for success message
    const successMsg = await page.$('text=Thank You');
    if (successMsg) {
      log('✅ SUCCESS: "Thank You" message displayed - feedback submitted!');
    } else {
      log('ℹ️  No success message found yet (might be loaded asynchronously)');
    }

  } catch (err) {
    log(`❌ Error: ${err.message}`);
    log(err.stack);
    process.exit(1);
  } finally {
    await browser.close();
    log('\n=== Test Complete ===');
  }
})();
