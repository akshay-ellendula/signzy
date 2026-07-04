import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Vendors
export const fetchVendors = () => api.get('/vendors').then((res) => res.data);
export const fetchVendorById = (id) => api.get(`/vendors/${id}`).then((res) => res.data);
export const createVendor = (payload) => api.post('/vendors', payload).then((res) => res.data);
export const updateVendor = (id, payload) => api.put(`/vendors/${id}`, payload).then((res) => res.data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`).then((res) => res.data);

// Routing
export const routeRequest = (payload) => api.post('/route', payload).then((res) => res.data);

// Metrics
export const fetchVendorMetrics = () => api.get('/vendor-metrics').then((res) => res.data);

// Logs
export const fetchRoutingLogs = (params) => api.get('/routing-logs', { params }).then((res) => res.data);
export const fetchRoutingLogById = (id) => api.get(`/routing-logs/${id}`).then((res) => res.data);

// Health
export const fetchHealth = () => api.get('/health').then((res) => res.data);

// AI Rule Generator
export const generateRoutingRule = (text) =>
  api.post('/ai-rule-generator', { text }).then((res) => res.data);

// Routing Configs (saved AI-generated rules, applyable to vendors/Route Tester)
export const saveRoutingConfig = (config) => api.post('/routing-configs', config).then((res) => res.data);
export const fetchRoutingConfigs = () => api.get('/routing-configs').then((res) => res.data);

// Agentic advice: strategy recommendation + fallback rule suggestions
export const fetchStrategyRecommendation = () => api.get('/strategy-recommendation').then((res) => res.data);
export const fetchFallbackSuggestions = () => api.get('/fallback-suggestions').then((res) => res.data);

// Settings
export const fetchSettings = () => api.get('/settings').then((res) => res.data);
export const updateSettings = (payload) => api.put('/settings', payload).then((res) => res.data);
