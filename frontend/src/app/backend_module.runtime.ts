// @ts-nocheck
// Utility to get the best image for a room
// CRITICAL: Only match on title/name/category — NOT description.
// Also validates room.image against room title to reject mismatched saved images.
const getRoomImage = (room) => {
  // Match ONLY on title + name + category — NOT description
  const roomText = [room?.title, room?.name, room?.category]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ');

  // Detect which category the title belongs to
  const getExpectedCategory = (text) => {
    if (text.includes('kids') || text.includes('child') || (text.includes('oasis') && text.includes('kid'))) return 'kids';
    if (text.includes('suite') || text.includes('retreat') || text.includes('master')) return 'master';
    if (text.includes('guest')) return 'guest';
    if (text.includes('bedroom')) return 'bedroom';
    if (text.includes('kitchen') || text.includes('modular') || text.includes('chef') || text.includes('breakfast nook') || text.includes('gourmet')) return 'kitchen';
    if (text.includes('dining') || text.includes('bar') || text.includes('restaurant')) return 'dining';
    if (text.includes('terrace') || text.includes('rooftop')) return 'terrace';
    if (text.includes('balcony') || text.includes('skyline') || text.includes('deck')) return 'balcony';
    if (text.includes('garden') || text.includes('lawn') || text.includes('landscape')) return 'garden';
    if (text.includes('living') || text.includes('lounge') || text.includes('hall') || text.includes('foyer') || text.includes('entryway')) return 'living';
    if (text.includes('bathroom') || text.includes('washroom') || text.includes('toilet') || text.includes('bath') || text.includes('spa-inspired')) return 'bathroom';
    if (text.includes('spa') || text.includes('wellness')) return 'spa';
    if (text.includes('pooja') || text.includes('mandir') || text.includes('prayer') || text.includes('sanctum') || text.includes('zen')) return 'pooja';
    if (text.includes('wardrobe') || text.includes('closet') || text.includes('robe') || text.includes('dressing room')) return 'wardrobe';
    if (text.includes('office') || text.includes('study') || text.includes('workspace') || text.includes('reading') || text.includes('executive')) return 'office';
    if (text.includes('theatre') || text.includes('theater') || text.includes('cinema') || text.includes('immersive')) return 'theatre';
    if (text.includes('gym') || text.includes('fitness') || text.includes('workout')) return 'gym';
    if (text.includes('pool') || text.includes('swimming')) return 'pool';
    if (text.includes('nook')) return 'kitchen';
    if (text.includes('area')) return 'living';
    return 'unknown';
  };

  // Map expected category to image path
  const categoryToImage = {
    'kids':     '/category/Kids-bedroom/kids-bedroom1.jpg',
    'master':   '/category/Master Bedroom/master-bedroom1.jpg',
    'guest':    '/category/Guest room/guest room  (1).jpg',
    'bedroom':  '/category/Master Bedroom/master-bedroom1.jpg',
    'kitchen':  '/category/Kitchen/kitchen1.jpg',
    'dining':   '/category/Diningroom/dining-room1.jpg',
    'terrace':  '/category/Terrace/terrace (1).jpg',
    'balcony':  '/category/Balcony/balcony (1).jpg',
    'garden':   '/category/Garden/garden (1).jpg',
    'living':   '/category/Living room/living1.jpg',
    'bathroom': '/category/Bathroom/bathroom1.jpg',
    'spa':      '/category/Spa/spa room (1).jpg',
    'pooja':    '/category/Pooja room/pooja-room1.jpg',
    'wardrobe': '/category/wardrobe/wardrobe1.jpg',
    'office':   '/category/Office interior/office interior (1).jpg',
    'theatre':  '/category/Home theatre/home theatre (1).jpg',
    'gym':      '/category/Gym/gym (1).jpg',
    'pool':     '/category/Swimming pool/swimming pool.jpg',
    'unknown':  '/category/Living room/living1.jpg',
  };

  // Category markers present in image paths for cross-validation
  const categoryPathMarkers = {
    'kids':     ['kids-bedroom', 'kids bedroom'],
    'master':   ['master bedroom', 'master-bedroom'],
    'guest':    ['guest room'],
    'bedroom':  ['master bedroom', 'master-bedroom', 'kids-bedroom'],
    'kitchen':  ['kitchen'],
    'dining':   ['diningroom', 'dining-room', 'dining room'],
    'terrace':  ['terrace'],
    'balcony':  ['balcony'],
    'garden':   ['garden'],
    'living':   ['living room', 'living-room'],
    'bathroom': ['bathroom'],
    'spa':      ['spa room', 'spa-room'],
    'pooja':    ['pooja room', 'pooja-room'],
    'wardrobe': ['wardrobe'],
    'office':   ['office interior'],
    'theatre':  ['home theatre', 'home-theatre'],
    'gym':      ['gym'],
    'pool':     ['swimming pool'],
  };

  const expectedCategory = getExpectedCategory(roomText);

  // If a room.image is provided, validate it matches the expected category
  if (room?.image && typeof room.image === 'string' && room.image.trim() && !room.image.includes('unsplash.com') && !room.image.includes('/category/Custom/')) {
    const imgLower = room.image.toLowerCase();
    const markers = categoryPathMarkers[expectedCategory] || [];
    const imageMatchesCategory = markers.length === 0 || markers.some(m => imgLower.includes(m));
    if (imageMatchesCategory) {
      return room.image; // Image matches — use it
    }
    // Image does NOT match the room title — fall through to keyword-based resolution
  }

  // Keyword-based resolution (always correct, title-only matching)
  return categoryToImage[expectedCategory] || '/category/Living room/living1.jpg';
};
import '../index.css';
import Chart from 'chart.js/auto';
import { COLORS, SAMPLE_MODELS, SERVICES as INITIAL_SERVICES, COMPANY_INFO, PACKAGES, SERVICE_CATEGORIES, SHOWROOMS, INITIAL_SERVICE_SHOWCASES, featureImageMap } from '../constants';
import {
  DesignModel,
  AIRecommendation,
  RoomType,
  StyleType,
  Inquiry,
  SiteSettings,
  ServiceItem,
  User,
  Feedback,
  SiteTheme,
  Category,
  Booking,
  AIDesignRecord,
  ChatMessage,
  TabKey,
  RoomCategory,
  State,
  AdminState,
  CustomerState,
  UploadState,
  AIDesignVariant,
  LikeRecord,
  PortfolioContent,
  Announcement,
  Package,
  PackageRoom,
  CalculatorSettings,
  CalculationRecord
} from '../types';
import { getSmartDesignSuggestions } from '../services/smartService';
import { saveFile, getFileUrl, deleteFile } from '../services/storage';
import { LUXURY_HOUSE, LUXURY_APARTMENT, INTERIOR_DESIGN_VIDEOS, type LuxuryProperty } from '../services/luxuryShowcase';
import { renderAdminCustomerRow } from '../features/admin/index';
// 3D services removed - using 2D image generation instead

import { designElements, applyDesignVisualization } from '../services/designVisualizer';
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
} from '../services/dataStore';
import { getBotResponse, getQuickAction, createMessage } from '../services/chatbot';
import { createPhonePePayment, fetchPhonePeStatus } from '../services/paymentApi';
import { getCalculatorService } from '../services/calculatorService';
import type { CalculatorDesign, CalculatorConfig, CalcImageQuality } from '../features/price-calculator/types';

// Expose feature image map globally for modal rendering
(window as any).__featureImageMap = featureImageMap;



const API_BASE = '/api';

const apiFetch = (path: string, options: RequestInit = {}, timeoutMs = 12000) =>
  fetchWithTimeout(`${API_BASE}${path}`, options, timeoutMs);

