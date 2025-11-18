# 3 - Functional Requirements (Part 1: Authentication and Project Management)

This chapter describes all use cases that the Wind Power Plant Status Investigation App must support. Use cases are grouped by major functionality area.

## Authentication Use Cases

### Use Case 1: User Registration

**Description:** A new user creates an account in the system by providing registration information. This enables the user to access the application and be assigned to projects.

**Actors Involved:**
- User (unauthenticated)

**Inputs and Their Sources:**
- Username (user input via registration form)
- Email address (user input via registration form)
- Password (user input via registration form, entered twice for confirmation)
- Password confirmation (user input via registration form)

**Processing / Actions:**
1. System validates that username is not already taken
2. System validates email format and checks for duplicate email
3. System validates password meets requirements (minimum length, complexity)
4. System validates password and password confirmation match
5. System hashes the password using secure hashing algorithm
6. System creates new user record in database with username, email, and hashed password
7. System creates user session and logs the user in automatically

**Outputs:**
- User account created successfully, user redirected to Home Screen
- Error message if username already exists: "Username already taken. Please choose another."
- Error message if email already exists: "Email address already registered."
- Error message if password does not meet requirements: "Password must be at least 8 characters and contain letters and numbers."
- Error message if passwords do not match: "Passwords do not match."

---

### Use Case 2: User Login

**Description:** An existing user authenticates to the system using their username and password to gain access to assigned projects and system features.

**Actors Involved:**
- User (unauthenticated or authenticated)

**Inputs and Their Sources:**
- Username (user input via login form)
- Password (user input via login form)

**Processing / Actions:**
1. System retrieves user record from database using username
2. System verifies user exists
3. System hashes the provided password and compares with stored password hash
4. System validates password matches
5. System creates authenticated session for the user
6. System redirects user to Home Screen

**Outputs:**
- User successfully logged in, redirected to Home Screen
- Error message if username not found: "Invalid username or password."
- Error message if password incorrect: "Invalid username or password."
- Error message if account is locked or disabled: "Account is currently disabled. Please contact administrator."

---

## Project Management Use Cases

### Use Case 3: View Assigned Projects

**Description:** An authenticated user views a list of all projects assigned to them. The list displays project information including powerplant name and current status (In Progress or Finished).

**Actors Involved:**
- User (authenticated)

**Inputs and Their Sources:**
- User ID (from authenticated session)

**Processing / Actions:**
1. System retrieves user ID from authenticated session
2. System queries database for all projects assigned to the user
3. System retrieves powerplant information for each project
4. System formats project list with powerplant name and status
5. System displays projects sorted by creation date (newest first)

**Outputs:**
- List of assigned projects displayed on Home Screen, each showing:
  - Powerplant name
  - Project status (In Progress or Finished)
  - Project creation date
- Empty state message if no projects assigned: "You have no assigned projects. Click 'Start Project' to create one."
- Error message if database query fails: "Unable to load projects. Please try again."

---

### Use Case 4: Start New Project

**Description:** An authenticated user creates a new inspection project by selecting a powerplant from available options. The system creates the project, assigns it to the user, and makes it available in the project list.

**Actors Involved:**
- User (authenticated)

**Inputs and Their Sources:**
- User ID (from authenticated session)
- Selected powerplant ID (user selection from dropdown on Start Project Screen)

**Processing / Actions:**
1. System retrieves user ID from authenticated session
2. System displays list of available powerplants in dropdown
3. User selects a powerplant from dropdown
4. System displays preview of parts and checkups for selected powerplant
5. User clicks Create button
6. System validates powerplant selection
7. System creates new project record in database with:
   - User assignment (current user)
   - Powerplant reference
   - Status set to "In Progress"
   - Creation timestamp
8. System initializes checkup status records for all checkups in the project (status set to null/unset)
9. System redirects user to Ongoing Project Screen for the newly created project

**Outputs:**
- New project created successfully, user redirected to Ongoing Project Screen
- Error message if no powerplant selected: "Please select a powerplant."
- Error message if project creation fails: "Unable to create project. Please try again."
- Error message if database error occurs: "Database error. Please contact support."

---

### Use Case 5: View Ongoing Project Details

**Description:** An authenticated user opens an existing project to view details including powerplant name, list of parts with checkups, and associated documentation. The user can interact with checkups and view documentation.

**Actors Involved:**
- User (authenticated)

**Inputs and Their Sources:**
- User ID (from authenticated session)
- Project ID (from user clicking on project item in Home Screen)

**Processing / Actions:**
1. System retrieves user ID from authenticated session
2. System validates user has access to the requested project
3. System retrieves project record from database
4. System retrieves powerplant information for the project
5. System retrieves all parts associated with the powerplant
6. System retrieves all checkups for each part
7. System retrieves current status for each checkup in the project
8. System retrieves documentation (images and descriptions) for each part
9. System displays Ongoing Project Screen with:
   - Powerplant name at top
   - Parts list in middle section with checkups and their current statuses
   - Documentation viewer on right side
   - Finish Report button in top right corner

**Outputs:**
- Ongoing Project Screen displayed with all project information
- Error message if project not found: "Project not found."
- Error message if user does not have access: "You do not have permission to view this project."
- Error message if project data cannot be loaded: "Unable to load project details. Please try again."
