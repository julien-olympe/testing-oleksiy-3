# API: User Login

## Endpoint

**Method**: `POST`  
**Path**: `/api/auth/login`  
**Authentication**: Not required (public endpoint)

## Description

Authenticates an existing user by validating credentials and creates an authenticated session. The system looks up the user by username or email, verifies the password hash, and creates a session token stored in a secure HTTP-only cookie.

**Related Use Case**: Use Case 2 - User Login

## Request

### Headers

```
Content-Type: application/json
```

### Request Body

**Schema:**
```typescript
{
  usernameOrEmail: string;  // Username or email address
  password: string;          // User's password
}
```

**Validation Rules:**
- `usernameOrEmail`: Required, string, minimum 3 characters, maximum 255 characters
- `password`: Required, string, minimum 1 character (no maximum enforced for login)

**Field Processing:**
- `usernameOrEmail`: Trimmed, converted to lowercase for lookup
- `password`: Used as-is for bcrypt comparison

### Request Example

```json
{
  "usernameOrEmail": "johndoe",
  "password": "securePassword123"
}
```

## Response

### Success Response

**Status Code**: `200 OK`

**Response Headers:**
```
Set-Cookie: session=<session-token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

**Response Body:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john.doe@example.com"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**
- `data.id`: UUID of the authenticated user
- `data.username`: Username
- `data.email`: Email address
- `meta.timestamp`: ISO 8601 timestamp of response

**Session Cookie:**
- Cookie name: `session`
- Value: Cryptographically random session token (32 bytes)
- HttpOnly: true (prevents JavaScript access)
- Secure: true (HTTPS only in production)
- SameSite: Strict (prevents CSRF)
- Path: / (applies to all paths)
- Max-Age: 86400 seconds (24 hours)

**Note**: Password is never returned in the response.

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
      "field": "usernameOrEmail",
      "message": "Username or email is required"
    },
    {
      "field": "password",
      "message": "Password is required"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 401 Unauthorized - Invalid Credentials

**Status Code**: `401 Unauthorized`

**Response Body:**
```json
{
  "error": "AUTHENTICATION_ERROR",
  "message": "Invalid credentials",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Username/email not found in database
- Password does not match stored hash
- User account does not exist

**Security Note**: Generic error message prevents username enumeration attacks. The same error message is returned for both "user not found" and "incorrect password" cases.

#### 500 Internal Server Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "An error occurred during authentication. Please try again.",
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

1. **Input Validation**: Validate all input fields using Zod schema
2. **User Lookup**: Query user by username or email (case-insensitive):
   - Try username first: `SELECT * FROM users WHERE LOWER(username) = LOWER($1)`
   - If not found, try email: `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`
3. **Password Verification**: Compare provided password with stored password hash using `bcrypt.compare(password, password_hash)`
4. **Session Creation**: If credentials valid:
   - Generate cryptographically random session token (32 bytes)
   - Store session in session store with:
     - Session token as key
     - User ID as value
     - Expiration: 24 hours from now
   - Set secure HTTP-only cookie with session token
5. **Response**: Return user data (excluding password) with 200 status

**Database Operations:**
- User lookup: Single query to find user by username or email
- No database write operations (session stored in memory)

**Transaction**: Login is a read-only operation (no transaction required).

## Performance Requirements

- **Response Time**: Under 500 milliseconds
- **Database Query**: Under 50 milliseconds for user lookup
- **Password Verification**: Under 200 milliseconds (bcrypt comparison)
- **Session Creation**: Under 50 milliseconds

## Logging

**Log Events:**
- **INFO**: Successful login (userId, username, IP address, timestamp)
- **WARN**: Failed login attempt (usernameOrEmail, IP address, reason: "user not found" or "invalid password", timestamp)
- **ERROR**: Database errors during login (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "User logged in successfully",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "ipAddress": "192.168.1.1"
  }
}
```

**Security Logging:**
- All failed login attempts logged with IP address for security monitoring
- Alert triggered if > 10 failed login attempts from same IP in 15 minutes

## Security Considerations

- Password is never logged or returned in response
- Generic error message prevents username enumeration
- Rate limiting: 5 login attempts per IP address per 15 minutes (prevents brute force attacks)
- Session token is cryptographically random (32 bytes)
- Session stored in secure HTTP-only cookie (prevents XSS attacks)
- SameSite=Strict cookie attribute prevents CSRF attacks
- Session expires after 24 hours of inactivity
- Password verification uses constant-time comparison (bcrypt.compare)

## Testing Requirements

**Test Cases:**
1. Successful login with username
2. Successful login with email
3. Successful login creates session cookie
4. Validation error: missing usernameOrEmail
5. Validation error: missing password
6. Authentication error: user not found
7. Authentication error: incorrect password
8. Case-insensitive username/email lookup
9. Database error handling
10. Session creation verification
11. Cookie attributes verification (HttpOnly, Secure, SameSite)
12. Rate limiting enforcement
