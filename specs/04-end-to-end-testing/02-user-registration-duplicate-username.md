# Test 02: User Registration - Duplicate Username

## Test ID
E2E-UC1-NEG-001

## Test Name
User Registration - Duplicate Username Error

## Description
This test verifies that the system correctly prevents registration when a user attempts to register with a username that already exists in the system. The system should display an appropriate error message and not create a duplicate user account.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Existing user with username `existinguser` exists in the database
- Browser is open and navigated to the Login Screen

## Test Steps

### Step 1: Navigate to Registration
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed
3. Click on "Register" link/button
4. Verify registration form is displayed

**Expected Result:** Registration form is displayed

### Step 2: Enter Registration Data with Duplicate Username
1. Enter existing username in username field: `existinguser`
2. Enter unique email in email field: `newuser_${timestamp}@example.com`
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
3. Verify error message is displayed with exact text: "Username already taken. Please choose another."
4. Verify error message is displayed in appropriate location (below form or inline with username field)
5. Verify error message is styled appropriately (red text, visible)

**Expected Result:** Error message is displayed, user remains on registration form

### Step 5: Verify No Duplicate User Created
1. Query test database for user records with username `existinguser`
2. Verify only one user record exists with this username
3. Verify the existing user record is unchanged (email, password hash, timestamps)

**Expected Result:** No duplicate user account is created, existing user remains unchanged

### Step 6: Verify User Not Logged In
1. Verify no session token is created
2. Verify user is not authenticated
3. Verify user cannot access authenticated pages (if attempted)

**Expected Result:** User is not logged in, no session created

## Test Data Requirements

### Input Data
- **Username:** `existinguser` (must exist in database before test)
- **Email:** `newuser_${timestamp}@example.com` (unique, valid format)
- **Password:** `TestPass123` (valid password)
- **Password Confirmation:** `TestPass123` (matches password)

### Database State
- User with username `existinguser` exists in database
- Existing user has email: `existinguser@example.com`
- Existing user has password hash stored
- Database connection is available

## Expected Outcomes

### UI Outcomes
- Registration form remains displayed
- Error message "Username already taken. Please choose another." is displayed
- Error message is visible and clearly styled
- User is not redirected to Home Screen
- Form fields may retain entered values (except password fields should be cleared for security)

### API Outcomes
- Registration endpoint returns HTTP 409 (Conflict) or HTTP 400 (Bad Request)
- Response includes error message: "Username already taken. Please choose another."
- No user account is created

### Database Outcomes
- No new user record is created
- Existing user record with username `existinguser` remains unchanged
- Database integrity is maintained (no duplicate usernames)

### Performance Outcomes
- Error response is returned within 1 second
- Error message is displayed immediately after form submission

## Cleanup Steps
1. Verify existing user `existinguser` remains in database (should not be deleted)
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)

## Notes
- This test requires pre-existing user data in the database
- Error message must match exact specification from functional requirements
- System should validate username uniqueness before attempting to create user
- Password fields should be cleared after error for security reasons
- User should be able to correct username and retry registration
