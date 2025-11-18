# User Registration Validation Tests

## Test ID: UT-01
## Test Name: User Registration Validation

## Description and Purpose
Test the validation logic for user registration, including username uniqueness, email format validation, password requirements, and password confirmation matching. These tests ensure that only valid user data can be registered.

## Function/Component Being Tested
- `validateRegistrationInput()` function
- `checkUsernameUniqueness()` function
- `validateEmailFormat()` function
- `validatePasswordRequirements()` function
- `validatePasswordMatch()` function
- Registration service/controller

## Test Setup
- Mock database connection and query methods
- Mock user repository methods (findByUsername, findByEmail)
- Test data: sample usernames, emails, passwords

## Test Cases

### Test Case 1: Valid Registration Data
**Type**: Positive Test

**Description**: Verify that valid registration data passes all validation checks.

**Input Data**:
- Username: "john_doe"
- Email: "john.doe@example.com"
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- All validations pass
- No errors thrown
- Returns validation result: `{ valid: true, errors: [] }`

**Assertions**:
- Username uniqueness check passes
- Email format validation passes
- Email uniqueness check passes
- Password requirements validation passes
- Password match validation passes

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return `null` (username not exists)
- Mock `userRepository.findByEmail()` to return `null` (email not exists)

**Test Isolation Requirements**:
- No shared state
- Fresh mocks for each test

---

### Test Case 2: Username Already Exists
**Type**: Negative Test

**Description**: Verify that registration fails when username is already taken.

**Input Data**:
- Username: "existing_user"
- Email: "new@example.com"
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- Validation fails
- Error message: "Username already taken. Please choose another."
- Returns validation result: `{ valid: false, errors: ["Username already taken. Please choose another."] }`

**Assertions**:
- `userRepository.findByUsername()` is called with "existing_user"
- Validation returns `valid: false`
- Error message matches specification

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return existing user object
- Mock `userRepository.findByEmail()` to return `null`

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Email Already Exists
**Type**: Negative Test

**Description**: Verify that registration fails when email is already registered.

**Input Data**:
- Username: "new_user"
- Email: "existing@example.com"
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- Validation fails
- Error message: "Email address already registered."
- Returns validation result: `{ valid: false, errors: ["Email address already registered."] }`

**Assertions**:
- `userRepository.findByEmail()` is called with "existing@example.com"
- Validation returns `valid: false`
- Error message matches specification

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return `null`
- Mock `userRepository.findByEmail()` to return existing user object

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Invalid Email Format
**Type**: Negative Test

**Description**: Verify that registration fails when email format is invalid.

**Input Data**:
- Username: "test_user"
- Email: "invalid-email-format"
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- Validation fails
- Error message: "Invalid email format."
- Returns validation result: `{ valid: false, errors: ["Invalid email format."] }`

**Assertions**:
- Email format validation fails
- Validation returns `valid: false`
- Error message indicates invalid email format

**Mock Requirements**:
- No database mocks needed (validation fails before database check)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Password Too Short
**Type**: Negative Test

**Description**: Verify that registration fails when password is less than 8 characters.

**Input Data**:
- Username: "test_user"
- Email: "test@example.com"
- Password: "Short1"
- Password Confirmation: "Short1"

**Expected Output**:
- Validation fails
- Error message: "Password must be at least 8 characters and contain letters and numbers."
- Returns validation result: `{ valid: false, errors: ["Password must be at least 8 characters and contain letters and numbers."] }`

**Assertions**:
- Password length validation fails
- Validation returns `valid: false`
- Error message matches specification

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Password Missing Numbers
**Type**: Negative Test

**Description**: Verify that registration fails when password contains only letters.

**Input Data**:
- Username: "test_user"
- Email: "test@example.com"
- Password: "OnlyLetters"
- Password Confirmation: "OnlyLetters"

**Expected Output**:
- Validation fails
- Error message: "Password must be at least 8 characters and contain letters and numbers."
- Returns validation result: `{ valid: false, errors: ["Password must be at least 8 characters and contain letters and numbers."] }`

**Assertions**:
- Password complexity validation fails (no numbers)
- Validation returns `valid: false`
- Error message matches specification

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Password Missing Letters
**Type**: Negative Test

