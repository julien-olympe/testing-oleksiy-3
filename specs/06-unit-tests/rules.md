# Unit Testing Rules

## General Principles

### Test Isolation
- **No Shared State**: Each unit test must be completely independent and not rely on state from other tests
- **Fresh Setup**: Every test must set up its own test data and mocks
- **Clean Teardown**: All mocks and test data must be cleaned up after each test
- **No Test Ordering Dependencies**: Tests must pass regardless of execution order
- **Isolated Execution**: Tests must be able to run in parallel without conflicts

### Mocking Requirements

**Database Mocking**
- All database operations must be mocked using Jest mocks
- Mock database connection, query methods, and transaction methods
- Never use real database connections in unit tests
- Mock database responses with realistic data structures matching the schema
- Mock database errors (connection failures, query timeouts, constraint violations)

**File System Mocking**
- All file system operations must be mocked (fs, path modules)
- Mock file read, write, delete, and stat operations
- Mock file system errors (permission errors, disk full, file not found)
- Never perform actual file system operations in unit tests

**External Services Mocking**
- PDF Generator Service (Puppeteer) must be completely mocked
- JWT token generation/verification must be mocked
- bcrypt password hashing must be mocked (use jest.mock for bcrypt module)
- HTTP client calls must be mocked if any external APIs are called
- Never make real external service calls in unit tests

**Time-Dependent Operations**
- Mock Date.now(), new Date(), and timestamp generation
- Use Jest fake timers for time-dependent logic
- Ensure consistent timestamps across test runs

### Test Data Management

**Fixtures and Factories**
- Use test fixtures for common data structures (User, Project, Powerplant, Part, Checkup)
- Create factory functions to generate test data with customizable properties
- Use realistic but minimal test data (avoid over-complicated fixtures)
- Ensure test data matches actual data structure specifications

**Test Data Isolation**
- Each test creates its own test data instances
- Never reuse test data objects across tests (create new instances)
- Use unique identifiers (UUIDs) for each test instance
- Clear test data between tests

### Assertion Standards

**Specific Assertions**
- Use specific Jest matchers (toBe, toEqual, toHaveBeenCalledWith, etc.)
- Assert exact expected values, not just truthiness
- Verify both return values and side effects (mocked function calls)
- Check error messages match expected format

**Error Testing**
- Test that errors are thrown with correct error types
- Verify error messages match specification requirements
- Test error handling paths (try-catch blocks, error responses)
- Assert that errors are properly logged (if applicable)

**Validation Testing**
- Test all validation rules explicitly
- Test both valid and invalid inputs
- Test boundary conditions (min/max values, empty strings, null values)
- Verify validation error messages match specifications

### Code Coverage Expectations

**Coverage Targets**
- **Critical Business Logic**: 80% minimum coverage
- **Validation Functions**: 100% coverage (all validation rules tested)
- **Error Handling**: 100% coverage (all error paths tested)
- **Authentication Logic**: 100% coverage (security-critical)
- **Access Control Logic**: 100% coverage (security-critical)

**Coverage Measurement**
- Use Jest coverage reports to track coverage
- Focus on statement, branch, function, and line coverage
- Ensure all branches (if/else, switch cases) are tested
- Test both success and failure paths

### Test Naming Conventions

**Test File Naming**
- Test files: `*.test.ts` or `*.spec.ts`
- Co-locate test files with source files or in `__tests__` directories
- Use descriptive names matching the component being tested

**Test Case Naming**
- Use descriptive test names: `describe('functionName', () => { it('should do X when Y', ...) })`
- Follow pattern: `should [expected behavior] when [condition]`
- Group related tests using `describe` blocks
- Use nested `describe` blocks for organizing test suites

**Example:**
```typescript
describe('validateUsername', () => {
  describe('when username is valid', () => {
    it('should return true for alphanumeric username', () => {});
    it('should return true for username with underscores', () => {});
  });
  describe('when username is invalid', () => {
    it('should return false for empty string', () => {});
    it('should return false for username with special characters', () => {});
  });
});
```

### Test Organization

**By Feature/Component**
- Group tests by feature area (authentication, projects, checkups, documentation)
- Group tests by component/class/module
- Use describe blocks to create logical test hierarchies
- Keep related tests together

**Test Structure**
- Arrange: Set up test data and mocks
- Act: Execute the function being tested
- Assert: Verify expected outcomes

