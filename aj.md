# AR Interia - Complete Architecture & Programming Guide

## Table of Contents
1. [Technology Stack & Language Breakdown](#technology-stack)
2. [Admin Control Panel Logic](#admin-controls)
3. [Customer Dashboard Logic](#customer-dashboard)
4. [Chatbot Logic & Implementation](#chatbot)
5. [Homepage Features & Logic](#homepage)
6. [Portfolio Section Logic](#portfolio)
7. [Services & Packages Logic](#services-packages)
8. [Price Calculator Logic](#price-calculator)
9. [API Endpoints Reference](#api-endpoints)
10. [Database Schema & Tables](#database-schema)
11. [Data Flow Diagrams](#data-flow)

---

## Technology Stack & Language Breakdown {#technology-stack}

### Frontend Stack
**Programming Language:** TypeScript 5.x (compiled to JavaScript)
**UI Framework:** Vanilla JavaScript + HTML5/CSS3 (No React - custom render engine)
**Build Tool:** Vite 5.x
**Package Manager:** npm
**Entry Point:** `main.ts` (~12,000 lines)
**Key Libraries:**
- `jsonwebtoken` - JWT token parsing on client
- `bcryptjs` - Not used on frontend (backend only)
- `datepicker` - Date inputs for bookings

**Why TypeScript Instead of JS?**
- Static type checking for 100+ data entities
- Compile-time error detection for complex state management
- Autocomplete support in IDE
- Prevents runtime `null/undefined` crashes in critical paths

**Why No React/Vue?**
- Lightweight library footprint (~0KB runtime overhead)
- Complete control over render cycle and DOM updates
- Learning curve: Easy HTML/CSS/JS understanding
- Perfect for SEO-friendly static-generated designs

### Backend Stack
**Language:** Node.js (JavaScript ES Modules)
**Framework:** Express.js 4.x
**Database:** SQLite 3
**Authentication:** JWT + bcryptjs
**Server Port:** 5175 (configurable via `PAYMENT_SERVER_PORT`)
**Entry Point:** `server/index.js`

**Key Backend Modules:**
- `server/index.js` - Express API server (2,400+ lines)
- `server/db.js` - SQLite initialization & migrations
- `server/database.js` - Additional DB helpers
- `server/razorpay.js` - Razorpay payment gateway
- `server/routes/smartGenerate.js` - AI design generation routes
- `server/routes/packages.js` - Package CRUD routes

---

## Admin Control Panel Logic {#admin-controls}

### Overview
The Admin Panel is a complete business management dashboard with:
- Real-time analytics & KPIs
- User & booking management
- Design & category management
- Payment processing & verification
- Theme customization
- AI design studio
- Chatbot feedback review
- Package & service management

### Architecture Pattern
**Single Page Application (SPA) Routing:**
- Tab-based navigation (no page reloads)
- URL path syncing: `/admin` → `activeTab: 'admin'`
- State management in memory + localStorage persistence

### Main Admin Render Functions (in `main.ts`)

#### 1. Dashboard Overview Section
**Function:** `renderAdminDashboardSection()` (Line 9568)
**Logic Flow:**
```typescript
// Step 1: Calculate KPIs
- Total Customers: Count from bookings
- Active Bookings: Filter where status != 'cancelled'
- Revenue Generated: Sum(payment.amount where status='paid')
- Conversion Rate: (paid_bookings / total_bookings) * 100

// Step 2: Query Database
const bookings = getBookings(); // localStorage or API
const payments = getPayments(); // localStorage or API
const customers = new Set(bookings.map(b => b.userId));

// Step 3: Visualize Data
- Render charts for:
  - Revenue by category (bar chart)
  - Booking status distribution (pie chart)
  - Customer growth over time (line chart)
```

**Data Sources:**
- `getBookings()` - Fetches from `STORAGE_KEYS.bookings` in localStorage
- `getPayments()` - Fetches from `STORAGE_KEYS.payments`
- Backend API: `GET /api/bookings?adminView=true`

**Key Metrics Calculated:**
```javascript
const totalCustomers = new Set(
  allBookings.map(b => b.userId)
).size;

const activeBookings = allBookings.filter(
  b => !['cancelled', 'rejected'].includes(b.status)
).length;

const totalRevenue = allPayments
  .filter(p => p.status === 'paid')
  .reduce((sum, p) => sum + (p.amount || 0), 0);

const conversionRate = (
  (paidBookings.length / totalBookings.length) * 100
).toFixed(2);
```

#### 2. Design Editor Section
**Function:** `renderAdminDesignEditor()` (Line 9672)
**What It Does:**
- Create, edit, delete design models
- Upload category images
- Manage design prices & costs
- Set design status (active/inactive/archived)

**Database Operations:**
```typescript
// CREATE
app.post('/api/designs', authenticate, requireAdmin, async (req, res) => {
  const { title, description, categoryId, price, cost, imageUrl, roomType, styleType } = req.body;
  const design = await runAsync(
    `INSERT INTO designs (title, description, categoryId, price, cost, imageUrl, roomType, styleType)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, categoryId, price, cost, imageUrl, roomType, styleType]
  );
  res.json({ id: design.lastID, ...req.body });
});

// UPDATE
app.put('/api/designs/:id', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, price, cost, ...fields } = req.body;
  await runAsync(
    `UPDATE designs SET title=?, price=?, cost=?, ... WHERE id=?`,
    [title, price, cost, ...values, id]
  );
  res.json({ message: 'Updated' });
});

// DELETE
app.delete('/api/designs/:id', authenticate, requireAdmin, async (req, res) => {
  await runAsync(`DELETE FROM designs WHERE id=?`, [id]);
  res.json({ message: 'Deleted' });
});
```

**Frontend Logic:**
```typescript
const renderAdminDesignEditor = () => {
  const designs = getDesigns(); // Load from storage
  
  // Form Submission Handler
  document.addEventListener('submit', (e: SubmitEvent) => {
    if (e.target instanceof HTMLFormElement) {
      const formData = new FormData(e.target);
      const designData = {
        title: formData.get('title'),
        categoryId: formData.get('categoryId'),
        price: parseAmountValue(formData.get('price')),
        cost: parseAmountValue(formData.get('cost')),
        imageUrl: formData.get('imageUrl')
      };
      
      // Save to backend
      fetch('/api/designs', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: JSON.stringify(designData)
      }).then(r => r.json()).then(result => {
        state.designs.push(result);
        render(); // Re-render dashboard
      });
    }
  });
  
  // Render HTML
  return html`
    <div class="admin-designs">
      <form action="" data-action="create-design">
        <input type="text" name="title" placeholder="Design Title" required />
        <input type="number" name="price" placeholder="Price (₹)" required />
        <button type="submit">Create Design</button>
      </form>
      
      <div class="designs-list">
        ${designs.map(design => html`
          <div class="design-card">
            <img src="${design.imageUrl}" />
            <h3>${design.title}</h3>
            <p>₹${design.price.toLocaleString('en-IN')}</p>
            <button data-action="edit-design" data-id="${design.id}">Edit</button>
            <button data-action="delete-design" data-id="${design.id}">Delete</button>
          </div>
        `)}
      </div>
    </div>
  `;
};
```

#### 3. Admin Bookings Section
**Function:** `renderAdminBookingsSection()` (Line 10127)
**Features:**
- View all customer bookings
- Update booking status (pending → confirmed → fulfilled)
- View payment history per booking
- Send notifications to customers

**Logic:**
```typescript
const renderAdminBookingsSection = () => {
  const bookings = getBookings();
  
  // Group by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const fulfilledBookings = bookings.filter(b => b.status === 'fulfilled');
  
  // For each booking, fetch payment status
  bookings.forEach(booking => {
    const payment = getPayments().find(p => p.id === booking.paymentId);
    booking.paymentStatus = payment?.status || 'unpaid';
    booking.amount = payment?.amount || 0;
  });
  
  return renderTabContent(
    [
      { label: 'Pending', count: pendingBookings.length, bookings: pendingBookings },
      { label: 'Confirmed', count: confirmedBookings.length, bookings: confirmedBookings },
      { label: 'Fulfilled', count: fulfilledBookings.length, bookings: fulfilledBookings }
    ],
    bookings
  );
};

// Status Update Handler
document.addEventListener('change', (e: Event) => {
  const select = e.target as HTMLSelectElement;
  if (select.name === 'booking-status') {
    const bookingId = select.dataset.bookingId;
    const newStatus = select.value;
    
    fetch(`/api/bookings/update`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: JSON.stringify({ bookingId, status: newStatus })
    })
    .then(r => r.json())
    .then(result => {
      const booking = state.admin.bookings.find(b => b.id === bookingId);
      if (booking) booking.status = newStatus;
      render();
    });
  }
});
```

#### 4. Admin Theme Customization
**Function:** `renderAdminThemeSection()` (Line 10253)
**Logic:**
```typescript
const renderAdminThemeSection = () => {
  const currentTheme = getTheme(); // Load from localStorage
  
  return html`
    <div class="theme-section">
      <h2>Theme Customization</h2>
      
      <form data-action="update-theme">
        <label>Primary Color:
          <input type="color" name="primaryColor" value="${currentTheme.primaryColor}" />
        </label>
        
        <label>Accent Color:
          <input type="color" name="accentColor" value="${currentTheme.accentColor}" />
        </label>
        
        <label>Font Family:
          <select name="fontFamily">
            <option value="Inter" ${currentTheme.fontFamily === 'Inter' ? 'selected' : ''}>Inter</option>
            <option value="Poppins" ${currentTheme.fontFamily === 'Poppins' ? 'selected' : ''}>Poppins</option>
          </select>
        </label>
        
        <button type="submit">Save Theme</button>
      </form>
    </div>
  `;
};

// Form handler in main event delegation
document.addEventListener('submit', (e: SubmitEvent) => {
  if (e.target instanceof HTMLFormElement && e.target.dataset.action === 'update-theme') {
    const formData = new FormData(e.target);
    const themeData = {
      primaryColor: formData.get('primaryColor'),
      accentColor: formData.get('accentColor'),
      fontFamily: formData.get('fontFamily')
    };
    
    persistTheme(themeData); // Save to localStorage
    state.theme = themeData;
    render(); // Re-render entire app with new theme
  }
});
```

---

## Customer Dashboard Logic {#customer-dashboard}

### Overview
Customer dashboard displays:
- Active bookings
- Paid designs (completed purchases)
- Payment history
- Favorite designs (likes)
- Profile settings

### Key Functions

#### 1. Dashboard Data Aggregation
**Function:** `renderDashboard()` (Line 5850+)

**Step 1: Fetch Customer Data**
```typescript
const refreshCustomerData = async () => {
  // 1. Load from localStorage first (fast)
  const localDesigns = getDesigns();
  const localCategories = getCategories();
  
  // 2. Fetch from API (live data)
  if (state.currentUser?.token) {
    const designsRes = await fetch('/api/designs', {
      headers: getAuthHeaders()
    });
    const designs = await designsRes.json();
    
    // Merge: prefer server data over local
    const mergedDesigns = mergeDesignsPreferServer(localDesigns, designs);
    state.catalog = mergedDesigns;
    writeStorage(STORAGE_KEYS.designs, mergedDesigns);
  }
};
```

**Step 2: Organize by Status**
```typescript
const organizeBookingsByStatus = (bookings: Booking[]) => {
  const active = bookings.filter(b => {
    const payment = getPayments().find(p => p.id === b.paymentId);
    return payment?.status === 'paid' || b.status === 'confirmed';
  });
  
  const pending = bookings.filter(b => {
    const payment = getPayments().find(p => p.id === b.paymentId);
    return payment?.status === 'pending' || b.status === 'pending';
  });
  
  const completed = bookings.filter(b => {
    const payment = getPayments().find(p => p.id === b.paymentId);
    return payment?.status === 'paid' && 
           ['fulfilled', 'completed'].includes(b.status);
  });
  
  return { active, pending, completed };
};
```

#### 2. Paid Designs Section
**Feature:** Displays completed purchases (recently added)
**Logic:**
```typescript
// Constants defined at top
const PAID_DESIGNS_STORAGE_KEY = 'ar_interia_paid_designs_stored';

// Helper functions
const getStoredPaidDesigns = (): any[] => {
  const stored = localStorage.getItem(PAID_DESIGNS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredPaidDesigns = (items: any[]) => {
  localStorage.setItem(PAID_DESIGNS_STORAGE_KEY, JSON.stringify(items));
};

// Merge live bookings with stored records
const syncPaidDesignsFromBookings = (bookings: Booking[]) => {
  const livePayments = getPayments();
  
  // Get paid bookings
  const paidBookings = bookings.filter(b => {
    const payment = livePayments.find(p => p.id === b.paymentId);
    return payment?.status === 'paid' || b.status === 'confirmed';
  });
  
  // Get stored records
  const storedPaid = getStoredPaidDesigns();
  
  // Merge: prefer live bookings over stored
  const liveIds = new Set(paidBookings.map(b => b.id));
  const stored = storedPaid.filter(item => !liveIds.has(item.id));
  
  const merged = [...paidBookings, ...stored];
  setStoredPaidDesigns(merged);
  
  return merged;
};

// Render section
const renderPaidDesignsSection = () => {
  const bookings = getBookings();
  const paidDesigns = syncPaidDesignsFromBookings(bookings);
  
  return html`
    <div class="paid-designs-section">
      <h2>Paid Designs (Purchased)</h2>
      <div class="designs-grid">
        ${paidDesigns.map(paidItem => {
          const booking = bookings.find(b => b.id === paidItem.id);
          const design = state.catalog.find(d => d.id === paidItem.designId);
          
          return html`
            <div class="design-card">
              <img src="${design?.previewImage}" alt="${design?.title}" />
              <h3>${design?.title || paidItem.designName}</h3>
              <p class="category">${design?.category || paidItem.categoryId}</p>
              <p class="amount">₹${design?.price?.toLocaleString('en-IN') || 0}</p>
              <small class="date">
                Purchased: ${new Date(
                  booking?.createdAt || paidItem.bookedAt || Date.now()
                ).toLocaleDateString()}
              </small>
              <button data-action="view-details" data-id="${paidItem.id}">View Details</button>
            </div>
          `;
        })}
      </div>
    </div>
  `;
};
```

**Key Logic Points:**
- Null-safe date fallback: `booking?.createdAt || paidItem.bookedAt || Date.now()`
- Syncs with bookings on every render
- Persists in localStorage even if API is offline
- Displays paid status clearly

#### 3. Payment History
```typescript
const renderPaymentHistory = () => {
  const payments = getPayments()
    .filter(p => p.userId === state.currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return html`
    <div class="payment-history">
      <h3>Payment History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(payment => html`
            <tr class="status-${payment.status}">
              <td>${new Date(payment.createdAt).toLocaleDateString('en-IN')}</td>
              <td>${payment.orderId}</td>
              <td>₹${payment.amount?.toLocaleString('en-IN')}</td>
              <td>${payment.gateway || 'PhonePe'}</td>
              <td><span class="status-badge ${payment.status}">${payment.status.toUpperCase()}</span></td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
};
```

---

## Chatbot Logic & Implementation {#chatbot}

### Overview
AI-powered chatbot provides instant customer support with natural language understanding.

### Architecture
**Location:** `services/chatbot.ts`
**Type:** Rule-based NLP (not ML model)
**Language:** TypeScript
**Response Format:** Markdown with quick reply buttons

### How It Works

#### 1. Rule-Based Matching System
```typescript
interface BotRule {
  keywords: string[];
  response: string;
  quickReplies?: string[];
}

const RULES: BotRule[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'namaste'],
    response: `👋 Welcome to AR Interia! I'm Aria, your personal design assistant.
      I can help you with:
      • Our services & pricing
      • Booking a design consultation
      • Interior design inspiration
      • Gallery & portfolio
      • Luxury showrooms`,
    quickReplies: ['View Services', 'Book Consultation', 'Pricing Info']
  },
  {
    keywords: ['price', 'cost', 'budget', 'charges'],
    response: `💰 **Our Pricing Packages:**
      🥉 **Essential** — ₹2.4L+
      🥈 **Premium** — ₹3.2L–5L
      🥇 **Luxury** — ₹5L–15L+`
  },
  // ... 15+ more rules
];

const FALLBACK_RESPONSES = [
  `I didn't quite catch that. Could you rephrase?`,
  `For specific questions, contact: +91 8904712858`
];
```

#### 2. Response Generation
```typescript
export const getBotResponse = (userMessage: string): { 
  text: string; 
  quickReplies?: string[] 
} => {
  // Normalize input
  const msg = userMessage.toLowerCase().trim();
  
  // Match keywords
  for (const rule of RULES) {
    // Check if ANY keyword matches ANY part of message
    if (rule.keywords.some(kw => msg.includes(kw))) {
      return {
        text: rule.response,
        quickReplies: rule.quickReplies
      };
    }
  }
  
  // Fallback
  const fallback = FALLBACK_RESPONSES[
    Math.floor(Math.random() * FALLBACK_RESPONSES.length)
  ];
  return { text: fallback };
};
```

#### 3. Chatbot UI Integration
```typescript
// In main.ts render function
const renderChatbot = () => {
  const messages = state.chatbotMessages || [];
  
  return html`
    <div class="chatbot-container">
      <div class="chat-history">
        ${messages.map(msg => html`
          <div class="message ${msg.sender}">
            <div class="content">${msg.text}</div>
            ${msg.quickReplies ? html`
              <div class="quick-replies">
                ${msg.quickReplies.map(reply => html`
                  <button class="quick-reply" data-action="chatbot-quick-reply" data-reply="${reply}">
                    ${reply}
                  </button>
                `)}
              </div>
            ` : ''}
          </div>
        `)}
      </div>
      
      <div class="chat-input">
        <input type="text" placeholder="Ask me anything..." data-action="chatbot-message" />
        <button data-action="chatbot-send">Send</button>
      </div>
    </div>
  `;
};

// Event handler
document.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  
  if (target.dataset.action === 'chatbot-send') {
    const input = document.querySelector('[data-action="chatbot-message"]') as HTMLInputElement;
    const userMessage = input.value.trim();
    
    if (userMessage) {
      // Add user message
      state.chatbotMessages.push({
        sender: 'user',
        text: userMessage,
        timestamp: Date.now()
      });
      
      // Get bot response
      const botResponse = getBotResponse(userMessage);
      state.chatbotMessages.push({
        sender: 'bot',
        text: botResponse.text,
        quickReplies: botResponse.quickReplies,
        timestamp: Date.now()
      });
      
      // Save to backend
      fetch('/api/chatbot/history', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userMessage,
          botResponse: botResponse.text
        })
      });
      
      input.value = '';
      render();
    }
  }
});
```

#### 4. Backend Chatbot Storage
```javascript
// server/index.js
app.post('/api/chatbot/history', authenticate, async (req, res) => {
  const { userMessage, botResponse } = req.body;
  
  const result = await runAsync(
    `INSERT INTO chatbot_logs (userId, userMessage, botResponse, timestamp)
     VALUES (?, ?, ?, ?)`,
    [req.user.sub, userMessage, botResponse, new Date().toISOString()]
  );
  
  res.json({ id: result.lastID, message: 'Logged' });
});

