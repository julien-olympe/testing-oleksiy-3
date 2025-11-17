# Unit Test: Set Checkup Status (Use Case 9)

## Test Overview

**Test Name:** Set Checkup Status Tests  
**Purpose:** Test the functionality to set or update checkup status values (bad, average, good) for checkups in an ongoing project.

**Component Being Tested:** 
- PATCH `/api/projects/:id/checkups/:checkupId/status` endpoint
- Checkup status update service/controller
- Session validation
- Authorization checks
- Input validation
- Database operations (Prisma)
- Status transition validation

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
    findUnique: jest.fn(),
  },
  checkupStatus: {
    upsert: jest.fn(),
  },
  checkup: {
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

**Valid Status Update Data:**
```typescript
const validStatusData = {
  status_value: 'good',
};
```

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

**Mock Checkup:**
```typescript
const mockCheckup = {
  id: 'checkup-uuid',
  part_id: 'part-uuid',
  name: 'Blade Condition',
  description: 'Check blade surface',
};
```

**Mock CheckupStatus:**
```typescript
const mockCheckupStatus = {
  id: 'status-uuid',
  project_id: 'project-uuid',
  checkup_id: 'checkup-uuid',
  status_value: 'good',
  created_at: new Date(),
  updated_at: new Date(),
};
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Set Checkup Status Successfully

**Test Name:** `should update checkup status when valid status value and project access provided`

**Description:** Verifies that an authenticated user can set a checkup status in their own project.

**Input Data:**
```typescript
{
  status_value: 'good',
}
```

**Expected Output:**
- HTTP 200 status code
- CheckupStatus record created or updated
- Response: `{ message: "Status updated successfully", status: {...} }`
- UI updated to reflect new status

**Assertions:**
- `prisma.project.findUnique` called to verify project exists and is accessible
- Project status is "In Progress"
- User access verified (user_id matches)
- `prisma.checkupStatus.upsert` called with correct data
- Response status is 200
- Response contains updated status

**Test Implementation:**
```typescript
describe('Set Checkup Status - Happy Path', () => {
  test('should update checkup status when valid status value and project access provided', async () => {
    const projectId = 'project-uuid';
    const checkupId = 'checkup-uuid';
    const statusData = {
      status_value: 'good',
    };

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.checkup.findUnique.mockResolvedValue(mockCheckup);
    mockPrisma.checkupStatus.upsert.mockResolvedValue(mockCheckupStatus);

    const response = await updateCheckupStatus(
      projectId,
      checkupId,
      statusData,
      mockSession
    );

    expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: projectId },
    });
    expect(mockPrisma.checkupStatus.upsert).toHaveBeenCalledWith({
      where: {
        project_id_checkup_id: {
          project_id: projectId,
          checkup_id: checkupId,
        },
      },
      update: {
        status_value: statusData.status_value,
        updated_at: expect.any(Date),
      },
      create: {
        project_id: projectId,
        checkup_id: checkupId,
        status_value: statusData.status_value,
      },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status.status_value).toBe('good');
  });
});
```

#### Test Case 2: Update Existing Status

**Test Name:** `should update existing checkup status when status already set`

**Description:** Verifies that existing status values can be updated.

**Input Data:**
```typescript
{
  status_value: 'bad', // Changing from 'good' to 'bad'
}
```

**Expected Output:**
- HTTP 200 status code
- Status value updated
- updated_at timestamp updated

**Mock Setup:**
```typescript
const existingStatus = {
  ...mockCheckupStatus,
  status_value: 'good',
};
mockPrisma.checkupStatus.upsert.mockResolvedValue({
  ...existingStatus,
  status_value: 'bad',
  updated_at: new Date(),
});
```

**Assertions:**
- Existing status updated
- Status value changed
- Response status is 200

---

### Validation Tests

#### Test Case 3: Invalid Status Value

**Test Name:** `should reject invalid status value`

**Description:** Verifies that only valid status values (bad, average, good) are accepted.

**Input Data:**
```typescript
{
  status_value: 'invalid',
}
```

**Expected Output:**
- HTTP 400 status code (Bad Request)
- Error message: "Invalid status value"
- Status not saved

**Assertions:**
- Validation error thrown
- `prisma.checkupStatus.upsert` not called
- Response status is 400

**Test Implementation:**
```typescript
describe('Set Checkup Status - Validation', () => {
  test('should reject invalid status value', async () => {
    const projectId = 'project-uuid';
    const checkupId = 'checkup-uuid';
    const statusData = {
      status_value: 'invalid',
    };

    const response = await updateCheckupStatus(
      projectId,
      checkupId,
      statusData,
      mockSession
    );

    expect(mockPrisma.checkupStatus.upsert).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid status value');
  });
});
```

#### Test Case 4: Missing Status Value

**Test Name:** `should reject missing status value`

**Description:** Verifies that missing status value is rejected.

**Input Data:**
```typescript
{
  status_value: null,
}
// or
{}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Status value is required"
- Status not saved

