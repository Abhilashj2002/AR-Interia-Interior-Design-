# ⚡ Admin Quick Start Guide

## Access the Admin Panel

```
1. Go to: http://localhost:3000
2. Click "Login" or navigate to login page
3. Enter admin credentials
4. Redirected to: http://localhost:3000/admin
5. Dashboard loads with bookings and catalog
```

## The 3D Catalog Section

Located at the bottom of the admin dashboard, showing:
- All active designs with thumbnails
- Design title, category, and price
- Action buttons: Edit, Archive, Delete

## Creating a New Design

**Button:** "Upload Design" (top-right of 3D Catalog)

**Fill the Form:**
- **Title** * (required) → e.g., "Modern Living Room"
- **Description** → Optional details about the design
- **Category** * (required) → Choose from 20 types (Kitchen, Bedroom, etc.)
- **Style** → Modern, Classic, Contemporary, etc.
- **Price** → Cost in rupees (₹)
- **Image** → Upload JPG/PNG/WebP (shows preview)
- **3D Model** → Upload .glb file (required for new designs)

**Submit:** Click "Create Design"

**Result:** Design added to database and appears on homepage

---

## Editing a Design

**Find the Design:**
- Locate in "3D Catalog" section
- Look for the design card with thumbnail

**Click "Edit":**
- Modal opens with current data
- All fields show existing values
- Image shows preview thumbnail

**Update Fields:**
- Change title, cost, description
- Upload new image
- Change category/style
- Can skip model upload (keeps existing)

**Submit:** Click "Update Design"

**Result:** Changes saved to database, homepage updated immediately

---

## Deleting a Design

**Find the Design:**
- Locate in "3D Catalog" section

**Click "Delete":**
- Confirmation dialog appears
- Message: "Are you sure you want to delete this design?"

**Confirm:**
- Click "Delete" in confirmation
- Design marked as inactive
- Removed from catalog and homepage

**Note:** Can be restored from archived section if needed

---

## Common Operations

### Update Price Only
1. Find design → Click "Edit"
2. Change only the "Price" field
3. Click "Update Design"
4. Price updates everywhere instantly

### Change Design Name
1. Find design → Click "Edit"
2. Change only the "Title" field
3. Click "Update Design"
4. Name updates on homepage

### Replace Design Image
1. Find design → Click "Edit"
2. Click file input → Select new image
3. Preview shows instantly
4. Click "Update Design"

### Add Design with New Image
1. Click "Upload Design"
2. Enter title and price
3. Select category
4. Upload image (preview shows)
5. Upload 3D model (.glb)
6. Click "Create Design"

---

## What Happens Behind the Scenes (Technical)

### When You Click "Create Design"

```
Browser (Port 3000)
    ↓
handleCatalogUpload() function
    ↓
Converts image to Base64
    ↓
POST /api/designs {json payload}
    ↓
Express Server (Port 5174)
    ↓
Validates data
    ↓
Inserts to SQLite designs table
    ↓
Returns: {success: true, designId: "design-xxxx"}
    ↓
Frontend refreshes catalog
    ↓
Homepage updates automatically
```

### When You Click "Update Design"

```
Browser (Port 3000)
    ↓
handleCatalogUpload() function
    ↓
PUT /api/designs/{id} {json payload}
    ↓
Express Server (Port 5174)
    ↓
Updates designs table
    ↓
Returns: {success: true, message: "Design updated"}
    ↓
Frontend refreshes catalog
    ↓
Customer sees new data immediately
```

### When You Click "Delete"

```
Browser (Port 3000)
    ↓
Confirmation dialog
    ↓
handleDeleteCatalogModel() function
    ↓
DELETE /api/designs/{id}
    ↓
Express Server (Port 5174)
    ↓
Sets status = 'inactive'
    ↓
Returns: {success: true, message: "Design deleted"}
    ↓
Design hidden from catalog
    ↓
Removed from homepage
```

---

## Error Messages & Solutions

| Message | Meaning | Fix |
|---------|---------|-----|
| "Please enter a design title" | Title field empty | Fill in the title |
| "Please select a category" | Category not chosen | Select from dropdown |
| "Please upload both files" | Missing image or model | Upload both files |
| "Design not found" | Trying to edit non-existent | Refresh page, try again |
| "Network error" | Backend not responding | Check server is running |
| "Unauthorized" | Not logged in as admin | Logout and re-login |

---

## Image Requirements

**Supported Formats:**
- JPG / JPEG
- PNG
- WebP

**Recommended Size:**
- Width: 400px minimum
- Height: 300px minimum
- File size: Under 5MB

**What Happens:**
1. You select image file
2. Image displays in preview box instantly
3. When saved, converts to Base64
4. Stored in database as text
5. Shows on homepage with fallback if error

