import express from 'express';
const router = express.Router();
import fs from 'fs';
import path from 'path';

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
      const title = String(value.title || value.name || `Room ${index + 1}`);
      const image = String(value.image || value.url || value.photo || '').trim();
      if (!title && !image) return null;
      return {
        id: String(value.id || `${String(packageId || 'pkg')}-room-${index + 1}`),
        title,
        name: String(value.name || title),
        category: String(value.category || value.roomType || inferPackageRoomCategory(value)),
        image,
        description: String(value.description || `${title} related image`)
      };
    })
    .filter(Boolean);
};

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

const normalizeVillaToken = (value = '') =>
  String(value || '').replace(/\bvillas\b/gi, 'Villa');

const stripVillaToken = (value = '') =>
  String(value || '')
    .replace(/\bvillas?\b/gi, '')
    .replace(/\(\s*\)/g, '');

const ensureVillaMention = (value = '') => {
  const current = cleanupWhitespace(normalizeVillaToken(value));
  if (!current) return 'Villa';
  if (/\bvilla\b/i.test(current)) return current;
  return cleanupWhitespace(`${current} Villa`);
};

const resolveTypeByBhk = (pkg = {}) => {
  const rawType = String(pkg?.type || '').trim().toLowerCase();
  const bhk = Number(pkg?.bhk);
  const villaAllowed = Number.isFinite(bhk) && bhk >= 4;
  if (rawType === 'villa') return villaAllowed ? 'Villa' : 'Apartment';
  if (rawType === 'apartment') return 'Apartment';
  return villaAllowed ? 'Villa' : 'Apartment';
};

const normalizePackageLabelsByType = (pkg = {}) => {
  const normalizedType = resolveTypeByBhk(pkg);
  const isApartment = normalizedType === 'Apartment';
  const isVilla = normalizedType === 'Villa';

  const rawName = String(pkg?.name || '').trim();
  const rawSubtitle = String(pkg?.subtitle || '').trim();
  const rawCategory = String(pkg?.category || '').trim();

  const baseName = isVilla ? stripApartmentToken(rawName) : stripVillaToken(rawName);
  const baseSubtitle = isVilla ? stripApartmentToken(rawSubtitle) : stripVillaToken(rawSubtitle);
  const baseCategory = isVilla ? stripApartmentToken(rawCategory) : stripVillaToken(rawCategory);

  const name = isApartment
    ? ensureApartmentMention(baseName)
    : ensureVillaMention(baseName);
  const subtitle = isApartment
    ? cleanupWhitespace(normalizeApartmentToken(baseSubtitle))
    : cleanupWhitespace(normalizeVillaToken(baseSubtitle));
  const category = isApartment
    ? cleanupWhitespace(normalizeApartmentToken(baseCategory))
    : cleanupWhitespace(normalizeVillaToken(baseCategory));

  return {
    ...pkg,
    type: normalizedType,
    name: name || (isApartment ? 'Apartment Package' : 'Villa Package'),
    subtitle,
    category: category || rawCategory
  };
};
// Utility to get a random image for a package type
function getRandomImage(type) {
  const folder = path.join(process.cwd(), 'public', 'package-images', type.toLowerCase());
  if (!fs.existsSync(folder)) return '';
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.jpg'));
  if (!files.length) return '';
  const idx = Math.floor(Math.random() * files.length);
  return `/package-images/${type.toLowerCase()}/${files[idx]}`;
}

/**
 * POST /api/packages
 * Create a new package and assign random images
 * Body: { name, subtitle, description, type, bhk, category, originalPrice, discountedPrice, features, rooms }
 */
