# Unit Test: View Documentation (Use Case 10)

## Test Overview

**Test Name:** View Documentation Tests  
**Purpose:** Test the functionality to retrieve and display documentation (images and descriptions) associated with a checkup.

**Component Being Tested:** 
- Documentation retrieval service/controller
- Image data handling (BYTEA array from PostgreSQL)
- Text description display
- Error handling for missing or corrupted images

## Test Setup

### Prerequisites
- Mock Prisma Client configured
- Mock session management configured
- Authentication middleware mocked

### Mocking Strategy

**Database Mocking:**
```typescript
const mockPrisma = {
  checkup: {
    findUnique: jest.fn(),
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

**Mock Checkup with Documentation:**
```typescript
const mockCheckupWithDocs = {
  id: 'checkup-uuid',
  part_id: 'part-uuid',
  name: 'Blade Condition',
  description: 'Check blade surface for damage',
  documentation_images: [
    Buffer.from('fake-image-data-1'),
    Buffer.from('fake-image-data-2'),
  ],
  documentation_text: 'Reference documentation for blade condition check. Inspect for cracks, erosion, and surface damage.',
};
```

**Mock Checkup without Documentation:**
```typescript
const mockCheckupWithoutDocs = {
  id: 'checkup-uuid',
  part_id: 'part-uuid',
  name: 'Blade Condition',
  description: 'Check blade surface for damage',
  documentation_images: null,
  documentation_text: null,
};
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Retrieve Documentation Successfully

**Test Name:** `should return documentation when checkup has images and text`

**Description:** Verifies that documentation is retrieved successfully when available.

**Input Data:**
- Valid session
- Valid checkup ID
- Checkup has documentation

**Expected Output:**
- HTTP 200 status code
- Response includes:
  - Images array (base64 encoded or binary)
  - Text description
- Documentation displayed in right panel

**Assertions:**
- `prisma.checkup.findUnique` called with checkup ID
- Images included in response
- Text description included
- Response status is 200

**Test Implementation:**
```typescript
describe('View Documentation - Happy Path', () => {
  test('should return documentation when checkup has images and text', async () => {
    const checkupId = 'checkup-uuid';

    mockPrisma.checkup.findUnique.mockResolvedValue(mockCheckupWithDocs);

    const response = await getCheckupDocumentation(checkupId, mockSession);

    expect(mockPrisma.checkup.findUnique).toHaveBeenCalledWith({
      where: { id: checkupId },
      select: {
        id: true,
        name: true,
        documentation_images: true,
        documentation_text: true,
      },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('documentation');
    expect(response.body.documentation).toHaveProperty('images');
    expect(response.body.documentation).toHaveProperty('text');
    expect(response.body.documentation.images).toHaveLength(2);
  });
});
```

#### Test Case 2: Retrieve Documentation with Images Only

**Test Name:** `should return documentation when checkup has images but no text`

**Description:** Verifies that checkups with only images are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Checkup has images but no text

**Expected Output:**
- HTTP 200 status code
- Images included
- Text is null or empty

**Mock Setup:**
```typescript
const checkupWithImagesOnly = {
  ...mockCheckupWithDocs,
  documentation_text: null,
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithImagesOnly);
```

**Assertions:**
- Images returned
- Text is null
- Response status is 200

#### Test Case 3: Retrieve Documentation with Text Only

**Test Name:** `should return documentation when checkup has text but no images`

**Description:** Verifies that checkups with only text are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Checkup has text but no images

**Expected Output:**
- HTTP 200 status code
- Text included
- Images array is empty or null

**Mock Setup:**
```typescript
const checkupWithTextOnly = {
  ...mockCheckupWithDocs,
  documentation_images: null,
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithTextOnly);
```

**Assertions:**
- Text returned
- Images are null or empty
- Response status is 200

---

### Error Condition Tests

#### Test Case 4: No Documentation Found

**Test Name:** `should handle checkup with no documentation gracefully`

**Description:** Verifies that checkups with no documentation are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Checkup has no documentation

