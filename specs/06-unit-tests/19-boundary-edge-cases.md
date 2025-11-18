# Boundary and Edge Case Tests

## Test ID: UT-19
## Test Name: Boundary and Edge Case Tests

## Description and Purpose
Test boundary conditions and edge cases including empty lists, maximum values, special characters, concurrent operations, and null/undefined handling.

## Function/Component Being Tested
- All components with boundary conditions
- Edge case handling throughout the application

## Test Setup
- Mock various edge case scenarios
- Test data: boundary values, empty data, special characters

## Test Cases

### Test Case 1: Empty Project List
**Type**: Edge Case Test

**Description**: Verify that empty project list is handled correctly.

**Input Data**:
- User ID with no projects

**Expected Output**:
- Empty array is returned
- No errors thrown
- Empty state message can be displayed: "You have no assigned projects. Click 'Start Project' to create one."

**Assertions**:
- Empty project list is handled
- No errors occur
- Appropriate empty state can be shown

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return empty array

**Test Isolation Requirements**:
- No shared state

---

### Test Case 2: Project with No Checkups
**Type**: Edge Case Test

**Description**: Verify that project with no checkups is handled.

**Input Data**:
- Project ID for powerplant with no checkups

**Expected Output**:
- Project data is retrieved
- Empty checkups array is returned
- No errors thrown

**Assertions**:
- Empty checkups are handled
- Project data structure is correct
- No errors occur

**Mock Requirements**:
- Mock repositories to return project with no checkups

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Project with All Checkups Unset
**Type**: Edge Case Test

**Description**: Verify that project with all checkup statuses unset (null) is handled.

**Input Data**:
- Project ID with all checkup statuses = null

**Expected Output**:
- All checkup statuses are null
- Project data is retrieved correctly
- Null statuses are displayed appropriately

**Assertions**:
- Null checkup statuses are handled
- No errors occur
- Null values are preserved

**Mock Requirements**:
- Mock `checkupStatusRepository.findByProjectId()` to return statuses with all null values

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Maximum File Size - 10 MB
**Type**: Boundary Test

**Description**: Verify that files at maximum size (10 MB) are accepted.

**Input Data**:
- File: 10 MB (exactly)
- File type: "image/jpeg"

**Expected Output**:
- File size validation passes
- File upload succeeds
- Returns: `{ valid: true }`

**Assertions**:
- Maximum file size boundary is handled correctly
- Files at limit are accepted

**Mock Requirements**:
- Mock file object with size = 10 MB

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Maximum Files Per Part - 20 Files
**Type**: Boundary Test

**Description**: Verify that maximum files per part (20) is enforced.

**Input Data**:
- Part ID with 20 files already uploaded
- Attempting to upload 21st file

**Expected Output**:
- File count validation fails
- Error message: "Maximum 20 files allowed per part."
- Returns: `{ success: false, error: "Maximum 20 files allowed per part." }`

**Assertions**:
- Maximum file count boundary is enforced
- 21st file is rejected

**Mock Requirements**:
- Mock `documentationRepository.countByPartId()` to return 20

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Maximum Project Storage - 500 MB
**Type**: Boundary Test

**Description**: Verify that maximum project storage (500 MB) is enforced.

**Input Data**:
- Project ID with 500 MB of files already stored
- Attempting to upload additional file

**Expected Output**:
- Storage limit validation fails
- Error message: "Storage limit reached. Please contact administrator."
- Returns: `{ success: false, error: "Storage limit reached. Please contact administrator." }`

**Assertions**:
- Maximum storage boundary is enforced
- Files exceeding limit are rejected

**Mock Requirements**:
- Mock `documentationRepository.getTotalSizeByProjectId()` to return 500 MB

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Very Long Strings - Name Fields
**Type**: Boundary Test

**Description**: Verify that very long strings in name fields are handled.

**Input Data**:
- Username: 255 characters (maximum VARCHAR length)
- Powerplant name: 255 characters

**Expected Output**:
- Long strings are accepted if within limit
- Strings exceeding limit are rejected
- Database constraints are enforced

**Assertions**:
- Maximum string length boundaries are handled
- Database constraints prevent overflow

