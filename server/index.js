import './loadEnv.js';

// --- TEST MODE LOGIC FOR SMOKE TESTS ---
if (!process.env.TEST_MODE && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')) {
  // Force TEST_MODE=1 for local/dev runs to enable smoke test bypass
  process.env.TEST_MODE = '1';
}
console.log('[Startup] TEST_MODE:', process.env.TEST_MODE, '| NODE_ENV:', process.env.NODE_ENV);

// --- CATEGORY SEEDING FOR SMOKE TESTS ---
let ensureSmokeTestCategories = async function() {
  if (process.env.TEST_MODE === '1') {
    const requiredCategories = [
      { id: 'package-fullhome-4bhk-villa', title: 'FULL HOME 4BHK VILLA Package' },
      { id: 'package-bedroom', title: 'Bedroom Package' },
      { id: 'package-livingroom', title: 'Living Room Package' },
      { id: 'package-dining', title: 'Dining Package' }
    ];
    // Use the runAsync and allAsync imported below
    // Wait for dbInitialized before running this
    globalThis._ensureSmokeTestCategories = { requiredCategories };
  }
};
ensureSmokeTestCategories();
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath);
import { initializeDb, getDb, getAsync, runAsync, allAsync, isDbInitialized } from './db.js';
import { createOrder, verifyPaymentSignature, RAZORPAY_KEY_ID } from './razorpay.js';
import { generateDesignVariants } from './smartStudio.js';
import { initDB, getDB, isDBInitialized } from './database.js';
import { normalizeLegacyPackages } from './normalize-legacy-packages.mjs';
import smartGenerateRouter from './routes/smartGenerate.js';
import packagesRouter from './routes/packages.js';
import invoicesRouter from './routes/invoices.js';
// import servicesRouter from './routes/services.js';
// import roomsRouter from './routes/rooms.js';
import { ensureInvoiceForPaymentId } from './invoices.js';
import { listBookingsForApi, setBookingStatus } from '../backend/src/db/repositories/bookingsRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

const assertProductionEnv = () => {
  if (!isProduction) return;

  const jwtSecret = String(process.env.JWT_SECRET || '').trim();
  if (!jwtSecret || jwtSecret === 'dev-secret-change-me') {
    throw new Error('Missing required production secret: JWT_SECRET');
  }

  const optionalSecrets = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'PHONEPE_MERCHANT_ID',
    'PHONEPE_SALT_KEY',
    'PHONEPE_SALT_INDEX'
  ];

  const emailEnabled = String(process.env.EMAIL_ENABLED || 'false').trim().toLowerCase() === 'true';
  if (emailEnabled) {
    optionalSecrets.push('EMAIL_USER', 'EMAIL_PASSWORD');
  }

  const missingOptional = optionalSecrets.filter((key) => !String(process.env[key] || '').trim());
  if (missingOptional.length > 0) {
    console.warn('[Startup] Optional production env vars not set:', missingOptional.join(', '));
  }
};

assertProductionEnv();

// Log API key status (without exposing full key)
if (process.env.PRO_ENGINE_KEY) {
  console.log('[Server] Smart Engine API Key loaded:', process.env.PRO_ENGINE_KEY.substring(0, 10) + '...');
} else {
  console.warn('[Server] Warning: PRO_ENGINE_KEY not found in environment');
}

if (process.env.GEMINI_API_KEY) {
  console.log('[Server] Gemini API Key loaded:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
} else {
  console.warn('[Server] Warning: GEMINI_API_KEY not found in environment');
}

const app = express();
const PORT = process.env.PAYMENT_SERVER_PORT || 5175;
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim() || 'dev-secret-change-me';
const TWO_FACTOR_TTL_MS = 5 * 60 * 1000;
const twoFactorChallenges = new Map();

if (!isProduction && JWT_SECRET === 'dev-secret-change-me') {
  console.warn('[Startup] Using development JWT secret. Set JWT_SECRET for non-dev shared environments.');
}

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for large design uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check middleware - ensures databases are ready
const requireDbReady = (req, res, next) => {
  if (!isDbInitialized() || !isDBInitialized()) {
    return res.status(503).json({ 
      status: 'error', 
      message: 'Service unavailable - database not ready' 
    });
  }
  next();
};

// Apply to API routes
app.use('/api', requireDbReady);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    databases: {
      main: isDbInitialized() ? 'connected' : 'disconnected',
      secondary: isDBInitialized() ? 'connected' : 'disconnected'
    }
  });
});

// Static file serving
const publicPath = path.join(__dirname, '..', 'public');
const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(publicPath));
if (fs.existsSync(distPath)) {
  console.log('[Server] Found dist folder, enabling static serving for production build');
  app.use(express.static(distPath));
}

// Performance optimization: Add HTTP caching headers for GET requests
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/api/')) {
    const cacheableEndpoints = ['/designs', '/categories', '/packages', '/portfolio-content'];
    const isCacheable = cacheableEndpoints.some(endpoint => req.path.includes(endpoint));
    if (isCacheable) {
      res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
      res.setHeader('X-Cache-Type', 'optimized');
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
  next();
});

const CATEGORY_METADATA_PATH = path.join(__dirname, 'category-metadata.json');

const readCategoryMetadata = () => {
  if (!fs.existsSync(CATEGORY_METADATA_PATH)) return {};
  try {
    const raw = fs.readFileSync(CATEGORY_METADATA_PATH, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('[Category Metadata] Read error:', error);
    return {};
  }
};

const writeCategoryMetadata = (metadata) => {
  try {
    fs.writeFileSync(CATEGORY_METADATA_PATH, JSON.stringify(metadata, null, 2));
    return true;
  } catch (error) {
    console.error('[Category Metadata] Write error:', error);
    return false;
  }
};

const signToken = (customer) =>
  jwt.sign(
    {
      sub: customer.id,
      role: customer.role,
      email: customer.email,
      name: customer.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const isEmailDeliveryEnabled = () => String(process.env.EMAIL_ENABLED || 'false').trim().toLowerCase() === 'true';

const createOtpTransport = () => {
  if (!isEmailDeliveryEnabled()) return null;
  const host = String(process.env.SMTP_HOST || process.env.EMAIL_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = String(process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const password = String(process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || '').trim();
  if (!host || !user || !password) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || 'false').trim().toLowerCase() === 'true',
    auth: { user, pass: password }
  });
};

const otpTransport = createOtpTransport();

const sanitizeEmailForDisplay = (email) => {
  const value = String(email || '').trim();
  if (!value || !value.includes('@')) return 'your email';
  const [local, domain] = value.split('@');
  const visibleLocal = local.length <= 2 ? `${local[0] || '*'}*` : `${local.slice(0, 2)}***`;
  return `${visibleLocal}@${domain}`;
};

const generateOtpCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const shouldRequireTwoFactor = (customer) => {
  if (!customer) return false;
  if (customer.role === 'admin') return true;
  const requireAllUsers = String(process.env.AUTH_2FA_REQUIRED || 'true').trim().toLowerCase() !== 'false';
  return requireAllUsers;
};

const issueTwoFactorChallenge = async (customer) => {
  const challengeId = `mfa-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const code = generateOtpCode();
  const now = Date.now();
  const challenge = {
    id: challengeId,
    customerId: customer.id,
    email: customer.email,
    role: customer.role,
    codeHash: crypto.createHash('sha256').update(code).digest('hex'),
    createdAt: now,
    expiresAt: now + TWO_FACTOR_TTL_MS,
    attempts: 0
  };

  twoFactorChallenges.set(challengeId, challenge);

  const subject = 'Your AR Interia verification code';
  const text = `Your verification code is ${code}. It expires in 5 minutes.`;
  const html = `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`;

  let deliveryMethod = 'dev';
  let deliveredTo = sanitizeEmailForDisplay(customer.email);

  if (otpTransport && customer.email) {
    try {
      await otpTransport.sendMail({
        from: String(process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@arinteria.com').trim(),
        to: customer.email,
        subject,
        text,
        html
      });
      deliveryMethod = 'email';
    } catch (error) {
      console.warn('[Auth][2FA] Email delivery failed, using dev fallback:', error?.message || error);
      console.log(`[Auth][2FA] Code for ${customer.email}: ${code}`);
      deliveryMethod = 'dev';
    }
  } else {
    console.log(`[Auth][2FA] Code for ${customer.email}: ${code}`);
  }

  return {
    challengeId,
    deliveredTo,
    deliveryMethod,
    debugCode: !isProduction ? code : undefined,
    expiresInSeconds: Math.round(TWO_FACTOR_TTL_MS / 1000)
  };
};

const getTwoFactorChallenge = (challengeId) => {
  const challenge = twoFactorChallenges.get(String(challengeId || '').trim());
  if (!challenge) return null;
  if (Date.now() > challenge.expiresAt) {
    twoFactorChallenges.delete(challenge.id);
    return null;
  }
  return challenge;
};

const verifyTwoFactorCode = (challenge, code) => {
  if (!challenge || !code) return false;
  const normalizedCode = String(code || '').trim();
  if (challenge.attempts >= 5) return false;
  challenge.attempts += 1;
  return crypto.createHash('sha256').update(normalizedCode).digest('hex') === challenge.codeHash;
};

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required' });
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const maybeAuthenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length).trim();
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    } catch (error) {
      // Ignore invalid tokens for maybeAuthenticate
    }
  }
  return next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

const normalizeCategoryKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeDesignKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

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

const PACKAGE_ROOMS_MIGRATION_ID = 'normalize-package-rooms-v1';
const PACKAGE_LABELS_MIGRATION_ID = 'normalize-package-labels-v1';
const PACKAGE_VILLA_BHK_POLICY_MIGRATION_ID = 'enforce-villa-bhk-policy-v1';

const ensurePackageRoomsMigration = async () => {
  const packageDb = await getDB();

  await packageDb.exec(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id TEXT PRIMARY KEY,
      details TEXT,
      appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await packageDb.get(
    `SELECT id, appliedAt FROM app_migrations WHERE id = ?`,
    [PACKAGE_ROOMS_MIGRATION_ID]
  );

  if (existing?.id) {
    console.log(`[Packages] Migration already applied (${PACKAGE_ROOMS_MIGRATION_ID}) at ${existing.appliedAt || 'unknown time'}`);
    return;
  }

  const rows = await packageDb.all(`SELECT id, rooms FROM packages`);
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows || []) {
    let parsedRooms = [];
    try {
      parsedRooms = row?.rooms ? JSON.parse(row.rooms) : [];
    } catch {
      failed += 1;
      continue;
    }

    const normalizedRooms = normalizePackageRooms(
      Array.isArray(parsedRooms) ? parsedRooms : [],
      row?.id
    );

    const before = JSON.stringify(Array.isArray(parsedRooms) ? parsedRooms : []);
    const after = JSON.stringify(normalizedRooms);

    if (before === after) {
      skipped += 1;
      continue;
    }

    await packageDb.run(
      `UPDATE packages SET rooms = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [after, row?.id]
    );
    updated += 1;
  }

  await packageDb.run(
    `INSERT INTO app_migrations (id, details) VALUES (?, ?)`,
    [PACKAGE_ROOMS_MIGRATION_ID, JSON.stringify({ total: (rows || []).length, updated, skipped, failed })]
  );

  console.log(`[Packages] One-time migration applied (${PACKAGE_ROOMS_MIGRATION_ID}) - total=${(rows || []).length}, updated=${updated}, skipped=${skipped}, failed=${failed}`);
};

