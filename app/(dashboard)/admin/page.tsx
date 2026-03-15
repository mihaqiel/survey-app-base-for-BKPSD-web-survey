export const dynamic = "force-dynamic";

import { getAdminDashboardStats } from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import Link from "next/link";
import DashboardChartsV2 from "./components/DashboardChartsV2";
import GlobalExportButton from "./GlobalExportButton";
import StatusBadge, { ikmColor, ikmLabel } from "@/components/ui/StatusBadge";
import TabContent from "./components/TabContent";
import {
  Activity, BarChart3, Bell, CalendarDays,
  ChevronRight, Layers, LogOut, Search, Users,
  FileText, ClipboardList, User,
} from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8] gap-4">
        <div className="w-12 h-12 border-2 border-[#132B4F]/20 border-t-[#132B4F] rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">System Not Initialized</p>
        <Link href="/admin/settings" className="btn-shimmer px-6 py-3 text-white text-xs font-black uppercase tracking-widest bg-[#132B4F] hover:bg-[#009CC5] transition-all duration-200">
          Go to Settings →
        </Link>
      </div>
    );
  }

  const overallIkm = stats.totalResponses > 0
    ? parseFloat((stats.services.reduce((acc: number, s: any) => acc + (s.ikm * s.count), 0) / stats.totalResponses).toFixed(1))
    : 0;

  const servicesWithData = stats.services.filter((s: any) => s.count > 0);

  const barChartData = servicesWithData
    .sort((a: any, b: any) => b.ikm - a.ikm)
    .map((s: any) => ({ id: s.id, name: s.nama, ikm: s.ikm, count: s.count, fill: ikmColor(s.ikm) }));

  const employeeStats: Array<{ id: string; nama: string; count: number; ikm: number }>
    = (stats as any).employees ?? [];
  const recentResponses: Array<{ id: string; nama: string; layanan: string; tgl: string; ikm: number }>
    = (stats as any).recentResponses ?? [];
  const periodLabel: string = (stats as any).periodLabel ?? "";
  const periodStart: string = (stats as any).periodStart ?? "";
  const periodEnd: string = (stats as any).periodEnd ?? "";
  const genderData: Array<{ label: string; count: number }> = (stats as any).gender ?? [];
  const trendData = (stats as any).trendData ?? [];
  const totalGender = genderData.reduce((a, b) => a + b.count, 0);

  const catCount = { sb: 0, b: 0, kb: 0, tb: 0 };
  servicesWithData.forEach((s: any) => {
    if (s.ikm >= 88.31) catCount.sb++;
    else if (s.ikm >= 76.61) catCount.b++;
    else if (s.ikm >= 65) catCount.kb++;
    else catCount.tb++;
  });

  const donutData = [
    { name: "Sangat Baik", value: catCount.sb, fill: "#16a34a" },
    { name: "Baik", value: catCount.b, fill: "#009CC5" },
    { name: "Kurang Baik", value: catCount.kb, fill: "#d97706" },
    { name: "Tidak Baik", value: catCount.tb, fill: "#dc2626" },
  ];

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">
      {/* ══ HEADER ══ */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">BKPSDM Kepulauan Anambas</p>
            <h1 className="text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none">Ringkasan Manajemen</h1>
          </div>
          {periodLabel && (
            <div className="hidden md:flex items-center gap-2 ml-3 px-3 py-1.5 bg-[#132B4F]">
              <CalendarDays className="w-3 h-3 text-[#FAE705]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">{periodLabel}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 border border-gray-200 bg-[#F0F4F8] px-3 py-1.5 w-44">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Search Global...</span>
          </div>
          <button aria-label="Notifikasi" className="w-8 h-8 flex items-center justify-center bg-[#F0F4F8] border border-gray-200 hover:bg-white transition-colors">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <div className="hidden sm:block"><GlobalExportButton /></div>
          <form action={logout}>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-200">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ══ */}
      <TabContent
        defaultTab="ringkasan"
        tabs={[
          {
            id: "ringkasan",
            label: "Ringkasan",
            content: (
              <div className="space-y-6 pb-8">
                {/* KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Survei",
                      value: stats.totalResponses,
                      sub: (
                        <div className="flex items-center gap-1.5 mt-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                        </div>
                      ),
                      accent: "#009CC5",
                      icon: <BarChart3 className="w-5 h-5" />,
                    },
                    {
                      label: "Total Layanan",
                      value: stats.services.length,
                      sub: <p className="text-[9px] text-gray-500 mt-3">{servicesWithData.length} aktif dinilai</p>,
                      accent: "#FAE705",
                      icon: <Layers className="w-5 h-5" />,
                    },
                    {
                      label: "Total Responden",
                      value: stats.totalResponses,
                      sub: <p className="text-[9px] text-gray-500 mt-3">{servicesWithData.length} layanan</p>,
                      accent: "#132B4F",
                      icon: <Users className="w-5 h-5" />,
                    },
                    {
                      label: "Overall IKM",
                      value: overallIkm > 0 ? overallIkm : "—",
                      sub: (
                        <p className="text-[9px] font-black uppercase tracking-widest mt-3" style={{ color: ikmColor(overallIkm) }}>
                          {ikmLabel(overallIkm)}
                        </p>
                      ),
                      accent: ikmColor(overallIkm),
                      icon: <Activity className="w-5 h-5" />,
                    },
                  ].map((card, i) => (
                    <div
                      key={card.label}
                      className="animate-fade-up bg-white border border-gray-200 overflow-hidden card-hover rounded-lg"
                      style={{ animationDelay: `${i * 75}ms` }}
                    >
                      <div className="h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${card.accent}, ${card.accent}80)` }} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
                          <span style={{ color: card.accent }} className="opacity-20">
                            {card.icon}
                          </span>
                        </div>
                        <p
                          className="text-4xl font-black leading-none"
                          style={{ color: card.accent === "#FAE705" ? "#132B4F" : card.accent }}
                        >
                          {card.value}
                        </p>
                        {card.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CHARTS SECTION */}
                <div className="animate-fade-up delay-150">
                  <DashboardChartsV2 services={barChartData} donutData={donutData} trendData={trendData} />
                </div>

                {/* PROFILE & NAVIGATION PANEL */}
                <div className="animate-fade-up delay-225 bg-white border border-gray-200 rounded-lg overflow-hidden card-hover">
                  <div className="h-1 bg-[#009CC5]" />
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-[#009CC5]" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Profil & Navigasi</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Period Info */}
                    {periodLabel && (
                      <div className="bg-gradient-to-br from-[#132B4F] to-[#0D1F38] p-5 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#FAE705 1px, transparent 1px), linear-gradient(90deg, #FAE705 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                        <p className="relative text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Periode Aktif</p>
                        <p className="relative text-sm font-black text-white">{periodLabel}</p>
                        {periodStart && periodEnd && (
                          <p className="relative text-[9px] font-bold text-[#FAE705] mt-2">
                            {periodStart} — {periodEnd}
                          </p>
                        )}
                        <Link
                          href="/admin/settings"
                          className="relative inline-flex items-center gap-1 mt-4 text-[9px] font-black uppercase tracking-widest text-[#FAE705] hover:text-white transition-colors"
                        >
                          Ganti Periode <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    {/* IKM Categories */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4">Sebaran Kategori IKM</p>
                      <div className="space-y-3">
                        {[
                          { label: "Sangat Baik", count: catCount.sb, color: "#16a34a" },
                          { label: "Baik", count: catCount.b, color: "#009CC5" },
                          { label: "Kurang Baik", count: catCount.kb, color: "#d97706" },
                          { label: "Tidak Baik", count: catCount.tb, color: "#dc2626" },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between mb-2">
                              <span className="text-[10px] font-bold text-[#132B4F]">{item.label}</span>
                              <span className="text-[10px] font-black" style={{ color: item.color }}>
                                {item.count}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full progress-bar rounded-full transition-all duration-500"
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

                    {/* Gender Distribution */}
                    {genderData.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4">Jenis Kelamin Responden</p>
                        <div className="space-y-3">
                          {genderData.map((g) => (
                            <div key={g.label}>
                              <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-bold text-[#132B4F]">{g.label}</span>
                                <span className="text-[10px] font-black text-[#009CC5]">
                                  {g.count} ({totalGender > 0 ? Math.round((g.count / totalGender) * 100) : 0}%)
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#009CC5] progress-bar rounded-full transition-all duration-500"
                                  style={{ width: totalGender > 0 ? `${(g.count / totalGender) * 100}%` : "0%" }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Aksi Cepat</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { href: "/admin/layanan", label: "Semua Layanan", icon: <ClipboardList className="w-4 h-4" /> },
                          { href: "/admin/pegawai", label: "Manajemen Pegawai", icon: <Users className="w-4 h-4" /> },
                          { href: "/admin/settings", label: "QR Code & Pengaturan", icon: <FileText className="w-4 h-4" /> },
                          { href: "/admin/logs", label: "Audit Log", icon: <FileText className="w-4 h-4" /> },
                        ].map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center justify-between px-4 py-3 bg-[#F0F4F8] hover:bg-[#132B4F] group transition-all duration-200 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[#132B4F] group-hover:text-white transition-colors">{link.icon}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#132B4F] group-hover:text-white transition-colors">
                                {link.label}
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "performa",
            label: "Performa",
            content: (
              <div className="animate-fade-up delay-75 bg-white border border-gray-200 rounded-lg overflow-hidden card-hover pb-8">
                <div className="h-1 bg-gradient-to-r from-[#132B4F] to-[#009CC5]" />
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#132B4F]" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Daftar Pegawai Berkinerja Terbaik</h3>
                  </div>
                  <Link href="/admin/pegawai" className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors">
                    Lihat Semua <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <div className="inline-block w-full">
                    <div className="grid grid-cols-4 px-6 py-3 border-b border-gray-100 bg-[#F8FAFC]">
                      {["Nama Pegawai", "Departemen", "Score %", "Status"].map((h) => (
                        <p key={h} className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                          {h}
                        </p>
                      ))}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {employeeStats.length > 0 ? (
                        employeeStats.map((item, i) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-4 items-center px-6 py-3 hover:bg-[#F0F4F8] transition-colors"
                            style={{ animationDelay: `${i * 40}ms` }}
                          >
                            <p className="text-[11px] font-bold truncate text-[#132B4F]">{item.nama}</p>
                            <p className="text-[9px] text-gray-500">BKPSDM</p>
                            <p className="text-[10px] font-black text-[#009CC5]">{item.ikm}%</p>
                            <StatusBadge ikm={item.ikm} size="sm" />
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center p-12 col-span-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data pegawai</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "riwayat",
            label: "Riwayat",
            content: (
              <div className="animate-fade-up delay-150 bg-white border border-gray-200 rounded-lg overflow-hidden card-hover pb-8">
                <div className="h-1 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#FAE705]" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Respons Terbaru</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-green-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentResponses.length > 0
                    ? recentResponses.map((r, i) => (
                        <div key={r.id ?? i} className="flex items-start gap-3 px-6 py-4 hover:bg-[#F0F4F8] transition-colors">
                          <div className="w-8 h-8 bg-[#F0F4F8] flex items-center justify-center shrink-0 mt-0.5 rounded">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-[#132B4F] truncate">{r.nama}</p>
                            <p className="text-[9px] text-gray-500 truncate mt-1">{r.layanan}</p>
                            <p className="text-[9px] text-gray-400 mt-1">{r.tgl}</p>
                          </div>
                          <StatusBadge ikm={r.ikm} size="sm" />
                        </div>
                      ))
                    : servicesWithData.length > 0
                    ? servicesWithData.map((svc: any, i: number) => (
                        <Link
                          key={svc.id}
                          href={`/admin/layanan/${svc.id}`}
                          className="flex items-center gap-3 px-6 py-4 hover:bg-[#F0F4F8] transition-colors"
                        >
                          <div className="w-1 h-8 shrink-0" style={{ backgroundColor: ikmColor(svc.ikm) }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-[#132B4F] truncate">{svc.nama}</p>
                            <p className="text-[9px] text-gray-500 mt-1">{svc.count} responden</p>
                          </div>
                          <StatusBadge ikm={svc.ikm} size="sm" />
                        </Link>
                      ))
                    : (
                        <div className="flex items-center justify-center p-12">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada respons</p>
                        </div>
                      )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
