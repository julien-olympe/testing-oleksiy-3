# Documentation File Storage, Retrieval, and Deletion Tests

## Test ID: UT-14
## Test Name: Documentation File Storage, Retrieval, and Deletion

## Description and Purpose
Test file storage operations including file path generation, file metadata storage, file retrieval, and file deletion. Verify that files are stored securely and can be accessed correctly.

## Function/Component Being Tested
- `storeFile()` function
- `generateFilePath()` function
- `storeFileMetadata()` function
- `retrieveFile()` function
- `deleteFile()` function
- File storage service

## Test Setup
- Mock file system operations (fs module)
- Mock path operations
- Mock database for metadata storage
- Mock documentation repository
- Test data: sample files, file paths

## Test Cases

### Test Case 1: File Storage - Path Generation
**Type**: Positive Test

**Description**: Verify that file storage path is generated correctly using UUID.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Part ID: "cc0e8400-e29b-41d4-a716-446655440007"
- File: Valid JPEG image
- Generated UUID: "dd0e8400-e29b-41d4-a716-446655440008"

**Expected Output**:
- File path is generated: "storage/projects/{projectId}/parts/{partId}/{uuid}.jpg"
- Path uses UUID, not original filename
- Returns: `{ filePath: "storage/projects/.../uuid.jpg" }`

**Assertions**:
- File path is generated correctly
- Path uses UUID for security
- Path structure matches specification
- Original filename is not used in path

**Mock Requirements**:
- Mock UUID generation
- Mock path.join() operations
- Verify path structure

**Test Isolation Requirements**:
- No shared state

---

### Test Case 2: File Storage - Save to Filesystem
**Type**: Positive Test

**Description**: Verify that file is saved to filesystem correctly.

**Input Data**:
- File: Valid JPEG image, 2 MB
- File path: "storage/projects/.../uuid.jpg"

**Expected Output**:
- File is written to filesystem
- File content is preserved
- Returns: `{ success: true, filePath: "..." }`

**Assertions**:
- `fs.writeFile()` or similar is called with correct path
- File content is written correctly
- File is saved successfully

**Mock Requirements**:
- Mock `fs.writeFile()` to succeed
- Verify file write operation

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: File Storage - Metadata Storage
**Type**: Positive Test

**Description**: Verify that file metadata is stored in database.

**Input Data**:
- File: Valid PDF, 3 MB
- Part ID: "cc0e8400-e29b-41d4-a716-446655440007"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- File path: "storage/projects/.../uuid.pdf"
- Original filename: "document.pdf"

**Expected Output**:
- Documentation record is created in database
- Record contains: part_id, project_id, file_path, file_type, file_name, file_size, description
- Returns: `{ success: true, documentation: documentationRecord }`

**Assertions**:
- `documentationRepository.create()` is called
- All metadata fields are saved
- File path is stored
- Original filename is stored
- File size is stored

**Mock Requirements**:
- Mock `documentationRepository.create()` to return created record
- Verify all metadata fields

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: File Retrieval - Valid File
**Type**: Positive Test

**Description**: Verify that stored file can be retrieved correctly.

**Input Data**:
- Documentation ID: "ee0e8400-e29b-41d4-a716-446655440009"
- File path: "storage/projects/.../uuid.jpg"

**Expected Output**:
- File is read from filesystem
- File content is returned
- Returns: `{ success: true, file: fileBuffer, metadata: documentationRecord }`

**Assertions**:
- `documentationRepository.findById()` is called
- File path is retrieved from database
- `fs.readFile()` is called with correct path
- File content is returned

**Mock Requirements**:
- Mock `documentationRepository.findById()` to return documentation record
- Mock `fs.readFile()` to return file buffer

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: File Retrieval - File Not Found
**Type**: Negative Test

**Description**: Verify that missing file is handled correctly.

**Input Data**:
- Documentation ID: "ee0e8400-e29b-41d4-a716-446655440009"
- File does not exist on filesystem

**Expected Output**:
- File read fails
- Error message: "File not found."
- Returns: `{ success: false, error: "File not found." }`

**Assertions**:
- `fs.readFile()` throws file not found error
- Error is caught and handled
- Error message matches specification

**Mock Requirements**:
- Mock `documentationRepository.findById()` to return record
- Mock `fs.readFile()` to throw file not found error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: File Deletion - Valid File
**Type**: Positive Test

**Description**: Verify that file and metadata are deleted correctly.

**Input Data**:
- Documentation ID: "ee0e8400-e29b-41d4-a716-446655440009"
- File path: "storage/projects/.../uuid.jpg"

**Expected Output**:
- File is deleted from filesystem
- Documentation record is deleted from database
- Returns: `{ success: true }`

**Assertions**:
- `documentationRepository.findById()` is called
- `fs.unlink()` or `fs.rm()` is called to delete file
- `documentationRepository.delete()` is called
- Both file and metadata are deleted

**Mock Requirements**:
- Mock `documentationRepository.findById()` to return record
- Mock `fs.unlink()` to succeed
- Mock `documentationRepository.delete()` to succeed

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: File Deletion - File Not Found
**Type**: Error Handling Test

**Description**: Verify that deletion handles missing file gracefully.

**Input Data**:
- Documentation ID: "ee0e8400-e29b-41d4-a716-446655440009"
- File does not exist on filesystem

