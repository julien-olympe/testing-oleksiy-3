# Unit Test: User Login (Use Case 2)

## Test Overview

**Test Name:** User Login Tests  
**Purpose:** Test the user authentication functionality including credential validation, session creation, password verification, and error handling.

**Component Being Tested:** 
- POST `/api/auth/login` endpoint
- User authentication service/controller
- Input validation (Zod schemas)
- Password verification (bcrypt)
- Session management
- Database operations (Prisma)

## Test Setup

### Prerequisites
- Mock Prisma Client configured
- Mock bcrypt library configured
- Mock session management configured
- Validation schemas available

### Mocking Strategy

**Database Mocking:**
```typescript
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};
```

**Password Verification Mocking:**
```typescript
const mockBcrypt = {
  compare: jest.fn(),
};
```

**Session Mocking:**
```typescript
const mockSession = {
  userId: null,
  save: jest.fn(),
};
```

### Test Data

**Valid Login Credentials:**
```typescript
const validCredentials = {
  usernameOrEmail: 'testuser',
  password: 'password123',
};
```

**Invalid Login Credentials:**
```typescript
const invalidCredentials = {
  usernameOrEmail: 'nonexistent',
  password: 'wrongpassword',
};
```

**Mock User Data:**
```typescript
const mockUser = {
  id: 'user-uuid',
  username: 'testuser',
  email: 'test@example.com',
  password_hash: '$2b$10$hashedpassword',
  created_at: new Date(),
  updated_at: new Date(),
};
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Successful Login with Username

**Test Name:** `should authenticate user when valid username and password provided`

**Description:** Verifies that a user can log in with valid username and password.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: 'password123',
}
```

**Expected Output:**
- HTTP 200 status code
- Session created with user ID
- Response: `{ message: "Login successful", user: { id, username, email } }`
- Redirect to home screen

**Assertions:**
- `prisma.user.findUnique` called to find user by username
- `bcrypt.compare` called with password and stored hash
- Session created with user ID
- Response status is 200
- Response contains user data (without password)

**Test Implementation:**
```typescript
describe('User Login - Happy Path', () => {
  test('should authenticate user when valid username and password provided', async () => {
    const credentials = {
      usernameOrEmail: 'testuser',
      password: 'password123',
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(true);
    mockSession.userId = mockUser.id;
    mockSession.save.mockResolvedValue(undefined);

    const response = await loginUser(credentials, mockSession);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: credentials.usernameOrEmail },
    });
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      credentials.password,
      mockUser.password_hash
    );
    expect(mockSession.userId).toBe(mockUser.id);
    expect(mockSession.save).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).not.toHaveProperty('password_hash');
  });
});
```

#### Test Case 2: Successful Login with Email

**Test Name:** `should authenticate user when valid email and password provided`

**Description:** Verifies that a user can log in with email address instead of username.

**Input Data:**
```typescript
{
  usernameOrEmail: 'test@example.com',
  password: 'password123',
}
```

**Expected Output:**
- HTTP 200 status code
- Session created with user ID
- Response contains user data

**Assertions:**
- `prisma.user.findUnique` called to find user by email
- `bcrypt.compare` called with password and stored hash
- Session created with user ID
- Response status is 200

**Test Implementation:**
```typescript
test('should authenticate user when valid email and password provided', async () => {
  const credentials = {
    usernameOrEmail: 'test@example.com',
    password: 'password123',
  };

  mockPrisma.user.findUnique.mockResolvedValue(mockUser);
  mockBcrypt.compare.mockResolvedValue(true);
  mockSession.userId = mockUser.id;
  mockSession.save.mockResolvedValue(undefined);

  const response = await loginUser(credentials, mockSession);

  expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
    where: { email: credentials.usernameOrEmail },
  });
  expect(response.status).toBe(200);
});
```

---

### Validation Tests

#### Test Case 3: Missing Username/Email

**Test Name:** `should reject login when username or email is missing`

**Description:** Verifies that missing username/email is rejected.

