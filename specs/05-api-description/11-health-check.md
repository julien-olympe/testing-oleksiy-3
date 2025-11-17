# API: Health Check

## Endpoint

**Method**: `GET`  
**Path**: `/api/health`  
**Authentication**: Not required (public endpoint)

## Description

Monitors the health status of the application and database. This endpoint is used by monitoring systems to verify that the application is running and can connect to the database. The endpoint performs a lightweight database connection check to ensure the database is accessible.

**Purpose**: System monitoring and health checks

## Request

### Headers

No special headers required.

### Query Parameters

No query parameters required.

## Response

### Success Response - Healthy

**Status Code**: `200 OK`

**Response Body:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response Fields:**
- `status`: Application status ("healthy" or "unhealthy")
- `database`: Database connection status ("connected" or "disconnected")
- `timestamp`: ISO 8601 timestamp of the health check

### Error Response - Database Unavailable

**Status Code**: `503 Service Unavailable`

**Response Body:**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "timestamp": "2024-01-15T10:30:00Z",
  "error": "Database connection failed"
}
```

**Occurs when:**
- Database connection cannot be established
- Database query fails
- Database connection pool exhausted
- Database server is down

### Error Response - Application Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "status": "unhealthy",
  "database": "unknown",
  "timestamp": "2024-01-15T10:30:00Z",
  "error": "Health check failed"
}
```

**Occurs when:**
- Application error during health check
- Unexpected exception

## Business Logic

1. **Application Check**: Verify application is running (endpoint is accessible)
2. **Database Check**: Perform lightweight database query to verify connectivity:
   - Execute simple query: `SELECT 1` or `SELECT NOW()`
   - Timeout: 5 seconds maximum
   - If query succeeds: database status = "connected"
   - If query fails or times out: database status = "disconnected"
3. **Response**: Return health status based on checks

**Database Query:**
```sql
SELECT 1
```

**Prisma Query:**
```typescript
await prisma.$queryRaw`SELECT 1`
```

**Alternative (if Prisma not available):**
```typescript
await db.query('SELECT 1')
```

**Health Check Logic:**
- If database query succeeds: Return 200 OK with status "healthy" and database "connected"
- If database query fails: Return 503 Service Unavailable with status "unhealthy" and database "disconnected"
- If application error: Return 500 Internal Server Error with status "unhealthy"

**Transaction**: Health check is a read-only operation (no transaction required).

**Performance**: Health check must be fast (< 100ms) to avoid impacting monitoring systems.

## Performance Requirements

- **Response Time**: Under 100 milliseconds
- **Database Query**: Under 50 milliseconds (simple SELECT 1 query)
- **Timeout**: 5 seconds maximum for database check

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Health check passed (database connected, timestamp)
- **WARN**: Health check failed - database disconnected (timestamp, error details)
- **ERROR**: Health check error (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Health check passed",
  "context": {
    "database": "connected",
    "responseTime": 45
  }
}
```

**Monitoring Integration:**
- Health check endpoint called every 30 seconds by monitoring system
- Alert triggered if health check fails (status code != 200)
- Alert triggered if response time > 1 second
- Alert triggered if database status = "disconnected"

## Security Considerations

- Public endpoint (no authentication required)
- No sensitive data exposed in response
- No user data accessed
- Lightweight query (SELECT 1) prevents resource exhaustion
- Timeout prevents hanging requests

## Testing Requirements

**Test Cases:**
1. Successful health check with database connected (200 OK)
2. Health check with database disconnected (503 Service Unavailable)
3. Response time under 100ms
4. Database query timeout handling (5 seconds)
5. Application error handling (500 Internal Server Error)
6. Response format validation (JSON structure)
7. Timestamp format validation (ISO 8601)
8. Monitoring integration verification

## Monitoring Integration

**Monitoring System Configuration:**
- Endpoint: `GET /api/health`
- Frequency: Every 30 seconds
- Expected Status: 200 OK
- Expected Response Time: < 1 second
- Alert Conditions:
  - Status code != 200
  - Response time > 1 second
  - Database status = "disconnected"
  - Application status = "unhealthy"

**Alert Actions:**
- Send notification to operations team
- Log alert to monitoring system
- Trigger automated recovery procedures (if configured)
