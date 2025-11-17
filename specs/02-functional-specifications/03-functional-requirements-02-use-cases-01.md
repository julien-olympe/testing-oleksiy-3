# 3. Functional Requirements - Use Cases 1-6

## Use Case 1: User Registration

**Use Case Name:** Register New User

**Description:** A new user creates an account in the system by providing registration information. The system validates the input and creates a new user account.

**Actors Involved:** Unauthenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- Username (user input via registration form)
- Email address (user input via registration form)
- Password (user input via registration form, minimum 8 characters)
- Password confirmation (user input via registration form)

**Processing/Actions:**
1. User navigates to registration screen
2. User enters username, email, password, and password confirmation
3. System validates username is unique
4. System validates email format and uniqueness
5. System validates password meets requirements (minimum 8 characters)
6. System validates password and confirmation match
7. System hashes password using bcrypt
8. System creates user record in database
9. System redirects user to login screen

**Outputs including errors:**
- Success: User account created, redirect to login screen with success message
- Error: Username already exists - display error message, remain on registration screen
- Error: Email already exists - display error message, remain on registration screen
- Error: Invalid email format - display error message, remain on registration screen
- Error: Password too short - display error message, remain on registration screen
- Error: Passwords do not match - display error message, remain on registration screen
- Error: Database error - display generic error message, remain on registration screen

---

## Use Case 2: User Login

**Use Case Name:** Authenticate User

**Description:** An existing user logs into the system by providing credentials. The system validates credentials and establishes an authenticated session.

**Actors Involved:** Unauthenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- Username or email (user input via login form)
- Password (user input via login form)

**Processing/Actions:**
1. User navigates to login screen
2. User enters username/email and password
3. System looks up user by username or email
4. System verifies password hash matches stored hash
5. System creates session token
6. System stores session in server memory or database
7. System redirects user to home screen

**Outputs including errors:**
- Success: User authenticated, session created, redirect to home screen
- Error: Username/email not found - display error message "Invalid credentials", remain on login screen
- Error: Password incorrect - display error message "Invalid credentials", remain on login screen
- Error: Account locked (if implemented) - display error message, remain on login screen

---

## Use Case 3: View Projects List

**Use Case Name:** Display User's Projects

**Description:** An authenticated user views a list of all projects assigned to them. The list displays project information including status.

**Actors Involved:** Authenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- User session (from authentication)
- Project data (from database query)

**Processing/Actions:**
1. User is on home screen (automatically after login or navigation)
2. System retrieves user ID from session
3. System queries database for all projects where user_id matches
4. System orders projects by created_at (newest first)
5. System formats project data for display
6. System renders project list with status indicators

**Outputs including errors:**
- Success: Project list displayed with project items showing powerplant name and status (In Progress or Finished)
- Error: Database query failure - display error message "Unable to load projects", show empty list
- Error: Session expired - redirect to login screen

---

## Use Case 4: Open Project

**Use Case Name:** View Project Details

**Description:** An authenticated user opens an existing project by double-clicking a project item in the home screen. The system displays the Ongoing Project screen with all project data.

**Actors Involved:** Authenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- Project ID (from double-click event on project item)
- User session (from authentication)

**Processing/Actions:**
1. User double-clicks a project item on home screen
2. System retrieves project ID from clicked item
3. System verifies user has access to project (user_id matches)
4. System retrieves project data from database
5. System retrieves powerplant data
6. System retrieves all parts for the powerplant
7. System retrieves all checkups for each part
8. System retrieves checkup statuses for the project
9. System retrieves documentation (images and descriptions) for each checkup
10. System renders Ongoing Project screen with all data

**Outputs including errors:**
- Success: Ongoing Project screen displayed with powerplant name, parts list, checkups, statuses, and documentation
- Error: Project not found - display error message, redirect to home screen
- Error: Access denied (user not assigned to project) - display error message, redirect to home screen
- Error: Database query failure - display error message, redirect to home screen
- Error: Session expired - redirect to login screen

---

## Use Case 5: Start New Project

**Use Case Name:** Initiate Project Creation

**Description:** An authenticated user initiates the creation of a new project by clicking the "Start Project" button on the home screen. The system displays the Start Project screen.

**Actors Involved:** Authenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- User action (click on "Start Project" button)
- User session (from authentication)

**Processing/Actions:**
1. User clicks "Start Project" button on home screen
2. System navigates to Start Project screen
3. System retrieves list of all powerplants from database
4. System populates powerplant dropdown selector
5. System displays empty parts and checkups area (initially empty)

**Outputs including errors:**
- Success: Start Project screen displayed with powerplant dropdown and empty parts/checkups area
- Error: Unable to load powerplants - display error message, show empty dropdown
- Error: Session expired - redirect to login screen

---

## Use Case 6: Select Powerplant

**Use Case Name:** Load Powerplant Parts and Checkups

**Description:** An authenticated user selects a powerplant from the dropdown on the Start Project screen. The system displays all parts and checkups associated with that powerplant.

**Actors Involved:** Authenticated User (Field Technician or Project Manager)

**Inputs and Sources:**
- Powerplant ID (from dropdown selection)
- Powerplant data (from database)

**Processing/Actions:**
1. User selects a powerplant from dropdown on Start Project screen
2. System retrieves powerplant ID from selection
3. System queries database for all parts belonging to powerplant
4. System queries database for all checkups belonging to each part
5. System displays parts list with associated checkups
6. System displays documentation references for each checkup (read-only display)

**Outputs including errors:**
- Success: Parts and checkups displayed in organized list, documentation references shown
- Error: Powerplant not found - display error message, clear parts/checkups display
- Error: Database query failure - display error message, clear parts/checkups display
- Error: No parts found for powerplant - display message "No parts configured for this powerplant"
