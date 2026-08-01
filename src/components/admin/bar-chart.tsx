export function BarChart({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{label}</h3>
      <div className="mt-3 flex h-32 items-end gap-1.5" role="img" aria-label={`${label} bar chart`}>
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1" title={`${item.label}: ${item.value}`}>
            <div
              className="w-full rounded-t bg-gradient-to-t from-purple-700/70 to-cyan-400/80"
              style={{ height: `${Math.max(2, Math.round((item.value / max) * 100))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((item) => (
          <div key={item.label} className="flex-1 truncate text-center text-[9px] text-slate-500">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
