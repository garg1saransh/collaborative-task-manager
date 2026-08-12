<p align="center">
  <img src="docs/screenshots/login.png" alt="Organizo login" width="720" />
</p>

<h1 align="center">Organizo</h1>

<p align="center">
  Collaborative task management with real-time updates, JWT auth, and a responsive dashboard.
</p>

<p align="center">
  <a href="https://organizo-eight.vercel.app"><strong>Live Demo</strong></a>
  ·
  <a href="docs/API.md"><strong>API Docs</strong></a>
  ·
  <a href="#quick-start"><strong>Quick Start</strong></a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Node" src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/Realtime-Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white" />
</p>

---

## Highlights

- **Auth** — Register / login with bcrypt-hashed passwords and JWT Bearer tokens  
- **Tasks** — Create, update, assign, filter, search, and sort  
- **Realtime** — Socket.IO sync for create / update / delete / assignment notifications  
- **Dashboard** — Views for All, Assigned to me, Created by me, and Overdue  
- **Deployed** — Frontend on Vercel · Backend + PostgreSQL on Render  

---

## Live access

| | |
| --- | --- |
| **App** | https://organizo-eight.vercel.app |
| **API** | https://collaborative-task-manager-79jq.onrender.com |
| **Demo email** | `demo@example.com` |
| **Demo password** | `demo@123` |

> The Render free tier can sleep. The first request after idle may take ~30–60s.

---

## Tech stack

| Layer | Choices |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Query, React Hook Form + Zod |
| Backend | Node.js, TypeScript, Express (controller → service → repository) |
| Data | PostgreSQL + Prisma |
| Auth | JWT + bcrypt |
| Realtime | Socket.IO |
| Hosting | Vercel (UI) · Render (API + DB) |

---

## Project layout

```text
Organizo/
├── frontend/          # React + Vite app
│   └── src/
│       ├── features/auth/
│       ├── realtime/
│       └── lib/api.ts
├── backend/           # Express API
│   ├── prisma/        # Schema + migrations (source of truth)
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── dto/
│       ├── middleware/
│       ├── realtime/
│       └── utils/
└── docs/              # Extra documentation + screenshots
```

```mermaid
flowchart LR
  UI[React Frontend] -->|REST + JWT| API[Express API]
  UI -->|Socket.IO| API
  API --> DB[(PostgreSQL)]
  API --> Prisma[Prisma ORM]
  Prisma --> DB
```

---

## Quick start

### Prerequisites

- Node.js (LTS)
- PostgreSQL (local or hosted)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npm run dev
```

API: `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:5173`

---

## Environment

**`backend/.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/organizo
JWT_SECRET=change_me_to_a_long_random_secret
PORT=3001
```

**`frontend/.env.local`**

```env
VITE_API_URL=http://localhost:3001
```

For production, set `VITE_API_URL` in Vercel to your Render API URL.

---

## Features at a glance

**Auth & sessions**
- Register with name, email, password (hashed with bcrypt)
- Login returns JWT + user; stored in `localStorage` under `auth`
- Protected routes validate `Authorization: Bearer <token>`

**Dashboard**
- Views: All · Assigned to me · Created by me · Overdue  
- Filters: status, priority · Sort by due date · Search title/description  
- Overview: total, completed, overdue  

**Realtime**
- `task:created` · `task:updated` · `task:deleted` · `task:assigned`  
- Assignment events go to room `user:<assignedToId>` with in-app notifications  

Full endpoint and event details: **[docs/API.md](docs/API.md)**

---

## Testing

```bash
cd backend
npm test
```

Covers task service logic, assignment events, and auth (hashing / JWT).

---

## Notes & scope

- No password-reset or email verification (out of scope for the original assessment)
- Access is task-centric; fine-grained RBAC is not implemented
- Optimistic UI / full audit logging are limited

---

## License

ISC (see `backend/package.json`). Feel free to fork and extend.
