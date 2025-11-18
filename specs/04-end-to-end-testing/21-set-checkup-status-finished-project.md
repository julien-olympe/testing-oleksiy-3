# Test 21: Set Checkup Status - Finished Project Modification

## Test ID
E2E-UC6-NEG-001

## Test Name
Set Checkup Status - Finished Project Modification Error

## Description
This test verifies that the system correctly prevents modification of checkup statuses in projects that have been marked as "Finished". The system should display an appropriate error message and not allow status updates.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Test project exists in database:
  - Project ID: `project-uuid-finished`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant: "Wind Farm Alpha"
  - Status: "Finished" (project is completed)
  - Checkup exists with ID: `checkup-uuid-001`
  - Checkup has status set to "good"
- User is logged in and viewing Ongoing Project Screen for finished project
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Ongoing Project Screen
1. Verify user is logged in and on Ongoing Project Screen
2. Verify project "Wind Farm Alpha" is displayed
3. Verify project status is "Finished" (may be indicated by badge or UI element)
4. Verify parts list is displayed with checkups
5. Locate checkup with ID `checkup-uuid-001`

**Expected Result:** Ongoing Project Screen displays finished project

### Step 2: Verify Checkup Status Displayed
1. Verify checkup `checkup-uuid-001` is displayed
2. Verify checkup shows current status (e.g., "Good" with green indicator)
3. Verify status buttons are displayed (may be disabled or hidden)

**Expected Result:** Checkup status is displayed

### Step 3: Attempt to Modify Checkup Status
1. Attempt to click on a different status button (e.g., click "Bad" when current status is "Good")
2. Verify if status buttons are disabled (preferred) or clickable
3. If clickable, wait for status update request to complete

**Expected Result:** Status update is attempted or prevented

### Step 4: Verify Error Message Displayed
1. If status buttons were clickable, verify error message is displayed
2. Verify message text is exactly: "Cannot modify checkups in a finished project."
3. Verify error message is displayed in appropriate location (below checkup or error banner)
4. Verify error message is styled appropriately (red text, visible)
5. If status buttons were disabled, verify they remain disabled

**Expected Result:** Error is handled appropriately (buttons disabled or error message shown)

### Step 5: Verify Status Not Updated
1. Verify checkup status remains unchanged in UI
2. Query database for checkup status record
3. Verify status value remains "good" (or original value)
4. Verify no update was made to database

**Expected Result:** Status is not updated in UI or database

### Step 6: Verify Status Buttons State
1. Verify status buttons are disabled (preferred) or show error state
2. Verify user cannot interact with status buttons
3. Verify visual indication that project is finished (read-only state)

**Expected Result:** Status buttons are disabled or non-functional

### Step 7: Verify API Response
1. If request was sent, verify API request was made to update checkup status endpoint
2. Verify request included valid JWT token
3. Verify response returns HTTP 400 (Bad Request) or HTTP 403 (Forbidden)
4. Verify response includes error message: "Cannot modify checkups in a finished project."

**Expected Result:** API returns appropriate error status (if request was sent)

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-finished` (finished project)
- **Checkup ID:** `checkup-uuid-001` (checkup to modify)
- **Status Value:** Attempt to change to different status

### Database State
- Project exists with status "Finished"
- Checkup exists and belongs to project's powerplant
- Checkup status record exists with value "good"
- Project status is "Finished" (cannot be modified)

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Status buttons are disabled (preferred) or show error when clicked
- Error message "Cannot modify checkups in a finished project." is displayed (if buttons are clickable)
- Checkup status remains unchanged in UI
- Visual indication that project is finished (read-only state)
- User cannot modify checkup statuses

### API Outcomes
- Update checkup status endpoint returns HTTP 400 (Bad Request) or HTTP 403 (Forbidden) if request is sent
- Response includes error message: "Cannot modify checkups in a finished project."
- Status is not updated
- OR: Request is prevented on client-side (buttons disabled)

### Database Outcomes
- Checkup status record is not updated
- Status value remains unchanged
- Database remains unchanged

### Performance Outcomes
- Error response is returned promptly (if request is sent)
- Error message is displayed immediately
- No performance issues

## Cleanup Steps
1. Verify test project status remains "Finished"
2. Verify checkup status was not modified
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- Finished projects should be read-only (cannot modify checkups)
- Status buttons should be disabled for finished projects (preferred UX)
- Error message must match exact specification from functional requirements
- This test verifies data integrity and prevents modification of completed projects
- Users should be able to view finished projects but not modify them
