const sqlite3 = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');

const BASE = process.env.API_BASE || 'http://localhost:5175';

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
  const json = await res.json();

  if (res.ok && json?.twoFactorRequired && json?.challengeId && json?.debugCode) {
    const verifyRes = await fetch(`${BASE}/api/auth/login/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        challengeId: json.challengeId,
        code: json.debugCode,
      }),
    });
    const verifyJson = await verifyRes.json();
    if (!verifyRes.ok || !verifyJson?.success || !verifyJson?.token) {
      throw new Error(`2FA verification failed: ${verifyRes.status} ${JSON.stringify(verifyJson)}`);
    }
    return verifyJson;
  }

  if (!res.ok || !json?.success || !json?.token) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(json)}`);
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

async function insertSmokePayment(customerId, bookingId, paymentId) {
  const db = new sqlite3.Database('server/ar_interia.db');
  const amount = 42000;
  try {
    await dbRun(
      db,
      `INSERT INTO bookings (id, customerId, designId, designName, cost, status, bookingDate, price)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
      [bookingId, customerId, 'design-smoke', 'Smoke Test Design', amount, 'approved', amount]
    );

    await dbRun(
      db,
      `INSERT INTO payments (id, customerId, designId, bookingId, amount, status, method, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [paymentId, customerId, 'design-smoke', bookingId, amount, 'pending', 'fake-card', '{}']
    );
  } finally {
    db.close();
  }
}

async function main() {
  const smokeAdmin = await ensureSmokeAdmin();
  const admin = await login(smokeAdmin.username, smokeAdmin.password);
  const token = admin.token;
  const customerId = admin.customer.id;

  const before = await api('/api/invoices/all', { token });

  const sample = await api('/api/invoices/create-sample', { token, method: 'POST' });
  const sampleInvoiceId = sample?.invoice?.invoice?.id || sample?.invoice?.id;
  const sampleInvoiceNumber = sample?.invoice?.invoiceNumber || sample?.invoice?.invoice?.invoiceNumber;

  if (!sample?.success || !sampleInvoiceId || !sampleInvoiceNumber) {
    throw new Error(`Sample invoice creation response malformed: ${JSON.stringify(sample)}`);
  }

  const byId = await api(`/api/invoices/id/${sampleInvoiceId}`, { token });
  const customerInvoices = await api(`/api/invoices/customer/${customerId}`, { token });

  const viewRes = await api(`/api/invoices/view/${sampleInvoiceNumber}`, { raw: true });
  const dlRes = await api(`/api/invoices/download/${sampleInvoiceNumber}`, { raw: true });

  if (viewRes.status !== 200 || !String(viewRes.headers.get('content-type') || '').includes('application/pdf')) {
    throw new Error(`Invoice view endpoint invalid: status=${viewRes.status} type=${viewRes.headers.get('content-type')}`);
  }

  if (dlRes.status !== 200 || !String(dlRes.headers.get('content-type') || '').includes('application/pdf')) {
    throw new Error(`Invoice download endpoint invalid: status=${dlRes.status} type=${dlRes.headers.get('content-type')}`);
  }

  const stamp = Date.now();
  const bookingId = `bk-smoke-${stamp}`;
  const paymentId = `pay-smoke-${stamp}`;

  await insertSmokePayment(customerId, bookingId, paymentId);

  const paymentResp = await api('/api/payments/fake/complete', {
    token,
    method: 'POST',
    body: {
      bookingId,
      paymentId,
      cardNumber: '4111 1111 1111 1111',
      cvv: '123',
      name: 'Admin User',
      amount: 42000,
    },
  });

  if (!paymentResp?.success) {
    throw new Error(`Payment completion failed: ${JSON.stringify(paymentResp)}`);
  }

  await new Promise((r) => setTimeout(r, 350));

  const after = await api('/api/invoices/all', { token });
  const generated = (after?.invoices || []).find((x) => x.paymentId === paymentId);
  if (!generated) {
    throw new Error('Payment completed but no invoice generated for smoke payment id');
  }

  const report = {
    login: true,
    invoicesBefore: before.count,
    sampleInvoiceCreated: true,
    getById: !!byId?.success,
    customerInvoicesCount: customerInvoices.count,
    pdfViewOk: true,
    pdfDownloadOk: true,
    paymentCompletionOk: true,
    paymentInvoiceGenerated: true,
    generatedInvoiceNumber: generated.invoiceNumber,
    invoicesAfter: after.count,
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error('[smoke-invoices] FAILED');
  console.error(err?.stack || err?.message || err);
  process.exitCode = 1;
});
