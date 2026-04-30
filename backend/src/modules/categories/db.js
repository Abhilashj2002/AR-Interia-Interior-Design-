// ===== DATABASE: Categories Queries =====
// Location: backend/src/modules/categories/
// Tier: DATABASE (SQLite Query Operations)
// Source: backend/src/db/repositories/categoriesRepository.js

import {
  listCategories,
  findCategoryById,
  executeCategoryQuery
} from '../../db/index.js';

const { getAsync, runAsync, allAsync } = executeCategoryQuery;

// Export common category query helpers
export { getAsync, runAsync, allAsync };

export const getCategories = listCategories;
export const getCategoryById = findCategoryById;

console.log('[Categories DB] Module now uses backend/src/db repository layer');
