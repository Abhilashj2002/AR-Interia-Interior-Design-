
export enum RoomType {
  LIVING = 'Living Room',
  BEDROOM = 'Bedroom',
  KITCHEN = 'Kitchen',
  OFFICE = 'Home Office',
  BATHROOM = 'Bathroom',
  MASTERBEDROOM = 'Master Bedroom',
  KIDS = 'Kids Bedroom',
  GYM = 'Gym',
  THEATRE = 'Home Theatre',
  POOJA = 'Pooja Room',
  GARDEN = 'Garden',
  TERRACE = 'Terrace',
  BALCONY = 'Balcony',
  DINING = 'Dining Area',
  SPA = 'Spa',
  CLASSROOM = 'Classroom',
  POOL = 'Swimming Pool',
  MEETING = 'Meeting Room',
  OFFICE_INTERIOR = 'Office Interior',
  WARDROBE = 'Wardrobe',
  GUESTROOM = 'Guest Room'
}

export enum StyleType {
  INDIAN = 'Indian Traditional',
  MODERN = 'Contemporary',
  MINIMALIST = 'Minimalist'
}

export interface DesignModel {
  id: string;
  title: string;
  category: RoomType;
  style: StyleType;
  modelUrl: string;
  previewImage: string;
  description: string;
  price?: number;
  cost?: number;
  isDeleted?: boolean;
  availabilityStatus?: 'available' | 'unavailable';
  images?: string[];
  motion3d?: boolean;
  categoryId?: string;
  status?: 'active' | 'inactive';
}

export interface Category {
  id: string;
  title?: string;
  name?: string; // For filesystem-based categories
  description: string;
  image?: string;
  motion3d?: boolean;
  background?: string;
  thumbnail?: string; // For filesystem-based categories with first image
  images?: Array<{ name: string; url: string; motion3d?: boolean }>; // For filesystem-based categories
  imageCount?: number; // For filesystem-based categories
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  paymentId?: string;
  designId: string;
  designName: string;
  designImage?: string;
  categoryId: string;
  price: number;
  cost: number;
  status: 'booked' | 'pending' | 'confirmed' | 'cancelled' | 'fulfilled' | 'approved';
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  provider: 'stripe' | 'razorpay' | 'paypal' | 'phonepe';
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface LikeRecord {
  id: string;
  userId: string;
  designId: string;
  value: 'like' | 'dislike';
  createdAt: string;
}

export interface ProfitLossPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  propertyType: 'Villa' | 'Apartment' | 'Penthouse';
  location: string;
  area: string; // e.g., "3500 sqft"
  completionYear: string;
  images: Array<{ url: string; caption?: string }>;
  rooms: string[]; // e.g., ["Master Bedroom", "Living Room", "Kitchen"]
  featured?: boolean;
}

export interface PortfolioContent {
  founder: { name: string; role: string; bio: string; photo: string; famousDesign?: string };
  coFounder: { name: string; role: string; bio: string; photo: string; famousDesign?: string };
  designers: Array<{ name: string; role: string; bio: string; photo: string; famousDesign?: string }>;
  journey?: {
    title: string;
    intro: string;
    milestones: Array<{
      year: string;
      title: string;
      description: string;
    }>;
  };
  businessMetrics?: Array<{
    label: string;
    sales: number;
    customers: number;
  }>;
  feedbackVideos: Array<{
    url: string;
    title: string;
    showOnHomepage?: boolean;
    showOnPortfolio?: boolean;
  }>;
  featuredProjects: FeaturedProject[];
  aboutTitle?: string;
  worksTitle?: string;
  updatedAt?: string;
}

export interface CategoryEarning {
  categoryId: string;
  categoryTitle: string;
  earnings: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | string;
  address?: string;
  location?: string;
  pincode?: string;
  profilePhoto?: string;
  bio?: string;
  createdAt?: string;
  password?: string; // Simulated
  token?: string; // JWT token for API authentication
}

export interface Inquiry {
  id: string;
  userId?: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
  isReadByAdmin: boolean;
}

