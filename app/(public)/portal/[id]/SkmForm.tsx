"use client";

import { useState, useEffect } from "react";
import { submitSkmResponse, searchPegawai } from "@/app/action/submit";

interface SkmFormProps {
  layananId: string;
  layananName: string;
  agencyName: string;
  label: string;
}

export default function SkmForm({ layananId, layananName, agencyName, label }: SkmFormProps) {
  const [loading, setLoading] = useState(false);
  const [pegawaiQuery, setPegawaiQuery] = useState("");
  const [pegawaiResults, setPegawaiResults] = useState<any[]>([]);
  const [selectedPegawai, setSelectedPegawai] = useState<{id: string, nama: string} | null>(null);

  // 🔍 Employee Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (pegawaiQuery.length >= 2) {
        const results = await searchPegawai(pegawaiQuery);
        setPegawaiResults(results);
      } else {
        setPegawaiResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [pegawaiQuery]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <form action={submitSkmResponse} className="space-y-8">
        {/* Hidden Field for Service ID */}
        <input type="hidden" name="layananId" value={layananId} />
        <input type="hidden" name="pegawaiId" value={selectedPegawai?.id || ""} />

        {/* 🏛️ Header Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-black">BK</div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">{agencyName}</h2>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-black leading-tight">{label}</h1>
          <div className="mt-4 inline-block px-4 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 uppercase">
            Layanan: {layananName}
          </div>
        </div>

        {/* 👤 Section 1: Data Identitas */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
            <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px]">1</span>
            Data Identitas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Nama Lengkap</label>
              <input required name="nama" type="text" placeholder="Masukkan nama Anda" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-black outline-none transition-all text-black font-semibold" />
            </div>

            <div className="space-y-2 text-black">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tanggal Layanan</label>
              <input required name="tglLayanan" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-black outline-none transition-all" />
            </div>

            {/* 🔍 Employee Search Field */}
            <div className="md:col-span-2 space-y-2 relative">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Petugas yang Melayani</label>
              {selectedPegawai ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <span className="text-sm font-bold text-blue-700">{selectedPegawai.nama}</span>
                  <button type="button" onClick={() => setSelectedPegawai(null)} className="text-[10px] font-black text-blue-400 uppercase">Ganti</button>
                </div>
              ) : (
                <>
                  <input 
                    type="text" 
                    placeholder="Ketik nama petugas..." 
                    value={pegawaiQuery}
                    onChange={(e) => setPegawaiQuery(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-black outline-none"
                  />
                  {pegawaiResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2">
                      {pegawaiResults.map((p) => (
                        <button key={p.id} type="button" onClick={() => {setSelectedPegawai(p); setPegawaiQuery("");}} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-colors">
                          {p.nama}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 📊 Section 2: Demografi */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
            <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px]">2</span>
            Profil Responden
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Usia</label>
              <input required name="usia" type="number" placeholder="Contoh: 30" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black text-black font-semibold" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Jenis Kelamin</label>
              <select required name="jenisKelamin" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black font-semibold text-black">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>
        </div>

        {/* ⭐ Section 3: Penilaian (Example for U1, repeat for others) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
            <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px]">3</span>
            Penilaian Layanan
          </h3>

          {[
            { id: "u1", q: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan?" },
            { id: "u2", q: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan?" },
            { id: "u3", q: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?" },
            { id: "u4", q: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?" },
            { id: "u5", q: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?" },
            { id: "u6", q: "Bagaimana pendapat Saudara tentang kompetensi/ kemampuan petugas dalam pelayanan?" },
            { id: "u7", q: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?" },
            { id: "u8", q: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?" },
            { id: "u9", q: "Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?" },
          ].map((item, idx) => (
            <div key={item.id} className="space-y-4">
              <p className="text-sm font-bold text-gray-700 leading-relaxed">{idx + 1}. {item.q}</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((val) => (
                  <label key={val} className="cursor-pointer group">
                    <input required type="radio" name={item.id} value={val} className="hidden peer" />
                    <div className="p-3 text-center rounded-xl border border-gray-100 bg-gray-50 group-hover:bg-gray-100 peer-checked:bg-black peer-checked:text-white transition-all text-[10px] font-black uppercase">
                      {val === 1 ? "Buruk" : val === 2 ? "Kurang" : val === 3 ? "Baik" : "Sangat Baik"}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 📝 Saran */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Saran & Masukan</label>
           <textarea name="saran" rows={4} placeholder="Tuliskan saran Anda di sini..." className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black text-black"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={!selectedPegawai || loading}
          onClick={() => setLoading(true)}
          className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Mengirim Data..." : "Kirim Jawaban"}
        </button>
      </form>
    </div>
  );
}