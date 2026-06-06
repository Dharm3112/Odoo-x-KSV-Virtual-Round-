# VendorBridge Backend

VendorBridge is a NestJS backend for procurement and vendor management. The application lives in
`backend/` and uses PostgreSQL through PgBouncer, Redis/BullMQ, MinIO, MailDev, ClamAV, Prisma, and
Puppeteer.

## Requirements

- Node.js 20
- npm 10
- Docker with Docker Compose
- OpenSSL for local RS256 key generation

## Local Setup

```bash
cd backend
cp .env.example .env
npm ci
docker compose up -d
npm run prisma:migrate:dev
npm run start:dev
```

The API runs at `http://localhost:3000/api/v1`, Swagger at `http://localhost:3000/docs`, MailDev at
`http://localhost:1080`, and the MinIO console at `http://localhost:9001`.

Compose creates the private `vendorbridge-bucket` automatically. Application database connections
use PgBouncer on host port `6433`; Prisma migrations use PostgreSQL directly on host port `5433`.

## JWT Keys

Generate development-only RS256 keys and place their newline-escaped contents in `.env`:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Never commit `.env`, private keys, or production credentials.

## Verification

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

The readiness endpoint is `GET /api/v1/health`. It reports PostgreSQL, Redis, MinIO, and ClamAV
individually and returns HTTP 503 when any dependency is unavailable.

## Useful Commands

```bash
docker compose ps
docker compose logs -f
npm run prisma:studio
npm run start:debug
```

Pre-commit hooks run ESLint and Prettier against staged backend files through lint-staged.
