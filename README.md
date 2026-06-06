<div align="center">

# VendorBridge

### Centralized Procurement & Vendor Management ERP

An enterprise-grade platform that automates the end-to-end procurement lifecycle — from vendor onboarding and RFQ publishing to quotation comparison, multi-step approvals, purchase order dispatch, and invoice reconciliation.

<br />

![Status](https://img.shields.io/badge/status-active%20development-2ea44f?style=for-the-badge)
![License](https://img.shields.io/badge/license-UNLICENSED-c71d23?style=for-the-badge)
![Backend](https://img.shields.io/badge/backend-NestJS%2010-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Frontend](https://img.shields.io/badge/frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Database](https://img.shields.io/badge/database-PostgreSQL%2016-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![ORM](https://img.shields.io/badge/ORM-Prisma%205-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Cache](https://img.shields.io/badge/cache-Redis%207-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Queue](https://img.shields.io/badge/queue-BullMQ-FF6B6B?style=for-the-badge)
![Storage](https://img.shields.io/badge/storage-MinIO%20%2F%20S3-C72E29?style=for-the-badge&logo=minio&logoColor=white)
![PDF](https://img.shields.io/badge/pdf-Puppeteer-40B5A4?style=for-the-badge)

<br />

[A live demo section is reserved here.](#screenshots) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Roadmap](#roadmap)

</div>

---

## Table of Contents

1. [About the Project](#about-the-project)
2. [Why VendorBridge?](#why-vendorbridge)
3. [Feature Matrix](#feature-matrix)
4. [System Architecture](#system-architecture)
5. [Tech Stack](#tech-stack)
6. [Repository Layout](#repository-layout)
7. [Quick Start](#quick-start)
8. [Module Overview](#module-overview)
9. [Security Model](#security-model)
10. [Background Workers](#background-workers)
11. [Available Scripts](#available-scripts)
12. [API Conventions](#api-conventions)
13. [Testing Strategy](#testing-strategy)
14. [Deployment](#deployment)
15. [Screenshots](#screenshots)
16. [Documentation](#documentation)
17. [Contributing](#contributing)
18. [License](#license)

---

## About the Project

**VendorBridge** is a full-stack procurement and vendor management ERP designed to digitize, automate, and secure the way organizations interact with their supply chain. It serves four primary user roles out of the box:

- **Admin** — user provisioning, vendor verification, audit oversight.
- **Manager** — multi-step approval of high-value purchase orders.
- **Procurement Officer** — RFQ creation, quotation comparison, PO generation.
- **Vendor** — self-service quotation submission, invoice issuance, PO/invoice viewing.

The platform is built on a **modular monolith** backend (NestJS) following **clean architecture** principles, paired with a **React 19 + Vite 8** single-page application. Every heavy operation — PDF compilation, email dispatch, report exports — runs asynchronously through a **BullMQ** queue, so user-facing requests stay fast and responsive.

---

## Why VendorBridge?

| Pain Point | How VendorBridge Solves It |
|---|---|
| Manual RFQ distribution via email/Excel | Centralized RFQ creation, vendor assignment, and one-click publishing |
| Spreadsheet-driven quotation comparison | Side-by-side comparison view ranked by price, delivery, and vendor rating |
| No audit trail for procurement decisions | Immutable PostgreSQL audit log with event-driven diff tracking |
| Slow PDF generation blocking UI | Asynchronous Puppeteer workers via BullMQ, files stored in S3 |
| Lost or duplicated invoices | Strict `sum(invoices) <= PO total` guard to prevent over-invoicing |
| Approval bottlenecks | Configurable multi-step workflow routed by transaction value |
| Vendor data scattered across systems | Single source of truth with GST validation, status lifecycle, and rating |

---

## Feature Matrix

| Capability | Admin | Manager | Procurement | Vendor |
|---|:---:|:---:|:---:|:---:|
| Sign up & authenticate | Yes | Yes | Yes | Yes (pending approval) |
| Manage user roles | Yes | — | — | — |
| Approve / blacklist vendors | Yes | — | — | — |
| Create & publish RFQs | — | — | Yes | — |
| Submit & revise quotations | — | — | — | Yes |
| Compare quotations side-by-side | Yes | Yes | Yes | — |
| Multi-step PO approvals | — | Yes | — | — |
| Generate POs from quotations | — | — | Yes | — |
| Create invoices against POs | — | — | — | Yes |
| View personal dashboard | Yes | Yes | Yes | Yes |
| Read activity / audit logs | Yes | — | — | — |
| Export reports (CSV/Excel) | Yes | Yes | Yes | — |

---

## System Architecture

```
                          Browser (React 19 SPA)
                                    |
                                    v
                     +-----------------------------+
                     |  Vite Dev Server / Nginx    |
                     +--------------+--------------+
                                    |
                                    v
                     +-----------------------------+
                     |   NestJS API (port 3000)    |
                     |  /api/v1   /docs   /metrics |
                     +--------------+--------------+
                                    |
        +-----------+-----------+---+---+-----------+-----------+
        |           |           |       |           |           |
        v           v           v       v           v           v
   PostgreSQL     Redis      MinIO    BullMQ    MailDev       Puppeteer
   (PgBouncer)   (Cache &   (S3 API  (Job      (SMTP         (Headless
                 Sessions)  Object   Queue)    Capture)      PDF Engine)
                             Store)
```

Key architectural decisions:

- **Modular Monolith** with clear domain boundaries — refactorable into microservices later.
- **Three-layer modules**: Controller (API) → Service (Business) → Prisma (Data).
- **Event-driven** decoupled workflows through NestJS `EventEmitter2` + BullMQ.
- **Connection pooling** through PgBouncer (transaction mode) with a dedicated direct URL for migrations.
- **Immutable audit logs** enforced at the database level via PostgreSQL triggers.

---

## Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Language | TypeScript | 5.3 |
| Framework | NestJS | 10.3 |
| ORM | Prisma | 5.9 |
| Database | PostgreSQL | 16 |
| Pooler | PgBouncer | 1.21 |
| Cache / KV | Redis | 7.2 |
| Task Queue | BullMQ | 5.1 |
| Object Storage | MinIO / AWS S3 | — |
| PDF Engine | Puppeteer | 21.9 |
| Mail | Nodemailer → AWS SES | 6.9 |
| Auth | RS256 JWT (Passport) | — |
| Hashing | Argon2id | 0.31 |
| Logging | Winston + daily rotate | — |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19 |
| Build Tool | Vite | 8 |
| Styling | TailwindCSS | 4 |
| Routing | React Router | 7 |
| PDF Export | jsPDF + autotable | 4.x |
| Linting | ESLint | 10 |

### Infrastructure

| Component | Purpose |
|---|---|
| Docker Compose | Local dev: PostgreSQL, Redis, MinIO, MailDev |
| OpenSSL | RS256 key pair generation for JWT |
| Prometheus | Metrics scraping from `/metrics` |

---

## Repository Layout

```
Odoo x KSV (Virtual Round)/
├── backend/                  NestJS API (in progress)
│   ├── src/
│   │   ├── main.ts           App entry point
│   │   ├── app.module.ts     Root module imports
│   │   ├── common/           Shared decorators, guards, filters
│   │   ├── infrastructure/   Prisma, S3, mail, PDF, logger
│   │   └── modules/          Auth, dashboard, vendors, rfqs, ...
│   ├── prisma/
│   │   └── schema.prisma     14-table data model
│   ├── docker-compose.yml    Local services
│   └── Dockerfile            Multi-stage production build
│
├── frontend/                 React 19 + Vite SPA
│   ├── src/
│   │   ├── pages/            13 route-level views
│   │   ├── components/       Layout, modals, toasts
│   │   ├── context/          Auth, preferences
│   │   ├── data/             Mock datasets
│   │   ├── hooks/            Reusable hooks
│   │   └── utils/            Formatters, PDF exporters
│   ├── public/               Static assets
│   └── tailwind.config.js
│
├── PRD.md                    Product Requirements Document
├── TechStack.md              Architecture & stack details
├── TODO.md                   Module-by-module build checklist
└── README.md                 You are here
```

---

## Quick Start

### Prerequisites

- **Node.js** 20.x and **npm** 10.x
- **Docker** with Docker Compose
- **OpenSSL** (for generating local JWT keys)

### 1. Clone and enter the repository

```bash
git clone <repository-url>
cd "Odoo x KSV (Virtual Round)"
```

### 2. Backend

```bash
cd backend
cp .env.example .env

# Generate RS256 keys for local JWT signing
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Install dependencies
npm ci

# Boot local services (PostgreSQL, Redis, MinIO, MailDev)
docker compose up -d

# Apply Prisma migrations
npm run prisma:migrate:dev

# Start the API in watch mode
npm run start:dev
```

The backend will be available at:

- API:        `http://localhost:3000/api/v1`
- Swagger:    `http://localhost:3000/docs`
- MailDev:    `http://localhost:1080`
- MinIO:      `http://localhost:9001`
- Health:     `http://localhost:3000/api/v1/health`

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173` (Vite auto-picks the next free port if 5173 is busy).

### 4. Verify

```bash
curl http://localhost:3000/api/v1/health
# -> { "status": "ok", "checks": { "postgres": "up", "redis": "up", "minio": "up", "clamav": "up" } }
```

Open `http://localhost:5173` in your browser and log in with the seeded credentials documented in `PRD.md`.

---

## Module Overview

The system is organized into **10 business modules**, each with its own controller, service, and Prisma models.

| # | Module | Purpose | Status |
|---|---|---|---|
| 1 | Auth | Signup, login, refresh, password reset, RBAC | In progress |
| 2 | Dashboard | Role-based KPIs, quick actions, cached summaries | Planned |
| 3 | Vendors | Vendor registration, GST validation, verification lifecycle | Planned |
| 4 | RFQs | Drafting, attachments, vendor assignment, publish/expiry cron | Planned |
| 5 | Vendor Quotations | Bid intake, revisions, retraction, attachments | Planned |
| 6 | Quotation Comparison | SQL view ranking, side-by-side comparison | Planned |
| 7 | Approvals | Value-based routing, multi-step state machine | Planned |
| 8 | Purchase Orders & Invoices | PO generation, PDF dispatch, invoice reconciliation | Planned |
| 9 | Activity Logs & Notifications | Immutable audit, in-app alerts | Planned |
| 10 | Reports & Analytics | Vendor performance, spend summary, async exports | Planned |

For the granular build checklist, see [`TODO.md`](./TODO.md).

---

## Security Model

- **Asymmetric JWT (RS256)** — public key verifies, private key signs. Token tampering is impossible without the private key.
- **Argon2id password hashing** — 64 MB memory cost, 3 iterations, 4 threads.
- **Role-based access control** — `@Roles(...)` decorator + `RolesGuard` enforces route-level authorization.
- **Rate limiting** (Redis-backed):
  - Auth endpoints: 10 req / min / IP
  - Password recovery: 3 req / hour / IP
- **Login lockout** — 5 failures within 15 minutes triggers a 15-minute block per email.
- **Refresh-token rotation** — reuse of a revoked token immediately wipes all active sessions for that user.
- **Helmet** — standard security headers (CSP, HSTS, X-Frame-Options).
- **Immutable audit logs** — PostgreSQL trigger blocks `UPDATE`/`DELETE` on `audit_logs`.
- **Presigned S3 URLs** — uploads never traverse the application server.

---

## Background Workers

All intensive workflows are offloaded to BullMQ workers:

| Queue | Purpose | Trigger |
|---|---|---|
| `email-notifications` | Transactional emails (RFQ alerts, PO dispatch, reset links) | Event listeners |
| `pdf-generation` | Puppeteer-based PO and invoice PDF compilation | After PO/Invoice creation |
| `report-export` | CSV/Excel generation for large analytics datasets | `GET /api/v1/reports/export` |

Workers use exponential backoff with a maximum of 3 retries. Job state and failures are visible in the BullMQ dashboard or via `npm run start:debug`.

---

## Available Scripts

### Backend

| Script | Description |
|---|---|
| `npm run start:dev` | Start API in watch mode |
| `npm run start:debug` | Start API with debugger attached |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled output |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate:dev` | Apply migrations locally |
| `npm run prisma:migrate` | Deploy migrations in production |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Run Prettier on `src/` and `test/` |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with ESLint |

---

## API Conventions

- **Base URL**: `/api/v1`
- **Auth header**: `Authorization: Bearer <accessToken>`
- **Versioning**: URI-segment (`/api/v1/...`)
- **Response envelope**:
  ```json
  { "success": true,  "data": { ... } }
  { "success": false, "error": { "code": "STRING", "message": "..." } }
  ```
- **Pagination**: `?page=1&limit=20` returning `{ items, total, page, limit }`
- **Filtering**: `?status=published&search=foo`
- **Sorting**: `?sortBy=createdAt&order=desc`
- **Timestamps**: ISO 8601 in UTC

---

## Testing Strategy

| Layer | Tooling | Scope |
|---|---|---|
| Unit | Jest | Services, validators, guards, math logic |
| Integration | Jest + supertest | HTTP endpoints with mocked Prisma |
| E2E | Jest + supertest | Full module flow (RFQ → Quote → PO → Invoice) |
| Security | Custom scripts | RBAC enforcement, SQL injection, rate limits |
| Lint | ESLint + Prettier | Code style, type safety |

Run the full verification suite:

```bash
npm run prisma:validate
npm run prisma:generate
npm run lint:check
npm run format:check
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
docker build -t vendorbridge-backend .
```

---

## Deployment

A production-ready multi-stage `Dockerfile` is provided in `backend/`:

- **Stage 1** — `node:20.11.0-alpine` builds the application and generates the Prisma client.
- **Stage 2** — A lean runtime image installs Chromium for Puppeteer, copies the compiled output, and runs migrations on container start.

```bash
docker build -t vendorbridge-backend ./backend
docker run -p 3000:3000 --env-file ./backend/.env vendorbridge-backend
```

The same image runs cleanly on ECS, GKE, AKS, or Fly.io. Health checks should target `GET /api/v1/health`.

---

## Screenshots

> Placeholder section. Drop screenshots of the Dashboard, RFQ builder, Quotation Comparison, Approvals inbox, and Reports view into `docs/screenshots/` and link them here.

| Dashboard | RFQ Builder | Comparison |
|:---:|:---:|:---:|
| TBD | TBD | TBD |

| Approvals | Purchase Orders | Reports |
|:---:|:---:|:---:|
| TBD | TBD | TBD |

---

## Documentation

| Document | Description |
|---|---|
| [`PRD.md`](./PRD.md) | Full product requirements, API specs, and database design |
| [`TechStack.md`](./TechStack.md) | Architecture deep-dive, schema, security, and CI/CD |
| [`TODO.md`](./TODO.md) | Granular module-by-module implementation checklist |
| `backend/README.md` | Backend setup, scripts, and verification |
| `frontend/README.md` | Frontend setup and Vite configuration |

---

## Roadmap

- [x] Project scaffolding, tech stack locked, PRD finalized
- [x] Frontend UI for all 10 modules (mock data, design system, layouts)
- [ ] Backend module 1: Auth (RS256 JWT, RBAC, lockouts, recovery)
- [ ] Backend module 2: Dashboard (role-aware aggregates, Redis cache)
- [ ] Backend module 3: Vendors (GST validation, approval workflow)
- [ ] Backend module 4: RFQs (drafts, attachments, publish + cron)
- [ ] Backend module 5: Vendor Quotations (intake, revisions, retraction)
- [ ] Backend module 6: Quotation Comparison (SQL view, ranking)
- [ ] Backend module 7: Approvals (multi-step router)
- [ ] Backend module 8: Purchase Orders & Invoices (PDF, over-invoice guard)
- [ ] Backend module 9: Activity Logs & Notifications (immutable triggers)
- [ ] Backend module 10: Reports & Analytics (async export queue)
- [ ] End-to-end test suite covering the full procurement flow
- [ ] CI/CD pipeline with lint, test, build, and Docker publish

---

## Contributing

This project is currently in active single-team development. External contributions are not yet accepted. Once the first release is cut, contribution guidelines will be added under `CONTRIBUTING.md`.

For local development:

1. Create a feature branch: `git checkout -b feature/<name>`
2. Commit with conventional messages: `feat(rfq): add attachment presign endpoint`
3. Pre-commit hooks run ESLint and Prettier against staged files.
4. Push the branch and open a pull request.

---

## License

This project is **UNLICENSED** and proprietary. All rights reserved. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with discipline, secured by design, optimized for the procurement teams who actually have to ship.

</div>
