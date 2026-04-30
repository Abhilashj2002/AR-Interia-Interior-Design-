# Category Loader - Documentation

## Overview

The Category Loader allows you to easily upload and manage categories for the AR Interia application. You can add categories in three ways:

1. **JSON File Upload** - Upload a `.json` file with category data
2. **CSV File Upload** - Upload a `.csv` file with category data  
3. **Manual Paste** - Paste JSON or CSV data directly in the interface

---

## Getting Started

### Step 1: Open the Category Loader

Open the file `category-loader.html` in your browser:
```
http://localhost:3000/category-loader.html  (if served through app)
```

Or open directly:
```
file:///C:/Users/abhil/Downloads/ar-interia---ai-powered-ar-interior-design/category-loader.html
```

### Step 2: Download Sample Files

Click "📥 Download Sample JSON" or "📥 Download Sample CSV" to get template files.

### Step 3: Edit the Sample Files

Add your categories to the sample file:

#### JSON Format
```json
[
  {
    "id": "cat-living-room",
    "title": "Living Room",
    "description": "Modern living room designs",
    "icon": "🛋️",
    "color": "#3B82F6",
    "image": "https://example.com/image.jpg",
    "status": "active"
  }
]
```

#### CSV Format
```
Title,Description,Icon,Color,Image,Status
Living Room,Modern designs,🛋️,#3B82F6,https://example.com/image.jpg,active
Bedroom,Luxury designs,🛏️,#EC4899,https://example.com/image2.jpg,active
```

### Step 4: Upload Your File

- Drag and drop the file onto the upload area, OR
- Click the upload area and select the file, OR
- Paste the data directly in the "Paste Data" tab

### Step 5: Review Preview

See all your categories in the preview section. The preview shows:
- Category count
- Active categories count
- Categories with images
- Full category list

### Step 6: Submit to Backend

Click "✅ Submit to Backend" to save the categories to the database.

Alternatively, click "💾 Copy JSON to Clipboard" to copy the data for manual integration.

---

## Category Fields

| Field       | Type      | Required | Description                           |
|-----------|-----------|----------|---------------------------------------|
| id        | string    | Auto     | Unique identifier (auto-generated)    |
| title     | string    | Yes      | Category name (e.g., "Living Room")   |
| description | string   | Yes      | Category description                  |
| icon      | string    | No       | Emoji icon (e.g., "🛋️")             |
| color     | string    | No       | Hex color code (e.g., "#3B82F6")      |
| image     | string    | No       | Image URL for category thumbnail      |
| status    | string    | No       | "active" or "inactive" (default: active) |

---

## Examples

### Example 1: Basic Category
```json
{
  "title": "Living Room",
  "description": "Modern living room designs",
  "status": "active"
}
```

### Example 2: Full Category
```json
{
  "id": "cat-living-room-001",
  "title": "Living Room",
  "description": "Modern and stylish living room designs",
  "icon": "🛋️",
  "color": "#3B82F6",
  "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  "status": "active"
}
```

### Example 3: Multiple Categories (CSV)
```csv
Title,Description,Icon,Color,Image,Status
Living Room,Modern designs,🛋️,#3B82F6,https://image1.jpg,active
Bedroom,Luxury designs,🛏️,#EC4899,https://image2.jpg,active
Kitchen,Modern kitchen,👨‍🍳,#F59E0B,https://image3.jpg,active
```

---

## Backend API Integration

### Endpoint
```
POST http://localhost:5174/api/categories
```

### Request Body
```json
{
  "categories": [
    {
      "title": "Living Room",
      "description": "Modern designs",
      "icon": "🛋️",
      "color": "#3B82F6",
      "image": "https://image.jpg",
      "status": "active"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Categories added successfully",
  "count": 1,
  "categories": [...]
}
```

---

## Feature Highlights

✅ **Drag & Drop Upload** - Simply drag files onto the upload area  
✅ **Multiple Formats** - Support for JSON and CSV files  
✅ **Live Preview** - See how categories will look before submitting  
✅ **Validation** - Automatic validation of category data  
✅ **Sample Templates** - Download ready-to-use sample files  
✅ **Copy to Clipboard** - Easy copy for manual integration  
✅ **Direct Backend Integration** - One-click submission to API  

---

## Troubleshooting

### File Upload Not Working
- Check file size (max 5MB)
- Ensure file is valid JSON or CSV
- Check browser console for errors

### Validation Errors
- Ensure 'title' and 'description' are not empty
- Check for proper JSON/CSV formatting
- Verify all required fields are present

### Submit Not Working
- Ensure backend server is running on `http://localhost:5174`
- Check network tab for API errors
- Verify categories data is valid

---

## Tips

1. **Use Emoji Icons** - Uses emoji for quick visual identification
2. **Hex Color Codes** - Use hex colors for category theming
3. **Image URLs** - Use absolute URLs (http/https) for images
4. **Descriptive Names** - Use clear, descriptive category names
5. **Active Status** - Set status to 'inactive' to hide categories temporarily

---

## File Structure

```
project/
├── category-loader.html          # Main UI for uploading categories
├── sample-categories.json        # JSON sample data
├── sample-categories.csv         # CSV sample data
└── services/
    └── categoryLoader.ts         # TypeScript service for parsing categories
```

---

## Contact & Support

For issues or questions, check:
- Browser console for error messages
- Network tab for API response errors
- Sample files in the project directory
