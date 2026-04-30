#!/usr/bin/env node
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.join(__dirname, '..', 'server', 'database.sqlite');

const inferPackageRoomCategory = (room = {}) => {
  const text = `${String(room?.category || room?.roomType || room?.type || '')} ${String(room?.title || room?.name || '')} ${String(room?.description || '')}`.toLowerCase();
  if (/kitchen|pantry|modular/.test(text)) return 'Kitchen';
  if (/bath|washroom|toilet|vanity/.test(text)) return 'Bathroom';
  if (/balcony|terrace|deck/.test(text)) return 'Balcony';
  if (/dining/.test(text)) return 'Dining Area';
  if (/master|kids|guest|bedroom|suite/.test(text)) return 'Bedroom';
  if (/office|study|workspace/.test(text)) return 'Office Interior';
  if (/theatre|theater|cinema|media/.test(text)) return 'Home Theatre';
  if (/gym|fitness|workout/.test(text)) return 'Gym';
  if (/pool|swimming/.test(text)) return 'Swimming Pool';
  if (/garden|lawn|landscape/.test(text)) return 'Garden';
  if (/wardrobe|closet|walk-?in/.test(text)) return 'Wardrobe';
  return 'Living Room';
};

const normalizePackageRooms = (roomsRaw, packageId) => {
  const source = Array.isArray(roomsRaw) ? roomsRaw : [];
  return source
    .map((room, index) => {
      const value = typeof room === 'string' ? { image: room } : (room || {});
      const title = String(value.title || value.name || `Room ${index + 1}`).trim();
      const image = String(value.image || value.url || value.photo || '').trim();
      if (!title && !image) return null;
      return {
        id: String(value.id || `${String(packageId || 'pkg')}-room-${index + 1}`),
        title,
        name: String(value.name || title).trim(),
        category: String(value.category || value.roomType || inferPackageRoomCategory(value)).trim(),
        image,
        description: String(value.description || `${title} related image`).trim()
      };
    })
    .filter(Boolean);
};

const stableStringify = (value) => JSON.stringify(value);

async function normalizePackageRoomsInDb(dbPath) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    const rows = await db.all('SELECT id, rooms FROM packages');
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {
      const packageId = String(row?.id || '');
      const rawRooms = row?.rooms;
      let parsed;

      try {
        parsed = rawRooms ? JSON.parse(rawRooms) : [];
      } catch {
        failed += 1;
        continue;
      }

      const normalized = normalizePackageRooms(parsed, packageId);
      const before = stableStringify(Array.isArray(parsed) ? parsed : []);
      const after = stableStringify(normalized);

      if (before === after) {
        skipped += 1;
        continue;
      }

      await db.run(
        'UPDATE packages SET rooms = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [after, packageId]
      );
      updated += 1;
    }

    console.log(JSON.stringify({
      ok: true,
      dbPath,
      total: rows.length,
      updated,
      skipped,
      failed
    }, null, 2));
  } finally {
    await db.close();
  }
}

const dbArgIndex = process.argv.findIndex((arg) => arg === '--db');
const dbPath = dbArgIndex >= 0 ? process.argv[dbArgIndex + 1] : DEFAULT_DB_PATH;

normalizePackageRoomsInDb(dbPath).catch((error) => {
  console.error('Package rooms normalization failed:', error?.message || error);
  process.exitCode = 1;
});
