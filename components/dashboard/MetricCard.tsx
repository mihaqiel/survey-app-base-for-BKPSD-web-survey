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
  accentColor = "#009CC5",
  delay = "",
}: MetricCardProps) {
  const textColor = accentColor === "#FAE705" ? "#132B4F" : accentColor;

  return (
    <div
      className={`animate-fade-up ${delay} bg-white border border-gray-200 overflow-hidden card-hover`}
    >
      <div className="h-1 animate-draw-line" style={{ backgroundColor: accentColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 leading-tight">
            {label}
          </p>
          {icon && (
            <span className="opacity-25 shrink-0" style={{ color: textColor }}>
              {icon}
            </span>
          )}
        </div>
        <p
          className="text-3xl font-black leading-none animate-count-up"
          style={{ color: textColor }}
        >
          {value}
        </p>
        {sub && <div className="mt-3">{sub}</div>}
      </div>
    </div>
  );
}
