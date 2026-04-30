/**
 * apply-design-names.cjs
 * Applies curated, premium design names to dataStore.ts
 * Names are crafted based on category style and image visual patterns.
 */

const fs = require('fs');
const path = require('path');

const DATASTORE_PATH = path.resolve(__dirname, '..', 'services', 'dataStore.ts');

// Curated premium names for all designs
const DESIGN_NAMES = {
    // ── BATHROOM ────────────────────────────────────────────────────────────
    'design-bathroom-001': { name: 'White Travertine Retreat', description: 'Floor-to-ceiling travertine with freestanding soaking tub.' },
    'design-bathroom-002': { name: 'Monsoon Rainfall Bath', description: 'Tropical open shower with rainfall head and teak accents.' },
    'design-bathroom-003': { name: 'Onyx Noir Sanctuary', description: 'Dark onyx walls with backlit mirror and stone basin.' },
    'design-bathroom-004': { name: 'Ivory Cascade Spa Bath', description: 'Ivory-toned bath with cascading waterfall mixer fittings.' },
    'design-bathroom-005': { name: 'Cobalt Mosaic Retreat', description: 'Deep blue mosaic tiles with polished chrome fixtures.' },
    'design-bathroom-006': { name: 'Zen Pebble Wellness Room', description: 'Japanese pebble floor bath with bamboo wall panels.' },
    'design-bathroom-007': { name: 'Rose Gold Luxe Bath', description: 'Rose gold fixtures with swirled marble and vessel sink.' },
    'design-bathroom-008': { name: 'Slate Charcoal Master Bath', description: 'Charcoal slate panels with floating vanity and LED strip.' },
    'design-bathroom-009': { name: 'Teak Warmth Wetroom', description: 'Warm teak wood slats with an open walk-in shower area.' },
    'design-bathroom-010': { name: 'Crystal Frosted Spa Lounge', description: 'Frosted glass partitions with crystal pendant lighting.' },

    // ── LIVING ROOM ─────────────────────────────────────────────────────────
    'design-living-001': { name: 'Heritage Brass Drawing Room', description: 'Rich brass accents with Chesterfield sofa and carved wall panels.' },
    'design-living-002': { name: 'Ivory Boucle Parlour', description: 'Cream boucle sofas with fluted plaster walls and arch shelving.' },
    'design-living-003': { name: 'Walnut Panel Grand Hall', description: 'Floor-to-ceiling walnut wood with a statement ceiling medallion.' },
    'design-living-004': { name: 'Silver Oak Minimalist Lounge', description: 'Silver oak tones with low-profile furniture and abstract art.' },
    'design-living-005': { name: 'Emerald Velvet Royale', description: 'Deep emerald velvet seating with gilded coffee table.' },
    'design-living-006': { name: 'Crystal Chandelier Parlour', description: 'Cascading crystal chandelier above curved sectional sofa.' },
    'design-living-007': { name: 'Mahogany Gentleman\'s Lounge', description: 'Dark mahogany shelving with cognac leather armchairs.' },
    'design-living-008': { name: 'Japandi Stone Living', description: 'Washi walls, raked stone tray, and low platform seating.' },
    'design-living-009': { name: 'Terracotta Jali Gallery Hall', description: 'Terracotta hues with carved jali divider and block-print cushions.' },
    'design-living-010': { name: 'Sunlit Atrium Courtyard', description: 'Skylight-lit atrium lounge with tropical plants and white walls.' },

    // ── KIDS BEDROOM ────────────────────────────────────────────────────────
    'design-bedroom-001': { name: 'Pastel Carousel Suite', description: 'Soft lilac walls with carousel mural and cloud-shaped shelves.' },
    'design-bedroom-002': { name: 'Adventurer Bunk Cabin', description: 'Pine bunk beds with built-in ladder and map wallpaper.' },
    'design-bedroom-003': { name: 'Storybook Attic Nook', description: 'Sloped ceiling nook styled like a fairytale cottage interior.' },
    'design-bedroom-004': { name: 'Sunshine Yellow Playroom', description: 'Sunny yellow walls with chalkboard panel and plush play mat.' },
    'design-bedroom-005': { name: 'Galaxy Star Loft', description: 'Navy ceiling with fibre-optic stars and space-theme decor.' },
    'design-bedroom-006': { name: 'Candy Pop Mint Room', description: 'Mint green walls with candy-stripe rug and bubble chair.' },
    'design-bedroom-007': { name: 'Cloud Nine Canopy Bed', description: 'White canopy bed with cloud-print drapes and cotton rug.' },
    'design-bedroom-008': { name: 'Rainbow Mural Loft Bed', description: 'Lofted bed with rainbow wall mural and study nook below.' },
    'design-bedroom-009': { name: 'Forest Treehouse Room', description: 'Nature mural with wooden bed frame and lantern pendant lights.' },
    'design-bedroom-010': { name: 'Little Royal Prince Suite', description: 'Crown motif headboard with blue velvet and gold star details.' },

    // ── MASTER BEDROOM ──────────────────────────────────────────────────────
    'design-masterbedroom-001': { name: 'Four-Poster Canopy Suite', description: 'Teak four-poster bed with silk drape and hand-knotted rug.' },
    'design-masterbedroom-002': { name: 'Golden Amber Dusk Suite', description: 'Amber-toned walls with brass bedside lights and plush headboard.' },
    'design-masterbedroom-003': { name: 'Platinum Walk-In Retreat', description: 'White platinum palette with floor-to-ceiling wardrobe panels.' },
    'design-masterbedroom-004': { name: 'Vaulted Cathedral Suite', description: 'Exposed beam vaulted ceiling with grey linen and nature palette.' },
    'design-masterbedroom-005': { name: 'Moonlit Japandi Haven', description: 'Wabi-sabi textures with pampas grass and low Japanese platform bed.' },

    // ── KITCHEN ─────────────────────────────────────────────────────────────
    'design-kitchen-001': { name: 'White Quartz Chef\'s Studio', description: 'White quartz island with brass tap and open floating shelves.' },
    'design-kitchen-002': { name: 'Stainless Pro Cook Hall', description: 'Pro-grade stainless counters with handle-less sleek cabinetry.' },
    'design-kitchen-003': { name: 'Granite Island Gourmet', description: 'Black granite island with pendant lights and wine rack.' },
    'design-kitchen-004': { name: 'Warm Brass Artisan Kitchen', description: 'Sage green cabinets with aged brass hardware and clay tiles.' },
    'design-kitchen-005': { name: 'Midnight Lacquer Modular', description: 'Gloss black lacquer shutters with chrome appliance wall.' },
    'design-kitchen-006': { name: 'Rustic Farmhouse Pantry', description: 'Open shelving with brick backsplash and apron farmhouse sink.' },
    'design-kitchen-007': { name: 'Scandinavian Light Kitchen', description: 'Off-white Scandi kitchen with rattan pendants and oak stools.' },
    'design-kitchen-008': { name: 'Compact Smart Galley', description: 'Space-efficient galley with fold-out dining countertop.' },
    'design-kitchen-009': { name: 'Coastal Seafoam Kitchen', description: 'Seafoam blue cabinets with white subway tile and wicker accents.' },
    'design-kitchen-010': { name: 'Italian Calacatta Kitchen', description: 'Calacatta marble slabs with fluted island and statement hood.' },

    // ── DINING ROOM ─────────────────────────────────────────────────────────
    'design-dining-001': { name: 'Grand Ebony Feast Hall', description: 'Ebony-top dining table seating twelve with leather chairs.' },
    'design-dining-002': { name: 'Crystal Pendant Banquet', description: 'Cascading crystal pendant above oval dining table for eight.' },
    'design-dining-003': { name: 'Carrara Marble Supper Club', description: 'White Carrara marble table with velvet barrel chairs.' },
    'design-dining-004': { name: 'Tuscan Ochre Trattoria', description: 'Ochre walls, terracotta floor, and wrought-iron candelabra.' },
    'design-dining-005': { name: 'Art Deco Lacquer Banquet', description: 'Black lacquer Art Deco dining with geometric brass inserts.' },
    'design-dining-006': { name: 'Candlelit Intimate Nook', description: 'Cosy four-seat nook with sage drapes and tapered candles.' },
    'design-dining-007': { name: 'Rosewood Family Feast', description: 'Rosewood extendable table with upholstered bench and chairs.' },
    'design-dining-008': { name: 'Nordic Birch Bright Diner', description: 'Birch table with Wegner-style chairs and pendant rattan light.' },
    'design-dining-009': { name: 'Mughal Arch Darbar Dining', description: 'Arched door surround with blue ceramic tableware and jali screen.' },
    'design-dining-010': { name: 'Open Villa Terrace Dining', description: 'Garden-view open dining with teak furniture and linen drapes.' },

    // ── POOJA ROOM ──────────────────────────────────────────────────────────
    'design-pooja-001': { name: 'Tulsi Courtyard Mandir', description: 'Recessed mandir with tulsi platform, brass diya, and carved surround.' },
    'design-pooja-002': { name: 'Gold Leaf Temple Alcove', description: 'Gold-leaf finish alcove with flower inlay and soft warm lighting.' },
    'design-pooja-003': { name: 'Sandalwood Carved Shrine', description: 'Hand-carved sandalwood panels with incense niche and bell hook.' },
    'design-pooja-004': { name: 'Diya Glow Meditation Corner', description: 'Diya-lit low platform with jute mat and terracotta oil lamps.' },
    'design-pooja-005': { name: 'White Lotus Zen Sanctum', description: 'White marble floor with lotus motif and minimalist shrine shelf.' },
    'design-pooja-006': { name: 'Teak Jali Carved Mandir', description: 'Full-height teak jali doors concealing an inner shrine cabinet.' },
    'design-pooja-007': { name: 'White Marble Puja Hall', description: 'Pristine white marble puja hall with brass peacock deity stand.' },
    'design-pooja-008': { name: 'Rajasthani Jharokha Shrine', description: 'Jharokha-framed shrine with blue pottery accents and mirror work.' },
    'design-pooja-009': { name: 'Temple Bell Tower Sanctum', description: 'Mini tower with brass bells, red silk drapes, and stone idol base.' },
    'design-pooja-010': { name: 'Copper Diya Niche Room', description: 'Copper-lined niche with oil diyas and hand-painted mandala wall.' },

    // ── GYM ─────────────────────────────────────────────────────────────────
    'design-gym-001': { name: 'Dark Knight Powerhouse', description: 'Black rubber floor with mirrored wall and heavy iron rack setup.' },
    'design-gym-002': { name: 'Industrial Steel Forge Gym', description: 'Exposed brick and steel beams with suspended heavy bag.' },
    'design-gym-003': { name: 'White Minimalist Wellness Studio', description: 'All-white studio gym with cable machine and yoga mat zone.' },
    'design-gym-004': { name: 'Midnight Circuit Loft Gym', description: 'Dark loft gym with neon accent lighting and cardio zone.' },
    'design-gym-005': { name: 'Tropical Open Air Gym', description: 'Breezeway gym with bamboo ceiling and outdoor equipment pods.' },
    'design-gym-006': { name: 'Champion Elite Training Room', description: 'Competition-grade flooring with wall battle ropes and pull-up rig.' },
    'design-gym-007': { name: 'Slate Grey Strength Studio', description: 'Slate grey walls, platform lifting area, and LED timing display.' },
    'design-gym-008': { name: 'Holistic Yoga Zen Studio', description: 'Natural wood floor with calming green wall and meditation altar.' },
    'design-gym-009': { name: 'Scandinavian Light Fitness Room', description: 'Birch wood accents with Nordic-style minimalist equipment setup.' },
    'design-gym-010': { name: 'VIP Mirror Box Gym', description: 'Four-wall mirror boxing gym with leather punch bag and ring mat.' },

    // ── SPA ─────────────────────────────────────────────────────────────────
    'design-spa-001': { name: 'Himalayan Salt Stone Spa', description: 'Pink Himalayan salt wall with warm stone therapy table and candlelight.' },
    'design-spa-002': { name: 'Bamboo Leaf Serenity Room', description: 'Bamboo-lined walls with pebble floor path and rain mist ceiling.' },
    'design-spa-003': { name: 'White Cocoon Flotation Suite', description: 'Curved white walls with flotation pod and soft ambient lighting.' },
    'design-spa-004': { name: 'Ayurvedic Teak Abhyanga Room', description: 'Teak droni table with oil reserve and copper vessel accents.' },
    'design-spa-005': { name: 'Nordic Ice Plunge Sauna', description: 'Spruce wood sauna with cold plunge tub and heated stone bench.' },
    'design-spa-006': { name: 'Jade Stone Couple\'s Suite', description: 'Jade-green tile panels with two heated massage tables and silk drapes.' },
    'design-spa-007': { name: 'Dark Forest Relaxation Room', description: 'Moss wall installation with recessed pool and birch branch pendant.' },
    'design-spa-008': { name: 'Moroccan Hammam Suite', description: 'Zellige tile walls with marble slab and arched shower steam area.' },
    'design-spa-009': { name: 'Sakura Blossom Wellness Room', description: 'Cherry blossom mural room with tatami mat and soaking tub.' },
    'design-spa-010': { name: 'Crystal Quartz Healing Studio', description: 'White quartz crystals, sound bowl shelf, and diffused soft lighting.' },

    // ── CLASSROOM ───────────────────────────────────────────────────────────
    'design-classroom-001': { name: 'Smart Flex Learning Hub', description: 'Modular desks with digital whiteboard and acoustic ceiling tiles.' },
    'design-classroom-002': { name: 'Heritage Oak Study Hall', description: 'Timber-panelled study hall with arched windows and tiered seating.' },
    'design-classroom-003': { name: 'Bright STEM Discovery Room', description: 'Vibrant STEM lab with maker station, robotics bench, and globe map.' },
    'design-classroom-004': { name: 'Collaborative Creative Studio', description: 'Breakout pods with writable glass walls and mobile whiteboards.' },
    'design-classroom-005': { name: 'Montessori Nature Classroom', description: 'Nature-themed room with low shelves, rugs, and living plant wall.' },
    'design-classroom-006': { name: 'Amphitheatre Lecture Hall', description: 'Tiered seating amphitheatre with projection screen and soft lighting.' },
    'design-classroom-007': { name: 'Digital Innovation Lab', description: 'Curved desks with dual monitors, server rack display, and LED strips.' },
    'design-classroom-008': { name: 'Waldorf Warm Learning Room', description: 'Organic wood furniture with watercolour art wall and floor cushions.' },
    'design-classroom-009': { name: 'Daylight Bright Study Space', description: 'Floor-to-ceiling windows with sit-stand desks and colour-coded cubbies.' },
    'design-classroom-010': { name: 'Global Culture Seminar Room', description: 'World map mural with round table and flag display along the cornice.' },

    // ── SWIMMING POOL ────────────────────────────────────────────────────────
    'design-pool-001': { name: 'Infinity Sky Pool Deck', description: 'Infinity edge pool with city view and teak sun loungers.' },
    'design-pool-002': { name: 'Turquoise Villa Plunge Pool', description: 'Compact villa plunge pool with blue mosaic tile and pergola.' },
    'design-pool-003': { name: 'Roman Colonnade Lap Pool', description: 'Colonnaded lap pool with travertine coping and antique urns.' },
    'design-pool-004': { name: 'Tropical Lagoon Pool Garden', description: 'Free-form pool surrounded by palm trees and natural stone edging.' },
    'design-pool-005': { name: 'Glass-Wall Indoor Pool Suite', description: 'Heated indoor pool with glass wall and heated sandstone floor.' },
    'design-pool-006': { name: 'Midnight Starlight Pool', description: 'Dark-bottomed infinity pool with fibre-optic star deck and fire pit.' },
    'design-pool-007': { name: 'Bali Pavilion Resort Pool', description: 'Bali-style pool with pavilion, lotus pond, and stone carvings.' },
    'design-pool-008': { name: 'Olympic Blue Lane Pool', description: 'Competition-grade lane pool with lane ropes and timing blocks.' },
    'design-pool-009': { name: 'Emerald Rooftop Pool Terrace', description: 'Rooftop pool with glass panel fencing and panoramic skyline view.' },
    'design-pool-010': { name: 'Cascading Waterfall Pool', description: 'Tiered cascade waterfall pool with grotto alcove and spa overflow.' },

    // ── TERRACE ─────────────────────────────────────────────────────────────
    'design-terrace-001': { name: 'Skyline Rooftop Lounge', description: 'Terrace lounge with string lights, sectional, and city panorama.' },
    'design-terrace-002': { name: 'Jungle Canopy Terrace', description: 'Green canopy terrace with hanging plants and rattan egg chairs.' },
    'design-terrace-003': { name: 'Pergola Shade Dining Deck', description: 'Slatted pergola over teak dining set with planter boxes.' },
    'design-terrace-004': { name: 'Zen Pebble Meditation Deck', description: 'Zen pebble arrangement terrace with low seating and water feature.' },
    'design-terrace-005': { name: 'Bonfire Campfire Deck', description: 'Sunken fire pit terrace with Adirondack chairs and warm lanterns.' },
    'design-terrace-006': { name: 'Coastal Sundowner Deck', description: 'White-washed terrace with hammock, wicker, and sea-view backdrop.' },
    'design-terrace-007': { name: 'Evening Cocktail Rooftop', description: 'Bar-height terrace with cocktail counter, LED ambiance, and city view.' },
    'design-terrace-008': { name: 'Bohemian Macramé Terrace', description: 'Boho terrace with macramé backdrop, floor cushions, and potted herbs.' },
    'design-terrace-009': { name: 'Glass Fence Infinity Deck', description: 'Frameless glass railing terrace with infinity horizon and sunrise seat.' },
    'design-terrace-010': { name: 'Monsoon Rain Shelter Terrace', description: 'Covered terrace with clear polycarbonate roof and rain curtain effect.' },

    // ── GARDEN ─────────────────────────────────────────────────────────────
    'design-garden-001': { name: 'English Cottage Rose Garden', description: 'Hedged rose garden with stone path, arch trellis, and bench seat.' },
    'design-garden-002': { name: 'Zen Rock Sand Garden', description: 'Japanese karesansui with raked sand, bonsai and lantern focal.' },
    'design-garden-003': { name: 'Mughal Char Bagh Garden', description: 'Four-quadrant char bagh with fountain pond and symmetrical hedges.' },
    'design-garden-004': { name: 'Tropical Botanical Garden', description: 'Dense tropical planting with fern wall, banana palm and stone path.' },
    'design-garden-005': { name: 'Wildflower Meadow Garden', description: 'Wildflower meadow with stepping stones and a birdbath centrepiece.' },
    'design-garden-006': { name: 'Herb Kitchen Garden', description: 'Raised planter beds with herb varieties and terracotta pots.' },
    'design-garden-007': { name: 'Modern Geometric Garden', description: 'Box hedging in geometric squares with gravel fill and cube sculptures.' },
    'design-garden-008': { name: 'Bamboo Privacy Garden', description: 'Tall bamboo grove hedge with poured concrete patio and black steel planters.' },
    'design-garden-009': { name: 'Lotus Pond Water Garden', description: 'Koi pond with lotus blooms, stepping stones and weeping willow.' },
    'design-garden-010': { name: 'Bougainvillea Pergola Garden', description: 'Bright bougainvillea pergola with jasmine borders and mosaic path.' },

    // ── MEETING ROOM ────────────────────────────────────────────────────────
    'design-meeting-001': { name: 'Boardroom Executive Suite', description: 'Long boardroom table with leather chairs and glass wall partition.' },
    'design-meeting-002': { name: 'Walnut Prestige Council Room', description: 'Walnut panel walls with integrated AV screen and credenza.' },
    'design-meeting-003': { name: 'Glass Agile Huddle Room', description: 'All-glass cubicle huddle room with writable walls and soft seating.' },
    'design-meeting-004': { name: 'Creative Breakout Lounge', description: 'Informal meeting nook with curved sofa and large low coffee table.' },
    'design-meeting-005': { name: 'Acoustically Lined Quiet Room', description: 'Fabric acoustic panels with pod seating, green wall and LED lighting.' },
    'design-meeting-006': { name: 'Stone Arch Conference Hall', description: 'Stone arch conference hall seating thirty with projector and gallery.' },
    'design-meeting-007': { name: 'Navy Blue Strategy Room', description: 'Navy blue fitted room with whiteboard wall and remote collaboration screen.' },
    'design-meeting-008': { name: 'Biophilic Green Meeting Space', description: 'Lush indoor planting meeting zone with rattan chairs and pendant pot.' },
    'design-meeting-009': { name: 'Industrial Loft Meeting Room', description: 'Exposed brick and duct loft meeting room with Edison bulb chandelier.' },
    'design-meeting-010': { name: 'Panoramic Corner Suite', description: 'Corner office meeting room with floor-to-ceiling glass city view.' },

    // ── HOME THEATRE ─────────────────────────────────────────────────────────
    'design-theatre-001': { name: 'Midnight Velvet Cinema Room', description: 'Midnight blue velvet recliner rows with star-ceiling and 4K screen.' },
    'design-theatre-002': { name: 'Burgundy Plush Screening Den', description: 'Burgundy plush seating with Dolby Atmos raised platform arrangement.' },
    'design-theatre-003': { name: 'Leather Club Movie Lounge', description: 'Tobacco leather recliners with side tables and acoustic wall art.' },
    'design-theatre-004': { name: 'Stadium Seating Home Cinema', description: 'Three-row stadium seating with immersive screen and LED floor path.' },
    'design-theatre-005': { name: 'Acoustic Timber Media Room', description: 'Slatted timber acoustic walls with embedded surround speaker array.' },
    'design-theatre-006': { name: 'Jewel-Tone Luxe Screening', description: 'Jewel-tone drapes, velvet seats, and raised projection screen focal.' },
    'design-theatre-007': { name: 'Moonlight Dome Theatre', description: 'Curved dome ceiling with projection mapping and reclining pod seats.' },
    'design-theatre-008': { name: 'Retro Drive-In Den', description: 'Retro vintage themed room with car-seat section and neon marquee sign.' },
    'design-theatre-009': { name: 'Dolby Vision Gaming Theatre', description: 'Combined gaming and cinema with dual-purpose seating and race sim pod.' },
    'design-theatre-010': { name: 'Hammam-Inspired Lounge Cinema', description: 'Arched alcove cinema with Moroccan lanterns and floor-level ottoman seating.' },

    // ── OFFICE INTERIOR ──────────────────────────────────────────────────────
    'design-office-001': { name: 'Ivory Executive Corner Office', description: 'Clean white executive desk with glass partition and city view.' },
    'design-office-002': { name: 'Mid-Century Walnut Workspace', description: 'Mid-century walnut credenza desk with Eames chair and plant shelf.' },
    'design-office-003': { name: 'Dark Academia Study Office', description: 'Library-style office with floor-to-ceiling book shelves and green desk lamp.' },
    'design-office-004': { name: 'Industrial Loft Coworking', description: 'Exposed duct loft office with long bench desks and Edison pendants.' },
    'design-office-005': { name: 'Biophilic Green Workspace', description: 'Moss wall backdrop with sit-stand desks and soft natural daylight.' },
    'design-office-006': { name: 'Minimalist Zen Home Office', description: 'White floating desk, shoji screen divider and smooth concrete floor.' },
    'design-office-007': { name: 'Navy Captain\'s Study', description: 'Navy panelled study with brass desk lamp, globe, and leather captain chair.' },
    'design-office-008': { name: 'Glasstop Open Plan Office', description: 'Shared open plan with glass-top desks, frosted partitions and acoustic pods.' },
    'design-office-009': { name: 'Terracotta Creative Studio', description: 'Terracotta walls with art pin board, easel station and cork ceiling.' },
    'design-office-010': { name: 'High-Tech Command Centre', description: 'Multi-monitor command desk with recliner chair and ambient backlighting.' },

    // ── BALCONY ─────────────────────────────────────────────────────────────
    'design-balcony-001': { name: 'Café Bistro Balcony', description: 'Bistro table and chairs with planter rail and string light drape.' },
    'design-balcony-002': { name: 'Garden Pergola Balcony', description: 'Climbing rose pergola cover with caned swing and terracotta pots.' },
    'design-balcony-003': { name: 'Sunrise Yoga Balcony', description: 'Bamboo mat yoga balcony with incense stand and copper sunrise planter.' },
    'design-balcony-004': { name: 'Hammock Hideaway Balcony', description: 'Canvas hammock stretched between anchor posts with fern basket.' },
    'design-balcony-005': { name: 'Mediterranean Blue Balcony', description: 'Blue-washed railing with white pots, olive tree and sea ceramics.' },
    'design-balcony-006': { name: 'Skyview Lounge Balcony', description: 'Padded daybed lounge facing skyline with LED strip rail accent.' },
    'design-balcony-007': { name: 'Herb Vertical Garden Balcony', description: 'Vertical herb pocket wall with watering can display and pebble mat.' },
    'design-balcony-008': { name: 'Japanese Engawa Balcony', description: 'Slatted engawa-style wooden deck with shoji screen and stone lantern.' },
    'design-balcony-009': { name: 'Monsoon Covered Retreat', description: 'Polycarbonate covered balcony with rattan furniture and rain curtain.' },
    'design-balcony-010': { name: 'Cocktail Bar Terrace Balcony', description: 'Standing bar counter with bar stools, neon sign and city panorama.' },

    // ── WARDROBE ─────────────────────────────────────────────────────────────
    'design-wardrobe-001': { name: 'Walk-In Pearl White Wardrobe', description: 'Floor-to-ceiling white lacquer with glass fronts and LED strip reveal.' },
    'design-wardrobe-002': { name: 'Walnut Open-Shelf Dressing', description: 'Warm walnut open shelving with tie rack, shoe wall and island drawer.' },
    'design-wardrobe-003': { name: 'Dark Lacquer Fitted Closet', description: 'Gloss charcoal fitted closet with mirror insert and pull-out trouser press.' },
    'design-wardrobe-004': { name: 'Sage Green Boutique Wardrobe', description: 'Sage green closet with velvet drawer liners and gold bar handles.' },
    'design-wardrobe-005': { name: 'Glass Door Luxury Dressing', description: 'Smoked glass sliding doors with backlit display shelves for accessories.' },
    'design-wardrobe-006': { name: 'Modular Reach-In Organiser', description: 'Custom modular reach-in with zone dividers for shoes, bags and suits.' },
    'design-wardrobe-007': { name: 'Antique Mirror Vintage Closet', description: 'Aged mirror panels on wardrobe doors with ornate brass pull handles.' },
    'design-wardrobe-008': { name: 'Island Centre Dressing Suite', description: 'Central island jewellery drawer with padded stool and vanity mirror.' },
    'design-wardrobe-009': { name: 'Minimalist Slimline Wardrobe', description: 'Handleless white slimline wardrobe with push-to-open soft-close doors.' },
    'design-wardrobe-010': { name: 'Cedar-Lined Premium Closet', description: 'Cedar-lined wardrobe with garment steamer recess and valet stand.' },

    // ── GUEST ROOM ───────────────────────────────────────────────────────────
    'design-guestroom-001': { name: 'Boutique Hotel Twin Suite', description: 'Crisp hotel-style twin beds with unified artwork wall and night tables.' },
    'design-guestroom-002': { name: 'Sage Linen Guest Retreat', description: 'Sage walls with natural linen bedding and wicker side lamp accent.' },
    'design-guestroom-003': { name: 'Terracotta Jaipur Haveli Room', description: 'Jaipur print cushions, terracotta lamp and block-print headboard wall.' },
    'design-guestroom-004': { name: 'Minimalist White Pebble Room', description: 'All-white room with pebble stone accent and bamboo reading nook.' },
    'design-guestroom-005': { name: 'Indigo Batik Textile Suite', description: 'Indigo batik headboard wall with aged timber and woven throw.' },
    'design-guestroom-006': { name: 'Pastel Blue Coastal Room', description: 'Coastal pastel blue walls with driftwood decor and sailcloth curtain.' },
    'design-guestroom-007': { name: 'Midnight Jewel Guest Suite', description: 'Jewel-tone plum headboard with gold side lamps and tufted footboard.' },
    'design-guestroom-008': { name: 'Rattan Bali Bungalow Room', description: 'Rattan four-poster with tropical leaf wallpaper and linen canopy.' },
    'design-guestroom-009': { name: 'Scandinavian Hygge Guest Room', description: 'Warm neutral tones with sheepskin rug, candles and birch furniture.' },
    'design-guestroom-010': { name: 'Mountain Cabin Retreat Room', description: 'Log cabin-style headboard with plaid throw and stone lamp base.' },
};

function main() {
    console.log('🔧 Applying curated AI design names to dataStore.ts...');

    let source = fs.readFileSync(DATASTORE_PATH, 'utf8');
    let patchCount = 0;
    let skipCount = 0;

    for (const [id, { name, description }] of Object.entries(DESIGN_NAMES)) {
        // Escape for regex
        const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Single-line regex matching: id: 'design-xxx-001', title: 'OLD', ... description: 'OLD',
        const regex = new RegExp(
            `(id:\\s*'${safeId}',\\s*title:\\s*')[^']*(',\\s*description:\\s*')[^']*(')`
        );

        const safeTitle = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const safeDesc = description.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        const patched = source.replace(regex, `$1${safeTitle}$2${safeDesc}$3`);
        if (patched !== source) {
            source = patched;
            patchCount++;
            console.log(`  ✓ ${id} → "${name}"`);
        } else {
            skipCount++;
        }
    }

    fs.writeFileSync(DATASTORE_PATH, source, 'utf8');
    console.log(`\n✅ Patched: ${patchCount} | Skipped (not found): ${skipCount}`);
    console.log('🎉 Done! Restart dev server to see updated design names.');
}

main();
