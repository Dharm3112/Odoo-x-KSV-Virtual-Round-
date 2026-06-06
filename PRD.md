# VendorBridge: Product Requirements Document (PRD)
## Centralized Procurement & Vendor Management ERP (Backend Specification)

---

# Document Metadata
* **Project Name:** VendorBridge ERP
* **Document Version:** 1.0.0
* **Date:** June 6, 2026
* **Status:** Draft for Review
* **Target Audience:** Backend Engineers, Database Architects, QA Engineers, System Architects, Stakeholders
* **Author:** Senior Product Manager & Backend Technical Lead

---

# Document Overview

VendorBridge is an enterprise-grade Procurement & Vendor Management ERP designed to automate, digitize, and secure the end-to-end procurement lifecycle. This document outlines the backend specifications, database architecture, API designs, security requirements, and overall system architecture for the initial backend-only phase. All frontend references are omitted as the user interface will be developed in a subsequent phase.

---

# Table of Contents
1. [Login / Signup Module](#1-login--signup-module)
2. [Dashboard Module](#2-dashboard-module)
3. [Vendor Management Module](#3-vendor-management-module)
4. [RFQ Creation Module](#4-rfq-creation-module)
5. [Vendor Quotation Module](#5-vendor-quotation-module)
6. [Quotation Comparison Module](#6-quotation-comparison-module)
7. [Approval Workflow Module](#7-approval-workflow-module)
8. [Purchase Order & Invoice Module](#8-purchase-order--invoice-module)
9. [Activity Logs & Notifications Module](#9-activity-logs--notifications-module)
10. [Reports & Analytics Module](#10-reports--analytics-module)
11. [System Design Section](#system-design-section)

---

# 1. Login / Signup Module

## 1.1 Module Overview
* **Purpose:** Serves as the gateway for security, authentication, and user provisioning within the VendorBridge ERP.
* **Business Objective:** Ensure secure registration, identity verification, password recovery, session handling, and role-based access mapping.

## 1.2 Functional Requirements
* **User Signup:** Allows new users (Procurement Officers, Managers, Admins) to register. Vendors register via a separate self-service flow.
* **User Login:** Authenticates users using Email and Password, generating secure stateless JSON Web Tokens (JWT).
* **Forgot/Reset Password:** Allows users to request password reset links. Sends a short-lived token to the user's email.
* **Session Management:** Generates access and refresh tokens. Tracks sessions in the database to allow remote logout and block compromised sessions.
* **Role Verification:** Validates user roles upon every request to enforce authorization.

## 1.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Self Signup | ✔ | ✔ | ✔ | ✔ (Pending Admin Approval) |
| Manage User Roles | ✔ | ✖ | ✖ | ✖ |
| Force Deactivate User | ✔ | ✖ | ✖ | ✖ |
| Reset Password (Self) | ✔ | ✔ | ✔ | ✔ |

## 1.4 Database Design

### Table: `users`
Represents all system users.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `email` (VARCHAR(255)): Unique, indexed, not null
* `password_hash` (VARCHAR(255)): Not null (Argon2id format)
* `first_name` (VARCHAR(100)): Not null
* `last_name` (VARCHAR(100)): Not null
* `role` (VARCHAR(50)): Not null (Constraint: 'admin', 'procurement_officer', 'manager', 'vendor')
* `status` (VARCHAR(20)): Not null, default 'active' (Constraint: 'active', 'inactive', 'suspended')
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`
* `updated_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `user_sessions`
Tracks active sessions to facilitate token revocation.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `user_id` (UUID): Foreign Key references `users(id)` ON DELETE CASCADE
* `refresh_token_hash` (VARCHAR(255)): Unique, not null
* `ip_address` (VARCHAR(45)): Not null
* `user_agent` (VARCHAR(255)): Nullable
* `expires_at` (TIMESTAMP WITH TIME ZONE): Not null
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `password_resets`
Tracks password reset requests.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `user_id` (UUID): Foreign Key references `users(id)` ON DELETE CASCADE
* `reset_token_hash` (VARCHAR(255)): Unique, not null
* `expires_at` (TIMESTAMP WITH TIME ZONE): Not null
* `is_used` (BOOLEAN): Default false, not null

## 1.5 API Design

### 1.5.1 POST `/api/v1/auth/signup`
* **Method:** `POST`
* **Request Payload:**
```json
{
  "email": "officer.john@vendorbridge.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "procurement_officer"
}
```
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "officer.john@vendorbridge.com",
    "role": "procurement_officer",
    "status": "active"
  }
}
```
* **Validation Rules:**
  * `email` must be a valid email format, string, required, unique.
  * `password` must be minimum 8 characters, containing 1 uppercase, 1 lowercase, 1 number, 1 special character.
  * `role` must be one of: 'admin', 'procurement_officer', 'manager'. (Vendors register via the Vendor module API).
* **Error Responses:**
  * **400 Bad Request:** Payload validation failed.
  * **409 Conflict:** Email already exists in the system.

### 1.5.2 POST `/api/v1/auth/login`
* **Method:** `POST`
* **Request Payload:**
```json
{
  "email": "officer.john@vendorbridge.com",
  "password": "SecurePassword123!"
}
```
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5YjFkZ...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5YjFkZ...",
    "user": {
      "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "officer.john@vendorbridge.com",
      "role": "procurement_officer",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```
* **Validation Rules:**
  * `email` must be valid email, required.
  * `password` must be string, required.
* **Error Responses:**
  * **401 Unauthorized:** Invalid credentials or inactive/suspended user.
  * **429 Too Many Requests:** Account locked due to too many failed login attempts.

### 1.5.3 POST `/api/v1/auth/forgot-password`
* **Method:** `POST`
* **Request Payload:**
```json
{
  "email": "officer.john@vendorbridge.com"
}
```
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent."
}
```
* **Validation Rules:**
  * `email` must be valid email, required.
* **Error Responses:** No direct indication if the email exists (prevents user enumeration). 200 returned in both cases.

### 1.5.4 POST `/api/v1/auth/reset-password`
* **Method:** `POST`
* **Request Payload:**
```json
{
  "token": "reset_token_here_abc123",
  "newPassword": "NewSecurePassword456!"
}
```
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful."
}
```
* **Validation Rules:**
  * `token` is string, required.
  * `newPassword` satisfies strength criteria.
* **Error Responses:**
  * **400 Bad Request:** Token expired, invalid, or already used.

### 1.5.5 POST `/api/v1/auth/logout`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request Payload:** None
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out."
}
```
* **Error Responses:**
  * **401 Unauthorized:** Invalid or missing token.

## 1.6 Business Logic
* **Argon2id Hashing:** Password hashes generated with salt length 16 bytes, memory cost 65536 KB, iteration count 3, parallelism 4.
* **Brute-Force Lockout:** Track login failures against an email. After 5 failures within 15 minutes, block login attempts for that email for 15 minutes. Record block time in Redis.
* **Session Lifecycle:** 
  * Access token valid for 15 minutes.
  * Refresh token valid for 7 days.
  * When refreshing a session, execute token rotation (issue new access and refresh tokens, invalidate the old refresh token in `user_sessions`).

## 1.7 Notifications
* **Password Reset Request:**
  * Event: `auth.password_reset_requested`
  * Recipient: User Email
  * Channel: Email (containing reset token url)
* **Account Lockout:**
  * Event: `auth.account_locked`
  * Recipient: User Email
  * Channel: Email notification alerting security threat

## 1.8 Audit Logging
* **Actions Logged:** `USER_SIGNUP`, `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILED`, `USER_LOGOUT`, `PASSWORD_RESET_REQUEST`, `PASSWORD_RESET_SUCCESS`.
* **Metadata Store:** `user_id`, `ip_address`, `user_agent`, `timestamp`.

## 1.9 Security Requirements
* **Transport Level:** HTTPS TLS 1.3 only.
* **Storage Encryption:** Enforce bcrypt or Argon2id for password hashes. No raw passwords stored or logged.
* **Rate Limiting:** `/api/v1/auth/login` rate limited to 10 requests per minute per IP. `/api/v1/auth/forgot-password` rate limited to 3 requests per hour per IP.

## 1.10 Edge Cases
* **Token Reuse Attack:** If an attacker attempts to reuse an invalidated refresh token, invalidate all active sessions for that user immediately (indicates compromise).
* **Clock Drift:** Issue tokens with dynamic `issued_at` and verify within 60 seconds of tolerance.
* **Inactive Users:** If user status is updated to `inactive` or `suspended` in `users` table, instantly drop all active sessions from the database and reject incoming access tokens via cache blacklist check.

---

# 2. Dashboard Module

## 2.1 Module Overview
* **Purpose:** Serves as the information aggregation hub for the system.
* **Business Objective:** Deliver dynamic statistics, outstanding action counts, and quick-action access points filtered by user role.

## 2.2 Functional Requirements
* **Metrics Aggregation:** Computes metrics (active RFQs, pending approvals, recent POs, total invoices) dynamically.
* **Activity Highlights:** Fetches the most recent operations for rapid navigation.
* **Quick Actions Registry:** Generates list of actions (e.g., "Create RFQ", "Submit Quotation", "Approve PO") based on user roles.

## 2.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| View Admin Summary | ✔ | ✖ | ✖ | ✖ |
| View Procurement Dashboard | ✖ | ✔ | ✖ | ✖ |
| View Approval Queue Summary | ✖ | ✖ | ✔ | ✖ |
| View Vendor Portal Dashboard | ✖ | ✖ | ✖ | ✔ |

## 2.4 Database Design
No specific tables. This module queries views or reads aggregated indices on existing tables (`rfqs`, `vendor_quotations`, `purchase_orders`, `invoices`, `approval_steps`).

## 2.5 API Design

### 2.5.1 GET `/api/v1/dashboard/summary`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response Payload (200 OK - Procurement Officer Role):**
```json
{
  "success": true,
  "data": {
    "role": "procurement_officer",
    "metrics": {
      "activeRfqsCount": 12,
      "pendingQuotationsCount": 45,
      "recentPosIssuedCount": 8,
      "pendingInvoicesCount": 3
    },
    "recentActivity": [
      {
        "activityId": "d05d76d4-8d4e-4f01-9f93-13835e0766ef",
        "description": "Quotation submitted by Vendor ACME for RFQ #RFQ-2026-003",
        "timestamp": "2026-06-06T09:12:00Z"
      }
    ],
    "quickActions": [
      {
        "actionName": "CREATE_RFQ",
        "endpoint": "/api/v1/rfqs",
        "method": "POST"
      },
      {
        "actionName": "COMPARE_QUOTATIONS",
        "endpoint": "/api/v1/rfqs/{rfqId}/comparison",
        "method": "GET"
      }
    ]
  }
}
```
* **Validation Rules:** Role determined by authorization token.
* **Error Responses:**
  * **401 Unauthorized:** Invalid token.

## 2.6 Business Logic
* **Dynamic Role Filtering:** The dashboard handler calls role-specific query methods.
  * *Procurement Officer:* Queries active RFQs, recently drafted POs, pending quotations.
  * *Vendor:* Queries assigned RFQs, submitted quotations, unpaid invoices.
  * *Manager:* Queries pending approval steps assigned to their user role.
  * *Admin:* Queries user signup requests, vendor registration queue, audit alerts.
* **Caching Layer:** Dashboard metrics cached in Redis with a 5-minute Time-To-Live (TTL). Invalidate cache on write operations (e.g., when a new RFQ is created or PO approved).

## 2.7 Notifications
None triggered directly by dashboard access.

## 2.8 Audit Logging
* **Actions Logged:** None (read-only view). However, API request log records the access endpoint.

## 2.9 Security Requirements
* **Authorization:** Role check is strictly performed on the middleware level before executing dashboard aggregation.
* **Data Scoping:** Ensure Vendors cannot see system-wide financial statistics; they can only query records associated with their `vendor_id`.

## 2.10 Edge Cases
* **Zero Records Initial State:** If a new user logs in, ensure the backend doesn't crash or return nulls; it must return `0` for all metrics and empty lists `[]` for activity.
* **High DB Load:** In a system with millions of rows, executing aggregate counts (e.g., `COUNT(*)`) can slow response times. Implement materialized views or pre-computed key-value counts stored in Redis and updated asynchronously via event triggers.

---

# 3. Vendor Management Module

## 3.1 Module Overview
* **Purpose:** Manages the vendor lifecycle.
* **Business Objective:** Enable vendor registration, validation (GST, company credentials), rating tracking, and categorization to filter appropriate partners for RFQs.

## 3.2 Functional Requirements
* **Vendor Registration:** Standard self-registration schema for vendors. Creates a user account and vendor profile.
* **GST/Tax Identification validation:** Verifies formatting and authenticity of GST numbers.
* **Status Transitions:** Admin reviews vendor profiles and changes status to 'Approved', 'Rejected', or 'Blacklisted'.
* **Vendor Performance Indexing:** Calculates and saves vendor rating based on delivery timelines and historical quotation submissions.

## 3.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Create/Apply Vendor | ✔ | ✖ | ✖ | ✔ (Registration Portal) |
| Approve/Reject Vendor | ✔ | ✖ | ✖ | ✖ |
| View Vendor Private Info | ✔ | ✔ | ✔ | ✔ (Own profile only) |
| Blacklist Vendor | ✔ | ✖ | ✖ | ✖ |

## 3.4 Database Design

### Table: `vendors`
Holds the core vendor organization profile details.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `company_name` (VARCHAR(255)): Not null, unique
* `gst_number` (VARCHAR(15)): Unique, not null
* `status` (VARCHAR(30)): Not null, default 'pending' (Constraint: 'pending', 'approved', 'rejected', 'blacklisted')
* `category` (VARCHAR(100)): Not null (e.g., 'IT Services', 'Construction', 'Raw Materials')
* `rating` (NUMERIC(3, 2)): Default 0.00, constraint `rating >= 0.00 AND rating <= 5.00`
* `address` (TEXT): Not null
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`
* `updated_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `vendor_contacts`
Primary contact person details for a vendor.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `vendor_id` (UUID): Foreign Key references `vendors(id)` ON DELETE CASCADE
* `first_name` (VARCHAR(100)): Not null
* `last_name` (VARCHAR(100)): Not null
* `email` (VARCHAR(255)): Not null, unique
* `phone` (VARCHAR(20)): Not null
* `is_primary` (BOOLEAN): Default true, not null

## 3.5 API Design

### 3.5.1 POST `/api/v1/vendors`
* **Method:** `POST`
* **Request Payload:**
```json
{
  "companyName": "Apex Industrial Supplies",
  "gstNumber": "27AAAAA1111A1Z1",
  "category": "Raw Materials",
  "address": "123 Industrial Parkway, Sector 4, Mumbai, MH - 400001",
  "contact": {
    "firstName": "Rajesh",
    "lastName": "Sharma",
    "email": "rajesh@apexindustrial.com",
    "phone": "+919876543210"
  }
}
```
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "vendorId": "aa67e85c-dfb7-4c40-b6f7-1110ab7cd541",
    "companyName": "Apex Industrial Supplies",
    "status": "pending",
    "rating": 0.00
  }
}
```
* **Validation Rules:**
  * `companyName` is required, unique.
  * `gstNumber` must match the Indian GST format (15 characters: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`).
  * `contact.email` must be a valid email format, and unique in `users` and `vendor_contacts` tables.
* **Error Responses:**
  * **400 Bad Request:** Invalid GST format or missing fields.
  * **409 Conflict:** GST number or email already exists.

### 3.5.2 GET `/api/v1/vendors`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Parameters:** `category`, `status`, `page`, `limit`, `search`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "vendorId": "aa67e85c-dfb7-4c40-b6f7-1110ab7cd541",
        "companyName": "Apex Industrial Supplies",
        "gstNumber": "27AAAAA1111A1Z1",
        "category": "Raw Materials",
        "status": "approved",
        "rating": 4.50
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1
    }
  }
}
```

### 3.5.3 PATCH `/api/v1/vendors/{id}/status`
* **Method:** `PATCH`
* **Headers:** `Authorization: Bearer <accessToken>` (Admin role only)
* **Request Payload:**
```json
{
  "status": "approved",
  "remarks": "Verified documents and GST portal credentials."
}
```
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "vendorId": "aa67e85c-dfb7-4c40-b6f7-1110ab7cd541",
    "status": "approved"
  }
}
```
* **Error Responses:**
  * **403 Forbidden:** Non-admin trying to alter status.
  * **404 Not Found:** Vendor ID not matching.

## 3.6 Business Logic
* **Automatic User Account Provisioning:** When a vendor registration is approved by the Admin:
  1. Trigger an automation that creates an entry in the `users` table with the role set to `vendor`.
  2. The username is set as the vendor contact email.
  3. Generate a secure random password and flag the user as requiring a password reset on first login.
  4. Send email confirmation to the vendor containing first-time password set link.
* **Blacklisting Propagation:** If a vendor's status is changed to `blacklisted`, revoke all of their pending quotations instantly, and restrict them from receiving any new RFQ invites.

## 3.7 Notifications
* **Registration Submission (to Admins):**
  * Event: `vendor.registered`
  * Recipient: Admins Group
  * Type: System dashboard alert and email
* **Status Updates (to Vendors):**
  * Event: `vendor.status_updated`
  * Recipient: Vendor Contact Email
  * Type: Email notifying approval or rejection

## 3.8 Audit Logging
* **Actions Logged:** `VENDOR_REGISTERED`, `VENDOR_STATUS_UPDATED`, `VENDOR_PROFILE_CHANGED`.
* **Metadata Store:** `vendor_id`, `admin_user_id`, `status_transition` (e.g. `pending -> approved`), `remarks`, `timestamp`.

## 3.9 Security Requirements
* **Input Validation:** Clean HTML and SQL injection vectors from address fields.
* **GST Masking:** If shared across reports, ensure only authorized roles see complete GST data; others see masked formats (`XXXXXXXXXXXA1Z1`).

## 3.10 Edge Cases
* **Duplicate Registration In-Flight:** Prevent race conditions where two threads try to insert the same GST number at the exact same moment. Add a transaction-level lock or database unique constraint.
* **Vendor User Delete:** If a vendor user is deleted, do not delete historical invoices or purchase orders. Cleanse contact info but retain company transaction logs with foreign keys mapped to static audit values.

---

# 4. RFQ Creation Module

## 4.1 Module Overview
* **Purpose:** Handles the creation of Request for Proposals/Quotations.
* **Business Objective:** Standardize procurement demand specifications, manage deadline timelines, specify itemized parameters, and select relevant vendors.

## 4.2 Functional Requirements
* **RFQ Document Creation:** Procurement officers enter Title, Description, Deadline, Items, and Target delivery terms.
* **Attachment Storage:** Secure handling of technical documents, blueprints, and files.
* **Vendor Assignment Linkage:** Associate target vendors to the RFQ to direct notification alerts.
* **Automatic Deadline Expiry:** Move RFQ status to `closed` automatically once the deadline expires.

## 4.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Draft RFQ | ✔ | ✔ | ✖ | ✖ |
| Publish RFQ | ✖ | ✔ | ✖ | ✖ |
| Assign Vendor | ✖ | ✔ | ✖ | ✖ |
| View RFQ Details | ✔ | ✔ | ✔ | ✔ (If assigned only) |

## 4.4 Database Design

### Table: `rfqs`
Stores top-level details of requests.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `rfq_code` (VARCHAR(50)): Unique, not null (e.g. `RFQ-2026-00001`)
* `title` (VARCHAR(255)): Not null
* `description` (TEXT): Nullable
* `deadline` (TIMESTAMP WITH TIME ZONE): Not null
* `status` (VARCHAR(30)): Not null, default 'draft' (Constraint: 'draft', 'published', 'closed', 'cancelled')
* `created_by` (UUID): Foreign Key references `users(id)`
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`
* `updated_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `rfq_items`
Itemized products or services requested.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `rfq_id` (UUID): Foreign Key references `rfqs(id)` ON DELETE CASCADE
* `item_name` (VARCHAR(255)): Not null
* `description` (TEXT): Nullable
* `quantity` (NUMERIC(12, 4)): Not null, constraint `quantity > 0`
* `uom` (VARCHAR(20)): Not null (Unit of Measure, e.g., 'KGS', 'UNITS', 'METERS')

### Table: `rfq_vendor_assignments`
Tracks which vendors are invited to bid.
* `rfq_id` (UUID): Foreign Key references `rfqs(id)` ON DELETE CASCADE
* `vendor_id` (UUID): Foreign Key references `vendors(id)` ON DELETE CASCADE
* PRIMARY KEY (`rfq_id`, `vendor_id`)

### Table: `rfq_attachments`
Files uploaded with the RFQ.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `rfq_id` (UUID): Foreign Key references `rfqs(id)` ON DELETE CASCADE
* `file_name` (VARCHAR(255)): Not null
* `file_url` (VARCHAR(512)): Not null
* `file_size_bytes` (BIGINT): Not null
* `uploaded_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

## 4.5 API Design

### 4.5.1 POST `/api/v1/rfqs`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request Payload:**
```json
{
  "title": "Procurement of Structural Steel Bars - Phase 2",
  "description": "Standard grade high-tensile steel bars as per architectural spec.",
  "deadline": "2026-06-20T17:00:00+05:30",
  "items": [
    {
      "itemName": "Steel Rebar 12mm",
      "description": "Grade Fe 500D",
      "quantity": 500,
      "uom": "METERS"
    }
  ],
  "assignedVendorIds": [
    "aa67e85c-dfb7-4c40-b6f7-1110ab7cd541"
  ]
}
```
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "rfqId": "f7d73be1-7ea5-419b-b5d1-d2f664a781b2",
    "rfqCode": "RFQ-2026-00001",
    "status": "draft",
    "itemsCount": 1
  }
}
```
* **Validation Rules:**
  * `title` required, string.
  * `deadline` must be in the future (minimum 24 hours from current time).
  * `items` array must contain at least 1 item.
  * `items.quantity` must be positive.
  * `assignedVendorIds` must be array of valid active vendor UUIDs.
* **Error Responses:**
  * **400 Bad Request:** Deadline in past, empty items array, or invalid IDs.

### 4.5.2 POST `/api/v1/rfqs/{id}/attachments`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request Payload:** Multi-part Form Data (`file` binary field).
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "attachmentId": "c92881bb-6997-4048-b472-ee1d821369eb",
    "fileName": "specification_sheet.pdf",
    "fileUrl": "https://s3.amazonaws.com/vendorbridge-bucket/rfqs/specification_sheet.pdf"
  }
}
```

### 4.5.3 POST `/api/v1/rfqs/{id}/publish`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "RFQ published and notification emails dispatched to invited vendors.",
  "data": {
    "rfqId": "f7d73be1-7ea5-419b-b5d1-d2f664a781b2",
    "status": "published",
    "publishedAt": "2026-06-06T10:45:00Z"
  }
}
```
* **Error Responses:**
  * **409 Conflict:** RFQ is already published or cancelled.
  * **422 Unprocessable Entity:** RFQ contains no items or no assigned vendors.

## 4.6 Business Logic
* **Code Generation:** RFQ Code is auto-generated with format `RFQ-YYYY-XXXXX`, where `YYYY` is current year, and `XXXXX` is a zero-padded database sequence incremented atomically.
* **Timeline Constraint:** The deadline can be updated in `draft` status, but once the RFQ status shifts to `published`, modifications are restricted unless a structural "Addendum" flow is initiated (requires sending notifications to all assigned vendors).
* **Automatic Expiry (Cron job):** A cron running every minute queries `SELECT id FROM rfqs WHERE status = 'published' AND deadline <= NOW()`. It updates the status of those RFQs to `closed`.

## 4.7 Notifications
* **RFQ Assignment Alert (to Vendors):**
  * Event: `rfq.published`
  * Recipient: Primary Contacts of assigned vendors.
  * Type: Email & system notification containing RFQ details and link to submit quotes.

## 4.8 Audit Logging
* **Actions Logged:** `RFQ_DRAFT_CREATED`, `RFQ_PUBLISHED`, `RFQ_EXPIRED`, `RFQ_CANCELLED`, `RFQ_ATTACHMENT_UPLOADED`.
* **Metadata Store:** `rfq_id`, `user_id`, `assigned_vendors_count`, `timestamp`.

## 4.9 Security Requirements
* **Attachment Filtering:** Limit files to PDF, JPG, PNG, DOCX, XLSX. Max size 10MB. Run antivirus scanning pipeline (e.g. ClamAV daemon) on the backend before final storage.
* **Vendor isolation:** Ensure that a vendor authenticated user can ONLY fetch RFQ details if they are explicitly mapped in the `rfq_vendor_assignments` table. Return a 403 Forbidden block if they query arbitrary RFQs.

## 4.10 Edge Cases
* **Zero Bids on Deadline:** When the RFQ deadline is reached and no quotations are received, mark RFQ status as `closed` and trigger an alert to the creator to re-evaluate the vendor assignment parameters.
* **Deleted Vendor with Active Assignment:** If a vendor profile is deleted or blacklisted during an active RFQ period, delete their assignment row dynamically, preventing them from bidding.

---

# 5. Vendor Quotation Module

## 5.1 Module Overview
* **Purpose:** Allows invited vendors to bid on active RFQs.
* **Business Objective:** Standardize price submittals, track delivery commitment dates, and enable secure quote revisions before RFQ deadlines.

## 5.2 Functional Requirements
* **Quotation Creation:** Vendors submit itemized unit prices, taxes, notes, and promised delivery timelines.
* **Revision Handling:** Vendors can revise submitted quotations while the RFQ is still open. Revisions overwrite previous inputs but increment a revision count.
* **Retraction Handling:** Allows vendors to pull back their quote before deadline.

## 5.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Create Quotation | ✖ | ✖ | ✖ | ✔ (Must be assigned to RFQ) |
| Revise Quotation | ✖ | ✖ | ✖ | ✔ (Must be own quote) |
| Retract Quotation | ✖ | ✖ | ✖ | ✔ (Must be own quote) |
| Read Quotation Details | ✔ | ✔ | ✔ | ✔ (Own quote only) |

## 5.4 Database Design

### Table: `vendor_quotations`
Stores vendor bid summary.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `rfq_id` (UUID): Foreign Key references `rfqs(id)` ON DELETE RESTRICT
* `vendor_id` (UUID): Foreign Key references `vendors(id)` ON DELETE RESTRICT
* `status` (VARCHAR(30)): Not null, default 'draft' (Constraint: 'draft', 'submitted', 'revised', 'retracted', 'accepted', 'rejected')
* `total_price` (NUMERIC(14, 2)): Not null (Sum of quotation items total)
* `delivery_date` (DATE): Not null (Committed delivery date)
* `revision_number` (INT): Default 0, not null
* `vendor_notes` (TEXT): Nullable
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`
* `updated_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `quotation_items`
Bidding unit prices mapped to RFQ requested items.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `quotation_id` (UUID): Foreign Key references `vendor_quotations(id)` ON DELETE CASCADE
* `rfq_item_id` (UUID): Foreign Key references `rfq_items(id)` ON DELETE RESTRICT
* `unit_price` (NUMERIC(12, 2)): Not null, constraint `unit_price >= 0`
* `tax_percentage` (NUMERIC(5, 2)): Default 0.00, constraint `tax_percentage >= 0`
* `total_item_price` (NUMERIC(14, 2)): Not null (calculated: `quantity * unit_price * (1 + tax_percentage/100)`)

### Table: `quotation_attachments`
Optional brochures, catalogues or spec compliance reports.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `quotation_id` (UUID): Foreign Key references `vendor_quotations(id)` ON DELETE CASCADE
* `file_name` (VARCHAR(255)): Not null
* `file_url` (VARCHAR(512)): Not null
* `uploaded_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

## 5.5 API Design

### 5.5.1 POST `/api/v1/quotations`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>` (Vendor role)
* **Request Payload:**
```json
{
  "rfqId": "f7d73be1-7ea5-419b-b5d1-d2f664a781b2",
  "deliveryDate": "2026-06-18",
  "vendorNotes": "Pricing valid for 30 days. High quality grade Fe 500D.",
  "items": [
    {
      "rfqItemId": "d0a5e840-027c-473d-8d54-8e1d78216cbe",
      "unitPrice": 45.50,
      "taxPercentage": 18.00
    }
  ]
}
```
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "quotationId": "b19dfb4a-a49e-4e3b-b27b-231a44c9b9de",
    "status": "submitted",
    "totalPrice": 26845.00
  }
}
```
* **Validation Rules:**
  * `deliveryDate` must be a valid date format.
  * Vendor user must belong to a vendor record that is assigned to the `rfqId`.
  * The target RFQ must have `status = 'published'` and current time must be before RFQ `deadline`.
* **Error Responses:**
  * **400 Bad Request:** Missing fields, negative prices.
  * **403 Forbidden:** Vendor not invited to this RFQ.
  * **409 Conflict:** Quotation already submitted and must be modified via PUT (revision) endpoint.

### 5.5.2 PUT `/api/v1/quotations/{id}`
* **Method:** `PUT`
* **Headers:** `Authorization: Bearer <accessToken>` (Vendor role)
* **Request Payload:** Same as POST payload structure.
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "quotationId": "b19dfb4a-a49e-4e3b-b27b-231a44c9b9de",
    "status": "revised",
    "revisionNumber": 1,
    "totalPrice": 26000.00
  }
}
```
* **Error Responses:**
  * **400 Bad Request:** RFQ deadline elapsed. Revisions blocked.

### 5.5.3 POST `/api/v1/quotations/{id}/retract`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>` (Vendor role)
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Quotation retracted successfully.",
  "data": {
    "quotationId": "b19dfb4a-a49e-4e3b-b27b-231a44c9b9de",
    "status": "retracted"
  }
}
```

## 5.6 Business Logic
* **Automatic Calculation of Totals:** The total price is computed inside database transaction logic.
  * For each item: `quantity * unitPrice * (1 + taxPercentage / 100)`.
  * Sum all items to write `total_price` in `vendor_quotations`.
* **Revision Counter Control:** If a PUT is executed, fetch current record, copy historical data to a `quotation_audit_history` tracking table (for audit trail), set status to `revised`, and increment `revision_number` by 1.
* **Sealed Bid Protocol (Configurable):** In tight compliance settings, the pricing details are encrypted or hidden from Procurement Officers until the RFQ deadline has passed. This avoids bias. By default, VendorBridge stores them but restricts comparative displays until RFQ expiry status is activated.

## 5.7 Notifications
* **Quotation Receipt Alert (to Procurement Officer):**
  * Event: `quotation.submitted`
  * Recipient: RFQ Creator (Procurement Officer)
  * Type: Dashboard feed entry

## 5.8 Audit Logging
* **Actions Logged:** `QUOTATION_SUBMITTED`, `QUOTATION_REVISED`, `QUOTATION_RETRACTED`.
* **Metadata Store:** `quotation_id`, `rfq_id`, `vendor_id`, `total_price`, `revision_number`, `timestamp`.

## 5.9 Security Requirements
* **Authorization Lockout:** An endpoint-level check ensures that only the vendor user tied to the quotation record owner is allowed to execute PUT/Retract operations.
* **Data Validation:** Enforce absolute values for `unit_price`. No negative entries are allowed.

## 5.10 Edge Cases
* **RFQ Deadline Met During Submission:** If the payload is received exactly as the cron is closing the RFQ, the transaction must fail if the database execution starts after the RFQ status transitions to `closed`. Apply optimistic locking using `version` or checking status inline: `UPDATE rfqs SET ... WHERE status = 'published'`.
* **Partial Pricing Input:** If a vendor submits pricing for only a subset of the RFQ items, throw a validation error. VendorBridge requires bidding on 100% of RFQ item nodes (no partial bids allowed).

---

# 6. Quotation Comparison Module

## 6.1 Module Overview
* **Purpose:** Evaluates multiple vendor submissions side-by-side.
* **Business Objective:** Accelerate vendor selection by highlighting lowest prices, fastest lead times, and vendor reputation scores.

## 6.2 Functional Requirements
* **Side-by-Side matrix representation:** Compiles items from the RFQ and lines up prices submitted by all vendors.
* **Smart Markers:** Highlights:
  * Lowest overall quote.
  * Fast delivery leader.
  * Vendor with highest rating.
* **Filtering and Sorting:** Filter comparative structures based on vendor category and sort dynamically by rating/price.

## 6.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Compare Quotations | ✔ | ✔ | ✔ | ✖ |
| View Competitor Prices | ✖ | ✖ | ✖ | ✖ |

## 6.4 Database Design
No separate tables. The system builds analytical outputs using database SQL window functions.

### Database View: `v_quotation_comparison`
```sql
CREATE OR REPLACE VIEW v_quotation_comparison AS
SELECT 
    vq.rfq_id,
    vq.id AS quotation_id,
    v.id AS vendor_id,
    v.company_name,
    v.rating AS vendor_rating,
    vq.total_price,
    vq.delivery_date,
    (vq.delivery_date - CURRENT_DATE) AS delivery_lead_time_days,
    RANK() OVER (PARTITION BY vq.rfq_id ORDER BY vq.total_price ASC) as price_rank,
    RANK() OVER (PARTITION BY vq.rfq_id ORDER BY vq.delivery_date ASC) as delivery_rank
