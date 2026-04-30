const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite', (err) => {
  if (err) console.error('Error:', err.message);
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    console.log('Tables:', rows.map(r => r.name).join(', '));
    db.close();
  });
});
