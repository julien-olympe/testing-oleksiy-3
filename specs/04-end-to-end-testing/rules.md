# End-to-End Testing Rules

## Test Environment Setup

### Test Database
- All E2E tests must use a dedicated test database instance
- Test database must be isolated from development and production databases
- Database must be reset/cleaned before each test suite execution
- Test data seeding must be performed before test execution
- Database connection string must be configured via environment variable: `TEST_DATABASE_URL`
- All database transactions must be rolled back after each test to ensure test isolation

### Test File Storage
- All file operations must use a dedicated test file storage directory
- Test file storage directory must be separate from production storage
- Storage path must be configured via environment variable: `TEST_STORAGE_PATH`
- All uploaded files must be cleaned up after test execution
- Test files must be organized by test run ID to prevent conflicts
- Maximum file size for test files: 10 MB (as per production constraints)

### Test Data Management
- Test data must be seeded before test execution using predefined fixtures
- Each test must be independent and not rely on data from other tests
- Test data cleanup must occur after each test execution
- Powerplant definitions, parts, and checkups must be pre-populated in test database
- User accounts created during tests must be cleaned up after test completion
- Test data must include:
  - At least 3 powerplants with different configurations
  - Each powerplant must have at least 5 parts
  - Each part must have at least 3 checkups
  - Sample documentation files (images and descriptions) for at least 2 parts per powerplant

## Authentication Handling

### JWT Token Management
- All authenticated API requests must include JWT token in Authorization header: `Authorization: Bearer <token>`
- JWT tokens must be obtained through login or registration endpoints
- Token expiration must be handled: tests must re-authenticate if token expires during test execution
- Token validation must be performed before each authenticated request
- Invalid or expired tokens must result in HTTP 401 responses
- Token format: JWT tokens must be valid JSON Web Tokens signed with test secret key

### Session Management
- User sessions must be created upon successful login or registration
- Session state must be maintained throughout test execution
- Logout must invalidate the session token
- Multiple concurrent sessions for the same user must be supported
- Session timeout: 24 hours of inactivity (as per production requirements)

## Test Data Requirements

### User Test Data
- Test users must have unique usernames and emails for each test run
- Password requirements: minimum 8 characters, must contain letters and numbers
- Test passwords must meet production security requirements
- User accounts must be created with proper password hashing (bcrypt with 12 salt rounds)
- Test user roles: All test users are Field Inspectors (regular users)

### Powerplant Test Data
- Powerplant names must be unique and descriptive
- Each powerplant must have associated parts and checkups
- Powerplant data must be read-only during test execution (no modifications)
- Powerplant IDs must be UUIDs (as per database schema)

### Project Test Data
- Projects must be assigned to specific test users
- Project status must be either "In Progress" or "Finished"
- Projects must reference valid powerplants
- Project creation timestamps must be set automatically
- Checkup status records must be initialized when project is created

### Documentation Test Data
- Documentation files must include both images and text descriptions
- Image files: JPEG, PNG, GIF formats (maximum 10 MB each)
- Text descriptions: Plain text or markdown format
- Documentation must be linked to specific parts
- File paths must use UUIDs to prevent conflicts

## Browser and Device Requirements

### Desktop Testing
- Minimum screen resolution: 1280x720 pixels
- Optimal resolution: 1920x1080 pixels or higher
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript must be enabled
- Browser must support modern web standards (ES6+, CSS Grid, Flexbox)

### Tablet Testing
- Screen resolution: 768x1024 pixels (iPad) or 800x1280 pixels (Android tablet)
- Touch interactions must be supported
- Responsive layout must adapt to tablet viewport
- Landscape and portrait orientations must be tested

### Mobile Testing
- Screen resolution: 375x667 pixels (iPhone SE) or 360x640 pixels (Android)
- Touch interactions must be supported
- Single-column layout must be functional
- Mobile browser compatibility: Chrome Mobile, Safari Mobile, Firefox Mobile

### Browser Automation
- Playwright must be used for browser automation
- Headless mode enabled for CI/CD environments
- Browser instances must be isolated per test
- Browser context must be cleared between tests
- Screenshots must be captured on test failures
- Video recording optional for debugging

## File Upload Handling

### File Upload Requirements
- File uploads must use multipart/form-data encoding
- File type validation: Only JPEG, PNG, GIF, PDF allowed
- File size validation: Maximum 10 MB per file
- Filename sanitization must be applied
- Upload progress must be tracked and verified
- File storage location must be verified after upload

### File Upload Test Data
- Test files must be stored in test fixtures directory
- Test files must include various sizes (small < 1 MB, medium 1-5 MB, large 5-10 MB)
- Test files must include valid and invalid file types
- Test files must include files with special characters in names
- Upload failures must be tested (network errors, server errors, validation errors)

