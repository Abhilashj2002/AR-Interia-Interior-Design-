/**
 * Seed data for 60 unique packages
 * Distribution:
 * - 1BHK Apartments: 10 packages
 * - 2BHK Apartments: 10 packages
 * - 3BHK Apartments: 10 packages
 * - 4BHK Apartments: 10 packages
 * - 3BHK Villas: 10 packages
 * - 4BHK Villas: 10 packages
 */

// Unsplash image IDs for unique hero images (for packages)
const heroImages = {
  apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200', // Modern living
    'https://images.unsplash.com/photo-1554995207-c18bbc2f068f?auto=format&fit=crop&q=80&w=1200', // Luxury living
    'https://images.unsplash.com/photo-1600121848371-bb4dc53f1590?auto=format&fit=crop&q=80&w=1200', // Contemporary
    'https://images.unsplash.com/photo-1576610616656-f72b27e84530?auto=format&fit=crop&q=80&w=1200', // Minimalist
    'https://images.unsplash.com/photo-1586875734471-8d7ddffe1a2d?auto=format&fit=crop&q=80&w=1200', // Scandinavian
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200', // Industrial
    'https://images.unsplash.com/photo-1540932239986-310128078ceb?auto=format&fit=crop&q=80&w=1200', // Modern glam
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', // Monochrome
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200', // Cozy warm
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=1200', // Eclectic
  ],
  villa: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200', // Luxury villa
    'https://images.unsplash.com/photo-1512917774080-9b41b20aadd1?auto=format&fit=crop&q=80&w=1200', // Modern villa
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', // Villa exterior
    'https://images.unsplash.com/photo-1570129477492-45a003537e1c?auto=format&fit=crop&q=80&w=1200', // Resort style
    'https://images.unsplash.com/photo-1576013551550-2173dba999ef?auto=format&fit=crop&q=80&w=1200', // Contemporary villa
    'https://images.unsplash.com/photo-1600210491493-0946911123ea?auto=format&fit=crop&q=80&w=1200', // Smart villa
    'https://images.unsplash.com/photo-1532323544529-c6227db76aea?auto=format&fit=crop&q=80&w=1200', // Ceiling design
    'https://images.unsplash.com/photo-1582896619162-71bc45ed5d55?auto=format&fit=crop&q=80&w=1200', // Premium villa
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', // Villa entry
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1200', // Luxury design
  ]
};

const localSeries = (folder, prefix, count = 10) =>
  Array.from({ length: count }, (_, index) => `/category/${folder}/${prefix}${index + 1}.jpg`);

const validApartmentFoyerImages = [
  '/category/Apartment/apartment2.jpg',
  '/category/Apartment/apartment4.jpg',
  '/category/Apartment/apartment5.jpg',
  '/category/Apartment/apartment6.jpg',
  '/category/Apartment/apartment7.jpg',
  '/category/Apartment/apartment8.jpg',
  '/category/Apartment/apartment9.jpg',
  '/category/Apartment/apartment10.jpg',
  '/category/Apartment/apartment11.jpg'
];

// Room design images now prefer local assets so they are fast, stable, and configuration-accurate.
const roomImages = {
  kitchen: localSeries('Kitchen', 'kitchen'),
  bedroom: [
    ...localSeries('Master Bedroom', 'master-bedroom'),
    ...localSeries('Kids-bedroom', 'kids-bedroom')
  ],
  living: localSeries('Living room', 'living'),
  bathroom: localSeries('Bathroom', 'bathroom'),
  dining: localSeries('Diningroom', 'dining-room'),
  office: Array.from({ length: 10 }, (_, index) => `/category/Office interior/office interior (${index + 1}).jpg`),
  balcony: Array.from({ length: 10 }, (_, index) => `/category/Balcony/balcony (${index + 1}).jpg`),
  theater: Array.from({ length: 10 }, (_, index) => `/category/Home theatre/home theatre (${index + 1}).jpg`),
  gym: Array.from({ length: 10 }, (_, index) => `/category/Gym/gym (${index + 1}).jpg`),
  pool: [
    '/category/Swimming pool/swimming pool.jpg',
    ...Array.from({ length: 10 }, (_, index) => `/category/Swimming pool/swimmingpool${index + 1} - Copy.jpg`)
  ],
  garden: Array.from({ length: 10 }, (_, index) => `/category/Garden/garden (${index + 1}).jpg`),
  foyer: validApartmentFoyerImages,
  wardrobe: localSeries('wardrobe', 'wardrobe'),
  bar: localSeries('Diningroom', 'dining-room'),
  library: Array.from({ length: 10 }, (_, index) => `/category/Office interior/office interior (${index + 1}).jpg`)
};