app.get('/api/chatbot/history', authenticate, async (req, res) => {
  const logs = await allAsync(
    `SELECT * FROM chatbot_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT 100`,
    [req.user.sub]
  );
  
  res.json(logs);
});
```

#### 5. Admin Chatbot Feedback
**Function:** `renderAdminChatbotFeedbackSection()` (Line 11561)
```typescript
const renderAdminChatbotFeedbackSection = () => {
  const feedbacks = getFeedbacks();
  const chatbotRelated = feedbacks.filter(f => f.topic === 'chatbot');
  
  return html`
    <div class="chatbot-feedback">
      <h3>Chatbot Feedback (${chatbotRelated.length})</h3>
      <table>
        <tr>
          <th>Customer</th>
          <th>Message</th>
          <th>Rating</th>
          <th>Date</th>
        </tr>
        ${chatbotRelated.map(f => html`
          <tr>
            <td>${f.customerName}</td>
            <td>${f.messages}</td>
            <td>${'⭐'.repeat(f.rating)}</td>
            <td>${new Date(f.createdAt).toLocaleDateString()}</td>
          </tr>
        `)}
      </table>
    </div>
  `;
};
```

---

## Homepage Features & Logic {#homepage}

### Overview
Homepage is the landing page with:
- Hero section with background image
- Service highlights
- Featured category showcase
- Call-to-action (CTA) buttons
- Luxury house/villa showroom preview

### Key Components

#### 1. Hero Section
```typescript
const renderHeroSection = () => {
  const siteSettings = state.siteSettings;
  
  return html`
    <section class="hero" style="background-image: linear-gradient(
      rgba(0, 0, 0, 0.5),
      rgba(0, 0, 0, 0.5)
    ), url('${siteSettings.heroBg || '/default-hero.jpg'}')">
      <div class="hero-content">
        <h1 class="hero-title">Interior Design That Transforms Spaces</h1>
        <p class="hero-subtitle">Premium Design. Premium Living. Premium Experience.</p>
        <div class="hero-ctas">
          <button class="btn-primary" data-action="navigate" data-tab="services">
            Explore Services
          </button>
          <button class="btn-secondary" data-action="navigate" data-tab="contact">
            Book Consultation
          </button>
        </div>
      </div>
    </section>
  `;
};
```

#### 2. Services Grid
```typescript
const renderServicesGrid = () => {
  const services = state.services || INITIAL_SERVICES;
  
  return html`
    <section class="services-grid">
      <h2 class="section-title">Our Core Services</h2>
      <div class="grid">
        ${services.map(service => html`
          <div class="service-card" data-service-id="${service.id}">
            <div class="service-icon">${service.icon}</div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            ${service.video ? html`
              <video src="${service.video}" muted loop autoplay />
            ` : ''}
            <button data-action="navigate" data-tab="ai-studio">
              Learn More
            </button>
          </div>
        `)}
      </div>
    </section>
  `;
};
```

#### 3. Featured Categories Showcase
```typescript
const renderFeaturedCategories = () => {
  const categories = getCategories().slice(0, 6);
  
  return html`
    <section class="featured-categories">
      <h2>Explore By Room Type</h2>
      <div class="categories-showcase">
        ${categories.map(category => html`
          <div class="category-tile motion-3d" data-motion3d="true">
            <img src="${category.image}" alt="${category.title}" />
            <div class="category-info">
              <h3>${category.title}</h3>
              <p>${category.designs?.length || 0} Designs</p>
              <button data-action="navigate-category" data-category-id="${category.id}">
                Browse
              </button>
            </div>
          </div>
        `)}
      </div>
    </section>
  `;
};
```

#### 4. Testimonials Section
```typescript
const renderTestimonials = () => {
  const feedbacks = getFeedbacks()
    .filter(f => f.rating >= 4)
    .slice(0, 3);
  
  return html`
    <section class="testimonials">
      <h2>What Our Customers Say</h2>
      <div class="testimonials-carousel">
        ${feedbacks.map(feedback => html`
          <div class="testimonial-card">
            <div class="stars">${'⭐'.repeat(feedback.rating)}</div>
            <p class="message">"${feedback.messages}"</p>
            <p class="author">— ${feedback.customerName}</p>
          </div>
        `)}
      </div>
    </section>
  `;
};
```

---

## Portfolio Section Logic {#portfolio}

### Overview
Portfolio showcases the company and previous projects.

### Structure
```typescript
interface PortfolioContent {
  about: {
    companyName: string;
    tagline: string;
    description: string;
    foundedYear: number;
    teamSize: number;
  };
  team: Array<{ name: string; role: string; bio: string; image: string }>;
  stats: Array<{ label: string; value: string }>;
  projects: Array<{ title: string; category: string; image: string; description: string }>;
  awards: Array<{ year: number; title: string; organization: string }>;
}

