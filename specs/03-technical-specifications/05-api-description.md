# 5 - API Description

This document provides comprehensive API specifications for the Wind Power Plant Status Investigation application. All APIs follow RESTful principles and use JWT-based authentication.

## 1. Introduction

### Authentication Mechanism

The application uses JWT (JSON Web Token) based authentication implemented with `fastify-jwt`. 

**Token Format:**
- Tokens are sent in the `Authorization` header as Bearer tokens
- Format: `Authorization: Bearer <token>`
- Tokens contain user ID and expiration timestamp

**Token Expiration:**
- Tokens expire after 7 days from issuance
- No refresh token mechanism; users must re-login after expiration

**Authentication Requirements:**
- All endpoints except `/api/auth/register` and `/api/auth/login` require authentication
- Unauthenticated requests to protected endpoints return HTTP 401

**Example Authenticated Request:**
```
GET /api/projects HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": "ERROR_TYPE",
  "message": "User-friendly error message",
  "details": {
    "field": "Additional context (optional)"
  }
}
```

**Error Types:**
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required or invalid
- `FORBIDDEN`: Access denied
- `INTERNAL_ERROR`: Server error
- `TIMEOUT_ERROR`: Request timeout
- `STORAGE_ERROR`: Storage limit reached

### Logging and Error Handling Patterns

**Error Logging:**
- All errors logged with context: user ID, endpoint, timestamp, error message, stack trace
- Authentication failures logged (without credentials)
- Authorization failures logged as security events
- Database errors logged with query context
- File operation errors logged with file metadata
- PDF generation errors logged with project context

**User-Facing vs Internal Errors:**
- User-facing messages: Generic, non-technical, actionable
- Internal errors: Detailed technical information in logs only
- Never expose database structure, file paths, or internal system details to users

**HTTP Status Code Usage:**
- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful resource creation
- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Authenticated but lacks permission
- **404 Not Found**: Resource does not exist
- **500 Internal Server Error**: Unexpected server errors
- **504 Gateway Timeout**: Request or operation timeout
- **507 Insufficient Storage**: Storage limit reached

**Request Validation Error Format:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "username": "Username is required",
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**Database Error Handling:**
- Connection errors: HTTP 500, generic message, retry with exponential backoff
- Query timeouts: HTTP 504, timeout message
- Constraint violations: HTTP 400, specific constraint message
- Transaction rollback on errors

**File Operation Error Handling:**
- Upload failures: HTTP 500, retry message
- File not found: HTTP 404
- Read errors: HTTP 500
- Disk space: HTTP 507, storage limit message
- Validation errors: HTTP 400, specific validation message

**PDF Generation Error Handling:**
- Generation failures: HTTP 500, retry message
- Timeout: HTTP 504, timeout message
- Missing data: HTTP 400, incomplete data message
- Queue full: HTTP 503, service busy message

---

## 2. Authentication APIs

### 2.1 POST /api/auth/register

**Description:** Creates a new user account and automatically logs the user in.

**Authentication:** Not required

**Request Schema:**
```json
{
  "username": "string (required, 3-255 characters, unique)",
  "email": "string (required, valid email format, unique)",
  "password": "string (required, minimum 8 characters, contains letters and numbers)",
  "passwordConfirmation": "string (required, must match password)"
}
```

**Validation Rules:**
- `username`: Required, 3-255 characters, alphanumeric and underscores only, unique
- `email`: Required, valid email format, unique in database
- `password`: Required, minimum 8 characters, must contain at least one letter and one number
- `passwordConfirmation`: Required, must exactly match `password`

**Response Schema (Success - 201 Created):**
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

**Response Schema (Error - 400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "username": "Username already taken. Please choose another.",
    "email": "Email address already registered.",
    "password": "Password must be at least 8 characters and contain letters and numbers.",
    "passwordConfirmation": "Passwords do not match."
  }
}
```

**HTTP Status Codes:**
- **201 Created**: User registered successfully, token returned
- **400 Bad Request**: Validation error (username taken, email taken, password requirements, passwords don't match)
- **500 Internal Server Error**: Database error, password hashing error

**Error Cases:**
- Username already exists: `"Username already taken. Please choose another."`
- Email already exists: `"Email address already registered."`
- Password too short: `"Password must be at least 8 characters and contain letters and numbers."`
- Passwords don't match: `"Passwords do not match."`
- Database error: `"Unable to create account. Please try again."`

**Business Logic:**
1. Validate all input fields
2. Check username uniqueness
3. Check email uniqueness
4. Validate password meets requirements
5. Verify password and passwordConfirmation match
6. Hash password using bcrypt (12 salt rounds)
7. Create user record in database
8. Generate JWT token with user ID
9. Return token and user information

**Request Example:**
```json
POST /api/auth/register
Content-Type: application/json

