# AR Interia - Project Structure & Setup Guide

## 🏠 Project Overview

AR Interia is a comprehensive full-stack interior design platform that enables customers to browse room designs, book interior projects, manage their activities, handle invoices and payments, and provides administrators with a complete dashboard for managing the entire business.

### Key Features
- **Public Website**: Landing page, gallery, services, portfolio showcase
- **Customer Portal**: Login, dashboard, bookings, feedback, invoices, payments
- **Admin Dashboard**: Complete management of bookings, customers, invoices, payments, packages, announcements
- **Design Tools**: Price calculator, design studio, luxury showroom
- **Communication**: Integrated chatbot for customer support
- **Payment Integration**: Razorpay and PhonePe support
- **Database**: SQLite for local development and easy deployment

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (User)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP: http://127.0.0.1:5500
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)                  │
│  - Public Pages (Home, Gallery, Services, Portfolio)        │
│  - Customer Dashboard (Bookings, Invoices, Profile)         │
│  - Admin Dashboard (Management, Analytics, Settings)        │
│  - Design Tools (Price Calculator, Design Studio)            │
└────────────────────────┬────────────────────────────────────┘
                         │ API Requests: http://localhost:5175/api
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express)                 │
│  - Authentication (JWT)                                      │
│  - API Routes (Bookings, Payments, Invoices, Admin)          │
│  - Business Logic (Pricing, Availability, Validation)        │
│  - Payment Integration (Razorpay, PhonePe)                   │
│  - Email Services (Nodemailer)                              │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                         │
│  - Users (Customers, Admins)                                 │
│  - Bookings & Orders                                         │
│  - Packages & Services                                      │
│  - Invoices & Payments                                      │
│  - Categories & Gallery Items                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Root Directory
```
arfinal/
├── backend/              # Backend module wrappers and API
├── frontend/             # Frontend application
├── server/               # Express server, database logic, routes
├── public/               # Static assets (images, uploads, videos)
├── scripts/              # Utility scripts, migrations, tests
├── index.html            # Vite HTML entry point
├── main.ts               # Main frontend runtime
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
└── README.md             # Project documentation
```

---

## 🎨 Frontend Structure

### Location: `frontend/src/`

```
frontend/src/
├── app/                  # Application entry points and runtime
│   ├── backend_module.runtime.ts
│   ├── frontend_module.runtime.ts
│   └── main.runtime.ts
├── components/           # Reusable UI components
├── features/            # Feature-specific modules
│   ├── admin/           # Admin authentication and management
│   ├── admin-dashboard/  # Main admin dashboard
│   ├── auth/            # Authentication (login, register)
│   ├── booking/         # Booking flow and management
│   ├── categories/      # Service categories
│   ├── chatbot/         # AI chatbot interface
│   ├── contact/         # Contact form and pages
│   ├── customer-dashboard/  # Customer portal
│   ├── design-studio/   # 3D design studio
│   ├── gallery/         # Image gallery
│   ├── homepage/        # Landing page
│   ├── luxury-showroom/ # Premium showcase
│   ├── packages/        # Service packages
│   ├── payments/        # Payment processing
│   ├── portfolio/       # Portfolio showcase
│   ├── price-calculator/ # Pricing calculator
│   ├── services/        # Services pages
│   └── shared/          # Shared utilities
├── homepage/            # Homepage specific components
├── services/            # Service-related logic
├── styles/              # Global styles and themes
├── types.ts             # TypeScript type definitions
└── constants.ts         # Application constants
```

### Frontend Technologies
- **Framework**: Vite (build tool), TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js
- **Charts**: Chart.js
- **HTTP Client**: Axios
- **State Management**: React hooks and context

### Key Frontend Features
1. **Homepage**: Hero section, featured designs, service highlights
2. **Gallery**: Filterable image gallery with categories
3. **Services**: Detailed service descriptions and pricing
4. **Portfolio**: Project showcase with case studies
5. **Price Calculator**: Interactive pricing estimator
6. **Design Studio**: 3D room visualization
7. **Chatbot**: AI-powered customer support
8. **Customer Dashboard**: Bookings, invoices, profile management
9. **Admin Dashboard**: Complete business management

---

## 🔧 Backend Structure

### Location: `backend/src/` and `server/`

