export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Project {
  id: string;
  powerplantName: string;
  status: 'in_progress' | 'finished';
  createdAt: string;
  finishedAt: string | null;
}

export interface Powerplant {
  id: string;
  name: string;
  description: string | null;
  partsCount: number;
  checkupsCount: number;
}

export interface PowerplantDetail {
  id: string;
  name: string;
  description: string | null;
  parts: Part[];
}

export interface Part {
  id: string;
  name: string;
  description: string | null;
  checkups: Checkup[];
  documentation?: Documentation[];
}

export interface Checkup {
  id: string;
  name: string;
  description: string | null;
  status: 'bad' | 'average' | 'good' | null;
}

export interface Documentation {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  createdAt: string;
}

export interface ProjectDetail {
  id: string;
  powerplantId: string;
  powerplantName: string;
  status: 'in_progress' | 'finished';
  createdAt: string;
  finishedAt: string | null;
  parts: Part[];
}
