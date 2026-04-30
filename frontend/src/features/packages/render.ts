// ===== FRONTEND: Package Modal Rendering =====
// Location: frontend/src/features/packages/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderPackageModal)
// Purpose: Render the package modal while runtime migration is in progress.

export const renderPackageFeature = (): string => {
  try {
    const legacyRenderPackageModal = (globalThis as any).renderPackageModal;
    if (typeof legacyRenderPackageModal === 'function') {
      return legacyRenderPackageModal();
    }
    return '';
  } catch (error) {
    console.error('[Packages] Error rendering package modal:', error);
    return '';
  }
};

export default renderPackageFeature;
