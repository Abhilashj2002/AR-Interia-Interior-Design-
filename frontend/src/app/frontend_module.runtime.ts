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
    showConfirmPassword: false
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
      createMessage('bot', `ðŸ‘‹ Hi! I'm **Aria**, your AR Interia design assistant.\n\nAsk me anything about our services, pricing, or book a consultation!`, ['View Services', 'Pricing Info', 'Book Consultation'])
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
  greeting: `ðŸ‘‹ Hi! I'm **Aria**, your AR Interia design assistant.\n\nAsk me anything about our services, pricing, or book a consultation!`,
  bookingReply: `ðŸ“… **Booking Support**\n\nGreat choice! I can help you book right away.\n\n1. Open the **Inquiry** page\n2. Share room type, budget, and preferred date\n3. Our team confirms within **24 hours**\n\nðŸ“ž Need quick help: +91 8904712858`,
  suggestionsIntro: `âœ¨ Based on your interest, here are design ideas you can explore:`,
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
      text: 'ðŸ’¤ Chat assistant is temporarily disabled by admin. Please use the Inquiry page or call +91 8904712858.',
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
        text: 'ðŸ” To book a consultation, please sign in first so we can securely save your booking details and updates.',
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
      .map((design, index) => `${index + 1}. ${resolveDesignDisplayName(design, { imageUrl: design.previewImage, categoryId: design.categoryId })} â€” ${formatCurrency(getDesignAmount(design as any))}`)
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

  // Feedback intent â€” start the inline feedback flow
  const feedbackIntent = /\b(feedback|leave feedback|rate us|give rating|my review|submit feedback|review us|rate experience)\b/.test(lower);
  if (feedbackIntent) {
    if (!state.currentUser?.id) {
      return {
        text: `â­ Want to leave feedback? Please **sign in** first so we can save your review.`,
        quickReplies: ['Sign In', 'View Services', 'Pricing Info'],
        bookingIntent: false,
        suggestionIntent: false
      };
    }
    state.chatbot.feedbackStep = 'awaiting-rating';
    return {
      text: `â­ **We'd love your feedback!**\n\nHow would you rate your overall experience with AR Interia?\n\n_1 = Poor Â· 5 = Excellent_`,
      quickReplies: ['1 â­ Poor', '2 â­â­ Fair', '3 â­â­â­ Good', '4 â­â­â­â­ Great', '5 â­â­â­â­â­ Excellent'],
      bookingIntent: false,
      suggestionIntent: false
    };
  }

  // My Activity intent â€” switch chatbot to activity tab
  const activityIntent = /\b(my activity|my bookings|my history|what i liked|my orders|my profile|my likes|my feedback)\b/.test(lower);
  if (activityIntent && state.currentUser?.id) {
    state.chatbot.activeTab = 'activity';
    return {
      text: `ðŸ“Š I've opened your **Activity Summary**! Check your recent bookings, liked designs, and past feedback in the My Activity tab above.`,
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
    if (!state.currentUser?.id) {
      state.confirmMessage = 'Please sign in to continue booking.';
      navigateTo('login');
    } else {
      navigateTo('contact');
    }
    return;
  }

  if (lower.includes('gallery')) navigateTo('gallery');
  else if (lower.includes('portfolio')) navigateTo('portfolio');
  else if (lower.includes('services')) navigateTo('services');
  else if (lower.includes('showroom')) navigateTo('showroom');
  else if (lower.includes('categories') || lower.includes('browse categories')) navigateTo('categories');
  else if (lower.includes('design studio')) {
    if (!state.currentUser?.id) {
      state.confirmMessage = 'To use Design Studio, you need to log in.';
      navigateTo('login');
    } else {
      navigateTo('ai-studio');
    }
  }
  else if (lower.includes('ai studio') || lower.includes('ai-studio')) navigateTo('ai-studio');
  else if (lower.includes('inquiry') || lower.includes('contact')) navigateTo('contact');
  else if (lower.includes('sign in') || lower.includes('login')) navigateTo('login');
};

const renderStabilized = () => {
  render();
};

