# 3 - Performance Requirements

## User Capacity

**Maximum Simultaneous Users**
- The system supports up to 100 concurrent authenticated users
- Each user can have multiple active sessions (same user logged in from multiple devices)
- User authentication and session management handled via JWT tokens with configurable expiration

**Maximum Simultaneous Transactions**
- The system handles up to 50 concurrent API requests per second
- Database connection pool configured for 20 simultaneous connections
- File upload operations limited to 10 concurrent uploads to prevent server resource exhaustion

## File Storage Requirements

**Documentation Files**
- Maximum file size per upload: 10 MB
- Supported file types: JPEG, PNG, GIF, PDF
- Maximum number of files per part: 20 files
- Maximum total storage per project: 500 MB
- File storage location: Local filesystem with organized directory structure (project_id/part_id/filename)

**File Upload Performance**
- Small files (< 1 MB): Upload and processing completed within 2 seconds
- Medium files (1-5 MB): Upload and processing completed within 5 seconds
- Large files (5-10 MB): Upload and processing completed within 10 seconds

## Response Time Requirements

**Authentication Operations**
- User registration: Response time < 1 second
- User login: Response time < 500 milliseconds
- JWT token validation: Response time < 100 milliseconds

**Project Management Operations**
- List user projects: Response time < 500 milliseconds
- Create new project: Response time < 2 seconds (includes creating all checkup status records)
- Open project details: Response time < 1 second (includes loading all parts, checkups, statuses, and documentation metadata)

**Status Update Operations**
- Update checkup status: Response time < 300 milliseconds
- Upload documentation file: Response time depends on file size (see File Upload Performance above)
- Delete documentation file: Response time < 500 milliseconds

**Report Generation**
- PDF report generation: Response time < 10 seconds for projects with up to 50 checkups and 20 documentation files
- PDF download initiation: Response time < 1 second after generation completion

**Database Queries**
- Simple queries (single table, indexed): Response time < 100 milliseconds
- Complex queries (joins, aggregations): Response time < 500 milliseconds
- Full project data retrieval: Response time < 1 second

## System Constraints

**Database Constraints**
- PostgreSQL database must maintain ACID compliance
- Database backups performed daily
- Database connection timeout: 30 seconds
- Query timeout: 10 seconds

**Server Resource Constraints**
- CPU usage should not exceed 80% under normal load
- Memory usage should not exceed 70% of available RAM
- Disk I/O should not exceed 80% of available bandwidth
- Network bandwidth should accommodate file uploads without blocking other requests

**Application Constraints**
- API request timeout: 30 seconds
- Maximum request body size: 15 MB (to accommodate file uploads)
- Session timeout: 24 hours of inactivity
- JWT token expiration: 7 days

**PDF Generation Constraints**
- Puppeteer headless browser instances limited to 5 concurrent generations
- PDF generation queue implemented for handling multiple simultaneous report requests
- Maximum PDF size: 50 MB
- PDF generation timeout: 60 seconds

**File Storage Constraints**
- Filesystem storage monitored for capacity
- Automatic cleanup of orphaned files (files without database references) via scheduled job
- File access permissions restricted to authenticated users only
- File serving via secure API endpoints with authentication checks

## Scalability Considerations

- Database indexes optimized for common query patterns (user projects, project checkups)
- API endpoints designed for horizontal scaling (stateless JWT authentication)
- File storage architecture allows migration to cloud storage (S3, Azure Blob) without code changes
- Caching strategy for frequently accessed data (powerplant definitions, user session data)
