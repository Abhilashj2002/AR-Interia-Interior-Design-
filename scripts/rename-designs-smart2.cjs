/**
 * rename-designs-ai.cjs
 * Uses Smart Engine Vision API to analyze each design image and generate
 * a descriptive name + description, then patches dataStore.ts.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PRO_ENGINE_KEY = 'REDACTED_API_KEY';
const MODEL = 'smartEngine-2.0-flash';
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const DATASTORE_PATH = path.resolve(__dirname, '..', 'services', 'dataStore.ts');

// All designs with VERIFIED image paths
const DESIGNS = [
    // BATHROOM
    { id: 'design-bathroom-001', img: 'category/Bathroom/bathroom1.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-002', img: 'category/Bathroom/bathroom2.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-003', img: 'category/Bathroom/bathroom3.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-004', img: 'category/Bathroom/bathroom4.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-005', img: 'category/Bathroom/bathroom5.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-006', img: 'category/Bathroom/bathroom6.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-007', img: 'category/Bathroom/bathroom7.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-008', img: 'category/Bathroom/bathroom8.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-009', img: 'category/Bathroom/bathroom9.jpg', cat: 'Bathroom' },
    { id: 'design-bathroom-010', img: 'category/Bathroom/bathroom10.jpg', cat: 'Bathroom' },
    // LIVING ROOM
    { id: 'design-living-001', img: 'category/Living room/living1.jpg', cat: 'Living Room' },
    { id: 'design-living-002', img: 'category/Living room/living2.jpg', cat: 'Living Room' },
    { id: 'design-living-003', img: 'category/Living room/living3.jpg', cat: 'Living Room' },
    { id: 'design-living-004', img: 'category/Living room/living4.jpg', cat: 'Living Room' },
    { id: 'design-living-005', img: 'category/Living room/living5.jpg', cat: 'Living Room' },
    { id: 'design-living-006', img: 'category/Living room/living6.jpg', cat: 'Living Room' },
    { id: 'design-living-007', img: 'category/Living room/living7.jpg', cat: 'Living Room' },
    { id: 'design-living-008', img: 'category/Living room/living8.jpg', cat: 'Living Room' },
    { id: 'design-living-009', img: 'category/Living room/living9.jpg', cat: 'Living Room' },
    { id: 'design-living-010', img: 'category/Living room/living10.jpg', cat: 'Living Room' },
    // KIDS BEDROOM
    { id: 'design-bedroom-001', img: 'category/Kids-bedroom/kids-bedroom1.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-002', img: 'category/Kids-bedroom/kids-bedroom2.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-003', img: 'category/Kids-bedroom/kids-bedroom3.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-004', img: 'category/Kids-bedroom/kids-bedroom4.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-005', img: 'category/Kids-bedroom/kids-bedroom5.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-006', img: 'category/Kids-bedroom/kids-bedroom6.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-007', img: 'category/Kids-bedroom/kids-bedroom7.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-008', img: 'category/Kids-bedroom/kids-bedroom8.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-009', img: 'category/Kids-bedroom/kids-bedroom9.jpg', cat: 'Kids Bedroom' },
    { id: 'design-bedroom-010', img: 'category/Kids-bedroom/kids-bedroom10.jpg', cat: 'Kids Bedroom' },
    // MASTER BEDROOM
    { id: 'design-masterbedroom-001', img: 'category/Master Bedroom/master-bedroom1.jpg', cat: 'Master Bedroom' },
    { id: 'design-masterbedroom-002', img: 'category/Master Bedroom/master-bedroom2.jpg', cat: 'Master Bedroom' },
    { id: 'design-masterbedroom-003', img: 'category/Master Bedroom/master-bedroom3.jpg', cat: 'Master Bedroom' },
    { id: 'design-masterbedroom-004', img: 'category/Master Bedroom/master-bedroom4.jpg', cat: 'Master Bedroom' },
    { id: 'design-masterbedroom-005', img: 'category/Master Bedroom/master-bedroom5.jpg', cat: 'Master Bedroom' },
    // KITCHEN
    { id: 'design-kitchen-001', img: 'category/Kitchen/kitchen1.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-002', img: 'category/Kitchen/kitchen2.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-003', img: 'category/Kitchen/kitchen3.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-004', img: 'category/Kitchen/kitchen4.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-005', img: 'category/Kitchen/kitchen5.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-006', img: 'category/Kitchen/kitchen6.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-007', img: 'category/Kitchen/kitchen7.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-008', img: 'category/Kitchen/kitchen8.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-009', img: 'category/Kitchen/kitchen9.jpg', cat: 'Kitchen' },
    { id: 'design-kitchen-010', img: 'category/Kitchen/kitchen10.jpg', cat: 'Kitchen' },
    // DINING ROOM
    { id: 'design-dining-001', img: 'category/Diningroom/dining-room1.jpg', cat: 'Dining Room' },
    { id: 'design-dining-002', img: 'category/Diningroom/dining-room2.jpg', cat: 'Dining Room' },
    { id: 'design-dining-003', img: 'category/Diningroom/dining-room3.jpg', cat: 'Dining Room' },
    { id: 'design-dining-004', img: 'category/Diningroom/dining-room4.jpg', cat: 'Dining Room' },
    { id: 'design-dining-005', img: 'category/Diningroom/dining-room5.jpg', cat: 'Dining Room' },
    { id: 'design-dining-006', img: 'category/Diningroom/dining-room6.jpg', cat: 'Dining Room' },
    { id: 'design-dining-007', img: 'category/Diningroom/dining-room7.jpg', cat: 'Dining Room' },
    { id: 'design-dining-008', img: 'category/Diningroom/dining-room8.jpg', cat: 'Dining Room' },
    { id: 'design-dining-009', img: 'category/Diningroom/dining-room9.jpg', cat: 'Dining Room' },
    { id: 'design-dining-010', img: 'category/Diningroom/dining-room10.jpg', cat: 'Dining Room' },
    // POOJA ROOM
    { id: 'design-pooja-001', img: 'category/Pooja room/pooja-room1.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-002', img: 'category/Pooja room/pooja-room2.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-003', img: 'category/Pooja room/pooja-room3.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-004', img: 'category/Pooja room/pooja-room4.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-005', img: 'category/Pooja room/pooja-room5.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-006', img: 'category/Pooja room/pooja-room6.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-007', img: 'category/Pooja room/pooja-room7.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-008', img: 'category/Pooja room/pooja-room8.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-009', img: 'category/Pooja room/pooja-room9.jpg', cat: 'Pooja Room' },
    { id: 'design-pooja-010', img: 'category/Pooja room/pooja-room10.jpg', cat: 'Pooja Room' },
    // GYM
    { id: 'design-gym-001', img: 'category/Gym/gym (1).jpg', cat: 'Gym' },
    { id: 'design-gym-002', img: 'category/Gym/gym (2).jpg', cat: 'Gym' },
    { id: 'design-gym-003', img: 'category/Gym/gym (3).jpg', cat: 'Gym' },
    { id: 'design-gym-004', img: 'category/Gym/gym (4).jpg', cat: 'Gym' },
    { id: 'design-gym-005', img: 'category/Gym/gym (5).jpg', cat: 'Gym' },
    { id: 'design-gym-006', img: 'category/Gym/gym (6).jpg', cat: 'Gym' },
    { id: 'design-gym-007', img: 'category/Gym/gym (7).jpg', cat: 'Gym' },
    { id: 'design-gym-008', img: 'category/Gym/gym (8).jpg', cat: 'Gym' },
    { id: 'design-gym-009', img: 'category/Gym/gym (9).jpg', cat: 'Gym' },
    { id: 'design-gym-010', img: 'category/Gym/gym (10).jpg', cat: 'Gym' },
    // SPA
    { id: 'design-spa-001', img: 'category/Spa/spa room (1).jpg', cat: 'Spa Room' },
    { id: 'design-spa-002', img: 'category/Spa/spa room (2).jpg', cat: 'Spa Room' },
    { id: 'design-spa-003', img: 'category/Spa/spa room (3).jpg', cat: 'Spa Room' },
    { id: 'design-spa-004', img: 'category/Spa/spa room (4).jpg', cat: 'Spa Room' },
    { id: 'design-spa-005', img: 'category/Spa/spa room (5).jpg', cat: 'Spa Room' },
    { id: 'design-spa-006', img: 'category/Spa/spa room (6).jpg', cat: 'Spa Room' },
    { id: 'design-spa-007', img: 'category/Spa/spa room (6).jpg', cat: 'Spa Room' },
    { id: 'design-spa-008', img: 'category/Spa/spa room (6).jpg', cat: 'Spa Room' },
    { id: 'design-spa-009', img: 'category/Spa/spa room (6).jpg', cat: 'Spa Room' },
    { id: 'design-spa-010', img: 'category/Spa/spa room (6).jpg', cat: 'Spa Room' },
    // CLASSROOM
    { id: 'design-classroom-001', img: 'category/Classroom/classroom1.jpg', cat: 'Classroom' },
    { id: 'design-classroom-002', img: 'category/Classroom/classroom2.jpg', cat: 'Classroom' },
    { id: 'design-classroom-003', img: 'category/Classroom/classroom3.jpg', cat: 'Classroom' },
    { id: 'design-classroom-004', img: 'category/Classroom/classroom4.jpg', cat: 'Classroom' },
    { id: 'design-classroom-005', img: 'category/Classroom/classroom5.jpg', cat: 'Classroom' },
    { id: 'design-classroom-006', img: 'category/Classroom/classroom6.jpg', cat: 'Classroom' },
    { id: 'design-classroom-007', img: 'category/Classroom/classroom7.jpg', cat: 'Classroom' },
    { id: 'design-classroom-008', img: 'category/Classroom/classroom8.jpg', cat: 'Classroom' },
    { id: 'design-classroom-009', img: 'category/Classroom/classroom9.jpg', cat: 'Classroom' },
    { id: 'design-classroom-010', img: 'category/Classroom/classroom10.jpg', cat: 'Classroom' },
    // SWIMMING POOL
    { id: 'design-pool-001', img: 'category/Swimming pool/swimmingpool1 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-002', img: 'category/Swimming pool/swimmingpool2 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-003', img: 'category/Swimming pool/swimmingpool3 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-004', img: 'category/Swimming pool/swimmingpool4 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-005', img: 'category/Swimming pool/swimmingpool5 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-006', img: 'category/Swimming pool/swimmingpool6 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-007', img: 'category/Swimming pool/swimmingpool7 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-008', img: 'category/Swimming pool/swimmingpool8 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-009', img: 'category/Swimming pool/swimmingpool10 - Copy.jpg', cat: 'Swimming Pool' },
    { id: 'design-pool-010', img: 'category/Swimming pool/swimmingpool11 - Copy.jpg', cat: 'Swimming Pool' },
    // TERRACE
    { id: 'design-terrace-001', img: 'category/Terrace/terrace (1).jpg', cat: 'Terrace' },
    { id: 'design-terrace-002', img: 'category/Terrace/terrace (2).jpg', cat: 'Terrace' },
    { id: 'design-terrace-003', img: 'category/Terrace/terrace (3).jpg', cat: 'Terrace' },
    { id: 'design-terrace-004', img: 'category/Terrace/terrace (4).jpg', cat: 'Terrace' },
    { id: 'design-terrace-005', img: 'category/Terrace/terrace (5).jpg', cat: 'Terrace' },
    { id: 'design-terrace-006', img: 'category/Terrace/terrace (6).jpg', cat: 'Terrace' },
    { id: 'design-terrace-007', img: 'category/Terrace/terrace (7).jpg', cat: 'Terrace' },
    { id: 'design-terrace-008', img: 'category/Terrace/terrace (7).jpg', cat: 'Terrace' },
    { id: 'design-terrace-009', img: 'category/Terrace/terrace (7).jpg', cat: 'Terrace' },
    { id: 'design-terrace-010', img: 'category/Terrace/terrace (7).jpg', cat: 'Terrace' },
    // GARDEN
    { id: 'design-garden-001', img: 'category/Garden/garden (1).jpg', cat: 'Garden' },
    { id: 'design-garden-002', img: 'category/Garden/garden (2).jpg', cat: 'Garden' },
    { id: 'design-garden-003', img: 'category/Garden/garden (3).jpg', cat: 'Garden' },
    { id: 'design-garden-004', img: 'category/Garden/garden (4).jpg', cat: 'Garden' },
    { id: 'design-garden-005', img: 'category/Garden/garden (5).jpg', cat: 'Garden' },
    { id: 'design-garden-006', img: 'category/Garden/garden (6).jpg', cat: 'Garden' },
    { id: 'design-garden-007', img: 'category/Garden/garden (7).jpg', cat: 'Garden' },
    { id: 'design-garden-008', img: 'category/Garden/garden (8).jpg', cat: 'Garden' },
    { id: 'design-garden-009', img: 'category/Garden/garden (9).jpg', cat: 'Garden' },
    { id: 'design-garden-010', img: 'category/Garden/garden (10).jpg', cat: 'Garden' },
    // MEETING ROOM
    { id: 'design-meeting-001', img: 'category/Meeting room/meeting room (1).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-002', img: 'category/Meeting room/meeting room (2).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-003', img: 'category/Meeting room/meeting room (3).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-004', img: 'category/Meeting room/meeting room (4).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-005', img: 'category/Meeting room/meeting room (5).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-006', img: 'category/Meeting room/meeting room (6).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-007', img: 'category/Meeting room/meeting room (7).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-008', img: 'category/Meeting room/meeting room (8).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-009', img: 'category/Meeting room/meeting room (9).jpg', cat: 'Meeting Room' },
    { id: 'design-meeting-010', img: 'category/Meeting room/meeting room (10).jpg', cat: 'Meeting Room' },
    // HOME THEATRE
    { id: 'design-theatre-001', img: 'category/Home theatre/home theatre (1).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-002', img: 'category/Home theatre/home theatre (2).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-003', img: 'category/Home theatre/home theatre (3).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-004', img: 'category/Home theatre/home theatre (4).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-005', img: 'category/Home theatre/home theatre (5).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-006', img: 'category/Home theatre/home theatre (6).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-007', img: 'category/Home theatre/home theatre (7).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-008', img: 'category/Home theatre/home theatre (8).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-009', img: 'category/Home theatre/home theatre (9).jpg', cat: 'Home Theatre' },
    { id: 'design-theatre-010', img: 'category/Home theatre/home theatre (10).jpg', cat: 'Home Theatre' },
    // OFFICE INTERIOR
    { id: 'design-office-001', img: 'category/Office interior/office interior (1).jpg', cat: 'Office Interior' },
    { id: 'design-office-002', img: 'category/Office interior/office interior (2).jpg', cat: 'Office Interior' },
    { id: 'design-office-003', img: 'category/Office interior/office interior (3).jpg', cat: 'Office Interior' },
    { id: 'design-office-004', img: 'category/Office interior/office interior (4).jpg', cat: 'Office Interior' },
    { id: 'design-office-005', img: 'category/Office interior/office interior (5).jpg', cat: 'Office Interior' },
    { id: 'design-office-006', img: 'category/Office interior/office interior (6).jpg', cat: 'Office Interior' },
    { id: 'design-office-007', img: 'category/Office interior/office interior (7).jpg', cat: 'Office Interior' },
    { id: 'design-office-008', img: 'category/Office interior/office interior (8).jpg', cat: 'Office Interior' },
    { id: 'design-office-009', img: 'category/Office interior/office interior (9).jpg', cat: 'Office Interior' },
    { id: 'design-office-010', img: 'category/Office interior/office interior (10).jpg', cat: 'Office Interior' },
    // BALCONY
    { id: 'design-balcony-001', img: 'category/Balcony/balcony (1).jpg', cat: 'Balcony' },
    { id: 'design-balcony-002', img: 'category/Balcony/balcony (2).jpg', cat: 'Balcony' },
    { id: 'design-balcony-003', img: 'category/Balcony/balcony (3).jpg', cat: 'Balcony' },
    { id: 'design-balcony-004', img: 'category/Balcony/balcony (4).jpg', cat: 'Balcony' },
    { id: 'design-balcony-005', img: 'category/Balcony/balcony (5).jpg', cat: 'Balcony' },
    { id: 'design-balcony-006', img: 'category/Balcony/balcony (6).jpg', cat: 'Balcony' },
    { id: 'design-balcony-007', img: 'category/Balcony/balcony (7).jpg', cat: 'Balcony' },
    { id: 'design-balcony-008', img: 'category/Balcony/balcony (8).jpg', cat: 'Balcony' },
    { id: 'design-balcony-009', img: 'category/Balcony/balcony (9).jpg', cat: 'Balcony' },
    { id: 'design-balcony-010', img: 'category/Balcony/balcony (10).jpg', cat: 'Balcony' },
    // WARDROBE
    { id: 'design-wardrobe-001', img: 'category/wardrobe/wardrobe1.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-002', img: 'category/wardrobe/wardrobe2.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-003', img: 'category/wardrobe/wardrobe3.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-004', img: 'category/wardrobe/wardrobe4.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-005', img: 'category/wardrobe/wardrobe5.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-006', img: 'category/wardrobe/wardrobe6.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-007', img: 'category/wardrobe/wardrobe7.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-008', img: 'category/wardrobe/wardrobe8.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-009', img: 'category/wardrobe/wardrobe9.jpg', cat: 'Wardrobe' },
    { id: 'design-wardrobe-010', img: 'category/wardrobe/wardrobe10.jpg', cat: 'Wardrobe' },
    // GUEST ROOM
    { id: 'design-guestroom-001', img: 'category/Guest room/guest room (1).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-002', img: 'category/Guest room/guest room (2).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-003', img: 'category/Guest room/guest room (3).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-004', img: 'category/Guest room/guest room (4).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-005', img: 'category/Guest room/guest room (5).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-006', img: 'category/Guest room/guest room (6).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-007', img: 'category/Guest room/guest room (7).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-008', img: 'category/Guest room/guest room (8).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-009', img: 'category/Guest room/guest room (9).jpg', cat: 'Guest Room' },
    { id: 'design-guestroom-010', img: 'category/Guest room/guest room (10).jpg', cat: 'Guest Room' },
];

// ── Smart Engine API call ──────────────────────────────────────────────────────
function smartEngineAnalyzeImage(imgPath, category) {
    return new Promise((resolve) => {
        if (!fs.existsSync(imgPath)) {
            return resolve(null);
        }

        const imageBytes = fs.readFileSync(imgPath);
        const base64 = imageBytes.toString('base64');
        const ext = path.extname(imgPath).toLowerCase();
        const mimeType = (ext === '.png' || ext === '.avif') ? 'image/jpeg' : 'image/jpeg';

        const prompt = `You are an expert interior design naming specialist for an Indian luxury interior design platform "AR Interia".

Analyze this ${category} interior design image carefully and provide:
1. A SHORT, EVOCATIVE name (3-5 words) that captures the DOMINANT COLOR, MATERIAL, or UNIQUE STYLE visible
2. A CONCISE description (max 12 words) highlighting the standout design feature

Strict rules:
- Name must reflect WHAT IS VISIBLE in the image
- Name should feel premium and marketable
- Avoid overused words: "luxury", "modern", "premium", "elegant" used alone
- Indian context preferred where visible (jharokha, tulsi, teak, mughal, etc.)

Reply ONLY with valid JSON, no markdown, no explanation:
{"name": "Name Here", "description": "Short description here."}`;

        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
            generationConfig: { temperature: 0.65, maxOutputTokens: 100 }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${MODEL}:generateContent?key=${PRO_ENGINE_KEY}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const clean = text.replace(/```json[Smart Generate]?/g, '').replace(/```[Smart Generate]?/g, '').trim();
                    const result = JSON.parse(clean);
                    if (result.name && result.description) {
                        resolve({ name: result.name, description: result.description });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.setTimeout(35000, () => { req.destroy(); resolve(null); });
        req.write(body);
        req.end();
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log('🎨 AR Interia — Smart design Name Generator');
    console.log(`Processing ${DESIGNS.length} designs...[Smart Generate]`);

    const results = {};
    const DELAY = 1200;

    for (let i = 0; i < DESIGNS.length; i++) {
        const design = DESIGNS[i];
        const imgPath = path.join(PUBLIC_DIR, design.img);
        const exists = fs.existsSync(imgPath);

        process.stdout.write(`[${String(i + 1).padStart(3)}/${DESIGNS.length}] ${design.id} → `);

        if (!exists) {
            console.log(`⚠  MISSING: ${design.img}`);
            await sleep(100);
            continue;
        }

        const result = await smartEngineAnalyzeImage(imgPath, design.cat);
        if (result) {
            results[design.id] = result;
            console.log(`✓ "${result.name}"`);
        } else {
            console.log(`✗ API failed (will keep original)`);
        }

        await sleep(DELAY);
    }

    console.log(`[Smart Generate]✅ Got names for ${Object.keys(results).length}/${DESIGNS.length} designs`);

    // Save results JSON
    const jsonPath = path.resolve(__dirname, 'design-names.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`📄 Saved to: ${jsonPath}`);

    // Patch dataStore.ts
    console.log('[Smart Generate]🔧 Patching services/dataStore.ts...');
    let source = fs.readFileSync(DATASTORE_PATH, 'utf8');
    let patchCount = 0;

    for (const [id, { name, description }] of Object.entries(results)) {
        if (!name || !description) continue;
        const safeId = id.replace(/[.*+?^${}()|[\][Smart Generate]]/g, '[Smart Generate]$&');
        // Match the title and description fields for this specific design id
        const regex = new RegExp(
            `(id:[Smart Generate]s*'${safeId}'[^[Smart Generate]n]*?title:[Smart Generate]s*')[^']*(',[^[Smart Generate]n]*?description:[Smart Generate]s*')[^']*(')`
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