type RefreshOptions = {
  silent?: boolean;
  force?: boolean;
  forceRefresh?: boolean;
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
const ADMIN_CHARTS_AUTO_REFRESH_MS = 20000;
const ADMIN_INTERACTION_IDLE_MS = 10000;

const hasPendingBookingActions = () => Boolean(Object.keys((state.admin as any).bookingActionPending || {}).length);

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

const resolvePortfolioCategoryId = (item: any): string => {
  const rawCategoryId = String(item?.categoryId || '').trim();
  if (rawCategoryId) {
    if (rawCategoryId.startsWith('cat-')) return rawCategoryId;
    const normalizedId = rawCategoryId.toLowerCase();
    if (normalizedId.includes('apartment')) return 'cat-apartment';
    if (normalizedId.includes('classroom')) return 'cat-classroom';
    if (normalizedId.includes('custom')) return 'cat-custom';
    if (normalizedId.includes('dining room')) return 'cat-dining-room';
    if (normalizedId.includes('dining area')) return 'cat-diningarea';
    if (normalizedId.includes('epoxy floor')) return 'cat-epoxy-floor';
    if (normalizedId.includes('garden')) return 'cat-garden';
    if (normalizedId.includes('guest')) return 'cat-guestroom';
    if (normalizedId.includes('home theatre') || normalizedId.includes('home theater')) return 'cat-home-theatre';
    if (normalizedId.includes('kids bedroom') || normalizedId.includes('kid bedroom') || normalizedId.includes('kids-bedroom')) return 'cat-kids-bedroom';
    if (normalizedId.includes('meeting room')) return 'cat-meeting-room';
    if (normalizedId.includes('office interior') || normalizedId.includes('office')) return 'cat-office-interior';
    if (normalizedId.includes('epoxy')) return 'cat-epoxy';
    if (normalizedId.includes('bedroom') || normalizedId.includes('master-bedroom') || normalizedId.includes('kids-bedroom')) return 'cat-bedroom';
    if (normalizedId.includes('swimming pool')) return 'cat-swimming-pool';
    if (normalizedId.includes('terrace')) return 'cat-terrace';
    if (normalizedId.includes('living')) return 'cat-living';
    if (normalizedId.includes('kitchen')) return 'cat-kitchen';
    if (normalizedId.includes('bed')) return 'cat-masterbedroom';
    if (normalizedId.includes('bath')) return 'cat-bathroom';
    if (normalizedId.includes('balcony')) return 'cat-balcony';
    if (normalizedId.includes('wardrobe')) return 'cat-wardrobe';
    if (normalizedId.includes('dining')) return 'cat-diningarea';
    if (normalizedId.includes('pooja')) return 'cat-pooja';
    if (normalizedId.includes('gym')) return 'cat-gym';
    if (normalizedId.includes('spa')) return 'cat-spa';
    return `cat-${normalizeCategoryKey(rawCategoryId)}`;
  }

  const rawCategory = String(item?.category || '').trim().toLowerCase();
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
    if (rawCategory.includes('gym')) return 'cat-gym';
    if (rawCategory.includes('spa')) return 'cat-spa';
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
      description: 'Ultra-luxury 4BHK penthouse with 360Â° city views, smart home automation, and Italian marble finishes.',
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

const formatCurrency = (amount?: number) => `â‚¹${(amount || 0).toLocaleString('en-IN')}`;

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
  'spa': { economy: 'Relaxation Spa Nook', premium: 'Wellness Spa Wing', luxury: 'Private Wellness Spa Retreat' },
  'balcony': { economy: 'Functional Balcony Nook', premium: 'Premium Balcony Lounge', luxury: 'Sky Balcony Designer Deck' },
  'wardrobe': { economy: 'Smart Wardrobe Space', premium: 'Premium Dressing Suite', luxury: 'Bespoke Walk-in Closet' },
  'gym': { economy: 'Basic Home Fitness', premium: 'Premium Workout Studio', luxury: 'Private Wellness Gym' },
  'meeting room': { economy: 'Essential Meeting Space', premium: 'Premium Boardroom', luxury: 'Executive Conference Suite' },
  'classroom': { economy: 'Standard Learning Space', premium: 'Modern Training Room', luxury: 'Interactive Education Suite' },
  'epoxy floor': { economy: 'Standard Epoxy Finish', premium: 'Premium Resin Flooring', luxury: 'Designer Metallic Epoxy' }
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

const renderLogin = () => {
  const getPasswordRuleChecks = (password: string) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  });

  const getPasswordStrengthMeta = (password: string) => {
    if (!password) {
      return { score: 0, label: 'Enter password', color: '#cbd5e1' };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { score: Math.max(1, score), label: 'Weak', color: '#ef4444' };
    }
    if (score <= 4) {
      return { score, label: 'Medium', color: '#f59e0b' };
    }
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
  return `
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden" >
    <!--Background Image with Overlay-->
    <div class="absolute inset-0 overflow-hidden" >
      <img 
          src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80"
          alt="Classical Garden Room"
          class="w-full h-full object-cover motion-3d"
          data-motion3d="true"
      />
  <div class="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" > </div>
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" > </div>
      </div>

      <!--Animated light particles-->
        <div class="absolute inset-0 overflow-hidden pointer-events-none" >
          <div class="absolute top-20 left-10 w-2 h-2 bg-white/40 rounded-full animate-float-slow" > </div>
            <div class="absolute top-40 right-20 w-3 h-3 bg-amber-200/30 rounded-full animate-float-medium" > </div>
              <div class="absolute bottom-32 left-1/4 w-2 h-2 bg-white/50 rounded-full animate-float-fast" > </div>
                <div class="absolute top-1/3 right-1/3 w-1 h-1 bg-white/60 rounded-full animate-float-slow animation-delay-2000" > </div>
                  </div>

                  <div class="relative z-10 w-full max-w-6xl mx-auto px-4" >
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" >
                      <!--Left side - Branding & Info-->
                        <div class="text-white space-y-6 animate-fade-in-left" >
                          <div class="inline-flex items-center gap-3 bg-white/15 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/30 shadow-2xl" >
                            <div class="w-12 h-12 bg-gradient-to-br from-amber-600 via-[color:var(--accent)] to-amber-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg" >
                              A
                              </div>
                              <div >
                              <div class="font-display text-2xl font-bold tracking-wider" > AR INTERIA </div>
                                <div class="text-xs text-amber-200/90 tracking-[0.3em] uppercase" > Design Studio </div>
                                  </div>
                                  </div>

                                  <h1 class="text-5xl lg:text-6xl font-display font-bold leading-tight" >
                                    ${isSetupMode ? 'System<br/>Setup' : state.loginForm.isSignup ? 'Join Our<br/>Community' : 'Welcome<br/>Back'}
</h1>

  <p class="text-xl text-white/70 max-w-md" >
    ${isSetupMode
      ? 'Initialize your AR Interia platform with administrator credentials.'
      : state.loginForm.isSignup
        ? 'Experience the future of interior design with advanced visualization.'
        : 'Access your personalized design workspace and saved projects.'
    }
</p>

  <div class="grid grid-cols-3 gap-4 pt-6" >
    <div class="bg-white/15 backdrop-blur-xl rounded-xl p-4 border border-white/30 shadow-xl hover:bg-white/20 transition-all" >
      <div class="text-3xl mb-2" >ðŸŽ¨</div>
        <div class="text-sm font-semibold" > 3D Designs </div>
          </div>
          <div class="bg-white/15 backdrop-blur-xl rounded-xl p-4 border border-white/30 shadow-xl hover:bg-white/20 transition-all" >
            <div class="text-3xl mb-2" >ðŸ </div>
              <div class="text-sm font-semibold" > AR Preview </div>
                </div>
                <div class="bg-white/15 backdrop-blur-xl rounded-xl p-4 border border-white/30 shadow-xl hover:bg-white/20 transition-all" >
                  <div class="text-3xl mb-2" >ðŸ’¼</div>
                    <div class="text-sm font-semibold" > Portfolio </div>
                      </div>
                      </div>
                      </div>

                      <!--Right side - Login Form-->
                        <div class="animate-fade-in-right" >
                          <div class="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-amber-200/30 overflow-hidden" >
                            ${isSetupMode ? '<div class="bg-gradient-to-r from-amber-600 via-[color:var(--accent)] to-amber-700 text-white text-xs uppercase tracking-[0.3em] py-3 text-center font-bold">ðŸ” System Initialization</div>' : ''}

<div class="p-8 lg:p-10" >
  <div class="text-center mb-8" >
    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 via-[color:var(--accent)] to-amber-700 rounded-2xl text-white text-3xl font-bold mb-4 shadow-lg transform hover:scale-110 hover:rotate-3 transition-all" >
      ${isSetupMode ? 'ðŸ”§' : state.loginForm.isSignup ? 'âœ¨' : 'ðŸ‘¤'}
</div>
  <h2 class="text-2xl font-display font-bold text-slate-900 mb-2" >
    ${isSetupMode ? 'Admin Setup' : state.loginForm.isSignup ? 'Create Account' : 'Sign In'}
</h2>
  <p class="text-sm text-slate-600" >
    ${isSetupMode
      ? 'Set up your administrator account and secure access to the admin dashboard.'
      : state.loginForm.isSignup
        ? 'Start your design journey today'
        : 'Enter your credentials to continue'
    }
</p>
  </div>

  <form data-form="login" class="space-y-4" >
    ${(isSetupMode || state.loginForm.isSignup)
      ? `<div class="relative">
                        <input 
                          name="name" 
                          required 
                          placeholder="Full Name" 
                          class="w-full p-4 pl-12 bg-amber-50/50 rounded-xl border-2 border-amber-100 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                        />
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">ðŸ‘¤</span>
                      </div>`
      : ''
    }

<div class="relative" >
  <input 
                      name="email"
required
placeholder="Email or Username"
class="w-full p-4 pl-12 bg-amber-50/50 rounded-xl border-2 border-amber-100 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all outline-none"
  />
  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600" >ðŸ“§</span>
    </div>

    <div class="relative" >
      <input 
                      name="password"
required
type="${state.loginForm.showPassword ? 'text' : 'password'}"
placeholder="Password"
oninput="window.updatePasswordStrength && window.updatePasswordStrength(this.value)"
class="w-full p-4 pl-12 pr-12 bg-amber-50/50 rounded-xl border-2 border-amber-100 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all outline-none"
  />
  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600" >ðŸ”’</span>
  <button type="button" data-action="toggle-password" class="absolute right-4 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-600 transition-colors" aria-label="Toggle password visibility">
    ${state.loginForm.showPassword ? 'ðŸ™ˆ' : 'ðŸ‘ï¸'}
  </button>
    </div>

    <div class="-mt-2" >
      <div class="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden" >
        <div data-password-strength-bar class="h-full rounded-full transition-all" style="width: 0%; background: #cbd5e1;" > </div>
      </div>
      <div class="mt-1 text-xs font-semibold text-slate-500" >
        Strength: <span data-password-strength-label>Enter password</span>
      </div>
      <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2" >
        <div data-password-rule="length" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500" >
          <span data-password-rule-icon="length" class="font-bold" >â—‹</span>
          <span>At least 8 characters</span>
        </div>
        <div data-password-rule="uppercase" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500" >
          <span data-password-rule-icon="uppercase" class="font-bold" >â—‹</span>
          <span>One uppercase letter</span>
        </div>
        <div data-password-rule="number" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500" >
          <span data-password-rule-icon="number" class="font-bold" >â—‹</span>
          <span>One number</span>
        </div>
        <div data-password-rule="special" class="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500" >
          <span data-password-rule-icon="special" class="font-bold" >â—‹</span>
          <span>One special character</span>
        </div>
      </div>
    </div>

    ${(isSetupMode || state.loginForm.isSignup)
      ? `<div class="relative">
          <input 
            name="confirmPassword"
            required
            type="${state.loginForm.showConfirmPassword ? 'text' : 'password'}"
            placeholder="Confirm Password"
            class="w-full p-4 pl-12 pr-12 bg-amber-50/50 rounded-xl border-2 border-amber-100 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all outline-none"
          />
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600">ðŸ”</span>
          <button type="button" data-action="toggle-confirm-password" class="absolute right-4 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-600 transition-colors" aria-label="Toggle confirm password visibility">
            ${state.loginForm.showConfirmPassword ? 'ðŸ™ˆ' : 'ðŸ‘ï¸'}
          </button>
        </div>`
      : ''
    }

                  ${state.loginError
      ? `<div class="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm animate-shake">
                        <span class="text-xl">âš ï¸</span>
                        <span class="font-semibold">${escapeHtml(state.loginError)}</span>
                      </div>`
      : ''
    }

<button 
                    type="submit"
${(() => {
  if (isSetupMode || state.loginForm.isSignup) {
    const pwd = state.loginForm.password || '';
    const rules = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    const allRulesMet = Object.values(rules).every(r => r);
    return allRulesMet ? '' : 'disabled';
  }
  return '';
})()}
class="w-full py-4 bg-gradient-to-r from-amber-600 via-[color:var(--accent)] to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:-translate-y-0 disabled:hover:scale-100"
  >
  <span class="relative z-10" > ${isSetupMode ? 'ðŸš€ Initialize System' : state.loginForm.isSignup ? 'âœ¨ Create Account' : 'ðŸ”“ Sign In'} </span>
    <div class="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" > </div>
      </button>
      </form>

                ${!isSetupMode
      ? `<div class="mt-6 text-center">
                        <button 
                          type="button"
                          data-action="toggle-signup" 
                          class="inline-flex items-center gap-2 text-amber-700 text-sm font-bold hover:gap-3 hover:text-amber-600 transition-all"
                        >
                          <span>${state.loginForm.isSignup ? 'ðŸ‘ˆ Already have an account? Sign In' : 'ðŸ‘‰ New here? Create Account'}</span>
                        </button>
                      </div>`
      : ''
    }
</div>
  </div>
  </div>
  </div>
  </div>

  <style>
@keyframes slowZoom {
  0% { transform: scale(1.1); }
  100% { transform: scale(1.2); }
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
  50% { transform: translateY(-100px) translateX(20px); opacity: 0.8; }
}
@keyframes floatMedium {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
  50% { transform: translateY(-80px) translateX(- 30px); opacity: 1;
}
        }
@keyframes floatFast {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
  50% { transform: translateY(-120px) translateX(15px); opacity: 0.7; }
}
@keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
@keyframes shimmer {
  0% { background- position: -1000px 0;
}
100% { background- position: 1000px 0; }
        }
        .animate - slow - zoom { animation: slowZoom 20s ease-in-out infinite alternate; }
        .animate - float - slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate - float - medium { animation: floatMedium 6s ease-in-out infinite; }
        .animate - float - fast { animation: floatFast 5s ease-in-out infinite; }
        .animation-delay - 2000 { animation-delay: 2s; }
        .animation-delay - 4000 { animation-delay: 4s; }
        .animate - fade -in -left { animation: fadeInLeft 0.8s ease-out; }
        .animate - fade -in -right { animation: fadeInRight 0.8s ease-out; }
        .animate - shake { animation: shake 0.5s; }
</style>
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
      <section class="spidey-grid lg:grid-cols-[1fr_1.8fr] gap-8 mt-8">
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
              : '<div class="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">ðŸ </div>'}
                        <div class="absolute bottom-3 left-3 right-3 bg-black/60 text-white text-xs rounded-lg px-3 py-2">
                          <div class="font-semibold truncate">${escapeHtml(displayName)}</div>
                          <div class="text-[11px] text-white/80">${formatCurrency(getDesignAmount(design))}</div>
                        </div>
                      </button>
                      <div class="p-3 border-t border-black/5 bg-white">
                        <div class="flex gap-2">
                          <button data-action="like-design" data-design-id="${escapeHtml(design.id)}" data-like="like" class="px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold ${isLiked ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-600 bg-slate-50'}">ðŸ‘ Like</button>
                          <button data-action="like-design" data-design-id="${escapeHtml(design.id)}" data-like="dislike" class="px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold ${isLiked ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-white'}">ðŸ‘Ž Dislike</button>
                          <button data-action="quick-pay" data-design-id="${escapeHtml(design.id)}" class="flex-1 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-bold hover:opacity-90 transition">ðŸ“ Book Now</button>
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

      <section class="spidey-grid xl:grid-cols-[1.2fr_1.8fr] gap-8">
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
              <button type="submit" class="flex-1 px-5 py-3 rounded-lg bg-[color:var(--primary)] text-white font-semibold hover:opacity-90 transition">âœ“ Save Profile</button>
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
                    ${roomCount > 0 ? `<div class="text-[10px] text-slate-400">ðŸ› ${roomCount} room${roomCount !== 1 ? 's' : ''} included</div>` : ''}
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
                        ${isLiked ? 'â¤ï¸ Saved' : 'ðŸ¤ Save'}
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
              <h3 class="text-lg font-bold text-[color:var(--primary)]">ðŸ§  Saved Design Studio Concepts</h3>
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
                    <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(variantCategory)} â€¢ ${escapeHtml(formatInvoiceDateTime(record?.createdAt).display)}</div>
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
            <h3 class="text-lg font-bold text-[color:var(--primary)] mb-4">âœ“ Paid Designs</h3>
            <div class="space-y-4">
              ${paidDesigns.length > 0 ? paidDesigns.map((paidItem: any) => {
      const booking = bookings.find((item: any) => String(item?.id || '') === String(paidItem.bookingId || '')) || null;
      const bookingContext = booking ? resolveBookingDesignContext(booking) : (() => {
        const fallbackDesign = getDesigns().find((design: any) => String(design.id || '') === String(paidItem.designId || '')) || null;
        const fallbackDesignImage = fallbackDesign
          ? (Array.isArray(fallbackDesign.images) && fallbackDesign.images.length > 0
            ? String(fallbackDesign.images[0])
            : '')
          : '';
        return {
          displayName: paidItem.designName || fallbackDesign?.title || 'Design',
          imageUrl: normalizeAssetUrl(String(
            paidItem.imageUrl
            || fallbackDesign?.previewImage
            || fallbackDesignImage
            || '/category/Living room/living1.jpg'
          )),
          design: { id: paidItem.designId || '' }
        };
      })();
      const imageUrl = normalizeAssetUrl(String(bookingContext.imageUrl || paidItem.imageUrl || '/category/Living room/living1.jpg'));
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
                      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(bookingContext.displayName)}" class="w-14 h-14 rounded-xl object-cover border border-emerald-200" onerror="this.src='/category/Living room/living1.jpg'" />
                      <div class="min-w-0">
                      <div class="font-bold text-emerald-700 truncate">${escapeHtml(bookingContext.displayName)}</div>
                      <div class="text-xs text-slate-500">${escapeHtml(bookingDisplayLabel)} â€¢ ${escapeHtml(formatInvoiceDateTime(paidItem.bookedAt).display)}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-[color:var(--accent)]">${formatCurrency(Number(paidItem.amount || 0))}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${bookingStatusBadgeClass}">${escapeHtml(bookingStatusDisplay)}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${paymentBadgeClass}">âœ“ Paid</div>
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
              <h3 class="text-lg font-bold text-[color:var(--primary)]">ðŸ§¾ Invoices</h3>
              <button data-action="customer-load-invoices" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition">Load Invoices</button>
            </div>
            <div class="space-y-3">
              ${customerInvoices.length > 0 ? customerInvoices.slice(0, 8).map((invoice: any) => `
                <div class="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-[color:var(--primary)] truncate">${escapeHtml(String(invoice.invoiceNumber || invoice.id || 'Invoice'))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">ðŸ‘¤ Customer Name: ${escapeHtml(String(invoice.customerName || 'N/A'))}</div>
                    <div class="text-xs text-slate-500">Amount: ${formatCurrency(Number(invoice.totalAmount || invoice.amount || 0))} â€¢ ${escapeHtml(String(invoice.status || 'generated'))}</div>
                    <div class="text-[11px] text-slate-500 mt-1">ðŸ“¦ Booked Package: ${escapeHtml(String(invoice.packageName || invoice.designName || 'N/A'))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">ðŸŽ¨ Design Name: ${escapeHtml(String(invoice.designName || invoice.packageName || 'N/A'))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">ðŸ’³ Payment Mode: ${escapeHtml(formatPaymentMethodLabel(invoice.paymentMethod))}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">ðŸ—“ï¸ Payment Date: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).date)}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">â° Payment Time: ${escapeHtml(formatInvoiceDateTime(invoice.paymentDateTime || invoice.updatedAt || invoice.createdAt).time)}</div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button data-action="customer-view-invoice" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition">View</button>
                    <button data-action="customer-download-invoice" data-invoice-number="${escapeHtml(String(invoice.invoiceNumber || ''))}" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition">Download</button>
                  </div>
                </div>
              `).join('') : '<div class="text-center py-4 text-slate-400 italic text-sm">No invoices loaded yet. Tap "Load Invoices" to fetch your records.</div>'}
            </div>
          </div>

          <!-- Previous/Pending Bookings (Awaiting Payment) -->
          <div class="spidey-panel p-6">
            <h3 class="text-lg font-bold text-[color:var(--primary)] mb-4">â³ Pending Bookings (Awaiting Payment)</h3>
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
                      <div class="text-xs text-slate-500">${escapeHtml(bookingDisplayLabel)} â€¢ ${formatMonthYearDate(booking.createdAt)}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-[color:var(--accent)]">${formatCurrency(getBookingAmount(booking))}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${bookingStatusBadgeClass}">${escapeHtml(bookingStatusDisplay)}</div>
                      <div class="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${paymentBadgeClass}">${bookingPaymentStatus === 'failed' ? 'âœ— Failed' : 'â³ Pending'}</div>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-4 pt-3 border-t border-amber-200">
                    <button data-action="open-booking-details" data-booking-id="${booking.id}" class="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition">View Details</button>
                    ${bookingPaymentStatus !== 'paid' && isBookingApprovedForPayment(booking) ? `
                      <button type="button" data-action="pay-and-book" data-booking-id="${booking.id}" data-design-id="${escapeHtml(String(bookingContext.design?.id || booking.designId || ''))}" class="flex-1 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-bold hover:opacity-90 transition">ðŸ’³ Pay Now</button>
                    ` : ''}
                    ${bookingPaymentStatus !== 'paid' && !isBookingApprovedForPayment(booking) ? `
                      <div class="flex-1 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold text-center border border-blue-200">â³ Awaiting approval</div>
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
                  <button type="button" data-action="set-customer-rating" data-rating="${star}" class="text-2xl ${state.customer.rating >= star ? 'text-amber-400' : 'text-slate-300'} hover:scale-110 transition">â˜…</button>
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
                      <div class="text-amber-400 text-sm">${'â˜…'.repeat(Math.max(1, Number(item.rating || 0)))}</div>
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
  const isEditingUpload = Boolean(state.upload.editingId);
  const uploadDraft: any = state.upload.newModel || {};
  const selectedCategory = String(uploadDraft.category || '');
  const selectedAvailability = String(uploadDraft.availabilityStatus || 'available');
  const selectedPrice = Number(uploadDraft.price || 0);

  return `
    <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" data-action="close-upload">
      <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up" data-action="ignore">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-xl font-bold text-[color:var(--primary)]">${isEditingUpload ? 'Edit Design' : 'Upload New Design'}</h3>
          <button data-action="close-upload" class="text-slate-400 hover:text-slate-600 text-2xl">âœ•</button>
        </div>
        
        <form data-form="catalog-upload" class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
              <input name="title" value="${escapeHtml(String(uploadDraft.title || ''))}" required class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition" placeholder="e.g. Modern Living Room" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
              <select name="category" required class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition">
                <option value="">Select Category</option>
                ${categories.map(c => `<option value="${c.id}" ${selectedCategory === c.id ? 'selected' : ''}>${escapeHtml(c.title)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" rows="3" class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition" placeholder="Describe the design style, materials, etc.">${escapeHtml(String(uploadDraft.description || ''))}</textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (â‚¹)</label>
              <input name="price" type="number" value="${Number.isFinite(selectedPrice) ? selectedPrice : 0}" class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition" placeholder="0" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Availability</label>
              <select name="availabilityStatus" class="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 focus:bg-white transition">
                <option value="available" ${selectedAvailability === 'available' ? 'selected' : ''}>Available</option>
                <option value="unavailable" ${selectedAvailability === 'unavailable' ? 'selected' : ''}>Unavailable</option>
              </select>
            </div>
          </div>

          <div class="pt-2">
            <div class="relative group cursor-pointer">
              <input type="file" name="img" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" data-file-input="img" />
              <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center group-hover:border-[color:var(--primary)] transition bg-slate-50">
                <div class="text-2xl mb-2">ðŸ–¼ï¸</div>
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
              <span>âš ï¸</span> ${escapeHtml(state.upload.uploadError)}
            </div>
          ` : ''}

          <div class="pt-4">
            <button type="submit" class="w-full py-4 rounded-xl bg-[color:var(--primary)] text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" ${state.upload.isUploading ? 'disabled' : ''}>
              ${state.upload.isUploading ? '<span class="animate-spin">â³</span> Uploading...' : (isEditingUpload ? 'ðŸ’¾ Update Design' : 'ðŸš€ Publish Design')}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
};

const openCatalogUploadModal = (designId?: string | null) => {
  (state.admin as any).catalogPreviewId = null;
  (state.admin as any).catalogPreviewReturnModelId = '';
  const normalizedId = String(designId || '').trim();
  if (!normalizedId) {
    state.upload.open = true;
    state.upload.editingId = null;
    state.upload.uploadError = null;
    state.upload.newModel = {
      title: '',
      description: '',
      category: '',
      style: StyleType.MODERN,
      price: 0,
      availabilityStatus: 'available',
      previewImage: ''
    } as any;
    render();
    return;
  }

  const existingDesign = (state.customer.designs || []).find((design: any) => String(design?.id || '') === normalizedId)
    || (state.catalog || []).find((design: any) => String(design?.id || '') === normalizedId)
    || getDesigns().find((design: any) => String(design?.id || '') === normalizedId);

  if (!existingDesign) {
    state.confirmMessage = 'Unable to load design for editing.';
    render();
    return;
  }

  const normalizedImages = Array.isArray((existingDesign as any).images)
    ? (existingDesign as any).images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
    : [];
  const previewImage = String(
    normalizedImages[0]
    || (existingDesign as any).previewImage
    || ''
  ).trim();

  state.upload.open = true;
  state.upload.editingId = normalizedId;
  state.upload.uploadError = null;
  state.upload.newModel = {
    title: String((existingDesign as any).title || ''),
    description: String((existingDesign as any).description || ''),
    category: String((existingDesign as any).categoryId || ''),
    style: String((existingDesign as any).style || StyleType.MODERN),
    price: Number((existingDesign as any).price || 0),
    availabilityStatus: String((existingDesign as any).availabilityStatus || 'available'),
    previewImage
  } as any;
  render();
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
    <div class="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" data-action="cancel-catalog-action">
      <div class="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl" data-action="ignore">
        <h3 class="text-lg font-bold text-[color:var(--primary)] mb-2">${heading}</h3>
        <p class="text-sm text-slate-600 mb-3">${escapeHtml(dialogState.title || 'Selected design')}</p>
        <p class="text-sm text-slate-500 mb-5">${body}</p>
        <div class="flex justify-end gap-2">
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
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ‘Ž Disliked Design Feedback</h2>
        <span class="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600">${sorted.length} entries</span>
      </div>
      <div class="space-y-3 max-h-[420px] overflow-y-auto">
        ${sorted.length > 0 ? sorted.map((item: any) => `
          <div class="p-4 rounded-xl border border-black/10 bg-white">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(String(item.designTitle || 'Design'))}</div>
                <div class="text-xs text-slate-500">By ${escapeHtml(String(item.userName || item.userId || 'Customer'))} â€¢ ${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</div>
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
    String(state.admin?.bookingFilter?.paymentStatus || 'all'),
    String(state.admin?.bookingFilter?.approvalStatus || 'all'),
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
    String((state.admin as any)?.selectedCustomer?.id || '')
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

        <section class="spidey-grid admin-grid gap-5">
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

      <div class="admin-dashboard-metrics mt-8">
        ${dashboardSection}
      </div>

      <section class="admin-masonry-layout mt-20">
        <div class="admin-masonry-item admin-masonry-item--half">${bookingsSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${invoicesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${inquiriesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${categoriesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${designManagerSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${catalogSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${packageSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${calculatorSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${feedbackSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${dislikeFeedbackSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${chatbotSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${announcementsSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${themeSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${designStudioSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${servicesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${portfolioSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half">${luxuryEditorSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half" id="admin-showrooms">${showroomsSection}</div>
        <div class="admin-masonry-item admin-masonry-item--half" id="admin-showcases">${showcasesSection}</div>
        <div class="admin-masonry-item admin-masonry-item--full admin-masonry-item--customers">${customersSection}</div>
      </section>

      ${renderAdminBookingDetailsModal()}
      ${renderAdminInquiryDetailsModal()}
      ${renderAdminCustomerDetailsModal()}
        </section>

        ${renderAdminDesignEditor()}
        ${renderUploadModal()}
        ${renderCatalogPreviewModal()}
        ${renderCatalogActionDialog()}
    </div>
    `);
};

const getSampleHistoricalBookings = () => {
  const now = new Date();
  const bookings = [];
  const designs = getDesigns();
  const categories = getCategories();

  // Generate bookings for the past 12 months
  for (let i = 1; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, Math.floor(Math.random() * 28) + 1);
    const numBookings = Math.floor(Math.random() * 5) + 2; // 2-6 bookings per month

    for (let j = 0; j < numBookings; j++) {
      const design = designs[Math.floor(Math.random() * designs.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const isPaid = Math.random() > 0.3; // 70% paid

      bookings.push({
        id: `hist-booking-${i}-${j}`,
        userId: `user-${Math.floor(Math.random() * 50) + 1}`,
        designId: design?.id || 'design-1',
        designName: design?.title || 'Sample Design',
        categoryId: category?.id || 'cat-living',
        price: Math.floor(Math.random() * 50000) + 10000, // 10k-60k
        cost: Math.floor(Math.random() * 30000) + 5000, // 5k-35k
        status: isPaid ? 'confirmed' : 'pending',
        paymentStatus: isPaid ? 'paid' : 'pending',
        createdAt: date.toISOString(),
        bookingDate: date.toISOString()
      });
    }
  }

  return bookings;
};

const getAdminChartMetrics = (sourceBookings?: any[] | null) => {
  const rawBookings = Array.isArray(sourceBookings) ? sourceBookings : getEffectiveBookings();
  const historicalBookings = getSampleHistoricalBookings();
  const allBookings = [...rawBookings, ...historicalBookings];
  const bookings = (() => {
    const seen = new Set<string>();
    return allBookings
      .map((booking: any) => normalizeBookingRecord(booking))
      .filter((booking: any) => {
        const bookingId = String(booking?.id || '').trim();
        if (!bookingId) return true;
        if (seen.has(bookingId)) return false;
        seen.add(bookingId);
        return true;
      });
  })();

  const monthly = new Map<string, { label: string; revenue: number; expenses: number; bookings: number; customers: Set<string> }>();
  const categoryRevenue = new Map<string, number>();
  const categoryBookings = new Map<string, number>();
  const categoryTitleMap = new Map<string, string>();
  const categories = getCategories();
  categories.forEach((category) => {
    categoryTitleMap.set(String(category.id || ''), String(category.title || category.name || category.id || 'Unknown'));
  });

  const resolveCategoryId = (booking: any): string => {
    return String(booking?.categoryId || booking?.category_id || 'unknown');
  };

  const designs = (state.customer?.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  const designPriceById = new Map<string, number>();
  const designPriceByName = new Map<string, number>();

  designs.forEach((design: any) => {
    const designId = String(design?.id || '').trim();
    const designName = String(design?.title || '').trim();
    const designPrice = parseAmountValue(design?.price) || parseAmountValue(design?.cost);
    if (designId && designPrice > 0) designPriceById.set(designId, designPrice);
    if (designName && designPrice > 0) designPriceByName.set(normalizeKey(designName), designPrice);
  });

  const isRevenueRecognizedBooking = (booking: any) => {
    const paymentStatus = getBookingPaymentStatus(booking);
    if (paymentStatus === 'paid') return true;
    const bookingStatus = String(booking?.status || '').trim().toLowerCase();
    return bookingStatus === 'approved' || bookingStatus === 'confirmed' || bookingStatus === 'fulfilled';
  };

  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    monthly.set(key, {
      label: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      revenue: 0,
      expenses: 0,
      bookings: 0,
      customers: new Set()
    });
  }

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
      if (categoryId && categoryId !== 'unknown') {
        categoryRevenue.set(categoryId, (categoryRevenue.get(categoryId) || 0) + amount);
      }
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

  console.log('âœ… Charts updated with latest data');
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

  if (!document.hidden && !adminChartsRefreshInFlight && !isAdminInteractionWarm() && !hasPendingBookingActions()) {
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
    if (hasPendingBookingActions()) return;
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

const handleLogin = async (formData: FormData) => {
  state.loginError = '';
  const emailOrUsername = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const confirmPassword = String(formData.get('confirmPassword') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const isSetupMode = !state.adminAccount;

  if (!emailOrUsername || !password) {
    state.loginError = 'Email/username and password are required.';
    render();
    return;
  }

  const getPasswordPolicyMissingRules = (value: string) => {
    const missing: string[] = [];
    if (value.length < 8) missing.push('at least 8 characters');
    if (!/[A-Z]/.test(value)) missing.push('one uppercase letter');
    if (!/\d/.test(value)) missing.push('one number');
    if (!/[^A-Za-z0-9]/.test(value)) missing.push('one special character');
    return missing;
  };

  if (isSetupMode || state.loginForm.isSignup) {
    const missingRules = getPasswordPolicyMissingRules(password);
    if (missingRules.length > 0) {
      state.loginError = `Password must include ${missingRules.join(', ')}.`;
      render();
      return;
    }
  }

  if ((isSetupMode || state.loginForm.isSignup) && password !== confirmPassword) {
    state.loginError = 'Password and confirm password do not match.';
    render();
    return;
  }

  try {
    render(); // Show loading state

    // Handle Registration
    if (state.loginForm.isSignup) {
      if (!name) {
        state.loginError = 'Please enter your name.';
        render();
        return;
      }

      // Register via backend API
      const registerResponse = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: emailOrUsername,
          username: emailOrUsername.split('@')[0] || emailOrUsername,
          password
        })
      });

      let registerData;
      try {
        registerData = await registerResponse.json();
      } catch (e) {
        state.loginError = 'Backend error: Invalid response from server';
        render();
        return;
      }

      if (!registerData.success) {
        state.loginError = registerData.message || 'Registration failed';
        render();
        return;
      }

      const registeredUser = mergeUserProfileFields({
        id: registerData.customer.id,
        name: registerData.customer.name,
        email: registerData.customer.email,
        role: registerData.customer.role || 'customer',
        password,
        token: registerData.token
      } as User, state.users.find((u) => String(u.id || '') === String(registerData.customer.id) || String(u.email || '').toLowerCase() === String(registerData.customer.email || '').toLowerCase()));
      state.currentUser = registeredUser;
      syncCustomerPackagePreferences(state.currentUser.id);

      upsertUserInState(registeredUser);
      persistState();
      navigateTo('dashboard');
      schedulePostLoginSync();
      return;
    }

    // Handle Login
    const backendLoginCandidates = Array.from(new Set([
      emailOrUsername,
      emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : ''
    ].map((value) => String(value || '').trim()).filter(Boolean)));

    let loginResponse: Response | null = null;
    let loginData: any = null;

    for (const candidate of backendLoginCandidates) {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: candidate,
          password
        })
      });

      loginResponse = response;

      try {
        loginData = await response.json();
      } catch (e) {
        loginData = null;
      }

      if (response.ok && loginData?.success) {
        break;
      }
    }

    try {
      if (!loginResponse) {
        throw new Error('Unable to reach authentication service');
      }

      if (!loginResponse.ok || !loginData?.success) {
        const statusMessage = `Server returned ${loginResponse.status}: ${loginResponse.statusText}`;
        throw new Error(loginData?.message || statusMessage);
      }
    } catch (e) {
      console.error('Login parsing error or failure:', e);
      // Backend error or invalid response - try fallback to local users
      const localMatch = state.users.find((u) => (u.email === emailOrUsername || u.name === emailOrUsername || u.id === emailOrUsername || (u as any).username === emailOrUsername) && (u as any).password === password);
      if (localMatch) {
        state.currentUser = mergeUserProfileFields({ id: localMatch.id, name: localMatch.name, email: localMatch.email, role: localMatch.role || 'customer', password } as User, localMatch);
        syncCustomerPackagePreferences(state.currentUser.id);
        persistState();
        navigateTo(state.currentUser.role === 'admin' ? 'admin' : 'dashboard');
        schedulePostLoginSync();
        return;
      }
      state.loginError = e instanceof Error ? e.message : 'Invalid credentials or server error';
      render();
      return;
    }

    if (!loginData.success) {
      // Backend login failed â€” try local users fallback
      const localMatch = state.users.find((u) => (u.email === emailOrUsername || u.name === emailOrUsername || u.id === emailOrUsername || (u as any).username === emailOrUsername) && (u as any).password === password);
      if (localMatch) {
        state.currentUser = mergeUserProfileFields({ id: localMatch.id, name: localMatch.name, email: localMatch.email, role: localMatch.role || 'customer', password } as User, localMatch);
        syncCustomerPackagePreferences(state.currentUser.id);
        persistState();
        navigateTo(state.currentUser.role === 'admin' ? 'admin' : 'dashboard');
        schedulePostLoginSync();
        return;
      }
      state.loginError = loginData.message || 'Invalid credentials';
      render();
      return;
    }

    // Set current user from backend response
    state.currentUser = mergeUserProfileFields({
      id: loginData.customer.id,
      name: loginData.customer.name,
      email: loginData.customer.email,
      role: loginData.customer.role,
      password,
      token: loginData.token
    } as User, state.users.find((u) => String(u.id || '') === String(loginData.customer.id) || String(u.email || '').toLowerCase() === String(loginData.customer.email || '').toLowerCase()));
    syncCustomerPackagePreferences(state.currentUser.id);

    // Handle admin role
    if (loginData.customer.role === 'admin') {
      state.adminAccount = state.currentUser;
    } else {
      // Store customer in local users for compatibility
      if (state.currentUser) upsertUserInState(state.currentUser);
    }

    persistState();

    // Navigate based on role
    if (loginData.customer.role === 'admin') {
      navigateTo('admin');
      schedulePostLoginSync();
    } else {
      const pendingDesignId = sessionStorage.getItem('pending_booking_design_id');
      const pendingQuote = sessionStorage.getItem('pending_quote_package');

      if (pendingDesignId) {
        sessionStorage.removeItem('pending_booking_design_id');
        navigateTo('dashboard');
        schedulePostLoginSync();
        setTimeout(() => handleCustomerBooking(pendingDesignId), 500);
        return;
      } else if (pendingQuote) {
        sessionStorage.removeItem('pending_quote_package');
        try {
          const { name } = JSON.parse(pendingQuote);
          state.inquiryForm.message = `Requesting quote for: ${name} `;
          navigateTo('contact');
          schedulePostLoginSync();
          return;
        } catch (e) { }
      }

      navigateTo('dashboard');
      schedulePostLoginSync();
    }

  } catch (error) {
    state.loginError = error instanceof Error ? error.message : 'Login failed. Please try again.';
    render();
  }
};

// Old local-only backup logic (commented out for reference)
/*
const handleLoginOld = (formData: FormData) => {
  state.loginError = '';
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const isSetupMode = !state.adminAccount;
 
  if (isSetupMode && !state.adminAccount) {
    const initialAdmin: User = { id: 'admin-master', name, email, role: 'admin', password };
    state.adminAccount = initialAdmin;
    state.currentUser = initialAdmin;
    persistState();
    navigateTo('admin');
};
*/

const handleInquirySubmit = async (formData: FormData) => {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name || !email || !message) {
    state.confirmMessage = 'Please fill in all fields';
    state.formSubmitted = false;
    render();
    return;
  }

  // Create local inquiry for immediate UI feedback
  const newInquiry: Inquiry = {
    id: Date.now().toString(),
    userId: state.currentUser?.id,
    name,
    email,
    message,
    status: 'new',
    createdAt: new Date().toISOString(),
    isReadByAdmin: false
  };

  state.inquiries = [...state.inquiries, newInquiry];
  state.inquiryForm = { name: '', email: '', message: '' };
  state.formSubmitted = true;
  state.confirmMessage = 'Thank you! Your inquiry has been received. We will contact you soon.';
  persistState();
  render();

  // Send to backend API
  try {
    const response = await apiFetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Backend inquiry submission:', data);
      // Keep local save even if backend fails
      return;
    }

    console.log('Inquiry submitted to backend successfully');
  } catch (error) {
    console.error('Inquiry submission error:', error);
    // Local save is sufficient - backend may be offline
  }
};

const handlePublicFeedbackSubmit = async (formData: FormData) => {
  const name = String(formData.get('name') || '').trim();
  const comment = String(formData.get('comment') || '').trim();
  if (!comment) return;

  const payload = {
    userId: state.currentUser?.id,
    userName: name || state.currentUser?.name || 'A Valued Client',
    designId: undefined,
    rating: state.feedbackForm.rating,
    comment
  };

  try {
    const response = await apiFetch('/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({} as any));
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || 'Failed to save feedback');
    }

    const newFeedback: Feedback = {
      id: String(data.id || Date.now().toString()),
      userId: state.currentUser?.id,
      userName: payload.userName,
      rating: state.feedbackForm.rating,
      comment,
      createdAt: new Date().toISOString()
    };
    state.feedbacks = [newFeedback, ...state.feedbacks];
    state.customer.feedbacks = [newFeedback, ...state.customer.feedbacks];
    state.feedbackSubmitted = true;
    state.feedbackForm = { rating: 5, comment: '', name: '' };
    persistState();
    render();
    void refreshPublicFeedbacks({ silent: true });
    void refreshCustomerData({ silent: true });
    void refreshAdminData({ silent: true });
  } catch (error) {
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      userId: state.currentUser?.id,
      userName: payload.userName,
      rating: state.feedbackForm.rating,
      comment,
      createdAt: new Date().toISOString()
    };
    state.feedbacks = [newFeedback, ...state.feedbacks];
    state.customer.feedbacks = [newFeedback, ...state.customer.feedbacks];
    state.feedbackSubmitted = true;
    state.feedbackForm = { rating: 5, comment: '', name: '' };
    persistState();
    render();
    console.warn('Feedback save fell back to local state:', error);
  }
};

const handleAiAssist = async () => {
  if (!state.smartPrompt.trim()) return;
  state.isSmartLoading = true;
  render();
  try {
    const result = await getSmartDesignSuggestions(state.smartPrompt, getSelectedModel() || undefined);
    state.smartResult = result;
  } catch (error) {
    console.error('AI Error:', error);
  } finally {
    state.isSmartLoading = false;
    render();
  }
};

const handleCatalogUpload = async (formData: FormData) => {
  state.upload.uploadError = null;
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const price = Number(formData.get('price') || 0);
  const glbFile = formData.get('glb') as File | null;
  const imgFile = formData.get('img') as File | null;
  const existingDesign = state.upload.editingId
    ? (state.customer.designs.find((design) => design.id === state.upload.editingId)
      || state.catalog.find((design) => design.id === state.upload.editingId)
      || null)
    : null;

  const uploadFileToServer = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    const response = await apiFetch('/upload-image', {
      method: 'POST',
      body: uploadData,
      headers: state.currentUser?.token ? { Authorization: `Bearer ${state.currentUser.token}` } : {}
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({} as any));
      throw new Error(error?.message || 'Asset upload failed');
    }
    const data = await response.json().catch(() => ({} as any));
    return String(data?.path || '');
  };

  if (!title) {
    state.upload.uploadError = 'Please enter a design title.';
    render();
    return;
  }

  if (!category) {
    state.upload.uploadError = 'Please select a category.';
    render();
    return;
  }

  // For new designs, require at least preview image. GLB is optional in current backend flow.
  if (!state.upload.editingId) {
    if (!imgFile) {
      state.upload.uploadError = 'Please upload a preview image.';
      render();
      return;
    }
  }

  state.upload.isUploading = true;
  render();

  let resolvedPreviewImage = existingDesign?.previewImage || '';
  let resolvedModelUrl = existingDesign?.modelUrl || '';
  try {
    // Prefer persisted server uploads for catalog assets.
    if (imgFile && imgFile.size > 0) {
      try {
        const uploadedImagePath = await uploadFileToServer(imgFile);
        if (uploadedImagePath) {
          resolvedPreviewImage = uploadedImagePath;
        } else {
          resolvedPreviewImage = await fileToDataUrl(imgFile);
        }
      } catch {
        resolvedPreviewImage = await fileToDataUrl(imgFile);
      }
    }

    if (glbFile && glbFile.size > 0) {
      const uploadedModelPath = await uploadFileToServer(glbFile);
      if (!uploadedModelPath) {
        throw new Error('Failed to upload 3D model file.');
      }
      resolvedModelUrl = uploadedModelPath;
    }

    const payload: any = {
      title,
      description,
      categoryId: category,
      price,
      previewImage: resolvedPreviewImage,
      modelUrl: resolvedModelUrl
    };

    if (state.upload.editingId) {
      // Update existing design
      const response = await apiFetch(`/designs/${state.upload.editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.currentUser?.token || ''} `
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update design');
      }

      state.upload.open = false;
      state.upload.editingId = null;
      state.upload.newModel = {};

      // Respond instantly, then sync in background
      render();
      void refreshCustomerData({ silent: true });
    } else {
      // Create new design
      const response = await apiFetch('/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.currentUser?.token || ''} `
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create design');
      }

      const result = await response.json();
      state.upload.open = false;
      state.upload.newModel = {};

      // Respond instantly, then sync in background
      render();
      void refreshCustomerData({ silent: true });
    }
  } catch (error) {
    console.error('Upload error:', error);
    try {
      const fallbackCategory = getCategories().find((cat) => cat.id === category)
        || state.customer.categories.find((cat) => cat.id === category);
      const fallbackPayload: Omit<DesignModel, 'id'> = {
        title,
        description,
        category: (fallbackCategory?.title as RoomType) || RoomType.LIVING,
        categoryId: category,
        style: StyleType.MODERN,
        modelUrl: resolvedModelUrl,
        previewImage: resolvedPreviewImage,
        price,
        cost: 0,
        images: resolvedPreviewImage ? [resolvedPreviewImage] : [],
        motion3d: true,
        availabilityStatus: 'available',
        status: 'active'
      };

      if (state.upload.editingId) {
        updateDesign(state.upload.editingId, fallbackPayload);
      } else {
        saveDesign(fallbackPayload);
      }

      state.upload.open = false;
      state.upload.editingId = null;
      state.upload.newModel = {};
      state.upload.uploadError = null;
      void refreshCustomerData({ silent: true });
      state.confirmMessage = 'Saved locally. Backend sync failed, but design is available in this session.';
      render();
    } catch (fallbackError) {
      console.error('Local fallback upload error:', fallbackError);
      state.upload.uploadError = error instanceof Error ? error.message : 'Failed to save design. Please try again.';
      render();
    }
  } finally {
    state.upload.isUploading = false;
  }
};

const handleDeleteCatalogModel = async (id: string, requireConfirm = true) => {
  if (requireConfirm && !confirm('Are you sure you want to delete this design? This action cannot be undone.')) return;

  try {
    const response = await apiFetch(`/designs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.currentUser?.token || ''} `
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete design');
    }

    // Respond instantly, then sync in background
    render();
    void refreshCustomerData({ silent: true });
  } catch (error) {
    console.error('Delete error:', error);
    try {
      deleteDesign(id);
      state.customer.designs = state.customer.designs.filter((design) => design.id !== id);
      state.catalog = state.catalog.filter((model) => model.id !== id);
      persistState();
      render();
    } catch (fallbackError) {
      console.error('Delete local fallback error:', fallbackError);
      alert('Failed to delete design. Please try again.');
    }
  }
};

const handleArchiveCatalogModel = async (id: string) => {
  try {
    const response = await apiFetch(`/designs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.currentUser?.token || ''} `
      },
      body: JSON.stringify({ status: 'inactive' })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({} as any));
      throw new Error(error?.message || 'Failed to archive design');
    }

    render();
    Promise.all([refreshCustomerData({ silent: true }), refreshAdminData({ silent: true })]).catch((err) => {
      console.warn('Background archive sync failed:', err);
    });
  } catch (error) {
    console.warn('Archive API failed, applying local archive fallback:', error);
    updateDesign(id, { status: 'inactive', availabilityStatus: 'unavailable' } as Partial<DesignModel>);
    state.customer.designs = state.customer.designs.filter((design) => design.id !== id);
    state.catalog = state.catalog.map((m) => (m.id === id ? { ...m, isDeleted: true, status: 'inactive', availabilityStatus: 'unavailable' } : m));
    persistState();
    render();
  }
};

const syncDashboardsAndInvoices = async (options: { silent?: boolean } = {}) => {
  if (dashboardSyncInFlight) return;
  dashboardSyncInFlight = true;
  const silent = options.silent !== false;

  try {
    await Promise.allSettled([
      refreshCustomerData({ silent }),
      refreshAdminData({ silent, force: true })
    ]);

    autoSyncPortfolioMetrics();

    // Render as soon as core dashboard data is synced.
    render();

    // Keep invoice sync asynchronous to avoid blocking user interactions.
    void (async () => {
      if (state.currentUser?.id) {
        try {
          const customerInvoiceResponse = await apiFetch(`/invoices/customer/${encodeURIComponent(state.currentUser.id)}`, {
            headers: { ...getAuthHeaders() }
          }, 3000);
          const customerInvoiceData = await customerInvoiceResponse.json().catch(() => ({} as any));
          (state.customer as any).invoices = Array.isArray(customerInvoiceData?.invoices) ? customerInvoiceData.invoices : [];
        } catch (error) {
          console.warn('Customer invoice sync failed:', error);
        }
      }

      if (state.currentUser?.role === 'admin') {
        try {
          const adminInvoiceResponse = await apiFetch('/invoices/all', {
            headers: { ...getAuthHeaders() }
          }, 3000);
          const adminInvoiceData = await adminInvoiceResponse.json().catch(() => ({} as any));
          state.admin.invoices = Array.isArray(adminInvoiceData?.invoices) ? adminInvoiceData.invoices : [];
        } catch (error) {
          console.warn('Admin invoice sync failed:', error);
        }
      }

      render();
    })();

    if (state.activeTab === 'admin') {
      runWhenBrowserIdle(() => {
        initAdminChartsWhenVisible();
        updateAdminCharts();
      }, 700);
    }
    if (state.activeTab === 'portfolio') {
      runWhenBrowserIdle(() => {
        void initPortfolioCharts();
      }, 700);
    }

    console.log('âœ… [syncDashboardsAndInvoices] Complete. Admin bookings:', state.admin.bookings?.length || 0);
  } finally {
    dashboardSyncInFlight = false;
  }
};

const schedulePostLoginSync = () => {
  if (postLoginSyncTimer !== null) {
    window.clearTimeout(postLoginSyncTimer);
  }
  postLoginSyncTimer = window.setTimeout(() => {
    postLoginSyncTimer = null;
    void syncDashboardsAndInvoices({ silent: true });
  }, 0);
};

// Book design without payment
const handleBookDesignOnly = async (designId: string) => {
  const design = state.customer.designs.find((item) => item.id === designId);
  if (!design || !state.currentUser) return;
  const bookingDesignName = resolveDesignDisplayName(design, {
    imageUrl: design.previewImage,
    categoryId: design.categoryId,
    fallback: design.title || 'Design'
  });

  try {
    state.customer.paymentLoadingId = designId;
    render();

    const response = await apiFetch('/bookings/book-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        customerId: state.currentUser.id,
        designId: design.id,
        designName: bookingDesignName,
        cost: getDesignAmount(design as any)
      })
    });

    const data = await response.json();
    if (data.success) {
      state.customer.bookingMessage = 'Design booked successfully!';
      await syncDashboardsAndInvoices({ silent: true });
        console.log('âœ… Book-only flow synced. New bookings count:', state.admin.bookings?.length || 0);
    } else {
      state.customer.paymentError = data.message || 'Failed to book design';
    }
  } catch (error) {
    state.customer.paymentError = error instanceof Error ? error.message : 'Booking failed';
  } finally {
    state.customer.paymentLoadingId = null;
    render();
  }
};

// Razorpay payment integration
const handleRazorpayPayment = async (
  designId: string,
  paymentOpts?: { bookingId?: string; amountOverride?: number; discountCode?: string }
) => {
  const design = state.customer.designs.find((item) => item.id === designId)
    || getDesigns().find((item: any) => item.id === designId);
  if (!design || !state.currentUser) return;
  const bookingDesignName = resolveDesignDisplayName(design, {
    imageUrl: design.previewImage,
    categoryId: design.categoryId,
    fallback: design.title || 'Design'
  });

  try {
    state.customer.paymentLoadingId = 'razorpay';
    render();

    let bookingId = String(paymentOpts?.bookingId || '').trim();
    if (!bookingId) {
      // Create booking first when not initiated from an existing booking row.
      const bookingResponse = await apiFetch('/bookings/book-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          customerId: state.currentUser.id,
          designId: design.id,
          designName: bookingDesignName,
          cost: getDesignAmount(design as any)
        })
      });

      const bookingData = await bookingResponse.json();
      if (!bookingData.success) {
        throw new Error(bookingData.message || 'Failed to create booking');
      }
      bookingId = String(bookingData.bookingId || '').trim();
    }
    const payableAmount = Number.isFinite(Number(paymentOpts?.amountOverride))
      ? Math.max(1, Number(paymentOpts?.amountOverride))
      : getDesignAmount(design as any);

    // Create Razorpay order
    const paymentResponse = await apiFetch('/payments/razorpay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        customerId: state.currentUser.id,
        designId: design.id,
        bookingId,
        amount: payableAmount,
        discountCode: String(paymentOpts?.discountCode || '') || undefined
      })
    });

    const paymentData = await paymentResponse.json();
    if (!paymentData.success) {
      const fallbackMessage = paymentData.message || 'Razorpay is unavailable right now. Opening card payment instead.';
      state.customer.paymentError = fallbackMessage;
      state.customer.paymentLoadingId = null;
      await openFakeCardPayment(designId, paymentOpts);
      state.confirmMessage = fallbackMessage;
      render();
      return;
    }

    // Load Razorpay script
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.head.appendChild(script);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Open Razorpay checkout
    const rzpOptions = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.orderId,
      handler: async (response: any) => {
        // Verify payment
        const verifyResponse = await apiFetch('/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          })
        });

        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          state.customer.bookingMessage = 'Payment successful! Your design is booked.';
          await syncDashboardsAndInvoices({ silent: true });
          console.log('âœ… Razorpay payment synced to dashboards, charts, and invoices');
        } else {
          state.customer.paymentError = 'Payment verification failed';
        }
        state.customer.paymentLoadingId = null;
        render();
      },
      modal: {
        ondismiss: () => {
          // Handle when user clicks cancel/closes the modal
          state.customer.paymentLoadingId = null;
          state.customer.paymentError = 'Payment cancelled';
          render();
        }
      },
      prefill: {
        name: state.currentUser.name,
        email: state.currentUser.email
      },
      theme: {
        color: '#3399cc'
      }
    };

    const razorpay = new (window as any).Razorpay(rzpOptions);
    razorpay.open();
  } catch (error) {
    state.customer.paymentError = error instanceof Error ? error.message : 'Payment initiation failed';
    state.customer.paymentLoadingId = null;
    render();
  }
};

const createServerBooking = async (design: DesignModel) => {
  if (!state.currentUser) throw new Error('User not authenticated');
  const bookingDesignName = String(design.title || 'Design').trim() || 'Design';
  const response = await apiFetch('/bookings/pay-and-book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      customerId: state.currentUser.id,
      designId: design.id,
      amount: getDesignAmount(design),
      designName: bookingDesignName,
      cost: getDesignAmount(design)
    })
  });
  const data = await response.json().catch(() => ({} as any));
  if (!response.ok || !data?.bookingId || !data?.paymentId) {
    throw new Error(data?.message || 'Failed to create booking');
  }
  return { bookingId: data.bookingId, paymentId: data.paymentId };
};

