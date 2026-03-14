import Link from "next/link";
import { CheckCircle2, AlertTriangle, Lock, Info, ArrowLeft } from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const currentStatus = status || "success";

  const config = {
    success: {
      accentColor: "#16a34a",
      headerBg: "bg-[#132B4F]",
      badgeBg: "bg-green-50 border-green-200 text-green-700",
      icon: <CheckCircle2 className="w-10 h-10 text-white" />,
      statusLabel: "Berhasil Dikirim",
      title: "Terima Kasih",
      subtitle: "Atas Partisipasi Anda",
      message: "Survei Kepuasan Masyarakat (SKM) Anda telah berhasil disimpan. Masukan Anda sangat berharga bagi peningkatan kualitas layanan BKPSDM.",
      buttonText: "Kembali ke Beranda",
      buttonLink: "/",
    },
    duplicate: {
      accentColor: "#d97706",
      headerBg: "bg-[#132B4F]",
      badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
      icon: <AlertTriangle className="w-10 h-10 text-white" />,
      statusLabel: "Sudah Diisi",
      title: "Survei Telah",
      subtitle: "Diisi Sebelumnya",
      message: "Sistem mendeteksi bahwa perangkat ini telah mengirimkan survei untuk periode ini. Terima kasih atas partisipasi Anda.",
      buttonText: "Kembali",
      buttonLink: "/",
    },
    closed: {
      accentColor: "#dc2626",
      headerBg: "bg-[#132B4F]",
      badgeBg: "bg-red-50 border-red-200 text-red-700",
      icon: <Lock className="w-10 h-10 text-white" />,
      statusLabel: "Periode Ditutup",
      title: "Survei Tidak",
      subtitle: "Tersedia",
      message: "Mohon maaf, periode survei ini telah berakhir atau dinonaktifkan oleh administrator. Silakan hubungi petugas di loket pelayanan untuk informasi lebih lanjut.",
      buttonText: "Kembali ke Beranda",
      buttonLink: "/",
    },
  };

  const ui = config[currentStatus as keyof typeof config] || config.success;

  const subtitleColor =
    ui.accentColor === "#16a34a" ? "#FAE705"
    : ui.accentColor === "#d97706" ? "#FAE705"
    : "#fca5a5";

  const labelColor =
    ui.accentColor === "#16a34a" ? "#009CC5"
    : ui.accentColor === "#d97706" ? "#FAE705"
    : "#f87171";

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-[#F0F4F8]">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-up">

          {/* CARD */}
          <div className="bg-white border border-gray-200 shadow-lg overflow-hidden">

            {/* CARD HEADER */}
            <div className={`${ui.headerBg} px-8 py-7 relative overflow-hidden`}>
              <div
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
                style={{ backgroundColor: ui.accentColor }}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className="animate-bounce-in w-14 h-14 flex items-center justify-center shrink-0 delay-150"
                  style={{ backgroundColor: ui.accentColor }}
                >
                  {ui.icon}
                </div>
                <div className="animate-fade-up delay-225">
                  <p
                    className="text-[9px] font-black uppercase tracking-[0.3em] mb-0.5"
                    style={{ color: labelColor }}
                  >
                    {ui.statusLabel}
                  </p>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                    {ui.title}<br />
                    <span style={{ color: subtitleColor }}>{ui.subtitle}</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* ACCENT LINE */}
            <div
              className="h-1 animate-draw-line"
              style={{ backgroundColor: ui.accentColor }}
            />

            {/* BODY */}
            <div className="px-8 py-8">

              {/* Message box */}
              <div className={`animate-fade-up delay-75 flex items-start gap-3 border px-4 py-4 mb-7 ${ui.badgeBg}`}>
                <div
                  className="w-1 min-h-[20px] shrink-0 mt-0.5"
                  style={{ backgroundColor: ui.accentColor }}
                />
                <p className="text-sm font-medium leading-relaxed">{ui.message}</p>
              </div>

              {/* Info strip */}
              <div className="animate-fade-up delay-150 bg-[#F0F4F8] px-4 py-3 flex items-center gap-3 mb-7">
                <div className="w-6 h-6 bg-[#132B4F] flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5 text-[#FAE705]" />
                </div>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                  BKPSDM Kabupaten Kepulauan Anambas
                </p>
              </div>

              {/* Button */}
              <div className="animate-fade-up delay-225">
                <Link
                  href={ui.buttonLink}
                  className="btn-shimmer group flex items-center justify-center gap-2 w-full py-4 text-center text-sm font-black uppercase tracking-widest text-white hover:opacity-90 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(19,43,79,0.25)] transition-all duration-200 active:scale-[0.98]"
                  style={{ backgroundColor: "#132B4F" }}
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  {ui.buttonText}
                </Link>
              </div>
            </div>
          </div>

          {/* LEGAL NOTE */}
          <p className="animate-fade-in delay-450 text-center text-[10px] text-gray-400 font-medium mt-5 uppercase tracking-widest">
            Survei Kepuasan Masyarakat — Permenpan RB No. 14/2017
          </p>
        </div>
      </div>
    </div>
  );
}