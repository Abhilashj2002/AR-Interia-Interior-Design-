# Running Process Information

**Date:** Monday 23 March, 2026

## Active Services

| Service | Port | Status |
|---------|------|--------|
| Frontend (Vite) | 5500 | Running |
| Backend (Node.js/Express) | Auto | Running |
| Database (SQLite) | File-based | Running |

## Access URLs

- **Frontend:** http://127.0.0.1:5500
- **Backend API:** http://127.0.0.1:5500/api

## Process Details

- **Main Process PID:** 20104
- **Started via:** `npm run start`
- **Command:** concurrently (Frontend + Backend)

## How to Restart

```bash
# Kill all ports
npx kill-port 5500 5173 5175

# Restart all services
npm run start
```

## How to Stop

```bash
# Find the process
netstat -ano | findstr :5500

# Kill by PID (replace <PID> with actual process ID)
taskkill /F /T /PID <PID>
```

## Project Structure

- **Frontend:** Vite + TypeScript + Three.js
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Package Manager:** npm
