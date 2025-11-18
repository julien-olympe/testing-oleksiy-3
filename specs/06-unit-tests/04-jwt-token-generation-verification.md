# JWT Token Generation and Verification Tests

## Test ID: UT-04
## Test Name: JWT Token Generation and Verification

## Description and Purpose
Test JWT token generation and verification functionality. Verify that tokens are generated correctly with proper payload, expiration, and signature, and that token verification works as expected.

## Function/Component Being Tested
- `generateToken()` function
- `verifyToken()` function
- `decodeToken()` function
- JWT service using fastify-jwt

## Test Setup
- Mock fastify-jwt plugin
- Mock JWT sign and verify methods
- Test data: sample user data, token payloads

## Test Cases

### Test Case 1: Token Generation with User Data
**Type**: Positive Test

**Description**: Verify that JWT token is generated with correct user data in payload.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Username: "john_doe"
- Email: "john.doe@example.com"

**Expected Output**:
- JWT token is generated
- Token contains user ID, username, and email in payload
- Token has expiration set to 7 days
- Returns JWT token string

**Assertions**:
- `jwt.sign()` is called with payload containing user data
- Token expiration is set to 7 days (604800 seconds)
- Token is signed with secret key from environment
- Returns valid JWT token string

**Mock Requirements**:
- Mock `jwt.sign()` to return JWT token string
- Verify payload contains: `{ userId, username, email, iat, exp }`
- Verify expiration time is 7 days from now

**Test Isolation Requirements**:
- No shared state
- Mock time to ensure consistent expiration times

---

### Test Case 2: Token Verification - Valid Token
**Type**: Positive Test

**Description**: Verify that valid JWT token is verified successfully.

**Input Data**:
- JWT Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDYwNDgwMH0.signature"

**Expected Output**:
- Token is verified successfully
- Decoded payload is returned
- Returns: `{ valid: true, payload: { userId, username, email, iat, exp } }`

**Assertions**:
- `jwt.verify()` is called with token and secret
- Token verification succeeds
- Decoded payload contains expected user data
- Token is not expired

**Mock Requirements**:
- Mock `jwt.verify()` to return decoded payload
- Mock current time to ensure token is not expired

**Test Isolation Requirements**:
- No shared state
- Mock time for consistent expiration checks

---

### Test Case 3: Token Verification - Expired Token
**Type**: Negative Test

**Description**: Verify that expired JWT token is rejected.

**Input Data**:
- Expired JWT Token: Token with expiration in the past

**Expected Output**:
- Token verification fails
- Error: "Token expired"
- Returns: `{ valid: false, error: "Token expired" }`

**Assertions**:
- `jwt.verify()` is called
- Token expiration check fails
- Error indicates token is expired
- Token is rejected

**Mock Requirements**:
- Mock `jwt.verify()` to throw expiration error
- Mock current time to be after token expiration

**Test Isolation Requirements**:
- No shared state
- Mock time to simulate expired token

---

### Test Case 4: Token Verification - Invalid Signature
**Type**: Negative Test

**Description**: Verify that token with invalid signature is rejected.

**Input Data**:
- JWT Token with invalid signature: Token signed with wrong secret

**Expected Output**:
- Token verification fails
- Error: "Invalid token signature"
- Returns: `{ valid: false, error: "Invalid token signature" }`

**Assertions**:
- `jwt.verify()` is called
- Signature verification fails
- Error indicates invalid signature
- Token is rejected

**Mock Requirements**:
- Mock `jwt.verify()` to throw signature verification error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 5: Token Verification - Malformed Token
**Type**: Negative Test

**Description**: Verify that malformed JWT token is rejected.

**Input Data**:
- Malformed Token: "not.a.valid.jwt.token"

**Expected Output**:
- Token verification fails
- Error: "Invalid token format"
- Returns: `{ valid: false, error: "Invalid token format" }`

**Assertions**:
- `jwt.verify()` is called
- Token parsing fails
- Error indicates malformed token
- Token is rejected

**Mock Requirements**:
- Mock `jwt.verify()` to throw token parsing error

**Test Isolation Requirements**:
- No shared state

---

### Test Case 6: Token Verification - Missing Token
**Type**: Negative Test (Boundary)

**Description**: Verify that missing token is handled correctly.

**Input Data**:
- Token: null or undefined

**Expected Output**:
- Token verification fails
- Error: "Token is required"
- Returns: `{ valid: false, error: "Token is required" }`

