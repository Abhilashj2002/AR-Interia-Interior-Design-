// ===== PRICE CALCULATOR: Core Logic =====
// Location: frontend/src/features/price-calculator/logic.ts
// Purpose: Core calculation and filtering logic for price calculator

import type {
  CalculatorConfig,
  CalculatorDesign,
  CalculatorImage,
  CalculatorLibraryEntry,
  CalcImageQuality,
  RecommendationHomeType
} from './types';

// ===== TEXT NORMALIZATION =====
export const normalizeFeatureText = (value: string): string => {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
};

export const includesAnyToken = (text: string, tokens: string[]): boolean => {
  return tokens.some((token) => text.includes(token));
};

// ===== SPACE TYPE CLASSIFICATION =====
export const createSpaceClassifier = (config: CalculatorConfig) => {
  const isVillaOnlySpace = (value: string): boolean => {
    const normalized = normalizeFeatureText(value);
    return config.villaOnlySpaceTokens.some((token) => normalized.includes(token));
  };

  const isAllowedApartmentSpace = (value: string, explicitCategoryOverride?: string): boolean => {
    const normalized = normalizeFeatureText(value);
    if (!normalized) return false;

    if (explicitCategoryOverride) {
      const overrideKey = normalizeFeatureText(explicitCategoryOverride);
      const overrideTokens = (config.categoryAliasTokens[overrideKey] || overrideKey.split(' ').filter(Boolean));
      if (overrideTokens.some((token) => token && normalized.includes(normalizeFeatureText(token)))) return true;
    }

    if (isVillaOnlySpace(normalized)) return false;
    if (config.apartmentBlockedSpaceTokens.some((token) => normalized.includes(token))) return false;
    return config.apartmentCoreTokens.some((token) => normalized.includes(token));
  };

  return { isVillaOnlySpace, isAllowedApartmentSpace };
};

// ===== HOME TYPE DETERMINATION =====
export const determineRecommendationHomeType = (
  effectiveCategory: string,
  bhk: number,
  shape?: string
): RecommendationHomeType => {
  const effectiveKey = normalizeFeatureText(effectiveCategory);
  const configDrivenType: RecommendationHomeType = (Number(bhk) >= 4 || String(shape || '').toLowerCase() === 'custom') ? 'villa' : 'apartment';
  
  if (effectiveKey === 'villa') return 'villa';
  if (effectiveKey === 'apartment') return 'apartment';
  return configDrivenType;
};

// ===== IMAGE RESOLUTION =====
export const normalizeAssetUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.length === 0) return '';
  return `/${trimmed}`.replace(/\/+/g, '/');
};

export const createImageResolver = (getContextImages: (cat: string) => string[]) => {
  const resolveCalculatorImage = (item: CalculatorImage, fallbackCategory: string, index = 0): string => {
    const cat = String(item?.category || item?.title || fallbackCategory);
    const pool = getContextImages(cat) || getContextImages(fallbackCategory);
    const direct = normalizeAssetUrl(String(
      item?.previewImage
      || item?.image
      || item?.imageUrl
      || item?.url
      || (Array.isArray(item?.images) ? item.images[0] : '')
      || ''
    ));

    if (direct && direct.length > 10) return direct;
    
    const seed = String(item?.title || item?.category || fallbackCategory).length + index;
    const poolUrl = pool[seed % pool.length];
    
    if (poolUrl && poolUrl.startsWith('http')) {
      return `${poolUrl}?auto=format&fit=crop&q=80&w=800&sig=${seed}`;
    }
    return poolUrl || '';
  };

  const ensureUniqueRelatedImages = (items: CalculatorDesign[], fallbackCategory: string, seedBase: string): CalculatorDesign[] => {
    const seen = new Set<string>();
    const fallbackPool = (getContextImages(fallbackCategory) || []).map((img) => normalizeAssetUrl(String(img || ''))).filter(Boolean);
    const itemDrivenPool = (items || [])
      .flatMap((item: any) => getContextImages(String(item?.category || item?.title || fallbackCategory)) || [])
      .map((img) => normalizeAssetUrl(String(img || '')))
      .filter(Boolean);
    const globalPool = Array.from(new Set([...itemDrivenPool, ...fallbackPool]));
    const fallbackSeed = String(seedBase || fallbackCategory).length;

    return (items || []).map((item: any, index: number) => {
      const currentImage = normalizeAssetUrl(String(item?.previewImage || item?.image || ''));
      let resolved = currentImage;
      const itemPool = (getContextImages(String(item?.category || item?.title || fallbackCategory)) || [])
        .map((img) => normalizeAssetUrl(String(img || '')))
        .filter(Boolean);

      if (!resolved || seen.has(resolved)) {
        for (let offset = 0; offset < itemPool.length; offset += 1) {
          const candidate = itemPool[(fallbackSeed + index + offset) % itemPool.length];
          if (candidate && !seen.has(candidate)) {
            resolved = candidate;
            break;
          }
        }
      }

      if (!resolved || seen.has(resolved)) {
        for (let offset = 0; offset < globalPool.length; offset += 1) {
          const candidate = globalPool[(fallbackSeed + index + offset) % globalPool.length];
          if (candidate && !seen.has(candidate)) {
            resolved = candidate;
            break;
          }
        }
      }

      if (resolved) seen.add(resolved);
      return {
        ...item,
        previewImage: resolved || currentImage
      };
    }).filter((item: any) => Boolean(String(item?.previewImage || '').trim()));
  };

  return { resolveCalculatorImage, ensureUniqueRelatedImages };
};

