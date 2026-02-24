import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col relative overflow-hidden">
      
      {/* 🟢 BACKGROUND DECORATION (Subtle Government Pattern) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gray-200/50 rounded-full blur-3xl" />
      </div>

      {/* 🟢 NAVBAR */}
      <nav className="relative z-10 px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {/* Logo Placeholder - You can replace this with <Image /> later */}
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">
            GOV
          </div>
          <div className="leading-tight">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Pemerintah Daerah</h3>
            <h2 className="text-sm font-bold text-black uppercase tracking-wide">Badan Kepegawaian & PSDM</h2>
          </div>
        </div>
        <Link 
          href="/admin" 
          className="px-6 py-2 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-sm"
        >
          Admin Login →
        </Link>
      </nav>

      {/* 🟢 HERO SECTION */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 max-w-4xl mx-auto mt-[-50px]">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Official Survey Portal</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-[0.9]">
          Sistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-black">Survei Kepuasan</span> Masyarakat
        </h1>

        {/* Description / Regulation Citation */}
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-10 font-medium leading-relaxed">
          Platform digital pengukuran kinerja pelayanan publik berdasarkan standar 
          <span className="text-black font-bold"> Permenpan RB No. 14 Tahun 2017</span>. 
          Transparan, Akuntabel, dan Terukur.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            href="/admin" 
            className="px-10 py-5 bg-black text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-gray-900 hover:scale-[1.02] transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
          >
            Masuk Dashboard
          </Link>
          <a 
            href="#" // Placeholder for maybe a 'Check Report' or 'About' link later
            className="px-10 py-5 bg-white text-black border border-gray-200 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
          >
            Panduan SKM
          </a>
        </div>

        {/* Features Grid (Small) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full max-w-3xl">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg mb-4 flex items-center justify-center text-blue-600">📊</div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Real-time IKM</h3>
            <p className="text-xs text-gray-500">Perhitungan Indeks Kepuasan Masyarakat secara otomatis dan akurat.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-green-100 rounded-lg mb-4 flex items-center justify-center text-green-600">🛡️</div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Sesuai Regulasi</h3>
            <p className="text-xs text-gray-500">Menggunakan 9 unsur pelayanan standar Kementerian PANRB.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-lg mb-4 flex items-center justify-center text-purple-600">📱</div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Akses QR Code</h3>
            <p className="text-xs text-gray-500">Kemudahan akses survei bagi responden melalui pindai QR Code.</p>
          </div>
        </div>

      </main>

      {/* 🟢 FOOTER */}
      <footer className="relative z-10 py-8 text-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
        <p>© 2026 Pemerintah Daerah. All Rights Reserved.</p>
        <p className="mt-1 opacity-50">Developed for Public Service Excellence</p>
      </footer>

    </div>
  );
}