**Assertions**:
- Token validation fails before verification
- Error indicates missing token
- No JWT verification is attempted

**Mock Requirements**:
- No JWT mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 7: Token Generation - Missing User Data
**Type**: Negative Test

**Description**: Verify that token generation fails when required user data is missing.

**Input Data**:
- User ID: null
- Username: "john_doe"
- Email: "john.doe@example.com"

**Expected Output**:
- Token generation fails
- Error: "User ID is required for token generation"
- Throws error or returns error object

**Assertions**:
- User data validation fails
- Token generation is not attempted
- Error indicates missing required data

**Mock Requirements**:
- No JWT mocks needed (validation fails first)

**Test Isolation Requirements**:
- No shared state

---

### Test Case 8: Token Payload Structure
**Type**: Positive Test

**Description**: Verify that token payload contains all required fields.

**Input Data**:
- User ID: "550e8400-e29b-41d4-a716-446655440000"
- Username: "john_doe"
- Email: "john.doe@example.com"

**Expected Output**:
- Token payload contains: userId, username, email, iat (issued at), exp (expiration)

**Assertions**:
- Token payload includes userId
- Token payload includes username
- Token payload includes email
- Token payload includes iat (issued at timestamp)
- Token payload includes exp (expiration timestamp)

**Mock Requirements**:
- Mock `jwt.sign()` and verify payload structure
- Mock time for consistent timestamps

**Test Isolation Requirements**:
- No shared state

---

### Test Case 9: Token Expiration Configuration
**Type**: Configuration Test

**Description**: Verify that token expiration is configured to 7 days as per specification.

**Input Data**:
- User data for token generation

**Expected Output**:
- Token expiration is set to 7 days (604800 seconds) from issue time

**Assertions**:
- Token expiration time is exactly 7 days from issue time
- Expiration configuration matches specification

**Mock Requirements**:
- Mock `jwt.sign()` and verify expiration time
- Mock time to calculate exact expiration

**Test Isolation Requirements**:
- No shared state

---

### Test Case 10: Token Secret Key Usage
**Type**: Security Test

**Description**: Verify that token is signed with secret key from environment variables.

**Input Data**:
- User data for token generation

**Expected Output**:
- Token is signed using secret key from environment

**Assertions**:
- `jwt.sign()` is called with secret key from environment variables
- Secret key is not hardcoded
- Secret key is used for both signing and verification

**Mock Requirements**:
- Mock `jwt.sign()` and verify secret key usage
- Mock environment variables

**Test Isolation Requirements**:
- No shared state

---

### Test Case 11: Token Decode Without Verification
**Type**: Positive Test

**Description**: Verify that token can be decoded to extract payload without verification (for inspection purposes).

**Input Data**:
- JWT Token: Valid token string

**Expected Output**:
- Token is decoded successfully
- Payload is extracted
- Returns decoded payload without verification

**Assertions**:
- `jwt.decode()` is called (if separate decode function exists)
- Decoded payload is returned
- No verification is performed

**Mock Requirements**:
- Mock `jwt.decode()` to return payload

**Test Isolation Requirements**:
- No shared state

---

### Test Case 12: Token Refresh (if implemented)
**Type**: Positive Test (if applicable)

**Description**: Verify that token refresh functionality works (if token refresh is implemented).

**Input Data**:
- Expiring token (expires soon but not yet expired)

**Expected Output**:
- New token is generated with extended expiration
- Returns new JWT token

**Assertions**:
- Token refresh generates new token
- New token has extended expiration
- User data is preserved in new token

**Mock Requirements**:
- Mock `jwt.verify()` to return valid payload
- Mock `jwt.sign()` to return new token
- Mock time for expiration calculations

**Test Isolation Requirements**:
- No shared state

---

### Test Case 13: Token Verification Error Handling
**Type**: Error Handling Test

**Description**: Verify that token verification errors are properly handled and don't expose internal details.

**Input Data**:
- Invalid token causing verification error

**Expected Output**:
- Error is caught and handled
- Generic error message is returned (no internal JWT library details exposed)
- Returns: `{ valid: false, error: "Invalid token" }`

**Assertions**:
- JWT verification errors are caught
- Error messages are sanitized (no stack traces or internal details)
- User-friendly error message is returned

**Mock Requirements**:
- Mock `jwt.verify()` to throw various JWT errors
- Verify error handling and message sanitization

**Test Isolation Requirements**:
- No shared state
