# Critical Path Test Scenario

## Test Overview

**Test Name:** Critical Path - Complete User Journey (Happy Path Only)

**Description:** This test covers the most critical user journey from registration through project completion and PDF download. This is a happy path test with no negative scenarios - all operations are expected to succeed.

**Related Use Cases:**
- Use Case 1: User Registration
- Use Case 2: User Login
- Use Case 5: Start New Project
- Use Case 6: Select Powerplant
- Use Case 7: Create Project
- Use Case 8: View Ongoing Project
- Use Case 9: Set Checkup Status (multiple checkups)
- Use Case 10: View Documentation
- Use Case 11: Finish Report
- Use Case 12: Download PDF Report

**Test Duration:** Estimated 5-10 minutes

**Prerequisites:**
- Application is running and accessible
- Database is accessible and contains at least one powerplant with:
  - At least 2 parts
  - At least 2 checkups per part
  - At least one checkup with documentation (images and text)
- Browser is open and ready
- No existing user with test credentials exists (or test database is clean)

## Test Data Requirements

**User Registration Data:**
- Username: `test_user_critical_$(timestamp)` (e.g., `test_user_critical_1704067200`)
- Email: `test_critical_$(timestamp)@example.com` (e.g., `test_critical_1704067200@example.com`)
- Password: `TestPassword123!`
- Password Confirmation: `TestPassword123!`

**Powerplant Data:**
- Use existing powerplant from test database (first available powerplant)
- Powerplant must have at least 2 parts with at least 2 checkups each

**Project Data:**
- Project will be created during test execution
- Project status: "In Progress" initially, "Finished" after report completion

**Checkup Status Data:**
- Set status for at least 3 different checkups:
  - At least one "bad" status
  - At least one "average" status
  - At least one "good" status

## Test Steps

### Phase 1: User Registration

**Step 1:** Navigate to application login screen
- **Action:** Open browser and navigate to application URL
- **Expected Result:** Login screen is displayed with:
  - Application title "Wind Power Plant Investigation" visible
  - Username/Email input field visible
  - Password input field visible
  - Login button visible
  - "Register" link visible

**Step 2:** Navigate to registration screen
- **Action:** Click on "Register" link
- **Expected Result:** Registration screen is displayed with:
  - Username input field visible
  - Email input field visible
  - Password input field visible
  - Password confirmation input field visible
  - Register button visible
  - "Back to Login" link visible

**Step 3:** Fill registration form
- **Action:** Enter test data:
  - Username: `test_user_critical_$(timestamp)`
  - Email: `test_critical_$(timestamp)@example.com`
  - Password: `TestPassword123!`
  - Password Confirmation: `TestPassword123!`
- **Expected Result:** All fields are filled with entered values

**Step 4:** Submit registration
- **Action:** Click "Register" button
- **Expected Result:** 
  - Form is submitted
  - Loading indicator appears (if applicable)
  - User is redirected to login screen
  - Success message is displayed (e.g., "Registration successful. Please login.")

**Verification:** 
- User account is created in database
- Password is hashed (not stored in plain text)
- User can be queried by username or email

### Phase 2: User Login

**Step 5:** Fill login form
- **Action:** On login screen, enter credentials:
  - Username/Email: `test_user_critical_$(timestamp)` (or email)
  - Password: `TestPassword123!`
- **Expected Result:** Fields are filled with entered values

**Step 6:** Submit login
- **Action:** Click "Login" button
- **Expected Result:**
  - Form is submitted
  - Loading indicator appears (if applicable)
  - User is authenticated
  - Session is created
  - User is redirected to Home screen

**Verification:**
- Session token is created and stored
- User is authenticated (session is valid)
- Home screen is displayed

### Phase 3: Start New Project

**Step 7:** Verify Home screen
- **Action:** Wait for Home screen to load
- **Expected Result:** Home screen displays:
  - Header bar with application title and user menu
  - Page title "My Projects"
  - "Start Project" button visible (top right)
  - Projects list area visible (may be empty)
  - User menu shows username

**Step 8:** Navigate to Start Project screen
- **Action:** Click "Start Project" button
- **Expected Result:**
  - Navigation to Start Project screen occurs
  - Start Project screen displays:
    - Page title "Start New Project"
    - Powerplant dropdown selector visible
    - Parts and checkups area visible (initially empty)
    - "Create" button visible (initially disabled)
    - "Back" or "Cancel" link/button visible

