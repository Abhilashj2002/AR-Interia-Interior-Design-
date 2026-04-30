import sqlite3 from 'sqlite3';

const DB_PATH = 'server/database.sqlite';
const TARGET_BHKS = [4];

const run = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const all = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows || []);
  });
});

const getTierMultiplier = (id = '') => {
  const lower = String(id).toLowerCase();
  if (lower.includes('essential')) return 2.5;
  if (lower.includes('luxury')) return 3.0;
  if (lower.includes('ultimate')) return 3.125;
  return 2.75;
};

const replaceApartmentText = (value) => {
  const text = String(value || '');
  return text
    .replace(/apartments/gi, 'VILLAS')
    .replace(/apartment/gi, 'VILLAS');
};

const toVillaRecord = (pkg) => {
  const multiplier = getTierMultiplier(pkg.id);
  const originalPrice = Math.max(0, Math.round(Number(pkg.originalPrice || 0) * multiplier));
  const discountedPrice = Math.max(0, Math.round(Number(pkg.discountedPrice || 0) * multiplier));

  let features = [];
  try {
    features = Array.isArray(JSON.parse(pkg.features || '[]')) ? JSON.parse(pkg.features || '[]') : [];
  } catch {
    features = [];
  }

  const normalizedFeatures = features.map((f) => replaceApartmentText(f));

  return {
    id: String(pkg.id || '').replace(/^apt-/i, 'villa-'),
    name: replaceApartmentText(pkg.name),
    subtitle: replaceApartmentText(pkg.subtitle || `${pkg.bhk}BHK VILLA PACKAGE`),
    description: replaceApartmentText(pkg.description || `Premium ${pkg.bhk}BHK villa package.`),
    type: 'Villa',
    bhk: Number(pkg.bhk || 0),
    category: replaceApartmentText(pkg.category || 'Full Home'),
    originalPrice,
    discountedPrice,
    image: pkg.image || null,
    backgroundImage: pkg.backgroundImage || null,
    backgroundColor: pkg.backgroundColor || null,
    features: JSON.stringify(normalizedFeatures),
    rooms: pkg.rooms || '[]',
    updatedAt: new Date().toISOString()
  };
};

async function main() {
  const db = new sqlite3.Database(DB_PATH);

  try {
    const placeholders = TARGET_BHKS.map(() => '?').join(',');
    const sourceRows = await all(
      db,
      `SELECT * FROM packages WHERE type = 'Apartment' AND bhk IN (${placeholders}) ORDER BY bhk ASC, id ASC`,
      TARGET_BHKS
    );

    let processed = 0;
    let created = 0;
    let updated = 0;

    for (const source of sourceRows) {
      const villa = toVillaRecord(source);
      if (!villa.id || villa.id === source.id) continue;

      const before = await all(db, 'SELECT id FROM packages WHERE id = ?', [villa.id]);
      const existed = before.length > 0;

      await run(
        db,
        `INSERT INTO packages (
          id, name, subtitle, description, type, bhk, category,
          originalPrice, discountedPrice, image, backgroundImage,
          backgroundColor, features, rooms, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          subtitle = excluded.subtitle,
          description = excluded.description,
          type = excluded.type,
          bhk = excluded.bhk,
          category = excluded.category,
          originalPrice = excluded.originalPrice,
          discountedPrice = excluded.discountedPrice,
          image = excluded.image,
          backgroundImage = excluded.backgroundImage,
          backgroundColor = excluded.backgroundColor,
          features = excluded.features,
          rooms = excluded.rooms,
          updatedAt = excluded.updatedAt`,
        [
          villa.id,
          villa.name,
          villa.subtitle,
          villa.description,
          villa.type,
          villa.bhk,
          villa.category,
          villa.originalPrice,
          villa.discountedPrice,
          villa.image,
          villa.backgroundImage,
          villa.backgroundColor,
          villa.features,
          villa.rooms,
          villa.updatedAt
        ]
      );

      processed += 1;
      if (existed) updated += 1;
      else created += 1;
    }

    const coverage = await all(
      db,
      'SELECT bhk, type, COUNT(*) as count FROM packages GROUP BY bhk, type ORDER BY bhk ASC, type ASC'
    );

    console.log('[ensure-non-apartment-bhk-packages] completed');
    console.log({ processed, created, updated, coverage });
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error('[ensure-non-apartment-bhk-packages] failed:', err);
  process.exit(1);
});
