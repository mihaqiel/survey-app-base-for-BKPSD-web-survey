export const dynamic = "force-dynamic";

import { getAdminDashboardStats, getAllPeriode } from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import Link from "next/link";
import DashboardChartsV2 from "./components/DashboardChartsV2";
import GlobalExportButton from "./GlobalExportButton";
import StatusBadge, { ikmColor, ikmLabel } from "@/components/ui/StatusBadge";
import DashboardTabs from "./components/DashboardTabs";
import {
  Bell, LogOut,
} from "lucide-react";

export default async function AdminDashboard() {
  const stats   = await getAdminDashboardStats();
  const periodes = await getAllPeriode();

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8] gap-4">
        <div className="w-12 h-12 border-2 border-[#132B4F]/20 border-t-[#132B4F] rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Sistem Belum Diinisialisasi</p>
        <Link href="/admin/settings"
          className="px-6 py-3 text-white text-xs font-black uppercase tracking-widest bg-[#132B4F] hover:bg-[#009CC5] transition-all duration-200">
          Buka Pengaturan →
        </Link>
      </div>
    );
  }

  // ── Compute stats ──────────────────────────────────────────────────────────
  const servicesWithData = stats.services.filter(s => s.count > 0);

  const overallIkm = stats.totalResponses > 0
    ? parseFloat((stats.services.reduce((acc, s) => acc + (s.ikm * s.count), 0) / stats.totalResponses).toFixed(1))
    : 0;

  const catCount = { sb: 0, b: 0, kb: 0, tb: 0 };
  servicesWithData.forEach(s => {
    if      (s.ikm >= 88.31) catCount.sb++;
    else if (s.ikm >= 76.61) catCount.b++;
    else if (s.ikm >= 65)    catCount.kb++;
    else                     catCount.tb++;
  });

  const donutData = [
    { name: "Sangat Baik", value: catCount.sb, fill: "#16a34a" },
    { name: "Baik",        value: catCount.b,  fill: "#009CC5" },
    { name: "Kurang Baik", value: catCount.kb, fill: "#d97706" },
    { name: "Tidak Baik",  value: catCount.tb, fill: "#dc2626" },
  ];

  const barChartData = servicesWithData
    .sort((a, b) => b.ikm - a.ikm)
    .map(s => ({ id: s.id, name: s.nama, ikm: s.ikm, count: s.count, fill: ikmColor(s.ikm) }));

  const employees   = (stats as any).employees        ?? [];
  const trendData   = (stats as any).trendData        ?? [];
  const periodLabel = (stats as any).periodLabel      ?? "";

  // Pill data for toolbar
  const pills = [
    { label: "Survei",    value: stats.totalResponses,  color: "#009CC5",  dot: true },
    { label: "Layanan",   value: stats.services.length,  color: "#132B4F",  dot: false },
    { label: "Responden", value: stats.totalResponses,  color: "#16a34a",  dot: false },
    { label: "IKM",       value: overallIkm > 0 ? overallIkm : "—", color: ikmColor(overallIkm), dot: false },
  ];

  // Performa tab: sorted services
  const perfServices = [...servicesWithData].sort((a, b) => b.ikm - a.ikm);

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* ══ HEADER — title only ══ */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center sticky top-0 z-20 shadow-sm">
        <div className="w-0.5 h-6 bg-[#FAE705] mr-3 shrink-0" />
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#009CC5]">BKPSDM Kepulauan Anambas</p>
          <h1 className="text-base font-black uppercase tracking-tight text-[#132B4F] leading-none">Ringkasan Manajemen</h1>
        </div>
      </div>

      {/* ══ TABS + TOOLBAR ROW ══ */}
      <DashboardTabs
        pills={pills}
        periodLabel={periodLabel}
        periodes={periodes}
        logoutAction={logout}
        ringkasanContent={
          <RingkasanTab
            barChartData={barChartData}
            donutData={donutData}
            trendData={trendData}
            employees={employees}
          />
        }
        performaContent={
          <PerformaTab services={perfServices} />
        }
      />
    </div>
  );
}