{
  "username": "inspector1",
  "email": "inspector1@example.com",
  "password": "SecurePass123",
  "passwordConfirmation": "SecurePass123"
}
```

**Response Example (Success):**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "inspector1",
    "email": "inspector1@example.com"
  }
}
```

---

### 2.2 POST /api/auth/login

**Description:** Authenticates an existing user and returns a JWT token.

**Authentication:** Not required

**Request Schema:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Validation Rules:**
- `username`: Required, non-empty string
- `password`: Required, non-empty string

**Response Schema (Success - 200 OK):**
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

**Response Schema (Error - 401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid username or password."
}
```

**HTTP Status Codes:**
- **200 OK**: Login successful, token returned
- **401 Unauthorized**: Invalid username or password
- **500 Internal Server Error**: Database error, password comparison error

**Error Cases:**
- Username not found: `"Invalid username or password."` (generic message for security)
- Password incorrect: `"Invalid username or password."` (generic message for security)
- Account disabled: `"Account is currently disabled. Please contact administrator."` (if implemented)

**Business Logic:**
1. Validate username and password are provided
2. Retrieve user from database by username
3. If user not found, return generic error (security)
4. Compare provided password with stored password hash using bcrypt
5. If password doesn't match, return generic error (security)
6. Generate JWT token with user ID and expiration (7 days)
7. Return token and user information

**Request Example:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "inspector1",
  "password": "SecurePass123"
}
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "inspector1",
    "email": "inspector1@example.com"
  }
}
```

---

## 3. Project Management APIs

### 3.1 GET /api/projects

**Description:** Retrieves a list of all projects assigned to the authenticated user.

**Authentication:** Required

**Request Schema:**
- No request body
- Query parameters: None (future: pagination support)

**Response Schema (Success - 200 OK):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "powerplantName": "string",
      "status": "in_progress" | "finished",
      "createdAt": "ISO 8601 timestamp",
      "finishedAt": "ISO 8601 timestamp | null"
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Unauthorized. Please login."
}
```

**Response Schema (Error - 500 Internal Server Error):**
```json
{
  "error": "INTERNAL_ERROR",
  "message": "Unable to load projects. Please try again."
}
```

**HTTP Status Codes:**
- **200 OK**: Projects retrieved successfully
- **401 Unauthorized**: Missing or invalid authentication token
- **500 Internal Server Error**: Database query error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Invalid token: `"Unauthorized. Please login."`
- Database error: `"Unable to load projects. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Query database for all projects where user_id matches authenticated user
3. Join with Powerplant table to get powerplant name
4. Sort by creation date (newest first)
5. Return project list with powerplant name and status

**Access Control:**
- Users can only see their own projects
- No access to other users' projects

**Request Example:**
```
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "projects": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "powerplantName": "Wind Farm Alpha",
      "status": "in_progress",
      "createdAt": "2024-01-15T10:30:00Z",
      "finishedAt": null
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "powerplantName": "Wind Farm Beta",
      "status": "finished",
      "createdAt": "2024-01-10T08:15:00Z",
      "finishedAt": "2024-01-12T14:20:00Z"
    }
  ]
}
```

**Response Example (Empty):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "projects": []
}
```

---

### 3.2 POST /api/projects

**Description:** Creates a new inspection project for the authenticated user by selecting a powerplant.

**Authentication:** Required

**Request Schema:**
```json
{
  "powerplantId": "uuid (required)"
}
```

**Validation Rules:**
- `powerplantId`: Required, valid UUID format, must exist in database

**Response Schema (Success - 201 Created):**
```json
{
  "id": "uuid",
  "powerplantId": "uuid",
  "powerplantName": "string",
  "status": "in_progress",
  "createdAt": "ISO 8601 timestamp",
  "finishedAt": null
}
```

**Response Schema (Error - 400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Please select a powerplant."
}
```

**Response Schema (Error - 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Powerplant not found."
}
```

**HTTP Status Codes:**
- **201 Created**: Project created successfully
- **400 Bad Request**: Missing or invalid powerplantId
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Powerplant does not exist
- **500 Internal Server Error**: Database error, project creation failure

**Error Cases:**
- Missing powerplantId: `"Please select a powerplant."`
- Invalid UUID format: `"Invalid powerplant ID format."`
- Powerplant not found: `"Powerplant not found."`
- Database error: `"Unable to create project. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate powerplantId is provided and valid UUID
3. Verify powerplant exists in database
4. Create new Project record with:
   - user_id: authenticated user ID
   - powerplant_id: provided powerplantId
   - status: "in_progress"
   - created_at: current timestamp
5. Retrieve all parts for the powerplant
6. For each part, retrieve all checkups
7. Create CheckupStatus record for each checkup with:
   - project_id: new project ID
   - checkup_id: checkup ID
   - status: null (unset)
8. Return created project with powerplant name

