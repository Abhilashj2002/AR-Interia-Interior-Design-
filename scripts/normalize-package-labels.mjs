#!/usr/bin/env node
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.join(__dirname, '..', 'server', 'database.sqlite');

const cleanupWhitespace = (value = '') =>
  String(value || '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/\s+-\s+/g, ' - ')
    .trim();

const normalizeApartmentToken = (value = '') =>
  String(value || '').replace(/\bapartments\b/gi, 'Apartment');

const stripApartmentToken = (value = '') =>
  String(value || '')
    .replace(/\bapartments?\b/gi, '')
    .replace(/\(\s*\)/g, '');

const ensureApartmentMention = (value = '') => {
  const current = cleanupWhitespace(normalizeApartmentToken(value));
  if (!current) return 'Apartment';
  if (/\bapartment\b/i.test(current)) return current;
  return cleanupWhitespace(`${current} Apartment`);
};

const normalizePackageLabelsByType = (pkg = {}) => {
  const typeRaw = String(pkg?.type || '').trim();
  const isApartment = typeRaw.toLowerCase() === 'apartment';
  const normalizedType = isApartment ? 'Apartment' : (typeRaw || 'Package');

  const rawName = String(pkg?.name || '').trim();
  const rawSubtitle = String(pkg?.subtitle || '').trim();
  const rawCategory = String(pkg?.category || '').trim();

  const name = isApartment
    ? ensureApartmentMention(rawName)
    : cleanupWhitespace(stripApartmentToken(rawName));
  const subtitle = isApartment
    ? cleanupWhitespace(normalizeApartmentToken(rawSubtitle))
    : cleanupWhitespace(stripApartmentToken(rawSubtitle));
  const category = isApartment
    ? cleanupWhitespace(normalizeApartmentToken(rawCategory))
    : cleanupWhitespace(stripApartmentToken(rawCategory));

  return {
    type: normalizedType,
    name: name || (isApartment ? 'Apartment Package' : (rawName || 'Package')),
    subtitle,
    category: category || rawCategory
  };
};

async function normalizePackageLabelsInDb(dbPath) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    const rows = await db.all('SELECT id, type, name, subtitle, category FROM packages ORDER BY id ASC');
    let updated = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const normalized = normalizePackageLabelsByType(row || {});
        await db.run(
          'UPDATE packages SET type = ?, name = ?, subtitle = ?, category = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [normalized.type, normalized.name, normalized.subtitle, normalized.category, row.id]
        );
        updated += 1;
      } catch {
        failed += 1;
      }
    }

    console.log(JSON.stringify({
      ok: true,
      dbPath,
      total: rows.length,
      updated,
      failed
    }, null, 2));
  } finally {
    await db.close();
  }
}

const dbArgIndex = process.argv.findIndex((arg) => arg === '--db');
const dbPath = dbArgIndex >= 0 ? process.argv[dbArgIndex + 1] : DEFAULT_DB_PATH;

normalizePackageLabelsInDb(dbPath).catch((error) => {
  console.error('Package label normalization failed:', error?.message || error);
  process.exitCode = 1;
});
