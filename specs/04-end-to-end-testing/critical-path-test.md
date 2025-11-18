# Critical Path Test - Complete Happy Path Flow

## Test ID
E2E-CP-001

## Test Name
Critical Path Test - Complete Happy Path: Registration → Login → View Projects → Start Project → View Project → Set Checkup Statuses → View Documentation → Finish Report and Generate PDF

## Description
This test verifies the complete end-to-end happy path flow of the Wind Power Plant Status Investigation App. It covers the entire user journey from initial registration through project completion and PDF report generation. This is a single, comprehensive flow that tests all major functionality in sequence without any negative scenarios.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- PDF Generator Service (Puppeteer) is available and functional
- Test file storage is accessible
- Powerplant exists in database:
  - Powerplant ID: `powerplant-uuid-alpha`
  - Powerplant Name: "Wind Farm Alpha"
  - Parts: At least 5 parts
  - Each part has at least 3 checkups
  - At least 2 parts have documentation (images and descriptions)
- Browser is open and ready
- No existing user with test credentials exists

## Test Steps

### Phase 1: User Registration

#### Step 1.1: Navigate to Application
1. Open browser and navigate to application login page
2. Verify Login Screen is displayed with username, password fields, and "Register" link

**Expected Result:** Login Screen is displayed

#### Step 1.2: Navigate to Registration
1. Click on "Register" link/button
2. Verify registration form is displayed with username, email, password, and password confirmation fields

**Expected Result:** Registration form is displayed

#### Step 1.3: Enter Registration Data
1. Generate unique username: `testuser_${timestamp}`
2. Generate unique email: `testuser_${timestamp}@example.com`
3. Enter password: `TestPass123`
4. Enter password confirmation: `TestPass123`

**Expected Result:** All fields are populated with valid data

#### Step 1.4: Submit Registration
1. Click "Register" or "Submit" button
2. Wait for registration to complete (maximum 1 second)

**Expected Result:** Registration request is sent

#### Step 1.5: Verify Registration Success
1. Verify user is automatically logged in
2. Verify user is redirected to Home Screen
3. Verify Home Screen displays user information in header
4. Verify "Start Project" button is visible

**Expected Result:** User is successfully registered and logged in

---

### Phase 2: View Assigned Projects (Empty State)

#### Step 2.1: Verify Home Screen
1. Verify Home Screen is displayed
2. Verify header shows user information
3. Verify "Start Project" button is visible
4. Verify project list area is displayed

**Expected Result:** Home Screen is displayed correctly

#### Step 2.2: Verify Empty State
1. Verify empty state message is displayed: "You have no assigned projects. Click 'Start Project' to create one."
2. Verify no project items are displayed
3. Verify "Start Project" button is functional

**Expected Result:** Empty state is displayed correctly

---

### Phase 3: Start New Project

#### Step 3.1: Navigate to Start Project Screen
1. Click "Start Project" button
2. Verify navigation to Start Project Screen
3. Verify screen displays:
   - Back button (top left)
   - Screen title: "Start New Project"
   - Powerplant selector dropdown
   - Preview section (initially hidden)
   - "Create" button (initially disabled)

**Expected Result:** Start Project Screen is displayed

#### Step 3.2: Select Powerplant
1. Click on powerplant selector dropdown
2. Verify dropdown displays list of available powerplants
3. Select powerplant "Wind Farm Alpha" from dropdown
4. Verify selected powerplant is displayed in dropdown

**Expected Result:** Powerplant is selected

#### Step 3.3: Verify Preview Displayed
1. Verify preview section is displayed after powerplant selection
2. Verify preview shows parts and checkups for selected powerplant
3. Verify preview shows at least 5 parts
4. Verify each part shows at least 3 checkups
5. Verify "Create" button is now enabled

**Expected Result:** Preview displays parts and checkups, Create button enabled

#### Step 3.4: Create Project
1. Click "Create" button
2. Wait for project creation to complete (maximum 2 seconds)
3. Verify loading state is shown during creation

**Expected Result:** Project creation request is sent

