# Unit Test: Download PDF Report (Use Case 12)

## Test Overview

**Test Name:** Download PDF Report Tests  
**Purpose:** Test the functionality to provide the generated PDF report file to the user's browser for download.

**Component Being Tested:** 
- PDF download endpoint/handler
- HTTP response headers (Content-Type, Content-Disposition)
- File streaming
- Browser download handling

## Test Setup

### Prerequisites
- Mock PDF generation service configured
- Mock HTTP response object configured
- File streaming utilities available

### Mocking Strategy

**HTTP Response Mocking:**
```typescript
const mockReply = {
  code: jest.fn().mockReturnThis(),
  header: jest.fn().mockReturnThis(),
  type: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
};
```

**PDF Buffer Mocking:**
```typescript
const mockPDFBuffer = Buffer.from('fake-pdf-content');
```

### Test Data

**Mock PDF Data:**
```typescript
const mockPDFData = {
  buffer: Buffer.from('fake-pdf-content'),
  filename: 'Project_project-uuid_WindFarmAlpha_2024-01-15.pdf',
  size: 1024 * 1024, // 1 MB
};
```

## Test Cases

### Happy Path Tests

#### Test Case 1: Download PDF Successfully

**Test Name:** `should download PDF file with correct headers when PDF is available`

**Description:** Verifies that PDF file is downloaded with correct HTTP headers.

**Input Data:**
- Generated PDF buffer
- Project ID, powerplant name, date for filename

**Expected Output:**
- HTTP 200 status code
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Project_[ProjectID]_[PowerplantName]_[Date].pdf"`
- PDF buffer streamed to response
- Browser triggers download

**Assertions:**
- Response status is 200
- Content-Type header set to `application/pdf`
- Content-Disposition header set with filename
- PDF buffer sent in response
- Filename format is correct