const DEFAULT_PORTFOLIO_CONTENT: PortfolioContent = {
  about: {
    companyName: 'AR Interia',
    tagline: 'Modern Luxury, Perfected',
    description: 'Premium interior design...',
    foundedYear: 2004,
    teamSize: 1400
  },
  team: [
    { name: 'Abhilash J', role: 'Founder & CEO', bio: '...', image: '...' },
    { name: 'Ramesh', role: 'Co-Founder', bio: '...', image: '...' }
  ]
};
```

### Render Functions

#### 1. Portfolio Main View
```typescript
const renderPortfolio = () => {
  const portfolio = state.portfolioContent || DEFAULT_PORTFOLIO_CONTENT;
  
  return html`
    <div class="portfolio-container">
      <!-- About Section -->
      <section class="portfolio-about">
        <h1>${portfolio.about.companyName}</h1>
        <p class="tagline">${portfolio.about.tagline}</p>
        <p class="description">${portfolio.about.description}</p>
      </section>
      
      <!-- Team Section -->
      <section class="portfolio-team">
        <h2>Meet Our Team</h2>
        <div class="team-grid">
          ${portfolio.team.map(member => html`
            <div class="team-card">
              <img src="${member.image}" alt="${member.name}" />
              <h3>${member.name}</h3>
              <p class="role">${member.role}</p>
              <p class="bio">${member.bio}</p>
            </div>
          `)}
        </div>
      </section>
      
      <!-- Stats Section -->
      <section class="portfolio-stats">
        <div class="stats-grid">
          ${portfolio.stats.map(stat => html`
            <div class="stat-card">
              <h3 class="stat-value">${stat.value}</h3>
              <p class="stat-label">${stat.label}</p>
            </div>
          `)}
        </div>
      </section>
      
      <!-- Projects Section -->
      <section class="portfolio-projects">
        <h2>Our Work</h2>
        <div class="projects-grid">
          ${portfolio.projects.map(project => html`
            <div class="project-card">
              <img src="${project.image}" alt="${project.title}" />
              <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.category}</p>
                <p>${project.description}</p>
              </div>
            </div>
          `)}
        </div>
      </section>
    </div>
  `;
};
```

#### 2. Admin Portfolio Editor
**Function:** `renderAdminPortfolioEditor()` (inside settings)
```typescript
const renderAdminPortfolioEditor = () => {
  const portfolio = state.portfolioContent || DEFAULT_PORTFOLIO_CONTENT;
  
  return html`
    <div class="portfolio-editor">
      <h2>Edit Portfolio</h2>
      
      <form data-action="update-portfolio">
        <!-- About Section -->
        <fieldset>
          <legend>About Company</legend>
          <input type="text" name="about.companyName" value="${portfolio.about.companyName}" />
          <input type="text" name="about.tagline" value="${portfolio.about.tagline}" />
          <textarea name="about.description">${portfolio.about.description}</textarea>
        </fieldset>
        
        <!-- Team Section -->
        <fieldset>
          <legend>Team Members</legend>
          ${portfolio.team.map((member, idx) => html`
            <div class="team-form-group">
              <input type="text" name="team.${idx}.name" value="${member.name}" />
              <input type="text" name="team.${idx}.role" value="${member.role}" />
              <textarea name="team.${idx}.bio">${member.bio}</textarea>
              <input type="text" name="team.${idx}.image" value="${member.image}" />
            </div>
          `)}
          <button type="button" data-action="add-team-member">Add Member</button>
        </fieldset>
        
        <button type="submit">Save Portfolio</button>
      </form>
    </div>
  `;
};

