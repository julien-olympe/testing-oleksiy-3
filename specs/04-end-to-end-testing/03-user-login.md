# Use Case 2: User Login - E2E Test Scenarios

## Test Overview

**Test Name:** User Login - Complete Test Suite

**Description:** Comprehensive end-to-end tests for user login functionality covering positive cases, negative cases, edge cases, and security scenarios.

**Related Use Case:** Use Case 2: User Login

**Related Screen:** Screen 1: Login Screen

## Test Data Requirements

**Valid Test User:**
- Username: `test_login_user`
- Email: `test_login@example.com`
- Password: `TestPassword123!`
- User must exist in database with hashed password

**Invalid Test Data:**
- Non-existent username: `nonexistent_user`
- Non-existent email: `nonexistent@example.com`
- Incorrect password: `WrongPassword123!`
- Empty credentials
- SQL injection attempts: `' OR '1'='1`
- XSS attempts: `<script>alert('xss')</script>`

## Test Scenarios

### TC-001: User Login - Success with Username

**Description:** Verify successful login using username.

**Prerequisites:**
- Application is running
- Valid test user exists in database
- User is not already logged in

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed with:
     - Username/Email input field
     - Password input field
     - Login button
     - Register link

2. Fill login form with username
   - **Action:** Enter:
     - Username/Email: `test_login_user`
     - Password: `TestPassword123!`
   - **Expected Result:** Fields are filled with entered values

3. Submit login
   - **Action:** Click "Login" button
   - **Expected Result:**
     - Form submits successfully
     - Loading indicator appears (if applicable)
     - User is authenticated
     - Session is created
     - User is redirected to Home screen

**Assertions:**
- Session token is created and stored in secure cookie
- Session cookie has HttpOnly, Secure, and SameSite=Strict flags
- User is authenticated (session is valid)
- Home screen displays user's projects list
- User menu shows username
- Response time < 500ms
- Session expiration is set to 24 hours

**Cleanup:**
- Logout user
- Clear session

---

### TC-002: User Login - Success with Email

**Description:** Verify successful login using email address.

**Prerequisites:**
- Application is running
- Valid test user exists in database
- User is not already logged in

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Fill login form with email
   - **Action:** Enter:
     - Username/Email: `test_login@example.com`
     - Password: `TestPassword123!`
   - **Expected Result:** Fields are filled with entered values

3. Submit login
   - **Action:** Click "Login" button
   - **Expected Result:**
     - Form submits successfully
     - User is authenticated
     - Session is created
     - User is redirected to Home screen

**Assertions:**
- Session token is created
- User is authenticated
- Home screen is displayed
- Response time < 500ms

**Cleanup:**
- Logout user

---

### TC-003: User Login - Invalid Username/Email

**Description:** Verify login fails when username/email does not exist.

**Prerequisites:**
- Application is running
- User with username `nonexistent_user` does not exist

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Fill login form with non-existent username
   - **Action:** Enter:
     - Username/Email: `nonexistent_user`
     - Password: `AnyPassword123!`
   - **Expected Result:** Fields are filled

3. Submit login
   - **Action:** Click "Login" button
   - **Expected Result:**
     - Form submission fails
     - Error message is displayed: "Invalid credentials"
     - User remains on login screen
     - Password field is cleared (for security)

**Assertions:**
- No session is created
- Error message does not reveal whether username or password is incorrect
- User is not redirected
- Response time < 500ms
- No sensitive information is exposed

---

### TC-004: User Login - Incorrect Password

**Description:** Verify login fails when password is incorrect.

**Prerequisites:**
- Application is running
- Valid test user exists in database

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Fill login form with incorrect password
   - **Action:** Enter:
     - Username/Email: `test_login_user`
     - Password: `WrongPassword123!`
   - **Expected Result:** Fields are filled

3. Submit login
   - **Action:** Click "Login" button
   - **Expected Result:**
     - Form submission fails
     - Error message is displayed: "Invalid credentials"
     - User remains on login screen
     - Password field is cleared

**Assertions:**
- No session is created
- Error message is generic (does not specify password is wrong)
- User is not redirected
- Response time < 500ms
- Password is not logged or exposed

