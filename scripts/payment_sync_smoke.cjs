const BASE_URL = process.env.PAYMENT_SMOKE_BASE || 'http://localhost:5175/api';
const sqlite3 = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');

const dbRun = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const dbGet = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row || null);
  });
});

const ensureSmokeAdmin = async () => {
  const db = new sqlite3.Database('server/ar_interia.db');
  const username = process.env.SMOKE_ADMIN_USER || 'admin_smoke';
  const email = process.env.SMOKE_ADMIN_EMAIL || 'admin.smoke@test.local';
  const password = process.env.SMOKE_ADMIN_PASS || 'Admin@12345';
  const hash = await bcryptjs.hash(password, 10);

  try {
    const existing = await dbGet(db, 'SELECT id FROM customers WHERE username = ? OR email = ? LIMIT 1', [username, email]);
    if (existing?.id) {
      await dbRun(
        db,
        'UPDATE customers SET name = ?, email = ?, username = ?, password = ?, role = ? WHERE id = ?',
        ['Smoke Admin', email, username, hash, 'admin', existing.id]
      );
    } else {
      const id = `cust-smoke-admin-${Date.now()}`;
      await dbRun(
        db,
        'INSERT INTO customers (id, name, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [id, 'Smoke Admin', email, username, hash, 'admin']
      );
    }
  } finally {
    db.close();
  }

  return { username, password };
};

const loginAdmin = async () => {
  const smokeAdmin = await ensureSmokeAdmin();
  const attempts = [
    { username: smokeAdmin.username, password: smokeAdmin.password },
    { username: 'admin', password: 'admin123' },
    { email: 'admin', password: 'admin123' }
  ];

  for (const payload of attempts) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.token) {
      return data.token;
    }
  }

  throw new Error('Admin login failed for payment smoke');
};

const makeUser = async (prefix) => {
  const stamp = Date.now();
  const email = `${prefix}_${stamp}@test.local`;
  const username = `${prefix}_${stamp}`;

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${prefix} User`,
      email,
      username,
      password: 'password123'
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.token || !data?.customer?.id) {
    throw new Error(`Register failed: ${data?.message || response.status}`);
  }

  return { token: data.token, customerId: data.customer.id };
};

const createBookingAndPayment = async (token, customerId, suffix, amount) => {
  const response = await fetch(`${BASE_URL}/bookings/pay-and-book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      customerId,
      designId: `design-${suffix}`,
      amount,
      designName: `Design ${suffix}`,
      cost: amount
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.bookingId || !data?.paymentId) {
    throw new Error(`pay-and-book failed: ${data?.message || response.status}`);
  }

  return { bookingId: data.bookingId, paymentId: data.paymentId };
};

const fetchLatestBooking = async (token, customerId) => {
  const response = await fetch(`${BASE_URL}/bookings?customerId=${encodeURIComponent(customerId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(data?.bookings) || data.bookings.length === 0) {
    throw new Error(`bookings fetch failed: ${data?.message || response.status}`);
  }
  return data.bookings[0];
};

const updatePaymentStatus = async (token, paymentId, status) => {
  const response = await fetch(`${BASE_URL}/payments/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ paymentId, status })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    throw new Error(`payment update failed (${status}): ${data?.message || response.status}`);
  }
};

const completeFakePayment = async (token, bookingId, paymentId) => {
  const response = await fetch(`${BASE_URL}/payments/fake/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      bookingId,
      paymentId,
      cardNumber: '4111111111111111',
      cvv: '123',
      name: 'Smoke Test'
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    throw new Error(`fake payment failed: ${data?.message || response.status}`);
  }
};

const approveBookingAsAdmin = async (adminToken, bookingId) => {
  const response = await fetch(`${BASE_URL}/bookings/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ bookingId, status: 'approved' })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success === false) {
    throw new Error(`booking approval failed: ${data?.message || response.status}`);
  }
};

(async () => {
  try {
    console.log('Payment smoke: starting against', BASE_URL);
    const adminToken = await loginAdmin();

    const failedUser = await makeUser('payfail');
    const failedFlow = await createBookingAndPayment(failedUser.token, failedUser.customerId, 'fail-sync', 555);
    await updatePaymentStatus(failedUser.token, failedFlow.paymentId, 'failed');
    const failedBooking = await fetchLatestBooking(failedUser.token, failedUser.customerId);

    if (failedBooking.status !== 'cancelled' || failedBooking.paymentStatus !== 'failed') {
      throw new Error(`FAILED flow mismatch: bookingStatus=${failedBooking.status} paymentStatus=${failedBooking.paymentStatus}`);
    }

    console.log('Payment smoke: failed flow passed');

    const successUser = await makeUser('paysuccess');
    const successFlow = await createBookingAndPayment(successUser.token, successUser.customerId, 'success-sync', 888);
    await approveBookingAsAdmin(adminToken, successFlow.bookingId);
    await completeFakePayment(successUser.token, successFlow.bookingId, successFlow.paymentId);
    const successBooking = await fetchLatestBooking(successUser.token, successUser.customerId);

    if (successBooking.status !== 'confirmed' || successBooking.paymentStatus !== 'paid') {
      throw new Error(`SUCCESS flow mismatch: bookingStatus=${successBooking.status} paymentStatus=${successBooking.paymentStatus}`);
    }

    console.log('Payment smoke: success flow passed');
    console.log('Payment smoke: ALL CHECKS PASSED');
    process.exit(0);
  } catch (error) {
    console.error('Payment smoke: FAILED', error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
