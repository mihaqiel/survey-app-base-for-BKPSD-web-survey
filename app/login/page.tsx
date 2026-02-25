"use client";

import { login } from "@/app/action/auth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isError = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-md w-full text-center">
        
        {/* LOGO / ICON */}
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black">
          GOV
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Admin Login</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">Badan Kepegawaian dan Pengembagan Sumber Daya Manusia</p>

        {/* LOGIN FORM */}
        <form action={login} className="space-y-4 text-left">
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block text-gray-500">Username</label>
            <input 
              name="username" 
              type="text" 
              required
              placeholder="admin"
              className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-black transition-colors font-bold"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 mb-2 block text-gray-500">Password</label>
            <input 
              name="password" 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl outline-none focus:border-black transition-colors font-bold"
            />
          </div>

          {isError && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl text-center">
              ❌ Invalid Credentials
            </div>
          )}

          <button className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all mt-4">
            Secure Login →
          </button>
        </form>

        <p className="mt-8 text-[10px] text-gray-300 uppercase font-bold tracking-widest">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}