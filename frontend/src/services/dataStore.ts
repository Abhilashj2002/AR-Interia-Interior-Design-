import { Category, DesignModel, Booking, PaymentRecord, LikeRecord, CategoryEarning, ProfitLossPoint, Feedback, SiteTheme, User, RoomType, StyleType, CalculatorSettings } from '../types';
import { SAMPLE_MODELS, SHOWROOMS as INITIAL_SHOWROOMS, PACKAGES as DEFAULT_PACKAGES } from '../constants';
import { LUXURY_HOUSE, LUXURY_APARTMENT } from './luxuryShowcase';

export const STORAGE_KEYS = {
  categories: 'ar_interia_categories_v2',
  designs: 'ar_interia_designs_v5',
  bookings: 'ar_interia_bookings',
  inquiries: 'ar_interia_inquiries',
  payments: 'ar_interia_payments',
  likes: 'ar_interia_likes',
  feedbacks: 'ar_interia_feedbacks',
  theme: 'ar_interia_theme',
  users: 'ar_interia_users',
  showrooms: 'ar_interia_showrooms',
  showcases: 'ar_interia_showcases',
  catalog: 'ar_interia_catalog_v2',
  settings: 'ar_interia_settings_v2',
  services: 'ar_interia_services_v2',
  announcements: 'ar_interia_announcements',
  packages: 'ar_interia_packages',
  discountCodes: 'ar_interia_discount_codes',
  calculatorSettings: 'ar_interia_calculator_settings',
  calculationHistory: 'ar_interia_calculation_history',
  calculatorImageLibrary: 'ar_interia_calculator_image_library'
};

const DEFAULT_CALCULATOR_SETTINGS: CalculatorSettings = {
  baseSqftRate: 1500,
  categoryMultipliers: {
    'Apartment': 1.0,
    'Villa': 1.5,
    'Bathroom': 1.2,
    'Living Room': 1.1,
    'Kids Bedroom': 1.0,
    'Master Bedroom': 1.3,
    'Kitchen': 1.4,
    'Dining Area': 1.1,
    'Pooja Room': 1.2,
    'Gym': 1.5,
    'Spa': 1.6,
    'Classroom': 1.0,
    'Swimming Pool': 2.0,
    'Terrace': 1.1,
    'Balcony': 1.0,
    'Garden': 0.8,
    'Meeting Room': 1.2,
    'Home Theatre': 1.8,
    'Office Interior': 1.3,
    'Wardrobe': 1.2,
    'Guest Room': 1.1,
    'Epoxy Floor': 1.1
  },
  qualityMultipliers: {
    economy: 1.0,
    premium: 1.4,
    luxury: 1.8
  },
  shapeMultipliers: {
    'Rectangle': 1.0,
    'L-Shape': 1.15,
    'T-Shape': 1.25,
    'Custom': 1.4
  }
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readStorage = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const daysAgoIso = (days: number, hour = 10) => {
  const value = new Date();
  value.setDate(value.getDate() - days);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
};

// Sample customers data for admin dashboard
const SAMPLE_CUSTOMERS: User[] = [
  { id: 'cust-001', name: 'Rahul Sharma', email: 'rahul.sharma@email.com', role: 'customer', phone: '+91 98765 10001', createdAt: daysAgoIso(180), password: 'customer123' },
  { id: 'cust-002', name: 'Priya Patel', email: 'priya.patel@email.com', role: 'customer', phone: '+91 98765 10002', createdAt: daysAgoIso(155), password: 'customer123' },
  { id: 'cust-003', name: 'Amit Kumar', email: 'amit.kumar@email.com', role: 'customer', phone: '+91 98765 10003', createdAt: daysAgoIso(140), password: 'customer123' },
  { id: 'cust-004', name: 'Sneha Reddy', email: 'sneha.reddy@email.com', role: 'customer', phone: '+91 98765 10004', createdAt: daysAgoIso(120), password: 'customer123' },
  { id: 'cust-005', name: 'Vikram Singh', email: 'vikram.singh@email.com', role: 'customer', phone: '+91 98765 10005', createdAt: daysAgoIso(105), password: 'customer123' },
  { id: 'cust-006', name: 'Anjali Gupta', email: 'anjali.gupta@email.com', role: 'customer', phone: '+91 98765 10006', createdAt: daysAgoIso(92), password: 'customer123' },
  { id: 'cust-007', name: 'Rajesh Nair', email: 'rajesh.nair@email.com', role: 'customer', phone: '+91 98765 10007', createdAt: daysAgoIso(74), password: 'customer123' },
  { id: 'cust-008', name: 'Meera Joshi', email: 'meera.joshi@email.com', role: 'customer', phone: '+91 98765 10008', createdAt: daysAgoIso(61), password: 'customer123' },
  { id: 'cust-009', name: 'Sanjay Mishra', email: 'sanjay.mishra@email.com', role: 'customer', phone: '+91 98765 10009', createdAt: daysAgoIso(48), password: 'customer123' },
  { id: 'cust-010', name: 'Kavita Devi', email: 'kavita.devi@email.com', role: 'customer', phone: '+91 98765 10010', createdAt: daysAgoIso(35), password: 'customer123' }
];

const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'booking-seed-001',
    userId: 'cust-001',
    paymentId: 'pay-seed-001',
    designId: 'design-living-001',
    designName: 'Heritage Brass Drawing Room',
    categoryId: 'cat-living',
    price: 180000,
    cost: 144000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: daysAgoIso(24)
  },
  {
    id: 'booking-seed-002',
    userId: 'cust-001',
    paymentId: 'pay-seed-002',
    designId: 'design-kitchen-003',
    designName: 'Granite Island Gourmet',
    categoryId: 'cat-kitchen',
    price: 155000,
    cost: 124000,
    status: 'booked',
    paymentStatus: 'pending',
    createdAt: daysAgoIso(9)
  },
  {
    id: 'booking-seed-003',
    userId: 'cust-002',
    paymentId: 'pay-seed-003',
    designId: 'design-masterbedroom-002',
    designName: 'Golden Amber Dusk Suite',
    categoryId: 'cat-masterbedroom',
    price: 235000,
    cost: 188000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: daysAgoIso(18)
  },
  {
    id: 'booking-seed-004',
    userId: 'cust-003',
    paymentId: 'pay-seed-004',
    designId: 'design-balcony-004',
    designName: 'Glass Railing Sunset Lounge',
    categoryId: 'cat-balcony',
    price: 95000,
    cost: 76000,
    status: 'cancelled',
    paymentStatus: 'failed',
    createdAt: daysAgoIso(14)
  }
];

const SAMPLE_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-seed-001',
    bookingId: 'booking-seed-001',
    userId: 'cust-001',
    amount: 180000,
    provider: 'phonepe',
    status: 'success',
    createdAt: daysAgoIso(24),
    metadata: { source: 'seed' }
  },
  {
    id: 'pay-seed-002',
    bookingId: 'booking-seed-002',
    userId: 'cust-001',
    amount: 155000,
    provider: 'phonepe',
    status: 'pending',
    createdAt: daysAgoIso(9),
    metadata: { source: 'seed' }
  },
  {
    id: 'pay-seed-003',
    bookingId: 'booking-seed-003',
    userId: 'cust-002',
    amount: 235000,
    provider: 'phonepe',
    status: 'success',
    createdAt: daysAgoIso(18),
    metadata: { source: 'seed' }
  },
  {
    id: 'pay-seed-004',
    bookingId: 'booking-seed-004',
    userId: 'cust-003',
    amount: 95000,
    provider: 'phonepe',
    status: 'failed',
    createdAt: daysAgoIso(14),
    metadata: { source: 'seed' }
  }
];

const SAMPLE_FEEDBACKS: Feedback[] = [
  {
    id: 'feedback-seed-001',
    userId: 'cust-001',
    userName: 'Rahul Sharma',
    rating: 5,
    comment: 'Loved the living room concept and the admin approval process was smooth.',
    createdAt: daysAgoIso(20)
  },
  {
    id: 'feedback-seed-002',
    userId: 'cust-001',
    userName: 'Rahul Sharma',
    rating: 4,
    comment: 'Kitchen quote was clear and the discount flow worked well during booking.',
    createdAt: daysAgoIso(8)
  },
  {
    id: 'feedback-seed-003',
    userId: 'cust-002',
    userName: 'Priya Patel',
    rating: 5,
    comment: 'Bedroom execution and coordination were excellent from start to finish.',
    createdAt: daysAgoIso(16)
  }
];

const SAMPLE_LIKES: LikeRecord[] = [
  { id: 'like-seed-001', userId: 'cust-001', designId: 'design-living-001', value: 'like', createdAt: daysAgoIso(25) },
  { id: 'like-seed-002', userId: 'cust-001', designId: 'design-kitchen-003', value: 'like', createdAt: daysAgoIso(9) },
  { id: 'like-seed-003', userId: 'cust-002', designId: 'design-masterbedroom-002', value: 'like', createdAt: daysAgoIso(18) }
];

const enrichSeedUsers = (users: User[]) => users.map((user) => {
  const seed = SAMPLE_CUSTOMERS.find((item) => String(item.id || '') === String(user.id || '') || String(item.email || '').toLowerCase() === String(user.email || '').toLowerCase());
  if (!seed) return user;
  return {
    ...user,
    phone: user.phone || seed.phone,
    createdAt: user.createdAt || seed.createdAt,
    password: user.password || seed.password
  };
});

