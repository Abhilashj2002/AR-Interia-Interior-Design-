// ===== FRONTEND: Gallery Rendering =====
// Location: frontend/src/features/gallery/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderGallery)
// Purpose: Render gallery view while runtime migration is in progress.

/**
 * WRAPPER: Gallery rendering feature
 *
 * This delegates to the legacy renderGallery function in main.ts.
 * During migration, full gallery implementation can be moved here.
 */
export const renderGalleryFeature = (): string => {
  try {
    const legacyRenderGallery = (globalThis as any).renderGallery;
    if (typeof legacyRenderGallery === 'function') {
      return legacyRenderGallery();
    }
    return '';
  } catch (error) {
    console.error('[Gallery] Error rendering gallery:', error);
    return '';
  }
};

export default renderGalleryFeature;
