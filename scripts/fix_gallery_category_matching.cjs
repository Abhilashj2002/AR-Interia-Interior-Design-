 /**
 * Script to fix gallery category matching in the browser
 * This patches the designMatchesCategory function to properly match categories
 * 
 * Run in browser console on your app's page
 */

(function patchGalleryCategoryMatching() {
  console.log('🔧 Patching gallery category matching...');
  
  // Check if the function exists and needs patching
  if (typeof designMatchesCategory === 'function') {
    // Store original function reference
    const originalFunction = designMatchesCategory;
    
    // Override with improved matching logic
    window.designMatchesCategory = function(design, categoryKeys) {
      if (!categoryKeys) return true;
      
      const cid = (design.categoryId || '').toLowerCase();
      const cat = (design.category || '').toLowerCase();
      const keys = new Set();
      
      if (cid) {
        keys.add(cid);
        keys.add(cid.replace(/[^a-z0-9]+/g, ''));
        if (cid.startsWith('cat-')) keys.add(cid.substring(4));
      }
      if (cat) {
        keys.add(cat);
        keys.add(cat.replace(/[^a-z0-9]+/g, ''));
      }
      
      for (const k of keys) {
        if (categoryKeys.has(k)) return true;
        for (const ck of categoryKeys) {
          if (k.includes(ck) || ck.includes(k)) return true;
        }
      }
      return false;
    };
    
    console.log('✅ designMatchesCategory function patched successfully!');
  } else {
    console.log('⚠️ designMatchesCategory not found - waiting for app to load...');
    
    // Try again after a delay
    setTimeout(() => {
      if (typeof designMatchesCategory === 'function') {
        window.designMatchesCategory = function(design, categoryKeys) {
          if (!categoryKeys) return true;
          
          const cid = (design.categoryId || '').toLowerCase();
          const cat = (design.category || '').toLowerCase();
          const keys = new Set();
          
          if (cid) {
            keys.add(cid);
            keys.add(cid.replace(/[^a-z0-9]+/g, ''));
            if (cid.startsWith('cat-')) keys.add(cid.substring(4));
          }
          if (cat) {
            keys.add(cat);
            keys.add(cat.replace(/[^a-z0-9]+/g, ''));
          }
          
          for (const k of keys) {
            if (categoryKeys.has(k)) return true;
            for (const ck of categoryKeys) {
              if (k.includes(ck) || ck.includes(k)) return true;
            }
          }
          return false;
        };
        console.log('✅ designMatchesCategory function patched after delay!');
      } else {
        console.error('❌ Could not find designMatchesCategory function');
      }
    }, 2000);
  }
  
  console.log('🎉 Gallery category matching patch complete!');
})();