```
backend/src/
├── api/                 # API entry points
│   └── server.js        # Main Express server
├── db/                  # Database repositories
│   └── repositories/    # Data access layer
│       ├── bookingsRepository.js
│       └── ...
└── modules/             # Business logic modules
    ├── admin/           # Admin operations
    ├── admin-dashboard/ # Dashboard logic
    ├── bookings/        # Booking management
    ├── categories/      # Category management
    ├── chatbot/         # Chatbot AI integration
    ├── customer-dashboard/ # Customer operations
    ├── design-studio/   # Design studio logic
    ├── gallery/         # Gallery management
    ├── homepage/        # Homepage content
    ├── invoices/        # Invoice generation
    ├── luxury-showroom/ # Showroom logic
    ├── packages/        # Package management
    ├── payments/        # Payment processing
    ├── portfolio/       # Portfolio management
    ├── price-calculator/ # Pricing logic
    └── services/        # Service management

server/
├── index.js             # Main server configuration
├── database.js          # Database connection setup
├── db.js                # Database schema and operations
├── invoices.js          # Invoice generation logic
├── razorpay.js          # Razorpay integration
├── routes/              # API route handlers
│   ├── invoices.js      # Invoice endpoints
│   ├── packages.js      # Package endpoints
│   └── smartGenerate.js # AI generation endpoints
├── seed-*.js            # Database seeding scripts
└── middleware/          # Express middleware
```

### Backend Technologies
- **Runtime**: Node.js (>=22.0.0)
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Email**: Nodemailer
- **PDF Generation**: PDFKit, jsPDF
- **File Upload**: Multer
- **Automation**: Puppeteer for screenshots

### Key Backend Features
1. **Authentication**: JWT-based auth with admin/customer roles
2. **API Endpoints**: RESTful API for all operations
3. **Payment Processing**: Razorpay and PhonePe integration
4. **Invoice Generation**: Automatic PDF invoice creation
5. **Email Services**: Invoice delivery and notifications
6. **Database Management**: SQLite with migration scripts
7. **AI Integration**: Support for Pro Engine and Gemini APIs

---

## 🗄️ Database Structure

### Database: SQLite
- **Location**: `server/ar_interia.db`
- **Type**: SQLite3 (file-based)
- **Backup**: Automatic backup on server start

### Main Tables

#### Users Table
```sql
- id (PRIMARY KEY)
- email (UNIQUE)
- password_hash
- role (admin/customer)
- name
- phone
- created_at
- updated_at
```

#### Bookings Table
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- package_id (FOREIGN KEY)
- status (pending/confirmed/completed/cancelled)
- total_amount
- booking_date
- created_at
- updated_at
```

#### Packages Table
```sql
- id (PRIMARY KEY)
- name
- category
- price
- description
- image_url
- features (JSON)
- is_active
```

#### Invoices Table
```sql
- id (PRIMARY KEY)
- booking_id (FOREIGN KEY)
- invoice_number (UNIQUE)
- amount
- status (pending/paid/overdue)
- due_date
- pdf_url
- created_at
```

#### Payments Table
```sql
- id (PRIMARY KEY)
- invoice_id (FOREIGN KEY)
- amount
- payment_method (razorpay/phonepe)
- transaction_id
- status (success/failed/pending)
- created_at
```

#### Categories Table
```sql
- id (PRIMARY KEY)
- name
- description
- image_url
- parent_id (self-referencing for subcategories)
- display_order
```

#### Gallery Table
```sql
- id (PRIMARY KEY)
- title
- description
- image_url
- category_id (FOREIGN KEY)
- is_featured
- display_order
```

### Database Operations
- **Seeding**: `server/seed-*.js` scripts for initial data
- **Migrations**: Custom migration scripts in `scripts/`
- **Backups**: Automatic on server restart
- **Queries**: Handled through repository pattern in `backend/src/db/repositories/`

---

## 🔑 API Keys Configuration

### Where to Add API Keys

API keys and sensitive configuration should be added to environment variables. **Never commit real API keys to the repository.**

### Step 1: Create Environment File

Copy the example environment file:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux:**
```bash
cp .env.example .env.local
```

### Step 2: Add Your API Keys

Edit `.env.local` and add your actual API keys:

```env
# Runtime Configuration
NODE_ENV=development
PAYMENT_SERVER_PORT=5175
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI Provider Keys (Optional)
PRO_ENGINE_KEY=your-pro-engine-api-key
GEMINI_API_KEY=your-gemini-api-key

# Razorpay Payment Keys (Required for Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# PhonePe Payment Keys (Required for PhonePe)
PHONEPE_MERCHANT_ID=your-phonepe-merchant-id
PHONEPE_SALT_KEY=your-phonepe-salt-key
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=UAT
PAYMENT_REDIRECT_BASE=http://127.0.0.1:5500/dashboard
PAYMENT_CALLBACK_BASE=http://localhost:5175/api/payments/phonepe/callback

# Email Configuration (Required for email features)
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### API Key Usage

#### 1. JWT Secret
- **Purpose**: Secure authentication tokens
- **Usage**: User login sessions and API authentication
- **Security**: Use a strong, random string (minimum 32 characters)
- **Example**: `JWT_SECRET=abc123xyz789def456ghi789jkl012mno345pqr678stu901vwx`

#### 2. AI Provider Keys
- **Pro Engine Key**: AI-powered design suggestions and chatbot
- **Gemini API Key**: Alternative AI provider for chatbot and features
- **Usage**: Called from backend AI integration modules
- **Optional**: Only required if AI features are enabled

