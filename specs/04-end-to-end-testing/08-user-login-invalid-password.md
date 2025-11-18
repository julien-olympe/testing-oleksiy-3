# Test 08: User Login - Invalid Password

## Test ID
E2E-UC2-NEG-002

## Test Name
User Login - Invalid Password Error

## Description
This test verifies that the system correctly handles login attempts with a valid username but incorrect password. The system should display an appropriate error message and not create a session.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists in database with:
  - Username: `testuser`
  - Email: `testuser@example.com`
  - Password: `TestPass123` (stored as bcrypt hash)
  - Account is active/enabled
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Login Screen
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed with username and password fields

**Expected Result:** Login Screen is displayed correctly

### Step 2: Enter Valid Username with Invalid Password
1. Enter valid username in username field: `testuser`
2. Enter incorrect password in password field: `WrongPassword123`

**Expected Result:** Credentials are entered, no validation errors displayed yet

### Step 3: Submit Login Form
1. Click "Login" button
2. Wait for login request to complete

**Expected Result:** Login request is sent to server

### Step 4: Verify Error Message Displayed
1. Verify user is NOT redirected to Home Screen
2. Verify login form remains displayed
3. Verify error message is displayed with exact text: "Invalid username or password."
4. Verify error message is displayed in appropriate location (below form or error message area)
5. Verify error message is styled appropriately (red text, visible)
6. Verify password field is cleared (for security)

**Expected Result:** Error message is displayed, user remains on login form

### Step 5: Verify No Session Created
1. Verify no JWT token is stored
2. Verify no session is created
3. Verify user is not authenticated
4. Verify user cannot access authenticated pages (if attempted)

**Expected Result:** No session is created, user is not authenticated

### Step 6: Verify Password Verification Performed
1. Verify system retrieved user from database using username
2. Verify system attempted password comparison using bcrypt.compare()
3. Verify password comparison returned false (password mismatch)
4. Verify user record was not modified

**Expected Result:** System correctly identifies that password is incorrect

## Test Data Requirements

### Input Data
- **Username:** `testuser` (exists in database)
- **Password:** `WrongPassword123` (incorrect, does not match stored hash)

### Database State
- User with username `testuser` exists in database
- User password is hashed using bcrypt with 12 salt rounds
- Stored password hash corresponds to `TestPass123` (not `WrongPassword123`)
- User account is active/enabled

## Expected Outcomes

### UI Outcomes
- Login form remains displayed
- Error message "Invalid username or password." is displayed
- Error message is visible and clearly styled
- User is not redirected to Home Screen
- Password field is cleared (security best practice)
- Username field may retain value or be cleared (implementation dependent)

### API Outcomes
- Login endpoint returns HTTP 401 (Unauthorized)
- Response includes error message: "Invalid username or password."
- No JWT token is returned
- No session is created

### Database Outcomes
- User record is retrieved from database
- Password comparison is performed using bcrypt.compare()
- Password comparison returns false (password mismatch)
- User record is not modified

### Performance Outcomes
- Error response is returned within 500 milliseconds
- Error message is displayed immediately after form submission

### Security Outcomes
- Error message does not reveal whether username exists (generic message)
- Password field is cleared after failed login attempt
- Password comparison uses secure bcrypt.compare() method
- No information leakage about password correctness

## Cleanup Steps
1. Verify no session was created
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)
4. Verify test user account remains unchanged in database

## Notes
- Error message should be generic ("Invalid username or password") to prevent username enumeration attacks
- System should not reveal whether the username exists or the password is incorrect
- Password comparison must use bcrypt.compare() for security
- Password field should be cleared after failed login for security
- User should be able to retry login with correct password
- This test verifies security best practice of secure password verification
