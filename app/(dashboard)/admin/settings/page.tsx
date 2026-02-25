import { prisma } from "@/lib/prisma";
import QrSection from "../components/QrSection";
import Link from "next/link";

export default async function SettingsPage() {
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const totalResponses = activePeriod ? await prisma.respon.count({ where: { periodeId: activePeriod.id } }) : 0;
  const totalLayanan = await prisma.layanan.count();
  const totalPegawai = await prisma.pegawai.count();

  return (
    <div className="min-h-screen p-8 font-sans" style={{ backgroundColor: "#F0F4F8", color: "#132B4F" }}>

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest mb-4 block hover:opacity-70 transition-opacity" style={{ color: "#009CC5" }}>
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: "#132B4F" }}>Settings & QR Code</h1>
        <p className="text-sm font-medium mt-2 text-gray-500">Kelola konfigurasi akses global dan titik masuk survei.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: QR */}
        <div>
          {activePeriod ? (
            <QrSection token={activePeriod.token} label={activePeriod.label} />
          ) : (
            <div className="p-8 bg-red-50 text-red-600 rounded-2xl font-bold text-center border border-red-100 h-full flex flex-col items-center justify-center gap-2">
              <p className="font-black">System Error: Tidak Ada Periode Aktif.</p>
              <p className="text-xs font-normal opacity-70">Jalankan seed script atau buat periode di database.</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">

          {/* STATUS CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-1 w-12 rounded-full mb-6" style={{ backgroundColor: "#009CC5" }} />
            <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: "#009CC5" }}>Status Sistem</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-4 h-4 rounded-full animate-pulse shrink-0" style={{ backgroundColor: "#FAE705" }} />
              <div>
                <p className="font-black text-lg" style={{ color: "#132B4F" }}>Sistem Aktif</p>
                <p className="text-xs text-gray-400 font-medium">Menerima respons untuk {activePeriod?.label || "Unknown"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { val: totalResponses, label: "Respons" },
                { val: totalLayanan, label: "Layanan" },
                { val: totalPegawai, label: "Pegawai" },
              ].map(({ val, label }, i) => (
                <div key={label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: i === 0 ? "#132B4F" : "#F0F4F8" }}>
                  <p className="text-2xl font-black" style={{ color: i === 0 ? "#FAE705" : "#132B4F" }}>{val}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: i === 0 ? "#009CC5" : "gray" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* HOW TO USE */}
          <div className="p-8 rounded-2xl text-white flex-1" style={{ backgroundColor: "#132B4F" }}>
            <div className="h-1 w-16 rounded-full mb-6" style={{ backgroundColor: "#FAE705" }} />
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: "#009CC5" }}>Cara Penggunaan</h3>
            <div className="space-y-5">
              {[
                "Cetak QR Code di sebelah kiri dan pasang di loket pelayanan Anda.",
                "Responden memindai kode untuk membuka Portal Pemilihan Layanan.",
                "Respons otomatis dikategorikan berdasarkan layanan yang dipilih.",
                "Lihat analitik per layanan atau pegawai dari Dashboard.",
              ].map((text, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5" style={{ backgroundColor: "#009CC5" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm font-medium text-white/70 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FAE705" }} />
              Token: {activePeriod?.token ?? "—"}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}