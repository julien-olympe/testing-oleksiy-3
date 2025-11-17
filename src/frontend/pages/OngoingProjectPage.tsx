import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ProjectDetails } from '../types';

export function OngoingProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [selectedCheckupId, setSelectedCheckupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finishing, setFinishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (checkupId: string, status: 'bad' | 'average' | 'good') => {
    if (!id) return;

    try {
      await api.updateCheckupStatus(id, checkupId, status);
      // Reload project to get updated status
      await loadProject(id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFinish = async () => {
    if (!id) return;

    if (!confirm('Are you sure you want to finish this project? A PDF report will be generated.')) {
      return;
    }

    try {
      setFinishing(true);
      setError('');
      const blob = await api.finishProject(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Project_${id}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Navigate back to home
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to finish project');
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return <div>Loading project...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const selectedCheckup = project.parts
    .flatMap((part) => part.checkups)
    .find((checkup) => checkup.id === selectedCheckupId);

  const isFinished = project.status === 'Finished';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>{project.powerplant.name}</h2>
          {project.powerplant.location && <p>Location: {project.powerplant.location}</p>}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
          {!isFinished && (
            <button
              onClick={handleFinish}
              disabled={finishing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: finishing ? 'not-allowed' : 'pointer',
                opacity: finishing ? 0.6 : 1,
              }}
            >
              {finishing ? 'Generating PDF...' : 'Finish Report'}
            </button>
          )}
        </div>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1rem',
        }}
      >
        {/* Parts and Checkups */}
        <div style={{ gridColumn: 'span 2' }}>
          <h3>Parts and Checkups</h3>
          {project.parts.map((part) => (
            <div
              key={part.id}
              style={{
                marginBottom: '2rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h4 style={{ marginTop: 0 }}>{part.name}</h4>
              {part.description && <p style={{ color: '#7f8c8d' }}>{part.description}</p>}
              <div>
                {part.checkups.map((checkup) => (
                  <div
                    key={checkup.id}
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      backgroundColor: selectedCheckupId === checkup.id ? '#ecf0f1' : 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedCheckupId(checkup.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{checkup.name}</strong>
                        {checkup.description && (
                          <p style={{ margin: '0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                            {checkup.description}
                          </p>
                        )}
                      </div>
                      <div>
                        {checkup.status && (
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor:
                                checkup.status === 'good'
                                  ? '#d4edda'
                                  : checkup.status === 'average'
                                  ? '#fff3cd'
                                  : '#f8d7da',
                              color:
                                checkup.status === 'good'
                                  ? '#155724'
                                  : checkup.status === 'average'
                                  ? '#856404'
                                  : '#721c24',
                            }}
                          >
                            {checkup.status}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isFinished && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        {(['bad', 'average', 'good'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(checkup.id, status);
                            }}
                            disabled={checkup.status === status}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.85rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: checkup.status === status ? 'not-allowed' : 'pointer',
                              backgroundColor: checkup.status === status ? '#ddd' : 'white',
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Documentation Panel */}
        <div
          style={{
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f8f9fa',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <h3>Documentation</h3>
          {selectedCheckup ? (
            <div>
              <h4>{selectedCheckup.name}</h4>
              {selectedCheckup.documentationText && (
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedCheckup.documentationText}</p>
              )}
              {!selectedCheckup.hasDocumentation && (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No documentation available</p>
              )}
            </div>
          ) : (
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Select a checkup to view documentation</p>
          )}
        </div>
      </div>
    </div>
  );
}
