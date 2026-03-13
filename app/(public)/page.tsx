"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const statsRef  = useScrollFade();
  const featRef   = useScrollFade();
  const howtoRef  = useScrollFade();
  const ctaRef    = useScrollFade();

  return (
    <div className="text-[#132B4F] font-sans flex flex-col">

      {/* ── HERO ── */}
      <section className="bg-[#132B4F] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#FAE705 1px, transparent 1px), linear-gradient(90deg, #FAE705 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Decorative blob */}
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-[#009CC5]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">

            {/* Badge */}
            <div className="animate-fade-up delay-75 inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 mb-8">
              <div className="w-1.5 h-1.5 bg-[#FAE705] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
                Portal Resmi — BKPSDM
              </span>
            </div>

            <h1 className="animate-fade-up delay-150 text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[0.9] mb-6">
              Survei
              <br />
              <span className="text-[#f3f2ef]">Kepuasan</span>
              <br />
              Masyarakat
            </h1>

            <p className="animate-fade-up delay-225 text-white/60 text-base md:text-lg max-w-xl mb-10 font-medium leading-relaxed">
              Platform digital pengukuran kinerja pelayanan publik BKPSDM
              Kabupaten Kepulauan Anambas. Transparan, akuntabel, dan terukur.
            </p>

            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3">
              {/* Primary CTA — shimmer + arrow slide */}
              <Link
                href="/enter?token=global-token-2026"
                className="btn-shimmer group relative px-8 py-4 bg-[#FAE705] text-[#132B4F] text-sm font-black uppercase tracking-widest transition-all duration-200 hover:bg-yellow-300 hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(250,231,5,0.35)] active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  Isi Survei Sekarang
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/login"
                className="btn-shimmer group px-8 py-4 bg-white/10 border border-white/20 text-white text-sm font-black uppercase tracking-widest hover:bg-white/20 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  Masuk Dashboard
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div
          className="h-1"
          style={{ background: "linear-gradient(to right, #FAE705, #009CC5)" }}
        />
      </section>

      {/* ── STATS BAR ── */}
      <section
        ref={statsRef}
        className="scroll-fade bg-[#F0F4F8] border-b border-gray-200"
      >
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-gray-300">
          {[
            { val: "9",   label: "Unsur Penilaian",  sub: "Standar Permenpan RB",  delay: "delay-75" },
            { val: "IKM", label: "Indeks Kepuasan",  sub: "Dihitung Otomatis",     delay: "delay-150" },
            { val: "QR",  label: "Akses Mudah",      sub: "Pindai & Isi Survei",   delay: "delay-225" },
          ].map((item) => (
            <div
              key={item.label}
              className={`px-8 first:pl-0 last:pr-0 animate-count-up ${item.delay}`}
            >
              <p className="text-3xl font-black text-[#132B4F]">{item.val}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#009CC5] mt-0.5">
                {item.label}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        ref={featRef}
        className="scroll-fade max-w-5xl mx-auto px-6 py-16 w-full"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-1 h-8 bg-[#009CC5]" />
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
              delay: "delay-75",
            },
            {
              icon: "🛡️",
              title: "Sesuai Regulasi",
              desc: "Menggunakan 9 unsur pelayanan standar Kementerian PANRB sesuai Permenpan RB Nomor 14 Tahun 2017.",
              accent: "#FAE705",
              delay: "delay-150",
            },
            {
              icon: "📱",
              title: "Akses QR Code",
              desc: "Kemudahan akses survei bagi responden melalui pemindaian QR Code yang tersedia di loket pelayanan.",
              accent: "#132B4F",
              delay: "delay-225",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`card-hover p-8 ${i > 0 ? "border-l border-gray-200" : ""} hover:bg-[#F0F4F8] transition-colors animate-fade-up ${f.delay}`}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-5 text-lg transition-transform duration-200 hover:scale-110"
                style={{ backgroundColor: f.accent + "20" }}
              >
                {f.icon}
              </div>
              <div
                className="w-8 h-0.5 mb-4 animate-draw-line"
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

      {/* ── HOW TO ── */}
      <section
        ref={howtoRef}
        className="scroll-fade bg-[#F0F4F8] border-y border-gray-200"
      >
        <div className="max-w-5xl mx-auto px-6 py-16 w-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-[#FAE705]" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
                Panduan
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#132B4F]">
                Cara Pengisian Survei
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
            {[
              { step: "01", icon: "📲", title: "Pindai QR Code", desc: "Temukan QR Code di loket pelayanan BKPSDM lalu pindai menggunakan kamera HP." },
              { step: "02", icon: "🔑", title: "Masukkan Token", desc: "Masukkan kode token akses yang tertera pada QR Code untuk membuka portal survei." },
              { step: "03", icon: "📝", title: "Isi Formulir", desc: "Isi data diri dan berikan penilaian terhadap 9 unsur kepuasan pelayanan." },
              { step: "04", icon: "✅", title: "Kirim Survei", desc: "Klik tombol kirim. Data Anda akan langsung tersimpan dan diolah secara otomatis." },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`bg-white p-7 group card-hover animate-fade-up`}
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-4xl font-black text-gray-100 group-hover:text-[#009CC5]/20 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#132B4F] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        ref={ctaRef}
        className="scroll-fade max-w-5xl mx-auto px-6 py-16 w-full"
      >
        <div className="bg-[#132B4F] overflow-hidden relative">
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(#FAE705 1px, transparent 1px), linear-gradient(90deg, #FAE705 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="h-1 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />
          <div className="relative px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="animate-slide-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5] mb-1">
                Mulai Sekarang
              </p>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Bagikan Pendapat Anda
              </h3>
              <p className="text-sm text-white/50 font-medium mt-1">
                Survei ini bersifat rahasia dan membantu kami meningkatkan layanan.
              </p>
            </div>
            <Link
              href="/enter?token=global-token-2026"
              className="btn-shimmer animate-slide-right group shrink-0 px-7 py-3.5 bg-[#FAE705] text-[#132B4F] text-[11px] font-black uppercase tracking-widest hover:bg-yellow-300 hover:scale-[1.04] hover:shadow-[0_8px_24px_rgba(250,231,5,0.3)] transition-all duration-200 active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                Isi Survei
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}