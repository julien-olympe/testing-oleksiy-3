# User Login Validation Tests

## Test ID: UT-03
## Test Name: User Login Validation

## Description and Purpose
Test the user login validation logic, including username lookup, password comparison, and session creation. Verify that only valid credentials allow login.

## Function/Component Being Tested
- `validateLoginInput()` function
- `findUserByUsername()` function
- `comparePassword()` function
- `createUserSession()` function
- Login service/controller

## Test Setup
- Mock database connection and query methods
- Mock user repository methods (findByUsername)
- Mock bcrypt password comparison
- Mock JWT token generation
- Mock session creation
- Test data: sample users with hashed passwords

## Test Cases

### Test Case 1: Valid Login Credentials
**Type**: Positive Test

**Description**: Verify that valid username and password allow successful login.

**Input Data**:
- Username: "john_doe"
- Password: "SecurePass123"

**Expected Output**:
- User is found in database
- Password comparison succeeds
- Session is created
- JWT token is generated
- Returns: `{ success: true, user: userObject, token: jwtToken }`

**Assertions**:
- `userRepository.findByUsername()` is called with "john_doe"
- User object is returned from database
- `bcrypt.compare()` is called with password and stored hash
- Password comparison returns true
- `jwtService.generateToken()` is called with user data
- Session is created
- Login succeeds

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return user object with hashed password
- Mock `bcrypt.compare()` to return `true`
- Mock `jwtService.generateToken()` to return JWT token string
- Mock `sessionService.createSession()` to return session object

**Test Isolation Requirements**:
- No shared state
- Fresh mocks for each test

---

### Test Case 2: Username Not Found
**Type**: Negative Test

**Description**: Verify that login fails when username does not exist.

**Input Data**:
- Username: "nonexistent_user"
- Password: "AnyPassword123"

**Expected Output**:
- User lookup fails
- Error message: "Invalid username or password."
- Returns: `{ success: false, error: "Invalid username or password." }`

**Assertions**:
- `userRepository.findByUsername()` is called with "nonexistent_user"
- User repository returns `null` or throws error
- Password comparison is not called
- Login fails with appropriate error message

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return `null`

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Incorrect Password
**Type**: Negative Test

**Description**: Verify that login fails when password is incorrect.

**Input Data**:
- Username: "john_doe"
- Password: "WrongPassword123"

**Expected Output**:
- User is found
- Password comparison fails
- Error message: "Invalid username or password."
- Returns: `{ success: false, error: "Invalid username or password." }`

**Assertions**:
- `userRepository.findByUsername()` is called with "john_doe"
- User object is returned
- `bcrypt.compare()` is called with wrong password and stored hash
- Password comparison returns false
- Login fails with appropriate error message

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return user object
- Mock `bcrypt.compare()` to return `false`

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Empty Username
**Type**: Negative Test (Boundary)

**Description**: Verify that login fails when username is empty.

**Input Data**:
- Username: ""
- Password: "SecurePass123"

**Expected Output**:
- Validation fails before database lookup
- Error message: "Username is required."
- Returns: `{ success: false, error: "Username is required." }`

**Assertions**:
- Username validation fails
- Database lookup is not called
- Login fails with validation error

**Mock Requirements**:
- No database mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Empty Password
**Type**: Negative Test (Boundary)

**Description**: Verify that login fails when password is empty.

**Input Data**:
- Username: "john_doe"
- Password: ""

**Expected Output**:
- Validation fails before database lookup
- Error message: "Password is required."
- Returns: `{ success: false, error: "Password is required." }`

**Assertions**:
- Password validation fails
- Database lookup is not called
- Login fails with validation error

**Mock Requirements**:
- No database mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Account Disabled/Locked
**Type**: Negative Test

**Description**: Verify that login fails when account is disabled or locked.

**Input Data**:
- Username: "disabled_user"
- Password: "SecurePass123"

**Expected Output**:
- User is found but account is disabled
- Error message: "Account is currently disabled. Please contact administrator."
- Returns: `{ success: false, error: "Account is currently disabled. Please contact administrator." }`

