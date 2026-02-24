"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsProps {
  overview: any;
  distribution: any[];
  trend: any[];
  composition: any[];
}

export default function ChartsClient({ overview, distribution, trend, composition }: AnalyticsProps) {
  // Colors for Pie Chart (Matches Permenpan RB Grades)
  const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444']; // Green, Blue, Yellow, Red

  return (
    <div className="space-y-8">
      
      {/* 1. EXECUTIVE OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Responden</p>
          <p className="text-4xl font-black mt-2">{overview.totalRespon}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nilai IKM</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black mt-2 text-blue-600">{overview.ikm}</p>
            <p className="text-xs font-bold text-gray-400 mb-1">/ 100</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rata-rata NRR</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black mt-2">{overview.nrr}</p>
            <p className="text-xs font-bold text-gray-400 mb-1">/ 4.00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pertumbuhan</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-3xl font-black ${Number(overview.comparison) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(overview.comparison) > 0 ? '+' : ''}{overview.comparison}%
            </span>
            <span className="text-[9px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">
               vs Last Period
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. WEAKEST LINK ANALYSIS (Bar Chart) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Distribusi Jawaban per Unsur</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 4]} hide />
                <YAxis dataKey="code" type="category" width={30} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" fill="#1A1A1A" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 text-center">Identifying Weakest Service Indicators (Scale 1-4)</p>
        </div>

        {/* 4. SATISFACTION COMPOSITION (Pie Chart) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Komposisi Kepuasan</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={composition}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {composition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. TREND ANALYSIS (Line Chart) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Tren Partisipasi Harian</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10}} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                tick={{fontSize: 10}} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} 
                activeDot={{r: 6}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}