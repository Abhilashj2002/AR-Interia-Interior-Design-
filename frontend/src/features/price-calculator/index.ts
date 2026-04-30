// ===== PRICE CALCULATOR: Main Entry Point =====
// Location: frontend/src/features/price-calculator/index.ts
// Purpose: Centralized export for all calculator utilities

export type {
  CalcImageQuality,
  RecommendationHomeType,
  CalculatorDesign,
  CalculatorState,
  CalculatorConfig,
  CalculatorImage,
  CalculatorLibraryEntry,
  CalculatorPackage,
  CategoryAliasMap,
  CategoryFeatureMap,
  FeatureAliasTokens,
  VillaConceptsByQuality,
  CategoryQualityConcepts
} from './types';

export {
  normalizeFeatureText,
  includesAnyToken,
  normalizeAssetUrl,
  createSpaceClassifier,
  determineRecommendationHomeType,
  createImageResolver,
  createQualityMatcher,
  createCategoryFilter,
  applyApartmentCategoryFilter,
  createDefaultCalculatorConfig
} from './logic';

export { renderPriceCalculatorFeature } from './render';

// Default export for convenience
import { renderPriceCalculatorFeature } from './render';
export default renderPriceCalculatorFeature;
