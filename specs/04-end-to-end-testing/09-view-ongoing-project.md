# Use Case 8: View Ongoing Project - E2E Test Scenarios

## Test Overview

**Test Name:** View Ongoing Project - Complete Test Suite

**Description:** Comprehensive end-to-end tests for viewing the Ongoing Project screen, covering positive cases, negative cases, and data display scenarios.

**Related Use Case:** Use Case 8: View Ongoing Project

**Related Screen:** Screen 5: Ongoing Project Screen

## Test Data Requirements

**Test User:**
- Username: `test_view_user`
- Email: `test_view@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Project Test Data:**
- User has an "In Progress" project
- Project references powerplant with:
  - At least 2 parts
  - At least 2 checkups per part
  - At least 1 checkup with documentation (images and text)
- Some checkups have status set, some do not
- User has a "Finished" project

## Test Scenarios

### TC-001: View Ongoing Project - Success (In Progress)

**Description:** Verify Ongoing Project screen displays correctly for In Progress project.

**Prerequisites:**
- Application is running
- User is logged in
- User has an "In Progress" project open

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Verify screen layout
   - **Action:** Check screen elements
   - **Expected Result:** Screen displays:
     - Powerplant name as large heading at top
     - "Finish Report" button visible in top right (enabled)
     - Parts list in left/middle column
     - Documentation panel on right side

3. Verify powerplant name
   - **Action:** Check powerplant name display
   - **Expected Result:**
     - Powerplant name is displayed as large heading
     - Name matches database value
     - Name is clearly visible

4. Verify parts list
   - **Action:** Check parts list display
   - **Expected Result:**
     - All parts from powerplant are listed
     - Parts are organized clearly (expandable/collapsible sections)
     - Part names are displayed correctly

5. Verify checkups display
   - **Action:** Check checkups under each part
   - **Expected Result:**
     - All checkups for each part are displayed
     - Checkup names are displayed correctly
     - Checkups are associated with correct parts
     - Status indicators show current status (or "unset" if not set)

6. Verify status indicators
   - **Action:** Check status indicators
   - **Expected Result:**
     - Checkups with status show correct indicator:
       - "bad" = red color
       - "average" = yellow/orange color
       - "good" = green color
     - Checkups without status show "unset" (gray)

7. Verify Finish Report button
   - **Action:** Check "Finish Report" button
   - **Expected Result:**
     - Button is visible in top right
     - Button is enabled (for In Progress projects)
     - Button text is "Finish Report"

8. Verify documentation panel
   - **Action:** Check documentation panel
   - **Expected Result:**
     - Panel is visible on right side
     - Panel is initially empty or shows default message
     - Panel is ready to display documentation when checkup is selected

**Assertions:**
- All screen elements are displayed correctly
- Powerplant name is accurate
- All parts and checkups are displayed
- Status indicators are correct
- Finish Report button is enabled
- Documentation panel is ready
- Response time < 3 seconds for powerplant with 100 checkups

---

### TC-002: View Ongoing Project - Success (Finished)

**Description:** Verify Ongoing Project screen displays correctly for Finished project.

**Prerequisites:**
- Application is running
- User is logged in
- User has a "Finished" project open

**Test Steps:**

1. Open finished project
   - **Action:** Double-click finished project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Verify finished project display
   - **Action:** Check screen elements
   - **Expected Result:**
     - Powerplant name is displayed
     - All parts and checkups are displayed
     - All status values are shown (read-only)
     - "Finish Report" button is disabled or hidden
     - Documentation is accessible

**Assertions:**
- Finished project displays correctly
- All data is shown
- Finish Report button is disabled/hidden
- Status values are read-only (if UI enforces)
- Response time < 3 seconds

---

### TC-003: View Ongoing Project - Missing Project Data

**Description:** Verify error handling when project data is missing.

**Prerequisites:**
- Application is running
- User is logged in
- Project data is missing or corrupted (test environment)

**Test Steps:**

1. Attempt to open project with missing data
   - **Action:** Open project with missing data
   - **Expected Result:**
     - Error message is displayed: "Missing project data"
     - User is redirected to Home screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- User is redirected appropriately
- Response time < 1 second

---

### TC-004: View Ongoing Project - Missing Powerplant Data

**Description:** Verify error handling when powerplant data is missing.

**Prerequisites:**
- Application is running
- User is logged in
- Project references missing powerplant (test environment)

**Test Steps:**

1. Attempt to open project with missing powerplant
   - **Action:** Open project with missing powerplant reference
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

### TC-005: View Ongoing Project - Unable to Load Parts/Checkups

**Description:** Verify error handling when parts/checkups cannot be loaded.

**Prerequisites:**
- Application is running
- User is logged in
- Parts/checkups data is unavailable (test environment)

**Test Steps:**

1. Attempt to open project
   - **Action:** Open project with unavailable parts/checkups
   - **Expected Result:**
     - Error message is displayed: "Unable to load parts/checkups"
     - Partial screen may be shown
     - User remains on Ongoing Project screen or is redirected

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- Partial data may be shown
- Response time < 3 seconds

---

### TC-006: View Ongoing Project - Large Number of Checkups

**Description:** Verify screen handles large number of checkups (100+).

**Prerequisites:**
- Application is running
- User is logged in
- User has project with powerplant containing 100+ checkups

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

### TC-007: View Ongoing Project - Responsive Design

**Description:** Verify screen displays correctly on different screen sizes.

**Prerequisites:**
- Application is running
- User is logged in
- User has project open
- Browser can be resized or device emulation available

**Test Steps:**

1. Test desktop layout (1024px+)
   - **Action:** View Ongoing Project screen on desktop size
   - **Expected Result:**
     - Three-column layout is used
     - Parts/checkups in left/middle column
     - Documentation panel on right
     - All elements are properly sized

2. Test tablet layout (768px - 1023px)
   - **Action:** Resize to tablet size
   - **Expected Result:**
     - Two-column layout is used
     - Layout adapts correctly
     - All elements are accessible

3. Test mobile layout (< 768px)
   - **Action:** Resize to mobile size
   - **Expected Result:**
     - Single column layout
     - Documentation panel stacks below parts/checkups
     - Touch targets are adequate (minimum 44px height)
     - All information is accessible

**Assertions:**
- Layout adapts to screen size
- All information is accessible on all sizes
- Touch targets are adequate on mobile
- No horizontal scrolling on mobile
- Response time < 3 seconds

---

### TC-008: View Ongoing Project - Status Indicators Display

**Description:** Verify status indicators display correctly for all status values.

**Prerequisites:**
- Application is running
- User is logged in
- User has project with checkups in different statuses

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify status indicators
   - **Action:** Check status indicators for different statuses
   - **Expected Result:**
     - "bad" status shows red indicator
     - "average" status shows yellow/orange indicator
     - "good" status shows green indicator
     - Unset checkups show gray indicator
     - Indicators are clearly visible

**Assertions:**
- Status indicators show correct colors
- Unset status is clearly indicated
- Indicators are visible and readable
- Color contrast is sufficient
- Response time < 3 seconds

---

### TC-009: View Ongoing Project - Documentation Panel Initial State

**Description:** Verify documentation panel initial state is correct.

**Prerequisites:**
- Application is running
- User is logged in
- User has project open

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify documentation panel
   - **Action:** Check documentation panel before selecting checkup
   - **Expected Result:**
     - Panel is visible on right side
     - Panel is empty or shows default message
     - Panel is ready to display documentation

**Assertions:**
- Documentation panel is visible
- Initial state is correct
- Panel is ready for interaction
- Response time < 3 seconds

---

### TC-010: View Ongoing Project - Navigation Elements

**Description:** Verify navigation elements are present and functional.

**Prerequisites:**
- Application is running
- User is logged in
- User has project open

**Test Steps:**

1. Open project
   - **Action:** Double-click project item
   - **Expected Result:** Ongoing Project screen loads

2. Verify navigation elements
   - **Action:** Check for navigation elements
   - **Expected Result:**
     - "Back" or "Home" link/button is visible
     - Link/button is clickable
     - Navigation works correctly

**Assertions:**
- Navigation elements are present
- Navigation works correctly
- Response time < 1 second for navigation

---

## Performance Requirements

- Ongoing Project screen load: < 3 seconds for powerplant with 100 checkups
- Powerplant name display: < 1 second
- Parts/checkups loading: < 2 seconds
- Status indicators rendering: < 500ms
- Documentation panel initialization: < 500ms

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
