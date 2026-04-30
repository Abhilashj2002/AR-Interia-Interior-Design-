// --- Frontend page layer: Portfolio -----------------------------------------
const renderPortfolio = () => {
  ensurePortfolioFeedbackSeeded();
  const categories = getCustomerVisibleCategories(state.customer.categories && state.customer.categories.length > 0
    ? state.customer.categories
    : getCategories());
  const designs = getCustomerDesignPool();
  const isWardrobeCategory = (value: string) => {
    const key = normalizeKey(String(value || ''));
    return key.includes('wardrobe') || key.includes('warddrobe');
  };
  const normalizeCategoryId = (cat: Category) => {
    if (cat.id) return cat.id;
    return cat.title || cat.name || 'category';
  };
  const cleanImageName = (value: string) =>
    String(value || '')
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim();
  const portfolioFilter = state.customer.portfolioFilter || 'all';
  const portfolioSearchQuery = (state.customer.portfolioSearchQuery || '').trim().toLowerCase();


  // Force default category if 'all' or missing
  let portfolioCategoryId = state.customer.portfolioCategoryId;
  if (!portfolioCategoryId || portfolioCategoryId === 'all') {
    portfolioCategoryId = categories.length > 0 ? categories[0].id : 'all';
  }

  const normalizedCategories = categories.map((cat) => {
    const label = cat.title || cat.name || 'Category';
    const categoryId = normalizeCategoryId(cat);
    const labelKey = label.toLowerCase();
    const designsForCategory = designs.filter((design) => {
      if (design.categoryId && design.categoryId === categoryId) return true;
      const designLabel = String(design.category || '').toLowerCase();
      return designLabel && designLabel === labelKey;
    });
    const images = (cat.images || []).map((img, index) => ({
      ...img,
      index,
      categoryId,
      categoryName: label
    }));
    // has3d = true for any category that has images (all can be viewed in 3D room)
    const has3d = images.length > 0 || designsForCategory.some((design) => Boolean(design.modelUrl));
    const hasAr = images.length > 0 || designsForCategory.some((design) => Boolean(design.previewImage || (design.images && design.images.length)));
    const coverImage = normalizeAssetUrl(String(cat.image || cat.thumbnail || cat.background || '').trim());
    return { id: categoryId, label, images, has3d, hasAr, coverImage };
  });

  const threeDCategoryIds = new Set(
    normalizedCategories.filter((cat) => cat.images.length > 0).map((cat) => cat.id)
  );
  const enrichedCategories = normalizedCategories.map((cat) => ({
    ...cat,
    has3d: cat.has3d || threeDCategoryIds.has(cat.id),
    images: cat.images.map((img) => ({ ...img, motion3d: img.motion3d === true || cat.has3d }))
  }));

  const sampleCategoryChips = getPortfolioSampleCategorySeries().map((item: any) => ({
    id: String(item.id || '').trim(),
    label: String(item.name || '').trim()
  })).filter((item: any) => item.id && item.label);

  const chipCategoryMap = new Map<string, { id: string; label: string }>();
  enrichedCategories.forEach((cat) => {
    chipCategoryMap.set(String(cat.id), { id: String(cat.id), label: String(cat.label) });
  });
  sampleCategoryChips.forEach((cat: any) => {
    if (!chipCategoryMap.has(String(cat.id))) {
      chipCategoryMap.set(String(cat.id), { id: String(cat.id), label: String(cat.label) });
    }
  });
  const portfolioCategoryChips = Array.from(chipCategoryMap.values());

  const filteredCategories = enrichedCategories
    .map((cat) => {
      if (!portfolioSearchQuery) return cat;
      const query = portfolioSearchQuery;
      const categoryMatch = cat.label.toLowerCase().includes(query);
      const images = cat.images.filter((img) => {
        const name = String(img.name || '').toLowerCase();
        return categoryMatch || name.includes(query);
      });
      return { ...cat, images };
    })
    .filter((cat) => cat.images.length > 0)
    .filter((cat) => {
      if (portfolioCategoryId === 'all') return true;
      return cat.id === portfolioCategoryId
        || normalizeKey(cat.id) === normalizeKey(portfolioCategoryId)
        || normalizeKey(cat.label) === normalizeKey(portfolioCategoryId);
    })
    .filter((cat) => {
      if (portfolioFilter === '3d') return cat.has3d;
      return true;
    });

  const totalImages = filteredCategories.reduce((sum, cat) => sum + cat.images.length, 0);
  const scopedThreeDShowcase = filteredCategories
    .filter((cat) => cat.has3d)
    .flatMap((cat) => cat.images.slice(0, 3).map((img) => ({ ...img, categoryLabel: cat.label, motion3d: img.motion3d === true || cat.has3d })));

  return `
  <div class="min-h-screen bg-slate-900 relative overflow-hidden" >

                <!--Hero Section-->
                  <section class="relative z-10 pt-32 pb-20 px-6" >
                    <div class="max-w-6xl mx-auto text-center" >
                      <div class="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-lg mb-8 portfolio-badge" >
                        <span class="text-2xl" >âœ¨</span>
                          <span class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wider uppercase" >
                            Interior Project Showcase
                              </span>
                              </div>

                              <h1 class="text-5xl md:text-7xl font-display font-bold mb-6 portfolio-title" >
                                <span class="text-white" > Transforming </span>
                                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400" > Dreams </span>
                                    <span class="text-white" > into </span>
                                      <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400" > Reality </span>
                                        </h1>

                                        <p class="text-xl text-slate-300 max-w-3xl mx-auto mb-12 portfolio-subtitle" >
                                          Explore our collection of stunning interior designs powered by cutting-edge 3D modeling and AR technology. 
            Each project showcases our commitment to innovation and excellence.
          </p>

  <div class="flex flex-wrap justify-center gap-4 mb-16" >
    <div class="portfolio-stat-card" >
      <div class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" > 150+ </div>
        <div class="text-sm text-slate-200 mt-1 font-medium" > Projects Completed </div>
          </div>
          <div class="portfolio-stat-card" >
            <div class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400" > 4.9/5 </div>
              <div class="text-sm text-slate-200 mt-1 font-medium" > Client Rating </div>
                </div>
                <div class="portfolio-stat-card" >
                  <div class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400" > 25+ </div>
                    <div class="text-sm text-slate-200 mt-1 font-medium" > Design Awards </div>
                      </div>
                      </div>
                      </div>


        <!-- Founder & Co-Founder Section -->
        ${state.portfolioContent?.founder?.name || state.portfolioContent?.coFounder?.name ? `
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16 animate-fade-in-up">
          ${(() => {
        const f = state.portfolioContent?.founder;
        return f?.name ? `
              <div class="p-6 rounded-3xl bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 flex items-center gap-6 group hover:border-purple-400 transition-all">
                <img src="${escapeHtml(f.photo || '/hero-bg.webp')}" alt="${escapeHtml(f.name)}" class="w-24 h-24 rounded-full object-cover border-2 border-purple-500/50 group-hover:scale-105 transition-transform" />
                <div>
                  <h3 class="text-2xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">${escapeHtml(f.name)}</h3>
                  <div class="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">${escapeHtml(f.role)}</div>
                  ${f.famousDesign ? `<div class="text-xs text-cyan-300 mb-2">Famous Design: ${escapeHtml(f.famousDesign)}</div>` : ''}
                  <p class="text-sm text-slate-300 line-clamp-2">${escapeHtml(f.bio)}</p>
                </div>
              </div>
            ` : '';
      })()}
          ${(() => {
        const cf = state.portfolioContent?.coFounder;
        return cf?.name ? `
              <div class="p-6 rounded-3xl bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 flex items-center gap-6 group hover:border-purple-400 transition-all">
                <img src="${escapeHtml(cf.photo || '/hero-bg.webp')}" alt="${escapeHtml(cf.name)}" class="w-24 h-24 rounded-full object-cover border-2 border-purple-500/50 group-hover:scale-105 transition-transform" />
                <div>
                  <h3 class="text-2xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">${escapeHtml(cf.name)}</h3>
                  <div class="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">${escapeHtml(cf.role)}</div>
                  ${cf.famousDesign ? `<div class="text-xs text-cyan-300 mb-2">Famous Design: ${escapeHtml(cf.famousDesign)}</div>` : ''}
                  <p class="text-sm text-slate-300 line-clamp-2">${escapeHtml(cf.bio)}</p>
                </div>
              </div>
            ` : '';
      })()}
        </div>
        ` : ''}

        <!-- Design Team Section -->
        ${(() => {
      const devs = state.portfolioContent?.designers || [];
      if (devs.length === 0) return '';
      return `
            <div class="max-w-7xl mx-auto mb-20 text-left animate-fade-in-up" style="animation-delay: 0.2s">
              <h2 class="text-3xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <span class="w-8 h-1 bg-purple-500 rounded-full"></span>
                Meet Our Design Team
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${devs.map(d => `
                  <div class="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5 p-5 flex items-start gap-4 hover:bg-slate-800 transition-colors">
                    <img src="${escapeHtml(d.photo || '/hero-bg.webp')}" alt="${escapeHtml(d.name)}" class="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 class="font-bold text-white text-lg">${escapeHtml(d.name)}</h4>
                      <p class="text-xs font-semibold text-purple-400 mb-2">${escapeHtml(d.role)}</p>
                      <p class="text-xs text-cyan-300 mb-2">${escapeHtml((d as any).famousDesign || 'Signature Design')}</p>
                      <p class="text-xs text-slate-100 line-clamp-3 bg-slate-700/40 px-2 py-1 rounded">${escapeHtml(d.bio)}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
    })()}

        ${(() => {
      const journey = state.portfolioContent?.journey;
      const milestones = Array.isArray(journey?.milestones) ? journey!.milestones : [];
      if (!journey?.title && milestones.length === 0) return '';
      return `
            <div class="max-w-7xl mx-auto mb-20 text-left animate-fade-in-up" style="animation-delay: 0.25s">
              <h2 class="text-3xl font-display font-bold text-white mb-4 flex items-center gap-3">
                <span class="w-8 h-1 bg-cyan-500 rounded-full"></span>
                ${escapeHtml(journey?.title || 'Our Journey')}
              </h2>
              ${journey?.intro ? `<p class="text-sm text-slate-300 mb-6 max-w-3xl">${escapeHtml(journey.intro)}</p>` : ''}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${milestones.length > 0
          ? milestones.map((milestone: any) => `
                        <div class="rounded-2xl border border-cyan-400/20 bg-slate-800/60 p-4">
                          <div class="text-xs font-bold uppercase tracking-wider text-cyan-300">${escapeHtml(String(milestone?.year || 'Year'))}</div>
                          <div class="text-base font-semibold text-white mt-1">${escapeHtml(String(milestone?.title || 'Milestone'))}</div>
                          <div class="text-sm text-slate-300 mt-2">${escapeHtml(String(milestone?.description || ''))}</div>
                        </div>
                      `).join('')
          : '<div class="text-sm text-slate-200 font-medium">No journey milestones added yet.</div>'}
              </div>
            </div>
          `;
    })()}

        ${(() => {
      const displayBookings = getPortfolioDisplayBookings();
      const metrics = generateQuarterlyMetricsFromBookings(displayBookings)
        || (Array.isArray(state.portfolioContent?.businessMetrics) ? state.portfolioContent.businessMetrics : getQuarterlySampleMetrics());
      const bookings = displayBookings;
      const uniqueCustomerIds = new Set(
        bookings
          .map((booking: any) => String(booking?.userId || '').trim())
          .filter(Boolean)
      );
      const uniqueDesignIds = new Set(
        bookings
          .map((booking: any) => String(booking?.designId || '').trim())
          .filter(Boolean)
      );

      const mergedFeedbacks = [...(state.feedbacks || []), ...(state.customer.feedbacks || [])]
        .filter((feedback: any) => feedback && (feedback.comment || feedback.rating));
      const uniqueFeedbacks = Array.from(
        new Map(
          mergedFeedbacks.map((feedback: any, index: number) => {
            const key = String(feedback?.id || `${feedback?.userId || 'anon'}:${feedback?.createdAt || index}:${feedback?.comment || ''}`);
            return [key, feedback];
          })
        ).values()
      );
      const feedbackCount = uniqueFeedbacks.length;
      const feedbackAvgRating = feedbackCount > 0
        ? (uniqueFeedbacks.reduce((sum: number, feedback: any) => sum + Number(feedback?.rating || 0), 0) / feedbackCount)
        : 0;

      const designImageLookup = (designs || []).reduce((acc: any, design: any) => {
        const id = String(design?.id || '').trim();
        if (!id) return acc;
        acc[id] = String(design?.previewImage || design?.images?.[0] || '').trim();
        return acc;
      }, {});
      const designImageLookupByName = (designs || []).reduce((acc: any, design: any) => {
        const nameKey = normalizeKey(String(design?.title || design?.designName || '').trim());
        if (!nameKey) return acc;
        acc[nameKey] = String(design?.previewImage || design?.images?.[0] || '').trim();
        return acc;
      }, {});
      
      // Group bookings by category
      const categorySales = bookings.reduce((acc: any, booking: any) => {
        const cat = resolvePortfolioCategoryId(booking);
        if (!acc[cat]) acc[cat] = { count: 0, customers: new Set(), revenue: 0, designs: {}, orders: [] };
        acc[cat].count++;
        acc[cat].customers.add(booking.userId);
        acc[cat].revenue += booking.price || 0;
        const safeDesignId = String(booking.designId || `design-${acc[cat].count}-${Date.now()}`).trim();
        if (!acc[cat].designs[safeDesignId]) {
          acc[cat].designs[safeDesignId] = { name: resolvePortfolioDesignName(booking), count: 0, purchasedBy: new Set() };
        }
        const designKey = String(safeDesignId || Object.keys(acc[cat].designs)[0]).trim();
        acc[cat].designs[designKey].count++;
        acc[cat].designs[designKey].purchasedBy.add(booking.userId);
        const resolvedOrderDesignName = resolvePortfolioDesignName(booking);
        const imageByName = designImageLookupByName[normalizeKey(resolvedOrderDesignName)]
          || designImageLookupByName[normalizeKey(String(booking?.designName || ''))]
          || '';
        acc[cat].orders.push({
          bookingId: String(booking?.id || ''),
          designId: designKey,
          designName: resolvedOrderDesignName,
          designImage: String(booking?.designImage || designImageLookup[designKey] || imageByName || '').trim(),
          customerId: String(booking?.userId || '').trim(),
          customerName: String(booking?.userName || booking?.customerName || 'Customer').trim(),
          createdAt: booking?.createdAt || ''
        });
        return acc;
      }, {});
      
      // Get customer data
      const userMap = state.users?.reduce((acc: any, u: any) => {
        const userId = String(u?.id || '').trim();
        if (userId) {
          acc[userId] = {
            id: userId,
            name: String(u?.name || 'Customer').trim() || 'Customer',
            phone: String((u as any)?.phone || '').trim()
          };
        }
        return acc;
      }, {}) || {};

      const bookingUserMap = bookings.reduce((acc: any, booking: any) => {
        const userId = String(booking?.userId || '').trim();
        if (!userId || acc[userId]) return acc;
        const fallbackName = String(booking?.userName || booking?.customerName || '').trim();
        acc[userId] = {
          id: userId,
          name: fallbackName || `Customer ${userId.slice(0, 6)}`,
          phone: String(booking?.phone || booking?.customerPhone || '').trim()
        };
        return acc;
      }, {});

      const customerDirectory = { ...bookingUserMap, ...userMap };
      const realCustomerNames = Array.from(new Set(Object.values(customerDirectory).map((c: any) => String(c?.name || '').trim()).filter(Boolean)));

      const pickRealCustomerName = (index: number) => realCustomerNames[index % Math.max(realCustomerNames.length, 1)] || 'Customer';
      const getRealDesignForCategory = (categoryId: string) => {
        const categoryKey = normalizeKey(String(categoryId || ''));
        return (designs || []).find((design: any) => {
          const byId = normalizeKey(String(design?.categoryId || '')) === categoryKey;
          const byName = normalizeKey(String(design?.category || '')) === categoryKey;
          return byId || byName;
        });
      };
      
      // Top categories by sales count
      const topCategories = Object.entries(categorySales)
        .map(([catId, data]: any) => ({
          catId,
          nameMap: PORTFOLIO_CATEGORY_NAME_MAP,
          ...data,
          customers: Array.from(data.customers).map((id: any) => customerDirectory[String(id)]).filter(Boolean)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      const sampleTopCategories = getPortfolioSampleCategorySeries().map((item: any, idx: number) => ({
            realDesign: getRealDesignForCategory(item.id),
            catId: item.id,
            nameMap: { [item.id]: item.name },
            count: item.count,
            revenue: item.revenue,
            designs: {
              [`sample${idx + 1}`]: {
                name: String(getRealDesignForCategory(item.id)?.title || `${item.name} Design`),
                count: Math.max(2, item.count - 1),
                purchasedBy: new Set([`customer-${idx + 1}`])
              }
            },
            orders: [
              {
                bookingId: `sample-order-${idx + 1}`,
                designId: `sample-design-${idx + 1}`,
                designName: String(getRealDesignForCategory(item.id)?.title || `${item.name} Design`),
                designImage: String(getRealDesignForCategory(item.id)?.previewImage || '/hero-bg.webp'),
                customerId: `customer-${idx + 1}`,
                customerName: pickRealCustomerName(idx),
                createdAt: new Date().toISOString()
              }
            ],
            customers: [{ name: pickRealCustomerName(idx), phone: '' }]
          }));
      const displayTopCategories = [...topCategories, ...sampleTopCategories.filter((sample: any) => !topCategories.some((real: any) => real.catId === sample.catId))].slice(0, 10);
      
      const maxSales = Math.max(...metrics.map((item: any) => Number(item?.sales || 0)), 1);
      const maxCustomers = Math.max(...metrics.map((item: any) => Number(item?.customers || 0)), 1);
      
      const chartDataSalesVsCustomers = {
        labels: metrics.map((m: any) => m.label),
        sales: metrics.map((m: any) => Number(m.sales || 0)),
        customers: metrics.map((m: any) => Number(m.customers || 0))
      };
      
      const chartDataCategoryBreakdown = {
        labels: displayTopCategories.map((c: any) => c.nameMap[c.catId] || c.catId),
        sales: displayTopCategories.map((c: any) => c.count),
        revenue: displayTopCategories.map((c: any) => c.revenue || 0),
        colors: ['#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e']
      };
      
      return `
            <div class="max-w-7xl mx-auto mb-20 text-left animate-fade-in-up" style="animation-delay: 0.28s">
              <h2 class="text-3xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <span class="w-8 h-1 bg-emerald-500 rounded-full"></span>
                Design Sales & Customers Performance
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="rounded-2xl border border-emerald-300/30 bg-slate-800/60 p-4">
                  <div class="text-xs uppercase tracking-wider text-slate-200 font-semibold">Existing Customers</div>
                  <div class="text-2xl font-bold text-emerald-300 mt-1">${uniqueCustomerIds.size}</div>
                </div>
                <div class="rounded-2xl border border-cyan-300/30 bg-slate-800/60 p-4">
                  <div class="text-xs uppercase tracking-wider text-slate-200 font-semibold">Existing Paid Designs</div>
                  <div class="text-2xl font-bold text-cyan-300 mt-1">${uniqueDesignIds.size}</div>
                </div>
                <div class="rounded-2xl border border-violet-300/30 bg-slate-800/60 p-4">
                  <div class="text-xs uppercase tracking-wider text-slate-200 font-semibold">Customer Feedback</div>
                  <div class="text-2xl font-bold text-violet-300 mt-1">${feedbackCount}</div>
                </div>
                <div class="rounded-2xl border border-amber-300/30 bg-slate-800/60 p-4">
                  <div class="text-xs uppercase tracking-wider text-slate-200 font-semibold">Avg Feedback Rating</div>
                  <div class="text-2xl font-bold text-amber-300 mt-1">${feedbackAvgRating.toFixed(1)}/5</div>
                </div>
              </div>
              
              <!-- Performance Charts -->
              <div class="mb-12">
                <h3 class="text-lg font-semibold text-cyan-300 mb-6">ðŸ“Š Monthly Performance: Customers & Designs</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Bar Chart: Sales vs Customers by Month -->
                  <div class="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                    <div class="text-sm font-semibold text-emerald-300 mb-4">ðŸ“ˆ Design Sales & Customers Chart</div>
                    <canvas id="portfolio-sales-chart" class="w-full" style="max-height: 300px;"></canvas>
                  </div>
                  
                  <!-- Line Chart: Performance Trend -->
                  <div class="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                    <div class="text-sm font-semibold text-cyan-300 mb-4">ðŸ“‰ Performance Trend</div>
                    <canvas id="portfolio-trend-chart" class="w-full" style="max-height: 300px;"></canvas>
                  </div>
                </div>
              </div>
              
              <!-- Category Breakdown with Charts -->
              <div>
                <h3 class="text-lg font-semibold text-purple-300 mb-6">ðŸŽ¯ Top Selling Categories & Famous Designs</h3>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <!-- Pie Chart: Sales by Category -->
                  <div class="rounded-2xl border border-purple-400/20 bg-slate-800/70 p-6 lg:col-span-1">
                    <div class="text-sm font-semibold text-white mb-4 text-center">ðŸ“Š Sales by Category</div>
                    <canvas id="portfolio-category-pie" class="w-full" style="max-height: 280px;"></canvas>
                  </div>
                  
                  <!-- Doughnut Chart: Revenue Distribution -->
                  <div class="rounded-2xl border border-purple-400/20 bg-slate-800/70 p-6 lg:col-span-1">
                    <div class="text-sm font-semibold text-white mb-4 text-center">ðŸ’° Revenue Distribution</div>
                    <canvas id="portfolio-revenue-chart" class="w-full" style="max-height: 280px;"></canvas>
                  </div>
                  
                  <!-- Bar Chart: Category Rankings -->
                  <div class="rounded-2xl border border-purple-400/20 bg-slate-800/70 p-6 lg:col-span-1">
                    <div class="text-sm font-semibold text-white mb-4 text-center">ðŸ† Category Rankings</div>
                    <canvas id="portfolio-ranking-chart" class="w-full" style="max-height: 280px;"></canvas>
                  </div>
                </div>
              </div>

              <!-- Category Details with Famous Designs -->
              <div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  ${displayTopCategories.map((cat: any) => {
            const topDesign = Object.entries(cat.designs || {})
              .map(([id, d]: any) => ({ id, ...d }))
              .sort((a, b) => b.count - a.count)[0];
            const categoryName = cat.nameMap?.[cat.catId] || resolvePortfolioCategoryName(cat.catId);
            const isApartmentCategory = String(cat.catId || '').toLowerCase().includes('apartment') || String(categoryName || '').toLowerCase().includes('apartment');
            const sortedOrders = Array.isArray(cat.orders)
              ? [...cat.orders].sort((a: any, b: any) => new Date(String(b?.createdAt || 0)).getTime() - new Date(String(a?.createdAt || 0)).getTime())
              : [];
            const orderRows = isApartmentCategory ? sortedOrders : sortedOrders.slice(0, 4);
            return `
                    <div class="rounded-2xl border border-purple-400/20 bg-slate-800/70 p-5 hover:border-purple-400/50 transition-all">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-base font-bold text-white bg-purple-500/30 px-3 py-1 rounded-full">${categoryName}</span>
                        <span class="text-xs text-emerald-300 font-bold">ðŸ“ˆ ${cat.count} Orders</span>
                      </div>
                      
                      <div class="mb-2 text-xs text-slate-200">ðŸ’µ Revenue: <span class="text-cyan-300 font-semibold">â‚¹${(cat.revenue || 0).toLocaleString('en-IN')}</span></div>
                      
                      ${topDesign ? `
                        <div class="bg-slate-700/40 p-3 rounded-lg mb-3 border-l-2 border-fuchsia-500">
                          <div class="text-xs text-slate-300 mb-1">â­ Famous Design:</div>
                          <div class="text-sm font-bold text-white mb-1 text-fuchsia-300">${escapeHtml(topDesign.name)}</div>
                          <div class="text-xs text-emerald-300">ðŸ”¥ ${topDesign.count} purchases from <span class="font-semibold text-white">${topDesign.purchasedBy.size}</span> customers</div>
                        </div>
                      ` : ''}
                      
                      <div class="text-xs text-slate-300">
                        <div class="font-semibold text-cyan-300 mb-1">ðŸ‘¥ Recent Customers:</div>
                        <div class="space-y-1">
                          ${cat.customers.slice(0, 3).map((cust: any) => `
                            <div class="text-slate-100 flex items-center gap-2">
                              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                              <span class="font-medium">${escapeHtml(cust.name)}</span>
                              <span class="text-slate-300 text-[10px]">${escapeHtml(cust.phone || '')}</span>
                            </div>
                          `).join('')}
                          ${cat.customers.length > 3 ? `<div class="text-slate-300 text-[10px] ml-3">+${cat.customers.length - 3} more</div>` : ''}
                        </div>
                      </div>

                      <div class="mt-3">
                        <div class="font-semibold text-amber-300 text-xs mb-2">ðŸ§¾ ${isApartmentCategory ? 'All Orders' : 'Recent Orders'} (${orderRows.length})</div>
                        <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                          ${orderRows.length > 0 ? orderRows.map((order: any) => `
                            <div class="flex items-center gap-2 rounded-lg bg-slate-900/50 border border-white/10 p-2">
                              <img src="${escapeHtml(String(order?.designImage || '/hero-bg.webp'))}" alt="${escapeHtml(String(order?.designName || 'Design'))}" class="w-10 h-10 rounded-md object-cover border border-white/10" />
                              <div class="min-w-0">
                                <div class="text-xs text-white font-semibold truncate">${escapeHtml(String(order?.designName || 'Design'))}</div>
                                <div class="text-[10px] text-slate-300 truncate">${escapeHtml(String(order?.customerName || 'Customer'))}</div>
                              </div>
                            </div>
                          `).join('') : '<div class="text-[11px] text-slate-300">No orders yet.</div>'}
                        </div>
                      </div>
                    </div>
                  `;
          }).join('')}
                </div>
              </div>
            </div>
          `;
    })()}

        <!-- Feedback Videos Section -->
        ${(() => {
      const vids = (state.portfolioContent?.feedbackVideos || []).filter((video: any) => video.showOnPortfolio !== false);
      if (vids.length === 0) return '';
      return `
            <div class="max-w-7xl mx-auto mb-20 text-left animate-fade-in-up" style="animation-delay: 0.3s">
              <h2 class="text-3xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <span class="w-8 h-1 bg-blue-500 rounded-full"></span>
                Client Feedback & Stories
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${vids.map(v => `
                  <div class="bg-slate-900 rounded-3xl overflow-hidden border border-white/10 group hover:border-blue-500/50 transition-all">
                    <div class="aspect-video bg-black relative">
                      ${renderVideoEmbedOrTag(v.url, 'w-full h-full object-contain', v.title || 'Client Feedback')}
                    </div>
                    <div class="p-4 bg-slate-800/80">
                      <h4 class="font-bold text-white text-sm truncate">${escapeHtml(v.title)}</h4>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
    })()}

                      </section>



  <!--Projects Grid-->
    <section class="relative z-10 px-6 pb-32" >
      <div class="max-w-7xl mx-auto" >
        <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-16" >
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" >
            Famous Designs
              </span>
              </h2>

              <div class="portfolio-filters" >
                <div class="portfolio-filter-group" >
                  <button data-action="set-portfolio-filter" data-filter="all" class="portfolio-filter-btn ${portfolioFilter === 'all' ? 'active' : ''}">All</button>
                    <button data-action="set-portfolio-filter" data-filter="3d" class="portfolio-filter-btn ${portfolioFilter === '3d' ? 'active' : ''}">3D Design</button>
                      </div>
                      <div class="portfolio-search">
                        <input
                data-bind="customer.portfolioSearchQuery"
value="${escapeHtml(state.customer.portfolioSearchQuery || '')}"
placeholder="Search categories or designs"
class="portfolio-search-input"
  />
  </div>
  <div class="portfolio-category-chips" >
    ${portfolioCategoryChips
      .map((cat) => `
        <button data-action="set-portfolio-category" data-category="${escapeHtml(cat.id)}" class="spidey-chip ${portfolioCategoryId === cat.id ? 'active' : ''}">
          ${escapeHtml(cat.label)}
        </button>
      `)
      .join('')
    }
  </div>
  <div class="portfolio-filter-meta" > Showing ${filteredCategories.length} categories - ${totalImages} images </div>
</div>

${scopedThreeDShowcase.length
      ? `
      <div class="portfolio-showcase">
        <div class="portfolio-showcase-header">
          <div>
            <h3 class="text-2xl font-display font-bold text-white">3D Design Showcase</h3>
            <p class="text-slate-200 text-sm">Highlighted spaces with immersive 3D visualization</p>
          </div>
          <div class="portfolio-badge-mini">3D Design</div>
        </div>
        <div class="portfolio-showcase-grid">
          ${scopedThreeDShowcase
        .map((img) => `
            <button
              data-action="open-3d-view-image"
              data-image-url="${escapeHtml(img.url)}"
              data-image-name="${escapeHtml(img.name || img.categoryLabel || '3D Design')}"
              data-image-category="${escapeHtml(img.categoryLabel || '')}"
              data-category-id="${escapeHtml(img.categoryId || '')}"
              data-category-name="${escapeHtml(img.categoryLabel || '')}"
              class="portfolio-showcase-card"
            >
              <div class="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
                <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.name || img.categoryLabel || '3D Design')}" data-motion3d="${img.motion3d === true ? 'true' : 'false'}" class="motion-3d w-full h-full object-cover" loading="lazy" />
              </div>
              <div class="portfolio-showcase-caption">
                <span>${escapeHtml(img.categoryLabel || '3D Design')}</span>
                <span class="portfolio-tag">3D Design</span>
              </div>
            </button>
          `)
        .join('')}
        </div>
      </div>
      `
      : ''
    }

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" >
  ${(() => {
      const allDesigns = state.customer.designs?.length ? state.customer.designs : getDesigns();
    let featuredDesigns = getCustomerVisibleDesigns(allDesigns)
      .filter(d => d.status !== 'inactive');

      // Filter by Category
      if (portfolioCategoryId !== 'all') {
        const categoryKeys = getCategoryKeySet(portfolioCategoryId, categories);
        featuredDesigns = featuredDesigns.filter(d => designMatchesCategory(d, categoryKeys));
      }

      // Filter by Search
      if (portfolioSearchQuery) {
        const sq = portfolioSearchQuery.toLowerCase();
        featuredDesigns = featuredDesigns.filter(d =>
          d.title.toLowerCase().includes(sq) ||
          (d.description || '').toLowerCase().includes(sq) ||
          (d.category || '').toLowerCase().includes(sq)
        );
      }

      // Filter by 3D
      if (portfolioFilter === '3d') {
        const catsWith3d = new Set(enrichedCategories.filter(c => c.has3d).map(c => c.id));
        featuredDesigns = featuredDesigns.filter(d => d.categoryId && catsWith3d.has(d.categoryId));
      }

      // Add sample data for key categories when browsing all or selecting sample category chips
      const sampleProjects = [
          {
            id: 'sample-villa-1',
            title: 'Grand Palladian Villa',
            category: 'Villa',
            categoryId: 'villa',
            description: 'A luxurious 5000 sqft villa with italian marble flooring and double-height ceilings.',
            previewImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
            price: 4500000,
            motion3d: true
          },
          {
            id: 'sample-apt-1',
            title: 'Skyline Penthouse',
            category: 'Apartment',
            categoryId: 'apartment',
            description: 'Modern minimalist penthouse with panoramic city views and smart automation.',
            previewImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            price: 2800000,
            motion3d: true
          },
          {
            id: 'sample-villa-2',
            title: 'Coastal Retreat Villa',
            category: 'Villa',
            categoryId: 'villa',
            description: 'Breezy coastal aesthetics with open floor plans and natural light.',
            previewImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
            price: 3200000,
            motion3d: true
          },
          {
            id: 'sample-apt-2',
            title: 'Urban Loft Apartment',
            category: 'Apartment',
            categoryId: 'apartment',
            description: 'Industrial chic loft with exposed brick walls and metal accents.',
            previewImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            price: 1500000,
            motion3d: true
          },
          {
            id: 'sample-balcony-1',
            title: 'Sky Garden Balcony',
            category: 'Balcony',
            categoryId: 'cat-balcony',
            description: 'Compact balcony transformed with planters, mood lighting, and premium decking.',
            previewImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
            price: 850000,
            motion3d: true
          },
          {
            id: 'sample-kitchen-1',
            title: 'Chef Pro Kitchen',
            category: 'Kitchen',
            categoryId: 'cat-kitchen',
            description: 'Modular kitchen with quartz counters and hidden storage system.',
            previewImage: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
            price: 1850000,
            motion3d: true
          },
          {
            id: 'sample-bedroom-1',
            title: 'Calm Bedroom Suite',
            category: 'Bedroom',
            categoryId: 'cat-bedroom',
            description: 'Warm layered lighting, acoustic panels, and minimalist furniture layout.',
            previewImage: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800',
            price: 1320000,
            motion3d: true
          },
          {
            id: 'sample-guestroom-1',
            title: 'Guestroom Comfort',
            category: 'Guest Room',
            categoryId: 'cat-guestroom',
            description: 'Flexible guest room with foldaway workspace and premium storage.',
            previewImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
            price: 980000,
            motion3d: true
          },
          {
            id: 'sample-epoxy-1',
            title: 'Epoxy Luxe Flooring',
            category: 'Epoxy',
            categoryId: 'cat-epoxy',
            description: 'High-gloss epoxy treatment with marble swirl finish for premium interiors.',
            previewImage: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800',
            price: 760000,
            motion3d: true
          }
        ];

      const sampleCategoryIdSet = new Set(sampleProjects.map((project) => String(project.categoryId || '').trim()));
      const isSampleCategorySelected = sampleCategoryIdSet.has(String(portfolioCategoryId || '').trim());
      if (!portfolioSearchQuery && (portfolioCategoryId === 'all' || isSampleCategorySelected)) {
        featuredDesigns = [...featuredDesigns, ...sampleProjects as any];
      }

      if (!featuredDesigns.length) {
        const fallbackImages = filteredCategories.flatMap((cat) =>
          (cat.images || []).map((img, index) => ({
            ...img,
            imageIndex: index,
            categoryId: cat.id,
            categoryLabel: cat.label
          }))
        );

        if (!fallbackImages.length) {
          return `<div class="col-span-full text-center py-16 text-slate-200 italic">No portfolio items match these filters.</div>`;
        }

        return fallbackImages.map((img, index) => {
          const matchedDesign = featuredDesigns.find((design) => {
            const byCategory = getCategoryMatchKeySet(String(design.categoryId || ''), String(design.category || '')).has(normalizeCategoryKey(String(img.categoryId || img.categoryLabel || '')));
            const byImage = getFilenameKey(String(design.previewImage || (design.images && design.images[0]) || '')) === getFilenameKey(String(img.url || ''));
            return byImage || byCategory;
          }) || null;
          const fallbackAmount = matchedDesign ? getDesignAmount(matchedDesign as any) : 0;
          const fallbackCostLabel = fallbackAmount > 0 ? formatCurrency(fallbackAmount) : '';
          const displayName = escapeHtml(cleanImageName(String(img.name || img.categoryLabel || 'Portfolio Design')));
          const categoryLabel = escapeHtml(String(img.categoryLabel || 'Portfolio'));
          const imageUrl = escapeHtml(String(img.url || ''));
          return `
          <div class="portfolio-card" style="animation-delay: ${(index % 10) * 0.1}s">
            <div class="portfolio-card-inner">
              <div class="portfolio-image-wrapper overflow-hidden relative group">
                <img 
                  src="${imageUrl}" 
                  alt="${displayName}"
                  data-action="open-3d-view-image"
                  data-image-url="${imageUrl}"
                  data-motion3d="${img.motion3d === true ? 'true' : 'false'}"
                  class="motion-3d w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto z-10 w-full h-full mt-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div class="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto items-center mt-20">
                    <button 
                      data-action="open-portfolio-dialog"
                      data-image-url="${imageUrl}"
                      data-image-name="${displayName}"
                      data-image-desc=""
                      data-image-cost="${String(fallbackAmount)}"
                      data-image-category="${categoryLabel}"
                      data-category-id="${escapeHtml(String(img.categoryId || ''))}"
                      data-category-name="${categoryLabel}"
                      data-design-id=""
                      class="bg-[color:var(--accent)] hover:opacity-90 text-white hover:scale-105 transition-transform flex items-center gap-2 px-4 py-2 rounded-xl font-bold backdrop-blur-sm shadow-xl"
                    >
                      <span class="text-xl">âœ¨</span>
                      <span>Options</span>
                    </button>
                    <button
                      data-action="open-3d-room"
                      data-image-url="${imageUrl}"
                      data-room-name="${categoryLabel}"
                      class="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-sm shadow-xl hover:scale-105 transition-transform"
                      style="background:linear-gradient(135deg,#6d28d9,#2563eb);"
                    >
                      <span class="text-xl">ðŸ </span>
                      <span>View in 3D</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <div class="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">${categoryLabel}</div>
                <h3 class="text-2xl font-bold text-white mb-3">${displayName}</h3>
                ${fallbackCostLabel ? `<div class="text-sm font-semibold text-white/80 mb-3">${escapeHtml(fallbackCostLabel)}</div>` : ''}
                <p class="text-slate-200 text-sm mb-4">Category image portfolio preview.</p>
                <div class="flex flex-wrap gap-2">
                  <span class="portfolio-tag">3D Design</span>
                  <span class="portfolio-tag">${categoryLabel}</span>
                </div>
              </div>
            </div>
          </div>
        `;
        }).join('');
      }

      return featuredDesigns.map((design, index) => {
        const categoryObj = enrichedCategories.find(c => c.id === design.categoryId || c.label === design.category);
        const categoryLabel = categoryObj?.label || design.category || 'Portfolio';
        const has3d = categoryObj?.has3d || false;
        const displayName = escapeHtml(resolveDesignDisplayName(design, { imageUrl: design.previewImage, categoryId: design.categoryId }));
        const designDesc = escapeHtml(design.description || '');
        const designCost = formatCurrency(getDesignAmount(design as any));
        const categoryImages = Array.isArray(categoryObj?.images) ? categoryObj.images : [];
        const categoryImageFromIndex = categoryImages.length > 0
          ? String(categoryImages[index % categoryImages.length]?.url || '').trim()
          : '';
        const categoryFallbackImage = String(categoryImageFromIndex || categoryObj?.coverImage || '').trim();
        const rawPreviewImage = String(design.previewImage || '').trim();
        const normalizedCategoryText = normalizeKey(`${categoryObj?.id || ''} ${categoryLabel} ${design.categoryId || ''} ${design.category || ''}`);
        const isApartmentDesign = normalizedCategoryText.includes('apartment');
        const shouldPreferCategoryImage = Boolean(categoryFallbackImage)
          && (
            isApartmentDesign
            || /^https?:\/\/images\.unsplash\.com\//i.test(rawPreviewImage)
          );
        const resolvedPreviewImage = String(
          shouldPreferCategoryImage
            ? categoryFallbackImage
            : (rawPreviewImage || categoryFallbackImage || '')
        ).trim();
        const escapedResolvedPreviewImage = escapeHtml(resolvedPreviewImage);
        const escapedFallbackImage = escapeHtml(categoryFallbackImage);
        const imageOnError = categoryFallbackImage
          ? `if(this.dataset.fallbackApplied==='1'){this.onerror=null;this.style.display='none';return;}this.dataset.fallbackApplied='1';this.src='${escapedFallbackImage}';`
          : `this.onerror=null;this.style.display='none';`;
        const tags = [
          ...(has3d ? ['3D Design'] : []),
          categoryLabel
        ];

        return `
        <div class="portfolio-card" style="animation-delay: ${(index % 10) * 0.1}s">
          <div class="portfolio-card-inner">
            <div class="portfolio-image-wrapper overflow-hidden relative group">
              ${resolvedPreviewImage ? `
                <img 
                  src="${escapedResolvedPreviewImage}" 
                  alt="${displayName}"
                  data-action="open-3d-view-image"
                  data-image-url="${escapedResolvedPreviewImage}"
                  data-motion3d="${design.motion3d === true ? 'true' : 'false'}"
                  class="motion-3d w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                  onerror="${imageOnError}"
                  loading="lazy"
                />
              ` : `
                <div class="w-full h-64 bg-slate-800 flex items-center justify-center text-slate-200">No image</div>
              `}
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto z-10 w-full h-full mt-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div class="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto items-center mt-20">
                  <button 
                    data-action="open-portfolio-dialog"
                    data-image-url="${escapedResolvedPreviewImage}"
                    data-image-name="${displayName}"
                    data-image-desc="${designDesc}"
                    data-image-cost="${String(getDesignAmount(design as any))}"
                    data-image-category="${escapeHtml(categoryLabel)}"
                    data-category-id="${escapeHtml(design.categoryId || '')}"
                    data-category-name="${escapeHtml(categoryLabel)}"
                    data-design-id="${escapeHtml(design.id || '')}"
                    class="bg-[color:var(--accent)] hover:opacity-90 text-white hover:scale-105 transition-transform flex items-center gap-2 px-4 py-2 rounded-xl font-bold backdrop-blur-sm shadow-xl"
                  >
                    <span class="text-xl">âœ¨</span>
                    <span>Options</span>
                  </button>
                  <button
                    data-action="open-3d-room"
                    data-image-url="${escapedResolvedPreviewImage}"
                    data-room-name="${escapeHtml(categoryLabel)}"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-sm shadow-xl hover:scale-105 transition-transform"
                    style="background:linear-gradient(135deg,#6d28d9,#2563eb);"
                  >
                    <span class="text-xl">ðŸ </span>
                    <span>View in 3D</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="p-6">
              <div class="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">
                ${escapeHtml(categoryLabel)}
              </div>
              <h3 class="text-2xl font-bold text-white mb-3">
                ${displayName}
              </h3>
              <p class="text-slate-200 text-sm mb-4">
                ${designDesc || `Signature ${categoryLabel.toLowerCase()} concept with 3D modeling and AR preview.`}
              </p>
              ${designCost ? `<div class="text-sm font-bold text-white/80 mb-3">${escapeHtml(designCost)}</div>` : ''}
              <div class="flex flex-wrap gap-2">
                ${tags
            .map((tag) => `
                  <span class="portfolio-tag">
                    ${escapeHtml(tag)}
                  </span>
                `)
            .join('')}
              </div>
            </div>
          </div>
        </div>
      `;
      }).join('');
    })()}
</div>

<!--CTA Section-->
    <div class="mt-20 text-center" >
      <div class="inline-block p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-xl portfolio-cta" >
        <h3 class="text-3xl font-bold text-white mb-4" >
          Ready to Create Your Dream Space ?
            </h3>
            <p class="text-slate-300 mb-6 max-w-2xl" >
              Let our expert team transform your vision into reality with cutting-edge 3D design and planning.
              </p>
                <div class="flex flex-wrap justify-center gap-4" >
                  <button 
                  data-action="nav"
data-tab="contact"
class="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
  >
                  ðŸš€ Start Your Project
  </button>
  <button
data-action="nav"
data-tab="gallery"
class="px-8 py-4 border-2 border-purple-400 text-purple-400 font-bold rounded-xl hover:bg-purple-400/10 transition-all"
  >
                  ðŸ“± Explore AR Gallery
  </button>
  </div>
  </div>
  </div>
  </div>
  </section>

  <style>
@keyframes cosmicFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
            opacity: 0.2;
  }
  25% {
    transform: translate(100px, -100px) scale(1.2);
            opacity: 0.4;
  }
  50% {
    transform: translate(0, -200px) scale(0.9);
            opacity: 0.3;
  }
  75% {
    transform: translate(-100px, 50px) scale(1.1);
            opacity: 0.35;
  }
}

@keyframes kenBurnsCustom {
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.1) translate(-2%, -2%); }
  100% { transform: scale(1) translate(0, 0); }
}

.motion-3d[data-motion3d="true"] {
  animation: kenBurnsCustom 20s ease-in-out infinite alternate;
  transform-origin: center center;
  will-change: transform;
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes portfolioSlideUp {
          from {
    opacity: 0;
    transform: translateY(30px);
  }
          to {
    opacity: 1;
    transform: translateY(0);
  }
}

        .cosmic-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: cosmicFloat 20s ease-in-out infinite;
}

        .cosmic-blob - 1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

        .cosmic-blob - 2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%);
  top: 50%;
  right: 10%;
  animation-delay: 7s;
}

        .cosmic-blob - 3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%);
  bottom: 20%;
  left: 50%;
  animation-delay: 14s;
}

        .stars-layer {
  position: absolute;
  inset: 0;
  background-image:
  radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 60%, white, transparent),
    radial-gradient(1px 1px at 33% 80%, white, transparent),
    radial-gradient(1px 1px at 15% 55%, white, transparent);
  background-size: 200% 200%;
  animation: starTwinkle 4s ease-in-out infinite;
  opacity: 0.4;
}

        .portfolio-badge {
  animation: portfolioSlideUp 0.6s ease-out;
}

        .portfolio-title {
  animation: portfolioSlideUp 0.8s ease-out 0.2s both;
}

        .portfolio-subtitle {
  animation: portfolioSlideUp 1s ease-out 0.4s both;
}

        .portfolio-stat - card {
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.05);
  backdrop-filter: blur(10px);
  animation: portfolioSlideUp 0.6s ease-out both;
}

        .portfolio-stat - card: nth - child(1) { animation-delay: 0.6s; }
        .portfolio-stat - card: nth - child(2) { animation-delay: 0.7s; }
        .portfolio-stat - card: nth - child(3) { animation-delay: 0.8s; }

        .portfolio-card {
  animation: portfolioSlideUp 0.6s ease-out both;
  transition: transform 0.3s ease;
  perspective: 1500px;
}

        .portfolio-card:hover {
  z-index: 10;
}

        .portfolio-card-inner {
  background: rgba(15, 15, 35, 0.8);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 1.5rem;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease;
}

        .portfolio-card:not(.has-3d-tilt):hover .portfolio-card-inner {
  transform: rotateX(8deg) rotateY(-5deg) scale3d(1.05, 1.05, 1.05);
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: -20px 30px 60px rgba(168, 85, 247, 0.3), 0 0 40px rgba(34, 211, 238, 0.2);
}

        .portfolio-image-wrapper {
  position: relative;
  overflow: hidden;
}

        .portfolio-image-wrapper img {
  transform: translateZ(20px) scale(1.05);
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
}

        .portfolio-card:not(.has-3d-tilt):hover .portfolio-image-wrapper img {
  transform: translateZ(50px) scale(1.12);
}

        .portfolio-card .p-6 {
  transform: translateZ(30px);
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
}

        .portfolio-card:not(.has-3d-tilt):hover .p-6 {
  transform: translateZ(60px);
}

        /* Enhanced 3D tilt for spidey cards in gallery and categories */
        .spidey-card.has-3d-tilt {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  transform-style: preserve-3d;
}

        .spidey-card.has-3d-tilt img {
  transition: transform 0.4s ease-out;
}

        .spidey-card.has-3d-tilt:hover img {
  transform: scale(1.1);
}

        .portfolio-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

        .portfolio-card: hover.portfolio-overlay {
  opacity: 1;
}

        .portfolio-view - btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(34, 211, 238, 0.9));
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

        .portfolio-card: hover.portfolio-view - btn {
  transform: translateY(0);
}

        .portfolio-view - btn:hover {
  transform: scale(1.05) translateY(0);
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.5);
}

        .portfolio-tag {
  display: inline - block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 9999px;
}

        .portfolio-cta {
  animation: portfolioSlideUp 0.8s ease-out 0.4s both;
}

        .portfolio-filters {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(168, 85, 247, 0.2);
  background: rgba(15, 15, 35, 0.6);
  backdrop-filter: blur(12px);
}

        .portfolio-filter - group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

        .portfolio-filter - btn {
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c4b5fd;
  font-weight: 600;
  transition: all 0.3s ease;
  background: rgba(168, 85, 247, 0.1);
}

        .portfolio-filter - btn.active,
        .portfolio-filter - btn:hover {
  color: #0f0f23;
  background: linear-gradient(135deg, #a855f7, #22d3ee);
  border-color: transparent;
  box-shadow: 0 10px 25px rgba(168, 85, 247, 0.35);
}

        .portfolio-search {
  display: flex;
  justify-content: center;
}

        .portfolio-search - input {
  width: 100%;
  max-width: 480px;
  padding: 0.8rem 1.2rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 15, 35, 0.7);
  color: white;
}

        .portfolio-search - input::placeholder {
  color: rgba(226, 232, 240, 0.6);
}

        .portfolio-category - chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

        .portfolio-filter - meta {
  text-align: center;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
}

        .portfolio-showcase {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(34, 211, 238, 0.2);
  background: rgba(15, 15, 35, 0.6);
  backdrop-filter: blur(12px);
}

        .portfolio-showcase - header {
  display: flex;
  align-items: center;
  justify-content: space - between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

        .portfolio-badge - mini {
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #0f0f23;
  background: linear-gradient(135deg, #22d3ee, #a855f7);
}

        .portfolio-showcase - grid {
  display: grid;
  grid-template - columns: repeat(auto - fit, minmax(180px, 1fr));
  gap: 1rem;
}

        .portfolio-showcase - card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 15, 35, 0.8);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

        .portfolio-showcase - card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

        .portfolio-showcase - card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(34, 211, 238, 0.25);
}

        .portfolio-showcase - caption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 0.75rem;
  display: flex;
  justify-content: space - between;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.7));
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

        .portfolio-info - card {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 15, 35, 0.6);
  backdrop-filter: blur(10px);
}

        .portfolio-service {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(168, 85, 247, 0.2);
  background: rgba(15, 15, 35, 0.6);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

        .portfolio-service - icon {
  width: 44px;
  height: 44px;
  border-radius: 0.9rem;
  display: inline - flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f0f23;
  background: linear-gradient(135deg, #22d3ee, #a855f7);
}

        .portfolio-people - card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 15, 35, 0.6);
  align-items: flex - start;
}

        .portfolio-people - photo {
  width: 88px;
  height: 88px;
  border-radius: 1rem;
  object-fit: cover;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

        .portfolio-overlay - actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

        .portfolio-carousel - btn {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  display: inline - flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 15, 35, 0.6);
  transition: all 0.2s ease;
}

        .portfolio-carousel - btn:hover {
  background: rgba(168, 85, 247, 0.7);
  border-color: rgba(168, 85, 247, 0.7);
  transform: scale(1.05);
}

        .portfolio-count {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.3rem 0.6rem;
  border-radius: 9999px;
  background: rgba(15, 15, 35, 0.75);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

        .portfolio-thumbs {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem 0;
  overflow - x: auto;
}

        .portfolio-thumb {
  width: 52px;
  height: 52px;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  overflow: hidden;
  flex: 0 0 auto;
  transition: all 0.2s ease;
  background: rgba(15, 15, 35, 0.7);
}

        .portfolio-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

        .portfolio-thumb.active {
  border-color: rgba(168, 85, 247, 0.8);
  box-shadow: 0 8px 18px rgba(168, 85, 247, 0.35);
  transform: translateY(-2px);
}
</style>
  </div>
    `;
};

// Expose legacy portfolio renderer for feature-wrapper delegation.
(globalThis as any).renderPortfolio = renderPortfolio;

  // --- Frontend auth page layer: Login (do not alter business logic) ----------
const renderLogin = () => {
  const getPasswordRuleChecks = (password: string) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  });

  const getPasswordStrengthMeta = (password: string) => {
    if (!password) return { score: 0, label: 'Enter password', color: '#cbd5e1' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: Math.max(1, score), label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score, label: 'Medium', color: '#f59e0b' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  const updatePasswordStrengthUi = (password: string) => {
    state.loginForm.password = password || '';
    const meta = getPasswordStrengthMeta(password || '');
    const checks = getPasswordRuleChecks(password || '');
    const bar = document.querySelector('[data-password-strength-bar]') as HTMLElement | null;
    const label = document.querySelector('[data-password-strength-label]') as HTMLElement | null;
    if (!bar || !label) return;

    const width = `${Math.min(100, Math.round((meta.score / 6) * 100))}%`;
    bar.style.width = width;
    bar.style.background = meta.color;
    label.textContent = meta.label;
    label.style.color = meta.color;

    const ruleRows = [
      { key: 'length', ok: checks.length },
      { key: 'uppercase', ok: checks.uppercase },
      { key: 'number', ok: checks.number },
      { key: 'special', ok: checks.special }
    ];

    ruleRows.forEach(({ key, ok }) => {
      const row = document.querySelector(`[data-password-rule="${key}"]`) as HTMLElement | null;
      const icon = document.querySelector(`[data-password-rule-icon="${key}"]`) as HTMLElement | null;
      if (!row || !icon) return;

      if (!password) {
        row.classList.remove('bg-emerald-50', 'border-emerald-200', 'text-emerald-700', 'bg-red-50', 'border-red-200', 'text-red-700');
        row.classList.add('bg-slate-50', 'border-slate-200', 'text-slate-500');
        icon.textContent = 'â—‹';
        return;
      }

      if (ok) {
        row.classList.remove('bg-red-50', 'border-red-200', 'text-red-700', 'bg-slate-50', 'border-slate-200', 'text-slate-500');
        row.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-700');
        icon.textContent = 'âœ“';
      } else {
        row.classList.remove('bg-emerald-50', 'border-emerald-200', 'text-emerald-700', 'bg-slate-50', 'border-slate-200', 'text-slate-500');
        row.classList.add('bg-red-50', 'border-red-200', 'text-red-700');
        icon.textContent = 'âœ•';
      }
    });
  };

  (window as any).updatePasswordStrength = updatePasswordStrengthUi;

  const isSetupMode = false;
  const requiresStrongPassword = state.loginForm.isSignup;
  const passwordChecks = getPasswordRuleChecks(state.loginForm.password || '');
  const canSubmit = !requiresStrongPassword || Object.values(passwordChecks).every(Boolean);

  return `
  <div class="min-h-screen relative overflow-hidden login-shell">
    <div class="absolute inset-0 pointer-events-none overflow-hidden has-3d-tilt">
      <img src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80" alt="Interior background" class="w-full h-full object-cover motion-3d" data-motion3d="true" loading="eager" onerror="this.style.display='none'" />
      <div class="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-amber-400/30 blur-3xl motion-3d" data-motion3d="true"></div>
      <div class="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl motion-3d" data-motion3d="true"></div>
      <div class="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-white/20 blur-3xl motion-3d" data-motion3d="true"></div>
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-black/10 via-black/20 to-black/30"></div>
    </div>

    <div class="relative z-10 min-h-screen flex items-center py-10 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <section class="text-white">
          <div class="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-[color:var(--accent)] text-white font-bold flex items-center justify-center">A</div>
            <div>
              <div class="font-display text-xl font-bold tracking-wider">AR INTERIA</div>
              <div class="text-[11px] uppercase tracking-[0.25em] text-amber-200/90">Design Studio</div>
            </div>
          </div>

          <h1 class="mt-6 text-4xl sm:text-5xl font-display font-bold leading-tight login-title">
            ${isSetupMode ? 'System Setup' : state.loginForm.isSignup ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p class="mt-4 text-white/80 max-w-xl text-base sm:text-lg login-subtitle">
            ${isSetupMode
      ? 'Initialize your AR Interia platform with administrator credentials.'
      : state.loginForm.isSignup
        ? 'Join the AR Interia experience to manage your designs and bookings.'
        : 'Sign in to continue to your interior design workspace.'}
          </p>

          <div class="mt-8 grid grid-cols-3 gap-3 max-w-md">
            <div class="rounded-xl bg-white/10 border border-white/20 p-3 text-center has-3d-tilt transition-transform duration-200">
              <div class="text-2xl">ðŸŽ¨</div>
              <div class="text-xs mt-1 font-semibold">3D Designs</div>
            </div>
            <div class="rounded-xl bg-white/10 border border-white/20 p-3 text-center has-3d-tilt transition-transform duration-200">
              <div class="text-2xl">ðŸ </div>
              <div class="text-xs mt-1 font-semibold">AR Preview</div>
            </div>
            <div class="rounded-xl bg-white/10 border border-white/20 p-3 text-center has-3d-tilt transition-transform duration-200">
              <div class="text-2xl">ðŸ’¼</div>
              <div class="text-xs mt-1 font-semibold">Portfolio</div>
            </div>
          </div>
        </section>

        <section class="w-full">
          <div class="bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/40 overflow-hidden login-card has-3d-tilt transition-transform duration-200">
            ${isSetupMode ? '<div class="px-6 py-3 text-xs uppercase tracking-[0.25em] font-bold text-center bg-gradient-to-r from-amber-600 to-[color:var(--accent)] text-white">System Initialization</div>' : ''}

            <div class="p-6 sm:p-8">
              <div class="text-center mb-6">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-600 to-[color:var(--accent)] text-white text-2xl flex items-center justify-center shadow-lg">
                  ${isSetupMode ? 'ðŸ”§' : state.loginForm.isSignup ? 'âœ¨' : 'ðŸ‘¤'}
                </div>
                <h2 class="mt-3 text-2xl font-display font-bold text-slate-900 login-heading">
                  ${isSetupMode ? 'Admin Setup' : state.loginForm.isSignup ? 'Create Account' : 'Sign In'}
                </h2>
                <p class="mt-1 text-sm text-slate-600">
                  ${isSetupMode
      ? 'Set up the first administrator account (default: admin954809@gmail.com / Admin@1234)'
      : state.loginForm.isSignup
        ? 'Start your design journey today'
        : 'Enter your credentials to continue'}
                </p>
              </div>

              <form data-form="login" class="space-y-4">
                ${state.loginForm.twoFactorChallengeId ? `
                  <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-2">
                    <div class="font-semibold">Two-factor verification required</div>
                    <div>${escapeHtml(state.loginForm.twoFactorMessage || 'Enter the verification code sent to your email.')}</div>
                    ${state.loginForm.twoFactorDeliveryMethod ? `<div class="text-xs text-amber-800/80">Delivery: ${escapeHtml(state.loginForm.twoFactorDeliveryMethod)}${state.loginForm.twoFactorDeliveredTo ? ` Â· ${escapeHtml(state.loginForm.twoFactorDeliveredTo)}` : ''}</div>` : ''}
                    ${state.loginForm.twoFactorDebugCode ? `<div class="text-xs font-semibold text-amber-900">Dev code: ${escapeHtml(state.loginForm.twoFactorDebugCode)}</div>` : ''}
                  </div>
                ` : ''}

                ${state.loginForm.twoFactorChallengeId ? `
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">ðŸ”¢</span>
                    <input
                      name="verificationCode"
                      data-bind="loginForm.twoFactorCode"
                      inputmode="numeric"
                      autocomplete="one-time-code"
                      value="${escapeHtml(state.loginForm.twoFactorCode || '')}"
                      placeholder="Enter 6-digit verification code"
                      class="w-full pl-11 pr-4 py-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>
                ` : ''}

                ${(isSetupMode || state.loginForm.isSignup) ? `
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">ðŸ‘¤</span>
                    <input name="name" required placeholder="Full Name" class="w-full pl-11 pr-4 py-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white focus:border-amber-500 outline-none" />
                  </div>
                ` : ''}

                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">ðŸ“§</span>
                  <input
                    name="email"
                    data-bind="loginForm.email"
                    required
                    value="${escapeHtml(state.loginForm.email || '')}"
                    placeholder="Email or Username"
                    class="w-full pl-11 pr-4 py-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">ðŸ”’</span>
                  <input
                    name="password"
                    data-bind="loginForm.password"
                    required
                    type="${state.loginForm.showPassword ? 'text' : 'password'}"
                    value="${escapeHtml(state.loginForm.password || '')}"
                    placeholder="Password"
                    oninput="window.updatePasswordStrength && window.updatePasswordStrength(this.value)"
                    class="w-full pl-11 pr-12 py-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white focus:border-amber-500 outline-none"
                  />
                  <button type="button" data-action="toggle-password" aria-label="Toggle password" class="absolute right-4 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-600">${state.loginForm.showPassword ? 'ðŸ™ˆ' : 'ðŸ‘ï¸'}</button>
                </div>

                <div class="-mt-1">
                  <div class="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div data-password-strength-bar class="h-full rounded-full transition-all" style="width:0%;background:#cbd5e1;"></div>
                  </div>
                  <div class="mt-1 text-xs font-semibold text-slate-500">Strength: <span data-password-strength-label>Enter password</span></div>
                  <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div data-password-rule="length" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="length" class="font-bold">â—‹</span><span>At least 8 characters</span></div>
                    <div data-password-rule="uppercase" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="uppercase" class="font-bold">â—‹</span><span>One uppercase letter</span></div>
                    <div data-password-rule="number" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="number" class="font-bold">â—‹</span><span>One number</span></div>
                    <div data-password-rule="special" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="special" class="font-bold">â—‹</span><span>One special character</span></div>
                  </div>
                </div>

                ${(isSetupMode || state.loginForm.isSignup) ? `
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">ðŸ”</span>
                    <input name="confirmPassword" required type="${state.loginForm.showConfirmPassword ? 'text' : 'password'}" placeholder="Confirm Password" class="w-full pl-11 pr-12 py-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white focus:border-amber-500 outline-none" />
                    <button type="button" data-action="toggle-confirm-password" aria-label="Toggle confirm password" class="absolute right-4 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-600">${state.loginForm.showConfirmPassword ? 'ðŸ™ˆ' : 'ðŸ‘ï¸'}</button>
                  </div>
                ` : ''}

                ${state.loginError ? `
                  <div class="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <span>âš ï¸</span><span>${escapeHtml(state.loginError)}</span>
                  </div>
                ` : ''}

                <button type="submit" ${canSubmit ? '' : 'disabled'} class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-[color:var(--accent)] text-white font-bold shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed login-submit-btn">
                  ${isSetupMode ? 'Initialize System' : state.loginForm.twoFactorChallengeId ? 'Verify Code' : state.loginForm.isSignup ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              ${state.loginForm.twoFactorChallengeId ? `
                <div class="mt-4 text-center">
                  <button type="button" data-action="cancel-two-factor" class="text-sm font-semibold text-slate-500 hover:text-slate-700">Back to login</button>
                </div>
              ` : ''}

              ${!isSetupMode ? `
                <div class="mt-5 text-center">
                  <button type="button" data-action="toggle-signup" class="text-sm font-semibold text-amber-700 hover:text-amber-600">
                    ${state.loginForm.isSignup ? 'Already have an account? Sign In' : 'New here? Create Account'}
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
  `;
};

// Expose legacy AI studio renderer for feature-wrapper delegation.
(globalThis as any).renderAiStudio = renderAiStudio;

const renderAccessDenied = (message: string) => {
  return `
  <div class="py-20 text-center" >
    <h2 class="text-2xl font-display font-bold text-[color:var(--primary)]" > ${escapeHtml(message)} </h2>
      <button data-action="nav" data-tab="login" class="mt-4 text-[color:var(--accent)] font-semibold" > Go to Login </button>
        </div>
          `;
};

const renderModelViewer = (model: DesignModel) => {
  const modelSrc = model.modelUrl ? normalizeAssetUrl(model.modelUrl) : '';
  const modelDisplayName = resolveDesignDisplayName(model, {
    imageUrl: model.previewImage,
    categoryId: model.categoryId,
    fallback: model.title || 'Design'
  });
  if (modelSrc) {
    return `
        <div data-model-viewer class="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-[32px] overflow-hidden shadow-xl border border-black/5" >
          <model-viewer
src="${escapeHtml(modelSrc)}"
poster="${escapeHtml(model.previewImage || '')}"
alt="${escapeHtml(modelDisplayName)}"
class="model-viewer"
camera-controls
auto-rotate
ar
ar-modes="webxr scene-viewer quick-look"
exposure="1"
  ></model-viewer>
  <img
data-model-fallback
src="${escapeHtml(model.previewImage || '')}"
alt="${escapeHtml(modelDisplayName)}"
class="model-fallback"
loading="lazy"
  />
  </div>
    `;
  }

  return `
  <div class="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-[32px] overflow-hidden shadow-xl border border-black/5" >
    <img 
        src="${escapeHtml(model.previewImage)}"
alt="${escapeHtml(modelDisplayName)}"
data-motion3d="${model.motion3d === true ? 'true' : 'false'}"
class="motion-3d w-full h-full object-cover"
loading="lazy"
  />
  </div>
    `;
};

const normalizeBookingPaymentStatus = (status: unknown): Booking['paymentStatus'] => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'paid' || normalized === 'success' || normalized === 'completed') return 'paid';
  if (normalized === 'failed' || normalized === 'error' || normalized === 'cancelled') return 'failed';
  return 'pending';
};

const getBookingPaymentStatus = (booking: any): Booking['paymentStatus'] => {
  const bookingStatus = String(booking?.status || '').trim().toLowerCase();
  if (bookingStatus === 'paid' || bookingStatus === 'confirmed' || bookingStatus === 'fulfilled' || bookingStatus === 'completed') {
    return 'paid';
  }

  const candidateStatuses = [
    booking?.paymentStatus,
    booking?.payment_status,
    booking?.payment?.status,
    booking?.payment?.paymentStatus,
    booking?.latestPaymentStatus,
    booking?.latest_payment_status,
    booking?.transactionStatus,
    booking?.paymentResult
  ];

  const localPayments = getPayments();
  const bookingId = String(booking?.id || '').trim();
  const paymentId = String(booking?.paymentId || '').trim();
  const matchingLocalPayment = [...localPayments]
    .reverse()
    .find((payment: any) => (
      (bookingId && String(payment?.bookingId || '').trim() === bookingId)
      || (paymentId && String(payment?.id || '').trim() === paymentId)
    ));

  if (matchingLocalPayment) {
    candidateStatuses.push(matchingLocalPayment?.status, (matchingLocalPayment as any)?.paymentStatus);
  }

  const resolvedStatus = candidateStatuses.find((value) => String(value || '').trim().length > 0);
  return normalizeBookingPaymentStatus(resolvedStatus);
};


const bindModelViewers = () => {
  const containers = Array.from(document.querySelectorAll('[data-model-viewer]')) as HTMLElement[];
  containers.forEach((container) => {
    const viewer = container.querySelector('model-viewer') as HTMLElement | null;
    const fallback = container.querySelector('[data-model-fallback]') as HTMLElement | null;
    if (!viewer || !fallback) return;
    const showFallback = () => {
      viewer.classList.add('is-hidden');
      fallback.classList.add('is-active');
    };
    const showViewer = () => {
      viewer.classList.remove('is-hidden');
      fallback.classList.remove('is-active');
    };
    viewer.addEventListener('error', showFallback);
    viewer.addEventListener('load', showViewer);
  });
};

let modelViewerLoaderPromise: Promise<void> | null = null;
const ensureModelViewerLoaded = (): Promise<void> => {
  if (customElements.get('model-viewer')) {
    return Promise.resolve();
  }

  if (modelViewerLoaderPromise) {
    return modelViewerLoaderPromise;
  }

  modelViewerLoaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-model-viewer-loader="1"]') as HTMLScriptElement | null;
    if (existing) {
      const onLoad = () => resolve();
      const onError = () => reject(new Error('Failed to lazy-load model-viewer.'));
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.setAttribute('data-model-viewer-loader', '1');
    script.addEventListener('load', () => {
      console.log('model-viewer loaded lazily');
      resolve();
    }, { once: true });
    script.addEventListener('error', () => {
      reject(new Error('Failed to lazy-load model-viewer.'));
    }, { once: true });
    document.head.appendChild(script);
  })
    .catch((error) => {
      console.warn('Failed to lazy-load model-viewer:', error);
      throw error;
    })
    .finally(() => {
      if (!customElements.get('model-viewer')) {
        modelViewerLoaderPromise = null;
      }
    });

  return modelViewerLoaderPromise;
};

// handleLogin is implemented later in the file; earlier duplicate removed

// --- Backend integration layer (admin data sync) ----------------------------
