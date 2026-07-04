import { useHealth } from '../hooks/useHealth';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { formatMs } from '../utils/format';

export default function Health() {
  const { health, loading, error } = useHealth();

  const healthyCount = health?.vendors.filter((v) => v.healthStatus === 'healthy' && v.isActive).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Health Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Live vendor availability, refreshed every 5 seconds.</p>
        </div>
        {health && (
          <Badge variant={health.database === 'connected' ? 'success' : 'failure'}>DB: {health.database}</Badge>
        )}
      </div>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : health ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Vendors" value={health.vendors.length} />
            <StatCard label="Healthy & Active" value={healthyCount} accent="emerald" />
            <StatCard label="Server" value={health.server === 'ok' ? 'OK' : 'Down'} accent={health.server === 'ok' ? 'emerald' : 'rose'} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {health.vendors.map((vendor) => (
              <div key={vendor.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">{vendor.name}</h3>
                  <div className="flex gap-1.5">
                    <Badge variant={vendor.healthStatus}>{vendor.healthStatus}</Badge>
                    <Badge variant={vendor.isActive ? 'active' : 'down'}>{vendor.isActive ? 'up' : 'down'}</Badge>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">Current latency: {formatMs(vendor.currentLatency)}</p>
                <div className="mt-3 space-y-2">
                  <ProgressBar label="Success Rate" value={vendor.successRate} />
                  <ProgressBar label="Availability" value={vendor.availabilityPercentage} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