**Access Control:**
- Project automatically assigned to authenticated user
- No additional permissions required

**Request Example:**
```json
POST /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "powerplantId": "880e8400-e29b-41d4-a716-446655440000"
}
```

**Response Example (Success):**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "powerplantId": "880e8400-e29b-41d4-a716-446655440000",
  "powerplantName": "Wind Farm Gamma",
  "status": "in_progress",
  "createdAt": "2024-01-20T09:00:00Z",
  "finishedAt": null
}
```

---

### 3.3 GET /api/projects/:id

**Description:** Retrieves detailed information about a specific project, including powerplant name, all parts, checkups, their statuses, and documentation metadata.

**Authentication:** Required

**Request Schema:**
- Path parameter: `id` (UUID, required)
- No request body

**Validation Rules:**
- `id`: Required, valid UUID format

**Response Schema (Success - 200 OK):**
```json
{
  "id": "uuid",
  "powerplantId": "uuid",
  "powerplantName": "string",
  "status": "in_progress" | "finished",
  "createdAt": "ISO 8601 timestamp",
  "finishedAt": "ISO 8601 timestamp | null",
  "parts": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "checkups": [
        {
          "id": "uuid",
          "name": "string",
          "description": "string | null",
          "status": "bad" | "average" | "good" | null
        }
      ],
      "documentation": [
        {
          "id": "uuid",
          "fileName": "string",
          "fileType": "string",
          "fileSize": "number",
          "description": "string | null",
          "createdAt": "ISO 8601 timestamp"
        }
      ]
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Unauthorized. Please login."
}
```

**Response Schema (Error - 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to view this project."
}
```

**Response Schema (Error - 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Project not found."
}
```

**HTTP Status Codes:**
- **200 OK**: Project details retrieved successfully
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User does not own this project
- **404 Not Found**: Project does not exist
- **500 Internal Server Error**: Database query error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Invalid token: `"Unauthorized. Please login."`
- Project not found: `"Project not found."`
- User doesn't own project: `"You do not have permission to view this project."`
- Database error: `"Unable to load project details. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID is valid UUID
3. Retrieve project from database
4. Verify project exists
5. Verify project.user_id matches authenticated user ID
6. Retrieve powerplant information
7. Retrieve all parts for the powerplant
8. For each part:
   - Retrieve all checkups
   - Retrieve checkup statuses for this project
   - Retrieve documentation metadata (not file contents) for this part and project
9. Combine data into nested structure
10. Return complete project details

**Access Control:**
- Users can only view their own projects
- Project ownership verified by comparing project.user_id with authenticated user ID

**Request Example:**
```
GET /api/projects/990e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "powerplantId": "880e8400-e29b-41d4-a716-446655440000",
  "powerplantName": "Wind Farm Gamma",
  "status": "in_progress",
  "createdAt": "2024-01-20T09:00:00Z",
  "finishedAt": null,
  "parts": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "name": "Blades",
      "description": "Wind turbine blades",
      "checkups": [
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440000",
          "name": "Blade surface inspection",
          "description": "Check for cracks and damage",
          "status": "good"
        },
        {
          "id": "cc0e8400-e29b-41d4-a716-446655440000",
          "name": "Blade balance check",
          "description": "Verify blade balance",
          "status": null
        }
      ],
      "documentation": [
        {
          "id": "dd0e8400-e29b-41d4-a716-446655440000",
          "fileName": "blade_photo.jpg",
          "fileType": "image/jpeg",
          "fileSize": 2456789,
          "description": "Blade surface photo",
          "createdAt": "2024-01-20T10:15:00Z"
        }
      ]
    }
  ]
}
```

---

## 4. Checkup Management APIs

### 4.1 PUT /api/projects/:id/checkups/:checkupId/status

**Description:** Updates the status of a specific checkup within a project. Status can be set to bad, average, or good.

**Authentication:** Required

**Request Schema:**
```json
{
  "status": "bad" | "average" | "good" (required)
}
```

**Validation Rules:**
- `status`: Required, must be one of: "bad", "average", "good"
- `id` (path): Required, valid UUID, project must exist and belong to user
- `checkupId` (path): Required, valid UUID, checkup must belong to project's powerplant

**Response Schema (Success - 200 OK):**
```json
{
  "id": "uuid (checkupStatus id)",
  "checkupId": "uuid",
  "status": "bad" | "average" | "good",
  "updatedAt": "ISO 8601 timestamp"
}
```

**Response Schema (Error - 400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Status must be one of: bad, average, good"
}
```

**Response Schema (Error - 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "Cannot modify checkups in a finished project."
}
```

**HTTP Status Codes:**
- **200 OK**: Status updated successfully
- **400 Bad Request**: Invalid status value, validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Project is finished, user doesn't own project, checkup doesn't belong to project
- **404 Not Found**: Project or checkup not found
- **500 Internal Server Error**: Database update error

