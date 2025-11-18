export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Powerplant {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Part {
  id: string;
  powerplant_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Checkup {
  id: string;
  part_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  user_id: string;
  powerplant_id: string;
  status: 'in_progress' | 'finished';
  created_at: Date;
  finished_at: Date | null;
}

export interface CheckupStatus {
  id: string;
  project_id: string;
  checkup_id: string;
  status: 'bad' | 'average' | 'good' | null;
  created_at: Date;
  updated_at: Date;
}

export interface Documentation {
  id: string;
  part_id: string;
  project_id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  file_size: number;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
