# 4. Screens - Screen Specifications (Screens 1-3)

## 4.2 Screen Specifications

### Screen 1: Login Screen

**Screen Name:** User Authentication

**Related Use Cases:** User Registration (Use Case 1), User Login (Use Case 2)

**Layout:**
- Centered form on page
- Application title/logo at top
- Login form in center:
  - Username/Email input field
  - Password input field
  - "Login" button
  - "Register" link below form
- Error messages displayed below form (if applicable)

**Elements:**
- **Username/Email Field**: Text input, required, placeholder "Username or Email"
- **Password Field**: Password input, required, placeholder "Password"
- **Login Button**: Primary button, submits form
- **Register Link**: Text link, navigates to registration form
- **Error Message Area**: Red text, displays validation errors

**Interactions:**
- User enters credentials and clicks "Login" → triggers User Login use case
- User clicks "Register" → navigates to registration form
- Form validation occurs on submit
- Error messages clear when user starts typing

**Visual Design:**
- Clean, professional appearance
- Responsive design (mobile and desktop)
- Password field shows/hides toggle (optional enhancement)

---

### Screen 2: Registration Screen

**Screen Name:** New User Registration

**Related Use Cases:** User Registration (Use Case 1)

**Layout:**
- Centered form on page
- Application title/logo at top
- Registration form in center:
  - Username input field
  - Email input field
  - Password input field
  - Password confirmation input field
  - "Register" button
  - "Back to Login" link below form

**Elements:**
- **Username Field**: Text input, required, placeholder "Username", min length 3 characters
- **Email Field**: Email input, required, placeholder "Email address"
- **Password Field**: Password input, required, placeholder "Password (min 8 characters)"
- **Password Confirmation Field**: Password input, required, placeholder "Confirm Password"
- **Register Button**: Primary button, submits form
- **Back to Login Link**: Text link, navigates to login screen
- **Error Message Area**: Red text, displays validation errors

**Interactions:**
- User enters information and clicks "Register" → triggers User Registration use case
- User clicks "Back to Login" → navigates to login screen
- Real-time validation for password match (optional enhancement)
- Error messages display for each validation failure

**Visual Design:**
- Consistent with login screen styling
- Password strength indicator (optional enhancement)
- Responsive design

---

### Screen 3: Home Screen

**Screen Name:** Projects Dashboard

**Related Use Cases:** View Projects List (Use Case 3), Open Project (Use Case 4), Start New Project (Use Case 5)

**Layout:**
- Header bar with application title and user menu
- Main content area:
  - Page title "My Projects"
  - "Start Project" button (top right of content area)
  - Projects list (scrollable if many projects)
- Each project item displays:
  - Powerplant name
  - Status badge (In Progress = orange/yellow, Finished = green)
  - Created date
  - Double-click to open

**Elements:**
- **Start Project Button**: Primary button, top right, triggers navigation to Start Project screen
- **Project List**: Container with project items
- **Project Item**: Card or list row containing:
  - Powerplant name (bold, larger font)
  - Status indicator (colored badge: "In Progress" or "Finished")
  - Created date (smaller font, gray)
  - Hover effect to indicate clickability
- **Empty State**: Message "No projects assigned" if list is empty
- **User Menu**: Dropdown in header with username and logout option

**Interactions:**
- User double-clicks project item → triggers Open Project use case, navigates to Ongoing Project screen
- User clicks "Start Project" button → navigates to Start Project screen
- User clicks logout in user menu → ends session, navigates to login screen
- Projects sorted by created_date (newest first)

**Visual Design:**
- Card-based or list-based layout for projects
- Clear visual distinction between In Progress and Finished statuses
- Responsive grid/list that adapts to screen size
- Loading indicator while fetching projects
