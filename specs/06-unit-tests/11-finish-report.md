# Unit Test: Finish Report (Use Case 11)

## Test Overview

**Test Name:** Finish Report Tests  
**Purpose:** Test the functionality to complete a project by generating a PDF report and marking the project as Finished.

**Component Being Tested:** 
- POST `/api/projects/:id/finish` endpoint
- PDF generation service (PDFKit)
- Project status update
- Session validation
- Authorization checks
- Database operations (Prisma)
- Data aggregation for PDF

## Test Setup

### Prerequisites
- Mock Prisma Client configured
- Mock PDFKit library configured
- Mock session management configured
- Authentication middleware mocked

### Mocking Strategy

**Database Mocking:**
```typescript
const mockPrisma = {
  project: {
    findUnique: jest.fn(),
    update: jest.fn(),
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
  $transaction: jest.fn(),
};
```

**PDF Generation Mocking:**
```typescript
const mockPDFDocument = {
  text: jest.fn(),
  image: jest.fn(),
  end: jest.fn(),
  pipe: jest.fn(),
};

jest.mock('pdfkit', () => {
  return jest.fn(() => mockPDFDocument);
});
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

**Mock Project Data for PDF:**
```typescript
const mockProjectData = {
  project: mockProject,
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

#### Test Case 1: Finish Project Successfully

**Test Name:** `should finish project and generate PDF when all data is available`

**Description:** Verifies that a project can be finished and PDF generated successfully.

**Input Data:**
- Valid session
- Valid project ID
- Project belongs to user
- Project is "In Progress"
- All checkup statuses set

**Expected Output:**
- HTTP 200 status code
- PDF generated in memory
- Project status updated to "Finished"
- finished_at timestamp set
- Response: `{ message: "Report generated successfully", pdfUrl: "..." }`
- PDF download triggered

**Assertions:**
- `prisma.project.findUnique` called to verify project
- Project status is "In Progress"
- User access verified
- All project data retrieved
- PDF document created
- PDF contains project data
- Project status updated to "Finished"
- finished_at timestamp set
- Response status is 200

**Test Implementation:**
```typescript
describe('Finish Report - Happy Path', () => {
  test('should finish project and generate PDF when all data is available', async () => {
    const projectId = 'project-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
    mockPrisma.checkup.findMany.mockResolvedValue(mockProjectData.parts[0].checkups);
    mockPrisma.checkupStatus.findMany.mockResolvedValue(mockProjectData.checkupStatuses);
    mockPrisma.project.update.mockResolvedValue({
      ...mockProject,
      status: 'Finished',
      finished_at: new Date(),
    });

    const response = await finishProject(projectId, mockSession);

    expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: projectId },
    });
    expect(mockPrisma.project.update).toHaveBeenCalledWith({
      where: { id: projectId },
      data: {
        status: 'Finished',
        finished_at: expect.any(Date),
      },
    });
    expect(mockPDFDocument.text).toHaveBeenCalled();
    expect(mockPDFDocument.end).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('generated successfully');
  });
});
```

---

### Validation Tests

#### Test Case 2: Project Already Finished

**Test Name:** `should reject finish request when project is already finished`

**Description:** Verifies that finished projects cannot be finished again.

**Input Data:**
- Valid session
- Valid project ID
- Project status is "Finished"

**Expected Output:**
- HTTP 400 status code
- Error message: "Project is already finished"
- PDF not regenerated
- Project not updated

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
- Finish operation rejected
- PDF not generated
- Response status is 400

**Test Implementation:**
```typescript
describe('Finish Report - Validation', () => {
  test('should reject finish request when project is already finished', async () => {
    const projectId = 'project-uuid';
    const finishedProject = {
      ...mockProject,
      status: 'Finished',
      finished_at: new Date(),
    };

    mockPrisma.project.findUnique.mockResolvedValue(finishedProject);

    const response = await finishProject(projectId, mockSession);

    expect(mockPrisma.project.update).not.toHaveBeenCalled();
    expect(mockPDFDocument.text).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already finished');
  });
});
```

#### Test Case 3: Missing Checkup Statuses

**Test Name:** `should warn when some checkups have no status`

**Description:** Verifies that missing checkup statuses are detected and user is warned.

**Input Data:**
- Valid session
- Valid project ID
- Some checkups have no status

**Expected Output:**
- HTTP 200 status code (with warning) or 400 (if validation enforced)
- Warning message: "Some checkups have no status"
- User can proceed or cancel
- PDF generated with available statuses

**Mock Setup:**
```typescript
mockPrisma.checkupStatus.findMany.mockResolvedValue([]); // No statuses
```

**Assertions:**
- Missing statuses detected
- Warning returned or validation fails
- User can choose to proceed

---

### Authorization Tests

#### Test Case 4: Project Belongs to Another User

**Test Name:** `should reject finish request when project belongs to another user`

**Description:** Verifies that users cannot finish projects assigned to other users.

**Input Data:**
- Valid session
- Valid project ID
- Project belongs to different user

**Expected Output:**
- HTTP 403 status code (Forbidden)
- Error message: "Access denied"
- PDF not generated
- Project not updated

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
- PDF not generated
- Response status is 403

**Test Implementation:**
```typescript
describe('Finish Report - Authorization', () => {
  test('should reject finish request when project belongs to another user', async () => {
    const projectId = 'project-uuid';
    const otherUserProject = {
      ...mockProject,
      user_id: 'other-user-uuid',
    };

    mockPrisma.project.findUnique.mockResolvedValue(otherUserProject);

    const response = await finishProject(projectId, mockSession);

    expect(mockPrisma.project.update).not.toHaveBeenCalled();
    expect(mockPDFDocument.text).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Access denied');
  });
});
```

---

### Error Condition Tests

#### Test Case 5: PDF Generation Failure

**Test Name:** `should handle PDF generation failure gracefully`

**Description:** Verifies that PDF generation errors are handled and project is not marked as Finished.

**Input Data:**
- Valid session
- Valid project ID
- PDF generation fails

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to generate report"
- Project NOT marked as Finished
- Project status remains "In Progress"

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProject);
mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
mockPrisma.checkup.findMany.mockResolvedValue(mockProjectData.parts[0].checkups);
mockPrisma.checkupStatus.findMany.mockResolvedValue(mockProjectData.checkupStatuses);
mockPDFDocument.end.mockImplementation(() => {
  throw new Error('PDF generation failed');
});
```

**Assertions:**
- PDF generation error caught
- Project status NOT updated
- Response status is 500
- User can retry

**Test Implementation:**
```typescript
describe('Finish Report - Error Conditions', () => {
  test('should handle PDF generation failure gracefully', async () => {
    const projectId = 'project-uuid';

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
    mockPrisma.checkup.findMany.mockResolvedValue(mockProjectData.parts[0].checkups);
    mockPrisma.checkupStatus.findMany.mockResolvedValue(mockProjectData.checkupStatuses);
    mockPDFDocument.end.mockImplementation(() => {
      throw new Error('PDF generation failed');
    });

    const response = await finishProject(projectId, mockSession);

    expect(mockPrisma.project.update).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Unable to generate');
  });
});
```

#### Test Case 6: Database Update Failure

**Test Name:** `should handle database update failure during project finish`

**Description:** Verifies that database update errors are handled.

**Input Data:**
- Valid session
- Valid project ID
- Database update fails

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to complete project"
- PDF generated but project NOT marked as Finished
- User can retry

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(mockProject);
mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
mockPrisma.checkup.findMany.mockResolvedValue(mockProjectData.parts[0].checkups);
mockPrisma.checkupStatus.findMany.mockResolvedValue(mockProjectData.checkupStatuses);
mockPrisma.project.update.mockRejectedValue(
  new Error('Database update failed')
);
```

