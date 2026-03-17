"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-xl font-bold">!</span>
        </div>
        <h2 className="text-sm font-bold text-slate-900 mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Halaman tidak dapat dimuat. Silakan coba lagi.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-gray-50 transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
