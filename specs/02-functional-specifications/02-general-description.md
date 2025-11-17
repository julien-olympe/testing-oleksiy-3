# 2. General Description

## 2.1 System Environment and Context

The Wind Power Plant Status Investigation Application operates as a web-based system accessible through standard web browsers. The system interacts with users who conduct field inspections and need to document their findings systematically.

**System Context Diagram:**

```
┌─────────────────┐
│   Web Browser   │
│   (Client)      │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │
┌────────▼─────────────────────────────────────┐
│   Wind Power Plant Status Investigation App  │
│                                              │
│  ┌──────────────┐      ┌──────────────────┐ │
│  │   Web UI     │◄────►│  Business Logic  │ │
│  │  Components  │      │     Layer        │ │
│  └──────────────┘      └────────┬─────────┘ │
│                                 │            │
│                          ┌──────▼──────┐    │
│                          │   Database  │    │
│                          │   Layer     │    │
│                          └──────┬──────┘    │
└─────────────────────────────────┼───────────┘
                                  │
                         ┌────────▼────────┐
                         │   Database      │
                         │   (PostgreSQL)  │
                         └─────────────────┘
```

**Actors:**
- **Field Technician**: Primary user who conducts inspections, sets checkup statuses, and generates reports
- **Project Manager**: User who views projects and creates projects (projects are assigned to the creating user during creation)
- **System Administrator**: Manages powerplant data, parts, checkups, and user accounts (implicit actor for data management)

**External Systems:**
- Web browser (Chrome, Firefox, Safari, Edge)
- PDF generation service/library
- File storage system for images and documents

## 2.2 Conceptual Model

The application follows a project-based workflow model:

1. **User Management**: Users register and authenticate to access the system
2. **Project Assignment**: Projects are assigned to specific users
3. **Project Initialization**: Users select a powerplant, which loads all associated parts and checkups
4. **Inspection Execution**: Users review checkups, set status values, and reference documentation
5. **Report Generation**: Users generate PDF reports containing all inspection data
6. **Project Completion**: Projects are marked as Finished after report generation

**Core Entities:**
- User (id, username, email, password_hash)
- Powerplant (id, name, location)
- Part (id, powerplant_id, name, description)
- Checkup (id, part_id, name, description, documentation)
- Project (id, user_id, powerplant_id, status, created_date, finished_date)
- CheckupStatus (project_id, checkup_id, status_value)

**Data Flow:**
- Powerplant data (parts and checkups) is predefined in the database
- Projects reference powerplants and inherit their structure
- Users update checkup statuses within projects
- Reports are generated from project data and checkup statuses

## 2.3 User Characteristics

**Field Technician:**
- Primary end user of the application
- Technical knowledge of wind turbine components
- Mobile or desktop device access in field or office environments
- Basic computer literacy required
- Needs efficient data entry and clear visual feedback
- Requires consistent internet connectivity during project work (online operation required)

**Project Manager:**
- Secondary user who views project statuses
- Needs overview of all assigned projects
- Creates projects which are automatically assigned to the creating user during project creation

**User Skills:**
- Ability to navigate web interfaces
- Understanding of status values (bad, average, good)
- Familiarity with PDF documents
- Basic understanding of wind turbine terminology

## 2.4 Main Development Constraints

**Technical Constraints:**
- Web-based application (browser compatibility: Chrome, Firefox, Safari, Edge latest 2 versions)
- Responsive design for mobile and desktop devices
- Database: PostgreSQL (standard relational database for structured data)
- PDF generation: Server-side generation using PDFKit library
- Image storage: Database BLOB storage or file system with database references
- Authentication: Secure password hashing using bcrypt algorithm
- Session management: Secure session tokens

**Performance Constraints:**
- Page load time: Under 2 seconds for home screen
- PDF generation: Under 5 seconds for typical project (50-100 checkups)
- Database queries: Optimized for powerplant data retrieval
- Image loading: Lazy loading for documentation images

**Security Constraints:**
- Password encryption required
- Session-based authentication
- User data isolation (users only see assigned projects)
- Input validation for all user inputs
- SQL injection prevention through parameterized queries
- XSS prevention through output encoding

**Browser Constraints:**
- Modern browsers with JavaScript enabled
- HTML5 and CSS3 support required
- No support for Internet Explorer

**Data Constraints:**
- Powerplant data is read-only for users (managed by administrators)
- Projects cannot be deleted once created (archival only)
- Checkup statuses can be updated until project is Finished
- Finished projects are read-only

## 2.5 System Requirements

**Business Requirements:**
- Each powerplant has a predefined, stable set of parts and checkups
- Users are assigned to specific projects (one user per project)
- Projects represent single inspection events (not recurring inspections)
- Report generation marks the project as complete
- Documentation (images and descriptions) exists in database for reference during inspections

**Technical Requirements:**
- Users must have consistent internet connectivity during project work
- Database contains pre-populated powerplant, part, and checkup data
- PDF generation occurs synchronously (user waits for download)
- Images are stored in database or accessible file system
- Browser must support file download functionality
- Server must have sufficient resources for concurrent PDF generation

**Data Requirements:**
- Powerplant names must be unique
- Part names must be unique within a powerplant
- Checkup names must be unique within a part
- User email addresses must be unique
- Usernames must be unique
- Projects are created with "In Progress" status by default
- All checkups must have a status set before project can be finished (validation requirement)

**Operational Requirements:**
- System administrators manage powerplant data separately (not part of this application scope)
- User registration is open (no approval workflow)
- Project assignment happens automatically when user creates project
- No multi-user collaboration on same project (single user assignment)
