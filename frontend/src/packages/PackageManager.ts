/**
 * Package Management Module
 * Handles package data, CRUD operations, and image uploads
 */

export interface Package {
  id: string;
  name: string;
  subtitle: string;
  category: PackageCategory;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
  description: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PackageCategory = 
  | 'Kitchen'
  | 'Bedroom'
  | 'Living Room'
  | 'Bathroom'
  | 'Office'
  | 'Dining Room'
  | 'Full Home';

export const PACKAGE_CATEGORIES: PackageCategory[] = [
  'Kitchen',
  'Bedroom',
  'Living Room',
  'Bathroom',
  'Office',
  'Dining Room',
  'Full Home'
];

const STORAGE_KEY = 'ar_interia_packages_v2';

export class PackageManager {
  private static instance: PackageManager;
  private packages: Package[] = [];
  private listeners: Set<(packages: Package[]) => void> = new Set();

  private constructor() {
    this.loadPackages();
  }

  public static getInstance(): PackageManager {
    if (!PackageManager.instance) {
      PackageManager.instance = new PackageManager();
    }
    return PackageManager.instance;
  }

  private loadPackages(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.packages = JSON.parse(stored);
      } else {
        // Initialize with default packages from constants
        this.packages = [];
      }
    } catch (error) {
      console.warn('Failed to load packages:', error);
      this.packages = [];
    }
  }

  private savePackages(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.packages));
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to save packages:', error);
    }
  }

  public getAll(): Package[] {
    return [...this.packages];
  }

  public getById(id: string): Package | undefined {
    return this.packages.find(p => p.id === id);
  }

  public getByCategory(category: PackageCategory): Package[] {
    return this.packages.filter(p => p.category === category);
  }

  public getFeatured(limit: number = 6): Package[] {
    return this.packages.slice(0, limit);
  }

  public create(pkg: Omit<Package, 'createdAt' | 'updatedAt'>): Package {
    const newPackage: Package = {
      ...pkg,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Validate ID uniqueness
    if (this.packages.some(p => p.id === newPackage.id)) {
      newPackage.id = `${newPackage.id}-${Date.now()}`;
    }
    
    this.packages.push(newPackage);
    this.savePackages();
    return newPackage;
  }

  public update(id: string, updates: Partial<Package>): Package | null {
    const index = this.packages.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.packages[index] = {
      ...this.packages[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.savePackages();
    return this.packages[index];
  }

  public delete(id: string): boolean {
    const index = this.packages.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.packages.splice(index, 1);
    this.savePackages();
    return true;
  }

  public async uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate file
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      const maxSize = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSize) {
        reject(new Error('File size must be under 15MB'));
        return;
      }

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        headers: this.getAuthHeaders()
      })
      .then(async response => {
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        resolve(data.path);
      })
      .catch(error => {
        console.warn('Image upload failed, using data URL:', error);
        // Fallback: convert to data URL
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    });
  }

  public subscribe(listener: (packages: Package[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAll()));
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('ar_interia_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Auto-initialize singleton
export const packageManager = PackageManager.getInstance();