// ===== QUALITY MATCHING =====
export const createQualityMatcher = () => {
  const qualityKeywords = {
    economy: ['essential', 'standard', 'basic', 'economy', 'simple', 'minimal', 'budget'],
    premium: ['premium', 'luxury', 'designer', 'modern', 'elegant', 'sophisticated', 'enhanced'],
    luxury: ['ultimate', 'luxury', 'luxurious', 'opulent', 'exclusive', 'prestige', 'elite', 'royal', 'palatial']
  };

  const qualityTiers = {
    economy: 'essential',
    premium: 'luxury',
    luxury: 'ultimate'
  };

  const getQualityMatchScore = (design: any, targetQuality: string): number => {
    const searchableText = normalizeFeatureText(
      `${String(design?.title || '')} ${String(design?.description || '')} ${String(design?.style || '')} ${String(design?.category || '')}`
    );
    const keywords = qualityKeywords[targetQuality as keyof typeof qualityKeywords] || [];
    let score = 0;
    keywords.forEach(keyword => {
      if (searchableText.includes(keyword)) score += 2;
    });
    // Bonus for exact quality tier match
    const qualityTier = qualityTiers[targetQuality as keyof typeof qualityTiers] || '';
    if (qualityTier && searchableText.includes(qualityTier)) score += 5;
    return score;
  };

  return { getQualityMatchScore, qualityKeywords, qualityTiers };
};

// ===== CATEGORY FILTERING WITH ALIASES =====
export const createCategoryFilter = (config: CalculatorConfig) => {
  const filterByAliasTokens = (items: any[], categoryKey: string): any[] => {
    const strictCategoryTokens = config.categoryAliasTokens[categoryKey] || categoryKey.split(' ').filter(Boolean);
    const strictCategoryPattern = new RegExp(`\\b(${strictCategoryTokens.join('|')})\\b`, 'i');

    return items.filter((item: any) => {
      const text = normalizeFeatureText(`${String((item as any).category || '')} ${String((item as any).title || '')} ${String((item as any).description || '')}`);
      return strictCategoryPattern.test(text);
    });
  };

  const strictFilterRelatedDesigns = (
    items: CalculatorDesign[],
    categoryKey: string,
    resultCategoryLabel: string
  ): CalculatorDesign[] => {
    const itemText = normalizeFeatureText(`${String('')} ${String('')}`);
    const itemCategory = String('').toLowerCase();
    const effectiveCategoryKey = normalizeFeatureText(resultCategoryLabel).toLowerCase();
    const strictCategoryTokens = (config.categoryAliasTokens[categoryKey] || categoryKey.split(' ').filter(Boolean));

    return items.filter((item: any) => {
      const itemText = normalizeFeatureText(`${String(item?.category || '')} ${String(item?.title || '')}`);
      const itemCategory = String(item?.category || item?.categoryId || '').toLowerCase();
      
      return itemCategory === effectiveCategoryKey
        || itemCategory.includes(effectiveCategoryKey)
        || effectiveCategoryKey.includes(itemCategory)
        || strictCategoryTokens.some((token) => token && itemText.includes(normalizeFeatureText(token)));
    });
  };

  return { filterByAliasTokens, strictFilterRelatedDesigns };
};

