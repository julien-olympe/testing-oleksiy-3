# Unit Test: Start New Project (Use Case 5)

## Test Overview

**Test Name:** Start New Project Tests  
**Purpose:** Test the functionality to initiate project creation by displaying the Start Project screen with powerplant selection.

**Component Being Tested:** 
- Navigation to Start Project screen
- GET `/api/powerplants` endpoint
- Powerplant list service/controller
- Session validation

## Test Setup

### Prerequisites
- Mock Prisma Client configured
- Mock session management configured
- Authentication middleware mocked

### Mocking Strategy

**Database Mocking:**
```typescript
const mockPrisma = {
  powerplant: {
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

**Mock Powerplants:**
```typescript
const mockPowerplants = [
  {
    id: 'powerplant-1-uuid',
    name: 'Wind Farm Alpha',
    location: 'Location A',
    created_at: new Date(),
  },
  {
    id: 'powerplant-2-uuid',
    name: 'Wind Farm Beta',
    location: 'Location B',
    created_at: new Date(),
  },
];
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Load Powerplant List

**Test Name:** `should return list of powerplants for authenticated user`

**Description:** Verifies that an authenticated user can retrieve the list of available powerplants.

**Input Data:**
- Valid session with user ID

**Expected Output:**
- HTTP 200 status code
- Response body: `{ powerplants: [...] }`
- All powerplants returned (read-only data)

**Assertions:**
- `prisma.powerplant.findMany` called
- Response status is 200
- Response contains powerplants array
- All authenticated users can access powerplant list

**Test Implementation:**
```typescript
describe('Start New Project - Happy Path', () => {
  test('should return list of powerplants for authenticated user', async () => {
    mockPrisma.powerplant.findMany.mockResolvedValue(mockPowerplants);

    const response = await getPowerplants(mockSession);

    expect(mockPrisma.powerplant.findMany).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('powerplants');
    expect(response.body.powerplants).toHaveLength(2);
  });
});
```

#### Test Case 2: Empty Powerplant List

**Test Name:** `should return empty list when no powerplants exist`

**Description:** Verifies that empty powerplant list is handled gracefully.

**Input Data:**
- Valid session
- No powerplants in database

**Expected Output:**
- HTTP 200 status code
- Response body: `{ powerplants: [] }`

**Mock Setup:**
```typescript
mockPrisma.powerplant.findMany.mockResolvedValue([]);
```

**Assertions:**
- Empty array returned
- Response status is 200
- No errors thrown

**Test Implementation:**
```typescript
test('should return empty list when no powerplants exist', async () => {
  mockPrisma.powerplant.findMany.mockResolvedValue([]);

  const response = await getPowerplants(mockSession);

  expect(response.status).toBe(200);
  expect(response.body.powerplants).toEqual([]);
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

**Assertions:**
- Authentication middleware rejects request
- `prisma.powerplant.findMany` not called
- Response status is 401

**Test Implementation:**
```typescript
describe('Start New Project - Authentication', () => {
  test('should reject request when user is not authenticated', async () => {
    const invalidSession = null;

    const response = await getPowerplants(invalidSession);

    expect(mockPrisma.powerplant.findMany).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
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
- Error message: "Unable to load powerplants"
- Empty list or error response

**Mock Setup:**
```typescript
mockPrisma.powerplant.findMany.mockRejectedValue(
  new Error('Connection failed')
);
```

**Assertions:**
- Database error caught
- Response status is 503
- Generic error message returned

**Test Implementation:**
```typescript
describe('Start New Project - Error Conditions', () => {
  test('should handle database connection failure', async () => {
    mockPrisma.powerplant.findMany.mockRejectedValue(
      new Error('Connection failed')
    );

    const response = await getPowerplants(mockSession);

    expect(response.status).toBe(503);
    expect(response.body.message).toContain('Unable to load');
  });
});
```

#### Test Case 6: Database Query Failure

**Test Name:** `should handle database query failure`

**Description:** Verifies that database query errors are handled.

**Input Data:**
- Valid session

**Expected Output:**
- HTTP 500 status code
- Error message: "An error occurred. Please try again."

**Mock Setup:**
```typescript
mockPrisma.powerplant.findMany.mockRejectedValue(
  new Error('Query execution failed')
);
```

**Assertions:**
- Query error caught
- Response status is 500
- Error logged

---

### Edge Cases

#### Test Case 7: Large Number of Powerplants

**Test Name:** `should handle large number of powerplants (up to 1000)`

**Description:** Verifies that the system can handle the maximum expected number of powerplants.

**Input Data:**
- Valid session
- 1000 powerplants in database

**Expected Output:**
- HTTP 200 status code
- All powerplants returned
- Response time < 500ms (performance requirement)

**Mock Setup:**
```typescript
const manyPowerplants = Array.from({ length: 1000 }, (_, i) => ({
  id: `powerplant-${i}-uuid`,
  name: `Wind Farm ${i}`,
  location: `Location ${i}`,
  created_at: new Date(),
}));
mockPrisma.powerplant.findMany.mockResolvedValue(manyPowerplants);
```

**Assertions:**
- All powerplants returned
- Response time meets performance requirement
- Response status is 200

**Test Implementation:**
```typescript
describe('Start New Project - Edge Cases', () => {
  test('should handle large number of powerplants (up to 1000)', async () => {
    const manyPowerplants = Array.from({ length: 1000 }, (_, i) => ({
      id: `powerplant-${i}-uuid`,
      name: `Wind Farm ${i}`,
      location: `Location ${i}`,
      created_at: new Date(),
    }));

    mockPrisma.powerplant.findMany.mockResolvedValue(manyPowerplants);

    const startTime = Date.now();
    const response = await getPowerplants(mockSession);
    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(response.body.powerplants).toHaveLength(1000);
    expect(duration).toBeLessThan(500); // Performance requirement
  });
});
```

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
  mockPrisma.powerplant.findMany.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- start-new-project.test.ts
```

### Expected Results
- All happy path tests pass
- All authentication tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 1 second for full suite

## Coverage Goals

### Coverage Targets
- Powerplants list endpoint handler: 100% line coverage
- Database queries: 100% coverage
- Error handling: 100% error path coverage
- Authentication checks: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: GET `/api/powerplants`

**Test Coverage:**
- ✅ Retrieve powerplants list (200)
- ✅ Empty powerplants list (200)
- ✅ Unauthenticated request (401)
- ✅ Expired session (401)
- ✅ Database errors (503/500)
- ✅ Large dataset (performance)

## Notes

- Powerplant data is read-only for all authenticated users
- No user-specific filtering (all users see all powerplants)
- Response time must be < 500ms (performance requirement)
- Empty list is a valid response (not an error condition)
- All database errors return generic messages to users
- This endpoint is used to populate the powerplant dropdown on Start Project screen
