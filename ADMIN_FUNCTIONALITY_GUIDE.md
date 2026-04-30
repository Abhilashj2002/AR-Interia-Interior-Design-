# Admin Functionality Guide - AR Interia

## Overview

The admin panel now provides comprehensive design management capabilities with full CRUD (Create, Read, Update, Delete) operations. Logged-in administrators can manage designs, edit costs and names, upload images, and have all changes persist to the database and reflect on the home page in real-time.

## Features Implemented

### 1. **Backend CRUD Endpoints**

#### GET /api/designs
Retrieve all designs with optional category filtering
```
Request: GET /api/designs?categoryId=Kitchen
Response: { success: true, designs: [...] }
```

#### POST /api/designs
Create a new design
```
Request: POST /api/designs
Body: {
  title: "Modern Kitchen",
  description: "Beautiful modern kitchen design",
  categoryId: "Kitchen",
  price: 50000,
  previewImage: "data:image/...",
  modelUrl: ""
}
Response: { success: true, designId: "design-1234567890", message: "Design created" }
```

#### PUT /api/designs/:id
Update an existing design (cost, name, image, etc.)
```
Request: PUT /api/designs/design-1234567890
Body: {
  title: "Updated Kitchen",
  price: 55000,
  description: "New description",
  previewImage: "data:image/..."
}
Response: { success: true, message: "Design updated" }
```

#### DELETE /api/designs/:id
Delete a design (soft delete - sets status to 'inactive')
```
Request: DELETE /api/designs/design-1234567890
Response: { success: true, message: "Design deleted" }
```

### 2. **Admin Panel UI Components**

#### Design Card Display
Each design in the admin catalog shows:
- ✓ Thumbnail preview
- ✓ Design title
- ✓ Category name
- ✓ Formatted price (₹)
- ✓ Action buttons: Edit, Archive, Delete

#### Upload/Edit Modal
A comprehensive modal for creating and editing designs with:
- **Title Field**: Design name (required)
- **Description Field**: Detailed design description
- **Price Field**: Design cost in rupees
- **Category Selector**: Choose from 20+ room categories
- **Style Selector**: Modern, Classic, Contemporary, Traditional, Minimalist, Luxury
- **Image Upload**: Preview image file upload with live preview
- **3D Model Upload**: GLB file upload for 3D preview
- **Full Form Validation**: Required fields enforced
- **Error Handling**: User-friendly error messages
- **Loading State**: Visual feedback during submission

### 3. **Frontend Features**

#### Design Management
```typescript
// Edit an existing design
1. Click "Edit" button on a design card
2. Modal opens with pre-filled design data
3. Update any fields (title, cost, image, etc.)
4. Click "Update Design" to save
5. Changes persist to database
6. Homepage updates automatically
```

#### Create New Design
```typescript
// Create a new design
1. Click "Upload Design" button in admin 3D Catalog
2. Modal opens with empty form
3. Fill in all required fields (title, category)
4. Upload image and 3D model
5. Click "Create Design" to save
6. Design appears in catalog and home page
```

#### Delete Design
```typescript
// Delete a design
1. Click "Delete" button on design card
2. Confirmation dialog appears
3. Confirm deletion
4. Design is marked as inactive
5. Removed from catalog and home page
```

### 4. **Database Integration**

All admin changes are synchronized with the SQLite database:
- Design titles are updated
- Prices are persisted
- Images are stored as base64 in database
- Status is tracked (active/inactive)
- Timestamps are maintained

### 5. **Real-time UI Updates**

After any operation:
- Admin panel refreshes immediately
- Homepage catalog updates
- Customer dashboard sees new/updated designs
- All API calls use bearer token authentication

## How to Use

### Login as Admin
1. Navigate to http://localhost:3000/admin
2. Log in with admin credentials
3. Role shows as "admin" after login

### Accessing the Admin Dashboard
```
http://localhost:3000
↓
Log in with admin role
↓
Dashboard appears with bookings and catalog sections
↓
Scroll to "3D Catalog" section
```

### Managing Designs

#### View All Designs
- Admin dashboard "3D Catalog" section shows all active designs
- Each design displays: image, title, category, price

#### Create a New Design
1. Click "Upload Design" button (top-right of 3D Catalog)
2. Fill form:
   - **Title**: e.g., "Modern Kitchen Redesign"
   - **Description**: Optional details
   - **Category**: Select from dropdown
   - **Price**: Enter cost in rupees
   - **Image**: Upload JPG/PNG/WebP (preview shows immediately)
   - **3D Model**: Upload .glb file
3. Click "Create Design"
4. Success: Design appears in catalog

#### Edit a Design
1. Find design in "3D Catalog" section
2. Click "Edit" button on the card
3. Modal opens with current data
4. Update fields:
   - Change name, cost, description
   - Upload new image
   - Upload new 3D model (optional for edits)
5. Click "Update Design"
6. Changes save to database and appear immediately

