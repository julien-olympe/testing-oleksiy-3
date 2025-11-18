# Test 12: View Assigned Projects - Database Error

## Test ID
E2E-UC3-NEG-001

## Test Name
View Assigned Projects - Database Error

## Description
This test verifies that the system correctly handles database errors when attempting to retrieve assigned projects. The system should display an appropriate error message and allow the user to retry the operation.

## Prerequisites
- Test database is configured to simulate database error (connection failure, query timeout, etc.)
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Database connection is unavailable or query will fail
- User is logged in and on Home Screen
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Home Screen
1. Verify user is logged in (session token is valid)
2. Navigate to Home Screen (or verify already on Home Screen)
3. Verify Home Screen displays:
   - Header with application title/logo
   - User information in header
   - Logout button in header
   - "Start Project" button

**Expected Result:** Home Screen is displayed correctly

### Step 2: Trigger Database Error
1. Simulate database error (connection failure, query timeout, or database unavailable)
2. Wait for projects list request to complete or timeout

**Expected Result:** Database error occurs during projects retrieval

### Step 3: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "Unable to load projects. Please try again."
3. Verify error message is displayed in appropriate location (projects list area or error banner)
4. Verify error message is styled appropriately (red text, visible)
5. Verify error message is user-friendly (does not expose internal database details)

**Expected Result:** Error message is displayed correctly

### Step 4: Verify No Projects Displayed
1. Verify no project items are displayed
2. Verify projects list container shows error state
3. Verify empty state message is NOT displayed (error takes precedence)

**Expected Result:** No projects displayed, error message shown instead

### Step 5: Verify Retry Capability
1. Verify retry mechanism is available (refresh button, retry button, or page refresh)
2. Verify user can attempt to reload projects
3. Verify error handling does not break application flow

**Expected Result:** User can retry the operation

### Step 6: Verify API Response
1. Verify API request was made to projects endpoint
2. Verify request included valid JWT token
3. Verify response returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable)
4. Verify response includes error message or generic error

**Expected Result:** API returns appropriate error status

## Test Data Requirements

### Database State
- Database connection is unavailable, OR
- Database query will timeout, OR
- Database returns error response
- User exists in database but query fails

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Home Screen displays correctly
- Error message "Unable to load projects. Please try again." is displayed
- Error message is clearly visible and styled appropriately
- No project items are displayed
- Empty state message is NOT displayed (error takes precedence)
- Retry mechanism is available (refresh, retry button, or page reload)

### API Outcomes
- Projects endpoint returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable)
- Response includes error message or generic error
- Error response does not expose internal database details
- Response time may exceed normal limits (timeout scenario)

### Database Outcomes
- Database query fails (connection error, timeout, or query error)
- Error is logged appropriately (for debugging)
- Database connection may be retried (if configured)

### Performance Outcomes
- Error response may take longer than normal (timeout scenario)
- Error message is displayed promptly after error detection
- Application remains responsive despite error

### Error Handling Outcomes
- Error is handled gracefully
- User-facing error message is user-friendly
- Internal error details are not exposed to user
- Application continues to function (user can navigate, logout, etc.)

## Cleanup Steps
1. Restore database connection (if intentionally broken)
2. Logout user (if session persists)
3. Clear browser session and cookies
4. Close browser instance (if not reused for other tests)

## Notes
- Error message must match exact specification from functional requirements
- Error message should be user-friendly and not expose internal system details
- Database errors should be logged for debugging purposes
- User should be able to retry the operation
- This test verifies error handling and resilience of the system
- Database connection errors may be simulated by disconnecting database or causing query timeout
