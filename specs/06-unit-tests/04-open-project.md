# Unit Test: Open Project (Use Case 4)

## Test Overview

**Test Name:** Open Project Tests  
**Purpose:** Test the functionality to open and display project details including powerplant data, parts, checkups, statuses, and documentation.

**Component Being Tested:** 
- GET `/api/projects/:id` endpoint
- Project details service/controller
- Session validation
- Authorization checks (user access)
- Database queries (Prisma)
- Data aggregation and formatting

## Test Setup

### Prerequisites
- Mock Prisma Client configured
- Mock session management configured
- Authentication middleware mocked

### Mocking Strategy

**Database Mocking:**
```typescript
const mockPrisma = {
  project: {
    findUnique: jest.fn(),
  },
  powerplant: {
    findUnique: jest.fn(),
  },
  part: {
    findMany: jest.fn(),
  },
  checkup: {
    findMany: jest.fn(),
  },
  checkupStatus: {
    findMany: jest.fn(),
  },
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

**Mock Project:**
```typescript
const mockProject = {
  id: 'project-uuid',
  user_id: 'user-uuid',
  powerplant_id: 'powerplant-uuid',
  status: 'In Progress',
  created_at: new Date(),
  finished_at: null,
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

**Mock Parts:**
```typescript
const mockParts = [
  {
    id: 'part-1-uuid',
    powerplant_id: 'powerplant-uuid',
    name: 'Rotor Blades',
    description: 'Main rotor blade assembly',
    display_order: 0,
  },
  {
    id: 'part-2-uuid',
    powerplant_id: 'powerplant-uuid',
    name: 'Gearbox',
    description: 'Main gearbox unit',
    display_order: 1,
  },
];
```

**Mock Checkups:**
```typescript
const mockCheckups = [
  {
    id: 'checkup-1-uuid',
    part_id: 'part-1-uuid',
    name: 'Blade Condition',
    description: 'Check blade surface for damage',
    display_order: 0,
    documentation_images: [Buffer.from('image1')],
    documentation_text: 'Reference documentation',
  },
];
```

**Mock Checkup Statuses:**
```typescript
const mockCheckupStatuses = [
  {
    id: 'status-1-uuid',
    project_id: 'project-uuid',
    checkup_id: 'checkup-1-uuid',
    status_value: 'good',
  },
];
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Open Project Successfully

**Test Name:** `should return project details when valid project ID and user access provided`

**Description:** Verifies that an authenticated user can open their own project and retrieve all related data.

**Input Data:**
- Valid session with user ID
- Valid project ID
- Project belongs to user

**Expected Output:**
- HTTP 200 status code
- Response body includes:
  - Project data
  - Powerplant name
  - Parts list with checkups
  - Checkup statuses
  - Documentation references

**Assertions:**
- `prisma.project.findUnique` called with project ID
- User access verified (user_id matches)
- Powerplant data retrieved
- Parts retrieved for powerplant
- Checkups retrieved for parts
- Checkup statuses retrieved for project
- Response status is 200
- Response contains all required data

**Test Implementation:**
```typescript
describe('Open Project - Happy Path', () => {
  test('should return project details when valid project ID and user access provided', async () => {
    const projectId = 'project-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockParts);
    mockPrisma.checkup.findMany.mockResolvedValue(mockCheckups);
    mockPrisma.checkupStatus.findMany.mockResolvedValue(mockCheckupStatuses);

    const response = await getProjectDetails(projectId, mockSession);

    expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: projectId },
    });
    expect(mockPrisma.powerplant.findUnique).toHaveBeenCalledWith({
      where: { id: mockProject.powerplant_id },
    });
    expect(mockPrisma.part.findMany).toHaveBeenCalledWith({
      where: { powerplant_id: mockProject.powerplant_id },
      orderBy: { display_order: 'asc' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('project');
    expect(response.body).toHaveProperty('powerplant');
    expect(response.body).toHaveProperty('parts');
    expect(response.body).toHaveProperty('checkupStatuses');
  });
});
```

---

### Authentication Tests

#### Test Case 2: Unauthenticated Request

**Test Name:** `should reject request when user is not authenticated`

**Description:** Verifies that unauthenticated requests are rejected.

**Input Data:**
- No session or invalid session
- Valid project ID

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Authentication required"
- Redirect to login screen

**Assertions:**
- Authentication middleware rejects request
- `prisma.project.findUnique` not called
- Response status is 401

**Test Implementation:**
```typescript
describe('Open Project - Authentication', () => {
  test('should reject request when user is not authenticated', async () => {
    const projectId = 'project-uuid';
    const invalidSession = null;

    const response = await getProjectDetails(projectId, invalidSession);

    expect(mockPrisma.project.findUnique).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });
});
```

#### Test Case 3: Expired Session

**Test Name:** `should reject request when session is expired`

**Description:** Verifies that expired sessions are rejected.

**Input Data:**
- Expired session token
- Valid project ID

**Expected Output:**
- HTTP 401 status code
- Error message: "Session expired"
- Redirect to login screen

**Assertions:**
- Session validation fails
- Response status is 401

---

### Authorization Tests

#### Test Case 4: Access Denied - Project Belongs to Another User

**Test Name:** `should reject request when project belongs to another user`

**Description:** Verifies that users cannot access projects assigned to other users.

**Input Data:**
- Valid session with user ID
- Valid project ID
- Project belongs to different user

**Expected Output:**
- HTTP 403 status code (Forbidden)
- Error message: "Access denied"
- Redirect to home screen

**Mock Setup:**
```typescript
const otherUserProject = {
  ...mockProject,
  user_id: 'other-user-uuid',
};
mockPrisma.project.findUnique.mockResolvedValue(otherUserProject);
```

**Assertions:**
- Project found but user_id doesn't match
- Access denied
- `prisma.powerplant.findUnique` not called
- Response status is 403

**Test Implementation:**
```typescript
describe('Open Project - Authorization', () => {
  test('should reject request when project belongs to another user', async () => {
    const projectId = 'project-uuid';
    const otherUserProject = {
      ...mockProject,
      user_id: 'other-user-uuid',
    };

    mockPrisma.project.findUnique.mockResolvedValue(otherUserProject);

    const response = await getProjectDetails(projectId, mockSession);

    expect(mockPrisma.project.findUnique).toHaveBeenCalled();
    expect(mockPrisma.powerplant.findUnique).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Access denied');
  });
});
```

---

### Error Condition Tests

#### Test Case 5: Project Not Found

**Test Name:** `should return error when project does not exist`

**Description:** Verifies that non-existent projects return appropriate error.

**Input Data:**
- Valid session
- Invalid or non-existent project ID

**Expected Output:**
- HTTP 404 status code (Not Found)
- Error message: "Project not found"
- Redirect to home screen

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Project not found
- Response status is 404

**Test Implementation:**
```typescript
describe('Open Project - Error Conditions', () => {
  test('should return error when project does not exist', async () => {
    const projectId = 'non-existent-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(null);

    const response = await getProjectDetails(projectId, mockSession);

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('not found');
  });
});
```

#### Test Case 6: Database Connection Failure

**Test Name:** `should handle database connection failure`

**Description:** Verifies that database connection errors are handled gracefully.

**Input Data:**
- Valid session
- Valid project ID

**Expected Output:**
- HTTP 503 status code (Service Unavailable)
- Error message: "Database temporarily unavailable"
- Redirect to home screen

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockRejectedValue(
  new Error('Connection failed')
);
```

**Assertions:**
- Database error caught
- Response status is 503

#### Test Case 7: Powerplant Data Missing

**Test Name:** `should handle missing powerplant data gracefully`

**Description:** Verifies that missing powerplant references are handled.

**Input Data:**
- Valid session
- Valid project ID
- Powerplant not found (data integrity issue)

**Expected Output:**
- HTTP 500 status code or 404
- Error message: "Missing powerplant data"
- Redirect to home screen

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProject);
mockPrisma.powerplant.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Powerplant not found
- Error handled gracefully
- Response status is 500 or 404