const roomTypeToImageType = {
  kitchen: 'kitchen',
  bedroom: 'bedroom',
  secondBedroom: 'bedroom',
  thirdBedroom: 'bedroom',
  fourthBedroom: 'bedroom',
  living: 'living',
  dining: 'dining',
  bathroom: 'bathroom',
  secondBathroom: 'bathroom',
  thirdBathroom: 'bathroom',
  office: 'office',
  balcony: 'balcony',
  poolArea: 'pool',
  garden: 'garden',
  library: 'library',
  gym: 'gym',
  theater: 'theater',
  foyer: 'foyer',
  bar: 'bar',
  walkInRobe: 'wardrobe'
};

// Background colors for packages
const backgroundColors = [
  '#FFF5E6', // Warm ivory
  '#E6F2FF', // Cool blue
  '#F0E6FF', // Soft purple
  '#E6FFF0', // Mint green
  '#FFE6F0', // Blush pink
  '#E6F5FF', // Sky blue
  '#FFF0E6', // Peach
  '#F5E6FF', // Lavender
  '#E6FFF5', // Aqua
  '#FFEBE6', // Coral
];

// Feature sets based on BHK and tier
const features = {
  '1bhk': {
    essential: [
      'Modular Kitchen',
      'Wardrobe',
      'Living + Dining',
      'Balcony Design',
      'Bathroom Vanity',
      'Premium Lighting',
      '10 Year Warranty'
    ],
    luxury: [
      'Designer Kitchen',
      'Walk-in Wardrobe',
      'Grand Living',
      'Premium Bathroom',
      'Premium Balcony',
      'Smart Controls',
      'Premium Materials'
    ],
    ultimate: [
      'Gourmet Kitchen',
      'Master Suite',
      'Home Office',
      'Premium Bathroom',
      'Entertainment Balcony',
      'Full Automation',
      'Lifetime Warranty'
    ]
  },
  '2bhk': {
    essential: [
      'Modular Kitchen',
      'Master Wardrobe',
      'Living + Dining',
      'TV Feature Wall',
      'Guest Bedroom',
      'Bathroom Design',
      'Balcony Space'
    ],
    luxury: [
      'Designer Kitchen',
      'Walk-in Wardrobes',
      'Grand Living',
      'Designer Bathrooms',
      'Guest Suite',
      'Home Office Corner',
      'Smart Lighting'
    ],
    ultimate: [
      'Gourmet Kitchen',
      'Luxury Suites',
      'Double-height Living',
      'Spa Bathrooms',
      'Premium Balcony',
      'Home Cinema',
      'Full Home Automation'
    ]
  },
  '3bhk': {
    essential: [
      'Modular Kitchen',
      'Master Suite',
      'Guest Bedrooms',
      'Spacious Living',
      'Multiple Bathrooms',
      'Balcony Design',
      'Utility Area'
    ],
    luxury: [
      'Designer Kitchen',
      'Master with Walk-in',
      'Guest Suites',
      'Home Office',
      'Luxury Bathrooms',
      'Servant Quarter',
      'Premium Balconies'
    ],
    ultimate: [
      'Gourmet Kitchen',
      'Master with Lounge',
      'Suite Bedrooms',
      'Home Cinema',
      'Home Gym',
      'Designer Bathrooms',
      'Full Automation'
    ]
  },
  '4bhk': {
    essential: [
      'Modular Kitchen',
      'Master Suite',
      'Multiple Bedrooms',
      'Spacious Living',
      'Formal Dining',
      'Guest Room',
      'Multiple Balconies'
    ],
    luxury: [
      'Designer Kitchen',
      'Luxury Master',
      'Suite Bedrooms',
      'Home Office',
      'Cinema Room',
      'Servant Quarter',
      'Infinity Balcony'
    ],
    ultimate: [
      'Gourmet Kitchen',
      'Master with Bath',
      'Suite Bedrooms',
      'Home Theater',
      'Home Gym',
      'Library',
      'Smart Estate'
    ]
  },
  'villa': {
    essential: [
      'Island Kitchen',
      'Master Suite',
      'Multiple Bedrooms',
      'Grand Living',
      'Swimming Pool',
      'Home Theater',
      'Garden Space'
    ],
    luxury: [
      'Designer Kitchen',
      'Luxury Suites',
      'Premium Bedrooms',
      'Double Living',
      'Infinity Pool',
      'Cinema Theater',
      'Smart Villa'
    ],
    ultimate: [
      'Gourmet Kitchen',
      'Master with Bath',
      'Suite Bedrooms',
      'Premium Theater',
      'Resort Pool',
      'Wellness Gym',
      'Full Smart Home'
    ]
  }
};

