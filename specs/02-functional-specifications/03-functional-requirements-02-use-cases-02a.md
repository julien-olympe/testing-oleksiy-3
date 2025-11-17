# 3. Functional Requirements - Use Cases 7-9

## Use Case 7: Create Project

**Use Case Name:** Create New Project Assignment

**Description:** An authenticated user creates a new project by selecting a powerplant and clicking the Create button. The system creates a project record, assigns it to the user, and adds it to the user's project list.

**Actors Involved:** Authenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- Powerplant ID (from dropdown selection)
- User ID (from session)
- Current date/time (system generated)

**Processing/Actions:**
1. User has selected a powerplant on Start Project screen
2. User clicks "Create" button
3. System validates powerplant is selected
4. System retrieves user ID from session
5. System creates project record with:
   - user_id = current user
   - powerplant_id = selected powerplant
   - status = "In Progress"
   - created_at = current timestamp
   - finished_at = NULL
6. System saves project to database
7. System redirects user to home screen
8. System refreshes project list to show new project

**Outputs including errors:**
- Success: Project created, assigned to user, redirect to home screen with new project visible in list
- Error: Powerplant not selected - display error message "Please select a powerplant", remain on Start Project screen
- Error: Database save failure - display error message "Unable to create project", remain on Start Project screen
- Error: Session expired - redirect to login screen
- Error: Invalid powerplant ID - display error message, remain on Start Project screen

---

## Use Case 8: View Ongoing Project

**Use Case Name:** Display Project Inspection Interface

**Description:** An authenticated user views the Ongoing Project screen which displays the powerplant name, all parts with their checkups, current status values, and associated documentation.

**Actors Involved:** Authenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- Project ID (from project selection)
- Project data (from database)
- Powerplant data (from database)
- Parts data (from database)
- Checkups data (from database)
- Checkup statuses (from database)
- Documentation data (from database)

**Processing/Actions:**
1. System displays powerplant name at top of screen
2. System displays parts list in middle section
3. For each part, system displays associated checkups
4. For each checkup, system displays current status (bad/average/good or unset)
5. System displays documentation section on right side
6. System shows images and descriptions for selected checkup
7. System displays "Finish Report" button in top right corner

**Outputs including errors:**
- Success: Ongoing Project screen fully rendered with all data
- Error: Missing project data - display error message, redirect to home screen
- Error: Missing powerplant data - display error message, redirect to home screen
- Error: Unable to load parts/checkups - display error message, show partial screen

---

## Use Case 9: Set Checkup Status

**Use Case Name:** Update Checkup Evaluation

**Description:** An authenticated user sets or updates the status value for a checkup in an ongoing project. The status can be bad, average, or good.

**Actors Involved:** Authenticated User (Field Technician)

**Inputs and Sources:**
- Project ID (from current project context)
- Checkup ID (from user click on checkup)
- Status value (from user selection: bad, average, or good)
- User session (from authentication)

**Processing/Actions:**
1. User clicks on a checkup in the Ongoing Project screen
2. System displays status selection interface (dropdown or buttons)
3. User selects status value (bad, average, or good)
4. System validates project is in "In Progress" status
5. System validates user has access to project
6. System updates or creates CheckupStatus record:
   - project_id = current project
   - checkup_id = selected checkup
   - status_value = selected status
   - updated_at = current timestamp
7. System saves to database
8. System updates UI to reflect new status

**Outputs including errors:**
- Success: Status updated, UI reflects new status value with visual indicator
- Error: Project is Finished - display error message "Cannot update status on finished project", do not save
- Error: Invalid status value - display error message, do not save
- Error: Database save failure - display error message "Unable to save status", revert UI
- Error: Access denied - display error message, do not save
- Error: Session expired - redirect to login screen
