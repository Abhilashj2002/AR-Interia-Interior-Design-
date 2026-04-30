/**
 * Theme Management Module
 * Handles dark mode, color themes, and persistence
 */

export interface ThemeState {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  backgroundColor: string;
}

export const DEFAULT_THEME: ThemeState = {
  primaryColor: '#4A3728',
  accentColor: '#D4AF37',
  darkMode: false,
  backgroundColor: '#faf9f6'
};

export const PRESET_COLORS = {
  backgrounds: [
    { name: 'Classic White', value: '#faf9f6' },
    { name: 'Light Gray', value: '#f5f5f5' },
    { name: 'Warm Cream', value: '#fef3c7' },
    { name: 'Soft Blue', value: '#e0f2fe' },
    { name: 'Mint Green', value: '#f0fdf4' },
    { name: 'Lavender', value: '#faf5ff' }
  ],
  primaries: [
    { name: 'Teak Brown', value: '#4A3728' },
    { name: 'Charcoal', value: '#333333' },
    { name: 'Navy Blue', value: '#266598' },
    { name: 'Forest Green', value: '#2d5016' },
    { name: 'Burgundy', value: '#800020' }
  ],
  accents: [
    { name: 'Gold', value: '#D4AF37' },
    { name: 'Amber', value: '#FFBF00' },
    { name: 'Rose Gold', value: '#B76E79' },
    { name: 'Bronze', value: '#CD7F32' },
    { name: 'Silver', value: '#C0C0C0' }
  ]
};

const STORAGE_KEY = 'ar_interia_theme_v2';

export class ThemeManager {
  private static instance: ThemeManager;
  private theme: ThemeState;
  private listeners: Set<(theme: ThemeState) => void> = new Set();

  private constructor() {
    this.theme = this.loadTheme();
    this.applyTheme();
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private loadTheme(): ThemeState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_THEME, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load theme:', error);
    }
    return { ...DEFAULT_THEME };
  }

  private saveTheme(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.theme));
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  }

  private applyTheme(): void {
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--primary', this.theme.primaryColor);
    root.style.setProperty('--accent', this.theme.accentColor);
    root.style.setProperty('--bg-color', this.theme.backgroundColor);
    
    // Apply dark mode
    if (this.theme.darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.style.setProperty('color-scheme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.style.setProperty('color-scheme', 'light');
    }
  }

  public getState(): ThemeState {
    return { ...this.theme };
  }

  public setDarkMode(enabled: boolean): void {
    this.theme.darkMode = enabled;
    this.saveTheme();
    this.applyTheme();
    this.notifyListeners();
  }

  public toggleDarkMode(): void {
    this.setDarkMode(!this.theme.darkMode);
  }

  public setPrimaryColor(color: string): void {
    this.theme.primaryColor = color;
    this.saveTheme();
    this.applyTheme();
    this.notifyListeners();
  }

  public setAccentColor(color: string): void {
    this.theme.accentColor = color;
    this.saveTheme();
    this.applyTheme();
    this.notifyListeners();
  }

  public setBackgroundColor(color: string): void {
    this.theme.backgroundColor = color;
    this.saveTheme();
    this.applyTheme();
    this.notifyListeners();
  }

  public subscribe(listener: (theme: ThemeState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

// Auto-initialize singleton
export const themeManager = ThemeManager.getInstance();
