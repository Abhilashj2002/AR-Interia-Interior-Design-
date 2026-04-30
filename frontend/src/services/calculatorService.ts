// ===== PRICE CALCULATOR: Service Layer =====
// Location: frontend/src/services/calculatorService.ts
// Purpose: High-level service for calculator operations

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
} from '../features/price-calculator/logic';

export type {
  CalcImageQuality,
  RecommendationHomeType,
  CalculatorDesign,
  CalculatorState,
  CalculatorConfig,
  CalculatorImage,
  CalculatorLibraryEntry,
  CalculatorPackage
} from '../features/price-calculator/types';

/**
 * Calculator Service Factory
 * 
 * Creates a complete calculator service with all utilities
 * configured and ready to use. This is the main entry point
 * for calculator operations throughout the application.
 * 
 * Usage:
 * const service = createCalculatorService();
 * const homeType = service.determineHomeType('garden', 3, 'rectangle');
 */
export const createCalculatorService = () => {
  const {
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
  } = require('../features/price-calculator/logic');

  const config = createDefaultCalculatorConfig();
  const spaceClassifier = createSpaceClassifier(config);
  const qualityMatcher = createQualityMatcher();

  return {
    // Configuration and utilities
    config,
    normalizeFeatureText,
    includesAnyToken,
    normalizeAssetUrl,
    
    // Space classification
    isVillaOnlySpace: spaceClassifier.isVillaOnlySpace,
    isAllowedApartmentSpace: spaceClassifier.isAllowedApartmentSpace,
    
    // Home type determination
    determineHomeType: (category: string, bhk: number, shape?: string) => {
      return determineRecommendationHomeType(category, bhk, shape);
    },
    
    // Quality matching
    getQualityMatchScore: qualityMatcher.getQualityMatchScore,
    qualityKeywords: qualityMatcher.qualityKeywords,
    qualityTiers: qualityMatcher.qualityTiers,
    
    // Image resolution (requires getContextImages function)
    createImageResolver,
    
    // Category filtering
    createCategoryFilter,
    applyApartmentCategoryFilter
  };
};

// Re-export as singleton for convenience
let singletonService: ReturnType<typeof createCalculatorService> | null = null;

export const getCalculatorService = () => {
  if (!singletonService) {
    singletonService = createCalculatorService();
  }
  return singletonService;
};
