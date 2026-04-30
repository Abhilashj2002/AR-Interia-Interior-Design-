// New Package Seed Data - 60+ Packages for 1BHK, 2BHK, 3BHK, 4BHK, Apartment, Villa
// Run this in browser console or import via admin panel

export const NEW_PACKAGES = [
  // ==================== 1BHK PACKAGES (10) ====================
  {
    id: '1bhk-starter',
    name: '1BHK STARTER',
    subtitle: 'Compact & Smart Living',
    originalPrice: 450000,
    discountedPrice: 315000,
    features: ['Modular Kitchen', 'King Bedroom', 'Living TV Unit', 'Bathroom Vanity', 'Wardrobes', 'Basic Lighting', '10 Year Warranty'],
    description: 'Perfect starter package for 1BHK apartments with smart space utilization.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Master Bedroom', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800', description: 'King bed with wardrobe' },
      { id: 'kitchen', title: 'Modular Kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800', description: 'L-shaped compact kitchen' },
      { id: 'living', title: 'Living Room', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800', description: 'Cozy living space' },
      { id: 'bathroom', title: 'Bathroom', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800', description: 'Modern bathroom with vanity' }
    ]
  },
  {
    id: '1bhk-essential',
    name: '1BHK ESSENTIAL',
    subtitle: 'Complete Home Solution',
    originalPrice: 550000,
    discountedPrice: 385000,
    features: ['Premium Kitchen', 'Upholstered Bed', 'Sofa Set', 'Dining Table', 'Full Wardrobes', 'LED Lighting', 'Painting'],
    description: 'Essential 1BHK package with premium finishes.',
    image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Bedroom', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'Kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Living + Dining', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Bathroom', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800' },
      { id: 'balcony', title: 'Balcony', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-classic',
    name: '1BHK CLASSIC',
    subtitle: 'Elegant Urban Living',
    originalPrice: 650000,
    discountedPrice: 455000,
    features: ['L-Shape Kitchen', 'King Bed with LED', 'L-Shaped Sofa', '4-Seater Dining', 'Walk-in Wardrobe', 'False Ceiling'],
    description: 'Classic 1BHK with elegant finishes.',
    image: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Master Bedroom', image: 'https://images.unsplash.com/photo-1618219944342-824e40a13285?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'L-Shape Kitchen', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Living Room', image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Dining Area', image: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Bathroom', image: 'https://images.unsplash.com/photo-1620626012053-93f2685048d6?auto=format&fit=crop&q=80&w=800' },
      { id: 'balcony', title: 'Balcony', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-deluxe',
    name: '1BHK DELUXE',
    subtitle: 'Premium Compact Home',
    originalPrice: 750000,
    discountedPrice: 525000,
    features: ['Parallel Kitchen', 'Storage Bed', 'Modular Sofa', 'Extendable Dining', 'Full-Height Wardrobe', 'Feature Wall'],
    description: 'Deluxe 1BHK with premium space-saving solutions.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Bedroom', image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'Parallel Kitchen', image: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Living Space', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Dining Nook', image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Bathroom', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800' },
      { id: 'balcony', title: 'Balcony Garden', image: 'https://images.unsplash.com/photo-1585320806876-9f0a49b58b17?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-luxury',
    name: '1BHK LUXURY',
    subtitle: 'Sophisticated Studio',
    originalPrice: 900000,
    discountedPrice: 630000,
    features: ['Island Kitchen', 'Italian Bed', 'Italian Sofa', 'Bar Counter', 'Walk-in Closet', '3D Panels', 'Home Automation'],
    description: 'Luxury 1BHK with Italian finishes.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Luxury Bedroom', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'Island Kitchen', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Luxury Living', image: 'https://images.unsplash.com/photo-1615876234839-c2a1fdf88106?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Dining + Bar', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Spa Bathroom', image: 'https://images.unsplash.com/photo-1620626012053-93f2685048d6?auto=format&fit=crop&q=80&w=800' },
      { id: 'balcony', title: 'Terrace Balcony', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-ultimate',
    name: '1BHK ULTIMATE',
    subtitle: 'Penthouse Style',
    originalPrice: 1100000,
    discountedPrice: 770000,
    features: ['German Kitchen', 'Murphy Bed', 'Modular Living', 'Smart Dining', 'Automated Wardrobe', 'Voice Control'],
    description: 'Ultimate 1BHK with German engineering.',
    image: 'https://images.unsplash.com/photo-1502672028566-226778c8c9c9?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Smart Bedroom', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'German Kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Smart Living', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Smart Dining', image: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Smart Bathroom', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800' },
      { id: 'balcony', title: 'Sky Lounge', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-studio',
    name: '1BHK STUDIO',
    subtitle: 'Open Plan Living',
    originalPrice: 520000,
    discountedPrice: 364000,
    features: ['Open Kitchen', 'Platform Bed', 'Sectional Sofa', 'Bar Dining', 'Sliding Wardrobe', 'Track Lights'],
    description: 'Modern studio-style 1BHK.',
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Studio Bedroom', image: 'https://images.unsplash.com/photo-1616594039964-40891a909d99?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'Open Kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Studio Living', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Bar Dining', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Modern Bath', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-minimal',
    name: '1BHK MINIMAL',
    subtitle: 'Minimalist Design',
    originalPrice: 480000,
    discountedPrice: 336000,
    features: ['Linear Kitchen', 'Low Bed', 'Floor Seating', 'Foldable Table', 'Built-in Storage', 'Recessed Lights'],
    description: 'Minimalist 1BHK with clean lines.',
    image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Minimal Bedroom', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'Linear Kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Minimal Living', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Foldable Dining', image: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Simple Bath', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-scandinavian',
    name: '1BHK SCANDINAVIAN',
    subtitle: 'Nordic Inspired',
    originalPrice: 580000,
    discountedPrice: 406000,
    features: ['White Kitchen', 'Wooden Bed', 'Grey Sofa', 'Wooden Dining', 'Light Wardrobe', 'Pendant Lights'],
    description: 'Scandinavian-inspired 1BHK.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Nordic Bedroom', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'White Kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Hygge Living', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Wooden Dining', image: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Nordic Bath', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800' },
      { id: 'balcony', title: 'Cozy Balcony', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  {
    id: '1bhk-industrial',
    name: '1BHK INDUSTRIAL',
    subtitle: 'Urban Loft Style',
    originalPrice: 620000,
    discountedPrice: 434000,
    features: ['Metal Kitchen', 'Iron Bed', 'Leather Sofa', 'Metal Dining', 'Open Wardrobe', 'Edison Bulbs'],
    description: 'Industrial loft-style 1BHK.',
    image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=1200',
    category: 'Full Home',
    type: 'Apartment',
    rooms: [
      { id: 'bedroom', title: 'Loft Bedroom', image: 'https://images.unsplash.com/photo-1618219944342-824e40a13285?auto=format&fit=crop&q=80&w=800' },
      { id: 'kitchen', title: 'Industrial Kitchen', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=800' },
      { id: 'living', title: 'Loft Living', image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=800' },
      { id: 'dining', title: 'Metal Dining', image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?auto=format&fit=crop&q=80&w=800' },
      { id: 'bathroom', title: 'Urban Bath', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800' }
    ]
  }
  // Additional packages for 2BHK, 3BHK, 4BHK, Villa would continue here
  // This is a sample - the full seed file would have all 60+ packages
];

console.log('Package seed data loaded:', NEW_PACKAGES.length, 'packages');
