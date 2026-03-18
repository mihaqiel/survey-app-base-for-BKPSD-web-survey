"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, ChevronDown } from "lucide-react";
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
const GALLERY = [
  { src: "/foto-1.jpg", alt: "Hari Raya Bersama BKPSDM",  tag: "Budaya",      label: "Hari Raya Bersama", desc: "Kebersamaan jajaran BKPSDM dalam balutan busana adat Melayu Kepulauan Anambas" },
  { src: "/foto-2.jpg", alt: "Kegiatan Lapangan BKPSDM",  tag: "Pengabdian",  label: "Gotong Royong",     desc: "Aksi nyata BKPSDM membangun lingkungan masyarakat sekitar bersama" },
  { src: "/foto-3.jpg", alt: "Kebersamaan Tim BKPSDM",    tag: "Kebersamaan", label: "Keakraban Tim",     desc: "Momen keakraban yang mempererat hubungan antar ASN BKPSDM" },
  { src: "/foto-4.jpg", alt: "Pelatihan ASN BKPSDM",      tag: "Kompetensi",  label: "Pelatihan ASN",     desc: "Pengembangan kompetensi aparatur sipil negara secara berkala" },
];

const STATS = [
  { value: "2008", label: "Tahun Berdiri",  sub: "Bersama Kab. Anambas"     },
  { value: "9",    label: "Unsur SKM",      sub: "Standar Permenpan RB"     },
  { value: "5",    label: "Unit Layanan",   sub: "Kepegawaian & SDM"        },
  { value: "100",  label: "% Digital",      sub: "Layanan berbasis digital" },
];

const PILLARS = [
  { num: "01", title: "Visi",  body: "Terwujudnya aparatur sipil negara yang profesional, kompeten, dan berintegritas di Kabupaten Kepulauan Anambas." },
  { num: "02", title: "Misi",  body: "Meningkatkan kualitas sumber daya manusia ASN melalui pendidikan, pelatihan, dan pengembangan kompetensi yang berkelanjutan." },
  { num: "03", title: "Nilai", body: "Integritas · Profesionalisme · Akuntabilitas · Inovasi · Pelayanan Prima sebagai landasan kerja seluruh jajaran BKPSDM." },
];

const LEGAL = [
  { code: "Permenpan RB",        num: "No. 14 / 2017", desc: "Pedoman Penyusunan Survei Kepuasan Masyarakat — mengatur 9 unsur penilaian standar nasional pelayanan publik." },
  { code: "Undang-Undang",       num: "No. 25 / 2009", desc: "UU Pelayanan Publik — mewajibkan evaluasi kinerja pelayanan secara berkala oleh setiap penyelenggara." },
  { code: "Peraturan Pemerintah",num: "No. 96 / 2012", desc: "Pelaksanaan UU Pelayanan Publik — termasuk kewajiban pengukuran indeks kepuasan masyarakat secara periodik." },
  { code: "Undang-Undang",       num: "No. 5 / 2014",  desc: "Aparatur Sipil Negara — landasan profesionalisme, kompetensi, dan pengembangan SDM ASN Kab. Kepulauan Anambas." },
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

function useCountUp(target: string, duration = 1800) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const num = parseInt(target);
      const suffix = target.replace(/[0-9]/g, "");
      if (isNaN(num)) { setDisplay(target); return; }
      const fps = 60;
      const total = Math.round((duration / 1000) * fps);
      let frame = 0;
      const tick = () => {
        frame++;
        const t = Math.min(frame / total, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(frame >= total ? target : Math.floor(eased * num) + suffix);
        if (frame < total) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { ref, display };
}

/* ── Sub-components ─────────────────────────────── */
function CharReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} className="char-in inline-block" style={{ animationDelay: `${delay + i * 0.028}s` }} aria-hidden>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

function WordReveal({ text, inView, delay = 0, italic = false, className }: {
  text: string; inView: boolean; delay?: number; italic?: boolean; className?: string;
}) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(22px)",
            transition: `opacity 0.6s ease ${delay + i * 0.09}s, transform 0.6s ease ${delay + i * 0.09}s`,
          }}>
          {italic ? <em>{word}</em> : word}{"\u00A0"}
        </span>
      ))}
    </span>
  );
}

