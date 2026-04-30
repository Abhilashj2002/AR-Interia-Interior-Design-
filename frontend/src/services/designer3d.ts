import * as THREE from 'three';

export type RoomCategory = 'kitchen' | 'bedroom' | 'living' | 'dining' | 'bathroom' | 'garden' | 'gym' | 'office' | 'masterbedroom' | 'terrace' | 'pooja' | 'kids';

export interface Design3D {
  title: string;
  style: string;
  room: RoomCategory;
  wallColor: string;
  floorColor: string;
  accentColor: string;
  furniture: Array<{ name: string; color: string; position: [number, number, number]; scale?: number }>;
  lighting: {
    ambientIntensity: number;
    directionalIntensity: number;
    spotlightColor: string;
  };
}

// Room-specific designs
const bedroomDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Serene Minimalist Bedroom',
    style: 'Modern',
    wallColor: '#f5f5f5',
    floorColor: '#e0e0e0',
    accentColor: '#1a1a1a',
    furniture: [
      { name: 'bed', color: '#ffffff', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'nightstand', color: '#d3d3d3', position: [-1.2, 0.3, -1.2] }
    ],
    lighting: { ambientIntensity: 0.9, directionalIntensity: 0.7, spotlightColor: '#ffffff' }
  },
  {
    title: 'Warm Rustic Bedroom',
    style: 'Rustic',
    wallColor: '#d4a574',
    floorColor: '#8b6f47',
    accentColor: '#5d4e37',
    furniture: [
      { name: 'bed', color: '#8b4513', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'nightstand', color: '#654321', position: [-1.2, 0.3, -1.2] }
    ],
    lighting: { ambientIntensity: 0.75, directionalIntensity: 0.8, spotlightColor: '#ffd700' }
  },
  {
    title: 'Luxe Glamour Bedroom',
    style: 'Luxury',
    wallColor: '#1a1a1a',
    floorColor: '#2d2d2d',
    accentColor: '#d4af37',
    furniture: [
      { name: 'bed', color: '#4a0000', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'nightstand', color: '#d4af37', position: [-1.2, 0.3, -1.2] }
    ],
    lighting: { ambientIntensity: 0.65, directionalIntensity: 0.9, spotlightColor: '#d4af37' }
  }
];

const masterBedroomDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Contemporary Master Suite',
    style: 'Contemporary',
    wallColor: '#e8e4df',
    floorColor: '#c9b896',
    accentColor: '#6b5b4f',
    furniture: [
      { name: 'bed', color: '#f5f5f5', position: [0, 0.4, -1.5], scale: 1.4 },
      { name: 'dresser', color: '#d4c4b0', position: [1.3, 0.35, -1.0] }
    ],
    lighting: { ambientIntensity: 0.8, directionalIntensity: 0.75, spotlightColor: '#fff5e6' }
  },
  {
    title: 'Elegant Master Retreat',
    style: 'Classic',
    wallColor: '#f0e6d8',
    floorColor: '#b8956e',
    accentColor: '#8b6914',
    furniture: [
      { name: 'bed', color: '#e8dcc8', position: [0, 0.4, -1.5], scale: 1.4 },
      { name: 'dresser', color: '#8b6914', position: [1.3, 0.35, -1.0] }
    ],
    lighting: { ambientIntensity: 0.7, directionalIntensity: 0.8, spotlightColor: '#ffd700' }
  },
  {
    title: 'Modern Master Bedroom',
    style: 'Modern',
    wallColor: '#2c3e50',
    floorColor: '#34495e',
    accentColor: '#ecf0f1',
    furniture: [
      { name: 'bed', color: '#ecf0f1', position: [0, 0.4, -1.5], scale: 1.4 },
      { name: 'dresser', color: '#7f8c8d', position: [1.3, 0.35, -1.0] }
    ],
    lighting: { ambientIntensity: 0.75, directionalIntensity: 0.85, spotlightColor: '#ffffff' }
  }
];

const kidsBedroomDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Playful Kids Room',
    style: 'Contemporary',
    wallColor: '#87ceeb',
    floorColor: '#f5deb3',
    accentColor: '#ff6b6b',
    furniture: [
      { name: 'bed', color: '#ff6b6b', position: [0, 0.4, -1.5], scale: 1.0 },
      { name: 'desk', color: '#f5deb3', position: [1.2, 0.3, -1.0] }
    ],
    lighting: { ambientIntensity: 0.9, directionalIntensity: 0.8, spotlightColor: '#ffffff' }
  },
  {
    title: 'Whimsical Child Room',
    style: 'Playful',
    wallColor: '#ffe4e1',
    floorColor: '#deb887',
    accentColor: '#9370db',
    furniture: [
      { name: 'bed', color: '#dda0dd', position: [0, 0.4, -1.5], scale: 1.0 },
      { name: 'desk', color: '#f0e68c', position: [1.2, 0.3, -1.0] }
    ],
    lighting: { ambientIntensity: 0.95, directionalIntensity: 0.75, spotlightColor: '#fffacd' }
  },
  {
    title: 'Modern Teen Room',
    style: 'Modern',
    wallColor: '#4a5568',
    floorColor: '#2d3748',
    accentColor: '#48bb78',
    furniture: [
      { name: 'bed', color: '#68d391', position: [0, 0.4, -1.5], scale: 1.0 },
      { name: 'desk', color: '#4a5568', position: [1.2, 0.3, -1.0] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.8, spotlightColor: '#ffffff' }
  }
];

const kitchenDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Modern Kitchen',
    style: 'Modern',
    wallColor: '#f0f0f0',
    floorColor: '#d3d3d3',
    accentColor: '#333333',
    furniture: [
      { name: 'counter', color: '#555555', position: [0, 0.5, -1.5], scale: 1.5 },
      { name: 'cabinet', color: '#ffffff', position: [1.2, 0.8, -1.5] }
    ],
    lighting: { ambientIntensity: 0.95, directionalIntensity: 0.9, spotlightColor: '#ffffff' }
  },
  {
    title: 'Rustic Kitchen',
    style: 'Rustic',
    wallColor: '#e8d5b7',
    floorColor: '#c19a6b',
    accentColor: '#8b4513',
    furniture: [
      { name: 'counter', color: '#a0522d', position: [0, 0.5, -1.5], scale: 1.5 },
      { name: 'cabinet', color: '#8b7355', position: [1.2, 0.8, -1.5] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.85, spotlightColor: '#ffd700' }
  },
  {
    title: 'Luxury Kitchen',
    style: 'Luxury',
    wallColor: '#2b2b2b',
    floorColor: '#1a1a1a',
    accentColor: '#d4af37',
    furniture: [
      { name: 'counter', color: '#3a3a3a', position: [0, 0.5, -1.5], scale: 1.5 },
      { name: 'cabinet', color: '#d4af37', position: [1.2, 0.8, -1.5] }
    ],
    lighting: { ambientIntensity: 0.7, directionalIntensity: 1, spotlightColor: '#d4af37' }
  }
];

const livingDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Modern Minimalist Living',
    style: 'Modern',
    wallColor: '#f5f5f5',
    floorColor: '#e0e0e0',
    accentColor: '#1a1a1a',
    furniture: [
      { name: 'sofa', color: '#ffffff', position: [0, 0.5, -1.5], scale: 1 },
      { name: 'table', color: '#333333', position: [0, 0.3, 0] }
    ],
    lighting: { ambientIntensity: 0.8, directionalIntensity: 0.9, spotlightColor: '#ffffff' }
  },
  {
    title: 'Coastal Living Room',
    style: 'Coastal',
    wallColor: '#e8f4f8',
    floorColor: '#d2b48c',
    accentColor: '#1e90ff',
    furniture: [
      { name: 'sofa', color: '#87ceeb', position: [0, 0.5, -1.5], scale: 1 },
      { name: 'table', color: '#f5deb3', position: [0, 0.3, 0] }
    ],
    lighting: { ambientIntensity: 0.9, directionalIntensity: 0.85, spotlightColor: '#87ceeb' }
  },
  {
    title: 'Industrial Living Room',
    style: 'Industrial',
    wallColor: '#4a4a4a',
    floorColor: '#333333',
    accentColor: '#ff6b35',
    furniture: [
      { name: 'sofa', color: '#505050', position: [0, 0.5, -1.5], scale: 1 },
      { name: 'table', color: '#666666', position: [0, 0.3, 0] }
    ],
    lighting: { ambientIntensity: 0.6, directionalIntensity: 0.95, spotlightColor: '#ff6b35' }
  }
];

const diningDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Modern Dining',
    style: 'Modern',
    wallColor: '#f5f5f5',
    floorColor: '#d0d0d0',
    accentColor: '#2a2a2a',
    furniture: [
      { name: 'table', color: '#3a3a3a', position: [0, 0.35, -1.5], scale: 1.2 },
      { name: 'chair', color: '#ffffff', position: [-0.7, 0.4, -1.2] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.88, spotlightColor: '#ffffff' }
  },
  {
    title: 'Warm Dining Room',
    style: 'Rustic',
    wallColor: '#d4a574',
    floorColor: '#8b6f47',
    accentColor: '#5d4e37',
    furniture: [
      { name: 'table', color: '#8b4513', position: [0, 0.35, -1.5], scale: 1.2 },
      { name: 'chair', color: '#a0522d', position: [-0.7, 0.4, -1.2] }
    ],
    lighting: { ambientIntensity: 0.75, directionalIntensity: 0.85, spotlightColor: '#ffd700' }
  },
  {
    title: 'Luxury Dining',
    style: 'Luxury',
    wallColor: '#1a1a1a',
    floorColor: '#2d2d2d',
    accentColor: '#d4af37',
    furniture: [
      { name: 'table', color: '#3a3a3a', position: [0, 0.35, -1.5], scale: 1.2 },
      { name: 'chair', color: '#4a0000', position: [-0.7, 0.4, -1.2] }
    ],
    lighting: { ambientIntensity: 0.65, directionalIntensity: 0.95, spotlightColor: '#d4af37' }
  }
];

const bathroomDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Modern Minimalist Bathroom',
    style: 'Modern',
    wallColor: '#f5f5f5',
    floorColor: '#e0e0e0',
    accentColor: '#007acc',
    furniture: [
      { name: 'vanity', color: '#ffffff', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'mirror', color: '#c0c0c0', position: [0, 1.0, -1.8] }
    ],
    lighting: { ambientIntensity: 0.95, directionalIntensity: 0.85, spotlightColor: '#ffffff' }
  },
  {
    title: 'Spa-Like Bathroom',
    style: 'Spa',
    wallColor: '#e8f5e9',
    floorColor: '#c8e6c9',
    accentColor: '#4caf50',
    furniture: [
      { name: 'vanity', color: '#a5d6a7', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'mirror', color: '#81c784', position: [0, 1.0, -1.8] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.9, spotlightColor: '#e8f5e9' }
  },
  {
    title: 'Luxury Marble Bathroom',
    style: 'Luxury',
    wallColor: '#fafafa',
    floorColor: '#eceff1',
    accentColor: '#d4af37',
    furniture: [
      { name: 'vanity', color: '#ffffff', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'mirror', color: '#d4af37', position: [0, 1.0, -1.8] }
    ],
    lighting: { ambientIntensity: 0.9, directionalIntensity: 0.95, spotlightColor: '#fff8e1' }
  }
];

const gardenDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Modern Outdoor Lounge',
    style: 'Modern',
    wallColor: '#2e7d32',
    floorColor: '#8d6e63',
    accentColor: '#ff9800',
    furniture: [
      { name: 'seating', color: '#f5f5f5', position: [0, 0.3, -1.5], scale: 1.3 },
      { name: 'planter', color: '#4caf50', position: [1.2, 0.4, -1.0] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.8, spotlightColor: '#fff8e1' }
  },
  {
    title: 'Tropical Garden Paradise',
    style: 'Tropical',
    wallColor: '#1b5e20',
    floorColor: '#5d4037',
    accentColor: '#00bcd4',
    furniture: [
      { name: 'seating', color: '#80cbc4', position: [0, 0.3, -1.5], scale: 1.3 },
      { name: 'planter', color: '#00e676', position: [1.2, 0.4, -1.0] }
    ],
    lighting: { ambientIntensity: 0.9, directionalIntensity: 0.75, spotlightColor: '#ffffff' }
  },
  {
    title: 'Rustic Patio',
    style: 'Rustic',
    wallColor: '#558b2f',
    floorColor: '#795548',
    accentColor: '#ff5722',
    furniture: [
      { name: 'seating', color: '#8d6e63', position: [0, 0.3, -1.5], scale: 1.3 },
      { name: 'planter', color: '#7cb342', position: [1.2, 0.4, -1.0] }
    ],
    lighting: { ambientIntensity: 0.75, directionalIntensity: 0.85, spotlightColor: '#ffcc80' }
  }
];

const gymDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Modern Home Gym',
    style: 'Modern',
    wallColor: '#37474f',
    floorColor: '#263238',
    accentColor: '#00e676',
    furniture: [
      { name: 'equipment', color: '#424242', position: [0, 0.4, -1.5], scale: 1.0 },
      { name: 'bench', color: '#1b5e20', position: [1.0, 0.25, -1.0] }
    ],
    lighting: { ambientIntensity: 0.9, directionalIntensity: 0.95, spotlightColor: '#ffffff' }
  },
  {
    title: 'Bright Fitness Space',
    style: 'Contemporary',
    wallColor: '#eceff1',
    floorColor: '#cfd8dc',
    accentColor: '#2196f3',
    furniture: [
      { name: 'equipment', color: '#607d8b', position: [0, 0.4, -1.5], scale: 1.0 },
      { name: 'bench', color: '#1565c0', position: [1.0, 0.25, -1.0] }
    ],
    lighting: { ambientIntensity: 0.95, directionalIntensity: 0.9, spotlightColor: '#ffffff' }
  },
  {
    title: 'Industrial Gym',
    style: 'Industrial',
    wallColor: '#424242',
    floorColor: '#212121',
    accentColor: '#ff5722',
    furniture: [
      { name: 'equipment', color: '#616161', position: [0, 0.4, -1.5], scale: 1.0 },
      { name: 'bench', color: '#bf360c', position: [1.0, 0.25, -1.0] }
    ],
    lighting: { ambientIntensity: 0.8, directionalIntensity: 1.0, spotlightColor: '#ffccbc' }
  }
];

const officeDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Minimalist Home Office',
    style: 'Modern',
    wallColor: '#f5f5f5',
    floorColor: '#e0e0e0',
    accentColor: '#333333',
    furniture: [
      { name: 'desk', color: '#ffffff', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'chair', color: '#424242', position: [0, 0.5, -0.8] }
    ],
    lighting: { ambientIntensity: 0.9, directionalIntensity: 0.85, spotlightColor: '#ffffff' }
  },
  {
    title: 'Executive Office',
    style: 'Classic',
    wallColor: '#fafafa',
    floorColor: '#d7ccc8',
    accentColor: '#5d4037',
    furniture: [
      { name: 'desk', color: '#5d4037', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'chair', color: '#3e2723', position: [0, 0.5, -0.8] }
    ],
    lighting: { ambientIntensity: 0.8, directionalIntensity: 0.9, spotlightColor: '#fff8e1' }
  },
  {
    title: 'Creative Studio Space',
    style: 'Contemporary',
    wallColor: '#263238',
    floorColor: '#37474f',
    accentColor: '#ffab00',
    furniture: [
      { name: 'desk', color: '#37474f', position: [0, 0.4, -1.5], scale: 1.2 },
      { name: 'chair', color: '#ff6f00', position: [0, 0.5, -0.8] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.95, spotlightColor: '#ffffff' }
  }
];

const terraceDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Rooftop Lounge',
    style: 'Modern',
    wallColor: '#78909c',
    floorColor: '#546e7a',
    accentColor: '#ffca28',
    furniture: [
      { name: 'seating', color: '#cfd8dc', position: [0, 0.3, -1.5], scale: 1.2 },
      { name: 'planter', color: '#66bb6a', position: [1.1, 0.4, -1.0] }
    ],
    lighting: { ambientIntensity: 0.8, directionalIntensity: 0.85, spotlightColor: '#fff8e1' }
  },
  {
    title: 'Sky Garden Terrace',
    style: 'Tropical',
    wallColor: '#4caf50',
    floorColor: '#8d6e63',
    accentColor: '#00bcd4',
    furniture: [
      { name: 'seating', color: '#a5d6a7', position: [0, 0.3, -1.5], scale: 1.2 },
      { name: 'planter', color: '#69f0ae', position: [1.1, 0.4, -1.0] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.8, spotlightColor: '#ffffff' }
  },
  {
    title: 'Modern Alfresco Dining',
    style: 'Contemporary',
    wallColor: '#607d8b',
    floorColor: '#455a64',
    accentColor: '#ff7043',
    furniture: [
      { name: 'seating', color: '#eceff1', position: [0, 0.3, -1.5], scale: 1.2 },
      { name: 'planter', color: '#26a69a', position: [1.1, 0.4, -1.0] }
    ],
    lighting: { ambientIntensity: 0.75, directionalIntensity: 0.9, spotlightColor: '#ffe0b2' }
  }
];

const poojaRoomDesigns: Omit<Design3D, 'room'>[] = [
  {
    title: 'Traditional Pooja Room',
    style: 'Traditional',
    wallColor: '#fff3e0',
    floorColor: '#d7ccc8',
    accentColor: '#ff5722',
    furniture: [
      { name: 'mandir', color: '#8d6e63', position: [0, 0.5, -1.5], scale: 1.0 },
      { name: 'lamp', color: '#ff9800', position: [0, 0.8, -1.5] }
    ],
    lighting: { ambientIntensity: 0.7, directionalIntensity: 0.95, spotlightColor: '#ffcc80' }
  },
  {
    title: 'Modern Pooja Space',
    style: 'Modern',
    wallColor: '#fafafa',
    floorColor: '#eeeeee',
    accentColor: '#d4af37',
    furniture: [
      { name: 'mandir', color: '#ffffff', position: [0, 0.5, -1.5], scale: 1.0 },
      { name: 'lamp', color: '#d4af37', position: [0, 0.8, -1.5] }
    ],
    lighting: { ambientIntensity: 0.85, directionalIntensity: 0.9, spotlightColor: '#fff8e1' }
  },
  {
    title: 'Elegant Prayer Room',
    style: 'Classic',
    wallColor: '#fce4ec',
    floorColor: '#f8bbd0',
    accentColor: '#ec407a',
    furniture: [
      { name: 'mandir', color: '#f48fb1', position: [0, 0.5, -1.5], scale: 1.0 },
      { name: 'lamp', color: '#f06292', position: [0, 0.8, -1.5] }
    ],
    lighting: { ambientIntensity: 0.75, directionalIntensity: 0.85, spotlightColor: '#fce4ec' }
  }
];

const getRoomDesigns = (room: RoomCategory): Omit<Design3D, 'room'>[] => {
  switch (room) {
    case 'bedroom': return bedroomDesigns;
    case 'masterbedroom': return masterBedroomDesigns;
    case 'kids': return kidsBedroomDesigns;
    case 'kitchen': return kitchenDesigns;
    case 'living': return livingDesigns;
    case 'dining': return diningDesigns;
    case 'bathroom': return bathroomDesigns;
    case 'garden': return gardenDesigns;
    case 'gym': return gymDesigns;
    case 'office': return officeDesigns;
    case 'terrace': return terraceDesigns;
    case 'pooja': return poojaRoomDesigns;
    default: return livingDesigns;
  }
};

