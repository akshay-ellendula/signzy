import { useHealth } from '../api/queries';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function HealthPage() {
  const { data: healthData, isLoading: loading, error: fetchError } = useHealth();
  const error = fetchError?.message || null;

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-500 animate-pulse tracking-widest">LOADING...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center animate-fade-in">
        <ShieldAlert size={80} className="text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]" />
        <h1 className="text-5xl font-extrabold text-red-500 tracking-tighter mb-4">SYSTEM ERROR</h1>
        <p className="text-slate-400 max-w-lg text-center">{error}</p>
      </div>
    );
  }

  const isUp = healthData?.status === 'UP';

  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="glass-card flex flex-col items-center p-12 min-w-[450px] text-center border-t-4 border-t-indigo-500/50">
        {isUp ? (
          <ShieldCheck size={96} className="text-emerald-400 mb-8 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]" />
        ) : (
          <ShieldAlert size={96} className="text-red-500 mb-8 drop-shadow-[0_0_40px_rgba(239,68,68,0.4)]" />
        )}
        
        <h1 className={`text-6xl font-extrabold m-0 tracking-tighter ${isUp ? 'text-emerald-400' : 'text-red-500'}`}>
          {healthData?.status || 'UNKNOWN'}
        </h1>
        <p className="text-slate-400 mt-2 mb-10 text-lg font-medium tracking-wide">System Health Status</p>

        <div className="grid grid-cols-2 gap-6 w-full">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-white mb-1">
              {healthData?.summary?.healthyVendors} <span className="text-xl text-slate-500">/ {healthData?.summary?.totalVendors}</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Healthy Vendors</div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-white mb-1">{healthData?.summary?.capabilities}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Capabilities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
