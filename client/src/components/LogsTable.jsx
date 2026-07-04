import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { STRATEGY_LABELS, formatDateTime, formatMs, formatCost } from '../utils/format';

export default function LogsTable({ logs }) {
  if (logs.length === 0) {
    return <p className="p-6 text-center text-sm text-slate-500">No routing logs match your filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="glass-card rounded-xl p-3 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
          <tr>
            {['Request ID', 'Timestamp', 'Capability', 'Vendor', 'Strategy', 'Status', 'Latency', 'Cost', ''].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-700">
                {h}
              </th>
            ))}
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-transparent">
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="whitespace-nowrap px-4 py-3">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-200 transition-colors cursor-pointer" title={`Full ID: ${log.requestId}`}>
                  #{log.requestId.split('-')[0]}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDateTime(log.timestamp)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{log.capability || '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{log.selectedVendor || '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                {STRATEGY_LABELS[log.routingStrategy] || log.routingStrategy}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Badge variant={log.finalStatus.toLowerCase()}>{log.finalStatus}</Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatMs(log.latencyMs)}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-emerald-700">{formatCost(log.cost)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Link
                  to={`/logs/${log._id}`}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
