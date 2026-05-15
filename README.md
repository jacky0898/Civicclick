# CivicClick 🏙️

**Civic & Tourism Safety, Simplified**

A full-stack platform where citizens and tourists report public safety issues across Goa. Local volunteers accept and resolve them. Every resolved issue makes the destination safer for everyone.

---

## Features

- 📍 **Geo-based issue reporting** — report problems with live location or camera
- 🗺️ **Nearby issues map** — view issues within 10km, open in Google Maps
- 🙋 **Volunteer system** — atomic issue assignment, no double-booking
- 🏆 **Leaderboard** — points for resolving (+10) and verifying (+5) issues
- 💰 **Sponsorship tracking** — link sponsors to unresolved issues
- 🔐 **JWT authentication** — citizen, volunteer, and admin roles
- 🗺️ **Tourist Mode** — filter to safety-relevant issues for visitors
- 📸 **Live camera + file upload** — Cloudinary-backed image storage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + MongoDB (Mongoose) |
| Frontend | Next.js 14 (Pages Router) + Tailwind CSS |
| Auth | JWT (15m access + 7d refresh) |
| Images | Cloudinary |
| Geo | MongoDB 2dsphere + $nearSphere |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                 # http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev                         # http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (5000) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | 64-char random hex |
| `JWT_REFRESH_SECRET` | ✅ | 64-char random hex (different) |
| `ALLOWED_ORIGINS` | ✅ | Frontend URL (Render URL in production) |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | Required for image uploads |
| `CLOUDINARY_API_KEY` | ⚠️ | Required for image uploads |
| `CLOUDINARY_API_SECRET` | ⚠️ | Required for image uploads |

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (Render URL in production) |

---

## Deployment (Render)

### Backend (Web Service)
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment:** Add all variables from `.env.example`

### Frontend (Static Site or Web Service)
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment:** Set `NEXT_PUBLIC_API_URL` to your backend Render URL

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Register (citizen/volunteer) |
| POST | `/auth/login` | public | Login → JWT |
| POST | `/auth/refresh` | public | Refresh access token |
| POST | `/issues` | citizen | Create issue with image |
| GET | `/issues/nearby` | any | Geo query nearby issues |
| GET | `/issues/:id` | any | Get issue by ID |
| PATCH | `/issues/:id` | reporter/admin | Update issue |
| DELETE | `/issues/:id` | reporter/admin | Soft delete |
| PATCH | `/issues/:id/status` | volunteer/admin | Lifecycle update |
| PATCH | `/issues/:id/verify` | admin | Verify resolved issue |
| POST | `/volunteer/accept/:id` | volunteer | Atomic accept |
| GET | `/volunteer/assigned` | volunteer | My assigned issues |
| PATCH | `/volunteer/status/:id` | volunteer/admin | Update status |
| POST | `/sponsorship` | any | Create sponsorship |
| PATCH | `/sponsorship/:id` | admin | Update sponsorship status |
| GET | `/leaderboard` | public | Ranked volunteer list |

---

## Issue Lifecycle

```
Reported → Assigned → In Progress → Resolved → Verified
```

- Volunteer accepts → `Assigned` (atomic, race-condition safe)
- Volunteer updates → `In Progress` → `Resolved` (+10 pts)
- Admin verifies → `Verified` (+5 pts to volunteer)

---

## Project Structure

```
civicclick/
├── backend/
│   ├── config/          # env validation, DB connection
│   ├── middleware/       # auth, RBAC, validation, error handler
│   ├── modules/
│   │   ├── auth/        # register, login, refresh
│   │   ├── issues/      # CRUD + geo + lifecycle
│   │   ├── volunteer/   # accept + status updates
│   │   ├── sponsorship/ # sponsorship lifecycle
│   │   └── leaderboard/ # points + ranking
│   ├── utils/           # AppError, imageUpload
│   ├── app.js
│   └── server.js
└── frontend/
    ├── components/      # Navbar, IssueCard, Toast, ProgressBar
    ├── hooks/           # useAuth, useProgress
    ├── lib/             # axios instance
    ├── pages/           # Next.js pages
    └── styles/          # Tailwind CSS
```
