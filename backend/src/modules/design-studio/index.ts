// --- Frontend page layer: AI Studio -----------------------------------------
const renderAiStudio = () => {
  const canGenerate = !state.smartStudio.isGenerating;
  const designs = state.smartStudio.variants || [];
  const rooms = [
    { id: 'bedroom', name: 'ðŸ›ï¸ Bedroom' },
    { id: 'masterbedroom', name: 'ðŸ›ï¸ Master Bedroom' },
    { id: 'kids', name: 'ðŸ§¸ Kids Bedroom' },
    { id: 'kitchen', name: 'ðŸ³ Kitchen' },
    { id: 'living', name: 'ðŸ›‹ï¸ Living Room' },
    { id: 'dining', name: 'ðŸ½ï¸ Dining Room' },
    { id: 'bathroom', name: 'ðŸš¿ Bathroom' },
    { id: 'garden', name: 'ðŸŒ³ Garden' },
    { id: 'classroom', name: 'ðŸŽ“ Classroom' },
    { id: 'gym', name: 'ðŸ’ª Gym' },
    { id: 'office', name: 'ðŸ¢ Office' },
    { id: 'terrace', name: 'ðŸŒ… Terrace' },
    { id: 'pooja', name: 'ðŸª” Pooja Room' }
  ];

  return `
  <div class="spidey-page" >
    <section class="spidey-hero" >
      <div class="spidey-hero-inner" >
        <div class="spidey-kicker" > Design Studio </div>
          <div class="spidey-title" > Concept Generator </div>
            <div class="spidey-subtitle" > Upload a room photo, pick a room type, and generate curated design concepts.</div>
              </div>
              </section>

              <section class="spidey-grid lg:grid-cols-[1.2fr_1fr]" >
                <div class="spidey-panel p-6 space-y-5" >
                  <div>
                  <label class="text-xs uppercase tracking-[0.3em] text-slate-400" > Room Type </label>
                    <select data-bind="smartStudio.room" class="mt-2 w-full p-4 bg-slate-50 rounded-2xl border border-black/5 text-sm">
                      ${rooms.map(r => `<option value="${r.id}" ${state.smartStudio.room === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}
</select>
  </div>
  <div >
  <label class="text-xs uppercase tracking-[0.3em] text-slate-400" > Reference Photo </label>
    <input type="file" id = "aiImageInput" name = "aiImage" accept = "image/*" class="mt-2 w-full" />
      ${state.smartStudio.originalImage ? `
              <div class="mt-2 text-xs text-green-600 font-semibold">âœ“ Photo uploaded successfully</div>
            ` : ''
    }
</div>
  <div >
  <label class="text-xs uppercase tracking-[0.3em] text-slate-400" > Style Preference(optional) </label>
    <input data-bind="smartStudio.prompt" value="${escapeHtml(state.smartStudio.prompt)}" placeholder="Modern, Traditional, Contemporary, etc." class="mt-2 w-full p-4 bg-slate-50 rounded-2xl border border-black/5" />
      </div>
          ${state.smartStudio.originalImage ? `
            <div class="rounded-2xl overflow-hidden border border-black/10">
              <img src="${escapeHtml(state.smartStudio.originalImage)}" alt="Upload preview" class="w-full h-64 object-cover" />
            </div>
          ` : ''
    }
          ${state.smartStudio.error ? `<div class="text-sm text-red-600">${escapeHtml(state.smartStudio.error)}</div>` : ''}
<div class="flex flex-wrap gap-3" >
  <button data-action="ai-generate" class="spidey-cta ${canGenerate ? '' : 'opacity-60 pointer-events-none'}" >
    ${state.smartStudio.isGenerating ? 'Loading Designs...' : 'Show Designs'}
</button>
  <button data-action="ai-reset" class="px-6 py-3 rounded-2xl border border-[color:var(--primary)] text-[color:var(--primary)] font-semibold" >
    Reset
    </button>
            ${designs.length > 0 ? `
              <button data-action="ai-save" class="px-6 py-3 rounded-2xl bg-[color:var(--accent)] text-[color:var(--primary)] font-semibold">Save to Dashboard</button>
            ` : ''
    }
</div>
  </div>

  <div class="spidey-panel p-6" >
    <div class="flex items-center justify-between mb-4" >
      <div>
      <h2 class="text-xl font-display font-bold text-[color:var(--primary)]" > Design Concepts </h2>
              ${designs.length > 0 ? `<p class="text-xs text-slate-500 mt-1">Showing ${rooms.find(r => r.id === state.smartStudio.room)?.name || 'Room'} designs</p>` : ''}
</div>
  <span class="text-xs uppercase tracking-[0.2em] text-slate-400" > ${designs.length} variations </span>
    </div>
          ${designs.length === 0 ? `
            <div class="py-16 text-center text-slate-400 italic">Upload a photo and click 'Show Designs' to view our curated collection.</div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              ${designs
      .map(
        (variant: any) => `
                <div class="spidey-card cursor-pointer" data-action="open-ai-design" data-image-url="${escapeHtml(variant.image)}" data-image-name="${escapeHtml(variant.title)}" data-image-desc="${escapeHtml(variant.description)}" data-image-price="${variant.price || 0}" data-image-category="${escapeHtml(variant.categoryName || '')}" data-design-id="${escapeHtml(variant.designId || '')}">
                  ${variant.image ? `<img src="${escapeHtml(variant.image)}" alt="${escapeHtml(variant.title)}" class="w-full h-40 object-cover" />` : `<div class="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400">No preview</div>`}
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-1">
                      <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(variant.title)}</div>
                      ${variant.price ? `<div class="text-xs font-bold text-[color:var(--accent)]">â‚¹${(variant.price / 1000).toFixed(0)}k</div>` : ''}
                    </div>
                    <div class="text-xs text-slate-400 mt-2 line-clamp-2">${escapeHtml(variant.description)}</div>
                    <button data-action="open-3d-view-image" data-image-url="${escapeHtml(variant.image)}" class="mt-3 w-full py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-[10px] font-semibold text-slate-600 flex items-center justify-center gap-2">
                       <span>View 3D</span>
                    </button>
                    <button data-action="book-ai-design" data-design-id="${escapeHtml(variant.designId || '')}" data-design-name="${escapeHtml(variant.title)}" data-design-price="${variant.price || 0}" data-design-category="${escapeHtml(variant.categoryName || '')}" class="mt-2 w-full py-2 rounded-lg bg-[color:var(--primary)] hover:opacity-90 text-white text-[10px] font-bold flex items-center justify-center gap-2">
                       <span>Book Design</span>
                    </button>
                  </div>
                </div>
              `
      )
      .join('')}
            </div>
          `}
