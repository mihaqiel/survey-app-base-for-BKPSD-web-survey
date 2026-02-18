import { getDetailedAnalysis } from "@/app/action/admin";
import { submitResponse } from "@/app/action/personnel";
import { notFound } from "next/navigation";

// 1. Define Colors for each Rating Level
const RATING_OPTIONS = [
  { 
    value: "1", 
    label: "Poor", 
    // Red for bad
    activeClass: "peer-checked:bg-red-600 peer-checked:border-red-500" 
  },
  { 
    value: "2", 
    label: "Fair", 
    // Orange for okay
    activeClass: "peer-checked:bg-orange-600 peer-checked:border-orange-500" 
  },
  { 
    value: "3", 
    label: "Good", 
    // Blue for good
    activeClass: "peer-checked:bg-blue-600 peer-checked:border-blue-500" 
  },
  { 
    value: "4", 
    label: "Excellent", 
    // Green for perfect
    activeClass: "peer-checked:bg-green-600 peer-checked:border-green-500" 
  },
];

export default async function FillSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getDetailedAnalysis(id);

  if (!survey) return notFound();

  return (
    <div className="max-w-2xl mx-auto p-8 text-white min-h-screen">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
        <p className="text-gray-400">Select the option that matches your experience.</p>
      </div>

      <form action={submitResponse} className="space-y-8">
        <input type="hidden" name="surveyId" value={id} />
        
        {survey.questions.map((q, index) => (
          <div key={q.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm">
            <h3 className="text-lg font-medium mb-6 text-gray-200">
              <span className="text-blue-500 mr-2 font-bold">{index + 1}.</span>
              {q.text}
            </h3>

            {q.type === "SCORE" ? (
              <div className="grid grid-cols-2 gap-4">
                {RATING_OPTIONS.map((option) => (
                  <label key={option.value} className="cursor-pointer relative group">
                    <input 
                      type="radio" 
                      name={`ans-${q.id}`} 
                      value={option.value} 
                      className="peer sr-only"
                      required
                    />
                    {/* DYNAMIC CLASSES: 
                       1. Default state: gray background
                       2. Hover state: slight gray lighten
                       3. Checked state: The specific color defined in activeClass
                    */}
                    <div className={`
                      p-4 text-center rounded-lg border-2 border-gray-700 bg-gray-800 
                      transition-all duration-200 ease-in-out
                      hover:border-gray-500 hover:bg-gray-750
                      peer-checked:text-white peer-checked:scale-[1.02] peer-checked:shadow-lg
                      ${option.activeClass}
                    `}>
                      <span className="font-bold text-lg">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <textarea 
                name={`ans-${q.id}`}
                className="w-full p-4 bg-black/40 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none h-32 transition-colors"
                placeholder="Please explain in detail..."
                required
              />
            )}
          </div>
        ))}

        <button className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition shadow-xl mt-8">
          Submit Assessment
        </button>
      </form>
    </div>
  );
}