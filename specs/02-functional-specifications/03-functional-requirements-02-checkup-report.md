# 3 - Functional Requirements (Part 2: Checkup Management and Report Generation)

## Checkup Management Use Cases

### Use Case 6: Set Checkup Status

**Description:** An authenticated user sets the status of a checkup within an ongoing project. The status can be set to bad, average, or good. The status is immediately saved to the database.

**Actors Involved:**
- User (authenticated)

**Inputs and Their Sources:**
- User ID (from authenticated session)
- Project ID (from current Ongoing Project Screen)
- Checkup ID (from user clicking on a checkup)
- Status value (user selection: bad, average, or good)

**Processing / Actions:**
1. System retrieves user ID from authenticated session
2. System validates user has access to the project
3. System validates project status is "In Progress" (cannot modify Finished projects)
4. System validates checkup belongs to the project's powerplant
5. System updates checkup status record in database with selected status value
6. System updates visual indicator on screen to reflect new status
7. System saves timestamp of status change

**Outputs:**
- Checkup status updated successfully, visual indicator changed on screen (color/badge)
- Error message if project is Finished: "Cannot modify checkups in a finished project."
- Error message if update fails: "Unable to save status. Please try again."
- Error message if user lacks permission: "You do not have permission to modify this project."

---

### Use Case 7: View Documentation/Images for Parts

**Description:** An authenticated user views documentation (images and text descriptions) associated with a part. Documentation is displayed in the right panel when a part is selected.

**Actors Involved:**
- User (authenticated)

**Inputs and Their Sources:**
- User ID (from authenticated session)
- Project ID (from current Ongoing Project Screen)
- Part ID (from user clicking on a part in the parts list)

**Processing / Actions:**
1. System retrieves user ID from authenticated session
2. System validates user has access to the project
3. System retrieves part information from database
4. System retrieves all documentation records (images and descriptions) linked to the part
5. System displays documentation in right panel:
   - Images displayed as thumbnails (clickable to view full size)
   - Text descriptions displayed below images
6. System highlights selected part in the parts list

**Outputs:**
- Documentation panel displays images and descriptions for selected part
- Empty state if no documentation exists: "No documentation available for this part."
- Error message if documentation cannot be loaded: "Unable to load documentation. Please try again."
- Error message if image fails to load: Placeholder icon displayed with "Image unavailable" text

---

## Report Generation Use Cases

### Use Case 8: Finish Report and Generate PDF

**Description:** An authenticated user completes an inspection project by generating a PDF report. The PDF contains all project information including powerplant name, parts, checkup statuses, and documentation. After generation, the project status is set to Finished and the PDF is automatically downloaded.

**Actors Involved:**
- User (authenticated)
- PDF Generator Service

**Inputs and Their Sources:**
- User ID (from authenticated session)
- Project ID (from current Ongoing Project Screen)
- User action (clicking "Finish Report" button)

**Processing / Actions:**
1. System retrieves user ID from authenticated session
2. System validates user has access to the project
3. System validates project status is "In Progress"
4. System retrieves all project data from database:
   - Powerplant name
   - All parts with their checkups
   - All checkup statuses
   - All documentation (images and descriptions) for parts
5. System sends project data to PDF Generator Service
6. PDF Generator Service creates PDF document with:
   - Cover page with powerplant name and project date
   - Table of contents
   - Section for each part showing:
     - Part name
     - List of checkups with their statuses (bad/average/good)
     - Associated images (embedded in PDF)
     - Associated descriptions
   - Footer with page numbers
7. System receives generated PDF file from PDF Generator Service
8. System triggers automatic download of PDF file to user's device
9. System updates project status to "Finished" in database
10. System saves completion timestamp
11. System redirects user to Home Screen

**Outputs:**
- PDF file automatically downloaded to user's device
- Project status changed to "Finished" in database
- User redirected to Home Screen with updated project status visible
- Error message if PDF generation fails: "Unable to generate PDF report. Please try again." (project remains In Progress)
- Error message if project update fails: "PDF generated but project status update failed. Please contact support."
- Error message if user lacks permission: "You do not have permission to finish this project."
