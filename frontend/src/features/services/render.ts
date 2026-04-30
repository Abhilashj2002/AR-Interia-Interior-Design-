// ===== FRONTEND: Services Rendering =====
// Location: frontend/src/features/services/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderServices)
// Purpose: Render services page while runtime migration is in progress.

export const renderServicesFeature = (): string => {
  try {
    const legacyRenderServices = (globalThis as any).renderServices;
    if (typeof legacyRenderServices === 'function') {
      return legacyRenderServices();
    }
    return '';
  } catch (error) {
    console.error('[Services] Error rendering services:', error);
    return '';
  }
};

export default renderServicesFeature;
