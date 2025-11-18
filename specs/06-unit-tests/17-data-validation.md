# Data Validation Tests

## Test ID: UT-17
## Test Name: Data Validation

## Description and Purpose
Test data validation functions including UUID validation, enum value validation, timestamp validation, foreign key relationship validation, and database constraint validation.

## Function/Component Being Tested
- `validateUUID()` function
- `validateEnum()` function
- `validateTimestamp()` function
- `validateForeignKey()` function
- `validateConstraints()` function
- Validation utility functions

## Test Setup
- Mock database for foreign key validation
- Test data: sample UUIDs, enum values, timestamps

## Test Cases

### Test Case 1: UUID Validation - Valid UUID
**Type**: Positive Test

**Description**: Verify that valid UUID format is accepted.

**Input Data**:
- UUID: "550e8400-e29b-41d4-a716-446655440000"

**Expected Output**:
- UUID validation passes
- Returns: `{ valid: true }`

**Assertions**:
- Valid UUID format is accepted
- UUID matches pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 2: UUID Validation - Invalid Format
**Type**: Negative Test

**Description**: Verify that invalid UUID format is rejected.

**Input Data**:
- UUID: "invalid-uuid-format"

**Expected Output**:
- UUID validation fails
- Error message: "Invalid UUID format."
- Returns: `{ valid: false, error: "Invalid UUID format." }`

**Assertions**:
- Invalid UUID format is rejected
- Error message is clear

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: UUID Validation - Empty String
**Type**: Negative Test (Boundary)

**Description**: Verify that empty string is rejected as UUID.

**Input Data**:
- UUID: ""

**Expected Output**:
- UUID validation fails
- Returns: `{ valid: false, error: "UUID is required." }`

**Assertions**:
- Empty string is rejected
- Error message indicates UUID is required

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Enum Validation - Valid Enum Value
**Type**: Positive Test

**Description**: Verify that valid enum value is accepted.

**Input Data**:
- Enum value: "in_progress"
- Allowed values: ["in_progress", "finished"]

**Expected Output**:
- Enum validation passes
- Returns: `{ valid: true }`

**Assertions**:
- Valid enum value is accepted
- Value matches one of allowed values

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Enum Validation - Invalid Enum Value
**Type**: Negative Test

**Description**: Verify that invalid enum value is rejected.

**Input Data**:
- Enum value: "invalid_status"
- Allowed values: ["in_progress", "finished"]

**Expected Output**:
- Enum validation fails
- Error message: "Invalid enum value. Must be one of: in_progress, finished."
- Returns: `{ valid: false, error: "Invalid enum value. Must be one of: in_progress, finished." }`

**Assertions**:
- Invalid enum value is rejected
- Error message lists allowed values

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Enum Validation - Checkup Status Enum
**Type**: Positive Test

**Description**: Verify that checkup status enum values are validated correctly.

**Input Data**:
- Enum value: "good"
- Allowed values: ["bad", "average", "good"]

**Expected Output**:
- Enum validation passes for all valid values: "bad", "average", "good"
- Returns: `{ valid: true }` for each

**Assertions**:
- All checkup status enum values are accepted
- Validation works for each value

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Timestamp Validation - Valid Timestamp
**Type**: Positive Test

**Description**: Verify that valid timestamp is accepted.

**Input Data**:
- Timestamp: "2024-01-15T10:30:00Z"

**Expected Output**:
- Timestamp validation passes
- Returns: `{ valid: true }`

**Assertions**:
- Valid timestamp format is accepted
- Timestamp can be parsed

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Timestamp Validation - Invalid Format
**Type**: Negative Test

**Description**: Verify that invalid timestamp format is rejected.

**Input Data**:
- Timestamp: "invalid-timestamp"

**Expected Output**:
- Timestamp validation fails
- Error message: "Invalid timestamp format."
- Returns: `{ valid: false, error: "Invalid timestamp format." }`

**Assertions**:
- Invalid timestamp format is rejected
- Error message is clear

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Foreign Key Validation - Valid Reference
**Type**: Positive Test

**Description**: Verify that valid foreign key reference is validated.

**Input Data**:
- Foreign key: "550e8400-e29b-41d4-a716-446655440000" (User ID)
- Referenced table: "users"
- Record exists

**Expected Output**:
- Foreign key validation passes
- Returns: `{ valid: true }`

**Assertions**:
- `repository.findById()` is called
- Referenced record exists
- Foreign key is valid

**Mock Requirements**:
- Mock repository to return existing record

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Foreign Key Validation - Invalid Reference
**Type**: Negative Test

**Description**: Verify that invalid foreign key reference is rejected.

**Input Data**:
- Foreign key: "non-existent-id"
- Referenced table: "users"
- Record does not exist

**Expected Output**:
- Foreign key validation fails
- Error message: "Referenced record not found."
- Returns: `{ valid: false, error: "Referenced record not found." }`

**Assertions**:
- `repository.findById()` is called
- Referenced record does not exist
- Foreign key is invalid

**Mock Requirements**:
- Mock repository to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Database Constraint Validation - Unique Constraint
**Type**: Positive Test

**Description**: Verify that unique constraint violations are detected.

**Input Data**:
- Attempting to create duplicate record (username already exists)

**Expected Output**:
- Unique constraint violation is detected
- Error message: "Username already exists."
- Returns: `{ valid: false, error: "Username already exists." }`

**Assertions**:
- Unique constraint is checked
- Duplicate is detected
- Error message is clear

**Mock Requirements**:
- Mock repository to throw unique constraint error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Database Constraint Validation - Foreign Key Constraint
**Type**: Positive Test

**Description**: Verify that foreign key constraint violations are detected.

**Input Data**:
- Attempting to create record with invalid foreign key

**Expected Output**:
- Foreign key constraint violation is detected
- Error message: "Referenced record does not exist."
- Returns: `{ valid: false, error: "Referenced record does not exist." }`

**Assertions**:
- Foreign key constraint is checked
- Violation is detected
- Error message is clear

**Mock Requirements**:
- Mock repository to throw foreign key constraint error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Data Validation - Multiple Validations
**Type**: Positive Test

**Description**: Verify that multiple validations can be applied together.

**Input Data**:
- UUID, enum value, timestamp, foreign key all need validation

**Expected Output**:
- All validations pass
- Returns: `{ valid: true }`

**Assertions**:
- All validations are performed
- All pass successfully

**Mock Requirements**:
- Mock foreign key validation repository

**Test Isolation Requirements**:
- No shared state

---

### Test Case 14: Data Validation - Multiple Validation Errors
**Type**: Negative Test

**Description**: Verify that multiple validation errors are collected.

**Input Data**:
- Invalid UUID, invalid enum, invalid foreign key

**Expected Output**:
- All validation errors are collected
- Returns: `{ valid: false, errors: ["Invalid UUID format.", "Invalid enum value.", "Referenced record not found."] }`

**Assertions**:
- All validation errors are collected
- Error messages are clear
- All failures are reported

**Mock Requirements**:
- Mock foreign key validation repository

**Test Isolation Requirements**:
- No shared state

---

### Test Case 15: UUID Validation - Null/Undefined
**Type**: Negative Test (Boundary)

**Description**: Verify that null or undefined UUID is rejected.

**Input Data**:
- UUID: null or undefined

**Expected Output**:
- UUID validation fails
- Error message: "UUID is required."
- Returns: `{ valid: false, error: "UUID is required." }`

**Assertions**:
- Null/undefined is rejected
- Error message indicates UUID is required

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state
