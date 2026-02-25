import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AuditLogPage() {
  // 1. Fetch Logs (Newest first, limit 100)
  const logs = await prisma.logActivity.findMany({
    orderBy: { timestamp: "desc" },
    take: 100, 
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-4 block transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">System Audit Logs</h1>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Last 100 Actions
        </div>
      </div>

      {/* LOG TABLE */}
      <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-6 pl-8 text-[10px] font-black uppercase tracking-widest text-gray-400 w-48">Timestamp</th>
                <th className="py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 w-32">Action</th>
                <th className="py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Target / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-xs text-gray-400 uppercase tracking-widest">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pl-8 text-xs font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleString("id-ID", { 
                        day: '2-digit', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                        log.action.includes("DELETE") ? "bg-red-100 text-red-600" :
                        log.action.includes("ARCHIVE") ? "bg-yellow-100 text-yellow-600" :
                        log.action.includes("CREATE") ? "bg-blue-100 text-blue-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 pr-8 text-xs font-bold text-gray-800">
                      {log.target}
                      {log.details && (
                        <span className="block text-[10px] font-normal text-gray-400 mt-1 font-mono">
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
  );
}