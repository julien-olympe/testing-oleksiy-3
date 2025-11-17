# Unit Test: Create Project (Use Case 7)

## Test Overview

**Test Name:** Create Project Tests  
**Purpose:** Test the functionality to create a new project by selecting a powerplant and assigning it to the authenticated user.

**Component Being Tested:** 
- POST `/api/projects` endpoint
- Project creation service/controller
- Session validation
- Input validation
- Database operations (Prisma)
- Project assignment logic

## Test Setup

### Prerequisites
- Mock Prisma Client configured
- Mock session management configured
- Authentication middleware mocked
- Validation schemas available

### Mocking Strategy

**Database Mocking:**
```typescript
const mockPrisma = {
  project: {
    create: jest.fn(),
  },
  powerplant: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};
```

**Session Mocking:**
```typescript
const mockSession = {
  userId: 'user-uuid',
  authenticated: true,
};
```

### Test Data

**Valid Project Creation Data:**
```typescript
const validProjectData = {
  powerplant_id: 'powerplant-uuid',
};
```

**Mock Powerplant:**
```typescript
const mockPowerplant = {
  id: 'powerplant-uuid',
  name: 'Wind Farm Alpha',
  location: 'Location A',
};
```

**Mock Created Project:**
```typescript
const mockCreatedProject = {
  id: 'project-uuid',
  user_id: 'user-uuid',
  powerplant_id: 'powerplant-uuid',
  status: 'In Progress',
  created_at: new Date(),
  finished_at: null,
  updated_at: new Date(),
};
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Create Project Successfully

**Test Name:** `should create project when valid powerplant ID and authenticated user provided`

**Description:** Verifies that an authenticated user can create a new project.

**Input Data:**
```typescript
{
  powerplant_id: 'powerplant-uuid',
}
```

**Expected Output:**
- HTTP 201 status code
- Project created with:
  - user_id = current user
  - powerplant_id = selected powerplant
  - status = "In Progress"
  - created_at = current timestamp
  - finished_at = NULL
- Response: `{ message: "Project created successfully", project: {...} }`
- Redirect to home screen

**Assertions:**
- `prisma.powerplant.findUnique` called to verify powerplant exists
- `prisma.project.create` called with correct data
- User ID from session used
- Status set to "In Progress"
- Response status is 201
- Response contains project data

**Test Implementation:**
```typescript
describe('Create Project - Happy Path', () => {
  test('should create project when valid powerplant ID and authenticated user provided', async () => {
    const projectData = {
      powerplant_id: 'powerplant-uuid',
    };

    mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
    mockPrisma.project.create.mockResolvedValue(mockCreatedProject);

    const response = await createProject(projectData, mockSession);

    expect(mockPrisma.powerplant.findUnique).toHaveBeenCalledWith({
      where: { id: projectData.powerplant_id },
    });
    expect(mockPrisma.project.create).toHaveBeenCalledWith({
      data: {
        user_id: mockSession.userId,
        powerplant_id: projectData.powerplant_id,
        status: 'In Progress',
        finished_at: null,
      },
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('project');
    expect(response.body.project.status).toBe('In Progress');
  });
});
```

---

### Validation Tests

#### Test Case 2: Missing Powerplant ID

**Test Name:** `should reject project creation when powerplant ID is missing`

**Description:** Verifies that missing powerplant ID is rejected.

**Input Data:**
```typescript
{
  powerplant_id: null,
}
// or
{}
```

**Expected Output:**
- HTTP 400 status code (Bad Request)
- Error message: "Please select a powerplant"
- Project not created

**Assertions:**
- Validation error thrown
- `prisma.project.create` not called
- Response status is 400

**Test Implementation:**
```typescript
describe('Create Project - Validation', () => {
  test('should reject project creation when powerplant ID is missing', async () => {
    const projectData = {};

    const response = await createProject(projectData, mockSession);

    expect(mockPrisma.project.create).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('select a powerplant');
  });
});
```

#### Test Case 3: Invalid Powerplant ID Format

**Test Name:** `should reject project creation when powerplant ID format is invalid`

**Description:** Verifies that invalid UUID formats are rejected.

**Input Data:**
```typescript
{
  powerplant_id: 'invalid-uuid',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Invalid powerplant ID format"
- Project not created

**Assertions:**
- UUID validation fails
- `prisma.project.create` not called
- Response status is 400

---

### Error Condition Tests

#### Test Case 4: Powerplant Not Found

**Test Name:** `should reject project creation when powerplant does not exist`

**Description:** Verifies that non-existent powerplants are rejected.

**Input Data:**
```typescript
{
  powerplant_id: 'non-existent-uuid',
}
```

**Expected Output:**
- HTTP 404 status code (Not Found)
- Error message: "Invalid powerplant ID"
- Project not created

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Powerplant not found
- `prisma.project.create` not called
- Response status is 404

**Test Implementation:**
```typescript
describe('Create Project - Error Conditions', () => {
  test('should reject project creation when powerplant does not exist', async () => {
    const projectData = {
      powerplant_id: 'non-existent-uuid',
    };

    mockPrisma.powerplant.findUnique.mockResolvedValue(null);

    const response = await createProject(projectData, mockSession);

    expect(mockPrisma.powerplant.findUnique).toHaveBeenCalled();
    expect(mockPrisma.project.create).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Invalid powerplant');
  });
});
```

#### Test Case 5: Database Connection Failure

**Test Name:** `should handle database connection failure during project creation`

**Description:** Verifies that database connection errors are handled gracefully.

**Input Data:**
```typescript
{
  powerplant_id: 'powerplant-uuid',
}
```

**Expected Output:**
- HTTP 503 status code (Service Unavailable)
- Error message: "Unable to create project"
- Project not created

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.project.create.mockRejectedValue(
  new Error('Connection failed')
);
```

**Assertions:**
- Database error caught
- Response status is 503
- Generic error message returned

**Test Implementation:**
```typescript
test('should handle database connection failure during project creation', async () => {
  const projectData = {
    powerplant_id: 'powerplant-uuid',
  };

  mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
  mockPrisma.project.create.mockRejectedValue(
    new Error('Connection failed')
  );

  const response = await createProject(projectData, mockSession);

  expect(response.status).toBe(503);
  expect(response.body.message).toContain('Unable to create');
  });
});
```

#### Test Case 6: Database Save Failure

**Test Name:** `should handle database save failure during project creation`

**Description:** Verifies that database save errors are handled gracefully.

**Input Data:**
```typescript
{
  powerplant_id: 'powerplant-uuid',
}
```

**Expected Output:**
- HTTP 500 status code (Internal Server Error)
- Error message: "Unable to create project"
- Project not created

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.project.create.mockRejectedValue(
  new Error('Database constraint violation')
);
```

**Assertions:**
- Database error caught
- Response status is 500
- Generic error message returned

#### Test Case 7: Session Expired

**Test Name:** `should reject project creation when session is expired`

**Description:** Verifies that expired sessions are rejected.

**Input Data:**
```typescript
{
  powerplant_id: 'powerplant-uuid',
}
```

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Session expired"
- Redirect to login screen

**Mock Setup:**
```typescript
const expiredSession = null;
// or
const expiredSession = { userId: null, authenticated: false };
```

**Assertions:**
- Session validation fails
- `prisma.project.create` not called
- Response status is 401

---

### Authentication Tests

#### Test Case 8: Unauthenticated Request

**Test Name:** `should reject project creation when user is not authenticated`

**Description:** Verifies that unauthenticated requests are rejected.

**Input Data:**
```typescript
{
  powerplant_id: 'powerplant-uuid',
}
```

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Authentication required"
- Project not created

**Assertions:**
- Authentication middleware rejects request
- `prisma.project.create` not called
- Response status is 401

**Test Implementation:**
```typescript
describe('Create Project - Authentication', () => {
  test('should reject project creation when user is not authenticated', async () => {
    const projectData = {
      powerplant_id: 'powerplant-uuid',
    };
    const invalidSession = null;

    const response = await createProject(projectData, invalidSession);

    expect(mockPrisma.project.create).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });
});
```

---

### Edge Cases

#### Test Case 9: Project Created with Correct Timestamps

**Test Name:** `should create project with correct timestamps`

**Description:** Verifies that created_at and updated_at are set correctly.

**Input Data:**
```typescript
{
  powerplant_id: 'powerplant-uuid',
}
```

**Expected Output:**
- Project created with current timestamp for created_at
- Project created with current timestamp for updated_at
- finished_at is null

**Assertions:**
- Timestamps are set (not null)
- finished_at is null
- Timestamps are recent (within test execution time)

**Test Implementation:**
```typescript
describe('Create Project - Edge Cases', () => {
  test('should create project with correct timestamps', async () => {
    const projectData = {
      powerplant_id: 'powerplant-uuid',
    };
    const beforeCreation = new Date();

    mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
    mockPrisma.project.create.mockImplementation((args) => {
      const now = new Date();
      return Promise.resolve({
        ...mockCreatedProject,
        created_at: now,
        updated_at: now,
      });
    });

    const response = await createProject(projectData, mockSession);
    const afterCreation = new Date();

    expect(response.body.project.created_at).toBeDefined();
    expect(response.body.project.updated_at).toBeDefined();
    expect(response.body.project.finished_at).toBeNull();
    expect(new Date(response.body.project.created_at).getTime())
      .toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(new Date(response.body.project.created_at).getTime())
      .toBeLessThanOrEqual(afterCreation.getTime());
  });
});
```

#### Test Case 10: Multiple Projects for Same Powerplant

**Test Name:** `should allow creating multiple projects for same powerplant`

**Description:** Verifies that users can create multiple projects for the same powerplant.

**Input Data:**
```typescript
{
  powerplant_id: 'powerplant-uuid',
}
```

**Expected Output:**
- Multiple projects can be created
- Each project has unique ID
- All projects assigned to same user

**Assertions:**
- No uniqueness constraint violation
- Each project has unique ID
- All projects have same powerplant_id

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear all Prisma mock calls
- Reset session state

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  mockPrisma.project.create.mockReset();
  mockPrisma.powerplant.findUnique.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- create-project.test.ts
```

### Expected Results
- All happy path tests pass
- All validation tests pass
- All error condition tests pass
- All authentication tests pass
- All edge case tests pass
- Test execution time < 2 seconds for full suite

## Coverage Goals

### Coverage Targets
- Project creation endpoint handler: 100% line coverage
- Input validation: 100% validation rule coverage
- Database operations: 100% coverage
- Error handling: 100% error path coverage
- Authentication checks: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: POST `/api/projects`

**Test Coverage:**
- ✅ Create project successfully (201)
- ✅ Missing powerplant ID (400)
- ✅ Invalid powerplant ID format (400)
- ✅ Powerplant not found (404)
- ✅ Database errors (503/500)
- ✅ Session expired (401)
- ✅ Unauthenticated request (401)
- ✅ Timestamp validation

## Notes

- Project is automatically assigned to the user who creates it (user_id from session)
- Project status is set to "In Progress" by default
- finished_at is set to NULL on creation
- Powerplant must exist before project can be created
- Response time must be < 500ms (performance requirement)
- All database errors return generic messages to users
- Project creation triggers redirect to home screen where new project appears in list