FROM vendor_quotations vq
JOIN vendors v ON vq.vendor_id = v.id
WHERE vq.status IN ('submitted', 'revised');
```

## 6.5 API Design

### 6.5.1 GET `/api/v1/rfqs/{id}/comparison`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Parameters:** `sortBy` ('price' | 'delivery' | 'rating'), `order` ('asc' | 'desc')
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "rfqId": "f7d73be1-7ea5-419b-b5d1-d2f664a781b2",
    "rfqTitle": "Procurement of Structural Steel Bars - Phase 2",
    "comparisonMatrix": [
      {
        "quotationId": "b19dfb4a-a49e-4e3b-b27b-231a44c9b9de",
        "vendor": {
          "vendorId": "aa67e85c-dfb7-4c40-b6f7-1110ab7cd541",
          "companyName": "Apex Industrial Supplies",
          "rating": 4.50
        },
        "totalPrice": 26845.00,
        "deliveryDate": "2026-06-18",
        "leadTimeDays": 12,
        "isLowestPrice": true,
        "isFastestDelivery": false
      },
      {
        "quotationId": "e30e1d03-bb42-45e0-b6a3-221147814b7e",
        "vendor": {
          "vendorId": "bb23e85c-efb7-4c40-b6f7-1110ab7cd542",
          "companyName": "BuildCorp Metals Ltd",
          "rating": 4.80
        },
        "totalPrice": 28500.00,
        "deliveryDate": "2026-06-15",
        "leadTimeDays": 9,
        "isLowestPrice": false,
        "isFastestDelivery": true
      }
    ]
  }
}
```
* **Validation Rules:**
  * RFQ must have reached `closed` status (or be published/expired depending on sealed bid config).