// Room titles by type
const roomTitles = {
  kitchen: 'Modular Kitchen Concept',
  bedroom: 'Master Suite Retreat',
  secondBedroom: 'Cozy Guest Bedroom',
  thirdBedroom: 'Kid\'s Bedroom Design',
  fourthBedroom: 'Executive Guest Suite',
  living: 'Grand Living Area',
  dining: 'Elegant Dining Hall',
  bathroom: 'Premium Bathroom',
  secondBathroom: 'Ensuite Bathroom',
  thirdBathroom: 'Guest Bathroom',
  office: 'Home Office Studio',
  balcony: 'Premium Balcony Lounge',
  poolArea: 'Luxury Pool Area',
  garden: 'Landscaped Garden',
  library: 'Home Library',
  gym: 'Fitness Studio',
  theater: 'Home Cinema Hall',
  foyer: 'Grand Foyer Design',
  bar: 'Luxury Home Bar',
  walkInRobe: 'Designer Walk-in Robe'
};

const roomDescriptions = {
  kitchen: 'Modern kitchen with premium appliances, efficient layout, and smart storage solutions.',
  bedroom: 'Luxurious master bedroom with designer finishes and integrated wardrobe.',
  secondBedroom: 'Comfortable guest bedroom with premium bedding and warm ambiance.',
  thirdBedroom: 'Fun and functional kids bedroom with smart storage and play area.',
  fourthBedroom: 'Elegant guest suite with ensuite bathroom and premium furnishings.',
  living: 'Spacious living area with premium upholstery and sophisticated lighting.',
  dining: 'Elegant dining space with bespoke furniture and ambient lighting.',
  bathroom: 'Luxury bathroom with rainfall shower and premium finishes.',
  secondBathroom: 'Designer ensuite with premium fixtures.',
  thirdBathroom: 'Guest bathroom with premium fixtures and modern design.',
  office: 'Ergonomic home office with soundproofing and professional setup.',
  balcony: 'Relaxing outdoor space with premium seating and finishes.',
  poolArea: 'Resort-style pool area with lounging and landscape design.',
  garden: 'Beautifully landscaped garden with ambient lighting.',
  library: 'Quiet reading space with custom shelving and comfortable seating.',
  gym: 'Fitness studio with premium equipment and ventilation.',
  theater: 'Luxury cinema with Dolby Atmos and premium seating.',
  foyer: 'Grand entrance with statement art and designer console.',
  bar: 'Sophisticated bar area with premium spirits display.',
  walkInRobe: 'Spacious dressing room with custom shoe racks and accessories.'
};

