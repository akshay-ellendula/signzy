import { Link } from 'react-router-dom';
import Badge from './Badge';
import { formatCost, formatPercent } from '../utils/format';

export default function VendorTable({ vendors, onDelete }) {
  if (vendors.length === 0) {
    return <p className="p-6 text-center text-sm text-slate-500">No vendors yet. Add one to get started.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="glass-card rounded-xl p-3 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
          <tr>
            {['Name', 'Cost', 'Rate Limit', 'Status', 'Success Rate', 'Availability', ''].map(
              (h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-700">
                  {h}
                </th>
              )
            )}
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-transparent">
          {vendors.map((vendor) => (
            <tr key={vendor._id}>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{vendor.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatCost(vendor.costPerRequest)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{vendor.rateLimitPerMinute}/min</td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex gap-1.5">
                  <Badge variant={vendor.healthStatus}>{vendor.healthStatus}</Badge>
                  <Badge variant={vendor.isActive ? 'active' : 'down'}>{vendor.isActive ? 'up' : 'down'}</Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatPercent(vendor.metrics?.successRate)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatPercent(vendor.metrics?.availabilityPercentage)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Link
                  to={`/vendors/${vendor._id}`}
                  className="mr-3 font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View / Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(vendor)}
                  className="font-medium text-rose-600 hover:text-rose-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
