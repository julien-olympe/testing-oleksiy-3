# 3. Functional Requirements - Use Cases 10-12

## Use Case 10: View Documentation

**Use Case Name:** Display Checkup Documentation

**Description:** An authenticated user views documentation (images and descriptions) associated with a checkup. The documentation is displayed in the right panel of the Ongoing Project screen.

**Actors Involved:** Authenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- Checkup ID (from user selection)
- Documentation data (from database: images and text descriptions)

**Processing/Actions:**
1. User clicks on a checkup in the parts/checkups list
2. System retrieves checkup ID
3. System queries database for documentation associated with checkup
4. System retrieves images (BLOB data from PostgreSQL BYTEA array)
5. System retrieves text descriptions
6. System displays images in right panel
7. System displays text descriptions in right panel

**Outputs including errors:**
- Success: Documentation displayed in right panel with images and descriptions
- Error: No documentation found - display message "No documentation available for this checkup"
- Error: Image load failure - display placeholder or error icon for failed images
- Error: Database query failure - display error message, show empty documentation panel

---

## Use Case 11: Finish Report

**Use Case Name:** Generate and Complete Project Report

**Description:** An authenticated user completes a project by clicking the "Finish Report" button. The system generates a PDF report containing all parts, checkups, statuses, and documentation, then marks the project as Finished.

**Actors Involved:** Authenticated User (Field Technician)

**Inputs and Sources:**
- Project ID (from current project context)
- Project data (from database)
- Powerplant data (from database)
- Parts data (from database)
- Checkups data (from database)
- Checkup statuses (from database)
- Documentation data (from database)

**Processing/Actions:**
1. User clicks "Finish Report" button on Ongoing Project screen
2. System validates project is in "In Progress" status
3. System validates user has access to project
4. System retrieves all project data:
   - Powerplant name
   - All parts with checkups
   - All checkup statuses
   - All documentation references
5. System generates PDF document containing:
   - Project header with powerplant name and date
   - Parts list with checkups
   - Status values for each checkup
   - Documentation images and descriptions
   - Project completion timestamp
6. System updates project status to "Finished"
7. System sets finished_at to current timestamp
8. System saves project update to database
9. System triggers PDF download to user's browser
10. System redirects user to home screen

**Outputs including errors:**
- Success: PDF generated and downloaded, project marked as Finished, redirect to home screen with updated status
- Error: Project already Finished - display error message "Project is already finished", do not regenerate
- Error: Missing checkup statuses - display warning "Some checkups have no status", allow user to proceed or cancel
- Error: PDF generation failure - display error message "Unable to generate report", do not mark as Finished
- Error: Database update failure - display error message "Unable to complete project", do not mark as Finished
- Error: Access denied - display error message, do not proceed
- Error: Session expired - redirect to login screen

---

## Use Case 12: Download PDF Report

**Use Case Name:** Retrieve Generated Report

**Description:** The system provides the generated PDF report file to the user's browser for download. This occurs automatically after PDF generation in the Finish Report use case.

**Actors Involved:** Authenticated User (Field Technician)

**Inputs and Sources:**
- Generated PDF file (from PDF generation process)
- HTTP response headers (for file download)

**Processing/Actions:**
1. System has generated PDF file in memory or temporary storage
2. System sets HTTP response headers:
   - Content-Type: application/pdf
   - Content-Disposition: attachment; filename="Project_[ProjectID]_[PowerplantName]_[Date].pdf"
3. System streams PDF file to browser
4. Browser triggers download dialog or automatic download
5. System cleans up temporary file (if used)

**Outputs including errors:**
- Success: PDF file downloaded to user's default download location
- Error: File not found - display error message "Report file not available"
- Error: Network error - browser displays download failure
- Error: Browser does not support download - display message "Please enable downloads in your browser"
