# 📊 Portfolio Manager - Complete Guide

## Overview
The Portfolio Manager is an admin control panel that allows complete management of your portfolio content with **real-time automatic updates** when customers make purchases.

## Features

### 1. ✅ Founder & Co-Founder Profiles
Manage the leadership team profiles displayed in the portfolio:
- **Name**: Full name or professional name
- **Role**: Job title or position
- **Famous Design**: Signature/famous design they're known for
- **Bio**: Brief description or achievements
- **Photo**: Upload professional photos (local image upload supported)

### 2. 🎨 Design Team Management
Add and manage design team members:
- Add new designers with `+ Add Designer` button
- Edit each designer's profile (name, role, famous design, bio)
- Upload designer photos locally
- Remove designers with the Remove button
- Changes appear immediately in the Portfolio page

### 3. 📹 Feedback Videos
Manage client testimonial videos:
- Add multiple feedback videos
- Edit video titles and URLs
- Preview videos inline
- Upload video files locally
- Toggle visibility on Homepage and Portfolio
- Automatically load existing feedback videos with `Load Existing Videos`

### 4. 🚀 Company Journey / Milestones
Create a company timeline showing your growth:
- Set journey section title
- Add intro text
- Add multiple milestones with:
  - **Year**: Timeline reference
  - **Title**: Milestone name
  - **Description**: What happened and why it matters
- Remove outdated milestones
- Displayed with cyan timeline on portfolio

### 5. 📈 Design Sales & Customers Performance Graph

#### Live Category Analytics Dashboard
Shows real-time sales performance by category:
- **Total Sales**: Sum of all paid design bookings
- **Total Customers**: Unique customers who made purchases
- **Per-Category Breakdown**: Sales count and unique buyers per category

#### Two Ways to Populate Metrics:

**Option A: Auto-Sync (Recommended for Real Data)**
- Click `🔄 Auto-Sync` button
- Automatically calculates metrics from real paid bookings
- Groups data by category (Living Room, Kitchen, Bedroom, etc.)
- Shows actual customer counts per category
- One-click update whenever new purchases are made
- **Best for**: Live, accurate portfolio performance display

**Option B: Manual Entry**
- Click `+ Add Data Point` to add custom data entries
- Enter custom labels (e.g., "Q1 2026", "March 2026")
- Manually set sales count and customer count
- Useful for projections or custom reporting
- **Best for**: Highlighting specific periods or planned metrics

### 6. 🔄 Auto-Sync Feature (Portfolio Auto-Update)

**What it does:**
- Reads all paid bookings from the system
- Groups by category automatically
- Calculates accurate sales/customer counts
- Updates portfolio metrics instantly

**When to use:**
- After new customer purchases
- To refresh portfolio performance display
- Before sharing portfolio with prospects

**Automatic triggers:**
- Admin can click manually whenever needed
- System recalculates from real booking data
- Portfolio section updates in real-time

## How It Works

### Real-Time Update Flow
```
Customer Makes Purchase → Booking Created (paymentStatus: 'paid')
                             ↓
                    Admin Clicks Auto-Sync
                             ↓
                  System Calculates Live Metrics
                             ↓
                  Portfolio Metrics Updated
                             ↓
                   Portfolio Page Reflects Changes
```

### Data Binding System
- All fields use `data-bind` attributes
- Changes are tracked in real-time
- Validated before saving
- Persist to database on "Save Portfolio Content"

## Quick Start Guide

### Step 1: Set Up Leadership Profiles
1. Go to Admin Dashboard
2. Scroll to "Portfolio Content Manager"
3. Fill in Founder Profile (name, role, famous design, bio)
4. Upload founder photo
5. Repeat for Co-Founder
6. Click "Save Portfolio Content"

### Step 2: Add Design Team
1. Click `+ Add Designer`
2. Fill in designer details
3. Upload designer photo
4. Repeat for each team member
5. Click "Save Portfolio Content"

### Step 3: Set Up Company Journey
1. Enter journey title (e.g., "Our 15-Year Journey")
2. Write intro text
3. Click `+ Add Milestone` for each milestone
4. Fill in year, title, description
5. Arrange in chronological order
6. Click "Save Portfolio Content"

### Step 4: Add Testimonial Videos
1. Click `+ Add Video`
2. Enter video title
3. Paste YouTube/Vimeo URL or upload file
4. Toggle "Show on Portfolio" checkbox
5. Save Portfolio Content

