# Test 01: User Registration - Successful Registration

## Test ID
E2E-UC1-POS-001

## Test Name
User Registration - Successful Registration

## Description
This test verifies that a new user can successfully register an account in the system by providing valid registration information. Upon successful registration, the user should be automatically logged in and redirected to the Home Screen.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- No existing user with the test username or email exists in the database
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Registration
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed with username and password fields
3. Click on "Register" link/button
4. Verify registration form is displayed with the following fields:
   - Username input field
   - Email address input field
   - Password input field (masked)
   - Password confirmation input field (masked)
   - Submit/Register button

**Expected Result:** Registration form is displayed with all required fields

### Step 2: Enter Valid Registration Data
1. Enter username in username field: `testuser_${timestamp}`
2. Enter email in email field: `testuser_${timestamp}@example.com`
3. Enter password in password field: `TestPass123`
4. Enter password confirmation in confirmation field: `TestPass123`

**Expected Result:** All fields are populated with valid data, no validation errors displayed

### Step 3: Submit Registration Form
1. Click "Register" or "Submit" button
2. Wait for registration request to complete (maximum 1 second as per performance requirements)

**Expected Result:** Registration request is sent to server

### Step 4: Verify Successful Registration
1. Verify user is automatically logged in (session token is created)
2. Verify user is redirected to Home Screen
3. Verify Home Screen displays:
   - Header with application title/logo
   - User information displayed in header (username or email)
   - Logout button visible in header
   - "Start Project" button visible
   - Project list area (may be empty)

**Expected Result:** User is successfully registered, logged in, and redirected to Home Screen

### Step 5: Verify User Account in Database
1. Query test database for newly created user record
2. Verify user record exists with:
   - Username matches entered username
   - Email matches entered email
   - Password is hashed (not plain text)
   - Password hash is bcrypt hash with 12 salt rounds
   - Created_at timestamp is set
   - User is active/enabled

**Expected Result:** User account is created in database with correct data and secure password storage

## Test Data Requirements

### Input Data
- **Username:** `testuser_${timestamp}` (unique, alphanumeric, minimum 3 characters)
- **Email:** `testuser_${timestamp}@example.com` (valid email format, unique)
- **Password:** `TestPass123` (minimum 8 characters, contains letters and numbers)
- **Password Confirmation:** `TestPass123` (matches password)

### Database State
- No existing user with test username
- No existing user with test email
- Database connection is available
- User table is accessible

## Expected Outcomes

### UI Outcomes
- Registration form is displayed correctly
- No validation errors during form entry
- Successful registration redirects to Home Screen
- Home Screen displays correctly with user information
- User is authenticated (session active)

### API Outcomes
- Registration endpoint returns HTTP 201 (Created) or HTTP 200 (OK)
- Response includes user information or session token
- No error messages in response

### Database Outcomes
- New user record is created in users table
- Username is unique and stored correctly
- Email is unique and stored correctly
- Password is hashed using bcrypt (12 salt rounds)
- Password is not stored in plain text
- Created_at timestamp is set to current time
- User account is active/enabled

### Performance Outcomes
- Registration completes within 1 second (as per performance requirements)
- Page load time is acceptable (< 2 seconds)

## Cleanup Steps
1. Delete test user account from database using test username or email
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)
4. Verify test user is removed from database

## Notes
- Timestamp should be generated to ensure unique usernames and emails across test runs
- Password must meet minimum requirements: 8 characters, letters and numbers
- User should be automatically logged in after successful registration (no separate login required)
- Session token should be stored and used for subsequent authenticated requests