// Form handler
document.addEventListener('submit', (e: SubmitEvent) => {
  if (e.target instanceof HTMLFormElement && e.target.dataset.action === 'update-portfolio') {
    const formData = new FormData(e.target);
    const updatedPortfolio = {
      ...state.portfolioContent,
      about: {
        ...state.portfolioContent?.about,
        companyName: formData.get('about.companyName'),
        tagline: formData.get('about.tagline'),
        description: formData.get('about.description')
      }
    };
    
    // Save to backend
    fetch('/api/portfolio-content', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedPortfolio)
    })
    .then(r => r.json())
    .then(() => {
      state.portfolioContent = updatedPortfolio;
      writeStorage(STORAGE_KEYS.settings, updatedPortfolio);
      render();
    });
  }
});
```

---

## Services & Packages Logic {#services-packages}

### Services Management
**Data Structure:**
```typescript
interface ServiceItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  video?: string;
}

const SERVICE_MANAGER_SAMPLES: ServiceItem[] = [
  {
    id: 'svc-studio-3d',
    title: '3D Design Studio',
    icon: '🎨',
    description: 'Photorealistic room concepts...',
    video: '/videos/interior-video-1.mp4'
  },
  // ... more services
];
```

### Packages Management
**Data Structure:**
```typescript
interface Package {
  id: string;
  name: string;
  type: 'Essential' | 'Premium' | 'Luxury';
  priceRange: { min: number; max: number };
  description: string;
  features: string[];
  rooms: PackageRoom[];
  deliveryTime: string;
}

