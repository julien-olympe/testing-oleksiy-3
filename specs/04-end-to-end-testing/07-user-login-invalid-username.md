# Test 07: User Login - Invalid Username

## Test ID
E2E-UC2-NEG-001

## Test Name
User Login - Invalid Username Error

## Description
This test verifies that the system correctly handles login attempts with a username that does not exist in the system. The system should display an appropriate error message and not create a session.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- No user with username `nonexistentuser` exists in the database
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Login Screen
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed with username and password fields

**Expected Result:** Login Screen is displayed correctly

### Step 2: Enter Invalid Username
1. Enter non-existent username in username field: `nonexistentuser`
2. Enter any password in password field: `AnyPassword123`

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

### Step 6: Verify Database Query Performed
1. Verify system attempted to retrieve user from database
2. Verify no user record was found with username `nonexistentuser`
3. Verify password comparison was not performed (user not found)

**Expected Result:** System correctly identifies that user does not exist

## Test Data Requirements

### Input Data
- **Username:** `nonexistentuser` (does not exist in database)
- **Password:** `AnyPassword123` (any password value)

### Database State
- No user with username `nonexistentuser` exists in database
- Database connection is available
- User table is accessible

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
- Database query is performed to find user
- No user record is found
- No password comparison is performed (user not found)
- Database remains unchanged

### Performance Outcomes
- Error response is returned within 500 milliseconds
- Error message is displayed immediately after form submission

### Security Outcomes
- Error message does not reveal whether username exists (generic message)
- Password field is cleared after failed login attempt
- No information leakage about user existence

## Cleanup Steps
1. Verify no session was created
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)

## Notes
- Error message should be generic ("Invalid username or password") to prevent username enumeration attacks
- System should not reveal whether the username exists or the password is incorrect
- Password field should be cleared after failed login for security
- User should be able to retry login with correct credentials
- This test verifies security best practice of not revealing user existence
