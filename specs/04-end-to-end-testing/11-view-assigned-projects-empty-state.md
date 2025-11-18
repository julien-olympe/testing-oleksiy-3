# Test 11: View Assigned Projects - Empty State

## Test ID
E2E-UC3-POS-002

## Test Name
View Assigned Projects - Empty State

## Description
This test verifies that the system correctly displays an empty state message when an authenticated user has no assigned projects. The empty state should provide guidance to the user on how to create a new project.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `newuser`
  - User ID: `user-uuid-new`
- No projects are assigned to test user in database
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

**Expected Result:** Projects list request completes

### Step 3: Verify Empty State Message Displayed
1. Verify empty state message is displayed
2. Verify message text is exactly: "You have no assigned projects. Click 'Start Project' to create one."
3. Verify message is displayed in appropriate location (center of projects list area)
4. Verify message is clearly visible and styled appropriately
5. Verify "Start Project" button is visible and functional

**Expected Result:** Empty state message is displayed correctly

### Step 4: Verify No Project Items Displayed
1. Verify no project items are displayed in the list
2. Verify projects list container is empty (except for empty state message)
3. Verify no error messages are displayed

**Expected Result:** No project items are displayed, only empty state message

### Step 5: Verify API Request
1. Verify API request was made to projects endpoint with user ID
2. Verify request included valid JWT token in Authorization header
3. Verify response time was less than 500 milliseconds
4. Verify response included empty array or no projects

**Expected Result:** API request was successful and returned empty result

### Step 6: Verify Start Project Button Functional
1. Verify "Start Project" button is visible and enabled
2. Click "Start Project" button (optional verification)
3. Verify navigation to Start Project Screen works (if clicked)

**Expected Result:** Start Project button is functional and provides path to create project

## Test Data Requirements

### Database State
- User with ID `user-uuid-new` exists in database
- No projects are assigned to user `user-uuid-new`
- Database connection is available
- Projects table is accessible

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- Home Screen displays correctly
- Empty state message is displayed with exact text: "You have no assigned projects. Click 'Start Project' to create one."
- Empty state message is clearly visible and styled appropriately
- No project items are displayed
- "Start Project" button is visible and functional
- No error messages displayed

### API Outcomes
- Projects endpoint returns HTTP 200 (OK)
- Response includes empty array `[]` or no projects
- Response time is less than 500 milliseconds
- Only projects assigned to authenticated user are queried (returns empty)

### Database Outcomes
- Database query retrieves projects assigned to user
- Query returns empty result (no projects found)
- Query performance is within acceptable limits

### Performance Outcomes
- Projects list loads within 500 milliseconds (as per performance requirements)
- Empty state is displayed immediately
- No performance issues with empty result

## Cleanup Steps
1. Logout user (if session persists)
2. Clear browser session and cookies
3. Close browser instance (if not reused for other tests)
4. Verify no test projects were created during test

## Notes
- Empty state message must match exact specification from functional requirements
- Empty state should provide clear guidance to user (how to create project)
- "Start Project" button should be prominently displayed and functional
- Empty state should not be treated as an error condition
- This test verifies user experience for new users with no projects
