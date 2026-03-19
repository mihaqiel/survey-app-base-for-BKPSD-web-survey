"use client";

import { Suspense, useRef } from "react";
import { login } from "@/app/action/auth";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Lock, ShieldAlert } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  InvalidCredentials: "Username atau password salah.",
  TooManyAttempts:   "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  Unauthorized:      "Akun Google tidak diizinkan mengakses dashboard ini.",
  OAuthFailed:       "Gagal masuk dengan Google. Silakan coba lagi.",
  OAuthState:        "Sesi login tidak valid. Silakan coba lagi.",
  ConfigError:       "Konfigurasi OAuth belum tersedia.",
};

function ErrorMessage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  if (!errorCode) return null;

  const message = ERROR_MESSAGES[errorCode] ?? "Terjadi kesalahan. Silakan coba lagi.";

  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
      <p className="text-red-600 text-sm font-medium">{message}</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-gray-50/50">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* CARD */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {/* CARD HEADER */}
            <div className="px-8 py-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                Portal Administrasi
              </p>
              <h1 className="text-xl font-bold text-slate-900">
                Admin Login
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Badan Kepegawaian & Pengembangan SDM
              </p>
            </div>

            {/* FORM */}
            <div className="px-8 py-8">
              <Suspense fallback={null}>
                <ErrorMessage />
              </Suspense>

              <form action={login} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="admin"
                    title="Username"
                    autoComplete="username"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    title="Password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all duration-200 active:scale-[0.98] mt-2"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Masuk ke Dashboard
                  </span>
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <a
                  href="/api/auth/google"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-gray-50 transition-all duration-200"
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
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Hanya untuk personel yang berwenang
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LEGAL */}
          <p className="text-center text-xs text-slate-400 mt-5">
            Permenpan RB No. 14 Tahun 2017
          </p>
        </div>
      </div>
    </div>
  );
}
