# API: List User's Projects

## Endpoint

**Method**: `GET`  
**Path**: `/api/projects`  
**Authentication**: Required (valid session)

## Description

Retrieves a list of all projects assigned to the authenticated user. Projects are ordered by creation date (newest first) and include powerplant information and status.

**Related Use Case**: Use Case 3 - View Projects List

## Request

### Headers

```
Cookie: session=<session-token>
```

### Query Parameters

No query parameters required.

**Future Extensions:**
- `status`: Filter by project status (In Progress, Finished) - optional
- `page`: Page number for pagination - optional
- `pageSize`: Number of items per page - optional

## Response

### Success Response

**Status Code**: `200 OK`

**Response Body:**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "powerplant": {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Wind Farm Alpha"
      },
      "status": "In Progress",
      "createdAt": "2024-01-15T10:30:00Z",
      "finishedAt": null
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "powerplant": {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "name": "Wind Farm Beta"
      },
      "status": "Finished",
      "createdAt": "2024-01-10T08:20:00Z",
      "finishedAt": "2024-01-12T14:45:00Z"
    }
  ],
  "meta": {
    "total": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**
- `data`: Array of project objects
  - `id`: UUID of the project
  - `powerplant.id`: UUID of the powerplant
  - `powerplant.name`: Name of the powerplant
  - `status`: Project status ("In Progress" or "Finished")
  - `createdAt`: ISO 8601 timestamp of project creation
  - `finishedAt`: ISO 8601 timestamp of project completion (null if not finished)
- `meta.total`: Total number of projects for the user
- `meta.timestamp`: ISO 8601 timestamp of response

**Empty List Response:**
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

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
  "message": "Unable to load projects. Please try again.",
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
2. **Authorization**: User can only see their own projects (enforced by query filter)
3. **Database Query**: Query projects where `user_id` matches authenticated user:
   - Join with powerplants table to get powerplant name
   - Order by `created_at` DESC (newest first)
   - Select: project id, powerplant id, powerplant name, project status, created_at, finished_at
4. **Response**: Return array of projects with powerplant information

**Database Query:**
```sql
SELECT 
  p.id,
  p.status,
  p.created_at,
  p.finished_at,
  pp.id AS powerplant_id,
  pp.name AS powerplant_name
FROM projects p
INNER JOIN powerplants pp ON p.powerplant_id = pp.id
WHERE p.user_id = $1
ORDER BY p.created_at DESC
```

**Prisma Query:**
```typescript
prisma.project.findMany({
  where: { userId: authenticatedUserId },
  include: {
    powerplant: {
      select: { id: true, name: true }
    }
  },
  orderBy: { createdAt: 'desc' }
})
```

**Transaction**: Read-only operation (no transaction required).

## Performance Requirements

- **Response Time**: Under 500 milliseconds for up to 100 projects
- **Database Query**: Under 50 milliseconds for up to 100 projects
- **Query Optimization**: Index on `projects.user_id` for efficient filtering

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Projects list retrieved (userId, projectCount, timestamp)
- **ERROR**: Database errors during query (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Projects list retrieved",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "projectCount": 2
  }
}
```

## Security Considerations

- User isolation: Only projects where `user_id` matches authenticated user are returned
- No access to other users' projects
- Session validation ensures authenticated user
- No sensitive data exposed (no checkup statuses, no documentation)

## Testing Requirements

**Test Cases:**
1. Successful retrieval of user's projects
2. Empty list for user with no projects
3. Projects ordered by created_at DESC (newest first)
4. Powerplant information included in response
5. Only user's own projects returned (not other users' projects)
6. Authentication required (401 if no session)
7. Database error handling
8. Response time under 500ms for 100 projects
