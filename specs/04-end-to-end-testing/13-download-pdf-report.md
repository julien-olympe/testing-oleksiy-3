# Use Case 12: Download PDF Report - E2E Test Scenarios

## Test Overview

**Test Name:** Download PDF Report - Complete Test Suite

**Description:** Comprehensive end-to-end tests for downloading generated PDF reports, covering positive cases, negative cases, file handling, and download scenarios.

**Related Use Case:** Use Case 12: Download PDF Report

**Related Screen:** Screen 5: Ongoing Project Screen (triggers download)

## Test Data Requirements

**Test User:**
- Username: `test_download_user`
- Email: `test_download@example.com`
- Password: `TestPassword123!`
- User must be authenticated

**Project Test Data:**
- User has finished a project (PDF has been generated)
- PDF file is available for download
- PDF file follows naming convention: `Project_[ProjectID]_[PowerplantName]_[Date].pdf`

## Test Scenarios

### TC-001: Download PDF Report - Success

**Description:** Verify successfully downloading generated PDF report.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- PDF has been generated and is available

**Test Steps:**

1. Finish project (triggers PDF generation and download)
   - **Action:** Complete finish report process
   - **Expected Result:**
     - PDF is generated
     - PDF download is triggered automatically
     - Browser download dialog appears (or automatic download occurs)

2. Verify download initiation
   - **Action:** Check browser download behavior
   - **Expected Result:**
     - Download is initiated
     - HTTP response headers are set correctly:
       - Content-Type: application/pdf
       - Content-Disposition: attachment; filename="Project_[ProjectID]_[PowerplantName]_[Date].pdf"
     - Download starts

3. Verify file download
   - **Action:** Wait for download to complete
   - **Expected Result:**
     - PDF file is downloaded to default download location
     - File exists in download folder
     - File can be opened

4. Verify file content
   - **Action:** Open downloaded PDF file
   - **Expected Result:**
     - PDF opens successfully
     - PDF content is correct and complete
     - PDF is not corrupted

**Assertions:**
- PDF download is triggered automatically after generation
- HTTP response headers are set correctly
- Content-Type is "application/pdf"
- Content-Disposition includes correct filename
- PDF file is downloaded successfully
- File is saved to default download location
- File can be opened and viewed
- PDF content is correct
- Response time < 100ms for download initiation

---

### TC-002: Download PDF Report - Filename Verification

**Description:** Verify PDF filename follows correct naming convention.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- PDF has been generated

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify filename
   - **Action:** Check downloaded PDF filename
   - **Expected Result:**
     - Filename follows pattern: `Project_[ProjectID]_[PowerplantName]_[Date].pdf`
     - ProjectID is correct UUID
     - PowerplantName is correct (sanitized for filename)
     - Date is in correct format
     - Filename is valid (no invalid characters)

**Assertions:**
- Filename follows naming convention
- ProjectID is included correctly
- PowerplantName is included correctly
- Date is included correctly
- Filename is valid and safe
- Invalid characters are sanitized

---

### TC-003: Download PDF Report - File Not Found

**Description:** Verify error handling when PDF file is not available.

**Prerequisites:**
- Application is running
- User is logged in
- PDF file is missing or unavailable (test environment)

**Test Steps:**

1. Attempt to download missing PDF
   - **Action:** Attempt to download PDF that doesn't exist (if possible via direct link or manipulation)
   - **Expected Result:**
     - Error message is displayed: "Report file not available"
     - Download does not occur
     - User is informed of the error

**Assertions:**
- Error is handled gracefully
- User-friendly error message is displayed
- Download does not occur
- No crash or unhandled error
- Response time < 1 second

---

### TC-004: Download PDF Report - Network Error

**Description:** Verify handling when network error occurs during download.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- Network connection can be interrupted (test environment)

**Test Steps:**

1. Start download
   - **Action:** Finish project to trigger PDF download
   - **Expected Result:** Download starts

2. Simulate network error
   - **Action:** Interrupt network connection during download
   - **Expected Result:**
     - Browser displays download failure
     - Download is interrupted
     - User can retry download (if applicable)

**Assertions:**
- Network errors are handled gracefully
- Browser displays appropriate error
- Download can be retried (if applicable)
- No application crash

---

### TC-005: Download PDF Report - Browser Download Support

**Description:** Verify handling when browser does not support download.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- Browser download functionality can be disabled (test environment)

**Test Steps:**

1. Attempt download with unsupported browser
   - **Action:** Attempt to download PDF with browser that doesn't support download (or download disabled)
   - **Expected Result:**
     - Message is displayed: "Please enable downloads in your browser"
     - Or PDF opens in new tab/window
     - User is informed of the issue

**Assertions:**
- Browser download support is detected
- Appropriate message is displayed
- Alternative behavior is provided (if applicable)
- User experience is maintained

---

### TC-006: Download PDF Report - File Size Verification

