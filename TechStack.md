# VendorBridge: Backend Technical Stack & Architecture Design

---

# Document Metadata
* **Project Name:** VendorBridge ERP
* **Document Version:** 1.0.0
* **Target Audience:** Backend Engineers, Database Architects, QA Engineers, DevOps Engineers
* **Author:** Backend Technical Lead & Solution Architect

---

# 1. Introduction & Architectural Patterns

VendorBridge is built using a **Modular Monolith** architecture with **Clean Architecture** patterns within each module. This guarantees domain isolation, makes it easy to refactor code, and allows for a smooth path to microservices if needed later.

## 1.1 Architectural Layers
Each NestJS module is divided into three layers:
1. **Interface Adapter Layer (API Layer):** Controllers handling HTTP requests, mapping DTOs, parsing route paths, and performing validation.
2. **Domain/Service Layer (Business Logic):** Core business logic, status validators, state transition management, and validation checks. Contains pure domain logic independent of external databases or transport mechanisms.
3. **Infrastructure/Data Access Layer:** Handles database persistence, storage wrappers, cache integrations, queue consumers, and external API requests.

```
       +---------------------------------------------+
       |                  HTTP Request               |
       +----------------------|----------------------+
                              v
       +---------------------------------------------+
       |         NestJS Routing & Guard Layer        |
       |      - Validates JWT, Roles, Rate Limits     |
       +----------------------|----------------------+
                              v
+-------------------------------------------------------------+
| MODULE BOUNDARY                                             |
|                                                             |
|   +-----------------------------------------------------+   |
|   | Controller (API Layer)                              |   |
|   | - Parses payloads and queries using class-validator |   |
|   +-------------------------|---------------------------+   |
|                             v                               |
|   +-----------------------------------------------------+   |
|   | Service (Business/Domain Layer)                     |   |
|   | - Checks state, handles workflows, runs logic       |   |
|   +-------------------------|---------------------------+   |
|                             v                               |
|   +-----------------------------------------------------+   |
|   | Repository/ORM (Infrastructure Layer)               |   |
|   | - Prisma ORM database operations                    |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

## 1.2 Inter-Module Communication Guidelines
1. **Synchronous Communication:** Direct service-to-service injection is allowed **only** when referencing read-only data (e.g., `UserService` checking user permissions within `RfqService`). Circular dependencies must be avoided by extracting shared interfaces into a `Common` module.
2. **Asynchronous Communication (Decoupled Workflows):** State transitions or transactional events must publish domain events via a local Event Bus (e.g., NestJS `EventEmitter2`) or a background task queue (e.g., `BullMQ`). For example, when a PO is approved, an event `po.approved` is published, triggering background tasks for PDF generation and vendor notification.

---

# 2. Detailed Tech Stack Components

```
+------------------+---------------------------------------------------------------------------------+
| Component        | Technology Selection                                                            |
+------------------+---------------------------------------------------------------------------------+
| Runtime          | Node.js v20.11.0 (LTS)                                                          |
| Language         | TypeScript v5.3.3                                                               |
| Framework        | NestJS v10.3.0                                                                  |
| Database         | PostgreSQL v16.1                                                                |
| Database ORM     | Prisma v5.9.0                                                                   |
| Database Pooler  | PgBouncer v1.21.0 (Session pooling for migrations, Transaction for app servers) |
| Cache & KV Store | Redis v7.2.4                                                                    |
| Task Queue       | BullMQ v5.1.0                                                                   |
| Object Storage   | AWS S3 or MinIO (local dev S3-compatible API)                                   |
| PDF Engine       | Puppeteer v21.9.0 (HTML-to-PDF rendering in a headless browser)                  |
| Mail Dispatch    | Nodemailer v6.9.9 via AWS SES                                                   |
+------------------+---------------------------------------------------------------------------------+
```

---

# 3. Project & Package Configuration

Below is the required `package.json` setup for the backend application:

### `package.json`
```json
{
  "name": "vendorbridge-backend",
  "version": "1.0.0",
  "description": "Backend ERP Engine for VendorBridge",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.513.0",
    "@aws-sdk/s3-request-presigner": "^3.513.0",
    "@nestjs/bullmq": "^10.1.0",
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.3.0",
    "@nestjs/event-emitter": "^2.0.3",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/swagger": "^7.2.0",
    "@nestjs/terminus": "^10.2.0",
    "@prisma/client": "^5.9.0",
    "argon2": "^0.31.2",
    "bullmq": "^5.1.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "dotenv": "^16.4.1",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "nodemailer": "^6.9.9",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "puppeteer": "^21.9.0",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^5.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.11.10",
    "@types/nodemailer": "^6.4.14",
    "@types/passport-jwt": "^4.0.1",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.19.1",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "jest": "^29.7.0",
    "prettier": "^3.2.4",
    "prisma": "^5.9.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@common/*": ["src/common/*"],
      "@modules/*": ["src/modules/*"],
      "@infra/*": ["src/infrastructure/*"]
    }
  }
}
```

---

# 4. Backend Directory Structure

Below is the structured layout for the NestJS workspace.

```
src/
├── main.ts                       # App bootstrapping entry point
├── app.module.ts                 # Global root NestJS module imports
├── common/                       # Shared decorators, exceptions, and global guards
│   ├── decorators/
│   │   ├── roles.decorator.ts    # RBAC decorator
│   │   └── user.decorator.ts     # Extracted user entity details
│   ├── dto/                      # Common interface DTOs
│   ├── exceptions/               # Custom global HTTP Exception filters
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     # Token verification guard
│   │   └── roles.guard.ts        # Role-based authorization guard
│   └── interceptors/             # Logging and serialization interceptors
├── infrastructure/               # Common external interface abstractions
│   ├── database/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts     # Prisma connection instance
│   ├── storage/                  # AWS S3 file upload integration
│   ├── mail/                     # Nodemailer configuration service
│   ├── pdf/                      # Puppeteer PDF compiler wrapper
│   └── logger/                   # Winston JSON logger instance
└── modules/                      # Business domain modular units
    ├── auth/                     # Module 1
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── dto/
    ├── dashboard/                # Module 2
    ├── vendors/                  # Module 3
    ├── rfqs/                     # Module 4
    ├── quotations/               # Module 5 & 6
    ├── approvals/                # Module 7
    ├── purchase-orders/          # Module 8 (Part 1)
    ├── invoices/                 # Module 8 (Part 2)
    ├── activity-logs/            # Module 9
    └── reports/                  # Module 10
