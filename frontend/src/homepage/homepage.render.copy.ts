// @ts-nocheck
// Homepage code copy from main.ts.
// This is a reference copy only and is intentionally not wired into runtime.
// Source of truth remains main.ts.

const SPIDEY_HERO_IMAGE_PATHS = [
  '/spidey/images/1.png',
  '/spidey/images/best-interior-websites-taylor-howes.webp',
  '/spidey/images/classroom.jpg',
  '/spidey/images/garden (1).jpg',
  '/spidey/images/gym (10).jpg',
  '/spidey/images/home theatre (1).jpg',
  '/spidey/images/kids-bedroom5.jpg',
  '/spidey/images/kids-bedroom9.jpg',
  '/spidey/images/pooja-room7.jpg',
  '/spidey/images/swimmingpool11.jpg',
  '/spidey/images/white-logo-spiderman.png'
];

const buildSpideyHeroSlides = () => {
  const palette = ['#c54542', '#266598', '#1f2a3b', '#0a6e7c', '#1a1040', '#5a3e8d', '#2d2218'];
  const imagePaths = SPIDEY_HERO_IMAGE_PATHS.filter((imagePath) => !/logo/i.test(imagePath));

  const inferCategoryName = (imagePath: string) => {
    const name = (imagePath.split('/').pop() || '').toLowerCase();
    if (name.includes('kids')) return 'Kids Bedroom';
    if (name.includes('gym')) return 'Gym';
    if (name.includes('classroom')) return 'Classroom';
    if (name.includes('garden')) return 'Garden';
    if (name.includes('pooja')) return 'Pooja Room';
    if (name.includes('swimmingpool') || name.includes('pool')) return 'Swimming Pool';
    if (name.includes('theatre')) return 'Home Theatre';
    return 'Premium Interiors';
  };

  return imagePaths.map((imagePath, index) => {
    const categoryName = inferCategoryName(imagePath);
    return {
      label: categoryName,
      image: imagePath,
      titleTop: categoryName.toUpperCase(),
      bg: palette[index % palette.length]
    };
  });
};

const getHomeCategoryImages = (categories: Category[]) => {
  return categories.flatMap((cat) =>
    (cat.images || []).map((img, index) => ({
      url: img.url,
      name: img.name,
      categoryId: cat.id,
      categoryName: cat.title || cat.name || cat.id,
      index
    }))
  );
};

