const fs = require('fs');

let t = fs.readFileSync('main.ts', 'utf8');

// 1. replace display images logic
const oldDisplayImages = `  // Get category images matching selected room from API categories
  const allCategories = state.customer.categories && state.customer.categories.length > 0
    ? state.customer.categories
    : getCategories();
  const roomKey = selectedRoom?.type?.toLowerCase().replace(/[_\\s]+/g, '-') || '';
  const categoryImages = allCategories.flatMap((cat) => {
    const catKey = (cat.id || cat.name || '').toLowerCase().replace(/[_\\s]+/g, '-');
    const catLabel = (cat.title || cat.name || '').toLowerCase();
    const roomLabel = (selectedRoom?.name || '').toLowerCase();
    const match = catKey.includes(roomKey) || roomKey.includes(catKey) ||
      catLabel.includes(roomLabel.split(' ')[0]) || roomLabel.includes(catLabel);
    if (!match && allCategories.length > 3) return [];
    return (cat.images || []).slice(0, 4).map((img) => ({
      url: img.url,
      name: img.name || cat.title || cat.name || 'Design',
      category: cat.title || cat.name || 'Category',
      categoryId: cat.id || ''
    }));
  }).slice(0, 8);

  // Fallback: use first few images from all categories if no match
  const displayImages = categoryImages.length > 0
    ? categoryImages
    : allCategories.flatMap((cat) =>
      (cat.images || []).slice(0, 2).map((img) => ({
        url: img.url,
        name: img.name || cat.title || '',
        category: cat.title || cat.name || '',
        categoryId: cat.id || ''
      }))
    ).slice(0, 8);`;

const newDisplayImages = `  // Load explicit related designs assigned to this room
  const allDesigns = state.customer.designs && state.customer.designs.length > 0
    ? state.customer.designs
    : getDesigns();
    
  let displayImages = (selectedRoom?.designs || [])
    .map(id => allDesigns.find((d) => d.id === id))
    .filter(Boolean)
    .map((design) => ({
      url: design.previewImage,
      name: design.title,
      category: design.category || 'Related Design',
      categoryId: design.categoryId || ''
    }));

  // Fallback if no specific designs are assigned yet
  if (displayImages.length === 0) {
    const allCategories = state.customer.categories && state.customer.categories.length > 0 ? state.customer.categories : getCategories();
    displayImages = allCategories.flatMap((cat) =>
      (cat.images || []).slice(0, 2).map((img) => ({
        url: img.url, name: img.name || cat.title || '', category: cat.title || cat.name || '', categoryId: cat.id || ''
      }))
    ).slice(0, 8);
  }`;
t = t.replace(oldDisplayImages, newDisplayImages);

// 2. Poster
const oldPoster = `<img src="\${escapeHtml(selectedRoom.imageUrl)}" alt="\${escapeHtml(selectedRoom.name)}"
                    style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />`;
const newPoster = `<img src="\${escapeHtml(selectedRoom.imageUrl)}" alt="\${escapeHtml(selectedRoom.name)}"
                    class="motion-3d" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />`;
t = t.replace(oldPoster, newPoster);

// 3. Fallback video frame
const oldFallback = `<div class="showroom-video-frame">
              <img src="\${escapeHtml(selectedRoom.imageUrl)}" alt="\${escapeHtml(selectedRoom.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;" />
            </div>`;
const newFallback = `<div class="showroom-video-frame overflow-hidden">
              <img src="\${escapeHtml(selectedRoom.imageUrl)}" alt="\${escapeHtml(selectedRoom.name)}" class="motion-3d" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;" />
            </div>`;
t = t.replace(oldFallback, newFallback);

// 4. show room designs
const oldDesignWrap = `<div class="showroom-design-img-wrap">
                    <img
                      src="\${escapeHtml(img.url)}"
                      alt="\${escapeHtml(img.name)}"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />`;
const newDesignWrap = `<div class="showroom-design-img-wrap overflow-hidden">
                    <img
                      src="\${escapeHtml(img.url)}"
                      alt="\${escapeHtml(img.name)}"
                      class="motion-3d w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                      loading="lazy"
                    />`;
t = t.split(oldDesignWrap).join(newDesignWrap); // global replace

// 5. 3D show case (portfolio)
const old3dShowcase = `<img src="\${escapeHtml(img.url)}" alt="\${escapeHtml(img.name || img.categoryLabel || '3D Design')}" loading="lazy" />`;
const new3dShowcase = `<div class="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
                    <img src="\${escapeHtml(img.url)}" alt="\${escapeHtml(img.name || img.categoryLabel || '3D Design')}" class="motion-3d w-full h-full object-cover" loading="lazy" />
                  </div>`;
t = t.split(old3dShowcase).join(new3dShowcase);

// 6. Portfolio card
const oldPortfolioCard = `<div class="portfolio-image-wrapper">
                    \${activeImage?.url ? \`
                      <img 
                        src="\${escapeHtml(activeImage.url)}" 
                        alt="\${escapeHtml(displayName)}"
                        class="w-full h-64 object-cover"
                        loading="lazy"
                      />\``;
const newPortfolioCard = `<div class="portfolio-image-wrapper overflow-hidden">
                    \${activeImage?.url ? \`
                      <img 
                        src="\${escapeHtml(activeImage.url)}" 
                        alt="\${escapeHtml(displayName)}"
                        class="motion-3d w-full h-64 object-cover transition-transform duration-700 hover:scale-110"
                        loading="lazy"
                      />\``;
// Handle backtick properly in template string
const oldPortfolioFix = '<div class="portfolio-image-wrapper">\n                    ${activeImage?.url ? `\n                      <img \n                        src="${escapeHtml(activeImage.url)}" \n                        alt="${escapeHtml(displayName)}"\n                        class="w-full h-64 object-cover"\n                        loading="lazy"\n                      />`';
const newPortfolioFix = '<div class="portfolio-image-wrapper overflow-hidden">\n                    ${activeImage?.url ? `\n                      <img \n                        src="${escapeHtml(activeImage.url)}" \n                        alt="${escapeHtml(displayName)}"\n                        class="motion-3d w-full h-64 object-cover transition-transform duration-700 hover:scale-110"\n                        loading="lazy"\n                      />`';
t = t.split(oldPortfolioFix).join(newPortfolioFix);

// 7. Add CSS showroom
const oldShowroomEnd = `        </main>
      </section>
    </div>
  \`;
};`;
const newShowroomEnd = `        </main>
      </section>
      <style>
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        .motion-3d { animation: kenBurns 20s ease-in-out infinite alternate; transform-origin: center center; }
      </style>
    </div>
  \`;
};`;
t = t.split(oldShowroomEnd).join(newShowroomEnd);

fs.writeFileSync('main.ts', t);
console.log('Done script!');
