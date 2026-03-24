"use client";

import { useEffect, useState, useRef, Fragment } from "react";
import { submitSkmResponse } from "@/app/action/submit";
import {
  Search, ChevronDown, Check, X,
  ThumbsDown, MinusCircle, ThumbsUp, Star,
  ClipboardList, User, UserCheck, CheckCircle2,
  ArrowLeft, ArrowRight, Loader2, Send,
  Frown, Meh, Smile, Award,
} from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"], weight: ["400","500","700"],
  style: ["normal"], display: "swap", variable: "--pf-display",
});
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--pf-body" });

/* ─── Data ─────────────────────────────────────────────── */
const SKM_QUESTIONS = [
  { code:"U1", label:"Persyaratan",  text:"Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?" },
  { code:"U2", label:"Prosedur",     text:"Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?" },
  { code:"U3", label:"Waktu",        text:"Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?" },
  { code:"U4", label:"Biaya/Tarif",  text:"Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)" },
  { code:"U5", label:"Produk",       text:"Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?" },
  { code:"U6", label:"Kompetensi",   text:"Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?" },
  { code:"U7", label:"Perilaku",     text:"Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?" },
  { code:"U8", label:"Sarana",       text:"Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?" },
  { code:"U9", label:"Pengaduan",    text:"Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?" },
];

const SKM_OPTIONS = [
  { val:1, label:"Tidak Baik",  sublabel:"Sangat tidak puas",  icon:<Frown  className="w-5 h-5"/>, color:"#ef4444", lightBg:"rgba(239,68,68,0.12)",  border:"rgba(239,68,68,0.35)"  },
  { val:2, label:"Kurang Baik", sublabel:"Kurang memuaskan",   icon:<Meh    className="w-5 h-5"/>, color:"#f97316", lightBg:"rgba(249,115,22,0.12)", border:"rgba(249,115,22,0.35)" },
  { val:3, label:"Baik",        sublabel:"Cukup memuaskan",    icon:<Smile  className="w-5 h-5"/>, color:"#16a34a", lightBg:"rgba(22,163,74,0.12)",  border:"rgba(22,163,74,0.35)"  },
  { val:4, label:"Sangat Baik", sublabel:"Sangat memuaskan",   icon:<Award  className="w-5 h-5"/>, color:"#38bdf8", lightBg:"rgba(56,189,248,0.12)", border:"rgba(56,189,248,0.35)" },
];

const PENDIDIKAN = ["SD","SMP","SMA/SMK","D1/D2/D3","S1/D4","S2","S3"];
const PEKERJAAN  = ["PNS","PPPK","Outsourcing","TNI/Polri","Swasta","Wirausaha","Pelajar/Mahasiswa","Lainnya"];

const TOTAL_STEPS = 14;
const STEP_LABELS = [
  "Pilih Layanan","Data Diri","Pilih Pegawai",
  "Q1 · Persyaratan","Q2 · Prosedur","Q3 · Waktu","Q4 · Biaya",
  "Q5 · Produk","Q6 · Kompetensi","Q7 · Perilaku","Q8 · Sarana","Q9 · Pengaduan",
  "Rating Pegawai","Saran dan Kirim",
];

interface Layanan { id: string; nama: string }
interface Pegawai { id: string; nama: string }

