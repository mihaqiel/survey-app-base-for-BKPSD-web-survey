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

interface ServiceStat {
  id: string;
  nama: string;
  ikm: number;
  count: number;
}

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
  const services = stats.services as ServiceStat[];
  const servicesWithData = services.filter((s) => s.count > 0);

  const overallIkm = stats.totalResponses > 0
    ? parseFloat((services.reduce((acc: number, s) => acc + (s.ikm * s.count), 0) / stats.totalResponses).toFixed(1))
    : 0;

  const catCount = { sb: 0, b: 0, kb: 0, tb: 0 };
  servicesWithData.forEach((s) => {
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
    .sort((a: ServiceStat, b: ServiceStat) => b.ikm - a.ikm)
    .map((s: ServiceStat) => ({ id: s.id, name: s.nama, ikm: s.ikm, count: s.count, fill: ikmColor(s.ikm) }));

  const employees   = (stats as any).employees        ?? [];
  const trendData   = (stats as any).trendData        ?? [];
  const periodLabel = (stats as any).periodLabel      ?? "";

  // Pill data for toolbar
  const pills = [
    { label: "Survei",    value: stats.totalResponses,  color: "#009CC5",  dot: true },
    { label: "Layanan",   value: services.length,  color: "#132B4F",  dot: false },
    { label: "Responden", value: stats.totalResponses,  color: "#16a34a",  dot: false },
    { label: "IKM",       value: overallIkm > 0 ? overallIkm : "—", color: ikmColor(overallIkm), dot: false },
  ];

  // Performa tab: sorted services
  const perfServices = [...servicesWithData].sort((a: ServiceStat, b: ServiceStat) => b.ikm - a.ikm);

  return (
    <div className="min-h-screen font-sans bg-[#FAFBFC]">

      {/* ══ HEADER — Clean & Spacious ══ */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 bg-[#009CC5] rounded-full shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">BKPSDM Kepulauan Anambas</p>
              <h1 className="text-2xl font-bold text-[#132B4F] leading-tight">Dashboard Survei Kepuasan Masyarakat</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-gray-600">Periode: <span className="font-bold text-[#132B4F]">{periodLabel}</span></p>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="flex gap-4 overflow-x-auto pb-1">
          {[
            { label: "Total Surveys", value: stats.totalResponses, color: "#009CC5" },
            { label: "Services", value: services.length, color: "#132B4F" },
            { label: "Respondents", value: stats.totalResponses, color: "#16a34a" },
            { label: "Overall IKM", value: overallIkm > 0 ? overallIkm.toFixed(1) : "—", color: ikmColor(overallIkm) },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: stat.color }} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600">{stat.label}</p>
                <p className="text-[16px] font-bold text-[#132B4F]">{stat.value}</p>
              </div>
            </div>
          ))}
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
    <div className="space-y-8">
      {/* Charts */}
      <DashboardChartsV2
        services={barChartData}
        donutData={donutData}
        trendData={trendData}
      />

      {/* Top Performers */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-lg">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#132B4F]">
              Top Performers
            </h3>
            <p className="text-[13px] text-gray-500 mt-1">Daftar pegawai dengan kinerja terbaik</p>
          </div>
          <Link href="/admin/pegawai"
            className="text-[12px] font-bold text-[#009CC5] hover:text-[#0A7BA3] transition-colors flex items-center gap-1">
            Lihat Semua →
          </Link>
        </div>
        <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
          {["Nama", "Unit", "Score", "Status"].map(h => (
            <p key={h} className="text-[11px] font-bold uppercase tracking-wide text-gray-600">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {employees.slice(0, 5).map((emp: any) => (
            <div key={emp.id} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors">
              <p className="text-[13px] font-bold truncate text-[#132B4F] pr-2">{emp.nama.split(" ")[0]}</p>
              <p className="text-[12px] text-gray-600">BKPSDM</p>
              <p className="text-[13px] font-bold" style={{ color: ikmColor(emp.ikm) }}>{emp.ikm.toFixed(1)}</p>
              <StatusBadge ikm={emp.ikm} size="sm" />
            </div>
          ))}
          {employees.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-[12px] font-bold text-gray-400">Belum ada data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PerformaTab({ services }: { services: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 overflow-hidden rounded-lg">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-[#132B4F]">Performa Semua Layanan</h3>
          <p className="text-[13px] text-gray-500 mt-1">Diurutkan berdasarkan nilai IKM tertinggi</p>
        </div>
        {services.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[13px] font-bold text-gray-400">Belum ada data layanan</p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <p className="col-span-1 text-[11px] font-bold uppercase tracking-wide text-gray-600">#</p>
              <p className="col-span-5 text-[11px] font-bold uppercase tracking-wide text-gray-600">Layanan</p>
              <p className="col-span-2 text-[11px] font-bold uppercase tracking-wide text-gray-600">Responden</p>
              <p className="col-span-2 text-[11px] font-bold uppercase tracking-wide text-gray-600">IKM</p>
              <p className="col-span-2 text-[11px] font-bold uppercase tracking-wide text-gray-600">Status</p>
            </div>
            <div className="divide-y divide-gray-100">
              {services.map((svc, i) => (
                <Link key={svc.id} href={`/admin/layanan/${svc.id}`}
                  className="grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <p className="col-span-1 text-[12px] font-bold text-gray-500">{i + 1}</p>
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-1.5 h-8 shrink-0 rounded-full" style={{ backgroundColor: ikmColor(svc.ikm) }} />
                    <p className="text-[13px] font-bold text-[#132B4F] truncate group-hover:text-[#009CC5] transition-colors">
                      {svc.nama}
                    </p>
                  </div>
                  <p className="col-span-2 text-[12px] font-bold text-gray-600">{svc.count}</p>
                  <p className="col-span-2 text-[13px] font-bold" style={{ color: ikmColor(svc.ikm) }}>
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
