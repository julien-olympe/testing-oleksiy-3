# API: Finish Project and Generate PDF Report

## Endpoint

**Method**: `POST`  
**Path**: `/api/projects/:id/finish`  
**Authentication**: Required (valid session)

## Description

Completes a project by generating a PDF report containing all parts, checkups, statuses, and documentation, then marks the project as "Finished". The PDF is generated server-side and returned as a downloadable file. After successful PDF generation, the project status is updated to "Finished" and `finished_at` timestamp is set.

**Related Use Cases**: 
- Use Case 11 - Finish Report
- Use Case 12 - Download PDF Report (PDF download included in response)

## Request

### Headers

```
Cookie: session=<session-token>
```

### Path Parameters

- `id`: UUID of the project (required, must be valid UUID format)

**Validation Rules:**
- Must be valid UUID v4 format
- Must exist in database
- Must belong to authenticated user
- Must be in "In Progress" status

### Request Body

No request body required.

## Response

### Success Response

**Status Code**: `200 OK`

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Project_[ProjectID]_[PowerplantName]_[Date].pdf"
```

**Response Body:**
Binary PDF file content

**PDF Filename Format:**
`Project_{projectId}_{powerplantName}_{YYYY-MM-DD}.pdf`

Example: `Project_660e8400-e29b-41d4-a716-446655440000_WindFarmAlpha_2024-01-15.pdf`

**PDF Content:**
The PDF report contains:
1. **Header Section:**
   - Project ID
   - Powerplant name
   - Project creation date
   - Project completion date (finished_at)
   - User information (username)

2. **Parts and Checkups Section:**
   - For each part (ordered by displayOrder):
     - Part name and description
     - For each checkup (ordered by displayOrder):
       - Checkup name and description
       - Status value (bad/average/good or "Not Set" if no status)
       - Documentation text (if available)
       - Documentation images (if available, embedded in PDF)

3. **Summary Section:**
   - Total number of parts
   - Total number of checkups
   - Number of checkups with status set
   - Number of checkups without status (if any)

**PDF Generation Details:**
- Page size: A4 (210mm x 297mm)
- Margins: 20mm on all sides
- Font: Standard system fonts (Arial or Helvetica)
- Images: Embedded as JPEG/PNG, maximum size 1920x1080 pixels, compressed
- File size: Typically 2-5 MB for projects with 50-100 checkups

**Note**: After PDF generation and download, the project status is automatically updated to "Finished" and `finished_at` is set. The project becomes read-only.

### Error Responses

#### 400 Bad Request - Invalid UUID

**Status Code**: `400 Bad Request`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid project ID format",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 400 Bad Request - Project Already Finished

**Status Code**: `400 Bad Request`

**Response Body:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Project is already finished",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Project status is already "Finished"

**Note**: According to use case specification, validation IS NOT required for all checkups to have status set. Projects can be finished even if some checkups have no status.

#### 401 Unauthorized - No Session

**Status Code**: `401 Unauthorized`

**Response Body:**
```json
{
  "error": "AUTHENTICATION_ERROR",
  "message": "Session expired or invalid. Please login again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 403 Forbidden - Access Denied

**Status Code**: `403 Forbidden`

**Response Body:**
```json
{
  "error": "AUTHORIZATION_ERROR",
  "message": "Access denied. This project does not belong to you.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 404 Not Found - Project Not Found

**Status Code**: `404 Not Found`

**Response Body:**
```json
{
  "error": "NOT_FOUND",
  "message": "Project not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 500 Internal Server Error - PDF Generation Failed

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "PDF_GENERATION_ERROR",
  "message": "Unable to generate report. Please try again or contact support.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- PDF generation library error
- Memory exhaustion during PDF generation
- Image processing failure
- File system error (if temporary files used)

**Important**: If PDF generation fails, the project status is NOT updated to "Finished". The project remains in "In Progress" status and can be retried.

#### 500 Internal Server Error - Database Error

**Status Code**: `500 Internal Server Error`

**Response Body:**
```json
{
  "error": "DATABASE_ERROR",
  "message": "Unable to complete project. Please try again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- Database connection fails during project update
- Transaction rollback fails

**Important**: If database update fails after PDF generation, the PDF is still returned to the user, but the project status may not be updated. This is a critical error that requires manual intervention.

#### 503 Service Unavailable

**Status Code**: `503 Service Unavailable`

**Response Body:**
```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Database temporarily unavailable. Please try again in a few moments.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 504 Gateway Timeout

**Status Code**: `504 Gateway Timeout`

**Response Body:**
```json
{
  "error": "TIMEOUT_ERROR",
  "message": "PDF generation timed out. Please try again.",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Occurs when:**
- PDF generation exceeds 30-second timeout
- Large projects with many images may timeout

## Business Logic

1. **Authentication**: Verify user session and extract user ID
2. **Validation**: Validate project ID is valid UUID format
3. **Authorization**: 
   - Verify project exists and belongs to authenticated user (`project.user_id === authenticated_user_id`)
   - Verify project status is "In Progress" (cannot finish already finished projects)
4. **Data Retrieval**: Retrieve all project data needed for PDF:
   - Project details (id, created_at, user information)
   - Powerplant information (name, location)
   - All parts for the powerplant (ordered by displayOrder)
   - All checkups for each part (ordered by displayOrder)
   - All checkup statuses for the project
   - Documentation (images and text) for each checkup
5. **PDF Generation**: 
   - Create PDF document using PDFKit library
   - Add header section with project information
   - Iterate through parts and checkups:
     - Add part name and description
     - For each checkup: add name, description, status, documentation text, and images
   - Add summary section
   - Finalize PDF document
6. **Project Update**: 
   - Update project status to "Finished"
   - Set `finished_at` to current timestamp
   - Update `updated_at` timestamp
7. **Response**: Return PDF file with appropriate headers

**Database Operations:**
1. Verify project and authorization: `SELECT id, user_id, status, powerplant_id, created_at FROM projects WHERE id = $1 AND user_id = $2`
2. Retrieve project data for PDF (complex join query):
   ```sql
   SELECT 
     p.id, p.created_at, u.username,
     pp.name AS powerplant_name, pp.location,
     pt.id AS part_id, pt.name AS part_name, pt.description AS part_description, pt.display_order AS part_display_order,
     c.id AS checkup_id, c.name AS checkup_name, c.description AS checkup_description, 
     c.documentation_text, c.documentation_images, c.display_order AS checkup_display_order,
     cs.status_value
   FROM projects p
   INNER JOIN users u ON p.user_id = u.id
   INNER JOIN powerplants pp ON p.powerplant_id = pp.id
   INNER JOIN parts pt ON pt.powerplant_id = pp.id
   INNER JOIN checkups c ON c.part_id = pt.id
   LEFT JOIN checkup_statuses cs ON cs.project_id = p.id AND cs.checkup_id = c.id
   WHERE p.id = $1
   ORDER BY pt.display_order ASC, c.display_order ASC
   ```
3. Update project status: `UPDATE projects SET status = 'Finished', finished_at = NOW(), updated_at = NOW() WHERE id = $1`

**Transaction**: PDF generation and project update should be wrapped in a transaction:
- If PDF generation fails: Rollback, project remains "In Progress"
- If project update fails: PDF is still generated, but error is logged (critical error)

**PDF Generation Process:**
1. Create PDFDocument instance
2. Set page size (A4) and margins
3. Add header with project information
4. For each part:
   - Add part section header
   - For each checkup in part:
     - Add checkup name and description
     - Add status value (or "Not Set")
     - Add documentation text (if available)
     - Add documentation images (if available, embedded as JPEG/PNG)
5. Add summary section
6. Finalize PDF (doc.end())
7. Return PDF buffer as response

**Image Processing:**
- Images stored as BYTEA array in database
- Convert to buffer for PDF embedding
- Resize images if necessary (max 1920x1080 pixels)
- Compress images to reduce PDF size
- Use Sharp library for image processing

## Performance Requirements

- **Response Time**: Under 5 seconds for projects with 50-100 checkups
- **Response Time**: Under 10 seconds for projects with 100-200 checkups
- **PDF Generation**: Under 5 seconds for typical project (50-100 checkups)
- **Database Query**: Under 200 milliseconds for complex join query
- **Image Processing**: Under 2 seconds for 10 images

**Reference**: See `specs/03-technical-specifications/03-performance-requirements.md` for detailed performance requirements.

## Logging

**Log Events:**
- **INFO**: Project finished successfully (userId, projectId, powerplantId, checkupCount, timestamp)
- **WARN**: Finish attempt on already finished project (userId, projectId, timestamp)
- **WARN**: Access denied attempt (userId, projectId, IP address, timestamp)
- **ERROR**: PDF generation failure (projectId, error details, stack trace)
- **ERROR**: Database errors during update (error details, stack trace)

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "Project finished successfully",
  "context": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "660e8400-e29b-41d4-a716-446655440000",
    "powerplantId": "770e8400-e29b-41d4-a716-446655440000",
    "checkupCount": 50,
    "pdfSize": 3145728
  }
}
```

## Security Considerations

- User isolation: Only projects where `user_id` matches authenticated user can be finished
- Authorization check: Verify `project.user_id === authenticated_user_id` before allowing finish
- Project status check: Finished projects cannot be finished again
- PDF contains user information (username) for audit trail
- PDF filename includes project ID and powerplant name (no sensitive data)
- Images embedded in PDF are from database (no file system access)
- PDF generation uses in-memory buffers (no temporary files on disk)

## Testing Requirements

**Test Cases:**
1. Successful project finish and PDF generation
2. PDF contains all parts and checkups
3. PDF contains checkup statuses
4. PDF contains documentation text and images
5. PDF filename format is correct
6. Project status updated to "Finished" after PDF generation
7. Project finished_at timestamp set correctly
8. Project must be "In Progress" (400 if Finished)
9. Authorization: Access denied for other user's project (403)
10. Not found: Invalid project ID (404)
11. PDF generation failure handling (project not marked as Finished)
12. Database error during update (critical error handling)
13. Response time under 5 seconds for 100 checkups
14. PDF file size reasonable (2-5 MB for typical project)
15. Images embedded correctly in PDF
16. PDF download triggers in browser

## Error Recovery

**PDF Generation Failure:**
- Project remains in "In Progress" status
- User can retry PDF generation
- Error logged with full context
- User sees error message with retry option

**Database Update Failure After PDF Generation:**
- PDF is still returned to user
- Project status may not be updated (critical error)
- Error logged with full context
- Manual intervention may be required
- Consider implementing retry mechanism for database update