**Expected Output:**
- HTTP 200 status code
- Message: "No documentation available for this checkup"
- Empty images array and null text

**Mock Setup:**
```typescript
mockPrisma.checkup.findUnique.mockResolvedValue(mockCheckupWithoutDocs);
```

**Assertions:**
- No documentation returned
- Appropriate message or empty data
- Response status is 200 (not an error)

**Test Implementation:**
```typescript
describe('View Documentation - Error Conditions', () => {
  test('should handle checkup with no documentation gracefully', async () => {
    const checkupId = 'checkup-uuid';

    mockPrisma.checkup.findUnique.mockResolvedValue(mockCheckupWithoutDocs);

    const response = await getCheckupDocumentation(checkupId, mockSession);

    expect(response.status).toBe(200);
    expect(response.body.documentation.images).toBeNull();
    expect(response.body.documentation.text).toBeNull();
    // Optional: message indicating no documentation
  });
});
```

#### Test Case 5: Checkup Not Found

**Test Name:** `should return error when checkup does not exist`

**Description:** Verifies that non-existent checkups return appropriate error.

**Input Data:**
- Valid session
- Invalid or non-existent checkup ID

**Expected Output:**
- HTTP 404 status code (Not Found)
- Error message: "Checkup not found"
- Documentation panel shows error

**Mock Setup:**
```typescript
mockPrisma.checkup.findUnique.mockResolvedValue(null);
```

**Assertions:**
- Checkup not found
- Response status is 404

#### Test Case 6: Image Load Failure

**Test Name:** `should handle image load failure gracefully`

**Description:** Verifies that corrupted or unreadable images are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Images are corrupted or cannot be decoded

**Expected Output:**
- HTTP 200 status code (partial success)
- Placeholder image or error icon for failed images
- Available images still displayed
- Error logged server-side

**Mock Setup:**
```typescript
const checkupWithCorruptedImages = {
  ...mockCheckupWithDocs,
  documentation_images: [Buffer.from('corrupted-data')],
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithCorruptedImages);
// Mock image decoding to throw error
```

**Assertions:**
- Image decoding error caught
- Placeholder shown for failed images
- Response status is 200 (graceful degradation)
- Error logged

**Test Implementation:**
```typescript
test('should handle image load failure gracefully', async () => {
  const checkupId = 'checkup-uuid';
  const checkupWithCorruptedImages = {
    ...mockCheckupWithDocs,
    documentation_images: [Buffer.from('corrupted-data')],
  };

  mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithCorruptedImages);
  // Mock image processing to throw error
  jest.spyOn(global, 'Buffer').mockImplementation(() => {
    throw new Error('Image decode failed');
  });

  const response = await getCheckupDocumentation(checkupId, mockSession);

  expect(response.status).toBe(200);
  // Should handle error gracefully, show placeholder or skip corrupted images
});
```

#### Test Case 7: Database Query Failure

**Test Name:** `should handle database query failure`

**Description:** Verifies that database query errors are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Database query fails

**Expected Output:**
- HTTP 500 status code
- Error message: "Unable to load documentation"
- Empty documentation panel

**Mock Setup:**
```typescript
mockPrisma.checkup.findUnique.mockRejectedValue(
  new Error('Query execution failed')
);
```

**Assertions:**
- Query error caught
- Response status is 500
- Error logged

---

### Edge Cases

#### Test Case 8: Maximum Number of Images

**Test Name:** `should handle checkup with maximum number of images (10)`

**Description:** Verifies that checkups with maximum images (10) are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Checkup has 10 images

**Expected Output:**
- HTTP 200 status code
- All 10 images returned
- Response time acceptable

**Mock Setup:**
```typescript
const checkupWithMaxImages = {
  ...mockCheckupWithDocs,
  documentation_images: Array.from({ length: 10 }, (_, i) =>
    Buffer.from(`image-data-${i}`)
  ),
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithMaxImages);
```

