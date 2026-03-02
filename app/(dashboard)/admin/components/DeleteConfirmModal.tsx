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
  const [step, setStep] = useState<Step>("idle");
  const [pin, setPin] = useState("");
  const [verifiedPin, setVerifiedPin] = useState("");
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isPhraseConfirmed = phrase === "HAPUS";

  function handleClose() {
    setStep("idle");
    setPin("");
    setVerifiedPin("");
    setPhrase("");
    setError("");
  }

  function handleVerifyPin() {
    setError("");
    startTransition(async () => {
      const result = await verifyDeletePin(pin);
      if (!result.success) {
        setError(result.error ?? "PIN salah.");
      } else {
        setVerifiedPin(pin);
        setStep("confirm");
      }
    });
  }

  function handleDelete() {
    if (!isPhraseConfirmed) return;
    setError("");
    startTransition(async () => {
      const result = await deleteAllResponByLayanan(layananId, phrase, verifiedPin);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      {/* TRIGGER */}
      <div className="bg-white border border-red-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          className="px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shrink-0"
        >
          Hapus Semua Data
        </button>
      </div>

      {/* MODAL */}
      {step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-md overflow-hidden shadow-2xl">

            {/* Step indicator */}
            <div className="flex h-1.5">
              <div className={`flex-1 transition-colors duration-300 ${step === "pin" || step === "confirm" || step === "final" ? "bg-red-400" : "bg-gray-200"}`} />
              <div className={`flex-1 transition-colors duration-300 ${step === "confirm" || step === "final" ? "bg-red-500" : "bg-gray-200"}`} />
              <div className={`flex-1 transition-colors duration-300 ${step === "final" ? "bg-red-600" : "bg-gray-200"}`} />
            </div>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center shrink-0">
                  {step === "pin" && (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  {step === "confirm" && (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  {step === "final" && (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-0.5">
                    {step === "pin" && "Langkah 1 dari 3 — Verifikasi PIN"}
                    {step === "confirm" && "Langkah 2 dari 3 — Konfirmasi Frasa"}
                    {step === "final" && "Langkah 3 dari 3 — Eksekusi Penghapusan"}
                  </p>
                  <p className="text-sm font-black text-[#132B4F] leading-tight">
                    {step === "pin" && "Masukkan Admin PIN"}
                    {step === "confirm" && "Ketik frasa konfirmasi"}
                    {step === "final" && "Tindakan ini tidak dapat dibatalkan"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Data summary — shown in all steps */}
              <div className="bg-red-50 border border-red-100 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">
                  Data yang akan dihapus:
                </p>
                <p className="text-xs text-red-500 font-medium">
                  <strong>{totalCount} respon survei</strong> dari layanan{" "}
                  <strong>&ldquo;{layananNama}&rdquo;</strong>
                </p>
              </div>

              {/* STEP 1: PIN */}
              {step === "pin" && (
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Admin PIN
                  </label>
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

              {/* STEP 2: HAPUS phrase */}
              {step === "confirm" && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-50 border border-green-200">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">PIN Terverifikasi</p>
                  </div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Ketik{" "}
                    <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.5">HAPUS</span>{" "}
                    untuk melanjutkan
                  </label>
                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => { setPhrase(e.target.value); setError(""); }}
                    placeholder="Ketik HAPUS di sini..."
                    autoFocus
                    className={`w-full px-4 py-3 border-2 text-sm font-bold tracking-widest focus:outline-none transition-colors ${
                      phrase.length === 0
                        ? "border-gray-200 text-gray-600"
                        : isPhraseConfirmed
                        ? "border-red-500 text-red-600 bg-red-50"
                        : "border-amber-300 text-amber-700"
                    }`}
                  />
                  {phrase.length > 0 && !isPhraseConfirmed && (
                    <p className="text-[10px] font-bold text-amber-600 mt-1.5 uppercase tracking-wide">
                      Ketik tepat: HAPUS (huruf kapital semua)
                    </p>
                  )}
                </div>
              )}

              {/* STEP 3: Final confirmation */}
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
                  <div className="bg-red-600 text-white p-3 mt-1">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">⚠ Ini adalah langkah terakhir</p>
                    <p className="text-xs font-medium text-red-100">
                      Klik tombol di bawah untuk menghapus <strong>{totalCount} respon</strong> secara permanen.
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

              {/* Step 1 → next */}
              {step === "pin" && (
                <button
                  onClick={handleVerifyPin}
                  disabled={pin.length === 0 || isPending}
                  className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    pin.length > 0 && !isPending
                      ? "bg-[#132B4F] text-white hover:bg-[#0D1F38]"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isPending ? "Memverifikasi..." : "Verifikasi PIN →"}
                </button>
              )}

              {/* Step 2 → next */}
              {step === "confirm" && (
                <button
                  onClick={() => { if (isPhraseConfirmed) setStep("final"); }}
                  disabled={!isPhraseConfirmed}
                  className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isPhraseConfirmed
                      ? "bg-[#132B4F] text-white hover:bg-[#0D1F38]"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Lanjutkan →
                </button>
              )}

              {/* Step 3 → execute */}
              {step === "final" && (
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    !isPending
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
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