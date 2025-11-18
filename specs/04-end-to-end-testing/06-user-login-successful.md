# Test 06: User Login - Successful Login

## Test ID
E2E-UC2-POS-001

## Test Name
User Login - Successful Login

## Description
This test verifies that an existing user can successfully authenticate to the system using their username and password. Upon successful login, the user should be redirected to the Home Screen and have access to their assigned projects.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists in database with:
  - Username: `testuser`
  - Email: `testuser@example.com`
  - Password: `TestPass123` (stored as bcrypt hash with 12 salt rounds)
  - Account is active/enabled
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Login Screen
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed with:
   - Username input field
   - Password input field (masked)
   - "Login" button
   - "Register" link/button
   - Application branding/logo

**Expected Result:** Login Screen is displayed correctly with all required elements

### Step 2: Enter Valid Credentials
1. Enter username in username field: `testuser`
2. Enter password in password field: `TestPass123`

**Expected Result:** Credentials are entered, no validation errors displayed

### Step 3: Submit Login Form
1. Click "Login" button
2. Wait for login request to complete (maximum 500 milliseconds as per performance requirements)

**Expected Result:** Login request is sent to server

### Step 4: Verify Successful Login
1. Verify user is redirected to Home Screen
2. Verify Home Screen displays:
   - Header with application title/logo
   - User information displayed in header (username or email: `testuser` or `testuser@example.com`)
   - Logout button visible in header
   - "Start Project" button visible
   - Project list area (may show projects or empty state)

**Expected Result:** User is successfully logged in and redirected to Home Screen

### Step 5: Verify Session Created
1. Verify JWT token is stored (in localStorage, sessionStorage, or cookie)
2. Verify token is valid JSON Web Token format
3. Verify token can be used for authenticated API requests
4. Verify Authorization header includes: `Authorization: Bearer <token>`

**Expected Result:** Valid session token is created and stored

### Step 6: Verify User Can Access Authenticated Pages
1. Verify user can navigate to Home Screen
2. Verify user can access project-related pages (if projects exist)
3. Verify authenticated API requests succeed with token

**Expected Result:** User has full access to authenticated features

## Test Data Requirements

### Input Data
- **Username:** `testuser` (must exist in database)
- **Password:** `TestPass123` (must match stored password hash)

### Database State
- User with username `testuser` exists in database
- User password is hashed using bcrypt with 12 salt rounds
- User account is active/enabled
- User may have assigned projects (optional for this test)

## Expected Outcomes

### UI Outcomes
- Login form accepts credentials without errors
- Successful login redirects to Home Screen
- Home Screen displays correctly with user information
- User is authenticated (session active)
- Logout button is visible and functional

### API Outcomes
- Login endpoint returns HTTP 200 (OK) or HTTP 201 (Created)
- Response includes JWT token or session information
- Response time is less than 500 milliseconds
- No error messages in response

### Database Outcomes
- User record is retrieved from database
- Password hash is verified using bcrypt.compare()
- User account status is checked (must be active)
- No changes to user record (login does not modify user data)

### Performance Outcomes
- Login completes within 500 milliseconds (as per performance requirements)
- Page load time is acceptable (< 2 seconds)

## Cleanup Steps
1. Logout user (if session persists)
2. Clear browser session and cookies
3. Clear stored JWT token
4. Close browser instance (if not reused for other tests)

## Notes
- Password must be verified using bcrypt.compare() method
- JWT token expiration: 7 days (as per technical specifications)
- Session timeout: 24 hours of inactivity
- User should remain logged in until explicit logout or token expiration
- Login should work with both username and potentially email (if supported)
