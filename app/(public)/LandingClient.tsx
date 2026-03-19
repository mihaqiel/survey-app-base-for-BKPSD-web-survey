"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { BarChart3, ShieldCheck, QrCode, Smartphone, KeyRound, ClipboardList, CheckCircle2, ChevronDown } from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";

/* ── Fonts ─────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

/* ── Data ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-time IKM",
    desc: "Perhitungan Indeks Kepuasan Masyarakat secara otomatis dan akurat berdasarkan setiap respons yang masuk.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Sesuai Regulasi",
    desc: "Menggunakan 9 unsur pelayanan standar Kementerian PANRB sesuai Permenpan RB Nomor 14 Tahun 2017.",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "Akses QR Code",
    desc: "Kemudahan akses survei bagi responden melalui pemindaian QR Code yang tersedia di loket pelayanan.",
  },
];

const STEPS = [
  { step: "01", icon: <Smartphone className="w-6 h-6" />,   title: "Pindai QR Code",    desc: "Temukan QR Code di loket pelayanan BKPSDM lalu pindai menggunakan kamera ponsel Anda." },
  { step: "02", icon: <KeyRound    className="w-6 h-6" />,   title: "Masukkan Token",    desc: "Ketik kode akses dari QR Code ke dalam kolom token pada portal survei digital." },
  { step: "03", icon: <ClipboardList className="w-6 h-6" />, title: "Isi Formulir",      desc: "Berikan penilaian jujur terhadap 9 unsur pelayanan yang telah Anda terima." },
  { step: "04", icon: <CheckCircle2 className="w-6 h-6" />,  title: "Kirim Survei",      desc: "Tekan kirim — data Anda tersimpan aman dan langsung diproses sistem." },
];

const STATS_BAR = [
  { val: "9",   label: "Unsur Penilaian", sub: "Standar Permenpan RB" },
  { val: "IKM", label: "Indeks Kepuasan", sub: "Dihitung Otomatis"    },
  { val: "QR",  label: "Akses Mudah",     sub: "Pindai & Isi Survei"  },
];

/* ── Hooks ─────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Sub-components ─────────────────────────────── */
function CharReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="char-in inline-block"
          style={{ animationDelay: `${delay + i * 0.028}s` }}
          aria-hidden
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

function WordReveal({ text, inView, delay = 0, italic = false }: {
  text: string; inView: boolean; delay?: number; italic?: boolean;
}) {
  return (
    <span>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(22px)",
            transition: `opacity 0.6s ease ${delay + i * 0.09}s, transform 0.6s ease ${delay + i * 0.09}s`,
          }}
        >
          {italic ? <em>{word}</em> : word}{"\u00A0"}
        </span>
      ))}
    </span>
  );
}

