const sqlite3 = require('sqlite3').verbose();
const http = require('http');

// Find customer for aj@gmail.com and get their bookings
const db = new sqlite3.Database('./server/ar_interia.db');

db.get('SELECT id FROM customers WHERE email = ?', ['aj@gmail.com'], (err, customer) => {
  if (!customer) {
    console.log('Customer not found');
    db.close();
    return;
  }
  
  const customerId = customer.id;
  console.log('Testing bookings API with customer ID:', customerId);
  
  // First, test direct axios fetch from backend
  db.all('SELECT id, designName, price FROM bookings WHERE customerId = ?', [customerId], (err, bookings) => {
    console.log('Bookings in DB:', bookings ? bookings.length : 0);
    if (bookings && bookings.length > 0) {
      console.log('  Sample from DB:', bookings[0]);
    }
    db.close();
  });
});
