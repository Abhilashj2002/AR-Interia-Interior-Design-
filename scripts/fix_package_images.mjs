import fs from 'fs';
import path from 'path';

const CONSTANTS_PATH = path.resolve('./constants.ts');

const pool1 = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800"
];

const pool2 = [
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&q=80&w=800"
];

const pool3 = [
  "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1618219944342-824e40a13285?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=800"
];

const pool4 = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800"
];

const poolV = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1615876234839-c2a1fdf88106?auto=format&fit=crop&q=80&w=800"
];

async function fixPackages() {
  let content = fs.readFileSync(CONSTANTS_PATH, 'utf8');
  
  // We'll replace the image URLs directly using Regex since JSON parsing failed
  // due to the file being a TS module with comments and potential trailing commas.
  
  // 1. We replace the main image for packages
  content = content.replace(/"id":\s*"apartment-2bhk.([^"]*)",[\s\S]*?"image":\s*"([^"]*)",/g, (match, suffix, oldImg) => {
      // It's a 2BHK package
      return match.replace(oldImg, pool2[0]);
  });
  
  content = content.replace(/"id":\s*"apartment-3bhk.([^"]*)",[\s\S]*?"image":\s*"([^"]*)",/g, (match, suffix, oldImg) => {
      return match.replace(oldImg, pool3[0]);
  });

  content = content.replace(/"id":\s*"apartment-4bhk.([^"]*)",[\s\S]*?"image":\s*"([^"]*)",/g, (match, suffix, oldImg) => {
      return match.replace(oldImg, pool4[0]);
  });
  
  content = content.replace(/"id":\s*"villa-[^"]*",[\s\S]*?"image":\s*"([^"]*)",/g, (match, oldImg) => {
      return match.replace(oldImg, poolV[0]);
  });
  
  // 2. We also need to fix the duplicate room design images. They all say 'apartment-1bhk-essential-design-X' or similar
  // Let's replace the room images based on the ID prefix.
  const regex = /"id":\s*"([^"]+)-design-\d+",\s*"title":\s*"[^"]*",\s*"image":\s*"([^"]*)"/g;
  
  content = content.replace(regex, (match, pkgPrefix, oldImg) => {
      let pool = pool1; // fallback
      if (pkgPrefix.includes('2bhk')) pool = pool2;
      else if (pkgPrefix.includes('3bhk')) pool = pool3;
      else if (pkgPrefix.includes('4bhk')) pool = pool4;
      else if (pkgPrefix.includes('villa')) pool = poolV;
      
      // We pick a random one from the pool or based on some hash
      const pIndex = Math.abs(pkgPrefix.length) % pool.length;
      return match.replace(oldImg, pool[pIndex]);
  });
  
  // 3. Fix the identical configuration descriptions
  content = content.replace(/"description":\s*"A essential ([^"]+) Apartment design solution with specialized modular planning for a premium lifestyle."/g, '"description": "A tailored $1 solution designed for maximum comfort and style."');
  content = content.replace(/"description":\s*"A luxury ([^"]+) Apartment design solution with specialized modular planning for a premium lifestyle."/g, '"description": "An exquisite $1 design featuring premium materials and bespoke layouts."');
  content = content.replace(/"description":\s*"A ultimate ([^"]+) Apartment design solution with specialized automation and stone finishes for a premium lifestyle."/g, '"description": "The peak of luxury living in a $1 configuration, equipped with advanced automation."');
  content = content.replace(/"description":\s*"A essential ([^"]+) Villa design solution with specialized modular planning for a premium lifestyle."/g, '"description": "A sprawling $1 estate plan blending elegance with everyday functionality."');

  fs.writeFileSync(CONSTANTS_PATH, content);
  console.log('✅ Successfully applied regex updates to PACKAGES in constants.ts!');
}

fixPackages();
