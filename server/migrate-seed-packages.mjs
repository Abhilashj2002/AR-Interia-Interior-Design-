#!/usr/bin/env node
/**
 * Migration script to seed 60 packages into the database
 * Run with: node server/migrate-seed-packages.mjs
 */

import { initDB } from './database.js';
import { SEED_PACKAGES } from './seed-packages.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REMOTE_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1616594039964-3d0f8f5f6f06?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1617104551722-3b2d51366403?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1400'
].filter(Boolean);

const MIN_VALID_IMAGE_SIZE = 5120;
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|avif)$/i;
const BLOCKED_BACKGROUND_CATEGORY_FOLDERS = new Set([
  'classroom',
  'epoxy floor',
  'meeting room'
]);

const hasBlockedBackgroundFolder = (value) => {
  const normalized = decodeURIComponent(String(value || '').replace(/\\/g, '/').toLowerCase());
  const categoryIndex = normalized.indexOf('/category/');
  if (categoryIndex === -1) return false;
  const categoryPath = normalized.slice(categoryIndex + '/category/'.length);
  const segments = categoryPath.split('/').map((segment) => segment.trim()).filter(Boolean);
  return segments.some((segment) => BLOCKED_BACKGROUND_CATEGORY_FOLDERS.has(segment));
};

const collectLocalCategoryImages = () => {
  const publicRoot = path.join(__dirname, '..', 'public');
  const categoryRoot = path.join(publicRoot, 'category');
  if (!fs.existsSync(categoryRoot)) return [];

  const out = [];
  const stack = [categoryRoot];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
        continue;
      }
      if (!IMAGE_EXT.test(entry.name)) continue;
      try {
        const size = fs.statSync(abs).size;
        if (size < MIN_VALID_IMAGE_SIZE) continue;
        const rel = path.relative(publicRoot, abs).replace(/\\/g, '/');
        if (hasBlockedBackgroundFolder(`/${rel}`)) continue;
        out.push(`/${rel}`);
      } catch {
        // Ignore unreadable files
      }
    }
  }

  return out.sort();
};

const buildMasterImagePool = () => {
  const localImages = collectLocalCategoryImages();
  const packageSeedImages = SEED_PACKAGES.flatMap((pkg) => {
    const roomImages = Array.isArray(pkg?.rooms) ? pkg.rooms.map((room) => String(room?.image || '')) : [];
    return [String(pkg?.image || ''), String(pkg?.backgroundImage || ''), ...roomImages];
  })
    .filter(Boolean)
    .filter((url) => !hasBlockedBackgroundFolder(url));

  return Array.from(new Set([...localImages, ...packageSeedImages, ...REMOTE_IMAGE_POOL]));
};

const isLivingOrBedroomBackground = (value) => {
  const normalized = String(value || '').replace(/\\/g, '/').split('?')[0].trim();
  return /^\/category\/(Living room|Master Bedroom|Kids-bedroom)\/[^/]+$/i.test(normalized);
};

const nextUniqueFromPool = (pool, used, startIndex = 0, disallow = '') => {
  if (!Array.isArray(pool) || pool.length === 0) return '';
  const disallowValue = String(disallow || '');
  for (let offset = 0; offset < pool.length; offset += 1) {
    const value = String(pool[(startIndex + offset) % pool.length] || '');
    if (!value) continue;
    if (value === disallowValue) continue;
    if (used.has(value)) continue;
    used.add(value);
    return value;
  }

  // If pool exhausted, still avoid exact disallow when possible.
  for (let offset = 0; offset < pool.length; offset += 1) {
    const value = String(pool[(startIndex + offset) % pool.length] || '');
    if (value && value !== disallowValue) return value;
  }
  return String(pool[startIndex % pool.length] || '');
};

const getCategoryPrefixFromUrl = (urlLike) => {
  const value = String(urlLike || '').replace(/\\/g, '/');
  const match = value.match(/\/category\/[^/]+/i);
  return match ? match[0].toLowerCase() : '';
};

const selectUniqueRoomBase = (preferredBase, pool, used, startIndex = 0) => {
  const preferred = String(preferredBase || '').trim();
  if (preferred && !used.has(preferred)) {
    used.add(preferred);
    return preferred;
  }

  const categoryPrefix = getCategoryPrefixFromUrl(preferred);
  if (categoryPrefix) {
    for (let offset = 0; offset < pool.length; offset += 1) {
      const candidate = String(pool[(startIndex + offset) % pool.length] || '');
      if (!candidate || used.has(candidate)) continue;
      if (candidate.toLowerCase().includes(`${categoryPrefix}/`)) {
        used.add(candidate);
        return candidate;
      }
    }
  }

  return nextUniqueFromPool(pool, used, startIndex, '');
};