const getPerfNow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const logPerf = (label: string, start: number) => {
  const elapsedMs = getPerfNow() - start;
  console.log(`â±ï¸ ${label}: ${elapsedMs.toFixed(1)}ms`);
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

  const username = String((state.currentUser as any)?.username || state.currentUser?.email || '').trim();
  const password = String((state.currentUser as any)?.password || '').trim();
  if (!username || !password) return false;

  try {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }, 3500);

    const data = await response.json().catch(() => ({} as any));
    if (!response.ok || !data?.success || !data?.token || String(data?.customer?.role || '').toLowerCase() !== 'admin') {
      return false;
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
    return false;
  }
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
  fallbackEmoji: string = 'ðŸ–¼ï¸'
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
// GLOBAL 3D CARD TILT â€” document-level delegation
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
        id: resolvePortfolioCategoryId({ categoryId: cat.id, category: cat.title || cat.name || '' }),
        image: cat.image ? normalizeAssetUrl(cat.image) : cat.image,
        background: cat.background ? normalizeAssetUrl(cat.background) : cat.background,
        thumbnail: cat.thumbnail ? normalizeAssetUrl(cat.thumbnail) : cat.thumbnail,
        images: Array.isArray(cat.images)
          ? cat.images.map((img: any) => ({ ...img, url: img?.url ? normalizeAssetUrl(img.url) : img?.url }))
          : cat.images
      }));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.customer.categories));
      console.log('âœ… Loaded categories from API:', state.customer.categories.length);
    }

    const designsPayload = designsResult.status === 'fulfilled' ? designsResult.value : null;
    const apiDesigns = Array.isArray(designsPayload)
      ? designsPayload
      : (Array.isArray((designsPayload as any)?.designs) ? (designsPayload as any).designs : null);

    if (Array.isArray(apiDesigns) && apiDesigns.length > 0) {
      const mappedDesigns = apiDesigns.map((design: any) => normalizeDesignMotion3D({
        ...design,
        categoryId: resolvePortfolioCategoryId({ categoryId: design.categoryId, category: design.category || design.category_title || '' }),
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
      console.log('âœ… Loaded designs from API:', mergedDesigns.length);
    }

    // Load packages from API
    const packagesPayload = packagesResult.status === 'fulfilled' ? packagesResult.value : null;
    const apiPackages = Array.isArray(packagesPayload)
      ? packagesPayload
      : (Array.isArray((packagesPayload as any)?.data) ? (packagesPayload as any).data : null);

    if (Array.isArray(apiPackages) && apiPackages.length > 0) {
      writeStorage(STORAGE_KEYS.packages, apiPackages);
      console.log('âœ… Loaded packages from API:', apiPackages.length);
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
      state.adminAccount = null;
    }
  } else {
    state.adminAccount = null;
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
        icon: String(service?.icon || 'ðŸ› ï¸'),
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
    icon: 'ðŸŽ¨',
    description: 'Photorealistic room concepts, zoning, and walkthrough-ready design proposals before execution.',
    video: '/videos/interior-video-1.mp4'
  },
  {
    id: 'svc-design-view',
    title: 'Design View',
    icon: 'ðŸ“',
    description: 'Material boards, elevation references, and side-by-side concept comparisons for confident approvals.',
    video: '/videos/interior-video-2.mp4'
  },
  {
    id: 'svc-turnkey-execution',
    title: 'Turnkey Execution',
    icon: 'ðŸ—ï¸',
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

    const serverDesigns = Array.isArray(designsData?.designs)
      ? designsData.designs.map((design: any) => ({
          ...design,
          categoryId: resolvePortfolioCategoryId({ categoryId: design.categoryId, category: design.category || design.category_title || '' })
        }))
      : null;
    const localDesigns = getDesigns();
    const rawDesigns: DesignModel[] = mergeDesignsPreferServer(localDesigns, serverDesigns);
    state.customer.designs = rawDesigns.map((design: DesignModel) => normalizeDesignMotion3D({
      ...design,
      previewImage: design.previewImage ? normalizeAssetUrl(design.previewImage) : design.previewImage,
      images: design.images ? design.images.map((img: string) => normalizeAssetUrl(img)) : design.images
    }));
    state.catalog = state.customer.designs.map((design: DesignModel) => normalizeDesignMotion3D({ ...design }));
    console.log(`âœ… Loaded ${state.customer.designs.length} designs`);

    const serverCategories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : null;
    const rawCategories: Category[] = serverCategories && serverCategories.length > 0 ? serverCategories : getCategories();
    state.customer.categories = rawCategories.map((category: Category) => normalizeCategoryMotion3D({
      ...category,
      id: resolvePortfolioCategoryId({ categoryId: category.id, category: category.title || category.name || '' }),
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
    console.log(`âœ… Loaded ${state.customer.categories.length} categories with total ${state.customer.categories.reduce((sum, cat) => sum + (cat.imageCount || 0), 0)} images`);

    // Update bookings from server if available
    if (bookingsData && Array.isArray(bookingsData.bookings)) {
      state.customer.bookings = filterBookingsForCurrentUser(bookingsData.bookings);
      console.log(`âœ… Loaded ${state.customer.bookings.length} bookings from server`);
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
      console.log(`âœ… Loaded ${loadedInquiries.length} inquiries`);
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
    console.log(`âœ… Loaded ${fallbackDesigns.length} fallback designs and ${fallbackCategories.length} fallback categories`);
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

  if (shouldRenderRefreshResult(options)) renderStabilized();

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
      state.customer.bookingMessage = 'âœ… Payment successful! Your booking is confirmed.';
      console.log('âœ… Payment verified and dashboards/charts/invoices refreshed');
    } else if (paymentStatus === 'failed') {
      state.customer.paymentError = 'Payment failed. Please try again.';
    }
  } catch (error) {
    state.customer.paymentError = error instanceof Error ? error.message : 'Payment verification failed.';
    console.error('âŒ Payment verification error:', error);
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
const PACKAGE_CACHE_RESET_VERSION = '2026-05-06-room-map-v7';

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
        <div class="w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg text-xl">â–¶</div>
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
          <button data-action="close-service-details" class="text-slate-400 hover:text-slate-600">âœ•</button>
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
                ${content.deliverables.map((item) => `<li>â€¢ ${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
            <div class="rounded-xl border border-black/10 bg-slate-50 p-4">
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Process</div>
              <ul class="space-y-2 text-sm text-slate-700">
                ${content.process.map((item) => `<li>â€¢ ${escapeHtml(item)}</li>`).join('')}
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
          <button type="button" data-action="close-service-showcase-details" class="text-slate-400 hover:text-slate-600">âœ•</button>
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
      if (!imageUrl) return '<div class="w-full h-full flex items-center justify-center text-2xl">ðŸ </div>';
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
  if (/offer|discount|sale|deal|price/.test(text)) return 'ðŸ’¸';
  if (/launch|new|introduc|opening/.test(text)) return 'ðŸš€';
  if (/festival|festive|celebrat|diwali|christmas|new year/.test(text)) return 'ðŸŽ‰';
  if (/maint|update|upgrade|service/.test(text)) return 'ðŸ› ï¸';
  if (/book|slot|appointment|consult/.test(text)) return 'ðŸ“…';
  if (/important|alert|urgent|notice/.test(text)) return 'âš ï¸';
  return 'ðŸ“¢';
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
            âœ•
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
        <button data-action="close-package-modal" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 text-slate-700 flex items-center justify-center text-xl font-bold shadow-lg hover:bg-white transition z-[120]">âœ•</button>

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
                <span class="text-sm text-slate-400 line-through">â‚¹${(pkg.originalPrice || 0).toLocaleString()}</span>
                <div class="text-3xl font-bold text-[color:var(--accent)]">â‚¹${(pkg.discountedPrice || 0).toLocaleString()}</div>
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
                          <div class="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] mb-1">âœ“</div>
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
          <button class="absolute top-6 right-6 text-white text-3xl font-light hover:rotate-90 transition duration-300">âœ•</button>
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
      '/category/Custom/custom_02.png',
      '/category/Kitchen/kitchen1.jpg',
      '/category/Kitchen/kitchen2.jpg',
      '/category/Kitchen/kitchen3.jpg',
      '/category/Kitchen/kitchen4.jpg',
      '/category/Kitchen/kitchen5.jpg'
    ],
    living: [
      '/category/Custom/custom_01.png',
      '/category/Living room/living1.jpg',
      '/category/Living room/living2.jpg',
      '/category/Living room/living3.jpg',
      '/category/Living room/living4.jpg',
      '/category/Living room/living5.jpg',
      '/category/Living room/living6.jpg'
    ],
    bedroom: [
      '/category/Custom/custom_03.png',
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
      '/category/Custom/custom_04.png',
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

    if (explicitCategoryOverride) {
      const overrideKey = normalizeFeatureText(explicitCategoryOverride);
      const overrideTokens = (categoryAliasTokens[overrideKey] || overrideKey.split(' ').filter(Boolean));
      if (overrideTokens.some((token) => token && normalized.includes(normalizeFeatureText(token)))) return true;
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
    'wardrobe': ['wardrobe', 'closet', 'dressing'],
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
    'terrace': 'Terrace Garden',
    'swimming pool': 'Swimming Pool',
    'garden': 'Terrace Garden',
    'balcony': 'Balcony Design',
    'wardrobe': 'Wardrobes',
    'living room': 'Grand Living',
    'kitchen': 'Modular Kitchen',
    'bathroom': 'Bathroom Vanity',
    'pooja room': 'Pooja Room',
    'gym': 'Home Gym',
    'home theatre': 'Home Theater',
    'villa': 'Swimming Pool',
    'apartment': 'Living + Dining',
    'meeting room': 'Meeting Room',
    'classroom': 'Classroom',
    'epoxy floor': 'Epoxy Floor',
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
      const retainExplicitConceptName = source.includes('package-feature') || source.includes('package-room-category');
      
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
      const living = allDesigns.find(d => String(d.category).toLowerCase().includes('living')) || { previewImage: '/category/Custom/custom_01.png', title: 'Grand Living', category: 'Living' };
      const kitchen = allDesigns.find(d => String(d.category).toLowerCase().includes('kitchen')) || { previewImage: '/category/Custom/custom_02.png', title: 'Modular Kitchen', category: 'Kitchen' };
      const bed = allDesigns.find(d => String(d.category).toLowerCase().includes('bed')) || { previewImage: '/category/Custom/custom_03.png', title: 'Master Bedroom', category: 'Bedroom' };
      const bath = allDesigns.find(d => String(d.category).toLowerCase().includes('bath')) || { previewImage: '/category/Bathroom/bathroom5.jpg', title: 'Luxe Bath', category: 'Bathroom' };
      const dining = allDesigns.find(d => String(d.category).toLowerCase().includes('dining')) || { previewImage: '/category/Custom/custom_01.png', title: 'Dining Space', category: 'Dining' };
      
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
    // Remove the strict override to 'living room' if the user explicitly clicked the category
    const categoryKey = requestedCategoryKey;
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
    // FINAL strict filter: Only allow designs whose category/categoryId matches the current category.
    let strictRelated = (state.calculator.relatedDesigns || []).filter((item: any) => {
      const itemText = normalizeFeatureText(`${String(item?.category || '')} ${String(item?.title || '')}`);
      const itemCategory = String(item?.category || item?.categoryId || '').toLowerCase();
      const effectiveCategoryKey = normalizeFeatureText(resultCategoryLabel).toLowerCase();
      const strictCategoryTokens = (categoryAliasTokens[categoryKey] || categoryKey.split(' ').filter(Boolean));
      // Accept if exact match, contains the category, or matches a known alias token for the selected category.
      return itemCategory === effectiveCategoryKey
        || itemCategory.includes(effectiveCategoryKey)
        || effectiveCategoryKey.includes(itemCategory)
        || strictCategoryTokens.some((token) => token && itemText.includes(normalizeFeatureText(token)));
    });
    // Limit to 4 related designs only
    strictRelated = strictRelated.slice(0, 4);
    state.calculator.relatedDesigns = strictRelated;
    // If nothing matches, show a single canonical fallback for this category only (never cross-category)
    if (strictRelated.length === 0) {
      state.calculator.relatedDesigns = [
        {
          id: `${categoryKey || 'category'}-strict-fallback-1`,
          title: canonicalFeature || resultCategoryLabel,
          category: resultCategoryLabel,
          style: 'Curated',
          previewImage: canonicalImage || '',
          source: 'category-strict-fallback'
        }
      ];
    }
  }

  // Always limit to 4 related designs after all apartment/villa/quality logic as well
  // Apartment category remapping removed: always use strict category match for all home types
  // This ensures only designs/images from the exact selected category are shown for every category and quality.


  if (isFullHome && recommendationHomeType === 'villa') {
    state.calculator.relatedDesigns = buildVillaQualityConcepts(state.calculator.relatedDesigns || []).slice(0, 4);
  } else {
    state.calculator.relatedDesigns = applyQualityConceptsForNonVilla(state.calculator.relatedDesigns || []).slice(0, 4);
  }

  state.calculator.relatedDesigns = ensureUniqueRelatedImages(
    (state.calculator.relatedDesigns || []).slice(0, 4),
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

let renderRequested = false;

const isPerfDebugEnabled = () => {
  try {
    if (typeof window === 'undefined') return false;
    const search = window.location?.search || '';
    if (/([?&])perf=1(&|$)/.test(search)) return true;
    const fromStorage = localStorage.getItem('ar_perf_debug');
    return fromStorage === '1' || String(fromStorage).toLowerCase() === 'true';
  } catch {
    return false;
  }
};

const perfNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function'
  ? performance.now()
  : Date.now());

const logPerfMetric = (label: string, durationMs: number, meta?: Record<string, any>) => {
  if (!isPerfDebugEnabled()) return;
  const rounded = Math.round(durationMs * 10) / 10;
  const payload = meta && Object.keys(meta).length > 0 ? meta : undefined;
  if (payload) {
    console.log(`[perf] ${label}: ${rounded}ms`, payload);
  } else {
    console.log(`[perf] ${label}: ${rounded}ms`);
  }
};

const render = () => {
  if (renderRequested) return;
  renderRequested = true;
  requestAnimationFrame(() => {
    const startedAt = perfNow();
    renderInternal();
    const endedAt = perfNow();
    const duration = endedAt - startedAt;
    if (duration >= 12) {
      logPerfMetric('renderInternal', duration, {
        activeTab: state.activeTab,
        adminTab: state.activeTab === 'admin' ? 'yes' : 'no'
      });
    }
    renderRequested = false;
  });
};

const renderInternal = () => {
  setThemeVars();
  // 2D rendering - no cleanup needed
  let content = '';
  if (state.activeTab === 'categories') {
    if (typeof renderCategoryGallery === 'function') {
      content = renderCategoryGallery();
    } else {
      content = '<div class="p-8 text-center text-red-600">Categories page is under construction or missing renderCategoryGallery implementation.</div>';
    }
    content += renderVideoModal() + renderPackageModal() + renderPriceCalculatorModal() + renderServiceDetailsModal() + renderServiceShowcaseDetailsModal();
  } else {
    content = renderLayout() + renderVideoModal() + renderPackageModal() + renderPriceCalculatorModal() + renderServiceDetailsModal() + renderServiceShowcaseDetailsModal();
  }
  root.innerHTML = normalizeTemplateMarkup(content);
  scheduleConfirmMessageDismiss();
  schedulePaymentSuccessDismiss();
  scheduleAuto3DMotion();
  initGlobal3DMotion();
  if (state.activeTab === 'home') {
    initSpideyHome();
  }



  // Bind model viewers where 3D + fallback rendering exists
  if (state.activeTab === 'gallery') {
    // Defer binding to avoid blocking UI render
    requestAnimationFrame(() => {
      void ensureModelViewerLoaded()
        .catch(() => {
          // Keep image fallback active if model-viewer fails to load.
        })
        .finally(() => {
          bindModelViewers();
        });
    });
  }

  // Initialize 3D viewers for Design Studio
  if (state.activeTab === 'ai-studio' && (state.currentUser?.role === 'customer' || state.currentUser?.role === 'admin')) {
    requestAnimationFrame(() => {
      init3DViewers();
    });
  }

  if (state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
    runWhenBrowserIdle(() => {
      initAdminChartsWhenVisible();
      startAdminChartsAutoRefresh();
      scheduleAdminChartsRetry();
    }, 700);
    if (state.admin.focusSection) {
      const target = document.getElementById(`admin-${state.admin.focusSection}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      state.admin.focusSection = undefined;
    }
  } else {
    // Cleanup is now handled in navigateTo
  }

  // Initialize Portfolio Charts
  if (state.activeTab === 'portfolio') {
    runWhenBrowserIdle(() => {
      void initPortfolioCharts();
    }, 700);
  } else {
    cleanupPortfolioCharts();
  }

  // Removed inline fake payment handlers



  const imagePreviewOverlay = document.getElementById('image-preview-overlay');
  if (imagePreviewOverlay && imagePreviewOverlay.getAttribute('data-bound-overlay') !== '1') {
    imagePreviewOverlay.setAttribute('data-bound-overlay', '1');
    imagePreviewOverlay.addEventListener('click', (event) => {
      if (event.target !== imagePreviewOverlay) return;
      state.customer.imagePreview = null;
      render();
    });
  }



  const previewDialog = document.querySelector('.spidey-preview-dialog') as HTMLDialogElement | null;
  if (previewDialog && previewDialog.getAttribute('data-bound-dialog') !== '1') {
    previewDialog.setAttribute('data-bound-dialog', '1');
    previewDialog.addEventListener('click', (event) => {
      if (event.target !== previewDialog) return;
      state.customer.imagePreview = null;
      render();
    });
    previewDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      state.customer.imagePreview = null;
      render();
    });
  }

  const adminDialog = document.querySelector('.spidey-dialog') as HTMLDialogElement | null;
  if (adminDialog && adminDialog.getAttribute('data-bound-admin-dialog') !== '1') {
    adminDialog.setAttribute('data-bound-admin-dialog', '1');
    adminDialog.addEventListener('click', (event) => {
      if (event.target !== adminDialog) return;
      (state.admin as any).designEditOpen = false;
      render();
    });
    adminDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      (state.admin as any).designEditOpen = false;
      render();
    });
  }

  const videoModal = document.getElementById('video-modal');
  if (videoModal && videoModal.getAttribute('data-bound-video-modal') !== '1') {
    videoModal.setAttribute('data-bound-video-modal', '1');

    const closeButtons = videoModal.querySelectorAll('[data-action="close-video"]');
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        state.videoModalOpen = false;
        state.currentVideos = [];
        state.currentVideoUrl = '';
        render();
      });
    });

    videoModal.addEventListener('click', (event) => {
      if (event.target !== videoModal) return;
      state.videoModalOpen = false;
      state.currentVideos = [];
      state.currentVideoUrl = '';
      render();
    });
  }

  // Setup file input handlers for upload modal
  const fileInputs = document.querySelectorAll('[data-file-input]');
  fileInputs.forEach((input) => {
    const fileInput = input as HTMLInputElement;
    if (fileInput.getAttribute('data-bound-file-input') === '1') return;
    fileInput.setAttribute('data-bound-file-input', '1');
    const inputName = fileInput.getAttribute('data-file-input');

    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      const fileNameDisplay = document.querySelector(`[data-file-name="${inputName}"]`);

      if (fileNameDisplay) {
        if (files && files.length > 0) {
          const file = files[0];
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          fileNameDisplay.textContent = `âœ“ ${file.name} (${sizeMB} MB)`;
          fileNameDisplay.classList.remove('text-slate-600');
          fileNameDisplay.classList.add('text-green-600');

          // If it's an image file, show preview
          if (inputName === 'img' && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              state.upload.newModel.previewImage = reader.result as string;
              render();
            };
            reader.readAsDataURL(file);
          }
        } else {
          fileNameDisplay.textContent = 'No file chosen';
          fileNameDisplay.classList.add('text-slate-600');
          fileNameDisplay.classList.remove('text-green-600');
          if (inputName === 'img') {
            state.upload.newModel.previewImage = '';
          }
        }
      }
    });
  });
};

