"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, AlertTriangle, Lock,
  ArrowLeft, ArrowRight,
} from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { verifyToken } from "@/app/action/check-token";

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

/* ── Status config ─────────────────────────────────────── */
const STATUS_CONFIG = {
  success: {
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: "#4ade80",
    colorBg: "rgba(34,197,94,0.12)",
    label: "Berhasil Dikirim",
    title: "Terima Kasih Atas Partisipasi Anda",
    message:
      "Survei Kepuasan Masyarakat (SKM) Anda telah berhasil disimpan. Masukan Anda sangat berharga bagi peningkatan kualitas layanan BKPSDM.",
  },
  duplicate: {
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "#FAE705",
    colorBg: "rgba(250,231,5,0.10)",
    label: "Sudah Diisi",
    title: "Survei Telah Diisi Sebelumnya",
    message:
      "Sistem mendeteksi bahwa perangkat ini telah mengirimkan survei untuk periode ini. Terima kasih atas partisipasi Anda.",
  },
  closed: {
    icon: <Lock className="w-6 h-6" />,
    color: "#f87171",
    colorBg: "rgba(239,68,68,0.12)",
    label: "Periode Ditutup",
    title: "Survei Tidak Tersedia",
    message:
      "Mohon maaf, periode survei ini telah berakhir atau dinonaktifkan oleh administrator. Silakan hubungi petugas di loket pelayanan untuk informasi lebih lanjut.",
  },
};

/* ── Token form ─────────────────────────────────────────── */
function TokenForm() {
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
          autoComplete="one-time-code"
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
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
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
          <span className="flex items-center justify-center gap-2">
            Masuk ke Portal Survei
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </button>
    </form>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function SuccessClient({ status }: { status: string }) {
  const ui =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.success;
  const isSuccess = status === "success";

  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen flex items-start justify-center px-4 py-12 relative overflow-hidden`}
      style={{ fontFamily: "var(--font-body, sans-serif)" }}
    >
      {/* Orb A — yellow top-left */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          top: "-180px",
          left: "-180px",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background: "rgba(250,231,5,0.07)",
          filter: "blur(160px)",
          zIndex: 0,
        }}
      />
      {/* Orb B — cyan bottom-right */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          bottom: "-120px",
          right: "-120px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "rgba(56,189,248,0.09)",
          filter: "blur(140px)",
          zIndex: 0,
        }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          zIndex: 0,
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* ── Status card ────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Card header */}
          <div
            className="px-8 py-6"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: ui.colorBg, color: ui.color }}
              >
                {ui.icon}
              </div>
              {/* Badge */}
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 rounded-full"
                style={{
                  background: ui.colorBg,
                  color: ui.color,
                  border: `1px solid ${ui.colorBg}`,
                }}
              >
                {ui.label}
              </span>
            </div>
            <h1
              className="text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {ui.title}
            </h1>
          </div>

          {/* Card body */}
          <div className="px-8 py-6 space-y-5">
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {ui.message}
            </p>

            {/* Info strip */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-1 h-5 rounded-full shrink-0"
                style={{ background: "#FAE705" }}
              />
              <p
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.40)" }}
              >
                BKPSDM Kabupaten Kepulauan Anambas
              </p>
            </div>

            {/* Back button for non-success statuses */}
            {!isSuccess && (
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.70)",
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            )}
          </div>
        </div>

        {/* ── Token form (success only) ───────────────────── */}
        {isSuccess && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="px-8 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-px block" style={{ background: "#FAE705" }} />
                <span
                  className="text-[10px] font-semibold tracking-[0.30em] uppercase"
                  style={{ color: "#FAE705" }}
                >
                  Isi Survei Berikutnya
                </span>
                <span className="w-5 h-px block" style={{ background: "#FAE705" }} />
              </div>
            </div>
            <div className="px-8 py-6">
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Masukkan token akses untuk memulai survei berikutnya.
              </p>
              <TokenForm />
            </div>
          </div>
        )}

        {/* Legal note */}
        <p
          className="text-center text-xs"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          Survei Kepuasan Masyarakat — Permenpan RB No. 14 Tahun 2017
        </p>
      </div>
    </div>
  );
}
