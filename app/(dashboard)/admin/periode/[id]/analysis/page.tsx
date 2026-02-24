import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ExportButton from "./ExportButton";
import QrSection from "./QrSection";

// 📊 SKM GRADE STANDARD (Permenpan RB 14/2017)
function getSkmGrade(ikm: number) {
  if (ikm >= 88.31) return { grade: "A", mutu: "Sangat Baik", color: "text-green-600 bg-green-50 border-green-200" };
  if (ikm >= 76.61) return { grade: "B", mutu: "Baik", color: "text-blue-600 bg-blue-50 border-blue-200" };
  if (ikm >= 65.00) return { grade: "C", mutu: "Kurang Baik", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
  return { grade: "D", mutu: "Tidak Baik", color: "text-red-600 bg-red-50 border-red-200" };
}

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. 🛡️ FETCH DATA (Includes Token & Responses)
  const periode = await prisma.periode.findUnique({
    where: { id },
    include: {
      layanan: { include: { perangkatDaerah: true } },
      respon: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!periode) return notFound();

  // 2. 🧮 CALCULATION ENGINE (1-4 Scale)
  const respondentCount = periode.respon.length;
  
  // Count feedbacks (non-empty saran) for the notification badge
  const feedbackCount = periode.respon.filter(r => r.saran && r.saran.trim().length > 0).length;

  const sums = { u1: 0, u2: 0, u3: 0, u4: 0, u5: 0, u6: 0, u7: 0, u8: 0, u9: 0 };
  
  periode.respon.forEach(r => {
    sums.u1 += r.u1; sums.u2 += r.u2; sums.u3 += r.u3;
    sums.u4 += r.u4; sums.u5 += r.u5; sums.u6 += r.u6;
    sums.u7 += r.u7; sums.u8 += r.u8; sums.u9 += r.u9;
  });

  const indicators = Object.keys(sums).map((key, idx) => {
    const sum = sums[key as keyof typeof sums];
    const nrr = respondentCount > 0 ? sum / respondentCount : 0;
    const nrrTertimbang = nrr * 0.111; 
    
    return {
      id: key.toUpperCase(),
      label: ["Persyaratan", "Prosedur", "Waktu", "Biaya", "Produk", "Kompetensi", "Perilaku", "Penanganan", "Sarana"][idx],
      nrr: nrr,
      nrrTertimbang: nrrTertimbang
    };
  });

  const totalTertimbang = indicators.reduce((acc, curr) => acc + curr.nrrTertimbang, 0);
  const ikmScore = totalTertimbang * 25;
  const status = getSkmGrade(ikmScore);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-black">
      
      {/* 🟢 HEADER SECTION */}
      <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-4 block transition-colors">
            ← Back to Dashboard
          </Link>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
            {periode.layanan.perangkatDaerah.nama}
          </h3>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            {periode.layanan.nama}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/20">
              {periode.label}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100">
              {respondentCount} Responden
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
           {/* 🆕 READ FEEDBACK BUTTON */}
           <Link 
             href={`/admin/periode/${periode.id}/responses`}
             className="flex items-center gap-2 bg-white border border-gray-200 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-gray-50 transition active:scale-95"
           >
             Read Feedback
             {feedbackCount > 0 && (
               <span className="bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold">
                 {feedbackCount}
               </span>
             )}
           </Link>

           <ExportButton 
             data={periode.respon} 
             periodLabel={periode.label} 
             agencyName={periode.layanan.perangkatDaerah.nama}
             serviceName={periode.layanan.nama}
           />
        </div>
      </div>

      {/* 🏆 REPORT CARD GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* IKM SCORE */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center flex flex-col justify-center items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Indeks Kepuasan (IKM)</p>
          <div className="text-6xl font-black italic tracking-tighter text-black leading-none">{ikmScore.toFixed(2)}</div>
          <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-black" style={{ width: `${ikmScore}%` }}></div>
          </div>
          <div className={`mt-6 px-4 py-2 rounded-xl border flex flex-col items-center ${status.color.replace('text-', 'text-opacity-80 border-opacity-50 ')}`}>
             <span className="text-2xl font-black italic">{status.grade}</span>
             <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{status.mutu}</span>
          </div>
        </div>

        {/* 🆕 QR CODE SECTION (With Token) */}
        <QrSection 
           token={periode.token} 
           label={periode.label} 
           serviceName={periode.layanan.nama} 
        />

        {/* DETAILS */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center gap-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Total NRR Tertimbang</span>
            <span className="text-2xl font-black font-mono">{totalTertimbang.toFixed(3)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
             <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Total Responden</span>
             <span className="text-2xl font-black font-mono">{respondentCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Conversion Factor</span>
            <span className="text-2xl font-black font-mono text-blue-600">x 25.00</span>
          </div>
        </div>
      </div>

      {/* 📊 DETAILED TABLE */}
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Rincian Unsur Pelayanan</h3>
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-50">
            {indicators.map((ind) => (
              <tr key={ind.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="py-4 pl-4 text-xs font-black text-blue-600">{ind.id}</td>
                <td className="py-4 text-xs font-bold text-gray-700 uppercase">{ind.label}</td>
                <td className="py-4 text-right font-mono text-sm">{ind.nrr.toFixed(3)}</td>
                <td className="py-4 pr-4 text-right font-mono text-sm font-black">{ind.nrrTertimbang.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}