const renderLayout = () => {
  const navItems = renderNavItems();
  const user = state.currentUser;
  const unreadCount = getUnreadCount();
  const imagePreview = state.customer.imagePreview;
  const isHome = state.activeTab === 'home';

  return `
    <div class="min-h-screen spidey-theme ${isHome ? 'bg-spidey' : 'bg-aurora'} text-slate-900">
      ${isHome
      ? ''
      : `
      <header class="fixed top-0 left-0 right-0 z-50 spidey-shell">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button data-action="nav" data-tab="home" class="flex items-center gap-3 spidey-shell-brand">
            <span class="w-9 h-9 rounded-xl bg-[color:var(--accent)] text-white font-bold flex items-center justify-center">A</span>
            <span class="text-lg md:text-xl font-display font-bold tracking-[0.3em] text-white uppercase">AR Interia</span>
          </button>
          <nav class="hidden lg:flex items-center gap-6">
            ${navItems
        .map(
          (item) => `
              <button
                data-action="nav"
                data-tab="${item.id}"
                class="spidey-nav-btn ${state.activeTab === item.id ? 'active' : ''}"
              >
                ${item.label}
                ${item.id === 'admin' && unreadCount > 0 ? '<span class="ml-1 inline-block h-2 w-2 rounded-full bg-red-500"></span>' : ''}
              </button>`
        )
        .join('')}
            <button data-action="open-calculator" class="px-4 py-2 rounded-full bg-amber-400 text-slate-900 font-bold text-xs hover:bg-amber-500 transition shadow-lg active:scale-95">Price Calculator</button>
          </nav>
          <div class="flex items-center gap-3">
            ${user
        ? `
              <div class="hidden md:flex flex-col items-end">
                <span class="text-xs font-bold text-white">${escapeHtml(user.name)}</span>
                <span class="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold">${user.role}</span>
              </div>
              <button data-action="logout" class="spidey-shell-cta">Logout</button>
            `
        : `
              <button data-action="nav" data-tab="login" class="hidden md:inline-flex items-center gap-2 px-4 py-2 border-2 border-white/30 text-sm font-bold rounded-full text-white">
                Sign In
              </button>
            `
      }
            <button data-action="toggle-menu" class="md:hidden p-2 text-white">
              ${state.mobileMenuOpen ? 'âœ•' : 'â˜°'}
            </button>
          </div>
        </div>
      </header>

      ${state.mobileMenuOpen
        ? `
      <div class="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden">
        <div class="flex flex-col gap-6">
          ${navItems
          .map(
            (item) => `
            <button data-action="nav" data-tab="${item.id}" class="flex items-center justify-between text-xl font-bold text-[color:var(--primary)]">
              <span>${item.label}</span>
              ${item.id === 'admin' && unreadCount > 0 ? '<span class="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full">New</span>' : ''}
            </button>
          `
          )
          .join('')}
          ${!user
          ? '<button data-action="nav" data-tab="login" class="text-xl font-bold text-[color:var(--accent)]">Sign In</button>'
          : ''
        }
          <button data-action="open-calculator" class="flex items-center justify-between text-xl font-bold text-amber-500 mt-2">
            <span>Price Calculator</span>
            <i class="ri-calculator-line"></i>
          </button>
        </div>
      </div>
      `
        : ''
      }
      `
    }

      <main class="${isHome ? 'pt-0' : 'pt-28'}">
        ${renderMain()}
      </main>

      ${imagePreview ? `
        <div id="image-preview-overlay" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <button data-action="close-image-preview" class="absolute top-6 right-6 md:top-10 md:right-10 z-[60] text-white hover:text-amber-400 text-3xl md:text-5xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 border border-white/20 hover:scale-110 transition-all cursor-pointer shadow-2xl backdrop-blur-md">âœ•</button>
          <div class="bg-white rounded-3xl overflow-hidden w-full max-w-5xl my-auto relative shadow-2xl">
            <div class="flex items-center justify-between px-6 py-4 border-b border-black/5">
              <div>
                <div class="text-xs uppercase tracking-[0.3em] text-slate-400">${escapeHtml(imagePreview.categoryName || 'Category')}</div>
                <div class="text-xl font-semibold text-[color:var(--primary)]">${escapeHtml(imagePreview.name)}</div>
              </div>
              <button data-action="close-image-preview" class="text-slate-400 hover:text-slate-600 text-2xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition">âœ•</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] max-h-[calc(90vh-120px)]">
              <div id="preview-image-container" data-action="open-3d-view-image" data-image-url="${escapeHtml(imagePreview.url)}" class="bg-slate-100 flex items-center justify-center min-h-[300px] md:min-h-[400px] max-h-[600px] overflow-hidden cursor-pointer" style="perspective: 1000px;">
                <div id="preview-3d-wrapper" class="w-full h-full transition-transform duration-200" style="transform-style: preserve-3d; will-change: transform;">
                  <img src="${escapeHtml(imagePreview.url)}" alt="${escapeHtml(imagePreview.name)}" class="motion-3d w-full h-full object-contain" data-motion3d="true" />
                </div>
              </div>
              <div class="p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
                <div class="space-y-4">
                  <div>
                    <div class="text-sm text-slate-500 mb-1">Design Name</div>
                    <div class="text-lg font-semibold text-[color:var(--primary)]">${escapeHtml(imagePreview.name)}</div>
                  </div>
                  ${imagePreview.cost != null ? `
                  <div>
                    <div class="text-sm text-slate-500 mb-1">Cost</div>
                    <div class="text-2xl font-bold text-[color:var(--accent)]">${formatCurrency(imagePreview.cost)}</div>
                  </div>` : ''}
                </div>
                <div class="space-y-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-1">
                  ${(imagePreview as any).isAIStudio && imagePreview.designId ? `
                    <button data-action="book-ai-design" data-design-id="${escapeHtml(imagePreview.designId)}" data-design-name="${escapeHtml(imagePreview.name)}" data-design-price="${imagePreview.cost || 0}" data-design-category="${escapeHtml(imagePreview.categoryName || '')}" class="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-sm transition">Book This Design</button>
                  ` : `
                    <button data-action="preview-book" data-design-id="${escapeHtml(imagePreview.designId || '')}" class="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-sm transition">Book Now</button>
                  `}
                  <button data-action="close-image-preview" class="w-full py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold hover:bg-slate-50 shadow-sm transition">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      ${renderPortfolioDialog()}


      <footer class="mt-16 spidey-footer text-white">
        <div class="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            <h3 class="text-2xl font-display font-bold mb-4">AR Interia</h3>
            <p class="text-white/70 max-w-md">Bringing premium craftsmanship into the modern digital era with high-fidelity AR experiences and AI design intelligence.</p>
          </div>
          <div>
            <h4 class="font-bold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-white/70 text-sm">
              <li><button data-action="nav" data-tab="home" class="hover:text-[color:var(--accent)]">Home</button></li>
              <li><button data-action="nav" data-tab="gallery" class="hover:text-[color:var(--accent)]">Gallery</button></li>
              <li><button data-action="nav" data-tab="services" class="hover:text-[color:var(--accent)]">Services</button></li>
              <li><button data-action="nav" data-tab="showroom" class="hover:text-[color:var(--accent)]">Luxury Showroom</button></li>
              <li><button data-action="nav" data-tab="contact" class="hover:text-[color:var(--accent)]">Contact Us</button></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Contact</h4>
            <ul class="space-y-2 text-white/70 text-sm">
              <li>${escapeHtml(state.siteSettings.contactEmail)}</li>
              <li>${escapeHtml(state.siteSettings.contactPhone)}</li>
              <li>${escapeHtml(state.siteSettings.contactAddress)}</li>
            </ul>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 py-6 border-t border-white/10 text-center text-xs text-white/50">
          Â© 2026 AR Interia Interiors. All rights reserved.
        </div>
      </footer>

      ${state.confirmMessage ? `
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce-up">
          <div class="bg-[color:var(--primary)] text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
            <span class="text-xl">âœ¨</span>
            <span class="font-semibold text-sm">${escapeHtml(state.confirmMessage)}</span>
            <button data-action="close-confirm" class="ml-4 text-white/60 hover:text-white transition">âœ•</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

const loadExternalScript = (src: string) => {
  const existing = (window as any).__spideyScripts || {};
  if (existing[src]) return existing[src] as Promise<void>;
  const promise = new Promise<void>((resolve, reject) => {
    const prior = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (prior && prior.dataset.loaded === 'true') {
      resolve();
      return;
    }
    const script = prior || document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.loaded = 'false';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    if (!prior) document.body.appendChild(script);
  });
  (window as any).__spideyScripts = { ...existing, [src]: promise };
  return promise;
};

const initSpideyHome = () => {
  const container = document.querySelector('.spidey-home') as HTMLElement | null;
  if (!container) return;
  const initToken = Date.now();
  (window as any).__spideyHomeInitToken = initToken;
  Promise.all([
    loadExternalScript('https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js'),
    loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')
  ])
    .then(() => {
      if ((window as any).__spideyHomeInitToken !== initToken || !container.isConnected) return;

      const Swiper = (window as any).Swiper;
      const gsap = (window as any).gsap;
      const thumbsEl = container.querySelector('.spidey-thumbs') as HTMLElement | null;
      const mainEl = container.querySelector('.spidey-main-slider') as HTMLElement | null;
      const nextButtonEl = container.querySelector('.swiper-button-next') as HTMLElement | null;
      const prevButtonEl = container.querySelector('.swiper-button-prev') as HTMLElement | null;
      if (!Swiper || !thumbsEl || !mainEl) return;

      if ((window as any).__spideyThumbs) {
        try {
          (window as any).__spideyThumbs.destroy(true, true);
        } catch (err) {
          console.warn('Failed to destroy thumbs swiper', err);
        }
      }
      if ((window as any).__spideyMain) {
        try {
          (window as any).__spideyMain.destroy(true, true);
        } catch (err) {
          console.warn('Failed to destroy main swiper', err);
        }
      }

      const thumbs = new Swiper(thumbsEl, {
        centeredSlidesBounds: true,
        slidesPerView: 2,
        direction: 'horizontal',
        slideToClickedSlide: true,
        watchOverflow: true,
        watchSlidesProgress: true,
        spaceBetween: 20,
        speed: 1200,
        observer: true,
        observeParents: true
      });

      const slider = new Swiper(mainEl, {
        spaceBetween: 1000,
        initialSlide: 0,
        loop: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
          reverseDirection: false
        },
        navigation: {
          nextEl: nextButtonEl,
          prevEl: prevButtonEl
        },
        effect: 'coverflow',
        speed: 1800,
        observer: true,
        observeParents: true,
        thumbs: {
          swiper: thumbs
        },
        allowTouchMove: true,
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true
        }
      });

      (window as any).__spideyThumbs = thumbs;
      (window as any).__spideyMain = slider;

      if (gsap) {
        const headingEls = Array.from(container.querySelectorAll('.spidey-text h2'));
        const paragraphEls = Array.from(container.querySelectorAll('.spidey-text p'));
        const thumbSlideEls = Array.from(container.querySelectorAll('.spidey-thumbs .swiper-slide'));

        if (headingEls.length > 0) {
          gsap.from(headingEls, {
            y: 10,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            delay: 0.6
          });
        }

        if (paragraphEls.length > 0) {
          gsap.from(paragraphEls, {
            y: 10,
            opacity: 0,
            duration: 0.8,
            delay: 0.9
          });
        }

        if (thumbSlideEls.length > 0) {
          gsap.from(thumbSlideEls, {
            x: 300,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            delay: 0.8
          });
        }
      }
    })
    .catch((err) => {
      console.warn('Spidey home scripts failed to load', err);
    });
};

const renderMain = () => {
  switch (state.activeTab) {
    case 'home':
      return renderHome();
    case 'gallery':
      return renderGallery();
    case 'categories':
      return renderCategoryGallery();
    case 'portfolio':
      return renderPortfolio();
    case 'services':
      return renderServices();
    case 'showroom':
      return renderShowroom();
    case 'contact':
      return renderContact();
    case 'login':
      return renderLogin();
    case 'ai-studio':
      if (state.currentUser?.role === 'customer' || state.currentUser?.role === 'admin') return renderAiStudio();
      // If not logged in, show login page and message
      return `
        <div class="py-12 text-center">
          <h2 class="text-2xl font-display font-bold text-[color:var(--primary)] mb-2">Sign in Required</h2>
          <p class="text-base text-slate-600 mb-6">To use <span class="font-semibold text-[color:var(--primary)]">Design Studio</span>, you need to log in.</p>
          <div class="max-w-md mx-auto">${renderLogin()}</div>
        </div>
      `;
    case 'admin':
      if (state.currentUser?.role === 'admin') return renderAdmin();
      return renderAccessDenied('Admin access only.');
    case 'dashboard':
      try {
        if (state.currentUser?.role === 'customer') return renderCustomerDashboard();
        return renderAccessDenied('Sign in to access your dashboard.');
      } catch (err) {
        console.error('Dashboard render error:', err);
        return `<div class="py-20 text-center"> <h2 class="text-2xl font-display font-bold text-[color:var(--primary)]">An error occurred while loading the dashboard.</h2><p class="text-sm text-slate-500 mt-2">Please try again or contact support.</p></div>`;
      }
    default:
      return renderHome();
  }
};

const normalizeTemplateMarkup = (markup: string) => {
  return markup
    .replace(/<\s+([a-zA-Z/])/g, '<$1')
    .replace(/<\/\s+([a-zA-Z])/g, '</$1')
    .replace(/\s+>/g, '>')
    .replace(/\bdata\s*-\s*([a-zA-Z0-9_-]+)\s*=/g, 'data-$1=');
};

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


const renderHome = () => {
  const navItems = renderNavItems();
  const homeCategoriesRaw = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const homeCategories = getCustomerVisibleCategories(homeCategoriesRaw);
  const featuredImages = homeCategories
    .flatMap((cat) => (cat.images || []).map((img, index) => ({
      url: img.url,
      name: img.name,
      categoryId: cat.id,
      categoryName: cat.title || cat.name || cat.id,
      index
    })))
    .slice(0, 16);
  const workspaceImages = homeCategories
    .flatMap((cat) => (cat.images || []).map((img, index) => ({
      url: img.url,
      name: img.name,
      categoryId: cat.id,
      categoryName: cat.title || cat.name || cat.id,
      index
    })))
    .slice(6, 16);
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
                 <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" class="w-full h-full object-cover motion-3d cursor-pointer" data-motion3d="true" onerror="this.onerror=null;this.src='/category/Living room/living1.jpg';" />
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
                <div class="h-48 overflow-hidden bg-slate-100">
                  <div class="absolute inset-0 w-full h-full">
                    <img src="${escapeHtml(getPackageBackgroundImage(pkg))}" alt="${escapeHtml(pkg.name)} background" class="w-full h-full object-cover opacity-60" style="z-index:1;" onerror="this.src='/category/Living room/living1.jpg'" />
                    <img src="${escapeHtml(getPackageDisplayImage(pkg))}" alt="${escapeHtml(pkg.name)}" class="w-2/3 h-2/3 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="z-index:2;" loading="lazy" onerror="this.src='/category/Living room/living1.jpg'" />
                  </div>
                </div>
                <div class="p-4 space-y-3">
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">${escapeHtml(pkg.category || 'Package')}</div>
                  <h3 class="text-lg font-semibold text-[color:var(--primary)]">${escapeHtml(pkg.name)}</h3>
                  <p class="text-sm text-slate-600 line-clamp-2">${escapeHtml(pkg.description)}</p>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xs text-slate-400 line-through">â‚¹${(pkg.originalPrice || 0).toLocaleString()}</span>
                      <div class="text-lg font-bold text-[color:var(--accent)]">â‚¹${(pkg.discountedPrice || 0).toLocaleString()}</div>
                    </div>
                    <button data-action="quote-package" data-package="${pkg.id}" data-package-name="${escapeHtml(pkg.name)}" class="px-4 py-2 rounded-xl bg-[color:var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition">Get Quote</button>
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
      
    // If still no images after all fallbacks, grab from any available category
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

const renderShowroom = () => {
  const propertyType = state.showroomPropertyType || 'house';
  const luxuryStore = getLuxuryShowroomStore();
  const currentProperty = propertyType === 'house' ? luxuryStore.house : luxuryStore.apartment;
  const selectedRoomId = state.selectedShowroomRoom || currentProperty.rooms[0]?.id;
  const selectedRoom = currentProperty.rooms.find((r) => r.id === selectedRoomId) || currentProperty.rooms[0];
  const isLoggedIn = Boolean(state.currentUser);

  // Room type emoji helper
  const roomEmoji = (type: string) => {
    const em: Record<string, string> = {
      'master-bedroom': 'ðŸ‘‘', 'kids': 'ðŸŽ¨', 'kitchen': 'ðŸ‘¨â€ðŸ³', 'living': 'ðŸ›‹ï¸',
      'dining': 'ðŸ½ï¸', 'bathroom': 'ðŸš¿', 'gym': 'ðŸ’ª', 'theatre': 'ðŸŽ¬',
      'pooja': 'ðŸ™', 'garden': 'ðŸŒ¿', 'terrace': 'â›±ï¸', 'balcony': 'ðŸŒ…',
      'bedroom': 'ðŸ›ï¸', 'office': 'ðŸ’¼'
    };
    return em[type] || 'ðŸ“';
  };

  // Load explicit related designs assigned to this room
  const allDesigns = getCustomerDesignPool();
  const allCategories = getCustomerVisibleCategories(state.customer.categories && state.customer.categories.length > 0 ? state.customer.categories : getCategories());
  const displayImages = getShowroomDisplayImages(selectedRoom, allDesigns, allCategories);

  // Quote/Book button: redirect to login if not logged in
  const quoteBtn = (label: string, action: string, extra = '') =>
    isLoggedIn
      ? `<button data-action="${action}" ${extra} class="showroom-btn-primary">${label}</button>`
      : `<button data-action="nav" data-tab="login" class="showroom-btn-primary">${label}</button>`;

  const bookBtn = (label: string, action: string, extra = '') =>
    isLoggedIn
      ? `<button data-action="${action}" ${extra} class="showroom-btn-secondary">${label}</button>`
      : `<button data-action="nav" data-tab="login" class="showroom-btn-secondary">${label}</button>`;

  return `
    <style>
      .showroom-page { background: #0b0b14; min-height: 100vh; color: white; }
      .showroom-room-btn {
        display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px;
        border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer; transition: all 0.2s; text-align: left;
      }
      .showroom-room-btn:hover { background: rgba(255,255,255,0.08); color: white; }
      .showroom-room-btn.active { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.5); color: #fbbf24; }
      .showroom-video-card {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px; overflow: hidden; padding: 24px;
      }
      .showroom-video-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
      .showroom-video-frame {
        position: relative; width: 100%; padding-bottom: 56.25%; background: #111827;
        border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);
      }
      .showroom-video-frame iframe, .showroom-video-frame img {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 16px; object-fit: cover;
      }
      .showroom-design-card {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; overflow: hidden; transition: transform 0.2s;
      }
      .showroom-design-card:hover { transform: translateY(-4px); }
      .showroom-design-img-wrap { position: relative; height: 180px; overflow: hidden; }
      .showroom-design-overlay {
        position: absolute; inset: 0; background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;
      }
      .showroom-design-card:hover .showroom-design-overlay { opacity: 1; }
      .showroom-design-body { padding: 14px; }
      .showroom-overlay-btn {
        padding: 8px 16px; background: rgba(255,255,255,0.9); color: #111;
        border-radius: 8px; font-weight: 700; font-size: 13px; border: none; cursor: pointer;
      }
      .showroom-card-btn {
        padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.2s;
      }
      .showroom-card-btn.primary { background: #f59e0b; color: #000; }
      .showroom-card-btn.secondary { background: rgba(255,255,255,0.1); color: white; }
      .showroom-btn-primary {
        padding: 10px 22px; background: #f59e0b; color: #000;
        border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: opacity 0.2s;
      }
      .showroom-btn-primary:hover { opacity: 0.85; }
      .showroom-btn-secondary {
        padding: 10px 22px; background: rgba(255,255,255,0.1); color: white;
        border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); transition: opacity 0.2s;
      }
      .showroom-cta-banner {
        margin-top: 40px; padding: 40px; text-align: center;
        background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(245,158,11,0.1));
        border: 1px solid rgba(124,58,237,0.3); border-radius: 20px;
      }
      .showroom-cta-btn-primary {
        padding: 14px 28px; background: linear-gradient(135deg, #7c3aed, #f59e0b);
        color: white; border-radius: 12px; font-weight: 700; font-size: 15px; border: none; cursor: pointer;
      }
      .showroom-cta-btn-outline {
        padding: 14px 28px; background: transparent; color: white;
        border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;
      }
      .showroom-video-thumb {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; padding: 12px; cursor: pointer; transition: all 0.2s; display: block; width: 100%;
      }
      .showroom-video-thumb:hover { background: rgba(255,255,255,0.08); }
    </style>
    <div class="showroom-page" style="background:#0b0b14;min-height:100vh;">
      <!-- Hero banner -->
      <section class="relative pt-28 pb-16 px-6 text-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-[#0b0b14] pointer-events-none"></div>
        <div class="relative z-10 max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-500/40 bg-purple-500/10 backdrop-blur mb-6 text-sm font-bold text-purple-300 uppercase tracking-widest">
            âœ¨ Luxury Showroom
          </div>
          <h1 class="text-5xl md:text-7xl font-display font-bold text-white mb-5 leading-tight">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400">Immersive</span>
            Spaces
          </h1>
          <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Explore every room with real video walkthroughs, curated designs, and instant quotes.
          </p>
          <!-- Property type selector -->
          <div class="inline-flex rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-1.5 gap-1">
            <button data-action="select-property" data-property="house"
              class="px-7 py-3 rounded-xl font-bold text-sm transition-all ${propertyType === 'house' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/70 hover:text-white'}">
              ðŸ¡ Luxury Villa
            </button>
            <button data-action="select-property" data-property="apartment"
              class="px-7 py-3 rounded-xl font-bold text-sm transition-all ${propertyType === 'apartment' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/70 hover:text-white'}">
              ðŸ¢ Penthouse Apt
            </button>
          </div>
        </div>
      </section>

      <!-- Main Showroom Layout -->
      <section class="max-w-7xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        <!-- Room List Sidebar -->
        <aside class="flex flex-col gap-2">
          <div class="text-xs uppercase tracking-widest text-slate-500 font-bold px-2 mb-2">Rooms & Spaces</div>
          ${currentProperty.rooms.map((room) => `
            <button
              data-action="select-showroom-room"
              data-room-id="${escapeHtml(room.id)}"
              class="showroom-room-btn ${selectedRoomId === room.id ? 'active' : ''}"
            >
              <span class="text-2xl">${roomEmoji(room.type)}</span>
              <div class="text-left">
                <div class="font-semibold text-sm">${escapeHtml(room.name)}</div>
                ${room.name.toLowerCase() !== room.type.toLowerCase() && room.type.toLowerCase() !== 'master bedroom' && room.name.toLowerCase() !== 'master bedroom' ? `<div class="text-xs opacity-60">${escapeHtml(room.type)}</div>` : ''}
              </div>
            </button>
          `).join('')}
        </aside>

        <!-- Main Content -->
        <main class="flex flex-col gap-8">
          ${selectedRoom ? `

          <!-- ===== VIDEO SECTION ===== -->
          <div class="showroom-video-card">
            <div class="showroom-video-header">
              <div>
                <div class="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">${escapeHtml(selectedRoom.type)}</div>
                <h2 class="text-3xl font-display font-bold text-white">${escapeHtml(selectedRoom.name)}</h2>
                <p class="text-slate-400 mt-2 text-sm max-w-xl">${escapeHtml(selectedRoom.description)}</p>
              </div>
              <div class="flex gap-3 flex-wrap">
                ${quoteBtn('ðŸ’¬ Get Quote', 'nav', `data-tab="contact"`)}
                ${bookBtn('ðŸ“… Book Design', 'nav', `data-tab="contact"`)}
              </div>
            </div>

            <!-- Video embed -->
            ${selectedRoom.video3d ? (
        (selectedRoom.video3d.includes('youtube.com') || selectedRoom.video3d.includes('youtu.be')) ? `
              <div class="showroom-video-frame" id="showroom-video-container-${escapeHtml(selectedRoom.id)}">
                <!-- Poster/thumbnail shown before play -->
                <div class="showroom-video-poster" id="showroom-poster-${escapeHtml(selectedRoom.id)}"
                  style="position:absolute;inset:0;cursor:pointer;border-radius:16px;overflow:hidden;"
                  data-action="play-showroom-video"
                  data-room-id="${escapeHtml(selectedRoom.id)}"
                  data-video-url="${escapeHtml(selectedRoom.video3d || '')}"
                >
                  <img src="${escapeHtml(selectedRoom.imageUrl)}" alt="${escapeHtml(selectedRoom.name)}"
                    class="motion-3d" data-motion3d="true" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />
                  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;">
                    <div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,0.4);margin-bottom:12px;">
                      <span style="font-size:28px;margin-left:4px;">â–¶</span>
                    </div>
                    <span style="color:white;font-size:14px;font-weight:700;letter-spacing:0.05em;text-shadow:0 2px 8px rgba(0,0,0,0.8);">â–¶ Play Room Tour</span>
                  </div>
                </div>
              </div>
              ` : `
              <div class="showroom-video-frame">
                <video
                  src="${escapeHtml(selectedRoom.video3d)}"
                  poster="${escapeHtml(selectedRoom.imageUrl)}"
                  title="${escapeHtml(selectedRoom.name)} â€” Interior Video Tour"
                  style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;background:black;"
                  controls
                  playsinline
                  preload="metadata"
                ></video>
              </div>
              `
      ) : `
            <div class="showroom-video-frame overflow-hidden">
              <img src="${escapeHtml(selectedRoom.imageUrl)}" alt="${escapeHtml(selectedRoom.name)}" class="motion-3d" data-motion3d="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;" />
            </div>
            `}
          </div>

          <!-- ===== DESIGNS SECTION ===== -->
          <div>
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-xl font-bold text-white">
                ðŸ–¼ï¸ Related Designs â€” <span class="text-amber-400">${escapeHtml(selectedRoom.name)}</span>
              </h3>
              ${!isLoggedIn ? `<span class="text-xs text-slate-500 italic">Sign in to quote or book</span>` : ''}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              ${displayImages.length > 0 ? displayImages.map((img) => `
                <div class="showroom-design-card group">
                  <div class="showroom-design-img-wrap overflow-hidden">
                    <img
                      src="${escapeHtml(img.url)}"
                      alt="${escapeHtml(img.name)}"
                      class="motion-3d w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                      data-motion3d="true"
                      loading="lazy"
                    />
                    <div class="showroom-design-overlay">
                      <button
                        data-action="open-3d-room"
                        data-image-url="${escapeHtml(img.url)}"
                        data-room-name="${escapeHtml(img.name)}"
                        class="showroom-overlay-btn"
                      >ðŸ  View 3D</button>
                    </div>
                  </div>
                  <div class="showroom-design-body">
                    <div class="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">${escapeHtml(img.category)}</div>
                    <h4 class="font-bold text-white text-sm mb-3 line-clamp-2">${escapeHtml(img.name)}</h4>
                    <div class="flex gap-2">
                      ${isLoggedIn
          ? `<button data-action="nav" data-tab="contact" class="showroom-card-btn primary">ðŸ’¬ Quote</button>
                           <button data-action="nav" data-tab="contact" class="showroom-card-btn secondary">ðŸ“… Book</button>`
          : `<button data-action="nav" data-tab="login" class="showroom-card-btn primary w-full" style="text-align:center;">ðŸ”’ Sign in to Quote</button>`
        }
                    </div>
                  </div>
                </div>
              `).join('') : `
                <div class="col-span-full text-center py-12 text-slate-500 italic">
                  No designs found for this room yet. Check back soon!
                </div>
              `}
            </div>
          </div>

          <!-- ===== OTHER VIDEOS IN THIS PROPERTY ===== -->
          <div>
            <h3 class="text-xl font-bold text-white mb-5">ðŸŽ¬ All Room Tour Videos</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${currentProperty.rooms.filter((r) => r.video3d).map((room) => `
                <button
                  data-action="select-showroom-room"
                  data-room-id="${escapeHtml(room.id)}"
                  class="showroom-video-thumb group text-left ${selectedRoomId === room.id ? 'ring-2 ring-amber-400' : ''}"
                >
                  <div class="relative h-40 overflow-hidden rounded-xl bg-slate-800">
                    <img src="${escapeHtml(room.imageUrl)}" alt="${escapeHtml(room.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div class="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <span class="text-white text-2xl">â–¶</span>
                      </div>
                    </div>
                    ${selectedRoomId === room.id ? `<div class="absolute top-2 left-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">Now Playing</div>` : ''}
                  </div>
                  <div class="mt-3">
                    <div class="text-xs text-slate-500 uppercase tracking-wider">${roomEmoji(room.type)} ${escapeHtml(room.type)}</div>
                    <div class="font-bold text-white mt-0.5">${escapeHtml(room.name)}</div>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          ` : '<div class="py-20 text-center text-slate-500">Select a room to explore</div>'}

          <!-- ===== CTA ===== -->
          <div class="showroom-cta-banner">
            <h2 class="text-3xl font-display font-bold text-white mb-3">Ready to Transform Your Space?</h2>
            <p class="text-slate-300 mb-8 max-w-2xl mx-auto">
              Our expert designers will bring your dream home to life with cutting-edge 3D, AR, and smart planning tools.
            </p>
            <div class="flex flex-wrap gap-4 justify-center">
              ${isLoggedIn
      ? `<button data-action="nav" data-tab="contact" class="showroom-cta-btn-primary">ðŸ“… Book a Consultation</button>
                   <button data-action="nav" data-tab="gallery" class="showroom-cta-btn-outline">ðŸ–¼ï¸ Explore Gallery</button>`
      : `<button data-action="nav" data-tab="login" class="showroom-cta-btn-primary">ðŸ”’ Sign In to Get Started</button>
                   <button data-action="nav" data-tab="gallery" class="showroom-cta-btn-outline">ðŸ–¼ï¸ Explore Gallery</button>`
    }
            </div>
          </div>
        </main>
      </section>
      <style>
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        .motion-3d[data-motion3d="true"] { animation: kenBurns 20s ease-in-out infinite alternate; transform-origin: center center; }
      </style>
    </div>
  `;
};



