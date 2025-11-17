# 2. External Interface Specifications (continued)

## 2.3 Human/Software Interface

### 2.3.1 Screen Layouts and Formats

**Login Screen:**
- Layout: Centered form on full-screen background
- Format: Single column form with:
  - Application title/logo at top (centered, 48px font size)
  - Username/Email input field (width: 320px, height: 44px, padding: 12px)
  - Password input field (width: 320px, height: 44px, padding: 12px)
  - Login button (width: 320px, height: 44px, primary color, rounded corners 8px)
  - Register link below form (14px font, secondary color, underlined on hover)
- Error messages: Red text, 14px font, displayed below form, margin-top: 16px
- Responsive: Form width adjusts to 90% of viewport on mobile (max-width: 320px)

**Registration Screen:**
- Layout: Centered form on full-screen background
- Format: Single column form with:
  - Application title/logo at top (centered, 48px font size)
  - Username input field (width: 320px, height: 44px, padding: 12px)
  - Email input field (width: 320px, height: 44px, padding: 12px)
  - Password input field (width: 320px, height: 44px, padding: 12px)
  - Password confirmation field (width: 320px, height: 44px, padding: 12px)
  - Register button (width: 320px, height: 44px, primary color, rounded corners 8px)
  - Back to Login link below form (14px font, secondary color)
- Error messages: Red text, 14px font, displayed below each invalid field
- Responsive: Form width adjusts to 90% of viewport on mobile

