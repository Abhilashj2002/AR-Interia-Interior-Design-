import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export const initDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      category TEXT,
      style TEXT,
      prompts TEXT,
      images TEXT,
      originalImage TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      type TEXT NOT NULL,
      bhk INTEGER NOT NULL,
      category TEXT,
      originalPrice INTEGER,
      discountedPrice INTEGER,
      image TEXT,
      backgroundImage TEXT,
      backgroundColor TEXT,
      features TEXT,
      rooms TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const packageColumns = await dbInstance.all(`PRAGMA table_info(packages)`);
  const packageColumnSet = new Set(packageColumns.map((col) => String(col?.name || '')));

  if (!packageColumnSet.has('backgroundImage')) {
    await dbInstance.exec(`ALTER TABLE packages ADD COLUMN backgroundImage TEXT`);
  }
  if (!packageColumnSet.has('backgroundColor')) {
    await dbInstance.exec(`ALTER TABLE packages ADD COLUMN backgroundColor TEXT`);
  }

  // Create bookings table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      packageId TEXT,
      designName TEXT,
      price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create payments table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      bookingId TEXT,
      customerId TEXT,
      amount REAL NOT NULL,
      method TEXT DEFAULT 'card',
      status TEXT DEFAULT 'pending',
      orderId TEXT,
      transactionId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bookingId) REFERENCES bookings(id)
    );
  `);

  // Create invoices table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      paymentId TEXT,
      bookingId TEXT,
      invoiceNumber TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      status TEXT DEFAULT 'generated',
      items TEXT,
      pdfPath TEXT,
      customerName TEXT,
      customerEmail TEXT,
      customerPhone TEXT,
      packageName TEXT,
      designName TEXT,
      paymentMethod TEXT,
      paymentDateTime TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES users(id),
      FOREIGN KEY (paymentId) REFERENCES payments(id),
      FOREIGN KEY (bookingId) REFERENCES bookings(id)
    );
  `);

  // Create app_migrations table for tracking migrations
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id TEXT PRIMARY KEY,
      appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      details TEXT
    );
  `);

  console.log('✅ Database initialized successfully');
  return dbInstance;
};

export const getDB = async () => {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
};
