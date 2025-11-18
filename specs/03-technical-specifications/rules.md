# API Rules and Standards

This document defines general rules and standards that apply to all API endpoints in the Wind Power Plant Status Investigation application.

## API Path Prefix

- All APIs must be under the `/api/` path prefix
- Example: `/api/auth/login`, `/api/projects`, `/api/powerplants`

## RESTful Design Principles

- Follow RESTful conventions for resource naming and HTTP methods
- Use HTTP methods semantically:
  - `GET`: Retrieve resources (read-only operations)
  - `POST`: Create new resources
  - `PUT`: Update existing resources (full replacement)
  - `DELETE`: Remove resources
- Use resource-based URLs: `/api/projects/:id` instead of `/api/getProject`
- Use nested resources for related entities: `/api/projects/:id/checkups/:checkupId/status`
- Avoid verbs in URLs; use HTTP methods to indicate actions

## Request/Response Format

- All request and response bodies use JSON format
- Content-Type header: `application/json` for JSON requests
- Accept header: `application/json` for JSON responses
- File uploads use `multipart/form-data` content type
- File downloads use appropriate content types (e.g., `application/pdf`, `image/jpeg`)

## Authentication

- All endpoints except `/api/auth/register` and `/api/auth/login` require authentication
- Authentication uses JWT (JSON Web Token) via `fastify-jwt`
- Token format: Bearer token in Authorization header
  - Header: `Authorization: Bearer <token>`
- Token expiration: 7 days from issuance
- Token refresh: User must re-login after expiration (no refresh token mechanism)
- Unauthenticated requests return HTTP 401 with error message

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": "ErrorType",
  "message": "User-friendly error message",
  "details": {
    "field": "Additional error context (optional)"
  }
}
```

- `error`: Machine-readable error type (e.g., "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED")
- `message`: Human-readable error message suitable for display to users
- `details`: Optional object containing additional error context (validation errors, field-specific messages)

## HTTP Status Codes

Use appropriate HTTP status codes consistently:

- **200 OK**: Successful GET, PUT, DELETE requests
- **201 Created**: Successful POST request that creates a resource
- **400 Bad Request**: Invalid request data, validation errors, malformed JSON
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Authenticated user lacks permission to access resource
- **404 Not Found**: Requested resource does not exist
- **500 Internal Server Error**: Unexpected server errors, database failures
- **504 Gateway Timeout**: Request timeout, PDF generation timeout
- **507 Insufficient Storage**: Storage limit reached, disk space errors

## Request Validation

- All endpoints must validate input data before processing
- Validation errors return HTTP 400 with specific field-level error messages
- Required fields must be present and non-empty
- Data types must match expected schema (string, number, UUID, enum, etc.)
- UUID format validation for all ID parameters
- Enum value validation for status fields (bad/average/good, in_progress/finished)
- File upload validation: type (JPEG, PNG, GIF, PDF), size (max 10 MB)

## Response Time Expectations

- Authentication operations: < 1 second
- Simple queries: < 500 milliseconds
- Complex queries with joins: < 1 second
- File uploads: Depends on file size (2-10 seconds)
- PDF generation: < 10 seconds for typical projects
- All endpoints should respond within 30 seconds (timeout limit)

## File Upload Handling

- Use `multipart/form-data` content type for file uploads
- Validate file type (MIME type checking): JPEG, PNG, GIF, PDF only
- Validate file size: Maximum 10 MB per file
- Sanitize filenames to prevent path traversal attacks
- Store files with UUID-based names, preserve original filename in database
- Return file metadata (id, filename, size, type, description) in response

## File Download Handling

- Stream files directly to client (do not load entire file into memory)
- Set appropriate Content-Type header based on file MIME type
- Set Content-Disposition header for proper filename handling
- Verify user authentication and project ownership before serving files
- Return HTTP 404 if file not found or user lacks access

## Pagination

- Currently not required for any endpoints (all lists are small)
- Future pagination should use query parameters: `?page=1&limit=20`
- Paginated responses should include metadata: `{ data: [], total: 100, page: 1, limit: 20 }`

## API Versioning

- API versioning via URL path: `/api/v1/` (not implemented in initial version)
- Backward compatibility maintained within major versions
- Breaking changes require new version number

## Mockability and Testability

- All APIs must be testable in isolation
- No direct external API calls; use dependency injection
- Database operations must be abstracted (repository pattern)
- PDF generation must be mockable (service abstraction)
- File storage must be abstracted (storage service interface)
- All dependencies injectable for unit testing

## Logging Requirements

- Log all errors with context:
  - User ID (if authenticated)
  - Endpoint path and HTTP method
  - Request timestamp
  - Error message and stack trace
- Log authentication failures (without exposing credentials)
- Log authorization failures (unauthorized access attempts)
- Log file operations (upload, download, delete)
- Log PDF generation operations (start, completion, failures)
- User-facing error messages must not expose internal system details

## Access Control Rules

- Users can only access their own projects (user_id verification)
- Project ownership verified on every project-related request
- CheckupStatus and Documentation inherit project access control
- Unauthorized access attempts logged as security events
- All authenticated endpoints must verify user permissions

## Database Error Handling

- Connection errors: Return HTTP 500 with generic message
- Query timeouts: Return HTTP 504 with timeout message
- Constraint violations: Return HTTP 400 with specific constraint error
- Transaction rollback on any error within transaction scope
- Use parameterized queries only (prevent SQL injection)

## File Operation Error Handling

- File upload failures: HTTP 500 with retry message
- File not found: HTTP 404
- File read errors: HTTP 500
- Disk space errors: HTTP 507 with storage limit message
- File validation errors: HTTP 400 with specific validation message

## PDF Generation Error Handling

- Generation failures: HTTP 500 with retry message
- Generation timeout: HTTP 504 with timeout message
- Missing data: HTTP 400 with incomplete data message
- Queue full: HTTP 503 with service busy message

## Security Requirements

- All user inputs validated and sanitized
- SQL injection prevention: Parameterized queries only
- XSS prevention: Output encoding for user-generated content
- CSRF protection: JWT tokens in Authorization header (not cookies)
- HTTPS required in production (HTTP redirects to HTTPS)
- File paths stored in database, not exposed directly
- File serving via secure API endpoints with authentication

## CORS (Cross-Origin Resource Sharing)

- CORS headers configured appropriately for frontend domain
- Allow credentials for authenticated requests
- Restrict allowed origins in production

## Rate Limiting

- File uploads: 10 uploads per minute per user
- API requests: No rate limiting in initial version (future consideration)
- PDF generation: Queue-based limiting (5 concurrent generations)

## Request/Response Examples

All API documentation must include:
- Complete request schema with types and required fields
- Complete response schema for success cases
- Error response examples for all error scenarios
- HTTP status codes for all possible outcomes
- Business logic description
- Validation rules
- Access control rules
