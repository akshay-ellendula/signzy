import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MetricsPage = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const res = await apiClient.get('/vendor-metrics');
      return res.data;
    }
  });

  const chartData = metrics ? Object.entries(metrics).map(([vendor, stats]) => ({
    name: vendor,
    latency: stats.avgLatency || 0,
    successRate: stats.totalRequests ? (stats.successfulRequests / stats.totalRequests) * 100 : 0,
  })) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Metrics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Per-vendor performance metrics.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Average Latency (ms)</h3>
        {isLoading ? (
          <p>Loading metrics...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ background: 'var(--glass-panel)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="latency" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MetricsPage;
