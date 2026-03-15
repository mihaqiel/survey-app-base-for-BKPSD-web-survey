export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import QrSection from "@/app/(dashboard)/admin/components/QrSection";
import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, Layers, Users, QrCode, Bell, Search } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default async function SettingsPage() {
  const activePeriod   = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const totalResponses = activePeriod ? await prisma.respon.count({ where: { periodeId: activePeriod.id } }) : 0;
  const totalLayanan   = await prisma.layanan.count();
  const totalPegawai   = await prisma.pegawai.count();

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* GLOBAL HEADER */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div className="animate-slide-left">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Settings & QR" }]} />
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none mt-0.5">QR Code & Akses Survei</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 animate-slide-right">
          <div className="hidden md:flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5 w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-400 font-medium">Search Global...</span>
          </div>
          <button aria-label="Notifikasi" className="w-8 h-8 flex items-center justify-center bg-[#F0F4F8] border border-gray-200 hover:bg-white transition-colors">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: QR */}
        <div className="animate-slide-left bg-white border border-gray-200 overflow-hidden card-hover">
          <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] animate-draw-line" />
          {activePeriod ? (
            <QrSection token={activePeriod.token} label={activePeriod.label} />
          ) : (
            <div className="p-12 flex flex-col items-center justify-center gap-3 h-64">
              <div className="w-10 h-10 bg-red-100 flex items-center justify-center animate-bounce-in">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Tidak Ada Periode Aktif</p>
              <p className="text-xs text-gray-400 font-medium text-center">Jalankan seed script atau buat periode di database.</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">

          {/* STATUS CARD */}
          <div className="animate-slide-right bg-white border border-gray-200 overflow-hidden card-hover">
            <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
            <div className="p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-5">Status Sistem</p>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-8 h-8 bg-green-50 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                </div>
                <div>
                  <p className="font-black text-[#132B4F]">Sistem Aktif</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Menerima respons untuk <span className="text-[#132B4F] font-bold">{activePeriod?.label || "—"}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: totalResponses, label: "Respons",  icon: <BarChart3 className="w-4 h-4" />, highlight: true  },
                  { val: totalLayanan,   label: "Layanan",  icon: <Layers className="w-4 h-4" />,   highlight: false },
                  { val: totalPegawai,   label: "Pegawai",  icon: <Users className="w-4 h-4" />,    highlight: false },
                ].map(({ val, label, icon, highlight }, i) => (
                  <div key={label} className={`p-4 text-center border border-gray-100 card-hover animate-count-up ${highlight ? "bg-[#132B4F]" : "bg-[#F0F4F8]"}`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`flex justify-center mb-2 ${highlight ? "text-[#FAE705]/40" : "text-gray-300"}`}>{icon}</div>
                    <p className={`text-2xl font-black ${highlight ? "text-[#FAE705]" : "text-[#132B4F]"}`}>{val}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${highlight ? "text-[#009CC5]" : "text-gray-400"}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HOW TO USE */}
          <div className="animate-fade-up delay-150 bg-[#132B4F] border border-gray-200 overflow-hidden flex-1 card-hover">
            <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] animate-draw-line" />
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#009CC5]" />
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5]">Cara Penggunaan</p>
              </div>
              <div className="space-y-4">
                {[
                  "Cetak QR Code di sebelah kiri dan pasang di loket pelayanan Anda.",
                  "Responden memindai kode untuk membuka Portal Pemilihan Layanan.",
                  "Respons otomatis dikategorikan berdasarkan layanan yang dipilih.",
                  "Lihat analitik per layanan atau pegawai dari Dashboard.",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="w-6 h-6 bg-[#009CC5] flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <p className="text-sm font-medium text-white/60 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FAE705]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Token: {activePeriod?.token ?? "—"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}