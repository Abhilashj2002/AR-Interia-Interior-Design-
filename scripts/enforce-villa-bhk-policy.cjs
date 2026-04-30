const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../server/database.sqlite');

const db = new sqlite3.Database(DB_PATH);

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const clean = (value = '') =>
  String(value || '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/\s+-\s+/g, ' - ')
    .trim();

const stripToken = (value = '', tokenRegex) =>
  String(value || '')
    .replace(tokenRegex, '')
    .replace(/\(\s*\)/g, '');

const ensureToken = (value = '', token) => {
  const current = clean(value);
  if (!current) return token;
  if (new RegExp(`\\b${token}\\b`, 'i').test(current)) return current;
  return clean(`${current} ${token}`);
};

const normalizeApartment = (value = '') => String(value || '').replace(/\bapartments\b/gi, 'Apartment');
const normalizeVilla = (value = '') => String(value || '').replace(/\bvillas\b/gi, 'Villa');

const toApartmentLabels = (row) => {
  const baseName = stripToken(row.name, /\bvillas?\b/gi);
  const baseSubtitle = stripToken(row.subtitle, /\bvillas?\b/gi);
  const baseCategory = stripToken(row.category, /\bvillas?\b/gi);

  return {
    type: 'Apartment',
    name: ensureToken(normalizeApartment(baseName), 'Apartment'),
    subtitle: clean(normalizeApartment(baseSubtitle)),
    category: clean(normalizeApartment(baseCategory)) || String(row.category || '')
  };
};

const toVillaLabels = (row) => {
  const baseName = stripToken(row.name, /\bapartments?\b/gi);
  const baseSubtitle = stripToken(row.subtitle, /\bapartments?\b/gi);
  const baseCategory = stripToken(row.category, /\bapartments?\b/gi);

  return {
    type: 'Villa',
    name: ensureToken(normalizeVilla(baseName), 'Villa'),
    subtitle: clean(normalizeVilla(baseSubtitle)),
    category: clean(normalizeVilla(baseCategory)) || String(row.category || '')
  };
};

async function main() {
  const rows = await all('SELECT id, type, bhk, name, subtitle, category, rooms FROM packages');
  const usedIds = new Set(rows.map((row) => String(row.id || '').trim()).filter(Boolean));
  let updated = 0;

  const makeUniqueId = (candidate, currentId) => {
    let next = String(candidate || '').trim();
    if (!next) next = String(currentId || '').trim();
    if (!next) next = `pkg-${Date.now()}`;
    if (next === currentId) return next;

    let attempt = next;
    let suffix = 2;
    while (usedIds.has(attempt) && attempt !== currentId) {
      attempt = `${next}-${suffix}`;
      suffix += 1;
    }
    return attempt;
  };

  const sanitizeLowBhkId = (id, bhk) => {
    const source = String(id || '').trim();
    if (!source) return source;
    if (!/villa/i.test(source)) return source;

    const bhkCount = Number(bhk || 0);
    const bhkLabel = Number.isFinite(bhkCount) && bhkCount > 0 ? `${bhkCount}bhk` : 'bhk';
    const normalized = source
      .replace(/villa/gi, 'interior')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');

    if (/^interior-/i.test(normalized)) return normalized;
    return `interior-${bhkLabel}-${normalized}`;
  };

  const normalizeRoomsJson = (roomsRaw, oldId, newId) => {
    if (!roomsRaw || oldId === newId) return roomsRaw;
    let parsed;
    try {
      parsed = JSON.parse(roomsRaw);
    } catch {
      return roomsRaw;
    }

    if (!Array.isArray(parsed)) return roomsRaw;
    const remapped = parsed.map((room, index) => {
      const value = room && typeof room === 'object' ? { ...room } : room;
      if (!value || typeof value !== 'object') return value;
      const currentRoomId = String(value.id || '').trim();
      const roomSuffix = currentRoomId.startsWith(`${oldId}-room-`)
        ? currentRoomId.slice(`${oldId}-room-`.length)
        : String(index + 1);
      value.id = `${newId}-room-${roomSuffix}`;
      return value;
    });

    return JSON.stringify(remapped);
  };

  for (const row of rows) {
    const bhk = Number(row.bhk);
    const enforceVilla = Number.isFinite(bhk) && bhk >= 4 && String(row.type || '').toLowerCase() === 'villa';

    const labels = enforceVilla ? toVillaLabels(row) : toApartmentLabels(row);
    const currentId = String(row.id || '').trim();
    const nextIdBase = !enforceVilla && Number.isFinite(bhk) && bhk > 0 && bhk < 4
      ? sanitizeLowBhkId(currentId, bhk)
      : currentId;
    const nextId = makeUniqueId(nextIdBase, currentId);
    const normalizedRooms = normalizeRoomsJson(row.rooms, currentId, nextId);
    if (nextId !== currentId) {
      usedIds.delete(currentId);
      usedIds.add(nextId);
    }

    await run(
      `UPDATE packages
       SET id = ?, type = ?, name = ?, subtitle = ?, category = ?, rooms = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nextId, labels.type, labels.name, labels.subtitle, labels.category, normalizedRooms, currentId]
    );
    updated += 1;
  }

  const coverage = await all(
    `SELECT bhk, type, COUNT(*) AS count
     FROM packages
     GROUP BY bhk, type
     ORDER BY bhk ASC, type ASC`
  );

  const invalidVillas = await all(
    `SELECT COUNT(*) AS count
     FROM packages
     WHERE LOWER(type) = 'villa' AND CAST(bhk AS INTEGER) < 4`
  );

  console.log('[enforce-villa-bhk-policy] done');
  console.log({ updated, invalidVillaRows: Number(invalidVillas?.[0]?.count || 0), coverage });
}

main()
  .catch((err) => {
    console.error('[enforce-villa-bhk-policy] failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
