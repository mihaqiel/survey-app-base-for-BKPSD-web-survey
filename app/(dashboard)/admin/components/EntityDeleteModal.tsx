"use client";

import { useState, useTransition } from "react";
import { verifyDeletePin, deleteLayananWithRespon, deletePegawaiWithRespon } from "@/app/action/delete";

export interface EntityDeleteModalProps {
  entityId: string;
  entityNama: string;
  entityType: "layanan" | "pegawai";
  linkedCount: number;
  linkedLabel: string;
}

type Step = "idle" | "pin" | "confirm" | "final";

export default function EntityDeleteModal({ entityId, entityNama, entityType, linkedCount, linkedLabel }: EntityDeleteModalProps) {
  const [step, setStep] = useState<Step>("idle");
  const [pin, setPin] = useState("");
  const [verifiedPin, setVerifiedPin] = useState("");
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isPhraseConfirmed = phrase === "HAPUS";
  const entityLabel = entityType === "layanan" ? "Layanan" : "Pegawai";

  function handleClose() {
    setStep("idle"); setPin(""); setVerifiedPin(""); setPhrase(""); setError("");
  }

  function handleVerifyPin() {
    setError("");
    startTransition(async () => {
      const result = await verifyDeletePin(pin);
      if (!result.success) { setError(result.error ?? "PIN salah."); }
      else { setVerifiedPin(pin); setStep("confirm"); }
    });
  }

  function handleDelete() {
    if (!isPhraseConfirmed) return;
    setError("");
    startTransition(async () => {
      const action = entityType === "layanan" ? deleteLayananWithRespon : deletePegawaiWithRespon;
      const result = await action(entityId, phrase, verifiedPin);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <>
      {/* TRIGGER */}
      <button
        onClick={() => setStep("pin")}
        className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-800 transition-colors"
      >
        Hapus Permanen
      </button>

      {/* MODAL */}
      {step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-md overflow-hidden shadow-2xl">

            {/* Progress bar */}
            <div className="flex h-1.5">
              <div className={`flex-1 transition-colors duration-300 bg-red-400`} />
              <div className={`flex-1 transition-colors duration-300 ${step === "confirm" || step === "final" ? "bg-red-500" : "bg-gray-200"}`} />
              <div className={`flex-1 transition-colors duration-300 ${step === "final" ? "bg-red-600" : "bg-gray-200"}`} />
            </div>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center shrink-0 text-lg">
                  {step === "pin" ? "🔒" : step === "confirm" ? "✏️" : "🗑"}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-0.5">
                    {step === "pin" && "Langkah 1 dari 3 — Verifikasi PIN"}
                    {step === "confirm" && "Langkah 2 dari 3 — Konfirmasi Frasa"}
                    {step === "final" && "Langkah 3 dari 3 — Eksekusi Penghapusan"}
                  </p>
                  <p className="text-sm font-black text-[#132B4F] leading-tight truncate max-w-xs">
                    Hapus {entityLabel}: &ldquo;{entityNama}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Summary */}
              <div className="bg-red-50 border border-red-100 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Yang akan dihapus:</p>
                <p className="text-xs text-red-500 font-medium">
                  {entityLabel} <strong>&ldquo;{entityNama}&rdquo;</strong>
                  {linkedCount > 0 && <> beserta <strong>{linkedCount} {linkedLabel}</strong> terkait</>}
                </p>
              </div>

              {/* Step 1: PIN */}
              {step === "pin" && (
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Admin PIN</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => { setPin(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                    placeholder="Masukkan PIN..."
                    autoFocus
                    className="w-full px-4 py-3 border-2 border-gray-200 text-sm font-bold tracking-widest focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
              )}

              {/* Step 2: HAPUS phrase */}
              {step === "confirm" && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-50 border border-green-200">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">PIN Terverifikasi</p>
                  </div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Ketik <span className="text-red-600 bg-red-50 px-1.5 py-0.5 font-black">HAPUS</span> untuk melanjutkan
                  </label>
                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => { setPhrase(e.target.value); setError(""); }}
                    placeholder="Ketik HAPUS di sini..."
                    autoFocus
                    className={`w-full px-4 py-3 border-2 text-sm font-bold tracking-widest focus:outline-none transition-colors ${
                      phrase.length === 0 ? "border-gray-200" :
                      isPhraseConfirmed ? "border-red-500 text-red-600 bg-red-50" :
                      "border-amber-300 text-amber-700"
                    }`}
                  />
                  {phrase.length > 0 && !isPhraseConfirmed && (
                    <p className="text-[10px] font-bold text-amber-600 mt-1.5 uppercase tracking-wide">Ketik tepat: HAPUS (huruf kapital)</p>
                  )}
                </div>
              )}

              {/* Step 3: Final */}
              {step === "final" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">PIN Terverifikasi</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Frasa &ldquo;HAPUS&rdquo; Dikonfirmasi</p>
                  </div>
                  <div className="bg-red-600 text-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">⚠ Ini adalah langkah terakhir</p>
                    <p className="text-xs font-medium text-red-100">
                      {entityLabel} <strong>&ldquo;{entityNama}&rdquo;</strong>
                      {linkedCount > 0 && <> dan <strong>{linkedCount} {linkedLabel}</strong> terkait</>} akan dihapus permanen.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-2 uppercase tracking-wide">
                  ⚠ {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>

              {step === "pin" && (
                <button
                  onClick={handleVerifyPin}
                  disabled={pin.length === 0 || isPending}
                  className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    pin.length > 0 && !isPending ? "bg-[#132B4F] text-white hover:bg-[#0D1F38]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isPending ? "Memverifikasi..." : "Verifikasi PIN →"}
                </button>
              )}

              {step === "confirm" && (
                <button
                  onClick={() => { if (isPhraseConfirmed) setStep("final"); }}
                  disabled={!isPhraseConfirmed}
                  className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isPhraseConfirmed ? "bg-[#132B4F] text-white hover:bg-[#0D1F38]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Lanjutkan →
                </button>
              )}

              {step === "final" && (
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    !isPending ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isPending ? "Menghapus..." : "🗑 Hapus Permanen"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}