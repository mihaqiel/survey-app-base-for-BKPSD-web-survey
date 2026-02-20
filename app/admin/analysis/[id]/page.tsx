import { getDetailedAnalysis } from "@/app/action/admin";
import { notFound } from "next/navigation";
import { DownloadReport } from "./DownloadReport"; // 🚀 New component integrated [cite: 2026-02-18]

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDetailedAnalysis(id); // [cite: 2026-02-18]

  if (!data) return notFound();

  // 📈 Logic: Calculate averages for the header [cite: 2026-02-18]
  const totalResponses = data.responses.length;
  const avgKPI = data.responses.reduce((acc: number, r: any) => acc + (r.primaryScore || 0), 0) / (totalResponses || 1);
  const avgGlobal = data.responses.reduce((acc: number, r: any) => acc + (r.globalScore || 0), 0) / (totalResponses || 1);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      
      {/* 🏗️ NEW HEADER: Title & Download Action */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">{data.title}</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Node Analysis Command</p>
        </div>
        
        {/* 🚀 THE DOWNLOAD LOGIC BUTTON [cite: 2026-02-18] */}
        <DownloadReport title={data.title} />
      </div>

      {/* 📋 REPORT AREA: This ID is used for PDF generation [cite: 2026-02-17] */}
      <div id="analysis-report" className="space-y-12">
        
        {/* 📊 ORIGINAL STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-8 rounded-[3rem] border border-blue-500/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Primary KPI Score</p>
            <h2 className="text-6xl font-black">{avgKPI.toFixed(1)}<span className="text-sm opacity-30">/5.0</span></h2>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-[3rem] border border-green-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">Overall Sentiment</p>
            <h2 className="text-6xl font-black">{avgGlobal.toFixed(1)}<span className="text-sm opacity-30">/5.0</span></h2>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-[3rem] border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Total Samples</p>
            <h2 className="text-6xl font-black">{totalResponses}</h2>
          </div>
        </div>

        {/* 📊 QUESTION BREAKDOWN */}
        <div className="space-y-8">
          {data.questions.map((q: any) => {
            const qAnswers = data.responses.flatMap((r: any) => r.answers.filter((a: any) => a.questionId === q.id));
            
            return (
              <div key={q.id} className="bg-gray-900/50 p-8 rounded-[3rem] border border-white/5">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold max-w-xl">{q.text}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${q.isKPI ? 'border-blue-500 text-blue-500' : 'border-white/20 opacity-40'}`}>
                    {q.isKPI ? "⭐ KPI" : q.type}
                  </span>
                </div>

                {/* 📊 Visual Bar for Scores */}
                {q.type === "SCORE" ? (
                  <div className="grid grid-cols-5 gap-2 h-6">
                    {[1, 2, 3, 4, 5].map(num => {
                      const count = qAnswers.filter((a: any) => a.value === String(num)).length;
                      const percent = (count / (totalResponses || 1)) * 100;
                      return (
                        <div key={num} className="bg-gray-800 rounded-full overflow-hidden relative group">
                          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${percent}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                            {num}: {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                    {qAnswers.slice(0, 5).map((a: any, i: number) => (
                      <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5 italic text-gray-400 text-sm">
                        "{a.value}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}