**Description**: Verify that registration fails when password contains only numbers.

**Input Data**:
- Username: "test_user"
- Email: "test@example.com"
- Password: "12345678"
- Password Confirmation: "12345678"

**Expected Output**:
- Validation fails
- Error message: "Password must be at least 8 characters and contain letters and numbers."
- Returns validation result: `{ valid: false, errors: ["Password must be at least 8 characters and contain letters and numbers."] }`

**Assertions**:
- Password complexity validation fails (no letters)
- Validation returns `valid: false`
- Error message matches specification

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Passwords Do Not Match
**Type**: Negative Test

**Description**: Verify that registration fails when password and password confirmation do not match.

**Input Data**:
- Username: "test_user"
- Email: "test@example.com"
- Password: "SecurePass123"
- Password Confirmation: "DifferentPass123"

**Expected Output**:
- Validation fails
- Error message: "Passwords do not match."
- Returns validation result: `{ valid: false, errors: ["Passwords do not match."] }`

**Assertions**:
- Password match validation fails
- Validation returns `valid: false`
- Error message matches specification

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return `null`
- Mock `userRepository.findByEmail()` to return `null`

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Empty Username
**Type**: Negative Test (Boundary)

**Description**: Verify that registration fails when username is empty.

**Input Data**:
- Username: ""
- Email: "test@example.com"
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- Validation fails
- Error message: "Username is required."
- Returns validation result: `{ valid: false, errors: ["Username is required."] }`

**Assertions**:
- Username required validation fails
- Validation returns `valid: false`

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Empty Email
**Type**: Negative Test (Boundary)

**Description**: Verify that registration fails when email is empty.

**Input Data**:
- Username: "test_user"
- Email: ""
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- Validation fails
- Error message: "Email is required."
- Returns validation result: `{ valid: false, errors: ["Email is required."] }`

**Assertions**:
- Email required validation fails
- Validation returns `valid: false`

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Multiple Validation Errors
**Type**: Negative Test

**Description**: Verify that all validation errors are collected and returned together.

**Input Data**:
- Username: ""
- Email: "invalid-email"
- Password: "short"
- Password Confirmation: "different"

**Expected Output**:
- Validation fails
- Multiple error messages returned
- Returns validation result: `{ valid: false, errors: ["Username is required.", "Invalid email format.", "Password must be at least 8 characters and contain letters and numbers.", "Passwords do not match."] }`

**Assertions**:
- All validation errors are collected
- Error messages match specifications
- Validation returns `valid: false`

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Username with Special Characters
**Type**: Positive Test (Edge Case)

**Description**: Verify that usernames with allowed special characters (underscores) are accepted.

**Input Data**:
- Username: "user_name_123"
- Email: "test@example.com"
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- All validations pass
- Returns validation result: `{ valid: true, errors: [] }`

**Assertions**:
- Username with underscores is accepted
- All validations pass

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return `null`
- Mock `userRepository.findByEmail()` to return `null`

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Very Long Username
**Type**: Negative Test (Boundary)

**Description**: Verify that usernames exceeding maximum length (255 characters) are rejected.

**Input Data**:
- Username: "a".repeat(256) (256 characters)
- Email: "test@example.com"
- Password: "SecurePass123"
- Password Confirmation: "SecurePass123"

**Expected Output**:
- Validation fails
- Error message: "Username must not exceed 255 characters."
- Returns validation result: `{ valid: false, errors: ["Username must not exceed 255 characters."] }`

**Assertions**:
- Username length validation fails
- Validation returns `valid: false`

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 14: Email with Multiple Valid Formats
**Type**: Positive Test

**Description**: Verify that various valid email formats are accepted.

**Input Data**:
- Test multiple email formats:
  - "user@example.com"
  - "user.name@example.com"
  - "user+tag@example.co.uk"
  - "user123@example-domain.com"

**Expected Output**:
- All valid email formats pass validation
- Returns validation result: `{ valid: true, errors: [] }` for each

**Assertions**:
- Email format validation accepts standard email formats
- All validations pass for each email format

**Mock Requirements**:
- Mock `userRepository.findByUsername()` to return `null`
- Mock `userRepository.findByEmail()` to return `null` for each test

**Test Isolation Requirements**:
- No shared state
- Separate test for each email format