**Verification:**
- Powerplant dropdown is populated with powerplants from database
- At least one powerplant is available in dropdown

### Phase 4: Select Powerplant

**Step 9:** Select powerplant
- **Action:** Click on powerplant dropdown and select first available powerplant
- **Expected Result:**
  - Powerplant is selected in dropdown
  - Loading indicator appears (if applicable)
  - Parts and checkups are loaded and displayed:
    - Parts list is shown
    - Each part displays its name
    - Each part shows associated checkups
    - Checkups show their names
    - Documentation indicators are shown (if applicable)
  - "Create" button becomes enabled

**Verification:**
- Parts are retrieved from database for selected powerplant
- Checkups are retrieved for each part
- Display order is correct (if specified)
- At least 2 parts with at least 2 checkups each are displayed

### Phase 5: Create Project

**Step 10:** Create project
- **Action:** Click "Create" button
- **Expected Result:**
  - Form is submitted
  - Loading indicator appears (if applicable)
  - Project is created in database
  - User is redirected to Home screen
  - Project list is refreshed

**Step 11:** Verify project in list
- **Action:** Wait for Home screen to load and verify project list
- **Expected Result:** 
  - Home screen displays updated project list
  - New project appears in list with:
    - Powerplant name displayed correctly
    - Status badge showing "In Progress" (orange/yellow color)
    - Created date displayed
    - Project is clickable (hover effect visible)

**Verification:**
- Project record exists in database with:
  - `user_id` matches logged-in user
  - `powerplant_id` matches selected powerplant
  - `status` = "In Progress"
  - `created_at` is set to current timestamp
  - `finished_at` is NULL

### Phase 6: View Ongoing Project

**Step 12:** Open project
- **Action:** Double-click on the newly created project item
- **Expected Result:**
  - Navigation to Ongoing Project screen occurs
  - Ongoing Project screen displays:
    - Powerplant name as large heading at top
    - "Finish Report" button visible in top right (enabled)
    - Parts list in left/middle column:
      - All parts from powerplant are listed
      - Each part shows associated checkups
      - Checkups show their names
      - Status indicators show "unset" (gray) for all checkups
    - Documentation panel on right side (initially empty or showing default message)

**Verification:**
- Project data is loaded correctly
- Powerplant name matches selected powerplant
- All parts and checkups are displayed
- No checkup statuses are set yet (all unset)

### Phase 7: Set Checkup Status (Multiple Checkups)

**Step 13:** Set first checkup status to "bad"
- **Action:** 
  - Click on first checkup in the list
  - Select status "bad" from status selector
- **Expected Result:**
  - Status selector appears (if not inline)
  - Status "bad" is selected
  - Status indicator updates to show "bad" (red color)
  - Status is saved to database
  - UI updates immediately

**Verification:**
- CheckupStatus record is created/updated in database:
  - `project_id` matches current project
  - `checkup_id` matches selected checkup
  - `status_value` = "bad"
  - `created_at` or `updated_at` is set

**Step 14:** Set second checkup status to "average"
- **Action:**
  - Click on second checkup in the list
  - Select status "average" from status selector
- **Expected Result:**
  - Status "average" is selected
  - Status indicator updates to show "average" (yellow/orange color)
  - Status is saved to database
  - UI updates immediately

**Verification:**
- CheckupStatus record is created/updated in database with `status_value` = "average"

**Step 15:** Set third checkup status to "good"
- **Action:**
  - Click on third checkup in the list
  - Select status "good" from status selector
- **Expected Result:**
  - Status "good" is selected
  - Status indicator updates to show "good" (green color)
  - Status is saved to database
  - UI updates immediately

**Verification:**
- CheckupStatus record is created/updated in database with `status_value` = "good"

**Step 16:** Set remaining checkup statuses
- **Action:** Set status for all remaining checkups (at least set status for all checkups to complete the project)
- **Expected Result:**
  - All checkups have status indicators showing their values
  - All statuses are saved to database
  - "Finish Report" button remains enabled

**Verification:**
- All checkups have corresponding CheckupStatus records in database
- All status values are valid ("bad", "average", or "good")

### Phase 8: View Documentation

**Step 17:** Select checkup with documentation
- **Action:** Click on a checkup that has documentation (images and/or text)
- **Expected Result:**
  - Checkup is selected (highlighted in parts list)
  - Documentation panel updates to show:
    - Selected checkup name as header
    - Images are displayed (if available) in scrollable gallery
    - Text descriptions are displayed (if available)
    - Images load successfully
    - Text is readable and formatted correctly

