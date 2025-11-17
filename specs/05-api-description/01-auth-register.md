# API: User Registration

## Endpoint

**Method**: `POST`  
**Path**: `/api/auth/register`  
**Authentication**: Not required (public endpoint)

## Description

Creates a new user account in the system. The system validates the input, hashes the password using bcrypt, and creates a new user record in the database.

**Related Use Case**: Use Case 1 - User Registration

## Request

### Headers

```
Content-Type: application/json
```

### Request Body

**Schema:**
```typescript
{
  username: string;      // 3-50 characters, alphanumeric and underscore only
  email: string;        // Valid email format, 5-255 characters
  password: string;      // 8-128 characters, any characters allowed
  passwordConfirmation: string;  // Must match password exactly
}
```

**Validation Rules:**
- `username`: Required, string, minimum 3 characters, maximum 50 characters, must match pattern `^[a-zA-Z0-9_]+$` (alphanumeric and underscore only)
- `email`: Required, string, valid email format, minimum 5 characters, maximum 255 characters
- `password`: Required, string, minimum 8 characters, maximum 128 characters
- `passwordConfirmation`: Required, string, must match `password` exactly

**Field Processing:**
- `username`: Trimmed, converted to lowercase before storage
- `email`: Trimmed, converted to lowercase before storage
- `password`: Hashed using bcrypt with salt rounds: 10

### Request Example

```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "passwordConfirmation": "securePassword123"
}
```

## Response

### Success Response

**Status Code**: `201 Created`

**Response Body:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response Fields:**
- `data.id`: UUID of the created user
- `data.username`: Username (lowercase)
- `data.email`: Email address (lowercase)
- `data.createdAt`: ISO 8601 timestamp of account creation
- `meta.timestamp`: ISO 8601 timestamp of response

**Note**: Password and password hash are never returned in the response.

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
      "field": "username",
      "message": "Username must be at least 3 characters"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    },
    {
      "field": "passwordConfirmation",
      "message": "Passwords do not match"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Validation Error Cases:**
- Username too short (< 3 characters)
- Username too long (> 50 characters)
- Username contains invalid characters (not alphanumeric or underscore)
- Email format invalid
- Email too short (< 5 characters)
- Email too long (> 255 characters)
- Password too short (< 8 characters)
- Password too long (> 128 characters)
- Password confirmation does not match password
- Missing required fields

#### 409 Conflict - Username Already Exists

**Status Code**: `409 Conflict`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Username already exists",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 409 Conflict - Email Already Exists

**Status Code**: `409 Conflict`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email already exists",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 500 Internal Server Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "An error occurred while creating your account. Please try again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Database connection fails
- Database constraint violation (other than username/email uniqueness)
- Unexpected database error

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

**Occurs when:**
- Database is unavailable
- Connection pool exhausted

## Business Logic

1. **Input Validation**: Validate all input fields using Zod schema
2. **Uniqueness Check**: Verify username and email are unique (case-insensitive)
3. **Password Hashing**: Hash password using bcrypt with salt rounds: 10
4. **User Creation**: Create user record in database with:
   - Generated UUID for `id`
   - Lowercase `username`
   - Lowercase `email`
   - Bcrypt hashed `password_hash`
   - Current timestamp for `created_at` and `updated_at`
5. **Response**: Return user data (excluding password) with 201 status

**Database Operations:**
- Check username uniqueness: `SELECT id FROM users WHERE LOWER(username) = LOWER($1)`
- Check email uniqueness: `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`
- Create user: `INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES (...)`

**Transaction**: User creation is a single database operation (no transaction required).

## Performance Requirements

- **Response Time**: Under 500 milliseconds
- **Database Query**: Under 50 milliseconds for uniqueness checks and insert
- **Password Hashing**: Under 200 milliseconds (bcrypt with 10 salt rounds)

## Logging

**Log Events:**
- **INFO**: Successful user registration (userId, username, email, timestamp)
- **WARN**: Registration attempt with existing username/email (username/email, IP address, timestamp)
- **ERROR**: Database errors during registration (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "User registered successfully",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "ipAddress": "192.168.1.1"
  }
}
```

## Security Considerations

- Password is never logged or returned in response
- Password hash stored using bcrypt (one-way hashing)
- Email and username stored in lowercase for consistency
- Input validation prevents SQL injection (Prisma parameterized queries)
- Rate limiting: 5 registration attempts per IP address per 15 minutes (to prevent abuse)

## Testing Requirements

**Test Cases:**
1. Successful registration with valid data
2. Validation error: username too short
3. Validation error: username too long
4. Validation error: invalid username characters
5. Validation error: invalid email format
6. Validation error: password too short
7. Validation error: password confirmation mismatch
8. Conflict error: username already exists
9. Conflict error: email already exists
10. Database error handling
11. Case-insensitive username/email uniqueness check
12. Password hashing verification
