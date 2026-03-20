"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { BarChart3, ShieldCheck, QrCode, ChevronDown } from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";

/* ── Fonts ─────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-display",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

/* ── Static data ────────────────────────────────── */
const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-time IKM",
    desc: "Perhitungan Indeks Kepuasan Masyarakat secara otomatis dan akurat berdasarkan setiap respons yang masuk.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Sesuai Regulasi",
    desc: "Menggunakan 9 unsur pelayanan standar Kementerian PANRB sesuai Permenpan-RB Nomor 14 Tahun 2017.",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "Akses QR Code",
    desc: "Kemudahan akses survei bagi responden melalui pemindaian QR Code yang tersedia di loket pelayanan.",
  },
];


const STATS_BAR = [
  { id: "unsur" as const, val: "9",   label: "Unsur Penilaian", sub: "Standar Permenpan-RB" },
  { id: "ikm"   as const, val: "IKM", label: "Indeks Kepuasan", sub: "Dihitung Otomatis"    },
  { id: "qr"    as const, val: "QR",  label: "Akses Mudah",     sub: "Pindai dan Isi Survei" },
];

/** 9 SKM elements — Permenpan-RB No. 14 Tahun 2017 */
const UNSUR_SKM = [
  { num: "U1", nama: "Persyaratan",          desc: "Kesesuaian persyaratan dengan jenis pelayanan" },
  { num: "U2", nama: "Prosedur",             desc: "Kemudahan alur dan tahapan pelayanan" },
  { num: "U3", nama: "Waktu Pelayanan",      desc: "Ketepatan waktu penyelesaian pelayanan" },
  { num: "U4", nama: "Biaya / Tarif",        desc: "Kewajaran dan kejelasan biaya pelayanan" },
  { num: "U5", nama: "Produk Layanan",       desc: "Kesesuaian hasil layanan dengan ketentuan" },
  { num: "U6", nama: "Kompetensi",           desc: "Kemampuan petugas dalam memberikan layanan" },
  { num: "U7", nama: "Perilaku Pelaksana",   desc: "Kesopanan dan keramahan petugas" },
  { num: "U8", nama: "Sarana dan Prasarana", desc: "Kondisi dan ketersediaan fasilitas layanan" },
  { num: "U9", nama: "Penanganan Pengaduan", desc: "Pengelolaan saran, masukan, dan pengaduan" },
];

/* ── Helpers ────────────────────────────────────── */
function ikmCategory(ikm: number): string {
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65.00) return "Kurang Baik";
  return "Tidak Baik";
}

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

function WordReveal({ text, inView, delay = 0 }: {
  text: string; inView: boolean; delay?: number;
}) {
  return (
    <span>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity:   inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(22px)",
            transition: `opacity 0.6s ease ${delay + i * 0.09}s, transform 0.6s ease ${delay + i * 0.09}s`,
          }}
        >
          {word}{"\u00A0"}
        </span>
      ))}
    </span>
  );
}

/* ── IKM types ──────────────────────────────────── */
interface IkmService { nama: string; ikm: number; count: number; category: string; }

