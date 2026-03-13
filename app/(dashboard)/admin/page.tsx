export const dynamic = "force-dynamic";

import { getAdminDashboardStats } from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import Link from "next/link";
import DashboardCharts from "./components/DashboardCharts";
import GlobalExportButton from "./GlobalExportButton";

// ─── helpers ────────────────────────────────────────────────────────────────

function ikmColor(ikm: number) {
  if (ikm === 0)    return "#94a3b8";
  if (ikm >= 88.31) return "#16a34a";
  if (ikm >= 76.61) return "#009CC5";
  if (ikm >= 65.00) return "#d97706";
  return "#dc2626";
}
function ikmLabel(ikm: number) {
  if (ikm === 0)    return "No Data";
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65.00) return "Kurang Baik";
  return "Tidak Baik";
}
function ikmBg(ikm: number) {
  if (ikm === 0)    return "bg-gray-100 text-gray-400";
  if (ikm >= 88.31) return "bg-green-50 text-green-700";
  if (ikm >= 76.61) return "bg-sky-50 text-sky-700";
  if (ikm >= 65.00) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8] gap-4">
        <div className="w-12 h-12 border-2 border-[#132B4F]/20 border-t-[#132B4F] rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">System Not Initialized</p>
        <Link href="/admin/settings"
          className="btn-shimmer px-6 py-3 text-white text-xs font-black uppercase tracking-widest bg-[#132B4F] hover:bg-[#009CC5] hover:scale-[1.02] transition-all duration-200">
          Go to Settings →
        </Link>
      </div>
    );
  }

  // ── derived data ─────────────────────────────────────────────────────────

  const overallIkm = stats.totalResponses > 0
    ? parseFloat((stats.services.reduce((acc, s) => acc + (s.ikm * s.count), 0) / stats.totalResponses).toFixed(1))
    : 0;

  const servicesWithData = stats.services.filter(s => s.count > 0);
  const top5             = [...stats.services].sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount         = Math.max(...top5.map(s => s.count), 1);

  const best  = servicesWithData.length > 0 ? servicesWithData.reduce((a, b) => a.ikm > b.ikm ? a : b) : null;
  const worst = servicesWithData.length > 0 ? servicesWithData.reduce((a, b) => a.ikm < b.ikm ? a : b) : null;

  const pieByService = servicesWithData
    .sort((a, b) => b.count - a.count)
    .map(s => ({
      name:  s.nama.length > 22 ? s.nama.substring(0, 22) + "…" : s.nama,
      ikm:   s.ikm,
      value: s.count,
      fill:  ikmColor(s.ikm),
    }));

  const catCount = { sb: 0, b: 0, kb: 0, tb: 0 };
  servicesWithData.forEach(s => {
    if      (s.ikm >= 88.31) catCount.sb++;
    else if (s.ikm >= 76.61) catCount.b++;
    else if (s.ikm >= 65)    catCount.kb++;
    else                     catCount.tb++;
  });
  const pieByCategory = [
    { name: "Sangat Baik", ikm: catCount.sb, value: catCount.sb, fill: "#16a34a" },
    { name: "Baik",        ikm: catCount.b,  value: catCount.b,  fill: "#009CC5" },
    { name: "Kurang Baik", ikm: catCount.kb, value: catCount.kb, fill: "#d97706" },
    { name: "Tidak Baik",  ikm: catCount.tb, value: catCount.tb, fill: "#dc2626" },
  ].filter(d => d.value > 0);

  const employeeStats: Array<{ id: string; nama: string; count: number; ikm: number }>
    = (stats as any).employees ?? [];
  const recentResponses: Array<{ id: string; nama: string; layanan: string; tgl: string; ikm: number }>
    = (stats as any).recentResponses ?? [];
  const periodLabel: string = (stats as any).periodLabel ?? "";
  const periodStart: string = (stats as any).periodStart ?? "";
  const periodEnd:   string = (stats as any).periodEnd   ?? "";
  const genderData: Array<{ label: string; count: number }> = (stats as any).gender    ?? [];
  const eduData:    Array<{ label: string; count: number }> = (stats as any).education ?? [];
  const totalGender = genderData.reduce((a, b) => a + b.count, 0);
  const totalEdu    = eduData.reduce((a, b) => a + b.count, 0);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen font-sans flex flex-col overflow-x-hidden bg-[#F0F4F8]">

      {/* ══ TOP NAV ══ */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 lg:hidden shrink-0" />
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div className="animate-slide-left">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5] hidden sm:block">
              BKPSDM Kepulauan Anambas
            </p>
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none">
              Dashboard SKM
            </h1>
          </div>
          {periodLabel && (
            <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1.5 bg-[#132B4F] animate-fade-in delay-150">
              <svg className="w-3 h-3 text-[#FAE705]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest text-white">{periodLabel}</span>
              {periodStart && periodEnd && (
                <span className="text-[9px] font-bold text-white/50 ml-1">{periodStart} – {periodEnd}</span>
              )}
              <Link href="/admin/settings" className="text-[9px] font-black text-[#FAE705] hover:text-white transition-colors ml-1">
                Ganti →
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-3 animate-slide-right">
          <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-green-700">Sistem Aktif</span>
          </div>
          <div className="hidden sm:block"><GlobalExportButton /></div>
          <form action={logout}>
            <button className="btn-shimmer px-3 lg:px-4 py-2 bg-white border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
              Log Out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile export */}
      <div className="sm:hidden px-4 pt-4"><GlobalExportButton /></div>

      {/* ══ BODY ══ */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-5">

          {/* ── ROW 1: STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

            {/* Total Responden */}
            <div className="animate-fade-up delay-75 bg-white border border-gray-200 overflow-hidden card-hover">
              <div className="h-1 bg-[#009CC5] animate-draw-line" />
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#009CC5] mb-2">Total Responden</p>
                <p className="text-3xl font-black text-[#132B4F] leading-none animate-count-up">{stats.totalResponses}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                </div>
              </div>
            </div>

            {/* Total Layanan */}
            <div className="animate-fade-up delay-150 bg-white border border-gray-200 overflow-hidden card-hover">
              <div className="h-1 bg-[#FAE705] animate-draw-line" />
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Layanan</p>
                <p className="text-3xl font-black text-[#132B4F] leading-none animate-count-up">{stats.services.length}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-3">{servicesWithData.length} memiliki respons</p>
              </div>
            </div>

            {/* Overall IKM */}
            <div
              className="animate-fade-up delay-225 bg-white border border-gray-200 overflow-hidden card-hover"
              style={{ borderTopColor: overallIkm > 0 ? ikmColor(overallIkm) : "#e2e8f0" }}
            >
              <div className="h-1 animate-draw-line" style={{ backgroundColor: overallIkm > 0 ? ikmColor(overallIkm) : "#e2e8f0" }} />
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Overall IKM</p>
                <p className="text-3xl font-black leading-none animate-count-up" style={{ color: ikmColor(overallIkm) }}>
                  {overallIkm > 0 ? overallIkm : "—"}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: ikmColor(overallIkm) }}>
                  {ikmLabel(overallIkm)}
                </p>
              </div>
            </div>

            {/* Layanan Terbaik */}
            <div className="animate-fade-up delay-300 bg-[#132B4F] overflow-hidden card-hover">
              <div className="h-1 bg-green-500 animate-draw-line" />
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Layanan Terbaik</p>
                {best ? (
                  <>
                    <p className="text-xs font-black text-white leading-tight line-clamp-2">{best.nama}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-400">IKM {best.ikm}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-black text-white/30 mt-1">Belum ada data</p>
                )}
              </div>
            </div>

            {/* Perlu Perhatian */}
            <div className="animate-fade-up delay-375 bg-white border border-gray-200 overflow-hidden card-hover">
              <div className="h-1 bg-red-500 animate-draw-line" />
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">Perlu Perhatian</p>
                {worst && worst.id !== best?.id ? (
                  <>
                    <p className="text-xs font-black text-[#132B4F] leading-tight line-clamp-2">{worst.nama}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-500">IKM {worst.ikm}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-black text-gray-300 mt-1">Belum ada data</p>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 2: CHARTS + TOP LAYANAN ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Chart 1: IKM per layanan */}
            <div className="animate-fade-up delay-150 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-gradient-to-r from-[#132B4F] via-[#009CC5] to-[#FAE705] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#009CC5]" />
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">IKM per Layanan</h3>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5">Proporsi responden per layanan</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 bg-gray-50 px-2 py-1">
                  {pieByService.length} layanan
                </span>
              </div>
              <div style={{ height: 290 }}>
                {pieByService.length > 0 ? (
                  <DashboardCharts data={pieByService} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Distribusi kategori */}
            <div className="animate-fade-up delay-225 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-gradient-to-r from-green-500 via-[#009CC5] to-red-500 animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#132B4F]" />
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Distribusi Kategori</h3>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5">Jumlah layanan per kategori IKM</p>
                  </div>
                </div>
                {/* IKM color legend pills */}
                <div className="flex gap-1">
                  {[{ c: "#16a34a", l: "SB" }, { c: "#009CC5", l: "B" }, { c: "#d97706", l: "KB" }, { c: "#dc2626", l: "TB" }].map(({ c, l }) => (
                    <span key={l} className="text-[8px] font-black px-1.5 py-0.5" style={{ backgroundColor: c + "20", color: c }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ height: 290 }}>
                {pieByCategory.length > 0 ? (
                  <DashboardCharts data={pieByCategory} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Layanan bar list */}
            <div className="animate-fade-up delay-300 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-[#FAE705] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#FAE705]" />
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Top Layanan</h3>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5">Berdasarkan jumlah responden</p>
                  </div>
                </div>
                <Link href="/admin/layanan"
                  className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors">
                  Semua →
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-3 space-y-1">
                {top5.map((svc, i) => (
                  <Link
                    key={svc.id}
                    href={`/admin/layanan/${svc.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-[#F0F4F8] transition-colors rounded animate-fade-up group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Rank badge */}
                    <div
                      className="w-6 h-6 flex items-center justify-center text-[9px] font-black shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: i === 0 ? "#FAE705" : i === 1 ? "#132B4F" : "#F0F4F8",
                        color: i === 1 ? "white" : "#132B4F",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate text-[#132B4F]">{svc.nama}</p>
                      {/* Animated bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full progress-bar transition-all duration-500"
                            style={{
                              width: `${(svc.count / maxCount) * 100}%`,
                              backgroundColor: ikmColor(svc.ikm),
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 shrink-0 tabular-nums">{svc.count}</span>
                      </div>
                    </div>
                    {svc.ikm > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 shrink-0 ${ikmBg(svc.ikm)}`}>
                        {svc.ikm}
                      </span>
                    )}
                  </Link>
                ))}
                {top5.every(s => s.count === 0) && (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada respons</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 3: EMPLOYEE + RECENT + DEMOGRAPHICS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Employee / Top Layanan fallback */}
            <div className="animate-fade-up delay-150 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-gradient-to-r from-[#132B4F] to-[#009CC5] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#132B4F]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Top Pegawai</h3>
                </div>
                <Link href="/admin/pegawai"
                  className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors">
                  Semua →
                </Link>
              </div>

              <div className="divide-y divide-gray-50 flex-1">
                {(employeeStats.length > 0 ? employeeStats.slice(0, 6) : top5.filter(s => s.count > 0)).map((item: any, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4F8] transition-colors animate-fade-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div
                      className="w-6 h-6 flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{ backgroundColor: i === 0 ? "#FAE705" : i === 1 ? "#132B4F" : "#F0F4F8", color: i === 1 ? "white" : "#132B4F" }}
                    >
                      {i + 1}
                    </div>
                    {employeeStats.length > 0 && (
                      <div className="w-7 h-7 bg-[#009CC5] flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-white">
                          {item.nama.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate text-[#132B4F]">{item.nama}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{item.count} responden</p>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 shrink-0 ${ikmBg(item.ikm)}`}>
                      {item.ikm}
                    </span>
                  </div>
                ))}
                {employeeStats.length === 0 && top5.every((s: any) => s.count === 0) && (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent responses */}
            <div className="animate-fade-up delay-225 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#FAE705]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Respons Terbaru</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                </div>
              </div>

              <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                {recentResponses.length > 0 ? (
                  recentResponses.slice(0, 7).map((r, i) => (
                    <div
                      key={r.id ?? i}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#F0F4F8] transition-colors animate-fade-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-6 h-6 bg-[#F0F4F8] flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-[#132B4F] truncate">{r.nama}</p>
                        <p className="text-[9px] text-gray-400 font-medium truncate mt-0.5">{r.layanan}</p>
                        <p className="text-[9px] text-gray-300 font-medium mt-0.5">{r.tgl}</p>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 shrink-0 mt-0.5 ${ikmBg(r.ikm)}`}>
                        {r.ikm}
                      </span>
                    </div>
                  ))
                ) : (
                  servicesWithData.slice(0, 7).map((svc, i) => (
                    <Link
                      key={svc.id}
                      href={`/admin/layanan/${svc.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4F8] transition-colors animate-fade-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-1 h-8 shrink-0" style={{ backgroundColor: ikmColor(svc.ikm) }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-[#132B4F] truncate">{svc.nama}</p>
                        <p className="text-[9px] text-gray-400 font-medium mt-0.5">{svc.count} responden</p>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 shrink-0 ${ikmBg(svc.ikm)}`}>
                        {svc.ikm}
                      </span>
                    </Link>
                  ))
                )}
                {recentResponses.length === 0 && servicesWithData.length === 0 && (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada respons</p>
                  </div>
                )}
              </div>
            </div>

            {/* Demographics + period + quick nav */}
            <div className="animate-fade-up delay-300 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#009CC5]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Profil Responden</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                {/* Active period */}
                {periodLabel && (
                  <div className="bg-[#132B4F] p-4 animate-fade-up relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#FAE705 1px, transparent 1px), linear-gradient(90deg, #FAE705 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    <p className="relative text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Periode Aktif</p>
                    <p className="relative text-sm font-black text-white">{periodLabel}</p>
                    {periodStart && periodEnd && (
                      <p className="relative text-[9px] font-bold text-[#009CC5] mt-1">{periodStart} — {periodEnd}</p>
                    )}
                    <Link href="/admin/settings"
                      className="relative inline-flex items-center gap-1 mt-3 text-[9px] font-black uppercase tracking-widest text-[#FAE705] hover:text-white transition-colors">
                      Ganti Periode →
                    </Link>
                  </div>
                )}

                {/* Gender bars */}
                {genderData.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Jenis Kelamin</p>
                    <div className="space-y-2">
                      {genderData.map((g, i) => (
                        <div key={g.label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-[#132B4F]">{g.label}</span>
                            <span className="text-[10px] font-black text-[#009CC5]">
                              {g.count} ({totalGender > 0 ? Math.round((g.count / totalGender) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 overflow-hidden rounded-full">
                            <div
                              className="h-full bg-[#009CC5] progress-bar rounded-full"
                              style={{ width: totalGender > 0 ? `${(g.count / totalGender) * 100}%` : "0%" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education bars */}
                {eduData.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Pendidikan</p>
                    <div className="space-y-2">
                      {eduData.map((e, i) => (
                        <div key={e.label} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-[#132B4F]">{e.label}</span>
                            <span className="text-[10px] font-black text-[#132B4F]">
                              {e.count} ({totalEdu > 0 ? Math.round((e.count / totalEdu) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 overflow-hidden rounded-full">
                            <div
                              className="h-full bg-[#132B4F] progress-bar rounded-full"
                              style={{ width: totalEdu > 0 ? `${(e.count / totalEdu) * 100}%` : "0%" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary grid */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Ringkasan Periode</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Layanan Dinilai", val: servicesWithData.length,                         color: "#009CC5" },
                      { label: "Layanan Aktif",   val: stats.services.length,                           color: "#132B4F" },
                      { label: "Total Respons",   val: stats.totalResponses,                            color: "#16a34a" },
                      { label: "Tanpa Respons",   val: stats.services.length - servicesWithData.length, color: "#94a3b8" },
                    ].map((item, i) => (
                      <div
                        key={item.label}
                        className="bg-[#F0F4F8] p-3 card-hover animate-count-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                        <p className="text-xl font-black animate-count-up" style={{ color: item.color }}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* IKM category distribution bars */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Sebaran Kategori IKM</p>
                  <div className="space-y-2">
                    {[
                      { label: "Sangat Baik", count: catCount.sb, color: "#16a34a" },
                      { label: "Baik",        count: catCount.b,  color: "#009CC5" },
                      { label: "Kurang Baik", count: catCount.kb, color: "#d97706" },
                      { label: "Tidak Baik",  count: catCount.tb, color: "#dc2626" },
                    ].map((item, i) => (
                      <div key={item.label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-[#132B4F]">{item.label}</span>
                          <span className="text-[10px] font-black" style={{ color: item.color }}>
                            {item.count} layanan
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 overflow-hidden rounded-full">
                          <div
                            className="h-full progress-bar rounded-full"
                            style={{
                              width: servicesWithData.length > 0 ? `${(item.count / servicesWithData.length) * 100}%` : "0%",
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick nav */}
                <div className="border-t border-gray-100 pt-4 flex flex-col gap-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Aksi Cepat</p>
                  {[
                    { href: "/admin/layanan",  label: "Semua Layanan",         icon: "📋" },
                    { href: "/admin/pegawai",  label: "Manajemen Pegawai",     icon: "👥" },
                    { href: "/admin/settings", label: "QR Code & Pengaturan",  icon: "⚙️" },
                    { href: "/admin/logs",     label: "Audit Log",             icon: "📄" },
                  ].map((link, i) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="btn-shimmer flex items-center justify-between px-3 py-2.5 bg-[#F0F4F8] hover:bg-[#132B4F] group transition-all duration-200 hover:scale-[1.01] animate-fade-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{link.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#132B4F] group-hover:text-white transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors group-hover:translate-x-0.5 inline-block transition-transform">→</span>
                    </Link>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}