# Unit Test: View Ongoing Project (Use Case 8)

## Test Overview

**Test Name:** View Ongoing Project Tests  
**Purpose:** Test the functionality to display the Ongoing Project screen with all project data, parts, checkups, statuses, and documentation.

**Component Being Tested:** 
- GET `/api/projects/:id` endpoint (same as Open Project, but focused on display logic)
- Project display service/controller
- Data aggregation and formatting
- UI rendering logic (if applicable)

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

**Mock Project Data:**
```typescript
const mockProjectData = {
  project: {
    id: 'project-uuid',
    user_id: 'user-uuid',
    powerplant_id: 'powerplant-uuid',
    status: 'In Progress',
    created_at: new Date(),
    finished_at: null,
  },
  powerplant: {
    id: 'powerplant-uuid',
    name: 'Wind Farm Alpha',
  },
  parts: [
    {
      id: 'part-1-uuid',
      name: 'Rotor Blades',
      checkups: [
        {
          id: 'checkup-1-uuid',
          name: 'Blade Condition',
          status: 'good',
        },
      ],
    },
  ],
  checkupStatuses: [
    {
      checkup_id: 'checkup-1-uuid',
      status_value: 'good',
    },
  ],
};
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Display Ongoing Project Successfully

**Test Name:** `should return all project data for display on Ongoing Project screen`

**Description:** Verifies that all required data is returned for rendering the Ongoing Project screen.

**Input Data:**
- Valid session
- Valid project ID
- Project belongs to user

**Expected Output:**
- HTTP 200 status code
- Response includes:
  - Powerplant name
  - Parts list with checkups
  - Current status values for each checkup
  - Documentation references
  - "Finish Report" button availability (based on project status)

**Assertions:**
- All data retrieved successfully
- Data formatted correctly for display
- Response status is 200
- Response contains all required fields

**Test Implementation:**
```typescript
describe('View Ongoing Project - Happy Path', () => {
  test('should return all project data for display on Ongoing Project screen', async () => {
    const projectId = 'project-uuid';

    // Mock all database calls
    mockPrisma.project.findUnique.mockResolvedValue(mockProjectData.project);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
    mockPrisma.checkup.findMany.mockResolvedValue(mockProjectData.parts[0].checkups);
    mockPrisma.checkupStatus.findMany.mockResolvedValue(mockProjectData.checkupStatuses);

    const response = await getProjectForDisplay(projectId, mockSession);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('powerplant');
    expect(response.body).toHaveProperty('parts');
    expect(response.body).toHaveProperty('checkupStatuses');
    expect(response.body.powerplant).toHaveProperty('name');
    expect(response.body.parts).toBeInstanceOf(Array);
  });
});
```

#### Test Case 2: Display Project with All Statuses Set

**Test Name:** `should display project with all checkup statuses set`

**Description:** Verifies that projects with all statuses set display correctly.

**Input Data:**
- Valid session
- Valid project ID
- All checkups have status values

**Expected Output:**
- HTTP 200 status code
- All checkups have status values (bad, average, or good)
- No unset statuses

**Assertions:**
- All checkups have status values
- Status values are valid (bad, average, good)
- Response status is 200

---

### Error Condition Tests

#### Test Case 3: Missing Project Data

**Test Name:** `should handle missing project data gracefully`

**Description:** Verifies that missing project data is handled.

**Input Data:**
- Valid session
- Project not found

**Expected Output:**
- HTTP 404 status code
- Error message: "Missing project data"
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
describe('View Ongoing Project - Error Conditions', () => {
  test('should handle missing project data gracefully', async () => {
    const projectId = 'non-existent-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(null);

    const response = await getProjectForDisplay(projectId, mockSession);

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Missing project data');
  });
});
```

#### Test Case 4: Missing Powerplant Data

**Test Name:** `should handle missing powerplant data gracefully`

**Description:** Verifies that missing powerplant data is handled.

**Input Data:**
- Valid session
- Valid project ID
- Powerplant not found

**Expected Output:**
- HTTP 500 status code
- Error message: "Missing powerplant data"
- Redirect to home screen

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProjectData.project);
mockPrisma.powerplant.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Powerplant not found
- Response status is 500

#### Test Case 5: Unable to Load Parts/Checkups

**Test Name:** `should handle failure to load parts or checkups gracefully`

