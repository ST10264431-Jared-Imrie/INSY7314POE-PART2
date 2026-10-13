# HustleHub+ — Secure Freelance Marketplace (MERN)

**Part 2 — Full-Stack Expansion**: MongoDB persistence, Role-Based Access Control, gig CRUD, bookings with automatic transaction records and freelancer income tracking, hardened security controls, React role-based dashboards, Postman/Newman API tests, and React Testing Library unit tests.

---

## 1. System Overview

HustleHub+ connects **freelancers** (who publish service gigs and track earnings) with **clients** (who browse and book gigs). Every booking automatically generates a **transaction record** (unique `TXN-...` id + timestamp) and increments the freelancer's tracked income.

### Roles
| Role | Capabilities |
|---|---|
| `client` | Browse gigs, create bookings, view own bookings |
| `freelancer` | Create/update/delete **own** gigs, view bookings on own gigs, update booking status, view earnings |
| `admin` | Delete any gig, view all bookings (cannot be self-registered via public API) |

---

## 2. Project Structure

```
hustlehub-backend/
├── certs/                          # Self-signed SSL cert (server.key, server.cert)
├── config/
│   ├── db.js                       # Mongoose connection to MongoDB
│   └── keys.js                     # Centralized env config (port, JWT secret, Mongo URI)
├── controllers/
│   ├── authController.js           # Register / Login / Profile
│   ├── gigController.js            # Gig CRUD with ownership checks
│   └── bookingController.js        # Bookings, transactions, earnings aggregation
├── middleware/
│   ├── auth.js                     # authenticateToken (JWT) + authorizeRoles (RBAC)
│   ├── errorHandler.js             # Centralized errors — no stack-trace leakage
│   ├── rateLimiter.js              # authLimiter / bookingLimiter / apiLimiter
│   ├── sanitize.js                 # XSS (xss lib) + NoSQL ($-operator stripping)
│   └── validate.js                 # express-validator rule sets
├── models/
│   ├── User.js                     # name, email, bcrypt-hashed password, role, totalEarnings
│   ├── Gig.js                      # title, description, price, freelancer ref, isActive
│   └── Booking.js                  # client/freelancer/gig refs, amount, status, embedded transaction
├── routes/
│   ├── authRoutes.js
│   ├── gigRoutes.js
│   └── bookingRoutes.js
├── server.js                       # HTTPS server + Helmet CSP + CORS + middleware pipeline
├── HustleHub_Part1.postman_collection.json
└── HustleHub_Part2.postman_collection.json

hustlehub-frontend/
├── src/
│   ├── api/axiosInstance.js        # Base URL + Bearer-token interceptor + 401 auto-logout
│   ├── context/AuthContext.js      # Auth state, JWT persisted to localStorage
│   ├── components/                 # Navbar, GigCard, ProtectedRoute (role-gated)
│   ├── pages/                      # Login, Register, ClientDashboard, FreelancerDashboard, NotFound
│   └── __tests__/                  # Jest + React Testing Library suites
└── .env                            # REACT_APP_API_URL=https://localhost:8443
```

---

## 3. API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public (rate-limited) | Register as `client` or `freelancer` |
| POST | `/api/auth/login` | Public (rate-limited) | Returns JWT (2h expiry) + user object |
| GET | `/api/auth/profile` | Any authenticated user | Current user profile |

### Gigs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/gigs` | Public | Browse all active gigs |
| GET | `/api/gigs/my` | Freelancer | Own gigs |
| GET | `/api/gigs/:id` | Public | Single gig |
| POST | `/api/gigs` | Freelancer | Create gig |
| PUT | `/api/gigs/:id` | Owner freelancer | Update own gig (403 otherwise) |
| DELETE | `/api/gigs/:id` | Owner freelancer or admin | Delete gig (403 otherwise) |

