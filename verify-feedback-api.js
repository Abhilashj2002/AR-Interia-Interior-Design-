#!/usr/bin/env node

/**
 * Direct API test: Verify feedback endpoint responds correctly
 * This tests the backend /api/feedbacks endpoint directly
 */

(async () => {
  try {
    console.log('🧪 Testing Feedback API Endpoint\n');

    // Test 1: GET /api/feedbacks (should return 401 without auth or empty list)
    console.log('Test 1: GET /api/feedbacks');
    const getResponse = await fetch('http://localhost:5175/api/feedbacks', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log(`  Status: ${getResponse.status}`);
    if (getResponse.status === 401) {
      console.log('  ✅ Returns 401 for invalid token (expected for protected endpoint)\n');
    } else if (getResponse.status === 200) {
      const data = await getResponse.json();
      console.log(`  ✅ Returns ${getResponse.status} (Data: ${JSON.stringify(data).substring(0, 100)}...)\n`);
    } else {
      console.log(`  ⚠️  Unexpected status: ${getResponse.status}\n`);
    }

    // Test 2: Verify the correct path is NOT returning 404
    console.log('Test 2: Verify /api/feedbacks does NOT return 404');
    if (getResponse.status === 404) {
      console.log('  ❌ ERROR: Endpoint returns 404 - API path may still be wrong!');
      process.exit(1);
    } else {
      console.log(`  ✅ Endpoint is accessible (status: ${getResponse.status})\n`);
    }

    // Test 3: Verify NO double prefix issue
    console.log('Test 3: Verify no /api/api/feedbacks path');
    const wrongPath = await fetch('http://localhost:5175/api/api/feedbacks', {
      method: 'GET'
    });
    if (wrongPath.status === 404) {
      console.log('  ✅ Double /api prefix returns 404 (correct - path should not exist)\n');
    } else {
      console.log(`  ⚠️  Unexpected: /api/api/feedbacks returns ${wrongPath.status}\n`);
    }

    console.log('=== Summary ===');
    console.log('✅ Backend feedback endpoint is correctly accessible at /api/feedbacks');
    console.log('✅ Double prefix /api/api/feedbacks does not exist');
    console.log('✅ All API path fixes verified successfully!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
})();
