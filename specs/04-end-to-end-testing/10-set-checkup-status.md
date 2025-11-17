# Use Case 9: Set Checkup Status - E2E Test Scenarios

## Test Overview

**Test Name:** Set Checkup Status - Complete Test Suite

**Description:** Comprehensive end-to-end tests for setting and updating checkup status values, covering positive cases, negative cases, validation scenarios, and status transitions.

**Related Use Case:** Use Case 9: Set Checkup Status

**Related Screen:** Screen 5: Ongoing Project Screen

## Test Data Requirements

**Test User:**
- Username: `test_status_user`
- Email: `test_status@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Project Test Data:**
- User has an "In Progress" project open
- Project has powerplant with multiple checkups
- Some checkups have no status set
- Some checkups have status set
- User has a "Finished" project (for negative test)

## Test Scenarios

### TC-001: Set Checkup Status - Success (Bad)

**Description:** Verify successfully setting checkup status to "bad".

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Checkup has no status set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Click on checkup
   - **Action:** Click on a checkup that has no status set
   - **Expected Result:**
     - Checkup is selected (highlighted)
     - Status selection interface appears (dropdown or buttons)
     - Documentation panel updates (if applicable)

3. Select "bad" status
   - **Action:** Select "bad" from status selector
   - **Expected Result:**
     - Status "bad" is selected
     - Status indicator updates to show "bad" (red color)
     - Status is saved to database
     - UI updates immediately

**Assertions:**
- CheckupStatus record is created/updated in database:
  - `project_id` matches current project
  - `checkup_id` matches selected checkup
  - `status_value` = "bad"
  - `created_at` or `updated_at` is set
- Status indicator shows red color
- UI updates immediately
- Response time < 300ms

---

### TC-002: Set Checkup Status - Success (Average)

**Description:** Verify successfully setting checkup status to "average".

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Checkup has no status set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Click on checkup
   - **Action:** Click on a checkup that has no status set
   - **Expected Result:** Status selection interface appears

3. Select "average" status
   - **Action:** Select "average" from status selector
   - **Expected Result:**
     - Status "average" is selected
     - Status indicator updates to show "average" (yellow/orange color)
     - Status is saved to database
     - UI updates immediately

**Assertions:**
- CheckupStatus record is created/updated with `status_value` = "average"
- Status indicator shows yellow/orange color
- UI updates immediately
- Response time < 300ms

---

### TC-003: Set Checkup Status - Success (Good)

**Description:** Verify successfully setting checkup status to "good".

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Checkup has no status set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Click on checkup
   - **Action:** Click on a checkup that has no status set
   - **Expected Result:** Status selection interface appears

3. Select "good" status
   - **Action:** Select "good" from status selector
   - **Expected Result:**
     - Status "good" is selected
     - Status indicator updates to show "good" (green color)
     - Status is saved to database
     - UI updates immediately

**Assertions:**
- CheckupStatus record is created/updated with `status_value` = "good"
- Status indicator shows green color
- UI updates immediately
- Response time < 300ms

---

### TC-004: Set Checkup Status - Update Existing Status

**Description:** Verify successfully updating an existing checkup status.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Checkup has status "bad" set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Click on checkup with existing status
   - **Action:** Click on checkup that has "bad" status
   - **Expected Result:** Status selection interface appears with current status selected

3. Change status to "good"
   - **Action:** Select "good" from status selector
   - **Expected Result:**
     - Status changes from "bad" to "good"
     - Status indicator updates from red to green
     - Status is updated in database
     - UI updates immediately

**Assertions:**
- CheckupStatus record is updated (not duplicated)
- `status_value` changes from "bad" to "good"
- `updated_at` timestamp is updated
- Status indicator updates correctly
- Response time < 300ms

---

### TC-005: Set Checkup Status - Project is Finished

**Description:** Verify status cannot be set for finished projects.

**Prerequisites:**
- Application is running
- User is logged in
- User has "Finished" project open

**Test Steps:**

1. Open finished project
   - **Action:** Double-click finished project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Attempt to set status
   - **Action:** Click on a checkup and attempt to set status
   - **Expected Result:**
     - Status selection interface does not appear (if UI enforces)
     - Or error message is displayed: "Cannot update status on finished project"
     - Status is not saved
     - UI does not update

**Assertions:**
- Status cannot be set for finished projects
- Error message is displayed (if applicable)
- No CheckupStatus record is created/updated
- Project status remains "Finished"
- Response time < 300ms

---

### TC-006: Set Checkup Status - Invalid Status Value

**Description:** Verify invalid status values are rejected.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Invalid status value can be submitted (test environment)

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Attempt to set invalid status
   - **Action:** Attempt to submit invalid status value (e.g., via API manipulation)
   - **Expected Result:**
     - Invalid status is rejected
     - Error message is displayed: "Invalid status value"
     - Status is not saved
     - UI does not update

**Assertions:**
- Invalid status values are rejected
- Only "bad", "average", "good" are accepted
- Error message is displayed
- No CheckupStatus record is created/updated
- Response time < 300ms

---

### TC-007: Set Checkup Status - Database Save Failure

**Description:** Verify graceful handling of database save failure.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Database connection can be interrupted (test environment)

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Simulate database error
   - **Action:** Interrupt database connection, then attempt to set status
   - **Expected Result:**
     - Error message is displayed: "Unable to save status"
     - UI reverts to previous state
     - Status is not saved
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- UI reverts to previous state
- No sensitive error information is exposed
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-008: Set Checkup Status - Access Denied

**Description:** Verify access control prevents setting status for other users' projects.

**Prerequisites:**
- Application is running
- User A is logged in
- User B has a project
- User A does not have access to User B's project

**Test Steps:**

1. Attempt to set status on another user's project
   - **Action:** Attempt to set status on User B's project (e.g., via API manipulation)
   - **Expected Result:**
     - Access is denied
     - Error message is displayed: "Access denied"
     - Status is not saved
     - No project data is modified

**Assertions:**
- Access control is enforced
- User cannot set status on other users' projects
- Database query includes user_id verification
- Error message is appropriate
- Response time < 300ms

---

### TC-009: Set Checkup Status - Session Expiration

**Description:** Verify redirect to login when session expires during status update.

**Prerequisites:**
- Application is running
- User session has expired (or can be invalidated)
- User has project open

**Test Steps:**

1. Attempt to set status with expired session
   - **Action:** Attempt to set status with expired/invalid session
   - **Expected Result:**
     - User is redirected to login screen
     - Error message may be displayed: "Session expired. Please login again."
     - Status is not saved

**Assertions:**
- Session expiration is detected
- User is redirected to login
- No status is saved
- Response time < 1 second

---

### TC-010: Set Checkup Status - Multiple Checkups

**Description:** Verify setting status for multiple checkups works correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Project has multiple checkups

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Set status for multiple checkups
   - **Action:** Set status for 5 different checkups with different values
   - **Expected Result:**
     - Each status is set correctly
     - Each status indicator updates correctly
     - All statuses are saved to database
     - UI updates for each change

**Assertions:**
- Multiple statuses can be set
- Each status is saved correctly
- Status indicators update correctly
- All CheckupStatus records are created/updated
- Response time < 300ms per status

---

### TC-011: Set Checkup Status - Status Selection Interface

**Description:** Verify status selection interface displays and works correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Click on checkup
   - **Action:** Click on a checkup
   - **Expected Result:**
     - Status selection interface appears
     - Interface shows three options: "Bad", "Average", "Good"
     - Current status is highlighted (if status is set)
     - Interface is clearly visible

3. Select status
   - **Action:** Click on a status option
   - **Expected Result:**
     - Status is selected
     - Interface may close or remain open
     - Status is saved

**Assertions:**
- Status selection interface appears correctly
- All three options are available
- Interface is user-friendly
- Selection works correctly
- Response time < 300ms

---

### TC-012: Set Checkup Status - Visual Feedback

**Description:** Verify visual feedback is provided during status update.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Set status
   - **Action:** Set status for a checkup
   - **Expected Result:**
     - Visual feedback is provided (e.g., loading indicator, animation)
     - Status indicator updates smoothly
     - Feedback is clear and immediate

**Assertions:**
- Visual feedback is provided
- Feedback is immediate
- Status indicator updates smoothly
- User experience is positive
- Response time < 300ms

---

### TC-013: Set Checkup Status - Concurrent Updates

**Description:** Verify system handles concurrent status updates correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Multiple concurrent requests possible

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Set multiple statuses concurrently
   - **Action:** Set status for multiple checkups in quick succession
   - **Expected Result:**
     - All statuses are saved correctly
     - No conflicts or errors
     - UI updates correctly for all changes

**Assertions:**
- Concurrent updates work correctly
- All statuses are saved
- No database conflicts
- UI updates correctly
- Response time < 300ms per status

---

## Performance Requirements

- Status update: < 300ms per checkup
- Database save: < 200ms
- UI update: < 100ms
- Status indicator update: < 100ms

## Security Requirements

- Access control enforced (users only update own projects)
- Session validation on every request
- Status value validation (enum: bad, average, good)
- SQL injection prevention (parameterized queries)
- No sensitive data in error messages
- Project status validation (cannot update finished projects)

## Cleanup

After test execution:
- Logout test users
- Clean up test projects and statuses (if using test database)
- Verify database state
