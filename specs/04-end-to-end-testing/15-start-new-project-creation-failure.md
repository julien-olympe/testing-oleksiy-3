# Test 15: Start New Project - Creation Failure

## Test ID
E2E-UC4-NEG-002

## Test Name
Start New Project - Creation Failure

## Description
This test verifies that the system correctly handles project creation failures (database errors, system errors). The system should display an appropriate error message and allow the user to retry the operation.

## Prerequisites
- Test database is configured to simulate creation failure (constraint violation, database error, etc.)
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Powerplant exists in database:
  - Powerplant ID: `powerplant-uuid-alpha`
  - Powerplant Name: "Wind Farm Alpha"
- Database will fail during project creation (simulated error)
- User is logged in and on Start Project Screen
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Start Project Screen
1. Verify user is logged in and on Home Screen
2. Click "Start Project" button
3. Verify navigation to Start Project Screen
4. Verify Start Project Screen displays correctly

**Expected Result:** Start Project Screen is displayed

### Step 2: Select Powerplant
1. Click on powerplant selector dropdown
2. Select powerplant "Wind Farm Alpha" from dropdown
3. Verify preview is displayed with parts and checkups
4. Verify "Create" button is enabled

**Expected Result:** Powerplant is selected and preview is displayed

### Step 3: Attempt to Create Project
1. Click "Create" button
2. Wait for project creation request to complete or fail
3. Verify loading state is shown during request

**Expected Result:** Project creation request is sent

### Step 4: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "Unable to create project. Please try again." OR "Database error. Please contact support."
3. Verify error message is displayed in appropriate location (below form or error banner)
4. Verify error message is styled appropriately (red text, visible)
5. Verify error message is user-friendly (does not expose internal system details)

**Expected Result:** Error message is displayed correctly

### Step 5: Verify No Project Created
1. Query database for projects created by test user
2. Verify no new project was created
3. Verify no checkup status records were created
4. Verify database transaction was rolled back (if transaction was used)

**Expected Result:** No project or related records are created

### Step 6: Verify Form State Maintained
1. Verify user remains on Start Project Screen
2. Verify powerplant selection is maintained (or cleared, implementation dependent)
3. Verify preview is still displayed (or hidden, implementation dependent)
4. Verify "Create" button is enabled (user can retry)
5. Verify form is functional and user can retry operation

**Expected Result:** Form state allows user to retry

### Step 7: Verify API Response
1. Verify API request was made to create project endpoint
2. Verify request included valid JWT token
3. Verify response returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable)
4. Verify response includes error message or generic error

**Expected Result:** API returns appropriate error status

## Test Data Requirements

### Input Data
- **Selected Powerplant:** "Wind Farm Alpha" (powerplant-uuid-alpha)
- **User ID:** `user-uuid-001` (from authenticated session)

### Database State
- Powerplant "Wind Farm Alpha" exists
- Database will fail during project creation (simulated):
  - Database connection error, OR
  - Constraint violation, OR
  - Query timeout, OR
  - Transaction rollback

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Start Project Screen displays correctly
- Powerplant is selected and preview is displayed
- Error message "Unable to create project. Please try again." or "Database error. Please contact support." is displayed
- Error message is clearly visible and styled appropriately
- User remains on Start Project Screen
- Form is functional and user can retry
- No project is created

### API Outcomes
- Create project endpoint returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable)
- Response includes error message or generic error
- Error response does not expose internal database details
- Response time may vary (depending on error type)

### Database Outcomes
- Project creation fails (database error, constraint violation, etc.)
- No project record is created
- No checkup status records are created
- Database transaction is rolled back (if transaction was used)
- Error is logged appropriately (for debugging)

### Performance Outcomes
- Error response is returned promptly (or after timeout)
- Error message is displayed immediately after error detection
- Application remains responsive despite error

### Error Handling Outcomes
- Error is handled gracefully
- User-facing error message is user-friendly
- Internal error details are not exposed to user
- Application continues to function (user can retry, navigate, logout, etc.)

## Cleanup Steps
1. Restore database to normal state (if intentionally broken)
2. Verify no test project was created
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- Error message must match specification from functional requirements
- Error message should be user-friendly and not expose internal system details
- Database errors should be logged for debugging purposes
- User should be able to retry the operation
- This test verifies error handling and resilience of the system
- Database errors may be simulated by causing constraint violations, connection failures, or timeouts
