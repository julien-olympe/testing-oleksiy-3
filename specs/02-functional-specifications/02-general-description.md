# 2 - General Description

## System Environment or Context

The Wind Power Plant Status Investigation App operates as a standalone web application that interfaces with a database for data persistence and includes a PDF generation service for report creation.

**External Systems and Interfaces:**

1. **Database System**: The application connects to a relational database that stores:
   - User accounts and authentication data
   - Powerplant definitions with associated parts and checkups
   - Project records and assignments
   - Documentation files (images and text descriptions) linked to parts
   - Checkup status records

2. **PDF Generator Service**: An integrated component that generates PDF reports from project data. The service compiles checkup statuses, parts information, and associated documentation into a downloadable PDF file.

**System Actors:**

- **Users**: Field inspectors who log in to perform inspections. Users are assigned to projects and interact with the system through web interface screens.

- **Database**: The persistent storage system that provides data retrieval and storage services. The database responds to queries for powerplants, parts, checkups, projects, and documentation.

- **PDF Generator**: The service component that creates PDF documents from project data when a user finishes a report.

**System Diagram:**

```
┌─────────────┐
│   Users     │
│ (Inspectors)│
└──────┬──────┘
       │
       │ Login, View Projects, Set Status, Generate PDF
       │
┌──────▼──────────────────────────────────────┐
│  Wind Power Plant Status Investigation App  │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │   Web UI     │      │  PDF Generator  │ │
│  │   Screens    │      │     Service     │ │
│  └──────┬───────┘      └────────┬────────┘ │
│         │                       │          │
└─────────┼───────────────────────┼──────────┘
          │                       │
          │ Query/Store Data      │ Request PDF
          │                       │
┌─────────▼───────────────────────▼──────────┐
│              Database                       │
│  (Users, Projects, Powerplants, Parts,     │
│   Checkups, Documentation)                  │
└────────────────────────────────────────────┘
```

**Actor Interactions:**

Users authenticate through the login screen and access their assigned projects. When viewing an ongoing project, users interact with parts and checkups displayed from the database. Users set checkup statuses which are stored in the database. When finishing a report, the system queries the database for all project data and sends it to the PDF Generator, which creates and downloads the PDF file. The database stores all persistent data including powerplant definitions, parts, checkups, projects, user assignments, and documentation files.

## Conceptual Model

The system provides five main functional areas:

1. **User Authentication**: Manages user registration and login. Users create accounts and authenticate to access the system. Authentication controls access to all other functions.

2. **Project Management**: Handles project lifecycle from creation to completion. Users view assigned projects, create new projects by selecting powerplants, and track project status (In Progress or Finished). Projects link users to specific powerplants.

3. **Checkup Status Tracking**: Enables users to set and update checkup statuses for parts within a project. Each checkup can be marked as bad, average, or good. Status changes are immediately saved to the database.

4. **Documentation Viewing**: Displays existing documentation (images and descriptions) stored in the database for each part. Documentation is read-only and provides reference information during inspections.

5. **PDF Report Generation**: Compiles all project data including powerplant name, parts, checkup statuses, and documentation into a PDF document. Generation occurs when a user finishes a report, automatically downloads the PDF, and marks the project as Finished.

**Relationships Between Functions:**

User Authentication is the entry point that enables access to Project Management. Project Management provides the context for Checkup Status Tracking and Documentation Viewing, which operate within an active project. PDF Report Generation depends on Checkup Status Tracking being completed and uses data from all other functions to create the final report.

## User Characteristics

The system serves two primary user types:

**Field Inspectors (Primary Users)**: Regular users with technical knowledge of wind turbine systems. These users have moderate to high experience with computer systems and mobile/web applications. They understand wind turbine components, inspection procedures, and can navigate standard web interfaces. Field inspectors perform inspections on-site, often using tablets or mobile devices. They require efficient workflows to minimize time spent on data entry during inspections.

**Occasional Users**: Users who access the system infrequently, such as supervisors reviewing reports or administrators managing powerplant data. These users have basic to moderate computer experience and require intuitive interfaces with clear navigation. They primarily view information rather than creating projects or setting statuses.

All users require the system to be accessible from standard web browsers on desktop and mobile devices. The interface must be responsive and functional in field conditions with potentially limited connectivity.

## Main Development Constraints

**Technical Constraints:**

- The system must operate as a web application accessible through standard browsers (Chrome, Firefox, Safari, Edge)
- The application must be responsive and functional on desktop, tablet, and mobile devices
- Database must support storage of binary files (images) and text descriptions
- PDF generation must produce documents compatible with standard PDF readers
- Authentication must use secure password storage (hashing, not plain text)

**Procedural Constraints:**

- All project data must be persisted immediately when users set checkup statuses (no draft mode)
- PDF generation must include all project data: powerplant name, all parts, all checkups with statuses, and associated documentation
- Projects cannot be edited after being marked as Finished
- Users can only view and modify projects assigned to them
- Powerplant definitions (parts and checkups) are read-only for regular users

**Standards and Norms:**

- Follow web accessibility standards (WCAG 2.1 Level AA minimum)
- Use RESTful API principles for backend services
- Implement secure authentication practices (password requirements, session management)
- Follow responsive design principles for mobile compatibility
- PDF documents must follow standard formatting conventions (headers, page numbers, table of contents)

## Working Assumptions

**Technical Assumptions:**

- Users have internet connectivity when performing inspections (online-first system)
- Database contains pre-populated powerplant data including parts and checkups definitions
- Documentation files (images and descriptions) are pre-loaded into the database for each part
- PDF generation completes within 30 seconds for typical project sizes
- Standard web browsers support JavaScript and modern web standards

**Business Assumptions:**

- Each powerplant has a fixed set of parts and checkups that do not change during project execution
- Users are assigned to projects by administrators outside this system
- One user is assigned to one project at a time (no multi-user collaboration on the same project)
- Projects represent single inspection visits (not ongoing monitoring)
- All checkups must be completed before a project can be finished

**Fallback Solutions:**

- If PDF generation fails, the system displays an error message and keeps the project in "In Progress" status, allowing the user to retry
- If database connectivity is lost during status updates, the system displays an error and allows the user to retry the operation
- If documentation images fail to load, the system displays a placeholder and continues operation
- If a user attempts to finish a project with incomplete checkups, the system prevents PDF generation and highlights missing checkups
