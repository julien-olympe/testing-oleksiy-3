import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Project } from '../types';
import './Home.css';

export function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.getProjects();
      setProjects(response.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = () => {
    navigate('/start-project');
  };

  const handleProjectDoubleClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'finished' ? 'status-finished' : 'status-in-progress';
  };

  const getStatusText = (status: string) => {
    return status === 'finished' ? 'Finished' : 'In Progress';
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Wind Power Plant Status Investigation</h1>
        <div className="header-actions">
          <span className="user-info">{user?.username}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="home-actions">
          <button onClick={handleStartProject} className="start-project-button">
            Start Project
          </button>
        </div>

        {loading && <div className="loading">Loading projects...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && projects.length === 0 && (
          <div className="empty-state">
            <p>You have no assigned projects. Click 'Start Project' to create one.</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="projects-list">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-item"
                onDoubleClick={() => handleProjectDoubleClick(project.id)}
              >
                <div className="project-header">
                  <h3>{project.powerplantName}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                <div className="project-meta">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