// router is now defined above
router.post('/packages', async (req, res) => {
  try {
    const db = await getDB();
    const {
      name, subtitle, description, type, bhk, category,
      originalPrice, discountedPrice, features, rooms
    } = req.body;

    const normalizedLabels = normalizePackageLabelsByType({
      name,
      subtitle,
      type,
      bhk,
      category
    });

    if (!name || !type || !bhk || !features || !rooms) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const imageBucket = normalizedLabels.type.toLowerCase() === 'villa' ? 'villa' : `${Number(bhk)}bhk`;
    const image = getRandomImage(imageBucket);
    let backgroundImage = image;
    if (normalizedLabels.type.toLowerCase() === 'villa') {
      backgroundImage = getRandomImage('villa');
    }

    const id = `${type}-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    await db.run(
      `INSERT INTO packages (id, name, subtitle, description, type, bhk, category, originalPrice, discountedPrice, image, backgroundImage, features, rooms, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        normalizedLabels.name,
        normalizedLabels.subtitle,
        description,
        normalizedLabels.type,
        bhk,
        normalizedLabels.category,
        originalPrice,
        discountedPrice,
        image,
        backgroundImage,
        JSON.stringify(features),
        JSON.stringify(rooms),
        now,
        now
      ]
    );

    res.json({ success: true, id, image, backgroundImage });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
/**
 * API routes for packages
 */

import { getDB } from '../database.js';

/**
 * GET /api/packages
 * Fetch all packages with optional filtering
 * Query params: type (Apartment|Villa), bhk (1-4)
 */
router.get('/packages', async (req, res) => {
  try {
    const db = await getDB();
    const { type, bhk } = req.query;
    
    let query = 'SELECT * FROM packages';
    const params = [];
    
    if (type) {
      query += ` WHERE type = ?`;
      params.push(type);
    }
    
    if (bhk) {
      if (params.length > 0) {
        query += ` AND bhk = ?`;
      } else {
        query += ` WHERE bhk = ?`;
      }
      params.push(parseInt(bhk));
    }
    
    const packages = await db.all(query, params);
    
    // Parse JSON fields
    const parsedPackages = packages.map(pkg => {
      const normalizedPkg = normalizePackageLabelsByType(pkg);
      return {
        ...normalizedPkg,
        features: JSON.parse(pkg.features),
        rooms: normalizePackageRooms(JSON.parse(pkg.rooms), pkg.id)
      };
    });
    
    res.json({
      success: true,
      count: parsedPackages.length,
      data: parsedPackages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/packages/:id
 * Fetch a specific package by ID
 */
router.get('/packages/:id', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    
    const pkg = await db.get('SELECT * FROM packages WHERE id = ?', [id]);
    
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    
    // Parse JSON fields
    const normalizedPkg = normalizePackageLabelsByType(pkg);
    normalizedPkg.features = JSON.parse(pkg.features);
    normalizedPkg.rooms = normalizePackageRooms(JSON.parse(pkg.rooms), pkg.id);
    
    res.json({ success: true, data: normalizedPkg });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/packages/stats/distribution
 * Get package distribution statistics
 */
router.get('/stats/distribution', async (req, res) => {
  try {
    const db = await getDB();
    
    const distribution = await db.all(
      `SELECT type, bhk, COUNT(*) as count FROM packages GROUP BY type, bhk ORDER BY type, bhk`
    );
    
    const total = await db.get(`SELECT COUNT(*) as total FROM packages`);
    
    res.json({
      success: true,
      total: total.total,
      distribution
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/packages/category/:category
 * Fetch packages by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const db = await getDB();
    const { category } = req.params;
    
    const packages = await db.all(
      'SELECT * FROM packages WHERE category = ? ORDER BY bhk, name',
      [category]
    );
    
    // Parse JSON fields
    const parsedPackages = packages.map(pkg => {
      const normalizedPkg = normalizePackageLabelsByType(pkg);
      return {
        ...normalizedPkg,
        features: JSON.parse(pkg.features),
        rooms: normalizePackageRooms(JSON.parse(pkg.rooms), pkg.id)
      };
    });
    
    res.json({
      success: true,
      category,
      count: parsedPackages.length,
      data: parsedPackages
    });
  } catch (error) {
    console.error('Error fetching category packages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
