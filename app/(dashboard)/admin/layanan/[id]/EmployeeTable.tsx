"use client";

import { Users } from "lucide-react";

interface EmployeeStat {
  id: string;
  nama: string;
  count: number;
  ikm: number;
}

function ikmInfo(ikm: number) {
  if (ikm >= 88.31) return { label: "Sangat Baik", color: "#16a34a", bg: "bg-green-50",  text: "text-green-700" };
  if (ikm >= 76.61) return { label: "Baik",        color: "#3b82f6", bg: "bg-blue-50",   text: "text-blue-700" };
  if (ikm >= 65.0)  return { label: "Kurang Baik", color: "#d97706", bg: "bg-amber-50",  text: "text-amber-700" };
  return                   { label: "Tidak Baik",  color: "#dc2626", bg: "bg-red-50",    text: "text-red-600" };
}

export default function EmployeeTable({ data }: { data: EmployeeStat[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Kinerja Pegawai</p>
          <p className="text-xs text-slate-400 mt-0.5">Top {data.length} Pegawai Teraktif</p>
        </div>
        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="py-3 pl-6 text-xs font-semibold text-slate-500">#</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500">Nama Pegawai</th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-500 text-center">Responden</th>
              <th className="py-3 pr-6 text-xs font-semibold text-slate-500 text-right">IKM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8 text-gray-200" />
                    <p className="text-xs font-medium text-gray-300">Belum ada data pegawai</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((emp, idx) => {
                const ei = ikmInfo(emp.ikm);
                const barPct = (emp.count / maxCount) * 100;
                return (
                  <tr
                    key={emp.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="py-3.5 pl-6">
                      <div className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-md ${
                        idx === 0 ? "bg-amber-50 text-amber-600" :
                        idx === 1 ? "bg-slate-100 text-slate-600" :
                        "bg-gray-50 text-gray-400"
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-900">{emp.nama}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: ei.color }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{emp.count}</span>
                    </td>
                    <td className="py-3.5 pr-6 text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ei.bg} ${ei.text}`}>
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