**Assertions:**
- Database error caught
- PDF may be generated but project not updated
- Response status is 500

#### Test Case 7: Database Connection Failure

**Test Name:** `should handle database connection failure`

**Description:** Verifies that database connection errors are handled.

**Input Data:**
- Valid session
- Valid project ID
- Database connection fails

**Expected Output:**
- HTTP 503 status code
- Error message: "Database temporarily unavailable"
- PDF not generated
- Project not updated

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockRejectedValue(
  new Error('Connection failed')
);
```

**Assertions:**
- Database error caught
- Response status is 503

#### Test Case 8: Project Not Found

**Test Name:** `should return error when project does not exist`

**Description:** Verifies that non-existent projects return appropriate error.

**Input Data:**
- Valid session
- Invalid or non-existent project ID

**Expected Output:**
- HTTP 404 status code
- Error message: "Project not found"
- PDF not generated

**Mock Setup:**
```typescript
mockPrisma.project.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Project not found
- Response status is 404

#### Test Case 9: Session Expired

**Test Name:** `should reject finish request when session is expired`

**Description:** Verifies that expired sessions are rejected.

**Input Data:**
- Expired session
- Valid project ID

**Expected Output:**
- HTTP 401 status code
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

#### Test Case 10: Large Project with Many Checkups

