/**
 * rename-designs-smart.cjs
 * Analyzes 1 image per category using Smart Engine Vision, then generates
 * a full series of unique names for each category's designs.
 * Patches dataStore.ts with the results.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PRO_ENGINE_KEY = 'REDACTED_API_KEY';
const MODEL = 'smartEngine-2.0-flash';
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const DATASTORE_PATH = path.resolve(__dirname, '..', 'services', 'dataStore.ts');

// One representative image per category + how many designs to name
const CATEGORIES = [
    { name: 'Bathroom', previewImg: 'category/Bathroom/bathroom1.jpg', designCount: 10, idPrefix: 'design-bathroom-' },
    { name: 'Living Room', previewImg: 'category/Living room/living1.jpg', designCount: 10, idPrefix: 'design-living-' },
    { name: 'Kids Bedroom', previewImg: 'category/Kids-bedroom/kids-bedroom1.jpg', designCount: 10, idPrefix: 'design-bedroom-' },
    { name: 'Master Bedroom', previewImg: 'category/Master Bedroom/master-bedroom1.jpg', designCount: 5, idPrefix: 'design-masterbedroom-' },
    { name: 'Kitchen', previewImg: 'category/Kitchen/kitchen1.jpg', designCount: 10, idPrefix: 'design-kitchen-' },
    { name: 'Dining Room', previewImg: 'category/Diningroom/dining-room1.jpg', designCount: 10, idPrefix: 'design-dining-' },
    { name: 'Pooja Room', previewImg: 'category/Pooja room/pooja-room1.jpg', designCount: 10, idPrefix: 'design-pooja-' },
    { name: 'Gym', previewImg: 'category/Gym/gym (1).jpg', designCount: 10, idPrefix: 'design-gym-' },
    { name: 'Spa', previewImg: 'category/Spa/spa room (1).jpg', designCount: 10, idPrefix: 'design-spa-' },
    { name: 'Classroom', previewImg: 'category/Classroom/classroom1.jpg', designCount: 10, idPrefix: 'design-classroom-' },
    { name: 'Swimming Pool', previewImg: 'category/Swimming pool/swimmingpool1 - Copy.jpg', designCount: 10, idPrefix: 'design-pool-' },
    { name: 'Terrace', previewImg: 'category/Terrace/terrace (1).jpg', designCount: 7, idPrefix: 'design-terrace-' },
    { name: 'Garden', previewImg: 'category/Garden/garden (1).jpg', designCount: 10, idPrefix: 'design-garden-' },
    { name: 'Meeting Room', previewImg: 'category/Meeting room/meeting room (1).jpg', designCount: 10, idPrefix: 'design-meeting-' },
    { name: 'Home Theatre', previewImg: 'category/Home theatre/home theatre (1).jpg', designCount: 10, idPrefix: 'design-theatre-' },
    { name: 'Office Interior', previewImg: 'category/Office interior/office interior (1).jpg', designCount: 10, idPrefix: 'design-office-' },
    { name: 'Balcony', previewImg: 'category/Balcony/balcony (1).jpg', designCount: 10, idPrefix: 'design-balcony-' },
    { name: 'Wardrobe', previewImg: 'category/wardrobe/wardrobe1.jpg', designCount: 10, idPrefix: 'design-wardrobe-' },
    { name: 'Guest Room', previewImg: 'category/Guest room/guest room (1).jpg', designCount: 10, idPrefix: 'design-guestroom-' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Call Smart Engine to analyze one image and generate N unique name+description pairs
function smartEngineGenerateNames(imgPath, category, count) {
    return new Promise((resolve) => {
        if (!fs.existsSync(imgPath)) {
            return resolve(null);
        }

        const imageBytes = fs.readFileSync(imgPath);
        const base64 = imageBytes.toString('base64');

        const prompt = `You are an expert interior design naming specialist for "AR Interia", a premium Indian interior design platform.

Analyze this ${category} interior design image carefully for its style, color palette, materials, and atmosphere.

Generate EXACTLY ${count} UNIQUE, SHORT design names (3-5 words each) for a series of ${category} designs inspired by this image's style.
Also provide a SHORT description (max 10 words) for each.

Rules:
- Each name must be DIFFERENT and UNIQUE
- Names should evoke luxury, prestige, or a specific mood
- Reflect the visual style seen (colors, materials, patterns)
- Indian design context is preferred where relevant
- Avoid repetitive words across names

Respond ONLY with a JSON array of exactly ${count} objects. No markdown, no explanation:
[{"name":"Name One","description":"Short desc one."},{"name":"Name Two","description":"Short desc two."},...]`;

        const body = JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: 'image/jpeg', data: base64 } }
                ]
            }],
            generationConfig: { temperature: 0.8, maxOutputTokens: count * 60 }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${MODEL}:generateContent?key=${PRO_ENGINE_KEY}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };

        const req = https.request(options, (res) => {
            let data = '';
            console.log(`  HTTP ${res.statusCode}`);
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        console.log(`  API Error: ${parsed.error.message}`);
                        return resolve(null);
                    }
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const clean = text.replace(/```json[Smart Generate]?/g, '').replace(/```[Smart Generate]?/g, '').trim();
                    const arr = JSON.parse(clean);
                    if (Array.isArray(arr) && arr.length > 0) {
                        resolve(arr);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    console.log(`  Parse error: ${e.message}`);
                    resolve(null);
                }
            });
        });
        req.on('error', e => { console.log(`  Request error: ${e.message}`); resolve(null); });
        req.setTimeout(40000, () => { req.destroy(); console.log('  Timeout'); resolve(null); });
        req.write(body);
        req.end();
    });
}

async function main() {
    console.log('🎨 AR Interia — Smart Smart design Name Generator');
    console.log(`Analyzing ${CATEGORIES.length} categories with 1 API call each...[Smart Generate]`);

    const allResults = {}; // design id → { name, description }
    let successCount = 0;

    for (let i = 0; i < CATEGORIES.length; i++) {
        const cat = CATEGORIES[i];
        const imgPath = path.join(PUBLIC_DIR, cat.previewImg);

        console.log(`[${i + 1}/${CATEGORIES.length}] ${cat.name} (${cat.designCount} designs)...`);

        const names = await smartEngineGenerateNames(imgPath, cat.name, cat.designCount);

        if (names && names.length > 0) {
            for (let j = 0; j < cat.designCount; j++) {
                const designId = `${cat.idPrefix}${String(j + 1).padStart(3, '0')}`;
                const nameEntry = names[j] || names[names.length - 1]; // fallback to last if fewer returned
                allResults[designId] = {
                    name: nameEntry.name,
                    description: nameEntry.description
                };
                console.log(`  ${designId} → "${nameEntry.name}"`);
            }
            successCount += cat.designCount;
        } else {
            console.log(`  ⚠ Failed — keeping original names`);
        }

        // Wait between calls to avoid rate limiting
        if (i < CATEGORIES.length - 1) {
            console.log('  ⏳ Waiting 5s...');
            await sleep(5000);
        }
    }

    console.log(`[Smart Generate]✅ Generated ${successCount} names across ${Object.keys(allResults).length} designs`);

    // Save results
    const jsonPath = path.resolve(__dirname, 'design-names.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf8');
    console.log(`📄 Saved: ${jsonPath}`);

    if (Object.keys(allResults).length === 0) {
        console.log('⚠ No names generated — dataStore.ts unchanged');
        return;
    }

    // Patch dataStore.ts — designs are single-line entries
    console.log('[Smart Generate]🔧 Patching services/dataStore.ts...');
    let source = fs.readFileSync(DATASTORE_PATH, 'utf8');
    let patchCount = 0;

    for (const [id, { name, description }] of Object.entries(allResults)) {
        const safeId = id.replace(/[.*+?^${}()|[\][Smart Generate]]/g, '[Smart Generate]$&');
        // Single-line regex: match id: '...', title: 'OLD', ... description: 'OLD',
        const regex = new RegExp(
            `(id:[Smart Generate]s*'${safeId}',[Smart Generate]s*title:[Smart Generate]s*')[^']*(',[Smart Generate]s*description:[Smart Generate]s*')[^']*(')`
        );
        const safeTitle = name.replace(/[Smart Generate]/g, '[Smart Generate][Smart Generate]').replace(/'/g, "[Smart Generate]'");
        const safeDesc = description.replace(/[Smart Generate]/g, '[Smart Generate][Smart Generate]').replace(/'/g, "[Smart Generate]'");
        const patched = source.replace(regex, `$1${safeTitle}$2${safeDesc}$3`);
        if (patched !== source) {
            source = patched;
            patchCount++;
        }
    }

    fs.writeFileSync(DATASTORE_PATH, source, 'utf8');
    console.log(`✅ Patched ${patchCount} entries in dataStore.ts`);
    console.log('[Smart Generate]🎉 Done! Restart the dev server to see updated names.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
