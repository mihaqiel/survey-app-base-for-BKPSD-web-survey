import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { submitResponse } from "@/app/action/submit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { questions: true }, 
  });

  if (!survey) return notFound();

  // 🕒 UTC-SAFE COMPARISON
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
        {/* DEBUG BADGE: Delete this once testing is done */}
        <div className="mb-4 text-center">
            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-800">
                Server Time: {now.toLocaleTimeString()} | Deadline: {deadline ? deadline.toLocaleTimeString() : "None"}
            </span>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black mb-3 tracking-tight">{survey.title}</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Public Assessment Portal</p>
        </div>

        <form action={submitResponse} className="space-y-8">
          <input type="hidden" name="surveyId" value={survey.id} />
          {survey.questions.map((q: any, i: number) => (
            <div key={q.id} className="bg-gray-900 p-8 rounded-[4xl] border border-gray-800 shadow-xl transition-all hover:border-blue-500/20">
              <label className="block text-xl mb-6 font-bold leading-tight">
                <span className="text-blue-600 mr-3 opacity-40 font-mono">#{i + 1}</span>
                {q.text}
              </label>

              {q.type === "SCORE" ? (
                <div className="flex justify-between gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="flex-1 cursor-pointer group">
                      <input type="radio" name={`answer_${q.id}`} value={num} required className="peer hidden" />
                      <div className="py-5 text-center rounded-2xl bg-gray-800 border border-gray-700 text-xl font-black text-gray-500 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 transition-all hover:bg-gray-750 group-hover:scale-105 active:scale-95">
                        {num}
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-5 text-white outline-none focus:border-blue-600 transition-all font-medium" 
                />
              )}
            </div>
          ))}

          <button type="submit" className="w-full bg-blue-600 py-6 rounded-2xl font-black text-xl hover:bg-blue-500 shadow-2xl shadow-blue-900/30 transition-all active:scale-[0.98] uppercase tracking-widest">
            Submit Assessment
          </button>
        </form>
      </div>
    </div>
  );
}