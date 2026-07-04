export default function ProgressBar({ value = 0, label, colorClass }) {
  const clamped = Math.max(0, Math.min(100, value));
  const barColor =
    colorClass ||
    (clamped >= 80 ? 'bg-emerald-500' : clamped >= 50 ? 'bg-amber-500' : 'bg-rose-500');

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span>{clamped.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
