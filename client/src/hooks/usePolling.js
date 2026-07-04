import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for polling data at regular intervals
 * @param {Function} fetchFn - Async function to call
 * @param {number} intervalMs - Polling interval in ms (default 5000)
 * @returns {{ data: any, loading: boolean, error: Error|null, refresh: Function }}
 */
export function usePolling(fetchFn, intervalMs = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { data, loading, error, refresh };
}