const uniqueList = (items) => Array.from(new Set((Array.isArray(items) ? items : []).filter(Boolean)));

const normalizedRoomImages = Object.fromEntries(
  Object.entries(roomImages).map(([key, urls]) => [key, uniqueList(urls)])
);

const normalizedHeroImages = {
  apartment: uniqueList(heroImages.apartment),
  villa: uniqueList(heroImages.villa),
};

function generateRooms(bhk, type, colorIndex, variationSeed = 0) {
  const rooms = [];
  const roomTypes = [];

  // Determine room types based on BHK and type
  if (type === 'villa') {
    // Villas get more rooms
    if (bhk === 1) {
      // 1BHK Villa: 1 bedroom, 1 kitchen, 1 bathroom, 1 living room
      roomTypes.push('bedroom', 'kitchen', 'bathroom', 'living');
    } else if (bhk === 2) {
      // 2BHK Villa: 2 bedrooms, 1 kitchen, 2 bathrooms, 1 living room, 1 dining hall
      roomTypes.push('bedroom', 'secondBedroom', 'kitchen', 'bathroom', 'secondBathroom', 'living', 'dining');
    } else if (bhk === 3) {
      // 3BHK Villa
      roomTypes.push('bedroom', 'secondBedroom', 'thirdBedroom', 'kitchen', 'bathroom', 'secondBathroom', 'living', 'dining', 'office', 'balcony', 'foyer');
      roomTypes.push('library', 'gym');
    } else if (bhk >= 4) {
      // 4BHK+ Villa
      roomTypes.push('bedroom', 'secondBedroom', 'thirdBedroom', 'fourthBedroom', 'kitchen', 'bathroom', 'secondBathroom', 'thirdBathroom', 'living', 'dining', 'office', 'balcony', 'foyer');
      roomTypes.push('library', 'gym', 'theater', 'poolArea', 'walkInRobe', 'bar');
    }
  } else {
    // Apartments
    if (bhk === 1) {
      // 1BHK Apartment: 1 bedroom, 1 kitchen, 1 bathroom, 1 living room + balcony
      roomTypes.push('bedroom', 'kitchen', 'bathroom', 'living', 'balcony');
    } else if (bhk === 2) {
      // 2BHK Apartment: 2 bedrooms, 1 kitchen, 2 bathrooms, 1 living room, 1 dining hall + balcony
      roomTypes.push('bedroom', 'secondBedroom', 'kitchen', 'bathroom', 'secondBathroom', 'living', 'dining', 'balcony');
    } else if (bhk === 3) {
      // 3BHK Apartment
      roomTypes.push('bedroom', 'secondBedroom', 'thirdBedroom', 'kitchen', 'bathroom', 'secondBathroom', 'living', 'dining', 'balcony', 'foyer', 'office', 'walkInRobe');
    } else if (bhk >= 4) {
      // 4BHK+ Apartment
      roomTypes.push('bedroom', 'secondBedroom', 'thirdBedroom', 'fourthBedroom', 'kitchen', 'bathroom', 'secondBathroom', 'thirdBathroom', 'living', 'dining', 'balcony', 'foyer', 'office', 'walkInRobe');
    }
  }
  
  // Keep only configuration-relevant rooms; do not pad synthetic duplicates.
  const baseRoomTypes = roomTypes.slice();
  
  baseRoomTypes.forEach((roomType, index) => {
    const imageType = roomTypeToImageType[roomType] || 'living';
    const images = normalizedRoomImages[imageType] || normalizedRoomImages.living || [];
    const imageIndex = images.length > 0
      ? (index + variationSeed + colorIndex + bhk) % images.length
      : 0;
    rooms.push({
      id: `room-${index + 1}`,
      title: roomTitles[roomType] || roomTitles.living,
      image: images[imageIndex] || '',
      description: roomDescriptions[roomType] || roomDescriptions.living
    });
  });
  
  return rooms;
}

