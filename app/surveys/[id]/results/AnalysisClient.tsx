"use client";
import { useState, useRef, useEffect } from "react"; 
import Link from "next/link";
// ✅ Paths now correctly hit app/admin/ folder
import { ExportButton } from "../../ExportButton"; 
import { LiveTicker } from "../../LiveTicker";     
import { QRCodeSVG } from "qrcode.react"; 

// ✅ FIX: Named Export matches the { AnalysisClient } import in your page.tsx
export function AnalysisClient({ survey, surveyId }: { survey: any, surveyId: string }) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(new Date()); 
  const qrRef = useRef<HTMLDivElement>(null);

  // 🛡️ Time-Aware Logic: Auto-flips badge to CLOSED at 06:28:59 [cite: 2026-02-21]
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const latestResponse = survey.responses[0];
  const indexScore = latestResponse?.globalScore || 0;
  const meanScore = latestResponse?.primaryScore || 0;

  const isExpired = survey.expiresAt ? now > new Date(survey.expiresAt) : false;
  const isActuallyActive = survey.isActive && !isExpired;

  // ✅ Surgical Regex Math: Preserves 'Excellent (5)' logic for 2.33 Mean Score [cite: 2026-02-21]
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

  const badgeStatus = isActuallyActive 
    ? { label: "ACTIVE", color: "text-green-400 border-green-400/30 bg-green-400/10" }
    : { label: "CLOSED", color: "text-red-500 border-red-500/30 bg-red-500/10" };

  const fillUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/fill/${surveyId}`;

  const handleCopy = () => {
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

  return (
    <div className="p-10 text-white min-h-screen max-w-7xl mx-auto text-left">
      <Link href="/admin" className="text-gray-500 hover:text-white mb-8 inline-block transition-colors font-black uppercase text-[10px] tracking-widest">
        ← Back to Console
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{survey.title}</h1>
            <div className={`px-4 py-1 rounded-full border text-[10px] font-black tracking-widest ${badgeStatus.color}`}>
              • {badgeStatus.label}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2">Reporting Window</p>
              <div className="text-[10px] font-black text-white italic uppercase tracking-widest">
                {new Date(survey.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                <span className="mx-2 text-gray-700">→</span>
                {new Date(survey.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
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
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Access Portal</p>
              <p className="text-[10px] text-gray-300 font-medium truncate px-4 font-mono">{fillUrl}</p>
           </div>
           <div ref={qrRef} className="bg-gray-50 p-4 rounded-3xl border border-gray-100 mb-6">
              <QRCodeSVG value={fillUrl} size={140} level="H" includeMargin={false} />
           </div>
           <div className="w-full space-y-2">
             <button onClick={handleCopy} className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-900'}`}>
               {copied ? 'Link Copied!' : 'Copy Portal Link'}
             </button>
             <button onClick={downloadQRCode} className="w-full py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest border-2 border-black text-black hover:bg-gray-50 transition-all">
               Download QR
             </button>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 mb-12">
        {/* ✅ LIVE FEED INTEGRATION [cite: 2026-02-21] */}
        <div className="lg:col-span-1">
          <LiveTicker surveyId={surveyId} />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-gray-900 rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
              <h3 className="font-black uppercase text-[11px] tracking-widest text-gray-400 italic">Detailed Responses</h3>
              {/* ✅ Uses the ExportButton from the new shared location */}
              <ExportButton survey={survey} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-600">
                    <th className="p-6 border-b border-gray-800">Date</th>
                    {survey.questions.map((q: any) => (
                      <th key={q.id} onClick={() => setSelectedQuestionId(q.id)} className={`p-6 border-b border-gray-800 cursor-pointer hover:text-blue-400 ${selectedQuestionId === q.id ? 'text-blue-500 bg-blue-500/5' : ''}`}>
                        {q.text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {survey.responses.map((resp: any) => (
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
        </div>
      </div>
    </div>
  );
}