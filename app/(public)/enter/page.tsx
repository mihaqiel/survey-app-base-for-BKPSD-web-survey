"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { verifyToken } from "@/app/action/check-token";
import { Info } from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

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
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden`}
      style={{ background: "#0d1b2a", fontFamily: "var(--font-body, sans-serif)" }}
    >
      {/* Orb A — yellow top-left */}
      <div
        className="absolute top-[-180px] left-[-180px] w-[560px] h-[560px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: "rgba(250,231,5,0.08)" }}
      />
      {/* Orb B — cyan bottom-right */}
      <div
        className="absolute bottom-[-120px] right-[-120px] w-[480px] h-[480px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: "rgba(56,189,248,0.10)" }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Card Header */}
          <div
            className="px-8 py-6"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-5 h-px block" style={{ background: "#FAE705" }} />
              <span
                className="text-[10px] font-semibold tracking-[0.35em] uppercase"
                style={{ color: "#FAE705" }}
              >
                Portal Survei Kepuasan Masyarakat
              </span>
              <span className="w-5 h-px block" style={{ background: "#FAE705" }} />
            </div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Masukkan Token Akses
            </h1>
          </div>

          {/* Form Body */}
          <div className="px-8 py-8">
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              Token akses tersedia pada QR Code yang dipasang di loket pelayanan BKPSDM.
              Pindai kode atau masukkan token secara manual.
            </p>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Kode Token Akses
                </label>
                <input
                  type="text"
                  name="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  placeholder="Contoh: SKM-2026"
                  autoComplete="off"
                  className="w-full px-5 py-3.5 rounded-lg font-mono text-center font-bold text-lg uppercase text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    caretColor: "#FAE705",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #FAE705";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(250,231,5,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <style>{`input::placeholder { color: rgba(255,255,255,0.20); }`}</style>
              </div>

              {error && (
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  <div
                    className="w-1 min-h-[20px] rounded-full shrink-0"
                    style={{ background: "#ef4444" }}
                  />
                  <p className="text-sm font-medium" style={{ color: "#f87171" }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95 active:scale-[0.98]"
                style={{ background: "#FAE705", color: "#0d1b2a" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: "rgba(13,27,42,0.25)",
                        borderTopColor: "#0d1b2a",
                      }}
                    />
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk ke Portal Survei →"
                )}
              </button>
            </form>

            <div
              className="mt-6 pt-6 flex items-center gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(56,189,248,0.12)" }}
              >
                <Info className="w-4 h-4" style={{ color: "#38bdf8" }} />
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                Jika token tidak tersedia, hubungi petugas di loket pelayanan BKPSDM.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Note */}
        <p
          className="text-center text-xs mt-5"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Berdasarkan Permenpan RB No. 14 Tahun 2017
        </p>
      </div>
    </div>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#0d1b2a" }}
        >
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
            Memuat Portal...
          </p>
        </div>
      }
    >
      <TokenFormContent />
    </Suspense>
  );
}
