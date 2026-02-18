import { getDetailedAnalysis } from "@/app/action/admin";
import { submitResponse } from "@/app/action/personnel"; // You'll create this next
import { notFound } from "next/navigation";

export default async function FillSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getDetailedAnalysis(id);

  if (!survey) return notFound();

  return (
    <div className="max-w-2xl mx-auto p-10 text-white">
      <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
      <form action={submitResponse} className="space-y-8 mt-8">
        <input type="hidden" name="surveyId" value={id} />
        
        {survey.questions.map((q) => (
          <div key={q.id} className="space-y-3">
            <label className="block text-lg font-medium">{q.text}</label>
            {q.type === "SCORE" ? (
              <input 
                type="number" min="1" max="10" name={`ans-${q.id}`}
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded focus:border-blue-500 outline-none"
                placeholder="Score (1-10)" required
              />
            ) : (
              <textarea 
                name={`ans-${q.id}`}
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded h-32 focus:border-blue-500 outline-none"
                placeholder="Your detailed response..." required
              />
            )}
          </div>
        ))}
        <button className="w-full bg-green-600 p-4 rounded-xl font-bold hover:bg-green-500 transition">
          Submit Assessment
        </button>
      </form>
    </div>
  );
}