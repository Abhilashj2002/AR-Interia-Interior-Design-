// ===== FRONTEND: Service Details Modal Rendering =====
// Location: frontend/src/features/services-details/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderServiceDetailsModal, renderServiceShowcaseDetailsModal)
// Purpose: Render service detail modals while runtime migration is in progress.

export const renderServiceDetailsFeature = (): string => {
  try {
    const legacyRenderServiceDetailsModal = (globalThis as any).renderServiceDetailsModal;
    if (typeof legacyRenderServiceDetailsModal === 'function') {
      return legacyRenderServiceDetailsModal();
    }
    return '';
  } catch (error) {
    console.error('[ServiceDetails] Error rendering service details modal:', error);
    return '';
  }
};

export const renderServiceShowcaseDetailsFeature = (): string => {
  try {
    const legacyRenderServiceShowcaseDetailsModal = (globalThis as any).renderServiceShowcaseDetailsModal;
    if (typeof legacyRenderServiceShowcaseDetailsModal === 'function') {
      return legacyRenderServiceShowcaseDetailsModal();
    }
    return '';
  } catch (error) {
    console.error('[ServiceShowcaseDetails] Error rendering service showcase modal:', error);
    return '';
  }
};

export default { renderServiceDetailsFeature, renderServiceShowcaseDetailsFeature };