**Assertions:**
- Validation error thrown
- Response status is 400

---

### Authorization Tests

#### Test Case 5: Project Belongs to Another User

**Test Name:** `should reject status update when project belongs to another user`

**Description:** Verifies that users cannot update statuses in projects assigned to other users.

**Input Data:**
```typescript
{
  status_value: 'good',
}
```

**Expected Output:**
- HTTP 403 status code (Forbidden)
- Error message: "Access denied"
- Status not saved

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
- `prisma.checkupStatus.upsert` not called
- Response status is 403

**Test Implementation:**
```typescript
describe('Set Checkup Status - Authorization', () => {
  test('should reject status update when project belongs to another user', async () => {
    const projectId = 'project-uuid';
    const checkupId = 'checkup-uuid';
    const statusData = {
      status_value: 'good',
    };
    const otherUserProject = {
      ...mockProject,
      user_id: 'other-user-uuid',
    };

    mockPrisma.project.findUnique.mockResolvedValue(otherUserProject);

    const response = await updateCheckupStatus(
      projectId,
      checkupId,
      statusData,
      mockSession
    );

    expect(mockPrisma.checkupStatus.upsert).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Access denied');
  });
});
```

---

### Business Rule Tests

#### Test Case 6: Project is Finished

**Test Name:** `should reject status update when project is finished`

**Description:** Verifies that status cannot be updated for finished projects.

**Input Data:**
```typescript
{
  status_value: 'good',
}
```

**Expected Output:**
- HTTP 400 status code
- Error message: "Cannot update status on finished project"
- Status not saved

**Mock Setup:**
```typescript
const finishedProject = {
  ...mockProject,
  status: 'Finished',
  finished_at: new Date(),
};
mockPrisma.project.findUnique.mockResolvedValue(finishedProject);
```

**Assertions:**
- Project status check performed
- Status update rejected
- Response status is 400

**Test Implementation:**
```typescript
describe('Set Checkup Status - Business Rules', () => {
  test('should reject status update when project is finished', async () => {
    const projectId = 'project-uuid';
    const checkupId = 'checkup-uuid';
    const statusData = {
      status_value: 'good',
    };
    const finishedProject = {
      ...mockProject,
      status: 'Finished',
      finished_at: new Date(),
    };

    mockPrisma.project.findUnique.mockResolvedValue(finishedProject);

    const response = await updateCheckupStatus(
      projectId,
      checkupId,
      statusData,
      mockSession
    );

    expect(mockPrisma.checkupStatus.upsert).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('finished project');
  });
});
```

---

### Error Condition Tests

#### Test Case 7: Project Not Found

**Test Name:** `should return error when project does not exist`

**Description:** Verifies that non-existent projects return appropriate error.

**Input Data:**
```typescript
{
  status_value: 'good',
}
```

**Expected Output:**
- HTTP 404 status code (Not Found)
- Error message: "Project not found"
- Status not saved

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Project not found
- Response status is 404

**Test Implementation:**
```typescript
describe('Set Checkup Status - Error Conditions', () => {
  test('should return error when project does not exist', async () => {
    const projectId = 'non-existent-uuid';
    const checkupId = 'checkup-uuid';
    const statusData = {
      status_value: 'good',
    };

    mockPrisma.project.findUnique.mockResolvedValue(null);

    const response = await updateCheckupStatus(
      projectId,
      checkupId,
      statusData,
      mockSession
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('not found');
  });
});
```

