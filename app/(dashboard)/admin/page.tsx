import { getAdminDashboardStats } from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import Link from "next/link";
import DashboardCharts from "./components/DashboardCharts";

function ikmColor(ikm: number) {
  if (ikm === 0) return "#94a3b8";
  if (ikm >= 88.31) return "#16a34a";
  if (ikm >= 76.61) return "#009CC5";
  if (ikm >= 65.00) return "#d97706";
  return "#dc2626";
}

function ikmLabel(ikm: number) {
  if (ikm === 0) return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65.00) return "Kurang Baik";
  return "Tidak Baik";
}

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400" style={{ backgroundColor: "#F0F4F8" }}>
        <p className="text-xs font-mono uppercase tracking-widest mb-4">System Not Initialized</p>
        <Link href="/admin/settings" className="px-6 py-3 text-white rounded-xl text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: "#132B4F" }}>
          Go to Settings
        </Link>
      </div>
    );
  }

  const overallIkm = stats.totalResponses > 0
    ? parseFloat((stats.services.reduce((acc, s) => acc + (s.ikm * s.count), 0) / stats.totalResponses).toFixed(1))
    : 0;

  const servicesWithData = stats.services.filter(s => s.count > 0);
  const top5 = [...stats.services].sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount = Math.max(...top5.map(s => s.count), 1);

  const ikmChartData = servicesWithData
    .sort((a, b) => b.ikm - a.ikm)
    .map(s => ({
      name: s.nama.length > 20 ? s.nama.substring(0, 20) + "…" : s.nama,
      ikm: s.ikm,
      fill: ikmColor(s.ikm)
    }));

  const best = servicesWithData.length > 0
    ? servicesWithData.reduce((a, b) => a.ikm > b.ikm ? a : b)
    : null;

  return (
    <div className="h-screen font-sans flex flex-col overflow-hidden p-6" style={{ backgroundColor: "#F0F4F8", color: "#132B4F" }}>
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full gap-4">

        {/* HEADER */}
        <div className="flex justify-between items-center shrink-0">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-0.5" style={{ color: "#009CC5" }}>
              BKPSDM Kepulauan Anambas
            </p>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: "#132B4F" }}>
              Dashboard
            </h1>
          </div>
          <form action={logout}>
            <button className="px-4 py-2 bg-white border text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition shadow-sm border-red-100">
              Log Out
            </button>
          </form>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4" style={{ borderLeftColor: "#009CC5" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#009CC5" }}>Total Responses</p>
            <p className="text-3xl font-black" style={{ color: "#132B4F" }}>{stats.totalResponses}</p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: "#FAE705", color: "#132B4F" }}>● Live</span>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4" style={{ borderLeftColor: "#FAE705" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#132B4F" }}>Services</p>
            <p className="text-3xl font-black" style={{ color: "#132B4F" }}>{stats.services.length}</p>
            <p className="text-[9px] font-bold mt-1 text-gray-400">{servicesWithData.length} with responses</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4" style={{ borderLeftColor: overallIkm > 0 ? ikmColor(overallIkm) : "#e2e8f0" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#132B4F" }}>Overall IKM</p>
            <p className="text-3xl font-black" style={{ color: ikmColor(overallIkm) }}>
              {overallIkm > 0 ? overallIkm : "—"}
            </p>
            <p className="text-[9px] font-bold mt-1" style={{ color: ikmColor(overallIkm) }}>{ikmLabel(overallIkm)}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4" style={{ borderLeftColor: "#132B4F" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#132B4F" }}>Best Service</p>
            {best ? (
              <>
                <p className="text-sm font-black leading-tight line-clamp-2" style={{ color: "#132B4F" }}>{best.nama}</p>
                <p className="text-[9px] font-bold mt-1" style={{ color: ikmColor(best.ikm) }}>IKM {best.ikm}</p>
              </>
            ) : <p className="text-sm font-black text-gray-300 mt-1">No data yet</p>}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex gap-3 flex-1 min-h-0">

          {/* IKM CHART */}
          <div className="bg-white rounded-2xl shadow-sm flex flex-col flex-1 min-w-0">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#132B4F" }}>IKM per Service</h3>
              <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block"/>Sangat Baik</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#009CC5" }}/>Baik</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"/>Kurang Baik</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"/>Tidak Baik</span>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-3">
              {ikmChartData.length > 0 ? (
                <DashboardCharts data={ikmChartData} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-300">No data yet — responses will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* TOP 5 */}
          <div className="bg-white rounded-2xl shadow-sm w-64 shrink-0 flex flex-col">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#132B4F" }}>Top Services</h3>
              <Link href="/admin/layanan" className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors">
                All →
              </Link>
            </div>
            <div className="flex-1 px-4 py-3 flex flex-col gap-2">
              {top5.map((svc, i) => (
                <Link key={svc.id} href={`/admin/layanan/${svc.id}`}
                  className="flex items-center gap-3 group hover:bg-gray-50 rounded-xl px-2 py-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-colors"
                    style={{ backgroundColor: i === 0 ? "#FAE705" : "#F0F4F8", color: "#132B4F" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: "#132B4F" }}>{svc.nama}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(svc.count / maxCount) * 100}%`, backgroundColor: "#009CC5" }} />
                      </div>
                      <span className="text-[9px] font-black text-gray-400 shrink-0">{svc.count}</span>
                    </div>
                  </div>
                  {svc.ikm > 0 && (
                    <span className="text-[10px] font-black shrink-0" style={{ color: ikmColor(svc.ikm) }}>
                      {svc.ikm}
                    </span>
                  )}
                </Link>
              ))}
              {top5.every(s => s.count === 0) && (
                <div className="flex-1 flex items-center justify-center text-gray-300">
                  <p className="text-xs font-bold">No responses yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}