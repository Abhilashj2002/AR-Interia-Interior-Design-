const sqlite3 = require('sqlite3');
const http = require('http');

const db = new sqlite3.Database('./server/ar_interia.db');
const testCustomerId = 'cust-test-aj1-1775146847852';

// Query directly from database to verify data structure
console.log('📋 Checking database for test customer...\n');

db.get('SELECT * FROM customers WHERE id = ?', [testCustomerId], (err, customer) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }
  
  if (!customer) {
    console.error('❌ Customer not found');
    db.close();
    return;
  }
  
  console.log('✅ Customer Found:');
  console.log(`   ID: ${customer.id}`);
  console.log(`   Email: ${customer.email}`);
  console.log(`   Username: ${customer.username}`);
  
  // Check bookings for this customer
  db.all(`
    SELECT id as bookingId, designName, status, price as amount, bookingDate as createdAt 
    FROM bookings 
    WHERE customerId = ? AND LOWER(COALESCE(status, '')) IN ('confirmed', 'fulfilled')
  `, [testCustomerId], (err, bookings) => {
    if (err) {
      console.error('❌ Booking query error:', err.message);
      db.close();
      return;
    }
    
    console.log(`\n✅ Confirmed Bookings: ${bookings.length}`);
    bookings.forEach((b, i) => {
      console.log(`   [${i+1}] ${b.designName} - ₹${b.amount} (${b.status})`);
    });
    
    // Check invoices for this customer
    db.all(`
      SELECT id, invoiceNumber, amount, status, createdAt 
      FROM invoices 
      WHERE customerId = ?
    `, [testCustomerId], (err, invoices) => {
      if (err) {
        console.error('❌ Invoice query error:', err.message);
        db.close();
        return;
      }
      
      console.log(`\n✅ Invoices: ${invoices.length}`);
      invoices.forEach((inv, i) => {
        console.log(`   [${i+1}] Invoice #${inv.invoiceNumber} - ₹${inv.amount}`);
      });
      
      console.log(`\n📊 Total Items to Display: ${bookings.length + invoices.length}`);
      console.log('\n✅ Ready to login and test in browser!');
      console.log('   1. Go to http://localhost:5175');
      console.log('   2. Click "Login as Customer"');
      console.log('   3. Email: aj1@gmail.com');
      console.log('   4. Password: Aj@12345');
      console.log('   5. Click "Load Invoices" button');
      console.log('   6. Verify ' + (bookings.length + invoices.length) + ' items appear');
      
      db.close();
    });
  });
});
