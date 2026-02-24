"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// 👇 FIXED IMPORT: Pointing to 'check-token' instead of 'auth-token'
import { verifyToken } from "@/app/action/check-token"; 

export default function EnterPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  
  const [token, setToken] = useState(tokenFromUrl || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill token from QR
  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    
    // Call Server Action
    const result = await verifyToken(formData);
    
    // If we get here, it means there was an error (redirect didn't happen)
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black">GOV</div>
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Survey Portal</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">Enter Token to Begin</p>
        
        <form action={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            name="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. LK-202602-X9K2"
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-mono text-center font-bold uppercase"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter Survey"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-xs font-bold animate-pulse">{error}</p>}
      </div>
    </div>
  );
}