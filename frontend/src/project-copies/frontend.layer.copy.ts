// @ts-nocheck
// Reference copies generated from main.ts for organization only.
// Runtime source of truth remains main.ts.

// FRONTEND LAYER COPY
// ============================================================================
// AR INTERIA - MAIN ENTRY (Single-file architecture)
// Layer map inside this file:
// 1) Frontend UI/render/events
// 2) Backend integration (API/auth/network)
// 3) Database/storage access (dataStore/local persistence)
// ============================================================================

// --- Frontend utility helpers ------------------------------------------------
// Utility to get the best image for a room
const getRoomImage = (room: any): string => {
  if (room?.image && typeof room.image === 'string' && room.image.trim()) {
    return room.image;
  }
  // Use title + name + category + description so generic titles still resolve correctly.
  const roomText = [room?.title, room?.name, room?.category, room?.description]
    .filter(Boolean)
    .map((value: any) => String(value).toLowerCase())
    .join(' ');
  if (roomText.includes('bedroom')) return '/category/Master Bedroom/master-bedroom1.jpg';
  if (roomText.includes('kitchen')) return '/category/Kitchen/kitchen1.jpg';
  if (roomText.includes('dining')) return '/category/Diningroom/dining-room1.jpg';
  if (roomText.includes('bathroom')) return '/category/Bathroom/bathroom1.jpg';
  if (roomText.includes('office')) return '/category/Office interior/office interior (1).jpg';
  if (roomText.includes('balcony')) return '/category/Balcony/balcony (1).jpg';
  if (roomText.includes('theatre') || roomText.includes('theater')) return '/category/Home theatre/home theatre (1).jpg';
  if (roomText.includes('gym')) return '/category/Gym/gym (1).jpg';
  if (roomText.includes('pool')) return '/category/Swimming pool/swimming pool.jpg';
  if (roomText.includes('garden')) return '/category/Garden/garden (1).jpg';
  // Default fallback
  return '/category/Living room/living1.jpg';
};

// --- Frontend imports --------------------------------------------------------
import './index.css';
import Chart from 'chart.js/auto';
import { COLORS, SAMPLE_MODELS, SERVICES as INITIAL_SERVICES, COMPANY_INFO, PACKAGES, SERVICE_CATEGORIES, SHOWROOMS, INITIAL_SERVICE_SHOWCASES, featureImageMap } from './constants';
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
} from './types';
import { getSmartDesignSuggestions } from './services/smartService';
import { LUXURY_HOUSE, LUXURY_APARTMENT, INTERIOR_DESIGN_VIDEOS, type LuxuryProperty } from './services/luxuryShowcase';
import { renderAdminCustomerRow } from './frontend/src/features/admin/index';
// 3D services removed - using 2D image generation instead

import { designElements, applyDesignVisualization } from './services/designVisualizer';

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



// --- Frontend state layer ----------------------------------------------------
const state: State = {
  activeTab: pathToTab[window.location.pathname] || 'home',
  catalog: [],
  inquiries: [],
  feedbacks: [],
  services: [],
  serviceShowcases: [],
  showrooms: getShowrooms(),
  currentUser: null,
  adminAccount: null,
  users: [],
  selectedModelId: null,
  theme: getTheme(),
  announcements: getAnnouncements(),
  siteSettings: {
    heroTitle: 'Modern Luxury, Perfected.',
    heroSubtitle: 'AR Interia blends traditional craftsmanship with cutting-edge design technology. See your dream space come to life, instantly.',
    heroBg: '/hero-bg.webp',
    bgColor: '#faf9f6',
    accentColor: COLORS.gold,
    contactEmail: 'support@arinteria.com',
    contactPhone: '+91 8904712858',
    contactAddress: 'Main Rd, Indiranagar, Bengaluru',
    stats: [
      { label: 'Project Sites', value: '12' },
      { label: '3D Models', value: '0' },
      { label: 'Cities', value: '4' },
      { label: 'Satisfaction', value: '100%' }
    ]
  },
  feedbackForm: { rating: 5, comment: '', name: '' },
  feedbackSubmitted: false,
  loginForm: {
    email: '',
    password: '',
    isSignup: false,
    showPassword: false,
    showConfirmPassword: false,
    twoFactorChallengeId: '',
    twoFactorCode: '',
    twoFactorMessage: '',
    twoFactorDeliveryMethod: '',
    twoFactorDeliveredTo: '',
    twoFactorDebugCode: ''
  },
  loginError: '',
  smartPrompt: '',
  smartResult: null,
  isSmartLoading: false,
  inquiryForm: { name: '', email: '', message: '' },
  formSubmitted: false,
  upload: {
    open: false,
    editingId: null,
    isUploading: false,
    uploadError: null,
    newModelFiles: { glb: null, img: null },
    newModel: {
      title: '',
      description: '',
      category: RoomType.LIVING,
      style: StyleType.MODERN,
      price: 0
    }
  },
  searchQuery: '',
  roomFilter: 'All',
  mobileMenuOpen: false,
  confirmMessage: null,
  portfolioContent: {
    founder: {
      name: 'Abhilash J',
      role: 'Founder & CEO',
      bio: 'Visionary behind AR Interia.',
      photo: '',
      famousDesign: 'Minimal Luxe Penthouse Series'
    },
    coFounder: {
      name: 'Ramesh',
      role: 'Co-Founder',
      bio: 'Leading design and innovation.',
      photo: '',
      famousDesign: 'Tropical Villa Flow Collection'
    },
    journey: {
      title: 'Our Journey',
      intro: 'From one design desk to a full-stack interior studio, our founders and designers built AR Interia around measurable outcomes and timeless aesthetics.',
      milestones: [
        { year: '2018', title: 'Studio Founded', description: 'Started with bespoke residential design in Bengaluru.' },
        { year: '2021', title: 'Team Expansion', description: 'Built a specialized design team for premium villas and apartments.' },
        { year: '2024', title: 'AI + AR Launch', description: 'Introduced AI concepts and AR walkthroughs to reduce decision friction.' }
      ]
    },
    businessMetrics: [
      { label: '2023', sales: 82, customers: 64 },
      { label: '2024', sales: 124, customers: 93 },
      { label: '2025', sales: 168, customers: 121 }
    ],
    designers: [
      {
        name: 'Ananya Rao',
        role: 'Lead Interior Designer',
        bio: 'Specializes in high-function luxury apartments with natural light planning and layered textures.',
        photo: '',
        famousDesign: 'Skyline Lightwell Residence'
      },
      {
        name: 'Karthik Menon',
        role: 'Spatial Experience Designer',
        bio: 'Builds cinematic walkthrough-led layouts that balance movement, comfort, and premium detailing.',
        photo: '',
        famousDesign: 'CurveLine Villa Atrium'
      }
    ],
    feedbackVideos: [],
    featuredProjects: []
  },
  admin: {
    editingId: null,
    categoryForm: { title: '', description: '', image: '', background: '', status: 'active' },
    designForm: {
      title: '',
      description: '',
      categoryId: '',
      price: 0,
      images: [],
      availabilityStatus: 'available',
      status: 'active'
    },
    announcementForm: {
      id: '',
      title: '',
      message: '',
      startDate: '',
      endDate: '',
      active: true,
      location: 'both'
    },
    chatbotForm: {
      ruleId: null,
      keywords: '',
      response: '',
      quickReplies: ''
    },
    packageForm: {
      id: '',
      name: '',
      subtitle: '',
      category: 'Full Home',
      originalPrice: 0,
      discountedPrice: 0,
      features: [],
      description: '',
      image: '',
      type: 'Standard',
      rooms: []
    },
    viewingBookingId: null,
    designEditOpen: false,
    loadedCategory: undefined,
    catalogFilter: 'all',
    catalogFilterDraft: 'all',
    packageCategoryFilter: 'all',
    packageCategoryFilterDraft: 'all',
    bookingFilter: {
      query: '',
      dateFrom: '',
      dateTo: '',
      categoryId: 'all',
      paymentStatus: 'all',
      approvalStatus: 'all'
    },
    invoiceFilter: {
      query: '',
      status: 'all'
    },
    bookings: [],
    invoices: [],
    aiDesigns: [],
    showroomForm: {},
    serviceForm: {},
    showcaseForm: {},
    calculatorSettings: getCalculatorSettings(),
    calculatorForm: getCalculatorSettings(),
    calculatorTab: 'settings',
    calculatorImageLibrary: getCalculatorImageLibrary()
  },
  customer: {
    categories: getCategories(),
    designs: getDesigns(),
    bookings: [],
    payments: getPayments(),
    likes: getLikes(),
    inquiries: [],
    feedbacks: getFeedbacks(),
    aiDesigns: [],
    selectedDesignId: null,
    bookingMessage: '',
    activeCategory: 'all',
    galleryCategoryId: 'all',
    portfolioCategoryId: 'all',
    portfolioFilter: 'all',
    portfolioSearchQuery: '',
    searchQuery: '',
    feedbackText: '',
    rating: 5,
    paymentError: '',
    paymentLoadingId: null,
    imagePreview: null,
    bookingDetails: null,
    viewer3d: null
  },
  smartStudio: {
    prompt: '',
    originalImage: null,
    variants: [],
    isGenerating: false,
    error: '',
    room: 'Living Room' as RoomCategory
  },
  showroomPropertyType: 'house' as 'house' | 'apartment',
  selectedShowroomRoom: undefined as string | undefined,
  videoModalOpen: false,
  currentVideoUrl: '' as string,
  currentVideos: [],
  chatbot: {
    isOpen: false,
    activeTab: 'chat' as 'chat' | 'activity',
    feedbackStep: null as null | 'awaiting-rating' | 'awaiting-comment',
    pendingFeedbackRating: 0,
    messages: [
      createMessage('bot', `👋 Hi! I'm **Aria**, your AR Interia design assistant.\n\nAsk me anything about our services, pricing, or book a consultation!`, ['View Services', 'Pricing Info', 'Book Consultation'])
    ],
    inputText: '',
    isTyping: false
  },
  calculator: {
    isOpen: false,
    category: 'Full Home',
    shape: 'Rectangle',
    bhk: 1,
    area: 1000,
    quality: 'premium',
    result: null,
    history: [],
    settings: getCalculatorSettings(),
    selectedDesignId: null,
    relatedDesigns: []
  }
};

type ChatbotSettingsState = {
  assistantName: string;
  greeting: string;
  bookingReply: string;
  suggestionsIntro: string;
  enabled: boolean;
};

type ChatbotStatsState = {
  totalMessages: number;
  bookingIntents: number;
  suggestionIntents: number;
  registeredMessages: number;
  newGuestMessages: number;
  returningGuestMessages: number;
  lastUpdated: string;
};

type ChatbotHistoryEntry = {
  id: string;
  userType: ChatbotUserType;
  userId: string;
  userName: string;
  customerEmail?: string;
  query: string;
  response: string;
  createdAt: string;
};

const CHATBOT_SETTINGS_KEY = 'ar_interia_chatbot_settings_v1';
const CHATBOT_STATS_KEY = 'ar_interia_chatbot_stats_v1';
const CHATBOT_VISITOR_KEY = 'ar_interia_chatbot_visitor_v1';
const CHATBOT_HISTORY_KEY = 'ar_interia_chatbot_history_v1';
const CHATBOT_HISTORY_MAX = 300;

const DEFAULT_CHATBOT_SETTINGS: ChatbotSettingsState = {
  assistantName: 'Aria',
  greeting: `👋 Hi! I'm **Aria**, your AR Interia design assistant.\n\nAsk me anything about our services, pricing, or book a consultation!`,
  bookingReply: `📅 **Booking Support**\n\nGreat choice! I can help you book right away.\n\n1. Open the **Inquiry** page\n2. Share room type, budget, and preferred date\n3. Our team confirms within **24 hours**\n\n📞 Need quick help: +91 8904712858`,
  suggestionsIntro: `✨ Based on your interest, here are design ideas you can explore:`,
  enabled: true
};

const DEFAULT_CHATBOT_STATS: ChatbotStatsState = {
  totalMessages: 0,
  bookingIntents: 0,
  suggestionIntents: 0,
  registeredMessages: 0,
  newGuestMessages: 0,
  returningGuestMessages: 0,
  lastUpdated: ''
};

const loadChatbotSettings = (): ChatbotSettingsState => {
  try {
    const raw = localStorage.getItem(CHATBOT_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_CHATBOT_SETTINGS };
    return { ...DEFAULT_CHATBOT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CHATBOT_SETTINGS };
  }
};

const loadChatbotStats = (): ChatbotStatsState => {
  try {
    const raw = localStorage.getItem(CHATBOT_STATS_KEY);
    if (!raw) return { ...DEFAULT_CHATBOT_STATS };
    return { ...DEFAULT_CHATBOT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CHATBOT_STATS };
  }
};

const loadChatbotHistory = (): ChatbotHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(CHATBOT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && entry.query && entry.response)
      .slice(-CHATBOT_HISTORY_MAX);
  } catch {
    return [];
  }
};

let chatbotSettingsState = loadChatbotSettings();
let chatbotStatsState = loadChatbotStats();
let chatbotHistoryState = loadChatbotHistory();

const persistChatbotSettings = () => {
  localStorage.setItem(CHATBOT_SETTINGS_KEY, JSON.stringify(chatbotSettingsState));
};

const persistChatbotStats = () => {
  localStorage.setItem(CHATBOT_STATS_KEY, JSON.stringify(chatbotStatsState));
};

const persistChatbotHistory = () => {
  localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(chatbotHistoryState.slice(-CHATBOT_HISTORY_MAX)));
};

const getChatbotWelcomeMessage = () =>
  createMessage('bot', chatbotSettingsState.greeting, ['View Services', 'Pricing Info', 'Book Consultation']);

const resetChatbotMessages = () => {
  state.chatbot.messages = [getChatbotWelcomeMessage()];
  state.chatbot.inputText = '';
  state.chatbot.isTyping = false;
};

type ChatbotGuestProfile = {
  seenBefore: boolean;
  messageCount: number;
  lastSeen: string;
};

type ChatbotUserType = 'registered' | 'newGuest' | 'returningGuest';

const getGuestChatbotProfile = (): ChatbotGuestProfile => {
  try {
    const raw = localStorage.getItem(CHATBOT_VISITOR_KEY);
    if (!raw) {
      return {
        seenBefore: false,
        messageCount: 0,
        lastSeen: ''
      };
    }
    const parsed = JSON.parse(raw);
    return {
      seenBefore: Boolean(parsed?.seenBefore),
      messageCount: Number(parsed?.messageCount || 0),
      lastSeen: String(parsed?.lastSeen || '')
    };
  } catch {
    return {
      seenBefore: false,
      messageCount: 0,
      lastSeen: ''
    };
  }
};

const persistGuestChatbotProfile = (profile: ChatbotGuestProfile) => {
  localStorage.setItem(CHATBOT_VISITOR_KEY, JSON.stringify(profile));
};

const getChatbotUserType = (): ChatbotUserType => {
  if (state.currentUser?.id) return 'registered';
  const profile = getGuestChatbotProfile();
  return profile.seenBefore || profile.messageCount > 0 ? 'returningGuest' : 'newGuest';
};

const updateGuestChatbotProfileAfterMessage = () => {
  if (state.currentUser?.id) return;
  const profile = getGuestChatbotProfile();
  const nextProfile: ChatbotGuestProfile = {
    seenBefore: true,
    messageCount: profile.messageCount + 1,
    lastSeen: new Date().toISOString()
  };
  persistGuestChatbotProfile(nextProfile);
};

const recordChatbotHistory = (query: string, response: string) => {
  const normalizedQuery = String(query || '').trim();
  const normalizedResponse = String(response || '').trim();
  if (!normalizedQuery || !normalizedResponse) return;

  const userType = getChatbotUserType();
  const userId = String(state.currentUser?.id || 'guest');
  const userName = String(state.currentUser?.name || (userType === 'newGuest' ? 'New Guest' : 'Guest'));

  const entry: ChatbotHistoryEntry = {
    id: `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userType,
    userId,
    userName,
    query: normalizedQuery,
    response: normalizedResponse,
    createdAt: new Date().toISOString()
  };

  chatbotHistoryState = [...chatbotHistoryState, entry].slice(-CHATBOT_HISTORY_MAX);
  persistChatbotHistory();

  // Persist registered customer chatbot history to backend so admin can see existing users' queries.
  if (state.currentUser?.id) {
    void apiFetch('/chatbot/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        query: normalizedQuery,
        response: normalizedResponse,
        userType,
        userName
      })
    }).catch((error) => {
      console.warn('Failed to persist chatbot history to server:', error);
    });
  }
};

const bookingIntentPattern = /(book|booking|appointment|consult|consultation|schedule|reserve)/i;
const suggestionIntentPattern = /(suggest|recommend|idea|inspiration|which design|best design|interest|style)/i;

const interestKeywordMap: Array<{ key: string; patterns: RegExp[] }> = [
  { key: 'kitchen', patterns: [/kitchen|modular/i] },
  { key: 'bedroom', patterns: [/bedroom|master bedroom|kids bedroom/i] },
  { key: 'living', patterns: [/living room|living|hall|lounge/i] },
  { key: 'bathroom', patterns: [/bathroom|washroom/i] },
  { key: 'office', patterns: [/office|workspace|study/i] },
  { key: 'dining', patterns: [/dining/i] },
  { key: 'pooja', patterns: [/pooja|prayer/i] },
  { key: 'gym', patterns: [/gym|fitness/i] },
  { key: 'terrace', patterns: [/terrace|balcony|outdoor/i] }
];

const detectCustomerInterest = (message: string): string | null => {
  for (const item of interestKeywordMap) {
    if (item.patterns.some((pattern) => pattern.test(message))) {
      return item.key;
    }
  }
  return null;
};

const getDesignSuggestionsByInterest = (interestKey: string) => {
  const allDesigns = getDesigns().filter((design) => !(design as DesignModel & { isDeleted?: boolean }).isDeleted);
  const normalizedInterest = interestKey.toLowerCase();
  const matched = allDesigns.filter((design) => {
    const categoryText = `${design.category || ''} ${design.categoryId || ''}`.toLowerCase();
    const titleText = (design.title || '').toLowerCase();
    return categoryText.includes(normalizedInterest) || titleText.includes(normalizedInterest);
  });
  const source = matched.length > 0 ? matched : allDesigns;
  return source.slice(0, 3);
};

const getEnhancedChatbotResponse = (userMessage: string): { text: string; quickReplies?: string[]; bookingIntent: boolean; suggestionIntent: boolean } => {
  const trimmed = String(userMessage || '').trim();
  const lower = trimmed.toLowerCase();

  if (!chatbotSettingsState.enabled) {
    return {
      text: '💤 Chat assistant is temporarily disabled by admin. Please use the Inquiry page or call +91 8904712858.',
      quickReplies: ['Go to Inquiry', 'Call Us'],
      bookingIntent: false,
      suggestionIntent: false
    };
  }

  const bookingIntent = bookingIntentPattern.test(lower);
  const explicitSuggestionIntent = suggestionIntentPattern.test(lower);
  const interest = detectCustomerInterest(lower);
  const suggestionIntent = explicitSuggestionIntent || Boolean(interest);

  if (bookingIntent) {
    if (!state.currentUser?.id) {
      return {
        text: '🔐 To book a consultation, please sign in first so we can securely save your booking details and updates.',
        quickReplies: ['Sign In to Book', 'View Services', 'Pricing Info'],
        bookingIntent: true,
        suggestionIntent
      };
    }
    return {
      text: chatbotSettingsState.bookingReply,
      quickReplies: ['Go to Inquiry', 'Book Consultation', 'Pricing Info'],
      bookingIntent: true,
      suggestionIntent
    };
  }

  if (suggestionIntent) {
    const interestKey = interest || 'design';
    const suggestions = getDesignSuggestionsByInterest(interestKey)
      .map((design, index) => `${index + 1}. ${resolveDesignDisplayName(design, { imageUrl: design.previewImage, categoryId: design.categoryId })} — ${formatCurrency(getDesignAmount(design as any))}`)
      .join('\n');
    const suggestionText = suggestions
      ? `${chatbotSettingsState.suggestionsIntro}\n\n${suggestions}\n\nTap **View Gallery** to explore more and open 3D previews.`
      : `${chatbotSettingsState.suggestionsIntro}\n\nPlease open the gallery to explore current collections.`;
    return {
      text: suggestionText,
      quickReplies: ['View Gallery', 'Book Consultation', 'Pricing Info'],
      bookingIntent,
      suggestionIntent: true
    };
  }

  // Feedback intent — start the inline feedback flow
  const feedbackIntent = /\b(feedback|leave feedback|rate us|give rating|my review|submit feedback|review us|rate experience)\b/.test(lower);
  if (feedbackIntent) {
    if (!state.currentUser?.id) {
      return {
        text: `⭐ Want to leave feedback? Please **sign in** first so we can save your review.`,
        quickReplies: ['Sign In', 'View Services', 'Pricing Info'],
        bookingIntent: false,
        suggestionIntent: false
      };
    }
    state.chatbot.feedbackStep = 'awaiting-rating';
    return {
      text: `⭐ **We'd love your feedback!**\n\nHow would you rate your overall experience with AR Interia?\n\n_1 = Poor · 5 = Excellent_`,
      quickReplies: ['1 ⭐ Poor', '2 ⭐⭐ Fair', '3 ⭐⭐⭐ Good', '4 ⭐⭐⭐⭐ Great', '5 ⭐⭐⭐⭐⭐ Excellent'],
      bookingIntent: false,
      suggestionIntent: false
    };
  }

  // My Activity intent — switch chatbot to activity tab
  const activityIntent = /\b(my activity|my bookings|my history|what i liked|my orders|my profile|my likes|my feedback)\b/.test(lower);
  if (activityIntent && state.currentUser?.id) {
    state.chatbot.activeTab = 'activity';
    return {
      text: `📊 I've opened your **Activity Summary**! Check your recent bookings, liked designs, and past feedback in the My Activity tab above.`,
      quickReplies: ['Leave Feedback', 'View Gallery', 'Book Consultation'],
      bookingIntent: false,
      suggestionIntent: false
    };
  }

  const fallback = getBotResponse(trimmed);
  return {
    text: fallback.text,
    quickReplies: fallback.quickReplies,
    bookingIntent,
    suggestionIntent
  };
};

const trackChatbotMessageStats = (response: { bookingIntent: boolean; suggestionIntent: boolean }) => {
  const userType = getChatbotUserType();
  chatbotStatsState.totalMessages += 1;
  if (response.bookingIntent) chatbotStatsState.bookingIntents += 1;
  if (response.suggestionIntent) chatbotStatsState.suggestionIntents += 1;
  if (userType === 'registered') chatbotStatsState.registeredMessages += 1;
  if (userType === 'newGuest') chatbotStatsState.newGuestMessages += 1;
  if (userType === 'returningGuest') chatbotStatsState.returningGuestMessages += 1;
  updateGuestChatbotProfileAfterMessage();
  chatbotStatsState.lastUpdated = new Date().toISOString();
  persistChatbotStats();
  if (state.activeTab === 'admin') {
    render();
  }
};

const handleChatNavigationIntent = (message: string) => {
  const lower = String(message || '').toLowerCase();
  const bookingIntent = bookingIntentPattern.test(lower) || /book now|book consultation|sign in to book/.test(lower);

  if (bookingIntent) {
    setTimeout(() => {
      if (!state.currentUser?.id) {
        state.confirmMessage = 'Please sign in to continue booking.';
        navigateTo('login');
      } else {
        navigateTo('contact');
      }
    }, 800);
    return;
  }

  if (lower.includes('gallery')) setTimeout(() => navigateTo('gallery'), 800);
  else if (lower.includes('portfolio')) setTimeout(() => navigateTo('portfolio'), 800);
  else if (lower.includes('services')) setTimeout(() => navigateTo('services'), 800);
  else if (lower.includes('showroom')) setTimeout(() => navigateTo('showroom'), 800);
  else if (lower.includes('categories') || lower.includes('browse categories')) setTimeout(() => navigateTo('categories'), 800);
  else if (lower.includes('design studio')) {
    setTimeout(() => {
      if (!state.currentUser?.id) {
        state.confirmMessage = 'To use Design Studio, you need to log in.';
        navigateTo('login');
      } else {
        navigateTo('ai-studio');
      }
    }, 800);
  }
  else if (lower.includes('ai studio') || lower.includes('ai-studio')) setTimeout(() => navigateTo('ai-studio'), 800);
  else if (lower.includes('inquiry') || lower.includes('contact')) setTimeout(() => navigateTo('contact'), 800);
  else if (lower.includes('sign in') || lower.includes('login')) setTimeout(() => navigateTo('login'), 800);
};

const renderStabilized = () => {
  render();
};

type RefreshOptions = {
  silent?: boolean;
  force?: boolean;
};

const shouldRenderRefreshResult = (options?: RefreshOptions) => !options?.silent;

type AdminChartInstance = {
  data: {
    labels: any[];
    datasets: Array<{ data: any[] }>;
  };
  options?: any;
  update: () => void;
  destroy: () => void;
};

type AdminChartConstructor = new (ctx: HTMLCanvasElement, config: any) => AdminChartInstance;

const charts: { profit?: AdminChartInstance; revenue?: AdminChartInstance; category?: AdminChartInstance; bookings?: AdminChartInstance } = {};
let adminChartConstructor: AdminChartConstructor | null = null;
let adminChartsObserver: IntersectionObserver | null = null;
let adminChartsInitInFlight = false;
let adminChartsAutoRefreshId: number | null = null;
let adminChartsVisibilityBound = false;
let adminChartsRetryTimer: number | null = null;
let adminChartsRefreshInFlight = false;
let adminLastInteractionAt = 0;
let adminLastRefreshRenderSignature = '';
let customerRefreshInFlight = false;
let adminRefreshInFlight = false;
let dashboardSyncInFlight = false;
let postLoginSyncTimer: number | null = null;
const ADMIN_CHARTS_AUTO_REFRESH_MS = 12000;
const ADMIN_INTERACTION_IDLE_MS = 10000;

const getAdminRefreshRenderSignature = () => {
  const bookings = getEffectiveBookings();
  let latestBookingTime = 0;
  for (const booking of bookings) {
    const time = new Date(String((booking as any)?.updatedAt || (booking as any)?.createdAt || 0)).getTime();
    if (Number.isFinite(time) && time > latestBookingTime) latestBookingTime = time;
  }

  const mergedFeedbacks = [...(state.feedbacks || []), ...(state.customer.feedbacks || [])];
  let latestFeedbackTime = 0;
  for (const feedback of mergedFeedbacks) {
    const time = new Date(String((feedback as any)?.updatedAt || (feedback as any)?.createdAt || 0)).getTime();
    if (Number.isFinite(time) && time > latestFeedbackTime) latestFeedbackTime = time;
  }

  const invoiceCount = Number((state.admin as any)?.invoices?.length || 0);
  return [
    bookings.length,
    latestBookingTime,
    mergedFeedbacks.length,
    latestFeedbackTime,
    invoiceCount,
    String((state.admin as any)?.bookingsLastSyncedAt || '')
  ].join('|');
};

const markAdminInteraction = () => {
  adminLastInteractionAt = Date.now();
};

const isAdminInteractionWarm = () => (Date.now() - adminLastInteractionAt) < ADMIN_INTERACTION_IDLE_MS;

const loadAdminChartConstructor = async (): Promise<AdminChartConstructor> => {
  if (adminChartConstructor) return adminChartConstructor;
  const chartModule = await import('chart.js/auto');
  const chartCtor = (chartModule as any)?.default || (chartModule as any)?.Chart;
  if (typeof chartCtor !== 'function') {
    throw new Error('Chart.js constructor unavailable after import.');
  }
  adminChartConstructor = chartCtor as AdminChartConstructor;
  return adminChartConstructor;
};

const getCategoryChartColors = (count: number) => {
  if (count <= 0) return ['#e5e7eb'];
  return Array.from({ length: count }, (_, index) => {
    const hue = Math.round((index * 360) / count);
    return `hsl(${hue}, 70%, 56%)`;
  });
};

const getAdminCategoryChartPayload = (categoryEarnings: Array<{ categoryId: string; categoryTitle: string; earnings: number; bookings: number }>) => {
  const labels = categoryEarnings.length > 0
    ? categoryEarnings.map((c) => c.categoryTitle)
    : ['No Revenue Data'];

  if (categoryEarnings.length === 0) {
    return {
      labels,
      data: [1],
      hasCategoryValues: false
    };
  }

  const seedRevenueByCategoryId = new Map(
    getPortfolioSampleCategorySeries().map((seed: any) => [String(seed?.id || '').trim(), Number(seed?.revenue || 0)])
  );

  const rawData = categoryEarnings.map((c) => {
    const earnings = Number(c.earnings || 0);
    const bookings = Number(c.bookings || 0);
    if (earnings > 0) return earnings;
    if (bookings > 0) return Math.max(8000, bookings * 6000);

    const seedRevenue = Number(seedRevenueByCategoryId.get(String(c.categoryId || '').trim()) || 0);
    // Keep every category visibly represented without overpowering real revenue bars.
    return Math.max(5000, Math.round(seedRevenue * 0.03));
  });

  // Compress extremes so all categories stay visible in the doughnut chart.
  const data = rawData.map((value) => Number(Math.max(Math.log10(Math.max(value, 1)) * 1000, 150).toFixed(2)));

  return {
    labels,
    data,
    hasCategoryValues: data.some((value) => value > 0)
  };
};

// Portfolio Charts
const portfolioCharts: { sales?: any; trend?: any; categoryPie?: any; revenue?: any; ranking?: any } = {};
let portfolioChartConstructor: any = null;

const loadPortfolioChartConstructor = async (): Promise<any> => {
  if (portfolioChartConstructor) return portfolioChartConstructor;
  const chartModule = await import('chart.js/auto');
  const chartCtor = (chartModule as any)?.default || (chartModule as any)?.Chart;
  if (typeof chartCtor !== 'function') {
    throw new Error('Chart.js constructor unavailable after import.');
  }
  portfolioChartConstructor = chartCtor;
  return portfolioChartConstructor;
};

const getPortfolioBookingsSource = () => {
  const adminBookings = Array.isArray(state.admin.bookings) ? state.admin.bookings : [];
  const customerBookings = Array.isArray(state.customer.bookings) ? state.customer.bookings : [];
  const localBookings = getBookings();

  const merged = [...adminBookings, ...customerBookings, ...localBookings]
    .map((booking: any) => normalizeBookingRecord(booking))
    .filter(Boolean);

  // Deduplicate by booking id while preserving first-seen order.
  const seen = new Set<string>();
  return merged.filter((booking: any) => {
    const id = String(booking?.id || '').trim();
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const getPaidPortfolioBookings = () => getPortfolioBookingsSource().filter((b: any) => {
  const resolvedStatus = typeof getBookingPaymentStatus === 'function'
    ? getBookingPaymentStatus(b)
    : String(b?.paymentStatus || '').toLowerCase();
  return resolvedStatus === 'paid';
});

const getActivePortfolioBookings = () => getPortfolioBookingsSource().filter((b: any) => {
  const status = String((b as any)?.status || '').toLowerCase();
  const paymentStatus = typeof getBookingPaymentStatus === 'function'
    ? getBookingPaymentStatus(b)
    : String((b as any)?.paymentStatus || '').toLowerCase();
  return paymentStatus !== 'failed' && status !== 'cancelled' && status !== 'canceled';
});

const PORTFOLIO_CATEGORY_NAME_MAP: Record<string, string> = {
  'cat-living': 'Living Room',
  'cat-kitchen': 'Kitchen',
  'cat-masterbedroom': 'Master Bedroom',
  'cat-apartment': 'Apartment',
  'cat-bedroom': 'Bedroom',
  'cat-guestroom': 'Guest Room',
  'cat-classroom': 'Classroom',
  'cat-custom': 'Custom',
  'cat-dining-room': 'Dining Room',
  'cat-epoxy-floor': 'Epoxy Floor',
  'cat-garden': 'Garden',
  'cat-home-theatre': 'Home Theatre',
  'cat-kids-bedroom': 'Kids Bedroom',
  'cat-meeting-room': 'Meeting Room',
  'cat-office-interior': 'Office Interior',
  'cat-swimming-pool': 'Swimming Pool',
  'cat-terrace': 'Terrace',
  'cat-epoxy': 'Epoxy',
  'cat-balcony': 'Balcony',
  'cat-bathroom': 'Bathroom',
  'cat-wardrobe': 'Wardrobe',
  'cat-diningarea': 'Dining Area',
  'cat-pooja': 'Pooja Room',
  'cat-gym': 'Gym',
  'cat-spa': 'Spa',
  'cat-pool': 'Swimming Pool'
};

const getPortfolioAvailableCategories = () => {
  const source = Array.isArray(state.customer.categories) && state.customer.categories.length > 0
    ? state.customer.categories
    : getCategories();
  return (source || []).map((cat: any) => ({
    id: String(cat?.id || '').trim(),
    name: String(cat?.title || cat?.name || '').trim()
  })).filter((cat: any) => cat.id && cat.name);
};

const getPortfolioDefaultCategory = () => {
  const available = getPortfolioAvailableCategories();
  return available[0] || { id: 'cat-living', name: 'Living Room' };
};

const getPortfolioSampleCategorySeries = () => {
  const available = getPortfolioAvailableCategories();
  const categoryHints = [
    { id: 'cat-apartment', label: 'Apartment', patterns: ['apartment'] },
    { id: 'cat-balcony', label: 'Balcony', patterns: ['balcony'] },
    { id: 'cat-bathroom', label: 'Bathroom', patterns: ['bathroom', 'bath'] },
    { id: 'cat-bedroom', label: 'Bedroom', patterns: ['bedroom'] },
    { id: 'cat-classroom', label: 'Classroom', patterns: ['classroom'] },
    { id: 'cat-custom', label: 'Custom', patterns: ['custom'] },
    { id: 'cat-diningarea', label: 'Dining Area', patterns: ['dining area'] },
    { id: 'cat-dining-room', label: 'Dining Room', patterns: ['dining room'] },
    { id: 'cat-epoxy-floor', label: 'Epoxy Floor', patterns: ['epoxy floor'] },
    { id: 'cat-garden', label: 'Garden', patterns: ['garden'] },
    { id: 'cat-guestroom', label: 'Guest Room', patterns: ['guestroom', 'guest room', 'guest'] },
    { id: 'cat-gym', label: 'Gym', patterns: ['gym'] },
    { id: 'cat-home-theatre', label: 'Home Theatre', patterns: ['home theatre', 'home theater', 'theatre', 'theater'] },
    { id: 'cat-kids-bedroom', label: 'Kids Bedroom', patterns: ['kids bedroom', 'kid bedroom'] },
    { id: 'cat-kitchen', label: 'Kitchen', patterns: ['kitchen'] },
    { id: 'cat-living', label: 'Living Room', patterns: ['living room', 'living'] },
    { id: 'cat-masterbedroom', label: 'Master Bedroom', patterns: ['master bedroom', 'masterbedroom'] },
    { id: 'cat-meeting-room', label: 'Meeting Room', patterns: ['meeting room'] },
    { id: 'cat-office-interior', label: 'Office Interior', patterns: ['office interior', 'office'] },
    { id: 'cat-pooja', label: 'Pooja Room', patterns: ['pooja'] },
    { id: 'cat-spa', label: 'Spa', patterns: ['spa'] },
    { id: 'cat-swimming-pool', label: 'Swimming Pool', patterns: ['swimming pool'] },
    { id: 'cat-terrace', label: 'Terrace', patterns: ['terrace'] },
    { id: 'cat-wardrobe', label: 'Wardrobe', patterns: ['wardrobe'] },
    { id: 'cat-epoxy', label: 'Epoxy', patterns: ['epoxy'] },
    { id: 'cat-pool', label: 'Swimming Pool', patterns: ['pool'] }
  ];

  const resolved = categoryHints.map((hint, index) => {
    const match = available.find((cat: any) => {
      const hay = `${String(cat.id || '')} ${String(cat.name || '')}`.toLowerCase();
      return hint.patterns.some((pattern) => hay.includes(pattern));
    });
    return {
      id: match?.id || hint.id,
      name: match?.name || hint.label,
      count: Math.max(2, 30 - index),
      revenue: Math.max(90000, 620000 - (index * 18000))
    };
  });

  return Array.from(new Map(resolved.map((item) => [item.id, item])).values());
};

const resolvePortfolioCategoryId = (booking: any): string => {
  const rawCategoryId = String(booking?.categoryId || '').trim();
  if (rawCategoryId) return rawCategoryId;

  const rawCategory = String(booking?.category || '').trim().toLowerCase();
  if (rawCategory) {
    if (rawCategory.includes('apartment')) return 'cat-apartment';
    if (rawCategory.includes('classroom')) return 'cat-classroom';
    if (rawCategory.includes('custom')) return 'cat-custom';
    if (rawCategory.includes('dining room')) return 'cat-dining-room';
    if (rawCategory.includes('dining area')) return 'cat-diningarea';
    if (rawCategory.includes('epoxy floor')) return 'cat-epoxy-floor';
    if (rawCategory.includes('garden')) return 'cat-garden';
    if (rawCategory.includes('guest')) return 'cat-guestroom';
    if (rawCategory.includes('home theatre') || rawCategory.includes('home theater')) return 'cat-home-theatre';
    if (rawCategory.includes('kids bedroom') || rawCategory.includes('kid bedroom')) return 'cat-kids-bedroom';
    if (rawCategory.includes('meeting room')) return 'cat-meeting-room';
    if (rawCategory.includes('office interior') || rawCategory.includes('office')) return 'cat-office-interior';
    if (rawCategory.includes('epoxy')) return 'cat-epoxy';
    if (rawCategory.includes('bedroom')) return 'cat-bedroom';
    if (rawCategory.includes('swimming pool')) return 'cat-swimming-pool';
    if (rawCategory.includes('terrace')) return 'cat-terrace';
    if (rawCategory.includes('living')) return 'cat-living';
    if (rawCategory.includes('kitchen')) return 'cat-kitchen';
    if (rawCategory.includes('bed')) return 'cat-masterbedroom';
    if (rawCategory.includes('bath')) return 'cat-bathroom';
    if (rawCategory.includes('balcony')) return 'cat-balcony';
    if (rawCategory.includes('wardrobe')) return 'cat-wardrobe';
    if (rawCategory.includes('dining')) return 'cat-diningarea';
    if (rawCategory.includes('pooja')) return 'cat-pooja';
  }

  return getPortfolioDefaultCategory().id;
};

const resolvePortfolioCategoryName = (categoryId: string) => {
  const safeId = String(categoryId || '').trim() || getPortfolioDefaultCategory().id;
  if (PORTFOLIO_CATEGORY_NAME_MAP[safeId]) return PORTFOLIO_CATEGORY_NAME_MAP[safeId];
  const dynamicMatch = getPortfolioAvailableCategories().find((cat: any) => cat.id === safeId);
  if (dynamicMatch) return dynamicMatch.name;
  return safeId.replace('cat-', '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const resolvePortfolioDesignName = (booking: any) => {
  const explicitName = String(booking?.designName || booking?.title || '').trim();
  if (explicitName) return explicitName;
  const categoryName = resolvePortfolioCategoryName(resolvePortfolioCategoryId(booking));
  return `${categoryName} Signature Design`;
};

const getRollingMonthSeries = (months = 12, endDate = new Date()) => {
  const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(normalizedEnd.getFullYear(), normalizedEnd.getMonth() - (months - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  });
};

const normalizeHistoricalDate = (value?: string | number | Date | null) => {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  while (date.getTime() > now.getTime()) {
    date.setFullYear(date.getFullYear() - 1);
  }
  return date;
};

const formatMonthYearDate = (value?: string | number | Date | null) => {
  const date = normalizeHistoricalDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const getQuarterlySampleMetrics = () => {
  const series = getRollingMonthSeries(12);
  const sampleValues = [
    { sales: 12, customers: 9 },
    { sales: 16, customers: 12 },
    { sales: 21, customers: 15 },
    { sales: 27, customers: 20 },
    { sales: 24, customers: 18 },
    { sales: 31, customers: 22 },
    { sales: 35, customers: 24 },
    { sales: 29, customers: 21 },
    { sales: 37, customers: 26 },
    { sales: 41, customers: 28 },
    { sales: 44, customers: 31 },
    { sales: 49, customers: 35 }
  ];
  return series.map((entry, index) => ({
    label: entry.label,
    sales: sampleValues[index]?.sales || 0,
    customers: sampleValues[index]?.customers || 0
  }));
};

const getPortfolioMetricLabel = (label: string) => {
  const raw = String(label || '').trim();
  const monthLookup: Record<string, string> = {
    jan: 'January', january: 'January',
    feb: 'February', february: 'February',
    mar: 'March', march: 'March',
    apr: 'April', april: 'April',
    may: 'May',
    jun: 'June', june: 'June',
    jul: 'July', july: 'July',
    aug: 'August', august: 'August',
    sep: 'September', sept: 'September', september: 'September',
    oct: 'October', october: 'October',
    nov: 'November', november: 'November',
    dec: 'December', december: 'December'
  };
  const lower = raw.toLowerCase();
  if (monthLookup[lower]) return monthLookup[lower];
  const quarterMatch = raw.match(/^Q([1-4])$/i);
  if (quarterMatch) {
    const quarterToMonth = ['January', 'April', 'July', 'October'];
    return quarterToMonth[Math.max(0, Math.min(3, Number(quarterMatch[1]) - 1))];
  }
  const monthIndexMatch = raw.match(/^Month\s*([1-9]|1[0-2])$/i);
  if (monthIndexMatch) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[Math.max(0, Number(monthIndexMatch[1]) - 1)];
  }
  return raw || 'January';
};

const getPortfolioFeedbackSource = () => {
  const merged = [...(state.feedbacks || []), ...(state.customer.feedbacks || [])].filter(Boolean);
  return Array.from(
    new Map(
      merged.map((feedback: any, index: number) => {
        const id = String(feedback?.id || `${feedback?.userId || 'anon'}:${feedback?.createdAt || index}:${feedback?.comment || ''}`);
        return [id, feedback];
      })
    ).values()
  );
};

const SEED_CUSTOMER_FIRST_NAMES = [
  'Aarav', 'Aanya', 'Vihaan', 'Ishita', 'Arjun', 'Saanvi', 'Reyansh', 'Anika', 'Kabir', 'Meera',
  'Aditya', 'Priya', 'Rohan', 'Nisha', 'Karan', 'Sneha', 'Dev', 'Neha', 'Rahul', 'Pooja',
  'Siddharth', 'Kavya', 'Mohan', 'Ritika', 'Yash', 'Shreya', 'Manish', 'Tanya', 'Harsh', 'Rhea'
];

const SEED_CUSTOMER_LAST_NAMES = [
  'Mehta', 'Sharma', 'Iyer', 'Rao', 'Nair', 'Kapoor', 'Gupta', 'Singh', 'Joshi', 'Menon',
  'Verma', 'Das', 'Khanna', 'Bhat', 'Patel', 'Reddy', 'Malhotra', 'Pillai', 'Mehra', 'Sethi',
  'Jain', 'Anand', 'Ahuja', 'Bansal', 'Chawla', 'Vardhan', 'Kumar', 'Khatri', 'Batra', 'Sen'
];

const buildSeedCustomerNames = () => {
  const userNames = (Array.isArray(state.users) ? state.users : [])
    .map((user: any) => String(user?.name || '').trim())
    .filter(Boolean);

  const generatedNames: string[] = [];
  for (let index = 0; generatedNames.length < 250; index++) {
    const first = SEED_CUSTOMER_FIRST_NAMES[index % SEED_CUSTOMER_FIRST_NAMES.length];
    const last = SEED_CUSTOMER_LAST_NAMES[Math.floor(index / SEED_CUSTOMER_FIRST_NAMES.length) % SEED_CUSTOMER_LAST_NAMES.length];
    generatedNames.push(`${first} ${last}`);
  }

  return Array.from(new Set([...userNames, ...generatedNames])).slice(0, 250);
};

const getPortfolioDisplayBookings = () => {
  const realBookings = getActivePortfolioBookings();
  const existingCustomerIds = new Set(
    realBookings
      .map((booking: any) => String(booking?.userId || '').trim())
      .filter(Boolean)
  );

  const customerNames = buildSeedCustomerNames();
  const designs = (state.customer.designs && state.customer.designs.length > 0) ? state.customer.designs : getDesigns();
  const categories = getPortfolioAvailableCategories();
  const seededCustomerCount = Math.max(250 - existingCustomerIds.size, 0);
  const existingCategoryIds = new Set(
    realBookings
      .map((booking: any) => String(resolvePortfolioCategoryId(booking) || '').trim())
      .filter(Boolean)
  );
  const categoryCoverageGaps = categories.filter((category: any) => !existingCategoryIds.has(String(category?.id || '').trim()));
  const seedCount = seededCustomerCount + categoryCoverageGaps.length;
  if (seedCount === 0) return realBookings;

  const categoryDesignPool = categories.map((category: any) => {
    const categoryKeys = getCategoryMatchKeySet(String(category?.id || ''), String(category?.name || ''));
    const matchingDesigns = designs.filter((design: any) => {
      const designKeys = getCategoryMatchKeySet(String(design?.categoryId || ''), String((design as any)?.category || ''));
      return Array.from(designKeys).some((key) => categoryKeys.has(key));
    });
    return { category, designs: matchingDesigns };
  });

  const seededBookings = Array.from({ length: seedCount }, (_, index) => {
    const isCoverageSeed = index >= seededCustomerCount;
    const coverageIndex = Math.max(index - seededCustomerCount, 0);
    const categoryForCoverage = isCoverageSeed ? categoryCoverageGaps[coverageIndex % Math.max(categoryCoverageGaps.length, 1)] : null;
    const customerName = customerNames[index % customerNames.length] || `Customer ${index + 1}`;
    const customerId = isCoverageSeed
      ? (Array.from(existingCustomerIds)[coverageIndex % Math.max(existingCustomerIds.size, 1)] || `seed-customer-${(coverageIndex % 250) + 1}`)
      : `seed-customer-${index + 1}`;
    const categoryEntry = categoryForCoverage
      ? (categoryDesignPool.find((entry: any) => String(entry?.category?.id || '') === String(categoryForCoverage.id || '')) || { category: categoryForCoverage, designs: [] })
      : (categoryDesignPool[index % Math.max(categoryDesignPool.length, 1)] || { category: getPortfolioDefaultCategory(), designs: [] });
    const category = categoryEntry.category || getPortfolioDefaultCategory();
    const designCandidates = Array.isArray(categoryEntry.designs) && categoryEntry.designs.length > 0
      ? categoryEntry.designs
      : designs;
    const design = designCandidates.length > 0 ? designCandidates[index % designCandidates.length] : null;
    const designName = String(design?.title || (design as any)?.designName || `${category.name} Signature Design`).trim();
    const designImage = String(design?.previewImage || design?.images?.[0] || '/hero-bg.webp').trim();
    const designId = String(design?.id || `seed-paid-design-${index + 1}`).trim();
    const seededDate = new Date();
    seededDate.setMonth(seededDate.getMonth() - (index % 12));
    seededDate.setDate((index % 27) + 1);
    seededDate.setHours(10 + (index % 8), 20, 0, 0);
    if (seededDate.getTime() > Date.now()) {
      seededDate.setFullYear(seededDate.getFullYear() - 1);
    }

    return {
      id: `seed-display-booking-${index + 1}`,
      userId: String(customerId).trim(),
      userName: customerName,
      customerName,
      customerPhone: '',
      designId,
      designName,
      designImage,
      categoryId: String(category.id || (design ? resolvePortfolioCategoryId(design) : getPortfolioDefaultCategory().id)).trim(),
      category: category.name,
      price: 12000 + (index * 125),
      paymentStatus: 'paid',
      status: 'completed',
      createdAt: seededDate.toISOString()
    };
  });

  return [...realBookings, ...seededBookings];
};

const seedPortfolioFeedbacks = () => {
  const existingFeedbacks = getPortfolioFeedbackSource();
  if (existingFeedbacks.length >= 250) return false;

  const designs = (state.customer.designs && state.customer.designs.length > 0) ? state.customer.designs : getDesigns();
  const categories = getPortfolioAvailableCategories();
  const targetCount = 250;
  const remaining = Math.max(targetCount - existingFeedbacks.length, 0);
  if (remaining <= 0) return false;
  const customerNames = buildSeedCustomerNames();

  const seededFeedbacks = Array.from({ length: remaining }, (_, index) => {
    const customerName = customerNames[index % customerNames.length] || `Customer ${index + 1}`;
    const customerId = `customer-${index + 1}`;
    const design = designs.length > 0 ? designs[index % designs.length] : null;
    const category = design
      ? resolvePortfolioCategoryName(resolvePortfolioCategoryId(design))
      : (categories.length > 0 ? categories[index % categories.length].name : 'Living Room');
    const designName = String(design?.title || (design as any)?.designName || `${category} Signature Design`).trim();
    const rating = [5, 4, 5, 5, 4, 5, 3, 4, 5, 4][index % 10];
    const commentTemplates = [
      'Loved the overall finish and space planning for {design}.',
      'The {category} setup felt premium and practical.',
      'Great detailing, lighting, and material selection on {design}.',
      'Smooth experience and the final look matched the design brief.',
      'The team handled {category} requirements very well.'
    ];
    const comment = commentTemplates[index % commentTemplates.length]
      .replace('{design}', designName)
      .replace('{category}', category);

    const seededDate = new Date();
    seededDate.setMonth(seededDate.getMonth() - (index % 12));
    seededDate.setDate((index % 27) + 1);
    seededDate.setHours(10 + (index % 8), 15, 0, 0);
    if (seededDate.getTime() > Date.now()) {
      seededDate.setFullYear(seededDate.getFullYear() - 1);
    }

    return {
      id: `seed-feedback-${index + 1}`,
      userId: customerId,
      userName: customerName,
      rating,
      comment,
      createdAt: seededDate.toISOString(),
      categoryId: design ? resolvePortfolioCategoryId(design) : undefined,
      category,
      designId: String(design?.id || '').trim(),
      designName,
      isSeeded: true
    };
  });

  const merged = [...existingFeedbacks, ...seededFeedbacks];
  state.feedbacks = merged;
  state.customer.feedbacks = [...merged];
  try {
    localStorage.setItem(STORAGE_KEYS.feedbacks, JSON.stringify(merged));
  } catch {
    // Ignore persistence failures; the in-memory seed is enough for the session.
  }
  return true;
};

let portfolioFeedbackSeedAttempted = false;
const ensurePortfolioFeedbackSeeded = () => {
  if (portfolioFeedbackSeedAttempted) return false;
  portfolioFeedbackSeedAttempted = true;
  return seedPortfolioFeedbacks();
};

const generateQuarterlyFeedbackCounts = () => {
  const feedbacks = getPortfolioFeedbackSource();
  const series = getRollingMonthSeries(12);
  const monthlyData = new Map<string, number>(series.map((entry) => [entry.key, 0]));

  feedbacks.forEach((feedback: any) => {
    const feedbackDate = normalizeHistoricalDate(feedback?.createdAt || new Date());
    if (!feedbackDate) return;
    const key = `${feedbackDate.getFullYear()}-${String(feedbackDate.getMonth()).padStart(2, '0')}`;
    if (monthlyData.has(key)) {
      monthlyData.set(key, (monthlyData.get(key) || 0) + 1);
    }
  });

  return series.map((entry) => monthlyData.get(entry.key) || 0);
};

// Auto-populate monthly metrics from real bookings
const generateQuarterlyMetricsFromBookings = (sourceBookings?: any[] | null) => {
  const paidBookings = getPaidPortfolioBookings();
  const activeBookings = getActivePortfolioBookings();
  const bookings = Array.isArray(sourceBookings) ? sourceBookings : (paidBookings.length > 0 ? paidBookings : activeBookings);
  if (bookings.length === 0) return null;

  const series = getRollingMonthSeries(12);
  const monthlyData = new Map<string, { count: number; customers: Set<string> }>(
    series.map((entry) => [entry.key, { count: 0, customers: new Set<string>() }])
  );
  
  bookings.forEach((booking: any) => {
    const bookingDate = normalizeHistoricalDate(booking.createdAt || new Date());
    if (!bookingDate) return;
    const key = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth()).padStart(2, '0')}`;

    if (monthlyData.has(key)) {
      const bucket = monthlyData.get(key)!;
      bucket.count++;
      if (booking.userId) bucket.customers.add(booking.userId);
    }
  });
  
  return series.map((entry) => {
    const bucket = monthlyData.get(entry.key)!;
    return {
      label: entry.label,
      sales: bucket.count,
      customers: bucket.customers.size
    };
  });
};

// Auto-sync portfolio metrics from bookings
const autoSyncPortfolioMetrics = () => {
  const quarterlyMetrics = generateQuarterlyMetricsFromBookings();
  if (quarterlyMetrics && quarterlyMetrics.some((m: any) => m.sales > 0)) {
    (state.portfolioContent as any).businessMetrics = quarterlyMetrics;
    return true;
  }
  return false;
};

const initPortfolioCharts = async () => {
  try {
    const Chart = await loadPortfolioChartConstructor();
    
    // Check if we're on portfolio page
    if (state.activeTab !== 'portfolio') return;
    
    // Auto-sync metrics from real bookings first
    autoSyncPortfolioMetrics();
    
    // Sales vs Customers Bar Chart
    const salesCanv = document.getElementById('portfolio-sales-chart') as HTMLCanvasElement;
    if (salesCanv) {
      const latestMetrics = generateQuarterlyMetricsFromBookings(getPortfolioDisplayBookings());
      const metrics = latestMetrics || state.portfolioContent?.businessMetrics || getQuarterlySampleMetrics();
      if (portfolioCharts.sales) portfolioCharts.sales.destroy();
      portfolioCharts.sales = new Chart(salesCanv, {
        type: 'bar',
        data: {
          labels: metrics.map((m: any) => String(m.label || '')),
          datasets: [
            {
              label: 'Design Sales',
              data: metrics.map((m: any) => m.sales || 0),
              backgroundColor: 'rgba(236, 72, 153, 0.8)',
              borderColor: 'rgba(236, 72, 153, 1)',
              borderWidth: 2,
              borderRadius: 8
            },
            {
              label: 'Customers',
              data: metrics.map((m: any) => m.customers || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 2,
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 12 } } } },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(100, 116, 139, 0.1)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(100, 116, 139, 0.1)' } }
          }
        }
      });
    }
    
    // Performance Trend Line Chart
    const trendCanv = document.getElementById('portfolio-trend-chart') as HTMLCanvasElement;
    if (trendCanv) {
      const latestMetrics = generateQuarterlyMetricsFromBookings(getPortfolioDisplayBookings());
      const quarterlyFeedbackCounts = generateQuarterlyFeedbackCounts();
      const metrics = latestMetrics || state.portfolioContent?.businessMetrics || getQuarterlySampleMetrics();
      if (portfolioCharts.trend) portfolioCharts.trend.destroy();
      portfolioCharts.trend = new Chart(trendCanv, {
        type: 'line',
        data: {
          labels: metrics.map((m: any) => String(m.label || '')),
          datasets: [
            {
              label: 'Sales Trend',
              data: metrics.map((m: any) => m.sales || 0),
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#f97316',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5
            },
            {
              label: 'Feedback Trend',
              data: quarterlyFeedbackCounts,
              borderColor: '#a855f7',
              backgroundColor: 'rgba(168, 85, 247, 0.08)',
              borderWidth: 2,
              fill: false,
              tension: 0.35,
              pointBackgroundColor: '#a855f7',
              pointBorderColor: '#fff',
              pointBorderWidth: 1,
              pointRadius: 4,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 12 } } } },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(100, 116, 139, 0.1)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(100, 116, 139, 0.1)' } },
            y1: {
              position: 'right',
              ticks: { color: '#cbd5e1' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }
    
    // Category Pie Chart
    const pieCanv = document.getElementById('portfolio-category-pie') as HTMLCanvasElement;
    if (pieCanv) {
      const adminCategoryData = (() => {
        try {
          if (typeof getAdminChartMetrics === 'function') {
            const metrics = getAdminChartMetrics(getEffectiveBookings());
            return Array.isArray(metrics?.categoryEarnings) ? metrics.categoryEarnings : [];
          }
        } catch {
          // Fallback to booking-derived category counts below.
        }
        return [] as any[];
      })();

      const bookings = getEffectiveBookings();
      const categorySales: Record<string, number> = {};
      bookings.forEach((b: any) => {
        const cat = resolvePortfolioCategoryId(b);
        categorySales[cat] = (categorySales[cat] || 0) + 1;
      });

      const categoryPayload = adminCategoryData.length > 0
        ? getAdminCategoryChartPayload(adminCategoryData)
        : {
          labels: Object.keys(categorySales).map((cat) => resolvePortfolioCategoryName(cat)),
          data: Object.values(categorySales).map((value) => Math.max(Number(value || 0), 1)),
          hasCategoryValues: Object.values(categorySales).some((value) => Number(value || 0) > 0)
        };
      const sampleSeries = getPortfolioSampleCategorySeries();
      const fallbackLabels = sampleSeries.map((item) => item.name);
      const fallbackData = sampleSeries.map((item) => Math.max(Number(item.count || 0), 1));
      const finalLabels = categoryPayload.labels.length > 0 ? categoryPayload.labels : fallbackLabels;
      const finalData = categoryPayload.data.length > 0 ? categoryPayload.data : fallbackData;
      
      if (portfolioCharts.categoryPie) portfolioCharts.categoryPie.destroy();
      portfolioCharts.categoryPie = new Chart(pieCanv, {
        type: 'doughnut',
        data: {
          labels: finalLabels,
          datasets: [{
            data: finalData,
            backgroundColor: getCategoryChartColors(finalData.length),
            borderColor: '#1e293b',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } }, position: 'bottom' } }
        }
      });
    }
    
    // Revenue Distribution Doughnut Chart
    const revCanv = document.getElementById('portfolio-revenue-chart') as HTMLCanvasElement;
    if (revCanv) {
      const bookings = getPaidPortfolioBookings();
      const categoryRevenue: Record<string, number> = {};
      bookings.forEach((b: any) => {
        const cat = resolvePortfolioCategoryId(b);
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (b.price || 0);
      });

      const sampleSeries = getPortfolioSampleCategorySeries();
      const mergedSeries = sampleSeries.map((item) => ({
        ...item,
        revenue: Number(categoryRevenue[item.id] || 0) > 0 ? Number(categoryRevenue[item.id] || 0) : Number(item.revenue || 0)
      }));
      const existingOnly = Object.entries(categoryRevenue)
        .filter(([id]) => !mergedSeries.some((item) => item.id === id))
        .map(([id, revenue]) => ({ id, name: resolvePortfolioCategoryName(id), revenue: Number(revenue || 0) }));
      const finalSeries = [...mergedSeries, ...existingOnly]
        .filter((item) => Number(item.revenue || 0) > 0)
        .slice(0, 28);
      const labels = finalSeries.map((item) => String(item.name || resolvePortfolioCategoryName(String(item.id || ''))));
      const data = finalSeries.map((item) => Number(item.revenue || 0));
      
      if (portfolioCharts.revenue) portfolioCharts.revenue.destroy();
      portfolioCharts.revenue = new Chart(revCanv, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: getCategoryChartColors(data.length),
            borderColor: '#1e293b',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } }, position: 'bottom' } }
        }
      });
    }
    
    // Category Rankings Bar Chart (Horizontal)
    const rankCanv = document.getElementById('portfolio-ranking-chart') as HTMLCanvasElement;
    if (rankCanv) {
      const bookings = getActivePortfolioBookings();
      const categorySales: Record<string, number> = {};
      bookings.forEach((b: any) => {
        const cat = resolvePortfolioCategoryId(b);
        categorySales[cat] = (categorySales[cat] || 0) + 1;
      });

      const sampleSeries = getPortfolioSampleCategorySeries();
      const mergedEntries = sampleSeries.map((item) => ({
        label: String(item.name || resolvePortfolioCategoryName(item.id)),
        count: Number(categorySales[item.id] || 0) > 0 ? Number(categorySales[item.id] || 0) : Number(item.count || 0)
      }));
      const existingOnlyEntries = Object.entries(categorySales)
        .filter(([id]) => !sampleSeries.some((item) => item.id === id))
        .map(([id, count]) => ({ label: resolvePortfolioCategoryName(id), count: Number(count || 0) }));
      const displayEntries = [...mergedEntries, ...existingOnlyEntries]
        .filter((item) => Number(item.count || 0) > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 28);
      
      if (portfolioCharts.ranking) portfolioCharts.ranking.destroy();
      portfolioCharts.ranking = new Chart(rankCanv, {
        type: 'bar',
        data: {
          labels: displayEntries.map(e => e.label),
          datasets: [{
            label: 'Orders',
            data: displayEntries.map(e => e.count),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(100, 116, 139, 0.1)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(100, 116, 139, 0.1)' } }
          }
        }
      });
    }
  } catch (error) {
    console.warn('Portfolio chart initialization error:', error);
  }
};

const cleanupPortfolioCharts = () => {
  for (const key in portfolioCharts) {
    if (portfolioCharts[key as keyof typeof portfolioCharts]) {
      portfolioCharts[key as keyof typeof portfolioCharts]?.destroy();
      portfolioCharts[key as keyof typeof portfolioCharts] = undefined;
    }
  }
};

let portfolioAutoPlayId: number | null = null;

const DEFAULT_PORTFOLIO_CONTENT: PortfolioContent = {
  founder: { name: 'Abhilash J', role: 'Founder & CEO', bio: '', photo: '', famousDesign: 'Minimal Luxe Penthouse Series' },
  coFounder: { name: 'Ramesh', role: 'Co-Founder', bio: '', photo: '', famousDesign: 'Tropical Villa Flow Collection' },
  journey: {
    title: 'Our Journey',
    intro: 'A founder-led design practice focused on execution quality, client transparency, and memorable living spaces.',
    milestones: [
      { year: '2018', title: 'AR Interia Begins', description: 'Set up with a mission to build practical, premium interiors.' },
      { year: '2022', title: 'Scaled Across Cities', description: 'Expanded project delivery and category-specific design expertise.' },
      { year: '2025', title: 'Data-Driven Delivery', description: 'Introduced dashboard-first operations with quality tracking.' }
    ]
  },
  businessMetrics: [
    { label: 'Month 1', sales: 34, customers: 28 },
    { label: 'Month 2', sales: 47, customers: 39 },
    { label: 'Month 3', sales: 58, customers: 45 },
    { label: 'Month 4', sales: 72, customers: 56 }
  ],
  designers: [
    {
      name: 'Ananya Rao',
      role: 'Lead Interior Designer',
      bio: 'Specializes in high-function luxury apartments with natural light planning and layered textures.',
      photo: '',
      famousDesign: 'Skyline Lightwell Residence'
    },
    {
      name: 'Karthik Menon',
      role: 'Spatial Experience Designer',
      bio: 'Builds cinematic walkthrough-led layouts that balance movement, comfort, and premium detailing.',
      photo: '',
      famousDesign: 'CurveLine Villa Atrium'
    }
  ],
  feedbackVideos: [],
  featuredProjects: [
    {
      id: 'proj-villa-001',
      title: 'Luxury Beachfront Villa',
      description: 'A stunning 5BHK beachfront villa with panoramic ocean views, featuring contemporary architecture and premium finishes throughout.',
      propertyType: 'Villa',
      location: 'Palm Jumeirah, Dubai',
      area: '8,500 sqft',
      completionYear: '2024',
      images: [
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200', caption: 'Exterior View' },
        { url: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1200', caption: 'Living Room' },
        { url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=1200', caption: 'Gourmet Kitchen' },
        { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1200', caption: 'Master Bedroom' },
        { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200', caption: 'Infinity Pool' }
      ],
      rooms: ['Master Suite', 'Guest Bedrooms', 'Living Room', 'Dining Hall', 'Gourmet Kitchen', 'Home Theater', 'Gym', 'Swimming Pool', 'Terrace Garden'],
      featured: true
    },
    {
      id: 'proj-apt-001',
      title: 'Skyline Penthouse Apartment',
      description: 'Ultra-luxury 4BHK penthouse with 360° city views, smart home automation, and Italian marble finishes.',
      propertyType: 'Apartment',
      location: 'Lower Parel, Mumbai',
      area: '4,200 sqft',
      completionYear: '2024',
      images: [
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200', caption: 'Living Area' },
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200', caption: 'Master Bedroom' },
        { url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1200', caption: 'Modern Kitchen' },
        { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200', caption: 'Private Terrace' }
      ],
      rooms: ['Master Suite', '3 Bedrooms', 'Living Hall', 'Dining Area', 'Kitchen', 'Study', 'Balcony'],
      featured: true
    },
    {
      id: 'proj-villa-002',
      title: 'Modern Tropical Villa',
      description: 'Eco-friendly 4BHK villa with sustainable design, rainwater harvesting, and lush tropical landscaping.',
      propertyType: 'Villa',
      location: 'Whitefield, Bengaluru',
      area: '5,500 sqft',
      completionYear: '2023',
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', caption: 'Front Elevation' },
        { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200', caption: 'Open Living' },
        { url: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=1200', caption: 'Kitchen' },
        { url: 'https://images.unsplash.com/photo-1585320806876-9f0a49b58b17?auto=format&fit=crop&q=80&w=1200', caption: 'Garden' }
      ],
      rooms: ['4 Bedrooms', 'Living Room', 'Family Lounge', 'Kitchen', 'Dining', 'Home Office', 'Gym', 'Garden'],
      featured: true
    },
    {
      id: 'proj-apt-002',
      title: 'Minimalist Urban Apartment',
      description: 'Scandinavian-inspired 3BHK apartment with clean lines, natural light, and smart storage solutions.',
      propertyType: 'Apartment',
      location: 'Koramangala, Bengaluru',
      area: '2,100 sqft',
      completionYear: '2024',
      images: [
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200', caption: 'Living Space' },
        { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1200', caption: 'Bedroom' },
        { url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1200', caption: 'Kitchen' },
        { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1200', caption: 'Bathroom' }
      ],
      rooms: ['3 Bedrooms', 'Living Hall', 'Kitchen', 'Dining', 'Balcony', 'Study Nook'],
      featured: true
    },
    {
      id: 'proj-villa-003',
      title: 'Contemporary Golf Villa',
      description: 'Luxurious 6BHK villa overlooking golf course with home theater, wine cellar, and infinity pool.',
      propertyType: 'Villa',
      location: 'DLF Phase 5, Gurgaon',
      area: '12,000 sqft',
      completionYear: '2023',
      images: [
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200', caption: 'Villa Exterior' },
        { url: 'https://images.unsplash.com/photo-1615876234839-c2a1fdf88106?auto=format&fit=crop&q=80&w=1200', caption: 'Grand Living' },
        { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200', caption: 'Pool Area' },
        { url: 'https://images.unsplash.com/photo-1598231772097-8b74394b95c6?auto=format&fit=crop&q=80&w=1200', caption: 'Home Theater' }
      ],
      rooms: ['6 Master Suites', 'Living Room', 'Family Lounge', 'Gourmet Kitchen', 'Formal Dining', 'Home Theater', 'Wine Cellar', 'Gym', 'Spa', 'Swimming Pool'],
      featured: true
    },
    {
      id: 'proj-apt-003',
      title: 'Art Deco Luxury Apartment',
      description: 'Restored art deco 3BHK apartment with high ceilings, original features, and modern amenities.',
      propertyType: 'Apartment',
      location: 'Marine Drive, Mumbai',
      area: '2,800 sqft',
      completionYear: '2023',
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1200', caption: 'Living Room' },
        { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200', caption: 'Bedroom' },
        { url: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=1200', caption: 'Dining' },
        { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200', caption: 'Sea View Balcony' }
      ],
      rooms: ['3 Bedrooms', 'Living Hall', 'Dining Room', 'Kitchen', 'Balcony', 'Servant Room'],
      featured: true
    }
  ]
};

const setThemeVars = () => {
  document.documentElement.style.setProperty('--primary', state.theme.primaryColor);
  document.documentElement.style.setProperty('--accent', state.theme.accentColor);
  // Apply dark mode class to body
  if (state.theme.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
};

const escapeHtml = (value: any) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeKey = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const formatCurrency = (amount?: number) => `₹${(amount || 0).toLocaleString('en-IN')}`;

const INVOICE_TIME_ZONE = 'Asia/Kolkata';

const parseInvoiceTimestamp = (value?: string | number | Date | null) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  if (!raw) return null;
  // SQLite timestamps like "YYYY-MM-DD HH:mm:ss" are UTC; attach Z to parse consistently.
  const sqliteUtcPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  const normalized = sqliteUtcPattern.test(raw) ? `${raw.replace(' ', 'T')}Z` : raw;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatInvoiceDateTime = (value?: string | number | Date | null) => {
  const date = parseInvoiceTimestamp(value);
  if (!date || Number.isNaN(date.getTime())) {
    return { date: 'N/A', time: 'N/A', display: 'N/A' };
  }

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: INVOICE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: INVOICE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
  return {
    date: formattedDate,
    time: formattedTime,
    display: `${formattedDate} ${formattedTime}`
  };
};

const formatPaymentMethodLabel = (value?: string | null) => {
  const raw = String(value || '').trim();
  if (!raw) return 'N/A';
  const lower = raw.toLowerCase();
  if (lower === 'razorpay') return 'Razorpay';
  if (lower === 'phonepe') return 'PhonePe';
  if (lower === 'card') return 'Card';
  if (lower === 'cash') return 'Cash';
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
};

const parseAmountValue = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value || '').trim();
  if (!raw) return 0;

  const lakhMatch = raw.match(/(\d+(?:\.\d+)?)\s*l(?:akh)?/i);
  if (lakhMatch) {
    return Number(lakhMatch[1]) * 100000;
  }

  const numeric = Number(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeAssetUrl = (value: string) => {
  if (!value) return value;
  const cleaned = value.replace(/\\/g, '/').trim();
  if (/^(www\.|(?:youtube\.com|youtu\.be|vimeo\.com)\/)/i.test(cleaned)) return `https://${cleaned}`;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(cleaned)) return `https://${cleaned}`;
  if (/^(https?:|data:|blob:)/i.test(cleaned)) return cleaned;
  if (cleaned.startsWith('/')) return cleaned;
  return `/${cleaned.replace(/^\.?\/?/, '')}`;
};

const normalizeCalcCategoryKey = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const CATEGORY_CANONICAL_IMAGES: Record<string, string[]> = {
  'apartment': [
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
  'villa': [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1615876234839-c2a1fdf88106?auto=format&fit=crop&q=80&w=1200'
  ],
  'office interior': [
    '/category/Office interior/office interior (1).jpg',
    '/category/Office interior/office interior (2).jpg',
    '/category/Office interior/office interior (3).jpg',
    '/category/Office interior/office interior (4).jpg',
    '/category/Office interior/office interior (5).jpg'
  ],
  'terrace': [
    '/category/Terrace/terrace (1).jpg',
    '/category/Terrace/terrace (2).jpg',
    '/category/Terrace/terrace (3).jpg',
    '/category/Terrace/terrace (4).jpg',
    '/category/Terrace/terrace (5).jpg',
    '/category/Terrace/terrace (6).jpg'
  ],
  'swimming pool': [
    '/category/Swimming pool/swimmingpool1 - Copy.jpg',
    '/category/Swimming pool/swimmingpool2 - Copy.jpg',
    '/category/Swimming pool/swimmingpool3 - Copy.jpg',
    '/category/Swimming pool/swimmingpool4 - Copy.jpg',
    '/category/Swimming pool/swimmingpool5 - Copy.jpg',
    '/category/Swimming pool/swimming pool.jpg'
  ],
  'garden': [
    '/category/Garden/garden (1).jpg',
    '/category/Garden/garden (2).jpg',
    '/category/Garden/garden (3).jpg',
    '/category/Garden/garden (4).jpg',
    '/category/Garden/garden (5).jpg'
  ],
  'kitchen': [
    '/category/Kitchen/kitchen1.jpg',
    '/category/Kitchen/kitchen2.jpg',
    '/category/Kitchen/kitchen3.jpg',
    '/category/Kitchen/kitchen4.jpg',
    '/category/Kitchen/kitchen5.jpg'
  ],
  'living room': [
    '/category/Living room/living1.jpg',
    '/category/Living room/living2.jpg',
    '/category/Living room/living3.jpg',
    '/category/Living room/living4.jpg',
    '/category/Living room/living5.jpg',
    '/category/Living room/living6.jpg'
  ],
  'home theatre': [
    '/category/Home theatre/home theatre (1).jpg',
    '/category/Home theatre/home theatre (2).jpg',
    '/category/Home theatre/home theatre (3).jpg',
    '/category/Home theatre/home theatre (4).jpg',
    '/category/Home theatre/home theatre (5).jpg'
  ],
  'bathroom': [
    '/category/Bathroom/bathroom1.jpg',
    '/category/Bathroom/bathroom2.jpg',
    '/category/Bathroom/bathroom3.jpg',
    '/category/Bathroom/bathroom4.jpg',
    '/category/Bathroom/bathroom5.jpg'
  ],
  'gym': [
    '/category/Gym/gym (1).jpg',
    '/category/Gym/gym (2).jpg',
    '/category/Gym/gym (3).jpg',
    '/category/Gym/gym (4).jpg',
    '/category/Gym/gym (5).jpg'
  ],
  'master bedroom': [
    '/category/Master Bedroom/master-bedroom1.jpg',
    '/category/Master Bedroom/master-bedroom2.jpg',
    '/category/Master Bedroom/master-bedroom3.jpg',
    '/category/Master Bedroom/master-bedroom4.jpg',
    '/category/Master Bedroom/master-bedroom5.jpg'
  ],
  'kids bedroom': [
    '/category/Kids-bedroom/kids-bedroom1.jpg',
    '/category/Kids-bedroom/kids-bedroom2.jpg',
    '/category/Kids-bedroom/kids-bedroom3.jpg',
    '/category/Kids-bedroom/kids-bedroom4.jpg',
    '/category/Kids-bedroom/kids-bedroom5.jpg'
  ],
  'pooja room': [
    '/category/Pooja room/pooja-room1.jpg',
    '/category/Pooja room/pooja-room2.jpg',
    '/category/Pooja room/pooja-room3.jpg',
    '/category/Pooja room/pooja-room4.jpg',
    '/category/Pooja room/pooja-room5.jpg'
  ],
  'dining room': [
    '/category/Diningroom/dining-room1.jpg',
    '/category/Diningroom/dining-room2.jpg',
    '/category/Diningroom/dining-room3.jpg',
    '/category/Diningroom/dining-room4.jpg'
  ],
  'wardrobe': [
    '/category/wardrobe/wardrobe1.jpg',
    '/category/wardrobe/wardrobe2.jpg',
    '/category/wardrobe/wardrobe3.jpg',
    '/category/wardrobe/wardrobe4.jpg'
  ],
  'balcony': [
    '/category/Balcony/balcony (1).jpg',
    '/category/Balcony/balcony (2).jpg',
    '/category/Balcony/balcony (3).jpg',
    '/category/Balcony/balcony (4).jpg'
  ],
  'guest room': [
    '/category/Guest room/guest room  (1).jpg',
    '/category/Guest room/guest room  (2).jpg',
    '/category/Guest room/guest room (3).jpg',
    '/category/Guest room/guest room (4).jpg'
  ],
  'spa': [
    '/category/Spa/spa room (1).jpg',
    '/category/Spa/spa room (2).jpg',
    '/category/Spa/spa room (3).jpg',
    '/category/Spa/spa room (4).jpg'
  ],
  'meeting room': [
    '/category/Meeting room/meeting room (1).jpg',
    '/category/Meeting room/meeting room (2).jpg',
    '/category/Meeting room/meeting room (3).jpg',
    '/category/Meeting room/meeting room (4).jpg',
    '/category/Meeting room/meeting room (5).jpg'
  ],
  'classroom': [
    '/category/Classroom/classroom.jpg',
    '/category/Classroom/classroom1.jpg',
    '/category/Classroom/classroom2.jpg',
    '/category/Classroom/classroom3.jpg',
    '/category/Classroom/classroom4.jpg'
  ],
  'epoxy floor': [
    '/category/Epoxy Floor/epoxy1.jpg',
    '/category/Epoxy Floor/epoxy2.jpg',
    '/category/Epoxy Floor/epoxy3.jpg',
    '/category/Epoxy Floor/epoxy4.jpg',
    '/category/Epoxy Floor/epoxy5.jpg'
  ]
};

const getCanonicalCategoryImages = (category: string) => {
  const key = normalizeCalcCategoryKey(category);
  if (CATEGORY_CANONICAL_IMAGES[key]?.length) return CATEGORY_CANONICAL_IMAGES[key];

  if (key.includes('apartment')) return CATEGORY_CANONICAL_IMAGES['apartment'] || [];
  if (key.includes('villa')) return CATEGORY_CANONICAL_IMAGES['villa'] || [];
  if (key.includes('office')) return CATEGORY_CANONICAL_IMAGES['office interior'] || [];
  if (key.includes('terrace') || key.includes('rooftop') || key.includes('deck')) return CATEGORY_CANONICAL_IMAGES['terrace'] || [];
  if (key.includes('balcony')) return CATEGORY_CANONICAL_IMAGES['balcony'] || [];
  if (key.includes('pool') || key.includes('swimming')) return CATEGORY_CANONICAL_IMAGES['swimming pool'] || [];
  if (key.includes('garden') || key.includes('landscape') || key.includes('courtyard')) return CATEGORY_CANONICAL_IMAGES['garden'] || [];
  if (key.includes('kitchen')) return CATEGORY_CANONICAL_IMAGES['kitchen'] || [];
  if (key.includes('living') || key.includes('lounge')) return CATEGORY_CANONICAL_IMAGES['living room'] || [];
  if (key.includes('dining')) return CATEGORY_CANONICAL_IMAGES['dining room'] || [];
  if (key.includes('theatre') || key.includes('theater') || key.includes('cinema')) return CATEGORY_CANONICAL_IMAGES['home theatre'] || [];
  if (key.includes('spa')) return CATEGORY_CANONICAL_IMAGES['spa'] || [];
  if (key.includes('bath')) return CATEGORY_CANONICAL_IMAGES['bathroom'] || [];
  if (key.includes('gym') || key.includes('fitness') || key.includes('workout')) return CATEGORY_CANONICAL_IMAGES['gym'] || [];
  if (key.includes('meeting') || key.includes('conference')) return CATEGORY_CANONICAL_IMAGES['meeting room'] || [];
  if (key.includes('class') || key.includes('school')) return CATEGORY_CANONICAL_IMAGES['classroom'] || [];
  if (key.includes('epoxy')) return CATEGORY_CANONICAL_IMAGES['epoxy floor'] || [];
  if (key.includes('master') && key.includes('bed')) return CATEGORY_CANONICAL_IMAGES['master bedroom'] || [];
  if (key.includes('kids') || key.includes('child')) return CATEGORY_CANONICAL_IMAGES['kids bedroom'] || [];
  if (key.includes('guest') || key.includes('guestroom')) return CATEGORY_CANONICAL_IMAGES['guest room'] || [];
  if (key.includes('bed') || key.includes('suite')) return CATEGORY_CANONICAL_IMAGES['master bedroom'] || [];
  if (key.includes('pooja') || key.includes('prayer') || key.includes('mandir')) return CATEGORY_CANONICAL_IMAGES['pooja room'] || [];
  if (key.includes('wardrobe') || key.includes('closet') || key.includes('dressing')) return CATEGORY_CANONICAL_IMAGES['wardrobe'] || [];

  return [];
};


type CalcImageQuality = 'economy' | 'premium' | 'luxury';

const CATEGORY_QUALITY_CONCEPTS: Record<string, Record<CalcImageQuality, string>> = {
  'kitchen': { economy: 'Essential Modular Kitchen', premium: 'Designer Kitchen Gallery', luxury: 'Chef Gourmet Kitchen Suite' },
  'living room': { economy: 'Smart Living & Dining', premium: 'Designer Double Height Lounge', luxury: 'Palatial Grand Living Atrium' },
  'bathroom': { economy: 'Clean Vanity Bathroom', premium: 'Spa Luxury Bathroom', luxury: 'Spa Sanctuary with Stone Textures' },
  'bedroom': { economy: 'Comfort Family Suite', premium: 'Premium Master Retreat', luxury: 'Luxury Royal Master Suite' },
  'dining room': { economy: 'Everyday Dining Nook', premium: 'Elegant Dining Space', luxury: 'Formal Dining Hall with Gallery' },
  'living + dining': { economy: 'Unified Living Dining', premium: 'Open Plan Designer Space', luxury: 'Grand Living + Dining Pavilion' },
  'pooja room': { economy: 'Simple Prayer Nook', premium: 'Decorated Pooja Sanctuary', luxury: 'Premium Pooja Mandir Room' },
  'guest room': { economy: 'Functional Guest Room', premium: 'Premium Guest Suite', luxury: 'Luxury Guest Retreat' },
  'terrace': { economy: 'Terrace Tea Lounge', premium: 'Landscape Terrace Deck', luxury: 'Skyline Terrace Bar Deck' },
  'garden': { economy: 'Simple Garden Space', premium: 'Landscape Garden Court', luxury: 'Luxury Courtyard Garden' },
  'home office': { economy: 'Practical Study Desk', premium: 'Executive Study Den', luxury: 'Premium Executive Office' },
  'home theatre': { economy: 'Casual Media Room', premium: 'Signature Home Theatre', luxury: 'Luxury Entertainment Theatre' },
  'swimming pool': { economy: 'Basic Pool Deck', premium: 'Poolside Entertainer Deck', luxury: 'Infinity Edge Pool Pavilion' },
  'spa': { economy: 'Relaxation Spa Nook', premium: 'Wellness Spa Wing', luxury: 'Private Wellness Spa Retreat' }
};

const DEFAULT_CALC_LIBRARY_REQUIREMENTS: Record<string, string[]> = {
  'apartment-1': ['Modular Kitchen', 'Living + Dining', 'Family Bedrooms', 'Bathroom Vanity', 'Pooja Room'],
  'apartment-2': ['Modular Kitchen', 'Master Suites', 'Living + Dining', 'Bathroom Vanity', 'Pooja Room'],
  'apartment-3': ['Designer Kitchen', 'Master Suites', 'Grand Living', 'Balcony Design', 'Pooja Room'],
  'apartment-4': ['Gourmet Kitchen', 'Master Suites', 'Grand Living', 'Terrace', 'Kids Room'],
  'villa-1': ['Modular Kitchen', 'Family Bedrooms', 'Living + Dining', 'Swimming Pool', 'Terrace', 'Garden'],
  'villa-2': ['Designer Kitchen', 'Master Suites', 'Grand Living', 'Swimming Pool', 'Home Theater', 'Terrace'],
  'villa-3': ['Gourmet Kitchen', 'Suite Bedrooms', 'Grand Living', 'Swimming Pool', 'Home Theater', 'Garden', 'Terrace'],
  'villa-4': ['Gourmet Kitchen', 'Suite Bedrooms', 'Double-height Living', 'Swimming Pool', 'Home Theater', 'Home Gym', 'Garden', 'Terrace']
};

const CATEGORY_SAMPLE_CONCEPTS: Array<{
  id: string;
  category: string;
  quality: CalcImageQuality;
  title: string;
  description: string;
  image: string;
}> = [
  { id: 'cat-kitchen-econ-1', category: 'kitchen', quality: 'economy', title: 'Essential Modular Kitchen', description: 'Budget-friendly modular kitchen setup with practical layout.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-kitchen-prem-1', category: 'kitchen', quality: 'premium', title: 'Designer Kitchen Gallery', description: 'Premium kitchen with designer finishes and quality appliances.', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-kitchen-lux-1', category: 'kitchen', quality: 'luxury', title: 'Chef Gourmet Kitchen Suite', description: 'Luxury culinary space with premium materials and layout.', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-living-econ-1', category: 'living room', quality: 'economy', title: 'Smart Living & Dining', description: 'Space-efficient living area with layered zoning.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-living-prem-1', category: 'living room', quality: 'premium', title: 'Designer Double Height Lounge', description: 'Premium lounge with dramatic ceiling and feature walls.', image: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-living-lux-1', category: 'living room', quality: 'luxury', title: 'Palatial Grand Living Atrium', description: 'Luxury atrium with statement chandeliers and marble finishes.', image: 'https://images.unsplash.com/photo-1615876234839-c2a1fdf88106?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-bath-econ-1', category: 'bathroom', quality: 'economy', title: 'Clean Vanity Bathroom', description: 'Durable bathroom with practical vanity and fixtures.', image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-bath-prem-1', category: 'bathroom', quality: 'premium', title: 'Spa Luxury Bathroom', description: 'Premium bathroom with spa-inspired finishes and lighting.', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-bath-lux-1', category: 'bathroom', quality: 'luxury', title: 'Spa Sanctuary with Stone Textures', description: 'Luxury spa bathroom with stone, ambient mood and premium fixtures.', image: 'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-bed-econ-1', category: 'bedroom', quality: 'economy', title: 'Comfort Family Suite', description: 'Warm bedroom concept with practical comfort furniture.', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-bed-prem-1', category: 'bedroom', quality: 'premium', title: 'Premium Master Retreat', description: 'Master suite with layered textures and mood lighting.', image: 'https://images.unsplash.com/photo-1615929691474-a781fa2a93e5?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-bed-lux-1', category: 'bedroom', quality: 'luxury', title: 'Luxury Royal Master Suite', description: 'Palatial master bedroom with premium finishes and luxury amenities.', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-dining-econ-1', category: 'dining room', quality: 'economy', title: 'Everyday Dining Nook', description: 'Simple practical dining area for family meals.', image: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-dining-prem-1', category: 'dining room', quality: 'premium', title: 'Elegant Dining Space', description: 'Premium dining room with designer furniture and lighting.', image: 'https://images.unsplash.com/photo-1589365278144-da7740122914?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-dining-lux-1', category: 'dining room', quality: 'luxury', title: 'Formal Dining Hall with Gallery', description: 'Luxury formal dining with statement chandelier and gallery walls.', image: 'https://images.unsplash.com/photo-1606269574893-f4f48c93688f?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-terrace-econ-1', category: 'terrace', quality: 'economy', title: 'Terrace Tea Lounge', description: 'Low-maintenance outdoor terrace lounge space.', image: 'https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-terrace-prem-1', category: 'terrace', quality: 'premium', title: 'Landscape Terrace Deck', description: 'Premium terrace with integrated landscape and seating zones.', image: 'https://images.unsplash.com/photo-1600612674271-dba011b311b0?auto=format&fit=crop&q=80&w=1200' },
  { id: 'cat-terrace-lux-1', category: 'terrace', quality: 'luxury', title: 'Skyline Terrace Bar Deck', description: 'Luxury rooftop social deck with panoramic views and bar setup.', image: 'https://images.unsplash.com/photo-1617104551722-3b2d51366444?auto=format&fit=crop&q=80&w=1200' }
];

const VILLA_SAMPLE_CONCEPT_LIBRARY: Array<{
  id: string;
  quality: CalcImageQuality;
  title: string;
  category: string;
  description: string;
  image: string;
  bhk?: number | null;
}> = [
  { id: 'villa-econ-1', quality: 'economy', title: 'Smart Villa Living Concept', category: 'Living Room', description: 'Efficient family-friendly villa living with layered lighting.', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-econ-2', quality: 'economy', title: 'Budget Gourmet Kitchen Concept', category: 'Kitchen', description: 'Cost-optimized villa kitchen with premium visual appeal.', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-econ-3', quality: 'economy', title: 'Comfort Suite Concept', category: 'Master Bedroom', description: 'Warm bedroom concept tuned for practical villa comfort.', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-econ-4', quality: 'economy', title: 'Everyday Dining Courtyard', category: 'Dining Room', description: 'Simple and airy villa dining with practical layout.', image: 'https://images.unsplash.com/photo-1617098474202-0d0d7f60c7d1?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-econ-5', quality: 'economy', title: 'Terrace Tea Lounge', category: 'Terrace', description: 'Low-maintenance outdoor terrace lounge concept.', image: 'https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-econ-6', quality: 'economy', title: 'Family Lounge Nook', category: 'Living Room', description: 'Cozy villa family lounge with smart furniture zoning.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-econ-7', quality: 'economy', title: 'Clean Vanity Bathroom', category: 'Bathroom', description: 'Durable bathroom vanity concept for daily comfort.', image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-econ-8', quality: 'economy', title: 'Functional Guest Room', category: 'Guest Room', description: 'Guest-ready bedroom concept with budget-friendly finishes.', image: 'https://images.unsplash.com/photo-1616594039964-3f5c6b7f54af?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-1', quality: 'premium', title: 'Designer Double Height Lounge', category: 'Living Room', description: 'Premium villa lounge with sculpted ceiling and feature wall.', image: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-2', quality: 'premium', title: 'Poolside Entertainer Deck', category: 'Swimming Pool', description: 'Contemporary pool deck concept for villa entertainment.', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-3', quality: 'premium', title: 'Signature Home Theatre Concept', category: 'Home Theatre', description: 'Immersive villa cinema setup with acoustic wall accents.', image: 'https://images.unsplash.com/photo-1598231772097-8b74394b95c6?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-4', quality: 'premium', title: 'Premium Chef Kitchen Suite', category: 'Kitchen', description: 'Premium villa kitchen concept with statement island.', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-5', quality: 'premium', title: 'Landscape Garden Court', category: 'Garden', description: 'Softscape and hardscape balance for villa outdoors.', image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-6', quality: 'premium', title: 'Executive Study Den', category: 'Home Office', description: 'Dedicated work-and-study space in premium villas.', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-7', quality: 'premium', title: 'Gallery Stair Lobby', category: 'Living Room', description: 'Feature stair and gallery wall for dramatic entry.', image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-prem-8', quality: 'premium', title: 'Premium Master Retreat', category: 'Master Bedroom', description: 'Layered textures and mood lighting for master suite.', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-1', quality: 'luxury', title: 'Palatial Grand Living Atrium', category: 'Living Room', description: 'Luxury atrium concept with statement chandeliers and marble.', image: 'https://images.unsplash.com/photo-1615876234839-c2a1fdf88106?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-2', quality: 'luxury', title: 'Infinity Edge Pool Pavilion', category: 'Swimming Pool', description: 'Resort-style villa pool pavilion with premium finishes.', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-3', quality: 'luxury', title: 'Private Wellness Spa Wing', category: 'Spa', description: 'Luxury spa-and-wellness concept integrated inside villa.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-4', quality: 'luxury', title: 'Skyline Terrace Bar Deck', category: 'Terrace', description: 'Luxury rooftop social deck with panoramic views.', image: 'https://images.unsplash.com/photo-1617104551722-3b2d51366444?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-5', quality: 'luxury', title: 'Grand Piano Family Hall', category: 'Living Room', description: 'Formal luxury family hall with curated art and lighting.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-6', quality: 'luxury', title: 'Luxury Entertainment Theatre', category: 'Home Theatre', description: 'Cinema-grade theatre with plush acoustic interiors.', image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-7', quality: 'luxury', title: 'Spa Bathroom Sanctuary', category: 'Bathroom', description: 'High-end bathroom with stone textures and ambient mood.', image: 'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?auto=format&fit=crop&q=80&w=1200', bhk: null },
  { id: 'villa-lux-8', quality: 'luxury', title: 'Luxury Courtyard Garden', category: 'Garden', description: 'Private villa courtyard with sculptural landscape palette.', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', bhk: null }
];

const getDefaultCalculatorImageLibrary = (): any[] => {
  const qualities: CalcImageQuality[] = ['economy', 'premium', 'luxury'];
  const byCategory = Object.keys(CATEGORY_CANONICAL_IMAGES).flatMap((categoryKey) => {
    const pool = CATEGORY_CANONICAL_IMAGES[categoryKey] || [];
    return qualities.flatMap((quality, qIndex) => {
      const start = qIndex % Math.max(1, pool.length);
      const selected = pool.length > 0
        ? [pool[start], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]]
        : [];

      return selected.map((image, i) => ({
        id: `calc-lib-${categoryKey.replace(/\s+/g, '-')}-${quality}-${i + 1}`,
        category: categoryKey,
        quality,
        title: `${categoryKey.toUpperCase()} ${quality.toUpperCase()} ${i + 1}`,
        description: `Curated ${quality} inspiration for ${categoryKey}.`,
        image: normalizeAssetUrl(String(image || '')),
        bhk: null,
        homeType: null,
        active: true,
        order: i
      }));
    });
  });

  const byHomeRequirements = Object.entries(DEFAULT_CALC_LIBRARY_REQUIREMENTS).flatMap(([key, spaces]) => {
    const [homeTypeRaw, bhkRaw] = key.split('-');
    const homeType = homeTypeRaw === 'villa' ? 'Villa' : 'Apartment';
    const bhk = Number(bhkRaw || 0);
    const categoryPool = getCanonicalCategoryImages(homeType);
    return ['economy', 'premium', 'luxury'].flatMap((quality, qIndex) => {
      const typedQuality = quality as CalcImageQuality;
      return spaces.map((space, index) => {
        const fallback = featureImageMap[space] || categoryPool[(index + qIndex) % Math.max(1, categoryPool.length)] || '';
        return {
          id: `calc-home-${homeType.toLowerCase()}-${bhk}-${typedQuality}-${index + 1}`,
          category: homeType.toLowerCase(),
          quality: typedQuality,
          title: space,
          description: `${homeType} ${bhk}BHK ${typedQuality} setup: ${space}.`,
          image: normalizeAssetUrl(String(fallback || '')),
          bhk,
          homeType,
          active: true,
          order: index
        };
      });
    });
  });

  const byVillaSampleConcepts = VILLA_SAMPLE_CONCEPT_LIBRARY.map((item, index) => ({
    id: `calc-villa-sample-${item.id}`,
    category: 'villa',
    quality: item.quality,
    title: item.title,
    description: item.description,
    image: normalizeAssetUrl(String(item.image || '')),
    bhk: item.bhk ?? null,
    homeType: 'Villa',
    active: true,
    order: index
  }));

  const byCategorySampleConcepts = CATEGORY_SAMPLE_CONCEPTS.map((item, index) => ({
    id: `calc-category-sample-${item.id}`,
    category: item.category,
    quality: item.quality,
    title: item.title,
    description: item.description,
    image: normalizeAssetUrl(String(item.image || '')),
    bhk: null,
    homeType: null,
    active: true,
    order: index
  }));

  return [...byCategory, ...byHomeRequirements, ...byCategorySampleConcepts, ...byVillaSampleConcepts].filter((item) => String(item.image || '').trim());
};

const getEffectiveCalculatorImageLibrary = (): any[] => {
  const existing = getCalculatorImageLibrary();
  if (Array.isArray(existing) && existing.length > 0) return existing;
  const seeded = getDefaultCalculatorImageLibrary();
  writeCalculatorImageLibrary(seeded);
  return seeded;
};

const getAdminImageLibrary = (): any[] => {
  const lib = (state.admin as any).calculatorImageLibrary as any[];
  if (Array.isArray(lib) && lib.length > 0) return lib;
  const effective = getEffectiveCalculatorImageLibrary();

  if (state.admin) {
    (state.admin as any).calculatorImageLibrary = effective;
  }
  return effective;
};

const getStableImageIndex = (seed: string, max: number): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % Math.max(1, max)) + 1;
};

const getPackageBhkFromPayload = (pkg: any): number => {
  const direct = Number(pkg?.bhk || 0);
  if (Number.isFinite(direct) && direct >= 1 && direct <= 4) return direct;

  const text = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.description || '')}`;
  const match = text.match(/(1|2|3|4)\s*bhk/i);
  return match ? Number(match[1]) : 0;
};

const getBhkPackageImage = (pkg: any): string => {
  const bhk = getPackageBhkFromPayload(pkg);
  if (bhk < 1 || bhk > 4) return '';
  const idx = getStableImageIndex(String(pkg?.id || pkg?.name || `pkg-${bhk}`), 15);
  return `/package-images/${bhk}bhk/${idx}.jpg`;
};

// Utility to get the best background image for a package
const getPackageBackgroundImage = (pkg: any) => {
  const bhkImage = getBhkPackageImage(pkg);
  if (bhkImage) return bhkImage;

  // Prefer explicit backgroundImage field
  if (pkg.backgroundImage && typeof pkg.backgroundImage === 'string' && pkg.backgroundImage.length > 5) {
    return normalizeAssetUrl(pkg.backgroundImage);
  }
  // Fallback: use image if backgroundImage not set
  if (pkg.image && typeof pkg.image === 'string' && pkg.image.length > 5) {
    return normalizeAssetUrl(pkg.image);
  }
  // Fallback: use default background
  return '/category/Living room/living1.jpg';
};

const getPackageDisplayImage = (pkg: any) => {
  const bhkImage = getBhkPackageImage(pkg);
  if (bhkImage) return bhkImage;

  const primary = normalizeAssetUrl(String(pkg?.image || ''));

  // If we have a primary image and it's not a known placeholder, ALWAYS use it
  if (primary && !primary.includes('living1.jpg') && primary.length > 5) return primary;

  const roomImage = Array.isArray(pkg?.rooms)
    ? normalizeAssetUrl(String(pkg.rooms.find((room: any) => String(room?.image || room?.url || '').trim())?.image || ''))
    : '';
  if (roomImage) return roomImage;

  const category = getCategoryForPackage(String(pkg?.category || ''));
  const categoryImage = normalizeAssetUrl(String(
    category?.image
    || category?.thumbnail
    || category?.background
    || category?.images?.[0]?.url
    || ''
  ));
  if (categoryImage) return categoryImage;

  if (primary) return primary;
  return '/category/Living room/living1.jpg';
};

type LuxuryShowroomStore = {
  house: LuxuryProperty;
  apartment: LuxuryProperty;
};

type LuxuryRelatedImage = {
  url: string;
  name: string;
  category: string;
  categoryId?: string;
};

const LUXURY_SHOWROOM_STORAGE_KEY = 'ar-interia-luxury-showrooms';

const cloneLuxuryProperty = (property: LuxuryProperty): LuxuryProperty =>
  JSON.parse(JSON.stringify(property));

const getDefaultLuxuryShowroomStore = (): LuxuryShowroomStore => ({
  house: cloneLuxuryProperty(LUXURY_HOUSE),
  apartment: cloneLuxuryProperty(LUXURY_APARTMENT)
});

const getLuxuryShowroomStore = (): LuxuryShowroomStore => {
  try {
    const raw = localStorage.getItem(LUXURY_SHOWROOM_STORAGE_KEY);
    if (!raw) return getDefaultLuxuryShowroomStore();
    const parsed = JSON.parse(raw) as Partial<LuxuryShowroomStore>;
    if (!parsed?.house?.rooms || !parsed?.apartment?.rooms) return getDefaultLuxuryShowroomStore();
    return {
      house: parsed.house as LuxuryProperty,
      apartment: parsed.apartment as LuxuryProperty
    };
  } catch {
    return getDefaultLuxuryShowroomStore();
  }
};

const saveLuxuryShowroomStore = (store: LuxuryShowroomStore) => {
  localStorage.setItem(LUXURY_SHOWROOM_STORAGE_KEY, JSON.stringify(store));
};

const getRoomRelatedImages = (room: any): LuxuryRelatedImage[] => {
  const list = Array.isArray(room?.relatedImages) ? room.relatedImages : [];
  return list
    .map((item: any) => ({
      url: normalizeAssetUrl(String(item?.url || '').trim()),
      name: String(item?.name || '').trim() || 'Related Design',
      category: String(item?.category || '').trim() || 'Related Design',
      categoryId: String(item?.categoryId || '').trim()
    }))
    .filter((item: LuxuryRelatedImage) => Boolean(item.url));
};

const collectRelatedImagesFromFormData = (formData: FormData): LuxuryRelatedImage[] => {
  const imageMap = new Map<string, LuxuryRelatedImage>();

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('relatedImageUrl_')) continue;
    const index = key.replace('relatedImageUrl_', '');
    const url = normalizeAssetUrl(String(value || '').trim());
    if (!url) continue;
    imageMap.set(index, {
      url,
      name: String(formData.get(`relatedImageName_${index}`) || '').trim() || 'Related Design',
      category: String(formData.get(`relatedImageCategory_${index}`) || '').trim() || 'Related Design'
    });
  }

  const newUrl = normalizeAssetUrl(String(formData.get('relatedImageUrlNew') || '').trim());
  if (newUrl) {
    imageMap.set(`new-${Date.now()}`, {
      url: newUrl,
      name: String(formData.get('relatedImageNameNew') || '').trim() || 'Related Design',
      category: String(formData.get('relatedImageCategoryNew') || '').trim() || 'Related Design'
    });
  }

  return Array.from(imageMap.values());
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
};


// --- Frontend render layer ---------------------------------------------------
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
          fileNameDisplay.textContent = `✓ ${file.name} (${sizeMB} MB)`;
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
  const isLoginPage = state.activeTab === 'login';

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
              ${state.mobileMenuOpen ? '✕' : '☰'}
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

      <main class="${isHome ? 'pt-0' : isLoginPage ? 'pt-20' : 'pt-28'}">
        ${renderMain()}
      </main>

      ${imagePreview ? `
        <div id="image-preview-overlay" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <button data-action="close-image-preview" class="absolute top-6 right-6 md:top-10 md:right-10 z-[60] text-white hover:text-amber-400 text-3xl md:text-5xl w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 border border-white/20 hover:scale-110 transition-all cursor-pointer shadow-2xl backdrop-blur-md">✕</button>
          <div class="bg-white rounded-3xl overflow-hidden w-full max-w-5xl my-auto relative shadow-2xl">
            <div class="flex items-center justify-between px-6 py-4 border-b border-black/5">
              <div>
                <div class="text-xs uppercase tracking-[0.3em] text-slate-400">${escapeHtml(imagePreview.categoryName || 'Category')}</div>
                <div class="text-xl font-semibold text-[color:var(--primary)]">${escapeHtml(imagePreview.name)}</div>
              </div>
              <button data-action="close-image-preview" class="text-slate-400 hover:text-slate-600 text-2xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition">✕</button>
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
          © 2026 AR Interia Interiors. All rights reserved.
        </div>
      </footer>

      ${state.confirmMessage ? `
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce-up">
          <div class="bg-[color:var(--primary)] text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
            <span class="text-xl">✨</span>
            <span class="font-semibold text-sm">${escapeHtml(state.confirmMessage)}</span>
            <button data-action="close-confirm" class="ml-4 text-white/60 hover:text-white transition">✕</button>
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
          disableOnInteraction: false
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

// --- Frontend route dispatcher -----------------------------------------------
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

// --- Frontend homepage layer -------------------------------------------------
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
              <div class="text-4xl mb-4">💡</div>
              <h4 class="text-lg font-bold text-[color:var(--primary)] mb-2">Design Studio</h4>
              <p class="text-sm text-slate-500">AI-powered design variants and instant room concepts. <span class='font-semibold text-[color:var(--primary)]'>Login required.</span></p>
              <div class="text-xs font-semibold text-[color:var(--accent)] mt-3">Use Design Studio →</div>
            </button>
            <button data-action="nav" data-tab="services" class="spidey-panel p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-4xl mb-4">📱</div>
              <h4 class="text-lg font-bold text-[color:var(--primary)] mb-2">Design Preview</h4>
              <p class="text-sm text-slate-500">Experience your future space with realistic previews before a single brick is laid.</p>
              <div class="text-xs font-semibold text-[color:var(--accent)] mt-3">View service details →</div>
            </button>
            <button data-action="nav" data-tab="services" class="spidey-panel p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-4xl mb-4">🏗️</div>
              <h4 class="text-lg font-bold text-[color:var(--primary)] mb-2">Turnkey Execution</h4>
              <p class="text-sm text-slate-500">End-to-end design, material curation, and build management delivered in one seamless plan.</p>
              <div class="text-xs font-semibold text-[color:var(--accent)] mt-3">View service details →</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Packages Section -->
      <div class="mt-10 px-6">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-8">
            <div class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">🏠 Complete Home Solutions</div>
            <h3 class="text-3xl font-display font-bold text-[color:var(--primary)]">Our Packages</h3>
            <p class="text-slate-500 mt-2">Choose from our curated interior design packages at exclusive prices</p>
          </div>
          
          <!-- Package Type Tabs -->
          <div class="flex flex-wrap justify-center gap-3 mb-8">
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 1, true)">🏢 1BHK</button>
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 2, true)">🏢 2BHK</button>
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 3, true)">🏢 3BHK</button>
            <button class="px-4 py-2 rounded-full bg-[color:var(--primary)] text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('bhk', 4, true)">🏢 4BHK</button>
            <button class="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('type', 'Villa')">🏡 Villa</button>
            <button class="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold" onclick="window.applyServerPackageFilter?.('type', 'Apartment', true)">🏬 Apartment</button>
            <button class="px-4 py-2 rounded-full bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300" onclick="window.applyServerPackageFilter?.('all')">📋 All</button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${packageCards.map((pkg: any) => {
              const pkgType = String(pkg.type || (pkg.bhk ? 'Apartment' : 'Package'));
              const bhkFromTextMatch = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')}`.match(/(\d+)\s*BHK/i);
              const bhkCount = Number(pkg?.bhk || (bhkFromTextMatch ? Number(bhkFromTextMatch[1]) : 0));
              const bhkLabel = bhkCount > 0 ? `${bhkCount}BHK` : '';
              const pkgFilterType = bhkLabel || pkgType;
              const pkgBadge = pkgType === 'Villa' ? '🏡 Villa' : (bhkLabel ? `🏢 ${bhkLabel}` : '📦 Package');
              return `
              <div class="rounded-2xl border border-black/5 overflow-hidden bg-white hover:shadow-xl transition-all cursor-pointer has-3d-tilt" data-action="open-package-modal" data-package-id="${pkg.id}" data-package-type="${pkgFilterType}" data-package-family="${pkgType}" style="display: ">
                <div class="h-48 overflow-hidden bg-slate-100 relative">
                  <div class="absolute inset-0 w-full h-full">
                    <img src="${escapeHtml(getPackageBackgroundImage(pkg))}" alt="${escapeHtml(pkg.name)} background" loading="lazy" decoding="async" class="w-full h-full object-cover opacity-60" style="z-index:1;" onerror="this.src='/category/Living room/living1.jpg'" />
                    <img src="${escapeHtml(getPackageDisplayImage(pkg))}" alt="${escapeHtml(pkg.name)}" loading="lazy" decoding="async" class="w-2/3 h-2/3 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style="z-index:2;" onerror="this.src='/category/Living room/living1.jpg'" />
                  </div>
                  <div class="absolute top-3 left-3 px-3 py-1 rounded-full ${pkgType === 'Villa' ? 'bg-emerald-600' : 'bg-blue-600'} text-white text-xs font-bold">${pkgBadge}</div>
                  <div class="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">20+ Premium Designs</div>
                  <div class="absolute top-3 right-3 px-3 py-1 rounded-full bg-[color:var(--accent)] text-white text-xs font-bold">SAVE ₹${((pkg.originalPrice || 0) - (pkg.discountedPrice || 0)).toLocaleString()}</div>
                </div>
                <div class="p-4 space-y-3">
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">${escapeHtml(pkg.category || 'Package')}</div>
                  <h3 class="text-lg font-semibold text-[color:var(--primary)]">${escapeHtml(pkg.name)}</h3>
                  <p class="text-sm text-slate-600 line-clamp-2">${escapeHtml(pkg.description)}</p>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xs text-slate-400 line-through">₹${(pkg.originalPrice || 0).toLocaleString()}</span>
                      <div class="text-xl font-bold text-[color:var(--accent)]">₹${(pkg.discountedPrice || 0).toLocaleString()}</div>
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
                <div class="flex gap-1 mb-3 text-amber-400">${'★'.repeat(Math.max(1, Math.min(5, Number(feedback.rating || 5))))}</div>
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
            <button data-action="nav" data-tab="contact" class="px-8 py-3 bg-white text-[color:var(--primary)] font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">🚀 Book Consultation</button>
            <button data-action="nav" data-tab="portfolio" class="px-8 py-3 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-all">✨ Explore Portfolio</button>
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
                        onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><rect fill=%22%23e5e7eb%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22>🖼️</text></svg>'"
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
                        <button data-action="open-category-image" data-image-url="${escapeHtml(imageUrl)}" data-image-name="${escapeHtml(displayName)}" data-image-cost="${String(getDesignAmount(card.design as any))}" data-category-name="${escapeHtml(selectedCategory?.title || selectedCategory?.name || '')}" data-design-id="${escapeHtml(designId)}" class="flex-1 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-bold hover:opacity-90 transition">📝 Book Now</button>
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
            : `<div class="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center"><span class="text-4xl">📁</span></div>`
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
                        onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><rect fill=%22%23e5e7eb%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22>🖼️</text></svg>'"
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
                          onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><rect fill=%22%23e5e7eb%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 text-anchor=%22middle%22 dy=%22.3em%22>✏️</text></svg>'"
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

// --- Frontend page layer: Services ------------------------------------------
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
// --- Frontend page layer: Showroom ------------------------------------------
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
            : `<div class="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-4xl">🏠</div>`
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
                      Watch Video →
                    </button>
                  ` : `<button data-action="nav" data-tab="contact" class="text-[color:var(--accent)] font-semibold text-xs hover:underline">Book Service →</button>`}
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
                  <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
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
                        <button type="button" data-action="set-feedback-rating" data-rating="${num}" class="text-xl ${num <= state.feedbackForm.rating ? 'text-[color:var(--accent)]' : 'text-slate-200'}">★</button>
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
                      <span class="text-xs text-slate-400 line-through">₹${(pkg.originalPrice || 0).toLocaleString()}</span>
                      <div class="text-lg font-bold text-[color:var(--accent)]">₹${(pkg.discountedPrice || 0).toLocaleString()}</div>
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
          category: `📂 ${cat.title || cat.name || 'Related Design'}`,
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
            category: `📂 ${cat.title || cat.name || 'Related Design'}`,
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
      'master-bedroom': '👑', 'kids': '🎨', 'kitchen': '👨‍🍳', 'living': '🛋️',
      'dining': '🍽️', 'bathroom': '🚿', 'gym': '💪', 'theatre': '🎬',
      'pooja': '🙏', 'garden': '🌿', 'terrace': '⛱️', 'balcony': '🌅',
      'bedroom': '🛏️', 'office': '💼'
    };
    return em[type] || '📍';
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
            ✨ Luxury Showroom
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
              🏡 Luxury Villa
            </button>
            <button data-action="select-property" data-property="apartment"
              class="px-7 py-3 rounded-xl font-bold text-sm transition-all ${propertyType === 'apartment' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/70 hover:text-white'}">
              🏢 Penthouse Apt
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
                ${quoteBtn('💬 Get Quote', 'nav', `data-tab="contact"`)}
                ${bookBtn('📅 Book Design', 'nav', `data-tab="contact"`)}
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
                      <span style="font-size:28px;margin-left:4px;">▶</span>
                    </div>
                    <span style="color:white;font-size:14px;font-weight:700;letter-spacing:0.05em;text-shadow:0 2px 8px rgba(0,0,0,0.8);">▶ Play Room Tour</span>
                  </div>
                </div>
              </div>
              ` : `
              <div class="showroom-video-frame">
                <video
                  src="${escapeHtml(selectedRoom.video3d)}"
                  poster="${escapeHtml(selectedRoom.imageUrl)}"
                  title="${escapeHtml(selectedRoom.name)} — Interior Video Tour"
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
                🖼️ Related Designs — <span class="text-amber-400">${escapeHtml(selectedRoom.name)}</span>
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
                      >🏠 View 3D</button>
                    </div>
                  </div>
                  <div class="showroom-design-body">
                    <div class="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">${escapeHtml(img.category)}</div>
                    <h4 class="font-bold text-white text-sm mb-3 line-clamp-2">${escapeHtml(img.name)}</h4>
                    <div class="flex gap-2">
                      ${isLoggedIn
          ? `<button data-action="nav" data-tab="contact" class="showroom-card-btn primary">💬 Quote</button>
                           <button data-action="nav" data-tab="contact" class="showroom-card-btn secondary">📅 Book</button>`
          : `<button data-action="nav" data-tab="login" class="showroom-card-btn primary w-full" style="text-align:center;">🔒 Sign in to Quote</button>`
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
            <h3 class="text-xl font-bold text-white mb-5">🎬 All Room Tour Videos</h3>
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
                        <span class="text-white text-2xl">▶</span>
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
      ? `<button data-action="nav" data-tab="contact" class="showroom-cta-btn-primary">📅 Book a Consultation</button>
                   <button data-action="nav" data-tab="gallery" class="showroom-cta-btn-outline">🖼️ Explore Gallery</button>`
      : `<button data-action="nav" data-tab="login" class="showroom-cta-btn-primary">🔒 Sign In to Get Started</button>
                   <button data-action="nav" data-tab="gallery" class="showroom-cta-btn-outline">🖼️ Explore Gallery</button>`
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
                  <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
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
                  <button type="submit" class="w-full py-4 bg-[color:var(--accent)] text-[color:var(--primary)] rounded-2xl font-semibold">Initiate Request</button>
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

// --- Frontend page layer: AI Studio -----------------------------------------
const renderAiStudio = () => {
  const canGenerate = !!state.smartStudio.originalImage && !state.smartStudio.isGenerating;
  const designs = state.smartStudio.variants || [];
  const rooms = [
    { id: 'bedroom', name: '🛏️ Bedroom' },
    { id: 'masterbedroom', name: '🛏️ Master Bedroom' },
    { id: 'kids', name: '🧸 Kids Bedroom' },
    { id: 'kitchen', name: '🍳 Kitchen' },
    { id: 'living', name: '🛋️ Living Room' },
    { id: 'dining', name: '🍽️ Dining Room' },
    { id: 'bathroom', name: '🚿 Bathroom' },
    { id: 'garden', name: '🌳 Garden' },
    { id: 'gym', name: '💪 Gym' },
    { id: 'office', name: '🏢 Office' },
    { id: 'terrace', name: '🌅 Terrace' },
    { id: 'pooja', name: '🪔 Pooja Room' }
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
              <div class="mt-2 text-xs text-green-600 font-semibold">✓ Photo uploaded successfully</div>
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
                      ${variant.price ? `<div class="text-xs font-bold text-[color:var(--accent)]">₹${(variant.price / 1000).toFixed(0)}k</div>` : ''}
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
              <div class="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">✨</div>
              <div class="font-bold text-white text-sm">3D Motion View</div>
              <div class="text-[10px] text-slate-400 mt-1 text-center">Cinematic ken-burns presentation</div>
            </button>

            <button
              data-action="open-3d-room"
              data-image-url="${escapeHtml(dialog.imageUrl)}"
              data-room-name="${escapeHtml(dialog.imageName || dialog.imageCategory || '3D Room')}"
              class="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/30 hover:border-purple-400 transition-all group"
            >
              <div class="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">🏠</div>
              <div class="font-bold text-white text-sm">View in 3D</div>
              <div class="text-[10px] text-slate-400 mt-1 text-center">Interactive 3D room environment</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
};

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
                        <span class="text-2xl" >✨</span>
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
                <h3 class="text-lg font-semibold text-cyan-300 mb-6">📊 Monthly Performance: Customers & Designs</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Bar Chart: Sales vs Customers by Month -->
                  <div class="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                    <div class="text-sm font-semibold text-emerald-300 mb-4">📈 Design Sales & Customers Chart</div>
                    <canvas id="portfolio-sales-chart" class="w-full" style="max-height: 300px;"></canvas>
                  </div>
                  
                  <!-- Line Chart: Performance Trend -->
                  <div class="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                    <div class="text-sm font-semibold text-cyan-300 mb-4">📉 Performance Trend</div>
                    <canvas id="portfolio-trend-chart" class="w-full" style="max-height: 300px;"></canvas>
                  </div>
                </div>
              </div>
              
              <!-- Category Breakdown with Charts -->
              <div>
                <h3 class="text-lg font-semibold text-purple-300 mb-6">🎯 Top Selling Categories & Famous Designs</h3>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <!-- Pie Chart: Sales by Category -->
                  <div class="rounded-2xl border border-purple-400/20 bg-slate-800/70 p-6 lg:col-span-1">
                    <div class="text-sm font-semibold text-white mb-4 text-center">📊 Sales by Category</div>
                    <canvas id="portfolio-category-pie" class="w-full" style="max-height: 280px;"></canvas>
                  </div>
                  
                  <!-- Doughnut Chart: Revenue Distribution -->
                  <div class="rounded-2xl border border-purple-400/20 bg-slate-800/70 p-6 lg:col-span-1">
                    <div class="text-sm font-semibold text-white mb-4 text-center">💰 Revenue Distribution</div>
                    <canvas id="portfolio-revenue-chart" class="w-full" style="max-height: 280px;"></canvas>
                  </div>
                  
                  <!-- Bar Chart: Category Rankings -->
                  <div class="rounded-2xl border border-purple-400/20 bg-slate-800/70 p-6 lg:col-span-1">
                    <div class="text-sm font-semibold text-white mb-4 text-center">🏆 Category Rankings</div>
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
                        <span class="text-xs text-emerald-300 font-bold">📈 ${cat.count} Orders</span>
                      </div>
                      
                      <div class="mb-2 text-xs text-slate-200">💵 Revenue: <span class="text-cyan-300 font-semibold">₹${(cat.revenue || 0).toLocaleString('en-IN')}</span></div>
                      
                      ${topDesign ? `
                        <div class="bg-slate-700/40 p-3 rounded-lg mb-3 border-l-2 border-fuchsia-500">
                          <div class="text-xs text-slate-300 mb-1">⭐ Famous Design:</div>
                          <div class="text-sm font-bold text-white mb-1 text-fuchsia-300">${escapeHtml(topDesign.name)}</div>
                          <div class="text-xs text-emerald-300">🔥 ${topDesign.count} purchases from <span class="font-semibold text-white">${topDesign.purchasedBy.size}</span> customers</div>
                        </div>
                      ` : ''}
                      
                      <div class="text-xs text-slate-300">
                        <div class="font-semibold text-cyan-300 mb-1">👥 Recent Customers:</div>
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
                        <div class="font-semibold text-amber-300 text-xs mb-2">🧾 ${isApartmentCategory ? 'All Orders' : 'Recent Orders'} (${orderRows.length})</div>
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
                      <span class="text-xl">✨</span>
                      <span>Options</span>
                    </button>
                    <button
                      data-action="open-3d-room"
                      data-image-url="${imageUrl}"
                      data-room-name="${categoryLabel}"
                      class="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-sm shadow-xl hover:scale-105 transition-transform"
                      style="background:linear-gradient(135deg,#6d28d9,#2563eb);"
                    >
                      <span class="text-xl">🏠</span>
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
                    <span class="text-xl">✨</span>
                    <span>Options</span>
                  </button>
                  <button
                    data-action="open-3d-room"
                    data-image-url="${escapedResolvedPreviewImage}"
                    data-room-name="${escapeHtml(categoryLabel)}"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-sm shadow-xl hover:scale-105 transition-transform"
                    style="background:linear-gradient(135deg,#6d28d9,#2563eb);"
                  >
                    <span class="text-xl">🏠</span>
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
                  🚀 Start Your Project
  </button>
  <button
data-action="nav"
data-tab="gallery"
class="px-8 py-4 border-2 border-purple-400 text-purple-400 font-bold rounded-xl hover:bg-purple-400/10 transition-all"
  >
                  📱 Explore AR Gallery
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
        icon.textContent = '○';
        return;
      }

      if (ok) {
        row.classList.remove('bg-red-50', 'border-red-200', 'text-red-700', 'bg-slate-50', 'border-slate-200', 'text-slate-500');
        row.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-700');
        icon.textContent = '✓';
      } else {
        row.classList.remove('bg-emerald-50', 'border-emerald-200', 'text-emerald-700', 'bg-slate-50', 'border-slate-200', 'text-slate-500');
        row.classList.add('bg-red-50', 'border-red-200', 'text-red-700');
        icon.textContent = '✕';
      }
    });
  };

  (window as any).updatePasswordStrength = updatePasswordStrengthUi;

  const isSetupMode = !state.adminAccount;
  const requiresStrongPassword = isSetupMode || state.loginForm.isSignup;
  const passwordChecks = getPasswordRuleChecks(state.loginForm.password || '');
  const canSubmit = !requiresStrongPassword || Object.values(passwordChecks).every(Boolean);

  return `
  <div class="min-h-screen relative overflow-hidden login-shell">
    <div class="absolute inset-0 pointer-events-none overflow-hidden has-3d-tilt">
      <img src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80" alt="Interior background" class="w-full h-full object-cover motion-3d" data-motion3d="true" />
      <div class="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl motion-3d" data-motion3d="true"></div>
      <div class="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-sky-400/12 blur-3xl motion-3d" data-motion3d="true"></div>
      <div class="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl motion-3d" data-motion3d="true"></div>
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-black/30 via-black/50 to-black/70"></div>
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
              <div class="text-2xl">🎨</div>
              <div class="text-xs mt-1 font-semibold">3D Designs</div>
            </div>
            <div class="rounded-xl bg-white/10 border border-white/20 p-3 text-center has-3d-tilt transition-transform duration-200">
              <div class="text-2xl">🏠</div>
              <div class="text-xs mt-1 font-semibold">AR Preview</div>
            </div>
            <div class="rounded-xl bg-white/10 border border-white/20 p-3 text-center has-3d-tilt transition-transform duration-200">
              <div class="text-2xl">💼</div>
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
                  ${isSetupMode ? '🔧' : state.loginForm.isSignup ? '✨' : '👤'}
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
                    ${state.loginForm.twoFactorDeliveryMethod ? `<div class="text-xs text-amber-800/80">Delivery: ${escapeHtml(state.loginForm.twoFactorDeliveryMethod)}${state.loginForm.twoFactorDeliveredTo ? ` · ${escapeHtml(state.loginForm.twoFactorDeliveredTo)}` : ''}</div>` : ''}
                    ${state.loginForm.twoFactorDebugCode ? `<div class="text-xs font-semibold text-amber-900">Dev code: ${escapeHtml(state.loginForm.twoFactorDebugCode)}</div>` : ''}
                  </div>
                ` : ''}

                ${state.loginForm.twoFactorChallengeId ? `
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">🔢</span>
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
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">👤</span>
                    <input name="name" required placeholder="Full Name" class="w-full pl-11 pr-4 py-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white focus:border-amber-500 outline-none" />
                  </div>
                ` : ''}

                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">📧</span>
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
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">🔒</span>
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
                  <button type="button" data-action="toggle-password" aria-label="Toggle password" class="absolute right-4 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-600">${state.loginForm.showPassword ? '🙈' : '👁️'}</button>
                </div>

                <div class="-mt-1">
                  <div class="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div data-password-strength-bar class="h-full rounded-full transition-all" style="width:0%;background:#cbd5e1;"></div>
                  </div>
                  <div class="mt-1 text-xs font-semibold text-slate-500">Strength: <span data-password-strength-label>Enter password</span></div>
                  <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div data-password-rule="length" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="length" class="font-bold">○</span><span>At least 8 characters</span></div>
                    <div data-password-rule="uppercase" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="uppercase" class="font-bold">○</span><span>One uppercase letter</span></div>
                    <div data-password-rule="number" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="number" class="font-bold">○</span><span>One number</span></div>
                    <div data-password-rule="special" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500"><span data-password-rule-icon="special" class="font-bold">○</span><span>One special character</span></div>
                  </div>
                </div>

                ${(isSetupMode || state.loginForm.isSignup) ? `
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">🔐</span>
                    <input name="confirmPassword" required type="${state.loginForm.showConfirmPassword ? 'text' : 'password'}" placeholder="Confirm Password" class="w-full pl-11 pr-12 py-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white focus:border-amber-500 outline-none" />
                    <button type="button" data-action="toggle-confirm-password" aria-label="Toggle confirm password" class="absolute right-4 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-600">${state.loginForm.showConfirmPassword ? '🙈' : '👁️'}</button>
                  </div>
                ` : ''}

                ${state.loginError ? `
                  <div class="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <span>⚠️</span><span>${escapeHtml(state.loginError)}</span>
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


// --- Frontend customer page layer (do not alter business logic) -------------
const renderCustomerDashboard = () => {
  const user = state.currentUser;
  if (!user) return '';

  const hiddenBookingIds = new Set(getHiddenBookingIds());
  const bookings = (state.customer.bookings || [])
    .map((booking: any) => normalizeBookingRecord(booking))
    .filter((booking: any) => String(booking?.userId || '') === String(user.id || ''))
    .filter((booking: any) => !hiddenBookingIds.has(String(booking?.id || '')));
  const { recentBookings, previousBookings } = organizeBookingsByStatus(bookings);
  const paidDesigns = syncPaidDesignsFromBookings(bookings);
  const customerInvoices = Array.isArray((state.customer as any).invoices)
    ? (state.customer as any).invoices
    : [];
  const customerAiDesigns = Array.isArray(state.customer.aiDesigns)
    ? state.customer.aiDesigns
      .slice()
      .sort((left: any, right: any) => new Date(right?.createdAt || 0).getTime() - new Date(left?.createdAt || 0).getTime())
    : [];
  const allLikes = state.customer.likes || [];
  const likes = allLikes.filter((like: any) => String(like?.userId || '') === String(user.id || '') && String(like?.value || '') === 'like');
  const dashboardAnnouncements = getActiveAnnouncements().filter((announcement: any) => (
    !announcement?.location || announcement.location === 'dashboard' || announcement.location === 'both'
  ));
  const eligibleDiscountBookings = getEligibleBookingsForDiscount();
  const dashboardCategories = getCustomerVisibleCategories((state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories());
  const dashboardPackages = (getCustomerDisplayPackages() || []) as Package[];
  const savedPackageIds = getSavedPackageIdsForUser(user.id);
  const savedPackages = dashboardPackages.filter((pkg: Package) => savedPackageIds.includes(String(pkg.id || '')));
  const packageTypeFilter: string = (state.customer as any).packageTypeFilter || 'All';
  const packageCardBatchSize = 12;
  const packageTypeOptions = ['All', '1BHK', '2BHK', '3BHK', '4BHK', 'Villa', 'Apartment'];

  const extractBhkFromPackage = (pkg: Package): number | null => {
    const direct = Number((pkg as any)?.bhk);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const text = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.description || '')}`;
    const match = text.match(/(\d+)\s*bhk/i);
    if (!match) return null;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const matchesPackageTypeFilter = (pkg: Package, selectedFilter: string): boolean => {
    if (selectedFilter === 'All') return true;

    if (/^\d+\s*BHK$/i.test(selectedFilter)) {
      const expectedBhk = Number(selectedFilter.replace(/\D/g, ''));
      return extractBhkFromPackage(pkg) === expectedBhk;
    }

    const filterKey = selectedFilter.trim().toLowerCase();
    const typeKey = String((pkg as any)?.type || '').trim().toLowerCase();
    const categoryKey = String(pkg?.category || '').trim().toLowerCase();
    const nameKey = `${String(pkg?.name || '')} ${String(pkg?.subtitle || '')} ${String(pkg?.description || '')}`.toLowerCase();

    return typeKey === filterKey
      || categoryKey === filterKey
      || nameKey.includes(filterKey);
  };

  const filteredPackages = packageTypeFilter === 'All'
    ? dashboardPackages
    : dashboardPackages.filter((p: Package) => matchesPackageTypeFilter(p, packageTypeFilter));
  const packageCardsVisibleRaw = Number((state.customer as any).packageCardsVisibleCount ?? packageCardBatchSize);
  const packageCardsVisibleCount = Number.isFinite(packageCardsVisibleRaw)
    ? Math.max(packageCardBatchSize, packageCardsVisibleRaw)
    : packageCardBatchSize;
  const visibleFilteredPackages = filteredPackages.slice(0, packageCardsVisibleCount);
  const hasMoreFilteredPackages = filteredPackages.length > visibleFilteredPackages.length;
  ensureDislikeFeedbackSampleData();
  if (state.customer.activeCategory !== 'all' && !dashboardCategories.some((cat) => cat.id === state.customer.activeCategory)) {
    state.customer.activeCategory = 'all';
  }
  if (state.customer.activeCategory !== 'all') {
    const selectedCategory = dashboardCategories.find((cat) => cat.id === state.customer.activeCategory);
    const existingDesigns = getGalleryDesignCandidates(state.customer.activeCategory).filter((design) => !isQATestDesign(design));
    if (selectedCategory && (selectedCategory.images || []).length > 0 && existingDesigns.length === 0) {
      ensureDesignsForCategory(state.customer.activeCategory);
    }
  }

  return `
    <div class="spidey-page">
      <section class="spidey-hero">
        <div class="spidey-hero-inner">
          <div class="spidey-kicker">Customer Portal</div>
          <div class="spidey-title">My Dashboard</div>
          <div class="spidey-subtitle">Manage your bookings, payments, and saved designs.</div>
          <div class="mt-4">
            <button data-action="toggle-dark-mode" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white text-sm font-semibold">${state.theme.darkMode ? 'Light Mode' : 'Dark Mode'}</button>
          </div>
        </div>
      </section>

      <!-- Browse & Book (Gallery Style) -->
      <section class="spidey-grid customer-dashboard-top lg:grid-cols-[1fr_1.8fr] gap-8 mt-8">
        <div class="spidey-panel p-6 space-y-6">
          <div>
            <div class="text-xs uppercase tracking-[0.3em] text-slate-500">Search</div>
            <input
              data-bind="searchQuery"
              value="${escapeHtml(state.searchQuery)}"
              placeholder="Search designs by name..."
              class="w-full mt-3 px-4 py-3 rounded-2xl border border-black/10"
            />
          </div>
          <div>
            <div class="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Categories</div>
            <div class="flex flex-wrap gap-2">
              <button data-action="filter-dashboard-category" data-category-id="all" class="spidey-chip ${state.customer.activeCategory === 'all' ? 'active' : ''}">All</button>
              ${dashboardCategories.map((cat) => `
                <button data-action="filter-dashboard-category" data-category-id="${escapeHtml(cat.id)}" class="spidey-chip ${state.customer.activeCategory === cat.id ? 'active' : ''}">
                  ${escapeHtml(cat.title || cat.name || cat.id)}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-black/5">
            ${(() => {
      const source = getCustomerCategoryBackedDesigns();
      const byCategory = state.customer.activeCategory === 'all'
        ? source
        : getGalleryDesignCandidates(state.customer.activeCategory).filter((design) => !isQATestDesign(design));
      const q = (state.searchQuery || '').trim().toLowerCase();
      const filtered = q ? byCategory.filter((design) => String(design.title || '').toLowerCase().includes(q)) : byCategory;
      return `
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Showing</div>
                <div class="text-2xl font-bold text-[color:var(--primary)]">${filtered.length}</div>
                <div class="text-sm text-slate-500">designs ready to book</div>
              `;
    })()}
          </div>
        </div>

        <div class="spidey-panel p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-display font-bold text-[color:var(--primary)]">Browse & Book Designs</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${(() => {
      const source = getCustomerCategoryBackedDesigns();
      const selectedCategory = state.customer.activeCategory === 'all'
        ? null
        : dashboardCategories.find((cat) => cat.id === state.customer.activeCategory) || null;
      const selectedImages = selectedCategory?.images || [];
      const byCategory = state.customer.activeCategory === 'all'
        ? source
        : getGalleryDesignCandidates(state.customer.activeCategory).filter((design) => !isQATestDesign(design));
      const q = (state.searchQuery || '').trim().toLowerCase();
      const filtered = q ? byCategory.filter((design) => String(design.title || '').toLowerCase().includes(q)) : byCategory;

      return filtered.length > 0
        ? filtered.map((design, index) => {
          const isLiked = likes.some((like: any) => String(like.designId || '') === String(design.id || ''));
          const designFileKey = getFilenameKey(design.previewImage || (design.images && design.images[0]) || '');
          const matchedImage = selectedImages.find((img: any) => {
            const byFilename = String((img as any).filename || '').toLowerCase();
            const byUrlFile = getFilenameKey(String(img.url || ''));
            return Boolean(designFileKey && (designFileKey === byFilename || designFileKey === byUrlFile));
          }) || selectedImages[index] || null;

          const cardImageUrl = String(matchedImage?.url || design.previewImage || (design.images && design.images[0]) || '');
          const displayName = resolveDesignDisplayName(design, {
            imageName: matchedImage?.name,
            imageUrl: cardImageUrl,
            categoryId: selectedCategory?.id || design.categoryId,
            categoryName: selectedCategory?.title || selectedCategory?.name,
            fallback: design.title || 'Design'
          });
          const categoryName = selectedCategory
            ? (selectedCategory.title || selectedCategory.name || selectedCategory.id)
            : (design.category || 'Design');

          return `
                    <div class="spidey-card has-3d-tilt group relative overflow-hidden">
                      <button
                        type="button"
                        data-action="open-category-image"
                        data-image-url="${escapeHtml(cardImageUrl)}"
                        data-image-name="${escapeHtml(displayName)}"
                        data-image-cost="${String(getDesignAmount(design))}"
                        data-category-name="${escapeHtml(categoryName)}"
                        data-category-id="${escapeHtml(design.categoryId || '')}"
                        data-design-id="${escapeHtml(design.id)}"
                        class="w-full aspect-square relative overflow-hidden"
                      >
                        ${cardImageUrl
              ? `<img src="${escapeHtml(cardImageUrl)}" alt="${escapeHtml(displayName)}" data-motion3d="true" class="motion-3d w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />`
              : '<div class="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">🏠</div>'}
                        <div class="absolute bottom-3 left-3 right-3 bg-black/60 text-white text-xs rounded-lg px-3 py-2">
                          <div class="font-semibold truncate">${escapeHtml(displayName)}</div>
                          <div class="text-[11px] text-white/80">${formatCurrency(getDesignAmount(design))}</div>
                        </div>
                      </button>
                      <div class="p-3 border-t border-black/5 bg-white">
                        <div class="flex gap-2">
                          <button data-action="like-design" data-design-id="${escapeHtml(design.id)}" data-like="like" class="px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold ${isLiked ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-600 bg-slate-50'}">👍 Like</button>
                          <button data-action="like-design" data-design-id="${escapeHtml(design.id)}" data-like="dislike" class="px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold ${isLiked ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-white'}">👎 Dislike</button>
                          <button data-action="quick-pay" data-design-id="${escapeHtml(design.id)}" class="flex-1 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-bold hover:opacity-90 transition">📝 Book Now</button>
                        </div>
                      </div>
                    </div>
                  `;
        }).join('')
        : '<div class="col-span-full text-center py-10 text-slate-400 italic">No designs match this category/search.</div>';
    })()}
          </div>
        </div>
      </section>

      <section class="spidey-grid customer-dashboard-bottom xl:grid-cols-[1.2fr_1.8fr] gap-8">
        <div class="space-y-6">
          <div class="spidey-panel p-6">
            <div class="flex items-center gap-4 mb-6">
              ${user.profilePhoto
      ? `<img src="${escapeHtml(String(user.profilePhoto))}" alt="${escapeHtml(user.name)}" class="w-16 h-16 rounded-full object-cover border border-black/10" />`
      : `<div class="w-16 h-16 rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-white text-2xl font-bold">
                  ${getInitials(user.name)}
                </div>`}
              <div>
                <h3 class="text-xl font-bold text-[color:var(--primary)]">${escapeHtml(user.name)}</h3>
                <p class="text-sm text-slate-500">${escapeHtml(user.email)}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 rounded-xl text-center">
                <div class="text-2xl font-bold text-[color:var(--primary)]">${bookings.length}</div>
                <div class="text-xs text-slate-400 uppercase tracking-wider">Bookings</div>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl text-center">
                <div class="text-2xl font-bold text-[color:var(--primary)]">${likes.length + savedPackages.length}</div>
                <div class="text-xs text-slate-400 uppercase tracking-wider">Saved</div>
              </div>
            </div>
          </div>

          <form data-form="customer-profile-form" class="spidey-panel p-6 space-y-6">
            <div>
              <div class="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 class="text-lg font-bold text-[color:var(--primary)]">Bio & Profile Details</h3>
                <span class="text-xs text-slate-400">Stored locally and visible in admin customer view</span>
              </div>

              <!-- Profile Photo Section -->
              <div class="border border-black/10 rounded-xl p-4 mb-6 bg-slate-50">
                <label class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">Profile Picture</label>
                <div class="flex flex-col sm:flex-row gap-4 items-start">
                  <div class="flex-shrink-0">
                    ${user.profilePhoto
        ? `<img src="${escapeHtml(String(user.profilePhoto))}" alt="Profile" class="w-28 h-28 rounded-lg object-cover border border-black/10" />`
        : `<div class="w-28 h-28 rounded-lg border-2 border-dashed border-black/20 flex items-center justify-center text-xs text-slate-400 bg-white">No Photo</div>`}
                  </div>
                  <div class="flex-1 min-w-0">
                    <input type="file" data-action="upload-customer-profile-photo" accept="image/*" class="w-full text-sm px-3 py-2 rounded-lg border border-black/10 bg-white cursor-pointer file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-[color:var(--primary)] file:text-white file:font-semibold file:cursor-pointer" />
                    <p class="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <!-- Personal Information Section -->
              <div class="space-y-4">
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Personal Information</h4>
                
                <!-- Name -->
                <div>
                  <label class="text-xs font-semibold text-slate-600 block mb-1.5">Full Name</label>
                  <input name="name" value="${escapeHtml(String(user.name || ''))}" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white" placeholder="Enter your full name" />
                </div>

                <!-- Email ID -->
                <div>
                  <label class="text-xs font-semibold text-slate-600 block mb-1.5">Email ID</label>
                  <input name="email" type="email" value="${escapeHtml(String(user.email || ''))}" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white" placeholder="your.email@example.com" />
                </div>

                <!-- Mobile Number -->
                <div>
                  <label class="text-xs font-semibold text-slate-600 block mb-1.5">Mobile No.</label>
                  <input name="phone" value="${escapeHtml(String((user as any).phone || ''))}" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white" placeholder="+91 XXXXXXXXXX" />
                </div>

                <!-- Gender & DOB in 2 columns -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs font-semibold text-slate-600 block mb-1.5">Gender</label>
                    <select name="gender" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white">
                      <option value="">Select Gender</option>
                      <option value="male" ${String((user as any).gender || '').toLowerCase() === 'male' ? 'selected' : ''}>Male</option>
                      <option value="female" ${String((user as any).gender || '').toLowerCase() === 'female' ? 'selected' : ''}>Female</option>
                      <option value="other" ${String((user as any).gender || '').toLowerCase() === 'other' ? 'selected' : ''}>Other</option>
                      <option value="prefer-not-to-say" ${String((user as any).gender || '').toLowerCase() === 'prefer-not-to-say' ? 'selected' : ''}>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs font-semibold text-slate-600 block mb-1.5">Date of Birth</label>
                    <input name="dob" type="date" value="${escapeHtml(String((user as any).dob || ''))}" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white" />
                  </div>
                </div>
              </div>

              <!-- Location Information Section -->
              <div class="space-y-4 pt-2 border-t border-black/10">
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Location & Address</h4>
                
                <!-- Location & Pincode in 2 columns -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs font-semibold text-slate-600 block mb-1.5">Location / City</label>
                    <input name="location" value="${escapeHtml(String((user as any).location || ''))}" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white" placeholder="e.g., New Delhi" />
                  </div>
                  <div>
                    <label class="text-xs font-semibold text-slate-600 block mb-1.5">Pincode</label>
                    <input name="pincode" value="${escapeHtml(String((user as any).pincode || ''))}" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white" placeholder="e.g., 110001" />
                  </div>
                </div>

                <!-- Address -->
                <div>
                  <label class="text-xs font-semibold text-slate-600 block mb-1.5">Address</label>
                  <input name="address" value="${escapeHtml(String((user as any).address || ''))}" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white" placeholder="Street address, area, etc." />
                </div>
              </div>

              <!-- Bio Section -->
              <div class="space-y-3 pt-2 border-t border-black/10">
                <label class="text-xs font-semibold text-slate-600 block">Short Bio</label>
                <textarea name="bio" rows="4" class="w-full px-4 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] bg-white resize-none" placeholder="Tell us a bit about yourself...">${escapeHtml(String((user as any).bio || ''))}</textarea>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex gap-3 pt-4 border-t border-black/10">
              <button type="submit" class="flex-1 px-5 py-3 rounded-lg bg-[color:var(--primary)] text-white font-semibold hover:opacity-90 transition">✓ Save Profile</button>
            </div>
          </form>

        </div>

        <div class="space-y-6">
          <div class="spidey-panel p-6">
            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 class="text-lg font-bold text-[color:var(--primary)]">Packages</h3>
              <span class="text-xs text-slate-400">Showing ${visibleFilteredPackages.length} of ${filteredPackages.length} packages</span>
            </div>
            <!-- Type filter chips -->
            <div class="flex flex-wrap gap-2 mb-5">
              ${packageTypeOptions.map((opt) => `
                <button type="button" data-action="filter-package-type" data-type="${escapeHtml(opt)}"
                  class="px-3 py-1.5 rounded-full text-xs font-semibold border transition
                    ${packageTypeFilter === opt
                      ? 'bg-[color:var(--primary)] text-white border-[color:var(--primary)]'
                      : 'bg-white text-slate-600 border-black/10 hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]'
                    }">
                  ${escapeHtml(opt)}
                </button>
              `).join('')}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              ${filteredPackages.length > 0 ? visibleFilteredPackages.map((pkg: Package) => {
                const isLiked = savedPackageIds.includes(String(pkg.id || ''));
                const roomCount = (pkg.rooms || []).length;
                const discount = pkg.originalPrice > 0 ? Math.round((1 - Number(pkg.discountedPrice || pkg.originalPrice) / Number(pkg.originalPrice)) * 100) : 0;
                return `
                <div class="rounded-2xl border border-black/10 bg-white overflow-hidden flex flex-col group hover:shadow-md transition has-3d-tilt">
                  <div class="relative h-40 bg-slate-100 overflow-hidden">
                    <div class="absolute inset-0 w-full h-full">
                      <img src="${escapeHtml(getPackageBackgroundImage(pkg))}" alt="${escapeHtml(pkg.name)} background" loading="lazy" decoding="async" class="w-full h-full object-cover opacity-60" style="z-index:1;" onerror="this.src='/category/Living room/living1.jpg'" />
                      <img src="${escapeHtml(getPackageDisplayImage(pkg))}" alt="${escapeHtml(pkg.name)}" loading="lazy" decoding="async" class="motion-3d w-2/3 h-2/3 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-105 transition-transform duration-300" data-motion3d="true" style="z-index:2;" onerror="this.src='/category/Living room/living1.jpg'" />
                    </div>
                    ${discount > 0 ? `<div class="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${discount}% OFF</div>` : ''}
                    <div class="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${escapeHtml(pkg.category || 'Package')}</div>
                  </div>
                  <div class="p-4 space-y-2 flex-1 flex flex-col">
                    <div class="font-semibold text-[color:var(--primary)] leading-tight">${escapeHtml(pkg.name)}</div>
                    <div class="text-[11px] text-slate-500 line-clamp-2 flex-1">${escapeHtml(pkg.subtitle || pkg.description || '')}</div>
                    ${roomCount > 0 ? `<div class="text-[10px] text-slate-400">🛏 ${roomCount} room${roomCount !== 1 ? 's' : ''} included</div>` : ''}
                    <div class="flex items-baseline gap-2">
                      <div class="text-xs line-through text-slate-400">${formatCurrency(Number(pkg.originalPrice || 0))}</div>
                      <div class="text-base font-bold text-[color:var(--accent)]">${formatCurrency(Number(pkg.discountedPrice || pkg.originalPrice || 0))}</div>
                    </div>
                    <div class="flex flex-wrap gap-1 pt-1">
                      ${(pkg.features || []).slice(0, 3).map((f: string) => `<span class="text-[10px] bg-slate-50 border border-black/5 rounded px-2 py-0.5 text-slate-600">${escapeHtml(String(f))}</span>`).join('')}
                    </div>
                    <div class="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                      <button type="button" data-action="like-package" data-package-id="${escapeHtml(pkg.id)}"
                        class="py-2 rounded-lg border text-xs font-semibold ${isLiked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-black/10'}">
                        ${isLiked ? '❤️ Saved' : '🤍 Save'}
                      </button>
                      <button type="button" data-action="open-package-modal" data-package-id="${escapeHtml(pkg.id)}" class="py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">View</button>
                      <button type="button" data-action="book-package-card" data-package-id="${escapeHtml(pkg.id)}" class="py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-bold">Book (Approval)</button>
                    </div>
                  </div>
                </div>`;
              }).join('') : `<div class="col-span-full text-sm text-slate-400 italic py-6 text-center">No ${packageTypeFilter === 'All' ? '' : packageTypeFilter + ' '}packages available right now.</div>`}
            </div>
            ${hasMoreFilteredPackages ? `
              <div class="mt-4 flex justify-center">
                <button
                  type="button"
                  data-action="load-more-package-cards"
                  class="px-4 py-2 rounded-lg border border-black/10 bg-white text-slate-700 text-xs font-semibold hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition"
                >
                  Load 12 More
                </button>
              </div>
            ` : ''}
          </div>

          ${dashboardAnnouncements.length > 0 ? `
            <div class="spidey-panel p-6">
              <h3 class="text-lg font-bold text-[color:var(--primary)] mb-3">Live Announcements</h3>
              <div class="space-y-2">
                ${dashboardAnnouncements.map((announcement: any) => `
                  <div class="p-3 rounded-xl border border-amber-100 bg-amber-50/60">
                    <div class="text-sm font-semibold text-[color:var(--primary)]">${getAnnouncementEmoji(announcement)} ${escapeHtml(announcement.title || 'Announcement')}</div>
                    <div class="text-xs text-slate-600 mt-1">${escapeHtml(announcement.message || '')}</div>
                    ${(() => {
                      const matchedCodes = getAnnouncementMatchedDiscountCodes(announcement);
                      if (matchedCodes.length === 0) return '';
                      return `
                        <div class="mt-3 flex flex-wrap gap-2">
                          ${matchedCodes.map((code: any) => {
                            const booking = getEligibleBookingForDiscountCode(code);
                            const offerKind = code.type === 'flat'
                              ? `${formatCurrency(Number(code.value || 0))} OFF`
                              : `${Number(code.value || 0)}% OFF`;
                            const label = booking
                              ? `Use on ${escapeHtml(resolveBookingDesignContext(booking).displayName)}`
                              : eligibleDiscountBookings.length > 0
                                ? 'Save code'
                                : 'Save for next booking';
                            return `
                              <button
                                type="button"
                                data-action="use-announcement-discount"
                                data-discount-code="${escapeHtml(String(code.code || ''))}"
                                data-booking-id="${escapeHtml(String(booking?.id || ''))}"
                                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-amber-200 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition"
                              >
                                <span>${escapeHtml(String(code.code || ''))}</span>
                                <span class="text-amber-600">${escapeHtml(offerKind)}</span>
                                <span class="text-slate-500">${label}</span>
                              </button>
                            `;
                          }).join('')}
                        </div>
                      `;
                    })()}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Saved Design Studio Concepts -->
          <div class="spidey-panel p-6">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h3 class="text-lg font-bold text-[color:var(--primary)]">🧠 Saved Design Studio Concepts</h3>
              <button data-action="nav" data-tab="ai-studio" class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition">Open Studio</button>
            </div>
            <div class="space-y-3">
              ${customerAiDesigns.length > 0
      ? customerAiDesigns.slice(0, 12).map((record: any) => {
        const variants = Array.isArray(record?.variants) ? record.variants : [];
        const topVariant = variants[0] || null;
        const variantImage = String(topVariant?.image || record?.originalImage || '').trim();
        const variantTitle = String(topVariant?.title || topVariant?.designName || 'Design Studio Concept').trim();
        const variantPrice = Number(topVariant?.price || 0);
        const variantCategory = String(topVariant?.categoryName || record?.roomType || record?.room || 'Design Studio').trim();
        const variantDesignId = String(topVariant?.designId || record?.id || '').trim();
        return `
                <div class="p-3 rounded-xl border border-black/10 bg-white flex items-start gap-3">
                  ${variantImage
            ? `<img src="${escapeHtml(variantImage)}" alt="${escapeHtml(variantTitle)}" class="w-16 h-16 rounded-lg object-cover border border-black/10" />`
            : `<div class="w-16 h-16 rounded-lg bg-slate-100 border border-dashed border-black/10 flex items-center justify-center text-[10px] text-slate-400">No Image</div>`}
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(variantTitle)}</div>
                    <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(variantCategory)} • ${escapeHtml(formatInvoiceDateTime(record?.createdAt).display)}</div>
                    <div class="text-[11px] text-slate-500 mt-1">${variants.length} saved variants</div>
                    <div class="flex gap-2 mt-2">
                      <button data-action="ai-studio-view-detail" data-id="${escapeHtml(String(record?.id || ''))}" class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition">View</button>
                      <button data-action="book-ai-design" data-design-id="${escapeHtml(variantDesignId)}" data-design-name="${escapeHtml(variantTitle)}" data-design-price="${Number.isFinite(variantPrice) ? variantPrice : 0}" data-design-category="${escapeHtml(variantCategory)}" class="px-3 py-1.5 rounded-lg bg-[color:var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition">Book</button>
                    </div>
                  </div>
                </div>
              `;
      }).join('')
      : '<div class="text-center py-4 text-slate-400 italic text-sm">No saved Design Studio concepts yet. Save from Design Studio to see them here.</div>'}
            </div>
          </div>

          <!-- Paid Designs -->
          <div class="spidey-panel p-6">
            <h3 class="text-lg font-bold text-[color:var(--primary)] mb-4">✓ Paid Designs</h3>
            <div class="space-y-4">
              ${paidDesigns.length > 0 ? paidDesigns.map((paidItem: any) => {
      const booking = bookings.find((item: any) => String(item?.id || '') === String(paidItem.bookingId || '')) || null;
      const bookingContext = booking ? resolveBookingDesignContext(booking) : {
        displayName: paidItem.designName || 'Design',
        imageUrl: paidItem.imageUrl || '',
        design: { id: paidItem.designId || '' }
      };
      const bookingDisplayLabel = booking
        ? getBookingDisplayLabel(booking, bookingContext)
        : `Booking ${String(paidItem.bookingId || '').slice(0, 8)}`;
      const bookingStatusDisplay = 'confirmed';
      const paymentBadgeClass = 'bg-emerald-100 text-emerald-700';
      const bookingStatusBadgeClass = 'bg-green-100 text-green-700';
      return `
                <div class="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 shadow-sm">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-start gap-3 min-w-0">
                      <img src="${escapeHtml(bookingContext.imageUrl)}" alt="${escapeHtml(bookingContext.displayName)}" class="w-14 h-14 rounded-xl object-cover border border-emerald-200" />
                      <div class="min-w-0">
                      <div class="font-bold text-emerald-700 truncate">${escapeHtml(bookingContext.displayName)}</div>
                      <div class="text-xs text-slate-500">${escapeHtml(bookingDisplayLabel)} • ${escapeHtml(formatInvoiceDateTime(paidItem.bookedAt).display)}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-[color:var(--accent)]">${formatCurrency(Number(paidItem.amount || 0))}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${bookingStatusBadgeClass}">${escapeHtml(bookingStatusDisplay)}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${paymentBadgeClass}">✓ Paid</div>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-4 pt-3 border-t border-emerald-200">
                    ${booking
          ? `<button data-action="open-booking-details" data-booking-id="${booking.id}" class="flex-1 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition">View Details</button>
                    <button data-action="remove-booking" data-booking-id="${booking.id}" class="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition">Remove</button>`
          : '<div class="flex-1 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold text-center border border-emerald-200">Stored purchase record</div>'}
                  </div>
                </div>
              `;
    }).join('') : '<div class="text-center py-6 text-slate-400 italic text-sm">No paid designs yet. Complete a payment to see purchased designs here.</div>'}
            </div>
          </div>

          <!-- Invoices -->
          <div class="spidey-panel p-6">
            <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 class="text-lg font-bold text-[color:var(--primary)]">🧾 Invoices</h3>
              <button data-action="customer-load-invoices" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition">Load Invoices</button>
            </div>
            <div class="space-y-3">
              ${customerInvoices.length > 0 ? customerInvoices.slice(0, 8).map((invoice: any) => `
                <div class="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(String(invoice.invoiceNumber || invoice.id || 'Invoice'))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">👤 Customer Name: ${escapeHtml(String(invoice.customerName || 'N/A'))}</div>
                    <div class="text-xs text-slate-500">Amount: ${formatCurrency(Number(invoice.totalAmount || invoice.amount || 0))} • ${escapeHtml(String(invoice.status || 'generated'))}</div>
                    <div class="text-[11px] text-slate-500 mt-1">📦 Booked Package: ${escapeHtml(String(invoice.packageName || invoice.designName || 'N/A'))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">🎨 Design Name: ${escapeHtml(String(invoice.designName || invoice.packageName || 'N/A'))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">💳 Payment Mode: ${escapeHtml(formatPaymentMethodLabel(invoice.paymentMethod))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">🗓️ Payment Date: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).date)}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">⏰ Payment Time: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).time)}</div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0 customer-card-actions">
                    <button data-action="customer-view-invoice" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition">View</button>
                    <button data-action="customer-download-invoice" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition">Download</button>
                  </div>
                </div>
              `).join('') : '<div class="text-center py-4 text-slate-400 italic text-sm">No invoices loaded yet. Tap "Load Invoices" to fetch your records.</div>'}
            </div>
          </div>

          <!-- Previous/Pending Bookings (Awaiting Payment) -->
          <div class="spidey-panel p-6">
            <h3 class="text-lg font-bold text-[color:var(--primary)] mb-4">⏳ Pending Bookings (Awaiting Payment)</h3>
            <div class="space-y-4">
              ${previousBookings.length > 0 ? previousBookings.map((booking) => {
      const bookingContext = resolveBookingDesignContext(booking);
                  const bookingDisplayLabel = getBookingDisplayLabel(booking, bookingContext);
      const bookingPaymentStatus = getBookingPaymentStatus(booking);
      const bookingStatusRaw = String(booking.status || '').trim().toLowerCase();
      const bookingStatusDisplay = (bookingStatusRaw || 'pending');
      const paymentBadgeClass = bookingPaymentStatus === 'failed'
          ? 'bg-red-100 text-red-700'
          : 'bg-amber-100 text-amber-700';
      const bookingStatusBadgeClass = bookingStatusDisplay === 'cancelled'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
      return `
                <div class="p-4 rounded-xl border border-amber-100 bg-amber-50/40 shadow-sm">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-start gap-3 min-w-0">
                      <img src="${escapeHtml(bookingContext.imageUrl)}" alt="${escapeHtml(bookingContext.displayName)}" class="w-14 h-14 rounded-xl object-cover border border-amber-200" />
                      <div class="min-w-0">
                      <div class="font-bold text-amber-900 truncate">${escapeHtml(bookingContext.displayName)}</div>
                      <div class="text-xs text-slate-500">${escapeHtml(bookingDisplayLabel)} • ${formatMonthYearDate(booking.createdAt)}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-[color:var(--accent)]">${formatCurrency(getBookingAmount(booking))}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${bookingStatusBadgeClass}">${escapeHtml(bookingStatusDisplay)}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${paymentBadgeClass}">${bookingPaymentStatus === 'failed' ? '✗ Failed' : '⏳ Pending'}</div>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-4 pt-3 border-t border-amber-200">
                    <button data-action="open-booking-details" data-booking-id="${booking.id}" class="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition">View Details</button>
                    ${bookingPaymentStatus !== 'paid' && isBookingApprovedForPayment(booking) ? `
                      <button type="button" data-action="pay-and-book" data-booking-id="${booking.id}" data-design-id="${escapeHtml(String(bookingContext.design?.id || booking.designId || ''))}" class="flex-1 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-bold hover:opacity-90 transition">💳 Pay Now</button>
                    ` : ''}
                    ${bookingPaymentStatus !== 'paid' && !isBookingApprovedForPayment(booking) ? `
                      <div class="flex-1 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold text-center border border-blue-200">⏳ Awaiting approval</div>
                    ` : ''}
                    <button data-action="remove-booking" data-booking-id="${booking.id}" class="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition">Remove</button>
                  </div>
                </div>
              `;
    }).join('') : '<div class="text-center py-6 text-slate-400 italic text-sm">No pending bookings. Great! Explore our gallery to book more designs.</div>'}
            </div>
          </div>
        </div>
      </section>
      
      ${(state.customer as any).bookingDetails ? renderBookingDetailsModal() : ''}

      <!-- Dashboard Feedback -->
      <section class="spidey-panel p-6 mt-8">
        <h3 class="text-lg font-bold text-[color:var(--primary)] mb-4">Feedback</h3>
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
          <div class="space-y-4">
            <div>
              <div class="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Rate Your Experience</div>
              <div class="flex items-center gap-2">
                ${[1, 2, 3, 4, 5].map((star) => `
                  <button type="button" data-action="set-customer-rating" data-rating="${star}" class="text-2xl ${state.customer.rating >= star ? 'text-amber-400' : 'text-slate-300'} hover:scale-110 transition">★</button>
                `).join('')}
              </div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Your Feedback</div>
              <textarea
                data-bind="customer.feedbackText"
                class="w-full min-h-28 px-4 py-3 rounded-2xl border border-black/10"
                placeholder="Tell us how your design booking and payment experience was..."
              >${escapeHtml(state.customer.feedbackText || '')}</textarea>
            </div>
            <button data-action="submit-customer-feedback" class="px-5 py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold hover:opacity-90 transition">Submit Feedback</button>
          </div>

          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Your Recent Feedback</div>
            <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
              ${(() => {
      const allFeedbacks = state.customer.feedbacks || [];
      const mine = allFeedbacks
        .filter((item: any) => String(item?.userId || '') === String(user.id || ''))
        .slice()
        .reverse();
      if (!mine.length) return '<div class="text-sm text-slate-400 italic">No feedback submitted yet.</div>';
      return mine.slice(0, 8).map((item: any) => `
                  <div class="p-3 rounded-xl border border-black/5 bg-slate-50">
                    <div class="flex items-center justify-between mb-1">
                      <div class="text-amber-400 text-sm">${'★'.repeat(Math.max(1, Number(item.rating || 0)))}</div>
                      <div class="text-[10px] text-slate-400">${formatMonthYearDate(item.createdAt)}</div>
                    </div>
                    <div class="text-sm text-slate-600">${escapeHtml(String(item.comment || ''))}</div>
                  </div>
                `).join('');
    })()}
            </div>
          </div>
        </div>
      </section>

      <!-- Liked & Disliked Designs -->
      <section class="spidey-panel p-6 mt-8">
        <h3 class="text-lg font-bold text-[color:var(--primary)] mb-4">Design Preferences</h3>
        <div class="mb-6">
          <div class="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Saved Packages</div>
          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            ${savedPackages.length > 0 ? savedPackages.map((pkg: Package) => `
              <div class="flex items-center gap-3 p-3 rounded-xl border border-black/5 bg-slate-50">
                ${renderImageThumb(getPackageDisplayImage(pkg), pkg.name, 'w-12 h-12', 'text-[10px]')}
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(pkg.name)}</div>
                  <div class="text-xs text-slate-500">${formatCurrency(Number(pkg.discountedPrice || pkg.originalPrice || 0))}</div>
                </div>
                <button data-action="remove-preference" data-package-id="${escapeHtml(String(pkg.id || ''))}" class="px-2 py-1 rounded-lg text-xs font-semibold text-red-600 bg-white border border-red-200">Remove</button>
                <button data-action="open-package-modal" data-package-id="${escapeHtml(String(pkg.id || ''))}" class="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200">View</button>
              </div>
            `).join('') : '<div class="text-sm text-slate-400 italic">No saved packages yet.</div>'}
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Liked Designs</div>
            <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
              ${(() => {
      const designPool = getCustomerCategoryBackedDesigns();
      const liked = (state.customer.likes || []).filter((item: any) => String(item?.userId || '') === String(user.id || '') && String(item?.value || '') === 'like');
      if (!liked.length) return '<div class="text-sm text-slate-400 italic">No liked designs yet.</div>';
      return liked.map((like: any) => {
        const design = designPool.find((d) => d.id === like.designId) || getDesigns().find((d: any) => String(d?.id || '') === String(like.designId || ''));
        if (!design) return '';
        const presentation = getCustomerDesignPresentation(design);
        return `
                    <div class="flex items-center gap-3 p-3 rounded-xl border border-black/5 bg-slate-50">
                      ${renderImageThumb(presentation.imageUrl, presentation.displayName, 'w-12 h-12', 'text-[10px]')}
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(presentation.displayName)}</div>
                        <div class="text-xs text-slate-500">${formatCurrency(getDesignAmount(design))}</div>
                      </div>
                      <button data-action="remove-preference" data-design-id="${escapeHtml(design.id)}" class="px-2 py-1 rounded-lg text-xs font-semibold text-red-600 bg-white border border-red-200">Remove</button>
                      <button data-action="like-design" data-design-id="${escapeHtml(design.id)}" data-like="dislike" class="px-2 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-100">Dislike</button>
                    </div>
                  `;
      }).join('');
    })()}
            </div>
          </div>

          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Disliked Designs</div>
            <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
              ${(() => {
      const designPool = getCustomerCategoryBackedDesigns();
      const feedbackRecords = getDislikeFeedbackRecords();
      const disliked = (state.customer.likes || []).filter((item: any) => String(item?.userId || '') === String(user.id || '') && String(item?.value || '') === 'dislike');
      if (!disliked.length) return '<div class="text-sm text-slate-400 italic">No disliked designs yet.</div>';
      return disliked.map((like: any) => {
        const design = designPool.find((d) => d.id === like.designId) || getDesigns().find((d: any) => String(d?.id || '') === String(like.designId || ''));
        if (!design) return '';
        const presentation = getCustomerDesignPresentation(design);
        const latestFeedback = feedbackRecords
          .filter((record: any) => String(record.userId || '') === String(user.id || '') && String(record.designId || '') === String(design.id || ''))
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
        return `
                    <div class="p-3 rounded-xl border border-black/5 bg-slate-50">
                      <div class="flex items-center gap-3">
                        ${renderImageThumb(presentation.imageUrl, presentation.displayName, 'w-12 h-12', 'text-[10px]')}
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(presentation.displayName)}</div>
                          <div class="text-xs text-slate-500">${formatCurrency(getDesignAmount(design))}</div>
                        </div>
                        <button data-action="remove-preference" data-design-id="${escapeHtml(design.id)}" class="px-2 py-1 rounded-lg text-xs font-semibold text-red-600 bg-white border border-red-200">Remove</button>
                        <button data-action="like-design" data-design-id="${escapeHtml(design.id)}" data-like="like" class="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100">Like</button>
                        <button data-action="edit-dislike-feedback" data-design-id="${escapeHtml(design.id)}" class="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200">Feedback</button>
                      </div>
                      ${latestFeedback ? `
                        <div class="mt-2 text-xs text-slate-600 bg-white border border-slate-100 rounded-lg p-2">
                          <div class="font-semibold text-slate-500 mb-1">Your Feedback</div>
                          <div>${escapeHtml(String(latestFeedback.comment || 'No comment'))}</div>
                        </div>
                      ` : ''}
                      ${latestFeedback?.adminReply ? `
                        <div class="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-2">
                          <div class="font-semibold mb-1">Admin Response${latestFeedback.adminName ? ` (${escapeHtml(String(latestFeedback.adminName))})` : ''}</div>
                          <div>${escapeHtml(String(latestFeedback.adminReply || ''))}</div>
                        </div>
                      ` : ''}
                    </div>
                  `;
      }).join('');
    })()}
            </div>
          </div>
        </div>
      </section>

      ${renderCardPaymentModal()}
      ${renderPaymentSuccessModal()}
    </div>
  `;
};

const renderUploadModal = () => {
  if (!state.upload.open) return '';
  const categories = getCategories();

  return `
    <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 admin-modal-overlay" data-action="close-upload">
      <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up admin-modal-card" data-action="ignore">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-xl font-bold text-[color:var(--primary)]">Upload New Design</h3>
          <button data-action="close-upload" class="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>
        
        <form data-form="catalog-upload" class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
              <input name="title" required class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition" placeholder="e.g. Modern Living Room" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
              <select name="category" required class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition">
                <option value="">Select Category</option>
                ${categories.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" rows="3" class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition" placeholder="Describe the design style, materials, etc."></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (₹)</label>
              <input name="price" type="number" class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition" placeholder="0" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Availability</label>
              <select name="availabilityStatus" class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 pt-2">
            <div class="relative group cursor-pointer">
              <input type="file" name="img" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" data-file-input="img" />
              <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center group-hover:border-[color:var(--primary)] transition bg-slate-50">
                <div class="text-2xl mb-2">🖼️</div>
                <div class="text-xs font-bold text-slate-600" data-file-name="img">Upload Preview Image</div>
                <div class="text-[10px] text-slate-400 mt-1">JPG, PNG, WEBP</div>
              </div>
            </div>
          </div>

          ${state.upload.newModel.previewImage ? `
            <div class="mt-4 rounded-xl overflow-hidden h-32 border border-black/10 relative">
              <img src="${escapeHtml(state.upload.newModel.previewImage)}" class="w-full h-full object-cover" />
              <div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Preview</div>
            </div>
          ` : ''}

          ${state.upload.uploadError ? `
            <div class="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
              <span>⚠️</span> ${escapeHtml(state.upload.uploadError)}
            </div>
          ` : ''}

          <div class="pt-4">
            <button type="submit" class="w-full py-4 rounded-xl bg-[color:var(--primary)] text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" ${state.upload.isUploading ? 'disabled' : ''}>
              ${state.upload.isUploading ? '<span class="animate-spin">⏳</span> Uploading...' : '🚀 Publish Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
};

const renderCatalogActionDialog = () => {
  const dialogState = (state.admin as any).catalogActionDialog as { mode: 'archive' | 'delete'; id: string; title: string } | null;
  if (!dialogState) return '';

  const isDelete = dialogState.mode === 'delete';
  const heading = isDelete ? 'Delete Design?' : 'Archive Design?';
  const body = isDelete
    ? 'This will remove the design from catalog and customer views. This action cannot be undone from UI.'
    : 'This will hide the design from catalog and customer views. You can re-activate it later from backend or local data.';
  const confirmLabel = isDelete ? 'Delete' : 'Archive';
  const confirmClass = isDelete
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-amber-500 hover:bg-amber-600 text-white';

  return `
    <div class="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 admin-modal-overlay" data-action="cancel-catalog-action">
      <div class="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl admin-modal-card" data-action="ignore">
        <h3 class="text-lg font-bold text-[color:var(--primary)] mb-2">${heading}</h3>
        <p class="text-sm text-slate-600 mb-3">${escapeHtml(dialogState.title || 'Selected design')}</p>
        <p class="text-sm text-slate-500 mb-5">${body}</p>
        <div class="flex justify-end gap-2 admin-modal-actions">
          <button type="button" data-action="cancel-catalog-action" class="px-4 py-2 rounded-lg border border-black/10 text-slate-700 text-sm font-semibold">Cancel</button>
          <button type="button" data-action="confirm-catalog-action" class="px-4 py-2 rounded-lg text-sm font-semibold ${confirmClass}">${confirmLabel}</button>
        </div>
      </div>
    </div>
  `;
};

const renderAdminDislikeFeedbackSection = () => {
  ensureDislikeFeedbackSampleData();
  const records = getDislikeFeedbackRecords();
  const sorted = records.slice().sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return `
    <section class="spidey-panel p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">👎 Disliked Design Feedback</h2>
        <span class="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600">${sorted.length} entries</span>
      </div>
      <div class="space-y-3 max-h-[420px] overflow-y-auto">
        ${sorted.length > 0 ? sorted.map((item: any) => `
          <div class="p-4 rounded-xl border border-black/10 bg-white">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(String(item.designTitle || 'Design'))}</div>
                <div class="text-xs text-slate-500">By ${escapeHtml(String(item.userName || item.userId || 'Customer'))} • ${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</div>
              </div>
              <span class="text-[10px] px-2 py-1 rounded-full ${item.adminReply ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${item.adminReply ? 'Responded' : 'Pending'}</span>
            </div>
            <div class="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3">${escapeHtml(String(item.comment || 'No comment'))}</div>
            ${item.adminReply ? `
              <div class="mt-3 text-sm rounded-lg bg-blue-50 border border-blue-100 p-3">
                <div class="text-xs font-semibold text-blue-700 mb-1">Admin Response (${escapeHtml(String(item.adminName || 'Admin'))})</div>
                <div class="text-blue-800">${escapeHtml(String(item.adminReply || ''))}</div>
              </div>
            ` : ''}
            <div class="mt-3 flex justify-end">
              <button data-action="respond-dislike-feedback" data-feedback-id="${escapeHtml(String(item.id || ''))}" class="px-3 py-1.5 rounded-lg bg-[color:var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition">Respond</button>
            </div>
          </div>
        `).join('') : '<div class="text-sm text-slate-400 italic">No dislike feedback submitted yet.</div>'}
      </div>
    </section>
  `;
};

const adminSectionRenderCache = new Map<string, { key: string; html: string }>();

const getCollectionStamp = (items: any[]): string => {
  if (!Array.isArray(items) || items.length === 0) return 'empty';
  const first = items[0] || {};
  const last = items[items.length - 1] || {};
  return [
    String(items.length),
    String(first.id || first.updatedAt || first.createdAt || ''),
    String(last.id || last.updatedAt || last.createdAt || '')
  ].join(':');
};

const memoizeAdminSection = (
  sectionId: string,
  keyParts: Array<string | number | boolean | null | undefined>,
  renderer: () => string
): string => {
  const key = keyParts.map((part) => String(part ?? '')).join('||');
  const cached = adminSectionRenderCache.get(sectionId);
  if (cached && cached.key === key) return cached.html;
  const html = renderer();
  adminSectionRenderCache.set(sectionId, { key, html });
  return html;
};

// --- Frontend admin page layer (do not alter business logic) ----------------
const renderAdmin = () => {
  const chatbotStats = chatbotStatsState;
  const chatbotSettings = chatbotSettingsState;

  const adminBookings = Array.isArray(state.admin?.bookings) ? state.admin.bookings : [];
  const adminInvoices = Array.isArray((state.admin as any)?.invoices) ? (state.admin as any).invoices : [];
  const adminInquiries = Array.isArray(state.admin?.inquiries) ? state.admin.inquiries : [];
  const adminCustomers = Array.isArray((state.admin as any)?.customers) ? (state.admin as any).customers : [];
  const adminFeedbacks = Array.isArray((state.admin as any)?.feedbacks) ? (state.admin as any).feedbacks : [];
  const adminCategories = Array.isArray(state.customer?.categories) ? state.customer.categories : [];
  const adminDesigns = Array.isArray(state.customer?.designs) ? state.customer.designs : [];
  const adminCatalog = Array.isArray(state.catalog) ? state.catalog : [];
  const adminServices = Array.isArray(state.services) ? state.services : [];
  const adminShowrooms = Array.isArray(state.showrooms) ? state.showrooms : [];
  const adminShowcases = Array.isArray(state.serviceShowcases) ? state.serviceShowcases : [];

  const dashboardSection = memoizeAdminSection('admin-dashboard', [
    getCollectionStamp(adminBookings),
    getCollectionStamp(adminCustomers),
    getCollectionStamp(adminInvoices)
  ], renderAdminDashboardSection);

  const bookingsSection = memoizeAdminSection('admin-bookings', [
    getCollectionStamp(adminBookings),
    String(state.admin?.bookingFilter?.query || ''),
    String(state.admin?.bookingFilter?.categoryId || 'all'),
    String(state.admin?.bookingFilter?.paymentStatus || 'all'),
    String(state.admin?.bookingFilter?.approvalStatus || 'all'),
    String(state.admin?.bookingFilter?.dateFrom || ''),
    String(state.admin?.bookingFilter?.dateTo || ''),
    String((state.admin as any)?.selectedBooking?.id || '')
  ], renderAdminBookingsSection);

  const invoicesSection = memoizeAdminSection('admin-invoices', [
    getCollectionStamp(adminInvoices),
    String((state.admin as any)?.invoiceFilter?.query || ''),
    String((state.admin as any)?.invoiceFilter?.status || 'all'),
    String((state.admin as any)?.selectedInvoice?.id || '')
  ], renderAdminInvoicesSection);

  const inquiriesSection = memoizeAdminSection('admin-inquiries', [
    getCollectionStamp(adminInquiries),
    String((state.admin as any)?.selectedInquiry?.id || ''),
    String((state.admin as any)?.inquiryFilter || 'all')
  ], renderAdminInquiriesSection);

  const categoriesSection = memoizeAdminSection('admin-categories', [
    getCollectionStamp(adminCategories),
    String(state.admin?.categoryForm?.id || ''),
    String(state.admin?.categoryForm?.title || '')
  ], renderAdminCategoriesSection);

  const designManagerSection = memoizeAdminSection('admin-design-manager', [
    getCollectionStamp(adminDesigns),
    String(state.admin?.designForm?.id || ''),
    String((state.admin as any)?.designEditOpen || false)
  ], renderAdminDesignManagerSection);

  const catalogSection = memoizeAdminSection('admin-catalog', [
    getCollectionStamp(adminCatalog),
    String((state.admin as any)?.catalogFilter || 'all'),
    String((state.admin as any)?.catalogSearch || ''),
    String((state.admin as any)?.catalogPreviewId || '')
  ], renderAdminCatalogSection);

  const packageSection = memoizeAdminSection('admin-packages', [
    String((state.admin as any)?.packageForm?.id || ''),
    String((state.admin as any)?.packageSelectedCategory || ''),
    String((state.admin as any)?.packageSelectedId || ''),
    String((state.admin as any)?.packageRefreshTick || 0)
  ], renderAdminPackageManagerSection);

  const calculatorSection = memoizeAdminSection('admin-calculator', [
    String((state.admin as any)?.calc?.activeTab || 'settings'),
    String((state.admin as any)?.calc?.selectedCategory || ''),
    String((state.admin as any)?.calc?.selectedQuality || ''),
    String((state.admin as any)?.calc?.selectedPackage || '')
  ], renderAdminCalculatorSection);

  const feedbackSection = memoizeAdminSection('admin-feedback', [
    getCollectionStamp(adminFeedbacks),
    String((state.admin as any)?.feedbackFilter || 'all')
  ], renderAdminFeedbackSection);

  const dislikeFeedbackSection = memoizeAdminSection('admin-dislike-feedback', [
    String((state.admin as any)?.dislikeFeedbackRefreshTick || 0)
  ], renderAdminDislikeFeedbackSection);

  const chatbotSection = memoizeAdminSection('admin-chatbot', [
    String(chatbotStats?.totalMessages || 0),
    String(chatbotStats?.lastUpdated || ''),
    String(chatbotSettings?.assistantName || ''),
    String(chatbotSettings?.enabled || false)
  ], renderAdminChatbotManagerSection);

  const announcementsSection = memoizeAdminSection('admin-announcements', [
    String((state.admin as any)?.announcementForm?.id || ''),
    String((state.admin as any)?.announcementRefreshTick || 0)
  ], renderAdminAnnouncementsSection);

  const themeSection = memoizeAdminSection('admin-theme', [
    String(state.theme?.darkMode || false),
    String(state.theme?.primaryColor || ''),
    String(state.theme?.accentColor || '')
  ], renderAdminThemeSection);

  const designStudioSection = memoizeAdminSection('admin-design-studio', [
    String(state.smartResult?.imageUrl || ''),
    String(state.smartResult?.variantCount || 0),
    String((state.admin as any)?.designStudioLoading || false)
  ], renderAdminDesignStudioSection);

  const servicesSection = memoizeAdminSection('admin-services', [
    getCollectionStamp(adminServices),
    String(state.admin?.serviceForm?.id || ''),
    String(state.admin?.serviceForm?.title || '')
  ], renderAdminServicesSection);

  const portfolioSection = memoizeAdminSection('admin-portfolio', [
    String(state.portfolioContent?.aboutTitle || ''),
    String(state.portfolioContent?.worksTitle || ''),
    String(state.portfolioContent?.updatedAt || ''),
    String((state.portfolioContent as any)?.feedbackVideos?.length || 0)
  ], renderAdminPortfolioSection);

  const luxuryEditorSection = memoizeAdminSection('admin-luxury', [
    String(state.showroomPropertyType || 'house'),
    String(state.selectedShowroomRoom || ''),
    String((state.admin as any)?.luxuryRefreshTick || 0)
  ], renderAdminLuxuryEditorSection);

  const showroomsSection = memoizeAdminSection('admin-showrooms', [
    getCollectionStamp(adminShowrooms),
    String(state.admin?.showroomForm?.id || ''),
    String(state.admin?.showroomForm?.name || '')
  ], renderAdminShowroomsSection);

  const showcasesSection = memoizeAdminSection('admin-showcases', [
    getCollectionStamp(adminShowcases),
    String(state.admin?.showcaseForm?.id || ''),
    String(state.admin?.showcaseForm?.title || ''),
    String((state.admin?.showcaseForm as any)?.relatedImages?.length || 0)
  ], renderAdminShowcaseSection);

  const customersSection = memoizeAdminSection('admin-customers', [
    getCollectionStamp(adminCustomers),
    String((state.admin as any)?.editingCustomerId || ''),
    String((state.admin as any)?.customerFilter || 'all'),
    String((state.admin as any)?.selectedCustomer?.id || ''),
    String((state.admin as any)?.viewingCustomerId || ''),
    String(Boolean((state.admin as any)?.showCustomerActivityDetails))
  ], renderAdminCustomersSection);

  return normalizeTemplateMarkup(`
    <div class="spidey-page">
        <section class="spidey-hero">
            <div class="spidey-hero-inner">
                <div class="spidey-kicker">Admin Control</div>
                <div class="spidey-title">Operations Hub</div>
                <div class="spidey-subtitle">Manage bookings, catalog, and experience settings in real time.</div>
            </div>
        </section>

        <section class="spidey-grid admin-grid admin-header-shell gap-3">
            <div class="spidey-panel p-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 class="text-3xl md:text-4xl font-display font-bold text-[color:var(--primary)]">Admin Dashboard</h1>
                        <p class="text-slate-500">Complete control over your interior design platform.</p>
                    </div>
                    <button data-action="toggle-dark-mode" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white text-sm font-semibold flex items-center gap-2">
                        <i class="ri-moon-line dark:hidden"></i>
                        <i class="ri-sun-line hidden dark:inline"></i>
                        <span>${state.theme.darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                </div>
            </div>
        </section>

      <section class="spidey-grid admin-grid admin-layout-shell">
      <div class="admin-dashboard-metrics">
        ${dashboardSection}
      </div>

      <div class="admin-masonry-layout admin-dashboard-sections">
        <div class="admin-masonry-item admin-masonry-item--half admin-masonry-item--announcements">${announcementsSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half admin-masonry-item--bookings">${bookingsSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half admin-masonry-item--invoices">${invoicesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${inquiriesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${feedbackSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${dislikeFeedbackSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${categoriesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${designManagerSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${catalogSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${packageSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${calculatorSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${servicesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half" id="admin-showrooms">${showroomsSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half" id="admin-showcases">${showcasesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--full">${portfolioSection}</div>
        <div class="admin-masonry-item admin-masonry-item--full">${luxuryEditorSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${designStudioSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${chatbotSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${themeSection}</div>
      </div>

      <div class="admin-customers-bottom">
        ${customersSection}
      </div>
      </section>

      ${renderAdminBookingDetailsModal()}
      ${renderAdminInquiryDetailsModal()}
      ${renderAdminCustomerDetailsModal()}

        ${renderAdminDesignEditor()}
        ${renderUploadModal()}
        ${renderCatalogPreviewModal()}
        ${renderCatalogActionDialog()}
    </div>
    `);
};

const getAdminChartMetrics = (sourceBookings?: any[] | null) => {
  const rawBookings = Array.isArray(sourceBookings) ? sourceBookings : getEffectiveBookings();
  const bookings = (() => {
    const seen = new Set<string>();
    return rawBookings
      .map((booking: any) => normalizeBookingRecord(booking))
      .filter((booking: any) => {
        const bookingId = String(booking?.id || '').trim();
        if (!bookingId) return true;
        if (seen.has(bookingId)) return false;
        seen.add(bookingId);
        return true;
      });
  })();
  const categories = state.customer.categories && state.customer.categories.length > 0 ? state.customer.categories : getCategories();
  const designs = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  const categoryTitleMap = new Map(categories.map((category) => [category.id, category.title || category.name || 'Unknown']));
  const categoryIdLookup = new Map<string, string>();
  const designCategoryById = new Map<string, string>();
  const designCategoryByName = new Map<string, string>();
  const designPriceById = new Map<string, number>();
  const designPriceByName = new Map<string, number>();

  categories.forEach((category) => {
    const categoryId = String(category.id || '').trim();
    const categoryTitle = String(category.title || category.name || '').trim();
    const strictKeys = getCategoryStrictKeySet(categoryId, categoryTitle);
    const matchKeys = getCategoryMatchKeySet(categoryId, categoryTitle);
    strictKeys.forEach((key) => {
      if (key) categoryIdLookup.set(key, categoryId);
    });
    matchKeys.forEach((key) => {
      if (key) categoryIdLookup.set(key, categoryId);
    });
  });

  designs.forEach((design: any) => {
    const designCategoryId = String(design?.categoryId || '').trim();
    const designId = String(design?.id || '').trim();
    const designName = String(design?.title || '').trim();
    const designPrice = parseAmountValue(design?.price) || parseAmountValue((design as any)?.cost);
    if (designId && designCategoryId) designCategoryById.set(designId, designCategoryId);
    if (designName && designCategoryId) designCategoryByName.set(normalizeKey(designName), designCategoryId);
    if (designId && designPrice > 0) designPriceById.set(designId, designPrice);
    if (designName && designPrice > 0) designPriceByName.set(normalizeKey(designName), designPrice);
  });

  const resolveCategoryId = (booking: any) => {
    const bookingCategoryRaw = String(booking?.categoryId || booking?.category || booking?.categoryName || '').trim();
    const bookingDesignId = String(booking?.designId || '').trim();
    const bookingDesignName = String(booking?.designName || '').trim();
    const portfolioCategoryRaw = String(resolvePortfolioCategoryId(booking) || '').trim();
    const designCategoryRaw = designCategoryById.get(bookingDesignId)
      || designCategoryByName.get(normalizeKey(bookingDesignName))
      || '';

    const candidateValues = [bookingCategoryRaw, designCategoryRaw, portfolioCategoryRaw].filter(Boolean);
    for (const candidate of candidateValues) {
      const strictKeys = getCategoryStrictKeySet(candidate);
      const matchKeys = getCategoryMatchKeySet(candidate);

      for (const key of strictKeys) {
        const resolved = categoryIdLookup.get(key);
        if (resolved) return resolved;
      }
      for (const key of matchKeys) {
        const resolved = categoryIdLookup.get(key);
        if (resolved) return resolved;
      }
    }

    return bookingCategoryRaw || designCategoryRaw || 'unknown';
  };

  const monthSeries = getRollingMonthSeries(12);
  const monthly = new Map<string, { label: string; revenue: number; expenses: number; bookings: number; customers: Set<string> }>(
    monthSeries.map((entry) => [entry.key, {
      label: entry.label,
      revenue: 0,
      expenses: 0,
      bookings: 0,
      customers: new Set<string>()
    }])
  );
  const categoryRevenue = new Map<string, number>();
  const categoryBookings = new Map<string, number>();
  const isRevenueRecognizedBooking = (booking: any) => {
    const paymentStatus = getBookingPaymentStatus(booking);
    if (paymentStatus === 'paid') return true;
    const bookingStatus = String(booking?.status || '').trim().toLowerCase();
    return bookingStatus === 'approved' || bookingStatus === 'confirmed' || bookingStatus === 'fulfilled';
  };

  bookings.forEach((booking: any) => {
    const created = normalizeHistoricalDate(booking.createdAt || booking.bookingDate || Date.now());
    if (!created) return;

    const key = `${created.getFullYear()}-${String(created.getMonth()).padStart(2, '0')}`;
    const isPaid = isRevenueRecognizedBooking(booking);
    const bookingDesignId = String(booking?.designId || '').trim();
    const bookingDesignName = String(booking?.designName || booking?.designTitle || '').trim();
    const inferredDesignPrice = (bookingDesignId ? Number(designPriceById.get(bookingDesignId) || 0) : 0)
      || (bookingDesignName ? Number(designPriceByName.get(normalizeKey(bookingDesignName)) || 0) : 0);
    const revenueAmount = parseAmountValue(booking?.price)
      || parseAmountValue(booking?.amount)
      || parseAmountValue(booking?.cost)
      || inferredDesignPrice;
    const expenseAmount = parseAmountValue(booking?.cost)
      || (revenueAmount > 0 ? revenueAmount * 0.62 : 0);
    const amount = isPaid ? revenueAmount : 0;
    const expense = isPaid ? expenseAmount : 0;
    const customerId = String(booking.userId || booking.customerId || booking.email || booking.id || 'unknown');

    if (!monthly.has(key)) return;
    const entry = monthly.get(key)!;
    entry.bookings += 1;
    entry.customers.add(customerId);
    entry.revenue += amount;
    entry.expenses += expense;

    const status = String(booking.status || '').toLowerCase();
    if (status !== 'cancelled' && amount > 0) {
      const categoryId = resolveCategoryId(booking);
      if (!categoryId || categoryId === 'unknown') return;
      categoryRevenue.set(categoryId, (categoryRevenue.get(categoryId) || 0) + amount);
    }

    const categoryIdForCount = resolveCategoryId(booking);
    if (categoryIdForCount && categoryIdForCount !== 'unknown') {
      categoryBookings.set(categoryIdForCount, (categoryBookings.get(categoryIdForCount) || 0) + 1);
    }
  });

  const sortedMonths = Array.from(monthly.entries()).sort(([a], [b]) => a.localeCompare(b));

  const profitLoss = sortedMonths.map(([, entry]) => ({
    month: entry.label,
    revenue: Number(entry.revenue.toFixed(2)),
    expenses: Number(entry.expenses.toFixed(2)),
    profit: Number((entry.revenue - entry.expenses).toFixed(2))
  }));

  const customerBookings = sortedMonths.map(([, entry]) => ({
    month: entry.label,
    bookings: entry.bookings,
    customers: entry.customers.size
  }));

  const categoryEarnings = categories.map((category) => ({
    categoryId: category.id,
    categoryTitle: category.title || category.name || 'Unknown',
    earnings: Number((categoryRevenue.get(category.id) || 0).toFixed(2)),
    bookings: Number(categoryBookings.get(category.id) || 0)
  }));

  const categorySeedSeries = getPortfolioSampleCategorySeries();
  categorySeedSeries.forEach((seed: any) => {
    const seedCategoryId = String(seed?.id || '').trim();
    if (!seedCategoryId) return;
    if (categoryEarnings.some((item) => String(item.categoryId || '').trim() === seedCategoryId)) return;
    categoryEarnings.push({
      categoryId: seedCategoryId,
      categoryTitle: String(seed?.name || seed?.label || seedCategoryId).trim(),
      earnings: Number((categoryRevenue.get(seedCategoryId) || 0).toFixed(2)),
      bookings: Number(categoryBookings.get(seedCategoryId) || 0)
    });
  });

  const existingCategoryIds = new Set(categoryEarnings.map((item) => item.categoryId));
  categoryRevenue.forEach((earnings, categoryId) => {
    if (!categoryId || categoryId === 'unknown') return;
    if (existingCategoryIds.has(categoryId)) return;
    categoryEarnings.push({
      categoryId,
      categoryTitle: categoryTitleMap.get(categoryId) || categoryId,
      earnings: Number(earnings.toFixed(2)),
      bookings: Number(categoryBookings.get(categoryId) || 0)
    });
  });

  return { profitLoss, categoryEarnings, customerBookings };
};

const updateAdminCharts = () => {
  const hasAnyChartInstance = Boolean(charts.revenue || charts.profit || charts.category || charts.bookings);
  const hasDetachedChartCanvas = [charts.revenue, charts.profit, charts.category, charts.bookings]
    .filter(Boolean)
    .some((chart: any) => chart?.canvas && !chart.canvas.isConnected);

  if (hasAnyChartInstance && hasDetachedChartCanvas) {
    // Dashboard re-render can replace canvas nodes; rebuild charts against current DOM.
    triggerAdminChartsInit();
    return;
  }

  const { profitLoss, categoryEarnings, customerBookings } = getAdminChartMetrics();
  const theme = getAdminChartTheme();

  // Update charts with new data
  if (charts.revenue) {
    charts.revenue.data.labels = profitLoss.map((p) => p.month);
    charts.revenue.data.datasets[0].data = profitLoss.map((p) => p.revenue);
    charts.revenue.data.datasets[1].data = profitLoss.map((p) => p.expenses);
    (charts.revenue.data.datasets[0] as any).borderColor = COLORS.gold;
    (charts.revenue.data.datasets[0] as any).backgroundColor = theme.revenueFill;
    (charts.revenue.data.datasets[0] as any).pointBackgroundColor = COLORS.gold;
    (charts.revenue.data.datasets[1] as any).borderColor = '#f97316';
    (charts.revenue.data.datasets[1] as any).backgroundColor = theme.expensesFill;
    (charts.revenue.data.datasets[1] as any).pointBackgroundColor = '#f97316';
    if (charts.revenue.options?.scales?.y) {
      (charts.revenue.options.scales.y as any).beginAtZero = true;
      (charts.revenue.options.scales.y as any).suggestedMax = Math.max(...profitLoss.map((p) => Math.max(p.revenue, p.expenses)), 1000);
    }
    charts.revenue.update();
  }

  if (charts.profit) {
    charts.profit.data.labels = profitLoss.map((p) => p.month);
    charts.profit.data.datasets[0].data = profitLoss.map((p) => p.profit);
    charts.profit.update();
  }

  if (charts.category) {
    const { labels, data, hasCategoryValues } = getAdminCategoryChartPayload(categoryEarnings);
    const colors = hasCategoryValues ? getCategoryChartColors(labels.length) : ['#cbd5e1'];
    const categoryDataset = charts.category.data.datasets[0] as any;
    charts.category.data.labels = labels;
    categoryDataset.data = data;
    categoryDataset.backgroundColor = colors;
    categoryDataset.borderColor = theme.borderColor;
    charts.category.update();
  }

  if (charts.bookings) {
    charts.bookings.data.labels = customerBookings.map((item) => item.month);
    charts.bookings.data.datasets[0].data = customerBookings.map((item) => item.bookings);
    charts.bookings.data.datasets[1].data = customerBookings.map((item) => item.customers);
    (charts.bookings.data.datasets[0] as any).backgroundColor = theme.bookingsPrimary;
    (charts.bookings.data.datasets[1] as any).backgroundColor = theme.bookingsSecondary;
    charts.bookings.update();
  }

  console.log('✅ Charts updated with latest data');
};

const stopAdminChartsAutoRefresh = () => {
  if (adminChartsAutoRefreshId == null) return;
  window.clearInterval(adminChartsAutoRefreshId);
  adminChartsAutoRefreshId = null;
  if (adminChartsVisibilityBound) {
    document.removeEventListener('visibilitychange', handleAdminChartsVisibilityChange);
    adminChartsVisibilityBound = false;
  }
};

const handleAdminChartsVisibilityChange = () => {
  if (!(state.activeTab === 'admin' && state.currentUser?.role === 'admin')) {
    stopAdminChartsAutoRefresh();
    return;
  }

  if (!document.hidden && !adminChartsRefreshInFlight && !isAdminInteractionWarm()) {
    adminChartsRefreshInFlight = true;
    const beforeSignature = getAdminRefreshRenderSignature();
    void refreshAdminData({ silent: true })
      .finally(() => {
        updateAdminCharts();
        const afterSignature = getAdminRefreshRenderSignature();
        if (state.activeTab === 'admin' && state.currentUser?.role === 'admin' && afterSignature !== beforeSignature) {
          adminLastRefreshRenderSignature = afterSignature;
          renderStabilized();
        }
      })
      .finally(() => {
        adminChartsRefreshInFlight = false;
      });
  }
};

const startAdminChartsAutoRefresh = () => {
  if (adminChartsAutoRefreshId != null) return;
  if (!adminChartsVisibilityBound) {
    document.addEventListener('visibilitychange', handleAdminChartsVisibilityChange);
    adminChartsVisibilityBound = true;
  }
  adminChartsAutoRefreshId = window.setInterval(() => {
    if (!(state.activeTab === 'admin' && state.currentUser?.role === 'admin')) {
      stopAdminChartsAutoRefresh();
      return;
    }
    if (document.hidden) return;
    if (state.videoModalOpen) return;
    if (adminChartsRefreshInFlight) return;
    if (isAdminInteractionWarm()) return;

    // Prevent auto-refresh if user is typing to avoid focus loss
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

    adminChartsRefreshInFlight = true;
    const beforeSignature = getAdminRefreshRenderSignature();
    void refreshAdminData({ silent: true })
      .finally(() => {
        updateAdminCharts();
        const afterSignature = getAdminRefreshRenderSignature();
        if (state.activeTab === 'admin' && state.currentUser?.role === 'admin' && afterSignature !== beforeSignature) {
          adminLastRefreshRenderSignature = afterSignature;
          renderStabilized();
        }
      })
      .finally(() => {
        adminChartsRefreshInFlight = false;
      });
  }, ADMIN_CHARTS_AUTO_REFRESH_MS);
};

const initAdminCharts = async () => {
  try {
    const Chart = await loadAdminChartConstructor();
    const theme = getAdminChartTheme();

    charts.revenue?.destroy();
    charts.profit?.destroy();
    charts.category?.destroy();
    charts.bookings?.destroy();
    charts.revenue = undefined;
    charts.profit = undefined;
    charts.category = undefined;
    charts.bookings = undefined;

    const revenueCanvas = document.getElementById('revenue-chart') as HTMLCanvasElement | null;
    const profitCanvas = document.getElementById('profit-chart') as HTMLCanvasElement | null;
    const categoryCanvas = document.getElementById('category-chart') as HTMLCanvasElement | null;
    const bookingsCanvas = document.getElementById('bookings-chart') as HTMLCanvasElement | null;

    const { profitLoss, categoryEarnings, customerBookings } = getAdminChartMetrics();

    if (revenueCanvas) {
      charts.revenue = new Chart(revenueCanvas, {
        type: 'line',
        data: {
          labels: profitLoss.map((p) => p.month),
          datasets: [
            {
              label: 'Revenue',
              data: profitLoss.map((p) => p.revenue),
              borderColor: COLORS.gold,
              backgroundColor: theme.revenueFill,
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: COLORS.gold,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              spanGaps: true
            },
            {
              label: 'Expenses',
              data: profitLoss.map((p) => p.expenses),
              borderColor: '#f97316',
              backgroundColor: theme.expensesFill,
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: '#f97316',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              spanGaps: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              labels: {
                color: theme.textColor
              }
            }
          },
          scales: {
            x: {
              ticks: { color: theme.mutedTextColor },
              grid: { color: theme.gridColor }
            },
            y: {
              beginAtZero: true,
              suggestedMax: Math.max(...profitLoss.map((p) => Math.max(p.revenue, p.expenses)), 1000),
              ticks: { color: theme.mutedTextColor },
              grid: { color: theme.gridColor }
            }
          }
        }
      });
    }

    if (profitCanvas) {
      charts.profit = new Chart(profitCanvas, {
        type: 'bar',
        data: {
          labels: profitLoss.map((p) => p.month),
          datasets: [{ label: 'Profit', data: profitLoss.map((p) => p.profit), backgroundColor: COLORS.gold }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: theme.textColor
              }
            }
          },
          scales: {
            x: {
              ticks: { color: theme.mutedTextColor },
              grid: { color: theme.gridColor }
            },
            y: {
              ticks: { color: theme.mutedTextColor },
              grid: { color: theme.gridColor }
            }
          }
        }
      });
    }

    if (categoryCanvas) {
      const { labels, data, hasCategoryValues } = getAdminCategoryChartPayload(categoryEarnings);
      const colors = hasCategoryValues ? getCategoryChartColors(labels.length) : [theme.emptyCategory];
      charts.category = new Chart(categoryCanvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data, backgroundColor: colors, borderColor: theme.borderColor, borderWidth: 1 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: theme.textColor
              }
            }
          }
        }
      });
    }

    if (bookingsCanvas) {
      charts.bookings = new Chart(bookingsCanvas, {
        type: 'bar',
        data: {
          labels: customerBookings.map((item) => item.month),
          datasets: [
            { label: 'Booked Designs', data: customerBookings.map((item) => item.bookings), backgroundColor: theme.bookingsPrimary },
            { label: 'Customers', data: customerBookings.map((item) => item.customers), backgroundColor: theme.bookingsSecondary }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: theme.textColor
              }
            }
          },
          scales: {
            x: {
              ticks: { color: theme.mutedTextColor },
              grid: { color: theme.gridColor }
            },
            y: {
              ticks: { color: theme.mutedTextColor },
              grid: { color: theme.gridColor }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("Failed to initialize admin charts:", error);
    // Keep trying in case the canvas or Chart module becomes available slightly later.
    scheduleAdminChartsRetry();
  }
};

const triggerAdminChartsInit = () => {
  if (adminChartsInitInFlight) return;
  adminChartsInitInFlight = true;
  void initAdminCharts().finally(() => {
    adminChartsInitInFlight = false;
  });
};

const initAdminChartsWhenVisible = () => {
  const canvases = [
    document.getElementById('revenue-chart') as HTMLCanvasElement | null,
    document.getElementById('profit-chart') as HTMLCanvasElement | null,
    document.getElementById('category-chart') as HTMLCanvasElement | null,
    document.getElementById('bookings-chart') as HTMLCanvasElement | null
  ].filter(Boolean) as HTMLCanvasElement[];

  if (canvases.length === 0) return;
  const hasDetachedChartCanvas = [charts.revenue, charts.profit, charts.category, charts.bookings]
    .filter(Boolean)
    .some((chart: any) => chart?.canvas && !chart.canvas.isConnected);

  if (hasDetachedChartCanvas) {
    triggerAdminChartsInit();
    return;
  }

  // Initialize once; after that, only push fresh data to existing chart instances.
  if (!charts.revenue && !charts.profit && !charts.category && !charts.bookings) {
    triggerAdminChartsInit();
    return;
  }
  updateAdminCharts();
};

const scheduleAdminChartsRetry = () => {
  if (!(state.activeTab === 'admin' && state.currentUser?.role === 'admin')) return;
  if (adminChartsRetryTimer != null) {
    window.clearTimeout(adminChartsRetryTimer);
  }
  adminChartsRetryTimer = window.setTimeout(() => {
    adminChartsRetryTimer = null;
    const hasCanvases = Boolean(
      document.getElementById('revenue-chart')
      || document.getElementById('profit-chart')
      || document.getElementById('category-chart')
      || document.getElementById('bookings-chart')
    );
    if (!hasCanvases) return;
    const hasDetachedChartCanvas = [charts.revenue, charts.profit, charts.category, charts.bookings]
      .filter(Boolean)
      .some((chart: any) => chart?.canvas && !chart.canvas.isConnected);

    if (!charts.revenue && !charts.profit && !charts.category && !charts.bookings) {
      triggerAdminChartsInit();
    } else if (hasDetachedChartCanvas) {
      triggerAdminChartsInit();
    } else {
      updateAdminCharts();
    }
  }, 350);
};


// --- Frontend event layer ----------------------------------------------------
root.addEventListener('dblclick', (event) => {
  const target = event.target as HTMLElement;
  const actionEl = target.closest('[data-action]') as HTMLElement | null;
  const action = actionEl?.getAttribute('data-action');

  if (!action || !actionEl) return;

  if (action === 'calc-set-category') {
    // Deselect
    state.calculator.category = '';
    state.calculator.result = null;
    render();
  } else if (action === 'calc-set-shape') {
    // Deselect
    state.calculator.shape = '';
    state.calculator.result = null;
    render();
  }

});

// --- Event action controller (contains admin/customer/login business logic) --
root.addEventListener('click', async (event) => {


  const target = event.target as HTMLElement;
  const summaryFilterButton = target.closest('button[data-action="set-booking-summary-filter"]') as HTMLButtonElement | null;
  if (summaryFilterButton) {
    const selected = String(summaryFilterButton.getAttribute('data-value') || 'all');
    if (selected === 'paid' || selected === 'pending' || selected === 'failed') {
      state.admin.bookingFilter.paymentStatus = selected as AdminState['bookingFilter']['paymentStatus'];
      state.admin.bookingFilter.approvalStatus = 'all';
    } else if (selected === 'approved') {
      state.admin.bookingFilter.paymentStatus = 'all';
      state.admin.bookingFilter.approvalStatus = 'approved';
    } else {
      state.admin.bookingFilter.paymentStatus = 'all';
      state.admin.bookingFilter.approvalStatus = 'all';
    }
    render();
    return;
  }
  const actionEl = target.closest('[data-action]') as HTMLElement | null;

  const action = actionEl?.getAttribute('data-action');
  if (!action || !actionEl) return;

  if (state.activeTab === 'admin') {
    const isAdminHeavyAction = action.startsWith('admin-')
      || action.startsWith('edit-')
      || action === 'open-upload'
      || action === 'open-design-editor'
      || action === 'view-booking'
      || action === 'view-customer';
    if (isAdminHeavyAction) {
      markAdminInteraction();
    }
  }

  // Fix: Categories navigation
  if (action === 'nav' && actionEl.getAttribute('data-tab') === 'categories') {
    event.preventDefault();
    navigateTo('categories');
    return;
  }

  // Forms that use data-action should only run on explicit submit clicks.
  // This prevents clicks on file inputs/text fields from triggering form actions.
  if (actionEl.tagName === 'FORM') {
    const submitter = target.closest('button, input') as HTMLButtonElement | HTMLInputElement | null;
    if (!submitter) return;

    const submitType = (submitter.getAttribute('type') || '').toLowerCase();
    const isImplicitSubmitButton = submitter.tagName === 'BUTTON' && submitType === '';
    const isSubmit = submitType === 'submit' || isImplicitSubmitButton;
    if (!isSubmit) return;
  }

  const button = actionEl; // primary button reference for action handlers
  const actionStartedAt = perfNow();
  try {
  switch (action) {
    case 'open-calculator': {
      state.calculator.isOpen = true;
      state.calculator.result = null;
      render();
      break;
    }
    case 'close-calculator': {
      state.calculator.isOpen = false;
      render();
      break;
    }
    case 'calc-set-category': {
      state.calculator.category = button.getAttribute('data-value') || 'Full Home';
      state.calculator.result = null;
      render();
      break;
    }
    case 'calc-select-design': {
      state.calculator.selectedDesignId = button.getAttribute('data-value');
      render();
      break;
    }
    case 'calc-set-shape': {
      state.calculator.shape = button.getAttribute('data-value') || 'Rectangle';
      state.calculator.result = null;
      render();
      break;
    }
    case 'calc-set-bhk': {
      state.calculator.bhk = Number(button.getAttribute('data-value') || 1);
      state.calculator.result = null;
      render();
      break;
    }
    case 'upload-customer-profile-photo': {
      // File upload is handled in the change listener.
      break;
    }
    case 'calc-set-quality': {
      state.calculator.quality = button.getAttribute('data-value') || 'economy';
      state.calculator.result = null;
      render();
      break;
    }
    case 'run-calculation': {
      calculatePrice();
      break;
    }
    case 'admin-calc-tab': {
      state.admin.calculatorTab = button.getAttribute('data-value') as any;
      render();
      break;
    }
    case 'add-calc-image-row': {
      const current = getAdminImageLibrary().slice();
      current.unshift({
        id: `calc-lib-custom-${Date.now()}`,
        category: 'villa',
        quality: 'economy',
        bhk: null,
        homeType: '',
        title: 'New Image',
        description: 'Add a category-specific image',
        image: '',
        active: true,
        order: 0
      });
      (state.admin as any).calculatorImageLibrary = current;
      render();
      break;
    }
    case 'remove-calc-image-row': {
      const id = button.getAttribute('data-id') || '';
      const current = getAdminImageLibrary().filter((item: any) => String(item?.id || '') !== id);
      (state.admin as any).calculatorImageLibrary = current;
      render();
      break;
    }
    case 'save-calculator-settings': {
      if (state.admin.calculatorForm) {
        // Collect all multipliers from inputs to be safe
        const baseSqftRate = Number((root.querySelector('[data-admin-calc="baseSqftRate"]') as HTMLInputElement)?.value || state.admin.calculatorForm.baseSqftRate);
        
        const categoryMultipliers: Record<string, number> = {};
        root.querySelectorAll('[data-admin-calc-category]').forEach(el => {
          const input = el as HTMLInputElement;
          categoryMultipliers[input.getAttribute('data-admin-calc-category')!] = Number(input.value);
        });

        const shapeMultipliers: any = {};
        root.querySelectorAll('[data-admin-calc-shape]').forEach(el => {
          const input = el as HTMLInputElement;
          shapeMultipliers[input.getAttribute('data-admin-calc-shape')!] = Number(input.value);
        });

        const qualityMultipliers: any = {};
        root.querySelectorAll('[data-admin-calc-quality]').forEach(el => {
          const input = el as HTMLInputElement;
          qualityMultipliers[input.getAttribute('data-admin-calc-quality')!] = Number(input.value);
        });

        const updatedSettings: CalculatorSettings = {
          baseSqftRate,
          categoryMultipliers,
          shapeMultipliers,
          qualityMultipliers
        };

        const libraryRows = Array.from(root.querySelectorAll('[data-admin-calc-image-row]')) as HTMLElement[];
        const nextLibrary: any[] = [];
        for (let idx = 0; idx < libraryRows.length; idx += 1) {
          const row = libraryRows[idx];
          const id = row.getAttribute('data-id') || `calc-lib-row-${Date.now()}-${idx}`;
          const categoryInput = row.querySelector('[data-admin-calc-img="category"]') as HTMLInputElement | null;
          const qualityInput = row.querySelector('[data-admin-calc-img="quality"]') as HTMLSelectElement | null;
          const bhkInput = row.querySelector('[data-admin-calc-img="bhk"]') as HTMLInputElement | null;
          const homeTypeInput = row.querySelector('[data-admin-calc-img="homeType"]') as HTMLSelectElement | null;
          const titleInput = row.querySelector('[data-admin-calc-img="title"]') as HTMLInputElement | null;
          const descriptionInput = row.querySelector('[data-admin-calc-img="description"]') as HTMLInputElement | null;
          const imageInput = row.querySelector('[data-admin-calc-img="image"]') as HTMLInputElement | null;
          const activeInput = row.querySelector('[data-admin-calc-img="active"]') as HTMLInputElement | null;
          const fileInput = row.querySelector('[data-admin-calc-img-file]') as HTMLInputElement | null;

          let imageValue = normalizeAssetUrl(String(imageInput?.value || '').trim());
          if (fileInput?.files && fileInput.files.length > 0) {
            imageValue = await fileToDataUrl(fileInput.files[0]);
          }

          const category = String(categoryInput?.value || '').trim();
          const title = String(titleInput?.value || '').trim();
          if (!category || !title || !imageValue) continue;

          const bhkRaw = String(bhkInput?.value || '').trim();
          const bhkNum = bhkRaw ? Number(bhkRaw) : null;
          nextLibrary.push({
            id,
            category,
            quality: String(qualityInput?.value || 'economy').toLowerCase(),
            bhk: Number.isFinite(Number(bhkNum)) ? Number(bhkNum) : null,
            homeType: String(homeTypeInput?.value || '').trim() || null,
            title,
            description: String(descriptionInput?.value || '').trim(),
            image: imageValue,
            active: activeInput?.checked !== false,
            order: idx
          });
        }

        const finalLibrary = nextLibrary.length > 0
          ? nextLibrary
          : getAdminImageLibrary();

        writeCalculatorSettings(updatedSettings);
        writeCalculatorImageLibrary(finalLibrary);
        state.admin.calculatorSettings = updatedSettings;
        state.admin.calculatorForm = { ...updatedSettings };
        (state.admin as any).calculatorImageLibrary = finalLibrary;
        state.calculator.settings = { ...updatedSettings };
        state.confirmMessage = 'Calculator settings and image library saved successfully.';
        render();
      }
      break;
    }
    case 'close-video': {
      state.videoModalOpen = false;
      state.currentVideos = [];
      state.currentVideoUrl = '';
      render();
      break;
    }
    case 'close-video-modal': {
      state.videoModalOpen = false;
      state.currentVideos = [];
      state.currentVideoUrl = '';
      render();
      break;
    }
    case 'play-video': {
      const videoUrl = button.getAttribute('data-video-url');
      const videoTitle = button.getAttribute('data-video-title') || 'Video';
      if (videoUrl) {
        const normalizedVideoUrl = resolvePlayableVideoUrl(videoUrl);
        state.currentVideos = [{ url: normalizedVideoUrl, title: videoTitle }];
        state.currentVideoUrl = toYouTubeEmbedUrl(normalizedVideoUrl, true);
        state.videoModalOpen = true;
        render();
      }
      break;
    }
    case 'service-details': {
      const serviceId = button.getAttribute('data-service-id');
      if (!serviceId) return;
      const service = state.services.find((item) => item.id === serviceId);
      if (!service) return;
      (state.customer as any).serviceDetails = service;
      render();
      break;
    }
    case 'open-service-showcase-details': {
      const showcaseId = button.getAttribute('data-showcase-id') || '';
      const showcase = showcaseId
        ? state.serviceShowcases.find((item: any) => String(item.id || '') === showcaseId)
        : null;
      (state.customer as any).serviceShowcaseDetails = showcase
        ? normalizeShowcaseRecord(showcase)
        : {
          title: button.getAttribute('data-showcase-title') || 'Service',
          price: button.getAttribute('data-showcase-price') || '',
          style: button.getAttribute('data-showcase-style') || '',
          description: button.getAttribute('data-showcase-description') || '',
          image: button.getAttribute('data-showcase-image') || '',
          serviceId: '',
          relatedImages: []
        };
      render();
      break;
    }
    case 'close-service-details': {
      (state.customer as any).serviceDetails = null;
      render();
      break;
    }
    case 'close-service-showcase-details': {
      (state.customer as any).serviceShowcaseDetails = null;
      render();
      break;
    }
    case 'nav': {
      event.preventDefault();
      const tab = button.getAttribute('data-tab') as TabKey | null;
      console.log('Navigation clicked:', tab);
      if (tab) {
        state.calculator.isOpen = false; // Close calculator if open
        const categoryId = button.getAttribute('data-category') || '';
        if (categoryId) {
          state.customer.activeCategory = categoryId;
          state.customer.galleryCategoryId = categoryId;
          applyCategoryBackground(categoryId);
        }
        navigateTo(tab);
      }
      break;
    }
    case 'toggle-menu':
      state.mobileMenuOpen = !state.mobileMenuOpen;
      render();
      break;
    case 'ai-generate': {
      if (!state.smartStudio.originalImage || state.smartStudio.isGenerating) return;
      state.smartStudio.isGenerating = true;
      state.smartStudio.error = '';
      render();

      (async () => {
        try {
          // Map Design Studio room types to category folder names
          const roomToCategoryMap: Record<string, string> = {
            'bedroom': 'Kids-bedroom',
            'masterbedroom': 'Master Bedroom',
            'kids': 'Kids-bedroom',
            'kitchen': 'Kitchen',
            'living': 'Living room',
            'dining': 'Diningroom',
            'bathroom': 'Bathroom',
            'garden': 'Garden',
            'gym': 'Gym',
            'office': 'Office interior',
            'terrace': 'Terrace',
            'pooja': 'Pooja room'
          };

          const categoryName = roomToCategoryMap[state.smartStudio.room] || 'Generic';
          console.log(`[Design Studio] Selected room: ${state.smartStudio.room} -> Category: ${categoryName} `);

          // Fetch images from the selected category
          const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`);
          if (!response.ok) throw new Error('Failed to fetch category images');

          const categoryData = await response.json();
          const images = categoryData.images || [];
          console.log(`[Design Studio] Fetched ${images.length} images for ${categoryName}`);

          if (images.length === 0) {
            throw new Error(`No designs found for ${categoryName}`);
          }

          // Price ranges based on room type
          const priceRanges: Record<string, [number, number]> = {
            'Kids-bedroom': [85000, 150000],
            'Master Bedroom': [120000, 250000],
            'Kitchen': [150000, 350000],
            'Living room': [100000, 200000],
            'Diningroom': [80000, 150000],
            'Bathroom': [60000, 120000],
            'Garden': [50000, 150000],
            'Gym': [100000, 200000],
            'Office interior': [90000, 180000],
            'Terrace': [60000, 140000],
            'Pooja room': [40000, 100000]
          };

          const [minPrice, maxPrice] = priceRanges[categoryName] || [80000, 150000];

          // Take up to 8 images and format them as variants
          const variants = images.slice(0, 8).map((imageObj: any, index: number) => {
            // Generate random price within range
            const price = Math.floor(minPrice + Math.random() * (maxPrice - minPrice));
            return {
              image: imageObj.url,
              title: imageObj.name || `${categoryName} Design ${index + 1} `,
              styleTag: state.smartStudio.prompt || 'Modern',
              description: `Professional ${categoryName.toLowerCase()} design concept inspired by your uploaded photo.${state.smartStudio.prompt ? `Style: ${state.smartStudio.prompt}` : ''} `,
              price: price,
              categoryName: categoryName,
              designId: `ai - studio - ${categoryName.toLowerCase().replace(/\s+/g, '-')} -${index + 1} `
            };
          });

          state.smartStudio.variants = variants;
        } catch (error) {
          state.smartStudio.error = error instanceof Error ? error.message : 'Generation failed.';
        } finally {
          state.smartStudio.isGenerating = false;
          render();
        }
      })();
      break;
    }
    case 'ai-save': {
      if (!state.smartStudio.originalImage || state.smartStudio.variants.length === 0) return;
      if (!state.currentUser) {
        alert('Please login to save designs to your dashboard.');
        navigateTo('login');
        return;
      }
      state.smartStudio.error = '';
      (async () => {
        try {
          const resp = await apiFetch('/ai/designs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({
              originalImage: state.smartStudio.originalImage,
              prompt: state.smartStudio.prompt,
              variants: state.smartStudio.variants
            })
          });
          const data = await resp.json().catch(() => ({} as any));
          if (!resp.ok) throw new Error(data?.message || 'Failed to save designs');

          if (data?.design) {
            const existing = Array.isArray(state.customer.aiDesigns) ? state.customer.aiDesigns : [];
            state.customer.aiDesigns = [data.design, ...existing].filter((entry: any, index: number, list: any[]) => {
              const id = String(entry?.id || '');
              if (!id) return true;
              return list.findIndex((item: any) => String(item?.id || '') === id) === index;
            });
          }

          alert('✅ Design concepts saved to your dashboard! You can view them in the Customer Dashboard.');
          if (state.currentUser?.role === 'admin') {
            await Promise.all([refreshCustomerData(), refreshAdminData()]);
          } else {
            await refreshCustomerData();
          }
          navigateTo('dashboard');
          render();
        } catch (error) {
          state.smartStudio.error = error instanceof Error ? error.message : 'Save failed.';
          render();
        }
      })();
      break;
    }

    case 'ai-reset': {
      const currentRoom = state.smartStudio.room; // Preserve room selection
      state.smartStudio = {
        prompt: '',
        originalImage: null,
        variants: [],
        isGenerating: false,
        error: '',
        room: currentRoom // Keep the selected room type
      };
      // Clear the file input
      const fileInput = document.getElementById('aiImageInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      render();
      break;
    }
    case 'ai-studio-view-detail': {
      const id = button.getAttribute('data-id');
      if (!id) return;
      const record = state.customer.aiDesigns.find(r => r.id === id);
      if (!record) return;

      // Pre-load the AI Studio with the saved record
      state.smartStudio.originalImage = record.originalImage;
      state.smartStudio.variants = record.variants;
      state.smartStudio.prompt = (record as any).prompt || '';
      state.smartStudio.error = '';

      // Navigate to AI Studio
      navigateTo('ai-studio');
      render();
      break;
    }

    case 'ai-request-quote': {
      const id = button.getAttribute('data-ai-id');
      if (!id) return;
      (async () => {
        try {
          const resp = await apiFetch(`/ai/designs/${encodeURIComponent(id)}/request-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
          });
          if (!resp.ok) throw new Error('Failed to request quote');
          await refreshCustomerData();
        } catch (error) {
          state.smartStudio.error = error instanceof Error ? error.message : 'Quote request failed.';
        }
        render();
      })();
      break;
    }
    case 'admin-quote-ai': {
      const id = button.getAttribute('data-ai-id');
      let amount = button.getAttribute('data-quote-amount');
      if (!id) return;
      if (!amount) {
        const input = prompt('Enter quote amount (INR):');
        if (!input) return;
        amount = input;
      }
      (async () => {
        try {
          const resp = await apiFetch(`/ai/designs/${encodeURIComponent(id)}/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ quoteAmount: Number(amount) })
          });
          if (!resp.ok) throw new Error('Failed to update quote');
          await refreshAdminData();
          await refreshCustomerData();
        } catch (error) {
          console.warn('Quote update failed:', error);
        }
        render();
      })();
      break;
    }
    case 'logout':
      state.currentUser = null;
      syncCustomerPackagePreferences(null);
      persistState();
      navigateTo('home');
      break;
    case 'toggle-signup':
      state.loginForm.isSignup = !state.loginForm.isSignup;
      state.loginForm.password = '';
      state.loginForm.showPassword = false;
      state.loginForm.showConfirmPassword = false;
      state.loginForm.twoFactorChallengeId = '';
      state.loginForm.twoFactorCode = '';
      state.loginForm.twoFactorMessage = '';
      state.loginForm.twoFactorDeliveryMethod = '';
      state.loginForm.twoFactorDeliveredTo = '';
      state.loginForm.twoFactorDebugCode = '';
      state.loginError = '';
      render();
      break;
    case 'cancel-two-factor':
      state.loginForm.twoFactorChallengeId = '';
      state.loginForm.twoFactorCode = '';
      state.loginForm.twoFactorMessage = '';
      state.loginForm.twoFactorDeliveryMethod = '';
      state.loginForm.twoFactorDeliveredTo = '';
      state.loginForm.twoFactorDebugCode = '';
      state.loginError = '';
      render();
      break;
    case 'toggle-password':
      state.loginForm.showPassword = !state.loginForm.showPassword;
      render();
      break;
    case 'toggle-confirm-password':
      state.loginForm.showConfirmPassword = !state.loginForm.showConfirmPassword;
      render();
      break;
    case 'set-room': {
      const room = button.getAttribute('data-room') as RoomType | 'All';
      state.roomFilter = room;
      render();
      break;
    }
    case 'set-gallery-category': {
      const categoryId = button.getAttribute('data-category') || 'all';
      state.customer.galleryCategoryId = categoryId;
      applyCategoryBackground(categoryId);
      const candidates = getGalleryDesignCandidates(categoryId).filter((design) => {
        if (!(design as DesignModel & { isDeleted?: boolean }).isDeleted) {
          return designMatchesCategory(design, getCategoryKeySet(categoryId, state.customer.categories || []));
        }
        return false;
      });
      state.selectedModelId = candidates[0]?.id || null;
      render();
      break;
    }
    case 'set-portfolio-category': {
      const categoryId = button.getAttribute('data-category') || 'all';
      state.customer.portfolioCategoryId = categoryId;
      render();
      break;
    }
    case 'set-portfolio-filter': {
      const filter = (button.getAttribute('data-filter') || 'all') as CustomerState['portfolioFilter'];
      state.customer.portfolioFilter = filter;
      render();
      break;
    }

    case 'add-portfolio-designer': {
      state.portfolioContent.designers = [
        ...(state.portfolioContent.designers || []),
        { name: 'New Designer', role: 'Role', famousDesign: '', bio: '', photo: '' }
      ];
      render();
      break;
    }
    case 'remove-portfolio-designer': {
      const index = Number(button.getAttribute('data-index') || -1);
      if (index >= 0) {
        state.portfolioContent.designers = state.portfolioContent.designers.filter((_, i) => i !== index);
        render();
      }
      break;
    }
    case 'add-portfolio-milestone': {
      const currentJourney = (state.portfolioContent as any).journey || { title: 'Our Journey', intro: '', milestones: [] };
      const milestones = Array.isArray(currentJourney.milestones) ? currentJourney.milestones : [];
      (state.portfolioContent as any).journey = {
        ...currentJourney,
        milestones: [
          ...milestones,
          { year: String(new Date().getFullYear()), title: 'New Milestone', description: '' }
        ]
      };
      render();
      break;
    }
    case 'remove-portfolio-milestone': {
      const index = Number(button.getAttribute('data-index') || -1);
      const currentJourney = (state.portfolioContent as any).journey || { title: 'Our Journey', intro: '', milestones: [] };
      const milestones = Array.isArray(currentJourney.milestones) ? currentJourney.milestones : [];
      if (index >= 0) {
        (state.portfolioContent as any).journey = {
          ...currentJourney,
          milestones: milestones.filter((_: any, i: number) => i !== index)
        };
        render();
      }
      break;
    }
    case 'add-portfolio-metric': {
      const metrics = Array.isArray((state.portfolioContent as any).businessMetrics)
        ? (state.portfolioContent as any).businessMetrics
        : [];
      (state.portfolioContent as any).businessMetrics = [
        ...metrics,
        { label: `P${metrics.length + 1}`, sales: 0, customers: 0 }
      ];
      render();
      break;
    }
    case 'remove-portfolio-metric': {
      const index = Number(button.getAttribute('data-index') || -1);
      const metrics = Array.isArray((state.portfolioContent as any).businessMetrics)
        ? (state.portfolioContent as any).businessMetrics
        : [];
      if (index >= 0) {
        (state.portfolioContent as any).businessMetrics = metrics.filter((_: any, i: number) => i !== index);
        render();
      }
      break;
    }
    case 'add-portfolio-video': {
      state.portfolioContent.feedbackVideos = [
        ...(state.portfolioContent.feedbackVideos || []),
        { title: 'New Feedback', url: '', showOnHomepage: false, showOnPortfolio: true }
      ];
      render();
      break;
    }
    case 'load-existing-feedback-videos': {
      (async () => {
        await mergeExistingLocalFeedbackVideos();
        state.confirmMessage = 'Feedback video list refreshed from saved portfolio content.';
        render();
      })();
      break;
    }
    case 'remove-portfolio-video': {
      const index = Number(button.getAttribute('data-index') || -1);
      if (index >= 0) {
        state.portfolioContent.feedbackVideos = state.portfolioContent.feedbackVideos.filter((_, i) => i !== index);
        render();
      }
      break;
    }
    case 'auto-sync-portfolio-metrics': {
      // Auto-sync metrics from real booking data
      const realMetrics = calculatePortfolioMetricsFromBookings();
      if (Object.keys(realMetrics).length === 0) {
        alert('No paid bookings yet. Metrics will be generated once customers make purchases.');
        break;
      }
      
      const metricsArray = Object.entries(realMetrics).map(([catId, data]: any, idx: number) => ({
        label: catId.replace('cat-', '').charAt(0).toUpperCase() + catId.replace('cat-', '').slice(1),
        sales: data.sales,
        customers: data.customers.size
      }));
      
      (state.portfolioContent as any).businessMetrics = metricsArray;
      state.confirmMessage = `✅ Portfolio metrics synced! Updated ${metricsArray.length} category data points from real purchases.`;
      render();
      break;
    }
    case 'save-portfolio-content': {
      (async () => {
        try {
          await apiFetch('/portfolio-content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ content: state.portfolioContent })
          });
          state.confirmMessage = 'Portfolio content saved successfully!';
          alert('Portfolio content saved successfully!');
        } catch (error) {
          console.warn('Portfolio save failed:', error);
          state.confirmMessage = 'Failed to save portfolio content.';
          alert('Failed to save portfolio content.');
        }
        render();
      })();
      break;
    }

    // --- Admin Services Manager ---
    case 'admin-add-service': {
      event.preventDefault();
      const form = button.closest('form');
      if (!form) return;
      const formData = new FormData(form);
      const title = formData.get('title') as string;
      const icon = formData.get('icon') as string;
      const description = formData.get('description') as string;
      const video = resolvePlayableVideoUrl(String(formData.get('video') || '').trim());
      const videoFile = form.querySelector('input[name="videoFile"]') as HTMLInputElement;

      if (videoFile?.files?.length) {
        state.confirmMessage = 'Uploading media...';
        render();
        (async () => {
          try {
            let uploadedUrl = '';
            try {
              const fd = new FormData();
              fd.append('file', videoFile.files![0]);
              const resp = await fetch('/api/upload-image', {
                method: 'POST',
                body: fd,
                headers: state.currentUser?.token ? { 'Authorization': `Bearer ${state.currentUser.token}` } : {}
              });
              if (resp.ok) {
                const data = await resp.json();
                uploadedUrl = String(data.path || '');
              }
            } catch (_) {}
            if (!uploadedUrl) uploadedUrl = await fileToDataUrl(videoFile.files![0]);
            state.services.push({
              id: `s-${Date.now()}`,
              title,
              icon,
              description,
              video: uploadedUrl || video
            });
            state.admin.serviceForm = {};
            persistState();
            state.confirmMessage = 'Service added successfully!';
          } catch (e) {
            console.error(e);
            state.confirmMessage = 'Failed to upload media.';
          }
          render();
        })();
      } else {
        state.services.push({
          id: `s-${Date.now()}`,
          title,
          icon,
          description,
          video
        });
        state.admin.serviceForm = {};
        persistState();
        state.confirmMessage = 'Service added successfully!';
        render();
      }
      break;
    }

    case 'admin-update-service': {
      event.preventDefault();
      const form = button.closest('form');
      if (!form) return;
      const id = form.getAttribute('data-id');
      if (!id) return;

      const formData = new FormData(form);
      const title = formData.get('title') as string;
      const icon = formData.get('icon') as string;
      const description = formData.get('description') as string;
      const video = resolvePlayableVideoUrl(String(formData.get('video') || '').trim());
      const videoFile = form.querySelector('input[name="videoFile"]') as HTMLInputElement;

      const idx = state.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        if (videoFile?.files?.length) {
          (async () => {
            try {
              let uploadedUrl = '';
              try {
                const fd = new FormData();
                fd.append('file', videoFile.files![0]);
                const resp = await fetch('/api/upload-image', {
                  method: 'POST',
                  body: fd,
                  headers: state.currentUser?.token ? { 'Authorization': `Bearer ${state.currentUser.token}` } : {}
                });
                if (resp.ok) {
                  const data = await resp.json();
                  uploadedUrl = String(data.path || '');
                }
              } catch (_) {}
              if (!uploadedUrl) uploadedUrl = await fileToDataUrl(videoFile.files![0]);
              state.services[idx] = { ...state.services[idx], title, icon, description, video: uploadedUrl || video };
              state.admin.serviceForm = {};
              persistState();
              state.confirmMessage = 'Service updated successfully!';
            } catch (error) {
              console.warn('Service media upload failed:', error);
              state.services[idx] = { ...state.services[idx], title, icon, description, video };
              state.admin.serviceForm = {};
              persistState();
              state.confirmMessage = 'Service updated with URL only.';
            }
            render();
          })();
        } else {
          state.services[idx] = { ...state.services[idx], title, icon, description, video };
          state.admin.serviceForm = {};
          persistState();
          state.confirmMessage = 'Service updated successfully!';
          render();
        }
      }
      break;
    }

    case 'admin-edit-service': {
      const id = button.getAttribute('data-id');
      const idx = Number(button.getAttribute('data-index') || '-1');
      const service = id
        ? state.services.find((item) => item.id === id)
        : (Number.isFinite(idx) && idx >= 0 ? state.services[idx] : null);
      if (!service) return;
      if (!service.id) {
        service.id = `s-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
        persistState();
      }
      state.admin.serviceForm = {
        id: service.id,
        title: service.title || '',
        icon: service.icon || '',
        description: service.description || '',
        video: service.video || ''
      };
      render();
      break;
    }

    case 'admin-cancel-service-edit': {
      state.admin.serviceForm = {};
      render();
      break;
    }

    case 'admin-delete-service': {
      if (!confirm('Are you sure you want to delete this service?')) return;
      const id = button.getAttribute('data-id');
      const idx = Number(button.getAttribute('data-index') || '-1');
      if (id) {
        state.services = state.services.filter((s) => s.id !== id);
      } else if (Number.isFinite(idx) && idx >= 0) {
        state.services.splice(idx, 1);
      }
      state.admin.serviceForm = {};
      persistState();
      state.confirmMessage = 'Service deleted.';
      render();
      break;
    }

    case 'admin-load-sample-services': {
      const existing = Array.isArray(state.services) ? state.services : [];
      const existingKeys = new Set(existing.map((svc) => normalizeKey(`${svc.id || ''} ${svc.title || ''}`)));
      const merged = [...existing];
      SERVICE_MANAGER_SAMPLES.forEach((sample, idx) => {
        const key = normalizeKey(`${sample.id} ${sample.title}`);
        if (!existingKeys.has(key)) {
          merged.push({ ...sample, id: sample.id || `svc-sample-${idx}` });
          existingKeys.add(key);
        }
      });
      state.services = merged;
      persistState();
      state.confirmMessage = 'Sample services loaded into Service Manager.';
      render();
      break;
    }

    case 'upload-service-media': {
      const input = button instanceof HTMLInputElement && button.type === 'file'
        ? button
        : (button.querySelector('input[type="file"]') as HTMLInputElement | null);

      // If the action originates from the file input itself, let native browser behavior open the picker.
      if (input && input !== button) {
        input.click();
      }
      break;
    }

    // --- Admin Showroom Manager ---

    case 'admin-add-showroom': {
      event.preventDefault(); // Ensure form submission is prevented
      const form = button.closest('form');
      if (!form) return;
      const formData = new FormData(form);
      const name = formData.get('name') as string;
      const city = formData.get('city') as string;
      const area = formData.get('area') as string;
      const phone = formData.get('phone') as string;
      const videoUrl = formData.get('videoUrl') as string || '';
      const mediaFile = form.querySelector('input[name="mediaFile"]') as HTMLInputElement;

      if (mediaFile?.files?.length) {
        state.confirmMessage = 'Uploading media...';
        render();
        (async () => {
          try {
            const url = await fileToDataUrl(mediaFile.files![0]);
            const isVideo = mediaFile.files![0].type.startsWith('video/');
            const createdShowroom = saveShowroom({
              name,
              city,
              locations: [{ area, phone }],
              videoUrl: isVideo ? url : '',
              imageUrl: !isVideo ? url : ''
            });
            state.showrooms = [
              ...(Array.isArray(state.showrooms) ? state.showrooms : []),
              normalizeShowroomRecord(createdShowroom, (Array.isArray(state.showrooms) ? state.showrooms.length : 0))
            ];
            state.admin.showroomForm = {};
            state.confirmMessage = 'Showroom added successfully!';
          } catch (e) {
            console.error(e);
            state.confirmMessage = 'Failed to upload media.';
          }
          render();
        })();
      } else {
        const createdShowroom = saveShowroom({
          name,
          city,
          locations: [{ area, phone }],
          videoUrl,
          imageUrl: ''
        });
        state.showrooms = [
          ...(Array.isArray(state.showrooms) ? state.showrooms : []),
          normalizeShowroomRecord(createdShowroom, (Array.isArray(state.showrooms) ? state.showrooms.length : 0))
        ];
        state.admin.showroomForm = {};
        state.confirmMessage = 'Showroom added successfully!';
        render();
      }
      break;
    }

    case 'admin-update-showroom': {
      event.preventDefault();
      const form = button.closest('form');
      if (!form) return;
      const id = form.getAttribute('data-id');
      if (!id) return;

      const formData = new FormData(form);
      const name = formData.get('name') as string;
      const city = formData.get('city') as string;
      const area = formData.get('area') as string;
      const phone = formData.get('phone') as string;
      const videoUrl = formData.get('videoUrl') as string || '';
      const mediaFile = form.querySelector('input[name="mediaFile"]') as HTMLInputElement;

      const currentShowroom = state.showrooms.find((item: any) => item.id === id) || {};
      let nextVideoUrl = videoUrl || String(currentShowroom.videoUrl || '');
      let nextImageUrl = String(currentShowroom.imageUrl || '');
      if (mediaFile?.files?.length) {
        const uploaded = await fileToDataUrl(mediaFile.files[0]);
        if (mediaFile.files[0].type.startsWith('video/')) {
          nextVideoUrl = uploaded;
        } else {
          nextImageUrl = uploaded;
        }
      }

      const updatedShowrooms = updateShowroom(id, {
        name,
        city,
        locations: [{ area, phone }],
        videoUrl: nextVideoUrl,
        imageUrl: nextImageUrl
      });
      state.showrooms = (updatedShowrooms || []).map((showroom: any, index: number) => normalizeShowroomRecord(showroom, index));
      state.admin.showroomForm = {};
      state.confirmMessage = 'Showroom updated successfully!';
      render();
      break;
    }

    case 'admin-delete-showroom': {
      if (!confirm('Are you sure you want to delete this showroom?')) return;
      const id = button.getAttribute('data-id');
      if (!id) return;
      const updatedShowrooms = deleteShowroom(id);
      state.showrooms = (updatedShowrooms || []).map((showroom: any, index: number) => normalizeShowroomRecord(showroom, index));
      state.admin.showroomForm = {};
      state.confirmMessage = 'Showroom deleted.';
      render();
      break;
    }

    case 'admin-edit-showroom': {
      const id = button.getAttribute('data-id');
      if (!id) return;
      const showroom = state.showrooms.find((item: any) => item.id === id);
      if (!showroom) return;
      state.admin.showroomForm = {
        id: showroom.id,
        name: showroom.name || '',
        city: showroom.city || '',
        area: showroom.locations?.[0]?.area || '',
        phone: showroom.locations?.[0]?.phone || '',
        videoUrl: showroom.videoUrl || showroom.video3d || showroom.video || '',
        imageUrl: showroom.imageUrl || showroom.image || ''
      } as any;
      render();
      break;
    }

    case 'admin-cancel-showroom-edit': {
      state.admin.showroomForm = {};
      render();
      break;
    }

    case 'admin-luxury-property': {
      const property = button.getAttribute('data-property') as 'house' | 'apartment' | null;
      if (!property) return;
      state.showroomPropertyType = property;
      state.selectedShowroomRoom = undefined;
      render();
      break;
    }

    case 'admin-new-luxury-room': {
      state.selectedShowroomRoom = '__new__';
      render();
      break;
    }

    case 'admin-add-luxury-room': {
      event.preventDefault();
      const form = button.closest('form');
      if (!form) return;
      const formData = new FormData(form);
      const propertyType = (formData.get('propertyType') as 'house' | 'apartment') || 'house';
      const mediaFile = form.querySelector('input[name="mediaFile"]') as HTMLInputElement | null;

      const applyCreate = async (uploadedUrl = '', isVideoUpload = false) => {
        const store = getLuxuryShowroomStore();
        const relatedImages = collectRelatedImagesFromFormData(formData);
        const nextRoom = {
          id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: String(formData.get('name') || '').trim(),
          type: String(formData.get('type') || RoomType.LIVING),
          description: String(formData.get('description') || '').trim(),
          imageUrl: normalizeAssetUrl(isVideoUpload ? String(formData.get('imageUrl') || '').trim() : (uploadedUrl || String(formData.get('imageUrl') || '').trim())),
          video3d: normalizeAssetUrl(isVideoUpload ? (uploadedUrl || String(formData.get('video3d') || '').trim()) : String(formData.get('video3d') || '').trim()),
          designs: String(formData.get('designIds') || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          relatedImages
        };
        store[propertyType].rooms.push(nextRoom as any);
        saveLuxuryShowroomStore(store);
        state.confirmMessage = 'Luxury showroom room added.';
        state.showroomPropertyType = propertyType;
        state.selectedShowroomRoom = nextRoom.id;
        render();
      };

      if (mediaFile?.files?.length) {
        (async () => {
          try {
            const file = mediaFile.files![0];
            const fileId = `luxury-room-media-${Date.now()}`;
            await saveFile(fileId, file);
            const uploadedUrl = await getFileUrl(fileId) || '';
            await applyCreate(uploadedUrl, file.type.startsWith('video/'));
          } catch (error) {
            console.error(error);
            render();
          }
        })();
      } else {
        void applyCreate();
      }
      break;
    }

    case 'admin-update-luxury-room': {
      event.preventDefault();
      const form = button.closest('form');
      if (!form) return;
      const propertyType = form.getAttribute('data-property') as 'house' | 'apartment' | null;
      const roomId = form.getAttribute('data-room-id');
      if (!propertyType || !roomId) return;

      const formData = new FormData(form);
      const store = getLuxuryShowroomStore();
      const roomIndex = store[propertyType].rooms.findIndex((room) => room.id === roomId);
      if (roomIndex === -1) return;

      const current = store[propertyType].rooms[roomIndex];
      const relatedImages = collectRelatedImagesFromFormData(formData);
      store[propertyType].rooms[roomIndex] = {
        ...current,
        name: String(formData.get('name') || current.name).trim(),
        type: String(formData.get('type') || current.type),
        description: String(formData.get('description') || current.description || '').trim(),
        imageUrl: normalizeAssetUrl(String(formData.get('imageUrl') || current.imageUrl || '').trim()),
        video3d: normalizeAssetUrl(String(formData.get('video3d') || current.video3d || '').trim()),
        designs: String(formData.get('designIds') || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        relatedImages
      } as any;

      saveLuxuryShowroomStore(store);
      state.confirmMessage = 'Luxury room updated.';
      render();
      break;
    }

    case 'admin-delete-luxury-room': {
      if (!confirm('Delete this luxury room?')) return;
      const propertyType = button.getAttribute('data-property') as 'house' | 'apartment' | null;
      const roomId = button.getAttribute('data-room-id');
      if (!propertyType || !roomId) return;

      const store = getLuxuryShowroomStore();
      store[propertyType].rooms = store[propertyType].rooms.filter((room) => room.id !== roomId);
      saveLuxuryShowroomStore(store);
      render();
      break;
    }

    case 'admin-reset-luxury-showrooms': {
      if (!confirm('Reset all luxury showroom rooms to default data?')) return;
      saveLuxuryShowroomStore(getDefaultLuxuryShowroomStore());
      state.selectedShowroomRoom = undefined;
      render();
      break;
    }

    case 'admin-reset-luxury-property': {
      const propertyType = button.getAttribute('data-property') as 'house' | 'apartment' | null;
      if (!propertyType) return;
      if (!confirm(`Reset ${propertyType === 'house' ? 'Luxury Villa' : 'Penthouse Apt'} rooms to defaults?`)) return;

      const store = getLuxuryShowroomStore();
      const defaults = getDefaultLuxuryShowroomStore();
      store[propertyType] = defaults[propertyType];
      saveLuxuryShowroomStore(store);
      state.selectedShowroomRoom = undefined;
      render();
      break;
    }

    case 'close-confirm':
      state.confirmMessage = null;
      render();
      break;

    // --- Admin Invoices Manager ---
    case 'admin-load-invoices': {
      try {
        const response = await fetch('/api/invoices/all', { headers: { ...getAuthHeaders() } });
        
        if (!response.ok) {
          console.error(`Error loading invoices: HTTP ${response.status} ${response.statusText}`);
          state.admin.invoices = [];
          state.admin.invoiceFilter = { query: '', status: 'all' };
          render();
          return;
        }
        
        const data = await response.json();
        state.admin.invoices = Array.isArray(data?.invoices) ? data.invoices : [];
        state.admin.invoiceFilter = { query: '', status: 'all' };
        render();
      } catch (error) {
        console.error('Error loading invoices:', error);
        state.admin.invoices = [];
        state.admin.invoiceFilter = { query: '', status: 'all' };
        render();
      }
      break;
    }

    case 'create-sample-invoice': {
      try {
        const response = await fetch('/api/invoices/create-sample', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
        });
        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to create sample invoice');
        }
        await refreshAdminData({});
        updateAdminCharts();
        state.confirmMessage = 'Sample invoice created successfully.';
      } catch (error) {
        console.error('Error creating sample invoice:', error);
        state.confirmMessage = 'Unable to create sample invoice.';
      }
      render();
      break;
    }

    case 'admin-invoice-filter': {
      const filterValue = (button.dataset.filterValue || 'all') as string;
      state.admin.invoiceFilter = {
        ...(state.admin.invoiceFilter || { query: '' }),
        status: (filterValue as 'all' | 'generated' | 'sent' | 'paid')
      };
      render();
      break;
    }

    case 'admin-view-invoice': {
      const invoiceId = button.dataset.invoiceId;
      const invoiceNumber = String(button.dataset.invoiceNumber || '');
      if (!invoiceId || !state.admin.invoices) return;
      const invoice = state.admin.invoices.find((inv: any) => inv.id === invoiceId);
      if (invoice) {
        state.admin.selectedInvoice = invoice;
        if (invoiceNumber) {
          window.open(`/api/invoices/view/${encodeURIComponent(invoiceNumber)}`, '_blank', 'noopener');
        }
        render();
      }
      break;
    }

    case 'admin-close-invoice-view': {
      state.admin.selectedInvoice = null;
      render();
      break;
    }

    case 'admin-download-invoice': {
      const invoiceId = String(button.dataset.invoiceId || '');
      const invoiceNumber = String(button.dataset.invoiceNumber || '');
      if (!invoiceId && !invoiceNumber) return;
      try {
        const targetNumber = invoiceNumber || String(state.admin.invoices.find((inv: any) => String(inv.id) === invoiceId)?.invoiceNumber || '');
        if (!targetNumber) return;
        const response = await fetch(`/api/invoices/download/${encodeURIComponent(targetNumber)}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${targetNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error downloading invoice:', error);
      }
      break;
    }

    // --- Customer Invoices ---
    case 'customer-load-invoices': {
      try {
        if (!state.currentUser) {
          console.log('User not logged in');
          return;
        }
        console.log(`[Invoice] Loading invoices for userId: ${state.currentUser.id}`);
        const response = await fetch(`/api/invoices/customer/${encodeURIComponent(state.currentUser.id)}`, { headers: { ...getAuthHeaders() } });
        
        console.log(`[Invoice] Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.error(`Error loading invoices: HTTP ${response.status} ${response.statusText}`);
          state.customer.invoices = [];
          const invoicesDiv = document.getElementById('recent-invoices');
          if (invoicesDiv) invoicesDiv.innerHTML = '<div style="font-size:12px;color:#94a3b8;padding:8px 0;">Error loading invoices.</div>';
          return;
        }
        
        const data = await response.json();
        console.log(`[Invoice] Received data:`, data);
        
        // Handle both invoices (from payments) and confirmed bookings (admin approval)
        let invoices = Array.isArray(data?.invoices) ? data.invoices : [];
        
        // Map booking-sourced items to invoice format for consistent display
        invoices = invoices.map((inv: any) => {
          const isBooking = inv.source === 'booking' || !!inv.bookingId;
          const displayName = isBooking
            ? `${inv.designName || 'Booking'} - #${inv.bookingId || inv.id}`
            : `Invoice #${inv.invoiceNumber || inv.id || 'Unknown'}`;
          const displayAmount = Math.max(0, Number(inv.amount || inv.price || 0));
          const displayDate = inv.paymentDateTime || inv.paidAt || inv.createdAt || inv.updatedAt || new Date().toISOString();
          
          return {
            ...inv,
            displayName,
            displayAmount,
            displayStatus: inv.status || 'completed',
            displayDate,
            isBooking
          };
        });
        
        state.customer.invoices = invoices;
        const invoiceCount = invoices.filter((i: any) => !i.isBooking).length;
        const bookingCount = invoices.filter((i: any) => i.isBooking).length;
        console.log(`[Invoice] Set ${invoices.length} items (${invoiceCount} invoices + ${bookingCount} confirmed bookings)`);
        
        // Update DOM directly instead of full re-render
        const invoicesDiv = document.getElementById('recent-invoices');
        if (invoicesDiv) {
          if (invoices.length === 0) {
            invoicesDiv.innerHTML = '<div style="font-size:12px;color:#94a3b8;padding:8px 0;">No invoices found.</div>';
          } else {
            invoicesDiv.innerHTML = invoices.map((inv: any) => {
              const displayName = inv.displayName || 'Invoice';
              const amount = Math.max(0, Number(inv.displayAmount || 0));
              const date = inv.displayDate || '';
              const dateStr = date ? new Date(date).toLocaleDateString() : '';
              const formattedAmount = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
                <div>
                  <div style="font-size:12px;font-weight:600;color:#1a1a2e;">${escapeHtml(String(displayName))}</div>
                  <div style="font-size:10px;color:#94a3b8;">${dateStr}</div>
                </div>
                <span style="font-size:11px;font-weight:700;color:#22c55e;">${formattedAmount}</span>
              </div>`;
            }).join('');
          }
        }
      } catch (error) {
        console.error('Error loading customer invoices:', error);
        state.customer.invoices = [];
        const invoicesDiv = document.getElementById('recent-invoices');
        if (invoicesDiv) invoicesDiv.innerHTML = '<div style="font-size:12px;color:#94a3b8;padding:8px 0;">Error loading invoices.</div>';
      }
      break;
    }

    case 'customer-view-invoice': {
      const invoiceNumber = String(button.dataset.invoiceNumber || '').trim();
      if (!invoiceNumber) {
        state.confirmMessage = 'Invoice number is missing for this record.';
        render();
        return;
      }
      window.open(`/api/invoices/view/${encodeURIComponent(invoiceNumber)}`, '_blank', 'noopener');
      break;
    }

    case 'customer-download-invoice': {
      const invoiceNumber = String(button.dataset.invoiceNumber || '').trim();
      if (!invoiceNumber) {
        state.confirmMessage = 'Invoice number is missing for this record.';
        render();
        return;
      }
      window.open(`/api/invoices/download/${encodeURIComponent(invoiceNumber)}`, '_blank', 'noopener');
      break;
    }

    case 'admin-reset-visual-data': {
      if (!confirm('Reset showroom, showcase, and catalog visual data to defaults? Bookings and payments will not be changed.')) return;

      localStorage.removeItem(STORAGE_KEYS.showrooms);
      localStorage.removeItem(STORAGE_KEYS.showcases);
      localStorage.removeItem(STORAGE_KEYS.catalog);

      state.showrooms = getShowrooms().map((showroom: any, index: number) => normalizeShowroomRecord(showroom, index));
      state.serviceShowcases = INITIAL_SERVICE_SHOWCASES.map((showcase: any, index: number) => normalizeShowcaseRecord(showcase, index));
      state.catalog = SAMPLE_MODELS.map((model) => normalizeDesignMotion3D({ ...model }));
      state.selectedModelId = state.catalog.find((model) => !model.isDeleted)?.id || null;
      state.admin.showroomForm = {};
      state.admin.showcaseForm = {};
      state.upload.open = false;
      state.confirmMessage = 'Visual data reset completed. Showroom, showcase, and catalog were restored.';
      persistState();
      render();
      break;
    }

    // --- Admin Showcase Manager ---
    case 'admin-add-showcase': {
      event.preventDefault();
      const form = button.closest('form');
      if (!form) return;
      const formData = new FormData(form);
      const title = formData.get('title') as string;
      const style = formData.get('style') as string;
      const duration = formData.get('duration') as string;
      const price = formData.get('price') as string;
      const description = formData.get('description') as string;
      const serviceId = String(formData.get('serviceId') || '').trim();
      const relatedImageInput = String(formData.get('relatedImages') || '');
      const imageFile = (form.querySelector('input[name="imageFile"]') as HTMLInputElement)?.files?.[0];
      const relatedImageFiles = Array.from((form.querySelector('input[name="relatedImageFiles"]') as HTMLInputElement)?.files || []);

      const createShowcase = async (imageUrl: string) => {
        const localRelatedImages = await Promise.all(relatedImageFiles.map((file) => fileToDataUrl(file)));
        const relatedImages = [
          ...parseRelatedImageUrlsInput(relatedImageInput),
          ...localRelatedImages.map((url) => normalizeAssetUrl(url)).filter(Boolean)
        ];
        return saveServiceShowcase({
          title,
          style,
          duration,
          price,
          description,
          image: imageUrl,
          serviceId,
          relatedImages
        });
      };

      if (imageFile) {
        state.confirmMessage = 'Uploading image...';
        render();
        (async () => {
          try {
            const imageUrl = await fileToDataUrl(imageFile);
            const createdShowcase = await createShowcase(imageUrl);
            state.serviceShowcases = [
              ...(Array.isArray(state.serviceShowcases) ? state.serviceShowcases : []),
              normalizeShowcaseRecord(createdShowcase, (Array.isArray(state.serviceShowcases) ? state.serviceShowcases.length : 0))
            ];
            state.admin.showcaseForm = {};
            state.confirmMessage = 'Showcase added successfully!';
          } catch (e) {
            console.error(e);
            state.confirmMessage = 'Failed to upload image.';
          }
          render();
        })();
      } else {
        const imageUrl = formData.get('image') as string || '';
        (async () => {
          try {
            const createdShowcase = await createShowcase(imageUrl);
            state.serviceShowcases = [
              ...(Array.isArray(state.serviceShowcases) ? state.serviceShowcases : []),
              normalizeShowcaseRecord(createdShowcase, (Array.isArray(state.serviceShowcases) ? state.serviceShowcases.length : 0))
            ];
            state.admin.showcaseForm = {};
            state.confirmMessage = 'Showcase added successfully!';
          } catch (e) {
            console.error(e);
            state.confirmMessage = 'Failed to add showcase.';
          }
          render();
        })();
      }
      break;
    }

    case 'admin-update-showcase': {
      event.preventDefault();
      const form = button.closest('form');
      if (!form) return;
      const id = form.getAttribute('data-id');
      const formData = new FormData(form);
      if (!id) return;

      const title = formData.get('title') as string;
      const style = formData.get('style') as string;
      const duration = formData.get('duration') as string;
      const price = formData.get('price') as string;
      const description = formData.get('description') as string;
      const serviceId = String(formData.get('serviceId') || '').trim();
      const relatedImageInput = String(formData.get('relatedImages') || '');
      const imageFile = (form.querySelector('input[name="imageFile"]') as HTMLInputElement)?.files?.[0];
      const relatedImageFiles = Array.from((form.querySelector('input[name="relatedImageFiles"]') as HTMLInputElement)?.files || []);
      const imageUrl = imageFile ? await fileToDataUrl(imageFile) : (formData.get('image') as string || '');
      const localRelatedImages = await Promise.all(relatedImageFiles.map((file) => fileToDataUrl(file)));
      const relatedImages = [
        ...parseRelatedImageUrlsInput(relatedImageInput),
        ...localRelatedImages.map((url) => normalizeAssetUrl(url)).filter(Boolean)
      ];

      const updatedShowcases = updateServiceShowcase(id, { title, style, duration, price, description, image: imageUrl, serviceId, relatedImages });
      state.serviceShowcases = (updatedShowcases || []).map((showcase: any, index: number) => normalizeShowcaseRecord(showcase, index));
      state.admin.showcaseForm = {};
      state.confirmMessage = 'Showcase updated successfully!';
      render();
      break;
    }

    case 'admin-delete-showcase': {
      if (!confirm('Are you sure you want to delete this showcase item?')) return;
      const id = button.getAttribute('data-id');
      if (!id) return;
      const updatedShowcases = deleteServiceShowcase(id);
      state.serviceShowcases = (updatedShowcases || []).map((showcase: any, index: number) => normalizeShowcaseRecord(showcase, index));
      state.admin.showcaseForm = {};
      state.confirmMessage = 'Showcase item deleted.';
      render();
      break;
    }

    case 'admin-edit-showcase': {
      const id = button.getAttribute('data-id');
      if (!id) return;
      const showcase = state.serviceShowcases.find((item: any) => item.id === id);
      if (!showcase) return;
      state.admin.showcaseForm = {
        id: showcase.id,
        title: showcase.title || '',
        style: showcase.style || '',
        duration: showcase.duration || '',
        price: showcase.price || '',
        description: showcase.description || '',
        image: showcase.image || '',
        serviceId: showcase.serviceId || '',
        relatedImages: Array.isArray(showcase.relatedImages) ? showcase.relatedImages : []
      };
      render();
      break;
    }

    case 'admin-cancel-showcase-edit': {
      state.admin.showcaseForm = {};
      render();
      break;
    }

    case 'admin-remove-showcase-related-image': {
      const index = Number(button.getAttribute('data-index') || '-1');
      const form = button.closest('form');
      const currentList = getShowcaseRelatedImagesFromFormState(form as HTMLFormElement | null);

      if (!Number.isFinite(index) || index < 0 || index >= currentList.length) return;
      currentList.splice(index, 1);
      state.admin.showcaseForm = {
        ...(state.admin.showcaseForm || {}),
        relatedImages: currentList
      };
      render();
      break;
    }

    case 'admin-move-showcase-related-image': {
      const index = Number(button.getAttribute('data-index') || '-1');
      const direction = String(button.getAttribute('data-direction') || '').toLowerCase();
      const form = button.closest('form');
      const currentList = getShowcaseRelatedImagesFromFormState(form as HTMLFormElement | null);
      if (!Number.isFinite(index) || index < 0 || index >= currentList.length) return;
      const nextIndex = direction === 'up' ? index - 1 : direction === 'down' ? index + 1 : index;
      if (nextIndex < 0 || nextIndex >= currentList.length || nextIndex === index) return;
      const [moved] = currentList.splice(index, 1);
      currentList.splice(nextIndex, 0, moved);
      state.admin.showcaseForm = {
        ...(state.admin.showcaseForm || {}),
        relatedImages: currentList
      };
      render();
      break;
    }

    case 'admin-clear-showcase-related-images': {
      state.admin.showcaseForm = {
        ...(state.admin.showcaseForm || {}),
        relatedImages: []
      };
      render();
      break;
    }

    // ------------------------------
    // ------------------------------
    case 'edit-category-image-name': {
      const categoryId = button.getAttribute('data-category-id') || '';
      if (!categoryId) return;
      const category = (state.customer.categories || []).find((cat) => cat.id === categoryId);
      if (!category || !category.images) return;
      const filenameAttr = button.getAttribute('data-image-filename') || '';
      const imageUrl = button.getAttribute('data-image-url') || '';
      const currentName = button.getAttribute('data-image-name') || '';
      const filename = filenameAttr || imageUrl.split('/').pop() || '';
      if (!filename) return;
      const nextName = prompt('Enter new image name', currentName || filename) || '';
      if (!nextName.trim()) return;
      const imageNames: Record<string, string> = {};
      category.images.forEach((img: any) => {
        const imgFilename = img.filename || (img.url || '').split('/').pop() || '';
        if (imgFilename) imageNames[imgFilename] = img.name || '';
      });
      imageNames[filename] = nextName.trim();
      (async () => {
        try {
          await apiFetch(`/categories/${encodeURIComponent(categoryId)}/image-names`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ imageNames })
          });
          await refreshCustomerData();
        } catch (error) {
          console.warn('Image name update failed:', error);
        }
        render();
      })();
      break;
    }

    case 'select-model': {
      const id = button.getAttribute('data-id');
      if (id) {
        state.selectedModelId = id;
        state.customer.selectedDesignId = id;
      }
      render();
      break;
    }
    case 'select-category': {
      const categoryId = button.getAttribute('data-category-id');
      if (categoryId) {
        state.customer.activeCategory = categoryId;
        applyCategoryBackground(categoryId);
      }
      if (!state.customer.categoryView) state.customer.categoryView = { forceDesigns: false };
      state.customer.categoryView.forceDesigns = false;
      render();
      break;
    }
    case 'toggle-category-view': {
      const view = button.getAttribute('data-view');
      if (!state.customer.categoryView) state.customer.categoryView = { forceDesigns: false };
      state.customer.categoryView.forceDesigns = view === 'designs';
      render();
      break;
    }
    case 'open-category-image': {
      const imageUrl = button.getAttribute('data-image-url') || '';
      if (!imageUrl) return;
      const imageName = button.getAttribute('data-image-name') || 'Design';
      const categoryId = button.getAttribute('data-category-id') || '';
      const categoryName = button.getAttribute('data-category-name') || '';
      const costRaw = button.getAttribute('data-image-cost') || '';
      const parsedCost = parseAmountValue(costRaw);
      const designId = button.getAttribute('data-design-id') || '';
      if (categoryId) {
        state.customer.activeCategory = categoryId;
        applyCategoryBackground(categoryId);
      }
      state.customer.imagePreview = {
        url: imageUrl,
        name: imageName,
        cost: parsedCost > 0 ? parsedCost : null,
        categoryName,
        designId: designId || null
      };
      render();
      break;
    }
    case 'preview-like':
    case 'preview-book': {
      const designId = state.customer.imagePreview?.designId || null;
      state.customer.imagePreview = null;
      const previewDialog = document.querySelector('.spidey-preview-dialog') as HTMLDialogElement | null;
      if (previewDialog?.open) previewDialog.close();
      if (!state.currentUser) {
        state.loginError = 'Please sign in to continue booking.';
        if (designId) {
          sessionStorage.setItem('pending_booking_design_id', designId);
        }
        navigateTo('login');
        break;
      }
      if (designId) {
        handleCustomerBooking(designId);
        break;
      }
      navigateTo('contact');
      break;
    }
    case 'open-ai-design': {
      const imageUrl = button.getAttribute('data-image-url') || '';
      if (!imageUrl) return;
      const imageName = button.getAttribute('data-image-name') || 'AI Design';
      const imagePrice = parseInt(button.getAttribute('data-image-price') || '0');
      const imageCategory = button.getAttribute('data-image-category') || 'Design Studio';
      const designId = button.getAttribute('data-design-id') || null;
      state.customer.imagePreview = {
        url: imageUrl,
        name: imageName,
        cost: imagePrice,
        categoryName: imageCategory,
        designId: designId,
        isAIStudio: true
      };
      render();
      break;
    }
    case 'close-image-preview': {
      state.customer.imagePreview = null;
      render();
      break;
    }
    case 'open-preview-design': {
      const designId = button.getAttribute('data-design-id');
      if (!designId) return;
      state.customer.imagePreview = null;
      state.selectedModelId = designId;
      state.customer.selectedDesignId = designId;
      const design = state.customer.designs.find((d) => d.id === designId) || getDesigns().find((d) => d.id === designId);
      if (design?.categoryId) {
        state.customer.galleryCategoryId = design.categoryId;
      }
      navigateTo('gallery');
      break;
    }
    case 'close-preview': {
      state.customer.imagePreview = null;
      render();
      break;
    }
    case 'open-portfolio-dialog': {
      (state.customer as any).portfolioDialog = {
        isOpen: true,
        imageUrl: button.getAttribute('data-image-url') || '',
        imageName: button.getAttribute('data-image-name') || '',
        imageDesc: button.getAttribute('data-image-desc') || '',
        imageCost: button.getAttribute('data-image-cost') || '',
        imageCategory: button.getAttribute('data-image-category') || '',
        categoryId: button.getAttribute('data-category-id') || '',
        categoryName: button.getAttribute('data-category-name') || '',
        designId: button.getAttribute('data-design-id') || '',
      };
      render();
      break;
    }
    case 'close-portfolio-dialog': {
      (state.customer as any).portfolioDialog = undefined;
      render();
      break;
    }
    case 'open-3d-room': {
      const imageUrl = button.getAttribute('data-image-url') || '';
      const roomName = button.getAttribute('data-room-name') || '3D Room';
      if (imageUrl) handleOpen3DRoom(imageUrl, roomName);
      break;
    }
    case 'quote': {
      const pkgId = button.getAttribute('data-package') || 'general';
      const pkgName = button.getAttribute('data-package-name') || '';
      state.inquiryForm.message = pkgName ? `Requesting quote for: ${pkgName}` : `Requesting quote`;
      navigateTo('contact');
      render();
      break;
    }
    case 'quote-package': {
      const pkgId = button.getAttribute('data-package') || '';
      const pkgName = button.getAttribute('data-package-name') || '';

      if (!state.currentUser) {
        state.loginError = 'Please sign in to get a quote.';
        sessionStorage.setItem('pending_quote_package', JSON.stringify({ id: pkgId, name: pkgName }));
        navigateTo('login');
        break;
      }

      state.inquiryForm.message = `Requesting quote for: ${pkgName}`;
      navigateTo('contact');
      render();
      break;
    }

    case 'filter-package-type': {
      const filterType = button.getAttribute('data-type') || 'All';
      (state.customer as any).packageTypeFilter = filterType;
      (state.customer as any).packageCardsVisibleCount = 12;
      render();
      break;
    }

    case 'load-more-package-cards': {
      const currentVisible = Number((state.customer as any).packageCardsVisibleCount || 12);
      (state.customer as any).packageCardsVisibleCount = Math.max(12, currentVisible) + 12;
      render();
      break;
    }

    case 'like-package': {
      const pkgIdToLike = button.getAttribute('data-package-id') || '';
      if (!pkgIdToLike || !state.currentUser) break;
      toggleCustomerPackagePreference(state.currentUser.id, pkgIdToLike);
      render();
      break;
    }

    case 'book-package-card': {
      const pkgId = button.getAttribute('data-package-id') || '';
      const pkg = getCustomerDisplayPackages().find((item: any) => String(item.id || '') === String(pkgId)) as Package | undefined;
      if (!pkg) {
        state.customer.paymentError = 'Selected package could not be found.';
        render();
        break;
      }
      void openPackageCardPayment(pkg);
      break;
    }

    case 'apply-card-discount': {
      const cardBookingId = button.getAttribute('data-booking-id') || '';
      const codeInput = document.getElementById('card-discount-code') as HTMLInputElement | null;
      const rawCode = (codeInput?.value || '').trim();
      if (!rawCode) { state.customer.paymentError = 'Enter a discount code.'; render(); break; }
      const fp2 = (state.customer as any).fakePayment;
      const baseAmount = fp2 ? Number(fp2.baseAmount || fp2.amount || 0) : 0;
      const applied = applyDiscountCodeToBooking(cardBookingId, rawCode, baseAmount);
      if (applied && fp2) {
        fp2.discountCode = normalizePromoCode(rawCode);
      }
      render();
      break;
    }

    case 'apply-selected-card-offer': {
      const bookingId = button.getAttribute('data-booking-id') || '';
      const offerSelect = document.getElementById('card-offer-select') as HTMLSelectElement | null;
      const selectedCode = String(offerSelect?.value || '').trim();
      const codeInput = document.getElementById('card-discount-code') as HTMLInputElement | null;
      if (codeInput) codeInput.value = selectedCode;
      if (!selectedCode) {
        state.customer.paymentError = 'Select an offer code.';
        render();
        break;
      }
      const fp = (state.customer as any).fakePayment;
      const baseAmount = fp ? Number(fp.baseAmount || fp.amount || 0) : 0;
      const applied = applyDiscountCodeToBooking(bookingId, selectedCode, baseAmount);
      if (applied && fp) fp.discountCode = normalizePromoCode(selectedCode);
      render();
      break;
    }
    case 'open-package-modal': {
      const pkgId = button.getAttribute('data-package-id');
      if (!pkgId) return;
      const pkg = getCustomerDisplayPackages().find((p: any) => p.id === pkgId);
      if (!pkg) return;

      (state as any).selectedPackage = pkg;
      render();
      break;
    }
    case 'close-package-modal': {
      (state as any).selectedPackage = null;
      (state as any).roomPreview = null;
      render();
      break;
    }
    case 'open-room-preview': {
      const roomId = button.getAttribute('data-room-id');
      const pkg = (state as any).selectedPackage as Package;
      if (pkg && pkg.rooms) {
        const room = pkg.rooms.find(r => r.id === roomId);
        if (room) {
          (state as any).roomPreview = room;
          render();
        }
      }
      break;
    }
    case 'close-room-preview': {
      (state as any).roomPreview = null;
      render();
      break;
    }
    case 'add-package-room': {
      if (state.currentUser?.role !== 'admin') return;
      if (!state.admin.packageForm.rooms) state.admin.packageForm.rooms = [];
      state.admin.packageForm.rooms.push({
        id: `room-${Date.now()}`,
        title: 'New Room',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600',
        description: ''
      });
      render();
      break;
    }
    case 'remove-package-room': {
      if (state.currentUser?.role !== 'admin') return;
      const index = parseInt(button.getAttribute('data-index') || '-1');
      if (index >= 0 && state.admin.packageForm.rooms) {
        state.admin.packageForm.rooms.splice(index, 1);
        render();
      }
      break;
    }
    case 'load-package-related-images': {
      if (state.currentUser?.role !== 'admin') return;
      const rooms = buildPackageRoomsFromCategory(String(state.admin.packageForm.category || ''));
      if (rooms.length === 0) {
        state.confirmMessage = 'No category images available to load.';
        render();
        break;
      }
      state.admin.packageForm.rooms = rooms;
      state.confirmMessage = `Loaded ${state.admin.packageForm.rooms.length} related images.`;
      render();
      break;
    }
    case 'update-package-room': {
      // This is handled by a separate input/change listener if needed, 
      // but let's implement it here as well for simplicity if triggered by buttons (though our UI uses inputs)
      break;
    }
    case 'smart-assist':
      handleAiAssist();
      break;
    case 'reset-feedback':
      state.feedbackSubmitted = false;
      render();
      break;
    case 'reset-inquiry':
      state.formSubmitted = false;
      render();
      break;
    case 'select-property': {
      const property = button.getAttribute('data-property') as 'house' | 'apartment';
      if (property) {
        state.showroomPropertyType = property;
        state.selectedShowroomRoom = undefined;
        render();
      }
      break;
    }
    case 'view-inquiry': {
      const isAdminRoute = typeof location !== 'undefined' && location.pathname === '/admin';
      if (state.currentUser?.role !== 'admin' && state.activeTab !== 'admin' && !isAdminRoute) return;
      const inquiryId = button.getAttribute('data-inquiry-id');
      if (!inquiryId) return;
      (state.admin as any).viewingInquiryId = inquiryId;
      state.inquiries = state.inquiries.map((inq) => (
        String(inq.id || '') === String(inquiryId)
          ? { ...inq, isReadByAdmin: true }
          : inq
      ));
      persistState();
      render();
      break;
    }
    case 'close-inquiry-view': {
      (state.admin as any).viewingInquiryId = null;
      render();
      break;
    }
    case 'view-customer': {
      const isAdminRoute = typeof location !== 'undefined' && location.pathname === '/admin';
      if (state.currentUser?.role !== 'admin' && state.activeTab !== 'admin' && !isAdminRoute) return;
      const customerId = button.getAttribute('data-customer-id');
      if (!customerId) return;
      (state.admin as any).viewingCustomerId = customerId;
      render();
      break;
    }
    case 'admin-edit-customer-inline': {
      const isAdminRoute = typeof location !== 'undefined' && location.pathname === '/admin';
      if (state.currentUser?.role !== 'admin' && state.activeTab !== 'admin' && !isAdminRoute) return;
      const customerId = button.getAttribute('data-customer-id');
      if (!customerId) return;
      (state.admin as any).editingCustomerId = customerId;
      render();
      break;
    }
    case 'admin-cancel-customer-inline-edit': {
      (state.admin as any).editingCustomerId = null;
      render();
      break;
    }
    case 'close-customer-view': {
      (state.admin as any).viewingCustomerId = null;
      render();
      break;
    }
    case 'toggle-customer-activity-details': {
      (state.admin as any).showCustomerActivityDetails = !(state.admin as any).showCustomerActivityDetails;
      render();
      break;
    }
    case 'select-showroom-room': {
      const roomId = button.getAttribute('data-room-id');
      if (roomId) {
        state.selectedShowroomRoom = roomId;
        render();
      }
      break;
    }
    case 'play-showroom-video': {
      const videoUrl = button.getAttribute('data-video-url');
      const videoTitle = button.getAttribute('data-video-title') || 'Room Video Tour';
      if (videoUrl) {
        const normalizedVideoUrl = resolvePlayableVideoUrl(videoUrl);
        state.currentVideos = [{ url: normalizedVideoUrl, title: videoTitle }];
        state.currentVideoUrl = toYouTubeEmbedUrl(normalizedVideoUrl, true);
        state.videoModalOpen = true;
        render();
      }
      break;
    }
    case 'open-upload':
      state.upload.open = true;
      state.upload.editingId = null;
      state.upload.uploadError = null;
      render();
      break;
    case 'close-upload':
      state.upload.open = false;
      render();
      break;
    case 'delete-feedback': {
      const id = button.getAttribute('data-feedback-id');
      if (id) {
        state.feedbacks = state.feedbacks.filter((f) => f.id !== id);
        state.customer.feedbacks = state.customer.feedbacks.filter((f) => f.id !== id);
        persistState();
        render();
      }
      break;
    }
    case 'mark-all-read':
      state.inquiries = state.inquiries.map((inq) => ({ ...inq, isReadByAdmin: true }));
      persistState();
      render();
      break;
    case 'update-inquiry': {
      const id = button.getAttribute('data-inquiry-id');
      if (!id) return;
      const select = button as HTMLSelectElement;
      state.inquiries = state.inquiries.map((inq) => (inq.id === id ? { ...inq, status: select.value as Inquiry['status'] } : inq));
      persistState();
      render();
      break;
    }
    case 'edit-category': {
      const id = button.getAttribute('data-category-id');
      if (id) updateCategoryForm(id);
      break;
    }
    case 'delete-category': {
      const id = button.getAttribute('data-category-id');
      if (id && confirm('Delete this category?')) {
        (async () => {
          try {
            const resp = await apiFetch(`/categories/${encodeURIComponent(id)}`, {
              method: 'DELETE',
              headers: { ...getAuthHeaders() }
            });
            if (!resp.ok) throw new Error('Category delete failed');
          } catch (error) {
            console.warn('Category delete API failed, using local store:', error);
            deleteCategory(id);
          }
          await refreshCustomerData();
          render();
        })();
      }
      break;
    }
    case 'reset-category':
      state.admin.categoryForm = { title: '', description: '', image: '', background: '', status: 'active' };
      render();
      break;
    case 'set-category-background': {
      const background = state.admin.categoryForm.background || state.admin.categoryForm.image;
      if (!background) return;
      state.siteSettings = { ...state.siteSettings, heroBg: background };
      persistState();
      render();
      break;
    }
    case 'edit-design': {
      const id = button.getAttribute('data-design-id');
      if (id) {
        (state.admin as any).designEditOpen = true;
        const loaded = updateDesignForm(id);
        if (!loaded) {
          openAdminDesignEditor(id, null);
        }
        render();
      }
      break;
    }
    case 'open-design-editor': {
      const designId = button.getAttribute('data-design-id');
      const modelId = button.getAttribute('data-model-id');
      (state.admin as any).catalogPreviewId = null;
      (state.admin as any).catalogPreviewReturnModelId = '';
      openAdminDesignEditor(designId, modelId);
      (state.admin as any).designEditOpen = true;
      render();
      break;
    }
    case 'preview-catalog-design': {
      const id = button.getAttribute('data-model-id') || '';
      if (!id) break;
      (state.admin as any).catalogPreviewId = id;
      (state.admin as any).catalogPreviewReturnModelId = id;
      render();
      focusCatalogPreviewDialog();
      break;
    }
    case 'close-catalog-preview': {
      closeCatalogPreview(true);
      break;
    }
    case 'close-design-editor': {
      (state.admin as any).designEditOpen = false;
      render();
      break;
    }
    case 'delete-design': {
      const id = button.getAttribute('data-design-id');
      if (id && confirm('Delete this design?')) {
        deleteDesign(id);
        render();
      }
      break;
    }
    case 'reset-design':
      state.admin.designForm = {
        title: '',
        description: '',
        categoryId: '',
        price: 0,
        cost: 0,
        images: [],
        availabilityStatus: 'available',
        status: 'active'
      };
      render();
      break;
    case 'set-feedback-rating': {
      const rating = Number(button.getAttribute('data-rating') || 5);
      state.feedbackForm.rating = rating;
      render();
      break;
    }
    case 'update-booking': {
      const bookingId = button.getAttribute('data-booking-id');
      if (!bookingId) return;
      const select = button as HTMLSelectElement;
      const paymentStatus = select.value as Booking['paymentStatus'];
      const bookingSource = (state.admin.bookings && state.admin.bookings.length > 0) ? state.admin.bookings : state.customer.bookings;
      const booking = bookingSource.find((item) => item.id === bookingId) as any;
      const paymentId = booking?.paymentId;

      (async () => {
        try {
          if (paymentId) {
            const serverStatus = paymentStatus === 'paid' ? 'success' : paymentStatus;
            await apiFetch('/payments/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({ paymentId, status: serverStatus })
            });
            const bookingStatus = paymentStatus === 'paid' ? 'confirmed' : paymentStatus === 'failed' ? 'cancelled' : 'pending';
            await apiFetch('/bookings/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({ bookingId, status: bookingStatus })
            });
            await Promise.all([refreshCustomerData(), refreshAdminData()]);
            autoSyncPortfolioMetrics();
          } else {
            updateBooking(bookingId, { paymentStatus });
            autoSyncPortfolioMetrics();
          }
        } catch (error) {
          console.warn('Booking update API failed, using local store:', error);
          updateBooking(bookingId, { paymentStatus });
          autoSyncPortfolioMetrics();
        }
        render();
      })();
      break;
    }
    case 'view-booking': {
      const bookingId = button.getAttribute('data-booking-id');
      if (!bookingId) return;
      (state.admin as any).viewingBookingId = bookingId;
      render();
      break;
    }
    case 'approve-for-payment': {
      const bookingId = button.getAttribute('data-booking-id');
      if (!bookingId) return;
      if (isBookingActionPending(bookingId)) return;
      setBookingActionPending(bookingId, true);
      patchBookingStatusInState(bookingId, 'approved');
      render();

      (async () => {
        try {
          const resp = await apiFetch('/bookings/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ bookingId, status: 'approved' })
          });
          const data = await resp.json();
          if (data && data.success) {
            await refreshAdminData({ force: true });
            void refreshCustomerData({ silent: true });
            state.confirmMessage = 'Booking approved for payment.';
            setTimeout(() => updateAdminCharts(), 0);
          } else {
            throw new Error(data.message || 'Unknown error');
          }
        } catch (err) {
          console.error('[Booking] Approve-for-payment error:', err);
          patchBookingStatusInState(bookingId, 'pending');
          state.customer.paymentError = `Error approving payment: ${err instanceof Error ? err.message : 'Unknown error'}`;
        } finally {
          setBookingActionPending(bookingId, false);
          render();
        }
      })();
      break;
    }
    case 'approve-booking': {
      const bookingId = button.getAttribute('data-booking-id');
      if (!bookingId) return;
      if (isBookingActionPending(bookingId)) return;
      setBookingActionPending(bookingId, true);
      patchBookingStatusInState(bookingId, 'fulfilled');
      if (String((state.admin as any).viewingBookingId || '') === bookingId) {
        (state.admin as any).viewingBookingId = undefined;
      }
      render();

      (async () => {
        try {
          const resp = await apiFetch('/bookings/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ bookingId, status: 'fulfilled' })
          });
          const data = await resp.json();
          if (data && data.success) {
            console.log('[Booking] Approved:', bookingId);
            await refreshAdminData({ force: true });
            void refreshCustomerData({ silent: true });
            state.confirmMessage = 'Booking approved successfully.';
            setTimeout(() => updateAdminCharts(), 0);
          } else {
            throw new Error(data.message || 'Unknown error');
          }
        } catch (err) {
          console.error('[Booking] Approve error:', err);
          patchBookingStatusInState(bookingId, 'pending');
          state.customer.paymentError = `Error approving booking: ${err instanceof Error ? err.message : 'Unknown error'}`;
        } finally {
          setBookingActionPending(bookingId, false);
          render();
        }
      })();
      break;
    }
    case 'decline-booking': {
      const bookingId = button.getAttribute('data-booking-id');
      if (!bookingId) return;
      if (isBookingActionPending(bookingId)) return;
      setBookingActionPending(bookingId, true);
      patchBookingStatusInState(bookingId, 'cancelled');
      if (String((state.admin as any).viewingBookingId || '') === bookingId) {
        (state.admin as any).viewingBookingId = undefined;
      }
      render();

      (async () => {
        try {
          const resp = await apiFetch('/bookings/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ bookingId, status: 'cancelled' })
          });
          const data = await resp.json();
          if (data && data.success) {
            console.log('[Booking] Declined:', bookingId);
            await refreshAdminData({ force: true });
            void refreshCustomerData({ silent: true });
            state.confirmMessage = 'Booking declined successfully.';
            setTimeout(() => updateAdminCharts(), 0);
          } else {
            throw new Error(data.message || 'Unknown error');
          }
        } catch (err) {
          console.error('[Booking] Decline error:', err);
          patchBookingStatusInState(bookingId, 'pending');
          state.customer.paymentError = `Error declining booking: ${err instanceof Error ? err.message : 'Unknown error'}`;
        } finally {
          setBookingActionPending(bookingId, false);
          render();
        }
      })();
      break
    }
    case 'close-booking-view': {
      (state.admin as any).viewingBookingId = undefined;
      render();
      break;
    }
    case 'toggle-dark-mode': {
      state.theme = { ...state.theme, darkMode: !state.theme.darkMode };
      persistTheme(state.theme);
      localStorage.setItem('ar_interia_dark_mode', JSON.stringify(state.theme.darkMode));
      setThemeVars();
      if (state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
        setTimeout(() => {
          updateAdminCharts();
          void initAdminCharts();
        }, 0);
      }
      render();
      break;
    }
    case 'set-customer-category': {
      const category = button.getAttribute('data-category') || 'all';
      state.customer.activeCategory = category;
      applyCategoryBackground(category);
      render();
      break;
    }
    case 'select-customer-design': {
      const designId = button.getAttribute('data-design-id');
      if (designId) state.customer.selectedDesignId = designId;
      render();
      break;
    }
    case 'close-design-modal': {
      // Only close if we clicked the backdrop OR the explicit close button.
      // If we clicked something else inside the card, ignore it.
      const isCloseButton = (event.target as HTMLElement).closest('[data-action="close-design-modal"]');
      const clickedInsideCard = (event.target as HTMLElement).closest('[data-modal-inner="true"]');

      // If click was inside the card and NOT on the close button itself, ignore it
      if (clickedInsideCard && !isCloseButton) break;

      state.customer.selectedDesignId = null;
      state.customer.bookingMessage = '';
      state.customer.paymentError = '';
      render();
      break;
    }
    case 'like-design': {
      const designId = button.getAttribute('data-design-id');
      const value = button.getAttribute('data-like') as 'like' | 'dislike';
      if (!designId || !state.currentUser) return;

      const userId = state.currentUser.id;
      const design = getCustomerCategoryBackedDesigns().find((item) => item.id === designId)
        || state.customer.designs.find((item) => item.id === designId)
        || getDesigns().find((item: any) => item.id === designId);
      const isCurrentlyLiked = state.customer.likes.some(
        (like: any) => String(like.userId || '') === String(userId) && String(like.designId || '') === String(designId) && String(like.value || '') === 'like'
      );

      // Optimistic local state update with explicit semantics.
      if (value === 'like') {
        if (isCurrentlyLiked) {
          state.confirmMessage = 'Already liked';
          render();
          break;
        }
        state.customer.likes = setLike(userId, designId, 'like');
      } else {
        const feedbackText = prompt('Please share why you disliked this design:', '') || '';
        const normalizedFeedback = feedbackText.trim() || 'No additional comment provided.';

        if (isCurrentlyLiked) {
          state.customer.likes = state.customer.likes.filter(
            (like: any) => !(String(like.userId || '') === String(userId) && String(like.designId || '') === String(designId) && String(like.value || '') === 'like')
          );
        }
        state.customer.likes = setLike(userId, designId, 'dislike');

        const dislikeRecord = {
          id: `dislike-fb-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          userId,
          userName: state.currentUser.name,
          designId,
          designTitle: resolveDesignDisplayName(design as any, {
            imageUrl: (design as any)?.previewImage,
            categoryId: (design as any)?.categoryId,
            fallback: (design as any)?.title || 'Design'
          }),
          categoryId: String((design as any)?.categoryId || ''),
          comment: normalizedFeedback,
          adminReply: '',
          adminName: '',
          createdAt: new Date().toISOString(),
          respondedAt: ''
        };
        addDislikeFeedbackRecord(dislikeRecord);
      }
      render();

      // Server endpoint toggles: call only when actual state transition is needed.
      (async () => {
        try {
          if (value === 'like' || isCurrentlyLiked) {
            await apiFetch('/likes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({ userId, designId })
            });
          }
          await refreshCustomerData({ silent: true });
          if (state.currentUser?.role === 'admin') await refreshAdminData({ silent: true });
        } catch {
          // Keep local fallback state if server is unreachable.
        }
        render();
      })();
      break;
    }
    case 'remove-preference': {
      if (!state.currentUser) return;
      const packageId = button.getAttribute('data-package-id') || '';
      if (packageId) {
        removeCustomerPackagePreference(state.currentUser.id, packageId);
        render();
        break;
      }
      const designId = button.getAttribute('data-design-id') || '';
      if (!designId) break;
      const removedPreference = (state.customer.likes || []).find((like: any) => (
        String(like?.userId || '') === String(state.currentUser?.id || '')
        && String(like?.designId || '') === String(designId)
      ));
      state.customer.likes = removeCustomerPreference(state.currentUser.id, designId);
      render();
      (async () => {
        try {
          if (String(removedPreference?.value || '').toLowerCase() === 'like') {
            await apiFetch('/likes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({ userId: state.currentUser?.id, designId })
            });
          }
          await refreshCustomerData({ silent: true });
          if (state.currentUser?.role === 'admin') {
            await refreshAdminData({ silent: true });
            updateAdminCharts();
          }
        } catch {
          // Keep the optimistic local state if backend sync fails.
        }
      })();
      break;
    }
    case 'remove-booking': {
      if (!state.currentUser) return;
      const bookingId = button.getAttribute('data-booking-id') || '';
      if (!bookingId) break;
      const nextHidden = Array.from(new Set([...getHiddenBookingIds(), bookingId]));
      setHiddenBookingIds(nextHidden);
      state.customer.bookings = (state.customer.bookings || []).filter((booking: any) => String(booking?.id || '') !== bookingId);
      if (String((state.customer as any).bookingDetails?.bookingId || '') === bookingId) {
        (state.customer as any).bookingDetails = null;
      }
      state.confirmMessage = 'Booking removed from dashboard.';
      render();
      break;
    }
    case 'book-design': {
      const designId = button.getAttribute('data-design-id');
      if (designId) handleCustomerBooking(designId);
      break;
    }
    case 'book-ai-design': {
      const designId = button.getAttribute('data-design-id');
      const designName = button.getAttribute('data-design-name');
      const designPrice = parseInt(button.getAttribute('data-design-price') || '0');
      const designCategory = button.getAttribute('data-design-category');

      if (!designId || !state.currentUser) {
        state.customer.imagePreview = null;
        navigateTo('login');
        return;
      }

      (async () => {
        try {
          // Book the Design Studio design directly
          const bookingResp = await apiFetch('/bookings/book-design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: state.currentUser!.id,
              designId: designId,
              designName: designName,
              cost: designPrice
            })
          });

          if (!bookingResp.ok) {
            const error = await bookingResp.json();
            throw new Error(error.message || 'Booking failed');
          }

          const bookingData = await bookingResp.json();

          // Close the modal
          state.customer.imagePreview = null;

          await syncDashboardsAndInvoices({ silent: true });
          console.log('✅ AI design booking synced to customer/admin dashboards and charts');

          // Show success message and navigate to dashboard
          alert(`✅ Design booked successfully! Booking ID: ${bookingData.bookingId}\\n\\nEstimated Cost: ₹${designPrice.toLocaleString()}\\n\\nYou can view this booking in your dashboard.`);
          navigateTo('dashboard');
        } catch (error) {
          console.error('Booking error:', error);
          alert(`❌ Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })();
      break;
    }
    case 'book-design-only': {
      if (!state.currentUser) {
        state.loginForm.isSignup = false;
        state.activeTab = 'login';
        window.history.pushState({}, '', '/login');
        render();
        break;
      }
      const designId = button.getAttribute('data-design-id');
      if (designId) handleBookDesignOnly(designId);
      break;
    }
    case 'pay-and-book': {
      const designId = button.getAttribute('data-design-id');
      const bookingId = button.getAttribute('data-booking-id') || undefined;
      const booking = bookingId
        ? (state.customer.bookings || []).find((item: any) => String(item?.id || '') === String(bookingId))
        : null;
      if (booking && !isBookingApprovedForPayment(booking)) {
        state.customer.paymentError = 'Your booking is awaiting admin approval. Payment is enabled after approval.';
        render();
        break;
      }
      const discountState = (state.customer as any).paymentDiscount;
      const useDiscount = Boolean(discountState && bookingId && discountState.bookingId === bookingId);
      const amountOverride = booking ? getBookingAmount(booking) : undefined;
      const discountCode = useDiscount ? String(discountState.code || '') : undefined;
      const bookingContext = booking ? resolveBookingDesignContext(booking) : null;
      const targetDesignId = String(designId || bookingContext?.design?.id || '').trim();
      if (targetDesignId || bookingId) openFakeCardPayment(targetDesignId, {
        bookingId,
        amountOverride,
        discountCode
      });
      break;
    }

    case 'pay-with-razorpay': {
      state.customer.paymentError = 'Razorpay has been removed. Use card payment.';
      const designId = button.getAttribute('data-design-id') || '';
      const bookingId = button.getAttribute('data-booking-id') || undefined;
      const booking = bookingId
        ? (state.customer.bookings || []).find((item: any) => String(item?.id || '') === String(bookingId))
        : null;
      const bookingContext = booking ? resolveBookingDesignContext(booking) : null;
      const targetDesignId = String(designId || bookingContext?.design?.id || '').trim();
      if (targetDesignId || bookingId) {
        openFakeCardPayment(targetDesignId, {
          bookingId,
          amountOverride: booking ? getBookingAmount(booking) : undefined
        });
      }
      break;
    }

    case 'apply-discount-code': {
      const bookingId = button.getAttribute('data-booking-id') || '';
      const input = document.getElementById('booking-discount-code') as HTMLInputElement | null;
      const rawCode = input?.value || (state.customer as any).paymentDiscountCode || '';
      const details = (state.customer as any).bookingDetails;
      const baseAmount = Number(details?.amount || 0);
      applyDiscountCodeToBooking(bookingId, rawCode, baseAmount);
      render();
      break;
    }

    case 'apply-selected-offer': {
      const bookingId = button.getAttribute('data-booking-id') || '';
      const offerSelect = document.getElementById('booking-offer-select') as HTMLSelectElement | null;
      const selectedCode = String(offerSelect?.value || '').trim();
      const codeInput = document.getElementById('booking-discount-code') as HTMLInputElement | null;
      if (codeInput) codeInput.value = selectedCode;
      const details = (state.customer as any).bookingDetails;
      const baseAmount = Number(details?.amount || 0);
      applyDiscountCodeToBooking(bookingId, selectedCode, baseAmount);
      render();
      break;
    }

    case 'open-fake-payment': {
      const designId = button.getAttribute('data-design-id');
      const bookingId = button.getAttribute('data-booking-id') || undefined;
      const booking = bookingId
        ? (state.customer.bookings || []).find((item: any) => String(item?.id || '') === String(bookingId))
        : null;
      const discountState = (state.customer as any).paymentDiscount;
      const useDiscount = Boolean(discountState && bookingId && discountState.bookingId === bookingId);
      const amountOverride = booking ? getBookingAmount(booking) : undefined;
      const discountCode = useDiscount ? String(discountState.code || '') : undefined;
      if (designId) openFakeCardPayment(designId, {
        bookingId,
        amountOverride,
        discountCode
      });
      break;
    }

    case 'filter-dashboard-category': {
      const categoryId = button.getAttribute('data-category-id') || 'all';
      state.customer.activeCategory = categoryId;
      if (categoryId && categoryId !== 'all') ensureDesignsForCategory(categoryId);
      render();
      break;
    }

    case 'quick-pay': {
      const designId = button.getAttribute('data-design-id');
      if (designId && state.currentUser) {
        void handleBookDesignOnly(designId);
        state.confirmMessage = 'Booking submitted. Wait for admin approval, then use Pay Now from your bookings.';
        render();
      }
      break;
    }

    case 'dismiss-payment-success': {
      (state.customer as any).paymentSuccessData = undefined;
      state.customer.bookingMessage = '';
      updateAdminCharts();
      render();
      break;
    }

    case 'cancel-fake-payment': {
      (state.customer as any).fakePayment = undefined;
      state.customer.paymentError = '';
      render();
      break;
    }
    case 'submit-fake-payment': {
      const form = document.querySelector('form[data-form="fake-payment"]') as HTMLFormElement | null;
      if (form) {
        const formData = new FormData(form);
        const cardNumber = String(formData.get('cardNumber') || '').trim();
        const cvv = String(formData.get('cvv') || '').trim();
        const name = String(formData.get('name') || '').trim();
        void submitCardPaymentWithProvider(cardNumber, cvv, name);
      }
      break;
    }
    case 'open-3d-view': {
      const designId = button.getAttribute('data-design-id');
      if (designId) handleOpen3DView(designId);
      break;
    }
    case 'close-3d-view': {
      handleClose3DView();
      break;
    }
    case 'open-3d-view-image': {
      const url = button.getAttribute('data-image-url');
      if (url) handleOpen3DViewImage(url);
      break;
    }
    case 'open-booked-design': {
      const designId = button.getAttribute('data-design-id');
      if (!designId) return;
      const design = state.customer.designs.find((d) => d.id === designId) || getDesigns().find((d) => d.id === designId);

      if (design) {
        state.customer.selectedDesignId = designId;
        state.selectedModelId = designId;
        state.customer.activeCategory = design.categoryId || 'all';
        state.customer.galleryCategoryId = design.categoryId || 'all';

        const previewUrl = design.previewImage || (design.images && design.images[0]) || '';
        if (previewUrl) {
          const categoryLabel =
            (state.customer.categories || []).find((cat) => cat.id === (design.categoryId || ''))?.title ||
            (state.customer.categories || []).find((cat) => cat.id === (design.categoryId || ''))?.name ||
            design.category ||
            'Booked Design';

          state.customer.imagePreview = {
            url: previewUrl,
            name: resolveDesignDisplayName(design, {
              imageUrl: previewUrl,
              categoryId: design.categoryId,
              fallback: 'Booked Design'
            }),
            cost: getDesignAmount(design),
            categoryName: categoryLabel,
            designId: design.id || null
          };
          renderStabilized();
          break;
        }
      }

      // Fallback for AI variant bookings (designId may be variant id)
      const aiRecord = (state.customer.aiDesigns || []).find((record) =>
        (record.variants || []).some((variant) => variant.id === designId)
      );
      const aiVariant = aiRecord?.variants?.find((variant) => variant.id === designId) as any;
      if (aiVariant?.image) {
        state.customer.imagePreview = {
          url: aiVariant.image,
          name: aiVariant.title || 'AI Booked Design',
          cost: aiVariant.price ?? null,
          categoryName: aiVariant.categoryName || 'AI Design Studio',
          designId: designId,
          isAIStudio: true
        };
        renderStabilized();
        break;
      }

      // Booking fallback: always show what user booked, even when design catalog lookup misses
      const booking = (state.customer.bookings || []).find((item: any) => String(item.designId || '') === designId) as any;
      if (booking) {
        const byName = (state.customer.designs || []).find((item: any) =>
          String(item.title || '').toLowerCase() === String(booking.designName || '').toLowerCase()
        );
        const fallbackImage =
          byName?.previewImage ||
          (byName?.images && byName.images[0]) ||
          '/hero-bg.webp';

        state.customer.imagePreview = {
          url: fallbackImage,
          name: resolveDesignDisplayName(byName, {
            imageUrl: fallbackImage,
            categoryId: byName?.categoryId,
            fallback: booking.designName || 'Booked Design'
          }),
          cost: booking.price ?? byName?.price ?? null,
          categoryName: byName?.category || 'Booked Design',
          designId: byName?.id || null
        };
        renderStabilized();
        break;
      }

      // Final fallback: open gallery with selected design id
      state.customer.selectedDesignId = designId;
      state.selectedModelId = designId;
      navigateTo('gallery');
      break;
    }
    case 'open-booking-details': {
      const bookingId = button.getAttribute('data-booking-id');
      if (!bookingId) return;
      if (!openCustomerBookingDetails(bookingId)) return;
      render();
      break;
    }
    case 'use-announcement-discount': {
      const codeValue = normalizePromoCode(button.getAttribute('data-discount-code') || '');
      const bookingId = String(button.getAttribute('data-booking-id') || '').trim();
      if (!codeValue) return;

      if (!bookingId) {
        (state.customer as any).paymentDiscountCode = codeValue;
        state.customer.paymentError = '';
        state.confirmMessage = `Code ${codeValue} saved. Open an approved booking payment to apply it.`;
        render();
        break;
      }

      if (!openCustomerBookingDetails(bookingId)) {
        (state.customer as any).paymentDiscountCode = codeValue;
        state.customer.paymentError = '';
        state.confirmMessage = `Code ${codeValue} saved. Open a booking payment to apply it.`;
        render();
        break;
      }

      const details = (state.customer as any).bookingDetails;
      applyDiscountCodeToBooking(bookingId, codeValue, Number(details?.amount || 0));
      render();
      break;
    }
    case 'close-booking-details': {
      (state.customer as any).bookingDetails = null;
      (state.customer as any).paymentDiscount = undefined;
      (state.customer as any).paymentDiscountCode = '';
      render();
      break;
    }
    case 'admin-image-to-design': {
      if (state.currentUser?.role !== 'admin') return;
      const imageUrl = button.getAttribute('data-image-url') || '';
      const imageName = button.getAttribute('data-image-name') || '';
      const categoryId = button.getAttribute('data-category-id') || '';
      const categoryName = button.getAttribute('data-category-name') || '';
      const designId = button.getAttribute('data-design-id') || '';
      let resolvedCategoryId = categoryId;
      if (!resolvedCategoryId && categoryName) {
        const match = getCategories().find((cat) => (cat.title || cat.name || '').toLowerCase() === categoryName.toLowerCase());
        if (match) resolvedCategoryId = match.id;
      }
      if (designId) {
        (state.admin as any).designEditOpen = true;
        updateDesignForm(designId);
        if (imageUrl) {
          state.admin.designForm.images = [imageUrl];
        }
      } else {
        const titleFromName = imageName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
        state.admin.designForm = {
          id: undefined,
          title: titleFromName || 'New Design',
          description: '',
          categoryId: resolvedCategoryId,
          price: 0,
          images: imageUrl ? [imageUrl] : [],
          availabilityStatus: 'available',
          status: 'active'
        };
      }
      state.admin.focusSection = 'designs';
      navigateTo('admin');
      break;
    }
    case 'reply-inquiry': {
      if (state.currentUser?.role !== 'admin') return;
      const inquiryId = button.getAttribute('data-inquiry-id');
      if (!inquiryId) return;

      const inquiry = state.inquiries.find(i => i.id === inquiryId);
      const reply = prompt('Enter your reply:', (inquiry as any)?.adminReply || '');
      if (reply === null) return; // User cancelled

      (async () => {
        try {
          const response = await apiFetch(`/enquiries/${inquiryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ adminReply: reply, status: 'contacted' })
          });
          if (!response.ok) throw new Error('Failed to send reply');
          await refreshAdminData();
        } catch (e) {
          alert('Error sending reply. The API endpoint might not be available. Replying locally for this session.');
          if (inquiry) { (inquiry as any).adminReply = reply; inquiry.status = 'contacted'; render(); }
        }
      })();
      break;
    }
    case 'insert-emoji': {
      const targetName = button.getAttribute('data-target');
      const emoji = button.getAttribute('data-emoji');
      if (!targetName || !emoji) return;

      const form = button.closest('form');
      if (!form) return;

      const input = form.querySelector(`[name="${targetName}"]`) as HTMLInputElement | HTMLTextAreaElement;
      if (input) {
        const start = input.selectionStart || input.value.length;
        const end = input.selectionEnd || input.value.length;
        const text = input.value;
        const newValue = text.substring(0, start) + emoji + text.substring(end);
        input.value = newValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        const newCursorPos = start + emoji.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
      break;
    }
    // ===== CHATBOT ACTIONS =====
    case 'toggle-chat': {
      state.chatbot.isOpen = !state.chatbot.isOpen;
      // When opening from not-open, clear unread notifications/styles if needed
      mountChatbot();
      break;
    }
    case 'chat-quick-reply': {
      const reply = button.getAttribute('data-reply');
      if (!reply) return;

      const actualAction = getQuickAction(reply);
      // Directly send message
      state.chatbot.messages.push(createMessage('user', actualAction));
      state.chatbot.isTyping = true;
      mountChatbot();

      setTimeout(() => {
        const response = getEnhancedChatbotResponse(actualAction);
        trackChatbotMessageStats(response);
        recordChatbotHistory(actualAction, response.text);
        state.chatbot.messages.push(createMessage('bot', response.text, response.quickReplies));
        state.chatbot.isTyping = false;
        mountChatbot();
        handleChatNavigationIntent(actualAction);
      }, 700 + Math.random() * 400);
      break;
    }
    case 'clear-chat': {
      if (confirm('Clear chat history?')) {
        resetChatbotMessages();
        mountChatbot();
      }
      break;
    }
    case 'chatbot-tab': {
      const tab = button.getAttribute('data-tab') as 'chat' | 'activity' | null;
      if (tab) {
        state.chatbot.activeTab = tab;
        mountChatbot();
      }
      break;
    }
    case 'chatbot-activity-feedback': {
      state.chatbot.activeTab = 'chat';
      state.chatbot.feedbackStep = 'awaiting-rating';
      state.chatbot.messages.push(createMessage('bot',
        `⭐ **We'd love your feedback!**\n\nHow would you rate your overall experience with AR Interia?\n\n_1 = Poor · 5 = Excellent_`,
        ['1 ⭐ Poor', '2 ⭐⭐ Fair', '3 ⭐⭐⭐ Good', '4 ⭐⭐⭐⭐ Great', '5 ⭐⭐⭐⭐⭐ Excellent']
      ));
      mountChatbot();
      break;
    }
    case 'reset-chatbot-settings': {
      if (state.currentUser?.role !== 'admin') return;
      chatbotSettingsState = { ...DEFAULT_CHATBOT_SETTINGS };
      chatbotStatsState = { ...DEFAULT_CHATBOT_STATS };
      chatbotHistoryState = [];
      persistChatbotSettings();
      persistChatbotStats();
      persistChatbotHistory();
      resetChatbotMessages();
      mountChatbot();
      state.confirmMessage = 'Chatbot settings reset to defaults.';
      render();
      break;
    }
    case 'clear-announcement-form': {
      if (state.currentUser?.role !== 'admin') return;
      state.admin.announcementForm = { id: '', title: '', message: '', startDate: '', endDate: '', active: true, location: 'both' };
      const form = document.querySelector('form[data-form="announcement-form"]') as HTMLFormElement | null;
      if (form) {
        form.reset();
        const idField = form.querySelector('input[name="id"]');
        if (idField) (idField as HTMLInputElement).value = '';
      }
      render();
      break;
    }
    case 'reset-announcement': {
      if (state.currentUser?.role !== 'admin') return;
      state.admin.announcementForm = { id: '', title: '', message: '', startDate: '', endDate: '', active: true, location: 'both' };
      render();
      break;
    }
    case 'edit-announcement': {
      if (state.currentUser?.role !== 'admin') return;
      const id = button.getAttribute('data-id');
      if (!id) return;
      const announcement = state.announcements.find((a: any) => a.id === id);
      if (!announcement) return;
      const location = announcement.location;
      const normalizedLocation = (
        location === 'both'
        || location === 'homepage'
        || location === 'dashboard'
        || location === 'top_bar'
        || location === 'modal'
      ) ? location : 'both';

      state.admin.announcementForm = {
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        startDate: String(announcement.startDate || ''),
        endDate: String(announcement.endDate || ''),
        active: Boolean(announcement.active),
        location: normalizedLocation
      };

      const form = document.querySelector('form[data-form="announcement-form"]') as HTMLFormElement | null;
      if (form) {
        const idField = form.querySelector('input[name="id"]') as HTMLInputElement | null;
        if (idField) idField.value = announcement.id;
      }
      render();
      break;
    }
    case 'delete-announcement': {
      if (state.currentUser?.role !== 'admin') return;
      const id = button.getAttribute('data-id');
      if (!id || !confirm('Delete this announcement?')) return;
      deleteAnnouncement(id);
      state.announcements = getAnnouncements();
      persistState();
      render();
      break;
    }

    case 'delete-discount-code': {
      if (state.currentUser?.role !== 'admin') return;
      const id = button.getAttribute('data-id');
      if (!id || !confirm('Delete this discount code?')) return;
      deleteDiscountCode(id);
      state.confirmMessage = 'Discount code deleted.';
      render();
      break;
    }

    case 'toggle-discount-code': {
      if (state.currentUser?.role !== 'admin') return;
      const id = button.getAttribute('data-id');
      if (!id) return;
      const item = getDiscountCodes().find((code: any) => String(code.id) === String(id));
      if (!item) return;
      updateDiscountCode(id, { active: !item.active });
      state.confirmMessage = !item.active ? 'Discount code enabled.' : 'Discount code disabled.';
      render();
      break;
    }
    case 'clear-package-form': {
      if (state.currentUser?.role !== 'admin') return;
      state.admin.packageForm = {
        id: '',
        name: '',
        subtitle: '',
        category: 'Full Home',
        originalPrice: 0,
        discountedPrice: 0,
        features: [],
        description: '',
        image: '',
        type: 'Standard',
        rooms: []
      };
      const form = document.querySelector('form[data-form="package-form"]') as HTMLFormElement | null;
      if (form) {
        form.reset();
        const idField = form.querySelector('input[name="id"]') as HTMLInputElement | null;
        if (idField) idField.value = '';
      }
      render();
      break;
    }
    case 'reset-package': {
      if (state.currentUser?.role !== 'admin') return;
      state.admin.packageForm = {
        id: '',
        name: '',
        subtitle: '',
        category: 'Full Home',
        originalPrice: 0,
        discountedPrice: 0,
        features: [],
        description: '',
        image: '',
        type: 'Standard',
        rooms: []
      };
      render();
      break;
    }
    case 'edit-package': {
      if (state.currentUser?.role !== 'admin') return;
      const id = button.getAttribute('data-id');
      if (!id) return;
      const pkg = getPackagesSync().find((p: any) => p.id === id);
      if (!pkg) return;

      loadPackageIntoAdminForm(pkg);

      const form = document.querySelector('form[data-form="package-form"]') as HTMLFormElement | null;
      if (form) {
        const idField = form.querySelector('input[name="id"]') as HTMLInputElement | null;
        if (idField) idField.value = pkg.id;
      }
      render();
      break;
    }
    case 'admin-load-selected-package': {
      if (state.currentUser?.role !== 'admin') return;
      const select = document.getElementById('admin-package-select') as HTMLSelectElement | null;
      const selectedId = String(select?.value || '').trim();
      if (!selectedId) {
        state.confirmMessage = 'Please select a package to load.';
        render();
        break;
      }
      const pkg = getPackagesSync().find((item: any) => String(item.id || '') === selectedId);
      if (!pkg) {
        state.confirmMessage = 'Selected package could not be found.';
        render();
        break;
      }
      loadPackageIntoAdminForm(pkg);
      state.confirmMessage = `Loaded package: ${pkg.name || selectedId}`;
      render();
      break;
    }
    case 'admin-clear-package-cache': {
      if (state.currentUser?.role !== 'admin') return;
      localStorage.removeItem(STORAGE_KEYS.packages);
      localStorage.removeItem('ar_interia_packages_v1');
      localStorage.removeItem('ar_interia_packages_v2');
      localStorage.removeItem('ar_interia_designs_v2');
      localStorage.removeItem(PACKAGE_PREFERENCES_KEY);
      localStorage.removeItem(PACKAGE_CACHE_RESET_VERSION_KEY);

      purgeLegacyPackageCaches();

      try {
        await getPackages();
      } catch (error) {
        console.warn('Package cache refresh failed after clear:', error);
      }

      state.confirmMessage = 'Package cache cleared. Fresh package data loaded.';
      render();
      break;
    }
    case 'delete-package': {
      if (state.currentUser?.role !== 'admin') return;
      const id = button.getAttribute('data-id');
      if (!id || !confirm('Delete this package?')) return;
      deletePackage(id);
      render();
      break;
    }

    case 'set-customer-rating': {
      const rating = Number(button.getAttribute('data-rating') || 5);
      state.customer.rating = rating;
      render();
      break;
    }
    case 'submit-customer-feedback':
      handleCustomerFeedback();
      break;
    case 'respond-dislike-feedback': {
      if (state.currentUser?.role !== 'admin') return;
      const feedbackId = button.getAttribute('data-feedback-id') || '';
      if (!feedbackId) break;
      const existing = getDislikeFeedbackRecords().find((item: any) => String(item.id || '') === String(feedbackId));
      const draft = prompt('Enter response for this customer feedback:', String(existing?.adminReply || '')) || '';
      const reply = draft.trim();
      if (!reply) break;
      updateDislikeFeedbackReply(feedbackId, reply, state.currentUser?.name || 'Admin');
      state.confirmMessage = 'Response saved and shared with customer.';
      render();
      break;
    }
    case 'edit-dislike-feedback': {
      if (!state.currentUser || state.currentUser.role !== 'customer') return;
      const designId = button.getAttribute('data-design-id') || '';
      if (!designId) break;
      const records = getDislikeFeedbackRecords();
      const existing = records
        .filter((item: any) => String(item.userId || '') === String(state.currentUser?.id || '') && String(item.designId || '') === String(designId))
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
      const draft = prompt('Update your feedback for this disliked design:', String(existing?.comment || '')) || '';
      const comment = draft.trim();
      if (!comment) break;
      if (existing?.id) {
        const all = records.map((item: any) => String(item.id || '') === String(existing.id)
          ? { ...item, comment, createdAt: new Date().toISOString() }
          : item);
        setDislikeFeedbackRecords(all);
      } else {
        const design = getCustomerCategoryBackedDesigns().find((item) => String(item.id || '') === String(designId));
        addDislikeFeedbackRecord({
          id: `dislike-fb-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          designId,
          designTitle: resolveDesignDisplayName(design as any, { imageUrl: (design as any)?.previewImage, categoryId: (design as any)?.categoryId, fallback: (design as any)?.title || 'Design' }),
          categoryId: String((design as any)?.categoryId || ''),
          comment,
          adminReply: '',
          adminName: '',
          createdAt: new Date().toISOString(),
          respondedAt: ''
        });
      }
      state.confirmMessage = 'Feedback updated.';
      render();
      break;
    }
    case 'delete-catalog': {
      const id = button.getAttribute('data-model-id');
      if (!id) break;
      const design = state.customer.designs.find((item) => item.id === id)
        || getDesigns().find((item) => item.id === id)
        || state.catalog.find((item) => item.id === id);
      (state.admin as any).catalogActionDialog = {
        mode: 'delete',
        id,
        title: String(design?.title || 'Selected design')
      };
      render();
      break;
    }
    case 'archive-catalog': {
      const id = button.getAttribute('data-model-id');
      if (!id) break;
      const design = state.customer.designs.find((item) => item.id === id)
        || getDesigns().find((item) => item.id === id)
        || state.catalog.find((item) => item.id === id);
      (state.admin as any).catalogActionDialog = {
        mode: 'archive',
        id,
        title: String(design?.title || 'Selected design')
      };
      render();
      break;
    }
    case 'cancel-catalog-action': {
      (state.admin as any).catalogActionDialog = null;
      render();
      break;
    }
    case 'confirm-catalog-action': {
      const dialogState = (state.admin as any).catalogActionDialog as { mode: 'archive' | 'delete'; id: string } | null;
      if (!dialogState?.id) {
        (state.admin as any).catalogActionDialog = null;
        render();
        break;
      }

      (state.admin as any).catalogActionDialog = null;

      if (dialogState.mode === 'archive') {
        await handleArchiveCatalogModel(dialogState.id);
        state.confirmMessage = 'Design archived successfully.';
      } else {
        await handleDeleteCatalogModel(dialogState.id, false);
        state.confirmMessage = 'Design deleted successfully.';
      }
      render();
      break;
    }
    case 'restore-catalog': {
      const id = button.getAttribute('data-model-id');
      if (id) {
        state.catalog = state.catalog.map((m) => (m.id === id ? { ...m, isDeleted: false } : m));
        persistState();
        render();
      }
      break;
    }
    case 'edit-catalog': {
      const id = button.getAttribute('data-model-id');
      if (id) openAdminDesignEditor(null, id);
      break;
    }
    case 'admin-load-catalog-category': {
      const select = document.getElementById('admin-catalog-filter') as HTMLSelectElement | null;
      const categoryId = state.admin.catalogFilterDraft || select?.value || state.admin.catalogFilter || 'all';
      ensureDesignsForCategory(categoryId);
      state.admin.catalogFilter = categoryId;
      state.admin.catalogFilterDraft = categoryId;
      if (categoryId === 'all') {
        state.admin.loadedCategory = undefined;
        render();
        break;
      }

      const category = (state.customer.categories || []).find((cat) => cat.id === categoryId)
        || getCategories().find((cat) => cat.id === categoryId);
      const categoryName = category?.title || category?.name || categoryId;
      const localImages = Array.isArray(category?.images) ? category.images : [];

      if (localImages.length > 0) {
        state.admin.loadedCategory = {
          id: categoryId,
          title: categoryName,
          images: localImages.map((image: any, index: number) => ({
            url: image.url,
            name: image.name,
            categoryId,
            categoryName,
            index
          }))
        };
        render();
        break;
      }

      try {
        const response = await apiFetch(`/categories/${encodeURIComponent(categoryName)}`);
        const data = await response.json().catch(() => ({} as any));
        const apiImages = Array.isArray(data?.images) ? data.images : [];
        state.admin.loadedCategory = {
          id: categoryId,
          title: categoryName,
          images: apiImages.map((image: any, index: number) => ({
            url: image.url,
            name: image.name,
            categoryId,
            categoryName,
            index
          }))
        };
      } catch (error) {
        state.admin.loadedCategory = {
          id: categoryId,
          title: categoryName,
          images: []
        };
      }
      render();
      break;
    }
    case 'admin-load-catalog-all': {
      ensureDesignsForAllCategories();
      state.admin.catalogFilter = 'all';
      state.admin.catalogFilterDraft = 'all';
      state.admin.loadedCategory = undefined;
      render();
      break;
    }
    case 'admin-load-package-category': {
      const select = document.getElementById('admin-package-filter') as HTMLSelectElement | null;
      const categoryName = state.admin.packageCategoryFilterDraft || select?.value || state.admin.packageCategoryFilter || 'all';
      state.admin.packageCategoryFilter = categoryName;
      state.admin.packageCategoryFilterDraft = categoryName;
      render();
      break;
    }
    case 'admin-load-package-all': {
      state.admin.packageCategoryFilter = 'all';
      state.admin.packageCategoryFilterDraft = 'all';
      render();
      break;
    }
    case 'admin-load-design-category': {
      const adminAny = state.admin as any;
      const select = document.getElementById('admin-design-filter') as HTMLSelectElement | null;
      const categoryId = adminAny.designCategoryFilterDraft || select?.value || adminAny.designCategoryFilter || 'all';
      ensureDesignsForCategory(categoryId);
      adminAny.designCategoryFilter = categoryId;
      adminAny.designCategoryFilterDraft = categoryId;
      render();
      break;
    }
    case 'admin-load-design-all': {
      const adminAny = state.admin as any;
      adminAny.designCategoryFilter = 'all';
      adminAny.designCategoryFilterDraft = 'all';
      render();
      break;
    }
    case 'admin-load-designs-for-category': {
      const categoryId = button.getAttribute('data-category-id') || 'all';
      const adminAny = state.admin as any;
      ensureDesignsForCategory(categoryId);
      adminAny.designCategoryFilter = categoryId;
      adminAny.designCategoryFilterDraft = categoryId;
      render();
      break;
    }
    default:
      break;
  }
  } finally {
    const actionDuration = perfNow() - actionStartedAt;
    const shouldLog = actionDuration >= 10 && (
      state.activeTab === 'admin'
      || action.startsWith('admin-')
      || action.startsWith('edit-')
      || action === 'open-design-editor'
      || action === 'view-booking'
      || action === 'view-customer'
    );
    if (shouldLog) {
      logPerfMetric(`action:${action}`, actionDuration, {
        activeTab: state.activeTab,
        role: state.currentUser?.role || 'guest'
      });
    }
  }
});

// --- Frontend input bindings (UI/state wiring only) -------------------------
root.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const bind = target.getAttribute('data-bind');

  const action = target.getAttribute('data-action');
  if (action === 'theme-update') {
    const key = target.getAttribute('data-theme-key') as keyof SiteTheme;
    state.theme = { ...state.theme, [key]: target.value };
    persistTheme(state.theme);
    setThemeVars();
    return;
  }

  if (!bind) return;
  const value = target instanceof HTMLInputElement && target.type === 'checkbox'
    ? (target.checked as any)
    : target.value;

  switch (bind) {
    case 'searchQuery':
      state.searchQuery = value;
      render();
      break;
    case 'smartPrompt':
      state.smartPrompt = value;
      break;
    case 'smartStudio.prompt':
      state.smartStudio.prompt = value;
      break;
    case 'smartStudio.room':
      state.smartStudio.room = value as RoomCategory;
      // Clear variants when room type changes
      state.smartStudio.variants = [];
      render();
      break;
    case 'feedbackForm.name':
      state.feedbackForm.name = value;
      break;
    case 'feedbackForm.comment':
      state.feedbackForm.comment = value;
      break;
    case 'inquiryForm.name':
      state.inquiryForm.name = value;
      break;
    case 'inquiryForm.email':
      state.inquiryForm.email = value;
      break;
    case 'inquiryForm.message':
      state.inquiryForm.message = value;
      break;
    case 'admin.bookingFilter.query':
      state.admin.bookingFilter.query = value;
      render();
      break;
    case 'admin.bookingFilter.dateFrom':
      state.admin.bookingFilter.dateFrom = value;
      render();
      break;
    case 'admin.bookingFilter.dateTo':
      state.admin.bookingFilter.dateTo = value;
      render();
      break;
    case 'admin.invoiceFilter.query':
      state.admin.invoiceFilter.query = value;
      render();
      break;
    case 'customer.searchQuery':
      state.customer.searchQuery = value;
      render();
      break;
    case 'customer.portfolioSearchQuery':
      state.customer.portfolioSearchQuery = value;
      render();
      break;
    case 'customer.feedbackText':
      state.customer.feedbackText = value;
      break;
    case 'loginForm.email':
      state.loginForm.email = value;
      break;
    case 'loginForm.password':
      state.loginForm.password = value;
      break;
    case 'loginForm.twoFactorCode':
      state.loginForm.twoFactorCode = value;
      break;
    default:
      if (bind.startsWith('portfolioContent.')) {
        updatePortfolioContentField(bind, value);
        render();
      }
      break;
  }

  // Handle room updates which use data-action instead of data-bind in our current logic
  if (action === 'update-package-room') {
    const idx = parseInt(target.getAttribute('data-index') || '-1');
    const field = target.getAttribute('data-field');
    if (idx >= 0 && field && state.admin.packageForm.rooms) {
      (state.admin.packageForm.rooms[idx] as any)[field] = value;
      // No render() here to keep focus
    }
  }
});

document.addEventListener('keydown', (event) => {
  const previewId = String((state.admin as any).catalogPreviewId || '').trim();
  if (!previewId) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeCatalogPreview(true);
    return;
  }

  if (event.key !== 'Tab') return;
  const modal = root.querySelector('[data-catalog-preview-modal="true"]') as HTMLElement | null;
  if (!modal) return;

  const focusables = Array.from(modal.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && (el.offsetParent !== null || el === document.activeElement));

  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey && (active === first || !active || !modal.contains(active))) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && (active === last || !active || !modal.contains(active))) {
    event.preventDefault();
    first.focus();
  }
});

root.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;

  if (target instanceof HTMLSelectElement && target.id === 'admin-catalog-filter') {
    const nextValue = target.value || 'all';
    state.admin.catalogFilterDraft = nextValue;
    state.admin.catalogFilter = nextValue;
    render();
    return;
  }

  if (target instanceof HTMLSelectElement && target.id === 'admin-package-filter') {
    const nextValue = target.value || 'all';
    state.admin.packageCategoryFilterDraft = nextValue;
    state.admin.packageCategoryFilter = nextValue;
    render();
    return;
  }

  if (target instanceof HTMLSelectElement && target.id === 'admin-package-select') {
    const selectedId = String(target.value || '').trim();
    if (!selectedId) return;
    const pkg = getPackagesSync().find((item: any) => String(item.id || '') === selectedId);
    if (!pkg) return;
    loadPackageIntoAdminForm(pkg);
    state.confirmMessage = `Loaded package: ${pkg.name || selectedId}`;
    render();
    return;
  }

  if (target instanceof HTMLSelectElement && target.id === 'admin-design-filter') {
    const adminAny = state.admin as any;
    const nextValue = target.value || 'all';
    adminAny.designCategoryFilterDraft = nextValue;
    adminAny.designCategoryFilter = nextValue;
    render();
    return;
  }

  if (target instanceof HTMLInputElement && target.type === 'file') {
    const form = target.closest('form');
    if (target.getAttribute('data-action') === 'upload-admin-customer-photo') {
      const file = target.files?.[0];
      const customerId = String(target.getAttribute('data-customer-id') || '').trim();
      if (!file || !customerId || state.currentUser?.role !== 'admin') return;
      try {
        const localPath = await fileToDataUrl(file);
        const existingCustomer = state.users.find((user) => String(user.id || '') === customerId);
        if (!existingCustomer) return;
        const updatedCustomer = mergeUserProfileFields({
          ...existingCustomer,
          profilePhoto: localPath
        } as User, existingCustomer);
        upsertUserInState(updatedCustomer);
        state.confirmMessage = 'Customer profile photo updated locally.';
        persistState();
      } catch (error) {
        console.error('Failed to upload admin customer photo locally:', error);
        state.confirmMessage = 'Failed to update customer photo.';
      }
      render();
      return;
    }

    if (target.getAttribute('data-action') === 'upload-customer-profile-photo') {
      const file = target.files?.[0];
      if (!file || !state.currentUser) return;
      try {
        const localPath = await fileToDataUrl(file);
        const updatedUser = mergeUserProfileFields({ ...state.currentUser, profilePhoto: localPath } as User, state.currentUser);
        upsertUserInState(updatedUser);
        state.currentUser = updatedUser;
        state.confirmMessage = 'Profile picture updated.';
        persistState();
      } catch (error) {
        console.error('Failed to upload profile photo locally:', error);
        state.confirmMessage = 'Failed to update profile picture.';
      }
      render();
      return;
    }

    if (target.name === 'aiImage') {
      const file = target.files?.[0];
      state.smartStudio.error = '';
      state.smartStudio.variants = [];
      if (file) {
        state.smartStudio.originalImage = await fileToDataUrl(file);
      } else {
        state.smartStudio.originalImage = null;
      }
      render();
      return;
    }

    const action = target.getAttribute('data-action');
    if (action === 'upload-portfolio-image' || action === 'upload-portfolio-video') {
      const targetField = target.getAttribute('data-target');
      const indexStr = target.getAttribute('data-index');
      const file = target.files?.[0];
      if (file) {
        let filePath = '';
        try {
          const formData = new FormData();
          formData.append('file', file);
          const resp = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
            headers: state.currentUser?.token ? { 'Authorization': `Bearer ${state.currentUser.token}` } : {}
          });
          if (resp.ok) {
            const data = await resp.json();
            filePath = String(data.path || '');
          }
          if (!filePath) {
            filePath = await fileToDataUrl(file);
          }

          if (targetField === 'founder') {
            state.portfolioContent.founder.photo = filePath;
          } else if (targetField === 'coFounder') {
            state.portfolioContent.coFounder.photo = filePath;
          } else if (targetField === 'designer' && indexStr) {
            const idx = parseInt(indexStr);
            if (state.portfolioContent.designers[idx]) {
              state.portfolioContent.designers[idx].photo = filePath;
            }
          } else if (action === 'upload-portfolio-video' && indexStr) {
            const idx = parseInt(indexStr);
            if (state.portfolioContent.feedbackVideos[idx]) {
              state.portfolioContent.feedbackVideos[idx].url = filePath;
            }
          }
        } catch (e) {
          console.error('Failed to upload portfolio static asset:', e);
          try {
            const localPath = await fileToDataUrl(file);
            if (targetField === 'founder') {
              state.portfolioContent.founder.photo = localPath;
            } else if (targetField === 'coFounder') {
              state.portfolioContent.coFounder.photo = localPath;
            } else if (targetField === 'designer' && indexStr) {
              const idx = parseInt(indexStr);
              if (state.portfolioContent.designers[idx]) {
                state.portfolioContent.designers[idx].photo = localPath;
              }
            } else if (action === 'upload-portfolio-video' && indexStr) {
              const idx = parseInt(indexStr);
              if (state.portfolioContent.feedbackVideos[idx]) {
                state.portfolioContent.feedbackVideos[idx].url = localPath;
              }
            }
          } catch (localError) {
            console.error('Local fallback upload failed:', localError);
            alert('Upload failed.');
          }
        }
        render();
      }
      return;
    }

    if (action === 'upload-showroom-media') {
      const id = target.getAttribute('data-id');
      const file = target.files?.[0];
      if (!file || !id) return;

      state.confirmMessage = 'Uploading showroom media...';
      render();

      (async () => {
        try {
          const fileId = `showroom-media-${id}-${Date.now()}`;
          await saveFile(fileId, file);
          const url = await getFileUrl(fileId) || '';
          const isVideo = file.type.startsWith('video/');
          const updatedShowrooms = updateShowroom(id, {
            videoUrl: isVideo ? url : '',
            imageUrl: !isVideo ? url : ''
          });
          state.showrooms = (updatedShowrooms || []).map((showroom: any, index: number) => normalizeShowroomRecord(showroom, index));
          state.confirmMessage = 'Showroom media uploaded successfully!';
        } catch (e) {
          console.error(e);
          state.confirmMessage = 'Failed to upload showroom media.';
        }
        render();
      })();
      return;
    }

    if (action === 'upload-package-room-image') {
      const index = Number(target.getAttribute('data-index') || '-1');
      const file = target.files?.[0];
      if (!file || !Number.isFinite(index) || index < 0) return;
      try {
        const localUrl = await fileToDataUrl(file);
        if (!state.admin.packageForm.rooms) state.admin.packageForm.rooms = [];
        if (!state.admin.packageForm.rooms[index]) {
          state.admin.packageForm.rooms[index] = {
            id: `room-${Date.now()}-${index}`,
            title: `Room ${index + 1}`,
            image: '',
            description: ''
          } as any;
        }
        state.admin.packageForm.rooms[index].image = localUrl;
      } catch (e) {
        console.error('Package room image upload failed:', e);
      }
      render();
      return;
    }

    if (action === 'upload-luxury-room-media') {
      const propertyType = target.getAttribute('data-property') as 'house' | 'apartment' | null;
      const roomId = target.getAttribute('data-room-id');
      const file = target.files?.[0];
      if (!propertyType || !roomId || !file) return;

      (async () => {
        try {
          const fileId = `luxury-room-media-${roomId}-${Date.now()}`;
          await saveFile(fileId, file);
          const url = normalizeAssetUrl((await getFileUrl(fileId)) || '');
          const store = getLuxuryShowroomStore();
          const roomIndex = store[propertyType].rooms.findIndex((room) => room.id === roomId);
          if (roomIndex !== -1) {
            if (file.type.startsWith('video/')) {
              store[propertyType].rooms[roomIndex].video3d = url;
            } else {
              store[propertyType].rooms[roomIndex].imageUrl = url;
            }
            saveLuxuryShowroomStore(store);
          }
        } catch (e) {
          console.error(e);
        }
        render();
      })();
      return;
    }

    if (action === 'upload-luxury-related-image') {
      const propertyType = (target.getAttribute('data-property') as 'house' | 'apartment' | null)
        || (state.showroomPropertyType as 'house' | 'apartment');
      const roomId = target.getAttribute('data-room-id');
      const indexToken = target.getAttribute('data-index') || target.getAttribute('data-related-index') || '';
      const file = target.files?.[0];
      if (!propertyType || !roomId || !file) return;

      (async () => {
        try {
          const fileId = `luxury-related-image-${roomId}-${Date.now()}`;
          await saveFile(fileId, file);
          const uploadedUrl = normalizeAssetUrl((await getFileUrl(fileId)) || '');

          const store = getLuxuryShowroomStore();
          const roomIndex = store[propertyType].rooms.findIndex((room) => room.id === roomId);
          if (roomIndex === -1) return;

          const room: any = store[propertyType].rooms[roomIndex];
          const relatedImages = getRoomRelatedImages(room);
          if (indexToken === 'new' || indexToken === '-1') {
            relatedImages.push({
              url: uploadedUrl,
              name: 'Related Design',
              category: 'Related Design'
            });
          } else {
            const index = Number(indexToken);
            if (Number.isFinite(index) && index >= 0 && index < relatedImages.length) {
              relatedImages[index].url = uploadedUrl;
            }
          }

          room.relatedImages = relatedImages;
          saveLuxuryShowroomStore(store);
          render();
        } catch (e) {
          console.error(e);
        }
      })();
      return;
    }

    if (action === 'upload-service-media') {
      const id = target.getAttribute('data-id');
      const file = target.files?.[0];
      if (!file || !id) return;

      state.confirmMessage = 'Uploading service media...';
      render();

      (async () => {
        try {
          let mediaUrl = '';
          try {
            const fd = new FormData();
            fd.append('file', file);
            const resp = await fetch('/api/upload-image', {
              method: 'POST',
              body: fd,
              headers: state.currentUser?.token ? { 'Authorization': `Bearer ${state.currentUser.token}` } : {}
            });
            if (resp.ok) {
              const data = await resp.json();
              mediaUrl = String(data.path || '');
            }
          } catch (_) {}
          if (!mediaUrl) mediaUrl = await fileToDataUrl(file);
          const idx = state.services.findIndex(s => s.id === id);
          if (idx !== -1) {
            state.services[idx].video = mediaUrl;
            persistState();
            state.confirmMessage = 'Service media uploaded successfully!';
          }
        } catch (e) {
          console.error(e);
          state.confirmMessage = 'Failed to upload service media.';
        }
        render();
      })();
      return;
    }

    if (form?.getAttribute('data-form') === 'category-form' && target.name === 'imageFile') {
      const file = target.files?.[0];
      if (file) {
        state.admin.categoryForm.image = await fileToDataUrl(file);
      } else {
        state.admin.categoryForm.image = '';
      }
      render();
    }
    if (form?.getAttribute('data-form') === 'category-form' && target.name === 'backgroundFile') {
      const file = target.files?.[0];
      if (file) {
        state.admin.categoryForm.background = await fileToDataUrl(file);
      } else {
        state.admin.categoryForm.background = '';
      }
      render();
    }
    return;
  }

  const action = target.getAttribute('data-action');
  if (action === 'change-site-bg-color') {
    const select = target as HTMLSelectElement;
    const color = select.value;
    if (color) {
      state.siteSettings = { ...state.siteSettings, heroBg: color };
      persistState();
      render();
    }
    return;
  }

  const bind = target.getAttribute('data-bind');
  if (!bind) return;
  const value = target.value;
  switch (bind) {
    case 'admin.bookingFilter.categoryId':
      state.admin.bookingFilter.categoryId = value;
      render();
      break;
    case 'admin.bookingFilter.paymentStatus':
      state.admin.bookingFilter.paymentStatus = value as AdminState['bookingFilter']['paymentStatus'];
      render();
      break;
    case 'admin.bookingFilter.approvalStatus':
      state.admin.bookingFilter.approvalStatus = value as AdminState['bookingFilter']['approvalStatus'];
      render();
      break;
    case 'admin.bookingFilter.dateFrom':
      state.admin.bookingFilter.dateFrom = value;
      render();
      break;
    case 'admin.bookingFilter.dateTo':
      state.admin.bookingFilter.dateTo = value;
      render();
      break;
    case 'admin.invoiceFilter.status':
      state.admin.invoiceFilter.status = value as AdminState['invoiceFilter']['status'];
      render();
      break;
    case 'admin.announcementForm.title':
      state.admin.announcementForm.title = value;
      // No render() here to keep focus while typing
      break;
    case 'admin.announcementForm.message':
      state.admin.announcementForm.message = value;
      break;
    case 'admin.announcementForm.startDate':
      state.admin.announcementForm.startDate = value;
      break;
    case 'admin.announcementForm.endDate':
      state.admin.announcementForm.endDate = value;
      break;
    case 'admin.packageForm.name':
      state.admin.packageForm.name = value;
      break;
    case 'admin.packageForm.subtitle':
      state.admin.packageForm.subtitle = value;
      break;
    case 'admin.packageForm.category':
      state.admin.packageForm.category = value;
      break;
    case 'admin.packageForm.originalPrice':
      state.admin.packageForm.originalPrice = Number(value);
      break;
    case 'admin.packageForm.discountedPrice':
      state.admin.packageForm.discountedPrice = Number(value);
      break;
    case 'admin.packageForm.features':
      state.admin.packageForm.features = value.split(',').map((f: string) => f.trim()).filter(Boolean);
      break;
    case 'admin.packageForm.description':
      state.admin.packageForm.description = value;
      break;


    case 'admin.catalogFilter':
      state.admin.catalogFilter = value;
      render();
      break;
    default:
      break;
  }
});

root.addEventListener('dragstart', (event) => {
  const target = event.target as HTMLElement | null;
  const card = target?.closest('[data-drag-showcase-related-index]') as HTMLElement | null;
  if (!card) return;
  const index = card.getAttribute('data-drag-showcase-related-index');
  if (!index || !event.dataTransfer) return;
  event.dataTransfer.setData('text/plain', index);
  event.dataTransfer.effectAllowed = 'move';
  card.classList.add('opacity-60');
});

root.addEventListener('dragover', (event) => {
  const target = event.target as HTMLElement | null;
  const card = target?.closest('[data-drop-showcase-related-index]') as HTMLElement | null;
  if (!card) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
});

root.addEventListener('dragenter', (event) => {
  const target = event.target as HTMLElement | null;
  const card = target?.closest('[data-drop-showcase-related-index]') as HTMLElement | null;
  if (!card) return;
  card.classList.add('ring-2', 'ring-[color:var(--primary)]', 'border-[color:var(--primary)]', 'bg-[color:var(--primary)]/5');
});

root.addEventListener('dragleave', (event) => {
  const target = event.target as HTMLElement | null;
  const card = target?.closest('[data-drop-showcase-related-index]') as HTMLElement | null;
  if (!card) return;
  const relatedTarget = (event as DragEvent).relatedTarget as HTMLElement | null;
  if (relatedTarget && card.contains(relatedTarget)) return;
  card.classList.remove('ring-2', 'ring-[color:var(--primary)]', 'border-[color:var(--primary)]', 'bg-[color:var(--primary)]/5');
});

root.addEventListener('drop', (event) => {
  const target = event.target as HTMLElement | null;
  const card = target?.closest('[data-drop-showcase-related-index]') as HTMLElement | null;
  if (!card) return;
  event.preventDefault();

  const destinationIndex = Number(card.getAttribute('data-drop-showcase-related-index') || '-1');
  const sourceRaw = event.dataTransfer?.getData('text/plain') || '';
  const sourceIndex = Number(sourceRaw);
  if (!Number.isFinite(sourceIndex) || !Number.isFinite(destinationIndex)) return;
  if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex === destinationIndex) return;

  const form = card.closest('form') as HTMLFormElement | null;
  const currentList = getShowcaseRelatedImagesFromFormState(form);
  if (sourceIndex >= currentList.length || destinationIndex >= currentList.length) return;

  const [moved] = currentList.splice(sourceIndex, 1);
  currentList.splice(destinationIndex, 0, moved);
  state.admin.showcaseForm = {
    ...(state.admin.showcaseForm || {}),
    relatedImages: currentList
  };
  render();
});

root.addEventListener('dragend', () => {
  root.querySelectorAll('[data-drag-showcase-related-index]').forEach((el) => {
    const card = el as HTMLElement;
    card.classList.remove('opacity-60', 'ring-2', 'ring-[color:var(--primary)]', 'border-[color:var(--primary)]', 'bg-[color:var(--primary)]/5');
  });
});

// --- Form submit controller (contains login/inquiry/payment flows) ----------
root.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formType = form.getAttribute('data-form');
  if (!formType) return;
  const formData = new FormData(form);

  switch (formType) {
    case 'login':
      handleLogin(formData);
      break;
    case 'inquiry':
      await handleInquirySubmit(formData);
      break;
    case 'feedback-public':
      handlePublicFeedbackSubmit(formData);
      break;
    case 'fake-payment':
      await (async () => {
        const cardNumber = String(formData.get('cardNumber') || '').trim();
        const cvv = String(formData.get('cvv') || '').trim();
        const name = String(formData.get('name') || '').trim();
        await submitCardPaymentWithProvider(cardNumber, cvv, name);
      })();
      break;
    case 'dismiss-payment-success': {
      (state.customer as any).paymentSuccessData = undefined;
      state.customer.bookingMessage = '';
      updateAdminCharts();
      render();
      break;
    }
    case 'cancel-fake-payment': {
      (state.customer as any).fakePayment = undefined;
      state.customer.paymentError = '';
      render();
      break;
    }
    case 'submit-fake-payment': {
      const form = document.querySelector('form[data-form="fake-payment"]') as HTMLFormElement;
      if (form) {
        const formData = new FormData(form);
        const cardNumber = String(formData.get('cardNumber') || '').trim();
        const cvv = String(formData.get('cvv') || '').trim();
        const name = String(formData.get('name') || '').trim();
        await submitCardPaymentWithProvider(cardNumber, cvv, name);
      }
      break;
    }
    case 'catalog-upload':
      handleCatalogUpload(formData);
      break;
    case 'site-settings':
      state.siteSettings = {
        ...state.siteSettings,
        heroTitle: String(formData.get('heroTitle') || state.siteSettings.heroTitle),
        heroSubtitle: String(formData.get('heroSubtitle') || state.siteSettings.heroSubtitle),
        heroBg: String(formData.get('heroBg') || state.siteSettings.heroBg),
        contactEmail: String(formData.get('contactEmail') || state.siteSettings.contactEmail),
        contactPhone: String(formData.get('contactPhone') || state.siteSettings.contactPhone),
        contactAddress: String(formData.get('contactAddress') || state.siteSettings.contactAddress)
      };
      persistState();
      render();
      break;
    case 'admin-inline-customer-form': {
      if (state.currentUser?.role !== 'admin') break;
      const customerId = String(form.getAttribute('data-customer-id') || '').trim();
      if (!customerId) break;
      const existingCustomer = state.users.find((user) => String(user.id || '') === customerId);
      if (!existingCustomer) break;

      const updatedCustomer = mergeUserProfileFields({
        ...existingCustomer,
        name: String(formData.get('name') || existingCustomer.name || '').trim() || existingCustomer.name,
        email: String(formData.get('email') || existingCustomer.email || '').trim() || existingCustomer.email,
        dob: String(formData.get('dob') || '').trim() || undefined,
        gender: String(formData.get('gender') || '').trim() || undefined,
        location: String(formData.get('location') || '').trim() || undefined,
        pincode: String(formData.get('pincode') || '').trim() || undefined,
        phone: String(formData.get('phone') || '').trim() || undefined,
        profilePhoto: String(formData.get('profilePhoto') || '').trim() || undefined,
        address: String(formData.get('address') || '').trim() || undefined,
        bio: String(formData.get('bio') || '').trim() || undefined
      } as User, existingCustomer);

      upsertUserInState(updatedCustomer);
      (state.admin as any).editingCustomerId = null;
      state.confirmMessage = 'Customer profile updated.';
      persistState();
      render();
      break;
    }
    case 'customer-profile-form': {
      if (!state.currentUser) break;
      const updatedUser = mergeUserProfileFields({
        ...state.currentUser,
        name: String(formData.get('name') || state.currentUser.name || '').trim() || state.currentUser.name,
        email: String(formData.get('email') || state.currentUser.email || '').trim() || state.currentUser.email,
        phone: String(formData.get('phone') || '').trim() || undefined,
        dob: String(formData.get('dob') || '').trim() || undefined,
        gender: String(formData.get('gender') || '').trim() || undefined,
        location: String(formData.get('location') || '').trim() || undefined,
        pincode: String(formData.get('pincode') || '').trim() || undefined,
        address: String(formData.get('address') || '').trim() || undefined,
        bio: String(formData.get('bio') || '').trim() || undefined
      } as User, state.currentUser);

      upsertUserInState(updatedUser);
      state.currentUser = updatedUser;
      state.confirmMessage = 'Profile updated successfully.';
      persistState();
      render();
      break;
    }
    case 'category-form':
      await handleCategorySubmit(formData);
      break;
    case 'admin-design-edit':
      await handleAdminDesignEditSubmit(formData);
      break;
    case 'design-form':
      await handleDesignSubmit(formData);
      break;
    case 'chatbot-settings': {
      if (state.currentUser?.role !== 'admin') break;
      const assistantName = String(formData.get('assistantName') || '').trim() || DEFAULT_CHATBOT_SETTINGS.assistantName;
      const greeting = String(formData.get('greeting') || '').trim() || DEFAULT_CHATBOT_SETTINGS.greeting;
      const bookingReply = String(formData.get('bookingReply') || '').trim() || DEFAULT_CHATBOT_SETTINGS.bookingReply;
      const suggestionsIntro = String(formData.get('suggestionsIntro') || '').trim() || DEFAULT_CHATBOT_SETTINGS.suggestionsIntro;
      const enabled = formData.get('enabled') === 'on';

      chatbotSettingsState = {
        assistantName,
        greeting,
        bookingReply,
        suggestionsIntro,
        enabled
      };
      persistChatbotSettings();
      resetChatbotMessages();
      mountChatbot();
      state.confirmMessage = 'Chatbot settings updated.';
      render();
      break;
    }
    case 'announcement-form': {
      if (state.currentUser?.role !== 'admin') break;
      const id = String(formData.get('id') || '');
      const nowIso = new Date().toISOString();
      const defaultEndIso = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString();
      const incomingStartDate = String(formData.get('startDate') || '').trim();
      const incomingEndDate = String(formData.get('endDate') || '').trim();
      const announcement = {
        title: String(formData.get('title') || '').trim(),
        message: String(formData.get('message') || '').trim(),
        startDate: incomingStartDate || String(state.admin.announcementForm.startDate || nowIso),
        endDate: incomingEndDate || String(state.admin.announcementForm.endDate || defaultEndIso),
        active: formData.get('active') === 'on',
        location: String(formData.get('location') || 'both')
      };

      if (id) {
        updateAnnouncement(id, announcement);
        state.announcements = getAnnouncements();
        state.confirmMessage = 'Announcement updated.';
      } else {
        saveAnnouncement(announcement);
        state.announcements = getAnnouncements();
        state.confirmMessage = 'Announcement created.';
      }
      state.admin.announcementForm = { id: '', title: '', message: '', startDate: '', endDate: '', active: true, location: 'both' };
      persistState();
      
      // No immediate render - background refresh handles UI update
      Promise.all([refreshCustomerData(), refreshAdminData()]).catch((err) => {
        console.warn('Background admin refresh failed after announcement save:', err);
      });
      break;
    }
    case 'discount-code-form': {
      if (state.currentUser?.role !== 'admin') break;
      const rawCode = normalizePromoCode(String(formData.get('code') || ''));
      const type = String(formData.get('type') || 'percentage') === 'fixed' ? 'fixed' : 'percentage';
      const value = Number(formData.get('value') || 0);
      const minAmount = Number(formData.get('minAmount') || 0);
      if (!rawCode) {
        state.confirmMessage = 'Discount code is required.';
        render();
        break;
      }
      if (!Number.isFinite(value) || value <= 0) {
        state.confirmMessage = 'Discount value must be greater than 0.';
        render();
        break;
      }
      if (type === 'percentage' && value > 100) {
        state.confirmMessage = 'Percentage discount cannot exceed 100%.';
        render();
        break;
      }
      const existing = getDiscountCodes().some((item: any) => normalizePromoCode(String(item?.code || '')) === rawCode);
      if (existing) {
        state.confirmMessage = 'Discount code already exists.';
        render();
        break;
      }
      saveDiscountCode({
        code: rawCode,
        type,
        value,
        minAmount: Number.isFinite(minAmount) ? Math.max(0, minAmount) : 0,
        active: true
      });
      state.confirmMessage = 'Discount code added.';
      (form as HTMLFormElement).reset();
      render();
      break;
    }
    case 'package-form': {
      if (state.currentUser?.role !== 'admin') break;
      const id = String(formData.get('id') || '').trim();
      const featuresStr = String(formData.get('features') || '');
      const imageFile = (form.querySelector('input[name="imageFile"]') as HTMLInputElement)?.files?.[0];

      const processPackage = async (imageUrl: string) => {
        const pkg = {
          id: id || String(formData.get('name') || '').trim().toLowerCase().replace(/\s+/g, '-'),
          name: String(formData.get('name') || '').trim(),
          subtitle: String(formData.get('subtitle') || '').trim(),
          category: String(formData.get('category') || 'Full Home'),
          originalPrice: Number(formData.get('originalPrice') || 0),
          discountedPrice: Number(formData.get('discountedPrice') || 0),
          features: featuresStr ? featuresStr.split(',').map((f: string) => f.trim()) : [],
          description: String(formData.get('description') || '').trim(),
          image: imageUrl,
          type: state.admin.packageForm.type || 'Standard',
          rooms: state.admin.packageForm.rooms || []
        };

        if (id && getPackagesSync().find((p: any) => p.id === id)) {
          updatePackage(id, pkg);
          state.confirmMessage = 'Package updated.';
        } else {
          savePackage(pkg);
          state.confirmMessage = 'Package created.';
        }
        
        // No immediate render - data is visible without re-render
        // Background refresh happens without blocking UI
        Promise.all([refreshCustomerData(), refreshAdminData()]).catch((err) => {
          console.warn('Background admin refresh failed after package save:', err);
        });
      };

      // Handle local file upload first to ensure package create/edit works even without backend upload auth.
      if (imageFile) {
        try {
          const localImageUrl = await fileToDataUrl(imageFile);
          processPackage(localImageUrl || String(formData.get('image') || ''));
        } catch (error) {
          console.warn('Image conversion failed:', error);
          processPackage(String(formData.get('image') || ''));
        }
      } else {
        processPackage(String(formData.get('image') || ''));
      }
      break;
    }

    case 'clear-booking-filters': {
      state.admin.bookingFilter = {
        query: '',
        categoryId: 'all',
        dateFrom: '',
        dateTo: '',
        paymentStatus: 'all',
        approvalStatus: 'all'
      };
      render();
      break;
    }

    case 'set-booking-summary-filter': {
      const selected = String(button.getAttribute('data-value') || 'all');
      if (selected === 'paid' || selected === 'pending' || selected === 'failed') {
        state.admin.bookingFilter.paymentStatus = selected as AdminState['bookingFilter']['paymentStatus'];
        state.admin.bookingFilter.approvalStatus = 'all';
      } else if (selected === 'approved') {
        state.admin.bookingFilter.paymentStatus = 'all';
        state.admin.bookingFilter.approvalStatus = 'approved';
      } else {
        state.admin.bookingFilter.paymentStatus = 'all';
        state.admin.bookingFilter.approvalStatus = 'all';
      }
      render();
      break;
    }

    case 'refresh-admin-bookings': {
      console.log('🔄 Refreshing admin bookings...');
      void refreshAdminData({ silent: false, force: true });
      break;
    }

    case 'refresh-admin-feedback': {
      state.confirmMessage = 'Refreshing feedback for admin dashboard...';
      render();
      await refreshPublicFeedbacks({ silent: true });
      await refreshAdminData({ silent: true, force: true });
      updateAdminCharts();
      state.confirmMessage = 'Admin feedback refreshed.';
      render();
      break;
    }

    default:
      break;
  }
});

root.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement;
  const calcAction = target.getAttribute('data-action');

  if (calcAction === 'calc-set-area') {
    state.calculator.area = Number(target.value) || 0;
    calculatePrice();
    render();
    return;
  }

  const adminCalcField = target.getAttribute('data-admin-calc');
  if (adminCalcField && state.admin.calculatorForm) {
    (state.admin.calculatorForm as any)[adminCalcField] = Number(target.value) || 0;
    return;
  }

  const adminCalcCategory = target.getAttribute('data-admin-calc-category');
  if (adminCalcCategory && state.admin.calculatorForm) {
    state.admin.calculatorForm.categoryMultipliers[adminCalcCategory] = Number(target.value) || 0;
    return;
  }

  const adminCalcShape = target.getAttribute('data-admin-calc-shape');
  if (adminCalcShape && state.admin.calculatorForm) {
    (state.admin.calculatorForm.shapeMultipliers as any)[adminCalcShape] = Number(target.value) || 0;
    return;
  }

  const adminCalcQuality = target.getAttribute('data-admin-calc-quality');
  if (adminCalcQuality && state.admin.calculatorForm) {
    (state.admin.calculatorForm.qualityMultipliers as any)[adminCalcQuality] = Number(target.value) || 0;
    return;
  }
});

window.addEventListener('popstate', () => {
  state.activeTab = getActiveTabFromPath();
  render();
  // Restore scroll position when using browser back/forward
  restoreScrollPosition(window.location.pathname);
});

document.addEventListener('close-payment-dialog', () => {
  (state.customer as any).fakePayment = undefined;
  state.customer.paymentError = '';
  render();
});

document.addEventListener('close-design-modal', () => {
  state.customer.selectedDesignId = null;
  state.customer.bookingMessage = '';
  state.customer.paymentError = '';
  render();
});

let packageServerCache: any[] | null = null;
let packageServerCacheFetchedAt = 0;
let packageServerCacheInFlight: Promise<any[] | null> | null = null;
let packageDesignHydrationInFlight: Promise<void> | null = null;

const filterPackagesFromCache = (packages: any[], filters?: { bhk?: number; type?: string; excludeType?: string }) => {
  if (!filters) return packages;
  const targetBhk = Number(filters.bhk);
  const targetType = String(filters.type || '').trim().toLowerCase();
  const targetExcludeType = String(filters.excludeType || '').trim().toLowerCase();

  return packages.filter((pkg: any) => {
    const pkgBhk = Number(pkg?.bhk);
    const pkgType = String(pkg?.type || '').trim().toLowerCase();

    if (Number.isFinite(targetBhk) && pkgBhk !== targetBhk) return false;
    if (targetType && pkgType !== targetType) return false;
    if (targetExcludeType && pkgType === targetExcludeType) return false;
    return true;
  });
};

const loadAllPackagesWithDesigns = async (forceRefresh = false): Promise<any[] | null> => {
  if (!forceRefresh && Array.isArray(packageServerCache) && packageServerCache.length > 0) {
    return packageServerCache;
  }

  if (!forceRefresh && packageServerCacheInFlight) {
    return packageServerCacheInFlight;
  }

  packageServerCacheInFlight = (async () => {
    const response = await fetch('/api/packages');
    const data = await response.json();
    if (!(data.success && Array.isArray(data.packages))) {
      return null;
    }

    const normalizedPackages = data.packages.map((pkg: any) => ({
      ...pkg,
      rooms: Array.isArray(pkg.rooms) ? pkg.rooms : []
    }));

    packageServerCache = normalizedPackages;
    packageServerCacheFetchedAt = Date.now();

    // Hydrate missing design data lazily so first paint is fast even on tunnel/mobile networks.
    if (!packageDesignHydrationInFlight) {
      packageDesignHydrationInFlight = (async () => {
        const cache = packageServerCache;
        if (!Array.isArray(cache) || cache.length === 0) return;

        const targetPackages = cache.filter((pkg: any) => !Array.isArray(pkg?.rooms) || pkg.rooms.length === 0);
        if (targetPackages.length === 0) return;

        const maxConcurrency = 4;
        let index = 0;

        const worker = async () => {
          while (index < targetPackages.length) {
            const currentIndex = index;
            index += 1;
            const pkg = targetPackages[currentIndex];
            try {
              const dRes = await fetch(`/api/packages/${pkg.id}/designs`);
              const dData = await dRes.json();
              pkg.rooms = dData.success && Array.isArray(dData.designs) ? dData.designs : [];
            } catch (e) {
              pkg.rooms = Array.isArray(pkg.rooms) ? pkg.rooms : [];
              console.warn(`Failed to hydrate designs for package ${pkg.id}`, e);
            }
          }
        };

        await Promise.all(Array.from({ length: Math.min(maxConcurrency, targetPackages.length) }, () => worker()));
      })()
        .catch((e) => console.warn('Package design hydration failed:', e))
        .finally(() => {
          packageDesignHydrationInFlight = null;
        });
    }

    return normalizedPackages;
  })();

  try {
    return await packageServerCacheInFlight;
  } finally {
    packageServerCacheInFlight = null;
  }
};

const fetchPackagesFromServer = async (
  filters?: { bhk?: number; type?: string; excludeType?: string },
  options?: { forceRefresh?: boolean }
) => {
  try {
    const allPackages = await loadAllPackagesWithDesigns(Boolean(options?.forceRefresh));
    if (Array.isArray(allPackages)) {
      const filteredPackages = filterPackagesFromCache(allPackages, filters);
      setPackages(filteredPackages);
      const suffix = filters
        ? ` (filtered${filters.bhk ? ` bhk=${filters.bhk}` : ''}${filters.type ? ` type=${filters.type}` : ''}${filters.excludeType ? ` excludeType=${filters.excludeType}` : ''})`
        : '';
      const cacheAgeMs = packageServerCacheFetchedAt ? Math.max(0, Date.now() - packageServerCacheFetchedAt) : 0;
      console.log(`✅ Synchronized packages from server cache${suffix}; age=${cacheAgeMs}ms`);
    }
  } catch (error) {
    console.error('Error fetching packages from server:', error);
  }
};

(window as any).applyServerPackageFilter = async (
  mode: 'all' | 'bhk' | 'bhkNonApartment' | 'type',
  value?: number | string,
  forceRefresh = false
) => {
  const filters: { bhk?: number; type?: string; excludeType?: string } = {};
  if (mode === 'bhk' && Number.isFinite(Number(value))) {
    filters.bhk = Number(value);
  } else if (mode === 'bhkNonApartment' && Number.isFinite(Number(value))) {
    filters.bhk = Number(value);
    filters.excludeType = 'Apartment';
  } else if (mode === 'type' && typeof value === 'string') {
    filters.type = value;
  }

  await fetchPackagesFromServer(mode === 'all' ? undefined : filters, { forceRefresh });
  render();
};

const init = async () => {
  const initStart = getPerfNow();
  try {
    console.log('Initializing app...');

    // Show loading screen immediately
    root.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Inter', sans-serif;">
        <div style="text-align: center; color: white;">
          <div style="font-size: 48px; margin-bottom: 20px; animation: spin 2s linear infinite;">🎨</div>
          <h1 style="font-size: 28px; margin-bottom: 10px; font-weight: 700;">Loading AR Interia</h1>
          <p style="font-size: 14px; opacity: 0.9;">Please wait while we prepare your design studio...</p>
          <div style="margin-top: 20px; width: 200px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: 30%; background: white; animation: loading 1.5s ease-in-out infinite; border-radius: 2px;"></div>
          </div>
        </div>
        <style>
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes loading { 
            0% { width: 30%; margin-left: 0%; }
            50% { width: 70%; margin-left: 30%; }
            100% { width: 30%; margin-left: 70%; }
          }
        </style>
      </div>
    `;

    // Synchronize package data without blocking first render.
    runWhenBrowserIdle(() => {
      fetchPackagesFromServer()
        .then(() => {
          render();
        })
        .catch((error) => {
          console.warn('Package sync skipped:', error);
        });
    }, 500);

    // Seed announcements if empty
    if (getAnnouncements().length === 0) {
      const sampleAnnouncements: Announcement[] = [
        {
          id: 'ann-1',
          title: 'Summer Sale!',
          content: 'Get 20% off on all Full Home packages this month.',
          message: 'Get 20% off on all Full Home packages this month.',
          active: true,
          location: 'both',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      sampleAnnouncements.forEach(a => saveAnnouncement(a));
      state.announcements = getAnnouncements();
    }

    // Load state fast (no Promise.all delays)
    await loadState();
    logPerf('loadState', initStart);
    if (!state.chatbot.messages || state.chatbot.messages.length <= 1) {
      resetChatbotMessages();
    }
    // Paint immediately from local data; background refreshes can patch in fresh data later.
    render();

    // Seeding is now handled in dataStore.ts to avoid conflicts.

    // Refresh customer data in background when browser is idle (non-blocking for first paint)
    runWhenBrowserIdle(() => {
      refreshCustomerData()
        .then(() => {
          console.log('Customer data refreshed');
          render();
          logPerf('init+customerRefresh', initStart);
        })
        .catch((e) => {
          console.warn('Failed to refresh customer data:', e);
        });
    }, 600);

    // Refresh admin data lazily unless admin is already on admin route
    if (state.currentUser?.role === 'admin') {
      const refreshAdmin = () => {
        refreshAdminData()
          .then(() => {
            console.log('Admin data refreshed');
            render();
            logPerf('init+adminRefresh', initStart);
          })
          .catch((e) => {
            console.warn('Failed to refresh admin data:', e);
          });
      };

      if (state.activeTab === 'admin') {
        refreshAdmin();
      } else {
        runWhenBrowserIdle(refreshAdmin, 1200);
      }
    }

    // Handle payment redirect asynchronously during idle so it doesn't block initial UI paint
    runWhenBrowserIdle(() => {
      handlePaymentRedirect().catch(e => console.warn('Payment redirect error:', e));
    }, 1000);

    logPerf('initComplete(non-blocking)', initStart);

  } catch (error) {
    console.error('Initialization error:', error);
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Error Loading Application</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>Check the browser console for more details.</p>
    </div>`;
  }
};

// 3D Viewer Logic
const update3DTransform = () => {
  const container = document.getElementById('viewer-3d-container');
  const content = container?.querySelector('.viewer-3d-content') as HTMLElement;
  if (!container || !content) return;

  const scale = parseFloat(container.getAttribute('data-scale') || '1');
  const rotateX = parseFloat(container.getAttribute('data-rotate-x') || '0');
  const rotateY = parseFloat(container.getAttribute('data-rotate-y') || '0');

  content.style.transform = `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
};

const handle3DZoom = (e: WheelEvent) => {
  e.preventDefault();
  const container = e.currentTarget as HTMLElement;

  let scale = parseFloat(container.getAttribute('data-scale') || '1');
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.5, scale), 3);

  container.setAttribute('data-scale', String(scale));
  update3DTransform();
};

// ===== Three.js 3D Room Viewer =====
const handleOpen3DRoom = async (imageUrl: string, roomName: string = '3D Room') => {
  if (!imageUrl) return;

  // Remove any existing 3D modal
  document.getElementById('room-3d-modal')?.remove();

  // Create the modal overlay with a canvas
  const overlay = document.createElement('div');
  overlay.id = 'room-3d-modal';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    background:#0a0a0a;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
  `;

  overlay.innerHTML = `
    <div style="position:relative;width:min(98vw,1100px);height:min(85vh,680px);border-radius:20px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.9);">
      <canvas id="room3d-canvas" style="display:block;width:100%;height:100%;"></canvas>
      <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);padding:10px 28px;border-radius:50px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:15px;font-weight:700;letter-spacing:0.05em;white-space:nowrap;pointer-events:none;">
        🏠 ${roomName} — 3D Room View
      </div>
      <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);padding:8px 20px;border-radius:50px;color:rgba(255,255,255,0.75);font-size:12px;white-space:nowrap;pointer-events:none;">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
    <div style="margin-top:18px;display:flex;gap:12px;">
      <button id="room3d-close-btn"
        style="background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.25);color:#fff;font-size:14px;font-weight:700;padding:12px 36px;border-radius:50px;cursor:pointer;letter-spacing:0.05em;">
        ✕ Close 3D View
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  const canvas = overlay.querySelector('#room3d-canvas') as HTMLCanvasElement | null;
  const closeButton = overlay.querySelector('#room3d-close-btn') as HTMLButtonElement | null;
  if (!canvas || !closeButton) {
    overlay.remove();
    return;
  }

  // Hoist renderer so closeRoom closure can safely access it before Three.js loads
  let renderer: any = null;

  // Close handler
  const closeRoom = () => {
    renderer?.dispose();
    overlay.remove();
  };
  closeButton.addEventListener('click', closeRoom);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeRoom(); });

  // Dynamically import only used Three.js symbols
  const {
    WebGLRenderer,
    ACESFilmicToneMapping,
    Scene,
    Color,
    PerspectiveCamera,
    AmbientLight,
    DirectionalLight,
    PointLight,
    BoxGeometry,
    MeshStandardMaterial,
    BackSide,
    TextureLoader,
    SRGBColorSpace,
    Mesh,
    Group,
    CylinderGeometry
  } = await import('three');

  if (!overlay.isConnected) return;

  const canvasBounds = canvas.getBoundingClientRect();
  const W = Math.max(1, Math.round(canvasBounds.width || canvas.clientWidth || 1));
  const H = Math.max(1, Math.round(canvasBounds.height || canvas.clientHeight || 1));
  canvas.width = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;

  // Renderer
  renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Scene
  const scene = new Scene();
  scene.background = new Color(0x1a1a2e);

  // Camera
  const camera = new PerspectiveCamera(70, W / H, 0.01, 100);
  camera.position.set(0, 0, 4);

  // Lights
  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const sunLight = new DirectionalLight(0xffd9b0, 1.4);
  sunLight.position.set(3, 6, 3);
  sunLight.castShadow = true;
  scene.add(sunLight);
  const fillLight = new PointLight(0xa0c4ff, 0.5, 20);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  // Room geometry (inside of a box — normal inward)
  const roomSize = 8;
  const roomGeo = new BoxGeometry(roomSize, roomSize * 0.7, roomSize);
  // Flip normals for inside view
  const pos = roomGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const n = roomGeo.attributes.normal;
    n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  }
  roomGeo.attributes.normal.needsUpdate = true;

  // Wall material — neutral warm grey for side walls / ceiling / floor
  const wallMat = new MeshStandardMaterial({
    color: 0xf0ece4,
    side: BackSide,
    roughness: 0.85,
    metalness: 0.0
  });
  const floorMat = new MeshStandardMaterial({
    color: 0x8b7355,
    side: BackSide,
    roughness: 0.9
  });

  // Load the category image as texture on the back wall
  const textureLoader = new TextureLoader();
  const designTex = textureLoader.load(imageUrl, () => renderer.render(scene, camera));
  designTex.colorSpace = SRGBColorSpace;

  // Per-face materials for the room box: (right, left, top, bottom, front, back)
  const designWallMat = new MeshStandardMaterial({
    map: designTex,
    side: BackSide,
    roughness: 0.5
  });

  const materials = [
    wallMat,          // +x right wall
    wallMat,          // -x left wall
    wallMat,          // +y ceiling
    floorMat,         // -y floor
    wallMat,          // +z front (behind camera)
    designWallMat     // -z back wall → image is here
  ];

  const room = new Mesh(roomGeo, materials);
  scene.add(room);

  // Simple furniture: a sofa shape
  const sofaGroup = new Group();
  // Seat
  const seat = new Mesh(
    new BoxGeometry(2.4, 0.3, 0.9),
    new MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 })
  );
  seat.position.set(0, -2.2, 1.8);
  sofaGroup.add(seat);
  // Back
  const back = new Mesh(
    new BoxGeometry(2.4, 0.7, 0.2),
    new MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 })
  );
  back.position.set(0, -1.9, 2.3);
  sofaGroup.add(back);
  // Armrests
  [-1.2, 1.2].forEach((x) => {
    const arm = new Mesh(
      new BoxGeometry(0.2, 0.4, 0.9),
      new MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 })
    );
    arm.position.set(x, -2.05, 1.8);
    sofaGroup.add(arm);
  });
  scene.add(sofaGroup);

  // Coffee table
  const tableTop = new Mesh(
    new BoxGeometry(1.2, 0.06, 0.6),
    new MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.4, metalness: 0.1 })
  );
  tableTop.position.set(0, -2.15, 0.8);
  scene.add(tableTop);

  // Ceiling lamp
  const lampGeo = new CylinderGeometry(0.15, 0.3, 0.25, 16);
  const lampMat = new MeshStandardMaterial({ color: 0xfff8e7, emissive: 0xffedb0, emissiveIntensity: 0.5 });
  const lamp = new Mesh(lampGeo, lampMat);
  lamp.position.set(0, 2.4, -0.5);
  scene.add(lamp);
  const pointLamp = new PointLight(0xffd060, 1.5, 8);
  pointLamp.position.set(0, 2.2, -0.5);
  scene.add(pointLamp);

  // Orbit controls (manual)
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let phi = Math.PI / 2, theta = 0, radius = 4;
  const updateCamera = () => {
    camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(0, -0.5, 0);
  };
  updateCamera();

  canvas.addEventListener('mousedown', (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    theta -= dx * 0.006;
    phi = Math.max(0.3, Math.min(Math.PI - 0.3, phi + dy * 0.005));
    lastX = e.clientX; lastY = e.clientY;
    updateCamera();
  });
  canvas.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    radius = Math.max(1.5, Math.min(7, radius + e.deltaY * 0.005));
    updateCamera();
  }, { passive: false });

  // Touch support
  let lastTouchX = 0, lastTouchY = 0;
  canvas.addEventListener('touchstart', (e) => { lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const dx = e.touches[0].clientX - lastTouchX;
    const dy = e.touches[0].clientY - lastTouchY;
    theta -= dx * 0.008;
    phi = Math.max(0.3, Math.min(Math.PI - 0.3, phi + dy * 0.006));
    lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
    updateCamera();
  }, { passive: false });

  // Animate
  let animFrameId: number;
  const animate = () => {
    if (!document.getElementById('room-3d-modal')) return;
    animFrameId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  // Cleanup on close
  document.getElementById('room3d-close-btn')!.addEventListener('click', () => {
    cancelAnimationFrame(animFrameId);
  }, { once: true });
};

const render3DViewer = () => {
  const viewerState = state.customer.viewer3d;
  if (!viewerState || !viewerState.isOpen) return '';

  return `
    <div class="viewer-3d-modal" id="viewer-3d-modal" style="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div class="viewer-3d-container" id="viewer-3d-container"
        style="perspective:1200px;cursor:grab;width:min(90vw,900px);height:min(80vh,650px);display:flex;align-items:center;justify-content:center;position:relative;">
        <div class="viewer-3d-content" style="width:100%;height:100%;transform-style:preserve-3d;transition:transform 0.05s linear;will-change:transform;border-radius:16px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6);">
          <img
            src="${escapeHtml(viewerState.designImage)}"
            alt="3D View"
            style="width:100%;height:100%;object-fit:contain;display:block;image-rendering:high-quality;"
            draggable="false"
          />
        </div>
      </div>
      <div class="viewer-3d-controls" style="margin-top:20px;display:flex;flex-direction:column;align-items:center;gap:10px;">
        <button
          id="close-3d-btn"
          style="background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.3);color:#fff;font-size:15px;font-weight:700;padding:12px 32px;border-radius:50px;cursor:pointer;letter-spacing:0.05em;transition:all 0.2s;"
          onmouseover="this.style.background='rgba(255,255,255,0.25)'"
          onmouseout="this.style.background='rgba(255,255,255,0.15)'"
        >✕ Close 3D View</button>
        <div style="color:rgba(255,255,255,0.7);font-size:13px;background:rgba(0,0,0,0.5);padding:8px 20px;border-radius:50px;">
          Move cursor to rotate &bull; Scroll to zoom
        </div>
      </div>
    </div>
  `;
};

const handle3DMouseMove = (e: MouseEvent) => {
  const container = e.currentTarget as HTMLElement;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateY = ((x - centerX) / centerX) * 20; // Max 20deg rotation
  const rotateX = ((centerY - y) / centerY) * 20; // Invert Y axis

  container.setAttribute('data-rotate-x', String(rotateX));
  container.setAttribute('data-rotate-y', String(rotateY));
  update3DTransform();
};

const handleReset3DView = () => {
  const container = document.getElementById('viewer-3d-container');
  if (container) {
    container.setAttribute('data-rotate-x', '0');
    container.setAttribute('data-rotate-y', '0');
    update3DTransform();
  }
};

const handleClose3DView = () => {
  if (state.customer.viewer3d) {
    state.customer.viewer3d.isOpen = false;
  }
  const modal = document.getElementById('viewer-3d-modal');
  if (modal) {
    modal.remove();
  }
};

const handleOpen3DView = (designId: string) => {
  console.log('Opening 3D view for design:', designId);
  const design = state.customer.designs.find(d => d.id === designId) || getDesigns().find(d => d.id === designId);

  if (!design) {
    console.error('Design not found for 3D view:', designId);
    return;
  }

  state.customer.viewer3d = {
    isOpen: true,
    designId: design.id,
    designImage: design.previewImage || (design.images && design.images[0]) || '',
    rotation: { x: 0, y: 0 }
  };

  const modalHtml = render3DViewer();
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = modalHtml;
  const modalElement = modalDiv.firstElementChild as HTMLElement;
  if (modalElement) document.body.appendChild(modalElement);

  // Wire close button directly (modal is outside root click listener)
  const closeBtn = document.getElementById('close-3d-btn');
  if (closeBtn) closeBtn.addEventListener('click', handleClose3DView);

  // Wire backdrop click to close
  const modal = document.getElementById('viewer-3d-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) handleClose3DView();
    });
  }

  const container = document.getElementById('viewer-3d-container');
  if (container) {
    container.addEventListener('mousemove', handle3DMouseMove);
    container.addEventListener('mouseleave', handleReset3DView);
    container.addEventListener('wheel', handle3DZoom, { passive: false });
  }
};

const handleOpen3DViewImage = (imageUrl: string) => {
  if (!imageUrl) return;
  state.customer.viewer3d = {
    isOpen: true,
    designId: 'virtual-' + Date.now(),
    designImage: imageUrl,
    rotation: { x: 0, y: 0 }
  };

  const modalHtml = render3DViewer();
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = modalHtml;
  const modalElement = modalDiv.firstElementChild as HTMLElement;
  if (modalElement) document.body.appendChild(modalElement);

  // Wire close button directly (modal is outside root click listener)
  const closeBtn = document.getElementById('close-3d-btn');
  if (closeBtn) closeBtn.addEventListener('click', handleClose3DView);

  // Wire backdrop click to close
  const modal = document.getElementById('viewer-3d-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) handleClose3DView();
    });
  }

  const container = document.getElementById('viewer-3d-container');
  if (container) {
    container.addEventListener('mousemove', handle3DMouseMove);
    container.addEventListener('mouseleave', handleReset3DView);
    container.addEventListener('wheel', handle3DZoom, { passive: false });
  }
};


// ===== CHATBOT WIDGET =====

const renderMarkdownText = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

const mountChatbot = () => {
  const existing = document.getElementById('aria-chatbot-widget');
  if (existing) existing.remove();

  const cb = state.chatbot;
  const { isOpen, messages, isTyping } = state.chatbot;
  const activeTab: 'chat' | 'activity' = cb.activeTab || 'chat';
  const isRegistered = Boolean(state.currentUser?.id && state.currentUser.role !== 'admin');

  // ---- My Activity content builder ----
  const buildActivityPanel = (): string => {
    const user = state.currentUser!;
    const bookings = (state.customer.bookings || [])
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
    const likedItems = (state.customer.likes || [])
      .filter((l: any) => String(l.userId || '') === String(user.id || '') && String(l.value || '') === 'like')
      .slice(0, 4);
    const dislikedItems = (state.customer.likes || [])
      .filter((l: any) => String(l.userId || '') === String(user.id || '') && String(l.value || '') === 'dislike')
      .slice(0, 4);
    const myFeedbacks = (state.customer.feedbacks || [])
      .filter((f: any) => String(f.customerId || f.userId || '') === String(user.id || ''))
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);

    const bookingRows = bookings.length
      ? bookings.map((b: any) => {
          const name = b.designName || b.packageName || b.designId || b.id;
          const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '';
          const status = b.status || 'pending';
          const statusColor = status === 'fulfilled' || status === 'confirmed' ? '#22c55e'
            : status === 'approved' ? '#3b82f6'
            : status === 'cancelled' ? '#ef4444'
            : '#f59e0b';
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
            <div>
              <div style="font-size:12px;font-weight:600;color:#1a1a2e;">${escapeHtml(String(name || 'Booking'))}</div>
              <div style="font-size:10px;color:#94a3b8;">${date}</div>
            </div>
            <span style="font-size:10px;font-weight:700;color:${statusColor};text-transform:capitalize;">${escapeHtml(status)}</span>
          </div>`;
        }).join('')
      : `<div style="font-size:12px;color:#94a3b8;padding:8px 0;">No bookings yet.</div>`;

    const likedRows = likedItems.length
      ? likedItems.map((l: any) => `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:#fef3c7;color:#d97706;font-weight:600;">${escapeHtml(String(l.designId || 'Design'))}</span>`).join('')
      : `<span style="font-size:11px;color:#94a3b8;">No liked items yet.</span>`;

    const dislikedRows = dislikedItems.length
      ? dislikedItems.map((l: any) => `<span style="font-size:11px;padding:3px 10px;border-radius:20px;background:#fce7f3;color:#be185d;font-weight:600;">${escapeHtml(String(l.designId || 'Design'))}</span>`).join('')
      : `<span style="font-size:11px;color:#94a3b8;">None.</span>`;

    const feedbackRows = myFeedbacks.length
      ? myFeedbacks.map((f: any) => {
          const stars = '⭐'.repeat(Math.min(5, Math.max(1, Number(f.rating || 1))));
          const comment = String(f.comment || '').slice(0, 80);
          const date = formatMonthYearDate(f.createdAt);
          return `<div style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;">${stars}</span>
              <span style="font-size:10px;color:#94a3b8;">${date}</span>
            </div>
            <div style="font-size:11px;color:#475569;margin-top:3px;">${escapeHtml(comment)}${f.comment && f.comment.length > 80 ? '…' : ''}</div>
          </div>`;
        }).join('')
      : `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">No feedback submitted yet.</div>`;

    const invoiceRows = (state.customer.invoices || []).length
      ? (state.customer.invoices || []).map((inv: any) => {
          const displayName = inv.displayName || `Invoice #${inv.invoiceNumber || inv.id}`;
          const amount = inv.displayAmount || inv.amount || inv.price || 0;
          const date = inv.displayDate || inv.createdAt || inv.updatedAt || '';
          const dateStr = date ? new Date(date).toLocaleDateString() : '';
          const formattedAmount = `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
            <div>
              <div style="font-size:12px;font-weight:600;color:#1a1a2e;">${escapeHtml(String(displayName))}</div>
              <div style="font-size:10px;color:#94a3b8;">${dateStr}</div>
            </div>
            <span style="font-size:11px;font-weight:700;color:#22c55e;">${formattedAmount}</span>
          </div>`;
        }).join('')
      : `<div style="font-size:12px;color:#94a3b8;padding:8px 0;">No invoices loaded yet.</div>`;

    return `
      <div style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:14px;background:#f8f9fb;">
        <!-- Recent Bookings -->
        <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">📋 Recent Bookings</div>
          ${bookingRows}
        </div>
        <!-- Recent Invoices -->
        <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">🧾 Recent Invoices</div>
          <button data-action="customer-load-invoices" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:8px;background:#f3f4f6;color:#374151;font-size:11px;font-weight:600;cursor:pointer;margin-bottom:8px;">Load Invoices</button>
          <div id="recent-invoices" style="font-size:12px;color:#94a3b8;padding:4px 0;">${invoiceRows}</div>
        </div>
        <!-- Liked / Disliked -->
        <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">❤️ Liked Designs</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">${likedRows}</div>
          <div style="font-size:11px;font-weight:700;color:#be185d;text-transform:uppercase;letter-spacing:0.05em;margin:10px 0 6px;">👎 Disliked</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">${dislikedRows}</div>
        </div>
        <!-- Recent Feedback -->
        <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">⭐ My Feedback</div>
          ${feedbackRows}
        </div>
        <!-- Leave Feedback CTA -->
        <button data-action="chatbot-activity-feedback" style="
          width:100%;padding:11px;border:none;border-radius:12px;
          background:linear-gradient(135deg,#c54542,#8b2a2a);color:white;
          font-size:13px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 12px rgba(197,69,66,0.35);
          transition:opacity 0.2s;
        " onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
          ⭐ Leave Feedback
        </button>
      </div>
    `;
  };

  const widget = document.createElement('div');
  widget.id = 'aria-chatbot-widget';
  widget.innerHTML = `
    <div id="aria-chat-bubble" data-action="toggle-chat" title="Chat with Aria" style="
      position:fixed; bottom:24px; right:24px; z-index:9999;
      width:60px; height:60px; border-radius:50%;
      background:linear-gradient(135deg,#c54542,#8b2a2a);
      box-shadow:0 8px 32px rgba(197,69,66,0.5);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:transform 0.2s, box-shadow 0.2s;
      border:2px solid rgba(255,255,255,0.2);
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      ${isOpen
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    }
      ${!isOpen ? `<span style="position:absolute;top:-4px;right:-4px;background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid white;"></span>` : ''}
    </div>

    ${isOpen ? `
    <div id="aria-chat-panel" style="
      position:fixed; bottom:96px; right:24px; z-index:9998;
      width:360px; max-height:580px;
      background:white; border-radius:20px;
      box-shadow:0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(197,69,66,0.15);
      display:flex; flex-direction:column; overflow:hidden;
      animation:chatSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
      border:1px solid rgba(0,0,0,0.06);
    ">
      <!-- Header -->
      <div style="
        background:linear-gradient(135deg,#0f141a,#1e2530);
        padding:14px 18px; display:flex; align-items:center; gap:12px; flex-shrink:0;
      ">
        <div style="
          width:42px; height:42px; border-radius:50%;
          background:linear-gradient(135deg,#c54542,#8b2a2a);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; flex-shrink:0; box-shadow:0 4px 12px rgba(197,69,66,0.4);
        ">✨</div>
        <div>
          <div style="color:white;font-weight:700;font-size:15px;">${escapeHtml(chatbotSettingsState.assistantName)}</div>
          <div style="color:${chatbotSettingsState.enabled ? '#22c55e' : '#f59e0b'};font-size:11px;display:flex;align-items:center;gap:4px;">
            <span style="width:7px;height:7px;background:${chatbotSettingsState.enabled ? '#22c55e' : '#f59e0b'};border-radius:50%;display:inline-block;animation:pulse 1.5s infinite;"></span>
            AR Interia Assistant • ${chatbotSettingsState.enabled ? 'Online' : 'Paused'}
          </div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button data-action="clear-chat" title="Clear chat" style="
            background:rgba(255,255,255,0.1); border:none; border-radius:8px;
            color:rgba(255,255,255,0.7); cursor:pointer; padding:6px 8px; font-size:11px;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
            🗑️ Clear
          </button>
          <button data-action="toggle-chat" style="
            background:rgba(255,255,255,0.1); border:none; border-radius:8px;
            color:rgba(255,255,255,0.7); cursor:pointer; padding:6px 10px; font-size:16px;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✕</button>
        </div>
      </div>

      <!-- Tabs (registered users only) -->
      ${isRegistered ? `
      <div style="display:flex;background:#0f141a;border-bottom:2px solid rgba(255,255,255,0.07);flex-shrink:0;">
        <button data-action="chatbot-tab" data-tab="chat" style="
          flex:1;padding:9px 0;border:none;cursor:pointer;font-size:12px;font-weight:700;
          background:transparent;transition:all 0.2s;
          color:${activeTab === 'chat' ? '#c54542' : 'rgba(255,255,255,0.5)'};
          border-bottom:2px solid ${activeTab === 'chat' ? '#c54542' : 'transparent'};
          margin-bottom:-2px;
        ">💬 Chat</button>
        <button data-action="chatbot-tab" data-tab="activity" style="
          flex:1;padding:9px 0;border:none;cursor:pointer;font-size:12px;font-weight:700;
          background:transparent;transition:all 0.2s;
          color:${activeTab === 'activity' ? '#c54542' : 'rgba(255,255,255,0.5)'};
          border-bottom:2px solid ${activeTab === 'activity' ? '#c54542' : 'transparent'};
          margin-bottom:-2px;
        ">📊 My Activity</button>
      </div>` : ''}

      ${activeTab === 'activity' && isRegistered ? buildActivityPanel() : `
      <!-- Messages -->
      <div id="aria-messages" style="
        flex:1; overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:12px;
        background:#f8f9fb; scroll-behavior:smooth;
      ">
        ${messages.map(msg => `
          <div style="display:flex; flex-direction:column; align-items:${msg.role === 'user' ? 'flex-end' : 'flex-start'};">
            <div style="
              max-width:85%; padding:11px 14px; border-radius:${msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
              background:${msg.role === 'user' ? 'linear-gradient(135deg,#c54542,#a03532)' : 'white'};
              color:${msg.role === 'user' ? 'white' : '#1a1a2e'};
              font-size:13px; line-height:1.55;
              box-shadow:${msg.role === 'user' ? '0 4px 12px rgba(197,69,66,0.3)' : '0 2px 8px rgba(0,0,0,0.08)'};
              border:${msg.role === 'bot' ? '1px solid rgba(0,0,0,0.06)' : 'none'};
            ">${renderMarkdownText(msg.text)}</div>
            ${msg.quickReplies && msg.quickReplies.length > 0 && msg.role === 'bot' ? `
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; max-width:95%;">
                ${msg.quickReplies.map(qr => `
                  <button data-action="chat-quick-reply" data-reply="${escapeHtml(qr)}" style="
                    background:white; border:1.5px solid #c54542; border-radius:20px;
                    color:#c54542; font-size:11.5px; padding:5px 12px; cursor:pointer;
                    font-weight:600; transition:all 0.2s; white-space:nowrap;
                  " onmouseover="this.style.background='#c54542';this.style.color='white'" onmouseout="this.style.background='white';this.style.color='#c54542'">${escapeHtml(qr)}</button>
                `).join('')}
              </div>` : ''
      }
          </div>
        `).join('')}
        ${isTyping ? `
          <div style="display:flex; align-items:flex-start; gap:8px;">
            <div style="
              background:white; border-radius:18px 18px 18px 4px; padding:12px 16px;
              box-shadow:0 2px 8px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.06);
              display:flex; gap:4px; align-items:center;
            ">
              <span style="width:8px;height:8px;background:#c54542;border-radius:50%;animation:bounce 0.8s infinite 0s;display:inline-block;"></span>
              <span style="width:8px;height:8px;background:#c54542;border-radius:50%;animation:bounce 0.8s infinite 0.15s;display:inline-block;"></span>
              <span style="width:8px;height:8px;background:#c54542;border-radius:50%;animation:bounce 0.8s infinite 0.3s;display:inline-block;"></span>
            </div>
          </div>` : ''
      }
      </div>

      <!-- Suggested topics (shown only if 1 message) -->
      ${messages.length <= 1 ? `
      <div style="padding:0 14px 8px;background:#f8f9fb;display:flex;flex-wrap:wrap;gap:6px;">
        ${(isRegistered
          ? ['My Activity', 'My Bookings', 'Leave Feedback', 'Gallery', 'Pricing']
          : ['Services', 'Pricing', 'Book Now', 'Gallery', 'Contact']).map(t => `
          <button data-action="chat-quick-reply" data-reply="${t}" style="
            background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:20px;
            color:#555; font-size:11px; padding:4px 10px; cursor:pointer; transition:all 0.2s;
          " onmouseover="this.style.borderColor='#c54542';this.style.color='#c54542'" onmouseout="this.style.borderColor='rgba(0,0,0,0.1)';this.style.color='#555'">${t}</button>
        `).join('')}
      </div>` : ''}

      <!-- Input -->
      <div style="
        padding:12px 14px; background:white; border-top:1px solid rgba(0,0,0,0.07);
        display:flex; gap:8px; align-items:flex-end; flex-shrink:0;
      ">
        <textarea id="aria-chat-input" placeholder="${(cb.feedbackStep === 'awaiting-rating') ? 'Type 1–5 or tap a rating above…' : (cb.feedbackStep === 'awaiting-comment') ? 'Type your comment…' : 'Ask me anything about interior design…'}" rows="1" style="
          flex:1; border:1.5px solid rgba(0,0,0,0.12); border-radius:12px;
          padding:9px 13px; font-size:13px; resize:none; outline:none; max-height:80px;
          font-family:inherit; line-height:1.4; transition:border-color 0.2s;
          background:#fafafa;
        " onfocus="this.style.borderColor='#c54542'" onblur="this.style.borderColor='rgba(0,0,0,0.12)'">${escapeHtml(state.chatbot.inputText)}</textarea>
        <button id="aria-send-btn" data-action="send-chat" style="
          background:linear-gradient(135deg,#c54542,#8b2a2a); border:none; border-radius:12px;
          width:42px; height:42px; cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:transform 0.2s, box-shadow 0.2s; flex-shrink:0;
          box-shadow:0 4px 12px rgba(197,69,66,0.4);
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      `}
    </div>` : ''}
  `;

  // CSS animations
  if (!document.getElementById('aria-chatbot-style')) {
    const style = document.createElement('style');
    style.id = 'aria-chatbot-style';
    style.textContent = `
      @keyframes chatSlideIn {
        from { opacity: 0; transform: scale(0.85) translateY(20px); transform-origin: bottom right; }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      #aria-messages::-webkit-scrollbar { width: 4px; }
      #aria-messages::-webkit-scrollbar-track { background: transparent; }
      #aria-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
      #aria-chat-input { field-sizing: content; }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(widget);

  // Scroll messages to bottom
  if (isOpen && activeTab === 'chat') {
    requestAnimationFrame(() => {
      const msgs = document.getElementById('aria-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;

      // Wire up enter key on textarea
      const ta = document.getElementById('aria-chat-input') as HTMLTextAreaElement;
      if (ta) {
        ta.focus();
        ta.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChat();
          }
        });
        ta.addEventListener('input', () => {
          state.chatbot.inputText = ta.value;
        });
      }
    });
  }

  // Wire up click listener specifically for chatbot widget since it's outside main root
  widget.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('[data-action]') as HTMLElement;
    if (!button) return;

    const action = button.getAttribute('data-action');

    if (action === 'toggle-chat') {
      state.chatbot.isOpen = !state.chatbot.isOpen;
      mountChatbot();
    } else if (action === 'clear-chat') {
      if (confirm('Clear chat history?')) {
        resetChatbotMessages();
        mountChatbot();
      }
    } else if (action === 'chatbot-tab') {
      // Switch between Chat and My Activity tabs
      const tab = button.getAttribute('data-tab') as 'chat' | 'activity';
      if (tab) {
        state.chatbot.activeTab = tab;
        mountChatbot();
      }
    } else if (action === 'chatbot-activity-feedback') {
      // Switch to chat tab and start feedback flow
      state.chatbot.activeTab = 'chat';
      state.chatbot.feedbackStep = 'awaiting-rating';
      state.chatbot.messages.push(createMessage('bot',
        `⭐ **We'd love your feedback!**\n\nHow would you rate your overall experience with AR Interia?\n\n_1 = Poor · 5 = Excellent_`,
        ['1 ⭐ Poor', '2 ⭐⭐ Fair', '3 ⭐⭐⭐ Good', '4 ⭐⭐⭐⭐ Great', '5 ⭐⭐⭐⭐⭐ Excellent']
      ));
      mountChatbot();
    } else if (action === 'chat-quick-reply') {
      const reply = button.getAttribute('data-reply');
      if (!reply) return;

      // Route "My Activity" quick reply to activity tab
      if (reply === 'My Activity' && isRegistered) {
        state.chatbot.activeTab = 'activity';
        mountChatbot();
        return;
      }

      const actualAction = getQuickAction(reply);
      state.chatbot.messages.push(createMessage('user', actualAction));
      state.chatbot.isTyping = true;
      mountChatbot();

      setTimeout(() => {
        const response = getEnhancedChatbotResponse(actualAction);
        trackChatbotMessageStats(response);
        recordChatbotHistory(actualAction, response.text);
        state.chatbot.messages.push(createMessage('bot', response.text, response.quickReplies));
        state.chatbot.isTyping = false;
        mountChatbot();
        handleChatNavigationIntent(actualAction);
      }, 700 + Math.random() * 400);
    } else if (action === 'send-chat') {
      handleSendChat();
    }
  });
};

const handleSendChat = () => {
  const ta = document.getElementById('aria-chat-input') as HTMLTextAreaElement;
  const text = (ta ? ta.value : state.chatbot.inputText).trim();
  if (!text) return;

  const cb = state.chatbot;

  // --- Feedback rating step ---
  if (cb.feedbackStep === 'awaiting-rating') {
    const ratingMatch = text.match(/\b([1-5])\b/);
    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
    if (rating >= 1 && rating <= 5) {
      state.chatbot.messages.push(createMessage('user', text));
      cb.feedbackStep = 'awaiting-comment';
      cb.pendingFeedbackRating = rating;
      state.chatbot.inputText = '';
      const promptText = `${'⭐'.repeat(rating)} Thank you for the **${rating}-star rating!**\n\nWould you like to add any comments or suggestions? (Type your message or tap Skip)`;
      recordChatbotHistory(text, promptText);
      state.chatbot.messages.push(createMessage('bot',
        promptText,
        ['Skip — No Comment']
      ));
      mountChatbot();
      return;
    }
    // unrecognised input — re-ask
    state.chatbot.messages.push(createMessage('user', text));
    state.chatbot.inputText = '';
    const retryText = `Please pick a number from 1 to 5:`;
    recordChatbotHistory(text, retryText);
    state.chatbot.messages.push(createMessage('bot',
      retryText,
      ['1 ⭐ Poor', '2 ⭐⭐ Fair', '3 ⭐⭐⭐ Good', '4 ⭐⭐⭐⭐ Great', '5 ⭐⭐⭐⭐⭐ Excellent']
    ));
    mountChatbot();
    return;
  }

  // --- Feedback comment step ---
  if (cb.feedbackStep === 'awaiting-comment') {
    const rating: number = cb.pendingFeedbackRating || 5;
    const isSkip = /^skip/i.test(text);
    const comment = isSkip ? 'No additional comment.' : text;
    state.chatbot.messages.push(createMessage('user', text));
    cb.feedbackStep = null;
    cb.pendingFeedbackRating = 0;
    state.chatbot.inputText = '';
    state.chatbot.isTyping = true;
    mountChatbot();
    (async () => {
      try {
        if (state.currentUser?.id) {
          await apiFetch('/feedbacks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ rating, comment, designId: 'chatbot-general' })
          });
          refreshCustomerData();
        } else {
          addFeedback({ rating, comment, userName: 'Guest' } as any);
        }
      } catch (_e) { /* best-effort */ }
      state.chatbot.messages.push(createMessage('bot',
        `🎉 **Thank you for your feedback!** Your ${rating}-star review has been saved. We really appreciate it! 💛`,
        ['View Gallery', 'Book Consultation', 'My Activity']
      ));
      recordChatbotHistory(text, `🎉 Thank you for your feedback! Your ${rating}-star review has been saved.`);
      state.chatbot.isTyping = false;
      mountChatbot();
    })();
    return;
  }

  // Add user message
  state.chatbot.messages.push(createMessage('user', text));
  state.chatbot.inputText = '';
  state.chatbot.isTyping = true;
  mountChatbot();

  // Simulate typing delay then respond
  setTimeout(() => {
    const response = getEnhancedChatbotResponse(text);
    trackChatbotMessageStats(response);
    recordChatbotHistory(text, response.text);
    state.chatbot.messages.push(createMessage('bot', response.text, response.quickReplies));
    state.chatbot.isTyping = false;
    mountChatbot();
    handleChatNavigationIntent(text);
  }, 900 + Math.random() * 400);
};

mountChatbot();
init();
