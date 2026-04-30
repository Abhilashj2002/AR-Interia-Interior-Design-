const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./server/ar_interia.db');

const userId = 'cust-test-aj1-' + Date.now();

db.run(
  `INSERT INTO customers (id, name, email, username, password, phone) VALUES (?, ?, ?, ?, ?, ?)`,
  [userId, 'AJ Test', 'aj1@gmail.com', 'aj1', 'Aj@12345', '9999999999'],
  async function(err) {
    if (err) {
      console.error('❌ Error creating user:', err.message);
      db.close();
      return;
    }
    
    console.log('✅ User created: aj1@gmail.com');
    console.log(`   ID: ${userId}`);
    
    // Create test booking
    const bookingId = 'book-test-' + Date.now();
    db.run(
      `INSERT INTO bookings (id, customerId, designId, designName, price, cost, status, bookingDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, userId, 'design-1', 'Modern Minimalist', 45000, 0, 'confirmed', new Date().toISOString()],
      (err) => {
        if (err) {
          console.error('❌ Booking error:', err.message);
        } else {
          console.log('\n✅ Test Data Created:');
          console.log(`   Booking ID: ${bookingId}`);
          console.log('   Status: confirmed');
          console.log('   Amount: ₹45,000');
        }
        
        console.log('\n🔑 Login Credentials:');
        console.log(`   Email: aj1@gmail.com`);
        console.log(`   Password: Aj@12345`);
        console.log('\n✅ Ready to test invoice loading!');
        db.close();
      }
    );
  }
);
