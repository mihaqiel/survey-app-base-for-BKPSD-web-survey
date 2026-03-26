export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import {
  getAdminDashboardStats, getAllPeriode, getAllLayanan,
  getPengaduanAktifCount,
} from "@/app/action/admin";
import { logout } from "@/app/action/auth";
import Link from "next/link";
import DashboardChartsV2 from "./components/DashboardChartsV2";
import StatusBadge, { ikmColor } from "@/components/ui/StatusBadge";
import DashboardTabs from "./components/DashboardTabs";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Admin BKPSDM Anambas",
  description: "Ringkasan manajemen survei kepuasan masyarakat BKPSDM Kabupaten Kepulauan Anambas.",
};

interface ServiceStat {
  id: string;
  nama: string;
  ikm: number;
  count: number;
}

export default async function AdminDashboard(props: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode: periodeId } = await props.searchParams;
  const [stats, periodes, layananRaw, pengaduanAktif] = await Promise.all([
    getAdminDashboardStats(periodeId),
    getAllPeriode(),
    getAllLayanan(),
    getPengaduanAktifCount(),
  ]);
  const layananList = layananRaw.map((l: { id: string; nama: string }) => ({ id: l.id, nama: l.nama }));

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-sm font-medium text-gray-500">Belum ada data survei</p>
        <Link href="/admin/settings"
          className="px-6 py-2.5 text-white text-sm font-semibold bg-slate-900 hover:bg-slate-800 transition-all duration-200 rounded-lg">
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

  const barChartData = servicesWithData
    .sort((a: ServiceStat, b: ServiceStat) => a.ikm - b.ikm) // worst → best (problems visible first)
    .map((s: ServiceStat) => ({ id: s.id, name: s.nama, ikm: s.ikm, count: s.count, fill: ikmColor(s.ikm) }));

  const trendData   = (stats as any).trendData    ?? [];
  const periodLabel = (stats as any).periodLabel  ?? "";
  const bottom3Unsur = (stats as any).bottom3Unsur ?? [];

  // ── KPI pills ──────────────────────────────────────────────────────────────
  const suspiciousCount  = (stats as any).suspiciousCount ?? 0;
  const suspiciousPct    = stats.totalResponses > 0
    ? Math.round((suspiciousCount / stats.totalResponses) * 100)
    : 0;
  const anomalyWarning   = suspiciousPct > 10;

  const pills = [
    { label: "Responden",  value: stats.totalResponses,                  color: "#10b981", dot: true  },
    { label: "Layanan",    value: services.length,                       color: "#64748b", dot: false },
    { label: "IKM",        value: overallIkm > 0 ? overallIkm : "—",    color: ikmColor(overallIkm), dot: false },
    { label: "Pengaduan",  value: pengaduanAktif,                        color: pengaduanAktif > 0 ? "#ef4444" : "#10b981", dot: pengaduanAktif > 0 },
    { label: "Anomali",    value: `${suspiciousPct}%`,                   color: anomalyWarning ? "#f59e0b" : "#10b981",      dot: anomalyWarning },
  ];

  // Performa tab: sorted services (best → worst for ranking table)
  const perfServices = [...servicesWithData].sort((a: ServiceStat, b: ServiceStat) => b.ikm - a.ikm);

  return (
    <div className="min-h-screen font-sans bg-gray-50/50">

      {/* ══ HEADER ══ */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Ringkasan Manajemen</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">BKPSDM Kabupaten Kepulauan Anambas</p>
        </div>
      </div>

      {/* ══ IKM SCALE LEGEND ══ */}
      <div className="bg-white border-b border-gray-100 px-6 py-2 flex items-center gap-1 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-2">Skala IKM:</span>
        {[
          { label: "Sangat Baik", min: "≥ 88,31", color: "#16a34a" },
          { label: "Baik",        min: "76,61–88,30", color: "#3b82f6" },
          { label: "Kurang Baik", min: "65,00–76,60", color: "#f59e0b" },
          { label: "Tidak Baik",  min: "< 65,00",     color: "#ef4444" },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold mr-1"
            style={{ background: s.color + "14", color: s.color }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
            {s.label} ({s.min})
          </span>
        ))}
      </div>

      {/* ══ TABS + TOOLBAR ROW ══ */}
      <DashboardTabs
        pills={pills}
        periodLabel={periodLabel}
        periodes={periodes}
        layananList={layananList}
        selectedPeriodeId={periodeId}
        logoutAction={logout}
        ringkasanContent={
          <RingkasanTab
            barChartData={barChartData}
            trendData={trendData}
            bottom3Unsur={bottom3Unsur}
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

const ikmColorLocal = (v: number) =>
  v >= 88.31 ? "#16a34a" : v >= 76.61 ? "#3b82f6" : v >= 65 ? "#f59e0b" : "#ef4444";
const ikmLabelLocal = (v: number) =>
  v >= 88.31 ? "Sangat Baik" : v >= 76.61 ? "Baik" : v >= 65 ? "Kurang Baik" : "Tidak Baik";

function RingkasanTab({ barChartData, trendData, bottom3Unsur }: {
  barChartData: any[];
  trendData: any[];
  bottom3Unsur: { key: string; label: string; avg: number }[];
}) {
  return (
    <div className="space-y-6">

      {/* Charts — full width (no donut) */}
      <DashboardChartsV2
        services={barChartData}
        trendData={trendData}
      />

      {/* 3 Aspek Terendah */}
      {bottom3Unsur.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">3 Aspek Layanan Terendah</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Unsur penilaian dengan skor IKM rata-rata paling rendah — perlu perhatian segera
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {bottom3Unsur.map((u, i) => {
              const color = ikmColorLocal(u.avg);
              const label = ikmLabelLocal(u.avg);
              return (
                <div key={u.key} className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">#{i + 1} Terendah</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: color + "14", color }}>
                      {label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-2 leading-tight">{u.label}</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold" style={{ color }}>{u.avg}</p>
                    <p className="text-xs text-slate-400 mb-1 font-medium">/ 100</p>
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${u.avg}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PerformaTab({ services }: { services: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="text-base font-semibold text-slate-900">Performa Seluruh Layanan</h3>
          <p className="text-sm text-slate-500 mt-1">Peringkat layanan berdasarkan skor IKM tertinggi</p>
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
                        <p className="text-sm font-bold text-slate-700">{svc.ikm.toFixed(2)}</p>
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
