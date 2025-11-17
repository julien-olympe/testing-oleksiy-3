# Unit Test: Select Powerplant (Use Case 6)

## Test Overview

**Test Name:** Select Powerplant Tests  
**Purpose:** Test the functionality to load parts and checkups when a powerplant is selected on the Start Project screen.

**Component Being Tested:** 
- GET `/api/powerplants/:id/parts` endpoint
- Parts and checkups service/controller
- Session validation
- Database queries (Prisma)
- Data aggregation (parts with checkups)

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
    findUnique: jest.fn(),
  },
  part: {
    findMany: jest.fn(),
  },
  checkup: {
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
  {
    id: 'checkup-2-uuid',
    part_id: 'part-1-uuid',
    name: 'Blade Pitch',
    description: 'Check blade pitch mechanism',
    display_order: 1,
    documentation_images: [],
    documentation_text: null,
  },
  {
    id: 'checkup-3-uuid',
    part_id: 'part-2-uuid',
    name: 'Gearbox Oil Level',
    description: 'Check gearbox oil level',
    display_order: 0,
    documentation_images: [],
    documentation_text: null,
  },
];
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Load Parts and Checkups Successfully

**Test Name:** `should return parts and checkups when valid powerplant ID provided`

**Description:** Verifies that selecting a powerplant returns all associated parts and checkups.

**Input Data:**
- Valid session with user ID
- Valid powerplant ID

**Expected Output:**
- HTTP 200 status code
- Response body includes:
  - Parts array
  - Each part includes associated checkups
  - Documentation references (read-only display)

**Assertions:**
- `prisma.powerplant.findUnique` called to verify powerplant exists
- `prisma.part.findMany` called with powerplant_id filter
- `prisma.checkup.findMany` called for each part
- Parts ordered by display_order
- Checkups ordered by display_order within each part
- Response status is 200
- Response contains parts with nested checkups

**Test Implementation:**
```typescript
describe('Select Powerplant - Happy Path', () => {
  test('should return parts and checkups when valid powerplant ID provided', async () => {
    const powerplantId = 'powerplant-uuid';

    mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
    mockPrisma.part.findMany.mockResolvedValue(mockParts);
    mockPrisma.checkup.findMany.mockResolvedValue(mockCheckups);

    const response = await getPowerplantParts(powerplantId, mockSession);

    expect(mockPrisma.powerplant.findUnique).toHaveBeenCalledWith({
      where: { id: powerplantId },
    });
    expect(mockPrisma.part.findMany).toHaveBeenCalledWith({
      where: { powerplant_id: powerplantId },
      orderBy: { display_order: 'asc' },
    });
    expect(mockPrisma.checkup.findMany).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('parts');
    expect(response.body.parts).toHaveLength(2);
    expect(response.body.parts[0]).toHaveProperty('checkups');
  });
});
```

#### Test Case 2: Powerplant with No Parts

**Test Name:** `should return empty parts list when powerplant has no parts`

**Description:** Verifies that powerplants with no parts are handled gracefully.

**Input Data:**
- Valid session
- Valid powerplant ID
- Powerplant has no parts

