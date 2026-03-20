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
  style: ["normal"],
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

function WordReveal({ text, inView, delay = 0 }: {
  text: string; inView: boolean; delay?: number;
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
          {word}{"\u00A0"}
        </span>
      ))}
    </span>
  );
}

/* ── FileItem type ───────────────────────────── */
interface FileItem {
  id: string;
  file: File;
  preview: string | null;  // base64 data URL for images
  name: string;
  size: string;            // "1.23 MB"
  isImage: boolean;
}

/* ── Page ─────────────────────────────────────── */
const initialState = { success: undefined as true | undefined, error: undefined as string | undefined };

export default function PengaduanClient() {
  const [progress, setProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  // Trigger ref: powers the OS file-picker dialog (not submitted to server)
  const triggerRef = useRef<HTMLInputElement>(null);
  // Form refs: 5 hidden inputs named lampiran_0…lampiran_4 that carry files in FormData
  const fileInputsRef = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null]);
  const [state, action, isPending] = useActionState(submitPengaduan, initialState);

  // Success overlay state
  const [submitted, setSubmitted] = useState(false);

  // Multi-file state
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  /** Sync the 5 hidden file inputs to the current items array (compacted, 0-indexed). */
  function syncInputs(items: FileItem[]) {
    fileInputsRef.current.forEach((input, i) => {
      if (!input) return;
      if (items[i]) {
        const dt = new DataTransfer();
        dt.items.add(items[i].file);
        input.files = dt.files;
      } else {
        input.value = "";
      }
    });
  }

  /** Add one or more files to the list (respects 5-file cap + 5 MB per file). */
  function addFiles(raw: File[]) {
    setFileError(null);
    const remaining = 5 - fileItems.length;
    if (remaining <= 0) { setFileError("Maksimal 5 lampiran diizinkan."); return; }
    const toAdd = raw.slice(0, remaining);
    if (raw.length > remaining) {
      setFileError(`Hanya ${remaining} slot tersisa — ${raw.length - remaining} file diabaikan.`);
    }
    const newItems: FileItem[] = [];
    for (const file of toAdd) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`"${file.name}" melebihi batas 5 MB.`);
        continue;
      }
      const isImage = file.type.startsWith("image/");
      const item: FileItem = {
        id: Math.random().toString(36).slice(2),
        file, preview: null,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        isImage,
      };
      if (isImage) {
        const reader = new FileReader();
        const iid = item.id;
        reader.onload = (e) =>
          setFileItems((prev) =>
            prev.map((p) => p.id === iid ? { ...p, preview: e.target?.result as string } : p),
          );
        reader.readAsDataURL(file);
      }
      newItems.push(item);
    }
    const allItems = [...fileItems, ...newItems];
    setFileItems(allItems);
    syncInputs(allItems);
  }

  /** Remove the file at index `idx` and compact remaining files into the hidden inputs. */
  function removeFile(idx: number) {
    const next = fileItems.filter((_, i) => i !== idx);
    setFileItems(next);
    syncInputs(next);
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDragActive(true); }
  function onDragLeave(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setDragActive(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  const formSection  = useInView(0.06);
  const featSection  = useInView(0.08);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset form after success + show success card
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      setFileItems([]);
      fileInputsRef.current.forEach((inp) => { if (inp) inp.value = ""; });
      setSubmitted(true);
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
      title: "Transparan dan Akuntabel",
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

        /* ═══ Upload preview ═══ */
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
            <span className="block font-bold text-white" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
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
          FORM + GUARANTEES (2-column)
      ════════════════════════════════════ */}
      <section id="form" className="py-10 px-6" style={{ background: "#f8f7f3" }}>
        <div ref={formSection.ref} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

          {/* LEFT — label, heading, guarantees */}
          <div>
            <div className="flex items-center gap-3 mb-3" style={fade(formSection.inView, 0)}>
              <span className="section-label-line" />
              <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: "#916e00" }}>
                Formulir Pengaduan
              </span>
            </div>

            <h2 className="serif text-3xl font-bold text-slate-900 mb-3 leading-tight">
              <WordReveal text="Suarakan" inView={formSection.inView} delay={0.1} />
              <br />
              <WordReveal text="Aspirasi Anda" inView={formSection.inView} delay={0.32} />
            </h2>

            <p className="text-slate-500 leading-relaxed text-sm mb-4" style={fade(formSection.inView, 0.45)}>
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

          {/* RIGHT — form card or success card */}
          <div className="flex flex-col" style={fade(formSection.inView, 0.2)}>
            {/* ── Success card (replaces form after submission) ── */}
            {submitted && (
              <div
                className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center px-8 py-12 gap-5"
                style={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(250,231,5,0.12)", border: "2px solid rgba(250,231,5,0.4)" }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#FAE705" }} />
                </div>
                {/* Heading */}
                <div>
                  <p className="serif text-2xl font-bold text-white mb-2">
                    Pengaduan Berhasil Dikirim
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Terima kasih. Konfirmasi telah dikirim ke email Anda.
                    Tim kami akan segera menindaklanjuti dalam 1×24 jam kerja.
                  </p>
                </div>
                {/* Reset button */}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "#FAE705", color: "#0d1b2a" }}
                >
                  <Send className="w-4 h-4" />
                  Kirim Pengaduan Baru
                </button>
              </div>
            )}

            {/* ── Form card (hidden after submission) ── */}
            {!submitted && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="px-6 py-3 border-b border-gray-100" style={{ background: "#0d2d58" }}>
                <p className="text-[10px] font-semibold tracking-[0.28em] uppercase" style={{ color: "rgba(250,231,5,0.7)" }}>
                  Formulir Pengaduan
                </p>
                <p className="text-white font-semibold text-base mt-1" style={{ fontFamily: "var(--font-display,Georgia,serif)" }}>
                  BKPSDM Kab. Kepulauan Anambas
                </p>
              </div>

              <div className="px-6 py-4">
                {/* Error */}
                {state.error && (
                  <div className="flex items-start gap-3 rounded-xl p-4 mb-4 border"
                    style={{ background: "#fef2f2", borderColor: "#fca5a5" }}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                    <p className="text-sm" style={{ color: "#991b1b" }}>{state.error}</p>
                  </div>
                )}

                <form ref={formRef} action={action} encType="multipart/form-data" className="space-y-3">
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

                  {/* Phone + Subject row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">
                        No. Telepon <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsional)</span>
                      </label>
                      <input name="telepon" type="tel" maxLength={30}
                        placeholder="08xx-xxxx-xxxx" className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">
                        Judul Pengaduan <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input name="judul" type="text" required maxLength={200}
                        placeholder="Ringkasan singkat pengaduan Anda"
                        className="form-input" />
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="form-label">
                      Isi Pengaduan <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea name="isi" required maxLength={2000} rows={3}
                      placeholder="Jelaskan pengaduan Anda secara detail — apa yang terjadi, kapan, dan di mana..."
                      className="form-input"
                      style={{ resize: "none", lineHeight: 1.6 }} />
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Maksimal 2.000 karakter</p>
                  </div>

                  {/* Upload — multi-file (max 5, max 5 MB each) */}
                  <div>
                    <label className="form-label">
                      Lampiran Bukti{" "}
                      <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                        (opsional · maks. 5 file · 5 MB/file)
                      </span>
                    </label>

                    {/* ── Thumbnail grid ── */}
                    {fileItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {fileItems.map((item, i) => (
                          <div key={item.id} className="relative group" style={{ width: 72 }}>
                            {item.isImage ? (
                              item.preview ? (
                                <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.preview}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                /* Loading preview spinner */
                                <div className="w-[72px] h-[72px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-sky-400 spin" />
                                </div>
                              )
                            ) : (
                              /* Non-image file tile */
                              <div className="w-[72px] h-[72px] rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 p-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: "#0d2d58" }}>
                                  <FileText className="w-4 h-4" style={{ color: "#FAE705" }} />
                                </div>
                                <p className="text-[8px] text-slate-400 text-center w-full truncate leading-tight">
                                  {item.size}
                                </p>
                              </div>
                            )}

                            {/* Filename below thumbnail */}
                            <p className="text-[8px] text-slate-400 mt-0.5 text-center w-full leading-tight px-0.5 truncate">
                              {item.name.length > 10 ? item.name.slice(0, 8) + "…" : item.name}
                            </p>

                            {/* Remove button — visible on hover */}
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: "#ef4444" }}
                              aria-label={`Hapus ${item.name}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Compact add-file button (hidden when full) ── */}
                    {fileItems.length < 5 && (
                      <button
                        type="button"
                        onClick={() => triggerRef.current?.click()}
                        onDragOver={onDragOver}
                        onDragEnter={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        aria-label="Tambah lampiran bukti"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200"
                        style={{
                          color: dragActive ? "#38bdf8" : "#64748b",
                          border: `1px dashed ${dragActive ? "#38bdf8" : "#cbd5e1"}`,
                          background: dragActive ? "rgba(56,189,248,.06)" : "transparent",
                        }}
                      >
                        <Upload className="w-3 h-3 shrink-0" />
                        {dragActive
                          ? "Lepaskan file di sini"
                          : `+ Lampiran · ${5 - fileItems.length} tersisa · maks. 5 MB`}
                      </button>
                    )}

                    {/* Max reached badge */}
                    {fileItems.length >= 5 && (
                      <div className="flex items-center gap-2 p-3 rounded-xl"
                        style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#16a34a" }} />
                        <p className="text-xs font-medium" style={{ color: "#166534" }}>
                          Maksimal 5 lampiran telah tercapai
                        </p>
                      </div>
                    )}

                    {fileError && (
                      <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#dc2626" }}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fileError}
                      </p>
                    )}

                    {/* Trigger: opens file-picker dialog only (not submitted) */}
                    <input
                      ref={triggerRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt"
                      className="sr-only"
                      onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
                    />

                    {/* 5 hidden named inputs — these carry files in the FormData */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <input
                        key={i}
                        ref={(el) => { fileInputsRef.current[i] = el; }}
                        type="file"
                        name={`lampiran_${i}`}
                        className="sr-only"
                      />
                    ))}
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
            )} {/* end !submitted */}
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
            <WordReveal text="Pengaduan Anda" inView={featSection.inView} delay={0.38} />
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

    </div>
  );
}
