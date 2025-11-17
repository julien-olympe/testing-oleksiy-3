# API: Update Checkup Status

## Endpoint

**Method**: `PATCH`  
**Path**: `/api/projects/:id/checkups/:checkupId/status`  
**Authentication**: Required (valid session)

## Description

Sets or updates the status value for a specific checkup within a project. The status can be "bad", "average", or "good". This endpoint creates a CheckupStatus record if it doesn't exist, or updates it if it already exists. The project must be in "In Progress" status to allow status updates.

**Related Use Case**: Use Case 9 - Set Checkup Status

## Request

### Headers

```
Content-Type: application/json
Cookie: session=<session-token>
```

### Path Parameters

- `id`: UUID of the project (required, must be valid UUID format)
- `checkupId`: UUID of the checkup (required, must be valid UUID format)

**Validation Rules:**
- Both must be valid UUID v4 format
- Project must exist and belong to authenticated user
- Checkup must exist and belong to a part of the project's powerplant
- Project must be in "In Progress" status

### Request Body

**Schema:**
```typescript
{
  status: string;  // "bad", "average", or "good"
}
```

**Validation Rules:**
- `status`: Required, string, must be one of: "bad", "average", "good"
- Case-sensitive enum validation

### Request Example

```json
{
  "status": "good"
}
```

## Response

### Success Response

**Status Code**: `200 OK`

**Response Body:**
```json
{
  "data": {
    "checkupId": "990e8400-e29b-41d4-a716-446655440000",
    "status": "good",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**
- `data.checkupId`: UUID of the checkup
- `data.status`: Updated status value ("bad", "average", or "good")
- `data.updatedAt`: ISO 8601 timestamp of the update
- `meta.timestamp`: ISO 8601 timestamp of response

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
      "field": "status",
      "message": "Status must be one of: bad, average, good"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Validation Error Cases:**
- Missing status field
- Invalid status value (not "bad", "average", or "good")
- Invalid UUID format for project ID or checkup ID

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

#### 403 Forbidden - Access Denied

**Status Code**: `403 Forbidden`

**Response Body:**
```json
{
  "error": "AUTHORIZATION_ERROR",
  "message": "Access denied. This project does not belong to you.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Project exists but `user_id` does not match authenticated user

#### 404 Not Found - Project Not Found

**Status Code**: `404 Not Found`

**Response Body:**
```json
{
  "error": "NOT_FOUND",
  "message": "Project not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 404 Not Found - Checkup Not Found

**Status Code**: `404 Not Found`

**Response Body:**
```json
{
  "error": "NOT_FOUND",
  "message": "Checkup not found or does not belong to this project's powerplant",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Checkup ID does not exist
- Checkup does not belong to a part of the project's powerplant

#### 400 Bad Request - Project Finished

**Status Code**: `400 Bad Request`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Cannot update status on finished project",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Project status is "Finished" (finished projects are read-only)

#### 500 Internal Server Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "Unable to save status. Please try again.",
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
2. **Validation**: 
   - Validate project ID and checkup ID are valid UUIDs
   - Validate status value is one of: "bad", "average", "good"
3. **Authorization**: 
   - Verify project exists and belongs to authenticated user (`project.user_id === authenticated_user_id`)
   - Verify project status is "In Progress" (cannot update finished projects)
4. **Checkup Verification**: 
   - Verify checkup exists
   - Verify checkup belongs to a part of the project's powerplant:
     - Checkup → Part → Powerplant must match Project → Powerplant
5. **Status Update**: 
   - Use UPSERT operation (INSERT if not exists, UPDATE if exists):
     - If CheckupStatus record exists for (project_id, checkup_id): UPDATE status_value and updated_at
     - If CheckupStatus record does not exist: INSERT new record with project_id, checkup_id, status_value, created_at, updated_at
6. **Response**: Return updated status information

**Database Operations:**
1. Verify project and authorization: `SELECT id, user_id, status, powerplant_id FROM projects WHERE id = $1 AND user_id = $2`
2. Verify checkup belongs to powerplant: `SELECT c.id FROM checkups c INNER JOIN parts p ON c.part_id = p.id WHERE c.id = $1 AND p.powerplant_id = $2`
3. Upsert checkup status: `INSERT INTO checkup_statuses (id, project_id, checkup_id, status_value, created_at, updated_at) VALUES (...) ON CONFLICT (project_id, checkup_id) DO UPDATE SET status_value = EXCLUDED.status_value, updated_at = EXCLUDED.updated_at`

**Prisma Query:**
```typescript
// 1. Verify project
const project = await prisma.project.findUnique({
  where: { 
    id: projectId,
    userId: authenticatedUserId
  }
});

if (!project || project.status === 'Finished') {
  throw new Error('Project not found or finished');
}

// 2. Verify checkup belongs to powerplant
const checkup = await prisma.checkup.findFirst({
  where: {
    id: checkupId,
    part: {
      powerplantId: project.powerplantId
    }
  }
});

if (!checkup) {
  throw new Error('Checkup not found');
}

// 3. Upsert status
await prisma.checkupStatus.upsert({
  where: {
    projectId_checkupId: {
      projectId: projectId,
      checkupId: checkupId
    }
  },
  update: {
    statusValue: status,
    updatedAt: new Date()
  },
  create: {
    projectId: projectId,
    checkupId: checkupId,
    statusValue: status,
    createdAt: new Date(),
    updatedAt: new Date()
  }
});
```

**Transaction**: Status update should be wrapped in a transaction to ensure atomicity (verify project status, verify checkup, upsert status).

## Performance Requirements

- **Response Time**: Under 300 milliseconds
- **Database Query**: Under 100 milliseconds for verification and upsert
- **Query Optimization**: 
  - Index on `projects(user_id, id)` for authorization check
  - Index on `checkup_statuses(project_id, checkup_id)` for upsert (unique constraint)
  - Index on `checkups(id)` and `parts(powerplant_id)` for checkup verification

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Checkup status updated (userId, projectId, checkupId, status, timestamp)
- **WARN**: Status update attempt on finished project (userId, projectId, timestamp)
- **WARN**: Access denied attempt (userId, projectId, IP address, timestamp)
- **ERROR**: Database errors during update (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Checkup status updated",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "660e8400-e29b-41d4-a716-446655440000",
    "checkupId": "990e8400-e29b-41d4-a716-446655440000",
    "status": "good"
  }
}
```

## Security Considerations

- User isolation: Only projects where `user_id` matches authenticated user can be updated
- Authorization check: Verify `project.user_id === authenticated_user_id` before allowing update
- Project status check: Finished projects cannot be updated (read-only)
- Checkup verification: Verify checkup belongs to project's powerplant (prevents setting status for wrong checkups)
- Input validation prevents SQL injection (Prisma parameterized queries)
- Status enum validation prevents invalid values

## Testing Requirements

**Test Cases:**
1. Successful status update (create new status)
2. Successful status update (update existing status)
3. Status values: "bad", "average", "good" all work
4. Project must be "In Progress" (400 if Finished)
5. Authorization: Access denied for other user's project (403)
6. Not found: Invalid project ID (404)
7. Not found: Invalid checkup ID (404)
8. Not found: Checkup doesn't belong to project's powerplant (404)
9. Validation: Invalid status value (400)
10. Validation: Missing status field (400)
11. Authentication required (401 if no session)
12. Database error handling
13. Response time under 300ms
14. Upsert behavior (create vs update)
