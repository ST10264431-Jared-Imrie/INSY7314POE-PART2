# HustleHub+ API - Part 1: Secure Backend Foundations

## System Overview & Intended Users
**HustleHub+** is a secure freelance marketplace platform designed to bridge the gap between skilled freelancers offering digital services and clients looking to hire. Beyond service listings and bookings, the system tracks transactions, earnings, and estimated tax liabilities.

### Target Users:
* **Freelancers:** Provide professional services, manage bookings, and track income/tax estimations.
* **Clients:** Browse marketplace listings, order services, and manage booking records.

---

## MERN Backend Architecture Diagram
+-----------------------------------------------------------------------------------+
|                                   CLIENT LAYER                                    |
|   +----------------------------------+     +----------------------------------+   |
|   |   React.js Web Application /     |     |       Postman / API Client       |   |
|   |      Browser Client (HTTPS)      |     |                                  |   |
+---|----------------------------------|-----|----------------------------------|---+
|                                  |     |                                  |
+-------------------------\        |     |        /-------------------------+
\       |     |       /
HTTPS Requests (Port 8443)
|     |
+--------------------------------------v-----v--------------------------------------+
|                                  SERVER LAYER                                     |
|  +-----------------------------------------------------------------------------+  |
|  |                        TLS / HTTPS Encryption Layer                         |  |
|  +-----------------------------------------------------------------------------+  |
|  |                            Express Middleware Pipeline                       |  |
|  |  +---------------------+  +---------------------+  +---------------------+  |  |
|  |  |   CORS Middleware   |->|  Input Validation   |->| Authenticate Token  |  |  |
|  |  |                     |  | (express-validator) |  |   (JWT Middleware)  |  |  |
|  |  +---------------------+  +---------------------+  +---------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|  |                                API Controllers                              |  |
|  |  +------------------+  +------------------+  +-------------------------------+  |  |
|  |  |  Auth Controller |  | User Controller  |  |    Centralized Error Handler  |  |  |
|  |  | (Register/Login) |  | (Protected Profile)|  | (No Stack Traces Leak)       |  |  |
|  |  +------------------+  +------------------+  +-------------------------------+  |  |
+---|---------------------------------------------------------------------------|---+
|                                                                           |
+---|---------------------------------------------------------------------------|---+
|   v                                DATA LAYER                                 v   |
|  +-----------------------------------------------------------------------------+  |
|  |                  In-Memory Data Store / File-Based Persistence               |  |
|  |  - Password Hashing via bcryptjs (10 SaltRounds)                           |  |
|  |  - Persistent storage structure ready for MongoDB (MERN Integration)       |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
---

## Security Decisions & Implementation Details

### 1. Password Hashing (`bcryptjs`)
Plain-text passwords are never stored. Passwords are hashed using `bcryptjs` with a cost factor (salt rounds) of 10 prior to storage. This process mitigates rainbow table and brute-force vector attacks.

### 2. Token-Based Authentication (`JSON Web Tokens`)
Stateful session storage is avoided in favor of stateless JWT authentication. Upon successful authentication, a JWT signed with a secure secret key (`JWT_SECRET`) is returned. Subsequent requests to protected endpoints require a `Bearer <token>` in the HTTP `Authorization` header.

### 3. Strict Input Validation (`express-validator`)
All incoming registration and login payloads undergo strict validation and sanitization before processing:
* **Email:** Validated against standard email formats and normalized.
* **Password:** Requires a minimum of 8 characters containing at least one letter and one number.
* **Strings:** Sanitized to block injection vectors.

### 4. Local HTTPS Configuration
Transport Layer Security (TLS) is enforced across all endpoints. Communication occurs strictly over HTTPS using locally generated self-signed SSL certificates, preventing packet sniffing and man-in-the-middle (MitM) attacks.

### 5. Secure Error Handling
Internal system errors are intercepted by a centralized middleware handler. Standardized generic messages are returned to callers. Stack traces, directory paths, and framework configurations are completely suppressed from responses.

---

## Installation and Setup Instructions

1. **Clone repository and install dependencies:**
   ```bash
   npm install

mkdir certs
