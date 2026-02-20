import Link from "next/link";
import { auth } from "@clerk/nextjs/server"; 

export default async function Home() {
  const { userId } = await auth(); // Check if the user is logged in

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white relative">
      
      {/* --- SMART ADMIN BUTTON (Top Right) --- */}
      <div className="absolute top-5 right-5">
        {userId ? (
          // If logged in: Show "Dashboard"
          <Link 
            href="/admin" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-full hover:bg-blue-600 hover:text-white transition-all font-bold text-sm"
          >
            <span>Dashboard</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        ) : (
          // If logged out: Show "Admin Login"
          <Link 
            href="/admin" 
            className="text-gray-500 hover:text-white transition-colors text-sm font-mono flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Admin Access
          </Link>
        )}
      </div>
      {/* -------------------------------------- */}

      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {/* You can keep your existing Welcome Text here */}
        <div className="text-center w-full">
            <h1 className="text-5xl font-bold mb-6 bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Regional Assessment
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto mb-10">
              Secure internal platform for employee evaluation and data collection.
            </p>
            
            {!userId && (
              <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50 inline-block">
                <p className="text-xs text-gray-500">System Status: <span className="text-green-500">● Online</span></p>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}