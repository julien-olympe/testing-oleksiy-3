import axios, { AxiosError, AxiosInstance } from 'axios';
import { User, Project, ProjectDetails, Powerplant, PowerplantParts } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    // Note: We don't redirect here to avoid navigation loops
    // ProtectedRoute and useAuth handle authentication redirects
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Just reject the error, let React Router handle redirects
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(username: string, email: string, password: string, passwordConfirmation: string) {
    const response = await this.client.post<{ data: User }>('/api/auth/register', {
      username,
      email,
      password,
      passwordConfirmation,
    });
    return response.data.data;
  }

  async login(usernameOrEmail: string, password: string) {
    const response = await this.client.post<{ data: User }>('/api/auth/login', {
      usernameOrEmail,
      password,
    });
    return response.data.data;
  }

  async logout() {
    await this.client.post('/api/auth/logout');
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<{ data: Project[] }>('/api/projects');
    return response.data.data;
  }

  async getProject(id: string): Promise<ProjectDetails> {
    const response = await this.client.get<{ data: ProjectDetails }>(`/api/projects/${id}`);
    return response.data.data;
  }

  async createProject(powerplantId: string): Promise<Project> {
    const response = await this.client.post<{ data: Project }>('/api/projects', {
      powerplantId,
    });
    return response.data.data;
  }

  async updateCheckupStatus(
    projectId: string,
    checkupId: string,
    status: 'bad' | 'average' | 'good'
  ) {
    const response = await this.client.patch<{ data: { checkupId: string; status: string } }>(
      `/api/projects/${projectId}/checkups/${checkupId}/status`,
      { status }
    );
    return response.data.data;
  }

  async finishProject(projectId: string): Promise<Blob> {
    const response = await this.client.post(
      `/api/projects/${projectId}/finish`,
      {},
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // Powerplants
  async getPowerplants(): Promise<Powerplant[]> {
    const response = await this.client.get<{ data: Powerplant[] }>('/api/powerplants');
    return response.data.data;
  }

  async getPowerplantParts(powerplantId: string): Promise<PowerplantParts> {
    const response = await this.client.get<{ data: PowerplantParts }>(
      `/api/powerplants/${powerplantId}/parts`
    );
    return response.data.data;
  }
}

export const api = new ApiClient();
