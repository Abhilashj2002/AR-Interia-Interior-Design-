import fs from 'fs';
import path from 'path';

const DATASTORE_PATH = path.resolve('./services/dataStore.ts');

async function fixDataStore() {
  let content = fs.readFileSync(DATASTORE_PATH, 'utf8');

  // We need to modify the buildSeedPackages function in dataStore.ts
  // Currently, it looks like:
  /*
  const buildSeedPackages = (categories: Category[]) => {
    return DEFAULT_PACKAGES.map((pkg: any, index: number) => {
      ...
      return {
        ...pkg,
        id: String(pkg?.id || `package-${index + 1}`),
        type: pkg?.type || 'Standard',
        image: String(pkg?.image || categoryImage || ''),
        rooms: Array.isArray(pkg?.rooms) && pkg.rooms.length > 0
          ? pkg.rooms
          : buildPackageRoomsFromCategory(category),
        ...
  */
  
  // It seems it already prioritizes pkg.rooms if > 0. 
  // Wait, let's check if the issue is really that buildPackageRoomsFromCategory is being called.
  // Actually, the main issue was likely the JSON structure inside constants.ts itself.
  // The user said "1bhk 2bhk 3bhk 4bhk villa apartment are same fix it".
  // This probably means the base DEFAULT_PACKAGES/PACKAGES had identical content.
  // Let's force a reseed since we just updated constants.ts.

  // The reseed logic in dataStore.ts (line 651):
  // if (existingPackages.length === 0 || hasDummyPackages || (existingPackages[0] && existingPackages[0].rooms && existingPackages[0].rooms.length < 20)) {
  
  // We can write a quick script to just delete the localStorage key 'interia_packages' so the browser repopulates it on next load.
  // However, `dataStore.ts` runs in the browser, not node.
  console.log('✅ Prepared plan to wipe packages from localStorage so constants.ts changes take effect.');
}

fixDataStore();
