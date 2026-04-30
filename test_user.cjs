const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./server/ar_interia.db');

db.get(
  "SELECT id, name, email FROM customers WHERE email = 'aj1@gmail.com' LIMIT 1",
  (err, user) => {
    if (err) {
      console.error('❌ Error:', err);
      db.close();
      return;
    }
    
    if (!user) {
      console.log('❌ User not found with email: aj1@gmail.com');
      db.close();
      return;
    }
    
    console.log('✅ User found:', JSON.stringify(user, null, 2));
    
    const userId = user.id;
    
    // Check invoices
    db.all(
      "SELECT id, customerId, invoiceNumber, amount, status, createdAt FROM invoices WHERE customerId = ? LIMIT 5",
      [userId],
      (err2, invoices) => {
        console.log('\n📊 Invoices:', invoices?.length || 0);
        if (invoices && invoices.length > 0) {
          console.log('Sample invoice:', JSON.stringify(invoices[0], null, 2));
        }
        
        // Check bookings
        db.all(
          "SELECT id, customerId, designName, status, price, bookingDate FROM bookings WHERE customerId = ? LIMIT 5",
          [userId],
          (err3, bookings) => {
            console.log('\n📋 Bookings:', bookings?.length || 0);
            if (bookings && bookings.length > 0) {
              console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
            }
            
            console.log('\n✅ Ready to test - user has data loaded');
            db.close();
          }
        );
      }
    );
  }
);
