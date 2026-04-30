// @ts-nocheck
// Reference copies generated from main.ts for organization only.
// Runtime source of truth remains main.ts.

// DATABASE/STORAGE LAYER COPY
// --- Database/storage imports ------------------------------------------------
import {
  seedDashboardData,
  forceReseedCategories,
  forceReseedDesigns,
  getTheme,
  setTheme as persistTheme,
  getCategories,
  getDesigns,
  getBookings,
  getCategoryEarnings,
  getProfitLossData,
  saveCategory,
  updateCategory,
  deleteCategory,
  saveDesign,
  updateDesign,
  deleteDesign,
  updateBooking,
  getPayments,
  getLikes,
  setLike,
  createBooking,
  createPayment,
  updatePayment,
  getRelatedDesigns,
  getFeedbacks,
  addFeedback,
  getShowrooms,
  saveShowroom,
  updateShowroom,
  deleteShowroom,
  getServiceShowcases,
  saveServiceShowcase,
  updateServiceShowcase,
  deleteServiceShowcase,
  getAnnouncements,
  saveAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
  getDiscountCodes,
  getActiveDiscountCodes,
  saveDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  getPackages,
  getPackagesSync,
  setPackages,
  savePackage,
  updatePackage,
  deletePackage,
  STORAGE_KEYS,
  writeStorage,
  getCalculatorSettings,
  writeCalculatorSettings,
  getCalculationHistory,
  saveCalculationRecord,
  getCalculatorImageLibrary,
  writeCalculatorImageLibrary
} from './services/dataStore';


// --- Database/storage layer (local persistence + hydration) -----------------
const loadState = async () => {
  purgeLegacyPackageCaches();

  // Always call seedDashboardData to ensure latest category mappings and settings
  seedDashboardData();

  // Fast path: hydrate immediately from local storage so first render is not blocked by network.
  const fallbackCategories = getCategories().map((category: Category) => normalizeCategoryMotion3D(category));
  if (!fallbackCategories.length) {
    forceReseedCategories();
  }
  state.customer.categories = getCategories().map((category: Category) => normalizeCategoryMotion3D(category));

  const fallbackDesigns = getDesigns().map((design: DesignModel) => normalizeDesignMotion3D(design));
  if (!fallbackDesigns.length) {
    forceReseedDesigns();
  }
  state.customer.designs = getDesigns().map((design: DesignModel) => normalizeDesignMotion3D(design));
  state.catalog = state.customer.designs.map((design: DesignModel) => normalizeDesignMotion3D(design));

  // Keep first paint fast by not blocking on package sync.
  void getPackages().catch((error) => {
    console.warn('Initial package sync failed, using local cache fallback:', error);
  });

  // Non-blocking network hydration: refresh local snapshot in the background.
  void Promise.allSettled([
    apiFetch('/categories', {}, 1800).then((response) => (response.ok ? response.json() : null)),
    apiFetch('/designs', {}, 1800).then((response) => (response.ok ? response.json() : null)),
    apiFetch('/packages', {}, 1800).then((response) => (response.ok ? response.json() : null))
  ]).then(([categoriesResult, designsResult, packagesResult]) => {
    const categoriesPayload = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;
    const apiCategories = Array.isArray(categoriesPayload)
      ? categoriesPayload
      : (Array.isArray((categoriesPayload as any)?.categories) ? (categoriesPayload as any).categories : null);

    if (Array.isArray(apiCategories) && apiCategories.length > 0) {
      state.customer.categories = apiCategories.map((cat: any) => normalizeCategoryMotion3D({
        ...cat,
        image: cat.image ? normalizeAssetUrl(cat.image) : cat.image,
        background: cat.background ? normalizeAssetUrl(cat.background) : cat.background,
        thumbnail: cat.thumbnail ? normalizeAssetUrl(cat.thumbnail) : cat.thumbnail,
        images: Array.isArray(cat.images)
          ? cat.images.map((img: any) => ({ ...img, url: img?.url ? normalizeAssetUrl(img.url) : img?.url }))
          : cat.images
      }));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.customer.categories));
      console.log('✅ Loaded categories from API:', state.customer.categories.length);
    }

    const designsPayload = designsResult.status === 'fulfilled' ? designsResult.value : null;
    const apiDesigns = Array.isArray(designsPayload)
      ? designsPayload
      : (Array.isArray((designsPayload as any)?.designs) ? (designsPayload as any).designs : null);

    if (Array.isArray(apiDesigns) && apiDesigns.length > 0) {
      const mappedDesigns = apiDesigns.map((design: any) => normalizeDesignMotion3D({
        ...design,
        previewImage: design.previewImage ? normalizeAssetUrl(design.previewImage) : design.previewImage,
        images: (() => {
          if (!design.images) return [];
          let rawImages: any = design.images;
          if (typeof design.images === 'string') {
            try {
              rawImages = JSON.parse(design.images);
            } catch {
              rawImages = [];
            }
          }
          return Array.isArray(rawImages) ? rawImages.map((img: string) => normalizeAssetUrl(img)) : [];
        })()
      }));

      const mergedDesigns = mergeDesignsPreferServer(getDesigns(), mappedDesigns);

      state.catalog = mergedDesigns;
      state.customer.designs = mergedDesigns;
      localStorage.setItem(STORAGE_KEYS.designs, JSON.stringify(mergedDesigns));
      localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(mergedDesigns));
      console.log('✅ Loaded designs from API:', mergedDesigns.length);
    }

    // Load packages from API
    const packagesPayload = packagesResult.status === 'fulfilled' ? packagesResult.value : null;
    const apiPackages = Array.isArray(packagesPayload)
      ? packagesPayload
      : (Array.isArray((packagesPayload as any)?.data) ? (packagesPayload as any).data : null);

    if (Array.isArray(apiPackages) && apiPackages.length > 0) {
      writeStorage(STORAGE_KEYS.packages, apiPackages);
      console.log('✅ Loaded packages from API:', apiPackages.length);
    }

    renderStabilized();
  }).catch((error) => {
    console.warn('Background hydration skipped:', error);
  });

  setThemeVars();

  const savedUser = localStorage.getItem(STORAGE_KEYS.users + '_current');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
      syncCustomerPackagePreferences(state.currentUser?.id);
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
      localStorage.removeItem(STORAGE_KEYS.users + '_current');
      syncCustomerPackagePreferences(null);
    }
  } else {
    syncCustomerPackagePreferences(null);
  }

  const savedAdmin = localStorage.getItem(STORAGE_KEYS.users + '_admin_acc');
  if (savedAdmin) {
    try {
      state.adminAccount = JSON.parse(savedAdmin);
    } catch (e) {
      console.warn('Failed to parse saved admin:', e);
      localStorage.removeItem(STORAGE_KEYS.users + '_admin_acc');
      const defaultAdmin: User = {
        id: 'admin-default',
        name: 'Administrator',
        email: 'admin954809@gmail.com',
        role: 'admin',
        password: 'Admin@1234'
      };
      state.adminAccount = defaultAdmin;
      localStorage.setItem(STORAGE_KEYS.users + '_admin_acc', JSON.stringify(defaultAdmin));
    }
  } else {
    const defaultAdmin: User = {
      id: 'admin-default',
      name: 'Administrator',
      email: 'admin954809@gmail.com',
      role: 'admin',
      password: 'Admin@1234'
    };
    state.adminAccount = defaultAdmin;
    localStorage.setItem(STORAGE_KEYS.users + '_admin_acc', JSON.stringify(defaultAdmin));
  }

  const savedUsers = localStorage.getItem(STORAGE_KEYS.users);
  if (savedUsers) {
    try {
      state.users = JSON.parse(savedUsers);
    } catch (e) {
      console.warn('Failed to parse saved users:', e);
      localStorage.removeItem(STORAGE_KEYS.users);
    }
  }

  const savedInquiries = localStorage.getItem(STORAGE_KEYS.inquiries);
  if (savedInquiries) {
    try {
      state.inquiries = JSON.parse(savedInquiries);
    } catch (e) {
      console.warn('Failed to parse saved inquiries:', e);
      localStorage.removeItem(STORAGE_KEYS.inquiries);
    }
  }

  const savedFeedbacks = localStorage.getItem(STORAGE_KEYS.feedbacks);
  if (savedFeedbacks) {
    try {
      state.feedbacks = JSON.parse(savedFeedbacks);
      state.customer.feedbacks = Array.isArray(state.feedbacks) ? [...state.feedbacks] : [];
    } catch (e) {
      console.warn('Failed to parse saved feedbacks:', e);
      localStorage.removeItem(STORAGE_KEYS.feedbacks);
    }
  }

  // Use timeout for settings file URL to avoid blocking
  const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings) as SiteSettings;
      // Don't await this - let it load in background
      Promise.race([
        getFileUrl('site-hero-bg'),
        new Promise(resolve => setTimeout(() => resolve(null), 200)) // 200ms timeout
      ]).then((siteBgUrl) => {
        if (siteBgUrl) state.siteSettings.heroBg = siteBgUrl as string;
      }).catch((error) => {
        console.warn('Failed to load site settings:', error);
      });
      state.siteSettings = parsed;
    } catch (e) {
      console.warn('Failed to parse saved settings:', e);
      localStorage.removeItem(STORAGE_KEYS.settings);
    }
  }

  const savedServices = localStorage.getItem(STORAGE_KEYS.services);
  if (savedServices) {
    try {
      const parsedServices = JSON.parse(savedServices);
      state.services = (Array.isArray(parsedServices) ? parsedServices : []).map((service: any, index: number) => ({
        ...service,
        id: String(service?.id || `s-${index}`),
        title: String(service?.title || ''),
        icon: String(service?.icon || '🛠️'),
        description: String(service?.description || ''),
        video: resolvePlayableVideoUrl(String(service?.video || service?.image || ''))
      }));
      writeStorage(STORAGE_KEYS.services, state.services);
    } catch (e) {
      console.warn('Failed to parse saved services:', e);
      localStorage.removeItem(STORAGE_KEYS.services);
      state.services = INITIAL_SERVICES.map((s, i) => ({ ...s, id: `s-${i}` }));
    }
  } else {
    state.services = INITIAL_SERVICES.map((s, i) => ({ ...s, id: `s-${i}` }));
  }
  ensureServiceManagerDefaults();

  const savedCatalog = localStorage.getItem(STORAGE_KEYS.catalog);
  let baseCatalog: DesignModel[] = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : SAMPLE_MODELS;
  if (savedCatalog) {
    try {
      const parsedCatalog = JSON.parse(savedCatalog);
      if (!(state.customer.designs && state.customer.designs.length > 0)) {
        baseCatalog = parsedCatalog;
      }
    } catch (e) {
      console.warn('Failed to parse saved catalog:', e);
      localStorage.removeItem(STORAGE_KEYS.catalog);
      baseCatalog = (state.customer.designs && state.customer.designs.length > 0)
        ? state.customer.designs
        : SAMPLE_MODELS;
    }
  }

  // Skip async file URL resolution - just use the URLs as-is for faster load
  state.catalog = baseCatalog.map((model) => {
    // Only process local models (which are rare)
    if (model.id.startsWith('local-')) {
      // Load these in background without blocking
      Promise.all([
        getFileUrl(`${model.id}-glb`).catch((error) => {
          console.warn('Failed to load model file URL:', error);
          return null;
        }),
        getFileUrl(`${model.id}-img`).catch((error) => {
          console.warn('Failed to load image file URL:', error);
          return null;
        })
      ]).then(([modelUrl, imgUrl]) => {
        const catalogItem = state.catalog.find(m => m.id === model.id);
        if (catalogItem) {
          if (modelUrl) catalogItem.modelUrl = modelUrl as string;
          if (imgUrl) catalogItem.previewImage = imgUrl as string;
          // Trigger re-render if currently viewing gallery
          if (state.activeTab === 'gallery') {
            render();
          }
        }
      });
    }
    return model;
  });

  const firstActive = state.catalog.find((m) => !m.isDeleted);
  state.selectedModelId = firstActive?.id || null;

  syncStats();

  // Load and repair showroom data so malformed local entries do not break admin/customer views.
  const loadedShowrooms = getShowrooms();
  const validShowrooms = (Array.isArray(loadedShowrooms) ? loadedShowrooms : [])
    .map((showroom: any, index: number) => normalizeShowroomRecord(showroom, index))
    .filter((showroom: any) => showroom.id && showroom.city && showroom.locations?.length > 0);
  state.showrooms = validShowrooms;
  if (validShowrooms.length > 0) {
    writeStorage(STORAGE_KEYS.showrooms, validShowrooms);
  }

  // Load showcases
  const savedShowcases = getServiceShowcases();
  if (savedShowcases && savedShowcases.length > 0) {
    // Filter valid showcases: must have a title, and image must not be an empty blob URL
    const validShowcases = savedShowcases.filter((s: any) => {
      if (!s.title || !s.id) return false;
      if (!s.image) return true; // allow empty image (handled with placeholder)
      if (s.image.startsWith('blob:')) return false; // blob URLs don't persist
      return true;
    });
    if (validShowcases.length > 0) {
      state.serviceShowcases = validShowcases.map((s: any, index: number) => normalizeShowcaseRecord(s, index));
      writeStorage(STORAGE_KEYS.showcases, state.serviceShowcases);
    } else {
      state.serviceShowcases = INITIAL_SERVICE_SHOWCASES;
      writeStorage(STORAGE_KEYS.showcases, INITIAL_SERVICE_SHOWCASES);
    }
  } else {
    state.serviceShowcases = INITIAL_SERVICE_SHOWCASES;
  }
};

const mergeDesignsPreferServer = (localDesigns: DesignModel[], serverDesigns: DesignModel[] | null) => {
  if (Array.isArray(serverDesigns) && serverDesigns.length > 0) {
    const localById = new Map(localDesigns.map((design) => [String(design.id || ''), design]));
    const localByKey = new Map(
      localDesigns.map((design) => [
        normalizeKey(`${design.title || ''}|${design.previewImage || ''}|${design.categoryId || ''}|${design.category || ''}`),
        design
      ])
    );

    const mergedServerDesigns = serverDesigns.map((design) => {
      const localMatch = localById.get(String(design.id || ''))
        || localByKey.get(normalizeKey(`${design.title || ''}|${design.previewImage || ''}|${design.categoryId || ''}|${(design as any).category || ''}`));
      const serverAmount = getDesignAmount(design);
      const localAmount = getDesignAmount(localMatch);
      const resolvedAmount = serverAmount > 0 ? serverAmount : localAmount;

      return {
        ...localMatch,
        ...design,
        price: resolvedAmount,
        cost: resolvedAmount
      } as DesignModel;
    });

    const matchedLocalIds = new Set(mergedServerDesigns.map((design) => String(design.id || '')));
    const matchedLocalKeys = new Set(
      mergedServerDesigns.map((design) => normalizeKey(`${design.title || ''}|${design.previewImage || ''}|${design.categoryId || ''}|${(design as any).category || ''}`))
    );
    const localOnlyDesigns = localDesigns.filter((design) => {
      const designId = String(design.id || '');
      if (designId && matchedLocalIds.has(designId)) return false;
      const designKey = normalizeKey(`${design.title || ''}|${design.previewImage || ''}|${design.categoryId || ''}|${(design as any).category || ''}`);
      return !designKey || !matchedLocalKeys.has(designKey);
    });

    return [...mergedServerDesigns, ...localOnlyDesigns];
  }
  return localDesigns;
};

