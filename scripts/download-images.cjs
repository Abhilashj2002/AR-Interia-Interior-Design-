// scripts/download-images.cjs
// Curates 15 local interior images for each BHK bucket into package image folders.

const fs = require('fs');
const path = require('path');

const types = ['1bhk', '2bhk', '3bhk', '4bhk'];
const sourceFoldersByType = {
  '1bhk': ['Living room', 'Kitchen', 'Master Bedroom', 'Diningroom', 'Bathroom'],
  '2bhk': ['Living room', 'Kitchen', 'Master Bedroom', 'Kids-bedroom', 'Diningroom', 'wardrobe'],
  '3bhk': ['Living room', 'Kitchen', 'Master Bedroom', 'Kids-bedroom', 'Diningroom', 'Bathroom', 'Balcony'],
  '4bhk': ['Living room', 'Kitchen', 'Master Bedroom', 'Kids-bedroom', 'Diningroom', 'Bathroom', 'Balcony', 'Pooja room']
};

function getInteriorSourceFiles(type) {
  const categoryRoot = path.join(__dirname, '../public/category');
  const folders = sourceFoldersByType[type] || sourceFoldersByType['2bhk'];
  const files = [];

  for (const folder of folders) {
    const full = path.join(categoryRoot, folder);
    if (!fs.existsSync(full)) continue;
    for (const name of fs.readdirSync(full)) {
      const ext = path.extname(name).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
      files.push(path.join(full, name));
    }
  }

  if (files.length < 15) {
    throw new Error(`Not enough interior source images for ${type}. Found ${files.length}, expected at least 15.`);
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

(async () => {
  for (const type of types) {
    const dir = path.join(__dirname, `../public/package-images/${type}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Remove stale files so old non-interior images cannot remain in use.
    for (const file of fs.readdirSync(dir)) {
      if (file.toLowerCase().endsWith('.jpg')) {
        fs.unlinkSync(path.join(dir, file));
      }
    }

    const sourceFiles = getInteriorSourceFiles(type);
    const offset = types.indexOf(type) * 5;

    for (let i = 0; i < 15; i++) {
      const sourceIndex = (offset + (i * 7)) % sourceFiles.length;
      const source = sourceFiles[sourceIndex];
      const dest = path.join(dir, `${i + 1}.jpg`);
      try {
        fs.copyFileSync(source, dest);
        console.log(`Copied ${source} -> ${dest}`);
      } catch (err) {
        console.warn(`Failed ${type}/${i + 1}: ${String(err.message || err)}`);
      }
    }
  }

  console.log('BHK interior image curation finished.');
})();