// ── TAB CONTENT COMPONENTS ─────────────────────────────────────────────────

function RingkasanTab({ barChartData, donutData, trendData, employees }: {
  barChartData: any[];
  donutData: any[];
  trendData: any[];
  employees: any[];
}) {
  return (
    <div className="space-y-4">
      {/* Charts */}
      <DashboardChartsV2
        services={barChartData}
        donutData={donutData}
        trendData={trendData}
      />

      {/* Daftar Pegawai */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-[#132B4F] to-[#009CC5]" />
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-[#132B4F]" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">
              Daftar Pegawai Berkinerja Terbaik
            </h3>
          </div>
          <Link href="/admin/pegawai"
            className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] hover:text-[#132B4F] transition-colors flex items-center gap-1">
            Semua →
          </Link>
        </div>
        <div className="grid grid-cols-4 px-5 py-2 bg-[#F8FAFC] border-b border-gray-100">
          {["Nama", "Unit", "Score %", "Status"].map(h => (
            <p key={h} className="text-[8px] font-black uppercase tracking-widest text-gray-400">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-gray-50">
          {employees.slice(0, 6).map((emp: any) => (
            <div key={emp.id} className="grid grid-cols-4 items-center px-5 py-3 hover:bg-[#F8FAFC] transition-colors">
              <p className="text-[11px] font-bold truncate text-[#132B4F] pr-2">{emp.nama.split(" ")[0]}</p>
              <p className="text-[9px] text-gray-400">BKPSDM</p>
              <p className="text-[10px] font-black" style={{ color: ikmColor(emp.ikm) }}>{emp.ikm.toFixed(1)}%</p>
              <StatusBadge ikm={emp.ikm} size="sm" />
            </div>
          ))}
          {employees.length === 0 && (
            <div className="flex items-center justify-center py-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PerformaTab({ services }: { services: any[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-[#009CC5] to-[#FAE705]" />
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <div className="w-0.5 h-4 bg-[#009CC5]" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Performa Semua Layanan</p>
            <p className="text-[9px] text-gray-400 mt-0.5">Diurutkan berdasarkan nilai IKM tertinggi</p>
          </div>
        </div>
        {services.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada data layanan</p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-12 px-5 py-2 bg-[#F8FAFC] border-b border-gray-100">
              <p className="col-span-1 text-[8px] font-black uppercase tracking-widest text-gray-400">#</p>
              <p className="col-span-5 text-[8px] font-black uppercase tracking-widest text-gray-400">Layanan</p>
              <p className="col-span-2 text-[8px] font-black uppercase tracking-widest text-gray-400">Responden</p>
              <p className="col-span-2 text-[8px] font-black uppercase tracking-widest text-gray-400">IKM</p>
              <p className="col-span-2 text-[8px] font-black uppercase tracking-widest text-gray-400">Status</p>
            </div>
            <div className="divide-y divide-gray-50">
              {services.map((svc, i) => (
                <Link key={svc.id} href={`/admin/layanan/${svc.id}`}
                  className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors group">
                  <p className="col-span-1 text-[10px] font-black text-gray-300">{i + 1}</p>
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <div className="w-1 h-8 shrink-0 rounded-full" style={{ backgroundColor: ikmColor(svc.ikm) }} />
                    <p className="text-[11px] font-bold text-[#132B4F] truncate group-hover:text-[#009CC5] transition-colors">
                      {svc.nama}
                    </p>
                  </div>
                  <p className="col-span-2 text-[10px] font-bold text-gray-500">{svc.count}</p>
                  <p className="col-span-2 text-[11px] font-black" style={{ color: ikmColor(svc.ikm) }}>
                    {svc.ikm.toFixed(2)}
                  </p>
                  <div className="col-span-2">
                    <StatusBadge ikm={svc.ikm} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}