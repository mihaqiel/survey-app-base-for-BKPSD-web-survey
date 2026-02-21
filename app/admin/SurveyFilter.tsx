"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { StatusToggle } from "./StatusToggle";
import { deleteSurvey } from "@/app/action/admin";

interface SurveyFiltersProps {
  surveys: any[];
}

export function SurveyFilters({ surveys }: SurveyFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false); // ✅ Fixes Hydration Error

  // ✅ Ensures client-side date formatting only happens after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => 
      s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [surveys, searchTerm]);

  // ✅ Wait for client mount before rendering complex UI
  if (!mounted) return null; 

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 no-print">
        <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-2xl p-2 flex items-center px-4 focus-within:border-blue-500/50 transition-all">
          <span className="opacity-30 mr-3 text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Search regional nodes..." 
            className="bg-transparent w-full outline-none text-sm font-medium text-white placeholder:text-gray-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSurveys.map((survey: any) => {
          const latestResponse = survey.responses?.[0]; 
          const meanScore = latestResponse?.primaryScore || 0; 
          const indexScore = latestResponse?.globalScore || 0; 

          return (
            <div 
              key={survey.id} 
              className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center transition-all group hover:border-blue-500/20"
            >
              <div className="flex flex-col gap-1 w-full md:w-auto mb-4 md:mb-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight uppercase group-hover:text-blue-400 transition-colors italic">
                    {survey.title}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  {/* ✅ THE SILVER BULLET: suppressHydrationWarning added here */}
                  <p className="text-[9px] font-black uppercase text-gray-600" suppressHydrationWarning>
                    Deadline: {survey.expiresAt ? new Date(survey.expiresAt).toLocaleDateString() : "None"}
                  </p>
                  <p className="text-[9px] opacity-20 uppercase font-black tracking-widest font-mono">{survey.id}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-8">
                <div className="flex gap-10 mr-4">
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1 text-blue-500">Mean Score</p>
                      <p className="text-2xl font-black italic">
                        {meanScore.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Index Score</p>
                      <p className="text-2xl font-black text-white/30 group-hover:text-white transition-colors italic">
                        {Math.max(0, indexScore).toFixed(0)}%
                      </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusToggle id={survey.id} isActive={survey.isActive} />
                  
                  <Link 
                    href={`/surveys/${survey.id}/results`} 
                    className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
                  >
                    Analysis
                  </Link>

                  <div className="flex gap-2">
                    <Link href={`/surveys/${survey.id}/edit`} className="p-3 bg-gray-900 border border-white/5 rounded-xl hover:text-blue-400 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </Link>

                    <button 
                      onClick={async () => { if(confirm("Permanently delete this node?")) await deleteSurvey(survey.id); }}
                      className="p-3 bg-gray-900 border border-white/5 rounded-xl hover:text-red-500 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}