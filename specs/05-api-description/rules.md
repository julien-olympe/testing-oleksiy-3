# API General Rules

## 1. Introduction

This document defines the general rules, patterns, and conventions that apply to all API endpoints in the Wind Power Plant Status Investigation Application. All API endpoints must adhere to these rules to ensure consistency, security, and maintainability.

## 2. Authentication Mechanism

### 2.1 Session-Based Authentication

All APIs (except public authentication endpoints) use session-based authentication with secure HTTP-only cookies.

**Authentication Details:**
- **Mechanism**: Session-based authentication using secure cookies
- **Session Storage**: In-memory session store (no external dependencies)
- **Session Timeout**: 24 hours of inactivity
- **Cookie Security**: 
  - HttpOnly: true (prevents JavaScript access)
  - Secure: true (HTTPS only in production)
  - SameSite: Strict (prevents CSRF attacks)
  - Path: / (applies to all paths)
  - Max-Age: 86400 seconds (24 hours)

**Reference**: See `specs/03-technical-specifications/04-development-constraints-02-security.md` for detailed security requirements.

### 2.2 Public Endpoints

The following endpoints do not require authentication:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/health` - Health check endpoint

All other endpoints require a valid session.

### 2.3 Authentication Middleware

All protected endpoints must:
1. Validate session token from cookie
2. Verify session is not expired
3. Extract user ID from session
4. Return HTTP 401 (Unauthorized) if authentication fails

**Authentication Failure Response:**
```json
{
  "error": "AUTHENTICATION_ERROR",
  "message": "Session expired or invalid. Please login again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 3. Logging and Error Handling

### 3.1 Logging Patterns

**Log Levels:**
- **ERROR**: Exceptions, system failures, critical errors
- **WARN**: Recoverable issues, validation failures, access violations
- **INFO**: Important events (user login, project creation, project completion)
- **DEBUG**: Detailed information for development (request/response details)

**Log Format:**
All logs must be in JSON format with the following structure:
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "ERROR",
  "message": "Database connection failed",
  "context": {
    "userId": "uuid-here",
    "requestId": "request-uuid",
    "endpoint": "/api/projects",
    "method": "GET",
    "ipAddress": "192.168.1.1"
  },
  "error": {
    "code": "DATABASE_ERROR",
    "stack": "Error stack trace..."
  }
}
```

**Required Logging:**
- All authentication events (login, logout, failed attempts)
- All authorization failures (access denied)
- All data modification operations (create, update, delete)
- All errors and exceptions
- Performance metrics for slow operations (> 1 second)

**Reference**: See `specs/03-technical-specifications/04-development-constraints-01-reliability-fault-tolerance.md` for detailed error handling requirements.

### 3.2 Error Handling Patterns

**Error Response Format:**
All error responses must follow this structure:
```json
{
  "error": "ERROR_CODE",
  "message": "User-friendly error message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**HTTP Status Codes:**
- **200 OK**: Successful GET, PATCH requests
- **201 Created**: Successful POST requests that create resources
- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authorization failed (user lacks permission)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors
- **503 Service Unavailable**: Database unavailable, service temporarily down
- **504 Gateway Timeout**: Request timeout exceeded

**Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication required or failed
- `AUTHORIZATION_ERROR`: Access denied
- `NOT_FOUND`: Resource not found
- `DATABASE_ERROR`: Database operation failed
- `PDF_GENERATION_ERROR`: PDF generation failed
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

**Error Handling Rules:**
1. Never expose internal error details (stack traces, database errors, file paths) to users
2. Log detailed error information server-side with full context
3. Return generic user-friendly messages with error codes for support reference
4. Use appropriate HTTP status codes for each error type
5. Include timestamp in all error responses

**Exception Handling:**
- All errors must be caught and handled at appropriate levels (route handlers, middleware, global error handler)
- Use try-catch blocks for all database operations
- Use transactions for multi-step operations with rollback on error
- Implement retry logic with exponential backoff for transient failures (database connections, network timeouts)

**Reference**: See `specs/03-technical-specifications/04-development-constraints-01-reliability-fault-tolerance.md` for detailed exception handling requirements.

## 4. Request/Response Conventions

### 4.1 Request Headers

**Required Headers:**
- `Content-Type: application/json` (for POST, PATCH requests with body)
- `Cookie: session=<session-token>` (for authenticated requests)

**Optional Headers:**
- `Accept: application/json` (preferred response format)

### 4.2 Response Headers

**Standard Headers:**
- `Content-Type: application/json` (for JSON responses)
- `Content-Type: application/pdf` (for PDF downloads)
- `Content-Disposition: attachment; filename="..."` (for file downloads)

**Security Headers:**
All responses must include security headers:
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS only)
- `Referrer-Policy: strict-origin-when-cross-origin`

### 4.3 Request Body Format