const ensureServerPaymentForBooking = async (bookingId: string, amount: number, designId?: string) => {
  const response = await apiFetch('/payments/ensure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      bookingId,
      amount,
      designId: String(designId || '').trim() || undefined
    })
  });
  const data = await response.json().catch(() => ({} as any));
  if (!response.ok || !data?.paymentId) {
    throw new Error(data?.message || 'Unable to prepare payment for this booking.');
  }
  return { paymentId: String(data.paymentId), reused: Boolean(data.reused) };
};

const handleCustomerBooking = async (designId: string) => {
  const design = state.customer.designs.find((item) => item.id === designId);
  if (!design || !state.currentUser) return;

  state.customer.paymentError = '';
  let bookingId = '';
  let paymentId = '';
  let serverBooking = true;
  const amount = getDesignAmount(design);

  try {
    const created = await createServerBooking(design);
    bookingId = created.bookingId;
    paymentId = created.paymentId;
  } catch (error) {
    serverBooking = false;
    const booking = createBooking({
      userId: state.currentUser.id,
      designId: design.id,
      designName: String(design.title || 'Design').trim() || 'Design',
      categoryId: design.categoryId || '',
      price: amount,
      cost: design.cost || 0
    });
    const payment = createPayment({
      bookingId: booking.id,
      userId: state.currentUser.id,
      amount,
      provider: 'phonepe',
      status: 'pending'
    });
    bookingId = booking.id;
    paymentId = payment.id;
  }

  state.customer.bookingMessage = 'Your design is booked successfully';
  state.customer.paymentLoadingId = bookingId;

  try {
    const response = await createPhonePePayment({
      bookingId,
      paymentId,
      userId: state.currentUser.id,
      amount
    }, state.currentUser?.token);

    if (serverBooking) {
      apiFetch('/payments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          paymentId,
          status: 'pending',
          method: 'phonepe',
          metadata: { merchantTransactionId: response.merchantTransactionId }
        })
      }).catch((err) => console.warn('Payment metadata sync failed:', err));
    } else {
      updatePayment(paymentId, { metadata: { merchantTransactionId: response.merchantTransactionId } });
    }

    window.location.href = response.redirectUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment initiation failed.';
    state.customer.paymentError = message;
    if (serverBooking) {
      apiFetch('/payments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ paymentId, status: 'failed' })
      }).catch((err) => console.warn('Payment update failed:', err));
    } else {
      updateBooking(bookingId, { paymentStatus: 'failed' });
      updatePayment(paymentId, { status: 'failed' });
    }
    render();
    void refreshCustomerData({ silent: true });
  } finally {
    state.customer.paymentLoadingId = null;
  }
};

