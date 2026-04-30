# Frontend Refactoring Guide - Feature-Based Organization

## Overview
The frontend code has been reorganized into feature modules while preserving all existing layout/render functions and functionality.

## New Structure

```
frontend/src/
├── features/                    # Modular feature services
│   ├── auth/
│   │   └── authService.ts      # Authentication logic (login, tokens, sessions)
│   ├── admin/
│   │   └── adminState.ts       # Admin UI state management
│   ├── booking/
│   │   └── bookingService.ts   # Booking & payment API calls
│   ├── shared/
│   │   ├── apiService.ts       # Generic API request utilities
│   │   ├── utils.ts            # Common helpers (format, debounce, etc.)
│   │   └── index.ts            # Unified exports
│   └── index.ts                # Main features export point
├── app/                         # Render functions (preserved as-is)
├── components/                  # UI components
├── services/                    # Domain services (design, etc.)
└── types.ts                     # Type definitions
```

## Usage Examples

### Authentication
```typescript
import { authService } from './features';

// Save user after login
authService.saveUser(user);

// Get current user
const user = authService.getCurrentUser();

// Check if admin
if (authService.isAdmin()) { /* ... */ }

// Clear session on logout
authService.clearSession();
```

### Admin State
```typescript
import { adminStateService, createInitialAdminState } from './features';

// Create fresh admin state
let adminState = createInitialAdminState();

// Update a field
adminState = adminStateService.updateField(adminState, 'currentTab', 'bookings');

// Clear selections
adminState = adminStateService.clearSelections(adminState);

// Reset all filters
adminState = adminStateService.resetFilters(adminState);
```

### Bookings & Payments
```typescript
import { bookingService } from './features';

// Create inquiry
const inquiry = await bookingService.createInquiry(data);

// Create payment order
const order = await bookingService.createPaymentOrder(bookingData);

// Verify payment
const result = await bookingService.verifyPayment(paymentData);
```

### Generic API Calls
```typescript
import { apiService } from './features';

// GET request
const data = await apiService.get('/bookings');

// POST request
const result = await apiService.post('/inquiries', { /* body */ });

// PUT request
await apiService.put('/users/123', { name: 'New Name' });

// DELETE request
await apiService.delete('/users/123');
```

### Utilities
```typescript
import { 
  formatCurrency, 
  formatDate, 
  debounce, 
  fileToDataUrl,
  downloadFile 
} from './features';

// Format helpers
formatCurrency(2500);        // ₹2,500.00
formatDate('2024-04-06');    // 6/4/2024

// Debounce search
const search = debounce((term) => { /* ... */ }, 300);

// File conversion
const dataUrl = await fileToDataUrl(file);

// File download
downloadFile(csvContent, 'report.csv', 'text/csv');
```

## Key Design Principles

1. **Preserved Render Functions**: All layout/render functions remain in `main.ts` - no changes needed there
2. **Feature Isolation**: Each feature is self-contained and can be tested independently
3. **Unified Exports**: Import from `./features` root instead of deep paths
4. **Backward Compatible**: Existing code continues to work without changes
5. **Type Safety**: Full TypeScript support maintained

## Migration Steps

### Step 1: Import services at top of main.ts
```typescript
import { 
  authService, 
  apiService, 
  bookingService, 
  adminStateService,
  formatCurrency,
  formatDate
} from './features/index';
```

### Step 2: Replace inline API calls with services
**Before:**
```typescript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**After:**
```typescript
const result = await bookingService.createInquiry(data);
```

### Step 3: Replace inline auth logic with service
**Before:**
```typescript
localStorage.setItem('ar_interia_auth_token', token);
const user = JSON.parse(localStorage.getItem('ar_interia_current_user'));
```

**After:**
```typescript
authService.saveToken(token);
const user = authService.getCurrentUser();
```

### Step 4: Replace inline event handlers with service calls
**Before:**
```typescript
if (formType === 'login') {
  const email = String(formData.get('email') || '');
  // validation and fetch logic
}
```

**After:**
```typescript
if (formType === 'login') {
  const email = String(formData.get('email') || '');
  // validation
  const result = await authService.validateLogin(email, password);
}
```

## Important Notes

1. **Layout Functions Unchanged**: `renderLayout()`, `renderMain()`, `renderHome()`, etc. all remain in `main.ts`
2. **Render Helpers Unchanged**: `renderImageThumb()`, `renderCategoryThumb()`, etc. are untouched
3. **State Structure**: Centralized state services make state management predictable
4. **API Consistency**: All API calls use unified `apiService` for consistency
5. **Testing**: Feature modules can now be unit tested independently

## Next Steps

1. Gradually migrate `main.ts` event handlers to use feature services
2. Extract more complex features (designs, portfolio, etc.) into their own modules
3. Add feature-specific tests for each module
4. Create a state management layer for complex features
5. Document API contracts for each service
