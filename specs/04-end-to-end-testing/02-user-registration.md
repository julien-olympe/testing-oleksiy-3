# Use Case 1: User Registration - E2E Test Scenarios

## Test Overview

**Test Name:** User Registration - Complete Test Suite

**Description:** Comprehensive end-to-end tests for user registration functionality covering positive cases, negative cases, edge cases, and boundary conditions.

**Related Use Case:** Use Case 1: User Registration

**Related Screen:** Screen 2: Registration Screen

## Test Data Requirements

**Valid Test Data:**
- Username: `test_user_$(timestamp)` (e.g., `test_user_1704067200`)
- Email: `test_$(timestamp)@example.com` (e.g., `test_1704067200@example.com`)
- Password: `ValidPass123!`
- Password Confirmation: `ValidPass123!`

**Invalid Test Data Sets:**
- Duplicate username (use existing username from database)
- Duplicate email (use existing email from database)
- Invalid email formats (various formats)
- Short passwords (< 8 characters)
- Mismatched passwords
- Empty fields
- Special characters in username (if restricted)

## Test Scenarios

### TC-001: User Registration - Success

**Description:** Verify successful user registration with valid data.

**Prerequisites:**
- Application is running
- Registration screen is accessible
- No existing user with test credentials exists

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed with all form fields

2. Fill registration form with valid data
   - **Action:** Enter:
     - Username: `test_user_$(timestamp)`
     - Email: `test_$(timestamp)@example.com`
     - Password: `ValidPass123!`
     - Password Confirmation: `ValidPass123!`
   - **Expected Result:** All fields accept input, no validation errors

3. Submit registration
   - **Action:** Click "Register" button
   - **Expected Result:**
     - Form submits successfully
     - User is redirected to login screen
     - Success message is displayed: "Registration successful. Please login."

**Assertions:**
- User record is created in database with correct username and email
- Password is hashed using bcrypt (not stored in plain text)
- Password hash is not empty
- `created_at` timestamp is set
- `updated_at` timestamp is set
- User can be queried by username
- User can be queried by email
- Response time < 1 second

**Cleanup:**
- Delete test user from database (if using test database)

---

### TC-002: User Registration - Duplicate Username

**Description:** Verify registration fails when username already exists.

**Prerequisites:**
- Application is running
- User with username `existing_user` already exists in database

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Fill registration form with duplicate username
   - **Action:** Enter:
     - Username: `existing_user`
     - Email: `new_email_$(timestamp)@example.com`
     - Password: `ValidPass123!`
     - Password Confirmation: `ValidPass123!`
   - **Expected Result:** Form accepts input

3. Submit registration
   - **Action:** Click "Register" button
   - **Expected Result:**
     - Form submission is prevented or fails
     - Error message is displayed: "Username already exists"
     - User remains on registration screen
     - Form fields retain entered values (except password fields may be cleared)

**Assertions:**
- No new user record is created
- Existing user record is unchanged
- Error message is displayed correctly
- User is not redirected to login screen
- Response time < 1 second

---

### TC-003: User Registration - Duplicate Email

**Description:** Verify registration fails when email already exists.

**Prerequisites:**
- Application is running
- User with email `existing@example.com` already exists in database

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Fill registration form with duplicate email
   - **Action:** Enter:
     - Username: `new_user_$(timestamp)`
     - Email: `existing@example.com`
     - Password: `ValidPass123!`
     - Password Confirmation: `ValidPass123!`
   - **Expected Result:** Form accepts input

3. Submit registration
   - **Action:** Click "Register" button
   - **Expected Result:**
     - Form submission is prevented or fails
     - Error message is displayed: "Email already exists"
     - User remains on registration screen
     - Form fields retain entered values (except password fields may be cleared)

**Assertions:**
- No new user record is created
- Existing user record is unchanged
- Error message is displayed correctly
- User is not redirected to login screen
- Response time < 1 second

---

### TC-004: User Registration - Invalid Email Format

**Description:** Verify registration fails for invalid email formats.

**Prerequisites:**
- Application is running
- Registration screen is accessible

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Test invalid email formats
   - **Action:** For each invalid email format, enter:
     - Username: `test_user_$(timestamp)`
     - Email: [Invalid format from list below]
     - Password: `ValidPass123!`
     - Password Confirmation: `ValidPass123!`
   - Invalid email formats to test:
     - `invalid-email` (no @ symbol)
     - `invalid@` (no domain)
     - `@example.com` (no local part)
     - `invalid..email@example.com` (double dots)
     - `invalid@example` (no TLD)
     - `invalid email@example.com` (spaces)
   - **Expected Result:** For each invalid format:
     - Form may show validation error immediately or on submit
     - Error message indicates invalid email format
     - Registration is prevented

