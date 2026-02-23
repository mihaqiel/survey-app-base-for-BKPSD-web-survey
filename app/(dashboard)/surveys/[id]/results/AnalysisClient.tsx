"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react"; 
import * as XLSX from "xlsx-js-style"; 

// 🛡️ 1. INLINED EXPORT BUTTON
function ExportButton({ survey }: { survey: any }) {
  const downloadExcel = () => {
    const labels: Record<string, { text: string; color: string }> = {
      "5": { text: "Excellent", color: "C6EFCE" },
      "4": { text: "Very Good", color: "DDEBF7" },
      "3": { text: "Good", color: "FFF2CC" },
      "2": { text: "Fair", color: "FCE4D6" },
      "1": { text: "Poor", color: "FFC7CE" }
    };

    const headerRow = [
      "Date Submitted",
      ...survey.questions.map((q: any) => q.text),
      "KPI Mean",
      "Global Index (%)"
    ];

    const dataRows = survey.responses.map((resp: any) => {
      const row: any[] = [new Date(resp.createdAt).toLocaleDateString()];

      survey.questions.forEach((q: any) => {
        const answer = resp.answers.find((a: any) => a.questionId === q.id);
        const val = answer?.value || answer?.content || "-";
        
        if (q.type === "SCORE" && labels[val]) {
          row.push({
            v: `${labels[val].text} (${val})`,
            s: {
              fill: { fgColor: { rgb: labels[val].color } },
              font: { bold: true, sz: 10 },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } }
              }
            }
          });
        } else {
          row.push(val);
        }
      });

      row.push(resp.primaryScore.toFixed(2));
      row.push(`${Math.round(resp.globalScore)}%`);
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    ws["!cols"] = headerRow.map((h, i) => ({ wch: Math.max(h.length + 5, 15) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Surgical Analysis");
    XLSX.writeFile(wb, `${survey.title.replace(/\s+/g, "_")}_Surgical_Report.xlsx`);
  };

  return (
    <button 
      onClick={downloadExcel}
      className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all italic border-b-4 border-green-800 active:scale-95 shadow-lg shadow-green-900/20 flex items-center gap-2"
    >
      <span className="text-sm">↓</span> Export Surgical Excel
    </button>
  );
}

// 🛡️ 2. MAIN ANALYSIS CLIENT (Now using 'export default'!)
export default function AnalysisClient({ survey, surveyId }: { survey: any, surveyId: string }) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const latestResponse = survey.responses?.[0];
  const indexScore = latestResponse?.globalScore || 0;
  const meanScore = latestResponse?.primaryScore || 0;

  const getRatingBadge = (value: string) => {
    const cleanDigit = parseInt(String(value).match(/[1-5]/)?.[0] || "0");
    if (cleanDigit === 0) return <span className="text-gray-700 italic">-</span>;

    const tiers = [
      { label: "POOR", color: "bg-red-900/40 text-red-400 border-red-700/30" },
      { label: "FAIR", color: "bg-orange-900/40 text-orange-400 border-orange-700/30" },
      { label: "GOOD", color: "bg-blue-900/40 text-blue-400 border-blue-700/30" },
      { label: "VERY GOOD", color: "bg-cyan-900/40 text-cyan-400 border-cyan-700/30" },
      { label: "EXCELLENT", color: "bg-green-900/40 text-green-400 border-green-700/30" }
    ];

    const tier = tiers[cleanDigit - 1]; 
    return (
      <span className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${tier.color}`}>
        {tier.label}
      </span>
    );
  };

  const getStatus = (score: number) => {
    if (score >= 80) return { label: "Very Good", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" };
    if (score >= 60) return { label: "Good", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" };
    if (score >= 40) return { label: "Fair", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" };
    return { label: "Poor", color: "text-red-500 border-red-500/30 bg-red-500/10" };
  };

  const status = getStatus(indexScore);
  const fillUrl = mounted ? `${window.location.origin}/fill/${surveyId}` : `.../fill/${surveyId}`;

  const handleCopy = () => {
    if (!mounted) return;
    navigator.clipboard.writeText(fillUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 900, 900);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${survey.title.replace(/\s+/g, "_")}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!mounted) return null;

  return (
    <div className="p-10 text-white min-h-screen max-w-7xl mx-auto text-left">
      <Link href="/admin" className="text-gray-500 hover:text-white mb-8 inline-block transition-colors font-black uppercase text-[10px] tracking-widest">
        ← Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">{survey.title}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2">Node Status</p>
              <span className={`text-xs font-black uppercase italic ${status.color}`}>{status.label}</span>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl text-center">
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2">Latest Mean</p>
              <span className="text-xl font-black italic">{meanScore.toFixed(2)}</span>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl text-center">
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2">Latest Index</p>
              <span className="text-xl font-black text-blue-500 italic">{indexScore.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center justify-between shadow-2xl">
           <div className="w-full text-center mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Regional Access Portal</p>
              <p className="text-[10px] text-gray-300 font-medium truncate px-4 font-mono">{fillUrl}</p>
           </div>
           <div ref={qrRef} className="bg-gray-50 p-4 rounded-3xl border border-gray-100 mb-6">
              <QRCodeSVG value={fillUrl} size={140} level="H" includeMargin={false} />
           </div>
           <div className="w-full space-y-2">
             <button onClick={handleCopy} className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-[0.98] ${copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-900'}`}>
               {copied ? 'Link Copied!' : 'Copy Portal Link'}
             </button>
             <button onClick={downloadQRCode} className="w-full py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest border-2 border-black text-black hover:bg-gray-50 transition-all active:scale-[0.98]">
               Download QR for Printing
             </button>
           </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
          <h3 className="font-black uppercase text-[11px] tracking-widest text-gray-400 italic">Detailed Responses</h3>
          <ExportButton survey={survey} />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-600">
                <th className="p-6 border-b border-gray-800">Date</th>
                {survey.questions.map((q: any) => (
                  <th 
                    key={q.id} 
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-6 border-b border-gray-800 cursor-pointer transition-colors hover:text-blue-400 min-w-[200px] ${selectedQuestionId === q.id ? 'text-blue-500 bg-blue-500/5' : ''}`}
                  >
                    {q.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {survey.responses?.map((resp: any) => (
                <tr key={resp.id} className="hover:bg-white/[0.02]">
                  <td className="p-6 text-[10px] text-gray-600 font-black italic uppercase">{new Date(resp.createdAt).toLocaleDateString()}</td>
                  {survey.questions.map((q: any) => {
                    const answer = resp.answers.find((a: any) => a.questionId === q.id);
                    const val = answer?.value || answer?.content || "";
                    return (
                      <td key={q.id} onClick={() => setSelectedQuestionId(q.id)} className={`p-6 text-sm cursor-pointer ${selectedQuestionId === q.id ? 'bg-blue-500/5' : ''}`}>
                        {q.type === "SCORE" ? getRatingBadge(val) : <span className="text-gray-400">{val}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuestionId && (
        <div className="mt-8 p-10 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-300 relative">
          <button onClick={() => setSelectedQuestionId(null)} className="absolute top-8 right-8 text-[9px] font-black uppercase text-gray-600 hover:text-white">Close Detail ×</button>
          <h4 className="text-[9px] font-black uppercase text-blue-400 tracking-[0.3em] mb-6 italic">Metric Investigation</h4>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                {survey.questions.find((q: any) => q.id === selectedQuestionId)?.text}
              </h2>
              <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20 inline-block">
                <p className="text-[9px] font-black uppercase text-blue-400 mb-1">Lifetime Mean</p>
                <h3 className="text-3xl font-black italic">
                   {(survey.responses.reduce((acc: number, r: any) => {
                     const v = String(r.answers.find((a: any) => a.questionId === selectedQuestionId)?.value || "0");
                     return acc + (parseInt(v.match(/[1-5]/)?.[0] || "0"));
                   }, 0) / (survey.responses.length || 1)).toFixed(2)}
                </h3>
              </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-blue-500/20">
               {survey.responses.map((r: any) => {
                 const ans = r.answers.find((a: any) => a.questionId === selectedQuestionId);
                 return (
                   <div key={r.id} className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-xl">
                      <span className="text-[10px] font-black text-gray-700 italic">{new Date(r.createdAt).toLocaleDateString()}</span>
                      {getRatingBadge(ans?.value || ans?.content)}
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}