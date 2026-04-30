# AR Interia Full-Stack Implementation Report

This document contains the core implementation code across the Database, Backend (Express.js), and Frontend (Vanilla JS/TypeScript) layers for the major modules of the AR Interia platform.

---

## 1. Homepage & Core Navigation

### Database Schema (SQLite)
```sql
-- Stores dynamic background images for the homepage hero slider
CREATE TABLE IF NOT EXISTS backgroundImages (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API (Express.js)
```javascript
// Fetch background images for the homepage slider
app.get('/api/background-images', async (req, res) => {
  try {
    const images = await all(db, 'SELECT * FROM backgroundImages ORDER BY createdAt DESC');
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch background images' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the main homepage view with hero section and dynamic backgrounds
const renderHome = () => {
  const bgImages = state.customer.backgroundImages.length > 0 
    ? state.customer.backgroundImages.map(img => img.url) 
    : [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
        'https://images.unsplash.com/photo-1600607687920-4e2a09be1546'
      ];
      
  return `
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Hero Slider -->
      <div class="absolute inset-0 z-0">
        ${bgImages.map((img, i) => `
          <div class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === 0 ? 'opacity-100' : 'opacity-0'}" 
               style="background-image: url('${img}')" id="hero-bg-${i}">
            <div class="absolute inset-0 bg-black/50"></div>
          </div>
        `).join('')}
      </div>
      <!-- Hero Content -->
      <div class="relative z-10 text-center text-white px-4">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 font-display tracking-tight">Design Your Dream Space</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">Experience luxury interior design with AR Interia.</p>
      </div>
    </div>
  `;
};
```

---

## 2. Portfolio & Luxury Showroom

### Database Schema
```sql
-- Stores portfolio projects and luxury showroom designs
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  images TEXT, -- JSON array of additional images
  tags TEXT,   -- JSON array of tags
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API
```javascript
// Fetch dynamic portfolio content configuration
app.get('/api/portfolio-content', async (req, res) => {
  try {
    const row = await get(db, 'SELECT content FROM portfolio_content WHERE id = ?', ['main']);
    if (row && row.content) {
      return res.json(JSON.parse(row.content));
    }
    res.json(null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio content' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the interactive portfolio gallery grid
const renderPortfolio = () => {
  const projects = state.customer.projects || [];
  
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h2 class="text-4xl font-display font-bold text-center mb-12">Our Masterpieces</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${projects.map(project => `
          <div class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all"
               onclick="handleOpenPortfolioProject('${project.id}')">
            <img src="${project.imageUrl}" alt="${project.title}" class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-0 left-0 right-0 p-6">
                <h3 class="text-2xl font-bold text-white mb-2">${project.title}</h3>
                <p class="text-white/80">${project.category}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};
```

---

## 3. Design Categories & Catalog

### Database Schema
```sql
-- Stores hierarchical design categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  background TEXT,
  sortOrder INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API
```javascript
// Fetch all active categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await all(db, 'SELECT * FROM categories ORDER BY sortOrder ASC, createdAt DESC');
    // Parse JSON fields before sending to frontend
    const parsed = categories.map(c => ({
      ...c,
      images: c.images ? JSON.parse(c.images) : [],
      motion3d: c.motion3d === 1
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
```

### Frontend UI Component
```typescript
// Renders a gallery of designs filtered by category
const renderCategoryGallery = (designs: any[], title: string, categoryId: string) => {
  return `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="flex justify-between items-end mb-8">
        <h3 class="text-3xl font-display font-bold">${title} Designs</h3>
        <button onclick="navigateTo('catalog')" class="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
          View All <i class="ri-arrow-right-line"></i>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${designs.map(design => `
          <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
               onclick="handleOpenDesignModal('${design.id}')">
            <div class="relative h-64">
              <img src="${design.previewImage}" class="w-full h-full object-cover" loading="lazy">
              <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow">
                ₹${formatCurrency(design.amount)}
              </div>
            </div>
            <div class="p-4">
              <h4 class="font-bold text-gray-900 text-lg mb-1 truncate">${design.name}</h4>
              <p class="text-sm text-gray-500">${design.style || 'Modern'} Style</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};
```

---

## 4. Price Calculator & Packages

### Database Schema
```sql
-- Stores predefined design packages and their base pricing
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  basePrice REAL NOT NULL,
  type TEXT NOT NULL, -- 'BHK', 'ROOM', 'COMMERCIAL'
  features TEXT,      -- JSON array of included features
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API
```javascript
// Fetch available pricing packages
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await all(db, 'SELECT * FROM packages ORDER BY basePrice ASC');
    const parsed = packages.map(p => ({
      ...p,
      features: p.features ? JSON.parse(p.features) : [],
      bhk: p.bhk ? JSON.parse(p.bhk) : null
    }));
    res.json({ data: parsed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the interactive price calculator
const renderPriceCalculatorModal = () => {
  return `
    <div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
        <!-- Input Section -->
        <div class="p-8 md:w-1/2 border-r border-gray-100">
          <h2 class="text-3xl font-display font-bold mb-6">Estimate Your Cost</h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select id="calc-type" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500" onchange="updateCalculator()">
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Villa / Independent House</option>
                <option value="commercial">Commercial Space</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Size (Sq. Ft.)</label>
              <input type="number" id="calc-area" value="1000" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500" oninput="updateCalculator()">
            </div>
          </div>
        </div>
        
        <!-- Results Section -->
        <div class="p-8 md:w-1/2 bg-gray-50 flex flex-col justify-center">
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h3 class="text-lg font-medium text-gray-500 mb-2">Estimated Cost</h3>
            <div class="text-5xl font-bold text-indigo-600 mb-4" id="calc-result">₹0</div>
            <p class="text-sm text-gray-500 mb-6">This is a rough estimate. Final cost depends on material selection and exact scope.</p>
            <button onclick="handleRequestQuote()" class="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Request Detailed Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
```

---

## 5. Contact & Inquiry System

### Database Schema
```sql
-- Stores customer inquiries and contact form submissions
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'resolved'
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API
```javascript
// Handle new contact form submissions
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const id = uuidv4();
  
  try {
    await run(db, 
      'INSERT INTO inquiries (id, name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, subject, message, 'pending']
    );
    res.json({ success: true, message: 'Inquiry received successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the Contact Us page and form
const renderContact = () => `
  <div class="max-w-3xl mx-auto px-4 py-24">
    <div class="text-center mb-16">
      <h1 class="text-5xl font-display font-bold mb-4">Get in Touch</h1>
      <p class="text-xl text-gray-600">We'd love to hear about your next project.</p>
    </div>
    
    <div class="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
      <form onsubmit="handleContactSubmit(event)" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" id="contact-name" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input type="email" id="contact-email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea id="contact-message" rows="5" required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"></textarea>
        </div>
        
        <button type="submit" class="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg">
          Send Message
        </button>
      </form>
    </div>
  </div>
`;
```

---

## 6. Customer Dashboard

### Database Schema
```sql
-- Stores registered customer accounts
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores customer saved/liked designs
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  designId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, designId)
);
```

### Backend API
```javascript
// Fetch user details including their liked designs and bookings
app.get('/api/user-details/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await get(db, 'SELECT id, name, email, phone FROM customers WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Fetch associated data
    const likes = await all(db, 'SELECT designId FROM likes WHERE userId = ?', [userId]);
    const bookings = await all(db, 'SELECT * FROM bookings WHERE customerId = ?', [userId]);
    
    res.json({
      ...user,
      likes: likes.map(l => l.designId),
      bookings: bookings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the personal dashboard for logged-in customers
const renderCustomerDashboard = () => {
  const user = state.user;
  const myBookings = state.customer.bookings || [];
  
  return `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="flex items-center gap-6 mb-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div class="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-display font-bold">
          ${user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 class="text-3xl font-display font-bold text-gray-900">Welcome back, ${user?.name}</h1>
          <p class="text-gray-500">${user?.email}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Active Projects / Bookings -->
        <div class="lg:col-span-2 space-y-6">
          <h2 class="text-2xl font-bold font-display flex items-center gap-2">
            <i class="ri-folder-open-line text-indigo-500"></i> My Projects
          </h2>
          ${myBookings.length === 0 ? `
            <div class="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <i class="ri-draft-line text-4xl text-gray-400 mb-4 block"></i>
              <h3 class="text-lg font-bold text-gray-900 mb-2">No active projects</h3>
              <p class="text-gray-500 mb-6">Explore our catalog to start designing your dream space.</p>
              <button onclick="navigateTo('catalog')" class="px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium shadow-sm hover:bg-gray-50">Browse Catalog</button>
            </div>
          ` : `
            <div class="space-y-4">
              ${myBookings.map(b => `
                <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-center cursor-pointer hover:border-indigo-300 transition-colors" onclick="handleViewBooking('${b.id}')">
                  <div>
                    <h4 class="font-bold text-lg text-gray-900">${b.designName || 'Custom Project'}</h4>
                    <p class="text-sm text-gray-500">Booked on ${new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span class="px-4 py-1.5 rounded-full text-sm font-bold ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                    ${b.status.toUpperCase()}
                  </span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        
        <!-- Saved Designs Widget -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold font-display flex items-center gap-2">
            <i class="ri-heart-3-fill text-rose-500"></i> Saved Designs
          </h2>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p class="text-gray-600 mb-4">You have <span class="font-bold text-gray-900">${state.customer.likes?.length || 0}</span> designs saved to your inspiration board.</p>
            <button onclick="navigateTo('catalog')" class="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
              View Inspiration Board
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
```

---

## 7. Admin Dashboard Overview

### Backend API
```javascript
// System health and stats for admin overview
app.get('/api/health', authenticate, requireAdmin, async (req, res) => {
  try {
    const userCount = await get(db, 'SELECT COUNT(*) as count FROM customers');
    const bookingCount = await get(db, 'SELECT COUNT(*) as count FROM bookings');
    const revenue = await get(db, "SELECT SUM(amount) as total FROM payments WHERE status = 'successful'");
    
    res.json({
      status: 'ok',
      stats: {
        users: userCount.count,
        bookings: bookingCount.count,
        revenue: revenue.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'System error' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the main statistical overview on the Admin Panel
const renderAdminDashboardSection = () => {
  const users = state.admin.users.length;
  const bookings = state.admin.bookings.length;
  const revenue = state.admin.payments.reduce((acc, p) => acc + (p.status === 'successful' ? p.amount : 0), 0);
  
  return `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-display font-bold text-gray-900">Dashboard Overview</h2>
      </div>
      
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
              <h3 class="text-3xl font-bold text-gray-900">₹${formatCurrency(revenue)}</h3>
            </div>
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
              <i class="ri-money-rupee-circle-fill"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Active Projects</p>
              <h3 class="text-3xl font-bold text-gray-900">${bookings}</h3>
            </div>
            <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
              <i class="ri-folder-open-fill"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Registered Customers</p>
              <h3 class="text-3xl font-bold text-gray-900">${users}</h3>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
              <i class="ri-group-fill"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Charts Container -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h3>
        <div class="h-80 w-full" id="admin-revenue-chart"></div>
      </div>
    </div>
  `;
};
```

---

## 8. AI Design Studio

### Database Schema
```sql
-- Stores user-generated AI designs
CREATE TABLE IF NOT EXISTS ai_designs (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  prompt TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  style TEXT,
  roomType TEXT,
  status TEXT DEFAULT 'completed',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API
```javascript
// Process request to generate a new AI design
app.post('/api/ai/designs', authenticate, async (req, res) => {
  const { prompt, style, roomType } = req.body;
  const userId = req.user.id;
  
  try {
    // 1. Call external AI Image API (e.g., Midjourney/DALL-E proxy)
    const generatedImageUrl = await callExternalAiApi(prompt, style, roomType);
    
    // 2. Save result to DB
    const designId = uuidv4();
    await run(db,
      'INSERT INTO ai_designs (id, userId, prompt, imageUrl, style, roomType) VALUES (?, ?, ?, ?, ?, ?)',
      [designId, userId, prompt, generatedImageUrl, style, roomType]
    );
    
    res.json({ success: true, designId, imageUrl: generatedImageUrl });
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the AI Design generator interface
const renderAiStudio = () => `
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div class="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-12">
      <h1 class="text-4xl md:text-5xl font-display font-bold mb-4 flex items-center gap-4">
        <i class="ri-magic-line text-purple-300"></i> AI Design Studio
      </h1>
      <p class="text-xl text-indigo-100 max-w-2xl mb-8">Describe your dream room and watch our AI bring it to life instantly.</p>
      
      <form onsubmit="handleGenerateAiDesign(event)" class="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <select id="ai-room" class="px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white outline-none focus:bg-white/30">
            <option value="living_room" class="text-gray-900">Living Room</option>
            <option value="bedroom" class="text-gray-900">Bedroom</option>
            <option value="kitchen" class="text-gray-900">Kitchen</option>
          </select>
          <select id="ai-style" class="px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white outline-none focus:bg-white/30">
            <option value="modern" class="text-gray-900">Modern</option>
            <option value="minimalist" class="text-gray-900">Minimalist</option>
            <option value="luxury" class="text-gray-900">Luxury</option>
          </select>
        </div>
        <div class="flex gap-4">
          <input type="text" id="ai-prompt" placeholder="E.g., A cozy living room with large windows overlooking a forest..." required class="flex-1 px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-indigo-200 outline-none focus:bg-white/30 transition-all">
          <button type="submit" class="px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
            Generate <i class="ri-sparkling-fill"></i>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Results Grid -->
    <div id="ai-results-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Generated designs injected here -->
    </div>
  </div>
`;
```

---

## 9. Bookings & Payments Manager

### Database Schema
```sql
-- Stores customer project bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  designId TEXT,
  packageId TEXT,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL,
  customerId TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending', -- 'pending', 'successful', 'failed'
  transactionId TEXT,
  paymentGateway TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API
```javascript
// Create a new booking
app.post('/api/bookings/book-design', authenticate, async (req, res) => {
  const { designId, packageId, amount, notes } = req.body;
  const customerId = req.user.id;
  const bookingId = uuidv4();
  
  try {
    await run(db,
      'INSERT INTO bookings (id, customerId, designId, packageId, amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [bookingId, customerId, designId, packageId, amount, 'pending', notes]
    );
    res.json({ success: true, bookingId });
  } catch (error) {
    res.status(500).json({ error: 'Booking creation failed' });
  }
});
```

### Frontend UI Component
```typescript
// Renders the Admin panel section for managing all bookings
const renderAdminBookingsSection = () => {
  const bookings = state.admin.bookings || [];
  
  return `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-xl font-bold text-gray-900">Project Bookings</h3>
        <div class="flex gap-2">
          <input type="text" placeholder="Search bookings..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="py-4 px-6 text-sm font-semibold text-gray-600">ID / Date</th>
              <th class="py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
              <th class="py-4 px-6 text-sm font-semibold text-gray-600">Project / Design</th>
              <th class="py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
              <th class="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
              <th class="py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${bookings.map(b => `
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6">
                  <div class="font-mono text-xs text-gray-500 mb-1">#${b.id.substring(0,8)}</div>
                  <div class="text-sm text-gray-900">${new Date(b.createdAt).toLocaleDateString()}</div>
                </td>
                <td class="py-4 px-6 font-medium text-gray-900">${b.customerName || 'Unknown'}</td>
                <td class="py-4 px-6 text-sm text-gray-600">${b.designName || b.packageId || 'Custom'}</td>
                <td class="py-4 px-6 font-bold text-gray-900">₹${formatCurrency(b.amount)}</td>
                <td class="py-4 px-6">
                  <span class="px-3 py-1 rounded-full text-xs font-bold ${
                    b.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    b.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }">${b.status.toUpperCase()}</span>
                </td>
                <td class="py-4 px-6">
                  <button onclick="handleViewAdminBooking('${b.id}')" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    Manage
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};
```

---

## 10. Dashboard Announcements

### Data State (Configured via Admin State)
*Announcements are stored in local application state or global company config rather than a dedicated relational table, allowing rapid updates without complex schema migrations.*

### Frontend UI Component
```typescript
// Renders the Admin section to manage global system announcements
const renderAdminAnnouncementsSection = () => {
  const announcements = state.admin.announcements || [];
  
  return `
    <div class="space-y-6">
      <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-1">Global Announcements</h3>
          <p class="text-sm text-gray-500">Manage banner messages displayed to all customers.</p>
        </div>
        <button onclick="handleCreateAnnouncement()" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow flex items-center gap-2">
          <i class="ri-add-line"></i> New Announcement
        </button>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        ${announcements.map(ann => `
          <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 ${ann.isActive ? 'border-l-emerald-500' : 'border-l-gray-300'} flex justify-between items-center">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="px-2.5 py-0.5 rounded text-xs font-bold ${ann.type === 'offer' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}">
                  ${ann.type.toUpperCase()}
                </span>
                ${ann.isActive ? '<span class="flex items-center gap-1 text-xs font-medium text-emerald-600"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live</span>' : ''}
              </div>
              <h4 class="font-bold text-gray-900 text-lg">${ann.title}</h4>
              <p class="text-gray-600 text-sm mt-1">${ann.message}</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="toggleAnnouncementStatus('${ann.id}')" class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <i class="ri-${ann.isActive ? 'eye-off' : 'eye'}-line text-xl"></i>
              </button>
              <button onclick="deleteAnnouncement('${ann.id}')" class="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <i class="ri-delete-bin-line text-xl"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};
```
