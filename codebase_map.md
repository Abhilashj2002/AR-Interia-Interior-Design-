# AR Interia Codebase Map

This document outlines the architecture for the major features of the AR Interia application. For each feature requested, you will find the relevant Frontend UI components, Backend API routes, and Database tables, including line numbers for quick reference.

---

## 1. Homepage & Core Navigation
**Frontend (`main.ts`):**
- `renderHome` (Line 7731) - The main landing page view.
- `renderMain` (Line 7617) - Wraps the home and main layout structure.
- `renderNavItems` (Line 4859) - Renders top navigation items.
- `renderVideoEmbedOrTag` (Line 4938) - Renders hero section videos.

**Backend APIs (`server/index.js`):**
- `GET /api/company` (Line 2074) - Fetches company/homepage configuration.
- `GET /api/background-images` (Line 1729) - Fetches dynamic background images for the hero section.

**Database (`server/db.js`):**
- `backgroundImages` table (Line 236) - Stores slider images.

---

## 2. Services
**Frontend (`main.ts`):**
- `renderServices` (Line 8691) - The main services listing page.
- `renderServiceDetailsModal` (Line 5033) - Detailed view of a specific service.
- `renderServiceShowcaseDetailsModal` (Line 5156) - Showcase modal for services.

**Backend APIs (`server/index.js`):**
- Services are largely configured statically in the frontend state or fetched dynamically alongside categories.

---

## 3. Portfolio & Luxury Showroom
**Frontend (`main.ts`):**
- `renderPortfolio` (Line 9796) - Main portfolio grid.
- `renderPortfolioDialog` (Line 9729) - Detailed portfolio viewer.
- `renderShowroom` (Line 9232) - The luxury showroom tab.

**Backend APIs (`server/index.js`):**
- `GET /api/portfolio-content` (Line 2079 & 3447) - Fetch dynamic portfolio configurations.
- `PUT /api/portfolio-content` (Line 2103 & 3461) - Admin update for portfolio content.

**Database (`server/db.js`):**
- `portfolio_content` table (Line 411)
- `projects` table (Line 399)

---

## 4. Categories & Catalog
**Frontend (`main.ts`):**
- `renderCategoryGallery` (Line 8486) - Displays designs within a specific category.
- `renderImageThumb` (Line 2859) & `renderCategoryThumb` (Line 2869) - Helpers to render category grid items.
- `renderGallery` (Line 8205) - General design gallery.

**Backend APIs (`server/index.js`):**
- `GET /api/categories` (Line 2925)
- `POST /api/categories` (Line 3065)
- `PUT /api/categories/:id` (Line 3117)
- `GET /api/designs_v2` (Line 3088) - Enhanced design fetching.

**Database (`server/db.js`):**
- `categories` table (Line 69)
- `category_images` table (Line 246)
- `designs` table (Line 81)

---

## 5. Price Calculator & Packages
**Frontend (`main.ts`):**
- `renderPriceCalculatorModal` (Line 6647) - Interactive quotation calculator.
- `renderPackageModal` (Line 5602) - Viewing details of a package deal.

**Backend APIs (`server/index.js`):**
- `GET /api/packages` (Line 2025)
- `GET /api/packages/:id/designs` (Line 2062)

**Database (`server/db.js`):**
- `packages` table (Line 453)
- `package_designs` table (Line 470)

---

## 6. Inquiry & Contact
**Frontend (`main.ts`):**
- `renderContact` (Line 9555) - The contact us page/form.

**Backend APIs (`server/index.js`):**
- `POST /api/contact` (Line 3341) - Submit a new inquiry.
- `GET /api/enquiries` (Line 3377) - Admin fetch inquiries.
- `PUT /api/enquiries/:id` (Line 3410) - Admin update inquiry status.

**Database (`server/db.js`):**
- `inquiries` table (Line 262)

---

## 7. Customer Dashboard
**Frontend (`main.ts`):**
- `renderCustomerDashboard` (Line 16156) - The main portal for logged-in customers.
- Shows saved designs, active bookings, payment history, and chatbot interactions.

**Backend APIs (`server/index.js`):**
- `GET /api/user-details/:userId` (Line 2722)
- `GET /api/likes` (Line 2694)
- `GET /api/payments/customer/:customerId` (Line 1526)

**Database (`server/db.js`):**
- `customers` table (Line 34)
- `likes` table (Line 120)

---

## 8. Admin Dashboard
**Frontend (`main.ts`):**
- `renderAdmin` (Line 17109) - Main wrapper for the Admin Panel.
- `renderAdminDashboardSection` (Line 11956) - The overview charts and stats.
- `renderAdminCustomersSection` (Line 15815) - Customer management table.
- `renderAdminCustomerDetailsModal` (Line 13213) - Deep dive into a customer (includes newly synced payments/bookings/likes).

**Backend APIs (`server/index.js`):**
- `GET /api/health` (Line 1778) - Admin system status.
- `GET /api/customers` (Line 1797) - Fetch all registered customers.

---

## 9. Design Studio & AI
**Frontend (`main.ts`):**
- `renderAiStudio` (Line 9617) - The frontend interface for the AI design generator.
- `renderAdminDesignStudioSection` (Line 13062) - Admin tools for the design studio.
- `renderAdminDesignEditor` (Line 12109) - Admin interface to edit specific designs.
- `renderModelViewer` (Line 11565) - 3D Model viewer component.

**Backend APIs (`server/index.js`):**
- `POST /api/ai/designs` (Line 2780)
- `GET /api/ai/designs` (Line 2840)

**Database (`server/db.js`):**
- `ai_designs` table (Line 439)

---

## 10. Bookings & Payments Manager
**Frontend (`main.ts`):**
- `renderAdminBookingsSection` (Line 12667) - Admin bookings overview.
- `renderAdminBookingDetailsModal` (Line 12579) - Admin manage single booking.
- `renderAdminInvoicesSection` (Line 12894) - Admin manage payments/invoices.
- `renderBookingDetailsModal` (Line 16056) - Customer view of a booking.
- `renderPaymentSuccessModal` (Line 15921) & `renderCardPaymentModal` (Line 15966) - Checkout flow.

**Backend APIs (`server/index.js`):**
- `GET /api/bookings` (Line 1222)
- `POST /api/bookings/book-design` (Line 1185)
- `POST /api/bookings/update` (Line 1272)
- `GET /api/payments` (Line 1480)
- `POST /api/payments/razorpay/create` (Line 1353)

**Database (`server/db.js`):**
- `bookings` table (Line 168)
- `payments` table (Line 204)
- `invoices` table (Line 293)

---

## 11. Dashboard Announcements & Chatbot
**Frontend (`main.ts`):**
- `renderAdminAnnouncementsSection` (Line 15135) - Admin control for global site announcements.
- `renderAdminChatbotManagerSection` (Line 14725) - Admin configure chatbot settings.
- `renderAdminChatbotHistorySection` (Line 14651) - View chatbot conversations.

**Backend APIs (`server/index.js`):**
- `GET /api/chatbot/history` (Line 2603)
- `POST /api/chatbot/history` (Line 2572)

**Database (`server/db.js`):**
- `chatbot_logs` table (Line 155)
