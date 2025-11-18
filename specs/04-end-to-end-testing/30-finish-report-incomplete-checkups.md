# Test 30: Finish Report and Generate PDF - Incomplete Checkups

## Test ID
E2E-UC8-NEG-002

## Test Name
Finish Report and Generate PDF - Incomplete Checkups Error

## Description
This test verifies that the system correctly prevents PDF generation when a project has incomplete checkups (some checkups have no status set). The system should display an appropriate error message, highlight missing checkups, and not generate the PDF.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Test project exists in database:
  - Project ID: `project-uuid-001`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant: "Wind Farm Alpha"
  - Status: "In Progress"
  - Some checkups have statuses set
  - At least one checkup has no status (null/unset)
- User is logged in and viewing Ongoing Project Screen for test project
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Ongoing Project Screen
1. Verify user is logged in and on Ongoing Project Screen
2. Verify project "Wind Farm Alpha" is displayed
3. Verify parts list is displayed with checkups
4. Verify some checkups have statuses set
5. Verify at least one checkup has no status (unset)
6. Verify "Finish Report" button is displayed and enabled

**Expected Result:** Ongoing Project Screen displays with incomplete checkups

### Step 2: Click Finish Report Button
1. Click "Finish Report" button
2. Wait for validation to complete
3. Verify validation occurs immediately (client-side) or after request (server-side)

**Expected Result:** Validation is performed

### Step 3: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message indicates incomplete checkups (exact message may vary: "Please set status for all checkups" or similar)
3. Verify error message is displayed in appropriate location (error banner or page)
4. Verify error message is styled appropriately (red text, visible)
5. Verify missing checkups are highlighted (visual indication)

**Expected Result:** Error message is displayed and missing checkups are highlighted

### Step 4: Verify Missing Checkups Highlighted
1. Verify checkups without status are visually highlighted:
   - Different background color, OR
   - Border highlight, OR
   - Icon indicator, OR
   - Text indicator
2. Verify highlighted checkups are easily identifiable
3. Verify user can see which checkups need status

**Expected Result:** Missing checkups are clearly highlighted

### Step 5: Verify No PDF Generated
1. Verify no PDF file is generated
2. Verify no PDF file is downloaded
3. Verify PDF generation is not initiated

**Expected Result:** No PDF is generated

### Step 6: Verify Project Status Not Changed
1. Query database for project record
2. Verify project status remains "In Progress" (not changed to "Finished")
3. Verify finished_at timestamp is not set
4. Verify project data remains unchanged

**Expected Result:** Project status remains "In Progress"

### Step 7: Verify User Can Set Missing Statuses
1. Verify user can click on highlighted checkups
2. Verify user can set statuses for missing checkups
3. Verify status buttons are functional
4. Verify after setting all statuses, user can retry finishing report

**Expected Result:** User can complete missing checkups and retry

### Step 8: Verify API Response (if request sent)
1. If validation is server-side, verify API request was made
2. Verify response returns HTTP 400 (Bad Request)
3. Verify response includes error message about incomplete checkups

**Expected Result:** API returns appropriate error status (if request sent)

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-001` (project with incomplete checkups)
- **User ID:** `user-uuid-001` (from authenticated session)

### Database State
- Project exists with status "In Progress"
- Some checkups have statuses set (bad, average, or good)
- At least one checkup has no status (null/unset)
- Project is not complete (cannot be finished)

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Error message about incomplete checkups is displayed
- Missing checkups are visually highlighted
- Highlighting is clear and easily identifiable
- No PDF file is generated or downloaded
- User can set statuses for missing checkups
- "Finish Report" button remains functional (user can retry after completing checkups)

### API Outcomes
- Finish report endpoint returns HTTP 400 (Bad Request) if request is sent
- Response includes error message about incomplete checkups
- PDF generation is not initiated
- OR: Client-side validation prevents form submission (acceptable alternative)

### Database Outcomes
- Project status remains "In Progress" (not changed)
- Finished_at timestamp is not set
- Project data remains unchanged
- No updates are made to project record

### PDF Generation Outcomes
- PDF generation is not initiated
- No PDF file is generated
- No PDF file is downloaded

### Performance Outcomes
- Validation occurs immediately (client-side) or within 1 second (server-side)
- Error message is displayed promptly
- Highlighting is applied immediately

## Cleanup Steps
1. Optionally set missing checkup statuses (if needed for other tests)
2. Verify project status remains "In Progress"
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- All checkups must have statuses set before project can be finished
- Missing checkups should be clearly highlighted to guide user
- Error message should provide clear guidance (set status for all checkups)
- Validation may occur on client-side (preferred) or server-side
- User should be able to complete missing checkups and retry
- This test verifies data completeness validation
- As per functional requirements: "If a user attempts to finish a project with incomplete checkups, the system prevents PDF generation and highlights missing checkups"
