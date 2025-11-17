# 4. Development Constraints

## 4.1 Reliability and Fault Tolerance

### 4.1.1 Abnormal Situations

**Database Connection Failures:**
- Situation: PostgreSQL database becomes unavailable or connection is lost
- Handling: Application catches connection errors, returns HTTP 503 (Service Unavailable) status
- User notification: Display error message "Database temporarily unavailable. Please try again in a few moments."
- Retry mechanism: Automatic retry with exponential backoff (3 attempts: 1s, 2s, 4s delays)
- Logging: Log all database connection failures with timestamp and error details to application logs

**Invalid User Input:**
- Situation: User submits invalid data (malformed email, short password, missing required fields)
- Handling: Server-side validation using Zod schemas, return HTTP 400 (Bad Request) with specific error messages
- User notification: Display validation errors inline below form fields or in error message area
- Prevention: Client-side validation provides immediate feedback before submission
- Logging: Log validation failures with user ID (if authenticated) and input type

**Authentication Failures:**
- Situation: Invalid credentials, expired session, or unauthorized access attempt
- Handling: Return HTTP 401 (Unauthorized) for invalid credentials, HTTP 403 (Forbidden) for unauthorized access
- User notification: Display "Invalid credentials" message for login failures, redirect to login for expired sessions
- Security: Log all authentication failures with IP address and timestamp for security monitoring
- Rate limiting: Limit login attempts to 5 per IP address per 15 minutes to prevent brute force attacks

**Project Access Violations:**
- Situation: User attempts to access project assigned to another user
- Handling: Verify user_id matches project.user_id before allowing access, return HTTP 403 (Forbidden)
- User notification: Display "Access denied" message, redirect to home screen
- Logging: Log all access violation attempts with user ID, project ID, and timestamp

**PDF Generation Failures:**
- Situation: PDF generation fails due to memory issues, missing data, or library errors
- Handling: Catch PDF generation errors, return HTTP 500 (Internal Server Error), do not mark project as Finished
- User notification: Display error message "Unable to generate report. Please try again or contact support."
- Retry: Allow user to retry PDF generation without data loss
- Logging: Log PDF generation failures with project ID, error details, and stack trace

**Image Loading Failures:**
- Situation: Image data corrupted, missing, or cannot be decoded
- Handling: Catch image decoding errors, display placeholder image or "Image unavailable" message
- User notification: Silent failure for individual images, documentation panel shows available images
- Logging: Log image loading failures with checkup ID and error type

**Network Timeouts:**
- Situation: API request exceeds 30-second timeout or network connection is lost
- Handling: Return HTTP 504 (Gateway Timeout) for server-side timeouts, handle client-side network errors
- User notification: Display "Request timed out. Please check your connection and try again."
- Retry: Client automatically retries failed requests once after 2-second delay
- Logging: Log timeout occurrences with endpoint, duration, and user ID

### 4.1.2 Critical Situations

**Database Corruption:**
- Situation: Database integrity compromised or data corruption detected
- Handling: Application detects integrity constraint violations, returns HTTP 500, prevents further data modification
- User notification: Display "System error. Please contact administrator."
- Recovery: Restore from most recent database backup, application logs assist in identifying corruption point
- Prevention: Database transactions ensure atomicity, foreign key constraints prevent orphaned records

**Server Crash:**
- Situation: Application server process terminates unexpectedly
- Handling: Process manager (PM2 or systemd) automatically restarts application
- User notification: Users see connection error, can retry after server restart (typically 10-30 seconds)
- Data protection: All data persisted in database, no data loss on server restart
- Monitoring: Server health checks every 30 seconds, alert on consecutive failures

**Memory Exhaustion:**
- Situation: Server runs out of available memory
- Handling: Node.js process terminates, process manager restarts with memory limits enforced
- Prevention: Memory limits set to 2 GB per process, image processing uses streaming to limit memory usage
- User notification: Users see connection error during outage
- Monitoring: Alert when memory usage exceeds 80% of allocated limit

**Disk Space Exhaustion:**
- Situation: Database server runs out of disk space
- Handling: Database operations fail, application returns HTTP 503, prevents new data writes
- User notification: Display "System temporarily unavailable" message
- Prevention: Monitor disk usage, alert when free space below 20%, automatic cleanup of old logs
- Recovery: Free disk space or expand storage, restart database service

**Session Store Failure:**
- Situation: Session storage becomes unavailable (if using external session store)
- Handling: Fallback to in-memory session store, existing sessions ARE lost, users redirected to login
- User notification: Users see login screen with message "Session expired. Please login again."
- Prevention: Use in-memory session store by default (no external dependency), session data minimal

### 4.1.3 Exception Handling

**Error Handling Strategy:**
- All errors caught and handled at appropriate levels (route handlers, middleware, global error handler)
- Never expose internal error details to users (stack traces, database errors, file paths)
- Generic user-facing messages: "An error occurred. Please try again." with error code for support reference
- Detailed error information logged server-side with context (user ID, request path, timestamp, stack trace)

**Error Response Format:**
- HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error), 503 (Service Unavailable)
- Response body: JSON format with error code, user message, and timestamp
- Example: `{ "error": "VALIDATION_ERROR", "message": "Invalid email format", "timestamp": "2024-01-15T10:30:00Z" }`

**Logging Requirements:**
- Log level: ERROR for exceptions, WARN for recoverable issues, INFO for important events, DEBUG for development
- Log format: JSON format with timestamp, level, message, context (user ID, request ID, stack trace)
- Log storage: Application logs written to files (rotated daily, retained for 30 days)
- Log monitoring: Alert on ERROR level logs, monitor error rate (alert if > 1% of requests fail)

**Transaction Management:**
- Database operations wrapped in transactions for multi-step operations (project creation, status updates)
- Rollback on any error within transaction, ensure data consistency
- Transaction timeout: 30 seconds, automatic rollback on timeout
- Deadlock handling: Automatic retry with exponential backoff for deadlock situations

**Graceful Degradation:**
- If documentation images fail to load, display text descriptions only
- If PDF generation fails, allow user to retry without data loss
- If powerplant list fails to load, show cached data if available, otherwise display error
- Non-critical features fail silently, critical features show errors and prevent operation

**Health Checks:**
- Health check endpoint: GET /health returns 200 OK if application and database are healthy
- Database health: Verify database connection with simple query
- Response format: `{ "status": "healthy", "database": "connected", "timestamp": "2024-01-15T10:30:00Z" }`
- Monitoring: Health check called every 30 seconds by monitoring system, alert on failures