// Style to index mapping for each room type
// This maps style names to specific design indices within each room's design array
const styleToIndexMap: Record<RoomCategory, Record<string, number>> = {
  bedroom: {
    'Modern': 0,
    'Contemporary': 0,
    'Minimalist': 0,
    'Rustic': 1,
    'Traditional': 1,
    'Luxury': 2,
    'Glamour': 2,
    'Classic': 1,
    'default': 0
  },
  masterbedroom: {
    'Modern': 2,
    'Contemporary': 0,
    'Minimalist': 0,
    'Rustic': 1,
    'Traditional': 1,
    'Luxury': 1,
    'Classic': 1,
    'default': 0
  },
  kids: {
    'Modern': 2,
    'Contemporary': 0,
    'Playful': 1,
    'Minimalist': 0,
    'Rustic': 1,
    'Traditional': 1,
    'default': 0
  },
  kitchen: {
    'Modern': 0,
    'Contemporary': 0,
    'Minimalist': 0,
    'Rustic': 1,
    'Traditional': 1,
    'Luxury': 2,
    'Industrial': 2,
    'default': 0
  },
  living: {
    'Modern': 0,
    'Contemporary': 0,
    'Minimalist': 0,
    'Coastal': 1,
    'Industrial': 2,
    'Rustic': 1,
    'Luxury': 2,
    'Traditional': 1,
    'default': 0
  },
  dining: {
    'Modern': 0,
    'Contemporary': 0,
    'Minimalist': 0,
    'Rustic': 1,
    'Traditional': 1,
    'Luxury': 2,
    'Industrial': 2,
    'default': 0
  },
  bathroom: {
    'Modern': 0,
    'Contemporary': 0,
    'Minimalist': 0,
    'Spa': 1,
    'Luxury': 2,
    'Traditional': 1,
    'default': 0
  },
  garden: {
    'Modern': 0,
    'Contemporary': 0,
    'Tropical': 1,
    'Rustic': 2,
    'Traditional': 1,
    'Minimalist': 0,
    'default': 0
  },
  gym: {
    'Modern': 0,
    'Contemporary': 1,
    'Industrial': 2,
    'Minimalist': 0,
    'Traditional': 1,
    'default': 0
  },
  office: {
    'Modern': 0,
    'Contemporary': 2,
    'Minimalist': 0,
    'Classic': 1,
    'Traditional': 1,
    'Industrial': 2,
    'default': 0
  },
  terrace: {
    'Modern': 0,
    'Contemporary': 2,
    'Tropical': 1,
    'Minimalist': 0,
    'Traditional': 1,
    'default': 0
  },
  pooja: {
    'Modern': 1,
    'Contemporary': 1,
    'Traditional': 0,
    'Classic': 2,
    'Minimalist': 1,
    'default': 0
  }
};

// Get design index based on room type and style
export const getDesignIndex = (room: RoomCategory, style: string): number => {
  const roomStyles = styleToIndexMap[room] || styleToIndexMap.living;
  const normalizedStyle = style?.toLowerCase() || '';
  
  // Try to find a matching style
  for (const [styleKey, index] of Object.entries(roomStyles)) {
    if (normalizedStyle.includes(styleKey.toLowerCase())) {
      return index;
    }
  }
  
  // Return default index
  return roomStyles['default'] ?? 0;
};

export const createDesign3D = (index: number, room: RoomCategory = 'living'): Design3D => {
  const designs = getRoomDesigns(room);
  const design = designs[index % designs.length];
  return { ...design, room };
};

// Create design based on room and style (more intelligent)
export const createDesign3DFromStyle = (room: RoomCategory, style: string): Design3D => {
  const index = getDesignIndex(room, style);
  const designs = getRoomDesigns(room);
  const design = designs[index % designs.length];
  return { ...design, room };
};

const activeRenderers: THREE.WebGLRenderer[] = [];