3. Submit registration
   - **Action:** Click "Register" button (if form allows)
   - **Expected Result:**
     - Form submission is prevented or fails
     - Error message is displayed: "Invalid email format"
     - User remains on registration screen

**Assertions:**
- No user record is created for any invalid email format
- Error message is displayed correctly
- User is not redirected to login screen
- Response time < 1 second

---

### TC-005: User Registration - Password Too Short

**Description:** Verify registration fails when password is less than 8 characters.

**Prerequisites:**
- Application is running
- Registration screen is accessible

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Fill registration form with short password
   - **Action:** Enter:
     - Username: `test_user_$(timestamp)`
     - Email: `test_$(timestamp)@example.com`
     - Password: `Short1!` (7 characters)
     - Password Confirmation: `Short1!`
   - **Expected Result:** Form accepts input (validation may occur on submit)

3. Submit registration
   - **Action:** Click "Register" button
   - **Expected Result:**
     - Form submission is prevented or fails
     - Error message is displayed: "Password too short (minimum 8 characters)"
     - User remains on registration screen
     - Password fields may be cleared

**Assertions:**
- No user record is created
- Error message is displayed correctly
- User is not redirected to login screen
- Response time < 1 second

**Additional Test Cases:**
- Test with password length 1-7 characters
- Test with password length exactly 8 characters (should succeed)
- Test with password length 9+ characters (should succeed)

---

### TC-006: User Registration - Passwords Do Not Match

**Description:** Verify registration fails when password and confirmation do not match.

**Prerequisites:**
- Application is running
- Registration screen is accessible

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Fill registration form with mismatched passwords
   - **Action:** Enter:
     - Username: `test_user_$(timestamp)`
     - Email: `test_$(timestamp)@example.com`
     - Password: `ValidPass123!`
     - Password Confirmation: `DifferentPass123!`
   - **Expected Result:** 
     - Form accepts input
     - Real-time validation may show error immediately (if implemented)
     - Error indicator may appear on password confirmation field

3. Submit registration
   - **Action:** Click "Register" button
   - **Expected Result:**
     - Form submission is prevented or fails
     - Error message is displayed: "Passwords do not match"
     - User remains on registration screen
     - Password fields may be cleared

**Assertions:**
- No user record is created
- Error message is displayed correctly
- User is not redirected to login screen
- Response time < 1 second

---

### TC-007: User Registration - Empty Fields

**Description:** Verify registration fails when required fields are empty.

**Prerequisites:**
- Application is running
- Registration screen is accessible

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Test empty username
   - **Action:** Leave username empty, fill other fields, click "Register"
   - **Expected Result:**
     - Form submission is prevented
     - Error message indicates username is required
     - User remains on registration screen

3. Test empty email
   - **Action:** Fill username, leave email empty, fill other fields, click "Register"
   - **Expected Result:**
     - Form submission is prevented
     - Error message indicates email is required
     - User remains on registration screen

4. Test empty password
   - **Action:** Fill username and email, leave password empty, fill confirmation, click "Register"
   - **Expected Result:**
     - Form submission is prevented
     - Error message indicates password is required
     - User remains on registration screen

5. Test empty password confirmation
   - **Action:** Fill all fields except password confirmation, click "Register"
   - **Expected Result:**
     - Form submission is prevented
     - Error message indicates password confirmation is required
     - User remains on registration screen

6. Test all fields empty
   - **Action:** Leave all fields empty, click "Register"
   - **Expected Result:**
     - Form submission is prevented
     - Error messages indicate all required fields
     - User remains on registration screen

**Assertions:**
- No user record is created for any empty field scenario
- Appropriate error messages are displayed
- User is not redirected to login screen
- Response time < 1 second

---

### TC-008: User Registration - Username Minimum Length

**Description:** Verify registration enforces minimum username length (3 characters).

**Prerequisites:**
- Application is running
- Registration screen is accessible

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Test username with 2 characters
   - **Action:** Enter:
     - Username: `ab` (2 characters)
     - Email: `test_$(timestamp)@example.com`
     - Password: `ValidPass123!`
     - Password Confirmation: `ValidPass123!`
   - **Expected Result:**
     - Form may show validation error
     - Error message indicates minimum length requirement

