import { useCallback, useEffect, useState } from 'react';
import { fetchHealth } from '../services/api';
import { subscribeToSocket } from '../services/socket';

export function useHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToSocket((event) => {
      if (['HEALTH_UPDATE', 'TELEMETRY_REFRESH', 'VENDORS_UPDATE'].includes(event?.type)) {
        refresh();
      }
    });
    return () => unsubscribe();
  }, [refresh]);

  return { health, loading, error, refresh };
}