**Example Structure:**
```typescript
describe('UserService', () => {
  beforeEach(() => {
    // Setup mocks and test data
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  describe('registerUser', () => {
    it('should create user when valid data provided', () => {});
    it('should throw error when username exists', () => {});
  });
});
```

### Mock vs Real Implementations

**Always Mock**
- Database operations
- File system operations
- External services (PDF generator, email service)
- Network requests
- Time-dependent functions (Date, timers)
- Cryptographic functions (bcrypt, JWT) - mock for unit tests

**Can Use Real (with caution)**
- Pure utility functions (string manipulation, array operations)
- Simple validation functions (if they have no dependencies)
- Data transformation functions (if they have no side effects)

**Mock Strategy**
- Mock at the module boundary (mock the database module, not individual queries)
- Use Jest's `jest.mock()` for module-level mocking
- Use `jest.fn()` for function-level mocking
- Use `jest.spyOn()` when you need to verify calls but keep some real behavior

### Error Testing Patterns

**Exception Testing**
- Test that functions throw errors with `expect(() => fn()).toThrow()`
- Test error types: `expect(() => fn()).toThrow(ValidationError)`
- Test error messages: `expect(() => fn()).toThrow('Expected error message')`

**Async Error Testing**
- Test async errors: `await expect(asyncFn()).rejects.toThrow()`
- Test async error types: `await expect(asyncFn()).rejects.toThrow(ValidationError)`

**Error Response Testing**
- Mock error scenarios (database errors, file errors, network errors)
- Verify error handling code paths
- Test error logging (if applicable)
- Verify user-friendly error messages

### Boundary Testing Patterns

**Boundary Value Testing**
- Test minimum values (0, 1, empty string, null)
- Test maximum values (max file size, max length, max items)
- Test values just below/above boundaries
- Test edge cases (empty arrays, single item, very large values)

**Input Validation Boundaries**
- Test valid inputs at boundaries
- Test invalid inputs just outside boundaries
- Test null/undefined handling
- Test type mismatches

**Performance Boundaries**
- Test with maximum allowed data sizes
- Test with maximum number of items
- Test concurrent operations (if applicable)
- Verify performance constraints are met

### Performance Testing in Unit Tests

**Performance Considerations**
- Unit tests should complete quickly (< 100ms per test)
- Avoid expensive operations in unit tests (use mocks)
- Test performance-critical functions with timing assertions if needed
- Use Jest's performance testing capabilities for critical paths

**When to Test Performance**
- Test functions with performance requirements (response time < X ms)
- Test functions that process large datasets
- Test functions with complexity requirements
- Use integration tests for actual performance measurement

### Test Independence and Repeatability

**Independence**
- Tests must not depend on external state
- Tests must not depend on execution order
- Tests must not depend on other tests' side effects
- Each test should be able to run in isolation

**Repeatability**
- Tests must produce consistent results across runs
- Use fixed test data (no random values unless testing randomness)
- Mock time-dependent operations
- Ensure deterministic test execution

### Best Practices

**Test Quality**
- Write tests that are easy to read and understand
- Use descriptive variable names in tests
- Add comments for complex test scenarios
- Keep tests focused (test one thing per test)

**Test Maintenance**
- Update tests when requirements change
- Refactor tests when code is refactored
- Remove obsolete tests
- Keep tests in sync with implementation

**Test Documentation**
- Document complex test scenarios
- Explain why certain edge cases are tested
- Document mock setup requirements
- Include references to specifications/requirements

### Security Testing in Unit Tests

**Authentication Testing**
- Test password hashing (verify bcrypt is called with correct parameters)
- Test password comparison (verify bcrypt.compare is used)
- Test JWT token generation (verify correct payload and expiration)
- Test JWT token verification (verify token validation logic)

**Authorization Testing**
- Test access control checks (user ownership verification)
- Test unauthorized access scenarios
- Test permission checks for all protected resources
- Verify security error messages don't leak sensitive information

**Input Validation Security**
- Test SQL injection prevention (verify parameterized queries)
- Test XSS prevention (verify output encoding)
- Test path traversal prevention (verify filename sanitization)
- Test file type validation (verify MIME type checking)

### Integration with CI/CD

**Test Execution**
- All unit tests must pass before code merge
- Tests must run in CI/CD pipeline
- Failed tests must block deployment
- Test coverage reports must be generated

**Test Reporting**
- Generate test coverage reports
- Report test execution time
- Identify slow tests for optimization
- Track test coverage trends
