// ===== PRICE CALCULATOR: Type Definitions =====
// Location: frontend/src/features/price-calculator/types.ts
// Purpose: Centralized type definitions for calculator logic and state

export type CalcImageQuality = 'economy' | 'premium' | 'luxury';
export type RecommendationHomeType = 'villa' | 'apartment';

export interface CalculatorDesign {
  id: string;
  title: string;
  category: string;
  style?: string;
  previewImage?: string;
  image?: string;
  source?: string;
  packageId?: string | number;
  packageName?: string;
  roomId?: string | number | null;
  qualityScore?: number;
  description?: string;
  categoryId?: string;
}

export interface CalculatorState {
  calculator: {
    relatedDesigns: CalculatorDesign[];
    selectedDesignId: string | number | null;
  };
}

export interface CategoryAliasMap {
  [categoryKey: string]: string[];
}

export interface CategoryFeatureMap {
  [categoryKey: string]: string;
}

export interface FeatureAliasTokens {
  [featureName: string]: string[];
}

export interface VillaConceptsByQuality {
  economy: Array<{ title: string; category: string }>;
  premium: Array<{ title: string; category: string }>;
  luxury: Array<{ title: string; category: string }>;
}

export interface CalculatorImage {
  id?: string;
  previewImage?: string;
  image?: string;
  title?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  images?: string[];
}

export interface CalculatorLibraryEntry {
  id?: string;
  homeType?: string;
  quality?: string;
  bhk?: number;
  title?: string;
  category?: string;
  image?: string;
  description?: string;
  active?: boolean;
}

export interface CalculatorPackage {
  id?: string;
  type?: string;
  bhk?: number;
  name?: string;
  subtitle?: string;
  rooms?: any[];
  features?: string[];
}

export interface CategoryQualityConcepts {
  [categoryKey: string]: {
    economy?: string;
    premium?: string;
    luxury?: string;
  };
}

// Helper types for calculator configuration
export interface CalculatorConfig {
  villaOnlySpaceTokens: string[];
  apartmentBlockedSpaceTokens: string[];
  apartmentCoreTokens: string[];
  categoryAliasTokens: CategoryAliasMap;
  categoryToFeatureKey: CategoryFeatureMap;
  featureAliasTokens: FeatureAliasTokens;
  villaConceptsByQuality: VillaConceptsByQuality;
}
