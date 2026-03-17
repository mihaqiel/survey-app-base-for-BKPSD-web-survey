"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { verifyToken } from "@/app/action/check-token";
import { Info } from "lucide-react";

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
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="w-full max-w-lg">

        {/* CARD */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* CARD HEADER */}
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Portal Survei Kepuasan Masyarakat
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Masukkan Token Akses Survei
            </h1>
          </div>

          {/* FORM BODY */}
          <div className="px-8 py-8">
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Token akses tersedia pada QR Code yang dipasang di loket pelayanan BKPSDM. Pindai kode atau masukkan token secara manual.
            </p>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Kode Token Akses
                </label>
                <input
                  type="text"
                  name="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="Contoh: SKM-2026"
                  autoComplete="off"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-center font-bold text-lg uppercase text-slate-900 placeholder-gray-300 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <div className="w-1 h-full min-h-[20px] bg-red-500 rounded-full shrink-0" />
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-400">
                Jika token tidak tersedia, hubungi petugas di loket pelayanan BKPSDM.
              </p>
            </div>
          </div>
        </div>

        {/* LEGAL NOTE */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Berdasarkan Permenpan RB No. 14 Tahun 2017
        </p>
      </div>
    </div>
  );
}

export default function EnterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <p className="text-slate-500 font-medium text-sm">Memuat Portal...</p>
      </div>
    }>
      <TokenFormContent />
    </Suspense>
  );
}
