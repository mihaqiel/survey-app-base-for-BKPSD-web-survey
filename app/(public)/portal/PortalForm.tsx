"use client";

import { useEffect, useState, useRef } from "react";
import { submitSkmResponse } from "@/app/action/submit";
import {
  Search,
  ChevronDown,
  Check,
  X,
  Briefcase,
  ThumbsDown,
  MinusCircle,
  ThumbsUp,
  Star,
  ClipboardList,
  User,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Send,
  Smile,
  Frown,
  Meh,
  Award,
} from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--pf-display",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--pf-body",
});

/* ─── Data ──────────────────────────────────────────── */
const SKM_QUESTIONS = [
  { code: "U1", label: "Persyaratan",  text: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?" },
  { code: "U2", label: "Prosedur",     text: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?" },
  { code: "U3", label: "Waktu",        text: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?" },
  { code: "U4", label: "Biaya/Tarif",  text: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)" },
  { code: "U5", label: "Produk",       text: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?" },
  { code: "U6", label: "Kompetensi",   text: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?" },
  { code: "U7", label: "Perilaku",     text: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?" },
  { code: "U8", label: "Sarana",       text: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?" },
  { code: "U9", label: "Pengaduan",    text: "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?" },
];

const SKM_OPTIONS = [
  { val: 1, label: "Tidak Baik",   sublabel: "Sangat tidak puas",    icon: <Frown      className="w-7 h-7" />, color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)"  },
  { val: 2, label: "Kurang Baik",  sublabel: "Kurang memuaskan",     icon: <Meh        className="w-7 h-7" />, color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.3)" },
  { val: 3, label: "Baik",         sublabel: "Cukup memuaskan",      icon: <Smile      className="w-7 h-7" />, color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.3)"  },
  { val: 4, label: "Sangat Baik",  sublabel: "Sangat memuaskan",     icon: <Award      className="w-7 h-7" />, color: "#38bdf8", bg: "rgba(56,189,248,0.1)",   border: "rgba(56,189,248,0.4)" },
];

const PENDIDIKAN = ["SD", "SMP", "SMA/SMK", "D1/D2/D3", "S1/D4", "S2", "S3"];
const PEKERJAAN  = ["PNS","PPPK","Outsourcing","TNI/Polri","Swasta","Wirausaha","Pelajar/Mahasiswa","Lainnya"];

const TOTAL_STEPS = 14;
const STEP_LABELS = [
  "Pilih Layanan","Data Diri","Pilih Pegawai",
  "Q1 · Persyaratan","Q2 · Prosedur","Q3 · Waktu","Q4 · Biaya",
  "Q5 · Produk","Q6 · Kompetensi","Q7 · Perilaku","Q8 · Sarana","Q9 · Pengaduan",
  "Rating Pegawai","Saran & Kirim",
];

interface Layanan { id: string; nama: string }
interface Pegawai { id: string; nama: string }

/* ─── Star Rating ───────────────────────────────────── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["","Tidak Memuaskan","Kurang Memuaskan","Cukup","Memuaskan","Sangat Memuaskan"];
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex items-center gap-4">
        {[1,2,3,4,5].map((star) => (
          <button key={star} type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform duration-150 hover:scale-110 focus:outline-none"
            aria-label={`${star} bintang`}
          >
            <Star className="w-14 h-14 transition-all duration-200"
              style={{
                color: star <= (hovered || value) ? "#FAE705" : "rgba(255,255,255,0.12)",
                fill:  star <= (hovered || value) ? "#FAE705" : "none",
                filter: star <= (hovered || value) ? "drop-shadow(0 0 8px rgba(250,231,5,0.5))" : "none",
              }}
            />
          </button>
        ))}
      </div>
      <div className="text-center min-h-[52px] flex flex-col items-center justify-center">
        {(hovered || value) > 0 ? (
          <>
            <p className="text-4xl font-black text-white">{hovered || value}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: "#FAE705" }}>
              {labels[hovered || value]}
            </p>
          </>
        ) : (
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
            Ketuk bintang untuk memberi rating
          </p>
        )}
      </div>
      {value > 0 && (
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: s <= value ? 28 : 8,
                background: s <= value ? "#FAE705" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────── */
export default function PortalForm() {
  const [step,       setStep]       = useState(0);
  const [prevStep,   setPrevStep]   = useState(0);
  const [animKey,    setAnimKey]    = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [layananList, setLayananList]     = useState<Layanan[]>([]);
  const [pegawaiList, setPegawaiList]     = useState<Pegawai[]>([]);
  const [layananOpen, setLayananOpen]     = useState(false);
  const [layananSearch, setLayananSearch] = useState("");
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);

  const [nama,           setNama]           = useState("");
  const [tglLayanan,     setTglLayanan]     = useState(new Date().toISOString().split("T")[0]);
  const [usia,           setUsia]           = useState("");
  const [jenisKelamin,   setJenisKelamin]   = useState("");
  const [pendidikan,     setPendidikan]     = useState("");
  const [pekerjaan,      setPekerjaan]      = useState("");
  const [pekerjaanCustom,setPekerjaanCustom]= useState("");
  const [isDifabel,      setIsDifabel]      = useState("Tidak");
  const [jenisDisabilitas,setJenisDisabilitas] = useState("");
  const [pegawaiSearch,  setPegawaiSearch]  = useState("");
  const [selectedPegawai,setSelectedPegawai]= useState<Pegawai | null>(null);
  const [employeeRating, setEmployeeRating] = useState(0);
  const [answers,        setAnswers]        = useState<Record<string, number>>({});
  const [saran,          setSaran]          = useState("");

  const contentRef  = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/layanan").then((r) => r.json()).then(setLayananList);
    fetch("/api/pegawai").then((r) => r.json()).then(setPegawaiList);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setLayananOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredLayanan = layananSearch.length > 0
    ? layananList.filter((l) => l.nama.toLowerCase().includes(layananSearch.toLowerCase()))
    : layananList;

  const filteredPegawai = pegawaiSearch.length > 1
    ? pegawaiList.filter((p) => p.nama.toLowerCase().includes(pegawaiSearch.toLowerCase()))
    : [];

  const canProceed = () => {
    if (step === 0)  return !!selectedLayanan;
    if (step === 1)  return !!(nama && usia && jenisKelamin && pendidikan && pekerjaan && tglLayanan);
    if (step === 2)  return !!selectedPegawai;
    if (step >= 3 && step <= 11) return !!answers[`u${step - 2}`];
    if (step === 12) return employeeRating > 0;
    return true;
  };

  const goTo = (nextStep: number) => {
    setPrevStep(step);
    setStep(nextStep);
    setAnimKey((k) => k + 1);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleNext   = () => { if (canProceed()) goTo(step + 1); };
  const handleBack   = () => goTo(step - 1);

  const handleSubmit = async () => {
    if (!selectedLayanan || !selectedPegawai) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("layananId", selectedLayanan.id);
    fd.append("pegawaiId", selectedPegawai.id);
    fd.append("nama", nama);
    fd.append("tglLayanan", tglLayanan);
    fd.append("usia", usia);
    fd.append("jenisKelamin", jenisKelamin);
    fd.append("pendidikan", pendidikan);
    fd.append("pekerjaan", pekerjaan === "Lainnya" ? pekerjaanCustom || "Lainnya" : pekerjaan);
    fd.append("isDifabel", isDifabel);
    fd.append("jenisDisabilitas", jenisDisabilitas);
    fd.append("rating", String(employeeRating || ""));
    for (let i = 1; i <= 9; i++) fd.append(`u${i}`, String(answers[`u${i}`] || 0));
    fd.append("saran", saran);
    await submitSkmResponse(fd);
  };

  const pct       = Math.round((step / (TOTAL_STEPS - 1)) * 100);
  const isForward = step >= prevStep;

  /* ── Shared input classes ───────────────────── */
  const inputCls = [
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all",
    "bg-white/5 border border-white/10 text-white placeholder-white/30",
    "focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10",
  ].join(" ");
  const labelCls = "block text-xs font-semibold mb-2 tracking-wide uppercase" ;

  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen`}
      style={{
        background: "linear-gradient(160deg, #0d1b2a 0%, #0a2236 50%, #0d1b2a 100%)",
        fontFamily: "var(--pf-body)",
      }}
    >
      {/* ── Global CSS ─────────────────────────────────── */}
      <style>{`
        @keyframes portalGrad {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes slideInRight { from { opacity:0; transform:translateX(32px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp       { from { opacity:0; transform:translateY(16px);  } to { opacity:1; transform:translateY(0); } }
        .portal-grad-bar {
          background: linear-gradient(-45deg, #FAE705, #38bdf8, #0d2d58, #FAE705);
          background-size: 300% 300%;
          animation: portalGrad 6s ease infinite;
        }
        .anim-slide-right { animation: slideInRight 0.35s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-slide-left  { animation: slideInLeft  0.35s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-fade-up     { animation: fadeUp       0.4s  ease both; }

        /* answer card */
        .answer-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-radius: 16px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
          user-select: none;
        }
        .answer-card:hover  { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); transform: translateX(4px); }
        .answer-card:active { transform: scale(0.98); }
        .answer-card.selected { transform: translateX(6px); }

        /* stepper dot */
        .step-dot { width:8px; height:8px; border-radius:4px; transition: all 0.4s ease; background: rgba(255,255,255,0.12); }
        .step-dot.done    { background: #22c55e; width:8px; }
        .step-dot.current { background: #38bdf8; width:28px; box-shadow: 0 0 12px rgba(56,189,248,0.6); }

        /* select & dropdown dark skin */
        .portal-select {
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }
        .portal-select option { background: #0d2d58; color: white; }

        /* toggle switch */
        .portal-toggle {
          width: 48px; height: 26px; border-radius: 13px;
          transition: background 0.2s;
          position: relative;
          flex-shrink: 0;
          cursor: pointer;
        }
        .portal-toggle-thumb {
          position: absolute; top: 3px; width: 20px; height: 20px;
          border-radius: 50%; background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        }

        /* sidebar step item */
        .sidebar-step { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:10px; transition:all 0.2s; }
        .sidebar-step.done    { color:rgba(255,255,255,0.4); }
        .sidebar-step.current { background:rgba(56,189,248,0.1); color:#38bdf8; }
        .sidebar-step.pending { color:rgba(255,255,255,0.18); }

        /* layanan dropdown */
        .layanan-dropdown { background:#0d2d58; border:1px solid rgba(255,255,255,0.1); border-radius:14px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.5); }
        .layanan-item { width:100%; text-align:left; padding:12px 20px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:12px; transition:background 0.15s, color 0.15s; color:rgba(255,255,255,0.6); cursor:pointer; background:transparent; border:none; }
        .layanan-item:hover  { background:rgba(56,189,248,0.1); color:white; }
        .layanan-item.active { background:rgba(56,189,248,0.15); color:#38bdf8; }

        /* nav btn */
        .portal-btn-back { display:flex; align-items:center; gap:6px; padding:12px 24px; border-radius:12px; font-size:13px; font-weight:600; border:1.5px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.5); background:transparent; transition:all 0.2s; cursor:pointer; }
        .portal-btn-back:hover { border-color:rgba(255,255,255,0.28); color:rgba(255,255,255,0.85); }
        .portal-btn-next { display:flex; align-items:center; justify-content:center; gap:8px; flex:1; padding:14px 24px; border-radius:12px; font-size:13px; font-weight:700; letter-spacing:0.04em; border:none; transition:all 0.2s; cursor:pointer; }
        .portal-btn-next:not(:disabled) { background:linear-gradient(-45deg,#FAE705,#38bdf8); color:#0d1b2a; box-shadow:0 4px 20px rgba(56,189,248,0.25); }
        .portal-btn-next:not(:disabled):hover { box-shadow:0 8px 32px rgba(56,189,248,0.4); transform:translateY(-1px); }
        .portal-btn-next:disabled { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.2); cursor:not-allowed; }

        /* gender button */
        .gender-btn { display:flex; align-items:center; gap:12px; padding:14px 18px; border-radius:12px; border:1.5px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03); cursor:pointer; transition:all 0.2s; color:rgba(255,255,255,0.5); font-weight:600; font-size:14px; }
        .gender-btn:hover    { border-color:rgba(56,189,248,0.3); background:rgba(56,189,248,0.06); }
        .gender-btn.selected { border-color:#38bdf8; background:rgba(56,189,248,0.12); color:white; }
        .gender-dot { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:border-color 0.2s; }
        .gender-btn.selected .gender-dot { border-color:#38bdf8; }
      `}</style>

      {/* ── STICKY PROGRESS HEADER ─────────────────────── */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: "rgba(13,27,42,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-5">
          {/* step number bubble */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
            style={{
              background: "linear-gradient(-45deg,#FAE705,#38bdf8)",
              color: "#0d1b2a",
            }}
          >
            {step + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--pf-body)" }}>
                {STEP_LABELS[step]}
              </p>
              <p className="text-xs font-bold" style={{ color: "#38bdf8", fontFamily: "var(--pf-body)" }}>{pct}%</p>
            </div>
            {/* gradient progress bar */}
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full portal-grad-bar transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── LAYOUT: SIDEBAR + MAIN ─────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-10 flex gap-6 items-start">

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-28">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--pf-body)" }}>
                Tahapan Survei
              </p>
            </div>
            <div className="p-2 space-y-0.5">
              {STEP_LABELS.map((label, i) => {
                const done = i < step, current = i === step;
                return (
                  <div key={i} className={`sidebar-step ${current ? "current" : done ? "done" : "pending"}`}>
                    <div
                      className="w-5 h-5 flex items-center justify-center shrink-0 rounded-md text-[10px] font-bold"
                      style={{
                        background: current ? "rgba(56,189,248,0.2)" : done ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                        color:      current ? "#38bdf8"              : done ? "#22c55e"              : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {done ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className="truncate text-xs font-semibold" style={{ fontFamily: "var(--pf-body)" }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MAIN CARD */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Step header inside card */}
            <div
              className="px-7 py-5 flex items-center gap-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: "rgba(56,189,248,0.7)", fontFamily: "var(--pf-body)" }}>
                  Langkah {step + 1} dari {TOTAL_STEPS}
                </p>
                <p className="text-lg font-bold text-white" style={{ fontFamily: "var(--pf-display)" }}>
                  {STEP_LABELS[step]}
                </p>
              </div>
            </div>

            {/* Step content */}
            <div ref={contentRef} className="p-7">
              <div key={animKey} className={isForward ? "anim-slide-right" : "anim-slide-left"}>

                {/* ══ STEP 0: PILIH LAYANAN ══════════════════════ */}
                {step === 0 && (
                  <div className="space-y-5 anim-fade-up">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--pf-body)" }}>
                      Pilih layanan BKPSDM yang baru saja Anda gunakan.
                    </p>
                    <div ref={dropdownRef} className="relative">
                      <div
                        role="button" tabIndex={0}
                        onClick={() => setLayananOpen((o) => !o)}
                        onKeyDown={(e) => e.key === "Enter" && setLayananOpen((o) => !o)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer select-none transition-all"
                        style={{
                          background:   layananOpen ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.04)",
                          border:       `1.5px solid ${layananOpen ? "rgba(56,189,248,0.4)" : selectedLayanan ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        <ClipboardList className="w-4 h-4 shrink-0" style={{ color: selectedLayanan ? "#38bdf8" : "rgba(255,255,255,0.25)" }} />
                        <span className="flex-1 text-sm font-medium truncate" style={{ color: selectedLayanan ? "white" : "rgba(255,255,255,0.3)", fontFamily: "var(--pf-body)" }}>
                          {selectedLayanan ? selectedLayanan.nama : "Pilih layanan..."}
                        </span>
                        {selectedLayanan && (
                          <button type="button" aria-label="Hapus pilihan" title="Hapus pilihan"
                            onClick={(e) => { e.stopPropagation(); setSelectedLayanan(null); setLayananSearch(""); }}
                            style={{ color: "rgba(255,255,255,0.3)" }} className="hover:text-red-400 transition-colors p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${layananOpen ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.3)" }} />
                      </div>

                      {layananOpen && (
                        <div className="absolute z-20 w-full top-full mt-2 layanan-dropdown">
                          {/* search */}
                          <div className="p-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                              <input type="text" placeholder="Cari layanan..."
                                value={layananSearch} onChange={(e) => setLayananSearch(e.target.value)} autoFocus
                                className="flex-1 text-sm font-medium bg-transparent outline-none"
                                style={{ color: "white", fontFamily: "var(--pf-body)" }}
                              />
                              {layananSearch && (
                                <button type="button" title="Hapus" aria-label="Hapus pencarian" onClick={() => setLayananSearch("")}>
                                  <X className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* list */}
                          <div className="max-h-[360px] overflow-y-auto">
                            {filteredLayanan.length === 0 ? (
                              <p className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--pf-body)" }}>Tidak ditemukan</p>
                            ) : filteredLayanan.map((l) => {
                              const sel = selectedLayanan?.id === l.id;
                              return (
                                <button key={l.id} type="button"
                                  onClick={() => { setSelectedLayanan(l); setLayananOpen(false); setLayananSearch(""); }}
                                  className={`layanan-item ${sel ? "active" : ""}`}
                                  style={{ fontFamily: "var(--pf-body)" }}
                                >
                                  <div className="w-1 h-4 rounded-full shrink-0" style={{ background: sel ? "#38bdf8" : "rgba(255,255,255,0.12)" }} />
                                  <span className="flex-1">{l.nama}</span>
                                  {sel && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#38bdf8" }} />}
                                </button>
                              );
                            })}
                          </div>
                          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>{filteredLayanan.length} layanan tersedia</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedLayanan && (
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: "rgba(56,189,248,0.08)", border: "1.5px solid rgba(56,189,248,0.25)" }}>
                        <Check className="w-4 h-4 shrink-0" style={{ color: "#38bdf8" }} />
                        <div>
                          <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: "rgba(56,189,248,0.7)", fontFamily: "var(--pf-body)" }}>Layanan Terpilih</p>
                          <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--pf-body)" }}>{selectedLayanan.nama}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ STEP 1: DATA DIRI ══════════════════════════ */}
                {step === 1 && (
                  <div className="space-y-5 anim-fade-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Nama Lengkap</label>
                        <input type="text" value={nama} onChange={(e) => setNama(e.target.value)}
                          title="Nama Lengkap" placeholder="Nama Anda" className={inputCls}
                          style={{ fontFamily: "var(--pf-body)" }}
                        />
                      </div>
                      <div>
                        <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Tanggal Layanan</label>
                        <input type="date" value={tglLayanan} onChange={(e) => setTglLayanan(e.target.value)}
                          title="Tanggal Layanan" className={`${inputCls} portal-select`}
                          style={{ fontFamily: "var(--pf-body)", colorScheme: "dark" }}
                        />
                      </div>
                      <div>
                        <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Usia</label>
                        <input type="number" value={usia} onChange={(e) => setUsia(e.target.value)}
                          title="Usia" placeholder="Tahun" min={1} max={120} className={inputCls}
                          style={{ fontFamily: "var(--pf-body)" }}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Jenis Kelamin</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Laki-laki","Perempuan"].map((v) => (
                          <button key={v} type="button"
                            onClick={() => setJenisKelamin(v)}
                            className={`gender-btn ${jenisKelamin === v ? "selected" : ""}`}
                            style={{ fontFamily: "var(--pf-body)" }}
                          >
                            <div className="gender-dot">
                              {jenisKelamin === v && <div className="w-2 h-2 rounded-full" style={{ background: "#38bdf8" }} />}
                            </div>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pendidikan */}
                    <div>
                      <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Pendidikan Terakhir</label>
                      <select value={pendidikan} onChange={(e) => setPendidikan(e.target.value)}
                        title="Pendidikan Terakhir"
                        className={`${inputCls} portal-select`}
                        style={{ fontFamily: "var(--pf-body)" }}
                      >
                        <option value="">Pilih pendidikan terakhir...</option>
                        {PENDIDIKAN.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    {/* Pekerjaan */}
                    <div>
                      <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Pekerjaan</label>
                      <select value={pekerjaan} onChange={(e) => setPekerjaan(e.target.value)}
                        title="Pekerjaan"
                        className={`${inputCls} portal-select`}
                        style={{ fontFamily: "var(--pf-body)" }}
                      >
                        <option value="">Pilih pekerjaan...</option>
                        {PEKERJAAN.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      {pekerjaan === "Lainnya" && (
                        <input type="text" value={pekerjaanCustom}
                          onChange={(e) => setPekerjaanCustom(e.target.value)}
                          placeholder="Sebutkan pekerjaan Anda"
                          className={`${inputCls} mt-2`}
                          style={{ fontFamily: "var(--pf-body)" }}
                        />
                      )}
                    </div>

                    {/* Difabel toggle */}
                    <div>
                      <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Penyandang Disabilitas?</label>
                      <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <button type="button" role="button" title="Toggle Disabilitas"
                          onClick={() => setIsDifabel(isDifabel === "Ya" ? "Tidak" : "Ya")}
                          className="portal-toggle"
                          style={{ background: isDifabel === "Ya" ? "#38bdf8" : "rgba(255,255,255,0.12)" }}
                        >
                          <div className="portal-toggle-thumb" style={{ transform: isDifabel === "Ya" ? "translateX(22px)" : "translateX(3px)" }} />
                        </button>
                        <span className="text-sm font-semibold" style={{ color: isDifabel === "Ya" ? "#38bdf8" : "rgba(255,255,255,0.3)", fontFamily: "var(--pf-body)" }}>
                          {isDifabel === "Ya" ? "Ya, saya penyandang disabilitas" : "Tidak"}
                        </span>
                      </div>
                      {isDifabel === "Ya" && (
                        <input type="text" value={jenisDisabilitas}
                          onChange={(e) => setJenisDisabilitas(e.target.value)}
                          placeholder="Jenis disabilitas (contoh: Tuna Netra)"
                          className={`${inputCls} mt-2`}
                          style={{ fontFamily: "var(--pf-body)" }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* ══ STEP 2: PILIH PEGAWAI ══════════════════════ */}
                {step === 2 && (
                  <div className="space-y-4 anim-fade-up">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--pf-body)" }}>
                      Cari dan pilih nama pegawai yang melayani Anda.
                    </p>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                      <input type="text" placeholder="Ketik nama pegawai..."
                        value={selectedPegawai ? selectedPegawai.nama : pegawaiSearch}
                        onChange={(e) => { setSelectedPegawai(null); setPegawaiSearch(e.target.value); }}
                        className={`${inputCls} pl-10`}
                        style={{ fontFamily: "var(--pf-body)" }}
                      />
                    </div>
                    {(() => {
                      const list = pegawaiSearch.length > 1 ? filteredPegawai : pegawaiList;
                      return list.length > 0 && !selectedPegawai ? (
                        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>
                              {pegawaiSearch.length > 0 ? "Hasil Pencarian" : "Semua Pegawai"}
                            </p>
                            <p className="text-[10px] font-bold" style={{ color: "#38bdf8", fontFamily: "var(--pf-body)" }}>{list.length} Pegawai</p>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {list.map((p, i) => (
                              <button key={p.id} type="button"
                                onClick={() => { setSelectedPegawai(p); setPegawaiSearch(""); }}
                                className="w-full text-left px-5 py-3.5 flex items-center gap-4 transition-all group"
                                style={{ fontFamily: "var(--pf-body)", color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(56,189,248,0.06)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                              >
                                <span className="text-xs font-medium w-5 shrink-0" style={{ color: "rgba(255,255,255,0.18)" }}>{i + 1}</span>
                                <div className="w-1 h-4 rounded-full shrink-0 transition-colors" style={{ background: "rgba(255,255,255,0.1)" }} />
                                <span className="text-sm font-semibold">{p.nama}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    {selectedPegawai && (
                      <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ background: "rgba(56,189,248,0.08)", border: "1.5px solid rgba(56,189,248,0.25)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-5 rounded-full" style={{ background: "#38bdf8" }} />
                          <div>
                            <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: "rgba(56,189,248,0.7)", fontFamily: "var(--pf-body)" }}>Pegawai Terpilih</p>
                            <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--pf-body)" }}>{selectedPegawai.nama}</p>
                          </div>
                        </div>
                        <button type="button"
                          onClick={() => { setSelectedPegawai(null); setPegawaiSearch(""); }}
                          className="flex items-center gap-1 text-xs font-semibold transition-colors"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#ef4444"}
                          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"}
                        >
                          <X className="w-3 h-3" /> Ganti
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ STEPS 3–11: SKM QUESTIONS ══════════════════ */}
                {step >= 3 && step <= 11 && (
                  <div className="space-y-7 anim-fade-up">
                    {/* Question label + text */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="px-3 py-1 rounded-full text-[11px] font-black tracking-widest"
                          style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", fontFamily: "var(--pf-body)" }}
                        >
                          {SKM_QUESTIONS[step - 3].code}
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>
                          Unsur {step - 2} dari 9 · {SKM_QUESTIONS[step - 3].label}
                        </span>
                      </div>
                      <p className="text-lg font-semibold leading-relaxed text-white" style={{ fontFamily: "var(--pf-display)" }}>
                        {SKM_QUESTIONS[step - 3].text}
                      </p>
                    </div>

                    {/* Answer cards — vertical list for readability */}
                    <div className="space-y-3">
                      {SKM_OPTIONS.map((opt) => {
                        const key      = `u${step - 2}`;
                        const selected = answers[key] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setAnswers((a) => ({ ...a, [key]: opt.val }))}
                            className="answer-card w-full selected"
                            style={{
                              background:   selected ? opt.bg   : "rgba(255,255,255,0.03)",
                              borderColor:  selected ? opt.border : "rgba(255,255,255,0.08)",
                              boxShadow:    selected ? `0 0 24px ${opt.color}22` : "none",
                            }}
                          >
                            {/* value badge */}
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl font-black transition-all"
                              style={{
                                background: selected ? `${opt.color}22` : "rgba(255,255,255,0.05)",
                                color:      selected ? opt.color        : "rgba(255,255,255,0.2)",
                              }}
                            >
                              {opt.val}
                            </div>
                            {/* icon */}
                            <div style={{ color: selected ? opt.color : "rgba(255,255,255,0.2)" }} className="transition-colors shrink-0">
                              {opt.icon}
                            </div>
                            {/* labels */}
                            <div className="flex-1 text-left">
                              <p className="text-base font-bold transition-colors" style={{ color: selected ? "white" : "rgba(255,255,255,0.5)", fontFamily: "var(--pf-body)" }}>
                                {opt.label}
                              </p>
                              <p className="text-xs mt-0.5 transition-colors" style={{ color: selected ? opt.color : "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>
                                {opt.sublabel}
                              </p>
                            </div>
                            {/* checkmark */}
                            {selected && (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: opt.color }}>
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Mini progress dots */}
                    <div className="flex items-center gap-2 justify-center pt-2">
                      {SKM_QUESTIONS.map((_, i) => {
                        const isCurrent = i === step - 3;
                        const isDone    = !!answers[`u${i + 1}`];
                        return (
                          <div key={i} className={`step-dot ${isCurrent ? "current" : isDone ? "done" : ""}`} />
                        );
                      })}
                    </div>
                    <p className="text-center text-xs font-medium" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>
                      {Object.keys(answers).length} dari 9 pertanyaan dijawab
                    </p>
                  </div>
                )}

                {/* ══ STEP 12: RATING PEGAWAI ════════════════════ */}
                {step === 12 && selectedPegawai && (
                  <div className="space-y-6 anim-fade-up">
                    {/* Pegawai card */}
                    <div className="flex items-center gap-4 px-5 py-4 rounded-xl" style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.18)" }}>
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-base font-black"
                        style={{ background: "linear-gradient(-45deg,#FAE705,#38bdf8)", color: "#0d1b2a" }}
                      >
                        {selectedPegawai.nama.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: "rgba(56,189,248,0.7)", fontFamily: "var(--pf-body)" }}>Pegawai yang Melayani</p>
                        <p className="text-base font-bold text-white" style={{ fontFamily: "var(--pf-display)" }}>{selectedPegawai.nama}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--pf-body)" }}>Semua 9 unsur SKM telah dijawab ✓</p>
                      </div>
                    </div>
                    <p className="text-sm text-center font-medium" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--pf-body)" }}>
                      Berikan rating kepuasan Anda terhadap pegawai yang melayani
                    </p>
                    <StarRating value={employeeRating} onChange={setEmployeeRating} />
                  </div>
                )}

                {/* ══ STEP 13: SARAN & SUBMIT ════════════════════ */}
                {step === 13 && (
                  <div className="space-y-6 anim-fade-up">
                    <div>
                      <label className={labelCls} style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--pf-body)" }}>Saran & Masukan (Opsional)</label>
                      <textarea value={saran} onChange={(e) => setSaran(e.target.value)}
                        placeholder="Tuliskan saran atau masukan Anda untuk perbaikan layanan ini..."
                        title="Saran dan Masukan"
                        className={`${inputCls} resize-none min-h-[120px]`}
                        style={{ fontFamily: "var(--pf-body)" }}
                      />
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--pf-body)" }}>Ringkasan Survei</p>
                      </div>
                      <div>
                        {[
                          { icon: <ClipboardList className="w-4 h-4" />, label: "Layanan",   value: selectedLayanan?.nama },
                          { icon: <User          className="w-4 h-4" />, label: "Responden", value: `${nama} · ${usia} thn · ${jenisKelamin}` },
                          { icon: <UserCheck     className="w-4 h-4" />, label: "Pegawai",   value: selectedPegawai?.nama },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="px-5 py-3.5 flex items-start gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <span className="shrink-0 mt-0.5" style={{ color: "#38bdf8" }}>{icon}</span>
                            <div>
                              <p className="text-[10px] font-bold tracking-wide uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>{label}</p>
                              <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--pf-body)" }}>{value}</p>
                            </div>
                          </div>
                        ))}

                        {/* 9-unsur grid */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#38bdf8" }} />
                            <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>Penilaian 9 Unsur SKM</p>
                            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", fontFamily: "var(--pf-body)" }}>
                              {Object.keys(answers).length}/9
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {SKM_QUESTIONS.map((q, i) => {
                              const val = answers[`u${i + 1}`];
                              const opt = SKM_OPTIONS.find((o) => o.val === val);
                              return (
                                <div key={q.code} className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                                  style={{ background: val ? `${opt?.color}0d` : "rgba(255,255,255,0.02)", border: `1px solid ${val ? `${opt?.color}33` : "rgba(255,255,255,0.06)"}` }}
                                >
                                  <span className="shrink-0" style={{ color: opt ? opt.color : "rgba(255,255,255,0.15)" }}>
                                    {opt ? <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{opt.icon}</span> : <MinusCircle className="w-3.5 h-3.5" />}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--pf-body)" }}>{q.code}</p>
                                    <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--pf-body)" }}>{q.label}</p>
                                  </div>
                                  {val && <span className="ml-auto text-xs font-black shrink-0" style={{ color: opt?.color }}>{val}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit button */}
                    <button onClick={handleSubmit} disabled={submitting}
                      className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all"
                      style={{
                        background: submitting ? "rgba(255,255,255,0.06)" : "linear-gradient(-45deg,#FAE705,#38bdf8)",
                        color:      submitting ? "rgba(255,255,255,0.2)" : "#0d1b2a",
                        boxShadow:  submitting ? "none" : "0 8px 32px rgba(56,189,248,0.3)",
                        fontFamily: "var(--pf-body)",
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim Data...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Kirim Survei Kepuasan</>
                      )}
                    </button>
                    <p className="text-center text-xs font-medium" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--pf-body)" }}>
                      Data survei bersifat rahasia dan hanya untuk evaluasi mutu pelayanan
                    </p>
                  </div>
                )}

                {/* ══ NAVIGATION ═════════════════════════════════ */}
                {step < 13 && (
                  <div className="flex gap-3 mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {step > 0 && (
                      <button onClick={handleBack} className="portal-btn-back" style={{ fontFamily: "var(--pf-body)" }}>
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                    )}
                    <button onClick={handleNext} disabled={!canProceed()} className="portal-btn-next" style={{ fontFamily: "var(--pf-body)" }}>
                      {step === 11 ? "Lanjut ke Rating Pegawai" : step === 12 ? "Lanjut ke Saran & Kirim" : "Lanjut"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
