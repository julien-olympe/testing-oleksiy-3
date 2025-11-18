# Test 03: User Registration - Duplicate Email

## Test ID
E2E-UC1-NEG-002

## Test Name
User Registration - Duplicate Email Error

## Description
This test verifies that the system correctly prevents registration when a user attempts to register with an email address that already exists in the system. The system should display an appropriate error message and not create a duplicate user account.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Existing user with email `existing@example.com` exists in the database
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Registration
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed
3. Click on "Register" link/button
4. Verify registration form is displayed

**Expected Result:** Registration form is displayed

### Step 2: Enter Registration Data with Duplicate Email
1. Enter unique username in username field: `newuser_${timestamp}`
2. Enter existing email in email field: `existing@example.com`
3. Enter password in password field: `TestPass123`
4. Enter password confirmation in confirmation field: `TestPass123`

**Expected Result:** All fields are populated, no validation errors displayed yet

### Step 3: Submit Registration Form
1. Click "Register" or "Submit" button
2. Wait for registration request to complete

**Expected Result:** Registration request is sent to server

### Step 4: Verify Error Message Displayed
1. Verify user is NOT redirected to Home Screen
2. Verify registration form remains displayed
3. Verify error message is displayed with exact text: "Email address already registered."
4. Verify error message is displayed in appropriate location (below form or inline with email field)
5. Verify error message is styled appropriately (red text, visible)

**Expected Result:** Error message is displayed, user remains on registration form

### Step 5: Verify No Duplicate User Created
1. Query test database for user records with email `existing@example.com`
2. Verify only one user record exists with this email
3. Verify the existing user record is unchanged (username, password hash, timestamps)

**Expected Result:** No duplicate user account is created, existing user remains unchanged

### Step 6: Verify User Not Logged In
1. Verify no session token is created
2. Verify user is not authenticated
3. Verify user cannot access authenticated pages (if attempted)

**Expected Result:** User is not logged in, no session created

## Test Data Requirements

### Input Data
- **Username:** `newuser_${timestamp}` (unique, not existing in database)
- **Email:** `existing@example.com` (must exist in database before test)
- **Password:** `TestPass123` (valid password)
- **Password Confirmation:** `TestPass123` (matches password)

### Database State
- User with email `existing@example.com` exists in database
- Existing user has username: `existinguser`
- Existing user has password hash stored
- Database connection is available

## Expected Outcomes

### UI Outcomes
- Registration form remains displayed
- Error message "Email address already registered." is displayed
- Error message is visible and clearly styled
- User is not redirected to Home Screen
- Form fields may retain entered values (except password fields should be cleared for security)

### API Outcomes
- Registration endpoint returns HTTP 409 (Conflict) or HTTP 400 (Bad Request)
- Response includes error message: "Email address already registered."
- No user account is created

### Database Outcomes
- No new user record is created
- Existing user record with email `existing@example.com` remains unchanged
- Database integrity is maintained (no duplicate emails)

### Performance Outcomes
- Error response is returned within 1 second
- Error message is displayed immediately after form submission

## Cleanup Steps
1. Verify existing user with email `existing@example.com` remains in database (should not be deleted)
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)

## Notes
- This test requires pre-existing user data in the database
- Error message must match exact specification from functional requirements
- System should validate email uniqueness before attempting to create user
- Password fields should be cleared after error for security reasons
- User should be able to correct email and retry registration
