import { 
  getAnalyticsOverview, 
  getQuestionDistribution, 
  getTrendData, 
  getSatisfactionComposition 
} from "@/app/action/analytics"; // Import the backend logic
import Link from "next/link";
import ChartsClient from "./ChartsClient";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 🛡️ SECURITY: Backend Calculation & Isolation
  // We fetch all 4 datasets in parallel for performance
  const [overview, distribution, trend, composition] = await Promise.all([
    getAnalyticsOverview(id),
    getQuestionDistribution(id),
    getTrendData(id),
    getSatisfactionComposition(id)
  ]);

  if (!overview) {
    return <div>Period not found or access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link href={`/admin/periode/${id}/analysis`} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-4 block transition-colors">
          ← Back to Analysis
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Executive Analytics</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Data Visualization & Strategic Insight
            </p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 text-[10px] font-black uppercase tracking-widest">
            Live Data Mode
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="max-w-6xl mx-auto">
        <ChartsClient 
          overview={overview}
          distribution={distribution}
          trend={trend}
          composition={composition}
        />
      </div>

    </div>
  );
}