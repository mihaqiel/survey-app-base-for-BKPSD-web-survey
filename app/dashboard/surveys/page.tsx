import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { submitResponse } from "@/app/action/submit";
import { headers } from "next/headers";
import { StatusGuard } from "@/app/surveys/[id]/StatusGuard";
import { AutoSave } from "@/app/surveys/[id]/AutoSave";

// ✅ UI Mapping: Restores descriptive labels
const labels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent"
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  // Forces fresh database check every time the link is opened [cite: 2026-02-18]
  await headers(); 
  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!survey) return notFound();

  // 🕒 DUAL-LAYER SECURITY LOGIC: Time and Toggle check
  const now = new Date();
  const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline;
  const isClosed = survey.isActive === false || isExpired;

  // ✅ FIX: Redirect to PLURAL path '/surveys/' to avoid 404
  if (isClosed) {
    redirect(`/surveys/${id}`); 
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex justify-center">
      {/* Background processes for status monitoring and drafts */}
      <StatusGuard surveyId={id} expiresAt={survey.expiresAt} />
      <AutoSave surveyId={id} />

      <div className="max-w-2xl w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black mb-3 tracking-tight italic uppercase">{survey.title}</h1>
          <p className="text-blue-500 font-bold uppercase text-[10px] tracking-[0.3em]">
            Secure Regional Assessment Portal
          </p>
        </div>

        <form action={submitResponse} className="space-y-8">
          <input type="hidden" name="surveyId" value={survey.id} />

          {survey.questions.map((q: any, i: number) => (
            <div key={q.id} className="bg-gray-900/50 p-8 rounded-[3rem] border border-white/5 transition-all hover:border-blue-500/20 group">
              <label className="block text-xl mb-6 font-bold leading-tight group-hover:text-blue-400 transition-colors">
                <span className="text-blue-600 mr-3 opacity-30 font-mono">#{i + 1}</span>
                {q.text}
              </label>

              {q.type === "SCORE" ? (
                // ✅ RATING LOGIC: 1-5 scale with visual labels
                <div className="flex justify-between gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="flex-1 cursor-pointer group/item">
                      <input type="radio" name={`answer_${q.id}`} value={num} required className="peer hidden" />
                      
                      <div className="py-4 text-center rounded-2xl bg-white/5 border border-white/10 peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all hover:bg-white/10 group-hover/item:scale-[1.05]">
                        <span className="block text-xl font-black text-white">{num}</span>
                        <span className="text-[8px] uppercase opacity-40 font-black tracking-tighter">
                           {labels[num]}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea 
                  name={`answer_${q.id}`} 
                  required 
                  rows={4} 
                  placeholder="Provide detailed feedback..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-gray-700" 
                />
              )}
            </div>
          ))}

          <button 
            type="submit" 
            className="w-full bg-blue-600 py-6 rounded-3xl font-black text-xl hover:bg-blue-500 shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition-all active:scale-[0.98] uppercase tracking-widest text-white"
          >
            Submit Assessment
          </button>
        </form>
      </div>
    </div>
  );
}