* **Error Responses:**
  * **404 Not Found:** RFQ ID does not exist.
  * **422 Unprocessable Entity:** RFQ is still open/active and Sealed Bid policy restricts comparison.

## 6.6 Business Logic
* **Smart Indicator Calculation:**
  * *Lowest Price Identifier:* Scans the result set and marks the element matching `price_rank = 1` as `isLowestPrice: true`.
  * *Fastest Delivery Identifier:* Marks the element matching `delivery_rank = 1` as `isFastestDelivery: true`.
  * *Conflicts/Ties:* In case of identical pricing or delivery dates, both items get flagged with `true`.
* **Vendor Rating Context:** Fetches ratings live from the `vendors` table to guarantee that historical delivery evaluation scores are displayed alongside the bid.

## 6.7 Notifications
None triggered by comparison requests.

## 6.8 Audit Logging
* **Actions Logged:** `RFQ_COMPARISON_VIEWED`.
* **Metadata Store:** `rfq_id`, `user_id`, `timestamp`.

## 6.9 Security Requirements
* **Restriction Matrix:** Only the procurement officer, manager, or admin who owns/manages the procurement branch can pull comparison details. Return `403 Forbidden` if a vendor calls this endpoint.

## 6.10 Edge Cases
* **No Quotations Received:** If no quotes exist, comparison matrix returns an empty array `[]` rather than throwing database query errors.
* **Outdated Vendor Profile:** If a vendor rating has dropped or company status is suspended, omit their bids from comparison, marking them as `disqualified`.

