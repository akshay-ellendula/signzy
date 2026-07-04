import { useCallback, useEffect, useState } from 'react';
import { fetchRoutingLogs } from '../services/api';
import { subscribeToSocket } from '../services/socket';

const DEFAULT_FILTERS = { search: '', strategy: '', status: '', vendor: '', page: 1, limit: 7 };

export function useLogs() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 7, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      );
      const data = await fetchRoutingLogs(cleanParams);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToSocket((event) => {
      if (['LOG_UPDATE', 'TELEMETRY_REFRESH'].includes(event?.type)) {
        refresh();
      }
    });
    return () => unsubscribe();
  }, [refresh]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  return { logs, pagination, filters, updateFilter, loading, error, refresh };
}