const openFakeCardPayment = async (
  designId: string,
  options?: { bookingId?: string; amountOverride?: number; discountCode?: string }
) => {
  const safeDesignId = String(designId || '').trim();
  const design = safeDesignId
    ? (state.customer.designs.find((item) => item.id === safeDesignId) || getDesigns().find((item) => item.id === safeDesignId))
    : null;
  if (!state.currentUser) return;
  let bookingId = '';
  let paymentId = '';
  let serverBooking = true;
  let amount = Number.isFinite(Number(options?.amountOverride))
    ? Math.max(1, Number(options?.amountOverride))
    : Number(design?.price || 0);

  const requestedBookingId = String(options?.bookingId || '').trim();
  if (requestedBookingId) {
    const existingBooking = (state.customer.bookings || []).find((item: any) => String(item?.id || '') === requestedBookingId)
      || getBookings().find((item: any) => String(item?.id || '') === requestedBookingId);
    if (existingBooking && !isBookingApprovedForPayment(existingBooking)) {
      state.customer.paymentError = 'Your booking is awaiting admin approval. Payment is enabled after approval.';
      render();
      return;
    }
    const existingPayment = [...(state.customer.payments || []), ...getPayments()]
      .find((item: any) => String(item?.bookingId || '') === requestedBookingId && String(item?.status || '').toLowerCase() !== 'completed');
    if (!Number.isFinite(Number(options?.amountOverride)) && existingBooking) {
      amount = Math.max(1, getBookingAmount(existingBooking));
    }
    bookingId = requestedBookingId;

    // Always prefer a server-verified payment id for server-backed bookings.
    if (existingBooking) {
      try {
        const ensured = await ensureServerPaymentForBooking(
          requestedBookingId,
          Math.max(1, Number(amount || 0)),
          String(existingBooking?.designId || safeDesignId || '')
        );
        paymentId = ensured.paymentId;
        serverBooking = true;
      } catch (error) {
        console.warn('Failed to ensure server payment for booking:', error);
      }
    }

    if (!paymentId && existingPayment) {
      paymentId = String(existingPayment.id || '');
      serverBooking = true;
    } else if (!paymentId) {
      // Older/legacy bookings can miss a payment row; create one so fake card flow can proceed.
      const createdPayment = createPayment({
        bookingId: requestedBookingId,
        userId: state.currentUser.id,
        amount: Math.max(1, Number(amount || 0)),
        provider: 'phonepe',
        status: 'pending'
      });
      paymentId = String(createdPayment.id || '');
      serverBooking = false;
    }
  }

  if (!bookingId || !paymentId) {
    if (!design) {
      state.customer.paymentError = 'Unable to find design for payment.';
      render();
      return;
    }
    try {
      const created = await createServerBooking(design);
      bookingId = created.bookingId;
      paymentId = created.paymentId;
    } catch (error) {
      serverBooking = false;
      const booking = createBooking({
        userId: state.currentUser.id,
        designId: design.id,
        designName: resolveDesignDisplayName(design, {
          imageUrl: design.previewImage,
          categoryId: design.categoryId,
          fallback: design.title || 'Design'
        }),
        categoryId: design.categoryId || '',
        price: amount,
        cost: design.cost || 0
      });
      const payment = createPayment({
        bookingId: booking.id,
        userId: state.currentUser.id,
        amount,
        provider: 'phonepe',
        status: 'pending'
      });
      bookingId = booking.id;
      paymentId = payment.id;
    }
  }

  (state.customer as any).fakePayment = {
    bookingId,
    paymentId,
    amount,
    baseAmount: amount,
    discountCode: String(options?.discountCode || ''),
    isServer: serverBooking
  };
  state.customer.paymentError = '';
  autoSyncPortfolioMetrics();
  render();
};

