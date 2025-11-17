# Unit Test: Error Conditions

## Test Overview

**Test Name:** Error Conditions Tests  
**Purpose:** Test comprehensive error handling for all abnormal situations, critical failures, and exception scenarios as specified in the reliability and fault tolerance requirements.

**Component Being Tested:** 
- Database connection failures
- Invalid user input validation
- Authentication failures
- Authorization failures
- Project access violations
- PDF generation failures
- Image loading failures
- Network timeouts
- All error handling paths

## Test Setup

### Prerequisites
- Mock Prisma Client configured
- Mock external services configured
- Error simulation utilities available

### Mocking Strategy

**Database Mocking:**
```typescript
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};
```

**Error Simulation:**
```typescript
const simulateDatabaseError = (errorType: string) => {
  switch (errorType) {
    case 'connection':
      return new Error('Connection failed');
    case 'timeout':
      return new Error('Query timeout');
    case 'constraint':
      return new Error('Unique constraint violation');
    default:
      return new Error('Database error');
  }
};
```

## Test Cases

### Database Connection Failures

#### Test Case 1: Database Connection Lost During Query

**Test Name:** `should handle database connection failure with retry mechanism`

**Description:** Verifies that database connection failures trigger retry with exponential backoff.

**Input Data:**
- Valid request
- Database connection lost

**Expected Output:**
- HTTP 503 status code (Service Unavailable)
- Error message: "Database temporarily unavailable. Please try again in a few moments."
- Retry mechanism: 3 attempts with delays (1s, 2s, 4s)
- Error logged with timestamp

**Mock Setup:**
```typescript
let attemptCount = 0;
mockPrisma.user.findUnique.mockImplementation(() => {
  attemptCount++;
  if (attemptCount < 3) {
    return Promise.reject(new Error('Connection failed'));
  }
  return Promise.resolve(mockUser);
});
```

**Assertions:**
- Retry mechanism activated
- Exponential backoff applied
- Error logged
- Response status is 503

**Test Implementation:**
```typescript
describe('Error Conditions - Database Connection Failures', () => {
  test('should handle database connection failure with retry mechanism', async () => {
    let attemptCount = 0;
    mockPrisma.user.findUnique.mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Connection failed'));
      }
      return Promise.resolve(mockUser);
    });

    const response = await loginUser(credentials, mockSession);

    expect(attemptCount).toBe(3);
    expect(response.status).toBe(503);
    expect(response.body.message).toContain('temporarily unavailable');
  });
});
```

#### Test Case 2: Database Connection Timeout

**Test Name:** `should handle database connection timeout`

**Description:** Verifies that database connection timeouts are handled.

**Input Data:**
- Valid request
- Database connection timeout (30 seconds)

