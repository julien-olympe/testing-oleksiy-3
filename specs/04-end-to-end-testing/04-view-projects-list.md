# Use Case 3: View Projects List - E2E Test Scenarios

## Test Overview

**Test Name:** View Projects List - Complete Test Suite

**Description:** Comprehensive end-to-end tests for viewing the projects list on the Home screen, covering positive cases, negative cases, edge cases, and data display scenarios.

**Related Use Case:** Use Case 3: View Projects List

**Related Screen:** Screen 3: Home Screen

## Test Data Requirements

**Test User:**
- Username: `test_projects_user`
- Email: `test_projects@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Project Test Data:**
- User should have multiple projects in database:
  - At least 2 "In Progress" projects
  - At least 2 "Finished" projects
  - Projects with different powerplants
  - Projects created at different times
- User should have 0 projects (for empty state test)
- Another user should have projects (for isolation test)

## Test Scenarios

### TC-001: View Projects List - Success with Multiple Projects

**Description:** Verify projects list displays correctly with multiple projects.

**Prerequisites:**
- Application is running
- User is logged in
- User has at least 3 projects in database (mix of In Progress and Finished)

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed with:
     - Header bar with application title and user menu
     - Page title "My Projects"
     - "Start Project" button visible
     - Projects list area visible

2. Verify projects list display
   - **Action:** Wait for projects to load
   - **Expected Result:**
     - Projects list displays all user's projects
     - Each project item shows:
       - Powerplant name (bold, larger font)
       - Status badge (In Progress = orange/yellow, Finished = green)
       - Created date (smaller font, gray)
     - Projects are sorted by created_at (newest first)
     - Hover effect indicates clickability

**Assertions:**
- All user's projects are displayed
- No projects from other users are displayed
- Project items show correct powerplant names
- Status badges show correct colors
- Created dates are formatted correctly
- Projects are sorted correctly (newest first)
- Response time < 2 seconds
- Database query retrieves only user's projects (user_id filter)

---

### TC-002: View Projects List - Empty State

**Description:** Verify projects list displays empty state when user has no projects.

**Prerequisites:**
- Application is running
- User is logged in
- User has 0 projects in database

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed

2. Verify empty state
   - **Action:** Wait for projects to load
   - **Expected Result:**
     - Projects list area is visible
     - Empty state message is displayed: "No projects assigned"
     - "Start Project" button is still visible and enabled
     - No project items are displayed

**Assertions:**
- Empty state message is displayed correctly
- No project items are shown
- "Start Project" button is accessible
- Response time < 2 seconds
- Database query returns empty result set

---

### TC-003: View Projects List - Single Project

**Description:** Verify projects list displays correctly with single project.

**Prerequisites:**
- Application is running
- User is logged in
- User has exactly 1 project in database

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed

2. Verify single project display
   - **Action:** Wait for projects to load
   - **Expected Result:**
     - One project item is displayed
     - Project shows correct powerplant name
     - Project shows correct status badge
     - Project shows created date
     - Project is clickable

**Assertions:**
- Single project is displayed correctly
- All project information is visible
- Response time < 2 seconds

---

### TC-004: View Projects List - Status Badge Colors

**Description:** Verify status badges display correct colors for In Progress and Finished projects.

**Prerequisites:**
- Application is running
- User is logged in
- User has at least 1 "In Progress" project
- User has at least 1 "Finished" project

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed

2. Verify In Progress status badge
   - **Action:** Locate project with "In Progress" status
   - **Expected Result:**
     - Status badge displays "In Progress" text
     - Status badge has orange/yellow color
     - Badge is clearly visible

3. Verify Finished status badge
   - **Action:** Locate project with "Finished" status
   - **Expected Result:**
     - Status badge displays "Finished" text
     - Status badge has green color
     - Badge is clearly visible

**Assertions:**
- In Progress badges are orange/yellow
- Finished badges are green
- Status text is correct
- Color contrast is sufficient for readability
- Response time < 2 seconds

---

### TC-005: View Projects List - Sorting by Date

**Description:** Verify projects are sorted by created_at (newest first).

**Prerequisites:**
- Application is running
- User is logged in
- User has at least 3 projects created at different times

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed

2. Verify project order
   - **Action:** Check order of projects in list
   - **Expected Result:**
     - Projects are ordered by created_at descending (newest first)
     - Most recently created project appears at top
     - Oldest project appears at bottom

**Assertions:**
- Projects are sorted correctly
- Newest project is first
- Database query uses ORDER BY created_at DESC
- Response time < 2 seconds

---

### TC-006: View Projects List - Large Number of Projects

**Description:** Verify projects list handles large number of projects (100+).

**Prerequisites:**
- Application is running
- User is logged in
- User has 100+ projects in database

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed

2. Verify list display
   - **Action:** Wait for projects to load
   - **Expected Result:**
     - All projects are displayed (or paginated if implemented)
     - List is scrollable if all projects are shown
     - Performance is acceptable
     - No UI lag or freezing

**Assertions:**
- All projects are accessible (via scrolling or pagination)
- Response time < 2 seconds for up to 100 projects
- UI remains responsive
- Database query is optimized
- Memory usage is reasonable

---

### TC-007: View Projects List - User Isolation

**Description:** Verify users only see their own projects (not other users' projects).

**Prerequisites:**
- Application is running
- User A is logged in
- User A has projects in database
- User B has different projects in database

**Test Steps:**

1. Login as User A
   - **Action:** Login with User A credentials
   - **Expected Result:** User A is authenticated

2. Verify projects list
   - **Action:** View Home screen
   - **Expected Result:**
     - Only User A's projects are displayed
     - No projects from User B are displayed
     - Project count matches User A's project count

3. Verify database query
   - **Action:** Check database query (if possible)
   - **Expected Result:**
     - Query filters by user_id
     - Only User A's projects are retrieved

**Assertions:**
- User isolation is enforced
- Database query includes user_id filter
- No cross-user data leakage
- Response time < 2 seconds

---

### TC-008: View Projects List - Database Query Failure

**Description:** Verify graceful handling of database query failure.

**Prerequisites:**
- Application is running
- User is logged in
- Database connection can be interrupted (test environment)

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen
   - **Expected Result:** Home screen is displayed

2. Simulate database error
   - **Action:** Interrupt database connection (if possible in test environment)
   - **Expected Result:**
     - Error message is displayed: "Unable to load projects"
     - Empty list is shown (or error state)
     - User remains on Home screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- No sensitive error information is exposed
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-009: View Projects List - Session Expiration

**Description:** Verify redirect to login when session expires.

**Prerequisites:**
- Application is running
- User session has expired (or can be invalidated)

**Test Steps:**

1. Navigate to Home screen with expired session
   - **Action:** Attempt to access Home screen with expired/invalid session
   - **Expected Result:**
     - User is redirected to login screen
     - Error message may be displayed: "Session expired. Please login again."
     - No projects are displayed

**Assertions:**
- Session expiration is detected
- User is redirected to login
- No data is displayed
- Response time < 1 second

---

### TC-010: View Projects List - Loading State

**Description:** Verify loading indicator is displayed while projects are loading.

**Prerequisites:**
- Application is running
- User is logged in

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and navigate to Home screen
   - **Expected Result:** Home screen is displayed

2. Verify loading indicator
   - **Action:** Observe screen during project loading
   - **Expected Result:**
     - Loading indicator appears while projects are being fetched
     - Loading indicator disappears when projects are loaded
     - Projects list appears after loading completes

**Assertions:**
- Loading indicator is visible during fetch
- Loading indicator disappears after load
- User experience is smooth
- Response time < 2 seconds

---

### TC-011: View Projects List - Responsive Design

**Description:** Verify projects list displays correctly on different screen sizes.

**Prerequisites:**
- Application is running
- User is logged in
- User has multiple projects
- Browser can be resized or device emulation available

**Test Steps:**

1. Test desktop layout (1024px+)
   - **Action:** View Home screen on desktop size
   - **Expected Result:**
     - Projects list uses grid layout (2-3 columns)
     - Project items are properly sized
     - All information is visible

2. Test tablet layout (768px - 1023px)
   - **Action:** Resize to tablet size
   - **Expected Result:**
     - Projects list uses grid layout (2 columns)
     - Project items are readable
     - Layout adapts correctly

3. Test mobile layout (< 768px)
   - **Action:** Resize to mobile size
   - **Expected Result:**
     - Projects list uses single column layout
     - Project items are full-width
     - Touch targets are adequate (minimum 44px height)
     - All information is accessible

**Assertions:**
- Layout adapts to screen size
- All information is accessible on all sizes
- Touch targets are adequate on mobile
- No horizontal scrolling on mobile
- Response time < 2 seconds

---

### TC-012: View Projects List - Project Item Hover Effect

**Description:** Verify hover effect indicates project items are clickable.

**Prerequisites:**
- Application is running
- User is logged in
- User has at least 1 project

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed

2. Hover over project item
   - **Action:** Move mouse over a project item
   - **Expected Result:**
     - Hover effect is applied (e.g., background color change, border highlight)
     - Cursor changes to pointer
     - Visual feedback indicates clickability

3. Remove hover
   - **Action:** Move mouse away from project item
   - **Expected Result:**
     - Hover effect is removed
     - Project item returns to normal state

**Assertions:**
- Hover effect is visible
- Hover effect clearly indicates clickability
- Effect is smooth and responsive
- Response time < 100ms

---

### TC-013: View Projects List - Project Item Double-Click

**Description:** Verify double-clicking project item opens project (covered in Use Case 4).

**Prerequisites:**
- Application is running
- User is logged in
- User has at least 1 project

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen is displayed

2. Double-click project item
   - **Action:** Double-click on a project item
   - **Expected Result:**
     - Navigation to Ongoing Project screen occurs
     - Project details are loaded
     - (Detailed in Use Case 4 test file)

**Assertions:**
- Double-click triggers navigation
- Project opens correctly
- Response time < 3 seconds (includes project load)

---

## Performance Requirements

- Home screen load: < 2 seconds for up to 100 projects
- Database query: < 500ms for up to 100 projects
- Project list rendering: < 1 second
- Empty state display: < 1 second
- Loading indicator display: Immediate

## Security Requirements

- User isolation enforced (users only see own projects)
- Session validation on every request
- SQL injection prevention (parameterized queries)
- No sensitive data in error messages

## Cleanup

After test execution:
- Logout test users
- Clean up test projects (if using test database)
- Verify database state
