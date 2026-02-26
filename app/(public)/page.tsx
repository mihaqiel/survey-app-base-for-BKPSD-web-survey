import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="text-[#132B4F] font-sans flex flex-col">
      {/* HERO */}
      <section className="bg-[#132B4F] relative overflow-hidden">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#FAE705 1px, transparent 1px), linear-gradient(90deg, #FAE705 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 mb-8">
              <div className="w-1.5 h-1.5 bg-[#FAE705] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
                Portal Resmi — BKPSDM 
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[0.9] mb-6">
              Survei
              <br />
              <span className="text-[#f3f2ef]">Kepuasan</span>
              <br />
              Masyarakat
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-xl mb-10 font-medium leading-relaxed">
              Platform digital pengukuran kinerja pelayanan publik BKPSDM
              Kabupaten Kepulauan Anambas. Transparan, akuntabel, dan terukur.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/enter"
                className="px-8 py-4 bg-[#FAE705] text-[#132B4F] text-sm font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors"
              >
                Isi Survei Sekarang →
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-colors"
              >
                Masuk Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div
          className="h-1"
          style={{ background: "linear-gradient(to right, #FAE705, #009CC5)" }}
        />
      </section>

      {/* STATS BAR */}
      <section className="bg-[#F0F4F8] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-gray-300">
          {[
            { val: "9", label: "Unsur Penilaian", sub: "Standar Permenpan RB" },
            { val: "IKM", label: "Indeks Kepuasan", sub: "Dihitung Otomatis" },
            { val: "QR", label: "Akses Mudah", sub: "Pindai & Isi Survei" },
          ].map((item) => (
            <div key={item.label} className="px-8 first:pl-0 last:pr-0">
              <p className="text-3xl font-black text-[#132B4F]">{item.val}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#009CC5] mt-0.5">
                {item.label}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-1 h-8 bg-[#f9f9f9]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
              Tentang Sistem
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#132B4F]">
              Fitur Utama SKM
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200">
          {[
            {
              icon: "📊",
              title: "Real-time IKM",
              desc: "Perhitungan Indeks Kepuasan Masyarakat secara otomatis dan akurat berdasarkan setiap respons yang masuk.",
              accent: "#009CC5",
            },
            {
              icon: "🛡️",
              title: "Sesuai Regulasi",
              desc: "Menggunakan 9 unsur pelayanan standar Kementerian PANRB sesuai Permenpan RB Nomor 14 Tahun 2017.",
              accent: "#FAE705",
            },
            {
              icon: "📱",
              title: "Akses QR Code",
              desc: "Kemudahan akses survei bagi responden melalui pemindaian QR Code yang tersedia di loket pelayanan.",
              accent: "#132B4F",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`p-8 ${i > 0 ? "border-l border-gray-200" : ""} hover:bg-[#F0F4F8] transition-colors`}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-5 text-lg"
                style={{ backgroundColor: f.accent + "20" }}
              >
                {f.icon}
              </div>
              <div
                className="w-8 h-0.5 mb-4"
                style={{ backgroundColor: f.accent }}
              />
              <h3 className="text-sm font-black uppercase tracking-widest text-[#132B4F] mb-3">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-5xl mx-auto px-6 pb-16 w-full">
        <div className="bg-[#132B4F]">
          <div className="h-1 bg-gradient-to-r from-[#f2f2f0] to-[#009CC5]" />
          <div className="px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5] mb-1">
                Mulai Sekarang
              </p>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Bagikan Pendapat Anda
              </h3>
              <p className="text-sm text-white/50 font-medium mt-1">
                Survei ini bersifat rahasia dan membantu kami meningkatkan
                layanan.
              </p>
            </div>
            <Link
              href="/enter"
              className="px-7 py-3.5 bg-[#f2f2ef] text-[#132B4F] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors shrink-0"
            >
              Isi Survei →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
