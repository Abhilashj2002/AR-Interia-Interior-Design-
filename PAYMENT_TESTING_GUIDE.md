# Payment Testing Guide & Card Details

## Test Card Details for Razorpay

### For Successful Payment
```
Card Number: 4111111111111111
Expiry: 12/30
CVV: 123
OTP: 123456 (when prompted)
```

### For Test Failure (3D Secure)
```
Card Number: 5105105105105100
Expiry: 12/30
CVV: 123
OTP: 100 (when prompted)
```

### For Invalid Card
```
Card Number: 4000000000000002
Expiry: 12/30
CVV: 123
```

---

## How to Test Complete Payment Flow

### Step 1: Customer Login
**URL**: http://localhost:3000/login

**Test Credentials** (Auto-registered customers):
```
Email/Username: rajkumar
Password: password123

Email/Username: priya123
Password: password123

Email/Username: amit.patel
Password: password123

Email/Username: admin
Password: admin123 (For Admin Access)
```

Or **Register a New Account**:
- Click "New here? Create a customer account"
- Fill in Name, Email, Username, Password
- Click "Register Now"

---

### Step 2: Browse & Select Design
1. After login, go to **Dashboard**
2. Browse designs in the left panel
3. Select a design to view details

---

### Step 3: Like/Feedback/Book Design

#### Like Design
- Click **Like** or **Dislike** button
- Changes appear in "Your Liked Designs" section
- Syncs to admin dashboard

#### Give Feedback
- Scroll to "Customer Feedback" section
- Rate 1-5 stars
- Write your comment
- Submit feedback
- Appears in admin dashboard

#### Book Design
- Click **Book Design** button
- Design is booked with "Pending" status
- Appears in "My Bookings" section

#### Make Payment
- Click **Pay & Book** button
- Razorpay modal opens
- Use test card details above
- Complete payment
- Booking status changes to "Confirmed"
- Payment recorded in admin dashboard

---

### Step 4: Check Admin Dashboard

**Login as Admin**:
- Username: `admin`
- Password: `admin123`

**View in Admin Panel**:
- **Customers**: All registered customers
- **Bookings**: All bookings with payment status
- **Feedbacks**: All customer feedback
- **Enquiries**: Contact form submissions
- **Projects**: Portfolio items

---

## Payment Flow Diagram

```
1. Customer Selects Design
   ↓
2. Clicks "Pay & Book" 
   ↓
3. Backend Creates Booking (status: pending)
   ↓
4. Backend Creates Razorpay Order
   ↓
5. Frontend Shows Razorpay Modal
   ↓
6. Customer Enters Card Details
   ↓
7. Tests Card Verification
   ↓
8. Backend Verifies Payment Signature
   ↓
9. Backend Updates Booking (status: confirmed)
   ↓
10. Customer Dashboard Refreshes
    ↓
11. Admin Sees Updated Booking with Payment Status
```

---

## API Endpoints Used in Payment Flow

### 1. Login
```
POST /api/auth/login
{
  "username": "email_or_username",
  "password": "password"
}

Response:
{
  "success": true,
  "customer": {
    "id": "cust-xxx",
    "name": "Customer Name",
    "email": "email@example.com",
    "role": "customer"
  }
}
```

### 2. Create Booking
```
POST /api/bookings/book-design
{
  "customerId": "cust-xxx",
  "designId": "design-001"
}

Response:
{
  "success": true,
  "bookingId": "book-xxx"
}
```

### 3. Create Razorpay Order
```
POST /api/payments/razorpay/create
{
  "customerId": "cust-xxx",
  "designId": "design-001",
  "bookingId": "book-xxx",
  "amount": 45000
}

Response:
{
  "success": true,
  "orderId": "order_xxx",
  "keyId": "rzp_xxx",
  "amount": 45000,
  "currency": "INR",
  "paymentId": "pay-xxx"
}
```

### 4. Verify Payment
```
POST /api/payments/razorpay/verify
{
  "paymentId": "pay_xxx",
  "orderId": "order_xxx",
  "signature": "signature_hash"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### 5. Submit Feedback
```
POST /api/feedbacks
{
  "userId": "cust-xxx",
  "userName": "Customer Name",
  "rating": 5,
  "comment": "Great service!"
}

Response:
{
  "success": true,
  "message": "Feedback saved",
  "id": "fb-xxx"
}
```

### 6. Toggle Like
```
POST /api/likes
{
  "userId": "cust-xxx",
  "designId": "design-001"
}

Response:
{
  "success": true,
  "liked": true
}
```

### 7. Get Customer Details
```
GET /api/user-details/cust-xxx

Response:
{
  "success": true,
  "user": { /* user info */ },
  "bookings": [ /* all bookings */ ],
  "payments": [ /* all payments */ ],
  "feedbacks": [ /* all feedbacks */ ],
  "likes": [ /* all likes */ ]
}
```

### 8. Get All Bookings (Admin)
```
GET /api/bookings

Response:
{
  "success": true,
  "bookings": [
    {
      "id": "book-xxx",
      "userId": "cust-xxx",
      "designName": "Design Name",
      "designId": "design-001",
      "price": 45000,
      "status": "pending|confirmed|approved",
      "paymentStatus": "pending|completed",
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

### 9. Submit Contact/Enquiry
```
POST /api/contact
{
  "name": "Customer Name",
  "email": "email@example.com",
  "message": "I would like to know more..."
}

Response:
{
  "message": "Inquiry received. We will contact you soon."
}
```

---

## Expected Behavior After Payment

### Customer Dashboard Shows:
- ✅ Design in "My Bookings" section
- ✅ Booking status: "confirmed"
- ✅ Payment status: "completed"
- ✅ Like status updated if liked
- ✅ Feedback visible if submitted

### Admin Dashboard Shows:
- ✅ New booking in bookings list
- ✅ Booking status: "confirmed"
- ✅ Payment status: "completed"  
- ✅ Customer name and email
- ✅ Design name and price
- ✅ Order ID and payment ID
- ✅ Timestamp of booking

---

## Troubleshooting

### Payment Modal Not Opening
- Check browser console for errors
- Ensure Razorpay API key is set in backend
- Verify .env.local has `RAZORPAY_KEY_ID`

### Payment Fails at Verification
- Check backend logs for signature verification error
- Verify webhook IP is whitelisted (if using production)
- Ensure payment amount matches in all APIs

### Booking Not Appearing
- Refresh dashboard page
- Check if customer ID matches
- Verify backend database has booking record

### Admin Dashboard Empty
- Ensure logged in as admin
- Check if customer data is syncing
- Look for API errors in browser console

---

## Test Scenarios

### Scenario 1: Complete Happy Path
1. Register new customer
2. Like a design
3. Give feedback (5 stars)
4. Book & Pay with test card
5. Verify in admin dashboard

### Scenario 2: Multiple Bookings
1. Login as customer
2. Book 3 different designs
3. Pay for each
4. Verify all appear in dashboard

### Scenario 3: Admin View
1. Login as admin
2. View all customers list
3. View all bookings with payment status
4. View all feedback/ratings
5. View all enquiries

### Scenario 4: Payment Failure
1. Use failed test card (4000000000000002)
2. Try to pay
3. See error message
4. Try again with valid card
5. Payment succeeds

---

## Notes

- Test mode uses Razorpay's sandbox environment
- No real money is charged during testing
- Orders typically show in Razorpay dashboard within seconds
- Payment verification uses SHA256 hash signature
- All timestamps are in UTC timezone
- Database persists all changes automatically

---

**Last Updated**: February 2024  
**Status**: Ready for End-to-End Testing
