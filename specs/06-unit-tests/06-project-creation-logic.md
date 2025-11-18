# Project Creation Logic Tests

## Test ID: UT-06
## Test Name: Project Creation Logic

## Description and Purpose
Test the project creation logic, including initialization of checkup statuses for all checkups in the selected powerplant. Verify that projects are created correctly with proper status initialization.

## Function/Component Being Tested
- `createProject()` function
- `initializeCheckupStatuses()` function
- Project service/controller
- CheckupStatus initialization logic

## Test Setup
- Mock database connection and query methods
- Mock project repository methods
- Mock checkup repository methods
- Mock checkupStatus repository methods
- Mock powerplant repository methods
- Test data: sample powerplants, parts, checkups

## Test Cases

### Test Case 1: Successful Project Creation
**Type**: Positive Test

**Description**: Verify that a new project is created successfully with all checkup statuses initialized.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"
- Powerplant has 3 parts, each with 2 checkups (total 6 checkups)

**Expected Output**:
- Project record is created with status "In Progress"
- 6 CheckupStatus records are created (one for each checkup)
- All CheckupStatus records have status set to null (unset)
- Project is assigned to user
- Returns: `{ projectId, userId, powerplantId, status: 'in_progress', createdAt }`

**Assertions**:
- `projectRepository.create()` is called with project data
- `checkupStatusRepository.createMany()` is called with 6 checkup status records
- Each CheckupStatus has project_id, checkup_id, and status = null
- Project status is "in_progress"
- Project has creation timestamp
- All checkup statuses are initialized

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to return powerplant with parts and checkups
- Mock `checkupRepository.findByPowerplantId()` to return all checkups for powerplant
- Mock `projectRepository.create()` to return created project
- Mock `checkupStatusRepository.createMany()` to return created checkup statuses

**Test Isolation Requirements**:
- No shared state
- Fresh test data for each test

---

### Test Case 2: Project Creation with No Checkups
**Type**: Edge Case Test

**Description**: Verify that project creation handles powerplant with no checkups.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"
- Powerplant has parts but no checkups

**Expected Output**:
- Project record is created
- No CheckupStatus records are created (empty array)
- Project creation succeeds

**Assertions**:
- `projectRepository.create()` is called
- `checkupStatusRepository.createMany()` is called with empty array or not called
- Project is created successfully
- No checkup statuses are initialized (none exist)

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to return powerplant
- Mock `checkupRepository.findByPowerplantId()` to return empty array
- Mock `projectRepository.create()` to return created project

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Project Creation - Invalid Powerplant
**Type**: Negative Test

**Description**: Verify that project creation fails when powerplant does not exist.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Powerplant ID: "non-existent-powerplant-id"

**Expected Output**:
- Powerplant lookup fails
- Error message: "Powerplant not found."
- Project creation fails
- Returns: `{ success: false, error: "Powerplant not found." }`

**Assertions**:
- `powerplantRepository.findById()` is called
- Powerplant is not found (returns null)
- Project creation is not attempted
- Error message matches specification

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Checkup Status Initialization
**Type**: Positive Test

**Description**: Verify that checkup statuses are initialized correctly for all checkups.

**Input Data**:
- Powerplant with multiple parts and checkups:
  - Part 1: Checkup A, Checkup B
  - Part 2: Checkup C, Checkup D
  - Part 3: Checkup E

**Expected Output**:
- 5 CheckupStatus records are created
- Each CheckupStatus has:
  - project_id: new project ID
  - checkup_id: corresponding checkup ID
  - status: null (unset)
  - created_at: timestamp
  - updated_at: timestamp

**Assertions**:
- `checkupStatusRepository.createMany()` is called with 5 records
- Each record has correct project_id
- Each record has correct checkup_id
- All statuses are null
- All timestamps are set

**Mock Requirements**:
- Mock `checkupRepository.findByPowerplantId()` to return 5 checkups
- Mock `checkupStatusRepository.createMany()` to return created records
- Verify all checkup statuses are created with null status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Project Creation - Database Transaction
**Type**: Positive Test

**Description**: Verify that project creation and checkup status initialization are atomic (transaction).

**Input Data**:
- User ID and Powerplant ID for project creation

**Expected Output**:
- Project and checkup statuses are created in a transaction
- If checkup status creation fails, project creation is rolled back

**Assertions**:
- Database transaction is started
- Project creation and checkup status creation are in same transaction
- Transaction is committed on success
- Transaction is rolled back on failure

**Mock Requirements**:
- Mock database transaction methods (begin, commit, rollback)
- Verify transaction is used for atomicity

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Project Creation - Checkup Status Creation Failure
**Type**: Error Handling Test

**Description**: Verify that project creation handles checkup status creation failures.

