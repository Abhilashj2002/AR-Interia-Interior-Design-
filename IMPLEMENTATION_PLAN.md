# Implementation Plan - New Features & Fixes

## Features to Implement

### 1. Light/Dark Mode Toggle (Admin & Customer Pages)
- Add dark mode state to `state.theme`
- Add toggle button in admin dashboard and customer dashboard
- Store preference in localStorage
- Apply CSS classes for dark mode styling

### 2. Fix 3D Motion Functionality
- Check `designer3d.ts` renderScene function
- Fix mouse event handlers
- Ensure proper cleanup of Three.js renderers

### 3. Theme Color Control (Admin Dashboard)
- Add color picker controls in admin settings
- Allow changing primary and accent colors
- Persist to localStorage/theme state

### 4. Customer Dashboard Announcements
- Add announcements state to admin
- Admin can create/edit/delete announcements
- Display announcements on customer dashboard and homepage
- Store in localStorage/server

### 5. 30 Packages with Images (Service Page)
- Expand PACKAGES constant in constants.ts
- Add ~30 package items with images, descriptions, prices
- Make packages clickable with details modal

### 6. Admin Package Management
- Add admin UI to manage packages
- Upload package images locally
- Edit package details (name, price, description, features)

### 7. Fix 'Use' Button in Categories
- The 'Use' button action is `admin-image-to-design`
- Need to implement the handler properly
- Should convert category image to design

### 8. Fix Design Page Scroll Position
- When clicking on design, page scrolls to top
- Need to preserve scroll position on navigation
- Add scroll restoration logic

## Implementation Approach

All changes will be made to:
- `main.ts` - Main application logic and UI
- `constants.ts` - Package data
- `types.ts` - Type definitions (if needed)
- `index.css` - Dark mode styles
- `server/index.js` - API endpoints for announcements/packages
