import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AuditLogPage() {
  const logs = await prisma.logActivity.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-7 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Sistem</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none">System Audit Logs</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin"
            className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
            ← Dashboard
          </Link>
          <div className="px-4 py-2 bg-[#F0F4F8] border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Last 100 Actions
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#132B4F]">
                  <th className="py-3 pl-8 pr-5 text-[9px] font-black uppercase tracking-widest text-white w-48">Timestamp</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-white w-36">Action</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-white">Target / Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada aktivitas tercatat</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log: (typeof logs)[0], i) => (
                    <tr key={log.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"}>
                      <td className="py-3.5 pl-8 pr-5 text-xs font-mono text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("id-ID", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                          log.action.includes("DELETE") ? "bg-red-100 text-red-600" :
                          log.action.includes("ARCHIVE") ? "bg-amber-100 text-amber-700" :
                          log.action.includes("CREATE") ? "bg-[#009CC5]/10 text-[#009CC5]" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 pr-8 text-xs font-bold text-[#132B4F]">
                        {log.target}
                        {log.details && (
                          <span className="block text-[10px] font-normal text-gray-400 mt-0.5 font-mono">
                            {log.details}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}