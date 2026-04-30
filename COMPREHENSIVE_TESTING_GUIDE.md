# Complete End-to-End Testing Guide

## System Architecture Overview

```
Frontend (http://localhost:3000)
    ↓
Backend API (http://localhost:5174)
    ↓
SQLite Database (server/ar_interia.db)
```

---

## Pre-Requisites

### 1. Backend Server Status
Ensure the backend server is running on port 5174:
```powershell
npm run dev:server
```

Expected output:
```
✅ Database initialized
✅ Backend server running on http://localhost:5174
📧 API endpoints available
```

### 2. Frontend Dev Server  
Ensure the frontend is running on port 3000:
```powershell
npm run dev
```

Expected output:
```
VITE v4.x.x ready in xxx ms
➜ Local:   http://localhost:3000/
```

---

## Test Flow 1: Customer Registration & Dashboard

### Step 1: Register New Customer
1. Go to `http://localhost:3000/login`
2. Click **"New here? Create a customer account"**
3. Fill in:
   ```
   Name: John Doe
   Email: john.doe@example.com
   Username: johndoe (auto-filled from email)
   Password: password123
   ```
4. Click **Register Now**

**Expected Result**: 
- ✅ Account created
- ✅ Automatic redirect to Dashboard
- ✅ Welcome message shows: "Welcome back, John Doe"

### Step 2: Browse Designs
1. In Dashboard, left panel shows "Designs"
2. Select a design from the list
3. Right panel shows design details

**Expected Result**:
- ✅ Design preview loads
- ✅ Price displays correctly
- ✅ Like/Dislike buttons visible

---

## Test Flow 2: Like & Feedback

### Like Design
1. On Dashboard, select any design
2. Click **Like** button
3. Button turns green

**Expected Result**:
- ✅ Button changes to green (like) or red (dislike)
- ✅ Can see design in "Your Liked Designs" section
- ✅ In Admin Dashboard → Likes, this "like" record appears

### Submit Feedback
1. Scroll down to "Customer Feedback" section
2. Set Rating: 5 stars
3. Enter comment: "Excellent service!"
4. Click **Submit**

**Expected Result**:
- ✅ Feedback saved locally
- ✅ In Admin Dashboard → Feedbacks, this feedback appears
- ✅ Shows customer name, rating, and comment

---

## Test Flow 3: Book Design (Without Payment)

### Book Design Only
1. Select a design
2. Click **Book Design** button
3. Wait for response

**Expected Result**:
- ✅ Message appears: "Design booked successfully!"
- ✅ Design appears in "My Bookings" section
- ✅ Booking status shows as "Pending"
- ✅ In Admin Dashboard → Bookings, booking appears with status "pending"

---

## Test Flow 4: Payment Flow (MOST IMPORTANT)

### Step 1: Click Pay & Book
1. On Dashboard, select a design (price > 0)
2. Click **Pay & Book** button
3. System creates booking first

**Expected Result at this stage**:
- ✅ Loading indicator appears
- ✅ Razorpay modal should open

### Step 2: Enter Test Card Details
Razorpay modal opens with form:

**Card Details (SUCCESS):**
```
Card Number: 4111111111111111
Expiry: 12/30
CVV: 123
Name: John Doe
```

1. Enter card details shown above
2. Click "Pay" button

**Expected Result**:
- ✅ Payment verification happens
- ✅ Success message appears
- ✅ Booking status changes to "Confirmed"
- ✅ Payment status shows "Completed"
- ✅ Design moves from "Pending" to "Confirmed" in bookings

### Step 3: Verify in Admin Dashboard

1. Logout from customer account
2. Login as Admin:
   ```
   Username: admin
   Password: admin123
   ```
3. Go to **Bookings** section

**Expected Result**:
- ✅ Shows your booking with:
  - Design name
  - Price
  - Payment status: "Completed"
  - Order ID (Razorpay Order ID)
  - Payment ID (Razorpay Payment ID)
  - Timestamp

---

## Test Flow 5: Admin Dashboard Full View

### Login as Admin
1. Go to `http://localhost:3000/login`
2. Enter:
   ```
   Username: admin
   Password: admin123
   ```
3. Click **Sign In**

### Check All Sections

#### 1. Customers Section
- Click **Customers** tab
- Should show all registered customers
- Lists: Name, Email, Role, Created Date

**Expected Result**:
- ✅ John Doe should appear in list
- ✅ Role: customer

#### 2. Bookings Section
- Click **Bookings** tab
- Shows filter options: Search, Date range, Category, Payment Status
- Lists all bookings

**Expected Result**:
- ✅ Your booking appears with full details
- ✅ Shows customer name, design, amount, payment status
- ✅ Payment status: "completed" (green indicator)

#### 3. Feedbacks Section
- Click **Feedbacks** tab
- Shows all customer feedback

**Expected Result**:
- ✅ Feedback you submitted appears
- ✅ Shows rating (5 stars), comment, customer name
- ✅ Time stamp of submission

#### 4. Likes Section
- Click **Likes** tab
- Shows all design likes/favorites

**Expected Result**:
- ✅ Like you gave appears
- ✅ Shows customer, design, like value

#### 5. Enquiries/Contacts Section
- Click **Enquiries** tab
- Shows contact form submissions

