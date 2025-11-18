# Password Hashing Tests

## Test ID: UT-02
## Test Name: Password Hashing

## Description and Purpose
Test the password hashing functionality using bcrypt with salt rounds of 12. Verify that passwords are hashed correctly and that password comparison works as expected.

## Function/Component Being Tested
- `hashPassword()` function
- `comparePassword()` function
- Password hashing service
- bcrypt integration

## Test Setup
- Mock bcrypt module using `jest.mock('bcrypt')`
- Mock `bcrypt.hash()` and `bcrypt.compare()` functions
- Test data: sample passwords

## Test Cases

### Test Case 1: Password Hashing with Correct Salt Rounds
**Type**: Positive Test

**Description**: Verify that password hashing is called with salt rounds of 12.

**Input Data**:
- Password: "SecurePass123"

**Expected Output**:
- bcrypt.hash() is called with password and salt rounds of 12
- Returns hashed password string

**Assertions**:
- `bcrypt.hash()` is called with `("SecurePass123", 12)`
- Returns a hashed password string (mock return value)
- Hash is not equal to original password

**Mock Requirements**:
- Mock `bcrypt.hash()` to return a hashed password string
- Verify bcrypt.hash is called with salt rounds = 12

**Test Isolation Requirements**:
- No shared state
- Fresh bcrypt mock for each test

---

### Test Case 2: Password Hash Generation
**Type**: Positive Test

**Description**: Verify that password hashing generates a different hash each time (due to salt).

**Input Data**:
- Password: "SecurePass123"

**Expected Output**:
- Two calls to hashPassword() with the same password produce different hashes (due to salt)
- Both hashes are valid bcrypt hashes

**Assertions**:
- First hash is not equal to second hash
- Both hashes are strings
- Both hashes start with bcrypt identifier (mock verification)

**Mock Requirements**:
- Mock `bcrypt.hash()` to return different hash values on each call
- Verify that bcrypt.hash is called multiple times

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Password Comparison - Correct Password
**Type**: Positive Test

**Description**: Verify that password comparison returns true when password matches hash.

**Input Data**:
- Plain password: "SecurePass123"
- Hashed password: "$2b$12$hashedpasswordstring"

**Expected Output**:
- bcrypt.compare() is called with plain password and hash
- Returns true

**Assertions**:
- `bcrypt.compare()` is called with `("SecurePass123", "$2b$12$hashedpasswordstring")`
- Returns true
- Password comparison succeeds

**Mock Requirements**:
- Mock `bcrypt.compare()` to return `true`
- Verify bcrypt.compare is called with correct parameters

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Password Comparison - Incorrect Password
**Type**: Negative Test

**Description**: Verify that password comparison returns false when password does not match hash.

**Input Data**:
- Plain password: "WrongPassword"
- Hashed password: "$2b$12$hashedpasswordstring" (for "SecurePass123")

**Expected Output**:
- bcrypt.compare() is called with plain password and hash
- Returns false

**Assertions**:
- `bcrypt.compare()` is called with `("WrongPassword", "$2b$12$hashedpasswordstring")`
- Returns false
- Password comparison fails

**Mock Requirements**:
- Mock `bcrypt.compare()` to return `false`
- Verify bcrypt.compare is called with correct parameters

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Password Hashing Error Handling
**Type**: Error Handling Test

**Description**: Verify that password hashing errors are properly handled.

**Input Data**:
- Password: "SecurePass123"

**Expected Output**:
- Error is thrown or caught
- Error message indicates hashing failure

**Assertions**:
- When bcrypt.hash() throws an error, the error is properly handled
- Error is either re-thrown or logged appropriately

**Mock Requirements**:
- Mock `bcrypt.hash()` to throw an error
- Verify error handling

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Password Comparison Error Handling
**Type**: Error Handling Test

**Description**: Verify that password comparison errors are properly handled.

**Input Data**:
- Plain password: "SecurePass123"
- Hashed password: "$2b$12$invalidhash"

**Expected Output**:
- Error is thrown or caught when hash is invalid
- Error message indicates comparison failure

**Assertions**:
- When bcrypt.compare() throws an error, the error is properly handled
- Error is either re-thrown or logged appropriately

**Mock Requirements**:
- Mock `bcrypt.compare()` to throw an error
- Verify error handling

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Empty Password Hashing
**Type**: Boundary Test

**Description**: Verify that empty password is handled (should be rejected by validation, but test hashing logic).

**Input Data**:
- Password: ""

**Expected Output**:
- Either validation rejects empty password before hashing, or hashing handles empty string
- If hashing is called, bcrypt.hash() is called with empty string

**Assertions**:
- Empty password is either rejected by validation or handled by hashing
- If hashing occurs, bcrypt.hash() is called with empty string

**Mock Requirements**:
- Mock `bcrypt.hash()` to handle empty string (or validation prevents this)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Very Long Password Hashing
**Type**: Boundary Test

**Description**: Verify that very long passwords can be hashed (up to reasonable limits).

**Input Data**:
- Password: "A".repeat(1000) (1000 character password)

**Expected Output**:
- bcrypt.hash() is called with long password
- Returns hashed password string

**Assertions**:
- `bcrypt.hash()` is called with long password
- Returns a hashed password string
- No errors thrown

**Mock Requirements**:
- Mock `bcrypt.hash()` to return a hashed password string
- Verify bcrypt.hash handles long passwords

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Password Hash Storage Format
**Type**: Positive Test

**Description**: Verify that hashed password is in correct format for storage.

**Input Data**:
- Password: "SecurePass123"

**Expected Output**:
- Hashed password is a string
- Hashed password is suitable for database storage (VARCHAR(255))

**Assertions**:
- Hashed password is a string
- Hashed password length is within database column limits
- Hash format is valid (starts with bcrypt identifier in real implementation)

**Mock Requirements**:
- Mock `bcrypt.hash()` to return a valid hash format string

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Salt Rounds Configuration
**Type**: Configuration Test

**Description**: Verify that salt rounds are configured to 12 as per specification.

**Input Data**:
- Password: "SecurePass123"

**Expected Output**:
- bcrypt.hash() is always called with salt rounds = 12
- Salt rounds value is not hardcoded but configurable (if applicable)

**Assertions**:
- `bcrypt.hash()` is called with salt rounds = 12
- Salt rounds value matches specification requirement

**Mock Requirements**:
- Mock `bcrypt.hash()` and verify it's called with salt rounds = 12
- Verify salt rounds configuration

**Test Isolation Requirements**:
- No shared state