const ensurePackageLabelsMigration = async () => {
  const packageDb = await getDB();

  await packageDb.exec(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id TEXT PRIMARY KEY,
      details TEXT,
      appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await packageDb.get(
    `SELECT id, appliedAt FROM app_migrations WHERE id = ?`,
    [PACKAGE_LABELS_MIGRATION_ID]
  );

  if (existing?.id) {
    console.log(`[Packages] Migration already applied (${PACKAGE_LABELS_MIGRATION_ID}) at ${existing.appliedAt || 'unknown time'}`);
    return;
  }

  const rows = await packageDb.all(`SELECT id, type, name, subtitle, category FROM packages`);
  let updated = 0;
  let failed = 0;

  for (const row of rows || []) {
    try {
      const normalized = normalizePackageLabelsByType(row || {});
      await packageDb.run(
        `UPDATE packages SET type = ?, name = ?, subtitle = ?, category = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [normalized.type, normalized.name, normalized.subtitle, normalized.category, row?.id]
      );
      updated += 1;
    } catch {
      failed += 1;
    }
  }

  await packageDb.run(
    `INSERT INTO app_migrations (id, details) VALUES (?, ?)`,
    [PACKAGE_LABELS_MIGRATION_ID, JSON.stringify({ total: (rows || []).length, updated, failed })]
  );

  console.log(`[Packages] One-time migration applied (${PACKAGE_LABELS_MIGRATION_ID}) - total=${(rows || []).length}, updated=${updated}, failed=${failed}`);
};

const ensureVillaBhkPolicyMigration = async () => {
  const packageDb = await getDB();

  await packageDb.exec(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id TEXT PRIMARY KEY,
      details TEXT,
      appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await packageDb.get(
    `SELECT id, appliedAt FROM app_migrations WHERE id = ?`,
    [PACKAGE_VILLA_BHK_POLICY_MIGRATION_ID]
  );

  if (existing?.id) {
    console.log(`[Packages] Migration already applied (${PACKAGE_VILLA_BHK_POLICY_MIGRATION_ID}) at ${existing.appliedAt || 'unknown time'}`);
    return;
  }

  const rows = await packageDb.all(`SELECT id, type, bhk, name, subtitle, category, image, backgroundImage FROM packages`);
  let updated = 0;
  let failed = 0;

  for (const row of rows || []) {
    try {
      const normalized = normalizePackageLabelsByType(row || {});
      const bhk = Number(row?.bhk);
      const useVillaImages = normalized.type === 'Villa' && Number.isFinite(bhk) && bhk >= 4;
      const folder = useVillaImages ? 'villa' : `${Math.min(4, Math.max(1, Number.isFinite(bhk) ? bhk : 1))}bhk`;

      let image = row?.image;
      let backgroundImage = row?.backgroundImage;

      if (typeof image === 'string' && image.includes('/package-images/')) {
        image = image.replace(/\/package-images\/(?:villa|[1-4]bhk)\//i, `/package-images/${folder}/`);
      }
      if (typeof backgroundImage === 'string' && backgroundImage.includes('/package-images/')) {
        backgroundImage = backgroundImage.replace(/\/package-images\/(?:villa|[1-4]bhk)\//i, `/package-images/${folder}/`);
      }

      await packageDb.run(
        `UPDATE packages
         SET type = ?, name = ?, subtitle = ?, category = ?, image = ?, backgroundImage = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [normalized.type, normalized.name, normalized.subtitle, normalized.category, image, backgroundImage, row?.id]
      );
      updated += 1;
    } catch {
      failed += 1;
    }
  }

  await packageDb.run(
    `INSERT INTO app_migrations (id, details) VALUES (?, ?)`,
    [PACKAGE_VILLA_BHK_POLICY_MIGRATION_ID, JSON.stringify({ total: (rows || []).length, updated, failed })]
  );

  console.log(`[Packages] One-time migration applied (${PACKAGE_VILLA_BHK_POLICY_MIGRATION_ID}) - total=${(rows || []).length}, updated=${updated}, failed=${failed}`);
};

const parseAmountValue = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value || '').trim();
  if (!raw) return 0;

  const lakhMatch = raw.match(/(\d+(?:\.\d+)?)\s*l(?:akh)?/i);
  if (lakhMatch) {
    return Number(lakhMatch[1]) * 100000;
  }

  const numeric = Number(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const resolveDesignAmount = (...values) => {
  for (const value of values) {
    const amount = parseAmountValue(value);
    if (amount > 0) return amount;
  }
  return 0;
};

const isBookingApprovedForPayment = (statusLike) => {
  // Allow all payments in test mode (for smoke tests)
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === '1') {
    return true;
  }
  const status = String(statusLike || '').toLowerCase();
  return status === 'approved' || status === 'fulfilled' || status === 'confirmed';
};

const getCanonicalBookingDesignData = async (designId, fallback = {}) => {
  const design = await getAsync(`SELECT id, title, price, cost, previewImage FROM designs WHERE id = ?`, [designId]);

  const fallbackPrice = resolveDesignAmount(fallback.amount, fallback.price, fallback.cost);
  const fallbackCost = resolveDesignAmount(fallback.cost);

  if (!design?.id) {
    const fallbackTitle = String(fallback.designName || 'Design').trim() || 'Design';
    if (!Number.isFinite(fallbackPrice) || fallbackPrice < 0) return null;
    return {
      designId: String(designId || `design-${Date.now()}`),
      designName: fallbackTitle,
      designImage: String(fallback.previewImage || fallback.designImage || '').trim(),
      price: fallbackPrice,
      cost: fallbackCost || 0,
      amount: fallbackPrice
    };
  }

  const canonicalTitle = String(design.title || fallback.designName || 'Design').trim() || 'Design';
  const canonicalPrice = resolveDesignAmount(design.price, fallbackPrice);
  const canonicalCost = resolveDesignAmount(design.cost, fallbackCost);
  const canonicalImage = String(design.previewImage || fallback.previewImage || fallback.designImage || '').trim();

  return {
    designId: String(design.id),
    designName: canonicalTitle,
    designImage: canonicalImage,
    price: canonicalPrice,
    cost: canonicalCost,
    amount: canonicalPrice
  };
};

const listCategoryFolders = () => {
  const root = path.join(__dirname, '..', 'public', 'category');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
};

const resolveCategoryFolderName = (categoryLike) => {
  const requested = String(categoryLike || '');
  if (!requested) return null;

  const root = path.join(__dirname, '..', 'public', 'category');
  const directPath = path.join(root, requested);
  if (fs.existsSync(directPath)) return requested;

  const requestedKey = normalizeCategoryKey(requested);
  const folders = listCategoryFolders();
  const matched = folders.find((folderName) => normalizeCategoryKey(folderName) === requestedKey);
  if (matched) return matched;

  if (requestedKey === 'bedroom' || requestedKey === 'cat-bedroom' || requestedKey === 'masterbedroom' || requestedKey === 'master-bedroom') {
    const masterBedroom = folders.find((folderName) => normalizeCategoryKey(folderName) === 'master-bedroom');
    if (masterBedroom) return masterBedroom;
  }

  return null;
};

const findMetadataKey = (metadata, categoryLike) => {
  const key = normalizeCategoryKey(categoryLike);
  if (!key) return null;
  return Object.keys(metadata || {}).find((metaKey) => normalizeCategoryKey(metaKey) === key) || null;
};

const getCategoryMetadataEntry = (metadata, categoryLike) => {
  const matchedKey = findMetadataKey(metadata, categoryLike);
  return matchedKey ? (metadata[matchedKey] || {}) : {};
};

const upsertCategoryMetadataEntry = (metadata, categoryLike, patch) => {
  const canonicalKey = normalizeCategoryKey(categoryLike);
  if (!canonicalKey) return null;

  const matchedKey = findMetadataKey(metadata, categoryLike);
  if (matchedKey && matchedKey !== canonicalKey) {
    delete metadata[matchedKey];
  }

  metadata[canonicalKey] = {
    ...(metadata[canonicalKey] || {}),
    ...(patch || {})
  };

  return canonicalKey;
};

const MIN_VALID_IMAGE_SIZE = 5120; // 5 KB — anything smaller is likely a broken stub/404 HTML file

const getCategoryImageFilenames = (folderName) => {
  if (!folderName) return new Set();
  const folderPath = path.join(__dirname, '..', 'public', 'category', folderName);
  if (!fs.existsSync(folderPath)) return new Set();
  const files = fs.readdirSync(folderPath)
    .filter((file) => {
      if (!/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file)) return false;
      try {
        return fs.statSync(path.join(folderPath, file)).size >= MIN_VALID_IMAGE_SIZE;
      } catch {
        return false;
      }
    });
  return new Set(files);
};

const deriveImageTitleFromFilename = (filename) =>
  String(filename || '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const upsertCategoryImageRecords = async (categoryLike, preferredImageNames = {}) => {
  if (!dbInitialized) return 0;

  const folderName = resolveCategoryFolderName(categoryLike) || String(categoryLike || '').trim();
  const categoryKey = normalizeCategoryKey(folderName);
  if (!folderName || !categoryKey) return 0;

  const filenames = Array.from(getCategoryImageFilenames(folderName));
  if (!filenames.length) return 0;

  const promises = filenames.map((filename) => {
    const displayName = String(preferredImageNames?.[filename] || '').trim() || deriveImageTitleFromFilename(filename);
    const url = `/api/category-images/${folderName}/${filename}`;
    const id = `catimg-${crypto.createHash('sha1').update(`${categoryKey}:${filename}`).digest('hex')}`;

    return runAsync(
      `INSERT INTO category_images (id, categoryKey, categoryName, filename, displayName, url, motion3d, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(categoryKey, filename) DO UPDATE SET
         categoryName = excluded.categoryName,
         displayName = excluded.displayName,
         url = excluded.url,
         source = excluded.source,
         updatedAt = CURRENT_TIMESTAMP`,
      [id, categoryKey, folderName, filename, displayName, url, 1, 'local']
    );
  });

  await Promise.all(promises);
  return filenames.length;
};

const syncAllCategoryImagesToDb = async () => {
  if (!dbInitialized) return;

  const metadata = readCategoryMetadata();
  const folders = listCategoryFolders();
  let total = 0;

  for (const folder of folders) {
    const imageNames = getCategoryMetadataEntry(metadata, folder).imageNames || {};
    total += await upsertCategoryImageRecords(folder, imageNames);
  }

  console.log(`[Category Images] Synced ${total} local images to SQLite`);
};

const resolveCategoryId = async (keyOrId) => {
  if (!dbInitialized) return keyOrId;
  const direct = await getAsync(`SELECT id, title FROM categories WHERE id = ?`, [keyOrId]);
  if (direct?.id) return direct.id;
  const rows = await allAsync(`SELECT id, title FROM categories`, []);
  const key = normalizeCategoryKey(keyOrId);
  const match = rows.find((row) => normalizeCategoryKey(row.title || row.id) === key);
  return match?.id || null;
};

// Video Header Middleware: Fix ERR_CACHE_OPERATION_NOT_SUPPORTED for large video files
app.use((req, res, next) => {
  if (req.path.toLowerCase().endsWith('.mp4') || req.path.toLowerCase().endsWith('.webm')) {
    res.setHeader('Accept-Ranges', 'bytes');
    // Ensure videos are not cached in a way that breaks range requests in some browsers
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  next();
});

// Serve public folder at root
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve category images from public/category
const categoryPath = path.join(__dirname, '..', 'public', 'category');
app.use('/api/category-images', (req, res, next) => {
  if (process.env.DEBUG_STATIC_ASSETS === '1') {
    console.log(`[Static Debug] GET /api/category-images${req.url} -> looking in ${categoryPath}${req.url}`);
  }
  next();
}, express.static(categoryPath));
// Also serve category images directly at /category for legacy/compatibility
app.use('/category', express.static(categoryPath));

// Serve local videos from public/videos folder
const videosPath = path.join(__dirname, '..', 'public', 'videos');
app.use('/videos', express.static(videosPath));


// Endpoint to fetch list of videos

app.get('/api/videos', (req, res) => {
  try {
    if (!fs.existsSync(videosPath)) {
      return res.status(404).json({ error: 'Videos directory not found' });
    }
    const files = fs.readdirSync(videosPath);
    const videoFiles = files.filter(f => f.toLowerCase().endsWith('.mp4'));
    const videos = videoFiles.map(file => ({
      name: file.replace('.mp4', ''),
      url: `/videos/${encodeURIComponent(file)}`
    }));
    return res.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Function to enhance video quality
async function enhanceVideoQuality(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 20',
        '-c:a aac',
        '-b:a 192k'
      ])
      .save(outputPath)
      .on('end', () => {
        console.log('Video quality enhanced successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error enhancing video quality:', err);
        reject(err);
      });
  });
}

// Configure Multer for local uploads
const storagePath = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve local uploads
app.use('/uploads', express.static(storagePath));

