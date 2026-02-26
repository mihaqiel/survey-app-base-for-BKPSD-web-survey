"use client";

import { submitSkmResponse, searchPegawai } from "@/app/action/submit";
import { useState, useCallback, FormEvent } from "react";

const SKM_QUESTIONS = [
  {
    id: "u1",
    code: "U1",
    label: "Persyaratan",
    text: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?",
  },
  {
    id: "u2",
    code: "U2",
    label: "Prosedur",
    text: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?",
  },
  {
    id: "u3",
    code: "U3",
    label: "Waktu",
    text: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?",
  },
  {
    id: "u4",
    code: "U4",
    label: "Biaya/Tarif",
    text: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)",
  },
  {
    id: "u5",
    code: "U5",
    label: "Produk",
    text: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?",
  },
  {
    id: "u6",
    code: "U6",
    label: "Kompetensi",
    text: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?",
  },
  {
    id: "u7",
    code: "U7",
    label: "Perilaku",
    text: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?",
  },
  {
    id: "u8",
    code: "U8",
    label: "Sarana",
    text: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?",
  },
  {
    id: "u9",
    code: "U9",
    label: "Pengaduan",
    text: "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?",
  },
];

const OPTIONS = [
  { val: 1, label: "Tidak Baik", short: "TB" },
  { val: 2, label: "Kurang Baik", short: "KB" },
  { val: 3, label: "Baik", short: "B" },
  { val: 4, label: "Sangat Baik", short: "SB" },
];

const PENDIDIKAN_OPTIONS = [
  "SD",
  "SMP",
  "SMA/SMK",
  "D1/D2/D3",
  "S1/D4",
  "S2",
  "S3",
];
const PEKERJAAN_OPTIONS = [
  "PNS",
  "PPPK",
  "Outsourcing",
  "TNI/Polri",
  "Swasta",
  "Wirausaha",
  "Pelajar/Mahasiswa",
  "Lainnya",
];
const GENDER_OPTIONS = ["Laki-laki", "Perempuan"];