**Test Name:** `should handle large project with many checkups (up to 100)`

**Description:** Verifies that large projects are handled efficiently.

**Input Data:**
- Valid session
- Valid project ID
- Project with 100 checkups

**Expected Output:**
- HTTP 200 status code
- PDF generated successfully
- Response time < 5 seconds (performance requirement)

**Mock Setup:**
```typescript
const manyCheckups = Array.from({ length: 100 }, (_, i) => ({
  id: `checkup-${i}-uuid`,
  part_id: `part-${Math.floor(i / 10)}-uuid`,
  name: `Checkup ${i}`,
  status: i % 3 === 0 ? 'bad' : i % 3 === 1 ? 'average' : 'good',
}));
mockPrisma.checkup.findMany.mockResolvedValue(manyCheckups);
```

**Assertions:**
- PDF generated with all checkups
- Response time meets performance requirement
- Response status is 200

**Test Implementation:**
```typescript
describe('Finish Report - Edge Cases', () => {
  test('should handle large project with many checkups (up to 100)', async () => {
    const projectId = 'project-uuid';
    const manyCheckups = Array.from({ length: 100 }, (_, i) => ({
      id: `checkup-${i}-uuid`,
      part_id: `part-${Math.floor(i / 10)}-uuid`,
      name: `Checkup ${i}`,
      status: i % 3 === 0 ? 'bad' : i % 3 === 1 ? 'average' : 'good',
    }));

    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.powerplant.findUnique.mockResolvedValue(mockProjectData.powerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockProjectData.parts);
    mockPrisma.checkup.findMany.mockResolvedValue(manyCheckups);
    mockPrisma.checkupStatus.findMany.mockResolvedValue(mockProjectData.checkupStatuses);
    mockPrisma.project.update.mockResolvedValue({
      ...mockProject,
      status: 'Finished',
      finished_at: new Date(),
    });

    const startTime = Date.now();
    const response = await finishProject(projectId, mockSession);
    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000); // Performance requirement
  });
});
```

#### Test Case 11: PDF with Images

**Test Name:** `should generate PDF with documentation images`

**Description:** Verifies that PDF includes documentation images.

**Input Data:**
- Valid session
- Valid project ID
- Checkups have documentation images

**Expected Output:**
- HTTP 200 status code
- PDF includes images
- Images embedded in PDF

**Assertions:**
- PDF document includes image calls
- Images processed and embedded
- Response status is 200

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear all Prisma mock calls
- Reset PDF document mocks
- Reset session state

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  mockPrisma.project.findUnique.mockReset();
  mockPrisma.project.update.mockReset();
  mockPDFDocument.text.mockReset();
  mockPDFDocument.image.mockReset();
  mockPDFDocument.end.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- finish-report.test.ts
```

### Expected Results
- All happy path tests pass
- All validation tests pass
- All authorization tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 10 seconds for full suite

## Coverage Goals

### Coverage Targets
- Finish project endpoint handler: 100% line coverage
- PDF generation: 100% coverage
- Project status update: 100% coverage
- Authorization checks: 100% coverage
- Error handling: 100% error path coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: POST `/api/projects/:id/finish`

**Test Coverage:**
- ✅ Finish project successfully (200)
- ✅ Project already finished (400)
- ✅ Missing checkup statuses (200/400)
- ✅ Access denied (403)
- ✅ PDF generation failure (500)
- ✅ Database update failure (500)
- ✅ Database connection failure (503)
- ✅ Project not found (404)
- ✅ Session expired (401)
- ✅ Large project (performance)
- ✅ PDF with images (200)

## Notes

- PDF generation must complete before project is marked as Finished
- If PDF generation fails, project status remains "In Progress" (allows retry)
- If database update fails after PDF generation, PDF may be lost (trade-off)
- Response time must be < 5 seconds for projects with 50-100 checkups (performance requirement)
- Response time must be < 10 seconds for projects with 100-200 checkups (performance requirement)
- PDF is generated in-memory (no temporary file storage)
- PDF is streamed directly to browser for download
- Project becomes read-only after being marked as Finished
- All database errors return generic messages to users
- PDF includes: project header, powerplant name, parts list, checkups, statuses, documentation images and descriptions, completion timestamp
