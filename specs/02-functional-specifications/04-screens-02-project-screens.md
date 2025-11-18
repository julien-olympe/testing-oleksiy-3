# 4 - Screens (Part 2: Project Screens)

## Screen 3: Ongoing Project Screen

**Purpose:** Allows users to view project details, set checkup statuses, view documentation, and finish the project by generating a PDF report.

**Layout:**
- Three-column layout on desktop:
  - Left: Powerplant name and navigation
  - Center: Parts and checkups list
  - Right: Documentation viewer panel
- Two-column layout on tablet (parts list and documentation stack)
- Single column on mobile (parts list, documentation below)

**Components:**
- Header section:
  - Powerplant name (large, top center)
  - "Finish Report" button (top right, primary action)
  - Back button/arrow (top left, returns to Home Screen)
- Center section (Parts and Checkups):
  - Parts list (expandable/collapsible sections or flat list)
  - Each part shows:
    - Part name (heading)
    - List of checkups under the part
    - Each checkup shows:
      - Checkup name/description
      - Status selector (three buttons: Bad, Average, Good)
      - Current status indicator (color-coded badge)
- Right section (Documentation Viewer):
  - Panel title: "Documentation"
  - Image gallery (thumbnails, clickable for full view)
  - Text descriptions (below images)
  - Empty state if no part selected or no documentation

**Navigation:**
- Back button returns to Home Screen
- Clicking a part updates documentation viewer
- Clicking "Finish Report" triggers PDF generation and returns to Home Screen after completion

**Related Use Cases:**
- Use Case 5: View Ongoing Project Details
- Use Case 6: Set Checkup Status
- Use Case 7: View Documentation/Images for Parts
- Use Case 8: Finish Report and Generate PDF

**User Interactions:**
- User clicks on a part to view its documentation
- User clicks status buttons (Bad/Average/Good) to set checkup status
- User clicks "Finish Report" to generate PDF and complete project
- User clicks back button to return to project list

**Visual States:**
- Loading: Spinner while loading project data
- Active: All components displayed, status buttons enabled
- Part selected: Selected part highlighted, documentation displayed
- Status set: Status button shows selected state, color-coded indicator updated
- Generating PDF: "Finish Report" button shows loading state, user cannot interact
- Error: Error message displayed if operation fails

**Status Button Design:**
- Three buttons in a row: Bad (red), Average (yellow), Good (green)
- Selected button: Highlighted/bordered, other buttons dimmed
- Unset status: All buttons in neutral gray state
- Clicking a button immediately saves status and updates visual indicator

**Documentation Viewer Behavior:**
- Displays when a part is selected
- Shows images as thumbnails in a grid
- Clicking thumbnail opens full-size image in modal/overlay
- Text descriptions appear below image gallery
- Scrollable if content exceeds panel height

---

## Screen 4: Start Project Screen

**Purpose:** Allows users to create a new inspection project by selecting a powerplant from available options.

**Layout:**
- Centered form layout
- Powerplant selector dropdown at top
- Preview section below dropdown showing parts and checkups
- Create button at bottom

**Components:**
- Back button (top left, returns to Home Screen)
- Screen title: "Start New Project"
- Powerplant selector:
  - Dropdown/select input
  - Label: "Select Powerplant"
  - Placeholder: "Choose a powerplant..."
- Preview section:
  - Title: "Parts and Checkups Preview"
  - Expandable list showing:
    - Part names
    - Checkups under each part (indented)
  - Displayed only after powerplant selection
- "Create" button (primary action, bottom center, disabled until powerplant selected)

**Navigation:**
- Back button returns to Home Screen
- After clicking "Create", user is redirected to Ongoing Project Screen for the new project

**Related Use Cases:**
- Use Case 4: Start New Project

**User Interactions:**
- User selects powerplant from dropdown
- System displays preview of parts and checkups for selected powerplant
- User reviews preview
- User clicks "Create" button to create project
- System creates project and redirects to Ongoing Project Screen

**Visual States:**
- Initial: Dropdown empty, preview hidden, Create button disabled
- Powerplant selected: Preview displayed, Create button enabled
- Creating: Create button shows loading spinner, form disabled
- Success: User redirected to Ongoing Project Screen
- Error: Error message displayed, form remains enabled for retry

**Preview Section Details:**
- Shows hierarchical structure: Part name as parent, checkups as children
- Read-only display (users cannot edit parts or checkups)
- Scrollable if list is long
- Format: "Part Name" with indented "Checkup Name" items below

**Validation:**
- Create button remains disabled until a powerplant is selected
- Error message displayed if project creation fails
- User cannot proceed without selecting a powerplant
