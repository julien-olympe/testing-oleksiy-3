# 2 - External Interface Specifications

## Hardware/Software Interface

### Web Browser Requirements

**Minimum Configuration**
- Modern web browser with JavaScript enabled
- Screen resolution: 1280x720 pixels minimum
- Internet connection: 1 Mbps minimum for file uploads
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Optimal Configuration**
- Screen resolution: 1920x1080 pixels or higher
- Internet connection: 10 Mbps or higher for faster file uploads
- Modern browser with latest updates

### Server Configuration

**Minimum Configuration**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 50 GB SSD (for application, database, and file storage)
- Network: 100 Mbps connection

**Optimal Configuration**
- CPU: 4+ cores
- RAM: 8 GB or higher
- Storage: 200+ GB SSD with backup storage
- Network: 1 Gbps connection

---

## Software/Software Interface

### Backend Runtime and Framework

**Node.js**
- Version: Latest LTS version
- Source/Vendor: Node.js Foundation
- Purpose: JavaScript runtime environment for server-side application
- Interface: Provides runtime for TypeScript-compiled JavaScript execution

**Fastify**
- Version: Latest
- Source/Vendor: Fastify Open Source
- Purpose: High-performance web framework for building RESTful APIs
- Interface: HTTP server framework with plugin architecture, request/response handling, routing, and middleware support

### Frontend Framework and Build Tools

**React**
- Version: Latest
- Source/Vendor: Meta (Facebook)
- Purpose: Frontend UI library for building interactive user interfaces
- Interface: Component-based architecture with JSX syntax, hooks for state management, and virtual DOM rendering

**Vite**
- Version: Latest
- Source/Vendor: Vite Open Source
- Purpose: Fast build tool and development server for frontend applications
- Interface: Module bundler with hot module replacement (HMR), TypeScript support, and optimized production builds

### Database

**PostgreSQL**
- Version: Latest
- Source/Vendor: PostgreSQL Global Development Group
- Purpose: Relational database management system for persistent data storage
- Interface: SQL interface via connection pool (pg library), supports transactions, foreign keys, and ACID compliance

### Development Tools

**TypeScript**
- Version: Latest
- Source/Vendor: Microsoft
- Purpose: Typed superset of JavaScript for both backend and frontend code
- Interface: Compiler that transpiles TypeScript to JavaScript, provides type checking and IntelliSense support

**Nodemon**
- Version: Latest
- Source/Vendor: Nodemon Open Source
- Purpose: Development server that automatically restarts Node.js application on file changes
- Interface: Command-line tool that monitors file system changes and restarts the application

**npm**
- Version: Latest (bundled with Node.js)
- Source/Vendor: npm, Inc.
- Purpose: Package manager for installing and managing Node.js dependencies
- Interface: Command-line tool for package installation, script execution, and dependency management

### Testing Frameworks

**Jest**
- Version: Latest
- Source/Vendor: Meta (Facebook)
- Purpose: JavaScript testing framework for unit and integration testing
- Interface: Test runner with assertion library, mocking capabilities, and code coverage reporting

**Playwright**
- Version: Latest
- Source/Vendor: Microsoft
- Purpose: End-to-end testing framework for web applications
- Interface: Browser automation API for testing user interactions, form submissions, and navigation flows

### Containerization

**Docker**
- Version: Latest
- Source/Vendor: Docker, Inc.
- Purpose: Containerization platform for packaging and deploying the application
- Interface: Container runtime and orchestration for consistent deployment across environments

### PDF Generation

**Puppeteer**
- Version: Latest
- Source/Vendor: Google Chrome Team
- Purpose: Server-side PDF generation with support for images, structured data, and HTML/CSS rendering
- Interface: Node.js library that controls headless Chrome browser to generate PDFs from HTML templates with full styling support

### Authentication

**bcrypt**
- Version: Latest
- Source/Vendor: bcrypt Open Source
- Purpose: Password hashing library for secure password storage
- Interface: Node.js library providing hash and compare functions for password encryption with salt rounds

