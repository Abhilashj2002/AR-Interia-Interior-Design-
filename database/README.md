# Database Layer

This folder is the canonical home for database-focused artifacts going forward.

Current runtime database code and files remain in `server/` for backward compatibility:

- `server/db.js`
- `server/database.js`
- `server/ar_interia.db`
- `server/database.sqlite`

Use alias `@database/*` (mapped to `server/*`) in application code during migration.

Planned migration target:

- Move database modules from `server/` into `database/src/`
- Keep compatibility wrappers in `server/` until all scripts/tests are updated
