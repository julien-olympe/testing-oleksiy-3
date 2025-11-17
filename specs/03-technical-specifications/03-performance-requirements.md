# 3. Performance Requirements

## 3.1 Maximum Concurrent Users

**Simultaneous Active Sessions:**
- Maximum concurrent authenticated users: 100
- Maximum concurrent API requests: 200 per second
- Session storage: In-memory session store with 24-hour timeout
- Connection pooling: Database connection pool size: 20 connections

**User Load Distribution:**
- Peak usage: 50 concurrent users during business hours (8 AM - 6 PM)
- Average usage: 20 concurrent users during normal operations
- Off-peak usage: 5 concurrent users during non-business hours

## 3.2 Simultaneous Transactions

**Database Transactions:**
- Maximum concurrent database transactions: 20 (limited by connection pool)
- Transaction timeout: 30 seconds
- Read transactions: Unlimited (read-only queries don't use transaction pool)
- Write transactions: Maximum 10 concurrent write operations

**API Request Handling:**
- Maximum concurrent HTTP requests: 200
- Request timeout: 30 seconds
- Request queue: Unlimited queue size with first-in-first-out processing
- Rate limiting: 100 requests per minute per user session

## 3.3 File Numbers and Sizes

**Image Storage:**
- Maximum images per checkup: 10
- Maximum image file size: 5 MB per image
- Supported image formats: JPEG, PNG, WebP
- Total images per project: No hard limit (depends on checkup count)
- Image storage: PostgreSQL BYTEA array, total project image data: 50 MB maximum

**PDF Reports:**
- Maximum PDF file size: 25 MB per report
- PDF generation: In-memory generation, no temporary file storage
- PDF retention: Not stored on server, generated on-demand and downloaded
- Typical PDF size: 2-5 MB for projects with 50-100 checkups

**Database Size:**
- Maximum database size: 10 GB
- Maximum records per table:
  - Users: 10,000
  - Powerplants: 1,000
  - Parts: 10,000 (average 10 parts per powerplant)
  - Checkups: 100,000 (average 10 checkups per part)
  - Projects: 50,000
  - CheckupStatuses: 5,000,000 (average 100 checkups per project)

## 3.4 Response Time Requirements

**Page Load Times:**
- Login screen: Under 1 second
- Registration screen: Under 1 second
- Home screen (projects list): Under 2 seconds for up to 100 projects
- Start Project screen: Under 2 seconds
- Ongoing Project screen: Under 3 seconds for powerplant with 100 checkups

**API Response Times:**
- Authentication endpoints (login/register): Under 500 milliseconds
- GET /api/projects: Under 500 milliseconds for up to 100 projects
- GET /api/projects/:id: Under 1 second for project with 100 checkups
- GET /api/powerplants: Under 500 milliseconds
- GET /api/powerplants/:id/parts: Under 1 second for powerplant with 100 checkups
- PATCH /api/projects/:id/checkups/:checkupId/status: Under 300 milliseconds
- POST /api/projects: Under 500 milliseconds
- POST /api/projects/:id/finish: Under 5 seconds (includes PDF generation)

**Database Query Performance:**
- Simple queries (single table, indexed): Under 10 milliseconds
- Join queries (2-3 tables): Under 50 milliseconds
- Complex queries (4+ tables with aggregations): Under 200 milliseconds
- Full table scans: Avoided through proper indexing

**PDF Generation:**
- PDF generation time: Under 5 seconds for projects with 50-100 checkups
- PDF generation time: Under 10 seconds for projects with 100-200 checkups
- PDF download initiation: Under 100 milliseconds after generation

**Image Loading:**
- Image retrieval from database: Under 200 milliseconds per image
- Image display in documentation panel: Under 500 milliseconds for 5 images
- Image optimization: Images resized to maximum 1920x1080 pixels before storage

## 3.5 Environment Constraints

**Server Resources:**
- CPU utilization: Maximum 80% under peak load
- Memory utilization: Maximum 75% under peak load (4 GB minimum, 8 GB optimal)
- Disk I/O: Maximum 70% utilization for database operations
- Network bandwidth: Maximum 80% utilization for API requests

**Database Resources:**
- CPU utilization: Maximum 70% under peak load
- Memory utilization: Maximum 80% (shared_buffers: 25% of total RAM)
- Disk space: Minimum 20% free space maintained
- Connection pool: 20 connections maximum, 5 connections minimum

**Client Environment:**
- Browser memory: Application uses maximum 200 MB RAM
- Network latency: Maximum 200ms acceptable, optimal under 50ms
- Bandwidth: Minimum 10 Mbps for smooth operation, optimal 50 Mbps
- Browser cache: API responses cached for 5 minutes, images cached indefinitely

**Scalability Constraints:**
- Vertical scaling: Server can scale up to 16 CPU cores and 32 GB RAM
- Horizontal scaling: Not supported in current architecture (single server deployment)
- Database scaling: PostgreSQL supports read replicas for future scaling
- Load balancing: Not implemented in current version

**Availability Requirements:**
- System uptime: 99.5% availability (approximately 3.65 days downtime per year)
- Planned maintenance: Maximum 4 hours per month during off-peak hours
- Backup and recovery: Daily database backups, recovery time objective: 4 hours

**Geographic Constraints:**
- Server location: Single data center deployment
- Client locations: No geographic restrictions, internet connectivity required
- Latency: Acceptable for clients within 500ms network latency from server