### Step 5: Configure Sales Performance Graph
1. Go to "Design Sales & Customers Graph" section
2. **Option A - Auto-Sync (Recommended):**
   - Make sure customers have made purchases
   - Click `🔄 Auto-Sync`
   - Confirm metrics updated
3. **Option B - Manual:**
   - Click `+ Add Data Point`
   - Enter period label (e.g., "Jan-Mar 2026")
   - Enter sales count and customer count
4. Click "Save Portfolio Content"

## Real-World Scenarios

### Scenario 1: New Customer Makes First Purchase
```
Timeline:
- Customer books Master Bedroom design
- Payment processed successfully
- Admin goes to Portfolio Manager
- Clicks 🔄 Auto-Sync
- Portfolio immediately shows: "+1 sale in Master Bedroom category"
- Portfolio shows customer count updated
```

### Scenario 2: Monthly Report Update
```
Timeline:
- Throughout month, multiple customers make purchases
- Admin prepares monthly report
- Goes to Portfolio Manager → Design Sales Graph
- Clicks Auto-Sync
- Dashboard shows: "Month: 12 sales, 8 unique customers"
- Can see breakdown by category (Living: 4, Kitchen: 3, Bedroom: 5)
```

### Scenario 3: Portfolio Planning
```
Timeline:
- Planning next quarter targets
- Manually add projection data points
- Months with custom labels: "Q2 Projected"
- Set target sales count
- Portfolio shows both actual (Auto-Sync) and projected data
- Update as new bookings come in
```

## Admin Dashboard Location

**Path**: `/admin` → Portfolio Content Manager (in the masonry layout)

**Access**: Admin role users only

**Layout**:
- Top: Real-time category analytics
- Left column: Founder & Co-Founder profiles
- Right column: Designers, Feedback Videos
- Bottom left: Company Journey & Milestones
- Bottom right: Design Sales & Customers Graph
- Footer: Save Portfolio Content button

## Key Metrics Explained

| Metric | Meaning | Source |
|--------|---------|--------|
| **Total Sales** | Number of completed design bookings with "paid" status | Real bookings data |
| **Total Customers** | Unique customer IDs in paid bookings | Automatic deduplication |
| **Per-Category Sales** | Count of paid bookings per design category | Booking grouping |
| **Customer Per Category** | Unique buyers in each category | Set deduplication |

## Troubleshooting

### Auto-Sync Returns No Data
**Problem**: "No paid bookings yet" message
**Solution**: 
- Ensure customers have completed purchases
- Check that booking status is "confirmed" and paymentStatus is "paid"
- Wait for payment to be processed

### Portfolio Not Updating After Save
**Problem**: Changes not visible in portfolio
**Solution**:
- Refresh browser (Ctrl+R or Cmd+R)
- Verify "Save Portfolio Content" button was clicked
- Check browser console for errors
- Ensure logged in as admin

### Photo Upload Not Working
**Problem**: Designer photo not uploading
**Solution**:
- Check file size (keep under 5MB)
- Use common formats (JPG, PNG, WEBP)
- For local uploads, browser converts to data URLs
- Verify photo URL field is populated after upload

## Best Practices

### ✅ DO:
- Use Auto-Sync regularly to keep metrics accurate
- Upload high-quality team photos
- Update company journey annually
- Add testimonial videos as they come in
- Save frequently when making changes
- Keep designer bios concise (2-3 sentences)

### ❌ DON'T:
- Leave old milestones uncleaned (remove completed ones)
- Use unverified customer metrics (always use Auto-Sync for accuracy)
- Upload extremely large image files
- Leave placeholder text in profiles
- Forget to save changes before navigating away

## Data Persistence

- **Browser Storage**: Portfolio content auto-saves to localStorage
- **Server Sync**: "Save Portfolio Content" button syncs to backend database
- **Automatic Backup**: Portfolio history maintained server-side
- **Real-time Updates**: Changes visible immediately in portfolio section

## Performance Notes

- **Auto-Sync Speed**: Typically under 1 second for up to 1000 bookings
- **Portfolio Load**: Includes all media (photos, videos) - cached for performance
- **Mobile**: Portfolio manager works on tablets, but desktop recommended for photo editing

## Next Steps

1. **Go Live**: Review portfolio on public-facing portfolio page
2. **Monitor**: Check sales metrics weekly
3. **Iterate**: Update journey/testimonials quarterly
4. **Optimize**: A/B test different team descriptions

---

**Need Help?** Contact support or check the comprehensive admin guide for more details.
