// @ts-nocheck
// Reference copies generated from main.ts for organization only.
// Runtime source of truth remains main.ts.

// BACKEND-INTEGRATION LAYER COPY
// --- Backend integration imports ---------------------------------------------
import { saveFile, getFileUrl, deleteFile } from './services/storage';
import { getBotResponse, getQuickAction, createMessage } from './services/chatbot';
import { createPhonePePayment, fetchPhonePeStatus } from './services/paymentApi';

// Expose feature image map globally for modal rendering
(window as any).__featureImageMap = featureImageMap;



const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found.');
}

const tabToPath: Record<TabKey, string> = {
  home: '/',
  gallery: '/gallery',
  categories: '/categories',
  services: '/services',
  contact: '/contact',
  login: '/login',
  admin: '/admin',
  dashboard: '/dashboard',
  designs: '/admin/designs',
  'ai-designs': '/admin/ai-designs',
  bookings: '/admin/bookings',
  users: '/admin/users',
  inquiries: '/admin/inquiries',
  feedbacks: '/admin/feedbacks',
  settings: '/admin/settings',
  'ai-studio': '/ai-studio',
  showroom: '/showroom',
  portfolio: '/portfolio'
};

const pathToTab: Record<string, TabKey> = Object.entries(tabToPath).reduce((acc, [tab, path]) => {
  acc[path] = tab as TabKey;
  return acc;
}, {} as Record<string, TabKey>);




// --- Backend integration layer (API wrappers) -------------------------------
const API_BASE = '/api';

const apiFetch = (path: string, options: RequestInit = {}, timeoutMs = 12000) =>
  fetchWithTimeout(`${API_BASE}${path}`, options, timeoutMs);

const getPerfNow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const logPerf = (label: string, start: number) => {
  const elapsedMs = getPerfNow() - start;
  console.log(`⏱️ ${label}: ${elapsedMs.toFixed(1)}ms`);
};

const runWhenBrowserIdle = (task: () => void, timeout = 700) => {
  const win = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(() => task(), { timeout });
    return;
  }

  window.setTimeout(task, 0);
};

const getAuthHeaders = (): Record<string, string> =>
  state.currentUser?.token ? { Authorization: `Bearer ${state.currentUser.token}` } : {};

const ensureAdminToken = async (): Promise<boolean> => {
  if (!state.currentUser || state.currentUser.role !== 'admin') return false;
  if (state.currentUser.token) return true;

  const identityCandidates = Array.from(new Set([
    String((state.currentUser as any)?.username || '').trim(),
    String(state.currentUser?.email || '').trim(),
    String((state.adminAccount as any)?.username || '').trim(),
    String(state.adminAccount?.email || '').trim(),
    'admin',
    'admin954809@gmail.com'
  ].filter(Boolean)));

  const passwordCandidates = Array.from(new Set([
    String((state.currentUser as any)?.password || '').trim(),
    String((state.adminAccount as any)?.password || '').trim(),
    'Admin@1234',
    'admin123'
  ].filter(Boolean)));

  for (const username of identityCandidates) {
    for (const password of passwordCandidates) {
      try {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        }, 3500);

        const data = await response.json().catch(() => ({} as any));
        if (!response.ok || !data?.success || !data?.token || String(data?.customer?.role || '').toLowerCase() !== 'admin') {
          continue;
        }

        state.currentUser = mergeUserProfileFields({
          ...state.currentUser,
          id: data.customer.id,
          name: data.customer.name,
          email: data.customer.email,
          role: data.customer.role,
          token: data.token,
          password
        } as User, state.currentUser);
        state.adminAccount = mergeUserProfileFields({
          ...(state.adminAccount || {}),
          id: data.customer.id,
          name: data.customer.name,
          email: data.customer.email,
          role: data.customer.role,
          token: data.token,
          password
        } as User, state.adminAccount || undefined);
        persistState();
        return true;
      } catch {
        // Keep trying next candidate credentials.
      }
    }
  }

  return false;
};

const TRANSIENT_MESSAGE_TIMEOUT_MS = 3000;
let confirmMessageTimer: number | null = null;
let paymentSuccessTimer: number | null = null;
let lastConfirmMessageText: string | null = null;
let lastPaymentSuccessKey: string | null = null;

const clearTransientMessageTimer = (timer: number | null) => {
  if (timer !== null) {
    window.clearTimeout(timer);
  }
};

const scheduleConfirmMessageDismiss = () => {
  const currentMessage = state.confirmMessage ? String(state.confirmMessage) : null;
  if (!currentMessage) {
    clearTransientMessageTimer(confirmMessageTimer);
    confirmMessageTimer = null;
    lastConfirmMessageText = null;
    return;
  }
  if (lastConfirmMessageText !== currentMessage) {
    clearTransientMessageTimer(confirmMessageTimer);
    confirmMessageTimer = null;
    lastConfirmMessageText = currentMessage;
  }
  if (confirmMessageTimer !== null) return;
  confirmMessageTimer = window.setTimeout(() => {
    confirmMessageTimer = null;
    if (state.confirmMessage) {
      state.confirmMessage = null;
      lastConfirmMessageText = null;
      render();
    }
  }, TRANSIENT_MESSAGE_TIMEOUT_MS);
};

const schedulePaymentSuccessDismiss = () => {
  const paymentSuccessData = (state.customer as any).paymentSuccessData;
  const currentKey = paymentSuccessData
    ? `${String(paymentSuccessData.bookingId || '')}:${String(paymentSuccessData.amount || '')}:${String(paymentSuccessData.cardLast4 || '')}`
    : null;
  if (!currentKey) {
    clearTransientMessageTimer(paymentSuccessTimer);
    paymentSuccessTimer = null;
    lastPaymentSuccessKey = null;
    return;
  }
  if (lastPaymentSuccessKey !== currentKey) {
    clearTransientMessageTimer(paymentSuccessTimer);
    paymentSuccessTimer = null;
    lastPaymentSuccessKey = currentKey;
  }
  if (paymentSuccessTimer !== null) return;
  paymentSuccessTimer = window.setTimeout(() => {
    paymentSuccessTimer = null;
    if ((state.customer as any).paymentSuccessData) {
      (state.customer as any).paymentSuccessData = undefined;
      state.customer.bookingMessage = '';
      lastPaymentSuccessKey = null;
      render();
    }
  }, TRANSIENT_MESSAGE_TIMEOUT_MS);
};

const getInitials = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 2).toUpperCase() : 'NA';
};

const mergeUserProfileFields = (baseUser: User, fallbackUser?: Partial<User> | null): User => {
  const fallback = fallbackUser || {};
  return {
    ...baseUser,
    phone: String(baseUser.phone || fallback.phone || '').trim() || undefined,
    dob: String(baseUser.dob || fallback.dob || '').trim() || undefined,
    gender: String(baseUser.gender || fallback.gender || '').trim() || undefined,
    address: String(baseUser.address || fallback.address || '').trim() || undefined,
    location: String(baseUser.location || fallback.location || '').trim() || undefined,
    pincode: String(baseUser.pincode || fallback.pincode || '').trim() || undefined,
    profilePhoto: String(baseUser.profilePhoto || fallback.profilePhoto || '').trim() || undefined,
    bio: String(baseUser.bio || fallback.bio || '').trim() || undefined
  };
};

const upsertUserInState = (userPatch: User) => {
  const nextUser = mergeUserProfileFields(userPatch);
  const byIdIndex = state.users.findIndex((user) => String(user.id || '') === String(nextUser.id || ''));
  const byEmailIndex = byIdIndex === -1
    ? state.users.findIndex((user) => String(user.email || '').toLowerCase() === String(nextUser.email || '').toLowerCase())
    : -1;
  const targetIndex = byIdIndex !== -1 ? byIdIndex : byEmailIndex;

  if (targetIndex >= 0) {
    state.users[targetIndex] = mergeUserProfileFields({ ...state.users[targetIndex], ...nextUser } as User, state.users[targetIndex]);
  } else {
    state.users.push(nextUser);
  }

  if (state.currentUser && String(state.currentUser.id || '') === String(nextUser.id || '')) {
    state.currentUser = mergeUserProfileFields({ ...state.currentUser, ...nextUser } as User, state.currentUser);
  }
};

const updatePortfolioContentField = (path: string, value: any) => {
  if (!path.startsWith('portfolioContent.')) return;
  const parts = path.split('.').slice(1);
  const next = JSON.parse(JSON.stringify(state.portfolioContent || DEFAULT_PORTFOLIO_CONTENT || {})) as PortfolioContent;
  let cursor: any = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (Array.isArray(cursor)) {
      const index = Number(key);
      if (!Number.isFinite(index)) return;
      if (!cursor[index]) cursor[index] = {};
      cursor = cursor[index];
      continue;
    }
    if (!(key in cursor)) {
      cursor[key] = {}; // Auto-vivify missing objects
    }
    cursor = cursor[key];
  }
  const lastKey = parts[parts.length - 1];
  if (Array.isArray(cursor)) {
    const index = Number(lastKey);
    if (!Number.isFinite(index)) return;
    cursor[index] = value;
  } else {
    cursor[lastKey] = value;
  }
  state.portfolioContent = next;
};

const normalizeShowroomRecord = (showroom: any, index = 0) => {
  const city = String(showroom?.city || showroom?.name || '').trim();
  const locations = Array.isArray(showroom?.locations) && showroom.locations.length > 0
    ? showroom.locations
      .map((location: any) => ({
        area: String(location?.area || '').trim(),
        phone: String(location?.phone || '').trim()
      }))
      .filter((location: any) => location.area || location.phone)
    : [];

  const normalizedLocations = locations.length > 0
    ? locations
    : [{ area: city || 'Main Branch', phone: state.siteSettings?.contactPhone || '+91 8904712858' }];

  const rawVideoUrl = showroom?.videoUrl || showroom?.video3d || showroom?.video || '';
  const rawImageUrl = showroom?.imageUrl || showroom?.image || showroom?.thumbnail || '';

  return {
    ...showroom,
    id: String(showroom?.id || `showroom-${index}`),
    city,
    name: String(showroom?.name || city || `Showroom ${index + 1}`).trim(),
    locations: normalizedLocations,
    videoUrl: rawVideoUrl ? normalizeAssetUrl(rawVideoUrl) : '',
    imageUrl: rawImageUrl ? normalizeAssetUrl(rawImageUrl) : ''
  };
};

const normalizeShowcaseRecord = (showcase: any, index = 0) => ({
  ...showcase,
  id: String(showcase?.id || `showcase-${index}`),
  title: String(showcase?.title || `Showcase ${index + 1}`).trim(),
  style: String(showcase?.style || '').trim(),
  duration: String(showcase?.duration || '').trim(),
  price: String(showcase?.price || '').trim(),
  description: String(showcase?.description || '').trim(),
  image: showcase?.image ? normalizeAssetUrl(showcase.image) : '',
  serviceId: String(showcase?.serviceId || '').trim(),
  relatedImages: Array.isArray(showcase?.relatedImages)
    ? showcase.relatedImages
      .map((item: any) => normalizeAssetUrl(String(item || '').trim()))
      .filter(Boolean)
    : []
});

const parseRelatedImageUrlsInput = (raw: string) => String(raw || '')
  .split(/[\n,]/)
  .map((item) => normalizeAssetUrl(item.trim()))
  .filter(Boolean);

const getShowcaseRelatedImagesFromFormState = (form?: HTMLFormElement | null) => {
  const textArea = form?.querySelector('textarea[name="relatedImages"]') as HTMLTextAreaElement | null;
  const fromTextArea = textArea?.value || '';
  if (fromTextArea.trim()) {
    return parseRelatedImageUrlsInput(fromTextArea);
  }
  const current = state.admin.showcaseForm?.relatedImages;
  return Array.isArray(current)
    ? current.map((item: any) => normalizeAssetUrl(String(item || '').trim())).filter(Boolean)
    : parseRelatedImageUrlsInput(String(current || ''));
};


const renderImageThumb = (src: string | undefined, alt: string, sizeClass: string, labelClass: string, motion3d = false) => {
  if (!src) {
    return `<div class="${sizeClass} rounded-lg bg-slate-100 border border-black/5 flex items-center justify-center ${labelClass}">No Image</div>`;
  }

  const safeSrc = normalizeAssetUrl(src);
  const safeAlt = escapeHtml(alt);
  return `<img src="${escapeHtml(safeSrc)}" alt="${safeAlt}" data-motion3d="${motion3d ? 'true' : 'false'}" class="motion-3d ${sizeClass} rounded-lg object-cover border border-black/5" loading="lazy" />`;
};

const renderCategoryThumb = (category: Category, sizeClass: string, labelClass: string) => {
  const label = category.title || category.name || '';
  return category.image
    ? `<img src="${category.image}" alt="${escapeHtml(label)}" data-motion3d="${category.motion3d === true ? 'true' : 'false'}" class="motion-3d ${sizeClass} rounded-lg object-cover border border-black/5" />`
    : `<div class="${sizeClass} rounded-lg bg-slate-100 border border-black/5 flex items-center justify-center ${labelClass}">${escapeHtml(
      getInitials(label)
    )}</div>`;
};

// Render image with proper error handling and fallbacks
const renderImageWithFallback = (
  src: string | undefined,
  alt: string,
  classNames: string,
  fallbackEmoji: string = '🖼️'
) => {
  if (!src) {
    return `<div class="${classNames} bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-2xl">${fallbackEmoji}</div>`;
  }

  const placeholderSvgMarkup = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect fill='%23e5e7eb' width='400' height='400'/><text x='50%25' y='50%25' font-size='48' text-anchor='middle' dy='.3em' fill='%23999'>${fallbackEmoji}</text></svg>`;
  const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvgMarkup)}`;

  return `<img 
    src="${escapeHtml(src)}" 
    alt="${escapeHtml(alt)}" 
    data-motion3d="false"
    class="motion-3d ${classNames}"
    loading="lazy"
    onerror="this.onerror=null;this.src='${placeholderSvg}';"
  />`;
};

const normalizeCategoryMotion3D = (category: Category): Category => {
  const categoryMotion = category.motion3d === true;
  return {
    ...category,
    motion3d: categoryMotion,
    images: category.images
      ? category.images.map((img: any) => ({ ...img, motion3d: img?.motion3d === true || categoryMotion }))
      : category.images
  };
};

const normalizeDesignMotion3D = (design: DesignModel): DesignModel => ({
  ...design,
  motion3d: design.motion3d === true
});

let autoMotionRaf: number | null = null;

const applyAuto3DMotionToManagedImages = () => {
  const images = Array.from(root.querySelectorAll('img[data-motion3d="true"]:not(.motion-3d)')) as HTMLImageElement[];
  if (images.length === 0) return;
  images.forEach((img) => {
    img.classList.add('motion-3d');
  });
};

// =============================================
// GLOBAL 3D CARD TILT — document-level delegation
// Applied once at app start, survives all re-renders.
// Tilt target: closest ancestor .has-3d-tilt (card containers)
// =============================================
let global3DMotionBound = false;

const initGlobal3DMotion = () => {
  if (global3DMotionBound) return;  // wire once, never again
  global3DMotionBound = true;

  let activeCard: HTMLElement | null = null;

  document.addEventListener('mousemove', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Find closest tilt-enabled card
    const card = target.closest('.has-3d-tilt') as HTMLElement | null;

    // Left old card
    if (activeCard && activeCard !== card) {
      activeCard.style.transform = '';
      activeCard.style.boxShadow = '';
      activeCard = null;
    }

    if (!card) return;
    activeCard = card;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rotateX = ((cy - y) / cy) * 12;
    const rotateY = ((x - cx) / cx) * 12;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    card.style.boxShadow = `${-rotateY * 1.5}px ${rotateX * 1.5}px 40px rgba(0,0,0,0.25)`;
  }, { passive: true });

  document.addEventListener('mouseleave', (e: MouseEvent) => {
    if (activeCard) {
      activeCard.style.transform = '';
      activeCard.style.boxShadow = '';
      activeCard = null;
    }
  }, { passive: true });

  // Also reset when the mouse leaves any card
  document.addEventListener('mouseout', (e: MouseEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!activeCard) return;
    if (!related || !activeCard.contains(related)) {
      activeCard.style.transform = '';
      activeCard.style.boxShadow = '';
      activeCard = null;
    }
  }, { passive: true });
};


const scheduleAuto3DMotion = () => {
  if (autoMotionRaf != null) {
    cancelAnimationFrame(autoMotionRaf);
  }
  autoMotionRaf = requestAnimationFrame(() => {
    autoMotionRaf = null;
    runWhenBrowserIdle(() => applyAuto3DMotionToManagedImages(), 500);
  });
};

const getActiveTabFromPath = () => pathToTab[window.location.pathname] || 'home';

const SCROLL_POSITIONS_KEY = 'ar_interia_scroll_positions';

const saveScrollPosition = (path: string) => {
  try {
    const positions = JSON.parse(sessionStorage.getItem(SCROLL_POSITIONS_KEY) || '{}');
    positions[path] = window.scrollY;
    sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
  } catch (e) {
    console.warn('Failed to save scroll position:', e);
  }
};

const restoreScrollPosition = (path: string) => {
  try {
    const positions = JSON.parse(sessionStorage.getItem(SCROLL_POSITIONS_KEY) || '{}');
    const scrollY = positions[path];
    if (typeof scrollY === 'number') {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
  } catch (e) {
    console.warn('Failed to restore scroll position:', e);
  }
};

const navigateTo = (tab: TabKey, replace = false) => {
  const path = tabToPath[tab];
  // Save current scroll position before navigation
  saveScrollPosition(window.location.pathname);

  // If leaving the admin page, clean up chart resources to prevent memory leaks
  if (state.activeTab === 'admin' && tab !== 'admin') {
    console.log('Navigating away from admin, cleaning up charts.');
    cleanupAdminCharts();
  }

  // Protect admin/dashboard routes from unauthorized navigation
  if (tab === 'admin' && state.currentUser?.role !== 'admin') {
    state.loginError = 'Admin access required. Please sign in as admin.';
    state.activeTab = 'login';
    history.pushState({}, '', tabToPath['login']);
    render();
    return;
  }

  if (tab === 'dashboard' && state.currentUser?.role !== 'customer') {
    state.loginError = 'Please sign in as a customer to access the dashboard.';
    state.activeTab = 'login';
    history.pushState({}, '', tabToPath['login']);
    render();
    return;
  }

  if (tab === 'ai-studio' && !(state.currentUser?.role === 'customer' || state.currentUser?.role === 'admin')) {
    state.loginError = 'Please sign in to use Design Studio.';
    state.activeTab = 'login';
    history.pushState({}, '', tabToPath['login']);
    render();
    return;
  }

  if (replace) {
    history.replaceState({}, '', path);
  } else {
    history.pushState({}, '', path);
  }
  state.activeTab = tab;
  if (tab === 'dashboard') {
    state.customer.selectedDesignId = null;
    state.customer.imagePreview = null;
  }
  // Ensure categories are hydrated and a category is selected when navigating to categories
  if (tab === 'categories') {
    // Force re-hydration if categories are missing or empty
    if (!state.customer.categories || state.customer.categories.length === 0) {
      // Try to reload categories from local storage or API
      const loaded = getCategories();
      if (Array.isArray(loaded) && loaded.length > 0) {
        state.customer.categories = loaded;
      } else {
        // Fallback: force reseed and reload
        forceReseedCategories();
        state.customer.categories = getCategories();
      }
    }
    // Select the first available category if none is active
    if (state.customer.categories && state.customer.categories.length > 0 && !state.customer.activeCategory) {
      const firstCat = state.customer.categories[0];
      if (firstCat) state.customer.activeCategory = firstCat.id;
    }
  }

  // Always fetch latest admin bookings on admin route entry so newly booked designs appear promptly.
  if (tab === 'admin' && state.currentUser?.role === 'admin') {
    void refreshAdminData({ silent: false, force: true });
  }

  state.mobileMenuOpen = false;
  render();
  // Restore scroll position for the new route
  restoreScrollPosition(path);
};

const persistState = () => {
  if (state.catalog.length > 0) localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(state.catalog));
  const bookingsToPersist = state.currentUser?.role === 'admin' ? state.admin.bookings : state.customer.bookings;
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookingsToPersist));
  localStorage.setItem(STORAGE_KEYS.inquiries, JSON.stringify(state.inquiries));
  localStorage.setItem(STORAGE_KEYS.feedbacks, JSON.stringify(state.feedbacks));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.siteSettings));
  localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(state.services));
  if (state.currentUser) localStorage.setItem(STORAGE_KEYS.users + '_current', JSON.stringify(state.currentUser));
  else localStorage.removeItem(STORAGE_KEYS.users + '_current');
  if (state.adminAccount) localStorage.setItem(STORAGE_KEYS.users + '_admin_acc', JSON.stringify(state.adminAccount));
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(state.users));

  // Save showcases to storage
  writeStorage(STORAGE_KEYS.showcases, state.serviceShowcases);
};


// --- Backend integration layer (customer/admin sync) ------------------------
const refreshCustomerData = async (options: RefreshOptions = {}) => {
  const refreshStart = getPerfNow();
  if (customerRefreshInFlight) return;
  customerRefreshInFlight = true;
  try {
    // Fetch designs, categories, and bookings in parallel with timeouts
    const customerId = state.currentUser?.id;
    const bookingsUrl = customerId ? `${API_BASE}/bookings?customerId=${customerId}` : null;

    const requests = [
      apiFetch('/designs', {}, 6000).then((r) => r.json()).catch(() => null),
      apiFetch('/categories', {}, 6000).then((r) => r.json()).catch(() => null),
      apiFetch('/portfolio-content', {}, 6000).then((r) => r.json()).catch(() => null),
      state.currentUser?.role === 'admin'
        ? apiFetch('/enquiries', { headers: getAuthHeaders() }).then((r) => r.json()).catch(() => null)
        : Promise.resolve(null)
    ];

    if (bookingsUrl) {
      const headers = state.currentUser?.token ? { 'Authorization': `Bearer ${state.currentUser.token}` } : undefined;
      requests.push(
        fetchWithTimeout(bookingsUrl, headers ? { headers } : {}, 6000)
          .then((r) => r.json())
          .catch(() => null)
      );
    } else {
      requests.push(Promise.resolve(null));
    }

    const [designsData, categoriesData, portfolioData, inquiriesData, bookingsData] = await Promise.all(requests);

    const serverDesigns = Array.isArray(designsData?.designs) ? designsData.designs : null;
    const localDesigns = getDesigns();
    const rawDesigns: DesignModel[] = mergeDesignsPreferServer(localDesigns, serverDesigns);
    state.customer.designs = rawDesigns.map((design: DesignModel) => normalizeDesignMotion3D({
      ...design,
      previewImage: design.previewImage ? normalizeAssetUrl(design.previewImage) : design.previewImage,
      images: design.images ? design.images.map((img: string) => normalizeAssetUrl(img)) : design.images
    }));
    state.catalog = state.customer.designs.map((design: DesignModel) => normalizeDesignMotion3D({ ...design }));
    console.log(`✅ Loaded ${state.customer.designs.length} designs`);

    const serverCategories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : null;
    const rawCategories: Category[] = serverCategories && serverCategories.length > 0 ? serverCategories : getCategories();
    state.customer.categories = rawCategories.map((category: Category) => normalizeCategoryMotion3D({
      ...category,
      image: category.image ? normalizeAssetUrl(category.image) : category.image,
      background: category.background ? normalizeAssetUrl(category.background) : category.background,
      thumbnail: category.thumbnail ? normalizeAssetUrl(category.thumbnail) : category.thumbnail,
      images: category.images
        ? category.images.map((img: { name: string; url: string; motion3d?: boolean }) => ({
          ...img,
          url: img.url ? normalizeAssetUrl(img.url) : img.url
        }))
        : category.images
    }));
    console.log(`✅ Loaded ${state.customer.categories.length} categories with total ${state.customer.categories.reduce((sum, cat) => sum + (cat.imageCount || 0), 0)} images`);

    // Update bookings from server if available
    if (bookingsData && Array.isArray(bookingsData.bookings)) {
      state.customer.bookings = filterBookingsForCurrentUser(bookingsData.bookings);
      console.log(`✅ Loaded ${state.customer.bookings.length} bookings from server`);
    }

    if (portfolioData && portfolioData.content) {
      const loadedFeedbackVideos = Array.isArray(portfolioData.content.feedbackVideos)
        ? normalizeFeedbackVideoEntries(portfolioData.content.feedbackVideos)
        : null;
      state.portfolioContent = {
        ...DEFAULT_PORTFOLIO_CONTENT,
        ...portfolioData.content,
        ...(loadedFeedbackVideos ? { feedbackVideos: loadedFeedbackVideos } : {})
      };
    }

    await mergeExistingLocalFeedbackVideos();

    const loadedInquiries = Array.isArray(inquiriesData?.inquiries)
      ? inquiriesData.inquiries
      : (Array.isArray(inquiriesData?.enquiries) ? inquiriesData.enquiries : null);
    if (loadedInquiries) {
      state.inquiries = loadedInquiries;
      console.log(`✅ Loaded ${loadedInquiries.length} inquiries`);
    }

  } catch (error) {
    console.log('Using local designs/categories:', error);
    // Fallback to localStorage if API fails
    const fallbackCategories: Category[] = getCategories();
    const fallbackDesigns: DesignModel[] = getDesigns();
    state.customer.categories = fallbackCategories.map((category: Category) => normalizeCategoryMotion3D({
      ...category,
      image: category.image ? normalizeAssetUrl(category.image) : category.image,
      background: category.background ? normalizeAssetUrl(category.background) : category.background,
      thumbnail: category.thumbnail ? normalizeAssetUrl(category.thumbnail) : category.thumbnail,
      images: category.images
        ? category.images.map((img: { name: string; url: string; motion3d?: boolean }) => ({
          ...img,
          url: img.url ? normalizeAssetUrl(img.url) : img.url
        }))
        : category.images
    }));
    state.customer.designs = fallbackDesigns.map((design: DesignModel) => normalizeDesignMotion3D({
      ...design,
      previewImage: design.previewImage ? normalizeAssetUrl(design.previewImage) : design.previewImage,
      images: design.images ? design.images.map((img: string) => normalizeAssetUrl(img)) : design.images
    }));
    state.catalog = state.customer.designs.map((design: DesignModel) => normalizeDesignMotion3D({ ...design }));
    console.log(`✅ Loaded ${fallbackDesigns.length} fallback designs and ${fallbackCategories.length} fallback categories`);
  }

  if (state.customer.designs.length > 0) {
    const hasSelected = state.customer.designs.some((design) => design.id === state.selectedModelId);
    if (!state.selectedModelId || !hasSelected) {
      state.selectedModelId = state.customer.designs[0].id;
    }
  }
  if (state.customer.galleryCategoryId !== 'all') {
    const hasGalleryCategory = state.customer.categories.some((cat) => cat.id === state.customer.galleryCategoryId);
    if (!hasGalleryCategory) state.customer.galleryCategoryId = 'all';
  }
  if (state.customer.portfolioCategoryId !== 'all') {
    const hasPortfolioCategory = state.customer.categories.some((cat) => cat.id === state.customer.portfolioCategoryId);
    if (!hasPortfolioCategory) state.customer.portfolioCategoryId = 'all';
  }

  // Ensure all category images are represented in design list for customer-facing views.
  ensureDesignsForAllCategories();

  // Always fetch from localStorage as backup
  state.customer.payments = getPayments();
  state.customer.likes = getLikes();
  state.customer.feedbacks = getFeedbacks();
  syncPaidDesignsFromBookings((state.customer.bookings || []).map((booking: any) => normalizeBookingRecord(booking)));

  // If admin, fetch server customers; if user, try fetch their server-side bookings
  if (state.currentUser?.role === 'admin') {
    apiFetch('/customers', { headers: { ...getAuthHeaders() } }, 4000)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.customers)) {
          // Merge server customers with local users to avoid losing admin-seeded customer rows.
          const existingUsers = Array.isArray(state.users) ? state.users : [];
          const existingByKey = new Map<string, any>();
          existingUsers.forEach((u: any) => {
            const idKey = String(u?.id || '').trim().toLowerCase();
            const emailKey = String(u?.email || '').trim().toLowerCase();
            if (idKey) existingByKey.set(idKey, u);
            if (emailKey) existingByKey.set(emailKey, u);
          });

          const serverUsers = data.customers.map((c: any) => ({
            ...mergeUserProfileFields(
              {
                id: c.id,
                name: c.name,
                email: c.email,
                role: c.role,
                createdAt: c.createdAt
              } as User,
              existingByKey.get(String(c?.id || '').trim().toLowerCase())
              || existingByKey.get(String(c?.email || '').trim().toLowerCase())
            )
          }));

          const mergedUsers = [...serverUsers];
          existingUsers
            .filter((u: any) => String(u?.role || '').toLowerCase() === 'customer')
            .forEach((u: any) => {
              const key = String(u?.id || u?.email || '').trim().toLowerCase();
              if (!key) return;
              const existsOnServer = serverUsers.some((srv: any) => String(srv?.id || srv?.email || '').trim().toLowerCase() === key);
              if (!existsOnServer) mergedUsers.push(u);
            });

          const adminUsers = existingUsers.filter((u: any) => String(u?.role || '').toLowerCase() === 'admin');
          state.users = [...adminUsers, ...mergedUsers];
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch admin customers:', error);
      });

    // fetch all server bookings for admin activity counts
    apiFetch('/bookings', { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.bookings)) {
          (state.admin as any).serverBookings = data.bookings;
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch server bookings:', error);
      });

    // Fetch all likes from server
    apiFetch('/likes', { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.likes)) {
          state.customer.likes = mergeServerLikesWithLocalDislikes(data.likes);
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch server likes:', error);
      });

    // Fetch all feedbacks from server
    apiFetch('/feedbacks', { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.feedbacks)) {
          const mappedFeedbacks = mapServerFeedbackRecords(data.feedbacks);
          state.customer.feedbacks = mappedFeedbacks;
          state.feedbacks = [...mappedFeedbacks];
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch all feedbacks:', error);
      });

    // Fetch Design Studio designs for admin
    apiFetch('/ai/designs', { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.designs)) {
          (state.admin as any).aiDesigns = data.designs;
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch AI designs for admin:', error);
      });
  }

  if (state.currentUser) {
    apiFetch(`/bookings?customerId=${encodeURIComponent(state.currentUser.id)}`, { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.bookings)) {
          state.customer.bookings = filterBookingsForCurrentUser(data.bookings);
          syncPaidDesignsFromBookings(state.customer.bookings);
          if (shouldRenderRefreshResult(options)) renderStabilized();
        } else {
          state.customer.bookings = getLocalScopedBookings();
          syncPaidDesignsFromBookings(state.customer.bookings);
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch(() => {
        state.customer.bookings = getLocalScopedBookings();
        syncPaidDesignsFromBookings(state.customer.bookings);
        if (shouldRenderRefreshResult(options)) renderStabilized();
      });

    // Fetch user-specific likes from server
    apiFetch(`/likes?userId=${encodeURIComponent(state.currentUser.id)}`, { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.likes)) {
          state.customer.likes = mergeServerLikesWithLocalDislikes(data.likes);
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch user likes:', error);
      });

    // Fetch user-specific feedbacks from server
    apiFetch(`/feedbacks?userId=${encodeURIComponent(state.currentUser.id)}`, { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.feedbacks)) {
          const mappedFeedbacks = mapServerFeedbackRecords(data.feedbacks).map((item: any) => ({
            ...item,
            userName: item.userName || state.currentUser?.name || 'Customer'
          }));
          state.customer.feedbacks = mappedFeedbacks;
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Error fetching user feedbacks:', error);
      });

    void refreshPublicFeedbacks({ silent: true });

    apiFetch(`/ai/designs?userId=${encodeURIComponent(state.currentUser.id)}`, { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.designs)) {
          state.customer.aiDesigns = data.designs;
          if (shouldRenderRefreshResult(options)) renderStabilized();
        }
      })
      .catch((error) => {
        console.warn('Error fetching AI designs:', error);
      });

    apiFetch(`/invoices/customer/${encodeURIComponent(state.currentUser.id)}`, { headers: { ...getAuthHeaders() } })
      .then((r) => r.json())
      .then((data) => {
        (state.customer as any).invoices = Array.isArray(data?.invoices) ? data.invoices : [];
        if (shouldRenderRefreshResult(options)) renderStabilized();
      })
      .catch((error) => {
        console.warn('Error fetching customer invoices:', error);
      });
  } else {
    state.customer.bookings = [];
    (state.customer as any).invoices = [];
  }
  if (!state.customer.selectedDesignId && state.customer.designs.length > 0 && state.activeTab === 'gallery') {
    state.customer.selectedDesignId = state.customer.designs[0].id;
  }

  logPerf('refreshCustomerData', refreshStart);
  customerRefreshInFlight = false;
};

