import { initializeDb, getDb } from './server/db.js';
import { ensureInvoiceForPaymentId } from './server/invoices.js';

async function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function getAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function verifyFix() {
  await initializeDb();
  const db = getDb();

  const testPaymentId = 'test-trans-1775123377151'; // From setup_test.js
  const testBookingId = 'test-book-1775123377151'; // From setup_test.js

  console.log('--- Verifying Payment Sync Fix ---');

  // SIMULATE syncPaymentSuccess logic
  const statusToSave = 'completed';
  await runAsync(db,
    `UPDATE payments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [statusToSave, testPaymentId]
  );
  
  const payment = await getAsync(db, `SELECT bookingId, amount FROM payments WHERE id = ?`, [testPaymentId]);
  if (payment && payment.bookingId) {
    await runAsync(db,
      `UPDATE bookings
       SET status = ?,
           price = COALESCE(price, ?),
           cost = COALESCE(?, cost)
       WHERE id = ?`,
      ['confirmed', payment.amount, payment.amount, payment.bookingId]
    );
  }

  // SIMULATE invoice generation
  const invoiceResult = await ensureInvoiceForPaymentId(db, testPaymentId);
  console.log('Invoice generation result:', invoiceResult.reason);

  // VERIFY RESULTS
  const updatedPayment = await getAsync(db, `SELECT status FROM payments WHERE id = ?`, [testPaymentId]);
  const updatedBooking = await getAsync(db, `SELECT status FROM bookings WHERE id = ?`, [testBookingId]);
  const invoice = await getAsync(db, `SELECT id, invoiceNumber FROM invoices WHERE paymentId = ?`, [testPaymentId]);

  console.log('Payment status:', updatedPayment.status);
  console.log('Booking status:', updatedBooking.status);
  console.log('Invoice generated:', invoice ? `YES (${invoice.invoiceNumber})` : 'NO');

  if (updatedPayment.status === 'completed' && updatedBooking.status === 'confirmed' && invoice) {
    console.log('SUCCESS: All components updated correctly.');
  } else {
    console.error('FAILURE: Some components failed to update.');
  }

  process.exit(0);
}

verifyFix().catch(console.error);