interface PackageRoom {
  category: string;
  quantity: number;
  estimatedPrice: number;
}

const DEFAULT_PACKAGES = [
  {
    id: 'pkg-essential',
    name: 'Essential Package',
    type: 'Essential',
    priceRange: { min: 240000, max: 350000 },
    description: 'Single room or small home',
    features: ['2D Layouts', 'Material Selection', '3D Preview'],
    rooms: [
      { category: 'Kitchen', quantity: 1, estimatedPrice: 150000 },
      { category: 'Bedroom', quantity: 1, estimatedPrice: 120000 }
    ],
    deliveryTime: '3-5 weeks'
  },
  // Premium and Luxury packages...
];
```

### Admin Package Manager
**Function:** `renderAdminPackageManagerSection()` (Line 11252)
```typescript
const renderAdminPackageManagerSection = () => {
  const packages = getPackages();
  
  return html`
    <div class="package-manager">
      <h2>Package Management</h2>
      
      <form data-action="create-package">
        <input type="text" name="name" placeholder="Package Name" required />
        <select name="type" required>
          <option value="Essential">Essential</option>
          <option value="Premium">Premium</option>
          <option value="Luxury">Luxury</option>
        </select>
        <input type="number" name="minPrice" placeholder="Min Price" required />
        <input type="number" name="maxPrice" placeholder="Max Price" required />
        <textarea name="description" placeholder="Description" required></textarea>
        <button type="submit">Create Package</button>
      </form>
      
      <div class="packages-list">
        ${packages.map(pkg => html`
          <div class="package-card">
            <h3>${pkg.name}</h3>
            <p>₹${pkg.priceRange.min.toLocaleString()} - ₹${pkg.priceRange.max.toLocaleString()}</p>
            <ul>
              ${pkg.features.map(f => html`<li>${f}</li>`)}
            </ul>
            <button data-action="edit-package" data-id="${pkg.id}">Edit</button>
            <button data-action="delete-package" data-id="${pkg.id}">Delete</button>
          </div>
        `)}
      </div>
    </div>
  `;
};
```

### Backend Package APIs
```javascript
// GET packages
app.get('/api/packages', async (req, res) => {
  const packages = await allAsync('SELECT * FROM packages WHERE isActive = 1', []);
  res.json(packages);
});

// GET designs for a package
app.get('/api/packages/:id/designs', async (req, res) => {
  const { id } = req.params;
  const designs = await allAsync(
    'SELECT * FROM designs WHERE packageId = ?',
    [id]
  );
  res.json(designs);
});
```

---

## Price Calculator Logic {#price-calculator}

### Overview
Dynamic calculator that estimates project costs based on:
- Room category (kitchen, bedroom, etc.)
- Square footage
- Quality level (economy, premium, luxury)
- Shape complexity (rectangle, L-shape, etc.)

### Formula
```
Final Price = Base Rate × Sq.Ft × Category Multiplier × Quality Multiplier × Shape Multiplier
```

### Implementation
**Function:** `renderAdminCalculatorSection()` (Line 11360)

```typescript
const DEFAULT_CALCULATOR_SETTINGS: CalculatorSettings = {
  baseSqftRate: 1500, // Base rate per sq.ft
  categoryMultipliers: {
    'Kitchen': 1.4,
    'Living Room': 1.1,
    'Master Bedroom': 1.3,
    'Bathroom': 1.2,
    // ... 20+ categories
  },
  qualityMultipliers: {
    'economy': 1.0,    // ₹1500/sqft
    'premium': 1.4,    // ₹2100/sqft
    'luxury': 1.8      // ₹2700/sqft
  },
  shapeMultipliers: {
    'Rectangle': 1.0,
    'L-Shape': 1.15,
    'T-Shape': 1.25,
    'Custom': 1.4
  }
};

