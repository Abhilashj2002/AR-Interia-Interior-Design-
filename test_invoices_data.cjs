const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./server/ar_interia.db');

// Test the EXACT query that the backend uses
db.all("PRAGMA table_info(bookings)", (err, schema) => {
  if (err) {
    console.error('❌ Error checking schema:', err);
    return;
  }
  
  // Get a confirmed booking customer
  db.get(
    "SELECT customerId FROM bookings WHERE status IN ('confirmed', 'fulfilled') LIMIT 1",
    (err, row) => {
      if (err) {
        console.error('❌ Error:', err);
        db.close();
        return;
      }
      
      if (!row) {
        console.log('⚠️  No confirmed bookings in database');
        db.close();
        return;
      }
      
      const customerId = row.customerId;
      console.log(`🔍 Testing backend query for customerId: ${customerId}\n`);
      
      // Test Invoice query (should return 0 or actual invoices)
      db.all(
        'SELECT * FROM invoices WHERE customerId = ? ORDER BY createdAt DESC',
        [customerId],
        (err1, invoices) => {
          if (err1) {
            console.error('❌ Invoice query error:', err1);
          } else {
            console.log(`📊 Query 1 - Invoices: ${invoices?.length || 0} found`);
          }
          
          // Test Confirmed Bookings query (the NEW query we just fixed)
          db.all(
            `SELECT 
               b.id as bookingId,
               b.designName,
               b.status,
               b.price as amount,
               b.bookingDate as createdAt
             FROM bookings b
             WHERE b.customerId = ? 
               AND LOWER(COALESCE(b.status, '')) IN ('confirmed', 'fulfilled')
               AND NOT EXISTS (
                 SELECT 1 FROM invoices i WHERE i.bookingId = b.id
               )
             ORDER BY b.bookingDate DESC`,
            [customerId],
            (err2, confirmedBookings) => {
              if (err2) {
                console.error('❌ Confirmed bookings query error:', err2);
              } else {
                console.log(`📊 Query 2 - Confirmed Bookings: ${confirmedBookings?.length || 0} found`);
                
                if (confirmedBookings && confirmedBookings.length > 0) {
                  console.log('\n✅ Sample confirmed booking:');
                  console.log(JSON.stringify(confirmedBookings[0], null, 2));
                  console.log(`\n✅ VERIFIED: Backend will return ${(invoices?.length || 0) + (confirmedBookings?.length || 0)} total items`);
                } else {
                  console.log('⚠️  No confirmed bookings found (invoices might exist)');
                }
              }
              db.close();
            }
          );
        }
      );
    }
  );
});
