# Use Case 7: Create Project - E2E Test Scenarios

## Test Overview

**Test Name:** Create Project - Complete Test Suite

**Description:** Comprehensive end-to-end tests for creating a new project, covering positive cases, negative cases, and data validation scenarios.

**Related Use Case:** Use Case 7: Create Project

**Related Screen:** Screen 4: Start Project Screen

## Test Data Requirements

**Test User:**
- Username: `test_create_user`
- Email: `test_create@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Powerplant Test Data:**
- At least one powerplant exists in database
- Powerplant has parts and checkups configured

## Test Scenarios

### TC-001: Create Project - Success

**Description:** Verify successfully creating a new project with selected powerplant.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant is selected

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant
   - **Action:** Select a powerplant from dropdown
   - **Expected Result:**
     - Powerplant is selected
     - Parts and checkups are displayed
     - "Create" button is enabled

3. Create project
   - **Action:** Click "Create" button
   - **Expected Result:**
     - Form is submitted
     - Loading indicator appears (if applicable)
     - Project is created in database
     - User is redirected to Home screen
     - Project list is refreshed

4. Verify project in list
   - **Action:** Wait for Home screen to load
   - **Expected Result:**
     - Home screen displays updated project list
     - New project appears in list with:
       - Powerplant name displayed correctly
       - Status badge showing "In Progress" (orange/yellow color)
       - Created date displayed
       - Project is clickable

**Assertions:**
- Project record is created in database with:
  - `user_id` matches logged-in user
  - `powerplant_id` matches selected powerplant
  - `status` = "In Progress"
  - `created_at` is set to current timestamp
  - `finished_at` is NULL
- User is redirected to Home screen
- Project appears in user's project list
- Response time < 500ms for project creation
- Database save operation succeeds

---

### TC-002: Create Project - Powerplant Not Selected

**Description:** Verify error handling when Create button is clicked without selecting powerplant.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- No powerplant is selected (if possible to click Create without selection)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Attempt to create without selection
   - **Action:** Attempt to click "Create" button (if enabled) or verify it's disabled
   - **Expected Result:**
     - If button is disabled: Button cannot be clicked
     - If button is enabled: Error message is displayed: "Please select a powerplant"
     - User remains on Start Project screen
     - No project is created

**Assertions:**
- "Create" button is disabled when no powerplant is selected (preferred)
- Or error message is displayed if button is clicked
- No project is created
- User remains on Start Project screen
- Response time < 500ms

---

### TC-003: Create Project - Invalid Powerplant ID

**Description:** Verify error handling when selected powerplant ID is invalid.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Invalid powerplant ID can be submitted (test environment)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Attempt to create with invalid powerplant
   - **Action:** Attempt to create project with invalid powerplant ID (if possible via manipulation)
   - **Expected Result:**
     - Error message is displayed: "Invalid powerplant ID"
     - User remains on Start Project screen
     - No project is created

**Assertions:**
- Invalid powerplant ID is rejected
- Error message is displayed
- No project is created
- Response time < 500ms

---

### TC-004: Create Project - Database Save Failure

**Description:** Verify graceful handling of database save failure.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant is selected
- Database connection can be interrupted (test environment)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant
   - **Action:** Select a powerplant
   - **Expected Result:** Powerplant is selected

3. Simulate database error
   - **Action:** Interrupt database connection, then click "Create" button
   - **Expected Result:**
     - Error message is displayed: "Unable to create project"
     - User remains on Start Project screen
     - No project is created
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- No sensitive error information is exposed
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-005: Create Project - Session Expiration

**Description:** Verify redirect to login when session expires during project creation.

**Prerequisites:**
- Application is running
- User session has expired (or can be invalidated)
- User is on Start Project screen

**Test Steps:**

1. Attempt to create project with expired session
   - **Action:** Click "Create" button with expired/invalid session
   - **Expected Result:**
     - User is redirected to login screen
     - Error message may be displayed: "Session expired. Please login again."
     - No project is created

**Assertions:**
- Session expiration is detected
- User is redirected to login
- No project is created
- Response time < 1 second

---

### TC-006: Create Project - Multiple Projects

**Description:** Verify user can create multiple projects.

**Prerequisites:**
- Application is running
- User is logged in
- User has existing projects

**Test Steps:**

1. Create first project
   - **Action:** Create a project with Powerplant A
   - **Expected Result:** Project is created and appears in list

2. Create second project
   - **Action:** Click "Start Project" again, select Powerplant B, click "Create"
   - **Expected Result:**
     - Second project is created
     - Both projects appear in project list
     - Projects are distinct (different IDs, powerplants)

**Assertions:**
- Multiple projects can be created
- Each project has unique ID
- Projects are correctly assigned to user
- Projects appear in list
- Response time < 500ms per project

---

### TC-007: Create Project - Project Status Initialization

**Description:** Verify new project is created with correct initial status.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant is selected

**Test Steps:**

1. Create project
   - **Action:** Select powerplant and click "Create"
   - **Expected Result:** Project is created

2. Verify project status
   - **Action:** Check project in database and UI
   - **Expected Result:**
     - Project status is "In Progress"
     - Status badge shows "In Progress" (orange/yellow)
     - `finished_at` is NULL

**Assertions:**
- Project status is "In Progress"
- `finished_at` is NULL
- Status badge is correct
- Response time < 500ms

---

### TC-008: Create Project - Timestamp Verification

**Description:** Verify project timestamps are set correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant is selected

**Test Steps:**

1. Create project
   - **Action:** Select powerplant and click "Create"
   - **Expected Result:** Project is created

2. Verify timestamps
   - **Action:** Check project in database
   - **Expected Result:**
     - `created_at` is set to current timestamp
     - `updated_at` is set to current timestamp
     - `finished_at` is NULL
     - Timestamps are accurate (within reasonable tolerance)

**Assertions:**
- `created_at` is set correctly
- `updated_at` is set correctly
- `finished_at` is NULL
- Timestamps are accurate
- Response time < 500ms

---

### TC-009: Create Project - User Assignment

**Description:** Verify project is correctly assigned to creating user.

**Prerequisites:**
- Application is running
- User A is logged in
- User A is on Start Project screen
- Powerplant is selected

**Test Steps:**

1. Create project as User A
   - **Action:** User A selects powerplant and clicks "Create"
   - **Expected Result:** Project is created

2. Verify user assignment
   - **Action:** Check project in database
   - **Expected Result:**
     - Project `user_id` matches User A's ID
     - Project appears in User A's project list
     - Project does not appear in other users' lists

**Assertions:**
- Project is assigned to correct user
- User assignment is enforced
- Project isolation is maintained
- Response time < 500ms

---

### TC-010: Create Project - Project List Refresh

**Description:** Verify project list is refreshed after project creation.

**Prerequisites:**
- Application is running
- User is logged in
- User has existing projects

**Test Steps:**

1. Note current project count
   - **Action:** View Home screen and count projects
   - **Expected Result:** Current project count is noted

2. Create new project
   - **Action:** Create a new project
   - **Expected Result:** Project is created

3. Verify list refresh
   - **Action:** Check Home screen project list
   - **Expected Result:**
     - Project list is refreshed
     - New project appears in list
     - Project count increased by 1
     - New project is at top of list (newest first)

**Assertions:**
- Project list is refreshed
- New project appears immediately
- List order is correct (newest first)
- Response time < 2 seconds (including redirect and list load)

---

### TC-011: Create Project - Concurrent Creation

**Description:** Verify system handles concurrent project creation correctly.

**Prerequisites:**
- Application is running
- User is logged in
- Multiple browser tabs or concurrent requests possible

**Test Steps:**

1. Create multiple projects concurrently
   - **Action:** Create 2-3 projects in quick succession (or concurrently if possible)
   - **Expected Result:**
     - All projects are created successfully
     - Each project has unique ID
     - All projects appear in list
     - No conflicts or errors

**Assertions:**
- Concurrent creation works correctly
- Each project is unique
- No database conflicts
- All projects are saved
- Response time < 500ms per project

---

## Performance Requirements

- Project creation: < 500ms
- Database save: < 300ms
- Redirect to Home: < 1 second
- Project list refresh: < 2 seconds
- Total operation: < 2 seconds

## Security Requirements

- Session validation on every request
- User assignment enforced (user_id from session)
- SQL injection prevention (parameterized queries)
- No sensitive data in error messages
- User authentication required

## Cleanup

After test execution:
- Logout test users
- Delete test projects (if using test database)
- Verify database state
