const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/ar_interia.db');

console.log('=== Database Summary ===');
db.all('SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name', [], (err, tables) => {
  if (err) console.error('Error:', err.message);
  console.log('Tables:', tables.map(t => t.name).join(', '));
  
  const queries = [
    { name: 'Total customers', sql: 'SELECT COUNT(*) as count FROM customers' },
    { name: 'Total bookings', sql: 'SELECT COUNT(*) as count FROM bookings' },
    { name: 'Total payments', sql: 'SELECT COUNT(*) as count FROM payments' },
    { name: 'Total invoices', sql: 'SELECT COUNT(*) as count FROM invoices' },
    { name: 'Payments with status=paid', sql: 'SELECT COUNT(*) as count FROM payments WHERE status=\'paid\'' },
    { name: 'Invoices for customer 4', sql: 'SELECT COUNT(*) as count FROM invoices WHERE customerId LIKE \'%aj%\'' }
  ];
  
  let completed = 0;
  queries.forEach(q => {
    db.get(q.sql, [], (err, row) => {
      if (err) console.log(q.name + ': ERROR - ' + err.message);
      else console.log(q.name + ':', row.count);
      completed++;
      if (completed === queries.length) {
        // Show sample data
        console.log('\n=== Sample Paid Payments ===');
        db.all('SELECT id, customerId, amount, status, method, createdAt FROM payments WHERE status=\'paid\' LIMIT 3', [], (err, rows) => {
          if (rows) console.log(JSON.stringify(rows, null, 2));
          db.close();
        });
      }
    });
  });
});
