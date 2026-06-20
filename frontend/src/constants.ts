import { DesignModel, RoomType, StyleType, ServiceItem, ServiceShowcase, Showroom } from './types';

export const COLORS = {
  ivory: '#FAF9F6',
  teak: '#4A3728',
  gold: '#D4AF37',
  charcoal: '#333333',
  clay: '#B2593D'
};

export const COMPANY_INFO = {
  name: 'AR Interia',
  tagline: 'LUXURY INTERIOR DESIGN & 3D VISUALIZATION',
  established: 2004,
  description: 'Premier interior design platform for apartments and villas.',
  warranty: '10 YEARS',
  completionDays: '40 Working Days',
  projectsPerMonth: '300',
  satisfiedCustomers: '14000+',
  employees: '1400',
  showrooms: '28',
  factorySize: '1,25,000 sq ft'
};

export const SERVICES: ServiceItem[] = [
  {
    id: 's1',
    title: '3D Visualization',
    icon: '📐',
    description: 'See photorealistic previews before execution.',
    video: 'https://www.youtube.com/embed/e1r0aZ_D8U8'
  },
  {
    id: 's2',
    title: 'AI Design Assistant',
    icon: '✨',
    description: 'Get instant style and layout suggestions.',
    video: 'https://www.youtube.com/embed/jZzB98s7bZk'
  },
  {
    id: 's3',
    title: 'Turnkey Execution',
    icon: '🛠️',
    description: 'From design to handover with timeline tracking.',
    video: 'https://www.youtube.com/embed/tgbNymZ7vqY'
  },
  {
    id: 's4',
    title: 'Modular Kitchen',
    icon: '👨‍🍳',
    description: 'Custom modular kitchens with premium finishes.',
    video: ''
  },
  {
    id: 's5',
    title: 'Wardrobe Design',
    icon: '🚪',
    description: 'Bespoke wardrobe solutions with smart storage.',
    video: ''
  },
  {
    id: 's6',
    title: 'Living Room Interiors',
    icon: '🛋️',
    description: 'Complete living room transformation.',
    video: ''
  },
  {
    id: 's7',
    title: 'Bedroom Design',
    icon: '🛏️',
    description: 'Cozy and elegant bedroom interiors.',
    video: ''
  },
  {
    id: 's8',
    title: 'False Ceiling',
    icon: '✨',
    description: 'Modern false ceiling designs with lighting.',
    video: ''
  },
  {
    id: 's9',
    title: 'Painting Services',
    icon: '🖌️',
    description: 'Professional painting and texture services.',
    video: ''
  },
  {
    id: 's10',
    title: 'Flooring',
    icon: '🏺',
    description: 'Premium flooring - marble, wood, vinyl.',
    video: ''
  },
  {
    id: 's11',
    title: 'Lighting Design',
    icon: '💡',
    description: 'Architectural lighting solutions.',
    video: ''
  },
  {
    id: 's12',
    title: 'Bathroom Renovation',
    icon: '🚿',
    description: 'Modern bathroom fixtures and tiling.',
    video: ''
  },
  {
    id: 's13',
    title: 'Space Planning',
    icon: '📏',
    description: 'Optimal space utilization layouts.',
    video: ''
  },
  {
    id: 's14',
    title: 'Color Consultation',
    icon: '🎨',
    description: 'Professional color palette selection.',
    video: ''
  },
  {
    id: 's15',
    title: 'Furniture Selection',
    icon: '🪑',
    description: 'Curated furniture for your space.',
    video: ''
  },
  {
    id: 's16',
    title: 'Custom Carpentry',
    icon: '🪚',
    description: 'Bespoke carpentry and joinery work.',
    video: ''
  },
  {
    id: 's17',
    title: 'Material Consultation',
    icon: '🧱',
    description: 'Expert guidance on materials selection.',
    video: ''
  },
  {
    id: 's18',
    title: 'Balcony Design',
    icon: '🌿',
    description: 'Transform balconies into green spaces.',
    video: ''
  },
  {
    id: 's19',
    title: 'Pooja Room',
    icon: '🕉️',
    description: 'Sacred space design and décor.',
    video: ''
  },
  {
    id: 's20',
    title: 'Kids Bedroom',
    icon: '🧸',
    description: 'Fun and functional kids room designs.',
    video: ''
  },
  {
    id: 's21',
    title: 'Home Office',
    icon: '💼',
    description: 'Productive workspace solutions.',
    video: ''
  },
  {
    id: 's22',
    title: 'Dining Area',
    icon: '🍽️',
    description: 'Elegant dining space designs.',
    video: ''
  },
  {
    id: 's23',
    title: 'TV Unit Design',
    icon: '📺',
    description: 'Modern TV unit and entertainment setup.',
    video: ''
  },
  {
    id: 's24',
    title: 'Crockery Unit',
    icon: '🥣',
    description: 'Designer crockery and display units.',
    video: ''
  },
  {
    id: 's25',
    title: 'Study Room',
    icon: '📚',
    description: 'Functional study room interiors.',
    video: ''
  },
  {
    id: 's26',
    title: 'Guest Room',
    icon: '🛌',
    description: 'Welcoming guest room designs.',
    video: ''
  },
  {
    id: 's27',
    title: 'Utility Area',
    icon: '🧺',
    description: 'Smart laundry and utility spaces.',
    video: ''
  },
  {
    id: 's28',
    title: 'Corridor Design',
    icon: '🚶',
    description: 'Stylish hallway and corridor designs.',
    video: ''
  },
  {
    id: 's29',
    title: 'Terrace/Garden',
    icon: '🌳',
    description: 'Outdoor terrace and garden setups.',
    video: ''
  },
  {
    id: 's30',
    title: 'Commercial Interiors',
    icon: '🏢',
    description: 'Office and commercial space design.',
    video: ''
  }
];