---

# 7. Approval Workflow Module

## 7.1 Module Overview
* **Purpose:** Provides structured governance and validation checks before funds are committed to purchase orders.
* **Business Objective:** Prevent unauthorized procurement expenditures through rule-based multi-tier approvals.

## 7.2 Functional Requirements
* **Workflow Initialization:** Triggered automatically when a quotation is selected for a PO.
* **Multi-Stage Processing:** Steps progress sequentially (e.g., Level 1: Manager, Level 2: Financial Director).
* **Approve/Reject Actions:** Approvers record actions with remarks. Rejections halt the workflow immediately.
* **Workflow Audit History:** Persists audit history for each approval decision.

## 7.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Initiate Approval | ✖ | ✔ | ✖ | ✖ |
| Approve / Reject | ✔ (If assigned) | ✖ | ✔ | ✖ |
| Override Workflow | ✔ | ✖ | ✖ | ✖ |
| View Timeline Logs | ✔ | ✔ | ✔ | ✖ |

## 7.4 Database Design

### Table: `approval_workflows`
Top-level entry for an approval process.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `entity_type` (VARCHAR(50)): Not null (Constraint: 'purchase_order', 'quotation')
* `entity_id` (UUID): Not null (Points to PO or Quotation ID)
* `status` (VARCHAR(30)): Not null, default 'pending' (Constraint: 'pending', 'approved', 'rejected')
* `current_step` (INT): Default 1, not null
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`
* `updated_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `approval_steps`
Represents stages within a workflow.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `workflow_id` (UUID): Foreign Key references `approval_workflows(id)` ON DELETE CASCADE
* `step_number` (INT): Not null
* `assigned_role` (VARCHAR(50)): Not null (e.g., 'manager', 'admin')
* `assigned_user_id` (UUID): Nullable, Foreign Key references `users(id)` (if assigned to a specific person)
* `status` (VARCHAR(30)): Not null, default 'pending' (Constraint: 'pending', 'approved', 'rejected')
* `remarks` (TEXT): Nullable
* `actioned_by` (UUID): Nullable, Foreign Key references `users(id)`
* `actioned_at` (TIMESTAMP WITH TIME ZONE): Nullable

