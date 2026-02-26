"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  ikm: number;
  fill: string;
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{d.name}</p>
        <p className="text-lg font-black" style={{ color: d.payload.fill }}>IKM {d.value}</p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex flex-col gap-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
      {payload?.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.payload.fill }} />
          <span className="text-[10px] font-bold text-gray-500 truncate">{entry.value}</span>
          <span className="text-[10px] font-black ml-auto shrink-0" style={{ color: entry.payload.fill }}>
            {entry.payload.ikm}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius="35%"
          outerRadius="65%"
          paddingAngle={3}
          dataKey="ikm"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          content={<CustomLegend />}
          verticalAlign="bottom"
          align="center"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}