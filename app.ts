/**
 * Main Application Entry Point
 * Modern ES Module with proper initialization
 */

import { themeManager } from './theme/ThemeManager';
import { packageManager } from './packages/PackageManager';
import { announcementManager } from './announcements/AnnouncementManager';
import { registerComponents } from './components/UIComponents';
import { applyThemeVariables, CSS_VARIABLES } from './theme/theme-variables';

/**
 * Application State
 */
interface AppState {
  initialized: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'customer';
  } | null;
}

const state: AppState = {
  initialized: false,
  currentUser: null
};

/**
 * Initialize Application
 */
async function initializeApp(): Promise<void> {
  console.log('[App] Initializing...');
  
  const initStart = performance.now();

  try {
    // Register Web Components
    registerComponents();
    console.log('[App] Web Components registered');

    // Initialize theme from localStorage
    const theme = themeManager.getState();
    applyThemeVariables(theme.darkMode);
    console.log('[App] Theme initialized', theme);

    // Load packages
    const packages = packageManager.getAll();
    console.log(`[App] Loaded ${packages.length} packages`);

    // Load announcements
    const announcements = announcementManager.getActive();
    console.log(`[App] Loaded ${announcements.length} active announcements`);

    // Subscribe to theme changes
    themeManager.subscribe((newTheme) => {
      applyThemeVariables(newTheme.darkMode);
      console.log('[App] Theme updated', newTheme);
    });

    // Check for existing auth token
    const token = localStorage.getItem('ar_interia_token');
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1]));
        state.currentUser = {
          id: userData.sub,
          name: userData.name,
          email: userData.email,
          role: userData.role
        };
        console.log('[App] User authenticated', state.currentUser.email);
      } catch (error) {
        console.warn('[App] Invalid token, clearing...');
        localStorage.removeItem('ar_interia_token');
      }
    }

    // Mark as initialized
    state.initialized = true;

    // Dispatch custom event for other modules to listen to
    window.dispatchEvent(new CustomEvent('app-initialized', { detail: state }));

    const initDuration = performance.now() - initStart;
    console.log(`[App] Initialization complete in ${initDuration.toFixed(2)}ms`);

  } catch (error) {
    console.error('[App] Initialization failed:', error);
    throw error;
  }
}

/**
 * Render Package Grid
 */
export function renderPackageGrid(containerId: string, limit: number = 12): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const packages = packageManager.getFeatured(limit);
  
  container.innerHTML = packages.map(pkg => `
    <package-card package-id="${pkg.id}"></package-card>
  `).join('');

  // Listen for package clicks
  container.addEventListener('package-click', (event: Event) => {
    const customEvent = event as CustomEvent;
    handlePackageClick(customEvent.detail.package);
  });
}

/**
 * Render Announcements
 */
export function renderAnnouncements(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const announcements = announcementManager.getActive();
  
  if (announcements.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = announcements.map(ann => `
    <announcement-banner announcement-id="${ann.id}"></announcement-banner>
  `).join('');
}

/**
 * Handle Package Click
 */
function handlePackageClick(pkg: any): void {
  console.log('[App] Package clicked:', pkg);
  
  // Dispatch to window for other handlers
  window.dispatchEvent(new CustomEvent('package-selected', {
    bubbles: true,
    detail: { package: pkg }
  }));

  // Open modal or navigate
  const modal = document.getElementById('package-modal');
  if (modal) {
    openPackageModal(pkg);
  } else {
    // Fallback: navigate to services page
    window.location.href = '/services?package=' + pkg.id;
  }
}

/**
 * Open Package Modal
 */
function openPackageModal(pkg: any): void {
  const modal = document.getElementById('package-modal');
  const modalContent = document.getElementById('package-modal-content');
  
  if (!modal || !modalContent) return;

  const savings = pkg.originalPrice - pkg.discountedPrice;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>${pkg.name}</h2>
      <button class="modal-close" data-action="close-package-modal">&times;</button>
    </div>
    <div class="modal-body">
      <img src="${pkg.image}" alt="${pkg.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-lg); margin-bottom: 1rem;" />
      <p class="category">${pkg.category}</p>
      <p>${pkg.description}</p>
      <div style="margin: 1.5rem 0;">
        <h4 style="margin-bottom: 0.5rem;">Features:</h4>
        <ul style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; list-style: none; padding: 0;">
          ${pkg.features.map((f: string) => `
            <li style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--accent);">✓</span>
              ${f}
            </li>
          `).join('')}
        </ul>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <span style="text-decoration: line-through; color: var(--text-muted);">₹${pkg.originalPrice.toLocaleString()}</span>
          <div style="font-size: 2rem; font-weight: 700; color: var(--accent);">₹${pkg.discountedPrice.toLocaleString()}</div>
        </div>
        <div style="background: var(--accent); color: #fff; padding: 0.5rem 1rem; border-radius: var(--radius-full); font-weight: 700;">
          SAVE ₹${savings.toLocaleString()}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" data-action="close-package-modal">Close</button>
      <button class="btn btn-primary" data-action="quote-package" data-package="${pkg.id}">Get Quote</button>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Add close handlers
  const closeButtons = modalContent.querySelectorAll('[data-action="close-package-modal"]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => closePackageModal());
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePackageModal();
    }
  });

  // Add quote handler
  const quoteBtn = modalContent.querySelector('[data-action="quote-package"]');
  quoteBtn?.addEventListener('click', () => {
    closePackageModal();
    window.location.href = '/contact?package=' + pkg.id;
  });
}

/**
 * Close Package Modal
 */
function closePackageModal(): void {
  const modal = document.getElementById('package-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Export for global access
 */
(window as any).ARInteriaApp = {
  initialize: initializeApp,
  renderPackageGrid,
  renderAnnouncements,
  getState: () => state,
  getThemeManager: () => themeManager,
  getPackageManager: () => packageManager,
  getAnnouncementManager: () => announcementManager
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export default state;
