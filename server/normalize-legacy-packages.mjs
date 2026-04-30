#!/usr/bin/env node
import sqlite3 from 'sqlite3';
import { pathToFileURL } from 'url';

const LEGACY_DB_PATH = 'server/ar_interia.db';

const BACKGROUND_POOL = [
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
];

const ROOM_IMAGE_POOL = {
  kitchen: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=900'
  ],
  bedroom: [
    'https://images.unsplash.com/photo-1616594039964-3d0f8f5f6f06?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1617328442775-4c9b046c044b?auto=format&fit=crop&q=80&w=900'
  ],
  living: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1600210491493-0946911123ea?auto=format&fit=crop&q=80&w=900'
  ],
  dining: [
    'https://images.unsplash.com/photo-1617198042775-4c9b046c044b?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1617638924700-92b0fc8bdaca?auto=format&fit=crop&q=80&w=900'
  ],
  bathroom: [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1552299305-5344527f6f53?auto=format&fit=crop&q=80&w=900'
  ],
  balcony: [
    'https://images.unsplash.com/photo-1542268908-4629dddae91f?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1585320806876-9f0a49b58b17?auto=format&fit=crop&q=80&w=900'
  ],
  office: [
    'https://images.unsplash.com/photo-1593642632505-c69ca3fbf5d7?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1593642532454-e138e28a63f4?auto=format&fit=crop&q=80&w=900'
  ],
  theater: [
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=900'
  ],
  gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=900'
  ],
  pool: [
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1576013551557-df6a70f5f9c3?auto=format&fit=crop&q=80&w=900'
  ],
  garden: [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=900'
  ],
  foyer: [
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&q=80&w=900',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=900'
  ]
};

const BG_COLORS = ['#FFF7EE', '#EEF6FF', '#F4EEFF', '#EEFFF3', '#FFF0F4', '#EDF9FF', '#FFF3E8', '#F5F0FF'];

const makeUniqueUrl = (url, marker) => {
  const raw = String(url || '').trim();
  if (!raw) return '';
  const joiner = raw.includes('?') ? '&' : '?';
  return `${raw}${joiner}v=${encodeURIComponent(marker)}`;
};

const normType = (value) => String(value || '').trim().toLowerCase();

const getRoomPlan = (type, bhk) => {
  const safeType = normType(type);
  const n = Number(bhk) || 1;
  const isVilla = safeType === 'villa';
  const isApartment = safeType === 'apartment';

  // Configure rooms based on BHK count
  if (n === 1) {
    // 1BHK: 1 bedroom, 1 kitchen, 1 bathroom, 1 living room
    const rooms = ['bedroom', 'kitchen', 'bathroom', 'living'];
    // Add balcony for apartments
    if (isApartment) {
      rooms.push('balcony');
    }
    return rooms;
  }
  
  if (n === 2) {
    // 2BHK: 2 bedrooms, 1 kitchen, 2 bathrooms, 1 living room, 1 dining hall
    const rooms = ['bedroom', 'bedroom', 'kitchen', 'bathroom', 'bathroom', 'living', 'dining'];
    // Add balcony for apartments
    if (isApartment) {
      rooms.push('balcony');
    }
    return rooms;
  }
  
  if (n === 3) {
    // 3BHK: 3 bedrooms, 1 kitchen, 2 bathrooms, 1 living, 1 dining, 1 office
    const rooms = ['bedroom', 'bedroom', 'bedroom', 'kitchen', 'bathroom', 'bathroom', 'living', 'dining', 'office'];
    // Add balcony for apartments
    if (isApartment) {
      rooms.push('balcony');
    }
    // Villa extras
    if (isVilla) {
      rooms.push('garden', 'pool');
    }
    return rooms;
  }
  
  // 4BHK+: 4 bedrooms, 1 kitchen, 3 bathrooms, 2 living, 1 dining, 1 office
  const rooms = ['bedroom', 'bedroom', 'bedroom', 'bedroom', 'kitchen', 'bathroom', 'bathroom', 'bathroom', 'living', 'living', 'dining', 'office'];
  // Add balconies for apartments
  if (isApartment) {
    rooms.push('balcony', 'balcony');
  }
  // Villa extras
  if (isVilla) {
    rooms.push('garden', 'pool', 'gym', 'theater');
  }
  return rooms;
};

const titleMap = {
  kitchen: 'Designer Kitchen',
  bedroom: 'Premium Bedroom Suite',
  living: 'Grand Living Area',
  dining: 'Elegant Dining Space',
  bathroom: 'Luxury Bathroom',
  balcony: 'Balcony Lounge',
  office: 'Home Office Studio',
  theater: 'Home Theater',
  gym: 'Fitness Studio',
  pool: 'Pool Deck',
  garden: 'Landscape Garden',
  foyer: 'Entrance Foyer'
};

