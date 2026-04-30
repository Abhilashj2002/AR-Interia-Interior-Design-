// ===== FRONTEND: Price Calculator Rendering =====
// Location: frontend/src/features/price-calculator/
// Tier: FRONTEND (User Interface)
// Purpose: Render the calculator modal using modularized logic

// Re-export types for consumers
export type {
  CalcImageQuality,
  RecommendationHomeType,
  CalculatorDesign,
  CalculatorState,
  CalculatorConfig
} from './types';

// Re-export logic utilities
export {
  normalizeFeatureText,
  includesAnyToken,
  createSpaceClassifier,
  determineRecommendationHomeType,
  normalizeAssetUrl,
  createImageResolver,
  createQualityMatcher,
  createCategoryFilter,
  applyApartmentCategoryFilter,
  createDefaultCalculatorConfig
} from './logic';

/**
 * Main render function for price calculator modal
 * Delegates to the global renderPriceCalculatorModal if available
 * (maintained for backward compatibility with main.ts)
 */
export const renderPriceCalculatorFeature = (): string => {
  try {
    const legacyRenderPriceCalculatorModal = (globalThis as any).renderPriceCalculatorModal;
    if (typeof legacyRenderPriceCalculatorModal === 'function') {
      return legacyRenderPriceCalculatorModal();
    }
    return '';
  } catch (error) {
    console.error('[PriceCalculator] Error rendering calculator modal:', error);
    return '';
  }
};

export default renderPriceCalculatorFeature;
