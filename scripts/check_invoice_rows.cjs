const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('d:/ar16/server/ar_interia.db');
db.serialize(() => {
  db.all(`SELECT invoiceNumber, customerName, packageName, subtotal, discount, amount FROM invoices ORDER BY id DESC LIMIT 5`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
    db.get(`SELECT invoiceNumber, customerName, packageName, subtotal, discount, amount FROM invoices WHERE invoiceNumber = ?`, ['INV-2026-00066'], (e2, r2) => {
      if (e2) console.error(e2.message);
      else console.log('INV-2026-00066 =>', r2);
      db.close();
    });
  });
});
