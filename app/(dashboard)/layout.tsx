import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Fetch all surveys for the sidebar list
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, isActive: true, expiresAt: true }
  });

  // 2. Calculate true active status (checking UTC deadlines)
  const sidebarNodes = surveys.map(survey => {
    const now = new Date();
    const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
    const isExpired = deadline !== null && now > deadline;
    const isActuallyActive = survey.isActive && !isExpired;
    return { ...survey, isActuallyActive };
  });

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* 🏛️ TOP BRANDING HEADER (3 LOGOS) */}
      <header className="h-16 w-full border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-6 z-50 flex-shrink-0 relative">
        {/* Left Logo */}
        <div className="flex items-center h-full">
           <img src="/logo-left.png" alt="Organization Left" className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Center Logo (Perfectly Centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center h-full py-2">
           <img src="/logo-center.png" alt="Organization Center" className="h-10 w-auto object-contain" />
        </div>

        {/* Right Logo */}
        <div className="flex items-center h-full">
           <img src="/logo-right.png" alt="Organization Right" className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </header>

      {/* LOWER SECTION: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 🚀 THE PERSISTENT SIDEBAR */}
        <aside className="w-80 flex-shrink-0 border-r border-white/5 bg-[#0A0A0A] flex flex-col h-full hidden md:flex">
          
          {/* Header */}
          <div className="p-8 border-b border-white/5">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
              Regional<br/>Command
            </h1>
            <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">
              System Console v2.0
            </p>
          </div>

          {/* Global Dashboard Link */}
          <div className="p-6">
            <Link href="/admin" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
              <span className="bg-white/5 p-2 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              </span>
              <span className="font-black uppercase text-[10px] tracking-widest">Global Dashboard</span>
            </Link>
          </div>

          {/* Initialize Button */}
          <div className="px-6 mb-8">
            <Link href="/surveys/new" className="flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(37,99,235,0.15)]">
              + Initialize New Node
            </Link>
          </div>

          {/* Dynamic Nodes List */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-2">Active Deployments</p>
            
            {sidebarNodes.length === 0 ? (
              <p className="text-[10px] text-gray-600 italic px-2">No active nodes.</p>
            ) : (
              sidebarNodes.map((node) => (
                <Link 
                  key={node.id} 
                  href={`/surveys/${node.id}/results`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full shadow-lg shrink-0 ${node.isActuallyActive ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-white truncate italic">
                    {node.title}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-white/5 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-700">Powered by Node Command</p>
          </div>
        </aside>

        {/* 🚀 THE DYNAMIC CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative bg-[#050505]">
          {children}
        </main>

      </div>
    </div>
  );
}