#### Delete a Design
1. Find design in "3D Catalog" section
2. Click "Delete" button
3. Confirm in popup
4. Design status changed to inactive
5. Automatically hidden from catalog

### Image Upload

#### Preview Images
- Upload JPG, PNG, or WebP
- Maximum 5MB recommended
- Shows live preview in modal as you upload
- Base64 encoded for database storage

#### 3D Models
- Upload .glb files
- Recommended under 10MB
- Used in 3D preview for customers
- Required for new designs

## Technical Details

### API Authentication
All design operations require admin authentication:
```javascript
Authorization: Bearer {token}
```

### Category List (20 Types)
```
Living room, Kitchen, Bedroom, Bathroom, Home theatre,
Master Bedroom, Kids-bedroom, Diningroom, Garden, Gym,
Office interior, Pooja room, Spa, Terrace, Balcony,
Guest room, Meeting room, Classroom, Swimming pool, Wardrobe
```

### Style Options (6 Types)
```
Modern, Classic, Contemporary, Traditional, Minimalist, Luxury
```

### Database Fields Updated
```
- id: Design identifier
- title: Design name
- description: Design details
- price: Cost in rupees
- categoryId: Room category
- previewImage: Base64 image data
- status: active/inactive
- createdAt: Creation timestamp
- updatedAt: Last modification time
```

## Error Handling

The system provides clear error messages for:
- ❌ Missing required fields: "Title and category required"
- ❌ Invalid file formats: "Please upload JPG/PNG/WebP for images"
- ❌ Network failures: Displays error message in modal
- ❌ Database errors: API returns error with description

## Performance Features

- **Eager Loading**: Categories preload on app startup
- **Image Fallbacks**: Broken images show placeholder
- **Lazy Loading**: Large image lists load efficiently
- **Real-time Sync**: Changes broadcast immediately
- **Error Recovery**: Failed requests show retry option

## Frontend Changes Made

### File: `main.ts`

#### Updated Functions
1. **handleCatalogUpload()** - Lines 3246-3330
   - Connected to backend POST/PUT endpoints
   - Sends form data as JSON
   - Handles create and edit modes
   - Performs API calls with authentication

2. **handleDeleteCatalogModel()** - Lines 3339-3360
   - Connected to DELETE endpoint
   - Sends deletion request to backend
   - Updates UI after successful delete

3. **renderUploadModal()** - Lines 2717-2817
   - Enhanced UI with better styling
   - Added image preview display
   - Improved form layout and labels
   - Better error message display
   - Upload status indicators

### Modified Type Definitions
- Upload state persists design data during edit
- Category validation uses dynamic list

## Backend Changes Made

### File: `server/index.js`

#### New Endpoints (Lines 438-593)
1. **POST /api/designs** - Create new design
2. **PUT /api/designs/:id** - Update existing design
3. **DELETE /api/designs/:id** - Delete design

#### Database Schema
All endpoints use `designs` table with columns:
- id, title, description, categoryId, price
- previewImage, modelUrl, status, createdAt, updatedAt
- availabilityStatus

## Testing the Admin Functions

### Test Create Design
```bash
curl -X POST http://localhost:5174/api/designs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Bedroom",
    "categoryId": "Master Bedroom",
    "price": 100000,
    "description": "Premium bedroom design"
  }'
```

### Test Update Design
```bash
curl -X PUT http://localhost:5174/api/designs/design-123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Bedroom",
    "price": 120000
  }'
```

### Test Delete Design
```bash
curl -X DELETE http://localhost:5174/api/designs/design-123
```

## Future Enhancements

Potential additions (not yet implemented):
- [ ] Bulk design operations
- [ ] Image library/gallery management
- [ ] Design templates/copies
- [ ] Version history/rollback
- [ ] Design approval workflow
- [ ] Sales analytics per design
- [ ] Design categories custom creation
- [ ] Multi-image upload per design

## Troubleshooting

### Issue: "Cannot POST /api/designs"
**Solution**: Ensure backend is running on port 5174
```bash
cd server
node index.js
```

### Issue: Design not appearing on homepage
**Solution**: Reload the page - frontend caches may need refresh
- Ctrl+F5 for hard refresh
- Check browser console for API errors

### Issue: Image not showing in preview
**Solution**: Ensure file is valid image format (JPG/PNG/WebP)
- Check file size (max 5MB recommended)
- Verify CORS is enabled on backend

### Issue: "Unauthorized" error
**Solution**: User must be logged in as admin
- Login again
- Check if token is valid
- Clear browser cache and re-login

## Support

For issues with admin functionality:
1. Check browser console (F12) for error messages
2. Review API response in Network tab
3. Verify backend is running: `http://localhost:5174/api/health`
4. Check server logs for detailed errors

---

**Version**: 1.0  
**Last Updated**: February 14, 2026  
**Status**: ✅ Fully Implemented & Tested
