import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProjectDetail, Part, Documentation } from '../types';
import './OngoingProject.css';

export function OngoingProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  useEffect(() => {
    if (selectedPartId && id) {
      loadDocumentation(id, selectedPartId);
    }
  }, [selectedPartId, id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getProject(id);
      setProject(data);
      if (data.parts.length > 0) {
        setSelectedPartId(data.parts[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentation = async (projectId: string, partId: string) => {
    try {
      const response = await api.getDocumentation(projectId, partId);
      setDocumentation(response.documentation);
    } catch (err: any) {
      console.error('Failed to load documentation:', err);
    }
  };

  const handleStatusUpdate = async (checkupId: string, status: 'bad' | 'average' | 'good') => {
    if (!id) return;
    try {
      await api.updateCheckupStatus(id, checkupId, status);
      await loadProject(); // Reload to get updated status
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleFinishReport = async () => {
    if (!id) return;
    try {
      setFinishing(true);
      setError(null);
      await api.finishProject(id);
      // Trigger PDF download
      const reportUrl = api.getReportUrl(id);
      window.open(reportUrl, '_blank');
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to finish report');
    } finally {
      setFinishing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !selectedPartId || !e.target.files?.[0]) return;
    try {
      const file = e.target.files[0];
      await api.uploadDocumentation(id, selectedPartId, file);
      await loadDocumentation(id, selectedPartId);
      e.target.value = ''; // Reset input
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    }
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  const selectedPart = project.parts.find((p) => p.id === selectedPartId);

  return (
    <div className="ongoing-project-container">
      <header className="project-header">
        <button onClick={() => navigate('/home')} className="back-button">
          ← Back
        </button>
        <h1>{project.powerplantName}</h1>
        {project.status === 'in_progress' && (
          <button
            onClick={handleFinishReport}
            disabled={finishing}
            className="finish-button"
          >
            {finishing ? 'Generating PDF...' : 'Finish Report'}
          </button>
        )}
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="project-main">
        <div className="project-layout">
          <div className="parts-section">
            <h2>Parts and Checkups</h2>
            {project.parts.map((part) => (
              <div
                key={part.id}
                className={`part-item ${selectedPartId === part.id ? 'selected' : ''}`}
                onClick={() => setSelectedPartId(part.id)}
              >
                <h3>{part.name}</h3>
                {part.description && <p className="part-description">{part.description}</p>}
                <div className="checkups">
                  {part.checkups.map((checkup) => (
                    <div key={checkup.id} className="checkup-item">
                      <div className="checkup-info">
                        <span className="checkup-name">{checkup.name}</span>
                        {checkup.description && (
                          <span className="checkup-description">{checkup.description}</span>
                        )}
                      </div>
                      {project.status === 'in_progress' && (
                        <div className="status-buttons">
                          <button
                            className={`status-btn bad ${checkup.status === 'bad' ? 'active' : ''}`}
                            onClick={() => handleStatusUpdate(checkup.id, 'bad')}
                          >
                            Bad
                          </button>
                          <button
                            className={`status-btn average ${checkup.status === 'average' ? 'active' : ''}`}
                            onClick={() => handleStatusUpdate(checkup.id, 'average')}
                          >
                            Average
                          </button>
                          <button
                            className={`status-btn good ${checkup.status === 'good' ? 'active' : ''}`}
                            onClick={() => handleStatusUpdate(checkup.id, 'good')}
                          >
                            Good
                          </button>
                        </div>
                      )}
                      {project.status === 'finished' && checkup.status && (
                        <span className={`status-badge ${checkup.status}`}>
                          {checkup.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="documentation-section">
            <h2>Documentation</h2>
            {selectedPart && (
              <>
                {project.status === 'in_progress' && (
                  <div className="upload-section">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="upload-button">
                      Upload File
                    </label>
                  </div>
                )}
                {documentation.length === 0 ? (
                  <div className="empty-docs">No documentation for this part</div>
                ) : (
                  <div className="documentation-list">
                    {documentation.map((doc) => (
                      <div key={doc.id} className="doc-item">
                        {doc.fileType.startsWith('image/') ? (
                          <img
                            src={api.getDocumentationFileUrl(id!, doc.id)}
                            alt={doc.fileName}
                            className="doc-image"
                          />
                        ) : (
                          <div className="doc-file">
                            <a
                              href={api.getDocumentationFileUrl(id!, doc.id)}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {doc.fileName}
                            </a>
                          </div>
                        )}
                        {doc.description && (
                          <p className="doc-description">{doc.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {!selectedPart && (
              <div className="empty-docs">Select a part to view documentation</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
