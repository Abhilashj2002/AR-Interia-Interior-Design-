# AR Interia

AR Interia is a full-stack interior design platform for browsing room designs, booking interior projects, managing customer activity, handling invoices and payments, and running an admin dashboard.

The project includes a public website, gallery, services pages, portfolio content, price calculator, chatbot, customer dashboard, admin tools, SQLite database, and optional integrations for AI, payments, and email.

## Project Preview

### Home Page

![AR Interia home page](./01-home-hero.png)

### Gallery Page

![AR Interia gallery page](./02-gallery.png)

### Services Page

![AR Interia services page](./03-services.png)

### Portfolio Page

![AR Interia portfolio page](./04-portfolio.png)

### Admin Dashboard

![AR Interia admin dashboard](./05-admin-dashboard.png)

### Services Category Page

![AR Interia services category page](./06-category.png)

### Chatbot

![AR Interia chatbot](./07-chatbot.png)

### Customer/User Page

![AR Interia customer user page](./08-customer-user.png)

### Invoice

![AR Interia invoice preview](./09-invoice.png)

## Features

- Public landing page for interior design services
- Room and design gallery
- Services and portfolio pages
- Price calculator and project booking flow
- Customer login and customer dashboard
- Customer bookings, likes, feedback, invoices, and payments
- Admin dashboard for bookings, customers, invoices, payments, feedback, packages, announcements, and site settings
- SQLite database for local development
- Optional AI, Razorpay, PhonePe, and email/SMTP integrations

## Tech Stack

- Frontend: Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: SQLite
- Authentication: JWT with optional two-factor verification
- Payments: Razorpay and PhonePe integration hooks
- Email: Nodemailer SMTP support
- Media/UI: Three.js, Swiper, Chart.js

## Architecture

```text
Browser
  |
  | http://127.0.0.1:5500
  v
Vite Frontend
  |
  | API requests
  v
Express Backend
  |
  | SQL queries
  v
SQLite Database
```

Runtime flow:

1. The user opens the Vite frontend in the browser.
2. The frontend renders public pages, customer pages, and admin pages.
3. The frontend sends API requests to the Express backend.
4. The backend validates requests, handles auth, payments, invoices, bookings, and admin operations.
5. The backend reads and writes application data in SQLite.
6. Optional services such as AI providers, payment gateways, and SMTP email are enabled through environment variables.

## Folder Structure

```text
.
├── backend/               # Backend module wrappers and API entry points
├── frontend/              # Frontend app modules, styles, and runtime files
├── server/                # Express server, database logic, routes, invoices, payments
├── public/                # Static assets, uploaded files, invoices, and images
├── scripts/               # Utility, migration, smoke test, and verification scripts
├── index.html             # Vite HTML entry
├── main.ts                # Main frontend runtime
├── package.json           # Project scripts and dependencies
├── .env.example           # Safe environment variable template
├── README.md              # GitHub/project README
└── README.html            # Browser-openable README copy
```

## Requirements

- Node.js 22 or newer
- npm
- SQLite support through the bundled `sqlite3` dependency

Install dependencies:

```bash
npm install
```

## Run Locally

Start frontend, backend, and SQLite-backed database runtime together:

```bash
npm run start
```

Open the app:

```text
http://127.0.0.1:5500/
```

Backend API:

```text
http://localhost:5175/api
```

Health check:

```text
http://localhost:5175/api/health
```

Useful commands:

```bash
npm run dev          # Frontend only
npm run dev:server   # Backend only
npm run start        # Frontend + backend + SQLite runtime
npm run build        # Production build
npm run start:prod   # Build and run backend
```

## Environment Variables And API Keys

Do not put real API keys, payment secrets, email passwords, or JWT secrets in this README.

Use `.env.example` as the template and create a local secret file named `.env.local`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Put your real local values in `.env.local`:

```env
NODE_ENV=development
PAYMENT_SERVER_PORT=5175
JWT_SECRET=replace-with-a-long-random-secret
EMAIL_ENABLED=false
```

## Optional AI Keys

Only add these if AI features are enabled:

```env
PRO_ENGINE_KEY=your-pro-engine-key
GEMINI_API_KEY=your-gemini-api-key
```

If a value must be exposed to the browser through Vite, use a `VITE_` variable. Only put frontend-safe values in `VITE_` variables.

```env
VITE_PRO_ENGINE_KEY=your-public-or-restricted-frontend-key
```

## Payment Keys

Razorpay:

```env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

PhonePe:

```env
PHONEPE_MERCHANT_ID=your-phonepe-merchant-id
PHONEPE_SALT_KEY=your-phonepe-salt-key
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=UAT
PAYMENT_REDIRECT_BASE=http://127.0.0.1:5500/dashboard
PAYMENT_CALLBACK_BASE=http://localhost:5175/api/payments/phonepe/callback
```

Use sandbox or UAT keys during development. Use production payment keys only on a secure deployment server.

## Email Setup

Email is disabled by default:

```env
EMAIL_ENABLED=false
```

To enable invoice or verification emails:

```env
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

For Gmail, use a Gmail App Password. Do not use your normal Gmail password.

## Admin Login

Local admin account:

```text
Email: admin@gmail.com
Password: Admin@1234
```

Two-factor verification is enabled by default. In local development, the app can show a development verification code when email delivery is not configured.

Change the default admin password before deploying publicly.

## Database

The app uses SQLite for local development. There is no separate database server to start.

When you run:

```bash
npm run start
```

the backend starts and connects to the SQLite database automatically.

## Verification

Build the app:

```bash
npm run build
```

Check the backend:

```text
http://localhost:5175/api/health
```

Expected response includes:

```json
{
  "status": "ok",
  "databases": {
    "main": "connected",
    "secondary": "connected"
  }
}
```

Verified locally on 2026-06-20:

- `npm run build` completes successfully.
- Frontend responds at `http://127.0.0.1:5500/`.
- Backend health responds at `http://localhost:5175/api/health`.
- SQLite database connections report `connected`.
- README screenshots were captured from the local app, with the invoice preview using placeholder public-safe customer data.

## Deployment Notes

- Run `npm run build` before deployment.
- Add real environment variables in the hosting provider dashboard.
- Do not upload `.env.local`.
- Do not commit real secrets.
- Set a strong `JWT_SECRET`.
- Use production payment keys only in production.
- Configure SMTP with app passwords or provider-issued credentials.
- Change or remove demo/default admin credentials before any public deployment.

## GitHub Safety

Only `.env.example` should be committed. Local secret files should stay ignored:

```gitignore
.env
.env.*
*.local
!.env.example
```

Before pushing:

```bash
git status --short
git ls-files .env .env.local
```

If `.env.local` is tracked by mistake, remove it from Git while keeping the local file:

```bash
git rm --cached .env.local
```

If a real secret was ever committed, rotate that secret immediately.

## GitHub Publish Readiness

Current local checks:

- API key scan found no real-looking OpenAI, Gemini, Razorpay, PhonePe, SMTP, or JWT secrets in tracked source patterns; the matches are placeholders or development fallbacks.
- `.env`, `.env.*`, and `*.local` are ignored, while `.env.example` remains trackable.
- `git ls-files .env .env.local .env.local.codex-api-check .env.example` reports only `.env.example`.
- Production build passes with Vite.

Before publishing:

- Review the very large current `git status --short` output and commit only intentional files.
- Avoid committing generated databases, local invoices, build output, temporary reports, or scratch files unless they are deliberately part of the project.
- Replace demo admin credentials and rotate any credential that may have been shared outside the local development environment.
- Keep real API keys only in local or hosting-provider environment variables.
