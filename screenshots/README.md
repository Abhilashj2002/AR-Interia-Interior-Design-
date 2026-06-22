# Screenshots Directory

This directory contains project screenshots for the README documentation.

## Current Screenshots

The root README uses these generated screenshots:

1. **01-home-hero.png** - The main landing page with hero section
2. **02-gallery.png** - Image gallery with category filters
3. **03-services.png** - Services page listing interior design services
4. **04-portfolio.png** - Portfolio showcase page with project examples
5. **05-admin-dashboard.png** - Admin dashboard with statistics and management tools
6. **06-category.png** - Services category/detail view
7. **07-chatbot.png** - AI chatbot interface
8. **08-customer-user.png** - Customer portal showing account activity
9. **09-invoice.png** - Invoice or customer billing area

## Screenshot Guidelines

- **Format**: PNG or JPG
- **Recommended Size**: 1200x800 pixels
- **Quality**: High resolution, clear text
- **Content**: Show relevant features and UI elements
- **Consistency**: Use similar styling and branding across all screenshots

## How to Capture Screenshots

### Using Browser Developer Tools
1. Open the application in browser
2. Press F12 to open developer tools
3. Use Ctrl+Shift+P (Cmd+Shift+P on Mac) to open command menu
4. Type "screenshot" and select "Capture full size screenshot"
5. Save to this directory with appropriate filename

### Using Built-in Tools
- **Windows**: Win+Shift+S for Snipping Tool
- **Mac**: Cmd+Shift+4 for screenshot selection
- **Linux**: Use gnome-screenshot or similar tool

### Automated Screenshots
Start the app first:

```bash
npm run start
```

Then run:

```bash
node scripts/capture-readme-screenshots.mjs
```

## Current Status

- [x] 01-home-hero.png
- [x] 02-gallery.png
- [x] 03-services.png
- [x] 04-portfolio.png
- [x] 05-admin-dashboard.png
- [x] 06-category.png
- [x] 07-chatbot.png
- [x] 08-customer-user.png
- [x] 09-invoice.png

## Notes

- Ensure no sensitive data (API keys, personal information) is visible in screenshots
- Use demo/test data for realistic but safe screenshots
- Maintain consistent browser zoom level (100% recommended)
- Consider using light mode for better visibility in documentation