**Expected Output:**
- HTTP 503 status code
- Error message: "Database temporarily unavailable"
- Timeout logged

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockImplementation(() => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Connection timeout')), 30000);
  });
});
```

**Assertions:**
- Timeout detected
- Response status is 503
- Error logged

---

### Invalid User Input Validation

#### Test Case 3: Malformed Email

**Test Name:** `should reject malformed email addresses`

**Description:** Verifies that invalid email formats are rejected with specific error messages.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'invalid-email',
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 400 status code (Bad Request)
- Error message: "Invalid email format"
- Validation error returned inline
- User not created

**Assertions:**
- Zod validation fails
- Specific error message returned
- Response status is 400

**Test Implementation:**
```typescript
describe('Error Conditions - Invalid User Input', () => {
  test('should reject malformed email addresses', async () => {
    const userData = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
      passwordConfirmation: 'password123',
    };

    const response = await registerUser(userData);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid email format');
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});
```

#### Test Case 4: Short Password

**Test Name:** `should reject passwords shorter than minimum length`

**Description:** Verifies that short passwords are rejected.

**Input Data:**
```typescript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'short',
  passwordConfirmation: 'short',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Password too short"
- Validation error returned inline
- User not created

**Assertions:**
- Validation fails
- Response status is 400

#### Test Case 5: Missing Required Fields

**Test Name:** `should reject requests with missing required fields`

**Description:** Verifies that missing required fields are rejected.

**Input Data:**
```typescript
{
  username: 'testuser',
  // email missing
  password: 'password123',
  passwordConfirmation: 'password123',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message listing missing fields
- User not created

**Assertions:**
- Validation fails
- Missing fields identified
- Response status is 400

---

### Authentication Failures

#### Test Case 6: Invalid Credentials

**Test Name:** `should reject login with invalid credentials`

**Description:** Verifies that invalid credentials are rejected with generic error message.

**Input Data:**
```typescript
{
  usernameOrEmail: 'testuser',
  password: 'wrongpassword',
}
```

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Invalid credentials" (generic, not specific)
- Security log entry created with IP address and timestamp
- Rate limiting counter incremented

**Mock Setup:**
```typescript
mockPrisma.user.findUnique.mockResolvedValue(mockUser);
mockBcrypt.compare.mockResolvedValue(false);
```

**Assertions:**
- Generic error message (security best practice)
- Security log entry created
- Rate limiting applied
- Response status is 401

**Test Implementation:**
```typescript
describe('Error Conditions - Authentication Failures', () => {
  test('should reject login with invalid credentials', async () => {
    const credentials = {
      usernameOrEmail: 'testuser',
      password: 'wrongpassword',
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(false);

    const response = await loginUser(credentials, mockSession, '192.168.1.1');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
    // Verify security log entry
    expect(securityLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'AUTH_FAILURE',
        ip: '192.168.1.1',
      })
    );
  });
});
```

#### Test Case 7: Expired Session

**Test Name:** `should reject requests with expired session`

**Description:** Verifies that expired sessions are rejected.

**Input Data:**
- Expired session token
- Valid request

**Expected Output:**
- HTTP 401 status code
- Error message: "Session expired"
- Redirect to login screen

**Assertions:**
- Session validation fails
- Response status is 401

#### Test Case 8: Rate Limiting - Too Many Login Attempts

**Test Name:** `should enforce rate limiting on login attempts`

**Description:** Verifies that rate limiting prevents brute force attacks.

**Input Data:**
- 6 failed login attempts from same IP in 15 minutes

**Expected Output:**
- After 5 attempts: HTTP 429 status code (Too Many Requests)
- Error message: "Too many login attempts. Please try again later."
- Further attempts blocked

**Assertions:**
- Rate limit enforced
- Response status is 429
- Security alert triggered

---

### Authorization Failures

#### Test Case 9: Access Denied - Project Belongs to Another User

**Test Name:** `should reject access to project assigned to another user`

**Description:** Verifies that users cannot access projects assigned to other users.

**Input Data:**
- Valid session
- Valid project ID
- Project belongs to different user

**Expected Output:**
- HTTP 403 status code (Forbidden)
- Error message: "Access denied"
- Redirect to home screen
- Access violation logged with user ID, project ID, and timestamp

**Mock Setup:**
```typescript
const otherUserProject = {
  ...mockProject,
  user_id: 'other-user-uuid',
};
mockPrisma.project.findUnique.mockResolvedValue(otherUserProject);
```

**Assertions:**
- Access denied
- Security log entry created
- Response status is 403

**Test Implementation:**
```typescript
describe('Error Conditions - Authorization Failures', () => {
  test('should reject access to project assigned to another user', async () => {
    const projectId = 'project-uuid';
    const otherUserProject = {
      ...mockProject,
      user_id: 'other-user-uuid',
    };

    mockPrisma.project.findUnique.mockResolvedValue(otherUserProject);

    const response = await getProjectDetails(projectId, mockSession);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Access denied');
    expect(securityLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ACCESS_VIOLATION',
        userId: mockSession.userId,
        projectId: projectId,
      })
    );
  });
});
```

#### Test Case 10: Unauthorized Endpoint Access

**Test Name:** `should reject unauthenticated access to protected endpoints`

**Description:** Verifies that protected endpoints require authentication.

**Input Data:**
- No session
- Protected endpoint request

**Expected Output:**
- HTTP 401 status code
- Error message: "Authentication required"
- Redirect to login screen

**Assertions:**
- Authentication middleware rejects
- Response status is 401

---

### Project Access Violations

#### Test Case 11: Attempt to Update Other User's Project

**Test Name:** `should reject status update on project assigned to another user`

**Description:** Verifies that users cannot update statuses in other users' projects.

**Input Data:**
- Valid session
- Valid project ID
- Project belongs to different user
- Status update request

**Expected Output:**
- HTTP 403 status code
- Error message: "Access denied"
- Status not updated
- Access violation logged

**Assertions:**
- Access denied
- Status not updated
- Response status is 403

---

### PDF Generation Failures

#### Test Case 12: PDF Generation Memory Error

**Test Name:** `should handle PDF generation memory errors`

**Description:** Verifies that PDF generation memory errors are handled.

**Input Data:**
- Valid session
- Valid project ID
- PDF generation runs out of memory

**Expected Output:**
- HTTP 500 status code (Internal Server Error)
- Error message: "Unable to generate report. Please try again or contact support."
- Project NOT marked as Finished
- Error logged with project ID and stack trace

**Mock Setup:**
```typescript
mockPDFDocument.end.mockImplementation(() => {
  throw new Error('Out of memory');
});
```

**Assertions:**
- Memory error caught
- Project status not updated
- Error logged
- Response status is 500

**Test Implementation:**
```typescript
describe('Error Conditions - PDF Generation Failures', () => {
  test('should handle PDF generation memory errors', async () => {
    const projectId = 'project-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
    mockPrisma.checkup.findMany.mockResolvedValue(mockProjectData.parts[0].checkups);
    mockPrisma.checkupStatus.findMany.mockResolvedValue(mockProjectData.checkupStatuses);
    mockPDFDocument.end.mockImplementation(() => {
      throw new Error('Out of memory');
    });

    const response = await finishProject(projectId, mockSession);

    expect(mockPrisma.project.update).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Unable to generate report');
    expect(errorLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'ERROR',
        projectId: projectId,
        error: expect.any(Error),
      })
    );
  });
});
```

#### Test Case 13: PDF Generation Library Error

**Test Name:** `should handle PDF generation library errors`

**Description:** Verifies that PDFKit library errors are handled.

**Input Data:**
- Valid session
- Valid project ID
- PDFKit throws error

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to generate report"
- Project NOT marked as Finished
- Error logged

**Mock Setup:**
```typescript
mockPDFDocument.text.mockImplementation(() => {
  throw new Error('PDFKit error');
});
```

**Assertions:**
- Library error caught
- Project status not updated
- Response status is 500

---

### Image Loading Failures

#### Test Case 14: Corrupted Image Data

**Test Name:** `should handle corrupted image data gracefully`

**Description:** Verifies that corrupted image data is handled without crashing.

**Input Data:**
- Valid session
- Valid checkup ID
- Image data is corrupted

**Expected Output:**
- HTTP 200 status code (graceful degradation)
- Placeholder image or error icon displayed
- Available images still shown
- Error logged with checkup ID

**Mock Setup:**
```typescript
const checkupWithCorruptedImage = {
  ...mockCheckupWithDocs,
  documentation_images: [Buffer.from('corrupted-data')],
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithCorruptedImage);
```

**Assertions:**
- Image decode error caught
- Placeholder shown
- Other images still displayed
- Error logged

**Test Implementation:**
```typescript
describe('Error Conditions - Image Loading Failures', () => {
  test('should handle corrupted image data gracefully', async () => {
    const checkupId = 'checkup-uuid';
    const checkupWithCorruptedImage = {
      ...mockCheckupWithDocs,
      documentation_images: [Buffer.from('corrupted-data')],
    };

    mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithCorruptedImage);
    // Mock image processing to throw error
    jest.spyOn(global, 'Buffer').mockImplementation(() => {
      throw new Error('Image decode failed');
    });

    const response = await getCheckupDocumentation(checkupId, mockSession);

    expect(response.status).toBe(200);
    // Should handle error gracefully
    expect(errorLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'WARN',
        checkupId: checkupId,
        error: expect.any(Error),
      })
    );
  });
});
```

#### Test Case 15: Missing Image Data

**Test Name:** `should handle missing image data gracefully`

**Description:** Verifies that missing image data is handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Image data is null or empty

**Expected Output:**
- HTTP 200 status code
- Placeholder or "Image unavailable" message
- Other documentation still shown

**Assertions:**
- Missing image handled
- Graceful degradation
- Response status is 200

---

### Network Timeouts

#### Test Case 16: API Request Timeout

**Test Name:** `should handle API request timeout`

**Description:** Verifies that request timeouts (30 seconds) are handled.

**Input Data:**
- Valid request
- Request exceeds 30-second timeout

**Expected Output:**
- HTTP 504 status code (Gateway Timeout)
- Error message: "Request timed out. Please check your connection and try again."
- Timeout logged with endpoint, duration, and user ID

**Mock Setup:**
```typescript
mockPrisma.project.findMany.mockImplementation(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProjects), 35000); // Exceeds timeout
  });
});
```

**Assertions:**
- Timeout detected
- Response status is 504
- Error logged

**Test Implementation:**
```typescript
describe('Error Conditions - Network Timeouts', () => {
  test('should handle API request timeout', async () => {
    jest.useFakeTimers();
    
    mockPrisma.project.findMany.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockProjects), 35000);
      });
    });

    const requestPromise = getProjects(mockSession);
    
    jest.advanceTimersByTime(30000); // Trigger timeout
    
    const response = await requestPromise;

    expect(response.status).toBe(504);
    expect(response.body.message).toContain('timed out');
    expect(errorLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'ERROR',
        type: 'TIMEOUT',
        duration: expect.any(Number),
      })
    );
    
    jest.useRealTimers();
  });
});
```

#### Test Case 17: Client-Side Network Error

**Test Name:** `should handle client-side network errors`

**Description:** Verifies that client-side network errors are handled (retry mechanism).

**Input Data:**
- Valid request
- Network connection lost

**Expected Output:**
- Client automatically retries once after 2-second delay
- If retry fails: Error message displayed to user

**Assertions:**
- Retry mechanism activated
- User notified of failure

---

### Critical Situations

#### Test Case 18: Database Corruption

**Test Name:** `should handle database corruption detection`

**Description:** Verifies that database integrity violations are detected.

**Input Data:**
- Valid request
- Database integrity constraint violation

**Expected Output:**
- HTTP 500 status code
- Error message: "System error. Please contact administrator."
- Data modification prevented
- Corruption logged

**Mock Setup:**
```typescript
mockPrisma.user.create.mockRejectedValue(
  new Error('Integrity constraint violation')
);
```

**Assertions:**
- Integrity violation detected
- Data modification prevented
- Error logged
- Response status is 500

#### Test Case 19: Server Crash Simulation

**Test Name:** `should handle server process termination gracefully`

**Description:** Verifies that server crashes are handled (process manager restart).

**Input Data:**
- Server process terminates

**Expected Output:**
- Process manager (PM2/systemd) restarts application
- Users see connection error
- Users can retry after restart (10-30 seconds)
- No data loss (data persisted in database)

**Assertions:**
- Process restart mechanism works
- Data persisted
- Users can reconnect

#### Test Case 20: Memory Exhaustion

**Test Name:** `should handle memory exhaustion`

**Description:** Verifies that memory limits are enforced.

**Input Data:**
- Valid request
- Memory usage exceeds limit

**Expected Output:**
- Memory limit enforced (2 GB per process)
- Process terminates if limit exceeded
- Process manager restarts
- Error logged

**Assertions:**
- Memory limits enforced
- Process restart works
- Error logged

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear all Prisma mock calls
- Reset error simulators
- Clear log mocks

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  // Reset all mocks
});
```

