# Test 10: View Assigned Projects - Display Projects List

## Test ID
E2E-UC3-POS-001

## Test Name
View Assigned Projects - Display Projects List

## Description
This test verifies that an authenticated user can successfully view a list of all projects assigned to them. The list should display project information including powerplant name, current status (In Progress or Finished), and creation date, sorted by creation date (newest first).

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Test projects exist in database assigned to test user:
  - Project 1: Powerplant "Wind Farm Alpha", Status "In Progress", Created 2 days ago
  - Project 2: Powerplant "Wind Farm Beta", Status "Finished", Created 1 day ago
  - Project 3: Powerplant "Wind Farm Gamma", Status "In Progress", Created today
- User is logged in and on Home Screen
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Home Screen
1. Verify user is logged in (session token is valid)
2. Navigate to Home Screen (or verify already on Home Screen)
3. Verify Home Screen displays:
   - Header with application title/logo
   - User information in header (username or email)
   - Logout button in header
   - "Start Project" button

**Expected Result:** Home Screen is displayed correctly with authenticated user information

### Step 2: Verify Projects List Loaded
1. Wait for projects list to load (maximum 500 milliseconds as per performance requirements)
2. Verify projects list container is displayed
3. Verify loading indicator disappears (if shown)

**Expected Result:** Projects list is loaded and displayed

### Step 3: Verify Project Items Displayed
1. Verify project list contains 3 project items
2. Verify each project item displays:
   - Powerplant name (large text)
   - Status badge (In Progress = orange/yellow, Finished = green)
   - Creation date (small text)
   - Project item is clickable (double-click to open)

**Expected Result:** All project items are displayed with correct information

### Step 4: Verify Project 1 Details
1. Locate project item for "Wind Farm Alpha"
2. Verify powerplant name is displayed: "Wind Farm Alpha"
3. Verify status badge is displayed with text "In Progress" and orange/yellow color
4. Verify creation date is displayed (2 days ago)
5. Verify project item is visible and clickable

**Expected Result:** Project 1 details are displayed correctly

### Step 5: Verify Project 2 Details
1. Locate project item for "Wind Farm Beta"
2. Verify powerplant name is displayed: "Wind Farm Beta"
3. Verify status badge is displayed with text "Finished" and green color
4. Verify creation date is displayed (1 day ago)
5. Verify project item is visible and clickable

**Expected Result:** Project 2 details are displayed correctly

### Step 6: Verify Project 3 Details
1. Locate project item for "Wind Farm Gamma"
2. Verify powerplant name is displayed: "Wind Farm Gamma"
3. Verify status badge is displayed with text "In Progress" and orange/yellow color
4. Verify creation date is displayed (today)
5. Verify project item is visible and clickable

**Expected Result:** Project 3 details are displayed correctly

### Step 7: Verify Projects Sorted Correctly
1. Verify projects are sorted by creation date (newest first)
2. Verify "Wind Farm Gamma" (created today) appears first
3. Verify "Wind Farm Beta" (created 1 day ago) appears second
4. Verify "Wind Farm Alpha" (created 2 days ago) appears third

**Expected Result:** Projects are sorted correctly by creation date (newest first)

### Step 8: Verify API Request
1. Verify API request was made to projects endpoint with user ID
2. Verify request included valid JWT token in Authorization header
3. Verify response time was less than 500 milliseconds
4. Verify response included all assigned projects

**Expected Result:** API request was successful and efficient

## Test Data Requirements

### Database State
- User with ID `user-uuid-001` exists in database
- Project 1:
  - ID: `project-uuid-001`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant ID: `powerplant-uuid-alpha`
  - Powerplant Name: "Wind Farm Alpha"
  - Status: "In Progress"
  - Created at: 2 days ago
- Project 2:
  - ID: `project-uuid-002`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant ID: `powerplant-uuid-beta`
  - Powerplant Name: "Wind Farm Beta"
  - Status: "Finished"
  - Created at: 1 day ago
- Project 3:
  - ID: `project-uuid-003`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant ID: `powerplant-uuid-gamma`
  - Powerplant Name: "Wind Farm Gamma"
  - Status: "In Progress"
  - Created at: today

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Home Screen displays correctly
- Projects list is displayed with all assigned projects
- Each project item shows:
  - Powerplant name
  - Status badge with correct color (orange/yellow for In Progress, green for Finished)
  - Creation date
- Projects are sorted by creation date (newest first)
- Project items are clickable (double-click to open)
- No error messages displayed

### API Outcomes
- Projects endpoint returns HTTP 200 (OK)
- Response includes array of project objects
- Each project object includes:
  - Project ID
  - Powerplant name
  - Status (In Progress or Finished)
  - Creation date
- Response time is less than 500 milliseconds
- Only projects assigned to authenticated user are returned

### Database Outcomes
- Database query retrieves all projects assigned to user
- Powerplant information is joined correctly
- Projects are sorted by creation date (newest first)
- Query performance is within acceptable limits

### Performance Outcomes
- Projects list loads within 500 milliseconds (as per performance requirements)
- Page rendering is smooth and responsive
- No performance degradation with multiple projects

## Cleanup Steps
1. Logout user (if session persists)
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)
4. Test projects may remain in database for other tests (optional cleanup)

## Notes
- Projects must be filtered by user ID to ensure users only see their assigned projects
- Status badges must use correct colors: orange/yellow for In Progress, green for Finished
- Projects must be sorted by creation date (newest first) as per functional requirements
- Project items should be double-clickable to open project details
- Empty state should be handled separately (see test 11)