const renderHome = () => {
  const navItems = renderNavItems();
  const homeCategoriesRaw = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const homeCategories = getCustomerVisibleCategories(homeCategoriesRaw);
  const homeCategoryImages = getHomeCategoryImages(homeCategories);
  const featuredImages = homeCategoryImages.slice(0, 16);
  const workspaceImages = homeCategoryImages.slice(6, 16);
  const workspaceShowcase = workspaceImages.length > 0 ? workspaceImages : featuredImages.slice(0, 10);
  const homeFeatures = [
    { title: 'AR Walkthroughs', desc: 'Explore rooms in 3D before build-out.' },
    { title: 'Material Library', desc: 'Premium finishes curated for Indian homes.' },
    { title: 'AI Concepts', desc: 'Instant moodboards and design directions.' },
    { title: 'Design Concierge', desc: 'Book a designer and track progress.' }
  ];
  const homepageFeedbackVideos = (state.portfolioContent?.feedbackVideos || [])
    .filter((video: any) => Boolean(video?.url) && video?.showOnHomepage !== false);
  const publicFeedbackItems = (() => {
    const merged = [...(state.customer.feedbacks || []), ...(state.feedbacks || [])]
      .filter((item: any) => item && item.comment);
    const byId = new Map<string, any>();
    merged.forEach((item: any, idx: number) => {
      const key = String(item.id || `${item.userId || 'guest'}-${item.createdAt || idx}`);
      if (!byId.has(key)) byId.set(key, item);
    });
    return Array.from(byId.values())
      .sort((a: any, b: any) => {
        const ta = new Date(a?.createdAt || 0).getTime();
        const tb = new Date(b?.createdAt || 0).getTime();
        return tb - ta;
      })
      .slice(0, 8);
  })();
  const slides = buildSpideyHeroSlides();
  const btnTextColor = getTextColorForBackground(state.theme.primaryColor);
  const allCustomerPackages = getCustomerDisplayPackages();
  const homepagePackages = allCustomerPackages
    .filter((pkg: any) => {
      const text = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.description || '')} ${String(pkg?.category || '')} ${String(pkg?.type || '')}`.toLowerCase();
      return /\b(\d+\s*bhk|full\s*home|apartment|villa)\b/.test(text) || Number(pkg?.bhk || 0) > 0;
    })
    .slice(0, 18);
  const packageCards = homepagePackages.length > 0 ? homepagePackages : allCustomerPackages.slice(0, 12);

  return `
    <section class="spidey-home">
      <nav class="spidey-nav">
        <div class="spidey-logo">
          <img src="/spidey/images/white-logo-spiderman.png" alt="AR Interia logo" />
          <div class="brand">AR Interia</div>
        </div>
        <div class="spidey-menu">
          <i class="ri-bar-chart-horizontal-line"></i>
        </div>
        <div class="spidey-nav-links">
          ${navItems
      .map(
        (item) => `
            <button
              data-action="nav"
              data-tab="${item.id}"
              class="${state.activeTab === item.id ? 'active' : ''}"
            >
              ${item.label}
            </button>
          `
      )
      .join('')}
          <button data-action="open-calculator" class="px-5 py-2 rounded-full bg-amber-400 text-slate-900 font-bold text-sm hover:bg-amber-500 transition shadow-lg active:scale-95 ml-2 hidden md:block">Price Calculator</button>
        </div>
        <button class="spidey-search" data-action="nav" data-tab="gallery" aria-label="Search designs">
          <i class="ri-search-line"></i>
        </button>
      </nav>

      <div class="spidey-container">
        <div class="swiper spidey-thumbs">
          <div class="swiper-wrapper">
            ${slides
      .map(
        (slide) => `
              <div class="swiper-slide">
                <div class="thumb-label">${escapeHtml(slide.label)}</div>
                <img src="${slide.image}" alt="${escapeHtml(slide.titleTop)}" class="motion-3d" data-motion3d="true" />
              </div>
            `
      )
      .join('')}
          </div>
        </div>
        <div class="swiper spidey-main-slider">
          <div class="swiper-wrapper">
            ${slides
      .map(
        (slide, index) => `
              <div class="swiper-slide ${index === 0 ? 'spidey-intro' : ''}" style="background: ${slide.bg};">
                <img src="${slide.image}" alt="${escapeHtml(slide.titleTop)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} class="motion-3d" data-motion3d="true" />
                <div class="spidey-text">
                  <h2>${slide.titleTop}</h2>
                </div>
                <div class="spidey-emblem">
                  <img src="/spidey/images/pink-logo-spiderman.png" alt="AR Interia emblem" />
                </div>
              </div>
            `
      )
      .join('')}
          </div>
          <div class="swiper-button-next"><i class="ri-arrow-right-s-fill"></i></div>
          <div class="swiper-button-prev"><i class="ri-arrow-left-s-fill"></i></div>
        </div>
      </div>

      ${(() => {
      const activeAnnouncements = getActiveAnnouncements();
      if (activeAnnouncements.length === 0) return '';
      return `
      <div class="mt-4 px-6">
        <div class="max-w-6xl mx-auto space-y-2">
          ${activeAnnouncements.filter((a: any) => !a.location || a.location === 'homepage' || a.location === 'both').map((a: any) => `
          <div class="spidey-panel p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
            <div class="flex items-start gap-3">
              <div class="text-2xl">${getAnnouncementEmoji(a)}</div>
              <div class="flex-1">
                <div class="font-bold text-[color:var(--primary)]">${escapeHtml(a.title)}</div>
                <div class="text-sm text-slate-600 mt-1">${escapeHtml(a.message)}</div>
                <div class="text-xs text-slate-400 mt-2">Valid until ${new Date(a.endDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      `;
    })()}

      <div class="mt-6 px-6">
        <div class="max-w-6xl mx-auto spidey-panel p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="text-xs uppercase tracking-[0.3em] text-slate-400">Work Spaces</div>
              <h4 class="text-2xl font-display font-bold text-[color:var(--primary)]">Focused Design Picks</h4>
            </div>
            <button data-action="nav" data-tab="categories" class="text-xs font-semibold text-[color:var(--accent)] cursor-pointer hover:underline">Explore Category</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            ${workspaceShowcase
      .map((image) => {
        const design = getDesignForImage(image.categoryId, image.index || 0, image.url);
        const displayName = resolveDesignDisplayName(design, {
          imageName: image.name,
          imageUrl: image.url,
          categoryId: image.categoryId,
          fallback: 'Design'
        });
        return `
              <button
                type="button"
                data-action="open-category-image"
                data-image-url="${escapeHtml(image.url)}"
                data-image-name="${escapeHtml(displayName)}"
                data-image-cost="${String(getDesignAmount(design as any))}"
                data-category-name="${escapeHtml(image.categoryName || '')}"
                data-category-id="${escapeHtml(image.categoryId || '')}"
                data-design-id="${escapeHtml(design?.id || '')}"
                class="relative overflow-hidden rounded-2xl border border-black/5"
              >
                <img src="${escapeHtml(image.url)}" alt="${escapeHtml(displayName)}" class="motion-3d w-full h-24 object-cover" data-motion3d="true" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              </button>
            `;
      })
      .join('')}
          </div>
        </div>
      </div>

      <div class="mt-10 px-6">
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          <div class="spidey-panel p-6">
            <div class="text-xs uppercase tracking-[0.3em] text-slate-400">Studio Highlights</div>
            <h3 class="text-3xl font-display font-bold text-[color:var(--primary)] mt-3 mb-4">Interactive Design Suite</h3>
            <p class="text-slate-500 mb-6">Switch between 2D inspiration and 3D previews, then book a consultation in seconds.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${homeFeatures
      .map((item) => `
                <div class="p-4 rounded-2xl border border-black/5 bg-white">
                  <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(item.title)}</div>
                  <div class="text-xs text-slate-500 mt-1">${escapeHtml(item.desc)}</div>
                </div>
              `)
      .join('')}
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
              <button data-action="nav" data-tab="categories" class="spidey-cta cursor-pointer">Explore Category</button>
              <button data-action="nav" data-tab="contact" class="px-6 py-3 rounded-2xl border border-[color:var(--primary)] text-[color:var(--primary)] font-semibold cursor-pointer hover:bg-[color:var(--primary)]/10 transition-colors">Book Consultation</button>
            </div>
          </div>
          <div class="spidey-panel p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-xs uppercase tracking-[0.3em] text-slate-400">Featured Designs</div>
                <h4 class="text-2xl font-display font-bold text-[color:var(--primary)]">Latest Inspirations</h4>
              </div>
              <button data-action="nav" data-tab="gallery" data-category="all" class="text-xs font-semibold text-[color:var(--accent)] cursor-pointer hover:underline">View All</button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              ${featuredImages
      .map((image) => {
        const design = getDesignForImage(image.categoryId, image.index || 0, image.url);
        const displayName = resolveDesignDisplayName(design, {
          imageName: image.name,
          imageUrl: image.url,
          categoryId: image.categoryId,
          fallback: 'Design'
        });
        return `
                <button
                  type="button"
                  data-action="open-category-image"
                  data-image-url="${escapeHtml(image.url)}"
                  data-image-name="${escapeHtml(displayName)}"
                  data-image-cost="${String(getDesignAmount(design as any))}"
                  data-category-name="${escapeHtml(image.categoryName || '')}"
                  data-category-id="${escapeHtml(image.categoryId || '')}"
                  data-design-id="${escapeHtml(design?.id || '')}"
                  class="relative overflow-hidden rounded-2xl border border-black/5"
                >
                  <img src="${escapeHtml(image.url)}" alt="${escapeHtml(displayName)}" class="motion-3d w-full h-28 object-cover" data-motion3d="true" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                </button>
              `;
      })
      .join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="spidey-socials">
        <a href="https://facebook.com" target="_blank" rel="noreferrer">FB</a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer">YT</a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">TW</a>
      </div>
    </section>
  `;
};
