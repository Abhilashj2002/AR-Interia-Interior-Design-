const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/ar_interia.db');

db.get('SELECT id FROM customers WHERE email = ?', ['aj@gmail.com'], (err, customer) => {
  if (!customer) {
    console.log('Customer not found');
    db.close();
    return;
  }
  
  const customerId = customer.id;
  console.log('Customer ID:', customerId);
  
  db.all('SELECT COUNT(*) as count FROM bookings WHERE customerId = ?', [customerId], (err, rows) => {
    console.log('Bookings count:', rows[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM invoices WHERE customerId = ?', [customerId], (err, rows) => {
    console.log('Invoices count:', rows[0].count);
    db.close();
  });
});
