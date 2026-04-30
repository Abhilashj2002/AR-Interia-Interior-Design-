// Script to generate updated SAMPLE_DESIGNS_WITH_PRICES lines with local images
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'services', 'dataStore.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Image mapping: categoryId -> { folder, prefix, count, ext, pattern }
// pattern: 'simple' = prefix1.jpg, 'paren' = name (1).jpg
const categoryImageMap = {
    'cat-bathroom': { folder: 'Bathroom', prefix: 'bathroom', count: 10, pattern: 'simple' },
    'cat-living': { folder: 'Living room', prefix: 'living', count: 10, pattern: 'simple' },
    'cat-bedroom': { folder: 'Bed room', prefix: 'bedroom', count: 10, pattern: 'simple' },
    'cat-masterbedroom': { folder: 'Master bed room', prefix: 'master bed room', count: 10, pattern: 'paren' },
    'cat-kitchen': { folder: 'Kitchen', prefix: 'kitchen', count: 10, pattern: 'simple' },
    'cat-dining': { folder: 'Dining area', prefix: 'dining', count: 10, pattern: 'simple' },
    'cat-pooja': { folder: 'Pooja room', prefix: 'pooja room', count: 10, pattern: 'paren' },
    'cat-gym': { folder: 'Gym', prefix: 'gym', count: 10, pattern: 'paren' },
    'cat-spa': { folder: 'Spa', prefix: 'spa', count: 10, pattern: 'paren' },
    'cat-classroom': { folder: 'Class room', prefix: 'class room', count: 10, pattern: 'paren' },
    'cat-pool': { folder: 'Swimming pool', prefix: 'Swimming pool', count: 12, pattern: 'paren' },
    'cat-terrace': { folder: 'Terrace', prefix: 'terrace', count: 10, pattern: 'paren' },
    'cat-garden': { folder: 'Garden', prefix: 'garden', count: 10, pattern: 'paren' },
    'cat-meeting': { folder: 'Meeting room', prefix: 'meeting room', count: 10, pattern: 'paren' },
    'cat-theatre': { folder: 'Home theater', prefix: 'Home theater', count: 10, pattern: 'paren' },
    'cat-office': { folder: 'Office interior', prefix: 'Office interior', count: 10, pattern: 'paren' },
};

function getImagePath(catId, index) {
    const info = categoryImageMap[catId];
    if (!info) return '';
    if (info.pattern === 'simple') {
        return `/category/${info.folder}/${info.prefix}${index}.jpg`;
    } else {
        return `/category/${info.folder}/${info.prefix} (${index}).jpg`;
    }
}

// Replace all Unsplash URLs in design entries with local paths
// Find all design entries and replace previewImage and images
const designRegex = /\{ id: '(design-[^']+)'(.*?)categoryId: '(cat-[^']+)'(.*?)previewImage: '[^']+'(.*?)images: \['[^']+'\] \}/g;

let designCounter = {};

content = content.replace(designRegex, (match, designId, before, catId, middle, after) => {
    if (!categoryImageMap[catId]) return match;

    if (!designCounter[catId]) designCounter[catId] = 1;
    const idx = designCounter[catId];
    const info = categoryImageMap[catId];
    const imgIdx = ((idx - 1) % info.count) + 1;
    designCounter[catId]++;

    const imgPath = getImagePath(catId, imgIdx);

    return match
        .replace(/previewImage: '[^']+'/, `previewImage: '${imgPath}'`)
        .replace(/images: \['[^']+'\]/, `images: ['${imgPath}']`);
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done! Updated design image paths.');
console.log('Design counts per category:', designCounter);
