const renderCategoryGallery = () => {
  const categories = getCustomerVisibleCategories(state.customer.categories || []);
  const designs = getCustomerDesignPool();
  const selectedCategory = state.customer.activeCategory ? categories.find(c => c.id === state.customer.activeCategory) : categories[0];
  const masterBedroomCategory = categories.find((cat) =>
    normalizeCategoryKey(cat.id || '').includes('masterbedroom') ||
    normalizeCategoryKey(cat.title || '').includes('masterbedroom') ||
    normalizeCategoryKey(cat.name || '').includes('masterbedroom')
  );

  // Get designs for selected category
  const categoryDesigns = selectedCategory
    ? designs.filter((design) => designMatchesCategory(design, getCategoryKeySet(selectedCategory.id, categories)))
    : [];

  const selectedKey = selectedCategory ? normalizeCategoryKey(selectedCategory.id || selectedCategory.title || selectedCategory.name || '') : '';
  const fallbackImages = masterBedroomCategory?.images || [];
  const categoryImages = selectedCategory?.images?.length
    ? selectedCategory.images
    : (selectedKey === 'bedroom' || selectedKey === 'catbedroom') && fallbackImages.length
      ? fallbackImages
      : categoryDesigns.map((design) => ({
        name: resolveDesignDisplayName(design, {
          imageUrl: design.previewImage,
          categoryId: design.categoryId,
          fallback: 'Design'
        }),
        url: design.previewImage
      }));
  const categoryImageCount = categoryImages.length;

  return `
    <div class="spidey-page">
      <section class="spidey-hero">
        <div class="spidey-hero-inner">
          <div class="spidey-kicker">Category Matrix</div>
          <div class="spidey-title">Room Universes</div>
          <div class="spidey-subtitle">Browse curated room archetypes and jump into each category vault.</div>
        </div>
      </section>

      <section class="spidey-grid">
        <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
          ${categories
      .map(
        (category) => `
            <button 
              data-action="select-category" 
              data-category-id="${escapeHtml(category.id)}"
              class="spidey-card has-3d-tilt group relative overflow-hidden aspect-square ${state.customer.activeCategory === category.id
            ? 'ring-2 ring-[color:var(--accent)] scale-[1.02]'
            : ''
          }"
            >
              ${category.thumbnail
            ? `<img src="${escapeHtml(category.thumbnail)}" alt="${escapeHtml(category.name || category.title || 'Category')}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 motion-3d" data-motion3d="true" loading="lazy">`
            : `<div class="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center"><span class="text-4xl">ðŸ“</span></div>`
          }
              <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end p-4">
                <div class="text-white">
                  <div class="font-semibold text-sm">${escapeHtml(category.name || category.title || 'Category')}</div>
                  <div class="text-xs text-white/70">${category.imageCount || 0} images</div>
                </div>
              </div>
            </button>
          `
      )
      .join('')}
        </div>

        ${selectedCategory
      ? `
          <div class="spidey-panel p-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 class="text-3xl font-display font-bold text-[color:var(--primary)]">${escapeHtml(selectedCategory.name || selectedCategory.title || 'Category')}</h2>
                <p class="text-slate-500">${categoryImageCount} reference images | ${categoryDesigns.length} available designs</p>
              </div>
              <div class="flex gap-2">
                <button data-action="toggle-category-view" data-view="images" class="spidey-chip ${state.customer.activeCategory && !state.customer.categoryView?.forceDesigns ? 'active' : ''}">
                  Reference Images
                </button>
                <button data-action="toggle-category-view" data-view="designs" class="spidey-chip ${state.customer.categoryView?.forceDesigns ? 'active' : ''}">
                  Designs ${categoryDesigns.length}
                </button>
              </div>
            </div>

            <div id="category-images-view" class="mb-10 ${state.customer.categoryView?.forceDesigns ? 'hidden' : ''}">
              ${categoryImages.length > 0
        ? `
                <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                  ${categoryImages
          .map((image, index) => {
            const design = getDesignForImage(selectedCategory?.id, index, image.url);
            const displayName = resolveDesignDisplayName(design, {
              imageName: image.name,
              imageUrl: image.url,
              categoryId: selectedCategory?.id,
              categoryName: selectedCategory?.title || selectedCategory?.name,
              fallback: `${selectedCategory?.title || selectedCategory?.name || 'Design'} ${index + 1}`
            });
            const designCost = formatCurrency(getDesignAmount(design as any));
            return `
                    <button
                      type="button"
                      data-action="open-category-image"
                      data-image-url="${escapeHtml(image.url)}"
                      data-image-name="${escapeHtml(displayName)}"
                      data-image-cost="${String(getDesignAmount(design as any))}"
                      data-category-name="${escapeHtml(selectedCategory.name || selectedCategory.title || '')}"
                      data-design-id="${escapeHtml(design?.id || '')}"
                      class="spidey-card has-3d-tilt group relative overflow-hidden aspect-square"
                    >
                      <img
                        src="${escapeHtml(image.url)}"
                        alt="${escapeHtml(displayName)}"
                        data-action="open-3d-view-image"
                        data-image-url="${escapeHtml(image.url)}"
                        data-motion3d="true"
                        class="motion-3d w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                        onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><rect fill=%22%23e5e7eb%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22>ðŸ–¼ï¸</text></svg>'"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div class="text-white text-sm font-semibold">${escapeHtml(displayName)}</div>
                      </div>
                      ${displayName || designCost ? `
                        <div class="absolute bottom-3 left-3 right-3 bg-black/60 text-white text-xs rounded-lg px-3 py-2">
                          <div class="font-semibold">${escapeHtml(displayName)}</div>
                          ${designCost ? `<div class="text-[11px] text-white/80">${escapeHtml(designCost)}</div>` : ''}
                        </div>
                      ` : ''}
                    </button>
                  `;
          })
          .join('')}
                </div>
              `
        : '<div class="text-center py-20 text-slate-400 italic">No reference images available in this category</div>'
      }
            </div>

            <div id="category-designs-view" class="${!state.customer.categoryView?.forceDesigns ? 'hidden' : ''}">
              ${categoryDesigns.length > 0
        ? `
                <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                  ${categoryDesigns
          .map(
            (design) => `
                    <div class="spidey-card has-3d-tilt group relative overflow-hidden bg-white cursor-pointer" data-action="select-model" data-id="${design.id}">
                      <div class="relative overflow-hidden aspect-square bg-slate-100">
                        <img 
                          src="${escapeHtml(design.previewImage)}"
                          alt="${escapeHtml(resolveDesignDisplayName(design, { imageUrl: design.previewImage, categoryId: design.categoryId }))}"
                          data-action="open-3d-view-image"
                          data-image-url="${escapeHtml(design.previewImage)}"
                          data-motion3d="${design.motion3d === true ? 'true' : 'false'}"
                          class="motion-3d w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><rect fill=%22%23e5e7eb%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22>âœï¸</text></svg>'"
                        />
                      </div>
                      <div class="p-4">
                        <div class="font-semibold text-slate-800 line-clamp-2">${escapeHtml(resolveDesignDisplayName(design, { imageUrl: design.previewImage, categoryId: design.categoryId }))}</div>
                        <div class="text-xs uppercase tracking-[0.1em] text-slate-500 mt-1">${escapeHtml(design.category)}</div>
                        <div class="flex items-center justify-between mt-3">
                          <div class="text-lg font-bold text-[color:var(--accent)]">${formatCurrency(getDesignAmount(design as any))}</div>
                          <div class="flex items-center gap-2">
                            <button data-action="open-3d-view-image" data-image-url="${escapeHtml(design.previewImage)}" class="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:shadow-md transition-all">
                              3D Motion
                            </button>
                            <button data-action="nav" data-tab="dashboard" class="px-3 py-1 bg-[color:var(--primary)] text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all">
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  `
          )
          .join('')}
                </div>
              `
        : `
                <div class="text-center py-20">
                  <div class="text-slate-400 italic mb-4">No designs available in this category yet</div>
                  <button data-action="nav" data-tab="gallery" class="spidey-cta">
                    View All Designs
                  </button>
                </div>
              `
      }
            </div>
          </div>
        `
      : '<div class="text-center py-20 text-slate-400 italic">No categories available</div>'
    }
      </section>
    </div>
  `;
};

// Expose legacy gallery renderer for feature-wrapper delegation.
(globalThis as any).renderGallery = renderGallery;

// --- Frontend page layer: Services ------------------------------------------