// ===== APARTMENT CATEGORY REMAPPING =====
export const applyApartmentCategoryFilter = (
  items: CalculatorDesign[],
  effectiveCategory: string,
  isAllowedApartmentSpace: (value: string, override?: string) => boolean,
  config: CalculatorConfig
): CalculatorDesign[] => {
  const selectedCategory = normalizeFeatureText(effectiveCategory).toLowerCase();
  const selectedCategoryTokens = config.categoryAliasTokens[selectedCategory] || selectedCategory.split(' ').filter(Boolean);

  return items.filter((item: any) => {
    const itemCategory = String(item?.category || '').toLowerCase();
    const itemText = normalizeFeatureText(`${String(item?.title || '')} ${String(item?.category || '')}`);

    // Exact category match
    if (itemCategory === selectedCategory || itemCategory.includes(selectedCategory)) {
      return true;
    }

    // Alias token match
    if (selectedCategoryTokens.some((token) => token && itemCategory.includes(normalizeFeatureText(token)))) {
      return true;
    }
    if (selectedCategoryTokens.some((token) => token && itemText.includes(normalizeFeatureText(token)))) {
      return true;
    }

    // Fallback to apartment filter
    return isAllowedApartmentSpace(itemText, selectedCategory);
  });
};

// ===== DEFAULT CONFIGURATION FACTORY =====
export const createDefaultCalculatorConfig = (): CalculatorConfig => {
  return {
    villaOnlySpaceTokens: ['terrace', 'gym', 'fitness', 'theater', 'theatre', 'cinema', 'spa', 'swimming', 'pool'],
    apartmentBlockedSpaceTokens: ['office', 'study', 'workspace', 'meeting', 'conference', 'boardroom', 'classroom', 'school', 'epoxy', 'garden', 'balcony'],
    apartmentCoreTokens: ['kitchen', 'living', 'lounge', 'dining', 'bath', 'bed', 'suite', 'pooja', 'prayer', 'mandir', 'wardrobe', 'closet'],
    categoryAliasTokens: {
      'office interior': ['office', 'study', 'workspace', 'desk', 'home office'],
      'terrace': ['terrace', 'rooftop', 'deck', 'balcony'],
      'swimming pool': ['swimming pool', 'pool', 'infinity pool'],
      'garden': ['garden', 'landscape', 'courtyard', 'green'],
      'balcony': ['balcony', 'deck', 'terrace'],
      'wardrobe': ['wardrobe', 'closet', 'dressing'],
      'living room': ['living', 'lounge', 'living area', 'hall'],
      'kitchen': ['kitchen', 'chef', 'modular kitchen', 'gourmet'],
      'bathroom': ['bathroom', 'bath', 'vanity', 'spa'],
      'pooja room': ['pooja', 'prayer', 'mandir'],
      'gym': ['gym', 'fitness', 'workout', 'wellness'],
      'meeting room': ['meeting', 'conference', 'boardroom', 'office'],
      'classroom': ['class', 'school', 'education', 'training'],
      'epoxy floor': ['epoxy', 'floor', 'industrial', 'garage'],
      'guest room': ['guest', 'bedroom', 'extra room'],
      'spa': ['spa', 'massage', 'wellness', 'relaxation']
    },
    categoryToFeatureKey: {
      'office interior': 'Home Office',
      'terrace': 'Terrace',
      'swimming pool': 'Swimming Pool',
      'garden': 'Terrace',
      'balcony': 'Balcony Design',
      'living room': 'Grand Living',
      'kitchen': 'Modular Kitchen',
      'bathroom': 'Bathroom Vanity',
      'pooja room': 'Pooja Room',
      'gym': 'Home Gym',
      'home theatre': 'Home Theater',
      'villa': 'Swimming Pool',
      'apartment': 'Living + Dining',
      'meeting room': 'Home Office',
      'classroom': 'Home Office',
      'epoxy floor': 'Terrace',
      'guest room': 'Family Bedrooms',
      'spa': 'Spa Bathroom'
    },
    featureAliasTokens: {
      'modular kitchen': ['modular kitchen', 'kitchen', 'chef', 'gourmet', 'cook'],
      'designer kitchen': ['designer kitchen', 'kitchen', 'chef', 'gourmet'],
      'gourmet kitchen': ['gourmet kitchen', 'kitchen', 'chef'],
      'living + dining': ['living', 'dining', 'lounge', 'hall'],
      'grand living': ['living', 'lounge', 'hall', 'grand living'],
      'double height living': ['living', 'double height', 'lounge', 'hall'],
      'wardrobes': ['wardrobe', 'closet', 'dressing'],
      'walk in wardrobes': ['walk in', 'wardrobe', 'closet', 'dressing'],
      'family bedrooms': ['bedroom', 'suite', 'guest room', 'family bedroom'],
      'master suites': ['master suite', 'suite', 'bedroom'],
      'suite bedrooms': ['suite', 'bedroom', 'master'],
      'spa bathroom': ['spa bathroom', 'bathroom', 'bath', 'vanity', 'washroom'],
      'luxury bathrooms': ['bathroom', 'bath', 'vanity', 'washroom'],
      'bathroom vanity': ['bathroom', 'vanity', 'washroom', 'bath'],
      'home theater': ['theater', 'theatre', 'cinema', 'media room'],
      'cinema theater': ['theater', 'theatre', 'cinema', 'media room'],
      'private theater': ['theater', 'theatre', 'cinema', 'media room'],
      'home gym': ['gym', 'fitness', 'workout', 'wellness'],
      'fitness studio': ['gym', 'fitness', 'workout', 'studio'],
      'wellness gym': ['gym', 'fitness', 'workout', 'wellness'],
      'pooja room': ['pooja', 'prayer', 'mandir'],
      'kids room': ['kids', 'child', 'children', 'playroom'],
      'terrace': ['terrace', 'deck', 'rooftop'],
      'home office': ['office', 'study', 'work', 'desk'],
      'meeting room': ['meeting', 'conference', 'boardroom', 'office', 'workspace'],
      'classroom': ['class', 'school', 'education', 'training', 'learning'],
      'epoxy floor': ['epoxy', 'floor', 'industrial', 'garage', 'paving'],
      'guest room': ['guest', 'bedroom', 'extra room', 'visitor'],
      'spa': ['spa', 'massage', 'wellness', 'relaxation', 'sauna']
    },
    villaConceptsByQuality: {
      economy: [
        { title: 'Smart Family Living Villa', category: 'Living Room' },
        { title: 'Efficient Modular Villa Kitchen', category: 'Kitchen' },
        { title: 'Comfort Master Suite', category: 'Master Bedroom' },
        { title: 'Practical Bathroom Vanity', category: 'Bathroom' },
        { title: 'Compact Terrace Lounge', category: 'Terrace' }
      ],
      premium: [
        { title: 'Designer Double-Height Living', category: 'Living Room' },
        { title: 'Chef-Ready Gourmet Kitchen', category: 'Kitchen' },
        { title: 'Premium Master Suite', category: 'Master Bedroom' },
        { title: 'Entertainment Home Theatre', category: 'Home Theatre' },
        { title: 'Landscape Terrace Deck', category: 'Terrace' }
      ],
      luxury: [
        { title: 'Palatial Villa Living Pavilion', category: 'Living Room' },
        { title: 'Grand Gourmet Kitchen Gallery', category: 'Kitchen' },
        { title: 'Royal Master Suite Retreat', category: 'Master Bedroom' },
        { title: 'Infinity Pool Villa Deck', category: 'Swimming Pool' },
        { title: 'Private Wellness Spa & Gym', category: 'Spa' }
      ]
    }
  };
};