**Description:** Verify PDF file size is within limits and reasonable.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- PDF has been generated

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify file size
   - **Action:** Check downloaded PDF file size
   - **Expected Result:**
     - File size is within limits (< 25 MB)
     - Typical size is 2-5 MB for projects with 50-100 checkups
     - File size is reasonable for content

**Assertions:**
- PDF file size < 25 MB
- File size is reasonable for project content
- File is not corrupted
- File can be opened

---

### TC-007: Download PDF Report - Multiple Downloads

**Description:** Verify system handles multiple download requests correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished multiple projects

**Test Steps:**

1. Finish first project
   - **Action:** Finish project A
   - **Expected Result:** PDF A is downloaded

2. Finish second project
   - **Action:** Finish project B
   - **Expected Result:**
     - PDF B is downloaded
     - Both PDFs are available
     - No conflicts occur

**Assertions:**
- Multiple downloads work correctly
- Each PDF is downloaded successfully
- No conflicts between downloads
- Filenames are unique

---

### TC-008: Download PDF Report - Download Location

**Description:** Verify PDF is downloaded to correct location.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- Browser download location is known

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify download location
   - **Action:** Check where PDF is saved
   - **Expected Result:**
     - PDF is saved to browser's default download location
     - File is accessible
     - File can be opened from download location

**Assertions:**
- PDF is saved to correct location
- File is accessible
- File can be opened
- Download location is as expected

---

### TC-009: Download PDF Report - Content-Type Verification

**Description:** Verify HTTP response Content-Type is set correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- Network inspection tools available (test environment)

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify Content-Type header
   - **Action:** Check HTTP response headers (via network inspection)
   - **Expected Result:**
     - Content-Type header is set to "application/pdf"
     - Header is correct and valid

**Assertions:**
- Content-Type is "application/pdf"
- Header is set correctly
- Browser recognizes file type correctly

---

### TC-010: Download PDF Report - Content-Disposition Verification

**Description:** Verify HTTP response Content-Disposition is set correctly.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- Network inspection tools available (test environment)

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify Content-Disposition header
   - **Action:** Check HTTP response headers (via network inspection)
   - **Expected Result:**
     - Content-Disposition header is set to: attachment; filename="Project_[ProjectID]_[PowerplantName]_[Date].pdf"
     - Header includes correct filename
     - Header triggers download (not inline display)

**Assertions:**
- Content-Disposition is set correctly
- Filename is included correctly
- Download is triggered (not inline)
- Header format is correct

---

### TC-011: Download PDF Report - Temporary File Cleanup

**Description:** Verify temporary files are cleaned up after download (if used).

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- Server temporary file storage can be inspected (test environment)

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify temporary file cleanup
   - **Action:** Check server temporary file storage (if applicable)
   - **Expected Result:**
     - Temporary files are cleaned up after download
     - No orphaned temporary files remain
     - Or files are generated in-memory (no temporary storage)

**Assertions:**
- Temporary files are cleaned up (if used)
- Or files are generated in-memory (no cleanup needed)
- No orphaned files remain
- Server storage is managed correctly

---

### TC-012: Download PDF Report - Download Progress

**Description:** Verify download progress is indicated (if browser shows it).

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- Browser shows download progress

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify download progress
   - **Action:** Observe download progress in browser
   - **Expected Result:**
     - Download progress is shown (if browser supports it)
     - Progress updates as file downloads
     - Download completes successfully

**Assertions:**
- Download progress is shown (if supported)
- Progress updates correctly
- Download completes successfully
- User experience is positive

---

### TC-013: Download PDF Report - PDF Integrity

**Description:** Verify downloaded PDF file is not corrupted and is valid.

**Prerequisites:**
- Application is running
- User is logged in
- User has finished a project
- PDF viewer available

**Test Steps:**

1. Finish project
   - **Action:** Complete finish report process
   - **Expected Result:** PDF download is triggered

2. Verify PDF integrity
   - **Action:** Open downloaded PDF in PDF viewer
   - **Expected Result:**
     - PDF opens successfully
     - PDF is not corrupted
     - PDF structure is valid
     - All content is accessible

**Assertions:**
- PDF file is not corrupted
- PDF structure is valid
- PDF can be opened in standard viewers
- All content is accessible
- File integrity is maintained

---

## Performance Requirements

- PDF download initiation: < 100ms after generation
- Download speed: Depends on network and file size
- File streaming: Efficient streaming of PDF data
- Total download time: Reasonable for file size

## Security Requirements

- Access control enforced (users only download own project PDFs)
- Session validation on every request
- File access control (no unauthorized file access)
- No path traversal vulnerabilities
- Filename sanitization (no malicious characters)
- Content-Type validation

## Cleanup

After test execution:
- Logout test users
- Delete downloaded PDF files from test environment
- Clean up test projects (if using test database)
- Verify database state
