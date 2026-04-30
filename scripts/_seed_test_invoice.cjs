const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite', (err) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }

  // Insert a test invoice for customer 1
  db.run(\
    INSERT INTO invoices (id, customerId, invoiceNumber, amount, subtotal, customerName, designName, packageName, paymentMethod, paymentDateTime, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  \, [
    'inv-test-1',
    '1',
    'INV-2026-TEST-001',
    35000,
    35000,
    'Test Customer',
    'Modern Office Design',
    'Premium Package',
    'card',
    new Date().toISOString(),
    'generated'
  ], function(err) {
    if (err) {
      console.error('Insert error:', err.message);
    } else {
      console.log('✅ Test invoice created');
    }

    // Verify it can be retrieved
    db.get(\SELECT COUNT(*) as count FROM invoices WHERE customerId = '1'\, (err, row) => {
      console.log('Invoices for customer 1:', row.count);
      db.close();
    });
  });
});
