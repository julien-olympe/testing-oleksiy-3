# Project Ownership Verification Tests

## Test ID: UT-07
## Test Name: Project Ownership Verification

## Description and Purpose
Test the project ownership verification logic. Verify that users can only access projects they own, and that ownership checks are performed on all project-related operations.

## Function/Component Being Tested
- `verifyProjectOwnership()` function
- `checkUserAccess()` function
- Project access control middleware/service
- Authorization checks in project operations

## Test Setup
- Mock database connection and query methods
- Mock project repository methods (findById, findByUserId)
- Test data: sample users, projects with different owners

## Test Cases

### Test Case 1: Valid Project Ownership
**Type**: Positive Test

**Description**: Verify that ownership verification succeeds when user owns the project.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project user_id: "550e8400-e29b-41d4-a716-446655440000" (matches)

**Expected Output**:
- Project is found
- Ownership verification succeeds
- Returns: `{ authorized: true, project: projectObject }`

**Assertions**:
- `projectRepository.findById()` is called with project ID
- Project is retrieved
- Project user_id matches requesting user ID
- Ownership verification passes
- Access is granted

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with matching user_id

**Test Isolation Requirements**:
- No shared state
- Fresh test data for each test

---

### Test Case 2: Invalid Project Ownership
**Type**: Negative Test

**Description**: Verify that ownership verification fails when user does not own the project.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project user_id: "990e8400-e29b-41d4-a716-446655440004" (different user)

**Expected Output**:
- Project is found
- Ownership verification fails
- Error message: "You do not have permission to view this project."
- Returns: `{ authorized: false, error: "You do not have permission to view this project." }`

**Assertions**:
- `projectRepository.findById()` is called
- Project is retrieved
- Project user_id does not match requesting user ID
- Ownership verification fails
- Access is denied with appropriate error message

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with different user_id

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Project Not Found
**Type**: Negative Test

**Description**: Verify that ownership verification handles non-existent projects.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "non-existent-project-id"

**Expected Output**:
- Project is not found
- Error message: "Project not found."
- Returns: `{ authorized: false, error: "Project not found." }`

**Assertions**:
- `projectRepository.findById()` is called
- Project is not found (returns null)
- Ownership verification fails with not found error
- Access is denied

**Mock Requirements**:
- Mock `projectRepository.findById()` to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Ownership Check in Project Retrieval
**Type**: Positive Test

**Description**: Verify that project retrieval includes ownership verification.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project belongs to user

**Expected Output**:
- Ownership is verified before project retrieval
- Project is returned if ownership is valid
- Returns: `{ project: projectObject }`

**Assertions**:
- Ownership verification is performed first
- Project is retrieved only if ownership is valid
- Project data is returned

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with matching user_id
- Verify ownership check is called before project retrieval

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Ownership Check in Project Update
**Type**: Positive Test

**Description**: Verify that project updates require ownership verification.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Update data: { status: "finished" }
- Project belongs to user

**Expected Output**:
- Ownership is verified before update
- Project is updated if ownership is valid
- Returns: `{ success: true, project: updatedProject }`

**Assertions**:
- Ownership verification is performed first
- Project update is performed only if ownership is valid
- Update succeeds

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with matching user_id
- Mock `projectRepository.update()` to return updated project
- Verify ownership check is called before update

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Ownership Check in Project Update - Unauthorized
**Type**: Negative Test

**Description**: Verify that project updates fail when user does not own the project.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Update data: { status: "finished" }
- Project belongs to different user

**Expected Output**:
- Ownership verification fails
- Project update is not performed
- Error message: "You do not have permission to modify this project."
- Returns: `{ success: false, error: "You do not have permission to modify this project." }`

**Assertions**:
- Ownership verification fails
- Project update is not attempted
- Error message matches specification

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with different user_id

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Ownership Check in Checkup Status Update
**Type**: Positive Test

**Description**: Verify that checkup status updates require project ownership verification.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"
- Project belongs to user

