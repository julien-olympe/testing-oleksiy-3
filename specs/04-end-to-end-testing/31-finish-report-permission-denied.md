# Test 31: Finish Report and Generate PDF - Permission Denied

## Test ID
E2E-UC8-NEG-003

## Test Name
Finish Report and Generate PDF - Permission Denied Error

## Description
This test verifies that the system correctly prevents users from finishing projects they do not own. The system should display an appropriate error message and not generate the PDF or update the project status.

## Prerequisites
- Test database is initialized and accessible
- Application is running and accessible
- Test user account exists and is authenticated:
  - Username: `testuser`
  - User ID: `user-uuid-001`
- Another user account exists:
  - Username: `otheruser`
  - User ID: `user-uuid-002`
- Project exists in database assigned to other user:
  - Project ID: `project-uuid-other`
  - User ID: `user-uuid-002` (assigned to other user, NOT test user)
  - Powerplant: "Wind Farm Beta"
  - Status: "In Progress"
  - All checkups have statuses set
- Test user attempts to access other user's project (unauthorized access)
- Browser is open with active session

## Test Steps

### Step 1: Attempt Unauthorized Access
1. Verify test user is logged in
2. Attempt to access other user's project by:
   - Directly navigating to project URL with project ID `project-uuid-other`, OR
   - Modifying API request to include other user's project ID
3. If project is accessible (should not be), verify "Finish Report" button is displayed

**Expected Result:** Unauthorized access is attempted

### Step 2: Attempt to Finish Report
1. If project is accessible, click "Finish Report" button
2. Send finish report request with:
   - Project ID: `project-uuid-other` (other user's project)
3. Wait for request to complete

**Expected Result:** Finish report request is sent (or prevented)

### Step 3: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "You do not have permission to finish this project."
3. Verify error message is displayed in appropriate location (error banner or page)
4. Verify error message is styled appropriately (red text, visible)
5. Verify no PDF is generated or downloaded

**Expected Result:** Error message is displayed, no PDF generated

### Step 4: Verify Project Status Not Changed
1. Query database for project record
2. Verify project status remains "In Progress" (not changed to "Finished")
3. Verify finished_at timestamp is not set
4. Verify project data remains unchanged

**Expected Result:** Project status is not updated

### Step 5: Verify API Response
1. Verify API request was made to finish report endpoint
2. Verify request included valid JWT token for test user
3. Verify response returns HTTP 403 (Forbidden)
4. Verify response includes error message: "You do not have permission to finish this project."

**Expected Result:** API returns appropriate error status

### Step 6: Verify Access Control
1. Verify system checked project ownership before allowing finish operation
2. Verify system did not generate PDF for unauthorized user
3. Verify system did not update project status
4. Verify database query included user ID validation
5. Verify unauthorized access attempt is logged (security best practice)

**Expected Result:** Access control is enforced at API/database level

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-other` (other user's project)
- **User ID:** `user-uuid-001` (test user, NOT project owner)

### Database State
- Test user exists: `user-uuid-001`
- Other user exists: `user-uuid-002`
- Project exists assigned to other user:
  - ID: `project-uuid-other`
  - User ID: `user-uuid-002` (NOT test user)
  - Status: "In Progress"
  - All checkups have statuses set

### Authentication State
- Test user is authenticated with valid JWT token
- Token is included in API requests
- Session is active
- Token contains test user's user ID

## Expected Outcomes

### UI Outcomes
- Error message "You do not have permission to finish this project." is displayed
- Error message is clearly visible and styled appropriately
- No PDF file is generated or downloaded
- Project status is not updated in UI (if project was accessible)

### API Outcomes
- Finish report endpoint returns HTTP 403 (Forbidden)
- Response includes error message: "You do not have permission to finish this project."
- PDF generation is not initiated
- Project status is not updated
- Response time is acceptable

### Database Outcomes
- System checks project ownership before finishing project
- Project status is not updated for unauthorized user
- Finished_at timestamp is not set
- Database query includes user ID validation
- Access control is enforced

### PDF Generation Outcomes
- PDF generation is not initiated
- No PDF file is generated
- No PDF file is downloaded

### Security Outcomes
- Unauthorized finish operation is prevented
- Error message does not reveal project existence (if project doesn't exist for user)
- Unauthorized access attempt may be logged
- Access control is enforced at multiple levels (API, database)

### Performance Outcomes
- Error response is returned promptly
- Error message is displayed immediately
- No performance issues

## Cleanup Steps
1. Verify other user's project was not modified
2. Verify project status remains "In Progress"
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- Access control must be enforced at API level
- Project ownership must be verified before allowing finish operation
- Error message must match exact specification from functional requirements
- Unauthorized access attempts should be logged for security auditing
- This test verifies security and access control functionality
- Users should only be able to finish their own projects