#### Step 3.5: Verify Project Created
1. Verify user is redirected to Ongoing Project Screen
2. Verify Ongoing Project Screen displays:
   - Powerplant name: "Wind Farm Alpha" (at top)
   - Parts list with checkups
   - Documentation viewer panel
   - "Finish Report" button
   - Back button

**Expected Result:** Project is created and user is redirected to Ongoing Project Screen

---

### Phase 4: View Ongoing Project Details

#### Step 4.1: Verify Project Data Loaded
1. Verify powerplant name "Wind Farm Alpha" is displayed at top
2. Verify parts list is displayed in center section
3. Verify at least 5 parts are displayed
4. Verify each part shows list of checkups
5. Verify all checkups show status buttons (Bad, Average, Good)
6. Verify all checkups have no status set initially (neutral gray buttons)

**Expected Result:** Project data is loaded and displayed correctly

#### Step 4.2: Verify Documentation Viewer
1. Verify documentation viewer panel is displayed on right side
2. Verify panel title: "Documentation"
3. Verify panel shows empty state or placeholder (no part selected yet)

**Expected Result:** Documentation viewer is displayed

---

### Phase 5: Set Multiple Checkup Statuses

#### Step 5.1: Set First Checkup Status to "Good"
1. Locate first checkup in first part
2. Click on "Good" status button
3. Wait for status update to complete (maximum 300 milliseconds)
4. Verify "Good" button is highlighted
5. Verify status indicator (badge) is displayed with green color
6. Verify status is saved

**Expected Result:** First checkup status is set to "Good"

#### Step 5.2: Set Second Checkup Status to "Average"
1. Locate second checkup in first part
2. Click on "Average" status button
3. Wait for status update to complete
4. Verify "Average" button is highlighted
5. Verify status indicator is displayed with yellow color
6. Verify status is saved

**Expected Result:** Second checkup status is set to "Average"

#### Step 5.3: Set Third Checkup Status to "Bad"
1. Locate third checkup in first part
2. Click on "Bad" status button
3. Wait for status update to complete
4. Verify "Bad" button is highlighted
5. Verify status indicator is displayed with red color
6. Verify status is saved

**Expected Result:** Third checkup status is set to "Bad"

#### Step 5.4: Set Remaining Checkup Statuses
1. Set statuses for all remaining checkups in all parts
2. Verify each status update completes successfully
3. Verify visual feedback is immediate for each update
4. Verify all checkups have statuses set (no unset checkups remain)

**Expected Result:** All checkups have statuses set

---

### Phase 6: View Documentation for Parts

#### Step 6.1: Select Part with Documentation
1. Locate a part that has documentation (images and descriptions)
2. Click on the part
3. Wait for documentation to load (maximum 1 second)
4. Verify selected part is highlighted in parts list

**Expected Result:** Part is selected and documentation request is sent

#### Step 6.2: Verify Documentation Displayed
1. Verify documentation viewer displays:
   - Image gallery with thumbnails (at least 2 images)
   - Text descriptions below images
2. Verify images are loaded and visible
3. Verify images are displayed as thumbnails
4. Verify descriptions are readable

**Expected Result:** Documentation is displayed for selected part

#### Step 6.3: View Full-Size Image
1. Click on an image thumbnail
2. Verify full-size image is displayed (in modal, overlay, or new view)
3. Verify image is displayed at larger size
4. Verify image quality is maintained
5. Close full-size view (click outside, close button, or ESC key)

**Expected Result:** Full-size image view works correctly

#### Step 6.4: Select Different Part
1. Click on a different part in parts list
2. Verify documentation viewer updates to show documentation for new part
3. Verify new part is highlighted

**Expected Result:** Documentation viewer updates when different part is selected

---

### Phase 7: Finish Report and Generate PDF

#### Step 7.1: Verify Project Completeness
1. Verify all checkups have statuses set (no unset checkups)
2. Verify "Finish Report" button is displayed in top right corner
3. Verify "Finish Report" button is enabled

**Expected Result:** Project is complete and ready for PDF generation

#### Step 7.2: Click Finish Report Button
1. Click "Finish Report" button
2. Wait for PDF generation to complete (maximum 30 seconds)
3. Verify loading state is shown (button shows loading spinner or progress indicator)
4. Verify user cannot interact with other elements during generation

