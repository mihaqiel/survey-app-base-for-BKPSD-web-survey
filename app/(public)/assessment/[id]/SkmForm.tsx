"use client";

import { submitSkmResponse } from "@/app/action/submit";
import { useState } from "react";

// 📜 THE 9 MANDATORY INDICATORS (Permenpan RB 14/2017)
const SKM_QUESTIONS = [
  { id: "u1", text: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?" },
  { id: "u2", text: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?" },
  { id: "u3", text: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?" },
  { id: "u4", text: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan? (Pilih 'Sangat Baik' jika Gratis)" },
  { id: "u5", text: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?" },
  { id: "u6", text: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?" },
  { id: "u7", text: "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?" },
  { id: "u8", text: "Bagaimana pendapat Saudara tentang penanganan pengaduan, saran dan masukan?" },
  { id: "u9", text: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?" },
];

const OPTIONS = [
  { val: 1, label: "Tidak Baik" },
  { val: 2, label: "Kurang Baik" },
  { val: 3, label: "Baik" },
  { val: 4, label: "Sangat Baik" },
];

export default function SkmForm({ periodeId, layananName, agencyName, label }: any) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">{agencyName}</h3>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{layananName}</h1>
        <div className="inline-block bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {label}
        </div>
      </header>

      <form action={submitSkmResponse} onSubmit={() => setLoading(true)} className="space-y-10">
        <input type="hidden" name="periodeId" value={periodeId} />

        {SKM_QUESTIONS.map((q, idx) => (
          <div key={q.id} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Unsur {idx + 1}</h4>
            <p className="text-xl font-bold mb-8 leading-tight">{q.text}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OPTIONS.map((opt) => (
                <label key={opt.val} className="cursor-pointer group">
                  <input type="radio" name={q.id} value={opt.val} required className="peer sr-only" />
                  <div className="h-full py-4 px-2 rounded-xl border border-gray-200 bg-white text-center transition-all peer-checked:bg-black peer-checked:text-white peer-checked:border-black hover:border-gray-400">
                    <span className="block text-2xl font-black italic mb-1">{opt.val}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 peer-checked:opacity-100">
                      {opt.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Saran & Masukan</h4>
          <textarea 
            name="saran" 
            placeholder="Tulis saran Anda untuk perbaikan layanan ini..." 
            className="w-full p-6 rounded-xl border border-gray-200 outline-none focus:border-black min-h-[150px] resize-none"
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest italic hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Assessment"}
        </button>
      </form>
    </div>
  );
}