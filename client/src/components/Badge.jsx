const VARIANTS = {
  healthy: 'bg-emerald-100 text-emerald-700',
  unhealthy: 'bg-rose-100 text-rose-700',
  success: 'bg-emerald-100 text-emerald-700',
  failure: 'bg-rose-100 text-rose-700',
  timeout: 'bg-amber-100 text-amber-700',
  skipped: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  down: 'bg-slate-100 text-slate-700',
  neutral: 'bg-slate-100 text-slate-700',
};

export default function Badge({ variant = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${VARIANTS[variant] || VARIANTS.neutral}`}>
      {children}
    </span>
  );
}