// Sample designs with names and prices for Living Room category
const SAMPLE_DESIGNS_WITH_PRICES: DesignModel[] = [
  // BATHROOM (10 designs) — bathroom1.jpg to bathroom10.jpg
  { id: 'design-bathroom-001', title: 'White Travertine Retreat', description: 'Floor-to-ceiling travertine with freestanding soaking tub.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom1.jpg', price: 125000, cost: 100000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom1.jpg'] },
  { id: 'design-bathroom-002', title: 'Monsoon Rainfall Bath', description: 'Tropical open shower with rainfall head and teak accents.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom2.jpg', price: 135000, cost: 105000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom2.jpg'] },
  { id: 'design-bathroom-003', title: 'Onyx Noir Sanctuary', description: 'Dark onyx walls with backlit mirror and stone basin.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom3.jpg', price: 145000, cost: 115000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom3.jpg'] },
  { id: 'design-bathroom-004', title: 'Ivory Cascade Spa Bath', description: 'Ivory-toned bath with cascading waterfall mixer fittings.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom4.jpg', price: 140000, cost: 110000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom4.jpg'] },
  { id: 'design-bathroom-005', title: 'Cobalt Mosaic Retreat', description: 'Deep blue mosaic tiles with polished chrome fixtures.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom5.jpg', price: 150000, cost: 120000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom5.jpg'] },
  { id: 'design-bathroom-006', title: 'Zen Pebble Wellness Room', description: 'Japanese pebble floor bath with bamboo wall panels.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom6.jpg', price: 130000, cost: 102000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom6.jpg'] },
  { id: 'design-bathroom-007', title: 'Rose Gold Luxe Bath', description: 'Rose gold fixtures with swirled marble and vessel sink.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom7.jpg', price: 155000, cost: 125000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom7.jpg'] },
  { id: 'design-bathroom-008', title: 'Slate Charcoal Master Bath', description: 'Charcoal slate panels with floating vanity and LED strip.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom8.jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom8.jpg'] },
  { id: 'design-bathroom-009', title: 'Teak Warmth Wetroom', description: 'Warm teak wood slats with an open walk-in shower area.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom9.jpg', price: 142000, cost: 113000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom9.jpg'] },
  { id: 'design-bathroom-010', title: 'Crystal Frosted Spa Lounge', description: 'Frosted glass partitions with crystal pendant lighting.', category: RoomType.BATHROOM, categoryId: 'cat-bathroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Bathroom/bathroom10.jpg', price: 138000, cost: 110000, status: 'active', availabilityStatus: 'available', images: ['/category/Bathroom/bathroom10.jpg'] },
  // LIVING ROOM (10 designs)
  { id: 'design-living-001', title: 'Heritage Brass Drawing Room', description: 'Rich brass accents with Chesterfield sofa and carved wall panels.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living1.jpg', price: 180000, cost: 144000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living1.jpg'] },
  { id: 'design-living-002', title: 'Ivory Boucle Parlour', description: 'Cream boucle sofas with fluted plaster walls and arch shelving.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living2.jpg', price: 200000, cost: 160000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living2.jpg'] },
  { id: 'design-living-003', title: 'Walnut Panel Grand Hall', description: 'Floor-to-ceiling walnut wood with a statement ceiling medallion.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living3.jpg', price: 220000, cost: 176000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living3.jpg'] },
  { id: 'design-living-004', title: 'Silver Oak Minimalist Lounge', description: 'Silver oak tones with low-profile furniture and abstract art.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living4.jpg', price: 190000, cost: 152000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living4.jpg'] },
  { id: 'design-living-005', title: 'Emerald Velvet Royale', description: 'Deep emerald velvet seating with gilded coffee table.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living5.jpg', price: 195000, cost: 156000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living5.jpg'] },
  { id: 'design-living-006', title: 'Crystal Chandelier Parlour', description: 'Cascading crystal chandelier above curved sectional sofa.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living6.jpg', price: 185000, cost: 148000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living6.jpg'] },
  { id: 'design-living-007', title: 'Mahogany Gentleman\'s Lounge', description: 'Dark mahogany shelving with cognac leather armchairs.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living7.jpg', price: 205000, cost: 164000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living7.jpg'] },
  { id: 'design-living-008', title: 'Japandi Stone Living', description: 'Washi walls, raked stone tray, and low platform seating.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living8.jpg', price: 175000, cost: 140000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living8.jpg'] },
  { id: 'design-living-009', title: 'Terracotta Jali Gallery Hall', description: 'Terracotta hues with carved jali divider and block-print cushions.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living9.jpg', price: 210000, cost: 168000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living9.jpg'] },
  { id: 'design-living-010', title: 'Sunlit Atrium Courtyard', description: 'Skylight-lit atrium lounge with tropical plants and white walls.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Living room/living10.jpg', price: 188000, cost: 150000, status: 'active', availabilityStatus: 'available', images: ['/category/Living room/living10.jpg'] },
  { id: 'design-living-011', title: 'Azure Horizon Coastal Suite', description: 'Azure horizon views from a plush navy sectional, featuring a minimalist TV console and floor-to-ceiling vistas.', category: RoomType.LIVING, categoryId: 'cat-living', style: StyleType.MODERN, modelUrl: '', previewImage: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200', price: 250000, cost: 200000, status: 'active', availabilityStatus: 'available', images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200'] },
  // BEDROOM (10 designs)
  { id: 'design-bedroom-001', title: 'Pastel Carousel Suite', description: 'Soft lilac walls with carousel mural and cloud-shaped shelves.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom1.jpg', price: 165000, cost: 132000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom1.jpg'] },
  { id: 'design-bedroom-002', title: 'Adventurer Bunk Cabin', description: 'Pine bunk beds with built-in ladder and map wallpaper.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom2.jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom2.jpg'] },
  { id: 'design-bedroom-003', title: 'Storybook Attic Nook', description: 'Sloped ceiling nook styled like a fairytale cottage interior.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom3.jpg', price: 170000, cost: 136000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom3.jpg'] },
  { id: 'design-bedroom-004', title: 'Sunshine Yellow Playroom', description: 'Sunny yellow walls with chalkboard panel and plush play mat.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom4.jpg', price: 180000, cost: 144000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom4.jpg'] },
  { id: 'design-bedroom-005', title: 'Galaxy Star Loft', description: 'Navy ceiling with fibre-optic stars and space-theme decor.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom5.jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom5.jpg'] },
  { id: 'design-bedroom-006', title: 'Candy Pop Mint Room', description: 'Mint green walls with candy-stripe rug and bubble chair.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom6.jpg', price: 175000, cost: 140000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom6.jpg'] },
  { id: 'design-bedroom-007', title: 'Cloud Nine Canopy Bed', description: 'White canopy bed with cloud-print drapes and cotton rug.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom7.jpg', price: 172000, cost: 137000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom7.jpg'] },
  { id: 'design-bedroom-008', title: 'Rainbow Mural Loft Bed', description: 'Lofted bed with rainbow wall mural and study nook below.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom8.jpg', price: 185000, cost: 148000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom8.jpg'] },
  { id: 'design-bedroom-009', title: 'Forest Treehouse Room', description: 'Nature mural with wooden bed frame and lantern pendant lights.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom9.jpg', price: 168000, cost: 134000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom9.jpg'] },
  { id: 'design-bedroom-010', title: 'Little Royal Prince Suite', description: 'Crown motif headboard with blue velvet and gold star details.', category: RoomType.KIDS, categoryId: 'cat-bedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kids-bedroom/kids-bedroom10.jpg', price: 190000, cost: 152000, status: 'active', availabilityStatus: 'available', images: ['/category/Kids-bedroom/kids-bedroom10.jpg'] },
  // MASTER BEDROOM (5 designs)
  { id: 'design-masterbedroom-001', title: 'Four-Poster Canopy Suite', description: 'Teak four-poster bed with silk drape and hand-knotted rug.', category: RoomType.MASTERBEDROOM, categoryId: 'cat-masterbedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Master Bedroom/master-bedroom1.jpg', price: 225000, cost: 180000, status: 'active', availabilityStatus: 'available', images: ['/category/Master Bedroom/master-bedroom1.jpg'] },
  { id: 'design-masterbedroom-002', title: 'Golden Amber Dusk Suite', description: 'Amber-toned walls with brass bedside lights and plush headboard.', category: RoomType.MASTERBEDROOM, categoryId: 'cat-masterbedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Master Bedroom/master-bedroom2.jpg', price: 235000, cost: 188000, status: 'active', availabilityStatus: 'available', images: ['/category/Master Bedroom/master-bedroom2.jpg'] },
  { id: 'design-masterbedroom-003', title: 'Platinum Walk-In Retreat', description: 'White platinum palette with floor-to-ceiling wardrobe panels.', category: RoomType.MASTERBEDROOM, categoryId: 'cat-masterbedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Master Bedroom/master-bedroom3.jpg', price: 228000, cost: 182000, status: 'active', availabilityStatus: 'available', images: ['/category/Master Bedroom/master-bedroom3.jpg'] },
  { id: 'design-masterbedroom-004', title: 'Vaulted Cathedral Suite', description: 'Exposed beam vaulted ceiling with grey linen and nature palette.', category: RoomType.MASTERBEDROOM, categoryId: 'cat-masterbedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Master Bedroom/master-bedroom4.jpg', price: 240000, cost: 192000, status: 'active', availabilityStatus: 'available', images: ['/category/Master Bedroom/master-bedroom4.jpg'] },
  { id: 'design-masterbedroom-005', title: 'Moonlit Japandi Haven', description: 'Wabi-sabi textures with pampas grass and low Japanese platform bed.', category: RoomType.MASTERBEDROOM, categoryId: 'cat-masterbedroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Master Bedroom/master-bedroom5.jpg', price: 232000, cost: 186000, status: 'active', availabilityStatus: 'available', images: ['/category/Master Bedroom/master-bedroom5.jpg'] },
  // KITCHEN (10 designs)
  { id: 'design-kitchen-001', title: 'White Quartz Chef Studio', description: 'White quartz island with brass tap and open floating shelves.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen1.jpg', price: 145000, cost: 116000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen1.jpg'] },
  { id: 'design-kitchen-002', title: 'Stainless Pro Cook Hall', description: 'Pro-grade stainless counters with handle-less sleek cabinetry.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen2.jpg', price: 138000, cost: 110000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen2.jpg'] },
  { id: 'design-kitchen-003', title: 'Granite Island Gourmet', description: 'Black granite island with pendant lights and wine rack.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen3.jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen3.jpg'] },
  { id: 'design-kitchen-004', title: 'Warm Brass Artisan Kitchen', description: 'Sage green cabinets with aged brass hardware and clay tiles.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen4.jpg', price: 148000, cost: 118000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen4.jpg'] },
  { id: 'design-kitchen-005', title: 'Midnight Lacquer Modular', description: 'Gloss black lacquer shutters with chrome appliance wall.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen5.jpg', price: 152000, cost: 121000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen5.jpg'] },
  { id: 'design-kitchen-006', title: 'Rustic Farmhouse Pantry', description: 'Open shelving with brick backsplash and apron farmhouse sink.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen6.jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen6.jpg'] },
  { id: 'design-kitchen-007', title: 'Scandinavian Light Kitchen', description: 'Off-white Scandi kitchen with rattan pendants and oak stools.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen7.jpg', price: 142000, cost: 113000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen7.jpg'] },
  { id: 'design-kitchen-008', title: 'Compact Smart Galley', description: 'Space-efficient galley with fold-out dining countertop.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen8.jpg', price: 135000, cost: 108000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen8.jpg'] },
  { id: 'design-kitchen-009', title: 'Coastal Seafoam Kitchen', description: 'Seafoam blue cabinets with white subway tile and wicker accents.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen9.jpg', price: 158000, cost: 126000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen9.jpg'] },
  { id: 'design-kitchen-010', title: 'Italian Calacatta Kitchen', description: 'Calacatta marble slabs with fluted island and statement hood.', category: RoomType.KITCHEN, categoryId: 'cat-kitchen', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Kitchen/kitchen10.jpg', price: 165000, cost: 132000, status: 'active', availabilityStatus: 'available', images: ['/category/Kitchen/kitchen10.jpg'] },
  // DINING AREA (10 designs)
  { id: 'design-dining-001', title: 'Grand Ebony Feast Hall', description: 'Ebony-top dining table seating twelve with leather chairs.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room1.jpg', price: 135000, cost: 108000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room1.jpg'] },
  { id: 'design-dining-002', title: 'Crystal Pendant Banquet', description: 'Cascading crystal pendant above oval dining table for eight.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room2.jpg', price: 148000, cost: 118000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room2.jpg'] },
  { id: 'design-dining-003', title: 'Carrara Marble Supper Club', description: 'White Carrara marble table with velvet barrel chairs.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room3.jpg', price: 142000, cost: 113000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room3.jpg'] },
  { id: 'design-dining-004', title: 'Tuscan Ochre Trattoria', description: 'Ochre walls, terracotta floor, and wrought-iron candelabra.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room4.jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room4.jpg'] },
  { id: 'design-dining-005', title: 'Art Deco Lacquer Banquet', description: 'Black lacquer Art Deco dining with geometric brass inserts.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room5.jpg', price: 158000, cost: 126000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room5.jpg'] },
  { id: 'design-dining-006', title: 'Candlelit Intimate Nook', description: 'Cosy four-seat nook with sage drapes and tapered candles.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room6.jpg', price: 145000, cost: 116000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room6.jpg'] },
  { id: 'design-dining-007', title: 'Rosewood Family Feast', description: 'Rosewood extendable table with upholstered bench and chairs.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room7.jpg', price: 152000, cost: 121000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room7.jpg'] },
  { id: 'design-dining-008', title: 'Nordic Birch Bright Diner', description: 'Birch table with Wegner-style chairs and pendant rattan light.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room8.jpg', price: 138000, cost: 110000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room8.jpg'] },
  { id: 'design-dining-009', title: 'Mughal Arch Darbar Dining', description: 'Arched door surround with blue ceramic tableware and jali screen.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room9.jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room9.jpg'] },
  { id: 'design-dining-010', title: 'Open Villa Terrace Dining', description: 'Garden-view open dining with teak furniture and linen drapes.', category: RoomType.DINING, categoryId: 'cat-dining', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Diningroom/dining-room10.jpg', price: 165000, cost: 132000, status: 'active', availabilityStatus: 'available', images: ['/category/Diningroom/dining-room10.jpg'] },
  // POOJA / MEDITATION (10 designs)
  { id: 'design-pooja-001', title: 'Tulsi Courtyard Mandir', description: 'Recessed mandir with tulsi platform, brass diya, and carved surround.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room1.jpg', price: 95000, cost: 76000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room1.jpg'] },
  { id: 'design-pooja-002', title: 'Gold Leaf Temple Alcove', description: 'Gold-leaf finish alcove with flower inlay and soft warm lighting.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room2.jpg', price: 105000, cost: 84000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room2.jpg'] },
  { id: 'design-pooja-003', title: 'Sandalwood Carved Shrine', description: 'Hand-carved sandalwood panels with incense niche and bell hook.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room3.jpg', price: 110000, cost: 88000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room3.jpg'] },
  { id: 'design-pooja-004', title: 'Diya Glow Meditation Corner', description: 'Diya-lit low platform with jute mat and terracotta oil lamps.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room4.jpg', price: 100000, cost: 80000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room4.jpg'] },
  { id: 'design-pooja-005', title: 'White Lotus Zen Sanctum', description: 'White marble floor with lotus motif and minimalist shrine shelf.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room5.jpg', price: 98000, cost: 78000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room5.jpg'] },
  { id: 'design-pooja-006', title: 'Teak Jali Carved Mandir', description: 'Full-height teak jali doors concealing an inner shrine cabinet.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room6.jpg', price: 108000, cost: 86000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room6.jpg'] },
  { id: 'design-pooja-007', title: 'White Marble Puja Hall', description: 'Pristine white marble puja hall with brass peacock deity stand.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room7.jpg', price: 102000, cost: 81000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room7.jpg'] },
  { id: 'design-pooja-008', title: 'Rajasthani Jharokha Shrine', description: 'Jharokha-framed shrine with blue pottery accents and mirror work.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room8.jpg', price: 112000, cost: 89000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room8.jpg'] },
  { id: 'design-pooja-009', title: 'Temple Bell Tower Sanctum', description: 'Mini tower with brass bells, red silk drapes, and stone idol base.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room9.jpg', price: 107000, cost: 85000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room9.jpg'] },
  { id: 'design-pooja-010', title: 'Copper Diya Niche Room', description: 'Copper-lined niche with oil diyas and hand-painted mandala wall.', category: RoomType.POOJA, categoryId: 'cat-pooja', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Pooja room/pooja-room10.jpg', price: 103000, cost: 82000, status: 'active', availabilityStatus: 'available', images: ['/category/Pooja room/pooja-room10.jpg'] },
  // GYM (10 designs)
  { id: 'design-gym-001', title: 'Dark Knight Powerhouse', description: 'Black rubber floor with mirrored wall and heavy iron rack setup.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (1).jpg', price: 120000, cost: 96000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (1).jpg'] },
  { id: 'design-gym-002', title: 'Industrial Steel Forge Gym', description: 'Exposed brick and steel beams with suspended heavy bag.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (2).jpg', price: 130000, cost: 104000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (2).jpg'] },
  { id: 'design-gym-003', title: 'White Minimalist Wellness Studio', description: 'All-white studio gym with cable machine and yoga mat zone.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (3).jpg', price: 125000, cost: 100000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (3).jpg'] },
  { id: 'design-gym-004', title: 'Midnight Circuit Loft Gym', description: 'Dark loft gym with neon accent lighting and cardio zone.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (4).jpg', price: 128000, cost: 102000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (4).jpg'] },
  { id: 'design-gym-005', title: 'Tropical Open Air Gym', description: 'Breezeway gym with bamboo ceiling and outdoor equipment pods.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (5).jpg', price: 135000, cost: 108000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (5).jpg'] },
  { id: 'design-gym-006', title: 'Champion Elite Training Room', description: 'Competition-grade flooring with wall battle ropes and pull-up rig.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (6).jpg', price: 122000, cost: 97000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (6).jpg'] },
  { id: 'design-gym-007', title: 'Slate Grey Strength Studio', description: 'Slate grey walls, platform lifting area, and LED timing display.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (7).jpg', price: 132000, cost: 105000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (7).jpg'] },
  { id: 'design-gym-008', title: 'Holistic Yoga Zen Studio', description: 'Natural wood floor with calming green wall and meditation altar.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (8).jpg', price: 118000, cost: 94000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (8).jpg'] },
  { id: 'design-gym-009', title: 'Scandinavian Light Fitness Room', description: 'Birch wood accents with Nordic-style minimalist equipment setup.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (9).jpg', price: 127000, cost: 101000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (9).jpg'] },
  { id: 'design-gym-010', title: 'VIP Mirror Box Gym', description: 'Four-wall mirror boxing gym with leather punch bag and ring mat.', category: RoomType.GYM, categoryId: 'cat-gym', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Gym/gym (10).jpg', price: 140000, cost: 112000, status: 'active', availabilityStatus: 'available', images: ['/category/Gym/gym (10).jpg'] },
  // SPA (10 designs)
  { id: 'design-spa-001', title: 'Himalayan Salt Stone Spa', description: 'Pink Himalayan salt wall with warm stone therapy table and candlelight.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (1).jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (1).jpg'] },
  { id: 'design-spa-002', title: 'Bamboo Leaf Serenity Room', description: 'Bamboo-lined walls with pebble floor path and rain mist ceiling.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (2).jpg', price: 165000, cost: 132000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (2).jpg'] },
  { id: 'design-spa-003', title: 'White Cocoon Flotation Suite', description: 'Curved white walls with flotation pod and soft ambient lighting.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (3).jpg', price: 158000, cost: 126000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (3).jpg'] },
  { id: 'design-spa-004', title: 'Ayurvedic Teak Abhyanga Room', description: 'Teak droni table with oil reserve and copper vessel accents.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (4).jpg', price: 162000, cost: 129000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (4).jpg'] },
  { id: 'design-spa-005', title: 'Nordic Ice Plunge Sauna', description: 'Spruce wood sauna with cold plunge tub and heated stone bench.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (5).jpg', price: 168000, cost: 134000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (5).jpg'] },
  { id: 'design-spa-006', title: 'Jade Stone Couple\'s Suite', description: 'Jade-green tile panels with two heated massage tables and silk drapes.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (6).jpg', price: 152000, cost: 121000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (6).jpg'] },
  { id: 'design-spa-007', title: 'Dark Forest Relaxation Room', description: 'Moss wall installation with recessed pool and birch branch pendant.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (7).jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (7).jpg'] },
  { id: 'design-spa-008', title: 'Moroccan Hammam Suite', description: 'Zellige tile walls with marble slab and arched shower steam area.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (8).jpg', price: 156000, cost: 125000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (8).jpg'] },
  { id: 'design-spa-009', title: 'Sakura Blossom Wellness Room', description: 'Cherry blossom mural room with tatami mat and soaking tub.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (9).jpg', price: 170000, cost: 136000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (9).jpg'] },
  { id: 'design-spa-010', title: 'Crystal Quartz Healing Studio', description: 'White quartz crystals, sound bowl shelf, and diffused soft lighting.', category: RoomType.SPA, categoryId: 'cat-spa', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Spa/spa room (10).jpg', price: 154000, cost: 123000, status: 'active', availabilityStatus: 'available', images: ['/category/Spa/spa room (10).jpg'] },
  // CLASSROOM (10 designs)
  { id: 'design-classroom-001', title: 'Smart Flex Learning Hub', description: 'Modular desks with digital whiteboard and acoustic ceiling tiles.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom1.jpg', price: 105000, cost: 84000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom1.jpg'] },
  { id: 'design-classroom-002', title: 'Heritage Oak Study Hall', description: 'Timber-panelled study hall with arched windows and tiered seating.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom2.jpg', price: 115000, cost: 92000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom2.jpg'] },
  { id: 'design-classroom-003', title: 'Bright STEM Discovery Room', description: 'Vibrant STEM lab with maker station, robotics bench, and globe map.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom3.jpg', price: 110000, cost: 88000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom3.jpg'] },
  { id: 'design-classroom-004', title: 'Collaborative Creative Studio', description: 'Breakout pods with writable glass walls and mobile whiteboards.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom4.jpg', price: 118000, cost: 94000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom4.jpg'] },
  { id: 'design-classroom-005', title: 'Montessori Nature Classroom', description: 'Nature-themed room with low shelves, rugs, and living plant wall.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom5.jpg', price: 112000, cost: 89000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom5.jpg'] },
  { id: 'design-classroom-006', title: 'Amphitheatre Lecture Hall', description: 'Tiered seating amphitheatre with projection screen and soft lighting.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom6.jpg', price: 100000, cost: 80000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom6.jpg'] },
  { id: 'design-classroom-007', title: 'Digital Innovation Lab', description: 'Curved desks with dual monitors, server rack display, and LED strips.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom7.jpg', price: 120000, cost: 96000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom7.jpg'] },
  { id: 'design-classroom-008', title: 'Waldorf Warm Learning Room', description: 'Organic wood furniture with watercolour art wall and floor cushions.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom8.jpg', price: 108000, cost: 86000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom8.jpg'] },
  { id: 'design-classroom-009', title: 'Daylight Bright Study Space', description: 'Floor-to-ceiling windows with sit-stand desks and colour-coded cubbies.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom9.jpg', price: 116000, cost: 92000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom9.jpg'] },
  { id: 'design-classroom-010', title: 'Global Culture Seminar Room', description: 'World map mural with round table and flag display along the cornice.', category: RoomType.CLASSROOM, categoryId: 'cat-classroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Classroom/classroom10.jpg', price: 122000, cost: 97000, status: 'active', availabilityStatus: 'available', images: ['/category/Classroom/classroom10.jpg'] },
  // SWIMMING POOL (10 designs)
  { id: 'design-pool-001', title: 'Infinity Sky Pool Deck', description: 'Infinity edge pool with city view and teak sun loungers.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool1 - Copy.jpg', price: 180000, cost: 144000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool1 - Copy.jpg'] },
  { id: 'design-pool-002', title: 'Turquoise Villa Plunge Pool', description: 'Compact villa plunge pool with blue mosaic tile and pergola.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool2 - Copy.jpg', price: 185000, cost: 148000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool2 - Copy.jpg'] },
  { id: 'design-pool-003', title: 'Roman Colonnade Lap Pool', description: 'Colonnaded lap pool with travertine coping and antique urns.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool3 - Copy.jpg', price: 195000, cost: 156000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool3 - Copy.jpg'] },
  { id: 'design-pool-004', title: 'Tropical Lagoon Pool Garden', description: 'Free-form pool surrounded by palm trees and natural stone edging.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool4 - Copy.jpg', price: 175000, cost: 140000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool4 - Copy.jpg'] },
  { id: 'design-pool-005', title: 'Glass-Wall Indoor Pool Suite', description: 'Heated indoor pool with glass wall and heated sandstone floor.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool5 - Copy.jpg', price: 182000, cost: 145000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool5 - Copy.jpg'] },
  { id: 'design-pool-006', title: 'Midnight Starlight Pool', description: 'Dark-bottomed infinity pool with fibre-optic star deck and fire pit.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool6 - Copy.jpg', price: 188000, cost: 150000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool6 - Copy.jpg'] },
  { id: 'design-pool-007', title: 'Bali Pavilion Resort Pool', description: 'Bali-style pool with pavilion, lotus pond, and stone carvings.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool7 - Copy.jpg', price: 192000, cost: 153000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool7 - Copy.jpg'] },
  { id: 'design-pool-008', title: 'Olympic Blue Lane Pool', description: 'Competition-grade lane pool with lane ropes and timing blocks.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool8 - Copy.jpg', price: 198000, cost: 158000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool8 - Copy.jpg'] },
  { id: 'design-pool-009', title: 'Emerald Rooftop Pool Terrace', description: 'Rooftop pool with glass panel fencing and panoramic skyline view.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool9 - Copy.jpg', price: 205000, cost: 164000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool9 - Copy.jpg'] },
  { id: 'design-pool-010', title: 'Cascading Waterfall Pool', description: 'Tiered cascade waterfall pool with grotto alcove and spa overflow.', category: RoomType.POOL, categoryId: 'cat-pool', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Swimming pool/swimmingpool10 - Copy.jpg', price: 200000, cost: 160000, status: 'active', availabilityStatus: 'available', images: ['/category/Swimming pool/swimmingpool10 - Copy.jpg'] },
  // TERRACE (10 designs)
  { id: 'design-terrace-001', title: 'Skyline Rooftop Lounge', description: 'Terrace lounge with string lights, sectional, and city panorama.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (1).jpg', price: 140000, cost: 112000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (1).jpg'] },
  { id: 'design-terrace-002', title: 'Jungle Canopy Terrace', description: 'Green canopy terrace with hanging plants and rattan egg chairs.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (2).jpg', price: 150000, cost: 120000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (2).jpg'] },
  { id: 'design-terrace-003', title: 'Pergola Shade Dining Deck', description: 'Slatted pergola over teak dining set with planter boxes.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (3).jpg', price: 145000, cost: 116000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (3).jpg'] },
  { id: 'design-terrace-004', title: 'Zen Pebble Meditation Deck', description: 'Zen pebble arrangement terrace with low seating and water feature.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (4).jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (4).jpg'] },
  { id: 'design-terrace-005', title: 'Bonfire Campfire Deck', description: 'Sunken fire pit terrace with Adirondack chairs and warm lanterns.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (5).jpg', price: 138000, cost: 110000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (5).jpg'] },
  { id: 'design-terrace-006', title: 'Coastal Sundowner Deck', description: 'White-washed terrace with hammock, wicker, and sea-view backdrop.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (6).jpg', price: 142000, cost: 113000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (6).jpg'] },
  { id: 'design-terrace-007', title: 'Evening Cocktail Rooftop', description: 'Bar-height terrace with cocktail counter, LED ambiance, and city view.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (7).jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (7).jpg'] },
  { id: 'design-terrace-008', title: 'Bohemian Macramé Terrace', description: 'Boho terrace with macramé backdrop, floor cushions, and potted herbs.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (1).jpg', price: 148000, cost: 118000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (1).jpg'] },
  { id: 'design-terrace-009', title: 'Glass Fence Infinity Deck', description: 'Frameless glass railing terrace with infinity horizon and sunrise seat.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (2).jpg', price: 152000, cost: 121000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (2).jpg'] },
  { id: 'design-terrace-010', title: 'Monsoon Rain Shelter Terrace', description: 'Covered terrace with clear polycarbonate roof and rain curtain effect.', category: RoomType.TERRACE, categoryId: 'cat-terrace', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Terrace/terrace (3).jpg', price: 158000, cost: 126000, status: 'active', availabilityStatus: 'available', images: ['/category/Terrace/terrace (3).jpg'] },
  // GARDEN (10 designs)
  { id: 'design-garden-001', title: 'English Cottage Rose Garden', description: 'Hedged rose garden with stone path, arch trellis, and bench seat.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (1).jpg', price: 95000, cost: 76000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (1).jpg'] },
  { id: 'design-garden-002', title: 'Zen Rock Sand Garden', description: 'Japanese karesansui with raked sand, bonsai and lantern focal.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (2).jpg', price: 105000, cost: 84000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (2).jpg'] },
  { id: 'design-garden-003', title: 'Mughal Char Bagh Garden', description: 'Four-quadrant char bagh with fountain pond and symmetrical hedges.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (3).jpg', price: 100000, cost: 80000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (3).jpg'] },
  { id: 'design-garden-004', title: 'Tropical Botanical Garden', description: 'Dense tropical planting with fern wall, banana palm and stone path.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (4).jpg', price: 110000, cost: 88000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (4).jpg'] },
  { id: 'design-garden-005', title: 'Wildflower Meadow Garden', description: 'Wildflower meadow with stepping stones and a birdbath centrepiece.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (5).jpg', price: 115000, cost: 92000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (5).jpg'] },
  { id: 'design-garden-006', title: 'Herb Kitchen Garden', description: 'Raised planter beds with herb varieties and terracotta pots.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (6).jpg', price: 98000, cost: 78000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (6).jpg'] },
  { id: 'design-garden-007', title: 'Modern Geometric Garden', description: 'Box hedging in geometric squares with gravel fill and cube sculptures.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (7).jpg', price: 108000, cost: 86000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (7).jpg'] },
  { id: 'design-garden-008', title: 'Bamboo Privacy Garden', description: 'Tall bamboo grove hedge with poured concrete patio and black steel planters.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (8).jpg', price: 102000, cost: 81000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (8).jpg'] },
  { id: 'design-garden-009', title: 'Lotus Pond Water Garden', description: 'Koi pond with lotus blooms, stepping stones and weeping willow.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (9).jpg', price: 112000, cost: 89000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (9).jpg'] },
  { id: 'design-garden-010', title: 'Bougainvillea Pergola Garden', description: 'Bright bougainvillea pergola with jasmine borders and mosaic path.', category: RoomType.GARDEN, categoryId: 'cat-garden', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Garden/garden (10).jpg', price: 106000, cost: 84000, status: 'active', availabilityStatus: 'available', images: ['/category/Garden/garden (10).jpg'] },
  // MEETING ROOM (10 designs)
  { id: 'design-meeting-001', title: 'Boardroom Executive Suite', description: 'Long boardroom table with leather chairs and glass wall partition.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (1).jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (1).jpg'] },
  { id: 'design-meeting-002', title: 'Walnut Prestige Council Room', description: 'Walnut panel walls with integrated AV screen and credenza.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (2).jpg', price: 145000, cost: 116000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (2).jpg'] },
  { id: 'design-meeting-003', title: 'Glass Agile Huddle Room', description: 'All-glass cubicle huddle room with writable walls and soft seating.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (3).jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (3).jpg'] },
  { id: 'design-meeting-004', title: 'Creative Breakout Lounge', description: 'Informal meeting nook with curved sofa and large low coffee table.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (4).jpg', price: 150000, cost: 120000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (4).jpg'] },
  { id: 'design-meeting-005', title: 'Acoustically Lined Quiet Room', description: 'Fabric acoustic panels with pod seating, green wall and LED lighting.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (5).jpg', price: 140000, cost: 112000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (5).jpg'] },
  { id: 'design-meeting-006', title: 'Stone Arch Conference Hall', description: 'Stone arch conference hall seating thirty with projector and gallery.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (6).jpg', price: 148000, cost: 118000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (6).jpg'] },
  { id: 'design-meeting-007', title: 'Navy Blue Strategy Room', description: 'Navy blue fitted room with whiteboard wall and remote collaboration screen.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (7).jpg', price: 165000, cost: 132000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (7).jpg'] },
  { id: 'design-meeting-008', title: 'Biophilic Green Meeting Space', description: 'Lush indoor planting meeting zone with rattan chairs and pendant pot.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (8).jpg', price: 135000, cost: 108000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (8).jpg'] },
  { id: 'design-meeting-009', title: 'Industrial Loft Meeting Room', description: 'Exposed brick and duct loft meeting room with Edison bulb chandelier.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (9).jpg', price: 142000, cost: 113000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (9).jpg'] },
  { id: 'design-meeting-010', title: 'Panoramic Corner Suite', description: 'Corner office meeting room with floor-to-ceiling glass city view.', category: RoomType.MEETING, categoryId: 'cat-meeting', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Meeting room/meeting room (10).jpg', price: 170000, cost: 136000, status: 'active', availabilityStatus: 'available', images: ['/category/Meeting room/meeting room (10).jpg'] },
  // HOME THEATRE (10 designs)
  { id: 'design-theatre-001', title: 'Midnight Velvet Cinema Room', description: 'Midnight blue velvet recliner rows with star-ceiling and 4K screen.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (1).jpg', price: 210000, cost: 168000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (1).jpg'] },
  { id: 'design-theatre-002', title: 'Burgundy Plush Screening Den', description: 'Burgundy plush seating with Dolby Atmos raised platform arrangement.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (2).jpg', price: 220000, cost: 176000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (2).jpg'] },
  { id: 'design-theatre-003', title: 'Leather Club Movie Lounge', description: 'Tobacco leather recliners with side tables and acoustic wall art.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (3).jpg', price: 215000, cost: 172000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (3).jpg'] },
  { id: 'design-theatre-004', title: 'Stadium Seating Home Cinema', description: 'Three-row stadium seating with immersive screen and LED floor path.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (4).jpg', price: 205000, cost: 164000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (4).jpg'] },
  { id: 'design-theatre-005', title: 'Acoustic Timber Media Room', description: 'Slatted timber acoustic walls with embedded surround speaker array.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (5).jpg', price: 200000, cost: 160000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (5).jpg'] },
  { id: 'design-theatre-006', title: 'Jewel-Tone Luxe Screening', description: 'Jewel-tone drapes, velvet seats, and raised projection screen focal.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (6).jpg', price: 195000, cost: 156000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (6).jpg'] },
  { id: 'design-theatre-007', title: 'Moonlight Dome Theatre', description: 'Curved dome ceiling with projection mapping and reclining pod seats.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (7).jpg', price: 218000, cost: 174000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (7).jpg'] },
  { id: 'design-theatre-008', title: 'Retro Drive-In Den', description: 'Retro vintage themed room with car-seat section and neon marquee sign.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (8).jpg', price: 225000, cost: 180000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (8).jpg'] },
  { id: 'design-theatre-009', title: 'Dolby Vision Gaming Theatre', description: 'Combined gaming and cinema with dual-purpose seating and race sim pod.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (9).jpg', price: 212000, cost: 169000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (9).jpg'] },
  { id: 'design-theatre-010', title: 'Hammam-Inspired Lounge Cinema', description: 'Arched alcove cinema with Moroccan lanterns and floor-level ottoman seating.', category: RoomType.THEATRE, categoryId: 'cat-theatre', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Home theatre/home theatre (10).jpg', price: 230000, cost: 184000, status: 'active', availabilityStatus: 'available', images: ['/category/Home theatre/home theatre (10).jpg'] },
  // OFFICE INTERIOR (10 designs)
  { id: 'design-office-001', title: 'Silicon Valley Open Hub', description: 'Modern open-plan office with acoustic pods and ergonomic workstations.', category: RoomType.OFFICE_INTERIOR, categoryId: 'cat-office', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Office interior/office interior (1).jpg', price: 145000, cost: 116000, status: 'active', availabilityStatus: 'available', images: ['/category/Office interior/office interior (1).jpg'] },
  { id: 'design-office-002', title: 'Executive Walnut Suite', description: 'Walnut desk with leather chair and floor-to-ceiling glass view.', category: RoomType.OFFICE_INTERIOR, categoryId: 'cat-office', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Office interior/office interior (2).jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Office interior/office interior (2).jpg'] },
  { id: 'design-office-003', title: 'Industrial Loft Workspace', description: 'Exposed brickwork with metal frame desks and Edison lighting.', category: RoomType.OFFICE_INTERIOR, categoryId: 'cat-office', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Office interior/office interior (3).jpg', price: 138000, cost: 110000, status: 'active', availabilityStatus: 'available', images: ['/category/Office interior/office interior (3).jpg'] },
  { id: 'design-office-004', title: 'Biophilic Collaborative Zone', description: 'Indoor plant walls with shared wooden project tables.', category: RoomType.OFFICE_INTERIOR, categoryId: 'cat-office', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Office interior/office interior (4).jpg', price: 150000, cost: 120000, status: 'active', availabilityStatus: 'available', images: ['/category/Office interior/office interior (4).jpg'] },
  { id: 'design-office-005', title: 'Minimalist Monochrome Studio', description: 'Sleek white desks with black ergonomic chairs and hidden cabling.', category: RoomType.OFFICE_INTERIOR, categoryId: 'cat-office', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Office interior/office interior (5).jpg', price: 142000, cost: 113000, status: 'active', availabilityStatus: 'available', images: ['/category/Office interior/office interior (5).jpg'] },
  { id: 'design-office-010', title: 'High-Tech Command Centre', description: 'Multi-monitor command desk with recliner chair and ambient backlighting.', category: RoomType.OFFICE_INTERIOR, categoryId: 'cat-office', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Office interior/office interior (10).jpg', price: 135000, cost: 108000, status: 'active', availabilityStatus: 'available', images: ['/category/Office interior/office interior (10).jpg'] },
  // BALCONY (5 designs)
  { id: 'design-balcony-001', title: 'Skyline Zen Balcony', description: 'Vertical garden with wooden deck and cushioned floor seating.', category: RoomType.BALCONY, categoryId: 'cat-balcony', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Balcony/balcony (1).jpg', price: 75000, cost: 60000, status: 'active', availabilityStatus: 'available', images: ['/category/Balcony/balcony (1).jpg'] },
  { id: 'design-balcony-002', title: 'Bohemian Swing Nook', description: 'Macramé swing with potted succulents and soft string lights.', category: RoomType.BALCONY, categoryId: 'cat-balcony', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Balcony/balcony (2).jpg', price: 82000, cost: 65000, status: 'active', availabilityStatus: 'available', images: ['/category/Balcony/balcony (2).jpg'] },
  { id: 'design-balcony-003', title: 'Morning Coffee Bistro', description: 'Small iron bistro set with artificial turf and herb boxes.', category: RoomType.BALCONY, categoryId: 'cat-balcony', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Balcony/balcony (3).jpg', price: 68000, cost: 54000, status: 'active', availabilityStatus: 'available', images: ['/category/Balcony/balcony (3).jpg'] },
  { id: 'design-balcony-004', title: 'Glass Railing Sunset Lounge', description: 'Frameless glass rail with low-profile rattan sofa and fire pit.', category: RoomType.BALCONY, categoryId: 'cat-balcony', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Balcony/balcony (4).jpg', price: 95000, cost: 76000, status: 'active', availabilityStatus: 'available', images: ['/category/Balcony/balcony (4).jpg'] },
  { id: 'design-balcony-005', title: 'Tropical Oasis Balcony', description: 'Large leafy palms with bamboo privacy screen and stone floor.', category: RoomType.BALCONY, categoryId: 'cat-balcony', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Balcony/balcony (5).jpg', price: 88000, cost: 70000, status: 'active', availabilityStatus: 'available', images: ['/category/Balcony/balcony (5).jpg'] },
  // WARDROBE (10 designs)
  { id: 'design-wardrobe-001', title: 'Walk-In Pearl White Wardrobe', description: 'Expansive walk-in wardrobe with pearl white finish and center island.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe1.jpg', price: 180000, cost: 144000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe1.jpg'] },
  { id: 'design-wardrobe-002', title: 'Midnight Ebony Sliding Closet', description: 'Sleek ebony sliding doors with integrated LED lighting and shelving.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe2.jpg', price: 175000, cost: 140000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe2.jpg'] },
  { id: 'design-wardrobe-003', title: 'Minimalist Oak Dressing Suite', description: 'Natural oak wood textures with minimalist open shelving design.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe3.jpg', price: 165000, cost: 132000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe3.jpg'] },
  { id: 'design-wardrobe-004', title: 'Industrial Metal Rack Wardrobe', description: 'Loft-style metal frame wardrobe with wire baskets and mesh panels.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe4.jpg', price: 140000, cost: 112000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe4.jpg'] },
  { id: 'design-wardrobe-005', title: 'Classic Teak Armoire', description: 'Traditional teak wood wardrobe with ornate carvings and brass handles.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe5.jpg', price: 195000, cost: 156000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe5.jpg'] },
  { id: 'design-wardrobe-006', title: 'Glass-Front Boutique Closet', description: 'Boutique-style wardrobe with glass doors and velvet-lined jewelry drawers.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe6.jpg', price: 210000, cost: 168000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe6.jpg'] },
  { id: 'design-wardrobe-007', title: 'Art Deco Gold Trim Wardrobe', description: 'Elegant wardrobe with champagne gold trimmings and geometric patterns.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe7.jpg', price: 220000, cost: 176000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe7.jpg'] },
  { id: 'design-wardrobe-008', title: 'Scandinavian Birch Closet', description: 'Light birch wood finish with clean lines and modular storage units.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe8.jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe8.jpg'] },
  { id: 'design-wardrobe-009', title: 'Island Centre Dressing Suite', description: 'Master dressing room with central island bureau and tiered hanging rails.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe9.jpg', price: 240000, cost: 192000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe9.jpg'] },
  { id: 'design-wardrobe-010', title: 'Cedar-Lined Premium Closet', description: 'Aromatic cedar-lined interior with temperature-controlled shoe racks.', category: RoomType.WARDROBE, categoryId: 'cat-wardrobe', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/wardrobe/wardrobe10.jpg', price: 230000, cost: 184000, status: 'active', availabilityStatus: 'available', images: ['/category/wardrobe/wardrobe10.jpg'] },
  // GUEST ROOM (10 designs)
  { id: 'design-guestroom-001', title: 'Terracotta Jaipur Haveli Room', description: 'Rajasthani haveli-inspired guest room with terracotta tiles and jali work.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room  (1).jpg', price: 145000, cost: 116000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room  (1).jpg'] },
  { id: 'design-guestroom-002', title: 'Indigo Batik Textile Suite', description: 'Blue batik textile wall panels with indigo fabrics and teak furniture.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (2).jpg', price: 138000, cost: 110000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (2).jpg'] },
  { id: 'design-guestroom-003', title: 'Mountain Cabin Retreat Room', description: 'Rustic wooden cabin theme with thick wool blankets and warm spotlighting.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (3).jpg', price: 155000, cost: 124000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (3).jpg'] },
  { id: 'design-guestroom-004', title: 'Coastal Driftwood Guest Suite', description: 'Light grey driftwood flooring with coastal decor and sheer white linen.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (4).jpg', price: 148000, cost: 118000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (4).jpg'] },
  { id: 'design-guestroom-005', title: 'Serene Lotus Petal Room', description: 'Lotus-inspired design with soft pink accents and curved headboard.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (5).jpg', price: 152000, cost: 121000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (5).jpg'] },
  { id: 'design-guestroom-006', title: 'Emerald Velvet Guest Lounge', description: 'Deep emerald velvet bedding with golden bedside lamps and dark walls.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (6).jpg', price: 160000, cost: 128000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (6).jpg'] },
  { id: 'design-guestroom-007', title: 'Heritage Brass Guest Quarters', description: 'Traditional quarters with brass metal bed frame and hand-painted trunks.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (7).jpg', price: 142000, cost: 113000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (7).jpg'] },
  { id: 'design-guestroom-008', title: 'Modern Japandi Guest Studio', description: 'Minimalist studio with low platform bed, paper lamp and tatami mat.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (8).jpg', price: 135000, cost: 108000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (8).jpg'] },
  { id: 'design-guestroom-009', title: 'Silk Road Boutique Room', description: 'Silk-lined walls with oriental patterns and luxury lacquered furniture.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (9).jpg', price: 158000, cost: 126000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (9).jpg'] },
  { id: 'design-guestroom-010', title: 'Sandstone Desert Oasis Room', description: 'Warm sandstone tones with desert photography and textured clay wall.', category: RoomType.GUESTROOM, categoryId: 'cat-guestroom', style: StyleType.MODERN, modelUrl: '', previewImage: '/category/Guest room/guest room (10).jpg', price: 165000, cost: 132000, status: 'active', availabilityStatus: 'available', images: ['/category/Guest room/guest room (10).jpg'] },
];

const createSeedCategories = (): Category[] => {
  const createdAt = new Date().toISOString();

  const isRawLikeName = (value: string) => {
    const name = String(value || '').trim();
    if (!name) return true;
    if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(name)) return true;
    if (/\bconcept\b\s*\d*$/i.test(name)) return true;
    if (/^[a-z\s_-]*\(?\d+\)?$/i.test(name)) return true;
    return false;
  };

  // Helper to generate image arrays from local files in public/category/
  const imgs = (folder: string, prefix: string, count: number, start = 1): Array<{ name: string; url: string }> =>
    Array.from({ length: count }, (_, i) => ({
      name: `${prefix}${start + i}.jpg`,
      url: `/category/${folder}/${prefix}${start + i}.jpg`
    }));

  // Helper for files with parentheses like "balcony (1).jpg"
  const imgsP = (folder: string, prefix: string, count: number, start = 1): Array<{ name: string; url: string }> =>
    Array.from({ length: count }, (_, i) => ({
      name: `${prefix} (${start + i}).jpg`,
      url: `/category/${folder}/${prefix} (${start + i}).jpg`
    }));

  const categories: Category[] = [
    // Bathroom: bathroom1.jpg – bathroom10.jpg (no parentheses)
    { id: 'cat-bathroom', title: 'Bathroom', description: 'Indian luxury bathroom designs with premium finishes.', image: '/category/Bathroom/bathroom1.jpg', thumbnail: '/category/Bathroom/bathroom1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('Bathroom', 'bathroom', 10) },

    // Living room: living1.jpg – living10.jpg
    { id: 'cat-living', title: 'Living Room', description: 'Premium Indian living room designs for homes and villas.', image: '/category/Living room/living1.jpg', thumbnail: '/category/Living room/living1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('Living room', 'living', 10) },

    // Kids-bedroom: kids-bedroom1.jpg – kids-bedroom10.jpg
    { id: 'cat-bedroom', title: 'Kids Bedroom', description: 'Luxury bedroom designs for villas and apartments.', image: '/category/Kids-bedroom/kids-bedroom1.jpg', thumbnail: '/category/Kids-bedroom/kids-bedroom1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('Kids-bedroom', 'kids-bedroom', 10) },

    // Master Bedroom: master-bedroom1.jpg – master-bedroom10.jpg
    { id: 'cat-masterbedroom', title: 'Master Bedroom', description: 'Signature master bedroom suites with luxury finishes.', image: '/category/Master Bedroom/master-bedroom1.jpg', thumbnail: '/category/Master Bedroom/master-bedroom1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('Master Bedroom', 'master-bedroom', 10) },

    // Kitchen: kitchen1.jpg – kitchen10.jpg
    { id: 'cat-kitchen', title: 'Kitchen', description: 'Modular and premium Indian kitchen designs.', image: '/category/Kitchen/kitchen1.jpg', thumbnail: '/category/Kitchen/kitchen1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('Kitchen', 'kitchen', 10) },

    // Diningroom: dining-room1.jpg – dining-room10.jpg
    { id: 'cat-dining', title: 'Dining Area', description: 'Luxury dining designs for apartments and villas.', image: '/category/Diningroom/dining-room1.jpg', thumbnail: '/category/Diningroom/dining-room1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('Diningroom', 'dining-room', 10) },

    // Pooja room: pooja-room1.jpg – pooja-room10.jpg
    { id: 'cat-pooja', title: 'Pooja Room', description: 'Indian cultural pooja and meditation spaces.', image: '/category/Pooja room/pooja-room1.jpg', thumbnail: '/category/Pooja room/pooja-room1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('Pooja room', 'pooja-room', 10) },

    // Gym: gym (1).jpg – gym (15).jpg + gym.jpg
    { id: 'cat-gym', title: 'Gym', description: 'Luxury fitness spaces for residences and campuses.', image: '/category/Gym/gym (1).jpg', thumbnail: '/category/Gym/gym (1).jpg', status: 'active', createdAt, imageCount: 16, images: [...imgsP('Gym', 'gym', 15), { name: 'gym.jpg', url: '/category/Gym/gym.jpg' }] },

    // Spa: spa room (1).jpg – spa room (10).jpg + avif variants + istockphoto
    { id: 'cat-spa', title: 'Spa', description: 'Premium spa and wellness designs for hotels and villas.', image: '/category/Spa/spa room (1).jpg', thumbnail: '/category/Spa/spa room (1).jpg', status: 'active', createdAt, imageCount: 15, images: [
      ...imgsP('Spa', 'spa room', 10),
      { name: 'spa room (1).avif', url: '/category/Spa/spa room (1).avif' },
      { name: 'spa room (2).avif', url: '/category/Spa/spa room (2).avif' },
      { name: 'spa room (3).avif', url: '/category/Spa/spa room (3).avif' },
      { name: 'spa room (4).avif', url: '/category/Spa/spa room (4).avif' },
      { name: 'istockphoto-518954770-612x612.jpg', url: '/category/Spa/istockphoto-518954770-612x612.jpg' }
    ] },

    // Classroom: classroom.jpg + classroom1.jpg – classroom13.jpg
    { id: 'cat-classroom', title: 'Classroom', description: 'Modern learning spaces for institutes and corporates.', image: '/category/Classroom/classroom1.jpg', thumbnail: '/category/Classroom/classroom1.jpg', status: 'active', createdAt, imageCount: 14, images: [{ name: 'classroom.jpg', url: '/category/Classroom/classroom.jpg' }, ...imgs('Classroom', 'classroom', 13)] },

    // Swimming pool: swimmingpool1-Copy.jpg – swimmingpool12-Copy.jpg + swimming pool.jpg
    {
      id: 'cat-pool', title: 'Swimming Pool', description: 'Luxury pool designs for apartments and resorts.', image: '/category/Swimming pool/swimmingpool1 - Copy.jpg', thumbnail: '/category/Swimming pool/swimmingpool1 - Copy.jpg', status: 'active', createdAt, imageCount: 13,
      images: [
        ...Array.from({ length: 12 }, (_, i) => ({ name: `swimmingpool${i + 1} - Copy.jpg`, url: `/category/Swimming pool/swimmingpool${i + 1} - Copy.jpg` })),
        { name: 'swimming pool.jpg', url: '/category/Swimming pool/swimming pool.jpg' }
      ]
    },

    // Terrace: terrace (1).jpg – terrace (7).jpg
    { id: 'cat-terrace', title: 'Terrace', description: 'Indian sky villas and penthouse terrace designs.', image: '/category/Terrace/terrace (1).jpg', thumbnail: '/category/Terrace/terrace (1).jpg', status: 'active', createdAt, imageCount: 7, images: imgsP('Terrace', 'terrace', 7) },

    // Balcony: balcony (1).jpg – balcony (11).jpg
    { id: 'cat-balcony', title: 'Balcony', description: 'Modern balcony designs for apartments and villas.', image: '/category/Balcony/balcony (1).jpg', thumbnail: '/category/Balcony/balcony (1).jpg', status: 'active', createdAt, imageCount: 11, images: imgsP('Balcony', 'balcony', 11) },

    // Garden: garden (1).jpg – garden (11).jpg + garden.jpg + garden(1).avif
    { id: 'cat-garden', title: 'Garden', description: 'Luxury garden and landscape designs for homes and resorts.', image: '/category/Garden/garden (1).jpg', thumbnail: '/category/Garden/garden (1).jpg', status: 'active', createdAt, imageCount: 13, images: [
      ...imgsP('Garden', 'garden', 11),
      { name: 'garden.jpg', url: '/category/Garden/garden.jpg' },
      { name: 'garden (1).avif', url: '/category/Garden/garden (1).avif' }
    ] },

    // Meeting room: meeting room (1).jpg – meeting room (14).jpg + avif extras
    { id: 'cat-meeting', title: 'Meeting Room', description: 'Corporate conference and meeting room designs.', image: '/category/Meeting room/meeting room (1).jpg', thumbnail: '/category/Meeting room/meeting room (1).jpg', status: 'active', createdAt, imageCount: 16, images: [
      ...imgsP('Meeting room', 'meeting room', 14),
      { name: 'meeting room (1).avif', url: '/category/Meeting room/meeting room (1).avif' },
      { name: 'istockphoto-1972371210-640x640.avif', url: '/category/Meeting room/istockphoto-1972371210-640x640.avif' }
    ] },

    // Home theatre: home theatre (1).jpg – home theatre (11).jpg + hometheatre (1)-(4).jpg
    { id: 'cat-theatre', title: 'Home Theatre', description: 'Premium home theatre designs for luxury homes.', image: '/category/Home theatre/home theatre (1).jpg', thumbnail: '/category/Home theatre/home theatre (1).jpg', status: 'active', createdAt, imageCount: 15, images: [
      ...imgsP('Home theatre', 'home theatre', 11),
      { name: 'hometheatre (1).jpg', url: '/category/Home theatre/hometheatre (1).jpg' },
      { name: 'hometheatre (2).jpg', url: '/category/Home theatre/hometheatre (2).jpg' },
      { name: 'hometheatre (3).jpg', url: '/category/Home theatre/hometheatre (3).jpg' },
      { name: 'hometheatre (4).jpg', url: '/category/Home theatre/hometheatre (4).jpg' }
    ] },

    // Office interior: office interior (1).jpg – office interior (18).jpg
    { id: 'cat-office', title: 'Office Interior', description: 'Corporate and IT office interior designs.', image: '/category/Office interior/office interior (1).jpg', thumbnail: '/category/Office interior/office interior (1).jpg', status: 'active', createdAt, imageCount: 18, images: imgsP('Office interior', 'office interior', 18) },

    // wardrobe: wardrobe1.jpg – wardrobe10.jpg
    { id: 'cat-wardrobe', title: 'Wardrobe', description: 'Premium wardrobe and closet designs.', image: '/category/wardrobe/wardrobe1.jpg', thumbnail: '/category/wardrobe/wardrobe1.jpg', status: 'active', createdAt, imageCount: 10, images: imgs('wardrobe', 'wardrobe', 10) },

    // Guest room: mixed naming - guest room  (1)-(2).jpg (double space), guest room (2)-(12).jpg (single space)
    {
      id: 'cat-guestroom', title: 'Guest Room', description: 'Elegant guest room designs for hospitality.', image: '/category/Guest room/guest room  (1).jpg', thumbnail: '/category/Guest room/guest room  (1).jpg', status: 'active', createdAt, imageCount: 14, images: [
        { name: 'guest room  (1).jpg', url: '/category/Guest room/guest room  (1).jpg' },
        { name: 'guest room  (1).avif', url: '/category/Guest room/guest room  (1).avif' },
        { name: 'guest room  (2).jpg', url: '/category/Guest room/guest room  (2).jpg' },
        { name: 'guest room (2).jpg', url: '/category/Guest room/guest room (2).jpg' },
        ...Array.from({ length: 10 }, (_, i) => ({ name: `guest room (${i + 3}).jpg`, url: `/category/Guest room/guest room (${i + 3}).jpg` }))
      ]
    },
    // Apartment: apartment2.jpg, apartment4.jpg - apartment11.jpg (apartment1, apartment3, apartment12 are broken)
    {
      id: 'cat-apartment', title: 'Apartment', description: 'Modern apartment interior designs for 1BHK, 2BHK, 3BHK and 4BHK homes.', image: '/category/Apartment/apartment2.jpg', thumbnail: '/category/Apartment/apartment2.jpg', status: 'active', createdAt, imageCount: 9,
      images: [
        { name: 'apartment2.jpg', url: '/category/Apartment/apartment2.jpg' },
        { name: 'apartment4.jpg', url: '/category/Apartment/apartment4.jpg' },
        { name: 'apartment5.jpg', url: '/category/Apartment/apartment5.jpg' },
        { name: 'apartment6.jpg', url: '/category/Apartment/apartment6.jpg' },
        { name: 'apartment7.jpg', url: '/category/Apartment/apartment7.jpg' },
        { name: 'apartment8.jpg', url: '/category/Apartment/apartment8.jpg' },
        { name: 'apartment9.jpg', url: '/category/Apartment/apartment9.jpg' },
        { name: 'apartment10.jpg', url: '/category/Apartment/apartment10.jpg' },
        { name: 'apartment11.jpg', url: '/category/Apartment/apartment11.jpg' }
      ]
    }
  ];

  return categories.map((category) => {
    if (!Array.isArray(category.images)) return category;
    const normalizedImages = category.images.map((image, index) => {
      const rawName = String(image?.name || '').trim();
      if (!isRawLikeName(rawName)) return image;
      return {
        ...image,
        name: `${category.title || category.name || 'Category'} Design ${index + 1}`
      };
    });
    return {
      ...category,
      images: normalizedImages
    };
  });
};

export const seedDashboardData = () => {
  const existingDesigns = readStorage<DesignModel[]>(STORAGE_KEYS.designs, []);
  const existingUsers = readStorage<User[]>(STORAGE_KEYS.users, []);
  const existingShowrooms = readStorage<any[]>(STORAGE_KEYS.showrooms, []);
  const existingPackages = readStorage<any[]>(STORAGE_KEYS.packages, []);
  const existingBookings = readStorage<Booking[]>(STORAGE_KEYS.bookings, []);
  const existingPayments = readStorage<PaymentRecord[]>(STORAGE_KEYS.payments, []);
  const existingFeedbacks = readStorage<Feedback[]>(STORAGE_KEYS.feedbacks, []);
  const existingLikes = readStorage<LikeRecord[]>(STORAGE_KEYS.likes, []);

  // Seed sample showrooms if none exist
  if (existingShowrooms.length === 0) {
    const showroomsToSeed = INITIAL_SHOWROOMS.map((s, i) => ({
      ...s,
      id: `showroom-${i}`,
      videoUrl: '',
      imageUrl: ''
    }));
    writeStorage(STORAGE_KEYS.showrooms, showroomsToSeed);
  }

  // Seed sample customers if no users exist
  if (existingUsers.length === 0) {
    writeStorage(STORAGE_KEYS.users, SAMPLE_CUSTOMERS);
  } else {
    writeStorage(STORAGE_KEYS.users, enrichSeedUsers(existingUsers));
  }

  if (existingBookings.length === 0) {
    writeStorage(STORAGE_KEYS.bookings, SAMPLE_BOOKINGS);
  }

  if (existingPayments.length === 0) {
    writeStorage(STORAGE_KEYS.payments, SAMPLE_PAYMENTS);
  }

  if (existingFeedbacks.length === 0) {
    writeStorage(STORAGE_KEYS.feedbacks, SAMPLE_FEEDBACKS);
  }

  if (existingLikes.length === 0) {
    writeStorage(STORAGE_KEYS.likes, SAMPLE_LIKES);
  }

  // Keep categories in sync and normalize packages without destructive wipes.
  const seedCategories = createSeedCategories();
  writeStorage(STORAGE_KEYS.categories, seedCategories);

  if (existingPackages.length === 0) {
    writeStorage(STORAGE_KEYS.packages, buildSeedPackages(seedCategories));
  } else {
    const normalizedPackages = normalizePackagesForStorage(existingPackages, seedCategories);
    writeStorage(STORAGE_KEYS.packages, normalizedPackages);
  }

  // Always reseed designs with local image references (like categories)
  {
    // First add the sample designs with prices
    const sampleDesigns = SAMPLE_DESIGNS_WITH_PRICES.map(design => ({
      ...design,
      id: design.id
    }));

    // Then add the SAMPLE_MODELS
    const designs: DesignModel[] = [
      ...sampleDesigns,
      ...SAMPLE_MODELS.map((model): DesignModel => {
        const categoryId = model.category === RoomType.LIVING
          ? 'cat-living'
          : model.category === RoomType.BEDROOM
            ? 'cat-bedroom'
            : model.category === RoomType.KITCHEN
              ? 'cat-kitchen'
              : 'cat-office';

        return {
          ...model,
          categoryId,
          status: 'active',
          availabilityStatus: 'available',
          images: [model.previewImage]
        };
      })
    ];
    writeStorage(STORAGE_KEYS.designs, designs);
  }

  // Seed calculator settings
  const existingCalcSettings = readStorage<CalculatorSettings>(STORAGE_KEYS.calculatorSettings, null as any);
  if (!existingCalcSettings) {
    writeStorage(STORAGE_KEYS.calculatorSettings, DEFAULT_CALCULATOR_SETTINGS);
  } else {
  }
};

export const getCalculatorSettings = (): CalculatorSettings => {
  return readStorage(STORAGE_KEYS.calculatorSettings, DEFAULT_CALCULATOR_SETTINGS);
};

export const writeCalculatorSettings = (settings: CalculatorSettings) => {
  writeStorage(STORAGE_KEYS.calculatorSettings, settings);
};

export const getCalculationHistory = (): any[] => {
  return readStorage(STORAGE_KEYS.calculationHistory, []);
};

export const saveCalculationRecord = (record: any) => {
  const history = getCalculationHistory();
  const newRecord = {
    ...record,
    id: generateId('calc'),
    createdAt: new Date().toISOString()
  };
  writeStorage(STORAGE_KEYS.calculationHistory, [newRecord, ...history].slice(0, 100)); // Keep last 100
  return newRecord;
};

export const getCalculatorImageLibrary = (): any[] => {
  return readStorage(STORAGE_KEYS.calculatorImageLibrary, []);
};

export const writeCalculatorImageLibrary = (items: any[]) => {
  writeStorage(STORAGE_KEYS.calculatorImageLibrary, items || []);
};

const buildPackageRoomsFromCategory = (category: Category | undefined, max = 6) => {
  const images = Array.isArray(category?.images) ? category.images : [];
  return images.slice(0, max).map((image: any, index: number) => ({
    id: `room-${String(category?.id || 'package')}-${index + 1}`,
    title: String(image?.name || `Related ${index + 1}`),
    image: String(image?.url || ''),
    description: `${String(category?.title || category?.name || 'Package')} related image`
  }));
};

const normalizePackageImage = (value: any) => String(value || '').trim();

const normalizePackageRooms = (pkg: any, category: Category | undefined) => {
  const rooms = Array.isArray(pkg?.rooms) && pkg.rooms.length > 0
    ? pkg.rooms
    : buildPackageRoomsFromCategory(category, 20);

  return rooms
    .map((room: any, index: number) => {
      const roomValue = (typeof room === 'string') ? { image: room } : room;
      const image = normalizePackageImage(roomValue?.image || roomValue?.url || roomValue?.photo || '');
      if (!image) return null;
      return {
        id: String(roomValue?.id || `room-${String(pkg?.id || 'package')}-${index + 1}`),
        title: String(roomValue?.title || roomValue?.name || `Related ${index + 1}`),
        image,
        description: String(roomValue?.description || `${String(category?.title || category?.name || 'Package')} related image`)
      };
    })
    .filter(Boolean);
};

const buildCategoryImagePool = (categories: Category[]) => {
  const pool = categories.flatMap((category: any) => {
    const images = Array.isArray(category?.images)
      ? category.images.map((item: any) => normalizePackageImage(item?.url || item?.image || ''))
      : [];
    return [
      normalizePackageImage(category?.image || ''),
      normalizePackageImage(category?.thumbnail || ''),
      ...images
    ];
  }).filter(Boolean);

  return Array.from(new Set(pool));
};

const pickUniquePackageImage = (
  candidates: string[],
  fallbackPool: string[],
  usedImages: Set<string>,
  packageIndex: number
) => {
  const normalizedCandidates = candidates.map((candidate) => normalizePackageImage(candidate)).filter(Boolean);
  const normalizedFallback = fallbackPool.map((candidate) => normalizePackageImage(candidate)).filter(Boolean);

  const uniqueCandidate = normalizedCandidates.find((candidate) => !usedImages.has(candidate));
  if (uniqueCandidate) {
    usedImages.add(uniqueCandidate);
    return uniqueCandidate;
  }

  const uniqueFallback = normalizedFallback.find((candidate) => !usedImages.has(candidate));
  if (uniqueFallback) {
    usedImages.add(uniqueFallback);
    return uniqueFallback;
  }

  const deterministicFallback = normalizedFallback.length > 0
    ? normalizedFallback[Math.abs(packageIndex) % normalizedFallback.length]
    : '';
  const finalImage = normalizedCandidates[0] || deterministicFallback;
  if (finalImage) usedImages.add(finalImage);
  return finalImage;
};

const getPackageCategory = (pkg: any, categories: Category[]) => {
  const pkgCategory = String(pkg?.category || '').trim().toLowerCase();
  const pkgText = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.type || '')}`.toLowerCase();

  return categories.find((item) => {
    const itemName = String(item?.title || item?.name || '').trim().toLowerCase();
    if (itemName && itemName === pkgCategory) return true;
    if (itemName && pkgText.includes(itemName)) return true;
    if (itemName === 'apartment' && /\bapartment\b/.test(pkgText)) return true;
    if (itemName === 'villa' && /\bvilla\b/.test(pkgText)) return true;
    return false;
  });
};

const normalizePackagesForStorage = (packages: any[], categories: Category[]) => {
  const fallbackPool = buildCategoryImagePool(categories);
  const usedImages = new Set<string>();

  return packages.map((pkg: any, index: number) => {
    const category = getPackageCategory(pkg, categories);
    const normalizedRooms = normalizePackageRooms(pkg, category);

    const categoryCandidates = category
      ? [
          category.image,
          category.thumbnail,
          ...(Array.isArray(category.images) ? category.images.map((item: any) => item?.url || item?.image || '') : [])
        ]
      : [];

    const roomCandidates = normalizedRooms.map((room: any) => room?.image || '');
    const explicitImage = normalizePackageImage(pkg?.image || '');

    const image = pickUniquePackageImage(
      [explicitImage, ...roomCandidates, ...categoryCandidates],
      fallbackPool,
      usedImages,
      index
    );

    return {
      ...pkg,
      id: String(pkg?.id || `package-${index + 1}`),
      type: pkg?.type || 'Standard',
      image: image || explicitImage || roomCandidates[0] || fallbackPool[index % Math.max(1, fallbackPool.length)] || '',
      rooms: normalizedRooms,
      createdAt: pkg?.createdAt || new Date().toISOString()
    };
  });
};

const buildSeedPackages = (categories: Category[]) => {
  return normalizePackagesForStorage(DEFAULT_PACKAGES, categories);
};

export const forceReseedCategories = (): Category[] => {
  const seedCategories = createSeedCategories();
  writeStorage(STORAGE_KEYS.categories, seedCategories);
  return seedCategories;
};

const normalizeCategoryMotion = (category: Category): Category => ({
  ...category,
  motion3d: category.motion3d !== false,
  images: category.images
    ? category.images.map((img) => ({ ...img, motion3d: img.motion3d !== false }))
    : category.images
});

const normalizeDesignMotion = (design: DesignModel): DesignModel => ({
  ...design,
  motion3d: design.motion3d !== false
});

export const getCategories = (): Category[] =>
  readStorage(STORAGE_KEYS.categories, []).map((category) => normalizeCategoryMotion(category));

export const saveCategory = (category: Omit<Category, 'id' | 'createdAt'>): Category => {
  const categories = getCategories();
  const created: Category = normalizeCategoryMotion({
    ...category,
    id: generateId('cat'),
    createdAt: new Date().toISOString()
  });
  writeStorage(STORAGE_KEYS.categories, [created, ...categories]);
  return created;
};

export const updateCategory = (id: string, patch: Partial<Category>): Category[] => {
  const categories = getCategories().map((cat) =>
    cat.id === id ? normalizeCategoryMotion({ ...cat, ...patch }) : cat
  );
  writeStorage(STORAGE_KEYS.categories, categories);
  return categories;
};

export const deleteCategory = (id: string): Category[] => {
  const categories = getCategories().filter((cat) => cat.id !== id);
  writeStorage(STORAGE_KEYS.categories, categories);
  return categories;
};

export const getDesigns = (): DesignModel[] => {
  const stored = readStorage<DesignModel[]>(STORAGE_KEYS.designs, []);
  if (stored && stored.length > 0) return stored.map((design) => normalizeDesignMotion(design));
  // Fallback to SAMPLE_DESIGNS_WITH_PRICES if localStorage is empty
  return SAMPLE_DESIGNS_WITH_PRICES.length > 0
    ? SAMPLE_DESIGNS_WITH_PRICES.map((design) => normalizeDesignMotion(design))
    : [];
};

export const forceReseedDesigns = () => {
  // Clear old designs and reseed with new luxury designs
  localStorage.removeItem(STORAGE_KEYS.designs);
  const designs = SAMPLE_DESIGNS_WITH_PRICES.map(design => ({
    ...design,
    id: design.id
  }));
  writeStorage(STORAGE_KEYS.designs, designs);
  console.log('✅ Designs reseeded with 150 luxury designs');
  return designs;
};

export const saveDesign = (design: Omit<DesignModel, 'id'>): DesignModel => {
  const designs = getDesigns();
  const created: DesignModel = normalizeDesignMotion({
    ...design,
    id: generateId('design')
  });
  writeStorage(STORAGE_KEYS.designs, [created, ...designs]);
  return created;
};

export const updateDesign = (id: string, patch: Partial<DesignModel>): DesignModel[] => {
  const designs = getDesigns().map((design) =>
    design.id === id ? normalizeDesignMotion({ ...design, ...patch }) : design
  );
  writeStorage(STORAGE_KEYS.designs, designs);
  return designs;
};

export const deleteDesign = (id: string): DesignModel[] => {
  const designs = getDesigns().filter((design) => design.id !== id);
  writeStorage(STORAGE_KEYS.designs, designs);
  return designs;
};

export const getBookings = (): Booking[] => readStorage(STORAGE_KEYS.bookings, []);

export const createBooking = (payload: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): Booking => {
  const bookings = getBookings();
  const created: Booking = {
    ...payload,
    id: generateId('booking'),
    status: 'booked',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  };
  writeStorage(STORAGE_KEYS.bookings, [created, ...bookings]);
  return created;
};

export const updateBooking = (id: string, patch: Partial<Booking>): Booking[] => {
  const bookings = getBookings().map((booking) => (booking.id === id ? { ...booking, ...patch } : booking));
  writeStorage(STORAGE_KEYS.bookings, bookings);
  return bookings;
};

export const getPayments = (): PaymentRecord[] => readStorage(STORAGE_KEYS.payments, []);

export const createPayment = (payload: Omit<PaymentRecord, 'id' | 'createdAt'>): PaymentRecord => {
  const payments = getPayments();
  const created: PaymentRecord = {
    ...payload,
    id: generateId('pay'),
    createdAt: new Date().toISOString()
  };
  writeStorage(STORAGE_KEYS.payments, [created, ...payments]);
  return created;
};

export const updatePayment = (id: string, patch: Partial<PaymentRecord>): PaymentRecord[] => {
  const payments = getPayments().map((payment) => (payment.id === id ? { ...payment, ...patch } : payment));
  writeStorage(STORAGE_KEYS.payments, payments);
  return payments;
};

export const getLikes = (): LikeRecord[] => readStorage(STORAGE_KEYS.likes, []);

export const setLike = (userId: string, designId: string, value: 'like' | 'dislike'): LikeRecord[] => {
  const likes = getLikes();
  const existing = likes.find((like) => like.userId === userId && like.designId === designId);
  let updated: LikeRecord[];
  if (existing) {
    updated = likes.map((like) =>
      like.userId === userId && like.designId === designId
        ? { ...like, value, createdAt: new Date().toISOString() }
        : like
    );
  } else {
    updated = [
      {
        id: generateId('like'),
        userId,
        designId,
        value,
        createdAt: new Date().toISOString()
      },
      ...likes
    ];
  }
  writeStorage(STORAGE_KEYS.likes, updated);
  return updated;
};

export const getFeedbacks = (): Feedback[] => readStorage(STORAGE_KEYS.feedbacks, []);

export const addFeedback = (payload: Omit<Feedback, 'id' | 'createdAt'>): Feedback => {
  const feedbacks = getFeedbacks();
  const created: Feedback = {
    ...payload,
    id: generateId('feedback'),
    createdAt: new Date().toISOString()
  };
  writeStorage(STORAGE_KEYS.feedbacks, [created, ...feedbacks]);
  return created;
};

export const getRelatedDesigns = (design: DesignModel, count = 12): DesignModel[] => {
  const designs = getDesigns().filter((item) => item.id !== design.id && item.status !== 'inactive');
  const likes = getLikes();
  const likeCounts = likes.reduce<Record<string, number>>((acc, like) => {
    if (like.value === 'like') acc[like.designId] = (acc[like.designId] || 0) + 1;
    return acc;
  }, {});

  const scored = designs.map((item) => {
    const sameCategory = item.categoryId && item.categoryId === design.categoryId ? 1 : 0;
    const priceDiff = Math.abs((item.price || 0) - (design.price || 0));
    const priceScore = priceDiff === 0 ? 1 : Math.max(0, 1 - priceDiff / Math.max(1, design.price || 1));
    const popularityScore = likeCounts[item.id] ? Math.min(1, likeCounts[item.id] / 10) : 0;
    return {
      item,
      score: sameCategory * 0.5 + priceScore * 0.3 + popularityScore * 0.2
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((entry) => entry.item);
};

export const getProfitLossData = (): ProfitLossPoint[] => {
  const payments = getPayments();
  const bookings = getBookings();
  const monthly: Record<string, { revenue: number; expenses: number }> = {};

  bookings.forEach((booking) => {
    const month = new Date(booking.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    const revenue = booking.paymentStatus === 'paid' ? booking.price : 0;
    // Use the actual cost if available, otherwise fallback to 62% of revenue
    const expense = booking.paymentStatus === 'paid' ? (booking.cost || revenue * 0.62) : 0;
    if (!monthly[month]) {
      monthly[month] = { revenue: 0, expenses: 0 };
    }
    monthly[month].revenue += revenue;
    monthly[month].expenses += expense;
  });

  payments.forEach((payment) => {
    if (payment.status !== 'success') return;
    const month = new Date(payment.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    if (!monthly[month]) {
      monthly[month] = { revenue: 0, expenses: 0 };
    }
  });

  return Object.entries(monthly).map(([month, values]) => ({
    month,
    revenue: Number(values.revenue.toFixed(2)),
    expenses: Number(values.expenses.toFixed(2)),
    profit: Number((values.revenue - values.expenses).toFixed(2))
  }));
};

export const getCategoryEarnings = (): CategoryEarning[] => {
  const categories = getCategories();
  const bookings = getBookings().filter((booking) => booking.paymentStatus === 'paid');
  const earnings = bookings.reduce<Record<string, number>>((acc, booking) => {
    acc[booking.categoryId] = (acc[booking.categoryId] || 0) + booking.price;
    return acc;
  }, {});

  return categories.map((category) => ({
    categoryId: category.id,
    categoryTitle: category.title ?? category.name ?? 'Unknown',
    earnings: Number((earnings[category.id] || 0).toFixed(2))
  }));
};

export const getTheme = (): SiteTheme => {
  const stored = readStorage<SiteTheme>(STORAGE_KEYS.theme, {
    primaryColor: '#4A3728',
    accentColor: '#D4AF37',
    darkMode: false
  });
  // Ensure darkMode property exists for backward compatibility
  if (stored.darkMode === undefined) {
    stored.darkMode = false;
  }
  return stored;
};

export const setTheme = (theme: SiteTheme): SiteTheme => {
  writeStorage(STORAGE_KEYS.theme, theme);
  return theme;
};

// --- Showrooms ---
export const getShowrooms = (): any[] => {
  const showrooms = readStorage<any[]>(STORAGE_KEYS.showrooms, []);
  if (showrooms.length > 0) return showrooms;

  // Combine initial showrooms with actual media from luxury showcase
  const allRooms = [...LUXURY_HOUSE.rooms, ...LUXURY_APARTMENT.rooms];

  const defaultShowrooms = INITIAL_SHOWROOMS.map((s, i) => {
    // Try to find a matching room by name or just use the nth room's media
    const matchingRoom = allRooms.find(r => r.name.toLowerCase().includes(s.city.toLowerCase())) || allRooms[i % allRooms.length];

    return {
      ...s,
      id: `showroom-${i}`,
      videoUrl: matchingRoom?.video3d || '',
      imageUrl: matchingRoom?.imageUrl || ''
    };
  });

  // Add some extra showrooms directly from the luxury properties if we want more
  if (defaultShowrooms.length < allRooms.length) {
    allRooms.slice(defaultShowrooms.length).forEach((room, i) => {
      defaultShowrooms.push({
        id: `showroom-extra-${i}`,
        city: room.name,
        locations: [{ area: room.type, phone: '+91 8904712858' }],
        videoUrl: room.video3d || '',
        imageUrl: room.imageUrl || ''
      });
    });
  }

  writeStorage(STORAGE_KEYS.showrooms, defaultShowrooms);
  return defaultShowrooms;
};

export const saveShowroom = (showroom: any): any => {
  const showrooms = getShowrooms();
  const created = { ...showroom, id: generateId('showroom') };
  writeStorage(STORAGE_KEYS.showrooms, [...showrooms, created]);
  return created;
};

export const updateShowroom = (id: string, patch: any): any[] => {
  const showrooms = getShowrooms().map(s => s.id === id ? { ...s, ...patch } : s);
  writeStorage(STORAGE_KEYS.showrooms, showrooms);
  return showrooms;
};

export const deleteShowroom = (id: string): any[] => {
  const showrooms = getShowrooms().filter(s => s.id !== id);
  writeStorage(STORAGE_KEYS.showrooms, showrooms);
  return showrooms;
};

// --- Service Showcases ---
export const getServiceShowcases = (): any[] => {
  const showcases = readStorage<any[]>(STORAGE_KEYS.showcases, []);
  return showcases;
};

export const saveServiceShowcase = (showcase: any): any => {
  const showcases = getServiceShowcases();
  const created = { ...showcase, id: generateId('showcase') };
  const updatedShowcases = [...showcases, created];
  writeStorage(STORAGE_KEYS.showcases, updatedShowcases);
  return created;
};

export const updateServiceShowcase = (id: string, patch: any): any[] => {
  const showcases = getServiceShowcases().map(s => s.id === id ? { ...s, ...patch } : s);
  writeStorage(STORAGE_KEYS.showcases, showcases);
  return showcases;
};

export const deleteServiceShowcase = (id: string): any[] => {
  const showcases = getServiceShowcases().filter(s => s.id !== id);
  writeStorage(STORAGE_KEYS.showcases, showcases);
  return showcases;
};

// --- Announcements ---
export const getAnnouncements = (): any[] => {
  return readStorage<any[]>(STORAGE_KEYS.announcements, []);
};

export const saveAnnouncement = (announcement: any): any => {
  const announcements = getAnnouncements();
  const created = {
    ...announcement,
    id: announcement.id || generateId('announcement'),
    createdAt: new Date().toISOString()
  };
  writeStorage(STORAGE_KEYS.announcements, [...announcements, created]);
  return created;
};

export const updateAnnouncement = (id: string, patch: any): any[] => {
  const announcements = getAnnouncements().map(a => a.id === id ? { ...a, ...patch } : a);
  writeStorage(STORAGE_KEYS.announcements, announcements);
  return announcements;
};

export const deleteAnnouncement = (id: string): any[] => {
  const announcements = getAnnouncements().filter(a => a.id !== id);
  writeStorage(STORAGE_KEYS.announcements, announcements);
  return announcements;
};

export const getActiveAnnouncements = (): any[] => {
  const now = Date.now();
  const parseDate = (value: any, fallback: number) => {
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    const parsed = new Date(raw).getTime();
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return getAnnouncements().filter((a: any) => {
    if (!a?.active) return false;
    const startMs = parseDate(a.startDate, 0);
    const endMs = parseDate(a.endDate, Number.MAX_SAFE_INTEGER);
    return now >= startMs && now <= endMs;
  });
};

// --- Discount Codes ---
export const getDiscountCodes = (): any[] => {
  return readStorage<any[]>(STORAGE_KEYS.discountCodes, []);
};

export const saveDiscountCode = (codeData: any): any => {
  const existing = getDiscountCodes();
  const normalizedCode = String(codeData?.code || '').trim().toUpperCase();
  const next = {
    id: codeData?.id || generateId('discount'),
    code: normalizedCode,
    type: codeData?.type === 'flat' ? 'flat' : 'percent',
    value: Number(codeData?.value || 0),
    active: codeData?.active !== false,
    minAmount: Number(codeData?.minAmount || 0),
    maxDiscount: Number(codeData?.maxDiscount || 0),
    startDate: String(codeData?.startDate || ''),
    endDate: String(codeData?.endDate || ''),
    createdAt: codeData?.createdAt || new Date().toISOString()
  };
  const deduped = existing.filter((item: any) => String(item?.code || '').trim().toUpperCase() !== normalizedCode);
  writeStorage(STORAGE_KEYS.discountCodes, [next, ...deduped]);
  return next;
};

export const updateDiscountCode = (id: string, patch: any): any[] => {
  const updated = getDiscountCodes().map((item: any) => {
    if (item.id !== id) return item;
    const nextCode = patch?.code ? String(patch.code).trim().toUpperCase() : String(item.code || '').trim().toUpperCase();
    return {
      ...item,
      ...patch,
      code: nextCode
    };
  });
  writeStorage(STORAGE_KEYS.discountCodes, updated);
  return updated;
};

export const deleteDiscountCode = (id: string): any[] => {
  const filtered = getDiscountCodes().filter((item: any) => item.id !== id);
  writeStorage(STORAGE_KEYS.discountCodes, filtered);
  return filtered;
};

export const getActiveDiscountCodes = (): any[] => {
  const now = Date.now();
  const parseDate = (value: any, fallback: number) => {
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    const parsed = new Date(raw).getTime();
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return getDiscountCodes().filter((item: any) => {
    if (!item?.active) return false;
    const startMs = parseDate(item.startDate, 0);
    const endMs = parseDate(item.endDate, Number.MAX_SAFE_INTEGER);
    return now >= startMs && now <= endMs;
  });
};

// --- Packages ---
export const setPackages = (packages: any[]) => {
  writeStorage(STORAGE_KEYS.packages, packages);
};

// Fetch packages from API (database) with fallback to localStorage
export const getPackages = async (): Promise<any[]> => {
  try {
    // Try to fetch from API first
    const response = await fetch('/api/packages', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && Array.isArray(result.data)) {
        // Cache to localStorage for offline access
        writeStorage(STORAGE_KEYS.packages, result.data);
        return result.data;
      }
    }
  } catch (apiError) {
    console.warn('[Packages] API fetch failed, falling back to localStorage:', apiError);
  }

  // Fallback to localStorage if API fails
  const stored = readStorage<any[]>(STORAGE_KEYS.packages, []);
  const categories = getCategories();
  const effectiveCategories = categories.length > 0 ? categories : createSeedCategories();

  if (stored.length > 0) {
    const normalized = normalizePackagesForStorage(stored, effectiveCategories);
    if (JSON.stringify(normalized) !== JSON.stringify(stored)) {
      writeStorage(STORAGE_KEYS.packages, normalized);
    }
    return normalized;
  }

  const seeded = buildSeedPackages(effectiveCategories);
  writeStorage(STORAGE_KEYS.packages, seeded);
  return seeded;
};

// Synchronous version for immediate access (uses cache only)
export const getPackagesSync = (): any[] => {
  const stored = readStorage<any[]>(STORAGE_KEYS.packages, []);
  const categories = getCategories();
  const effectiveCategories = categories.length > 0 ? categories : createSeedCategories();

  if (stored.length > 0) {
    const normalized = normalizePackagesForStorage(stored, effectiveCategories);
    if (JSON.stringify(normalized) !== JSON.stringify(stored)) {
      writeStorage(STORAGE_KEYS.packages, normalized);
    }
    return normalized;
  }

  const seeded = buildSeedPackages(effectiveCategories);
  writeStorage(STORAGE_KEYS.packages, seeded);
  return seeded;
};

export const savePackage = (pkg: any): any => {
  const packages = getPackagesSync();
  const created = {
    ...pkg,
    id: pkg.id || generateId('package'),
    createdAt: new Date().toISOString()
  };
  writeStorage(STORAGE_KEYS.packages, [...packages, created]);
  return created;
};

export const updatePackage = (id: string, patch: any): any[] => {
  const packages = getPackagesSync().map(p => p.id === id ? { ...p, ...patch } : p);
  writeStorage(STORAGE_KEYS.packages, packages);
  return packages;
};

export const deletePackage = (id: string): any[] => {
  const packages = getPackagesSync().filter(p => p.id !== id);
  writeStorage(STORAGE_KEYS.packages, packages);
  return packages;
};
