# Project Structure (Frontend / Backend / Database)

This workspace is now organized by ownership boundaries while keeping runtime compatibility.

## Canonical Roots

- Frontend: `frontend/src/`
- Backend: `backend/src/`
- Database layer: `server/` (current runtime DB + SQL logic), with `database/` reserved for migration docs/scripts

## Entrypoints

- Frontend app entry: `frontend/src/app/main.ts`
- Frontend HTML boot: `index.html` -> `/frontend/src/index/main.ts` -> `frontend/src/app/main.ts`
- Backend server entry: `backend/src/api/server.js` (delegates to `server/index.js`)

## Aliases

- `@frontend/*` -> `frontend/src/*`
- `@backend/*` -> `backend/src/*`
- `@database/*` -> `server/*`
- Existing `@/*` remains supported

## Current Ownership Map

### Frontend-owned

- `frontend/src/**`
- `main.ts` (legacy runtime module, delegated through `frontend/src/app/main.ts`)
- `constants.ts`, `types.ts`, `components/**`, `services/**`, `styles/**`, `theme/**`

### Backend-owned

- `backend/src/**`
- `server/routes/**`, `server/middleware/**`, `server/index.js`, `server/invoices.js`

### Database-owned

- `server/db.js`
- `server/database.js`
- SQLite files in `server/` (e.g., `ar_interia.db`, `database.sqlite`)
- DB scripts in `scripts/**` and `server/seed-*.js`

## Why this structure is safe

- No runtime behavior changes were made for backend initialization.
- Frontend uses a canonical app entry path without removing legacy modules.
- Database paths remain unchanged so existing scripts/tests continue to work.

## Next Optional Step (Phase 2)

Move legacy frontend root modules into `frontend/src/` in batches:

1. `constants.ts`, `types.ts`
2. `components/**`, `services/**`, `theme/**`, `styles/**`
3. `main.ts` -> `frontend/src/app/main.ts` (replace wrapper)

This can be done incrementally with compatibility re-export files to avoid breakages.
