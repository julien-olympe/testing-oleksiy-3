# Checkup Status Persistence and Retrieval Tests

## Test ID: UT-12
## Test Name: Checkup Status Persistence and Retrieval

## Description and Purpose
Test checkup status persistence (saving to database) and retrieval functionality, including status updates, status queries, and data integrity.

## Function/Component Being Tested
- `saveCheckupStatus()` function
- `getCheckupStatus()` function
- `getCheckupStatusesByProject()` function
- CheckupStatus repository methods

## Test Setup
- Mock database connection and query methods
- Mock checkupStatus repository methods
- Test data: sample checkup statuses

## Test Cases

### Test Case 1: Save Checkup Status
**Type**: Positive Test

**Description**: Verify that checkup status is saved to database correctly.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: "good"

**Expected Output**:
- CheckupStatus record is saved to database
- Record contains: project_id, checkup_id, status, created_at, updated_at
- Returns: `{ success: true, checkupStatus: savedRecord }`

**Assertions**:
- `checkupStatusRepository.create()` or `update()` is called
- All required fields are saved
- Status value is persisted correctly
- Timestamps are set

**Mock Requirements**:
- Mock `checkupStatusRepository.create()` or `update()` to return saved record

**Test Isolation Requirements**:
- No shared state

---

### Test Case 2: Retrieve Checkup Status
**Type**: Positive Test

**Description**: Verify that checkup status can be retrieved by project and checkup ID.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"

**Expected Output**:
- CheckupStatus record is retrieved
- Returns: `{ checkupStatus: { projectId, checkupId, status, createdAt, updatedAt } }`

**Assertions**:
- `checkupStatusRepository.findByProjectAndCheckup()` is called
- CheckupStatus record is returned
- All fields are present

**Mock Requirements**:
- Mock `checkupStatusRepository.findByProjectAndCheckup()` to return checkup status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Retrieve All Checkup Statuses for Project
**Type**: Positive Test

**Description**: Verify that all checkup statuses for a project can be retrieved.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project has 10 checkup statuses

**Expected Output**:
- All 10 checkup statuses are retrieved
- Returns: `{ checkupStatuses: [status1, status2, ..., status10] }`

**Assertions**:
- `checkupStatusRepository.findByProjectId()` is called
- All checkup statuses are returned
- Response time < 500ms

**Mock Requirements**:
- Mock `checkupStatusRepository.findByProjectId()` to return array of statuses

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Retrieve Checkup Status - Not Found
**Type**: Negative Test

**Description**: Verify that non-existent checkup status returns null or error.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "non-existent-checkup-id"

**Expected Output**:
- CheckupStatus is not found
- Returns: `{ checkupStatus: null }` or `{ success: false, error: "Checkup status not found." }`

**Assertions**:
- `checkupStatusRepository.findByProjectAndCheckup()` is called
- Returns null or appropriate error

**Mock Requirements**:
- Mock `checkupStatusRepository.findByProjectAndCheckup()` to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Update Existing Checkup Status
**Type**: Positive Test

**Description**: Verify that existing checkup status can be updated.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Existing Status: "bad"
- New Status: "good"

**Expected Output**:
- CheckupStatus is updated
- Status changes from "bad" to "good"
- updated_at timestamp is updated
- Returns: `{ success: true, checkupStatus: updatedRecord }`

**Assertions**:
- `checkupStatusRepository.update()` is called
- Status is updated
- updated_at is set to current time
- created_at remains unchanged

**Mock Requirements**:
- Mock `checkupStatusRepository.update()` to return updated record
- Mock time for timestamp validation

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Persist Null Status
**Type**: Positive Test

**Description**: Verify that null status (unset) can be persisted.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Checkup ID: "aa0e8400-e29b-41d4-a716-446655440005"
- Status: null

**Expected Output**:
- CheckupStatus is saved with null status
- Returns: `{ success: true, checkupStatus: { status: null } }`

**Assertions**:
- Null status is persisted correctly
- Database accepts null value
- Status field is null in database

**Mock Requirements**:
- Mock `checkupStatusRepository.create()` or `update()` to handle null status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Retrieve Statuses with Null Values
**Type**: Positive Test

**Description**: Verify that checkup statuses with null status are retrieved correctly.

**Input Data**:
- Project ID with checkup statuses including null values

**Expected Output**:
- All statuses are retrieved including null ones
- Null statuses are preserved in response
- Returns: `{ checkupStatuses: [{ status: "good" }, { status: null }, ...] }`

**Assertions**:
- Null statuses are included in results
- Null values are not converted or filtered
- Data integrity is maintained

**Mock Requirements**:
- Mock `checkupStatusRepository.findByProjectId()` to return statuses with null values

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Persistence - Database Error
**Type**: Error Handling Test

**Description**: Verify that database errors during persistence are handled.

**Input Data**:
- Project ID, Checkup ID, Status
- Database save fails

**Expected Output**:
- Database error is caught
- Error message: "Unable to save status. Please try again."
- Returns: `{ success: false, error: "Unable to save status. Please try again." }`

**Assertions**:
- Database error is caught
- Error is handled gracefully
- Error message matches specification

**Mock Requirements**:
- Mock `checkupStatusRepository.create()` or `update()` to throw database error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Persistence - Unique Constraint Violation
**Type**: Error Handling Test

**Description**: Verify that unique constraint violations (duplicate project_id + checkup_id) are handled.

**Input Data**:
- Attempting to create duplicate checkup status (same project_id + checkup_id)

**Expected Output**:
- Constraint violation error is caught
- Error message: "Checkup status already exists for this project."
- Returns: `{ success: false, error: "Checkup status already exists for this project." }`

**Assertions**:
- Unique constraint violation is detected
- Error is handled appropriately
- Error message is clear

**Mock Requirements**:
- Mock `checkupStatusRepository.create()` to throw unique constraint error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Retrieval Performance
**Type**: Performance Test

**Description**: Verify that checkup status retrieval is performant.

**Input Data**:
- Project ID with 100 checkup statuses

**Expected Output**:
- All statuses are retrieved
- Response time < 500ms

**Assertions**:
- Query performance is acceptable
- Database indexes are used (project_id, checkup_id)
- Response time meets specification

**Mock Requirements**:
- Mock repository with performance verification

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Persistence - Transaction Rollback
**Type**: Positive Test

**Description**: Verify that status persistence uses transactions and rollback on error.

**Input Data**:
- Multiple checkup status updates
- One update fails

**Expected Output**:
- Transaction is rolled back
- No partial updates are persisted
- Error is returned

**Assertions**:
- Transaction is used for atomicity
- Rollback occurs on error
- Data integrity is maintained

**Mock Requirements**:
- Mock database transaction methods
- Verify rollback behavior

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Retrieval - Foreign Key Validation
**Type**: Positive Test

**Description**: Verify that retrieved checkup statuses have valid foreign key references.

**Input Data**:
- Project ID for retrieval

**Expected Output**:
- All retrieved statuses have valid project_id and checkup_id
- Foreign key relationships are maintained

**Assertions**:
- project_id references valid project
- checkup_id references valid checkup
- Foreign key integrity is maintained

**Mock Requirements**:
- Mock repository to return statuses with valid foreign keys

**Test Isolation Requirements**:
- No shared state
