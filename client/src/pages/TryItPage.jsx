import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const TryItPage = () => {
  const [capability, setCapability] = useState('PAN_VERIFICATION');
  const [payload, setPayload] = useState('{\n  "pan": "ABCDE1234F",\n  "name": "Rahul Sharma"\n}');
  const [requirements, setRequirements] = useState('{\n  "maxLatencyMs": 2000,\n  "preferLowCost": true\n}');
  const [response, setResponse] = useState(null);

  const routeMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.post('/route', data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Routing successful!');
      setResponse(data);
    },
    onError: (error) => {
      toast.error('Routing failed.');
      setResponse(error.response?.data || error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsedPayload = JSON.parse(payload);
      const parsedReqs = JSON.parse(requirements);

      routeMutation.mutate({
        capability,
        payload: parsedPayload,
        requirements: parsedReqs
      });
    } catch (err) {
      toast.error('Invalid JSON in payload or requirements');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Try It</h1>
        <p style={{ color: 'var(--text-muted)' }}>Send test requests to the intelligent routing engine.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Capability</label>
              <select
                className="glass-input"
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
                style={{ appearance: 'none', background: 'transparent' }}
              >
                <option value="PAN_VERIFICATION">PAN_VERIFICATION</option>
                <option value="AADHAAR_VERIFICATION">AADHAAR_VERIFICATION</option>
                <option value="GST_VERIFICATION">GST_VERIFICATION</option>
                <option value="BANK_VERIFICATION">BANK_VERIFICATION</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Payload (JSON)</label>
              <textarea
                className="glass-input"
                rows="4"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                style={{ fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Requirements (JSON)</label>
              <textarea
                className="glass-input"
                rows="4"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                style={{ fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="glass-button primary"
              disabled={routeMutation.isPending}
            >
              {routeMutation.isPending ? 'Routing...' : 'Send Request'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem' }}>Response</h3>
          <div style={{
            flex: 1,
            background: 'var(--glass-bg)',
            borderRadius: '8px',
            padding: '1rem',
            overflowY: 'auto',
            border: '1px solid var(--border)'
          }}>
            {response ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Response will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryItPage;