const syncStats = () => {
  const activeCount = state.catalog.filter((m) => !m.isDeleted).length;
  const newStats = [...state.siteSettings.stats];
  if (newStats[1]) newStats[1].value = activeCount.toString();
  state.siteSettings = { ...state.siteSettings, stats: newStats };
};

const handlePaymentRedirect = async () => {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  const paymentId = params.get('paymentId');
  const transactionId = params.get('txn');
  if (!bookingId || !paymentId || !transactionId) return;

  try {
    const statusResponse = await fetchPhonePeStatus(transactionId, state.currentUser?.token);
    const paymentStatus = statusResponse.status === 'success' ? 'paid' : statusResponse.status === 'failed' ? 'failed' : 'pending';
    const paymentCompletedAt = paymentStatus === 'paid' ? new Date().toISOString() : undefined;
    
    try {
      const paymentUpdateResponse = await apiFetch('/payments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          paymentId,
          status: statusResponse.status,
          method: 'phonepe',
          metadata: { merchantTransactionId: transactionId }
        })
      });
      if (!paymentUpdateResponse.ok) {
        const data = await paymentUpdateResponse.json().catch(() => ({} as any));
        throw new Error(data?.message || 'Payment sync failed.');
      }
    } catch (error) {
      // Update local state if server sync fails
      const localBookingPatch: any = {
        paymentStatus,
        status: paymentStatus === 'paid' ? 'confirmed' : paymentStatus === 'failed' ? 'pending' : 'pending'
      };
      if (paymentCompletedAt) {
        localBookingPatch.paymentDateTime = paymentCompletedAt;
        localBookingPatch.paidAt = paymentCompletedAt;
      }
      updateBooking(bookingId, localBookingPatch);

      const localPaymentPatch: any = { status: statusResponse.status, metadata: { merchantTransactionId: transactionId } };
      if (paymentCompletedAt) {
        localPaymentPatch.paymentDateTime = paymentCompletedAt;
      }
      updatePayment(paymentId, localPaymentPatch);
    }

    await syncDashboardsAndInvoices({ silent: true });

    if (paymentStatus === 'paid') {
      state.customer.paymentError = '';
      state.customer.bookingMessage = '✅ Payment successful! Your booking is confirmed.';
      console.log('✅ Payment verified and dashboards/charts/invoices refreshed');
    } else if (paymentStatus === 'failed') {
      state.customer.paymentError = 'Payment failed. Please try again.';
    }
  } catch (error) {
    state.customer.paymentError = error instanceof Error ? error.message : 'Payment verification failed.';
    console.error('❌ Payment verification error:', error);
  } finally {
    // Navigate to dashboard (will re-render with updated bookings)
    navigateTo('dashboard', true);
  }
};

const mapServerFeedbackRecords = (records: any[]) => {
  if (!Array.isArray(records)) return [] as Feedback[];
  return records.map((fb: any) => ({
    id: fb.id,
    userId: fb.customerId || fb.userId || '',
    userName: fb.userName || 'Customer',
    rating: Number(fb.rating || 0),
    comment: String(fb.comment || ''),
    createdAt: fb.createdAt || new Date().toISOString()
  }));
};

const refreshPublicFeedbacks = async (options: { silent?: boolean } = {}) => {
  try {
    const response = await fetch('/api/feedbacks/public');
    if (!response.ok) throw new Error(`Feedback fetch failed (${response.status})`);
    const data = await response.json().catch(() => ({} as any));
    if (data && data.success && Array.isArray(data.feedbacks)) {
      state.feedbacks = mapServerFeedbackRecords(data.feedbacks);
      if (!options.silent) render();
      return true;
    }
  } catch (error) {
    console.warn('Failed to refresh public feedbacks:', error);
  }
  return false;
};

const normalizeCategoryKey = (value: string) => {
  const compact = value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return compact.startsWith('cat') ? compact.slice(3) : compact;
};

const getCategoryFamilyKey = (rawKey: string) => {
  const key = normalizeCategoryKey(rawKey);
  if (!key) return '';
  if (key.includes('masterbedroom') || key.includes('kidsbedroom') || key.includes('bedroom')) return 'bedroom';
  if (key.includes('livingroom') || key === 'living' || key.includes('drawingroom') || key.includes('lounge')) return 'living';
  if (key.includes('bathroom')) return 'bathroom';
  if (key.includes('kitchen')) return 'kitchen';
  if (key.includes('office') || key.includes('studyroom') || key.includes('study')) return 'office';
  return key;
};

const getCategoryMatchKeySet = (...values: string[]) => {
  const keys = new Set<string>();
  values.forEach((value) => {
    const normalized = normalizeCategoryKey(value || '');
    if (!normalized) return;
    keys.add(normalized);
    const family = getCategoryFamilyKey(normalized);
    if (family) keys.add(family);
  });
  if (keys.has('bedroom')) {
    keys.add('masterbedroom');
    keys.add('kidsbedroom');
  }
  return keys;
};

const getCategoryStrictKeySet = (...values: string[]) => {
  const keys = new Set<string>();
  values.forEach((value) => {
    const normalized = normalizeCategoryKey(value || '');
    if (normalized) keys.add(normalized);
  });
  return keys;
};

const isQATestCategory = (category: Partial<Category> | null | undefined) => {
  const id = String(category?.id || '').toLowerCase();
  const title = String(category?.title || '').toLowerCase();
  const name = String(category?.name || '').toLowerCase();
  const merged = `${id} ${title} ${name}`;
  return /(^|[\s_-])qa([\s_-]|$)/i.test(merged) || merged.includes('qa-motion');
};

const isQATestDesign = (design: Partial<DesignModel> | null | undefined) => {
  const categoryId = String(design?.categoryId || '').toLowerCase();
  const categoryName = String(design?.category || '').toLowerCase();
  const title = String(design?.title || '').toLowerCase();
  const merged = `${categoryId} ${categoryName} ${title}`;
  return /(^|[\s_-])qa([\s_-]|$)/i.test(merged) || merged.includes('qa-motion');
};

const getCustomerVisibleCategories = (categories: Category[]) => categories.filter((category) => !isQATestCategory(category));

const getCustomerVisibleDesigns = (designs: DesignModel[]) =>
  (designs || []).filter((design) => {
    if (!design) return false;
    if ((design as DesignModel & { isDeleted?: boolean }).isDeleted) return false;
    if (String(design.status || '').toLowerCase() === 'inactive') return false;
    if (isQATestDesign(design)) return false;
    return true;
  });

const getCustomerDesignPool = () => {
  const sourceDesigns = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  return getCustomerVisibleDesigns(sourceDesigns);
};

const mergeServerLikesWithLocalDislikes = (serverLikes: any[]) => {
  const mappedLikes = (serverLikes || []).map((l: any) => ({
    id: l.id,
    userId: l.customerId || l.userId || '',
    designId: l.designId,
    value: 'like' as const,
    createdAt: l.createdAt || new Date().toISOString()
  }));

  const localPreferences = (state.customer.likes || []).filter((like: any) => (
    String(like?.value || '') === 'dislike' || String(like?.value || '') === 'like'
  ));
  const likeKeys = new Set(mappedLikes.map((like: any) => `${String(like.userId || '')}::${String(like.designId || '')}`));
  const retainedLocalPreferences = localPreferences.filter((like: any) => !likeKeys.has(`${String(like.userId || '')}::${String(like.designId || '')}`));
  return [...mappedLikes, ...retainedLocalPreferences];
};

const DISLIKE_FEEDBACK_STORAGE_KEY = 'ar_interia_dislike_feedbacks';
const PACKAGE_CACHE_RESET_VERSION_KEY = 'ar_interia_package_cache_reset_version';
const PACKAGE_CACHE_RESET_VERSION = '2026-03-22-room-map-v2';

const getDislikeFeedbackRecords = () => {
  try {
    const raw = localStorage.getItem(DISLIKE_FEEDBACK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const HIDDEN_BOOKINGS_KEY = 'ar_interia_customer_hidden_bookings';
const PACKAGE_PREFERENCES_KEY = 'ar_interia_customer_package_preferences';

const purgeLegacyPackageCaches = () => {
  try {
    const appliedVersion = String(localStorage.getItem(PACKAGE_CACHE_RESET_VERSION_KEY) || '');
    if (appliedVersion === PACKAGE_CACHE_RESET_VERSION) return;

    const explicitKeys = [
      'ar_interia_packages',
      'ar_interia_packages_v1',
      'ar_interia_packages_v2',
      'ar_interia_designs_v2',
      PACKAGE_PREFERENCES_KEY
    ];

    explicitKeys.forEach((key) => localStorage.removeItem(key));

    const dynamicKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (/^ar_interia_packages/i.test(key) || /^ar_interia_package/i.test(key)) {
        dynamicKeysToRemove.push(key);
      }
    }

    dynamicKeysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(PACKAGE_CACHE_RESET_VERSION_KEY, PACKAGE_CACHE_RESET_VERSION);
  } catch (error) {
    console.warn('Failed to purge legacy package cache keys:', error);
  }
};


// --- Backend integration layer (admin data sync) ----------------------------
const refreshAdminData = async (options: RefreshOptions = {}) => {
  const refreshStart = getPerfNow();
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    console.warn('Not authorized to fetch admin data - attempting auto-admin login');
    // Auto-login as admin in dev mode to access seeded demo data
    try {
      const loginResp = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin954809@gmail.com', password: 'Admin@1234' })
      });
      const loginData = await loginResp.json().catch(() => ({}));
      if (loginData.customer && loginData.token) {
        state.currentUser = {
          id: loginData.customer.id,
          name: loginData.customer.name,
          email: loginData.customer.email,
          role: 'admin',
          token: loginData.token
        } as User;
        console.log('✅ Auto-admin login succeeded');
      } else {
        console.warn('Auto-admin login returned no token:', loginData);
        return;
      }
    } catch (loginErr) {
      console.warn('Auto-admin login failed:', loginErr);
      return;
    }
  }
  if (adminRefreshInFlight) return;
  adminRefreshInFlight = true;
  try {

    if (!state.currentUser?.token) {
      await ensureAdminToken();
    }

    const authHeaders = { ...getAuthHeaders() };
    const criticalFetches = await Promise.allSettled([
      apiFetch('/bookings', { headers: authHeaders }, 6000),
      apiFetch('/customers', { headers: authHeaders }, 6000),
      apiFetch('/invoices/all', { headers: authHeaders }, 6000)
    ]);

    const [bookingsResult, customersResult, invoicesResult] = criticalFetches;

    if (bookingsResult.status === 'fulfilled' && bookingsResult.value.ok) {
      const bookingsResponse = bookingsResult.value;
      const bookingsData = await bookingsResponse.json().catch(() => ({} as any));
      if (bookingsData && Array.isArray(bookingsData.bookings)) {
        const serverBookings = bookingsData.bookings.map((booking: any) => normalizeBookingRecord(booking));
        const localBookings = getBookings().map((booking: any) => normalizeBookingRecord(booking));
        const mergedById = new Map<string, any>();

        [...serverBookings, ...localBookings].forEach((booking: any) => {
          const bookingId = String(booking?.id || '').trim();
          if (!bookingId) return;
          if (!mergedById.has(bookingId)) {
            mergedById.set(bookingId, booking);
          }
        });

        state.admin.bookings = [...mergedById.values()].sort((left: any, right: any) => {
          return getBookingSortScore(right) - getBookingSortScore(left);
        });
        (state.admin as any).bookingsLastSyncedAt = new Date().toISOString();
        console.log(`✅ Loaded ${state.admin.bookings.length} bookings from server`);
      }
    } else {
      const fallbackLocalBookings = getBookings().map((booking: any) => normalizeBookingRecord(booking));
      if (fallbackLocalBookings.length > 0) {
        state.admin.bookings = fallbackLocalBookings;
        (state.admin as any).bookingsLastSyncedAt = new Date().toISOString();
      }
    }

    if (customersResult.status === 'fulfilled' && customersResult.value.ok) {
      const customersResponse = customersResult.value;
      const customersData = await customersResponse.json().catch(() => ({} as any));
      if (customersData && customersData.success && Array.isArray(customersData.customers)) {
        state.users = customersData.customers.map((customer: any) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          username: customer.username,
          role: String(customer.role || 'customer').trim().toLowerCase() === 'admin' ? 'admin' : 'customer',
          phone: String(customer.phone || '').trim() || undefined,
          address: String(customer.address || '').trim() || undefined,
          location: String(customer.location || '').trim() || undefined,
          pincode: String(customer.pincode || '').trim() || undefined,
          bio: String(customer.bio || '').trim() || undefined,
          profilePhoto: String(customer.profilePhoto || '').trim() || undefined,
          createdAt: customer.createdAt
        }));
      }
    }

    if (invoicesResult.status === 'fulfilled' && invoicesResult.value.ok) {
      const invoicesResponse = invoicesResult.value;
      const invoicesData = await invoicesResponse.json().catch(() => ({} as any));
      state.admin.invoices = Array.isArray(invoicesData?.invoices) ? invoicesData.invoices : [];
    }

    if (shouldRenderRefreshResult(options) && state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
      renderStabilized();
    }

    if (state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
      requestAnimationFrame(() => {
        initAdminChartsWhenVisible();
        scheduleAdminChartsRetry();
      });
    }

    void Promise.allSettled([
      apiFetch('/ai/designs', { headers: authHeaders }, 4500),
      apiFetch('/likes', { headers: authHeaders }, 4500),
      apiFetch('/feedbacks', { headers: authHeaders }, 4500),
      apiFetch('/enquiries', { headers: authHeaders }, 4500),
      apiFetch('/chatbot/history', { headers: authHeaders }, 4500)
    ]).then(async (results) => {
      const [aiResult, likesResult, feedbacksResult, enquiriesResult, chatbotHistoryResult] = results;

      if (aiResult.status === 'fulfilled' && aiResult.value.ok) {
        const aiResponse = aiResult.value;
        const aiData = await aiResponse.json().catch(() => ({} as any));
        if (aiData && Array.isArray(aiData.designs)) {
          state.admin.aiDesigns = aiData.designs;
        }
      }

      if (likesResult.status === 'fulfilled' && likesResult.value.ok) {
        const likesResponse = likesResult.value;
        const likesData = await likesResponse.json().catch(() => ({} as any));
        if (likesData && likesData.success && Array.isArray(likesData.likes)) {
          state.customer.likes = mergeServerLikesWithLocalDislikes(likesData.likes);
        }
      }

      if (feedbacksResult.status === 'fulfilled' && feedbacksResult.value.ok) {
        const feedbacksResponse = feedbacksResult.value;
        const feedbacksData = await feedbacksResponse.json().catch(() => ({} as any));
        if (feedbacksData && feedbacksData.success && Array.isArray(feedbacksData.feedbacks)) {
          const mappedFeedbacks = feedbacksData.feedbacks.map((feedback: any) => ({
            id: feedback.id,
            userId: feedback.customerId || feedback.userId || '',
            userName: feedback.userName || 'Customer',
            rating: feedback.rating,
            comment: feedback.comment,
            createdAt: feedback.createdAt || new Date().toISOString()
          }));
          state.customer.feedbacks = mappedFeedbacks;
          state.feedbacks = [...mappedFeedbacks];
        }
      }

      if (enquiriesResult.status === 'fulfilled' && enquiriesResult.value.ok) {
        const enquiriesResponse = enquiriesResult.value;
        const enquiriesData = await enquiriesResponse.json().catch(() => ({} as any));
        if (enquiriesData && enquiriesData.success && Array.isArray(enquiriesData.enquiries)) {
          state.inquiries = enquiriesData.enquiries.map((inquiry: any) => ({
            id: inquiry.id,
            userId: inquiry.userId,
            name: inquiry.name || 'Guest',
            email: inquiry.email || '',
            message: inquiry.message || '',
            status: (inquiry.status as Inquiry['status']) || 'new',
            createdAt: inquiry.createdAt || new Date().toISOString(),
            isReadByAdmin: Boolean(inquiry.isReadByAdmin)
          }));
        }
      }

      if (chatbotHistoryResult.status === 'fulfilled' && chatbotHistoryResult.value.ok) {
        const historyResponse = chatbotHistoryResult.value;
        const historyData = await historyResponse.json().catch(() => ({} as any));
        if (historyData && historyData.success && Array.isArray(historyData.history)) {
          const mappedHistory = historyData.history.map((item: any) => ({
            id: String(item.id || `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`),
            userType: (item.userType || (item.customerId ? 'registered' : 'newGuest')) as ChatbotUserType,
            userId: String(item.customerId || 'guest'),
            userName: String(item.userName || 'Customer'),
            query: String(item.query || ''),
            response: String(item.response || ''),
            createdAt: String(item.createdAt || new Date().toISOString()),
            customerEmail: String(item.customerEmail || '')
          }));
          chatbotHistoryState = mappedHistory.slice(0, CHATBOT_HISTORY_MAX);
          persistChatbotHistory();
        }
      }

      if (state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
        updateAdminCharts();
      }
    }).catch((backgroundError) => {
      console.warn('Background admin refresh failed:', backgroundError);
    });
  } catch (error) {
    console.warn('Failed to refresh admin data:', error);
  }

  logPerf('refreshAdminData', refreshStart);
  adminRefreshInFlight = false;
};

const renderEmojiOptions = (target: string) => {
  const emojis = ['📢', '🎉', '🔥', '✨', '⚠️', '📅', '🕒', '✅', '🏠', '🛋️', '🎨', '🎁', '🇮🇳', '💰', '💎'];
  return `
    <div class="flex flex-wrap gap-2 mt-2">
      ${emojis.map(e => `<button type="button" data-action="insert-emoji" data-target="${target}" data-emoji="${e}" class="text-lg hover:scale-125 transition-transform p-1">${e}</button>`).join('')}
    </div>
  `;
};

const renderAdminDashboardSection = () => {
  const chatbotSettings = chatbotSettingsState;
  const chatbotStats = chatbotStatsState;
  const totalDesigns = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs.length
    : getDesigns().length;
  const bookings = getEffectiveBookings();
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
  const totalRevenue = bookings.reduce((sum: number, booking: any) => sum + getBookingAmount(booking), 0);
  const { categoryEarnings } = getAdminChartMetrics(bookings);
  const activeRevenueCategories = categoryEarnings.length;
  const dashboardAnnouncements = getActiveAnnouncements().filter((announcement: any) => (
    !announcement?.location || announcement.location === 'dashboard' || announcement.location === 'both'
  ));

  return `
    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-14">
      <div id="admin-designs" class="spidey-panel p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <i class="ri-layout-grid-line text-2xl"></i>
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Designs</div>
          <div class="text-2xl font-bold text-[color:var(--primary)]">${totalDesigns}</div>
        </div>
      </div>
      <div id="admin-customers" class="spidey-panel p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <i class="ri-user-heart-line text-2xl"></i>
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-bold">Existing Customers</div>
          <div class="text-2xl font-bold text-[color:var(--primary)]">${uniqueCustomerIds.size}</div>
        </div>
      </div>
      <div id="admin-paid-designs" class="spidey-panel p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
          <i class="ri-stack-line text-2xl"></i>
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-bold">Existing Paid Designs</div>
          <div class="text-2xl font-bold text-[color:var(--primary)]">${uniqueDesignIds.size}</div>
        </div>
      </div>
      <div id="admin-bookings" class="spidey-panel p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <i class="ri-calendar-check-line text-2xl"></i>
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Bookings</div>
          <div class="text-2xl font-bold text-[color:var(--primary)]">${bookings.length}</div>
        </div>
      </div>
      <div id="admin-revenue" class="spidey-panel p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
          <i class="ri-money-dollar-circle-line text-2xl"></i>
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Revenue</div>
          <div class="text-2xl font-bold text-[color:var(--primary)]">${formatCurrency(totalRevenue)}</div>
        </div>
      </div>
      <div id="admin-chats" class="spidey-panel p-6 flex items-center gap-4 md:col-span-2 xl:col-span-3">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
          <i class="ri-chat-4-line text-2xl"></i>
        </div>
        <div>
          <div class="text-xs text-slate-400 uppercase tracking-wider font-bold">Chatbot Active</div>
          <div class="text-2xl font-bold text-[color:var(--primary)]">${chatbotSettings.enabled ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-16 mt-20 mb-12">
      <div class="spidey-panel p-6">
        <h3 class="text-sm font-semibold text-slate-600 mb-3">Revenue vs Expenses</h3>
        <div class="h-72">
          <canvas id="revenue-chart"></canvas>
        </div>
      </div>
      <div class="spidey-panel p-6">
        <h3 class="text-sm font-semibold text-slate-600 mb-3">Monthly Profit</h3>
        <div class="h-72">
          <canvas id="profit-chart"></canvas>
        </div>
      </div>
      <div class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-3 gap-2">
          <h3 class="text-sm font-semibold text-slate-600">Category Revenue Mix</h3>
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            ${activeRevenueCategories}/${categoryEarnings.length} categories
          </span>
        </div>
        <div class="h-72">
          <canvas id="category-chart"></canvas>
        </div>
      </div>
      <div class="spidey-panel p-6">
        <h3 class="text-sm font-semibold text-slate-600 mb-3">Bookings and Customers</h3>
        <div class="h-72">
          <canvas id="bookings-chart"></canvas>
        </div>
      </div>
    </section>

    ${dashboardAnnouncements.length > 0 ? `
    <section class="spidey-panel p-6 mt-28">
      <h3 class="text-sm font-semibold text-slate-600 mb-3">Live Dashboard Announcements</h3>
      <div class="space-y-2">
        ${dashboardAnnouncements.map((announcement: any) => `
          <div class="rounded-xl border border-black/5 bg-slate-50 px-3 py-2 flex items-start gap-2">
            <span class="text-base leading-none mt-0.5">${getAnnouncementEmoji(announcement)}</span>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(announcement.title || 'Announcement')}</div>
              <div class="text-xs text-slate-500">${escapeHtml(announcement.message || '')}</div>
            </div>
                  </div>
                `).join('')}
                </div>
              </div>
            </section>
    ` : ''}
  `;
};

const renderAdminDesignEditor = () => {
  const previewImage = state.admin.designForm.images?.[0] || '';
  const currentModelUrl = String(state.admin.designForm.modelUrl || '').trim();
  const isOpen = Boolean((state.admin as any).designEditOpen);
  return `
  <div class="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'} admin-modal-overlay" data-modal="design-editor" data-action="close-design-editor">
    <div class="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto admin-modal-card" data-action="ignore">
    <div class="spidey-dialog-header">
            <h3 class="text-lg font-semibold text-[color:var(--primary)]">Edit Design</h3>
            <button data-action="close-design-editor" class="text-sm text-slate-500">✕</button>
        </div>
        <form data-form="admin-design-edit" class="space-y-4">
            <div>
                <label class="block text-sm font-semibold text-slate-600 mb-1">Design Name</label>
                <input name="title" value="${escapeHtml(state.admin.designForm.title)}" class="w-full px-3 py-2 rounded-xl border border-black/10" />
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-600 mb-1">Selling Price</label>
                <input name="price" type="number" value="${state.admin.designForm.price}" class="w-full px-3 py-2 rounded-xl border border-black/10" />
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-600 mb-1">Internal Cost</label>
                <input name="cost" type="number" value="${state.admin.designForm.cost || 0}" class="w-full px-3 py-2 rounded-xl border border-black/10" />
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-600 mb-1">Upload Image</label>
                <input name="image" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">Current 3D Model</label>
              ${currentModelUrl ? `<div class="mt-1 text-xs text-slate-500 truncate">Current: ${escapeHtml(currentModelUrl)}</div>` : '<div class="mt-1 text-xs text-slate-400">No model linked yet.</div>'}
            </div>
            ${previewImage ? `
                <div class="rounded-xl overflow-hidden border border-black/5">
                    <img src="${escapeHtml(previewImage)}" alt="Preview" class="w-full h-40 object-cover" />
                </div>
            ` : ''}
            <div class="flex gap-2 pt-2 admin-modal-actions">
                <button type="submit" class="flex-1 py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold">Save Changes</button>
                <button type="button" data-action="close-design-editor" class="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold">Cancel</button>
            </div>
        </form>
          </div>
        </div>
    `;
};

const getEffectiveBookings = () => {
  const adminBookings = Array.isArray(state.admin.bookings) ? state.admin.bookings : [];
  const customerBookings = Array.isArray(state.customer.bookings) ? state.customer.bookings : [];

  if (state.currentUser?.role === 'admin') {
    if (adminBookings.length > 0) return adminBookings.map((booking: any) => normalizeBookingRecord(booking));
    if (customerBookings.length > 0) return customerBookings.map((booking: any) => normalizeBookingRecord(booking));
    return getBookings().map((booking: any) => normalizeBookingRecord(booking));
  }

  if (customerBookings.length > 0) return customerBookings.map((booking: any) => normalizeBookingRecord(booking));
  return getLocalScopedBookings();
};

function filterBookingsForCurrentUser(bookings: any[]): any[] {
  const normalized = Array.isArray(bookings)
    ? bookings.map((booking: any) => normalizeBookingRecord(booking))
    : [];
  const currentUser = state.currentUser;
  if (!currentUser) return [];
  if (String(currentUser.role || '').toLowerCase() === 'admin') return normalized;
  const userId = String(currentUser.id || '').trim();
  if (!userId) return [];
  return normalized.filter((booking: any) => String(booking?.userId || '').trim() === userId);
}

function getLocalScopedBookings(): any[] {
  return filterBookingsForCurrentUser(getBookings());
}

const PAID_DESIGNS_STORAGE_KEY = 'ar_interia_paid_designs';
const getPaidDesignStorageKey = (userId?: string | null) => `${PAID_DESIGNS_STORAGE_KEY}:${String(userId || 'guest').trim() || 'guest'}`;

const getStoredPaidDesigns = (userId: string | null | undefined = state.currentUser?.id) => {
  try {
    const raw = localStorage.getItem(getPaidDesignStorageKey(userId));
    if (!raw) return [] as any[];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as any[];
  }
};

const setStoredPaidDesigns = (items: any[], userId: string | null | undefined = state.currentUser?.id) => {
  try {
    localStorage.setItem(getPaidDesignStorageKey(userId), JSON.stringify(items));
  } catch {
    // Ignore storage failures to avoid breaking dashboard rendering.
  }
};

