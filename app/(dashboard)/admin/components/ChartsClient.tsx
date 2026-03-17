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
  demographics: {
    gender: any[];
    education: any[];
    job: any[];
    disability: any[];
  };
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function ChartsClient({ overview, distribution, trend, composition, demographics }: AnalyticsProps) {

  const DemoPie = ({ data, title, colorOffset = 0 }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
      <h3 className="text-xs font-semibold text-slate-500 mb-4">{title}</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[(index + colorOffset) % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip contentStyle={{borderRadius: '12px'}} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* 1. OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Responden</p>
          <p className="text-4xl font-bold mt-2 text-slate-900">{overview.totalRespon}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Nilai IKM</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold mt-2 text-blue-600">{overview.ikm}</p>
            <p className="text-xs font-semibold text-slate-400 mb-1">/ 100</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Rata-rata NRR</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold mt-2 text-slate-900">{overview.nrr}</p>
            <p className="text-xs font-semibold text-slate-400 mb-1">/ 4.00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Pertumbuhan</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-3xl font-bold ${Number(overview.comparison) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(overview.comparison) > 0 ? '+' : ''}{overview.comparison}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 mb-6">Distribusi Jawaban (Weakest Link)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 4]} hide />
                <YAxis dataKey="code" type="category" width={30} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px'}} />
                <Bar dataKey="value" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 mb-6">Komposisi Kepuasan</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={composition} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {composition.map((entry: any, index: number) => (
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

      {/* 3. DEMOGRAPHIC SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-6 pl-3 border-l-4 border-blue-600">
          Profil Responden
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DemoPie data={demographics.gender} title="Jenis Kelamin" colorOffset={0} />
          <DemoPie data={demographics.education} title="Pendidikan" colorOffset={2} />
          <DemoPie data={demographics.job} title="Pekerjaan" colorOffset={4} />
          <DemoPie data={demographics.disability} title="Penyandang Disabilitas" colorOffset={6} />
        </div>
      </div>

      {/* 4. TREND CHART */}
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-500 mb-6">Tren Partisipasi</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
              <Tooltip contentStyle={{borderRadius: '12px'}} />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{r:4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
