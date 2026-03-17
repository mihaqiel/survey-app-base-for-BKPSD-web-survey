interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  accentColor?: string;
  delay?: string;
}

export default function MetricCard({
  label,
  value,
  sub,
  icon,
  accentColor = "#3b82f6",
  delay = "",
}: MetricCardProps) {
  return (
    <div
      className={`${delay} bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 leading-tight">
            {label}
          </p>
          {icon && (
            <span className="opacity-25 shrink-0" style={{ color: accentColor }}>
              {icon}
            </span>
          )}
        </div>
        <p
          className="text-3xl font-bold leading-none"
          style={{ color: accentColor }}
        >
          {value}
        </p>
        {sub && <div className="mt-3">{sub}</div>}
      </div>
    </div>
  );
}
