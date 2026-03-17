"use client";

import Link from "next/link";
import { BarChart3, ShieldCheck, Smartphone, QrCode, KeyRound, ClipboardList, CheckCircle2 } from "lucide-react";

export default function LandingClient({ surveyToken }: { surveyToken: string }) {
  const surveyHref = surveyToken ? `/enter?token=${surveyToken}` : "/enter";

  return (
    <div className="text-slate-900 font-sans flex flex-col">

      {/* HERO */}
      <section className="bg-slate-900 relative overflow-hidden">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-white/70">Portal Resmi — BKPSDM</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
              Survei Kepuasan<br />Masyarakat
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
              Platform digital pengukuran kinerja pelayanan publik BKPSDM Kabupaten Kepulauan Anambas. Transparan, akuntabel, dan terukur.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={surveyHref}
                className="group px-8 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]">
                <span className="flex items-center gap-2">
                  Isi Survei Sekarang
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </span>
              </Link>
              <Link href="/login"
                className="group px-8 py-3.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 active:scale-[0.98]">
                <span className="flex items-center gap-2">
                  Masuk Dashboard
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-gray-200 gap-4 sm:gap-0">
          {[
            { val: "9",   label: "Unsur Penilaian", sub: "Standar Permenpan RB" },
            { val: "IKM", label: "Indeks Kepuasan", sub: "Dihitung Otomatis" },
            { val: "QR",  label: "Akses Mudah",     sub: "Pindai & Isi Survei" },
          ].map((item) => (
            <div key={item.label} className="px-8 first:pl-0 last:pr-0">
              <p className="text-3xl font-bold text-slate-900">{item.val}</p>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Tentang Sistem</p>
          <h2 className="text-2xl font-bold text-slate-900">Fitur Utama SKM</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <BarChart3 className="w-5 h-5" />, title: "Real-time IKM", desc: "Perhitungan Indeks Kepuasan Masyarakat secara otomatis dan akurat berdasarkan setiap respons yang masuk.", color: "blue" },
            { icon: <ShieldCheck className="w-5 h-5" />, title: "Sesuai Regulasi", desc: "Menggunakan 9 unsur pelayanan standar Kementerian PANRB sesuai Permenpan RB Nomor 14 Tahun 2017.", color: "emerald" },
            { icon: <QrCode className="w-5 h-5" />, title: "Akses QR Code", desc: "Kemudahan akses survei bagi responden melalui pemindaian QR Code yang tersedia di loket pelayanan.", color: "slate" },
          ].map((f) => (
            <div key={f.title}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                f.color === "blue" ? "bg-blue-50 text-blue-600" :
                f.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                "bg-slate-50 text-slate-600"
              }`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO */}
      <section className="bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 w-full">
          <div className="mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Panduan</p>
            <h2 className="text-2xl font-bold text-slate-900">Cara Pengisian Survei</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: <Smartphone className="w-6 h-6 text-blue-600" />, title: "Pindai QR Code", desc: "Temukan QR Code di loket pelayanan BKPSDM lalu pindai menggunakan kamera HP." },
              { step: "02", icon: <KeyRound className="w-6 h-6 text-blue-600" />, title: "Masukkan Token", desc: "Masukkan kode token akses yang tertera pada QR Code untuk membuka portal survei." },
              { step: "03", icon: <ClipboardList className="w-6 h-6 text-blue-600" />, title: "Isi Formulir", desc: "Isi data diri, pilih pegawai, beri rating, dan berikan penilaian terhadap 9 unsur kepuasan." },
              { step: "04", icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />, title: "Kirim Survei", desc: "Klik tombol kirim. Data Anda akan langsung tersimpan dan diolah secara otomatis." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  {item.icon}
                  <span className="text-3xl font-bold text-gray-100">{item.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          <div className="px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Mulai Sekarang</p>
              <h3 className="text-xl font-bold text-white">Bagikan Pendapat Anda</h3>
              <p className="text-sm text-white/50 mt-1">Survei ini bersifat rahasia dan membantu kami meningkatkan layanan.</p>
            </div>
            <Link href={surveyHref}
              className="group shrink-0 px-7 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
              <span className="flex items-center gap-2">
                Isi Survei
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
