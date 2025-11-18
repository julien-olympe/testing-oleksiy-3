# Checkup Status Update Validation Tests

## Test ID: UT-11
## Test Name: Checkup Status Update Validation

## Description and Purpose
Test checkup status update validation, including enum value validation (bad/average/good), project status validation, and checkup ownership verification.

## Function/Component Being Tested
- `updateCheckupStatus()` function
- `validateCheckupStatus()` function
- `validateProjectStatus()` function (for checkup updates)
- Checkup status service/controller

## Test Setup
- Mock database connection and query methods
- Mock project repository methods
- Mock checkup repository methods
- Mock checkupStatus repository methods
- Test data: sample projects, checkups, statuses

## Test Cases

### Test Case 1: Valid Status Update - Bad
**Type**: Positive Test

**Description**: Verify that checkup status can be set to "bad".

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "bad"
- Project Status: "in_progress"

**Expected Output**:
- Status update succeeds
- CheckupStatus record is updated
- Returns: `{ success: true }`

**Assertions**:
- Status validation passes ("bad" is valid)
- Project status check passes (in_progress)
- Checkup ownership verification passes
- Status update is performed

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with "in_progress" status
- Mock `checkupRepository.findById()` to return checkup
- Mock `checkupStatusRepository.update()` to return success

**Test Isolation Requirements**:
- No shared state
- Fresh test data for each test

---

### Test Case 2: Valid Status Update - Average
**Type**: Positive Test

**Description**: Verify that checkup status can be set to "average".

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "average"
- Project Status: "in_progress"

**Expected Output**:
- Status update succeeds
- Returns: `{ success: true }`

**Assertions**:
- Status validation passes ("average" is valid)
- Status update is performed

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project
- Mock `checkupStatusRepository.update()` to return success

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Valid Status Update - Good
**Type**: Positive Test

**Description**: Verify that checkup status can be set to "good".

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"
- Project Status: "in_progress"

**Expected Output**:
- Status update succeeds
- Returns: `{ success: true }`

**Assertions**:
- Status validation passes ("good" is valid)
- Status update is performed

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project
- Mock `checkupStatusRepository.update()` to return success

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Invalid Status Value
**Type**: Negative Test

**Description**: Verify that invalid status values are rejected.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "invalid_status"
- Project Status: "in_progress"

**Expected Output**:
- Status validation fails
- Error message: "Invalid checkup status. Must be 'bad', 'average', or 'good'."
- Returns: `{ success: false, error: "Invalid checkup status. Must be 'bad', 'average', or 'good'." }`

**Assertions**:
- Status enum validation fails
- Invalid status is rejected
- Error message indicates valid values

**Mock Requirements**:
- No database mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Status Update - Finished Project
**Type**: Negative Test

**Description**: Verify that checkup status updates are prevented for Finished projects.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"
- Project Status: "finished"

**Expected Output**:
- Project status check fails
- Error message: "Cannot modify checkups in a finished project."
- Returns: `{ success: false, error: "Cannot modify checkups in a finished project." }`

**Assertions**:
- Project status is checked before update
- Finished project check fails
- Status update is not performed
- Error message matches specification

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with "finished" status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Status Update - Checkup Ownership Verification
**Type**: Positive Test

**Description**: Verify that checkup belongs to project's powerplant before update.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"
- Checkup belongs to project's powerplant

**Expected Output**:
- Checkup ownership verification passes
- Status update succeeds
- Returns: `{ success: true }`

**Assertions**:
- Checkup ownership is verified
- Checkup belongs to project's powerplant
- Status update proceeds

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project
- Mock `checkupRepository.findById()` to return checkup
- Verify checkup belongs to project's powerplant

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Status Update - Checkup Not Belongs to Powerplant
**Type**: Negative Test

**Description**: Verify that checkup status update fails when checkup doesn't belong to project's powerplant.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"
- Checkup belongs to different powerplant

**Expected Output**:
- Checkup ownership verification fails
- Error message: "Checkup does not belong to this project's powerplant."
- Returns: `{ success: false, error: "Checkup does not belong to this project's powerplant." }`

**Assertions**:
- Checkup ownership verification fails
- Status update is not performed
- Error message is appropriate

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project
- Mock `checkupRepository.findById()` to return checkup from different powerplant

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Status Update - Non-Existent Checkup
**Type**: Negative Test

**Description**: Verify that status update fails when checkup does not exist.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "non-existent-checkup-id"
- Status: "good"

**Expected Output**:
- Checkup lookup fails
- Error message: "Checkup not found."
- Returns: `{ success: false, error: "Checkup not found." }`

**Assertions**:
- `checkupRepository.findById()` is called
- Checkup is not found
- Status update is not performed

**Mock Requirements**:
- Mock `checkupRepository.findById()` to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Status Update - Timestamp Update
**Type**: Positive Test

**Description**: Verify that status update sets updated_at timestamp.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"

**Expected Output**:
- CheckupStatus updated_at timestamp is set to current time
- Returns: `{ success: true }`

**Assertions**:
- `checkupStatusRepository.update()` is called with updated_at timestamp
- Timestamp is current time

**Mock Requirements**:
- Mock `checkupStatusRepository.update()` and verify timestamp
- Mock time for consistent timestamp checks

**Test Isolation Requirements**:
- No shared state
- Mock time for timestamp validation

---

### Test Case 10: Status Update - Null Status (Unset)
**Type**: Positive Test (if allowed)

**Description**: Verify that status can be set to null to unset it (if business rule allows).

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: null

**Expected Output**:
- Status update succeeds (if null is allowed)
- CheckupStatus status is set to null
- Returns: `{ success: true }`

**Assertions**:
- Null status is accepted (if business rule allows)
- Status is updated to null

**Mock Requirements**:
- Mock `checkupStatusRepository.update()` to handle null status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Status Update - Case Sensitivity
**Type**: Negative Test

**Description**: Verify that status values are case-sensitive or normalized.

**Input Data**:
- Status: "BAD" or "Bad" (different case)

**Expected Output**:
- Status validation either normalizes case or rejects invalid case
- Returns appropriate result

**Assertions**:
- Status case handling is consistent
- Either normalized to lowercase or rejected

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Status Update - Database Error
**Type**: Error Handling Test

**Description**: Verify that database errors during status update are handled.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"
- Database update fails

**Expected Output**:
- Database error is caught
- Error message: "Unable to save status. Please try again."
- Returns: `{ success: false, error: "Unable to save status. Please try again." }`

**Assertions**:
- Database error is caught
- Error is handled gracefully
- Error message matches specification

**Mock Requirements**:
- Mock `checkupStatusRepository.update()` to throw database error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Status Update - Concurrent Updates
**Type**: Edge Case Test

**Description**: Verify that concurrent status updates are handled correctly.

**Input Data**:
- Multiple concurrent status update requests for same checkup

**Expected Output**:
- Updates are processed correctly
- Last update wins or conflict is handled appropriately
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