---

### TC-005: User Login - Empty Username/Email

**Description:** Verify login fails when username/email is empty.

**Prerequisites:**
- Application is running
- Login screen is accessible

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Attempt login with empty username
   - **Action:** Leave username/email empty, enter password, click "Login"
   - **Expected Result:**
     - Form submission is prevented
     - Error message indicates username/email is required
     - User remains on login screen

**Assertions:**
- No session is created
- Validation error is displayed
- Response time < 500ms

---

### TC-006: User Login - Empty Password

**Description:** Verify login fails when password is empty.

**Prerequisites:**
- Application is running
- Login screen is accessible

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Attempt login with empty password
   - **Action:** Enter username/email, leave password empty, click "Login"
   - **Expected Result:**
     - Form submission is prevented
     - Error message indicates password is required
     - User remains on login screen

**Assertions:**
- No session is created
- Validation error is displayed
- Response time < 500ms

---

### TC-007: User Login - All Fields Empty

**Description:** Verify login fails when all fields are empty.

**Prerequisites:**
- Application is running
- Login screen is accessible

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Attempt login with empty fields
   - **Action:** Leave all fields empty, click "Login"
   - **Expected Result:**
     - Form submission is prevented
     - Error messages indicate required fields
     - User remains on login screen

**Assertions:**
- No session is created
- Validation errors are displayed
- Response time < 500ms

---

### TC-008: User Login - SQL Injection Attempt

**Description:** Verify login is protected against SQL injection attacks.

**Prerequisites:**
- Application is running
- Login screen is accessible

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Attempt SQL injection in username field
   - **Action:** Enter:
     - Username/Email: `' OR '1'='1`
     - Password: `anything`
   - **Expected Result:**
     - Form may show validation error or submit
     - If submitted, login fails
     - Error message: "Invalid credentials"
     - No SQL injection occurs

3. Attempt SQL injection in password field
   - **Action:** Enter:
     - Username/Email: `test_login_user`
     - Password: `' OR '1'='1`
   - **Expected Result:**
     - Login fails
     - Error message: "Invalid credentials"
     - No SQL injection occurs

**Assertions:**
- No SQL injection is successful
- Database queries use parameterized statements
- Error messages are generic
- No database errors are exposed
- Response time < 500ms

---

### TC-009: User Login - XSS Attempt

**Description:** Verify login form is protected against XSS attacks.

**Prerequisites:**
- Application is running
- Login screen is accessible

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Attempt XSS in username field
   - **Action:** Enter:
     - Username/Email: `<script>alert('xss')</script>`
     - Password: `anything`
   - **Expected Result:**
     - Script tags are not executed
     - Input is treated as plain text
     - Login fails with "Invalid credentials"

3. Attempt XSS in password field
   - **Action:** Enter:
     - Username/Email: `test_login_user`
     - Password: `<script>alert('xss')</script>`
   - **Expected Result:**
     - Script tags are not executed
     - Login fails

**Assertions:**
- No XSS occurs
- Script tags are escaped/not executed
- Input is sanitized
- Response time < 500ms

---

### TC-010: User Login - Case Sensitivity

**Description:** Verify username/email and password case sensitivity handling.

**Prerequisites:**
- Application is running
- Test user exists with username `test_login_user` (lowercase)

**Test Steps:**

1. Test username case sensitivity
   - **Action:** Attempt login with:
     - Username/Email: `TEST_LOGIN_USER` (uppercase)
     - Password: `TestPassword123!`
   - **Expected Result:**
     - Login succeeds if username is case-insensitive
     - Login fails if username is case-sensitive
     - Behavior matches specification

2. Test email case sensitivity
   - **Action:** Attempt login with:
     - Username/Email: `TEST_LOGIN@EXAMPLE.COM` (uppercase)
     - Password: `TestPassword123!`
   - **Expected Result:**
     - Login succeeds (email should be case-insensitive per standard)
     - Behavior matches specification

3. Test password case sensitivity
   - **Action:** Attempt login with:
     - Username/Email: `test_login_user`
     - Password: `testpassword123!` (lowercase)
   - **Expected Result:**
     - Login fails (password should be case-sensitive)
     - Error message: "Invalid credentials"

