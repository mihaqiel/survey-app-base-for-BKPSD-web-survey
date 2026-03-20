"use client";

import { submitSkmResponse, searchPegawai } from "@/app/action/submit";
import { useState, useCallback, useRef, useEffect, FormEvent } from "react";

const SKM_QUESTIONS = [
  { id: "u1", code: "U1", label: "Persyaratan", text: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?" },
  { id: "u2", code: "U2", label: "Prosedur", text: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?" },
  { id: "u3", code: "U3", label: "Waktu", text: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?" },
  { id: "u4", code: "U4", label: "Biaya/Tarif", text: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)" },
  { id: "u5", code: "U5", label: "Produk", text: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?" },
  { id: "u6", code: "U6", label: "Kompetensi", text: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?" },
  { id: "u7", code: "U7", label: "Perilaku", text: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?" },
  { id: "u8", code: "U8", label: "Sarana", text: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?" },
  { id: "u9", code: "U9", label: "Pengaduan", text: "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?" },
];

const OPTIONS = [
  { val: 1, label: "Tidak Baik", short: "TB" },
  { val: 2, label: "Kurang Baik", short: "KB" },
  { val: 3, label: "Baik", short: "B" },
  { val: 4, label: "Sangat Baik", short: "SB" },
];

const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA/SMK", "D1/D2/D3", "S1/D4", "S2", "S3"];
const PEKERJAAN_OPTIONS = ["PNS", "PPPK", "Outsourcing", "TNI/Polri", "Swasta", "Wirausaha", "Pelajar/Mahasiswa", "Lainnya"];
const GENDER_OPTIONS = ["Laki-laki", "Perempuan"];

interface PegawaiResult { id: string; nama: string; }

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-blue-600">{number}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-blue-600">Bagian {number}</p>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
    </div>
  );
}

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

export default function SkmForm({
  layananId,
  layananName,
  agencyName,
}: {
  layananId: string;
  layananName: string;
  agencyName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [pegawaiQuery, setPegawaiQuery] = useState("");
  const [pegawaiResults, setPegawaiResults] = useState<PegawaiResult[]>([]);
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiResult | null>(null);
  const [isDifabel, setIsDifabel] = useState("Tidak");
  const [pekerjaan, setPekerjaan] = useState("");
  const [searching, setSearching] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handlePegawaiSearch = useCallback((query: string) => {
    setPegawaiQuery(query);
    setSelectedPegawai(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setPegawaiResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchPegawai(query);
      setPegawaiResults(results);
      setSearching(false);
    }, 300);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    setSubmitted(true);
    if (!selectedPegawai) { e.preventDefault(); return; }
    setLoading(true);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = SKM_QUESTIONS.length;
  const progressPct = (answeredCount / totalQuestions) * 100;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* STICKY PROGRESS BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-slate-500">Progress Pengisian</p>
              <p className="text-xs font-semibold text-blue-600">{answeredCount}/{totalQuestions} Unsur</p>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <p className="shrink-0 text-xs font-medium text-slate-500 truncate max-w-[140px]">{layananName}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8 bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{agencyName}</p>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{layananName}</h1>
          <p className="text-sm text-slate-500">Survei Kepuasan Masyarakat — Permenpan RB No. 14/2017</p>
        </div>

        <form action={submitSkmResponse} onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="layananId" value={layananId} />
          <input type="hidden" name="pegawaiId" value={selectedPegawai?.id ?? ""} />

          {/* ── SECTION 1: DATA DIRI ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <SectionHeader number="1" title="Data Diri Responden" />
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input name="nama" type="text" required placeholder="Nama lengkap Anda" title="Nama Lengkap" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Tanggal Layanan <span className="text-red-400">*</span>
                </label>
                <input name="tglLayanan" type="date" required title="Tanggal Layanan" aria-label="Tanggal Layanan" defaultValue={new Date().toISOString().split("T")[0]} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Usia <span className="text-red-400">*</span>
                  </label>
                  <input name="usia" type="number" required min={1} max={120} placeholder="25" title="Usia" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Jenis Kelamin <span className="text-red-400">*</span>
                  </label>
                  <select name="jenisKelamin" required title="Jenis Kelamin" className={inputClass}>
                    <option value="">Pilih...</option>
                    {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Pendidikan Terakhir <span className="text-red-400">*</span>
                </label>
                <select name="pendidikan" required title="Pendidikan Terakhir" className={inputClass}>
                  <option value="">Pilih...</option>
                  {PENDIDIKAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Pekerjaan <span className="text-red-400">*</span>
                </label>
                <select name="pekerjaan" required value={pekerjaan} title="Pekerjaan" onChange={(e) => setPekerjaan(e.target.value)} className={inputClass}>
                  <option value="">Pilih...</option>
                  {PEKERJAAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {pekerjaan === "Lainnya" && (
                  <input name="pekerjaan_custom" type="text" required placeholder="Sebutkan pekerjaan Anda" title="Pekerjaan Lainnya"
                    className={`${inputClass} mt-2 border-blue-200`} />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Penyandang Disabilitas <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  {["Ya", "Tidak"].map((v) => (
                    <label key={v} className="flex-1 cursor-pointer">
                      <input type="radio" name="isDifabel" value={v} required title={`Penyandang Disabilitas: ${v}`}
                        className="peer sr-only" onChange={() => setIsDifabel(v)} defaultChecked={v === "Tidak"} />
                      <div className="py-3 border border-gray-200 rounded-lg text-center text-sm font-semibold text-slate-500 transition-all peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900">
                        {v}
                      </div>
                    </label>
                  ))}
                </div>
                {isDifabel === "Ya" && (
                  <input name="jenisDisabilitas" type="text" placeholder="Jenis disabilitas" title="Jenis Disabilitas"
                    className={`${inputClass} mt-2 border-blue-200`} />
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: PEGAWAI ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <SectionHeader number="2" title="Pegawai yang Melayani" />
            <div className="relative">
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-4 py-3">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input type="text" placeholder="Ketik nama pegawai (min. 2 huruf)..."
                  value={selectedPegawai ? selectedPegawai.nama : pegawaiQuery}
                  onChange={(e) => handlePegawaiSearch(e.target.value)}
                  className="flex-1 text-sm font-medium text-slate-900 placeholder-gray-300 bg-transparent outline-none" />
                {searching && <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin shrink-0" />}
              </div>
              {pegawaiResults.length > 0 && !selectedPegawai && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                  {pegawaiResults.map((p) => (
                    <button key={p.id} type="button"
                      onClick={() => { setSelectedPegawai(p); setPegawaiResults([]); setPegawaiQuery(""); }}
                      className="w-full text-left px-5 py-3 text-sm font-medium text-slate-900 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                      {p.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {submitted && !selectedPegawai && (
              <p className="mt-2 text-sm font-medium text-red-500">Harap pilih nama pegawai yang melayani Anda.</p>
            )}
            {selectedPegawai && (
              <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-5 py-3.5">
                <div>
                  <p className="text-xs font-medium text-blue-600 mb-0.5">Pegawai Terpilih</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedPegawai.nama}</p>
                </div>
                <button type="button"
                  onClick={() => { setSelectedPegawai(null); setPegawaiQuery(""); }}
                  className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors">
                  Ganti
                </button>
              </div>
            )}
          </div>

          {/* ── SECTION 3: SKM QUESTIONS ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <SectionHeader number="3" title="Penilaian Kepuasan Layanan" />
            <div className="space-y-0 divide-y divide-gray-100">
              {SKM_QUESTIONS.map((q, idx) => (
                <div key={q.id} className={`py-6 ${idx === 0 ? "pt-0" : ""} ${idx === SKM_QUESTIONS.length - 1 ? "pb-0" : ""}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-semibold text-sm transition-all ${
                      answers[q.id] ? "bg-blue-600 text-white" : "bg-gray-50 text-slate-700"
                    }`}>
                      {q.code}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs font-semibold text-blue-600 mb-1">{q.label}</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{q.text}</p>
                    </div>
                  </div>
                  <div className="sm:ml-14 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {OPTIONS.map((opt) => (
                      <label key={opt.val} className="cursor-pointer">
                        <input type="radio" name={q.id} value={opt.val} required title={`${q.label}: ${opt.label}`}
                          className="peer sr-only" onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.val }))} />
                        <div className="py-3 px-1 border border-gray-200 rounded-lg text-center transition-all peer-checked:bg-slate-900 peer-checked:border-slate-900 hover:border-blue-300 group">
                          <span className="block text-xl font-bold text-slate-400 transition-colors"
                            style={{ color: answers[q.id] === opt.val ? "white" : undefined }}>
                            {opt.val}
                          </span>
                          <span className={`block text-xs font-medium mt-0.5 ${answers[q.id] === opt.val ? "text-blue-300" : "text-slate-400"}`}>
                            {opt.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 4: SARAN ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <SectionHeader number="4" title="Saran dan Masukan" />
            <textarea name="saran" placeholder="Tuliskan saran atau masukan Anda untuk perbaikan layanan ini (opsional)..."
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none resize-none min-h-[120px] transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={loading || answeredCount < totalQuestions}
            className="w-full bg-slate-900 text-white py-4 font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim Data...</>
            ) : answeredCount < totalQuestions ? (
              `Lengkapi ${totalQuestions - answeredCount} Pertanyaan Lagi`
            ) : (
              "Kirim Survei Kepuasan →"
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            Data survei ini bersifat rahasia dan hanya digunakan untuk evaluasi mutu pelayanan
          </p>
        </form>
      </div>
    </div>
  );
}
