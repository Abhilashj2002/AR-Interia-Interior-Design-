const renderServices = () => {
  const showcases = (state.serviceShowcases && state.serviceShowcases.length > 0) ? state.serviceShowcases : INITIAL_SERVICE_SHOWCASES;
  const companyHighlights = [
    { label: 'Designers', value: COMPANY_INFO.employees },
    { label: 'Factory Space', value: COMPANY_INFO.factorySize },
    { label: 'Established', value: `Since ${COMPANY_INFO.established}` },
    { label: 'Client Satisfaction', value: '4.9/5 average' }
  ];
  return `
    <div class="spidey-page">
      <section class="spidey-hero">
        <div class="spidey-hero-inner">
          <div class="spidey-kicker">Studio Operations</div>
          <div class="spidey-title">Service Arsenal</div>
          <div class="spidey-subtitle">Precision-crafted interiors, visualized in AR and delivered with studio-grade discipline.</div>
        </div>
      </section>

      <section class="spidey-grid">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${showcases
      .map(
        (project) => `
            <div class="spidey-card has-3d-tilt">
              <div class="relative h-44 overflow-hidden">
                ${project.image && !project.image.startsWith('blob:')
            ? `<button type="button" data-action="open-service-showcase-details" data-showcase-id="${escapeHtml(String(project.id || ''))}" data-showcase-title="${escapeHtml(project.title || '')}" data-showcase-price="${escapeHtml(project.price || '')}" data-showcase-style="${escapeHtml(project.style || '')}" data-showcase-description="${escapeHtml(project.description || '')}" data-showcase-image="${escapeHtml(project.image || '')}" class="block w-full h-full text-left" title="View details">
                  <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" class="w-full h-full object-cover motion-3d cursor-pointer" data-motion3d="true" onerror="this.onerror=null;this.src='/category/Living room/living1.jpg'" />
               </button>`
            : `<div class="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-4xl">ðŸ </div>`
          }
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div class="absolute bottom-3 left-4 text-white pointer-events-none">
                  <div class="text-xs uppercase tracking-[0.2em]">${escapeHtml(project.style)}</div>
                  <div class="text-lg font-semibold">${escapeHtml(project.title)}</div>
                </div>
              </div>
              <div class="p-6 space-y-3">
                <p class="text-sm text-slate-600">${escapeHtml(project.description)}</p>
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>${escapeHtml(project.duration)}</span>
                  <span class="font-semibold text-[color:var(--accent)]">${escapeHtml(project.price)}</span>
                </div>
              </div>
            </div>
          `
      )
      .join('')}
        // --- Frontend page layer: Contact -------------------------------------------
        </div>

        <div class="spidey-panel p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 class="text-3xl font-display font-bold text-[color:var(--primary)] mb-4">About ${escapeHtml(COMPANY_INFO.name)}</h2>
              <p class="text-slate-600 mb-6">We blend artisanal craftsmanship with advanced design visualization so you can experience every material, finish, and layout before we build it. Our in-house design studio collaborates closely with production teams to deliver on time, every time.</p>
              <div class="grid grid-cols-2 gap-4">
                ${companyHighlights
      .map(
        (item) => `
                  <div class="bg-slate-50 rounded-xl p-4">
                    <div class="text-sm text-slate-500">${escapeHtml(item.label)}</div>
                    <div class="text-lg font-semibold text-[color:var(--primary)]">${escapeHtml(item.value)}</div>
                  </div>
                `
      )
      .join('')}
              </div>
            </div>
            <div class="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 flex flex-col justify-center">
              <h3 class="text-2xl font-semibold text-[color:var(--primary)] mb-3">What You Get</h3>
              <ul class="space-y-3 text-slate-600">
                <li>End-to-end design consultation with immersive walkthroughs.</li>
                <li>Material moodboards and 3D render approval.</li>
                <li>Dedicated project manager and weekly updates.</li>
                <li>On-site installation and handover checklist.</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          ${state.services
      .map(
        (service: any) => `
            <div class="spidey-card flex flex-col">
              <div class="flex-shrink-0 h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div class="text-4xl">${escapeHtml(service.icon)}</div>
              </div>
              <div class="p-4 flex-1 flex flex-col">
                <h3 class="text-lg font-semibold text-[color:var(--primary)] mb-2">${escapeHtml(service.title)}</h3>
                <p class="text-sm text-slate-600 mb-3 flex-1">${escapeHtml(service.description)}</p>
                <div class="mt-auto flex items-center justify-between gap-3">
                  <button
                    data-action="service-details"
                    data-service-id="${escapeHtml(service.id)}"
                    class="text-[color:var(--primary)] font-semibold text-xs hover:underline"
                  >
                    View Details
                  </button>
                  ${service.video ? `
                    <button data-action="play-video" data-video-url="${escapeHtml(service.video)}" data-video-title="${escapeHtml(service.title)}" class="text-[color:var(--accent)] font-semibold text-xs hover:underline">
                      Watch Video â†’
                    </button>
                  ` : `<button data-action="nav" data-tab="contact" class="text-[color:var(--accent)] font-semibold text-xs hover:underline">Book Service â†’</button>`}
                </div>
              </div>
            </div>
          `
      )
      .join('')}
        </div>

        <div class="spidey-panel p-10">
          <div class="grid grid-cols-1 md:grid-cols-[0.7fr_1fr] gap-8">
            <div class="bg-[color:var(--primary)] text-white rounded-3xl p-8">
              <h3 class="text-2xl font-display font-bold mb-4">Share Your Experience</h3>
              <p class="text-white/70 text-sm">Your feedback helps us refine our craftsmanship and digital experiences.</p>
            </div>
            <div>
              ${state.feedbackSubmitted
      ? `
                <div class="text-center py-8">
                  <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">âœ“</div>
                  <h4 class="text-xl font-semibold text-[color:var(--primary)]">Thank You!</h4>
                  <p class="text-slate-500 mt-2">Your review has been shared with our design team.</p>
                  <button data-action="reset-feedback" class="mt-6 text-[color:var(--accent)] font-semibold">Write another review</button>
                </div>
              `
      : `
                <form data-form="feedback-public" class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs uppercase tracking-[0.3em] text-slate-400">Rate our service</span>
                    <div class="flex gap-1">
                      ${[1, 2, 3, 4, 5]
        .map(
          (num) => `
                        <button type="button" data-action="set-feedback-rating" data-rating="${num}" class="text-xl ${num <= state.feedbackForm.rating ? 'text-[color:var(--accent)]' : 'text-slate-200'}">â˜…</button>
                      `
        )
        .join('')}
                    </div>
                  </div>
                  <input name="name" data-bind="feedbackForm.name" value="${escapeHtml(state.feedbackForm.name)}" placeholder="Your Name" class="w-full p-4 bg-slate-50 rounded-2xl border border-black/5" />
                  <textarea name="comment" data-bind="feedbackForm.comment" rows="4" placeholder="What did you think of the design previews and our service?" class="w-full p-4 bg-slate-50 rounded-2xl border border-black/5"></textarea>
                  <button type="submit" class="w-full py-4 rounded-2xl bg-[color:var(--primary)] text-white font-semibold">Submit Feedback</button>
                </form>
              `
    }
            </div>
          </div>
        </div>

        <div class="spidey-panel-dark p-10 relative overflow-hidden">
          <div class="absolute inset-0 bg-noise opacity-30"></div>
          <div class="relative z-10 max-w-2xl">
            <h2 class="text-3xl font-display font-bold mb-3">Smart Design Concierge</h2>
            <p class="text-white/70 mb-6">Tell us about your space. Smart Engine will recommend the perfect Indian Heritage fusion elements.</p>
            <div class="relative">
              <input data-bind="smartPrompt" value="${escapeHtml(state.smartPrompt)}" placeholder="I need a modern Rajasthani vibe..." class="w-full p-5 pr-16 bg-white/10 border border-white/20 rounded-3xl text-white placeholder:text-white/60" />
              <button data-action="smart-assist" class="absolute right-2 top-2 bottom-2 px-5 rounded-2xl bg-[color:var(--accent)] text-[color:var(--primary)] font-bold">
                ${state.isSmartLoading ? '...' : 'Send'}
              </button>
            </div>
            ${state.smartResult
      ? `
              <div class="mt-6 p-6 bg-white/10 border border-white/20 rounded-[24px]">
                <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)] mb-2">${escapeHtml(state.smartResult.vibe)}</p>
                <p class="text-white italic mb-4">"${escapeHtml(state.smartResult.suggestion)}"</p>
                <div class="flex flex-wrap gap-2">
                  ${state.smartResult.recommendedItems
        .map((item) => `<span class="px-3 py-1 rounded-xl bg-white/10 text-xs">${escapeHtml(item)}</span>`)
        .join('')}
                </div>
              </div>
            `
      : ''
    }
          </div>
        </div>

        <!-- Packages Section -->
        <div class="spidey-panel p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-display font-bold text-[color:var(--primary)]">Our Packages</h2>
              <p class="text-slate-500 text-sm mt-1">Choose from our curated interior design packages</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${getCustomerDisplayPackages().map((pkg: any) => `
              <div class="rounded-2xl border border-black/5 overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer has-3d-tilt" data-action="open-package-modal" data-package-id="${pkg.id}">
                <div class="relative h-48 overflow-hidden bg-slate-100">
                  <div class="absolute inset-0 w-full h-full">
                    <img src="${escapeHtml(getPackageBackgroundImage(pkg))}" alt="${escapeHtml(pkg.name)} background" class="w-full h-full object-cover opacity-60" style="z-index:1;" onerror="this.src='/category/Living room/living1.jpg'" />
                    <img src="${escapeHtml(getPackageDisplayImage(pkg))}" alt="${escapeHtml(pkg.name)}" class="w-2/3 h-2/3 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="z-index:2;" loading="lazy" onerror="this.src='/category/Living room/living1.jpg'" />
                  </div>
                </div>
                <div class="relative z-10 p-4 space-y-3 bg-white">
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-500">${escapeHtml(pkg.category || 'Package')}</div>
                  <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(pkg.name)}</h3>
                  <p class="text-sm text-slate-700 line-clamp-2">${escapeHtml(pkg.description)}</p>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xs text-slate-500 line-through">â‚¹${(pkg.originalPrice || 0).toLocaleString()}</span>
                      <div class="text-lg font-bold text-[color:var(--accent)]">â‚¹${(pkg.discountedPrice || 0).toLocaleString()}</div>
                    </div>
                    <button data-action="quote-package" data-package="${pkg.id}" data-package-name="${escapeHtml(pkg.name)}" class="px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-wide shadow-md shadow-amber-300/60 hover:bg-amber-300 hover:shadow-lg transition">Get Quote</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="mt-6 text-center">
            <button data-action="nav" data-tab="contact" class="px-6 py-3 rounded-2xl border-2 border-[color:var(--primary)] text-[color:var(--primary)] font-semibold hover:bg-[color:var(--primary)]/10 transition">View All 30 Packages</button>
          </div>
        </div>
      </section>
    </div>
  `;
};

// Expose legacy services renderer for feature-wrapper delegation.
(globalThis as any).renderServices = renderServices;

const quoteBtn = (text: string, action: string, dataAttrs: string = '') => {
  return `<button data-action="${action}" ${dataAttrs} class="bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-400/20 flex items-center gap-2">${text}</button>`;
};

const bookBtn = (text: string, action: string, dataAttrs: string = '') => {
  return `<button data-action="${action}" ${dataAttrs} class="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/20 backdrop-blur-sm flex items-center gap-2">${text}</button>`;
};

type ShowroomDisplayImage = {
  url: string;
  name: string;
  category: string;
  categoryId: string;
  sourceType: 'manual' | 'design' | 'video' | 'category';
  sourceLabel: string;
};

const getShowroomRoomMatchKeys = (roomType: string, roomName: string): string[] => {
  const keys = new Set<string>([
    normalizeKey(roomType),
    normalizeKey(roomName)
  ]);

  const combinedText = `${String(roomType || '')} ${String(roomName || '')}`.toLowerCase();

  const keywordRules: Array<{ test: RegExp; add: string[] }> = [
    { test: /master|bed|guest|kids|suite/, add: ['bedroom', 'master-bedroom', 'kids-bedroom', 'guest-room'] },
    { test: /living|lounge|family/, add: ['living', 'living-room'] },
    { test: /dining/, add: ['dining', 'dining-area'] },
    { test: /kitchen|pantry|modular/, add: ['kitchen', 'open-kitchen'] },
    { test: /bath|wash|powder|toilet/, add: ['bathroom', 'luxury-bathroom'] },
    { test: /office|study|work/, add: ['office', 'home-office', 'office-interior'] },
    { test: /balcony|terrace|deck/, add: ['balcony', 'terrace', 'outdoor'] },
    { test: /garden|lawn|outdoor/, add: ['garden', 'garden-outdoor', 'outdoor'] },
    { test: /theatre|theater|cinema|media/, add: ['theatre', 'home-theatre', 'media-room'] },
    { test: /gym|fitness|workout/, add: ['gym'] },
    { test: /pool|swimming/, add: ['pool', 'swimming-pool'] },
    { test: /wardrobe|closet|walk-?in/, add: ['wardrobe'] },
    { test: /pooja|prayer|mandir/, add: ['pooja'] }
  ];

  keywordRules.forEach((rule) => {
    if (rule.test.test(combinedText)) {
      rule.add.forEach((value) => keys.add(normalizeKey(value)));
    }
  });

  const aliasMap: Record<string, string[]> = {
    'master-bedroom': ['bedroom'],
    'kids-bedroom': ['kids', 'bedroom'],
    'guest-room': ['bedroom'],
    'home-office': ['office', 'office-interior', 'study'],
    'living-room': ['living', 'dining-area', 'lounge'],
    'living-dining': ['living', 'dining-area'],
    'open-kitchen': ['kitchen'],
    'luxury-bathroom': ['bathroom', 'powder-room'],
    'home-theatre': ['theatre', 'media-room'],
    'garden-outdoor': ['garden', 'outdoor'],
    'balcony': ['terrace', 'outdoor']
  };

  Array.from(keys).forEach((key) => {
    (aliasMap[key] || []).forEach((alias) => keys.add(alias));
  });

  return Array.from(keys).filter(Boolean);
};

const getVideoRelatedImages = (roomType: string, roomName: string): ShowroomDisplayImage[] => {
  const roomKeys = getShowroomRoomMatchKeys(roomType, roomName);
  if (roomKeys.length === 0) return [];

  const videoKeywordMap: Record<string, string[]> = {
    'vid-001': ['living', 'living-room', 'lounge', 'dining-area'],
    'vid-002': ['kitchen', 'open-kitchen'],
    'vid-003': ['bedroom', 'master-bedroom', 'kids-bedroom', 'guest-room'],
    'vid-004': ['office', 'study', 'home-office', 'small-space'],
    'vid-005': ['theatre', 'home-theatre', 'media-room'],
    'vid-006': ['bathroom', 'luxury-bathroom', 'powder-room'],
    'vid-007': ['pooja', 'gym', 'wardrobe', 'design-style'],
    'vid-008': ['garden', 'garden-outdoor', 'balcony', 'terrace', 'outdoor']
  };

  const matchesVideo = (video: { id: string; title: string }) => {
    const mappedKeywords = videoKeywordMap[String(video.id || '')] || [];
    if (roomKeys.some((key) => mappedKeywords.includes(key))) return true;

    const haystack = normalizeKey(`${video.title} ${video.id}`);
    return roomKeys.some((key) => key && (haystack.includes(key) || key.includes(haystack)));
  };

  const matchedVideos = INTERIOR_DESIGN_VIDEOS
    .filter((video) => matchesVideo(video));

  const fallbackVideos = matchedVideos.length > 0
    ? matchedVideos
    : INTERIOR_DESIGN_VIDEOS.filter((video) => ['vid-001', 'vid-007'].includes(String(video.id || '')));

  return fallbackVideos
    .map((video) => ({
      url: normalizeAssetUrl(video.thumbnail || ''),
      name: `${video.title} (Video Reference)`,
      category: 'Video Design Reference',
      categoryId: String(video.id || ''),
      sourceType: 'video' as const,
      sourceLabel: 'Video Reference'
    }))
    .filter((image) => Boolean(image.url))
    .slice(0, 3);
};

const getCategorySpecificDesigns = (roomType: string, roomName: string): ShowroomDisplayImage[] => {
  const categories = state.customer.categories && state.customer.categories.length > 0
    ? state.customer.categories
    : getCategories();
  const roomKeys = getShowroomRoomMatchKeys(roomType, roomName);

  return categories
    .filter((cat) => {
      const haystack = normalizeKey(`${cat.title || ''} ${cat.name || ''} ${cat.id || ''}`);
      return roomKeys.some((key) => haystack.includes(key) || key.includes(haystack));
    })
    .flatMap((cat) =>
      (cat.images || []).slice(0, 4).map((img) => ({
        url: normalizeAssetUrl(img.url),
        name: `${sanitizeDisplayName(img.name || '') || 'Design'} - ${cat.title || cat.name || 'Category'}`,
        category: cat.title || cat.name || 'Related Design',
        categoryId: String(cat.id || ''),
        sourceType: 'category' as const,
        sourceLabel: 'Category Match'
      }))
    )
    .filter((image) => Boolean(image.url))
    .slice(0, 8);
};

// Load different design variations for room type
const getDesignVariations = (designs: string[], allDesigns: any[]): ShowroomDisplayImage[] => {
  const variations: Map<string, ShowroomDisplayImage> = new Map();

  designs.forEach((designId) => {
    const design = allDesigns.find((d: any) => d.id === designId);
    if (!design) return;

    const baseUrl = normalizeAssetUrl(design.previewImage || design.imageUrl || (Array.isArray(design.images) ? design.images[0] : '') || '');
    if (!baseUrl) return;

    const designName = resolveDesignDisplayName(design, {
      imageUrl: baseUrl,
      categoryId: design.categoryId,
      fallback: 'Design Variation'
    });

    variations.set(designId, {
      url: baseUrl,
      name: designName,
      category: String(design.category || 'Room Design'),
      categoryId: design.categoryId || '',
      sourceType: 'design',
      sourceLabel: 'Design Variation'
    });

    // Also add any additional images from the design if available
    if (Array.isArray(design.images) && design.images.length > 1) {
      design.images.slice(1, 3).forEach((imgUrl: string, idx: number) => {
        const alterUrl = normalizeAssetUrl(imgUrl);
        if (alterUrl && alterUrl !== baseUrl) {
          variations.set(`${designId}-alt-${idx}`, {
            url: alterUrl,
            name: `${designName} (Variation ${idx + 1})`,
            category: String(design.category || 'Room Design'),
            categoryId: design.categoryId || '',
            sourceType: 'design',
            sourceLabel: 'Design Variation'
          });
        }
      });
    }
  });

  return Array.from(variations.values());
};

const getShowroomDisplayImages = (room: any, allDesigns: any[], categories: Category[]): ShowroomDisplayImage[] => {
  if (!room) return [];

  const roomMatchKeys = getShowroomRoomMatchKeys(room?.type || '', room?.name || '');
  const explicitRelatedImages = getRoomRelatedImages(room as any).map((item) => ({
    url: item.url,
    name: item.name,
    category: item.category,
    categoryId: item.categoryId || '',
    sourceType: 'manual' as const,
    sourceLabel: 'Saved Related Image'
  }));

  const toShowroomImage = (design: any) => {
    const imageUrl = normalizeAssetUrl(
      design?.previewImage || design?.imageUrl || (Array.isArray(design?.images) ? design.images[0] : '') || ''
    );
    if (!imageUrl) return null;
    return {
      url: imageUrl,
      name: resolveDesignDisplayName(design, {
        imageUrl,
        categoryId: design.categoryId,
        fallback: 'Design'
      }),
      category: String(design.category || 'Related Design'),
      categoryId: design.categoryId || '',
      sourceType: 'design' as const,
      sourceLabel: 'Matched Design'
    };
  };

  let displayImages: ShowroomDisplayImage[] = [];

  if (explicitRelatedImages.length > 0) {
    displayImages.push(...explicitRelatedImages);
  }

  const designVariations = getDesignVariations(room?.designs || [], allDesigns);
  if (designVariations.length > 0) {
    displayImages.push(...designVariations.slice(0, 6));
  }

  const videoImages = getVideoRelatedImages(room?.type || '', room?.name || '');
  if (videoImages.length > 0) {
    displayImages.push(...videoImages);
  }

  const categoryDesigns = getCategorySpecificDesigns(room?.type || '', room?.name || '');
  if (categoryDesigns.length > 0) {
    displayImages.push(...categoryDesigns);
  }

  if (displayImages.length < 4) {
    const matchedDesigns = allDesigns
      .filter((design) => {
        const categoryKey = normalizeKey(String(design.category || ''));
        const categoryIdKey = normalizeKey(String(design.categoryId || ''));
        const titleKey = normalizeKey(String(design.title || ''));
        return roomMatchKeys.some((key) =>
          key && (categoryKey.includes(key) || categoryIdKey.includes(key) || titleKey.includes(key))
        );
      })
      .map((design) => toShowroomImage(design))
      .filter(Boolean) as ShowroomDisplayImage[];

    displayImages.push(...matchedDesigns.slice(0, 6));
  }

  if (displayImages.length === 0) {
    const scoredCategories = categories
      .map((cat) => {
        const catKey = normalizeKey(cat.title || cat.name || cat.id || '');
        const score = roomMatchKeys.reduce((acc, key) => {
          if (!key) return acc;
          if (catKey === key) return acc + 3;
          if (catKey.includes(key) || key.includes(catKey)) return acc + 2;
          return acc;
        }, 0);
        return { cat, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.cat);

    const fallbackScopedCategories = scoredCategories.length > 0
      ? scoredCategories
      : categories.filter((cat) => {
        const catKey = normalizeKey(cat.title || cat.name || cat.id || '');
        return roomMatchKeys.some((key) => key && (catKey.includes(key) || key.includes(catKey)));
      });

    displayImages = fallbackScopedCategories
      .flatMap((cat) =>
        (cat.images || []).slice(0, 4).map((img) => ({
          url: normalizeAssetUrl(img.url),
          name: sanitizeDisplayName(img.name || '') || cat.title || cat.name || 'Design',
          category: `ðŸ“‚ ${cat.title || cat.name || 'Related Design'}`,
          categoryId: cat.id || '',
          sourceType: 'category' as const,
          sourceLabel: 'Category Fallback'
        }))
      )
      .filter((img) => Boolean(img.url));

    if (displayImages.length === 0 && categories.length > 0) {
      displayImages = categories
        .filter((cat) => cat.images && cat.images.length > 0)
        .slice(0, 3)
        .flatMap((cat) =>
          (cat.images || []).slice(0, 3).map((img) => ({
            url: normalizeAssetUrl(img.url),
            name: sanitizeDisplayName(img.name || '') || cat.title || cat.name || 'Design',
            category: `ðŸ“‚ ${cat.title || cat.name || 'Related Design'}`,
            categoryId: cat.id || '',
            sourceType: 'category' as const,
            sourceLabel: 'General Category'
          }))
        )
        .filter((img) => Boolean(img.url));
    }
  }

  const seenUrls = new Set<string>();
  return displayImages
    .filter((img) => {
      if (seenUrls.has(img.url)) return false;
      seenUrls.add(img.url);
      return true;
    })
    .slice(0, 12);
};