**Verification:**
- Documentation data is retrieved from database
- Images are decoded from BYTEA array correctly
- Text descriptions are displayed correctly
- Image loading completes within 500ms per image

**Step 18:** Select different checkup
- **Action:** Click on a different checkup
- **Expected Result:**
  - Documentation panel updates to show new checkup's documentation
  - Previous checkup's documentation is replaced
  - New images load (if available)
  - New text descriptions are displayed (if available)

**Verification:**
- Documentation panel correctly switches between checkups
- No documentation from previous checkup remains visible

### Phase 9: Finish Report

**Step 19:** Verify all checkups have status
- **Action:** Review parts list to ensure all checkups have status indicators set
- **Expected Result:**
  - All checkups show status indicators (bad, average, or good)
  - No checkups show "unset" status
  - "Finish Report" button is enabled

**Step 20:** Finish report
- **Action:** Click "Finish Report" button
- **Expected Result:**
  - Button click is registered
  - Loading indicator appears
  - PDF generation process starts
  - System validates all checkups have status
  - PDF is generated containing:
    - Project header with powerplant name and date
    - Parts list with checkups
    - Status values for each checkup
    - Documentation images and descriptions
    - Project completion timestamp
  - Project status is updated to "Finished"
  - `finished_at` timestamp is set
  - PDF download is triggered
  - User is redirected to Home screen

**Verification:**
- Project status is updated in database to "Finished"
- `finished_at` timestamp is set to current time
- PDF file is generated (in memory or temporary storage)
- PDF contains all required content:
  - Powerplant name
  - All parts and checkups
  - All status values
  - Documentation images and text
- PDF generation completes within 5 seconds

### Phase 10: Download PDF Report

**Step 21:** Verify PDF download
- **Action:** Wait for PDF download to complete
- **Expected Result:**
  - Browser download dialog appears (or automatic download occurs)
  - PDF file is downloaded to default download location
  - PDF filename follows pattern: `Project_[ProjectID]_[PowerplantName]_[Date].pdf`
  - File size is within limits (< 25 MB, typically 2-5 MB)

**Verification:**
- PDF file exists in download location
- PDF file can be opened
- PDF content matches project data:
  - Powerplant name is correct
  - All parts are listed
  - All checkups are listed
  - Status values are correct
  - Images are included and visible
  - Text descriptions are included

### Phase 11: Verify Project Status

**Step 22:** Verify project status on Home screen
- **Action:** On Home screen, locate the finished project
- **Expected Result:**
  - Project appears in list with:
    - Powerplant name displayed correctly
    - Status badge showing "Finished" (green color)
    - Created date displayed
    - Finished date may be displayed (if UI shows it)

**Verification:**
- Project status in database is "Finished"
- `finished_at` timestamp is set
- Status badge color is green

**Step 23:** Attempt to open finished project
- **Action:** Double-click on the finished project
- **Expected Result:**
  - Ongoing Project screen opens
  - Powerplant name is displayed
  - All parts and checkups are displayed
  - All status values are shown (read-only)
  - Documentation is accessible
  - "Finish Report" button is disabled or hidden (project is already finished)

**Verification:**
- Project data is displayed correctly
- Status values cannot be modified (if UI enforces this)
- Project remains in "Finished" state

## Test Completion

**Final Verification:**
- All test steps completed successfully
- All assertions passed
- No errors occurred during test execution
- Database state is consistent:
  - User account exists
  - Project exists and is marked "Finished"
  - All CheckupStatus records exist
  - All relationships are maintained

**Cleanup (Optional):**
- Test user account may be deleted (if using test database)
- Test project may be deleted (if using test database)
- PDF file may be deleted from download location

## Performance Assertions

- Registration: < 1 second
- Login: < 500ms
- Home screen load: < 2 seconds
- Start Project screen load: < 2 seconds
- Powerplant selection: < 1 second
- Project creation: < 500ms
- Ongoing Project screen load: < 3 seconds
- Status update: < 300ms per checkup
- Documentation load: < 500ms for 5 images
- PDF generation: < 5 seconds
- PDF download initiation: < 100ms

## Notes

- This test covers only happy path scenarios
- All operations are expected to succeed
- No error conditions are tested in this scenario
- For error scenarios, refer to individual use case test files (02-13)
- Test data must be unique to avoid conflicts with other test executions
- Timestamps in test data ensure uniqueness across test runs
