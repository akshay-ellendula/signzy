import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchVendors } from '../services/api';
import { subscribeToSocket } from '../services/socket';

const AppContext = createContext(null);

// Holds the vendor list centrally so Vendor Management, Route Tester,
// Dashboard, and Health pages all stay in sync after a CRUD op or a route test.
export function AppProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState(null);

  const refreshVendors = useCallback(async () => {
    setVendorsLoading(true);
    setVendorsError(null);
    try {
      const { data } = await fetchVendors();
      setVendors(data);
    } catch (err) {
      setVendorsError(err.response?.data?.message || err.message);
    } finally {
      setVendorsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshVendors();
    const unsubscribe = subscribeToSocket((event) => {
      if (['VENDORS_UPDATE', 'TELEMETRY_REFRESH'].includes(event?.type)) {
        refreshVendors();
      }
    });
    return () => unsubscribe();
  }, [refreshVendors]);

  return (
    <AppContext.Provider value={{ vendors, vendorsLoading, vendorsError, refreshVendors }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
