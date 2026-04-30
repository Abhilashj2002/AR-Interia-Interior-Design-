import { RoomType, StyleType } from '../types';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  imageUrl: string;
  video3d?: string;
  model3d?: string;
  designs: string[]; // design IDs
}

export interface LuxuryProperty {
  id: string;
  name: string;
  type: 'house' | 'apartment';
  rooms: Room[];
  totalPrice: number;
  imageUrls: string[];
  description: string;
}

export const LUXURY_HOUSE: LuxuryProperty = {
  id: 'luxury-house-001',
  name: 'Elysian Luxury Villa',
  type: 'house',
  description: 'A stunning 5-bedroom luxury villa with premium interior design featuring classic and modern elements.',
  totalPrice: 4500000,
  imageUrls: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000'
  ],
  rooms: [
    {
      id: 'room-001',
      name: 'Master Bedroom',
      type: RoomType.MASTERBEDROOM,
      description: 'Luxurious master bedroom with king-size bed, walk-in closet, and spa-like ensuite.',
      imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_masterbedroom.mp4',
      model3d: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      designs: ['design-masterbedroom-001', 'design-masterbedroom-002']
    },
    {
      id: 'room-002',
      name: 'Kids Bedroom',
      type: RoomType.KIDS,
      description: 'Colorful and playful kids bedroom with safety-first design and smart storage solutions.',
      imageUrl: 'https://images.unsplash.com/photo-1577720643272-265a5b0db076?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_kids.mp4',
      designs: ['design-bedroom-001', 'design-bedroom-002']
    },
    {
      id: 'room-003',
      name: 'Modern Kitchen',
      type: RoomType.KITCHEN,
      description: 'State-of-the-art kitchen with premium appliances, marble countertops, and smart storage.',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_kitchen.mp4',
      designs: ['design-kitchen-001', 'design-kitchen-002']
    },
    {
      id: 'room-004',
      name: 'Living Room',
      type: RoomType.LIVING,
      description: 'Spacious living room with panoramic windows and sophisticated furniture arrangements.',
      imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_living.mp4',
      designs: ['design-living-001', 'design-living-002', 'design-living-011']
    },
    {
      id: 'room-005',
      name: 'Dining Area',
      type: RoomType.DINING,
      description: 'Elegant dining area with designer lighting and premium wooden furniture.',
      imageUrl: 'https://images.unsplash.com/photo-1559007615-cd4d8f55c80a?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_dining.mp4',
      designs: ['design-dining-001', 'design-dining-002']
    },
    {
      id: 'room-006',
      name: 'Luxury Bathroom',
      type: RoomType.BATHROOM,
      description: 'Premium bathroom with jacuzzi, heated floors, and designer fixtures.',
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_bathroom.mp4',
      designs: ['design-bathroom-001', 'design-bathroom-002']
    },
    {
      id: 'room-007',
      name: 'Home Gym',
      type: RoomType.GYM,
      description: 'Fully equipped home gym with modern fitness equipment and mirrored walls.',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_gym.mp4',
      designs: ['design-gym-001', 'design-gym-002']
    },
    {
      id: 'room-008',
      name: 'Home Theatre',
      type: RoomType.THEATRE,
      description: 'Premium home theatre with surround sound system and luxury seating.',
      imageUrl: 'https://images.unsplash.com/photo-1598231772097-8b74394b95c6?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_theatre.mp4',
      designs: ['design-theatre-001', 'design-theatre-002']
    },
    {
      id: 'room-009',
      name: 'Pooja Room',
      type: RoomType.POOJA,
      description: 'Sacred pooja room with traditional design elements and peaceful ambiance.',
      imageUrl: 'https://images.unsplash.com/photo-1604579844949-562574152319?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_pooja.mp4',
      designs: ['design-pooja-001', 'design-pooja-002']
    },
    {
      id: 'room-010',
      name: 'Garden & Outdoor',
      type: RoomType.GARDEN,
      description: 'Manicured garden with lawn, landscape design, and outdoor seating area.',
      imageUrl: 'https://images.unsplash.com/photo-1585320806876-9f0a49b58b17?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_garden.mp4',
      designs: ['design-garden-001', 'design-garden-002']
    },
    {
      id: 'room-011',
      name: 'Terrace',
      type: RoomType.TERRACE,
      description: 'Expansive terrace with garden furniture and scenic city views.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_terrace.mp4',
      designs: ['design-terrace-001', 'design-terrace-002']
    },
    {
      id: 'room-012',
      name: 'Balcony',
      type: RoomType.BALCONY,
      description: 'Furnished balcony with panoramic views and comfortable seating.',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_balcony.mp4',
      designs: ['design-balcony-001', 'design-balcony-002']
    }
  ]
};

