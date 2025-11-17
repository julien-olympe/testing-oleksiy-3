# API: Get Project Details

## Endpoint

**Method**: `GET`  
**Path**: `/api/projects/:id`  
**Authentication**: Required (valid session)

## Description

Retrieves detailed information about a specific project, including powerplant details, all parts with their checkups, current checkup statuses, and documentation references. This endpoint is used to display the Ongoing Project screen.

**Related Use Cases**: 
- Use Case 4 - Open Project
- Use Case 8 - View Ongoing Project
- Use Case 10 - View Documentation (documentation included in response)

## Request

### Headers

```
Cookie: session=<session-token>
```

### Path Parameters

- `id`: UUID of the project (required, must be valid UUID format)

**Validation Rules:**
- Must be valid UUID v4 format
- Must exist in database
- Must belong to authenticated user

### Query Parameters

No query parameters required.

## Response

### Success Response

**Status Code**: `200 OK`

**Response Body:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "powerplant": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Wind Farm Alpha",
      "location": "North Region"
    },
    "status": "In Progress",
    "createdAt": "2024-01-15T10:30:00Z",
    "finishedAt": null,
    "parts": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "name": "Rotor Blades",
        "description": "Main rotor blade assembly",
        "displayOrder": 0,
        "checkups": [
          {
            "id": "990e8400-e29b-41d4-a716-446655440000",
            "name": "Blade Surface Inspection",
            "description": "Check for cracks, erosion, or damage",
            "displayOrder": 0,
            "status": "good",
            "hasDocumentation": true,
            "documentationText": "Inspect blade surface for visible damage..."
          },
          {
            "id": "990e8400-e29b-41d4-a716-446655440001",
            "name": "Blade Pitch Mechanism",
            "description": "Verify pitch mechanism operation",
            "displayOrder": 1,
            "status": null,
            "hasDocumentation": false,
            "documentationText": null
          }
        ]
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440001",
        "name": "Gearbox",
        "description": "Main gearbox assembly",
        "displayOrder": 1,
        "checkups": [
          {
            "id": "990e8400-e29b-41d4-a716-446655440002",
            "name": "Oil Level Check",
            "description": "Verify gearbox oil level",
            "displayOrder": 0,
            "status": "average",
            "hasDocumentation": true,
            "documentationText": "Check oil level using dipstick..."
          }
        ]
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**
- `data.id`: UUID of the project
- `data.powerplant`: Powerplant information
  - `id`: UUID of the powerplant
  - `name`: Name of the powerplant
  - `location`: Location of the powerplant (nullable)
- `data.status`: Project status ("In Progress" or "Finished")
- `data.createdAt`: ISO 8601 timestamp of project creation
- `data.finishedAt`: ISO 8601 timestamp of project completion (null if not finished)
- `data.parts`: Array of parts (ordered by displayOrder)
  - `id`: UUID of the part
  - `name`: Name of the part
  - `description`: Description of the part (nullable)
  - `displayOrder`: Display order for sorting
  - `checkups`: Array of checkups (ordered by displayOrder)
    - `id`: UUID of the checkup
    - `name`: Name of the checkup
    - `description`: Description of the checkup (nullable)
    - `displayOrder`: Display order for sorting
    - `status`: Checkup status ("bad", "average", "good", or null if not set)
    - `hasDocumentation`: Boolean indicating if documentation exists
    - `documentationText`: Text description from documentation (null if no documentation)

**Note**: Documentation images are NOT included in this response. Images are retrieved separately via the documentation endpoint or embedded as base64 when needed. The `hasDocumentation` flag indicates if images exist.

### Error Responses

#### 400 Bad Request - Invalid UUID

**Status Code**: `400 Bad Request`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid project ID format",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

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

**Occurs when:**
- Project ID does not exist in database

