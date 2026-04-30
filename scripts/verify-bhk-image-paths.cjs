const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('server/database.sqlite');
const sql = `
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN image LIKE '/package-images/%bhk/%' THEN 1 ELSE 0 END) AS bhkImage,
  SUM(CASE WHEN backgroundImage LIKE '/package-images/%bhk/%' THEN 1 ELSE 0 END) AS bhkBg,
  SUM(CASE WHEN image LIKE '%/apartment/%' OR image LIKE '%/villa/%' OR backgroundImage LIKE '%/apartment/%' OR backgroundImage LIKE '%/villa/%' THEN 1 ELSE 0 END) AS badTypePath
FROM packages
`;

db.get(sql, [], (err, row) => {
  if (err) {
    console.error(err);
    process.exitCode = 1;
  } else {
    console.log(row);
  }
  db.close();
});