**Description:** Verifies that parts/checkups loading failures are handled.

**Input Data:**
- Valid session
- Valid project ID
- Parts query fails

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to load parts/checkups"
- Partial screen or error display

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProjectData.project);
mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
mockPrisma.part.findMany.mockRejectedValue(new Error('Query failed'));
```

**Assertions:**
- Query error caught
- Response status is 500

---

### Edge Cases

#### Test Case 6: Project with No Checkup Statuses

**Test Name:** `should display project with no checkup statuses set`

**Description:** Verifies that projects with no statuses set display correctly.

**Input Data:**
- Valid session
- Valid project ID
- No checkup statuses set

**Expected Output:**
- HTTP 200 status code
- All checkups shown with unset status
- "Finish Report" button may be disabled or show warning

**Mock Setup:**
```typescript
mockPrisma.checkupStatus.findMany.mockResolvedValue([]);
```

**Assertions:**
- Empty statuses array handled
- Checkups displayed with unset status
- Response status is 200

**Test Implementation:**
```typescript
describe('View Ongoing Project - Edge Cases', () => {
  test('should display project with no checkup statuses set', async () => {
    const projectId = 'project-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(mockProjectData.project);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
    mockPrisma.checkup.findMany.mockResolvedValue(mockProjectData.parts[0].checkups);
    mockPrisma.checkupStatus.findMany.mockResolvedValue([]);

    const response = await getProjectForDisplay(projectId, mockSession);

    expect(response.status).toBe(200);
    expect(response.body.checkupStatuses).toEqual([]);
    // Checkups should still be returned, just without statuses
  });
});
```

#### Test Case 7: Finished Project Display

**Test Name:** `should display finished project in read-only mode`

**Description:** Verifies that finished projects are displayed correctly (read-only).

**Input Data:**
- Valid session
- Valid project ID
- Project status is "Finished"

**Expected Output:**
- HTTP 200 status code
- All data displayed
- Status updates disabled
- "Finish Report" button hidden or disabled

**Mock Setup:**
```typescript
const finishedProject = {
  ...mockProjectData.project,
  status: 'Finished',
  finished_at: new Date(),
};
mockPrisma.project.findUnique.mockResolvedValue(finishedProject);
```

**Assertions:**
- Finished project data returned
- Response indicates read-only mode
- Response status is 200

#### Test Case 8: Large Project Display

**Test Name:** `should handle large project with many checkups (up to 100)`

**Description:** Verifies that large projects display efficiently.

**Input Data:**
- Valid session
- Valid project ID
- Project with 100 checkups

**Expected Output:**
- HTTP 200 status code
- All checkups returned
- Response time < 3 seconds (performance requirement)

**Mock Setup:**
```typescript
const manyCheckups = Array.from({ length: 100 }, (_, i) => ({
  id: `checkup-${i}-uuid`,
  part_id: 'part-1-uuid',
  name: `Checkup ${i}`,
  status: i % 3 === 0 ? 'bad' : i % 3 === 1 ? 'average' : 'good',
}));
mockPrisma.checkup.findMany.mockResolvedValue(manyCheckups);
```

**Assertions:**
- All checkups returned
- Response time meets performance requirement
- Response status is 200

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
npm test -- view-ongoing-project.test.ts
```

### Expected Results
- All happy path tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 3 seconds for full suite

## Coverage Goals

### Coverage Targets
- Project display logic: 100% line coverage
- Data formatting: 100% coverage
- Error handling: 100% error path coverage
- Status aggregation: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: GET `/api/projects/:id` (Display Focus)

**Test Coverage:**
- ✅ Display project successfully (200)
- ✅ Project with all statuses (200)
- ✅ Missing project data (404)
- ✅ Missing powerplant data (500)
- ✅ Parts/checkups load failure (500)
- ✅ No statuses set (200)
- ✅ Finished project (200)
- ✅ Large dataset (performance)

## Notes

- This use case focuses on the display/rendering aspect of the Ongoing Project screen
- Data is aggregated from multiple database queries
- Response time must be < 3 seconds for projects with up to 100 checkups (performance requirement)
- Finished projects are displayed in read-only mode
- Projects with no statuses set are valid (status can be set later)
- All error conditions redirect to home screen or show error message
- "Finish Report" button availability depends on project status and checkup statuses