**Input Data**:
- User ID and Powerplant ID for project creation
- Checkup status creation will fail

**Expected Output**:
- Checkup status creation fails
- Transaction is rolled back
- Project creation is also rolled back
- Error message: "Unable to create project. Please try again."

**Assertions**:
- `checkupStatusRepository.createMany()` throws error
- Transaction is rolled back
- Project is not created
- Error is handled and appropriate message returned

**Mock Requirements**:
- Mock `checkupStatusRepository.createMany()` to throw database error
- Mock transaction rollback

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Project Creation - User Assignment
**Type**: Positive Test

**Description**: Verify that project is correctly assigned to the creating user.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"

**Expected Output**:
- Project is created with user_id matching the creating user
- Project ownership is set correctly

**Assertions**:
- `projectRepository.create()` is called with correct user_id
- Project user_id matches input user ID
- Project is assigned to correct user

**Mock Requirements**:
- Mock `projectRepository.create()` and verify user_id parameter
- Mock `powerplantRepository.findById()` to return powerplant

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Project Creation - Status Initialization
**Type**: Positive Test

**Description**: Verify that project status is initialized to "In Progress".

**Input Data**:
- User ID and Powerplant ID for project creation

**Expected Output**:
- Project is created with status "in_progress"
- Status matches specification default

**Assertions**:
- `projectRepository.create()` is called with status = "in_progress"
- Project status is set correctly
- Status is not null or undefined

**Mock Requirements**:
- Mock `projectRepository.create()` and verify status parameter
- Mock `powerplantRepository.findById()` to return powerplant

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Project Creation - Timestamp Initialization
**Type**: Positive Test

**Description**: Verify that project creation timestamp is set correctly.

**Input Data**:
- User ID and Powerplant ID for project creation

**Expected Output**:
- Project is created with created_at timestamp
- Timestamp is current time
- finished_at is null (project not finished)

**Assertions**:
- `projectRepository.create()` is called with created_at timestamp
- created_at is set to current time
- finished_at is null

**Mock Requirements**:
- Mock `projectRepository.create()` and verify timestamp
- Mock time for consistent timestamp checks

**Test Isolation Requirements**:
- No shared state
- Mock time for timestamp validation

---

### Test Case 10: Project Creation - Large Number of Checkups
**Type**: Boundary Test

**Description**: Verify that project creation handles powerplant with many checkups.

**Input Data**:
- User ID and Powerplant ID
- Powerplant has 100 checkups

**Expected Output**:
- Project is created successfully
- 100 CheckupStatus records are created
- All checkup statuses are initialized with null status

**Assertions**:
- `checkupStatusRepository.createMany()` is called with 100 records
- All 100 checkup statuses are created
- Performance is acceptable (within 2 seconds per specification)

**Mock Requirements**:
- Mock `checkupRepository.findByPowerplantId()` to return 100 checkups
- Mock `checkupStatusRepository.createMany()` to handle large batch

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Project Creation - Duplicate Project Prevention
**Type**: Negative Test (if constraint exists)

**Description**: Verify that duplicate projects are prevented (if business rule exists).

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"
- Project already exists for this user and powerplant

**Expected Output**:
- Project creation fails
- Error message: "Project already exists for this powerplant."
- Returns: `{ success: false, error: "Project already exists for this powerplant." }`

**Assertions**:
- Duplicate check is performed
- Project creation is prevented
- Error message is appropriate

**Mock Requirements**:
- Mock `projectRepository.findByUserAndPowerplant()` to return existing project
- Verify duplicate prevention logic

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Project Creation - Database Connection Error
**Type**: Error Handling Test

**Description**: Verify that database connection errors are handled during project creation.

**Input Data**:
- User ID and Powerplant ID for project creation

**Expected Output**:
- Database connection error is caught
- Error message: "Database error. Please contact support."
- Returns: `{ success: false, error: "Database error. Please contact support." }`

**Assertions**:
- Database connection error is caught
- Error is handled gracefully
- Generic error message is returned

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to throw connection error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Project Creation - Powerplant Parts Retrieval
**Type**: Positive Test

**Description**: Verify that all parts and checkups are retrieved correctly for powerplant.

**Input Data**:
- Powerplant ID with associated parts and checkups

**Expected Output**:
- All parts for powerplant are retrieved
- All checkups for each part are retrieved
- Checkup statuses are initialized for all checkups

**Assertions**:
- `partRepository.findByPowerplantId()` is called (if separate call)
- `checkupRepository.findByPowerplantId()` is called
- All checkups are included in status initialization

**Mock Requirements**:
- Mock `partRepository.findByPowerplantId()` to return parts
- Mock `checkupRepository.findByPowerplantId()` to return checkups

**Test Isolation Requirements**:
- No shared state
