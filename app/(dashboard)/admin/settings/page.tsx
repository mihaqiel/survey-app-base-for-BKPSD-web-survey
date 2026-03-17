export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import QrSection from "@/app/(dashboard)/admin/components/QrSection";
import PeriodeManager from "@/app/(dashboard)/admin/components/PeriodeManager";
import { Activity, Layers, Users, QrCode } from "lucide-react";

export default async function SettingsPage() {
  const activePeriod   = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const allPeriodes    = await prisma.periode.findMany({ orderBy: { createdAt: "desc" } });
  const totalResponses = activePeriod ? await prisma.respon.count({ where: { periodeId: activePeriod.id } }) : 0;
  const totalLayanan   = await prisma.layanan.count();
  const totalPegawai   = await prisma.pegawai.count();

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center sticky top-0 z-20 shadow-sm">
        <div className="w-0.5 h-6 bg-[#FAE705] mr-3 shrink-0" />
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#009CC5]">BKPSDM · Admin</p>
          <h1 className="text-base font-black uppercase tracking-tight text-[#132B4F] leading-none">Settings & QR Code</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Responden", value: totalResponses, color: "#009CC5", icon: <Activity className="w-4 h-4" /> },
            { label: "Total Layanan",   value: totalLayanan,   color: "#132B4F", icon: <Layers className="w-4 h-4" /> },
            { label: "Total Pegawai",   value: totalPegawai,   color: "#16a34a", icon: <Users className="w-4 h-4" /> },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1" style={{ backgroundColor: s.color }} />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                </div>
                <span style={{ color: s.color, opacity: 0.2 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* QR CODE */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#009CC5]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">QR Code Survei</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Satu QR untuk semua layanan</p>
              </div>
            </div>
            {activePeriod ? (
              <QrSection token={activePeriod.token} label={activePeriod.label} />
            ) : (
              <div className="p-10 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 bg-red-50 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Tidak Ada Periode Aktif</p>
                <p className="text-[11px] text-gray-400 text-center">Buat periode baru di panel kanan untuk mengaktifkan QR Code</p>
              </div>
            )}
          </div>

          {/* PERIOD MANAGER */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-[#132B4F] to-[#FAE705]" />
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <div className="w-0.5 h-4 bg-[#132B4F]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Manajemen Periode</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Kelola periode survei aktif</p>
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