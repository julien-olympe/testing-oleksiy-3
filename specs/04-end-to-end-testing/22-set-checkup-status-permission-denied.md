# Test 22: Set Checkup Status - Permission Denied

## Test ID
E2E-UC6-NEG-002

## Test Name
Set Checkup Status - Permission Denied Error

## Description
This test verifies that the system correctly prevents users from modifying checkup statuses in projects they do not own. The system should display an appropriate error message and not allow status updates.

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
  - Checkup exists with ID: `checkup-uuid-other`
- Test user attempts to access other user's project (unauthorized access)
- Browser is open with active session

## Test Steps

### Step 1: Attempt Unauthorized Access
1. Verify test user is logged in
2. Attempt to access other user's project by:
   - Directly navigating to project URL with project ID `project-uuid-other`, OR
   - Modifying API request to include other user's project ID
3. If project is accessible (should not be), locate checkup `checkup-uuid-other`

**Expected Result:** Unauthorized access is attempted

### Step 2: Attempt to Modify Checkup Status
1. If project is accessible, attempt to click on a status button for checkup `checkup-uuid-other`
2. Send status update request with:
   - Project ID: `project-uuid-other` (other user's project)
   - Checkup ID: `checkup-uuid-other`
   - Status value: "good"
3. Wait for request to complete

**Expected Result:** Status update request is sent (or prevented)

### Step 3: Verify Error Message Displayed
1. Verify error message is displayed
2. Verify message text is exactly: "You do not have permission to modify this project."
3. Verify error message is displayed in appropriate location (error banner or page)
4. Verify error message is styled appropriately (red text, visible)
5. Verify checkup status is not updated in UI

**Expected Result:** Error message is displayed, status is not updated

### Step 4: Verify Status Not Updated
1. Verify checkup status remains unchanged in UI (if project was accessible)
2. Query database for checkup status record
3. Verify status value remains unchanged
4. Verify no update was made to database

**Expected Result:** Status is not updated in UI or database

### Step 5: Verify API Response
1. Verify API request was made to update checkup status endpoint
2. Verify request included valid JWT token for test user
3. Verify response returns HTTP 403 (Forbidden)
4. Verify response includes error message: "You do not have permission to modify this project."

**Expected Result:** API returns appropriate error status

### Step 6: Verify Access Control
1. Verify system checked project ownership before allowing status update
2. Verify system did not update status for unauthorized user
3. Verify database query included user ID validation
4. Verify unauthorized access attempt is logged (security best practice)

**Expected Result:** Access control is enforced at API/database level

## Test Data Requirements

### Input Data
- **Project ID:** `project-uuid-other` (other user's project)
- **Checkup ID:** `checkup-uuid-other` (checkup in other user's project)
- **Status Value:** Attempt to set to "good"

### Database State
- Test user exists: `user-uuid-001`
- Other user exists: `user-uuid-002`
- Project exists assigned to other user:
  - ID: `project-uuid-other`
  - User ID: `user-uuid-002` (NOT test user)
  - Status: "In Progress"
- Checkup exists in other user's project

### Authentication State
- Test user is authenticated with valid JWT token
- Token is included in API requests
- Session is active
- Token contains test user's user ID

## Expected Outcomes

### UI Outcomes
- Error message "You do not have permission to modify this project." is displayed
- Error message is clearly visible and styled appropriately
- Checkup status is not updated in UI
- User cannot modify checkup statuses in unauthorized projects

### API Outcomes
- Update checkup status endpoint returns HTTP 403 (Forbidden)
- Response includes error message: "You do not have permission to modify this project."
- Status is not updated
- Response time is acceptable

### Database Outcomes
- System checks project ownership before updating status
- Status is not updated for unauthorized user
- Database query includes user ID validation
- Access control is enforced

### Security Outcomes
- Unauthorized modification is prevented
- Error message does not reveal project existence (if project doesn't exist for user)
- Unauthorized access attempt may be logged
- Access control is enforced at multiple levels (API, database)

### Performance Outcomes
- Error response is returned promptly
- Error message is displayed immediately
- No performance issues

## Cleanup Steps
1. Verify other user's project was not modified
2. Verify checkup status was not changed
3. Logout user (if session persists)
4. Clear browser session and cookies
5. Close browser instance (if not reused for other tests)

## Notes
- Access control must be enforced at API level
- Project ownership must be verified before allowing status updates
- Error message must match exact specification from functional requirements
- Unauthorized access attempts should be logged for security auditing
- This test verifies security and access control functionality
- Users should only be able to modify checkups in their own projects
