"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { clearAllResponses, deleteSurvey, toggleSurveyStatus } from "@/app/action/admin";

// 🛡️ INLINED COMPONENT: AutoRefresh
function AutoRefresh() {
  const [enabled, setEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (enabled) {
      interval = setInterval(() => { router.refresh(); }, 10000); // 10s Live Feed
    }
    return () => clearInterval(interval);
  }, [enabled, router]);

  return (
    <div className="flex items-center gap-3 bg-gray-900/50 border border-white/10 px-4 py-2 rounded-full">
      <span className={`text-[9px] font-black uppercase tracking-widest ${enabled ? 'text-green-500 animate-pulse' : 'text-gray-500'}`}>
        {enabled ? "Live Feed Active" : "Static Mode"}
      </span>
      <button onClick={() => setEnabled(!enabled)} className={`w-10 h-5 rounded-full relative transition-all duration-300 ${enabled ? 'bg-green-600' : 'bg-gray-700'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

// 🛡️ INLINED COMPONENT: WipeDataButton
function WipeDataButton() {
  const handleWipe = async () => {
    if (window.confirm("DANGER: This will wipe all current test results and reset Mean/Index scores. Continue?")) {
      await clearAllResponses();
    }
  };
  return (
    <button onClick={handleWipe} className="px-6 py-3 border border-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-red-900/20 transition-all">
      Wipe Test Data
    </button>
  );
}

// 🛡️ INLINED COMPONENT: StatusToggle
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

// 🛡️ INLINED COMPONENT: LiveTicker
function LiveTicker({ surveys }: { surveys: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeSurveys = surveys.filter(s => s.isActuallyActive);

  useEffect(() => {
    if (activeSurveys.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeSurveys.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSurveys.length]);

  if (activeSurveys.length === 0) return <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">NO ACTIVE TRANSMISSIONS DETECTED...</span>;

  const current = activeSurveys[currentIndex];
  return (
    <div className="flex items-center gap-4 animate-in fade-in duration-500" key={currentIndex}>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">NODE ACTIVE:</span>
      <span className="text-sm font-black italic truncate">{current.title}</span>
      <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md font-mono text-gray-400">
        {current.responses?.[0]?.globalScore || 0}% Index
      </span>
    </div>
  );
}

// 🛡️ MAIN WRAPPER: Admin Dashboard Client
export default function AdminClient({ surveys }: { surveys: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [surveys, searchTerm]);

  if (!mounted) return null; // Hydration fix

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8 gap-6 text-left">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Regional Console</h1>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">System Command & Control</p>
          </div>
          <div className="flex items-center gap-4">
            <AutoRefresh /> 
            <WipeDataButton />
            <Link href="/surveys/new" className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              + New Survey
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* LIVE TICKER */}
        <div className="mb-8 bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden flex items-center gap-6">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] shrink-0" />
          <div className="flex-1 overflow-hidden">
            <LiveTicker surveys={surveys} />
          </div>
        </div>

        {/* SEARCH & LIST */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between px-8 mb-4">
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Active Regional Nodes</h2>
             <div className="h-px flex-1 bg-white/5 mx-6" />
             <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">UTC Sync Active</span>
          </div>

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

            {/* NODE CARDS */}
            <div className="grid gap-4">
              {filteredSurveys.map((survey: any) => {
                const latestResponse = survey.responses?.[0]; 
                const meanScore = latestResponse?.primaryScore || 0; 
                const indexScore = latestResponse?.globalScore || 0; 

                return (
                  <div key={survey.id} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center transition-all group hover:border-blue-500/20">
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
                          <Link href={`/surveys/${survey.id}/edit`} className="p-3 bg-gray-900 border border-white/5 rounded-xl hover:text-blue-400 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                          </Link>
                          <button onClick={async () => { if(confirm("Permanently delete this node?")) await deleteSurvey(survey.id); }} className="p-3 bg-gray-900 border border-white/5 rounded-xl hover:text-red-500 transition-all">
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
        </div>

      </div>
    </div>
  );
}