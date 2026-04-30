const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'server', 'ar_interia.db');
const METADATA_PATH = path.join(ROOT, 'server', 'category-metadata.json');
const CATEGORY_ROOT = path.join(ROOT, 'public', 'category');

const normalizeCategoryKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const decodeFilename = (url) => {
  const raw = String(url || '').split('?')[0].split('#')[0].split('/').pop() || '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const listCategoryFolders = () => {
  if (!fs.existsSync(CATEGORY_ROOT)) return [];
  return fs.readdirSync(CATEGORY_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
};

const resolveFolder = (categoryLike, folders) => {
  const requested = String(categoryLike || '');
  if (!requested) return null;

  const exactPath = path.join(CATEGORY_ROOT, requested);
  if (fs.existsSync(exactPath)) return requested;

  const key = normalizeCategoryKey(requested);
  const byKey = folders.find((name) => normalizeCategoryKey(name) === key);
  if (byKey) return byKey;

  if (['bedroom', 'cat-bedroom', 'masterbedroom', 'master-bedroom'].includes(key)) {
    return folders.find((name) => normalizeCategoryKey(name) === 'master-bedroom') || null;
  }

  return null;
};

const readMetadata = () => {
  if (!fs.existsSync(METADATA_PATH)) return {};
  const raw = fs.readFileSync(METADATA_PATH, 'utf8');
  return raw ? JSON.parse(raw) : {};
};

const findMetadataEntry = (metadata, categoryLike) => {
  const key = normalizeCategoryKey(categoryLike);
  const found = Object.keys(metadata).find((k) => normalizeCategoryKey(k) === key);
  return found ? (metadata[found] || {}) : {};
};

const getOrderedNamesForFolder = (folderName, metadata) => {
  if (!folderName) return [];
  const folderPath = path.join(CATEGORY_ROOT, folderName);
  if (!fs.existsSync(folderPath)) return [];

  const meta = findMetadataEntry(metadata, folderName);
  const imageNames = meta.imageNames || {};

  const files = fs.readdirSync(folderPath)
    .filter((file) => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const mapped = String(imageNames[file] || '').trim();
    if (mapped) return mapped;
    return file.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
};

const db = new sqlite3.Database(DB_PATH);

const allAsync = (query, params = []) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
});

const runAsync = (query, params = []) => new Promise((resolve, reject) => {
  db.run(query, params, function onRun(err) {
    if (err) reject(err);
    else resolve(this.changes || 0);
  });
});

const main = async () => {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database not found: ${DB_PATH}`);
  }

  const metadata = readMetadata();
  const folders = listCategoryFolders();

  const rows = await allAsync(`
    SELECT d.id, d.title, d.previewImage, d.categoryId, d.createdAt,
           c.id as category_id, c.title as category_title
    FROM designs d
    LEFT JOIN categories c ON d.categoryId = c.id
    WHERE d.status = 'active'
    ORDER BY d.createdAt ASC
  `);

  const grouped = new Map();

  rows.forEach((row) => {
    const categoryLike = row.category_title || row.categoryId || row.category_id || '';
    const folder = resolveFolder(categoryLike, folders) || resolveFolder(row.categoryId, folders);
    const groupKey = normalizeCategoryKey(folder || categoryLike || row.categoryId || 'uncategorized');
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        key: groupKey,
        folder,
        categoryLike,
        rows: []
      });
    }
    grouped.get(groupKey).rows.push(row);
  });

  let updatedDesigns = 0;
  let updatedBookings = 0;
  let scanned = 0;

  for (const [, group] of grouped) {
    const metaEntry = findMetadataEntry(metadata, group.folder || group.categoryLike || group.key);
    const imageNames = metaEntry.imageNames || {};
    const orderedNames = getOrderedNamesForFolder(group.folder || '', metadata);

    group.rows.forEach((row, index) => {
      scanned += 1;
      const filename = decodeFilename(row.previewImage);
      const mappedByFile = filename ? String(imageNames[filename] || '').trim() : '';
      const mappedByIndex = String(orderedNames[index] || '').trim();
      const nextTitle = mappedByFile || mappedByIndex;
      if (!nextTitle) return;
      if (String(row.title || '').trim() === nextTitle) return;

      group.rows[index].nextTitle = nextTitle;
    });

    for (const row of group.rows) {
      if (!row.nextTitle) continue;
      // eslint-disable-next-line no-await-in-loop
      updatedDesigns += await runAsync(`UPDATE designs SET title = ? WHERE id = ?`, [row.nextTitle, row.id]);
      // eslint-disable-next-line no-await-in-loop
      updatedBookings += await runAsync(`UPDATE bookings SET designName = ? WHERE designId = ?`, [row.nextTitle, row.id]);
    }
  }

  console.log(`[rewrite-design-names-by-category] scanned=${scanned} updatedDesigns=${updatedDesigns} updatedBookings=${updatedBookings}`);
};

main()
  .then(() => db.close())
  .catch((error) => {
    console.error('[rewrite-design-names-by-category] failed:', error.message || error);
    db.close(() => process.exit(1));
  });
