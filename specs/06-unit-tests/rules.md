# Unit Test Rules and Guidelines

## 1. General Principles

### 1.1 Test Framework
- **Framework**: Jest for unit tests
- **Test Location**: Tests should be co-located with source code or in dedicated `__tests__` directories
- **Naming Convention**: Test files should be named `*.test.ts` or `*.spec.ts`
- **Test Structure**: Use `describe()` blocks for grouping related tests, `test()` or `it()` for individual test cases

### 1.2 Test Isolation
- Each test must be independent and not rely on other tests
- Tests must not share state between executions
- Use `beforeEach()` and `afterEach()` hooks for setup and cleanup
- Reset all mocks between tests using `jest.clearAllMocks()` or `jest.resetAllMocks()`

### 1.3 Test Data Management
- Use factory functions or fixtures for creating test data
- Never use production data in tests
- Generate unique test data for each test run (use UUIDs, timestamps, or random values)
- Clean up test data after each test to prevent database pollution

### 1.4 Mocking Strategy
- **Database Operations**: Mock Prisma Client methods (e.g., `prisma.user.create`, `prisma.project.findMany`)
- **External Services**: Mock PDF generation, image processing, and network requests
- **Session Management**: Mock session storage and authentication middleware
- **File System**: Mock file operations if applicable
- **Time-dependent Operations**: Use `jest.useFakeTimers()` or mock Date objects for time-sensitive tests

### 1.5 Test Coverage Requirements
- **Minimum Coverage**: 80% code coverage for all business logic
- **Critical Paths**: 100% coverage for authentication, authorization, and data validation
- **Edge Cases**: All boundary conditions and error paths must be tested
- **API Endpoints**: All API endpoints must have both positive and negative test cases

## 2. Test Structure

### 2.1 Test File Organization
Each test file should follow this structure:

```typescript
describe('Component/Function Name', () => {
  // Setup and teardown
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
  });

  // Test groups
  describe('Happy Path', () => {
    test('should perform expected behavior', () => {
      // Test implementation
    });
  });

  describe('Error Handling', () => {
    test('should handle error condition', () => {
      // Test implementation
    });
  });

  describe('Edge Cases', () => {
    test('should handle boundary condition', () => {
      // Test implementation
    });
  });
});
```

### 2.2 Test Naming
- Use descriptive test names that explain what is being tested
- Format: `should [expected behavior] when [condition]`
- Examples:
  - `should create user when valid data provided`
  - `should reject registration when username already exists`
  - `should return 401 when session expired`

### 2.3 Assertions
- Use specific assertions: `expect().toBe()`, `expect().toEqual()`, `expect().toThrow()`
- Prefer `toHaveBeenCalledWith()` for function call verification
- Use `toMatchObject()` for partial object matching
- Verify error messages and status codes explicitly

## 3. Mocking Guidelines

### 3.1 Database Mocking (Prisma)
```typescript
// Mock Prisma Client
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  // ... other models
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));
```

### 3.2 Session Mocking
```typescript
// Mock session object
const mockSession = {
  userId: 'test-user-id',
  destroy: jest.fn(),
};

const mockRequest = {
  session: mockSession,
  cookies: {},
};
```

### 3.3 PDF Generation Mocking
```typescript
// Mock PDFKit
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    image: jest.fn(),
    end: jest.fn(),
    pipe: jest.fn(),
  }));
});
```

### 3.4 Image Processing Mocking
```typescript
// Mock Sharp
jest.mock('sharp', () => {
  return jest.fn().mockResolvedValue({
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-data')),
  });
});
```

### 3.5 HTTP Request Mocking
```typescript
// Mock Axios for frontend tests
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}));
```

## 4. Test Categories

### 4.1 Unit Tests
- Test individual functions, methods, or components in isolation
- Mock all dependencies
- Focus on logic correctness
- Fast execution (< 100ms per test)

### 4.2 Integration Tests
- Test interaction between multiple components
- Mock external services but use real database connections (test database)
- Test API endpoints with real request/response cycle
- May be slower but still isolated

### 4.3 Error Condition Tests
- Test all error paths and exception handling
- Verify appropriate error messages and status codes
- Test retry mechanisms and fallback behaviors
- Test validation failures

### 4.4 Boundary Tests
- Test minimum and maximum values
- Test empty inputs and null/undefined handling
- Test array/collection boundaries (empty, single item, maximum size)
- Test string length limits

## 5. Validation Testing

### 5.1 Input Validation
- Test all Zod schema validations
- Test required field validation
- Test format validation (email, UUID, etc.)
- Test length constraints (min/max)
- Test enum value validation