**Home Screen:**
- Layout: Header bar (height: 64px) + main content area
- Format:
  - Header: Application title (left, 24px font) + User menu (right, dropdown with username and logout)
  - Main content: Page title "My Projects" (32px font, margin: 24px)
  - Start Project button (top right of content, primary button, 120px width, 40px height)
  - Projects list: Grid layout (desktop: 3 columns, tablet: 2 columns, mobile: 1 column)
  - Project item card: White background, border-radius: 8px, padding: 16px, margin: 12px, box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- Project item elements:
  - Powerplant name: Bold, 20px font, margin-bottom: 8px
  - Status badge: Colored pill (In Progress: orange #FF9800, Finished: green #4CAF50), 12px font, padding: 4px 12px, border-radius: 12px
  - Created date: Gray text, 14px font, margin-top: 8px
- Empty state: Centered message "No projects assigned" (18px font, gray color)
- Responsive: Grid adapts to screen size, cards stack on mobile

**Start Project Screen:**
- Layout: Header bar + main content area
- Format:
  - Header: Application title + User menu
  - Main content: Page title "Start New Project" (32px font, margin: 24px)
  - Powerplant dropdown: Width: 100% (max-width: 400px), height: 44px, padding: 12px, border: 1px solid #ccc, border-radius: 8px
  - Parts and checkups area: White background, border: 1px solid #e0e0e0, border-radius: 8px, padding: 16px, margin-top: 24px, min-height: 200px
  - Parts list: Nested structure, part names as section headers (18px font, bold), checkups as list items (16px font, margin-left: 24px)
  - Create button: Primary button, width: 120px, height: 44px, bottom of form, margin-top: 24px
  - Back link: Secondary link, left of Create button
- Loading indicator: Spinner animation (circular, 32px diameter) centered in parts/checkups area
- Responsive: Full-width on mobile, dropdown and content stack vertically

**Ongoing Project Screen:**
- Layout: Header bar + three-column content (desktop) or stacked (mobile)
- Format:
  - Header: Application title + User menu + Finish Report button (top right, primary button, 140px width, 40px height)
  - Powerplant name: Large heading (36px font, bold, margin: 24px 0)
  - Left/Middle column (60% width): Parts and checkups list
    - Part sections: Expandable/collapsible, border-bottom: 1px solid #e0e0e0, padding: 16px
    - Part name: 20px font, bold, margin-bottom: 12px
    - Checkup items: 16px font, padding: 8px, margin-left: 16px, clickable with hover effect
    - Status indicator: Colored dot or badge next to checkup name (bad: red #F44336, average: yellow #FFC107, good: green #4CAF50, unset: gray #9E9E9E)
  - Right column (40% width): Documentation panel
    - Panel header: Selected checkup name (18px font, bold, padding: 16px, background: #f5f5f5)
    - Images: Grid layout (2 columns), max-width: 100%, border-radius: 4px, margin: 8px
    - Text description: 14px font, padding: 16px, line-height: 1.6
    - "No documentation" message: Centered, gray text, 16px font, padding: 32px
- Status selection: Modal or inline dropdown with three options (Bad/Average/Good), appears on checkup click
- Responsive: Three columns on desktop (1024px+), two columns on tablet (768-1023px), single column on mobile (<768px)

### 2.3.2 Menus and Navigation

**Header Menu:**
- Location: Top right of header bar
- Format: Username text (clickable) with dropdown arrow
- Dropdown items:
  - Username (display only, 16px font, padding: 12px, not clickable)
  - Divider line (1px solid #e0e0e0)
  - Logout (16px font, padding: 12px, clickable, red color on hover)
- Behavior: Click username to open dropdown, click outside to close, click logout to end session

**Navigation Flow:**
- Login → Home (automatic after authentication)
- Home → Ongoing Project (double-click project item)
- Home → Start Project (click Start Project button)
- Start Project → Home (click Create button or Back link)
- Ongoing Project → Home (click Finish Report button or Back link)
- Any screen → Login (session timeout or logout)

**Breadcrumbs:**
- Not implemented (simple navigation structure)

**Back Button:**
- Location: Top left of Start Project and Ongoing Project screens
- Format: Text link or icon button, 16px font, secondary color
- Behavior: Navigates to Home screen

### 2.3.3 Error Messages

**Format:**
- Color: Red (#F44336)
- Font size: 14px
- Location: Below form fields or in dedicated error message area
- Background: Light red background (#FFEBEE) with border (1px solid #F44336) for prominent errors
- Icon: Error icon (exclamation circle) before message text
- Animation: Fade-in animation (0.3s ease-in)

**Error Message Types:**
- Validation errors: Displayed inline below form fields
- Authentication errors: Displayed in error message area below form
- Network errors: Toast notification (top right, auto-dismiss after 5 seconds)
- Permission errors: Full-screen message with "Access Denied" heading
- Server errors: Generic message "An error occurred. Please try again." with error code for support

**Error Message Examples:**
- "Username already exists" (registration)
- "Invalid credentials" (login)
- "Please select a powerplant" (project creation)
- "Cannot update status on finished project" (status update)
- "Unable to generate report" (PDF generation)
- "Session expired. Please login again." (authentication)

### 2.3.4 Interface Elements

**Buttons:**
- Primary button: Background color #2196F3 (blue), white text, height: 44px, padding: 12px 24px, border-radius: 8px, font-size: 16px, font-weight: 500
- Secondary button: Transparent background, border: 1px solid #ccc, text color: #333, same dimensions as primary
- Disabled button: Gray background (#E0E0E0), gray text (#9E9E9E), cursor: not-allowed
- Hover effect: Darker shade of primary color, transition: 0.2s ease
- Active effect: Slightly darker, scale: 0.98

**Input Fields:**
- Text input: Border: 1px solid #ccc, border-radius: 8px, padding: 12px, font-size: 16px, width: 100% (max-width: 400px)
- Focus state: Border color: #2196F3, outline: 2px solid rgba(33, 150, 243, 0.2)
- Error state: Border color: #F44336, background: #FFEBEE
- Placeholder: Gray text (#9E9E9E), font-size: 16px

**Dropdown/Select:**
- Same styling as text input
- Dropdown arrow: Right-aligned, 16px width
- Options: White background, padding: 12px, hover: #f5f5f5 background

**Status Badges:**
- Format: Colored pill with text
- In Progress: Orange background (#FF9800), white text, padding: 4px 12px, border-radius: 12px, font-size: 12px, font-weight: 500
- Finished: Green background (#4CAF50), white text, same dimensions
- Status dots: Circle, 12px diameter, colored (bad: red, average: yellow, good: green, unset: gray)

**Loading Indicators:**
- Spinner: Circular, 32px diameter, border: 3px solid #f3f3f3, border-top: 3px solid #2196F3, animation: spin 1s linear infinite
- Skeleton loaders: Gray rectangles with shimmer animation for content placeholders

**Modals/Dialogs:**
- Background: Semi-transparent overlay (rgba(0,0,0,0.5))
- Modal: White background, border-radius: 8px, padding: 24px, max-width: 500px, centered on screen
- Close button: X icon, top right, 24px size, gray color

### 2.3.5 Preliminary User Manual

**Getting Started:**
1. Open web browser and navigate to application URL
2. If new user, click "Register" link on login screen
3. Enter username (minimum 3 characters), email, and password (minimum 8 characters)
4. Click "Register" button
5. After registration, login with username/email and password

**Creating a Project:**
1. Login to application
2. On Home screen, click "Start Project" button
3. Select a powerplant from dropdown menu
4. Review parts and checkups list (read-only)
5. Click "Create" button
6. Project appears in Home screen with "In Progress" status

**Conducting an Inspection:**
1. Double-click a project from Home screen to open Ongoing Project screen
2. Review powerplant name at top of screen
3. Browse parts list in left/middle column
4. Click on a checkup to view documentation in right panel
5. Click on checkup again to set status (Bad, Average, or Good)
6. Select status value from dropdown or buttons
7. Status indicator updates immediately
8. Repeat for all checkups

**Finishing a Project:**
1. Click "Finish Report" button in top right corner (validation IS NOT required - project can be finished with unset checkup statuses)
2. Wait for PDF generation (typically 2-5 seconds)
3. PDF automatically downloads to default download location
4. Project status changes to "Finished"
5. Screen redirects to Home screen
6. Finished projects cannot be modified

**Viewing Documentation:**
1. Open Ongoing Project screen
2. Click on any checkup in the parts/checkups list
3. Documentation panel on right displays:
   - Images associated with checkup (if available)
   - Text descriptions (if available)
   - "No documentation available" message if none exists

**Navigation Tips:**
- Double-click project items to open them
- Use "Back" link or browser back button to return to Home
- Click username in header to access logout option
- Session expires after 24 hours of inactivity

**Troubleshooting:**
- If login fails, verify username/email and password are correct
- If project creation fails, ensure powerplant is selected
- If status update fails, verify project is not already Finished
- If PDF download fails, check browser download settings
- Contact system administrator for persistent issues
