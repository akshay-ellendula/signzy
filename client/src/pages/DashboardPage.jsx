import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Activity, Zap, Shield, Server } from 'lucide-react';

const DashboardPage = () => {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await apiClient.get('/health');
      return res.data;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of your intelligent routing system.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>System Status</p>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{isLoading ? '...' : (health?.status || 'Unknown')}</h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--success)' }}>
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Vendors</p>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>--</h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', color: 'var(--primary)' }}>
              <Server size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Requests</p>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>--</h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '8px', color: 'var(--secondary)' }}>
              <Zap size={24} />
            </div>
          </div>
        </div>

      </div>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Routing Activity</h3>
        <p style={{ color: 'var(--text-muted)' }}>Detailed charts will appear here.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
