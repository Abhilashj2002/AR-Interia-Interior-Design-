#!/usr/bin/env node
/**
 * Migration script to seed 60 packages into the database
 * Run with: node server/migrate-seed-packages.cjs
 */

import { initDB } from './database.js';
import { SEED_PACKAGES } from './seed-packages.js';

async function migratePackages() {
  try {
    console.log('🔄 Starting package migration...');
    const db = await initDB();
    
    // Clear existing packages
    await db.run('DELETE FROM packages');
    console.log('✓ Cleared existing packages');
    
    // Insert all packages
    let inserted = 0;
    for (const pkg of SEED_PACKAGES) {
      try {
        await db.run(
          `INSERT INTO packages (
            id, name, subtitle, description, type, bhk, category, 
            originalPrice, discountedPrice, image, backgroundColor, 
            features, rooms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            pkg.image,
            pkg.backgroundColor,
            JSON.stringify(pkg.features),
            JSON.stringify(pkg.rooms)
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
    const stats = await db.get(
      `SELECT COUNT(*) as total, bhk, type FROM packages GROUP BY bhk, type`
    );
    
    console.log('\n📊 Package Distribution:');
    const result = await db.all(
      `SELECT type, bhk, COUNT(*) as count FROM packages GROUP BY type, bhk ORDER BY type, bhk`
    );
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
