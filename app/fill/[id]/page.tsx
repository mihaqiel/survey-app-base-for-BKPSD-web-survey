import { getPublicSurvey } from "@/app/action/personnel"; // ✅ Now using the public fetcher
import { submitResponse } from "@/app/action/personnel";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { CountdownTimer } from "./CountdownTimer";

const RATING_OPTIONS = [
  {
    value: "1",
    label: "Poor",
    activeClass: "peer-checked:bg-red-600 peer-checked:border-red-500",
  },
  {
    value: "2",
    label: "Fair",
    activeClass: "peer-checked:bg-orange-600 peer-checked:border-orange-500",
  },
  {
    value: "3",
    label: "Good",
    activeClass: "peer-checked:bg-blue-600 peer-checked:border-blue-500",
  },
  {
    value: "4",
    label: "Very Good",
    activeClass: "peer-checked:bg-indigo-600 peer-checked:border-indigo-500",
  },
  {
    value: "5",
    label: "Excellent",
    activeClass: "peer-checked:bg-green-600 peer-checked:border-green-500",
  },
];

export default async function FillSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await headers();
  const { id } = await params;

  // 🎯 Fetching publicly available data (No Admin Auth Block)
  const survey = await getPublicSurvey(id);

  if (!survey) return notFound();

  // 🛡️ THE SURGICAL CLOCK: Server-side check
  const now = new Date();
  const deadline = survey.expiresAt ? new Date(survey.expiresAt) : null;
  const isExpired = deadline !== null && now > deadline;
  const isClosed = !survey.isActive || isExpired;

  // 🎯 If the node is closed, this "Virtual Wall" renders instead of the form
  if (isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-10">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest uppercase italic">
            • Regional Node Closed
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            Assessment <br /> Expired
          </h1>
          <p className="text-gray-600 font-medium text-sm max-w-xs mx-auto">
            This portal was set for a specific duration and is no longer
            accepting responses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-white min-h-screen">
      <div className="mb-12 text-center flex flex-col items-center gap-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
          {survey.title}
        </h1>

        {/* ✅ LIVE COUNTDOWN: Replaces the broken "DEADLINE: NONE" badge */}
        {survey.expiresAt && <CountdownTimer expiresAt={survey.expiresAt} />}

        <p className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.4em] opacity-80 mt-2">
          Regional Assessment Portal
        </p>
      </div>

      <form action={submitResponse} className="space-y-8">
        <input type="hidden" name="surveyId" value={id} />

        {survey.questions.map((q: any, index: number) => (
          <div
            key={q.id}
            className="bg-gray-900/40 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all hover:border-blue-500/10 group text-left"
          >
            <h3 className="text-xl font-bold mb-10 group-hover:text-blue-400 transition-colors italic uppercase tracking-tighter">
              <span className="text-blue-500 mr-3 opacity-20 font-black not-italic">
                #{index + 1}
              </span>
              {q.text}
            </h3>
            {q.type === "SCORE" ? (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {RATING_OPTIONS.map((opt) => (
                  <label key={opt.value} className="cursor-pointer group/item">
                    <input
                      type="radio"
                      name={`answer_${q.id}`}
                      value={opt.value}
                      className="peer sr-only"
                      required
                    />
                    <div
                      className={`py-6 text-center rounded-[1.5rem] border border-white/5 bg-white/[0.03] transition-all duration-300 peer-checked:text-white peer-checked:scale-[1.05] hover:bg-white/[0.08] ${opt.activeClass}`}
                    >
                      <span className="block font-black text-3xl mb-1 tracking-tighter italic">
                        {opt.value}
                      </span>
                      <span className="text-[8px] uppercase font-black opacity-30 peer-checked:opacity-100 tracking-widest transition-opacity">
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
                placeholder="Provide regional feedback..."
                className="w-full p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all h-40 text-sm font-medium"
              />
            )}
          </div>
        ))}

        <button className="w-full bg-blue-600 py-7 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.2em] italic shadow-[0_20px_60px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] text-white border-b-4 border-blue-800 hover:bg-blue-500 mt-4">
          Submit Assessment
        </button>
      </form>
    </div>
  );
}
