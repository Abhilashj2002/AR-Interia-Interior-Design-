const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const METADATA_PATH = path.join(ROOT, 'server', 'category-metadata.json');
const CATEGORY_ROOT = path.join(ROOT, 'public', 'category');

const normalizeCategoryKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toLabel = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const stripExt = (value) => String(value || '').replace(/\.[^/.]+$/, '');

const isRawLikeName = (name, filename) => {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return true;
  const f = stripExt(filename).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!f) return false;
  if (n === f) return true;
  if (/\bconcept\b\s*\d*$/i.test(String(name || '').trim())) return true;
  if (/^[a-z\s]+\(\d+\)$/.test(n)) return true;
  return false;
};

const curatedByCategory = {
  'balcony': [
    'Café Bistro Balcony',
    'Garden Pergola Balcony',
    'Sunrise Yoga Balcony',
    'Hammock Hideaway Balcony',
    'Mediterranean Blue Balcony',
    'Skyview Lounge Balcony',
    'Herb Vertical Garden Balcony',
    'Japanese Engawa Balcony',
    'Monsoon Covered Retreat',
    'Cocktail Bar Terrace Balcony',
    'Panoramic Urban Balcony'
  ],
  'swimming-pool': [
    'Infinity Sky Pool Deck',
    'Turquoise Villa Plunge Pool',
    'Roman Colonnade Lap Pool',
    'Tropical Lagoon Pool Garden',
    'Glass-Wall Indoor Pool Suite',
    'Midnight Starlight Pool',
    'Bali Pavilion Resort Pool',
    'Olympic Blue Lane Pool',
    'Emerald Rooftop Pool Terrace',
    'Cascading Waterfall Pool',
    'Azure Reflection Pool',
    'Sunset Leisure Pool',
    'Crystal Cove Pool'
  ],
  'office-interior': [
    'Ivory Executive Corner Office',
    'Mid-Century Walnut Workspace',
    'Dark Academia Study Office',
    'Industrial Loft Coworking',
    'Biophilic Green Workspace',
    'Minimalist Zen Home Office',
    'Navy Strategy Office',
    'Open Plan Collaboration Hub',
    'Terracotta Creative Studio',
    'High-Tech Command Centre',
    'Executive Meeting Pod',
    'Glass Focus Room',
    'Ergonomic Productivity Bay',
    'Leadership Suite',
    'Innovation Lab Workspace',
    'Quiet Concentration Zone',
    'Premium Client Office',
    'Modern Board Desk Office'
  ],
  'meeting-room': [
    'Executive Vision Boardroom',
    'Agile Strategy Hub',
    'Glass Forum Meeting Suite',
    'Creative Sprint Collaboration Room',
    'Quiet Focus Discussion Room',
    'Premium Client Conference Hall',
    'Navy Leadership Council Room',
    'Biophilic Innovation Meeting Space',
    'Industrial Decision Studio',
    'Panoramic Skyline Meeting Lounge',
    'Investor Briefing Suite',
    'Design Review War Room',
    'Acoustic Think Tank Room',
    'Hybrid Video Conference Room',
    'Executive Partnership Room',
    'Innovation Council Hall'
  ],
  'gym': [
    'Strength Forge Training Arena',
    'Elite Cardio Performance Zone',
    'Functional Fitness Studio',
    'Powerlifting Iron Bay',
    'Open Air Endurance Gym',
    'Champion Conditioning Hall',
    'Athletic Recovery Movement Lab',
    'Mind Body Wellness Studio',
    'High Energy HIIT Room',
    'Luxury Mirror Strength Suite',
    'Core Balance Training Space',
    'Dynamic Mobility Workout Room',
    'Athlete Prep Conditioning Studio',
    'Precision Repetition Training Room',
    'Pulse Performance Gym Deck',
    'Signature Fitness Lounge'
  ],
  'living-room': [
    'Royal Heritage Living Salon',
    'Sunlit Atrium Family Lounge',
    'Ivory Contemporary Living Hall',
    'Walnut Grand Conversation Room',
    'Minimal Luxe Sitting Space',
    'Emerald Accent Living Retreat',
    'Crystal Evenings Lounge',
    'Japandi Calm Living Studio',
    'Terracotta Artisan Lounge',
    'Modern Courtyard Living Suite'
  ],
  'guest-room': [
    'Boutique Arrival Guest Suite',
    'Jaipur Heritage Guest Chamber',
    'Indigo Textile Guest Retreat',
    'Coastal Breeze Guest Room',
    'Mountain Cabin Guest Haven',
    'Lotus Serenity Guest Suite',
    'Emerald Velvet Guest Stay',
    'Brass Heritage Guest Lounge',
    'Japandi Minimal Guest Studio',
    'Silk Route Guest Quarters',
    'Sandstone Oasis Guest Room',
    'Signature Comfort Guest Suite',
    'Classic Hospitality Guest Room',
    'Premium Residence Guest Suite'
  ],
  'garden': [
    'English Bloom Courtyard Garden',
    'Rose Canopy Garden Walk',
    'Zen Stone Meditation Garden',
    'Mughal Heritage Charbagh',
    'Tropical Escape Green Garden',
    'Wildflower Breeze Meadow Garden',
    'Culinary Herb Terrace Garden',
    'Geometric Modern Landscape Garden',
    'Bamboo Privacy Oasis Garden',
    'Lotus Reflection Water Garden',
    'Bougainvillea Pergola Garden',
    'Sunset Patio Signature Garden',
    'Grand Estate Botanical Garden'
  ],
  'classroom': [
    'Adaptive Smart Learning Studio',
    'Collaborative Discovery Classroom',
    'Heritage Focus Study Hall',
    'Future STEM Innovation Lab',
    'Creative Arts Learning Hub',
    'Nature Inspired Montessori Room',
    'Modern Lecture Collaboration Hall',
    'Digital First Knowledge Room',
    'Warm Waldorf Classroom',
    'Daylight Academic Learning Space',
    'Global Culture Seminar Classroom',
    'Interactive Project Learning Studio',
    'Competency Training Classroom',
    'Signature Education Experience Room'
  ]
};