## 7.5 API Design

### 7.5.1 POST `/api/v1/approvals`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request Payload:**
```json
{
  "entityType": "purchase_order",
  "entityId": "e98e4d3a-127b-4bad-bdd2-441ab7cd5411"
}
```
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "workflowId": "7c48f211-1a3b-489e-bdf1-d3ef64a781b4",
    "status": "pending",
    "currentStep": 1,
    "totalSteps": 2
  }
}
```

### 7.5.2 POST `/api/v1/approvals/{id}/action`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>` (Manager/Approver role)
* **Request Payload:**
```json
{
  "action": "approved", // 'approved' or 'rejected'
  "remarks": "Budget verified. Pricing aligns with contract standards."
}
```
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "workflowId": "7c48f211-1a3b-489e-bdf1-d3ef64a781b4",
    "status": "approved", // 'approved', 'rejected', or 'pending' if more steps remain
    "nextStep": 2
  }
}
```
* **Validation Rules:**
  * User must match the role/ID of the current step in the workflow.
  * The step status must be `pending`.
  * `remarks` required for rejections.
* **Error Responses:**
  * **403 Forbidden:** Unauthorized user attempting action.
  * **409 Conflict:** Step already processed.

### 7.5.3 GET `/api/v1/approvals/{id}/history`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "workflowId": "7c48f211-1a3b-489e-bdf1-d3ef64a781b4",
    "steps": [
      {
        "stepNumber": 1,
        "assignedRole": "manager",
        "status": "approved",
        "actionedBy": "manager.david@vendorbridge.com",
        "actionedAt": "2026-06-06T11:00:00Z",
        "remarks": "Budget verified."
      },
      {
        "stepNumber": 2,
        "assignedRole": "admin",
        "status": "pending",
        "actionedBy": null,
        "actionedAt": null,
        "remarks": null
      }
    ]
  }
}
```

