# Use Case 4: Open Project - E2E Test Scenarios

## Test Overview

**Test Name:** Open Project - Complete Test Suite

**Description:** Comprehensive end-to-end tests for opening and viewing project details, covering positive cases, negative cases, edge cases, and data loading scenarios.

**Related Use Case:** Use Case 4: Open Project

**Related Screen:** Screen 5: Ongoing Project Screen

## Test Data Requirements

**Test User:**
- Username: `test_open_user`
- Email: `test_open@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Project Test Data:**
- User has at least 1 "In Progress" project
- Project references a powerplant with:
  - At least 2 parts
  - At least 2 checkups per part
  - At least 1 checkup with documentation (images and text)
- User has at least 1 "Finished" project
- Another user has a project (for access control test)
- Project with no checkup statuses set
- Project with some checkup statuses set

## Test Scenarios

### TC-001: Open Project - Success (In Progress)

**Description:** Verify successfully opening an In Progress project.

**Prerequisites:**
- Application is running
- User is logged in
- User has an "In Progress" project in database
- Project has powerplant with parts and checkups

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen displays projects list

2. Double-click project item
   - **Action:** Double-click on an "In Progress" project item
   - **Expected Result:**
     - Navigation to Ongoing Project screen occurs
     - Loading indicator appears (if applicable)

3. Verify Ongoing Project screen
   - **Action:** Wait for screen to load
   - **Expected Result:** Ongoing Project screen displays:
     - Powerplant name as large heading at top
     - "Finish Report" button visible in top right (enabled)
     - Parts list in left/middle column:
       - All parts from powerplant are listed
       - Each part shows associated checkups
       - Checkups show their names
       - Status indicators show current status (or "unset" if not set)
     - Documentation panel on right side (initially empty or showing default)

**Assertions:**
- Project ID is correctly retrieved from clicked item
- Project data is loaded from database
- Powerplant data is loaded correctly
- All parts are displayed
- All checkups are displayed
- Checkup statuses are loaded (if any are set)
- User has access to project (user_id matches)
- Response time < 3 seconds for powerplant with 100 checkups
- Database queries are optimized (joins used where appropriate)

---

### TC-002: Open Project - Success (Finished)

**Description:** Verify successfully opening a Finished project.

**Prerequisites:**
- Application is running
- User is logged in
- User has a "Finished" project in database

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen displays projects list

2. Double-click finished project
   - **Action:** Double-click on a "Finished" project item
   - **Expected Result:**
     - Navigation to Ongoing Project screen occurs
     - Screen loads successfully

3. Verify Finished project display
   - **Action:** Wait for screen to load
   - **Expected Result:** Ongoing Project screen displays:
     - Powerplant name
     - All parts and checkups
     - All status values (read-only)
     - "Finish Report" button is disabled or hidden
     - Documentation is accessible

**Assertions:**
- Finished project opens correctly
- All data is displayed
- Status values cannot be modified (if UI enforces)
- Response time < 3 seconds

---

### TC-003: Open Project - Project Not Found

**Description:** Verify error handling when project does not exist.

**Prerequisites:**
- Application is running
- User is logged in
- Project with invalid/non-existent ID

**Test Steps:**

1. Attempt to open non-existent project
   - **Action:** Attempt to navigate to project with invalid ID (e.g., via URL manipulation or deleted project)
   - **Expected Result:**
     - Error message is displayed: "Project not found"
     - User is redirected to Home screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- User is redirected appropriately
- No sensitive error information is exposed
- Response time < 1 second

---

### TC-004: Open Project - Access Denied

**Description:** Verify access control prevents opening other users' projects.

**Prerequisites:**
- Application is running
- User A is logged in
- User B has a project in database
- User A does not have access to User B's project

**Test Steps:**

1. Attempt to open another user's project
   - **Action:** Attempt to access User B's project (e.g., via URL manipulation with User B's project ID)
   - **Expected Result:**
     - Access is denied
     - Error message is displayed: "Access denied" or "Project not found"
     - User is redirected to Home screen
     - No project data is displayed

**Assertions:**
- Access control is enforced
- User cannot access other users' projects
- Database query includes user_id verification
- Error message is appropriate
- Response time < 1 second

---

### TC-005: Open Project - Database Query Failure

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
   - **Action:** Interrupt database connection, then double-click project
   - **Expected Result:**
     - Error message is displayed: "Unable to load project"
     - User is redirected to Home screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- No sensitive error information is exposed
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-006: Open Project - Session Expiration

**Description:** Verify redirect to login when session expires during project load.

**Prerequisites:**
- Application is running
- User session has expired (or can be invalidated)

**Test Steps:**

1. Attempt to open project with expired session
   - **Action:** Attempt to access project with expired/invalid session
   - **Expected Result:**
     - User is redirected to login screen
     - Error message may be displayed: "Session expired. Please login again."
     - No project data is displayed

**Assertions:**
- Session expiration is detected
- User is redirected to login
- No data is displayed
- Response time < 1 second

---

### TC-007: Open Project - Powerplant Data Loading

**Description:** Verify powerplant data is loaded correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has a project with powerplant data

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify powerplant name
   - **Action:** Check powerplant name display
   - **Expected Result:**
     - Powerplant name is displayed as large heading
     - Powerplant name matches database value
     - Name is correctly formatted

**Assertions:**
- Powerplant data is retrieved correctly
- Powerplant name is displayed accurately
- Response time < 1 second

---

### TC-008: Open Project - Parts and Checkups Loading

**Description:** Verify all parts and checkups are loaded and displayed correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has a project with powerplant containing multiple parts and checkups

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify parts display
   - **Action:** Check parts list
   - **Expected Result:**
     - All parts from powerplant are displayed
     - Parts are organized clearly (expandable/collapsible sections)
     - Part names are displayed correctly
     - Display order is correct (if specified)

3. Verify checkups display
   - **Action:** Check checkups under each part
   - **Expected Result:**
     - All checkups for each part are displayed
     - Checkup names are displayed correctly
     - Checkups are associated with correct parts
     - Display order is correct (if specified)

**Assertions:**
- All parts are loaded from database
- All checkups are loaded from database
- Relationships are maintained (checkups belong to correct parts)
- Display order is correct
- Response time < 3 seconds for 100 checkups

---

### TC-009: Open Project - Checkup Statuses Loading

**Description:** Verify checkup statuses are loaded and displayed correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has a project with some checkup statuses set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify status indicators
   - **Action:** Check status indicators for checkups
   - **Expected Result:**
     - Checkups with status set show correct status indicator:
       - "bad" = red color
       - "average" = yellow/orange color
       - "good" = green color
     - Checkups without status show "unset" (gray)
     - Status indicators are clearly visible

**Assertions:**
- CheckupStatus records are loaded correctly
- Status values match database values
- Status indicators show correct colors
- Unset checkups are clearly indicated
- Response time < 3 seconds

---

### TC-010: Open Project - Documentation References

**Description:** Verify documentation references are available (read-only display during project creation).

**Prerequisites:**
- Application is running
- User is logged in
- User has a project with powerplant containing checkups with documentation

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify documentation indicators
   - **Action:** Check for documentation indicators on checkups
   - **Expected Result:**
     - Checkups with documentation show indicators (icons or text)
     - Documentation is accessible when checkup is selected
     - (Documentation viewing is tested in Use Case 10)

**Assertions:**
- Documentation references are available
- Indicators are visible for checkups with documentation
- Response time < 3 seconds

---

### TC-011: Open Project - Large Number of Checkups

**Description:** Verify project opens correctly with large number of checkups (100+).

**Prerequisites:**
- Application is running
- User is logged in
- User has a project with powerplant containing 100+ checkups

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify performance
   - **Action:** Wait for all data to load
   - **Expected Result:**
     - All parts and checkups are displayed
     - Performance is acceptable
     - No UI lag or freezing
     - List is scrollable

**Assertions:**
- All checkups are loaded
- Response time < 3 seconds for 100 checkups
- UI remains responsive
- Database queries are optimized
- Memory usage is reasonable

---

### TC-012: Open Project - Missing Powerplant Data

**Description:** Verify error handling when powerplant data is missing.

**Prerequisites:**
- Application is running
- User is logged in
- Project references a powerplant that no longer exists (or can be deleted in test)

**Test Steps:**

1. Attempt to open project with missing powerplant
   - **Action:** Double-click project item with missing powerplant reference
   - **Expected Result:**
     - Error message is displayed: "Missing powerplant data"
     - User is redirected to Home screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- User is redirected appropriately
- Response time < 1 second

---

### TC-013: Open Project - Missing Parts/Checkups

**Description:** Verify handling when powerplant has no parts or checkups.

**Prerequisites:**
- Application is running
- User is logged in
- User has a project with powerplant that has no parts (or can be created in test)

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify empty state
   - **Action:** Check parts/checkups area
   - **Expected Result:**
     - Message is displayed: "No parts configured for this powerplant"
     - Or empty parts list is shown
     - Screen remains functional

**Assertions:**
- Empty state is handled gracefully
- Appropriate message is displayed
- Screen remains functional
- Response time < 3 seconds

---

### TC-014: Open Project - Navigation Back to Home

**Description:** Verify navigation back to Home screen works correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has a project open

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Navigate back to Home
   - **Action:** Click "Back" or "Home" link/button
   - **Expected Result:**
     - User is redirected to Home screen
     - Projects list is displayed
     - No data is lost

**Assertions:**
- Navigation works correctly
- Home screen is displayed
- Response time < 1 second

---

## Performance Requirements

- Ongoing Project screen load: < 3 seconds for powerplant with 100 checkups
- Database query for project data: < 1 second
- Parts/checkups loading: < 2 seconds
- Status indicators rendering: < 500ms
- Documentation loading: < 500ms for 5 images

## Security Requirements

- Access control enforced (users only access own projects)
- Session validation on every request
- SQL injection prevention (parameterized queries)
- No sensitive data in error messages
- User_id verification in database queries

## Cleanup

After test execution:
- Logout test users
- Clean up test projects (if using test database)
- Verify database state
