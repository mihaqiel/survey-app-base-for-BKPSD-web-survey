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
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8] px-6">
      <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-xl font-black">!</span>
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-[#132B4F] mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Halaman gagal dimuat. Silakan coba lagi atau hubungi administrator.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#132B4F] text-white text-xs font-black uppercase tracking-widest hover:bg-[#009CC5] transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