**Error Cases:**
- Missing status: `"Status is required."`
- Invalid status value: `"Status must be one of: bad, average, good"`
- Project not found: `"Project not found."`
- Project is finished: `"Cannot modify checkups in a finished project."`
- User doesn't own project: `"You do not have permission to modify this project."`
- Checkup not found: `"Checkup not found."`
- Checkup doesn't belong to project's powerplant: `"Checkup does not belong to this project."`
- Database error: `"Unable to save status. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID and checkup ID are valid UUIDs
3. Validate status is one of: "bad", "average", "good"
4. Retrieve project from database
5. Verify project exists
6. Verify project.user_id matches authenticated user ID
7. Verify project.status is "in_progress" (cannot modify finished projects)
8. Verify checkup exists and belongs to a part of the project's powerplant
9. Retrieve or create CheckupStatus record for this project and checkup
10. Update CheckupStatus.status with new value
11. Update CheckupStatus.updated_at timestamp
12. Return updated checkup status

**Access Control:**
- Users can only update checkups in their own projects
- Cannot update checkups in finished projects
- Checkup must belong to project's powerplant

**Request Example:**
```json
PUT /api/projects/990e8400-e29b-41d4-a716-446655440000/checkups/bb0e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "good"
}
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "ee0e8400-e29b-41d4-a716-446655440000",
  "checkupId": "bb0e8400-e29b-41d4-a716-446655440000",
  "status": "good",
  "updatedAt": "2024-01-20T11:30:00Z"
}
```

---

## 5. Documentation APIs

### 5.1 GET /api/projects/:id/parts/:partId/documentation

**Description:** Retrieves metadata for all documentation files associated with a specific part within a project.

**Authentication:** Required

**Request Schema:**
- Path parameters:
  - `id` (UUID, required): Project ID
  - `partId` (UUID, required): Part ID
- No request body

**Validation Rules:**
- `id`: Required, valid UUID, project must exist and belong to user
- `partId`: Required, valid UUID, part must belong to project's powerplant

**Response Schema (Success - 200 OK):**
```json
{
  "documentation": [
    {
      "id": "uuid",
      "fileName": "string",
      "fileType": "string",
      "fileSize": "number",
      "description": "string | null",
      "createdAt": "ISO 8601 timestamp"
    }
  ]
}
```

**Response Schema (Error - 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to view this project."
}
```

**Response Schema (Error - 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Project or part not found."
}
```

**HTTP Status Codes:**
- **200 OK**: Documentation metadata retrieved successfully
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't own project
- **404 Not Found**: Project or part not found
- **500 Internal Server Error**: Database query error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Project not found: `"Project not found."`
- User doesn't own project: `"You do not have permission to view this project."`
- Part not found: `"Part not found."`
- Part doesn't belong to project's powerplant: `"Part does not belong to this project."`
- Database error: `"Unable to load documentation. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID and part ID are valid UUIDs
3. Retrieve project from database
4. Verify project exists
5. Verify project.user_id matches authenticated user ID
6. Verify part exists and belongs to project's powerplant
7. Query Documentation table for records where:
   - project_id = project ID
   - part_id = part ID
8. Return documentation metadata (not file contents)

**Access Control:**
- Users can only view documentation for their own projects
- Part must belong to project's powerplant

**Request Example:**
```
GET /api/projects/990e8400-e29b-41d4-a716-446655440000/parts/aa0e8400-e29b-41d4-a716-446655440000/documentation
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "documentation": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440000",
      "fileName": "blade_photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 2456789,
      "description": "Blade surface photo showing minor wear",
      "createdAt": "2024-01-20T10:15:00Z"
    },
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440000",
      "fileName": "blade_damage.pdf",
      "fileType": "application/pdf",
      "fileSize": 1234567,
      "description": "Damage assessment report",
      "createdAt": "2024-01-20T10:20:00Z"
    }
  ]
}
```

**Response Example (Empty):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "documentation": []
}
```

---

### 5.2 POST /api/projects/:id/parts/:partId/documentation

**Description:** Uploads a documentation file (image or PDF) for a specific part within a project.

**Authentication:** Required

**Request Schema:**
- Content-Type: `multipart/form-data`
- Form fields:
  - `file` (File, required): File to upload (JPEG, PNG, GIF, PDF, max 10 MB)
  - `description` (string, optional): Description of the documentation

**Validation Rules:**
- `id` (path): Required, valid UUID, project must exist and belong to user
- `partId` (path): Required, valid UUID, part must belong to project's powerplant
- `file`: Required, valid file, MIME type: image/jpeg, image/png, image/gif, application/pdf
- `file`: Maximum size: 10 MB
- `description`: Optional, string, max 1000 characters

**Response Schema (Success - 201 Created):**
```json
{
  "id": "uuid",
  "fileName": "string",
  "fileType": "string",
  "fileSize": "number",
  "description": "string | null",
  "createdAt": "ISO 8601 timestamp"
}
```

**Response Schema (Error - 400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "File validation failed",
  "details": {
    "file": "File type must be JPEG, PNG, GIF, or PDF. Maximum size: 10 MB."
  }
}
```

