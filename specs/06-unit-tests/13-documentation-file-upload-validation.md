# Documentation File Upload Validation Tests

## Test ID: UT-13
## Test Name: Documentation File Upload Validation

## Description and Purpose
Test file upload validation including file type validation (JPEG, PNG, GIF, PDF), file size validation (max 10 MB), and filename sanitization.

## Function/Component Being Tested
- `validateFileUpload()` function
- `validateFileType()` function
- `validateFileSize()` function
- `sanitizeFileName()` function
- File upload service/controller

## Test Setup
- Mock file system operations
- Mock multer file upload middleware
- Test data: sample file objects with different types and sizes

## Test Cases

### Test Case 1: Valid File Upload - JPEG Image
**Type**: Positive Test

**Description**: Verify that JPEG image upload passes validation.

**Input Data**:
- File: JPEG image, 2 MB
- File type: "image/jpeg"
- File name: "photo.jpg"

**Expected Output**:
- File type validation passes
- File size validation passes
- Filename sanitization succeeds
- Returns: `{ valid: true, file: sanitizedFile }`

**Assertions**:
- File type "image/jpeg" is accepted
- File size is within limit
- Filename is sanitized
- Validation passes

**Mock Requirements**:
- Mock file object with JPEG MIME type
- Mock file size check

**Test Isolation Requirements**:
- No shared state

---

### Test Case 2: Valid File Upload - PNG Image
**Type**: Positive Test

**Description**: Verify that PNG image upload passes validation.

**Input Data**:
- File: PNG image, 1 MB
- File type: "image/png"
- File name: "image.png"

**Expected Output**:
- File type validation passes
- Returns: `{ valid: true }`

**Assertions**:
- File type "image/png" is accepted
- Validation passes

**Mock Requirements**:
- Mock file object with PNG MIME type

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Valid File Upload - GIF Image
**Type**: Positive Test

**Description**: Verify that GIF image upload passes validation.

**Input Data**:
- File: GIF image, 500 KB
- File type: "image/gif"
- File name: "animation.gif"

**Expected Output**:
- File type validation passes
- Returns: `{ valid: true }`

**Assertions**:
- File type "image/gif" is accepted
- Validation passes

**Mock Requirements**:
- Mock file object with GIF MIME type

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Valid File Upload - PDF Document
**Type**: Positive Test

**Description**: Verify that PDF document upload passes validation.

**Input Data**:
- File: PDF document, 3 MB
- File type: "application/pdf"
- File name: "document.pdf"

**Expected Output**:
- File type validation passes
- Returns: `{ valid: true }`

**Assertions**:
- File type "application/pdf" is accepted
- Validation passes

**Mock Requirements**:
- Mock file object with PDF MIME type

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Invalid File Type
**Type**: Negative Test

**Description**: Verify that unsupported file types are rejected.

**Input Data**:
- File: Word document, 1 MB
- File type: "application/msword"
- File name: "document.doc"

**Expected Output**:
- File type validation fails
- Error message: "File type not supported. Only JPEG, PNG, GIF, and PDF are allowed."
- Returns: `{ valid: false, error: "File type not supported. Only JPEG, PNG, GIF, and PDF are allowed." }`

**Assertions**:
- File type validation fails
- Unsupported type is rejected
- Error message matches specification

**Mock Requirements**:
- Mock file object with unsupported MIME type

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: File Size Exceeds Maximum
**Type**: Negative Test

**Description**: Verify that files exceeding 10 MB are rejected.

**Input Data**:
- File: JPEG image, 11 MB
- File type: "image/jpeg"
- File name: "large-photo.jpg"

**Expected Output**:
- File size validation fails
- Error message: "File size exceeds maximum limit of 10 MB."
- Returns: `{ valid: false, error: "File size exceeds maximum limit of 10 MB." }`

**Assertions**:
- File size validation fails
- File exceeding 10 MB is rejected
- Error message matches specification

**Mock Requirements**:
- Mock file object with size > 10 MB

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: File Size at Maximum Boundary
**Type**: Boundary Test

**Description**: Verify that files exactly at 10 MB are accepted.

**Input Data**:
- File: PDF document, 10 MB (exactly)
- File type: "application/pdf"
- File name: "document.pdf"

**Expected Output**:
- File size validation passes
- Returns: `{ valid: true }`

**Assertions**:
- File at maximum size is accepted
- Boundary condition is handled correctly

**Mock Requirements**:
- Mock file object with size = 10 MB

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: File Size Just Below Maximum
**Type**: Boundary Test

