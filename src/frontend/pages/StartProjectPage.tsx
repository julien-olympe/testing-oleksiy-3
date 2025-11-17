import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Powerplant, PowerplantParts } from '../types';

export function StartProjectPage() {
  const [powerplants, setPowerplants] = useState<Powerplant[]>([]);
  const [selectedPowerplantId, setSelectedPowerplantId] = useState('');
  const [powerplantParts, setPowerplantParts] = useState<PowerplantParts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPowerplants();
  }, []);

  useEffect(() => {
    if (selectedPowerplantId) {
      loadPowerplantParts(selectedPowerplantId);
    } else {
      setPowerplantParts(null);
    }
  }, [selectedPowerplantId]);

  const loadPowerplants = async () => {
    try {
      const data = await api.getPowerplants();
      setPowerplants(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load powerplants');
    }
  };

  const loadPowerplantParts = async (powerplantId: string) => {
    try {
      setLoading(true);
      const data = await api.getPowerplantParts(powerplantId);
      setPowerplantParts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load powerplant details');
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
      setLoading(true);
      setError('');
      await api.createProject(selectedPowerplantId);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Start New Project</h2>
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

      <div style={{ marginBottom: '2rem' }}>
        <label
          htmlFor="powerplant"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Select Powerplant
        </label>
        <select
          id="powerplant"
          value={selectedPowerplantId}
          onChange={(e) => setSelectedPowerplantId(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        >
          <option value="">-- Select a powerplant --</option>
          {powerplants.map((pp) => (
            <option key={pp.id} value={pp.id}>
              {pp.name} {pp.location && `(${pp.location})`}
            </option>
          ))}
        </select>
      </div>

      {powerplantParts && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>{powerplantParts.name}</h3>
          {powerplantParts.location && <p>Location: {powerplantParts.location}</p>}
          <div>
            <h4>Parts and Checkups:</h4>
            {powerplantParts.parts.map((part) => (
              <div
                key={part.id}
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <h5 style={{ marginTop: 0 }}>{part.name}</h5>
                {part.description && <p style={{ color: '#7f8c8d' }}>{part.description}</p>}
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {part.checkups.map((checkup) => (
                    <li key={checkup.id}>{checkup.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={loading || !selectedPowerplantId}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: loading || !selectedPowerplantId ? 'not-allowed' : 'pointer',
          opacity: loading || !selectedPowerplantId ? 0.6 : 1,
        }}
      >
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </div>
  );
}