function StatItem({ value, label, sub }: { value: string; label: string; sub: string }) {
  const { ref, display } = useCountUp(value);
  return (
    <div ref={ref} className="px-6 md:px-8 py-6 text-center">
      <p className="serif gold-text text-5xl md:text-6xl font-bold leading-none min-h-[1.2em]">{display}</p>
      <p className="text-xs font-semibold text-slate-800 mt-3 tracking-wide">{label}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

/* ── Page ─────────────────────────────────────── */
export default function TentangPage() {
  const [progress, setProgress] = useState(0);
  const gallery = useInView(0.08);
  const pillars = useInView(0.08);
  const legal   = useInView(0.08);
  const skm     = useInView(0.08);

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
    <div className={`${playfair.variable} ${dmSans.variable} text-slate-900`}
      style={{ fontFamily: "var(--font-body, sans-serif)" }}>

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
          to   { opacity:1; transform:translateY(0)    rotateX(0deg);   filter:blur(0);   }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes bounceY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(9px)} }
        @keyframes orbA     { 0%,100%{transform:translate(0,0)scale(1)} 40%{transform:translate(28px,-20px)scale(1.09)} 70%{transform:translate(-16px,26px)scale(0.92)} }
        @keyframes orbB     { 0%,100%{transform:translate(0,0)scale(1)} 35%{transform:translate(-26px,22px)scale(1.07)} 75%{transform:translate(24px,-14px)scale(0.93)} }
        @keyframes orbC     { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(18px,30px)scale(1.11)} }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0   rgba(56,189,248,0.35); }
          70%  { box-shadow: 0 0 0 8px rgba(56,189,248,0);    }
          100% { box-shadow: 0 0 0 0   rgba(56,189,248,0);    }
        }
        @keyframes lineExpand { from { transform:scaleY(0); } to { transform:scaleY(1); } }

        /* ═══ Hero gradient — yellow + light-blue + dark-blue ═══ */
        .hero-grad {
          background: linear-gradient(-45deg,
            #0d2d58,
            #1565c0,
            #38bdf8,
            #FAE705,
            #38bdf8,
            #0d2d58,
            #091a33
          );
          background-size: 400% 400%;
          animation: heroGrad 18s ease infinite;
        }

        /* ═══ Typography ═══ */
        .serif { font-family: var(--font-display, Georgia, serif); }
        .char-in { animation: charIn 0.65s cubic-bezier(0.22,1,0.36,1) both; opacity: 0; }
        .gold-text {
          background: linear-gradient(110deg, #916e00 0%, #FAE705 35%, #e8c87a 60%, #916e00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }

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

        /* ═══ Photo cards ═══ */
        .photo-card { overflow:hidden; border-radius:1rem; position:relative; }
        .photo-img-wrap { position:absolute; inset:0; transition:transform 0.75s cubic-bezier(.25,.1,.25,1); }
        .photo-card:hover .photo-img-wrap { transform:scale(1.07); }
        .photo-overlay {
          position:absolute; inset:0;
          background: linear-gradient(to top, rgba(9,26,51,.93) 0%, rgba(9,26,51,.45) 55%, transparent 100%);
          opacity:0; transition:opacity 0.4s ease;
        }
        .photo-card:hover .photo-overlay { opacity:1; }
        .photo-caption { transform:translateY(16px); transition:transform 0.45s ease; }
        .photo-card:hover .photo-caption { transform:translateY(0); }

        /* ═══ SKM tiles ═══ */
        .skm-tile {
          display:flex; align-items:center; gap:1.25rem;
          background:#fff; border:1px solid #f1f5f9; border-radius:.875rem;
          padding:1rem 1.25rem; box-shadow:0 1px 3px rgba(0,0,0,.06);
          transition: box-shadow .3s ease, border-color .3s ease, transform .3s ease;
        }
        .skm-tile:hover { box-shadow:0 4px 20px rgba(56,189,248,.18); border-color:rgba(56,189,248,.35); transform:translateX(6px); }
        .skm-icon { width:52px; height:52px; border-radius:.7rem; background:#0d2d58; display:flex; align-items:center; justify-content:center; font-family:var(--font-display,Georgia,serif); color:#FAE705; font-size:1.1rem; font-weight:700; flex-shrink:0; transition:background .3s ease, color .3s ease; }
        .skm-tile:hover .skm-icon { background:#38bdf8; color:#0d2d58; }

        /* ═══ Pillar cards ═══ */
        .pillar-card { border-top:1px solid rgba(255,255,255,.1); padding-top:2rem; transition:border-color .4s ease; }
        .pillar-card:hover { border-color:rgba(250,231,5,.45); }

        /* ═══ Legal rows ═══ */
        .legal-row { border-bottom:1px solid #e5e7eb; padding:1.75rem 0; transition:background .3s ease; border-radius:.5rem; }
        .legal-row:hover { background:rgba(56,189,248,.035); }
        .legal-num { font-family:var(--font-display,Georgia,serif); font-size:3.5rem; font-weight:700; line-height:1; color:#f1f5f9; transition:color .4s ease; }
        .legal-row:hover .legal-num { color:rgba(56,189,248,.22); }

        /* ═══ Contact ═══ */
        .contact-item { border-top:1px solid rgba(255,255,255,.1); padding-top:1.75rem; }
        .contact-link { color:rgba(255,255,255,.6); font-size:.875rem; transition:color .2s ease; position:relative; display:inline-block; }
        .contact-link::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1px; background:linear-gradient(90deg,#FAE705,#38bdf8); transition:width .35s ease; }
        .contact-link:hover { color:#fff; }
        .contact-link:hover::after { width:100%; }
        .contact-badge { width:2.25rem; height:2.25rem; border-radius:50%; background:rgba(250,231,5,.1); border:1px solid rgba(250,231,5,.3); display:flex; align-items:center; justify-content:center; animation:pulseRing 2.8s ease-in-out infinite; transition:background .3s ease, border-color .3s ease; }
        .contact-item:hover .contact-badge { background:rgba(56,189,248,.15); border-color:rgba(56,189,248,.4); }

        /* ═══ Progress bar ═══ */
        .prog-bar { background:linear-gradient(90deg,#FAE705,#38bdf8,#FAE705); background-size:200% auto; animation:shimmer 2.5s linear infinite; }

        /* ═══ HR ═══ */
        .hr-tri { height:1px; background:linear-gradient(90deg,transparent,#FAE705 30%,#38bdf8 70%,transparent); }

        /* ═══ Accent line ═══ */
        .accent-line { transform-origin:top; animation:lineExpand 1.2s ease .3s both; }
      `}</style>

      {/* ── Scroll progress ── */}
      <div className="fixed top-0 left-0 z-50 h-[3px] prog-bar transition-all duration-75" style={{ width: `${progress}%` }} />

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="hero-grad relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pb-16">
        {/* Floating orbs — brand colours */}
        <div className="orb-a pointer-events-none absolute top-[18%] left-[6%]   w-[440px] h-[440px] rounded-full blur-[130px]" style={{ background: "rgba(250,231,5,0.20)"  }} />
        <div className="orb-b pointer-events-none absolute bottom-[18%] right-[6%] w-[380px] h-[380px] rounded-full blur-[120px]" style={{ background: "rgba(56,189,248,0.20)"  }} />
        <div className="orb-c pointer-events-none absolute top-[55%] left-[38%]   w-[320px] h-[320px] rounded-full blur-[90px]"  style={{ background: "rgba(13,45,88,0.45)"   }} />

        {/* Dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0" />

        {/* Dark overlay — keeps text readable over the bright yellow gradient */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(6,18,32,0.62)" }} />

        {/* Watermark */}
        <div className="serif pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
          <span className="text-[15vw] font-bold tracking-widest whitespace-nowrap" style={{ color: "rgba(255,255,255,0.025)" }}>
            BKPSDM
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl w-full text-center" style={{ perspective: "700px" }}>
          {/* Overline */}
          <div className="char-in inline-flex items-center gap-3 mb-8" style={{ animationDelay: "0.1s" }}>
            <span className="block w-8 h-px" style={{ background: "#FAE705" }} />
            <span className="text-[10px] font-semibold tracking-[0.38em] uppercase" style={{ color: "#FAE705" }}>Tentang Kami</span>
            <span className="block w-8 h-px" style={{ background: "#FAE705" }} />
          </div>

          {/* Heading — character-by-character */}
          <h1 className="serif mb-5 leading-[1.1]">
            <span className="block text-4xl sm:text-5xl md:text-[3.8rem] font-bold text-white">
              <CharReveal text="Badan Kepegawaian dan" delay={0.3} />
            </span>
            <span className="block text-4xl sm:text-5xl md:text-[3.8rem] font-normal italic" style={{ color: "rgba(255,255,255,0.7)" }}>
              <CharReveal text="Pengembangan Sumber Daya Manusia" delay={0.85} />
            </span>
          </h1>

          {/* Region */}
          <p className="char-in text-[10px] sm:text-xs tracking-[0.28em] uppercase mb-10"
            style={{ color: "rgba(255,255,255,0.4)", animationDelay: "1.55s" }}>
            Kabupaten Kepulauan Anambas
          </p>

          {/* Body */}
          <p className="char-in text-white/55 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: "1.75s" }}>
            Berkomitmen memberikan pelayanan yang profesional, transparan, akuntabel dalam melayani
            masyarakat Kabupaten Kepulauan Anambas.
          </p>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          <span className="text-[9px] tracking-[0.32em] uppercase">Gulir</span>
          <div className="bounce"><ChevronDown className="w-4 h-4" /></div>
        </div>

        {/* Bottom gradient bleed */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#f8f7f3]" />
      </section>

      {/* ════════════════════════════════════
          GALLERY
      ════════════════════════════════════ */}
      <section className="bg-[#f8f7f3] py-24 px-6">
        <div ref={gallery.ref} className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5" style={fade(gallery.inView, 0)}>
                <span className="w-6 h-px block" style={{ background: "#FAE705" }} />
                <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>Galeri Kegiatan</span>
              </div>
              <h2 className="serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                <WordReveal text="Bersatu, Bergerak," inView={gallery.inView} delay={0.1} />
                <br />
                <WordReveal text="Bertumbuh." inView={gallery.inView} delay={0.55} italic />
              </h2>
            </div>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed" style={fade(gallery.inView, 0.4)}>
              Dokumentasi kegiatan dan kebersamaan jajaran BKPSDM dalam melayani dan mengabdi.
            </p>
          </div>

          {/* Desktop: asymmetric 3-col grid — photos kept LARGE (320px rows) */}
          <div className="hidden md:grid gap-3"
            style={{ gridTemplateColumns: "1.3fr 1fr 1.3fr", gridTemplateRows: "320px 320px" }}>

            {/* Photo 1 — tall left */}
            <div className="photo-card" style={{ gridRow: "1 / 3", ...fade(gallery.inView, 0.15) }}>
              <div className="photo-img-wrap">
                <Image src={GALLERY[0].src} alt={GALLERY[0].alt} fill sizes="35vw" className="object-cover" priority />
              </div>
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-6">
                  <span className="block text-[9px] font-bold tracking-[0.3em] uppercase mb-1.5" style={{ color: "#FAE705" }}>{GALLERY[0].tag}</span>
                  <p className="serif text-white text-xl font-semibold leading-tight">{GALLERY[0].label}</p>
                  <p className="text-white/55 text-xs mt-1.5 leading-relaxed">{GALLERY[0].desc}</p>
                </div>
              </div>
            </div>

            {/* Photo 2 — top centre */}
            <div className="photo-card" style={fade(gallery.inView, 0.3)}>
              <div className="photo-img-wrap">
                <Image src={GALLERY[1].src} alt={GALLERY[1].alt} fill sizes="25vw" className="object-cover" />
              </div>
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-5">
                  <span className="block text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: "#FAE705" }}>{GALLERY[1].tag}</span>
                  <p className="serif text-white font-semibold leading-tight">{GALLERY[1].label}</p>
                </div>
              </div>
            </div>

            {/* Photo 4 — tall right */}
            <div className="photo-card" style={{ gridRow: "1 / 3", ...fade(gallery.inView, 0.15) }}>
              <div className="photo-img-wrap">
                <Image src={GALLERY[3].src} alt={GALLERY[3].alt} fill sizes="35vw" className="object-cover" />
              </div>
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-6">
                  <span className="block text-[9px] font-bold tracking-[0.3em] uppercase mb-1.5" style={{ color: "#FAE705" }}>{GALLERY[3].tag}</span>
                  <p className="serif text-white text-xl font-semibold leading-tight">{GALLERY[3].label}</p>
                  <p className="text-white/55 text-xs mt-1.5 leading-relaxed">{GALLERY[3].desc}</p>
                </div>
              </div>
            </div>

            {/* Photo 3 — bottom centre */}
            <div className="photo-card" style={fade(gallery.inView, 0.45)}>
              <div className="photo-img-wrap">
                <Image src={GALLERY[2].src} alt={GALLERY[2].alt} fill sizes="25vw" className="object-cover" />
              </div>
              <div className="photo-overlay">
                <div className="photo-caption absolute bottom-0 left-0 right-0 p-5">
                  <span className="block text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: "#FAE705" }}>{GALLERY[2].tag}</span>
                  <p className="serif text-white font-semibold leading-tight">{GALLERY[2].label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: 2×2 grid */}
          <div className="md:hidden grid grid-cols-2 gap-2.5" style={{ gridTemplateRows: "200px 200px" }}>
            {GALLERY.map((photo, i) => (
              <div key={photo.src} className="photo-card" style={fade(gallery.inView, 0.1 + i * 0.1)}>
                <div className="photo-img-wrap">
                  <Image src={photo.src} alt={photo.alt} fill sizes="50vw" className="object-cover" />
                </div>
                <div className="photo-overlay">
                  <div className="photo-caption absolute bottom-0 left-0 right-0 p-4">
                    <span className="block text-[8px] font-bold tracking-widest uppercase mb-0.5" style={{ color: "#FAE705" }}>{photo.tag}</span>
                    <p className="serif text-white text-sm font-semibold leading-tight">{photo.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          STATS — count-up animation
      ════════════════════════════════════ */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {STATS.map((s) => <StatItem key={s.label} {...s} />)}
        </div>
      </section>

      {/* ════════════════════════════════════
          PILLARS — Visi / Misi / Nilai
      ════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: "#0d1b2a" }}>
        {/* Background glows */}
        <div className="pointer-events-none absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: "rgba(56,189,248,0.07)"  }} />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: "rgba(250,231,5,0.06)"  }} />

        <div ref={pillars.ref} className="relative max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-14" style={fade(pillars.inView, 0, "x")}>
            <span className="w-6 h-px block" style={{ background: "#FAE705" }} />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#FAE705" }}>Profil Organisasi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {PILLARS.map((p, i) => (
              <div key={p.num} className="pillar-card" style={fade(pillars.inView, 0.1 + i * 0.15)}>
                <span className="serif block leading-none mb-5" style={{ fontSize: "5.5rem", fontWeight: 700, color: "rgba(255,255,255,0.05)" }}>
                  {p.num}
                </span>
                <h3 className="serif text-2xl font-bold text-white mb-3">{p.title}</h3>
                <span className="block w-8 h-px mb-5" style={{ background: "#FAE705" }} />
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          SKM SYSTEM
      ════════════════════════════════════ */}
      <section className="bg-[#f8f7f3] py-24 px-6">
        <div ref={skm.ref} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5" style={fade(skm.inView, 0)}>
              <span className="w-6 h-px block" style={{ background: "#FAE705" }} />
              <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>Sistem SKM</span>
            </div>
            <h2 className="serif text-4xl font-bold text-slate-900 mb-6 leading-tight">
              <WordReveal text="Survei Kepuasan" inView={skm.inView} delay={0.1} />
              <br />
              <WordReveal text="Masyarakat Digital" inView={skm.inView} delay={0.42} italic />
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm mb-4" style={fade(skm.inView, 0.5)}>
              Platform digital dirancang untuk mengukur kepuasan masyarakat terhadap pelayanan publik BKPSDM
              secara transparan, akuntabel, dan mudah diakses.
            </p>
            <p className="text-slate-500 leading-relaxed text-sm" style={fade(skm.inView, 0.62)}>
              Hasil survei diolah otomatis menjadi Indeks Kepuasan Masyarakat (IKM) yang dipantau real-time
              sebagai bahan evaluasi dan perbaikan berkelanjutan.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { val: "9",   label: "Unsur Penilaian", sub: "Sesuai standar nasional Permenpan RB"  },
              { val: "IKM", label: "Indeks Kepuasan",  sub: "Dihitung dan ditampilkan otomatis"     },
              { val: "QR",  label: "Akses QR Code",    sub: "Pindai & isi survei langsung di loket" },
            ].map((f, i) => (
              <div key={f.label} className="skm-tile" style={fade(skm.inView, 0.3 + i * 0.12, "x", -24)}>
                <div className="skm-icon serif">{f.val}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{f.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          LEGAL BASIS
      ════════════════════════════════════ */}
      <section className="bg-white border-t border-gray-100 py-24 px-6">
        <div ref={legal.ref} className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4" style={fade(legal.inView, 0)}>
            <span className="w-6 h-px block" style={{ background: "#FAE705" }} />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>Dasar Hukum</span>
          </div>
          <h2 className="serif text-4xl font-bold text-slate-900 mb-12">
            <WordReveal text="Landasan Regulasi" inView={legal.inView} delay={0.1} />
          </h2>

          {LEGAL.map((l, i) => (
            <div key={l.num} className="legal-row flex gap-8 md:gap-12 -mx-4 px-4"
              style={fade(legal.inView, 0.12 + i * 0.12, "x")}>
              <div className="shrink-0 w-12"><span className="legal-num">{String(i + 1).padStart(2, "0")}</span></div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <span className="text-[9px] font-bold tracking-[0.3em] uppercase" style={{ color: "#916e00" }}>{l.code}</span>
                  <span className="text-sm font-bold text-slate-800">{l.num}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          CONTACT
      ════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: "#0d1b2a" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <span className="w-6 h-px block" style={{ background: "#FAE705" }} />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#FAE705" }}>Hubungi Kami</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin className="w-3.5 h-3.5" style={{ color: "#FAE705" }} />, label: "Alamat",  value: "Jl. Pasir Peti, Kec. Siantan, Kab. Anambas, Kepulauan Riau", href: null },
              { icon: <Phone  className="w-3.5 h-3.5" style={{ color: "#FAE705" }} />, label: "Telepon", value: "0812-6671-4935",                                                href: "tel:+6281266714935" },
              { icon: <Mail   className="w-3.5 h-3.5" style={{ color: "#FAE705" }} />, label: "Email",   value: "bkpsdm@anambaskab.go.id",                                       href: "mailto:bkpsdm@anambaskab.go.id" },
            ].map((c) => (
              <div key={c.label} className="contact-item">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="contact-badge">{c.icon}</div>
                  <span className="text-[9px] font-semibold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{c.label}</span>
                </div>
                {c.href
                  ? <a href={c.href} className="contact-link">{c.value}</a>
                  : <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{c.value}</p>}
              </div>
            ))}
          </div>

          <div className="hr-tri mt-16" />
          <p className="text-[10px] tracking-widest mt-6 text-center" style={{ color: "rgba(255,255,255,0.18)" }}>
            BKPSDM KABUPATEN KEPULAUAN ANAMBAS &nbsp;·&nbsp; SURVEI KEPUASAN MASYARAKAT
          </p>
        </div>
      </section>

    </div>
  );
}