### 5.2 Business Rule Validation
- Test unique constraint violations
- Test foreign key constraints
- Test status transition rules
- Test access control rules

## 6. Security Testing

### 6.1 Authentication Tests
- Test valid login credentials
- Test invalid credentials
- Test expired sessions
- Test missing authentication tokens
- Test session hijacking prevention

### 6.2 Authorization Tests
- Test access to own resources (should succeed)
- Test access to other users' resources (should fail)
- Test project access control
- Test unauthorized endpoint access

### 6.3 Input Sanitization Tests
- Test SQL injection prevention
- Test XSS prevention
- Test path traversal prevention
- Test command injection prevention

## 7. Performance Testing

### 7.1 Response Time Tests
- Test API response times meet requirements
- Test database query performance
- Test PDF generation time limits
- Test image loading performance

### 7.2 Load Tests (Unit Test Level)
- Test concurrent request handling
- Test database connection pooling
- Test memory usage for large datasets
- Test maximum file size handling

## 8. Test Data Requirements

### 8.1 User Test Data
- Valid users with proper UUIDs
- Users with various roles (if applicable)
- Users with existing projects
- Users without projects

### 8.2 Project Test Data
- Projects in "In Progress" status
- Projects in "Finished" status
- Projects with various checkup statuses
- Projects with and without documentation

### 8.3 Powerplant Test Data
- Powerplants with multiple parts
- Powerplants with multiple checkups per part
- Powerplants with documentation
- Empty powerplants (no parts)

## 9. Test Execution

### 9.1 Running Tests
- Run all tests: `npm test`
- Run specific test file: `npm test -- path/to/test.test.ts`
- Run tests in watch mode: `npm test -- --watch`
- Run tests with coverage: `npm test -- --coverage`

### 9.2 Test Environment
- Use separate test database or in-memory database
- Use test environment variables
- Clean database state before test suite
- Use transactions that rollback after tests

### 9.3 Test Output
- Tests must produce clear, actionable error messages
- Use descriptive assertion messages
- Log test execution time for performance-critical tests
- Generate coverage reports

## 10. Best Practices

### 10.1 Test Maintainability
- Keep tests simple and focused
- Avoid test interdependencies
- Use helper functions for common test setup
- Document complex test scenarios

### 10.2 Test Reliability
- Avoid flaky tests (time-dependent, random, network-dependent)
- Use deterministic test data
- Mock external dependencies
- Avoid testing implementation details

### 10.3 Test Readability
- Use clear variable names
- Add comments for complex test logic
- Group related tests together
- Use descriptive test descriptions

### 10.4 Test Efficiency
- Run fast tests frequently
- Run slow tests in CI/CD pipeline
- Use test parallelization when possible
- Clean up resources promptly

## 11. Common Patterns

### 11.1 Testing Async Operations
```typescript
test('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 11.2 Testing Error Throwing
```typescript
test('should throw error on invalid input', () => {
  expect(() => {
    functionWithValidation(invalidInput);
  }).toThrow('Expected error message');
});
```

### 11.3 Testing HTTP Responses
```typescript
test('should return 200 with correct data', async () => {
  const response = await request(app)
    .get('/api/projects')
    .set('Cookie', validSessionCookie);
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('projects');
});
```

### 11.4 Testing Database Operations
```typescript
test('should create record in database', async () => {
  const mockCreate = jest.fn().mockResolvedValue(mockUser);
  mockPrisma.user.create = mockCreate;
  
  await createUser(userData);
  
  expect(mockCreate).toHaveBeenCalledWith({ data: userData });
});
```

## 12. Coverage Goals

### 12.1 Minimum Coverage Targets
- **Business Logic**: 90% line coverage
- **API Routes**: 100% route coverage (all endpoints tested)
- **Error Handlers**: 100% error path coverage
- **Validators**: 100% validation rule coverage
- **Utilities**: 80% utility function coverage

### 12.2 Coverage Exclusions
- Type definitions and interfaces
- Configuration files
- Test files themselves
- Generated code (Prisma Client)
- Error logging utilities (if not business logic)

## 13. Continuous Integration

### 13.1 Pre-commit Checks
- Run linter before committing
- Run unit tests before committing
- Ensure all tests pass before merge

### 13.2 CI Pipeline
- Run full test suite on pull requests
- Generate coverage reports
- Fail build if coverage drops below threshold
- Run tests in parallel for speed

## 14. Documentation Requirements

### 14.1 Test Documentation
- Each test file should have a header comment explaining what is being tested
- Complex test scenarios should have inline comments
- Mock setup should be documented
- Test data factories should be documented

### 14.2 Test Reports
- Generate test execution reports
- Include pass/fail counts
- Include coverage metrics
- Include performance metrics for critical paths
