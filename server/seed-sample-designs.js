/**
 * Seed Sample Designs to Database
 * This script populates the database with all sample designs from the frontend
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'ar_interia.db');

const db = new sqlite3.Database(DB_PATH);

// Category definitions with titles that match folder names
const CATEGORIES_TO_CREATE = [
  { id: 'bathroom', title: 'Bathroom', description: 'Luxurious bathroom designs' },
  { id: 'living-room', title: 'Living Room', description: 'Statement pieces for shared spaces' },
  { id: 'bedroom', title: 'Kids Bedroom', description: 'Fun and creative kids bedroom designs' },
  { id: 'master-bedroom', title: 'Master Bedroom', description: 'Elegant master bedroom suites' },
  { id: 'kitchen', title: 'Kitchen', description: 'Functional and stylish kitchens' },
  { id: 'dining-room', title: 'Dining Room', description: 'Elegant dining spaces' },
  { id: 'pooja-room', title: 'Pooja Room', description: 'Sacred prayer spaces' },
  { id: 'balcony', title: 'Balcony', description: 'Outdoor relaxation spaces' },
  { id: 'office-interior', title: 'Office Interior', description: 'Professional workspace designs' },
  { id: 'guest-room', title: 'Guest Room', description: 'Welcoming guest accommodations' },
  { id: 'gym', title: 'Gym', description: 'Home fitness spaces' },
  { id: 'home-theatre', title: 'Home Theatre', description: 'Private cinema experiences' },
  { id: 'spa', title: 'Spa', description: 'Wellness and relaxation rooms' },
  { id: 'swimming-pool', title: 'Swimming Pool', description: 'Luxury pool designs' },
  { id: 'terrace', title: 'Terrace', description: 'Rooftop and terrace spaces' },
  { id: 'wardrobe', title: 'Wardrobe', description: 'Custom storage solutions' },
  { id: 'garden', title: 'Garden', description: 'Beautiful garden landscapes' },
  { id: 'epoxy-floor', title: 'Epoxy Floor', description: 'Decorative epoxy flooring' },
  { id: 'classroom', title: 'Classroom', description: 'Educational space designs' },
  { id: 'meeting-room', title: 'Meeting Room', description: 'Professional meeting spaces' }
];

// Category ID mapping (frontend categoryId -> database categoryId)
const CATEGORY_MAPPING = {
  'cat-bathroom': 'bathroom',
  'cat-living': 'living-room',
  'cat-bedroom': 'bedroom',
  'cat-masterbedroom': 'master-bedroom',
  'cat-kitchen': 'kitchen',
  'cat-dining': 'dining-room',
  'cat-pooja': 'pooja-room',
  'cat-balcony': 'balcony',
  'cat-office': 'office-interior',
  'cat-guest': 'guest-room',
  'cat-gym': 'gym',
  'cat-theatre': 'home-theatre',
  'cat-spa': 'spa',
  'cat-pool': 'swimming-pool',
  'cat-terrace': 'terrace',
  'cat-wardrobe': 'wardrobe',
  'cat-garden': 'garden',
  'cat-epoxy': 'epoxy-floor',
  'cat-classroom': 'classroom',
  'cat-meeting': 'meeting-room'
};

// All sample designs organized by category
const SAMPLE_DESIGNS = [
  // BATHROOM (10 designs)
  { id: 'design-bathroom-001', title: 'White Travertine Retreat', description: 'Floor-to-ceiling travertine with freestanding soaking tub.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom1.jpg', price: 125000, cost: 100000 },
  { id: 'design-bathroom-002', title: 'Monsoon Rainfall Bath', description: 'Tropical open shower with rainfall head and teak accents.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom2.jpg', price: 135000, cost: 105000 },
  { id: 'design-bathroom-003', title: 'Onyx Noir Sanctuary', description: 'Dark onyx walls with backlit mirror and stone basin.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom3.jpg', price: 145000, cost: 115000 },
  { id: 'design-bathroom-004', title: 'Ivory Cascade Spa Bath', description: 'Ivory-toned bath with cascading waterfall mixer fittings.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom4.jpg', price: 140000, cost: 110000 },
  { id: 'design-bathroom-005', title: 'Cobalt Mosaic Retreat', description: 'Deep blue mosaic tiles with polished chrome fixtures.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom5.jpg', price: 150000, cost: 120000 },
  { id: 'design-bathroom-006', title: 'Zen Pebble Wellness Room', description: 'Japanese pebble floor bath with bamboo wall panels.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom6.jpg', price: 130000, cost: 102000 },
  { id: 'design-bathroom-007', title: 'Rose Gold Luxe Bath', description: 'Rose gold fixtures with swirled marble and vessel sink.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom7.jpg', price: 155000, cost: 125000 },
  { id: 'design-bathroom-008', title: 'Slate Charcoal Master Bath', description: 'Charcoal slate panels with floating vanity and LED strip.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom8.jpg', price: 160000, cost: 128000 },
  { id: 'design-bathroom-009', title: 'Teak Warmth Wetroom', description: 'Warm teak wood slats with an open walk-in shower area.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom9.jpg', price: 142000, cost: 113000 },
  { id: 'design-bathroom-010', title: 'Crystal Frosted Spa Lounge', description: 'Frosted glass partitions with crystal pendant lighting.', categoryId: 'cat-bathroom', previewImage: '/category/Bathroom/bathroom10.jpg', price: 138000, cost: 110000 },
  
  // LIVING ROOM (11 designs)
  { id: 'design-living-001', title: 'Heritage Brass Drawing Room', description: 'Rich brass accents with Chesterfield sofa and carved wall panels.', categoryId: 'cat-living', previewImage: '/category/Living room/living1.jpg', price: 180000, cost: 144000 },
  { id: 'design-living-002', title: 'Ivory Boucle Parlour', description: 'Cream boucle sofas with fluted plaster walls and arch shelving.', categoryId: 'cat-living', previewImage: '/category/Living room/living2.jpg', price: 200000, cost: 160000 },
  { id: 'design-living-003', title: 'Walnut Panel Grand Hall', description: 'Floor-to-ceiling walnut wood with a statement ceiling medallion.', categoryId: 'cat-living', previewImage: '/category/Living room/living3.jpg', price: 220000, cost: 176000 },
  { id: 'design-living-004', title: 'Silver Oak Minimalist Lounge', description: 'Silver oak tones with low-profile furniture and abstract art.', categoryId: 'cat-living', previewImage: '/category/Living room/living4.jpg', price: 190000, cost: 152000 },
  { id: 'design-living-005', title: 'Emerald Velvet Royale', description: 'Deep emerald velvet seating with gilded coffee table.', categoryId: 'cat-living', previewImage: '/category/Living room/living5.jpg', price: 195000, cost: 156000 },
  { id: 'design-living-006', title: 'Crystal Chandelier Parlour', description: 'Cascading crystal chandelier above curved sectional sofa.', categoryId: 'cat-living', previewImage: '/category/Living room/living6.jpg', price: 185000, cost: 148000 },
  { id: 'design-living-007', title: "Mahogany Gentleman's Lounge", description: 'Dark mahogany shelving with cognac leather armchairs.', categoryId: 'cat-living', previewImage: '/category/Living room/living7.jpg', price: 205000, cost: 164000 },
  { id: 'design-living-008', title: 'Japandi Stone Living', description: 'Washi walls, raked stone tray, and low platform seating.', categoryId: 'cat-living', previewImage: '/category/Living room/living8.jpg', price: 175000, cost: 140000 },
  { id: 'design-living-009', title: 'Terracotta Jali Gallery Hall', description: 'Terracotta hues with carved jali divider and block-print cushions.', categoryId: 'cat-living', previewImage: '/category/Living room/living9.jpg', price: 210000, cost: 168000 },
  { id: 'design-living-010', title: 'Sunlit Atrium Courtyard', description: 'Skylight-lit atrium lounge with tropical plants and white walls.', categoryId: 'cat-living', previewImage: '/category/Living room/living10.jpg', price: 188000, cost: 150000 },
  { id: 'design-living-011', title: 'Azure Horizon Coastal Suite', description: 'Azure horizon views from a plush navy sectional.', categoryId: 'cat-living', previewImage: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200', price: 250000, cost: 200000 },
  
  // KIDS BEDROOM (10 designs)
  { id: 'design-bedroom-001', title: 'Pastel Carousel Suite', description: 'Soft lilac walls with carousel mural and cloud-shaped shelves.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom1.jpg', price: 165000, cost: 132000 },
  { id: 'design-bedroom-002', title: 'Adventurer Bunk Cabin', description: 'Pine bunk beds with built-in ladder and map wallpaper.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom2.jpg', price: 155000, cost: 124000 },
  { id: 'design-bedroom-003', title: 'Storybook Attic Nook', description: 'Sloped ceiling nook styled like a fairytale cottage interior.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom3.jpg', price: 170000, cost: 136000 },
  { id: 'design-bedroom-004', title: 'Sunshine Yellow Playroom', description: 'Sunny yellow walls with chalkboard panel and plush play mat.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom4.jpg', price: 180000, cost: 144000 },
  { id: 'design-bedroom-005', title: 'Galaxy Star Loft', description: 'Navy ceiling with fibre-optic stars and space-theme decor.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom5.jpg', price: 160000, cost: 128000 },
  { id: 'design-bedroom-006', title: 'Candy Pop Mint Room', description: 'Mint green walls with candy-stripe rug and bubble chair.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom6.jpg', price: 175000, cost: 140000 },
  { id: 'design-bedroom-007', title: 'Cloud Nine Canopy Bed', description: 'White canopy bed with cloud-print drapes and cotton rug.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom7.jpg', price: 172000, cost: 137000 },
  { id: 'design-bedroom-008', title: 'Rainbow Mural Loft Bed', description: 'Lofted bed with rainbow wall mural and study nook below.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom8.jpg', price: 185000, cost: 148000 },
  { id: 'design-bedroom-009', title: 'Forest Treehouse Room', description: 'Nature mural with wooden bed frame and lantern pendant lights.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom9.jpg', price: 168000, cost: 134000 },
  { id: 'design-bedroom-010', title: 'Little Royal Prince Suite', description: 'Crown motif headboard with blue velvet and gold star details.', categoryId: 'cat-bedroom', previewImage: '/category/Kids-bedroom/kids-bedroom10.jpg', price: 190000, cost: 152000 },
  
  // MASTER BEDROOM (5 designs)
  { id: 'design-masterbedroom-001', title: 'Four-Poster Canopy Suite', description: 'Teak four-poster bed with silk drape and hand-knotted rug.', categoryId: 'cat-masterbedroom', previewImage: '/category/Master Bedroom/master-bedroom1.jpg', price: 225000, cost: 180000 },
  { id: 'design-masterbedroom-002', title: 'Golden Amber Dusk Suite', description: 'Amber-toned walls with brass bedside lights and plush headboard.', categoryId: 'cat-masterbedroom', previewImage: '/category/Master Bedroom/master-bedroom2.jpg', price: 235000, cost: 188000 },
  { id: 'design-masterbedroom-003', title: 'Platinum Walk-In Retreat', description: 'White platinum palette with floor-to-ceiling wardrobe panels.', categoryId: 'cat-masterbedroom', previewImage: '/category/Master Bedroom/master-bedroom3.jpg', price: 228000, cost: 182000 },
  { id: 'design-masterbedroom-004', title: 'Vaulted Cathedral Suite', description: 'Exposed beam vaulted ceiling with grey linen and nature palette.', categoryId: 'cat-masterbedroom', previewImage: '/category/Master Bedroom/master-bedroom4.jpg', price: 240000, cost: 192000 },
  { id: 'design-masterbedroom-005', title: 'Moonlit Japandi Haven', description: 'Wabi-sabi textures with pampas grass and low Japanese platform bed.', categoryId: 'cat-masterbedroom', previewImage: '/category/Master Bedroom/master-bedroom5.jpg', price: 232000, cost: 186000 },
  
  // KITCHEN (10 designs)
  { id: 'design-kitchen-001', title: 'White Quartz Chef Studio', description: 'White quartz island with brass tap and open floating shelves.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen1.jpg', price: 145000, cost: 116000 },
  { id: 'design-kitchen-002', title: 'Stainless Pro Cook Hall', description: 'Pro-grade stainless counters with handle-less sleek cabinetry.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen2.jpg', price: 138000, cost: 110000 },
  { id: 'design-kitchen-003', title: 'Granite Island Gourmet', description: 'Black granite island with pendant lights and wine rack.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen3.jpg', price: 155000, cost: 124000 },
  { id: 'design-kitchen-004', title: 'Warm Brass Artisan Kitchen', description: 'Sage green cabinets with aged brass hardware and clay tiles.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen4.jpg', price: 148000, cost: 118000 },
  { id: 'design-kitchen-005', title: 'Midnight Lacquer Modular', description: 'Gloss black lacquer shutters with chrome appliance wall.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen5.jpg', price: 152000, cost: 121000 },
  { id: 'design-kitchen-006', title: 'Rustic Farmhouse Pantry', description: 'Open shelving with brick backsplash and apron farmhouse sink.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen6.jpg', price: 160000, cost: 128000 },
  { id: 'design-kitchen-007', title: 'Scandinavian Light Kitchen', description: 'Off-white Scandi kitchen with rattan pendants and oak stools.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen7.jpg', price: 142000, cost: 113000 },
  { id: 'design-kitchen-008', title: 'Compact Smart Galley', description: 'Space-efficient galley with fold-out dining countertop.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen8.jpg', price: 135000, cost: 108000 },
  { id: 'design-kitchen-009', title: 'Coastal Seafoam Kitchen', description: 'Seafoam blue cabinets with white subway tile and wicker accents.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen9.jpg', price: 158000, cost: 126000 },
  { id: 'design-kitchen-010', title: 'Italian Calacatta Kitchen', description: 'Calacatta marble slabs with fluted island and statement hood.', categoryId: 'cat-kitchen', previewImage: '/category/Kitchen/kitchen10.jpg', price: 165000, cost: 132000 }
];

console.log('🌱 Starting sample designs seed...');

// First, create categories if they don't exist
let categoriesCreated = 0;
const categoryMap = new Map();

// Load existing categories first
db.all('SELECT id, title FROM categories', [], (err, existingCategories) => {
  if (err) {
    console.error('Error fetching categories:', err);
    db.close();
    return;
  }

  // Build map from existing categories
  existingCategories.forEach(cat => {
    const normalizedTitle = cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    categoryMap.set(normalizedTitle, cat.id);
    categoryMap.set(cat.id, cat.id);
  });

  // Create missing categories
  CATEGORIES_TO_CREATE.forEach((cat, index) => {
    // Check if category already exists
    if (categoryMap.has(cat.id) || categoryMap.has(cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      console.log(`⏭️  Category exists: ${cat.title}`);
      categoriesCreated++;
    } else {
      db.run(
        `INSERT INTO categories (id, title, description, status) VALUES (?, ?, ?, 'active')`,
        [cat.id, cat.title, cat.description],
        (err) => {
          if (err) {
            console.error(`❌ Error creating category "${cat.title}":`, err.message);
          } else {
            console.log(`✅ Created category: ${cat.title}`);
            categoryMap.set(cat.id, cat.id);
          }
          categoriesCreated++;
        }
      );
    }
  });

  // Wait for categories to be created, then seed designs
  setTimeout(() => {
    console.log(`\n📁 Categories ready: ${categoryMap.size}`);
    seedDesigns(categoryMap);
  }, 500);
});

function seedDesigns(categoryMap) {
  // Insert designs
  let inserted = 0;
  let skipped = 0;

  SAMPLE_DESIGNS.forEach((design, index) => {
    setTimeout(() => {
      // Resolve category ID
      let dbCategoryId = CATEGORY_MAPPING[design.categoryId] || design.categoryId;

      // Try to find matching category in database
      const possibleKeys = [
        dbCategoryId,
        dbCategoryId.replace(/cat-/, ''),
        design.categoryId.replace(/cat-/, '')
      ];

      let foundCategoryId = null;
      for (const key of possibleKeys) {
        if (categoryMap.has(key)) {
          foundCategoryId = categoryMap.get(key);
          break;
        }
      }

      if (!foundCategoryId) {
        console.log(`⚠️  Skipping "${design.title}" - category not found: ${design.categoryId}`);
        skipped++;
        return;
      }

      // Check if design already exists
      db.get('SELECT id FROM designs WHERE id = ?', [design.id], (err, row) => {
        if (err) {
          console.error('Error checking design:', err);
          return;
        }

        if (row) {
          console.log(`⏭️  Design already exists: ${design.title}`);
          skipped++;
          return;
        }

        // Insert the design
        db.run(
          `INSERT INTO designs (id, title, description, categoryId, previewImage, price, cost, status, availabilityStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [design.id, design.title, design.description, foundCategoryId, design.previewImage, design.price, design.cost, 'active', 'available'],
          (err) => {
            if (err) {
              console.error(`❌ Error inserting "${design.title}":`, err.message);
            } else {
              console.log(`✅ Inserted: ${design.title}`);
              inserted++;
            }

            // Check if we're done
            if (inserted + skipped === SAMPLE_DESIGNS.length) {
              console.log(`\n🎉 Seeding complete! Inserted: ${inserted}, Skipped: ${skipped}`);
              db.close();
            }
          }
        );
      });
    }, index * 30);
  });
}
