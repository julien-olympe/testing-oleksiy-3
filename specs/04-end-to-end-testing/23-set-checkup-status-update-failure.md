# Test 23: Set Checkup Status - Update Failure

## Test ID
E2E-UC6-NEG-003

## Test Name
Set Checkup Status - Update Failure

## Description
This test verifies that the system correctly handles checkup status update failures (database errors, system errors). The system should display an appropriate error message and allow the user to retry the operation.

## Prerequisites
- Test database is configured to simulate update failure (connection error, constraint violation, etc.)
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Test project exists in database:
  - Project ID: `project-uuid-001`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant: "Wind Farm Alpha"
  - Status: "In Progress"
  - Checkup exists with ID: `checkup-uuid-001`
- Database will fail during status update (simulated error)
- User is logged in and viewing Ongoing Project Screen for test project
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Ongoing Project Screen
1. Verify user is logged in and on Ongoing Project Screen
2. Verify project "Wind Farm Alpha" is displayed
3. Verify parts list is displayed with checkups
4. Locate checkup with ID `checkup-uuid-001`

**Expected Result:** Ongoing Project Screen displays project with checkups

### Step 2: Attempt to Set Checkup Status
1. Verify checkup `checkup-uuid-001` is displayed
2. Verify checkup shows three status buttons: Bad, Average, Good
3. Click on "Good" status button for checkup `checkup-uuid-001`
4. Wait for status update request to complete or fail
5. Verify loading state is shown during request

**Expected Result:** Status update request is sent

### Step 3: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "Unable to save status. Please try again."
3. Verify error message is displayed in appropriate location (below checkup or error banner)
4. Verify error message is styled appropriately (red text, visible)
5. Verify error message is user-friendly (does not expose internal system details)

**Expected Result:** Error message is displayed correctly

### Step 4: Verify Status Not Updated
1. Verify checkup status remains unchanged in UI
2. Verify status buttons return to previous state (no status selected or previous status)
3. Query database for checkup status record
4. Verify status value remains unchanged (or was not created)
5. Verify no update was made to database

**Expected Result:** Status is not updated in UI or database

### Step 5: Verify Retry Capability
1. Verify status buttons are still functional
2. Verify user can attempt to set status again
3. Verify error handling does not break application flow
4. Verify user can interact with other checkups

**Expected Result:** User can retry the operation

### Step 6: Verify API Response
1. Verify API request was made to update checkup status endpoint
2. Verify request included valid JWT token
3. Verify response returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable)
4. Verify response includes error message or generic error

**Expected Result:** API returns appropriate error status

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-001` (from current project)
- **Checkup ID:** `checkup-uuid-001` (checkup to update)
- **Status Value:** "good" (attempted update)

### Database State
- Project exists with status "In Progress"
- Checkup exists and belongs to project's powerplant
- Database will fail during status update (simulated):
  - Database connection error, OR
  - Constraint violation, OR
  - Update timeout, OR
  - Transaction rollback

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Error message "Unable to save status. Please try again." is displayed
- Error message is clearly visible and styled appropriately
- Checkup status remains unchanged in UI
- Status buttons are still functional (user can retry)
- User can interact with other checkups
- Application remains functional

### API Outcomes
- Update checkup status endpoint returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable)
- Response includes error message or generic error
- Error response does not expose internal database details
- Response time may vary (depending on error type)

### Database Outcomes
- Status update fails (database error, constraint violation, etc.)
- Checkup status record is not created or updated
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
2. Verify checkup status was not modified
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- Error message must match exact specification from functional requirements
- Error message should be user-friendly and not expose internal system details
- Database errors should be logged for debugging purposes
- User should be able to retry the operation
- This test verifies error handling and resilience of the system
- Database errors may be simulated by causing constraint violations, connection failures, or timeouts
- Status updates should be atomic (all or nothing)
