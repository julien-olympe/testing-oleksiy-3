# Test 13: Start New Project - Create Project Successfully

## Test ID
E2E-UC4-POS-001

## Test Name
Start New Project - Create Project Successfully

## Description
This test verifies that an authenticated user can successfully create a new inspection project by selecting a powerplant from available options. The system should create the project, assign it to the user, initialize checkup status records, and redirect to the Ongoing Project Screen.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Powerplant exists in database:
  - Powerplant ID: `powerplant-uuid-alpha`
  - Powerplant Name: "Wind Farm Alpha"
  - Parts: At least 5 parts with checkups
  - Each part has at least 3 checkups
- User is logged in and on Home Screen
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Start Project Screen
1. Verify user is logged in and on Home Screen
2. Click "Start Project" button
3. Verify navigation to Start Project Screen
4. Verify Start Project Screen displays:
   - Back button (top left)
   - Screen title: "Start New Project"
   - Powerplant selector dropdown
   - Preview section (initially hidden or empty)
   - "Create" button (initially disabled)

**Expected Result:** Start Project Screen is displayed correctly

### Step 2: Select Powerplant
1. Click on powerplant selector dropdown
2. Verify dropdown displays list of available powerplants
3. Select powerplant "Wind Farm Alpha" from dropdown
4. Verify selected powerplant is displayed in dropdown

**Expected Result:** Powerplant is selected successfully

### Step 3: Verify Preview Displayed
1. Verify preview section is displayed after powerplant selection
2. Verify preview title: "Parts and Checkups Preview"
3. Verify preview shows hierarchical structure:
   - Part names as parent items
   - Checkups under each part (indented)
4. Verify preview shows at least 5 parts
5. Verify each part shows at least 3 checkups
6. Verify preview is read-only (not editable)

**Expected Result:** Preview displays parts and checkups for selected powerplant

### Step 4: Verify Create Button Enabled
1. Verify "Create" button is now enabled (was disabled before powerplant selection)
2. Verify button is visible and clickable

**Expected Result:** Create button is enabled after powerplant selection

### Step 5: Create Project
1. Click "Create" button
2. Wait for project creation to complete (maximum 2 seconds as per performance requirements)
3. Verify loading state is shown (button shows spinner or loading indicator)

**Expected Result:** Project creation request is sent

### Step 6: Verify Project Created
1. Verify project is created in database with:
   - User assignment (current user ID)
   - Powerplant reference (selected powerplant ID)
   - Status set to "In Progress"
   - Creation timestamp set
2. Verify checkup status records are initialized for all checkups:
   - One status record per checkup in the project
   - Status values set to null/unset initially
   - Records linked to project and checkup

**Expected Result:** Project and checkup status records are created in database

### Step 7: Verify Redirect to Ongoing Project Screen
1. Verify user is redirected to Ongoing Project Screen
2. Verify Ongoing Project Screen displays:
   - Powerplant name: "Wind Farm Alpha" (at top)
   - Parts list with checkups
   - Documentation viewer panel
   - "Finish Report" button
   - Back button

**Expected Result:** User is redirected to Ongoing Project Screen for new project

### Step 8: Verify Project Data Loaded
1. Verify all parts are displayed in parts list
2. Verify all checkups are displayed under their respective parts
3. Verify checkup statuses are unset (no status selected)
4. Verify project is accessible and functional

**Expected Result:** Project data is loaded and displayed correctly

## Test Data Requirements

### Input Data
- **Selected Powerplant:** "Wind Farm Alpha" (powerplant-uuid-alpha)
- **User ID:** `user-uuid-001` (from authenticated session)

### Database State
- Powerplant "Wind Farm Alpha" exists with:
  - ID: `powerplant-uuid-alpha`
  - Name: "Wind Farm Alpha"
  - At least 5 parts, each with at least 3 checkups
- User exists and is authenticated
- No existing project for this user and powerplant (optional)

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Start Project Screen displays correctly
- Powerplant dropdown shows available powerplants
- Preview displays parts and checkups after selection
- Create button is enabled after powerplant selection
- Project creation completes successfully
- User is redirected to Ongoing Project Screen
- Ongoing Project Screen displays project data correctly

### API Outcomes
- Create project endpoint returns HTTP 201 (Created) or HTTP 200 (OK)
- Response includes project ID and project data
- Response time is less than 2 seconds (as per performance requirements)
- Project is created with correct user assignment

### Database Outcomes
- New project record is created in projects table with:
  - User ID: `user-uuid-001`
  - Powerplant ID: `powerplant-uuid-alpha`
  - Status: "In Progress"
  - Created at: current timestamp
- Checkup status records are initialized:
  - One record per checkup in the powerplant
  - Status values are null/unset
  - Records are linked to project and checkup

### Performance Outcomes
- Project creation completes within 2 seconds (as per performance requirements)
- Checkup status initialization is included in creation time
- Page navigation is smooth and responsive

## Cleanup Steps
1. Delete test project from database (project and checkup status records)
2. Logout user (if session persists)
3. Clear browser session and cookies
4. Close browser instance (if not reused for other tests)

## Notes
- Project creation must initialize checkup status records for all checkups
- Checkup statuses should be set to null/unset initially
- Project status must be set to "In Progress" upon creation
- User should be automatically redirected to Ongoing Project Screen
- Preview section helps user understand what will be created
- Create button should be disabled until powerplant is selected