**fastify-jwt**
- Version: Latest
- Source/Vendor: Fastify Ecosystem
- Purpose: JWT (JSON Web Token) authentication plugin for Fastify
- Interface: Fastify plugin that provides JWT token generation, verification, and request authentication decorators

### File Upload and Storage

**multer**
- Version: Latest
- Source/Vendor: Multer Open Source
- Purpose: Middleware for handling multipart/form-data file uploads in Express/Fastify
- Interface: Request middleware that parses file uploads and provides file metadata (name, type, size, path)

**Node.js fs module**
- Version: Bundled with Node.js
- Source/Vendor: Node.js Foundation
- Purpose: Local filesystem storage for uploaded documentation files
- Interface: Native Node.js module providing file system operations (read, write, delete) for storing files on server filesystem

---

## Human/Software Interface

### Application Layout

The application follows a single-page application (SPA) architecture with React Router for navigation. The interface consists of the following screens:

**Login Screen**
- Layout: Centered form with email and password fields
- Elements: Email input, password input, "Login" button, "Register" link
- Format: Clean, minimal design with validation error messages displayed below inputs
- Error Messages: "Invalid email or password" for authentication failures, field-specific validation errors

**Home Screen**
- Layout: Header with user email and logout button, main content area with project list
- Elements: 
  - Project list items showing project name, powerplant name, and status badge (In Progress/Finished)
  - "Start Project" button in header or prominent location
  - Double-click interaction on project items to open
- Format: Card-based layout for project items, status badges with color coding (green for Finished, yellow for In Progress)
- Menus: User menu dropdown in header (logout option)

**Start Project Screen**
- Layout: Form with powerplant selector and preview
- Elements:
  - Powerplant dropdown selector
  - Preview section showing parts and checkups for selected powerplant (read-only)
  - "Create" button at bottom
- Format: Two-column layout (selector on left, preview on right) or single column with expandable preview
- Error Messages: "Please select a powerplant" if create attempted without selection

**Ongoing Project Screen**
- Layout: Three-column layout
  - Left: Powerplant name header
  - Middle: Parts list with expandable checkups, status indicators
  - Right: Documentation panel showing files for selected checkup
- Elements:
  - Powerplant name display at top
  - Parts list (expandable/collapsible sections)
  - Checkup items with status buttons (Bad/Average/Good) or dropdown
  - Documentation upload button
  - Documentation file list with thumbnails for images
  - "Finish Report" button in top right corner
- Format: Interactive tree structure for parts/checkups, status buttons with color coding (red for Bad, yellow for Average, green for Good)
- Error Messages: "Please set status for all checkups" if finish attempted with incomplete statuses

### User Manual Description

**Registration and Login**
1. User navigates to login screen
2. User clicks "Register" link
3. User enters email and password, submits form
4. System creates account and redirects to login
5. User enters credentials and logs in
6. System validates credentials and redirects to home screen

**Creating a Project**
1. User clicks "Start Project" button on home screen
2. System displays Start Project screen with powerplant selector
3. User selects a powerplant from dropdown
4. System displays preview of parts and checkups for selected powerplant
5. User clicks "Create" button
6. System creates project with all checkup statuses initialized, assigns to user
7. System redirects to Ongoing Project screen for new project

**Managing Project Status**
1. User double-clicks a project on home screen
2. System opens Ongoing Project screen
3. User expands parts to view checkups
4. User clicks status button (Bad/Average/Good) for each checkup
5. System updates checkup status in database
6. User can upload documentation files by clicking upload button and selecting files
7. System validates file type and size, stores file, and displays in documentation panel

**Finishing a Project**
1. User completes all checkup status updates
2. User clicks "Finish Report" button
3. System validates all checkups have status set
4. System generates PDF report using Puppeteer with all parts, checkups, statuses, and documentation
5. System triggers PDF download in browser
6. System updates project status to "Finished" and sets finished_at timestamp
7. System redirects to home screen with updated project status

### Error Handling and User Feedback

- Form validation errors displayed inline below input fields
- API error messages displayed as toast notifications or banner messages
- Loading states shown during API calls (spinner or progress indicator)
- Success messages confirmed with brief notifications
- File upload progress shown for large files
- PDF generation progress indicator during report creation
