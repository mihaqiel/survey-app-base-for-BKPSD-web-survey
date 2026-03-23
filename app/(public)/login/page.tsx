"use client";

import { Suspense } from "react";
import { login } from "@/app/action/auth";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Lock, ShieldAlert } from "lucide-react";
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

const ERROR_MESSAGES: Record<string, string> = {
  InvalidCredentials: "Username atau password salah.",
  TooManyAttempts:   "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  Unauthorized:      "Akun Google tidak diizinkan mengakses dashboard ini.",
  OAuthFailed:       "Gagal masuk dengan Google. Silakan coba lagi.",
  OAuthState:        "Sesi login tidak valid. Silakan coba lagi.",
  ConfigError:       "Konfigurasi OAuth belum tersedia.",
};

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
};

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white outline-none transition-all"
      style={inputStyle}
      onFocus={(e) => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.35)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,255,255,0.06)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

function ErrorMessage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  if (!errorCode) return null;

  const message = ERROR_MESSAGES[errorCode] ?? "Terjadi kesalahan. Silakan coba lagi.";

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-4 py-3 mb-6"
      style={{
        background: "rgba(239,68,68,0.10)",
        border: "1px solid rgba(239,68,68,0.25)",
      }}
    >
      <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#f87171" }} />
      <p className="text-sm font-medium" style={{ color: "#f87171" }}>
        {message}
      </p>
    </div>
  );
}

function labelClass() {
  return "block text-[10px] font-semibold uppercase tracking-[0.25em] mb-2";
}

export default function LoginPage() {
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

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>

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
                Portal Administrasi
              </span>
              <span className="w-5 h-px block" style={{ background: "#FAE705" }} />
            </div>
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Masuk Dashboard
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Badan Kepegawaian dan Pengembangan Sumber Daya Manusia
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <Suspense fallback={null}>
              <ErrorMessage />
            </Suspense>

            <form action={login} className="space-y-5">
              <div>
                <label
                  className={labelClass()}
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Username
                </label>
                <DarkInput
                  name="username"
                  type="text"
                  required
                  placeholder="admin"
                  title="Username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  className={labelClass()}
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Password
                </label>
                <DarkInput
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  title="Password"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mt-2 hover:brightness-95"
                style={{ background: "#FAE705", color: "#0d1b2a" }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" style={{ color: "#0d1b2a" }} />
                  Masuk ke Dashboard
                </span>
              </button>
            </form>

            <div
              className="mt-6 pt-6 space-y-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <a
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.80)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
              </a>

              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(56,189,248,0.12)" }}
                >
                  <ShieldAlert className="w-4 h-4" style={{ color: "#38bdf8" }} />
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Hanya untuk personel yang berwenang
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <p
          className="text-center text-xs mt-5"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Permenpan RB No. 14 Tahun 2017
        </p>
      </div>
    </div>
  );
}