export interface Feedback {
  id: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AIRecommendation {
  suggestion: string;
  recommendedItems: string[];
  vibe: string;
  imageUrl?: string;
  variantCount?: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  video?: string;
}

export interface ServiceShowcase {
  id: string;
  title: string;
  style: string;
  duration: string;
  price: string;
  image: string;
  description: string;
  serviceId?: string;
  relatedImages?: string[];
}

export interface ShowroomLocation {
  area: string;
  phone: string;
}

export interface Showroom {
  id: string;
  city: string;
  locations: ShowroomLocation[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroBg: string;
  bgColor?: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  stats: { label: string; value: string }[];
}

export interface SiteTheme {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message?: string;
  content?: string;
  active: boolean;
  location: 'top_bar' | 'modal' | 'both' | 'homepage' | 'dashboard';
  startDate: string;
  endDate: string;
}

export interface PackageRoom {
  id: string;
  title: string;
  name?: string;
  category?: string;
  image: string;
  description?: string;
}

export interface Package {
  id: string;
  name: string;
  subtitle: string;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
  description: string;
  image: string;
  category: string;
  type?: 'Villa' | 'Apartment' | 'Standard';
  rooms?: PackageRoom[];
  createdAt?: string;
}

export interface CalculationRecord {
  id: string;
  userId?: string;
  userName: string;
  category: string;
  bhk: number;
  area: number;
  quality: string;
  shape: string;
  result: number;
  createdAt: string;
}

export interface CalculatorSettings {
  baseSqftRate: number;
  categoryMultipliers: Record<string, number>;
  qualityMultipliers: {
    economy: number;
    premium: number;
    luxury: number;
  };
  shapeMultipliers: {
    'Rectangle': number;
    'L-Shape': number;
    'T-Shape': number;
    'Custom': number;
  };
}

export interface AIDesignVariant {
  id: string;
  title: string;
  description: string;
  image: string;
  styleTag: string;
}

export interface AIDesignRecord {
  id: string;
  userId: string;
  originalImage: string;
  variants: AIDesignVariant[];
  status: 'draft' | 'quote_requested' | 'quoted';
  quoteAmount?: number | null;
  requestedAt?: string | null;
  createdAt?: string;
}

export type TabKey = 'home' | 'gallery' | 'categories' | 'services' | 'contact' | 'login' | 'admin' | 'dashboard' | 'designs' | 'ai-designs' | 'bookings' | 'users' | 'inquiries' | 'feedbacks' | 'settings' | 'ai-studio' | 'showroom' | 'portfolio';
export type RoomCategory = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Bathroom' | 'Office' | 'Dining Room' | 'Kids Room' | 'Gym' | 'Home Theatre' | 'Pooja Room' | 'Garden' | 'Terrace' | 'Balcony' | 'Spa' | 'Classroom' | 'Swimming Pool' | 'Meeting Room' | 'Office Interior' | 'Wardrobe' | 'Guest Room';

export interface CustomerState {
  id?: string;
  categories: Category[];
  designs: DesignModel[];
  bookings: Booking[];
  payments: any[];
  likes: LikeRecord[];
  feedbacks: Feedback[];
  aiDesigns: AIDesignRecord[];
  selectedDesignId: string | null;
  bookingMessage: string;
  activeCategory: string;
  galleryCategoryId: string;
  portfolioCategoryId: string;
  portfolioFilter: 'all' | '3d';
  portfolioSearchQuery: string;
  searchQuery: string;
  feedbackText: string;
  rating: number;
  paymentError: string;
  paymentLoadingId: string | null;
  imagePreview: {
    url: string;
    name: string;
    cost: number | null;
    categoryName: string;
    designId: string | null;
    isAIStudio?: boolean;
  } | null;
  categoryView?: { forceDesigns: boolean };
  viewer3d: {
    isOpen: boolean;
    designId: string;
    designImage: string;
    rotation: { x: number; y: number };
  } | null;
  showcase?: any[];
  portfolioDialog?: any;
  [key: string]: any;
}

export interface AdminState {
  editingId: string | null;
  categoryForm: Partial<Category>;
  designForm: Partial<DesignModel>;
  showroomForm: Partial<Showroom> & { name?: string };
  serviceForm: Partial<ServiceItem>;
  showcaseForm: Partial<ServiceShowcase>;
  announcementForm: Partial<Announcement>;
  packageForm: Partial<Package>;
  chatbotForm: {
    ruleId: string | null;
    keywords: string;
    response: string;
    quickReplies: string;
  };
  viewingBookingId: string | null;
  designEditOpen: boolean;
  focusSection?: string;
  bookingFilter: {
    query: string;
    dateFrom: string;
    dateTo: string;
    categoryId: string;
    paymentStatus: 'all' | 'paid' | 'pending' | 'failed';
    approvalStatus: 'all' | 'pending' | 'approved' | 'declined';
  };
  invoices: any[];
  invoiceFilter: {
    query: string;
    status: 'all' | 'generated' | 'sent' | 'paid';
  };
  selectedInvoice?: any | null;
  bookings: Booking[];
  bookingSummary?: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    approved: number;
    paidDesigns: number;
  };
  aiDesigns: AIDesignRecord[];
  loadedCategory?: { id?: string; title?: string; images: Array<{ url: string; name?: string; categoryId?: string; categoryName?: string; index?: number; motion3d?: boolean }> };
  catalogFilter: string;
  catalogFilterDraft: string;
  packageCategoryFilter: string;
  packageCategoryFilterDraft: string;
  calculatorSettings: CalculatorSettings;
  calculatorForm: CalculatorSettings;
  calculatorTab: 'settings' | 'history';
  calculatorImageLibrary?: any[];
  inquiries?: Inquiry[];
}

export interface UploadState {
  open: boolean;
  editingId: string | null;
  isUploading: boolean;
  uploadError: string | null;
  newModelFiles: { glb: File | null; img: File | null };
  newModel: Partial<DesignModel>;
}

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}

