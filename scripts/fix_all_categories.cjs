/**
 * Comprehensive fix for all category-design matching issues
 * Run this in browser console to permanently fix the gallery
 */

// Category mapping - maps old IDs to new IDs (with cat- prefix)
const categoryIdMap = {
  'bathroom': 'cat-bathroom',
  'livingroom': 'cat-living',
  'kidsbedroom': 'cat-bedroom',
  'masterbedroom': 'cat-masterbedroom',
  'kitchen': 'cat-kitchen',
  'diningroom': 'cat-dining',
  'poojaroom': 'cat-pooja',
  'gym': 'cat-gym',
  'spa': 'cat-spa',
  'classroom': 'cat-classroom',
  'swimmingpool': 'cat-pool',
  'terrace': 'cat-terrace',
  'balcony': 'cat-balcony',
  'garden': 'cat-garden',
  'meetingroom': 'cat-meeting',
  'hometheatre': 'cat-theatre',
  'officeinterior': 'cat-office',
  'wardrobe': 'cat-wardrobe',
  'guestroom': 'cat-guestroom'
};

// Fix categories
const categories = JSON.parse(localStorage.getItem('ar_interia_categories_v2') || '[]');
let categoriesUpdated = 0;

categories.forEach(cat => {
  if (categoryIdMap[cat.id]) {
    console.log(`Updating category: ${cat.id} -> ${categoryIdMap[cat.id]}`);
    cat.id = categoryIdMap[cat.id];
    categoriesUpdated++;
  }
});

if (categoriesUpdated > 0) {
  localStorage.setItem('ar_interia_categories_v2', JSON.stringify(categories));
  console.log(`✅ Fixed ${categoriesUpdated} categories`);
} else {
  console.log('ℹ️ Categories already use correct IDs (cat- prefix)');
}

// Fix designs - update categoryId to match new format
const designs = JSON.parse(localStorage.getItem('ar_interia_designs_v5') || '[]');
let designsUpdated = 0;

designs.forEach(design => {
  if (design.categoryId && categoryIdMap[design.categoryId]) {
    console.log(`Updating design "${design.name}" category: ${design.categoryId} -> ${categoryIdMap[design.categoryId]}`);
    design.categoryId = categoryIdMap[design.categoryId];
    designsUpdated++;
  }
});

if (designsUpdated > 0) {
  localStorage.setItem('ar_interia_designs_v5', JSON.stringify(designs));
  console.log(`✅ Fixed ${designsUpdated} designs`);
} else {
  console.log('ℹ️ Designs already use correct category IDs');
}

// Clear any cached data to force reload
localStorage.removeItem('ar_interia_portfolio_v1');
localStorage.removeItem('ar_interia_ai_designs_v1');

console.log('🎉 All category fixes applied!');
console.log('📝 Please refresh the page to see correct gallery filtering');
