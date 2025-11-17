# 4. Screens - Screen Specifications (Screens 4-5)

## 4.2 Screen Specifications (continued)

### Screen 4: Start Project Screen

**Screen Name:** Project Creation Interface

**Related Use Cases:** Start New Project (Use Case 5), Select Powerplant (Use Case 6), Create Project (Use Case 7)

**Layout:**
- Header bar with application title and user menu
- Main content area:
  - Page title "Start New Project"
  - Powerplant selector (dropdown) at top
  - Parts and checkups display area (below selector)
  - "Create" button at bottom
  - "Back" or "Cancel" link/button

**Elements:**
- **Powerplant Dropdown**: Select element, required, placeholder "Select a powerplant...", populated with all powerplants
- **Parts and Checkups Area**: Read-only display showing:
  - Parts list (expandable/collapsible sections)
  - For each part: list of checkups
  - For each checkup: name and documentation indicator
  - Display updates when powerplant is selected
- **Create Button**: Primary button, bottom of form, disabled until powerplant selected
- **Back/Cancel Link**: Text link or button, navigates to home screen
- **Loading Indicator**: Shows while loading parts/checkups after powerplant selection

**Interactions:**
- User selects powerplant from dropdown → triggers Select Powerplant use case, displays parts and checkups
- User clicks "Create" button → triggers Create Project use case, creates project and navigates to home screen
- User clicks "Back/Cancel" → navigates to home screen without creating project
- Create button enabled only when powerplant is selected

**Visual Design:**
- Clear hierarchy: selector at top, content in middle, action button at bottom
- Parts/checkups displayed in organized, readable format (tree structure or nested lists)
- Visual feedback when powerplant is selected
- Responsive design

---

### Screen 5: Ongoing Project Screen

**Screen Name:** Project Inspection Interface

**Related Use Cases:** View Ongoing Project (Use Case 8), Set Checkup Status (Use Case 9), View Documentation (Use Case 10), Finish Report (Use Case 11)

**Layout:**
- Header bar with application title, user menu, and "Finish Report" button (top right)
- Main content area (three-column or two-column layout):
  - Left/Middle: Powerplant name (header) and parts/checkups list
  - Right: Documentation panel (images and descriptions)

**Elements:**
- **Powerplant Name**: Large heading at top of content area
- **Finish Report Button**: Primary button, top right of header, only enabled for "In Progress" projects
- **Parts List**: Scrollable list in left/middle column:
  - Each part as expandable section
  - Part name as section header
  - Checkups listed under each part
  - Each checkup shows:
    - Checkup name
    - Status indicator (bad/average/good or unset)
    - Clickable to set/change status
- **Status Selection Interface**: Appears when checkup is clicked:
  - Three buttons or dropdown: "Bad" (red), "Average" (yellow), "Good" (green)
  - Or inline status selector
- **Documentation Panel**: Right column, shows:
  - Selected checkup name (header)
  - Images (if available) in scrollable gallery
  - Text descriptions (if available)
  - "No documentation" message if none exists
- **Back/Home Link**: Navigation link to return to home screen

**Interactions:**
- User clicks on checkup → displays status selector, updates documentation panel (triggers View Documentation use case)
- User selects status value → triggers Set Checkup Status use case, updates status indicator
- User clicks "Finish Report" button → triggers Finish Report use case, generates PDF and navigates to home screen
- User clicks "Back/Home" → navigates to home screen
- Documentation panel updates when different checkup is selected
- Status indicators update immediately after status change

**Visual Design:**
- Three-column layout (desktop) or stacked layout (mobile)
- Color-coded status indicators:
  - Bad = red
  - Average = yellow/orange
  - Good = green
  - Unset = gray
- Clear visual hierarchy for parts and checkups
- Documentation images displayed in grid or carousel
- Responsive design that stacks columns on mobile
- Loading states for status updates and documentation loading

**State Management:**
- Project status "Finished" → "Finish Report" button disabled or hidden
- All checkups with status set → visual indicator (optional: enable Finish Report only when all set)
- Selected checkup highlighted in parts list
- Status changes saved automatically (no separate save button)
