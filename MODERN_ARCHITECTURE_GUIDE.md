# AR Interia - Modern Architecture Documentation

## Overview

This project uses modern web technologies including **HTML5**, **CSS3**, and **TypeScript** with ES6+ modules for a clean, maintainable architecture.

---

## 📁 Project Structure

```
d:\ar12/
├── app.ts                          # Main application entry point
├── theme/
│   ├── ThemeManager.ts             # Theme state management (Singleton)
│   └── theme-variables.ts          # CSS custom properties configuration
├── packages/
│   └── PackageManager.ts           # Package CRUD operations
├── announcements/
│   └── AnnouncementManager.ts      # Announcement management
├── components/
│   └── UIComponents.ts             # Web Components (Custom Elements)
├── styles/
│   └── modern-styles.css           # Modern CSS3 styles
└── main.ts                         # Legacy main file (being refactored)
```

---

## 🎨 Theme System

### ThemeManager (Singleton Pattern)

```typescript
import { themeManager } from './theme/ThemeManager';

// Toggle dark mode
themeManager.toggleDarkMode();

// Set specific theme properties
themeManager.setPrimaryColor('#4A3728');
themeManager.setAccentColor('#D4AF37');
themeManager.setBackgroundColor('#faf9f6');

// Subscribe to theme changes
themeManager.subscribe((theme) => {
  console.log('Theme updated:', theme);
});

// Get current theme state
const currentTheme = themeManager.getState();
```

### CSS Custom Properties

All theme colors are stored as CSS variables for performance:

```css
:root {
  --primary: #4A3728;
  --accent: #D4AF37;
  --bg-color: #faf9f6;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: rgba(0, 0, 0, 0.1);
  --shadow-color: rgba(0, 0, 0, 0.1);
}

body.dark-mode {
  --primary: #e8e8e8;
  --bg-color: #0f141a;
  --text-primary: #e5e5e5;
}
```

---

## 📦 Package Management

### PackageManager API

```typescript
import { packageManager } from './packages/PackageManager';

// Get all packages
const allPackages = packageManager.getAll();

// Get featured packages (first 6)
const featured = packageManager.getFeatured(6);

// Get by category
const kitchenPackages = packageManager.getByCategory('Kitchen');

// Create new package
const newPackage = packageManager.create({
  id: 'kitchen-essential',
  name: 'KITCHEN ESSENTIAL',
  subtitle: 'Compact Modular Kitchen',
  category: 'Kitchen',
  originalPrice: 885000,
  discountedPrice: 637000,
  features: ['Modular Kitchen', 'Premium Materials'],
  description: 'Complete kitchen setup',
  image: '/uploads/kitchen.jpg'
});

// Update package
packageManager.update('kitchen-essential', {
  discountedPrice: 599000
});

// Delete package
packageManager.delete('kitchen-essential');

// Upload image
const imageUrl = await packageManager.uploadImage(fileInput.files[0]);
```

### Web Component: `<package-card>`

```html
<!-- Automatic rendering -->
<package-card package-id="kitchen-essential"></package-card>

<!-- Or render via JavaScript -->
<div id="packages-grid"></div>

<script type="module">
  import { renderPackageGrid } from './app.ts';
  renderPackageGrid('packages-grid', 12);
</script>
```

---

## 📢 Announcement System

### AnnouncementManager API

```typescript
import { announcementManager } from './announcements/AnnouncementManager';

// Get active announcements (auto-filters by date)
const active = announcementManager.getActive();

// Create announcement
announcementManager.create({
  title: 'Summer Sale!',
  message: 'Get 20% off on all packages',
  startDate: '2024-06-01T00:00:00Z',
  endDate: '2024-08-31T23:59:59Z',
  active: true
});

// Update announcement
announcementManager.update('ann-id', { active: false });

// Delete announcement
announcementManager.delete('ann-id');

// Subscribe to changes
announcementManager.subscribe((announcements) => {
  console.log('Announcements updated:', announcements);
});
```

### Web Component: `<announcement-banner>`

```html
<!-- Automatic rendering -->
<announcement-banner announcement-id="ann-123"></announcement-banner>

<!-- Or render via JavaScript -->
<div id="announcements-container"></div>

<script type="module">
  import { renderAnnouncements } from './app.ts';
  renderAnnouncements('announcements-container');
</script>
```

---

## 🧩 Web Components

### Registered Custom Elements

1. **`<package-card>`** - Displays package information
2. **`<announcement-banner>`** - Shows announcement banners
3. **`<dark-mode-toggle>`** - Dark mode toggle button

