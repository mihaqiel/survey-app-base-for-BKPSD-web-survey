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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-8 h-8 border-2 border-[#132B4F]/20 border-t-[#132B4F] rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Sistem Belum Diinisialisasi</p>
        <Link href="/admin/settings"
          className="px-6 py-2.5 text-white text-sm font-semibold bg-[#132B4F] hover:bg-slate-800 transition-all duration-200 rounded-md">
          Buka Pengaturan
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
    { name: "Baik",        value: catCount.b,  fill: "#3b82f6" },
    { name: "Kurang Baik", value: catCount.kb, fill: "#f59e0b" },
    { name: "Tidak Baik",  value: catCount.tb, fill: "#ef4444" },
  ];

  const barChartData = servicesWithData
    .sort((a: ServiceStat, b: ServiceStat) => b.ikm - a.ikm)
    .map((s: ServiceStat) => ({ id: s.id, name: s.nama, ikm: s.ikm, count: s.count, fill: ikmColor(s.ikm) }));

  const employees   = (stats as any).employees        ?? [];
  const trendData   = (stats as any).trendData        ?? [];
  const periodLabel = (stats as any).periodLabel      ?? "";

  // Pill data for toolbar
  const pills = [
    { label: "Survei",    value: stats.totalResponses,  color: "#3b82f6",  dot: true },
    { label: "Layanan",   value: services.length,  color: "#64748b",  dot: false },
    { label: "Responden", value: stats.totalResponses,  color: "#10b981",  dot: false },
    { label: "IKM",       value: overallIkm > 0 ? overallIkm : "—", color: ikmColor(overallIkm), dot: false },
  ];

  // Performa tab: sorted services
  const perfServices = [...servicesWithData].sort((a: ServiceStat, b: ServiceStat) => b.ikm - a.ikm);

  return (
    <div className="min-h-screen font-sans bg-gray-50/50">

      {/* ══ HEADER — title only ══ */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Ringkasan Manajemen</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">BKPSDM Kabupaten Kepulauan Anambas</p>
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
    <div className="space-y-6">
      {/* Charts */}
      <DashboardChartsV2
        services={barChartData}
        donutData={donutData}
        trendData={trendData}
      />

      {/* Daftar Pegawai */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Daftar Pegawai Berkinerja Terbaik
            </h3>
            <p className="text-sm text-slate-500 mt-1">Berdasarkan skor IKM</p>
          </div>
          <Link href="/admin/pegawai"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Lihat Semua Daftar &rarr;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Pegawai</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Kerja</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skor IKM</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80">
              {employees.slice(0, 6).map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 truncate max-w-[200px]">{emp.nama}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">BKPSDM</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{emp.ikm.toFixed(1)}%</td>
                  <td className="px-6 py-4"><StatusBadge ikm={emp.ikm} size="sm" /></td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                    Belum ada data kinerja masuk pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PerformaTab({ services }: { services: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
           <h3 className="text-base font-semibold text-slate-900">
              Performa Seluruh Layanan
           </h3>
           <p className="text-sm text-slate-500 mt-1">Laporan komprehensif metrik indikator kepuasan secara global</p>
        </div>
        
        {services.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm font-medium text-slate-400">Belum ada layanan yang dievaluasi.</p>
          </div>
        ) : ( 
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">No</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Layanan</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Partisipan</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skor IKM</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/80">
                {services.map((svc, i) => (
                  <tr key={svc.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer relative">
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">
                      {i + 1}
                      {/* Make row clickable via positioned anchor */}
                      <Link href={`/admin/layanan/${svc.id}`} className="absolute inset-0 z-10">
                        <span className="sr-only">Detail {svc.nama}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {svc.nama}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-slate-700">{svc.count}</p>
                        <p className="text-xs text-slate-500">Orang</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ikmColor(svc.ikm) }} />
                        <p className="text-sm font-bold text-slate-700">
                          {svc.ikm.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 relative z-20">
                      <StatusBadge ikm={svc.ikm} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}