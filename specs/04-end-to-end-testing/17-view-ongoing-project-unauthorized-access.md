# Test 17: View Ongoing Project Details - Unauthorized Access

## Test ID
E2E-UC5-NEG-001

## Test Name
View Ongoing Project Details - Unauthorized Access Error

## Description
This test verifies that the system correctly prevents users from accessing projects that are not assigned to them. The system should display an appropriate error message and not display project data.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Another user account exists:
  - Username: `otheruser`
  - User ID: `user-uuid-002`
- Project exists in database assigned to other user:
  - Project ID: `project-uuid-other`
  - User ID: `user-uuid-002` (assigned to other user, NOT test user)
  - Powerplant: "Wind Farm Beta"
- Test user is logged in and on Home Screen
- Browser is open with active session

## Test Steps

### Step 1: Attempt to Access Other User's Project
1. Verify test user is logged in
2. Attempt to access project by:
   - Directly navigating to project URL with project ID `project-uuid-other`, OR
   - Modifying API request to include other user's project ID, OR
   - Using browser developer tools to change project ID in request
3. Send request to project details endpoint

**Expected Result:** Request is sent with project ID not assigned to test user

### Step 2: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "You do not have permission to view this project."
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
2. Verify request included valid JWT token for test user
3. Verify response returns HTTP 403 (Forbidden)
4. Verify response includes error message: "You do not have permission to view this project."

**Expected Result:** API returns appropriate error status

### Step 5: Verify Database Access Control
1. Verify system checked project ownership before retrieving data
2. Verify system did not retrieve project data for unauthorized user
3. Verify database query included user ID validation
4. Verify unauthorized access attempt is logged (security best practice)

**Expected Result:** Access control is enforced at database/API level

### Step 6: Verify User Can Navigate Away
1. Verify user can navigate back to Home Screen
2. Verify user can access their own projects
3. Verify application continues to function normally

**Expected Result:** User can navigate and application remains functional

## Test Data Requirements

### Database State
- Test user exists: `user-uuid-001`
- Other user exists: `user-uuid-002`
- Project exists assigned to other user:
  - ID: `project-uuid-other`
  - User ID: `user-uuid-002` (NOT test user)
  - Powerplant: "Wind Farm Beta"

### Authentication State
- Test user is authenticated with valid JWT token
- Token is included in API requests
- Session is active
- Token contains test user's user ID

## Expected Outcomes

### UI Outcomes
- Error message "You do not have permission to view this project." is displayed
- Error message is clearly visible and styled appropriately
- No project data is displayed
- User can navigate away from error state
- Application remains functional

### API Outcomes
- Project details endpoint returns HTTP 403 (Forbidden)
- Response includes error message: "You do not have permission to view this project."
- No project data is returned in response
- Response time is acceptable

### Database Outcomes
- System checks project ownership before querying
- Project data is not retrieved for unauthorized user
- Database query includes user ID validation
- Access control is enforced

### Security Outcomes
- Unauthorized access is prevented
- Error message does not reveal project existence (if project doesn't exist for user)
- Unauthorized access attempt may be logged
- Access control is enforced at multiple levels (API, database)

### Performance Outcomes
- Error response is returned promptly
- Error message is displayed immediately
- No unnecessary data is retrieved

## Cleanup Steps
1. Logout user (if session persists)
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)
4. Verify test user cannot access other user's project

## Notes
- Access control must be enforced at API level
- Project ownership must be verified before data retrieval
- Error message must match exact specification from functional requirements
- Unauthorized access attempts should be logged for security auditing
- This test verifies security and access control functionality
- Users should only see projects assigned to them