**Test Implementation:**
```typescript
describe('Download PDF Report - Happy Path', () => {
  test('should download PDF file with correct headers when PDF is available', async () => {
    const projectId = 'project-uuid';
    const powerplantName = 'Wind Farm Alpha';
    const date = '2024-01-15';
    const expectedFilename = `Project_${projectId}_${powerplantName}_${date}.pdf`;

    const response = await downloadPDFReport(
      mockPDFData.buffer,
      projectId,
      powerplantName,
      date,
      mockReply
    );

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.type).toHaveBeenCalledWith('application/pdf');
    expect(mockReply.header).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment; filename="${expectedFilename}"`
    );
    expect(mockReply.send).toHaveBeenCalledWith(mockPDFData.buffer);
  });
});
```

#### Test Case 2: Filename Format

**Test Name:** `should generate correct filename format`

**Description:** Verifies that PDF filename follows the correct format.

**Input Data:**
- Project ID: `project-uuid`
- Powerplant name: `Wind Farm Alpha`
- Date: `2024-01-15`

**Expected Output:**
- Filename: `Project_project-uuid_WindFarmAlpha_2024-01-15.pdf`
- Special characters in powerplant name sanitized (spaces replaced with underscores)

**Assertions:**
- Filename format matches pattern
- Special characters handled correctly
- File extension is `.pdf`

**Test Implementation:**
```typescript
test('should generate correct filename format', () => {
  const projectId = 'project-uuid';
  const powerplantName = 'Wind Farm Alpha';
  const date = '2024-01-15';
  const expectedFilename = 'Project_project-uuid_WindFarmAlpha_2024-01-15.pdf';

  const filename = generatePDFFilename(projectId, powerplantName, date);

  expect(filename).toBe(expectedFilename);
  expect(filename).toMatch(/^Project_.*_.*_\d{4}-\d{2}-\d{2}\.pdf$/);
});
```

---

### Error Condition Tests

#### Test Case 3: File Not Found

**Test Name:** `should handle missing PDF file gracefully`

**Description:** Verifies that missing PDF files are handled.

**Input Data:**
- PDF buffer is null or undefined
- PDF generation failed

**Expected Output:**
- HTTP 404 status code (Not Found)
- Error message: "Report file not available"
- Download not triggered

**Mock Setup:**
```typescript
const nullPDFBuffer = null;
```

**Assertions:**
- Null buffer detected
- Response status is 404
- Error message returned

**Test Implementation:**
```typescript
describe('Download PDF Report - Error Conditions', () => {
  test('should handle missing PDF file gracefully', async () => {
    const projectId = 'project-uuid';
    const nullPDFBuffer = null;

    const response = await downloadPDFReport(
      nullPDFBuffer,
      projectId,
      'Wind Farm Alpha',
      '2024-01-15',
      mockReply
    );

    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('not available'),
      })
    );
  });
});
```

#### Test Case 4: Network Error

**Test Name:** `should handle network errors during download`

**Description:** Verifies that network errors are handled (client-side, but test server response).

**Input Data:**
- PDF buffer available
- Network connection lost during streaming

**Expected Output:**
- Browser displays download failure
- Server may return error if detected

**Assertions:**
- Network errors handled gracefully
- User notified of failure

#### Test Case 5: Browser Download Support

**Test Name:** `should handle browsers that do not support download`

**Description:** Verifies that unsupported browsers are handled.

**Input Data:**
- PDF buffer available
- Browser doesn't support download attribute

**Expected Output:**
- HTTP 200 status code
- PDF displayed in browser or download dialog
- Message: "Please enable downloads in your browser" (if applicable)

**Assertions:**
- Download attempted
- Fallback behavior if download not supported

---

### Edge Cases

#### Test Case 6: Large PDF File

**Test Name:** `should handle large PDF files (up to 25 MB)`

**Description:** Verifies that large PDF files are handled efficiently.

**Input Data:**
- PDF buffer up to 25 MB

**Expected Output:**
- HTTP 200 status code
- Large file streamed successfully
- Download initiated
- Response time acceptable

**Mock Setup:**
```typescript
const largePDFBuffer = Buffer.alloc(25 * 1024 * 1024, 'a'); // 25 MB
```

**Assertions:**
- Large file handled
- Streaming works correctly
- Response status is 200

**Test Implementation:**
```typescript
describe('Download PDF Report - Edge Cases', () => {
  test('should handle large PDF files (up to 25 MB)', async () => {
    const projectId = 'project-uuid';
    const largePDFBuffer = Buffer.alloc(25 * 1024 * 1024, 'a'); // 25 MB

    const response = await downloadPDFReport(
      largePDFBuffer,
      projectId,
      'Wind Farm Alpha',
      '2024-01-15',
      mockReply
    );

    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(largePDFBuffer);
  });
});
```

#### Test Case 7: Special Characters in Powerplant Name

**Test Name:** `should sanitize special characters in powerplant name for filename`

**Description:** Verifies that special characters in powerplant names are sanitized for filenames.

**Input Data:**
- Powerplant name: `Wind Farm (Alpha) - Site 1`
- Special characters: `()`, `-`, spaces

**Expected Output:**
- Filename sanitized: `WindFarmAlphaSite1` or similar
- Invalid filename characters removed or replaced

**Assertions:**
- Special characters sanitized
- Filename is valid for filesystem
- No invalid characters in filename

**Test Implementation:**
```typescript
test('should sanitize special characters in powerplant name for filename', () => {
  const projectId = 'project-uuid';
  const powerplantName = 'Wind Farm (Alpha) - Site 1';
  const date = '2024-01-15';

  const filename = generatePDFFilename(projectId, powerplantName, date);

  expect(filename).not.toContain('(');
  expect(filename).not.toContain(')');
  expect(filename).not.toContain(' - ');
  expect(filename).toMatch(/^Project_.*_.*_\d{4}-\d{2}-\d{2}\.pdf$/);
});
```

#### Test Case 8: Very Long Powerplant Name

**Test Name:** `should handle very long powerplant names in filename`

**Description:** Verifies that very long powerplant names are truncated or handled.

**Input Data:**
- Powerplant name: Very long name (200+ characters)

**Expected Output:**
- Filename truncated or abbreviated
- Filename remains valid
- Total filename length within filesystem limits

**Assertions:**
- Long names handled
- Filename remains valid
- No filesystem errors

#### Test Case 9: Concurrent Downloads

**Test Name:** `should handle concurrent PDF downloads`

**Description:** Verifies that multiple simultaneous downloads are handled.

**Input Data:**
- Multiple PDF download requests

**Expected Output:**
- All downloads succeed
- No conflicts or errors

**Assertions:**
- Concurrent requests handled
- Each download independent
- No resource conflicts

---

## Test Cleanup

### Cleanup Steps
- Reset all mocks between tests
- Clear HTTP response mocks
- Clear PDF buffer references

### Cleanup Implementation
```typescript
afterEach(() => {
  jest.clearAllMocks();
  mockReply.code.mockReset();
  mockReply.header.mockReset();
  mockReply.type.mockReset();
  mockReply.send.mockReset();
});
```

## Test Execution

### Running the Test
```bash
npm test -- download-pdf-report.test.ts
```

### Expected Results
- All happy path tests pass
- All error condition tests pass
- All edge case tests pass
- Test execution time < 1 second for full suite

## Coverage Goals

### Coverage Targets
- PDF download handler: 100% line coverage
- Header setting: 100% coverage
- Filename generation: 100% coverage
- Error handling: 100% error path coverage
- File streaming: 100% coverage

### Coverage Exclusions
- None (all code paths should be tested)

## API Endpoint Coverage

**Note:** PDF download may be part of the finish project endpoint or a separate endpoint.

**Test Coverage:**
- ✅ Download PDF successfully (200)
- ✅ Correct filename format
- ✅ File not found (404)
- ✅ Network errors (handled)
- ✅ Browser support (200)
- ✅ Large files (25 MB)
- ✅ Special characters in filename
- ✅ Long powerplant names
- ✅ Concurrent downloads

## Notes

- PDF is generated in-memory and streamed directly to browser (no temporary file storage)
- Content-Type header must be `application/pdf`
- Content-Disposition header triggers browser download with filename
- Filename format: `Project_[ProjectID]_[PowerplantName]_[Date].pdf`
- Special characters in powerplant name must be sanitized for filename
- Maximum PDF size: 25 MB per report
- PDF download initiation must be < 100ms after generation (performance requirement)
- Browser download support is assumed (modern browsers)
- Network errors are primarily client-side but server should handle gracefully
- All errors return appropriate HTTP status codes and error messages
- PDF is not stored on server after download (generated on-demand)