export const INITIAL_SERVICE_SHOWCASES: ServiceShowcase[] = [
  {
    id: 'showcase-1',
    title: 'Smart Kitchen Renovation',
    style: 'Modern Minimal',
    duration: '30 Days',
    price: 'From INR 2.9L',
    image: '/category/Kitchen/kitchen1.jpg',
    description: 'Modular planning, premium finishes, and integrated smart lighting.',
    serviceId: 's1',
    relatedImages: [
      '/category/Kitchen/kitchen2.jpg',
      '/category/Kitchen/kitchen3.jpg',
      '/category/Kitchen/kitchen4.jpg',
      '/category/Kitchen/kitchen5.jpg',
      '/category/Kitchen/kitchen6.jpg'
    ]
  },
  {
    id: 'showcase-2',
    title: 'Luxury Living Transformation',
    style: 'Contemporary',
    duration: '45 Days',
    price: 'From INR 5.4L',
    image: '/category/Living room/living2.jpg',
    description: 'Statement furniture, layered lighting, and premium wall treatments.',
    serviceId: 's3',
    relatedImages: [
      '/category/Living room/living3.jpg',
      '/category/Living room/living4.jpg',
      '/category/Living room/living5.jpg',
      '/category/Living room/living6.jpg',
      '/category/Living room/living7.jpg'
    ]
  },
  {
    id: 'showcase-3',
    title: 'Villa Wellness Wing',
    style: 'Resort Luxury',
    duration: '60 Days',
    price: 'From INR 11.5L',
    image: '/category/Kids-bedroom/kids-bedroom1.jpg',
    description: 'Modern kids room designs with playful themes and smart storage solutions.',
    serviceId: 's2',
    relatedImages: [
      '/category/Kids-bedroom/kids-bedroom2.jpg',
      '/category/Kids-bedroom/kids-bedroom3.jpg',
      '/category/Kids-bedroom/kids-bedroom4.jpg',
      '/category/Kids-bedroom/kids-bedroom5.jpg',
      '/category/Kids-bedroom/kids-bedroom6.jpg'
    ]
  }
];

const aptFeaturesByTier: Record<string, string[]> = {
  essential: ['Modular Kitchen', 'Wardrobes', 'Living + Dining', 'Balcony Design', 'Bathroom Vanity', 'Lighting', '10 Year Warranty'],
  luxury: ['Designer Kitchen', 'Walk-in Wardrobes', 'Grand Living', 'Spa Bathroom', 'Premium Balcony', 'Smart Controls', 'Premium Materials'],
  ultimate: ['Gourmet Kitchen', 'Master Suites', 'Home Office', 'Luxury Bathrooms', 'Entertainment Balcony', 'Full Automation', 'Lifetime Structure Warranty']
};

const villaFeaturesByTier: Record<string, string[]> = {
  essential: ['Modular Kitchen', 'Family Bedrooms', 'Living + Dining', 'Swimming Pool', 'Balcony Lounge', 'Home Theater', 'Home Gym'],
  luxury: ['Designer Kitchen', 'Master Suites', 'Grand Living', 'Swimming Pool', 'Premium Balconies', 'Cinema Theater', 'Fitness Studio'],
  ultimate: ['Gourmet Kitchen', 'Suite Bedrooms', 'Double-height Living', 'Infinity Pool', 'Sky Balcony', 'Private Theater', 'Wellness Gym']
};

// Feature to Image Mapping for displaying feature images in modals
export const featureImageMap: Record<string, string> = {
  'Modular Kitchen': '/category/Kitchen/kitchen1.jpg',
  'Designer Kitchen': '/category/Kitchen/kitchen2.jpg',
  'Gourmet Kitchen': '/category/Kitchen/kitchen3.jpg',
  'Chef Kitchen': '/category/Kitchen/kitchen4.jpg',
  'Wardrobes': '/category/wardrobe/wardrobe1.jpg',
  'Walk-in Wardrobes': '/category/wardrobe/wardrobe2.jpg',
  'Living + Dining': '/category/Living room/living1.jpg',
  'Grand Living': '/category/Living room/living2.jpg',
  'Double-height Living': '/category/Living room/living3.jpg',
  'Balcony Design': '/category/Balcony/balcony (1).jpg',
  'Bathroom Vanity': '/category/Bathroom/bathroom1.jpg',
  'Spa Bathroom': '/category/Bathroom/bathroom2.jpg',
  'Swimming Pool': '/category/Swimming pool/swimming pool.jpg',
  'Home Theater': '/category/Home theatre/home theatre (1).jpg',
  'Home Gym': '/category/Gym/gym (1).jpg',
  'Home Office': '/category/Office interior/office interior (1).jpg',
  'Master Suites': '/category/Master Bedroom/master-bedroom1.jpg',
  'Pooja Room': '/category/Pooja room/pooja-room1.jpg',
  'Terrace Garden': '/category/Terrace/terrace (1).jpg',
  'Family Bedrooms': '/category/Master Bedroom/master-bedroom2.jpg',
  'Classroom': '/category/Classroom/classroom1.jpg',
  'Meeting Room': '/category/Meeting room/meeting room (1).jpg',
  'Epoxy Floor': '/category/Epoxy Floor/epoxy1.jpg'
};

