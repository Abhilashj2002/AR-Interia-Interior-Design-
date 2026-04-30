import { initializeDb, getDb } from './server/db.js';

async function setupTest() {
  await initializeDb();
  const db = getDb();

  const testPaymentId = 'test-trans-' + Date.now();
  const testBookingId = 'test-book-' + Date.now();
  const testCustomerId = 'cust-1774520914058-16f12a49d1fef'; // Admin from logs

  // 1. Create a pending booking
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO bookings (id, customerId, designId, designName, price, status) 
       VALUES (?, ?, 'design-1', 'Test Design', 1000, 'pending')`,
      [testBookingId, testCustomerId],
      (err) => err ? reject(err) : resolve()
    );
  });

  // 2. Create a pending payment
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO payments (id, customerId, bookingId, amount, status, method) 
       VALUES (?, ?, ?, 1000, 'pending', 'phonepe')`,
      [testPaymentId, testCustomerId, testBookingId],
      (err) => err ? reject(err) : resolve()
    );
  });

  console.log('Test setup complete.');
  console.log('Payment ID:', testPaymentId);
  console.log('Booking ID:', testBookingId);
  process.exit(0);
}

setupTest().catch(console.error);