export interface State {
  activeTab: TabKey;
  theme: SiteTheme;
  announcements: Announcement[];
  catalog: DesignModel[];
  inquiries: Inquiry[];
  feedbacks: Feedback[];
  services: ServiceItem[];
  serviceShowcases: ServiceShowcase[];
  showrooms: any[];
  currentUser: User | null;
  adminAccount: User | null;
  users: User[];
  loginForm: {
    email: string;
    password?: string;
    isSignup: boolean;
    showPassword: boolean;
    showConfirmPassword: boolean;
    twoFactorChallengeId?: string;
    twoFactorCode?: string;
    twoFactorMessage?: string;
    twoFactorDeliveryMethod?: string;
    twoFactorDeliveredTo?: string;
    twoFactorDebugCode?: string;
  };
  loginError: string;
  mobileMenuOpen: boolean;
  selectedModelId: string | null;
  roomFilter: RoomType | 'All';
  siteSettings: SiteSettings;
  isSmartLoading: boolean;
  smartPrompt: string;
  smartResult: AIRecommendation | null;
  feedbackForm: {
    name: string;
    rating: number;
    comment: string;
  };
  feedbackSubmitted: boolean;
  confirmMessage: string | null;
  inquiryForm: { name: string; email: string; message: string };
  formSubmitted: boolean;
  upload: UploadState;
  searchQuery: string;
  customer: CustomerState;
  admin: AdminState;
  smartStudio: {
    room: RoomCategory;
    prompt: string;
    originalImage: string | null;
    variants: any[];
    isGenerating: boolean;
    error: string;
  };
  showroomPropertyType: 'house' | 'apartment';
  selectedShowroomRoom: string | undefined;
  videoModalOpen: boolean;
  currentVideoUrl: string;
  currentVideos: any[];
  portfolioContent: PortfolioContent;
  chatbot: {
    isOpen: boolean;
    activeTab: 'chat' | 'activity';
    feedbackStep: null | 'awaiting-rating' | 'awaiting-comment';
    pendingFeedbackRating: number;
    messages: ChatMessage[];
    inputText: string;
    isTyping: boolean;
  };
  calculator: {
    isOpen: boolean;
    category: string;
    bhk: number;
    area: number;
    quality: string;
    shape: string;
    result: number | null;
    settings: CalculatorSettings;
    history?: CalculationRecord[];
    selectedDesignId?: string | null;
    relatedDesigns?: any[];
  };
}
