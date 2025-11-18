# Test 05: User Registration - Weak Password

## Test ID
E2E-UC1-NEG-004

## Test Name
User Registration - Weak Password Error

## Description
This test verifies that the system correctly prevents registration when a user attempts to register with a password that does not meet the minimum requirements (at least 8 characters and contain letters and numbers). The system should display an appropriate error message and not create a user account.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- No existing user with the test username or email exists in the database
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Registration
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed
3. Click on "Register" link/button
4. Verify registration form is displayed

**Expected Result:** Registration form is displayed

### Step 2: Enter Registration Data with Weak Password
1. Enter username in username field: `testuser_${timestamp}`
2. Enter email in email field: `testuser_${timestamp}@example.com`
3. Enter weak password in password field: `weak` (less than 8 characters, no numbers)
4. Enter same weak password in confirmation field: `weak`

**Expected Result:** All fields are populated, password does not meet requirements

### Step 3: Submit Registration Form
1. Click "Register" or "Submit" button
2. Wait for registration request to complete

**Expected Result:** Registration request is sent to server (or client-side validation prevents submission)

### Step 4: Verify Error Message Displayed
1. Verify user is NOT redirected to Home Screen
2. Verify registration form remains displayed
3. Verify error message is displayed with exact text: "Password must be at least 8 characters and contain letters and numbers."
4. Verify error message is displayed in appropriate location (below form or inline with password field)
5. Verify error message is styled appropriately (red text, visible)

**Expected Result:** Error message is displayed, user remains on registration form

### Step 5: Verify No User Created
1. Query test database for user records with test username or email
2. Verify no user record exists with the test username
3. Verify no user record exists with the test email

**Expected Result:** No user account is created

### Step 6: Verify User Not Logged In
1. Verify no session token is created
2. Verify user is not authenticated
3. Verify user cannot access authenticated pages (if attempted)

**Expected Result:** User is not logged in, no session created

## Test Data Requirements

### Input Data - Test Case 5a: Password Too Short
- **Username:** `testuser_${timestamp}` (unique, valid)
- **Email:** `testuser_${timestamp}@example.com` (unique, valid format)
- **Password:** `weak` (4 characters, only letters - does not meet requirements)
- **Password Confirmation:** `weak` (matches password but weak)

### Input Data - Test Case 5b: Password Without Numbers
- **Username:** `testuser_${timestamp}` (unique, valid)
- **Email:** `testuser_${timestamp}@example.com` (unique, valid format)
- **Password:** `weakpassword` (8+ characters, only letters - no numbers)
- **Password Confirmation:** `weakpassword` (matches password but weak)

### Input Data - Test Case 5c: Password Without Letters
- **Username:** `testuser_${timestamp}` (unique, valid)
- **Email:** `testuser_${timestamp}@example.com` (unique, valid format)
- **Password:** `12345678` (8+ characters, only numbers - no letters)
- **Password Confirmation:** `12345678` (matches password but weak)

### Database State
- No existing user with test username
- No existing user with test email
- Database connection is available

## Expected Outcomes

### UI Outcomes
- Registration form remains displayed
- Error message "Password must be at least 8 characters and contain letters and numbers." is displayed
- Error message is visible and clearly styled
- User is not redirected to Home Screen
- Password fields may be cleared or retain values (implementation dependent)

### API Outcomes
- Registration endpoint returns HTTP 400 (Bad Request) if request reaches server
- Response includes error message: "Password must be at least 8 characters and contain letters and numbers."
- No user account is created
- OR: Client-side validation prevents form submission (acceptable alternative)

### Database Outcomes
- No new user record is created
- Database remains unchanged

### Performance Outcomes
- Error response is returned immediately (client-side) or within 1 second (server-side)
- Error message is displayed immediately after form submission or validation

## Cleanup Steps
1. Verify no test user was created in database
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)

## Notes
- Password validation may occur on client-side (before form submission) or server-side (after form submission)
- Both approaches are acceptable, but server-side validation is required as a security measure
- Error message must match exact specification from functional requirements
- Multiple weak password scenarios should be tested (too short, no numbers, no letters)
- User should be able to correct password and retry registration
- Password fields should be cleared after error for security reasons (recommended)
- Password requirements: minimum 8 characters, must contain both letters and numbers
