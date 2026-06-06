# VendorBridge Backend Implementation Checklist

This checklist tracks backend implementation tasks for the VendorBridge Procurement & Vendor Management ERP. To maintain high detail while keeping a clean workflow, **every module is structured into exactly 3 or 4 major checkpoints**, with granular developer instructions, validation rules, and database specifications nested underneath.

---

## 1. Project Setup & Infrastructure

### [ ] Infrastructure Setup, Containers & Local Development Environment
* **Project Init:** Initialize a NestJS TypeScript application in the repository root. Setup path aliases (`@common/*`, `@modules/*`, `@infra/*`) in `tsconfig.json`.
* **Local Services (Docker Compose):** Configure `docker-compose.yml` with PostgreSQL (v16.1-alpine), Redis (v7.2.4-alpine) for task scheduling/caching, MinIO (S3 API compatible object store), and MailDev (local SMTP mail interceptor on port 1025).
* **Environment Configurations:** Create `.env` and `.env.example` mapping out database connection variables (`DATABASE_URL` for PgBouncer transactions, `DIRECT_URL` for migrations), S3 settings, RS256 JWT keys (`JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`), and mail servers.
* **Linter & Formatter Rules:** Set up standard ESLint parsing and Prettier formatting rules to run automatically before commits.

### [ ] Data Access Layer (Prisma ORM Setup)
* **Schema Definition:** Copy the complete schema definition into `prisma/schema.prisma` mapping out all 14 core tables, enums, indexes, and cascades.
* **DB Client Compilation:** Run `npx prisma generate` to build typesafe TS models.
* **Database Migrations:** Run `npx prisma migrate dev` to generate initial PostgreSQL schema tables, indexes, and primary keys.
* **PgBouncer Configurations:** Configure transaction mode pool mapping in Prisma, ensuring the direct URL is reserved strictly for migration execution.

### [ ] Background Processing Queue & System Helpers
* **BullMQ Initialization:** Configure the NestJS `@nestjs/bullmq` module backed by Redis. Initialize queues for `email-notifications`, `pdf-generation`, and `report-export`. Set standard retry behaviors (exponential backoff, 3 retries max).
* **Antivirus Scanning Stub:** Set up file upload middleware checking mime-types and file size bounds (max 10MB). Write a placeholder service for scanning files (hooked to a ClamAV connection).
* **Email & PDF Engines:** Setup a Nodemailer transporter service and a Puppeteer headless browser wrapper service.
* **Global HTTP Filters:** Implement a global Validation Pipe, Response Interceptor (standardizing outputs to `{ success: true, data: ... }`), and custom Exception Filter.

---

## 2. Login / Signup Module (Module 1)

### [ ] Database Schema & Password Hashing Infrastructure
* **Target Schema:** Enforce fields and enums for `users`, `user_sessions`, and `password_resets`. Apply B-Tree indexes on `users.email` and `users.role`.
* **Hashing Mechanism:** Implement an `argon2` service with Argon2id parameters (64MB memory, 3 iterations, 4 parallelism).
* **Validation Middleware:** Set up validator constraints: `email` must be a valid format; `password` must contain at least 1 uppercase, 1 lowercase, 1 digit, 1 special character, and be a minimum of 8 characters.

### [ ] Authentication Route Lifecycle (`POST /signup`, `/login`, `/refresh-token`, `/logout`)
* **Signup Route:** Define `POST /api/v1/auth/signup` rejecting incoming `vendor` role creation attempts (vendors must register via the Vendor Portal). Validate email uniqueness (return 409 Conflict if taken).
* **Login Route:** Define `POST /api/v1/auth/login` validating active status. Create an RS256 JWT containing claims (`sub: userId`, `email`, `role`). Save refresh token hashes in `user_sessions` and return both tokens.
* **Refresh Token Route:** Define `POST /api/v1/auth/refresh-token` executing token rotation. Invalidate the old refresh token. **Security check:** If a client attempts to reuse an expired/revoked refresh token, immediately delete all active sessions associated with that user ID to prevent compromise.
* **Logout Route:** Define `POST /api/v1/auth/logout` to delete the current session entry from the database.

### [ ] Recovery Workflows, Rate Limiting & Account Lockouts
* **Lockout Protection:** Implement a Redis-based login failure tracker. If an email records 5 failures within 15 minutes, block login attempts for that email for 15 minutes (return 429 Too Many Requests).
* **Forgot Password:** Define `POST /api/v1/auth/forgot-password` generating a 32-byte secure token in `password_resets` (expires in 1 hour). Dispatch email with reset link containing the token (return 200 OK regardless of whether email exists to prevent user enumeration).
* **Reset Password:** Define `POST /api/v1/auth/reset-password` verifying token validity. Update `users.password_hash`, and mark token as used.
* **API Rate Limiting:** Enforce a rate limiter on recovery endpoints (max 3 per hour per IP) and logins (max 10 per minute per IP).

