# API: Get Powerplant Parts and Checkups

## Endpoint

**Method**: `GET`  
**Path**: `/api/powerplants/:id/parts`  
**Authentication**: Required (valid session)

## Description

Retrieves all parts and their associated checkups for a specific powerplant. This endpoint is used to display the parts and checkups list when a user selects a powerplant on the Start Project screen. The response includes all parts with their checkups and documentation indicators (read-only display).

**Related Use Case**: Use Case 6 - Select Powerplant

## Request

### Headers

```
Cookie: session=<session-token>
```

### Path Parameters

- `id`: UUID of the powerplant (required, must be valid UUID format)

**Validation Rules:**
- Must be valid UUID v4 format
- Must exist in database

### Query Parameters

No query parameters required.

## Response

### Success Response

**Status Code**: `200 OK`

**Response Body:**
```json
{
  "data": {
    "powerplant": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Wind Farm Alpha",
      "location": "North Region"
    },
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
            "hasDocumentation": true
          },
          {
            "id": "990e8400-e29b-41d4-a716-446655440001",
            "name": "Blade Pitch Mechanism",
            "description": "Verify pitch mechanism operation",
            "displayOrder": 1,
            "hasDocumentation": false
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
            "hasDocumentation": true
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
- `data.powerplant`: Powerplant information
  - `id`: UUID of the powerplant
  - `name`: Name of the powerplant
  - `location`: Location of the powerplant (nullable)
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
    - `hasDocumentation`: Boolean indicating if documentation exists (true if documentation_images or documentation_text exists)

**Note**: Documentation images and text are NOT included in this response (read-only preview). Full documentation is available when viewing a project.

**Empty Parts Response:**
```json
{
  "data": {
    "powerplant": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Wind Farm Alpha",
      "location": "North Region"
    },
    "parts": []
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid UUID

**Status Code**: `400 Bad Request`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid powerplant ID format",
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

#### 500 Internal Server Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "Unable to load powerplant parts. Please try again.",
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

1. **Authentication**: Verify user session
2. **Validation**: Validate powerplant ID is valid UUID format
3. **Database Query**: Query powerplant with all parts and checkups:
   - Powerplant details
   - All parts for the powerplant (ordered by displayOrder)
   - All checkups for each part (ordered by displayOrder)
   - Documentation indicator (hasDocumentation flag)
4. **Data Assembly**: Group checkups under their parent parts
5. **Response**: Return powerplant with parts and checkups structure

**Database Query Structure:**
```sql
SELECT 
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
  c.display_order AS checkup_display_order,
  CASE 
    WHEN c.documentation_images IS NOT NULL OR c.documentation_text IS NOT NULL 
    THEN true 
    ELSE false 
  END AS has_documentation
FROM powerplants pp
LEFT JOIN parts pt ON pt.powerplant_id = pp.id
LEFT JOIN checkups c ON c.part_id = pt.id
WHERE pp.id = $1
ORDER BY pt.display_order ASC, c.display_order ASC
```

**Prisma Query:**
```typescript
prisma.powerplant.findUnique({
  where: { id: powerplantId },
  include: {
    parts: {
      orderBy: { displayOrder: 'asc' },
      include: {
        checkups: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            displayOrder: true,
            documentationImages: true,
            documentationText: true
          }
        }
      }
    }
  }
})
// Then transform to add hasDocumentation flag
```

**Transaction**: Read-only operation (no transaction required).

**Caching**: Powerplant parts/checkups can be cached for 5 minutes (data is read-only and changes infrequently).

## Performance Requirements

- **Response Time**: Under 1 second for powerplant with 100 checkups
- **Database Query**: Under 200 milliseconds for complex join query
- **Query Optimization**: 
  - Index on `parts.powerplant_id` for powerplant parts
  - Index on `checkups.part_id` for part checkups

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Powerplant parts retrieved (powerplantId, partCount, checkupCount, timestamp)
- **ERROR**: Database errors during query (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Powerplant parts retrieved",
  "context": {
    "powerplantId": "770e8400-e29b-41d4-a716-446655440000",
    "partCount": 2,
    "checkupCount": 3
  }
}
```

## Security Considerations

- All authenticated users can view powerplant parts (read-only access)
- No sensitive data exposed
- Session validation ensures authenticated user
- Powerplant data is read-only (managed by system administrators)

## Testing Requirements

**Test Cases:**
1. Successful retrieval of powerplant parts and checkups
2. Parts ordered by displayOrder
3. Checkups ordered by displayOrder within each part
4. hasDocumentation flag correctly set
5. Powerplant information included
6. Empty parts array if powerplant has no parts
7. Not found: Invalid powerplant ID (404)
8. Validation: Invalid UUID format (400)
9. Authentication required (401 if no session)
10. Database error handling
11. Response time under 1 second for 100 checkups
12. Caching behavior verification
