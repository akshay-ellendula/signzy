import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import toast from 'react-hot-toast';

// Keys
export const queryKeys = {
  vendors: ['vendors'],
  metrics: ['metrics'],
  logs: ['logs'],
  health: ['health'],
};

// -----------------------------
// Queries
// -----------------------------

export function useVendors() {
  return useQuery({
    queryKey: queryKeys.vendors,
    queryFn: async () => {
      const { data } = await api.get('/vendors');
      return data;
    },
    refetchInterval: 5000,
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: queryKeys.metrics,
    queryFn: async () => {
      const { data } = await api.get('/vendor-metrics');
      return data;
    },
    refetchInterval: 5000,
  });
}

export function useLogs(limit = 100) {
  return useQuery({
    queryKey: [...queryKeys.logs, limit],
    queryFn: async () => {
      const { data } = await api.get(`/routing-logs?limit=${limit}`);
      return data.logs || [];
    },
    refetchInterval: 5000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const { data } = await api.get('/health');
      return data;
    },
    refetchInterval: 5000,
  });
}

// -----------------------------
// Mutations
// -----------------------------

export function useAddVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/vendors', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Vendor added successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to add vendor');
    },
  });
}

export function useToggleVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/vendors', payload);
      return data;
    },
    onSuccess: (data, variables) => {
      const action = variables.vendor.isActive ? 'enabled' : 'disabled';
      toast.success(`Vendor ${action}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors });
    },
    onError: (err) => {
      toast.error('Failed to toggle vendor status');
      console.error(err);
    },
  });
}

export function useSendRouteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/route', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.metrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.logs });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors });
      queryClient.invalidateQueries({ queryKey: queryKeys.health });
    }
  });
}