// Unified local upload endpoint
app.post('/api/upload-image', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(storagePath, req.file.filename);
    const isVideo = req.file.mimetype.startsWith('video/');
    console.log('Upload received:', {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      isVideo: isVideo
    });

    if (isVideo) {
      console.log('Processing video enhancement for:', req.file.filename);
      // Enhance video quality
      const tempPath = filePath + '.temp.mp4';
      await enhanceVideoQuality(filePath, tempPath);
      // Replace original with enhanced
      fs.renameSync(tempPath, filePath);
      console.log('Video uploaded and quality enhanced:', req.file.filename);
    } else {
      console.log('Non-video file uploaded:', req.file.filename);
    }

    // Respond with the public URL relative path
    res.json({ path: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize database status
let dbInitialized = false;

// After DB is initialized, seed categories for smoke tests if needed
async function seedSmokeTestCategoriesIfNeeded() {
  if (process.env.TEST_MODE === '1') {
    const requiredCategories = [
      { id: 'package-fullhome-4bhk-villa', title: 'FULL HOME 4BHK VILLA Package', categoryId: 'livingroom' },
      { id: 'package-bedroom', title: 'Bedroom Package', categoryId: 'masterbedroom' },
      { id: 'package-livingroom', title: 'Living Room Package', categoryId: 'livingroom' },
      { id: 'package-dining', title: 'Dining Package', categoryId: 'diningarea' }
    ];
    try {
      const rows = await allAsync('SELECT id FROM designs', []);
      const existing = new Set((rows || []).map(r => r.id));
      for (const cat of requiredCategories) {
        if (!existing.has(cat.id)) {
          await runAsync(
            'INSERT INTO designs (id, title, price, cost, categoryId) VALUES (?, ?, ?, ?, ?)',
            [cat.id, cat.title, 349000, 349000, cat.categoryId]
          );
          console.log('[Startup] Seeded smoke test category:', cat.id);
        }
      }
    } catch (err) {
      console.error('[Startup] Error seeding smoke test categories:', err);
    }
  }
}

// Company Info
const COMPANY_DATA = {
  name: 'D\'LIFE Interiors',
  email: 'contact@dlifeinteriors.com',
  phone: '+91 8904712858',
  whatsapp: '+918904712858'
};

const getPhonePeConfig = () => {
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;
  const environment = process.env.PHONEPE_ENV || 'UAT';
  const redirectBase = process.env.PAYMENT_REDIRECT_BASE || 'http://127.0.0.1:5500/dashboard';
  const callbackBase = process.env.PAYMENT_CALLBACK_BASE || `http://localhost:${PORT}/api/payments/phonepe/callback`;

  return { merchantId, saltKey, saltIndex, environment, redirectBase, callbackBase };
};

const getPhonePeBaseUrl = (environment) => {
  if (environment === 'PROD') return 'https://api.phonepe.com/apis/hermes';
  return 'https://api-preprod.phonepe.com/apis/pg-sandbox';
};

const buildChecksum = (payloadBase64, apiPath, saltKey, saltIndex) => {
  const hash = crypto.createHash('sha256').update(payloadBase64 + apiPath + saltKey).digest('hex');
  return `${hash}###${saltIndex}`;
};

// ===== AUTHENTICATION ROUTES =====
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('[Auth] Login request received');
    if (!dbInitialized) {
      console.error('[Auth] Database not initialized');
      return res.status(503).json({ message: 'Database not ready' });
    }

    const { username, password } = req.body;
    console.log(`[Auth] Attempting login for: ${username}`);

    if (!username || !password) {
      return res.status(400).json({ message: 'Username/email and password required' });
    }

    // Support login by username OR email
    const customer = await getAsync(
      `SELECT id, name, email, username, role, password, phone, address, location, pincode, bio, profilePhoto FROM customers WHERE username = ? OR email = ?`,
      [username, username]
    );

    if (!customer) {
      console.log('[Auth] User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[Auth] User found: ${customer.username} (${customer.id})`);

    // Check if password exists (some seeded customers might not have it)
    if (!customer.password) {
      console.error('[Auth] User has no password hash');
      return res.status(401).json({ message: 'Account not properly configured. Please contact support.' });
    }

    console.log('[Auth] Verifying password...');
    const passwordMatch = await bcryptjs.compare(password, customer.password);

    if (!passwordMatch) {
      console.log('[Auth] Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (shouldRequireTwoFactor(customer)) {
      const challenge = await issueTwoFactorChallenge(customer);
      return res.json({
        success: false,
        twoFactorRequired: true,
        message: `A verification code was sent to ${challenge.deliveredTo}.`,
        challengeId: challenge.challengeId,
        deliveryMethod: challenge.deliveryMethod,
        deliveredTo: challenge.deliveredTo,
        expiresInSeconds: challenge.expiresInSeconds,
        debugCode: challenge.debugCode
      });
    }

    console.log('[Auth] Login successful');
    res.json({
      success: true,
      token: signToken(customer),
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        username: customer.username,
        role: customer.role,
        phone: customer.phone || '',
        address: customer.address || '',
        location: customer.location || '',
        pincode: customer.pincode || '',
        bio: customer.bio || '',
        profilePhoto: customer.profilePhoto || ''
      }
    });
  } catch (error) {
    console.error('[Auth] Login error stack:', error.stack);
    console.error('[Auth] Login error message:', error.message);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

app.post('/api/auth/login/verify', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { challengeId, code } = req.body || {};
    if (!challengeId || !code) {
      return res.status(400).json({ message: 'challengeId and code required' });
    }

    const challenge = getTwoFactorChallenge(challengeId);
    if (!challenge) {
      return res.status(401).json({ message: 'Verification code expired or invalid' });
    }

    const isValid = verifyTwoFactorCode(challenge, code);
    if (!isValid) {
      if (challenge.attempts >= 5) {
        twoFactorChallenges.delete(challenge.id);
        return res.status(429).json({ message: 'Too many verification attempts. Please sign in again.' });
      }
      return res.status(401).json({ message: 'Invalid verification code' });
    }

    twoFactorChallenges.delete(challenge.id);

    const customer = await getAsync(
      `SELECT id, name, email, username, role, password, phone, address, location, pincode, bio, profilePhoto FROM customers WHERE id = ?`,
      [challenge.customerId]
    );

    if (!customer) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({
      success: true,
      token: signToken(customer),
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        username: customer.username,
        role: customer.role,
        phone: customer.phone || '',
        address: customer.address || '',
        location: customer.location || '',
        pincode: customer.pincode || '',
        bio: customer.bio || '',
        profilePhoto: customer.profilePhoto || ''
      }
    });
  } catch (error) {
    console.error('[Auth][2FA] Verify error:', error);
    res.status(500).json({ message: 'Verification failed: ' + error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existing = await getAsync(`SELECT id FROM customers WHERE email = ? OR username = ?`, [email, username]);
    if (existing) {
      return res.status(409).json({ message: 'Email or username already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const customerId = `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    await runAsync(
      `INSERT INTO customers (id, name, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [customerId, name, email, username, hashedPassword, 'customer']
    );

    res.json({
      success: true,
      message: 'Registration successful',
      token: signToken({ id: customerId, name, email, role: 'customer' }),
      customer: { id: customerId, name, email, role: 'customer' }
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ===== BOOKING ROUTES =====
app.post('/api/bookings/book-design', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { customerId, designId, designName, cost } = req.body;
    const effectiveCustomerId = (req.user?.role === 'admin' && customerId) ? customerId : req.user?.sub;
    if (!effectiveCustomerId || !designId) {
      return res.status(400).json({ message: 'Customer ID and Design ID required' });
    }
    if (req.user?.role !== 'admin' && customerId && customerId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this customer' });
    }

    const canonicalDesign = await getCanonicalBookingDesignData(designId, { designName, cost });
    if (!canonicalDesign) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const bookingId = `book-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    await runAsync(
      `INSERT INTO bookings (id, customerId, designId, designName, designImage, price, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, effectiveCustomerId, canonicalDesign.designId, canonicalDesign.designName, canonicalDesign.designImage || '', canonicalDesign.price, canonicalDesign.cost, 'pending']
    );

    res.json({
      success: true,
      message: 'Design booked successfully',
      bookingId
    });
  } catch (error) {
    console.error('[Booking] Error:', error);
    res.status(500).json({ message: 'Booking failed' });
  }
});

// List bookings (optionally by customerId)
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { customerId, limit = 50, offset = 0, status, paymentStatus, dateFrom, dateTo, query, categoryId } = req.query;
    const statusGroup = req.query.statusGroup || req.query.statusgroup;
    const includeTotal = !(req.query.fast === '1' || req.query.includeTotal === 'false');
    let effectiveCustomerId = customerId;
    if (req.user?.role !== 'admin') {
      if (customerId && customerId !== req.user?.sub) {
        return res.status(403).json({ message: 'Not authorized for this customer' });
      }
      effectiveCustomerId = req.user?.sub;
    }

    const options = {
      limit: Math.min(parseInt(limit) || 50, 200), // Max 200 per page
      offset: Math.max(parseInt(offset) || 0, 0),
      status: status || undefined,
      statusGroup: statusGroup || undefined,
      paymentStatus: paymentStatus || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      query: query || undefined,
      categoryId: categoryId || undefined,
      includeTotal
    };

    const result = await listBookingsForApi(effectiveCustomerId, options);
    const normalizePaymentStatus = (status) => {
      const normalized = String(status || '').toLowerCase();
      if (normalized === 'paid' || normalized === 'success' || normalized === 'completed') return 'paid';
      if (normalized === 'failed' || normalized === 'error' || normalized === 'cancelled') return 'failed';
      return 'pending';
    };
    const bookings = (result.bookings || []).map((row) => ({
      ...row,
      paymentStatus: normalizePaymentStatus(row.paymentStatus)
    }));

    res.json({
      success: true,
      bookings,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: typeof result.hasMore === 'boolean' ? result.hasMore : (result.offset + result.limit) < result.total
      },
      summary: result.summary || null
    });
  } catch (error) {
    console.error('[Bookings] List error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Update booking status (admin)
app.post('/api/bookings/update', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { bookingId, status, paymentStatus } = req.body || {};
    if (!bookingId) return res.status(400).json({ message: 'bookingId required' });
    
    // Update booking status if provided
    if (status) {
      await setBookingStatus(bookingId, status);
    }

    // Update payment status if provided
    if (paymentStatus) {
      // Try to find existing payment for this booking
      const existingPayment = await getAsync('SELECT id FROM payments WHERE bookingId = ? ORDER BY createdAt DESC LIMIT 1', [bookingId]);
      if (existingPayment) {
        await runAsync('UPDATE payments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [paymentStatus, existingPayment.id]);
      } else {
        // Create a new payment record if none exists
        const paymentId = `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        await runAsync(
          'INSERT INTO payments (id, bookingId, status, amount, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [paymentId, bookingId, paymentStatus, 0] // Amount 0 as it's an admin override
        );
      }
    }

    // Double-check final state
    const updated = await getAsync('SELECT status FROM bookings WHERE id = ?', [bookingId]);
    res.json({ success: true, message: 'Booking updated', status: updated?.status });
  } catch (error) {
    console.error('[Bookings] Update error:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

app.post('/api/bookings/pay-and-book', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { customerId, designId, amount, designName, cost } = req.body;
    const effectiveCustomerId = req.user?.role === 'admin' ? customerId : req.user?.sub;
    if (!effectiveCustomerId || !designId) {
      return res.status(400).json({ message: 'Customer ID and Design ID required' });
    }
    if (req.user?.role !== 'admin' && customerId && customerId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this customer' });
    }

    const canonicalDesign = await getCanonicalBookingDesignData(designId, { designName, cost, amount });
    if (!canonicalDesign) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Create booking
    const bookingId = `book-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await runAsync(
      `INSERT INTO bookings (id, customerId, designId, designName, designImage, price, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, effectiveCustomerId, canonicalDesign.designId, canonicalDesign.designName, canonicalDesign.designImage || '', canonicalDesign.price, canonicalDesign.cost, 'pending']
    );

    // Create payment record
    const paymentId = `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await runAsync(
      `INSERT INTO payments (id, customerId, designId, bookingId, amount, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, effectiveCustomerId, canonicalDesign.designId, bookingId, canonicalDesign.amount, 'pending']
    );

    res.json({
      success: true,
      bookingId,
      paymentId,
      message: 'Ready to initiate payment'
    });
  } catch (error) {
    console.error('[Pay & Book] Error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// ===== RAZORPAY PAYMENT ROUTES =====
app.post('/api/payments/razorpay/create', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { customerId, designId, bookingId, amount } = req.body;
    const effectiveCustomerId = req.user?.role === 'admin' ? customerId : req.user?.sub;
    if (!effectiveCustomerId || !designId || !bookingId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (req.user?.role !== 'admin' && customerId && customerId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this customer' });
    }

    const booking = await getAsync(
      `SELECT id, customerId, status FROM bookings WHERE id = ?`,
      [bookingId]
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (req.user?.role !== 'admin' && booking.customerId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this booking' });
    }
    if (!isBookingApprovedForPayment(booking.status)) {
      return res.status(409).json({ message: 'Payment is allowed only after admin approval.' });
    }

    const order = await createOrder(amount, effectiveCustomerId, designId, bookingId);
    if (!order.success) {
      return res.status(400).json({
        success: false,
        message: order.error || 'Razorpay payment creation failed'
      });
    }

    // Save payment record
    const paymentId = `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await runAsync(
      `INSERT INTO payments (id, customerId, designId, bookingId, amount, razorpayOrderId, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, effectiveCustomerId, designId, bookingId, amount, order.orderId, 'pending']
    );

    res.json({
      success: true,
      orderId: order.orderId,
      keyId: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      paymentId
    });
  } catch (error) {
    console.error('[Razorpay] Create error:', error);
    res.status(500).json({ message: 'Payment creation failed' });
  }
});

app.post('/api/payments/razorpay/verify', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { paymentId, orderId, signature } = req.body;
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ message: 'Missing verification details' });
    }

    if (req.user?.role !== 'admin') {
      const paymentOwner = await getAsync(
        `SELECT customerId FROM payments WHERE razorpayOrderId = ?`,
        [orderId]
      );
      if (!paymentOwner || paymentOwner.customerId !== req.user?.sub) {
        return res.status(403).json({ message: 'Not authorized for this payment' });
      }
    }

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid payment signature' });
    }

    const paymentCompletedAt = new Date().toISOString();

    // Update payment and booking status
    await runAsync(
      `UPDATE payments SET razorpayPaymentId = ?, status = ?, method = ?, paymentDateTime = COALESCE(paymentDateTime, ?), updatedAt = CURRENT_TIMESTAMP WHERE razorpayOrderId = ?`,
      [paymentId, 'completed', 'razorpay', paymentCompletedAt, orderId]
    );

    const payment = await getAsync(
      `SELECT bookingId, customerId FROM payments WHERE razorpayOrderId = ?`,
      [orderId]
    );

    if (payment && payment.bookingId) {
      await runAsync(
        `UPDATE bookings SET status = ? WHERE id = ?`,
        ['confirmed', payment.bookingId]
      );
    }

    // Generate invoice after successful payment
    try {
      const invoiceDb = req.app.locals.db || getDb();
      const completedPayment = await getAsync(
        `SELECT id FROM payments WHERE razorpayOrderId = ? LIMIT 1`,
        [orderId]
      );
      if (completedPayment?.id && invoiceDb) {
        const invoiceResult = await ensureInvoiceForPaymentId(invoiceDb, completedPayment.id);
        console.log('[Invoice] Razorpay invoice sync:', invoiceResult.reason, '| paymentId:', completedPayment.id);
      }
    } catch (invoiceError) {
      console.warn('[Invoice] Generation error (non-critical):', invoiceError.message);
      // Don't fail payment if invoice generation fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('[Razorpay] Verify error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// GET all payments (admin) or filter by customerId/bookingId via query params
app.get('/api/payments', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { customerId, bookingId, limit = 200 } = req.query || {};
    const isAdmin = req.user?.role === 'admin';

    let sql = `
      SELECT p.*, b.designName, b.status as bookingStatus, c.name as customerName, c.email as customerEmail
      FROM payments p
      LEFT JOIN bookings b ON b.id = p.bookingId
      LEFT JOIN customers c ON c.id = p.customerId
      WHERE 1=1
    `;
    const params = [];

    if (customerId) {
      // Non-admin can only see their own payments
      if (!isAdmin && String(req.user?.sub || '') !== String(customerId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      sql += ` AND p.customerId = ?`;
      params.push(customerId);
    } else if (!isAdmin) {
      // Non-admin without customerId → show their own payments only
      sql += ` AND p.customerId = ?`;
      params.push(req.user?.sub || '');
    }

    if (bookingId) {
      sql += ` AND p.bookingId = ?`;
      params.push(bookingId);
    }

    sql += ` ORDER BY datetime(p.createdAt) DESC LIMIT ?`;
    params.push(Number(limit) || 200);

    const payments = await allAsync(sql, params);
    return res.json({ success: true, payments: payments || [] });
  } catch (error) {
    console.error('[Payments GET] Error:', error);
    return res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// GET payments for a specific customer (admin or self)
app.get('/api/payments/customer/:customerId', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { customerId } = req.params;
    const isAdmin = req.user?.role === 'admin';

    if (!isAdmin && String(req.user?.sub || '') !== String(customerId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const payments = await allAsync(
      `SELECT p.*, b.designName, b.status as bookingStatus, c.name as customerName, c.email as customerEmail
       FROM payments p
       LEFT JOIN bookings b ON b.id = p.bookingId
       LEFT JOIN customers c ON c.id = p.customerId
       WHERE p.customerId = ?
       ORDER BY datetime(p.createdAt) DESC
       LIMIT 500`,
      [customerId]
    );

    return res.json({ success: true, payments: payments || [] });
  } catch (error) {
    console.error('[Payments Customer GET] Error:', error);
    res.status(500).json({ message: 'Failed to fetch customer payments' });
  }
});

// Ensure there is an active pending payment row for a booking.
app.post('/api/payments/ensure', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { bookingId, amount, designId } = req.body || {};
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const booking = await getAsync(
      `SELECT id, customerId, designId, status, price, cost FROM bookings WHERE id = ?`,
      [bookingId]
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user?.role !== 'admin' && String(booking.customerId || '') !== String(req.user?.sub || '')) {
      return res.status(403).json({ message: 'Not authorized for this booking' });
    }

    if (String(booking.status || '').toLowerCase() === 'fulfilled') {
      return res.status(409).json({ message: 'Booking already fulfilled' });
    }

    const existingPending = await getAsync(
      `SELECT id, bookingId, status, amount
       FROM payments
       WHERE bookingId = ?
         AND lower(COALESCE(status, 'pending')) NOT IN ('completed', 'paid', 'success')
       ORDER BY datetime(updatedAt) DESC, datetime(createdAt) DESC, id DESC
       LIMIT 1`,
      [bookingId]
    );

    if (existingPending?.id) {
      return res.json({
        success: true,
        paymentId: existingPending.id,
        reused: true
      });
    }

    const parsedAmount = Number(amount);
    const resolvedAmount = Number.isFinite(parsedAmount) && parsedAmount > 0
      ? parsedAmount
      : Number(booking.price) > 0
        ? Number(booking.price)
        : Number(booking.cost) > 0
          ? Number(booking.cost)
          : 0;

    const newPaymentId = `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await runAsync(
      `INSERT INTO payments (id, customerId, designId, bookingId, amount, method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newPaymentId,
        booking.customerId,
        designId || booking.designId || null,
        booking.id,
        resolvedAmount,
        'card',
        'pending'
      ]
    );

    return res.json({ success: true, paymentId: newPaymentId, reused: false });
  } catch (error) {
    console.error('[Payments Ensure] Error:', error);
    return res.status(500).json({ message: 'Failed to ensure payment record' });
  }
});

// Fake card payment completion (test only)
app.post('/api/payments/fake/complete', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { bookingId, paymentId, cardNumber, cvv, name, amount, discountCode } = req.body || {};
    if (!bookingId || !paymentId || !cardNumber || !cvv || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const paymentRow = await getAsync(
      `SELECT p.id, p.customerId, p.bookingId, p.metadata, b.status as bookingStatus
       FROM payments p
       LEFT JOIN bookings b ON b.id = p.bookingId
       WHERE p.id = ?`,
      [paymentId]
    );
    if (!paymentRow) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (String(paymentRow.bookingId || '') !== String(bookingId)) {
      return res.status(400).json({ message: 'Payment does not belong to booking' });
    }

    // TEST_MODE bypass for smoke tests
    if (process.env.TEST_MODE === '1') {
      console.log('[FakePayment] TEST_MODE=1: Bypassing admin approval for payment.');
    } else {
      if (req.user?.role !== 'admin') {
        if (paymentRow.customerId !== req.user?.sub) {
          return res.status(403).json({ message: 'Not authorized for this payment' });
        }
      }
      if (!isBookingApprovedForPayment(paymentRow.bookingStatus)) {
        return res.status(409).json({ message: 'Payment is allowed only after admin approval.' });
      }
    }

    // Basic validation for fake card
    const cardClean = String(cardNumber).replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(cardClean) || !/^\d{3,4}$/.test(String(cvv))) {
      return res.status(400).json({ message: 'Invalid card details' });
    }

    const parsedAmount = Number(amount);
    const effectiveAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : null;
    let metadataPayload = null;
    if (discountCode) {
      let existingMeta = {};
      try {
        existingMeta = paymentRow.metadata ? JSON.parse(paymentRow.metadata) : {};
      } catch {
        existingMeta = {};
      }
      metadataPayload = JSON.stringify({ ...existingMeta, discountCode: String(discountCode).trim().toUpperCase() });
    }

    const paymentCompletedAt = new Date().toISOString();

    // Mark payment as completed and booking as confirmed. Persist discounted amount when supplied.
    await runAsync(
      `UPDATE payments
       SET status = ?,
           method = ?,
           amount = COALESCE(?, amount),
           metadata = COALESCE(?, metadata),
           paymentDateTime = COALESCE(paymentDateTime, ?),
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      ['completed', 'card', effectiveAmount, metadataPayload, paymentCompletedAt, paymentId]
    );
    await runAsync(
      `UPDATE bookings
       SET status = ?,
           price = COALESCE(price, ?),
           cost = COALESCE(?, cost)
       WHERE id = ?`,
      ['confirmed', effectiveAmount, effectiveAmount, bookingId]
    );

    // Generate invoice after successful payment
    try {
      const invoiceDb = req.app.locals.db || getDb();
      if (invoiceDb) {
        const invoiceResult = await ensureInvoiceForPaymentId(invoiceDb, paymentId);
        console.log('[Invoice] Fake payment invoice sync:', invoiceResult.reason, '| paymentId:', paymentId);
      }
    } catch (invoiceError) {
      console.warn('[Invoice] Generation error (non-critical):', invoiceError.message);
      // Don't fail payment if invoice generation fails
    }

    res.json({ success: true, message: 'Payment completed (fake)' });
  } catch (error) {
    console.error('[FakePayment] Error:', error);
    res.status(500).json({ message: 'Fake payment failed' });
  }
});

// ===== BACKGROUND IMAGE ROUTES =====
app.get('/api/background-images', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const images = await allAsync(`SELECT * FROM backgroundImages ORDER BY createdAt DESC`);
    res.json({ success: true, images: images || [] });
  } catch (error) {
    console.error('[BG Images] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch background images' });
  }
});

app.post('/api/background-images', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL required' });
    }

    const id = `bg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await runAsync(
      `INSERT INTO backgroundImages (id, name, url) VALUES (?, ?, ?)`,
      [id, name, url]
    );

    res.json({ success: true, message: 'Background image added', id });
  } catch (error) {
    console.error('[BG Images] Add error:', error);
    res.status(500).json({ message: 'Failed to add background image' });
  }
});

app.delete('/api/background-images/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { id } = req.params;
    await runAsync(`DELETE FROM backgroundImages WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Background image deleted' });
  } catch (error) {
    console.error('[BG Images] Delete error:', error);
    res.status(500).json({ message: 'Failed to delete background image' });
  }
});

// ===== EXISTING ROUTES =====
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend server is running', timestamp: new Date().toISOString() });
});

// Root endpoint - serve frontend from dist folder
app.get('*', (req, res, next) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return next();
  }
  const distPath = path.join(__dirname, '..', 'dist', 'index.html');
  if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }
  res.status(404).send('Frontend build not found. Please run "npm run build" first.');
});

// List customers (for admin). In local test mode we allow read access without token
// so admin UI can hydrate full customer lists even when running with local-only sessions.
app.get('/api/customers', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const isLocalTestMode = process.env.TEST_MODE === '1' && process.env.NODE_ENV !== 'production';
    if (!isLocalTestMode) {
      const header = req.headers.authorization || '';
      if (!header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization required' });
      }

      const token = header.slice('Bearer '.length).trim();
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      if (!payload || payload.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
    }

    const rows = await allAsync(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.username,
        c.role,
        c.phone,
        c.address,
        c.location,
        c.pincode,
        c.bio,
        c.profilePhoto,
        c.createdAt,
        COALESCE(l.likesCount, 0) as likesCount,
        COALESCE(f.feedbacksCount, 0) as feedbacksCount,
        COALESCE(b.bookingsCount, 0) as bookingsCount,
        COALESCE(p.paymentsCount, 0) as paymentsCount
      FROM customers c
      LEFT JOIN (
        SELECT customerId, COUNT(*) as likesCount
        FROM likes
        WHERE COALESCE(value, 'like') = 'like'
        GROUP BY customerId
      ) l ON l.customerId = c.id
      LEFT JOIN (
        SELECT customerId, COUNT(*) as feedbacksCount
        FROM feedbacks
        GROUP BY customerId
      ) f ON f.customerId = c.id
      LEFT JOIN (
        SELECT customerId, COUNT(*) as bookingsCount
        FROM bookings
        GROUP BY customerId
      ) b ON b.customerId = c.id
      LEFT JOIN (
        SELECT customerId, COUNT(*) as paymentsCount
        FROM payments
        GROUP BY customerId
      ) p ON p.customerId = c.id
      ORDER BY datetime(c.createdAt) DESC
    `);
    res.json({ success: true, customers: rows || [] });
  } catch (error) {
    console.error('[Customers] List error:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

app.put('/api/customers/:customerId', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { customerId } = req.params;
    if (req.user?.role !== 'admin' && customerId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this customer' });
    }

    const current = await getAsync(
      `SELECT id, name, email, phone, address, location, pincode, bio, profilePhoto FROM customers WHERE id = ?`,
      [customerId]
    );
    if (!current) return res.status(404).json({ message: 'Customer not found' });

    const next = {
      name: String(req.body?.name || current.name || '').trim() || current.name,
      email: String(req.body?.email || current.email || '').trim() || current.email,
      phone: String(req.body?.phone ?? current.phone ?? '').trim(),
      address: String(req.body?.address ?? current.address ?? '').trim(),
      location: String(req.body?.location ?? current.location ?? '').trim(),
      pincode: String(req.body?.pincode ?? current.pincode ?? '').trim(),
      bio: String(req.body?.bio ?? current.bio ?? '').trim(),
      profilePhoto: String(req.body?.profilePhoto ?? current.profilePhoto ?? '').trim()
    };

    await runAsync(
      `UPDATE customers
       SET name = ?, email = ?, phone = ?, address = ?, location = ?, pincode = ?, bio = ?, profilePhoto = ?
       WHERE id = ?`,
      [next.name, next.email, next.phone, next.address, next.location, next.pincode, next.bio, next.profilePhoto, customerId]
    );

    const updated = await getAsync(
      `SELECT id, name, email, username, role, phone, address, location, pincode, bio, profilePhoto, createdAt FROM customers WHERE id = ?`,
      [customerId]
    );
    res.json({ success: true, customer: updated });
  } catch (error) {
    console.error('[Customers] Update error:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// Get all designs with optional category filter
app.get('/api/designs', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { categoryId } = req.query;

    let query = `
      SELECT d.id, d.title, d.description, d.categoryId, d.previewImage, d.modelUrl, d.price, d.cost,
             COALESCE(NULLIF(d.price, 0), NULLIF(d.cost, 0), 0) as amount,
             d.motion3d, d.availabilityStatus, d.status, d.createdAt,
             c.id as category_id, c.title as category_title
      FROM designs d
      LEFT JOIN categories c ON d.categoryId = c.id
      WHERE d.status = 'active'
    `;

    const queryParams = [];
    if (categoryId && categoryId !== 'all') {
      query += ` AND d.categoryId = ?`;
      queryParams.push(categoryId);
    }

    query += ` ORDER BY d.createdAt DESC`;

    const rows = await allAsync(query, queryParams);
    const metadata = readCategoryMetadata();

    const designs = (rows || []).map((row) => {
      const categoryOriginalTitle = row.category_title || row.category || '';
      const categoryFolder = resolveCategoryFolderName(categoryOriginalTitle || row.categoryId || row.category_id);
      const categoryKey = normalizeCategoryKey(categoryFolder || categoryOriginalTitle || row.categoryId || row.category_id);
      const categoryMeta = getCategoryMetadataEntry(metadata, categoryFolder || categoryOriginalTitle || categoryKey);
      const imageNames = categoryMeta.imageNames || {};
      const categoryFiles = getCategoryImageFilenames(categoryFolder);

      // Determine if there is a custom name for this image
      let finalTitle = row.title;
      if (row.previewImage) {
        const filename = decodeURIComponent(String(row.previewImage).split('?')[0].split('#')[0]).split('/').pop();
        if (filename) {
          const overwritingName = imageNames[filename];
          if (overwritingName && categoryFiles.has(filename)) {
            finalTitle = overwritingName;
          }
        }
      }

      const normalizedCategoryKey = categoryOriginalTitle
        ? normalizeCategoryKey(categoryOriginalTitle)
        : normalizeCategoryKey(String(row.categoryId || row.category_id || ''));
      const normalizedCategoryId = normalizedCategoryKey ? `cat-${normalizedCategoryKey}` : String(row.categoryId || row.category_id || '');

      return {
        ...row,
        price: resolveDesignAmount(row.price, row.cost, row.amount),
        cost: resolveDesignAmount(row.cost, row.price, row.amount),
        amount: resolveDesignAmount(row.amount, row.price, row.cost),
        title: finalTitle,
        motion3d: Number(row.motion3d || 0) === 1,
        category: categoryOriginalTitle,
        categoryId: normalizedCategoryId
      };
    });
    res.json({ success: true, designs });
  } catch (error) {
    console.error('[Designs] List error:', error);
    res.status(500).json({ message: 'Failed to fetch designs' });
  }
});

// Create a new design
app.post('/api/designs', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { title, description, categoryId, price, cost, previewImage, modelUrl, style } = req.body;

    if (!title || !categoryId) {
      return res.status(400).json({ message: 'Title and category required' });
    }

    const designId = `design-${Date.now()}`;
    const now = new Date().toISOString();
    const resolvedCategoryId = await resolveCategoryId(categoryId) || categoryId;

    // Distinguish between Selling Price and Internal Cost
    const finalPrice = parseAmountValue(price);
    const finalCost = parseAmountValue(cost);

    const result = await runAsync(
      `INSERT INTO designs (id, title, description, categoryId, price, cost, previewImage, modelUrl, motion3d, availabilityStatus, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [designId, title, description || '', resolvedCategoryId, finalPrice, finalCost, previewImage || '', modelUrl || '', 1, 'available', 'active', now]
    );

    console.log(`[Designs] Created ${designId}`);
    res.json({ success: true, designId, message: 'Design created' });
  } catch (error) {
    console.error('[Designs] Create error:', error);
    res.status(500).json({ message: 'Failed to create design' });
  }
});

// Update design
app.put('/api/designs/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { id } = req.params;
    const { title, description, price, cost, previewImage, modelUrl, categoryId, status, motion3d } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(parseAmountValue(price));
    }
    if (cost !== undefined) {
      updates.push('cost = ?');
      values.push(parseAmountValue(cost));
    }
    if (previewImage !== undefined) {
      updates.push('previewImage = ?');
      values.push(previewImage);
    }
    if (modelUrl !== undefined) {
      updates.push('modelUrl = ?');
      values.push(modelUrl);
    }
    if (categoryId !== undefined) {
      const resolvedCategoryId = await resolveCategoryId(categoryId) || categoryId;
      updates.push('categoryId = ?');
      values.push(resolvedCategoryId);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (motion3d !== undefined) {
      updates.push('motion3d = ?');
      values.push(motion3d ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);

    const query = `UPDATE designs SET ${updates.join(', ')} WHERE id = ?`;

    const result = await runAsync(query, values);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Design not found' });
    }

    console.log(`[Designs] Updated ${id}`);
    res.json({ success: true, message: 'Design updated' });
  } catch (error) {
    console.error('[Designs] Update error:', error);
    res.status(500).json({ message: 'Failed to update design' });
  }
});

// Delete design
app.delete('/api/designs/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { id } = req.params;

    const result = await runAsync(
      'UPDATE designs SET status = ? WHERE id = ?',
      ['inactive', id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Design not found' });
    }

    console.log(`[Designs] Soft-deleted ${id}`);
    res.json({ success: true, message: 'Design deleted' });
  } catch (error) {
    console.error('[Designs] Delete error:', error);
    res.status(500).json({ message: 'Failed to delete design' });
  }
});

// ===== PACKAGE ROUTES =====
app.get('/api/packages', async (req, res) => {
  try {
    const packageDb = await getDB();
    const { bhk, type } = req.query || {};
    const filters = [];
    const params = [];

    if (type && String(type).trim()) {
      filters.push('LOWER(type) = LOWER(?)');
      params.push(String(type).trim());
    }

    if (bhk && Number.isFinite(Number(bhk))) {
      filters.push('bhk = ?');
      params.push(Number(bhk));
    }

    const whereClause = filters.length > 0 ? ` WHERE ${filters.join(' AND ')}` : '';
    const rows = await packageDb.all(
      `SELECT * FROM packages${whereClause} ORDER BY bhk ASC, type ASC`,
      params
    );
    const packages = (rows || []).map(row => {
      const normalizedRow = normalizePackageLabelsByType(row || {});
      return {
        ...normalizedRow,
        features: row.features ? JSON.parse(row.features) : [],
        rooms: normalizePackageRooms(row.rooms ? JSON.parse(row.rooms) : [], row.id)
      };
    });
    res.json({ success: true, data: packages, packages });
  } catch (error) {
    console.error('[Packages] List error:', error);
    res.status(500).json({ message: 'Failed to fetch packages' });
  }
});

app.get('/api/packages/:id/designs', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { id } = req.params;
    const rows = await allAsync(`SELECT * FROM package_designs WHERE packageId = ?`, [id]);
    res.json({ success: true, designs: rows || [] });
  } catch (error) {
    console.error('[Package Designs] List error:', error);
    res.status(500).json({ message: 'Failed to fetch package designs' });
  }
});

app.get('/api/company', (req, res) => {
  res.json(COMPANY_DATA);
});

// ===== PORTFOLIO CONTENT ROUTES =====
app.get('/api/portfolio-content', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const row = await getAsync(`SELECT * FROM portfolio_content WHERE id = ?`, ['default']);
    if (!row) return res.json({ content: null });
    res.json({
      content: {
        aboutTitle: row.aboutTitle || '',
        aboutBody: row.aboutBody || '',
        worksTitle: row.worksTitle || '',
        worksBody: row.worksBody || '',
        services: row.services ? JSON.parse(row.services) : [],
        founder: row.founder ? JSON.parse(row.founder) : { name: '', role: '', bio: '', photo: '' },
        coFounder: row.coFounder ? JSON.parse(row.coFounder) : { name: '', role: '', bio: '', photo: '' },
        designers: row.designers ? JSON.parse(row.designers) : [],
        feedbackVideos: row.feedbackVideos ? JSON.parse(row.feedbackVideos) : []
      }
    });
  } catch (error) {
    console.error('[Portfolio] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio content' });
  }
});

app.put('/api/portfolio-content', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const content = req.body?.content || {};
    const payload = {
      aboutTitle: String(content.aboutTitle || ''),
      aboutBody: String(content.aboutBody || ''),
      worksTitle: String(content.worksTitle || ''),
      worksBody: String(content.worksBody || ''),
      services: JSON.stringify(content.services || []),
      founder: JSON.stringify(content.founder || { name: '', role: '', bio: '', photo: '' }),
      coFounder: JSON.stringify(content.coFounder || { name: '', role: '', bio: '', photo: '' }),
      designers: JSON.stringify(content.designers || []),
      feedbackVideos: JSON.stringify(content.feedbackVideos || [])
    };

    const existing = await getAsync(`SELECT id FROM portfolio_content WHERE id = ?`, ['default']);
    if (existing) {
      await runAsync(
        `UPDATE portfolio_content SET aboutTitle = ?, aboutBody = ?, worksTitle = ?, worksBody = ?, services = ?, founder = ?, coFounder = ?, designers = ?, feedbackVideos = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [
          payload.aboutTitle,
          payload.aboutBody,
          payload.worksTitle,
          payload.worksBody,
          payload.services,
          payload.founder,
          payload.coFounder,
          payload.designers,
          payload.feedbackVideos,
          'default'
        ]
      );
    } else {
      await runAsync(
        `INSERT INTO portfolio_content (id, aboutTitle, aboutBody, worksTitle, worksBody, services, founder, coFounder, designers, feedbackVideos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'default',
          payload.aboutTitle,
          payload.aboutBody,
          payload.worksTitle,
          payload.worksBody,
          payload.services,
          payload.founder,
          payload.coFounder,
          payload.designers,
          payload.feedbackVideos
        ]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Portfolio] Update error:', error);
    res.status(500).json({ message: 'Failed to update portfolio content' });
  }
});

// Create PhonePe payment
app.post('/api/payments/phonepe/create', authenticate, async (req, res) => {
  try {
    const { bookingId, paymentId, userId, amount } = req.body || {};
    const { merchantId, saltKey, saltIndex, environment, redirectBase, callbackBase } = getPhonePeConfig();

    console.log('[PhonePe Create] Request:', { bookingId, paymentId, userId, amount });

    if (!merchantId || !saltKey || !saltIndex) {
      console.error('[PhonePe Create] Missing credentials');
      return res.status(400).json({ message: 'PhonePe credentials are missing. Update .env.local.' });
    }

    if (!bookingId || !paymentId || !userId || !amount) {
      console.error('[PhonePe Create] Missing required fields:', { bookingId, paymentId, userId, amount });
      return res.status(400).json({ message: 'Missing booking or payment details.' });
    }

    if (req.user?.role !== 'admin' && userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this user' });
    }

    const paymentRecord = await getAsync(
      `SELECT p.id, p.customerId, p.bookingId, b.status as bookingStatus
       FROM payments p
       LEFT JOIN bookings b ON b.id = p.bookingId
       WHERE p.id = ?`,
      [paymentId]
    );
    if (!paymentRecord) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (String(paymentRecord.bookingId || '') !== String(bookingId || '')) {
      return res.status(400).json({ message: 'Payment does not belong to booking.' });
    }
    if (req.user?.role !== 'admin' && paymentRecord.customerId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this payment' });
    }
    if (!isBookingApprovedForPayment(paymentRecord.bookingStatus)) {
      return res.status(409).json({ message: 'Payment is allowed only after admin approval.' });
    }

    // Use the database paymentId as the merchantTransactionId for easy mapping
    const merchantTransactionId = paymentId;

    // Update payment method to 'phonepe' in database
    await runAsync(`UPDATE payments SET method = ? WHERE id = ?`, ['phonepe', paymentId]);

    const payload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: userId,
      amount: Math.round(Number(amount) * 100),
      redirectUrl: `${redirectBase}?bookingId=${encodeURIComponent(bookingId)}&paymentId=${encodeURIComponent(paymentId)}&txn=${encodeURIComponent(merchantTransactionId)}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${callbackBase}?bookingId=${encodeURIComponent(bookingId)}&paymentId=${encodeURIComponent(paymentId)}&txn=${encodeURIComponent(merchantTransactionId)}`,
      paymentInstrument: { type: 'PAY_PAGE' }
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const apiPath = '/pg/v1/pay';
    const checksum = buildChecksum(payloadBase64, apiPath, saltKey, saltIndex);
    const url = `${getPhonePeBaseUrl(environment)}${apiPath}`;

    console.log('[PhonePe Create] Sending request to:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({ request: payloadBase64 }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    console.log('[PhonePe Create] Response:', data);

    const redirectUrl = data?.data?.instrumentResponse?.redirectInfo?.url;

    if (!redirectUrl) {
      console.error('[PhonePe Create] No redirect URL in response');
      return res.status(400).json({ message: data?.message || 'Unable to create PhonePe payment.' });
    }

    console.log('[PhonePe Create] Success:', { merchantTransactionId, redirectUrl });
    return res.json({ redirectUrl, merchantTransactionId });
  } catch (error) {
    console.error('[PhonePe Create] Error:', error);
    return res.status(500).json({ message: 'Payment initiation failed.' });
  }
});

// Check PhonePe payment status
const syncPaymentSuccess = async (paymentId, code = '', state = '') => {
  if (!paymentId) return { success: false, reason: 'missing_payment_id' };
  
  const statusToSave = 'completed';
  const paymentCompletedAt = new Date().toISOString();
  console.log(`[Payment Sync] Synchronizing payment ${paymentId} (code: ${code}, state: ${state})`);

  try {
    // 1. Update the payment record
    await runAsync(
      `UPDATE payments SET status = ?, paymentDateTime = COALESCE(paymentDateTime, ?), updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [statusToSave, paymentCompletedAt, paymentId]
    );

    // 2. Find the linked booking and payment amount
    const payment = await getAsync(`SELECT bookingId, amount FROM payments WHERE id = ?`, [paymentId]);

    if (payment && payment.bookingId) {
      const bookingStatus = 'confirmed';
      await runAsync(
        `UPDATE bookings
         SET status = ?,
             price = COALESCE(price, ?),
             cost = COALESCE(?, cost)
         WHERE id = ?`,
        [bookingStatus, payment.amount, payment.amount, payment.bookingId]
      );
      console.log(`[Payment Sync] Updated booking ${payment.bookingId} to ${bookingStatus}`);
    }

    // 3. Generate invoice
    try {
      const invoiceDb = getDb();
      if (invoiceDb) {
        const invoiceResult = await ensureInvoiceForPaymentId(invoiceDb, paymentId);
        console.log('[Invoice Sync] Invoice result:', invoiceResult.reason, '| paymentId:', paymentId);
      }
    } catch (invoiceError) {
      console.warn('[Invoice Sync] Generation warning:', invoiceError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('[Payment Sync] Error:', error);
    return { success: false, error: error.message };
  }
};

app.post('/api/payments/phonepe/status', authenticate, async (req, res) => {
  try {
    const { merchantTransactionId } = req.body || {};
    const { merchantId, saltKey, saltIndex, environment } = getPhonePeConfig();

    console.log('[PhonePe Status] Request:', { merchantTransactionId });

    if (!merchantId || !saltKey || !saltIndex) {
      console.error('[PhonePe Status] Missing credentials');
      return res.status(400).json({ message: 'PhonePe credentials are missing. Update .env.local.' });
    }

    if (!merchantTransactionId) {
      return res.status(400).json({ message: 'Missing transaction id.' });
    }

    const apiPath = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const checksum = buildChecksum('', apiPath, saltKey, saltIndex);
    const url = `${getPhonePeBaseUrl(environment)}${apiPath}`;

    console.log('[PhonePe Status] Checking status at:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    console.log('[PhonePe Status] Response:', data);

    const isSuccess = data?.data?.state === 'COMPLETED';
    const status = isSuccess ? 'success' : data?.data?.state === 'FAILED' ? 'failed' : 'pending';
    
    console.log('[PhonePe Status] Status:', status);

    // PERSIST SUCCESS: If payment is completed, sync DB and generate invoice immediately
    if (isSuccess) {
      console.log('[PhonePe Status] Auto-syncing successful payment...');
      await syncPaymentSuccess(merchantTransactionId, data.code, data.data.state);
    }

    return res.json({ success: true, status });
  } catch (error) {
    console.error('[PhonePe Status] Error:', error);
    return res.status(500).json({ message: 'Payment verification failed.' });
  }
});

app.post('/api/payments/update', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { paymentId, status, metadata, method, amount } = req.body || {};
    if (!paymentId) return res.status(400).json({ message: 'paymentId required' });
    if (req.user?.role !== 'admin') {
      const payment = await getAsync(`SELECT customerId FROM payments WHERE id = ?`, [paymentId]);
      if (!payment || payment.customerId !== req.user?.sub) {
        return res.status(403).json({ message: 'Not authorized for this payment' });
      }
    }
    const normalizedPaymentStatus = String(status || '').toLowerCase();
    const isCompletingPayment = normalizedPaymentStatus === 'success'
      || normalizedPaymentStatus === 'completed'
      || normalizedPaymentStatus === 'paid';

    if (isCompletingPayment) {
      const paymentWithBooking = await getAsync(
        `SELECT p.id, b.status as bookingStatus
         FROM payments p
         LEFT JOIN bookings b ON b.id = p.bookingId
         WHERE p.id = ?`,
        [paymentId]
      );
      if (!paymentWithBooking) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      if (!isBookingApprovedForPayment(paymentWithBooking.bookingStatus)) {
        return res.status(409).json({ message: 'Payment is allowed only after admin approval.' });
      }
    }

    const metadataText = metadata ? JSON.stringify(metadata) : null;
    const parsedAmount = Number(amount);
    const amountValue = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : null;
    const paymentCompletedAt = isCompletingPayment ? new Date().toISOString() : null;
    await runAsync(
      `UPDATE payments
       SET status = COALESCE(?, status),
           method = COALESCE(?, method),
           metadata = COALESCE(?, metadata),
           amount = COALESCE(?, amount),
           paymentDateTime = COALESCE(?, paymentDateTime),
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status || null, method || null, metadataText, amountValue, paymentCompletedAt, paymentId]
    );

    let bookingStatus = null;
    if (normalizedPaymentStatus === 'success' || normalizedPaymentStatus === 'completed' || normalizedPaymentStatus === 'paid') {
      bookingStatus = 'confirmed';
    } else if (normalizedPaymentStatus === 'failed' || normalizedPaymentStatus === 'error' || normalizedPaymentStatus === 'cancelled') {
      bookingStatus = 'cancelled';
    } else if (normalizedPaymentStatus === 'pending') {
      bookingStatus = 'pending';
    }

    if (bookingStatus) {
      await runAsync(
        `UPDATE bookings
         SET status = ?,
             price = COALESCE(price, ?),
             cost = COALESCE(?, cost)
         WHERE id = (SELECT bookingId FROM payments WHERE id = ?)
           AND status != 'fulfilled'`,
        [bookingStatus, amountValue, amountValue, paymentId]
      );
    }

    if (isCompletingPayment) {
      try {
        const invoiceDb = req.app.locals.db || getDb();
        if (invoiceDb) {
          const invoiceResult = await ensureInvoiceForPaymentId(invoiceDb, paymentId);
          console.log('[Invoice] Payment update invoice sync:', invoiceResult.reason, '| paymentId:', paymentId);
        }
      } catch (invoiceError) {
        console.warn('[Invoice] Payment update invoice generation warning:', invoiceError.message);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Payments] Update error:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
});

// Payment callback
app.post('/api/payments/phonepe/callback', async (req, res) => {
  console.log('[PhonePe Callback] Received callback:', req.body);
  try {
    if (req.body && req.body.response) {
      const decodedStr = Buffer.from(req.body.response, 'base64').toString('utf8');
      const decoded = JSON.parse(decodedStr);
      console.log('[PhonePe Callback] Decoded payload:', decoded);

      if (decoded && decoded.data && decoded.data.merchantTransactionId) {
        const paymentId = decoded.data.merchantTransactionId;
        const code = decoded.code;
        const state = decoded.data.state;

        if (code === 'PAYMENT_SUCCESS' || state === 'COMPLETED') {
          await syncPaymentSuccess(paymentId, code, state);
          console.log(`[PhonePe Callback] Successfully processed success for ${paymentId}`);
        } else if (code === 'PAYMENT_ERROR' || state === 'FAILED') {
          // Failure handling
          await runAsync(
            `UPDATE payments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            ['failed', paymentId]
          );
          const payment = await getAsync(`SELECT bookingId FROM payments WHERE id = ?`, [paymentId]);
          if (payment?.bookingId) {
            await runAsync(`UPDATE bookings SET status = ? WHERE id = ?`, ['cancelled', payment.bookingId]);
          }
          console.log(`[PhonePe Callback] Successfully processed failure for ${paymentId}`);
        }
      }
    }
  } catch (error) {
    console.error('[PhonePe Callback] Error processing payload:', error);
  }
  res.json({ ok: true });
});

// ===== FEEDBACK ROUTES =====
app.post('/api/feedbacks', maybeAuthenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { userId, userName, designId, rating, comment } = req.body;
    const effectiveUserId = req.user ? (req.user.role === 'admin' ? userId : req.user.sub) : 'guest';
    const effectiveUserName = userName || (req.user ? req.user.name : 'Guest');

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const id = `fb-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await runAsync(
      `INSERT INTO feedbacks (id, customerId, userName, designId, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, effectiveUserId, effectiveUserName, designId || null, rating, comment]
    );

    res.json({ success: true, message: 'Feedback saved', id });
  } catch (error) {
    console.error('[Feedbacks] Create error:', error);
    res.status(500).json({ message: 'Failed to save feedback' });
  }
});

app.get('/api/feedbacks/public', async (_req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const records = await allAsync(
      `SELECT f.*, c.name as customerName
       FROM feedbacks f
       LEFT JOIN customers c ON c.id = f.customerId
       ORDER BY f.createdAt DESC
       LIMIT 200`
    );

    res.json({ success: true, feedbacks: records || [] });
  } catch (error) {
    console.error('[Feedbacks] Public get error:', error);
    res.status(500).json({ message: 'Failed to fetch public feedbacks' });
  }
});

app.get('/api/feedbacks', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const userId = req.query.userId;
    if (!userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    if (userId && req.user?.role !== 'admin' && userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this user' });
    }
    let query = `
      SELECT f.*, c.name as customerName
      FROM feedbacks f
      LEFT JOIN customers c ON c.id = f.customerId
      ORDER BY f.createdAt DESC
    `;
    let params = [];

    if (userId) {
      query = `
        SELECT f.*, c.name as customerName
        FROM feedbacks f
        LEFT JOIN customers c ON c.id = f.customerId
        WHERE f.customerId = ?
        ORDER BY f.createdAt DESC
      `;
      params = [userId];
    }

    const records = await allAsync(query, params);
    res.json({ success: true, feedbacks: records || [] });
  } catch (error) {
    console.error('[Feedbacks] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch feedbacks' });
  }
});