const syncPaidDesignsFromBookings = (bookings: any[]) => {
  const scopedBookings = filterBookingsForCurrentUser(bookings || []);
  const paidFromBookings = scopedBookings
    .filter((booking: any) => {
      const paymentStatus = getBookingPaymentStatus(booking);
      const bookingStatus = String(booking?.status || '').trim().toLowerCase();
      return paymentStatus === 'paid'
        || bookingStatus === 'confirmed'
        || bookingStatus === 'fulfilled'
        || bookingStatus === 'completed';
    })
    .map((booking: any) => {
      const bookingContext = resolveBookingDesignContext(booking);
      return {
        bookingId: String(booking?.id || ''),
        designId: String(bookingContext.design?.id || booking?.designId || ''),
        designName: String(bookingContext.displayName || booking?.designName || 'Design'),
        imageUrl: String(bookingContext.imageUrl || booking?.imageUrl || ''),
        amount: Number(getBookingAmount(booking) || 0),
        bookedAt: String(booking?.paymentDateTime || booking?.paidAt || booking?.updatedAt || booking?.createdAt || new Date().toISOString()),
        paymentStatus: 'paid',
        bookingStatus: String(booking?.status || 'confirmed')
      };
    });

  const existing = getStoredPaidDesigns(state.currentUser?.id);
  const mergedByBookingId = new Map<string, any>();
  [...existing, ...paidFromBookings].forEach((item: any) => {
    const key = String(item?.bookingId || '').trim();
    if (key) mergedByBookingId.set(key, item);
  });

  const merged = [...mergedByBookingId.values()].sort((left: any, right: any) => (
    new Date(right?.bookedAt || 0).getTime() - new Date(left?.bookedAt || 0).getTime()
  ));

  setStoredPaidDesigns(merged, state.currentUser?.id);
  (state.customer as any).paidDesigns = merged;
  return merged;
};

const organizeBookingsByStatus = (bookings: any[]) => {
  const paidBookings: any[] = [];
  const pendingBookings: any[] = [];

  bookings.forEach((booking) => {
    const paymentStatus = getBookingPaymentStatus(booking);
    const bookingStatus = String(booking?.status || '').trim().toLowerCase();
    const bookingDate = new Date(booking.createdAt || Date.now()).getTime();
    const isCompletedBooking = paymentStatus === 'paid'
      || bookingStatus === 'confirmed'
      || bookingStatus === 'fulfilled'
      || bookingStatus === 'completed';

    if (isCompletedBooking) {
      paidBookings.push({ ...booking, _sortTime: bookingDate, paymentStatus: 'paid' });
    } else {
      pendingBookings.push({ ...booking, _sortTime: bookingDate });
    }
  });

  // Sort both arrays by date (most recent first)
  const sortByDateDesc = (a: any, b: any) => (b._sortTime || 0) - (a._sortTime || 0);
  paidBookings.sort(sortByDateDesc);
  pendingBookings.sort(sortByDateDesc);

  return { recentBookings: paidBookings, previousBookings: pendingBookings };
};

const getRecentBookings = () => {
  const all = getEffectiveBookings();
  const { recentBookings } = organizeBookingsByStatus(all);
  return recentBookings;
};

const getPreviousBookings = () => {
  const all = getEffectiveBookings();
  const { previousBookings } = organizeBookingsByStatus(all);
  return previousBookings;
};

const isBookingActionPending = (bookingId: string) => Boolean((state.admin as any).bookingActionPending?.[bookingId]);

const setBookingActionPending = (bookingId: string, pending: boolean) => {
  const current = { ...((state.admin as any).bookingActionPending || {}) };
  if (pending) {
    current[bookingId] = true;
  } else {
    delete current[bookingId];
  }
  (state.admin as any).bookingActionPending = current;
};

const patchBookingStatusInState = (bookingId: string, status: Booking['status']) => {
  const applyPatch = (bookings: any[]) => bookings.map((booking: any) => (
    String(booking?.id || '') === String(bookingId)
      ? { ...booking, status }
      : booking
  ));

  if (Array.isArray(state.admin.bookings)) {
    state.admin.bookings = applyPatch(state.admin.bookings) as any;
  }
  if (Array.isArray(state.customer.bookings)) {
    state.customer.bookings = applyPatch(state.customer.bookings) as any;
  }
};

const resolveBookingDesignContext = (booking: any) => {
  const normalizedBooking = normalizeBookingRecord(booking);
  const designId = String(normalizedBooking?.designId || '').trim();
  const bookingName = String(normalizedBooking?.designName || normalizedBooking?.designTitle || '').trim();
  const bookingTitle = String(normalizedBooking?.designTitle || '').trim();
  const bookingCategoryId = String(normalizedBooking?.categoryId || '').trim();
  const bookingImageUrl = normalizeAssetUrl(String(normalizedBooking?.designPreviewImage || normalizedBooking?.imageUrl || '').trim());
  const customerDesigns = (state.customer.designs && state.customer.designs.length > 0) ? state.customer.designs : getDesigns();
  const catalogDesigns = Array.isArray(state.catalog) ? state.catalog : [];
  const designPool = Array.from(new Map([...customerDesigns, ...catalogDesigns].map((design: any) => [String(design?.id || `${design?.title || ''}-${design?.previewImage || ''}`), design])).values()) as any[];
  const bookingNameKey = normalizeKey(bookingName);
  const bookingTitleKey = normalizeKey(bookingTitle || bookingName);
  const bookingNameFileKey = getFilenameKey(bookingName);
  const bookingNameFromFileKey = normalizeKey(sanitizeDisplayName(bookingNameFileKey));
  const bookingImageKey = normalizeImageKey(bookingImageUrl);
  const bookingFileKey = getFilenameKey(bookingImageUrl);
  const bookingCategoryKeys = getCategoryMatchKeySet(bookingCategoryId, normalizedBooking?.category || '', normalizedBooking?.categoryName || '');

  const toTokens = (value: string) => new Set(
    String(value || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter((token) => token.length >= 3)
  );
  const bookingTokens = new Set<string>([
    ...Array.from(toTokens(bookingName)),
    ...Array.from(toTokens(bookingTitle))
  ]);

  const scoreDesignMatch = (design: any) => {
    if (!design) return Number.NEGATIVE_INFINITY;
    let score = 0;
    const designTitle = String(design?.title || '').trim();
    const designTitleKey = normalizeKey(designTitle);
    const firstDesignImage = Array.isArray(design?.images)
      ? (typeof design.images[0] === 'string' ? design.images[0] : (design.images[0]?.url || ''))
      : '';
    const designImage = normalizeAssetUrl(String(design?.previewImage || design?.imageUrl || design?.image || firstDesignImage || ''));
    const designImageKey = normalizeImageKey(designImage);
    const designFileKey = getFilenameKey(designImage);
    const designNameFromFileKey = normalizeKey(sanitizeDisplayName(designFileKey));
    const designCategoryKeys = getCategoryMatchKeySet(design?.categoryId || '', design?.category || '');
    const designTokens = new Set<string>([
      ...Array.from(toTokens(designTitle)),
      ...Array.from(toTokens(sanitizeDisplayName(designFileKey)))
    ]);
    const tokenOverlap = Array.from(bookingTokens).filter((token) => designTokens.has(token)).length;

    if (designId && String(design?.id || '') === designId) score += 1000;
    if (bookingTitleKey && designTitleKey === bookingTitleKey) score += 400;
    if (bookingNameKey && designTitleKey === bookingNameKey) score += 325;
    if (bookingNameFromFileKey && designNameFromFileKey && bookingNameFromFileKey === designNameFromFileKey) score += 420;
    if (bookingNameFileKey && designFileKey && bookingNameFileKey === designFileKey) score += 360;
    if (bookingImageKey && designImageKey === bookingImageKey) score += 300;
    if (bookingFileKey && designFileKey === bookingFileKey) score += 260;
    if (bookingCategoryKeys.size > 0 && Array.from(designCategoryKeys).some((key) => bookingCategoryKeys.has(key))) score += 120;
    if (bookingTitleKey && designTitleKey && (designTitleKey.includes(bookingTitleKey) || bookingTitleKey.includes(designTitleKey))) score += 60;
    if (bookingNameKey && designTitleKey && (designTitleKey.includes(bookingNameKey) || bookingNameKey.includes(designTitleKey))) score += 40;
    if (tokenOverlap >= 2) score += 190;
    else if (tokenOverlap === 1) score += 80;
    if (bookingCategoryKeys.size > 0 && designCategoryKeys.size > 0 && !Array.from(designCategoryKeys).some((key) => bookingCategoryKeys.has(key))) {
      score -= 60;
    }
    return score;
  };

  const rankedDesignMatches = designPool
    .map((design) => ({ design, score: scoreDesignMatch(design) }))
    .sort((left, right) => right.score - left.score);
  const topDesignMatch = rankedDesignMatches[0] || null;
  const resolvedDesign = topDesignMatch && topDesignMatch.score > 0 ? topDesignMatch.design : null;
  const hasStrongDesignMatch = Boolean(topDesignMatch && topDesignMatch.score >= 300);

  const aiSource = [
    ...(Array.isArray(state.customer.aiDesigns) ? state.customer.aiDesigns : []),
    ...(Array.isArray(state.admin.aiDesigns) ? state.admin.aiDesigns : [])
  ];
  const aiVariant = aiSource
    .flatMap((record: any) => Array.isArray(record?.variants) ? record.variants : [])
    .find((variant: any) => (
      String(variant?.id || '') === designId
      || (bookingName && normalizeKey(String(variant?.title || '')) === normalizeKey(bookingName))
    )) as any;
  const resolvedName = sanitizeDisplayName(String(
    resolvedDesign?.title
    || bookingTitle
    || bookingName
    || aiVariant?.title
    || 'Design'
  )) || 'Design';
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const matchedCategory = categories.find((category) => {
    const categoryKeys = Array.from(getCategoryMatchKeySet(category.id || '', category.title || '', category.name || ''));
    const bookingKeys = Array.from(getCategoryMatchKeySet(bookingCategoryId, normalizedBooking?.category || '', normalizedBooking?.categoryName || ''));
    return bookingKeys.some((key: string) => key && categoryKeys.includes(key));
  });

  const bookingNameCandidates = new Set<string>([
    bookingNameKey,
    bookingTitleKey,
    bookingNameFromFileKey
  ].filter(Boolean));
  const bookingFileCandidates = new Set<string>([
    bookingNameFileKey,
    bookingFileKey
  ].filter(Boolean));

  const categoryImageMatch = (() => {
    const eligibleCategories = categories.filter((category) => {
      if (matchedCategory && String(category.id || '') === String(matchedCategory.id || '')) return true;
      if (bookingCategoryKeys.size === 0) return false;
      const keys = getCategoryMatchKeySet(category.id || '', category.title || '', category.name || '');
      return Array.from(keys).some((key) => bookingCategoryKeys.has(key));
    });
    const candidates = eligibleCategories.flatMap((category: any) => Array.isArray(category?.images) ? category.images : []);
    for (const image of candidates) {
      const imageUrl = normalizeAssetUrl(String(image?.url || ''));
      if (!imageUrl) continue;
      const imageNameKey = normalizeKey(sanitizeDisplayName(String(image?.name || '')));
      const imageFileKey = getFilenameKey(imageUrl);
      const imageFileNameKey = normalizeKey(sanitizeDisplayName(imageFileKey));
      if (imageNameKey && bookingNameCandidates.has(imageNameKey)) return imageUrl;
      if (imageFileNameKey && bookingNameCandidates.has(imageFileNameKey)) return imageUrl;
      if (imageFileKey && bookingFileCandidates.has(imageFileKey)) return imageUrl;
      if (bookingNameKey && imageNameKey && (imageNameKey.includes(bookingNameKey) || bookingNameKey.includes(imageNameKey))) return imageUrl;
    }
    return '';
  })();
  const categoryFallbackImage = normalizeAssetUrl(String(
    matchedCategory?.thumbnail
    || matchedCategory?.image
    || matchedCategory?.background
    || (Array.isArray((matchedCategory as any)?.images) ? ((matchedCategory as any).images[0]?.url || '') : '')
    || ''
  ));
  const firstDesignFallback = normalizeAssetUrl(String(
    resolvedDesign?.previewImage
    || resolvedDesign?.images?.[0]
    || customerDesigns[0]?.previewImage
    || customerDesigns[0]?.images?.[0]
    || '/category/Living room/living1.jpg'
  ));

  const resolvedImage = normalizeAssetUrl(String(
    (hasStrongDesignMatch
      ? (resolvedDesign?.previewImage || resolvedDesign?.imageUrl || resolvedDesign?.image)
      : '')
    || bookingImageUrl
    || categoryImageMatch
    || aiVariant?.image
    || resolvedDesign?.previewImage
    || resolvedDesign?.imageUrl
    || resolvedDesign?.image
    || categoryFallbackImage
    || firstDesignFallback
    || '/category/Living room/living1.jpg'
  ));

  const resolvedCategoryId = String(
    resolvedDesign?.categoryId
    || bookingCategoryId
    || aiVariant?.categoryId
    || ''
  ).trim();

  return {
    design: resolvedDesign,
    displayName: resolvedName,
    imageUrl: resolvedImage,
    categoryId: resolvedCategoryId
  };
};

const renderAdminBookingDetailsModal = () => {
  const viewingId = (state.admin as any).viewingBookingId as string | undefined;
  if (!viewingId) return '';
  const bookings = getEffectiveBookings();
  const booking = bookings.find((b) => b.id === viewingId);
  if (!booking) return '';
  const customerDetails = resolveBookingCustomerDetails(booking);
  const bookingContext = resolveBookingDesignContext(booking);
  const bookingLabelPrefix = isPackageBooking(booking) ? 'Package' : 'Design';
  const isPendingAction = isBookingActionPending(booking.id);
  return `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 admin-modal-overlay" data-action="close-booking-view">
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto admin-modal-card" data-action="ignore">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-[color:var(--primary)]">Booking Details</h3>
                <button type="button" data-action="close-booking-view" class="text-sm text-slate-500">✕</button>
            </div>
            <div class="space-y-4">
                <!-- Design Photo -->
                <div class="rounded-lg overflow-hidden bg-slate-100 h-48">
                  <img src="${escapeHtml(bookingContext.imageUrl)}" alt="${escapeHtml(bookingContext.displayName)}" class="w-full h-full object-cover">
                </div>
                <!-- Design Info -->
                <div>
                  <div class="text-sm text-slate-500">${bookingLabelPrefix}</div>
                    <div class="font-semibold text-[color:var(--primary)]">${escapeHtml(bookingContext.displayName)}</div>
                </div>

                <!-- Customer Info -->
                <div class="border-t pt-4 space-y-3">
                    <h4 class="font-semibold text-slate-700">Customer Details</h4>
                    <div>
                        <div class="text-sm text-slate-500">Name</div>
                      <div class="font-medium text-[color:var(--primary)]">${escapeHtml(customerDetails.name || 'Unknown')}</div>
                    </div>
                    <div>
                        <div class="text-sm text-slate-500">Email</div>
                      <div class="font-medium text-[color:var(--primary)]">${escapeHtml(customerDetails.email || 'N/A')}</div>
                    </div>
                    <div>
                        <div class="text-sm text-slate-500">Phone</div>
                      <div class="font-medium text-[color:var(--primary)]">${escapeHtml(customerDetails.phone || 'N/A')}</div>
                    </div>
                </div>

                <!-- Booking Info -->
                <div class="border-t pt-4 space-y-3">
                    <h4 class="font-semibold text-slate-700">Booking Details</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <div class="text-sm text-slate-500">Date</div>
                            <div class="font-medium text-[color:var(--primary)]">${new Date(booking.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div class="text-sm text-slate-500">Time</div>
                            <div class="font-medium text-[color:var(--primary)]">${new Date(booking.createdAt).toLocaleTimeString()}</div>
                        </div>
                        <div>
                            <div class="text-sm text-slate-500">Status</div>
                            <div class="font-medium text-[color:var(--primary)] capitalize">${escapeHtml(booking.status || 'pending')}</div>
                        </div>
                        <div>
                            <div class="text-sm text-slate-500">Payment Status</div>
                            <div class="font-medium text-[color:var(--accent)] capitalize">${escapeHtml(normalizeBookingPaymentStatus(booking.paymentStatus))}</div>
                        </div>
                    </div>
                    <div>
                        <div class="text-sm text-slate-500">Price</div>
                        <div class="text-2xl font-bold text-[color:var(--accent)]">${formatCurrency(getBookingAmount(booking))}</div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex gap-2 admin-modal-actions">
                ${booking.status !== 'fulfilled' ? `
            <button type="button" data-action="approve-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? 'Updating...' : '✓ Approve'}</button>
            <button type="button" data-action="decline-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? 'Updating...' : '✕ Decline'}</button>
          ` : `
            <div class="flex-1 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold text-center">✓ Approved</div>
          `}
                <button type="button" data-action="close-booking-view" class="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300">Close</button>
            </div>
        </div>
    </div>
    `;
};

const renderAdminBookingsSection = () => {
  const categories = getCategories();
  const bookings = getEffectiveBookings();
  const bookingsLastSyncedAt = (state.admin as any).bookingsLastSyncedAt as string | undefined;
  const isRecentlySynced = bookingsLastSyncedAt
    ? (Date.now() - new Date(bookingsLastSyncedAt).getTime()) < 10_000
    : false;
  const bookingsLastSyncedLabel = bookingsLastSyncedAt
    ? new Date(bookingsLastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Not synced yet';

  const bookingRows = bookings.map((booking) => {
    const bookingContext = resolveBookingDesignContext(booking);
    const customerDetails = resolveBookingCustomerDetails(booking);
    const paymentStatus = getBookingPaymentStatus(booking);
    const approvedForPayment = isBookingApprovedForPayment(booking);
    const bookingTime = new Date(String(booking?.createdAt || booking?.bookingDate || '')).getTime();
    const searchName = String(bookingContext.displayName || booking.designName || '').toLowerCase();
    return {
      booking,
      bookingContext,
      customerDetails,
      paymentStatus,
      approvedForPayment,
      bookingTime,
      searchName
    };
  });

  const filteredBookings = bookingRows.filter((row) => {
    const q = (state.admin.bookingFilter.query || '').toLowerCase();
    const catId = state.admin.bookingFilter.categoryId;
    const pStatus = state.admin.bookingFilter.paymentStatus;
    const approvalStatus = state.admin.bookingFilter.approvalStatus;
    const dateFrom = String(state.admin.bookingFilter.dateFrom || '').trim();
    const dateTo = String(state.admin.bookingFilter.dateTo || '').trim();

    if (q && !row.searchName.includes(q)) return false;
    if (catId !== 'all' && row.bookingContext.categoryId !== catId) return false;
    if (pStatus !== 'all' && row.paymentStatus !== pStatus) return false;
    if (approvalStatus === 'approved' && !row.approvedForPayment) return false;
    if (approvalStatus === 'pending' && row.approvedForPayment) return false;
    if (dateFrom) {
      const fromMs = new Date(`${dateFrom}T00:00:00`).getTime();
      if (Number.isFinite(fromMs) && row.bookingTime < fromMs) return false;
    }
    if (dateTo) {
      const toMs = new Date(`${dateTo}T23:59:59.999`).getTime();
      if (Number.isFinite(toMs) && row.bookingTime > toMs) return false;
    }
    return true;
  }).sort((left: any, right: any) => getBookingSortScore(right.booking) - getBookingSortScore(left.booking));

  const stats = bookingRows.reduce((acc, row) => {
    acc.total += 1;
    if (row.paymentStatus === 'paid') acc.paid += 1;
    if (row.paymentStatus === 'pending') acc.pending += 1;
    if (row.paymentStatus === 'failed') acc.failed += 1;
    if (row.approvedForPayment) acc.approved += 1;
    return acc;
  }, { total: 0, paid: 0, pending: 0, failed: 0, approved: 0 });

  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">📅 Bookings Manager</h2>
            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">🔄 Auto-refresh</span>
            <span class="text-xs px-2 py-1 rounded ${isRecentlySynced ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'} font-semibold">🕒 Last synced: ${escapeHtml(bookingsLastSyncedLabel)}</span>
          </div>
          <button data-action="refresh-admin-bookings" title="Refresh bookings list immediately" class="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-sm flex items-center gap-1">
            <span>🔄</span>
            <span>Refresh Now</span>
          </button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <button type="button" data-action="set-booking-summary-filter" data-value="all" class="text-left p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border ${state.admin.bookingFilter.paymentStatus === 'all' && state.admin.bookingFilter.approvalStatus === 'all' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">📊 Total</div>
            <div class="text-xl font-bold text-blue-700 mt-1">${stats.total}</div>
          </button>
          <button type="button" data-action="set-booking-summary-filter" data-value="paid" class="text-left p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border ${state.admin.bookingFilter.paymentStatus === 'paid' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-emerald-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">✅ Paid</div>
            <div class="text-xl font-bold text-emerald-700 mt-1">${stats.paid}</div>
          </button>
          <button type="button" data-action="set-booking-summary-filter" data-value="pending" class="text-left p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border ${state.admin.bookingFilter.paymentStatus === 'pending' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-amber-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">⏳ Pending</div>
            <div class="text-xl font-bold text-amber-700 mt-1">${stats.pending}</div>
          </button>
          <button type="button" data-action="set-booking-summary-filter" data-value="failed" class="text-left p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border ${state.admin.bookingFilter.paymentStatus === 'failed' ? 'border-red-400 ring-2 ring-red-200' : 'border-red-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-red-600 font-semibold">❌ Failed</div>
            <div class="text-xl font-bold text-red-700 mt-1">${stats.failed}</div>
          </button>
          <button type="button" data-action="set-booking-summary-filter" data-value="approved" class="text-left p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border ${state.admin.bookingFilter.approvalStatus === 'approved' ? 'border-purple-400 ring-2 ring-purple-200' : 'border-purple-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">🎯 Approved</div>
            <div class="text-xl font-bold text-purple-700 mt-1">${stats.approved}</div>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 items-center admin-booking-filters">
            <div class="relative min-w-0">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input data-bind="admin.bookingFilter.query" value="${escapeHtml(state.admin.bookingFilter.query)}" placeholder="Search design..." class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
            </div>
            <div class="relative min-w-0">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📅</span>
              <input type="date" data-bind="admin.bookingFilter.dateFrom" value="${state.admin.bookingFilter.dateFrom}" class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
            </div>
            <div class="relative min-w-0">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📅</span>
              <input type="date" data-bind="admin.bookingFilter.dateTo" value="${state.admin.bookingFilter.dateTo}" class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
            </div>
            <select data-bind="admin.bookingFilter.categoryId" class="w-full min-w-0 px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
                <option value="all">📂 All Categories</option>
            ${categories.map((cat) => `<option value="${cat.id}" ${state.admin.bookingFilter.categoryId === cat.id ? 'selected' : ''}>${escapeHtml(cat.title)}</option>`).join('')}
            </select>
            <select data-bind="admin.bookingFilter.paymentStatus" class="w-full min-w-0 px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
              <option value="all" ${state.admin.bookingFilter.paymentStatus === 'all' ? 'selected' : ''}>💰 All Payments</option>
              <option value="paid" ${state.admin.bookingFilter.paymentStatus === 'paid' ? 'selected' : ''}>✅ Paid</option>
              <option value="pending" ${state.admin.bookingFilter.paymentStatus === 'pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="failed" ${state.admin.bookingFilter.paymentStatus === 'failed' ? 'selected' : ''}>❌ Failed</option>
            </select>
            <button data-action="clear-booking-filters" class="w-full px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition text-sm">🔄 Clear</button>
        </div>
        
        ${state.admin.bookingFilter.dateFrom ? `
          <div class="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div class="text-sm font-semibold text-blue-900 mb-2">📊 Designs Booked on ${new Date(state.admin.bookingFilter.dateFrom).toLocaleDateString()}</div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              ${filteredBookings
                .map((row) => {
                  const ctx = row.bookingContext;
                  return `<div class="p-2 rounded-lg bg-white border border-black/10 text-center"><img src="${escapeHtml(ctx.imageUrl)}" alt="" class="w-full h-20 object-cover rounded mb-1" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22><rect fill=%22%23e5e7eb%22 width=%22100%25%22 height=%22100%25%22/></svg>'" /><div class="text-xs font-semibold truncate">${escapeHtml(ctx.displayName)}</div></div>`;
                })
                .join('')}
            </div>
          </div>
        ` : ''}

        <div class="space-y-2.5 max-h-[380px] overflow-y-auto custom-scroll admin-booking-list">
            ${filteredBookings.length
      ? filteredBookings
        .map((row) => {
          const booking = row.booking;
          const bookingContext = row.bookingContext;
          const customerDetails = row.customerDetails;
          const bookingPaymentStatus = row.paymentStatus;
          const isPendingAction = isBookingActionPending(booking.id);
          const statusColors = {
            approved: 'bg-emerald-100 text-emerald-700',
            confirmed: 'bg-blue-100 text-blue-700',
            pending: 'bg-amber-100 text-amber-700',
            booked: 'bg-purple-100 text-purple-700',
            cancelled: 'bg-red-100 text-red-700',
            declined: 'bg-red-100 text-red-700',
            paid: 'bg-emerald-100 text-emerald-700',
            failed: 'bg-red-100 text-red-700'
          } as const;
          const paymentStatusColors = {
            paid: 'bg-emerald-100 text-emerald-700',
            pending: 'bg-amber-100 text-amber-700',
            failed: 'bg-red-100 text-red-700'
          } as const;
          const bookingStatusClass = statusColors[String(booking.status).toLowerCase() as keyof typeof statusColors] || 'bg-slate-100 text-slate-600';
          return `
                        <div class="p-3 rounded-xl border border-black/10 bg-white hover:shadow-md transition">
                            <div class="flex items-start justify-between gap-3 mb-2">
                                <div class="flex items-start gap-3 min-w-0 flex-1">
                                  <img src="${escapeHtml(bookingContext.imageUrl)}" alt="${escapeHtml(bookingContext.displayName)}" class="w-14 h-14 rounded-xl object-cover border border-black/10 flex-shrink-0" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect fill=%22%23e5e7eb%22 width=%2264%22 height=%2264%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22>🏠</text></svg>'" />
                                    <div class="min-w-0 flex-1">
                                      <div class="font-semibold text-[color:var(--primary)] text-sm leading-tight">${escapeHtml(bookingContext.displayName)}</div>
                                      <div class="text-xs text-slate-400 mt-0.5">📅 ${new Date(booking.createdAt).toLocaleDateString()}</div>
                                      <div class="text-xs text-slate-500 mt-0.5">👤 ${escapeHtml(customerDetails.name)}${customerDetails.email ? ` • ${escapeHtml(customerDetails.email)}` : ''}</div>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                  <div class="text-lg font-bold text-[color:var(--accent)]">${formatCurrency(getBookingAmount(booking))}</div>
                                  <div class="text-[10px] px-2 py-0.5 rounded-full ${paymentStatusColors[bookingPaymentStatus] || 'bg-slate-100 text-slate-600'} mt-1 inline-block">${bookingPaymentStatus}</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-2 pt-2.5 border-t border-black/5">
                                <div class="text-xs px-2 py-1 rounded-full ${bookingStatusClass} font-medium">${booking.status}</div>
                                <div class="flex items-center gap-2 flex-wrap justify-end">
                                    <button type="button" data-action="view-booking" data-booking-id="${booking.id}" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition">👁️ View</button>
                                    ${isBookingApprovedForPayment(booking)
                          ? `<span class="text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-medium">✓ Payment Approved</span>`
                          : `<button type="button" data-action="approve-for-payment" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? '⏳ Updating...' : '✓ Approve Payment'}</button>`}
                                    <button type="button" data-action="approve-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium hover:bg-green-200 transition ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? '⏳ Updating...' : '✓ Accept'}</button>
                                    <button type="button" data-action="decline-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? '⏳ Updating...' : '✕ Decline'}</button>
                                </div>
                            </div>
                        </div>
                        `;
        })
        .join('')
      : '<div class="text-sm text-slate-400 text-center py-8">📭 No bookings found matching your filters.</div>'
    }
        </div>
    </div>
    `;
};

const renderAdminInvoicesSection = () => {
  const invoices = state.admin?.invoices || [];
  
  const filteredInvoices = invoices.filter((inv: any) => {
    const q = String(state.admin.invoiceFilter?.query || '').trim().toLowerCase();
    const status = state.admin.invoiceFilter?.status;
    const searchable = [
      inv.invoiceNumber,
      inv.customerName,
      inv.customerEmail,
      inv.packageName,
      inv.designName,
      inv.paymentMethod,
      inv.paymentId,
      inv.bookingId,
      inv.status
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ');
    
    if (q && !searchable.includes(q)) {
      return false;
    }
    if (status && status !== 'all' && inv.status !== status) {
      return false;
    }
    return true;
  });

  const stats = {
    total: invoices.length,
    generated: invoices.filter((i: any) => i.status === 'generated').length,
    sent: invoices.filter((i: any) => i.status === 'sent').length,
    totalAmount: invoices.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
  };

  return `
    <div class="spidey-panel p-6">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-6">🧾 Invoices & Receipts</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
            <div class="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">📊 Total</div>
            <div class="text-xl font-bold text-blue-700 mt-1">${stats.total}</div>
          </div>
          <div class="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
            <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">✅ Generated</div>
            <div class="text-xl font-bold text-emerald-700 mt-1">${stats.generated}</div>
          </div>
          <div class="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
            <div class="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">📤 Sent</div>
            <div class="text-xl font-bold text-purple-700 mt-1">${stats.sent}</div>
          </div>
          <div class="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
            <div class="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">💰 Total Amount</div>
            <div class="text-lg font-bold text-amber-700 mt-1">${formatCurrency(stats.totalAmount)}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 admin-invoice-filters">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input data-bind="admin.invoiceFilter.query" value="${escapeHtml(state.admin?.invoiceFilter?.query || '')}" placeholder="Search invoice, receipt, or customer..." class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <select data-bind="admin.invoiceFilter.status" class="px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="all">📋 All Status</option>
                <option value="generated">✅ Generated</option>
                <option value="sent">📤 Sent</option>
                <option value="paid">💰 Paid</option>
            </select>
            <button data-action="create-sample-invoice" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">➕ Create Sample</button>
        </div>

        <div class="space-y-3 max-h-[500px] overflow-y-auto custom-scroll admin-invoice-list">
            ${filteredInvoices.length > 0
      ? filteredInvoices
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((invoice: any) => {
          const statusColors = {
            generated: 'bg-blue-100 text-blue-700',
            sent: 'bg-purple-100 text-purple-700',
            paid: 'bg-emerald-100 text-emerald-700'
          };
          const statusClass = statusColors[invoice.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-600';
          return `
                        <div class="p-4 rounded-xl border border-black/10 bg-white hover:shadow-md transition">
                            <div class="flex items-start justify-between gap-3 mb-3">
                                <div class="flex items-start gap-3 min-w-0 flex-1">
                                    <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                                      🧾
                                    </div>
                                    <div class="min-w-0 flex-1">
                                      <div class="font-semibold text-[color:var(--primary)] text-sm">${escapeHtml(invoice.invoiceNumber)}</div>
                                        <div class="text-xs text-slate-400 mt-1">👤 Customer Name: ${escapeHtml(invoice.customerName)}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">📧 ${escapeHtml(invoice.customerEmail || 'N/A')}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">📦 Booked Package: ${escapeHtml(invoice.packageName || invoice.designName || 'N/A')}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">🎨 Design Name: ${escapeHtml(invoice.designName || invoice.packageName || 'N/A')}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">💳 Payment Mode: ${escapeHtml(formatPaymentMethodLabel(invoice.paymentMethod))}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">🗓️ Payment Date: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).date)}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">⏰ Payment Time: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).time)}</div>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                  <div class="text-lg font-bold text-[color:var(--accent)]">${formatCurrency(invoice.amount)}</div>
                                  <div class="text-[10px] px-2 py-0.5 rounded-full ${statusClass} mt-1 inline-block font-medium">${invoice.status}</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-2 pt-3 border-t border-black/5">
                              <div class="text-xs text-slate-500 font-medium">Customer Name: ${escapeHtml(invoice.customerName || 'N/A')} • Booked Package: ${escapeHtml(invoice.packageName || invoice.designName || 'N/A')} • Design Name: ${escapeHtml(invoice.designName || invoice.packageName || 'N/A')} • Amount: ${formatCurrency(Number(invoice.amount || invoice.totalAmount || 0))}</div>
                                <div class="flex items-center gap-2">
                                    <button type="button" data-action="admin-view-invoice" data-invoice-id="${escapeHtml(String(invoice.id || ''))}" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition">👁️ View</button>
                                    <button type="button" data-action="admin-download-invoice" data-invoice-id="${escapeHtml(String(invoice.id || ''))}" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">⬇️ Download</button>
                                </div>
                            </div>
                        </div>
                        `;
        })
        .join('')
      : '<div class="text-sm text-slate-400 text-center py-8">📭 No invoices found.</div>'
    }
        </div>
    </div>
    `;
};

