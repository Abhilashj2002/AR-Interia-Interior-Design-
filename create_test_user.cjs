const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const db = new sqlite3.Database('./server/ar_interia.db');

// First, list existing users
db.all(
  "SELECT id, name, email FROM customers LIMIT 5",
  (err, users) => {
    console.log('📋 Existing customers:');
    if (users && users.length > 0) {
      users.forEach(u => console.log(`  - ${u.email}: ${u.name}`));
    } else {
      console.log('  (none)');
    }
    
    // Create test user if not exists
    db.get(
      "SELECT id FROM customers WHERE email = 'aj1@gmail.com'",
      (err, existing) => {
        if (existing) {
          console.log('\n✅ User already exists');
          db.close();
          return;
        }
        
        console.log('\n🔧 Creating test user...');
        const userId = 'cust-' + Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        
        db.run(
          `INSERT INTO customers (id, name, email, phone, password, address, city, state, zipcode, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            'AJ Test',
            'aj1@gmail.com',
            '9999999999',
            'Aj@12345', // Note: In production this should be hashed, but for testing we'll match what they provided
            '123 Test St',
            'Test City',
            'Test State',
            '123456',
            new Date().toISOString()
          ],
          (err) => {
            if (err) {
              console.error('❌ Error creating user:', err);
            } else {
              console.log('✅ User created:', userId);
              console.log('   Email: aj1@gmail.com');
              console.log('   Password: Aj@12345');
            }
            db.close();
          }
        );
      }
    );
  }
);
