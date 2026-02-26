import Link from "next/link";

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
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ),
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
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
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
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      statusLabel: "Periode Ditutup",
      title: "Survei Tidak",
      subtitle: "Tersedia",
      message: "Mohon maaf, periode survei ini telah berakhir atau dinonaktifkan oleh administrator. Silakan hubungi petugas di loket pelayanan untuk informasi lebih lanjut.",
      buttonText: "Kembali ke Beranda",
      buttonLink: "/",
    },
  };

  const ui = config[currentStatus as keyof typeof config] || config.success;

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-[#F0F4F8]">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* CARD */}
          <div className="bg-white border border-gray-200 shadow-lg overflow-hidden">

            {/* CARD HEADER */}
            <div className={`${ui.headerBg} px-8 py-7`}>
              <div className="flex items-center gap-4">
                {/* Icon box */}
                <div
                  className="w-14 h-14 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: ui.accentColor }}
                >
                  {ui.icon}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-0.5" style={{ color: ui.accentColor === "#16a34a" ? "#009CC5" : ui.accentColor === "#d97706" ? "#FAE705" : "#f87171" }}>
                    {ui.statusLabel}
                  </p>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                    {ui.title}<br />
                    <span style={{ color: ui.accentColor === "#16a34a" ? "#FAE705" : ui.accentColor === "#d97706" ? "#FAE705" : "#fca5a5" }}>
                      {ui.subtitle}
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            {/* ACCENT LINE */}
            <div className="h-1" style={{ backgroundColor: ui.accentColor }} />

            {/* BODY */}
            <div className="px-8 py-8">

              {/* Message box */}
              <div className={`flex items-start gap-3 border px-4 py-4 mb-7 ${ui.badgeBg}`}>
                <div className="w-1 min-h-[20px] shrink-0 mt-0.5" style={{ backgroundColor: ui.accentColor }} />
                <p className="text-sm font-medium leading-relaxed">{ui.message}</p>
              </div>

              {/* Info strip */}
              <div className="bg-[#F0F4F8] px-4 py-3 flex items-center gap-3 mb-7">
                <div className="w-6 h-6 bg-[#132B4F] flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5   text-[#FAE705]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                  BKPSDM Kabupaten Kepulauan Anambas
                </p>
              </div>

              {/* Button */}
              <Link
                href={ui.buttonLink}
                className="block w-full py-4 text-center text-sm font-black uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#132B4F" }}
              >
                {ui.buttonText} →
              </Link>
            </div>
          </div>

          {/* LEGAL NOTE */}
          <p className="text-center text-[10px] text-gray-400 font-medium mt-5 uppercase tracking-widest">
            Survei Kepuasan Masyarakat — Permenpan RB No. 14/2017
          </p>
        </div>
      </div>
    </div>
  );
}