---

## 3D Model Requirements

**File Format:** .glb (GLTF Binary)

**File Size:** Under 10MB recommended

**How to Use:**
1. Select .glb file
2. System stores the model reference
3. Customers can view in 3D preview
4. Works with model-viewer web component

---

## Key Features at a Glance

✅ **Create** - New designs with complete data
✅ **Read** - View all designs in catalog
✅ **Update** - Edit any design details, images, costs
✅ **Delete** - Remove designs with confirmation
✅ **Persist** - All changes saved to database
✅ **Instant Updates** - Homepage reflects changes immediately
✅ **Real-time Preview** - See image before saving
✅ **Error Handling** - Clear feedback for problems
✅ **Authentication** - Admin-only access
✅ **Soft Delete** - Can restore from archive

---

## Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Open Admin Dashboard | Direct URL: /admin |
| Close Modal | Escape or Click "Cancel" |
| Back to Dashboard | Click logo or back
| Hard Refresh | Ctrl+F5 (Cmd+Shift+R on Mac) |

---

## Frequently Asked Questions

**Q: How do I change a design's cost?**
A: Click Edit → Change Price field → Click Update Design

**Q: Can I have the same design in multiple categories?**
A: Create a new design with same image but different category

**Q: What if I delete a design by mistake?**
A: Scroll down to Archives section → Click Restore

**Q: Can customers see my changes immediately?**
A: Yes! Homepage updates instantly after each change

**Q: Can I batch upload 10 designs at once?**
A: Not yet - each design needs individual upload (future feature)

**Q: Where is the image actually stored?**
A: In the SQLite database as Base64 text (or can be on file system)

**Q: Do I need to refresh the page after editing?**
A: No - UI updates automatically

**Q: Can I delete the database?**
A: Yes, but all designs will be lost. Backup first!

---

## Database File Location

Windows: `c:\Users\{username}\Downloads\ar-interia---ai-powered-ar-interior-design\server\ar_interia.db`

## Restart Instructions

**If Something Gets Stuck:**

1. **Restart Backend:**
   ```bash
   # Kill all node processes
   Stop-Process -Name node -Force
   
   # Restart backend
   cd server
   node index.js
   ```

2. **Restart Frontend:**
   ```bash
   # Go to project root
   npm run dev
   ```

3. **Hard Refresh Browser:**
   ```
   Ctrl + F5 (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

---

## Server Status Check

**Is Backend Running?**
```
Open: http://localhost:5174/api/health

Should see:
{
  "ok": true,
  "message": "Backend server is running",
  "timestamp": "2026-02-14T10:54:04Z"
}
```

**Is Frontend Running?**
```
Open: http://localhost:3000

Should see: AR Interia homepage loading
```

---

## Performance Tips

💡 **For Better Performance:**
- Keep image files under 5MB
- Use JPG for photos (smaller than PNG)
- Close other browser tabs
- Don't edit during peak hours
- Wait 2-3 seconds between edits
- Hard refresh if things feel slow

---

## Support Checklist

If something doesn't work:

- [ ] Both servers running? (3000 & 5174)
- [ ] Logged in as admin?
- [ ] Network tab shows green responses?
- [ ] Browser console shows no errors? (F12)
- [ ] Tried hard refresh? (Ctrl+F5)
- [ ] Database file exists? (server/ar_interia.db)
- [ ] Image file format correct? (JPG/PNG/WebP)
- [ ] File sizes reasonable? (<5MB)

---

## Documentation Files

For more details, refer to:

1. **ADMIN_FUNCTIONALITY_GUIDE.md**
   - Complete feature documentation
   - Technical implementation details
   - API endpoints reference

2. **ADMIN_IMPLEMENTATION_SUMMARY.md**
   - Architecture overview
   - Code changes breakdown
   - Database schema

3. **API_QUICK_REFERENCE.md**
   - All API endpoints
   - Request/response format
   - Example curl commands

4. **README.md**
   - Project setup
   - Installation steps
   - General information

---

## Quick Command Reference

**Start Backend:**
```bash
cd c:\Users\abhil\Downloads\ar-interia---ai-powered-ar-interior-design
node server/index.js
```

**Start Frontend:**
```bash
npm run dev
```

**Kill Node Processes:**
```bash
Stop-Process -Name node -Force
```

**Test API:**
```bash
curl http://localhost:5174/api/health
curl http://localhost:5174/api/designs
```

---

## Version & Status

**Status:** ✅ LIVE & OPERATIONAL  
**Version:** 1.0  
**Last Updated:** February 14, 2026  
**Frontend:** http://localhost:3000  
**Backend:** http://localhost:5174  
**Admin Panel:** http://localhost:3000/admin  

---

**You're all set! 🚀 Start managing your designs!**