#### Test Case 8: Parts Query Failure

**Test Name:** `should handle parts query failure gracefully`

**Description:** Verifies that parts query errors are handled.

**Input Data:**
- Valid session
- Valid project ID
- Parts query fails

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to load parts"
- Partial data returned or error

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProject);
mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.part.findMany.mockRejectedValue(new Error('Query failed'));
```

**Assertions:**
- Query error caught
- Response status is 500

---

### Edge Cases

#### Test Case 9: Project with No Parts

**Test Name:** `should handle project with no parts`

**Description:** Verifies that projects with no parts are handled gracefully.

**Input Data:**
- Valid session
- Valid project ID
- Powerplant has no parts

**Expected Output:**
- HTTP 200 status code
- Empty parts array
- Project data still returned

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProject);
mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.part.findMany.mockResolvedValue([]);
mockPrisma.checkup.findMany.mockResolvedValue([]);
mockPrisma.checkupStatus.findMany.mockResolvedValue([]);
```

**Assertions:**
- Empty parts array returned
- Response status is 200
- No errors thrown

**Test Implementation:**
```typescript
describe('Open Project - Edge Cases', () => {
  test('should handle project with no parts', async () => {
    const projectId = 'project-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
    mockPrisma.part.findMany.mockResolvedValue([]);
    mockPrisma.checkup.findMany.mockResolvedValue([]);
    mockPrisma.checkupStatus.findMany.mockResolvedValue([]);

    const response = await getProjectDetails(projectId, mockSession);

    expect(response.status).toBe(200);
    expect(response.body.parts).toEqual([]);
  });
});
```