## Test Execution

### Running the Test
```bash
npm test -- error-conditions.test.ts
```

### Expected Results
- All database error tests pass
- All input validation tests pass
- All authentication error tests pass
- All authorization error tests pass
- All PDF generation error tests pass
- All image loading error tests pass
- All timeout tests pass
- All critical situation tests pass
- Test execution time < 10 seconds for full suite

## Coverage Goals

### Coverage Targets
- Database error handling: 100% coverage
- Input validation errors: 100% coverage
- Authentication errors: 100% coverage
- Authorization errors: 100% coverage
- PDF generation errors: 100% coverage
- Image loading errors: 100% coverage
- Network timeout handling: 100% coverage
- Critical situation handling: 100% coverage

### Coverage Exclusions
- None (all error paths should be tested)

## Notes

- All errors must be caught and handled at appropriate levels
- Never expose internal error details to users (stack traces, database errors, file paths)
- Generic user-facing messages with error codes for support reference
- Detailed error information logged server-side with context
- HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error), 503 (Service Unavailable), 504 (Gateway Timeout)
- Error response format: JSON with error code, user message, and timestamp
- All errors logged with timestamp, level, message, context (user ID, request ID, stack trace)
- Retry mechanisms: Automatic retry with exponential backoff for database errors
- Graceful degradation: Non-critical features fail silently, critical features show errors
- Health checks: GET /health endpoint returns 200 OK if application and database are healthy
- Reference: specs/03-technical-specifications/04-development-constraints-01-reliability-fault-tolerance.md