**JSON Request Body:**
- All request bodies must be valid JSON
- Content-Type header must be `application/json`
- Field names use camelCase (e.g., `powerplantId`, `checkupId`)
- All required fields must be present
- Field types must match specification

### 4.4 Response Body Format

**Success Response:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "error": "ERROR_CODE",
  "message": "User-friendly error message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Pagination (if applicable):**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 5. Input Validation

### 5.1 Validation Rules

All user input must be validated using Zod schemas before processing:

**Validation Requirements:**
- **Usernames**: 3-50 characters, alphanumeric and underscore only
- **Emails**: Valid email format, 5-255 characters, lowercase
- **Passwords**: 8-128 characters, any characters allowed
- **UUIDs**: Valid UUID v4 format for all ID parameters
- **Status Values**: Enum validation (bad, average, good for checkup status; In Progress, Finished for project status)
- **Text Fields**: Maximum length enforced based on database constraints

**Validation Response:**
Validation errors return HTTP 400 with detailed field errors:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 5.2 SQL Injection Prevention

- All database queries must use Prisma ORM with parameterized queries
- No raw SQL queries with string concatenation
- User input never directly inserted into SQL statements
- Prisma automatically escapes and parameterizes all queries

### 5.3 XSS Prevention

- All user-generated content escaped before rendering
- React automatically escapes content in JSX
- No innerHTML or dangerouslySetInnerHTML with user input
- Content Security Policy headers enforced

## 6. Performance Requirements

### 6.1 Response Time Requirements

**API Response Times:**
- Authentication endpoints: Under 500 milliseconds
- GET endpoints (list): Under 500 milliseconds
- GET endpoints (single resource): Under 1 second
- POST endpoints (create): Under 500 milliseconds
- PATCH endpoints (update): Under 300 milliseconds
- POST /api/projects/:id/finish: Under 5 seconds (includes PDF generation)

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

### 6.2 Database Query Optimization

- Use database indexes for all foreign keys and frequently queried fields
- Avoid N+1 query problems (use Prisma include/select efficiently)
- Use database transactions for multi-step operations
- Implement query result caching where appropriate (5-minute cache for powerplant lists)

### 6.3 Rate Limiting

- Rate limit: 100 requests per minute per user session
- Rate limit response: HTTP 429 (Too Many Requests)
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 7. Data Structure References

All API endpoints must reference and comply with the data structure specification:

**Reference**: See `specs/03-technical-specifications/01-data-structure-specification.md` for:
- Entity relationships and constraints
- Field types and validation rules
- Foreign key relationships
- Unique constraints
- Data integrity rules

**Key Entities:**
- User (id, username, email, password_hash, created_at, updated_at)
- Powerplant (id, name, location, created_at, updated_at)
- Part (id, powerplant_id, name, description, display_order, created_at, updated_at)
- Checkup (id, part_id, name, description, documentation_images, documentation_text, display_order, created_at, updated_at)
- Project (id, user_id, powerplant_id, status, created_at, finished_at, updated_at)
- CheckupStatus (id, project_id, checkup_id, status_value, created_at, updated_at)

## 8. Testing Requirements

### 8.1 Mockability

All APIs must be designed to be testable in a mockable way:
- No direct calls to external APIs
- All external dependencies must be abstracted
- Database operations must be mockable (use Prisma with test database or mocks)
- PDF generation must be mockable (abstract PDF service)
- Session management must be mockable (abstract session store)

### 8.2 Test Coverage

- Unit tests for all business logic
- Integration tests for all API endpoints
- Test coverage: Minimum 80% for backend APIs
- All validation rules must have corresponding tests
- All error cases must have corresponding tests

## 9. API Versioning

**Current Version**: v1 (implicit, no version prefix)

**Versioning Strategy:**
- Breaking changes require new version prefix (/api/v2/, /api/v3/, etc.)
- Backward compatibility maintained for at least 1 major version
- Non-breaking changes (new optional fields, new endpoints) can be added to current version

## 10. CORS Configuration

**CORS Settings:**
- Allowed origins: Configured in @fastify/cors plugin
- Allowed methods: GET, POST, PATCH, OPTIONS
- Allowed headers: Content-Type, Authorization
- Credentials: true (for session cookies)

## 11. Health Check

**Endpoint**: `GET /api/health`

**Purpose**: Monitor application and database health

**Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- 200 OK: Application and database are healthy
- 503 Service Unavailable: Database connection failed

## 12. Documentation Standards

Each API endpoint documentation must include:
- HTTP method and path
- Authentication requirements
- Request schema (headers, query parameters, request body with field types, validation rules, examples)
- Response schema (status codes, response body structure with field types, examples)
- Error handling (all possible error responses with status codes and error message formats)
- Business logic rules and validations
- Performance requirements
- Request/response examples in JSON format

All documentation must be detailed enough so there is no place for interpretation in the implementation (test-driven development approach).
