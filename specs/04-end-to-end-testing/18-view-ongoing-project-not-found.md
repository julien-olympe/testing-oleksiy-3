# Test 18: View Ongoing Project Details - Project Not Found

## Test ID
E2E-UC5-NEG-002

## Test Name
View Ongoing Project Details - Project Not Found

## Description
This test verifies that the system correctly handles requests for projects that do not exist in the database. The system should display an appropriate error message and not display project data.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- No project with ID `project-uuid-nonexistent` exists in database
- User is logged in and on Home Screen
- Browser is open with active session

## Test Steps

### Step 1: Attempt to Access Non-Existent Project
1. Verify test user is logged in
2. Attempt to access project by:
   - Directly navigating to project URL with non-existent project ID `project-uuid-nonexistent`, OR
   - Modifying API request to include non-existent project ID, OR
   - Using browser developer tools to change project ID in request
3. Send request to project details endpoint

**Expected Result:** Request is sent with non-existent project ID

### Step 2: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "Project not found."
3. Verify error message is displayed in appropriate location (error banner or page)
4. Verify error message is styled appropriately (red text, visible)
5. Verify user is NOT shown project data

**Expected Result:** Error message is displayed, no project data shown

### Step 3: Verify No Project Data Displayed
1. Verify Ongoing Project Screen does NOT display:
   - Powerplant name
   - Parts list
   - Checkup statuses
   - Documentation
2. Verify error state is shown instead of project data

**Expected Result:** No project data is displayed

### Step 4: Verify API Response
1. Verify API request was made to project details endpoint
2. Verify request included valid JWT token
3. Verify response returns HTTP 404 (Not Found)
4. Verify response includes error message: "Project not found."

**Expected Result:** API returns appropriate error status

### Step 5: Verify Database Query
1. Verify system attempted to retrieve project from database
2. Verify no project record was found with the provided ID
3. Verify system did not proceed with data retrieval

**Expected Result:** System correctly identifies that project does not exist

### Step 6: Verify User Can Navigate Away
1. Verify user can navigate back to Home Screen
2. Verify user can access their own projects
3. Verify application continues to function normally

**Expected Result:** User can navigate and application remains functional

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-nonexistent` (does not exist in database)
- **User ID:** `user-uuid-001` (from authenticated session)

### Database State
- Test user exists: `user-uuid-001`
- No project with ID `project-uuid-nonexistent` exists in database
- Database connection is available

### Authentication State
- Test user is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Error message "Project not found." is displayed
- Error message is clearly visible and styled appropriately
- No project data is displayed
- User can navigate away from error state
- Application remains functional

### API Outcomes
- Project details endpoint returns HTTP 404 (Not Found)
- Response includes error message: "Project not found."
- No project data is returned in response
- Response time is acceptable

### Database Outcomes
- Database query is performed to find project
- No project record is found
- System correctly identifies project does not exist
- No unnecessary data is retrieved

### Performance Outcomes
- Error response is returned promptly
- Error message is displayed immediately
- No performance degradation

## Cleanup Steps
1. Logout user (if session persists)
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)

## Notes
- Error message must match exact specification from functional requirements
- System should handle non-existent projects gracefully
- Error message should be user-friendly
- User should be able to navigate away and continue using application
- This test verifies error handling for invalid project IDs
