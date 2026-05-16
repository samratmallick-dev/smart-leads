# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack + TypeScript.

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS v4, Vite, React Hook Form, Zod, Axios
- **Backend**: Node.js, Express 4, TypeScript, MongoDB + Mongoose, JWT, Zod, json2csv
- **Infra**: Docker, Docker Compose, Nginx

---

## Features

- JWT authentication (register / login / protected routes)
- Role-based access control — **Admin** (all leads) and **Sales** (own leads only)
- Full CRUD for leads (Name, Email, Status, Source)
- Advanced filtering: status, source, debounced search, sort (latest / oldest)
- Backend pagination (10 per page, configurable)
- CSV export with active filters applied
- Dark mode toggle
- Responsive UI with loading skeletons and empty states

---

## Quick Start (Local)

### Prerequisites

- Node.js ≥ 20
- MongoDB running locally **or** a MongoDB Atlas URI

### 1. Clone & install

```bash
git clone <repo-url>
cd smart_leaderboard_dashboard
```

### 2. Backend

```bash
cd backend
cp ../.env.example .env   # fill in your values
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp ../.env.example .env   # set VITE_API_URL
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

---

## Docker Setup

```bash
cp .env.example .env   # set JWT_SECRET at minimum
docker compose up --build
```

- Frontend → `http://localhost:5173`
- Backend API → `http://localhost:5000`
- MongoDB → `localhost:27017`

---

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `PORT` | Backend port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `NODE_ENV` | `development` or `production` |
| `VITE_API_URL` | Frontend API base URL |

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ✗ | Register a new user |
| `POST` | `/auth/login` | ✗ | Login and receive JWT |
| `GET` | `/auth/me` | ✓ | Get current user |

**Register / Login body:**
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret", "role": "sales" }
```

**Response:**
```json
{ "success": true, "data": { "user": { "id": "...", "name": "Jane", "email": "...", "role": "sales" }, "token": "..." } }
```

---

### Leads

All lead endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/leads` | All | List leads (paginated, filterable) |
| `POST` | `/leads` | All | Create a lead |
| `GET` | `/leads/:id` | All | Get single lead |
| `PUT` | `/leads/:id` | All | Update a lead |
| `DELETE` | `/leads/:id` | All | Delete a lead |
| `GET` | `/leads/export/csv` | All | Export filtered leads as CSV |

**Query params for `GET /leads`:**

| Param | Type | Description |
|---|---|---|
| `status` | `New\|Contacted\|Qualified\|Lost` | Filter by status |
| `source` | `Website\|Instagram\|Referral` | Filter by source |
| `search` | `string` | Search name or email |
| `sort` | `asc\|desc` | Sort by createdAt (default `desc`) |
| `page` | `number` | Page number (default `1`) |
| `limit` | `number` | Records per page (default `10`, max `100`) |

**Paginated response:**
```json
{
  "success": true,
  "data": [...],
  "total": 42,
  "page": 1,
  "totalPages": 5
}
```

**Create / Update lead body:**
```json
{ "name": "Rahul", "email": "rahul@example.com", "status": "New", "source": "Instagram" }
```

---

## Role-Based Access

| Action | Admin | Sales |
|---|---|---|
| View all leads | ✓ | ✗ (own only) |
| Create lead | ✓ | ✓ |
| Edit any lead | ✓ | ✗ (own only) |
| Delete any lead | ✓ | ✗ (own only) |
| Export CSV | ✓ | ✓ (own only) |

---

## Project Structure

```
smart_leaderboard_dashboard/
├── backend/
│   └── src/
│       ├── config/        # DB, CORS, env
│       ├── controllers/   # authController, leadController
│       ├── middleware/     # auth, errorHandler, asyncHandler, validate
│       ├── models/        # User, Lead
│       ├── routes/        # authRoutes, leadRoutes
│       ├── types/         # shared TypeScript interfaces & enums
│       ├── validators/    # Zod schemas
│       └── server.ts
└── frontend/
    └── src/
        ├── components/
        │   ├── leads/     # FilterBar, LeadsTable, LeadModal, etc.
        │   └── ui/        # shadcn/ui primitives
        ├── context/       # AuthContext, ThemeContext
        ├── hooks/         # useLeads, useDebounce
        ├── pages/         # DashboardPage, LoginPage, RegisterPage
        ├── services/      # api, authService, leadsService
        └── types/         # shared frontend types
```