/* ─── Star Rating ───────────────────────────────────────── */
function StarRating({ value, onChange }: { value:number; onChange:(v:number)=>void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["","Tidak Memuaskan","Kurang Memuaskan","Cukup","Memuaskan","Sangat Memuaskan"];
  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="flex items-center gap-3">
        {[1,2,3,4,5].map((star) => (
          <button key={star} type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform duration-150 hover:scale-110 focus:outline-none"
            aria-label={`${star} bintang`}
          >
            <Star className="w-12 h-12 transition-all duration-200"
              style={{
                color:  star <= (hovered||value) ? "#FAE705" : "#e2e8f0",
                fill:   star <= (hovered||value) ? "#FAE705" : "none",
                filter: star <= (hovered||value) ? "drop-shadow(0 0 6px #FAE70588)" : "none",
              }}
            />
          </button>
        ))}
      </div>
      <div className="text-center min-h-[48px] flex flex-col items-center justify-center">
        {(hovered||value) > 0 ? (
          <>
            <p className="text-3xl font-black text-white">{hovered||value}</p>
            <p className="text-sm font-semibold mt-1" style={{ color:"#FAE705", fontFamily:"var(--pf-body)" }}>
              {labels[hovered||value]}
            </p>
          </>
        ) : (
          <p className="text-sm font-medium" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.35)" }}>
            Ketuk bintang untuk memberi rating
          </p>
        )}
      </div>
      {value > 0 && (
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: s <= value ? 28 : 8, background: s <= value ? "#FAE705" : "#e2e8f0" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */
export default function PortalForm() {
  const [step,       setStep]       = useState(0);
  const [prevStep,   setPrevStep]   = useState(0);
  const [animKey,    setAnimKey]    = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [layananList, setLayananList]     = useState<Layanan[]>([]);
  const [pegawaiList, setPegawaiList]     = useState<Pegawai[]>([]);
  const [layananSearch, setLayananSearch] = useState("");
  const [searching, setSearching]         = useState(false);  // dot-loading state
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);

  const [nama,            setNama]            = useState("");
  const [tglLayanan,      setTglLayanan]      = useState(new Date().toISOString().split("T")[0]);
  const [usia,            setUsia]            = useState("");
  const [jenisKelamin,    setJenisKelamin]    = useState("");
  const [pendidikan,      setPendidikan]      = useState("");
  const [pekerjaan,       setPekerjaan]       = useState("");
  const [pekerjaanCustom, setPekerjaanCustom] = useState("");
  const [isDifabel,       setIsDifabel]       = useState("Tidak");
  const [jenisDisabilitas,setJenisDisabilitas]= useState("");
  const [pegawaiSearch,   setPegawaiSearch]   = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [employeeRating,  setEmployeeRating]  = useState(0);
  const [answers,         setAnswers]         = useState<Record<string,number>>({});
  const [saran,           setSaran]           = useState("");

  const contentRef  = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    fetch("/api/layanan").then(r=>r.json()).then(setLayananList);
    fetch("/api/pegawai").then(r=>r.json()).then(setPegawaiList);
  }, []);

  /* dot loading when typing search */
  const handleLayananSearch = (val: string) => {
    setLayananSearch(val);
    if (val.length > 0) {
      setSearching(true);
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => setSearching(false), 380);
    } else {
      setSearching(false);
    }
  };

  const filteredLayanan = layananSearch.length > 0
    ? layananList.filter(l => l.nama.toLowerCase().includes(layananSearch.toLowerCase()))
    : layananList;

  const filteredPegawai = pegawaiSearch.length > 1
    ? pegawaiList.filter(p => p.nama.toLowerCase().includes(pegawaiSearch.toLowerCase()))
    : [];

  const canProceed = () => {
    if (step === 0)  return !!selectedLayanan;
    if (step === 1)  return !!(nama && usia && jenisKelamin && pendidikan && pekerjaan && tglLayanan);
    if (step === 2)  return !!selectedPegawai;
    if (step >= 3 && step <= 11) return !!answers[`u${step-2}`];
    if (step === 12) return employeeRating > 0;
    return true;
  };

  const goTo = (nextStep: number) => {
    setPrevStep(step);
    setStep(nextStep);
    setAnimKey(k => k + 1);
    setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = 0; }, 50);
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
    fd.append("pekerjaan", pekerjaan === "Lainnya" ? pekerjaanCustom||"Lainnya" : pekerjaan);
    fd.append("isDifabel", isDifabel);
    fd.append("jenisDisabilitas", jenisDisabilitas);
    fd.append("rating", String(employeeRating||""));
    for (let i=1; i<=9; i++) fd.append(`u${i}`, String(answers[`u${i}`]||0));
    fd.append("saran", saran);
    await submitSkmResponse(fd);
  };

  const pct       = Math.round((step / (TOTAL_STEPS-1)) * 100);
  const isForward = step >= prevStep;

  /* shared input style — dark glass */
  const inputCls = [
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all",
    "text-white",
    "focus:ring-2",
  ].join(" ");
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  };
  const labelCls = "block text-[11px] font-bold tracking-[0.15em] uppercase mb-1.5";

  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen flex flex-col`}
      style={{ fontFamily:"var(--pf-body)", background:"#0d1b2a" }}
    >
      {/* ══ GLOBAL CSS ═══════════════════════════════════════ */}
      <style>{`
        /* ── Dark navy background ── */
        .portal-warm-bg {
          background: #0d1b2a;
        }

        /* ── Gradient accent bar ── */
        @keyframes gradBar {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .grad-bar {
          background: linear-gradient(-45deg, #FAE705, #38bdf8, #0d2d58, #FAE705);
          background-size: 300% 300%;
          animation: gradBar 6s ease infinite;
        }

        /* ── Step-in animations ── */
        @keyframes slideInR { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInL { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
        .anim-r   { animation: slideInR .32s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-l   { animation: slideInL .32s cubic-bezier(.22,.68,0,1.2) both; }
        .fade-up  { animation: fadeUp   .35s ease both; }

        /* ── Dot loading animation ── */
        @keyframes dotBounce {
          0%,80%,100% { transform:scale(.5); opacity:.3; }
          40%          { transform:scale(1);  opacity:1;  }
        }
        .dot { width:7px; height:7px; border-radius:50%; background:#FAE705; display:inline-block; animation: dotBounce 1.3s ease-in-out infinite; }
        .dot:nth-child(2) { animation-delay:.16s; }
        .dot:nth-child(3) { animation-delay:.32s; }

        /* ── Yellow arrow step badge ── */
        .step-arrow {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #FAE705;
          color: #0d1b2a;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: .04em;
          padding: 5px 18px 5px 12px;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
          white-space: nowrap;
        }

        /* ── Horizontal step stepper ── */
        .step-pip {
          width:24px; height:24px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:800; transition:all .25s;
          background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.30);
        }
        .step-pip.done    { background:rgba(34,197,94,0.80); color:white; }
        .step-pip.current { width:30px; height:30px; background:#FAE705; color:#0d1b2a; box-shadow:0 0 12px rgba(250,231,5,.40); }
        .step-connector   { flex:1; height:1px; background:rgba(255,255,255,0.08); min-width:4px; max-width:24px; }
        .step-connector.done { background:rgba(34,197,94,0.50); }

        /* ── Answer cards (dark glass) ── */
        .answer-card {
          display:flex; align-items:center; gap:14px;
          width:100%; text-align:left;
          padding:14px 18px; border-radius:14px;
          border:1.5px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04);
          cursor:pointer; transition:all .18s;
        }
        .answer-card:hover:not(.selected) { border-color:rgba(250,231,5,0.35); background:rgba(250,231,5,0.05); }
        .answer-card:active { transform:scale(.99); }
        .answer-card.selected { box-shadow:0 4px 20px rgba(0,0,0,.25); }

        /* ── Select dark option fix ── */
        .portal-sel { appearance:none; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.40)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:38px; }
        .portal-sel option { background:#0f2239; color:white; }

        /* ── Toggle ── */
        .tog { width:46px; height:24px; border-radius:12px; transition:background .2s; position:relative; cursor:pointer; flex-shrink:0; border:none; }
        .tog-thumb { position:absolute; top:2px; width:20px; height:20px; border-radius:50%; background:white; box-shadow:0 1px 4px rgba(0,0,0,.2); transition:transform .2s; }

        /* ── Gender btn ── */
        .gender-btn { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px; border:1.5px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.04); cursor:pointer; transition:all .18s; color:rgba(255,255,255,0.55); font-weight:600; font-size:14px; }
        .gender-btn:hover    { border-color:rgba(250,231,5,0.40); background:rgba(250,231,5,0.06); color:white; }
        .gender-btn.selected { border-color:#FAE705; background:rgba(250,231,5,0.10); color:#FAE705; }
        .gender-dot { width:15px; height:15px; border-radius:50%; border:2px solid rgba(255,255,255,0.20); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:border-color .2s; }
        .gender-btn.selected .gender-dot { border-color:#FAE705; }


        /* ── Nav buttons ── */
        .btn-back {
          display:flex; align-items:center; gap:6px;
          padding:11px 22px; border-radius:12px; font-size:13px; font-weight:700;
          border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.65);
          cursor:pointer; transition:all .18s;
        }
        .btn-back:hover { border-color:rgba(255,255,255,0.25); color:white; background:rgba(255,255,255,0.10); }
        .btn-next {
          flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
          padding:13px 24px; border-radius:12px; font-size:13px; font-weight:800;
          letter-spacing:.03em; border:none; cursor:pointer; transition:all .2s;
        }
        .btn-next:not(:disabled) {
          background: #FAE705;
          color: #0d1b2a;
          box-shadow: 0 4px 18px rgba(250,231,5,.20);
        }
        .btn-next:not(:disabled):hover {
          filter: brightness(0.95);
          box-shadow: 0 6px 28px rgba(250,231,5,.30);
          transform: translateY(-1px);
        }
        .btn-next:disabled { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.25); cursor:not-allowed; }

        /* ── Layanan dropdown ── */
        .lay-drop { background:#0f2239; border:1.5px solid rgba(250,231,5,0.35); border-radius:14px; overflow:hidden; box-shadow:0 12px 48px rgba(0,0,0,.40); }
        .lay-item { width:100%; text-align:left; padding:11px 18px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:10px; background:transparent; border:none; cursor:pointer; transition:background .12s,color .12s; color:rgba(255,255,255,0.70); }
        .lay-item:hover   { background:rgba(250,231,5,0.08); color:white; }
        .lay-item.active  { background:rgba(250,231,5,0.12); color:#FAE705; font-weight:700; }

        /* ── Progress dots ── */
        .pdot { height:7px; border-radius:4px; transition:all .35s; background:rgba(255,255,255,0.12); width:7px; }
        .pdot.done    { background:#22c55e; }
        .pdot.current { background:#FAE705; width:22px; box-shadow:0 0 8px rgba(250,231,5,.40); }

        /* ── Pegawai list ── */
        .peg-item { width:100%; text-align:left; padding:12px 18px; display:flex; align-items:center; gap:12px; background:transparent; border:none; cursor:pointer; transition:background .12s; color:rgba(255,255,255,0.70); font-size:13px; font-weight:600; }
        .peg-item:hover { background:rgba(250,231,5,0.07); color:white; }
      `}</style>

        {/* Orb A — yellow top-right */}
        <div className="pointer-events-none" style={{ position:"fixed", top:"-160px", right:"-160px", width:"500px", height:"500px", borderRadius:"50%", background:"rgba(250,231,5,0.07)", filter:"blur(150px)", zIndex:0 }} />
        {/* Orb B — cyan bottom-left */}
        <div className="pointer-events-none" style={{ position:"fixed", bottom:"-120px", left:"-120px", width:"450px", height:"450px", borderRadius:"50%", background:"rgba(56,189,248,0.08)", filter:"blur(140px)", zIndex:0 }} />
        {/* Dot grid */}
        <div className="pointer-events-none" style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize:"28px 28px", zIndex:0 }} />

        {/* ── Horizontal step stepper ─────────────────────── */}
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 pt-4 pb-3">
          {/* Desktop (md+): numbered circles + connectors */}
          <div className="hidden md:flex items-center justify-between">
            {STEP_LABELS.map((label, i) => {
              const done = i < step, cur = i === step;
              return (
                <Fragment key={i}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`step-pip ${cur ? "current" : done ? "done" : "pending"}`}
                      aria-label={`Langkah ${i+1}: ${label}${done?" (selesai)":cur?" (aktif)":""}`}>
                      {done ? <Check className="w-3 h-3"/> : i+1}
                    </div>
                    {cur && (
                      <span className="text-[9px] font-bold tracking-wide text-center max-w-[52px] leading-tight" style={{ color:"#FAE705", fontFamily:"var(--pf-body)" }}>
                        {label}
                      </span>
                    )}
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`step-connector ${i < step ? "done" : ""}`}/>
                  )}
                </Fragment>
              );
            })}
          </div>
          {/* Mobile: compact progress bar */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold tracking-[.15em] uppercase" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.45)" }}>
                Langkah {step+1} dari {TOTAL_STEPS}
              </p>
              <p className="text-[11px] font-semibold truncate max-w-[55%] text-right" style={{ fontFamily:"var(--pf-body)", color:"#FAE705" }}>
                {STEP_LABELS[step]}
              </p>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.10)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:"#FAE705", boxShadow:"0 0 8px rgba(250,231,5,0.5)" }}/>
            </div>
          </div>
        </div>

        {/* ── Card area — fills remaining height ──────────── */}
        <div className="relative z-10 flex-1 px-4 pb-4 max-w-5xl mx-auto w-full flex flex-col min-h-0">
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col min-h-0"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              {/* Card header */}
              <div className="px-6 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.12)", background:"#0d2d58" }}
                aria-live="polite" aria-atomic="true">
                <div>
                  <p className="text-[10px] font-black tracking-[.18em] uppercase mb-0.5" style={{ fontFamily:"var(--pf-body)", color:"rgba(250,231,5,0.8)" }}>
                    Langkah {step+1} dari {TOTAL_STEPS}
                  </p>
                  <p className="text-lg font-bold text-white" style={{ fontFamily:"var(--pf-display)" }}>
                    {STEP_LABELS[step]}
                  </p>
                </div>
              </div>

              {/* Scrollable content */}
              <div ref={contentRef} className="flex-1 overflow-y-auto p-6 min-h-0">
                <div key={animKey} className={isForward ? "anim-r" : "anim-l"}>

                  {/* ══ STEP 0: PILIH LAYANAN ═══════════════════ */}
                  {step === 0 && (
                    <div className="space-y-4 fade-up">
                      <p className="text-sm leading-relaxed" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.50)" }}>
                        Pilih layanan BKPSDM yang baru saja Anda gunakan.
                      </p>

                      {/* Inline search — same pattern as Pilih Pegawai */}
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(255,255,255,0.35)" }}/>
                        <input type="text" placeholder="Cari layanan..."
                          value={selectedLayanan ? selectedLayanan.nama : layananSearch}
                          onChange={e => { setSelectedLayanan(null); handleLayananSearch(e.target.value); }}
                          className={`${inputCls} pl-10`}
                          style={{ ...inputStyle, fontFamily:"var(--pf-body)" }}
                        />
                      </div>

                      {/* Dot loading */}
                      {searching && (
                        <div className="flex items-center gap-2.5 px-2 py-1">
                          <span className="dot"/><span className="dot"/><span className="dot"/>
                        </div>
                      )}

                      {/* Inline list */}
                      {!searching && !selectedLayanan && (
                        <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
                          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.03)" }}>
                            <p className="text-[10px] font-black uppercase tracking-wide" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}>
                              {layananSearch.length > 0 ? "Hasil Pencarian" : "Semua Layanan"}
                            </p>
                            <p className="text-[10px] font-bold" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.30)" }}>
                              {filteredLayanan.length} layanan
                            </p>
                          </div>
                          <div className="max-h-64 overflow-y-auto divide-y" style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.04)" }}>
                            {filteredLayanan.length === 0 ? (
                              <p className="px-5 py-4 text-xs font-medium" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.35)" }}>Tidak ditemukan</p>
                            ) : filteredLayanan.map((l, i) => (
                              <button key={l.id} type="button"
                                onClick={() => { setSelectedLayanan(l); setLayananSearch(""); }}
                                className="peg-item"
                                style={{ fontFamily:"var(--pf-body)" }}
                              >
                                <span className="text-xs w-5 shrink-0" style={{ color:"rgba(255,255,255,0.25)" }}>{i + 1}</span>
                                <div className="w-1 h-4 rounded-full shrink-0" style={{ background:"rgba(255,255,255,0.15)" }}/>
                                <span className="flex-1 text-left">{l.nama}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Selected confirmation */}
                      {selectedLayanan && (
                        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background:"rgba(250,231,5,0.08)", border:"1.5px solid rgba(250,231,5,0.30)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-5 rounded-full" style={{ background:"#FAE705" }}/>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wide" style={{ fontFamily:"var(--pf-body)", color:"#FAE705" }}>Layanan Terpilih</p>
                              <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--pf-body)" }}>{selectedLayanan.nama}</p>
                            </div>
                          </div>
                          <button type="button"
                            onClick={() => { setSelectedLayanan(null); setLayananSearch(""); }}
                            className="flex items-center gap-1 text-xs font-bold transition-colors"
                            style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}
                          >
                            <X className="w-3 h-3"/> Ganti
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ══ STEP 1: DATA DIRI ═══════════════════════ */}
                  {step === 1 && (
                    <div className="space-y-4 fade-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label htmlFor="f-nama" className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Nama Lengkap</label>
                          <input id="f-nama" type="text" value={nama} onChange={e=>setNama(e.target.value)}
                            placeholder="Nama Anda" className={inputCls}
                            style={{ ...inputStyle, fontFamily:"var(--pf-body)" }}
                          />
                        </div>
                        <div>
                          <label htmlFor="f-tgl" className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Tanggal Layanan</label>
                          <input id="f-tgl" type="date" value={tglLayanan} onChange={e=>setTglLayanan(e.target.value)}
                            className={`${inputCls} portal-sel`}
                            style={{ ...inputStyle, fontFamily:"var(--pf-body)", colorScheme:"dark" }}
                          />
                        </div>
                        <div>
                          <label htmlFor="f-usia" className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Usia</label>
                          <input id="f-usia" type="number" value={usia} onChange={e=>setUsia(e.target.value)}
                            placeholder="Tahun" min={1} max={120} className={inputCls}
                            style={{ ...inputStyle, fontFamily:"var(--pf-body)" }}
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div role="group" aria-labelledby="lbl-gender">
                        <p id="lbl-gender" className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Jenis Kelamin</p>
                        <div className="grid grid-cols-2 gap-3">
                          {["Laki-laki","Perempuan"].map(v => (
                            <button key={v} type="button"
                              onClick={() => setJenisKelamin(v)}
                              className={`gender-btn ${jenisKelamin===v?"selected":""}`}
                              style={{ fontFamily:"var(--pf-body)" }}
                            >
                              <div className="gender-dot">
                                {jenisKelamin===v && <div className="w-2 h-2 rounded-full" style={{ background:"#FAE705" }}/>}
                              </div>
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pendidikan */}
                      <div>
                        <label htmlFor="f-pendidikan" className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Pendidikan Terakhir</label>
                        <select id="f-pendidikan" value={pendidikan} onChange={e=>setPendidikan(e.target.value)}
                          className={`${inputCls} portal-sel`}
                          style={{ ...inputStyle, fontFamily:"var(--pf-body)", colorScheme:"dark" }}
                        >
                          <option value="">Pilih pendidikan terakhir...</option>
                          {PENDIDIKAN.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>

                      {/* Pekerjaan */}
                      <div>
                        <label htmlFor="f-pekerjaan" className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Pekerjaan</label>
                        <select id="f-pekerjaan" value={pekerjaan} onChange={e=>setPekerjaan(e.target.value)}
                          className={`${inputCls} portal-sel`}
                          style={{ ...inputStyle, fontFamily:"var(--pf-body)", colorScheme:"dark" }}
                        >
                          <option value="">Pilih pekerjaan...</option>
                          {PEKERJAAN.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        {pekerjaan === "Lainnya" && (
                          <input type="text" value={pekerjaanCustom}
                            onChange={e=>setPekerjaanCustom(e.target.value)}
                            placeholder="Sebutkan pekerjaan Anda"
                            className={`${inputCls} mt-2`}
                            style={{ ...inputStyle, fontFamily:"var(--pf-body)" }}
                          />
                        )}
                      </div>

                      {/* Difabel toggle */}
                      <div>
                        <label className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Penyandang Disabilitas?</label>
                        <div className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                          <button type="button" title="Toggle" className="tog"
                            style={{ background: isDifabel==="Ya" ? "#FAE705" : "rgba(255,255,255,0.12)" }}
                            onClick={() => setIsDifabel(isDifabel==="Ya"?"Tidak":"Ya")}
                          >
                            <div className="tog-thumb" style={{ transform: isDifabel==="Ya" ? "translateX(22px)" : "translateX(2px)" }}/>
                          </button>
                          <span className="text-sm font-semibold transition-colors" style={{ color: isDifabel==="Ya"?"#FAE705":"rgba(255,255,255,0.35)", fontFamily:"var(--pf-body)" }}>
                            {isDifabel==="Ya" ? "Ya, saya penyandang disabilitas" : "Tidak"}
                          </span>
                        </div>
                        {isDifabel === "Ya" && (
                          <input type="text" value={jenisDisabilitas}
                            onChange={e=>setJenisDisabilitas(e.target.value)}
                            placeholder="Jenis disabilitas (contoh: Tuna Netra)"
                            className={`${inputCls} mt-2`}
                            style={{ ...inputStyle, fontFamily:"var(--pf-body)" }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* ══ STEP 2: PILIH PEGAWAI ═══════════════════ */}
                  {step === 2 && (
                    <div className="space-y-4 fade-up">
                      <p className="text-sm leading-relaxed" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.50)" }}>
                        Cari dan pilih nama pegawai yang melayani Anda.
                      </p>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"rgba(255,255,255,0.35)" }}/>
                        <input type="text" placeholder="Ketik nama pegawai..."
                          value={selectedPegawai ? selectedPegawai.nama : pegawaiSearch}
                          onChange={e => { setSelectedPegawai(null); setPegawaiSearch(e.target.value); }}
                          className={`${inputCls} pl-10`}
                          style={{ ...inputStyle, fontFamily:"var(--pf-body)" }}
                        />
                      </div>
                      {(() => {
                        const list = pegawaiSearch.length>1 ? filteredPegawai : pegawaiList;
                        if (selectedPegawai) return null;
                        if (pegawaiSearch.length > 1 && list.length === 0) return (
                          <div className="rounded-xl px-5 py-4" style={{ border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)" }}>
                            <p className="text-xs font-medium" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.35)" }}>
                              Tidak ada pegawai yang cocok dengan pencarian &ldquo;{pegawaiSearch}&rdquo;
                            </p>
                          </div>
                        );
                        return list.length > 0 ? (
                          <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(250,231,5,0.25)" }}>
                            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom:"1px solid rgba(250,231,5,0.15)", background:"rgba(250,231,5,0.05)" }}>
                              <p className="text-[10px] font-black uppercase tracking-wide" style={{ fontFamily:"var(--pf-body)", color:"rgba(250,231,5,0.70)" }}>
                                {pegawaiSearch.length>0 ? "Hasil Pencarian" : "Semua Pegawai"}
                              </p>
                              <p className="text-[10px] font-bold" style={{ fontFamily:"var(--pf-body)", color:"rgba(250,231,5,0.55)" }}>{list.length} Pegawai</p>
                            </div>
                            <div className="max-h-60 overflow-y-auto divide-y" style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.04)" }}>
                              {list.map((p, i) => (
                                <button key={p.id} type="button"
                                  onClick={() => { setSelectedPegawai(p); setPegawaiSearch(""); }}
                                  className="peg-item"
                                  style={{ fontFamily:"var(--pf-body)" }}
                                >
                                  <span className="text-xs w-4 shrink-0" style={{ color:"rgba(255,255,255,0.25)" }}>{i+1}</span>
                                  <div className="w-1 h-4 rounded-full shrink-0" style={{ background:"rgba(255,255,255,0.15)" }}/>
                                  {p.nama}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                      {selectedPegawai && (
                        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl" style={{ background:"rgba(250,231,5,0.08)", border:"1.5px solid rgba(250,231,5,0.30)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-5 rounded-full" style={{ background:"#FAE705" }}/>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wide" style={{ fontFamily:"var(--pf-body)", color:"#FAE705" }}>Pegawai Terpilih</p>
                              <p className="text-sm font-bold text-white" style={{ fontFamily:"var(--pf-body)" }}>{selectedPegawai.nama}</p>
                            </div>
                          </div>
                          <button type="button"
                            onClick={() => { setSelectedPegawai(null); setPegawaiSearch(""); }}
                            className="flex items-center gap-1 text-xs font-bold transition-colors"
                            style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}
                          >
                            <X className="w-3 h-3"/> Ganti
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ══ STEPS 3–11: SKM QUESTIONS ═══════════════ */}
                  {step >= 3 && step <= 11 && (
                    <div className="space-y-6 fade-up">
                      {/* Question heading */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide" style={{ background:"#0d2d58", color:"#FAE705", fontFamily:"var(--pf-body)" }}>
                            {SKM_QUESTIONS[step-3].code}
                          </span>
                          <span className="text-[10px] font-bold tracking-[.18em] uppercase" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}>
                            Unsur {step-2} dari 9 · {SKM_QUESTIONS[step-3].label}
                          </span>
                        </div>
                        <p className="text-base font-semibold leading-relaxed text-white" style={{ fontFamily:"var(--pf-display)" }}>
                          {SKM_QUESTIONS[step-3].text}
                        </p>
                      </div>

                      {/* Answer cards — horizontal compact rows */}
                      <div className="space-y-2.5">
                        {SKM_OPTIONS.map(opt => {
                          const key     = `u${step-2}`;
                          const selected = answers[key] === opt.val;
                          return (
                            <button key={opt.val} type="button"
                              onClick={() => setAnswers(a => ({ ...a, [key]: opt.val }))}
                              className={`answer-card ${selected?"selected":""}`}
                              style={{
                                borderColor:  selected ? opt.color : "rgba(255,255,255,0.10)",
                                background:   selected ? opt.lightBg : "rgba(255,255,255,0.04)",
                                boxShadow:    selected ? `0 0 0 1px ${opt.border}, 0 4px 16px ${opt.color}18` : "none",
                              }}
                            >
                              {/* Number */}
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0 transition-all"
                                style={{
                                  background: selected ? opt.color : "rgba(255,255,255,0.10)",
                                  color: selected ? "white" : "rgba(255,255,255,0.35)",
                                }}
                              >
                                {opt.val}
                              </div>
                              {/* Icon */}
                              <span className="shrink-0 transition-colors" style={{ color: selected ? opt.color : "#cbd5e1" }}>
                                {opt.icon}
                              </span>
                              {/* Label block */}
                              <div className="flex-1">
                                <p className="text-sm font-bold transition-colors" style={{ color: selected?"#0d1b2a":"rgba(255,255,255,0.80)", fontFamily:"var(--pf-body)" }}>
                                  {opt.label}
                                </p>
                                <p className="text-xs mt-0.5 transition-colors" style={{ color: selected ? opt.color : "rgba(255,255,255,0.35)", fontFamily:"var(--pf-body)" }}>
                                  {opt.sublabel}
                                </p>
                              </div>
                              {/* Checkmark */}
                              {selected && (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: opt.color }}>
                                  <Check className="w-3 h-3 text-white"/>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Progress dots */}
                      <div className="flex items-center gap-1.5 justify-center pt-1">
                        {SKM_QUESTIONS.map((_, i) => (
                          <div key={i} className={`pdot ${i===step-3?"current":answers[`u${i+1}`]?"done":""}`}/>
                        ))}
                      </div>
                      <p className="text-center text-xs font-semibold" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.35)" }}>
                        {Object.keys(answers).length} dari 9 pertanyaan dijawab
                      </p>
                    </div>
                  )}

                  {/* ══ STEP 12: RATING PEGAWAI ═════════════════ */}
                  {step === 12 && selectedPegawai && (
                    <div className="space-y-5 fade-up">
                      <div className="flex items-center gap-4 px-4 py-4 rounded-xl" style={{ background:"rgba(250,231,5,0.08)", border:"1.5px solid rgba(250,231,5,0.25)" }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-base font-black"
                          style={{ background:"linear-gradient(-45deg,#FAE705,#fbbf24)", color:"#0d1b2a" }}
                        >
                          {selectedPegawai.nama.split(" ").map((w:string)=>w[0]).slice(0,2).join("").toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide" style={{ fontFamily:"var(--pf-body)", color:"#FAE705" }}>Pegawai yang Melayani</p>
                          <p className="text-base font-bold text-white" style={{ fontFamily:"var(--pf-display)" }}>{selectedPegawai.nama}</p>
                          <p className="text-xs mt-0.5" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}>Semua 9 unsur SKM telah dijawab ✓</p>
                        </div>
                      </div>
                      <p className="text-sm text-center font-medium" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.45)" }}>
                        Berikan rating kepuasan Anda terhadap pegawai yang melayani
                      </p>
                      <StarRating value={employeeRating} onChange={setEmployeeRating}/>
                    </div>
                  )}

                  {/* ══ STEP 13: SARAN & SUBMIT ═════════════════ */}
                  {step === 13 && (
                    <div className="space-y-5 fade-up">
                      <div>
                        <label className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Saran dan Masukan (Opsional)</label>
                        <textarea value={saran} onChange={e=>setSaran(e.target.value)}
                          placeholder="Tuliskan saran atau masukan Anda..."
                          title="Saran dan Masukan"
                          className={`${inputCls} resize-none min-h-[100px]`}
                          style={{ ...inputStyle, fontFamily:"var(--pf-body)" }}
                        />
                      </div>

                      {/* Summary card */}
                      <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
                        <div className="px-5 py-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.03)" }}>
                          <p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}>Ringkasan Survei</p>
                        </div>
                        {[
                          { icon:<ClipboardList className="w-4 h-4"/>, label:"Layanan",   val: selectedLayanan?.nama },
                          { icon:<User          className="w-4 h-4"/>, label:"Responden", val: `${nama} · ${usia} thn · ${jenisKelamin}` },
                          { icon:<UserCheck     className="w-4 h-4"/>, label:"Pegawai",   val: selectedPegawai?.nama },
                        ].map(({ icon, label, val }) => (
                          <div key={label} className="px-5 py-3 flex items-start gap-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                            <span className="shrink-0 mt-0.5" style={{ color:"#FAE705" }}>{icon}</span>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wide mb-0.5" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}>{label}</p>
                              <p className="text-sm font-semibold text-white" style={{ fontFamily:"var(--pf-body)" }}>{val}</p>
                            </div>
                          </div>
                        ))}

                        {/* SKM grid */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color:"#FAE705" }}/>
                            <p className="text-[10px] font-black uppercase tracking-wide" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.40)" }}>Penilaian 9 Unsur</p>
                            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ fontFamily:"var(--pf-body)", background:"rgba(34,197,94,0.12)", color:"#4ade80" }}>
                              {Object.keys(answers).length}/9
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {SKM_QUESTIONS.map((q, i) => {
                              const val = answers[`u${i+1}`];
                              const opt = SKM_OPTIONS.find(o => o.val === val);
                              return (
                                <div key={q.code} className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                                  style={{ background: val ? `${opt?.lightBg}15` : "rgba(255,255,255,0.03)", border:`1px solid ${val ? `${opt?.border}40` : "rgba(255,255,255,0.06)"}` }}
                                >
                                  <span style={{ color: opt ? opt.color : "#cbd5e1" }} className="shrink-0">
                                    {opt ? <span className="[&>svg]:w-3 [&>svg]:h-3">{opt.icon}</span> : <MinusCircle className="w-3 h-3"/>}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.50)" }}>{q.code}</p>
                                    <p className="text-[10px] truncate" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.35)" }}>{q.label}</p>
                                  </div>
                                  {val && <span className="ml-auto text-xs font-black shrink-0" style={{ color:opt?.color }}>{val}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <button onClick={handleSubmit} disabled={submitting}
                        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all"
                        style={{
                          background: submitting ? "rgba(255,255,255,0.06)" : "#FAE705",
                          color: submitting ? "rgba(255,255,255,0.30)" : "#0d1b2a",
                          boxShadow: submitting ? "none" : "0 6px 24px rgba(250,231,5,.20)",
                          fontFamily:"var(--pf-body)",
                          cursor: submitting ? "not-allowed" : "pointer",
                        }}
                      >
                        {submitting
                          ? <><Loader2 className="w-4 h-4 animate-spin"/> Mengirim Data...</>
                          : <><Send className="w-4 h-4"/> Kirim Survei Kepuasan</>
                        }
                      </button>
                      <p className="text-center text-xs font-medium" style={{ fontFamily:"var(--pf-body)", color:"rgba(255,255,255,0.30)" }}>
                        Data survei bersifat rahasia dan hanya untuk evaluasi mutu pelayanan
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Navigation footer — pinned inside card */}
              {step < 13 && (
                <div className="shrink-0 px-6 py-4 flex gap-3"
                  style={{ borderTop:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)" }}>
                  {step > 0 && (
                    <button onClick={handleBack} className="btn-back" style={{ fontFamily:"var(--pf-body)" }}>
                      <ArrowLeft className="w-3.5 h-3.5"/> Kembali
                    </button>
                  )}
                  <button onClick={handleNext} disabled={!canProceed()} className="btn-next" style={{ fontFamily:"var(--pf-body)" }}>
                    {step === 11 ? "Lanjut ke Rating Pegawai"
                     : step === 12 ? "Lanjut ke Saran dan Kirim"
                     : "Lanjut"
                    }
                    <ArrowRight className="w-3.5 h-3.5"/>
                  </button>
                </div>
              )}
            </div>
          </div>

    </div>
  );
}
