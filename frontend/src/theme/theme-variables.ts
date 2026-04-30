/**
 * Modern CSS Variables and Theme Configuration
 * Using CSS Custom Properties for dynamic theming
 */

export const CSS_VARIABLES = {
  // Light Mode Defaults
  light: {
    '--primary': '#4A3728',
    '--accent': '#D4AF37',
    '--bg-color': '#faf9f6',
    '--bg-secondary': '#f5f5f5',
    '--bg-card': '#ffffff',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#666666',
    '--text-muted': '#999999',
    '--border-color': 'rgba(0, 0, 0, 0.1)',
    '--shadow-color': 'rgba(0, 0, 0, 0.1)',
    '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
    '--overlay-color': 'rgba(0, 0, 0, 0.5)',
    '--gradient-primary': 'linear-gradient(135deg, var(--primary), var(--accent))',
    '--gradient-dark': 'linear-gradient(160deg, #0b0f14 0%, #111827 48%, #1b2330 100%)'
  },
  
  // Dark Mode
  dark: {
    '--primary': '#e8e8e8',
    '--accent': '#D4AF37',
    '--bg-color': '#0f141a',
    '--bg-secondary': '#1a2330',
    '--bg-card': '#1f2937',
    '--text-primary': '#e5e5e5',
    '--text-secondary': '#9ca3af',
    '--text-muted': '#6b7280',
    '--border-color': 'rgba(255, 255, 255, 0.1)',
    '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    '--shadow-hover': 'rgba(0, 0, 0, 0.5)',
    '--overlay-color': 'rgba(0, 0, 0, 0.7)',
    '--gradient-primary': 'linear-gradient(135deg, var(--primary), var(--accent))',
    '--gradient-dark': 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 48%, #2a2a2a 100%)'
  }
};

/**
 * Apply CSS variables to document
 */
export function applyThemeVariables(isDark: boolean): void {
  const root = document.documentElement;
  const vars = isDark ? CSS_VARIABLES.dark : CSS_VARIABLES.light;
  
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Background color presets
 */
export const BACKGROUND_PRESETS = [
  { name: 'Classic White', value: '#faf9f6', preview: 'linear-gradient(135deg, #faf9f6, #f5f5f5)' },
  { name: 'Light Gray', value: '#f5f5f5', preview: 'linear-gradient(135deg, #f5f5f5, #e5e5e5)' },
  { name: 'Warm Cream', value: '#fef3c7', preview: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  { name: 'Soft Blue', value: '#e0f2fe', preview: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' },
  { name: 'Mint Green', value: '#f0fdf4', preview: 'linear-gradient(135deg, #f0fdf4, #a7f3d0)' },
  { name: 'Lavender', value: '#faf5ff', preview: 'linear-gradient(135deg, #faf5ff, #e9d5ff)' }
];

/**
 * Primary color presets
 */
export const PRIMARY_PRESETS = [
  { name: 'Teak Brown', value: '#4A3728', preview: '#4A3728' },
  { name: 'Charcoal', value: '#333333', preview: '#333333' },
  { name: 'Navy Blue', value: '#266598', preview: '#266598' },
  { name: 'Forest Green', value: '#2d5016', preview: '#2d5016' },
  { name: 'Burgundy', value: '#800020', preview: '#800020' },
  { name: 'Slate Gray', value: '#708090', preview: '#708090' }
];

/**
 * Accent color presets
 */
export const ACCENT_PRESETS = [
  { name: 'Gold', value: '#D4AF37', preview: '#D4AF37' },
  { name: 'Amber', value: '#FFBF00', preview: '#FFBF00' },
  { name: 'Rose Gold', value: '#B76E79', preview: '#B76E79' },
  { name: 'Bronze', value: '#CD7F32', preview: '#CD7F32' },
  { name: 'Copper', value: '#B87333', preview: '#B87333' },
  { name: 'Silver', value: '#C0C0C0', preview: '#C0C0C0' }
];
