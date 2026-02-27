export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import QrSection from "@/app/(dashboard)/admin/components/QrSection";
import Link from "next/link";

export default async function SettingsPage() {
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const totalResponses = activePeriod ? await prisma.respon.count({ where: { periodeId: activePeriod.id } }) : 0;
  const totalLayanan = await prisma.layanan.count();
  const totalPegawai = await prisma.pegawai.count();

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-7 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Konfigurasi</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none">QR Code & Akses Survei</h1>
          </div>
        </div>
        <Link href="/admin"
          className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
          ← Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: QR */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
          {activePeriod ? (
            <QrSection token={activePeriod.token} label={activePeriod.label} />
          ) : (
            <div className="p-12 flex flex-col items-center justify-center gap-3 h-64">
              <div className="w-10 h-10 bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Tidak Ada Periode Aktif</p>
              <p className="text-xs text-gray-400 font-medium text-center">Jalankan seed script atau buat periode di database.</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">

          {/* STATUS CARD */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-[#009CC5]" />
            <div className="p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5] mb-5">Status Sistem</p>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-[#FAE705] animate-pulse shrink-0" />
                <div>
                  <p className="font-black text-[#132B4F]">Sistem Aktif</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Menerima respons untuk <span className="text-[#132B4F] font-bold">{activePeriod?.label || "—"}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: totalResponses, label: "Respons", highlight: true },
                  { val: totalLayanan, label: "Layanan", highlight: false },
                  { val: totalPegawai, label: "Pegawai", highlight: false },
                ].map(({ val, label, highlight }) => (
                  <div key={label} className={`p-4 text-center border border-gray-100 ${highlight ? "bg-[#132B4F]" : "bg-[#F0F4F8]"}`}>
                    <p className={`text-2xl font-black ${highlight ? "text-[#FAE705]" : "text-[#132B4F]"}`}>{val}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${highlight ? "text-[#009CC5]" : "text-gray-400"}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HOW TO USE */}
          <div className="bg-[#132B4F] border border-gray-200 overflow-hidden flex-1">
            <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
            <div className="p-6 space-y-5">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5]">Cara Penggunaan</p>
              <div className="space-y-4">
                {[
                  "Cetak QR Code di sebelah kiri dan pasang di loket pelayanan Anda.",
                  "Responden memindai kode untuk membuka Portal Pemilihan Layanan.",
                  "Respons otomatis dikategorikan berdasarkan layanan yang dipilih.",
                  "Lihat analitik per layanan atau pegawai dari Dashboard.",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3">
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