#### 3. Razorpay Keys
- **Key ID**: Public key for frontend payment integration
- **Key Secret**: Private key for backend payment verification
- **Usage**: Payment processing and webhook verification
- **Environment**: Use test keys for development, production keys for live

#### 4. PhonePe Keys
- **Merchant ID**: Your PhonePe merchant identifier
- **Salt Key**: Secret key for payment verification
- **Salt Index**: Key version (usually 1)
- **Usage**: UAT (User Acceptance Testing) for development, PROD for live

#### 5. Email Configuration
- **Email Service**: SMTP provider (gmail, outlook, etc.)
- **Email User**: Your email address
- **Email Password**: App-specific password (not regular password)
- **Usage**: Sending invoices, notifications, verification emails

### Frontend-Safe Variables

For variables that need to be exposed to the frontend, use the `VITE_` prefix:

```env
VITE_PRO_ENGINE_KEY=your-public-api-key
VITE_RAZORPAY_KEY_ID=your-public-razorpay-key
```

**⚠️ Security Warning**: Only add public or non-sensitive keys to `VITE_` variables. These are exposed in the browser.

### Environment Variable Priority

1. `.env.local` (highest priority - for local development)
2. `.env.production` (for production builds)
3. `.env.development` (for development builds)
4. `.env` (default)

---

## 📸 Project Screenshots

### Homepage
![Homepage](./screenshots/homepage.png)
*The landing page featuring hero section, featured designs, and service highlights.*

### Chatbot
![Chatbot](./screenshots/chatbot.png)
*AI-powered chatbot for customer support and design assistance.*

### Services Page
![Services](./screenshots/services.png)
*Detailed services page showcasing interior design offerings.*

### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)
*Comprehensive admin dashboard for managing all business operations.*

### Customer Dashboard
![Customer Dashboard](./screenshots/customer-dashboard.png)
*Customer portal for managing bookings, invoices, and profile.*

### Invoice Page
![Invoice](./screenshots/invoice.png)
*Professional invoice generation and management interface.*

### Portfolio Page
![Portfolio](./screenshots/portfolio.png)
*Portfolio showcase featuring completed interior design projects.*

### Gallery Page
![Gallery](./screenshots/gallery.png)
*Filterable image gallery organized by categories and styles.*

> **Note**: To add screenshots, create a `screenshots/` directory in the project root and add images with the filenames specified above. Screenshots should be in PNG or JPG format and recommended size is 1200x800 pixels.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 22.0.0
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd arfinal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. **Start the development server**
```bash
npm run start
```

5. **Open in browser**
```
http://127.0.0.1:5500
```

### Available Scripts

```bash
npm run start          # Start frontend + backend + database
npm run dev            # Frontend only
npm run dev:server     # Backend only
npm run build          # Production build
npm run start:prod     # Build and run production server
npm run test:e2e       # End-to-end tests
npm run seed:invoices  # Seed sample invoices
```

---

## 🔒 Security Best Practices

1. **Never commit API keys**: Use `.env.local` for local development
2. **Use strong JWT secrets**: Minimum 32 characters, random string
3. **Enable HTTPS in production**: Use SSL certificates
4. **Rotate credentials regularly**: Update API keys periodically
5. **Use app passwords**: For email, use app-specific passwords
6. **Limit API key permissions**: Use principle of least privilege
7. **Monitor usage**: Track API usage for unusual activity

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Email verification

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get specific package
- `POST /api/packages` - Create package (admin)

### Invoices
- `GET /api/invoices` - Get user invoices
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices/generate` - Generate invoice

### Payments
- `POST /api/payments/razorpay/create` - Create Razorpay order
- `POST /api/payments/phonepe/create` - Create PhonePe order
- `POST /api/payments/callback` - Payment callback handler

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/bookings` - Manage all bookings
- `GET /api/admin/analytics` - Business analytics

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
npm run kill-ports
```

### Database Connection Issues
- Ensure SQLite file permissions are correct
- Check database file exists in `server/` directory
- Restart the server to recreate database if needed

### API Key Errors
- Verify `.env.local` file exists
- Check API key format and validity
- Ensure no extra spaces in environment variables

### Build Errors
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 📝 Development Notes

### Adding New Features
1. Create feature module in `frontend/src/features/`
2. Add corresponding backend module in `backend/src/modules/`
3. Create API routes in `server/routes/`
4. Update database schema if needed
5. Add environment variables to `.env.example`

### Database Migrations
- Create migration script in `scripts/`
- Test on development database first
- Backup production database before migration
- Document migration steps

### Testing
- Run smoke tests: `npm run test:e2e`
- Payment tests: `npm run test:payment-sync`
- Invoice tests: `npm run test:invoices:smoke`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For support and questions:
- Email: support@arinteria.com
- Documentation: See `docs/` directory
- Issues: Use project issue tracker

---

**Last Updated**: June 20, 2026
**Version**: 1.0.0
**Status**: Production Ready
