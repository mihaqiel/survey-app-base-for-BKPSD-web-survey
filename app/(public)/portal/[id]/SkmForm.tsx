"use client";

import { submitSkmResponse, searchPegawai } from "@/app/action/submit";
import { useState, useCallback, FormEvent } from "react";

const SKM_QUESTIONS = [
  { id: "u1", text: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?" },
  { id: "u2", text: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?" },
  { id: "u3", text: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?" },
  { id: "u4", text: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)" },
  { id: "u5", text: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?" },
  { id: "u6", text: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?" },
  { id: "u7", text: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?" },
  { id: "u8", text: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?" },
  { id: "u9", text: "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?" },
];

const OPTIONS = [
  { val: 1, label: "Tidak Baik" },
  { val: 2, label: "Kurang Baik" },
  { val: 3, label: "Baik" },
  { val: 4, label: "Sangat Baik" },
];

const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA/SMK", "D1/D2/D3", "S1/D4", "S2", "S3"];
const PEKERJAAN_OPTIONS = ["PNS/ASN", "TNI/Polri", "Swasta", "Wirausaha", "Pelajar/Mahasiswa", "Lainnya"];
const GENDER_OPTIONS = ["Laki-laki", "Perempuan"];

interface PegawaiResult {
  id: string;
  nama: string;
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
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiResult | null>(null);
  const [isDifabel, setIsDifabel] = useState("Tidak");
  const [pekerjaan, setPekerjaan] = useState("");
  const [searching, setSearching] = useState(false);

  const handlePegawaiSearch = useCallback(async (query: string) => {
    setPegawaiQuery(query);
    setSelectedPegawai(null);
    if (query.length < 2) { setPegawaiResults([]); return; }
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* HEADER */}
      <header className="mb-12 text-center">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">{agencyName}</h3>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{layananName}</h1>
        <div className="inline-block bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Survei Kepuasan Masyarakat
        </div>
      </header>

      <form action={submitSkmResponse} onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="layananId" value={layananId} />
        <input type="hidden" name="pegawaiId" value={selectedPegawai?.id ?? ""} />

        {/* SECTION 1: IDENTITY */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Data Diri</h4>

          {/* Nama */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 block mb-1">Nama Lengkap *</label>
            <input
              name="nama"
              type="text"
              required
              placeholder="Nama Anda"
              title="Nama Lengkap"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Tanggal Layanan */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 block mb-1">Tanggal Layanan *</label>
            <input
              name="tglLayanan"
              type="date"
              required
              title="Tanggal Layanan"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Usia & Jenis Kelamin */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 block mb-1">Usia *</label>
              <input
                name="usia"
                type="number"
                required
                min={1}
                max={120}
                placeholder="25"
                title="Usia"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 block mb-1">Jenis Kelamin *</label>
              <select
                name="jenisKelamin"
                required
                title="Jenis Kelamin"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
              >
                <option value="">Pilih...</option>
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Pendidikan */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 block mb-1">Pendidikan Terakhir *</label>
            <select
              name="pendidikan"
              required
              title="Pendidikan Terakhir"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">Pilih...</option>
              {PENDIDIKAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Pekerjaan */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 block mb-1">Pekerjaan *</label>
            <select
              name="pekerjaan"
              required
              title="Pekerjaan"
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">Pilih...</option>
              {PEKERJAAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {pekerjaan === "Lainnya" && (
              <input
                name="pekerjaan_custom"
                type="text"
                placeholder="Sebutkan pekerjaan Anda"
                required
                title="Pekerjaan Lainnya"
                className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
              />
            )}
          </div>

          {/* Difabel */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 block mb-2">Apakah Anda Penyandang Disabilitas? *</label>
            <div className="flex gap-3">
              {["Ya", "Tidak"].map((v) => (
                <label key={v} className="cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="isDifabel"
                    value={v}
                    required
                    title="Status Disabilitas"
                    className="peer sr-only"
                    onChange={() => setIsDifabel(v)}
                    defaultChecked={v === "Tidak"}
                  />
                  <div className="py-3 rounded-xl border border-gray-200 bg-gray-50 text-center text-sm font-bold transition-all peer-checked:bg-black peer-checked:text-white peer-checked:border-black">
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
                className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
              />
            )}
          </div>
        </div>

        {/* SECTION 2: PEGAWAI SEARCH */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Pegawai yang Melayani *</h4>
          <div className="relative">
            <input
              type="text"
              placeholder="Ketik nama pegawai..."
              title="Cari Pegawai"
              value={selectedPegawai ? selectedPegawai.nama : pegawaiQuery}
              onChange={(e) => handlePegawaiSearch(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
            />
            {searching && <p className="text-xs text-gray-400 mt-2 font-bold">Mencari...</p>}
            {pegawaiResults.length > 0 && !selectedPegawai && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {pegawaiResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedPegawai(p); setPegawaiResults([]); setPegawaiQuery(""); }}
                    className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {p.nama}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedPegawai && (
            <div className="mt-3 flex items-center justify-between bg-black text-white px-4 py-3 rounded-xl">
              <span className="text-sm font-bold">{selectedPegawai.nama}</span>
              <button
                type="button"
                onClick={() => { setSelectedPegawai(null); setPegawaiQuery(""); }}
                className="text-xs font-black opacity-60 hover:opacity-100"
              >
                ✕ Ganti
              </button>
            </div>
          )}
        </div>

        {/* SECTION 3: SKM QUESTIONS */}
        {SKM_QUESTIONS.map((q, idx) => (
          <div key={q.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Unsur {idx + 1}</h4>
            <p className="text-base font-bold mb-6 leading-tight">{q.text}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OPTIONS.map((opt) => (
                <label key={opt.val} className="cursor-pointer group">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.val}
                    required
                    title={`Unsur ${idx + 1}: ${opt.label}`}
                    className="peer sr-only"
                  />
                  <div className="h-full py-4 px-2 rounded-xl border border-gray-200 bg-gray-50 text-center transition-all peer-checked:bg-black peer-checked:text-white peer-checked:border-black hover:border-gray-400">
                    <span className="block text-2xl font-black italic mb-1">{opt.val}</span>
                    <span className="block text-[9px] font-bold uppercase tracking-widest">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* SECTION 4: SARAN */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Saran &amp; Masukan</h4>
          <textarea
            name="saran"
            placeholder="Tulis saran Anda untuk perbaikan layanan ini..."
            title="Saran dan Masukan"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none min-h-[120px] resize-none"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Mengirim Data..." : "Kirim Survei"}
        </button>
      </form>
    </div>
  );
}