import { prisma } from "@/lib/prisma";
import { FileText, ShieldAlert, Plus, RefreshCw, Archive, Bell, Search } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

function ActionBadge({ action }: { action: string }) {
  if (action.includes("DELETE"))  return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest"><ShieldAlert className="w-3 h-3" />{action}</span>;
  if (action.includes("ARCHIVE")) return <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest"><Archive className="w-3 h-3" />{action}</span>;
  if (action.includes("CREATE"))  return <span className="flex items-center gap-1 px-2 py-1 bg-[#009CC5]/10 text-[#009CC5] text-[9px] font-black uppercase tracking-widest"><Plus className="w-3 h-3" />{action}</span>;
  if (action.includes("UPDATE"))  return <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest"><RefreshCw className="w-3 h-3" />{action}</span>;
  return <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest">{action}</span>;
}

export default async function AuditLogPage() {
  const logs = await prisma.logActivity.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* GLOBAL HEADER */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div className="animate-slide-left">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Audit Log" }]} />
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none mt-0.5">System Audit Logs</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 animate-slide-right">
          <div className="hidden md:flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5 w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-400 font-medium">Search Global...</span>
          </div>
          <button aria-label="Notifikasi" className="w-8 h-8 flex items-center justify-center bg-[#F0F4F8] border border-gray-200 hover:bg-white transition-colors">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F4F8] border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <FileText className="w-3.5 h-3.5" />
            Last 100 Actions
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="animate-fade-up bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 animate-draw-line" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#132B4F]">
                  <th className="py-3 pl-8 pr-5 text-[9px] font-black uppercase tracking-widest text-white w-48">Timestamp</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-white w-44">Action</th>
                  <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-white">Target / Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-gray-200" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada aktivitas tercatat</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log: (typeof logs)[0], i) => (
                    <tr
                      key={log.id}
                      className={`transition-colors hover:bg-[#F0F4F8]/50 animate-fade-up ${i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"}`}
                      style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                    >
                      <td className="py-3.5 pl-8 pr-5 text-xs font-mono text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("id-ID", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-5">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="py-3.5 px-5 pr-8 text-xs font-bold text-[#132B4F]">
                        {log.target}
                        {log.details && (
                          <span className="block text-[10px] font-normal text-gray-400 mt-0.5 font-mono">{log.details}</span>
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