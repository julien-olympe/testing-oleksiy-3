# API: Create Project

## Endpoint

**Method**: `POST`  
**Path**: `/api/projects`  
**Authentication**: Required (valid session)

## Description

Creates a new project for the authenticated user by selecting a powerplant. The project is automatically assigned to the creating user and initialized with "In Progress" status. The project inherits all parts and checkups from the selected powerplant.

**Related Use Case**: Use Case 7 - Create Project

## Request

### Headers

```
Content-Type: application/json
Cookie: session=<session-token>
```

### Request Body

**Schema:**
```typescript
{
  powerplantId: string;  // UUID of the powerplant
}
```

**Validation Rules:**
- `powerplantId`: Required, string, must be valid UUID v4 format
- Powerplant must exist in database

### Request Example

```json
{
  "powerplantId": "770e8400-e29b-41d4-a716-446655440000"
}
```

## Response

### Success Response

**Status Code**: `201 Created`

**Response Body:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "powerplant": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Wind Farm Alpha"
    },
    "status": "In Progress",
    "createdAt": "2024-01-15T10:30:00Z",
    "finishedAt": null
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**
- `data.id`: UUID of the created project
- `data.powerplant.id`: UUID of the powerplant
- `data.powerplant.name`: Name of the powerplant
- `data.status`: Project status ("In Progress")
- `data.createdAt`: ISO 8601 timestamp of project creation
- `data.finishedAt`: null (project not finished yet)

### Error Responses

#### 400 Bad Request - Validation Error

**Status Code**: `400 Bad Request`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "powerplantId",
      "message": "Powerplant ID is required"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Validation Error Cases:**
- Missing powerplantId
- Invalid UUID format
- Powerplant not found in database

#### 404 Not Found - Powerplant Not Found

**Status Code**: `404 Not Found`

**Response Body:**
```json
{
  "error": "NOT_FOUND",
  "message": "Powerplant not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Powerplant ID does not exist in database

#### 401 Unauthorized - No Session

**Status Code**: `401 Unauthorized`

**Response Body:**
```json
{
  "error": "AUTHENTICATION_ERROR",
  "message": "Session expired or invalid. Please login again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 500 Internal Server Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "Unable to create project. Please try again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 503 Service Unavailable

**Status Code**: `503 Service Unavailable`

**Response Body:**
```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Database temporarily unavailable. Please try again in a few moments.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Business Logic

1. **Authentication**: Verify user session and extract user ID
2. **Input Validation**: Validate powerplantId is valid UUID format
3. **Powerplant Verification**: Verify powerplant exists in database
4. **Project Creation**: Create project record with:
   - Generated UUID for `id`
   - `user_id` = authenticated user ID
   - `powerplant_id` = provided powerplant ID
   - `status` = "In Progress"
   - `created_at` = current timestamp
   - `updated_at` = current timestamp
   - `finished_at` = NULL
5. **Response**: Return created project with powerplant information

**Database Operations:**
1. Verify powerplant exists: `SELECT id FROM powerplants WHERE id = $1`
2. Create project: `INSERT INTO projects (id, user_id, powerplant_id, status, created_at, updated_at, finished_at) VALUES (...)`

**Transaction**: Project creation is a single database operation (no transaction required, but can be wrapped in transaction for consistency).

**Note**: Checkup statuses are NOT created at project creation time. They are created on-demand when users set status values for checkups. This keeps the database lean and allows projects to be created even if powerplant structure changes later.

## Performance Requirements

- **Response Time**: Under 500 milliseconds
- **Database Query**: Under 50 milliseconds for powerplant verification and project insert
- **Query Optimization**: Index on `powerplants.id` for verification, index on `projects.user_id` for user queries

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Project created successfully (userId, projectId, powerplantId, timestamp)
- **ERROR**: Database errors during creation (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Project created successfully",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "660e8400-e29b-41d4-a716-446655440000",
    "powerplantId": "770e8400-e29b-41d4-a716-446655440000"
  }
}
```

## Security Considerations

- Project automatically assigned to creating user (`user_id` = authenticated user ID)
- User cannot create projects for other users
- Powerplant must exist (validated before project creation)
- Session validation ensures authenticated user
- Input validation prevents SQL injection (Prisma parameterized queries)

## Testing Requirements

**Test Cases:**
1. Successful project creation with valid powerplant
2. Project assigned to authenticated user
3. Project status set to "In Progress"
4. Project created_at timestamp set correctly
5. Project finished_at is null
6. Validation error: missing powerplantId
7. Validation error: invalid UUID format
8. Not found: Powerplant does not exist (404)
9. Authentication required (401 if no session)
10. Database error handling
11. Response time under 500ms
12. Project appears in user's project list after creation
