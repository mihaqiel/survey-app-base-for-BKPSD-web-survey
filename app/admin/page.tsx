import { prisma } from "@/lib/prisma"; 
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { AutoRefresh } from "./AutoRefresh"; 
import { SurveyFilters } from "./SurveyFilter"; 
import { WipeDataButton } from "./WipeDataButton"; 

export default async function AdminDashboard() {
  const surveys = await prisma.survey.findMany({
    include: { 
      responses: {
        orderBy: { createdAt: 'desc' },
        take: 1, 
      } 
    },
    orderBy: { createdAt: 'desc' }
  });

  const surveysWithTimeStatus = surveys.map(survey => {
    const now = new Date();
    const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
    const isExpired = deadline !== null && now > deadline;
    const isActuallyActive = survey.isActive && !isExpired;

    return {
      ...survey,
      isActuallyActive // ✅ Pass this to kill the status conflict bug [cite: 2026-02-21]
    };
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8 gap-6 text-left">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              Regional Console
            </h1>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              System Command & Control
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <AutoRefresh /> 
            <WipeDataButton />
            <Link 
              href="/surveys/new" 
              className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              + New Survey
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between px-8 mb-4">
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">
               Active Regional Nodes
             </h2>
             <div className="h-px flex-1 bg-white/5 mx-6" />
             <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">
               UTC Sync Active
             </span>
          </div>

          <SurveyFilters surveys={surveysWithTimeStatus} />
        </div>
      </div>
    </div>
  );
}