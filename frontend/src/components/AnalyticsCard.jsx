export default function AnalyticsCard({ label, value, sub, color = 'indigo', icon }) {
  const colors = {
    indigo: 'from-indigo-600/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
    cyan: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    rose: 'from-rose-600/20 to-rose-500/5 border-rose-500/20 text-rose-400',
    
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-800 text-sm font-medium">
          {label}
        </p>

        {icon && (
          <span className="text-xl">
            {icon}
          </span>
        )}
      </div>

      <p className="text-3xl font-bold text-slate-900">
        {typeof value === 'number'
          ? value.toLocaleString()
          : value}
      </p>

      {sub && (
        <p className="text-xs text-slate-700 mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}