```

---

# 5. Database Strategy & Schema Configuration

## 5.1 Prisma Configuration (`prisma/schema.prisma`)
The file below defines the database design specified in the PRD, enforcing PostgreSQL constraints, foreign keys, and indexes.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  admin
  procurement_officer
  manager
  vendor
}

enum UserStatus {
  active
  inactive
  suspended
}

enum VendorStatus {
  pending
  approved
  rejected
  blacklisted
}

enum RfqStatus {
  draft
  published
  closed
  cancelled
}

enum QuotationStatus {
  draft
  submitted
  revised
  retracted
  accepted
  rejected
}

enum ApprovalStatus {
  pending
  approved
  rejected
}

enum PoStatus {
  draft
  pending_approval
  approved
  sent_to_vendor
  delivered
  cancelled
}

enum InvoiceStatus {
  unpaid
  paid
  void
  overdue
}

model User {
  id           String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email        String        @unique @db.VarChar(255)
  passwordHash String        @map("password_hash") @db.VarChar(255)
  firstName    String        @map("first_name") @db.VarChar(100)
  lastName     String        @map("last_name") @db.VarChar(100)
  role         Role
  status       UserStatus    @default(active)
  createdAt    DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  
  sessions       UserSession[]
  passwordResets PasswordReset[]
  createdRfqs    Rfq[]           @relation("RfqCreator")
  actionedSteps  ApprovalStep[]  @relation("StepActionedBy")
  assignedSteps  ApprovalStep[]  @relation("StepAssignedUser")
  purchaseOrders PurchaseOrder[] @relation("PoCreator")
  auditLogs      AuditLog[]      @relation("LogActor")

  @@map("users")
  @@index([email, role])
}

model UserSession {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId           String   @map("user_id") @db.Uuid
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshTokenHash String   @unique @map("refresh_token_hash") @db.VarChar(255)
  ipAddress        String   @map("ip_address") @db.VarChar(45)
  userAgent        String?  @map("user_agent") @db.VarChar(255)
  expiresAt        DateTime @map("expires_at") @db.Timestamptz
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("user_sessions")
}

model PasswordReset {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  resetTokenHash String   @unique @map("reset_token_hash") @db.VarChar(255)
  expiresAt      DateTime @map("expires_at") @db.Timestamptz
  isUsed         Boolean  @default(false) @map("is_used")

  @@map("password_resets")
}

model Vendor {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyName String       @unique @map("company_name") @db.VarChar(255)
  gstNumber   String       @unique @map("gst_number") @db.VarChar(15)
  status      VendorStatus @default(pending)
  category    String       @db.VarChar(100)
  rating      Decimal      @default(0.00) @db.Decimal(3, 2)
  address     String       @db.Text
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  contacts   VendorContact[]
  rfqInvites RfqVendorAssignment[]
  quotations VendorQuotation[]
  pos        PurchaseOrder[]
  invoices   Invoice[]

  @@map("vendors")
  @@index([status, category])
}

model VendorContact {
  id        String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  vendorId  String  @map("vendor_id") @db.Uuid
  vendor    Vendor  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  firstName String  @map("first_name") @db.VarChar(100)
  lastName  String  @map("last_name") @db.VarChar(100)
  email     String  @unique @db.VarChar(255)
  phone     String  @db.VarChar(20)
  isPrimary Boolean @default(true) @map("is_primary")

  @@map("vendor_contacts")
}

model Rfq {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rfqCode     String    @unique @map("rfq_code") @db.VarChar(50)
  title       String    @db.VarChar(255)
  description String?   @db.Text
  deadline    DateTime  @db.Timestamptz
  status      RfqStatus @default(draft)
  createdBy   String    @map("created_by") @db.Uuid
  creator     User      @relation("RfqCreator", fields: [createdBy], references: [id])
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  items       RfqItem[]
  attachments RfqAttachment[]
  assignments RfqVendorAssignment[]
  quotations  VendorQuotation[]

  @@map("rfqs")
  @@index([status, deadline])
}

model RfqItem {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rfqId       String   @map("rfq_id") @db.Uuid
  rfq         Rfq      @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  itemName    String   @map("item_name") @db.VarChar(255)
  description String?  @db.Text
  quantity    Decimal  @db.Decimal(12, 4)
  uom         String   @db.VarChar(20)

  quotationItems QuotationItem[]

  @@map("rfq_items")
}

model RfqVendorAssignment {
  rfqId    String   @map("rfq_id") @db.Uuid
  rfq      Rfq      @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  vendorId String   @map("vendor_id") @db.Uuid
  vendor   Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@id([rfqId, vendorId])
  @@map("rfq_vendor_assignments")
}

model RfqAttachment {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rfqId          String   @map("rfq_id") @db.Uuid
  rfq            Rfq      @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  fileName       String   @map("file_name") @db.VarChar(255)
  fileUrl        String   @map("file_url") @db.VarChar(512)
  fileSizeBytes  Int      @map("file_size_bytes")
  uploadedAt     DateTime @default(now()) @map("uploaded_at") @db.Timestamptz

  @@map("rfq_attachments")
}

model VendorQuotation {
  id             String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rfqId          String          @map("rfq_id") @db.Uuid
  rfq            Rfq             @relation(fields: [rfqId], references: [id], onDelete: Restrict)
  vendorId       String          @map("vendor_id") @db.Uuid
  vendor         Vendor          @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  status         QuotationStatus @default(draft)
  totalPrice     Decimal         @map("total_price") @db.Decimal(14, 2)
  deliveryDate   DateTime        @map("delivery_date") @db.Date
  revisionNumber Int             @default(0) @map("revision_number")
  vendorNotes    String?         @map("vendor_notes") @db.Text
  createdAt      DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime        @updatedAt @map("updated_at") @db.Timestamptz

  items          QuotationItem[]
  attachments    QuotationAttachment[]
  purchaseOrder  PurchaseOrder?

  @@map("vendor_quotations")
  @@index([rfqId, status])
}

model QuotationItem {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quotationId     String          @map("quotation_id") @db.Uuid
  quotation       VendorQuotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  rfqItemId       String          @map("rfq_item_id") @db.Uuid
  rfqItem         RfqItem         @relation(fields: [rfqItemId], references: [id], onDelete: Restrict)
  unitPrice       Decimal         @map("unit_price") @db.Decimal(12, 2)
  taxPercentage   Decimal         @default(0.00) @map("tax_percentage") @db.Decimal(5, 2)
  totalItemPrice  Decimal         @map("total_item_price") @db.Decimal(14, 2)

  @@map("quotation_items")
}

model QuotationAttachment {
  id          String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quotationId String          @map("quotation_id") @db.Uuid
  quotation   VendorQuotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  fileName    String          @map("file_name") @db.VarChar(255)
  fileUrl     String          @map("file_url") @db.VarChar(512)
  uploadedAt  DateTime        @default(now()) @map("uploaded_at") @db.Timestamptz

  @@map("quotation_attachments")
}

model ApprovalWorkflow {
  id         String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  entityType String         @map("entity_type") @db.VarChar(50)
  entityId   String         @map("entity_id") @db.Uuid
  status     ApprovalStatus @default(pending)
  currentStep Int           @default(1) @map("current_step")
  createdAt  DateTime       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime       @updatedAt @map("updated_at") @db.Timestamptz

  steps      ApprovalStep[]

  @@map("approval_workflows")
  @@index([entityType, entityId])
}

model ApprovalStep {
  id             String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workflowId     String         @map("workflow_id") @db.Uuid
  workflow       ApprovalWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  stepNumber     Int            @map("step_number")
  assignedRole   Role           @map("assigned_role")
  assignedUserId String?        @map("assigned_user_id") @db.Uuid
  assignedUser   User?          @relation("StepAssignedUser", fields: [assignedUserId], references: [id])
  status         ApprovalStatus @default(pending)
  remarks        String?        @db.Text
  actionedBy     String?        @map("actioned_by") @db.Uuid
  actor          User?          @relation("StepActionedBy", fields: [actionedBy], references: [id])
  actionedAt     DateTime?      @map("actioned_at") @db.Timestamptz

  @@map("approval_steps")
}

model PurchaseOrder {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  poNumber    String   @unique @map("po_number") @db.VarChar(50)
  quotationId String   @unique @map("quotation_id") @db.Uuid
  quotation   VendorQuotation @relation(fields: [quotationId], references: [id], onDelete: Restrict)
  vendorId    String   @map("vendor_id") @db.Uuid
  vendor      Vendor   @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  status      PoStatus @default(draft)
  subtotal    Decimal  @db.Decimal(14, 2)
  taxAmount   Decimal  @map("tax_amount") @db.Decimal(14, 2)
  totalAmount Decimal  @map("total_amount") @db.Decimal(14, 2)
  createdBy   String   @map("created_by") @db.Uuid
  creator     User     @relation("PoCreator", fields: [createdBy], references: [id])
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz

  invoices    Invoice[]

  @@map("purchase_orders")
  @@index([status])
}

model Invoice {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invoiceNumber   String        @unique @map("invoice_number") @db.VarChar(50)
  purchaseOrderId String        @map("purchase_order_id") @db.Uuid
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Restrict)
  vendorId        String        @map("vendor_id") @db.Uuid
  vendor          Vendor        @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  status          InvoiceStatus @default(unpaid)
  subtotal        Decimal       @db.Decimal(14, 2)
  taxAmount       Decimal       @map("tax_amount") @db.Decimal(14, 2)
  totalAmount     Decimal       @map("total_amount") @db.Decimal(14, 2)
  dueDate         DateTime      @map("due_date") @db.Date
  paidAt          DateTime?     @map("paid_at") @db.Timestamptz
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime      @updatedAt @map("updated_at") @db.Timestamptz

  @@map("invoices")
}

model Notification {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  recipientId String   @map("recipient_id") @db.Uuid
  user        User     @relation(fields: [recipientId], references: [id], onDelete: Cascade)
  title       String   @db.VarChar(255)
  message     String   @db.Text
  type        String   @db.VarChar(50)
  isRead      Boolean  @default(false) @map("is_read")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("notifications")
  @@index([recipientId, isRead])
}

model AuditLog {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  actorId    String?  @map("actor_id") @db.Uuid
  actor      User?    @relation("LogActor", fields: [actorId], references: [id], onDelete: SetNull)
  action     String   @db.VarChar(100)
  entityType String   @map("entity_type") @db.VarChar(50)
  entityId   String   @map("entity_id") @db.Uuid
  diffData   Json?    @map("diff_data")
  ipAddress  String   @map("ip_address") @db.VarChar(45)
  userAgent  String?  @map("user_agent") @db.VarChar(255)
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("audit_logs")
}
```

