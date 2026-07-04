import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchVendorById, createVendor, updateVendor } from '../services/api';
import { useAppContext } from '../context/AppContext';

const defaultForm = {
  name: '',
  priority: 1,
  weight: 1,
  costPerRequest: 0,
  timeoutMs: 3000,
  rateLimitPerMinute: 100,
  supportedFeatures: '',
  healthStatus: 'healthy',
  isActive: true,
};

export default function VendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshVendors } = useAppContext();
  
  const isEdit = Boolean(id);
  
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      loadVendor();
    }
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const res = await fetchVendorById(id);
      const vendor = res.data;
      setForm({
        name: vendor.name,
        priority: vendor.priority,
        weight: vendor.weight,
        costPerRequest: vendor.costPerRequest,
        timeoutMs: vendor.timeoutMs,
        rateLimitPerMinute: vendor.rateLimitPerMinute,
        supportedFeatures: (vendor.supportedFeatures || []).join(', '),
        healthStatus: vendor.healthStatus,
        isActive: vendor.isActive,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    const payload = {
      name: form.name.trim(),
      priority: Number(form.priority),
      weight: Number(form.weight),
      costPerRequest: Number(form.costPerRequest),
      timeoutMs: Number(form.timeoutMs),
      rateLimitPerMinute: Number(form.rateLimitPerMinute),
      supportedFeatures: form.supportedFeatures
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      healthStatus: form.healthStatus,
      isActive: form.isActive,
    };

    const toastId = toast.loading(isEdit ? `Updating vendor "${payload.name}"...` : `Creating vendor "${payload.name}"...`);
    try {
      if (isEdit) {
        await updateVendor(id, payload);
        toast.success(`Vendor "${payload.name}" updated successfully!`, { id: toastId });
      } else {
        await createVendor(payload);
        toast.success(`Vendor "${payload.name}" created successfully!`, { id: toastId });
      }
      refreshVendors();
      navigate('/vendors');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center text-sm text-slate-500">Loading vendor details...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/vendors" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
          &larr; Back to Vendors
        </Link>
        <h2 className="text-2xl font-semibold text-slate-900">{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h2>
        <p className="mt-1 text-sm text-slate-500">Configure the capabilities and constraints for this vendor.</p>
      </div>

      {error && <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="md:col-span-2 text-sm font-medium text-slate-800">
            Vendor Name
            <input
              required
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="e.g. AWS OCR Services"
            />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Routing Priority
            <input
              type="number"
              required
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Routing Weight (For percentage splitting)
            <input
              type="number"
              required
              value={form.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Cost / Request ($)
            <input
              type="number"
              step="0.001"
              required
              value={form.costPerRequest}
              onChange={(e) => handleChange('costPerRequest', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Timeout (ms)
            <input
              type="number"
              required
              value={form.timeoutMs}
              onChange={(e) => handleChange('timeoutMs', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>

          <label className="text-sm font-medium text-slate-800">
            Rate Limit (/min)
            <input
              type="number"
              required
              value={form.rateLimitPerMinute}
              onChange={(e) => handleChange('rateLimitPerMinute', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
          
          <label className="text-sm font-medium text-slate-800">
            Health Status
            <select
              value={form.healthStatus}
              onChange={(e) => handleChange('healthStatus', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="healthy">Healthy</option>
              <option value="unhealthy">Unhealthy</option>
            </select>
          </label>

          <label className="md:col-span-2 text-sm font-medium text-slate-800">
            Supported Features (Capabilities, comma-separated)
            <input
              value={form.supportedFeatures}
              onChange={(e) => handleChange('supportedFeatures', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="e.g. PAN_VERIFICATION, OCR, SMS"
            />
          </label>

          <label className="md:col-span-2 flex items-center gap-2 mt-2 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
            />
            Vendor is Active (Enable routing)
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-200">
          <Link
            to="/vendors"
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}