**Mock Requirements**:
- Mock data with maximum length strings
- Verify length validation

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Special Characters in Filenames
**Type**: Edge Case Test

**Description**: Verify that special characters in filenames are handled.

**Input Data**:
- File name: "file with spaces & special-chars!@#.jpg"
- File type: "image/jpeg"
- File size: 1 MB

**Expected Output**:
- Filename is sanitized
- Special characters are removed or escaped
- File upload succeeds with sanitized name

**Assertions**:
- Special characters are handled
- Filename sanitization works
- File upload succeeds

**Mock Requirements**:
- Mock file object with special characters in name

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Concurrent Status Updates
**Type**: Edge Case Test

**Description**: Verify that concurrent checkup status updates are handled.

**Input Data**:
- Multiple simultaneous status update requests for same checkup

**Expected Output**:
- Updates are processed correctly
- Last update wins or conflict is handled
- No data corruption

**Assertions**:
- Concurrent updates are handled
- No race conditions
- Data integrity is maintained

**Mock Requirements**:
- Mock repository to handle concurrent updates
- Verify conflict handling

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Invalid UUID Formats
**Type**: Boundary Test

**Description**: Verify that various invalid UUID formats are rejected.

**Input Data**:
- Invalid UUIDs: "not-a-uuid", "123", "550e8400-e29b", "550e8400-e29b-41d4-a716-446655440000-extra"

**Expected Output**:
- All invalid UUID formats are rejected
- Error message: "Invalid UUID format."
- Returns: `{ valid: false, error: "Invalid UUID format." }`

**Assertions**:
- Various invalid UUID formats are rejected
- UUID validation is strict

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Null/Undefined Value Handling
**Type**: Edge Case Test

**Description**: Verify that null and undefined values are handled throughout the application.

**Input Data**:
- Various null/undefined values in different contexts

**Expected Output**:
- Null/undefined values are handled appropriately
- Either rejected with validation error or handled gracefully
- No null pointer exceptions

**Assertions**:
- Null/undefined handling is consistent
- No crashes from null values
- Appropriate validation or default values

**Mock Requirements**:
- Mock various scenarios with null/undefined values

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Maximum PDF Size - 50 MB
**Type**: Boundary Test

**Description**: Verify that maximum PDF size (50 MB) is enforced.

**Input Data**:
- Generated PDF size: 50 MB (exactly)

**Expected Output**:
- PDF size validation passes
- PDF generation succeeds
- Returns: `{ success: true }`

**Assertions**:
- Maximum PDF size boundary is handled
- PDFs at limit are accepted

**Mock Requirements**:
- Mock PDF generation to return 50 MB buffer

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Empty String Handling
**Type**: Boundary Test

**Description**: Verify that empty strings are handled correctly.

**Input Data**:
- Empty strings in various fields: username, email, password, etc.

**Expected Output**:
- Empty strings are either rejected with validation error or handled as empty values
- Appropriate validation messages

**Assertions**:
- Empty string handling is consistent
- Validation errors are clear

**Mock Requirements**:
- No mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 14: Very Large Project Data
**Type**: Boundary Test

**Description**: Verify that very large projects are handled.

**Input Data**:
- Project with: 100 parts, 500 checkups, 200 documentation files

**Expected Output**:
- All data is processed correctly
- Performance is acceptable
- No data loss

**Assertions**:
- Large projects are handled
- All data is included
- Performance meets requirements

**Mock Requirements**:
- Mock repositories to return large dataset

**Test Isolation Requirements**:
- No shared state

---

### Test Case 15: Unicode and International Characters
**Type**: Edge Case Test

**Description**: Verify that Unicode and international characters are handled.

**Input Data**:
- Usernames, filenames, descriptions with Unicode characters: "用户", "фото", "صورة"

**Expected Output**:
- Unicode characters are handled correctly
- No encoding errors
- Data is stored and retrieved correctly

**Assertions**:
- Unicode characters are supported
- Encoding is handled correctly
- No data corruption

**Mock Requirements**:
- Mock data with Unicode characters

**Test Isolation Requirements**:
- No shared state
