"use client";

import { useState, useTransition } from "react";
import { verifyDeletePin, deleteAllResponByLayanan } from "@/app/action/delete";

interface Props {
  layananId: string;
  layananNama: string;
  totalCount: number;
}

type Step = "idle" | "pin" | "confirm" | "final";

export default function DeleteConfirmModal({ layananId, layananNama, totalCount }: Props) {
  const [step, setStep]               = useState<Step>("idle");
  const [pin, setPin]                 = useState("");
  const [verifiedPin, setVerifiedPin] = useState("");
  const [phrase, setPhrase]           = useState("");
  const [error, setError]             = useState("");
  const [shakeError, setShakeError]   = useState(false);
  const [isPending, startTransition]  = useTransition();

  const isPhraseConfirmed = phrase === "HAPUS";

  function handleClose() {
    setStep("idle"); setPin(""); setVerifiedPin(""); setPhrase(""); setError(""); setShakeError(false);
  }

  function triggerShake() {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  }

  function handleVerifyPin() {
    setError("");
    startTransition(async () => {
      const result = await verifyDeletePin(pin);
      if (!result.success) { setError(result.error ?? "PIN salah."); triggerShake(); }
      else { setVerifiedPin(pin); setStep("confirm"); }
    });
  }

  function handleDelete() {
    if (!isPhraseConfirmed) return;
    setError("");
    startTransition(async () => {
      const result = await deleteAllResponByLayanan(layananId, phrase, verifiedPin);
      if (result?.error) { setError(result.error); triggerShake(); }
    });
  }

  const stepIndex = step === "pin" ? 0 : step === "confirm" ? 1 : step === "final" ? 2 : -1;

  return (
    <>
      {/* TRIGGER */}
      <div className="animate-fade-up bg-white border border-red-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F] mb-1">
            Hapus Semua Data Respon
          </p>
          <p className="text-xs text-gray-500 font-medium">
            Seluruh <strong>{totalCount} respon</strong> untuk layanan{" "}
            <strong>&ldquo;{layananNama}&rdquo;</strong> akan dihapus permanen.
          </p>
        </div>
        <button
          onClick={() => setStep("pin")}
          className="btn-shimmer group px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(220,38,38,0.35)] transition-all duration-200 active:scale-[0.97] shrink-0"
        >
          <span className="flex items-center gap-2">
            Hapus Semua Data
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </span>
        </button>
      </div>

      {/* MODAL */}
      {step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md overflow-hidden shadow-2xl animate-fade-up">

            {/* Animated step progress bar */}
            <div className="flex h-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex-1 transition-all duration-500"
                  style={{ backgroundColor: i <= stepIndex ? `hsl(${0 + i * 5}, ${70 + i * 5}%, ${50 - i * 5}%)` : "#e5e7eb" }}
                />
              ))}
            </div>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center shrink-0 animate-bounce-in">
                  {step === "pin"     && <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                  {step === "confirm" && <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                  {step === "final"   && <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                </div>
                <div className="animate-fade-up">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-0.5">
                    {step === "pin"     && "Langkah 1 dari 3 — Verifikasi PIN"}
                    {step === "confirm" && "Langkah 2 dari 3 — Konfirmasi Frasa"}
                    {step === "final"   && "Langkah 3 dari 3 — Eksekusi Penghapusan"}
                  </p>
                  <p className="text-sm font-black text-[#132B4F] leading-tight">
                    {step === "pin"     && "Masukkan Admin PIN"}
                    {step === "confirm" && "Ketik frasa konfirmasi"}
                    {step === "final"   && "Tindakan ini tidak dapat dibatalkan"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="bg-red-50 border border-red-100 p-3 animate-fade-up">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Data yang akan dihapus:</p>
                <p className="text-xs text-red-500 font-medium">
                  <strong>{totalCount} respon survei</strong> dari layanan <strong>&ldquo;{layananNama}&rdquo;</strong>
                </p>
              </div>

              {/* Step 1 */}
              {step === "pin" && (
                <div className="animate-fade-up">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Admin PIN</label>
                  <input
                    type="password" value={pin}
                    onChange={(e) => { setPin(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                    placeholder="Masukkan PIN..." autoFocus
                    className="input-glow w-full px-4 py-3 border-2 border-gray-200 text-sm font-bold tracking-widest focus:outline-none transition-all duration-200"
                  />
                </div>
              )}

              {/* Step 2 */}
              {step === "confirm" && (
                <div className="animate-fade-up space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 animate-bounce-in">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">PIN Terverifikasi</p>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                      Ketik <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.5">HAPUS</span> untuk melanjutkan
                    </label>
                    <input
                      type="text" value={phrase}
                      onChange={(e) => { setPhrase(e.target.value); setError(""); }}
                      placeholder="Ketik HAPUS di sini..." autoFocus
                      className={`input-glow w-full px-4 py-3 border-2 text-sm font-bold tracking-widest focus:outline-none transition-all duration-200 ${
                        phrase.length === 0 ? "border-gray-200 text-gray-600"
                        : isPhraseConfirmed ? "border-red-500 text-red-600 bg-red-50"
                        : "border-amber-300 text-amber-700"
                      }`}
                    />
                    {phrase.length > 0 && !isPhraseConfirmed && (
                      <p className="text-[10px] font-bold text-amber-600 mt-1.5 uppercase tracking-wide animate-fade-down">
                        Ketik tepat: HAPUS (huruf kapital semua)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === "final" && (
                <div className="animate-fade-up flex flex-col gap-3">
                  {["PIN Terverifikasi", `Frasa "HAPUS" Dikonfirmasi`].map((label) => (
                    <div key={label} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 animate-bounce-in">
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-700">{label}</p>
                    </div>
                  ))}
                  <div className="bg-red-600 text-white p-3 animate-fade-up relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)", backgroundSize: "200% 100%", animation: "shimmer 2s ease infinite" }} />
                    <p className="relative text-[10px] font-black uppercase tracking-widest mb-1">⚠ Ini adalah langkah terakhir</p>
                    <p className="relative text-xs font-medium text-red-100">
                      Klik tombol di bawah untuk menghapus <strong>{totalCount} respon</strong> secara permanen.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className={`${shakeError ? "animate-shake" : ""} text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-2 uppercase tracking-wide`}>
                  ⚠ {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleClose} disabled={isPending}
                className="btn-shimmer flex-1 px-4 py-2.5 border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50">
                Batal
              </button>

              {step === "pin" && (
                <button onClick={handleVerifyPin} disabled={pin.length === 0 || isPending}
                  className={`btn-shimmer flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                    pin.length > 0 && !isPending
                      ? "bg-[#132B4F] text-white hover:bg-[#0D1F38] hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}>
                  {isPending ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memverifikasi...</span> : "Verifikasi PIN →"}
                </button>
              )}

              {step === "confirm" && (
                <button onClick={() => { if (isPhraseConfirmed) setStep("final"); }} disabled={!isPhraseConfirmed}
                  className={`btn-shimmer flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                    isPhraseConfirmed ? "bg-[#132B4F] text-white hover:bg-[#0D1F38] hover:scale-[1.02] active:scale-[0.98]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}>
                  Lanjutkan →
                </button>
              )}

              {step === "final" && (
                <button onClick={handleDelete} disabled={isPending}
                  className={`btn-shimmer flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                    !isPending ? "bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(220,38,38,0.35)] active:scale-[0.97]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}>
                  {isPending ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menghapus...</span> : "🗑 Hapus Permanen"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}