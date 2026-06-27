# 🏠 RentEase — Furniture & Appliance Rental Platform

A full-stack, mobile-first rental platform built with **React + Bootstrap** (frontend) and **Node.js + Express + PostgreSQL** (backend). Customers can browse products, rent by the month, manage active rentals, raise maintenance requests and request returns. Admins get a full dashboard with KPIs, product CRUD, rental pipeline management, maintenance tracking, and service area control.

---

## 📦 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, React Router v6, Bootstrap 5, Bootstrap Icons, Axios, Vite |
| Backend    | Node.js, Express.js, Sequelize ORM, JWT (jsonwebtoken), bcryptjs |
| Database   | PostgreSQL 14+                                  |
| Dev tools  | Nodemon, Vite dev server with API proxy         |

---

## 🚀 Quick Start

### Prerequisites — install these first

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | Comes with Node |
| PostgreSQL | ≥ 14 | https://www.postgresql.org/download |

### 1. Clone / extract the project

```bash
unzip rentease.zip
cd rental-platform
```

### 2. Set up PostgreSQL

```bash
# Log in as the postgres superuser
psql -U postgres

# Inside psql, run:
CREATE DATABASE rentease;
ALTER USER postgres PASSWORD 'postgres';
\q
```

> **Tip:** If you use a different username/password, update `.env` in the backend folder accordingly.

### 3. Backend setup

```bash
cd backend
npm
# Copy the example environment file
cp .env.example .env
# (Edit .env if your DB credentials differ from the defaults)

# Install dependencies
npm install

# Seed the database with demo data (admin user, 6 products, 5 service areas)
npm run seed
```

#### Backend `.env` values (defaults work out of the box)

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rentease
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Frontend setup

```bash
cd ../frontend

cp .env.example .env
# Default VITE_API_URL=/api proxies through Vite to the backend — no changes needed

npm install
```

### 5. Run the development servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → API running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → UI running on http://localhost:5173
```

Open your browser at **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@rentease.com       | Admin@123     |
| Customer | customer@rentease.com    | Customer@123  |

---

## 📁 Project Structure

```
rental-platform/
├── backend/
│   ├── server.js                  ← Entry point (starts Express + syncs DB)
│   ├── .env.example               ← Environment variable template
│   ├── package.json
│   └── src/
│       ├── app.js                 ← Express app, middleware, routes
│       ├── config/
│       │   └── db.js              ← Sequelize connection
│       ├── models/
│       │   ├── index.js           ← Associations
│       │   ├── User.js            ← customer / admin
│       │   ├── Product.js         ← catalog items, tenure pricing
│       │   ├── Rental.js          ← rental orders & lifecycle
│       │   ├── MaintenanceRequest.js
│       │   └── ServiceArea.js     ← delivery cities
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── productController.js
│       │   ├── rentalController.js
│       │   ├── maintenanceController.js
│       │   ├── serviceAreaController.js
│       │   └── adminController.js ← KPI reports
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── productRoutes.js
│       │   ├── rentalRoutes.js
│       │   ├── maintenanceRoutes.js
│       │   ├── serviceAreaRoutes.js
│       │   └── adminRoutes.js
│       ├── middleware/
│       │   ├── auth.js            ← protect, adminOnly
│       │   └── errorHandler.js
│       ├── utils/
│       │   └── generateToken.js
│       └── seed/
│           └── seed.js            ← Demo data seeder
│
└── frontend/
    ├── index.html
    ├── vite.config.js             ← Dev server + API proxy
    ├── .env.example
    ├── package.json
    └── src/
        ├── main.jsx               ← App entry, providers
        ├── App.jsx                ← Router & layout shell
        ├── index.css              ← Design tokens + global styles
        ├── api/
        │   └── axios.js           ← Axios instance with JWT interceptor
        ├── context/
        │   ├── AuthContext.jsx    ← Login / register / logout state
        │   └── CartContext.jsx    ← Cart state (localStorage backed)
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   └── AdminRoute.jsx
        │   ├── products/
        │   │   ├── ProductCard.jsx
        │   │   └── CategoryCard.jsx
        │   └── common/
        │       ├── Loader.jsx
        │       ├── EmptyState.jsx
        │       ├── StatusBadge.jsx
        │       └── Modal.jsx
        └── pages/
            ├── Home.jsx
            ├── ProductsList.jsx
            ├── ProductDetails.jsx
            ├── Cart.jsx
            ├── Checkout.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── MyRentals.jsx
            ├── RentalHistory.jsx
            ├── NotFound.jsx
            └── admin/
                ├── AdminLayout.jsx
                ├── AdminDashboard.jsx
                ├── AdminProducts.jsx
                ├── AdminRentals.jsx
                ├── AdminMaintenance.jsx
                └── AdminServiceAreas.jsx
