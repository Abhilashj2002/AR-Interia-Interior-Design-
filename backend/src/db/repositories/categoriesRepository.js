// Database repository for categories.
// Uses sqlite compatibility exports that delegate to server/db.js during migration.

import { getAsync, allAsync, runAsync } from '../sqlite.js';

export const listCategories = async () => {
  try {
    return await allAsync('SELECT * FROM categories ORDER BY createdAt DESC', []);
  } catch (error) {
    console.error('[Categories Repository] listCategories error:', error);
    return [];
  }
};

export const findCategoryById = async (id) => {
  try {
    return await getAsync('SELECT * FROM categories WHERE id = ?', [id]);
  } catch (error) {
    console.error('[Categories Repository] findCategoryById error:', error);
    return null;
  }
};

export const executeCategoryQuery = {
  getAsync,
  allAsync,
  runAsync
};
