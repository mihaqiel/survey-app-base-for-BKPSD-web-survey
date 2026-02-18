import { getDetailedAnalysis } from "@/app/action/admin";
import ShareCard from "./ShareCard"; 
import ExportButton from "./ExportButton"; // <--- The new Export feature
import Link from "next/link";

// Helper function to color-code the ratings
const getRatingBadge = (value: string) => {
  switch (value) {
    case "1": return <span className="px-3 py-1 rounded bg-red-900 text-red-200 border border-red-700 text-xs font-bold">POOR</span>;
    case "2": return <span className="px-3 py-1 rounded bg-orange-900 text-orange-200 border border-orange-700 text-xs font-bold">FAIR</span>;
    case "3": return <span className="px-3 py-1 rounded bg-blue-900 text-blue-200 border border-blue-700 text-xs font-bold">GOOD</span>;
    case "4": return <span className="px-3 py-1 rounded bg-green-900 text-green-200 border border-green-700 text-xs font-bold">EXCELLENT</span>;
    default: return <span className="text-gray-500">-</span>;
  }
};

export default async function SurveyAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Get the ID from the URL
  const { id } = await params;
  
  // 2. Fetch the survey data
  const survey = await getDetailedAnalysis(id);

  // --- SAFETY CHECK: If survey doesn't exist, show this instead of crashing ---
  if (!survey) {
    return (
      <div className="p-10 text-white max-w-2xl mx-auto mt-10 border border-red-500 bg-red-900/20 rounded-xl">
        <h1 className="text-2xl font-bold text-red-500 mb-4">⚠️ Assessment Not Found</h1>
        <p className="mb-4">We looked for ID: <span className="font-mono bg-black p-1 rounded text-yellow-400">{id}</span></p>
        <Link href="/admin" className="bg-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-500">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  // --- MAIN PAGE UI ---
  return (
    <div className="p-10 text-white min-h-screen max-w-6xl mx-auto">
      <Link href="/admin" className="text-gray-400 hover:text-white mb-6 inline-block transition-colors">
        ← Back to Dashboard
      </Link>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* LEFT: Survey Info & Stats */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{survey.title}</h1>
            <p className="text-gray-400">Manage responses and export data.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex-1">
              <span className="block text-4xl font-bold text-white mb-1">{survey.responses.length}</span>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Total Responses</span>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex-1">
               <span className="block text-4xl font-bold text-blue-400 mb-1">{survey.questions.length}</span>
               <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Questions</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Share & QR Code Card (Client Component) */}
        <div>
          <ShareCard surveyId={id} />
        </div>
      </div>

      {/* --- DATA TABLE SECTION --- */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        
        {/* HEADER BAR WITH EXPORT BUTTON */}
        <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
          <h3 className="font-bold text-gray-200">Detailed Responses</h3>
          
          <div className="flex gap-3 items-center">
             {/* The Export Button Component */}
             <ExportButton survey={survey} /> 
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-950 text-left">
                <th className="p-4 text-gray-400 text-sm font-medium border-b border-gray-800 w-48">Date Submitted</th>
                {survey.questions.map((q) => (
                  <th key={q.id} className="p-4 text-gray-300 text-sm font-medium border-b border-gray-800 min-w-[200]">
                    {q.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {survey.responses.map((resp) => (
                <tr key={resp.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {new Date(resp.createdAt).toLocaleString()}
                  </td>
                  {survey.questions.map((q) => {
                    const answer = resp.answers.find((a) => a.questionId === q.id);
                    return (
                      <td key={q.id} className="p-4">
                        {answer ? (
                          q.type === "SCORE" ? getRatingBadge(answer.content) : (
                            <span className="text-gray-300 text-sm block max-w-xs">{answer.content}</span>
                          )
                        ) : (
                          <span className="text-gray-600 italic text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          
          {survey.responses.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
              <p className="mb-2 text-lg">No responses yet</p>
              <p className="text-sm">Scan the QR code above to submit the first test.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}