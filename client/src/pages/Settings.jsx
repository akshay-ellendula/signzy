import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchSettings, updateSettings } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchSettings();
      setSettings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Saving system routing settings...');
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const res = await updateSettings(settings);
      setSettings(res.data);
      setSuccess(true);
      toast.success('System settings saved successfully!', { id: toastId });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading settings...</div>;
  }

  if (error && !settings) {
    return <div className="text-rose-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Global Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dynamically control simulator behavior, latency thresholds, and circuit breaker configuration without restarting the server.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-rose-50 p-4 border border-rose-200 text-sm text-rose-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-md bg-emerald-50 p-4 border border-emerald-200 text-sm text-emerald-600">
          Settings updated successfully! Changes take effect immediately.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Simulator Settings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-800">Simulator Probabilities</h2>
            <p className="text-xs text-slate-500 mt-1">Relative weights for random vendor outcomes (normalized internally).</p>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Success Rate</label>
              <input
                type="number"
                name="SIM_SUCCESS_RATE"
                value={settings.SIM_SUCCESS_RATE || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Failure Rate</label>
              <input
                type="number"
                name="SIM_FAILURE_RATE"
                value={settings.SIM_FAILURE_RATE || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Timeout Rate</label>
              <input
                type="number"
                name="SIM_TIMEOUT_RATE"
                value={settings.SIM_TIMEOUT_RATE || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
          </div>
        </div>

        {/* Routing Thresholds */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-800">Routing & Failover Thresholds</h2>
            <p className="text-xs text-slate-500 mt-1">Configure when vendors are skipped or timed out.</p>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Latency Exclusion Threshold (ms)</label>
              <p className="text-xs text-slate-500 mb-2">Vendors with current latency above this are skipped.</p>
              <input
                type="number"
                name="LATENCY_THRESHOLD_MS"
                value={settings.LATENCY_THRESHOLD_MS || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Default Timeout (ms)</label>
              <p className="text-xs text-slate-500 mb-2">Used if a vendor does not specify its own timeout.</p>
              <input
                type="number"
                name="DEFAULT_TIMEOUT_MS"
                value={settings.DEFAULT_TIMEOUT_MS || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
          </div>
        </div>

        {/* Circuit Breaker */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-800">Circuit Breaker & Health</h2>
            <p className="text-xs text-slate-500 mt-1">Controls how vendors are marked unhealthy and when they recover.</p>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">High Error Rate Threshold (%)</label>
              <input
                type="number"
                name="HIGH_ERROR_RATE_THRESHOLD"
                value={settings.HIGH_ERROR_RATE_THRESHOLD || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Min Samples for Health Check</label>
              <input
                type="number"
                name="MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK"
                value={settings.MIN_SAMPLE_SIZE_FOR_HEALTH_CHECK || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Cooldown / Half-Open (ms)</label>
              <input
                type="number"
                name="CIRCUIT_BREAKER_COOLDOWN_MS"
                value={settings.CIRCUIT_BREAKER_COOLDOWN_MS || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
          </div>
        </div>

        {/* Caching & Rate Limiting */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-800">System</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Rate Limit Window (ms)</label>
              <p className="text-xs text-slate-500 mb-2">Rolling window for API rate limits.</p>
              <input
                type="number"
                name="RATE_LIMIT_WINDOW_MS"
                value={settings.RATE_LIMIT_WINDOW_MS || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Vendor Cache TTL (ms)</label>
              <p className="text-xs text-slate-500 mb-2">How long vendor list is cached in memory.</p>
              <input
                type="number"
                name="VENDOR_CACHE_TTL_MS"
                value={settings.VENDOR_CACHE_TTL_MS || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div className="md:col-span-2 pt-4 border-t border-slate-100">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="STRICT_AI_MODE"
                  name="STRICT_AI_MODE"
                  checked={settings.STRICT_AI_MODE || false}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="STRICT_AI_MODE" className="ml-2 block text-sm text-slate-900 font-medium">
                  Strict Agentic AI Mode (Disable Fallback)
                </label>
              </div>
              <p className="ml-6 mt-1 text-xs text-slate-500">
                If checked, rule generation will strictly require the Gemini AI to function and will throw an error if unavailable. If unchecked, it will fall back to a regex parser.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