const submitCardPaymentWithProvider = async (cardNumber: string, cvv: string, name: string) => {
  const fp = (state.customer as any).fakePayment;
  if (!fp || !state.currentUser) return;

  const cleanCard = String(cardNumber || '').replace(/\s+/g, '');
  if (cleanCard.length < 12 || cleanCard.length > 19) {
    state.customer.paymentError = 'Enter a valid card number.';
    render();
    return;
  }
  if (String(cvv || '').trim().length < 3) {
    state.customer.paymentError = 'Enter a valid CVV.';
    render();
    return;
  }
  if (!String(name || '').trim()) {
    state.customer.paymentError = 'Enter cardholder name.';
    render();
    return;
  }

  const paymentDiscount = (state.customer as any).paymentDiscount;
  const amount = (() => {
    const baseAmount = Math.max(1, Number(fp.baseAmount || fp.amount || 0));
    const isDiscountActive = Boolean(paymentDiscount && paymentDiscount.bookingId === fp.bookingId);
    return isDiscountActive
      ? Math.max(1, Number(paymentDiscount.finalAmount || baseAmount))
      : baseAmount;
  })();
  const bookingId = String(fp.bookingId || '');
  const paymentId = String(fp.paymentId || '');
  const metadata = {
    paymentEntry: 'fake-card-simulated',
    discountCode: String(fp.discountCode || ''),
    cardLast4: cleanCard.slice(-4),
    cardHolder: String(name || '').trim().slice(0, 80),
    simulatedAt: new Date().toISOString()
  };

  state.customer.paymentError = '';
  state.customer.paymentLoadingId = bookingId;
  render();

  try {
    // Simulate gateway processing so user experience feels real even without API keys.
    await new Promise((resolve) => setTimeout(resolve, 700));

    let syncedServer = false;
    let serverSyncError = '';
    if (fp.isServer) {
      try {
        const completeResponse = await apiFetch('/payments/fake/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            bookingId,
            paymentId,
            cardNumber: cleanCard,
            cvv,
            name,
            amount,
            discountCode: String(fp.discountCode || '')
          })
        });
        if (!completeResponse.ok) {
          const completeData = await completeResponse.json().catch(() => ({} as any));
          throw new Error(completeData?.message || 'Server could not complete payment.');
        }

        const updateResponse = await apiFetch('/payments/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            paymentId,
            status: 'completed',
            method: 'card',
            amount,
            metadata
          })
        });
        if (!updateResponse.ok) {
          const updateData = await updateResponse.json().catch(() => ({} as any));
          throw new Error(updateData?.message || 'Payment sync failed while updating booking status.');
        }

        syncedServer = true;
      } catch (err) {
        serverSyncError = err instanceof Error ? err.message : 'Server payment sync failed.';
        console.warn('Server payment sync failed, falling back to local updates:', err);
      }
    }

    if (fp.isServer && !syncedServer) {
      throw new Error(serverSyncError || 'Payment could not be synced with server. Please retry from your booking card.');
    }

    // Local-only fallback bookings (no server row) still need optimistic local state updates.
    if (!fp.isServer) {
      const paymentCompletedAt = new Date().toISOString();
      updatePayment(paymentId, { status: 'success', amount, metadata, paymentDateTime: paymentCompletedAt } as any);
      updateBooking(bookingId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        price: amount,
        paymentDateTime: paymentCompletedAt,
        paidAt: paymentCompletedAt
      } as any);
    }

    state.customer.bookingMessage = 'Paid successfully! Your booking is confirmed.';
    (state.customer as any).fakePayment = undefined;
    (state.customer as any).paymentDiscount = undefined;
    (state.customer as any).paymentDiscountCode = '';
    (state.customer as any).paymentSuccessData = {
      amount,
      bookingId,
      cardLast4: cleanCard.slice(-4),
      discountCode: String(fp.discountCode || '')
    };
    state.customer.paymentLoadingId = null;

    await syncDashboardsAndInvoices({ silent: true });
    setTimeout(() => {
      console.log('âœ… Simulated card payment marked paid and synced to dashboards/charts/invoices');
      alert(`ðŸ’³ Payment Successful!\n\nâœ… Amount: â‚¹${amount.toLocaleString()}\nâœ… Invoice Generated\nâœ… Booking Confirmed\n\nYour invoice is available in your dashboard.`);
    }, 100);

    render();
  } catch (error) {
    state.customer.paymentError = error instanceof Error ? error.message : 'Payment failed.';
    state.customer.paymentLoadingId = null;
    render();
  }
};