**Assertions:**
- All 10 images returned
- Response status is 200
- Performance acceptable

**Test Implementation:**
```typescript
describe('View Documentation - Edge Cases', () => {
  test('should handle checkup with maximum number of images (10)', async () => {
    const checkupId = 'checkup-uuid';
    const checkupWithMaxImages = {
      ...mockCheckupWithDocs,
      documentation_images: Array.from({ length: 10 }, (_, i) =>
        Buffer.from(`image-data-${i}`)
      ),
    };

    mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithMaxImages);

    const response = await getCheckupDocumentation(checkupId, mockSession);

    expect(response.status).toBe(200);
    expect(response.body.documentation.images).toHaveLength(10);
  });
});
```

#### Test Case 9: Large Image Data

**Test Name:** `should handle large image data (up to 5 MB per image)`

**Description:** Verifies that large images (up to 5 MB) are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Images up to 5 MB each

**Expected Output:**
- HTTP 200 status code
- Large images returned
- Response time acceptable (< 200ms per image)

**Mock Setup:**
```typescript
const largeImage = Buffer.alloc(5 * 1024 * 1024, 'a'); // 5 MB
const checkupWithLargeImages = {
  ...mockCheckupWithDocs,
  documentation_images: [largeImage],
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithLargeImages);
```

**Assertions:**
- Large images handled
- Response time meets performance requirement
- Response status is 200

#### Test Case 10: Empty Images Array

**Test Name:** `should handle empty images array`

**Description:** Verifies that empty images arrays are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Images array is empty

**Expected Output:**
- HTTP 200 status code
- Empty images array returned
- Text description still returned if available

**Mock Setup:**
```typescript
const checkupWithEmptyImages = {
  ...mockCheckupWithDocs,
  documentation_images: [],
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithEmptyImages);
```

**Assertions:**
- Empty array returned
- Response status is 200

#### Test Case 11: Very Long Text Description

**Test Name:** `should handle very long text descriptions`

**Description:** Verifies that very long text descriptions are handled.

**Input Data:**
- Valid session
- Valid checkup ID
- Text description is very long (several KB)

**Expected Output:**
- HTTP 200 status code
- Full text returned
- Response time acceptable

**Mock Setup:**
```typescript
const longText = 'A'.repeat(10000); // 10 KB text
const checkupWithLongText = {
  ...mockCheckupWithDocs,
  documentation_text: longText,
};
mockPrisma.checkup.findUnique.mockResolvedValue(checkupWithLongText);
```

**Assertions:**
- Full text returned
- Response status is 200
- Performance acceptable

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear Prisma mock calls
- Reset session state
- Clear image processing mocks

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  mockPrisma.checkup.findUnique.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- view-documentation.test.ts
```

### Expected Results
- All happy path tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 2 seconds for full suite

## Coverage Goals

### Coverage Targets
- Documentation retrieval: 100% line coverage
- Image handling: 100% coverage
- Error handling: 100% error path coverage
- Data formatting: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

**Note:** Documentation retrieval may be part of the project details endpoint or a separate endpoint.

**Test Coverage:**
- ✅ Retrieve documentation successfully (200)
- ✅ Images only (200)
- ✅ Text only (200)
- ✅ No documentation (200)
- ✅ Checkup not found (404)
- ✅ Image load failure (200 with placeholder)
- ✅ Database errors (500)
- ✅ Maximum images (200)
- ✅ Large images (200)
- ✅ Empty images (200)
- ✅ Long text (200)

## Notes

- Documentation images are stored as BYTEA array in PostgreSQL
- Images are retrieved as binary data and may be base64 encoded for transmission
- Maximum 10 images per checkup
- Maximum 5 MB per image
- Image loading failures are handled gracefully (show placeholder, don't crash)
- Response time must be < 200ms per image (performance requirement)
- Empty documentation is not an error condition (valid state)
- Text descriptions can be very long (TEXT field in database)
- All database errors return generic messages to users
- Image decoding errors are logged server-side but don't expose details to users
