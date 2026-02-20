import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { submitResponse } from "@/app/action/submit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🏷️ Labels for the 1-5 Scale to match Admin Analysis
const RATING_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: true }, 
  });

  if (!survey) return notFound();

  // 🕒 UTC-SAFE COMPARISON (Preserved from original code)
  const now = new Date();
  const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline ? now.getTime() > deadline.getTime() : false;

  if (isExpired) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 p-12 rounded-[2.5rem] border border-red-900/20 text-center max-w-md shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50" />
           <div className="bg-red-500/10 text-red-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
           </div>
           <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">Assessment Closed</h1>
           <p className="text-gray-400 mb-8 leading-relaxed font-medium">
             The deadline for <span className="text-white font-bold">"{survey.title}"</span> has passed. 
           </p>
           <div className="text-[10px] text-gray-500 bg-black/50 py-3 px-6 rounded-full border border-gray-800 inline-block uppercase tracking-[0.3em] font-black">
             Closed: {deadline?.toLocaleString()}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex justify-center">
      <div className="max-w-2xl w-full">
        {/* DEBUG BADGE */}
        <div className="mb-4 text-center">
            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-800 font-bold uppercase tracking-widest">
                Server Status: Active | Deadline: {deadline ? deadline.toLocaleTimeString() : "None"}
            </span>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black mb-3 tracking-tighter italic uppercase leading-none">{survey.title}</h1>
          <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em]">Public Assessment Portal</p>
        </div>

        <form action={submitResponse} className="space-y-8">
          <input type="hidden" name="surveyId" value={survey.id} />
          
          {survey.questions.map((q: any, i: number) => (
            <div key={q.id} className="bg-gray-900/50 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all hover:border-blue-500/20 group">
              <label className="block text-xl mb-10 font-black italic uppercase tracking-tighter leading-tight group-hover:text-blue-400 transition-colors">
                <span className="text-blue-600 mr-3 opacity-30 font-black not-italic">#{i + 1}</span>
                {q.text}
              </label>

              {q.type === "SCORE" ? (
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="flex-1 cursor-pointer group/item">
                      <input type="radio" name={`answer_${q.id}`} value={num} required className="peer hidden" />
                      <div className="py-6 flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-500 transition-all peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 hover:bg-white/[0.08] active:scale-95 peer-checked:scale-[1.05]">
                        <span className="text-3xl font-black italic tracking-tighter">{num}</span>
                        {/* ✅ "Excellent" label now visible under 5 */}
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-30 peer-checked:opacity-100 transition-opacity">
                          {RATING_LABELS[num - 1]}
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
                  placeholder="Provide detailed regional feedback..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 text-white outline-none focus:border-blue-600 focus:bg-white/[0.06] transition-all font-medium placeholder:text-gray-800 text-sm" 
                />
              )}
            </div>
          ))}

          <button type="submit" className="w-full bg-blue-600 py-7 rounded-[2.5rem] font-black text-xl hover:bg-blue-500 shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] uppercase tracking-[0.3em] italic border-b-4 border-blue-800">
            Submit Assessment
          </button>
        </form>

        <footer className="mt-12 text-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-widest">Powered by Regional Node Command</p>
        </footer>
      </div>
    </div>
  );
}