### Usage Examples

```html
<!-- Package Card -->
<package-card package-id="kitchen-essential"></package-card>

<!-- Announcement Banner -->
<announcement-banner announcement-id="summer-sale"></announcement-banner>

<!-- Dark Mode Toggle -->
<dark-mode-toggle></dark-mode-toggle>
```

### Event Handling

```javascript
// Listen for package clicks
document.addEventListener('package-click', (event) => {
  console.log('Package clicked:', event.detail.package);
});

// Listen for app initialization
window.addEventListener('app-initialized', () => {
  console.log('App is ready!');
});
```

---

## 🎨 CSS3 Features Used

### 1. Custom Properties (Variables)

```css
:root {
  --primary: #4A3728;
  --spacing-unit: 1rem;
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card {
  background: var(--bg-card);
  transition: transform var(--transition-base);
}
```

### 2. CSS Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}
```

### 3. Flexbox

```css
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 4. Animations

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 500ms ease-out;
}
```

### 5. Transitions

```css
.button {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### 6. Clamp for Responsive Typography

```css
h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
}
```

---

## 📝 TypeScript Features

### 1. Interfaces

```typescript
interface Package {
  id: string;
  name: string;
  category: PackageCategory;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
  image: string;
}
```

### 2. Type Guards

```typescript
function isPackage(obj: any): obj is Package {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}
```

### 3. Generics

```typescript
class DataManager<T> {
  private items: T[] = [];
  
  getAll(): T[] {
    return [...this.items];
  }
}
```

### 4. Async/Await

```typescript
async function uploadPackageImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.path;
}
```

---

## 🚀 Getting Started

### 1. Import the App

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AR Interia</title>
  <link rel="stylesheet" href="/styles/modern-styles.css">
</head>
<body>
  <div id="app">
    <!-- Announcements -->
    <div id="announcements-container"></div>
    
    <!-- Packages Grid -->
    <div id="packages-grid"></div>
    
    <!-- Package Modal -->
    <div id="package-modal" class="modal-backdrop" style="display: none;">
      <div id="package-modal-content" class="modal"></div>
    </div>
  </div>
  
  <script type="module" src="/app.ts"></script>
</body>
</html>
```

### 2. Initialize in JavaScript

```typescript
import { themeManager, packageManager } from './app.ts';

// App auto-initializes, but you can access managers
const packages = packageManager.getFeatured(6);
console.log('Featured packages:', packages);

// Toggle dark mode
themeManager.toggleDarkMode();
```

---

## 🎯 Best Practices

### 1. Use Web Components for Reusability

```typescript
// ✅ Good
<package-card package-id="123"></package-card>

// ❌ Avoid inline HTML for repeated elements
<div class="card">...</div>
<div class="card">...</div>
```

### 2. Use Theme Manager for Consistency

```typescript
// ✅ Good
themeManager.setPrimaryColor('#4A3728');

// ❌ Avoid direct DOM manipulation
document.documentElement.style.setProperty('--primary', '#4A3728');
```

### 3. Use TypeScript Types

```typescript
// ✅ Good
function createPackage(pkg: Omit<Package, 'createdAt'>): Package {
  // ...
}

// ❌ Avoid any
function createPackage(pkg: any): any {
  // ...
}
```

### 4. Use CSS Variables

```css
/* ✅ Good */
.card {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* ❌ Avoid hardcoded values */
.card {
  background: #ffffff;
  color: #1a1a1a;
}
```

---

## 📊 Performance Optimizations

1. **CSS Custom Properties** - Faster than JavaScript theme switching
2. **Shadow DOM** - Encapsulated styles for web components
3. **Lazy Loading** - Images use `loading="lazy"`
4. **Debounced Storage** - LocalStorage writes are batched
5. **Singleton Pattern** - Single instance of managers

---

## 🔧 Migration from Legacy Code

The old `main.ts` file is being gradually refactored into modular components:

| Legacy | Modern Replacement |
|--------|-------------------|
| `state.theme` | `themeManager.getState()` |
| `getPackages()` | `packageManager.getAll()` |
| `getActiveAnnouncements()` | `announcementManager.getActive()` |
| Manual DOM updates | Web Components |
| Inline styles | CSS Custom Properties |

---

## 📚 Additional Resources

- [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Modern CSS Solutions](https://moderncss.dev/)

---

**Version:** 2.0.0  
**Last Updated:** March 2026
