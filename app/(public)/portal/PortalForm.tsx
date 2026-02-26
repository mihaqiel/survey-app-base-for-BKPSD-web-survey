"use client";

import { useEffect, useState } from "react";
import { submitSkmResponse } from "@/app/action/submit";

const SKM_QUESTIONS = [
  { code: "U1", label: "Persyaratan", text: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?" },
  { code: "U2", label: "Prosedur", text: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?" },
  { code: "U3", label: "Waktu", text: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?" },
  { code: "U4", label: "Biaya/Tarif", text: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)" },
  { code: "U5", label: "Produk", text: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?" },
  { code: "U6", label: "Kompetensi", text: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?" },
  { code: "U7", label: "Perilaku", text: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?" },
  { code: "U8", label: "Sarana", text: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?" },
  { code: "U9", label: "Pengaduan", text: "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?" },
];

const OPTIONS = [
  { val: 1, label: "Tidak Baik" },
  { val: 2, label: "Kurang Baik" },
  { val: 3, label: "Baik" },
  { val: 4, label: "Sangat Baik" },
];

const PENDIDIKAN = ["SD", "SMP", "SMA/SMK", "D1/D2/D3", "S1/D4", "S2", "S3"];
const PEKERJAAN = ["PNS","PPPK", "Outsourcing", "TNI/Polri", "Swasta", "Wirausaha", "Pelajar/Mahasiswa", "Lainnya"];

const TOTAL_STEPS = 13;
const STEP_LABELS = [
  "Pilih Layanan", "Data Diri", "Pilih Pegawai",
  "Q1 · Persyaratan", "Q2 · Prosedur", "Q3 · Waktu",
  "Q4 · Biaya", "Q5 · Produk", "Q6 · Kompetensi",
  "Q7 · Perilaku", "Q8 · Sarana", "Q9 · Pengaduan",
  "Saran & Kirim",
];

interface Layanan { id: string; nama: string; }
interface Pegawai { id: string; nama: string; }

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
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{pct}%</p>
        </div>
        <div className="h-1 bg-gray-100 overflow-hidden">
          <div className="h-full bg-[#009CC5] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function PortalForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [layananSearch, setLayananSearch] = useState("");
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);
  const [nama, setNama] = useState("");
  const [tglLayanan, setTglLayanan] = useState(new Date().toISOString().split("T")[0]);
  const [usia, setUsia] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [pekerjaanCustom, setPekerjaanCustom] = useState("");
  const [isDifabel, setIsDifabel] = useState("Tidak");
  const [jenisDisabilitas, setJenisDisabilitas] = useState("");
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saran, setSaran] = useState("");

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
    if (step === 0) return !!selectedLayanan;
    if (step === 1) return !!(nama && usia && jenisKelamin && pendidikan && pekerjaan && tglLayanan);
    if (step === 2) return !!selectedPegawai;
    if (step >= 3 && step <= 11) return !!answers[`u${step - 2}`];
    return true;
  };

  const handleNext = () => { if (canProceed()) setStep((s) => s + 1); };
  const handleBack = () => setStep((s) => s - 1);

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

  const inputCls = "w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors";
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
        <aside className="hidden lg:block w-52 shrink-0 sticky top-28">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="bg-[#132B4F] px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FAE705]">Tahapan Survei</p>
            </div>
            <div className="p-2 space-y-0.5">
              {STEP_LABELS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={i} className={`flex items-center gap-2.5 px-3 py-2 transition-colors ${active ? "bg-[#009CC5]" : done ? "bg-[#F0F4F8]" : ""}`}>
                    <div className={`w-5 h-5 flex items-center justify-center shrink-0 text-[9px] font-black ${
                      active ? "bg-white text-[#009CC5]" : done ? "bg-[#132B4F] text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[10px] font-bold truncate ${active ? "text-white" : done ? "text-[#132B4F]" : "text-gray-300"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MAIN CARD */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 overflow-hidden">

            {/* CARD HEADER */}
            <div className="bg-[#132B4F] px-8 py-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-6 bg-[#FAE705]" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
                  {step >= 3 && step <= 11 ? `Unsur Penilaian ${SKM_QUESTIONS[step - 3].code}` : "Survei Kepuasan Masyarakat"}
                </p>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">{STEP_LABELS[step]}</h2>
              {step >= 3 && step <= 11 && (
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{SKM_QUESTIONS[step - 3].label}</p>
              )}
            </div>
            <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5]" />

            {/* CARD BODY */}
            <div className="px-8 py-8">

              {/* STEP 0: LAYANAN */}
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 font-medium mb-4">Pilih layanan yang Anda gunakan hari ini.</p>
                  <div className="relative">
                    <div className="flex items-center gap-3 bg-[#F0F4F8] border-2 border-transparent focus-within:border-[#009CC5] px-4 py-3 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                      </svg>
                      <input
                        type="text" placeholder="Cari nama layanan..."
                        value={selectedLayanan ? selectedLayanan.nama : layananSearch}
                        onChange={(e) => { setLayananSearch(e.target.value); setSelectedLayanan(null); }}
                        className="flex-1 text-sm font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none"
                      />
                    </div>
                    {!selectedLayanan && layananSearch.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 border-t-0 shadow-lg">
                        {filteredLayanan.length === 0 ? (
                          <p className="px-5 py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Tidak ditemukan</p>
                        ) : filteredLayanan.map((l) => (
                          <button key={l.id} type="button"
                            onClick={() => { setSelectedLayanan(l); setLayananSearch(""); }}
                            className="w-full text-left px-5 py-3.5 text-sm font-bold text-[#132B4F] hover:bg-[#F0F4F8] border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                          >
                            <div className="w-1 h-4 bg-[#009CC5] shrink-0" />{l.nama}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!selectedLayanan && layananSearch.length === 0 && (
                    <div className="border border-gray-200 overflow-hidden">
                      <div className="bg-[#132B4F] px-4 py-2.5 flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white">Semua Layanan</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">{layananList.length} Layanan</p>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                        {layananList.map((l, i) => (
                          <button key={l.id} type="button" onClick={() => setSelectedLayanan(l)}
                            className="w-full text-left px-5 py-3.5 text-sm font-bold text-[#132B4F] hover:bg-[#F0F4F8] flex items-center gap-4 transition-colors group"
                          >
                            <span className="text-[10px] font-black text-gray-300 w-5 shrink-0">{i + 1}</span>
                            <div className="w-1 h-4 bg-gray-200 group-hover:bg-[#009CC5] shrink-0 transition-colors" />
                            {l.nama}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLayanan && (
                    <div className="flex items-center justify-between bg-[#132B4F] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-[#FAE705]" />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Layanan Dipilih</p>
                          <p className="text-sm font-black text-white">{selectedLayanan.nama}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedLayanan(null)}
                        className="text-[10px] font-black text-white/40 hover:text-[#FAE705] uppercase tracking-widest transition-colors">
                        ✕ Ganti
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: DATA DIRI */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Nama Lengkap <span className="text-red-400">*</span></label>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap Anda" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Tanggal Layanan <span className="text-red-400">*</span></label>
                    <input type="date" value={tglLayanan} onChange={(e) => setTglLayanan(e.target.value)} title="Tanggal Layanan" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Usia <span className="text-red-400">*</span></label>
                      <input type="number" value={usia} onChange={(e) => setUsia(e.target.value)} placeholder="25" min={1} max={120} title="Usia" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="jenisKelamin" className={labelCls}>Jenis Kelamin <span className="text-red-400">*</span></label>
                      <select id="jenisKelamin" value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} className={inputCls}>
                        <option value="">Pilih...</option>
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pendidikan" className={labelCls}>Pendidikan Terakhir <span className="text-red-400">*</span></label>
                    <select id="pendidikan" value={pendidikan} onChange={(e) => setPendidikan(e.target.value)} className={inputCls}>
                      <option value="">Pilih...</option>
                      {PENDIDIKAN.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pekerjaan" className={labelCls}>Pekerjaan <span className="text-red-400">*</span></label>
                    <select id="pekerjaan" value={pekerjaan} onChange={(e) => setPekerjaan(e.target.value)} className={inputCls}>
                      <option value="">Pilih...</option>
                      {PEKERJAAN.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    {pekerjaan === "Lainnya" && (
                      <input type="text" value={pekerjaanCustom} onChange={(e) => setPekerjaanCustom(e.target.value)}
                        placeholder="Sebutkan pekerjaan Anda" title="Pekerjaan Lainnya"
                        className={`${inputCls} mt-2 border-2 border-[#FAE705]`} />
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Penyandang Disabilitas? <span className="text-red-400">*</span></label>
                    <div className="flex gap-3">
                      {["Ya", "Tidak"].map((v) => (
                        <label key={v} className="flex-1 cursor-pointer">
                          <input type="radio" value={v} checked={isDifabel === v} onChange={() => setIsDifabel(v)} className="sr-only" />
                          <div className={`py-3 border-2 text-center text-sm font-black uppercase tracking-widest transition-all ${
                            isDifabel === v ? "bg-[#132B4F] text-white border-[#132B4F]" : "border-gray-200 text-gray-400"
                          }`}>{v}</div>
                        </label>
                      ))}
                    </div>
                    {isDifabel === "Ya" && (
                      <input type="text" value={jenisDisabilitas} onChange={(e) => setJenisDisabilitas(e.target.value)}
                        placeholder="Jenis disabilitas" title="Jenis Disabilitas"
                        className={`${inputCls} mt-2 border-2 border-[#FAE705]`} />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: PEGAWAI */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 font-medium">Siapa pegawai yang melayani Anda hari ini?</p>
                  <div className="relative">
                    <div className="flex items-center gap-3 bg-[#F0F4F8] border-2 border-transparent focus-within:border-[#009CC5] px-4 py-3 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                      </svg>
                      <input type="text" placeholder="Ketik nama pegawai (min. 2 huruf)..."
                        value={selectedPegawai ? selectedPegawai.nama : pegawaiSearch}
                        onChange={(e) => { setPegawaiSearch(e.target.value); setSelectedPegawai(null); }}
                        className="flex-1 text-sm font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none"
                      />
                    </div>
                    {!selectedPegawai && pegawaiSearch.length > 1 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 border-t-0 shadow-lg">
                        {filteredPegawai.length === 0 ? (
                          <p className="px-5 py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Tidak ditemukan</p>
                        ) : filteredPegawai.map((p) => (
                          <button key={p.id} type="button"
                            onClick={() => { setSelectedPegawai(p); setPegawaiSearch(""); }}
                            className="w-full text-left px-5 py-3.5 text-sm font-bold text-[#132B4F] hover:bg-[#F0F4F8] border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                          >
                            <div className="w-1 h-4 bg-[#009CC5] shrink-0" />{p.nama}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedPegawai && (
                    <div className="flex items-center justify-between bg-[#132B4F] px-5 py-4">
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

              {/* STEPS 3–11: QUESTIONS */}
              {step >= 3 && step <= 11 && (
                <div className="space-y-6">
                  <p className="text-base font-bold leading-relaxed text-[#132B4F]">{SKM_QUESTIONS[step - 3].text}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {OPTIONS.map((opt) => {
                      const key = `u${step - 2}`;
                      const selected = answers[key] === opt.val;
                      return (
                        <label key={opt.val} className="cursor-pointer">
                          <input type="radio" className="sr-only" checked={selected}
                            title={`${SKM_QUESTIONS[step - 3].label}: ${opt.label}`}
                            onChange={() => setAnswers((a) => ({ ...a, [key]: opt.val }))}
                          />
                          <div className={`py-5 border-2 text-center transition-all hover:border-[#009CC5] ${
                            selected ? "bg-[#132B4F] border-[#132B4F]" : "border-gray-200"
                          }`}>
                            <span className={`block text-2xl font-black ${selected ? "text-white" : "text-gray-400"}`}>{opt.val}</span>
                            <span className={`block text-[9px] font-black uppercase tracking-widest mt-1.5 ${selected ? "text-[#FAE705]" : "text-gray-400"}`}>
                              {opt.label}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5 justify-center pt-2">
                    {SKM_QUESTIONS.map((_, i) => (
                      <div key={i} className={`h-1.5 transition-all ${
                        i === step - 3 ? "w-5 bg-[#009CC5]" : answers[`u${i + 1}`] ? "w-3 bg-[#132B4F]" : "w-1.5 bg-gray-200"
                      }`} />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 12: SARAN & SUBMIT */}
              {step === 12 && (
                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>Saran & Masukan (Opsional)</label>
                    <textarea value={saran} onChange={(e) => setSaran(e.target.value)}
                      placeholder="Tuliskan saran atau masukan Anda untuk perbaikan layanan ini..."
                      className="w-full px-4 py-4 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-medium text-[#132B4F] placeholder-gray-300 outline-none resize-none min-h-[120px] transition-colors"
                    />
                  </div>
                  <div className="border border-gray-200 overflow-hidden">
                    <div className="bg-[#132B4F] px-5 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#FAE705]">Ringkasan Survei</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {[
                        { icon: "📋", label: "Layanan", val: selectedLayanan?.nama },
                        { icon: "👤", label: "Responden", val: `${nama} · ${usia} thn · ${jenisKelamin}` },
                        { icon: "👨‍💼", label: "Pegawai", val: selectedPegawai?.nama },
                        { icon: "✅", label: "Penilaian", val: `${Object.keys(answers).length} dari 9 unsur dijawab` },
                      ].map((row) => (
                        <div key={row.label} className="px-5 py-3 flex items-start gap-4">
                          <span className="text-sm">{row.icon}</span>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{row.label}</p>
                            <p className="text-sm font-bold text-[#132B4F]">{row.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="w-full py-5 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim Data...</>
                    ) : "Kirim Survei Kepuasan →"}
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
                    <button onClick={handleBack}
                      className="px-6 py-3.5 bg-[#F0F4F8] text-[#132B4F] font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-colors">
                      ← Kembali
                    </button>
                  )}
                  <button onClick={handleNext} disabled={!canProceed()}
                    className="flex-1 py-3.5 bg-[#132B4F] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#009CC5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    {step === 11 ? "Lanjut ke Saran →" : "Lanjut →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}