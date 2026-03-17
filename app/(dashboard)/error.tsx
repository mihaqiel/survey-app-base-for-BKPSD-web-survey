"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-xl font-bold">!</span>
        </div>
        <h2 className="text-sm font-bold text-slate-900 mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Halaman gagal dimuat. Silakan coba lagi atau hubungi administrator.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
