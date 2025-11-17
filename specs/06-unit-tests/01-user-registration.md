# Unit Test: User Registration (Use Case 1)

## Test Overview

**Test Name:** User Registration Tests  
**Purpose:** Test the user registration functionality including validation, password hashing, database operations, and error handling.

**Component Being Tested:** 
- POST `/api/auth/register` endpoint
- User registration service/controller
- Input validation (Zod schemas)
- Password hashing (bcrypt)
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
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};
```

**Password Hashing Mocking:**
```typescript
const mockBcrypt = {
  hash: jest.fn(),
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

**Valid User Data:**
```typescript
const validUserData = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
};
```

**Invalid User Data:**
```typescript
const invalidUserData = {
  username: 'ab', // Too short (< 3 characters)
  email: 'invalid-email', // Invalid format
  password: 'short', // Too short (< 8 characters)
  passwordConfirmation: 'different', // Mismatch
};
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Successful User Registration

**Test Name:** `should create user when valid registration data provided`

**Description:** Verifies that a new user can be registered with valid data.

**Input Data:**
```typescript
{
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'securepass123',
  passwordConfirmation: 'securepass123',
}
```

**Expected Output:**
- HTTP 201 status code
- User record created in database
- Password hashed with bcrypt (salt rounds: 10)
- Response: `{ message: "User registered successfully" }`
- Redirect to login screen (or success response)

**Assertions:**
- `prisma.user.findUnique` called to check username uniqueness
- `prisma.user.findUnique` called to check email uniqueness
- `bcrypt.hash` called with password and salt rounds 10
- `prisma.user.create` called with hashed password
- Response status is 201
- Response contains success message

**Test Implementation:**
```typescript
describe('User Registration - Happy Path', () => {
  test('should create user when valid registration data provided', async () => {
    const userData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'securepass123',
      passwordConfirmation: 'securepass123',
    };

    const hashedPassword = '$2b$10$hashedpassword';
    
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(null) // Username not exists
      .mockResolvedValueOnce(null); // Email not exists
    mockBcrypt.hash.mockResolvedValue(hashedPassword);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-uuid',
      username: userData.username,
      email: userData.email,
      password_hash: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const response = await registerUser(userData);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: userData.username },
    });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: userData.email },
    });
    expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        username: userData.username.toLowerCase().trim(),
        email: userData.email.toLowerCase().trim(),
        password_hash: hashedPassword,
      },
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
  });
});
```

---

### Validation Tests

#### Test Case 2: Username Too Short

**Test Name:** `should reject registration when username is too short`

**Description:** Verifies that usernames shorter than 3 characters are rejected.

**Input Data:**
```typescript
{
  username: 'ab',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Username must be at least 3 characters"
- User not created in database

**Assertions:**
- Validation error thrown
- `prisma.user.create` not called
- Response status is 400
- Response contains validation error

**Test Implementation:**
```typescript
describe('User Registration - Validation', () => {
  test('should reject registration when username is too short', async () => {
    const userData = {
      username: 'ab',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    };

    await expect(registerUser(userData)).rejects.toThrow();
    
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});
```

#### Test Case 3: Username Too Long

**Test Name:** `should reject registration when username exceeds maximum length`

**Description:** Verifies that usernames longer than 50 characters are rejected.

**Input Data:**
```typescript
{
  username: 'a'.repeat(51),
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Username must not exceed 50 characters"
- User not created

**Assertions:**
- Validation error thrown
- `prisma.user.create` not called

#### Test Case 4: Invalid Email Format

**Test Name:** `should reject registration when email format is invalid`

**Description:** Verifies that invalid email formats are rejected.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'invalid-email',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Invalid email format"
- User not created

**Assertions:**
- Validation error thrown
- `prisma.user.create` not called

#### Test Case 5: Password Too Short

**Test Name:** `should reject registration when password is too short`

**Description:** Verifies that passwords shorter than 8 characters are rejected.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'short',
  passwordConfirmation: 'short',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Password must be at least 8 characters"
- User not created

**Assertions:**
- Validation error thrown
- `prisma.user.create` not called

#### Test Case 6: Password Mismatch

**Test Name:** `should reject registration when passwords do not match`

**Description:** Verifies that password and password confirmation must match.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'different123',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Passwords do not match"
- User not created

**Assertions:**
- Validation error thrown
- `prisma.user.create` not called

---

### Uniqueness Tests

#### Test Case 7: Username Already Exists

**Test Name:** `should reject registration when username already exists`

**Description:** Verifies that duplicate usernames are rejected.

**Input Data:**
```typescript
{
  username: 'existinguser',
  email: 'new@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 409 status code (Conflict)
- Error message: "Username already exists"
- User not created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockResolvedValueOnce({
  id: 'existing-uuid',
  username: 'existinguser',
  email: 'existing@example.com',
});
```

**Assertions:**
- `prisma.user.findUnique` called with username
- Existing user found
- `prisma.user.create` not called
- Response status is 409

**Test Implementation:**
```typescript
describe('User Registration - Uniqueness', () => {
  test('should reject registration when username already exists', async () => {
    const userData = {
      username: 'existinguser',
      email: 'new@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    };

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'existing-uuid',
      username: 'existinguser',
      email: 'existing@example.com',
    });

    const response = await registerUser(userData);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: userData.username },
    });
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already exists');
  });
});
```

#### Test Case 8: Email Already Exists

**Test Name:** `should reject registration when email already exists`

**Description:** Verifies that duplicate emails are rejected.

**Input Data:**
```typescript
{
  username: 'newuser',
  email: 'existing@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 409 status code (Conflict)
- Error message: "Email already exists"
- User not created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique
  .mockResolvedValueOnce(null) // Username not exists
  .mockResolvedValueOnce({ // Email exists
    id: 'existing-uuid',
    username: 'otheruser',
    email: 'existing@example.com',
  });
```

**Assertions:**
- `prisma.user.findUnique` called for both username and email
- Existing email found
- `prisma.user.create` not called
- Response status is 409

---

### Error Condition Tests

#### Test Case 9: Database Connection Failure

**Test Name:** `should handle database connection failure during registration`

**Description:** Verifies that database connection errors are handled gracefully.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 503 status code (Service Unavailable)
- Error message: "Database temporarily unavailable. Please try again in a few moments."
- User not created

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
describe('User Registration - Error Conditions', () => {
  test('should handle database connection failure during registration', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    };

    mockPrisma.user.findUnique.mockRejectedValue(
      new Error('Connection failed')
    );

    const response = await registerUser(userData);

    expect(response.status).toBe(503);
    expect(response.body.message).toContain('unavailable');
  });
});
```

#### Test Case 10: Database Save Failure

**Test Name:** `should handle database save failure during user creation`

**Description:** Verifies that database save errors are handled gracefully.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 500 status code (Internal Server Error)
- Error message: "Unable to create account. Please try again."
- User not created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique
  .mockResolvedValueOnce(null)
  .mockResolvedValueOnce(null);
mockBcrypt.hash.mockResolvedValue('hashed');
mockPrisma.user.create.mockRejectedValue(
  new Error('Database constraint violation')
);
```

**Assertions:**
- Database error caught
- Response status is 500
- Generic error message returned

#### Test Case 11: Password Hashing Failure

**Test Name:** `should handle password hashing failure`

**Description:** Verifies that bcrypt hashing errors are handled gracefully.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to process registration. Please try again."
- User not created

**Mock Setup:**
```typescript
mockPrisma.user.findUnique
  .mockResolvedValueOnce(null)
  .mockResolvedValueOnce(null);
mockBcrypt.hash.mockRejectedValue(new Error('Hashing failed'));
```

**Assertions:**
- Hashing error caught
- `prisma.user.create` not called
- Response status is 500

---

### Edge Cases

#### Test Case 12: Username with Whitespace

**Test Name:** `should trim whitespace from username`

**Description:** Verifies that leading/trailing whitespace is trimmed from username.

**Input Data:**
```typescript
{
  username: '  testuser  ',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- User created with trimmed username: `'testuser'`
- Username stored without leading/trailing spaces

**Assertions:**
- Username trimmed before storage
- `prisma.user.create` called with trimmed username

#### Test Case 13: Email with Whitespace

**Test Name:** `should trim whitespace from email`

**Description:** Verifies that leading/trailing whitespace is trimmed from email.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: '  test@example.com  ',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- User created with trimmed email: `'test@example.com'`
- Email stored without leading/trailing spaces

**Assertions:**
- Email trimmed before storage
- `prisma.user.create` called with trimmed email

#### Test Case 14: Username Case Insensitivity

**Test Name:** `should store username in lowercase`

**Description:** Verifies that usernames are converted to lowercase before storage.

**Input Data:**
```typescript
{
  username: 'TestUser',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- Username stored as: `'testuser'`
- Username comparison is case-insensitive

**Assertions:**
- Username lowercased before storage
- `prisma.user.create` called with lowercase username

#### Test Case 15: Email Case Insensitivity

**Test Name:** `should store email in lowercase`

**Description:** Verifies that emails are converted to lowercase before storage.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'Test@Example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- Email stored as: `'test@example.com'`
- Email comparison is case-insensitive

**Assertions:**
- Email lowercased before storage
- `prisma.user.create` called with lowercase email

#### Test Case 16: Maximum Length Username

**Test Name:** `should accept username at maximum length (50 characters)`

**Description:** Verifies that usernames at the maximum length (50 characters) are accepted.

**Input Data:**
```typescript
{
  username: 'a'.repeat(50),
  email: 'test@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- User created successfully
- Username stored as-is (50 characters)

**Assertions:**
- Validation passes
- `prisma.user.create` called with 50-character username

#### Test Case 17: Minimum Length Password

**Test Name:** `should accept password at minimum length (8 characters)`

**Description:** Verifies that passwords at the minimum length (8 characters) are accepted.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'test@example.com',
  password: '12345678',
  passwordConfirmation: '12345678',
}
```

**Expected Output:**
- User created successfully
- Password hashed and stored

**Assertions:**
- Validation passes
- `bcrypt.hash` called with 8-character password

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear Prisma mock calls
- Clear bcrypt mock calls
- Reset test data

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  mockPrisma.user.create.mockReset();
  mockPrisma.user.findUnique.mockReset();
  mockBcrypt.hash.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- user-registration.test.ts
```

### Expected Results
- All happy path tests pass
- All validation tests pass
- All uniqueness tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 2 seconds for full suite

## Coverage Goals

### Coverage Targets
- Registration endpoint handler: 100% line coverage
- Input validation: 100% validation rule coverage
- Password hashing: 100% coverage
- Database operations: 100% coverage
- Error handling: 100% error path coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: POST `/api/auth/register`

**Test Coverage:**
- ✅ Valid registration (201)
- ✅ Invalid input validation (400)
- ✅ Username uniqueness (409)
- ✅ Email uniqueness (409)
- ✅ Database errors (503/500)
- ✅ Password hashing errors (500)

## Notes

- Password hashing uses bcrypt with 10 salt rounds
- Username and email are normalized (trimmed and lowercased) before storage
- All validation errors return HTTP 400 with specific error messages
- Database errors return generic messages to users (detailed errors logged server-side)
- Username and email uniqueness checks are performed before password hashing to optimize performance