const handleCustomerFeedback = async () => {
  if (!state.currentUser || !state.customer.feedbackText.trim()) return;

  try {
    const response = await apiFetch('/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        rating: state.customer.rating,
        comment: state.customer.feedbackText
      })
    });

    if (response.ok) {
      // Also add to local dataStore for fallback
      addFeedback({
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        rating: state.customer.rating,
        comment: state.customer.feedbackText
      });
      state.customer.feedbackText = '';
      state.customer.rating = 5;
      await refreshCustomerData();
      render();
    }
  } catch (error) {
    console.error('Feedback error:', error);
    // Fallback to local storage
    addFeedback({
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      rating: state.customer.rating,
      comment: state.customer.feedbackText
    });
    state.customer.feedbackText = '';
    state.customer.rating = 5;
    render();
    void refreshCustomerData({ silent: true });
  }
};

const updateCategoryForm = (categoryId: string) => {
  const category = state.customer.categories.find((cat) => cat.id === categoryId)
    || getCategories().find((cat) => cat.id === categoryId);
  if (!category) return;
  state.admin.categoryForm = {
    id: category.id,
    title: category.title || category.name || '',
    description: category.description || '',
    image: category.image || category.thumbnail || '',
    background: category.background || '',
    status: category.status || 'active'
  };
  const nextBackground = category.background || category.image || category.thumbnail || '';
  if (nextBackground) {
    state.siteSettings = { ...state.siteSettings, heroBg: nextBackground };
    persistState();
  }
  render();
};

const updateDesignForm = (designId: string) => {
  const design = state.customer.designs.find((item) => item.id === designId)
    || state.catalog.find((item) => item.id === designId)
    || getDesigns().find((item) => item.id === designId);
  if (!design) return;
  const normalizedImages = Array.isArray((design as any).images)
    ? (design as any).images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
    : [];
  const formImages = (normalizedImages.length > 0)
    ? normalizedImages
    : (design.previewImage ? [design.previewImage] : []);
  state.admin.designForm = {
    id: design.id,
    title: design.title,
    description: design.description,
    categoryId: design.categoryId || '',
    price: getDesignAmount(design),
    cost: design.cost || 0,
    modelUrl: design.modelUrl || '',
    images: formImages,
    availabilityStatus: design.availabilityStatus || 'available',
    status: design.status || 'active'
  };
  render();
};

const openAdminDesignEditor = (designId: string | null, modelId: string | null) => {
  let design = null;
  if (designId) {
    design = state.customer.designs.find((item) => item.id === designId)
      || state.catalog.find((item) => item.id === designId)
      || getDesigns().find((item) => item.id === designId);
  } else if (modelId) {
    design = state.catalog.find((m) => m.id === modelId);
  }
  
  if (!design) return;
  
  const stateCategories = Array.isArray(state.customer.categories) ? state.customer.categories : [];
  const allCategories = stateCategories.length > 0
    ? [...stateCategories]
    : [...getCategories()];
  const matchedCategory = allCategories.find((cat) => {
    const catLabel = (cat.title || cat.name || '').toLowerCase();
    return catLabel && catLabel === String(design.category || '').toLowerCase();
  });
  const resolvedCategoryId = design.categoryId || matchedCategory?.id || allCategories[0]?.id || '';
  
  (state.admin as any).designEditOpen = true;
  const normalizedImages = Array.isArray((design as any).images)
    ? (design as any).images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
    : [];
  const formImages = normalizedImages.length > 0
    ? normalizedImages
    : (design.previewImage ? [design.previewImage] : []);
  state.admin.designForm = {
    id: design.id,
    title: design.title,
    description: design.description || '',
    categoryId: resolvedCategoryId,
    price: getDesignAmount(design as any),
    cost: design.cost || 0,
    modelUrl: design.modelUrl || '',
    images: formImages,
    availabilityStatus: design.availabilityStatus || 'available',
    status: design.status || 'active'
  };
};

