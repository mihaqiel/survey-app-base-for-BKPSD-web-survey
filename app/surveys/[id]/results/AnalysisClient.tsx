"use client";
import { useState, useRef } from "react"; // ✅ Added useRef
import Link from "next/link";
import ExportButton from "../ExportButton"; 
import { QRCodeSVG } from "qrcode.react"; 

export function AnalysisClient({ survey, surveyId }: { survey: any, surveyId: string }) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null); // ✅ Targets QR for physical capture

  const latestResponse = survey.responses[0];
  const indexScore = latestResponse?.globalScore || 0;
  const meanScore = latestResponse?.primaryScore || 0;

  const getRatingBadge = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return <span className="text-gray-700 italic">-</span>;
    const tiers = [
      { label: "POOR", color: "bg-red-900/40 text-red-400 border-red-700/30" },
      { label: "FAIR", color: "bg-orange-900/40 text-orange-400 border-orange-700/30" },
      { label: "GOOD", color: "bg-blue-900/40 text-blue-400 border-blue-700/30" },
      { label: "VERY GOOD", color: "bg-cyan-900/40 text-cyan-400 border-cyan-700/30" },
      { label: "EXCELLENT", color: "bg-green-900/40 text-green-400 border-green-700/30" }
    ];
    const tier = tiers[num - 1] || tiers[2]; 
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
  const fillUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/fill/${surveyId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fillUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ NEW: Direct Download Logic for Physical Printing
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
      canvas.width = 1000; // Professional print resolution
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "white"; // Essential for paper scanning
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 900, 900);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `Regional_Portal_QR_${survey.title.replace(/\s+/g, "_")}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

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
              <p className="text-[10px] text-gray-300 font-medium truncate px-4">{fillUrl}</p>
           </div>
           
           {/* ✅ Container with Ref for QR */}
           <div ref={qrRef} className="bg-gray-50 p-4 rounded-3xl border border-gray-100 mb-6">
              <QRCodeSVG 
                value={fillUrl} 
                size={140}
                level="H" 
                includeMargin={false}
              />
           </div>

           <div className="w-full space-y-2">
             <button 
               onClick={handleCopy}
               className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-[0.98] ${copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-900'}`}
             >
               {copied ? 'Link Copied!' : 'Copy Portal Link'}
             </button>

             {/* ✅ NEW: Physical Print Download */}
             <button 
               onClick={downloadQRCode}
               className="w-full py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest border-2 border-black text-black hover:bg-gray-50 transition-all active:scale-[0.98]"
             >
               Download QR for Printing
             </button>
           </div>
        </div>
      </div>

      {/* [Rest of the table and investigation logic remains identical] */}
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
                  <th key={q.id} className="p-6 border-b border-gray-800 min-w-[200px]">{q.text}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {survey.responses.map((resp: any) => (
                <tr key={resp.id} className="hover:bg-white/[0.02]">
                  <td className="p-6 text-[10px] text-gray-600 font-black italic uppercase">{new Date(resp.createdAt).toLocaleDateString()}</td>
                  {survey.questions.map((q: any) => {
                    const answer = resp.answers.find((a: any) => a.questionId === q.id);
                    return <td key={q.id} className="p-6 text-sm">{q.type === "SCORE" ? getRatingBadge(answer?.value || "") : <span className="text-gray-400">{answer?.content}</span>}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}