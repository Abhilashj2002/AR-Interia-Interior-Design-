// ===== FRONTEND: Contact Rendering =====
// Location: frontend/src/features/contact/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderContact)
// Purpose: Render contact page while runtime migration is in progress.

export const renderContactFeature = (): string => {
  try {
    const legacyRenderContact = (globalThis as any).renderContact;
    if (typeof legacyRenderContact === 'function') {
      return legacyRenderContact();
    }
    return '';
  } catch (error) {
    console.error('[Contact] Error rendering contact page:', error);
    return '';
  }
};

export default renderContactFeature;