---

## Test Flow 6: Contact Form (Contact Page)

### Submit Enquiry
1. Go to `http://localhost:3000/contact`
2. Fill form:
   ```
   Name: Jane Smith
   Email: jane@example.com
   Message: I am interested in modular kitchen design
   ```
3. Click **Submit**

**Expected Result**:
- ✅ Success message appears
- ✅ In Admin Dashboard → Enquiries, record appears
- ✅ Shows name, email, message, timestamp

---

## Test Scenarios

### Scenario A: Happy Path (Complete Customer Journey)
1. ✅ Register as new customer
2. ✅ Browse and like a design
3. ✅ Submit feedback with 5-star rating
4. ✅ Book a design (without payment)
5. ✅ Book another design with payment
6. ✅ Check admin dashboard shows all actions

**Total Time**: ~5-10 minutes
**Expected Result**: All data persists and syncs between frontend and admin dashboard

### Scenario B: Payment Testing
1. ✅ Try payment with success card (4111111111111111)
2. ✅ Verify booking becomes "Confirmed"
3. ✅ Check admin sees payment as "completed"
4. ✅ Try booking another design
5. ✅ Check multiple bookings appear in admin

**Total Time**: ~5 minutes

### Scenario C: Admin Review
1. ✅ Login as admin
2. ✅ Check customers list has > 1 customer
3. ✅ Check bookings show payment statuses
4. ✅ Check feedbacks show ratings
5. ✅ Filter bookings by different criteria

**Total Time**: ~3 minutes

---

## Database Verification

### Check SQLite Database Directly
```powershell
# Navigate to project
cd c:\Users\abhil\Downloads\ar-interia---ai-powered-ar-interior-design

# Open database
sqlite3 server/ar_interia.db

# View records
.tables                          # List all tables
SELECT * FROM customers;        # View customers
SELECT * FROM bookings;         # View bookings
SELECT * FROM feedbacks;        # View feedbacks
SELECT * FROM likes;            # View likes
SELECT * FROM inquiries;        # View inquiries (contact forms)
SELECT * FROM payments;         # View payment records
```

### Expected Database State After Tests:
- `customers` table: 2+ records (one test customer + admin)
- `bookings` table: 3+ records
- `feedbacks` table: 1+ records  
- `likes` table: 1+ records
- `inquiries` table: 1+ records
- `payments` table: 1+ records with status "completed"

---

## Troubleshooting

### Issue 1: Login Button Not Working
**Symptom**: Click login, nothing happens
**Solution**:
1. Check backend server is running: `npm run dev:server`
2. Check API health: `curl http://localhost:5174/api/health`
3. Check browser console for errors: F12 → Console tab
4. Verify no ports blocked

### Issue 2: Payment Modal Doesn't Open
**Symptom**: Click "Pay & Book" but no modal appears
**Solution**:
1. Check booking is created first (check backend logs)
2. Check Razorpay script loads in browser (Network tab in DevTools)
3. Verify `RAZORPAY_KEY_ID` is set in `.env.local`
4. Check browser console for errors

### Issue 3: Payment Verification Fails
**Symptom**: Payment succeeds in Razorpay but booking not confirmed
**Solution**:
1. Check backend logs for signature verification errors
2. Verify amount in API matches (in paise)
3. Ensure payment record exists in database
4. Restart backend server

### Issue 4: Admin Dashboard Empty
**Symptom**: Admin logged in but no bookings/feedbacks shown
**Solution**:
1. Verify customer data was created (check DB)
2. Refresh admin dashboard page (Ctrl+R)
3. Ensure API calls complete (check Network tab)
4. Check backend logs for errors

### Issue 5: Data Not Syncing
**Symptom**: Like on customer dashboard but doesn't appear in admin
**Solution**:
1. Refresh admin dashboard page
2. Check network requests completed successfully
3. Verify customer ID matches in database
4. Check for JavaScript errors in console

---

## API Response Examples

### Successful Login
```json
{
  "success": true,
  "customer": {
    "id": "cust-1704873000000-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Successful Booking
```json
{
  "success": true,
  "message": "Design booked successfully",
  "bookingId": "book-1704873000000-xyz789"
}
```

### Successful Payment Verification
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### Successful Feedback
```json
{
  "success": true,
  "message": "Feedback saved",
  "id": "fb-1704873000000-qwe456"
}
```

---

## Performance Notes

- Page load: < 2 seconds
- Login: < 1 second
- Booking: < 2 seconds
- Payment: < 5 seconds (including Razorpay verification)
- Dashboard refresh: < 3 seconds
- Database query: < 100ms typical

---

## Security Notes

- Passwords are hashed with bcryptjs
- Payment signatures verified with SHA256
- All API calls use POST for state-changing operations
- CORS enabled for localhost:3000
- SQL injection prevented with parameterized queries

---

## Final Checklist

✅ Backend server running  
✅ Frontend server running  
✅ Test customer account created  
✅ Design liked successfully  
✅ Feedback submitted successfully  
✅ Booking created successfully  
✅ Payment completed successfully  
✅ Admin can see all customer actions  
✅ Contact form working  
✅ All data persists in database

---

**Last Updated**: February 2024  
**Status**: Ready for Full Testing
