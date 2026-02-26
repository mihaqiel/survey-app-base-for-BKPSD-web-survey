
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";

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
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{d.payload.name}</p>
        <p className="text-lg font-black" style={{ color: d.fill }}>IKM {d.value}</p>
      </div>
    );
  }
  return null;
}

export default function DashboardCharts({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        barSize={10}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 9, fontWeight: 700, fill: "#9CA3AF" }}
          tickLine={false}
          axisLine={false}
          ticks={[0, 25, 50, 65, 76.61, 88.31, 100]}
          tickFormatter={(v) => v === 76.61 ? "76.6" : v === 88.31 ? "88.3" : String(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 10, fontWeight: 700, fill: "#6B7280" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
        <Bar dataKey="ikm" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
