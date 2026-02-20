// ✅ Imports
import { prisma } from "@/lib/prisma"; 
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { AutoRefresh } from "./AutoRefresh"; 
import { SurveyFilters } from "./SurveyFilter"; 
import { WipeDataButton } from "./WipeDataButton"; // ✅ Ensure this file exists in the same folder

export default async function AdminDashboard() {
  // 1. Fetch data from Prisma
  const surveys = await prisma.survey.findMany({
    include: { 
      responses: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Focus on individual scoring
      } 
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Return the JSX (The React Component)
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

            {/* ✅ Interactive Wipe Button */}
            <WipeDataButton />

            <Link 
              href="/surveys/new" 
              className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors"
            >
              + New Survey
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-8 mb-4">
             <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
               Active Regional Nodes
             </h2>
             <div className="h-px flex-1 bg-white/5 mx-6" />
          </div>

          {/* ✅ Survey List and Filters */}
          <SurveyFilters surveys={surveys} />
        </div>
      </div>
    </div>
  );
}