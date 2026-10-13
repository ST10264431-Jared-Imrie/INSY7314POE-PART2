# HustleHub+ Frontend (React)

React client for the HustleHub+ secure freelance marketplace (Part 2). Talks to the HTTPS API in `../hustlehub-backend` (see its `README.md` for full documentation).

## Quick Start

```bash
npm install
npm start        # http://localhost:3000
```

`.env`:

```env
REACT_APP_API_URL=https://localhost:8443
PORT=3000
```

> The backend uses a self-signed certificate. Before using the app, open
> `https://localhost:8443/api/health` once in the browser and accept the
> certificate, otherwise API calls will be blocked.

## Pages & Features

| Route | Component | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register (client/freelancer role selection) | Public |
| `/dashboard/client` | ClientDashboard — browse gigs, book, view own bookings | `client` only |
| `/dashboard/freelancer` | FreelancerDashboard — gig CRUD, bookings, earnings summary | `freelancer` only |
| `*` | NotFound | Public |

- **Auth**: JWT stored in `localStorage` via `AuthContext`; axios interceptor attaches the `Bearer` token and forces logout + redirect on 401.
- **Validation**: client-side checks on login/register (email format, password ≥ 8 chars with letters and digits, confirm-password match) and on gig forms (required fields, positive numeric price).
- **Error handling**: inline alerts for API failures, loading and empty states everywhere.
- **Route protection**: `<ProtectedRoute allowedRoles>` guards dashboards by role.
- **Payments**: booking tables show simulated payment status badges (`paid` / `refunded`); freelancer earnings card tracks total, pending, completed, and cancelled bookings.

## Tests

Jest + React Testing Library:

```bash
npm test                 # watch mode
CI=true npm test         # one-shot run (bash)
```

Suites: `src/__tests__/GigCard.test.js`, `Login.test.js`, `Register.test.js` (12 tests).
