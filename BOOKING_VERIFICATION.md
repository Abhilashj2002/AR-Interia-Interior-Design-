# Booking Sync Verification Guide

## Complete Booking Flow Test

### Prerequisites
- Backend running on port 5500
- Frontend running on port 5173
- Admin account: admin@test.local / AdminPass@123
- Customer account: aj@gmail.com / Aj@12345

### Step-by-Step Verification

#### 1. Start Backend Server
```bash
npm run start
```
Wait for: `✅ Server listening on port 5500`

#### 2. Start Frontend Dev Server
```bash
npm run dev
```
Wait for: `ready in XXX ms`

#### 3. Run Booking Flow Test
```bash
node test_booking_flow.cjs
```

This script will:
1. ✅ Log in as admin
2. ✅ Log in as customer (aj@gmail.com)
3. ✅ Get available designs
4. ✅ Book a design as the customer
5. ✅ Verify the booking appears in customer's booking list
6. ✅ Verify the booking appears in admin's ALL bookings list

If the test passes, bookings are being created and synced correctly.

#### 4. Manual Verification in Browser

**Window 1: Admin Dashboard**
```
1. Open http://localhost:5173
2. Login as admin@test.local / AdminPass@123
3. Go to Admin tab
4. Look at "📅 Bookings Manager" section
5. Note the current number of bookings
6. Click "🔄 Refresh Now" button
```

**Window 2: Customer Booking**
```
1. Open http://localhost:5173 (new browser tab)
2. Log out if needed (close tab or clear session)
3. Login as aj@gmail.com / Aj@12345
4. Browse to Portfolio/Designs
5. Click on any design
6. Click "📝 Book This Design" or similar button
7. Wait for "✅ Design booked successfully!" message
```

**Back to Window 1: Admin Dashboard**
```
1. The bookings count should increase
2. The new booking should appear at the TOP of the list
3. It should show:
   - Design name ✅
   - Customer name (from aj@gmail.com) ✅
   - Booking date (should be TODAY/NOW) ✅
   - Status (should be "pending") ✅
4. Click "🔄 Refresh Now" to force update
```

### Expected Behavior

**When Booking is Created:**
- Frontend logs: `📝 [handleBookDesignOnly] Booking design: {...}`
- Frontend logs: `📝 [handleBookDesignOnly] Server response: {success: true, bookingId: "..."}`
- Frontend logs: `✅ [handleBookDesignOnly] Booking success, syncing dashboards...`
- Frontend logs: `✅ [syncDashboardsAndInvoices] Starting sync...`
- Frontend logs: `🔄 [syncDashboardsAndInvoices] Refresh complete. Admin bookings count: XXX`
- Frontend logs: `✅ [syncDashboardsAndInvoices] Complete. Admin bookings: XXX`

**If Booking Doesn't Appear:**

Check browser console (F12) for these issues:
1. ❌ "Not authorized to fetch admin data" → User is not logged in as admin
2. ❌ API fetch error → Backend might not be running
3. ❌ Wrong booking count → Bookings are being created but not displayed

### Troubleshooting

**Bookings appear but not updating:**
- ✅ Click "🔄 Refresh Now" button on admin bookings panel
- ✅ Wait 30 seconds for auto-refresh to kick in
- ✅ Check browser console for any errors

**New bookings not appearing at all:**
1. Check backend is returning bookings: Run `node test_booking_flow.cjs`
2. Check admin user is logged in (not customer)
3. Check authorization header is being sent with JWT token
4. Check bookings are actually being created in database

**Still Not Working?**
Check browser console (F12 → Console tab) for:
- Booking creation errors
- API fetch failures
- Sync errors
- Authorization failures

### Key Code Locations

Frontend:
- Booking creation: `handleBookDesignOnly()` in main.ts
- Sync after booking: `syncDashboardsAndInvoices()` in main.ts
- Admin fetch: `refreshAdminData()` in main.ts
- Display: `renderAdminBookingsSection()` in main.ts

Backend:
- Create booking: `POST /api/bookings/book-design` in server/index.js
- Fetch bookings: `GET /api/bookings` in server/index.js
- Database: `server/ar_interia.db` (SQLite)

### Database Query to Verify

To directly check database, run in backend server:
```javascript
// After server starts, run in terminal:
node -e "from './server/db.js' import {allAsync}; allAsync('SELECT COUNT(*) as count FROM bookings').then(r => console.log(r))"
```

Or use SQLite shell:
```bash
sqlite3 server/ar_interia.db "SELECT COUNT(*) as total, COUNT(DISTINCT customerId) as customers FROM bookings;"
```

