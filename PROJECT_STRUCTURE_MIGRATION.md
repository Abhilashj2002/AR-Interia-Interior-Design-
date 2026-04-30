# Project Structure Migration Map

Current Runtime Entry Points
- Frontend entry: frontend/src/index/main.ts -> wraps frontend/src/app/main.ts -> wraps main.ts
- Backend entry: backend/src/api/server.js -> wraps server/index.js
- DB exports: backend/src/db/sqlite.js -> re-exports server/db.js

Domain Modules
- admin
- admin-dashboard
- customer-dashboard
- categories
- gallery
- chatbot
- price-calculator
- services
- packages
- homepage
- portfolio
- luxury-showroom
- design-studio
- payments
- invoices

Legacy Source of Truth (Temporary)
- Frontend: main.ts
- Backend API: server/index.js
- Backend DB: server/db.js

Snapshot / Backup Copies (Not Runtime)
- frontend/src/project-copies/*.copy.ts are reference snapshots only
- Runtime imports should never point to frontend/src/project-copies

Recommended Migration Order
1. homepage, categories, gallery
2. services, packages, portfolio, luxury-showroom
3. chatbot, price-calculator, design-studio
4. customer-dashboard and admin-dashboard controls
5. payments and invoices
6. delete legacy monolith files after all imports/routes are moved
