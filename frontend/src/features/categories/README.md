# Module: Categories

## 📊 Multi-Tier Module (FRONTEND + BACKEND + DATABASE)

### TIER 1: FRONTEND
**Location**: `frontend/src/features/categories/`
- **render.ts**: Category grid/list rendering
- **index.ts**: Module exports
- **Legacy Source**: main.ts (renderCategories, lines ~1500-2500)
- **Purpose**: Render category browse UI with search/filter

### TIER 2: BACKEND  
**Location**: `backend/src/modules/categories/`
- **routes.js**: API endpoints for category CRUD
- **db.js**: Database query layer
- **Legacy Source**: server/index.js (category routes ~1000+ lines)
- **Purpose**: REST API for category operations
- **Endpoints**:
  - `GET /api/categories` - List all categories
  - `POST /api/categories` - Create (admin)
  - `PUT /api/categories/:id` - Update (admin)
  - `DELETE /api/categories/:id` - Delete (admin)
  - `GET /api/category-images` - Serve images
  - `POST /api/categories/:id/images` - Upload images

### TIER 3: DATABASE
**Location**: Uses `backend/src/db/sqlite.js` (wrapped from server/db.js)
- **Query Functions**:
  - `getCategories()` - Retrieve all categories
  - `getCategoryById(id)` - Single category fetch
  - `saveCategory(data)` - Insert new category
  - `updateCategory(id, data)` - Update existing
  - `deleteCategory(id)` - Remove category
  - `getCategoryEarnings(categoryId)` - Revenue analytics

## Status
- **FRONTEND**: Wrapper created ✅
- **BACKEND**: Routes skeleton created ✅  
- **DATABASE**: Queries skeleton created ✅
- **Migration**: Phase-3b scheduled
- **Build**: ✅ Passes npm run build