const renderPriceCalculatorModal = () => {
  if (!state.calculator.isOpen) return '';
  const s = state.calculator;
  const settings = s.settings;
  const selectedCategoryKey = String(s.category || '').trim();
  const normalizedDisplayCategory = String(selectedCategoryKey || '').toLowerCase().trim();
  const displayConfigType = (normalizedDisplayCategory === 'villa' || Number(s.bhk) >= 4 || String(s.shape || '').toLowerCase() === 'custom') ? 'villa' : 'apartment';
  // Always use the actual selected category for all calculations and related designs
  const effectiveDisplayCategory = settings.categoryMultipliers[selectedCategoryKey]
    ? selectedCategoryKey
    : (displayConfigType === 'villa' ? 'Villa' : 'Apartment');

  const CATEGORY_IMAGES: Record<string, string> = {
    'Apartment': '/category/Apartment/apartment11.jpg',
    'Villa': '/category/Terrace/terrace (6).jpg',
    'Bathroom': '/category/Bathroom/bathroom5.jpg',
    'Living Room': '/category/Living room/living6.jpg',
    'Kids Bedroom': '/category/Kids-bedroom/kids-bedroom5.jpg',
    'Master Bedroom': '/category/Master Bedroom/master-bedroom5.jpg',
    'Kitchen': '/category/Kitchen/kitchen5.jpg',
    'Dining Area': '/category/Diningroom/dining-room4.jpg',
    'Pooja Room': '/category/Pooja room/pooja-room5.jpg',
    'Gym': '/category/Gym/gym (5).jpg',
    'Spa': '/category/Spa/spa room (4).jpg',
    'Classroom': '/category/Classroom/classroom4.jpg',
    'Swimming Pool': '/category/Swimming pool/swimmingpool5 - Copy.jpg',
    'Terrace': '/category/Terrace/terrace (6).jpg',
    'Balcony': '/category/Balcony/balcony (4).jpg',
    'Garden': '/category/Garden/garden (5).jpg',
    'Meeting Room': '/category/Meeting room/meeting room (5).jpg',
    'Home Theatre': '/category/Home theatre/home theatre (5).jpg',
    'Office Interior': '/category/Office interior/office interior (5).jpg',
    'Wardrobe': '/category/wardrobe/wardrobe4.jpg',
    'Guest Room': '/category/Guest room/guest room (4).jpg'
  };

  const normalizeCategoryKey = (value: string) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const categoryFeatureMap: Record<string, string> = {
    'apartment': 'Living + Dining',
    'villa': 'Swimming Pool',
    'bathroom': 'Bathroom Vanity',
    'living room': 'Grand Living',
    'kids bedroom': 'Kids Room',
    'master bedroom': 'Master Suites',
    'kitchen': 'Modular Kitchen',
    'dining area': 'Living + Dining',
    'pooja room': 'Pooja Room',
    'gym': 'Home Gym',
    'spa': 'Spa Bathroom',
    'swimming pool': 'Swimming Pool',
    'terrace': 'Terrace',
    'balcony': 'Balcony Design',
    'garden': 'Terrace',
    'home theatre': 'Home Theater',
    'office interior': 'Home Office',
    'wardrobe': 'Walk-in Wardrobes',
    'guest room': 'Family Bedrooms',
    'epoxy floor': 'Epoxy Flooring'
  };

  const getCategoryDisplayImage = (cat: string) => {
    const catKey = normalizeCalcCategoryKey(cat);
    const lib = getAdminImageLibrary()
      .filter((item: any) => item && item.active !== false);

    // BHK specific overrides for Apartment/Villa based on current calculator state
    if (catKey === 'apartment') {
      if (s.bhk === 1) return '/category/Master Bedroom/master-bedroom1.jpg';
      if (s.bhk === 2) return '/category/Diningroom/dining-room1.jpg';
      if (s.bhk === 3) return '/category/Kitchen/kitchen1.jpg';
    }
    if (catKey === 'villa') {
      if (s.bhk === 3) return '/category/Master Bedroom/master-bedroom1.jpg';
      if (s.bhk === 4) return '/category/Diningroom/dining-room1.jpg';
      if (s.bhk >= 5) return '/category/Kitchen/kitchen1.jpg';
    }

    const qualityMatch = lib.find((item: any) => {
      const itemKey = normalizeCalcCategoryKey(String(item?.category || ''));
      const qualityKey = String(item?.quality || '').toLowerCase();
      return qualityKey === String(s.quality || '').toLowerCase() && (itemKey === catKey || itemKey.includes(catKey) || catKey.includes(itemKey));
    });
    if (qualityMatch?.image) return normalizeAssetUrl(String(qualityMatch.image));

    const canonical = getCanonicalCategoryImages(cat);
    if (canonical.length > 0) return normalizeAssetUrl(canonical[0]);

    const categoriesFromStore = getCategories();
    const exactCategory = categoriesFromStore.find((c: any) => normalizeCalcCategoryKey(String(c?.title || c?.name || '')) === catKey);
    const exactCategoryImage = normalizeAssetUrl(String(
      exactCategory?.background
      || exactCategory?.image
      || exactCategory?.thumbnail
      || (Array.isArray(exactCategory?.images) ? exactCategory.images[0]?.url : '')
      || ''
    ));
    if (exactCategoryImage) return exactCategoryImage;

    const preferredFeature = categoryFeatureMap[catKey];
    if (preferredFeature) {
      const featureImage = normalizeAssetUrl(String(featureImageMap[preferredFeature] || ''));
      if (featureImage) return featureImage;
    }

    const categoryTokens = catKey.split(' ').filter(Boolean);
    const packageRoomImage = getPackagesSync()
      .flatMap((pkg: any) => (Array.isArray(pkg?.rooms) ? pkg.rooms : []))
      .find((room: any) => {
        const searchable = normalizeCalcCategoryKey(`${String(room?.title || '')} ${String(room?.description || '')}`);
        return categoryTokens.length > 0 && categoryTokens.every((token) => searchable.includes(token));
      })?.image;
    const roomImage = normalizeAssetUrl(String(packageRoomImage || ''));
    if (roomImage) return roomImage;

    const mapped = normalizeAssetUrl(String(CATEGORY_IMAGES[cat] || ''));
    if (mapped) return mapped;
    return '/category/Living room/living1.jpg';
  };

  const categories = Object.keys(settings.categoryMultipliers).sort();
  const shapes = ['Rectangle', 'L-Shape', 'T-Shape', 'Custom'];

  return `
    <div class="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" data-action="close-calculator">
      <div class="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]" data-action="ignore">
        <button data-action="close-calculator" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition z-10">âœ•</button>
        
        <div class="p-8 border-b border-slate-100/50">
          <div class="text-center">
            <h2 class="text-3xl font-display font-bold text-slate-900 mb-1">Advanced Price Calculator</h2>
            <p class="text-slate-500">Instant design investment estimate for any space</p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 pt-6 space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-8">
              <div>
                <label class="block text-xs uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                  <i class="ri-home-4-line text-lg"></i>
                  <span>1. Select Category</span>
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" data-calculator-category>
                  ${categories.map(cat => `
                    <button data-action="calc-set-category" data-value="${cat}" class="group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${s.category === cat ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-slate-100 hover:border-slate-300'}" data-calculator-category-option="${cat}">
                      <img src="${getCategoryDisplayImage(cat)}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.onerror=null;this.src='/category/Living room/living1.jpg'" />
                      <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                      <div class="absolute inset-0 p-2 flex flex-col justify-end">
                        <div class="text-[10px] font-black text-white uppercase leading-tight text-center drop-shadow-md">${cat}</div>
                      </div>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                    <i class="ri-shape-line text-lg"></i>
                    <span>2. Layout Shape</span>
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    ${shapes.map(sh => `
                      <button data-action="calc-set-shape" data-value="${sh}" class="p-2.5 rounded-xl border-2 text-[10px] font-bold transition flex flex-col items-center gap-1 ${s.shape === sh ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-50 text-slate-400 hover:border-slate-200'}">
                        <span>${sh}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
                <div>
                  <label class="block text-xs uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                    <i class="ri-layout-grid-line text-lg"></i>
                    <span>3. Configuration</span>
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    ${(s.category.toLowerCase() === 'villa' ? [3, 4, 5] : [1, 2, 3, 4, 5]).map(n => {
                      const isVilla = s.category.toLowerCase() === 'villa';
                      const isLast = n === 5;
                      const colSpan = isLast ? 'col-span-2' : '';
                      const label = isLast ? (isVilla ? '5+ BHK Villa' : '5+ BHK / Commercial') : `${n} BHK`;
                      return `
                        <button data-action="calc-set-bhk" data-value="${n}" class="py-2.5 rounded-xl border-2 text-xs font-bold transition ${colSpan} ${s.bhk === n ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-50 text-slate-400 hover:border-slate-200'}">
                          ${label}
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-8">
              <div>
                <label class="block text-xs uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                  <i class="ri-ruler-2-line text-lg"></i>
                  <span>4. Area Coverage</span>
                </label>
                <div class="relative bg-slate-50 rounded-2xl p-6 border border-slate-100/50">
                  <div class="flex items-end gap-4 mb-4">
                    <div class="flex-1">
                      <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Square Feet</div>
                      <input type="number" data-action="calc-set-area" value="${s.area}" class="w-full bg-transparent border-b-2 border-slate-200 focus:border-amber-400 outline-none font-black text-3xl pb-2 transition" step="50" />
                    </div>
                    <div class="text-slate-400 font-black text-xl mb-2">SQ.FT.</div>
                  </div>
                  <input type="range" min="100" max="10000" step="50" value="${s.area}" data-action="calc-set-area" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                  <div class="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
                    <span>100 SQFT</span>
                    <span>10,000 SQFT</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                  <i class="ri-shield-star-line text-lg"></i>
                  <span>5. Finish Quality</span>
                </label>
                <div class="space-y-3">
                  ${( ['economy', 'premium', 'luxury'] as const).map(q => {
                    const isSelected = s.quality === q;
                    const qualityConfigMap = {
                      economy: {
                        label: 'Economy',
                        subtitle: 'Standard Finishes',
                        description: 'Budget-friendly with essential materials',
                        features: ['Laminate Finishes', 'Basic Hardware', 'Standard Tiles', 'Economy Paint'],
                        color: 'emerald',
                        multiplier: '1.0x'
                      },
                      premium: {
                        label: 'Premium',
                        subtitle: 'Superior Materials',
                        description: 'Enhanced quality with premium touches',
                        features: ['Wood Finishes', 'Premium Hardware', 'Designer Tiles', 'Luxury Paint'],
                        color: 'amber',
                        multiplier: '1.4x'
                      },
                      luxury: {
                        label: 'Luxury',
                        subtitle: 'Ultra Premium Selection',
                        description: 'Finest materials and exclusive designs',
                        features: ['Imported Marble', 'Designer Hardware', 'Italian Tiles', 'Texture Coatings'],
                        color: 'purple',
                        multiplier: '1.8x'
                      }
                    } as const;
                    
                    const qualityConfig = qualityConfigMap[q];
                    
                    const colorClasses = {
                      emerald: {
                        selected: 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-400/20',
                        badge: 'bg-emerald-400 text-white',
                        icon: 'text-emerald-600',
                        gradient: 'from-emerald-50 to-white'
                      },
                      amber: {
                        selected: 'border-amber-400 bg-amber-50 ring-4 ring-amber-400/20',
                        badge: 'bg-amber-400 text-white',
                        icon: 'text-amber-600',
                        gradient: 'from-amber-50 to-white'
                      },
                      purple: {
                        selected: 'border-purple-400 bg-purple-50 ring-4 ring-purple-400/20',
                        badge: 'bg-purple-400 text-white',
                        icon: 'text-purple-600',
                        gradient: 'from-purple-50 to-white'
                      }
                    };
                    
                    const colors = colorClasses[qualityConfig.color];
                    
                    return `
                      <div data-action="calc-set-quality" data-value="${q}" role="button" tabindex="0" class="w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group cursor-pointer ${isSelected ? colors.selected + ' shadow-lg scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}">
                        <div class="flex items-start justify-between gap-4 mb-3">
                          <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center ${isSelected ? 'scale-110' : 'grayscale opacity-60'} transition-all duration-300">
                              <i class="ri-${q === 'economy' ? 'wallet-3' : q === 'premium' ? 'medal' : 'crown'}-line text-2xl ${colors.icon}"></i>
                            </div>
                            <div>
                              <div class="flex items-center gap-2">
                                <div class="font-black text-lg capitalize ${isSelected ? 'text-slate-900' : 'text-slate-600'}">${qualityConfig.label}</div>
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isSelected ? colors.badge : 'bg-slate-200 text-slate-500'}">${qualityConfig.multiplier}</span>
                              </div>
                              <div class="text-[10px] text-slate-500 font-bold uppercase tracking-tight">${qualityConfig.subtitle}</div>
                            </div>
                          </div>
                          <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? colors.badge + ' scale-110 shadow-md' : 'border-slate-200 group-hover:border-slate-300'}">
                            ${isSelected ? '<i class="ri-check-line font-bold"></i>' : ''}
                          </div>
                        </div>
                        <div class="text-xs text-slate-600 font-medium mb-3">${qualityConfig.description}</div>
                        <div class="grid grid-cols-1 gap-2">
                          ${qualityConfig.features.map((feature: string) => `
                            <div class="flex items-start gap-1.5 min-w-0">
                              <i class="ri-checkbox-circle-line text-xs ${isSelected ? colors.icon : 'text-slate-300'}"></i>
                              <span class="text-[10px] leading-tight font-semibold text-slate-600 break-words normal-case tracking-normal">${feature}</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
          ${s.result ? `
            <div class="mt-10 pt-8 border-t border-slate-100">
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <i class="ri-gallery-line text-lg"></i>
                <span>Recommended ${effectiveDisplayCategory} Concepts</span>
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                ${(s.relatedDesigns || []).length > 0 ? (s.relatedDesigns || []).map(design => `
                  <div class="group cursor-pointer p-2 rounded-2xl transition-all ${s.selectedDesignId === design.id ? 'bg-amber-50 ring-2 ring-amber-400' : 'hover:bg-slate-50'}" data-action="calc-select-design" data-value="${design.id}" data-related-design-category="${escapeHtml(String(design.category || ''))}">
                    <div class="aspect-[4/5] rounded-xl overflow-hidden mb-3 relative">
                      <img src="${escapeHtml(normalizeAssetUrl(String(design.previewImage || design.image || design.imageUrl || (Array.isArray(design.images) ? design.images[0] : '') || '')) || '/category/Living room/living1.jpg')}", class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.onerror=null;this.src='/category/Living room/living1.jpg'" />
                      <div class="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[9px] font-black uppercase tracking-wide">${String(design.source || 'catalog').replace(/-/g, ' ')}</div>
                      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        ${s.selectedDesignId === design.id ? `<div class="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center"><i class="ri-check-line text-lg font-bold"></i></div>` : `<div class="px-4 py-2 bg-white/90 text-xs font-black rounded-lg shadow-sm text-slate-800">Select</div>`}
                      </div>
                    </div>
                    <div class="text-[10px] font-black uppercase ${s.selectedDesignId === design.id ? 'text-amber-700' : 'text-slate-800'} line-clamp-1">${design.title}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">${design.style || 'Modern'} Style</div>
                  </div>
                `).join('') : `
                  <div class="col-span-full py-10 bg-slate-50 rounded-3xl text-center">
                    <p class="text-slate-400 text-xs font-bold uppercase">No specific ${s.category} designs found in our current catalog.</p>
                  </div>
                `}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="p-8 bg-slate-900 text-white">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex-1 text-center md:text-left">
              ${s.result ? `
                <div class="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">Estimated Investment</div>
                <div class="text-4xl font-display font-black text-amber-400">${formatCurrency(s.result)}</div>
              ` : `
                <div class="text-slate-400 text-sm italic font-medium">Configure all options to see estimate</div>
              `}
            </div>
            <div class="flex gap-3 w-full md:w-auto">
              ${s.result ? `
                <button data-action="run-calculation" class="flex-1 md:flex-none px-10 py-4 rounded-xl bg-amber-400 text-slate-900 font-black hover:bg-amber-500 transition active:scale-95 shadow-lg shadow-amber-400/20">Recalculate</button>
                <button data-action="nav" data-tab="contact" class="flex-1 md:flex-none px-10 py-4 rounded-xl bg-white/10 text-white font-black hover:bg-white/20 transition border border-white/10">Book Consultation</button>
              ` : `
                <button data-action="run-calculation" class="w-full md:w-64 py-4 rounded-xl bg-amber-400 text-slate-900 font-black hover:bg-amber-500 transition active:scale-95 shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2">
                  <span>Calculate Investment</span>
                  <i class="ri-arrow-right-line"></i>
                </button>
              `}
            </div>
          </div>
          <p class="mt-6 text-[10px] text-slate-500 text-center leading-relaxed max-w-2xl mx-auto uppercase tracking-tighter">*Disclaimer: This result is a baseline estimate based on average market material rates in 2024. Final pricing depends on exact site conditions, personalized design choices, and structural complexity.</p>
        </div>
      </div>
    </div>
  `;
};

// Expose legacy price calculator renderer for feature-wrapper delegation.