#### 500 Internal Server Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "Unable to load project. Please try again.",
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
2. **Validation**: Validate project ID is valid UUID format
3. **Authorization**: Verify project belongs to authenticated user (`project.user_id === authenticated_user_id`)
4. **Database Query**: Query project with all related data:
   - Project details
   - Powerplant information
   - All parts for the powerplant (ordered by displayOrder)
   - All checkups for each part (ordered by displayOrder)
   - Checkup statuses for the project (join with checkup_statuses table)
   - Documentation text (from checkups table)
5. **Data Assembly**: Combine checkup data with status values:
   - If checkup has status in checkup_statuses, include status value
   - If no status, set status to null
   - Include hasDocumentation flag (true if documentation_images or documentation_text exists)
6. **Response**: Return complete project structure

**Database Query Structure:**
```sql
-- Main query with joins
SELECT 
  p.id AS project_id,
  p.status AS project_status,
  p.created_at AS project_created_at,
  p.finished_at AS project_finished_at,
  pp.id AS powerplant_id,
  pp.name AS powerplant_name,
  pp.location AS powerplant_location,
  pt.id AS part_id,
  pt.name AS part_name,
  pt.description AS part_description,
  pt.display_order AS part_display_order,
  c.id AS checkup_id,
  c.name AS checkup_name,
  c.description AS checkup_description,
  c.documentation_text AS checkup_documentation_text,
  c.display_order AS checkup_display_order,
  CASE 
    WHEN c.doc.documentation_images IS NOT NULL OR c.documentation_text IS NOT NULL 
    THEN true 
    ELSE false 
  END AS has_documentation,
  cs.status_value AS checkup_status
FROM projects p
INNER JOIN powerplants pp ON p.powerplant_id = pp.id
INNER JOIN parts pt ON pt.powerplant_id = pp.id
INNER JOIN checkups c ON c.part_id = pt.id
LEFT JOIN checkup_statuses cs ON cs.project_id = p.id AND cs.checkup_id = c.id
WHERE p.id = $1 AND p.user_id = $2
ORDER BY pt.display_order ASC, c.display_order ASC
```

**Prisma Query:**
```typescript
prisma.project.findUnique({
  where: { 
    id: projectId,
    userId: authenticatedUserId  // Ensures authorization
  },
  include: {
    powerplant: true,
    checkupStatuses: {
      include: {
        checkup: {
          include: {
            part: true
          }
        }
      }
    }
  }
})
// Then transform data to group by parts and checkups
```

**Transaction**: Read-only operation (no transaction required).

## Performance Requirements

- **Response Time**: Under 1 second for project with 100 checkups
- **Database Query**: Under 200 milliseconds for complex join query
- **Query Optimization**: 
  - Index on `projects.user_id` for authorization check
  - Index on `parts.powerplant_id` for powerplant parts
  - Index on `checkups.part_id` for part checkups
  - Index on `checkup_statuses(project_id, checkup_id)` for status lookup

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Project details retrieved (userId, projectId, timestamp)
- **WARN**: Access denied attempt (userId, projectId, IP address, timestamp)
- **ERROR**: Database errors during query (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Project details retrieved",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "660e8400-e29b-41d4-a716-446655440000"
  }
}
```

## Security Considerations

- User isolation: Only projects where `user_id` matches authenticated user are accessible
- Authorization check: Verify `project.user_id === authenticated_user_id` before returning data
- No access to other users' projects (403 Forbidden if attempted)
- Session validation ensures authenticated user
- Documentation images not included in response (retrieved separately if needed)

## Testing Requirements

**Test Cases:**
1. Successful retrieval of project details
2. Parts ordered by displayOrder
3. Checkups ordered by displayOrder within each part
4. Checkup statuses correctly mapped to checkups
5. Null status for checkups without status set
6. hasDocumentation flag correctly set
7. Authorization: Access denied for other user's project (403)
8. Not found: Invalid project ID (404)
9. Validation: Invalid UUID format (400)
10. Authentication required (401 if no session)
11. Database error handling
12. Response time under 1 second for 100 checkups
