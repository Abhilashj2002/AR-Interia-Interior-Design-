import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;
let dbInitializing = false;
let dbInitPromise = null;

export const initDB = async () => {
  if (dbInstance) return dbInstance;
  if (dbInitializing) return dbInitPromise;
  
  dbInitializing = true;
  dbInitPromise = (async () => {
    try {
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

      // ... (keep your other table creation code) ...

      console.log('✅ Secondary Database initialized successfully');
      dbInitializing = false;
      return dbInstance;
    } catch (err) {
      dbInitializing = false;
      throw err;
    }
  })();
  
  return dbInitPromise;
};

export const getDB = async () => {
  if (!dbInstance) {
    throw new Error('Secondary database not initialized. Call initDB() first.');
  }
  return dbInstance;
};

export const isDBInitialized = () => dbInstance !== null;
