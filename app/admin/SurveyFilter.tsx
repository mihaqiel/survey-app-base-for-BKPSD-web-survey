"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { StatusToggle } from "./StatusToggle";
import { deleteSurvey } from "@/app/action/admin";

interface SurveyFiltersProps {
  surveys: any[];
  regionalAvg: number;
}

export function SurveyFilters({ surveys, regionalAvg }: SurveyFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState(0);

  // 🚀 Logic: Filter surveys based on search text and KPI threshold
  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const titleMatch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
      const responses = s.responses || [];
      const avgKPI = responses.length > 0 
        ? responses.reduce((a: number, b: any) => a + (b.primaryScore || 0), 0) / responses.length 
        : 0;
      return titleMatch && avgKPI >= minScore;
    });
  }, [surveys, searchTerm, minScore]);

  return (
    <div className="space-y-8">
      {/* 🔍 Search & Filter Control UI */}
      <div className="flex flex-col md:flex-row gap-4 no-print">
        <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-2xl p-2 flex items-center px-4">
          <span className="opacity-30 mr-3 text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Search regional nodes..." 
            className="bg-transparent w-full outline-none text-sm font-medium text-white placeholder:text-gray-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex items-center gap-4 min-w-[280px]">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-white">Min KPI: {minScore.toFixed(1)}</span>
          <input 
            type="range" min="0" max="5" step="0.5" 
            value={minScore}
            onChange={(e) => setMinScore(parseFloat(e.target.value))}
            className="flex-1 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* 🚀 The Filtered Survey List (Your Original UI Design) */}
      <div className="grid gap-4">
        {filteredSurveys.map((survey: any) => {
          const totalScore = survey.responses.reduce((a: number, b: any) => a + (b.primaryScore || 0), 0);
          const avgKPI = totalScore / (survey.responses.length || 1);
          const isUnderperforming = avgKPI < regionalAvg * 0.8;

          return (
            <div 
              key={survey.id} 
              className={`bg-[#0A0A0A] border p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center transition-all group hover:border-blue-500/20 ${
                isUnderperforming ? 'border-red-500/40 bg-red-500/5' : 'border-white/5'
              }`}
            >
              <div className="flex flex-col gap-1 w-full md:w-auto mb-4 md:mb-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight uppercase">{survey.title}</h2>
                  {isUnderperforming && (
                    <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                      Underperforming
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[9px] font-black uppercase text-gray-600">
                    Deadline: {survey.expiresAt ? new Date(survey.expiresAt).toLocaleDateString() : "None"}
                  </p>
                  <p className="text-[9px] opacity-20 uppercase font-black tracking-widest">{survey.id}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-8">
                <div className="flex gap-10 mr-4">
                   <div className="text-center">
                      <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">KPI Score</p>
                      <p className={`text-2xl font-black ${isUnderperforming ? 'text-red-500' : 'text-blue-500'}`}>
                        {avgKPI.toFixed(1)}
                      </p>
                   </div>
                   <div className="text-center">
                      <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Responses</p>
                      <p className="text-2xl font-black">{survey.responses.length}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusToggle id={survey.id} isActive={survey.isActive} />
                  
                  <Link href={`/surveys/${survey.id}/results`} className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest">
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