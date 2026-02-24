import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const currentStatus = status || "success"; // Default to success

  // 🎨 CONFIGURATION MAPPING
  const config = {
    success: {
      color: "bg-green-500",
      lightColor: "bg-green-50 text-green-700 border-green-200",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Terima Kasih!",
      message: "Survei Kepuasan Masyarakat (SKM) Anda berhasil disimpan. Masukan Anda sangat berharga bagi peningkatan kualitas layanan kami.",
      buttonText: "Kembali ke Beranda",
      buttonLink: "/",
    },
    duplicate: {
      color: "bg-orange-500",
      lightColor: "bg-orange-50 text-orange-800 border-orange-200",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: "Anda Sudah Mengisi",
      message: "Sistem mendeteksi bahwa perangkat ini telah mengirimkan survei untuk periode ini. Terima kasih atas partisipasi Anda.",
      buttonText: "Kembali",
      buttonLink: "/",
    },
    closed: {
      color: "bg-red-600",
      lightColor: "bg-red-50 text-red-800 border-red-200",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Periode Ditutup",
      message: "Mohon maaf, periode survei ini telah berakhir atau dinonaktifkan oleh administrator. Silakan hubungi petugas untuk info lebih lanjut.",
      buttonText: "Tutup Halaman",
      buttonLink: "/",
    },
  };

  // Select config based on status (fallback to success)
  const ui = config[currentStatus as keyof typeof config] || config.success;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6 font-sans">
      
      {/* CARD CONTAINER */}
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative">
        
        {/* HEADER COLOR BAR */}
        <div className={`h-2 w-full ${ui.color.replace('bg-', 'bg-')}`}></div>

        <div className="p-10 flex flex-col items-center text-center">
          
          {/* ICON CIRCLE */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg mb-8 ${ui.color} shadow-${ui.color.split('-')[1]}-200`}>
            {ui.icon}
          </div>

          {/* TEXT CONTENT */}
          <h1 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">
            {ui.title}
          </h1>
          
          <div className={`px-6 py-4 rounded-2xl text-xs font-medium leading-relaxed mb-8 ${ui.lightColor} border`}>
            {ui.message}
          </div>

          {/* ACTION BUTTON */}
          <Link 
            href={ui.buttonLink} 
            className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            {ui.buttonText}
          </Link>
          
          <p className="mt-6 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
            Government Survey System
          </p>
        </div>
      </div>
    </div>
  );
}