const stableHash = (value) => {
  const str = String(value || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const withUniqueVariant = (url, marker) => {
  const base = String(url || '').trim();
  if (!base) return '';
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}v=${encodeURIComponent(marker)}`;
};

async function migratePackages() {
  try {
    console.log('🔄 Starting package migration...');
    const db = await initDB();
    const masterPool = buildMasterImagePool();
    if (masterPool.length === 0) {
      throw new Error('No valid images available for package backgrounds/heroes');
    }
    
    // Clear existing packages
    await db.run('DELETE FROM packages');
    console.log('✓ Cleared existing packages');
    
    // Insert all packages
    let inserted = 0;
    const usedBackgroundBases = new Set();
    const usedHeroBases = new Set();
    const livingBedroomPool = masterPool.filter((url) => isLivingOrBedroomBackground(url));
    for (let index = 0; index < SEED_PACKAGES.length; index++) {
      const pkg = SEED_PACKAGES[index];
      try {
        const roomImageFallback = Array.isArray(pkg?.rooms) && pkg.rooms.length > 0
          ? String(pkg.rooms[index % pkg.rooms.length]?.image || '')
          : '';
        const seed = stableHash(`${pkg.id}-${pkg.type}-${pkg.bhk}-${index}`);

        const backgroundPool = Number(pkg?.bhk || 0) <= 3 && livingBedroomPool.length > 0
          ? livingBedroomPool
          : masterPool;

        const fallbackBackgroundBase = nextUniqueFromPool(backgroundPool, usedBackgroundBases, seed) || roomImageFallback || String(pkg.image || '');
        const fallbackHeroBase = nextUniqueFromPool(masterPool, usedHeroBases, seed + 17, fallbackBackgroundBase) || String(pkg.image || '') || fallbackBackgroundBase;

        const uniqueHeroImage = withUniqueVariant(fallbackHeroBase, `hero-${pkg.id}-${index}`);
        const uniqueBackgroundImage = withUniqueVariant(
          fallbackBackgroundBase,
          `bg-${pkg.id}-${index}`
        );

        const usedRoomBases = new Set();
        const uniqueRooms = (Array.isArray(pkg.rooms) ? pkg.rooms : []).map((room, roomIndex) => ({
          ...room,
          image: withUniqueVariant(
            selectUniqueRoomBase(
              String(room?.image || ''),
              masterPool,
              usedRoomBases,
              seed + roomIndex
            ) || String(room?.image || fallbackBackgroundBase),
            `room-${pkg.id}-${roomIndex}`
          )
        }));

        await db.run(
          `INSERT INTO packages (
            id, name, subtitle, description, type, bhk, category, 
            originalPrice, discountedPrice, image, backgroundImage, backgroundColor, 
            features, rooms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pkg.id,
            pkg.name,
            pkg.subtitle,
            pkg.description,
            pkg.type,
            pkg.bhk,
            pkg.category,
            pkg.originalPrice,
            pkg.discountedPrice,
            uniqueHeroImage,
            uniqueBackgroundImage,
            pkg.backgroundColor,
            JSON.stringify(pkg.features),
            JSON.stringify(uniqueRooms)
          ]
        );
        inserted++;
        
        // Log progress every 10 packages
        if (inserted % 10 === 0) {
          console.log(`✓ Inserted ${inserted} packages...`);
        }
      } catch (err) {
        console.error(`✗ Error inserting package ${pkg.id}:`, err.message);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted}/${SEED_PACKAGES.length} packages`);
    
    // Show statistics
    const result = await db.all(
      `SELECT type, bhk, COUNT(*) as count FROM packages GROUP BY type, bhk ORDER BY type, bhk`
    );
    
    console.log('\n📊 Package Distribution:');
    result.forEach(row => {
      console.log(`  - ${row.type} ${row.bhk}BHK: ${row.count} packages`);
    });
    
    const totalCheck = await db.get(`SELECT COUNT(*) as total FROM packages`);
    console.log(`\n✅ Total packages in database: ${totalCheck.total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePackages();