**Response Schema (Error - 507 Insufficient Storage):**
```json
{
  "error": "STORAGE_ERROR",
  "message": "Storage limit reached. Please contact administrator."
}
```

**HTTP Status Codes:**
- **201 Created**: File uploaded successfully
- **400 Bad Request**: Invalid file type, file too large, validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't own project, project is finished
- **404 Not Found**: Project or part not found
- **500 Internal Server Error**: File upload error, database error
- **507 Insufficient Storage**: Storage limit reached

**Error Cases:**
- Missing file: `"File is required."`
- Invalid file type: `"File type must be JPEG, PNG, GIF, or PDF."`
- File too large: `"File size exceeds 10 MB limit."`
- Project not found: `"Project not found."`
- User doesn't own project: `"You do not have permission to upload documentation for this project."`
- Project is finished: `"Cannot upload documentation to a finished project."`
- Part not found: `"Part not found."`
- Part doesn't belong to project: `"Part does not belong to this project."`
- Storage limit reached: `"Storage limit reached. Please contact administrator."`
- Upload failure: `"File upload failed. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID and part ID are valid UUIDs
3. Retrieve project from database
4. Verify project exists
5. Verify project.user_id matches authenticated user ID
6. Verify project.status is "in_progress" (cannot upload to finished projects)
7. Verify part exists and belongs to project's powerplant
8. Validate file:
   - Check MIME type (image/jpeg, image/png, image/gif, application/pdf)
   - Check file size (max 10 MB)
   - Check project storage limit (max 500 MB total)
9. Generate UUID for file storage name
10. Sanitize original filename
11. Store file on filesystem with UUID name
12. Create Documentation record in database:
    - part_id: part ID
    - project_id: project ID
    - file_path: filesystem path
    - file_type: MIME type
    - file_name: original filename
    - file_size: file size in bytes
    - description: optional description
13. Return documentation metadata

**Access Control:**
- Users can only upload documentation to their own projects
- Cannot upload to finished projects
- Part must belong to project's powerplant

**Request Example:**
```
POST /api/projects/990e8400-e29b-41d4-a716-446655440000/parts/aa0e8400-e29b-41d4-a716-446655440000/documentation
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="blade_photo.jpg"
Content-Type: image/jpeg

[binary file data]
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="description"

Blade surface photo showing minor wear
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Response Example (Success):**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "gg0e8400-e29b-41d4-a716-446655440000",
  "fileName": "blade_photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2456789,
  "description": "Blade surface photo showing minor wear",
  "createdAt": "2024-01-20T12:00:00Z"
}
```

---

### 5.3 DELETE /api/projects/:id/documentation/:documentationId

**Description:** Deletes a documentation file from a project.

**Authentication:** Required

**Request Schema:**
- Path parameters:
  - `id` (UUID, required): Project ID
  - `documentationId` (UUID, required): Documentation ID
- No request body

**Validation Rules:**
- `id`: Required, valid UUID, project must exist and belong to user
- `documentationId`: Required, valid UUID, documentation must belong to project

**Response Schema (Success - 200 OK):**
```json
{
  "message": "Documentation deleted successfully"
}
```

**Response Schema (Error - 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "Cannot delete documentation from a finished project."
}
```

**Response Schema (Error - 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Documentation not found."
}
```

**HTTP Status Codes:**
- **200 OK**: Documentation deleted successfully
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't own project, project is finished
- **404 Not Found**: Documentation not found
- **500 Internal Server Error**: File deletion error, database error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Project not found: `"Project not found."`
- User doesn't own project: `"You do not have permission to delete documentation from this project."`
- Project is finished: `"Cannot delete documentation from a finished project."`
- Documentation not found: `"Documentation not found."`
- Documentation doesn't belong to project: `"Documentation does not belong to this project."`
- File deletion error: `"Unable to delete file. Please try again."`
- Database error: `"Unable to delete documentation. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID and documentation ID are valid UUIDs
3. Retrieve project from database
4. Verify project exists
5. Verify project.user_id matches authenticated user ID
6. Verify project.status is "in_progress" (cannot delete from finished projects)
7. Retrieve Documentation record from database
8. Verify documentation exists
9. Verify documentation.project_id matches project ID
10. Delete file from filesystem
11. Delete Documentation record from database
12. Return success message

**Access Control:**
- Users can only delete documentation from their own projects
- Cannot delete from finished projects
- Documentation must belong to the project

