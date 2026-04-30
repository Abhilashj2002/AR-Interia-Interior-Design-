// ===== FRONTEND: Showroom Rendering =====
// Location: frontend/src/features/luxury-showroom/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderShowroom)
// Purpose: Render showroom view while runtime migration is in progress.

export const renderShowroomFeature = (): string => {
  try {
    const legacyRenderShowroom = (globalThis as any).renderShowroom;
    if (typeof legacyRenderShowroom === 'function') {
      return legacyRenderShowroom();
    }
    return '';
  } catch (error) {
    console.error('[Showroom] Error rendering showroom:', error);
    return '';
  }
};

export default renderShowroomFeature;