const SERVICE_MANAGER_SAMPLES: ServiceItem[] = [
  {
    id: 'svc-studio-3d',
    title: '3D Design Studio',
    icon: '🎨',
    description: 'Photorealistic room concepts, zoning, and walkthrough-ready design proposals before execution.',
    video: '/videos/interior-video-1.mp4'
  },
  {
    id: 'svc-design-view',
    title: 'Design View',
    icon: '📐',
    description: 'Material boards, elevation references, and side-by-side concept comparisons for confident approvals.',
    video: '/videos/interior-video-2.mp4'
  },
  {
    id: 'svc-turnkey-execution',
    title: 'Turnkey Execution',
    icon: '🏗️',
    description: 'End-to-end execution from BOQ and vendor coordination to site delivery and final handover.',
    video: '/videos/interior-video-3.mp4'
  }
];

const ensureServiceManagerDefaults = () => {
  const existing = Array.isArray(state.services) ? state.services : [];
  const byKey = new Set(existing.map((svc) => normalizeKey(`${svc.title || ''} ${svc.id || ''}`)));
  const merged = [...existing];

  SERVICE_MANAGER_SAMPLES.forEach((sample, idx) => {
    const sampleKey = normalizeKey(`${sample.title} ${sample.id}`);
    if (!byKey.has(sampleKey)) {
      merged.push({ ...sample, id: sample.id || `svc-sample-${idx}` });
    }
  });

  if (merged.length !== existing.length) {
    state.services = merged;
    writeStorage(STORAGE_KEYS.services, state.services);
  }
};

const normalizeFeedbackVideoEntries = (videos: any[]) => videos
  .map((video: any, index: number) => ({
    title: String(video?.title || video?.name || `Client Feedback ${index + 1}`),
    url: normalizeAssetUrl(String(video?.url || video?.videoUrl || '')),
    showOnHomepage: video?.showOnHomepage !== false,
    showOnPortfolio: video?.showOnPortfolio !== false
  }))
  .filter((video: any) => {
    const url = String(video?.url || '');
    if (!url) return false;
    // Accept standard playable video sources used in portfolio feedback.
    if (/^(data:video\/|blob:)/i.test(url)) return true;
    if (url.includes('/uploads/') || url.includes('/videos/')) return true;
    if (/(youtube\.com|youtu\.be|vimeo\.com)/i.test(url)) return true;
    if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)) return true;
    // Allow remote CDN/media URLs that may not expose extension in the path.
    if (/^https?:\/\//i.test(url)) return true;
    return false;
  });

const mergeExistingLocalFeedbackVideos = async () => {
  try {
    // Keep feedback videos strictly admin-managed from portfolio content.
    // Do not pull every file from /videos into homepage/portfolio feedback sections.
    state.portfolioContent.feedbackVideos = normalizeFeedbackVideoEntries(state.portfolioContent?.feedbackVideos || []);
  } catch (error) {
    console.warn('Failed to merge local feedback videos:', error);
  }
};

const cleanupAdminCharts = () => {
  stopAdminChartsAutoRefresh();
  if (adminChartsRetryTimer != null) {
    window.clearTimeout(adminChartsRetryTimer);
    adminChartsRetryTimer = null;
  }
  adminChartsObserver?.disconnect();
  adminChartsObserver = null;
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  // Clear the charts object
  for (const key in charts) {
    delete (charts as any)[key];
  }
  console.log('Admin charts cleaned up.');
};