const calculatePrice = (
  sqft: number,
  category: string,
  quality: 'economy' | 'premium' | 'luxury',
  shape: string,
  settings: CalculatorSettings
): number => {
  const baseRate = settings.baseSqftRate;
  const catMultiplier = settings.categoryMultipliers[category] || 1.0;
  const qualityMultiplier = settings.qualityMultipliers[quality] || 1.0;
  const shapeMultiplier = settings.shapeMultipliers[shape] || 1.0;
  
  const finalPrice = sqft * baseRate * catMultiplier * qualityMultiplier * shapeMultiplier;
  return Math.round(finalPrice);
};

// Frontend render
const renderAdminCalculatorSection = () => {
  const settings = getCalculatorSettings();
  const history = getCalculationHistory();
  
  return html`
    <div class="calculator-section">
      <h2>Price Calculator</h2>
      
      <form data-action="calculate-price">
        <label>Room Category:
          <select name="category" required>
            ${Object.keys(settings.categoryMultipliers).map(cat => html`
              <option value="${cat}">${cat}</option>
            `)}
          </select>
        </label>
        
        <label>Square Footage:
          <input type="number" name="sqft" min="100" placeholder="Enter sq.ft" required />
        </label>
        
        <label>Quality:
          <select name="quality" required>
            <option value="economy">Economy (₹${settings.baseSqftRate}+ /sq.ft)</option>
            <option value="premium">Premium (₹${Math.round(settings.baseSqftRate * 1.4)}+ /sq.ft)</option>
            <option value="luxury">Luxury (₹${Math.round(settings.baseSqftRate * 1.8)}+ /sq.ft)</option>
          </select>
        </label>
        
        <label>Shape:
          <select name="shape" required>
            ${Object.keys(settings.shapeMultipliers).map(shape => html`
              <option value="${shape}">${shape}</option>
            `)}
          </select>
        </label>
        
        <button type="submit">Calculate Price</button>
      </form>
      
      <div id="calculator-result"></div>
      
      <h3>Recent Calculations</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Sq.Ft</th>
            <th>Quality</th>
            <th>Estimated Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${history.map(record => html`
            <tr>
              <td>${record.category}</td>
              <td>${record.sqft}</td>
              <td>${record.quality}</td>
              <td>₹${record.estimatedPrice.toLocaleString('en-IN')}</td>
              <td>${new Date(record.createdAt).toLocaleDateString()}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
};

// Form handler
document.addEventListener('submit', (e: SubmitEvent) => {
  if (e.target instanceof HTMLFormElement && e.target.dataset.action === 'calculate-price') {
    const formData = new FormData(e.target);
    const sqft = parseFloat(formData.get('sqft') as string);
    const category = formData.get('category') as string;
    const quality = formData.get('quality') as any;
    const shape = formData.get('shape') as string;
    
    const settings = getCalculatorSettings();
    const estimatedPrice = calculatePrice(sqft, category, quality, shape, settings);
    
    // Save to history
    saveCalculationRecord({
      id: `calc-${Date.now()}`,
      sqft,
      category,
      quality,
      shape,
      estimatedPrice,
      createdAt: new Date().toISOString()
    });
    
    // Display result
    const resultDiv = document.getElementById('calculator-result');
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="calculation-result">
          <h3>Estimated Price</h3>
          <p class="price">₹${estimatedPrice.toLocaleString('en-IN')}</p>
          <p class="breakdown">
            ${sqft} sq.ft × ₹${settings.baseSqftRate}/sq.ft 
            × ${settings.categoryMultipliers[category]} (${category})
            × ${settings.qualityMultipliers[quality]} (${quality})
            × ${settings.shapeMultipliers[shape]} (${shape})
          </p>
        </div>
      `;
    }
    
    render();
  }
});
```

---

## API Endpoints Reference {#api-endpoints}

### Authentication APIs

#### 1. Register
```
POST /api/auth/register
Headers: Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}

Response:
{
  "id": "cust-12345",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer"
}
```

**JavaScript Used:**
- `bcryptjs.hash()` - Password hashing
- `jwt.sign()` - Token generation

#### 2. Login
```
POST /api/auth/login
Body:
{
  "email": "john@example.com",
  "password": "secure123"
}

Response:
{
  "id": "cust-12345",
  "token": "...",
  "name": "John Doe",
  "role": "customer"
}
```

### Booking APIs

#### 1. Create Booking
```
POST /api/bookings/book-design
Headers: Authorization: Bearer {token}

Body:
{
  "designId": "design-123",
  "categoryId": "cat-kitchen",
  "price": 150000
}

Response:
{
  "id": "booking-xyz",
  "userId": "cust-123",
  "designId": "design-123",
  "status": "pending",
  "paymentStatus": "unpaid"
}
```

#### 2. Get Customer Bookings
```
GET /api/bookings?customerId={customerId}
Headers: Authorization: Bearer {token}

Response:
{
  "bookings": [
    {
      "id": "booking-1",
      "designName": "Modern Kitchen",
      "price": 150000,
      "status": "pending",
      "paymentStatus": "unpaid",
      "createdAt": "2026-03-25T10:00:00Z"
    }
  ]
}
```

#### 3. Update Booking Status (Admin)
```
POST /api/bookings/update
Headers: Authorization: Bearer {admin_token}

Body:
{
  "bookingId": "booking-123",
  "status": "confirmed"
}
```

#### 4. Book & Pay
```
POST /api/bookings/pay-and-book
Headers: Authorization: Bearer {token}

Body:
{
  "designId": "design-123",
  "amount": 150000,
  "gateway": "phonepe"
}

Response:
{
  "bookingId": "booking-xyz",
  "paymentId": "pay-xyz",
  "orderId": "ORD123",
  "amount": 150000,
  "status": "initiated"
}
```

### Payment APIs

#### 1. Create PhonePe Payment
```
POST /api/payments/phonepe/create
Headers: Authorization: Bearer {token}

Body:
{
  "bookingId": "booking-123",
  "amount": 150000,
  "orderId": "ORD123"
}

Response:
{
  "instrumentResponse": {
    "redirectUrl": "https://phon...api call",
    "type": "REDIRECT"
  }
}
```

**Logic (Node.js):**
```javascript
const createPhonePePayment = async (orderId, amount) => {
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const salt = process.env.PHONEPE_SALT_KEY;
  
  const payload = {
    merchantId,
    merchantTransactionId: orderId,
    merchantUserId: userId,
    amount: amount * 100, // Convert to paise
    redirectUrl: `http://localhost:5500/callback`,
    callbackUrl: `http://localhost:5175/api/payments/phonepe/callback`,
    mobileNumber: phoneNumber,
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };
  
  // Encode payload
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  // Generate checksum
  const hashString = base64Payload + '/pg/v1/pay' + salt;
  const checksum = SHA256(hashString).toString() + '###' + saltIndex;
  
  const response = await fetch('https://api.phonepe.com/apis/secure/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: base64Payload,
      _checksum: checksum
    })
  });
  
  return response.json();
};
```

#### 2. Check Payment Status
```
POST /api/payments/phonepe/status
Headers: Authorization: Bearer {token}

