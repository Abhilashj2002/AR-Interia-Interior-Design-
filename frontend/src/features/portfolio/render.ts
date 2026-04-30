// ===== FRONTEND: Portfolio Rendering =====
// Location: frontend/src/features/portfolio/
// Tier: FRONTEND (User Interface)
// Legacy Source: main.ts (renderPortfolio)
// Purpose: Render portfolio page while runtime migration is in progress.

export const renderPortfolioFeature = (): string => {
  try {
    const legacyRenderPortfolio = (globalThis as any).renderPortfolio;
    if (typeof legacyRenderPortfolio === 'function') {
      return legacyRenderPortfolio();
    }
    return '';
  } catch (error) {
    console.error('[Portfolio] Error rendering portfolio page:', error);
    return '';
  }
};

export default renderPortfolioFeature;
