// ===== BACKEND: Categories Routes =====
// Location: backend/src/modules/categories/
// Tier: BACKEND (API Endpoints)
// Legacy Source: server/index.js (scattered category routes around lines 1000+)
// Purpose: API endpoints for categories CRUD and retrieval

import express from 'express';
const router = express.Router();

/**
 * PLACEHOLDER: Router for category endpoints
 * 
 * Planned endpoints (to be extracted from server/index.js):
 * - GET    /api/categories                    List all categories
 * - POST   /api/categories                    Create category (admin)
 * - PUT    /api/categories/:id                Update category (admin)  
 * - DELETE /api/categories/:id                Delete category (admin)
 * - GET    /api/categories/:id                Get category details
 * - POST   /api/categories/:id/images         Upload category images
 * - GET    /api/category-images/:path        Serve category images
 * 
 * Note: All category routes currently run from legacy server/index.js
 * Migration to this module planned for Phase-3b
 */

// Empty router placeholder
// Routes will be extracted and added here during Phase-3b migration

console.log('[Categories Routes] Placeholder router initialized (legacy routes in server/index.js)');

export default router;
