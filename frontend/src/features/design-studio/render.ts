// ===== FRONTEND: Design Studio Rendering =====
// Location: frontend/src/features/design-studio/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderAiStudio)
// Purpose: Render the AI/design studio page while runtime migration is in progress.

export const renderDesignStudioFeature = (): string => {
  try {
    const legacyRenderAiStudio = (globalThis as any).renderAiStudio;
    if (typeof legacyRenderAiStudio === 'function') {
      return legacyRenderAiStudio();
    }
    return '';
  } catch (error) {
    console.error('[DesignStudio] Error rendering design studio:', error);
    return '';
  }
};

export default renderDesignStudioFeature;