## 7.6 Business Logic
* **Dynamic Approval Routing:** Workflows are created based on the total value of the Purchase Order.
  * *Amount <= $10,000:* Single approval required (Manager).
  * *Amount > $10,000:* Two-step approval required (Level 1: Manager, Level 2: Financial Director / Admin).
* **State Transition Rules:**
  * If the active step is `approved`, check if a subsequent step exists.
    * If yes: increment `current_step` by 1. Keep workflow status as `pending`.
    * If no: update workflow status to `approved`. Trigger downstream entity updates (e.g., transition PO status to `approved`).
  * If the active step is `rejected`, update the workflow status to `rejected` and set all subsequent steps to `cancelled`. Update the associated PO status to `rejected`.

## 7.7 Notifications
* **Pending Action Notification:**
  * Event: `workflow.step_assigned`
  * Recipient: Users matching the role of the next step.
  * Type: Email notification containing approval request details.
* **Approval Decision Alert:**
  * Event: `workflow.completed`
  * Recipient: Workflow Creator (Procurement Officer).
  * Type: System alert notifying approval status.

## 7.8 Audit Logging
* **Actions Logged:** `APPROVAL_WORKFLOW_INITIATED`, `APPROVAL_STEP_APPROVED`, `APPROVAL_STEP_REJECTED`, `APPROVAL_BYPASSED`.
* **Metadata Store:** `workflow_id`, `step_number`, `approver_id`, `action`, `remarks`, `timestamp`.

## 7.9 Security Requirements
* **Strict Role Enforcement:** Prevent API callers from passing a mock `userId` to authorize their own requests. Authenticated user ID must be resolved on the backend server from the validated JWT token.

## 7.10 Edge Cases
* **Delegation/Vacation Loop:** If a manager is on leave, allow an Admin to reassign the active step to another manager. Create a reassignment API and track the change in audit logs.
* **Concurrent Approvals:** If two managers are assigned the same step, ensure only one action is processed by using a database select-for-update lock.

---

# 8. Purchase Order & Invoice Module

## 8.1 Module Overview
* **Purpose:** Handles transaction creation and execution.
* **Business Objective:** Auto-generate legal PO agreements, track payment invoices, process tax rules, and output secure PDFs for physical processing.

## 8.2 Functional Requirements
* **PO Auto-Generation:** Triggered by approved quotations. Auto-calculates PO values and tax details.
* **Invoice Processing:** Vendors create invoices against approved POs. Total invoice values must not exceed the PO limit.
* **PDF Output Engine:** Generates secure PDF files for print or email attachment.
* **Tax and Net calculations:** Applies country-specific tax rules (GST/VAT) during document generation.

## 8.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Generate PO | ✖ | ✔ | ✖ | ✖ |
| Draft Invoice | ✖ | ✖ | ✖ | ✔ |
| Approve Invoice | ✔ | ✔ | ✔ | ✖ |
| View PO & Invoice | ✔ | ✔ | ✔ | ✔ (Linked to their own transactions) |

## 8.4 Database Design

### Table: `purchase_orders`
Tracks purchase orders.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `po_number` (VARCHAR(50)): Unique, not null (e.g. `PO-2026-00001`)
* `quotation_id` (UUID): Unique, Foreign Key references `vendor_quotations(id)` ON DELETE RESTRICT
* `vendor_id` (UUID): Foreign Key references `vendors(id)` ON DELETE RESTRICT
* `status` (VARCHAR(30)): Not null, default 'draft' (Constraint: 'draft', 'pending_approval', 'approved', 'sent_to_vendor', 'cancelled')
* `subtotal` (NUMERIC(14, 2)): Not null
* `tax_amount` (NUMERIC(14, 2)): Not null
* `total_amount` (NUMERIC(14, 2)): Not null (calculated: `subtotal + tax_amount`)
* `created_by` (UUID): Foreign Key references `users(id)`
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`
* `updated_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `invoices`
Tracks payment requests from vendors.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `invoice_number` (VARCHAR(50)): Unique, not null
* `purchase_order_id` (UUID): Foreign Key references `purchase_orders(id)` ON DELETE RESTRICT
* `vendor_id` (UUID): Foreign Key references `vendors(id)` ON DELETE RESTRICT
* `status` (VARCHAR(30)): Not null, default 'unpaid' (Constraint: 'unpaid', 'paid', 'void', 'overdue')
* `subtotal` (NUMERIC(14, 2)): Not null
* `tax_amount` (NUMERIC(14, 2)): Not null
* `total_amount` (NUMERIC(14, 2)): Not null
* `due_date` (DATE): Not null
* `paid_at` (TIMESTAMP WITH TIME ZONE): Nullable
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`
* `updated_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

## 8.5 API Design

### 8.5.1 POST `/api/v1/purchase-orders`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>` (Procurement Officer)
* **Request Payload:**
```json
{
  "quotationId": "b19dfb4a-a49e-4e3b-b27b-231a44c9b9de"
}
```
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "poId": "e98e4d3a-127b-4bad-bdd2-441ab7cd5411",
    "poNumber": "PO-2026-00001",
    "status": "draft",
    "totalAmount": 26845.00
  }
}
```
* **Validation Rules:**
  * `quotationId` must be approved.
  * Vendor associated must be active and approved.
* **Error Responses:**
  * **409 Conflict:** PO already exists for this quotation.

### 8.5.2 GET `/api/v1/purchase-orders/{id}/pdf`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/vendorbridge-bucket/pos/PO-2026-00001.pdf"
  }
}
```

