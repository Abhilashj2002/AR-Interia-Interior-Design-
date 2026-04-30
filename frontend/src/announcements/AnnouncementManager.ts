/**
 * Announcement Management Module
 * Handles time-sensitive announcements with active/inactive states
 */

export interface Announcement {
  id: string;
  title: string;
  message: string;
  startDate: string; // ISO datetime
  endDate: string;   // ISO datetime
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'ar_interia_announcements_v2';

export class AnnouncementManager {
  private static instance: AnnouncementManager;
  private announcements: Announcement[] = [];
  private listeners: Set<(announcements: Announcement[]) => void> = new Set();
  private refreshInterval?: number;

  private constructor() {
    this.loadAnnouncements();
    this.startAutoRefresh();
  }

  public static getInstance(): AnnouncementManager {
    if (!AnnouncementManager.instance) {
      AnnouncementManager.instance = new AnnouncementManager();
    }
    return AnnouncementManager.instance;
  }

  private loadAnnouncements(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.announcements = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load announcements:', error);
      this.announcements = [];
    }
  }

  private saveAnnouncements(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.announcements));
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to save announcements:', error);
    }
  }

  private startAutoRefresh(): void {
    // Check for expired announcements every minute
    this.refreshInterval = window.setInterval(() => {
      this.checkExpired();
    }, 60000);
  }

  private checkExpired(): void {
    const now = new Date();
    let changed = false;

    this.announcements.forEach(ann => {
      const endDate = new Date(ann.endDate);
      if (ann.active && endDate < now) {
        ann.active = false;
        ann.updatedAt = new Date().toISOString();
        changed = true;
      }
    });

    if (changed) {
      this.saveAnnouncements();
    }
  }

  public getAll(): Announcement[] {
    return [...this.announcements];
  }

  public getActive(): Announcement[] {
    const now = new Date();
    return this.announcements.filter(ann => {
      if (!ann.active) return false;
      
      const start = new Date(ann.startDate);
      const end = new Date(ann.endDate);
      
      return start <= now && end >= now;
    });
  }

  public getById(id: string): Announcement | undefined {
    return this.announcements.find(a => a.id === id);
  }

  public create(ann: Omit<Announcement, 'createdAt' | 'updatedAt'>): Announcement {
    const newAnnouncement: Announcement = {
      ...ann,
      id: ann.id || `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.announcements.push(newAnnouncement);
    this.saveAnnouncements();
    return newAnnouncement;
  }

  public update(id: string, updates: Partial<Announcement>): Announcement | null {
    const index = this.announcements.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.announcements[index] = {
      ...this.announcements[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveAnnouncements();
    return this.announcements[index];
  }

  public delete(id: string): boolean {
    const index = this.announcements.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.announcements.splice(index, 1);
    this.saveAnnouncements();
    return true;
  }

  public subscribe(listener: (announcements: Announcement[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAll()));
  }

  public destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// Auto-initialize singleton
export const announcementManager = AnnouncementManager.getInstance();
