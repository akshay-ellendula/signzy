import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchRoutingConfigs, routeRequest } from '../services/api';
import toast from 'react-hot-toast';
import ResponseViewer from '../components/ResponseViewer';
import { STRATEGY_LABELS } from '../utils/format';
import { DEFAULT_PAYLOAD as DEFAULT_PAYLOAD_OBJ, examplePayloadFor } from '../utils/capabilityPayloads';

const DEFAULT_PAYLOAD = JSON.stringify(DEFAULT_PAYLOAD_OBJ, null, 2);

export default function RouteTester() {
  const { vendors } = useAppContext();
  const capabilities = useMemo(
    () => Array.from(new Set(vendors.flatMap((v) => v.supportedFeatures || []))).sort(),
    [vendors]
  );

  const [capability, setCapability] = useState('');
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOAD);
  const [strategy, setStrategy] = useState('priority');
  const [maxLatencyMs, setMaxLatencyMs] = useState('');
  const [preferLowCost, setPreferLowCost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [savedConfigs, setSavedConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');

  useEffect(() => {
    fetchRoutingConfigs()
      .then((res) => setSavedConfigs(res.data))
      .catch(() => setSavedConfigs([]));
  }, []);

  const selectedConfig = savedConfigs.find((c) => c._id === selectedConfigId) || null;

  const handleSelectConfig = (id) => {
    setSelectedConfigId(id);
    const cfg = savedConfigs.find((c) => c._id === id);
    if (cfg) setStrategy(cfg.strategy);
  };

  const handleCapabilityChange = (value) => {
    setCapability(value);
    setPayloadText(JSON.stringify(examplePayloadFor(value), null, 2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    let payload;
    try {
      payload = payloadText.trim() ? JSON.parse(payloadText) : {};
    } catch {
      setError('Payload must be valid JSON');
      toast.error('Payload must be valid JSON');
      return;
    }

    const requirements = {};
    if (maxLatencyMs !== '') requirements.maxLatencyMs = Number(maxLatencyMs);
    if (preferLowCost) requirements.preferLowCost = true;

    setLoading(true);
    const toastId = toast.loading('Evaluating routing rules & ranking vendors...');
    try {
      const data = await routeRequest({
        capability: capability || undefined,
        payload,
        strategy,
        requirements: Object.keys(requirements).length ? requirements : undefined,
        conditions: selectedConfig?.conditions?.length ? selectedConfig.conditions : undefined,
      });
      setResult(data);
      if (data?.success || data?.status === 'SUCCESS') {
        toast.success(`Routed successfully to ${data.vendorUsed || 'vendor'} (${data.latencyMs || 0}ms)`, { id: toastId });
      } else {
        toast.error(`Routing resulted in status: ${data?.status || 'FAILED'}`, { id: toastId });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Route Tester</h2>
      <p className="mt-1 text-sm text-slate-500">Send a simulated request through the routing engine.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Saved AI Rule Config (optional)
            <select
              value={selectedConfigId}
              onChange={(e) => handleSelectConfig(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Using Ai policy</option>
              {savedConfigs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.sourceText.slice(0, 80)}
                  {c.sourceText.length > 80 ? '…' : ''}
                </option>
              ))}
            </select>
            {selectedConfig && (
              <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/90 p-4 text-xs text-indigo-950 shadow-sm transition-all duration-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-200/80 font-semibold text-indigo-900">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    Selected Rule Details
                  </span>
                  <span className="rounded-md bg-indigo-600 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-white font-bold shadow-xs">
                    {selectedConfig.strategy}
                  </span>
                </div>
                <div className="mb-2.5 text-sm leading-relaxed text-indigo-950 font-medium">
                  "{selectedConfig.sourceText}"
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-indigo-900/90 bg-white/60 p-2.5 rounded-lg border border-indigo-100">
                  <div>
                    <span className="font-semibold text-indigo-950">Capability:</span> {selectedConfig.capability || 'Any (Global)'}
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-950">Active Conditions:</span> {selectedConfig.conditions?.length || 0}
                  </div>
                  {selectedConfig.appliedToVendors?.length > 0 && (
                    <div className="col-span-2">
                      <span className="font-semibold text-indigo-950">Applied Vendors:</span>{' '}
                      <span className="font-mono text-indigo-700 font-semibold">{selectedConfig.appliedToVendors.join(', ')}</span>
                    </div>
                  )}
                </div>
                {selectedConfig.conditions?.length > 0 && (
                  <div className="mt-2.5 rounded-lg bg-indigo-950 p-2.5 font-mono text-[11px] text-indigo-200 max-h-32 overflow-y-auto">
                    <div className="text-[10px] uppercase tracking-wider text-indigo-400 mb-1 font-semibold">Ranking Conditions:</div>
                    {selectedConfig.conditions.map((cond, idx) => (
                      <div key={idx} className="py-0.5 border-b border-indigo-900/50 last:border-0">
                        • <span className="text-amber-300 font-semibold">{cond.field || cond.metric}</span> {cond.operator} <span className="text-emerald-300 font-semibold">{JSON.stringify(cond.value)}</span> {cond.action ? `→ ${cond.action} ${cond.vendor || ''}` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Capability
            <select
              value={capability}
              onChange={(e) => handleCapabilityChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Any</option>
              {capabilities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Routing Strategy
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Payload (JSON) <span className="font-normal text-slate-400">(auto-filled per capability, editable)</span>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <div className="mt-4 rounded-md border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Requirements <span className="font-normal normal-case text-slate-400">(optional, per-request overrides)</span>
            </p>
            <label className="block text-sm font-medium text-slate-700">
              Max Latency (ms)
              <input
                type="number"
                min="0"
                value={maxLatencyMs}
                onChange={(e) => setMaxLatencyMs(e.target.value)}
                placeholder="uses the global default if left blank"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={preferLowCost}
                onChange={(e) => setPreferLowCost(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Prefer low cost (defaults the strategy to Lowest Cost when no strategy is explicitly needed)
            </label>
          </div>

          {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Routing…' : 'Route Request'}
          </button>
        </form>

        <div>
          {result ? (
            <ResponseViewer result={result} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
              Submit a request to see the standard response here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