## 5.2 Database Connection Optimization (PgBouncer Configuration)
Prisma is configured to interact with PgBouncer. Under `session` scaling constraints:
1. Direct connection config is used only for migrations (via `DIRECT_URL` in `.env`).
2. PgBouncer transaction-mode url is configured under standard `DATABASE_URL` (requires appending `?pgbouncer=true` to query parameter configurations).

```
# .env Configuration
DATABASE_URL="postgresql://db_user:password@pgbouncer_host:6432/vendorbridge?pgbouncer=true&schema=public"
DIRECT_URL="postgresql://db_user:password@db_host:5432/vendorbridge?schema=public"
```

---

# 6. API Security & Integrity Enforcement

## 6.1 Authentication (RS256 JWT Strategy)
We use asymmetric signing (RS256) for user sessions to ensure the signature cannot be forged even if the verification key is leaked.

### Key Generation Instructions:
```bash
# Generate private key
openssl genrsa -out private.pem 2048
# Extract public key
openssl rsa -in private.pem -pubout -out public.pem
```

* **Access Token Payload Schema:**
```json
{
  "sub": "user-uuid-here",
  "email": "officer.john@vendorbridge.com",
  "role": "procurement_officer",
  "iss": "vendorbridge-auth",
  "iat": 1717670400,
  "exp": 1717671300
}
```

