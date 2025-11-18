# 4 - Screens (Part 1: Layout, Login, and Home)

## General Layout and Navigation

The Wind Power Plant Status Investigation App uses a consistent layout structure across all screens:

**Header Section:**
- Application title/logo on the left
- User information and logout button on the right (visible on authenticated screens)

**Main Content Area:**
- Screen-specific content displayed in the center
- Responsive layout that adapts to desktop, tablet, and mobile viewports

**Navigation Pattern:**
- Login Screen: Entry point, no navigation menu
- Home Screen: Primary navigation hub with project list
- Ongoing Project Screen: Accessed by double-clicking a project from Home Screen, includes back navigation to Home Screen
- Start Project Screen: Accessed via "Start Project" button from Home Screen, includes back navigation to Home Screen

**Menu Structure:**
- No persistent top-level menu bar
- Context-specific buttons and actions on each screen
- Breadcrumb or back button for hierarchical navigation
- Logout option available in header on all authenticated screens

**Responsive Behavior:**
- Desktop: Full layout with side-by-side panels where applicable
- Tablet: Stacked layout with collapsible panels
- Mobile: Single column layout with full-width elements

---

## Screen 1: Login Screen

**Purpose:** Entry point for user authentication. Users can either log in with existing credentials or register a new account.

**Layout:**
- Centered login form on the page
- Registration link/button below the login form
- Application branding/logo at top

**Components:**
- Username input field (text)
- Password input field (password type, masked)
- "Login" button (primary action)
- "Register" link/button (secondary action, navigates to registration)
- Error message area (displayed below form if authentication fails)

**Navigation:**
- Clicking "Register" shows registration form on same screen (or navigates to registration view)
- Successful login navigates to Home Screen
- No other navigation options available

**Related Use Cases:**
- Use Case 2: User Login
- Use Case 1: User Registration (via registration link)

**User Interactions:**
- User enters username and password
- User clicks "Login" button to authenticate
- User clicks "Register" to create new account
- System validates credentials and either logs user in or displays error message

**Visual States:**
- Default: Empty form with enabled inputs
- Loading: Login button shows loading spinner during authentication
- Error: Error message displayed in red below form
- Success: Form disappears, user redirected to Home Screen

---

## Screen 2: Home Screen

**Purpose:** Displays all projects assigned to the authenticated user. Provides access to view existing projects or create new ones.

**Layout:**
- Header with application title and user info/logout
- "Start Project" button prominently placed (top right or center)
- Project list displayed as cards or table rows below
- Each project item shows powerplant name and status badge

**Components:**
- "Start Project" button (primary action, top right)
- Project list container
- Project items (each showing):
  - Powerplant name (large text)
  - Status badge (In Progress = orange/yellow, Finished = green)
  - Creation date (small text)
  - Double-click area (entire item is clickable)
- Empty state message (if no projects exist)
- Logout button (header)

**Navigation:**
- Double-clicking a project item navigates to Ongoing Project Screen
- Clicking "Start Project" button navigates to Start Project Screen
- Logout button returns to Login Screen

**Related Use Cases:**
- Use Case 3: View Assigned Projects
- Use Case 4: Start New Project (via Start Project button)
- Use Case 5: View Ongoing Project Details (via double-click on project)

**User Interactions:**
- User views list of assigned projects
- User double-clicks a project to open it
- User clicks "Start Project" to create new project
- User clicks logout to end session

**Visual States:**
- Loading: Skeleton loaders or spinner while fetching projects
- Empty: Message displayed: "You have no assigned projects. Click 'Start Project' to create one."
- Populated: List of project items displayed
- Error: Error message displayed if projects cannot be loaded

**Project Item Display:**
- In Progress projects: Orange/yellow status badge, project name, creation date
- Finished projects: Green status badge, project name, creation date
- Hover effect on project items to indicate clickability
- Visual distinction between status types
