import { auth } from "@clerk/nextjs/server";
import { getDetailedAnalysis } from "@/app/action/admin";
import { notFound } from "next/navigation";
import { AnalysisClient } from "./AnalysisClient";

export default async function SurveyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. AWAIT params to fix Next.js 15+ errors
  const { id } = await params;
  const { userId } = await auth();

  // 2. Security check against .env OWNER_ID [cite: 2026-01-28]
  if (userId !== process.env.OWNER_ID) {
    return (
      <div className="p-10 text-red-500 font-black text-center bg-black min-h-screen uppercase italic tracking-tighter">
        ⛔ Access Denied: Admin Control Only
      </div>
    );
  }

  // 3. Fetch Data using your existing action
  const survey = await getDetailedAnalysis(id);
  if (!survey) return notFound();

  // 4. Pass data to the Client Component for interactivity
  return <AnalysisClient survey={survey} surveyId={id} />;
}