</div>
  </section>
  </div>
    `;
};

const renderPortfolioDialog = () => {
  const dialog = (state.customer as any).portfolioDialog;
  if (!dialog || !dialog.isOpen) return '';

  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onclick="if(event.target === this) { document.getElementById('close-portfolio-dialog-btn')?.click(); }">
      <div class="relative w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        
        <button id="close-portfolio-dialog-btn" data-action="close-portfolio-dialog" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div class="w-full aspect-video bg-slate-800 relative overflow-hidden">
          <img src="${escapeHtml(dialog.imageUrl)}" alt="${escapeHtml(dialog.imageName)}" class="motion-3d w-full h-full object-cover" data-motion3d="true" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <div class="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">${escapeHtml(dialog.imageCategory)}</div>
            <h3 class="text-xl font-bold text-white">${escapeHtml(dialog.imageName)}</h3>
            ${dialog.imageCost ? `<div class="text-sm font-semibold text-white/80 mt-1">${escapeHtml(dialog.imageCost)}</div>` : ''}
          </div>
        </div>

        <div class="p-6">
          <p class="text-sm text-slate-300 mb-6">
            ${escapeHtml(dialog.imageDesc || 'Select an immersive viewing experience below to explore this design.')}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              data-action="open-category-image"
              data-image-url="${escapeHtml(dialog.imageUrl)}"
              data-image-name="${escapeHtml(dialog.imageName || dialog.imageCategory || '3D Design')}"
              data-image-desc="${escapeHtml(dialog.imageDesc)}"
              data-image-cost="${escapeHtml(dialog.imageCost)}"
              data-image-category="${escapeHtml(dialog.imageCategory)}"
              data-category-id="${escapeHtml(dialog.categoryId)}"
              data-category-name="${escapeHtml(dialog.categoryName)}"
              data-design-id="${escapeHtml(dialog.designId)}"
              class="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">âœ¨</div>
              <div class="font-bold text-white text-sm">3D Motion View</div>
              <div class="text-[10px] text-slate-400 mt-1 text-center">Cinematic ken-burns presentation</div>
            </button>

            <button
              data-action="open-3d-room"
              data-image-url="${escapeHtml(dialog.imageUrl)}"
              data-room-name="${escapeHtml(dialog.imageName || dialog.imageCategory || '3D Room')}"
              class="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/30 hover:border-purple-400 transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">ðŸ </div>
              <div class="font-bold text-white text-sm">View in 3D</div>
              <div class="text-[10px] text-slate-400 mt-1 text-center">Interactive 3D room environment</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
};

  // Expose legacy categories renderer for feature-wrapper delegation.
  (globalThis as any).renderCategories = renderCategoryGallery;

// --- Frontend page layer: Portfolio -----------------------------------------
