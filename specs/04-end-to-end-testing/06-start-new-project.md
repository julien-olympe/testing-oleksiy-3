# Use Case 5: Start New Project - E2E Test Scenarios

## Test Overview

**Test Name:** Start New Project - Complete Test Suite

**Description:** Comprehensive end-to-end tests for initiating project creation, covering positive cases, negative cases, and navigation scenarios.

**Related Use Case:** Use Case 5: Start New Project

**Related Screen:** Screen 4: Start Project Screen

## Test Data Requirements

**Test User:**
- Username: `test_start_user`
- Email: `test_start@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Powerplant Test Data:**
- At least 2 powerplants exist in database
- Powerplants have parts and checkups configured

## Test Scenarios

### TC-001: Start New Project - Success

**Description:** Verify successfully navigating to Start Project screen.

**Prerequisites:**
- Application is running
- User is logged in
- At least one powerplant exists in database

**Test Steps:**

1. Navigate to Home screen
   - **Action:** Login and wait for Home screen to load
   - **Expected Result:** Home screen displays projects list

2. Click "Start Project" button
   - **Action:** Click "Start Project" button (top right of content area)
   - **Expected Result:**
     - Navigation to Start Project screen occurs
     - Start Project screen is displayed

3. Verify Start Project screen
   - **Action:** Wait for screen to load
   - **Expected Result:** Start Project screen displays:
     - Page title "Start New Project"
     - Powerplant dropdown selector visible
     - Parts and checkups area visible (initially empty)
     - "Create" button visible (initially disabled)
     - "Back" or "Cancel" link/button visible

**Assertions:**
- Navigation works correctly
- Start Project screen is displayed
- All UI elements are visible
- Powerplant dropdown is populated
- Response time < 2 seconds

---

### TC-002: Start New Project - Powerplant Dropdown Population

**Description:** Verify powerplant dropdown is populated with all available powerplants.

**Prerequisites:**
- Application is running
- User is logged in
- Multiple powerplants exist in database

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Verify powerplant dropdown
   - **Action:** Click on powerplant dropdown
   - **Expected Result:**
     - Dropdown opens
     - All powerplants from database are listed
     - Powerplant names are displayed correctly
     - Dropdown is scrollable if many powerplants exist

**Assertions:**
- All powerplants are retrieved from database
- Powerplant names are displayed correctly
- Dropdown is functional
- Response time < 500ms for powerplant list retrieval

---

### TC-003: Start New Project - Empty Powerplant List

**Description:** Verify handling when no powerplants exist in database.

**Prerequisites:**
- Application is running
- User is logged in
- No powerplants exist in database (test environment)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Verify empty dropdown
   - **Action:** Check powerplant dropdown
   - **Expected Result:**
     - Dropdown is empty or shows "No powerplants available"
     - "Create" button remains disabled
     - Error message may be displayed: "Unable to load powerplants"

**Assertions:**
- Empty state is handled gracefully
- Appropriate message is displayed
- "Create" button is disabled
- Response time < 2 seconds

---

### TC-004: Start New Project - Parts and Checkups Area Initially Empty

**Description:** Verify parts and checkups area is empty initially.

**Prerequisites:**
- Application is running
- User is logged in

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Verify empty parts/checkups area
   - **Action:** Check parts and checkups display area
   - **Expected Result:**
     - Area is empty or shows placeholder message
     - No parts or checkups are displayed
     - Area is ready to display content when powerplant is selected

**Assertions:**
- Parts/checkups area is initially empty
- UI is ready for powerplant selection
- Response time < 2 seconds

---

### TC-005: Start New Project - Create Button Initially Disabled

**Description:** Verify "Create" button is disabled until powerplant is selected.

**Prerequisites:**
- Application is running
- User is logged in

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Verify Create button state
   - **Action:** Check "Create" button
   - **Expected Result:**
     - "Create" button is visible
     - "Create" button is disabled (grayed out, not clickable)
     - Button text is "Create"

**Assertions:**
- "Create" button is disabled initially
- Button state is visually clear
- Button cannot be clicked
- Response time < 2 seconds

---

### TC-006: Start New Project - Database Query Failure

**Description:** Verify graceful handling when powerplant list cannot be loaded.

**Prerequisites:**
- Application is running
- User is logged in
- Database connection can be interrupted (test environment)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Simulate database error
   - **Action:** Interrupt database connection (if possible in test environment)
   - **Expected Result:**
     - Error message is displayed: "Unable to load powerplants"
     - Dropdown shows empty or error state
     - User remains on Start Project screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- No sensitive error information is exposed
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-007: Start New Project - Session Expiration

**Description:** Verify redirect to login when session expires.

**Prerequisites:**
- Application is running
- User session has expired (or can be invalidated)

**Test Steps:**

1. Attempt to access Start Project screen with expired session
   - **Action:** Navigate to Start Project screen with expired/invalid session
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

### TC-008: Start New Project - Navigation Back to Home

**Description:** Verify navigation back to Home screen works correctly.

**Prerequisites:**
- Application is running
- User is logged in

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Navigate back to Home
   - **Action:** Click "Back" or "Cancel" link/button
   - **Expected Result:**
     - User is redirected to Home screen
     - Projects list is displayed
     - No data is lost

**Assertions:**
- Navigation works correctly
- Home screen is displayed
- Response time < 1 second

---

### TC-009: Start New Project - Responsive Design

**Description:** Verify Start Project screen displays correctly on different screen sizes.

**Prerequisites:**
- Application is running
- User is logged in
- Browser can be resized or device emulation available

**Test Steps:**

1. Test desktop layout (1024px+)
   - **Action:** View Start Project screen on desktop size
   - **Expected Result:**
     - All elements are properly sized
     - Layout is clear and readable
     - Dropdown is accessible

2. Test tablet layout (768px - 1023px)
   - **Action:** Resize to tablet size
   - **Expected Result:**
     - Layout adapts correctly
     - All elements are accessible
     - Dropdown is usable

3. Test mobile layout (< 768px)
   - **Action:** Resize to mobile size
   - **Expected Result:**
     - Single column layout
     - Touch targets are adequate (minimum 44px height)
     - Dropdown is touch-friendly
     - All information is accessible

**Assertions:**
- Layout adapts to screen size
- All elements are accessible on all sizes
- Touch targets are adequate on mobile
- No horizontal scrolling on mobile
- Response time < 2 seconds

---

### TC-010: Start New Project - Loading Indicator

**Description:** Verify loading indicator is displayed while powerplants are loading.

**Prerequisites:**
- Application is running
- User is logged in

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Verify loading indicator
   - **Action:** Observe screen during powerplant loading
   - **Expected Result:**
     - Loading indicator appears while powerplants are being fetched
     - Loading indicator disappears when powerplants are loaded
     - Dropdown is populated after loading completes

**Assertions:**
- Loading indicator is visible during fetch
- Loading indicator disappears after load
- User experience is smooth
- Response time < 2 seconds

---

## Performance Requirements

- Start Project screen load: < 2 seconds
- Powerplant list retrieval: < 500ms
- Dropdown population: < 500ms
- Navigation to screen: < 1 second

## Security Requirements

- Session validation on every request
- SQL injection prevention (parameterized queries)
- No sensitive data in error messages
- User authentication required

## Cleanup

After test execution:
- Logout test users
- Clean up test data (if using test database)
- Verify database state
