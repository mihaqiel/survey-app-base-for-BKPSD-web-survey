export const dynamic = "force-dynamic";

import { getAdminDashboardStats } from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import Link from "next/link";
import DashboardCharts from "./components/DashboardCharts";
import GlobalExportButton from "./GlobalExportButton";
import {
  Activity, Award, AlertTriangle, BarChart3,
  CalendarDays, ChevronRight, Layers, LogOut,
  Settings, Users, FileText, ClipboardList, User,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── page ─────────────────────────────────────────────────────────────────────

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
  const best  = servicesWithData.length > 0 ? servicesWithData.reduce((a, b) => a.ikm > b.ikm ? a : b) : null;
  const worst = servicesWithData.length > 0 ? servicesWithData.reduce((a, b) => a.ikm < b.ikm ? a : b) : null;

  // Bar chart data — all services sorted by IKM
  const barChartData = servicesWithData
    .sort((a, b) => b.ikm - a.ikm)
    .map(s => ({
      name:  s.nama,
      ikm:   s.ikm,
      value: s.count,
      fill:  ikmColor(s.ikm),
    }));

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

  const catCount = { sb: 0, b: 0, kb: 0, tb: 0 };
  servicesWithData.forEach(s => {
    if      (s.ikm >= 88.31) catCount.sb++;
    else if (s.ikm >= 76.61) catCount.b++;
    else if (s.ikm >= 65)    catCount.kb++;
    else                     catCount.tb++;
  });

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
              <CalendarDays className="w-3 h-3 text-[#FAE705]" />
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
            <Activity className="w-3 h-3 text-green-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-green-700">Sistem Aktif</span>
          </div>
          <div className="hidden sm:block"><GlobalExportButton /></div>
          <form action={logout}>
            <button className="btn-shimmer flex items-center gap-1.5 px-3 lg:px-4 py-2 bg-white border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          </form>
        </div>
      </div>

      <div className="sm:hidden px-4 pt-4"><GlobalExportButton /></div>

      {/* ══ BODY ══ */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-6">

          {/* ── SECTION 1: METRIC CARDS (Top) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Total Survei",
                value: stats.totalResponses,
                sub: <div className="flex items-center gap-1.5 mt-3"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /><span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span></div>,
                accent: "#009CC5",
                icon: <BarChart3 className="w-4 h-4" />,
                delay: "delay-75",
              },
              {
                label: "Total Layanan",
                value: stats.services.length,
                sub: <p className="text-[9px] font-bold text-gray-400 mt-3">{servicesWithData.length} aktif dinilai</p>,
                accent: "#FAE705",
                icon: <Layers className="w-4 h-4" />,
                delay: "delay-150",
              },
              {
                label: "Total Responden",
                value: stats.totalResponses,
                sub: <p className="text-[9px] font-bold text-gray-400 mt-3">{servicesWithData.length} layanan tercakup</p>,
                accent: "#132B4F",
                icon: <Users className="w-4 h-4" />,
                delay: "delay-225",
              },
              {
                label: "Overall IKM",
                value: overallIkm > 0 ? overallIkm : "—",
                sub: <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: ikmColor(overallIkm) }}>{ikmLabel(overallIkm)}</p>,
                accent: ikmColor(overallIkm),
                icon: <Activity className="w-4 h-4" />,
                delay: "delay-300",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`animate-fade-up ${card.delay} bg-white border border-gray-200 overflow-hidden card-hover`}
              >
                <div className="h-1 animate-draw-line" style={{ backgroundColor: card.accent }} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{card.label}</p>
                    <span style={{ color: card.accent }} className="opacity-30">{card.icon}</span>
                  </div>
                  <p className="text-3xl font-black leading-none animate-count-up"
                    style={{ color: card.accent === "#FAE705" ? "#132B4F" : card.accent }}>
                    {card.value}
                  </p>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── SECTION 2: BAR CHART — Service Comparison (Middle) ── */}
          <div className="animate-fade-up delay-150 bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 animate-draw-line" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />

            {/* Chart header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-0.5 h-5 bg-[#009CC5]" />
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-[#132B4F]">
                    Perbandingan Kinerja Layanan
                  </h2>
                  <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                    Bandingkan IKM dan jumlah responden antar layanan — klik bar untuk tren
                  </p>
                </div>
              </div>
              {/* Best / worst badges */}
              <div className="hidden md:flex items-center gap-3">
                {best && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100">
                    <Award className="w-3.5 h-3.5 text-green-600" />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-green-600">Terbaik</p>
                      <p className="text-[10px] font-black text-green-700 max-w-[120px] truncate">{best.nama}</p>
                    </div>
                    <span className="text-[9px] font-black text-green-600 ml-1">{best.ikm}</span>
                  </div>
                )}
                {worst && worst.id !== best?.id && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-red-500">Perlu Perhatian</p>
                      <p className="text-[10px] font-black text-red-600 max-w-[120px] truncate">{worst.nama}</p>
                    </div>
                    <span className="text-[9px] font-black text-red-500 ml-1">{worst.ikm}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chart */}
            <div style={{ height: 340 }}>
              {barChartData.length > 0 ? (
                <DashboardCharts data={barChartData} defaultMode="ikm" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <BarChart3 className="w-10 h-10 text-gray-200" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                    Belum ada data layanan
                  </p>
                </div>
              )}
            </div>

            {/* IKM category legend */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Kategori IKM:</p>
              {[
                { color: "#16a34a", label: "Sangat Baik (≥88.31)" },
                { color: "#009CC5", label: "Baik (≥76.61)" },
                { color: "#d97706", label: "Kurang Baik (≥65)" },
                { color: "#dc2626", label: "Tidak Baik (<65)" },
                { color: "#94a3b8", label: "No Data" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[9px] font-bold text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 3: SUPPORTING DATA (Bottom) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Employee leaderboard */}
            <div className="animate-fade-up delay-75 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-gradient-to-r from-[#132B4F] to-[#009CC5] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#132B4F]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Top Pegawai</h3>
                </div>
                <Link href="/admin/pegawai"
                  className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors">
                  Semua <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50 flex-1">
                {(employeeStats.length > 0 ? employeeStats.slice(0, 6) : stats.services.filter(s => s.count > 0).slice(0, 6)).map((item: any, i) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4F8] transition-colors animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-6 h-6 flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{ backgroundColor: i === 0 ? "#FAE705" : i === 1 ? "#132B4F" : "#F0F4F8", color: i === 1 ? "white" : "#132B4F" }}>
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
                {employeeStats.length === 0 && stats.services.every(s => s.count === 0) && (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent responses */}
            <div className="animate-fade-up delay-150 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#FAE705]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Respons Terbaru</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
                {recentResponses.length > 0 ? (
                  recentResponses.slice(0, 7).map((r, i) => (
                    <div key={r.id ?? i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#F0F4F8] transition-colors animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="w-6 h-6 bg-[#F0F4F8] flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3 h-3 text-gray-400" />
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
                    <Link key={svc.id} href={`/admin/layanan/${svc.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#F0F4F8] transition-colors animate-fade-up"
                      style={{ animationDelay: `${i * 50}ms` }}>
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

            {/* Demographics + quick nav */}
            <div className="animate-fade-up delay-225 bg-white border border-gray-200 flex flex-col overflow-hidden card-hover">
              <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
              <div className="px-5 py-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-[#009CC5]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Profil & Navigasi</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                {/* Period */}
                {periodLabel && (
                  <div className="bg-[#132B4F] p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#FAE705 1px, transparent 1px), linear-gradient(90deg, #FAE705 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    <p className="relative text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Periode Aktif</p>
                    <p className="relative text-sm font-black text-white">{periodLabel}</p>
                    {periodStart && periodEnd && (
                      <p className="relative text-[9px] font-bold text-[#009CC5] mt-1">{periodStart} — {periodEnd}</p>
                    )}
                    <Link href="/admin/settings"
                      className="relative inline-flex items-center gap-1 mt-3 text-[9px] font-black uppercase tracking-widest text-[#FAE705] hover:text-white transition-colors">
                      Ganti Periode <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* IKM category summary */}
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
                          <span className="text-[10px] font-black" style={{ color: item.color }}>{item.count} layanan</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full progress-bar rounded-full"
                            style={{ width: servicesWithData.length > 0 ? `${(item.count / servicesWithData.length) * 100}%` : "0%", backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                {genderData.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Jenis Kelamin Responden</p>
                    <div className="space-y-2">
                      {genderData.map((g, i) => (
                        <div key={g.label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-[#132B4F]">{g.label}</span>
                            <span className="text-[10px] font-black text-[#009CC5]">
                              {g.count} ({totalGender > 0 ? Math.round((g.count / totalGender) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#009CC5] progress-bar rounded-full"
                              style={{ width: totalGender > 0 ? `${(g.count / totalGender) * 100}%` : "0%" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick nav */}
                <div className="border-t border-gray-100 pt-4 flex flex-col gap-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Aksi Cepat</p>
                  {[
                    { href: "/admin/layanan",  label: "Semua Layanan",        icon: <ClipboardList className="w-3.5 h-3.5" /> },
                    { href: "/admin/pegawai",  label: "Manajemen Pegawai",    icon: <Users className="w-3.5 h-3.5" /> },
                    { href: "/admin/settings", label: "QR Code & Pengaturan", icon: <Settings className="w-3.5 h-3.5" /> },
                    { href: "/admin/logs",     label: "Audit Log",            icon: <FileText className="w-3.5 h-3.5" /> },
                  ].map((link, i) => (
                    <Link key={link.href} href={link.href}
                      className="btn-shimmer flex items-center justify-between px-3 py-2.5 bg-[#F0F4F8] hover:bg-[#132B4F] group transition-all duration-200 hover:scale-[1.01] animate-fade-up"
                      style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[#132B4F] group-hover:text-white transition-colors">{link.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#132B4F] group-hover:text-white transition-colors">{link.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
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