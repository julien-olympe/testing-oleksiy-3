# Test 20: Set Checkup Status - Update Status Successfully

## Test ID
E2E-UC6-POS-001

## Test Name
Set Checkup Status - Update Status Successfully

## Description
This test verifies that an authenticated user can successfully set the status of a checkup within an ongoing project. The status can be set to bad, average, or good, and the status is immediately saved to the database with visual feedback.

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
  - Checkup exists with ID: `checkup-uuid-001`
  - Checkup currently has no status (null/unset)
- User is logged in and viewing Ongoing Project Screen for test project
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Ongoing Project Screen
1. Verify user is logged in and on Ongoing Project Screen
2. Verify project "Wind Farm Alpha" is displayed
3. Verify parts list is displayed with checkups
4. Locate checkup with ID `checkup-uuid-001`

**Expected Result:** Ongoing Project Screen displays project with checkups

### Step 2: Verify Initial Checkup Status
1. Verify checkup `checkup-uuid-001` is displayed
2. Verify checkup shows three status buttons: Bad, Average, Good
3. Verify all status buttons are in neutral gray state (no status selected)
4. Verify no status indicator is displayed

**Expected Result:** Checkup has no status set initially

### Step 3: Set Checkup Status to "Good"
1. Click on "Good" status button for checkup `checkup-uuid-001`
2. Wait for status update to complete (maximum 300 milliseconds as per performance requirements)
3. Verify loading state is shown (button shows loading indicator or disabled state)

**Expected Result:** Status update request is sent

### Step 4: Verify Visual Feedback
1. Verify "Good" status button is highlighted/selected
2. Verify "Bad" and "Average" buttons are dimmed/disabled
3. Verify status indicator (badge) is displayed with green color
4. Verify status indicator shows "Good" text or icon
5. Verify visual update occurs immediately

**Expected Result:** Visual feedback confirms status is set to "Good"

### Step 5: Verify Status Saved to Database
1. Query database for checkup status record
2. Verify status record exists for checkup `checkup-uuid-001` in project `project-uuid-001`
3. Verify status value is "good"
4. Verify timestamp is saved (updated_at or created_at)

**Expected Result:** Status is saved correctly in database

### Step 6: Test Setting Status to "Average"
1. Click on "Average" status button for the same checkup
2. Wait for status update to complete
3. Verify "Average" button is highlighted
4. Verify "Good" and "Bad" buttons are dimmed
5. Verify status indicator changes to yellow color with "Average" text
6. Verify database status is updated to "average"

**Expected Result:** Status can be changed and updated correctly

### Step 7: Test Setting Status to "Bad"
1. Click on "Bad" status button for the same checkup
2. Wait for status update to complete
3. Verify "Bad" button is highlighted
4. Verify "Average" and "Good" buttons are dimmed
5. Verify status indicator changes to red color with "Bad" text
6. Verify database status is updated to "bad"

**Expected Result:** Status can be changed to "Bad" and updated correctly

### Step 8: Verify API Request
1. Verify API request was made to update checkup status endpoint
2. Verify request included:
   - Project ID: `project-uuid-001`
   - Checkup ID: `checkup-uuid-001`
   - Status value: "bad", "average", or "good"
   - Valid JWT token
3. Verify response time was less than 300 milliseconds
4. Verify response indicates success

**Expected Result:** API request was successful and efficient

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-001` (from current project)
- **Checkup ID:** `checkup-uuid-001` (checkup to update)
- **Status Values:** "bad", "average", "good" (test all three)

### Database State
- Project exists with status "In Progress"
- Checkup exists and belongs to project's powerplant
- Checkup status record may exist (null or previously set value)

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Status buttons are displayed for each checkup
- Clicking status button immediately updates visual indicator
- Selected button is highlighted, other buttons are dimmed
- Status indicator (badge) displays correct color:
  - Red for "bad"
  - Yellow for "average"
  - Green for "good"
- Visual feedback is immediate and clear

### API Outcomes
- Update checkup status endpoint returns HTTP 200 (OK) or HTTP 204 (No Content)
- Response indicates success
- Response time is less than 300 milliseconds (as per performance requirements)
- Status is updated correctly

### Database Outcomes
- Checkup status record is created or updated in database
- Status value is stored correctly ("bad", "average", or "good")
- Timestamp is saved (updated_at or created_at)
- Status is linked to correct project and checkup

### Performance Outcomes
- Status update completes within 300 milliseconds (as per performance requirements)
- Visual feedback is immediate
- No performance degradation with multiple status updates

## Cleanup Steps
1. Optionally reset checkup status to null (if needed for other tests)
2. Logout user (if session persists)
3. Clear browser session and cookies
4. Close browser instance (if not reused for other tests)

## Notes
- Status updates must be saved immediately (no draft mode)
- Visual feedback must be immediate and clear
- Status can be changed multiple times (user can update status)
- All three status values (bad, average, good) must be testable
- Status updates must persist even if user navigates away and returns
- Status buttons should be clearly labeled and color-coded
