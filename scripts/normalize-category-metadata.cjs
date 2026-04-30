const fs = require('fs');
const path = require('path');

const normalizeCategoryKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const mergeEntry = (existing, incoming) => {
  const next = { ...(existing || {}) };
  const source = incoming || {};

  ['title', 'description', 'image', 'background', 'status'].forEach((field) => {
    const incomingValue = source[field];
    if (isNonEmptyString(incomingValue)) {
      next[field] = incomingValue;
      return;
    }
    if (incomingValue !== undefined && incomingValue !== null && typeof incomingValue !== 'string') {
      next[field] = incomingValue;
    }
  });

  const existingNames = next.imageNames && typeof next.imageNames === 'object' ? next.imageNames : {};
  const incomingNames = source.imageNames && typeof source.imageNames === 'object' ? source.imageNames : {};
  const mergedNames = { ...existingNames, ...incomingNames };
  if (Object.keys(mergedNames).length > 0) {
    next.imageNames = mergedNames;
  }

  return next;
};

const main = () => {
  const metadataPath = path.resolve(__dirname, '..', 'server', 'category-metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error(`[normalize-category-metadata] File not found: ${metadataPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(metadataPath, 'utf8');
  const parsed = raw ? JSON.parse(raw) : {};
  const normalized = {};
  const mergedFrom = {};

  for (const [key, value] of Object.entries(parsed)) {
    const normalizedKey = normalizeCategoryKey(key);
    if (!normalizedKey) continue;
    normalized[normalizedKey] = mergeEntry(normalized[normalizedKey], value);
    mergedFrom[normalizedKey] = mergedFrom[normalizedKey] || [];
    mergedFrom[normalizedKey].push(key);
  }

  const sorted = Object.fromEntries(Object.entries(normalized).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(metadataPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');

  const collisionKeys = Object.entries(mergedFrom)
    .filter(([, sourceKeys]) => sourceKeys.length > 1)
    .map(([normalizedKey, sourceKeys]) => `${normalizedKey} <= ${sourceKeys.join(', ')}`);

  console.log(`[normalize-category-metadata] Canonical categories: ${Object.keys(sorted).length}`);
  if (collisionKeys.length > 0) {
    console.log('[normalize-category-metadata] Merged duplicate keys:');
    collisionKeys.forEach((line) => console.log(`  - ${line}`));
  } else {
    console.log('[normalize-category-metadata] No duplicate key collisions found.');
  }
};

main();
