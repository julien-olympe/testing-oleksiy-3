# 4. Screens - General Layout and Navigation

## 4.1 General Layout and Navigation

The application follows a standard web application layout with the following navigation structure:

**Navigation Elements:**
- **Header Bar**: Contains application title "Wind Power Plant Investigation" and user menu (username, logout option)
- **Main Content Area**: Displays the current screen content
- **Footer**: Optional footer with version information

**Navigation Flow:**
- Login Screen → (after authentication) → Home Screen
- Home Screen → (double-click project) → Ongoing Project Screen
- Home Screen → (click "Start Project" button) → Start Project Screen
- Start Project Screen → (click "Create" button) → Home Screen
- Ongoing Project Screen → (click "Finish Report" button) → Home Screen (after PDF download)
- Any screen → (session timeout or logout) → Login Screen

**Menu Structure:**
- No persistent navigation menu (navigation is context-based)
- Back button or "Home" link available on Start Project and Ongoing Project screens
- Logout option in user menu (header)

## 4.2 Screen Flow Diagram

```
                    ┌─────────────┐
                    │ Login Screen │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Home Screen │
                    └──┬────────┬─┘
                       │        │
        ┌──────────────┘        └──────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│ Start Project  │                    │ Ongoing Project │
│    Screen      │                    │     Screen      │
└───────┬────────┘                    └────────┬────────┘
        │                                       │
        │ (Create)                              │ (Finish Report)
        │                                       │
        └──────────────┬───────────────────────┘
                       │
                ┌──────▼──────┐
                │ Home Screen │
                │ (refreshed) │
                └─────────────┘
```

## 4.3 Responsive Design Requirements

**Desktop (1024px and above):**
- Full three-column layout for Ongoing Project screen
- Side-by-side forms on Login/Registration
- Grid layout for project list (2-3 columns)

**Tablet (768px - 1023px):**
- Two-column layout for Ongoing Project screen
- Stacked forms on Login/Registration
- Grid layout for project list (2 columns)

**Mobile (below 768px):**
- Single column layout for all screens
- Stacked documentation panel below parts/checkups
- Full-width project list
- Touch-friendly button sizes (minimum 44px height)