```

---

## 🌐 API Endpoints

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new customer |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | — | Browse catalog (filters: category, subCategory, search) |
| GET | `/api/products/:id` | — | Product detail with tenure pricing |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Rentals
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/rentals` | Customer | Checkout (create rental orders) |
| GET | `/api/rentals/my` | Customer | My active rentals |
| GET | `/api/rentals` | Admin | All rentals |
| PUT | `/api/rentals/:id/status` | Admin | Update rental status |
| POST | `/api/rentals/:id/return` | Customer | Request return |
| POST | `/api/rentals/:id/extend` | Customer | Extend tenure |

### Maintenance
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/maintenance` | Customer | Raise maintenance request |
| GET | `/api/maintenance/my` | Customer | My requests |
| GET | `/api/maintenance` | Admin | All requests |
| PUT | `/api/maintenance/:id` | Admin | Resolve / update |

### Service Areas
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/service-areas` | — | Active delivery cities |
| GET | `/api/service-areas/all` | Admin | All cities incl. paused |
| POST | `/api/service-areas` | Admin | Add city |
| PUT | `/api/service-areas/:id` | Admin | Activate / pause |
| DELETE | `/api/service-areas/:id` | Admin | Remove city |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/reports` | Admin | KPI dashboard data |
| GET | `/api/admin/users` | Admin | All customers |

---

## 🏷️ Backend npm dependencies

```
npm install                        # Install all at once (see package.json)
```

Individual packages 1:

| Package | Purpose |
|---------|---------|
| `express` | HTTP server & routing |
| `sequelize` | ORM for PostgreSQL |
| `pg` | PostgreSQL driver |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth tokens |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |
| `morgan` | HTTP request logging |
| `express-validator` | Input validation helpers |
| `nodemon` *(dev)* | Auto-restart on file change |

### Frontend npm dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI library |
| `react-router-dom` | Client-side routing |
| `bootstrap` | CSS framework |
| `bootstrap-icons` | Icon font |
| `axios` | HTTP client |
| `vite` *(dev)* | Build tool & dev server |
| `@vitejs/plugin-react` *(dev)* | Vite React plugin |

---

## 🎯 Feature Checklist (from PRD)

### Customer features
- [x] Registration & login with JWT
- [x] Browse by category (furniture/appliance) and sub-category
- [x] View product detail: rent, deposit, tenure options, availability
- [x] Tenure-based discount pricing (3%/8%/15% off for 3/6/12-month tenures)
- [x] Add to cart, adjust tenure, remove items
- [x] Checkout with delivery date + address + city selection
- [x] Manage active rentals (view, extend, request return)
- [x] Request maintenance from any active rental
- [x] Full rental history with status filters

### Admin features
- [x] KPI dashboard (MRR, active rentals, utilization rate, retention rate, maintenance resolution time)
- [x] Product catalog CRUD (create, edit, delete, toggle active/inactive)
- [x] Rental pipeline management (view all, update status, log damage notes)
- [x] Maintenance request tracking (update status, add resolution notes)
- [x] Service area management (add, activate, pause, remove delivery cities)
- [x] User listing

### Non-functional
- [x] Mobile-first responsive UI (Bootstrap grid, tested on 390px viewport)
- [x] JWT-protected API routes
- [x] Sequelize DB transactions for multi-item checkout (prevents race conditions on inventory)
- [x] Centralized error handling — consistent JSON error shapes
- [x] Sub-3-second page loads (Vite build, lazy image loading)
- [x] Multi-city expansion support via service areas table

---

## 🚢 Production Build

```bash
# Build the frontend
cd frontend && npm run build
# Output: frontend/dist/ — serve this as static files

# Run the backend in production
cd backend
NODE_ENV=production node server.js
```

For production deployment, point `CLIENT_URL` in `.env` to your frontend domain and set a strong `JWT_SECRET`.

---

## 🔮 Future Enhancements (from PRD)

- Online payment integration (Razorpay / Stripe)
- Mobile apps (React Native)
- Subscription bundles
- Auto-renewal of rentals
- Smart appliance tracking (IoT integration)
- Furniture customization options