#### Test Case 8: Database Save Failure

**Test Name:** `should handle database save failure during status update`

**Description:** Verifies that database save errors are handled gracefully.

**Input Data:**
```typescript
{
  status_value: 'good',
}
```

**Expected Output:**
- HTTP 500 status code (Internal Server Error)
- Error message: "Unable to save status"
- UI reverted to previous status

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProject);
mockPrisma.checkup.findUnique.mockResolvedValue(mockCheckup);
mockPrisma.checkupStatus.upsert.mockRejectedValue(
  new Error('Database save failed')
);
```

**Assertions:**
- Database error caught
- Response status is 500
- Generic error message returned

#### Test Case 9: Session Expired

**Test Name:** `should reject status update when session is expired`

**Description:** Verifies that expired sessions are rejected.

**Input Data:**
```typescript
{
  status_value: 'good',
}
```

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Session expired"
- Redirect to login screen

**Mock Setup:**
```typescript
const expiredSession = null;
```

**Assertions:**
- Session validation fails
- Response status is 401

---

### Edge Cases

#### Test Case 10: All Status Values

**Test Name:** `should accept all valid status values (bad, average, good)`

**Description:** Verifies that all three valid status values are accepted.

**Input Data:**
- Test with 'bad', 'average', and 'good'

**Expected Output:**
- All three values accepted
- Status saved correctly

**Assertions:**
- 'bad' accepted
- 'average' accepted
- 'good' accepted
- All return 200 status

**Test Implementation:**
```typescript
describe('Set Checkup Status - Edge Cases', () => {
  test('should accept all valid status values (bad, average, good)', async () => {
    const projectId = 'project-uuid';
    const checkupId = 'checkup-uuid';
    const statusValues = ['bad', 'average', 'good'];

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.checkup.findUnique.mockResolvedValue(mockCheckup);

    for (const statusValue of statusValues) {
      mockPrisma.checkupStatus.upsert.mockResolvedValue({
        ...mockCheckupStatus,
        status_value: statusValue,
      });

      const response = await updateCheckupStatus(
        projectId,
        checkupId,
        { status_value: statusValue },
        mockSession
      );

      expect(response.status).toBe(200);
      expect(response.body.status.status_value).toBe(statusValue);
    }
  });
});
```

#### Test Case 11: Case Sensitivity

**Test Name:** `should handle status value case sensitivity`

**Description:** Verifies that status values are case-sensitive or normalized.

**Input Data:**
```typescript
{
  status_value: 'GOOD', // Uppercase
}
```

**Expected Output:**
- Status value normalized to lowercase or rejected
- Consistent behavior

**Assertions:**
- Status value normalized or validation fails
- Consistent handling

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
  mockPrisma.checkupStatus.upsert.mockReset();
  mockPrisma.checkup.findUnique.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- set-checkup-status.test.ts
```

### Expected Results
- All happy path tests pass
- All validation tests pass
- All authorization tests pass
- All business rule tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 2 seconds for full suite

## Coverage Goals

### Coverage Targets
- Status update endpoint handler: 100% line coverage
- Input validation: 100% validation rule coverage
- Authorization checks: 100% coverage
- Business rule validation: 100% coverage
- Database operations: 100% coverage
- Error handling: 100% error path coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: PATCH `/api/projects/:id/checkups/:checkupId/status`

**Test Coverage:**
- ✅ Set status successfully (200)
- ✅ Update existing status (200)
- ✅ Invalid status value (400)
- ✅ Missing status value (400)
- ✅ Access denied (403)
- ✅ Project finished (400)
- ✅ Project not found (404)
- ✅ Database errors (500)
- ✅ Session expired (401)
- ✅ All status values (200)

## Notes

- Status values must be one of: 'bad', 'average', 'good' (case-sensitive)
- Status updates use upsert operation (create if not exists, update if exists)
- Project must be in "In Progress" status to allow status updates
- User must own the project to update statuses
- Response time must be < 300ms (performance requirement)
- UI should be reverted if save fails
- All database errors return generic messages to users
- Status updates are atomic (single database operation)
