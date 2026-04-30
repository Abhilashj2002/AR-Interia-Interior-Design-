# API Quick Reference Guide

## Base URL
```
http://localhost:5174
```

## Authentication Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response: 200 OK
{
  "success": true,
  "customer": {
    "id": "cust-xxx",
    "name": "Administrator",
    "email": "admin@arinterior.com",
    "username": "admin",
    "role": "admin"
  }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securepass123"
}

Response: 200 OK
{
  "success": true,
  "message": "Registration successful",
  "customer": {
    "id": "cust-xxx",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

## Admin Dashboard Endpoints

### 1. ENQUIRIES

#### Get All Enquiries
```
GET /api/enquiries

Response: 200 OK
{
  "success": true,
  "enquiries": [
    {
      "id": "inq-1704873000000-a1b2c3",
      "name": "Raj Patel",
      "email": "raj.patel@email.com",
      "message": "Interested in custom designs for my office space...",
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

#### Submit Contact/Enquiry
```
POST /api/contact
Content-Type: application/json

{
  "name": "Customer Name",
  "email": "customer@example.com",
  "message": "I would like to know more about..."
}

Response: 200 OK
{
  "message": "Inquiry received. We will contact you soon."
}
```

---

### 2. BOOOKINGS

#### Get All Bookings
```
GET /api/bookings

Response: 200 OK
{
  "success": true,
  "bookings": [
    {
      "id": "book-1704873000000-x1y2z3",
      "userId": "cust-xxx",
      "designId": "design-001",
      "designName": "Modern Living Room",
      "categoryId": "cat-xxx",
      "price": 45000,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

#### Get Customer's Bookings
```
GET /api/bookings?customerId=cust-xxx

Response: 200 OK
{
  "success": true,
  "bookings": [...]
}
```

#### Create Booking
```
POST /api/bookings/book-design
Content-Type: application/json

{
  "customerId": "cust-xxx",
  "designId": "design-001"
}

Response: 200 OK
{
  "success": true,
  "message": "Design booked successfully",
  "bookingId": "book-xxx"
}
```

#### Update Booking Status
```
POST /api/bookings/update
Content-Type: application/json

{
  "bookingId": "book-xxx",
  "status": "confirmed"
}

Response: 200 OK
{
  "success": true,
  "message": "Booking updated"
}
```

---

### 3. FEEDBACKS

#### Get All Feedbacks
```
GET /api/feedbacks

Response: 200 OK
{
  "success": true,
  "feedbacks": [
    {
      "id": "fb-1704873000000-m1n2o3",
      "customerId": "cust-xxx",
      "designId": "design-001",
      "rating": 5,
      "comment": "Great quality and amazing customer service!",
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

#### Get User Feedbacks
```
GET /api/feedbacks?userId=cust-xxx

Response: 200 OK
{
  "success": true,
  "feedbacks": [...]
}
```

#### Submit Feedback
```
POST /api/feedbacks
Content-Type: application/json

{
  "userId": "cust-xxx",
  "userName": "Raj Kumar",
  "designId": "design-001",
  "rating": 5,
  "comment": "Excellent work! Very happy with the design."
}

Response: 200 OK
{
  "success": true,
  "message": "Feedback saved",
  "id": "fb-xxx"
}
```

---

### 4. PROJECTS/PORTFOLIO

#### Get All Projects
```
GET /api/projects

Response: 200 OK
{
  "projects": [
    {
      "id": "prj-1704873000000-p1q2r3",
      "title": "Modern Living Room Transformation",
      "price": 45000,
      "image_url": "https://images.unsplash.com/...",
      "category": "Living Room",
      "description": "A stunning living room transformation with contemporary furniture..."
    }
  ]
}
```

#### Create New Project
```
POST /api/projects
Content-Type: application/json

{
  "title": "Luxury Kitchen Design",
  "price": 65000,
  "category": "Kitchen",
  "description": "High-end kitchen with premium materials and modern appliances",
  "image_url": "https://images.unsplash.com/..."
}

Response: 200 OK
{
  "success": true,
  "project": {
    "id": "prj-xxx",
    "title": "Luxury Kitchen Design",
    "price": 65000,
    "category": "Kitchen",
    "description": "...",
    "image_url": "..."
  }
}
```

---

### 5. CUSTOMERS

#### Get All Customers
```
GET /api/customers

Response: 200 OK
{
  "success": true,
  "customers": [
    {
      "id": "cust-xxx",
      "name": "Raj Kumar",
      "email": "raj@example.com",
      "username": "rajkumar",
      "role": "customer",
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

#### Get Detailed User Profile
```
GET /api/user-details/cust-xxx

Response: 200 OK
{
  "success": true,
  "user": {
    "id": "cust-xxx",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "username": "rajkumar",
    "role": "customer",
    "createdAt": "2024-01-10T10:30:00Z"
  },
  "bookings": [...],
  "payments": [...],
  "feedbacks": [...],
  "likes": [...]
}
```

---

### 6. LIKES/FAVORITES

#### Get All Likes
```
GET /api/likes

Response: 200 OK
{
  "success": true,
  "likes": [
    {
      "id": "like-xxx",
      "customerId": "cust-xxx",
      "designId": "design-001",
      "value": "like",
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

#### Get User Likes
```
GET /api/likes?userId=cust-xxx

Response: 200 OK
{
  "success": true,
  "likes": [...]
}
```

#### Toggle Like/Unlike
```
POST /api/likes
Content-Type: application/json

{
  "userId": "cust-xxx",
  "designId": "design-001"
}

Response: 200 OK
{
  "success": true,
  "liked": true
}
```

---

### 7. BACKGROUND IMAGES

#### Get All Background Images
```
GET /api/background-images

Response: 200 OK
{
  "success": true,
  "images": [
    {
      "id": "bg-xxx",
      "name": "Living Room BG",
      "url": "https://...",
      "isDefault": 0,
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

#### Add Background Image
```
POST /api/background-images
Content-Type: application/json

{
  "name": "Modern Office BG",
  "url": "https://images.unsplash.com/..."
}

Response: 200 OK
{
  "success": true,
  "message": "Background image added",
  "id": "bg-xxx"
}
```

#### Delete Background Image
```
DELETE /api/background-images/bg-xxx

Response: 200 OK
{
  "success": true,
  "message": "Background image deleted"
}
```

---

### 8. PAYMENTS

#### Create Razorpay Order
```
POST /api/payments/razorpay/create
Content-Type: application/json

{
  "customerId": "cust-xxx",
  "designId": "design-001",
  "bookingId": "book-xxx",
  "amount": 45000
}

Response: 200 OK
{
  "success": true,
  "orderId": "order_xxx",
  "keyId": "rzp_xxx",
  "amount": 45000,
  "currency": "INR",
  "paymentId": "pay-xxx"
}
```

#### Verify Razorpay Payment
```
POST /api/payments/razorpay/verify
Content-Type: application/json

{
  "paymentId": "pay-xxx",
  "orderId": "order-xxx",
  "signature": "signature-hash"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment verified successfully"
}
```

#### Create PhonePe Payment
```
POST /api/payments/phonepe/create
Content-Type: application/json

{
  "bookingId": "book-xxx",
  "paymentId": "pay-xxx",
  "userId": "cust-xxx",
  "amount": 45000
}

Response: 200 OK
{
  "redirectUrl": "https://...",
  "merchantTransactionId": "txn_..."
}
```

#### Check PhonePe Status
```
POST /api/payments/phonepe/status
Content-Type: application/json

{
  "merchantTransactionId": "txn_..."
}

Response: 200 OK
{
  "success": true,
  "status": "pending|success|failed"
}
```

#### Fake Payment (Testing)
```
POST /api/payments/fake/complete
Content-Type: application/json

{
  "bookingId": "book-xxx",
  "paymentId": "pay-xxx",
  "cardNumber": "4111111111111111",
  "cvv": "123",
  "name": "Test User"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment completed (fake)"
}
```

---

### 9. GENERAL

#### Health Check
```
GET /api/health

Response: 200 OK
{
  "ok": true,
  "message": "Backend server is running",
  "timestamp": "2024-01-10T10:30:00Z"
}
```

#### Company Info
```
GET /api/company

Response: 200 OK
{
  "name": "D'LIFE Interiors",
  "email": "contact@dlifeinteriors.com",
  "phone": "+91 8904712858",
  "whatsapp": "+918904712858"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "All fields required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

### 503 Service Unavailable
```json
{
  "message": "Database not ready"
}
```

---

## Sample Test Requests (cURL)

```bash
# Get all enquiries
curl -X GET http://localhost:5174/api/enquiries

# Get all projects
curl -X GET http://localhost:5174/api/projects

# Get all customers
curl -X GET http://localhost:5174/api/customers

# Get all bookings
curl -X GET http://localhost:5174/api/bookings

# Get all feedbacks
curl -X GET http://localhost:5174/api/feedbacks

# Get user details
curl -X GET http://localhost:5174/api/user-details/cust-xxx

# Submit contact enquiry
curl -X POST http://localhost:5174/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Interested in your services"
  }'

# Create new project
curl -X POST http://localhost:5174/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Home Design",
    "price": 75000,
    "category": "Living Room",
    "description": "Premium interior design service",
    "image_url": "https://..."
  }'

# Health check
curl -X GET http://localhost:5174/api/health
```

---

## Postman Collection Import

Copy the API endpoints into Postman for easy testing with the Environment variables:
- `{{base_url}}` - http://localhost:5174
- `{{customerId}}` - Your customer ID
- `{{bookingId}}` - Your booking ID

---

**Last Updated**: January 2024  
**API Version**: 1.0
