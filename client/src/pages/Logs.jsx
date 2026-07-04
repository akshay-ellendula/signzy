import { useLogs } from '../hooks/useLogs';
import { useAppContext } from '../context/AppContext';
import LogsTable from '../components/LogsTable';
import Pagination from '../components/Pagination';
import { STRATEGY_LABELS } from '../utils/format';

export default function Logs() {
  const { logs, pagination, filters, updateFilter, loading, error } = useLogs();
  const { vendors } = useAppContext();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Routing Logs</h2>
      <p className="mt-1 text-sm text-slate-500">Every routing decision, with full failover history.</p>

      <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search request ID, vendor, reason…"
          className="min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={filters.strategy}
          onChange={(e) => updateFilter('strategy', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Strategies</option>
          {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
        </select>
        <select
          value={filters.vendor}
          onChange={(e) => updateFilter('vendor', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v._id} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading logs…</p>
        ) : (
          <>
            <LogsTable logs={logs} />
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => updateFilter('page', p)} />
          </>
        )}
      </div>
    </div>
  );
}
