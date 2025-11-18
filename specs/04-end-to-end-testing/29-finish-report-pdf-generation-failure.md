# Test 29: Finish Report and Generate PDF - PDF Generation Failure

## Test ID
E2E-UC8-NEG-001

## Test Name
Finish Report and Generate PDF - PDF Generation Failure

## Description
This test verifies that the system correctly handles PDF generation failures (Puppeteer errors, service unavailable, timeout). The system should display an appropriate error message, keep the project in "In Progress" status, and allow the user to retry the operation.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- PDF Generator Service (Puppeteer) is unavailable or will fail
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Test project exists in database:
  - Project ID: `project-uuid-001`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant: "Wind Farm Alpha"
  - Status: "In Progress"
  - All checkups have statuses set
- PDF Generator Service will fail during generation (simulated error)
- User is logged in and viewing Ongoing Project Screen for test project
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Ongoing Project Screen
1. Verify user is logged in and on Ongoing Project Screen
2. Verify project "Wind Farm Alpha" is displayed
3. Verify all checkups have statuses set
4. Verify "Finish Report" button is displayed and enabled

**Expected Result:** Ongoing Project Screen displays with project ready to finish

### Step 2: Click Finish Report Button
1. Click "Finish Report" button
2. Wait for PDF generation request to complete or fail
3. Verify loading state is shown during request

**Expected Result:** PDF generation request is sent

### Step 3: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "Unable to generate PDF report. Please try again."
3. Verify error message is displayed in appropriate location (error banner or page)
4. Verify error message is styled appropriately (red text, visible)
5. Verify error message is user-friendly (does not expose internal system details)

**Expected Result:** Error message is displayed correctly

### Step 4: Verify Project Status Not Changed
1. Query database for project record
2. Verify project status remains "In Progress" (not changed to "Finished")
3. Verify finished_at timestamp is not set
4. Verify project data remains unchanged

**Expected Result:** Project status remains "In Progress"

### Step 5: Verify No PDF Downloaded
1. Verify no PDF file is downloaded to user's device
2. Verify download was not initiated
3. Verify no PDF file is generated

**Expected Result:** No PDF is generated or downloaded

### Step 6: Verify User Can Retry
1. Verify "Finish Report" button is still enabled
2. Verify user can click button again to retry
3. Verify error handling does not break application flow
4. Verify user can navigate away and return

**Expected Result:** User can retry the operation

### Step 7: Verify User Remains on Ongoing Project Screen
1. Verify user is NOT redirected to Home Screen
2. Verify user remains on Ongoing Project Screen
3. Verify project data is still accessible
4. Verify user can continue working on project

**Expected Result:** User remains on Ongoing Project Screen

### Step 8: Verify API Response
1. Verify API request was made to finish report endpoint
2. Verify request included valid JWT token
3. Verify response returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable) or HTTP 504 (Gateway Timeout)
4. Verify response includes error message or generic error

**Expected Result:** API returns appropriate error status

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-001` (project to finish)
- **User ID:** `user-uuid-001` (from authenticated session)

### Database State
- Project exists with status "In Progress"
- All checkups have statuses set
- PDF Generator Service is unavailable or will fail:
  - Puppeteer launch failure, OR
  - PDF generation timeout, OR
  - Service unavailable

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Error message "Unable to generate PDF report. Please try again." is displayed
- Error message is clearly visible and styled appropriately
- No PDF file is downloaded
- User remains on Ongoing Project Screen
- "Finish Report" button is still enabled (user can retry)
- Application remains functional

### API Outcomes
- Finish report endpoint returns HTTP 500 (Internal Server Error) or HTTP 503 (Service Unavailable) or HTTP 504 (Gateway Timeout)
- Response includes error message or generic error
- Error response does not expose internal system details
- Response time may vary (depending on error type)

### Database Outcomes
- Project status remains "In Progress" (not changed)
- Finished_at timestamp is not set
- Project data remains unchanged
- No updates are made to project record

### PDF Generation Outcomes
- PDF generation fails (Puppeteer error, timeout, service unavailable)
- No PDF file is generated
- No PDF file is downloaded
- Error is logged appropriately (for debugging)

### Performance Outcomes
- Error response is returned promptly (or after timeout)
- Error message is displayed immediately after error detection
- Application remains responsive despite error

### Error Handling Outcomes
- Error is handled gracefully
- User-facing error message is user-friendly
- Internal error details are not exposed to user
- Project remains in "In Progress" status (can be retried)
- Application continues to function (user can retry, navigate, logout, etc.)

## Cleanup Steps
1. Restore PDF Generator Service to normal state (if intentionally broken)
2. Verify project status remains "In Progress"
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- Error message must match exact specification from functional requirements
- Error message should be user-friendly and not expose internal system details
- PDF generation errors should be logged for debugging purposes
- Project must remain in "In Progress" status to allow retry
- User should be able to retry the operation
- This test verifies error handling and resilience of the system
- As per functional requirements: "If PDF generation fails, the system displays an error message and keeps the project in 'In Progress' status, allowing the user to retry"
