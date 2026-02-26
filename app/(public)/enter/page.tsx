"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { verifyToken } from "@/app/action/check-token";

function TokenFormContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await verifyToken(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center px-4 py-16 bg-[#F0F4F8]">
      <div className="w-full max-w-lg">

        {/* CARD */}
        <div className="bg-white border border-gray-200 shadow-lg overflow-hidden">

          {/* CARD HEADER */}
          <div className="bg-[#132B4F] px-8 py-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-[#FAE705]" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
                Portal Survei Kepuasan Masyarakat
              </p>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
              Masukkan Token<br />
              <span className="text-[#FAE705]">Akses Survei</span>
            </h1>
          </div>

          {/* TOP ACCENT */}
          <div className="h-1" style={{ background: "linear-gradient(to right, #FAE705, #009CC5)" }} />

          {/* FORM BODY */}
          <div className="px-8 py-8">
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Token akses tersedia pada QR Code yang dipasang di loket pelayanan BKPSDM. Pindai kode atau masukkan token secara manual.
            </p>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Kode Token Akses
                </label>
                <input
                  type="text"
                  name="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="Contoh: SKM-2026"
                  autoComplete="off"
                  className="w-full px-5 py-4 bg-[#F0F4F8] border-2 border-gray-200 font-mono text-center font-black text-lg uppercase text-[#132B4F] placeholder-gray-300 focus:outline-none focus:border-[#009CC5] transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3">
                  <div className="w-1 h-full min-h-[20px] bg-red-500 shrink-0" />
                  <p className="text-red-600 text-xs font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-4 bg-[#132B4F] text-white font-black uppercase tracking-widest text-sm hover:bg-[#009CC5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk ke Portal Survei →"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#FAE705]/20 flex items-center justify-center text-[#132B4F] shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                Jika token tidak tersedia, hubungi petugas di loket pelayanan BKPSDM.
              </p>
            </div>
          </div>
        </div>

        {/* LEGAL NOTE */}
        <p className="text-center text-[10px] text-gray-400 font-medium mt-5 uppercase tracking-widest">
          Berdasarkan Permenpan RB No. 14 Tahun 2017
        </p>
      </div>
    </div>
  );
}

export default function EnterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]">
        <p className="text-[#132B4F] font-black text-xs uppercase tracking-widest">Memuat Portal...</p>
      </div>
    }>
      <TokenFormContent />
    </Suspense>
  );
}