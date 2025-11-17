# 1. Data Structure Specification

## 1.1 Overview

The application uses a relational database model with PostgreSQL. The data structure supports user authentication, project management, powerplant configuration, and inspection tracking. All entities maintain referential integrity through foreign key constraints.

## 1.2 Entity Specifications

### Entity: User

**Purpose:** Stores authenticated user accounts for field technicians and project managers who access the system.

**Essence:** Represents a person who can register, login, and be assigned projects. Each user has unique credentials and can own multiple projects.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the user
- `username` (VARCHAR(50), Unique, Not Null): User's login username, minimum 3 characters
- `email` (VARCHAR(255), Unique, Not Null): User's email address, validated format
- `password_hash` (VARCHAR(255), Not Null): Bcrypt hashed password, minimum 8 characters before hashing
- `created_at` (TIMESTAMP, Not Null): Account creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last account update timestamp

**Relationships:**
- One-to-Many with Project: A user can have multiple projects (1:N)
- Cardinality: One user owns zero or more projects

**Constraints:**
- Username must be unique across all users
- Email must be unique across all users
- Password hash is never null or empty
- Username minimum length: 3 characters
- Email must match valid email format

---

### Entity: Powerplant

**Purpose:** Represents a wind power installation location with a unique identifier and name. Powerplants contain predefined parts and checkups that are used when creating projects.

**Essence:** A physical wind power installation site. Powerplant data is read-only for regular users and managed by system administrators. Each powerplant defines the structure of inspections.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the powerplant
- `name` (VARCHAR(255), Unique, Not Null): Powerplant name, unique across all powerplants
- `location` (VARCHAR(255), Nullable): Physical location or address of the powerplant
- `created_at` (TIMESTAMP, Not Null): Powerplant creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last powerplant update timestamp

**Relationships:**
- One-to-Many with Part: A powerplant has multiple parts (1:N)
- One-to-Many with Project: A powerplant can be used in multiple projects (1:N)
- Cardinality: One powerplant contains one or more parts
- Cardinality: One powerplant is referenced by zero or more projects

**Constraints:**
- Powerplant name must be unique
- Powerplant name cannot be null or empty

---

### Entity: Part

**Purpose:** Represents a physical component of a wind turbine (e.g., rotor blades, gearbox, generator, tower, nacelle). Parts belong to a powerplant and contain checkups.

**Essence:** A wind turbine component that requires inspection. Parts are organized hierarchically under powerplants and group related checkups together.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the part
- `powerplant_id` (UUID, Foreign Key → Powerplant.id, Not Null): Reference to parent powerplant
- `name` (VARCHAR(255), Not Null): Part name, unique within a powerplant
- `description` (TEXT, Nullable): Detailed description of the part
- `display_order` (INTEGER, Not Null, Default: 0): Order for displaying parts in lists
- `created_at` (TIMESTAMP, Not Null): Part creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last part update timestamp

**Relationships:**
- Many-to-One with Powerplant: A part belongs to one powerplant (N:1)
- One-to-Many with Checkup: A part has multiple checkups (1:N)
- Cardinality: One part belongs to exactly one powerplant
- Cardinality: One part contains one or more checkups

**Constraints:**
- Part name must be unique within the same powerplant
- Part name cannot be null or empty
- Powerplant reference cannot be null

---

### Entity: Checkup

**Purpose:** Represents a specific inspection point or test procedure for a wind turbine part. Each checkup must be evaluated during project execution and can have associated documentation.

**Essence:** An inspection requirement that must be completed for a part. Checkups define what needs to be inspected and can reference documentation (images and descriptions) stored in the database.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the checkup
- `part_id` (UUID, Foreign Key → Part.id, Not Null): Reference to parent part
- `name` (VARCHAR(255), Not Null): Checkup name, unique within a part
- `description` (TEXT, Nullable): Detailed description of what to check
- `documentation_images` (BYTEA[], Nullable): Array of binary image data stored in database
- `documentation_text` (TEXT, Nullable): Text description providing reference information
- `display_order` (INTEGER, Not Null, Default: 0): Order for displaying checkups within a part
- `created_at` (TIMESTAMP, Not Null): Checkup creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last checkup update timestamp

