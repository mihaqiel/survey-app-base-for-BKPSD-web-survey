"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export interface ChartData {
  name: string;
  ikm: number;
  value?: number; // slice size (use count if available, else ikm)
  fill: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartData;
  return (
    <div className="bg-white border border-gray-200 px-3 py-2 shadow-lg" style={{ borderRadius: 0 }}>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 max-w-[160px] leading-tight">
        {d.name}
      </p>
      <p className="text-base font-black" style={{ color: d.fill }}>
        IKM {d.ikm}
      </p>
      {d.value !== undefined && d.value !== d.ikm && (
        <p className="text-[9px] font-bold text-gray-400 mt-0.5">{d.value} responden</p>
      )}
    </div>
  );
}

function Legend({ data }: { data: ChartData[] }) {
  return (
    <div className="flex flex-col gap-1.5 px-4 pb-4 overflow-y-auto" style={{ maxHeight: 120 }}>
      {data.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 shrink-0" style={{ backgroundColor: entry.fill }} />
          <span className="text-[10px] font-bold text-gray-500 truncate flex-1">{entry.name}</span>
          <span className="text-[10px] font-black tabular-nums shrink-0" style={{ color: entry.fill }}>
            {entry.ikm}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts({ data }: { data: ChartData[] }) {
  // Slice size: prefer explicit `value` field, fall back to ikm score
  const pieData = data.map(d => ({ ...d, _size: d.value ?? d.ikm }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="60%"
              paddingAngle={2}
              dataKey="_size"
              nameKey="name"
              strokeWidth={0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <Legend data={data} />
    </div>
  );
}