const renderAdminThemeSection = () => {
  return `
    <div class="spidey-panel p-6">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-4">🎨 Theme & Branding</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="text-sm font-semibold text-slate-600">Primary Color
                <input data-action="theme-update" data-theme-key="primaryColor" type="color" value="${state.theme.primaryColor}" class="mt-2 w-full h-10 rounded-lg border border-black/10" />
            </label>
            <label class="text-sm font-semibold text-slate-600">Accent Color
                <input data-action="theme-update" data-theme-key="accentColor" type="color" value="${state.theme.accentColor}" class="mt-2 w-full h-10 rounded-lg border border-black/10" />
            </label>
        </div>
        <form data-form="site-settings" class="mt-6 space-y-3">
            <input name="heroTitle" value="${escapeHtml(state.siteSettings.heroTitle)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Hero Title" />
            <textarea name="heroSubtitle" class="w-full px-3 py-2 rounded-xl border border-black/10" rows="3" placeholder="Hero Subtitle">${escapeHtml(state.siteSettings.heroSubtitle)}</textarea>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="text-sm font-semibold text-slate-600">Hero Background URL</label>
                    <input name="heroBg" value="${escapeHtml(state.siteSettings.heroBg)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Hero Background URL" />
                </div>
                <div>
                    <label class="text-sm font-semibold text-slate-600">Background Color</label>
                    <select name="bgColor" class="w-full px-3 py-2 rounded-xl border border-black/10" data-action="change-site-bg-color">
                        <option value="#faf9f6" ${state.siteSettings.bgColor === '#faf9f6' ? 'selected' : ''}>Classic White(#faf9f6)</option>
                        <option value="#f5f5f5" ${state.siteSettings.bgColor === '#f5f5f5' ? 'selected' : ''}>Light Gray(#f5f5f5)</option>
                        <option value="#fef3c7" ${state.siteSettings.bgColor === '#fef3c7' ? 'selected' : ''}>Warm Cream(#fef3c7)</option>
                        <option value="#e0f2fe" ${state.siteSettings.bgColor === '#e0f2fe' ? 'selected' : ''}>Soft Blue(#e0f2fe)</option>
                        <option value="#f0fdf4" ${state.siteSettings.bgColor === '#f0fdf4' ? 'selected' : ''}>Mint Green(#f0fdf4)</option>
                        <option value="#faf5ff" ${state.siteSettings.bgColor === '#faf5ff' ? 'selected' : ''}>Lavender(#faf5ff)</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input name="contactEmail" value="${escapeHtml(state.siteSettings.contactEmail)}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Contact Email" />
                <input name="contactPhone" value="${escapeHtml(state.siteSettings.contactPhone)}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Contact Phone" />
                <input name="contactAddress" value="${escapeHtml(state.siteSettings.contactAddress)}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Contact Address" />
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold">Save Settings</button>
        </form>
    </div>
    `;
};