### 8.5.3 POST `/api/v1/invoices`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>` (Vendor)
* **Request Payload:**
```json
{
  "invoiceNumber": "INV-9908",
  "purchaseOrderId": "e98e4d3a-127b-4bad-bdd2-441ab7cd5411",
  "dueDate": "2026-07-06"
}
```
* **Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "2c9ba950-ab19-482d-8e99-4412c7efb34d",
    "status": "unpaid",
    "totalAmount": 26845.00
  }
}
```
* **Validation Rules:**
  * PO status must be `approved` (and not already fully invoiced).
  * `dueDate` must be a future date.
  * Vendor user must own the vendor record tied to the PO.

## 8.6 Business Logic
* **PO Code Generation:** Auto-generated sequence matching `PO-YYYY-XXXXX`.
* **Value Reconciliation:** The subtotal and tax amounts in an Invoice are pulled from the corresponding PO to prevent discrepancies.
* **Asynchronous PDF Generation:** PDF generation is handled in the background. Creating a PO publishes a message (`generate.po.pdf`) to RabbitMQ/BullMQ. The background worker uses Puppeteer to render a clean HTML template to PDF and uploads it to S3, updating the database record with the URL.

## 8.7 Notifications
* **PO Issued (to Vendor):**
  * Event: `po.issued`
  * Recipient: Vendor Email
  * Type: Email with PDF attachment
* **Invoice Received (to Procurement Officer):**
  * Event: `invoice.submitted`
  * Recipient: Procurement Officer Group
  * Type: Dashboard task alert

## 8.8 Audit Logging
* **Actions Logged:** `PO_GENERATED`, `PO_SENT_TO_VENDOR`, `INVOICE_CREATED`, `INVOICE_PAID`.
* **Metadata Store:** `po_id`, `invoice_id`, `actor_user_id`, `amount`, `timestamp`.

## 8.9 Security Requirements
* **Signed URLs:** S3 URLs generated for PDF access are valid for only 15 minutes to secure financial documents from public exposure.
* **Amount Matching:** Enforce database constraints to prevent vendor invoice submissions from exceeding the total cost approved in the PO.

## 8.10 Edge Cases
* **Tax Rate Change:** Tax is locked at the time of quotation acceptance. Subsequent changes to system-wide tax templates do not affect historical POs or Invoices.
* **Over-Invoicing:** Prevent vendors from raising multiple partial invoices that exceed the PO total amount. Maintain `invoiced_amount_accumulator` on the PO table and check totals during invoice submission.

---

# 9. Activity Logs & Notifications Module

## 9.1 Module Overview
* **Purpose:** Handles communication, tracing, and change logging.
* **Business Objective:** Inform users of key events (e.g. pending approvals, new RFQs) and provide an immutable audit trail for security compliance.

## 9.2 Functional Requirements
* **Notification Queue:** Delivers in-app alerts and schedules transactional emails.
* **Global Activity Timeline:** Displays historical system actions.
* **Immutable Audit Trail:** Log entries are read-only and cannot be updated or deleted by any user, including admins.

## 9.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Read Own Notifications | ✔ | ✔ | ✔ | ✔ |
| Mark Notifications as Read | ✔ | ✔ | ✔ | ✔ |
| Query Audit Logs | ✔ | ✖ | ✖ | ✖ |

## 9.4 Database Design

### Table: `notifications`
Stores in-app notifications.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `recipient_id` (UUID): Foreign Key references `users(id)` ON DELETE CASCADE
* `title` (VARCHAR(255)): Not null
* `message` (TEXT): Not null
* `type` (VARCHAR(50)): Not null (e.g., 'rfq_assigned', 'approval_request', 'po_sent', 'invoice_paid')
* `is_read` (BOOLEAN): Default false, not null
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP`

### Table: `audit_logs`
Stores structural audit logs.
* `id` (UUID): Primary Key, default `gen_random_uuid()`
* `actor_id` (UUID): Nullable (for system processes), Foreign Key references `users(id)` ON DELETE SET NULL
* `action` (VARCHAR(100)): Not null (e.g. `RFQ_PUBLISHED`, `PO_APPROVED`)
* `entity_type` (VARCHAR(50)): Not null (e.g., 'rfq', 'purchase_order')
* `entity_id` (UUID): Not null
* `diff_data` (JSONB): Nullable (stores before/after snapshot data)
* `ip_address` (VARCHAR(45)): Not null
* `user_agent` (VARCHAR(255)): Nullable
* `created_at` (TIMESTAMP WITH TIME ZONE): Default `CURRENT_TIMESTAMP` (Immutable constraint)

## 9.5 API Design

### 9.5.1 GET `/api/v1/notifications`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Parameters:** `status` ('all' | 'unread'), `page`, `limit`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notificationId": "4c9ba950-ab19-482d-8e99-4412c7efb34f",
        "title": "New RFQ Invitation",
        "message": "You have been invited to bid on RFQ-2026-00001.",
        "type": "rfq_assigned",
        "isRead": false,
        "createdAt": "2026-06-06T10:45:00Z"
      }
    ]
  }
}
```

### 9.5.2 PATCH `/api/v1/notifications/{id}/read`
* **Method:** `PATCH`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read."
}
```

### 9.5.3 GET `/api/v1/audit-logs`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>` (Admin only)
* **Parameters:** `entityType`, `entityId`, `actorId`, `startDate`, `endDate`, `page`, `limit`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "logId": "2c9ba950-ab19-482d-8e99-4412c7efb35a",
        "actor": "officer.john@vendorbridge.com",
        "action": "RFQ_PUBLISHED",
        "entityType": "rfq",
        "entityId": "f7d73be1-7ea5-419b-b5d1-d2f664a781b2",
        "ipAddress": "192.168.1.10",
        "createdAt": "2026-06-06T10:45:00Z"
      }
    ]
  }
}
```

## 9.6 Business Logic
* **Log Immutability:** Set up database triggers that block `UPDATE` or `DELETE` requests on the `audit_logs` table.
* **Notification Routing:** The system pushes alerts to target channels based on notification settings:
  * In-app notifications are saved to the database.
  * Email notifications are pushed to an asynchronous task queue.
* **Diff Tracking:** For critical changes (e.g., updating vendor payment terms or PO pricing), track the updated fields in a `diff_data` payload:
```json
{
  "previous": { "totalAmount": 25000.00, "status": "draft" },
  "updated": { "totalAmount": 26845.00, "status": "pending_approval" }
}
```

## 9.7 Notifications
None triggered (handles delivery of other module events).

## 9.8 Audit Logging
* **Actions Logged:** `NOTIFICATION_DISPATCHED`, `AUDIT_LOGS_QUERIED`.
* **Metadata Store:** `actor_id`, `action`, `timestamp`.

## 9.9 Security Requirements
* **Audit Tampering Protection:** Database credentials for standard services should restrict table delete access on `audit_logs`. Use separate read/write users or configure database-level row-security policies.

## 9.10 Edge Cases
* **High Notification Volumes:** Prevent database bloat from older read notifications. Set up a background process to archive in-app notifications older than 90 days.
* **Missing Actors:** For system-triggered events (e.g. automatic RFQ closure on deadline), record the `actor_id` as `NULL` or map it to a dedicated system user account.

---

# 10. Reports & Analytics Module

## 10.1 Module Overview
* **Purpose:** Provides metrics and business intelligence.
* **Business Objective:** Track vendor compliance ratings, monitor spending trends, analyze procurement lead times, and export files for external financial systems.

## 10.2 Functional Requirements
* **Vendor Performance Analysis:** Compiles response rates, average lead times, and price competitiveness scores.
* **Spend Analysis:** Organizes spending reports by categories, departments, and vendors.
* **Export Engine:** Exports data to CSV and Excel formats.
* **Trend Analysis:** Aggregates monthly expenditures and transaction counts.

## 10.3 User Permissions
| Action | Admin | Procurement Officer | Manager | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| View Spend Reports | ✔ | ✔ | ✔ | ✖ |
| View Vendor Performance | ✔ | ✔ | ✔ | ✖ |
| Export Audit CSVs | ✔ | ✖ | ✖ | ✖ |
| View Personal Performance | ✖ | ✖ | ✖ | ✔ (Limited parameters) |

## 10.4 Database Design
No specific tables. The analytics engine queries reporting views built on core transaction tables.

### Database View: `v_vendor_analytics`
```sql
CREATE OR REPLACE VIEW v_vendor_analytics AS
SELECT 
    v.id AS vendor_id,
    v.company_name,
    v.category,
    COALESCE(AVG(v.rating), 0.00) AS rating,
    COUNT(DISTINCT vq.id) AS total_quotes_submitted,
    COUNT(DISTINCT po.id) AS total_pos_received,
    COALESCE(SUM(po.total_amount), 0.00) AS total_spend_amount,
    COALESCE(AVG(po.total_amount), 0.00) AS average_po_amount
FROM vendors v
LEFT JOIN vendor_quotations vq ON v.id = vq.vendor_id
LEFT JOIN purchase_orders po ON vq.id = po.quotation_id AND po.status = 'approved'
GROUP BY v.id, v.company_name, v.category;
```

## 10.5 API Design

### 10.5.1 GET `/api/v1/reports/vendor-performance`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "vendorId": "aa67e85c-dfb7-4c40-b6f7-1110ab7cd541",
      "companyName": "Apex Industrial Supplies",
      "totalQuotes": 15,
      "totalPosReceived": 5,
      "totalSpend": 134225.00,
      "averagePoValue": 26845.00,
      "currentRating": 4.50
    }
  ]
}
```

