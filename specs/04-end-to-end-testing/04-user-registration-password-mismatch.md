# Test 04: User Registration - Password Mismatch

## Test ID
E2E-UC1-NEG-003

## Test Name
User Registration - Password Mismatch Error

## Description
This test verifies that the system correctly prevents registration when the password and password confirmation fields do not match. The system should display an appropriate error message and not create a user account.

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

### Step 2: Enter Registration Data with Mismatched Passwords
1. Enter username in username field: `testuser_${timestamp}`
2. Enter email in email field: `testuser_${timestamp}@example.com`
3. Enter password in password field: `TestPass123`
4. Enter different password in confirmation field: `TestPass456`

**Expected Result:** All fields are populated, passwords do not match

### Step 3: Submit Registration Form
1. Click "Register" or "Submit" button
2. Wait for registration request to complete

**Expected Result:** Registration request is sent to server (or client-side validation prevents submission)

### Step 4: Verify Error Message Displayed
1. Verify user is NOT redirected to Home Screen
2. Verify registration form remains displayed
3. Verify error message is displayed with exact text: "Passwords do not match."
4. Verify error message is displayed in appropriate location (below form or inline with password confirmation field)
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

### Input Data
- **Username:** `testuser_${timestamp}` (unique, valid)
- **Email:** `testuser_${timestamp}@example.com` (unique, valid format)
- **Password:** `TestPass123` (valid password)
- **Password Confirmation:** `TestPass456` (different from password - mismatch)

### Database State
- No existing user with test username
- No existing user with test email
- Database connection is available

## Expected Outcomes

### UI Outcomes
- Registration form remains displayed
- Error message "Passwords do not match." is displayed
- Error message is visible and clearly styled
- User is not redirected to Home Screen
- Password fields may be cleared or retain values (implementation dependent)

### API Outcomes
- Registration endpoint returns HTTP 400 (Bad Request) if request reaches server
- Response includes error message: "Passwords do not match."
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
- Password mismatch validation may occur on client-side (before form submission) or server-side (after form submission)
- Both approaches are acceptable, but server-side validation is required as a security measure
- Error message must match exact specification from functional requirements
- User should be able to correct password confirmation and retry registration
- Password fields should be cleared after error for security reasons (recommended)
