"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { verifyToken } from "@/app/action/check-token"; 

// 1. Logic Component
function TokenFormContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 AUTO-FILL: Grabs token from URL immediately
  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await verifyToken(formData);
    
    // Handle Server Action Response
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the server action redirects us to /portal
  }

  return (
    <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-gray-100">
      <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black">GOV</div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black">Survey Portal</h1>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">Enter Token to Begin</p>
      
      <form action={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="e.g. SKM-2026"
          autoComplete="off"
          // 🎨 VISIBILITY FIX: Forced text-black
          className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-mono text-center font-bold uppercase text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
        />
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? "Verifying..." : "Enter Survey"}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-red-500 text-xs font-bold animate-pulse">{error}</p>
        </div>
      )}
    </div>
  );
}

// 2. Main Page Wrapper (Required for Suspense)
export default function EnterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-black font-bold">Loading Portal...</div>}>
        <TokenFormContent />
      </Suspense>
    </div>
  );
}