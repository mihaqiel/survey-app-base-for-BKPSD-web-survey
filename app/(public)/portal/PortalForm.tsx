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
} from "lucide-react";

const SKM_QUESTIONS = [
  {
    code: "U1",
    label: "Persyaratan",
    text: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?",
  },
  {
    code: "U2",
    label: "Prosedur",
    text: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?",
  },
  {
    code: "U3",
    label: "Waktu",
    text: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?",
  },
  {
    code: "U4",
    label: "Biaya/Tarif",
    text: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)",
  },
  {
    code: "U5",
    label: "Produk",
    text: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?",
  },
  {
    code: "U6",
    label: "Kompetensi",
    text: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?",
  },
  {
    code: "U7",
    label: "Perilaku",
    text: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?",
  },
  {
    code: "U8",
    label: "Sarana",
    text: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?",
  },
  {
    code: "U9",
    label: "Pengaduan",
    text: "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?",
  },
];

const SKM_OPTIONS = [
  {
    val: 1,
    label: "Tidak Baik",
    icon: <ThumbsDown className="w-6 h-6" />,
    color: "#ef4444",
  },
  {
    val: 2,
    label: "Kurang Baik",
    icon: <MinusCircle className="w-6 h-6" />,
    color: "#f97316",
  },
  {
    val: 3,
    label: "Baik",
    icon: <ThumbsUp className="w-6 h-6" />,
    color: "#22c55e",
  },
  {
    val: 4,
    label: "Sangat Baik",
    icon: <Star className="w-6 h-6" />,
    color: "#009CC5",
  },
];

const PENDIDIKAN = ["SD", "SMP", "SMA/SMK", "D1/D2/D3", "S1/D4", "S2", "S3"];
const PEKERJAAN = [
  "PNS",
  "PPPK",
  "Outsourcing",
  "TNI/Polri",
  "Swasta",
  "Wirausaha",
  "Pelajar/Mahasiswa",
  "Lainnya",
];

// Steps: 0=pilih layanan, 1=data diri, 2=pilih pegawai, 3=rating pegawai, 4-12=SKM Q1-Q9, 13=saran & kirim
const TOTAL_STEPS = 14;
const STEP_LABELS = [
  "Pilih Layanan",
  "Data Diri",
  "Pilih Pegawai",
  "Rating Pegawai",
  "Q1 · Persyaratan",
  "Q2 · Prosedur",
  "Q3 · Waktu",
  "Q4 · Biaya",
  "Q5 · Produk",
  "Q6 · Kompetensi",
  "Q7 · Perilaku",
  "Q8 · Sarana",
  "Q9 · Pengaduan",
  "Saran & Kirim",
];

interface Layanan {
  id: string;
  nama: string;
}
interface Pegawai {
  id: string;
  nama: string;
}

