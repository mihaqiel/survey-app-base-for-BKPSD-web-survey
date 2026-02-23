import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateSurvey } from "@/app/action/admin"; // <--- Make sure this import is not red!
import Link from "next/link";

// FIX: Simplified type definition to prevent "params" errors
export default async function EditSurveyPage({ params }: { params: any }) {
  // Await params to be safe for all Next.js versions
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { userId } = await auth();

  // 1. Security Check
  if (userId !== process.env.OWNER_ID) {
    return <div className="text-white p-10">Unauthorized Access</div>;
  }

  // 2. Fetch Existing Data
  // FIX: Removed "orderBy" so TypeScript doesn't complain
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { 
      questions: true 
    } 
  });

  if (!survey) return <div className="text-white p-10">Survey not found</div>;

  // Format existing date for the input
  const defaultDate = survey.expiresAt 
    ? new Date(survey.expiresAt).toISOString().slice(0, 16) 
    : "";

  return (
    <div className="p-10 text-white max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Assessment</h1>
        <Link href="/admin" className="text-gray-400 hover:text-white">Cancel</Link>
      </div>

      <form action={updateSurvey} className="space-y-6">
        <input type="hidden" name="id" value={survey.id} />

        <div className="space-y-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="space-y-2">
            <label className="text-sm text-blue-400 font-bold uppercase">Title</label>
            <input
              name="title"
              defaultValue={survey.title}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-blue-400 font-bold uppercase">Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              defaultValue={defaultDate}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-400">Questions</h2>
          {survey.questions.map((q: any, i: number) => (
            <div key={q.id} className="flex gap-4 items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
              <span className="text-gray-500 font-mono">#{i + 1}</span>
              <input type="hidden" name="qId" value={q.id} />
              <div className="flex-1">
                <input
                  name="qText"
                  defaultValue={q.text}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 p-4 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg text-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}