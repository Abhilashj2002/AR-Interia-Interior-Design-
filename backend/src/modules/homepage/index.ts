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

      <!-- Company Stats Section -->
      <div class="mt-10 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="spidey-panel p-6 text-center">
              <div class="text-3xl font-bold text-[color:var(--primary)]">150+</div>
              <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Projects Completed</div>
            </div>
            <div class="spidey-panel p-6 text-center">
              <div class="text-3xl font-bold text-[color:var(--primary)]">4.9/5</div>
              <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Client Rating</div>
            </div>
            <div class="spidey-panel p-6 text-center">
              <div class="text-3xl font-bold text-[color:var(--primary)]">25+</div>
              <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Design Awards</div>
            </div>
            <div class="spidey-panel p-6 text-center">
              <div class="text-3xl font-bold text-[color:var(--primary)]">8+</div>
              <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Cities Served</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Founder & About Section -->
      <div class="mt-10 px-6">
        <div class="max-w-6xl mx-auto spidey-panel p-8">
          <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-white text-4xl font-bold mx-auto lg:mx-0">AJ</div>
            <div>
              <div class="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)] mb-2">Founder & Creative Director</div>
              <h3 class="text-3xl font-display font-bold text-[color:var(--primary)] mb-3">Abhilash J</h3>
              <p class="text-slate-500 leading-relaxed mb-4">With over 12 years of experience in luxury interior design, Abhilash leads AR Interia with a vision to merge artisanal craftsmanship with cutting-edge spatial technology. From premium residential spaces to high-end hospitality projects, his design philosophy centers on creating timeless interiors that feel effortless and deeply personal.</p>
              <div class="flex flex-wrap gap-3">
                <span class="px-3 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-xs font-semibold">12+ Years Experience</span>
                <span class="px-3 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-xs font-semibold">150+ Projects</span>
                <span class="px-3 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-xs font-semibold">Award Winning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Section -->
      <div class="mt-10 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-8">
            <div class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">What We Offer</div>
            <h3 class="text-3xl font-display font-bold text-[color:var(--primary)]">Our Services</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button data-action="nav" data-tab="ai-studio" class="spidey-panel p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-4xl mb-4">ðŸ’¡</div>
              <h4 class="text-lg font-bold text-[color:var(--primary)] mb-2">Design Studio</h4>
              <p class="text-sm text-slate-500">AI-powered design variants and instant room concepts. <span class='font-semibold text-[color:var(--primary)]'>Login required.</span></p>
              <div class="text-xs font-semibold text-[color:var(--accent)] mt-3">Use Design Studio â†’</div>
            </button>
            <button data-action="nav" data-tab="services" class="spidey-panel p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-4xl mb-4">ðŸ“±</div>
              <h4 class="text-lg font-bold text-[color:var(--primary)] mb-2">Design Preview</h4>
              <p class="text-sm text-slate-500">Experience your future space with realistic previews before a single brick is laid.</p>
              <div class="text-xs font-semibold text-[color:var(--accent)] mt-3">View service details â†’</div>
            </button>
            <button data-action="nav" data-tab="services" class="spidey-panel p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-4xl mb-4">ðŸ—ï¸</div>
              <h4 class="text-lg font-bold text-[color:var(--primary)] mb-2">Turnkey Execution</h4>
              <p class="text-sm text-slate-500">End-to-end design, material curation, and build management delivered in one seamless plan.</p>
              <div class="text-xs font-semibold text-[color:var(--accent)] mt-3">View service details â†’</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Packages Section -->
      <div class="mt-10 px-6">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-8">
            <div class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">ðŸ  Complete Home Solutions</div>
            <h3 class="text-3xl font-display font-bold text-[color:var(--primary)]">Our Packages</h3>
            <p class="text-slate-500 mt-2">Choose from our curated interior design packages at exclusive prices</p>
          </div>
          
          <!-- Package Type Tabs -->
          <div class="flex flex-wrap justify-center gap-3 mb-8">
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 1, true)">ðŸ¢ 1BHK</button>
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 2, true)">ðŸ¢ 2BHK</button>
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 3, true)">ðŸ¢ 3BHK</button>
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 4, true)">ðŸ¢ 4BHK</button>
            <button class="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('type', 'Villa')">ðŸ¡ Villa</button>
            <button class="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('type', 'Apartment', true)">ðŸ¬ Apartment</button>
            <button class="px-4 py-2 rounded-full bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300" onclick="window.applyServerPackageFilter?.('all')">ðŸ“‹ All</button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${packageCards.map((pkg: any) => {
              const pkgType = String(pkg.type || (pkg.bhk ? 'Apartment' : 'Package'));
              const bhkFromTextMatch = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')}`.match(/(\d+)\s*BHK/i);
              const bhkCount = Number(pkg?.bhk || (bhkFromTextMatch ? Number(bhkFromTextMatch[1]) : 0));
              const bhkLabel = bhkCount > 0 ? `${bhkCount}BHK` : '';
              const pkgFilterType = bhkLabel || pkgType;
              const pkgBadge = pkgType === 'Villa' ? 'ðŸ¡ Villa' : (bhkLabel ? `ðŸ¢ ${bhkLabel}` : 'ðŸ“¦ Package');
              return `
              <div class="rounded-2xl border border-black/5 overflow-hidden bg-white hover:shadow-xl transition-all cursor-pointer has-3d-tilt" data-action="open-package-modal" data-package-id="${pkg.id}" data-package-type="${pkgFilterType}" data-package-family="${pkgType}" style="display: ">
                <div class="h-48 overflow-hidden bg-slate-100 relative">
                  <div class="absolute inset-0 w-full h-full">
                    <img src="${escapeHtml(getPackageBackgroundImage(pkg))}" alt="${escapeHtml(pkg.name)} background" loading="lazy" decoding="async" class="w-full h-full object-cover opacity-60" style="z-index:1;" onerror="this.src='/category/Living room/living1.jpg'" />
                    <img src="${escapeHtml(getPackageDisplayImage(pkg))}" alt="${escapeHtml(pkg.name)}" loading="lazy" decoding="async" class="w-2/3 h-2/3 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="z-index:2;" onerror="this.src='/category/Living room/living1.jpg'" />
                  </div>
                  <div class="absolute top-3 left-3 px-3 py-1 rounded-full ${pkgType === 'Villa' ? 'bg-emerald-600' : 'bg-blue-600'} text-white text-xs font-bold">${pkgBadge}</div>
                  <div class="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">20+ Premium Designs</div>
                  <div class="absolute top-3 right-3 px-3 py-1 rounded-full bg-[color:var(--accent)] text-white text-xs font-bold">SAVE â‚¹${((pkg.originalPrice || 0) - (pkg.discountedPrice || 0)).toLocaleString()}</div>
                </div>
                <div class="p-4 space-y-3">
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">${escapeHtml(pkg.category || 'Package')}</div>
                  <h3 class="text-lg font-semibold text-[color:var(--primary)]">${escapeHtml(pkg.name)}</h3>
                  <p class="text-sm text-slate-600 line-clamp-2">${escapeHtml(pkg.description)}</p>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xs text-slate-400 line-through">â‚¹${(pkg.originalPrice || 0).toLocaleString()}</span>
                      <div class="text-xl font-bold text-[color:var(--accent)]">â‚¹${(pkg.discountedPrice || 0).toLocaleString()}</div>
                    </div>
                    <button data-action="quote-package" data-package="${pkg.id}" data-package-name="${escapeHtml(pkg.name)}" style="color: ${btnTextColor}" class="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-xs font-semibold hover:opacity-90 transition shadow-lg">Get Quote</button>
                  </div>
                </div>
              </div>
            `}).join('')}
          </div>
          <div class="mt-8 text-center">
            <button data-action="nav" data-tab="services" class="px-8 py-4 rounded-2xl bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">View All 36 Packages</button>
          </div>
        </div>
      </div>

      <!-- Customer Testimonials Section -->
      <div class="mt-10 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-8">
            <div class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">What Our Clients Say</div>
            <h3 class="text-3xl font-display font-bold text-[color:var(--primary)]">Customer Feedback</h3>
          </div>
          <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            ${(publicFeedbackItems.length > 0 ? publicFeedbackItems : [
      { userName: 'Priya Sharma', rating: 5, comment: 'AR Interia transformed our villa beyond our imagination. The 3D preview was spot-on and execution quality was excellent.', createdAt: new Date().toISOString() },
      { userName: 'Rahul Menon', rating: 5, comment: 'The AR walkthrough helped us choose confidently before execution. Great process and clear communication.', createdAt: new Date().toISOString() },
      { userName: 'Sneha Reddy', rating: 5, comment: 'Luxury finish, practical planning, and strong attention to detail from start to finish.', createdAt: new Date().toISOString() }
    ]).map((feedback: any) => `
              <div class="spidey-panel p-6 h-full flex flex-col">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-9 h-9 rounded-full bg-[color:var(--primary)] text-white text-xs font-bold flex items-center justify-center">
                    ${escapeHtml(getInitials(String(feedback.userName || feedback.user?.name || 'A Valued Client')))}
                  </div>
                  <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(String(feedback.userName || feedback.user?.name || 'A Valued Client'))}</div>
                </div>
                <div class="flex gap-1 mb-3 text-amber-400">${'â˜…'.repeat(Math.max(1, Math.min(5, Number(feedback.rating || 5))))}</div>
                <p class="text-sm text-slate-500 italic mb-4 flex-1">"${escapeHtml(String(feedback.comment || 'Great service and design quality.'))}"</p>
                <div class="text-xs text-slate-400">${formatMonthYearDate(feedback.createdAt || Date.now())}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      ${homepageFeedbackVideos.length > 0 ? `
      <div class="mt-10 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-8">
            <div class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">From Portfolio</div>
            <h3 class="text-3xl font-display font-bold text-[color:var(--primary)]">Feedback Videos</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${homepageFeedbackVideos.map((video: any) => `
              <div class="spidey-panel p-3">
                <div class="aspect-video rounded-xl overflow-hidden bg-black">
                  ${renderVideoEmbedOrTag(video.url, 'w-full h-full object-contain', video.title || 'Client Feedback')}
                </div>
                <div class="text-sm font-semibold text-[color:var(--primary)] mt-2">${escapeHtml(video.title || 'Client Feedback')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      ` : ''}

      <section class="py-20 px-6">
        <div class="max-w-7xl mx-auto">
          ${(() => {
      const famousDesigners = (state.portfolioContent?.designers || []).filter((designer) => designer.name || designer.photo || designer.famousDesign);
      if (famousDesigners.length === 0) return '';
      return `
            <div class="mt-14">
              <h3 class="text-3xl font-display font-bold text-center text-[color:var(--primary)] mb-8">Famous Designers</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${famousDesigners.map((designer) => `
                  <div class="spidey-panel p-5 flex items-center gap-4">
                    <img src="${escapeHtml(designer.photo || '/hero-bg.webp')}" alt="${escapeHtml(designer.name || 'Designer')}" class="w-20 h-20 rounded-2xl object-cover border border-black/10" />
                    <div>
                      <div class="text-lg font-semibold text-[color:var(--primary)]">${escapeHtml(designer.name || 'Designer')}</div>
                      <div class="text-xs uppercase tracking-wider text-slate-400">${escapeHtml(designer.role || 'Designer')}</div>
                      <div class="text-sm text-[color:var(--accent)] mt-1">${escapeHtml(designer.famousDesign || 'Featured Signature Design')}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
    })()}
        </div>
      </section>

      <!-- CTA Section -->
      <div class="mt-10 mb-10 px-6">
        <div class="max-w-6xl mx-auto spidey-panel p-10 text-center" style="background: linear-gradient(135deg, var(--primary), var(--accent));">
          <h3 class="text-3xl font-display font-bold text-white mb-3">Ready to Transform Your Space?</h3>
          <p class="text-white/80 mb-6 max-w-2xl mx-auto">Let our expert team bring your vision to life with cutting-edge 3D design technology.</p>
          <div class="flex flex-wrap justify-center gap-4">
            <button data-action="nav" data-tab="contact" class="px-8 py-3 bg-white text-[color:var(--primary)] font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">ðŸš€ Book Consultation</button>
            <button data-action="nav" data-tab="portfolio" class="px-8 py-3 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-all">âœ¨ Explore Portfolio</button>
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

// Expose legacy homepage renderer for feature-wrapper delegation.
(globalThis as any).renderHome = renderHome;

// --- Frontend page layer: Gallery -------------------------------------------
const renderGallery = () => {
  const categories = getCustomerVisibleCategories(state.customer.categories || []);

  const findFirstCategory = () => (categories.length > 0 ? categories[0].id : 'all');

  // Force default category if 'all' or missing
  let galleryCategoryId = state.customer.galleryCategoryId;
  if (!galleryCategoryId || galleryCategoryId === 'all') {
    galleryCategoryId = findFirstCategory();
    state.customer.galleryCategoryId = galleryCategoryId;
  }

  const hasSelectedCategory = categories.some((cat) => cat.id === galleryCategoryId);
  if (!hasSelectedCategory) {
    galleryCategoryId = findFirstCategory();
    state.customer.galleryCategoryId = galleryCategoryId;
  }

  let galleryDesigns = getGalleryDesignCandidates(galleryCategoryId);
  const selectedCategory = categories.find((cat) => cat.id === galleryCategoryId) || null;
  const selectedCategoryImages = selectedCategory?.images || [];
  const resolveGalleryCardData = (design: DesignModel, index: number) => {
    const designFileKey = getFilenameKey(design.previewImage || (design.images && design.images[0]) || '');
    const matchedImage = selectedCategoryImages.find((img: any) => {
      const byFilename = String((img as any).filename || '').toLowerCase();
      const byUrlFile = getFilenameKey(String(img.url || ''));
      return Boolean(designFileKey && (designFileKey === byFilename || designFileKey === byUrlFile));
    }) || selectedCategoryImages[index] || null;

    const imageUrl = String(matchedImage?.url || design.previewImage || (design.images && design.images[0]) || '');
    const displayName = resolveDesignDisplayName(design, {
      imageName: matchedImage?.name,
      imageUrl,
      categoryId: design.categoryId,
      categoryName: selectedCategory?.title || selectedCategory?.name,
      fallback: 'Design'
    });

    return { imageUrl, displayName };
  };
  const categoryLabelByKey = new Map<string, string>();
  categories.forEach((cat) => {
    const label = cat.title || cat.name || cat.id;
    getCategoryMatchKeySet(cat.id || '', cat.title || '', cat.name || '').forEach((key) => {
      if (key && !categoryLabelByKey.has(key)) categoryLabelByKey.set(key, label);
    });
  });
  const getDesignCategoryLabel = (design: DesignModel) => {
    const designKeys = getCategoryMatchKeySet(design.categoryId || '', design.category || '');
    for (const key of designKeys) {
      const label = categoryLabelByKey.get(key);
      if (label) return label;
    }
    return design.category || 'Uncategorized';
  };
  /* 
   * selectedCategoryImages and allCategoryImages logic removed as it relied on empty category.images.
   * We now use galleryDesigns directly for the grid.
   */

  const selectedModel = galleryDesigns.find((model) => model.id === state.selectedModelId) || null;
  const galleryCards = selectedCategoryImages.length > 0
    ? selectedCategoryImages.map((image: any, index: number) => {
      const imageUrl = String(image?.url || '');
      const imageFileKey = getFilenameKey(imageUrl);
      const matchedDesign = galleryDesigns.find((design) => {
        const designFileKey = getFilenameKey(design.previewImage || (design.images && design.images[0]) || '');
        return Boolean(imageFileKey && designFileKey && imageFileKey === designFileKey);
      }) || galleryDesigns[index] || null;
      const displayName = resolveDesignDisplayName(matchedDesign, {
        imageName: image?.name,
        imageUrl,
        categoryId: selectedCategory?.id || galleryCategoryId,
        categoryName: selectedCategory?.title || selectedCategory?.name,
        fallback: 'Design'
      });
      return {
        imageUrl,
        displayName,
        design: matchedDesign,
        designCost: formatCurrency(getDesignAmount(matchedDesign as any))
      };
    })
    : galleryDesigns.map((design, index) => {
      const card = resolveGalleryCardData(design, index);
      return {
        imageUrl: card.imageUrl,
        displayName: card.displayName,
        design,
        designCost: formatCurrency(getDesignAmount(design as any))
      };
    });
  const totalImages = categories.reduce((sum, cat) => sum + (cat.images?.length || 0), 0); // This might be 0 now, maybe we should count designs?
  const totalDesigns = (state.customer.designs || []).length || getDesigns().length;

  return `
    <div class="spidey-page">
      <section class="spidey-hero">
        <div class="spidey-hero-inner">
          <div class="spidey-kicker">Gallery Vault</div>
          <div class="spidey-title">Design Archive</div>
          <div class="spidey-subtitle">Curate, compare, and preview every room design with cinematic clarity.</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="spidey-panel-dark p-4">
              <div class="text-xs uppercase tracking-[0.3em] text-white/60">Visible Items</div>
              <div class="text-2xl font-bold">${galleryCards.length}</div>
            </div>
            <div class="spidey-panel-dark p-4">
              <div class="text-xs uppercase tracking-[0.3em] text-white/60">Categories</div>
              <div class="text-2xl font-bold">${categories.length}</div>
            </div>
            <div class="spidey-panel-dark p-4">
              <div class="text-xs uppercase tracking-[0.3em] text-white/60">Total Designs</div>
              <div class="text-2xl font-bold">${totalDesigns}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="spidey-grid lg:grid-cols-[1fr_1.4fr]">
        <div class="spidey-panel p-6 space-y-6">
          <div>
            <div class="text-xs uppercase tracking-[0.3em] text-slate-500">Search</div>
            <input
              data-bind="searchQuery"
              value="${escapeHtml(state.searchQuery)}"
              placeholder="Search furniture..."
              class="w-full mt-3 px-4 py-3 rounded-2xl border border-black/10"
            />
          </div>
          <div>
            <div class="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Categories</div>
            <div class="flex flex-wrap gap-2">
              ${categories
      .map((cat) => {
        const label = cat.title || cat.name || cat.id;
        return `
              <button data-action="set-gallery-category" data-category="${escapeHtml(cat.id)}" class="spidey-chip ${galleryCategoryId === cat.id ? 'active' : ''}">
                ${escapeHtml(label)}
              </button>
            `;
      })
      .join('')}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Design Shelf</div>
            <div class="space-y-3 max-h-[520px] overflow-y-auto pr-2 custom-scroll">
              ${galleryCards.length
      ? galleryCards
        .map(
          (card) => {
            const model = card.design;
            const itemId = model?.id || '';
            const categoryLabel = selectedCategory?.title || selectedCategory?.name || (model ? getDesignCategoryLabel(model) : 'Category');
            const resolvedAmount = model ? getDesignAmount(model as any) : parseAmountValue(card.designCost);
            const priceLabel = resolvedAmount > 0 ? formatCurrency(resolvedAmount) : '';
            return `
              <button ${itemId ? `data-action="select-model" data-id="${itemId}"` : `type="button" data-action="open-category-image" data-image-url="${escapeHtml(card.imageUrl)}" data-image-name="${escapeHtml(card.displayName)}" data-image-cost="${String(resolvedAmount)}" data-category-name="${escapeHtml(selectedCategory?.title || selectedCategory?.name || '')}" data-design-id=""`} class="w-full text-left p-4 rounded-2xl border ${itemId && state.selectedModelId === itemId ? 'border-[color:var(--accent)] bg-white shadow-md' : 'border-transparent bg-white/70'}">
                    <div class="flex gap-4 items-center">
                      ${renderImageThumb(card.imageUrl, card.displayName, 'w-16 h-16', 'text-[10px] text-slate-500')}
                      <div>
                        <div class="font-semibold text-sm text-slate-800">${escapeHtml(card.displayName)}</div>
                        <div class="text-[10px] uppercase tracking-[0.2em] text-slate-400">${escapeHtml(categoryLabel)}</div>
                        ${priceLabel ? `<div class="text-sm font-bold text-[color:var(--accent)] mt-1">${escapeHtml(priceLabel)}</div>` : ''}
                      </div>
                    </div>
                  </button>
                `;
          }
        )
        .join('')
      : '<div class="py-16 text-center text-slate-400 italic">No items found for this category.</div>'
    }
            </div>
          </div>
        </div>

        <div class="spidey-panel p-6">
          ${galleryCards.length > 0
      ? `
            <div>
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-display font-bold text-[color:var(--primary)]">${escapeHtml(selectedCategory?.title || selectedCategory?.name || 'Category')}</h2>
                  <p class="text-slate-500">${galleryCards.length} items</p>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${galleryCards
        .map((card) => {
          const imageUrl = card.imageUrl;
          const displayName = card.displayName;
          const designCost = card.designCost;
          const designId = card.design?.id || '';

          return `
                  <div class="spidey-card has-3d-tilt group relative overflow-hidden aspect-square flex flex-col">
                    <button
                      type="button"
                      data-action="open-category-image"
                      data-image-url="${escapeHtml(imageUrl)}"
                      data-image-name="${escapeHtml(displayName)}"
                      data-image-cost="${String(getDesignAmount(card.design as any))}"
                      data-category-name="${escapeHtml(selectedCategory?.title || selectedCategory?.name || '')}"
                      data-design-id="${escapeHtml(designId)}"
                      class="w-full flex-1 relative overflow-hidden"
                    >
                      <img
                        src="${escapeHtml(imageUrl)}"
                        alt="${escapeHtml(displayName)}"
                        data-action="open-3d-view-image"
                        data-image-url="${escapeHtml(imageUrl)}"
                        data-motion3d="${card.design?.motion3d === true ? 'true' : 'false'}"
                        class="motion-3d w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                        onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><rect fill=%22%23e5e7eb%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22>ðŸ–¼ï¸</text></svg>'"
                      />
                      ${displayName || designCost ? `
                        <div class="absolute bottom-3 left-3 right-3 bg-black/60 text-white text-xs rounded-lg px-3 py-2">
                          <div class="font-semibold">${escapeHtml(displayName)}</div>
                          ${designCost ? `<div class="text-[11px] text-white/80">${escapeHtml(designCost)}</div>` : ''}
                        </div>
                      ` : ''}
                    </button>
                    ${designId ? `
                      <div class="p-2 border-t border-black/5 bg-white flex gap-1">
                        <button data-action="open-category-image" data-image-url="${escapeHtml(imageUrl)}" data-image-name="${escapeHtml(displayName)}" data-image-cost="${String(getDesignAmount(card.design as any))}" data-category-name="${escapeHtml(selectedCategory?.title || selectedCategory?.name || '')}" data-design-id="${escapeHtml(designId)}" class="flex-1 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-bold hover:opacity-90 transition">ðŸ“ Book Now</button>
                      </div>
                    ` : ''}
                  </div>
                `;
        })
        .join('')}
              </div>
            </div>
            `
      : selectedModel
        ? `
            <div class="sticky top-24">
              ${renderModelViewer(selectedModel)}
              <div class="mt-8 p-8 rounded-[32px] border border-black/5 bg-white">
                <h2 class="text-3xl font-display font-bold text-[color:var(--primary)] mb-3">${escapeHtml(selectedModel.title)}</h2>
                <p class="text-slate-500 mb-6">${escapeHtml(selectedModel.description)}</p>
                <button data-action="nav" data-tab="contact" class="w-full py-4 rounded-2xl bg-[color:var(--primary)] text-white font-semibold">Book Home Consultation</button>
              </div>
            </div>
          `
        : '<div class="h-full flex items-center justify-center italic text-slate-400">No designs available in this category.</div>'
    }
        </div>
      </section>

  <section class="spidey-panel p-6">
    <h3 class="text-lg font-semibold text-[color:var(--primary)] mb-4">My Inquiries</h3>
    <div class="space-y-3 max-h-72 overflow-y-auto">
      ${(() => {
      const inquiries = (state.customer as any).inquiries || [];
      if (inquiries.length === 0) {
        return '<div class="text-sm text-slate-400">You have not made any inquiries yet.</div>';
      }
      return inquiries.map((inq: any) => `
          <div class="p-4 rounded-xl border border-black/5 bg-slate-50">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Inquiry from: ${new Date(inq.createdAt).toLocaleDateString()}</span>
              <span class="font-semibold capitalize px-2 py-1 rounded-full ${inq.status === 'contacted' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}">${escapeHtml(inq.status)}</span>
            </div>
            <p class="text-sm text-slate-600 mb-3"><strong>You:</strong> ${escapeHtml(inq.message)}</p>
            ${inq.adminReply ? `
              <div class="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-300">
                <p class="text-sm text-blue-800"><strong>Admin Reply:</strong> ${escapeHtml(inq.adminReply)}</p>
              </div>
            ` : '<p class="text-xs text-slate-400 italic">Waiting for admin reply...</p>'}
          </div>
        `).join('');
    })()}
    </div>
  </section>
    </div>
  `;
};