Body:
{
  "merchantTransactionId": "ORD123"
}

Response:
{
  "success": true,
  "code": "PAYMENT_SUCCESS",
  "data": {
    "paymentId": "pay-xyz",
    "state": "COMPLETED",
    "amount": 15000000
  }
}
```

#### 3. Update Payment Status
```
POST /api/payments/update
Headers: Authorization: Bearer {token}

Body:
{
  "paymentId": "pay-123",
  "status": "paid",
  "transactionId": "TXID123"
}
```

### Design APIs

#### 1. Get All Designs
```
GET /api/designs
Query: ?categoryId={catId}&sort=popular

Response:
{
  "designs": [
    {
      "id": "design-1",
      "title": "Modern Kitchen",
      "categoryId": "cat-kitchen",
      "price": 150000,
      "cost": 120000,
      "previewImage": "/category/Kitchen/kitchen1.jpg",
      "likes": 45
    }
  ]
}
```

**Backend Logic:**
```javascript
app.get('/api/designs', async (req, res) => {
  const { categoryId, sort } = req.query;
  let query = `SELECT * FROM designs WHERE isDeleted = 0`;
  
  if (categoryId) {
    query += ` AND categoryId = '${categoryId}'`;
  }
  
  if (sort === 'popular') {
    query += ` ORDER BY likes DESC`;
  } else if (sort === 'newest') {
    query += ` ORDER BY createdAt DESC`;
  } else {
    query += ` ORDER BY title ASC`;
  }
  
  const designs = await allAsync(query, []);
  
  // Merge with likes data
  const likes = await allAsync('SELECT * FROM likes', []);
  designs.forEach(design => {
    design.likes = likes.filter(l => l.designId === design.id).length;
  });
  
  res.json({ designs });
});
```

#### 2. Create Design (Admin)
```
POST /api/designs
Headers: Authorization: Bearer {admin_token}

Body:
{
  "title": "Modern Kitchen",
  "categoryId": "cat-kitchen",
  "price": 150000,
  "cost": 120000,
  "imageUrl": "/category/Kitchen/kitchen1.jpg",
  "roomType": "kitchen",
  "styleType": "modern"
}
```

#### 3. Update Design (Admin)
```
PUT /api/designs/:id
Headers: Authorization: Bearer {admin_token}

Body:
{
  "title": "Modern Kitchen v2",
  "price": 160000
}
```

#### 4. Delete Design (Admin)
```
DELETE /api/designs/:id
Headers: Authorization: Bearer {admin_token}
```

### Category APIs

#### 1. Get Categories
```
GET /api/categories

Response:
{
  "categories": [
    {
      "id": "cat-kitchen",
      "title": "Kitchen",
      "image": "/category/Kitchen/thumbnail.jpg",
      "designCount": 25
    }
  ]
}
```

#### 2. Get Category Images
```
GET /api/categories/Kitchen

Response:
{
  "images": [
    "/category/Kitchen/kitchen1.jpg",
    "/category/Kitchen/kitchen2.jpg"
  ]
}
```

### AI Design APIs

#### 1. Generate AI Designs
```
POST /api/ai/designs
Headers: Authorization: Bearer {token}

Body:
{
  "roomDescription": "Modern kitchen with open concept",
  "stylePreference": "minimalist",
  "budget": "₹2,00,000"
}

Response:
{
  "variants": [
    {
      "id": "ai-var-1",
      "title": "Contemporary Open Kitchen",
      "imageUrl": "data:image/png;base64,...",
      "estimatedPrice": 200000
    }
  ]
}
```

#### 2. Get Customer AI Designs
```
GET /api/ai/designs
Headers: Authorization: Bearer {token}

Response:
{
  "designs": [
    {
      "id": "ai-design-1",
      "title": "AI Generated Bedroom",
      "createdAt": "2026-03-25"
    }
  ]
}
```

### Feedback APIs

#### 1. Submit Feedback
```
POST /api/feedbacks
Headers: Authorization: Bearer {token}

Body:
{
  "customerName": "John Doe",
  "messages": "Great service!",
  "rating": 5,
  "topic": "general"
}
```

#### 2. Get Feedbacks
```
GET /api/feedbacks
Headers: Authorization: Bearer {admin_token}

Response:
{
  "feedbacks": [
    {
      "id": "fb-1",
      "customerName": "John Doe",
      "messages": "Great service!",
      "rating": 5
    }
  ]
}
```

### Chatbot APIs

#### 1. Save Chat Message
```
POST /api/chatbot/history
Headers: Authorization: Bearer {token}

Body:
{
  "userMessage": "What are your services?",
  "botResponse": "Our services include..."
}
```

#### 2. Get Chat History
```
GET /api/chatbot/history
Headers: Authorization: Bearer {token}

Response:
{
  "messages": [
    {
      "userMessage": "...",
      "botResponse": "...",
      "timestamp": "2026-03-25T10:00:00Z"
    }
  ]
}
```

### Portfolio APIs

#### 1. Get Portfolio Content
```
GET /api/portfolio-content

Response:
{
  "about": {
    "companyName": "AR Interia",
    "tagline": "Modern Luxury, Perfected"
  },
  "team": [...],
  "projects": [...]
}
```

#### 2. Update Portfolio (Admin)
```
PUT /api/portfolio-content
Headers: Authorization: Bearer {admin_token}

Body:
{
  "about": {
    "companyName": "AR Interia",
    "tagline": "Modern Luxury, Perfected"
  }
}
```

---

## Database Schema & Tables {#database-schema}

### SQLite Tables

#### 1. `customers`
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL (bcrypt hashed),
  role TEXT DEFAULT 'customer' (customer | admin),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `categories`
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  designCount INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `designs`
```sql
CREATE TABLE designs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  categoryId TEXT,
  price REAL,
  cost REAL,
  imageUrl TEXT,
  roomType TEXT,
  styleType TEXT,
  isDeleted BOOLEAN DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);
