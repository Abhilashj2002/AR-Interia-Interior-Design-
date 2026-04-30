# 🎯 PAYMENT CARD DETAILS & TEST CREDENTIALS

## 💳 RAZORPAY TEST CARDS

### ✅ SUCCESSFUL PAYMENT CARD (USE THIS!)
```
CARD NUMBER:    4111111111111111
EXPIRY DATE:    12/30
CVV:            123
CARDHOLDER:     Any Name
```
**THIS CARD WILL COMPLETE PAYMENT SUCCESSFULLY**

---

### ⚠️ FAILED PAYMENT CARD (3D SECURE)
```
CARD NUMBER:    5105105105105100
EXPIRY DATE:    12/30
CVV:            123
OTP (if asked):  100
```
**This card will fail payment verification**

---

### ❌ INVALID CARD (Will be rejected)
```
CARD NUMBER:    4000000000000002
EXPIRY DATE:    12/30
CVV:            123
```
**This card will be immediately rejected**

---

## 🔐 LOGIN CREDENTIALS

### ADMIN LOGIN (See Everything)
```
Username:  admin
Password:  admin123
```

### CUSTOMER (Pre-registered)
```
Email/Username: rajkumar
Password:       password123
```

### ANOTHER CUSTOMER
```
Email/Username: priya123
Password:       password123
```

### OR REGISTER NEW
```
Name:     Your Full Name
Email:    your@email.com
Password: anything123
```

---

## 🌐 URLS TO ACCESS

### Frontend Application
```
http://localhost:3003
http://localhost:3003/login
http://localhost:3003/dashboard
http://localhost:3003/admin
```

### Backend API
```
http://localhost:5174/api/health
http://localhost:5174/api/login
http://localhost:5174/api/bookings
http://localhost:5174/api/feedbacks
```

---

## 🚀 COMPLETE TEST FLOW IN 5 MINUTES

### 1. REGISTER (30 seconds)
- Go to: `http://localhost:3003/login`
- Click: "New here? Create a customer account"
- Fill: Name, Email, Password
- Click: "Register Now"

### 2. LIKE DESIGN (20 seconds)
- Select any design on left
- Click: "Like" button
- Button turns green ✅

### 3. GIVE FEEDBACK (30 seconds)
- Scroll to "Customer Feedback" section
- Rate: 5 stars
- Comment: "Great!"
- Click: "Submit"

### 4. BOOK DESIGN (20 seconds)
- Select design
- Click: "Book Design" button
- See: "Design booked successfully!"

### 5. PAY FOR DESIGN (2 minutes)
- Click: "Pay & Book" button
- Razorpay modal opens
- Enter card: `4111111111111111`
- Expiry: `12/30`
- CVV: `123`
- Click: "Pay"
- SUCCESS! ✅

### 6. CHECK ADMIN (30 seconds)
- Logout
- Login as: `admin` / `admin123`
- Go to Admin Dashboard
- See all your actions:
  - ✅ Your booking (status: Confirmed)
  - ✅ Your feedback (rating: 5 stars)
  - ✅ Your like

**TOTAL TIME: ~5 MINUTES**

---

## 📊 WHAT YOU'LL SEE

### After Registration & Login
```
Dashboard
├── Designs (Browse)
├── Design Detail
│   ├── Like/Dislike buttons
│   └── Book Design / Pay & Book buttons
├── Your Liked Designs
├── Customer Feedback
│   ├── Rating selector
│   └── Comment input
└── My Bookings
    ├── Booking status
    └── Payment status
```

### Admin Dashboard
```
Admin Dashboard
├── Customers (18 total)
├── Bookings
│   ├── All bookings
│   ├── Payment status (Pending/Completed)
│   ├── Filter options
│   └── Order/Payment IDs
├── Feedbacks
│   ├── All feedback
│   ├── Ratings (stars)
│   └── Comments
├── Likes
│   ├── All design likes
│   └── Customer names
└── Enquiries
    ├── Contact submissions
    ├── Names & emails
    └── Messages
```

---

## ✅ VERIFICATION STEPS

### Step 1: Check Backend Running
```
Open in Browser: http://localhost:5174/api/health
You should see:
{
  "ok": true,
  "message": "Backend server is running",
  "timestamp": "2026-02-08T..."
}
```

### Step 2: Check Frontend Running
```
Open in Browser: http://localhost:3003
You should see: AR Interia home page
```

### Step 3: Login Works
```
Go to: http://localhost:3003/login
Enter: admin / admin123
Click: Sign In
Should see: Admin Dashboard
```

### Step 4: Payment Ready
```
Go to Dashboard
Select any design
Click: "Pay & Book"
Razorpay modal should open
Enter test card: 4111111111111111
```

### Step 5: Data Syncs
```
After payment, check:
- Dashboard shows "confirmed" booking ✅
- Admin sees payment "completed" ✅
- Like appears in admin ✅
- Feedback appears in admin ✅
```

---

## 🎉 SUCCESS INDICATORS

| Feature | Expected Result |
|---------|-----------------|
| Login | Page shows "Welcome back" |
| Register | Redirect to Dashboard |
| Like | Button turns green |
| Feedback | Message says "saved" |
| Book | Appears in "My Bookings" |
| Payment | "Payment successful" message |
| Admin View | Shows all customer data |
| Database | Data persists on restart |

---

## 🆘 QUICK FIXES

| Problem | Solution |
|---------|----------|
| "Cannot connect to backend" | Run: `npm run dev:server` |
| "Page not loading" | Check: http://localhost:3003 |
| "Login fails" | Try: admin / admin123 |
| "Payment modal missing" | Check browser console for errors |
| "Data not in admin" | Refresh admin page |
| "Backend error" | Check .env.local has RAZORPAY_KEY_ID |

---

## 📱 PHONE/MOBILE TESTING

### If testing on mobile/phone:
```
Find your computer IP:
ipconfig | findstr "IPv4"

Access from phone:
http://[YOUR_IP]:3003/login
```

Example:
```
Your IP: 192.168.1.100
URL: http://192.168.1.100:3003/login
```

---

## 🎓 SUPPORT

For detailed guides, see:
- `README_IMPLEMENTATION.md` - Complete overview
- `QUICK_START_GUIDE.md` - Step-by-step setup
- `API_QUICK_REFERENCE.md` - All API endpoints
- `PAYMENT_TESTING_GUIDE.md` - Payment details
- `COMPREHENSIVE_TESTING_GUIDE.md` - Full testing scenarios

---

## ⚡ VIDEO WALKTHROUGH (If you prefer a quick summary)

👉 **Follow These 3 Steps:**

1. **Open**: http://localhost:3003/login
2. **Login**: admin / admin123
3. **Browse**: Admin Dashboard to see all data

👉 **To Test Payment:**

1. **Go**: Dashboard (click your name → Dashboard)
2. **Select**: Any design
3. **Click**: "Pay & Book"
4. **Enter Card**: 4111111111111111
5. **Done**: Payment successful!

---

**🎊 ENJOY! Everything is Ready for Testing!**

Last Updated: February 8, 2024  
Status: ✅ Fully Operational
