import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Powerplant, PowerplantDetail } from '../types';
import './StartProject.css';

export function StartProject() {
  const navigate = useNavigate();
  const [powerplants, setPowerplants] = useState<Powerplant[]>([]);
  const [selectedPowerplantId, setSelectedPowerplantId] = useState<string>('');
  const [powerplantDetails, setPowerplantDetails] = useState<PowerplantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPowerplants();
  }, []);

  useEffect(() => {
    if (selectedPowerplantId) {
      loadPowerplantDetails(selectedPowerplantId);
    } else {
      setPowerplantDetails(null);
    }
  }, [selectedPowerplantId]);

  const loadPowerplants = async () => {
    try {
      setLoading(true);
      const response = await api.getPowerplants();
      setPowerplants(response.powerplants);
    } catch (err: any) {
      setError(err.message || 'Failed to load powerplants');
    } finally {
      setLoading(false);
    }
  };

  const loadPowerplantDetails = async (id: string) => {
    try {
      setLoading(true);
      const details = await api.getPowerplant(id);
      setPowerplantDetails(details);
    } catch (err: any) {
      setError(err.message || 'Failed to load powerplant details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedPowerplantId) {
      setError('Please select a powerplant');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const project = await api.createProject(selectedPowerplantId);
      navigate(`/project/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="start-project-container">
      <header className="start-project-header">
        <button onClick={() => navigate('/home')} className="back-button">
          ← Back
        </button>
        <h1>Start New Project</h1>
      </header>

      <main className="start-project-main">
        <div className="start-project-form">
          <div className="form-group">
            <label htmlFor="powerplant">Select Powerplant</label>
            <select
              id="powerplant"
              value={selectedPowerplantId}
              onChange={(e) => setSelectedPowerplantId(e.target.value)}
              disabled={loading}
            >
              <option value="">Choose a powerplant...</option>
              {powerplants.map((pp) => (
                <option key={pp.id} value={pp.id}>
                  {pp.name}
                </option>
              ))}
            </select>
          </div>

          {powerplantDetails && (
            <div className="preview-section">
              <h3>Parts and Checkups Preview</h3>
              <div className="preview-content">
                {powerplantDetails.parts.map((part) => (
                  <div key={part.id} className="preview-part">
                    <h4>{part.name}</h4>
                    {part.description && <p className="part-description">{part.description}</p>}
                    <ul className="checkups-list">
                      {part.checkups.map((checkup) => (
                        <li key={checkup.id}>
                          {checkup.name}
                          {checkup.description && (
                            <span className="checkup-description"> - {checkup.description}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={handleCreate}
            disabled={!selectedPowerplantId || creating}
            className="create-button"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </main>
    </div>
  );
}
