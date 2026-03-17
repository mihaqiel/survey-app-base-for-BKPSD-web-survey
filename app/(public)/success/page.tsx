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
      badgeBg: "bg-green-50 border-green-100 text-green-700",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      icon: <CheckCircle2 className="w-6 h-6" />,
      statusLabel: "Berhasil Dikirim",
      title: "Terima Kasih Atas Partisipasi Anda",
      message: "Survei Kepuasan Masyarakat (SKM) Anda telah berhasil disimpan. Masukan Anda sangat berharga bagi peningkatan kualitas layanan BKPSDM.",
      buttonText: "Kembali ke Beranda",
      buttonLink: "/",
    },
    duplicate: {
      badgeBg: "bg-amber-50 border-amber-100 text-amber-700",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      icon: <AlertTriangle className="w-6 h-6" />,
      statusLabel: "Sudah Diisi",
      title: "Survei Telah Diisi Sebelumnya",
      message: "Sistem mendeteksi bahwa perangkat ini telah mengirimkan survei untuk periode ini. Terima kasih atas partisipasi Anda.",
      buttonText: "Kembali",
      buttonLink: "/",
    },
    closed: {
      badgeBg: "bg-red-50 border-red-100 text-red-700",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      icon: <Lock className="w-6 h-6" />,
      statusLabel: "Periode Ditutup",
      title: "Survei Tidak Tersedia",
      message: "Mohon maaf, periode survei ini telah berakhir atau dinonaktifkan oleh administrator. Silakan hubungi petugas di loket pelayanan untuk informasi lebih lanjut.",
      buttonText: "Kembali ke Beranda",
      buttonLink: "/",
    },
  };

  const ui = config[currentStatus as keyof typeof config] || config.success;

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-gray-50/50">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* CARD */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {/* CARD HEADER */}
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ui.iconBg} ${ui.iconColor}`}>
                  {ui.icon}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ui.badgeBg}`}>
                  {ui.statusLabel}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{ui.title}</h1>
            </div>

            {/* BODY */}
            <div className="px-8 py-8">
              <div className={`flex items-start gap-3 border rounded-lg px-4 py-4 mb-7 ${ui.badgeBg}`}>
                <p className="text-sm leading-relaxed">{ui.message}</p>
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-3 mb-7">
                <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500">BKPSDM Kabupaten Kepulauan Anambas</p>
              </div>

              <Link href={ui.buttonLink}
                className="group flex items-center justify-center gap-2 w-full py-3.5 text-center text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]">
                <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                {ui.buttonText}
              </Link>
            </div>
          </div>

          {/* LEGAL NOTE */}
          <p className="text-center text-xs text-slate-400 mt-5">
            Survei Kepuasan Masyarakat — Permenpan RB No. 14/2017
          </p>
        </div>
      </div>
    </div>
  );
}
