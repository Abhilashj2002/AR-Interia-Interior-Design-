const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/database.sqlite');
const q = `SELECT id,type,bhk,name,subtitle FROM packages WHERE CAST(COALESCE(bhk,0) AS INTEGER) IN (1,2,3) AND (LOWER(COALESCE(id,'')) LIKE '%villa%' OR LOWER(COALESCE(name,'')) LIKE '%villa%' OR LOWER(COALESCE(subtitle,'')) LIKE '%villa%' OR LOWER(COALESCE(type,''))='villa')`;
db.all(q, [], (e, rows) => {
  if (e) { console.error(e); process.exit(1); }
  console.log(JSON.stringify({count: rows.length, sample: rows.slice(0,10)}, null, 2));
  db.close();
});