function StepBadge({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-[#FAE705] flex items-center justify-center shrink-0">
        <span className="text-sm font-black text-[#132B4F]">{step + 1}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5]">
            Langkah {step + 1} dari {total}
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            {pct}%
          </p>
        </div>
        <div className="h-1.5 bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#009CC5] to-[#FAE705] transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Star Rating component for employee rating step
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const labels = [
    "",
    "Tidak Memuaskan",
    "Kurang Memuaskan",
    "Cukup",
    "Memuaskan",
    "Sangat Memuaskan",
  ];

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform duration-150 hover:scale-110 focus:outline-none"
            aria-label={`${star} bintang`}
          >
            <Star
              className="w-12 h-12 transition-colors duration-150"
              style={{
                color: star <= (hovered || value) ? "#FAE705" : "#e2e8f0",
                fill: star <= (hovered || value) ? "#FAE705" : "none",
              }}
            />
          </button>
        ))}
      </div>
      <div className="text-center">
        {(hovered || value) > 0 ? (
          <div className="animate-fade-up">
            <p className="text-3xl font-black text-[#132B4F]">
              {hovered || value}
            </p>
            <p className="text-sm font-bold text-[#009CC5] mt-1">
              {labels[hovered || value]}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 font-medium">
            Ketuk bintang untuk memberi rating
          </p>
        )}
      </div>
      {value > 0 && (
        <div className="flex items-center gap-2 animate-fade-up">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: s <= value ? "28px" : "8px",
                backgroundColor: s <= value ? "#009CC5" : "#e2e8f0",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortalForm() {
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Data state
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [layananOpen, setLayananOpen] = useState(false);
  const [layananSearch, setLayananSearch] = useState("");
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);
  const [nama, setNama] = useState("");
  const [tglLayanan, setTglLayanan] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [usia, setUsia] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [pekerjaanCustom, setPekerjaanCustom] = useState("");
  const [isDifabel, setIsDifabel] = useState("Tidak");
  const [jenisDisabilitas, setJenisDisabilitas] = useState("");
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [employeeRating, setEmployeeRating] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saran, setSaran] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/layanan")
      .then((r) => r.json())
      .then(setLayananList);
    fetch("/api/pegawai")
      .then((r) => r.json())
      .then(setPegawaiList);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setLayananOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredLayanan =
    layananSearch.length > 0
      ? layananList.filter((l) =>
          l.nama.toLowerCase().includes(layananSearch.toLowerCase()),
        )
      : layananList;

  const filteredPegawai =
    pegawaiSearch.length > 1
      ? pegawaiList.filter((p) =>
          p.nama.toLowerCase().includes(pegawaiSearch.toLowerCase()),
        )
      : [];

  const canProceed = () => {
    if (step === 0) return !!selectedLayanan;
    if (step === 1)
      return !!(
        nama &&
        usia &&
        jenisKelamin &&
        pendidikan &&
        pekerjaan &&
        tglLayanan
      );
    if (step === 2) return !!selectedPegawai;
    if (step === 3) return employeeRating > 0; // rating step — required
    if (step >= 4 && step <= 12) return !!answers[`u${step - 3}`];
    return true;
  };

  const goTo = (nextStep: number) => {
    setPrevStep(step);
    setStep(nextStep);
    setAnimKey((k) => k + 1);
    setTimeout(
      () =>
        contentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50,
    );
  };

  const handleNext = () => {
    if (canProceed()) goTo(step + 1);
  };
  const handleBack = () => goTo(step - 1);

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
    fd.append(
      "pekerjaan",
      pekerjaan === "Lainnya" ? pekerjaanCustom || "Lainnya" : pekerjaan,
    );
    fd.append("isDifabel", isDifabel);
    fd.append("jenisDisabilitas", jenisDisabilitas);
    fd.append("rating", String(employeeRating || ""));
    for (let i = 1; i <= 9; i++)
      fd.append(`u${i}`, String(answers[`u${i}`] || 0));
    fd.append("saran", saran);
    await submitSkmResponse(fd);
  };

  const isForward = step >= prevStep;
  const slideIn = isForward ? "animate-slide-right" : "animate-slide-left";

  const inputCls =
    "input-glow w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200 hover:border-gray-300";
  const labelCls =
    "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2";

  return (
    <div className="bg-[#F0F4F8] min-h-screen">
      {/* STICKY PROGRESS HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b-4 border-[#009CC5] shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <StepBadge step={step} total={TOTAL_STEPS} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 flex gap-6 items-start">
        {/* SIDEBAR STEPPER */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-28 animate-slide-left">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="bg-[#132B4F] px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FAE705]">
                Tahapan Survei
              </p>
            </div>
            <div className="p-2 space-y-0.5">
              {STEP_LABELS.map((label, i) => {
                const done = i < step;
                const current = i === step;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold transition-all duration-200 ${
                      current
                        ? "bg-[#FAE705] text-[#132B4F]"
                        : done
                          ? "text-[#009CC5]"
                          : "text-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 flex items-center justify-center shrink-0 text-[8px] font-black ${
                        current
                          ? "bg-[#132B4F] text-[#FAE705]"
                          : done
                            ? "bg-[#009CC5] text-white"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
                    </div>
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200">
            {/* STEP TITLE BAR */}
            <div className="bg-[#132B4F] px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FAE705] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-[#132B4F]">
                  {step + 1}
                </span>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#009CC5]">
                  Langkah {step + 1}
                </p>
                <p className="text-sm font-black uppercase tracking-widest text-white">
                  {STEP_LABELS[step]}
                </p>
              </div>
            </div>

            {/* STEP CONTENT */}
            <div ref={contentRef} className="p-6 sm:p-8">
              <div key={animKey} className={slideIn}>
                {/* STEP 0: PILIH LAYANAN */}
                {step === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-500 mb-5 leading-relaxed">
                      Pilih layanan BKPSDM yang baru saja Anda gunakan.
                    </p>
                    <div ref={dropdownRef} className="relative">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setLayananOpen((o) => !o)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setLayananOpen((o) => !o)
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3.5 bg-[#F0F4F8] border-2 text-left cursor-pointer select-none transition-all duration-200 ${
                          layananOpen
                            ? "border-[#009CC5]"
                            : selectedLayanan
                              ? "border-[#132B4F]"
                              : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <ClipboardList
                          className={`w-4 h-4 shrink-0 ${selectedLayanan ? "text-[#009CC5]" : "text-gray-400"}`}
                        />
                        <span
                          className={`flex-1 text-sm font-bold truncate ${selectedLayanan ? "text-[#132B4F]" : "text-gray-400"}`}
                        >
                          {selectedLayanan
                            ? selectedLayanan.nama
                            : "Pilih layanan..."}
                        </span>
                        {selectedLayanan && (
                          <button
                            type="button"
                            title="Hapus pilihan"
                            aria-label="Hapus pilihan layanan"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLayanan(null);
                              setLayananSearch("");
                            }}
                            className="p-0.5 hover:text-red-500 text-gray-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${layananOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                      {layananOpen && (
                        <div className="absolute z-20 w-full top-full mt-1 bg-white border border-gray-200 shadow-lg animate-fade-down">
                          <div className="p-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 bg-[#F0F4F8] px-3 py-2">
                              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <input
                                type="text"
                                placeholder="Cari layanan..."
                                value={layananSearch}
                                onChange={(e) =>
                                  setLayananSearch(e.target.value)
                                }
                                autoFocus
                                className="flex-1 text-sm font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none"
                              />
                              {layananSearch && (
                                <button
                                  type="button"
                                  title="Hapus pencarian"
                                  aria-label="Hapus pencarian"
                                  onClick={() => setLayananSearch("")}
                                >
                                  <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                            {filteredLayanan.length === 0 ? (
                              <p className="px-5 py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Tidak ditemukan
                              </p>
                            ) : (
                              filteredLayanan.map((l) => {
                                const selected = selectedLayanan?.id === l.id;
                                return (
                                  <button
                                    key={l.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedLayanan(l);
                                      setLayananOpen(false);
                                      setLayananSearch("");
                                    }}
                                    className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center gap-3 transition-all duration-150 ${
                                      selected
                                        ? "bg-[#132B4F] text-white"
                                        : "text-[#132B4F] hover:bg-[#F0F4F8]"
                                    }`}
                                  >
                                    <div
                                      className={`w-1 h-4 shrink-0 transition-colors ${selected ? "bg-[#FAE705]" : "bg-gray-200"}`}
                                    />
                                    <span className="flex-1">{l.nama}</span>
                                    {selected && (
                                      <Check className="w-3.5 h-3.5 text-[#FAE705] shrink-0" />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {filteredLayanan.length} layanan tersedia
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedLayanan && (
                      <div className="animate-fade-up flex items-center gap-3 bg-[#132B4F] px-4 py-3">
                        <Check className="w-4 h-4 text-[#FAE705] shrink-0" />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                            Layanan Terpilih
                          </p>
                          <p className="text-sm font-black text-white">
                            {selectedLayanan.nama}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1: DATA DIRI */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Nama Lengkap</label>
                        <input
                          type="text"
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          title="Nama Lengkap"
                          placeholder="Nama Anda"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Tanggal Layanan</label>
                        <input
                          type="date"
                          value={tglLayanan}
                          onChange={(e) => setTglLayanan(e.target.value)}
                          title="Tanggal Layanan"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Usia</label>
                        <input
                          type="number"
                          value={usia}
                          onChange={(e) => setUsia(e.target.value)}
                          title="Usia"
                          placeholder="Tahun"
                          min={1}
                          max={120}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* RADIO BUTTON for gender */}
                    <div>
                      <label className={labelCls}>
                        Jenis Kelamin <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Laki-laki", "Perempuan"].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setJenisKelamin(v)}
                            className={`survey-option flex items-center gap-3 px-4 py-3.5 border-2 transition-all duration-200 ${
                              jenisKelamin === v
                                ? "selected bg-[#132B4F] border-[#132B4F] text-white"
                                : "border-gray-200 text-gray-500 hover:border-[#009CC5]"
                            }`}
                          >
                            {/* Radio circle */}
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                jenisKelamin === v
                                  ? "border-[#FAE705]"
                                  : "border-gray-300"
                              }`}
                            >
                              {jenisKelamin === v && (
                                <div className="w-2 h-2 rounded-full bg-[#FAE705]" />
                              )}
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">
                              {v}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Pendidikan Terakhir</label>
                      <div className="relative">
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={pendidikan}
                          onChange={(e) => setPendidikan(e.target.value)}
                          title="Pendidikan Terakhir"
                          className="input-glow w-full px-4 pr-10 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] outline-none appearance-none transition-all duration-200 hover:border-gray-300 cursor-pointer"
                        >
                          <option value="">Pilih pendidikan terakhir...</option>
                          {PENDIDIKAN.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Pekerjaan</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={pekerjaan}
                          onChange={(e) => setPekerjaan(e.target.value)}
                          title="Pekerjaan"
                          className="input-glow w-full pl-10 pr-10 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] outline-none appearance-none transition-all duration-200 hover:border-gray-300 cursor-pointer"
                        >
                          <option value="">Pilih pekerjaan...</option>
                          {PEKERJAAN.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {pekerjaan === "Lainnya" && (
                        <input
                          type="text"
                          value={pekerjaanCustom}
                          onChange={(e) => setPekerjaanCustom(e.target.value)}
                          placeholder="Sebutkan pekerjaan Anda"
                          className={`${inputCls} mt-2 animate-fade-down`}
                        />
                      )}
                    </div>

                    {/* SWITCH for difabel */}
                    <div>
                      <label className={labelCls}>
                        Penyandang Disabilitas?
                      </label>
                      <div className="flex items-center gap-4 py-3 px-4 bg-[#F0F4F8]">
                        {/* Switch toggle */}
                        <button
                          type="button"
                          role="button"
                          title="Toggle Disabilitas"
                          onClick={() =>
                            setIsDifabel(isDifabel === "Ya" ? "Tidak" : "Ya")
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                            isDifabel === "Ya" ? "bg-[#009CC5]" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                              isDifabel === "Ya"
                                ? "translate-x-6"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-sm font-black uppercase tracking-widest transition-colors ${
                            isDifabel === "Ya"
                              ? "text-[#009CC5]"
                              : "text-gray-400"
                          }`}
                        >
                          {isDifabel === "Ya"
                            ? "Ya, saya penyandang disabilitas"
                            : "Tidak"}
                        </span>
                      </div>
                      {isDifabel === "Ya" && (
                        <input
                          type="text"
                          value={jenisDisabilitas}
                          onChange={(e) => setJenisDisabilitas(e.target.value)}
                          placeholder="Jenis disabilitas (contoh: Tuna Netra)"
                          className={`${inputCls} mt-2 animate-fade-down`}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: PILIH PEGAWAI */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-500 mb-5 leading-relaxed">
                      Cari dan pilih nama pegawai yang melayani Anda.
                    </p>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ketik nama pegawai..."
                        value={
                          selectedPegawai ? selectedPegawai.nama : pegawaiSearch
                        }
                        onChange={(e) => {
                          setSelectedPegawai(null);
                          setPegawaiSearch(e.target.value);
                        }}
                        className="input-glow w-full pl-10 pr-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200"
                      />
                    </div>
                    {(() => {
                      const list =
                        pegawaiSearch.length > 1
                          ? filteredPegawai
                          : pegawaiList;
                      return list.length > 0 && !selectedPegawai ? (
                        <div className="border border-gray-200 overflow-hidden">
                          <div className="bg-[#132B4F] px-4 py-2.5 flex items-center justify-between">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white">
                              {pegawaiSearch.length > 0
                                ? "Hasil Pencarian"
                                : "Semua Pegawai"}
                            </p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">
                              {list.length} Pegawai
                            </p>
                          </div>
                          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                            {list.map((p, i) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPegawai(p);
                                  setPegawaiSearch("");
                                }}
                                className="w-full text-left px-5 py-3.5 text-sm font-bold text-[#132B4F] hover:bg-[#F0F4F8] flex items-center gap-4 transition-all duration-150 group"
                              >
                                <span className="text-[10px] font-black text-gray-300 w-5 shrink-0">
                                  {i + 1}
                                </span>
                                <div className="w-1 h-4 bg-gray-200 group-hover:bg-[#009CC5] shrink-0 transition-colors" />
                                {p.nama}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    {selectedPegawai && (
                      <div className="animate-bounce-in flex items-center justify-between bg-[#132B4F] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-5 bg-[#FAE705]" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">
                              Pegawai Terpilih
                            </p>
                            <p className="text-sm font-black text-white">
                              {selectedPegawai.nama}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPegawai(null);
                            setPegawaiSearch("");
                          }}
                          className="flex items-center gap-1 text-[10px] font-black text-white/40 hover:text-[#FAE705] uppercase tracking-widest transition-colors"
                        >
                          <X className="w-3 h-3" /> Ganti
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: RATING PEGAWAI — NEW */}
                {step === 3 && selectedPegawai && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-[#F0F4F8] px-4 py-3 mb-2">
                      <div className="w-10 h-10 bg-[#132B4F] flex items-center justify-center shrink-0 text-sm font-black text-[#FAE705]">
                        {selectedPegawai.nama
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Pegawai yang Melayani
                        </p>
                        <p className="text-sm font-black text-[#132B4F]">
                          {selectedPegawai.nama}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 text-center leading-relaxed">
                      Berikan rating kepuasan Anda terhadap pegawai yang
                      melayani
                    </p>
                    <StarRating
                      value={employeeRating}
                      onChange={setEmployeeRating}
                    />
                  </div>
                )}

                {/* STEPS 4–12: SKM QUESTIONS */}
                {step >= 4 && step <= 12 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#009CC5] flex items-center justify-center shrink-0 text-white font-black text-xs">
                        {SKM_QUESTIONS[step - 4].code}
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] mb-1">
                          {SKM_QUESTIONS[step - 4].label}
                        </p>
                        <p className="text-base font-bold leading-relaxed text-[#132B4F]">
                          {SKM_QUESTIONS[step - 4].text}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SKM_OPTIONS.map((opt, i) => {
                        const key = `u${step - 3}`;
                        const selected = answers[key] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() =>
                              setAnswers((a) => ({ ...a, [key]: opt.val }))
                            }
                            style={{ animationDelay: `${i * 60}ms` }}
                            className={`survey-option animate-fade-up py-5 border-2 text-center transition-all duration-200 focus:outline-none ${
                              selected
                                ? "border-[#132B4F] bg-[#132B4F] selected"
                                : "border-gray-200 hover:border-[#009CC5] bg-white"
                            }`}
                          >
                            <span
                              className={`flex justify-center mb-1 ${selected ? "text-[#FAE705]" : "text-gray-300"}`}
                            >
                              {opt.icon}
                            </span>
                            <span
                              className={`block text-xl font-black ${selected ? "text-white" : "text-gray-400"}`}
                            >
                              {opt.val}
                            </span>
                            <span
                              className={`block text-[9px] font-black uppercase tracking-widest mt-1 ${selected ? "text-[#FAE705]" : "text-gray-400"}`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Progress dots */}
                    <div className="flex items-center gap-1.5 justify-center pt-2">
                      {SKM_QUESTIONS.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === step - 4
                              ? "w-5 bg-[#009CC5]"
                              : answers[`u${i + 1}`]
                                ? "w-3 bg-[#132B4F]"
                                : "w-1.5 bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 13: SARAN & SUBMIT */}
                {step === 13 && (
                  <div className="space-y-6">
                    <div>
                      <label className={labelCls}>
                        Saran & Masukan (Opsional)
                      </label>
                      <textarea
                        value={saran}
                        onChange={(e) => setSaran(e.target.value)}
                        placeholder="Tuliskan saran atau masukan Anda untuk perbaikan layanan ini..."
                        title="Saran dan Masukan"
                        className="input-glow w-full px-4 py-4 bg-[#F0F4F8] border-2 border-transparent text-sm font-medium text-[#132B4F] placeholder-gray-300 outline-none resize-none min-h-[120px] transition-all duration-200"
                      />
                    </div>

                    {/* Summary */}
                    <div className="border border-gray-200 overflow-hidden">
                      <div className="bg-[#132B4F] px-5 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">
                          Ringkasan Survei
                        </p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {[
                          {
                            icon: <ClipboardList className="w-4 h-4" />,
                            label: "Layanan",
                            val: selectedLayanan?.nama,
                          },
                          {
                            icon: <User className="w-4 h-4" />,
                            label: "Responden",
                            val: `${nama} · ${usia} thn · ${jenisKelamin}`,
                          },
                          {
                            icon: <UserCheck className="w-4 h-4" />,
                            label: "Pegawai",
                            val: `${selectedPegawai?.nama} · ${employeeRating > 0 ? `${employeeRating}★` : "—"}`,
                          },
                          {
                            icon: <CheckCircle2 className="w-4 h-4" />,
                            label: "Penilaian",
                            val: `${Object.keys(answers).length} dari 9 unsur dijawab`,
                          },
                        ].map((row, i) => (
                          <div
                            key={row.label}
                            className="px-5 py-3 flex items-start gap-4 animate-fade-up"
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            <span className="text-[#009CC5] mt-0.5 shrink-0">
                              {row.icon}
                            </span>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                {row.label}
                              </p>
                              <p className="text-sm font-bold text-[#132B4F]">
                                {row.val}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn-shimmer w-full py-5 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <>
                          {/* Busy indicator — dots */}
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-white/60"
                                style={{
                                  animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                                }}
                              />
                            ))}
                          </div>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengirim Data...
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> Kirim Survei Kepuasan
                        </span>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Data survei bersifat rahasia dan hanya untuk evaluasi mutu
                      pelayanan
                    </p>
                  </div>
                )}

                {/* NAVIGATION */}
                {step < 13 && (
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                    {step > 0 && (
                      <button
                        onClick={handleBack}
                        className="btn-shimmer flex items-center gap-1.5 px-6 py-3.5 bg-[#F0F4F8] text-[#132B4F] font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="btn-shimmer flex-1 py-3.5 bg-[#132B4F] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#009CC5] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] group flex items-center justify-center gap-1.5"
                    >
                      {step === 12 ? "Lanjut ke Saran" : "Lanjut"}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 group-disabled:translate-x-0" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