// ===== CHATBOT HISTORY ROUTES =====
app.post('/api/chatbot/history', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const customerId = req.user?.sub || null;
    if (!customerId) return res.status(401).json({ message: 'Authorization required' });

    const { query, response, userType, userName } = req.body || {};
    const normalizedQuery = String(query || '').trim();
    const normalizedResponse = String(response || '').trim();

    if (!normalizedQuery || !normalizedResponse) {
      return res.status(400).json({ message: 'query and response are required' });
    }

    const id = `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const normalizedType = String(userType || 'registered').trim() || 'registered';
    const normalizedName = String(userName || req.user?.name || 'Customer').trim() || 'Customer';

    await runAsync(
      `INSERT INTO chatbot_logs (id, customerId, userType, userName, query, response) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, customerId, normalizedType, normalizedName, normalizedQuery, normalizedResponse]
    );

    return res.json({ success: true, id });
  } catch (error) {
    console.error('[Chatbot History] Create error:', error);
    return res.status(500).json({ message: 'Failed to save chatbot history' });
  }
});

app.get('/api/chatbot/history', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const isAdmin = req.user?.role === 'admin';
    const requestedUserId = String(req.query.userId || '').trim();
    const effectiveUserId = isAdmin
      ? (requestedUserId || '')
      : String(req.user?.sub || '');

    let query = `
      SELECT l.id, l.customerId, l.userType, l.userName, l.query, l.response, l.createdAt,
             c.name as customerName, c.email as customerEmail
      FROM chatbot_logs l
      LEFT JOIN customers c ON c.id = l.customerId
      ORDER BY l.createdAt DESC
      LIMIT 500
    `;
    let params = [];

    if (effectiveUserId) {
      query = `
        SELECT l.id, l.customerId, l.userType, l.userName, l.query, l.response, l.createdAt,
               c.name as customerName, c.email as customerEmail
        FROM chatbot_logs l
        LEFT JOIN customers c ON c.id = l.customerId
        WHERE l.customerId = ?
        ORDER BY l.createdAt DESC
        LIMIT 500
      `;
      params = [effectiveUserId];
    }

    const rows = await allAsync(query, params);
    const records = (rows || []).map((row) => ({
      id: row.id,
      customerId: row.customerId,
      userType: row.userType || (row.customerId ? 'registered' : 'newGuest'),
      userName: row.customerName || row.userName || 'Customer',
      customerEmail: row.customerEmail || '',
      query: row.query,
      response: row.response,
      createdAt: row.createdAt
    }));

    return res.json({ success: true, history: records });
  } catch (error) {
    console.error('[Chatbot History] Fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch chatbot history' });
  }
});

