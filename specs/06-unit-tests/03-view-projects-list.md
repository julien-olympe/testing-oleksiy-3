# Unit Test: View Projects List (Use Case 3)

## Test Overview

**Test Name:** View Projects List Tests  
**Purpose:** Test the functionality to retrieve and display a list of projects assigned to the authenticated user.

**Component Being Tested:** 
- GET `/api/projects` endpoint
- Project list service/controller
- Session validation
- Database queries (Prisma)
- Project data formatting

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

**Mock Projects:**
```typescript
const mockProjects = [
  {
    id: 'project-1-uuid',
    user_id: 'user-uuid',
    powerplant_id: 'powerplant-1-uuid',
    status: 'In Progress',
    created_at: new Date('2024-01-01'),
    finished_at: null,
    powerplant: {
      name: 'Wind Farm Alpha',
    },
  },
  {
    id: 'project-2-uuid',
    user_id: 'user-uuid',
    powerplant_id: 'powerplant-2-uuid',
    status: 'Finished',
    created_at: new Date('2024-01-02'),
    finished_at: new Date('2024-01-10'),
    powerplant: {
      name: 'Wind Farm Beta',
    },
  },
];
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Retrieve User's Projects

**Test Name:** `should return list of projects for authenticated user`

**Description:** Verifies that an authenticated user can retrieve their projects list.

**Input Data:**
- Valid session with user ID

**Expected Output:**
- HTTP 200 status code
- Response body: `{ projects: [...] }`
- Projects ordered by created_at (newest first)
- Each project includes powerplant name and status

**Assertions:**
- `prisma.project.findMany` called with user_id filter
- Projects ordered by created_at DESC
- Response status is 200
- Response contains projects array
- Projects include powerplant name

**Test Implementation:**
```typescript
describe('View Projects List - Happy Path', () => {
  test('should return list of projects for authenticated user', async () => {
    mockPrisma.project.findMany.mockResolvedValue(mockProjects);

    const response = await getProjects(mockSession);

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
      where: { user_id: mockSession.userId },
      orderBy: { created_at: 'desc' },
      include: {
        powerplant: {
          select: { name: true },
        },
      },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('projects');
    expect(response.body.projects).toHaveLength(2);
    expect(response.body.projects[0]).toHaveProperty('powerplant');
  });
});
```

#### Test Case 2: Empty Projects List

**Test Name:** `should return empty list when user has no projects`

**Description:** Verifies that users with no projects receive an empty array.

**Input Data:**
- Valid session with user ID
- User has no projects

**Expected Output:**
- HTTP 200 status code
- Response body: `{ projects: [] }`

**Mock Setup:**
```typescript
mockPrisma.project.findMany.mockResolvedValue([]);
```

**Assertions:**
- `prisma.project.findMany` called
- Empty array returned
- Response status is 200

**Test Implementation:**
```typescript
test('should return empty list when user has no projects', async () => {
  mockPrisma.project.findMany.mockResolvedValue([]);

  const response = await getProjects(mockSession);

  expect(response.status).toBe(200);
  expect(response.body.projects).toEqual([]);
});
```

---

### Authentication Tests

#### Test Case 3: Unauthenticated Request

**Test Name:** `should reject request when user is not authenticated`

**Description:** Verifies that unauthenticated requests are rejected.

**Input Data:**
- No session or invalid session

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Authentication required"
- Redirect to login screen

**Mock Setup:**
```typescript
const mockSession = null;
// or
const mockSession = { userId: null, authenticated: false };
```

**Assertions:**
- Authentication middleware rejects request
- `prisma.project.findMany` not called
- Response status is 401

**Test Implementation:**
```typescript
describe('View Projects List - Authentication', () => {
  test('should reject request when user is not authenticated', async () => {
    const invalidSession = null;

    const response = await getProjects(invalidSession);

    expect(mockPrisma.project.findMany).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Authentication');
  });
});
```

#### Test Case 4: Expired Session

**Test Name:** `should reject request when session is expired`

**Description:** Verifies that expired sessions are rejected.

**Input Data:**
- Expired session token

**Expected Output:**
- HTTP 401 status code
- Error message: "Session expired"
- Redirect to login screen

**Assertions:**
- Session validation fails
- Response status is 401

---

### Error Condition Tests

#### Test Case 5: Database Connection Failure

**Test Name:** `should handle database connection failure`

**Description:** Verifies that database connection errors are handled gracefully.

**Input Data:**
- Valid session

**Expected Output:**
- HTTP 503 status code (Service Unavailable)
- Error message: "Unable to load projects"
- Empty list or error response

**Mock Setup:**
```typescript
mockPrisma.project.findMany.mockRejectedValue(
  new Error('Connection failed')
);
```

**Assertions:**
- Database error caught
- Response status is 503
- Generic error message returned

**Test Implementation:**
```typescript
describe('View Projects List - Error Conditions', () => {
  test('should handle database connection failure', async () => {
    mockPrisma.project.findMany.mockRejectedValue(
      new Error('Connection failed')
    );

    const response = await getProjects(mockSession);

    expect(response.status).toBe(503);
    expect(response.body.message).toContain('Unable to load');
  });
});
```

#### Test Case 6: Database Query Failure

**Test Name:** `should handle database query failure`

**Description:** Verifies that database query errors are handled gracefully.

**Input Data:**
- Valid session

**Expected Output:**
- HTTP 500 status code
- Error message: "An error occurred. Please try again."

**Mock Setup:**
```typescript
mockPrisma.project.findMany.mockRejectedValue(
  new Error('Query execution failed')
);
```

**Assertions:**
- Query error caught
- Response status is 500
- Error logged

---

### Edge Cases

#### Test Case 7: Large Number of Projects

**Test Name:** `should handle large number of projects (up to 100)`

**Description:** Verifies that the system can handle the maximum expected number of projects per user.

**Input Data:**
- Valid session
- User has 100 projects

**Expected Output:**
- HTTP 200 status code
- All 100 projects returned
- Response time < 500ms (performance requirement)

**Mock Setup:**
```typescript
const manyProjects = Array.from({ length: 100 }, (_, i) => ({
  id: `project-${i}-uuid`,
  user_id: 'user-uuid',
  powerplant_id: `powerplant-${i}-uuid`,
  status: i % 2 === 0 ? 'In Progress' : 'Finished',
  created_at: new Date(),
  finished_at: i % 2 === 0 ? null : new Date(),
  powerplant: { name: `Wind Farm ${i}` },
}));
mockPrisma.project.findMany.mockResolvedValue(manyProjects);
```

**Assertions:**
- All projects returned
- Response time meets performance requirement
- Response status is 200

**Test Implementation:**
```typescript
describe('View Projects List - Edge Cases', () => {
  test('should handle large number of projects (up to 100)', async () => {
    const manyProjects = Array.from({ length: 100 }, (_, i) => ({
      id: `project-${i}-uuid`,
      user_id: 'user-uuid',
      powerplant_id: `powerplant-${i}-uuid`,
      status: i % 2 === 0 ? 'In Progress' : 'Finished',
      created_at: new Date(),
      finished_at: i % 2 === 0 ? null : new Date(),
      powerplant: { name: `Wind Farm ${i}` },
    }));

    mockPrisma.project.findMany.mockResolvedValue(manyProjects);

    const startTime = Date.now();
    const response = await getProjects(mockSession);
    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(response.body.projects).toHaveLength(100);
    expect(duration).toBeLessThan(500); // Performance requirement
  });
});
```

#### Test Case 8: Projects with Missing Powerplant Data

**Test Name:** `should handle projects with missing powerplant data gracefully`

**Description:** Verifies that projects with null or missing powerplant references are handled.

**Input Data:**
- Valid session
- Project with null powerplant (data integrity issue)

**Expected Output:**
- HTTP 200 status code
- Project included with null powerplant name or filtered out

**Mock Setup:**
```typescript
const projectsWithNullPowerplant = [
  {
    ...mockProjects[0],
    powerplant: null,
  },
];
mockPrisma.project.findMany.mockResolvedValue(projectsWithNullPowerplant);
```

**Assertions:**
- Null powerplant handled gracefully
- Response doesn't crash
- Response status is 200

#### Test Case 9: Projects Ordered by Creation Date

**Test Name:** `should return projects ordered by created_at descending`

**Description:** Verifies that projects are returned in correct order (newest first).

**Input Data:**
- Valid session
- Multiple projects with different creation dates

**Expected Output:**
- Projects ordered by created_at DESC
- Newest project first in array

**Assertions:**
- `prisma.project.findMany` called with `orderBy: { created_at: 'desc' }`
- Response array is in correct order

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear Prisma mock calls
- Reset session state

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  mockPrisma.project.findMany.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- view-projects-list.test.ts
```

### Expected Results
- All happy path tests pass
- All authentication tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 2 seconds for full suite

## Coverage Goals

### Coverage Targets
- Projects list endpoint handler: 100% line coverage
- Database queries: 100% coverage
- Error handling: 100% error path coverage
- Authentication checks: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: GET `/api/projects`

**Test Coverage:**
- ✅ Retrieve user's projects (200)
- ✅ Empty projects list (200)
- ✅ Unauthenticated request (401)
- ✅ Expired session (401)
- ✅ Database errors (503/500)
- ✅ Large dataset (performance)

## Notes

- Projects are filtered by user_id to ensure user isolation
- Projects are ordered by created_at DESC (newest first)
- Powerplant name is included in response for display
- Response time must be < 500ms for up to 100 projects (performance requirement)
- Empty list is a valid response (not an error condition)
- All database errors return generic messages to users
