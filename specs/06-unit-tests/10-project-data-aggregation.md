# Project Data Aggregation Tests

## Test ID: UT-10
## Test Name: Project Data Aggregation

## Description and Purpose
Test project data aggregation logic that combines project information with powerplant data, parts, checkups, statuses, and documentation for display or PDF generation.

## Function/Component Being Tested
- `aggregateProjectData()` function
- `getProjectDetails()` function
- Project data aggregation service

## Test Setup
- Mock database connection and query methods
- Mock project, powerplant, part, checkup, checkupStatus, documentation repositories
- Test data: complete project data structures

## Test Cases

### Test Case 1: Aggregate Complete Project Data
**Type**: Positive Test

**Description**: Verify that all project data is aggregated correctly including powerplant, parts, checkups, statuses, and documentation.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project has: 1 powerplant, 3 parts, 6 checkups, 6 checkup statuses, 5 documentation files

**Expected Output**:
- All project data is aggregated
- Returns: `{ project, powerplant, parts: [{ part, checkups: [{ checkup, status }], documentation }] }`

**Assertions**:
- Project data is retrieved
- Powerplant data is retrieved
- All parts are retrieved
- All checkups for each part are retrieved
- All checkup statuses are retrieved
- All documentation for each part is retrieved
- Data structure is properly nested

**Mock Requirements**:
- Mock `projectRepository.findById()` to return project
- Mock `powerplantRepository.findById()` to return powerplant
- Mock `partRepository.findByPowerplantId()` to return parts
- Mock `checkupRepository.findByPartId()` for each part
- Mock `checkupStatusRepository.findByProjectId()` to return statuses
- Mock `documentationRepository.findByProjectId()` to return documentation

**Test Isolation Requirements**:
- No shared state
- Fresh test data for each test

---

### Test Case 2: Aggregate Project Data - Empty Checkups
**Type**: Edge Case Test

**Description**: Verify that project data aggregation handles parts with no checkups.

**Input Data**:
- Project ID with part that has no checkups

**Expected Output**:
- Part is included in aggregation
- Part has empty checkups array
- Returns: `{ parts: [{ part, checkups: [] }] }`

**Assertions**:
- Part without checkups is handled
- Empty checkups array is returned
- No errors thrown

**Mock Requirements**:
- Mock repositories to return part with no checkups

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Aggregate Project Data - Unset Checkup Statuses
**Type**: Edge Case Test

**Description**: Verify that unset checkup statuses (null) are included in aggregation.

**Input Data**:
- Project ID with checkups that have null status

**Expected Output**:
- Checkup statuses with null are included
- Status field is null in aggregated data
- Returns: `{ checkups: [{ checkup, status: null }] }`

**Assertions**:
- Null checkup statuses are included
- Status null values are preserved
- No errors thrown for null statuses

**Mock Requirements**:
- Mock `checkupStatusRepository.findByProjectId()` to return statuses with null values

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Aggregate Project Data - No Documentation
**Type**: Edge Case Test

**Description**: Verify that project data aggregation handles parts with no documentation.

**Input Data**:
- Project ID with parts that have no documentation files

**Expected Output**:
- Parts are included
- Parts have empty documentation array
- Returns: `{ parts: [{ part, documentation: [] }] }`

**Assertions**:
- Parts without documentation are handled
- Empty documentation array is returned
- No errors thrown

**Mock Requirements**:
- Mock `documentationRepository.findByProjectId()` to return empty array

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Aggregate Project Data - Performance
**Type**: Performance Test

**Description**: Verify that project data aggregation completes within 1 second for typical project.

**Input Data**:
- Project ID with typical project data (50 checkups, 20 documentation files)

**Expected Output**:
- All data is aggregated
- Response time < 1 second (per specification)

**Assertions**:
- Aggregation completes within time limit
- Database queries are optimized
- Performance meets specification

**Mock Requirements**:
- Mock repositories with performance verification
- Verify query optimization

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Aggregate Project Data - Database Error
**Type**: Error Handling Test

**Description**: Verify that database errors during aggregation are handled.

**Input Data**:
- Project ID
- Database query fails

**Expected Output**:
- Error is caught
- Error message: "Unable to load project details. Please try again."
- Returns: `{ success: false, error: "Unable to load project details. Please try again." }`

**Assertions**:
- Database error is caught
- Error is handled gracefully
- Error message matches specification

**Mock Requirements**:
- Mock repository method to throw database error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Aggregate Project Data - Missing Powerplant
**Type**: Error Handling Test

**Description**: Verify that missing powerplant data is handled.

**Input Data**:
- Project ID
- Powerplant does not exist

**Expected Output**:
- Error is handled
- Error message: "Powerplant not found."
- Returns: `{ success: false, error: "Powerplant not found." }`

**Assertions**:
- Missing powerplant is detected
- Error is handled appropriately
- Error message is clear

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Aggregate Project Data - Nested Structure
**Type**: Positive Test

**Description**: Verify that aggregated data has correct nested structure.

**Input Data**:
- Project ID with complete data

**Expected Output**:
- Data structure is properly nested:
  - Project → Powerplant
  - Project → Parts → Checkups → Status
  - Project → Parts → Documentation

**Assertions**:
- Data structure matches expected format
- Nested relationships are correct
- All data is properly linked

**Mock Requirements**:
- Mock all repositories to return complete data
- Verify nested structure

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Aggregate Project Data - Large Project
**Type**: Boundary Test

**Description**: Verify that large projects with many parts, checkups, and documentation are aggregated correctly.

**Input Data**:
- Project ID with: 20 parts, 100 checkups, 50 documentation files

**Expected Output**:
- All data is aggregated
- Performance is acceptable
- No data loss

**Assertions**:
- All parts are included
- All checkups are included
- All documentation is included
- Performance is acceptable

**Mock Requirements**:
- Mock repositories to return large dataset
- Verify all data is included

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Aggregate Project Data - Checkup Status Mapping
**Type**: Positive Test

**Description**: Verify that checkup statuses are correctly mapped to their checkups.

**Input Data**:
- Project ID with checkups and statuses

**Expected Output**:
- Each checkup has its corresponding status
- Status is correctly associated with checkup
- Returns: `{ checkups: [{ checkupId, status: "good" }] }`

**Assertions**:
- Checkup statuses are correctly mapped
- Status matches checkup ID
- No mismatched statuses

**Mock Requirements**:
- Mock `checkupStatusRepository.findByProjectId()` to return statuses
- Verify status-checkup mapping

**Test Isolation Requirements**:
- No shared state