const metadata = fs.existsSync(METADATA_PATH)
  ? JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8') || '{}')
  : {};

if (!fs.existsSync(CATEGORY_ROOT)) {
  throw new Error(`Category directory not found: ${CATEGORY_ROOT}`);
}

const dirs = fs.readdirSync(CATEGORY_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory());
let updatedCount = 0;
let createdCount = 0;

for (const dirent of dirs) {
  const folder = dirent.name;
  const key = normalizeCategoryKey(folder);
  const existingKey = Object.keys(metadata).find((k) => normalizeCategoryKey(k) === key) || key;

  if (!metadata[existingKey]) {
    metadata[existingKey] = {};
    createdCount += 1;
  }

  const entry = metadata[existingKey];
  const title = entry.title || toLabel(folder);
  const imageNames = { ...(entry.imageNames || {}) };

  const files = fs.readdirSync(path.join(CATEGORY_ROOT, folder))
    .filter((file) => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b));

  const curated = curatedByCategory[key] || [];

  files.forEach((file, index) => {
    const current = String(imageNames[file] || '').trim();
    if (current && !isRawLikeName(current, file)) return;

    const curatedName = curated[index];
    const nextName = curatedName || `${title} Signature Design ${index + 1}`;
    imageNames[file] = nextName;
    updatedCount += 1;
  });

  metadata[existingKey] = {
    ...entry,
    title,
    imageNames
  };
}

// Normalize keys to canonical form
const normalized = {};
Object.entries(metadata).forEach(([k, v]) => {
  normalized[normalizeCategoryKey(k)] = v;
});

fs.writeFileSync(METADATA_PATH, JSON.stringify(normalized, null, 2) + '\n', 'utf8');

console.log(`[upgrade-category-image-names] categories=${dirs.length} createdEntries=${createdCount} updatedNames=${updatedCount}`);