**Expected Output:**
- HTTP 200 status code
- Empty parts array
- Message: "No parts configured for this powerplant" (optional)

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.part.findMany.mockResolvedValue([]);
mockPrisma.checkup.findMany.mockResolvedValue([]);
```

**Assertions:**
- Empty parts array returned
- Response status is 200
- No errors thrown

**Test Implementation:**
```typescript
test('should return empty parts list when powerplant has no parts', async () => {
  const powerplantId = 'powerplant-uuid';

  mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
  mockPrisma.part.findMany.mockResolvedValue([]);
  mockPrisma.checkup.findMany.mockResolvedValue([]);

  const response = await getPowerplantParts(powerplantId, mockSession);

  expect(response.status).toBe(200);
  expect(response.body.parts).toEqual([]);
});
```

---

### Authentication Tests

#### Test Case 3: Unauthenticated Request

**Test Name:** `should reject request when user is not authenticated`

**Description:** Verifies that unauthenticated requests are rejected.

**Input Data:**
- No session or invalid session
- Valid powerplant ID

**Expected Output:**
- HTTP 401 status code (Unauthorized)
- Error message: "Authentication required"
- Redirect to login screen

**Assertions:**
- Authentication middleware rejects request
- `prisma.powerplant.findUnique` not called
- Response status is 401

**Test Implementation:**
```typescript
describe('Select Powerplant - Authentication', () => {
  test('should reject request when user is not authenticated', async () => {
    const powerplantId = 'powerplant-uuid';
    const invalidSession = null;

    const response = await getPowerplantParts(powerplantId, invalidSession);

    expect(mockPrisma.powerplant.findUnique).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });
});
```

---

### Error Condition Tests

#### Test Case 4: Powerplant Not Found

**Test Name:** `should return error when powerplant does not exist`

**Description:** Verifies that non-existent powerplants return appropriate error.

**Input Data:**
- Valid session
- Invalid or non-existent powerplant ID

**Expected Output:**
- HTTP 404 status code (Not Found)
- Error message: "Powerplant not found"
- Parts/checkups display cleared

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Powerplant not found
- `prisma.part.findMany` not called
- Response status is 404

**Test Implementation:**
```typescript
describe('Select Powerplant - Error Conditions', () => {
  test('should return error when powerplant does not exist', async () => {
    const powerplantId = 'non-existent-uuid';

    mockPrisma.powerplant.findUnique.mockResolvedValue(null);

    const response = await getPowerplantParts(powerplantId, mockSession);

    expect(mockPrisma.powerplant.findUnique).toHaveBeenCalled();
    expect(mockPrisma.part.findMany).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('not found');
  });
});
```

#### Test Case 5: Database Connection Failure

**Test Name:** `should handle database connection failure`

**Description:** Verifies that database connection errors are handled gracefully.

**Input Data:**
- Valid session
- Valid powerplant ID

**Expected Output:**
- HTTP 503 status code (Service Unavailable)
- Error message: "Database temporarily unavailable"
- Parts/checkups display cleared

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockRejectedValue(
  new Error('Connection failed')
);
```

**Assertions:**
- Database error caught
- Response status is 503

#### Test Case 6: Parts Query Failure

**Test Name:** `should handle parts query failure gracefully`

**Description:** Verifies that parts query errors are handled.

**Input Data:**
- Valid session
- Valid powerplant ID
- Parts query fails

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to load parts"
- Parts/checkups display cleared

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.part.findMany.mockRejectedValue(new Error('Query failed'));
```

**Assertions:**
- Query error caught
- Response status is 500

#### Test Case 7: Checkups Query Failure

**Test Name:** `should handle checkups query failure gracefully`

**Description:** Verifies that checkups query errors are handled.

**Input Data:**
- Valid session
- Valid powerplant ID
- Checkups query fails

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to load checkups"
- Partial data returned or error

**Mock Setup:**
```typescript
mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.part.findMany.mockResolvedValue(mockParts);
mockPrisma.checkup.findMany.mockRejectedValue(new Error('Query failed'));
```

**Assertions:**
- Query error caught
- Response status is 500

---

### Edge Cases

#### Test Case 8: Part with No Checkups

**Test Name:** `should handle part with no checkups`

**Description:** Verifies that parts with no checkups are handled gracefully.

**Input Data:**
- Valid session
- Valid powerplant ID
- Part exists but has no checkups

**Expected Output:**
- HTTP 200 status code
- Part included with empty checkups array

**Mock Setup:**
```typescript
const partWithNoCheckups = [mockParts[0]];
const emptyCheckups = [];
mockPrisma.part.findMany.mockResolvedValue(partWithNoCheckups);
mockPrisma.checkup.findMany.mockResolvedValue(emptyCheckups);
```

**Assertions:**
- Part returned with empty checkups array
- Response status is 200
- No errors thrown

**Test Implementation:**
```typescript
describe('Select Powerplant - Edge Cases', () => {
  test('should handle part with no checkups', async () => {
    const powerplantId = 'powerplant-uuid';
    const partWithNoCheckups = [mockParts[0]];

    mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
    mockPrisma.part.findMany.mockResolvedValue(partWithNoCheckups);
    mockPrisma.checkup.findMany.mockResolvedValue([]);

    const response = await getPowerplantParts(powerplantId, mockSession);

    expect(response.status).toBe(200);
    expect(response.body.parts[0].checkups).toEqual([]);
  });
});
```

#### Test Case 9: Large Powerplant with Many Parts and Checkups

**Test Name:** `should handle powerplant with many parts and checkups (up to 100 checkups)`

**Description:** Verifies that large powerplants are handled efficiently.

**Input Data:**
- Valid session
- Valid powerplant ID
- Powerplant with 10 parts, 10 checkups each (100 total)

**Expected Output:**
- HTTP 200 status code
- All parts and checkups returned
- Response time < 1 second (performance requirement)

**Mock Setup:**
```typescript
const manyParts = Array.from({ length: 10 }, (_, i) => ({
  id: `part-${i}-uuid`,
  powerplant_id: 'powerplant-uuid',
  name: `Part ${i}`,
  description: `Description ${i}`,
  display_order: i,
}));

