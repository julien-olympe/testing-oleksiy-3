export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Powerplant {
  id: string;
  name: string;
  location?: string;
}

export interface Checkup {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  status?: 'bad' | 'average' | 'good' | null;
  hasDocumentation: boolean;
  documentationText?: string;
}

export interface Part {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  checkups: Checkup[];
}

export interface Project {
  id: string;
  powerplant: {
    id: string;
    name: string;
    location?: string;
  };
  status: 'In Progress' | 'Finished';
  createdAt: string;
  finishedAt?: string | null;
}

export interface ProjectDetails extends Project {
  parts: Part[];
}

export interface PowerplantParts extends Powerplant {
  parts: Part[];
}