**Assertions**:
- `userRepository.findByUsername()` is called
- User object is returned with disabled status
- Account status check fails
- Login fails with appropriate error message

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return user object with `disabled: true` or `status: 'disabled'`

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Database Connection Error
**Type**: Error Handling Test

**Description**: Verify that database connection errors are properly handled during login.

**Input Data**:
- Username: "john_doe"
- Password: "SecurePass123"

**Expected Output**:
- Database connection error is caught
- Error message: "Internal server error. Please try again later."
- Returns: `{ success: false, error: "Internal server error. Please try again later." }`

**Assertions**:
- `userRepository.findByUsername()` throws database connection error
- Error is caught and handled
- Generic error message is returned (no internal details exposed)

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to throw database connection error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: JWT Token Generation Failure
**Type**: Error Handling Test

**Description**: Verify that JWT token generation failures are properly handled.

**Input Data**:
- Username: "john_doe"
- Password: "SecurePass123"

**Expected Output**:
- User authentication succeeds
- JWT token generation fails
- Error is caught and handled
- Error message: "Login failed. Please try again."

**Assertions**:
- User lookup and password comparison succeed
- `jwtService.generateToken()` throws an error
- Error is caught and handled
- Login fails with appropriate error message

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return user object
- Mock `bcrypt.compare()` to return `true`
- Mock `jwtService.generateToken()` to throw an error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Session Creation Failure
**Type**: Error Handling Test

**Description**: Verify that session creation failures are properly handled.

**Input Data**:
- Username: "john_doe"
- Password: "SecurePass123"

**Expected Output**:
- User authentication succeeds
- JWT token generation succeeds
- Session creation fails
- Error is caught and handled
- Error message: "Login failed. Please try again."

**Assertions**:
- User lookup, password comparison, and JWT generation succeed
- `sessionService.createSession()` throws an error
- Error is caught and handled
- Login fails with appropriate error message

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return user object
- Mock `bcrypt.compare()` to return `true`
- Mock `jwtService.generateToken()` to return token
- Mock `sessionService.createSession()` to throw an error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Case-Sensitive Username Lookup
**Type**: Positive Test (Edge Case)

**Description**: Verify that username lookup is case-sensitive (if required by specification).

**Input Data**:
- Username: "John_Doe" (different case)
- Password: "SecurePass123"
- Stored username: "john_doe" (lowercase)

**Expected Output**:
- Username lookup fails (case-sensitive)
- Error message: "Invalid username or password."
- Returns: `{ success: false, error: "Invalid username or password." }`

**Assertions**:
- `userRepository.findByUsername()` is called with exact case
- Username lookup is case-sensitive
- Login fails when case doesn't match

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return `null` for case mismatch

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Login with Email Instead of Username
**Type**: Positive Test (if supported)

**Description**: Verify that login can use email address if specification allows.

**Input Data**:
- Username/Email: "john.doe@example.com"
- Password: "SecurePass123"

**Expected Output**:
- User is found by email
- Password comparison succeeds
- Login succeeds

**Assertions**:
- `userRepository.findByEmail()` is called (if email login supported)
- User object is returned
- Password comparison succeeds
- Login succeeds

**Mock Requirements**:
- Mock `userRepository.findByEmail()` to return user object
- Mock `bcrypt.compare()` to return `true`
- Mock `jwtService.generateToken()` to return token

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Concurrent Login Attempts
**Type**: Edge Case Test

**Description**: Verify that multiple concurrent login attempts are handled correctly.

**Input Data**:
- Multiple login requests with same username/password

**Expected Output**:
- Each login attempt is processed independently
- All valid logins succeed
- Each receives a unique JWT token

**Assertions**:
- Multiple login calls are handled independently
- Each successful login generates a unique token
- No race conditions occur

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return user object
- Mock `bcrypt.compare()` to return `true`
- Mock `jwtService.generateToken()` to return unique tokens for each call

**Test Isolation Requirements**:
- No shared state
- Tests should verify concurrent behavior