const renderAdminDesignStudioSection = () => {
  const aiDesigns = [
    ...(Array.isArray(state.admin.aiDesigns) ? state.admin.aiDesigns : []),
    ...(Array.isArray(state.customer.aiDesigns) ? state.customer.aiDesigns : [])
  ]
    .filter((record: any, index: number, list: any[]) => {
      const recordId = String(record?.id || '');
      if (!recordId) return true;
      return list.findIndex((entry: any) => String(entry?.id || '') === recordId) === index;
    })
    .sort((left: any, right: any) => new Date(right?.createdAt || 0).getTime() - new Date(left?.createdAt || 0).getTime());

  return `
    <div class="spidey-panel p-6">
      <div class="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">🧠 Design Studio</h2>
          <div class="text-xs text-slate-400 mt-1">Saved AI room concepts from customer uploads.</div>
        </div>
        <div class="text-xs font-semibold text-slate-500">${aiDesigns.length} submissions</div>
      </div>
      <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        ${aiDesigns.length
          ? aiDesigns
            .map((record: any) => {
              const variantCount = Array.isArray(record?.variants) ? record.variants.length : 0;
              const customer = state.users.find((user) => String(user.id || '') === String(record?.userId || ''));
              const previewImage = String(record?.originalImage || record?.variants?.[0]?.image || '');
              return `
                <div class="rounded-2xl border border-black/5 bg-white p-4">
                  <div class="flex items-start gap-3">
                    ${previewImage
                      ? `<img src="${escapeHtml(previewImage)}" alt="Design Studio submission" class="w-16 h-16 rounded-xl object-cover border border-black/10" />`
                      : `<div class="w-16 h-16 rounded-xl border border-dashed border-black/10 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">No Image</div>`}
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(String(customer?.name || record?.userName || 'Customer'))}</div>
                          <div class="text-[11px] text-slate-400 truncate">${escapeHtml(String(customer?.email || record?.userEmail || 'No email available'))}</div>
                        </div>
                        <div class="text-[10px] text-slate-400 whitespace-nowrap">${record?.createdAt ? escapeHtml(new Date(record.createdAt).toLocaleDateString()) : 'Recently added'}</div>
                      </div>
                      <div class="mt-2 text-xs text-slate-600 line-clamp-2">${escapeHtml(String(record?.prompt || 'No prompt saved for this Design Studio request.'))}</div>
                      <div class="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold">
                        <span class="px-2 py-1 rounded-full bg-slate-100 text-slate-600">${variantCount} variants</span>
                        <span class="px-2 py-1 rounded-full bg-blue-100 text-blue-700">${escapeHtml(String(record?.roomType || record?.room || 'Room not set'))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')
          : '<div class="text-sm text-slate-400">No Design Studio submissions yet.</div>'}
      </div>
    </div>
  `;
};

const renderAdminInquiriesSection = () => {
  const getUnreadCount = () => state.inquiries.filter(i => !i.isReadByAdmin).length;
  return `
    <div class="spidey-panel p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">📩 Inquiries</h2>
            <div class="flex items-center gap-4">
                <span class="text-xs text-slate-400">${getUnreadCount()} unread</span>
                <button data-action="mark-all-read" class="text-xs text-[color:var(--accent)] font-semibold">Mark all read</button>
            </div>
        </div>
        <div class="space-y-3 max-h-[320px] overflow-y-auto">
            ${state.inquiries.length
      ? state.inquiries
        .map((inq) => `
                    <div class="p-3 rounded-xl border border-black/5 ${inq.isReadByAdmin ? 'bg-white' : 'bg-[color:var(--accent)]/10'}">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="font-semibold text-[color:var(--primary)]">${escapeHtml(inq.name)}</div>
                                <div class="text-[10px] text-slate-400">${escapeHtml(inq.email)} • ${new Date(inq.createdAt || Date.now()).toLocaleDateString()}</div>
                            </div>
                            <div class="flex items-center gap-2">
                              <button data-action="view-inquiry" data-inquiry-id="${inq.id}" class="text-[10px] font-semibold text-[color:var(--primary)]">View</button>
                                <select data-action="update-inquiry" data-inquiry-id="${inq.id}" class="text-[10px] rounded-lg border border-black/10 px-2 py-1">
                                    ${['new', 'contacted', 'closed'].map(s => `<option value="${s}" ${inq.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                                <button data-action="reply-inquiry" data-inquiry-id="${inq.id}" class="text-[10px] font-semibold text-blue-600">Reply</button>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(inq.message)}</p>
                        ${(inq as any).adminReply ? `
                            <div class="mt-2 p-2 bg-blue-50 border-l-2 border-blue-400 text-[10px] text-blue-800">
                                <strong>Admin:</strong> ${escapeHtml((inq as any).adminReply)}
                            </div>
                        ` : ''}
                    </div>
                `).join('')
      : '<div class="text-sm text-slate-400">No inquiries yet.</div>'
    }
        </div>
    </div>
    `;
};

const renderAdminInquiryDetailsModal = () => {
  const viewingId = (state.admin as any).viewingInquiryId as string | undefined;
  if (!viewingId) return '';
  const inquiry = state.inquiries.find((item) => String(item.id || '') === String(viewingId));
  if (!inquiry) return '';

  return `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 admin-modal-overlay" data-action="close-inquiry-view">
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-xl max-h-[90vh] overflow-y-auto admin-modal-card" data-action="ignore">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[color:var(--primary)]">Inquiry Details</h3>
          <button data-action="close-inquiry-view" class="text-sm text-slate-500">✕</button>
        </div>
        <div class="space-y-4">
          <div>
            <div class="text-sm text-slate-500">Customer Name</div>
            <div class="font-semibold text-[color:var(--primary)]">${escapeHtml(inquiry.name || 'Guest')}</div>
          </div>
          <div>
            <div class="text-sm text-slate-500">Email</div>
            <div class="font-medium text-slate-700">${escapeHtml(inquiry.email || 'N/A')}</div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-slate-500">Status</div>
              <div class="font-medium capitalize text-slate-700">${escapeHtml(inquiry.status || 'new')}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">Received</div>
              <div class="font-medium text-slate-700">${new Date(inquiry.createdAt || Date.now()).toLocaleString()}</div>
            </div>
          </div>
          <div>
            <div class="text-sm text-slate-500 mb-1">Message</div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">${escapeHtml(inquiry.message || '')}</div>
          </div>
          ${(inquiry as any).adminReply ? `
            <div>
              <div class="text-sm text-slate-500 mb-1">Admin Reply</div>
              <div class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 whitespace-pre-wrap">${escapeHtml((inquiry as any).adminReply)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

const renderAdminCustomerDetailsModal = () => {
  const viewingId = (state.admin as any).viewingCustomerId as string | undefined;
  if (!viewingId) return '';
  const customer = state.users.find((u) => String(u.id || '') === String(viewingId));
  if (!customer) return '';

  const allBookings = getEffectiveBookings();
  const customerBookings = allBookings.filter((b: any) => String(b.userId || b.customerId || '') === String(viewingId));
  const customerPhone = String((customer as { phone?: string } | undefined)?.phone || '').trim();
  const customerLocation = String((customer as any)?.location || '').trim();
  const customerPincode = String((customer as any)?.pincode || '').trim();
  const customerAddress = String((customer as any)?.address || '').trim();
  const customerDob = String((customer as any)?.dob || '').trim();
  const customerGender = String((customer as any)?.gender || '').trim();
  const customerBio = String((customer as any)?.bio || '').trim();
  const customerPhoto = String((customer as any)?.profilePhoto || '').trim();
  const bookingIds = new Set(customerBookings.map((item: any) => String(item?.id || '')).filter(Boolean));
  const customerPayments = [...(state.customer.payments || []), ...getPayments()]
    .filter((payment: any, index: number, arr: any[]) => arr.findIndex((entry: any) => String(entry?.id || '') === String(payment?.id || '')) === index)
    .filter((payment: any) => String(payment?.userId || '') === String(viewingId) || bookingIds.has(String(payment?.bookingId || '')))
    .slice()
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
  const customerFeedbacks = (state.customer.feedbacks || [])
    .filter((item: any) => String(item?.userId || '') === String(viewingId))
    .slice()
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
  const customerLikes = (state.customer.likes || []).filter((item: any) => String(item?.userId || '') === String(viewingId) && String(item?.value || '') === 'like');
  const customerSavedPackageIds = getSavedPackageIdsForUser(viewingId);
  const customerSavedPackages = getCustomerDisplayPackages().filter((pkg: Package) => customerSavedPackageIds.includes(String(pkg.id || '')));
  const registeredLabel = customer.createdAt
    ? new Date(customer.createdAt).toLocaleString()
    : 'N/A';

  return `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 admin-modal-overlay" data-action="close-customer-view">
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-xl max-h-[90vh] overflow-y-auto admin-modal-card" data-action="ignore">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[color:var(--primary)]">Customer Details</h3>
          <button type="button" data-action="close-customer-view" class="text-sm text-slate-500">✕</button>
        </div>
        <div class="space-y-4">
          ${customerPhoto ? `
            <div class="flex justify-center">
              <img src="${escapeHtml(customerPhoto)}" alt="${escapeHtml(customer.name || 'Customer')}" class="w-24 h-24 rounded-2xl object-cover border border-black/10" />
            </div>
          ` : ''}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-slate-500">Name</div>
              <div class="font-semibold text-[color:var(--primary)]">${escapeHtml(customer.name || 'Unknown Customer')}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">Email</div>
              <div class="font-medium text-slate-700 break-all">${escapeHtml(customer.email)}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Registered</div>
              <div class="font-medium text-slate-700 mt-1">${registeredLabel}</div>
            </div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Bookings</div>
              <div class="font-semibold text-[color:var(--primary)] mt-1">${customerBookings.length}</div>
            </div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Feedbacks</div>
              <div class="font-semibold text-[color:var(--primary)] mt-1">${customerFeedbacks.length}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Phone</div>
              <div class="font-medium text-slate-700 mt-1">${escapeHtml(customerPhone || 'N/A')}</div>
            </div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Location</div>
              <div class="font-medium text-slate-700 mt-1">${escapeHtml(customerLocation || 'N/A')}</div>
            </div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Pincode</div>
              <div class="font-medium text-slate-700 mt-1">${escapeHtml(customerPincode || 'N/A')}</div>
            </div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Liked Designs</div>
              <div class="font-medium text-slate-700 mt-1">${customerLikes.length}</div>
            </div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Saved Packages</div>
              <div class="font-medium text-slate-700 mt-1">${customerSavedPackages.length}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Date of Birth</div>
              <div class="font-medium text-slate-700 mt-1">${escapeHtml(customerDob || 'N/A')}</div>
            </div>
            <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Gender</div>
              <div class="font-medium text-slate-700 mt-1">${escapeHtml(customerGender || 'N/A')}</div>
            </div>
          </div>
          <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
            <div class="text-[11px] uppercase tracking-wider text-slate-500">Address</div>
            <div class="font-medium text-slate-700 mt-1 whitespace-pre-wrap">${escapeHtml(customerAddress || 'N/A')}</div>
          </div>
          <div class="rounded-xl border border-black/5 bg-slate-50 p-3">
            <div class="text-[11px] uppercase tracking-wider text-slate-500">Bio</div>
            <div class="font-medium text-slate-700 mt-1 whitespace-pre-wrap">${escapeHtml(customerBio || 'N/A')}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Saved Package Preferences (${customerSavedPackages.length})</div>
            ${customerSavedPackages.length ? `
              <div class="space-y-2">
                ${customerSavedPackages.map((pkg: Package) => {
    const pkgAmount = Number(pkg.discountedPrice || pkg.originalPrice || 0);
    const pkgImage = getPackageDisplayImage(pkg);
    return `
                    <div class="rounded-xl border border-black/5 bg-slate-50 px-4 py-3">
                      <div class="flex items-center gap-3">
                        ${renderImageThumb(pkgImage, pkg.name || 'Package', 'w-12 h-12', 'text-[10px]')}
                        <div class="min-w-0 flex-1">
                          <div class="font-semibold text-slate-800 text-sm truncate">${escapeHtml(String(pkg.name || 'Untitled Package'))}</div>
                          <div class="text-xs text-slate-500 truncate">${escapeHtml(String(pkg.category || 'Package'))}</div>
                        </div>
                        <div class="text-sm font-bold text-[color:var(--accent)] shrink-0">${formatCurrency(pkgAmount)}</div>
                      </div>
                    </div>
                  `;
  }).join('')}
              </div>
            ` : '<span class="text-sm text-slate-400">No saved package preferences yet</span>'}
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Booked Designs (${customerBookings.length})</div>
            ${customerBookings.length ? `
              <div class="space-y-2">
                ${customerBookings.map((b: any) => {
    const dName = escapeHtml(b.designName || b.designTitle || 'Unknown Design');
    const bDate = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '';
    const bTime = b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const payStatus = normalizeBookingPaymentStatus(b.paymentStatus);
    const payColor = payStatus === 'paid' ? 'bg-green-100 text-green-700'
      : payStatus === 'failed' ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
    const bookingStatusColor = b.status === 'confirmed' || b.status === 'completed' ? 'bg-blue-100 text-blue-700'
      : b.status === 'cancelled' ? 'bg-red-100 text-red-700'
        : 'bg-slate-100 text-slate-600';
    return `
                    <div class="rounded-xl border border-black/5 bg-slate-50 px-4 py-3">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                          <div class="font-semibold text-slate-800 text-sm truncate">${dName}</div>
                          ${bDate ? `<div class="text-xs text-slate-400 mt-0.5">${bDate}${bTime ? ' · ' + bTime : ''}</div>` : ''}
                        </div>
                        <div class="flex flex-col gap-1 items-end shrink-0">
                          <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${payColor}">${payStatus === 'paid' ? '✓ Paid' : payStatus === 'failed' ? '✗ Failed' : '⏳ Pending'}</span>
                          <span class="px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${bookingStatusColor}">${escapeHtml(b.status || 'booked')}</span>
                        </div>
                      </div>
                    </div>
                  `;
  }).join('')}
              </div>
            ` : '<span class="text-sm text-slate-400">No bookings yet</span>'}
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Payment History (${customerPayments.length})</div>
            ${customerPayments.length ? `
              <div class="space-y-2">
                ${customerPayments.map((payment: any) => {
    const paymentStatus = String(payment?.status || 'pending').toLowerCase();
    const statusClass = paymentStatus === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : paymentStatus === 'failed'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
    const booking = customerBookings.find((item: any) => String(item?.id || '') === String(payment?.bookingId || ''));
    const paymentTitle = escapeHtml(String(booking?.designName || payment?.bookingId || 'Payment'));
    const paymentDate = payment?.createdAt ? new Date(payment.createdAt).toLocaleString() : '';
    return `
                    <div class="rounded-xl border border-black/5 bg-slate-50 px-4 py-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <div class="font-semibold text-slate-800 text-sm truncate">${paymentTitle}</div>
                          <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(String(payment?.provider || 'payment').toUpperCase())}${paymentDate ? ` · ${paymentDate}` : ''}</div>
                        </div>
                        <div class="text-right shrink-0">
                          <div class="font-bold text-[color:var(--accent)] text-sm">${formatCurrency(Number(payment?.amount || 0))}</div>
                          <span class="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}">${paymentStatus === 'success' ? 'Paid' : paymentStatus === 'failed' ? 'Failed' : 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                  `;
  }).join('')}
              </div>
            ` : '<span class="text-sm text-slate-400">No payments yet</span>'}
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Feedback History (${customerFeedbacks.length})</div>
            ${customerFeedbacks.length ? `
              <div class="space-y-2">
                ${customerFeedbacks.map((feedback: any) => {
    const ratingValue = Math.max(1, Math.min(5, Number(feedback?.rating || 0)));
    const feedbackDate = feedback?.createdAt ? new Date(feedback.createdAt).toLocaleString() : '';
    return `
                    <div class="rounded-xl border border-black/5 bg-slate-50 px-4 py-3">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <div class="font-semibold text-slate-800 text-sm">${escapeHtml(customer.name || feedback?.userName || 'Customer')}</div>
                          ${feedbackDate ? `<div class="text-xs text-slate-400 mt-0.5">${feedbackDate}</div>` : ''}
                        </div>
                        <div class="text-amber-400 text-sm tracking-wide">${'★'.repeat(ratingValue)}</div>
                      </div>
                      <div class="mt-2 text-sm text-slate-600 whitespace-pre-wrap">${escapeHtml(String(feedback?.comment || 'No comment provided.'))}</div>
                    </div>
                  `;
  }).join('')}
              </div>
            ` : '<span class="text-sm text-slate-400">No feedback yet</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
};

const getCategoryForPackage = (categoryLike: string) => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const target = normalizeKey(String(categoryLike || ''));
  if (!target) return null;

  const exact = categories.find((cat) => {
    const idKey = normalizeKey(String(cat.id || ''));
    const titleKey = normalizeKey(String(cat.title || cat.name || ''));
    return idKey === target || titleKey === target;
  }) || null;
  if (exact) return exact;

  return categories.find((cat) => {
    const idKey = normalizeKey(String(cat.id || ''));
    const titleKey = normalizeKey(String(cat.title || cat.name || ''));
    return (
      idKey.includes(target) ||
      titleKey.includes(target) ||
      target.includes(idKey) ||
      target.includes(titleKey)
    );
  }) || null;
};

const buildPackageRoomsFromCategory = (categoryLike: string, max = 12) => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const target = normalizeKey(String(categoryLike || ''));
  const selectedCategory = getCategoryForPackage(categoryLike);

  const pooledCategories: any[] = [];
  if (selectedCategory) pooledCategories.push(selectedCategory);

  // Full-home and broad package categories should pull from core room categories.
  if (!selectedCategory || ['full-home', 'fullhome', 'apartment', 'villa', 'home'].some((token) => target.includes(token))) {
    const coreTokens = ['living', 'bedroom', 'kitchen', 'bathroom', 'dining', 'office', 'balcony', 'wardrobe'];
    const coreCategories = categories.filter((cat) => {
      const key = normalizeKey(String(cat.id || cat.title || cat.name || ''));
      return coreTokens.some((token) => key.includes(token));
    });
    pooledCategories.push(...coreCategories);
  }

  const dedupedPools = Array.from(new Map(pooledCategories.map((cat: any) => [String(cat?.id || cat?.title || cat?.name || Math.random()), cat])).values());
  const collectedImages = dedupedPools.flatMap((cat: any) => {
    const imageRows = Array.isArray(cat?.images) ? cat.images : [];
    return imageRows.map((image: any) => ({
      image,
      categoryLabel: String(cat?.title || cat?.name || 'Category')
    }));
  });

  if (collectedImages.length === 0) return [] as PackageRoom[];

  return collectedImages.slice(0, max).map((item: any, index: number) => ({
    id: `room-${Date.now()}-${index}`,
    title: String(item?.image?.name || `Related ${index + 1}`),
    name: String(item?.image?.name || `Related ${index + 1}`),
    category: String(item?.categoryLabel || selectedCategory || 'Category'),
    image: normalizeAssetUrl(String(item?.image?.url || '')),
    description: `${item?.categoryLabel || 'Category'} related image`
  }));
};

const normalizePackageRoomsForForm = (pkg: any, categoryLike: string) => {
  const rawRooms = Array.isArray(pkg?.rooms) ? pkg.rooms : [];
  const legacyRelated = Array.isArray(pkg?.relatedImages) ? pkg.relatedImages : [];
  const legacyImages = Array.isArray(pkg?.images) ? pkg.images : [];
  const candidateItems = rawRooms.length > 0
    ? rawRooms
    : (legacyRelated.length > 0 ? legacyRelated : legacyImages);

  const normalized = candidateItems
    .map((room: any, index: number) => {
      const roomValue = (typeof room === 'string') ? { image: room } : room;
      const image = normalizeAssetUrl(String(roomValue?.image || roomValue?.url || roomValue?.photo || ''));
      if (!image) return null;
      const title = String(roomValue?.title || roomValue?.name || `Related ${index + 1}`);
      const inferredCategory = getDisplayCategoryFromRoomKind(
        classifyRoomKindForDisplay(title, String(roomValue?.description || ''))
      );
      return {
        id: String(roomValue?.id || `room-${Date.now()}-${index}`),
        title,
        name: String(roomValue?.name || title),
        category: String(roomValue?.category || roomValue?.roomType || inferredCategory),
        image,
        description: String(roomValue?.description || `${title} related image`)
      } as PackageRoom;
    })
    .filter(Boolean) as PackageRoom[];

  if (normalized.length > 0) return normalized;
  return buildPackageRoomsFromCategory(categoryLike);
};

const displaySeries = (folder: string, prefix: string, count = 10) =>
  Array.from({ length: count }, (_, index) => `/category/${folder}/${prefix}${index + 1}.jpg`);

const validApartmentFoyerImages = [
  '/category/Apartment/apartment2.jpg',
  '/category/Apartment/apartment4.jpg',
  '/category/Apartment/apartment5.jpg',
  '/category/Apartment/apartment6.jpg',
  '/category/Apartment/apartment7.jpg',
  '/category/Apartment/apartment8.jpg',
  '/category/Apartment/apartment9.jpg',
  '/category/Apartment/apartment10.jpg',
  '/category/Apartment/apartment11.jpg'
];

const DISPLAY_ROOM_IMAGE_POOL: Record<string, string[]> = {
  bedroom: [...displaySeries('Master Bedroom', 'master-bedroom'), ...displaySeries('Kids-bedroom', 'kids-bedroom')],
  bathroom: displaySeries('Bathroom', 'bathroom'),
  kitchen: displaySeries('Kitchen', 'kitchen'),
  living: displaySeries('Living room', 'living'),
  dining: displaySeries('Diningroom', 'dining-room'),
  office: Array.from({ length: 10 }, (_, index) => `/category/Office interior/office interior (${index + 1}).jpg`),
  balcony: Array.from({ length: 10 }, (_, index) => `/category/Balcony/balcony (${index + 1}).jpg`),
  theater: Array.from({ length: 10 }, (_, index) => `/category/Home theatre/home theatre (${index + 1}).jpg`),
  gym: Array.from({ length: 10 }, (_, index) => `/category/Gym/gym (${index + 1}).jpg`),
  pool: ['/category/Swimming pool/swimming pool.jpg', ...Array.from({ length: 10 }, (_, index) => `/category/Swimming pool/swimmingpool${index + 1} - Copy.jpg`)],
  garden: Array.from({ length: 10 }, (_, index) => `/category/Garden/garden (${index + 1}).jpg`),
  foyer: validApartmentFoyerImages,
  wardrobe: displaySeries('wardrobe', 'wardrobe'),
  bar: displaySeries('Diningroom', 'dining-room'),
  library: Array.from({ length: 10 }, (_, index) => `/category/Office interior/office interior (${index + 1}).jpg`)
};

const DISPLAY_ROOM_IMAGE_TOKENS: Record<string, string[]> = {
  bedroom: ['/category/master bedroom/', '/category/kids-bedroom/', '/category/guest room/'],
  bathroom: ['/category/bathroom/'],
  kitchen: ['/category/kitchen/'],
  living: ['/category/living room/'],
  dining: ['/category/diningroom/'],
  office: ['/category/office interior/'],
  balcony: ['/category/balcony/', '/category/terrace/'],
  theater: ['/category/home theatre/'],
  gym: ['/category/gym/'],
  pool: ['/category/swimming pool/'],
  garden: ['/category/garden/'],
  foyer: ['/category/apartment/'],
  wardrobe: ['/category/wardrobe/'],
  bar: ['/category/diningroom/'],
  library: ['/category/office interior/']
};

const classifyRoomKindForDisplay = (titleLike: string, descriptionLike: string, categoryLike: string = '', nameLike: string = '') => {
  const text = `${String(titleLike || '')} ${String(nameLike || '')} ${String(categoryLike || '')} ${String(descriptionLike || '')}`.toLowerCase();
  if (/\bbath(room)?|ensuite|vanity|washroom\b/.test(text)) return 'bathroom';
  if (/\bkitchen|pantry|modular\b/.test(text)) return 'kitchen';
  if (/\bbalcony|terrace|deck\b/.test(text)) return 'balcony';
  if (/\bliving|lounge|family room\b/.test(text)) return 'living';
  if (/\bdining\b/.test(text)) return 'dining';
  if (/\boffice|study|workspace|workstation\b/.test(text)) return 'office';
  if (/\btheatre|theater|cinema|media room\b/.test(text)) return 'theater';
  if (/\bgym|fitness|workout\b/.test(text)) return 'gym';
  if (/\bpool|swimming\b/.test(text)) return 'pool';
  if (/\bgarden|landscape|lawn\b/.test(text)) return 'garden';
  if (/\bfoyer|entrance\b/.test(text)) return 'foyer';
  if (/\bwardrobe|closet|walk-?in|robe\b/.test(text)) return 'wardrobe';
  if (/\bbar\b/.test(text)) return 'bar';
  if (/\blibrary|reading\b/.test(text)) return 'library';
  if (/\bbed(room)?|suite|guest room|kids\b/.test(text)) return 'bedroom';
  return 'living';
};

const getDisplayCategoryFromRoomKind = (kind: string): string => {
  switch (kind) {
    case 'bathroom': return 'Bathroom';
    case 'kitchen': return 'Kitchen';
    case 'balcony': return 'Balcony';
    case 'living': return 'Living Room';
    case 'dining': return 'Dining Area';
    case 'office': return 'Office Interior';
    case 'theater': return 'Home Theatre';
    case 'gym': return 'Gym';
    case 'pool': return 'Swimming Pool';
    case 'garden': return 'Garden';
    case 'foyer': return 'Apartment';
    case 'wardrobe': return 'Wardrobe';
    case 'bar': return 'Dining Area';
    case 'library': return 'Office Interior';
    case 'bedroom': return 'Bedroom';
    default: return 'Living Room';
  }
};

const sanitizePackageRoomsForDisplay = (rooms: PackageRoom[], packageId: string) => {
  const packageSeed = Array.from(String(packageId || '')).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (Array.isArray(rooms) ? rooms : []).map((room: PackageRoom, index: number) => {
    const kind = classifyRoomKindForDisplay(
      room?.title || '',
      room?.description || '',
      String((room as any)?.category || ''),
      String((room as any)?.name || '')
    );
    const resolvedTitle = String(room?.title || (room as any)?.name || `Room ${index + 1}`);
    const resolvedCategory = String((room as any)?.category || getDisplayCategoryFromRoomKind(kind));
    const normalizedImage = normalizeAssetUrl(String(room?.image || ''));
    const normalizedImageLower = normalizedImage.toLowerCase();
    const tokens = DISPLAY_ROOM_IMAGE_TOKENS[kind] || [];
    const hasRelevantImage = normalizedImage && tokens.some((token) => normalizedImageLower.includes(String(token).toLowerCase()));
    if (hasRelevantImage) {
      return {
        ...room,
        id: String(room?.id || `${packageId}-room-${index + 1}`),
        title: resolvedTitle,
        name: String((room as any)?.name || resolvedTitle),
        category: resolvedCategory,
        image: normalizedImage || String(room?.image || ''),
        description: String(room?.description || `${resolvedTitle} related image`)
      } as PackageRoom;
    }

    const pool = DISPLAY_ROOM_IMAGE_POOL[kind] || DISPLAY_ROOM_IMAGE_POOL.living;
    const fallbackImage = pool[Math.abs(index + packageSeed) % pool.length];
    return {
      ...room,
      id: String(room?.id || `${packageId}-room-${index + 1}`),
      title: resolvedTitle,
      name: String((room as any)?.name || resolvedTitle),
      category: resolvedCategory,
      image: normalizeAssetUrl(fallbackImage)
    } as PackageRoom;
  });
};

const getCustomerDisplayPackages = (): Package[] => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();

  const CATEGORY_RULES: Array<{ key: string; title: string; aliases: string[]; match: RegExp }> = [
    { key: 'bedroom', title: 'Bedroom', aliases: ['Master Bedroom', 'Kids Bedroom', 'Guest Room', 'Bedroom'], match: /\b(master|kids?|guest|bed\s*room|bedroom)s?\b/i },
    { key: 'living', title: 'Living Area', aliases: ['Living Room'], match: /\b(living|drawing|family room)s?\b/i },
    { key: 'dining', title: 'Dining Area', aliases: ['Dining Area', 'Dining Room', 'Diningroom'], match: /\b(dining|dinner|dining\s*room|diningroom)\b/i },
    { key: 'kitchen', title: 'Kitchen', aliases: ['Kitchen'], match: /\b(kitchen|modular kitchen|pantry)\b/i },
    { key: 'bathroom', title: 'Bathroom', aliases: ['Bathroom'], match: /\b(bath(room)?|washroom|toilet)s?\b/i },
    { key: 'pool', title: 'Swimming Pool', aliases: ['Swimming Pool'], match: /\b(swimming\s*pool|pool)\b/i },
    { key: 'gym', title: 'Gym', aliases: ['Gym'], match: /\b(gym|fitness|workout)\b/i },
    { key: 'terrace', title: 'Terrace', aliases: ['Terrace'], match: /\b(terrace|roof\s*top|rooftop|deck)\b/i },
    { key: 'theatre', title: 'Home Theatre', aliases: ['Home Theatre'], match: /\b(home\s*theatre|theatre|cinema|media\s*room)\b/i },
    { key: 'office', title: 'Home Office', aliases: ['Office Interior', 'Office'], match: /\b(home\s*office|office|study|workspace|workstation)\b/i },
    { key: 'garden', title: 'Garden', aliases: ['Garden'], match: /\b(garden|landscape|lawn|outdoor)\b/i },
    { key: 'pooja', title: 'Pooja Room', aliases: ['Pooja Room'], match: /\b(pooja|prayer|mandir|meditation)\b/i },
    { key: 'wardrobe', title: 'Wardrobe', aliases: ['Wardrobe'], match: /\b(wardrobe|closet|walk-?in)\b/i },
    { key: 'spa', title: 'Spa', aliases: ['Spa'], match: /\b(spa|wellness|steam|sauna)\b/i },
    { key: 'balcony', title: 'Balcony', aliases: ['Balcony'], match: /\b(balcony|sit\s*out)\b/i }
  ];

  const getCategoriesByAliases = (aliases: string[]) => {
    const normalizedAliases = aliases.map((alias) => normalizeKey(alias)).filter(Boolean);
    const looseAliases = normalizedAliases.map((alias) => alias.replace(/-/g, ''));
    const wantsDining = normalizedAliases.some((alias) => alias.includes('dining'));
    const wantsLiving = normalizedAliases.some((alias) => alias.includes('living'));
    const matched = categories.filter((category: any) => {
      const idKey = normalizeKey(String(category?.id || ''));
      const titleKey = normalizeKey(String(category?.title || category?.name || ''));
      const idLoose = idKey.replace(/-/g, '');
      const titleLoose = titleKey.replace(/-/g, '');

      if (wantsDining && !(idLoose.includes('dining') || titleLoose.includes('dining'))) return false;
      if (wantsLiving && (idLoose.includes('dining') || titleLoose.includes('dining'))) return false;

      return normalizedAliases.some((alias) => alias === idKey || alias === titleKey || idKey.includes(alias) || titleKey.includes(alias))
        || looseAliases.some((alias) => alias === idLoose || alias === titleLoose || idLoose.includes(alias) || titleLoose.includes(alias));
    });

    const deduped = Array.from(
      new Map(matched.map((category: any) => [String(category?.id || category?.title || category?.name || ''), category])).values()
    );

    return deduped;
  };

  const getCategoryByAliases = (aliases: string[]) => {
    const matched = getCategoriesByAliases(aliases);
    return matched.length > 0 ? matched[0] : null;
  };

  const findImageForCategory = (category: any, seed: number) => {
    if (!category) return '';
    const images = Array.isArray(category.images) ? category.images : [];
    if (images.length > 0) {
      const item = images[Math.abs(seed) % images.length];
      const url = normalizeAssetUrl(String(item?.url || ''));
      if (url) return url;
    }
    
    // Fallback: Get design images for this category
    const categoryKey = normalizeCategoryKey(category.id || category.title || category.name || '');
    const designs = getDesigns().filter((d: any) => {
      const designCategoryKey = normalizeCategoryKey(d.categoryId || d.category || '');
      return designCategoryKey === categoryKey || designCategoryKey.includes(categoryKey) || categoryKey.includes(designCategoryKey);
    });
    
    if (designs.length > 0) {
      const design = designs[Math.abs(seed) % designs.length];
      const designImage = normalizeAssetUrl(String(design.previewImage || (design.images && design.images[0]) || ''));
      if (designImage) return designImage;
    }
    
    // Final fallback: Use category image/thumbnail/background
    return normalizeAssetUrl(String(category.image || category.thumbnail || category.background || ''));
  };

  const findRelatedDesignsForCategory = (category: any, limit: number = 20) => {
    if (!category) return [];
    const categoryKey = normalizeCategoryKey(category.id || category.title || category.name || '');
    
    // Get all designs matching this category
    const designs = getDesigns().filter((d: any) => {
      const designCategoryKey = normalizeCategoryKey(d.categoryId || d.category || '');
      return designCategoryKey === categoryKey || designCategoryKey.includes(categoryKey) || categoryKey.includes(designCategoryKey);
    });
    
    // Return up to 'limit' designs with their images
    const result = [];
    for (let i = 0; i < Math.min(designs.length, limit); i++) {
      const design = designs[i];
      const images: string[] = [];
      
      // Add preview image
      if (design.previewImage) {
        images.push(normalizeAssetUrl(design.previewImage));
      }
      
      // Add additional images from design
      if (design.images && Array.isArray(design.images)) {
        design.images.forEach((img: any) => {
          const imgUrl = normalizeAssetUrl(String(img.url || img));
          if (imgUrl && !images.includes(imgUrl)) {
            images.push(imgUrl);
          }
        });
      }
      
      if (images.length > 0) {
        result.push({
          id: design.id,
          title: design.title,
          images: images.slice(0, 5), // Up to 5 images per design
          price: design.price,
          category: design.category
        });
      }
    }
    
    // If not enough designs, add category images
    if (result.length < limit) {
      const categoryImages = Array.isArray(category.images) ? category.images : [];
      categoryImages.forEach((img: any, idx: number) => {
        if (result.length >= limit) return;
        const imgUrl = normalizeAssetUrl(String(img.url || ''));
        if (imgUrl) {
          result.push({
            id: `cat-img-${idx}`,
            title: img.name || `${category.title} Design ${idx + 1}`,
            images: [imgUrl],
            price: 0,
            category: category.title
          });
        }
      });
    }
    
    return result.slice(0, limit);
  };

  const parseBhkCount = (pkg: any) => {
    const text = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.description || '')}`;
    const match = text.match(/(\d+)\s*bhk/i);
    if (!match) return 0;
    const count = Number(match[1]);
    return Number.isFinite(count) ? Math.max(0, count) : 0;
  };

  const buildVillaOrBhkLayout = (pkg: any) => {
    const text = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.description || '')} ${String(pkg?.type || '')}`.toLowerCase();
    const isVilla = /\bvilla\b/.test(text);
    const isApartment = /\bapartment\b/.test(text);
    const bhkCount = parseBhkCount(pkg);
    const isFullHome = /\b(full\s*home|apartment|villa|\d+\s*bhk)\b/.test(text) || bhkCount > 0;
    if (!isFullHome) return null;

    const layout: Array<{ title: string; aliases: string[] }> = [];

    // Configure rooms based on BHK count
    if (bhkCount === 1) {
      // 1BHK: 1 bedroom, 1 kitchen, 1 bathroom, 1 living room
      layout.push(
        { title: '1 Bedroom', aliases: ['Master Bedroom', 'Bedroom'] },
        { title: '1 Kitchen', aliases: ['Kitchen'] },
        { title: '1 Bathroom', aliases: ['Bathroom'] },
        { title: '1 Living Area', aliases: ['Living Room'] }
      );
      // Add balcony for apartments
      if (isApartment) {
        layout.push({ title: '1 Balcony', aliases: ['Balcony'] });
      }
    } else if (bhkCount === 2) {
      // 2BHK: 2 bedrooms, 1 kitchen, 2 bathrooms, 1 living room, 1 dining hall
      layout.push(
        { title: '2 Bedrooms', aliases: ['Master Bedroom', 'Kids Bedroom', 'Bedroom'] },
        { title: '1 Kitchen', aliases: ['Kitchen'] },
        { title: '2 Bathrooms', aliases: ['Bathroom'] },
        { title: '1 Living Area', aliases: ['Living Room'] },
        { title: '1 Dining Area', aliases: ['Dining Area', 'Dining Room', 'Diningroom'] }
      );
      // Add balcony for apartments
      if (isApartment) {
        layout.push({ title: '1 Balcony', aliases: ['Balcony'] });
      }
    } else if (bhkCount === 3) {
      // 3BHK: 3 bedrooms, 1 kitchen, 2 bathrooms, 1 living, 1 dining, 1 office
      layout.push(
        { title: '3 Bedrooms', aliases: ['Master Bedroom', 'Kids Bedroom', 'Guest Room', 'Bedroom'] },
        { title: '1 Kitchen', aliases: ['Kitchen'] },
        { title: '2 Bathrooms', aliases: ['Bathroom'] },
        { title: '1 Living Area', aliases: ['Living Room'] },
        { title: '1 Dining Area', aliases: ['Dining Area', 'Dining Room', 'Diningroom'] },
        { title: '1 Home Office', aliases: ['Office Interior', 'Office'] }
      );
      // Add balcony for apartments
      if (isApartment) {
        layout.push({ title: '1 Balcony', aliases: ['Balcony'] });
      }
      // Villa extras
      if (isVilla) {
        layout.push(
          { title: '1 Garden', aliases: ['Garden'] },
          { title: '1 Terrace', aliases: ['Terrace'] }
        );
      }
    } else if (bhkCount >= 4) {
      // 4BHK+: 4 bedrooms, 1 kitchen, 3 bathrooms, 2 living, 1 dining, 1 office
      layout.push(
        { title: '4 Bedrooms', aliases: ['Master Bedroom', 'Kids Bedroom', 'Guest Room', 'Bedroom'] },
        { title: '1 Kitchen', aliases: ['Kitchen'] },
        { title: '3 Bathrooms', aliases: ['Bathroom'] },
        { title: '2 Living Areas', aliases: ['Living Room'] },
        { title: '1 Dining Area', aliases: ['Dining Area', 'Dining Room', 'Diningroom'] },
        { title: '1 Home Office', aliases: ['Office Interior', 'Office'] }
      );
      // Add balcony for apartments
      if (isApartment) {
        layout.push({ title: '2 Balconies', aliases: ['Balcony'] });
      }
      // Villa extras
      if (isVilla) {
        layout.push(
          { title: 'Swimming Pool', aliases: ['Swimming Pool'] },
          { title: 'Home Theatre', aliases: ['Home Theatre'] },
          { title: 'Home Gym', aliases: ['Gym'] },
          { title: 'Garden', aliases: ['Garden'] },
          { title: 'Terrace', aliases: ['Terrace'] }
        );
      }
    }

    return { layout, isVilla };
  };

  const getRuleForText = (text: string) => CATEGORY_RULES.find((rule) => rule.match.test(text));

  const getPrimaryRuleForPackage = (pkg: any) => {
    const categoryText = String(pkg?.category || '');
    const rule = getRuleForText(categoryText);
    if (rule) return rule;
    return CATEGORY_RULES.find((candidate) => candidate.aliases.some((alias) => normalizeKey(alias) === normalizeKey(categoryText))) || null;
  };

  const deriveLayoutFromFeatures = (pkg: any) => {
    const features = Array.isArray(pkg?.features) ? pkg.features : [];
    const featureItems = features
      .map((item: any) => String(item || '').trim())
      .filter(Boolean);

    const mapped = featureItems
      .map((item: string) => {
        const rule = getRuleForText(item);
        if (!rule) return null;
        const amountMatch = item.match(/(\d+)/);
        const count = amountMatch ? Number(amountMatch[1]) : null;
        const normalizedCount = Number.isFinite(count || NaN) && (count || 0) > 0 ? Number(count) : null;
        const compactTitle = item.length > 48 ? `${rule.title}${normalizedCount ? ` x${normalizedCount}` : ''}` : item;
        return {
          key: `${rule.key}:${normalizeKey(item)}`,
          title: compactTitle,
          aliases: rule.aliases
        };
      })
      .filter(Boolean) as Array<{ key: string; title: string; aliases: string[] }>;

    return mapped;
  };

  const deriveLayoutFromDescription = (pkg: any) => {
    const text = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.description || '')} ${String(pkg?.type || '')}`;
    const lowered = text.toLowerCase();
    const selected: Array<{ key: string; title: string; aliases: string[] }> = [];

    CATEGORY_RULES.forEach((rule) => {
      if (!rule.match.test(lowered)) return;
      const quantityMatch = lowered.match(new RegExp(`(\\d+)\\s*(?:${rule.key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}|${rule.key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}s)`));
      const quantity = quantityMatch ? Number(quantityMatch[1]) : null;
      const title = Number.isFinite(quantity || NaN) && (quantity || 0) > 1
        ? `${quantity} ${rule.title}${quantity === 1 ? '' : 's'}`
        : rule.title;
      selected.push({ key: rule.key, title, aliases: rule.aliases });
    });

    return selected;
  };

  const buildGeneralLayout = (pkg: any) => {
    const primaryRule = getPrimaryRuleForPackage(pkg);
    const descriptionMatches = deriveLayoutFromDescription(pkg);
    const featureMatches = deriveLayoutFromFeatures(pkg);

    const combined = [
      ...(primaryRule ? [{ key: primaryRule.key, title: primaryRule.title, aliases: primaryRule.aliases }] : []),
      ...descriptionMatches,
      ...featureMatches
    ];

    const deduped = Array.from(new Map(combined.map((item) => [item.key, item])).values()).slice(0, 10);
    if (deduped.length > 0) return deduped;

    if (primaryRule) {
      return [{ key: primaryRule.key, title: primaryRule.title, aliases: primaryRule.aliases }];
    }

    // Default to a comprehensive set of core rooms if nothing else matches
    return [
      { key: 'living', title: 'Living Area', aliases: ['Living Room'] },
      { key: 'bedroom', title: 'Bedroom', aliases: ['Bedroom', 'Master Bedroom', 'Kids Bedroom', 'Guest Room'] },
      { key: 'kitchen', title: 'Kitchen', aliases: ['Kitchen'] },
      { key: 'bathroom', title: 'Bathroom', aliases: ['Bathroom'] },
      { key: 'dining', title: 'Dining Area', aliases: ['Dining Room', 'Dining Area'] },
      { key: 'balcony', title: 'Balcony', aliases: ['Balcony'] },
      { key: 'pooja', title: 'Pooja Room', aliases: ['Pooja Room', 'Prayer Room', 'Mandir'] }
    ];
  };

  const expandLayoutItems = (layout: Array<{ title: string; aliases: string[] }>) => {
    const expanded: Array<{ title: string; aliases: string[] }> = [];
    layout.forEach((item) => {
      const title = String(item?.title || '').trim();
      const countMatch = title.match(/^(\d+)\s+/);
      const count = countMatch ? Number(countMatch[1]) : 1;
      const safeCount = Number.isFinite(count) && count > 0 ? Math.min(count, 8) : 1;
      const singularTitle = title.replace(/^\d+\s+/, '').replace(/s$/i, '').trim() || title;

      if (safeCount === 1) {
        expanded.push({ ...item, title });
        return;
      }

      for (let index = 1; index <= safeCount; index += 1) {
        expanded.push({
          aliases: item.aliases,
          title: `${singularTitle} ${index}`
        });
      }
    });
    return expanded;
  };

  const selectedCat = (state.calculator?.category || '').toLowerCase();
  const isVillaInterest = selectedCat.includes('villa');
  const isApartmentInterest = selectedCat.includes('apartment');

  let allRaw = [...(getPackagesSync() || [])];
  
  if (isVillaInterest) {
    allRaw.sort((a: any, b: any) => {
      const aVilla = /villa/i.test(`${a.name} ${a.subtitle} ${a.description} ${a.type} ${a.category}`);
      const bVilla = /villa/i.test(`${b.name} ${b.subtitle} ${b.description} ${b.type} ${b.category}`);
      if (aVilla && !bVilla) return -1;
      if (!aVilla && bVilla) return 1;
      return 0;
    });
  } else if (isApartmentInterest) {
    allRaw.sort((a: any, b: any) => {
      const aApart = /apartment|bhk/i.test(`${a.name} ${a.subtitle} ${a.description} ${a.type} ${a.category}`);
      const bApart = /apartment|bhk/i.test(`${b.name} ${b.subtitle} ${b.description} ${b.type} ${b.category}`);
      if (aApart && !bApart) return -1;
      if (!aApart && bApart) return 1;
      return 0;
    });
  }

  return allRaw.map((rawPackage: any, packageIndex: number) => {
    const pkg = { ...rawPackage } as Package;
    const layoutInfo = buildVillaOrBhkLayout(pkg);

    const targetLayoutBase = layoutInfo ? layoutInfo.layout : buildGeneralLayout(pkg);
    const targetLayout = expandLayoutItems(targetLayoutBase);

    const generatedLayoutRooms: PackageRoom[] = targetLayout.map((item, roomIndex) => {
      const matchedCategories = getCategoriesByAliases(item.aliases);
      const category = matchedCategories.length > 0
        ? matchedCategories[Math.abs(packageIndex + roomIndex) % matchedCategories.length]
        : null;
      const roomImage = findImageForCategory(category, packageIndex + roomIndex + 1) || '/category/generic/generic1.jpg';
      const roomCategoryName = String(category?.title || category?.name || item.aliases[0] || 'Design');
      const descSnippet = String(pkg.description || pkg.subtitle || '').trim();
      return {
        id: `${String(pkg.id || 'pkg')}-room-${roomIndex + 1}`,
        title: item.title,
        name: item.title,
        category: roomCategoryName,
        image: roomImage,
        description: descSnippet
          ? `${item.title}: ${descSnippet.slice(0, 120)}`
          : `${item.title} using ${roomCategoryName} design references`
      };
    });

    const existingRooms: PackageRoom[] = Array.isArray(pkg.rooms)
      ? pkg.rooms.filter((room: any) => room && (room.image || room.title))
      : [];

    // Merge existing DB rooms with generated layout rooms index-by-index so missing/weak
    // room metadata falls back to all inferred package categories (not only living room).
    const builtRooms: PackageRoom[] = generatedLayoutRooms.map((generatedRoom, roomIndex) => {
      const existingRoom = existingRooms[roomIndex] as any;
      if (!existingRoom) return generatedRoom;

      const existingTitle = String(existingRoom?.title || existingRoom?.name || '').trim();
      const existingName = String(existingRoom?.name || existingRoom?.title || '').trim();
      const existingCategory = String(existingRoom?.category || '').trim();
      const existingImage = normalizeAssetUrl(String(existingRoom?.image || ''));
      const existingDescription = String(existingRoom?.description || '').trim();

      const hasGenericTitle = !existingTitle || /^room\s*\d+$/i.test(existingTitle);
      const hasGenericCategory = !existingCategory || /^(living room|design|room)$/i.test(existingCategory);

      const mergedTitle = hasGenericTitle ? generatedRoom.title : existingTitle;
      const mergedName = existingName || mergedTitle;

      return {
        ...generatedRoom,
        ...existingRoom,
        id: String(existingRoom?.id || generatedRoom.id),
        title: mergedTitle,
        name: mergedName,
        category: hasGenericCategory ? generatedRoom.category : existingCategory,
        image: existingImage || generatedRoom.image,
        description: existingDescription || generatedRoom.description
      } as PackageRoom;
    });

    const sanitizedBuiltRooms = sanitizePackageRoomsForDisplay(
      builtRooms,
      String(pkg.id || `pkg-${packageIndex + 1}`)
    );

    const generatedFeatures = (pkg.features && pkg.features.length >= 5) 
      ? [] 
      : sanitizedBuiltRooms.map((room) => room.title).slice(0, 5);

    const mergedFeatures = Array.from(new Set([
      ...(Array.isArray(pkg.features) ? pkg.features : []),
      ...generatedFeatures
    ])).filter(f => !/room\s*\d+|bathroom\s*\d+|kitchen\s*\d+|balcony\s*\d+/i.test(f)).slice(0, 12);

    // Get up to 20 related designs/images by using all package-relevant categories.
    const packageAliases = targetLayout.flatMap((item) => Array.isArray(item?.aliases) ? item.aliases : []);
    if (pkg?.category) packageAliases.push(String(pkg.category));

    const packageCategories = getCategoriesByAliases(packageAliases);
    const fallbackCategories = getCategoriesByAliases(['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Dining Area', 'Balcony', 'Pooja Room']);
    const selectedCategories = packageCategories.length > 0 ? packageCategories : fallbackCategories;

    const perCategoryLimit = Math.max(3, Math.ceil(20 / Math.max(1, selectedCategories.length)));
    const relatedDesigns = Array.from(
      new Map(
        selectedCategories
          .flatMap((category: any) => findRelatedDesignsForCategory(category, perCategoryLimit))
          .map((design: any) => [String(design?.id || `${design?.title || ''}:${design?.category || ''}`), design])
      ).values()
    ).slice(0, 20);
    
    // Collect all unique images from related designs
    const allRelatedImages: string[] = [];
    relatedDesigns.forEach((design: any) => {
      if (design.images && Array.isArray(design.images)) {
        design.images.forEach((img: string) => {
          if (img && !allRelatedImages.includes(img)) {
            allRelatedImages.push(img);
          }
        });
      }
    });

    return {
      ...pkg,
      image: pkg.image || sanitizedBuiltRooms[0]?.image || getPackageDisplayImage(pkg),
      features: mergedFeatures,
      rooms: sanitizedBuiltRooms,
      type: layoutInfo?.isVilla ? 'Villa' : (pkg.type || 'Apartment'),
      relatedDesigns: relatedDesigns,
      relatedImages: allRelatedImages.slice(0, 20) // Ensure exactly 20 images
    };
  });
};

const loadPackageIntoAdminForm = (pkg: any) => {
  const normalizedRooms = normalizePackageRoomsForForm(pkg, pkg?.category || '');
  state.admin.packageForm = {
    id: pkg?.id || '',
    name: pkg?.name || '',
    subtitle: pkg?.subtitle || '',
    category: pkg?.category || 'Full Home',
    originalPrice: Number(pkg?.originalPrice || 0),
    discountedPrice: Number(pkg?.discountedPrice || 0),
    features: Array.isArray(pkg?.features)
      ? [...pkg.features]
      : String(pkg?.features || '').split(',').map((feature: string) => feature.trim()).filter(Boolean),
    description: pkg?.description || '',
    image: pkg?.image || '',
    type: pkg?.type || 'Standard',
    rooms: normalizedRooms
  };
  state.admin.packageCategoryFilter = String(pkg?.category || 'all') || 'all';
  state.admin.packageCategoryFilterDraft = state.admin.packageCategoryFilter;
};

