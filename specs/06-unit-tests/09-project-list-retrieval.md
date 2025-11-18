# Project List Retrieval Tests

## Test ID: UT-09
## Test Name: Project List Retrieval

## Description and Purpose
Test project list retrieval functionality, including user filtering, sorting, powerplant information retrieval, and data aggregation for display.

## Function/Component Being Tested
- `getUserProjects()` function
- `formatProjectList()` function
- `aggregateProjectData()` function
- Project list service/controller

## Test Setup
- Mock database connection and query methods
- Mock project repository methods (findByUserId)
- Mock powerplant repository methods
- Test data: sample users, projects, powerplants

## Test Cases

### Test Case 1: Retrieve User Projects - Multiple Projects
**Type**: Positive Test

**Description**: Verify that all projects assigned to a user are retrieved correctly.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- User has 3 projects

**Expected Output**:
- All 3 projects are retrieved
- Projects are sorted by creation date (newest first)
- Returns: `{ projects: [project1, project2, project3] }`

**Assertions**:
- `projectRepository.findByUserId()` is called with user ID
- All user's projects are returned
- Projects are sorted by created_at descending
- Response time < 500ms (per specification)

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return 3 projects sorted by date

**Test Isolation Requirements**:
- No shared state
- Fresh test data for each test

---

### Test Case 2: Retrieve User Projects - Empty List
**Type**: Edge Case Test

**Description**: Verify that empty project list is handled correctly.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- User has no projects

**Expected Output**:
- Empty array is returned
- Returns: `{ projects: [] }`

**Assertions**:
- `projectRepository.findByUserId()` is called
- Empty array is returned
- No errors thrown

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return empty array

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Project List with Powerplant Information
**Type**: Positive Test

**Description**: Verify that project list includes powerplant name for each project.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- User has 2 projects with different powerplants

**Expected Output**:
- Projects are retrieved with powerplant information
- Each project includes powerplant name
- Returns: `{ projects: [{ id, powerplantName, status, createdAt }, ...] }`

**Assertions**:
- `projectRepository.findByUserId()` is called
- Powerplant information is joined or retrieved for each project
- Each project has powerplant name
- Data aggregation includes powerplant data

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return projects with powerplant data
- Or mock `powerplantRepository.findById()` for each project

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Project List Sorting - Newest First
**Type**: Positive Test

**Description**: Verify that projects are sorted by creation date (newest first).

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Projects with different creation dates:
  - Project 1: created_at = 2024-01-01
  - Project 2: created_at = 2024-01-15
  - Project 3: created_at = 2024-01-10

**Expected Output**:
- Projects are sorted by created_at descending
- Order: Project 2, Project 3, Project 1
- Returns: `{ projects: [project2, project3, project1] }`

**Assertions**:
- Projects are sorted correctly
- Newest project is first
- Oldest project is last

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return projects in correct order
- Or verify sorting logic in service

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Project List Format - Status Display
**Type**: Positive Test

**Description**: Verify that project list includes status information formatted correctly.

**Input Data**:
- User ID with projects having different statuses

**Expected Output**:
- Each project includes status field
- Status values are "In Progress" or "Finished" (formatted for display)
- Returns: `{ projects: [{ status: "In Progress" }, { status: "Finished" }, ...] }`

**Assertions**:
- Status field is included in each project
- Status values are formatted for display
- Status matches database enum values

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return projects with status

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Project List Format - Creation Date Display
**Type**: Positive Test

**Description**: Verify that project list includes creation date formatted for display.

**Input Data**:
- User ID with projects

**Expected Output**:
- Each project includes creation date
- Date is formatted for display
- Returns: `{ projects: [{ createdAt: "2024-01-15" }, ...] }`

**Assertions**:
- Creation date is included
- Date is formatted appropriately
- Date format is consistent

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return projects with timestamps

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Project List - User Filtering
**Type**: Positive Test

**Description**: Verify that only projects for the specified user are returned.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Database has projects for multiple users

**Expected Output**:
- Only projects with matching user_id are returned
- Other users' projects are excluded
- Returns: `{ projects: [...] }` (all belong to user)

**Assertions**:
- `projectRepository.findByUserId()` is called with correct user ID
- Query filters by user_id
- Only user's projects are returned

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return only user's projects

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Project List - Database Error
**Type**: Error Handling Test

**Description**: Verify that database errors during project list retrieval are handled.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Database query fails

**Expected Output**:
- Database error is caught
- Error message: "Unable to load projects. Please try again."
- Returns: `{ success: false, error: "Unable to load projects. Please try again." }`

**Assertions**:
- Database error is caught
- Error is handled gracefully
- Error message matches specification

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to throw database error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Project List - Query Timeout
**Type**: Error Handling Test

**Description**: Verify that query timeout errors are handled.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Query timeout occurs

**Expected Output**:
- Timeout error is caught
- Error message: "Request timeout. Please try again."
- Returns: `{ success: false, error: "Request timeout. Please try again." }`

**Assertions**:
- Query timeout is caught
- Error is handled gracefully
- Error message indicates timeout

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to throw timeout error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Project List - Large Number of Projects
**Type**: Boundary Test

**Description**: Verify that project list retrieval handles users with many projects.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- User has 100 projects

**Expected Output**:
- All 100 projects are retrieved
- Response time < 500ms (per specification)
- Projects are sorted correctly

**Assertions**:
- All projects are retrieved
- Performance is acceptable
- Sorting works with large dataset

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return 100 projects
- Verify performance

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Project List - Missing Powerplant Data
**Type**: Error Handling Test

**Description**: Verify that missing powerplant data is handled gracefully.

**Input Data**:
- User ID with project
- Project references non-existent powerplant

**Expected Output**:
- Error is handled
- Either powerplant is retrieved with null/error, or project is excluded
- Appropriate error handling

**Assertions**:
- Missing powerplant is handled
- Error doesn't break entire list retrieval
- Appropriate fallback or error message

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return project
- Mock `powerplantRepository.findById()` to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Project List - Performance with Joins
**Type**: Performance Test

**Description**: Verify that project list retrieval with powerplant joins is performant.

**Input Data**:
- User ID with multiple projects

**Expected Output**:
- Projects with powerplant data are retrieved efficiently
- Response time < 500ms
- Database queries are optimized

**Assertions**:
- Query performance is acceptable
- Joins are optimized (indexed foreign keys)
- Response time meets specification

**Mock Requirements**:
- Mock repository methods with performance verification
- Verify query optimization

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Project List - Data Aggregation
**Type**: Positive Test

**Description**: Verify that project data is properly aggregated for display.

**Input Data**:
- User ID with projects

**Expected Output**:
- Project data includes:
  - Project ID
  - Powerplant name
  - Status (formatted)
  - Creation date (formatted)
- Returns formatted project list

**Assertions**:
- All required fields are included
- Data is properly formatted
- Aggregation logic works correctly

**Mock Requirements**:
- Mock `projectRepository.findByUserId()` to return projects
- Mock `powerplantRepository.findById()` for each project

**Test Isolation Requirements**:
- No shared state
