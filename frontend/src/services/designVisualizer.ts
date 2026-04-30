// Advanced design visualization with actual design elements
export interface DesignElement {
  type: 'cabinet' | 'countertop' | 'backsplash' | 'appliance' | 'layout' | 'material';
  color: string;
  texture?: string;
  style: string;
}

export const designElements = {
  modern: {
    cabinets: { color: '#ffffff', style: 'sleek', material: 'glossy white lacquer', texture: 'smooth', pattern: 'grid' },
    countertop: { color: '#333333', style: 'quartz', material: 'engineered stone', texture: 'smooth' },
    backsplash: { color: '#f5f5f5', style: 'subway tiles', material: 'ceramic', pattern: 'linear' },
    layout: 'minimalist modular with island'
  },
  rustic: {
    cabinets: { color: '#8b6f47', style: 'wooden frames', material: 'solid oak', texture: 'wood grain' },
    countertop: { color: '#a0826d', style: 'butcher block', material: 'natural wood', texture: 'wood' },
    backsplash: { color: '#d4a574', style: 'stone tiles', material: 'natural stone', pattern: 'random' },
    layout: 'traditional with open shelves'
  },
  luxury: {
    cabinets: { color: '#1a1a1a', style: 'handleless lacquer', material: 'premium lacquer', texture: 'matte', pattern: 'seamless' },
    countertop: { color: '#ffffff', style: 'marble', material: 'carrara marble', texture: 'veined' },
    backsplash: { color: '#f5f5f5', style: 'marble slab', material: 'premium stone', pattern: 'solid' },
    layout: 'open kitchen with waterfall island'
  },
  coastal: {
    cabinets: { color: '#fafafa', style: 'painted wood', material: 'solid wood painted', texture: 'light wood' },
    countertop: { color: '#d2b48c', style: 'butcher block', material: 'light hardwood', texture: 'natural' },
    backsplash: { color: '#e8f4f8', style: 'subway tiles', material: 'glazed ceramic', pattern: 'linear' },
    layout: 'open airy with bar seating'
  },
  industrial: {
    cabinets: { color: '#505050', style: 'metal frame wood', material: 'steel and reclaimed wood', texture: 'raw' },
    countertop: { color: '#666666', style: 'concrete', material: 'polished concrete', texture: 'concrete' },
    backsplash: { color: '#4a4a4a', style: 'brick exposed', material: 'exposed brick/metal', pattern: 'geometric' },
    layout: 'open with steel frame shelving'
  },
  tropical: {
    cabinets: { color: '#b8860b', style: 'tropical hardwood', material: 'bamboo/teakwood', texture: 'wood grain' },
    countertop: { color: '#d4a574', style: 'bamboo or stone', material: 'sustainable material', texture: 'natural' },
    backsplash: { color: '#90ee90', style: 'natural stone', material: 'slate with plants', pattern: 'organic' },
    layout: 'open with green elements'
  },
  contemporary: {
    cabinets: { color: '#707070', style: 'matte lacquer', material: 'gray lacquer', texture: 'matte', pattern: 'seamless' },
    countertop: { color: '#e6e6e6', style: 'quartz', material: 'engineered quartz', texture: 'smooth' },
    backsplash: { color: '#b0b0b0', style: 'geometric tiles', material: 'porcelain', pattern: 'geometric' },
    layout: 'waterfall island with bar seating'
  },
  mediterranean: {
    cabinets: { color: '#c87137', style: 'painted wood', material: 'warm terracotta', texture: 'natural wood' },
    countertop: { color: '#8b6f47', style: 'granite', material: 'natural granite', texture: 'speckled' },
    backsplash: { color: '#d4a574', style: 'ceramic tiles', material: 'hand-painted tiles', pattern: 'random' },
    layout: 'traditional with warm accents'
  }
};

export const applyDesignVisualization = (
  ctx: CanvasRenderingContext2D,
  designStyle: keyof typeof designElements,
  width: number,
  height: number
) => {
  const design = designElements[designStyle];
  const w = width;
  const h = height;
  
  // Add semi-transparent design overlay based on style
  ctx.globalAlpha = 0.25;
  
  // Cabinet overlay (left third)
  ctx.fillStyle = design.cabinets.color;
  ctx.fillRect(0, h * 0.3, w * 0.4, h * 0.6);
  
  // Add cabinet texture pattern
  if (design.cabinets.texture === 'wood grain' || design.cabinets.texture === 'light wood' || design.cabinets.texture === 'natural wood') {
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + i * 0.02})`;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.3 + i * 80);
      ctx.lineTo(w * 0.4, h * 0.3 + i * 80);
      ctx.stroke();
    }
  }
  
  // Countertop overlay (bottom)
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = design.countertop.color;
  ctx.fillRect(0, h * 0.65, w, h * 0.35);
  
  // Add marble veining for luxury
  if (design.countertop.texture === 'veined') {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, h * 0.65);
      ctx.quadraticCurveTo(Math.random() * w, h * 0.8, Math.random() * w, h);
      ctx.stroke();
    }
  }
  
  // Add wood texture for wooden countertops
  if (design.countertop.texture === 'wood' || design.countertop.texture === 'natural') {
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.08 + i * 0.015})`;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7 + i * 60);
      ctx.lineTo(w, h * 0.7 + i * 60);
      ctx.stroke();
    }
  }
  
  // Backsplash overlay (top)
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = design.backsplash.color;
  ctx.fillRect(0, h * 0.15, w, h * 0.15);
  
  // Add backsplash pattern (tiles/subway)
  if (design.backsplash.pattern === 'linear') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    const tileSize = 60;
    for (let x = 0; x < w; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.15);
      ctx.lineTo(x, h * 0.3);
      ctx.stroke();
    }
  }
  
  // Add random/geometric pattern for other backsplash styles
  if (design.backsplash.pattern === 'random' || design.backsplash.pattern === 'geometric' || design.backsplash.pattern === 'organic') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    const step = 50;
    for (let x = 0; x < w; x += step) {
      for (let y = h * 0.15; y < h * 0.3; y += step) {
        ctx.strokeRect(x, y, step, step);
      }
    }
  }
  
  ctx.globalAlpha = 1;
};

export const drawDesignElements = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  designStyle: string
) => {
  const style = designElements[designStyle as keyof typeof designElements] || designElements.modern;
  
  // Draw simple design guideline rectangles
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
  ctx.lineWidth = 2;
  
  // Cabinet area
  ctx.strokeRect(0, height * 0.25, width * 0.35, height * 0.65);
  
  // Countertop area
  ctx.strokeRect(0, height * 0.6, width, height * 0.4);
  
  // Backsplash area
  ctx.strokeRect(0, height * 0.1, width, height * 0.2);
};
