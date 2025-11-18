# Test 28: Finish Report and Generate PDF - Generate and Download PDF Successfully

## Test ID
E2E-UC8-POS-001

## Test Name
Finish Report and Generate PDF - Generate and Download PDF Successfully

## Description
This test verifies that an authenticated user can successfully finish an inspection project by generating a PDF report. The PDF should contain all project information including powerplant name, parts, checkup statuses, and documentation. After generation, the project status should be set to "Finished" and the PDF should be automatically downloaded.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- PDF Generator Service (Puppeteer) is available and functional
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Test project exists in database:
  - Project ID: `project-uuid-001`
  - User ID: `user-uuid-001` (assigned to test user)
  - Powerplant: "Wind Farm Alpha"
  - Status: "In Progress"
  - All checkups have statuses set (bad, average, or good)
  - Parts have associated documentation (images and descriptions)
- User is logged in and viewing Ongoing Project Screen for test project
- Browser is open with active session and download capability enabled

## Test Steps

### Step 1: Navigate to Ongoing Project Screen
1. Verify user is logged in and on Ongoing Project Screen
2. Verify project "Wind Farm Alpha" is displayed
3. Verify all checkups have statuses set (no unset checkups)
4. Verify "Finish Report" button is displayed in top right corner
5. Verify "Finish Report" button is enabled

**Expected Result:** Ongoing Project Screen displays with all checkups completed

### Step 2: Verify Project Completeness
1. Verify all checkups in the project have statuses set
2. Verify no checkups are in unset state (null)
3. Verify project is ready to be finished

**Expected Result:** Project is complete and ready for PDF generation

### Step 3: Click Finish Report Button
1. Click "Finish Report" button
2. Wait for PDF generation to complete (maximum 30 seconds as per performance requirements)
3. Verify loading state is shown (button shows loading spinner, progress indicator, or disabled state)
4. Verify user cannot interact with other elements during generation

**Expected Result:** PDF generation request is sent

### Step 4: Verify PDF Generation Process
1. Verify system retrieves all project data from database:
   - Powerplant name
   - All parts with their checkups
   - All checkup statuses
   - All documentation (images and descriptions) for parts
2. Verify system sends project data to PDF Generator Service
3. Verify PDF Generator Service creates PDF document

**Expected Result:** PDF generation process is initiated

### Step 5: Verify PDF Content
1. Verify PDF file is generated and downloaded to user's device
2. Open downloaded PDF file
3. Verify PDF contains cover page with:
   - Powerplant name: "Wind Farm Alpha"
   - Project date
4. Verify PDF contains table of contents
5. Verify PDF contains section for each part showing:
   - Part name
   - List of checkups with their statuses (bad/average/good)
   - Associated images (embedded in PDF)
   - Associated descriptions
6. Verify PDF contains footer with page numbers
7. Verify PDF formatting is correct (headers, layout, styling)

**Expected Result:** PDF contains all required project data and is properly formatted

### Step 6: Verify Project Status Updated
1. Query database for project record
2. Verify project status is changed to "Finished"
3. Verify finished_at timestamp is set
4. Verify project data remains unchanged (parts, checkups, statuses)

**Expected Result:** Project status is updated to "Finished" in database

### Step 7: Verify Redirect to Home Screen
1. Verify user is redirected to Home Screen after PDF generation
2. Verify Home Screen displays updated project list
3. Verify project "Wind Farm Alpha" shows status "Finished" with green badge
4. Verify project is sorted correctly in list

**Expected Result:** User is redirected to Home Screen with updated project status

### Step 8: Verify PDF File Properties
1. Verify PDF file size is within limits (maximum 50 MB)
2. Verify PDF file is valid and can be opened in standard PDF readers
3. Verify PDF file name is descriptive (includes project/powerplant name or ID)

**Expected Result:** PDF file is valid and properly sized

### Step 9: Verify API Request
1. Verify API request was made to finish report endpoint
2. Verify request included:
   - Project ID: `project-uuid-001`
   - Valid JWT token
3. Verify response time was acceptable (within 30 seconds for generation)
4. Verify response indicates success

**Expected Result:** API request was successful

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-001` (project to finish)
- **User ID:** `user-uuid-001` (from authenticated session)

### Database State
- Project exists with status "In Progress"
- All checkups have statuses set (no null values)
- Parts have associated documentation (images and descriptions)
- PDF Generator Service is available

### Authentication State
- User is authenticated with valid JWT token
- Token is included in API requests
- Session is active

## Expected Outcomes

### UI Outcomes
- "Finish Report" button is displayed and enabled
- Loading state is shown during PDF generation
- PDF file is automatically downloaded to user's device
- User is redirected to Home Screen after generation
- Project status is updated to "Finished" in project list
- No error messages displayed

### API Outcomes
- Finish report endpoint returns HTTP 200 (OK) or HTTP 201 (Created)
- Response indicates success
- PDF file is included in response or download is triggered
- Response time is within 30 seconds (as per performance requirements)

### Database Outcomes
- Project status is updated to "Finished"
- Finished_at timestamp is set
- Project data remains unchanged
- All checkup statuses are preserved

### PDF Generation Outcomes
- PDF file is generated successfully
- PDF contains all required sections:
  - Cover page with powerplant name and date
  - Table of contents
  - Sections for each part with checkups and statuses
  - Images embedded in PDF
  - Descriptions included
  - Footer with page numbers
- PDF file size is within limits (maximum 50 MB)
- PDF is valid and can be opened in standard readers

### Performance Outcomes
- PDF generation completes within 30 seconds (as per performance requirements)
- Download is initiated promptly after generation
- Page navigation is smooth

## Cleanup Steps
1. Delete downloaded PDF file from test device (if needed)
2. Optionally reset project status to "In Progress" (if needed for other tests)
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- All checkups must have statuses set before project can be finished
- PDF generation must include all project data (parts, checkups, statuses, documentation)
- PDF should be automatically downloaded (not just generated)
- Project status must be updated to "Finished" after successful generation
- PDF Generator Service (Puppeteer) must be available and functional
- PDF generation may take up to 30 seconds for typical projects
- Project cannot be modified after being marked as "Finished"