### Bookings & Transactions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/bookings` | Client (rate-limited) | Book a gig → auto transaction + income update |
| GET | `/api/bookings/my` | Client | Own bookings |
| GET | `/api/bookings/my-gigs` | Freelancer | Bookings on own gigs |
| GET | `/api/bookings/earnings` | Freelancer | Earnings summary (total / completed / pending) |
| PATCH | `/api/bookings/:id/status` | Owner freelancer | Set `confirmed` / `completed` / `cancelled` |
| GET | `/api/bookings` | Admin | All bookings |

---

## 4. Security Implementation (Part 2)

1. **HTTPS everywhere** — Express served via `https.createServer` with local self-signed certificates (port 8443).
2. **Password hashing** — `bcryptjs`, 10 salt rounds, hashed in a Mongoose `pre-save` hook; password field has `select: false`.
3. **Stateless JWT auth** — 2-hour expiry, signed with `JWT_SECRET`; `authenticateToken` middleware guards protected routes.
4. **Role-Based Access Control** — `authorizeRoles('client'|'freelancer'|'admin')` middleware layered after authentication; resource-level **ownership checks** in controllers prevent users modifying/deleting records that are not theirs (403).
5. **NoSQL injection protection** — `express-mongo-sanitize` strips `$`-operators from body/query/params, plus a custom sanitizer that drops `$`-prefixed keys.
6. **XSS protection** — every string in `req.body` passes through the `xss` library before reaching controllers; Helmet sets a strict **Content-Security-Policy** (`default-src 'self'`, `object-src 'none'`, `frame-src 'none'`).
7. **Rate limiting** — `authLimiter` (20 req / 15 min) on register & login against brute force; `bookingLimiter` (30 req / 10 min) on booking creation; global `apiLimiter` (300 req / 15 min).
8. **Strict input validation** — `express-validator` rule sets on all mutating routes (email format, password ≥8 chars with letter+digit, price bounds 1–100,000, MongoId format for references).
9. **Payload limits** — JSON body capped at 10kb to limit abuse.
10. **Secure error handling** — centralized handler returns generic messages for 500s; stack traces never leak.
11. **Privilege-escalation guard** — `admin` role cannot be self-assigned through the public registration endpoint.
12. **CORS lockdown** — only `http://localhost:3000` (configurable via `CORS_ORIGIN`), credentials enabled, methods/headers whitelisted.

---

## 5. Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — either:
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed locally (default URI `mongodb://127.0.0.1:27017/hustlehub`), or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (set `MONGO_URI` in `.env`).
- **OpenSSL** (bundled with Git Bash on Windows) for certificate generation.

---

## 6. Backend Setup

```bash
cd hustlehub-backend
npm install
```

### 6.1 Generate self-signed SSL certificates (one-time)

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
  -subj "/CN=localhost" \
  -keyout certs/server.key \
  -out certs/server.cert \
  -days 365
```

### 6.2 Configure environment (`.env`)

```env
PORT=8443
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hustlehub
CORS_ORIGIN=http://localhost:3000
```

### 6.3 Start MongoDB and the API

```bash
# Local MongoDB (if not running as a service):
mongod --dbpath /path/to/data

# Start the API (HTTPS on port 8443):
npm run dev        # nodemon
# or
npm start
```

Verify: `https://localhost:8443/api/health` (accept the self-signed certificate warning in your browser, or use `curl -k`).

---

## 7. Frontend Setup

```bash
cd hustlehub-frontend
npm install
npm start          # http://localhost:3000
```

The frontend `.env` already points to the API:

```env
REACT_APP_API_URL=https://localhost:8443
PORT=3000
```

> **Self-signed certificate note:** the first time you use the app, open `https://localhost:8443/api/health` in a browser tab and accept the certificate; otherwise the browser may block API calls from the React app.

