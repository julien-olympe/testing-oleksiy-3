# Test 16: View Ongoing Project Details - Display Project with All Data

## Test ID
E2E-UC5-POS-001

## Test Name
View Ongoing Project Details - Display Project with All Data

## Description
This test verifies that an authenticated user can successfully view all details of an ongoing project including powerplant name, list of parts with checkups, current checkup statuses, and associated documentation. The project should be displayed in the Ongoing Project Screen with all components functional.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Test project exists in database:
  - Project ID: `project-uuid-001`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant ID: `powerplant-uuid-alpha`
  - Powerplant Name: "Wind Farm Alpha"
  - Status: "In Progress"
  - Parts: At least 5 parts
  - Each part has at least 3 checkups
  - Some checkups have statuses set (bad, average, good)
  - Some checkups have no status (null/unset)
  - Documentation exists for at least 2 parts (images and descriptions)
- User is logged in and on Home Screen
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Home Screen
1. Verify user is logged in and on Home Screen
2. Verify project list is displayed
3. Locate project item for "Wind Farm Alpha"

**Expected Result:** Home Screen displays project list with test project

### Step 2: Open Project
1. Double-click on project item for "Wind Farm Alpha"
2. Wait for project details to load (maximum 1 second as per performance requirements)
3. Verify navigation to Ongoing Project Screen

**Expected Result:** User is navigated to Ongoing Project Screen

### Step 3: Verify Powerplant Name Displayed
1. Verify Ongoing Project Screen displays powerplant name at top
2. Verify powerplant name is: "Wind Farm Alpha"
3. Verify powerplant name is prominently displayed (large text, top center)

**Expected Result:** Powerplant name is displayed correctly

### Step 4: Verify Parts List Displayed
1. Verify parts list is displayed in center section
2. Verify at least 5 parts are displayed
3. Verify each part shows:
   - Part name (heading)
   - List of checkups under the part
   - Each checkup shows checkup name/description
   - Status selector (three buttons: Bad, Average, Good)
   - Current status indicator (color-coded badge if status is set)

**Expected Result:** Parts list is displayed with all parts and checkups

### Step 5: Verify Checkup Statuses Displayed
1. Verify checkups with statuses show:
   - Status indicator (color-coded badge: red for bad, yellow for average, green for good)
   - Selected status button highlighted
   - Other status buttons dimmed
2. Verify checkups without status show:
   - All status buttons in neutral gray state
   - No status indicator displayed

**Expected Result:** Checkup statuses are displayed correctly

### Step 6: Verify Documentation Viewer
1. Verify documentation viewer panel is displayed on right side
2. Verify panel title: "Documentation"
3. Verify panel shows empty state or placeholder (no part selected yet)

**Expected Result:** Documentation viewer is displayed

### Step 7: Select Part and View Documentation
1. Click on a part that has documentation
2. Verify selected part is highlighted in parts list
3. Verify documentation viewer displays:
   - Image gallery with thumbnails (clickable for full view)
   - Text descriptions below images
4. Verify images are loaded and displayed correctly
5. Verify descriptions are readable

**Expected Result:** Documentation is displayed for selected part

### Step 8: Verify Finish Report Button
1. Verify "Finish Report" button is displayed in top right corner
2. Verify button is visible and enabled
3. Verify button is styled as primary action

**Expected Result:** Finish Report button is displayed and functional

### Step 9: Verify Back Button
1. Verify back button/arrow is displayed in top left
2. Verify back button is functional
3. Click back button (optional verification)
4. Verify navigation to Home Screen works

**Expected Result:** Back button is functional

### Step 10: Verify API Request
1. Verify API request was made to project details endpoint with project ID
2. Verify request included valid JWT token
3. Verify response time was less than 1 second
4. Verify response included all project data:
   - Powerplant information
   - Parts and checkups
   - Checkup statuses
   - Documentation metadata

**Expected Result:** API request was successful and efficient

## Test Data Requirements

### Database State
- Project exists with:
  - ID: `project-uuid-001`
  - User ID: `user-uuid-001`
  - Powerplant ID: `powerplant-uuid-alpha`
  - Status: "In Progress"
- Powerplant "Wind Farm Alpha" exists with:
  - At least 5 parts
  - Each part has at least 3 checkups
- Checkup statuses exist:
  - Some checkups have statuses (bad, average, good)
  - Some checkups have no status (null)
- Documentation exists:
  - At least 2 parts have documentation (images and descriptions)
  - Images are stored in file storage
  - Descriptions are stored in database

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Ongoing Project Screen displays correctly
- Powerplant name is displayed at top
- Parts list displays all parts with checkups
- Checkup statuses are displayed correctly (with indicators if set)
- Documentation viewer is functional
- Documentation is displayed when part is selected
- Finish Report button is visible and enabled
- Back button is functional
- Layout is responsive (three-column on desktop, adapted for tablet/mobile)

### API Outcomes
- Project details endpoint returns HTTP 200 (OK)
- Response includes all project data:
  - Powerplant name
  - Parts with checkups
  - Checkup statuses
  - Documentation metadata
- Response time is less than 1 second (as per performance requirements)

### Database Outcomes
- Database query retrieves project data
- Powerplant information is joined correctly
- Parts and checkups are retrieved
- Checkup statuses are retrieved
- Documentation metadata is retrieved
- Query performance is within acceptable limits

### Performance Outcomes
- Project details load within 1 second (as per performance requirements)
- Images load and display correctly
- Page rendering is smooth and responsive
- No performance degradation with multiple parts/checkups

## Cleanup Steps
1. Logout user (if session persists)
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)
4. Test project may remain in database for other tests (optional cleanup)

## Notes
- Project must be assigned to authenticated user (access control)
- All parts and checkups must be displayed
- Checkup statuses must be displayed correctly (set or unset)
- Documentation must be accessible when part is selected
- Images should be clickable to view full size
- Layout must be responsive for different screen sizes
