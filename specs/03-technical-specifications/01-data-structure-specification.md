# 1 - Data Structure Specification

## Description

This document describes the data model for the Wind Power Plant Status Investigation application. The model defines entities and their relationships to support user authentication, project management, powerplant tracking, part inspection, checkup status management, and documentation storage.

## Entities

### User

**Purpose and Essence**

The User entity represents an authenticated user of the application. Users can register, login, and manage their own projects. Each user has a unique identifier and authentication credentials.

**Attributes**
- `id` (UUID, Primary Key): Unique identifier for the user
- `username` (VARCHAR(255), Unique, Not Null): User's username used for authentication
- `email` (VARCHAR(255), Unique, Not Null): User's email address used for authentication
- `password_hash` (VARCHAR(255), Not Null): Hashed password using bcrypt
- `created_at` (TIMESTAMP, Not Null): Account creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last account update timestamp

**Relationships**
- One-to-Many with Project: A user can have multiple projects (cardinality: 1:N)

---

### Powerplant

**Purpose and Essence**

The Powerplant entity represents a wind turbine powerplant that can be inspected. Each powerplant has a predefined set of parts and checkups that are used when creating a new project. Powerplants are shared across all users but projects are user-specific.

**Attributes**
- `id` (UUID, Primary Key): Unique identifier for the powerplant
- `name` (VARCHAR(255), Not Null): Name of the wind turbine powerplant
- `description` (TEXT): Optional description of the powerplant
- `created_at` (TIMESTAMP, Not Null): Powerplant creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last powerplant update timestamp

**Relationships**
- One-to-Many with Part: A powerplant has multiple parts (cardinality: 1:N)
- One-to-Many with Project: A powerplant can be used in multiple projects (cardinality: 1:N)

---

### Part

**Purpose and Essence**

The Part entity represents a component of a wind turbine that requires inspection. Parts belong to a specific powerplant and have associated checkups that need to be performed.

**Attributes**
- `id` (UUID, Primary Key): Unique identifier for the part
- `powerplant_id` (UUID, Foreign Key → Powerplant.id, Not Null): Reference to the parent powerplant
- `name` (VARCHAR(255), Not Null): Name of the part
- `description` (TEXT): Optional description of the part
- `created_at` (TIMESTAMP, Not Null): Part creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last part update timestamp

**Relationships**
- Many-to-One with Powerplant: A part belongs to one powerplant (cardinality: N:1)
- One-to-Many with Checkup: A part has multiple checkups (cardinality: 1:N)
- One-to-Many with Documentation: A part can have multiple documentation files (cardinality: 1:N)

---

### Checkup

**Purpose and Essence**

The Checkup entity represents a specific inspection task that must be performed on a part. Checkups are predefined for each part and are used to create checkup statuses when a project is created.

**Attributes**
- `id` (UUID, Primary Key): Unique identifier for the checkup
- `part_id` (UUID, Foreign Key → Part.id, Not Null): Reference to the parent part
- `name` (VARCHAR(255), Not Null): Name of the checkup task
- `description` (TEXT): Optional description of the checkup
- `created_at` (TIMESTAMP, Not Null): Checkup creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last checkup update timestamp

**Relationships**
- Many-to-One with Part: A checkup belongs to one part (cardinality: N:1)
- One-to-Many with CheckupStatus: A checkup can have multiple statuses across different projects (cardinality: 1:N)

---

### Project

**Purpose and Essence**

The Project entity represents a user's inspection project for a specific powerplant. Projects track the overall inspection status and contain checkup statuses for all checkups associated with the powerplant's parts.

**Attributes**
- `id` (UUID, Primary Key): Unique identifier for the project
- `user_id` (UUID, Foreign Key → User.id, Not Null): Reference to the project owner
- `powerplant_id` (UUID, Foreign Key → Powerplant.id, Not Null): Reference to the powerplant being inspected
- `status` (ENUM('in_progress', 'finished'), Not Null, Default: 'in_progress'): Current project status
- `created_at` (TIMESTAMP, Not Null): Project creation timestamp
- `finished_at` (TIMESTAMP, Nullable): Timestamp when the project was marked as finished

**Relationships**
- Many-to-One with User: A project belongs to one user (cardinality: N:1)
- Many-to-One with Powerplant: A project is for one powerplant (cardinality: N:1)
- One-to-Many with CheckupStatus: A project has multiple checkup statuses (cardinality: 1:N)

---

### CheckupStatus

**Purpose and Essence**

The CheckupStatus entity represents the status of a specific checkup within a project. When a project is created, a CheckupStatus record is created for each checkup associated with the powerplant's parts. Users update these statuses during inspection.

**Attributes**
- `id` (UUID, Primary Key): Unique identifier for the checkup status
- `project_id` (UUID, Foreign Key → Project.id, Not Null): Reference to the parent project
- `checkup_id` (UUID, Foreign Key → Checkup.id, Not Null): Reference to the checkup being tracked
- `status` (ENUM('bad', 'average', 'good'), Nullable): Current status of the checkup (null if not yet inspected)
- `created_at` (TIMESTAMP, Not Null): CheckupStatus creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last status update timestamp

**Relationships**
- Many-to-One with Project: A checkup status belongs to one project (cardinality: N:1)
- Many-to-One with Checkup: A checkup status references one checkup (cardinality: N:1)
- Unique constraint on (project_id, checkup_id): Each checkup can only have one status per project

---

### Documentation

**Purpose and Essence**

The Documentation entity represents files (images, documents) uploaded by users for specific parts within a project. These files provide visual evidence or supporting documentation for inspection findings.

**Attributes**
- `id` (UUID, Primary Key): Unique identifier for the documentation
- `part_id` (UUID, Foreign Key → Part.id, Not Null): Reference to the part this documentation relates to
- `project_id` (UUID, Foreign Key → Project.id, Not Null): Reference to the project this documentation belongs to
- `file_path` (VARCHAR(500), Not Null): Server-side file system path where the file is stored
- `file_type` (VARCHAR(50), Not Null): MIME type of the file (e.g., 'image/jpeg', 'image/png', 'application/pdf')
- `file_name` (VARCHAR(255), Not Null): Original filename as uploaded by the user
- `file_size` (INTEGER, Not Null): File size in bytes
- `description` (TEXT): Optional description provided by the user
- `created_at` (TIMESTAMP, Not Null): Documentation upload timestamp
- `updated_at` (TIMESTAMP, Not Null): Last documentation update timestamp

**Relationships**
- Many-to-One with Part: Documentation belongs to one part (cardinality: N:1)
- Many-to-One with Project: Documentation belongs to one project (cardinality: N:1)

---

## Entity Relationship Summary

- **User** (1) ──< (N) **Project**
- **Powerplant** (1) ──< (N) **Part**
- **Powerplant** (1) ──< (N) **Project**
- **Part** (1) ──< (N) **Checkup**
- **Part** (1) ──< (N) **Documentation**
- **Checkup** (1) ──< (N) **CheckupStatus**
- **Project** (1) ──< (N) **CheckupStatus**
- **Project** (1) ──< (N) **Documentation**

## Database Constraints

- All primary keys are UUIDs for distributed system compatibility
- Foreign keys have CASCADE DELETE where appropriate (e.g., deleting a project deletes its checkup statuses and documentation)
- Unique constraints on User.username, User.email and (Project.id, Checkup.id) in CheckupStatus
- Indexes on foreign keys for query performance
- Indexes on Project.user_id and Project.status for efficient user project listing