### Features
- **Register / Login** with client-side validation (email format, password ≥8 chars with letters+digits, confirm-password match). JWT stored via `AuthContext` → `localStorage`; axios interceptor attaches `Authorization: Bearer <token>` and auto-logs-out on 401.
- **Client Dashboard** — browse active gigs (cards), one-click booking with success/error feedback, and a table of own bookings with status and payment badges (paid / refunded).
- **Freelancer Dashboard** — earnings summary card (total, bookings, completed, pending, cancelled), create-gig form, inline edit/delete of own gigs (with confirmation), and bookings-on-my-gigs table with payment status.
- **Role-gated routing** — `<ProtectedRoute allowedRoles={...}>` redirects users to the dashboard matching their role; unknown routes → 404 page.

---

## 8. Testing

### 8.1 Frontend unit tests (Jest + React Testing Library)

```bash
cd hustlehub-frontend
npm test           # interactive watch mode
# one-shot (CI):
CI=true npm test             # bash / macOS / Linux
set CI=true && npm test      # Windows cmd
```

Suites included:
- `GigCard.test.js` — rendering, price formatting, Book-button visibility per role, `onBook` callback with gig id.
- `Login.test.js` — form rendering, email/password validation errors, successful login stores token + role-based navigation (mocked axios).
- `Register.test.js` — validation flows and registration API call (mocked axios).

### 8.2 API tests (Postman + Newman)

Two collections ship with the backend:
- `HustleHub_Part1.postman_collection.json` — auth foundations.
- `HustleHub_Part2.postman_collection.json` — 39 requests in 5 folders covering auth, gig CRUD, bookings/transactions/earnings, RBAC negative tests (client creating gigs → 403, non-owner update/delete → 403, missing token → 401), a NoSQL-injection login-bypass attempt (blocked), stored-XSS sanitization, Helmet CSP header presence, simulated payment capture (`paymentStatus: paid`) with **refund-on-cancellation** verification, and an automated **Rate Limiting** folder (5) that loops failed logins and invalid bookings until the server returns HTTP 429.

> **Rate-limit caveat:** folder 5 intentionally exhausts the auth/booking limiters for your IP. Before re-running the collection within 15 (auth) / 10 (booking) minutes, restart the backend — the limiter store is in-memory and resets on boot.

**GUI:** Import the collection into Postman and use the collection **Runner** (requests are ordered; tokens and ids chain automatically through collection variables).

**CLI (Newman):**

```bash
npm install -g newman

# Start backend + MongoDB first, then:
cd hustlehub-backend
newman run HustleHub_Part2.postman_collection.json --insecure
```

- `--insecure` is required because the API uses a self-signed certificate.
- To target another environment: `newman run ... --env-var "baseUrl=https://localhost:8443"`.
- Emails are generated with a timestamp per run, so the collection is **re-runnable** without duplicate-email failures.
- HTML report (optional): `npm install -g newman-reporter-htmlextra && newman run HustleHub_Part2.postman_collection.json --insecure -r cli,htmlextra`.

---

## 9. Data Model Summary

**User** — `name`, `email` (unique), `password` (bcrypt, `select:false`), `role` ∈ {client, freelancer, admin}, `totalEarnings`, timestamps.

**Gig** — `title` (5–120), `description` (20–2000), `price` (1–100,000), `freelancer` → User ref (indexed), `isActive`, timestamps.

**Booking** — `client` → User ref, `freelancer` → User ref, `gig` → Gig ref, `amount`, `status` ∈ {pending, confirmed, completed, cancelled}, `paymentStatus` ∈ {unpaid, paid, refunded} (simulated payment captured as `paid` at booking time), embedded `transaction` { `transactionId` (TXN-...), `timestamp`, `description` }, compound indexes on (client, createdAt) and (freelancer, createdAt).

Income flow: `POST /api/bookings` → booking + transaction created (payment simulated as `paid`) → `User.totalEarnings` incremented atomically (`$inc`) → `GET /api/bookings/earnings` aggregates live totals via the Booking collection. Cancelling a booking simulates a refund (`paymentStatus → refunded`), reverses the tracked income, and the aggregation excludes refunded bookings from `totalEarnings` / `pendingEarnings` so totals always reflect payable income.
