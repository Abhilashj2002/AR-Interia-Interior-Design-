export const generateDesignVariants = async ({ imageBase64, mimeType, prompt, count }) => {
  const size = Math.max(6, Math.min(8, Number(count) || 6));

  // Simulating a more realistic "analysis" delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const safePrompt = prompt && String(prompt).trim()
    ? String(prompt).trim().toLowerCase()
    : '';

  // Generate a simple base64-encoded placeholder image with style-specific colors
  const generateBase64Placeholder = (styleTag) => {
    const colors = {
      'Modern': '#2d3748',
      'Rustic': '#744210',
      'Coastal': '#4299e1',
      'Luxury': '#4a5568',
      'Industrial': '#2d3748',
      'Bohemian': '#c53030',
      'Traditional': '#2b6cb0',
      'Japandi': '#a0aec0'
    };
    const bgColor = colors[styleTag] || '#2d3748';
    // SVG image as base64 string (without data URL prefix)
    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1024\" height=\"768\"><rect width=\"1024\" height=\"768\" fill=\"${bgColor}\"/><text x=\"512\" y=\"384\" font-family=\"Arial\" font-size=\"48\" fill=\"#ffffff\" text-anchor=\"middle\" dominant-baseline=\"middle\">${styleTag} Style</text></svg>`;
    return Buffer.from(svg).toString('base64');
  };

  // Realistic design templates with style-specific metadata

  const baseVariants = [
    { title: 'Modern Oasis', styleTag: 'Modern', description: 'A clean, minimalist space with sleek lines and a neutral palette.' },
    { title: 'Rustic Retreat', styleTag: 'Rustic', description: 'Warm and inviting room featuring exposed wood and comfortable textures.' },
    { title: 'Coastal Serenity', styleTag: 'Coastal', description: 'Light and airy design inspired by the ocean with soft blues and sandy tones.' },
    { title: 'Luxury Elevation', styleTag: 'Luxury', description: 'Sophisticated and elegant space with premium materials and rich accents.' },
    { title: 'Industrial Edge', styleTag: 'Industrial', description: 'Urban inspired space with raw materials like brick, metal, and concrete.' },
    { title: 'Boho Chic', styleTag: 'Bohemian', description: 'Eclectic and relaxed environment with layered patterns and plants.' },
    { title: 'Traditional Elegance', styleTag: 'Traditional', description: 'Classic and timeless design featuring symmetrical layouts and antique accents.' },
    { title: 'Japandi Harmony', styleTag: 'Japandi', description: 'A blend of Japanese minimalism and Scandinavian functionality.' }
  ];

  const variants = baseVariants.map((v, i) => ({
    id: `variant-${Date.now()}-${i}`,
    ...v,
    imageBase64: generateBase64Placeholder(v.styleTag),
    price: 150000 + (Math.floor(Math.random() * 20) * 10000)
  }));

  return variants.slice(0, size);
};
