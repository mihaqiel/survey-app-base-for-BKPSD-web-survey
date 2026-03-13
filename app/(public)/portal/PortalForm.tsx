"use client";

import { useEffect, useState, useRef } from "react";
import { submitSkmResponse } from "@/app/action/submit";

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

const OPTIONS = [
  { val: 1, label: "Tidak Baik",   emoji: "😞", color: "#ef4444" },
  { val: 2, label: "Kurang Baik",  emoji: "😐", color: "#f97316" },
  { val: 3, label: "Baik",         emoji: "😊", color: "#22c55e" },
  { val: 4, label: "Sangat Baik",  emoji: "😄", color: "#009CC5" },
];

const PENDIDIKAN = ["SD","SMP","SMA/SMK","D1/D2/D3","S1/D4","S2","S3"];
const PEKERJAAN  = ["PNS","PPPK","Outsourcing","TNI/Polri","Swasta","Wirausaha","Pelajar/Mahasiswa","Lainnya"];

const TOTAL_STEPS = 13;
const STEP_LABELS = [
  "Pilih Layanan","Data Diri","Pilih Pegawai",
  "Q1 · Persyaratan","Q2 · Prosedur","Q3 · Waktu",
  "Q4 · Biaya","Q5 · Produk","Q6 · Kompetensi",
  "Q7 · Perilaku","Q8 · Sarana","Q9 · Pengaduan",
  "Saran & Kirim",
];

interface Layanan { id: string; nama: string; }
interface Pegawai { id: string; nama: string; }