## 6.2 Password Hashing Parameters (Argon2id)
We use `argon2` inside the signup flow, configured with strong hashing defaults:
* `argon2.argon2id` mode.
* Memory limit: 65,536 KB (64 MB).
* Time cost (iterations): 3.
* Parallelism: 4 threads.

## 6.3 Security Middleware Configuration
To prevent vulnerabilities, standard Express middleware is registered within `main.ts`:
* **Helmet:** Configures standard HTTP headers (e.g., CSP, HSTS, Frame Options).
* **Rate Limiting:** Enforced via `nestjs-rate-limiter` backed by Redis:
  * Authentication endpoints: 10 requests per 1-minute window per IP.
  * Standard API endpoints: 100 requests per 1-minute window per IP.

---

# 7. Task Queue & Background Workflows

We use **BullMQ** to process intensive workflows asynchronously, ensuring fast response times for HTTP requests.

```
                  +--------------------------------+
                  |  HTTP Request Thread           |
                  |  (e.g., POST PO generation)    |
                  +---------------+----------------+
                                  |
                                  | Publishes Job
                                  v
                  +---------------+----------------+
                  |  Redis Storage (BullMQ Queue)  |
                  +---------------+----------------+
                                  |
                                  | Pulls Job
                                  v
                  +---------------+----------------+
                  |  Background Worker Thread      |
                  |  (Puppeteer renders PDF)       |
                  +--------------------------------+
```

