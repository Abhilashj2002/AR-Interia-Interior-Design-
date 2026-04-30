const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../server/database.sqlite'));

const all = (sql) =>
  new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

async function main() {
  const coverage = await all(`
    SELECT bhk, type, COUNT(*) AS count
    FROM packages
    GROUP BY bhk, type
    ORDER BY bhk ASC, type ASC
  `);

  const lowBhkVillaMentions = await all(`
    SELECT COUNT(*) AS count
    FROM packages
    WHERE bhk IN (1, 2, 3)
      AND (
        LOWER(type) = 'villa'
        OR LOWER(id) LIKE '%villa%'
        OR LOWER(name) LIKE '%villa%'
        OR LOWER(subtitle) LIKE '%villa%'
      )
  `);

  const lowBhkVillaImagePaths = await all(`
    SELECT COUNT(*) AS count
    FROM packages
    WHERE bhk IN (1, 2, 3)
      AND (
        image LIKE '/package-images/villa/%'
        OR backgroundImage LIKE '/package-images/villa/%'
      )
  `);

  console.log({
    coverage,
    lowBhkVillaMentions: Number(lowBhkVillaMentions[0]?.count || 0),
    lowBhkVillaImagePaths: Number(lowBhkVillaImagePaths[0]?.count || 0)
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.close());
