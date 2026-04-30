# Module: Homepage

## 🎨 TIER: FRONTEND
Landing page user interface rendering

## Status
- **Current**: Legacy rendering (main.ts l.6128-6700+)
- **Wrapper**: Created ✅
- **Migration**: Scheduled for Phase-3a
- **Build Status**: ✅ Passes npm run build

## Structure
```
frontend/src/features/homepage/
├── render.ts          # ===== FRONTEND: Homepage Rendering =====
├── index.ts           # Module exports
└── README.md          # This file
```

## What's Rendered
- Hero slider carousel (Spidey hero slides)
- Workspace showcase with featured designs
- Studio highlights & features
- Founder/about section (Abhilash J)
- Services overview cards
- Package cards (1/2/3/4 BHK, Villas, Apartments) with filtering
- Customer testimonials carousel
- Portfolio feedback videos
- Call-to-action sections & footer

## Dependencies
**FRONTEND Dependencies**:
- State: `state.customer.categories`, `state.customer.feedbacks`, `state.portfolioContent`
- Helpers: `getCategories()`, `getDesigns()`, `getCustomerDisplayPackages()`, `renderNavItems()`, `buildSpideyHeroSlides()`, `getInitials()`, `escapeHtml()`

**No BACKEND Dependencies** (homepage is static/client-side only)

## Database Usage
- None direct (displays pre-fetched categories/designs/packages)

## API Routes
- None (static landing page)

## Legacy Import Path
```typescript
import { renderHome } from 'main.ts';  // Line 6128
```

## New Import Path (After Migration)
```typescript
import { renderHomePageFeature } from 'frontend/src/features/homepage';
```

## Migration Tasks
1. [ ] Extract `renderHome()` from main.ts → render.ts
2. [ ] Extract homepage helper functions
3. [ ] Extract package filter logic → filters.ts
4. [ ] Update imports in wrapper entrypoint (frontend/src/index/main.ts)
5. [ ] Run `npm run build` validation
6. [ ] Run smoke tests
7. [ ] Delete legacy references to homepage from main.ts
