// ===== FRONTEND: Video Modal Rendering =====
// Location: frontend/src/features/video/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderVideoModal)
// Purpose: Render the video modal while runtime migration is in progress.

export const renderVideoFeature = (): string => {
  try {
    const legacyRenderVideoModal = (globalThis as any).renderVideoModal;
    if (typeof legacyRenderVideoModal === 'function') {
      return legacyRenderVideoModal();
    }
    return '';
  } catch (error) {
    console.error('[Video] Error rendering video modal:', error);
    return '';
  }
};

export default renderVideoFeature;
