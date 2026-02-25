"use client";

interface EmployeeStat {
  id: string;
  nama: string;
  count: number;
  ikm: number;
}

export default function EmployeeTable({ data }: { data: EmployeeStat[] }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Kinerja Petugas
          </h3>
          <p className="text-[10px] text-gray-300 font-bold uppercase mt-1">Top 10 Petugas Teraktif</p>
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Nama Petugas</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Respon</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">IKM</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-xs font-bold text-gray-300 italic">
                  Belum ada data petugas untuk layanan ini.
                </td>
              </tr>
            ) : (
              data.map((emp, idx) => (
                <tr key={emp.id} className="group border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-black group-hover:bg-black group-hover:text-white transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{emp.nama}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-sm font-black text-gray-900">{emp.count}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-black text-xs">
                      {emp.ikm.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}