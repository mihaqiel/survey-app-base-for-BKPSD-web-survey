import { getDetailedAnalysis } from "@/app/action/admin";
import { submitResponse } from "@/app/action/personnel";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

const RATING_OPTIONS = [
  { value: "1", label: "Poor", activeClass: "peer-checked:bg-red-600 peer-checked:border-red-500" },
  { value: "2", label: "Fair", activeClass: "peer-checked:bg-orange-600 peer-checked:border-orange-500" },
  { value: "3", label: "Good", activeClass: "peer-checked:bg-blue-600 peer-checked:border-blue-500" },
  { value: "4", label: "Very Good", activeClass: "peer-checked:bg-indigo-600 peer-checked:border-indigo-500" },
  { value: "5", label: "Excellent", activeClass: "peer-checked:bg-green-600 peer-checked:border-green-500" },
];

export default async function FillSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Ensures fresh database checks on every page load [cite: 2026-02-18]
  await headers(); 
  const { id } = await params;
  const survey = await getDetailedAnalysis(id);

  if (!survey) return notFound();

  // 🛡️ REFINED GUARD LOGIC: Comparison of Current Time vs. Database Deadline [cite: 2026-02-18]
  const now = new Date();
  const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline; // Compare Date objects [cite: 2026-02-18]
  const isClosed = !survey.isActive || isExpired;

  // ✅ REDIRECT FIX: Plural path '/surveys/' prevents 404
  if (isClosed) {
    redirect(`/surveys/${id}`); 
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-white min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">{survey.title}</h1>
        <p className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.3em]">
          Regional Assessment Portal
        </p>
      </div>

      <form action={submitResponse} className="space-y-8">
        <input type="hidden" name="surveyId" value={id} />
        
        {survey.questions.map((q: any, index: number) => (
          <div key={q.id} className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-xl transition-all hover:border-blue-500/10 group">
            <h3 className="text-xl font-bold mb-6 group-hover:text-blue-400 transition-colors">
              <span className="text-blue-500 mr-3 opacity-30">#{index + 1}</span>
              {q.text}
            </h3>

            {q.type === "SCORE" ? (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {RATING_OPTIONS.map((opt) => (
                  <label key={opt.value} className="cursor-pointer group/item">
                    {/* ✅ Standardized name prefix for submitResponse logic */}
                    <input type="radio" name={`answer_${q.id}`} value={opt.value} className="peer sr-only" required />
                    <div className={`
                      py-4 text-center rounded-2xl border border-white/10 bg-white/5 
                      transition-all duration-200 peer-checked:text-white peer-checked:scale-[1.02]
                      group-hover/item:scale-[1.05] ${opt.activeClass}
                    `}>
                      <span className="block font-black text-xl mb-0.5">{opt.value}</span>
                      <span className="text-[8px] uppercase font-black opacity-40 tracking-tighter">
                        {opt.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <textarea 
                name={`answer_${q.id}`} 
                required 
                placeholder="Provide detailed regional feedback..."
                className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:border-blue-500 focus:ring-1 transition-all h-32 placeholder:text-gray-700" 
              />
            )}
          </div>
        ))}

        <button className="w-full bg-blue-600 py-6 rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-[0_20px_50px_rgba(37,99,235,0.25)] transition-all active:scale-[0.98] text-white">
          Submit Assessment
        </button>
      </form>
    </div>
  );
}