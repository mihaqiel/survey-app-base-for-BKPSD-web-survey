import { auth } from "@clerk/nextjs/server";
import { getDetailedAnalysis } from "@/app/action/admin";
import Link from "next/link";
// Go up ONE level to find components in the parent [id] folder
import ShareCard from "../ShareCard"; 
import ExportButton from "../ExportButton"; 

const getRatingBadge = (value: string) => {
  const num = parseInt(value);
  if (num <= 2) return <span className="px-2 py-1 rounded bg-red-900/50 text-red-400 border border-red-700/50 text-[10px] font-bold">POOR</span>;
  if (num === 3) return <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-400 border border-blue-700/50 text-[10px] font-bold">GOOD</span>;
  return <span className="px-2 py-1 rounded bg-green-900/50 text-green-400 border border-green-700/50 text-[10px] font-bold">EXCELLENT</span>;
};

export default async function SurveyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. AWAIT params to fix Next.js 15+ errors
  const { id } = await params;
  const { userId } = await auth();

  // 2. Security check against .env OWNER_ID
  if (userId !== process.env.OWNER_ID) {
    return (
      <div className="p-10 text-red-500 font-bold text-center bg-black min-h-screen">
        ⛔ Access Denied: Admin Only
      </div>
    );
  }

  // 3. Fetch Data
  const survey = await getDetailedAnalysis(id);
  if (!survey) return <div className="p-10 text-white bg-black min-h-screen">Assessment not found.</div>;

  return (
    <div className="p-10 text-white min-h-screen max-w-6xl mx-auto text-left">
      <Link href="/admin" className="text-gray-400 hover:text-white mb-6 inline-block transition-colors font-medium">
        ← Back to Dashboard
      </Link>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-2">{survey.title}</h1>
          <div className="inline-block bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30">
            <span className="text-2xl font-bold">{survey.responses.length}</span>
            <span className="ml-2 text-sm uppercase font-semibold">Total Responses</span>
          </div>
        </div>
        <ShareCard surveyId={id} />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
          <h3 className="font-bold text-gray-200">Detailed Responses</h3>
          <ExportButton survey={survey} />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-950">
                <th className="p-4 text-gray-400 text-sm border-b border-gray-800">Date Submitted</th>
                {survey.questions.map((q) => (
                  <th key={q.id} className="p-4 text-gray-300 text-sm border-b border-gray-800 min-w-[150]">
                    {q.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {survey.responses.map((resp) => (
                <tr key={resp.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {new Date(resp.createdAt).toLocaleDateString()}
                  </td>
                  {survey.questions.map((q) => {
                    const answer = resp.answers.find((a) => a.questionId === q.id);
                    return (
                      <td key={q.id} className="p-4 text-sm text-gray-300">
                        {answer ? (
                          q.type === "SCORE" ? getRatingBadge(answer.content) : answer.content
                        ) : (
                          <span className="text-gray-700 italic">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}