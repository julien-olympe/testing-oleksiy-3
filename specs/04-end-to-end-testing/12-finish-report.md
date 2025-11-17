# Use Case 11: Finish Report - E2E Test Scenarios

## Test Overview

**Test Name:** Finish Report - Complete Test Suite

**Description:** Comprehensive end-to-end tests for finishing a project and generating PDF report, covering positive cases, negative cases, validation scenarios, and PDF generation.

**Related Use Case:** Use Case 11: Finish Report

**Related Screen:** Screen 5: Ongoing Project Screen

## Test Data Requirements

**Test User:**
- Username: `test_finish_user`
- Email: `test_finish@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Project Test Data:**
- User has an "In Progress" project open
- Project has all checkups with status set
- Project has powerplant with parts, checkups, and documentation
- User has a "Finished" project (for negative test)
- User has an "In Progress" project with some checkups missing status (for warning test)

## Test Scenarios

### TC-001: Finish Report - Success

**Description:** Verify successfully finishing a project and generating PDF report.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- All checkups have status set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Verify all checkups have status
   - **Action:** Check that all checkups have status indicators set
   - **Expected Result:** All checkups show status (bad, average, or good)

3. Click "Finish Report" button
   - **Action:** Click "Finish Report" button in top right
   - **Expected Result:**
     - Button click is registered
     - Loading indicator appears
     - PDF generation process starts

4. Verify PDF generation
   - **Action:** Wait for PDF generation to complete
   - **Expected Result:**
     - System validates all checkups have status
     - PDF is generated containing:
       - Project header with powerplant name and date
       - Parts list with checkups
       - Status values for each checkup
       - Documentation images and descriptions
       - Project completion timestamp
     - PDF generation completes

5. Verify project status update
   - **Action:** Check project status
   - **Expected Result:**
     - Project status is updated to "Finished"
     - `finished_at` timestamp is set
     - Project is saved to database

6. Verify PDF download
   - **Action:** Wait for PDF download
   - **Expected Result:**
     - PDF download is triggered
     - Browser download dialog appears (or automatic download occurs)
     - PDF file is downloaded

7. Verify redirect to Home
   - **Action:** Wait for redirect
   - **Expected Result:**
     - User is redirected to Home screen
     - Project list is refreshed
     - Finished project shows "Finished" status badge (green)

**Assertions:**
- Project status is updated to "Finished" in database
- `finished_at` timestamp is set to current time
- PDF file is generated (in memory or temporary storage)
- PDF contains all required content:
  - Powerplant name
  - All parts and checkups
  - All status values
  - Documentation images and text
- PDF generation completes within 5 seconds for projects with 50-100 checkups
- PDF download is triggered
- User is redirected to Home screen
- Project status badge is updated to "Finished" (green)

---

### TC-002: Finish Report - Project Already Finished

**Description:** Verify error handling when attempting to finish an already finished project.

**Prerequisites:**
- Application is running
- User is logged in
- User has "Finished" project open

**Test Steps:**

1. Open finished project
   - **Action:** Double-click finished project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Attempt to finish report
   - **Action:** Click "Finish Report" button (if enabled) or verify it's disabled
   - **Expected Result:**
     - If button is disabled: Button cannot be clicked
     - If button is enabled: Error message is displayed: "Project is already finished"
     - PDF is not regenerated
     - Project status remains "Finished"

**Assertions:**
- Finished projects cannot be finished again
- Error message is displayed (if applicable)
- PDF is not regenerated
- Project status remains "Finished"
- Response time < 1 second

---

### TC-003: Finish Report - Missing Checkup Statuses

**Description:** Verify warning when some checkups have no status set.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Some checkups have no status set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Verify some checkups missing status
   - **Action:** Check that some checkups show "unset" status
   - **Expected Result:** Some checkups have no status set

3. Attempt to finish report
   - **Action:** Click "Finish Report" button
   - **Expected Result:**
     - Warning message is displayed: "Some checkups have no status"
     - User is given option to proceed or cancel
     - Or finish is prevented until all statuses are set

**Assertions:**
- Warning is displayed when checkups are missing status
- User can proceed or cancel (if allowed)
- Or finish is prevented (if required)
- Response time < 1 second

---

### TC-004: Finish Report - PDF Generation Failure

**Description:** Verify graceful handling when PDF generation fails.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- All checkups have status set
- PDF generation can be simulated to fail (test environment)

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Simulate PDF generation failure
   - **Action:** Attempt to finish report with PDF generation failure (simulated)
   - **Expected Result:**
     - Error message is displayed: "Unable to generate report"
     - Project is not marked as Finished
     - PDF is not generated
     - User remains on Ongoing Project screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- Project status is not changed
- PDF is not generated
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-005: Finish Report - Database Update Failure

**Description:** Verify graceful handling when database update fails.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- All checkups have status set
- Database connection can be interrupted (test environment)

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Simulate database error
   - **Action:** Interrupt database connection, then click "Finish Report"
   - **Expected Result:**
     - Error message is displayed: "Unable to complete project"
     - Project is not marked as Finished
     - PDF may be generated but project status is not updated
     - User remains on Ongoing Project screen
     - No crash or unhandled error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- Project status is not changed
- No sensitive error information is exposed
- Application remains functional
- Response time < 5 seconds (timeout)

---

### TC-006: Finish Report - Access Denied

**Description:** Verify access control prevents finishing other users' projects.

**Prerequisites:**
- Application is running
- User A is logged in
- User B has a project
- User A does not have access to User B's project

**Test Steps:**

1. Attempt to finish another user's project
   - **Action:** Attempt to finish User B's project (e.g., via API manipulation)
   - **Expected Result:**
     - Access is denied
     - Error message is displayed: "Access denied"
     - Project is not marked as Finished
     - PDF is not generated

**Assertions:**
- Access control is enforced
- User cannot finish other users' projects
- Database query includes user_id verification
- Error message is appropriate
- Response time < 1 second

---

### TC-007: Finish Report - Session Expiration

**Description:** Verify redirect to login when session expires during report finishing.

**Prerequisites:**
- Application is running
- User session has expired (or can be invalidated)
- User has project open

**Test Steps:**

1. Attempt to finish report with expired session
   - **Action:** Attempt to finish report with expired/invalid session
   - **Expected Result:**
     - User is redirected to login screen
     - Error message may be displayed: "Session expired. Please login again."
     - Project is not marked as Finished
     - PDF is not generated

**Assertions:**
- Session expiration is detected
- User is redirected to login
- No project status change
- No PDF generation
- Response time < 1 second

---

### TC-008: Finish Report - PDF Content Verification

**Description:** Verify PDF contains all required content.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- All checkups have status set
- Project has documentation

**Test Steps:**

1. Finish report
   - **Action:** Complete finish report process
   - **Expected Result:** PDF is generated and downloaded

2. Verify PDF content
   - **Action:** Open downloaded PDF and verify content
   - **Expected Result:** PDF contains:
     - Project header with powerplant name and date
     - All parts listed
     - All checkups listed under correct parts
     - Status values for each checkup
     - Documentation images (if available)
     - Documentation text descriptions (if available)
     - Project completion timestamp

**Assertions:**
- PDF contains all required content
- Content is accurate and matches project data
- Images are included and visible
- Text is readable
- Formatting is correct
- PDF generation time < 5 seconds for 50-100 checkups

---

### TC-009: Finish Report - PDF File Size

**Description:** Verify PDF file size is within limits.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- All checkups have status set

**Test Steps:**

1. Finish report
   - **Action:** Complete finish report process
   - **Expected Result:** PDF is generated and downloaded

2. Verify PDF file size
   - **Action:** Check downloaded PDF file size
   - **Expected Result:**
     - PDF file size is within limits (< 25 MB)
     - Typical size is 2-5 MB for projects with 50-100 checkups
     - File is not corrupted

**Assertions:**
- PDF file size < 25 MB
- File size is reasonable for project content
- File is not corrupted
- PDF can be opened and viewed

---

### TC-010: Finish Report - Large Number of Checkups

**Description:** Verify finishing project with large number of checkups (100+).

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- Project has 100+ checkups
- All checkups have status set

**Test Steps:**

1. Open project
   - **Action:** Double-click project item on Home screen
   - **Expected Result:** Ongoing Project screen is displayed

2. Finish report
   - **Action:** Click "Finish Report" button
   - **Expected Result:**
     - PDF generation starts
     - Performance is acceptable
     - PDF generation completes within 10 seconds for 100-200 checkups
     - PDF is generated and downloaded

**Assertions:**
- PDF generation works for large projects
- Performance is acceptable (< 10 seconds for 100-200 checkups)
- PDF contains all checkups
- PDF file size is reasonable
- Response time meets requirements

---

### TC-011: Finish Report - Timestamp Verification

**Description:** Verify timestamps are set correctly when finishing project.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project open
- All checkups have status set

**Test Steps:**

1. Finish report
   - **Action:** Complete finish report process
   - **Expected Result:** Project is finished

2. Verify timestamps
   - **Action:** Check project in database
   - **Expected Result:**
     - `finished_at` is set to current timestamp
     - `updated_at` is updated to current timestamp
     - Timestamps are accurate (within reasonable tolerance)

**Assertions:**
- `finished_at` is set correctly
- `updated_at` is updated correctly
- Timestamps are accurate
- Response time < 5 seconds

---

### TC-012: Finish Report - Project List Update

**Description:** Verify project list is updated after finishing project.

**Prerequisites:**
- Application is running
- User is logged in
- User has "In Progress" project

**Test Steps:**

1. Note project status
   - **Action:** View Home screen and note project status
   - **Expected Result:** Project shows "In Progress" status

2. Finish project
   - **Action:** Finish the project
   - **Expected Result:** Project is finished

3. Verify list update
   - **Action:** Check Home screen project list
   - **Expected Result:**
     - Project list is refreshed
     - Project status badge is updated to "Finished" (green)
     - Project remains in list

**Assertions:**
- Project list is refreshed
- Status badge is updated correctly
- Project remains in list
- Response time < 2 seconds (including redirect and list load)

---

## Performance Requirements

- PDF generation: < 5 seconds for projects with 50-100 checkups
- PDF generation: < 10 seconds for projects with 100-200 checkups
- PDF download initiation: < 100ms after generation
- Database update: < 500ms
- Redirect to Home: < 1 second
- Total operation: < 6 seconds for typical project

## Security Requirements

- Access control enforced (users only finish own projects)
- Session validation on every request
- Project status validation (cannot finish already finished projects)
- SQL injection prevention (parameterized queries)
- No sensitive data in error messages
- PDF generation is secure (no code injection)

## Cleanup

After test execution:
- Logout test users
- Delete test projects and PDF files (if using test database)
- Verify database state