## 7.1 Queue Classifications
1. `email-notifications`: Sends transaction emails, vendor alerts, and reminders via AWS SES.
2. `pdf-generation`: Launches Puppeteer, renders POs and invoices into static HTML, and compiles them to PDF.
3. `report-export`: Processes massive dataset aggregates, builds CSV/Excel formats, and uploads files to object storage.

## 7.2 Worker Implementation Example (`pdf-generation.consumer.ts`)
```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import puppeteer from 'puppeteer';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

@Processor('pdf-generation')
export class PdfGenerationConsumer extends WorkerHost {
  private s3Client = new S3Client({ region: process.env.AWS_REGION });

  async process(job: Job<{ entityId: string; type: 'po' | 'invoice' }>): Promise<string> {
    const { entityId, type } = job.data;
    
    // 1. Launch headless browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();
      
      // 2. Load dynamic HTML template (using raw internal routing API or string interpolation)
      const templateHtml = await this.compileHtmlTemplate(entityId, type);
      await page.setContent(templateHtml, { waitUntil: 'networkidle0' });
      
      // 3. Print PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
      
      // 4. Upload to secure S3 storage
      const bucketName = process.env.AWS_S3_BUCKET_NAME!;
      const key = `${type}s/${entityId}-${Date.now()}.pdf`;
      
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
        },
      });
      
      await upload.done();
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    } finally {
      await browser.close();
    }
  }

  private async compileHtmlTemplate(entityId: string, type: 'po' | 'invoice'): Promise<string> {
    // Queries database details and renders them in HTML string format
    return `<html><body><h1>${type.toUpperCase()} - ID: ${entityId}</h1></body></html>`;
  }
}
```

