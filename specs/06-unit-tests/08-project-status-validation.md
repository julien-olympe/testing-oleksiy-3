# Project Status Validation Tests

## Test ID: UT-08
## Test Name: Project Status Validation

## Description and Purpose
Test project status validation logic, including status transitions (In Progress → Finished), preventing modifications to Finished projects, and status enum validation.

## Function/Component Being Tested
- `validateProjectStatus()` function
- `canModifyProject()` function
- `updateProjectStatus()` function
- Project status transition logic

## Test Setup
- Mock database connection and query methods
- Mock project repository methods
- Test data: sample projects with different statuses

## Test Cases

### Test Case 1: Valid Status Transition - In Progress to Finished
**Type**: Positive Test

**Description**: Verify that project status can be changed from "In Progress" to "Finished".

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Current Status: "in_progress"
- New Status: "finished"

**Expected Output**:
- Status transition is valid
- Project can be updated
- Returns: `{ valid: true, canUpdate: true }`

**Assertions**:
- Status transition validation passes
- "in_progress" → "finished" is allowed
- Project can be modified

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with "in_progress" status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 2: Invalid Status Transition - Finished to In Progress
**Type**: Negative Test

**Description**: Verify that project status cannot be changed from "Finished" back to "In Progress".

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Current Status: "finished"
- New Status: "in_progress"

**Expected Output**:
- Status transition is invalid
- Error message: "Cannot modify finished projects."
- Returns: `{ valid: false, error: "Cannot modify finished projects." }`

**Assertions**:
- Status transition validation fails
- "finished" → "in_progress" is not allowed
- Error message matches specification

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with "finished" status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Cannot Modify Finished Project
**Type**: Negative Test

**Description**: Verify that checkup status updates are prevented for Finished projects.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project Status: "finished"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- New Status: "good"

**Expected Output**:
- Project status check fails
- Error message: "Cannot modify checkups in a finished project."
- Checkup status update is prevented
- Returns: `{ success: false, error: "Cannot modify checkups in a finished project." }`

**Assertions**:
- Project status is checked before checkup update
- Finished project check fails
- Checkup update is not performed
- Error message matches specification

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with "finished" status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Can Modify In Progress Project
**Type**: Positive Test

**Description**: Verify that checkup status updates are allowed for In Progress projects.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project Status: "in_progress"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- New Status: "good"

**Expected Output**:
- Project status check passes
- Checkup status update proceeds
- Returns: `{ success: true }`

**Assertions**:
- Project status is checked
- In Progress project check passes
- Checkup update is allowed

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with "in_progress" status
- Mock `checkupStatusRepository.update()` to return success

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Invalid Status Value
**Type**: Negative Test

**Description**: Verify that invalid status values are rejected.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- New Status: "invalid_status"

**Expected Output**:
- Status validation fails
- Error message: "Invalid project status. Must be 'in_progress' or 'finished'."
- Returns: `{ valid: false, error: "Invalid project status. Must be 'in_progress' or 'finished'." }`

**Assertions**:
- Status enum validation fails
- Invalid status is rejected
- Error message indicates valid values

**Mock Requirements**:
- No database mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Status Enum Validation - In Progress
**Type**: Positive Test

**Description**: Verify that "in_progress" is a valid status value.

**Input Data**:
- Status: "in_progress"

**Expected Output**:
- Status validation passes
- Returns: `{ valid: true }`

**Assertions**:
- "in_progress" is recognized as valid enum value
- Validation passes

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Status Enum Validation - Finished
**Type**: Positive Test

**Description**: Verify that "finished" is a valid status value.

**Input Data**:
- Status: "finished"

**Expected Output**:
- Status validation passes
- Returns: `{ valid: true }`

**Assertions**:
- "finished" is recognized as valid enum value
- Validation passes

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Status Update with Timestamp
**Type**: Positive Test

**Description**: Verify that status update to "Finished" sets finished_at timestamp.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- New Status: "finished"

**Expected Output**:
- Project status is updated to "finished"
- finished_at timestamp is set to current time
- Returns: `{ success: true, project: updatedProject }`

**Assertions**:
- `projectRepository.update()` is called with status = "finished"
- finished_at timestamp is set
- Timestamp is current time

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project
- Mock `projectRepository.update()` to return updated project with finished_at
- Mock time for timestamp validation

**Test Isolation Requirements**:
- No shared state
- Mock time for consistent timestamps

---

### Test Case 9: Status Update - In Progress Does Not Set finished_at
**Type**: Positive Test

**Description**: Verify that status update to "In Progress" does not set finished_at.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- New Status: "in_progress"

**Expected Output**:
- Project status is updated to "in_progress"
- finished_at remains null
- Returns: `{ success: true, project: updatedProject }`

**Assertions**:
- `projectRepository.update()` is called with status = "in_progress"
- finished_at is not set (remains null)

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project
- Mock `projectRepository.update()` to return updated project
- Verify finished_at is not set

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Case Sensitivity in Status Values
**Type**: Negative Test

**Description**: Verify that status values are case-sensitive or normalized.

**Input Data**:
- Status: "IN_PROGRESS" or "In_Progress" (different case)

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

### Test Case 11: Null Status Handling
**Type**: Negative Test (Boundary)

**Description**: Verify that null status values are rejected.

**Input Data**:
- Status: null

**Expected Output**:
- Status validation fails
- Error message: "Project status is required."
- Returns: `{ valid: false, error: "Project status is required." }`

**Assertions**:
- Null status is rejected
- Error message indicates status is required

**Mock Requirements**:
- No database mocks needed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Status Validation in Project Creation
**Type**: Positive Test

**Description**: Verify that new projects are created with default status "In Progress".

**Input Data**:
- Project creation data

**Expected Output**:
- Project is created with status "in_progress"
- Status is set correctly

**Assertions**:
- New project has status "in_progress"
- Default status is applied

**Mock Requirements**:
- Mock `projectRepository.create()` and verify status = "in_progress"

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Status Check Before Documentation Upload
**Type**: Positive Test

**Description**: Verify that documentation upload is prevented for Finished projects.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project Status: "finished"
- File upload data

**Expected Output**:
- Project status check fails
- Error message: "Cannot modify checkups in a finished project." (or similar)
- File upload is prevented

**Assertions**:
- Project status is checked before upload
- Finished project check fails
- Upload is not performed

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with "finished" status

**Test Isolation Requirements**:
- No shared state
