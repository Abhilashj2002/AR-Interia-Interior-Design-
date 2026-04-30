const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'services', 'dataStore.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Correct mapping: categoryId -> [folder, prefix, pattern, count]
// pattern: 'simple' = prefix1.jpg, 'paren' = prefix (1).jpg
const catMap = {
    'cat-bathroom': ['Bathroom', 'bathroom', 'simple', 10],
    'cat-living': ['Living room', 'living', 'simple', 10],
    'cat-bedroom': ['Kids-bedroom', 'kids-bedroom', 'simple', 10],
    'cat-masterbedroom': ['Master Bedroom', 'master-bedroom', 'simple', 10],
    'cat-kitchen': ['Kitchen', 'kitchen', 'simple', 10],
    'cat-dining': ['Diningroom', 'dining-room', 'simple', 10],
    'cat-pooja': ['Pooja room', 'pooja-room', 'simple', 10],
    'cat-gym': ['Gym', 'gym', 'paren', 15],
    'cat-spa': ['Spa', 'spa room', 'paren', 10],
    'cat-classroom': ['Classroom', 'class room', 'paren', 10],
    'cat-pool': ['Swimming pool', 'swimming pool', 'paren', 1],
    'cat-terrace': ['Terrace', 'terrace', 'paren', 10],
    'cat-garden': ['Garden', 'garden', 'paren', 10],
    'cat-meeting': ['Meeting room', 'meeting room', 'paren', 10],
    'cat-theatre': ['Home theatre', 'home theatre', 'paren', 10],
    'cat-office': ['Office interior', 'office interior', 'paren', 10],
};

const counters = {};
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("id: 'design-")) continue;

    const catMatch = line.match(/categoryId: '(cat-[^']+)'/);
    if (!catMatch) continue;

    const catId = catMatch[1];
    const info = catMap[catId];
    if (!info) continue;

    const [folder, prefix, pattern, maxCount] = info;

    if (!counters[catId]) counters[catId] = 1;
    const idx = ((counters[catId] - 1) % maxCount) + 1;
    counters[catId]++;

    let imgPath;
    if (pattern === 'simple') {
        imgPath = `/category/${folder}/${prefix}${idx}.jpg`;
    } else {
        imgPath = `/category/${folder}/${prefix} (${idx}).jpg`;
    }

    lines[i] = line
        .replace(/previewImage: '[^']+'/, `previewImage: '${imgPath}'`)
        .replace(/images: \['[^']*'\]/, `images: ['${imgPath}']`);
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
console.log('Done! Corrected design image paths.');
console.log('Counts:', JSON.stringify(counters));
