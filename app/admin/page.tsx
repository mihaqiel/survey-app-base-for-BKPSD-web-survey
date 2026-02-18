import { getDetailedAnalysis } from "@/app/action/admin";
import Link from "next/link";

export default async function SurveyAnalysisPage({ params }: { params: { id: string } }) {
  const { id } = await params; // Ensure params are awaited in newer Next.js versions
  const survey = await getDetailedAnalysis(id);

  if (!survey) {
    return <div className="p-10 text-white text-center">Assessment not found.</div>;
  }

  return (
    <div className="p-10 text-white">
      <div className="mb-8">
        <Link href="/admin" className="text-blue-400 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        <p className="text-gray-400">{survey.description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="p-4 border-b border-gray-700">Date Submitted</th>
              {survey.questions.map((q) => (
                <th key={q.id} className="p-4 border-b border-gray-700 font-medium">
                  {q.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {survey.responses.map((resp) => (
              <tr key={resp.id} className="hover:bg-gray-800 transition-colors border-b border-gray-800">
                <td className="p-4 text-sm text-gray-400">
                  {new Date(resp.createdAt).toLocaleString()}
                </td>
                {survey.questions.map((q) => {
                  // Find the answer that matches this specific question
                  const answer = resp.answers.find((a) => a.questionId === q.id);
                  return (
                    <td key={q.id} className="p-4">
                      {answer ? (
                        <span className="text-gray-200">{answer.content}</span>
                      ) : (
                        <span className="text-gray-600 italic">No answer</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {survey.responses.length === 0 && (
          <div className="text-center py-10 bg-gray-900 text-gray-500">
            No one has responded to this assessment yet.
          </div>
        )}
      </div>
    </div>
  );
}