export const formatMs = (value) => (value === null || value === undefined ? '—' : `${Math.round(value)}ms`);

export const formatPercent = (value) => (value === null || value === undefined ? '—' : `${Number(value).toFixed(1)}%`);

export const formatCost = (value) => (value === null || value === undefined ? '—' : `₹${Number(value).toFixed(2)}`);

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '—');

export const STRATEGY_LABELS = {
  priority: 'Priority',
  weighted: 'Weighted',
  roundRobin: 'Round Robin',
  lowestLatency: 'Lowest Latency',
  lowestCost: 'Lowest Cost',
  healthBased: 'Health Based',
  failover: 'Failover',
  featureBased: 'Feature Based',
};