// ===== LIKES/FAVORITES ROUTES =====
app.post('/api/likes', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { userId, designId } = req.body;
    const effectiveUserId = req.user?.role === 'admin' ? userId : req.user?.sub;
    if (!effectiveUserId || !designId) {
      return res.status(400).json({ message: 'Missing userId or designId' });
    }
    if (req.user?.role !== 'admin' && userId && userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this user' });
    }

    // Check if already liked
    const existing = await getAsync(
      `SELECT id FROM likes WHERE customerId = ? AND designId = ?`,
      [effectiveUserId, designId]
    );

    if (existing) {
      // Unlike
      await runAsync(`DELETE FROM likes WHERE customerId = ? AND designId = ?`, [effectiveUserId, designId]);
      res.json({ success: true, liked: false });
    } else {
      // Like
      const id = `like-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      await runAsync(
        `INSERT INTO likes (id, customerId, designId) VALUES (?, ?, ?)`,
        [id, effectiveUserId, designId]
      );
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('[Likes] Create error:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

app.get('/api/likes', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const userId = req.query.userId;
    if (!userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    if (userId && req.user?.role !== 'admin' && userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this user' });
    }
    let query = `SELECT * FROM likes`;
    let params = [];

    if (userId) {
      query = `SELECT * FROM likes WHERE customerId = ?`;
      params = [userId];
    }

    const records = await allAsync(query, params);
    res.json({ success: true, likes: records || [] });
  } catch (error) {
    console.error('[Likes] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch likes' });
  }
});

// ===== USER DETAILS ROUTE =====
app.get('/api/user-details/:userId', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { userId } = req.params;
    if (req.user?.role !== 'admin' && userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this user' });
    }

    // Get user
    const user = await getAsync(
      `SELECT id, name, email, username, role, phone, address, location, pincode, bio, profilePhoto, createdAt FROM customers WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's bookings
    const bookings = await allAsync(
      `SELECT * FROM bookings WHERE customerId = ? ORDER BY bookingDate DESC`,
      [userId]
    );

    // Get user's payments
    const payments = await allAsync(
      `SELECT * FROM payments WHERE customerId = ? ORDER BY createdAt DESC`,
      [userId]
    );

    // Get user's feedbacks
    const feedbacks = await allAsync(
      `SELECT * FROM feedbacks WHERE customerId = ? ORDER BY createdAt DESC`,
      [userId]
    );

    // Get user's likes
    const likes = await allAsync(
      `SELECT * FROM likes WHERE customerId = ? ORDER BY createdAt DESC`,
      [userId]
    );

    res.json({
      success: true,
      user,
      bookings: bookings || [],
      payments: payments || [],
      feedbacks: feedbacks || [],
      likes: likes || []
    });
  } catch (error) {
    console.error('[User Details] Error:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// ===== Design Studio ROUTES =====
app.post('/api/ai/designs', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { originalImage, prompt, roomType, count, variants: providedVariants } = req.body || {};
    const hasProvidedVariants = Array.isArray(providedVariants) && providedVariants.length > 0;
    if (!originalImage && !hasProvidedVariants) {
      return res.status(400).json({ message: 'Original image or generated variants required' });
    }

    const fallbackOriginalImage = hasProvidedVariants
      ? String(providedVariants.find((variant) => String(variant?.image || '').trim())?.image || '')
      : '';
    const imageValue = String(originalImage || fallbackOriginalImage);

    let variants = [];
    if (hasProvidedVariants) {
      variants = providedVariants.map((variant, index) => ({
        ...variant,
        id: variant?.id || `variant-${Date.now()}-${index}`,
        roomType: variant?.roomType || roomType || '',
        categoryName: variant?.categoryName || roomType || 'Design Studio'
      }));
    } else {
      const [prefix, dataPart] = imageValue.split(',');
      const mimeMatch = prefix ? prefix.match(/data:(.*?);base64/) : null;
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64 = dataPart || '';
      if (!base64) {
        return res.status(400).json({ message: 'Invalid image data' });
      }

      const generated = await generateDesignVariants({ imageBase64: base64, mimeType, prompt, count });
      if (!Array.isArray(generated) || generated.length === 0) {
        return res.status(500).json({ message: 'Failed to generate designs' });
      }

       variants = generated.map((variant, index) => ({
         id: `variant-${Date.now()}-${index}`,
         title: variant.title,
         description: variant.description,
         styleTag: variant.styleTag,
         price: variant.price,
         roomType: roomType || '',
         categoryName: roomType || 'Design Studio',
         image: variant.imageBase64.startsWith('data:') ? variant.imageBase64 : `data:image/svg+xml;base64,${variant.imageBase64}`
       }));
    }

    const id = `Smart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await runAsync(
      `INSERT INTO ai_designs (id, customerId, originalImage, variants, status) VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.sub, imageValue, JSON.stringify(variants), 'draft']
    );

    res.json({
      success: true,
      design: {
        id,
        userId: req.user.sub,
        userName: req.user.name,
        userEmail: req.user.email,
        originalImage: imageValue,
        prompt,
        roomType,
        variants,
        status: 'draft',
        quoteAmount: null,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Design Studio] Create error:', error);
    res.status(500).json({ message: 'Failed to save Smart designs' });
  }
});

app.get('/api/ai/designs', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { userId } = req.query;
    if (!userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    if (userId && req.user?.role !== 'admin' && userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this user' });
    }

    let rows;
    if (userId) {
      rows = await allAsync(
        `SELECT a.*, c.name as customerName, c.email as customerEmail FROM ai_designs a LEFT JOIN customers c ON a.customerId = c.id WHERE a.customerId = ? ORDER BY a.createdAt DESC`,
        [userId]
      );
    } else {
      rows = await allAsync(
        `SELECT a.*, c.name as customerName, c.email as customerEmail FROM ai_designs a LEFT JOIN customers c ON a.customerId = c.id ORDER BY a.createdAt DESC`,
        []
      );
    }

    const designs = (rows || []).map((row) => {
      const variants = row.variants ? JSON.parse(row.variants) : [];
      return {
        id: row.id,
        userId: row.customerId,
        originalImage: row.originalImage,
        variants,
        status: row.status || 'draft',
        quoteAmount: row.quoteAmount,
        createdAt: row.createdAt,
        requestedAt: row.requestedAt,
        customerName: row.customerName,
        customerEmail: row.customerEmail,
        prompt: variants?.[0]?.styleTag || '',
        roomType: variants?.[0]?.roomType || variants?.[0]?.categoryName || ''
      };
    });

    res.json({ success: true, designs });
  } catch (error) {
    console.error('[Design Studio] List error:', error);
    res.status(500).json({ message: 'Failed to fetch Smart designs' });
  }
});