**Request Example:**
```
DELETE /api/projects/990e8400-e29b-41d4-a716-446655440000/documentation/dd0e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Documentation deleted successfully"
}
```

---

### 5.4 GET /api/projects/:id/documentation/:documentationId/file

**Description:** Downloads a documentation file from a project. Streams the file directly to the client.

**Authentication:** Required

**Request Schema:**
- Path parameters:
  - `id` (UUID, required): Project ID
  - `documentationId` (UUID, required): Documentation ID
- No request body

**Validation Rules:**
- `id`: Required, valid UUID, project must exist and belong to user
- `documentationId`: Required, valid UUID, documentation must belong to project

**Response Schema (Success - 200 OK):**
- Content-Type: Based on file MIME type (image/jpeg, image/png, image/gif, application/pdf)
- Content-Disposition: `attachment; filename="<original_filename>"`
- Body: Binary file stream

**Response Schema (Error - 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to access this file."
}
```

**Response Schema (Error - 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "File not found."
}
```

**HTTP Status Codes:**
- **200 OK**: File streamed successfully
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't own project
- **404 Not Found**: File or documentation not found
- **500 Internal Server Error**: File read error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Project not found: `"Project not found."`
- User doesn't own project: `"You do not have permission to access this file."`
- Documentation not found: `"File not found."`
- Documentation doesn't belong to project: `"File not found."`
- File not found on filesystem: `"File not found."`
- File read error: `"Unable to read file. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID and documentation ID are valid UUIDs
3. Retrieve project from database
4. Verify project exists
5. Verify project.user_id matches authenticated user ID
6. Retrieve Documentation record from database
7. Verify documentation exists
8. Verify documentation.project_id matches project ID
9. Read file from filesystem using file_path
10. Stream file to client with appropriate headers:
    - Content-Type: documentation.file_type
    - Content-Disposition: attachment; filename="<original_filename>"
11. Stream file data

**Access Control:**
- Users can only download files from their own projects
- Documentation must belong to the project

**Request Example:**
```
GET /api/projects/990e8400-e29b-41d4-a716-446655440000/documentation/dd0e8400-e29b-41d4-a716-446655440000/file
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: attachment; filename="blade_photo.jpg"
Content-Length: 2456789

[binary file data stream]
```

---

## 6. Powerplant APIs

### 6.1 GET /api/powerplants

**Description:** Retrieves a list of all available powerplants that can be selected when creating a new project.

**Authentication:** Required

**Request Schema:**
- No request body
- Query parameters: None (future: pagination support)

**Response Schema (Success - 200 OK):**
```json
{
  "powerplants": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "partsCount": "number",
      "checkupsCount": "number"
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Unauthorized. Please login."
}
```

**HTTP Status Codes:**
- **200 OK**: Powerplants retrieved successfully
- **401 Unauthorized**: Missing or invalid authentication token
- **500 Internal Server Error**: Database query error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Invalid token: `"Unauthorized. Please login."`
- Database error: `"Unable to load powerplants. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token (for authentication, not used in query)
2. Query database for all Powerplant records
3. For each powerplant, count associated parts and checkups
4. Return powerplant list with counts

**Access Control:**
- All authenticated users can view all powerplants
- No ownership restrictions (powerplants are shared resources)

**Request Example:**
```
GET /api/powerplants
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "powerplants": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "name": "Wind Farm Alpha",
      "description": "Primary wind farm location",
      "partsCount": 8,
      "checkupsCount": 24
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "name": "Wind Farm Beta",
      "description": "Secondary wind farm location",
      "partsCount": 10,
      "checkupsCount": 30
    }
  ]
}
```

---

### 6.2 GET /api/powerplants/:id

**Description:** Retrieves detailed information about a specific powerplant, including all parts and their associated checkups. Used for preview when creating a new project.

**Authentication:** Required

**Request Schema:**
- Path parameter: `id` (UUID, required)
- No request body

**Validation Rules:**
- `id`: Required, valid UUID format

**Response Schema (Success - 200 OK):**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "parts": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "checkups": [
        {
          "id": "uuid",
          "name": "string",
          "description": "string | null"
        }
      ]
    }
  ]
}
```

**Response Schema (Error - 401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Unauthorized. Please login."
}
```

**Response Schema (Error - 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Powerplant not found."
}
```

**HTTP Status Codes:**
- **200 OK**: Powerplant details retrieved successfully
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Powerplant does not exist
- **500 Internal Server Error**: Database query error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Invalid token: `"Unauthorized. Please login."`
- Powerplant not found: `"Powerplant not found."`
- Database error: `"Unable to load powerplant details. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token (for authentication, not used in query)
2. Validate powerplant ID is valid UUID
3. Retrieve powerplant from database
4. Verify powerplant exists
5. Retrieve all parts for the powerplant
6. For each part, retrieve all associated checkups
7. Combine data into nested structure
8. Return complete powerplant details

