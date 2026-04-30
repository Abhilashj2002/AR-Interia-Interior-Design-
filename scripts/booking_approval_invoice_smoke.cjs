const sqlite3 = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');

const BASE = process.env.API_BASE || 'http://localhost:5175';
const CUSTOMER_EMAIL = 'aj@gmail.com';
const CUSTOMER_PASSWORD = 'Aj@12345';

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

async function ensureSmokeAdmin() {
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
}

async function login(username, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success || !json?.token) {
    throw new Error(`Login failed for ${username}: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function api(path, { token, method = 'GET', body, raw = false } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (body) headers['content-type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (raw) return res;

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`${method} ${path} failed: ${res.status} ${JSON.stringify(json)}`);
  }

  return json;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  try {
    const smokeAdmin = await ensureSmokeAdmin();
    const adminLogin = await login(smokeAdmin.username, smokeAdmin.password);
    const customerLogin = await login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);

    const customerToken = customerLogin.token;
    const customerId = customerLogin.customer.id;
    const adminToken = adminLogin.token;

    const designsResp = await api('/api/designs', { token: customerToken });
    const designs = Array.isArray(designsResp.designs) ? designsResp.designs : [];
    assert(designs.length > 0, 'No designs available for booking');

    const design = designs.find((item) => item && item.id) || designs[0];
    const designName = String(design.title || design.designName || design.name || 'Design');
    const amount = Number(design.cost || design.price || 1);

    const bookingResp = await api('/api/bookings/pay-and-book', {
      token: customerToken,
      method: 'POST',
      body: {
        customerId,
        designId: design.id,
        designName,
        amount,
        cost: amount,
      },
    });

    assert(bookingResp.success && bookingResp.bookingId && bookingResp.paymentId, 'Booking/pay-and-book did not return bookingId and paymentId');

    const bookingId = bookingResp.bookingId;
    const paymentId = bookingResp.paymentId;

    const customerBookingsBefore = await api(`/api/bookings?customerId=${encodeURIComponent(customerId)}`, {
      token: customerToken,
    });
    const customerBookingList = Array.isArray(customerBookingsBefore.bookings) ? customerBookingsBefore.bookings : [];
    assert(customerBookingList.some((booking) => String(booking.id) === String(bookingId)), 'Customer booking list does not contain the new booking');

    const adminBookingsBefore = await api('/api/bookings', { token: adminToken });
    const adminBookingList = Array.isArray(adminBookingsBefore.bookings) ? adminBookingsBefore.bookings : [];
    const adminBookingIndex = adminBookingList.findIndex((booking) => String(booking.id) === String(bookingId));
    assert(adminBookingIndex >= 0, 'Admin bookings list does not contain the new booking');

    await api('/api/bookings/update', {
      token: adminToken,
      method: 'POST',
      body: { bookingId, status: 'fulfilled' },
    });

    const approvalCheck = await api(`/api/bookings?customerId=${encodeURIComponent(customerId)}`, {
      token: customerToken,
    });
    const approvedBooking = (Array.isArray(approvalCheck.bookings) ? approvalCheck.bookings : []).find((booking) => String(booking.id) === String(bookingId));
    assert(approvedBooking, 'Booking disappeared after approval');
    assert(['fulfilled', 'confirmed', 'approved'].includes(String(approvedBooking.status || '').toLowerCase()), `Booking status after approval is unexpected: ${approvedBooking.status}`);

    const paymentResp = await api('/api/payments/fake/complete', {
      token: customerToken,
      method: 'POST',
      body: {
        bookingId,
        paymentId,
        cardNumber: '4111111111111111',
        cvv: '123',
        name: 'AJ Smoke Test',
        amount,
      },
    });
    assert(paymentResp.success, 'Fake payment completion failed');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const invoicesCustomer = await api(`/api/invoices/customer/${encodeURIComponent(customerId)}`, {
      token: customerToken,
    });
    const invoiceList = Array.isArray(invoicesCustomer.invoices) ? invoicesCustomer.invoices : [];
    const generatedInvoice = invoiceList.find((invoice) => String(invoice.paymentId) === String(paymentId) || String(invoice.bookingId) === String(bookingId));
    assert(generatedInvoice, 'No invoice found for the completed payment/booking');

    const adminInvoices = await api('/api/invoices/all', { token: adminToken });
    const adminInvoiceList = Array.isArray(adminInvoices.invoices) ? adminInvoices.invoices : [];
    assert(adminInvoiceList.some((invoice) => String(invoice.paymentId) === String(paymentId) || String(invoice.bookingId) === String(bookingId)), 'Admin invoice list does not contain the generated invoice');

    const adminBookingsAfter = await api('/api/bookings', { token: adminToken });
    const afterList = Array.isArray(adminBookingsAfter.bookings) ? adminBookingsAfter.bookings : [];
    const topBooking = afterList[0];

    const result = {
      customerLogin: true,
      bookingCreated: true,
      bookingFoundInAdminList: true,
      bookingApproved: true,
      paymentCompleted: true,
      invoiceGenerated: true,
      bookingId,
      paymentId,
      designId: String(design.id),
      designName,
      topAdminBookingIsNew: String(topBooking?.id || '') === String(bookingId),
      adminBookingStatus: approvedBooking.status,
      invoiceNumber: generatedInvoice.invoiceNumber || generatedInvoice.id,
      customerInvoiceCount: invoiceList.length,
      adminInvoiceCount: adminInvoiceList.length,
      adminBookingIndex,
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('[booking-approval-invoice-smoke] FAILED');
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  }
})();