-- Create ENUM types
CREATE TYPE project_status AS ENUM ('in_progress', 'finished');
CREATE TYPE checkup_status_type AS ENUM ('bad', 'average', 'good');

-- Create User table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Powerplant table
CREATE TABLE powerplants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Part table
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  powerplant_id UUID NOT NULL REFERENCES powerplants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Checkup table
CREATE TABLE checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Project table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  powerplant_id UUID NOT NULL REFERENCES powerplants(id) ON DELETE CASCADE,
  status project_status NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP
);

-- Create CheckupStatus table
CREATE TABLE checkup_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  checkup_id UUID NOT NULL REFERENCES checkups(id) ON DELETE CASCADE,
  status checkup_status_type,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, checkup_id)
);

-- Create Documentation table
CREATE TABLE documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on foreign keys
CREATE INDEX idx_parts_powerplant_id ON parts(powerplant_id);
CREATE INDEX idx_checkups_part_id ON checkups(part_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_powerplant_id ON projects(powerplant_id);
CREATE INDEX idx_checkup_statuses_project_id ON checkup_statuses(project_id);
CREATE INDEX idx_checkup_statuses_checkup_id ON checkup_statuses(checkup_id);
CREATE INDEX idx_documentation_part_id ON documentation(part_id);
CREATE INDEX idx_documentation_project_id ON documentation(project_id);
