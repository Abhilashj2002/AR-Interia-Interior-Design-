/**
 * Script to fix category-design matching permanently
 * Run this in browser console on your app to fix the issue
 */

(function fixCategoryMatching() {
  console.log('🔧 Starting category matching fix...');
  
  // Clear the existing localStorage data for categories and designs
  const keysToRemove = [
    'ar_interia_categories_v2',
    'ar_interia_designs_v5'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  });
  
  // Dispatch event to trigger reseed
  window.dispatchEvent(new CustomEvent('reseed-data'));
  
  console.log('🎉 Category matching fix complete!');
  console.log('   Please refresh the page to see correct designs for each category.');
})();
