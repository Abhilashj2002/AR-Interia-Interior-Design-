# Design Studio - Smart Engine Advanced Integration Guide

## 🎨 Overview

Your Design Studio now uses **Google smart engine** to generate intelligent, detailed design variations based on uploaded room photos. This replaces the previous client-side canvas filtering with professional algorithm-powered analysis.

## ✅ What's Implemented

### Backend Components

1. **SQLite Database** (`server/database.js`)
   - `users` table: For Design Studio authentication
   - `projects` table: Stores uploaded images, generated prompts, and design variations
   - Auto-initializes on server startup

2. **Authentication Middleware** (`server/middleware/auth.js`)
   - JWT token verification
   - Required for all Smart generation requests
   - Uses existing customer login tokens

3. **Smart Generation Route** (`server/routes/smartGenerate.js`)
   - **POST /api/smart/generate** - Upload image and generate design variations
   - **GET /api/smart/generate/projects** - Retrieve user's past smart projects
   - Uses Smart Engine 1.5 Flash model for prompt generation
   - Parses Smart Engine response into 6-8 distinct design variations

### Frontend Integration

- `main.ts` updated to call new API endpoint
- Automatically uses authenticated user's token
- Falls back to client-side generation if API fails
- Maintains existing UI and user experience

## 🔧 Configuration

### Environment Variables (`.env.local`)

```env
PRO_ENGINE_KEY=REDACTED_API_KEY
JWT_SECRET=dev-secret-change-me
PAYMENT_SERVER_PORT=5175
```

### API Endpoint

```
POST http://localhost:5175/api/smart/generate
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body (FormData):**
- `image`: File (JPEG, PNG, WebP, AVIF) - Max 10MB
- `category`: String (e.g., "Kitchen", "Bedroom", "Living Room")
- `style`: String (e.g., "Modern", "Rustic", "Luxury")
- `customPrompt`: String (optional) - Additional design requirements

**Response:**
```json
{
  "success": true,
  "designs": [
    {
      "title": "Modern Modular Design",
      "styleTag": "Modern",
      "description": "Sleek white glossy lacquer cabinets with engineered quartz countertop..."
    }
  ],
  "originalImage": "data:image/jpeg;base64,..."
}
```

## 📝 How It Works

1. **User uploads room photo** in Design Studio interface
2. **Frontend converts image to blob** and creates FormData
3. **API receives image**, saves temporarily with multer
4. **Image sent to smart engine** with design analysis prompt
5. **Smart Engine generates 6-8 design variations** with:
   - Unique style names (Modern, Rustic, Luxury, Coastal, etc.)
   - Detailed material specifications (cabinets, countertops, backsplash)
   - Color palettes and lighting recommendations
   - Key differentiating design features
6. **Backend parses response** into structured JSON
7. **Saves to SQLite database** with user association
8. **Returns designs to frontend** for display
9. **3D previews render** using existing Three.js system

## 🎯 Smart Engine Prompt Template

The Smart Engine receives this prompt structure:

```
You are an expert interior designer. Analyze this [ROOM_TYPE] image and generate 6-8 distinct ultra-realistic 3D design variation prompts.

Style Preference: [USER_STYLE]
Additional Requirements: [CUSTOM_PROMPT]

For each design variation, provide:
1. A unique design style (Modern, Rustic, Luxury, Coastal, Industrial, Tropical, Contemporary, Mediterranean)
2. Detailed material specifications (cabinets, countertops, backsplash, flooring)
3. Color palette and lighting recommendations
4. Key design features that differentiate it from other variations

Format each design as:
TITLE: [Design Name]
STYLE: [Style Tag]
DESCRIPTION: [Detailed description with materials, colors, and features]
```

## 🔄 Fallback Mechanism

If Smart Engine API fails (network issue, API key invalid, rate limit):
- Frontend automatically falls back to `generateImageVariantsClientSide()`
- Uses canvas filters and overlays (previous implementation)
- User experience remains uninterrupted
- Console logs show fallback activation

## 🗄️ Database Schema

### `users` table
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT NOT NULL
email TEXT UNIQUE NOT NULL
password TEXT NOT NULL (bcrypt hashed)
role TEXT DEFAULT 'user'
createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
```