---

# 8. Logging, Auditing & Monitoring Specification

## 8.1 Database Immutability (Audit Trigger Engine)
To prevent tampering with audit logs, the database level blocks modifications (`UPDATE` or `DELETE`) on the `audit_logs` table.

```sql
-- Migration file adding immutable trigger logic
CREATE OR REPLACE FUNCTION block_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Modification or deletion of audit logs is strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_audit_log_immutability
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION block_audit_log_modification();
```

## 8.2 Application Metric Export
We use `nestjs-prometheus` to expose core system metrics at the `/metrics` endpoint. This allows Prometheus to scrape application state data.
* **Tracked Metrics:**
  * Active DB connection count.
  * API call duration (grouped by method and status code).
  * BullMQ job execution latencies.

---

# 9. CI/CD & Deployment Configurations

## 9.1 Multi-Stage Docker Build (`Dockerfile`)
```dockerfile
# --- Stage 1: Build dependency assets ---
FROM node:20.11.0-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

# --- Stage 2: Production Execution Environment ---
FROM node:20.11.0-alpine AS runner
WORKDIR /app

# Install dependencies required by Puppeteer (Chromium engine)
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      openssl

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Run migrations and start app
CMD ["sh", "-c", "npm run prisma:migrate && node dist/main.js"]
```

## 9.2 Local Development Environment (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16.1-alpine
    container_name: vendorbridge_postgres
    environment:
      POSTGRES_DB: vendorbridge
      POSTGRES_USER: db_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U db_user -d vendorbridge"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.2.4-alpine
    container_name: vendorbridge_redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:RELEASE.2024-01-28T22-40-50Z
    container_name: vendorbridge_minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_password
    volumes:
      - miniodata:/data
    command: server /data --console-address ":9001"

  maildev:
    image: maildev/maildev:2.1.0
    container_name: vendorbridge_maildev
    ports:
      - "1025:1025" # SMTP server
      - "1080:1080" # Web interface to view emails

volumes:
  pgdata:
  redisdata:
  miniodata:
```
