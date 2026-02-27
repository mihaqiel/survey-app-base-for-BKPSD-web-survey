export const dynamic = "force-dynamic";

import { getAdminDashboardStats } from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import Link from "next/link";
import DashboardCharts from "./components/DashboardCharts";
import GlobalExportButton from "./GlobalExportButton";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8]">
        <p className="text-xs font-mono uppercase tracking-widest mb-4 text-gray-400">System Not Initialized</p>
        <Link href="/admin/settings" className="px-6 py-3 text-white text-xs font-black uppercase tracking-widest bg-[#132B4F]">
          Go to Settings →
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
      name: s.nama.length > 22 ? s.nama.substring(0, 22) + "…" : s.nama,
      ikm: s.ikm,
      fill: ikmColor(s.ikm)
    }));

  const best = servicesWithData.length > 0
    ? servicesWithData.reduce((a, b) => a.ikm > b.ikm ? a : b)
    : null;

  return (
    <div className="min-h-screen lg:h-screen font-sans flex flex-col overflow-x-hidden bg-[#F0F4F8]">

      {/* TOP NAV BAR */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
        {/* Left: spacer for mobile hamburger + title */}
        <div className="flex items-center gap-3">
          <div className="w-9 lg:hidden" /> {/* spacer for hamburger button */}
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5] hidden sm:block">BKPSDM Kepulauan Anambas</p>
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none">Dashboard SKM</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#FAE705]/20 px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#132B4F]">Sistem Aktif</span>
          </div>
          <div className="hidden sm:block">
            <GlobalExportButton />
          </div>
          <form action={logout}>
            <button className="px-3 lg:px-4 py-2 bg-white border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
              Log Out
            </button>
          </form>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-4 lg:gap-5">

          {/* STAT CARDS — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 shrink-0">
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1 bg-[#009CC5]" />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#009CC5] mb-2">Total Responden</p>
                <p className="text-3xl lg:text-4xl font-black text-[#132B4F] leading-none">{stats.totalResponses}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1 bg-[#FAE705]" />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Layanan</p>
                <p className="text-3xl lg:text-4xl font-black text-[#132B4F] leading-none">{stats.services.length}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-3">{servicesWithData.length} memiliki respons</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1" style={{ backgroundColor: overallIkm > 0 ? ikmColor(overallIkm) : "#e2e8f0" }} />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Overall IKM</p>
                <p className="text-3xl lg:text-4xl font-black leading-none" style={{ color: ikmColor(overallIkm) }}>
                  {overallIkm > 0 ? overallIkm : "—"}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: ikmColor(overallIkm) }}>
                  {ikmLabel(overallIkm)}
                </p>
              </div>
            </div>

            <div className="bg-[#132B4F] overflow-hidden">
              <div className="h-1 bg-[#FAE705]" />
              <div className="p-4 lg:p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Layanan Terbaik</p>
                {best ? (
                  <>
                    <p className="text-sm font-black text-white leading-tight line-clamp-2">{best.nama}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: ikmColor(best.ikm) }}>
                      IKM {best.ikm}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-black text-white/30 mt-1">Belum ada data</p>
                )}
              </div>
            </div>
          </div>

          {/* CHARTS — stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-4 lg:flex-1 lg:min-h-0">

            {/* IKM CHART */}
            <div className="bg-white border border-gray-200 flex flex-col flex-1 min-w-0 overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-[#132B4F] via-[#009CC5] to-[#FAE705]" />
              <div className="px-4 lg:px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#009CC5]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">IKM per Layanan</h3>
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-600 inline-block" />Sangat Baik</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 inline-block" style={{ backgroundColor: "#009CC5" }} />Baik</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 inline-block" />Kurang Baik</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 inline-block" />Tidak Baik</span>
                </div>
              </div>
              <div className="flex-1 min-h-0 p-4" style={{ minHeight: "280px" }}>
                {ikmChartData.length > 0 ? (
                  <DashboardCharts data={ikmChartData} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-[#F0F4F8] flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>

            {/* TOP LAYANAN */}
            <div className="bg-white border border-gray-200 lg:w-60 shrink-0 flex flex-col overflow-hidden">
              <div className="h-0.5 bg-[#FAE705]" />
              <div className="px-4 lg:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#FAE705]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Top Layanan</h3>
                </div>
                <Link href="/admin/layanan" className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors">
                  Semua →
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {top5.map((svc, i) => (
                  <Link key={svc.id} href={`/admin/layanan/${svc.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F0F4F8] transition-colors group"
                  >
                    <div className="w-7 h-7 flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{
                        backgroundColor: i === 0 ? "#FAE705" : i === 1 ? "#132B4F" : "#F0F4F8",
                        color: i === 1 ? "white" : "#132B4F"
                      }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate text-[#132B4F]">{svc.nama}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-gray-100 overflow-hidden">
                          <div className="h-full bg-[#009CC5]" style={{ width: `${(svc.count / maxCount) * 100}%` }} />
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
                  <div className="flex items-center justify-center p-8">
                    <p className="text-xs font-bold text-gray-300 uppercase tracking-widest text-center">Belum ada respons</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
