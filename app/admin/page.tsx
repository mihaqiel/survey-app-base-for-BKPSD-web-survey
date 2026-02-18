import { getAllSurveys, deleteSurvey } from "@/app/action/admin";
import Link from "next/link";

export default async function AdminDashboard() {
  const surveys = await getAllSurveys();

  return (
    <div className="p-10 text-white max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track regional assessments</p>
        </div>
        <Link 
          href="/surveys/new" 
          className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg flex items-center gap-2"
        >
          <span>+</span> Create New
        </Link>
      </div>

      <div className="grid gap-4">
        {surveys.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed text-gray-500">
            No assessments found.
          </div>
        ) : (
          surveys.map((survey) => {
            // Check if deadline has passed
            const isExpired = survey.expiresAt && new Date() > new Date(survey.expiresAt);
            
            return (
              <div key={survey.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-center group hover:border-blue-500/30 transition-all">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{survey.title}</h2>
                    {isExpired && (
                      <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 font-bold uppercase tracking-wider">
                        Expired
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                    <span>Created: {new Date(survey.createdAt).toLocaleDateString()}</span>
                    {survey.expiresAt && (
                      <span className={isExpired ? "text-red-400" : "text-yellow-500"}>
                        {/* UPDATED: Added time formatting below */}
                        Deadline: {new Date(survey.expiresAt).toLocaleString([], { 
                          day: 'numeric', 
                          month: 'numeric', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-blue-400">
                      {survey._count.responses}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Responses</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/surveys/${survey.id}`}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-sm font-medium transition"
                    >
                      Analysis
                    </Link>

                    <form action={async () => {
                      "use server";
                      await deleteSurvey(survey.id);
                    }}>
                      <button className="p-2 text-gray-600 hover:text-red-500 transition-colors rounded-lg border border-transparent hover:border-red-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}