#### Test Case 10: Project with No Checkup Statuses

**Test Name:** `should handle project with no checkup statuses`

**Description:** Verifies that projects with no statuses set are handled.

**Input Data:**
- Valid session
- Valid project ID
- No checkup statuses set

**Expected Output:**
- HTTP 200 status code
- Empty checkup statuses array
- Checkups still returned

**Mock Setup:**
```typescript
mockPrisma.checkupStatus.findMany.mockResolvedValue([]);
```

**Assertions:**
- Empty statuses array returned
- Checkups still included
- Response status is 200

#### Test Case 11: Large Project with Many Checkups

**Test Name:** `should handle project with many checkups (up to 100)`

**Description:** Verifies that large projects with many checkups are handled efficiently.

**Input Data:**
- Valid session
- Valid project ID
- Project with 100 checkups

**Expected Output:**
- HTTP 200 status code
- All checkups returned
- Response time < 1 second (performance requirement)

**Mock Setup:**
```typescript
const manyCheckups = Array.from({ length: 100 }, (_, i) => ({
  id: `checkup-${i}-uuid`,
  part_id: 'part-1-uuid',
  name: `Checkup ${i}`,
  description: `Description ${i}`,
  display_order: i,
  documentation_images: [],
  documentation_text: null,
}));
mockPrisma.checkup.findMany.mockResolvedValue(manyCheckups);
```

**Assertions:**
- All checkups returned
- Response time meets performance requirement
- Response status is 200

#### Test Case 12: Invalid Project ID Format

**Test Name:** `should reject invalid project ID format`

**Description:** Verifies that invalid UUID formats are rejected.

**Input Data:**
- Valid session
- Invalid project ID (not UUID format)

**Expected Output:**
- HTTP 400 status code (Bad Request)
- Error message: "Invalid project ID format"

**Assertions:**
- UUID validation fails
- Response status is 400
- Database query not executed

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
  mockPrisma.project.findUnique.mockReset();
  mockPrisma.powerplant.findUnique.mockReset();
  mockPrisma.part.findMany.mockReset();
  mockPrisma.checkup.findMany.mockReset();
  mockPrisma.checkupStatus.findMany.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- open-project.test.ts
```

### Expected Results
- All happy path tests pass
- All authentication tests pass
- All authorization tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 3 seconds for full suite

## Coverage Goals

### Coverage Targets
- Project details endpoint handler: 100% line coverage
- Authorization checks: 100% coverage
- Database queries: 100% coverage
- Error handling: 100% error path coverage
- Data aggregation: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: GET `/api/projects/:id`

**Test Coverage:**
- ✅ Open project successfully (200)
- ✅ Unauthenticated request (401)
- ✅ Expired session (401)
- ✅ Access denied (403)
- ✅ Project not found (404)
- ✅ Database errors (503/500)
- ✅ Missing data (500)
- ✅ Empty data (200)
- ✅ Large dataset (performance)

## Notes

- User access is verified by comparing project.user_id with session.userId
- All related data (powerplant, parts, checkups, statuses) is retrieved in separate queries
- Response time must be < 1 second for projects with up to 100 checkups (performance requirement)
- Empty parts/checkups/statuses are valid responses (not errors)
- Invalid UUID formats are validated before database queries
- All database errors return generic messages to users
