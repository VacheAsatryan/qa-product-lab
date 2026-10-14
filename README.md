# QA Product Lab

A publicly accessible Product Management CRUD application used as a training environment for a Software QA course.

Students and trainers can practice:

- Manual Testing
- API Testing
- Positive and Negative Testing
- Boundary Value Analysis
- Equivalence Partitioning
- Regression Testing
- Bug Reporting

This is not a commercial e-commerce application.

## Tech stack

| Layer | Technology | Deployment target |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS | Vercel |
| Backend | Node.js, Express, TypeScript | Render |
| Database | PostgreSQL | Neon PostgreSQL |

Phase 1 includes project setup, a health endpoint, and a landing page. Product CRUD is not implemented yet.

## Repository structure

```text
qa-product-lab/
  frontend/   React + Vite application
  backend/    Express API
  README.md
```

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- PostgreSQL is planned for a later phase. It is not required to run Phase 1.

## Environment variables

Copy the example files and adjust values as needed.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Frontend (`frontend/.env`)

| Variable | Description | Local example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the Express API | `http://localhost:4000` |

### Backend (`backend/.env`)

| Variable | Description | Local example |
| --- | --- | --- |
| `PORT` | API port | `4000` |
| `NODE_ENV` | Runtime environment | `development` |
| `CORS_ORIGIN` | Allowed browser origins. Use a comma-separated list for multiple origins. | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string (reserved for later phases) | Neon connection string |

Do not commit `.env` files. They are ignored by git.

## Installation

From the repository root:

```bash
npm install
```

This installs dependencies for both workspaces (`frontend` and `backend`).

## Run locally

Use two terminals.

**Backend** (http://localhost:4000):

```bash
npm run dev:backend
```

Health check:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{ "status": "ok" }
```

**Frontend** (http://localhost:5173):

```bash
npm run dev:frontend
```

Open http://localhost:5173 to see:

- QA Product Lab
- Product Management Testing Environment

## Production builds

```bash
npm run build:frontend
npm run build:backend
```

TypeScript checks:

```bash
npm run typecheck
```

## Current scope

Implemented in Phase 1:

- Monorepo with frontend and backend
- Frontend landing page
- Backend `GET /health`
- Environment-based CORS
- PostgreSQL client placeholder (`DATABASE_URL` is read, but no models or CRUD exist yet)

Not implemented yet:

- Product CRUD
- Authentication
- Deployment
