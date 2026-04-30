/**
 * Quick fix for bathroom category ID
 * Run this in browser console to patch the issue
 */

// Find and update the bathroom category
const categories = JSON.parse(localStorage.getItem('ar_interia_categories_v2') || '[]');
const bathroomIndex = categories.findIndex(c => c.id === 'bathroom');

if (bathroomIndex !== -1) {
  console.log('Found bathroom category, updating ID...');
  categories[bathroomIndex].id = 'cat-bathroom';
  localStorage.setItem('ar_interia_categories_v2', JSON.stringify(categories));
  console.log('✅ Updated bathroom category ID to cat-bathroom');
} else {
  console.log('Category not found or already fixed');
}

// Also fix designs if needed
const designs = JSON.parse(localStorage.getItem('ar_interia_designs_v5') || '[]');
let designCount = 0;
designs.forEach(design => {
  if (design.categoryId === 'bathroom') {
    design.categoryId = 'cat-bathroom';
    designCount++;
  }
});

if (designCount > 0) {
  localStorage.setItem('ar_interia_designs_v5', JSON.stringify(designs));
  console.log(`✅ Updated ${designCount} designs with correct category ID`);
}

console.log('🎉 Please refresh the page to see the changes');
