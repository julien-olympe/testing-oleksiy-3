# Test 14: Start New Project - No Powerplant Selected

## Test ID
E2E-UC4-NEG-001

## Test Name
Start New Project - No Powerplant Selected Error

## Description
This test verifies that the system correctly prevents project creation when no powerplant is selected. The system should display an appropriate error message and not create a project.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- User is logged in and on Home Screen
- Browser is open with active session

## Test Steps

### Step 1: Navigate to Start Project Screen
1. Verify user is logged in and on Home Screen
2. Click "Start Project" button
3. Verify navigation to Start Project Screen
4. Verify Start Project Screen displays:
   - Powerplant selector dropdown (empty/placeholder)
   - Preview section (hidden or empty)
   - "Create" button (disabled)

**Expected Result:** Start Project Screen is displayed correctly

### Step 2: Attempt to Create Project Without Selection
1. Verify no powerplant is selected (dropdown shows placeholder or empty)
2. Verify "Create" button is disabled
3. Attempt to click "Create" button (should be disabled, but test if clickable)
4. OR: If button is enabled, click it to trigger validation

**Expected Result:** Create button is disabled or validation prevents submission

### Step 3: Verify Error Handling
1. If button was clickable, verify error message is displayed
2. Verify error message text is exactly: "Please select a powerplant."
3. Verify error message is displayed in appropriate location (below dropdown or form area)
4. Verify error message is styled appropriately (red text, visible)
5. If button was disabled, verify it remains disabled

**Expected Result:** Error is handled appropriately (button disabled or error message shown)

### Step 4: Verify No Project Created
1. Query database for projects created by test user
2. Verify no new project was created during this test
3. Verify project count remains unchanged

**Expected Result:** No project is created

### Step 5: Verify Form State
1. Verify powerplant dropdown remains empty/unselected
2. Verify preview section remains hidden or empty
3. Verify "Create" button remains disabled (or becomes disabled after error)
4. Verify user remains on Start Project Screen

**Expected Result:** Form state is maintained, user can correct and retry

## Test Data Requirements

### Input Data
- **Selected Powerplant:** None (no selection made)
- **User ID:** `user-uuid-001` (from authenticated session)

### Database State
- User exists and is authenticated
- Powerplants exist in database (but none selected)
- No project should be created

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Start Project Screen displays correctly
- Powerplant dropdown is empty/unselected
- Preview section is hidden or empty
- "Create" button is disabled
- Error message "Please select a powerplant." is displayed (if validation allows submission)
- User remains on Start Project Screen

### API Outcomes
- Create project endpoint returns HTTP 400 (Bad Request) if request reaches server
- Response includes error message: "Please select a powerplant."
- No project is created
- OR: Client-side validation prevents form submission (acceptable alternative)

### Database Outcomes
- No new project record is created
- Database remains unchanged
- No checkup status records are created

### Performance Outcomes
- Validation occurs immediately (client-side) or within 1 second (server-side)
- Error message is displayed promptly

## Cleanup Steps
1. Verify no test project was created
2. Logout user (if session persists)
3. Clear browser session and cookies
4. Close browser instance (if not reused for other tests)

## Notes
- Validation may occur on client-side (button disabled) or server-side (error message)
- Both approaches are acceptable, but client-side validation provides better UX
- Error message must match exact specification from functional requirements
- User should be able to select powerplant and retry
- This test verifies form validation and user guidance
