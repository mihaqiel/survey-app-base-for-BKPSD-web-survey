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
        <div className="w-12 h-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-xl font-black">!</span>
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-[#132B4F] mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Halaman tidak dapat dimuat. Silakan coba lagi.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#132B4F] text-white text-xs font-black uppercase tracking-widest hover:bg-[#009CC5] transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-gray-200 text-xs font-black uppercase tracking-widest text-[#132B4F] hover:border-[#009CC5] transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