**Expected Output**:
- Project ownership is verified
- Checkup status is updated
- Returns: `{ success: true }`

**Assertions**:
- Project ownership verification is performed
- Checkup status update proceeds if ownership is valid
- Update succeeds

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with matching user_id
- Mock `checkupStatusRepository.update()` to return success
- Verify ownership check is called

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Ownership Check in Documentation Access
**Type**: Positive Test

**Description**: Verify that documentation access requires project ownership verification.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Documentation ID: "bb0e8400-e29b-41d4-a716-446655440006"
- Project belongs to user

**Expected Output**:
- Project ownership is verified
- Documentation is retrieved
- Returns: `{ documentation: documentationObject }`

**Assertions**:
- Project ownership verification is performed
- Documentation retrieval proceeds if ownership is valid
- Documentation is returned

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with matching user_id
- Mock `documentationRepository.findById()` to return documentation
- Verify ownership check is called

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Ownership Check - Empty User ID
**Type**: Negative Test (Boundary)

**Description**: Verify that ownership verification fails when user ID is empty or null.

**Input Data**:
- User ID: null or ""
- Project ID: "880e8400-e29b-41d4-a716-446655440003"

**Expected Output**:
- Ownership verification fails
- Error message: "User ID is required."
- Returns: `{ authorized: false, error: "User ID is required." }`

**Assertions**:
- User ID validation fails
- Ownership check is not performed
- Error message indicates missing user ID

**Mock Requirements**:
- No database mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Ownership Check - Empty Project ID
**Type**: Negative Test (Boundary)

**Description**: Verify that ownership verification fails when project ID is empty or null.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: null or ""

**Expected Output**:
- Ownership verification fails
- Error message: "Project ID is required."
- Returns: `{ authorized: false, error: "Project ID is required." }`

**Assertions**:
- Project ID validation fails
- Ownership check is not performed
- Error message indicates missing project ID

**Mock Requirements**:
- No database mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Ownership Check - Database Error
**Type**: Error Handling Test

**Description**: Verify that database errors during ownership verification are handled.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Database query fails

**Expected Output**:
- Database error is caught
- Error message: "Internal server error. Please try again later."
- Returns: `{ authorized: false, error: "Internal server error. Please try again later." }`

**Assertions**:
- Database error is caught
- Error is handled gracefully
- Generic error message is returned

**Mock Requirements**:
- Mock `projectRepository.findById()` to throw database error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Ownership Check Performance
**Type**: Performance Test

**Description**: Verify that ownership verification completes within acceptable time.

**Input Data**:
- User ID and Project ID for ownership check

**Expected Output**:
- Ownership verification completes quickly
- Response time < 100ms (per database query performance requirement)

**Assertions**:
- Ownership check completes within time limit
- Database query is optimized (indexed user_id column)

**Mock Requirements**:
- Mock `projectRepository.findById()` with timing verification
- Verify query performance

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Ownership Check in Project List
**Type**: Positive Test

**Description**: Verify that project list only returns projects owned by the user.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Database has projects for multiple users

**Expected Output**:
- Only projects with matching user_id are retrieved
- Returns: `{ projects: [project1, project2, ...] }` (all belong to user)

**Assertions**:
- `projectRepository.findByUserId()` is called with user ID
- Only user's projects are returned
- No other users' projects are included

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return only user's projects

**Test Isolation Requirements**:
- No shared state

---

### Test Case 14: Ownership Check Logging
**Type**: Security Test

**Description**: Verify that unauthorized access attempts are logged (if logging is implemented).

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project belongs to different user

**Expected Output**:
- Ownership verification fails
- Unauthorized access attempt is logged
- Error message is returned

**Assertions**:
- Unauthorized access is logged (if logging service exists)
- Log includes user ID, project ID, and timestamp
- Security event is recorded

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project with different user_id
- Mock logging service to verify logging call

**Test Isolation Requirements**:
- No shared state
