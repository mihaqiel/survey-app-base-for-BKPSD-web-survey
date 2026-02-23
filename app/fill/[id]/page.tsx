import { getPublicSurvey } from "@/app/action/personnel"; 
import { notFound } from "next/navigation";
import WizardClient from "./WizardClient";

export default async function FillSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 🎯 Fetching publicly available data (No Admin Auth Block required here)
  const survey = await getPublicSurvey(id);

  if (!survey) return notFound();

  // 🛡️ THE SURGICAL CLOCK: Server-side security check
  const now = new Date();
  const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline; 
  const isClosed = !survey.isActive || isExpired;

  // 🎯 The "Virtual Wall" - Prevents entry if the node is closed or out of time
  if (isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-10">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest uppercase italic">
            • Regional Node Closed
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            Assessment <br/> Expired
          </h1>
          <p className="text-gray-600 font-medium text-sm max-w-xs mx-auto">
            This portal was set for a specific duration and is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  // If the node is active, inject the data directly into our new Stateful UI
  return <WizardClient survey={survey} />;
}