### [ ] Security Access Control & Audit Log Hooks
* **Passport Strategy:** Register a JWT strategy checking RS256 signatures, mapping authorization headers, and loading user details into request context.
* **Guards Mapping:** Build `JwtAuthGuard` and a custom `RolesGuard` using reflection to match route roles (`@Roles(Role.admin)`) against the user's role. Verify the user status is `active` on every request.
* **Audit Triggers:** Dispatch event tracking logs for `USER_SIGNUP`, `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILED`, `USER_LOGOUT`, `PASSWORD_RESET_SUCCESS`. Include IP address and user-agent metadata in logs.

---

## 3. Dashboard Module (Module 2)

### [ ] Aggregate Query Service
* **Summary Endpoint:** Define `GET /api/v1/dashboard/summary` resolving the user role from JWT and executing target counts.
* **Procurement Officer Logic:** Query count of active RFQs (status `published`), pending quotes, recent POs, and unpaid invoices.
* **Vendor Portal Logic:** Scope queries to the user's `vendor_id`. Count assigned RFQs, submitted quotations, and unpaid invoices.
* **Manager & Admin Logic:** Query count of approval steps assigned to their user role, registration requests, and audit logs.

### [ ] Quick Actions Registry Service
* **Dynamic Mapping:** Implement a lookup service that returns a list of actionable routes based on user role:
  * Admin: `['MANAGE_USERS', 'VIEW_AUDIT_LOGS']`
  * Procurement Officer: `['CREATE_RFQ', 'COMPARE_QUOTATIONS', 'GENERATE_PO']`
  * Vendor: `['SUBMIT_QUOTATION', 'CREATE_INVOICE']`
  * Manager: `['APPROVE_REQUEST']`
* **Response payload:** Enforce structured payload outputting action names, HTTP methods, and target endpoint path templates.

### [ ] Analytics Cache Infrastructure
* **Redis Caching:** Set up Redis key mapping for dashboard data aggregates (`dashboard:summary:{userId}`). Configure a 5-minute Time-To-Live (TTL).
* **Cache Invalidation Triggers:** Write event listeners to clear cached dashboard summaries when write actions occur (e.g., when an RFQ is published, quotation is submitted, or PO/invoice is approved).

---

## 4. Vendor Management Module (Module 3)

