# AR Interia Architecture & Technologies Overview

This document provides a clear, high-level picture of the programming languages, frameworks, and API architecture used to build the AR Interia platform.

---

## 1. Programming Languages & Their Roles

### TypeScript (TS)
* **Where it's used:** Frontend application logic, State management, Component rendering (`main.ts`, `backend/src/modules/*.ts`).
* **Why it's used:** TypeScript is a statically typed superset of JavaScript. It is used in this project to ensure type safety for complex data structures like `User`, `Booking`, and `DesignModel`. This prevents runtime errors and makes the codebase much easier to maintain as it scales.

### JavaScript (JS / Node.js)
* **Where it's used:** Backend Server, API Routes, Database configuration (`server/index.js`, `server/db.js`).
* **Why it's used:** Node.js allows JavaScript to run on the server. Express.js is used to create lightweight, high-performance API endpoints that handle authentication, payments, and database operations.

### HTML5
* **Where it's used:** Core structure (`index.html`) and dynamic template literals inside TypeScript files.
* **Why it's used:** Defines the semantic structure of the web application. 

### CSS3 (Vanilla & Tailwind/Utility Classes)
* **Where it's used:** Styling the application (`index.css`, `frontend/src/styles/modern-styles.css`).
* **Why it's used:** Defines the visual aesthetics, responsive layouts, and micro-animations (like hover effects and transitions) that give AR Interia its premium, luxury feel.

### SQL (SQLite Dialect)
* **Where it's used:** Database querying inside the Node.js backend (`server/db.js`).
* **Why it's used:** SQL is used to structure, store, and retrieve all persistent data (Customers, Bookings, Portfolios) from the local SQLite database file.

---

## 2. Core Frameworks & Tools

* **Vite:** A blazing fast frontend build tool and development server. It compiles the TypeScript code and bundles the assets for production.
* **Express.js:** The backend web application framework for Node.js. It handles the routing for all `/api/*` endpoints.
* **SQLite:** A lightweight, serverless relational database. Perfect for fast local development and storing the platform's data without needing a heavy external database server.
* **Three.js:** Used in the "Design Studio" (`renderModelViewer`) to render interactive 3D models of rooms and furniture in the browser.

---

## 3. The API Architecture

The application follows a standard **Client-Server RESTful Architecture**.

### The Flow of Data:
1. **Frontend Request:** The TypeScript frontend (e.g., `main.ts`) needs data (like a list of categories). It calls the global `apiFetch('/categories')` function.
2. **Backend Route:** The Express.js server (`server/index.js`) listens for a `GET` request on `/api/categories`.
3. **Database Query:** The server executes a SQL query (`SELECT * FROM categories`) against the SQLite database.
4. **JSON Response:** The backend formats the SQL results into a JSON array and sends it back to the frontend.
5. **UI Render:** The frontend receives the JSON, updates its global `state`, and calls a render function (like `renderCategoryGallery`) to display the data to the user.

### Key API Endpoints
* **Authentication:** `/api/auth/login`, `/api/auth/register` (Manages user sessions via tokens).
* **Catalog Data:** `/api/categories`, `/api/designs`, `/api/packages` (Fetches the design offerings).
* **Customer Actions:** `/api/bookings/book-design`, `/api/contact` (Handles user interactions).
* **Admin Management:** `/api/customers`, `/api/health`, `/api/enquiries` (Secure routes requiring admin privileges).
* **AI & Advanced:** `/api/ai/designs` (Interfaces with AI models to generate custom room layouts).

---
*Generated for the AR Interia Project Report.*
