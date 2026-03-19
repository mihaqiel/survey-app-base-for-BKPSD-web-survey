"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { submitPengaduan } from "@/app/action/pengaduan";
import {
  ChevronDown,
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Eye,
  MessageSquareWarning,
  FileText,
  Users,
} from "lucide-react";

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
        <span key={i} className="char-in inline-block"
          style={{ animationDelay: `${delay + i * 0.028}s` }} aria-hidden>
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

/* ── Page ─────────────────────────────────────── */
const initialState = { success: undefined as true | undefined, error: undefined as string | undefined };

export default function PengaduanClient() {
  const [progress, setProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, action, isPending] = useActionState(submitPengaduan, initialState);

  // File / drag state
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFile(file: File | null | undefined) {
    setFileError(null);
    if (!file) { clearFile(); return; }
    if (!file.type.startsWith("image/")) {
      setFileError("File harus berupa gambar (JPG, PNG, dsb).");
      clearFile(); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Ukuran gambar tidak boleh lebih dari 5 MB.");
      clearFile(); return;
    }
    setFileName(file.name);
    setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearFile() {
    setPreview(null); setFileName(null); setFileSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
    }
    handleFile(file);
  }

  const formSection  = useInView(0.06);
  const featSection  = useInView(0.08);
  const ctaSection   = useInView(0.08);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset form after success
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      clearFile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const fade = (inView: boolean, delay = 0, axis: "y" | "x" = "y", dist = 24) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translate(0,0)" : axis === "y" ? `translateY(${dist}px)` : `translateX(${-dist}px)`,
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  const GUARANTEES = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Respons Cepat",
      desc: "Setiap pengaduan ditinjau oleh tim kami dalam 1×24 jam kerja.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Identitas Terlindungi",
      desc: "Nama dan data pribadi pelapor dijaga kerahasiaannya sepenuhnya.",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Transparan & Akuntabel",
      desc: "Setiap laporan dicatat, diproses, dan dapat dipantau statusnya.",
    },
  ];

  const FEATURES = [
    {
      icon: <MessageSquareWarning className="w-6 h-6" />,
      title: "Pengaduan Langsung",
      desc: "Sampaikan keluhan atau masukan terkait pelayanan BKPSDM secara langsung dan mudah melalui formulir digital.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Bukti Dokumentasi",
      desc: "Lampirkan foto atau dokumen sebagai bukti pendukung pengaduan Anda untuk mempercepat proses tindak lanjut.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Ditindaklanjuti Tim",
      desc: "Pengaduan ditangani langsung oleh tim BKPSDM yang berwenang dan akan dihubungi bila diperlukan klarifikasi.",
    },
  ];

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
        .cta-grad {
          background: linear-gradient(-45deg, #0d2d58, #0d1b2a, #091a33, #0d2d58);
          background-size: 300% 300%;
          animation: heroGrad 14s ease infinite;
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

        /* ═══ Section label ═══ */
        .section-label { display:flex; align-items:center; gap:.75rem; }
        .section-label-line { width:1.5rem; height:1px; background:#FAE705; display:block; }

        /* ═══ HR ═══ */
        .hr-tri { height:1px; background:linear-gradient(90deg,transparent,#FAE705 30%,#38bdf8 70%,transparent); }

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

        /* ═══ Guarantee tiles ═══ */
        .gtile {
          display:flex; align-items:flex-start; gap:1.25rem;
          background:#fff; border:1px solid #f1f5f9; border-radius:.875rem;
          padding:1rem 1.25rem; box-shadow:0 1px 3px rgba(0,0,0,.06);
          transition: box-shadow .3s ease, border-color .3s ease, transform .3s ease;
        }
        .gtile:hover { box-shadow:0 4px 20px rgba(56,189,248,.18); border-color:rgba(56,189,248,.35); transform:translateX(6px); }
        .gtile-icon { width:48px; height:48px; border-radius:.7rem; background:#0d2d58; display:flex; align-items:center; justify-content:center; color:#FAE705; flex-shrink:0; transition:background .3s ease, color .3s ease; }
        .gtile:hover .gtile-icon { background:#38bdf8; color:#0d2d58; }

        /* ═══ Form inputs ═══ */
        .form-input {
          width:100%; padding:.875rem 1.125rem;
          background:#fff; border:1px solid #e2e8f0; border-radius:.625rem;
          font-size:.875rem; color:#0f172a;
          outline:none; transition:border-color .2s ease, box-shadow .2s ease;
          font-family:var(--font-body,sans-serif);
        }
        .form-input::placeholder { color:#cbd5e1; }
        .form-input:focus { border-color:#38bdf8; box-shadow:0 0 0 3px rgba(56,189,248,.12); }
        .form-label {
          display:block; font-size:.7rem; font-weight:700;
          letter-spacing:.15em; text-transform:uppercase; color:#64748b;
          margin-bottom:.5rem;
        }

        /* ═══ Upload zone ═══ */
        .upload-zone {
          border:2px dashed #e2e8f0; border-radius:.875rem;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:.625rem; padding:2.5rem 1rem;
          cursor:pointer; background:#fafbfc;
          transition:border-color .25s ease, background .25s ease;
        }
        .upload-zone:hover, .upload-zone.drag-over { border-color:#38bdf8; background:rgba(56,189,248,.06); }
        .upload-zone.drag-over { border-style:solid; }
        .upload-preview {
          border:1.5px solid #e2e8f0; border-radius:.875rem;
          overflow:hidden; background:#fafbfc;
        }

        /* ═══ Submit button ═══ */
        .submit-btn {
          width:100%; background:#0d2d58; color:#fff;
          padding:.95rem 1.5rem; border-radius:.75rem;
          font-size:.875rem; font-weight:700; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
          transition:background .25s ease, transform .2s ease, box-shadow .3s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background:#1565c0;
          transform:translateY(-1px);
          box-shadow:0 8px 28px rgba(13,45,88,.22);
        }
        .submit-btn:active:not(:disabled) { transform:scale(.98); }
        .submit-btn:disabled { background:#94a3b8; cursor:not-allowed; }

        /* ═══ Spin ═══ */
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation:spin .8s linear infinite; }
      `}</style>

      {/* ── Scroll progress ── */}
      <div className="fixed top-0 left-0 z-50 h-[3px] prog-bar transition-all duration-75" style={{ width: `${progress}%` }} />

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="hero-grad relative min-h-screen flex items-center overflow-hidden px-6">

        {/* Orbs */}
        <div className="orb-a pointer-events-none absolute top-[15%] right-[8%]  w-[460px] h-[460px] rounded-full blur-[130px]" style={{ background: "rgba(250,231,5,0.18)" }} />
        <div className="orb-b pointer-events-none absolute bottom-[20%] left-[4%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: "rgba(56,189,248,0.18)" }} />
        <div className="orb-c pointer-events-none absolute top-[50%] left-[40%]  w-[300px] h-[300px] rounded-full blur-[90px]"  style={{ background: "rgba(13,45,88,0.40)" }} />

        {/* Dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0" />

        {/* Dark overlay */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(6,18,32,0.62)" }} />

        {/* Watermark */}
        <div className="serif pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
          <span className="text-[16vw] font-bold tracking-widest whitespace-nowrap" style={{ color: "rgba(255,255,255,0.022)" }}>
            PENGADUAN
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
              <CharReveal text="Pengaduan" delay={0.3} />
            </span>
            <span className="block font-normal italic" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "rgba(255,255,255,0.72)" }}>
              <CharReveal text="Masyarakat" delay={0.75} />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="char-in text-white/55 text-sm sm:text-base max-w-lg leading-relaxed mb-10"
            style={{ animationDelay: "1.55s" }}>
            Sampaikan keluhan, saran, atau masukan terkait pelayanan BKPSDM secara langsung.
            Setiap laporan ditangani serius dan ditindaklanjuti.
          </p>

          {/* CTA scroll hint */}
          <div className="char-in" style={{ animationDelay: "1.8s" }}>
            <a href="#form"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border"
              style={{
                background: "#FAE705",
                color: "#0d1b2a",
                border: "none",
              }}>
              Buat Pengaduan
              <span>↓</span>
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ color: "rgba(255,255,255,0.3)" }}>
          <span className="text-[9px] tracking-[0.32em] uppercase">Gulir</span>
          <div className="bounce"><ChevronDown className="w-4 h-4" /></div>
        </div>

        {/* Bottom bleed */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#f8f7f3]" />
      </section>

      {/* ════════════════════════════════════
          STATS BAR
      ════════════════════════════════════ */}
      <section style={{ background: "#0d1b2a", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3">
          {[
            { val: "24",  label: "Jam Respons",       sub: "Ditinjau dalam 1 hari kerja" },
            { val: "100", label: "% Rahasia",          sub: "Identitas pelapor terlindungi" },
            { val: "✓",   label: "Terverifikasi",      sub: "Ditangani tim yang berwenang" },
          ].map((item, i) => (
            <div key={item.label} className="px-8 py-4 first:pl-0 last:pr-0"
              style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <p className="serif text-4xl md:text-5xl font-bold" style={{ color: "#FAE705" }}>{item.val}</p>
              <p className="text-sm font-semibold text-white mt-2 tracking-wide">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          FORM + GUARANTEES (2-column)
      ════════════════════════════════════ */}
      <section id="form" className="py-24 px-6" style={{ background: "#f8f7f3" }}>
        <div ref={formSection.ref} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* LEFT — label, heading, guarantees */}
          <div>
            <div className="flex items-center gap-3 mb-5" style={fade(formSection.inView, 0)}>
              <span className="section-label-line" />
              <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>
                Formulir Pengaduan
              </span>
            </div>

            <h2 className="serif text-4xl font-bold text-slate-900 mb-6 leading-tight">
              <WordReveal text="Suarakan" inView={formSection.inView} delay={0.1} />
              <br />
              <WordReveal text="Aspirasi Anda" inView={formSection.inView} delay={0.32} italic />
            </h2>

            <p className="text-slate-500 leading-relaxed text-sm mb-8" style={fade(formSection.inView, 0.45)}>
              Isi kolom di bawah ini untuk menyampaikan pengaduan Anda. Pastikan informasi
              yang diberikan akurat agar dapat kami tindaklanjuti dengan tepat.
            </p>

            <div className="space-y-3">
              {GUARANTEES.map((g, i) => (
                <div key={g.title} className="gtile" style={fade(formSection.inView, 0.35 + i * 0.12, "x", -24)}>
                  <div className="gtile-icon">{g.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{g.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — form card */}
          <div style={fade(formSection.inView, 0.2)}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="px-7 py-5 border-b border-gray-100" style={{ background: "#0d2d58" }}>
                <p className="text-[10px] font-semibold tracking-[0.28em] uppercase" style={{ color: "rgba(250,231,5,0.7)" }}>
                  Formulir Pengaduan
                </p>
                <p className="text-white font-semibold text-base mt-1" style={{ fontFamily: "var(--font-display,Georgia,serif)" }}>
                  BKPSDM Kab. Kepulauan Anambas
                </p>
              </div>

              <div className="px-7 py-7">
                {/* Success */}
                {state.success && (
                  <div className="flex items-start gap-3 rounded-xl p-4 mb-5 border"
                    style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#166534" }}>Pengaduan Berhasil Dikirim</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#15803d" }}>
                        Terima kasih. Konfirmasi dikirim ke email Anda. Tim kami akan segera menindaklanjuti.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {state.error && (
                  <div className="flex items-start gap-3 rounded-xl p-4 mb-5 border"
                    style={{ background: "#fef2f2", borderColor: "#fca5a5" }}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                    <p className="text-sm" style={{ color: "#991b1b" }}>{state.error}</p>
                  </div>
                )}

                <form ref={formRef} action={action} encType="multipart/form-data" className="space-y-4">
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">
                        Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input name="nama" type="text" required maxLength={100}
                        placeholder="Nama Anda" className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">
                        Email <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input name="email" type="email" required maxLength={200}
                        placeholder="email@contoh.com" className="form-input" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="form-label">
                      No. Telepon <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span>
                    </label>
                    <input name="telepon" type="tel" maxLength={30}
                      placeholder="08xx-xxxx-xxxx" className="form-input" />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="form-label">
                      Judul Pengaduan <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input name="judul" type="text" required maxLength={200}
                      placeholder="Ringkasan singkat pengaduan Anda"
                      className="form-input" />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="form-label">
                      Isi Pengaduan <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea name="isi" required maxLength={2000} rows={5}
                      placeholder="Jelaskan pengaduan Anda secara detail — apa yang terjadi, kapan, dan di mana..."
                      className="form-input"
                      style={{ resize: "none", lineHeight: 1.6 }} />
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Maksimal 2.000 karakter</p>
                  </div>

                  {/* Upload */}
                  <div>
                    <label className="form-label">
                      Foto Bukti <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional · maks. 5 MB)</span>
                    </label>

                    {preview ? (
                      /* ── Preview state ── */
                      <div className="upload-preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Preview foto bukti"
                          className="w-full object-cover"
                          style={{ maxHeight: "200px" }} />
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "#0d2d58" }}>
                              <Upload className="w-4 h-4" style={{ color: "#FAE705" }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-700 truncate">{fileName}</p>
                              <p className="text-[11px]" style={{ color: "#94a3b8" }}>{fileSize}</p>
                            </div>
                          </div>
                          <button type="button" onClick={clearFile}
                            className="flex-shrink-0 ml-3 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                            style={{ color: "#dc2626", borderColor: "#fca5a5", background: "#fff5f5" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff5f5"; }}>
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Drop / click zone ── */
                      <div
                        className={`upload-zone${dragActive ? " drag-over" : ""}`}
                        onDragOver={onDragOver}
                        onDragEnter={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                        aria-label="Unggah foto bukti"
                      >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1 transition-colors"
                          style={{ background: dragActive ? "rgba(56,189,248,.12)" : "#f1f5f9" }}>
                          <Upload className="w-6 h-6 transition-colors"
                            style={{ color: dragActive ? "#38bdf8" : "#94a3b8" }} />
                        </div>
                        {dragActive ? (
                          <p className="text-sm font-semibold" style={{ color: "#38bdf8" }}>Lepaskan untuk mengunggah</p>
                        ) : (
                          <>
                            <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                              Seret & lepas gambar di sini
                            </p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>
                              atau <span style={{ color: "#38bdf8", fontWeight: 600 }}>klik untuk memilih</span>
                            </p>
                          </>
                        )}
                        <p className="text-[11px] mt-1" style={{ color: "#cbd5e1" }}>JPG, PNG, WEBP · Maks. 5 MB</p>
                      </div>
                    )}

                    {fileError && (
                      <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#dc2626" }}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fileError}
                      </p>
                    )}

                    <input ref={fileInputRef} id="gambar-input" name="gambar" type="file" accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleFile(e.target.files?.[0])} />
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={isPending} className="submit-btn">
                    {isPending ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Pengaduan
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURES
      ════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white" style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div ref={featSection.ref} className="max-w-5xl mx-auto">

          <div className="section-label mb-4" style={fade(featSection.inView, 0)}>
            <span className="section-label-line" />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>
              Mekanisme
            </span>
          </div>

          <h2 className="serif text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            <WordReveal text="Bagaimana Kami Menangani" inView={featSection.inView} delay={0.05} />
            <br />
            <WordReveal text="Pengaduan Anda" inView={featSection.inView} delay={0.38} italic />
          </h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-14"
            style={fade(featSection.inView, 0.35)}>
            Setiap laporan diproses secara sistematis untuk memastikan pelayanan publik yang lebih baik.
          </p>

          <div className="hr-tri mb-14" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feat-card" style={fade(featSection.inView, 0.15 + i * 0.1)}>
                <div className="feat-icon mb-6">{f.icon}</div>
                <h3 className="serif text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA / NOTE
      ════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "#f8f7f3" }}>
        <div ref={ctaSection.ref} className="max-w-5xl mx-auto">
          <div className="cta-grad relative overflow-hidden rounded-3xl shadow-2xl">

            <div className="orb-a pointer-events-none absolute right-[-6%] top-[-30%] w-80 h-80 rounded-full blur-[90px]"
              style={{ background: "rgba(250,231,5,0.22)" }} />
            <div className="orb-b pointer-events-none absolute left-[-4%] bottom-[-20%] w-64 h-64 rounded-full blur-[80px]"
              style={{ background: "rgba(56,189,248,0.18)" }} />
            <div className="dot-grid pointer-events-none absolute inset-0" style={{ opacity: 0.5 }} />

            <div className="relative z-10 px-10 py-20 flex flex-col items-center text-center gap-8">
              <div className="section-label justify-center" style={fade(ctaSection.inView, 0)}>
                <span className="section-label-line" />
                <span className="text-[10px] font-semibold tracking-[0.38em] uppercase" style={{ color: "#FAE705" }}>
                  Perhatian
                </span>
                <span className="section-label-line" />
              </div>

              <h2 className="serif text-3xl md:text-4xl font-bold text-white max-w-xl leading-tight"
                style={fade(ctaSection.inView, 0.1)}>
                Sampaikan Pengaduan yang Akurat & Bertanggung Jawab
              </h2>
              <p className="text-white/50 text-sm max-w-md leading-relaxed" style={fade(ctaSection.inView, 0.2)}>
                Pastikan informasi yang Anda berikan benar dan dapat dipertanggungjawabkan.
                Pengaduan yang tidak berdasar atau mengandung informasi palsu dapat dikenakan
                sanksi sesuai ketentuan yang berlaku.
              </p>

              <div style={fade(ctaSection.inView, 0.3)}>
                <a href="#form"
                  className="inline-flex items-center gap-2 font-bold py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "#FAE705", color: "#0d1b2a", boxShadow: "0 8px 28px rgba(250,231,5,0.2)" }}>
                  <Send className="w-4 h-4" />
                  Buat Pengaduan Sekarang
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