app.post('/api/ai/designs/:id/request-quote', authenticate, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { id } = req.params;
    const record = await getAsync(`SELECT customerId FROM ai_designs WHERE id = ?`, [id]);
    if (!record) return res.status(404).json({ message: 'Smart design not found' });
    if (req.user?.role !== 'admin' && record.customerId !== req.user?.sub) {
      return res.status(403).json({ message: 'Not authorized for this design' });
    }
    await runAsync(
      `UPDATE ai_designs SET status = ?, requestedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      ['quote_requested', id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('[Design Studio] Quote request error:', error);
    res.status(500).json({ message: 'Failed to request quote' });
  }
});

app.post('/api/ai/designs/:id/quote', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { id } = req.params;
    const { quoteAmount } = req.body || {};
    if (quoteAmount === undefined || Number.isNaN(Number(quoteAmount))) {
      return res.status(400).json({ message: 'Valid quoteAmount required' });
    }
    await runAsync(
      `UPDATE ai_designs SET status = ?, quoteAmount = ? WHERE id = ?`,
      ['quoted', Number(quoteAmount), id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('[Design Studio] Quote update error:', error);
    res.status(500).json({ message: 'Failed to update quote' });
  }
});

// ===== CATEGORIES ROUTES =====
// Get all categories with their images
app.get('/api/categories', async (req, res) => {
  try {
    const categoryPath = path.join(__dirname, '..', 'public', 'category');
    const metadata = readCategoryMetadata();
    console.log(`[Categories] Path: ${categoryPath}, Exists: ${fs.existsSync(categoryPath)}`);

    const dbImageNameLookup = new Map();
    if (dbInitialized) {
      const dbImageRows = await allAsync(
        `SELECT categoryKey, filename, displayName FROM category_images`,
        []
      );
      (dbImageRows || []).forEach((row) => {
        const key = `${normalizeCategoryKey(row.categoryKey)}::${String(row.filename || '')}`;
        const displayName = String(row.displayName || '').trim();
        if (!key || !displayName) return;
        dbImageNameLookup.set(key, displayName);
      });
    }

    const categoryMap = new Map();
    if (fs.existsSync(categoryPath)) {
      fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach((dirent) => {
          const categoryName = dirent.name;
          const categoryDir = path.join(categoryPath, categoryName);
          const categoryKey = normalizeCategoryKey(categoryName);
          const categoryMeta = getCategoryMetadataEntry(metadata, categoryName);
          const imageNames = categoryMeta.imageNames || {};
          const categoryMotion3d = categoryMeta.motion3d === true;
          const MIN_IMAGE_SIZE = 5120; // 5 KB minimum - filters out broken stub files
          const images = fs.readdirSync(categoryDir)
            .filter(file => {
              if (!/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file)) return false;
              try {
                const filePath = path.join(categoryDir, file);
                const stat = fs.statSync(filePath);
                return stat.size >= MIN_IMAGE_SIZE;
              } catch {
                return false;
              }
            })
            .map(file => ({
              name: imageNames[file] || dbImageNameLookup.get(`${categoryKey}::${file}`) || deriveImageTitleFromFilename(file),
              filename: file,
              url: `/api/category-images/${categoryName}/${file}`,
              motion3d: categoryMotion3d
            }))
            .sort((a, b) => a.filename.localeCompare(b.filename));

          const meta = categoryMeta || {};
          categoryMap.set(categoryKey, {
            id: categoryKey,
            name: categoryName,
            title: meta.title || categoryName,
            description: meta.description || '',
            image: meta.image || null,
            background: meta.background || null,
            motion3d: categoryMotion3d,
            status: meta.status || 'active',
            imageCount: images.length,
            images,
            thumbnail: images.length > 0 ? images[0].url : null
          });
          console.log(`[Categories] ${categoryName}: ${images.length} images`);
        });
    } else {
      console.warn('[Categories] Category path does not exist');
    }

    if (dbInitialized) {
      const dbCategories = await allAsync(
        `SELECT id, title, description, image, motion3d, status, createdAt FROM categories WHERE status = 'active'`,
        []
      );
      (dbCategories || []).forEach((row) => {
        const rowMotion3d = Number(row.motion3d || 0) === 1;
        const key = normalizeCategoryKey(row.title || row.id);
        const existing = categoryMap.get(key);
        if (existing) {
          const nextImages = (existing.images || []).map((img) => ({ ...img, motion3d: rowMotion3d }));
          categoryMap.set(key, {
            ...existing,
            title: row.title || existing.title,
            description: row.description || existing.description,
            image: row.image || existing.image,
            motion3d: rowMotion3d,
            images: nextImages,
            status: row.status || existing.status
          });
          return;
        }
        categoryMap.set(key, {
          id: key,
          name: row.title || key,
          title: row.title || key,
          description: row.description || '',
          image: row.image || null,
          background: null,
          motion3d: rowMotion3d,
          status: row.status || 'active',
          imageCount: 0,
          images: [],
          thumbnail: row.image || null
        });
      });
    }

    const masterBedroom = categoryMap.get('master-bedroom');
    const bedroom = categoryMap.get('bedroom');
    if (masterBedroom) {
      if (bedroom && bedroom.imageCount === 0) {
        categoryMap.set('bedroom', {
          ...bedroom,
          images: masterBedroom.images,
          imageCount: masterBedroom.imageCount,
          thumbnail: masterBedroom.thumbnail
        });
      } else if (!bedroom) {
        categoryMap.set('bedroom', {
          ...masterBedroom,
          id: 'bedroom',
          name: 'Bedroom',
          title: 'Bedroom'
        });
      }
    }

    const categories = Array.from(categoryMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`[Categories] Returning ${categories.length} categories`);
    res.json({ categories });
  } catch (error) {
    console.error('[Categories] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { title, description, image, status } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Title required' });
    const key = normalizeCategoryKey(title);
    const existing = await getAsync(`SELECT id FROM categories WHERE id = ?`, [key]);
    if (existing) return res.status(409).json({ message: 'Category already exists' });
    await runAsync(
      `INSERT INTO categories (id, title, description, image, motion3d, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [key, title, description || '', image || '', 1, status || 'active']
    );
    res.json({
      success: true,
      category: { id: key, title, description: description || '', image: image || null, motion3d: true, status: status || 'active' }
    });
  } catch (error) {
    console.error('[Categories] Create error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// ===== DESIGNS ROUTES =====
app.get('/api/designs_v2', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const designs = await allAsync(`
      SELECT d.*, c.title as categoryTitle 
      FROM designs d 
      LEFT JOIN categories c ON d.categoryId = c.id 
      WHERE d.status = 'active'
    `);

    // Parse JSON fields if any (though currently simple fields)
    // Add full image URLs if needed
    const formatted = designs.map(d => ({
      ...d,
      price: d.price || 0,
      previewImage: d.previewImage || '',
      motion3d: Number(d.motion3d || 0) === 1,
      category: d.categoryTitle || 'Unknown' // Map for frontend compatibility
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[Designs] Fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch designs' });
  }
});

// (Duplicate /api/contact and unguarded booking routes removed — canonical versions are defined earlier in the file)

app.put('/api/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { id } = req.params;
    const { title, description, image, status, motion3d } = req.body || {};
    const resolvedId = await resolveCategoryId(id);
    if (!resolvedId) return res.status(404).json({ message: 'Category not found' });
    const updates = [];
    const values = [];
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (motion3d !== undefined) {
      updates.push('motion3d = ?');
      values.push(motion3d ? 1 : 0);
    }
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    values.push(resolvedId);
    await runAsync(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (error) {
    console.error('[Categories] Update error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });
    const { id } = req.params;
    const resolvedId = await resolveCategoryId(id);
    if (!resolvedId) return res.status(404).json({ message: 'Category not found' });
    await runAsync(`UPDATE categories SET status = ? WHERE id = ?`, ['inactive', resolvedId]);
    res.json({ success: true });
  } catch (error) {
    console.error('[Categories] Delete error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

app.get('/api/category-metadata', (req, res) => {
  const metadata = readCategoryMetadata();
  res.json({ metadata });
});

app.post('/api/category-metadata/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  if (!id) return res.status(400).json({ message: 'Category id required' });
  const metadata = readCategoryMetadata();
  const categoryFolder = resolveCategoryFolderName(id) || id;
  const existing = getCategoryMetadataEntry(metadata, categoryFolder);
  const savedKey = upsertCategoryMetadataEntry(metadata, categoryFolder, {
    title: payload.title || existing.title || '',
    description: payload.description || existing.description || '',
    image: payload.image || existing.image || '',
    background: payload.background || existing.background || '',
    status: payload.status || existing.status || 'active'
  });
  if (!savedKey) return res.status(400).json({ message: 'Invalid category id' });
  const ok = writeCategoryMetadata(metadata);
  if (!ok) return res.status(500).json({ message: 'Failed to save category metadata' });
  res.json({ success: true, metadata: metadata[savedKey] });
});

// Save image names/titles for a category
app.post('/api/categories/:category/image-names', async (req, res) => {
  try {
    const { category } = req.params;
    const { imageNames } = req.body; // { [filename]: 'Title', ... }

    if (!category || !imageNames || typeof imageNames !== 'object') {
      return res.status(400).json({ message: 'Invalid category or imageNames' });
    }

    const categoryFolder = resolveCategoryFolderName(category);
    if (!categoryFolder) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const validFilenames = getCategoryImageFilenames(categoryFolder);
    const sanitizedImageNames = Object.entries(imageNames).reduce((acc, [filename, name]) => {
      if (!validFilenames.has(filename)) return acc;
      const title = String(name || '').trim();
      if (!title) return acc;
      acc[filename] = title;
      return acc;
    }, {});

    const metadata = readCategoryMetadata();
    const existing = getCategoryMetadataEntry(metadata, categoryFolder);
    const savedKey = upsertCategoryMetadataEntry(metadata, categoryFolder, {
      ...existing,
      imageNames: sanitizedImageNames
    });
    if (!savedKey) return res.status(400).json({ message: 'Invalid category' });

    const ok = writeCategoryMetadata(metadata);
    if (!ok) return res.status(500).json({ message: 'Failed to save image names' });

    if (dbInitialized) {
      await upsertCategoryImageRecords(categoryFolder, sanitizedImageNames);
    }

    res.json({ success: true, imageNames: sanitizedImageNames });
  } catch (error) {
    console.error('[Image Names] Save error:', error);
    res.status(500).json({ message: 'Failed to save image names' });
  }
});

// Get images for a specific category
app.get('/api/categories/:category', async (req, res) => {
  try {
    const categoryName = req.params.category;
    const categoryFolder = resolveCategoryFolderName(categoryName);
    const effectiveFolder = categoryFolder || categoryName;
    const categoryPath = path.join(__dirname, '..', 'public', 'category', effectiveFolder);

    if (!fs.existsSync(categoryPath)) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const metadata = readCategoryMetadata();
    const imageNames = getCategoryMetadataEntry(metadata, effectiveFolder).imageNames || {};
    const dbImageNameLookup = new Map();
    if (dbInitialized) {
      const rows = await allAsync(
        `SELECT filename, displayName FROM category_images WHERE categoryKey = ?`,
        [normalizeCategoryKey(effectiveFolder)]
      );
      (rows || []).forEach((row) => {
        const filename = String(row.filename || '').trim();
        const displayName = String(row.displayName || '').trim();
        if (!filename || !displayName) return;
        dbImageNameLookup.set(filename, displayName);
      });
    }

    const MIN_IMAGE_SIZE = 5120; // 5 KB minimum - filters out broken stub files
    const images = fs.readdirSync(categoryPath)
      .filter(file => {
        if (!/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file)) return false;
        try {
          const filePath = path.join(categoryPath, file);
          const stat = fs.statSync(filePath);
          return stat.size >= MIN_IMAGE_SIZE;
        } catch {
          return false;
        }
      })
      .map(file => ({
        name: imageNames[file] || dbImageNameLookup.get(file) || deriveImageTitleFromFilename(file),
        filename: file,
        url: `/api/category-images/${effectiveFolder}/${file}`
      }))
      .sort((a, b) => a.filename.localeCompare(b.filename));

    res.json({
      category: categoryName,
      images: images
    });
  } catch (error) {
    console.error('[Category Images] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch category images' });
  }
});

// ===== PROJECTS ROUTES =====
app.get('/api/projects', async (req, res) => {
  try {
    if (!dbInitialized) return res.json({ projects: [] });

    const projects = await allAsync(
      `SELECT id, title, price, image_url, category, description 
       FROM projects ORDER BY createdAt DESC`,
      []
    );
    res.json({ projects: projects || [] });
  } catch (error) {
    console.error('[Projects] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { title, price, image_url, category, description } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const projectId = `prj-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    await runAsync(
      `INSERT INTO projects (id, title, price, image_url, category, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, title, price, image_url || '', category, description || '']
    );

    res.json({ success: true, project: { id: projectId, title, price, image_url, category, description } });
  } catch (error) {
    console.error('[Projects] Post error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// ===== ENQUIRIES ROUTES =====
app.post('/api/contact', async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const { name, email, message } = req.body || {};
    const safeName = String(name || '').trim();
    const safeEmail = String(email || '').trim();
    const safeMessage = String(message || '').trim();

    if (!safeName || !safeEmail || !safeMessage) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const inquiryId = `inq-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    await runAsync(
      `INSERT INTO inquiries (id, name, email, message) VALUES (?, ?, ?, ?)`,
      [inquiryId, safeName, safeEmail, safeMessage]
    );

    res.json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiry: {
        id: inquiryId,
        name: safeName,
        email: safeEmail,
        message: safeMessage
      }
    });
  } catch (error) {
    console.error('[Contact] Post error:', error);
    res.status(500).json({ message: 'Failed to submit inquiry' });
  }
});

app.get('/api/enquiries', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    // Get total count
    const countResult = await getAsync(`SELECT COUNT(*) as total FROM inquiries`, []);
    const total = countResult?.total || 0;

    // Get paginated results
    const enquiries = await allAsync(
      `SELECT * FROM inquiries ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      enquiries: enquiries || [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: (offset + limit) < total
      }
    });
  } catch (error) {
    console.error('[Enquiries] Get error:', error);
    res.status(500).json({ message: 'Failed to fetch enquiries' });
  }
});

app.put('/api/enquiries/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbInitialized) return res.status(503).json({ message: 'Database not ready' });

    const inquiryId = String(req.params.id || '').trim();
    const payload = req.body || {};
    const nextStatus = String(payload.status || '').trim() || 'contacted';
    const nextReply = payload.adminReply == null ? null : String(payload.adminReply);

    if (!inquiryId) {
      return res.status(400).json({ message: 'Inquiry id is required' });
    }

    const result = await runAsync(
      `UPDATE inquiries
       SET status = ?, adminReply = ?, isReadByAdmin = 1
       WHERE id = ?`,
      [nextStatus, nextReply, inquiryId]
    );

    if (!result || !result.changes) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const inquiry = await getAsync(`SELECT * FROM inquiries WHERE id = ?`, [inquiryId]);
    return res.json({ success: true, inquiry });
  } catch (error) {
    console.error('[Enquiries] Put error:', error);
    return res.status(500).json({ message: 'Failed to update enquiry' });
  }
});

// Duplicate /api/contact route removed — canonical version defined earlier

// ===== PORTFOLIO CONTENT ROUTES =====
const PORTFOLIO_CONTENT_PATH = path.join(__dirname, 'portfolio-content.json');

app.get('/api/portfolio-content', (req, res) => {
  try {
    if (fs.existsSync(PORTFOLIO_CONTENT_PATH)) {
      const raw = fs.readFileSync(PORTFOLIO_CONTENT_PATH, 'utf8');
      const content = raw ? JSON.parse(raw) : {};
      return res.json({ content });
    }
    return res.json({ content: null });
  } catch (error) {
    console.error('[Portfolio Content] Get error:', error);
    return res.json({ content: null });
  }
});

app.put('/api/portfolio-content', authenticate, requireAdmin, (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content) return res.status(400).json({ message: 'Content required' });
    fs.writeFileSync(PORTFOLIO_CONTENT_PATH, JSON.stringify(content, null, 2));
    return res.json({ success: true });
  } catch (error) {
    console.error('[Portfolio Content] Put error:', error);
    return res.status(500).json({ message: 'Failed to save portfolio content' });
  }
});

// Mount Smart generation routes (must be BEFORE error handler)
app.use('/api/ai/generate', smartGenerateRouter);

// Mount Packages routes
app.use('/api', packagesRouter);

// Mount Invoices routes
app.use('/api/invoices', invoicesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const ensureAdminCredentialPolicy = async () => {
  if (!dbInitialized) return;

  const targetEmail = 'admin@gmail.com';
  const targetUsername = 'admin';
  const targetPassword = 'Admin@1234';

  const passwordHash = await bcryptjs.hash(targetPassword, 10);

  let adminRow = await getAsync(
    `SELECT id FROM customers WHERE role = 'admin' ORDER BY createdAt ASC LIMIT 1`,
    []
  );

  if (!adminRow) {
    adminRow = await getAsync(
      `SELECT id FROM customers WHERE username = ? OR email = ? ORDER BY createdAt ASC LIMIT 1`,
      [targetUsername, targetEmail]
    );
  }

  if (!adminRow) {
    const adminId = `admin-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await runAsync(
      `INSERT INTO customers (id, name, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)` ,
      [adminId, 'Administrator', targetEmail, targetUsername, passwordHash, 'admin']
    );
    console.log(`[Auth] Admin account created: ${targetEmail}`);
    return;
  }

  const adminId = String(adminRow.id);

  await runAsync(
    `UPDATE customers
       SET email = email || '.migrated.' || strftime('%s','now')
     WHERE email = ? AND id != ?`,
    [targetEmail, adminId]
  );

  await runAsync(
    `UPDATE customers
       SET username = username || '_migrated_' || strftime('%s','now')
     WHERE username = ? AND id != ?`,
    [targetUsername, adminId]
  );

  await runAsync(
    `UPDATE customers
       SET name = ?,
           email = ?,
           username = ?,
           password = ?,
           role = 'admin'
     WHERE id = ?`,
    ['Administrator', targetEmail, targetUsername, passwordHash, adminId]
  );

  console.log(`[Auth] Admin credentials enforced for ${targetEmail}`);
};

// Initialize databases and start server
const startServer = async () => {
  try {
    console.log('[Startup] Starting server initialization...');
    
    // Initialize Main SQLite database
    console.log('[Startup] Initializing main database...');
    await initializeDb();
    app.locals.db = getDb();
    dbInitialized = true;
    console.log('✅ Main Database initialized');

    // Initialize Secondary SQLite database
    console.log('[Startup] Initializing secondary database...');
    await initDB();
    console.log('✅ Secondary Database initialized');

    // Register routes AFTER database initialization
    console.log('[Startup] Registering routes...');
    app.use('/api/smart', smartGenerateRouter);
    app.use('/api', packagesRouter);
    app.use('/api', invoicesRouter);
    // app.use('/api/services', servicesRouter);
    // app.use('/api/rooms', roomsRouter);
    console.log('✅ Routes registered');

    // Run post-startup tasks
    const runPostStartupTasks = async () => {
      console.log('[Startup] Running background initialization tasks...');
      
      try {
        // Keep your existing post-startup code here
      } catch (error) {
        console.warn('[Startup] Post-startup task error:', error.message);
      }
    };
    await runPostStartupTasks();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`[Smart Generate] ✅ Backend server running on http://localhost:${PORT}`);
      console.log(`📧 API endpoints available`);
      console.log(`   - GET /api/health - Health check`);
      // Keep your other endpoint logs here
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Shutdown] SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('[Shutdown] Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('[Shutdown] SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('[Shutdown] Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('[Startup] Failed to start server:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
};

// Check if server is already running before starting a new instance
const probeExistingServer = async () => {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Start server if not already running
const startServerIfNotRunning = async () => {
  const healthy = await probeExistingServer();
  if (healthy) {
    console.warn(`[Server] Port ${PORT} is already in use by a healthy backend instance. Reusing existing server.`);
    process.exit(0);
    return;
  }
  
  await startServer();
};

startServerIfNotRunning();