export const renderScene = (
  containerId: string,
  design: Design3D,
  width: number = 600,
  height: number = 260
): (() => void) => {
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container ${containerId} not found`);
  
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0.1);
    renderer.shadowMap.enabled = true;
    
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    activeRenderers.push(renderer);

    camera.position.set(0, 1, 3);
    camera.lookAt(0, 0.5, 0);

    // Wall
    const wallGeometry = new THREE.PlaneGeometry(4, 3);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: design.wallColor });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.z = -2;
    wall.receiveShadow = true;
    scene.add(wall);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(4, 4);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: design.floorColor });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Accent wall
    const accentGeometry = new THREE.PlaneGeometry(0.1, 3);
    const accentMaterial = new THREE.MeshPhongMaterial({ color: design.accentColor });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(2, 1.5, -2);
    accent.receiveShadow = true;
    scene.add(accent);

    // Main furniture piece
    const furnitureGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
    const furnitureMaterial = new THREE.MeshPhongMaterial({ color: design.furniture[0].color });
    const mainFurniture = new THREE.Mesh(furnitureGeometry, furnitureMaterial);
    [mainFurniture.position.x, mainFurniture.position.y, mainFurniture.position.z] = design.furniture[0].position;
    if (design.furniture[0].scale) mainFurniture.scale.set(design.furniture[0].scale, 1, 1);
    mainFurniture.castShadow = true;
    mainFurniture.receiveShadow = true;
    scene.add(mainFurniture);

    // Secondary furniture piece (if exists)
    if (design.furniture[1]) {
      const secondGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.6);
      const secondMaterial = new THREE.MeshPhongMaterial({ color: design.furniture[1].color });
      const secondFurniture = new THREE.Mesh(secondGeometry, secondMaterial);
      [secondFurniture.position.x, secondFurniture.position.y, secondFurniture.position.z] = design.furniture[1].position;
      if (design.furniture[1].scale) secondFurniture.scale.set(design.furniture[1].scale, 1, 1);
      secondFurniture.castShadow = true;
      secondFurniture.receiveShadow = true;
      scene.add(secondFurniture);
    }

    // Accent object (lamp/plant)
    const accentObjGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
    const accentObjMaterial = new THREE.MeshPhongMaterial({ color: design.accentColor });
    const accentObj = new THREE.Mesh(accentObjGeometry, accentObjMaterial);
    accentObj.position.set(1.2, 0.4, -0.5);
    accentObj.castShadow = true;
    scene.add(accentObj);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, design.lighting.ambientIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, design.lighting.directionalIntensity);
    directionalLight.position.set(3, 3, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    scene.add(directionalLight);

    const spotLight = new THREE.SpotLight(design.lighting.spotlightColor, 1);
    spotLight.position.set(-2, 2, 1);
    spotLight.castShadow = true;
    scene.add(spotLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      mainFurniture.rotation.y += 0.002;
      accentObj.rotation.z += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        mainFurniture.rotation.y += deltaX * 0.01;
        mainFurniture.rotation.x += deltaY * 0.01;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseLeave = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave);

    // Return cleanup function
    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseLeave);

      // Dispose geometry and materials
      wallGeometry.dispose();
      floorGeometry.dispose();
      accentGeometry.dispose();
      furnitureGeometry.dispose();
      if (design.furniture[1]) {
        const secondGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.6);
        secondGeometry.dispose();
      }
      accentObjGeometry.dispose();

      wallMaterial.dispose();
      floorMaterial.dispose();
      accentMaterial.dispose();
      furnitureMaterial.dispose();
      if (design.furniture[1]) {
        const secondMaterial = new THREE.MeshPhongMaterial({ color: design.furniture[1].color });
        secondMaterial.dispose();
      }
      accentObjMaterial.dispose();

      // Dispose lights
      ambientLight.dispose();
      directionalLight.dispose();
      spotLight.dispose();

      // Dispose renderer
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.innerHTML = '';
      
      // Remove from active renderers
      const index = activeRenderers.indexOf(renderer);
      if (index > -1) {
        activeRenderers.splice(index, 1);
      }
      
      // Clear container
      container.innerHTML = '';
    };
  } catch (error) {
    console.error('3D Rendering error:', error);
    container.innerHTML = `<div style="width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 12px; color: #999; font-size: 12px; text-align: center; padding: 16px; box-sizing: border-box;">3D rendering unavailable</div>`;
    return () => {};
  }
};

export const disposeAllRenderers = () => {
  activeRenderers.forEach(renderer => renderer.dispose());
  activeRenderers.length = 0;
};

// Export room category mapping for external use
export const ROOM_CATEGORIES: Record<RoomCategory, string> = {
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  living: 'Living Room',
  dining: 'Dining Room',
  bathroom: 'Bathroom',
  garden: 'Garden',
  gym: 'Gym',
  office: 'Office',
  masterbedroom: 'Master Bedroom',
  terrace: 'Terrace',
  pooja: 'Pooja Room',
  kids: 'Kids Bedroom'
};
