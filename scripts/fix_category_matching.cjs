/**
 * Script to fix category matching for designs
 * This ensures category IDs in designs match the normalized category IDs
 */

// Normalize category key (same as in main.ts)
const normalizeCategoryKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

// Map of old category IDs to normalized keys
const categoryIdMapping = {
  'cat-bathroom': 'bathroom',
  'cat-living': 'livingroom',
  'cat-bedroom': 'kidsbedroom',
  'cat-masterbedroom': 'masterbedroom',
  'cat-kitchen': 'kitchen',
  'cat-dining': 'diningroom',
  'cat-pooja': 'poojaroom',
  'cat-gym': 'gym',
  'cat-spa': 'spa',
  'cat-classroom': 'classroom',
  'cat-pool': 'swimmingpool',
  'cat-terrace': 'terrace',
  'cat-balcony': 'balcony',
  'cat-garden': 'garden',
  'cat-meeting': 'meetingroom',
  'cat-theatre': 'hometheatre',
  'cat-office': 'officeinterior',
  'cat-wardrobe': 'wardrobe',
  'cat-guestroom': 'guestroom'
};

// Run the fix
const fixCategoryMatching = () => {
  console.log('🔧 Fixing category matching...\n');
  
  // Fix categories
  const categoriesKey = 'ar_interia_categories_v2';
  const categoriesRaw = localStorage.getItem(categoriesKey);
  if (categoriesRaw) {
    const categories = JSON.parse(categoriesRaw);
    let updated = false;
    
    const fixedCategories = categories.map(cat => {
      const normalizedTitle = normalizeCategoryKey(cat.title || cat.name || '');
      if (cat.id !== normalizedTitle) {
        console.log(`  📁 Category: "${cat.title || cat.name}"`);
        console.log(`     Old ID: ${cat.id}`);
        console.log(`     New ID: ${normalizedTitle}`);
        updated = true;
        return { ...cat, id: normalizedTitle };
      }
      return cat;
    });
    
    if (updated) {
      localStorage.setItem(categoriesKey, JSON.stringify(fixedCategories));
      console.log('✅ Categories updated\n');
    } else {
      console.log('✅ Categories already correct\n');
    }
  }
  
  // Fix designs
  const designsKey = 'ar_interia_designs_v5';
  const designsRaw = localStorage.getItem(designsKey);
  if (designsRaw) {
    const designs = JSON.parse(designsRaw);
    let updated = false;
    
    const fixedDesigns = designs.map(design => {
      const oldCategoryId = design.categoryId;
      const newCategoryId = categoryIdMapping[oldCategoryId] || 
        normalizeCategoryKey(design.category || '') ||
        oldCategoryId;
      
      if (oldCategoryId && oldCategoryId !== newCategoryId) {
        console.log(`  🎨 Design: "${design.title}"`);
        console.log(`     Old categoryId: ${oldCategoryId}`);
        console.log(`     New categoryId: ${newCategoryId}`);
        updated = true;
        return { ...design, categoryId: newCategoryId };
      }
      return design;
    });
    
    if (updated) {
      localStorage.setItem(designsKey, JSON.stringify(fixedDesigns));
      console.log('✅ Designs updated\n');
    } else {
      console.log('✅ Designs already correct\n');
    }
  }
  
  console.log('🎉 Category matching fix complete!');
  console.log('   Please refresh the page to see the changes.');
};

// Execute
fixCategoryMatching();
