"use client";

import { Suspense, useRef } from "react";
import { login } from "@/app/action/auth";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Lock, ShieldAlert } from "lucide-react";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const isError = searchParams.get("error");
  if (!isError) return null;

  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
      <p className="text-red-600 text-sm font-medium">
        Username atau password salah
      </p>
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

              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-slate-400">
                  Hanya untuk personel yang berwenang
                </p>
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