/* ── Page ─────────────────────────────────────── */
export default function LandingClient({ surveyToken }: { surveyToken: string }) {
  const surveyHref = surveyToken ? `/enter?token=${surveyToken}` : "/enter";

  const [progress, setProgress] = useState(0);

  const features = useInView(0.08);
  const howto    = useInView(0.08);
  const cta      = useInView(0.08);

  /* scroll progress */
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fade = (inView: boolean, delay = 0, axis: "y" | "x" = "y", dist = 24) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translate(0,0)" : axis === "y" ? `translateY(${dist}px)` : `translateX(${-dist}px)`,
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} text-slate-900`}
      style={{ fontFamily: "var(--font-body, sans-serif)" }}
    >
      <style>{`
        /* ═══ Keyframes ═══ */
        @keyframes heroGrad {
          0%   { background-position: 0%   50%; }
          25%  { background-position: 100% 50%; }
          50%  { background-position: 100% 0%;  }
          75%  { background-position: 0%  100%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes charIn {
          from { opacity:0; transform:translateY(36px) rotateX(-20deg); filter:blur(5px); }
          to   { opacity:1; transform:translateY(0)    rotateX(0deg);   filter:blur(0);  }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes bounceY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(9px)} }
        @keyframes orbA     { 0%,100%{transform:translate(0,0)scale(1)} 40%{transform:translate(28px,-20px)scale(1.09)} 70%{transform:translate(-16px,26px)scale(0.92)} }
        @keyframes orbB     { 0%,100%{transform:translate(0,0)scale(1)} 35%{transform:translate(-26px,22px)scale(1.07)} 75%{transform:translate(24px,-14px)scale(0.93)} }
        @keyframes orbC     { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(18px,30px)scale(1.11)} }
        /* ═══ Hero gradient ═══ */
        .hero-grad {
          background: linear-gradient(-45deg,
            #0d2d58, #1565c0, #38bdf8, #FAE705, #38bdf8, #0d2d58, #091a33
          );
          background-size: 400% 400%;
          animation: heroGrad 18s ease infinite;
        }

        /* ═══ Typography ═══ */
        .serif { font-family: var(--font-display, Georgia, serif); }
        .char-in { animation: charIn 0.65s cubic-bezier(0.22,1,0.36,1) both; opacity: 0; }

        /* ═══ Orbs ═══ */
        .orb-a { animation: orbA 10s ease-in-out infinite; }
        .orb-b { animation: orbB 13s ease-in-out infinite; animation-delay: -5s; }
        .orb-c { animation: orbC  8s ease-in-out infinite; animation-delay: -3s; }
        .bounce { animation: bounceY 2.2s ease-in-out infinite; }

        /* ═══ Dot grid ═══ */
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 36px 36px;
        }


        /* ═══ Progress bar ═══ */
        .prog-bar {
          background: linear-gradient(90deg, #FAE705, #38bdf8, #FAE705);
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
        }

        /* ═══ Feature cards ═══ */
        .feat-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 1.25rem;
          padding: 2rem;
          transition: box-shadow .3s ease, border-color .3s ease, transform .3s ease;
        }
        .feat-card:hover {
          box-shadow: 0 8px 32px rgba(56,189,248,.14);
          border-color: rgba(56,189,248,.3);
          transform: translateY(-4px);
        }
        .feat-icon {
          width: 52px; height: 52px;
          border-radius: .7rem;
          background: #0d2d58;
          color: #FAE705;
          display: flex; align-items: center; justify-content: center;
          transition: background .3s ease, color .3s ease;
          flex-shrink: 0;
        }
        .feat-card:hover .feat-icon { background: #38bdf8; color: #0d2d58; }

        /* ═══ Steps ═══ */
        .step-num {
          font-family: var(--font-display, Georgia, serif);
          font-size: 4.5rem; font-weight: 700; line-height: 1;
          color: #f1f5f9;
          transition: color .4s ease;
        }
        .step-wrap:hover .step-num { color: rgba(56,189,248,.22); }
        .step-icon-ring {
          width: 48px; height: 48px; border-radius: 50%;
          background: #fff; border: 2px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          transition: border-color .3s ease, box-shadow .3s ease;
        }
        .step-wrap:hover .step-icon-ring {
          border-color: #38bdf8;
          box-shadow: 0 0 0 4px rgba(56,189,248,.12);
        }

        /* ═══ CTA section ═══ */
        .cta-grad {
          background: linear-gradient(-45deg, #0d2d58, #0d1b2a, #091a33, #0d2d58);
          background-size: 300% 300%;
          animation: heroGrad 14s ease infinite;
        }
        .cta-btn {
          background: #FAE705;
          color: #0d1b2a;
          font-weight: 700;
          padding: 1.1rem 2.5rem;
          border-radius: .75rem;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: background .25s ease, transform .2s ease, box-shadow .3s ease;
          display: inline-flex; align-items: center; gap: .6rem;
        }
        .cta-btn:hover {
          background: #eacc00;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(250,231,5,.25);
        }
        .cta-btn:active { transform: scale(.97); }

        /* ═══ Section label ═══ */
        .section-label { display:flex; align-items:center; gap:.75rem; }
        .section-label-line { width:1.5rem; height:1px; background:#FAE705; display:block; }

        /* ═══ HR ═══ */
        .hr-tri { height:1px; background:linear-gradient(90deg,transparent,#FAE705 30%,#38bdf8 70%,transparent); }
      `}</style>

      {/* ── Scroll progress ── */}
      <div
        className="fixed top-0 left-0 z-50 h-[3px] prog-bar transition-all duration-75"
        style={{ width: `${progress}%` }}
      />

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="hero-grad relative min-h-screen flex items-center overflow-hidden px-6">

        {/* Orbs */}
        <div className="orb-a pointer-events-none absolute top-[15%] right-[8%]  w-[460px] h-[460px] rounded-full blur-[130px]" style={{ background: "rgba(250,231,5,0.18)" }} />
        <div className="orb-b pointer-events-none absolute bottom-[20%] left-[4%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: "rgba(56,189,248,0.18)" }} />
        <div className="orb-c pointer-events-none absolute top-[50%] left-[40%]  w-[300px] h-[300px] rounded-full blur-[90px]"  style={{ background: "rgba(13,45,88,0.40)"   }} />

        {/* Dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0" />

        {/* Dark overlay */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(6,18,32,0.60)" }} />

        {/* Watermark */}
        <div className="serif pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
          <span className="text-[20vw] font-bold tracking-widest whitespace-nowrap" style={{ color: "rgba(255,255,255,0.022)" }}>
            SKM
          </span>
        </div>

        {/* ── Content — centered single column ── */}
        <div className="relative z-10 max-w-3xl mx-auto w-full py-28 flex flex-col items-center text-center">

          {/* Overline */}
          <div className="char-in section-label justify-center mb-8" style={{ animationDelay: "0.1s" }}>
            <span className="section-label-line" />
            <span className="text-[10px] font-semibold tracking-[0.38em] uppercase" style={{ color: "#FAE705" }}>
              BKPSDM Kab. Kepulauan Anambas
            </span>
            <span className="section-label-line" />
          </div>

          {/* Heading */}
          <h1 className="serif mb-6 leading-[1.08]">
            <span className="block text-4xl sm:text-5xl md:text-[3.6rem] font-bold text-white">
              <CharReveal text="Survei Kepuasan" delay={0.3} />
            </span>
            <span className="block font-normal italic" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "rgba(255,255,255,0.72)" }}>
              <CharReveal text="Masyarakat" delay={0.9} />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="char-in text-white/55 text-sm sm:text-base max-w-lg leading-relaxed mb-10"
            style={{ animationDelay: "1.7s" }}
          >
            Platform digital pengukuran kinerja pelayanan publik BKPSDM Kabupaten
            Kepulauan Anambas. Transparan, akuntabel, dan terukur.
          </p>

          {/* Buttons */}
          <div className="char-in flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: "1.9s" }}>
            <Link
              href={surveyHref}
              className="cta-btn text-center justify-center"
            >
              Mulai Survei
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm text-white/80 border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-300"
              style={{ backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.06)" }}
            >
              Masuk Dashboard
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <span className="text-[9px] tracking-[0.32em] uppercase">Gulir</span>
          <div className="bounce"><ChevronDown className="w-4 h-4" /></div>
        </div>

        {/* Bottom gradient bleed */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#f8f7f3]" />
      </section>

      {/* ════════════════════════════════════
          STATS BAR
      ════════════════════════════════════ */}
      <section style={{ background: "#0d1b2a", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3">
          {STATS_BAR.map((item, i) => (
            <div
              key={item.label}
              className="px-8 py-4 first:pl-0 last:pr-0"
              style={{
                borderRight: i < STATS_BAR.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <p className="serif text-4xl md:text-5xl font-bold" style={{ color: "#FAE705" }}>{item.val}</p>
              <p className="text-sm font-semibold text-white mt-2 tracking-wide">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURES
      ════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#f8f7f3" }}>
        <div ref={features.ref} className="max-w-5xl mx-auto">

          {/* Label */}
          <div className="section-label mb-4" style={fade(features.inView, 0)}>
            <span className="section-label-line" />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>
              Fitur Sistem
            </span>
          </div>

          {/* Heading */}
          <div className="mb-4">
            <h2 className="serif text-3xl md:text-4xl font-bold text-slate-900">
              <WordReveal text="Fitur Utama SKM" inView={features.inView} delay={0.05} />
            </h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-14" style={fade(features.inView, 0.3)}>
            Meningkatkan kualitas pelayanan publik melalui evaluasi yang komprehensif dan transparan.
          </p>

          <div className="hr-tri mb-14" />

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feat-card" style={fade(features.inView, 0.15 + i * 0.1)}>
                <div className="feat-icon mb-6">{f.icon}</div>
                <h3 className="serif text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW TO
      ════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white" style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div ref={howto.ref} className="max-w-5xl mx-auto">

          {/* Label */}
          <div className="section-label mb-4" style={fade(howto.inView, 0)}>
            <span className="section-label-line" />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>
              Panduan
            </span>
          </div>

          {/* Heading */}
          <h2 className="serif text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            <WordReveal text="Cara Pengisian Survei" inView={howto.inView} delay={0.05} />
          </h2>
          <div className="w-14 h-[3px] rounded-full mb-14" style={{ background: "#FAE705", ...fade(howto.inView, 0.3) }} />

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {STEPS.map((item, i) => (
              <div key={item.step} className="step-wrap relative" style={fade(howto.inView, 0.1 + i * 0.1)}>
                {/* Ghost step number */}
                <div className="step-num absolute -top-3 -left-1 z-0 select-none" aria-hidden>
                  {item.step}
                </div>
                {/* Content */}
                <div className="relative z-10 pt-8">
                  <div className="step-icon-ring mb-5" style={{ color: "#334155" }}>
                    {item.icon}
                  </div>
                  <h3 className="serif font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
                {/* Connector line (not on last) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-12 right-0 translate-x-1/2 w-full h-px"
                    style={{ background: "linear-gradient(90deg,#e2e8f0,transparent)" }}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA
      ════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#f8f7f3" }}>
        <div ref={cta.ref} className="max-w-5xl mx-auto">
          <div className="cta-grad relative overflow-hidden rounded-3xl shadow-2xl">

            {/* Orb inside CTA */}
            <div
              className="orb-a pointer-events-none absolute right-[-6%] top-[-30%] w-80 h-80 rounded-full blur-[90px]"
              style={{ background: "rgba(250,231,5,0.22)" }}
            />
            <div
              className="orb-b pointer-events-none absolute left-[-4%] bottom-[-20%] w-64 h-64 rounded-full blur-[80px]"
              style={{ background: "rgba(56,189,248,0.18)" }}
            />
            <div className="dot-grid pointer-events-none absolute inset-0" style={{ opacity: 0.5 }} />

            <div className="relative z-10 px-10 py-20 flex flex-col items-center text-center gap-8">
              {/* Overline */}
              <div className="section-label justify-center" style={fade(cta.inView, 0)}>
                <span className="section-label-line" />
                <span className="text-[10px] font-semibold tracking-[0.38em] uppercase" style={{ color: "#FAE705" }}>
                  Sampaikan Pendapat Anda
                </span>
                <span className="section-label-line" />
              </div>

              {/* Heading */}
              <h2 className="serif text-3xl md:text-4xl font-bold text-white max-w-xl leading-tight" style={fade(cta.inView, 0.1)}>
                Bantu Kami Meningkatkan Kualitas Layanan
              </h2>
              <p className="text-white/50 text-sm max-w-md leading-relaxed" style={fade(cta.inView, 0.2)}>
                Survei ini bersifat rahasia. Setiap respons Anda membantu BKPSDM memberikan pelayanan yang lebih baik bagi masyarakat Kepulauan Anambas.
              </p>

              {/* Button */}
              <div style={fade(cta.inView, 0.3)}>
                <Link href={surveyHref} className="cta-btn">
                  Isi Survei Sekarang
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
