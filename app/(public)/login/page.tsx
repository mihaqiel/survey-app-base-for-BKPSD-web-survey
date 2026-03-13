"use client";

import { Suspense, useRef } from "react";
import { login } from "@/app/action/auth";
import { useSearchParams } from "next/navigation";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const isError = searchParams.get("error");
  if (!isError) return null;

  return (
    <div className="animate-shake flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3 mb-6">
      <div className="w-1 h-full min-h-[20px] bg-red-500 shrink-0" />
      <p className="text-red-600 text-xs font-bold uppercase tracking-widest">
        Username atau password salah
      </p>
    </div>
  );
}

function RippleButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
    props.onClick?.(e);
  };

  return (
    <button ref={btnRef} {...props} onClick={handleClick} className={`btn-ripple ${props.className}`}>
      {children}
    </button>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col bg-[#F0F4F8]">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-up">

          {/* CARD */}
          <div className="bg-white border border-gray-200 shadow-lg overflow-hidden">

            {/* CARD HEADER */}
            <div className="bg-[#132B4F] px-8 py-7 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#009CC5]/10 blur-2xl pointer-events-none" />
              <div className="relative flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-[#FAE705]" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">
                  Portal Administrasi
                </p>
              </div>
              <h1 className="relative text-2xl font-black uppercase tracking-tight text-white leading-tight">
                Admin <span className="text-[#FAE705]">Login</span>
              </h1>
              <p className="relative text-[10px] font-medium text-white/40 mt-1 uppercase tracking-widest">
                Badan Kepegawaian & Pengembangan SDM
              </p>
            </div>

            {/* ACCENT LINE */}
            <div
              className="h-1 animate-draw-line"
              style={{ background: "linear-gradient(to right, #FAE705, #009CC5)" }}
            />

            {/* FORM */}
            <div className="px-8 py-8">
              <Suspense fallback={null}>
                <ErrorMessage />
              </Suspense>

              <form action={login} className="space-y-5">

                <div className="animate-fade-up delay-75">
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
                    className="input-glow w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div className="animate-fade-up delay-150">
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
                    className="input-glow w-full px-4 py-3.5 bg-[#F0F4F8] border-2 border-transparent text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div className="animate-fade-up delay-225">
                  <RippleButton
                    type="submit"
                    className="w-full py-4 bg-[#132B4F] text-white text-sm font-black uppercase tracking-widest hover:bg-[#009CC5] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(19,43,79,0.25)] transition-all duration-200 active:scale-[0.98] mt-2"
                  >
                    Masuk ke Dashboard →
                  </RippleButton>
                </div>
              </form>

              <div className="animate-fade-up delay-300 mt-6 pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FAE705]/20 flex items-center justify-center shrink-0 animate-float">
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
          <p className="animate-fade-in delay-450 text-center text-[10px] text-gray-400 font-medium mt-5 uppercase tracking-widest">
            Permenpan RB No. 14 Tahun 2017
          </p>
        </div>
      </div>
    </div>
  );
}