**Assertions:**
- Password is case-sensitive
- Username/email case sensitivity matches specification
- Response time < 500ms

---

### TC-011: User Login - Session Creation

**Description:** Verify session is created correctly after successful login.

**Prerequisites:**
- Application is running
- Valid test user exists

**Test Steps:**

1. Login successfully
   - **Action:** Login with valid credentials
   - **Expected Result:** User is redirected to Home screen

2. Verify session
   - **Action:** Check browser cookies and session storage
   - **Expected Result:**
     - Session cookie is set
     - Cookie has HttpOnly flag (not accessible via JavaScript)
     - Cookie has Secure flag (HTTPS only in production)
     - Cookie has SameSite=Strict flag
     - Cookie expiration is set to 24 hours

3. Verify session validity
   - **Action:** Make authenticated API request (e.g., load projects)
   - **Expected Result:**
     - Request succeeds
     - User data is returned correctly
     - Session is valid

**Assertions:**
- Session token is cryptographically random (32 bytes)
- Session is stored securely
- Session expiration is 24 hours
- Session is valid for authenticated requests
- Response time < 500ms

---

### TC-012: User Login - Multiple Failed Attempts

**Description:** Verify system behavior after multiple failed login attempts.

**Prerequisites:**
- Application is running
- Valid test user exists

**Test Steps:**

1. Attempt multiple failed logins
   - **Action:** Attempt login with incorrect password 5 times
   - **Expected Result:**
     - Each attempt fails with "Invalid credentials"
     - No account lockout occurs (if not implemented)
     - User can still attempt login

2. Attempt successful login after failures
   - **Action:** Login with correct credentials
   - **Expected Result:**
     - Login succeeds
     - User is authenticated
     - No additional restrictions

**Assertions:**
- Multiple failed attempts do not lock account (per specs, no lockout)
- Rate limiting may apply (100 requests per minute per session)
- Successful login works after failures
- Response time < 500ms per attempt

---

### TC-013: User Login - Navigation to Registration

**Description:** Verify navigation from login screen to registration screen.

**Prerequisites:**
- Application is running
- Login screen is accessible

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Navigate to registration
   - **Action:** Click "Register" link
   - **Expected Result:**
     - User is redirected to registration screen
     - Registration form is displayed
     - No data is lost

**Assertions:**
- Navigation works correctly
- Registration screen is displayed
- Response time < 500ms

---

### TC-014: User Login - Password Visibility Toggle

**Description:** Verify password field show/hide toggle functionality.

**Prerequisites:**
- Application is running
- Login screen is accessible

**Test Steps:**

1. Navigate to login screen
   - **Action:** Open application URL
   - **Expected Result:** Login screen is displayed

2. Enter password
   - **Action:** Enter password in password field
   - **Expected Result:** Password is hidden (shows dots/asterisks)

3. Toggle password visibility
   - **Action:** Click password visibility toggle button (if present)
   - **Expected Result:**
     - Password becomes visible (plain text)
     - Toggle button icon changes

4. Toggle password visibility again
   - **Action:** Click toggle button again
   - **Expected Result:**
     - Password becomes hidden again
     - Toggle button icon changes back

**Assertions:**
- Password visibility toggle works correctly
- Password is hidden by default
- Toggle state persists during form interaction
- Response time < 100ms

---

## Performance Requirements

- Login screen load: < 1 second
- Login submission: < 500ms
- Error message display: < 500ms
- Session creation: < 500ms
- Database query for user lookup: < 100ms
- Password verification (bcrypt): < 500ms

## Security Requirements

- Passwords are never logged
- Error messages are generic (do not reveal which field is incorrect)
- Session tokens are cryptographically random
- Session cookies have security flags (HttpOnly, Secure, SameSite)
- SQL injection is prevented (parameterized queries)
- XSS is prevented (input sanitization)
- Rate limiting: 100 requests per minute per session

## Cleanup

After test execution:
- Logout all test sessions
- Clear browser cookies
- Verify no sessions remain active
- Clean up any test data
