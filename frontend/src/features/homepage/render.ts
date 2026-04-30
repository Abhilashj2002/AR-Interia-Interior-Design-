// ===== FRONTEND: Homepage Rendering =====
// Location: frontend/src/features/homepage/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (lines 6128-6700+)
// Purpose: Render the landing page home view with hero slides, featured designs, packages, testimonials

/**
 * WRAPPER: Homepage rendering feature
 * 
 * For now, this delegates to the legacy renderHome function in main.ts
 * During Phase-3 migration, the full renderHome implementation will be
 * extracted and moved here.
 * 
 * After migration, this will be the single source of truth for homepage UI.
 */

// Gracefully delegate to global renderHome from main.ts.
// Runtime wiring in main.ts assigns: globalThis.renderHome = renderHome

/**
 * Renders the landing page (home view) with:
 * - Hero slider with featured design concepts
 * - Workspace showcase (featured designs)
 * - Studio highlights features
 * - Founder/about section
 * - Services overview
 * - Package cards with BHK filters
 * - Customer feedback/testimonials
 * - Portfolio feedback videos
 * - Call-to-action sections
 */
export const renderHomePageFeature = (): string => {
  try {
    const legacyRenderHome = (globalThis as any).renderHome;
    if (typeof legacyRenderHome === 'function') {
      return legacyRenderHome();
    }
    return '';
  } catch (error) {
    console.error('[HomePage] Error rendering homepage:', error);
    return '';
  }
};

export default renderHomePageFeature;