**Access Control:**
- All authenticated users can view all powerplants
- No ownership restrictions

**Request Example:**
```
GET /api/powerplants/880e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "name": "Wind Farm Alpha",
  "description": "Primary wind farm location",
  "parts": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "name": "Blades",
      "description": "Wind turbine blades",
      "checkups": [
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440000",
          "name": "Blade surface inspection",
          "description": "Check for cracks and damage"
        },
        {
          "id": "cc0e8400-e29b-41d4-a716-446655440000",
          "name": "Blade balance check",
          "description": "Verify blade balance"
        }
      ]
    },
    {
      "id": "hh0e8400-e29b-41d4-a716-446655440000",
      "name": "Gearbox",
      "description": "Turbine gearbox",
      "checkups": [
        {
          "id": "ii0e8400-e29b-41d4-a716-446655440000",
          "name": "Gearbox oil level",
          "description": "Check oil level and quality"
        }
      ]
    }
  ]
}
```

---

## 7. Report Generation APIs

### 7.1 POST /api/projects/:id/finish

**Description:** Finishes a project by generating a PDF report containing all project data (powerplant name, parts, checkups with statuses, and documentation). After successful generation, the project status is set to "finished" and the PDF is made available for download.

**Authentication:** Required

**Request Schema:**
- Path parameter: `id` (UUID, required)
- No request body

**Validation Rules:**
- `id`: Required, valid UUID, project must exist and belong to user

**Response Schema (Success - 200 OK):**
```json
{
  "message": "Project finished and PDF report generated successfully",
  "projectId": "uuid",
  "reportId": "uuid",
  "status": "finished",
  "finishedAt": "ISO 8601 timestamp"
}
```

**Response Schema (Error - 400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Cannot finish project. All checkups must have a status set."
}
```

**Response Schema (Error - 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "Cannot finish a project that is already finished."
}
```

**Response Schema (Error - 504 Gateway Timeout):**
```json
{
  "error": "TIMEOUT_ERROR",
  "message": "Report generation timeout. Please try again."
}
```

**HTTP Status Codes:**
- **200 OK**: PDF generated successfully, project marked as finished
- **400 Bad Request**: Not all checkups have status set, incomplete project data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't own project, project already finished
- **404 Not Found**: Project not found
- **500 Internal Server Error**: PDF generation error, database update error
- **504 Gateway Timeout**: PDF generation timeout (60 seconds)

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Project not found: `"Project not found."`
- User doesn't own project: `"You do not have permission to finish this project."`
- Project already finished: `"Cannot finish a project that is already finished."`
- Not all checkups have status: `"Cannot finish project. All checkups must have a status set."`
- PDF generation failure: `"Unable to generate PDF report. Please try again."` (project remains in_progress)
- PDF generation timeout: `"Report generation timeout. Please try again."` (project remains in_progress)
- Database update failure: `"PDF generated but project status update failed. Please contact support."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID is valid UUID
3. Retrieve project from database
4. Verify project exists
5. Verify project.user_id matches authenticated user ID
6. Verify project.status is "in_progress" (cannot finish already finished projects)
7. Retrieve all project data:
   - Powerplant name
   - All parts with their checkups
   - All checkup statuses
   - All documentation metadata and files
8. Validate all checkups have a status set (bad, average, or good)
9. If validation fails, return error (project remains in_progress)
10. Generate PDF using Puppeteer:
    - Create HTML template with project data
    - Include cover page with powerplant name and project date
    - Include table of contents
    - For each part:
      - Part name and description
      - List of checkups with statuses (bad/average/good)
      - Embedded images from documentation
      - Text descriptions from documentation
    - Include footer with page numbers
    - Convert HTML to PDF
11. Store generated PDF file on filesystem
12. Update project:
    - status: "finished"
    - finished_at: current timestamp
13. Return success response with project status

**Access Control:**
- Users can only finish their own projects
- Cannot finish already finished projects
- All checkups must have status set

**Request Example:**
```
POST /api/projects/990e8400-e29b-41d4-a716-446655440000/finish
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Project finished and PDF report generated successfully",
  "projectId": "990e8400-e29b-41d4-a716-446655440000",
  "reportId": "jj0e8400-e29b-41d4-a716-446655440000",
  "status": "finished",
  "finishedAt": "2024-01-20T15:00:00Z"
}
```

**Note:** The PDF file is stored and can be downloaded via GET /api/projects/:id/report endpoint.

---

### 7.2 GET /api/projects/:id/report

**Description:** Downloads the generated PDF report for a finished project. Streams the PDF file directly to the client.

**Authentication:** Required

**Request Schema:**
- Path parameter: `id` (UUID, required)
- No request body

**Validation Rules:**
- `id`: Required, valid UUID, project must exist and belong to user

**Response Schema (Success - 200 OK):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="report_<project_id>.pdf"`
- Body: Binary PDF file stream

