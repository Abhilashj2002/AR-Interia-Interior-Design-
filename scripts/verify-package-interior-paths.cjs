const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('server/database.sqlite');
const q1 = "SELECT COUNT(*) AS c FROM packages WHERE image NOT LIKE '/package-images/%bhk/%' OR backgroundImage NOT LIKE '/package-images/%bhk/%'";
const q2 = "SELECT COUNT(*) AS c FROM packages WHERE image LIKE '/package-images/villa/%' OR backgroundImage LIKE '/package-images/villa/%' OR image LIKE '/category/%' OR backgroundImage LIKE '/category/%'";

db.all(q1, [], (e, r) => {
  if (e) throw e;
  console.log('nonInteriorPathCount=', r[0].c);
  db.all(q2, [], (e2, r2) => {
    if (e2) throw e2;
    console.log('villaOrCategoryPathCount=', r2[0].c);
    db.close();
  });
});