**Input Data:**
```typescript
{
  usernameOrEmail: '',
  password: 'password123',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Username or email is required"
- Session not created

**Assertions:**
- Validation error thrown
- `prisma.user.findUnique` not called
- Session not created

#### Test Case 4: Missing Password

**Test Name:** `should reject login when password is missing`

**Description:** Verifies that missing password is rejected.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: '',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Password is required"
- Session not created

**Assertions:**
- Validation error thrown
- `prisma.user.findUnique` not called
- Session not created

---

### Authentication Failure Tests

#### Test Case 5: User Not Found

**Test Name:** `should reject login when user does not exist`

**Description:** Verifies that login fails when user is not found.

**Input Data:**
```typescript
{
  usernameOrEmail: 'nonexistent',
  password: 'password123',
}
```

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Invalid credentials"
- Session not created
- Security log entry created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockResolvedValue(null);
```

**Assertions:**
- `prisma.user.findUnique` called
- User not found
- `bcrypt.compare` not called
- Session not created
- Response status is 401
- Generic error message returned (for security)

**Test Implementation:**
```typescript
describe('User Login - Authentication Failures', () => {
  test('should reject login when user does not exist', async () => {
    const credentials = {
      usernameOrEmail: 'nonexistent',
      password: 'password123',
    };

    mockPrisma.user.findUnique.mockResolvedValue(null);

    const response = await loginUser(credentials, mockSession);

    expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    expect(mockBcrypt.compare).not.toHaveBeenCalled();
    expect(mockSession.save).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
```

#### Test Case 6: Incorrect Password

**Test Name:** `should reject login when password is incorrect`

**Description:** Verifies that login fails when password doesn't match.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: 'wrongpassword',
}
```

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Invalid credentials"
- Session not created
- Security log entry created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockResolvedValue(mockUser);
mockBcrypt.compare.mockResolvedValue(false);
```

**Assertions:**
- `prisma.user.findUnique` called
- User found
- `bcrypt.compare` returns false
- Session not created
- Response status is 401
- Generic error message returned

**Test Implementation:**
```typescript
test('should reject login when password is incorrect', async () => {
  const credentials = {
    usernameOrEmail: 'testuser',
    password: 'wrongpassword',
  };

  mockPrisma.user.findUnique.mockResolvedValue(mockUser);
  mockBcrypt.compare.mockResolvedValue(false);

  const response = await loginUser(credentials, mockSession);

  expect(mockBcrypt.compare).toHaveBeenCalled();
  expect(mockSession.save).not.toHaveBeenCalled();
  expect(response.status).toBe(401);
  expect(response.body.message).toBe('Invalid credentials');
});
```

---

### Error Condition Tests

#### Test Case 7: Database Connection Failure

**Test Name:** `should handle database connection failure during login`

**Description:** Verifies that database connection errors are handled gracefully.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: 'password123',
}
```

**Expected Output:**
- HTTP 503 status code (Service Unavailable)
- Error message: "Database temporarily unavailable. Please try again in a few moments."
- Session not created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockRejectedValue(
  new Error('Connection failed')
);
```

**Assertions:**
- Database error caught
- Retry mechanism attempted (if implemented)
- Response status is 503
- Generic error message returned

**Test Implementation:**
```typescript
describe('User Login - Error Conditions', () => {
  test('should handle database connection failure during login', async () => {
    const credentials = {
      usernameOrEmail: 'testuser',
      password: 'password123',
    };

    mockPrisma.user.findUnique.mockRejectedValue(
      new Error('Connection failed')
    );

    const response = await loginUser(credentials, mockSession);

    expect(response.status).toBe(503);
    expect(response.body.message).toContain('unavailable');
  });
});
```

#### Test Case 8: Password Verification Failure

**Test Name:** `should handle password verification failure`

**Description:** Verifies that bcrypt comparison errors are handled gracefully.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: 'password123',
}
```

**Expected Output:**
- HTTP 500 status code (Internal Server Error)
- Error message: "An error occurred. Please try again."
- Session not created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockResolvedValue(mockUser);
mockBcrypt.compare.mockRejectedValue(new Error('Verification failed'));
```

**Assertions:**
- Verification error caught
- Session not created
- Response status is 500
- Generic error message returned

#### Test Case 9: Session Creation Failure

**Test Name:** `should handle session creation failure`

**Description:** Verifies that session save errors are handled gracefully.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: 'password123',
}
```

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to create session. Please try again."
- User authenticated but session not saved

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockResolvedValue(mockUser);
mockBcrypt.compare.mockResolvedValue(true);
mockSession.save.mockRejectedValue(new Error('Session save failed'));
```

