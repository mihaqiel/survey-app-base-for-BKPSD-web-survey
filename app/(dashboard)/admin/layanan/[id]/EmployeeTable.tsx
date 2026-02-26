"use client";

interface EmployeeStat {
  id: string;
  nama: string;
  count: number;
  ikm: number;
}

function ikmInfo(ikm: number) {
  if (ikm >= 88.31) return { label: "Sangat Baik", color: "#16a34a", bg: "bg-green-100", text: "text-green-700" };
  if (ikm >= 76.61) return { label: "Baik", color: "#009CC5", bg: "bg-[#009CC5]/10", text: "text-[#009CC5]" };
  if (ikm >= 65.0)  return { label: "Kurang Baik", color: "#d97706", bg: "bg-amber-100", text: "text-amber-700" };
  return { label: "Tidak Baik", color: "#dc2626", bg: "bg-red-100", text: "text-red-600" };
}

export default function EmployeeTable({ data }: { data: EmployeeStat[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="h-0.5" style={{ background: "linear-gradient(to right, #132B4F, #009CC5)" }} />

      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#132B4F]" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Kinerja Pegawai</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Top {data.length} Pegawai Teraktif</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-[#F0F4F8] flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#132B4F]">
              <th className="py-3 pl-6 text-[9px] font-black uppercase tracking-widest text-white">#</th>
              <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white">Nama Pegawai</th>
              <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-white text-center">Responden</th>
              <th className="py-3 pr-6 text-[9px] font-black uppercase tracking-widest text-white text-right">IKM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data pegawai</p>
                </td>
              </tr>
            ) : (
              data.map((emp, idx) => {
                const ei = ikmInfo(emp.ikm);
                const barPct = (emp.count / maxCount) * 100;
                return (
                  <tr key={emp.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"}>
                    {/* Rank */}
                    <td className="py-3.5 pl-6">
                      <div className={`w-6 h-6 flex items-center justify-center text-[9px] font-black ${
                        idx === 0 ? "bg-[#FAE705] text-[#132B4F]" :
                        idx === 1 ? "bg-[#132B4F] text-white" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    {/* Name + bar */}
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-bold text-[#132B4F]">{emp.nama}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-gray-100 overflow-hidden max-w-[120px]">
                          <div className="h-full bg-[#009CC5]" style={{ width: `${barPct}%` }} />
                        </div>
                      </div>
                    </td>
                    {/* Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-[#009CC5]/10 text-[#009CC5] text-xs font-black">{emp.count}</span>
                    </td>
                    {/* IKM */}
                    <td className="py-3.5 pr-6 text-right">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest ${ei.bg} ${ei.text}`}>
                        {emp.ikm.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}