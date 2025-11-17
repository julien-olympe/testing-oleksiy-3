# 4. Development Constraints (continued)

## 4.2 Security

### 4.2.1 Command Restrictions

**Server-Side Command Execution:**
- No execution of user-provided commands or shell scripts
- No dynamic code evaluation (eval(), Function constructor) with user input
- No system command execution (child_process.exec(), child_process.spawn()) with user input
- File system operations limited to application-controlled paths, no user-specified file paths
- Database queries use parameterized statements only, no string concatenation for SQL

**File System Access:**
- Read access: Only application files, database connection files, and configuration files
- Write access: Only application logs and temporary files in designated directories
- No access to system directories, user home directories, or arbitrary file paths
- File uploads: Not supported in current version (images stored in database, not file system)

**Network Access:**
- Outbound connections: Only to PostgreSQL database and external services explicitly configured
- No arbitrary URL fetching or HTTP requests to user-specified endpoints
- CORS: Restricted to specific allowed origins (configured in @fastify/cors)
- No proxy or tunnel creation

### 4.2.2 Access Control

**Authentication:**
- All API endpoints except /api/auth/register and /api/auth/login require valid session
- Session validation: Middleware checks session token on every authenticated request
- Session expiration: 24 hours of inactivity, session invalidated on logout
- Session storage: Secure session cookies with HttpOnly, Secure, and SameSite=Strict flags

**Authorization:**
- User isolation: Users can only access projects where project.user_id matches authenticated user_id
- Project access: Verify user_id before allowing project read, update, or finish operations
- Powerplant access: All authenticated users can view powerplant list (read-only)
- Admin functions: Not implemented in current version (no admin role or elevated permissions)

**Role-Based Access Control:**
- Current implementation: Single user role (no role differentiation)
- All authenticated users have same permissions: create projects, update own projects, view own projects

**API Endpoint Protection:**
- Public endpoints: POST /api/auth/register, POST /api/auth/login
- Protected endpoints: All other /api/* endpoints require valid session
- Unauthenticated requests: Return HTTP 401 (Unauthorized), redirect to login screen
- CSRF protection: SameSite cookie attribute prevents cross-site request forgery

### 4.2.3 Password Usage and Storage

**Password Requirements:**
- Minimum length: 8 characters
- No maximum length enforced (practical limit: 128 characters)
- No complexity requirements (letters, numbers, special characters not enforced)
- Password confirmation: Must match password field exactly

**Password Hashing:**
- Algorithm: bcrypt with salt rounds: 10
- Implementation: bcrypt.hash(password, 10) for hashing, bcrypt.compare(password, hash) for verification
- Storage: Only password hash stored in database, never plain text passwords
- Password transmission: HTTPS required for all password transmission (login, registration)

**Password Security:**
- Password reset: Not implemented in current version
- Password change: Not implemented in current version
- Password history: Not maintained (no previous password tracking)
- Account lockout: Not implemented (no lockout after failed login attempts, rate limiting applied instead)

**Session Security:**
- Session token: Cryptographically random token, 32 bytes length
- Token storage: Stored in secure HTTP-only cookie, not accessible via JavaScript
- Token expiration: 24 hours from last activity, refreshed on each authenticated request
- Token invalidation: Immediate invalidation on logout

### 4.2.4 Input Validation and Sanitization

**Input Validation:**
- All user input validated using Zod schemas before processing
- Validation rules:
  - Username: 3-50 characters, alphanumeric and underscore only
  - Email: Valid email format, 5-255 characters
  - Password: 8-128 characters, any characters allowed
  - Status values: Enum validation (bad, average, good only)
  - Project status: Enum validation (In Progress, Finished only)
  - UUIDs: Valid UUID format for all ID parameters

**SQL Injection Prevention:**
- All database queries use Prisma ORM with parameterized queries
- No raw SQL queries with string concatenation
- User input never directly inserted into SQL statements
- Prisma automatically escapes and parameterizes all queries

**XSS (Cross-Site Scripting) Prevention:**
- All user-generated content escaped before rendering in HTML
- React automatically escapes content in JSX (prevents XSS)
- No innerHTML or dangerouslySetInnerHTML with user input
- Content Security Policy (CSP) headers: script-src 'self', object-src 'none'

**Data Sanitization:**
- Username: Trimmed, lowercased before storage
- Email: Trimmed, lowercased before storage
- Text fields: HTML input is not allowed, plain text only. All user input in text fields is treated as plain text and stored as-is without HTML processing.
- File uploads: Not supported (images stored as binary in database)

### 4.2.5 Data Protection

**Data Encryption:**
- Data in transit: HTTPS/TLS 1.2 or higher for all client-server communication
- Data at rest: Database encryption at filesystem level (PostgreSQL tablespace encryption, if configured)
- Password hashes: Bcrypt provides one-way hashing (not encryption, but secure)

**Sensitive Data Handling:**
- Passwords: Never logged, never returned in API responses, never stored in plain text
- Session tokens: Never logged in plain text, only session ID logged
- User data: Only accessible to authenticated user who owns the data
- Error messages: No sensitive information (database errors, file paths, stack traces) exposed to users

**Data Privacy:**
- User data: Stored only for application functionality, no sharing with third parties
- Logs: User IDs and usernames logged for audit trail, no passwords or sensitive data
- Backup: Database backups encrypted, access restricted to administrators

### 4.2.6 Security Headers

**HTTP Security Headers:**
- Content-Security-Policy: default-src 'self', script-src 'self', style-src 'self' 'unsafe-inline', img-src 'self' data:, font-src 'self'
- X-Content-Type-Options: nosniff (prevent MIME type sniffing)
- X-Frame-Options: DENY (prevent clickjacking)
- X-XSS-Protection: 1; mode=block (enable XSS filter)
- Strict-Transport-Security: max-age=31536000; includeSubDomains (force HTTPS)
- Referrer-Policy: strict-origin-when-cross-origin

**Cookie Security:**
- HttpOnly: true (prevent JavaScript access)
- Secure: true (HTTPS only, in production)
- SameSite: Strict (prevent CSRF attacks)
- Path: / (applies to all paths)
- Max-Age: 86400 seconds (24 hours)

### 4.2.7 Security Monitoring

**Audit Logging:**
- Authentication events: Login attempts (success and failure), logout events
- Authorization events: Access denied attempts, project access violations
- Data modification: Project creation, status updates, project completion
- Log format: Timestamp, user ID, action, resource, result (success/failure), IP address

**Security Alerts:**
- Failed login attempts: Alert if > 10 failures from same IP in 15 minutes
- Access violations: Alert on any unauthorized access attempt
- Error rate: Alert if error rate exceeds 1% of requests
- Unusual activity: Monitor for patterns (multiple projects created rapidly, bulk status updates)

**Vulnerability Management:**
- Dependency updates: Regular updates of npm packages for security patches
- Security scanning: Automated dependency vulnerability scanning (npm audit)
- Patch management: Critical security patches applied within 48 hours
- Version pinning: Exact versions specified in package-lock.json, updates require testing
