import { User, Project, ProjectDetail, Powerplant, PowerplantDetail } from '../types';

class ApiService {
  private baseUrl = '/api';
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<{ token: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request('/projects');
  }

  async createProject(powerplantId: string): Promise<ProjectDetail> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ powerplantId }),
    });
  }

  async getProject(id: string): Promise<ProjectDetail> {
    return this.request(`/projects/${id}`);
  }

  // Checkups
  async updateCheckupStatus(
    projectId: string,
    checkupId: string,
    status: 'bad' | 'average' | 'good'
  ): Promise<void> {
    return this.request(`/projects/${projectId}/checkups/${checkupId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Documentation
  async getDocumentation(projectId: string, partId: string): Promise<{ documentation: any[] }> {
    return this.request(`/projects/${projectId}/parts/${partId}/documentation`);
  }

  async uploadDocumentation(
    projectId: string,
    partId: string,
    file: File,
    description?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/parts/${partId}/documentation`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async deleteDocumentation(projectId: string, documentationId: string): Promise<void> {
    return this.request(`/projects/${projectId}/documentation/${documentationId}`, {
      method: 'DELETE',
    });
  }

  getDocumentationFileUrl(projectId: string, documentationId: string): string {
    return `${this.baseUrl}/projects/${projectId}/documentation/${documentationId}/file`;
  }

  // Powerplants
  async getPowerplants(): Promise<{ powerplants: Powerplant[] }> {
    return this.request('/powerplants');
  }

  async getPowerplant(id: string): Promise<PowerplantDetail> {
    return this.request(`/powerplants/${id}`);
  }

  // Reports
  async finishProject(projectId: string): Promise<any> {
    return this.request(`/projects/${projectId}/finish`, {
      method: 'POST',
    });
  }

  getReportUrl(projectId: string): string {
    return `${this.baseUrl}/projects/${projectId}/report`;
  }
}

export const api = new ApiService();