interface PegawaiResult {
  id: string;
  nama: string;
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-[#132B4F] flex items-center justify-center shrink-0">
        <span className="text-[10px] font-black text-[#FAE705]">{number}</span>
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#009CC5]">
          Bagian {number}
        </p>
        <h3 className="text-sm font-black uppercase tracking-tight text-[#132B4F]">
          {title}
        </h3>
      </div>
    </div>
  );
}

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
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiResult | null>(
    null,
  );
  const [isDifabel, setIsDifabel] = useState("Tidak");
  const [pekerjaan, setPekerjaan] = useState("");
  const [searching, setSearching] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handlePegawaiSearch = useCallback(async (query: string) => {
    setPegawaiQuery(query);
    setSelectedPegawai(null);
    if (query.length < 2) {
      setPegawaiResults([]);
      return;
    }
    setSearching(true);
    const results = await searchPegawai(query);
    setPegawaiResults(results);
    setSearching(false);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    if (!selectedPegawai) {
      e.preventDefault();
      alert("Harap pilih nama pegawai yang melayani Anda.");
      return;
    }
    setLoading(true);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = SKM_QUESTIONS.length;
  const progressPct = (answeredCount / totalQuestions) * 100;

  return (
    <div className="bg-[#F0F4F8] min-h-screen">
      {/* STICKY PROGRESS BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Progress Pengisian
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#009CC5]">
                {answeredCount}/{totalQuestions} Unsur
              </p>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-none overflow-hidden">
              <div
                className="h-full bg-[#009CC5] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate max-w-[140px]">
              {layananName}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8 bg-[#132B4F] p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#FAE705]" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
              {agencyName}
            </p>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-tight mb-1">
            {layananName}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Survei Kepuasan Masyarakat — Permenpan RB No. 14/2017
          </p>
          <div className="h-0.5 bg-gradient-to-r from-[#FAE705] to-[#009CC5] mt-5" />
        </div>

        <form
          action={submitSkmResponse}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <input type="hidden" name="layananId" value={layananId} />
          <input
            type="hidden"
            name="pegawaiId"
            value={selectedPegawai?.id ?? ""}
          />

          {/* ── SECTION 1: DATA DIRI ── */}
          <div className="bg-white border border-gray-200 p-8">
            <SectionHeader number="1" title="Data Diri Responden" />

            <div className="space-y-5">
              {/* Nama */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  name="nama"
                  type="text"
                  required
                  placeholder="Nama lengkap Anda"
                  title="Nama Lengkap"
                  className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Tanggal Layanan <span className="text-red-400">*</span>
                </label>
                <input
                  name="tglLayanan"
                  type="date"
                  required
                  title="Tanggal Layanan"
                  aria-label="Tanggal Layanan"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] outline-none transition-colors"
                />
              </div>

              {/* Usia & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Usia <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="usia"
                    type="number"
                    required
                    min={1}
                    max={120}
                    placeholder="25"
                    title="Usia"
                    className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Jenis Kelamin <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="jenisKelamin"
                    required
                    title="Jenis Kelamin"
                    className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] outline-none transition-colors"
                  >
                    <option value="">Pilih...</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pendidikan */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Pendidikan Terakhir <span className="text-red-400">*</span>
                </label>
                <select
                  name="pendidikan"
                  required
                  title="Pendidikan Terakhir"
                  className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] outline-none transition-colors"
                >
                  <option value="">Pilih...</option>
                  {PENDIDIKAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pekerjaan */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Pekerjaan <span className="text-red-400">*</span>
                </label>
                <select
                  name="pekerjaan"
                  required
                  value={pekerjaan}
                  title="Pekerjaan"
                  onChange={(e) => setPekerjaan(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] outline-none transition-colors"
                >
                  <option value="">Pilih...</option>
                  {PEKERJAAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {pekerjaan === "Lainnya" && (
                  <input
                    name="pekerjaan_custom"
                    type="text"
                    required
                    placeholder="Sebutkan pekerjaan Anda"
                    title="Pekerjaan Lainnya"
                    className="w-full mt-2 px-4 py-3 bg-[#F0F4F8] border-2 border-[#FAE705] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none"
                  />
                )}
              </div>

              {/* Disabilitas */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Penyandang Disabilitas <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  {["Ya", "Tidak"].map((v) => (
                    <label key={v} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="isDifabel"
                        value={v}
                        required
                        title={`Penyandang Disabilitas: ${v}`}
                        className="peer sr-only"
                        onChange={() => setIsDifabel(v)}
                        defaultChecked={v === "Tidak"}
                      />
                      <div className="py-3 border-2 border-gray-200 text-center text-sm font-black uppercase tracking-widest text-gray-400 transition-all peer-checked:bg-[#132B4F] peer-checked:text-white peer-checked:border-[#132B4F]">
                        {v}
                      </div>
                    </label>
                  ))}
                </div>
                {isDifabel === "Ya" && (
                  <input
                    name="jenisDisabilitas"
                    type="text"
                    placeholder="Jenis disabilitas"
                    title="Jenis Disabilitas"
                    className="w-full mt-2 px-4 py-3 bg-[#F0F4F8] border-2 border-[#FAE705] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: PEGAWAI ── */}
          <div className="bg-white border border-gray-200 p-8">
            <SectionHeader number="2" title="Pegawai yang Melayani" />

            <div className="relative">
              <div className="flex items-center gap-3 bg-[#F0F4F8] border-2 border-transparent focus-within:border-[#009CC5] transition-colors px-4 py-3">
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Ketik nama pegawai (min. 2 huruf)..."
                  value={selectedPegawai ? selectedPegawai.nama : pegawaiQuery}
                  onChange={(e) => handlePegawaiSearch(e.target.value)}
                  className="flex-1 text-sm font-bold text-[#132B4F] placeholder-gray-300 bg-transparent outline-none"
                />
                {searching && (
                  <div className="w-4 h-4 border-2 border-[#132B4F]/20 border-t-[#132B4F] rounded-full animate-spin shrink-0" />
                )}
              </div>

              {pegawaiResults.length > 0 && !selectedPegawai && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 border-t-0 shadow-lg overflow-hidden">
                  {pegawaiResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPegawai(p);
                        setPegawaiResults([]);
                        setPegawaiQuery("");
                      }}
                      className="w-full text-left px-5 py-3.5 text-sm font-bold text-[#132B4F] hover:bg-[#F0F4F8] border-b border-gray-50 last:border-0 transition-colors flex items-center gap-3"
                    >
                      <div className="w-1 h-4 bg-[#009CC5] shrink-0" />
                      {p.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPegawai && (
              <div className="mt-3 flex items-center justify-between bg-[#132B4F] px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-[#FAE705]" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-0.5">
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
                    setPegawaiQuery("");
                  }}
                  className="text-[10px] font-black text-white/50 hover:text-[#FAE705] uppercase tracking-widest transition-colors"
                >
                  ✕ Ganti
                </button>
              </div>
            )}
          </div>

          {/* ── SECTION 3: SKM QUESTIONS ── */}
          <div className="bg-white border border-gray-200 p-8">
            <SectionHeader number="3" title="Penilaian Kepuasan Layanan" />

            <div className="space-y-0 divide-y divide-gray-100">
              {SKM_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className={`py-6 ${idx === 0 ? "pt-0" : ""} ${idx === SKM_QUESTIONS.length - 1 ? "pb-0" : ""}`}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-10 h-10 flex items-center justify-center shrink-0 font-black text-sm transition-all ${answers[q.id] ? "bg-[#009CC5] text-white" : "bg-[#F0F4F8] text-[#132B4F]"}`}
                    >
                      {q.code}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#009CC5] mb-1">
                        {q.label}
                      </p>
                      <p className="text-sm font-bold text-[#132B4F] leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="ml-14 grid grid-cols-4 gap-2">
                    {OPTIONS.map((opt) => (
                      <label key={opt.val} className="cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.val}
                          required
                          title={`${q.label}: ${opt.label}`}
                          className="peer sr-only"
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: opt.val }))
                          }
                        />
                        <div className="py-3 px-1 border-2 border-gray-200 text-center transition-all peer-checked:bg-[#132B4F] peer-checked:border-[#132B4F] hover:border-[#009CC5] group">
                          <span
                            className="block text-xl font-black text-gray-400 peer-checked:text-white group-[.peer:checked+div]:text-white transition-colors"
                            style={{
                              color:
                                answers[q.id] === opt.val ? "white" : undefined,
                            }}
                          >
                            {opt.val}
                          </span>
                          <span
                            className={`block text-[8px] font-black uppercase tracking-widest mt-0.5 ${answers[q.id] === opt.val ? "text-[#FAE705]" : "text-gray-400"}`}
                          >
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
          <div className="bg-white border border-gray-200 p-8">
            <SectionHeader number="4" title="Saran & Masukan" />
            <textarea
              name="saran"
              placeholder="Tuliskan saran atau masukan Anda untuk perbaikan layanan ini (opsional)..."
              className="w-full px-4 py-4 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-medium text-[#132B4F] placeholder-gray-300 outline-none resize-none min-h-[120px] transition-colors"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || answeredCount < totalQuestions}
            className="w-full bg-[#132B4F] text-white py-5 font-black text-base uppercase tracking-widest hover:bg-[#009CC5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengirim Data...
              </>
            ) : answeredCount < totalQuestions ? (
              `Lengkapi ${totalQuestions - answeredCount} Pertanyaan Lagi`
            ) : (
              "Kirim Survei Kepuasan →"
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Data survei ini bersifat rahasia dan hanya digunakan untuk evaluasi
            mutu pelayanan
          </p>
        </form>
      </div>
    </div>
  );
}
