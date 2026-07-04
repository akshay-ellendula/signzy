import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const VendorsPage = () => {
  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await apiClient.get('/vendors');
      return res.data;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Vendors</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your routing vendors and capabilities.</p>
        </div>
        <button className="glass-button primary">Add Vendor</button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {isLoading ? (
          <p>Loading vendors...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Capability</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Priority / Weight</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Cost</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(vendorsData || []).map((capConfig) => (
                capConfig.vendors.map((vendor, idx) => (
                  <tr key={`${capConfig.capability}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{vendor.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="status-badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        {capConfig.capability}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{vendor.priority || '-'} / {vendor.weight || '-'}</td>
                    <td style={{ padding: '1rem' }}>${vendor.costPerRequest}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${vendor.circuitState === 'OPEN' ? 'status-error' : 'status-active'}`}>
                        {vendor.circuitState === 'OPEN' ? 'Down' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