```

#### 4. `bookings`
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  designId TEXT NOT NULL,
  designName TEXT,
  price REAL,
  cost REAL,
  status TEXT DEFAULT 'pending' (pending | confirmed | fulfilled | cancelled),
  paymentStatus TEXT DEFAULT 'unpaid' (unpaid | paid | refunded),
  paymentId TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES customers(id),
  FOREIGN KEY (designId) REFERENCES designs(id)
);
```

#### 5. `payments`
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  bookingId TEXT,
  amount REAL NOT NULL,
  gateway TEXT (phonepe | razorpay | bank),
  status TEXT DEFAULT 'pending' (pending | paid | failed | refunded),
  orderId TEXT UNIQUE,
  transactionId TEXT,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES customers(id),
  FOREIGN KEY (bookingId) REFERENCES bookings(id)
);
```

#### 6. `feedbacks`
```sql
CREATE TABLE feedbacks (
  id TEXT PRIMARY KEY,
  userId TEXT,
  customerName TEXT NOT NULL,
  messages TEXT NOT NULL,
  rating INTEGER (1-5),
  topic TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES customers(id)
);
```

#### 7. `chatbot_logs`
```sql
CREATE TABLE chatbot_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  userMessage TEXT NOT NULL,
  botResponse TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES customers(id)
);
```

#### 8. `likes`
```sql
CREATE TABLE likes (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  designId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES customers(id),
  FOREIGN KEY (designId) REFERENCES designs(id),
  UNIQUE(userId, designId)
);
```

#### 9. `inquiries`
```sql
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' (new | contacted | resolved),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. `projects`
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image TEXT,
  portfolio BOOLEAN DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. `portfolio_content`
```sql
CREATE TABLE portfolio_content (
  id TEXT PRIMARY KEY,
  content JSON,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. `packages`
```sql
CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT (Essential | Premium | Luxury),
  minPrice REAL,
  maxPrice REAL,
  description TEXT,
  features JSON,
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Data Flow Diagrams {#data-flow}

### 1. Authentication Flow
```
User (Browser)
    ↓
[Login Form] main.ts
    ↓
POST /api/auth/login (email, password)
    ↓
server/index.js
    ├─ Query: SELECT * FROM customers WHERE email = ?
    ├─ bcryptjs.compare(password, hash)
    ├─ jwt.sign(token)
    └─ Response: { token, user, role }
    ↓
Frontend: Store token in state.currentUser.token
    ↓
getAuthHeaders() returns { Authorization: 'Bearer ' + token }
```

### 2. Design Booking Flow
```
User selects design from catalog
    ↓
Click "Book Now" button
    ↓
renderBookingModal() displays form
    ↓
User enters details → Form submission
    ↓
POST /api/bookings/pay-and-book
    ├─ req.body: { designId, amount, gateway }
    ├─ INSERT INTO bookings (...)
    ├─ INSERT INTO payments (status='initiated')
    └─ Response: { bookingId, paymentId, redirectUrl }
    ↓
Frontend: Redirect to PhonePe payment page
    ↓
PhonePe callback → POST /api/payments/phonepe/callback
    ├─ Verify checksum
    ├─ UPDATE payments SET status = 'paid'
    ├─ UPDATE bookings SET paymentStatus = 'paid'
    └─ Redirect to success page
    ↓
Dashboard shows "Paid Designs" section updated
```

### 3. Admin Dashboard Update Flow
```
Admin logs in
    ↓
state.currentUser.role === 'admin' → renderAdmin()
    ↓
renderAdminDashboardSection() calculates metrics
    ├─ getBookings() → localStorage or API
    ├─ getPayments() → localStorage or API
    ├─ Calculate KPIs (revenue, conversion, etc.)
    ├─ Fetch charts data
    └─ Render dashboard with charts
    ↓
Every 30 seconds: refreshAdminData()
    ├─ GET /api/bookings?adminView=true
    ├─ GET /api/payments?adminView=true
    ├─ Update state.admin.bookings
    ├─ Recalculate metrics
    └─ Re-render dashboard
```

### 4. Price Calculator Flow
```
Admin enters: sqft=500, category=Kitchen, quality=premium, shape=Rectangle
    ↓
calculatePrice(500, 'Kitchen', 'premium', 'Rectangle', settings)
    ├─ baseRate = 1500
    ├─ catMultiplier = 1.4
    ├─ qualityMultiplier = 1.4
    ├─ shapeMultiplier = 1.0
    └─ price = 500 × 1500 × 1.4 × 1.4 × 1.0 = 1,470,000
    ↓
saveCalculationRecord({ sqft: 500, category: 'Kitchen', ... })
    ↓
INSERT INTO calculator_history (...)
    ↓
Display result on UI
```

### 5. Chatbot Interaction Flow
```
User types message in chat input
    ↓
Event handler detects 'send' button click
    ↓
Get userMessage from input field
    ↓
Add to state.chatbotMessages
    ├─ sender: 'user'
    ├─ text: userMessage
    └─ timestamp: Date.now()
    ↓
Call getBotResponse(userMessage) from chatbot.ts
    ├─ Normalize input: msg.toLowerCase()
    ├─ Loop through RULES array
    ├─ Check if any keyword matches
    ├─ Return matching response + quickReplies
    └─ If no match: return FALLBACK_RESPONSES[random]
    ↓
Add bot response to state.chatbotMessages
    ├─ sender: 'bot'
    ├─ text: botResponse
    ├─ quickReplies: [...]
    └─ timestamp: Date.now()
    ↓
POST /api/chatbot/history (save to database)
    ├─ INSERT INTO chatbot_logs (userId, userMessage, botResponse, ...)
    └─ Response: { id: logId }
    ↓
render() → Re-render chatbot UI with new messages
```

---

## Summary

This AR Interia project is a comprehensive full-stack interior design platform with:

**Frontend:** 12,000+ lines of TypeScript using vanilla JS + Vite
**Backend:** 2,400+ lines of Node.js Express with SQLite
**Features:** 15+ major sections (admin, customer, AI, payment, booking)
**APIs:** 50+ REST endpoints with JWT authentication
**Database:** 12 SQLite tables with proper schema
**Payment:** PhonePe integration with callback verification
**Real-time:** localStorage syncing + admin metrics refresh
**Scalability:** Modular architecture, type-safe TypeScript, clean separation of concerns

All logic is implemented without heavy frameworks, making it lightweight, maintainable, and easy to understand for new developers.
