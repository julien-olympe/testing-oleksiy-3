# End-to-End Testing Rules

## 1. General Testing Principles

### 1.1 Test Structure
- All E2E tests must follow a consistent structure:
  - Test name and description
  - Prerequisites/setup steps
  - Step-by-step test actions with expected results
  - Test data requirements
  - Assertions/verification points
  - Cleanup steps if needed

### 1.2 Test Isolation
- Each test must be independent and executable in isolation
- Tests should not depend on the execution order of other tests
- Test data must be created fresh for each test execution
- Tests must clean up any data they create (or use test database rollback)

### 1.3 Test Data Management
- Use realistic but distinct test data to avoid conflicts
- Test data must be unique (e.g., unique usernames, emails, project names)
- Test data should be clearly identifiable as test data (e.g., prefix with "test_")
- Avoid hardcoded IDs; use dynamic data creation or lookup

### 1.4 Assertions
- Every test action must have corresponding assertions
- Assertions must verify both positive outcomes (success cases) and negative outcomes (error cases)
- Verify UI state, API responses, database state, and user feedback messages
- Include timing assertions for performance-critical operations

## 2. Test Execution Rules

### 2.1 Environment Setup
- Tests must work in development, staging, and test environments
- Database must be in a known state before test execution
- All required test data (powerplants, parts, checkups) must exist or be created
- Session management must be properly handled (login before authenticated operations)

### 2.2 Browser and Device Testing
- Tests must be executable on Chrome, Firefox, Safari, and Edge (latest 2 versions)
- Responsive design tests must cover desktop (1024px+), tablet (768-1023px), and mobile (<768px)
- Touch interactions must be tested for mobile devices
- Keyboard navigation must be tested for accessibility

### 2.3 Performance Requirements
- Page load times must meet specifications:
  - Login/Registration: < 1 second
  - Home screen: < 2 seconds
  - Start Project screen: < 2 seconds
  - Ongoing Project screen: < 3 seconds
- API response times must be verified:
  - Authentication: < 500ms
  - Project list: < 500ms
  - Project details: < 1 second
  - Status updates: < 300ms
  - PDF generation: < 5 seconds
- Tests must fail if performance thresholds are exceeded

### 2.4 Error Handling
- All error scenarios must be tested
- Error messages must be verified for correctness and user-friendliness
- Error states must not leave the application in an inconsistent state
- Network errors, timeout errors, and server errors must be handled gracefully

## 3. Test Coverage Requirements

### 3.1 Functional Coverage
- All use cases must have corresponding E2E tests
- Happy paths (positive scenarios) must be tested
- Failure paths (negative scenarios) must be tested
- Edge cases and boundary conditions must be tested
- Invalid input validation must be tested

### 3.2 User Journey Coverage
- Complete user workflows must be tested end-to-end
- Navigation between screens must be verified
- State persistence across navigation must be verified
- Session management across page refreshes must be verified

### 3.3 Data Integrity
- Database state must be verified after each operation
- Data relationships must be maintained correctly
- Foreign key constraints must be respected
- Unique constraints must be enforced

## 4. Test Naming and Organization

### 4.1 Test File Naming
- Test files must follow the pattern: `NN-description.md` where NN is a two-digit number
- Test files must be organized by use case or user journey
- Critical path tests must be numbered first (01-critical-path.md)

### 4.2 Test Case Naming
- Test cases within files must have descriptive names
- Test case names must indicate the scenario being tested
- Positive tests: "TC-XXX: [Action] - Success"
- Negative tests: "TC-XXX: [Action] - [Error Condition]"

### 4.3 Test Step Numbering
- Test steps must be numbered sequentially (1, 2, 3, ...)
- Sub-steps may use decimal notation (1.1, 1.2, ...)
- Expected results must be clearly stated after each step

## 5. Security Testing Rules

### 5.1 Authentication Testing
- Unauthenticated access attempts must be blocked
- Session expiration must be tested
- Invalid credentials must be rejected
- Password requirements must be enforced

### 5.2 Authorization Testing
- Users must only access their own projects
- Cross-user data access must be prevented
- Unauthorized operations must be rejected
- Session hijacking attempts must be blocked

### 5.3 Input Validation Testing
- SQL injection attempts must be blocked
- XSS (Cross-Site Scripting) attempts must be prevented
- Invalid input formats must be rejected
- Boundary value testing must be performed

## 6. Test Data Requirements

### 6.1 User Test Data
- At least 2 test users must be available (for access control testing)
- Test users must have valid credentials
- Test users must have different roles if role-based access is implemented

### 6.2 Powerplant Test Data
- At least 2 powerplants must exist in test database
- Each powerplant must have at least 2 parts
- Each part must have at least 2 checkups
- At least one checkup must have documentation (images and text)

### 6.3 Project Test Data
- Projects in various states must exist (In Progress, Finished)
- Projects must be assigned to different users
- Projects must reference different powerplants

## 7. Assertion Requirements

### 7.1 UI Assertions
- Element visibility and presence
- Element text content and values
- Element states (enabled/disabled, selected/unselected)
- CSS classes and styling
- Error message display
- Loading states and indicators

### 7.2 API Assertions
- HTTP status codes
- Response body structure and content
- Response headers
- Error response format
- Response timing

### 7.3 Database Assertions
- Record existence
- Record field values
- Record relationships
- Record counts
- Timestamp values

### 7.4 File Assertions
- File download initiation
- File content validation (for PDFs)
- File naming conventions
- File size limits

## 8. Test Maintenance Rules

### 8.1 Test Updates
- Tests must be updated when requirements change
- Tests must be updated when UI changes
- Tests must be updated when API contracts change
- Obsolete tests must be removed or marked as deprecated

### 8.2 Test Documentation
- Test descriptions must be clear and unambiguous
- Test steps must be detailed enough for manual execution
- Test data requirements must be documented
- Known issues and limitations must be documented

### 8.3 Test Execution
- Tests must be executable both manually and automatically
- Test automation scripts must be maintainable
- Test results must be reproducible
- Flaky tests must be identified and fixed

## 9. Reporting Requirements

### 9.1 Test Results
- Test execution must produce clear pass/fail results
- Failed tests must include error messages and screenshots
- Test execution time must be recorded
- Test coverage metrics must be tracked

### 9.2 Defect Reporting
- Failed tests must be linked to defect reports
- Defect reports must include steps to reproduce
- Defect reports must include expected vs. actual results
- Defect reports must include environment information

## 10. Special Considerations

### 10.1 PDF Generation Testing
- PDF content must be verified (text, images, structure)
- PDF file size must be within limits (< 25 MB)
- PDF generation time must be acceptable (< 5 seconds for typical projects)
- PDF download must be triggered correctly

### 10.2 Image Handling Testing
- Image display must be tested
- Image loading performance must be verified
- Missing images must be handled gracefully
- Image format validation must be tested

### 10.3 Concurrent Operations
- Multiple simultaneous operations must be tested
- Race conditions must be identified
- Database locking must be verified
- Session conflicts must be handled

### 10.4 Browser Compatibility
- Cross-browser testing must be performed
- Browser-specific features must be tested
- Browser limitations must be documented
- Polyfills must be tested if used
