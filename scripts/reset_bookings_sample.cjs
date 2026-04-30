const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'server', 'ar_interia.db');
const db = new sqlite3.Database(dbPath);

const allAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
});

const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const randomPick = (arr, index) => arr[index % arr.length];
const PREFERRED_TITLES = ['Ocean Mist', 'Sunlit Atrium Courtyard'];

(async () => {
  try {
    console.log('[reset-bookings] Using DB:', dbPath);

    const customers = await allAsync("SELECT id, name FROM customers WHERE role = 'customer' ORDER BY createdAt ASC LIMIT 20");
    const designs = await allAsync("SELECT id, title, categoryId, price, previewImage FROM designs WHERE COALESCE(previewImage, '') != '' AND COALESCE(previewImage, '') != '/hero-bg.webp' AND title NOT LIKE 'QA Motion Design%' AND title NOT LIKE 'TMP CHECK %' ORDER BY categoryId ASC, id ASC");

    if (!customers.length) throw new Error('No customers found.');
    if (!designs.length) throw new Error('No designs found.');

    const preferredDesigns = PREFERRED_TITLES
      .map((title) => designs.find((design) => String(design.title || '').trim() === title))
      .filter(Boolean);
    const remainingDesigns = designs.filter((design) => !PREFERRED_TITLES.includes(String(design.title || '').trim()));
    const seedDesigns = [...preferredDesigns, ...remainingDesigns];

    await runAsync('BEGIN TRANSACTION');

    // Remove dependent rows first, then bookings.
    await runAsync('DELETE FROM payments');
    await runAsync('DELETE FROM bookings');

    const statusCycle = ['pending', 'approved', 'confirmed'];
    const paymentStatusByBookingStatus = {
      pending: 'pending',
      approved: 'pending',
      confirmed: 'completed'
    };

    const bookingCount = 24;
    let insertedBookings = 0;
    let insertedPayments = 0;

    for (let i = 0; i < bookingCount; i += 1) {
      const customer = randomPick(customers, i);
      const design = randomPick(seedDesigns, i);
      const status = statusCycle[i % statusCycle.length];
      const bookingId = `book-sample-${Date.now()}-${i}`;
      const paymentId = `pay-sample-${Date.now()}-${i}`;
      const amount = Number(design.price || 0);

      await runAsync(
        'INSERT INTO bookings (id, customerId, designId, designName, cost, status) VALUES (?, ?, ?, ?, ?, ?)',
        [bookingId, customer.id, design.id, String(design.title || 'Interior Design'), amount, status]
      );
      insertedBookings += 1;

      await runAsync(
        'INSERT INTO payments (id, customerId, designId, bookingId, amount, status, method) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [paymentId, customer.id, design.id, bookingId, amount, paymentStatusByBookingStatus[status], 'sample-seed']
      );
      insertedPayments += 1;
    }

    await runAsync('COMMIT');

    const bookingTotal = await allAsync('SELECT COUNT(*) AS count FROM bookings');
    const paymentTotal = await allAsync('SELECT COUNT(*) AS count FROM payments');

    console.log(`[reset-bookings] Inserted bookings: ${insertedBookings}`);
    console.log(`[reset-bookings] Inserted payments: ${insertedPayments}`);
    console.log(`[reset-bookings] Total bookings in DB: ${bookingTotal[0]?.count || 0}`);
    console.log(`[reset-bookings] Total payments in DB: ${paymentTotal[0]?.count || 0}`);
    console.log('[reset-bookings] Done. Refresh admin dashboard to see updated data.');
  } catch (error) {
    try { await runAsync('ROLLBACK'); } catch (_) {}
    console.error('[reset-bookings] Failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
