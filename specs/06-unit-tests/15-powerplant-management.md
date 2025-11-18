# Powerplant Management Tests

## Test ID: UT-15
## Test Name: Powerplant Management

## Description and Purpose
Test powerplant retrieval, parts retrieval, checkups retrieval, and powerplant data structure validation.

## Function/Component Being Tested
- `getPowerplant()` function
- `getPowerplantParts()` function
- `getPowerplantCheckups()` function
- `getPowerplantData()` function
- Powerplant service/repository

## Test Setup
- Mock database connection and query methods
- Mock powerplant repository methods
- Mock part repository methods
- Mock checkup repository methods
- Test data: sample powerplants, parts, checkups

## Test Cases

### Test Case 1: Retrieve Powerplant by ID
**Type**: Positive Test

**Description**: Verify that powerplant can be retrieved by ID.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"

**Expected Output**:
- Powerplant is retrieved
- Returns: `{ powerplant: { id, name, description, createdAt, updatedAt } }`

**Assertions**:
- `powerplantRepository.findById()` is called
- Powerplant object is returned
- All required fields are present

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to return powerplant object

**Test Isolation Requirements**:
- No shared state

---

### Test Case 2: Retrieve Powerplant - Not Found
**Type**: Negative Test

**Description**: Verify that non-existent powerplant returns error.

**Input Data**:
- Powerplant ID: "non-existent-powerplant-id"

**Expected Output**:
- Powerplant is not found
- Error message: "Powerplant not found."
- Returns: `{ success: false, error: "Powerplant not found." }`

**Assertions**:
- `powerplantRepository.findById()` is called
- Returns null or throws error
- Error message is clear

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to return null

**Test Isolation Requirements**:
- No shared state

---

### Test Case 3: Retrieve Parts for Powerplant
**Type**: Positive Test

**Description**: Verify that all parts for a powerplant are retrieved.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"
- Powerplant has 5 parts

**Expected Output**:
- All 5 parts are retrieved
- Returns: `{ parts: [part1, part2, part3, part4, part5] }`

**Assertions**:
- `partRepository.findByPowerplantId()` is called
- All parts are returned
- Each part has required fields

**Mock Requirements**:
- Mock `partRepository.findByPowerplantId()` to return array of parts

**Test Isolation Requirements**:
- No shared state

---

### Test Case 4: Retrieve Parts - Empty List
**Type**: Edge Case Test

**Description**: Verify that powerplant with no parts returns empty array.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"
- Powerplant has no parts

**Expected Output**:
- Empty array is returned
- Returns: `{ parts: [] }`

**Assertions**:
- `partRepository.findByPowerplantId()` is called
- Empty array is returned
- No errors thrown

**Mock Requirements**:
- Mock `partRepository.findByPowerplantId()` to return empty array

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Retrieve Checkups for Powerplant
**Type**: Positive Test

**Description**: Verify that all checkups for a powerplant are retrieved (through parts).

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"
- Powerplant has 3 parts, each with 2 checkups (total 6 checkups)

**Expected Output**:
- All 6 checkups are retrieved
- Returns: `{ checkups: [checkup1, checkup2, ..., checkup6] }`

**Assertions**:
- `checkupRepository.findByPowerplantId()` is called (or parts are retrieved and checkups aggregated)
- All checkups are returned
- Each checkup has required fields

**Mock Requirements**:
- Mock `checkupRepository.findByPowerplantId()` to return all checkups
- Or mock part and checkup repositories to return nested data

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Retrieve Complete Powerplant Data
**Type**: Positive Test

**Description**: Verify that complete powerplant data (with parts and checkups) is retrieved.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"

**Expected Output**:
- Powerplant, parts, and checkups are retrieved
- Data structure is properly nested
- Returns: `{ powerplant: { id, name, parts: [{ id, name, checkups: [{ id, name }] }] } }`

**Assertions**:
- Powerplant data is retrieved
- Parts are nested under powerplant
- Checkups are nested under parts
- Data structure is correct

**Mock Requirements**:
- Mock all repositories to return complete data
- Verify nested structure

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Powerplant Data Structure Validation
**Type**: Positive Test

**Description**: Verify that powerplant data structure matches specification.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"

**Expected Output**:
- Powerplant has: id (UUID), name (VARCHAR), description (TEXT), timestamps
- Parts have: id (UUID), powerplant_id (FK), name (VARCHAR), description (TEXT)
- Checkups have: id (UUID), part_id (FK), name (VARCHAR), description (TEXT)

**Assertions**:
- All required fields are present
- Data types match specification
- Foreign key relationships are correct

**Mock Requirements**:
- Mock repositories to return data matching specification

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Powerplant Retrieval Performance
**Type**: Performance Test

**Description**: Verify that powerplant retrieval is performant.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"

**Expected Output**:
- Powerplant data is retrieved
- Response time < 500ms (per specification)

**Assertions**:
- Query performance is acceptable
- Database indexes are used
- Response time meets specification

**Mock Requirements**:
- Mock repositories with performance verification

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Powerplant Retrieval - Database Error
**Type**: Error Handling Test

**Description**: Verify that database errors are handled.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"
- Database query fails

**Expected Output**:
- Database error is caught
- Error message: "Unable to load powerplant data. Please try again."
- Returns: `{ success: false, error: "Unable to load powerplant data. Please try again." }`

**Assertions**:
- Database error is caught
- Error is handled gracefully
- Error message is appropriate

**Mock Requirements**:
- Mock `powerplantRepository.findById()` to throw database error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Powerplant Parts - Foreign Key Validation
**Type**: Positive Test

**Description**: Verify that parts have valid foreign key references to powerplant.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"

**Expected Output**:
- All retrieved parts have powerplant_id matching powerplant ID
- Foreign key relationships are maintained

**Assertions**:
- All parts belong to the powerplant
- Foreign key integrity is maintained
- No orphaned parts

**Mock Requirements**:
- Mock `partRepository.findByPowerplantId()` to return parts with correct powerplant_id

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Powerplant Checkups - Foreign Key Validation
**Type**: Positive Test

**Description**: Verify that checkups have valid foreign key references to parts.

**Input Data**:
- Powerplant ID: "770e8400-e29b-41d4-a716-446655440002"

**Expected Output**:
- All retrieved checkups have part_id matching parts of the powerplant
- Foreign key relationships are maintained

**Assertions**:
- All checkups belong to parts of the powerplant
- Foreign key integrity is maintained
- No orphaned checkups

**Mock Requirements**:
- Mock repositories to return checkups with correct part_id references

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Powerplant Data - Large Powerplant
**Type**: Boundary Test

**Description**: Verify that large powerplants with many parts and checkups are handled.

**Input Data**:
- Powerplant ID with: 50 parts, 200 checkups

**Expected Output**:
- All data is retrieved
- Performance is acceptable
- No data loss

**Assertions**:
- All parts are retrieved
- All checkups are retrieved
- Performance is acceptable

**Mock Requirements**:
- Mock repositories to return large dataset
- Verify all data is included

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Powerplant List Retrieval (if applicable)
**Type**: Positive Test

**Description**: Verify that list of all powerplants can be retrieved (if this functionality exists).

**Input Data**:
- No specific input (retrieve all)

**Expected Output**:
- All powerplants are retrieved
- Returns: `{ powerplants: [powerplant1, powerplant2, ...] }`

**Assertions**:
- `powerplantRepository.findAll()` is called (if exists)
- All powerplants are returned
- Response time is acceptable

**Mock Requirements**:
- Mock `powerplantRepository.findAll()` to return array of powerplants

**Test Isolation Requirements**:
- No shared state