### `projects` table
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
userId INTEGER NOT NULL
category TEXT (room type)
style TEXT (design preference)
prompts TEXT (JSON array of generated descriptions)
images TEXT (JSON array - future use for generated images)
originalImage TEXT (base64 data URL)
createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
```

## 🚀 Usage Example

```javascript
const formData = new FormData();
formData.append('image', blob, 'kitchen.jpg');
formData.append('category', 'Kitchen');
formData.append('style', 'Modern');
formData.append('customPrompt', 'I want natural wood accents');

const response = await fetch('http://localhost:5175/api/smart/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: formData
});

const result = await response.json();
console.log(result.designs); // Array of 6-8 design variations
```

## 📦 Dependencies Installed

```bash
npm install sqlite3 sqlite multer smart-engine jsonwebtoken
```

- **sqlite3** - SQLite database driver
- **sqlite** - Async wrapper for sqlite3
- **multer** - File upload middleware
- **smart-engine** - smart engine SDK
- **jsonwebtoken** - JWT authentication (already installed)

## 🔐 Security Features

- JWT authentication required for all smart requests
- File size limit: 10MB per upload
- Allowed file types: JPEG, JPG, PNG, WebP, AVIF
- Uploaded files deleted after processing
- SQL injection protection via parameterized queries
- Password hashing with bcrypt (in auth routes)

## 📊 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/smart/generate` | Generate design variations | Required |
| GET | `/api/smart/generate/projects` | Get user's smart projects | Required |
| POST | `/api/auth/login` | Existing customer login | No |
| POST | `/api/auth/register` | Existing registration | No |

## 🐛 Troubleshooting

### "Authentication required" error
- User must be logged in
- Check `localStorage.getItem('token')` exists
- Verify token hasn't expired (7-day expiry)

### Smart Engine API errors
- Verify PRO_ENGINE_KEY in `.env.local`
- Check API quota at [Google Design Studio](https://makersuite.google.com/)
- Review rate limits (60 requests/minute for free tier)

### "Failed to generate design variations"
- Check server logs for Smart Engine response
- Verify image format is supported
- Ensure image isn't corrupted

### Database errors
- Database file: `server/database.sqlite`
- Delete file to reset (will lose projects)
- Check file permissions

## 🔮 Future Enhancements

- [ ] Stability Advanced Integration for actual image generation
- [ ] Save generated images to `projects.images` column
- [ ] Side-by-side comparison view
- [ ] Favorite/bookmark designs
- [ ] Share designs with quote requests
- [ ] Export design variations as PDF
- [ ] Admin dashboard to view all smart projects

## 📝 Testing

1. Start backend: `npm run dev:server`
2. Start frontend: `npm run dev`
3. Log in as existing customer
4. Navigate to Design Studio tab
5. Upload a room photo (kitchen/bedroom/etc.)
6. Click "Generate Design Variations"
7. Wait 5-10 seconds for Smart Engine analysis
8. View 6-8 professional design variations with 3D previews

## ✨ Key Benefits

✅ **Professional Expert analysis** - Real interior design expertise from Smart Engine
✅ **Detailed Specifications** - Actual materials, colors, brands
✅ **Unique Variations** - 6-8 distinctly different design approaches
✅ **Database Persistence** - Save and retrieve past projects
✅ **Seamless Integration** - Works with existing auth and UI
✅ **Graceful Fallback** - Client-side generation if API unavailable
✅ **Production Ready** - JWT auth, error handling, validation

---

**Server Status:** ✅ Running on port 5175
**Smart Engine Model:** pro-design-model-v1
**Database:** SQLite (auto-initialized)
**Frontend:** Integrated with fallback support
