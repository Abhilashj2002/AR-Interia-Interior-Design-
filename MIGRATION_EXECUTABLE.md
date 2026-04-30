# Phase-3 Migration: Executable Step-by-Step

**Status**: In Progress | **Started**: April 2, 2026

## Overview
Extracting code from monolith (`main.ts`, `server/index.js`, `server/db.js`) into domain-based modules with clear tier labeling:
- **FRONTEND**: UI rendering (main.ts)
- **BACKEND**: API routes (server/index.js)
- **DATABASE**: Query operations (server/db.js)

---

## Execution Plan by Domain

### Phase 3a: Homepage (Pure UI)
**FRONTEND**: `frontend/src/features/homepage/`
- `index.ts` - Main exports
- `render.ts` - Homepage HTML rendering (from main.ts line ~6000-6600)
- `state.ts` - Homepage UI state helpers
- `handlers.ts` - Click/form event handlers

**BACKEND**: `backend/src/modules/homepage/`
- `routes.js` - No dedicated routes (homepage is static landing)
- `README.md` - Module documentation

**DATABASE**: Uses existing backend/src/db/sqlite.js (wrapper)

---

### Phase 3b: Categories (UI + Routes)
**FRONTEND**: `frontend/src/features/categories/`
- `render.ts` - Category grid rendering
- `filters.ts` - Category filter logic
- `handlers.ts` - Category selection handlers

**BACKEND**: `backend/src/modules/categories/`
- `routes.js` - GET /api/categories, POST /api/categories/*, etc.
- `db.js` - Category queries (from server/db.js)

---

### Phase 3c: Gallery (UI + Routes)
**FRONTEND**: `frontend/src/features/gallery/`
- `render.ts` - Gallery grid/modal rendering
- `lightbox.ts` - Gallery lightbox logic
- `handlers.ts` - Gallery interaction

**BACKEND**: `backend/src/modules/gallery/`
- `routes.js` - Gallery API routes
- `/api/category-images` handlers

---

### Phase 3d: Services + Packages + Portfolio
**FRONTEND**: `frontend/src/features/{services,packages,portfolio}/`
**BACKEND**: `backend/src/modules/{services,packages,portfolio}/`

---

### Phase 3e: Design Studio + Chatbot + Price Calculator  
**FRONTEND**: `frontend/src/features/{design-studio,chatbot,price-calculator}/`
**BACKEND**: `backend/src/modules/{design-studio,chatbot,price-calculator}/`

---

### Phase 3f: Admin + Customer Dashboards
**FRONTEND**: `frontend/src/features/{admin-dashboard,customer-dashboard}/`
**BACKEND**: `backend/src/modules/{admin-dashboard,customer-dashboard}/`

---

### Phase 3g: Payments + Invoices
**FRONTEND**: `frontend/src/features/{payments,invoices}/`
**BACKEND**: `backend/src/modules/{payments,invoices}/`

---

## File Mapping: What Goes Where

| Code | Current Location | Target Location | Tier | Status |
|------|-----------------|-----------------|------|--------|
| Homepage render | main.ts (6000-6600) | frontend/src/features/homepage/render.ts | FRONTEND | 🟡 WIP |
| Category render | main.ts (1500-2500) | frontend/src/features/categories/render.ts | FRONTEND | ⏳ |
| Gallery render | main.ts (3000-4000) | frontend/src/features/gallery/render.ts | FRONTEND | ⏳ |
| Admin panel UI | main.ts (8000-15000) | frontend/src/features/admin-dashboard/render.ts | FRONTEND | ⏳ |
| Customer dashboard | main.ts (13000-14000) | frontend/src/features/customer-dashboard/render.ts | FRONTEND | ⏳ |
| Design Studio UI | main.ts (17000-18000) | frontend/src/features/design-studio/render.ts | FRONTEND | ⏳ |
| Chatbot UI | main.ts (11000-12000) | frontend/src/features/chatbot/render.ts | FRONTEND | ⏳ |
| Price Calculator | main.ts (5700-6700) | backend/src/modules/price-calculator/... | FRONTEND | ⏳ |
| **Categories routes** | server/index.js (1000-1200) | backend/src/modules/categories/routes.js | BACKEND | ⏳ |
| **Designs routes** | server/index.js (1200-1400) | backend/src/modules/design-studio/routes.js | BACKEND | ⏳ |
| **Bookings routes** | server/index.js (858-961) | backend/src/modules/services/routes.js | BACKEND | ⏳ |
| **Payments routes** | server/index.js (1006-1700+) | backend/src/modules/payments/routes.js | BACKEND | ⏳ |
| **Invoices routes** | server/routes/invoices.js | backend/src/modules/invoices/routes.js | BACKEND | ⏳ |
| **Chatbot routes** | server/index.js (2600+) | backend/src/modules/chatbot/routes.js | BACKEND | ⏳ |
| **customerQueries** | server/db.js (getCustomers, etc.) | backend/src/modules/admin-dashboard/db.js | DATABASE | ⏳ |
| **designQueries** | server/db.js (getDesigns, etc.) | backend/src/modules/design-studio/db.js | DATABASE | ⏳ |
| **paymentQueries** | server/db.js (getPayments, etc.) | backend/src/modules/payments/db.js | DATABASE | ⏳ |

---

## Validation Checkpoints

After each domain extraction:
1. ✅ Create module folder structure
2. ✅ Create wrapper imports (point to legacy code)
3. ✅ Add clear tier labels (FRONTEND/BACKEND/DATABASE)
4. ✅ Run `npm run build` → should pass
5. ✅ Run `npm run dev:server` → should start
6. ✅ Verify app loads in browser
7. ✅ Document in module README.md

---

## Next Steps

1. **NOW**: Extract Homepage (FRONTEND only)
2. **Step 2**: Extract Categories + Gallery (FRONTEND + BACKEND)
3. **Step 3**: Extract Services + Packages (BACKEND routes)
4. **Continue**: Following the sequential order in this document
5. **Final**: Delete legacy monolith files after all code moved

---

## Key Labels Used

```typescript
// ===== FRONTEND: Homepage Rendering =====
// Location: frontend/src/features/homepage/
// Legacy source: main.ts (lines 6000-6600)
// Purpose: Render landing page UI

// ===== BACKEND: Homepage Routes =====
// Location: backend/src/modules/homepage/
// Legacy source: server/index.js
// Purpose: API endpoints for homepage

// ===== DATABASE: Homepage Queries =====
// Location: backend/src/db/sqlite.js (wrapper)
// Legacy source: server/db.js
// Purpose: SQLite database access layer
```

---

**Progress**: 1/15 domains extracted (Homepage WIP) | **ETA**: 15-20 extractsions total
