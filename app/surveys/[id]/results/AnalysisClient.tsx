"use client";
import { useState } from "react";
import Link from "next/link";
import ShareCard from "../ShareCard"; 
import ExportButton from "../ExportButton"; 

export function AnalysisClient({ survey, surveyId }: { survey: any, surveyId: string }) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const latestResponse = survey.responses[0];
  const indexScore = latestResponse?.globalScore || 0;
  const meanScore = latestResponse?.primaryScore || 0;

  // ✅ FIX 1: Universal Rating Badge for all numbers 1-5
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
        <ShareCard surveyId={surveyId} />
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
              {survey.responses.map((resp: any) => (
                <tr key={resp.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 text-[10px] text-gray-600 font-black italic uppercase">
                    {new Date(resp.createdAt).toLocaleDateString()}
                  </td>
                  {survey.questions.map((q: any) => {
                    const answer = resp.answers.find((a: any) => a.questionId === q.id);
                    const isSelected = selectedQuestionId === q.id;
                    const val = answer?.value || answer?.content || "";
                    
                    return (
                      <td 
                        key={q.id} 
                        onClick={() => setSelectedQuestionId(q.id)}
                        className={`p-6 text-sm cursor-pointer transition-all ${isSelected ? 'bg-blue-500/5' : ''}`}
                      >
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

      {/* ✅ FIX 2: Surgical History Feed for One Question */}
      {selectedQuestionId && (
        <div className="mt-8 p-10 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-300 relative">
          <button onClick={() => setSelectedQuestionId(null)} className="absolute top-8 right-8 text-[9px] font-black uppercase text-gray-600 hover:text-white">Close Detail ×</button>
          <h4 className="text-[9px] font-black uppercase text-blue-400 tracking-[0.3em] mb-6 italic">Metric Investigation</h4>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
                {survey.questions.find((q: any) => q.id === selectedQuestionId)?.text}
              </h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                Aggregating all historical scores for this metric. This node is currently performing at the <span className="text-white font-black italic">"{status.label}"</span> level.
              </p>
              
              <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20 inline-block">
                <p className="text-[9px] font-black uppercase text-blue-400 mb-1">Lifetime Mean</p>
                <h3 className="text-3xl font-black italic">
                   {(survey.responses.reduce((acc: number, r: any) => {
                     const v = r.answers.find((a: any) => a.questionId === selectedQuestionId)?.value;
                     return acc + (parseInt(v) || 0);
                   }, 0) / survey.responses.length).toFixed(2)}
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-blue-500/20">
               <p className="text-[9px] font-black uppercase text-gray-600 mb-4 tracking-widest">Historical Data Feed</p>
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