### 10.5.2 GET `/api/v1/reports/spend-summary`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Parameters:** `year` (e.g. 2026), `groupBy` ('category' | 'vendor')
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "totalSpend": 850230.00,
    "categories": [
      {
        "categoryName": "Raw Materials",
        "spend": 540000.00,
        "percentage": 63.51
      },
      {
        "categoryName": "IT Services",
        "spend": 310230.00,
        "percentage": 36.49
      }
    ]
  }
}
```

### 10.5.3 GET `/api/v1/reports/export`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Parameters:** `reportType` ('spend' | 'vendor'), `format` ('csv' | 'xlsx')
* **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "exportUrl": "https://s3.amazonaws.com/vendorbridge-bucket/reports/spend_report_20260606.csv",
    "expiresAt": "2026-06-06T11:15:00Z"
  }
}
```

## 10.6 Business Logic
* **Asynchronous Export Processing:** To prevent web thread blockages during large report exports:
  1. The API schedules an export task and returns a 202 Accepted response.
  2. The background worker fetches the requested dataset and generates the CSV/Excel file.
  3. The file is uploaded to S3, and the system sends a notification containing the download link to the user.
* **Rating Logic Calculation:** Vendor ratings are calculated based on:
  * Timely delivery rates (delivery date vs. promised date on invoices).
  * Quotation responsiveness.

## 10.7 Notifications
* **Export Completed:**
  * Event: `report.export_completed`
  * Recipient: Export Requester User.
  * Type: System alert containing download URL.

## 10.8 Audit Logging
* **Actions Logged:** `REPORT_GENERATED`, `REPORT_EXPORTED`.
* **Metadata Store:** `user_id`, `report_type`, `parameters`, `timestamp`.

## 10.9 Security Requirements
* **Data Scoping:** Enforce strict access control filters to ensure vendors can view only their own performance reports.

## 10.10 Edge Cases
* **Empty Reporting Parameters:** If queries do not yield matching results, return zero values rather than throwing empty errors.
* **Timezone Shifts:** Normalize query inputs to UTC during aggregation to ensure consistency across regional dates.

---

# System Design Section

## 1. Backend Architecture

VendorBridge utilizes a Layered Clean Architecture pattern to separate concerns and ensure maintainability.

```
+-------------------------------------------------------------------+
|                         API REST Layer                            |
|             (Controllers, Express/NestJS Routing)                |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|                       Service Domain Layer                        |
|        (Business Logic, Workflows, State Transitions)            |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|                    Data Access / Repository Layer                 |
|               (TypeORM/Prisma DB Entity Mapping)                  |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|                      Infrastructure Layer                         |
|     (PostgreSQL DB, Redis Cache, S3 Storage, BullMQ Workers)      |
+-------------------------------------------------------------------+
```

### Module Boundaries
To keep the codebase modular, each module is encapsulated inside its own folder structure (containing its Controller, Service, and Repository components). Modules communicate with each other using defined service interfaces or through an Event Bus (e.g. Node EventEmitter or RabbitMQ/BullMQ integration).

---

## 2. Recommended Tech Stack
* **Framework:** Node.js with **NestJS** and **TypeScript** (enforces clean structures and dependency injection).
* **Database:** **PostgreSQL** (supports relational structures, ACID transactions, and JSONB formats).
* **Cache:** **Redis** (used for session caching, dashboard metrics caching, and API rate limiting).
* **Message Broker / Queue:** **BullMQ** (runs on Redis to handle background PDF and report generation).
* **File Storage:** **Amazon S3** or **MinIO** (used for document attachments, POs, and invoices).
* **Email Service:** **Amazon SES** (handles transactional notification emails).
* **PDF Service:** **Puppeteer** (generates PDFs using HTML templates in headless Chrome instances).

---

## 3. Database ER Diagram Description
* `users` has a 1-to-many relationship with `user_sessions`.
* `users` has a 1-to-many relationship with `password_resets`.
* `users` has a 1-to-many relationship with `rfqs` (creator mapping).
* `vendors` has a 1-to-many relationship with `vendor_contacts`.
* `vendors` has a 1-to-many relationship with `vendor_quotations`.
* `rfqs` has a 1-to-many relationship with `rfq_items`.
* `rfqs` has a 1-to-many relationship with `rfq_attachments`.
* `rfqs` has a many-to-many relationship with `vendors` via `rfq_vendor_assignments`.
* `vendor_quotations` has a 1-to-many relationship with `quotation_items`.
* `vendor_quotations` has a 1-to-many relationship with `quotation_attachments`.
* `approval_workflows` has a 1-to-many relationship with `approval_steps`.
* `purchase_orders` has a 1-to-1 relationship with `vendor_quotations` and a 1-to-many relationship with `invoices`.
* `audit_logs` has a many-to-1 relationship with `users` (actor field).

---

## 4. State Machines

### 4.1 RFQ State Machine
```
   [Draft] ----------> [Published] ----------> [Closed]
      |                     |
      +---------------------+------------> [Cancelled]
```

### 4.2 Quotation State Machine
```
   [Draft] ----------> [Submitted] ----------> [Accepted]
                            |                     |
                            +-----> [Revised]     +-----> [Rejected]
                            |
                            +-----> [Retracted]
```

### 4.3 Approval State Machine
```
   [Pending] ----------> [Approved]
        |
        +--------------> [Rejected]
```

### 4.4 Purchase Order State Machine
```
   [Draft] ----------> [Pending Approval] ----------> [Approved] ----------> [Sent to Vendor] ----------> [Delivered]
                                                          |
                                                          +-----> [Cancelled]
```

### 4.5 Invoice State Machine
```
   [Unpaid] ----------> [Paid]
       |
       +--------------> [Overdue]
       |
       +--------------> [Void]
```

---

## 5. Scalability Considerations
* **Horizontal Scaling:** All application servers are stateless. User sessions are verified using JWTs or tracked in a central Redis cache.
* **Database Scaling:** Set up PostgreSQL with primary-replica replication. Direct write requests to the primary node and read/reporting requests to replicas.
* **Storage Offloading:** Avoid saving uploaded files to application server disks. Upload files directly to S3 via presigned upload URLs.

---

## 6. Performance Optimization
* **Database Indexing:** Build indexes on foreign key relationships (`rfq_id`, `vendor_id`, `user_id`) and search criteria columns (`status`, `email`, `created_at`).
* **Caching:** Cache dashboard aggregates and vendor performance metrics in Redis. Set up automated cache invalidations when modifications occur.
* **Database Connection Pooling:** Set up PgBouncer to manage database connection reuse and prevent system crashes during traffic spikes.

---

## 7. Security Architecture
* **Access Control:** Enforce Role-Based Access Control (RBAC) middleware checks on all API endpoints.
* **Payload Sanitation:** Use validation packages (e.g. `class-validator`) to clean payloads and prevent XSS or injection vulnerabilities.
* **Encryption:** Encrypt sensitive database columns (such as vendor bank details or API credentials) using AES-256-GCM. Protect all network traffic using TLS 1.3.

---

## 8. Logging & Monitoring
* **Structured Logging:** Format log entries in JSON using a logging utility like Winston.
* **Aggregation:** Forward logs to a central aggregation platform (e.g., Grafana Loki, Elasticsearch) to monitor system errors and exceptions.
* **Application Metrics:** Track endpoint response times and memory metrics using Prometheus and Grafana.

---

## 9. Deployment Architecture
* **Containerization:** Package applications in Docker containers.
* **Orchestration:** Deploy containers to Kubernetes (EKS/GKE) or AWS ECS behind an Application Load Balancer (ALB).
* **CI/CD Automation:** Set up automated pipelines (e.g. GitHub Actions) to run tests, build Docker containers, and handle blue-green deployments to minimize downtime.
