import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const LogsPage = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const res = await apiClient.get('/routing-logs');
      return res.data;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Routing Logs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Audit trail of all routing decisions.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {isLoading ? (
          <p>Loading logs...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Timestamp</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Capability</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Vendor Used</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Latency</th>
              </tr>
            </thead>
            <tbody>
              {logs?.logs?.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{log.requestId.substring(0, 8)}...</td>
                  <td style={{ padding: '1rem' }}>{log.request?.capability}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge ${log.status === 'SUCCESS' ? 'status-active' : 'status-error'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{log.vendorUsed || 'None'}</td>
                  <td style={{ padding: '1rem' }}>{log.latencyMs ? `${log.latencyMs}ms` : '-'}</td>
                </tr>
              ))}
              {(!logs?.logs || logs.logs.length === 0) && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No routing logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
