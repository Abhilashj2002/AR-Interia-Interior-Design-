/**
 * Category Loader Service
 * Handles loading and managing categories from various sources
 */

export interface Category {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  image?: string;
  status?: 'active' | 'inactive';
}

/**
 * Parse categories from JSON
 */
export function parseCategoriesFromJSON(jsonData: string): Category[] {
  try {
    const data = JSON.parse(jsonData);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error parsing JSON categories:', error);
    return [];
  }
}

/**
 * Parse categories from CSV
 */
export function parseCategoriesFromCSV(csvData: string): Category[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const categories: Category[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length < 2) continue;

    const category: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: values[0],
      description: values[1],
      icon: values[2] || '',
      color: values[3] || '',
      image: values[4] || '',
      status: (values[5] || 'active') as 'active' | 'inactive'
    };

    categories.push(category);
  }

  return categories;
}

/**
 * Generate sample category data for user to download
 */
export function generateSampleCategoriesCSV(): string {
  const headers = 'Title,Description,Icon,Color,Image,Status';
  const samples = [
    'Living Room,Modern living room designs,🛋️,#3B82F6,https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80,active',
    'Bedroom,Luxurious bedroom designs,🛏️,#EC4899,https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80,active',
    'Master Bedroom,Signature master bedroom suites,🛌,#F472B6,https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80,active',
    'Kitchen,Contemporary kitchen designs,👨‍🍳,#F59E0B,https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80,active',
    'Bathroom,Modern bathroom designs,🚿,#10B981,https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80,active',
    'Office,Professional office designs,💼,#8B5CF6,https://images.unsplash.com/photo-1497493292307-31c376b6d5a6?auto=format&fit=crop&q=80,active'
  ];

  return [headers, ...samples].join('\n');
}

/**
 * Generate sample category data for JSON
 */
export function generateSampleCategoriesJSON(): string {
  const samples: Category[] = [
    {
      id: 'cat-living-room',
      title: 'Living Room',
      description: 'Modern living room designs',
      icon: '🛋️',
      color: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80',
      status: 'active'
    },
    {
      id: 'cat-bedroom',
      title: 'Bedroom',
      description: 'Luxurious bedroom designs',
      icon: '🛏️',
      color: '#EC4899',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80',
      status: 'active'
    },
    {
      id: 'cat-masterbedroom',
      title: 'Master Bedroom',
      description: 'Signature master bedroom suites',
      icon: '🛌',
      color: '#F472B6',
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80',
      status: 'active'
    },
    {
      id: 'cat-kitchen',
      title: 'Kitchen',
      description: 'Contemporary kitchen designs',
      icon: '👨‍🍳',
      color: '#F59E0B',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80',
      status: 'active'
    },
    {
      id: 'cat-bathroom',
      title: 'Bathroom',
      description: 'Modern bathroom designs',
      icon: '🚿',
      color: '#10B981',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80',
      status: 'active'
    },
    {
      id: 'cat-office',
      title: 'Office',
      description: 'Professional office designs',
      icon: '💼',
      color: '#8B5CF6',
      image: 'https://images.unsplash.com/photo-1497493292307-31c376b6d5a6?auto=format&fit=crop&q=80',
      status: 'active'
    }
  ];

  return JSON.stringify(samples, null, 2);
}

/**
 * Validate category data
 */
export function validateCategory(category: any): boolean {
  return (
    category &&
    typeof category.title === 'string' &&
    typeof category.description === 'string' &&
    category.title.trim().length > 0 &&
    category.description.trim().length > 0
  );
}

/**
 * Generate unique category ID
 */
export function generateCategoryId(title: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `cat-${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${random}`;
}
