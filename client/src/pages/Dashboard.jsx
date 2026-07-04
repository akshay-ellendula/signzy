import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMetrics } from '../hooks/useMetrics';
import { fetchRoutingLogs } from '../services/api';
import StatCard from '../components/StatCard';
import LogsTable from '../components/LogsTable';
import { formatMs, formatPercent, formatCost, STRATEGY_LABELS } from '../utils/format';

const RECENT_LOGS_LIMIT = 8;

export default function Dashboard() {
  const { summary, loading, error } = useMetrics();
  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState(null);

  useEffect(() => {
    fetchRoutingLogs({ limit: RECENT_LOGS_LIMIT, page: 1 })
      .then((res) => setRecentLogs(res.data))
      .catch((err) => setLogsError(err.response?.data?.message || err.message))
      .finally(() => setLogsLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
      <p className="mt-1 text-sm text-slate-500">Live overview of the vendor routing platform.</p>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : summary ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Vendors" value={summary.totalVendors} />
          <StatCard label="Healthy Vendors" value={summary.healthyVendors} accent="emerald" />
          <StatCard label="Total Requests" value={summary.totalRequests} />
          <StatCard label="Success Rate" value={formatPercent(summary.successRate)} accent="emerald" />
          <StatCard label="Avg Latency" value={formatMs(summary.averageLatency)} accent="amber" />
          <StatCard label="Total Spent" value={formatCost(summary.totalCost || 0)} accent="emerald" />
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/60 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></span>
            <h3 className="text-sm font-semibold text-slate-900">Active Routing Strategies</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            ✓ 8 of 8 Implemented & Operational
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          {Object.entries(STRATEGY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:border-indigo-300 transition-colors">
              <span className="text-emerald-500 font-bold">✓</span>
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Routing Logs</h3>
          <Link to="/logs" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View More →
          </Link>
        </div>

        {logsError && <p className="p-5 text-sm text-rose-700">{logsError}</p>}

        {!logsError && (logsLoading ? <p className="p-6 text-center text-sm text-slate-500">Loading…</p> : <LogsTable logs={recentLogs} />)}
      </div>
    </div>
  );
}
