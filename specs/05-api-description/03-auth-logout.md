# API: User Logout

## Endpoint

**Method**: `POST`  
**Path**: `/api/auth/logout`  
**Authentication**: Required (valid session)

## Description

Terminates the current user session by invalidating the session token and clearing the session cookie. After logout, the user must login again to access protected endpoints.

**Related Use Case**: Use Case 2 - User Logout (implicit)

## Request

### Headers

```
Cookie: session=<session-token>
```

### Request Body

No request body required.

## Response

### Success Response

**Status Code**: `200 OK`

**Response Headers:**
```
Set-Cookie: session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0
```

**Response Body:**
```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Session Cookie:**
- Cookie name: `session`
- Value: Empty string
- Max-Age: 0 (immediately expires the cookie)
- Other attributes same as login cookie

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

**Occurs when:**
- No session cookie provided
- Session token invalid or expired
- Session not found in session store

**Note**: Even if session is invalid, logout should still clear the cookie and return success (idempotent operation). However, if no session cookie is provided at all, return 401.

#### 500 Internal Server Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An error occurred during logout. Please try again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Business Logic

1. **Session Validation**: Extract session token from cookie
2. **Session Invalidation**: Remove session from session store (if exists)
3. **Cookie Clearing**: Set session cookie to empty with Max-Age=0 to clear it
4. **Response**: Return success message with 200 status

**Session Store Operations:**
- Delete session: Remove session entry from in-memory session store
- If session not found, still clear cookie (idempotent operation)

**Transaction**: Logout is a simple operation (no database transaction required).

## Performance Requirements

- **Response Time**: Under 100 milliseconds
- **Session Deletion**: Under 10 milliseconds (in-memory operation)

## Logging

**Log Events:**
- **INFO**: Successful logout (userId, username, IP address, timestamp)
- **WARN**: Logout attempt with invalid session (IP address, timestamp)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "User logged out successfully",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "ipAddress": "192.168.1.1"
  }
}
```

## Security Considerations

- Session immediately invalidated (cannot be reused)
- Cookie cleared on client side (prevents accidental reuse)
- Idempotent operation: Logging out multiple times is safe
- No sensitive data exposed in response

## Testing Requirements

**Test Cases:**
1. Successful logout with valid session
2. Logout invalidates session (subsequent requests fail)
3. Logout clears session cookie
4. Logout with invalid session (still clears cookie, returns success)
5. Logout without session cookie (returns 401)
6. Multiple logout calls (idempotent)
7. Session store cleanup verification