**Response Schema (Error - 400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Project is not finished. PDF report not yet generated."
}
```

**Response Schema (Error - 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to access this report."
}
```

**Response Schema (Error - 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Report not found."
}
```

**HTTP Status Codes:**
- **200 OK**: PDF file streamed successfully
- **400 Bad Request**: Project not finished, PDF not generated
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't own project
- **404 Not Found**: Project or PDF file not found
- **500 Internal Server Error**: File read error

**Error Cases:**
- Missing token: `"Unauthorized. Please login."`
- Project not found: `"Project not found."`
- User doesn't own project: `"You do not have permission to access this report."`
- Project not finished: `"Project is not finished. PDF report not yet generated."`
- PDF file not found: `"Report not found."`
- File read error: `"Unable to read report. Please try again."`

**Business Logic:**
1. Extract user ID from JWT token
2. Validate project ID is valid UUID
3. Retrieve project from database
4. Verify project exists
5. Verify project.user_id matches authenticated user ID
6. Verify project.status is "finished"
7. Locate PDF file on filesystem (stored during finish operation)
8. Verify PDF file exists
9. Stream PDF file to client with headers:
   - Content-Type: application/pdf
   - Content-Disposition: attachment; filename="report_<project_id>.pdf"
10. Stream file data

**Access Control:**
- Users can only download reports for their own projects
- Project must be finished

**Request Example:**
```
GET /api/projects/990e8400-e29b-41d4-a716-446655440000/report
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (Success):**
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="report_990e8400-e29b-41d4-a716-446655440000.pdf"
Content-Length: 12345678

[binary PDF file data stream]
```

---

## 8. Health Check API

### 8.1 GET /api/health

**Description:** Health check endpoint to verify the API server is running and responsive. Used for monitoring and load balancer health checks.

**Authentication:** Not required

**Request Schema:**
- No request body
- No path parameters

**Response Schema (Success - 200 OK):**
```json
{
  "status": "ok",
  "timestamp": "ISO 8601 timestamp",
  "version": "string"
}
```

**HTTP Status Codes:**
- **200 OK**: Server is healthy and responsive
- **500 Internal Server Error**: Server error (should not occur for health check)

**Error Cases:**
- Server error: Returns HTTP 500 (unlikely for simple health check)

**Business Logic:**
1. Return simple JSON response indicating server is running
2. Include current timestamp
3. Include API version (if available)

**Access Control:**
- No authentication required
- Public endpoint

**Request Example:**
```
GET /api/health
```

**Response Example (Success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "timestamp": "2024-01-20T16:00:00Z",
  "version": "1.0.0"
}
```

---

## 9. API Summary

### Endpoint Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | User registration |
| POST | `/api/auth/login` | No | User login |
| GET | `/api/projects` | Yes | List user's projects |
| POST | `/api/projects` | Yes | Create new project |
| GET | `/api/projects/:id` | Yes | Get project details |
| PUT | `/api/projects/:id/checkups/:checkupId/status` | Yes | Update checkup status |
| GET | `/api/projects/:id/parts/:partId/documentation` | Yes | Get documentation metadata |
| POST | `/api/projects/:id/parts/:partId/documentation` | Yes | Upload documentation file |
| DELETE | `/api/projects/:id/documentation/:documentationId` | Yes | Delete documentation file |
| GET | `/api/projects/:id/documentation/:documentationId/file` | Yes | Download documentation file |
| GET | `/api/powerplants` | Yes | List available powerplants |
| GET | `/api/powerplants/:id` | Yes | Get powerplant details |
| POST | `/api/projects/:id/finish` | Yes | Finish project and generate PDF |
| GET | `/api/projects/:id/report` | Yes | Download PDF report |
| GET | `/api/health` | No | Health check |

### Common Patterns

**Authentication:**
- All protected endpoints require `Authorization: Bearer <token>` header
- Token extracted from JWT payload contains user ID
- User ID used for access control verification

**Access Control:**
- Users can only access their own projects
- Project ownership verified on every project-related request
- CheckupStatus and Documentation inherit project access control

**Error Handling:**
- Consistent error response format across all endpoints
- User-friendly error messages
- Detailed error logging with context
- Appropriate HTTP status codes

**Validation:**
- All inputs validated before processing
- UUID format validation for all ID parameters
- Enum value validation for status fields
- File type and size validation for uploads

**File Operations:**
- Files stored with UUID-based names
- Original filenames preserved in database
- Files streamed for downloads
- Storage limits enforced (10 MB per file, 500 MB per project)

**PDF Generation:**
- Generated on project finish
- Includes all project data
- Stored for later download
- Timeout protection (60 seconds)
