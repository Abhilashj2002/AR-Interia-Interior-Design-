// ===== FRONTEND: Categories Rendering =====
// Location: frontend/src/features/categories/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (lines 1500-2500, renderCategories function)
// Purpose: Render category grid/list with search and filter UI

/**
 * WRAPPER: Categories rendering feature
 * 
 * For now, this delegates to the legacy renderCategories function in main.ts
 * During Phase-3 migration, the full renderCategories implementation will be
 * extracted and moved here.
 */

declare const renderCategories: () => string;

/**
 * Renders the categories browse page
 * - Grid of category cards with images
 * - Search/filter functionality
 * - Category selection handlers
 */
export const renderCategoriesFeature = (): string => {
  try {
    return (globalThis as any).renderCategories?.() || '';
  } catch (error) {
    console.error('[Categories] Error rendering categories:', error);
    return '';
  }
};

/**
 * Helper: Filter categories by search query
 */
export const filterCategoriesByQuery = (categories: any[], query: string): any[] => {
  if (!query) return categories;
  const lower = query.toLowerCase();
  return categories.filter((cat: any) =>
    (cat.title || '').toLowerCase().includes(lower) ||
    (cat.name || '').toLowerCase().includes(lower)
  );
};

export default renderCategoriesFeature;
