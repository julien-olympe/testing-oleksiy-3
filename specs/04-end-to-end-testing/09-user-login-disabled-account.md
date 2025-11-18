# Test 09: User Login - Disabled Account

## Test ID
E2E-UC2-NEG-003

## Test Name
User Login - Disabled Account Error

## Description
This test verifies that the system correctly prevents login when a user attempts to authenticate with a disabled or locked account. The system should display an appropriate error message and not create a session.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists in database with:
  - Username: `disableduser`
  - Email: `disableduser@example.com`
  - Password: `TestPass123` (stored as bcrypt hash)
  - Account is disabled/locked (status field set to disabled or locked)
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Login Screen
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed with username and password fields

**Expected Result:** Login Screen is displayed correctly

### Step 2: Enter Credentials for Disabled Account
1. Enter username in username field: `disableduser`
2. Enter password in password field: `TestPass123`

**Expected Result:** Credentials are entered, no validation errors displayed yet

### Step 3: Submit Login Form
1. Click "Login" button
2. Wait for login request to complete

**Expected Result:** Login request is sent to server

### Step 4: Verify Error Message Displayed
1. Verify user is NOT redirected to Home Screen
2. Verify login form remains displayed
3. Verify error message is displayed with exact text: "Account is currently disabled. Please contact administrator."
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

### Step 6: Verify Account Status Checked
1. Verify system retrieved user from database using username
2. Verify system checked user account status (disabled/locked)
3. Verify system did not proceed with password verification (account disabled)
4. Verify user record was not modified

**Expected Result:** System correctly identifies that account is disabled

## Test Data Requirements

### Input Data
- **Username:** `disableduser` (exists in database, but account is disabled)
- **Password:** `TestPass123` (may be correct, but account is disabled)

### Database State
- User with username `disableduser` exists in database
- User password is hashed using bcrypt with 12 salt rounds
- User account status is set to disabled/locked (e.g., `is_active = false` or `status = 'disabled'`)
- Account may have been disabled by administrator or due to security reasons

## Expected Outcomes

### UI Outcomes
- Login form remains displayed
- Error message "Account is currently disabled. Please contact administrator." is displayed
- Error message is visible and clearly styled
- User is not redirected to Home Screen
- Password field is cleared (security best practice)
- Username field may retain value or be cleared (implementation dependent)

### API Outcomes
- Login endpoint returns HTTP 403 (Forbidden) or HTTP 401 (Unauthorized)
- Response includes error message: "Account is currently disabled. Please contact administrator."
- No JWT token is returned
- No session is created

### Database Outcomes
- User record is retrieved from database
- Account status is checked (disabled/locked)
- Password verification is not performed (account disabled)
- User record is not modified

### Performance Outcomes
- Error response is returned within 500 milliseconds
- Error message is displayed immediately after form submission

### Security Outcomes
- Disabled accounts cannot be used to authenticate
- Error message provides clear guidance (contact administrator)
- Password field is cleared after failed login attempt
- Account status is checked before password verification

## Cleanup Steps
1. Verify no session was created
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)
4. Verify test user account remains disabled in database (should not be re-enabled)

## Notes
- Account status check should occur before password verification for efficiency
- Error message should provide clear guidance to user (contact administrator)
- Disabled accounts may be disabled for various reasons (administrative action, security, etc.)
- Password field should be cleared after failed login for security
- User should not be able to bypass account status by knowing correct password
- This test verifies access control and account management functionality