**Description**: Verify that files just below 10 MB are accepted.

**Input Data**:
- File: JPEG image, 9.99 MB
- File type: "image/jpeg"
- File name: "photo.jpg"

**Expected Output**:
- File size validation passes
- Returns: `{ valid: true }`

**Assertions**:
- File below maximum size is accepted
- Boundary condition is handled correctly

**Mock Requirements**:
- Mock file object with size < 10 MB

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Filename Sanitization - Special Characters
**Type**: Positive Test

**Description**: Verify that special characters in filenames are sanitized.

**Input Data**:
- File name: "../../../malicious<script>.jpg"
- File type: "image/jpeg"
- File size: 1 MB

**Expected Output**:
- Filename is sanitized
- Path traversal attempts are removed
- Special characters are removed or escaped
- Returns: `{ valid: true, sanitizedFileName: "malicious.jpg" }`

**Assertions**:
- Path traversal characters (../) are removed
- Script tags are removed
- Filename is sanitized safely
- Sanitized filename is safe for filesystem

**Mock Requirements**:
- Mock file object with malicious filename
- Verify sanitization logic

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Filename Sanitization - Unicode Characters
**Type**: Positive Test

**Description**: Verify that Unicode characters in filenames are handled.

**Input Data**:
- File name: "фото-图片-صورة.jpg"
- File type: "image/jpeg"
- File size: 1 MB

**Expected Output**:
- Filename is sanitized or preserved (depending on policy)
- Returns: `{ valid: true, sanitizedFileName: ... }`

**Assertions**:
- Unicode characters are handled appropriately
- Filename is safe for filesystem
- No errors thrown

**Mock Requirements**:
- Mock file object with Unicode filename

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Filename Sanitization - Empty Filename
**Type**: Boundary Test

**Description**: Verify that empty filenames are handled.

**Input Data**:
- File name: ""
- File type: "image/jpeg"
- File size: 1 MB

**Expected Output**:
- Filename validation fails or default name is generated
- Returns: `{ valid: false, error: "Filename is required." }` or generates default

**Assertions**:
- Empty filename is handled
- Either rejected or default name is generated

**Mock Requirements**:
- Mock file object with empty filename

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: File Upload - Missing File
**Type**: Negative Test (Boundary)

**Description**: Verify that missing file is handled.

**Input Data**:
- File: null or undefined

**Expected Output**:
- File validation fails
- Error message: "File is required."
- Returns: `{ valid: false, error: "File is required." }`

**Assertions**:
- Missing file is detected
- Validation fails
- Error message is clear

**Mock Requirements**:
- No file object provided

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: File Upload - Zero Size File
**Type**: Boundary Test

**Description**: Verify that zero-size files are handled.

**Input Data**:
- File: Empty file, 0 bytes
- File type: "image/jpeg"
- File name: "empty.jpg"

**Expected Output**:
- File size validation either accepts or rejects zero-size file
- Returns appropriate result

**Assertions**:
- Zero-size file is handled
- Either accepted or rejected based on business rule

**Mock Requirements**:
- Mock file object with 0 bytes

**Test Isolation Requirements**:
- No shared state

---

### Test Case 14: File Upload - MIME Type Validation
**Type**: Positive Test

**Description**: Verify that MIME type is validated correctly (not just file extension).

**Input Data**:
- File: Actual JPEG image but with .pdf extension
- File type: "image/jpeg" (correct MIME type)
- File name: "image.pdf"

**Expected Output**:
- MIME type validation uses actual MIME type, not extension
- Validation passes (MIME type is correct)
- Returns: `{ valid: true }`

**Assertions**:
- MIME type validation uses file MIME type, not extension
- Extension mismatch doesn't cause rejection if MIME type is correct

**Mock Requirements**:
- Mock file object with correct MIME type but different extension

**Test Isolation Requirements**:
- No shared state

---

### Test Case 15: File Upload - Multiple Validation Errors
**Type**: Negative Test

**Description**: Verify that all validation errors are collected and returned.

**Input Data**:
- File: Word document, 15 MB
- File type: "application/msword"
- File name: "../../malicious.doc"

**Expected Output**:
- Multiple validation errors are collected
- Returns: `{ valid: false, errors: ["File type not supported...", "File size exceeds...", "Invalid filename..."] }`

**Assertions**:
- All validation errors are collected
- Error messages are clear
- Multiple failures are reported

**Mock Requirements**:
- Mock file object with multiple validation failures

**Test Isolation Requirements**:
- No shared state