**Relationships:**
- Many-to-One with Part: A checkup belongs to one part (N:1)
- One-to-Many with CheckupStatus: A checkup can have multiple status records across projects (1:N)
- Cardinality: One checkup belongs to exactly one part
- Cardinality: One checkup can have zero or more status records (one per project)

**Constraints:**
- Checkup name must be unique within the same part
- Checkup name cannot be null or empty
- Part reference cannot be null
- Documentation images stored as binary data in database array

---

### Entity: Project

**Purpose:** Represents an investigation assignment for a specific powerplant. Projects track the inspection status and are assigned to users. Projects can be in "In Progress" or "Finished" status.

**Essence:** A work assignment that links a user to a powerplant and tracks the completion of all checkups. Projects are created from powerplant templates and become read-only when finished.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the project
- `user_id` (UUID, Foreign Key → User.id, Not Null): Reference to assigned user
- `powerplant_id` (UUID, Foreign Key → Powerplant.id, Not Null): Reference to powerplant being inspected
- `status` (VARCHAR(20), Not Null, Default: 'In Progress'): Project status, values: 'In Progress', 'Finished'
- `created_at` (TIMESTAMP, Not Null): Project creation timestamp
- `finished_at` (TIMESTAMP, Nullable): Project completion timestamp, set when status changes to 'Finished'
- `updated_at` (TIMESTAMP, Not Null): Last project update timestamp

**Relationships:**
- Many-to-One with User: A project belongs to one user (N:1)
- Many-to-One with Powerplant: A project references one powerplant (N:1)
- One-to-Many with CheckupStatus: A project has multiple checkup status records (1:N)
- Cardinality: One project belongs to exactly one user
- Cardinality: One project references exactly one powerplant
- Cardinality: One project has zero or more checkup status records

**Constraints:**
- Status must be either 'In Progress' or 'Finished'
- User reference cannot be null
- Powerplant reference cannot be null
- Finished projects cannot be modified (enforced at application level)
- finished_at is set automatically when status changes to 'Finished'

---

### Entity: CheckupStatus

**Purpose:** Stores the evaluation status for each checkup within a project. Links projects to checkups and records the inspection result (bad, average, or good).

**Essence:** A junction entity that records which checkups have been evaluated in a project and their status values. Enables tracking of inspection progress and completion.

**Attributes:**
- `id` (UUID, Primary Key): Unique identifier for the status record
- `project_id` (UUID, Foreign Key → Project.id, Not Null): Reference to the project
- `checkup_id` (UUID, Foreign Key → Checkup.id, Not Null): Reference to the checkup
- `status_value` (VARCHAR(20), Not Null): Status value, values: 'bad', 'average', 'good'
- `created_at` (TIMESTAMP, Not Null): Status record creation timestamp
- `updated_at` (TIMESTAMP, Not Null): Last status update timestamp

**Relationships:**
- Many-to-One with Project: A status record belongs to one project (N:1)
- Many-to-One with Checkup: A status record references one checkup (N:1)
- Cardinality: One status record belongs to exactly one project
- Cardinality: One status record references exactly one checkup
- Unique constraint: One project can have only one status record per checkup (composite unique key on project_id + checkup_id)

**Constraints:**
- Status value must be one of: 'bad', 'average', 'good'
- Project reference cannot be null
- Checkup reference cannot be null
- Unique combination of project_id and checkup_id (one status per checkup per project)
- Cannot be created or updated for finished projects (enforced at application level)

---

## 1.3 Database Schema Summary

**Tables:**
1. `users` - User accounts
2. `powerplants` - Wind power installations
3. `parts` - Wind turbine components
4. `checkups` - Inspection points
5. `projects` - Investigation assignments
6. `checkup_statuses` - Checkup evaluation records

**Indexes:**
- Primary keys on all tables (id columns)
- Unique indexes on: users.username, users.email, powerplants.name
- Unique composite index on: checkup_statuses(project_id, checkup_id)
- Foreign key indexes on all foreign key columns
- Index on projects.user_id for efficient user project queries
- Index on projects.status for filtering by status
- Index on parts.powerplant_id for powerplant part queries
- Index on checkups.part_id for part checkup queries

**Data Types:**
- UUID for all primary keys and foreign keys
- VARCHAR for names and short text fields
- TEXT for descriptions and long text
- BYTEA[] for image arrays in checkups
- TIMESTAMP for all date/time fields
- INTEGER for display_order fields
