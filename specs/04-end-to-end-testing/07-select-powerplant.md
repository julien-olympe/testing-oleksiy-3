# Use Case 6: Select Powerplant - E2E Test Scenarios

## Test Overview

**Test Name:** Select Powerplant - Complete Test Suite

**Description:** Comprehensive end-to-end tests for selecting a powerplant and loading its parts and checkups, covering positive cases, negative cases, and data display scenarios.

**Related Use Case:** Use Case 6: Select Powerplant

**Related Screen:** Screen 4: Start Project Screen

## Test Data Requirements

**Test User:**
- Username: `test_select_user`
- Email: `test_select@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Powerplant Test Data:**
- Powerplant A exists with:
  - At least 2 parts
  - At least 2 checkups per part
  - At least 1 checkup with documentation
- Powerplant B exists with:
  - At least 1 part
  - At least 1 checkup
- Powerplant with no parts (for empty state test)
- Powerplant that no longer exists (for error test)

## Test Scenarios

### TC-001: Select Powerplant - Success

**Description:** Verify successfully selecting a powerplant and loading parts/checkups.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant with parts and checkups exists

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant
   - **Action:** Click on powerplant dropdown and select a powerplant
   - **Expected Result:**
     - Powerplant is selected in dropdown
     - Loading indicator appears (if applicable)
     - Parts and checkups area starts loading

3. Verify parts and checkups display
   - **Action:** Wait for parts/checkups to load
   - **Expected Result:**
     - Parts list is displayed
     - Each part shows its name
     - Each part shows associated checkups
     - Checkups show their names
     - Documentation indicators are shown (if applicable)
     - "Create" button becomes enabled

**Assertions:**
- Powerplant ID is correctly retrieved from selection
- Parts are retrieved from database for selected powerplant
- Checkups are retrieved for each part
- Display order is correct (if specified)
- All parts and checkups are displayed
- "Create" button is enabled
- Response time < 1 second for powerplant with 100 checkups

---

### TC-002: Select Powerplant - Multiple Parts and Checkups

**Description:** Verify correct display when powerplant has multiple parts with multiple checkups.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant with 5+ parts and 10+ checkups exists

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant with multiple parts
   - **Action:** Select powerplant with multiple parts
   - **Expected Result:**
     - All parts are displayed
     - Parts are organized clearly (tree structure or nested lists)
     - Each part shows all associated checkups

3. Verify organization
   - **Action:** Check parts/checkups organization
   - **Expected Result:**
     - Parts are clearly separated
     - Checkups are grouped under correct parts
     - Hierarchy is clear and readable
     - Display order is correct

**Assertions:**
- All parts are displayed
- All checkups are displayed
- Relationships are maintained (checkups belong to correct parts)
- Display order is correct
- Response time < 1 second

---

### TC-003: Select Powerplant - Documentation References Display

**Description:** Verify documentation references are displayed for checkups (read-only).

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant with checkups that have documentation exists

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant with documentation
   - **Action:** Select powerplant with checkups that have documentation
   - **Expected Result:**
     - Parts and checkups are displayed
     - Checkups with documentation show indicators (icons or text)
     - Documentation references are visible but read-only

3. Verify documentation indicators
   - **Action:** Check for documentation indicators
   - **Expected Result:**
     - Indicators are visible for checkups with documentation
     - Indicators clearly show documentation is available
     - Documentation is not editable (read-only)

**Assertions:**
- Documentation references are displayed
- Indicators are visible
- Documentation is read-only
- Response time < 1 second

---

### TC-004: Select Powerplant - No Parts Found

**Description:** Verify handling when powerplant has no parts configured.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant with no parts exists (or can be created in test)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant with no parts
   - **Action:** Select powerplant that has no parts
   - **Expected Result:**
     - Message is displayed: "No parts configured for this powerplant"
     - Parts/checkups area is empty or shows message
     - "Create" button may remain disabled or be enabled (depending on specification)

**Assertions:**
- Empty state is handled gracefully
- Appropriate message is displayed
- UI remains functional
- Response time < 1 second

---

### TC-005: Select Powerplant - Powerplant Not Found

**Description:** Verify error handling when selected powerplant no longer exists.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant can be deleted during test (test environment)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select non-existent powerplant
   - **Action:** Attempt to select powerplant that no longer exists (if possible)
   - **Expected Result:**
     - Error message is displayed: "Powerplant not found"
     - Parts/checkups area is cleared
     - "Create" button is disabled
     - User remains on Start Project screen

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- Parts/checkups area is cleared
- "Create" button is disabled
- Response time < 1 second

---

### TC-006: Select Powerplant - Database Query Failure

**Description:** Verify graceful handling of database query failure.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Database connection can be interrupted (test environment)

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Simulate database error
   - **Action:** Interrupt database connection, then select powerplant
   - **Expected Result:**
     - Error message is displayed: "Database query failure"
     - Parts/checkups area is cleared
     - "Create" button is disabled
     - User remains on Start Project screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- No sensitive error information is exposed
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-007: Select Powerplant - Change Selection

**Description:** Verify changing powerplant selection updates parts/checkups display.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Multiple powerplants with different parts exist

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select first powerplant
   - **Action:** Select Powerplant A
   - **Expected Result:**
     - Powerplant A is selected
     - Powerplant A's parts and checkups are displayed

3. Change selection to second powerplant
   - **Action:** Select Powerplant B from dropdown
   - **Expected Result:**
     - Powerplant B is selected
     - Powerplant A's parts/checkups are cleared
     - Powerplant B's parts and checkups are displayed
     - Display updates correctly

**Assertions:**
- Selection change works correctly
- Previous parts/checkups are cleared
- New parts/checkups are loaded
- Display updates immediately
- Response time < 1 second

---

### TC-008: Select Powerplant - Large Number of Checkups

**Description:** Verify correct handling when powerplant has large number of checkups (100+).

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant with 100+ checkups exists

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant with many checkups
   - **Action:** Select powerplant with 100+ checkups
   - **Expected Result:**
     - All parts and checkups are loaded
     - Display is scrollable if needed
     - Performance is acceptable
     - No UI lag or freezing

**Assertions:**
- All checkups are loaded
- Response time < 1 second for 100 checkups
- UI remains responsive
- Database queries are optimized
- Memory usage is reasonable

---

### TC-009: Select Powerplant - Loading Indicator

**Description:** Verify loading indicator is displayed while parts/checkups are loading.

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant
   - **Action:** Select a powerplant from dropdown
   - **Expected Result:**
     - Loading indicator appears while parts/checkups are being fetched
     - Loading indicator disappears when data is loaded
     - Parts/checkups are displayed after loading completes

**Assertions:**
- Loading indicator is visible during fetch
- Loading indicator disappears after load
- User experience is smooth
- Response time < 1 second

---

### TC-010: Select Powerplant - Display Order

**Description:** Verify parts and checkups are displayed in correct order (if display_order is specified).

**Prerequisites:**
- Application is running
- User is logged in
- User is on Start Project screen
- Powerplant with parts/checkups that have display_order values exists

**Test Steps:**

1. Navigate to Start Project screen
   - **Action:** Click "Start Project" button
   - **Expected Result:** Start Project screen is displayed

2. Select powerplant
   - **Action:** Select powerplant with ordered parts/checkups
   - **Expected Result:**
     - Parts are displayed in display_order sequence
     - Checkups within each part are displayed in display_order sequence
     - Order is correct and consistent

**Assertions:**
- Display order is correct for parts
- Display order is correct for checkups
- Database query uses ORDER BY display_order
- Response time < 1 second

---

### TC-011: Select Powerplant - Empty Dropdown Selection

**Description:** Verify handling when powerplant selection is cleared or reset.

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
   - **Action:** Select a powerplant
   - **Expected Result:** Parts/checkups are displayed

3. Clear selection
   - **Action:** Clear powerplant selection (if possible in UI)
   - **Expected Result:**
     - Parts/checkups area is cleared
     - "Create" button is disabled
     - Dropdown returns to initial state

**Assertions:**
- Selection clearing works correctly
- Parts/checkups are cleared
- "Create" button is disabled
- Response time < 500ms

---

## Performance Requirements

- Powerplant selection: < 1 second for powerplant with 100 checkups
- Parts/checkups loading: < 1 second
- Database query for parts: < 1 second
- Database query for checkups: < 1 second
- Display rendering: < 500ms

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