const manyCheckups = Array.from({ length: 100 }, (_, i) => ({
  id: `checkup-${i}-uuid`,
  part_id: `part-${Math.floor(i / 10)}-uuid`,
  name: `Checkup ${i}`,
  description: `Description ${i}`,
  display_order: i % 10,
  documentation_images: [],
  documentation_text: null,
}));

mockPrisma.powerplant.findUnique.mockResolvedValue(mockPowerplant);
mockPrisma.part.findMany.mockResolvedValue(manyParts);
mockPrisma.checkup.findMany.mockResolvedValue(manyCheckups);
```

**Assertions:**
- All parts and checkups returned
- Response time meets performance requirement
- Response status is 200

#### Test Case 10: Invalid Powerplant ID Format

**Test Name:** `should reject invalid powerplant ID format`

**Description:** Verifies that invalid UUID formats are rejected.

**Input Data:**
- Valid session
- Invalid powerplant ID (not UUID format)

**Expected Output:**
- HTTP 400 status code (Bad Request)
- Error message: "Invalid powerplant ID format"

**Assertions:**
- UUID validation fails
- Response status is 400
- Database query not executed

#### Test Case 11: Documentation Images Included

**Test Name:** `should include documentation images in checkup data`

**Description:** Verifies that documentation images are included in response (read-only).

**Input Data:**
- Valid session
- Valid powerplant ID
- Checkups with documentation images

**Expected Output:**
- HTTP 200 status code
- Checkups include documentation_images array
- Images are base64 encoded or in binary format

**Assertions:**
- Documentation images included
- Response status is 200
- Images are readable format

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
  mockPrisma.powerplant.findUnique.mockReset();
  mockPrisma.part.findMany.mockReset();
  mockPrisma.checkup.findMany.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- select-powerplant.test.ts
```

### Expected Results
- All happy path tests pass
- All authentication tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 2 seconds for full suite

## Coverage Goals

### Coverage Targets
- Powerplant parts endpoint handler: 100% line coverage
- Database queries: 100% coverage
- Error handling: 100% error path coverage
- Data aggregation: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

### Endpoint: GET `/api/powerplants/:id/parts`

**Test Coverage:**
- ✅ Load parts and checkups successfully (200)
- ✅ Powerplant with no parts (200)
- ✅ Unauthenticated request (401)
- ✅ Powerplant not found (404)
- ✅ Database errors (503/500)
- ✅ Query failures (500)
- ✅ Empty checkups (200)
- ✅ Large dataset (performance)
- ✅ Invalid ID format (400)

## Notes

- Parts are ordered by display_order ASC
- Checkups are ordered by display_order ASC within each part
- Documentation images are included but read-only (not editable)
- Response time must be < 1 second for powerplants with up to 100 checkups (performance requirement)
- Empty parts/checkups are valid responses (not errors)
- Invalid UUID formats are validated before database queries
- All database errors return generic messages to users
- This endpoint is used to populate the parts/checkups area when powerplant is selected
