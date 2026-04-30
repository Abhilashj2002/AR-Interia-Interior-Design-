/**
 * Modern UI Components
 * Using TypeScript classes with proper encapsulation
 */

import { themeManager } from '../theme/ThemeManager';
import { packageManager, Package } from '../packages/PackageManager';
import { announcementManager, Announcement } from '../announcements/AnnouncementManager';

/**
 * Package Card Component
 */
export class PackageCardElement extends HTMLElement {
  private packageData!: Package;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['package-id'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'package-id' && oldValue !== newValue) {
      const pkg = packageManager.getById(newValue);
      if (pkg) {
        this.packageData = pkg;
        this.render();
      }
    }
  }

  private render(): void {
    if (!this.packageData) return;

    const savings = this.packageData.originalPrice - this.packageData.discountedPrice;

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          cursor: pointer;
        }
        
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-2xl);
        }
        
        .image-container {
          position: relative;
          height: 12rem;
          overflow: hidden;
        }
        
        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card:hover .image {
          transform: scale(1.1);
        }
        
        .badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: var(--accent);
          color: #ffffff;
          padding: 0.5rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .content {
          padding: 1.25rem;
        }
        
        .category {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        
        .title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        
        .price {
          display: flex;
          flex-direction: column;
        }
        
        .price-original {
          font-size: 0.75rem;
          text-decoration: line-through;
          color: var(--text-muted);
        }
        
        .price-discounted {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent);
        }
        
        .btn {
          padding: 0.5rem 1rem;
          background: var(--primary);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-xl);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
      </style>
      
      <div class="card" role="button" tabindex="0" aria-label="View ${this.packageData.name} details">
        <div class="image-container">
          <img 
            src="${this.packageData.image}" 
            alt="${this.packageData.name}" 
            class="image"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600'"
          />
          <div class="badge">Save ₹${savings.toLocaleString()}</div>
        </div>
        <div class="content">
          <div class="category">${this.packageData.category}</div>
          <h3 class="title">${this.packageData.name}</h3>
          <p class="description">${this.packageData.description}</p>
          <div class="footer">
            <div class="price">
              <span class="price-original">₹${this.packageData.originalPrice.toLocaleString()}</span>
              <span class="price-discounted">₹${this.packageData.discountedPrice.toLocaleString()}</span>
            </div>
            <button class="btn" data-action="quote-package" data-package="${this.packageData.id}">
              Get Quote
            </button>
          </div>
        </div>
      </div>
    `;

    // Add click handler
    const card = this.shadow.querySelector('.card');
    card?.addEventListener('click', () => this.handleClick());
    card?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick();
      }
    });
  }

  private handleClick(): void {
    const event = new CustomEvent('package-click', {
      bubbles: true,
      composed: true,
      detail: { package: this.packageData }
    });
    this.dispatchEvent(event);
  }
}

/**
 * Announcement Banner Component
 */
export class AnnouncementBannerElement extends HTMLElement {
  private announcementData!: Announcement;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['announcement-id'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'announcement-id' && oldValue !== newValue) {
      const ann = announcementManager.getById(newValue);
      if (ann) {
        this.announcementData = ann;
        this.render();
      }
    }
  }

  private render(): void {
    if (!this.announcementData) return;

    const endDate = new Date(this.announcementData.endDate).toLocaleDateString();

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 1rem;
        }
        
        .banner {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-left: 4px solid #3b82f6;
          border-radius: var(--radius-xl);
          padding: 1.25rem;
          animation: slideIn 300ms ease-out;
        }
        
        .content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        
        .icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .text {
          flex: 1;
        }
        
        .title {
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }
        
        .message {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0.5rem;
        }
        
        .date {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
      
      <div class="banner" role="alert" aria-live="polite">
        <div class="content">
          <div class="icon">📢</div>
          <div class="text">
            <div class="title">${this.announcementData.title}</div>
            <div class="message">${this.announcementData.message}</div>
            <div class="date">Valid until ${endDate}</div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Dark Mode Toggle Component
 */
export class DarkModeToggleElement extends HTMLElement {
  private shadow: ShadowRoot;
  private isDark = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.isDark = document.body.classList.contains('dark-mode');
  }

  connectedCallback() {
    this.render();
    this.setupSubscription();
  }

  private setupSubscription(): void {
    themeManager.subscribe((theme) => {
      this.isDark = theme.darkMode;
      this.render();
    });
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .toggle:hover {
          background: var(--bg-card);
          border-color: var(--accent);
        }
        
        .icon {
          font-size: 1.25rem;
        }
      </style>
      
      <button class="toggle" aria-label="Toggle dark mode" aria-pressed="${this.isDark}">
        <span class="icon">${this.isDark ? '🌙' : '☀️'}</span>
        <span>${this.isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    `;

    const toggle = this.shadow.querySelector('.toggle');
    toggle?.addEventListener('click', () => {
      themeManager.toggleDarkMode();
    });
  }
}

// Register custom elements
export function registerComponents(): void {
  if (!customElements.get('package-card')) {
    customElements.define('package-card', PackageCardElement);
  }
  if (!customElements.get('announcement-banner')) {
    customElements.define('announcement-banner', AnnouncementBannerElement);
  }
  if (!customElements.get('dark-mode-toggle')) {
    customElements.define('dark-mode-toggle', DarkModeToggleElement);
  }
}
