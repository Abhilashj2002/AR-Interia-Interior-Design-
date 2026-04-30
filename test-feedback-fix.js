import playwright from 'playwright';

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    // Set admin session for test purposes
    await page.context().addInitScript(() => {
      localStorage.setItem('ar_interia_users_current', JSON.stringify({
        id: 'test-user-123',
        name: 'Test Customer',
        email: 'test@example.com',
        customerId: 'cust-123'
      }));
    });

    // Navigate to Services page
    await page.goto('http://localhost:5500/services', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log('✅ Services page loaded');

    // Find and click on the feedback form if visible
    const feedbackForm = await page.$('form[data-form="feedback-public"]');
    if (feedbackForm) {
      console.log('✅ Feedback form found');

      // Fill in form fields
      const nameInput = await page.$('input[data-bind="customer.feedbackName"]');
      if (nameInput) {
        await nameInput.fill('Test Customer');
        console.log('✅ Name filled');
      }

      const commentTextarea = await page.$('textarea[data-bind="customer.feedbackText"]');
      if (commentTextarea) {
        await commentTextarea.fill('This is a test feedback to verify the API path fix works correctly.');
        console.log('✅ Comment filled');
      }

      // Set rating (5 stars)
      const ratingInputs = await page.$$('input[name="rating-public"]');
      if (ratingInputs.length > 0) {
        await ratingInputs[4].click(); // Click 5-star option
        console.log('✅ 5-star rating selected');
      }

      // Listen for API calls to verify they go to /api/feedbacks (not /api/api/feedbacks)
      let feedbackApiCalled = false;
      let apiError = null;

      page.on('response', response => {
        const url = response.url();
        if (url.includes('/feedbacks')) {
          console.log(`📡 API Response: ${response.status()} ${url}`);
          if (url.includes('/api/api/feedbacks')) {
            apiError = 'WRONG PATH: /api/api/feedbacks detected!';
          } else if (url.includes('/api/feedbacks') && response.status() === 200) {
            feedbackApiCalled = true;
            console.log('✅ Feedback API called correctly to /api/feedbacks');
          }
        }
      });

      // Click submit button
      const submitBtn = await page.$('button[data-action="submit-feedback-public"]');
      if (submitBtn) {
        await submitBtn.click();
        console.log('📝 Submit button clicked');
        
        // Wait for response and UI update
        await page.waitForTimeout(2000);

        // Check for success message or error
        const thankYouMsg = await page.$('text=Thank You');
        const errorMsg = await page.$('text=Error');

        if (thankYouMsg) {
          console.log('✅ Thank You message displayed - feedback submitted!');
        } else if (errorMsg) {
          console.log('❌ Error message shown');
        }

        // Check console for errors
        const logs = [];
        page.on('console', msg => {
          logs.push(msg.text());
          if (msg.text().includes('Failed to save feedback') || msg.text().includes('404')) {
            apiError = msg.text();
          }
        });

        await page.waitForTimeout(1000);
        console.log('📋 Console logs:', logs.filter(l => l.includes('feedback') || l.includes('API') || l.includes('Error')));
      }

      if (apiError) {
        console.log('❌ ERROR:', apiError);
        process.exit(1);
      } else if (feedbackApiCalled) {
        console.log('✅ All checks passed - feedback API fixed!');
      }
    } else {
      console.log('⚠️  Feedback form not found on page');
      const pageContent = await page.content();
      if (pageContent.includes('feedback')) {
        console.log('ℹ️  Page contains "feedback" text');
      }
    }

    await page.waitForTimeout(1000);
  } catch (err) {
    console.error('❌ Test error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
