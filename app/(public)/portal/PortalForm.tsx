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
    color: "#3b82f6",
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

// Steps: 0=pilih layanan, 1=data diri, 2=pilih pegawai, 3-11=SKM Q1-Q9, 12=rating pegawai, 13=saran & kirim
const TOTAL_STEPS = 14;
const STEP_LABELS = [
  "Pilih Layanan",
  "Data Diri",
  "Pilih Pegawai",
  "Q1 · Persyaratan",
  "Q2 · Prosedur",
  "Q3 · Waktu",
  "Q4 · Biaya",
  "Q5 · Produk",
  "Q6 · Kompetensi",
  "Q7 · Perilaku",
  "Q8 · Sarana",
  "Q9 · Pengaduan",
  "Rating Pegawai",
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

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";
const labelClass = "block text-xs font-semibold text-slate-500 mb-2";

function StepBadge({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-white">{step + 1}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-slate-500">
            Langkah {step + 1} dari {total}
          </p>
          <p className="text-xs font-semibold text-slate-400">{pct}%</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
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
                color: star <= (hovered || value) ? "#f59e0b" : "#e2e8f0",
                fill: star <= (hovered || value) ? "#f59e0b" : "none",
              }}
            />
          </button>
        ))}
      </div>
      <div className="text-center">
        {(hovered || value) > 0 ? (
          <div>
            <p className="text-3xl font-bold text-slate-900">
              {hovered || value}
            </p>
            <p className="text-sm font-semibold text-blue-600 mt-1">
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
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: s <= value ? "28px" : "8px",
                backgroundColor: s <= value ? "#3b82f6" : "#e2e8f0",
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
    if (step >= 3 && step <= 11) return !!answers[`u${step - 2}`];
    if (step === 12) return employeeRating > 0;
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

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* STICKY PROGRESS HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <StepBadge step={step} total={TOTAL_STEPS} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 flex gap-6 items-start">
        {/* SIDEBAR STEPPER */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-28">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-slate-500">
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
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      current
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : done
                          ? "text-slate-600"
                          : "text-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 flex items-center justify-center shrink-0 text-xs font-semibold rounded-md ${
                        current
                          ? "bg-blue-600 text-white"
                          : done
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {done ? <Check className="w-3 h-3" /> : i + 1}
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* STEP TITLE BAR */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-600">
                  {step + 1}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Langkah {step + 1}
                </p>
                <p className="text-sm font-bold text-slate-900">
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
                    <p className="text-sm font-medium text-slate-500 mb-5 leading-relaxed">
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
                        className={`w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border rounded-lg text-left cursor-pointer select-none transition-all ${
                          layananOpen
                            ? "border-blue-300 ring-2 ring-blue-100"
                            : selectedLayanan
                              ? "border-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <ClipboardList
                          className={`w-4 h-4 shrink-0 ${selectedLayanan ? "text-blue-600" : "text-gray-400"}`}
                        />
                        <span
                          className={`flex-1 text-sm font-medium truncate ${selectedLayanan ? "text-slate-900" : "text-gray-400"}`}
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
                        <div className="absolute z-20 w-full top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <input
                                type="text"
                                placeholder="Cari layanan..."
                                value={layananSearch}
                                onChange={(e) =>
                                  setLayananSearch(e.target.value)
                                }
                                autoFocus
                                className="flex-1 text-sm font-medium text-slate-900 placeholder-gray-400 bg-transparent outline-none"
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
                              <p className="px-5 py-4 text-xs text-gray-400 font-medium">
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
                                    className={`w-full text-left px-5 py-3.5 text-sm font-medium flex items-center gap-3 transition-all ${
                                      selected
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-900 hover:bg-gray-50"
                                    }`}
                                  >
                                    <div
                                      className={`w-1 h-4 rounded-full shrink-0 transition-colors ${selected ? "bg-blue-600" : "bg-gray-200"}`}
                                    />
                                    <span className="flex-1">{l.nama}</span>
                                    {selected && (
                                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-medium text-gray-400">
                              {filteredLayanan.length} layanan tersedia
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedLayanan && (
                      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-500">
                            Layanan Terpilih
                          </p>
                          <p className="text-sm font-bold text-slate-900">
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
                        <label className={labelClass}>Nama Lengkap</label>
                        <input
                          type="text"
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          title="Nama Lengkap"
                          placeholder="Nama Anda"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Tanggal Layanan</label>
                        <input
                          type="date"
                          value={tglLayanan}
                          onChange={(e) => setTglLayanan(e.target.value)}
                          title="Tanggal Layanan"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Usia</label>
                        <input
                          type="number"
                          value={usia}
                          onChange={(e) => setUsia(e.target.value)}
                          title="Usia"
                          placeholder="Tahun"
                          min={1}
                          max={120}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* RADIO BUTTON for gender */}
                    <div>
                      <label className={labelClass}>
                        Jenis Kelamin <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Laki-laki", "Perempuan"].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setJenisKelamin(v)}
                            className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all ${
                              jenisKelamin === v
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "border-gray-200 text-slate-500 hover:border-blue-200"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                jenisKelamin === v
                                  ? "border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {jenisKelamin === v && (
                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <span className="text-sm font-semibold">
                              {v}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Pendidikan Terakhir</label>
                      <div className="relative">
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={pendidikan}
                          onChange={(e) => setPendidikan(e.target.value)}
                          title="Pendidikan Terakhir"
                          className={`${inputClass} pr-10 appearance-none cursor-pointer`}
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
                      <label className={labelClass}>Pekerjaan</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={pekerjaan}
                          onChange={(e) => setPekerjaan(e.target.value)}
                          title="Pekerjaan"
                          className={`${inputClass} pl-10 pr-10 appearance-none cursor-pointer`}
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
                          className={`${inputClass} mt-2`}
                        />
                      )}
                    </div>

                    {/* SWITCH for difabel */}
                    <div>
                      <label className={labelClass}>
                        Penyandang Disabilitas?
                      </label>
                      <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg">
                        <button
                          type="button"
                          role="button"
                          title="Toggle Disabilitas"
                          onClick={() =>
                            setIsDifabel(isDifabel === "Ya" ? "Tidak" : "Ya")
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                            isDifabel === "Ya" ? "bg-blue-600" : "bg-gray-300"
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
                          className={`text-sm font-medium transition-colors ${
                            isDifabel === "Ya"
                              ? "text-blue-600"
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
                          className={`${inputClass} mt-2`}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: PILIH PEGAWAI */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-500 mb-5 leading-relaxed">
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
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                    {(() => {
                      const list =
                        pegawaiSearch.length > 1
                          ? filteredPegawai
                          : pegawaiList;
                      return list.length > 0 && !selectedPegawai ? (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-gray-50/50 px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                            <p className="text-xs font-semibold text-slate-500">
                              {pegawaiSearch.length > 0
                                ? "Hasil Pencarian"
                                : "Semua Pegawai"}
                            </p>
                            <p className="text-xs font-semibold text-blue-600">
                              {list.length} Pegawai
                            </p>
                          </div>
                          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                            {list.map((p, i) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPegawai(p);
                                  setPegawaiSearch("");
                                }}
                                className="w-full text-left px-5 py-3.5 text-sm font-medium text-slate-900 hover:bg-gray-50 flex items-center gap-4 transition-all group"
                              >
                                <span className="text-xs font-medium text-gray-300 w-5 shrink-0">
                                  {i + 1}
                                </span>
                                <div className="w-1 h-4 rounded-full bg-gray-200 group-hover:bg-blue-400 shrink-0 transition-colors" />
                                {p.nama}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    {selectedPegawai && (
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-5 bg-blue-600 rounded-full" />
                          <div>
                            <p className="text-xs font-semibold text-blue-500 mb-0.5">
                              Pegawai Terpilih
                            </p>
                            <p className="text-sm font-bold text-slate-900">
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
                          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" /> Ganti
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEPS 3–11: SKM QUESTIONS */}
                {step >= 3 && step <= 11 && (
                  <div className="space-y-6">
                    {/* Question header */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm">
                        {SKM_QUESTIONS[step - 3].code}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                          Unsur {step - 2} dari 9 · {SKM_QUESTIONS[step - 3].label}
                        </p>
                        <p className="text-base font-semibold leading-relaxed text-slate-900">
                          {SKM_QUESTIONS[step - 3].text}
                        </p>
                      </div>
                    </div>

                    {/* Answer options — 2-col on mobile, 4-col on sm+ */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SKM_OPTIONS.map((opt) => {
                        const key = `u${step - 2}`;
                        const selected = answers[key] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() =>
                              setAnswers((a) => ({ ...a, [key]: opt.val }))
                            }
                            className={`relative py-6 border-2 rounded-xl text-center transition-all focus:outline-none active:scale-95 ${
                              selected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 hover:border-blue-200 bg-white hover:shadow-sm"
                            }`}
                          >
                            {selected && (
                              <span className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                            <span
                              className="flex justify-center mb-2"
                              style={{ color: selected ? opt.color : "#d1d5db" }}
                            >
                              {opt.icon}
                            </span>
                            <span
                              className={`block text-2xl font-black mb-0.5 ${selected ? "text-blue-700" : "text-gray-300"}`}
                            >
                              {opt.val}
                            </span>
                            <span
                              className={`block text-xs font-semibold ${selected ? "text-blue-600" : "text-gray-400"}`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center gap-2 justify-center pt-2">
                      {SKM_QUESTIONS.map((q, i) => {
                        const isCurrent = i === step - 3;
                        const isDone = !!answers[`u${i + 1}`];
                        return (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div
                              className={`rounded-full transition-all duration-300 ${
                                isCurrent
                                  ? "w-6 h-2 bg-blue-600"
                                  : isDone
                                    ? "w-2 h-2 bg-green-500"
                                    : "w-2 h-2 bg-gray-200"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-center text-xs text-gray-400 font-medium">
                      {Object.keys(answers).length} dari 9 pertanyaan dijawab
                    </p>
                  </div>
                )}

                {/* STEP 12: RATING PEGAWAI */}
                {step === 12 && selectedPegawai && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-xl px-5 py-4 mb-2">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 text-base font-bold text-white shadow-sm">
                        {selectedPegawai.nama
                          .split(" ")
                          .map((w: string) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-500">
                          Pegawai yang Melayani
                        </p>
                        <p className="text-base font-bold text-slate-900">
                          {selectedPegawai.nama}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Semua 9 unsur SKM telah dijawab ✓
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 text-center leading-relaxed">
                      Berikan rating kepuasan Anda terhadap pegawai yang
                      melayani
                    </p>
                    <StarRating
                      value={employeeRating}
                      onChange={setEmployeeRating}
                    />
                  </div>
                )}

                {/* STEP 13: SARAN & SUBMIT */}
                {step === 13 && (
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>
                        Saran & Masukan (Opsional)
                      </label>
                      <textarea
                        value={saran}
                        onChange={(e) => setSaran(e.target.value)}
                        placeholder="Tuliskan saran atau masukan Anda untuk perbaikan layanan ini..."
                        title="Saran dan Masukan"
                        className={`${inputClass} resize-none min-h-[120px]`}
                      />
                    </div>

                    {/* Summary */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-slate-500">
                          Ringkasan Survei
                        </p>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {/* Layanan */}
                        <div className="px-5 py-3 flex items-start gap-4">
                          <span className="text-blue-600 mt-0.5 shrink-0">
                            <ClipboardList className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-400">Layanan</p>
                            <p className="text-sm font-semibold text-slate-900">{selectedLayanan?.nama}</p>
                          </div>
                        </div>
                        {/* Responden */}
                        <div className="px-5 py-3 flex items-start gap-4">
                          <span className="text-blue-600 mt-0.5 shrink-0">
                            <User className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-400">Responden</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {nama} · {usia} thn · {jenisKelamin}
                            </p>
                          </div>
                        </div>
                        {/* Pegawai */}
                        <div className="px-5 py-3 flex items-start gap-4">
                          <span className="text-blue-600 mt-0.5 shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-400">Pegawai</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {selectedPegawai?.nama} ·{" "}
                              {employeeRating > 0
                                ? Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className="inline w-3 h-3"
                                      style={{
                                        color: i < employeeRating ? "#f59e0b" : "#e2e8f0",
                                        fill: i < employeeRating ? "#f59e0b" : "none",
                                      }}
                                    />
                                  ))
                                : "—"}
                            </p>
                          </div>
                        </div>
                        {/* U1-U9 answers grid */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-blue-600 shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                            <p className="text-xs font-semibold text-slate-400">
                              Penilaian 9 Unsur SKM
                            </p>
                            <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              {Object.keys(answers).length}/9 dijawab
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {SKM_QUESTIONS.map((q, i) => {
                              const val = answers[`u${i + 1}`];
                              const opt = SKM_OPTIONS.find((o) => o.val === val);
                              return (
                                <div
                                  key={q.code}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                    val
                                      ? "border-gray-100 bg-gray-50"
                                      : "border-dashed border-gray-200 bg-white"
                                  }`}
                                >
                                  <span
                                    className="shrink-0"
                                    style={{ color: opt ? opt.color : "#d1d5db" }}
                                  >
                                    {opt ? (
                                      <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">
                                        {opt.icon}
                                      </span>
                                    ) : (
                                      <MinusCircle className="w-3.5 h-3.5 text-gray-300" />
                                    )}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-500 leading-none">
                                      {q.code}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{q.label}</p>
                                  </div>
                                  {val && (
                                    <span
                                      className="ml-auto text-xs font-black shrink-0"
                                      style={{ color: opt?.color }}
                                    >
                                      {val}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-4 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengirim Data...
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> Kirim Survei Kepuasan
                        </span>
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-400 font-medium">
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
                        className="flex items-center gap-1.5 px-6 py-3 bg-gray-50 text-slate-600 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex-1 py-3 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all group flex items-center justify-center gap-1.5"
                    >
                      {step === 11
                        ? "Lanjut ke Rating Pegawai"
                        : step === 12
                          ? "Lanjut ke Saran & Kirim"
                          : "Lanjut"}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 group-disabled:translate-x-0" />
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