export const PACKAGES = [
  {
    "id": "apartment-1bhk-essential",
    "name": "APARTMENT 1BHK ESSENTIAL",
    "subtitle": "Smart 1BHK Apartment",
    "originalPrice": 400000,
    "discountedPrice": 300000,
    "features": [
      "1 Kitchen",
      "1 Bedroom",
      "1 Bathroom",
      "1 Living Area",
      "1 Balcony",
      "10 Year Warranty"
    ],
    "description": "A tailored 1BHK solution designed for maximum comfort and style.",
    "image": "/category/Custom/custom_01.png",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 1,
    "rooms": [
      {
        "id": "apartment-1bhk-essential-kitchen", "title": "Modular Kitchen", "image": "/category/Custom/custom_03.png",
        "description": "Efficient modular kitchen with smart storage solutions and modern finishes."
      },
      {
        "id": "apartment-1bhk-essential-bedroom", "title": "Bedroom", "image": "/category/Custom/custom_02.png",
        "description": "Comfortable bedroom with integrated wardrobe and calming aesthetics."
      },
      {
        "id": "apartment-1bhk-essential-living",
        "title": "Living Area",
        "image": "/category/Custom/custom_01.png",
        "description": "Open-plan living space with layered lighting and premium upholstery."
      },
      {
        "id": "apartment-1bhk-essential-bathroom",
        "title": "Bathroom",
        "image": "",
        "description": "Modern bathroom with premium fixtures and elegant finishes."
      },
      {
        "id": "apartment-1bhk-essential-balcony",
        "title": "Balcony",
        "image": "",
        "description": "Relaxing outdoor space with all-weather seating and urban views."
      }
    ]
  },
  {
    "id": "apartment-1bhk-luxury",
    "name": "APARTMENT 1BHK LUXURY",
    "subtitle": "Premium 1BHK Apartment",
    "originalPrice": 600000,
    "discountedPrice": 450000,
    "features": [
      "1 Kitchen",
      "1 Bedroom",
      "1 Bathroom",
      "1 Living Area",
      "1 Balcony",
      "10 Year Warranty"
    ],
    "description": "An exquisite 1BHK design featuring premium materials and bespoke layouts.",
    "image": "/category/Custom/custom_01.png",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 1,
    "rooms": [
      {
        "id": "apartment-1bhk-luxury-kitchen",
        "title": "Designer Kitchen",
        "image": "",
        "description": "Premium designer kitchen with high-end finishes and smart storage."
      },
      {
        "id": "apartment-1bhk-luxury-bedroom",
        "title": "Bedroom",
        "image": "",
        "description": "Luxurious bedroom with designer wallpaper and custom wardrobe."
      },
      {
        "id": "apartment-1bhk-luxury-living",
        "title": "Living Area",
        "image": "",
        "description": "Elegant living space with premium materials and layered lighting."
      },
      {
        "id": "apartment-1bhk-luxury-bathroom",
        "title": "Spa Bathroom",
        "image": "",
        "description": "Luxury spa-inspired bathroom with rainfall shower and marble finishes."
      },
      {
        "id": "apartment-1bhk-luxury-balcony",
        "title": "Premium Balcony",
        "image": "",
        "description": "Upscale outdoor retreat with premium furnishings and city views."
      }
    ]
  },
  {
    "id": "apartment-1bhk-ultimate",
    "name": "APARTMENT 1BHK ULTIMATE",
    "subtitle": "Signature 1BHK Apartment",
    "originalPrice": 1000000,
    "discountedPrice": 750000,
    "features": [
      "1 Kitchen",
      "1 Bedroom",
      "1 Bathroom",
      "1 Living Area",
      "1 Balcony",
      "10 Year Warranty"
    ],
    "description": "The peak of luxury living in a 1BHK configuration, equipped with advanced automation.",
    "image": "/category/Custom/custom_01.png",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 1,
    "rooms": [
      {
        "id": "apartment-1bhk-ultimate-kitchen",
        "title": "Gourmet Kitchen",
        "image": "",
        "description": "State-of-the-art gourmet kitchen with premium appliances and finishes."
      },
      {
        "id": "apartment-1bhk-ultimate-bedroom",
        "title": "Master Bedroom",
        "image": "/category/Custom/custom_03.png",
        "description": "Opulent master bedroom with custom millwork and luxury textiles."
      },
      {
        "id": "apartment-1bhk-ultimate-living",
        "title": "Living Area",
        "image": "",
        "description": "Sophisticated living room with designer furniture and smart home integration."
      },
      {
        "id": "apartment-1bhk-ultimate-bathroom",
        "title": "Luxury Bathroom",
        "image": "",
        "description": "Ultra-luxury bathroom with premium Italian marble and spa fixtures."
      },
      {
        "id": "apartment-1bhk-ultimate-balcony",
        "title": "Entertainment Balcony",
        "image": "",
        "description": "Expansive outdoor entertainment space with premium furnishings and panoramic views."
      }
    ]
  },
  {
    "id": "villa-3bhk-essential",
    "name": "VILLA 3BHK ESSENTIAL",
    "subtitle": "Smart 3BHK Villa",
    "originalPrice": 1200000,
    "discountedPrice": 900000,
    "features": [
      "Modular Kitchen",
      "Family Bedrooms",
      "Living + Dining",
      "Swimming Pool",
      "Balcony Lounge",
      "Home Theater",
      "Home Gym"
    ],
    "description": "A sprawling 3BHK estate plan blending elegance with everyday functionality.",
    "image": "/category/Custom/custom_04.png",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 3,
    "rooms": [
      {
        "id": "villa-3bhk-essential-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-3bhk-essential-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-3bhk-essential-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-3bhk-essential-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-3bhk-essential-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-3bhk-essential-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-3bhk-essential-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-3bhk-essential-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-3bhk-essential-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-3bhk-essential-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-3bhk-essential-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-3bhk-essential-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-3bhk-essential-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-3bhk-essential-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-3bhk-essential-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-3bhk-essential-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-3bhk-essential-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-3bhk-essential-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-3bhk-essential-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-3bhk-essential-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-4bhk-luxury",
    "name": "VILLA 4BHK LUXURY",
    "subtitle": "Premium 4BHK Villa",
    "originalPrice": 2000000,
    "discountedPrice": 1500000,
    "features": [
      "Designer Kitchen",
      "Master Suites",
      "Grand Living",
      "Swimming Pool",
      "Premium Balconies",
      "Cinema Theater",
      "Fitness Studio"
    ],
    "description": "A luxury 4BHK Villa design solution with specialized modular planning for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 4,
    "rooms": [
      {
        "id": "villa-4bhk-luxury-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-4bhk-luxury-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-4bhk-luxury-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-4bhk-luxury-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-4bhk-luxury-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-4bhk-luxury-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-4bhk-luxury-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-4bhk-luxury-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-4bhk-luxury-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-4bhk-luxury-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-4bhk-luxury-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-4bhk-luxury-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-4bhk-luxury-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-4bhk-luxury-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-4bhk-luxury-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-4bhk-luxury-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-4bhk-luxury-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-4bhk-luxury-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-4bhk-luxury-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-4bhk-luxury-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-5bhk-ultimate",
    "name": "VILLA 5BHK ULTIMATE",
    "subtitle": "Signature 5BHK Villa",
    "originalPrice": 3500000,
    "discountedPrice": 2800000,
    "features": [
      "Gourmet Kitchen",
      "Suite Bedrooms",
      "Double-height Living",
      "Infinity Pool",
      "Sky Balcony",
      "Private Theater",
      "Wellness Gym"
    ],
    "description": "An ultimate 5BHK Villa design solution with specialized automation and stone finishes for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 5,
    "rooms": [
      {
        "id": "villa-5bhk-ultimate-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-5bhk-ultimate-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-5bhk-ultimate-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-5bhk-ultimate-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-5bhk-ultimate-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-5bhk-ultimate-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-5bhk-ultimate-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-5bhk-ultimate-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-5bhk-ultimate-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-5bhk-ultimate-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-5bhk-ultimate-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-5bhk-ultimate-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-5bhk-ultimate-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-5bhk-ultimate-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-5bhk-ultimate-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-5bhk-ultimate-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-5bhk-ultimate-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-5bhk-ultimate-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-5bhk-ultimate-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-5bhk-ultimate-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "apartment-2bhk-essential",
    "name": "APARTMENT 2BHK ESSENTIAL",
    "subtitle": "Smart 2BHK Apartment",
    "originalPrice": 800000,
    "discountedPrice": 600000,
    "features": [
      "1 Kitchen",
      "2 Bedrooms",
      "2 Bathrooms",
      "1 Dining Room",
      "1 Balcony",
      "10 Year Warranty"
    ],
    "description": "A tailored 2BHK solution designed for maximum comfort and style.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 2,
    "rooms": [
      {
        "id": "apartment-2bhk-essential-kitchen",
        "title": "Modular Kitchen",
        "image": "",
        "description": "Efficient modular kitchen with smart storage solutions and modern finishes."
      },
      {
        "id": "apartment-2bhk-essential-bedroom-1",
        "title": "Master Bedroom",
        "image": "",
        "description": "Spacious master bedroom with integrated wardrobe and calming aesthetics."
      },
      {
        "id": "apartment-2bhk-essential-bedroom-2",
        "title": "Second Bedroom",
        "image": "",
        "description": "Comfortable second bedroom perfect for children or guests."
      },
      {
        "id": "apartment-2bhk-essential-bathroom-1",
        "title": "Master Bathroom",
        "image": "",
        "description": "Modern attached bathroom with premium fixtures and elegant finishes."
      },
      {
        "id": "apartment-2bhk-essential-bathroom-2",
        "title": "Common Bathroom",
        "image": "",
        "description": "Well-designed common bathroom accessible from living areas."
      },
      {
        "id": "apartment-2bhk-essential-dining",
        "title": "Dining Room",
        "image": "",
        "description": "Elegant dining area with space for family gatherings."
      },
      {
        "id": "apartment-2bhk-essential-balcony",
        "title": "Balcony",
        "image": "",
        "description": "Relaxing outdoor space with all-weather seating and urban views."
      }
    ]
  },
  {
    "id": "apartment-2bhk-luxury",
    "name": "APARTMENT 2BHK LUXURY",
    "subtitle": "Premium 2BHK Apartment",
    "originalPrice": 1200000,
    "discountedPrice": 900000,
    "features": [
      "1 Kitchen",
      "2 Bedrooms",
      "2 Bathrooms",
      "1 Dining Room",
      "1 Balcony",
      "10 Year Warranty"
    ],
    "description": "An exquisite 2BHK design featuring premium materials and bespoke layouts.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 2,
    "rooms": [
      {
        "id": "apartment-2bhk-luxury-kitchen",
        "title": "Designer Kitchen",
        "image": "",
        "description": "Premium designer kitchen with high-end finishes and smart storage."
      },
      {
        "id": "apartment-2bhk-luxury-bedroom-1",
        "title": "Master Bedroom",
        "image": "",
        "description": "Luxurious master bedroom with designer wallpaper and custom wardrobe."
      },
      {
        "id": "apartment-2bhk-luxury-bedroom-2",
        "title": "Second Bedroom",
        "image": "",
        "description": "Elegant second bedroom with premium finishes and ample natural light."
      },
      {
        "id": "apartment-2bhk-luxury-bathroom-1",
        "title": "Master Spa Bathroom",
        "image": "",
        "description": "Luxury spa-inspired attached bathroom with rainfall shower and marble finishes."
      },
      {
        "id": "apartment-2bhk-luxury-bathroom-2",
        "title": "Guest Bathroom",
        "image": "",
        "description": "Sophisticated guest bathroom with premium fixtures and designer tiles."
      },
      {
        "id": "apartment-2bhk-luxury-dining",
        "title": "Dining Room",
        "image": "",
        "description": "Refined dining space with designer lighting and premium furnishings."
      },
      {
        "id": "apartment-2bhk-luxury-balcony",
        "title": "Premium Balcony",
        "image": "",
        "description": "Upscale outdoor retreat with premium furnishings and city views."
      }
    ]
  },
  {
    "id": "apartment-2bhk-ultimate",
    "name": "APARTMENT 2BHK ULTIMATE",
    "subtitle": "Signature 2BHK Apartment",
    "originalPrice": 2000000,
    "discountedPrice": 1500000,
    "features": [
      "1 Kitchen",
      "2 Bedrooms",
      "2 Bathrooms",
      "1 Dining Room",
      "1 Balcony",
      "10 Year Warranty"
    ],
    "description": "The peak of luxury living in a 2BHK configuration, equipped with advanced automation.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 2,
    "rooms": [
      {
        "id": "apartment-2bhk-ultimate-kitchen",
        "title": "Gourmet Kitchen",
        "image": "",
        "description": "State-of-the-art gourmet kitchen with premium appliances and finishes."
      },
      {
        "id": "apartment-2bhk-ultimate-bedroom-1",
        "title": "Master Bedroom Suite",
        "image": "",
        "description": "Opulent master bedroom with custom millwork and luxury textiles."
      },
      {
        "id": "apartment-2bhk-ultimate-bedroom-2",
        "title": "Second Bedroom Suite",
        "image": "",
        "description": "Luxurious second bedroom with premium finishes and designer accents."
      },
      {
        "id": "apartment-2bhk-ultimate-bathroom-1",
        "title": "Master Luxury Bathroom",
        "image": "",
        "description": "Ultra-luxury attached bathroom with premium Italian marble and spa fixtures."
      },
      {
        "id": "apartment-2bhk-ultimate-bathroom-2",
        "title": "Guest Luxury Bathroom",
        "image": "",
        "description": "Exquisite guest bathroom with designer fixtures and premium materials."
      },
      {
        "id": "apartment-2bhk-ultimate-dining",
        "title": "Dining Room",
        "image": "",
        "description": "Sophisticated dining space with bespoke table and statement lighting."
      },
      {
        "id": "apartment-2bhk-ultimate-balcony",
        "title": "Entertainment Balcony",
        "image": "",
        "description": "Expansive outdoor entertainment space with premium furnishings and panoramic views."
      }
    ]
  },
  {
    "id": "villa-2bhk-essential",
    "name": "VILLA 2BHK ESSENTIAL",
    "subtitle": "Smart 2BHK Villa",
    "originalPrice": 1300000,
    "discountedPrice": 975000,
    "features": [
      "Modular Kitchen",
      "Family Bedrooms",
      "Living + Dining",
      "Swimming Pool",
      "Balcony Lounge",
      "Home Theater",
      "Home Gym"
    ],
    "description": "A sprawling 2BHK estate plan blending elegance with everyday functionality.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 2,
    "rooms": [
      {
        "id": "villa-2bhk-essential-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-2bhk-essential-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-2bhk-essential-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-2bhk-essential-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-2bhk-essential-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-2bhk-essential-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-2bhk-essential-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-2bhk-essential-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-2bhk-essential-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-2bhk-essential-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-2bhk-essential-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-2bhk-essential-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-2bhk-essential-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-2bhk-essential-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-2bhk-essential-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-2bhk-essential-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-2bhk-essential-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-2bhk-essential-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-2bhk-essential-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-2bhk-essential-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-2bhk-luxury",
    "name": "VILLA 2BHK LUXURY",
    "subtitle": "Premium 2BHK Villa",
    "originalPrice": 1950000,
    "discountedPrice": 1462500,
    "features": [
      "Designer Kitchen",
      "Master Suites",
      "Grand Living",
      "Swimming Pool",
      "Premium Balconies",
      "Cinema Theater",
      "Fitness Studio"
    ],
    "description": "A luxury 2BHK Villa design solution with specialized modular planning for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 2,
    "rooms": [
      {
        "id": "villa-2bhk-luxury-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-2bhk-luxury-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-2bhk-luxury-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-2bhk-luxury-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-2bhk-luxury-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-2bhk-luxury-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-2bhk-luxury-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-2bhk-luxury-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-2bhk-luxury-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-2bhk-luxury-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-2bhk-luxury-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-2bhk-luxury-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-2bhk-luxury-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-2bhk-luxury-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-2bhk-luxury-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-2bhk-luxury-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-2bhk-luxury-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-2bhk-luxury-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-2bhk-luxury-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-2bhk-luxury-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-2bhk-ultimate",
    "name": "VILLA 2BHK ULTIMATE",
    "subtitle": "Signature 2BHK Villa",
    "originalPrice": 3250000,
    "discountedPrice": 2437500,
    "features": [
      "Gourmet Kitchen",
      "Suite Bedrooms",
      "Double-height Living",
      "Infinity Pool",
      "Sky Balcony",
      "Private Theater",
      "Wellness Gym"
    ],
    "description": "A ultimate 2BHK Villa design solution with specialized automation and stone finishes for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 2,
    "rooms": [
      {
        "id": "villa-2bhk-ultimate-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-2bhk-ultimate-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-2bhk-ultimate-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-2bhk-ultimate-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-2bhk-ultimate-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-2bhk-ultimate-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-2bhk-ultimate-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-2bhk-ultimate-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-2bhk-ultimate-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-2bhk-ultimate-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-2bhk-ultimate-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-2bhk-ultimate-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-2bhk-ultimate-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-2bhk-ultimate-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-2bhk-ultimate-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-2bhk-ultimate-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-2bhk-ultimate-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-2bhk-ultimate-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-2bhk-ultimate-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-2bhk-ultimate-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "apartment-3bhk-essential",
    "name": "APARTMENT 3BHK ESSENTIAL",
    "subtitle": "Smart 3BHK Apartment",
    "originalPrice": 1200000,
    "discountedPrice": 900000,
    "features": [
      "Modular Kitchen",
      "Wardrobes",
      "Living + Dining",
      "Balcony Design",
      "Bathroom Vanity",
      "Lighting",
      "10 Year Warranty"
    ],
    "description": "A tailored 3BHK solution designed for maximum comfort and style.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 3,
    "rooms": [
      {
        "id": "apartment-3bhk-essential-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "apartment-3bhk-essential-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "apartment-3bhk-essential-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "apartment-3bhk-essential-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "apartment-3bhk-essential-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "apartment-3bhk-essential-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "apartment-3bhk-essential-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "apartment-3bhk-essential-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "apartment-3bhk-essential-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "apartment-3bhk-essential-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "apartment-3bhk-essential-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "apartment-3bhk-essential-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "apartment-3bhk-essential-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "apartment-3bhk-essential-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "apartment-3bhk-essential-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "apartment-3bhk-essential-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "apartment-3bhk-essential-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "apartment-3bhk-essential-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "apartment-3bhk-essential-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "apartment-3bhk-essential-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "apartment-3bhk-luxury",
    "name": "APARTMENT 3BHK LUXURY",
    "subtitle": "Premium 3BHK Apartment",
    "originalPrice": 1800000,
    "discountedPrice": 1350000,
    "features": [
      "Designer Kitchen",
      "Walk-in Wardrobes",
      "Grand Living",
      "Spa Bathroom",
      "Premium Balcony",
      "Smart Controls",
      "Premium Materials"
    ],
    "description": "An exquisite 3BHK design featuring premium materials and bespoke layouts.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 3,
    "rooms": [
      {
        "id": "apartment-3bhk-luxury-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "apartment-3bhk-luxury-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "apartment-3bhk-luxury-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "apartment-3bhk-luxury-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "apartment-3bhk-luxury-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "apartment-3bhk-luxury-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "apartment-3bhk-luxury-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "apartment-3bhk-luxury-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "apartment-3bhk-luxury-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "apartment-3bhk-luxury-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "apartment-3bhk-luxury-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "apartment-3bhk-luxury-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "apartment-3bhk-luxury-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "apartment-3bhk-luxury-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "apartment-3bhk-luxury-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "apartment-3bhk-luxury-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "apartment-3bhk-luxury-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "apartment-3bhk-luxury-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "apartment-3bhk-luxury-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "apartment-3bhk-luxury-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "apartment-3bhk-ultimate",
    "name": "APARTMENT 3BHK ULTIMATE",
    "subtitle": "Signature 3BHK Apartment",
    "originalPrice": 3000000,
    "discountedPrice": 2250000,
    "features": [
      "Gourmet Kitchen",
      "Master Suites",
      "Home Office",
      "Luxury Bathrooms",
      "Entertainment Balcony",
      "Full Automation",
      "Lifetime Structure Warranty"
    ],
    "description": "The peak of luxury living in a 3BHK configuration, equipped with advanced automation.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 3,
    "rooms": [
      {
        "id": "apartment-3bhk-ultimate-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "apartment-3bhk-ultimate-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "apartment-3bhk-ultimate-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "apartment-3bhk-ultimate-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "apartment-3bhk-ultimate-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "apartment-3bhk-ultimate-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "apartment-3bhk-ultimate-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "apartment-3bhk-ultimate-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "apartment-3bhk-ultimate-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "apartment-3bhk-ultimate-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "apartment-3bhk-ultimate-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "apartment-3bhk-ultimate-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "apartment-3bhk-ultimate-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "apartment-3bhk-ultimate-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "apartment-3bhk-ultimate-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "apartment-3bhk-ultimate-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "apartment-3bhk-ultimate-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "apartment-3bhk-ultimate-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "apartment-3bhk-ultimate-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "apartment-3bhk-ultimate-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-3bhk-essential",
    "name": "VILLA 3BHK ESSENTIAL",
    "subtitle": "Smart 3BHK Villa",
    "originalPrice": 1700000,
    "discountedPrice": 1275000,
    "features": [
      "Modular Kitchen",
      "Family Bedrooms",
      "Living + Dining",
      "Swimming Pool",
      "Balcony Lounge",
      "Home Theater",
      "Home Gym"
    ],
    "description": "A sprawling 3BHK estate plan blending elegance with everyday functionality.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 3,
    "rooms": [
      {
        "id": "villa-3bhk-essential-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-3bhk-essential-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-3bhk-essential-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-3bhk-essential-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-3bhk-essential-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-3bhk-essential-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-3bhk-essential-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-3bhk-essential-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-3bhk-essential-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-3bhk-essential-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-3bhk-essential-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-3bhk-essential-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-3bhk-essential-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-3bhk-essential-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-3bhk-essential-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-3bhk-essential-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-3bhk-essential-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-3bhk-essential-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-3bhk-essential-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-3bhk-essential-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-3bhk-luxury",
    "name": "VILLA 3BHK LUXURY",
    "subtitle": "Premium 3BHK Villa",
    "originalPrice": 2550000,
    "discountedPrice": 1912500,
    "features": [
      "Designer Kitchen",
      "Master Suites",
      "Grand Living",
      "Swimming Pool",
      "Premium Balconies",
      "Cinema Theater",
      "Fitness Studio"
    ],
    "description": "A luxury 3BHK Villa design solution with specialized modular planning for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 3,
    "rooms": [
      {
        "id": "villa-3bhk-luxury-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-3bhk-luxury-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-3bhk-luxury-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-3bhk-luxury-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-3bhk-luxury-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-3bhk-luxury-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-3bhk-luxury-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-3bhk-luxury-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-3bhk-luxury-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-3bhk-luxury-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-3bhk-luxury-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-3bhk-luxury-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-3bhk-luxury-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-3bhk-luxury-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-3bhk-luxury-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-3bhk-luxury-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-3bhk-luxury-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-3bhk-luxury-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-3bhk-luxury-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-3bhk-luxury-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-3bhk-ultimate",
    "name": "VILLA 3BHK ULTIMATE",
    "subtitle": "Signature 3BHK Villa",
    "originalPrice": 4250000,
    "discountedPrice": 3187500,
    "features": [
      "Gourmet Kitchen",
      "Suite Bedrooms",
      "Double-height Living",
      "Infinity Pool",
      "Sky Balcony",
      "Private Theater",
      "Wellness Gym"
    ],
    "description": "A ultimate 3BHK Villa design solution with specialized automation and stone finishes for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 3,
    "rooms": [
      {
        "id": "villa-3bhk-ultimate-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-3bhk-ultimate-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-3bhk-ultimate-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-3bhk-ultimate-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-3bhk-ultimate-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-3bhk-ultimate-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-3bhk-ultimate-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-3bhk-ultimate-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-3bhk-ultimate-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-3bhk-ultimate-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-3bhk-ultimate-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-3bhk-ultimate-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-3bhk-ultimate-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-3bhk-ultimate-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-3bhk-ultimate-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-3bhk-ultimate-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-3bhk-ultimate-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-3bhk-ultimate-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-3bhk-ultimate-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-3bhk-ultimate-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "apartment-4bhk-essential",
    "name": "APARTMENT 4BHK ESSENTIAL",
    "subtitle": "Smart 4BHK Apartment",
    "originalPrice": 1600000,
    "discountedPrice": 1200000,
    "features": [
      "Modular Kitchen",
      "Wardrobes",
      "Living + Dining",
      "Balcony Design",
      "Bathroom Vanity",
      "Lighting",
      "10 Year Warranty"
    ],
    "description": "A tailored 4BHK solution designed for maximum comfort and style.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 4,
    "rooms": [
      {
        "id": "apartment-4bhk-essential-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "apartment-4bhk-essential-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "apartment-4bhk-essential-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "apartment-4bhk-essential-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "apartment-4bhk-essential-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "apartment-4bhk-essential-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "apartment-4bhk-essential-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "apartment-4bhk-essential-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "apartment-4bhk-essential-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "apartment-4bhk-essential-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "apartment-4bhk-essential-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "apartment-4bhk-essential-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "apartment-4bhk-essential-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "apartment-4bhk-essential-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "apartment-4bhk-essential-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "apartment-4bhk-essential-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "apartment-4bhk-essential-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "apartment-4bhk-essential-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "apartment-4bhk-essential-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "apartment-4bhk-essential-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "apartment-4bhk-luxury",
    "name": "APARTMENT 4BHK LUXURY",
    "subtitle": "Premium 4BHK Apartment",
    "originalPrice": 2400000,
    "discountedPrice": 1800000,
    "features": [
      "Designer Kitchen",
      "Walk-in Wardrobes",
      "Grand Living",
      "Spa Bathroom",
      "Premium Balcony",
      "Smart Controls",
      "Premium Materials"
    ],
    "description": "An exquisite 4BHK design featuring premium materials and bespoke layouts.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 4,
    "rooms": [
      {
        "id": "apartment-4bhk-luxury-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "apartment-4bhk-luxury-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "apartment-4bhk-luxury-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "apartment-4bhk-luxury-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "apartment-4bhk-luxury-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "apartment-4bhk-luxury-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "apartment-4bhk-luxury-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "apartment-4bhk-luxury-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "apartment-4bhk-luxury-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "apartment-4bhk-luxury-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "apartment-4bhk-luxury-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "apartment-4bhk-luxury-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "apartment-4bhk-luxury-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "apartment-4bhk-luxury-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "apartment-4bhk-luxury-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "apartment-4bhk-luxury-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "apartment-4bhk-luxury-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "apartment-4bhk-luxury-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "apartment-4bhk-luxury-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "apartment-4bhk-luxury-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "apartment-4bhk-ultimate",
    "name": "APARTMENT 4BHK ULTIMATE",
    "subtitle": "Signature 4BHK Apartment",
    "originalPrice": 4000000,
    "discountedPrice": 3000000,
    "features": [
      "Gourmet Kitchen",
      "Master Suites",
      "Home Office",
      "Luxury Bathrooms",
      "Entertainment Balcony",
      "Full Automation",
      "Lifetime Structure Warranty"
    ],
    "description": "The peak of luxury living in a 4BHK configuration, equipped with advanced automation.",
    "image": "",
    "category": "Full Home",
    "type": "Apartment",
    "bhk": 4,
    "rooms": [
      {
        "id": "apartment-4bhk-ultimate-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "apartment-4bhk-ultimate-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "apartment-4bhk-ultimate-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "apartment-4bhk-ultimate-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "apartment-4bhk-ultimate-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "apartment-4bhk-ultimate-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "apartment-4bhk-ultimate-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "apartment-4bhk-ultimate-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "apartment-4bhk-ultimate-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "apartment-4bhk-ultimate-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "apartment-4bhk-ultimate-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "apartment-4bhk-ultimate-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "apartment-4bhk-ultimate-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "apartment-4bhk-ultimate-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "apartment-4bhk-ultimate-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "apartment-4bhk-ultimate-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "apartment-4bhk-ultimate-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "apartment-4bhk-ultimate-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "apartment-4bhk-ultimate-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "apartment-4bhk-ultimate-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-4bhk-essential",
    "name": "VILLA 4BHK ESSENTIAL",
    "subtitle": "Smart 4BHK Villa",
    "originalPrice": 2100000,
    "discountedPrice": 1575000,
    "features": [
      "Modular Kitchen",
      "Family Bedrooms",
      "Living + Dining",
      "Swimming Pool",
      "Balcony Lounge",
      "Home Theater",
      "Home Gym"
    ],
    "description": "A sprawling 4BHK estate plan blending elegance with everyday functionality.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 4,
    "rooms": [
      {
        "id": "villa-4bhk-essential-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-4bhk-essential-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-4bhk-essential-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-4bhk-essential-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-4bhk-essential-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-4bhk-essential-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-4bhk-essential-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-4bhk-essential-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-4bhk-essential-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-4bhk-essential-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-4bhk-essential-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-4bhk-essential-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-4bhk-essential-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-4bhk-essential-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-4bhk-essential-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-4bhk-essential-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-4bhk-essential-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-4bhk-essential-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-4bhk-essential-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-4bhk-essential-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-4bhk-luxury",
    "name": "VILLA 4BHK LUXURY",
    "subtitle": "Premium 4BHK Villa",
    "originalPrice": 3150000,
    "discountedPrice": 2362500,
    "features": [
      "Designer Kitchen",
      "Master Suites",
      "Grand Living",
      "Swimming Pool",
      "Premium Balconies",
      "Cinema Theater",
      "Fitness Studio"
    ],
    "description": "A luxury 4BHK Villa design solution with specialized modular planning for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 4,
    "rooms": [
      {
        "id": "villa-4bhk-luxury-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-4bhk-luxury-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-4bhk-luxury-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-4bhk-luxury-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-4bhk-luxury-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-4bhk-luxury-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-4bhk-luxury-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-4bhk-luxury-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-4bhk-luxury-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-4bhk-luxury-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-4bhk-luxury-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-4bhk-luxury-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-4bhk-luxury-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-4bhk-luxury-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-4bhk-luxury-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-4bhk-luxury-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-4bhk-luxury-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-4bhk-luxury-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-4bhk-luxury-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-4bhk-luxury-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  },
  {
    "id": "villa-4bhk-ultimate",
    "name": "VILLA 4BHK ULTIMATE",
    "subtitle": "Signature 4BHK Villa",
    "originalPrice": 5250000,
    "discountedPrice": 3937500,
    "features": [
      "Gourmet Kitchen",
      "Suite Bedrooms",
      "Double-height Living",
      "Infinity Pool",
      "Sky Balcony",
      "Private Theater",
      "Wellness Gym"
    ],
    "description": "A ultimate 4BHK Villa design solution with specialized automation and stone finishes for a premium lifestyle.",
    "image": "",
    "category": "Full Home",
    "type": "Villa",
    "bhk": 4,
    "rooms": [
      {
        "id": "villa-4bhk-ultimate-design-1",
        "title": "Modular Kitchen Concept",
        "image": "",
        "description": "Linear kitchen layout with efficient prep and storage zones for modern living."
      },
      {
        "id": "villa-4bhk-ultimate-design-2",
        "title": "Master Suite Retreat",
        "image": "",
        "description": "Calm master bedroom with designer wallpaper and integrated wardrobe wall."
      },
      {
        "id": "villa-4bhk-ultimate-design-3",
        "title": "Luxe Living Area",
        "image": "",
        "description": "Open-plan living space featuring layered lighting and premium upholstery."
      },
      {
        "id": "villa-4bhk-ultimate-design-4",
        "title": "Grand Dining Hall",
        "image": "",
        "description": "Elegant dining area with bespoke table and signature pendant lighting."
      },
      {
        "id": "villa-4bhk-ultimate-design-5",
        "title": "Modern Kid's Oasis",
        "image": "",
        "description": "Safe, vibrant and functional space for growing children to play and learn."
      },
      {
        "id": "villa-4bhk-ultimate-design-6",
        "title": "Executive Home Office",
        "image": "",
        "description": "Ergonomic workspace with soundproofing and luxury desk setup."
      },
      {
        "id": "villa-4bhk-ultimate-design-7",
        "title": "Serene Guest Suite",
        "image": "",
        "description": "Welcoming room for visitors with boutique hotel-style finishes."
      },
      {
        "id": "villa-4bhk-ultimate-design-8",
        "title": "Zen Pooja Sanctum",
        "image": "",
        "description": "Indian cultural prayer space with carved stone and soft niche lighting."
      },
      {
        "id": "villa-4bhk-ultimate-design-9",
        "title": "Skyline Balcony Lounge",
        "image": "",
        "description": "Relaxing outdoor corner with all-weather seating and urban vistas."
      },
      {
        "id": "villa-4bhk-ultimate-design-10",
        "title": "Premium Closet Design",
        "image": "",
        "description": "Spacious wardrobe system with built-in sensors and premium wood finish."
      },
      {
        "id": "villa-4bhk-ultimate-design-11",
        "title": "Spa-Inspired Bathroom",
        "image": "",
        "description": "Luxury bath with rainfall shower and marble flooring for ultimate relaxation."
      },
      {
        "id": "villa-4bhk-ultimate-design-12",
        "title": "Immersive Home Cinema",
        "image": "",
        "description": "Dolby Atmos enabled screening room with raised seating and velvet drapes."
      },
      {
        "id": "villa-4bhk-ultimate-design-13",
        "title": "Professional Home Gym",
        "image": "",
        "description": "Aerobic and strength training zone with non-slip flooring and mirrors."
      },
      {
        "id": "villa-4bhk-ultimate-design-14",
        "title": "Lush Terrace Garden",
        "image": "",
        "description": "Penthouse rooftop garden with automatic irrigation and ambient lighting."
      },
      {
        "id": "villa-4bhk-ultimate-design-15",
        "title": "Chic Breakfast Nook",
        "image": "",
        "description": "Cozy morning corner integrated into the kitchen for casual dining."
      },
      {
        "id": "villa-4bhk-ultimate-design-16",
        "title": "Designer Walk-in Robe",
        "image": "",
        "description": "Expanding dressing room with custom shoe racks and accessory islands."
      },
      {
        "id": "villa-4bhk-ultimate-design-17",
        "title": "Gallery Foyer Design",
        "image": "",
        "description": "Stunning entryway with statement art and designer console table."
      },
      {
        "id": "villa-4bhk-ultimate-design-18",
        "title": "Bespoke Home Bar",
        "image": "",
        "description": "Sophisticated spirits corner with marble counter and back-lit shelving."
      },
      {
        "id": "villa-4bhk-ultimate-design-19",
        "title": "Reading & Study Nook",
        "image": "",
        "description": "Quiet library corner with custom shelving and ergonomic lounge chair."
      },
      {
        "id": "villa-4bhk-ultimate-design-20",
        "title": "Smart Home Node",
        "image": "",
        "description": "Centralized automation hub for lighting, security and climate control."
      }
    ]
  }
];
export const SERVICE_CATEGORIES = [
  { id: 'kitchen', name: 'KITCHEN', icon: '🍳', color: '#E8956C' },
  { id: 'bedroom', name: 'BEDROOM', icon: '🛏️', color: '#9B7BA8' },
  { id: 'living', name: 'LIVING', icon: '🛋️', color: '#6B8E99' },
  { id: 'dining', name: 'DINING', icon: '🍽️', color: '#8B7355' }
];

export const SHOWROOMS: Showroom[] = [
  { id: 'sr-1', city: 'BENGALURU', locations: [{ area: 'HSR Layout', phone: '+91 9995517777' }] },
  { id: 'sr-2', city: 'MUMBAI', locations: [{ area: 'Andheri East', phone: '+91 9072245555' }] },
  { id: 'sr-3', city: 'HYDERABAD', locations: [{ area: 'Banjara Hills', phone: '+91 9495087777' }] },
  { id: 'sr-4', city: 'PUNE', locations: [{ area: 'Hinjawadi', phone: '+91 8078962222' }] }
];

export const SAMPLE_MODELS: DesignModel[] = [
  {
    id: 'm1',
    title: 'Velvet Armchair',
    category: RoomType.LIVING,
    style: StyleType.MODERN,
    price: 34500,
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.glb',
    previewImage: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800',
    description: 'Premium accent chair for modern lounges.'
  },
  {
    id: 'm2',
    title: 'Pendant Light',
    category: RoomType.KITCHEN,
    style: StyleType.MINIMALIST,
    price: 12800,
    modelUrl: 'https://modelviewer.dev/shared-assets/models/IridescentDishWithOlives.glb',
    previewImage: 'https://images.unsplash.com/photo-1513506491745-1d2627052272?auto=format&fit=crop&q=80&w=800',
    description: 'Industrial pendant concept for dining or island counters.'
  },
  {
    id: 'm3',
    title: 'Decor Camera Piece',
    category: RoomType.OFFICE,
    style: StyleType.INDIAN,
    price: 9200,
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    previewImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    description: 'Classic decor object for study corners.'
  },
  {
    id: 'm4',
    title: 'Sculpture Feature',
    category: RoomType.BEDROOM,
    style: StyleType.MODERN,
    price: 18500,
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/NeilArmstrong/glTF-Binary/NeilArmstrong.glb',
    previewImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    description: 'Statement sculpture for bedroom and foyer styling.'
  },
  {
    id: 'm5',
    title: 'Avant Helmet Art',
    category: RoomType.LIVING,
    style: StyleType.MINIMALIST,
    price: 26000,
    modelUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    previewImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
    description: 'Bold table art for contemporary interiors.'
  }
];
