"use client";

import { useEffect, useState } from "react";
import { submitSkmResponse } from "@/app/action/submit";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const SKM_QUESTIONS = [
  "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?",
  "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?",
  "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?",
  "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)",
  "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?",
  "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?",
  "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?",
  "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?",
  "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?",
];

const OPTIONS = [
  { val: 1, label: "Tidak Baik" },
  { val: 2, label: "Kurang Baik" },
  { val: 3, label: "Baik" },
  { val: 4, label: "Sangat Baik" },
];

const PENDIDIKAN = ["SD", "SMP", "SMA/SMK", "D1/D2/D3", "S1/D4", "S2", "S3"];
const PEKERJAAN = [
  "PNS/ASN",
  "TNI/Polri",
  "Swasta",
  "Wirausaha",
  "Pelajar/Mahasiswa",
  "Lainnya",
];

const TOTAL_STEPS = 13; // 0=Layanan, 1=DataDiri, 2=Pegawai, 3-11=Q1-Q9, 12=Saran

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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PortalForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);

  // Step 0
  const [layananSearch, setLayananSearch] = useState("");
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);

  // Step 1
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

  // Step 2
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);

  // Steps 3-11
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Step 12
  const [saran, setSaran] = useState("");

  // Fetch data
  useEffect(() => {
    fetch("/api/layanan")
      .then((r) => r.json())
      .then(setLayananList);
    fetch("/api/pegawai")
      .then((r) => r.json())
      .then(setPegawaiList);
  }, []);

  // Filtered lists
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

  // Validation per step
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
    if (step === 12) return true;
    return false;
  };

  const handleNext = () => {
    if (canProceed()) setStep((s) => s + 1);
  };
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
    fd.append(
      "pekerjaan",
      pekerjaan === "Lainnya" ? pekerjaanCustom || "Lainnya" : pekerjaan,
    );
    fd.append("isDifabel", isDifabel);
    fd.append("jenisDisabilitas", jenisDisabilitas);
    for (let i = 1; i <= 9; i++)
      fd.append(`u${i}`, String(answers[`u${i}`] || 0));
    fd.append("saran", saran);
    await submitSkmResponse(fd);
  };

  const progress = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      {/* TOP BAR */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black text-xs">
            BK
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 hidden sm:block">
            Badan Kepegawaian & Pengembangan SDM
          </span>
        </div>
        {/* Mobile progress */}
        <div className="flex items-center gap-3 sm:hidden">
          <span className="text-xs font-black text-gray-400">
            Step {step + 1} / {TOTAL_STEPS}
          </span>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 py-8 gap-6">
        {/* LEFT — STEPPER (desktop only) */}
        <aside className="hidden sm:flex flex-col w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
              Progress
            </p>
            <div className="space-y-1">
              {STEP_LABELS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${active ? "bg-black text-white" : done ? "text-gray-400" : "text-gray-300"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${active ? "bg-white text-black" : done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span className="text-[10px] font-bold truncate">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[9px] font-black text-gray-400 mt-1 text-right">
                {progress}%
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT — CONTENT */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            {/* STEP LABEL */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Langkah {step + 1} dari {TOTAL_STEPS}
              </p>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                {STEP_LABELS[step]}
              </h2>
            </div>

            {/* ── STEP 0: PILIH LAYANAN ── */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama layanan..."
                    value={
                      selectedLayanan ? selectedLayanan.nama : layananSearch
                    }
                    onChange={(e) => {
                      setLayananSearch(e.target.value);
                      setSelectedLayanan(null);
                    }}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                  />
                  {!selectedLayanan && layananSearch.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredLayanan.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-gray-400 font-bold">
                          Tidak ditemukan
                        </p>
                      ) : (
                        filteredLayanan.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              setSelectedLayanan(l);
                              setLayananSearch("");
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 border-b border-gray-50 last:border-0"
                          >
                            {l.nama}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {!selectedLayanan && layananSearch.length === 0 && (
                  <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                    {layananList.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setSelectedLayanan(l)}
                        className="text-left px-4 py-3 bg-gray-50 hover:bg-black hover:text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        {l.nama}
                      </button>
                    ))}
                  </div>
                )}
                {selectedLayanan && (
                  <div className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-xl">
                    <span className="text-sm font-bold">
                      {selectedLayanan.nama}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedLayanan(null)}
                      className="text-xs opacity-60 hover:opacity-100 font-black"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 1: DATA DIRI ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Tanggal Layanan *
                  </label>
                  <input
                    type="date"
                    value={tglLayanan}
                    onChange={(e) => setTglLayanan(e.target.value)}
                    title="Tanggal Layanan"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                      Usia *
                    </label>
                    <input
                      type="number"
                      value={usia}
                      onChange={(e) => setUsia(e.target.value)}
                      placeholder="25"
                      min={1}
                      max={120}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="jenisKelamin"
                      className="text-[10px] font-bold uppercase text-gray-400 block mb-1"
                    >
                      Jenis Kelamin *
                    </label>
                    <select
                      id="jenisKelamin"
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                    >
                      <option value="">Pilih...</option>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="pendidikan"
                    className="text-[10px] font-bold uppercase text-gray-400 block mb-1"
                  >
                    Pendidikan Terakhir *
                  </label>
                  <select
                    id="pendidikan"
                    value={pendidikan}
                    onChange={(e) => setPendidikan(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="">Pilih...</option>
                    {PENDIDIKAN.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="pekerjaan"
                    className="text-[10px] font-bold uppercase text-gray-400 block mb-1"
                  >
                    Pekerjaan *
                  </label>
                  <select
                    id="pekerjaan"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="">Pilih...</option>
                    {PEKERJAAN.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  {pekerjaan === "Lainnya" && (
                    <input
                      type="text"
                      value={pekerjaanCustom}
                      onChange={(e) => setPekerjaanCustom(e.target.value)}
                      placeholder="Sebutkan pekerjaan Anda"
                      className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                    Penyandang Disabilitas? *
                  </label>
                  <div className="flex gap-3">
                    {["Ya", "Tidak"].map((v) => (
                      <label key={v} className="cursor-pointer flex-1">
                        <input
                          type="radio"
                          value={v}
                          checked={isDifabel === v}
                          onChange={() => setIsDifabel(v)}
                          className="sr-only"
                        />
                        <div
                          className={`py-3 rounded-xl border text-center text-sm font-bold transition-all ${isDifabel === v ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100"}`}
                        >
                          {v}
                        </div>
                      </label>
                    ))}
                  </div>
                  {isDifabel === "Ya" && (
                    <input
                      type="text"
                      value={jenisDisabilitas}
                      onChange={(e) => setJenisDisabilitas(e.target.value)}
                      placeholder="Jenis disabilitas"
                      className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2: PILIH PEGAWAI ── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium">
                  Siapa pegawai yang melayani Anda?
                </p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama pegawai..."
                    value={
                      selectedPegawai ? selectedPegawai.nama : pegawaiSearch
                    }
                    onChange={(e) => {
                      setPegawaiSearch(e.target.value);
                      setSelectedPegawai(null);
                    }}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                  />
                  {!selectedPegawai && pegawaiSearch.length > 1 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredPegawai.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-gray-400 font-bold">
                          Tidak ditemukan
                        </p>
                      ) : (
                        filteredPegawai.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPegawai(p);
                              setPegawaiSearch("");
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 border-b border-gray-50 last:border-0"
                          >
                            {p.nama}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {selectedPegawai && (
                  <div className="flex items-center justify-between bg-black text-white px-4 py-3 rounded-xl">
                    <span className="text-sm font-bold">
                      {selectedPegawai.nama}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPegawai(null)}
                      className="text-xs opacity-60 hover:opacity-100 font-black"
                    >
                      ✕ Ganti
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── STEPS 3-11: QUESTIONS ── */}
            {step >= 3 && step <= 11 && (
              <div className="space-y-6">
                <p className="text-base sm:text-lg font-bold leading-relaxed text-gray-800">
                  {SKM_QUESTIONS[step - 3]}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {OPTIONS.map((opt) => (
                    <label key={opt.val} className="cursor-pointer">
                      <input
                        type="radio"
                        className="sr-only"
                        checked={answers[`u${step - 2}`] === opt.val}
                        onChange={() =>
                          setAnswers((a) => ({
                            ...a,
                            [`u${step - 2}`]: opt.val,
                          }))
                        }
                      />
                      <div
                        className={`py-5 rounded-xl border text-center transition-all ${answers[`u${step - 2}`] === opt.val ? "bg-black text-white border-black" : "bg-gray-50 border-gray-100 hover:border-gray-300"}`}
                      >
                        <span className="block text-2xl font-black italic">
                          {opt.val}
                        </span>
                        <span className="block text-[10px] font-bold uppercase tracking-widest mt-1">
                          {opt.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 12: SARAN & SUBMIT ── */}
            {step === 12 && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">
                    Saran & Masukan (Opsional)
                  </label>
                  <textarea
                    value={saran}
                    onChange={(e) => setSaran(e.target.value)}
                    placeholder="Tulis saran Anda untuk perbaikan layanan ini..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none min-h-[140px] resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs font-bold text-gray-500">
                  <p>
                    📋{" "}
                    <span className="text-black">{selectedLayanan?.nama}</span>
                  </p>
                  <p>
                    👤 <span className="text-black">{nama}</span> · {usia} thn ·{" "}
                    {jenisKelamin}
                  </p>
                  <p>
                    👨‍💼{" "}
                    <span className="text-black">{selectedPegawai?.nama}</span>
                  </p>
                  <p>
                    ✅ {Object.keys(answers).length} dari 9 pertanyaan dijawab
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-5 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? "Mengirim Data..." : "Kirim Survei →"}
                </button>
              </div>
            )}

            {/* NAVIGATION */}
            {step < 12 && (
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                  >
                    ← Kembali
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {step === 11 ? "Lanjut ke Saran →" : "Lanjut →"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
