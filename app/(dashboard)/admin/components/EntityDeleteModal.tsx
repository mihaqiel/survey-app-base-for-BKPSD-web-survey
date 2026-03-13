"use client";

import { useState, useTransition } from "react";
import { verifyDeletePin, deleteLayananWithRespon, deletePegawaiWithRespon } from "@/app/action/delete";

interface Props {
  entityId: string; entityNama: string;
  entityType: "layanan" | "pegawai";
  linkedCount: number; linkedLabel: string;
}

type Step = "idle" | "pin" | "confirm" | "final";

export default function EntityDeleteModal({ entityId, entityNama, entityType, linkedCount, linkedLabel }: Props) {
  const [step, setStep]               = useState<Step>("idle");
  const [pin, setPin]                 = useState("");
  const [verifiedPin, setVerifiedPin] = useState("");
  const [phrase, setPhrase]           = useState("");
  const [error, setError]             = useState("");
  const [shakeError, setShakeError]   = useState(false);
  const [isPending, startTransition]  = useTransition();

  const isPhraseConfirmed = phrase === "HAPUS";
  const entityLabel = entityType === "layanan" ? "Layanan" : "Pegawai";

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
      const action = entityType === "layanan" ? deleteLayananWithRespon : deletePegawaiWithRespon;
      const result = await action(entityId, phrase, verifiedPin);
      if (result?.error) { setError(result.error); triggerShake(); }
    });
  }

  const stepIndex = step === "pin" ? 0 : step === "confirm" ? 1 : step === "final" ? 2 : -1;

  return (
    <>
      {/* TRIGGER */}
      <button
        onClick={() => setStep("pin")}
        className="btn-shimmer px-3 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-800 hover:scale-[1.04] hover:shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all duration-200 active:scale-[0.97]"
      >
        Hapus Permanen
      </button>

      {/* MODAL */}
      {step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md overflow-hidden shadow-2xl animate-fade-up">

            {/* Animated step progress */}
            <div className="flex h-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 transition-all duration-500"
                  style={{ backgroundColor: i <= stepIndex ? `hsl(${0 + i * 5}, ${70 + i * 5}%, ${50 - i * 5}%)` : "#e5e7eb" }} />
              ))}
            </div>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center shrink-0 text-lg animate-bounce-in">
                  {step === "pin" ? "🔒" : step === "confirm" ? "✏️" : "🗑"}
                </div>
                <div className="animate-fade-up">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-0.5">
                    {step === "pin"     && "Langkah 1 dari 3 — Verifikasi PIN"}
                    {step === "confirm" && "Langkah 2 dari 3 — Konfirmasi Frasa"}
                    {step === "final"   && "Langkah 3 dari 3 — Eksekusi Penghapusan"}
                  </p>
                  <p className="text-sm font-black text-[#132B4F] leading-tight truncate max-w-xs">
                    Hapus {entityLabel}: &ldquo;{entityNama}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="bg-red-50 border border-red-100 p-3 animate-fade-up">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Yang akan dihapus:</p>
                <p className="text-xs text-red-500 font-medium">
                  {entityLabel} <strong>&ldquo;{entityNama}&rdquo;</strong>
                  {linkedCount > 0 && <> beserta <strong>{linkedCount} {linkedLabel}</strong> terkait</>}
                </p>
              </div>

              {step === "pin" && (
                <div className="animate-fade-up">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Admin PIN</label>
                  <input type="password" value={pin}
                    onChange={(e) => { setPin(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                    placeholder="Masukkan PIN..." autoFocus
                    className="input-glow w-full px-4 py-3 border-2 border-gray-200 text-sm font-bold tracking-widest focus:outline-none transition-all duration-200"
                  />
                </div>
              )}

              {step === "confirm" && (
                <div className="animate-fade-up space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 animate-bounce-in">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">PIN Terverifikasi</p>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                      Ketik <span className="text-red-600 bg-red-50 px-1.5 py-0.5 font-black">HAPUS</span> untuk melanjutkan
                    </label>
                    <input type="text" value={phrase}
                      onChange={(e) => { setPhrase(e.target.value); setError(""); }}
                      placeholder="Ketik HAPUS di sini..." autoFocus
                      className={`input-glow w-full px-4 py-3 border-2 text-sm font-bold tracking-widest focus:outline-none transition-all duration-200 ${
                        phrase.length === 0 ? "border-gray-200"
                        : isPhraseConfirmed ? "border-red-500 text-red-600 bg-red-50"
                        : "border-amber-300 text-amber-700"
                      }`}
                    />
                    {phrase.length > 0 && !isPhraseConfirmed && (
                      <p className="text-[10px] font-bold text-amber-600 mt-1.5 uppercase tracking-wide animate-fade-down">
                        Ketik tepat: HAPUS (huruf kapital)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === "final" && (
                <div className="animate-fade-up flex flex-col gap-3">
                  {["PIN Terverifikasi", `Frasa "HAPUS" Dikonfirmasi`].map((label) => (
                    <div key={label} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 animate-bounce-in">
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-700">{label}</p>
                    </div>
                  ))}
                  <div className="bg-red-600 text-white p-3 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)", backgroundSize: "200% 100%", animation: "shimmer 2s ease infinite" }} />
                    <p className="relative text-[10px] font-black uppercase tracking-widest mb-1">⚠ Ini adalah langkah terakhir</p>
                    <p className="relative text-xs font-medium text-red-100">
                      {entityLabel} <strong>&ldquo;{entityNama}&rdquo;</strong>
                      {linkedCount > 0 && <> dan <strong>{linkedCount} {linkedLabel}</strong> terkait</>} akan dihapus permanen.
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
                    pin.length > 0 && !isPending ? "bg-[#132B4F] text-white hover:bg-[#0D1F38] hover:scale-[1.02] active:scale-[0.98]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
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