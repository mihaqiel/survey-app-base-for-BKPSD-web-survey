"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { deleteSurvey, toggleSurveyStatus } from "@/app/action/admin";

// 🛡️ INLINED COMPONENT: StatusToggle (Kept so you can manually force a node offline)
function StatusToggle({ id, isActive }: { id: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const handleToggle = async () => {
    setLoading(true);
    await toggleSurveyStatus(id, isActive);
    setLoading(false);
  };
  return (
    <button onClick={handleToggle} disabled={loading} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"}`}>
      {loading ? "..." : isActive ? "🟢 ONLINE" : "🔴 OFFLINE"}
    </button>
  );
}

// 🛡️ MAIN WRAPPER: Admin Dashboard Client
export default function AdminClient({ surveys }: { surveys: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // 🔄 SILENT AUTO-REFRESH (Every 15 Seconds)
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      router.refresh();
    }, 15000); 
    return () => clearInterval(interval);
  }, [router]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [surveys, searchTerm]);

  if (!mounted) return null; // Hydration fix

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER (Streamlined) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8 gap-6 text-left">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Regional Console</h1>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">System Command & Control</p>
          </div>
          
          {/* Logout Button positioned at dynamic area top-right */}
          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-full border border-white/10 pr-6 shadow-lg">
            <UserButton afterSignOutUrl="/" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Admin Active</span>
          </div>
        </header>

        {/* SEARCH & LIST */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between px-8 mb-4">
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Active Deployments</h2>
             <div className="h-px flex-1 bg-white/5 mx-6" />
             <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest animate-pulse text-blue-500">Live Sync Active</span>
          </div>

          <div className="space-y-8">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 no-print">
              <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-2xl p-2 flex items-center px-4 focus-within:border-blue-500/50 transition-all shadow-xl">
                <span className="opacity-30 mr-3 text-sm">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search regional nodes..." 
                  className="bg-transparent w-full outline-none text-sm font-medium text-white placeholder:text-gray-700 py-3"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* NODE CARDS */}
            <div className="grid gap-4">
              {filteredSurveys.length === 0 ? (
                <div className="text-center p-12 border border-white/5 rounded-[2.5rem] bg-[#0A0A0A]">
                   <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No nodes found.</p>
                </div>
              ) : (
                filteredSurveys.map((survey: any) => {
                  const latestResponse = survey.responses?.[0]; 
                  const meanScore = latestResponse?.primaryScore || 0; 
                  const indexScore = latestResponse?.globalScore || 0; 

                  return (
                    <div key={survey.id} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center transition-all group hover:border-blue-500/20 shadow-xl">
                      
                      <div className="flex flex-col gap-1 w-full md:w-auto mb-4 md:mb-0">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-black tracking-tight uppercase group-hover:text-blue-400 transition-colors italic">
                            {survey.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-4">
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
                              <p className="text-2xl font-black italic">{meanScore.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Index Score</p>
                              <p className="text-2xl font-black text-white/30 group-hover:text-white transition-colors italic">{Math.max(0, indexScore).toFixed(0)}%</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <StatusToggle id={survey.id} isActive={survey.isActuallyActive} />
                          
                          <Link href={`/surveys/${survey.id}/results`} className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]">
                            Analysis
                          </Link>

                          <div className="flex gap-2">
                            {/* 🗑️ Edit Button Removed - Delete is the only destructive action */}
                            <button onClick={async () => { if(confirm("Permanently delete this node and ALL associated data?")) await deleteSurvey(survey.id); }} className="p-3 bg-gray-900 border border-white/5 rounded-xl hover:bg-red-900/40 hover:text-red-500 transition-all text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}