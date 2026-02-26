"use client";

import { login } from "@/app/action/auth";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const isError = searchParams.get("error");

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-[#F0F4F8]">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* CARD */}
          <div className="bg-white border border-gray-200 shadow-lg overflow-hidden">

            {/* CARD HEADER */}
            <div className="bg-[#132B4F] px-8 py-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-[#FAE705]" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
                  Portal Administrasi
                </p>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                Admin <span className="text-[#FAE705]">Login</span>
              </h1>
              <p className="text-[10px] font-medium text-white/40 mt-1 uppercase tracking-widest">
                Badan Kepegawaian & Pengembangan SDM
              </p>
            </div>

            {/* ACCENT LINE */}
            <div className="h-1" style={{ background: "linear-gradient(to right, #FAE705, #009CC5)" }} />

            {/* FORM */}
            <div className="px-8 py-8">

              {isError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3 mb-6">
                  <div className="w-1 h-full min-h-[20px] bg-red-500 shrink-0" />
                  <p className="text-red-600 text-xs font-bold uppercase tracking-widest">
                    Username atau password salah
                  </p>
                </div>
              )}

              <form action={login} className="space-y-5">

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="admin"
                    title="Username"
                    autoComplete="username"
                    className="w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    title="Password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#132B4F] text-white text-sm font-black uppercase tracking-widest hover:bg-[#009CC5] transition-colors mt-2"
                >
                  Masuk ke Dashboard →
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FAE705]/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#132B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest">
                  Hanya untuk personel yang berwenang
                </p>
              </div>
            </div>
          </div>

          {/* LEGAL */}
          <p className="text-center text-[10px] text-gray-400 font-medium mt-5 uppercase tracking-widest">
            Permenpan RB No. 14 Tahun 2017
          </p>
        </div>
      </div>
    </div>
  );
}