**Assertions:**
- Session save error caught
- Response status is 500
- Error logged

---

### Security Tests

#### Test Case 10: Rate Limiting

**Test Name:** `should enforce rate limiting on login attempts`

**Description:** Verifies that rate limiting prevents brute force attacks.

**Input Data:**
```typescript
// Multiple failed login attempts from same IP
```

**Expected Output:**
- After 5 failed attempts in 15 minutes: HTTP 429 (Too Many Requests)
- Error message: "Too many login attempts. Please try again later."
- Further attempts blocked

**Assertions:**
- Rate limit counter incremented on failed attempts
- Rate limit enforced after threshold
- Response status is 429 after limit exceeded

**Test Implementation:**
```typescript
describe('User Login - Security', () => {
  test('should enforce rate limiting on login attempts', async () => {
    const credentials = {
      usernameOrEmail: 'testuser',
      password: 'wrongpassword',
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(false);

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await loginUser(credentials, mockSession, '192.168.1.1');
    }

    // 6th attempt should be rate limited
    const response = await loginUser(credentials, mockSession, '192.168.1.1');

    expect(response.status).toBe(429);
    expect(response.body.message).toContain('Too many');
  });
});
```

#### Test Case 11: Case Insensitive Username/Email

**Test Name:** `should handle case insensitive username and email lookup`

**Description:** Verifies that username/email lookup is case-insensitive.

**Input Data:**
```typescript
{
  usernameOrEmail: 'TestUser',
  password: 'password123',
}
```

**Expected Output:**
- User found regardless of case
- Login succeeds

**Assertions:**
- Username/email lowercased before lookup
- User found with case-insensitive match

---

### Edge Cases

#### Test Case 12: Username/Email with Whitespace

**Test Name:** `should trim whitespace from username or email`

**Description:** Verifies that leading/trailing whitespace is trimmed.

**Input Data:**
```typescript
{
  usernameOrEmail: '  testuser  ',
  password: 'password123',
}
```

**Expected Output:**
- Username/email trimmed before lookup
- Login succeeds if credentials are valid

**Assertions:**
- Input trimmed before database query
- `prisma.user.findUnique` called with trimmed value

#### Test Case 13: Very Long Password

**Test Name:** `should handle very long password input`

**Description:** Verifies that very long passwords (up to 128 characters) are handled.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: 'a'.repeat(128),
}
```

**Expected Output:**
- Password verification attempted
- Login succeeds if password is correct

**Assertions:**
- No length validation error (password can be up to 128 characters)
- `bcrypt.compare` called with long password

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear Prisma mock calls
- Clear bcrypt mock calls
- Reset session state
- Clear rate limiting counters

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  mockPrisma.user.findUnique.mockReset();
  mockBcrypt.compare.mockReset();
  mockSession.userId = null;
  mockSession.save.mockReset();
  // Reset rate limiting
});
```

## Test Execution

### Running the Test
```bash
npm test -- user-login.test.ts
```

### Expected Results
- All happy path tests pass
- All validation tests pass
- All authentication failure tests pass
- All error condition tests pass
- All security tests pass
- All edge case tests pass
- Test execution time < 2 seconds for full suite

## Coverage Goals

### Coverage Targets
- Login endpoint handler: 100% line coverage
- Input validation: 100% validation rule coverage
- Password verification: 100% coverage
- Session management: 100% coverage
- Database operations: 100% coverage
- Error handling: 100% error path coverage
- Rate limiting: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: POST `/api/auth/login`

**Test Coverage:**
- ✅ Valid login with username (200)
- ✅ Valid login with email (200)
- ✅ Missing credentials (400)
- ✅ User not found (401)
- ✅ Incorrect password (401)
- ✅ Database errors (503/500)
- ✅ Session creation errors (500)
- ✅ Rate limiting (429)

## Notes

- Password verification uses bcrypt.compare()
- Generic "Invalid credentials" message returned for both user not found and wrong password (security best practice)
- Session created with user ID stored in secure HTTP-only cookie
- Rate limiting: 5 attempts per IP per 15 minutes
- Username/email lookup is case-insensitive (normalized to lowercase)
- All authentication failures are logged with IP address and timestamp for security monitoring
