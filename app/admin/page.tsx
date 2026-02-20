// ✅ FIX 1: Named import for prisma (No default export)
import { prisma } from "@/lib/prisma"; 
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { AutoRefresh } from "./AutoRefresh"; 
// ✅ FIX 2: Path is singular 'SurveyFilter' in your explorer, not plural
import { SurveyFilters } from "./SurveyFilter"; 

export default async function AdminDashboard() {
  const surveys = await prisma.survey.findMany({
    include: { responses: true },
    orderBy: { createdAt: 'desc' }
  });

  // 📈 REGIONAL BASELINE LOGIC
  // ✅ FIX 3: Explicitly type 's' and 'r' to remove 'implicitly any' errors
  const allGlobalScores = surveys.flatMap((s: any) => 
    s.responses.map((r: any) => r.globalScore).filter(Boolean)
  ) as number[];

  const regionalAvg = allGlobalScores.length > 0 
    ? allGlobalScores.reduce((a: number, b: number) => a + b, 0) / allGlobalScores.length 
    : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8 gap-6">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Regional Console</h1>
            <p className="text-blue-500 text-xs font-bold uppercase tracking-[0.4em]">System Command & Control</p>
          </div>
          
          <div className="flex items-center gap-6">
            <AutoRefresh /> 
            <Link href="/surveys/new" className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full">+ New Survey</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="mb-8 p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Regional Performance Baseline</p>
          <h2 className="text-5xl font-black italic">{regionalAvg.toFixed(2)} <span className="text-sm opacity-30 not-italic">/ 5.0</span></h2>
        </div>

        {/* ✅ Logic and UI mapping handled in SurveyFilter.tsx */}
        <SurveyFilters surveys={surveys} regionalAvg={regionalAvg} />
      </div>
    </div>
  );
}