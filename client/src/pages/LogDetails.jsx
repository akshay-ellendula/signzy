import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRoutingLogById } from '../services/api';
import Badge from '../components/Badge';
import { formatDateTime, formatMs, formatCost, STRATEGY_LABELS } from '../utils/format';

export default function LogDetails() {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLog();
  }, [id]);

  const loadLog = async () => {
    try {
      setLoading(true);
      const res = await fetchRoutingLogById(id);
      setLog(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading log details...</div>;
  }

  if (error || !log) {
    return (
      <div className="p-8">
        <div className="rounded-md bg-rose-50 p-4 text-rose-600 border border-rose-200">
          Error: {error || 'Log not found'}
        </div>
        <Link to="/logs" className="mt-4 inline-block text-indigo-600 hover:underline">
          &larr; Back to Logs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/logs" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
            &larr; Back to Logs
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Request {log.requestId}</h2>
          <p className="mt-1 text-sm text-slate-500">{formatDateTime(log.timestamp)}</p>
        </div>
        <Badge variant={log.finalStatus.toLowerCase()}>{log.finalStatus}</Badge>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Request Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 pb-5 border-b border-slate-100">
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Capability</dt>
            <dd className="mt-1 font-semibold text-slate-900">{log.capability || 'General / Any'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Strategy Evaluated</dt>
            <dd className="mt-1 font-semibold text-slate-900">{STRATEGY_LABELS[log.routingStrategy] || log.routingStrategy || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Latency</dt>
            <dd className="mt-1 font-semibold text-slate-900">{formatMs(log.latencyMs)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cost</dt>
            <dd className="mt-1 font-semibold text-emerald-700">{formatCost(log.cost)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Final Vendor Used</dt>
            <dd className="mt-1 font-semibold text-slate-900">{log.selectedVendor || 'None (Failed)'}</dd>
          </div>
        </div>
        <div className="mt-5">
          <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Routing Reason</dt>
          <dd className="text-sm font-medium text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 leading-relaxed">
            {log.routingReason || 'No routing reason recorded.'}
          </dd>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-6">Execution & Failover Timeline</h3>
        <div className="space-y-4">
          {log.failoverHistory.map((entry, idx) => (
            <div key={idx} className="flex items-stretch gap-4">
              <div className="flex flex-col items-center shrink-0 w-8 pt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                {idx < log.failoverHistory.length - 1 && (
                  <div className="w-0.5 grow bg-slate-200 mt-2 min-h-[1.5rem]"></div>
                )}
              </div>
              <div className="grow p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-900">{entry.vendor}</span>
                  <Badge variant={entry.status.toLowerCase()}>{entry.status}</Badge>
                </div>
                <p className="text-sm text-slate-600">{entry.reason}</p>
                {entry.latencyMs > 0 && (
                  <p className="mt-2 text-xs font-medium text-slate-400">Response time: {formatMs(entry.latencyMs)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Original Request Payload</h3>
        {log.payload && typeof log.payload === 'object' && Object.keys(log.payload).length > 0 ? (
          <pre className="overflow-auto rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-100 shadow-inner">
            {JSON.stringify(log.payload, null, 2)}
          </pre>
        ) : (
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-sm text-slate-500 italic text-center">
            No request payload was provided or recorded for this execution.
          </div>
        )}
      </div>

    </div>
  );
}