function generatePackages() {
  const packages = [];
  
  const pickHeroImage = (homeType, bhk, tier, ordinal) => {
    const key = String(homeType || '').toLowerCase() === 'villa' ? 'villa' : 'apartment';
    const pool = normalizedHeroImages[key] || normalizedHeroImages.apartment;
    const tierOffset = tier === 'essential' ? 0 : tier === 'luxury' ? 2 : 4;
    const index = pool.length > 0
      ? (ordinal + bhk + tierOffset + (key === 'villa' ? 3 : 0)) % pool.length
      : 0;
    return pool[index] || '';
  };
  
  // 1BHK Apartments
  for (let i = 0; i < 10; i++) {
    const tier = i % 3 === 0 ? 'essential' : i % 3 === 1 ? 'luxury' : 'ultimate';
    const colorIndex = i % backgroundColors.length;
    packages.push({
      id: `apt-1bhk-${tier}-${String(i + 1).padStart(2, '0')}`,
      name: `1BHK APARTMENTS - ${tier.toUpperCase()} COLLECTION ${String(i + 1).padStart(2, '0')}`,
      subtitle: `Premium 1BHK - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`,
      description: `Perfectly designed 1BHK apartment with ${tier} finishes and modern amenities.`,
      type: 'Apartment',
      bhk: 1,
      category: 'Full Home',
      image: pickHeroImage('apartment', 1, tier, i),
      backgroundColor: backgroundColors[colorIndex],
      originalPrice: tier === 'essential' ? 400000 : tier === 'luxury' ? 600000 : 800000,
      discountedPrice: tier === 'essential' ? 320000 : tier === 'luxury' ? 480000 : 640000,
      features: features['1bhk'][tier],
      rooms: generateRooms(1, 'Apartment', colorIndex, i)
    });
  }
  
  // 2BHK Apartments
  for (let i = 0; i < 10; i++) {
    const tier = i % 3 === 0 ? 'essential' : i % 3 === 1 ? 'luxury' : 'ultimate';
    const colorIndex = (i + 3) % backgroundColors.length;
    packages.push({
      id: `apt-2bhk-${tier}-${String(i + 1).padStart(2, '0')}`,
      name: `2BHK APARTMENTS - ${tier.toUpperCase()} COLLECTION ${String(i + 1).padStart(2, '0')}`,
      subtitle: `Spacious 2BHK - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`,
      description: `Versatile 2BHK apartment ideal for growing families with ${tier} finishes.`,
      type: 'Apartment',
      bhk: 2,
      category: 'Full Home',
      image: pickHeroImage('apartment', 2, tier, i + 10),
      backgroundColor: backgroundColors[colorIndex],
      originalPrice: tier === 'essential' ? 550000 : tier === 'luxury' ? 800000 : 1100000,
      discountedPrice: tier === 'essential' ? 440000 : tier === 'luxury' ? 640000 : 880000,
      features: features['2bhk'][tier],
      rooms: generateRooms(2, 'Apartment', colorIndex, i + 10)
    });
  }
  
  // 3BHK Apartments
  for (let i = 0; i < 10; i++) {
    const tier = i % 3 === 0 ? 'essential' : i % 3 === 1 ? 'luxury' : 'ultimate';
    const colorIndex = (i + 5) % backgroundColors.length;
    packages.push({
      id: `apt-3bhk-${tier}-${String(i + 1).padStart(2, '0')}`,
      name: `3BHK APARTMENTS - ${tier.toUpperCase()} COLLECTION ${String(i + 1).padStart(2, '0')}`,
      subtitle: `Luxurious 3BHK - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`,
      description: `Spacious 3BHK apartment perfect for large families with premium ${tier} finishes.`,
      type: 'Apartment',
      bhk: 3,
      category: 'Full Home',
      image: pickHeroImage('apartment', 3, tier, i + 20),
      backgroundColor: backgroundColors[colorIndex],
      originalPrice: tier === 'essential' ? 800000 : tier === 'luxury' ? 1200000 : 1600000,
      discountedPrice: tier === 'essential' ? 640000 : tier === 'luxury' ? 960000 : 1280000,
      features: features['3bhk'][tier],
      rooms: generateRooms(3, 'Apartment', colorIndex, i + 20)
    });
  }
  
  // 4BHK Apartments
  for (let i = 0; i < 10; i++) {
    const tier = i % 3 === 0 ? 'essential' : i % 3 === 1 ? 'luxury' : 'ultimate';
    const colorIndex = (i + 7) % backgroundColors.length;
    packages.push({
      id: `apt-4bhk-${tier}-${String(i + 1).padStart(2, '0')}`,
      name: `4BHK APARTMENTS - ${tier.toUpperCase()} COLLECTION ${String(i + 1).padStart(2, '0')}`,
      subtitle: `Premium 4BHK - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`,
      description: `Exclusive 4BHK apartment with luxurious ${tier} finishes and premium amenities.`,
      type: 'Apartment',
      bhk: 4,
      category: 'Full Home',
      image: pickHeroImage('apartment', 4, tier, i + 30),
      backgroundColor: backgroundColors[colorIndex],
      originalPrice: tier === 'essential' ? 1200000 : tier === 'luxury' ? 1800000 : 2400000,
      discountedPrice: tier === 'essential' ? 960000 : tier === 'luxury' ? 1440000 : 1920000,
      features: features['4bhk'][tier],
      rooms: generateRooms(4, 'Apartment', colorIndex, i + 30)
    });
  }
  
  // 3BHK Villas
  for (let i = 0; i < 10; i++) {
    const tier = i % 3 === 0 ? 'essential' : i % 3 === 1 ? 'luxury' : 'ultimate';
    const colorIndex = (i + 2) % backgroundColors.length;
    packages.push({
      id: `villa-3bhk-${tier}-${String(i + 1).padStart(2, '0')}`,
      name: `3BHK VILLAS - ${tier.toUpperCase()} COLLECTION ${String(i + 1).padStart(2, '0')}`,
      subtitle: `Opulent 3BHK Villa - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`,
      description: `Luxurious 3BHK villa with resort-style amenities and ${tier} finishes.`,
      type: 'Villa',
      bhk: 3,
      category: 'Full Home',
      image: pickHeroImage('villa', 3, tier, i + 40),
      backgroundColor: backgroundColors[colorIndex],
      originalPrice: tier === 'essential' ? 2000000 : tier === 'luxury' ? 3500000 : 5000000,
      discountedPrice: tier === 'essential' ? 1600000 : tier === 'luxury' ? 2800000 : 4000000,
      features: features['villa'][tier],
      rooms: generateRooms(3, 'villa', colorIndex, i + 40)
    });
  }
  
  // 4BHK Villas
  for (let i = 0; i < 10; i++) {
    const tier = i % 3 === 0 ? 'essential' : i % 3 === 1 ? 'luxury' : 'ultimate';
    const colorIndex = (i + 4) % backgroundColors.length;
    packages.push({
      id: `villa-4bhk-${tier}-${String(i + 1).padStart(2, '0')}`,
      name: `4BHK VILLAS - ${tier.toUpperCase()} COLLECTION ${String(i + 1).padStart(2, '0')}`,
      subtitle: `Ultimate 4BHK Villa - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`,
      description: `Grand 4BHK villa with luxurious resort amenities and exclusive ${tier} finishes.`,
      type: 'Villa',
      bhk: 4,
      category: 'Full Home',
      image: pickHeroImage('villa', 4, tier, i + 50),
      backgroundColor: backgroundColors[colorIndex],
      originalPrice: tier === 'essential' ? 3000000 : tier === 'luxury' ? 5000000 : 7500000,
      discountedPrice: tier === 'essential' ? 2400000 : tier === 'luxury' ? 4000000 : 6000000,
      features: features['villa'][tier],
      rooms: generateRooms(4, 'villa', colorIndex, i + 50)
    });
  }
  
  return packages;
}

export const SEED_PACKAGES = generatePackages();