## PDF Generation Verification

### PDF Generation Requirements
- PDF generation must complete within 30 seconds for typical project sizes
- PDF must contain all required sections:
  - Cover page with powerplant name and project date
  - Table of contents
  - Section for each part with:
    - Part name
    - List of checkups with statuses (bad/average/good)
    - Associated images (embedded in PDF)
    - Associated descriptions
  - Footer with page numbers
- PDF file size must not exceed 50 MB
- PDF must be downloadable and openable in standard PDF readers

### PDF Verification Steps
- Verify PDF file is generated and downloaded
- Verify PDF contains all project data
- Verify PDF formatting is correct (headers, page numbers, layout)
- Verify images are embedded correctly
- Verify text content is readable and properly formatted
- Verify PDF file size is within limits

## Error Message Validation

### Error Message Requirements
- Error messages must match exact specifications from functional requirements
- Error messages must be user-friendly and not expose internal system details
- Error messages must be displayed in appropriate UI locations (inline, toast, banner)
- HTTP status codes must match error types:
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (authentication failures)
  - 403: Forbidden (authorization failures)
  - 404: Not Found (resource not found)
  - 500: Internal Server Error (server errors)
  - 503: Service Unavailable (service busy)
  - 504: Gateway Timeout (timeout errors)

### Error Message Validation
- Test all error scenarios described in functional requirements
- Verify error messages are displayed correctly
- Verify error messages are cleared after successful operations
- Verify error handling does not break application flow
- Verify error messages are accessible (screen reader compatible)

## Timing and Performance Expectations

### Response Time Requirements
- User registration: < 1 second
- User login: < 500 milliseconds
- List user projects: < 500 milliseconds
- Create new project: < 2 seconds
- Open project details: < 1 second
- Update checkup status: < 300 milliseconds
- Upload documentation file: Depends on file size (2-10 seconds)
- PDF report generation: < 30 seconds for typical projects

### Performance Testing
- Response times must be measured and verified
- Performance degradation must be reported if thresholds are exceeded
- Load testing may be performed separately (not part of E2E test suite)
- Network latency must be considered in test environment

## Test Isolation Requirements

### Test Independence
- Each test must be completely independent
- Tests must not share state or data
- Tests must be executable in any order
- Tests must be executable in parallel (when supported by test framework)
- Test failures must not affect other tests

### Test Cleanup
- All test data must be cleaned up after test execution
- Database records created during tests must be deleted
- Files uploaded during tests must be removed
- User sessions must be cleared
- Browser state must be reset

### Test Setup and Teardown
- Setup: Initialize test database, seed test data, configure test environment
- Teardown: Clean up test data, close browser instances, reset environment
- Setup and teardown must be performed for each test suite
- Individual test cleanup must be performed after each test case

## Test Execution Standards

### Test Execution Order
- Tests must be executable in any order
- Critical path test may be executed first to verify basic functionality
- Negative test cases may be executed after positive test cases
- Test suites may be organized by use case or feature area

### Test Reporting
- Test results must include: pass/fail status, execution time, error messages
- Test coverage must be reported (percentage of requirements covered)
- Screenshots must be captured on test failures
- Test logs must be preserved for debugging

### Test Maintenance
- Tests must be updated when requirements change
- Tests must be reviewed for accuracy and completeness
- Obsolete tests must be removed or updated
- Test data must be kept up-to-date with schema changes

## Assertions and Validation Points

### UI Assertions
- Verify page elements are displayed correctly
- Verify navigation works as expected
- Verify form validation messages appear
- Verify status indicators update correctly
- Verify responsive layout adapts to viewport

### Data Assertions
- Verify data is saved correctly to database
- Verify data is retrieved correctly from database
- Verify data relationships are maintained (foreign keys, references)
- Verify data integrity constraints are enforced

### API Assertions
- Verify HTTP status codes are correct
- Verify response body structure matches specifications
- Verify response data is accurate
- Verify error responses include appropriate error messages

## Test Documentation Standards

### Test File Naming
- Test files must be named descriptively: `##-test-scenario-name.md`
- Test files must be numbered sequentially
- Test file names must clearly indicate the use case and scenario

### Test Documentation Format
- Each test must include: Test ID, name, description, prerequisites, steps, data requirements, expected outcomes, cleanup
- Test steps must be detailed and unambiguous
- Expected results must be specific and verifiable
- Test data must be clearly defined

### Test Coverage
- All functional requirements must be covered by tests
- All user journeys from screen specifications must be tested
- All error scenarios must be tested
- All edge cases must be considered