const renderContact = () => {
  return `
            <div class="spidey-page" >
              <section class="spidey-hero" >
                <div class="spidey-hero-inner" >
                  <div class="spidey-kicker" > Consultation </div>
                    <div class="spidey-title" > Design Command </div>
                      <div class="spidey-subtitle" > Share your vision and our design leads will return a curated 3D plan.</div>
                        </div>
                        </section>

                        <section class="spidey-grid" >
                          <div class="spidey-panel overflow-hidden" >
                            <div class="grid grid-cols-1 md:grid-cols-[0.7fr_1fr]" >
                              <div class="bg-[color:var(--primary)] text-white p-12 space-y-6" >
                                <h2 class="text-3xl font-display font-bold" > Book Your Design Consultation.</h2>
                                  <p class="text-white/70" > Share your vision with us, and our design leads will get back to you with a curated 3D plan.</p>
                                    <div class="space-y-4 text-sm" >
                                      <div>${escapeHtml(state.siteSettings.contactAddress)} </div>
                                        <div > ${escapeHtml(state.siteSettings.contactPhone)} </div>
                                          <div > ${escapeHtml(state.siteSettings.contactEmail)} </div>
                                            </div>
                                            </div>
                                            <div class="p-12" >
                                              ${state.formSubmitted
      ? `
                <div class="text-center py-10">
                  <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">âœ“</div>
                  <h3 class="text-2xl font-semibold text-[color:var(--primary)]">Thank You!</h3>
                  <p class="text-slate-500 mt-2 mb-6">We've notified our designers. You'll hear from us soon.</p>
                  <button data-action="reset-inquiry" class="spidey-cta">Send Another Request</button>
                </div>
              `
      : `
                <form data-form="inquiry" class="space-y-4">
                  ${!state.currentUser
        ? `
                    <div class="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs">
                      Want to track your requests? <button type="button" data-action="nav" data-tab="login" class="text-[color:var(--accent)] font-semibold">Sign In / Sign Up</button>
                    </div>
                  `
        : ''
      }
                  <input name="name" data-bind="inquiryForm.name" value="${escapeHtml(state.inquiryForm.name)}" required placeholder="Name" class="w-full p-4 bg-slate-50 rounded-2xl border border-black/5" />
                  <input name="email" data-bind="inquiryForm.email" value="${escapeHtml(state.inquiryForm.email)}" required type="email" placeholder="Email" class="w-full p-4 bg-slate-50 rounded-2xl border border-black/5" />
                  <textarea name="message" data-bind="inquiryForm.message" rows="5" required placeholder="Tell us about your project..." class="w-full p-4 bg-slate-50 rounded-2xl border border-black/5"></textarea>
                  <button type="submit" class="w-full py-4 rounded-2xl font-black uppercase tracking-wide bg-amber-400 text-slate-900 border-2 border-amber-300 shadow-lg shadow-amber-300/60 hover:bg-amber-300 hover:shadow-xl transition">Initiate Request</button>
                </form>
              `
    }
</div>
  </div>
  </div>
  </section>
  </div>
    `;
};