**Expected Result:** PDF generation request is sent

#### Step 7.3: Verify PDF Generated and Downloaded
1. Verify PDF file is generated and downloaded to user's device
2. Verify download is automatic (no manual download required)
3. Verify PDF file name is descriptive

**Expected Result:** PDF file is automatically downloaded

#### Step 7.4: Verify PDF Content
1. Open downloaded PDF file
2. Verify PDF contains cover page with:
   - Powerplant name: "Wind Farm Alpha"
   - Project date
3. Verify PDF contains table of contents
4. Verify PDF contains section for each part showing:
   - Part name
   - List of checkups with their statuses (bad/average/good)
   - Associated images (embedded in PDF)
   - Associated descriptions
5. Verify PDF contains footer with page numbers
6. Verify PDF formatting is correct (headers, layout, styling)
7. Verify PDF file size is within limits (maximum 50 MB)

**Expected Result:** PDF contains all required project data and is properly formatted

#### Step 7.5: Verify Project Status Updated
1. Verify user is redirected to Home Screen after PDF generation
2. Verify Home Screen displays updated project list
3. Verify project "Wind Farm Alpha" is displayed in list
4. Verify project shows status "Finished" with green badge
5. Query database to verify project status is "Finished"
6. Verify finished_at timestamp is set

**Expected Result:** Project status is updated to "Finished" and displayed correctly

#### Step 7.6: Verify Project in Finished State
1. Double-click on finished project "Wind Farm Alpha"
2. Verify Ongoing Project Screen displays project
3. Verify project data is still accessible (read-only)
4. Verify checkup statuses are displayed (cannot be modified)
5. Verify "Finish Report" button is not available or disabled (project already finished)

**Expected Result:** Finished project is accessible in read-only state

---

## Test Data Requirements

### User Data
- **Username:** `testuser_${timestamp}` (generated at test start)
- **Email:** `testuser_${timestamp}@example.com` (generated at test start)
- **Password:** `TestPass123`

### Project Data
- **Powerplant:** "Wind Farm Alpha" (powerplant-uuid-alpha)
- **Parts:** At least 5 parts
- **Checkups:** At least 3 checkups per part
- **Documentation:** At least 2 parts have images and descriptions

### Database State
- Powerplant "Wind Farm Alpha" exists with parts, checkups, and documentation
- No existing user with test credentials
- Database connection is available
- File storage is accessible

## Expected Outcomes

### Overall Flow Outcomes
- User successfully registers and is automatically logged in
- User views empty project list (empty state)
- User creates new project successfully
- User views project details with all data
- User sets checkup statuses for all checkups
- User views documentation for parts
- User finishes project and generates PDF successfully
- Project status is updated to "Finished"
- User can view finished project in read-only state

### Performance Outcomes
- Registration completes within 1 second
- Project list loads within 500 milliseconds
- Project creation completes within 2 seconds
- Project details load within 1 second
- Status updates complete within 300 milliseconds each
- Documentation loads within 1 second
- PDF generation completes within 30 seconds
- All operations complete within performance requirements

### Database Outcomes
- User account is created with secure password storage
- Project is created with all checkup status records initialized
- Checkup statuses are saved immediately when set
- Project status is updated to "Finished" after PDF generation
- All data is persisted correctly

### PDF Outcomes
- PDF file is generated successfully
- PDF contains all required sections and data
- PDF is automatically downloaded
- PDF is valid and can be opened in standard readers
- PDF file size is within limits

## Cleanup Steps
1. Delete test user account from database
2. Delete test project from database (project and checkup status records)
3. Delete downloaded PDF file from test device
4. Clear browser session and cookies
5. Close browser instance

## Notes
- This is a comprehensive happy path test covering all major functionality
- No negative scenarios are included in this test
- All steps must complete successfully for test to pass
- Test verifies complete user journey from registration to project completion
- Performance requirements must be met at each step
- All data must be persisted correctly throughout the flow
- PDF generation is the final step and must complete successfully
- Finished projects should be accessible in read-only state
