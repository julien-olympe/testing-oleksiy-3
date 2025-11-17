import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';

export function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectDoubleClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleStartProject = () => {
    navigate('/projects/new');
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Projects</h2>
        <button
          onClick={handleStartProject}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Start Project
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <p>No projects yet. Click "Start Project" to create your first project.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              onDoubleClick={() => handleProjectDoubleClick(project.id)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ marginTop: 0 }}>{project.powerplant.name}</h3>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    color: project.status === 'Finished' ? '#27ae60' : '#f39c12',
                    fontWeight: 'bold',
                  }}
                >
                  {project.status}
                </span>
              </p>
              <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
              {project.finishedAt && (
                <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                  Finished: {new Date(project.finishedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
