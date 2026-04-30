// scripts/patch-package-images.cjs
// Update all package image/background paths in SQLite to BHK-specific local assets.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const db = new sqlite3.Database(path.join(__dirname, '../server/database.sqlite'));
const VALID_BHK = [1, 2, 3, 4];

function getStableIndex(seed, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % Math.max(1, max)) + 1;
}

function getFolderFiles(bhk) {
  const folder = path.join(__dirname, `../public/package-images/${bhk}bhk`);
  if (!fs.existsSync(folder)) {
    throw new Error(`Missing folder ${folder}. Run npm run images:download:bhk first.`);
  }
  const files = fs.readdirSync(folder).filter((f) => f.toLowerCase().endsWith('.jpg'));
  if (!files.length) {
    throw new Error(`No images in folder ${folder}.`);
  }
  return files;
}

db.serialize(() => {
  db.all('SELECT id, type, bhk FROM packages', [], (err, rows) => {
    if (err) throw err;

    rows.forEach((row) => {
      const bhk = Number(row.bhk);

      if (!VALID_BHK.includes(bhk)) {
        console.log(`Skipped package ${row.id} (invalid bhk=${row.bhk})`);
        return;
      }

      const files = getFolderFiles(bhk);
      const primaryIdx = getStableIndex(`${row.id}-image`, files.length) - 1;
      const bgIdx = getStableIndex(`${row.id}-bg`, files.length) - 1;

      const baseFolder = `${bhk}bhk`;
      const image = `/package-images/${baseFolder}/${files[primaryIdx]}`;
      const backgroundImage = `/package-images/${baseFolder}/${files[bgIdx]}`;

      db.run(
        'UPDATE packages SET image = ?, backgroundImage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [image, backgroundImage, row.id],
        (updateErr) => {
          if (updateErr) {
            console.error(`Failed package ${row.id}:`, updateErr.message);
            return;
          }
          console.log(`Patched ${row.id} (bhk=${bhk}, type=${row.type})`);
        }
      );
    });
  });
});