export const LUXURY_APARTMENT: LuxuryProperty = {
  id: 'luxury-apt-001',
  name: 'Prestige Heights Penthouse',
  type: 'apartment',
  description: 'A luxurious 3-bedroom penthouse apartment with floor-to-ceiling windows and modern minimalist design.',
  totalPrice: 2500000,
  imageUrls: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'
  ],
  rooms: [
    {
      id: 'apt-room-001',
      name: 'Master Bedroom',
      type: RoomType.MASTERBEDROOM,
      description: 'Spacious master bedroom with city views and custom wardrobes.',
      imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_masterbedroom.mp4',
      designs: ['design-masterbedroom-003', 'design-masterbedroom-004']
    },
    {
      id: 'apt-room-002',
      name: 'Guest Bedroom',
      type: RoomType.GUESTROOM,
      description: 'Comfortable guest bedroom with modern furnishings.',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_masterbedroom.mp4',
      designs: ['design-guestroom-001', 'design-guestroom-002']
    },
    {
      id: 'apt-room-003',
      name: 'Open Kitchen',
      type: RoomType.KITCHEN,
      description: 'Modern open-plan kitchen seamlessly integrated with dining and living areas.',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_kitchen.mp4',
      designs: ['design-kitchen-003', 'design-kitchen-004']
    },
    {
      id: 'apt-room-004',
      name: 'Living & Dining',
      type: RoomType.LIVING,
      description: 'Open-concept living and dining area with floor-to-ceiling windows.',
      imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_living.mp4',
      designs: ['design-living-003', 'design-living-004', 'design-living-011']
    },
    {
      id: 'apt-room-005',
      name: 'Luxury Bathroom',
      type: RoomType.BATHROOM,
      description: 'Contemporary bathroom with rainfall showerhead and heated floors.',
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_bathroom.mp4',
      designs: ['design-bathroom-003', 'design-bathroom-004']
    },
    {
      id: 'apt-room-006',
      name: 'Powder Room',
      type: RoomType.BATHROOM,
      description: 'Elegant powder room for guests.',
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_bathroom.mp4',
      designs: ['design-bathroom-005', 'design-bathroom-006']
    },
    {
      id: 'apt-room-007',
      name: 'Study/Office',
      type: RoomType.OFFICE,
      description: 'Quiet study space with built-in workspace.',
      imageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_living.mp4',
      designs: ['design-office-001', 'design-office-002']
    },
    {
      id: 'apt-room-008',
      name: 'Balcony',
      type: RoomType.BALCONY,
      description: 'Private balcony with seating and city views.',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800',
      video3d: '/videos/room_balcony.mp4',
      designs: ['design-balcony-003', 'design-balcony-004']
    },
    {
      id: 'apt-room-009',
      name: 'Kids Room',
      type: RoomType.KIDS,
      description: 'A fun and safe room for kids with creative decor and built-in storage.',
      imageUrl: 'https://images.unsplash.com/photo-1577720643272-265a5b0db076?auto=format&fit=crop&q=80&w=800',
      designs: ['design-bedroom-003', 'design-bedroom-004']
    }
  ]
};

export const INTERIOR_DESIGN_VIDEOS = [
  {
    id: 'vid-001',
    title: 'Modern Luxury Living Room Design',
    url: 'https://www.youtube.com/embed/TKnRyFm-5c4',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400',
    duration: '12:45',
    views: '2.5M'
  },
  {
    id: 'vid-002',
    title: 'Kitchen Design Trends 2024',
    url: 'https://www.youtube.com/embed/gCYcHz2k-Pg',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=400',
    duration: '15:30',
    views: '1.8M'
  },
  {
    id: 'vid-003',
    title: 'Bedroom Design & Styling Tips',
    url: 'https://www.youtube.com/embed/oKJFn-jRLOc',
    thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400',
    duration: '10:20',
    views: '1.3M'
  },
  {
    id: 'vid-004',
    title: 'Small Space Maximization Guide',
    url: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400',
    duration: '14:15',
    views: '2.1M'
  },
  {
    id: 'vid-005',
    title: 'Home Theatre Setup & Design',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1598231772097-8b74394b95c6?auto=format&fit=crop&q=80&w=400',
    duration: '18:50',
    views: '950K'
  },
  {
    id: 'vid-006',
    title: 'Luxury Bathroom Design Ideas',
    url: 'https://www.youtube.com/embed/k_LpAVMlJ5c',
    thumbnail: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=400',
    duration: '11:40',
    views: '1.6M'
  },
  {
    id: 'vid-007',
    title: 'Color Psychology in Interior Design',
    url: 'https://www.youtube.com/embed/IQoHQJLoKqI',
    thumbnail: 'https://images.unsplash.com/photo-1585320806876-9f0a49b58b17?auto=format&fit=crop&q=80&w=400',
    duration: '13:25',
    views: '1.1M'
  },
  {
    id: 'vid-008',
    title: 'Garden & Outdoor Space Design',
    url: 'https://www.youtube.com/embed/f0DqKt6Nc3E',
    thumbnail: 'https://images.unsplash.com/photo-1585320806876-9f0a49b58b17?auto=format&fit=crop&q=80&w=400',
    duration: '16:30',
    views: '890K'
  }
];