/* ── Page ─────────────────────────────────────── */
export default function LandingClient({ surveyToken }: { surveyToken: string }) {
  const surveyHref = surveyToken ? `/enter?token=${surveyToken}` : "/enter";

  /* Scroll progress */
  const [progress, setProgress] = useState(0);

  /* Intersection hooks */
  const features = useInView(0.08);
const stats    = useInView(0.15);

  /* ── Stats bar state ── */
  const [activePanel, setActivePanel] = useState<"unsur" | "ikm" | "qr">("unsur");

  /* IKM panel */
  const [ikmServices,  setIkmServices]  = useState<IkmService[]>([]);
  const [ikmOverall,   setIkmOverall]   = useState(0);
  const [ikmCat,       setIkmCat]       = useState("");
  const [ikmActive,    setIkmActive]    = useState(false);
  const [ikmLoading,   setIkmLoading]   = useState(false);
  const [ikmFetched,   setIkmFetched]   = useState(false);
  const [barsMounted,  setBarsMounted]  = useState(false);

  /* QR panel */
  const [qrDataUrl,  setQrDataUrl]  = useState<string | null>(null);
  const [surveyUrl,  setSurveyUrl]  = useState("");

  useEffect(() => {
    if (surveyToken) setSurveyUrl(`${window.location.origin}/enter?token=${surveyToken}`);
  }, [surveyToken]);

  /* Scroll progress listener */
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Fetch IKM when panel first opens */
  useEffect(() => {
    if (activePanel !== "ikm" || ikmFetched) return;
    setIkmLoading(true);
    setIkmFetched(true);
    fetch("/api/public/ikm")
      .then(r => r.json())
      .then((data: { active: boolean; overall: number; category: string; services: IkmService[] }) => {
        setIkmActive(data.active);
        setIkmOverall(data.overall);
        setIkmCat(data.category ?? "");
        setIkmServices(data.services ?? []);
        setIkmLoading(false);
      })
      .catch(() => setIkmLoading(false));
  }, [activePanel, ikmFetched]);

  /* Animate bars after IKM data loaded */
  useEffect(() => {
    if (activePanel === "ikm" && !ikmLoading && ikmServices.length > 0) {
      const t = setTimeout(() => setBarsMounted(true), 80);
      return () => clearTimeout(t);
    }
    setBarsMounted(false);
  }, [activePanel, ikmLoading, ikmServices]);

  /* Generate QR with BKPSDM logo overlay when panel first opens */
  useEffect(() => {
    if (activePanel !== "qr" || qrDataUrl || !surveyToken) return;
    import("qrcode").then(({ default: QRCode }) => {
      const size = 320;
      const canvas = document.createElement("canvas");
      QRCode.toCanvas(canvas, `${window.location.origin}/enter?token=${surveyToken}`, {
        width: size, margin: 2, errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      }).then(() => {
        const ctx = canvas.getContext("2d");
        if (!ctx) { setQrDataUrl(canvas.toDataURL()); return; }
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = () => {
          const logoSize = size * 0.22;
          const cx = size / 2, cy = size / 2;
          /* White circle background so QR modules don't show through */
          ctx.beginPath();
          ctx.arc(cx, cy, logoSize * 0.62, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.drawImage(logo, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
          setQrDataUrl(canvas.toDataURL());
        };
        logo.onerror = () => setQrDataUrl(canvas.toDataURL());
        logo.src = "/logo-bkpsdm.png";
      });
    });
  }, [activePanel, surveyToken, qrDataUrl]);

  /* Select panel — clicking a different item switches; clicking same keeps it */
  function togglePanel(id: "unsur" | "ikm" | "qr") {
    setActivePanel(id);
  }

  const fade = (inView: boolean, delay = 0, axis: "y" | "x" = "y", dist = 24) => ({
    opacity:   inView ? 1 : 0,
    transform: inView ? "translate(0,0)" : axis === "y" ? `translateY(${dist}px)` : `translateX(${-dist}px)`,
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  /* Gold gradient text style — reused for all stat values */
  const goldGradText: React.CSSProperties = {
    background:              "linear-gradient(135deg, #FAE705 0%, #f59e0b 55%, #FAE705 100%)",
    WebkitBackgroundClip:    "text",
    WebkitTextFillColor:     "transparent",
    backgroundClip:          "text",
  };

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
        @keyframes panelSwitch {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes charIn {
          from { opacity:0; transform:translateY(36px) rotateX(-20deg); filter:blur(5px); }
          to   { opacity:1; transform:translateY(0)    rotateX(0deg);   filter:blur(0);  }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes panelFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
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

        /* ═══ Stat left-column button ═══ */
        .stat-btn.active {
          border-left: 3px solid #FAE705 !important;
          background: rgba(255,255,255,0.06) !important;
        }
        .stat-btn:not(.active) { border-left: 3px solid transparent; }

        /* ═══ Panel switch animation ═══ */
        .panel-switch { animation: panelSwitch 0.35s cubic-bezier(0.22,1,0.36,1) both; }

        /* ═══ Typography ═══ */
        .serif { font-family: var(--font-display, Georgia, serif); }
        .char-in { animation: charIn 0.65s cubic-bezier(0.22,1,0.36,1) both; opacity: 0; }

        /* ═══ Stat buttons ═══ */
        .stat-btn {
          text-align: left;
          cursor: pointer;
          border: none;
          background: transparent;
          transition: background 0.25s ease;
          padding: 2rem 2rem;
          width: 100%;
        }
        .stat-btn:hover   { background: rgba(255,255,255,0.04); }
        .stat-btn:focus   { outline: none; }
        .stat-btn.active  { background: rgba(255,255,255,0.06); }

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

        /* ═══ Panel animation ═══ */
        .panel-content { animation: panelFadeIn 0.35s ease both; }
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

        {/* Content */}
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
            <span className="block font-bold text-white" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
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
            <Link href={surveyHref} className="cta-btn text-center justify-center">
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

        {/* Bottom gradient bleed → blends into stats section */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#0d1b2a]" />
      </section>

      {/* ════════════════════════════════════
          STATS — full page, 2-column, dark navy
      ════════════════════════════════════ */}
      <section
        ref={stats.ref}
        style={{
          background:  "#0d1b2a",
          minHeight:   "100vh",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
        className="flex items-center"
      >
        <div className="w-full max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-0">

          {/* ── LEFT COLUMN — three stat buttons ── */}
          <div
            className="md:w-[38%] flex flex-col border-b md:border-b-0 md:border-r pb-8 md:pb-0 md:pr-12"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {/* Section overline — animates in from left */}
            <div
              style={{
                opacity:    stats.inView ? 1 : 0,
                transform:  stats.inView ? "translateX(0)" : "translateX(-30px)",
                transition: "opacity 0.6s ease 0.05s, transform 0.6s ease 0.05s",
                marginBottom: "2rem",
              }}
            >
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase"
                 style={{ color: "#FAE705" }}>
                Tentang Sistem
              </p>
            </div>

            {STATS_BAR.map((item, i) => (
              <button
                key={item.id}
                onClick={() => togglePanel(item.id)}
                className={`stat-btn${activePanel === item.id ? " active" : ""}`}
                style={{
                  /* Slide in from left, staggered */
                  opacity:    stats.inView ? 1 : 0,
                  transform:  stats.inView ? "translateX(0)" : "translateX(-40px)",
                  transition: `opacity 0.65s ease ${0.1 + i * 0.13}s, transform 0.65s ease ${0.1 + i * 0.13}s, background 0.25s ease`,
                  borderBottom: i < STATS_BAR.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  paddingLeft:  "1.25rem",
                  paddingTop:   "1.4rem",
                  paddingBottom: "1.4rem",
                  paddingRight: "1rem",
                }}
              >
                {/* Value */}
                <p className="serif text-5xl md:text-6xl font-bold leading-none" style={goldGradText}>
                  {item.val}
                </p>
                {/* Label */}
                <p className="text-sm font-semibold text-white mt-2 tracking-wide">
                  {item.label}
                </p>
                {/* Sub */}
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {item.sub}
                </p>
                {/* Active arrow */}
                <p
                  className="text-[9px] mt-2 tracking-widest"
                  style={{
                    color:      activePanel === item.id ? "#FAE705" : "rgba(255,255,255,0.22)",
                    transition: "color 0.25s ease",
                  }}
                >
                  {activePanel === item.id ? "▶" : "·"}
                </p>
              </button>
            ))}
          </div>

          {/* ── RIGHT COLUMN — text content only ── */}
          <div
            className="md:w-[62%] md:pl-12 pt-8 md:pt-0 flex flex-col justify-center"
            style={{
              opacity:    stats.inView ? 1 : 0,
              transform:  stats.inView ? "translateX(0)" : "translateX(30px)",
              transition: "opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s",
            }}
          >
            {/* Content keyed to activePanel so CSS animation re-triggers on switch */}
            <div key={activePanel} className="panel-switch">

              {/* ── 9 UNSUR ── */}
              {activePanel === "unsur" && (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2"
                     style={{ color: "#FAE705" }}>
                    Permenpan-RB No. 14 Tahun 2017
                  </p>
                  <h3 className="serif text-2xl font-bold text-white mb-6">
                    9 Unsur Survei Kepuasan Masyarakat
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {UNSUR_SKM.map((u) => (
                      <div key={u.num} className="flex gap-3 items-start">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded shrink-0 mt-0.5"
                          style={{
                            border:     "1px solid rgba(250,231,5,0.4)",
                            color:      "#FAE705",
                            background: "rgba(250,231,5,0.07)",
                          }}
                        >
                          {u.num}
                        </span>
                        <div>
                          <p className="text-base font-semibold text-white leading-tight">{u.nama}</p>
                          <p className="text-sm mt-1 leading-relaxed"
                             style={{ color: "rgba(255,255,255,0.52)" }}>
                            {u.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── IKM ── */}
              {activePanel === "ikm" && (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2"
                     style={{ color: "#FAE705" }}>
                    Skor Periode Aktif
                  </p>
                  <h3 className="serif text-2xl font-bold text-white mb-6">
                    Indeks Kepuasan Masyarakat
                  </h3>

                  {ikmLoading ? (
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Memuat data IKM…
                    </p>
                  ) : !ikmActive ? (
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Belum ada survei aktif. Skor IKM akan ditampilkan setelah periode survei dibuka oleh administrator.
                    </p>
                  ) : (
                    <>
                      {/* Overall score */}
                      <div className="flex flex-wrap items-baseline gap-3 mb-8">
                        <span className="serif text-6xl font-bold" style={goldGradText}>
                          {ikmOverall}
                        </span>
                        <div>
                          <p className="text-white/60 text-sm">IKM Keseluruhan</p>
                          <span
                            className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: "rgba(250,231,5,0.15)", color: "#FAE705" }}
                          >
                            {ikmCat}
                          </span>
                        </div>
                      </div>

                      {/* Top 5 layanan */}
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-4"
                           style={{ color: "rgba(255,255,255,0.38)" }}>
                          Layanan Unggulan
                        </p>
                        <div className="space-y-4">
                          {ikmServices.map((s, idx) => (
                            <div key={s.nama}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-white/80 flex items-center gap-2">
                                  <span className="text-base leading-none shrink-0">
                                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉"
                                      : <span className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                                              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>#{idx + 1}</span>}
                                  </span>
                                  {s.nama}
                                </span>
                                <span className="serif text-sm font-bold shrink-0 ml-2" style={goldGradText}>
                                  {s.ikm}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden"
                                   style={{ background: "rgba(255,255,255,0.08)" }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    background: "linear-gradient(90deg, #FAE705, #f59e0b)",
                                    width:      barsMounted ? `${(s.ikm / 100) * 100}%` : "0%",
                                    transition: `width 0.7s ease ${idx * 0.12}s`,
                                  }}
                                />
                              </div>
                              <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                                {s.count} responden · {s.category}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── QR ── */}
              {activePanel === "qr" && (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2"
                     style={{ color: "#FAE705" }}>
                    Akses Survei
                  </p>
                  <h3 className="serif text-2xl font-bold text-white mb-6">
                    QR Code Periode Aktif
                  </h3>

                  {!surveyToken ? (
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Tidak ada survei aktif saat ini. QR Code akan tersedia saat periode survei dibuka oleh administrator.
                    </p>
                  ) : !qrDataUrl ? (
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Memuat QR Code…
                    </p>
                  ) : (
                    <div className="flex flex-col items-center gap-5">
                      {/* QR — large, logo embedded in center via canvas */}
                      <div
                        className="p-4 rounded-2xl shadow-2xl"
                        style={{ background: "#ffffff" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrDataUrl} alt="QR Code Survei SKM"
                             className="w-60 h-60 sm:w-72 sm:h-72" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-base">Pindai untuk mulai survei</p>
                        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                          Arahkan kamera ponsel Anda ke kode di atas
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURES
      ════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#f8f7f3" }}>
        <div ref={features.ref} className="max-w-5xl mx-auto">

          <div className="section-label mb-4" style={fade(features.inView, 0)}>
            <span className="section-label-line" />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>
              Fitur Sistem
            </span>
          </div>

          <div className="mb-4">
            <h2 className="serif text-3xl md:text-4xl font-bold text-slate-900">
              <WordReveal text="Fitur Utama SKM" inView={features.inView} delay={0.05} />
            </h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-14" style={fade(features.inView, 0.3)}>
            Meningkatkan kualitas pelayanan publik melalui evaluasi yang komprehensif dan transparan.
          </p>

          <div className="hr-tri mb-14" />

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

    </div>
  );
}