// --- Database/storage layer (customer dashboard preferences) ----------------
const getHiddenBookingIds = (): string[] => {
  try {
    const raw = localStorage.getItem(HIDDEN_BOOKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((item) => String(item || '')).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const setHiddenBookingIds = (ids: string[]) => {
  localStorage.setItem(HIDDEN_BOOKINGS_KEY, JSON.stringify(Array.from(new Set(ids.map((item) => String(item || '')).filter(Boolean)))));
};

const getPackagePreferenceMap = () => {
  try {
    const raw = localStorage.getItem(PACKAGE_PREFERENCES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const getSavedPackageIdsForUser = (userId?: string | null) => {
  if (!userId) return [] as string[];
  const map = getPackagePreferenceMap() as Record<string, unknown>;
  const entry = map[String(userId)] as unknown;
  return Array.isArray(entry) ? Array.from(new Set(entry.map((item) => String(item || '')).filter(Boolean))) : [];
};

const setSavedPackageIdsForUser = (userId: string, packageIds: string[]) => {
  const map = getPackagePreferenceMap() as Record<string, string[]>;
  map[String(userId)] = Array.from(new Set(packageIds.map((item) => String(item || '')).filter(Boolean)));
  localStorage.setItem(PACKAGE_PREFERENCES_KEY, JSON.stringify(map));
  (state.customer as any).likedPackageIds = map[String(userId)];
};

const syncCustomerPackagePreferences = (userId?: string | null) => {
  (state.customer as any).likedPackageIds = getSavedPackageIdsForUser(userId);
};

const toggleCustomerPackagePreference = (userId: string, packageId: string) => {
  const current = getSavedPackageIdsForUser(userId);
  const next = current.includes(packageId)
    ? current.filter((id) => id !== packageId)
    : [...current, packageId];
  setSavedPackageIdsForUser(userId, next);
  return next;
};

const removeCustomerPackagePreference = (userId: string, packageId: string) => {
  const next = getSavedPackageIdsForUser(userId).filter((id) => id !== packageId);
  setSavedPackageIdsForUser(userId, next);
  return next;
};

const removeCustomerPreference = (userId: string, designId: string) => {
  const currentLikes = Array.isArray(state.customer.likes) && state.customer.likes.length > 0
    ? state.customer.likes
    : getLikes();
  const nextLikes = currentLikes.filter((like: any) => !(String(like.userId || '') === String(userId) && String(like.designId || '') === String(designId)));

  const localLikes = getLikes();
  const nextLocalLikes = localLikes.filter((like: any) => !(String(like.userId || '') === String(userId) && String(like.designId || '') === String(designId)));
  writeStorage(STORAGE_KEYS.likes, nextLocalLikes);

  const feedbackRecords = getDislikeFeedbackRecords();
  const nextFeedback = feedbackRecords.filter((item: any) => !(String(item.userId || '') === String(userId) && String(item.designId || '') === String(designId)));
  setDislikeFeedbackRecords(nextFeedback);

  return nextLikes;
};

const setDislikeFeedbackRecords = (records: any[]) => {
  localStorage.setItem(DISLIKE_FEEDBACK_STORAGE_KEY, JSON.stringify(records));
};

const addDislikeFeedbackRecord = (record: any) => {
  const current = getDislikeFeedbackRecords();
  const next = [record, ...current];
  setDislikeFeedbackRecords(next);
  return next;
};

const updateDislikeFeedbackReply = (id: string, adminReply: string, adminName?: string) => {
  const current = getDislikeFeedbackRecords();
  const next = current.map((item: any) => String(item.id || '') === String(id)
    ? {
      ...item,
      adminReply,
      adminName: adminName || item.adminName || 'Admin',
      respondedAt: new Date().toISOString()
    }
    : item);
  setDislikeFeedbackRecords(next);
  return next;
};

const ensureDislikeFeedbackSampleData = () => {
  const current = getDislikeFeedbackRecords();
  if (current.length > 0) return;
  const categories = getCustomerVisibleCategories(state.customer.categories && state.customer.categories.length ? state.customer.categories : getCategories());
  const sampleDesign = (state.customer.designs && state.customer.designs.length ? state.customer.designs : getDesigns())[0];
  if (!sampleDesign) return;
  const sampleUser = state.users.find((user) => String(user?.role || 'customer').toLowerCase() === 'customer') || state.currentUser;
  if (!sampleUser) return;
  const selectedCategory = categories.find((cat) => cat.id === sampleDesign.categoryId) || null;
  setDislikeFeedbackRecords([
    {
      id: `dislike-fb-${Date.now()}`,
      userId: sampleUser.id,
      userName: sampleUser.name,
      designId: sampleDesign.id,
      designTitle: resolveDesignDisplayName(sampleDesign, {
        imageUrl: sampleDesign.previewImage,
        categoryId: sampleDesign.categoryId,
        categoryName: selectedCategory?.title || selectedCategory?.name,
        fallback: sampleDesign.title || 'Design'
      }),
      categoryId: sampleDesign.categoryId || '',
      comment: 'Not matching my preferred style. Need more modern color combination.',
      adminReply: 'Thanks for your feedback. We are adding modern alternatives in this category.',
      adminName: 'Admin',
      createdAt: new Date().toISOString(),
      respondedAt: new Date().toISOString()
    }
  ]);
};

const getCustomerCategoryBackedDesigns = () => {
  const categories = getCustomerVisibleCategories(state.customer.categories && state.customer.categories.length ? state.customer.categories : getCategories());
  const categoryImageKeys = new Set(
    categories.flatMap((cat) => (cat.images || []).map((img: any) => getFilenameKey(String(img?.url || '')))).filter(Boolean)
  );
  const allDesigns = (state.customer.designs && state.customer.designs.length ? state.customer.designs : getDesigns())
    .filter((design) => !isQATestDesign(design));
  return allDesigns.filter((design) => {
    const designKeys = getCategoryMatchKeySet(design.categoryId || '', design.category || '');
    const hasCategoryMatch = categories.some((cat) => {
      const categoryKeys = getCategoryMatchKeySet(cat.id || '', cat.title || '', cat.name || '');
      return Array.from(designKeys).some((key) => categoryKeys.has(key));
    });
    if (hasCategoryMatch) return true;
    const designFile = getFilenameKey(String(design.previewImage || (design.images && design.images[0]) || ''));
    return Boolean(designFile && categoryImageKeys.has(designFile));
  });
};

const getDesignAmount = (design: Partial<DesignModel> | null | undefined) => {
  const primary = parseAmountValue((design as any)?.price);
  if (primary > 0) return primary;
  const fallback = parseAmountValue((design as any)?.cost);
  if (fallback > 0) return fallback;
  const amount = parseAmountValue((design as any)?.amount);
  if (amount > 0) return amount;

  // Final fallback: resolve only by the same design id from current data sources.
  const designId = String((design as any)?.id || '').trim();
  if (!designId) return 0;

  const sourceDesigns = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  const sameDesign = sourceDesigns.find((candidate) => String(candidate?.id || '') === designId);
  if (!sameDesign) return 0;

  return parseAmountValue((sameDesign as any).price)
    || parseAmountValue((sameDesign as any).cost)
    || parseAmountValue((sameDesign as any).amount);
};

const getGeneratedDesignAmount = (seed: string, baseAmount: number) => {
  const safeBase = baseAmount > 0 ? baseAmount : 120000;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const deltaStep = (Math.abs(hash) % 9) - 4; // -4 to +4
  const amount = Math.max(25000, safeBase + (deltaStep * 2500));
  return Math.round(amount / 500) * 500;
};

const getCustomerDesignPresentation = (design: Partial<DesignModel> | null | undefined) => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const designFileKey = getFilenameKey(String(design?.previewImage || (design as any)?.imageUrl || ((design as any)?.images && (design as any).images[0]) || ''));
  const designKeys = getCategoryMatchKeySet(String(design?.categoryId || ''), String((design as any)?.category || ''));

  let matchedCategory: any = null;
  let matchedImage: any = null;

  for (const category of categories) {
    const categoryKeys = getCategoryMatchKeySet(category.id || '', category.title || '', category.name || '');
    const categoryMatches = designKeys.size > 0 && Array.from(categoryKeys).some((key) => designKeys.has(key));
    if (!categoryMatches && !designFileKey) continue;
    const images = Array.isArray((category as any).images) ? (category as any).images : [];
    const byImage = images.find((image: any) => {
      const byFilename = String(image?.filename || '').toLowerCase();
      const byUrlFile = getFilenameKey(String(image?.url || ''));
      return Boolean(designFileKey && (designFileKey === byFilename || designFileKey === byUrlFile));
    });
    if (byImage || categoryMatches) {
      matchedCategory = category;
      matchedImage = byImage || images[0] || null;
      if (byImage) break;
    }
  }

  const imageUrl = String(matchedImage?.url || design?.previewImage || (design as any)?.imageUrl || ((design as any)?.images && (design as any).images[0]) || '');
  const displayName = resolveDesignDisplayName(design as any, {
    imageName: matchedImage?.name,
    imageUrl,
    categoryId: matchedCategory?.id || String(design?.categoryId || ''),
    categoryName: matchedCategory?.title || matchedCategory?.name || String((design as any)?.category || ''),
    fallback: String(design?.title || 'Design')
  });

  return {
    displayName,
    imageUrl,
    categoryId: String(matchedCategory?.id || design?.categoryId || ''),
    categoryName: String(matchedCategory?.title || matchedCategory?.name || (design as any)?.category || 'Design')
  };
};

const getBookingAmount = (booking: any) => {
  const paymentStatus = getBookingPaymentStatus(booking);
  const price = parseAmountValue(booking?.price);
  const cost = parseAmountValue(booking?.cost);
  if (paymentStatus === 'paid') {
    if (cost > 0) return cost;
    if (price > 0) return price;
  }
  if (price > 0) return price;
  if (cost > 0) return cost;
  return parseAmountValue(booking?.amount);
};

const isBookingApprovedForPayment = (booking: any) => {
  const status = String(booking?.status || '').toLowerCase();
  return status === 'approved' || status === 'fulfilled' || status === 'confirmed';
};

const isPackageBooking = (booking: any) => {
  const designId = String(booking?.designId || '').toLowerCase();
  const designName = String(booking?.designName || '').toLowerCase();
  const categoryId = String(booking?.categoryId || '').toLowerCase();
  return designId.startsWith('package-') || designName.includes('package') || categoryId.includes('package');
};

const getBookingDisplayLabel = (booking: any, bookingContext: { displayName?: string }) => {
  const title = String(bookingContext?.displayName || booking?.designName || 'Design').trim() || 'Design';
  return `${isPackageBooking(booking) ? 'Package' : 'Design'}: ${title}`;
};

const resolveBookingCustomerDetails = (booking: any) => {
  const bookingUserId = String(booking?.userId || booking?.customerId || '').trim();
  const customerFromState = state.users.find((user) => String(user?.id || '').trim() === bookingUserId);
  const name = String(
    booking?.customerName
    || booking?.userName
    || customerFromState?.name
    || 'Customer'
  ).trim() || 'Customer';
  const email = String(
    booking?.customerEmail
    || booking?.email
    || customerFromState?.email
    || ''
  ).trim();
  const phone = String(
    booking?.customerPhone
    || booking?.phone
    || (customerFromState as any)?.phone
    || ''
  ).trim();
  return {
    userId: bookingUserId,
    name,
    email,
    phone
  };
};

const normalizeImageKey = (value: string) => {
  if (!value) return '';
  const stripped = value.split('?')[0].split('#')[0].replace(/\\/g, '/');
  return stripped.replace(/^https?:\/\/[^/]+/i, '');
};

const sanitizeDisplayName = (value: string) => String(value || '')
  .replace(/\.[^/.]+$/, '')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getFilenameKey = (value: string) => {
  const normalized = normalizeImageKey(value || '');
  if (!normalized) return '';
  const filename = normalized.split('/').pop() || '';
  return filename.toLowerCase();
};

const resolveDesignDisplayName = (
  design: Partial<DesignModel> | null | undefined,
  options?: {
    imageName?: string;
    imageUrl?: string;
    categoryId?: string;
    categoryName?: string;
    fallback?: string;
  }
) => {
  const directCategoryId = String(options?.categoryId || '');
  const directCategoryName = String(options?.categoryName || '');
  const designCategoryId = String(design?.categoryId || '');
  const designCategoryName = String(design?.category || '');
  const categoryKeys = new Set<string>([
    ...Array.from(getCategoryStrictKeySet(directCategoryId, directCategoryName)),
    ...Array.from(getCategoryStrictKeySet(designCategoryId, designCategoryName))
  ]);

  const imageKeyCandidates = new Set<string>([
    normalizeImageKey(String(options?.imageUrl || '')),
    normalizeImageKey(String(design?.previewImage || '')),
    getFilenameKey(String(options?.imageUrl || '')),
    getFilenameKey(String(design?.previewImage || ''))
  ].filter(Boolean));

  const categories = state.customer.categories || [];
  for (const category of categories) {
    const keys = getCategoryStrictKeySet(category.id || '', category.title || '', category.name || '');
    if (categoryKeys.size > 0 && !Array.from(keys).some((key) => categoryKeys.has(key))) continue;
    const images = category.images || [];
    for (const image of images) {
      const byUrl = normalizeImageKey(String(image.url || ''));
      const byFile = String((image as any).filename || '').toLowerCase();
      const imageName = sanitizeDisplayName(String(image.name || ''));
      if (!imageName) continue;
      if (
        imageKeyCandidates.size > 0
        && (imageKeyCandidates.has(byUrl) || (byFile && imageKeyCandidates.has(byFile)))
      ) {
        return imageName;
      }
    }
  }

  const fromImageName = sanitizeDisplayName(String(options?.imageName || ''));
  if (fromImageName && fromImageName.toLowerCase() !== 'design') return fromImageName;
  const fromDesign = sanitizeDisplayName(String(design?.title || ''));
  if (fromDesign && fromDesign.toLowerCase() !== 'design') return fromDesign;
  const fromImageUrl = sanitizeDisplayName(getFilenameKey(String(options?.imageUrl || '')));
  if (fromImageUrl) return fromImageUrl;
  return sanitizeDisplayName(String(options?.fallback || 'Design')) || 'Design';
};

const getCategoryKeySet = (categoryId: string, categories: Category[]) => {
  if (categoryId === 'all') return null;
  const selectedCategory = categories.find((cat) => cat.id === categoryId) || null;
  if (!selectedCategory) {
    const rawKeys = getCategoryMatchKeySet(categoryId);
    return rawKeys.size > 0 ? rawKeys : null;
  }
  const keys = getCategoryMatchKeySet(selectedCategory.id, selectedCategory.title || '', selectedCategory.name || '');
  return keys.size > 0 ? keys : null;
};

const designMatchesCategory = (design: DesignModel, categoryKeys: Set<string> | null) => {
  if (!categoryKeys) return true;
  const designKeys = getCategoryMatchKeySet(design.categoryId || '', design.category || '');
  return Array.from(designKeys).some((key) => categoryKeys.has(key));
};

const getGalleryDesignCandidates = (categoryId: string) => {
  const categories = getCustomerVisibleCategories(state.customer.categories || []);
  const categoryKeys = getCategoryKeySet(categoryId, categories);
  const sourceDesigns = state.customer.designs && state.customer.designs.length > 0 ? state.customer.designs : getDesigns();
  const customerDesigns = getCustomerVisibleDesigns(sourceDesigns);
  if (!categoryKeys) return customerDesigns;
  return customerDesigns.filter((design) => designMatchesCategory(design, categoryKeys));
};

const getSelectedModel = () => {
  const designSource = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : state.catalog;
  return designSource.find((m) => m.id === state.selectedModelId) || state.catalog.find((m) => m.id === state.selectedModelId) || null;
};

const getDesignsForCategory = (categoryId: string) => {
  if (categoryId === 'all') return [] as DesignModel[];
  const categories = getCustomerVisibleCategories(state.customer.categories || []);
  const categoryKeys = getCategoryKeySet(categoryId, categories);
  const designSource = getCustomerDesignPool();
  return designSource.filter((design) => designMatchesCategory(design, categoryKeys) && design.status !== 'inactive');
};

const ensureDesignsForCategory = (categoryId: string) => {
  if (!categoryId || categoryId === 'all') return;
  const categories = state.customer.categories && state.customer.categories.length > 0 ? state.customer.categories : getCategories();
  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  if (!selectedCategory) return;

  const images = Array.isArray(selectedCategory.images) ? selectedCategory.images : [];
  if (images.length === 0) return;

  const categoryKeys = getCategoryMatchKeySet(selectedCategory.id || '', selectedCategory.title || '', selectedCategory.name || '');
  const referenceDesign = getDesigns().find((design: any) => {
    const amount = getDesignAmount(design);
    if (amount <= 0) return false;
    const designKeys = getCategoryMatchKeySet(design.categoryId || '', design.category || '');
    return Array.from(designKeys).some((key) => categoryKeys.has(key));
  });
  const referenceAmount = referenceDesign ? getDesignAmount(referenceDesign as any) : 0;

  images.forEach((image: any, index: number) => {
    const imageUrl = normalizeAssetUrl(String(image?.url || '').trim());
    if (!imageUrl) return;
    const name = String(image?.name || selectedCategory.title || selectedCategory.name || 'Design').trim();
    const generatedAmount = getGeneratedDesignAmount(`${categoryId}|${imageUrl}|${name}|${index}`, referenceAmount);
    const duplicate = getDesigns().find((design: any) => {
      const designImage = normalizeImageKey(design.previewImage || design.imageUrl || (Array.isArray(design.images) ? design.images[0] : ''));
      return designImage === normalizeImageKey(imageUrl);
    });
    if (duplicate) {
      const duplicateAmount = getDesignAmount(duplicate as any);
      const isGeneratedPlaceholder = String((duplicate as any).description || '').toLowerCase().includes('reference design');
      if (isGeneratedPlaceholder && duplicateAmount !== generatedAmount) {
        updateDesign(String((duplicate as any).id || ''), {
          price: generatedAmount,
          cost: generatedAmount
        });
      }
      return;
    }

    const modelPayload = {
      title: name,
      description: `${selectedCategory.title || selectedCategory.name || 'Category'} reference design`,
      categoryId,
      category: (selectedCategory.title as RoomType) || RoomType.LIVING,
      style: StyleType.MODERN,
      modelUrl: '',
      previewImage: imageUrl,
      price: generatedAmount,
      cost: generatedAmount,
      availabilityStatus: 'available' as const,
      status: 'active' as const,
      images: [imageUrl]
    };
    saveDesign(modelPayload as any);
  });

  const nextDesigns = getDesigns().map((design: DesignModel) => normalizeDesignMotion3D(design));
  state.customer.designs = nextDesigns;
  state.catalog = nextDesigns;
};

const ensureDesignsForAllCategories = () => {
  const categories = state.customer.categories && state.customer.categories.length > 0
    ? state.customer.categories
    : getCategories();
  categories.forEach((category) => {
    if (category?.id) ensureDesignsForCategory(category.id);
  });
  const nextDesigns = getDesigns().map((design: DesignModel) => normalizeDesignMotion3D(design));
  state.customer.designs = nextDesigns;
  state.catalog = nextDesigns;
};

const getDesignForImage = (categoryId: string | undefined, imageIndex: number, imageUrl?: string) => {
  const allVisibleDesigns = getCustomerDesignPool();
  if (!categoryId) {
    if (!imageUrl) return null;
    const imageKey = normalizeImageKey(imageUrl);
    if (!imageKey) return null;
    return allVisibleDesigns.find((design) => normalizeImageKey(design.previewImage) === imageKey) || null;
  }
  const designs = getDesignsForCategory(categoryId);
  if (imageUrl && designs.length > 0) {
    const imageKey = normalizeImageKey(imageUrl);
    if (imageKey) {
      const matched = designs.find((design) => normalizeImageKey(design.previewImage) === imageKey);
      if (matched) return matched;
    }
  }
  if (imageUrl) {
    const imageKey = normalizeImageKey(imageUrl);
    if (imageKey) {
      const matchedGlobal = allVisibleDesigns.find((design) => normalizeImageKey(design.previewImage) === imageKey);
      if (matchedGlobal) return matchedGlobal;
    }
  }
  if (designs.length === 0) {
    const categoryKeys = getCategoryMatchKeySet(categoryId);
    const fallbackByCategory = allVisibleDesigns.find((design) => {
      const designKeys = getCategoryMatchKeySet(design.categoryId || '', design.category || '');
      return Array.from(designKeys).some((key) => categoryKeys.has(key));
    });
    return fallbackByCategory || null;
  }
  return designs[imageIndex % designs.length];
};

const applyCategoryBackground = (categoryId: string) => {
  if (categoryId === 'all') return;
  const category = (state.customer.categories || []).find((cat) => cat.id === categoryId) || getCategories().find((cat) => cat.id === categoryId);
  if (!category) return;
  const nextBackground = category.background || category.image || category.thumbnail || '';
  if (!nextBackground) return;
  state.siteSettings = { ...state.siteSettings, heroBg: nextBackground };
  persistState();
};

const getUnreadCount = () => state.inquiries.filter((inq) => !inq.isReadByAdmin).length;



const renderNavItems = () => {
  const navItems = [
    { id: 'home', label: 'Home', roles: ['admin', 'customer', null] },
    { id: 'gallery', label: 'Gallery', roles: ['admin', 'customer', null] },
    { id: 'categories', label: 'Categories', roles: ['admin', 'customer', null] },
    { id: 'portfolio', label: 'Portfolio', roles: ['admin', 'customer', null] },
    { id: 'services', label: 'Services', roles: ['admin', 'customer', null] },
    { id: 'showroom', label: 'Luxury Showroom', roles: ['admin', 'customer', null] },
    { id: 'ai-studio', label: 'Design Studio', roles: ['admin', 'customer'] },
    { id: 'contact', label: 'Inquiry', roles: ['customer', null] },
    { id: 'dashboard', label: 'Dashboard', roles: ['customer'] },
    { id: 'admin', label: 'Admin', roles: ['admin'] }
  ];
  const role = state.currentUser?.role || null;
  return navItems.filter((item) => item.roles.includes(role));
};

const getTextColorForBackground = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return '#ffffff';
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

const toYouTubeEmbedUrl = (url: string, autoplay = false) => {
  if (!url) return '';
  const raw = normalizeAssetUrl(String(url).trim());
  const isYoutube = raw.includes('youtube.com') || raw.includes('youtu.be');
  if (!isYoutube) return raw;
  const videoId =
    raw.split('v=')[1]?.split('&')[0]
    || raw.split('youtu.be/')[1]?.split('?')[0]
    || raw.split('/shorts/')[1]?.split('?')[0]
    || raw.split('/embed/')[1]?.split('?')[0]
    || '';
  if (!videoId) return raw;
  const params = autoplay
    ? '?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3'
    : '?rel=0&modestbranding=1&iv_load_policy=3';
  return `https://www.youtube-nocookie.com/embed/${videoId}${params}`;
};

const resolvePlayableVideoUrl = (url: string) => {
  const rawInput = String(url || '').trim().replace(/\\/g, '/');
  if (!rawInput) return '';

  // If user stored only a file name (e.g., demo.mp4), serve it from /videos.
  const isBareFileName = !rawInput.includes('/') && !rawInput.includes('://');
  const hasVideoExtension = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(rawInput);
  if (isBareFileName && hasVideoExtension) {
    return `/videos/${rawInput}`;
  }

  // Vite serves files from /public at root URL, so /public/videos/a.mp4 must become /videos/a.mp4.
  const withoutPublicPrefix = rawInput.replace(/^\/?public\//i, '/');

  // Convert local filesystem-like paths to best-effort web paths.
  // Example: C:/project/public/videos/demo.mp4 -> /videos/demo.mp4
  const drivePathPattern = /^[a-zA-Z]:\//;
  const fileSchemePattern = /^file:\/\//i;
  if (drivePathPattern.test(withoutPublicPrefix) || fileSchemePattern.test(withoutPublicPrefix)) {
    const fileName = withoutPublicPrefix.split('/').pop() || '';
    if (!fileName) return '';
    return `/videos/${fileName}`;
  }

  // Handle already-normalized app paths and remote URLs.
  return normalizeAssetUrl(withoutPublicPrefix);
};

const renderVideoEmbedOrTag = (url: string, classes: string, title = 'Video') => {
  const normalized = resolvePlayableVideoUrl(String(url || '').trim());
  if (!normalized) return '';
  const embedUrl = toYouTubeEmbedUrl(normalized, false);
  const isYoutube = embedUrl.includes('youtube.com') || embedUrl.includes('youtube-nocookie.com');
  if (isYoutube) {
    return `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(title)}" class="${escapeHtml(classes)}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }
  return `<video src="${escapeHtml(normalized)}" controls preload="metadata" class="${escapeHtml(classes)}"></video>`;
};

const renderVideoLauncher = (url: string, classes: string, title = 'Video', posterUrl = '') => {
  const normalized = resolvePlayableVideoUrl(String(url || '').trim());
  if (!normalized) return '';
  const poster = normalizeAssetUrl(String(posterUrl || '').trim());
  return `
    <button type="button" data-action="play-video" data-video-url="${escapeHtml(normalized)}" data-video-title="${escapeHtml(title)}" class="${escapeHtml(classes)} relative overflow-hidden bg-black text-left">
      ${poster ? `<img src="${escapeHtml(poster)}" alt="${escapeHtml(title)}" class="absolute inset-0 w-full h-full object-cover opacity-80" />` : '<div class="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"></div>'}
      <div class="absolute inset-0 bg-black/35 flex items-center justify-center">
        <div class="w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg text-xl">▶</div>
      </div>
      <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold tracking-wide">
        Play video preview
      </div>
    </button>
  `;
};

const getServiceDetailsContent = (service: ServiceItem) => {
  const key = normalizeKey(String(service.title || ''));
  const defaults = {
    overview: service.description || 'Tailored interior design support aligned to your space and budget.',
    deliverables: [
      'Requirement discovery and style alignment session',
      'Design concept proposal with material direction',
      'Execution checklist with milestone planning'
    ],
    process: [
      'Consultation and site understanding',
      'Concept draft and revisions',
      'Handover-ready implementation support'
    ]
  };

  if (key.includes('3d') && key.includes('studio')) {
    return {
      overview: 'We create photoreal 3D room concepts so you can validate layout, lighting, and finish combinations before execution begins.',
      deliverables: [
        '3D room visualization and layout variants',
        'Material and color-combination previews',
        'Revision rounds based on your feedback'
      ],
      process: [
        'Collect room dimensions and preferences',
        'Build concept visuals with style options',
        'Finalize approved concept for execution handoff'
      ]
    };
  }

  if (key.includes('design view') || key.includes('preview')) {
    return {
      overview: 'Design View helps you compare concepts side by side and approve the exact direction before production starts.',
      deliverables: [
        'Moodboard and finish palette snapshots',
        'Elevation references and focal-wall options',
        'Before-vs-proposed visual presentation'
      ],
      process: [
        'Shortlist styles and usage priorities',
        'Prepare visual options with practical notes',
        'Select and freeze final approved direction'
      ]
    };
  }

  if (key.includes('turnkey')) {
    return {
      overview: 'Turnkey Execution covers end-to-end delivery from planning to installation with coordinated vendors and milestones.',
      deliverables: [
        'Detailed BOQ and execution timeline',
        'Vendor coordination and quality tracking',
        'Site supervision with final handover checklist'
      ],
      process: [
        'Scope freeze and execution planning',
        'Procurement, fabrication, and site setup',
        'Installation, QA, and project handover'
      ]
    };
  }

  return defaults;
};

const renderServiceDetailsModal = () => {
  const details = (state.customer as any).serviceDetails;
  if (!details) return '';

  const content = getServiceDetailsContent(details as ServiceItem);
  return `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-action="close-service-details">
      <div class="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up" data-action="ignore">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[color:var(--primary)]">${escapeHtml(details.title || 'Service Details')}</h3>
          <button data-action="close-service-details" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div class="p-6 space-y-5">
          <div>
            <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Overview</div>
            <div class="text-sm text-slate-700">${escapeHtml(content.overview)}</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-xl border border-black/10 bg-slate-50 p-4">
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Deliverables</div>
              <ul class="space-y-2 text-sm text-slate-700">
                ${content.deliverables.map((item) => `<li>• ${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
            <div class="rounded-xl border border-black/10 bg-slate-50 p-4">
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Process</div>
              <ul class="space-y-2 text-sm text-slate-700">
                ${content.process.map((item) => `<li>• ${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const SHOWCASE_CATEGORY_ALIASES: Record<string, string[]> = {
  kitchen: ['kitchen', 'chef', 'cook', 'pantry'],
  bedroom: ['bedroom', 'suite', 'master', 'kids', 'canopy'],
  living: ['living', 'drawing', 'parlour', 'lounge', 'family'],
  bathroom: ['bathroom', 'washroom', 'powder', 'toilet'],
  dining: ['dining'],
  office: ['office', 'study', 'workspace', 'work']
};

const inferShowcaseCategory = (showcase: any) => {
  const text = normalizeKey(`${showcase?.title || ''} ${showcase?.style || ''} ${showcase?.description || ''}`);
  const match = Object.entries(SHOWCASE_CATEGORY_ALIASES).find(([, aliases]) => aliases.some((alias) => text.includes(alias)));
  return match?.[0] || '';
};

const getRelatedDesignsForShowcase = (showcase: any) => {
  const allDesigns = getCustomerDesignPool();

  const categories = getCustomerVisibleCategories((state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories());
  const categoryTitleById = new Map(categories.map((category: any) => [String(category.id || ''), String(category.title || category.name || '')]));

  const showcaseKey = normalizeKey(`${showcase?.title || ''} ${showcase?.style || ''}`);
  const tokens = showcaseKey.split('-').filter(Boolean);
  const inferredCategory = inferShowcaseCategory(showcase);
  const inferredAliases = inferredCategory ? (SHOWCASE_CATEGORY_ALIASES[inferredCategory] || [inferredCategory]) : [];

  const candidateDesigns = inferredAliases.length > 0
    ? allDesigns.filter((design: any) => {
      const categoryIdKey = normalizeKey(String(design?.categoryId || ''));
      const categoryTitleKey = normalizeKey(String(categoryTitleById.get(String(design?.categoryId || '')) || ''));
      return inferredAliases.some((alias) => categoryIdKey.includes(alias) || categoryTitleKey.includes(alias));
    })
    : allDesigns;

  const scopedDesigns = candidateDesigns.length > 0 ? candidateDesigns : allDesigns;

  const scored = scopedDesigns.map((design: any, index: number) => {
    const categoryTitle = categoryTitleById.get(String(design?.categoryId || '')) || '';
    const designText = normalizeKey(`${design?.title || ''} ${design?.description || ''} ${design?.categoryId || ''} ${categoryTitle}`);
    const tokenScore = tokens.reduce((sum, token) => sum + (designText.includes(token) ? 1 : 0), 0);
    const categoryBoost = inferredAliases.some((alias) => designText.includes(alias)) ? 2 : 0;
    const score = tokenScore + categoryBoost;
    return { design, score, index };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  const seenImages = new Set<string>();
  const unique: any[] = [];
  scored.forEach((entry) => {
    if (unique.length >= 5) return;
    const imageKey = normalizeKey(String(entry.design?.previewImage || ''));
    if (imageKey && seenImages.has(imageKey)) return;
    if (imageKey) seenImages.add(imageKey);
    unique.push(entry.design);
  });

  return unique;
};

const getDesignPreviewImageForShowcase = (design: any) => {
  const direct = normalizeAssetUrl(String(design?.previewImage || design?.image || ''));
  if (direct) return direct;

  const designImages = Array.isArray(design?.images) ? design.images : [];
  const firstImage = normalizeAssetUrl(String(designImages[0] || ''));
  if (firstImage) return firstImage;

  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const category = categories.find((cat: any) => String(cat.id || '') === String(design?.categoryId || ''));
  const categoryImage = normalizeAssetUrl(String(category?.image || category?.thumbnail || category?.images?.[0]?.url || ''));
  if (categoryImage) return categoryImage;

  return '';
};

const renderServiceShowcaseDetailsModal = () => {
  const details = (state.customer as any).serviceShowcaseDetails;
  if (!details) return '';

  const relatedDesigns = getRelatedDesignsForShowcase(details);
  const relatedImages = Array.isArray(details.relatedImages) ? details.relatedImages.filter(Boolean).slice(0, 5) : [];
  const linkedService = state.services.find((service) => String(service.id || '') === String(details.serviceId || '')) || null;
  const showcaseImage = normalizeAssetUrl(String(details.image || ''));
  return `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-action="close-service-showcase-details">
      <div class="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up" data-action="ignore">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 class="text-lg font-bold text-[color:var(--primary)]">Service Showcase Details</h3>
          <button type="button" data-action="close-service-showcase-details" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div class="p-6 space-y-4">
          ${showcaseImage ? `
            <div class="rounded-xl overflow-hidden border border-black/10 bg-slate-100">
              <a href="${escapeHtml(showcaseImage)}" target="_blank" rel="noopener noreferrer" class="block" title="Open image">
                <img src="${escapeHtml(showcaseImage)}" alt="${escapeHtml(details.title || 'Service Image')}" class="motion-3d w-full h-48 object-cover cursor-zoom-in" data-motion3d="true" />
              </a>
            </div>
          ` : ''}
          <div>
            <div class="text-xs text-slate-500 uppercase tracking-wider">Name</div>
            <div class="text-base font-semibold text-[color:var(--primary)]">${escapeHtml(details.title || 'Service')}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 uppercase tracking-wider">Cost</div>
            <div class="text-sm font-semibold text-[color:var(--accent)]">${escapeHtml(details.price || 'Contact for pricing')}</div>
          </div>
          ${linkedService ? `
            <div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Linked Service</div>
              <div class="text-sm font-semibold text-slate-700">${escapeHtml(linkedService.title || 'Service')}</div>
            </div>
          ` : ''}
          <div>
            <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Related Images (up to 5)</div>
            ${relatedImages.length > 0 ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${relatedImages.map((imageUrl: string, index: number) => `
                  <div class="rounded-xl border border-black/10 bg-slate-50 overflow-hidden">
                    <a href="${escapeHtml(imageUrl)}" target="_blank" rel="noopener noreferrer" class="block h-24 bg-slate-100" title="Open related image">
                      <img src="${escapeHtml(imageUrl)}" alt="Related Image ${index + 1}" class="motion-3d w-full h-full object-cover cursor-zoom-in" data-motion3d="true" />
                    </a>
                    <div class="px-3 py-2 text-xs text-slate-600">Related Image ${index + 1}</div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Related Designs (up to 5)</div>
              ${relatedDesigns.length > 0 ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${relatedDesigns.map((design: any) => `
                  <div class="rounded-xl border border-black/10 bg-slate-50 overflow-hidden">
                    <div class="h-24 bg-slate-100">
                      ${(() => {
      const imageUrl = getDesignPreviewImageForShowcase(design);
      if (!imageUrl) return '<div class="w-full h-full flex items-center justify-center text-2xl">🏠</div>';
      return `<a href="${escapeHtml(imageUrl)}" target="_blank" rel="noopener noreferrer" class="block" title="Open related image"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(design.title || 'Related Design')}" class="motion-3d w-full h-full object-cover cursor-zoom-in" data-motion3d="true" /></a>`;
    })()}
                    </div>
                    <div class="px-3 py-2 flex items-center justify-between gap-3">
                      <span class="text-sm text-slate-700 truncate">${escapeHtml(resolveDesignDisplayName(design, { imageUrl: design.previewImage, categoryId: design.categoryId, fallback: design.title || 'Design' }))}</span>
                      <span class="text-xs font-semibold text-[color:var(--accent)] shrink-0">${getDesignAmount(design as any) > 0 ? formatCurrency(getDesignAmount(design as any)) : 'N/A'}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              ` : '<div class="text-sm text-slate-400">No related images or designs found.</div>'}
            `}
          </div>
        </div>
      </div>
    </div>
  `;
};

const normalizeBookingRecord = (booking: any) => ({
  ...booking,
  id: String(booking?.id || ''),
  userId: String(booking?.userId || booking?.customerId || ''),
  paymentId: booking?.paymentId,
  designId: String(booking?.designId || '').trim(),
  designName: String(booking?.designName || booking?.designTitle || 'Design').trim() || 'Design',
  categoryId: String(booking?.categoryId || '').trim(),
  price: Number(booking?.price || booking?.cost || 0),
  status: (booking?.status as any) || 'booked',
  paymentStatus: getBookingPaymentStatus(booking),
  createdAt: String(booking?.createdAt || booking?.bookingDate || new Date().toISOString()),
  designTitle: String(booking?.designTitle || '').trim(),
  designPreviewImage: normalizeAssetUrl(String(booking?.designPreviewImage || booking?.previewImage || booking?.imageUrl || '').trim()),
  imageUrl: normalizeAssetUrl(String(booking?.imageUrl || booking?.designPreviewImage || booking?.previewImage || '').trim())
});

const getBookingSortScore = (booking: any) => {
  const bookingId = String(booking?.id || '').trim();
  const realBookingMatch = bookingId.match(/^book-(\d{10,})/);
  if (realBookingMatch) {
    const timestamp = Number(realBookingMatch[1]);
    if (Number.isFinite(timestamp)) return timestamp;
  }

  const createdAt = new Date(String(booking?.createdAt || booking?.bookingDate || '')).getTime();
  if (Number.isFinite(createdAt) && createdAt > 0) return createdAt;

  return 0;
};

const getAdminChartTheme = () => {
  const darkMode = Boolean(state.theme.darkMode);
  return {
    textColor: darkMode ? '#e5e7eb' : '#475569',
    mutedTextColor: darkMode ? '#cbd5e1' : '#64748b',
    gridColor: darkMode ? 'rgba(148, 163, 184, 0.22)' : 'rgba(15, 23, 42, 0.08)',
    borderColor: darkMode ? 'rgba(226, 232, 240, 0.18)' : '#ffffff',
    revenueFill: darkMode ? 'rgba(212,175,55,0.18)' : 'rgba(74,55,40,0.2)',
    expensesFill: darkMode ? 'rgba(244,114,182,0.16)' : 'rgba(178,89,61,0.2)',
    bookingsPrimary: darkMode ? 'rgba(212,175,55,0.72)' : 'rgba(74,55,40,0.75)',
    bookingsSecondary: darkMode ? 'rgba(96,165,250,0.72)' : 'rgba(212,175,55,0.85)',
    emptyCategory: darkMode ? '#475569' : '#cbd5e1'
  };
};

const applyAdminChartTheme = (chart: any, kind: 'line' | 'bar' | 'doughnut') => {
  if (!chart?.options) return;
  const theme = getAdminChartTheme();
  chart.options.plugins = chart.options.plugins || {};
  chart.options.plugins.legend = chart.options.plugins.legend || {};
  chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
  chart.options.plugins.legend.labels.color = theme.textColor;

  if (kind !== 'doughnut') {
    chart.options.scales = chart.options.scales || {};
    chart.options.scales.x = chart.options.scales.x || {};
    chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
    chart.options.scales.x.grid = chart.options.scales.x.grid || {};
    chart.options.scales.x.ticks.color = theme.mutedTextColor;
    chart.options.scales.x.grid.color = theme.gridColor;

    chart.options.scales.y = chart.options.scales.y || {};
    chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
    chart.options.scales.y.grid = chart.options.scales.y.grid || {};
    chart.options.scales.y.ticks.color = theme.mutedTextColor;
    chart.options.scales.y.grid.color = theme.gridColor;
  }
};

const getAnnouncementEmoji = (announcement: any) => {
  const text = `${String(announcement?.title || '')} ${String(announcement?.message || '')}`.toLowerCase();
  if (/offer|discount|sale|deal|price/.test(text)) return '💸';
  if (/launch|new|introduc|opening/.test(text)) return '🚀';
  if (/festival|festive|celebrat|diwali|christmas|new year/.test(text)) return '🎉';
  if (/maint|update|upgrade|service/.test(text)) return '🛠️';
  if (/book|slot|appointment|consult/.test(text)) return '📅';
  if (/important|alert|urgent|notice/.test(text)) return '⚠️';
  return '📢';
};

const normalizePromoCode = (value: string) => String(value || '').trim().toUpperCase();

const FALLBACK_ACTIVE_DISCOUNT_CODES = [
  {
    id: 'fallback-disc10',
    code: 'DISC10',
    type: 'percent',
    value: 10,
    minAmount: 0,
    maxDiscount: 0,
    active: true
  },
  {
    id: 'fallback-disc20',
    code: 'DISC20',
    type: 'percent',
    value: 20,
    minAmount: 0,
    maxDiscount: 0,
    active: true
  }
];

const getResolvedActiveDiscountCodes = () => {
  const activeCodes = getActiveDiscountCodes();
  return activeCodes.length > 0 ? activeCodes : FALLBACK_ACTIVE_DISCOUNT_CODES;
};

const getDiscountComputation = (baseAmount: number, code: any) => {
  const amount = Math.max(0, Number(baseAmount || 0));
  const value = Number(code?.value || 0);
  const maxDiscount = Number(code?.maxDiscount || 0);
  const discountRaw = code?.type === 'flat'
    ? value
    : (amount * value) / 100;
  const discountAmount = Math.max(0, Math.min(
    amount,
    maxDiscount > 0 ? Math.min(discountRaw, maxDiscount) : discountRaw
  ));
  const finalAmount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);
  return {
    discountAmount,
    finalAmount
  };
};

const getAnnouncementLinkedOfferCodes = () => {
  const activeCodes = getResolvedActiveDiscountCodes();
  if (activeCodes.length === 0) return [] as any[];

  const announcements = getActiveAnnouncements().filter((announcement: any) => (
    !announcement?.location || announcement.location === 'dashboard' || announcement.location === 'both'
  ));

  const textBlob = announcements
    .map((announcement: any) => `${String(announcement?.title || '')} ${String(announcement?.message || '')}`.toUpperCase())
    .join(' ');

  const linked = activeCodes.filter((code: any) => {
    const normalized = normalizePromoCode(String(code?.code || ''));
    return Boolean(normalized && textBlob.includes(normalized));
  });

  return linked.length > 0 ? linked : activeCodes;
};

const getAnnouncementMatchedDiscountCodes = (announcement: any) => {
  const activeCodes = getResolvedActiveDiscountCodes();
  if (activeCodes.length === 0) return [] as any[];

  const textBlob = `${String(announcement?.title || '')} ${String(announcement?.message || '')}`.toUpperCase();
  return activeCodes.filter((code: any, index: number, list: any[]) => {
    const normalized = normalizePromoCode(String(code?.code || ''));
    if (!normalized || !textBlob.includes(normalized)) return false;
    return list.findIndex((entry: any) => normalizePromoCode(String(entry?.code || '')) === normalized) === index;
  });
};

const getEligibleBookingsForDiscount = () => {
  const hiddenBookingIds = new Set(getHiddenBookingIds());
  return (state.customer.bookings || [])
    .map((booking: any) => normalizeBookingRecord(booking))
    .filter((booking: any) => !hiddenBookingIds.has(String(booking?.id || '')))
    .filter((booking: any) => getBookingPaymentStatus(booking) !== 'paid')
    .filter((booking: any) => isBookingApprovedForPayment(booking))
    .sort((left: any, right: any) => new Date(right?.createdAt || 0).getTime() - new Date(left?.createdAt || 0).getTime());
};

const getEligibleBookingForDiscountCode = (code: any) => {
  const minAmount = Number(code?.minAmount || 0);
  return getEligibleBookingsForDiscount().find((booking: any) => getBookingAmount(booking) >= minAmount) || null;
};

const openCustomerBookingDetails = (bookingId: string) => {
  if (!bookingId) return false;

  const booking = (state.customer.bookings || []).find((item: any) => String(item?.id || '') === String(bookingId)) as any;
  if (!booking) return false;

  const bookedAt = new Date(booking.createdAt || Date.now());
  const bookedDate = Number.isNaN(bookedAt.getTime()) ? '-' : bookedAt.toLocaleDateString();
  const bookedTime = Number.isNaN(bookedAt.getTime()) ? '-' : bookedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const bookingContext = resolveBookingDesignContext(booking);
  const rawStatus = String(booking.status || '').toLowerCase();
  const paymentStatus = getBookingPaymentStatus(booking);
  const decision = (rawStatus === 'approved' || rawStatus === 'confirmed' || rawStatus === 'fulfilled' || paymentStatus === 'paid')
    ? 'Approved'
    : (rawStatus === 'declined' || rawStatus === 'cancelled' || paymentStatus === 'failed')
      ? 'Declined'
      : 'Pending';

  (state.customer as any).bookingDetails = {
    bookingId,
    designId: bookingContext.design?.id || booking.designId || '',
    designName: bookingContext.displayName,
    imageUrl: bookingContext.imageUrl,
    amount: getBookingAmount(booking),
    bookedDate,
    bookedTime,
    priceLabel: formatCurrency(getBookingAmount(booking)),
    paymentStatus: paymentStatus || 'pending',
    bookingStatus: booking.status || 'pending',
    decision
  };
  (state.customer as any).paymentDiscount = undefined;
  (state.customer as any).paymentDiscountCode = '';
  return true;
};

const applyDiscountCodeToBooking = (bookingId: string, rawCode: string, baseAmount: number) => {
  const codeValue = normalizePromoCode(rawCode);
  (state.customer as any).paymentDiscountCode = codeValue;

  if (!bookingId) {
    state.customer.paymentError = 'Booking context missing for discount.';
    return false;
  }

  if (!codeValue) {
    (state.customer as any).paymentDiscount = undefined;
    state.customer.paymentError = 'Enter a discount code.';
    return false;
  }

  const matched = getResolvedActiveDiscountCodes().find((item: any) => normalizePromoCode(String(item?.code || '')) === codeValue);
  if (!matched) {
    (state.customer as any).paymentDiscount = undefined;
    state.customer.paymentError = 'Invalid or expired discount code.';
    return false;
  }

  if (Number(matched.minAmount || 0) > baseAmount) {
    (state.customer as any).paymentDiscount = undefined;
    state.customer.paymentError = `Code requires minimum booking amount ${formatCurrency(Number(matched.minAmount || 0))}.`;
    return false;
  }

  const computed = getDiscountComputation(baseAmount, matched);
  if (computed.discountAmount <= 0) {
    (state.customer as any).paymentDiscount = undefined;
    state.customer.paymentError = 'This code does not apply to the current amount.';
    return false;
  }

  (state.customer as any).paymentDiscount = {
    bookingId,
    code: codeValue,
    discountAmount: computed.discountAmount,
    finalAmount: computed.finalAmount
  };
  state.customer.paymentError = '';
  state.confirmMessage = `Discount applied: ${formatCurrency(computed.discountAmount)} saved.`;
  return true;
};

const openPackageCardPayment = async (pkg: Package) => {
  if (!state.currentUser) {
    state.loginError = 'Please sign in to book a package.';
    navigateTo('login');
    return;
  }

  const packageAmount = Math.max(1, Number(pkg.discountedPrice || pkg.originalPrice || 0));
  const bookingName = `${String(pkg.name || 'Package').trim()} Package`;

  let bookingId = '';
  let isServer = true;

  try {
    const response = await apiFetch('/bookings/pay-and-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        customerId: state.currentUser.id,
        designId: `package-${pkg.id}`,
        designName: bookingName,
        amount: packageAmount,
        cost: packageAmount
      })
    });

    const data = await response.json().catch(() => ({} as any));
    if (!response.ok || !data?.bookingId || !data?.paymentId) {
      throw new Error(data?.message || 'Failed to create package booking');
    }
    bookingId = String(data.bookingId);
  } catch {
    isServer = false;
    const booking = createBooking({
      userId: state.currentUser.id,
      designId: `package-${pkg.id}`,
      designName: bookingName,
      categoryId: String(pkg.category || 'Package'),
      price: packageAmount,
      cost: packageAmount
    });

    const payment = createPayment({
      bookingId: booking.id,
      userId: state.currentUser.id,
      amount: packageAmount,
      provider: 'phonepe',
      status: 'pending'
    });
    bookingId = booking.id;
    void payment;
  }

  state.customer.paymentError = '';
  state.customer.bookingMessage = 'Package booked successfully. Please wait for admin approval before payment.';
  state.confirmMessage = `Package booking created (${bookingId}). Payment unlocks after admin approval.`;
  (state as any).selectedPackage = null;

  if (isServer) {
    await refreshCustomerData({ silent: true });
  }

  navigateTo('dashboard');
  render();
};

const renderVideoModal = () => {
  if (!state.videoModalOpen || !state.currentVideos || state.currentVideos.length === 0) return '';
  const video = state.currentVideos[0];
  const url = resolvePlayableVideoUrl(video.url || '');
  const embedUrl = state.currentVideoUrl || toYouTubeEmbedUrl(url, true);
  const isYoutube = embedUrl.includes('youtube.com') || embedUrl.includes('youtube-nocookie.com');

  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm" id="video-modal" data-action="close-video">
      <div class="w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10" data-action="ignore">

        <!-- Header -->
        <div class="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <h3 class="text-white font-bold text-lg drop-shadow-md">${escapeHtml(video.title || 'Video Player')}</h3>
          <button data-action="close-video" class="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white transition backdrop-blur-md">
            ✕
          </button>
        </div>

        <!-- Player Container -->
        <div class="relative w-full aspect-video bg-[#0a0a0a]">
          ${isYoutube
      ? `<iframe src="${embedUrl}" class="absolute inset-0 w-full h-full" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : `<video src="${escapeHtml(url)}" class="absolute inset-0 w-full h-full object-contain" controls autoplay playsinline></video>`
    }
        </div>

      </div>
    </div>
  `;
};

const renderPackageModal = () => {
  const pkg = (state as any).selectedPackage as Package | undefined;
  if (!pkg) return '';

  const roomPreview = (state as any).roomPreview as PackageRoom | undefined;
  const btnTextColor = getTextColorForBackground(state.theme.primaryColor);

  const pickFromPool = (pool: string[], seed: number) => {
    if (!Array.isArray(pool) || pool.length === 0) return '';
    return pool[Math.abs(seed) % pool.length] || '';
  };

  const featureImagePools: Record<string, string[]> = {
    kitchen: ['/category/Kitchen/kitchen1.jpg', '/category/Kitchen/kitchen2.jpg', '/category/Kitchen/kitchen3.jpg'],
    wardrobe: ['/category/wardrobe/wardrobe1.jpg', '/category/wardrobe/wardrobe2.jpg', '/category/wardrobe/wardrobe3.jpg'],
    living: ['/category/Living room/living1.jpg', '/category/Living room/living2.jpg', '/category/Living room/living3.jpg'],
    dining: ['/category/Diningroom/dining-room1.jpg', '/category/Diningroom/dining-room2.jpg', '/category/Diningroom/dining-room3.jpg'],
    bathroom: ['/category/Bathroom/bathroom1.jpg', '/category/Bathroom/bathroom2.jpg', '/category/Bathroom/bathroom3.jpg'],
    balcony: ['/category/Balcony/balcony (1).jpg', '/category/Balcony/balcony (2).jpg', '/category/Balcony/balcony (3).jpg'],
    office: ['/category/Office interior/office interior (1).jpg', '/category/Office interior/office interior (2).jpg', '/category/Office interior/office interior (3).jpg'],
    theater: ['/category/Home theatre/home theatre (1).jpg', '/category/Home theatre/home theatre (2).jpg', '/category/Home theatre/home theatre (3).jpg'],
    gym: ['/category/Gym/gym (1).jpg', '/category/Gym/gym (2).jpg', '/category/Gym/gym (3).jpg'],
    pool: ['/category/Swimming pool/swimming pool.jpg', '/category/Swimming pool/swimmingpool1 - Copy.jpg', '/category/Swimming pool/swimmingpool2 - Copy.jpg'],
    garden: ['/category/Garden/garden (1).jpg', '/category/Garden/garden (2).jpg', '/category/Garden/garden (3).jpg'],
    bedroom: ['/category/Master Bedroom/master-bedroom1.jpg', '/category/Master Bedroom/master-bedroom2.jpg', '/category/Kids-bedroom/kids-bedroom1.jpg'],
    default: ['/category/Living room/living1.jpg', '/category/Living room/living2.jpg', '/category/Living room/living3.jpg']
  };

  const resolvePackageFeatureImage = (feature: string, index: number) => {
    const text = String(feature || '').toLowerCase();
    const explicit = normalizeAssetUrl(String((window as any).__featureImageMap?.[feature] || ''));
    if (explicit && !explicit.includes('images.unsplash.com')) return explicit;

    let kind = 'default';
    if (/kitchen|chef|gourmet|modular/.test(text)) kind = 'kitchen';
    else if (/wardrobe|walk-?in|closet|robe/.test(text)) kind = 'wardrobe';
    else if (/bath|vanity|washroom/.test(text)) kind = 'bathroom';
    else if (/balcony|terrace|deck/.test(text)) kind = 'balcony';
    else if (/dining/.test(text)) kind = 'dining';
    else if (/living|lounge|hall/.test(text)) kind = 'living';
    else if (/office|study|work/.test(text)) kind = 'office';
    else if (/theatre|theater|cinema|media/.test(text)) kind = 'theater';
    else if (/gym|fitness|wellness|workout/.test(text)) kind = 'gym';
    else if (/pool|swimming/.test(text)) kind = 'pool';
    else if (/garden|landscape/.test(text)) kind = 'garden';
    else if (/bedroom|suite|guest|kids/.test(text)) kind = 'bedroom';

    const pool = featureImagePools[kind] || featureImagePools.default;
    return pickFromPool(pool, index + text.length);
  };

  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" data-action="close-package-modal">
      <div class="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl relative my-8 max-h-[92vh]" data-action="ignore" data-modal-inner="true">
        <button data-action="close-package-modal" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 text-slate-700 flex items-center justify-center text-xl font-bold shadow-lg hover:bg-white transition z-[120]">✕</button>

        <div class="max-h-[92vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="h-64 md:h-full overflow-hidden bg-slate-100 relative">
            <div class="absolute inset-0 w-full h-full">
              <img src="${escapeHtml(getPackageBackgroundImage(pkg))}" alt="${escapeHtml(pkg.name)} background" class="w-full h-full object-cover opacity-60" style="z-index:1;" onerror="this.src='/category/Living room/living1.jpg'" />
              <img src="${escapeHtml(getPackageDisplayImage(pkg))}" alt="${escapeHtml(pkg.name)}" class="w-2/3 h-2/3 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 motion-3d" data-motion3d="true" style="z-index:2;" onerror="this.src='/category/Living room/living1.jpg'" />
            </div>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">${escapeHtml(pkg.type || pkg.category || 'Package')}</div>
                <h2 class="text-3xl font-display font-bold text-[color:var(--primary)] leading-tight">${escapeHtml(pkg.name)}</h2>
              </div>
              <div class="text-right">
                <span class="text-sm text-slate-400 line-through">₹${(pkg.originalPrice || 0).toLocaleString()}</span>
                <div class="text-3xl font-bold text-[color:var(--accent)]">₹${(pkg.discountedPrice || 0).toLocaleString()}</div>
              </div>
            </div>
            
            <p class="text-slate-600 leading-relaxed">${escapeHtml(pkg.subtitle || pkg.description || '')}</p>
            
            ${pkg.features && pkg.features.length > 0 ? `
              <div class="space-y-3">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">What's Included:</h3>
                <div class="grid grid-cols-1 gap-4">
                  ${pkg.features.map((f: string, featureIndex: number) => {
                    const featureImage = resolvePackageFeatureImage(f, featureIndex);
                    return `
                      <div class="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                        <div class="flex-shrink-0">
                          <img src="${escapeHtml(featureImage)}" alt="${escapeHtml(f)}" class="w-16 h-16 rounded-lg object-cover shadow-sm" onerror="this.onerror=null;this.src='/category/Living room/living1.jpg'" />
                        </div>
                        <div class="flex-1 flex flex-col justify-center">
                          <div class="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] mb-1">✓</div>
                          <p class="text-sm font-semibold text-slate-800">${escapeHtml(f)}</p>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
            
            <div class="flex gap-4 pt-4">
              <button data-action="quote-package" data-package="${pkg.id}" data-package-name="${escapeHtml(pkg.name)}" style="color: ${btnTextColor}" class="flex-1 py-4 rounded-2xl bg-[color:var(--primary)] font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition active:scale-95">Book Now / Get Quote</button>
            </div>
          </div>
        </div>

        ${pkg.rooms && pkg.rooms.length > 0 ? `
          <div class="p-8 bg-slate-50/50 border-t border-black/5">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-display font-bold text-[color:var(--primary)]">Room Configurations</h3>
              <p class="text-sm text-slate-500">Click any room image to view full details</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${pkg.rooms.map((room) => {
                const roomImg = getRoomImage(room);
                return `
                <div class="group cursor-pointer" data-action="open-room-preview" data-room-id="${room.id}">
                  <div class="aspect-video rounded-2xl overflow-hidden bg-slate-200 relative mb-2 shadow-sm group-hover:shadow-md transition">
                    <img src="${escapeHtml(roomImg)}" alt="${escapeHtml(room.title)}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500 motion-3d" data-motion3d="true" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div class="w-10 h-10 rounded-full bg-white/90 text-[color:var(--primary)] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all flex items-center justify-center shadow-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-bold text-slate-700 truncate">${escapeHtml(room.title)}</div>
                    <div class="text-xs text-slate-500 line-clamp-2 mt-1">${escapeHtml(room.description || 'Click to view room details.')}</div>
                  </div>
                </div>
              `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        </div>
      </div>

      ${roomPreview ? `
        <div class="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-4" data-action="close-room-preview">
          <button class="absolute top-6 right-6 text-white text-3xl font-light hover:rotate-90 transition duration-300">✕</button>
          <div class="w-full max-w-5xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl" data-action="ignore">
            <img src="${escapeHtml(normalizeAssetUrl(roomPreview.image || ''))}" class="w-full h-full object-contain" />
            <div class="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
              <h4 class="text-2xl font-display font-bold mb-2">${escapeHtml(roomPreview.title)}</h4>
              <p class="text-slate-300 text-sm max-w-2xl">${escapeHtml(roomPreview.description || 'Modern interior design with premium finishes.')}</p>
              <a href="${escapeHtml(normalizeAssetUrl(roomPreview.image || ''))}" target="_blank" rel="noopener noreferrer" class="inline-flex mt-3 px-3 py-1.5 rounded-lg bg-white/15 text-xs font-semibold hover:bg-white/25 transition">Open Image in New Tab</a>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

const calculatePrice = () => {
  const { category, shape, bhk, area, quality, settings } = state.calculator;
  const normalizeCalcLabel = (value: string) => String(value || '').trim();
  const rawCategory = normalizeCalcLabel(category);
  const inferCategoryFromConfiguration = () => {
    // When user doesn't pick category, infer practical default from layout+configuration.
    if (rawCategory && settings.categoryMultipliers[rawCategory]) return rawCategory;
    return (Number(bhk) >= 4 || String(shape || '').toLowerCase() === 'custom') ? 'Villa' : 'Apartment';
  };
  const effectiveCategory = inferCategoryFromConfiguration();
  
  // Get category multiplier
  const catMult = settings.categoryMultipliers[effectiveCategory] || 1.1;
  
  // Get shape multiplier
  const shapeMult = settings.shapeMultipliers[shape as keyof typeof settings.shapeMultipliers] || 1.0;
  
  // Get quality multiplier
  const qualityMult = settings.qualityMultipliers[quality as keyof typeof settings.qualityMultipliers] || 1.0;
  
  // BHK multiplier
  const bhkMult = 1 + (Math.max(1, bhk) - 1) * 0.15;
  
  const result = Math.round(settings.baseSqftRate * area * catMult * shapeMult * qualityMult * bhkMult);
  state.calculator.result = result;

  state.calculator.selectedDesignId = null;


  const ContextImages = {
    apartment: [
      '/category/Apartment/apartment2.jpg',
      '/category/Apartment/apartment4.jpg',
      '/category/Apartment/apartment5.jpg',
      '/category/Apartment/apartment6.jpg',
      '/category/Apartment/apartment7.jpg',
      '/category/Apartment/apartment8.jpg',
      '/category/Apartment/apartment9.jpg',
      '/category/Apartment/apartment10.jpg',
      '/category/Apartment/apartment11.jpg'
    ],
    villa: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1615876234839-c2a1fdf88106?auto=format&fit=crop&q=80&w=1200'
    ],
    bathroom: [
      '/category/Bathroom/bathroom1.jpg',
      '/category/Bathroom/bathroom2.jpg',
      '/category/Bathroom/bathroom3.jpg',
      '/category/Bathroom/bathroom4.jpg',
      '/category/Bathroom/bathroom5.jpg'
    ],
    kitchen: [
      '/category/Custom/premium_kitchen.png',
      '/category/Kitchen/kitchen1.jpg',
      '/category/Kitchen/kitchen2.jpg',
      '/category/Kitchen/kitchen3.jpg',
      '/category/Kitchen/kitchen4.jpg',
      '/category/Kitchen/kitchen5.jpg'
    ],
    living: [
      '/category/Custom/luxury_living.png',
      '/category/Living room/living1.jpg',
      '/category/Living room/living2.jpg',
      '/category/Living room/living3.jpg',
      '/category/Living room/living4.jpg',
      '/category/Living room/living5.jpg',
      '/category/Living room/living6.jpg'
    ],
    bedroom: [
      '/category/Custom/modern_bedroom.png',
      '/category/Master Bedroom/master-bedroom1.jpg',
      '/category/Master Bedroom/master-bedroom2.jpg',
      '/category/Master Bedroom/master-bedroom3.jpg',
      '/category/Master Bedroom/master-bedroom4.jpg',
      '/category/Master Bedroom/master-bedroom5.jpg'
    ],
    gym: [
      '/category/Gym/gym (1).jpg',
      '/category/Gym/gym (2).jpg',
      '/category/Gym/gym (3).jpg',
      '/category/Gym/gym (4).jpg',
      '/category/Gym/gym (5).jpg'
    ],
    pooja: [
      '/category/Pooja room/pooja-room1.jpg',
      '/category/Pooja room/pooja-room2.jpg',
      '/category/Pooja room/pooja-room3.jpg',
      '/category/Pooja room/pooja-room4.jpg'
    ],
    kids: [
      '/category/Kids-bedroom/kids-bedroom1.jpg',
      '/category/Kids-bedroom/kids-bedroom2.jpg',
      '/category/Kids-bedroom/kids-bedroom3.jpg',
      '/category/Kids-bedroom/kids-bedroom4.jpg'
    ],
    office: [
      '/category/Office interior/office interior (1).jpg',
      '/category/Office interior/office interior (2).jpg',
      '/category/Office interior/office interior (3).jpg',
      '/category/Office interior/office interior (4).jpg'
    ],
    terrace: [
      '/category/Terrace/terrace (1).jpg',
      '/category/Terrace/terrace (2).jpg',
      '/category/Terrace/terrace (3).jpg',
      '/category/Terrace/terrace (4).jpg',
      '/category/Terrace/terrace (5).jpg'
    ],
    pool: [
      '/category/Custom/villa_pool.png',
      '/category/Swimming pool/swimmingpool1 - Copy.jpg',
      '/category/Swimming pool/swimmingpool2 - Copy.jpg',
      '/category/Swimming pool/swimmingpool3 - Copy.jpg',
      '/category/Swimming pool/swimmingpool4 - Copy.jpg',
      '/category/Swimming pool/swimming pool.jpg'
    ],
    garden: [
      '/category/Garden/garden (1).jpg',
      '/category/Garden/garden (2).jpg',
      '/category/Garden/garden (3).jpg',
      '/category/Garden/garden (4).jpg',
      '/category/Garden/garden (5).jpg'
    ],
    homeTheatre: [
      '/category/Home theatre/home theatre (1).jpg',
      '/category/Home theatre/home theatre (2).jpg',
      '/category/Home theatre/home theatre (3).jpg',
      '/category/Home theatre/home theatre (4).jpg'
    ],
    spa: [
      '/category/Spa/spa room (1).jpg',
      '/category/Spa/spa room (2).jpg',
      '/category/Spa/spa room (3).jpg',
      '/category/Spa/spa room (4).jpg'
    ],
    wardrobe: [
      '/category/wardrobe/wardrobe1.jpg',
      '/category/wardrobe/wardrobe2.jpg',
      '/category/wardrobe/wardrobe3.jpg',
      '/category/wardrobe/wardrobe4.jpg'
    ],
    balcony: [
      '/category/Balcony/balcony (1).jpg',
      '/category/Balcony/balcony (2).jpg',
      '/category/Balcony/balcony (3).jpg',
      '/category/Balcony/balcony (4).jpg'
    ],
    meetingRoom: [
      '/category/Meeting room/meeting room (1).jpg',
      '/category/Meeting room/meeting room (2).jpg',
      '/category/Meeting room/meeting room (3).jpg',
      '/category/Meeting room/meeting room (4).jpg',
      '/category/Meeting room/meeting room (5).jpg'
    ],
    classroom: [
      '/category/Classroom/classroom.jpg',
      '/category/Classroom/classroom1.jpg',
      '/category/Classroom/classroom2.jpg',
      '/category/Classroom/classroom3.jpg',
      '/category/Classroom/classroom4.jpg'
    ],
    epoxyFloor: [
      '/category/Epoxy Floor/epoxy1.jpg',
      '/category/Epoxy Floor/epoxy2.jpg',
      '/category/Epoxy Floor/epoxy3.jpg',
      '/category/Epoxy Floor/epoxy4.jpg',
      '/category/Epoxy Floor/epoxy5.jpg'
    ],
    dining: [
      '/category/Diningroom/dining1.jpg',
      '/category/Diningroom/dining2.jpg',
      '/category/Diningroom/dining3.jpg',
      '/category/Diningroom/dining4.jpg'
    ],
    guestRoom: [
      '/category/Guest room/guest room  (1).jpg',
      '/category/Guest room/guest room (2).jpg',
      '/category/Guest room/guest room (3).jpg',
      '/category/Guest room/guest room (4).jpg'
    ]
  };


  const getContextImages = (cat: string) => {
    const c = String(cat).toLowerCase();
    const canonical = getCanonicalCategoryImages(c);
    if (canonical.length > 0) return canonical;
    if (c.includes('apartment')) return ContextImages.apartment;
    if (c.includes('meeting') || c.includes('conference') || c.includes('boardroom')) return ContextImages.meetingRoom;
    if (c.includes('class') || c.includes('school') || c.includes('education')) return ContextImages.classroom;
    if (c.includes('epoxy') || (c.includes('floor') && !c.includes('plan'))) return ContextImages.epoxyFloor;
    if (c.includes('office') || c.includes('study') || c.includes('workspace')) return ContextImages.office;
    if (c.includes('pool') || c.includes('swimming')) return ContextImages.pool;
    if (c.includes('terrace') || c.includes('rooftop') || c.includes('deck')) return ContextImages.terrace;
    if (c.includes('balcony')) return ContextImages.balcony;
    if (c.includes('garden') || c.includes('landscape') || c.includes('courtyard')) return ContextImages.garden;
    if (c.includes('gym') || c.includes('fitness') || c.includes('wellness')) return ContextImages.gym;
    if (c.includes('pooja') || c.includes('prayer') || c.includes('mandir')) return ContextImages.pooja;
    if (c.includes('kids') || c.includes('child') || c.includes('play')) return ContextImages.kids;
    if (c.includes('bath')) return ContextImages.bathroom;
    if (c.includes('spa')) return ContextImages.spa;
    if (c.includes('kitchen')) return ContextImages.kitchen;
    if (c.includes('theater') || c.includes('theatre') || c.includes('cinema')) return ContextImages.homeTheatre;
    if (c.includes('wardrobe') || c.includes('closet') || c.includes('dressing')) return ContextImages.wardrobe;
    if (c.includes('bed') || c.includes('suite')) return ContextImages.bedroom;
    if (c.includes('guest')) return ContextImages.guestRoom;
    if (c.includes('dining') || c.includes('pantry')) return ContextImages.dining;
    if (c.includes('living') || c.includes('lounge')) return ContextImages.living;
    if (c.includes('villa')) return ContextImages.villa;
    return ContextImages.living;
  };

  const resolveCalculatorImage = (item: any, fallbackCategory: string, index = 0) => {
    const cat = String(item?.category || item?.title || fallbackCategory);
    const pool = getContextImages(cat) || getContextImages(fallbackCategory);
    const direct = normalizeAssetUrl(String(
      item?.previewImage
      || item?.image
      || item?.imageUrl
      || item?.url
      || (Array.isArray(item?.images) ? item.images[0] : '')
      || ''
    ));

    if (direct && direct.length > 10) return direct;
    
    // Create a stable seed based on the item title/category to ensure diversity
    const seed = String(item?.title || item?.category || fallbackCategory).length + index;
    const poolUrl = pool[seed % pool.length];
    
    if (poolUrl && poolUrl.startsWith('http')) {
      return `${poolUrl}?auto=format&fit=crop&q=80&w=800&sig=${seed}`;
    }
    return poolUrl || '';
  };

  const ensureUniqueRelatedImages = (items: any[], fallbackCategory: string, seedBase: string) => {
    const seen = new Set<string>();
    const fallbackPool = (getContextImages(fallbackCategory) || []).map((img) => normalizeAssetUrl(String(img || ''))).filter(Boolean);
    const itemDrivenPool = (items || [])
      .flatMap((item: any) => getContextImages(String(item?.category || item?.title || fallbackCategory)) || [])
      .map((img) => normalizeAssetUrl(String(img || '')))
      .filter(Boolean);
    const globalPool = Array.from(new Set([...itemDrivenPool, ...fallbackPool]));
    const fallbackSeed = String(seedBase || fallbackCategory).length;

    return (items || []).map((item: any, index: number) => {
      const currentImage = normalizeAssetUrl(String(item?.previewImage || item?.image || ''));
      let resolved = currentImage;
      const itemPool = (getContextImages(String(item?.category || item?.title || fallbackCategory)) || [])
        .map((img) => normalizeAssetUrl(String(img || '')))
        .filter(Boolean);

      if (!resolved || seen.has(resolved)) {
        for (let offset = 0; offset < itemPool.length; offset += 1) {
          const candidate = itemPool[(fallbackSeed + index + offset) % itemPool.length];
          if (candidate && !seen.has(candidate)) {
            resolved = candidate;
            break;
          }
        }
      }

      if (!resolved || seen.has(resolved)) {
        for (let offset = 0; offset < globalPool.length; offset += 1) {
          const candidate = globalPool[(fallbackSeed + index + offset) % globalPool.length];
          if (candidate && !seen.has(candidate)) {
            resolved = candidate;
            break;
          }
        }
      }

      if (resolved) seen.add(resolved);
      return {
        ...item,
        previewImage: resolved || currentImage
      };
    }).filter((item: any) => Boolean(String(item?.previewImage || '').trim()));
  };

  const allDesigns = Array.from(new Map(
    [...getDesigns(), ...state.catalog, ...state.customer.designs].map(d => [d.id || d.title, d])
  ).values()) as any[];
  const qualityTier = quality === 'luxury' ? 'ultimate' : quality === 'premium' ? 'luxury' : 'essential';
  const qualityOffset = quality === 'luxury' ? 2 : quality === 'premium' ? 1 : 0;
  
  // Quality-specific keywords for smarter design filtering
  const qualityKeywords = {
    economy: ['essential', 'standard', 'basic', 'economy', 'simple', 'minimal', 'budget'],
    premium: ['premium', 'luxury', 'designer', 'modern', 'elegant', 'sophisticated', 'enhanced'],
    luxury: ['ultimate', 'luxury', 'luxurious', 'opulent', 'exclusive', 'prestige', 'elite', 'royal', 'palatial']
  };
  
  // Function to score design based on quality match
  const getQualityMatchScore = (design: any, targetQuality: string) => {
    const searchableText = normalizeFeatureText(
      `${String(design?.title || '')} ${String(design?.description || '')} ${String(design?.style || '')} ${String(design?.category || '')}`
    );
    const keywords = qualityKeywords[targetQuality as keyof typeof qualityKeywords] || [];
    let score = 0;
    keywords.forEach(keyword => {
      if (searchableText.includes(keyword)) score += 2;
    });
    // Bonus for exact quality tier match
    if (searchableText.includes(qualityTier)) score += 5;
    return score;
  };
  
  const calculatorImageLibrary = getAdminImageLibrary()
    .filter((item: any) => item && item.active !== false);

  const isFullHome = effectiveCategory.toLowerCase() === 'apartment' || effectiveCategory.toLowerCase() === 'villa';
  let matchedPackage: any = null;

  const normalizeFeatureText = (value: string) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const includesAnyToken = (text: string, tokens: string[]) => tokens.some((token) => text.includes(token));
  const villaOnlySpaceTokens = ['terrace', 'gym', 'fitness', 'theater', 'theatre', 'cinema', 'spa', 'swimming', 'pool'];
  const apartmentBlockedSpaceTokens = ['office', 'study', 'workspace', 'meeting', 'conference', 'boardroom', 'classroom', 'school', 'epoxy', 'garden', 'balcony'];
  const apartmentCoreTokens = ['kitchen', 'living', 'lounge', 'dining', 'bath', 'bed', 'suite', 'pooja', 'prayer', 'mandir', 'wardrobe', 'closet'];
  const isVillaOnlySpace = (value: string) => {
    const normalized = normalizeFeatureText(value);
    return villaOnlySpaceTokens.some((token) => normalized.includes(token));
  };
  const isAllowedApartmentSpace = (value: string, explicitCategoryOverride?: string) => {
    const normalized = normalizeFeatureText(value);
    if (!normalized) return false;

    const overrideKey = normalizeFeatureText(String(explicitCategoryOverride || ''));
    if (overrideKey) {
      const overrideTokens = overrideKey.split(' ').filter(Boolean);
      if (overrideTokens.length > 0 && overrideTokens.every((token) => normalized.includes(token))) {
        return true;
      }
    }

    if (isVillaOnlySpace(normalized)) return false;
    if (apartmentBlockedSpaceTokens.some((token) => normalized.includes(token))) return false;
    return apartmentCoreTokens.some((token) => normalized.includes(token));
  };
  const recommendationHomeType: 'villa' | 'apartment' = (() => {
    const effectiveKey = normalizeFeatureText(effectiveCategory);
    const configDrivenType: 'villa' | 'apartment' = (Number(bhk) >= 4 || String(shape || '').toLowerCase() === 'custom') ? 'villa' : 'apartment';
    if (effectiveKey === 'villa') return 'villa';
    if (effectiveKey === 'apartment') return 'apartment';
    return configDrivenType;
  })();
  const qualityStyleLabel = quality === 'luxury'
    ? 'Signature Luxury Concept'
    : quality === 'premium'
      ? 'Premium Curated Concept'
      : 'Essential Smart Concept';
  const villaConceptsByQuality: Record<'economy' | 'premium' | 'luxury', Array<{ title: string; category: string }>> = {
    economy: [
      { title: 'Smart Family Living Villa', category: 'Living Room' },
      { title: 'Efficient Modular Villa Kitchen', category: 'Kitchen' },
      { title: 'Comfort Master Suite', category: 'Master Bedroom' },
      { title: 'Practical Bathroom Vanity', category: 'Bathroom' },
      { title: 'Compact Terrace Lounge', category: 'Terrace' }
    ],
    premium: [
      { title: 'Designer Double-Height Living', category: 'Living Room' },
      { title: 'Chef-Ready Gourmet Kitchen', category: 'Kitchen' },
      { title: 'Premium Master Suite', category: 'Master Bedroom' },
      { title: 'Entertainment Home Theatre', category: 'Home Theatre' },
      { title: 'Landscape Terrace Deck', category: 'Terrace' }
    ],
    luxury: [
      { title: 'Palatial Villa Living Pavilion', category: 'Living Room' },
      { title: 'Grand Gourmet Kitchen Gallery', category: 'Kitchen' },
      { title: 'Royal Master Suite Retreat', category: 'Master Bedroom' },
      { title: 'Infinity Pool Villa Deck', category: 'Swimming Pool' },
      { title: 'Private Wellness Spa & Gym', category: 'Spa' }
    ]
  };
  const apartmentBlockedImagePathPattern = /(terrace|gym|home theatre|spa|swimming pool|meeting room|classroom|office interior|epoxy floor|garden|balcony)/i;

  const featureAliasTokens: Record<string, string[]> = {
    'modular kitchen': ['modular kitchen', 'kitchen', 'chef', 'gourmet', 'cook'],
    'designer kitchen': ['designer kitchen', 'kitchen', 'chef', 'gourmet'],
    'gourmet kitchen': ['gourmet kitchen', 'kitchen', 'chef'],
    'living + dining': ['living', 'dining', 'lounge', 'hall'],
    'grand living': ['living', 'lounge', 'hall', 'grand living'],
    'double height living': ['living', 'double height', 'lounge', 'hall'],
    'wardrobes': ['wardrobe', 'closet', 'dressing'],
    'walk in wardrobes': ['walk in', 'wardrobe', 'closet', 'dressing'],
    'family bedrooms': ['bedroom', 'suite', 'guest room', 'family bedroom'],
    'master suites': ['master suite', 'suite', 'bedroom'],
    'suite bedrooms': ['suite', 'bedroom', 'master'],
    'spa bathroom': ['spa bathroom', 'bathroom', 'bath', 'vanity', 'washroom'],
    'luxury bathrooms': ['bathroom', 'bath', 'vanity', 'washroom'],
    'bathroom vanity': ['bathroom', 'vanity', 'washroom', 'bath'],
    'balcony design': ['balcony', 'terrace', 'deck'],
    'balcony lounge': ['balcony', 'terrace', 'deck', 'lounge'],
    'premium balcony': ['balcony', 'terrace', 'deck'],
    'premium balconies': ['balcony', 'terrace', 'deck'],
    'entertainment balcony': ['balcony', 'terrace', 'deck', 'entertainment'],
    'sky balcony': ['balcony', 'terrace', 'deck', 'sky'],
    'swimming pool': ['swimming pool', 'pool', 'deck'],
    'infinity pool': ['infinity pool', 'pool', 'deck'],
    'home theater': ['theater', 'theatre', 'cinema', 'media room'],
    'cinema theater': ['theater', 'theatre', 'cinema', 'media room'],
    'private theater': ['theater', 'theatre', 'cinema', 'media room'],
    'home gym': ['gym', 'fitness', 'workout', 'wellness'],
    'fitness studio': ['gym', 'fitness', 'workout', 'studio'],
    'wellness gym': ['gym', 'fitness', 'workout', 'wellness'],
    'pooja room': ['pooja', 'prayer', 'mandir'],
    'kids room': ['kids', 'child', 'children', 'playroom'],
    'terrace': ['terrace', 'deck', 'rooftop'],
    'home office': ['office', 'study', 'work', 'desk'],
    'meeting room': ['meeting', 'conference', 'boardroom', 'office', 'workspace'],
    'classroom': ['class', 'school', 'education', 'training', 'learning'],
    'epoxy floor': ['epoxy', 'floor', 'industrial', 'garage', 'paving'],
    'guest room': ['guest', 'bedroom', 'extra room', 'visitor'],
    'spa': ['spa', 'massage', 'wellness', 'relaxation', 'sauna']
  };

  const findRoomByFeature = (featureName: string, rooms: any[]) => {
    const normalizedFeature = normalizeFeatureText(featureName);
    const featureTokens = featureAliasTokens[normalizedFeature] || normalizedFeature.split(' ').filter(Boolean);

    return rooms.find((room: any) => {
      const searchable = normalizeFeatureText(`${String(room?.title || '')} ${String(room?.description || '')}`);
      return includesAnyToken(searchable, featureTokens);
    });
  };

  const categoryAliasTokens: Record<string, string[]> = {
    'office interior': ['office', 'study', 'workspace', 'desk', 'home office'],
    'terrace': ['terrace', 'rooftop', 'deck', 'balcony'],
    'swimming pool': ['swimming pool', 'pool', 'infinity pool'],
    'garden': ['garden', 'landscape', 'courtyard', 'green'],
    'balcony': ['balcony', 'deck', 'terrace'],
    'living room': ['living', 'lounge', 'living area', 'hall'],
    'kitchen': ['kitchen', 'chef', 'modular kitchen', 'gourmet'],
    'bathroom': ['bathroom', 'bath', 'vanity', 'spa'],
    'pooja room': ['pooja', 'prayer', 'mandir'],
    'gym': ['gym', 'fitness', 'workout', 'wellness'],
    'meeting room': ['meeting', 'conference', 'boardroom', 'office'],
    'classroom': ['class', 'school', 'education', 'training'],
    'epoxy floor': ['epoxy', 'floor', 'industrial', 'garage'],
    'guest room': ['guest', 'bedroom', 'extra room'],
    'spa': ['spa', 'massage', 'wellness', 'relaxation']
  };

  const categoryToFeatureKey: Record<string, string> = {
    'office interior': 'Home Office',
    'terrace': 'Terrace',
    'swimming pool': 'Swimming Pool',
    'garden': 'Terrace',
    'balcony': 'Balcony Design',
    'living room': 'Grand Living',
    'kitchen': 'Modular Kitchen',
    'bathroom': 'Bathroom Vanity',
    'pooja room': 'Pooja Room',
    'gym': 'Home Gym',
    'home theatre': 'Home Theater',
    'villa': 'Swimming Pool',
    'apartment': 'Living + Dining',
    'meeting room': 'Home Office',
    'classroom': 'Home Office',
    'epoxy floor': 'Terrace',
    'guest room': 'Family Bedrooms',
    'spa': 'Spa Bathroom'
  };

  const buildCuratedPackageDesigns = (pkg: any) => {
    const rooms = Array.isArray(pkg?.rooms) ? pkg.rooms : [];
    const features = Array.isArray(pkg?.features) ? pkg.features : [];
    const pkgType = String(pkg?.type || category || '').toLowerCase();
    const pkgBhk = Number(pkg?.bhk || bhk || 0);
    const isApartmentPackage = pkgType === 'apartment';
    const requiredKey = `${pkgType}-${pkgBhk}`;
    const requiredSpaces = DEFAULT_CALC_LIBRARY_REQUIREMENTS[requiredKey] || [];
    const combinedFeatures = Array.from(new Set([...features, ...requiredSpaces]))
      .filter((feature: string) => isApartmentPackage ? isAllowedApartmentSpace(feature) : true);
    const curatedRooms = isApartmentPackage
      ? rooms.filter((room: any) => isAllowedApartmentSpace(`${String(room?.title || '')} ${String(room?.description || '')}`))
      : rooms;

    const villaSampleMatches = pkgType === 'villa'
      ? calculatorImageLibrary
        .filter((entry: any) => {
          const entryType = String(entry?.homeType || '').toLowerCase();
          const entryQuality = String(entry?.quality || '').toLowerCase();
          const entryBhk = Number(entry?.bhk || 0);
          const bhkMatch = !entry?.bhk || entryBhk === pkgBhk;
          return entryType === 'villa' && entryQuality === quality && bhkMatch;
        })
        .slice(0, 12)
        .map((entry: any, i: number) => ({
          id: String(entry?.id || `${String(pkg.id || 'pkg')}-villa-sample-${i + 1}`),
          title: String(entry?.title || 'Villa Concept'),
          category: String(entry?.category || 'Villa'),
          style: String(pkg?.subtitle || 'Curated'),
          previewImage: resolveCalculatorImage({
            previewImage: entry?.image || '',
            image: entry?.image || '',
            title: entry?.title || 'Villa Concept',
            category: entry?.category || 'Villa',
            description: entry?.description || ''
          }, 'villa', i),
          source: 'villa-package-sample',
          packageId: pkg.id,
          packageName: pkg.name,
          roomId: null
        }))
      : [];

    const featureDrivenDesigns = combinedFeatures.map((feature: string, index: number) => {
      const matchedRoom = findRoomByFeature(feature, curatedRooms);
      const libraryMatch = calculatorImageLibrary.find((entry: any) => {
        const categoryKey = normalizeFeatureText(String(entry?.category || ''));
        const titleKey = normalizeFeatureText(String(entry?.title || ''));
        const featureKey = normalizeFeatureText(feature);
        const qualityKey = String(entry?.quality || '').toLowerCase();
        const typeKey = String(entry?.homeType || '').toLowerCase();
        const bhkMatch = !entry?.bhk || Number(entry?.bhk || 0) === pkgBhk;
        return qualityKey === quality
          && bhkMatch
          && (!typeKey || typeKey === pkgType)
          && (titleKey.includes(featureKey) || featureKey.includes(titleKey) || categoryKey === pkgType);
      });
      const fallbackFeatureImage = featureImageMap[String(feature || '')];
      const resolvedImage = resolveCalculatorImage(
        {
          previewImage: libraryMatch?.image || fallbackFeatureImage || matchedRoom?.image || '',
          image: libraryMatch?.image || fallbackFeatureImage || matchedRoom?.image || '',
          title: feature,
          category: feature,
          description: matchedRoom?.description || feature
        },
        feature,
        index
      );

      return {
        id: `${String(pkg.id || 'pkg')}-feature-${index + 1}`,
        title: String(feature || 'Curated Design'),
        category: String(feature || category),
        style: String(pkg?.subtitle || 'Curated'),
        previewImage: resolvedImage,
        source: 'package-feature',
        packageId: pkg.id,
        packageName: pkg.name,
        roomId: matchedRoom?.id || null
      };
    });

    const unique = new Map<string, any>();
    [...villaSampleMatches, ...featureDrivenDesigns].forEach((item: any) => {
      const key = `${normalizeFeatureText(String(item?.title || ''))}::${normalizeAssetUrl(String(item?.previewImage || ''))}`;
      if (!unique.has(key) && String(item?.previewImage || '').trim()) {
        unique.set(key, item);
      }
    });

    return Array.from(unique.values()).slice(0, 8);
  };

  const buildVillaQualityConcepts = (baseItems: any[]) => {
    const concepts = villaConceptsByQuality[quality as keyof typeof villaConceptsByQuality] || villaConceptsByQuality.premium;
    const villaPortfolioImages = (DEFAULT_PORTFOLIO_CONTENT.featuredProjects || [])
      .filter((project) => String(project?.propertyType || '').toLowerCase() === 'villa')
      .flatMap((project) => (project.images || []).map((img) => normalizeAssetUrl(String(img?.url || ''))))
      .filter(Boolean);

    const seen = new Set<string>();

    const villaOnlySeedPool = [
      ...villaPortfolioImages,
      ...(getContextImages('villa') || []).map((img) => normalizeAssetUrl(String(img || ''))).filter(Boolean)
    ];

    return concepts.map((concept, index) => {
      const directMatch = (baseItems || []).find((item: any) => {
        const text = normalizeFeatureText(`${String(item?.title || '')} ${String(item?.category || '')} ${String(item?.style || '')}`);
        return includesAnyToken(text, normalizeFeatureText(concept.category).split(' ').filter(Boolean));
      });

      const directMatchImage = normalizeAssetUrl(String(directMatch?.previewImage || directMatch?.image || ''));
      const isDirectImageVillaLike = /villa|pool|terrace|garden|beachfront|bungalow/i.test(
        normalizeFeatureText(`${String(directMatch?.title || '')} ${String(directMatch?.category || '')}`)
      );
      const combinedPool = [
        isDirectImageVillaLike ? directMatchImage : '',
        ...villaOnlySeedPool
      ].filter(Boolean);

      let chosenImage = '';
      for (let offset = 0; offset < combinedPool.length; offset += 1) {
        const candidate = combinedPool[(qualityOffset + index + offset) % combinedPool.length];
        if (candidate && !seen.has(candidate)) {
          chosenImage = candidate;
          break;
        }
      }

      if (chosenImage) seen.add(chosenImage);

      return {
        id: `villa-quality-${quality}-${index + 1}`,
        title: concept.title,
        category: concept.category,
        style: qualityStyleLabel,
        previewImage: chosenImage,
        source: 'villa-quality-concept'
      };
    });
  };

  const applyQualityConceptsForNonVilla = (items: any[]) => {
    const qualityImageShift = quality === 'luxury' ? 4 : quality === 'premium' ? 2 : 0;

    return (items || []).map((item: any, index: number) => {
      const categoryLabel = String(item?.category || effectiveCategory || 'Living Room');
      const categoryKey = normalizeFeatureText(categoryLabel);
      const baseTitle = String(item?.title || categoryLabel || 'Design');
      const pool = (getContextImages(categoryLabel) || []).map((img) => normalizeAssetUrl(String(img || ''))).filter(Boolean);
      const rotatedImage = pool.length > 0 ? pool[(qualityImageShift + index) % pool.length] : '';
      const existingImage = normalizeAssetUrl(String(item?.previewImage || item?.image || ''));
      const source = String(item?.source || '');
      const retainExplicitConceptName = source.includes('package-feature') || source.includes('package-room-category') || source.includes('category-canonical-fallback') || source.includes('category-sample');
      
      let nextTitle = baseTitle;
      if (!retainExplicitConceptName) {
        const conceptMap = CATEGORY_QUALITY_CONCEPTS[categoryKey];
        nextTitle = conceptMap ? conceptMap[quality as CalcImageQuality] : baseTitle;
      }

      return {
        ...item,
        title: nextTitle,
        style: qualityStyleLabel,
        previewImage: rotatedImage || existingImage
      };
    });
  };

  if (isFullHome) {
    const pkgs = getPackagesSync();
    const byType = pkgs.filter((p: any) => String(p?.type || '').toLowerCase() === effectiveCategory.toLowerCase());
    const withBhk = byType.filter((p: any) => Number(p?.bhk || 0) === Number(bhk));
    const fallbackFromName = byType.filter((p: any) => {
      const text = `${String(p?.name || '')} ${String(p?.subtitle || '')}`;
      return new RegExp(`\\b${bhk}\\s*bhk\\b`, 'i').test(text);
    });

    const candidates = [...withBhk, ...fallbackFromName];
    const tierPreferred = candidates.filter((p: any) => {
      const text = `${String(p?.name || '')} ${String(p?.subtitle || '')}`.toLowerCase();
      return text.includes(qualityTier);
    });

    matchedPackage = [...(tierPreferred.length > 0 ? tierPreferred : candidates)]
      .sort((a: any, b: any) => Number((b?.rooms || []).length) - Number((a?.rooms || []).length))[0] || null;

    if (matchedPackage) {
      const curated = buildCuratedPackageDesigns(matchedPackage);
      state.calculator.relatedDesigns = curated.length > 0 ? curated : [];
    } else {
      const living = allDesigns.find(d => String(d.category).toLowerCase().includes('living')) || { previewImage: '/category/Custom/luxury_living.png', title: 'Grand Living', category: 'Living' };
      const kitchen = allDesigns.find(d => String(d.category).toLowerCase().includes('kitchen')) || { previewImage: '/category/Custom/premium_kitchen.png', title: 'Modular Kitchen', category: 'Kitchen' };
      const bed = allDesigns.find(d => String(d.category).toLowerCase().includes('bed')) || { previewImage: '/category/Custom/modern_bedroom.png', title: 'Master Bedroom', category: 'Bedroom' };
      const bath = allDesigns.find(d => String(d.category).toLowerCase().includes('bath')) || { previewImage: '/category/Bathroom/bathroom5.jpg', title: 'Luxe Bath', category: 'Bathroom' };
      const dining = allDesigns.find(d => String(d.category).toLowerCase().includes('dining')) || { previewImage: '/category/Custom/luxury_living.png', title: 'Dining Space', category: 'Dining' };
      
      const mixedRooms = [living, kitchen, bed, bath, dining].filter(Boolean);
      
      state.calculator.relatedDesigns = mixedRooms.map((d: any, i: number) => {
        const resolvedImage = resolveCalculatorImage(d, d.category || 'living', i);

        return {
          id: `fallback-design-${i + 1}`,
          title: d.title || 'Curated Design',
          category: d.category || 'living',
          previewImage: resolvedImage || d.previewImage,
          source: 'calculator-fallback'
        };
      });
    }
  } else {
    const requestedCategoryKey = normalizeFeatureText(effectiveCategory);
    const categoryKey = (recommendationHomeType === 'apartment' && (isVillaOnlySpace(requestedCategoryKey) || apartmentBlockedSpaceTokens.some((token) => requestedCategoryKey.includes(token))))
      ? 'living room'
      : requestedCategoryKey;
    const resultCategoryLabel = categoryKey === 'living room' ? 'Living Room' : effectiveCategory;
    const categoryTokens = categoryAliasTokens[categoryKey] || categoryKey.split(' ').filter(Boolean);
    const canonicalFeature = categoryToFeatureKey[categoryKey] || '';
    const libraryCategoryImage = calculatorImageLibrary.find((entry: any) => {
      const entryCategory = normalizeFeatureText(String(entry?.category || ''));
      const entryQuality = String(entry?.quality || '').toLowerCase();
      return entryQuality === quality && (entryCategory === categoryKey || categoryTokens.some((token) => entryCategory.includes(token)));
    })?.image;
    const canonicalImage = normalizeAssetUrl(String(libraryCategoryImage || (canonicalFeature ? featureImageMap[canonicalFeature] : '') || ''));
    const strictCategoryPattern = new RegExp(`\\b(${categoryTokens.join('|')})\\b`, 'i');

    const packageRoomMatches = getPackagesSync()
      .filter((pkg: any) => {
        const pkgType = String(pkg?.type || '').toLowerCase();
        const targetType = String(recommendationHomeType || '').toLowerCase();
        if (targetType === 'villa' && pkgType !== 'villa') return false;
        if (targetType === 'apartment' && pkgType === 'villa') return false;

        if (isFullHome || targetType === 'villa' || targetType === 'apartment') {
          const pkgBhk = Number(pkg?.bhk || 0);
          if (Number.isFinite(pkgBhk) && pkgBhk > 0 && Number.isFinite(Number(bhk)) && Number(bhk) > 0) {
            return pkgBhk === Number(bhk);
          }
        }

        return true;
      })
      .flatMap((pkg: any) => (Array.isArray(pkg?.rooms) ? pkg.rooms.map((room: any) => ({ room, pkg })) : []))
      .filter(({ room }: any) => {
        const searchable = normalizeFeatureText(`${String(room?.title || '')} ${String(room?.description || '')}`);
        if (recommendationHomeType === 'apartment' && !isAllowedApartmentSpace(searchable, requestedCategoryKey)) return false;
        return includesAnyToken(searchable, categoryTokens);
      })
      .slice(qualityOffset, qualityOffset + 8)
      .map(({ room, pkg }: any, i: number) => ({
        id: String(room?.id || `${String(pkg?.id || 'pkg')}-room-${i + 1}`),
        title: String(room?.title || resultCategoryLabel),
        category: resultCategoryLabel,
        style: String(pkg?.subtitle || 'Curated'),
        previewImage: resolveCalculatorImage({ previewImage: room?.image || canonicalImage || '', image: room?.image || canonicalImage || '', title: room?.title || resultCategoryLabel, category: resultCategoryLabel }, resultCategoryLabel, i),
        source: 'package-room-category',
        packageId: pkg?.id,
        packageName: pkg?.name,
        roomId: room?.id || null
      }));

    const designMatches = allDesigns
      .filter(d => {
        const text = normalizeFeatureText(`${String((d as any).category || '')} ${String((d as any).title || '')} ${String((d as any).description || '')}`);
        if (recommendationHomeType === 'apartment' && !isAllowedApartmentSpace(text, requestedCategoryKey)) return false;
        return strictCategoryPattern.test(text);
      })
      // Score and sort by quality match
      .map(d => ({ design: d, score: getQualityMatchScore(d, quality) }))
      .sort((a, b) => b.score - a.score || a.score - b.score) // Primary: quality score, Secondary: original order
      .slice(0, 8) // Take top 8 quality-matched designs
      .map((item, i) => {
        const d = item.design;
        const resolvedImage = resolveCalculatorImage(d, resultCategoryLabel, i);

        return {
          ...d,
          previewImage: resolvedImage,
          qualityScore: item.score // Store for debugging
        };
      });

    const canonicalFallbackDesigns = (canonicalImage ? [canonicalImage, ...(getContextImages(resultCategoryLabel) || [])] : (getContextImages(resultCategoryLabel) || []))
      .slice(0, 8)
      .map((img: string, i: number) => ({
        id: `${categoryKey || 'category'}-fallback-${i + 1}`,
        title: canonicalFeature || resultCategoryLabel,
        category: resultCategoryLabel,
        style: 'Curated',
        previewImage: normalizeAssetUrl(String(img || '')),
        source: 'category-canonical-fallback'
      }));

    if (packageRoomMatches.length > 0) {
      state.calculator.relatedDesigns = packageRoomMatches;
    } else if (designMatches.length > 0) {
      state.calculator.relatedDesigns = designMatches;
    } else {
      state.calculator.relatedDesigns = canonicalFallbackDesigns;
    }

    // Keep recommendations tightly scoped to the selected concept/category.
    const strictRelated = (state.calculator.relatedDesigns || []).filter((item: any) => {
      const searchable = normalizeFeatureText(
        `${String(item?.title || '')} ${String(item?.category || '')} ${String(item?.style || '')}`
      );
      return strictCategoryPattern.test(searchable);
    });
    if (strictRelated.length > 0) {
      state.calculator.relatedDesigns = strictRelated;
    }
  }

  if (recommendationHomeType === 'apartment') {
    const toApartmentCoreLabel = (value: string) => {
      const text = normalizeFeatureText(value);
      if (text.includes('kitchen') || text.includes('chef') || text.includes('gourmet')) return 'Kitchen';
      if (text.includes('pooja') || text.includes('prayer') || text.includes('mandir')) return 'Pooja Room';
      if (text.includes('dining')) return 'Dining Room';
      if (text.includes('bath') || text.includes('vanity') || text.includes('washroom')) return 'Bathroom';
      if (text.includes('bed') || text.includes('suite') || text.includes('wardrobe') || text.includes('closet')) return 'Bedroom';
      return 'Living Room';
    };

    state.calculator.relatedDesigns = (state.calculator.relatedDesigns || []).map((item: any) => {
      const currentImage = normalizeAssetUrl(String(item?.previewImage || item?.image || ''));
      const semanticText = `${String(item?.category || '')} ${String(item?.title || '')} ${String(item?.style || '')}`;
      const normalizedCategory = normalizeFeatureText(semanticText);
      const categoryNeedsRemap = !normalizedCategory || !isAllowedApartmentSpace(normalizedCategory);
      const coreLabel = toApartmentCoreLabel(semanticText);
      if (!currentImage) return item;
      if (!currentImage.startsWith('/')) return item;
      if (apartmentBlockedImagePathPattern.test(currentImage) || categoryNeedsRemap) {
        return { ...item, title: coreLabel, category: coreLabel, previewImage: '', image: '' };
      }
      return { ...item, title: coreLabel, category: coreLabel };
    });

    state.calculator.relatedDesigns = (state.calculator.relatedDesigns || []).filter((item: any) => {
      const text = normalizeFeatureText(`${String(item?.title || '')} ${String(item?.category || '')}`);
      return isAllowedApartmentSpace(text);
    });

    if ((state.calculator.relatedDesigns || []).length === 0) {
      const apartmentCoreFallback = ['Kitchen', 'Living Room', 'Dining Room', 'Bathroom', 'Bedroom', 'Pooja Room', 'Classroom'];
      state.calculator.relatedDesigns = apartmentCoreFallback.map((label, idx) => ({
        id: `apartment-core-${bhk}-${idx + 1}`,
        title: label,
        category: label,
        style: 'Curated',
        previewImage: resolveCalculatorImage({ title: label, category: label, previewImage: '' }, label, idx),
        source: 'apartment-core-fallback'
      }));
    }
  }

  if (recommendationHomeType === 'villa') {
    state.calculator.relatedDesigns = buildVillaQualityConcepts(state.calculator.relatedDesigns || []);
  } else {
    state.calculator.relatedDesigns = applyQualityConceptsForNonVilla(state.calculator.relatedDesigns || []);
  }

  state.calculator.relatedDesigns = ensureUniqueRelatedImages(
    state.calculator.relatedDesigns || [],
    effectiveCategory,
    `${effectiveCategory}-${shape}-${bhk}-${quality}`
  );

  state.calculator.selectedDesignId = state.calculator.relatedDesigns?.[0]?.id || null;

  saveCalculationRecord({
    userId: state.currentUser?.id,
    userName: state.currentUser?.name,
    category: effectiveCategory,
    shape,
    area,
    bhk,
    quality,
    result,
    packageId: matchedPackage?.id || null,
    packageName: matchedPackage?.name || null,
    curatedDesigns: (state.calculator.relatedDesigns || []).map((item: any) => ({
      id: item?.id,
      title: item?.title,
      image: normalizeAssetUrl(String(item?.previewImage || '')),
      source: item?.source || 'catalog'
    })),
    timestamp: new Date().toISOString()
  });

  render();
};

const renderPriceCalculatorModal = () => {
  if (!state.calculator.isOpen) return '';
  const s = state.calculator;
  const settings = s.settings;
  const selectedCategoryKey = String(s.category || '').trim();
  const normalizedDisplayCategory = String(selectedCategoryKey || '').toLowerCase().trim();
  const displayConfigType = (normalizedDisplayCategory === 'villa' || Number(s.bhk) >= 4 || String(s.shape || '').toLowerCase() === 'custom') ? 'villa' : 'apartment';
  const villaOnlyDisplayPattern = /(terrace|gym|fitness|theat|cinema|spa|swimming|pool|office|study|workspace|meeting|conference|boardroom|classroom|school|epoxy)/i;
  const effectiveDisplayCategory = settings.categoryMultipliers[selectedCategoryKey]
    ? (displayConfigType === 'apartment' && villaOnlyDisplayPattern.test(normalizedDisplayCategory) ? 'Living Room' : selectedCategoryKey)
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
        <button data-action="close-calculator" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition z-10">✕</button>
        
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
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  ${categories.map(cat => `
                    <button data-action="calc-set-category" data-value="${cat}" class="group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${s.category === cat ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-slate-100 hover:border-slate-300'}">
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
                      <button data-action="calc-set-quality" data-value="${q}" class="w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${isSelected ? colors.selected + ' shadow-lg scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}">
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
                        <div class="grid grid-cols-2 gap-2">
                          ${qualityConfig.features.map((feature: string) => `
                            <div class="flex items-center gap-1.5">
                              <i class="ri-checkbox-circle-line text-xs ${isSelected ? colors.icon : 'text-slate-300'}"></i>
                              <span class="text-[9px] font-bold text-slate-600 uppercase tracking-tight">${feature}</span>
                            </div>
                          `).join('')}
                        </div>
                      </button>
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
                  <div class="group cursor-pointer p-2 rounded-2xl transition-all ${s.selectedDesignId === design.id ? 'bg-amber-50 ring-2 ring-amber-400' : 'hover:bg-slate-50'}" data-action="calc-select-design" data-value="${design.id}">
                    <div class="aspect-[4/5] rounded-xl overflow-hidden mb-3 relative">
                      <img src="${escapeHtml(normalizeAssetUrl(String(design.previewImage || design.image || design.imageUrl || (Array.isArray(design.images) ? design.images[0] : '') || '')) || '/category/Living room/living1.jpg')}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.onerror=null;this.src='/category/Living room/living1.jpg'" />
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