3. Submit registration
   - **Action:** Click "Register" button
   - **Expected Result:**
     - Form submission is prevented or fails
     - Error message: "Username must be at least 3 characters"
     - User remains on registration screen

4. Test username with exactly 3 characters
   - **Action:** Enter username: `abc` (3 characters), fill other fields correctly
   - **Expected Result:** Registration succeeds (if 3 is the minimum)

**Assertions:**
- Username with < 3 characters is rejected
- Username with exactly 3 characters is accepted (if minimum is 3)
- Appropriate error messages are displayed
- Response time < 1 second

---

### TC-009: User Registration - Database Error Handling

**Description:** Verify graceful handling of database errors during registration.

**Prerequisites:**
- Application is running
- Database connection can be interrupted (test environment)

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Simulate database error
   - **Action:** 
     - Fill form with valid data
     - Interrupt database connection (if possible in test environment)
     - Click "Register" button
   - **Expected Result:**
     - Form submission fails gracefully
     - Generic error message is displayed: "Unable to create account. Please try again."
     - User remains on registration screen
     - No sensitive error information is exposed

**Assertions:**
- No user record is created
- Error message is user-friendly (no technical details)
- No stack traces or database errors are exposed to user
- User is not redirected to login screen
- Response time < 5 seconds (timeout handling)

---

### TC-010: User Registration - Special Characters in Username

**Description:** Verify username validation for special characters (if restrictions apply).

**Prerequisites:**
- Application is running
- Registration screen is accessible
- Username validation rules are known (alphanumeric and underscore only per specs)

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Test username with invalid special characters
   - **Action:** For each invalid character, enter:
     - Username: `test-user@name` (contains hyphen and @)
     - Email: `test_$(timestamp)@example.com`
     - Password: `ValidPass123!`
     - Password Confirmation: `ValidPass123!`
   - Invalid characters to test (if restricted):
     - Spaces: `test user`
     - Special symbols: `test@user`, `test#user`, `test$user`
     - Only alphanumeric and underscore should be allowed
   - **Expected Result:**
     - Form may show validation error immediately
     - Error message indicates invalid characters

3. Submit registration
   - **Action:** Click "Register" button
   - **Expected Result:**
     - Form submission is prevented or fails
     - Error message: "Username can only contain letters, numbers, and underscores"
     - User remains on registration screen

**Assertions:**
- Username with invalid characters is rejected
- Username with only alphanumeric and underscore is accepted
- Appropriate error messages are displayed
- Response time < 1 second

---

### TC-011: User Registration - Password Maximum Length

**Description:** Verify password maximum length handling (128 characters per specs).

**Prerequisites:**
- Application is running
- Registration screen is accessible

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Test password with 128 characters
   - **Action:** Enter:
     - Username: `test_user_$(timestamp)`
     - Email: `test_$(timestamp)@example.com`
     - Password: [Generate 128 character password]
     - Password Confirmation: [Same 128 character password]
   - **Expected Result:** Registration succeeds

3. Test password with 129+ characters (if limit enforced)
   - **Action:** Enter password with 129 characters
   - **Expected Result:**
     - Form may truncate or reject
     - Error message may indicate maximum length

**Assertions:**
- Password with 128 characters is accepted
- Password behavior with 129+ characters is as specified
- Response time < 1 second

---

### TC-012: User Registration - Navigation to Login

**Description:** Verify navigation from registration screen to login screen.

**Prerequisites:**
- Application is running
- Registration screen is accessible

**Test Steps:**

1. Navigate to registration screen
   - **Action:** Open application and click "Register" link
   - **Expected Result:** Registration screen is displayed

2. Navigate back to login
   - **Action:** Click "Back to Login" link
   - **Expected Result:**
     - User is redirected to login screen
     - Login form is displayed
     - No data is lost (if user was filling form, it may be cleared)

**Assertions:**
- Navigation works correctly
- Login screen is displayed
- Response time < 500ms

---

## Performance Requirements

- Registration screen load: < 1 second
- Form submission: < 1 second
- Error message display: < 500ms
- Database query for duplicate check: < 100ms

## Security Requirements

- Passwords must be hashed using bcrypt (never stored in plain text)
- Password hashing uses salt rounds: 10
- No sensitive information in error messages
- Input validation prevents SQL injection
- XSS prevention in error messages

## Cleanup

After test execution:
- Delete all test users created during testing (if using test database)
- Verify database state is clean
- Remove any test data files