const descriptionMap = {
  kitchen: 'Optimized modular kitchen with premium storage and smart layout.',
  bedroom: 'Comfort-focused bedroom with wardrobe planning and premium finish.',
  living: 'Spacious living room with layered lighting and premium seating zones.',
  dining: 'Dining zone designed for family use and entertaining guests.',
  bathroom: 'Modern bathroom with spa-like fixtures and easy maintenance.',
  balcony: 'Relaxing balcony area with weather-ready materials.',
  office: 'Dedicated work/study room with ergonomic planning.',
  theater: 'Acoustic-ready media room for home entertainment.',
  gym: 'Compact wellness room for cardio and strength routines.',
  pool: 'Villa poolside experience with seating and ambient lighting.',
  garden: 'Green outdoor area with low-maintenance landscape planning.',
  foyer: 'Welcoming entry zone with decor and storage utility.'
};

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

export async function normalizeLegacyPackages() {
  const db = new sqlite3.Database(LEGACY_DB_PATH);

  try {
    await run(db, 'CREATE TABLE IF NOT EXISTS app_migrations (id TEXT PRIMARY KEY, details TEXT, appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP)').catch(() => {});
    const existing = await all(db, 'SELECT id FROM app_migrations WHERE id = ?', ['normalize-legacy-packages-v2']);
    if (existing && existing.length > 0) {
      return { ok: true, skipped: true };
    }

    await run(db, 'ALTER TABLE packages ADD COLUMN backgroundImage TEXT').catch(() => {});
    await run(db, 'ALTER TABLE packages ADD COLUMN backgroundColor TEXT').catch(() => {});

    const packages = await all(db, 'SELECT * FROM packages ORDER BY type ASC, bhk ASC, id ASC');
    const usedHero = new Set();
    const usedBg = new Set();

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const baseHero = String(pkg.image || BACKGROUND_POOL[i % BACKGROUND_POOL.length]);
      const uniqueHero = makeUniqueUrl(baseHero, `legacy-hero-${pkg.id}-${i}`);
      const uniqueBg = makeUniqueUrl(BACKGROUND_POOL[(i + 3) % BACKGROUND_POOL.length], `legacy-bg-${pkg.id}-${i}`);
      const bgColor = BG_COLORS[i % BG_COLORS.length];

      usedHero.add(uniqueHero);
      usedBg.add(uniqueBg);

      await run(
        db,
        'UPDATE packages SET image = ?, backgroundImage = ?, backgroundColor = ? WHERE id = ?',
        [uniqueHero, uniqueBg, bgColor, pkg.id]
      );

      const plan = getRoomPlan(pkg.type, pkg.bhk);
      const existingRows = await all(db, 'SELECT * FROM package_designs WHERE packageId = ? ORDER BY createdAt ASC, id ASC', [pkg.id]);

      for (let j = 0; j < plan.length; j++) {
        const roomType = plan[j];
        const imageCandidates = ROOM_IMAGE_POOL[roomType] || ROOM_IMAGE_POOL.living;
        const baseImg = imageCandidates[j % imageCandidates.length] || imageCandidates[0];
        const uniqueRoomImg = makeUniqueUrl(baseImg, `legacy-room-${pkg.id}-${j}`);
        const title = titleMap[roomType] || 'Interior Design Room';
        const description = descriptionMap[roomType] || 'Curated room design based on package configuration.';

        if (existingRows[j]) {
          await run(
            db,
            'UPDATE package_designs SET title = ?, image = ?, description = ? WHERE id = ?',
            [title, uniqueRoomImg, description, existingRows[j].id]
          );
        } else {
          await run(
            db,
            'INSERT INTO package_designs (id, packageId, title, image, description) VALUES (?, ?, ?, ?, ?)',
            [`${pkg.id}-room-${j + 1}`, pkg.id, title, uniqueRoomImg, description]
          );
        }
      }

      if (existingRows.length > plan.length) {
        const removeIds = existingRows.slice(plan.length).map((r) => r.id);
        for (const id of removeIds) {
          await run(db, 'DELETE FROM package_designs WHERE id = ?', [id]);
        }
      }
    }

    const packageStats = await all(db, 'SELECT COUNT(*) AS total, COUNT(DISTINCT image) AS uniqueHero, COUNT(DISTINCT backgroundImage) AS uniqueBackground FROM packages');
    const roomStats = await all(db, 'SELECT COUNT(*) AS total, COUNT(DISTINCT image) AS uniqueRoomImages FROM package_designs');
    const roomDist = await all(db, 'SELECT packageId, COUNT(*) AS roomCount FROM package_designs GROUP BY packageId ORDER BY packageId ASC');

    const result = {
      ok: true,
      packages: packageStats[0] || {},
      rooms: roomStats[0] || {},
      roomDistribution: roomDist
    };
    
    await run(db, 'INSERT INTO app_migrations (id, details) VALUES (?, ?)', ['normalize-legacy-packages-v2', 'done']).catch(() => {});
    
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Legacy package normalization failed:', error?.message || error);
    throw error;
  } finally {
    db.close();
  }
}

const isDirectExecution = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  normalizeLegacyPackages().catch(() => {
    process.exitCode = 1;
  });
}