function StepBadge({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-[#FAE705] flex items-center justify-center shrink-0 animate-bounce-in">
        <span className="text-sm font-black text-[#132B4F]">{step + 1}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5]">
            Langkah {step + 1} dari {total}
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{pct}%</p>
        </div>
        <div className="h-1.5 bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#009CC5] to-[#FAE705] transition-all duration-500 ease-out progress-bar"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function PortalForm() {
  const [step, setStep]               = useState(0);
  const [prevStep, setPrevStep]       = useState(0);
  const [animKey, setAnimKey]         = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [layananSearch, setLayananSearch] = useState("");
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);
  const [nama, setNama]               = useState("");
  const [tglLayanan, setTglLayanan]   = useState(new Date().toISOString().split("T")[0]);
  const [usia, setUsia]               = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [pendidikan, setPendidikan]   = useState("");
  const [pekerjaan, setPekerjaan]     = useState("");
  const [pekerjaanCustom, setPekerjaanCustom] = useState("");
  const [isDifabel, setIsDifabel]     = useState("Tidak");
  const [jenisDisabilitas, setJenisDisabilitas] = useState("");
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [answers, setAnswers]         = useState<Record<string, number>>({});
  const [saran, setSaran]             = useState("");
  const contentRef                    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/layanan").then((r) => r.json()).then(setLayananList);
    fetch("/api/pegawai").then((r) => r.json()).then(setPegawaiList);
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
    return true;
  };

  const goTo = (nextStep: number) => {
    setPrevStep(step);
    setStep(nextStep);
    setAnimKey((k) => k + 1);
    // scroll to top of content
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleNext = () => { if (canProceed()) goTo(step + 1); };
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
    fd.append("pekerjaan", pekerjaan === "Lainnya" ? pekerjaanCustom || "Lainnya" : pekerjaan);
    fd.append("isDifabel", isDifabel);
    fd.append("jenisDisabilitas", jenisDisabilitas);
    for (let i = 1; i <= 9; i++) fd.append(`u${i}`, String(answers[`u${i}`] || 0));
    fd.append("saran", saran);
    await submitSkmResponse(fd);
  };

  const isForward = step >= prevStep;
  const slideIn  = isForward ? "animate-slide-right" : "animate-slide-left";

  const inputCls = "input-glow w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200 hover:border-gray-300";
  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2";

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
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FAE705]">Tahapan Survei</p>
            </div>
            <div className="p-2 space-y-0.5">
              {STEP_LABELS.map((label, i) => {
                const done    = i < step;
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
                    <div className={`w-4 h-4 flex items-center justify-center shrink-0 text-[8px] font-black transition-all duration-200 ${
                      current ? "bg-[#132B4F] text-[#FAE705]"
                      : done   ? "bg-[#009CC5] text-white"
                      :          "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? "✓" : i + 1}
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
          <div className="bg-white border border-gray-200 overflow-hidden">

            {/* STEP TITLE BAR */}
            <div className="bg-[#132B4F] px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FAE705] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-[#132B4F]">{step + 1}</span>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#009CC5]">Langkah {step + 1}</p>
                <p className="text-sm font-black uppercase tracking-widest text-white">{STEP_LABELS[step]}</p>
              </div>
            </div>

            {/* STEP CONTENT — animated transition */}
            <div ref={contentRef} className="p-6 sm:p-8">
              <div key={animKey} className={`${slideIn}`}>

                {/* STEP 0: PILIH LAYANAN */}
                {step === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-500 mb-5 leading-relaxed">
                      Pilih layanan BKPSDM yang baru saja Anda gunakan.
                    </p>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Cari layanan..."
                        value={layananSearch}
                        onChange={(e) => setLayananSearch(e.target.value)}
                        className="input-glow w-full pl-10 pr-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200"
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 border border-gray-200">
                      {filteredLayanan.length === 0 ? (
                        <p className="px-5 py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Tidak ditemukan</p>
                      ) : filteredLayanan.map((l) => {
                        const selected = selectedLayanan?.id === l.id;
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => setSelectedLayanan(l)}
                            className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center gap-3 transition-all duration-150 ${
                              selected
                                ? "bg-[#132B4F] text-white"
                                : "text-[#132B4F] hover:bg-[#F0F4F8]"
                            }`}
                          >
                            <div className={`w-1 h-4 shrink-0 transition-colors ${selected ? "bg-[#FAE705]" : "bg-gray-200"}`} />
                            {l.nama}
                            {selected && <span className="ml-auto text-[#FAE705] text-xs font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 1: DATA DIRI */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Nama Lengkap</label>
                        <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} title="Nama Lengkap" placeholder="Nama Anda" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Tanggal Layanan</label>
                        <input type="date" value={tglLayanan} onChange={(e) => setTglLayanan(e.target.value)} title="Tanggal Layanan" placeholder="Tanggal Layanan" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Usia</label>
                        <input type="number" value={usia} onChange={(e) => setUsia(e.target.value)} title="Usia" placeholder="Tahun" min={1} max={120} className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Jenis Kelamin</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Laki-laki","Perempuan"].map((v) => (
                          <button key={v} type="button" onClick={() => setJenisKelamin(v)}
                            className={`survey-option py-3 border-2 text-center text-sm font-black uppercase tracking-widest transition-all duration-200 ${jenisKelamin === v ? "selected bg-[#132B4F] border-[#132B4F] text-white" : "border-gray-200 text-gray-400 hover:border-[#009CC5]"}`}>
                            {v === "Laki-laki" ? "👨 " : "👩 "}{v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Pendidikan Terakhir</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {PENDIDIKAN.map((v) => (
                          <button key={v} type="button" onClick={() => setPendidikan(v)}
                            className={`survey-option py-2.5 border-2 text-center text-xs font-black uppercase tracking-widest transition-all duration-200 ${pendidikan === v ? "selected bg-[#132B4F] border-[#132B4F] text-white" : "border-gray-200 text-gray-400 hover:border-[#009CC5]"}`}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Pekerjaan</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PEKERJAAN.map((v) => (
                          <button key={v} type="button" onClick={() => setPekerjaan(v)}
                            className={`survey-option py-2.5 border-2 text-center text-xs font-black uppercase tracking-widest transition-all duration-200 ${pekerjaan === v ? "selected bg-[#132B4F] border-[#132B4F] text-white" : "border-gray-200 text-gray-400 hover:border-[#009CC5]"}`}>
                            {v}
                          </button>
                        ))}
                      </div>
                      {pekerjaan === "Lainnya" && (
                        <input type="text" value={pekerjaanCustom} onChange={(e) => setPekerjaanCustom(e.target.value)}
                          placeholder="Sebutkan pekerjaan Anda" className={`${inputCls} mt-2 animate-fade-down`} />
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Difabel?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Tidak","Ya"].map((v) => (
                          <button key={v} type="button" onClick={() => setIsDifabel(v)}
                            className={`survey-option py-3 border-2 text-center text-sm font-black uppercase tracking-widest transition-all duration-200 ${isDifabel === v ? "selected bg-[#132B4F] border-[#132B4F] text-white" : "border-gray-200 text-gray-400 hover:border-[#009CC5]"}`}>
                            {v}
                          </button>
                        ))}
                      </div>
                      {isDifabel === "Ya" && (
                        <input type="text" value={jenisDisabilitas} onChange={(e) => setJenisDisabilitas(e.target.value)}
                          placeholder="Jenis disabilitas" className={`${inputCls} mt-2 animate-fade-down`} />
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
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                      </svg>
                      <input type="text" placeholder="Ketik nama pegawai..."
                        value={selectedPegawai ? selectedPegawai.nama : pegawaiSearch}
                        onChange={(e) => { setSelectedPegawai(null); setPegawaiSearch(e.target.value); }}
                        className="input-glow w-full pl-10 pr-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200"
                      />
                    </div>

                    {(() => {
                      const list = pegawaiSearch.length > 1 ? filteredPegawai : pegawaiList;
                      return list.length > 0 && !selectedPegawai ? (
                        <div className="border border-gray-200 overflow-hidden">
                          <div className="bg-[#132B4F] px-4 py-2.5 flex items-center justify-between">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white">
                              {pegawaiSearch.length > 0 ? "Hasil Pencarian" : "Semua Pegawai"}
                            </p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">{list.length} Pegawai</p>
                          </div>
                          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                            {list.map((p, i) => (
                              <button key={p.id} type="button"
                                onClick={() => { setSelectedPegawai(p); setPegawaiSearch(""); }}
                                className="w-full text-left px-5 py-3.5 text-sm font-bold text-[#132B4F] hover:bg-[#F0F4F8] flex items-center gap-4 transition-all duration-150 group"
                              >
                                <span className="text-[10px] font-black text-gray-300 w-5 shrink-0">{i + 1}</span>
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
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Pegawai Terpilih</p>
                            <p className="text-sm font-black text-white">{selectedPegawai.nama}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setSelectedPegawai(null); setPegawaiSearch(""); }}
                          className="text-[10px] font-black text-white/40 hover:text-[#FAE705] uppercase tracking-widest transition-colors">
                          ✕ Ganti
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEPS 3–11: QUESTIONS — enhanced option cards */}
                {step >= 3 && step <= 11 && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#009CC5] flex items-center justify-center shrink-0 text-white font-black text-xs">
                        {SKM_QUESTIONS[step - 3].code}
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] mb-1">
                          {SKM_QUESTIONS[step - 3].label}
                        </p>
                        <p className="text-base font-bold leading-relaxed text-[#132B4F]">
                          {SKM_QUESTIONS[step - 3].text}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {OPTIONS.map((opt, i) => {
                        const key      = `u${step - 2}`;
                        const selected = answers[key] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setAnswers((a) => ({ ...a, [key]: opt.val }))}
                            style={{ animationDelay: `${i * 60}ms` }}
                            className={`survey-option animate-fade-up py-5 border-2 text-center transition-all duration-200 focus:outline-none ${
                              selected
                                ? "border-[#132B4F] bg-[#132B4F]"
                                : "border-gray-200 hover:border-[#009CC5] bg-white"
                            } ${selected ? "selected" : ""}`}
                          >
                            <span className="block text-2xl mb-1">{opt.emoji}</span>
                            <span className={`block text-xl font-black ${selected ? "text-white" : "text-gray-400"}`}>
                              {opt.val}
                            </span>
                            <span className={`block text-[9px] font-black uppercase tracking-widest mt-1 ${selected ? "text-[#FAE705]" : "text-gray-400"}`}>
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
                            i === step - 3   ? "w-5 bg-[#009CC5]"
                            : answers[`u${i + 1}`] ? "w-3 bg-[#132B4F]"
                            :                  "w-1.5 bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 12: SARAN & SUBMIT */}
                {step === 12 && (
                  <div className="space-y-6">
                    <div>
                      <label className={labelCls}>Saran & Masukan (Opsional)</label>
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
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">Ringkasan Survei</p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {[
                          { icon: "📋", label: "Layanan",    val: selectedLayanan?.nama },
                          { icon: "👤", label: "Responden",  val: `${nama} · ${usia} thn · ${jenisKelamin}` },
                          { icon: "👨‍💼", label: "Pegawai",    val: selectedPegawai?.nama },
                          { icon: "✅", label: "Penilaian",  val: `${Object.keys(answers).length} dari 9 unsur dijawab` },
                        ].map((row, i) => (
                          <div
                            key={row.label}
                            className="px-5 py-3 flex items-start gap-4 animate-fade-up"
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            <span className="text-sm">{row.icon}</span>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{row.label}</p>
                              <p className="text-sm font-bold text-[#132B4F]">{row.val}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn-shimmer w-full py-5 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(19,43,79,0.25)] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Mengirim Data...
                        </>
                      ) : (
                        <span className="flex items-center gap-2 group">
                          Kirim Survei Kepuasan
                          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </span>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Data survei bersifat rahasia dan hanya untuk evaluasi mutu pelayanan
                    </p>
                  </div>
                )}

                {/* NAVIGATION */}
                {step < 12 && (
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                    {step > 0 && (
                      <button
                        onClick={handleBack}
                        className="btn-shimmer px-6 py-3.5 bg-[#F0F4F8] text-[#132B4F] font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
                      >
                        ← Kembali
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="btn-shimmer flex-1 py-3.5 bg-[#132B4F] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#009CC5] hover:shadow-[0_6px_20px_rgba(19,43,79,0.2)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 active:scale-[0.98] group"
                    >
                      <span className="flex items-center justify-center gap-1">
                        {step === 11 ? "Lanjut ke Saran" : "Lanjut"}
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 group-disabled:translate-x-0">→</span>
                      </span>
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