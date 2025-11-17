# API: List Powerplants

## Endpoint

**Method**: `GET`  
**Path**: `/api/powerplants`  
**Authentication**: Required (valid session)

## Description

Retrieves a list of all powerplants available in the system. This endpoint is used to populate the powerplant dropdown on the Start Project screen. All authenticated users can view the powerplant list (read-only access).

**Related Use Case**: Use Case 5 - Start New Project

## Request

### Headers

```
Cookie: session=<session-token>
```

### Query Parameters

No query parameters required.

## Response

### Success Response

**Status Code**: `200 OK`

**Response Body:**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Wind Farm Alpha",
      "location": "North Region"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "Wind Farm Beta",
      "location": "South Region"
    }
  ],
  "meta": {
    "total": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**
- `data`: Array of powerplant objects
  - `id`: UUID of the powerplant
  - `name`: Name of the powerplant
  - `location`: Location of the powerplant (nullable)
- `meta.total`: Total number of powerplants
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
  "message": "Unable to load powerplants. Please try again.",
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
2. **Database Query**: Query all powerplants from database:
   - Order by name (alphabetical)
   - Select: id, name, location
3. **Response**: Return array of powerplants

**Database Query:**
```sql
SELECT id, name, location
FROM powerplants
ORDER BY name ASC
```

**Prisma Query:**
```typescript
prisma.powerplant.findMany({
  select: {
    id: true,
    name: true,
    location: true
  },
  orderBy: { name: 'asc' }
})
```

**Transaction**: Read-only operation (no transaction required).

**Caching**: Powerplant list can be cached for 5 minutes (powerplant data is read-only and changes infrequently).

## Performance Requirements

- **Response Time**: Under 500 milliseconds
- **Database Query**: Under 50 milliseconds
- **Query Optimization**: Simple table scan with index on name for sorting

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Powerplants list retrieved (powerplantCount, timestamp)
- **ERROR**: Database errors during query (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Powerplants list retrieved",
  "context": {
    "powerplantCount": 2
  }
}
```

## Security Considerations

- All authenticated users can view powerplant list (read-only access)
- No sensitive data exposed
- Session validation ensures authenticated user
- Powerplant data is read-only (managed by system administrators)

## Testing Requirements

**Test Cases:**
1. Successful retrieval of powerplants list
2. Powerplants ordered by name (alphabetical)
3. Empty list if no powerplants exist
4. Location field can be null
5. Authentication required (401 if no session)
6. Database error handling
7. Response time under 500ms
8. Caching behavior verification
