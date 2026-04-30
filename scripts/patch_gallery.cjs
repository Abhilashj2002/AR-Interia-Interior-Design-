// Gallery Category Matching Patch
// Run this in browser console to fix gallery category matching

(function() {
  console.log('🔧 Applying gallery category patch...');
  
  // Wait for app to load
  setTimeout(function() {
    // Check if designMatchesCategory exists
    if (typeof window.designMatchesCategory === 'function') {
      console.log('✅ Found designMatchesCategory function, patching...');
      
      // Override with improved matching
      window.designMatchesCategory = function(design, categoryKeys) {
        if (!categoryKeys) return true;
        
        var cid = (design.categoryId || '').toLowerCase();
        var cat = (design.category || '').toLowerCase();
        var keys = {};
        
        if (cid) {
          keys[cid] = true;
          keys[cid.replace(/[^a-z0-9]+/g, '')] = true;
          if (cid.indexOf('cat-') === 0) keys[cid.substring(4)] = true;
        }
        if (cat) {
          keys[cat] = true;
          keys[cat.replace(/[^a-z0-9]+/g, '')] = true;
        }
        
        for (var k in keys) {
          if (categoryKeys.has(k)) return true;
          for (var i = 0; i < categoryKeys.size; i++) {
            var arr = Array.from(categoryKeys);
            if (k.indexOf(arr[i]) !== -1 || arr[i].indexOf(k) !== -1) return true;
          }
        }
        return false;
      };
      
      console.log('✅ Gallery category patch applied!');
    } else {
      console.log('⚠️ designMatchesCategory not found, will retry...');
      setTimeout(arguments.callee, 2000);
    }
  }, 1000);
})();
