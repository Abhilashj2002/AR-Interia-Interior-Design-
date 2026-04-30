import { AIRecommendation, DesignModel, StyleType } from "../types.ts";

export async function getSmartDesignSuggestions(prompt: string, contextModel?: DesignModel): Promise<AIRecommendation> {
  const lowerPrompt = prompt.toLowerCase();

  if (contextModel) {
    if (contextModel.style === StyleType.MODERN || lowerPrompt.includes('modern')) {

      return {
        suggestion: "To enhance your selected piece, we suggest integrating sleek metallic finishes and modern geometric patterns. This brings a subtle contemporary edge to the traditional aesthetics.",
        recommendedItems: ["Geometric Brass Mirrors", "Minimalist Teak Coffee Table", "Sleek Planters"],
        vibe: "Modern Heritage"
      };
    } else {
      return {
        suggestion: "We recommend focusing on warm wood tones and rich textiles. Adding intricate Indian craftsmanship around your chosen design will create a beautifully authentic ambiance.",
        recommendedItems: ["Carved Teak Console", "Traditional Brass Lamps", "Zari Handwoven Cushions"],
        vibe: "Warm Classic"
      };
    }
  }

  if (lowerPrompt.includes('royal') || lowerPrompt.includes('palace')) {
    return {
      suggestion: "For a majestic luxury feel, we propose incorporating deep jewel tones, plush velvet upholstery, and elaborate brass detailing inspired by Rajasthani palaces.",
      recommendedItems: ["Intricate Jharokha Accents", "Velvet Diwan", "Antique Brass Chandelier"],
      vibe: "Royal Grandeur"
    };
  }

  // Default response
  return {
    suggestion: "A balanced approach works best here. We suggest pairing authentic Indian textures like Kalamkari or Ikat with clean, structured wooden furniture to keep the space grounded and inviting.",
    recommendedItems: ["Ikat Patterned Rug", "Solid Wood Bookshelf", "Terracotta Vases"],
    vibe: "Balanced Transitional"
  };
}
