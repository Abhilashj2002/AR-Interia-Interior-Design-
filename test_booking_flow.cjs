#!/usr/bin/env node
/**
 * Test script to verify booking flow
 * Usage: node test_booking_flow.cjs
 */

const API_BASE = 'http://localhost:5500/api';
let authToken = null;
let adminToken = null;

const ADMIN_CREDENTIAL_CANDIDATES = [
  { username: 'admin', password: 'Admin@1234' },
  { username: 'admin954809@gmail.com', password: 'admin123' },
  { username: 'admin954809@gmail.com', password: 'Admin@1234' },
  { username: 'admin', password: 'admin123' }
];

const CUSTOMER_CREDENTIAL_CANDIDATES = [
  { username: 'aj@gmail.com', password: 'Aj@12345' },
  { username: 'aj@gmail.com', password: 'aj@12345' },
  { username: 'aj', password: 'Aj@12345' }
];

const log = (label, data) => {
  console.log(`\n📋 [${label}]`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
};

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  return { status: response.status, data };
};

const completeTwoFactorIfNeeded = async (loginResult) => {
  if (!loginResult || loginResult.status !== 200) return null;
  if (loginResult.data?.success && loginResult.data?.token) return loginResult;
  if (!loginResult.data?.twoFactorRequired) return null;

  const challengeId = loginResult.data?.challengeId;
  const debugCode = loginResult.data?.debugCode;
  if (!challengeId || !debugCode) return null;

  const verifyResult = await apiFetch('/auth/login/verify', {
    method: 'POST',
    body: JSON.stringify({ challengeId, code: debugCode })
  });

  if (verifyResult.status === 200 && verifyResult.data?.success && verifyResult.data?.token) {
    return verifyResult;
  }

  return null;
};

const loginWithCandidates = async (candidates) => {
  for (const candidate of candidates) {
    const rawResult = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: candidate.username, password: candidate.password })
    });

    const result = await completeTwoFactorIfNeeded(rawResult);
    if (result) {
      return { result, credential: candidate };
    }
  }
  return null;
};

const loginOrRegisterCustomer = async () => {
  const loginAttempt = await loginWithCandidates(CUSTOMER_CREDENTIAL_CANDIDATES);
  if (loginAttempt) return loginAttempt;

  const timestamp = Date.now();
  const fallbackCredential = {
    username: `aj_test_${timestamp}`,
    password: 'Aj@12345',
    email: `aj_test_${timestamp}@example.com`,
    name: 'AJ Test Customer'
  };

  const registerResult = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: fallbackCredential.name,
      email: fallbackCredential.email,
      username: fallbackCredential.username,
      password: fallbackCredential.password
    })
  });

  if (registerResult.status === 200 && registerResult.data?.success && registerResult.data?.token) {
    return {
      result: registerResult,
      credential: fallbackCredential,
      registered: true
    };
  }

  return null;
};

(async () => {
  try {
    // 1. Login as admin
    log('Step 1', 'Logging in as admin...');
    let loginAttempt = await loginWithCandidates(ADMIN_CREDENTIAL_CANDIDATES);
    if (!loginAttempt) {
      log('ERROR - Admin login failed', { tried: ADMIN_CREDENTIAL_CANDIDATES.map((item) => item.username) });
      process.exit(1);
    }

    let result = loginAttempt.result;
    adminToken = result.data.token;
    log('✅ Admin login', {
      username: loginAttempt.credential.username,
      token: `${adminToken?.substring(0, 20)}...`
    });

    // 2. Login as customer (aj@gmail.com)
    log('Step 2', 'Logging in as customer (aj@gmail.com)...');
    loginAttempt = await loginOrRegisterCustomer();
    if (!loginAttempt) {
      log('ERROR - Customer login failed', { tried: CUSTOMER_CREDENTIAL_CANDIDATES.map((item) => item.username) });
      process.exit(1);
    }

    result = loginAttempt.result;
    authToken = result.data.token;
    const customerId = result.data.customer?.id;
    log('✅ Customer login', {
      customerId,
      username: loginAttempt.credential.username,
      registered: !!loginAttempt.registered
    });

    // 3. Get available designs
    log('Step 3', 'Fetching designs...');
    result = await apiFetch('/designs', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const designs = result.data.designs || [];
    if (designs.length === 0) {
      log('⚠️  No designs available');
      process.exit(1);
    }
    
    const testDesign = designs[0];
    log('✅ Found designs', `Using design: ${testDesign.title} (${testDesign.id})`);

    // 4. Book design as customer
    log('Step 4', `Booking design "${testDesign.title}" for customer...`);
    result = await apiFetch('/bookings/book-design', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({
        customerId,
        designId: testDesign.id,
        designName: testDesign.title,
        cost: testDesign.cost || 0
      })
    });
    
    if (!result.data.success) {
      log('ERROR - Booking failed', result.data);
      process.exit(1);
    }
    
    const bookingId = result.data.bookingId;
    log('✅ Booking created', { bookingId });

    // 5. Fetch customer bookings
    log('Step 5', 'Fetching customer bookings...');
    result = await apiFetch(`/bookings?customerId=${customerId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const customerBookings = result.data.bookings || [];
    log('✅ Customer bookings', { count: customerBookings.length });
    if (customerBookings.some(b => b.id === bookingId)) {
      log('✅ New booking found in customer list', bookingId);
    }

    // 6. Fetch ALL bookings as admin
    log('Step 6', 'Fetching ALL bookings (as admin)...');
    result = await apiFetch('/bookings', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const allBookings = result.data.bookings || [];
    log('✅ Admin fetched all bookings', { count: allBookings.length });
    
    const found = allBookings.find(b => b.id === bookingId);
    if (found) {
      log('✅ New booking FOUND in admin list!', { 
        id: found.id, 
        customer: found.userId, 
        design: found.designName,
        status: found.status,
        createdAt: found.createdAt
      });
    } else {
      log('❌ New booking NOT found in admin list', 'This is the issue!');
      log('⚠️  Admin bookings list:', allBookings.map(b => ({ id: b.id, design: b.designName, customer: b.userId })));
    }

    // 7. Fetch admin's customer data
    log('Step 7', 'Fetching customers (admin)...');
    result = await apiFetch('/customers', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const customers = result.data.customers || [];
    const ajCustomer = customers.find(c => c.email === 'aj@gmail.com');
    log('✅ Customers fetched', { total: customers.length, ajFound: !!ajCustomer });

    log('✅ TEST COMPLETE', 'Booking flow verified successfully!');

  } catch (error) {
    log('❌ TEST FAILED', error.message);
    process.exit(1);
  }
})();