const handleCategorySubmit = async (formData: FormData) => {
  const imageFile = formData.get('imageFile') as File | null;
  const backgroundFile = formData.get('backgroundFile') as File | null;
  let image = String(formData.get('image') || '');
  let background = String(formData.get('background') || '');
  if (imageFile && imageFile.size > 0) {
    image = await fileToDataUrl(imageFile);
  }
  if (backgroundFile && backgroundFile.size > 0) {
    background = await fileToDataUrl(backgroundFile);
  }

  const existingCategoryMotion = state.admin.categoryForm.id
    ? (state.customer.categories.find((cat) => cat.id === state.admin.categoryForm.id)?.motion3d === true ||
      getCategories().find((cat) => cat.id === state.admin.categoryForm.id)?.motion3d === true)
    : false;

  const payload = {
    title: String(formData.get('title') || ''),
    description: String(formData.get('description') || ''),
    image,
    background,
    motion3d: state.admin.categoryForm.id ? existingCategoryMotion : true,
    status: (formData.get('status') as 'active' | 'inactive') || 'active'
  };

  let categoryId = state.admin.categoryForm.id || '';
  try {
    if (state.admin.categoryForm.id) {
      const resp = await apiFetch(`/categories/${encodeURIComponent(state.admin.categoryForm.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Category update failed');
    } else {
      const resp = await apiFetch('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
      const data = await resp.json().catch(() => ({} as any));
      if (!resp.ok) throw new Error(data?.message || 'Category creation failed');
      categoryId = data?.category?.id || categoryId;
    }
  } catch (error) {
    console.warn('Category API sync failed, using local store:', error);
    if (state.admin.categoryForm.id) {
      updateCategory(state.admin.categoryForm.id, payload);
    } else {
      const created = saveCategory(payload);
      categoryId = created.id;
    }
  }

  if (categoryId) {
    try {
      await apiFetch(`/category-metadata/${encodeURIComponent(categoryId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn('Category metadata sync failed:', error);
    }
  }

  state.admin.categoryForm = { title: '', description: '', image: '', background: '', status: 'active' };
  state.confirmMessage = state.admin.categoryForm.id ? 'Category updated.' : 'Category created.';
  
  // Background refresh without blocking render
  Promise.all([refreshCustomerData(), refreshAdminData()]).catch((err) => {
    console.warn('Background admin refresh failed after category save:', err);
  });
};

const handleDesignSubmit = async (formData: FormData) => {
  const imageFile = formData.get('image') as File | null;
  let imageData = '';
  if (imageFile && imageFile.size > 0) {
    imageData = await fileToDataUrl(imageFile);
  }

  const payload = {
    title: String(formData.get('title') || ''),
    description: String(formData.get('description') || ''),
    categoryId: String(formData.get('categoryId') || ''),
    price: Number(formData.get('price') || 0),
    cost: Number(formData.get('cost') || 0),
    images: imageData ? [imageData] : (state.admin.designForm.images || []),
    availabilityStatus: (formData.get('availabilityStatus') as 'available' | 'unavailable') || 'available',
    status: (formData.get('status') as 'active' | 'inactive') || 'active'
  };

  const category = getCategories().find((cat) => cat.id === payload.categoryId) || state.customer.categories.find((cat) => cat.id === payload.categoryId);
  const existingDesignMotion = state.admin.designForm.id
    ? (state.catalog.find((item) => item.id === state.admin.designForm.id)?.motion3d === true ||
      state.customer.designs.find((item) => item.id === state.admin.designForm.id)?.motion3d === true)
    : false;

  const modelPayload: Omit<DesignModel, 'id'> = {
    title: payload.title,
    description: payload.description,
    category: category ? (category.title as RoomType) : RoomType.LIVING,
    categoryId: payload.categoryId,
    style: StyleType.MODERN,
    modelUrl: '',
    previewImage: payload.images?.[0] || '',
    price: payload.price,
    cost: payload.cost,
    images: payload.images,
    motion3d: state.admin.designForm.id ? existingDesignMotion : true,
    availabilityStatus: payload.availabilityStatus,
    status: payload.status
  };

  let serverId = state.admin.designForm.id || '';
  try {
    if (serverId) {
      const resp = await apiFetch(`/designs/${encodeURIComponent(serverId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: modelPayload.title,
          description: modelPayload.description,
          categoryId: modelPayload.categoryId,
          price: modelPayload.price,
          cost: modelPayload.cost,
          previewImage: modelPayload.previewImage,
          modelUrl: modelPayload.modelUrl,
          availabilityStatus: modelPayload.availabilityStatus,
          status: modelPayload.status
        })
      });
      if (!resp.ok) throw new Error('Design update failed');
    } else {
      const resp = await apiFetch('/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: modelPayload.title,
          description: modelPayload.description,
          categoryId: modelPayload.categoryId,
          price: modelPayload.price,
          cost: modelPayload.cost,
          previewImage: modelPayload.previewImage,
          modelUrl: modelPayload.modelUrl
        })
      });
      const data = await resp.json().catch(() => ({} as any));
      if (!resp.ok) throw new Error(data?.message || 'Design creation failed');
      serverId = data?.designId || serverId;
    }
  } catch (error) {
    console.warn('Design API sync failed, using local store:', error);
    if (state.admin.designForm.id) {
      updateDesign(state.admin.designForm.id, modelPayload);
    } else {
      const created = saveDesign(modelPayload);
      serverId = created.id;
    }
  }
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
  state.confirmMessage = 'Design saved. Updated in background.';
  
  // Background refresh without blocking render
  Promise.all([refreshCustomerData(), refreshAdminData()]).catch((err) => {
    console.warn('Background admin refresh failed after design save:', err);
  });
};

const handleAdminDesignEditSubmit = async (formData: FormData) => {
  const imageFile = formData.get('image') as File | null;
  const modelFile = formData.get('modelFile') as File | null;
  const uploadFileToServer = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    const response = await apiFetch('/upload-image', {
      method: 'POST',
      body: uploadData,
      headers: state.currentUser?.token ? { Authorization: `Bearer ${state.currentUser.token}` } : {}
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({} as any));
      throw new Error(error?.message || 'Asset upload failed');
    }
    const data = await response.json().catch(() => ({} as any));
    return String(data?.path || '');
  };

  let imageData = '';
  if (imageFile && imageFile.size > 0) {
    try {
      const uploadedImagePath = await uploadFileToServer(imageFile);
      imageData = uploadedImagePath || await fileToDataUrl(imageFile);
    } catch {
      imageData = await fileToDataUrl(imageFile);
    }
  }

  let modelData = String(state.admin.designForm.modelUrl || '').trim();
  if (modelFile && modelFile.size > 0) {
    try {
      const uploadedModelPath = await uploadFileToServer(modelFile);
      modelData = uploadedModelPath || await fileToDataUrl(modelFile);
    } catch {
      modelData = await fileToDataUrl(modelFile);
    }
  }

  const title = String(formData.get('title') || state.admin.designForm.title || '');
  const price = Number(formData.get('price') || state.admin.designForm.price || 0);
  const cost = Number(formData.get('cost') || state.admin.designForm.cost || 0);
  const images = imageData ? [imageData] : (state.admin.designForm.images || []);
  const payload = {
    title,
    description: state.admin.designForm.description || '',
    categoryId: state.admin.designForm.categoryId || '',
    price,
    cost,
    images,
    availabilityStatus: state.admin.designForm.availabilityStatus || 'available',
    status: state.admin.designForm.status || 'active'
  };

  const category = getCategories().find((cat) => cat.id === payload.categoryId) || state.customer.categories.find((cat) => cat.id === payload.categoryId);
  const existingEditMotion = state.admin.designForm.id
    ? (state.catalog.find((item) => item.id === state.admin.designForm.id)?.motion3d === true ||
      state.customer.designs.find((item) => item.id === state.admin.designForm.id)?.motion3d === true)
    : false;

  const modelPayload: Omit<DesignModel, 'id'> = {
    title: payload.title,
    description: payload.description,
    category: category ? (category.title as RoomType) : RoomType.LIVING,
    categoryId: payload.categoryId,
    style: StyleType.MODERN,
    modelUrl: modelData,
    previewImage: payload.images?.[0] || '',
    price: payload.price,
    cost: payload.cost,
    images: payload.images,
    motion3d: state.admin.designForm.id ? existingEditMotion : true,
    availabilityStatus: payload.availabilityStatus,
    status: payload.status
  };

  const currentId = state.admin.designForm.id || '';
  let serverUpdated = false;
  if (currentId) {
    try {
      const resp = await apiFetch(`/designs/${encodeURIComponent(currentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: modelPayload.title,
          description: modelPayload.description,
          categoryId: modelPayload.categoryId,
          price: modelPayload.price,
          cost: modelPayload.cost,
          previewImage: modelPayload.previewImage,
          modelUrl: modelPayload.modelUrl,
          availabilityStatus: modelPayload.availabilityStatus,
          status: modelPayload.status
        })
      });
      const data = await resp.json().catch(() => ({}));
      serverUpdated = resp.ok && (data.success !== false);
    } catch (error) {
      console.warn('Design update via API failed, falling back to local store.', error);
    }
  }
  const existingDesigns = getDesigns();
  const hasDesign = existingDesigns.some((design) => design.id === currentId);
  const inCustomer = state.customer.designs.some((design) => design.id === currentId);
  let savedId = currentId;
  let nextDesigns: DesignModel[] = existingDesigns;
  if (hasDesign) {
    updateDesign(currentId, modelPayload);
    nextDesigns = getDesigns();
  } else if (currentId) {
    nextDesigns = [{ id: currentId, ...modelPayload }, ...existingDesigns];
    localStorage.setItem('ar_interia_designs_v2', JSON.stringify(nextDesigns));
  } else {
    const created = saveDesign(modelPayload);
    savedId = created.id;
    nextDesigns = getDesigns();
  }

  state.catalog = state.catalog.map((model) =>
    model.id === currentId
      ? {
        ...model,
        id: savedId,
        title: modelPayload.title,
        price: modelPayload.price,
        cost: modelPayload.cost,
        modelUrl: modelPayload.modelUrl,
        previewImage: modelPayload.previewImage,
        images: modelPayload.images,
        motion3d: modelPayload.motion3d === true
      }
      : model
  );
  persistState();

  state.admin.designForm = { ...state.admin.designForm, ...payload, id: savedId };
  (state.admin as any).designEditOpen = false;

  const normalizedFallback = nextDesigns.map((design: DesignModel) => ({
    ...design,
    motion3d: design.motion3d !== false,
    previewImage: design.previewImage ? normalizeAssetUrl(design.previewImage) : design.previewImage,
    images: design.images ? design.images.map((img: string) => normalizeAssetUrl(img)) : design.images
  }));
  if (inCustomer) {
    state.customer.designs = state.customer.designs.map((design) =>
      design.id === savedId
        ? {
          ...design,
          title: modelPayload.title,
          price: modelPayload.price,
          cost: modelPayload.cost,
          modelUrl: modelPayload.modelUrl,
          previewImage: modelPayload.previewImage,
          images: modelPayload.images,
          motion3d: modelPayload.motion3d === true
        }
        : design
    );
  } else {
    state.customer.designs = normalizedFallback;
  }
  
  // Close modal instantly without full page re-render
  const modal = document.querySelector('[data-modal="design-editor"]');
  if (modal) modal.classList.add('hidden');
  
  // Trigger background refresh without blocking UI
  Promise.all([refreshCustomerData(), refreshAdminData()]).catch((err) => {
    console.warn('Background admin refresh failed after save:', err);
  });
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  });

const generateImageVariants = async (dataUrl: string, prompt: string, count = 6): Promise<(AIDesignVariant & { design3DIndex: number })[]> => {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'room-image.jpg');
    formData.append('category', state.smartStudio.room || 'room');
    formData.append('style', 'Modern');
    if (prompt) {
      formData.append('customPrompt', prompt);
    }

    // Get auth token from current user session
    const token = state.currentUser?.token;
    if (!token) {
      throw new Error('Authentication required. Please log in to use Design Studio.');
    }

    // Call the new AI generation API
    const apiResponse = await apiFetch(
      '/ai/generate',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token} `
        },
        body: formData
      },
      60000
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error || 'AI generation failed');
    }

    const result = await apiResponse.json();
    const images: string[] = Array.isArray(result.images) ? result.images : [];

    if (images.length > 0 && images.some((img) => Boolean(img))) {
      return result.designs.map((design: any, index: number) => ({
        id: `variant - ${Date.now()} -${index} `,
        title: design.title,
        description: design.description,
        image: images[index] || dataUrl,
        styleTag: design.styleTag,
        design3DIndex: index
      }));
    }

    // Fallback: Apply visual styling to create distinct variations
    return await applyVisualStyling(dataUrl, result.designs, prompt);
  } catch (error) {
    console.error('[AI Generate] Error:', error);

    if (error instanceof Error && (/Stability API/i.test(error.message) || /Authentication required/i.test(error.message))) {
      throw error;
    }

    // Fallback to client-side generation if API fails
    console.warn('[AI Generate] Falling back to client-side generation');
    return generateImageVariantsClientSide(dataUrl, prompt, count);
  }
};

// Apply visual styling to Smart Engine-generated designs
const applyVisualStyling = async (dataUrl: string, designs: any[], prompt: string): Promise<(AIDesignVariant & { design3DIndex: number })[]> => {
  const img = new Image();
  img.src = dataUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const maxWidth = 1200;
  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  // Style mapping for visual filters
  const styleFilters: Record<string, { filters: string; key: string }> = {
    'Modern': { filters: 'contrast(1.15) brightness(1.08) saturate(0.9)', key: 'modern' },
    'Rustic': { filters: 'saturate(1.1) hue-rotate(-5deg) brightness(1.0) contrast(1.1)', key: 'rustic' },
    'Luxury': { filters: 'brightness(0.95) contrast(1.3) saturate(1.1) hue-rotate(-3deg)', key: 'luxury' },
    'Coastal': { filters: 'brightness(1.15) saturate(0.85) hue-rotate(10deg)', key: 'coastal' },
    'Industrial': { filters: 'saturate(0.8) contrast(1.25) brightness(0.92)', key: 'industrial' },
    'Tropical': { filters: 'saturate(1.3) hue-rotate(40deg) brightness(1.08)', key: 'tropical' },
    'Contemporary': { filters: 'contrast(1.2) saturate(1.0) brightness(1.05) grayscale(0.05)', key: 'contemporary' },
    'Mediterranean': { filters: 'hue-rotate(15deg) saturate(1.25) brightness(1.1) contrast(1.05)', key: 'mediterranean' }
  };

  return designs.map((design: any, index: number) => {
    const styleConfig = styleFilters[design.styleTag] || styleFilters['Modern'];

    // Apply filters to create visual distinction
    ctx.filter = styleConfig.filters;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply design-specific overlay
    ctx.filter = 'none';
    applyDesignVisualization(ctx, styleConfig.key as keyof typeof designElements, canvas.width, canvas.height);

    const styledImage = canvas.toDataURL('image/jpeg', 0.92);

    return {
      id: `variant - ${Date.now()} -${index} `,
      title: design.title,
      description: design.description,
      image: styledImage,
      styleTag: design.styleTag,
      design3DIndex: index
    } as AIDesignVariant & { design3DIndex: number };
  });
};

// Client-side fallback function
const generateImageVariantsClientSide = async (dataUrl: string, prompt: string, count = 6): Promise<(AIDesignVariant & { design3DIndex: number })[]> => {
  const img = new Image();
  img.src = dataUrl;

  // Load the actual uploaded photo
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const maxWidth = 1200;
  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  // Design variations with real materials and elements
  const designs = [
    {
      title: 'Modern Modular',
      styleTag: 'Modern',
      key: 'modern',
      filters: 'contrast(1.15) brightness(1.08) saturate(0.9)',
      description: 'Sleek white glossy lacquer cabinets with quartz countertop. Modular island layout with subway tile backsplash. Minimalist hardware, clean lines.'
    },
    {
      title: 'Rustic Wooden',
      styleTag: 'Rustic',
      key: 'rustic',
      filters: 'saturate(1.1) hue-rotate(-5deg) brightness(1.0) contrast(1.1)',
      description: 'Solid oak wooden cabinets with natural grain finish. Butcher block wooden countertop. Stone tile backsplash. Open shelving with rustic charm.'
    },
    {
      title: 'Luxury Premium',
      styleTag: 'Luxury',
      key: 'luxury',
      filters: 'brightness(0.95) contrast(1.3) saturate(1.1) hue-rotate(-3deg)',
      description: 'Handleless lacquer cabinets in matte black. Carrara marble waterfall island. Premium stone backsplash. High-end stainless steel appliances.'
    },
    {
      title: 'Coastal Light',
      styleTag: 'Coastal',
      key: 'coastal',
      filters: 'brightness(1.15) saturate(0.85) hue-rotate(10deg)',
      description: 'Light painted wood cabinets in soft white/cream. Light hardwood butcher block countertop. Glazed subway tile backsplash. Bar seating with open shelving.'
    },
    {
      title: 'Industrial Steel',
      styleTag: 'Industrial',
      key: 'industrial',
      filters: 'saturate(0.8) contrast(1.25) brightness(0.92)',
      description: 'Metal frame cabinets with reclaimed wood panels. Polished concrete countertop. Exposed brick/metal backsplash. Industrial shelving with steel frames.'
    },
    {
      title: 'Tropical Eco',
      styleTag: 'Tropical',
      key: 'tropical',
      filters: 'saturate(1.3) hue-rotate(40deg) brightness(1.08)',
      description: 'Bamboo or teak hardwood cabinets with warm finish. Natural stone or bamboo countertop. Slate backsplash with living plant wall. Eco-friendly sustainable materials.'
    },
    {
      title: 'Contemporary Chic',
      styleTag: 'Contemporary',
      key: 'contemporary',
      filters: 'contrast(1.2) saturate(1.0) brightness(1.05) grayscale(0.05)',
      description: 'Gray lacquer cabinets with integrated handles. Engineered quartz countertop. Geometric tile backsplash. Waterfall island with bar seating.'
    },
    {
      title: 'Mediterranean Warm',
      styleTag: 'Mediterranean',
      key: 'mediterranean',
      filters: 'hue-rotate(15deg) saturate(1.25) brightness(1.1) contrast(1.05)',
      description: 'Terracotta/earth-tone painted cabinets. Granite or slate countertop. Hand-painted ceramic tile backsplash. Warm natural wood accents.'
    }
  ].slice(0, Math.max(6, Math.min(count, 8)));

  return designs.map((design, index) => {
    // Apply base style filters to the uploaded image
    ctx.filter = design.filters;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply additional design visualization overlay
    ctx.filter = 'none';
    applyDesignVisualization(ctx, design.key as keyof typeof designElements, canvas.width, canvas.height);

    const styledImage = canvas.toDataURL('image/jpeg', 0.92);

    return {
      id: `variant - ${Date.now()} -${index} `,
      title: design.title,
      description: `${design.description}${prompt ? ' - ' + prompt : ''} `,
      image: styledImage,
      styleTag: design.styleTag,
      design3DIndex: index
    } as AIDesignVariant & { design3DIndex: number };
  });
};

// 2D rendering - no cleanup needed
const init3DViewers = () => {
  // 2D image viewer - no cleanup needed
  const containers = root.querySelectorAll<HTMLElement>('[data-ai-3d]');
  if (containers.length === 0) return;

  containers.forEach((container) => {
    // Get the design image from the variant
    const index = Number(container.dataset.designIndex || '0');
    const variant = state.smartStudio.variants[index];

    if (variant && variant.image) {
      // Display the 2D image in the container
      container.innerHTML = `
    < img
  src = "${escapeHtml(variant.image)}"
  alt = "${escapeHtml(variant.title)}"
  class="w-full h-full object-cover rounded-xl"
  loading = "lazy"
    />
    `;
    }
  });
};

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

root.addEventListener('click', async (event) => {


  const target = event.target as HTMLElement;
  const actionEl = target.closest('[data-action]') as HTMLElement | null;

  const action = actionEl?.getAttribute('data-action');
  if (!action || !actionEl) return;

  if (state.activeTab === 'admin') {
    const isAdminHeavyAction = action.startsWith('admin-')
      || action.startsWith('edit-')
      || action === 'open-upload'
      || action === 'open-design-editor'
      || action === 'view-booking'
      || action === 'view-customer'
      || action === 'approve-booking'
      || action === 'approve-for-payment'
      || action === 'decline-booking';
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

          alert('âœ… Design concepts saved to your dashboard! You can view them in the Customer Dashboard.');
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
      state.confirmMessage = `âœ… Portfolio metrics synced! Updated ${metricsArray.length} category data points from real purchases.`;
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
      state.selectedShowroomRoom = undefined;
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
              const formattedAmount = `â‚¹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      if (state.currentUser?.role !== 'admin') return;
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
      if (state.currentUser?.role !== 'admin') return;
      const customerId = button.getAttribute('data-customer-id');
      if (!customerId) return;
      (state.admin as any).viewingCustomerId = customerId;
      render();
      break;
    }
    case 'admin-edit-customer-inline': {
      if (state.currentUser?.role !== 'admin') return;
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
      openCatalogUploadModal(null);
      break;
    case 'open-upload-edit': {
      const designId = button.getAttribute('data-design-id');
      openCatalogUploadModal(designId);
      break;
    }
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
        updateDesignForm(id);
      }
      break;
    }
    case 'open-design-editor': {
      const designId = button.getAttribute('data-design-id');
      const modelId = button.getAttribute('data-model-id');
      (state.admin as any).catalogPreviewId = null;
      (state.admin as any).catalogPreviewReturnModelId = '';
      openAdminDesignEditor(designId, modelId);
      const modal = document.querySelector('[data-modal="design-editor"]');
      if (modal) modal.classList.remove('hidden');
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
      const modal = document.querySelector('[data-modal="design-editor"]');
      if (modal) modal.classList.add('hidden');
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
          console.log('âœ… AI design booking synced to customer/admin dashboards and charts');

          // Show success message and navigate to dashboard
          alert(`âœ… Design booked successfully! Booking ID: ${bookingData.bookingId}\\n\\nEstimated Cost: â‚¹${designPrice.toLocaleString()}\\n\\nYou can view this booking in your dashboard.`);
          navigateTo('dashboard');
        } catch (error) {
          console.error('Booking error:', error);
          alert(`âŒ Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        `â­ **We'd love your feedback!**\n\nHow would you rate your overall experience with AR Interia?\n\n_1 = Poor Â· 5 = Excellent_`,
        ['1 â­ Poor', '2 â­â­ Fair', '3 â­â­â­ Good', '4 â­â­â­â­ Great', '5 â­â­â­â­â­ Excellent']
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
      const selected = String((event.target as HTMLElement | null)?.closest('[data-action]')?.getAttribute('data-value') || 'all');
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
      console.log('ðŸ”„ Refreshing admin bookings...');
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
      console.log(`âœ… Synchronized packages from server cache${suffix}; age=${cacheAgeMs}ms`);
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
          <div style="font-size: 48px; margin-bottom: 20px; animation: spin 2s linear infinite;">ðŸŽ¨</div>
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
        ðŸ  ${roomName} â€” 3D Room View
      </div>
      <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);padding:8px 20px;border-radius:50px;color:rgba(255,255,255,0.75);font-size:12px;white-space:nowrap;pointer-events:none;">
        Drag to rotate Â· Scroll to zoom
      </div>
    </div>
    <div style="margin-top:18px;display:flex;gap:12px;">
      <button id="room3d-close-btn"
        style="background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.25);color:#fff;font-size:14px;font-weight:700;padding:12px 36px;border-radius:50px;cursor:pointer;letter-spacing:0.05em;">
        âœ• Close 3D View
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

  // Room geometry (inside of a box â€” normal inward)
  const roomSize = 8;
  const roomGeo = new BoxGeometry(roomSize, roomSize * 0.7, roomSize);
  // Flip normals for inside view
  const pos = roomGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const n = roomGeo.attributes.normal;
    n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  }
  roomGeo.attributes.normal.needsUpdate = true;

  // Wall material â€” neutral warm grey for side walls / ceiling / floor
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
    designWallMat     // -z back wall â†’ image is here
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
        >âœ• Close 3D View</button>
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
          const stars = 'â­'.repeat(Math.min(5, Math.max(1, Number(f.rating || 1))));
          const comment = String(f.comment || '').slice(0, 80);
          const date = formatMonthYearDate(f.createdAt);
          return `<div style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;">${stars}</span>
              <span style="font-size:10px;color:#94a3b8;">${date}</span>
            </div>
            <div style="font-size:11px;color:#475569;margin-top:3px;">${escapeHtml(comment)}${f.comment && f.comment.length > 80 ? 'â€¦' : ''}</div>
          </div>`;
        }).join('')
      : `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">No feedback submitted yet.</div>`;

    const invoiceRows = (state.customer.invoices || []).length
      ? (state.customer.invoices || []).map((inv: any) => {
          const displayName = inv.displayName || `Invoice #${inv.invoiceNumber || inv.id}`;
          const amount = inv.displayAmount || inv.amount || inv.price || 0;
          const date = inv.displayDate || inv.createdAt || inv.updatedAt || '';
          const dateStr = date ? new Date(date).toLocaleDateString() : '';
          const formattedAmount = `â‚¹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">ðŸ“‹ Recent Bookings</div>
          ${bookingRows}
        </div>
        <!-- Recent Invoices -->
        <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">ðŸ§¾ Recent Invoices</div>
          <button data-action="customer-load-invoices" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:8px;background:#f3f4f6;color:#374151;font-size:11px;font-weight:600;cursor:pointer;margin-bottom:8px;">Load Invoices</button>
          <div id="recent-invoices" style="font-size:12px;color:#94a3b8;padding:4px 0;">${invoiceRows}</div>
        </div>
        <!-- Liked / Disliked -->
        <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">â¤ï¸ Liked Designs</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">${likedRows}</div>
          <div style="font-size:11px;font-weight:700;color:#be185d;text-transform:uppercase;letter-spacing:0.05em;margin:10px 0 6px;">ðŸ‘Ž Disliked</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">${dislikedRows}</div>
        </div>
        <!-- Recent Feedback -->
        <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;color:#c54542;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">â­ My Feedback</div>
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
          â­ Leave Feedback
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
        ">âœ¨</div>
        <div>
          <div style="color:white;font-weight:700;font-size:15px;">${escapeHtml(chatbotSettingsState.assistantName)}</div>
          <div style="color:${chatbotSettingsState.enabled ? '#22c55e' : '#f59e0b'};font-size:11px;display:flex;align-items:center;gap:4px;">
            <span style="width:7px;height:7px;background:${chatbotSettingsState.enabled ? '#22c55e' : '#f59e0b'};border-radius:50%;display:inline-block;animation:pulse 1.5s infinite;"></span>
            AR Interia Assistant â€¢ ${chatbotSettingsState.enabled ? 'Online' : 'Paused'}
          </div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button data-action="clear-chat" title="Clear chat" style="
            background:rgba(255,255,255,0.1); border:none; border-radius:8px;
            color:rgba(255,255,255,0.7); cursor:pointer; padding:6px 8px; font-size:11px;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
            ðŸ—‘ï¸ Clear
          </button>
          <button data-action="toggle-chat" style="
            background:rgba(255,255,255,0.1); border:none; border-radius:8px;
            color:rgba(255,255,255,0.7); cursor:pointer; padding:6px 10px; font-size:16px;
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">âœ•</button>
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
        ">ðŸ’¬ Chat</button>
        <button data-action="chatbot-tab" data-tab="activity" style="
          flex:1;padding:9px 0;border:none;cursor:pointer;font-size:12px;font-weight:700;
          background:transparent;transition:all 0.2s;
          color:${activeTab === 'activity' ? '#c54542' : 'rgba(255,255,255,0.5)'};
          border-bottom:2px solid ${activeTab === 'activity' ? '#c54542' : 'transparent'};
          margin-bottom:-2px;
        ">ðŸ“Š My Activity</button>
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
        <textarea id="aria-chat-input" placeholder="${(cb.feedbackStep === 'awaiting-rating') ? 'Type 1â€“5 or tap a rating aboveâ€¦' : (cb.feedbackStep === 'awaiting-comment') ? 'Type your commentâ€¦' : 'Ask me anything about interior designâ€¦'}" rows="1" style="
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
        `â­ **We'd love your feedback!**\n\nHow would you rate your overall experience with AR Interia?\n\n_1 = Poor Â· 5 = Excellent_`,
        ['1 â­ Poor', '2 â­â­ Fair', '3 â­â­â­ Good', '4 â­â­â­â­ Great', '5 â­â­â­â­â­ Excellent']
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
      const promptText = `${'â­'.repeat(rating)} Thank you for the **${rating}-star rating!**\n\nWould you like to add any comments or suggestions? (Type your message or tap Skip)`;
      recordChatbotHistory(text, promptText);
      state.chatbot.messages.push(createMessage('bot',
        promptText,
        ['Skip â€” No Comment']
      ));
      mountChatbot();
      return;
    }
    // unrecognised input â€” re-ask
    state.chatbot.messages.push(createMessage('user', text));
    state.chatbot.inputText = '';
    const retryText = `Please pick a number from 1 to 5:`;
    recordChatbotHistory(text, retryText);
    state.chatbot.messages.push(createMessage('bot',
      retryText,
      ['1 â­ Poor', '2 â­â­ Fair', '3 â­â­â­ Good', '4 â­â­â­â­ Great', '5 â­â­â­â­â­ Excellent']
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
        `ðŸŽ‰ **Thank you for your feedback!** Your ${rating}-star review has been saved. We really appreciate it! ðŸ’›`,
        ['View Gallery', 'Book Consultation', 'My Activity']
      ));
      recordChatbotHistory(text, `ðŸŽ‰ Thank you for your feedback! Your ${rating}-star review has been saved.`);
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