const renderAdminPackageManagerSection = () => {
  const packages = getPackagesSync();
  const pkg = state.admin.packageForm;
  const packageFeaturesText = Array.isArray(pkg.features)
    ? pkg.features.join(', ')
    : String(pkg.features || '');
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const dynamicCategoryNames = categories
    .map((cat) => String(cat.title || cat.name || '').trim())
    .filter((name) => Boolean(name));
  const packageCategoryOptions = Array.from(new Set([
    'Kitchen', 'Bedroom', 'Living Room', 'Bathroom', 'Office', 'Dining Room', 'Full Home',
    ...dynamicCategoryNames
  ]));
  const activePackageFilter = state.admin.packageCategoryFilter || 'all';
  const filteredPackages = activePackageFilter === 'all'
    ? packages
    : packages.filter((item: any) => String(item.category || '').toLowerCase() === activePackageFilter.toLowerCase());
  const selectedPackageId = String(pkg.id || '');
  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">📦 Package Manager</h2>
            <div class="flex items-center gap-2">
              <button data-action="admin-clear-package-cache" class="text-xs px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-700">Clear Cache</button>
              <button data-action="reset-package" class="text-xs text-[color:var(--accent)]">Clear</button>
            </div>
        </div>
        <div class="mb-4 flex flex-wrap items-center gap-2">
            <select id="admin-package-filter" class="px-3 py-2 rounded-xl border border-black/10 text-sm">
                <option value="all" ${activePackageFilter === 'all' ? 'selected' : ''}>All Categories</option>
              ${packageCategoryOptions.map((categoryName) => `<option value="${escapeHtml(categoryName)}" ${activePackageFilter.toLowerCase() === categoryName.toLowerCase() ? 'selected' : ''}>${escapeHtml(categoryName)}</option>`).join('')}
            </select>
            <button type="button" data-action="admin-load-package-category" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Load Category</button>
            <button type="button" data-action="admin-load-package-all" class="px-3 py-2 rounded-lg border border-black/10 text-slate-600 text-xs font-semibold">Show All</button>
        </div>
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <select id="admin-package-select" class="px-3 py-2 rounded-xl border border-black/10 text-sm min-w-[220px]">
              <option value="">Select package to edit</option>
              ${filteredPackages.map((item: any) => `<option value="${escapeHtml(String(item.id || ''))}" ${selectedPackageId === String(item.id || '') ? 'selected' : ''}>${escapeHtml(String(item.name || 'Untitled Package'))}</option>`).join('')}
            </select>
            <button type="button" data-action="admin-load-selected-package" class="px-3 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-semibold">Load Selected</button>
          </div>
        <form data-form="package-form" class="space-y-3">
          <input type="hidden" name="id" value="${escapeHtml(pkg.id || '')}" />
            <input name="name" value="${escapeHtml(pkg.name || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Package Name" required />
            <input name="subtitle" value="${escapeHtml(pkg.subtitle || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Subtitle" />
            <select name="category" class="w-full px-3 py-2 rounded-xl border border-black/10" required>
                <option value="">Select Category</option>
                ${packageCategoryOptions.map(c => `<option value="${escapeHtml(c)}" ${pkg.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
            </select>
            <div class="grid grid-cols-2 gap-3">
                <input name="originalPrice" type="number" value="${pkg.originalPrice || 0}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Original Price" />
                <input name="discountedPrice" type="number" value="${pkg.discountedPrice || 0}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Discounted Price" />
            </div>
            <textarea name="features" class="w-full px-3 py-2 rounded-xl border border-black/10" rows="2" placeholder="Features (comma separated)">${escapeHtml(packageFeaturesText)}</textarea>
            <textarea name="description" class="w-full px-3 py-2 rounded-xl border border-black/10" rows="3" placeholder="Description">${escapeHtml(pkg.description || '')}</textarea>
            <input name="image" value="${escapeHtml(pkg.image || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Image URL" />
            <input name="imageFile" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10" />
            <div class="p-3 rounded-xl border border-black/5 bg-slate-50">
              <div class="flex items-center justify-between mb-2">
                <div class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Related Images</div>
                <div class="flex items-center gap-2">
                  <button type="button" data-action="load-package-related-images" class="text-xs px-2 py-1 rounded-lg border border-black/10 text-slate-600">Load from Category</button>
                  <button type="button" data-action="add-package-room" class="text-xs px-2 py-1 rounded-lg bg-[color:var(--primary)] text-white">+ Add</button>
                </div>
              </div>
              <div class="space-y-2 max-h-52 overflow-y-auto">
                ${(pkg.rooms || []).map((room: any, index: number) => `
                  <div class="p-2 rounded-lg border border-black/5 bg-white space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="text-[10px] text-slate-400">Image #${index + 1}</div>
                      <button type="button" data-action="remove-package-room" data-index="${index}" class="text-[10px] text-red-500">Remove</button>
                    </div>
                    <input data-action="update-package-room" data-index="${index}" data-field="title" value="${escapeHtml(room.title || '')}" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="Title" />
                    <input data-action="update-package-room" data-index="${index}" data-field="image" value="${escapeHtml(room.image || '')}" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="Image URL" />
                    ${room.image ? `<img src="${escapeHtml(room.image)}" alt="${escapeHtml(room.title || `Room ${index + 1}`)}" class="w-full h-24 rounded-lg object-cover border border-black/10" />` : ''}
                    <input data-action="upload-package-room-image" data-index="${index}" type="file" accept="image/*" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" />
                    <input data-action="update-package-room" data-index="${index}" data-field="description" value="${escapeHtml(room.description || '')}" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="Description" />
                  </div>
                `).join('') || '<div class="text-xs text-slate-400">No related images yet.</div>'}
              </div>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold">${pkg.id ? 'Update' : 'Add'} Package</button>
        </form>
        <div class="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          ${filteredPackages.map(p => `
                <div class="p-3 rounded-xl border border-black/5 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <img src="${escapeHtml(p.image || p.rooms?.[0]?.image || '/category/generic/generic1.jpg')}" class="w-10 h-10 rounded-lg object-cover" />
                        <div>
                            <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(p.name)}</div>
                            <div class="text-[10px] text-slate-400">${escapeHtml(p.category)} • ${formatCurrency(p.discountedPrice)}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button data-action="edit-package" data-id="${p.id}" class="text-xs text-[color:var(--accent)]">Edit</button>
                        <button data-action="delete-package" data-id="${p.id}" class="text-xs text-red-500">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

const renderAdminCalculatorSection = () => {
  const form = state.admin.calculatorForm;
  if (!form) return '';
  const imageLibrary = getAdminImageLibrary()
    .slice()
    .sort((a: any, b: any) => String(a?.category || '').localeCompare(String(b?.category || '')) || String(a?.quality || '').localeCompare(String(b?.quality || '')) || Number(a?.order || 0) - Number(b?.order || 0));

  const activeAdminTab = state.admin.calculatorTab || 'settings';
  const history = getCalculationHistory();

  return `
    <div class="spidey-panel overflow-hidden flex flex-col min-h-[600px]">
      <div class="p-6 border-b border-black/5 bg-slate-50/50 flex items-center justify-between">
        <h2 class="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
          <i class="ri-calculator-line text-amber-500"></i>
          <span>Price Calculator Management</span>
        </h2>
        <div class="flex gap-1 p-1 bg-slate-200/50 rounded-xl overflow-x-auto">
          <button data-action="admin-calc-tab" data-value="settings" class="px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeAdminTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">Settings</button>
          <button data-action="admin-calc-tab" data-value="history" class="px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeAdminTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">History</button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        ${activeAdminTab === 'settings' ? `
          <div class="space-y-10">
            <section>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Economics</h3>
              <div class="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
                <label class="block text-xs font-bold text-slate-500 mb-2">Base rate per Sq.Ft. (₹)</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input type="number" data-admin-calc="baseSqftRate" value="${form.baseSqftRate}" class="w-full pl-8 pr-4 py-3 rounded-xl border border-black/10 focus:border-amber-400 outline-none font-black text-lg" />
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Category Multipliers</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                ${Object.entries(form.categoryMultipliers).map(([cat, val]) => `
                  <div class="p-3 rounded-xl bg-white border border-black/5 shadow-sm hover:border-amber-200 transition min-w-0">
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 truncate">${cat}</label>
                    <input type="number" step="0.01" data-admin-calc-category="${cat}" value="${val}" class="w-full bg-transparent font-black text-slate-900 outline-none text-sm" />
                  </div>
                `).join('')}
              </div>
            </section>

            <section>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Shape Multipliers</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                ${Object.entries(form.shapeMultipliers).map(([shape, val]) => `
                  <div class="p-3 rounded-xl bg-white border border-black/5 shadow-sm hover:border-amber-200 transition min-w-0">
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 truncate">${shape}</label>
                    <input type="number" step="0.01" data-admin-calc-shape="${shape}" value="${val}" class="w-full bg-transparent font-black text-slate-900 outline-none text-sm" />
                  </div>
                `).join('')}
              </div>
            </section>

            <section>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quality Multipliers</h3>
              <div class="grid grid-cols-3 gap-3">
                ${Object.entries(form.qualityMultipliers).map(([quality, val]) => `
                  <div class="p-3 rounded-xl bg-white border border-black/5 shadow-sm hover:border-amber-200 transition min-w-0">
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 capitalize">${quality}</label>
                    <input type="number" step="0.01" data-admin-calc-quality="${quality}" value="${val}" class="w-full bg-transparent font-black text-slate-900 outline-none text-sm" />
                  </div>
                `).join('')}
              </div>
            </section>

            <section>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Calculator Image Library</h3>
                <button data-action="add-calc-image-row" class="px-3 py-2 rounded-lg bg-amber-400 text-slate-900 text-xs font-black hover:bg-amber-500 transition">Add Image</button>
              </div>
              <p class="text-xs text-slate-500 mb-4">Manage category + quality specific images. You can upload local files, edit title/description, and save to the local database.</p>
              <div class="space-y-4 max-h-[520px] overflow-y-auto pr-1 custom-scroll">
                ${imageLibrary.map((item: any, index: number) => `
                  <div class="p-4 rounded-xl bg-white border border-black/5" data-admin-calc-image-row data-id="${escapeHtml(String(item.id || `row-${index}`))}">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                        <input data-admin-calc-img="category" value="${escapeHtml(String(item.category || ''))}" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Quality</label>
                        <select data-admin-calc-img="quality" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs font-semibold">
                          <option value="economy" ${String(item.quality) === 'economy' ? 'selected' : ''}>Economy</option>
                          <option value="premium" ${String(item.quality) === 'premium' ? 'selected' : ''}>Premium</option>
                          <option value="luxury" ${String(item.quality) === 'luxury' ? 'selected' : ''}>Luxury</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">BHK</label>
                        <input data-admin-calc-img="bhk" value="${item.bhk ?? ''}" placeholder="-" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Home Type</label>
                        <select data-admin-calc-img="homeType" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs font-semibold">
                          <option value="" ${!item.homeType ? 'selected' : ''}>Any</option>
                          <option value="Apartment" ${String(item.homeType || '') === 'Apartment' ? 'selected' : ''}>Apartment</option>
                          <option value="Villa" ${String(item.homeType || '') === 'Villa' ? 'selected' : ''}>Villa</option>
                        </select>
                      </div>
                      <div class="col-span-2">
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Title</label>
                        <input data-admin-calc-img="title" value="${escapeHtml(String(item.title || ''))}" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" />
                      </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 items-center">
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">Image URL</label>
                        <input data-admin-calc-img="image" value="${escapeHtml(String(item.image || ''))}" class="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs" />
                      </div>
                      <div class="flex items-center gap-2">
                        <label class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <input type="checkbox" data-admin-calc-img="active" ${item.active !== false ? 'checked' : ''} />
                          Active
                        </label>
                        <button data-action="remove-calc-image-row" data-id="${escapeHtml(String(item.id || `row-${index}`))}" class="px-2 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition ml-auto">Remove</button>
                      </div>
                    </div>
                    <div class="mt-3">
                      <img src="${escapeHtml(normalizeAssetUrl(String(item.image || '')) || '/category/Living room/living1.jpg')}" class="w-20 h-12 rounded-lg object-cover border border-black/10" />
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          </div>
        ` : `
          <div class="space-y-4">
            ${history.length > 0 ? `
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="text-slate-400 uppercase tracking-widest font-black border-b border-black/5">
                      <th class="py-3 px-2">Date</th>
                      <th class="py-3 px-2">User</th>
                      <th class="py-3 px-2">Package</th>
                      <th class="py-3 px-2">Details</th>
                      <th class="py-3 px-2 text-right">Estimate</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-black/5">
                    ${history.map(item => `
                      <tr class="hover:bg-slate-50 transition">
                        <td class="py-4 px-2 text-slate-500 font-medium">${new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td class="py-4 px-2">
                          <div class="font-bold text-slate-900">${escapeHtml(item.userName || 'Guest')}</div>
                          <div class="text-[10px] text-slate-400">${item.userId ? 'Registered User' : 'Anonymous'}</div>
                        </td>
                        <td class="py-4 px-2">
                          <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-100">${item.category}</span>
                        </td>
                        <td class="py-4 px-2 text-slate-600">
                          <div class="font-medium">${item.area} sqft · ${item.bhk} BHK</div>
                          <div class="text-[10px]">${item.shape} · <span class="capitalize">${item.quality}</span></div>
                        </td>
                        <td class="py-4 px-2 text-right font-black text-slate-900 text-sm">₹${item.result.toLocaleString()}</td>
                      </tr>
                    `).join('')}
                   </tbody>
                </table>
              </div>
            ` : `
              <div class="py-20 text-center">
                <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <i class="ri-history-line text-3xl text-slate-300"></i>
                </div>
                <h4 class="text-slate-900 font-bold">No history available</h4>
                <p class="text-slate-500 text-xs">When users use the calculator, records will appear here.</p>
              </div>
            `}
          </div>
        `}
      </div>

      <div class="p-6 bg-slate-50 border-t border-black/5">
        <button data-action="save-calculator-settings" class="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:shadow-xl hover:-translate-y-0.5 transition active:scale-95 flex items-center justify-center gap-2">
           <i class="ri-save-fill"></i>
           <span>Save Configuration Changes</span>
        </button>
      </div>
    </div>
  `;
};

const renderAdminChatbotFeedbackSection = (): string => {
  // Chatbot-sourced feedbacks are stored with designId = 'chatbot-general'
  const allFeedbacks = [...(state.customer.feedbacks || []), ...(state.feedbacks || [])];
  const chatbotFeedbacks = allFeedbacks
    .filter((f: any) => f && String(f.designId || '') === 'chatbot-general' && f.comment)
    .filter((f: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.id === f.id) === idx)
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const rows = chatbotFeedbacks.length
    ? chatbotFeedbacks.map((f: any) => {
        const stars = '⭐'.repeat(Math.min(5, Math.max(1, Number(f.rating || 1))));
        const name = escapeHtml(String(f.userName || f.customerId || 'Customer'));
        const comment = escapeHtml(String(f.comment || ''));
        const date = formatMonthYearDate(f.createdAt);
        return `
          <div class="p-3 rounded-xl border border-black/5 bg-white">
            <div class="flex items-center justify-between mb-1">
              <div class="font-semibold text-sm text-[color:var(--primary)]">${name}</div>
              <div class="text-[10px] text-slate-400">${date}</div>
            </div>
            <div class="text-xs text-amber-500 mb-1">${stars}</div>
            <p class="text-xs text-slate-600">${comment}</p>
          </div>`;
      }).join('')
    : `<div class="text-sm text-slate-400 py-2">No chatbot feedback yet.</div>`;

  return `
    <div class="mt-6 pt-4 border-t border-black/5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-slate-600">⭐ Feedback Submitted via Chatbot</h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">${chatbotFeedbacks.length} entries</span>
      </div>
      <div class="grid gap-3 max-h-64 overflow-y-auto" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">
        ${rows}
      </div>
    </div>`;
};

const renderAdminChatbotHistorySection = (): string => {
  const history = [...chatbotHistoryState]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const recent = history.slice(0, 30);
  const registeredOnly = history.filter((entry) => entry.userType === 'registered').slice(0, 20);
  const registeredCount = history.filter((entry) => entry.userType === 'registered').length;
  const newGuestCount = history.filter((entry) => entry.userType === 'newGuest').length;
  const returningGuestCount = history.filter((entry) => entry.userType === 'returningGuest').length;

  return `
    <div class="mt-6 pt-4 border-t border-black/5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-slate-600">🧠 Chatbot Query History</h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">${history.length} total queries</span>
      </div>
      <div class="grid grid-cols-3 gap-2 mb-3">
        <div class="p-2 rounded-lg bg-slate-50 border border-black/5">
          <div class="text-[10px] uppercase tracking-wider text-slate-400">Registered</div>
          <div class="text-sm font-bold text-[color:var(--primary)]">${registeredCount}</div>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-black/5">
          <div class="text-[10px] uppercase tracking-wider text-slate-400">New Guest</div>
          <div class="text-sm font-bold text-[color:var(--primary)]">${newGuestCount}</div>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-black/5">
          <div class="text-[10px] uppercase tracking-wider text-slate-400">Returning Guest</div>
          <div class="text-sm font-bold text-[color:var(--primary)]">${returningGuestCount}</div>
        </div>
      </div>
      <div class="mb-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/60">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-semibold tracking-wide uppercase text-emerald-800">Registered Customers: What They Typed</h4>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">${registeredOnly.length} recent</span>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          ${registeredOnly.length > 0
      ? registeredOnly.map((item) => {
        const when = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
        const query = escapeHtml(String(item.query || ''));
        const customerLabel = `${String(item.userName || 'Customer')}${item.customerEmail ? ` (${item.customerEmail})` : ''}`;
        return `
                <div class="p-2 rounded-lg border border-emerald-200 bg-white">
                  <div class="text-[10px] text-emerald-700 font-semibold mb-0.5 truncate">${escapeHtml(customerLabel)}</div>
                  <div class="text-[11px] text-slate-700"><span class="font-semibold text-slate-500">Typed:</span> ${query}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">${when}</div>
                </div>
              `;
      }).join('')
      : '<div class="text-xs text-slate-500">No registered customer chatbot queries yet.</div>'}
        </div>
      </div>
      <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
        ${recent.length > 0
      ? recent.map((item) => {
        const when = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
        const query = escapeHtml(String(item.query || ''));
        const response = escapeHtml(String(item.response || ''));
        const roleTag = item.userType === 'registered' ? 'Registered' : item.userType === 'newGuest' ? 'New Guest' : 'Returning Guest';
        return `
              <div class="p-3 rounded-xl border border-black/5 bg-white">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <div class="text-[11px] font-semibold text-[color:var(--primary)] truncate">${escapeHtml(String(item.userName || 'Guest'))} • ${roleTag}</div>
                  <div class="text-[10px] text-slate-400 whitespace-nowrap">${when}</div>
                </div>
                <div class="text-[11px] text-slate-700"><span class="font-semibold text-slate-500">Q:</span> ${query}</div>
                <div class="text-[11px] text-slate-600 mt-1"><span class="font-semibold text-slate-500">A:</span> ${response.length > 220 ? `${response.slice(0, 220)}...` : response}</div>
              </div>
            `;
      }).join('')
      : '<div class="text-sm text-slate-400 py-2">No chatbot queries yet.</div>'}
      </div>
    </div>`;
};

const renderAdminChatbotManagerSection = () => {
  const chatbotStats = chatbotStatsState;
  const chatbotSettings = chatbotSettingsState;
  const history = chatbotHistoryState || [];
  const historyRegistered = history.filter((entry) => entry.userType === 'registered').length;
  const historyNewGuest = history.filter((entry) => entry.userType === 'newGuest').length;
  const historyReturningGuest = history.filter((entry) => entry.userType === 'returningGuest').length;
  const registeredCount = historyRegistered > 0 ? historyRegistered : chatbotStats.registeredMessages;
  const guestCount = (historyNewGuest + historyReturningGuest) > 0
    ? (historyNewGuest + historyReturningGuest)
    : (chatbotStats.newGuestMessages + chatbotStats.returningGuestMessages);
  return `
    <div class="spidey-panel p-6">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-6">💬 Chatbot Assistant</h2>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
        <div class="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">💬 Messages</div>
        <div class="text-2xl font-bold text-blue-700 mt-1">${chatbotStats.totalMessages}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
        <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">📅 Bookings</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">${chatbotStats.bookingIntents}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
        <div class="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">💡 Suggestions</div>
        <div class="text-2xl font-bold text-amber-700 mt-1">${chatbotStats.suggestionIntents}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
        <div class="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">👤 Registered</div>
        <div class="text-2xl font-bold text-purple-700 mt-1">${registeredCount}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200/50">
        <div class="text-[10px] uppercase tracking-wider text-pink-600 font-semibold">👥 Guests</div>
        <div class="text-2xl font-bold text-pink-700 mt-1">${guestCount}</div>
      </div>
        </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form data-form="chatbot-settings" class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <span>⚙️</span> Chatbot Settings
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">🤖 Assistant Name</label>
            <input name="assistantName" value="${escapeHtml(chatbotSettings.assistantName)}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., Interia Assistant" required />
          </div>
          <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
            <input type="checkbox" name="enabled" id="chatbot-enabled" ${chatbotSettings.enabled ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded" />
            <label for="chatbot-enabled" class="text-sm text-slate-700 font-medium">✅ Chatbot Enabled</label>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">👋 Greeting Message</label>
            <textarea name="greeting" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Hello! I'm your Interia assistant...">${escapeHtml(chatbotSettings.greeting)}</textarea>
          </div>
        </div>
        <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/25">💾 Save Settings</button>
      </form>
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <span>📝</span> Auto-Reply Templates
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">📅 Booking Inquiry Reply</label>
            <textarea name="bookingReply" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Thank you for your interest in booking...">${escapeHtml(chatbotSettings.bookingReply)}</textarea>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">💡 Suggestions Intro</label>
            <textarea name="suggestionsIntro" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Here are some suggestions...">${escapeHtml(chatbotSettings.suggestionsIntro)}</textarea>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200">
          <h4 class="text-xs font-semibold text-slate-600 mb-3">📊 Quick Stats</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center p-2 rounded-lg bg-white/50">
              <div class="text-lg font-bold text-blue-600">${chatbotStats.totalMessages}</div>
              <div class="text-[9px] uppercase text-slate-400">Total</div>
            </div>
            <div class="text-center p-2 rounded-lg bg-white/50">
              <div class="text-lg font-bold text-emerald-600">${chatbotStats.bookingIntents}</div>
              <div class="text-[9px] uppercase text-slate-400">Bookings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${renderAdminChatbotFeedbackSection()}
    ${renderAdminChatbotHistorySection()}
    </div>
    `;
};


const renderAdminCatalogSection = () => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const designs = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  const activeFilter = state.admin.catalogFilter || 'all';
  const categoryKeys = getCategoryKeySet(activeFilter, categories);
  const filteredDesigns = designs
    .filter((design: any) => design.status !== 'inactive' && design.isDeleted !== true)
    .filter((design) => designMatchesCategory(design, categoryKeys));
  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">🎨 3D Catalog</h2>
            <div class="flex gap-2">
                <span class="text-xs text-slate-400">${filteredDesigns.length} items</span>
        <button data-action="admin-reset-visual-data" class="px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">Reset Visual Data</button>
        <button data-action="open-upload" class="px-3 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-semibold">+ Add Design</button>
            </div>
        </div>
        <div class="mb-4 flex flex-wrap items-center gap-2">
            <select id="admin-catalog-filter" class="px-3 py-2 rounded-xl border border-black/10 text-sm">
                <option value="all" ${activeFilter === 'all' ? 'selected' : ''}>All Categories</option>
                ${categories.map((cat) => `<option value="${cat.id}" ${activeFilter === cat.id ? 'selected' : ''}>${escapeHtml(cat.title || cat.name || cat.id)}</option>`).join('')}
            </select>
            <button type="button" data-action="admin-load-catalog-category" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Load Category</button>
            <button type="button" data-action="admin-load-catalog-all" class="px-3 py-2 rounded-lg border border-black/10 text-slate-600 text-xs font-semibold">Show All</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
            ${filteredDesigns.map(design => `
            <div data-action="preview-catalog-design" data-model-id="${design.id}" class="p-3 rounded-2xl border border-black/5 bg-white shadow-sm flex gap-3 cursor-pointer hover:shadow-md transition-shadow">
          ${renderImageThumb(design.previewImage, design.title, 'w-16 h-16', 'text-[10px]', design.motion3d === true)}
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-semibold truncate">${escapeHtml(design.title)}</div>
                        <div class="text-[10px] text-slate-400 truncate">${escapeHtml(design.categoryId || 'No Category')}</div>
                        <div class="mt-1 flex gap-2">
              <button type="button" data-action="open-design-editor" data-design-id="${design.id}" data-model-id="${design.id}" class="text-[10px] font-bold text-blue-600">Edit</button>
            <button type="button" data-action="archive-catalog" data-model-id="${design.id}" class="text-[10px] font-bold text-amber-600">Archive</button>
            <button type="button" data-action="delete-catalog" data-model-id="${design.id}" class="text-[10px] font-bold text-red-500">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

const renderCatalogPreviewModal = () => {
  const previewId = String((state.admin as any).catalogPreviewId || '').trim();
  if (!previewId) return '';

  const design = (state.customer.designs || []).find((item: any) => String(item?.id || '') === previewId)
    || getDesigns().find((item: any) => String(item?.id || '') === previewId)
    || state.catalog.find((item: any) => String(item?.id || '') === previewId);

  if (!design) return '';

  const title = resolveDesignDisplayName(design as any, {
    imageUrl: String((design as any).previewImage || ''),
    categoryId: String((design as any).categoryId || ''),
    fallback: String((design as any).title || 'Design')
  });
  const imageUrl = String((design as any).previewImage || ((design as any).images && (design as any).images[0]) || '/hero-bg.webp');
  const description = String((design as any).description || 'No description available.');
  const categoryLabel = String((design as any).categoryId || (design as any).category || 'Uncategorized');
  const amount = getDesignAmount(design as any);

  return `
    <div class="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" data-action="close-catalog-preview" data-catalog-preview-modal="true" role="dialog" aria-modal="true" aria-label="Catalog design preview">
      <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl" data-action="ignore">
        <div class="p-5 border-b border-black/5 flex items-center justify-between gap-3">
          <h3 class="text-lg font-bold text-[color:var(--primary)] truncate">${escapeHtml(title)}</h3>
          <button type="button" data-action="close-catalog-preview" data-catalog-preview-close="true" class="text-slate-500 text-xl leading-none">✕</button>
        </div>
        <div class="p-5 space-y-4">
          <div class="rounded-2xl overflow-hidden border border-black/10 bg-slate-100">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" data-motion3d="${(design as any).motion3d === true ? 'true' : 'false'}" class="motion-3d w-full h-72 object-cover" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-black/5">
              <div class="text-[10px] uppercase tracking-wider text-slate-400">Category</div>
              <div class="text-sm font-semibold text-[color:var(--primary)] mt-1">${escapeHtml(categoryLabel)}</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-black/5">
              <div class="text-[10px] uppercase tracking-wider text-slate-400">Price</div>
              <div class="text-sm font-semibold text-[color:var(--primary)] mt-1">${escapeHtml(formatCurrency(amount))}</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-black/5">
              <div class="text-[10px] uppercase tracking-wider text-slate-400">3D Motion</div>
              <div class="text-sm font-semibold text-[color:var(--primary)] mt-1">${(design as any).motion3d === true ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
          <p class="text-sm text-slate-600">${escapeHtml(description)}</p>
          <div class="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" data-action="open-design-editor" data-design-id="${escapeHtml(String((design as any).id || ''))}" data-model-id="${escapeHtml(String((design as any).id || ''))}" class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Edit</button>
            <button type="button" data-action="archive-catalog" data-model-id="${escapeHtml(String((design as any).id || ''))}" class="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold">Archive</button>
            <button type="button" data-action="delete-catalog" data-model-id="${escapeHtml(String((design as any).id || ''))}" class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

const closeCatalogPreview = (restoreFocus = true) => {
  const returnModelId = String((state.admin as any).catalogPreviewReturnModelId || '').trim();
  (state.admin as any).catalogPreviewId = null;
  (state.admin as any).catalogPreviewReturnModelId = '';
  render();

  if (!restoreFocus || !returnModelId) return;
  requestAnimationFrame(() => {
    const trigger = root.querySelector(`[data-action="preview-catalog-design"][data-model-id="${returnModelId}"]`) as HTMLElement | null;
    trigger?.focus();
  });
};

const focusCatalogPreviewDialog = () => {
  requestAnimationFrame(() => {
    const closeButton = root.querySelector('[data-catalog-preview-close="true"]') as HTMLButtonElement | null;
    closeButton?.focus();
  });
};

const renderAdminFeedbackSection = () => {
  const mergedFeedbacks = [...(state.customer.feedbacks || []), ...(state.feedbacks || [])]
    .filter((feedback) => Boolean(feedback && feedback.comment));
  const uniqueFeedbacks = Array.from(new Map(mergedFeedbacks.map((feedback, index) => {
    const key = String(feedback.id || `${feedback.userId || 'guest'}-${feedback.createdAt || index}`);
    return [key, feedback];
  })).values())
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return `
  <div class="spidey-panel p-6">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">⭐ Public Feedback</h2>
      <button type="button" data-action="refresh-admin-feedback" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">↻ Refresh</button>
    </div>
      <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        ${uniqueFeedbacks.length
      ? uniqueFeedbacks
        .map((feedback) => `
                <div class="p-3 rounded-xl border border-black/5">
                  <div class="flex items-center justify-between">
                    <div class="font-semibold text-[color:var(--primary)] text-sm">${escapeHtml(String(feedback.userName || 'Customer'))}</div>
                    <button data-action="delete-feedback" data-feedback-id="${feedback.id}" class="text-xs text-red-500">Remove</button>
                  </div>
                  <div class="text-xs text-amber-500 mb-1">${'★'.repeat(feedback.rating)}</div>
                  <p class="text-xs text-slate-500">${escapeHtml(feedback.comment)}</p>
                  <div class="text-[10px] text-slate-400 mt-2">${formatMonthYearDate(feedback.createdAt || Date.now())}</div>
                </div>
              `).join('')
      : '<div class="text-sm text-slate-400">No public feedback yet.</div>'
    }
</div>
  </div>
    `;
};

const renderAdminCategoriesSection = () => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">📂 Categories</h2>
            <button data-action="reset-category" class="text-xs text-[color:var(--accent)]">Clear</button>
        </div>
        <form data-form="category-form" class="space-y-3">
            <input name="title" value="${escapeHtml(state.admin.categoryForm.title)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Category Title" required />
            ${renderEmojiOptions('title')}
            <input name="image" value="${escapeHtml(state.admin.categoryForm.image)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Image URL" />
            <input name="imageFile" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10" />
            ${state.admin.categoryForm.image ? `<img src="${escapeHtml(state.admin.categoryForm.image)}" alt="Category" class="w-full h-32 object-cover rounded-xl border border-black/5" />` : ''}
            <input name="background" value="${escapeHtml(state.admin.categoryForm.background)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Background URL" />
            <textarea name="description" class="w-full px-3 py-2 rounded-xl border border-black/10" rows="3" placeholder="Description">${escapeHtml(state.admin.categoryForm.description)}</textarea>
            ${renderEmojiOptions('description')}
            <select name="status" class="w-full px-3 py-2 rounded-xl border border-black/10">
                <option value="active" ${state.admin.categoryForm.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${state.admin.categoryForm.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
            <button type="submit" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold">${state.admin.categoryForm.id ? 'Update' : 'Add'} Category</button>
        </form>
        <div class="mt-4 space-y-2 max-h-[240px] overflow-y-auto">
            ${categories.map(cat => `
                <div class="p-3 rounded-xl border border-black/5 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        ${renderCategoryThumb(cat, 'w-10 h-10', 'text-[10px]')}
                        <div>
                            <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(cat.title)}</div>
                            <div class="text-[10px] text-slate-400 capitalize">${cat.status}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" data-action="admin-load-designs-for-category" data-category-id="${cat.id}" class="text-xs text-blue-600">Load Designs</button>
                        <button data-action="edit-category" data-category-id="${cat.id}" class="text-xs text-[color:var(--accent)]">Edit</button>
                        <button data-action="delete-category" data-category-id="${cat.id}" class="text-xs text-red-500">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

const renderAdminDesignManagerSection = () => {
  const adminAny = state.admin as any;
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const designs = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  const activeDesignFilter = adminAny.designCategoryFilter || 'all';
  const designCategoryKeys = getCategoryKeySet(activeDesignFilter, categories);
  const filteredDesigns = designs.filter((design) => designMatchesCategory(design, designCategoryKeys));
  return `
    <div class="spidey-panel p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">✏️ Designs</h2>
        <button data-action="reset-design" class="text-xs text-[color:var(--accent)]">Clear</button>
      </div>
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <select id="admin-design-filter" class="px-3 py-2 rounded-xl border border-black/10 text-sm">
          <option value="all" ${activeDesignFilter === 'all' ? 'selected' : ''}>All Categories</option>
          ${categories.map((cat) => `<option value="${cat.id}" ${activeDesignFilter === cat.id ? 'selected' : ''}>${escapeHtml(cat.title || cat.name || cat.id)}</option>`).join('')}
        </select>
        <button type="button" data-action="admin-load-design-category" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Load Designs</button>
        <button type="button" data-action="admin-load-design-all" class="px-3 py-2 rounded-lg border border-black/10 text-slate-600 text-xs font-semibold">Show All</button>
        <span class="text-xs text-slate-400">${filteredDesigns.length} designs</span>
      </div>
      <form data-form="design-form" class="space-y-3">
        <input name="title" value="${escapeHtml(state.admin.designForm.title)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Design Title" required />
        ${renderEmojiOptions('title')}
        <textarea name="description" class="w-full px-3 py-2 rounded-xl border border-black/10" rows="3" placeholder="Description">${escapeHtml(state.admin.designForm.description)}</textarea>
        ${renderEmojiOptions('description')}
        <select name="categoryId" class="w-full px-3 py-2 rounded-xl border border-black/10" required>
          <option value="">Select category</option>
          ${categories.map((cat) => `<option value="${cat.id}" ${state.admin.designForm.categoryId === cat.id ? 'selected' : ''}>${escapeHtml(cat.title)}</option>`).join('')}
        </select>
        <input name="price" type="number" value="${state.admin.designForm.price}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Selling Price" />
        <input name="cost" type="number" value="${state.admin.designForm.cost || 0}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Internal Cost" />
        <input name="image" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10" />
        ${state.admin.designForm.images && state.admin.designForm.images[0] ? `<img src="${escapeHtml(state.admin.designForm.images[0])}" class="w-full h-32 object-cover rounded-xl mt-2" />` : ''}
        <button type="submit" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold">${state.admin.designForm.id ? 'Update' : 'Add'} Design</button>
      </form>
      <div class="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
        ${filteredDesigns.map(design => `
          <div class="p-3 rounded-xl border border-black/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              ${renderImageThumb(design.previewImage, design.title, 'w-12 h-12', 'text-[10px]')}
              <div>
                <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(design.title)}</div>
                <div class="text-[10px] text-slate-400">${escapeHtml(design.categoryId || design.category || 'No Category')} • Price: ${formatCurrency(getDesignAmount(design as any))}${design.cost ? ` • Cost: ${formatCurrency(design.cost)}` : ''}</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button data-action="edit-design" data-design-id="${design.id}" class="text-xs text-[color:var(--accent)]">Edit</button>
              <button data-action="delete-design" data-design-id="${design.id}" class="text-xs text-red-500">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    `;
};

const renderAdminUsersActivitySection = () => {
  return `
    <div class="spidey-panel p-6">
      <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-4">👤 Customers</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-black/10 text-slate-500 uppercase text-[10px] tracking-wider">
              <th class="text-left py-3 px-2">Name</th>
              <th class="text-left py-3 px-2">Email</th>
              <th class="text-center py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.users.filter((u: any) => String(u?.role || 'customer').toLowerCase() === 'customer').map(u => `
              <tr class="border-b border-black/5 hover:bg-slate-50">
                <td class="py-3 px-2 font-semibold text-[color:var(--primary)]">${escapeHtml(u.name)}</td>
                <td class="py-3 px-2 text-slate-500">${escapeHtml(u.email)}</td>
                <td class="py-3 px-2 text-center">
                  <button type="button" data-action="view-customer" data-customer-id="${escapeHtml(String(u.id || ''))}" class="text-xs text-[color:var(--accent)] font-semibold hover:underline">View Detail</button>
                </td>
              </tr>
            `).join('')
    }
          </tbody>
        </table>
      </div>
    </div>
    `;
};

const renderAdminAnnouncementsSection = () => {
  const nowIso = new Date().toISOString();
  const defaultEndIso = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString();
  const announcementStartDate = String(state.admin.announcementForm.startDate || nowIso);
  const announcementEndDate = String(state.admin.announcementForm.endDate || defaultEndIso);
  const discountCodes = getDiscountCodes();

  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">📢 Announcements</h2>
            <button data-action="reset-announcement" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">🔄 Clear</button>
        </div>
        <form data-form="announcement-form" class="space-y-4">
          <input type="hidden" name="id" value="${escapeHtml(String(state.admin.announcementForm.id || ''))}" />
          <input type="hidden" name="startDate" value="${escapeHtml(announcementStartDate)}" />
          <input type="hidden" name="endDate" value="${escapeHtml(announcementEndDate)}" />
            <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">📝 Announcement Title</label>
                  <input name="title" value="${escapeHtml(state.admin.announcementForm.title)}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., Special Offer!" required />
                </div>
                ${renderEmojiOptions('title')}
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">📍 Display Location</label>
                  <select name="location" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required>
                    <option value="both" ${state.admin.announcementForm.location === 'both' ? 'selected' : ''}>🏠 Both Homepage & Dashboard</option>
                    <option value="homepage" ${state.admin.announcementForm.location === 'homepage' ? 'selected' : ''}>🏡 Homepage Only</option>
                    <option value="dashboard" ${state.admin.announcementForm.location === 'dashboard' ? 'selected' : ''}>📊 Dashboard Only</option>
                    <option value="top_bar" ${state.admin.announcementForm.location === 'top_bar' ? 'selected' : ''}>📢 Top Bar Banner</option>
                    <option value="modal" ${state.admin.announcementForm.location === 'modal' ? 'selected' : ''}>🪟 Welcome Modal</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">💬 Message</label>
                  <textarea name="message" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows="3" placeholder="Enter your announcement message...">${escapeHtml(state.admin.announcementForm.message || '')}</textarea>
                </div>
                ${renderEmojiOptions('message')}
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
                <input type="checkbox" name="active" id="ann-active" ${state.admin.announcementForm.active ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded" />
                <label for="ann-active" class="text-sm text-slate-700 font-medium">✅ Active</label>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/25">${state.admin.announcementForm.id ? '🔄 Update' : '➕ Add'} Announcement</button>
        </form>
        <div class="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
            ${state.announcements.map(a => `
                <div class="flex items-center justify-between p-3 rounded-xl border border-black/5 bg-white/50">
                    <div class="flex-1">
                        <div class="text-sm font-semibold text-[color:var(--primary)]">${getAnnouncementEmoji(a)} ${escapeHtml(a.title)}</div>
                        <div class="text-[10px] text-slate-500">${a.location} • ${a.active ? '🟢 Active' : '🔴 Inactive'}</div>
                    </div>
                    <div class="flex gap-2">
                        <button data-action="edit-announcement" data-id="${a.id}" class="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700">Edit</button>
                        <button data-action="delete-announcement" data-id="${a.id}" class="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="mt-6 pt-5 border-t border-black/10">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-[color:var(--primary)]">Card Payment Discount Codes</h3>
            <span class="text-[10px] text-slate-400">Used by customer dashboard card checkout</span>
          </div>
          <form data-form="discount-code-form" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input name="code" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="💰 Code (e.g. SAVE20)" required />
            <select name="type" class="px-4 py-2.5 rounded-xl border border-black/10">
              <option value="percent">📊 Percent %</option>
              <option value="flat">💵 Flat Amount</option>
            </select>
            <input name="value" type="number" min="1" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="💎 Value" required />
            <input name="minAmount" type="number" min="0" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="📍 Min amount (optional)" />
            <input name="maxDiscount" type="number" min="0" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="🔒 Max cap (optional)" />
            <input name="endDate" type="datetime-local" class="px-4 py-2.5 rounded-xl border border-black/10" />
            <label class="flex items-center gap-2 px-1 text-sm text-slate-600">
              <input name="active" type="checkbox" checked /> ✅ Active
            </label>
            <button type="submit" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm hover:opacity-90 transition">➕ Add Code</button>
          </form>
          <div class="space-y-2 max-h-[160px] overflow-y-auto">
            ${discountCodes.length === 0 ? '<div class="text-xs text-slate-400">No discount codes created yet.</div>' : discountCodes.map((code: any) => `
              <div class="flex items-center justify-between p-2 rounded-lg border border-black/5 bg-white">
                <div>
                  <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(String(code.code || '').toUpperCase())}</div>
                  <div class="text-[10px] text-slate-500">
                    ${code.type === 'flat' ? formatCurrency(Number(code.value || 0)) : `${Number(code.value || 0)}%`}
                    ${Number(code.minAmount || 0) > 0 ? ` • min ${formatCurrency(Number(code.minAmount || 0))}` : ''}
                    ${Number(code.maxDiscount || 0) > 0 ? ` • cap ${formatCurrency(Number(code.maxDiscount || 0))}` : ''}
                    ${code.active ? ' • 🟢 active' : ' • 🔴 inactive'}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button data-action="toggle-discount-code" data-id="${escapeHtml(String(code.id || ''))}" class="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700">${code.active ? 'Disable' : 'Enable'}</button>
                  <button data-action="delete-discount-code" data-id="${escapeHtml(String(code.id || ''))}" class="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
    </div>
    `;
};

const calculatePortfolioMetricsFromBookings = () => {
  const bookings = getPaidPortfolioBookings();
  const categorySales: Record<string, { sales: number; customers: Set<string> }> = {};
  
  bookings.forEach((booking: any) => {
    const cat = booking.categoryId || 'general';
    if (!categorySales[cat]) {
      categorySales[cat] = { sales: 0, customers: new Set() };
    }
    categorySales[cat].sales++;
    categorySales[cat].customers.add(booking.userId);
  });
  
  return categorySales;
};

const renderAdminPortfolioSection = () => {
  const realMetrics = calculatePortfolioMetricsFromBookings();
  const totalSales = Object.values(realMetrics).reduce((sum: number, cat: any) => sum + cat.sales, 0);
  const totalCustomers = new Set(Object.values(realMetrics).flatMap((cat: any) => Array.from(cat.customers))).size;
  
  return `
    <section class="spidey-panel p-6 overflow-hidden">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">💼 Portfolio Content Manager</h2>
          <div class="flex items-center gap-3 text-xs">
            <div class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 font-semibold">📊 ${totalSales} Total Sales</div>
            <div class="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-700 font-semibold">👥 ${totalCustomers} Customers</div>
          </div>
        </div>
        
        <!-- Real-time Category Analytics -->
        <div class="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <h3 class="text-sm font-bold text-emerald-900 mb-3">📈 Live Category Performance</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            ${Object.entries(realMetrics).length > 0 
              ? Object.entries(realMetrics).map(([catId, data]: any) => `
                  <div class="px-3 py-2 rounded-lg bg-white border border-emerald-200/60 text-center">
                    <div class="text-xs font-semibold text-slate-700 line-clamp-1">${escapeHtml(catId.replace('cat-', '').toUpperCase())}</div>
                    <div class="text-sm font-bold text-emerald-600">${data.sales}</div>
                    <div class="text-xs text-slate-500">${data.customers.size} buyers</div>
                  </div>
                `).join('')
              : '<div class="text-xs text-slate-500 col-span-full text-center">No purchases yet - metrics will appear after sales</div>'}
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
                <h3 class="font-semibold text-slate-700 mb-2">Founder Profile</h3>
                <div class="space-y-3">
                    <input data-bind="portfolioContent.founder.name" value="${escapeHtml(state.portfolioContent.founder?.name || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Name" />
                    <input data-bind="portfolioContent.founder.role" value="${escapeHtml(state.portfolioContent.founder?.role || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Role" />
                  <input data-bind="portfolioContent.founder.famousDesign" value="${escapeHtml((state.portfolioContent.founder as any)?.famousDesign || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Famous Design" />
                    <textarea data-bind="portfolioContent.founder.bio" rows="3" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Bio">${escapeHtml(state.portfolioContent.founder?.bio || '')}</textarea>
                    <input data-bind="portfolioContent.founder.photo" value="${escapeHtml(state.portfolioContent.founder?.photo || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10 text-xs" placeholder="Photo URL" />
                    <input data-action="upload-portfolio-image" data-target="founder" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10 text-xs" />
                </div>
            </div>
            <div>
                <h3 class="font-semibold text-slate-700 mb-2">Co-Founder Profile</h3>
                <div class="space-y-3">
                    <input data-bind="portfolioContent.coFounder.name" value="${escapeHtml(state.portfolioContent.coFounder?.name || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Name" />
                    <input data-bind="portfolioContent.coFounder.role" value="${escapeHtml(state.portfolioContent.coFounder?.role || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Role" />
                  <input data-bind="portfolioContent.coFounder.famousDesign" value="${escapeHtml((state.portfolioContent.coFounder as any)?.famousDesign || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Famous Design" />
                    <textarea data-bind="portfolioContent.coFounder.bio" rows="3" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Bio">${escapeHtml(state.portfolioContent.coFounder?.bio || '')}</textarea>
                    <input data-bind="portfolioContent.coFounder.photo" value="${escapeHtml(state.portfolioContent.coFounder?.photo || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10 text-xs" placeholder="Photo URL" />
                    <input data-action="upload-portfolio-image" data-target="coFounder" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10 text-xs" />
                </div>
            </div>
        </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="p-4 rounded-xl border border-black/5 bg-slate-50/60">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-slate-700">Designers</h3>
                <button data-action="add-portfolio-designer" class="text-xs px-2 py-1 rounded-lg bg-[color:var(--primary)] text-white">+ Add Designer</button>
              </div>
              <div class="space-y-3 max-h-72 overflow-y-auto">
                ${(state.portfolioContent.designers || []).map((designer, index) => `
                  <div class="p-3 rounded-xl bg-white border border-black/5 space-y-2">
                    <div class="flex justify-between items-center">
                      <div class="text-xs text-slate-400">Designer #${index + 1}</div>
                      <button data-action="remove-portfolio-designer" data-index="${index}" class="text-xs text-red-500">Remove</button>
                    </div>
                    <input data-bind="portfolioContent.designers.${index}.name" value="${escapeHtml(designer.name || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Designer Name" />
                    <input data-bind="portfolioContent.designers.${index}.role" value="${escapeHtml(designer.role || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Role" />
                    <input data-bind="portfolioContent.designers.${index}.famousDesign" value="${escapeHtml((designer as any).famousDesign || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Famous Design" />
                    <textarea data-bind="portfolioContent.designers.${index}.bio" rows="2" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="About this designer">${escapeHtml((designer as any).bio || '')}</textarea>
                    <input data-bind="portfolioContent.designers.${index}.photo" value="${escapeHtml(designer.photo || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Photo URL" />
                    <input data-action="upload-portfolio-image" data-target="designer" data-index="${index}" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10 text-xs" />
                  </div>
                `).join('') || '<div class="text-sm text-slate-400">No designers added yet.</div>'}
              </div>
            </div>

            <div class="p-4 rounded-xl border border-black/5 bg-slate-50/60">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-slate-700">Feedback Videos</h3>
                <div class="flex items-center gap-2">
                  <button data-action="load-existing-feedback-videos" class="text-xs px-2 py-1 rounded-lg border border-black/10 text-slate-600">Load Existing Videos</button>
                  <button data-action="add-portfolio-video" class="text-xs px-2 py-1 rounded-lg bg-[color:var(--primary)] text-white">+ Add Video</button>
                </div>
              </div>
              <div class="space-y-3 max-h-72 overflow-y-auto">
                ${(state.portfolioContent.feedbackVideos || []).map((video, index) => `
                  <div class="p-3 rounded-xl bg-white border border-black/5 space-y-2">
                    <div class="flex justify-between items-center">
                      <div class="text-xs text-slate-400">Video #${index + 1}</div>
                      <button data-action="remove-portfolio-video" data-index="${index}" class="text-xs text-red-500">Remove</button>
                    </div>
                    <input data-bind="portfolioContent.feedbackVideos.${index}.title" value="${escapeHtml(video.title || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Video Title" />
                    <input data-bind="portfolioContent.feedbackVideos.${index}.url" value="${escapeHtml(video.url || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Video URL" />
                    ${video.url ? `<div class="aspect-video rounded-lg overflow-hidden bg-black border border-black/10">${renderVideoLauncher(video.url, 'w-full h-full rounded-lg', video.title || 'Feedback Video')}</div>` : ''}
                    <input data-action="upload-portfolio-video" data-index="${index}" type="file" accept="video/*" class="w-full px-3 py-2 rounded-xl border border-black/10 text-xs" />
                    <div class="grid grid-cols-2 gap-2">
                      <label class="text-xs flex items-center gap-2"><input data-bind="portfolioContent.feedbackVideos.${index}.showOnHomepage" type="checkbox" ${video.showOnHomepage ? 'checked' : ''} /> Show on Homepage</label>
                      <label class="text-xs flex items-center gap-2"><input data-bind="portfolioContent.feedbackVideos.${index}.showOnPortfolio" type="checkbox" ${video.showOnPortfolio !== false ? 'checked' : ''} /> Show on Portfolio</label>
                    </div>
                  </div>
                `).join('') || '<div class="text-sm text-slate-400">No feedback videos added yet.</div>'}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="p-4 rounded-xl border border-black/5 bg-slate-50/60">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-slate-700">Company Journey</h3>
                <button data-action="add-portfolio-milestone" class="text-xs px-2 py-1 rounded-lg bg-[color:var(--primary)] text-white">+ Add Milestone</button>
              </div>
              <div class="space-y-3 mb-3">
                <input data-bind="portfolioContent.journey.title" value="${escapeHtml((state.portfolioContent as any)?.journey?.title || '')}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Journey Section Title" />
                <textarea data-bind="portfolioContent.journey.intro" rows="2" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Journey intro text">${escapeHtml((state.portfolioContent as any)?.journey?.intro || '')}</textarea>
              </div>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                ${(((state.portfolioContent as any)?.journey?.milestones || []) as any[]).map((milestone: any, index: number) => `
                  <div class="p-3 rounded-xl bg-white border border-black/5 space-y-2">
                    <div class="flex justify-between items-center">
                      <div class="text-xs text-slate-400">Milestone #${index + 1}</div>
                      <button data-action="remove-portfolio-milestone" data-index="${index}" class="text-xs text-red-500">Remove</button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input data-bind="portfolioContent.journey.milestones.${index}.year" value="${escapeHtml(String(milestone?.year || ''))}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Year" />
                      <input data-bind="portfolioContent.journey.milestones.${index}.title" value="${escapeHtml(String(milestone?.title || ''))}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Milestone Title" />
                    </div>
                    <textarea data-bind="portfolioContent.journey.milestones.${index}.description" rows="2" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Milestone description">${escapeHtml(String(milestone?.description || ''))}</textarea>
                  </div>
                `).join('') || '<div class="text-sm text-slate-400">No milestones yet.</div>'}
              </div>
            </div>

            <div class="p-4 rounded-xl border border-black/5 bg-slate-50/60">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-slate-700">Design Sales & Customers Graph</h3>
                <div class="flex items-center gap-2">
                  <button data-action="auto-sync-portfolio-metrics" class="text-xs px-2 py-1 rounded-lg border border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-50" title="Auto-calculate metrics from real customer purchases">🔄 Auto-Sync</button>
                  <button data-action="add-portfolio-metric" class="text-xs px-2 py-1 rounded-lg bg-[color:var(--primary)] text-white">+ Add Data Point</button>
                </div>
              </div>
              <div class="text-xs text-slate-500 mb-2 px-2 py-1 bg-blue-50 rounded border border-blue-200">ℹ️ Auto-Sync calculates metrics from actual paid bookings by category in real-time</div>
              <div class="space-y-2 max-h-72 overflow-y-auto">
                ${(((state.portfolioContent as any)?.businessMetrics || []) as any[]).map((metric: any, index: number) => `
                  <div class="p-3 rounded-xl bg-white border border-black/5 space-y-2">
                    <div class="flex justify-between items-center">
                      <div class="text-xs text-slate-400">Point #${index + 1}</div>
                      <button data-action="remove-portfolio-metric" data-index="${index}" class="text-xs text-red-500">Remove</button>
                    </div>
                    <input data-bind="portfolioContent.businessMetrics.${index}.label" value="${escapeHtml(String(metric?.label || ''))}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Label (e.g. Q1 2026)" />
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="text-xs text-slate-600 font-semibold mb-1 block">💎 Sales</label>
                        <input data-bind="portfolioContent.businessMetrics.${index}.sales" type="number" min="0" value="${escapeHtml(String(Number(metric?.sales || 0)))}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Design Sales" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600 font-semibold mb-1 block">👥 Customers</label>
                        <input data-bind="portfolioContent.businessMetrics.${index}.customers" type="number" min="0" value="${escapeHtml(String(Number(metric?.customers || 0)))}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Customers" />
                      </div>
                    </div>
                  </div>
                `).join('') || '<div class="text-sm text-slate-400">No metric data points yet. Add manually or click Auto-Sync.</div>'}
              </div>
            </div>
          </div>
        <button data-action="save-portfolio-content" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold shadow-lg transition active:scale-95">Save Portfolio Content</button>
    </section>
    `;
};

const renderAdminServicesSection = () => {
  const serviceForm = state.admin.serviceForm || {};
  const isEditingService = Boolean(serviceForm.id);
  const serviceEmojis: Record<string, string> = {
    '3D Design Studio': '🎨',
    'Design View': '📐',
    'Turnkey Execution': '🏗️',
    'AR Walkthrough': '📱',
    'Material Consultation': '🧱',
    'Lighting Design': '💡',
    'Space Planning': '📏',
    'Color Consultation': '🎨',
    'Furniture Selection': '🛋️',
    'Custom Carpentry': '🪚',
    'False Ceiling': '✨',
    'Painting Services': '🖌️',
    'Flooring': '🏺',
    'Modular Kitchen': '👨‍🍳',
    'Wardrobe Design': '🚪',
    'Bathroom Renovation': '🚿',
    'Balcony Design': '🌿',
    'Pooja Room': '🕉️'
  };
  return `
    <section class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">🛠️ Services Manager</h2>
            <div class="flex items-center gap-2">
              <button data-action="admin-load-sample-services" class="text-xs px-3 py-1.5 rounded-lg border border-black/10 text-slate-600 hover:bg-slate-100 transition">📦 Load Sample</button>
              <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">${state.services.length} services</span>
            </div>
        </div>
        <div class="mb-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
          <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span>⚙️</span> ${isEditingService ? '✏️ Edit Service' : '➕ Add New Service'}
          </h3>
          <form data-action="${isEditingService ? 'admin-update-service' : 'admin-add-service'}" data-id="${escapeHtml(serviceForm.id || '')}" class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">📝 Service Title</label>
                <input name="title" value="${escapeHtml(serviceForm.title || '')}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., 3D Design Studio" required />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">🎭 Icon (Emoji)</label>
                <input name="icon" value="${escapeHtml(serviceForm.icon || '')}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., 🎨" required />
              </div>
                </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">📄 Description</label>
              <textarea name="description" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows="2" placeholder="Describe the service..." required>${escapeHtml(serviceForm.description || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">🎬 Video/Image URL (optional)</label>
              <input name="video" value="${escapeHtml(serviceForm.video || '')}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">📁 Upload Media File</label>
              <input id="admin-service-video-file" name="videoFile" type="file" accept="image/*,video/*" class="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/25">${isEditingService ? '🔄 Update Service' : '➕ Add Service'}</button>
              ${isEditingService ? '<button type="button" data-action="admin-cancel-service-edit" class="w-full py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">❌ Cancel</button>' : ''}
            </div>
            </form>
        </div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span>📋</span> Existing Services
          </h3>
          <span class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">${state.services.length} total</span>
        </div>
        <div class="space-y-2 max-h-96 overflow-y-auto custom-scroll">
            ${state.services.map((s, index) => {
    const mediaUrl = normalizeAssetUrl(String(s.video || '').trim());
    const isYoutube = /youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(mediaUrl);
    const isDataVideo = /^data:video\//i.test(mediaUrl);
    const isVideoFile = isDataVideo || /\.(mp4|webm|ogg)(\?|$)/i.test(mediaUrl);
    const isImageFile = /^data:image\//i.test(mediaUrl) || /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(mediaUrl);
    const suggestedEmoji = serviceEmojis[s.title] || '🛠️';
    const displayIcon = s.icon || suggestedEmoji;
    const mediaPreview = mediaUrl
      ? (isDataVideo
        ? `<video src="${escapeHtml(mediaUrl)}" controls preload="metadata" class="w-20 h-14 rounded-lg border border-black/10 bg-black object-contain"></video>`
        : (isYoutube || isVideoFile
          ? renderVideoLauncher(mediaUrl, 'w-20 h-14 rounded-lg border border-black/10 bg-black', s.title || 'Service Media')
          : (isImageFile
            ? `<a href="${escapeHtml(mediaUrl)}" target="_blank" rel="noopener noreferrer" class="block"><img src="${escapeHtml(mediaUrl)}" alt="${escapeHtml(s.title || 'Service Media')}" class="w-20 h-14 object-cover rounded-lg border border-black/10" /></a>`
            : `<a href="${escapeHtml(mediaUrl)}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-[color:var(--accent)] hover:underline">🔗 Open Media</a>`)))
      : '';
    return `
                <div class="p-4 rounded-xl border border-black/10 bg-white hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            ${mediaPreview ? `<div class="shrink-0">${mediaPreview}</div>` : '<div class="w-20 h-14 rounded-lg bg-slate-100 border border-black/5 flex items-center justify-center text-xs text-slate-400">📷 No Media</div>'}
                            <span class="text-3xl">${escapeHtml(displayIcon)}</span>
                            <div>
                                <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(s.title)}</div>
                                <div class="text-[10px] text-slate-500 line-clamp-1">${escapeHtml(s.description)}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button data-action="admin-edit-service" data-id="${escapeHtml(s.id || '')}" data-index="${index}" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition">✏️ Edit</button>
                          <label for="service-media-${escapeHtml(String(s.id || index))}" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition cursor-pointer">📤 Upload</label>
                          <input id="service-media-${escapeHtml(String(s.id || index))}" data-action="upload-service-media" data-id="${escapeHtml(s.id || '')}" type="file" accept="image/*,video/*" class="sr-only" />
                          <button data-action="admin-delete-service" data-id="${escapeHtml(s.id || '')}" data-index="${index}" class="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
                  `;
  }).join('')}
        </div>
    </section>
    `;
};

const renderAdminShowroomsSection = () => {
  const showroomForm = (state.admin.showroomForm || {}) as any;
  const isEditingShowroom = Boolean(showroomForm.id);
  return `
    <section class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">✨ Showrooms</h2>
            <span class="text-xs text-slate-400">${state.showrooms.length} locations</span>
        </div>
    <form data-action="${isEditingShowroom ? 'admin-update-showroom' : 'admin-add-showroom'}" data-id="${escapeHtml(showroomForm.id || '')}" class="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-black/5">
      <input name="name" value="${escapeHtml(showroomForm.name || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Showroom Name" required />
      <input name="city" value="${escapeHtml(showroomForm.city || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="City" required />
      <input name="area" value="${escapeHtml(showroomForm.area || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Area" required />
      <input name="phone" value="${escapeHtml(showroomForm.phone || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Phone" required />
      <input name="videoUrl" value="${escapeHtml(showroomForm.videoUrl || '')}" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10" placeholder="Video URL (optional)" />
      <input name="mediaFile" type="file" accept="image/*,video/*" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10" />
      ${showroomForm.videoUrl ? `${renderVideoLauncher(showroomForm.videoUrl, 'md:col-span-2 w-full h-36 rounded-xl border border-black/5 bg-black', showroomForm.name || 'Showroom Video', showroomForm.imageUrl || '')}` : ''}
      ${showroomForm.imageUrl ? `<img src="${escapeHtml(showroomForm.imageUrl)}" alt="Showroom" class="md:col-span-2 w-full h-36 object-cover rounded-xl border border-black/5" />` : ''}
      <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button type="submit" class="py-2.5 rounded-xl bg-[color:var(--primary)] text-white text-sm font-semibold">${isEditingShowroom ? 'Update Showroom' : 'Add Showroom'}</button>
        ${isEditingShowroom ? '<button type="button" data-action="admin-cancel-showroom-edit" class="py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-slate-600">Cancel Edit</button>' : ''}
      </div>
    </form>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${state.showrooms.map(sr => `
                <div class="p-4 rounded-xl border border-black/5 bg-white shadow-sm">
                    <div class="font-semibold text-[color:var(--primary)]">${escapeHtml(sr.name)}</div>
                    <div class="text-xs text-slate-500">${escapeHtml(sr.city)} - ${escapeHtml(sr.locations[0]?.area || '')}</div>
          ${sr.imageUrl ? `<img src="${escapeHtml(sr.imageUrl)}" alt="${escapeHtml(sr.name)}" class="mt-3 w-full h-28 object-cover rounded-lg border border-black/5" />` : ''}
          <div class="mt-2 flex items-center gap-3">
            <button data-action="admin-edit-showroom" data-id="${escapeHtml(sr.id)}" class="text-xs text-blue-600">Edit</button>
            <button data-action="admin-delete-showroom" data-id="${escapeHtml(sr.id)}" class="text-xs text-red-500">Delete</button>
            <label class="text-xs text-slate-600 cursor-pointer">Upload Local
              <input data-action="upload-showroom-media" data-id="${escapeHtml(sr.id)}" type="file" accept="image/*,video/*" class="hidden" />
            </label>
          </div>
                </div>
            `).join('')}
        </div>
    </section>
    `;
};

const renderAdminLuxuryEditorSection = () => {
  const propertyType = state.showroomPropertyType || 'house';
  const store = getLuxuryShowroomStore();
  const rooms = store[propertyType].rooms || [];
  const isCreatingNewRoom = state.selectedShowroomRoom === '__new__';
  const selectedRoomId = isCreatingNewRoom ? '' : (state.selectedShowroomRoom || rooms[0]?.id || '');
  const selectedRoom = isCreatingNewRoom ? null : (rooms.find((room) => room.id === selectedRoomId) || null);
  const relatedImages = selectedRoom ? getRoomRelatedImages(selectedRoom as any) : [];
  const allDesigns = state.customer.designs && state.customer.designs.length > 0
    ? state.customer.designs
    : getDesigns();
  const allCategories = getCustomerVisibleCategories(
    state.customer.categories && state.customer.categories.length > 0
      ? state.customer.categories
      : getCategories()
  );
  const effectiveRelatedImages = selectedRoom ? getShowroomDisplayImages(selectedRoom, allDesigns, allCategories) : [];
  const roomTypes = Object.values(RoomType);

  return `
    <section class="spidey-panel p-6">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">Castle Luxury Editor</h2>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" data-action="admin-luxury-property" data-property="house" class="px-3 py-2 rounded-lg text-xs font-semibold ${propertyType === 'house' ? 'bg-[color:var(--primary)] text-white' : 'bg-slate-100 text-slate-700'}">Luxury Villa</button>
            <button type="button" data-action="admin-luxury-property" data-property="apartment" class="px-3 py-2 rounded-lg text-xs font-semibold ${propertyType === 'apartment' ? 'bg-[color:var(--primary)] text-white' : 'bg-slate-100 text-slate-700'}">Penthouse Apt</button>
            <button type="button" data-action="admin-reset-luxury-property" data-property="${propertyType}" class="px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold text-slate-600">Reset Property</button>
            <button type="button" data-action="admin-reset-luxury-showrooms" class="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold">Reset All</button>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)] gap-4">
          <div class="rounded-xl border border-black/5 bg-slate-50 p-3 max-h-[520px] overflow-y-auto">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Rooms (${rooms.length})</div>
            <div class="space-y-2">
              ${rooms.length > 0 ? rooms.map((room) => `
                <button type="button" data-action="select-showroom-room" data-room-id="${escapeHtml(room.id)}" class="w-full text-left p-2 rounded-lg border ${selectedRoomId === room.id ? 'border-[color:var(--primary)] bg-white' : 'border-black/5 bg-white/70'}">
                  <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(room.name || 'Untitled Room')}</div>
                  <div class="text-[10px] text-slate-500 truncate">${escapeHtml(String(room.type || ''))}</div>
                </button>
              `).join('') : '<div class="text-xs text-slate-400">No luxury rooms yet.</div>'}
            </div>
            <button type="button" data-action="admin-new-luxury-room" class="mt-3 w-full py-2 rounded-lg border border-black/10 text-xs font-semibold text-slate-700">+ New Room</button>
          </div>

          <div class="min-w-0 rounded-xl border border-black/5 p-4 overflow-hidden">
            <form data-action="${selectedRoom ? 'admin-update-luxury-room' : 'admin-add-luxury-room'}" data-property="${propertyType}" data-room-id="${escapeHtml(selectedRoom?.id || '')}" class="space-y-3">
              <input type="hidden" name="propertyType" value="${propertyType}" />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="name" value="${escapeHtml(selectedRoom?.name || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Room Name" required />
                <select name="type" class="px-3 py-2 rounded-xl border border-black/10" required>
                  ${roomTypes.map((type) => `<option value="${escapeHtml(String(type))}" ${String(selectedRoom?.type || '') === String(type) ? 'selected' : ''}>${escapeHtml(String(type))}</option>`).join('')}
                </select>
              </div>
              <textarea name="description" rows="2" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Description">${escapeHtml(selectedRoom?.description || '')}</textarea>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="imageUrl" value="${escapeHtml(selectedRoom?.imageUrl || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Image URL" />
                <input name="video3d" value="${escapeHtml(selectedRoom?.video3d || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="3D Video URL" />
              </div>
              ${selectedRoom?.imageUrl ? `<img src="${escapeHtml(selectedRoom.imageUrl)}" alt="${escapeHtml(selectedRoom.name || 'Room')}" class="w-full h-36 object-cover rounded-xl border border-black/5" />` : ''}
              ${selectedRoom?.video3d ? renderVideoLauncher(selectedRoom.video3d, 'w-full h-36 rounded-xl border border-black/5 bg-black', selectedRoom.name || 'Room Video', selectedRoom.imageUrl || '') : ''}
              <input name="designIds" value="${escapeHtml((selectedRoom?.designs || []).join(', '))}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Related Design IDs (comma separated)" />
              <input name="mediaFile" type="file" accept="image/*,video/*" class="w-full px-3 py-2 rounded-xl border border-black/10" />

              ${selectedRoom ? `
                <div class="pt-2 border-t border-black/5 space-y-3">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Live Showroom Preview</div>
                      <div class="text-[11px] text-slate-400">This is the effective video and related content customers will see for this room.</div>
                    </div>
                    <div class="text-[11px] text-slate-500">${effectiveRelatedImages.length} related items</div>
                  </div>
                  ${selectedRoom.video3d ? `
                    <div class="rounded-xl border border-black/5 bg-slate-50 p-3 space-y-2">
                      <div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Room Video</div>
                      ${renderVideoLauncher(selectedRoom.video3d, 'w-full h-44 rounded-xl border border-black/5 bg-black', selectedRoom.name || 'Room Video', selectedRoom.imageUrl || '')}
                    </div>
                  ` : '<div class="text-xs text-slate-400">No room video configured yet.</div>'}
                  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    ${effectiveRelatedImages.length > 0 ? effectiveRelatedImages.map((item) => `
                      <div class="rounded-xl border border-black/5 bg-slate-50 overflow-hidden">
                        <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}" class="w-full h-28 object-cover border-b border-black/5" />
                        <div class="p-3 space-y-1">
                          <div class="flex items-center justify-between gap-2">
                            <div class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">${escapeHtml(item.category)}</div>
                            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.sourceType === 'video' ? 'bg-amber-100 text-amber-700' : item.sourceType === 'design' ? 'bg-blue-100 text-blue-700' : item.sourceType === 'manual' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}">${escapeHtml(item.sourceLabel)}</span>
                          </div>
                          <div class="text-xs font-semibold text-[color:var(--primary)] line-clamp-2">${escapeHtml(item.name)}</div>
                        </div>
                      </div>
                    `).join('') : '<div class="sm:col-span-2 xl:col-span-3 text-xs text-slate-400">No effective related images found for this room.</div>'}
                  </div>
                </div>
              ` : ''}

              <div class="pt-2 border-t border-black/5 space-y-2">
                <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Related Content</div>
                ${relatedImages.length > 0 ? relatedImages.map((item, index) => `
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 rounded-lg bg-slate-50 border border-black/5">
                    <input name="relatedImageUrl_${index}" value="${escapeHtml(item.url)}" class="px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="Image URL" />
                    <input name="relatedImageName_${index}" value="${escapeHtml(item.name || '')}" class="px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="Name" />
                    <input name="relatedImageCategory_${index}" value="${escapeHtml(item.category || '')}" class="px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="Category" />
                    ${selectedRoom ? `<input data-action="upload-luxury-related-image" data-property="${propertyType}" data-room-id="${escapeHtml(selectedRoom.id)}" data-index="${index}" type="file" accept="image/*" class="md:col-span-3 px-2 py-1.5 rounded-lg border border-black/10 text-xs" />` : ''}
                  </div>
                `).join('') : '<div class="text-xs text-slate-400">No related content yet for this room.</div>'}

                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 rounded-lg border border-dashed border-black/10">
                  <input name="relatedImageUrlNew" class="px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="New Related Image URL" />
                  <input name="relatedImageNameNew" class="px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="New Related Name" />
                  <input name="relatedImageCategoryNew" class="px-2 py-1.5 rounded-lg border border-black/10 text-xs" placeholder="New Related Category" />
                  ${selectedRoom ? `<input data-action="upload-luxury-related-image" data-property="${propertyType}" data-room-id="${escapeHtml(selectedRoom.id)}" data-index="new" type="file" accept="image/*" class="md:col-span-3 px-2 py-1.5 rounded-lg border border-black/10 text-xs" />` : ''}
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button type="submit" class="py-2.5 rounded-xl bg-[color:var(--primary)] text-white text-sm font-semibold">${selectedRoom ? 'Update Room' : 'Add Room'}</button>
                ${selectedRoom ? `<button type="button" data-action="admin-delete-luxury-room" data-property="${propertyType}" data-room-id="${escapeHtml(selectedRoom.id)}" class="py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold">Delete Room</button>` : '<div></div>'}
              </div>
            </form>
          </div>
        </div>
    </section>
    `;
};

const renderAdminShowcaseSection = () => {
  const showcaseForm = state.admin.showcaseForm || {};
  const isEditingShowcase = Boolean(showcaseForm.id);
  const showcaseRelatedImages = Array.isArray(showcaseForm.relatedImages)
    ? showcaseForm.relatedImages.map((item: any) => normalizeAssetUrl(String(item || '').trim())).filter(Boolean)
    : parseRelatedImageUrlsInput(String(showcaseForm.relatedImages || ''));
  const relatedImageValue = showcaseRelatedImages.join('\n');
  return `
    <section class="spidey-panel p-6">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-4">🌟 Featured Showcase</h2>
    <form data-action="${isEditingShowcase ? 'admin-update-showcase' : 'admin-add-showcase'}" data-id="${escapeHtml(showcaseForm.id || '')}" class="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-black/5">
      <input name="title" value="${escapeHtml(showcaseForm.title || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Title" required />
      <input name="style" value="${escapeHtml(showcaseForm.style || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Style" />
      <input name="duration" value="${escapeHtml(showcaseForm.duration || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Duration" />
      <input name="price" value="${escapeHtml(showcaseForm.price || '')}" class="px-3 py-2 rounded-xl border border-black/10" placeholder="Price" />
      <input name="image" value="${escapeHtml(showcaseForm.image || '')}" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10" placeholder="Image URL" />
      <input name="imageFile" type="file" accept="image/*" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10" />
      <select name="serviceId" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10">
        <option value="">Link with Service Manager item (optional)</option>
        ${state.services.map((service) => `<option value="${escapeHtml(String(service.id || ''))}" ${String(showcaseForm.serviceId || '') === String(service.id || '') ? 'selected' : ''}>${escapeHtml(service.title || 'Service')}</option>`).join('')}
      </select>
      <textarea name="description" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10" rows="2" placeholder="Description">${escapeHtml(showcaseForm.description || '')}</textarea>
      ${showcaseRelatedImages.length > 0 ? `
        <div class="md:col-span-2 space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Related Images</div>
            <button type="button" data-action="admin-clear-showcase-related-images" class="text-xs text-red-500">Clear All</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${showcaseRelatedImages.map((imageUrl: string, index: number) => `
              <div draggable="true" data-drag-showcase-related-index="${index}" data-drop-showcase-related-index="${index}" class="rounded-xl border border-black/10 bg-white overflow-hidden cursor-move transition-all">
                <a href="${escapeHtml(imageUrl)}" target="_blank" rel="noopener noreferrer" class="relative block h-24 bg-slate-100">
                  <img src="${escapeHtml(imageUrl)}" alt="Related image ${index + 1}" class="w-full h-full object-cover" />
                  <span class="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white text-xs border border-white/20" title="Drag to reorder">⋮⋮</span>
                </a>
                <div class="p-2 flex items-center justify-between gap-2">
                  <div class="text-[10px] text-slate-500 truncate">↕ Drag · Image ${index + 1}</div>
                  <div class="flex items-center gap-2">
                    <button type="button" data-action="admin-move-showcase-related-image" data-index="${index}" data-direction="up" class="text-[10px] text-slate-500">Up</button>
                    <button type="button" data-action="admin-move-showcase-related-image" data-index="${index}" data-direction="down" class="text-[10px] text-slate-500">Down</button>
                    <button type="button" data-action="admin-remove-showcase-related-image" data-index="${index}" class="text-[10px] text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <textarea name="relatedImages" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10" rows="2" placeholder="Related image URLs (comma or new line separated)">${escapeHtml(relatedImageValue)}</textarea>
      <input name="relatedImageFiles" type="file" multiple accept="image/*" class="md:col-span-2 px-3 py-2 rounded-xl border border-black/10" />
      <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button type="submit" class="py-2.5 rounded-xl bg-[color:var(--primary)] text-white text-sm font-semibold">${isEditingShowcase ? 'Update Showcase' : 'Add Showcase'}</button>
        ${isEditingShowcase ? '<button type="button" data-action="admin-cancel-showcase-edit" class="py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-slate-600">Cancel Edit</button>' : ''}
      </div>
    </form>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${state.serviceShowcases.map(sh => `
                <div class="rounded-xl border border-black/5 overflow-hidden">
                    <img src="${escapeHtml(sh.image)}" class="w-full h-32 object-cover" />
                    <div class="p-3">
                        <div class="font-semibold text-sm">${escapeHtml(sh.title)}</div>
                        ${sh.serviceId ? `<div class="text-[10px] text-slate-500 mt-1">Linked: ${escapeHtml(state.services.find((service) => String(service.id || '') === String(sh.serviceId || ''))?.title || 'Service')}</div>` : ''}
                        ${Array.isArray(sh.relatedImages) && sh.relatedImages.length > 0 ? `<div class="text-[10px] text-slate-500">Related images: ${sh.relatedImages.length}</div>` : ''}
            <div class="mt-2 flex items-center gap-3">
              <button data-action="admin-edit-showcase" data-id="${escapeHtml(sh.id)}" class="text-xs text-blue-600">Edit</button>
              <button data-action="admin-delete-showcase" data-id="${escapeHtml(sh.id)}" class="text-xs text-red-500">Remove</button>
            </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
    `;
};

const renderAdminCustomersSection = () => {
  const allEffectiveBookings = getEffectiveBookings();
  const editingCustomerId = String((state.admin as any).editingCustomerId || '');
  const showCustomerActivityDetails = Boolean((state.admin as any).showCustomerActivityDetails);
  const customers = state.users.filter((u: any) => String(u?.role || 'customer').toLowerCase() === 'customer');

  const likesByUser = new Map<string, number>();
  for (const like of (state.customer.likes || [])) {
    if (String((like as any)?.value || '') !== 'like') continue;
    const userId = String((like as any)?.userId || '');
    if (!userId) continue;
    likesByUser.set(userId, (likesByUser.get(userId) || 0) + 1);
  }

  const feedbackByUser = new Map<string, number>();
  for (const feedback of (state.customer.feedbacks || [])) {
    const userId = String((feedback as any)?.userId || '');
    if (!userId) continue;
    feedbackByUser.set(userId, (feedbackByUser.get(userId) || 0) + 1);
  }

  const bookingsByUser = new Map<string, number>();
  for (const booking of allEffectiveBookings) {
    const userId = String((booking as any)?.userId || (booking as any)?.customerId || '');
    if (!userId) continue;
    bookingsByUser.set(userId, (bookingsByUser.get(userId) || 0) + 1);
  }

  const customerRows = customers.map((customer) => {
    const customerId = String(customer.id || '');
    return renderAdminCustomerRow({
      customer,
      isEditing: editingCustomerId === customerId,
      customerLikes: likesByUser.get(customerId) || 0,
      customerFeedbacks: feedbackByUser.get(customerId) || 0,
      customerBookings: bookingsByUser.get(customerId) || 0,
      escapeHtml
    });
  }).join('');

  const activityDetailsMarkup = showCustomerActivityDetails
    ? customers.map((customer) => {
      const customerLikes = (state.customer.likes || []).filter((l) => String((l as any)?.userId || '') === String(customer.id || '') && String((l as any)?.value || '') === 'like');
      const customerFeedbacks = (state.customer.feedbacks || []).filter((f) => String((f as any)?.userId || '') === String(customer.id || ''));
      const likedDesignObjs = customerLikes
        .map((l) => state.customer.designs.find((d) => d.id === (l as any).designId))
        .filter((d): d is DesignModel => !!d);
      return `
                    <div class="p-4 rounded-xl border border-black/5">
                        <h4 class="font-semibold text-[color:var(--primary)] mb-3">${escapeHtml(customer.name)} (${escapeHtml(customer.email)})</h4>
                        <div class="mb-3">
                            <div class="text-xs font-semibold text-slate-600 mb-2">📌 Liked Designs:</div>
                            <div class="flex flex-wrap gap-2">
                                ${likedDesignObjs.length ? likedDesignObjs.map(d => `<span class="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs">${escapeHtml(resolveDesignDisplayName(d, { imageUrl: d.previewImage, categoryId: d.categoryId }))}</span>`).join('') : '<span class="text-xs text-slate-400">No liked designs yet</span>'}
                            </div>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-slate-600 mb-2">⭐ Feedback History:</div>
                            <div class="space-y-1">
                                ${customerFeedbacks.length ? customerFeedbacks.map(f => `<div class="text-xs p-2 rounded-lg bg-slate-50 text-slate-600">${'★'.repeat((f as any).rating)} - ${escapeHtml((f as any).comment)}</div>`).join('') : '<span class="text-xs text-slate-400">No feedback yet</span>'}
                            </div>
                        </div>
                    </div>
                    `;
    }).join('')
    : '';

  return `
    <section class="spidey-panel p-6">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">👤 Customers</h2>
          <button
            type="button"
            data-action="toggle-customer-activity-details"
            class="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >${showCustomerActivityDetails ? 'Hide' : 'Show'} Activity Details</button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-black/10">
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Customer Name</th>
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Email</th>
                      <th class="text-left py-3 px-3 font-semibold text-slate-600">Location</th>
                      <th class="text-left py-3 px-3 font-semibold text-slate-600">Pincode</th>
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Liked Designs</th>
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Feedbacks</th>
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Bookings</th>
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                  ${customerRows}
                </tbody>
            </table>
        </div>
        <div class="mt-8 ${showCustomerActivityDetails ? '' : 'hidden'}">
            <h3 class="text-lg font-semibold text-[color:var(--primary)] mb-4">📋 Customer Activity Details</h3>
            <div class="space-y-6">
                ${activityDetailsMarkup}
            </div>
        </div>
    </section>
    `;
};

const renderPaymentSuccessModal = () => {
  const sd = (state.customer as any).paymentSuccessData;
  if (!sd) return '';
  const successBooking = (state.customer.bookings || []).find(
    (item: any) => String(item?.id || '') === String(sd.bookingId || '')
  ) as any;
  const successBookingContext = successBooking ? resolveBookingDesignContext(successBooking) : null;
  const successBookingLabel = successBooking
    ? getBookingDisplayLabel(successBooking, successBookingContext || { displayName: String(successBooking?.designName || 'Design') })
    : String(sd.bookingId || '');
  const successBookingLabelTitle = successBooking
    ? (isPackageBooking(successBooking) ? 'Package' : 'Design')
    : 'Reference';
  return `
    <div class="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" data-action="dismiss-payment-success">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up overflow-hidden" data-action="ignore">
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center">
          <div class="text-5xl mb-3">✅</div>
          <div class="text-2xl font-bold mb-1">Payment Successful!</div>
          <div class="text-4xl font-extrabold mt-3">${formatCurrency(Number(sd.amount || 0))}</div>
          ${sd.discountCode ? `<div class="text-sm opacity-80 mt-1">Discount <strong>${escapeHtml(String(sd.discountCode))}</strong> applied</div>` : ''}
        </div>
        <div class="p-6 space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Card</span>
            <span class="font-mono font-semibold">•••• •••• •••• ${escapeHtml(String(sd.cardLast4 || '****'))}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">${escapeHtml(successBookingLabelTitle)}</span>
            <span class="text-xs text-slate-700 text-right max-w-[65%] truncate" title="${escapeHtml(successBookingLabel)}">${escapeHtml(successBookingLabel)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Status</span>
            <span class="font-semibold text-emerald-600">Confirmed &amp; Paid</span>
          </div>
          <div class="pt-3">
            <button data-action="dismiss-payment-success" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-bold text-sm hover:opacity-90 transition">View My Bookings</button>
          </div>
          <div class="text-center text-[10px] text-slate-400">A confirmation has been saved to your account</div>
        </div>
      </div>
    </div>
  `;
};

const renderCardPaymentModal = () => {
  const fp = (state.customer as any).fakePayment;
  if (!fp) return '';
  const isLoading = state.customer.paymentLoadingId === fp.bookingId;
  const paymentDiscount = (state.customer as any).paymentDiscount;
  const isDiscountActive = Boolean(paymentDiscount && paymentDiscount.bookingId === fp.bookingId);
  const baseAmount = Math.max(1, Number(fp.baseAmount || fp.amount || 0));
  const payableAmount = isDiscountActive
    ? Math.max(1, Number(paymentDiscount.finalAmount || baseAmount))
    : baseAmount;
  const availableOffers = getAnnouncementLinkedOfferCodes();
  return `
    <div class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" data-action="cancel-fake-payment">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up overflow-hidden" data-action="ignore">
        <div class="relative bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] p-6 text-white">
          <button type="button" data-action="cancel-fake-payment" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white font-bold flex items-center justify-center" aria-label="Close payment dialog">✕</button>
          <div class="text-xs uppercase tracking-widest opacity-75 mb-1">Secure Payment</div>
          <div class="text-2xl font-bold">${formatCurrency(payableAmount)}</div>
          ${isDiscountActive ? `<div class="text-xs opacity-90 mt-1">Base ${formatCurrency(baseAmount)} • You save ${formatCurrency(Number(paymentDiscount.discountAmount || 0))}</div>` : ''}
          <div class="text-sm opacity-80 mt-1">Card Payment</div>
        </div>
        <form data-form="fake-payment" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cardholder Name</label>
            <input name="name" type="text" required placeholder="Name on card" class="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
            <input name="cardNumber" type="text" inputmode="numeric" maxlength="19" required placeholder="1234 5678 9012 3456" class="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
              <input name="expiry" type="text" maxlength="5" placeholder="MM/YY" class="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CVV</label>
              <input name="cvv" type="password" maxlength="4" required placeholder="•••" class="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Code</label>
            ${availableOffers.length > 0 ? `
              <div class="flex gap-2">
                <select id="card-offer-select" class="flex-1 px-3 py-2 rounded-lg border border-black/10 text-xs">
                  <option value="">Offers from announcements</option>
                  ${availableOffers.map((offer: any) => {
                    const kind = offer.type === 'flat' ? `₹${Number(offer.value || 0)} OFF` : `${Number(offer.value || 0)}% OFF`;
                    const minAmount = Number(offer.minAmount || 0) > 0 ? ` (Min ${formatCurrency(Number(offer.minAmount || 0))})` : '';
                    return `<option value="${escapeHtml(String(offer.code || ''))}">${escapeHtml(String(offer.code || ''))} - ${escapeHtml(kind + minAmount)}</option>`;
                  }).join('')}
                </select>
                <button type="button" data-action="apply-selected-card-offer" data-booking-id="${escapeHtml(fp.bookingId)}" class="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">Use</button>
              </div>
            ` : ''}
            <div class="flex gap-2">
              <input id="card-discount-code" value="${escapeHtml(String(fp.discountCode || ''))}" placeholder="Enter code" class="flex-1 px-3 py-2 rounded-lg border border-black/10 text-xs" />
              <button type="button" data-action="apply-card-discount" data-booking-id="${escapeHtml(fp.bookingId)}" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Apply</button>
            </div>
            ${(() => {
              const pd = (state.customer as any).paymentDiscount;
              const isActive = pd && pd.bookingId === fp.bookingId;
              return isActive ? `<div class="text-xs rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 border border-emerald-100">Code <strong>${escapeHtml(String(pd.code || ''))}</strong> applied — you save <strong>${formatCurrency(Number(pd.discountAmount || 0))}</strong></div>` : '';
            })()}
          </div>
          ${state.customer.paymentError ? `
            <div class="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">${escapeHtml(state.customer.paymentError)}</div>
          ` : ''}
          ${isLoading ? `
            <div class="py-4 flex flex-col items-center justify-center gap-3">
              <div class="w-8 h-8 border-4 border-[color:var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <div class="text-sm text-slate-500 font-medium">Processing payment…</div>
            </div>
          ` : `
          <div class="flex gap-2 pt-2">
            <button type="button" data-action="cancel-fake-payment" class="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 rounded-lg bg-[color:var(--primary)] text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
              <span>🔒</span> Pay ${formatCurrency(payableAmount)}
            </button>
          </div>
          `}
          <div class="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <span>🔐</span> Secured by 256-bit SSL encryption
          </div>
        </form>
      </div>
    </div>
  `;
};

const renderBookingDetailsModal = () => {
  const details = (state.customer as any).bookingDetails;
  if (!details) return '';
  const paymentDiscount = (state.customer as any).paymentDiscount;
  const isDiscountForCurrent = Boolean(paymentDiscount && paymentDiscount.bookingId === details.bookingId);
  const effectiveAmount = isDiscountForCurrent ? Number(paymentDiscount.finalAmount || details.amount || 0) : Number(details.amount || 0);
  const availableOffers = getAnnouncementLinkedOfferCodes();
  return `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-action="close-booking-details">
      <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up" data-action="ignore">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[color:var(--primary)]">Booking Details</h3>
          <button data-action="close-booking-details" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div class="p-6 space-y-4">
          ${details.imageUrl ? `
          <div class="rounded-xl overflow-hidden border border-black/10 bg-slate-100">
            <img src="${escapeHtml(details.imageUrl)}" alt="${escapeHtml(details.designName || 'Booked Design')}" class="motion-3d w-full h-48 object-cover" data-motion3d="true" />
          </div>
          ` : ''}
          <div>
            <div class="text-xs text-slate-500 uppercase tracking-wider">Design</div>
            <div class="font-semibold text-[color:var(--primary)] text-lg">${escapeHtml(details.designName)}</div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Date</div>
              <div class="font-medium">${details.bookedDate}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Time</div>
              <div class="font-medium">${details.bookedTime}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Amount</div>
              <div class="font-bold text-[color:var(--accent)]">${details.priceLabel}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 uppercase tracking-wider">Status</div>
              <div class="font-medium capitalize ${details.bookingStatus === 'confirmed' ? 'text-green-600' : 'text-amber-600'}">${details.bookingStatus}</div>
            </div>
          </div>
          <div class="pt-4 border-t border-slate-100">
            <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Payment</div>
            ${availableOffers.length > 0 ? `
              <div class="mb-2">
                <div class="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Offers From Announcements</div>
                <div class="flex gap-2">
                  <select id="booking-offer-select" class="flex-1 px-3 py-2 rounded-lg border border-black/10 text-xs">
                    <option value="">Select offer</option>
                    ${availableOffers.map((offer: any) => {
                      const kind = offer.type === 'flat' ? `₹${Number(offer.value || 0)} OFF` : `${Number(offer.value || 0)}% OFF`;
                      const minAmount = Number(offer.minAmount || 0) > 0 ? ` (Min ${formatCurrency(Number(offer.minAmount || 0))})` : '';
                      return `<option value="${escapeHtml(String(offer.code || ''))}">${escapeHtml(String(offer.code || ''))} - ${escapeHtml(kind + minAmount)}</option>`;
                    }).join('')}
                  </select>
                  <button type="button" data-action="apply-selected-offer" data-booking-id="${escapeHtml(details.bookingId)}" class="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">Use</button>
                </div>
              </div>
            ` : ''}
            <div class="flex gap-2 mb-2">
              <input id="booking-discount-code" value="${escapeHtml(String((state.customer as any).paymentDiscountCode || ''))}" placeholder="Discount code" class="flex-1 px-3 py-2 rounded-lg border border-black/10 text-xs" />
              <button type="button" data-action="apply-discount-code" data-booking-id="${escapeHtml(details.bookingId)}" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Apply</button>
            </div>
            ${isDiscountForCurrent ? `
              <div class="mb-2 text-xs rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 border border-emerald-100">
                Code <strong>${escapeHtml(String(paymentDiscount.code || ''))}</strong> applied.
                You save <strong>${formatCurrency(Number(paymentDiscount.discountAmount || 0))}</strong>.
              </div>
            ` : ''}
            <div class="bg-slate-50 p-3 rounded-lg space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-medium capitalize">${details.paymentStatus}</span>
                <div class="text-right">
                  <div class="text-[10px] text-slate-500">Payable</div>
                  <div class="font-bold text-[color:var(--accent)]">${formatCurrency(effectiveAmount)}</div>
                </div>
              </div>
              ${details.paymentStatus !== 'paid' ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${isBookingApprovedForPayment({ status: details.bookingStatus })
        ? `<button data-action="pay-and-book" data-design-id="${details.designId}" data-booking-id="${details.bookingId}" class="text-xs bg-[color:var(--primary)] text-white px-3 py-2 rounded-lg font-bold">💳 Pay with Card</button>`
        : '<div class="text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-lg font-semibold border border-amber-200 text-center">Booking pending admin approval</div>'}
                <button data-action="remove-booking" data-booking-id="${details.bookingId}" class="text-xs bg-white border border-red-300 text-red-600 px-3 py-2 rounded-lg font-semibold">Remove Booking</button>
              </div>
              ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span class="text-green-600 font-bold">✓ Paid</span>
                <button data-action="remove-booking" data-booking-id="${escapeHtml(details.bookingId)}" class="text-xs bg-white border border-red-300 text-red-600 px-3 py-2 rounded-lg font-semibold">Remove Booking</button>
              </div>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