**Expected Output**:
- File deletion is attempted
- Error is handled gracefully (either succeeds idempotently or returns error)
- Metadata is still deleted
- Returns: `{ success: true }` or `{ success: false, error: "..." }`

**Assertions**:
- File deletion error is handled
- Operation is idempotent or error is returned
- Metadata deletion proceeds

**Mock Requirements**:
- Mock `fs.unlink()` to throw file not found error
- Verify error handling

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: File Storage - Disk Space Error
**Type**: Error Handling Test

**Description**: Verify that disk space errors are handled.

**Input Data**:
- File: Large file, 9 MB
- Disk is full

**Expected Output**:
- Disk space error is caught
- Error message: "Storage limit reached. Please contact administrator."
- Returns: `{ success: false, error: "Storage limit reached. Please contact administrator." }`

**Assertions**:
- Disk space error is caught
- Error message matches specification
- Error is handled gracefully

**Mock Requirements**:
- Mock `fs.writeFile()` to throw disk space error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: File Storage - Permission Error
**Type**: Error Handling Test

**Description**: Verify that file permission errors are handled.

**Input Data**:
- File: Valid file
- Insufficient filesystem permissions

**Expected Output**:
- Permission error is caught
- Error message: "File upload failed. Please try again."
- Returns: `{ success: false, error: "File upload failed. Please try again." }`

**Assertions**:
- Permission error is caught
- Error is handled gracefully
- Error message is appropriate

**Mock Requirements**:
- Mock `fs.writeFile()` to throw permission error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: File Storage - Maximum Files Per Part
**Type**: Boundary Test

**Description**: Verify that maximum files per part (20 files) is enforced.

**Input Data**:
- Part ID: "cc0e8400-e29b-41d4-a716-446655440007"
- Part already has 20 files
- Attempting to upload 21st file

**Expected Output**:
- File count validation fails
- Error message: "Maximum 20 files allowed per part."
- Returns: `{ success: false, error: "Maximum 20 files allowed per part." }`

**Assertions**:
- File count is checked before upload
- Maximum limit is enforced
- Error message is clear

**Mock Requirements**:
- Mock `documentationRepository.countByPartId()` to return 20
- Verify file count check

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: File Storage - Maximum Project Storage
**Type**: Boundary Test

**Description**: Verify that maximum project storage (500 MB) is enforced.

**Input Data**:
- Project ID: "880e8400-e29b-41d4-a716-446655440003"
- Project already has 495 MB of files
- Attempting to upload 10 MB file (would exceed 500 MB)

**Expected Output**:
- Storage limit validation fails
- Error message: "Storage limit reached. Please contact administrator."
- Returns: `{ success: false, error: "Storage limit reached. Please contact administrator." }`

**Assertions**:
- Project storage size is calculated
- Maximum limit is enforced
- Error message matches specification

**Mock Requirements**:
- Mock `documentationRepository.getTotalSizeByProjectId()` to return 495 MB
- Verify storage limit check

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: File Retrieval - Access Control
**Type**: Security Test

**Description**: Verify that file retrieval verifies project ownership.

**Input Data**:
- Documentation ID: "ee0e8400-e29b-41d4-a716-446655440009"
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Project belongs to different user

**Expected Output**:
- Project ownership verification fails
- File retrieval is denied
- Error message: "You do not have permission to access this file."
- Returns: `{ success: false, error: "You do not have permission to access this file." }`

**Assertions**:
- Project ownership is verified before file retrieval
- Unauthorized access is denied
- File is not read

**Mock Requirements**:
- Mock `documentationRepository.findById()` to return documentation
- Mock `projectRepository.findById()` to return project with different user_id

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: File Path Security - Path Traversal Prevention
**Type**: Security Test

**Description**: Verify that file paths cannot be manipulated for path traversal attacks.

**Input Data**:
- Attempted file path: "../../../etc/passwd"
- Project ID: "880e8400-e29b-41d4-a716-446655440003"

**Expected Output**:
- Path traversal is prevented
- File path is normalized to safe path
- Returns safe file path

**Assertions**:
- Path traversal attempts are blocked
- File path is normalized
- Path stays within storage directory

**Mock Requirements**:
- Mock path operations
- Verify path normalization

**Test Isolation Requirements**:
- No shared state

---

### Test Case 14: File Storage - Transaction Atomicity
**Type**: Positive Test

**Description**: Verify that file storage and metadata storage are atomic.

**Input Data**:
- File: Valid file
- Metadata storage will fail

**Expected Output**:
- File write succeeds but metadata fails
- File is deleted (rollback)
- Transaction is rolled back
- Returns: `{ success: false, error: "File upload failed. Please try again." }`

**Assertions**:
- File and metadata operations are in transaction
- Rollback occurs on failure
- No orphaned files remain

**Mock Requirements**:
- Mock `fs.writeFile()` to succeed
- Mock `documentationRepository.create()` to fail
- Mock `fs.unlink()` for rollback
- Verify transaction handling

**Test Isolation Requirements**:
- No shared state

---

### Test Case 15: File Retrieval Performance
**Type**: Performance Test

**Description**: Verify that file retrieval is performant.

**Input Data**:
- Documentation ID for file retrieval

**Expected Output**:
- File is retrieved
- Response time < 500ms (per specification)

**Assertions**:
- File retrieval completes within time limit
- Performance meets specification

**Mock Requirements**:
- Mock file operations with performance verification

**Test Isolation Requirements**:
- No shared state
