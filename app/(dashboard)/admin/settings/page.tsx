export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import QrSection from "@/app/(dashboard)/admin/components/QrSection";
import PeriodeManager from "@/app/(dashboard)/admin/components/PeriodeManager";
import { Activity, Layers, Users, QrCode } from "lucide-react";

export default async function SettingsPage() {
  const activePeriod   = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const allPeriodes    = await prisma.periode.findMany({ orderBy: { createdAt: "desc" } });
  const totalResponses = await prisma.respon.count(); // All-time across all periods
  const totalLayanan   = await prisma.layanan.count();
  const totalPegawai   = await prisma.pegawai.count();

  return (
    <div className="min-h-screen font-sans bg-gray-50/50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Settings & QR Code</h1>
          <p className="text-xs text-slate-500">Kelola periode survei dan QR Code</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Responden", value: totalResponses, color: "#3b82f6", icon: <Activity className="w-5 h-5" /> },
            { label: "Total Layanan",   value: totalLayanan,   color: "#0f172a", icon: <Layers className="w-5 h-5" /> },
            { label: "Total Pegawai",   value: totalPegawai,   color: "#16a34a", icon: <Users className="w-5 h-5" /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10", color: s.color }}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* QR CODE */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <QrCode className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">QR Code Survei</p>
                <p className="text-xs text-slate-500 mt-0.5">Satu QR untuk semua layanan</p>
              </div>
            </div>
            {activePeriod ? (
              <QrSection token={activePeriod.token} label={activePeriod.label} />
            ) : (
              <div className="p-10 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-red-500">Tidak Ada Periode Aktif</p>
                <p className="text-sm text-slate-400 text-center">Buat periode baru di panel kanan untuk mengaktifkan QR Code</p>
              </div>
            )}
          </div>

          {/* PERIOD MANAGER */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Manajemen Periode</p>
                <p className="text-xs text-slate-500 mt-0.5">Kelola periode survei aktif</p>
              </div>
            </div>
            <PeriodeManager
              activePeriode={activePeriod ? { id: activePeriod.id, label: activePeriod.label, token: activePeriod.token, status: activePeriod.status } : null}
              allPeriodes={allPeriodes.map((p: typeof allPeriodes[0]) => ({ id: p.id, label: p.label, token: p.token, status: p.status, createdAt: p.createdAt.toISOString() }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