### [ ] Profile Setup & Database Schema
* **Target Schema:** Enforce schema fields for `vendors` and `vendor_contacts`. Map 1-to-many relationship. Add unique constraints on `vendors.company_name` and `vendors.gst_number`.
* **GST Format Regex:** Implement custom class-validator check verifying Indian GST formatting (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`).
* **Indexes:** Create DB indexes on `vendors.status` and `vendors.category` to optimize search queries.

### [ ] Registration & Profile API Lifecycles
* **Apply Route:** Define `POST /api/v1/vendors` allowing public signups. Save record with status `pending`. Validate email uniqueness across both users and vendor contacts.
* **Query Route:** Define `GET /api/v1/vendors` with pagination parameters (`page`, `limit`) and filters (`category`, `status`, `search` text).
* **Update Route:** Define `PUT /api/v1/vendors/{id}` allowing vendors to update address, phone, and contact details. Validate that the requesting user owns the vendor profile.

### [ ] Verification, Auto-Provisioning & Suspension Workflows
* **Evaluation Route:** Define `PATCH /api/v1/vendors/{id}/status` restricted to Admins.
* **Approved Status Action:** Create a user account in `users` with `vendor` role and email address matching the primary vendor contact email. Set a random password, set a password reset flag, and email details to the vendor.
* **Blacklisted Status Action:** Instantly delete assignment rows for active RFQs, retract all active quotations, and block new bids.
* **Audit Trail:** Log status transitions (`pending -> approved`, `approved -> blacklisted`) with remarks and the approving admin's ID.

---

## 5. RFQ Creation Module (Module 4)

### [ ] RFQ Drafting & Item Specifications
* **Target Schema:** Enforce database models: `rfqs`, `rfq_items`, `rfq_attachments`, `rfq_vendor_assignments`.
* **RFQ Code Generator:** Write a utility to auto-generate codes matching format `RFQ-YYYY-XXXXX` (incremented atomically using a database sequence).
* **Drafting Route:** Define `POST /api/v1/rfqs` setting initial status to `draft`. Validate items array (quantity > 0, unit of measure required). Validate deadline timestamp (must be in the future, minimum +24 hours).

### [ ] File Attachments & S3 Upload Integration
* **Presigned URL Helper:** Implement `GET /api/v1/rfqs/{id}/attachments/presign` generating secure S3 upload links.
* **Upload Action:** Define `POST /api/v1/rfqs/{id}/attachments` saving file metadata (file size, S3 URL, file name) in `rfq_attachments` after checking size limits (max 10MB) and allowed extensions.

### [ ] Assignment, Distribution & Cron Expiry
* **Assignment Route:** Define `POST /api/v1/rfqs/{id}/assign` saving assignments in `rfq_vendor_assignments` (restricted to creator or admin).
* **Publish Action:** Define `POST /api/v1/rfqs/{id}/publish`. Change status to `published`. Enqueue alert tasks to `email-notifications` to notify assigned vendors.
* **Expiry Scheduler:** Setup a cron job running every hour. Update status of `published` RFQs to `closed` if current time exceeds `deadline`.

---

## 6. Vendor Quotation Module (Module 5)

### [ ] Bid Intake & Value Calculations
* **Target Schema:** Enforce database models: `vendor_quotations`, `quotation_items`, `quotation_attachments`.
* **Submission Route:** Define `POST /api/v1/quotations` (Vendor role only).
* **Validation Constraints:** Verify vendor assignment mapping. Verify target RFQ status is `published` and current time is before the deadline.
* **Calculations:** Calculate total items price and overall quotation total price within a single database transaction. Save overall total in `vendor_quotations.total_price`.

### [ ] Revisions & Retraction Workflows
* **Revision Route:** Define `PUT /api/v1/quotations/{id}`. Verify deadline has not passed. Copy current quote data to a history table, update status to `revised`, and increment `revision_number`.
* **Retract Action:** Define `POST /api/v1/quotations/{id}/retract` setting status to `retracted` (allowed only before RFQ deadline).

### [ ] Uploads & Notifications
* **Bid Attachments:** Allow uploading supplementary specification documents to S3 and save references in `quotation_attachments`.
* **Submission Event:** Trigger an event `quotation.submitted` that adds an alert to the creator's dashboard feed.

---

## 7. Quotation Comparison Module (Module 6)

### [ ] Analytical Comparative Database View
* **SQL Compilation:** Create migration establishing SQL view `v_quotation_comparison`.
* **Ranking Logic:** Use window functions:
  * Rank by price: `RANK() OVER (PARTITION BY rfq_id ORDER BY total_price ASC) AS price_rank`
  * Rank by delivery date: `RANK() OVER (PARTITION BY rfq_id ORDER BY delivery_date ASC) AS delivery_rank`
* **Performance Tuning:** Create composite index on `vendor_quotations(rfq_id, status)`.

### [ ] Comparison Fetch API
* **Endpoint:** Define `GET /api/v1/rfqs/{id}/comparison` (Procurement, Manager, and Admin roles only).
* **Validation:** Block requests if target RFQ is active (status `published`) if sealed bidding policy is enabled.
* **Response Processing:** Map rows and identify highlights: set `isLowestPrice: true` for rows with `price_rank = 1`; set `isFastestDelivery: true` for rows with `delivery_rank = 1`.
* **Sorting & Filtering:** Support sorting by `price`, `delivery`, or `rating`.

---

## 8. Approval Workflow Module (Module 7)

### [ ] Workflow Routing Engine
* **Target Schema:** Enforce database models: `approval_workflows` and `approval_steps`.
* **Router Logic:** Implement a service to determine approval steps based on transaction value:
  * PO Amount <= $10,000: Single approval step for Manager role.
  * PO Amount > $10,000: Two-step approval (Step 1: Manager, Step 2: Admin).

### [ ] Processing Actions & State Transitions
* **Evaluation Route:** Define `POST /api/v1/approvals/{id}/action` (Manager or Admin roles).
* **Approval Step Logic:** Verify the actor matches the role requirements for the current step.
  * **Approved:** Complete the active step. If another step exists, set it to pending. If it was the final step, set the workflow to `approved` and transition the linked purchase order status to `approved`.
  * **Rejected:** Set step status to `rejected` (remarks required). Set the workflow and linked purchase order status to `rejected`, and cancel all remaining steps.

### [ ] Approval History Timeline
* **API Details:** Define `GET /api/v1/approvals/{id}/history` returning workflow steps, actions, timestamps, remarks, and user emails.
* **Notifications:** Send email notifications to the assigned role when a new step is activated. Notify the creator when the workflow is completed.

---

## 9. Purchase Order & Invoice Module (Module 8)

### [ ] PO Generation & Item Mapping
* **Target Schema:** Enforce database models: `purchase_orders` and `invoices`.
* **PO Code Auto-Generator:** Generate PO numbers matching pattern `PO-YYYY-XXXXX`.
* **Drafting Route:** Define `POST /api/v1/purchase-orders` (Procurement Officer only). Create PO from approved quotation. Calculate subtotal, tax amount, and net totals. Save with status `draft`.

### [ ] Headless PDF Compilation Worker
* **BullMQ Queue Job:** Trigger a `generate.po.pdf` job after PO creation.
* **PDF Rendering:** Background worker launches a headless Puppeteer browser, renders an HTML template containing PO details, compiles it to an A4 PDF, uploads the file to S3, and saves the S3 URL to `purchase_orders.file_url`.
* **Dispatch Action:** Define `POST /api/v1/purchase-orders/{id}/send` sending the PO PDF download link to the vendor.

### [ ] Invoice Processing & Over-Invoicing Guard
* **Invoice Submit Route:** Define `POST /api/v1/invoices` (Vendor role only) against an approved PO.
* **Reconciliation Check:** Enforce validation check: `sum(invoices.total_amount) <= purchase_orders.total_amount` to prevent over-invoicing.
* **Due Date Check:** Ensure `dueDate` is in the future.
* **Invoice PDF Compilation:** Schedule invoice PDF generation in the background, upload to S3, and save file link reference.

---

## 10. Activity Logs & Notifications Module (Module 9)

### [ ] Immutable Audit Logs
* **Migration Script:** Create a PostgreSQL migration defining trigger function `block_audit_log_modification`.
* **Database Enforcer:** Bind trigger `BEFORE UPDATE OR DELETE ON audit_logs` raising an exception to prevent modification or deletion of audit logs.

### [ ] Event Interceptor & JSON Diff Logs
* **Event Listener:** Implement NestJS event listeners to capture actions (`auth.login`, `rfq.published`, `po.approved`, `invoice.paid`).
* **Diff Tracking:** Implement a service to capture changes (before/after values) and save them to `audit_logs.diff_data` in JSON format.
* **Query API:** Define `GET /api/v1/audit-logs` (Admin only) with filters for actor, entity type, action types, and date range.

### [ ] Notifications System
* **Alert Delivery:** Define `GET /api/v1/notifications` retrieving notifications for the authenticated user.
* **Read Status API:** Define `PATCH /api/v1/notifications/{id}/read` to set `is_read = true`.
* **Data Cleanup:** Set up a cron job to archive in-app notifications older than 90 days.

---

## 11. Reports & Analytics Module (Module 10)

### [ ] Analytics Database View
* **SQL View:** Create migration establishing view `v_vendor_analytics` to calculate:
  * Quote submission rate.
  * Spend totals and average PO values per vendor.
  * Delivery lead times and rating details.

### [ ] Reporting API Handlers
* **Vendor Performance Endpoint:** Define `GET /api/v1/reports/vendor-performance` querying `v_vendor_analytics`.
* **Spend Summary Endpoint:** Define `GET /api/v1/reports/spend-summary` with parameters to group by category or vendor. Normalize query inputs to UTC during aggregation.

### [ ] Asynchronous Report Export Queue
* **Enqueue Export Route:** Define `GET /api/v1/reports/export` enqueuing tasks to `report-export` (return 202 Accepted status).
* **Export Worker:** Background worker queries dataset, compiles CSV/Excel file, uploads it to S3, and sends a notification containing the S3 download link to the user.

---

## 12. Verification & Testing

### [ ] Unit Test Suites
* **Auth tests:** Validate password hashing, token validation, and IP lockout logic.
* **Transaction Math tests:** Test PO tax calculation logic and invoice threshold checks.
* **Approval Router tests:** Verify step routing based on transaction value thresholds.

### [ ] Integration E2E Test Scenarios
* **Integration Flows:** Implement E2E test scripts for the end-to-end workflow:
  * Admin user registers and approves a vendor.
  * Procurement Officer creates and publishes an RFQ.
  * Vendor user logs in, submits a quotation, and updates a revision.
  * Procurement Officer runs comparison, selects quotation, and triggers approval workflow.
  * Manager approves the step, transitioning the PO to approved status.
  * Vendor receives the PO and creates an invoice.

### [ ] Security Audits & Code Scans
* **Database Checks:** Verify that SQL queries are parameterized (via Prisma client) to prevent injection vulnerabilities.
* **Access Control Audits:** Write tests to confirm that unauthorized roles are blocked from accessing restricted endpoints (e.g., verifying vendors cannot query audit logs or other vendors' comparative data).
