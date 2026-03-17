"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BarChart3, ShieldCheck, Smartphone, QrCode, KeyRound, ClipboardList, CheckCircle2 } from "lucide-react";

const HERO_LOGOS = [
  { src: "/logo-anambas.png", alt: "Lambang Kepulauan Anambas", width: 240, height: 260 },
  { src: "/logo-anambas-maju.png", alt: "Anambas Maju", width: 400, height: 200 },
  { src: "/logo-bkpsdm.png", alt: "BKPSDM Anambas", width: 360, height: 200 }
];

export default function LandingClient({ surveyToken }: { surveyToken: string }) {
  const surveyHref = surveyToken ? `/enter?token=${surveyToken}` : "/enter";
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % HERO_LOGOS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-slate-900 font-sans flex flex-col min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="bg-white relative overflow-hidden border-b border-gray-100">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-[#FAE705]/10 blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Left Text */}
          <div className="max-w-3xl lg:w-3/5">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600">Portal Resmi — BKPSDM</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Survei Kepuasan<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Masyarakat</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Platform digital pengukuran kinerja pelayanan publik BKPSDM Kabupaten Kepulauan Anambas. Transparan, akuntabel, dan terukur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={surveyHref}
                className="group px-8 py-4 bg-[#FAE705] text-slate-900 text-base font-bold rounded-xl transition-all duration-300 hover:bg-[#eacc00] hover:shadow-xl hover:shadow-[#FAE705]/20 hover:-translate-y-0.5 active:scale-[0.98]">
                <span className="flex items-center justify-center gap-2">
                  Mulai Survei
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </span>
              </Link>
              <Link href="/login"
                className="group px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 text-base font-bold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 active:scale-[0.98]">
                <span className="flex items-center justify-center gap-2">
                  Masuk Dashboard
                </span>
              </Link>
            </div>
          </div>

          {/* Right Animated Logo Container */}
          <div className="lg:w-2/5 flex items-center justify-center w-full relative h-[300px] md:h-[400px]">
             {HERO_LOGOS.map((logo, idx) => (
                <div key={logo.src} className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${logoIndex === idx ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
                  <Image 
                    src={logo.src} 
                    alt={logo.alt} 
                    width={logo.width} 
                    height={logo.height}
                    className="object-contain drop-shadow-2xl mix-blend-multiply"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                  />
                </div>
             ))}
          </div>

        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-slate-800 gap-6 sm:gap-0">
          {[
            { val: "9",   label: "Unsur Penilaian", sub: "Standar Permenpan RB" },
            { val: "IKM", label: "Indeks Kepuasan", sub: "Dihitung Otomatis" },
            { val: "QR",  label: "Akses Mudah",     sub: "Pindai & Isi Survei" },
          ].map((item) => (
            <div key={item.label} className="px-8 first:pl-0 last:pr-0">
              <p className="text-4xl font-bold text-white">{item.val}</p>
              <p className="text-sm font-bold text-[#FAE705] mt-1">{item.label}</p>
              <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-6 py-24 w-full bg-slate-50">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-[#eacc00] uppercase tracking-wider mb-3">Tentang Sistem</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Fitur Utama SKM</h2>
          <p className="text-slate-500">Meningkatkan kualitas pelayanan publik melalui evaluasi yang komprehensif.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <BarChart3 className="w-6 h-6" />, title: "Real-time IKM", desc: "Perhitungan Indeks Kepuasan Masyarakat secara otomatis dan akurat berdasarkan setiap respons yang masuk." },
            { icon: <ShieldCheck className="w-6 h-6" />, title: "Sesuai Regulasi", desc: "Menggunakan 9 unsur pelayanan standar Kementerian PANRB sesuai Permenpan RB Nomor 14 Tahun 2017." },
            { icon: <QrCode className="w-6 h-6" />, title: "Akses QR Code", desc: "Kemudahan akses survei bagi responden melalui pemindaian QR Code yang tersedia di loket pelayanan." },
          ].map((f) => (
            <div key={f.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-[#FAE705]/20 text-[#d4b500] flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO */}
      <section className="bg-white border-y border-gray-100 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full bg-slate-100 blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 w-full">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Cara Pengisian Survei</h2>
            <div className="w-20 h-1.5 bg-[#FAE705] mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: <Smartphone className="w-6 h-6 text-slate-700" />, title: "Pindai QR Code", desc: "Temukan QR Code di loket pelayanan BKPSDM lalu pindai." },
              { step: "02", icon: <KeyRound className="w-6 h-6 text-slate-700" />, title: "Masukkan Token", desc: "Ketik kode akses dari QR Code ke dalam portal survei." },
              { step: "03", icon: <ClipboardList className="w-6 h-6 text-slate-700" />, title: "Isi Formulir", desc: "Beri rating layanan dan nilai 9 unsur pelayanan." },
              { step: "04", icon: <CheckCircle2 className="w-6 h-6 text-slate-700" />, title: "Kirim Survei", desc: "Data Anda langsung tersimpan dan aman." },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="text-6xl font-black text-slate-100 absolute -top-4 -left-2 z-0 transition-colors duration-300 group-hover:text-[#FAE705]/20">{item.step}</div>
                <div className="relative z-10 pt-6">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 w-full">
        <div className="bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#FAE705]/20 blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/4" />
          <div className="relative px-10 py-16 flex flex-col items-center text-center gap-8">
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Bagikan Pendapat Anda</h3>
              <p className="text-base text-slate-400">Survei ini bersifat rahasia dan sangat membantu kami meningkatkan kualitas pelayanan bagi masyarakat.</p>
            </div>
            <Link href={surveyHref}
              className="group px-10 py-5 bg-[#FAE705] text-slate-900 text-lg font-bold rounded-xl hover:bg-[#eacc00] hover:shadow-[0_0_40px_-10px_rgba(250,231,5,0.5)] transition-all duration-300 active:scale-[0.98]">
              <span className="flex items-center gap-3">
                Isi Survei Sekarang
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