const renderAiStudio = () => {
  const canGenerate = !!state.smartStudio.originalImage && !state.smartStudio.isGenerating;
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

const refreshAdminData = async (options: RefreshOptions = {}) => {
  const refreshStart = getPerfNow();
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    console.warn('Not authorized to fetch admin data; admin login is required.');
    return;
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
        console.log(`âœ… Loaded ${state.admin.bookings.length} bookings from server`);
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
  const emojis = ['ðŸ“¢', 'ðŸŽ‰', 'ðŸ”¥', 'âœ¨', 'âš ï¸', 'ðŸ“…', 'ðŸ•’', 'âœ…', 'ðŸ ', 'ðŸ›‹ï¸', 'ðŸŽ¨', 'ðŸŽ', 'ðŸ‡®ðŸ‡³', 'ðŸ’°', 'ðŸ’Ž'];
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
  const revenueRecognizedBookings = bookings.filter((booking: any) => {
    const paymentStatus = getBookingPaymentStatus(booking);
    const bookingStatus = String(booking?.status || '').trim().toLowerCase();
    return paymentStatus === 'paid'
      || bookingStatus === 'approved'
      || bookingStatus === 'confirmed'
      || bookingStatus === 'fulfilled';
  });
  const uniqueCustomerIds = new Set(
    bookings
      .map((booking: any) => String(booking?.userId || '').trim())
      .filter(Boolean)
  );
  const uniqueDesignIds = new Set(
    revenueRecognizedBookings
      .map((booking: any) => String(booking?.designId || '').trim())
      .filter(Boolean)
  );
  const totalRevenue = revenueRecognizedBookings.reduce((sum: number, booking: any) => sum + getBookingAmount(booking), 0);
  const { categoryEarnings } = getAdminChartMetrics(bookings);
  const activeRevenueCategories = categoryEarnings.length;
  const dashboardAnnouncements = getActiveAnnouncements().filter((announcement: any) => (
    !announcement?.location || announcement.location === 'dashboard' || announcement.location === 'both'
  ));

  return `
    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <div class="text-2xl font-bold text-[color:var(--primary)]">${revenueRecognizedBookings.length}</div>
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

    <section class="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-8">
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
    <section class="spidey-panel p-6 mt-8">
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
  return `
  <div class="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 hidden" data-modal="design-editor" data-action="close-design-editor">
    <div class="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto" data-action="ignore">
    <div class="spidey-dialog-header">
            <h3 class="text-lg font-semibold text-[color:var(--primary)]">Edit Design</h3>
            <button data-action="close-design-editor" class="text-sm text-slate-500">âœ•</button>
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
              <label class="block text-sm font-semibold text-slate-600 mb-1">3D Model</label>
              ${currentModelUrl ? `<div class="mt-1 text-xs text-slate-500 truncate">Current: ${escapeHtml(currentModelUrl)}</div>` : '<div class="mt-1 text-xs text-slate-400">No model linked yet.</div>'}
            </div>
            ${previewImage ? `
                <div class="rounded-xl overflow-hidden border border-black/5">
                    <img src="${escapeHtml(previewImage)}" alt="Preview" class="w-full h-40 object-cover" />
                </div>
            ` : ''}
            <div class="flex gap-2 pt-2">
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

  const getPaidDesignFallbackImage = (item: any) => {
    const itemImageUrl = String(item?.imageUrl || '').trim();
    if (itemImageUrl) return normalizeAssetUrl(itemImageUrl);

    const fallbackDesign = getDesigns().find((design: any) => String(design.id || '') === String(item?.designId || '')) || null;
    const fallbackDesignImage = fallbackDesign
      ? String(
        fallbackDesign.previewImage
        || (Array.isArray(fallbackDesign.images) && fallbackDesign.images.length > 0
          ? fallbackDesign.images[0]
          : '')
      )
      : '';
    return normalizeAssetUrl(String(fallbackDesignImage || '/category/Living room/living1.jpg'));
  };

  const existing = getStoredPaidDesigns(state.currentUser?.id);
  const mergedByBookingId = new Map<string, any>();
  [...existing, ...paidFromBookings].forEach((item: any) => {
    const key = String(item?.bookingId || '').trim();
    if (key) mergedByBookingId.set(key, item);
  });

  let merged = [...mergedByBookingId.values()].sort((left: any, right: any) => (
    new Date(right?.bookedAt || 0).getTime() - new Date(left?.bookedAt || 0).getTime()
  ));

  merged = merged.map((item: any) => ({
    ...item,
    imageUrl: getPaidDesignFallbackImage(item)
  }));

  // Add seeded historical paid designs if count is low
  if (merged.length < 50) {
    const designs = getDesigns();
    const now = new Date();
    for (let i = 0; i < 50 - merged.length; i++) {
      const design = designs[Math.floor(Math.random() * designs.length)] || { id: `design-${i}`, title: `Design ${i}` };
      const fallbackImageSource = (design as any)?.images && Array.isArray((design as any).images)
        ? (typeof (design as any).images[0] === 'string' ? (design as any).images[0] : ((design as any).images[0]?.url || ''))
        : '';
      const imageUrl = normalizeAssetUrl(String(
        (design as any)?.previewImage
        || fallbackImageSource
        || '/category/Living room/living1.jpg'
      ));
      const date = new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      merged.push({
        bookingId: `seed-booking-${i}`,
        designId: design.id,
        designName: design.title || `Design ${i}`,
        imageUrl,
        amount: Math.floor(Math.random() * 50000) + 10000,
        bookedAt: date.toISOString(),
        paymentStatus: 'paid',
        bookingStatus: 'confirmed'
      });
    }
  }

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

  // Prefer exact normalized name/file matches first so admin booking cards load the intended design by name.
  const directNameMatch = designPool.find((design: any) => {
    const designTitle = String(design?.title || '').trim();
    const designTitleKey = normalizeKey(designTitle);
    const firstDesignImage = Array.isArray(design?.images)
      ? (typeof design.images[0] === 'string' ? design.images[0] : (design.images[0]?.url || ''))
      : '';
    const designImage = normalizeAssetUrl(String(design?.previewImage || design?.imageUrl || design?.image || firstDesignImage || ''));
    const designFileKey = getFilenameKey(designImage);
    const designNameFromFileKey = normalizeKey(sanitizeDisplayName(designFileKey));

    if (bookingTitleKey && designTitleKey && bookingTitleKey === designTitleKey) return true;
    if (bookingNameKey && designTitleKey && bookingNameKey === designTitleKey) return true;
    if (bookingNameFromFileKey && designNameFromFileKey && bookingNameFromFileKey === designNameFromFileKey) return true;
    if (bookingNameFileKey && designFileKey && bookingNameFileKey === designFileKey) return true;
    return false;
  }) || null;

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
  const resolvedDesign = directNameMatch || (topDesignMatch && topDesignMatch.score > 0 ? topDesignMatch.design : null);
  const hasStrongDesignMatch = Boolean(directNameMatch || (topDesignMatch && topDesignMatch.score >= 300));

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

  const bookingCategoryHint = (() => {
    const raw = `${bookingName} ${bookingTitle} ${designId}`.toLowerCase();
    if (raw.includes('full home') || raw.includes('villa')) return 'villa';
    if (raw.includes('apartment')) return 'apartment';
    if (raw.includes('living')) return 'living room';
    if (raw.includes('dining')) return 'dining room';
    if (raw.includes('kitchen')) return 'kitchen';
    if (raw.includes('pooja') || raw.includes('mandir') || raw.includes('prayer')) return 'pooja room';
    if (raw.includes('kids')) return 'kids bedroom';
    if (raw.includes('bedroom') || raw.includes('bed room')) return 'master bedroom';
    if (raw.includes('bath')) return 'bathroom';
    if (raw.includes('office')) return 'office interior';
    if (raw.includes('terrace') || raw.includes('balcony')) return 'terrace';
    if (raw.includes('pool')) return 'swimming pool';
    if (raw.includes('garden')) return 'garden';
    return '';
  })();

  const canonicalImageFallback = normalizeAssetUrl(String(
    getCanonicalCategoryImages(bookingCategoryHint)[0]
    || ''
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
    || canonicalImageFallback
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
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-[color:var(--primary)]">Booking Details</h3>
                <button type="button" data-action="close-booking-view" class="text-sm text-slate-500">âœ•</button>
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
            <div class="mt-6 flex gap-2">
                ${booking.status !== 'fulfilled' ? `
            <button type="button" data-action="approve-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? 'Updating...' : 'âœ“ Approve'}</button>
            <button type="button" data-action="decline-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? 'Updating...' : 'âœ• Decline'}</button>
          ` : `
            <div class="flex-1 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold text-center">âœ“ Approved</div>
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
    const paymentStatus = normalizeBookingPaymentStatus(booking.paymentStatus);
    const approvedForPayment = isBookingApprovedForPayment(booking);
    const bookingTime = new Date(String(booking?.createdAt || booking?.bookingDate || '')).getTime();
    const searchName = String([
      bookingContext.displayName,
      booking.designName,
      booking.designTitle,
      booking.category,
      booking.categoryName,
      booking.id
    ].filter(Boolean).join(' ')).toLowerCase();
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
    // Pending tab should only show not-yet-approved bookings.
    if (pStatus === 'pending' && row.approvedForPayment) return false;
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
    if (row.paymentStatus === 'pending' && !row.approvedForPayment) acc.pending += 1;
    if (row.approvedForPayment) acc.approved += 1;
    return acc;
  }, { total: 0, paid: 0, pending: 0, approved: 0 });

  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ“… Bookings Manager</h2>
            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">ðŸ”„ Auto-refresh</span>
            <span class="text-xs px-2 py-1 rounded ${isRecentlySynced ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'} font-semibold">ðŸ•’ Last synced: ${escapeHtml(bookingsLastSyncedLabel)}</span>
          </div>
          <button data-action="refresh-admin-bookings" title="Refresh bookings list immediately" class="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-sm flex items-center gap-1">
            <span>ðŸ”„</span>
            <span>Refresh Now</span>
          </button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button type="button" data-action="set-booking-summary-filter" data-value="all" class="text-left p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border ${state.admin.bookingFilter.paymentStatus === 'all' && state.admin.bookingFilter.approvalStatus === 'all' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">ðŸ“Š Total</div>
            <div class="text-xl font-bold text-blue-700 mt-1">${stats.total}</div>
          </button>
          <button type="button" data-action="set-booking-summary-filter" data-value="paid" class="text-left p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border ${state.admin.bookingFilter.paymentStatus === 'paid' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-emerald-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">âœ… Paid</div>
            <div class="text-xl font-bold text-emerald-700 mt-1">${stats.paid}</div>
          </button>
          <button type="button" data-action="set-booking-summary-filter" data-value="pending" class="text-left p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border ${state.admin.bookingFilter.paymentStatus === 'pending' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-amber-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">â³ Pending</div>
            <div class="text-xl font-bold text-amber-700 mt-1">${stats.pending}</div>
          </button>
          <button type="button" data-action="set-booking-summary-filter" data-value="approved" class="text-left p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border ${state.admin.bookingFilter.approvalStatus === 'approved' ? 'border-purple-400 ring-2 ring-purple-200' : 'border-purple-200/50'} hover:shadow-md transition">
            <div class="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">ðŸŽ¯ Approved</div>
            <div class="text-xl font-bold text-purple-700 mt-1">${stats.approved}</div>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 items-center">
            <div class="relative min-w-0">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">ðŸ”</span>
              <input data-bind="admin.bookingFilter.query" value="${escapeHtml(state.admin.bookingFilter.query)}" placeholder="Search design..." class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
            </div>
            <div class="relative min-w-0">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">ðŸ“…</span>
              <input type="date" data-bind="admin.bookingFilter.dateFrom" value="${state.admin.bookingFilter.dateFrom}" class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
            </div>
            <div class="relative min-w-0">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">ðŸ“…</span>
              <input type="date" data-bind="admin.bookingFilter.dateTo" value="${state.admin.bookingFilter.dateTo}" class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
            </div>
            <select data-bind="admin.bookingFilter.categoryId" class="w-full min-w-0 px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
                <option value="all">ðŸ“‚ All Categories</option>
            ${categories.map((cat) => `<option value="${cat.id}" ${state.admin.bookingFilter.categoryId === cat.id ? 'selected' : ''}>${escapeHtml(cat.title)}</option>`).join('')}
            </select>
            <select data-bind="admin.bookingFilter.paymentStatus" class="w-full min-w-0 px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm">
              <option value="all" ${state.admin.bookingFilter.paymentStatus === 'all' ? 'selected' : ''}>ðŸ’° All Payments</option>
              <option value="paid" ${state.admin.bookingFilter.paymentStatus === 'paid' ? 'selected' : ''}>âœ… Paid</option>
              <option value="pending" ${state.admin.bookingFilter.paymentStatus === 'pending' ? 'selected' : ''}>â³ Pending</option>
              <option value="failed" ${state.admin.bookingFilter.paymentStatus === 'failed' ? 'selected' : ''}>âŒ Failed</option>
            </select>
            <button data-action="clear-booking-filters" class="w-full px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition text-sm">ðŸ”„ Clear</button>
        </div>
        
        ${state.admin.bookingFilter.dateFrom ? `
          <div class="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div class="text-sm font-semibold text-blue-900 mb-2">ðŸ“Š Designs Booked on ${new Date(state.admin.bookingFilter.dateFrom).toLocaleDateString()}</div>
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

        <div class="space-y-2.5 max-h-[380px] overflow-y-auto custom-scroll">
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
                                  <img src="${escapeHtml(bookingContext.imageUrl)}" alt="${escapeHtml(bookingContext.displayName)}" class="w-14 h-14 rounded-xl object-cover border border-black/10 flex-shrink-0" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect fill=%22%23e5e7eb%22 width=%2264%22 height=%2264%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22>ðŸ </text></svg>'" />
                                    <div class="min-w-0 flex-1">
                                      <div class="font-semibold text-[color:var(--primary)] text-sm leading-tight">${escapeHtml(bookingContext.displayName)}</div>
                                      <div class="text-xs text-slate-400 mt-0.5">ðŸ“… ${new Date(booking.createdAt).toLocaleDateString()}</div>
                                      <div class="text-xs text-slate-500 mt-0.5">ðŸ‘¤ ${escapeHtml(customerDetails.name)}${customerDetails.email ? ` â€¢ ${escapeHtml(customerDetails.email)}` : ''}</div>
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
                                    <button type="button" data-action="view-booking" data-booking-id="${booking.id}" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition">ðŸ‘ï¸ View</button>
                                    ${isBookingApprovedForPayment(booking)
                          ? `<span class="text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-medium">âœ“ Payment Approved</span>`
                          : `<button type="button" data-action="approve-for-payment" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? 'â³ Updating...' : 'âœ“ Approve Payment'}</button>`}
                                    <button type="button" data-action="approve-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium hover:bg-green-200 transition ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? 'â³ Updating...' : 'âœ“ Accept'}</button>
                                    <button type="button" data-action="decline-booking" data-booking-id="${booking.id}" ${isPendingAction ? 'disabled' : ''} class="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition ${isPendingAction ? 'opacity-60 cursor-not-allowed' : ''}">${isPendingAction ? 'â³ Updating...' : 'âœ• Decline'}</button>
                                </div>
                            </div>
                        </div>
                        `;
        })
        .join('')
      : '<div class="text-sm text-slate-400 text-center py-8">ðŸ“­ No bookings found matching your filters.</div>'
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
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-6">ðŸ§¾ Invoices & Receipts</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
            <div class="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">ðŸ“Š Total</div>
            <div class="text-xl font-bold text-blue-700 mt-1">${stats.total}</div>
          </div>
          <div class="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
            <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">âœ… Generated</div>
            <div class="text-xl font-bold text-emerald-700 mt-1">${stats.generated}</div>
          </div>
          <div class="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
            <div class="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">ðŸ“¤ Sent</div>
            <div class="text-xl font-bold text-purple-700 mt-1">${stats.sent}</div>
          </div>
          <div class="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
            <div class="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">ðŸ’° Total Amount</div>
            <div class="text-lg font-bold text-amber-700 mt-1">${formatCurrency(stats.totalAmount)}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">ðŸ”</span>
              <input data-bind="admin.invoiceFilter.query" value="${escapeHtml(state.admin?.invoiceFilter?.query || '')}" placeholder="Search invoice, receipt, or customer..." class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <select data-bind="admin.invoiceFilter.status" class="px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="all">ðŸ“‹ All Status</option>
                <option value="generated">âœ… Generated</option>
                <option value="sent">ðŸ“¤ Sent</option>
                <option value="paid">ðŸ’° Paid</option>
            </select>
            <button data-action="create-sample-invoice" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">âž• Create Sample</button>
        </div>

        <div class="space-y-3 max-h-[500px] overflow-y-auto custom-scroll">
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
                                      ðŸ§¾
                                    </div>
                                    <div class="min-w-0 flex-1">
                                      <div class="font-semibold text-[color:var(--primary)] text-sm">${escapeHtml(invoice.invoiceNumber)}</div>
                                        <div class="text-xs text-slate-400 mt-1">ðŸ‘¤ Customer Name: ${escapeHtml(invoice.customerName)}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">ðŸ“§ ${escapeHtml(invoice.customerEmail || 'N/A')}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">ðŸ“¦ Booked Package: ${escapeHtml(invoice.packageName || invoice.designName || 'N/A')}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">ðŸŽ¨ Design Name: ${escapeHtml(invoice.designName || invoice.packageName || 'N/A')}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">ðŸ’³ Payment Mode: ${escapeHtml(formatPaymentMethodLabel(invoice.paymentMethod))}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">ðŸ—“ï¸ Payment Date: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).date)}</div>
                                        <div class="text-xs text-slate-500 mt-0.5">â° Payment Time: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).time)}</div>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                  <div class="text-lg font-bold text-[color:var(--accent)]">${formatCurrency(invoice.amount)}</div>
                                  <div class="text-[10px] px-2 py-0.5 rounded-full ${statusClass} mt-1 inline-block font-medium">${invoice.status}</div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-2 pt-3 border-t border-black/5">
                              <div class="text-xs text-slate-500 font-medium">Customer Name: ${escapeHtml(invoice.customerName || 'N/A')} â€¢ Booked Package: ${escapeHtml(invoice.packageName || invoice.designName || 'N/A')} â€¢ Design Name: ${escapeHtml(invoice.designName || invoice.packageName || 'N/A')} â€¢ Amount: ${formatCurrency(Number(invoice.amount || invoice.totalAmount || 0))}</div>
                                <div class="flex items-center gap-2">
                                    <button type="button" data-action="admin-view-invoice" data-invoice-id="${escapeHtml(String(invoice.id || ''))}" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition">ðŸ‘ï¸ View</button>
                                    <button type="button" data-action="admin-download-invoice" data-invoice-id="${escapeHtml(String(invoice.id || ''))}" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">â¬‡ï¸ Download</button>
                                </div>
                            </div>
                        </div>
                        `;
        })
        .join('')
      : '<div class="text-sm text-slate-400 text-center py-8">ðŸ“­ No invoices found.</div>'
    }
        </div>
    </div>
    `;
};

const renderAdminThemeSection = () => {
  return `
    <div class="spidey-panel p-6">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-4">ðŸŽ¨ Theme & Branding</h2>
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
          <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ§  Design Studio</h2>
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
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ“© Inquiries</h2>
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
                                <div class="text-[10px] text-slate-400">${escapeHtml(inq.email)} â€¢ ${new Date(inq.createdAt || Date.now()).toLocaleDateString()}</div>
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
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" data-action="close-inquiry-view">
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-xl max-h-[90vh] overflow-y-auto" data-action="ignore">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[color:var(--primary)]">Inquiry Details</h3>
          <button data-action="close-inquiry-view" class="text-sm text-slate-500">âœ•</button>
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
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" data-action="close-customer-view">
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-xl max-h-[90vh] overflow-y-auto" data-action="ignore">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[color:var(--primary)]">Customer Details</h3>
          <button type="button" data-action="close-customer-view" class="text-sm text-slate-500">âœ•</button>
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
                          ${bDate ? `<div class="text-xs text-slate-400 mt-0.5">${bDate}${bTime ? ' Â· ' + bTime : ''}</div>` : ''}
                        </div>
                        <div class="flex flex-col gap-1 items-end shrink-0">
                          <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${payColor}">${payStatus === 'paid' ? 'âœ“ Paid' : payStatus === 'failed' ? 'âœ— Failed' : 'â³ Pending'}</span>
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
                          <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(String(payment?.provider || 'payment').toUpperCase())}${paymentDate ? ` Â· ${paymentDate}` : ''}</div>
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
                        <div class="text-amber-400 text-sm tracking-wide">${'â˜…'.repeat(ratingValue)}</div>
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
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ“¦ Package Manager</h2>
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
                            <div class="text-[10px] text-slate-400">${escapeHtml(p.category)} â€¢ ${formatCurrency(p.discountedPrice)}</div>
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
          <button data-action="admin-calc-tab" data-value="settings" class="px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeAdminTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">Settings</button>
          <button data-action="admin-calc-tab" data-value="history" class="px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeAdminTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">History</button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        ${activeAdminTab === 'settings' ? `
          <div class="space-y-10">
            <section>
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Economics</h3>
              <div class="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
                <label class="block text-xs font-bold text-slate-500 mb-2">Base rate per Sq.Ft. (â‚¹)</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">â‚¹</span>
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
              <div class="overflow-x-auto custom-scroll">
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
                          <div class="font-medium">${item.area} sqft Â· ${item.bhk} BHK</div>
                          <div class="text-[10px]">${item.shape} Â· <span class="capitalize">${item.quality}</span></div>
                        </td>
                        <td class="py-4 px-2 text-right font-black text-slate-900 text-sm">â‚¹${item.result.toLocaleString()}</td>
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
        const stars = 'â­'.repeat(Math.min(5, Math.max(1, Number(f.rating || 1))));
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
        <h3 class="text-sm font-semibold text-slate-600">â­ Feedback Submitted via Chatbot</h3>
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
        <h3 class="text-sm font-semibold text-slate-600">ðŸ§  Chatbot Query History</h3>
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
                  <div class="text-[11px] font-semibold text-[color:var(--primary)] truncate">${escapeHtml(String(item.userName || 'Guest'))} â€¢ ${roleTag}</div>
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
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-6">ðŸ’¬ Chatbot Assistant</h2>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
        <div class="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">ðŸ’¬ Messages</div>
        <div class="text-2xl font-bold text-blue-700 mt-1">${chatbotStats.totalMessages}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
        <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">ðŸ“… Bookings</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">${chatbotStats.bookingIntents}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
        <div class="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">ðŸ’¡ Suggestions</div>
        <div class="text-2xl font-bold text-amber-700 mt-1">${chatbotStats.suggestionIntents}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
        <div class="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">ðŸ‘¤ Registered</div>
        <div class="text-2xl font-bold text-purple-700 mt-1">${registeredCount}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200/50">
        <div class="text-[10px] uppercase tracking-wider text-pink-600 font-semibold">ðŸ‘¥ Guests</div>
        <div class="text-2xl font-bold text-pink-700 mt-1">${guestCount}</div>
      </div>
        </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form data-form="chatbot-settings" class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <span>âš™ï¸</span> Chatbot Settings
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ¤– Assistant Name</label>
            <input name="assistantName" value="${escapeHtml(chatbotSettings.assistantName)}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., Interia Assistant" required />
          </div>
          <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
            <input type="checkbox" name="enabled" id="chatbot-enabled" ${chatbotSettings.enabled ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded" />
            <label for="chatbot-enabled" class="text-sm text-slate-700 font-medium">âœ… Chatbot Enabled</label>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ‘‹ Greeting Message</label>
            <textarea name="greeting" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Hello! I'm your Interia assistant...">${escapeHtml(chatbotSettings.greeting)}</textarea>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/25">ðŸ’¾ Save Settings</button>
          <button type="button" data-action="reset-chatbot-settings" class="w-full py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">â™»ï¸ Reset Settings</button>
        </div>
      </form>
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <span>ðŸ“</span> Auto-Reply Templates
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ“… Booking Inquiry Reply</label>
            <textarea name="bookingReply" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Thank you for your interest in booking...">${escapeHtml(chatbotSettings.bookingReply)}</textarea>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ’¡ Suggestions Intro</label>
            <textarea name="suggestionsIntro" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Here are some suggestions...">${escapeHtml(chatbotSettings.suggestionsIntro)}</textarea>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200">
          <h4 class="text-xs font-semibold text-slate-600 mb-3">ðŸ“Š Quick Stats</h4>
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
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸŽ¨ 3D Catalog</h2>
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
              <button type="button" data-action="open-upload-edit" data-design-id="${design.id}" class="text-[10px] font-bold text-blue-600">Edit</button>
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
          <button type="button" data-action="close-catalog-preview" data-catalog-preview-close="true" class="text-slate-500 text-xl leading-none">âœ•</button>
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
            <button type="button" data-action="open-upload-edit" data-design-id="${escapeHtml(String((design as any).id || ''))}" class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Edit</button>
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
      <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">â­ Public Feedback</h2>
      <button type="button" data-action="refresh-admin-feedback" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">â†» Refresh</button>
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
                  <div class="text-xs text-amber-500 mb-1">${'â˜…'.repeat(feedback.rating)}</div>
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
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ“‚ Categories</h2>
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
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">âœï¸ Designs</h2>
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
                <div class="text-[10px] text-slate-400">${escapeHtml(design.categoryId || design.category || 'No Category')} â€¢ Price: ${formatCurrency(getDesignAmount(design as any))}${design.cost ? ` â€¢ Cost: ${formatCurrency(design.cost)}` : ''}</div>
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
      <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-4">ðŸ‘¤ Customers</h2>
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
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ“¢ Announcements</h2>
            <button data-action="reset-announcement" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">ðŸ”„ Clear</button>
        </div>
        <form data-form="announcement-form" class="space-y-4">
          <input type="hidden" name="id" value="${escapeHtml(String(state.admin.announcementForm.id || ''))}" />
          <input type="hidden" name="startDate" value="${escapeHtml(announcementStartDate)}" />
          <input type="hidden" name="endDate" value="${escapeHtml(announcementEndDate)}" />
            <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ“ Announcement Title</label>
                  <input name="title" value="${escapeHtml(state.admin.announcementForm.title)}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., Special Offer!" required />
                </div>
                ${renderEmojiOptions('title')}
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ“ Display Location</label>
                  <select name="location" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required>
                    <option value="both" ${state.admin.announcementForm.location === 'both' ? 'selected' : ''}>ðŸ  Both Homepage & Dashboard</option>
                    <option value="homepage" ${state.admin.announcementForm.location === 'homepage' ? 'selected' : ''}>ðŸ¡ Homepage Only</option>
                    <option value="dashboard" ${state.admin.announcementForm.location === 'dashboard' ? 'selected' : ''}>ðŸ“Š Dashboard Only</option>
                    <option value="top_bar" ${state.admin.announcementForm.location === 'top_bar' ? 'selected' : ''}>ðŸ“¢ Top Bar Banner</option>
                    <option value="modal" ${state.admin.announcementForm.location === 'modal' ? 'selected' : ''}>ðŸªŸ Welcome Modal</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ’¬ Message</label>
                  <textarea name="message" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows="3" placeholder="Enter your announcement message...">${escapeHtml(state.admin.announcementForm.message || '')}</textarea>
                </div>
                ${renderEmojiOptions('message')}
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
                <input type="checkbox" name="active" id="ann-active" ${state.admin.announcementForm.active ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded" />
                <label for="ann-active" class="text-sm text-slate-700 font-medium">âœ… Active</label>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/25">${state.admin.announcementForm.id ? 'ðŸ”„ Update' : 'âž• Add'} Announcement</button>
        </form>
        <div class="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
            ${state.announcements.map(a => `
                <div class="flex items-center justify-between p-3 rounded-xl border border-black/5 bg-white/50">
                    <div class="flex-1">
                        <div class="text-sm font-semibold text-[color:var(--primary)]">${getAnnouncementEmoji(a)} ${escapeHtml(a.title)}</div>
                        <div class="text-[10px] text-slate-500">${a.location} â€¢ ${a.active ? 'ðŸŸ¢ Active' : 'ðŸ”´ Inactive'}</div>
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
            <input name="code" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="ðŸ’° Code (e.g. SAVE20)" required />
            <select name="type" class="px-4 py-2.5 rounded-xl border border-black/10">
              <option value="percent">ðŸ“Š Percent %</option>
              <option value="flat">ðŸ’µ Flat Amount</option>
            </select>
            <input name="value" type="number" min="1" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="ðŸ’Ž Value" required />
            <input name="minAmount" type="number" min="0" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="ðŸ“ Min amount (optional)" />
            <input name="maxDiscount" type="number" min="0" class="px-4 py-2.5 rounded-xl border border-black/10" placeholder="ðŸ”’ Max cap (optional)" />
            <input name="endDate" type="datetime-local" class="px-4 py-2.5 rounded-xl border border-black/10" />
            <label class="flex items-center gap-2 px-1 text-sm text-slate-600">
              <input name="active" type="checkbox" checked /> âœ… Active
            </label>
            <button type="submit" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm hover:opacity-90 transition">âž• Add Code</button>
          </form>
          <div class="space-y-2 max-h-[160px] overflow-y-auto">
            ${discountCodes.length === 0 ? '<div class="text-xs text-slate-400">No discount codes created yet.</div>' : discountCodes.map((code: any) => `
              <div class="flex items-center justify-between p-2 rounded-lg border border-black/5 bg-white">
                <div>
                  <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(String(code.code || '').toUpperCase())}</div>
                  <div class="text-[10px] text-slate-500">
                    ${code.type === 'flat' ? formatCurrency(Number(code.value || 0)) : `${Number(code.value || 0)}%`}
                    ${Number(code.minAmount || 0) > 0 ? ` â€¢ min ${formatCurrency(Number(code.minAmount || 0))}` : ''}
                    ${Number(code.maxDiscount || 0) > 0 ? ` â€¢ cap ${formatCurrency(Number(code.maxDiscount || 0))}` : ''}
                    ${code.active ? ' â€¢ ðŸŸ¢ active' : ' â€¢ ðŸ”´ inactive'}
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
          <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ’¼ Portfolio Content Manager</h2>
          <div class="flex items-center gap-3 text-xs">
            <div class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 font-semibold">ðŸ“Š ${totalSales} Total Sales</div>
            <div class="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-700 font-semibold">ðŸ‘¥ ${totalCustomers} Customers</div>
          </div>
        </div>
        
        <!-- Real-time Category Analytics -->
        <div class="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <h3 class="text-sm font-bold text-emerald-900 mb-3">ðŸ“ˆ Live Category Performance</h3>
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
                  <button data-action="auto-sync-portfolio-metrics" class="text-xs px-2 py-1 rounded-lg border border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-50" title="Auto-calculate metrics from real customer purchases">ðŸ”„ Auto-Sync</button>
                  <button data-action="add-portfolio-metric" class="text-xs px-2 py-1 rounded-lg bg-[color:var(--primary)] text-white">+ Add Data Point</button>
                </div>
              </div>
              <div class="text-xs text-slate-500 mb-2 px-2 py-1 bg-blue-50 rounded border border-blue-200">â„¹ï¸ Auto-Sync calculates metrics from actual paid bookings by category in real-time</div>
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
                        <label class="text-xs text-slate-600 font-semibold mb-1 block">ðŸ’Ž Sales</label>
                        <input data-bind="portfolioContent.businessMetrics.${index}.sales" type="number" min="0" value="${escapeHtml(String(Number(metric?.sales || 0)))}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Design Sales" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600 font-semibold mb-1 block">ðŸ‘¥ Customers</label>
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
    '3D Design Studio': 'ðŸŽ¨',
    'Design View': 'ðŸ“',
    'Turnkey Execution': 'ðŸ—ï¸',
    'AR Walkthrough': 'ðŸ“±',
    'Material Consultation': 'ðŸ§±',
    'Lighting Design': 'ðŸ’¡',
    'Space Planning': 'ðŸ“',
    'Color Consultation': 'ðŸŽ¨',
    'Furniture Selection': 'ðŸ›‹ï¸',
    'Custom Carpentry': 'ðŸªš',
    'False Ceiling': 'âœ¨',
    'Painting Services': 'ðŸ–Œï¸',
    'Flooring': 'ðŸº',
    'Modular Kitchen': 'ðŸ‘¨â€ðŸ³',
    'Wardrobe Design': 'ðŸšª',
    'Bathroom Renovation': 'ðŸš¿',
    'Balcony Design': 'ðŸŒ¿',
    'Pooja Room': 'ðŸ•‰ï¸'
  };
  return `
    <section class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ› ï¸ Services Manager</h2>
            <div class="flex items-center gap-2">
              <button data-action="admin-load-sample-services" class="text-xs px-3 py-1.5 rounded-lg border border-black/10 text-slate-600 hover:bg-slate-100 transition">ðŸ“¦ Load Sample</button>
              <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">${state.services.length} services</span>
            </div>
        </div>
        <div class="mb-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
          <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span>âš™ï¸</span> ${isEditingService ? 'âœï¸ Edit Service' : 'âž• Add New Service'}
          </h3>
          <form data-action="${isEditingService ? 'admin-update-service' : 'admin-add-service'}" data-id="${escapeHtml(serviceForm.id || '')}" class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ“ Service Title</label>
                <input name="title" value="${escapeHtml(serviceForm.title || '')}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., 3D Design Studio" required />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">ðŸŽ­ Icon (Emoji)</label>
                <input name="icon" value="${escapeHtml(serviceForm.icon || '')}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., ðŸŽ¨" required />
              </div>
                </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ“„ Description</label>
              <textarea name="description" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" rows="2" placeholder="Describe the service..." required>${escapeHtml(serviceForm.description || '')}</textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">ðŸŽ¬ Video/Image URL (optional)</label>
              <input name="video" value="${escapeHtml(serviceForm.video || '')}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ“ Upload Media File</label>
              <input id="admin-service-video-file" name="videoFile" type="file" accept="image/*,video/*" class="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/25">${isEditingService ? 'ðŸ”„ Update Service' : 'âž• Add Service'}</button>
              ${isEditingService ? '<button type="button" data-action="admin-cancel-service-edit" class="w-full py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">âŒ Cancel</button>' : ''}
            </div>
            </form>
        </div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span>ðŸ“‹</span> Existing Services
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
    const suggestedEmoji = serviceEmojis[s.title] || 'ðŸ› ï¸';
    const displayIcon = s.icon || suggestedEmoji;
    const mediaPreview = mediaUrl
      ? (isDataVideo
        ? `<video src="${escapeHtml(mediaUrl)}" controls preload="metadata" class="w-20 h-14 rounded-lg border border-black/10 bg-black object-contain"></video>`
        : (isYoutube || isVideoFile
          ? renderVideoLauncher(mediaUrl, 'w-20 h-14 rounded-lg border border-black/10 bg-black', s.title || 'Service Media')
          : (isImageFile
            ? `<a href="${escapeHtml(mediaUrl)}" target="_blank" rel="noopener noreferrer" class="block"><img src="${escapeHtml(mediaUrl)}" alt="${escapeHtml(s.title || 'Service Media')}" class="w-20 h-14 object-cover rounded-lg border border-black/10" /></a>`
            : `<a href="${escapeHtml(mediaUrl)}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-[color:var(--accent)] hover:underline">ðŸ”— Open Media</a>`)))
      : '';
    return `
                <div class="p-4 rounded-xl border border-black/10 bg-white hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            ${mediaPreview ? `<div class="shrink-0">${mediaPreview}</div>` : '<div class="w-20 h-14 rounded-lg bg-slate-100 border border-black/5 flex items-center justify-center text-xs text-slate-400">ðŸ“· No Media</div>'}
                            <span class="text-3xl">${escapeHtml(displayIcon)}</span>
                            <div>
                                <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(s.title)}</div>
                                <div class="text-[10px] text-slate-500 line-clamp-1">${escapeHtml(s.description)}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button data-action="admin-edit-service" data-id="${escapeHtml(s.id || '')}" data-index="${index}" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition">âœï¸ Edit</button>
                          <label for="service-media-${escapeHtml(String(s.id || index))}" class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition cursor-pointer">ðŸ“¤ Upload</label>
                          <input id="service-media-${escapeHtml(String(s.id || index))}" data-action="upload-service-media" data-id="${escapeHtml(s.id || '')}" type="file" accept="image/*,video/*" class="sr-only" />
                          <button data-action="admin-delete-service" data-id="${escapeHtml(s.id || '')}" data-index="${index}" class="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition">ðŸ—‘ï¸ Delete</button>
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
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">âœ¨ Showrooms</h2>
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
  const selectedRoomId = state.selectedShowroomRoom || rooms[0]?.id || '';
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || null;
  const relatedImages = selectedRoom ? getRoomRelatedImages(selectedRoom as any) : [];
  
  // Always get fresh designs and categories - don't rely on state.customer
  const allDesigns = getDesigns();
  const allCategories = getCustomerVisibleCategories(getCategories());
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
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-4">ðŸŒŸ Featured Showcase</h2>
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
                  <span class="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white text-xs border border-white/20" title="Drag to reorder">â‹®â‹®</span>
                </a>
                <div class="p-2 flex items-center justify-between gap-2">
                  <div class="text-[10px] text-slate-500 truncate">â†• Drag Â· Image ${index + 1}</div>
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

  const paymentsByUser = new Map<string, number>();
  for (const payment of (state.customer.payments || [])) {
    const userId = String((payment as any)?.userId || (payment as any)?.customerId || '');
    if (!userId) continue;
    paymentsByUser.set(userId, (paymentsByUser.get(userId) || 0) + 1);
  }

  const customerRows = customers.map((customer) => {
    const customerId = String(customer.id || '');
    return renderAdminCustomerRow({
      customer,
      isEditing: editingCustomerId === customerId,
      customerLikes: likesByUser.get(customerId) || 0,
      customerFeedbacks: feedbackByUser.get(customerId) || 0,
      customerBookings: bookingsByUser.get(customerId) || 0,
      customerPayments: paymentsByUser.get(customerId) || 0,
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
                            <div class="text-xs font-semibold text-slate-600 mb-2">ðŸ“Œ Liked Designs:</div>
                            <div class="flex flex-wrap gap-2">
                                ${likedDesignObjs.length ? likedDesignObjs.map(d => `<span class="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs">${escapeHtml(resolveDesignDisplayName(d, { imageUrl: d.previewImage, categoryId: d.categoryId }))}</span>`).join('') : '<span class="text-xs text-slate-400">No liked designs yet</span>'}
                            </div>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-slate-600 mb-2">â­ Feedback History:</div>
                            <div class="space-y-1">
                                ${customerFeedbacks.length ? customerFeedbacks.map(f => `<div class="text-xs p-2 rounded-lg bg-slate-50 text-slate-600">${'â˜…'.repeat((f as any).rating)} - ${escapeHtml((f as any).comment)}</div>`).join('') : '<span class="text-xs text-slate-400">No feedback yet</span>'}
                            </div>
                        </div>
                    </div>
                    `;
    }).join('')
    : '';

  return `
    <section class="spidey-panel p-6">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ‘¤ Customers</h2>
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
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Bookings</th><th class="text-left py-3 px-3 font-semibold text-slate-600">Payments</th>
                        <th class="text-left py-3 px-3 font-semibold text-slate-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                  ${customerRows}
                </tbody>
            </table>
        </div>
        <div class="mt-8 ${showCustomerActivityDetails ? '' : 'hidden'}">
            <h3 class="text-lg font-semibold text-[color:var(--primary)] mb-4">ðŸ“‹ Customer Activity Details</h3>
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
          <div class="text-5xl mb-3">âœ…</div>
          <div class="text-2xl font-bold mb-1">Payment Successful!</div>
          <div class="text-4xl font-extrabold mt-3">${formatCurrency(Number(sd.amount || 0))}</div>
          ${sd.discountCode ? `<div class="text-sm opacity-80 mt-1">Discount <strong>${escapeHtml(String(sd.discountCode))}</strong> applied</div>` : ''}
        </div>
        <div class="p-6 space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Card</span>
            <span class="font-mono font-semibold">â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ ${escapeHtml(String(sd.cardLast4 || '****'))}</span>
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
          <button type="button" data-action="cancel-fake-payment" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white font-bold flex items-center justify-center" aria-label="Close payment dialog">âœ•</button>
          <div class="text-xs uppercase tracking-widest opacity-75 mb-1">Secure Payment</div>
          <div class="text-2xl font-bold">${formatCurrency(payableAmount)}</div>
          ${isDiscountActive ? `<div class="text-xs opacity-90 mt-1">Base ${formatCurrency(baseAmount)} â€¢ You save ${formatCurrency(Number(paymentDiscount.discountAmount || 0))}</div>` : ''}
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
              <input name="cvv" type="password" maxlength="4" required placeholder="â€¢â€¢â€¢" class="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Code</label>
            ${availableOffers.length > 0 ? `
              <div class="flex gap-2">
                <select id="card-offer-select" class="flex-1 px-3 py-2 rounded-lg border border-black/10 text-xs">
                  <option value="">Offers from announcements</option>
                  ${availableOffers.map((offer: any) => {
                    const kind = offer.type === 'flat' ? `â‚¹${Number(offer.value || 0)} OFF` : `${Number(offer.value || 0)}% OFF`;
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
              return isActive ? `<div class="text-xs rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 border border-emerald-100">Code <strong>${escapeHtml(String(pd.code || ''))}</strong> applied â€” you save <strong>${formatCurrency(Number(pd.discountAmount || 0))}</strong></div>` : '';
            })()}
          </div>
          ${state.customer.paymentError ? `
            <div class="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">${escapeHtml(state.customer.paymentError)}</div>
          ` : ''}
          ${isLoading ? `
            <div class="py-4 flex flex-col items-center justify-center gap-3">
              <div class="w-8 h-8 border-4 border-[color:var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <div class="text-sm text-slate-500 font-medium">Processing paymentâ€¦</div>
            </div>
          ` : `
          <div class="flex gap-2 pt-2">
            <button type="button" data-action="cancel-fake-payment" class="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 rounded-lg bg-[color:var(--primary)] text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
              <span>ðŸ”’</span> Pay ${formatCurrency(payableAmount)}
            </button>
          </div>
          `}
          <div class="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <span>ðŸ”</span> Secured by 256-bit SSL encryption
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
          <button data-action="close-booking-details" class="text-slate-400 hover:text-slate-600">âœ•</button>
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
                      const kind = offer.type === 'flat' ? `â‚¹${Number(offer.value || 0)} OFF` : `${Number(offer.value || 0)}% OFF`;
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
        ? `<button data-action="pay-and-book" data-design-id="${details.designId}" data-booking-id="${details.bookingId}" class="text-xs bg-[color:var(--primary)] text-white px-3 py-2 rounded-lg font-bold">ðŸ’³ Pay with Card</button>`
        : '<div class="text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-lg font-semibold border border-amber-200 text-center">Booking pending admin approval</div>'}
                <button data-action="remove-booking" data-booking-id="${details.bookingId}" class="text-xs bg-white border border-red-300 text-red-600 px-3 py-2 rounded-lg font-semibold">Remove Booking</button>
              </div>
              ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span class="text-green-600 font-bold">âœ“ Paid</span>
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

