"use client";

import { useState, useTransition } from "react";
import { verifyDeletePin, deleteLayananWithRespon, deletePegawaiWithRespon } from "@/app/action/delete";

interface Props {
  entityId: string; entityNama: string;
  entityType: "layanan" | "pegawai";
  linkedCount: number; linkedLabel: string;
}

type Step = "idle" | "pin" | "confirm" | "final";

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold tracking-widest outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

export default function EntityDeleteModal({ entityId, entityNama, entityType, linkedCount, linkedLabel }: Props) {
  const [step, setStep]               = useState<Step>("idle");
  const [pin, setPin]                 = useState("");
  const [verifiedPin, setVerifiedPin] = useState("");
  const [phrase, setPhrase]           = useState("");
  const [error, setError]             = useState("");
  const [isPending, startTransition]  = useTransition();

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
      if (result?.error) { setError(result.error); }
    });
  }

  const stepIndex = step === "pin" ? 0 : step === "confirm" ? 1 : step === "final" ? 2 : -1;

  return (
    <>
      {/* TRIGGER */}
      <button onClick={() => setStep("pin")}
        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all">
        Hapus Permanen
      </button>

      {/* MODAL */}
      {step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl">

            {/* Step progress */}
            <div className="flex h-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 transition-all duration-500"
                  style={{ backgroundColor: i <= stepIndex ? "#dc2626" : "#e5e7eb" }} />
              ))}
            </div>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 text-lg">
                  {step === "pin" ? "&#128274;" : step === "confirm" ? "&#9999;&#65039;" : "&#128465;"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-0.5">
                    {step === "pin"     && "Langkah 1 dari 3 — Verifikasi PIN"}
                    {step === "confirm" && "Langkah 2 dari 3 — Konfirmasi Frasa"}
                    {step === "final"   && "Langkah 3 dari 3 — Eksekusi Penghapusan"}
                  </p>
                  <p className="text-sm font-bold text-slate-900 leading-tight truncate max-w-xs">
                    Hapus {entityLabel}: &ldquo;{entityNama}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-600 mb-1">Yang akan dihapus:</p>
                <p className="text-sm text-red-500">
                  {entityLabel} <strong>&ldquo;{entityNama}&rdquo;</strong>
                  {linkedCount > 0 && <> beserta <strong>{linkedCount} {linkedLabel}</strong> terkait</>}
                </p>
              </div>

              {step === "pin" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Admin PIN</label>
                  <input type="password" value={pin}
                    onChange={(e) => { setPin(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyPin()}
                    placeholder="Masukkan PIN..." autoFocus className={inputClass} />
                </div>
              )}

              {step === "confirm" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p className="text-xs font-semibold text-green-700">PIN Terverifikasi</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Ketik <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">HAPUS</span> untuk melanjutkan
                    </label>
                    <input type="text" value={phrase}
                      onChange={(e) => { setPhrase(e.target.value); setError(""); }}
                      placeholder="Ketik HAPUS di sini..." autoFocus
                      className={`${inputClass} ${
                        phrase.length === 0 ? ""
                        : isPhraseConfirmed ? "border-red-500 text-red-600 bg-red-50"
                        : "border-amber-300 text-amber-700"
                      }`} />
                    {phrase.length > 0 && !isPhraseConfirmed && (
                      <p className="text-xs text-amber-600 mt-1.5">Ketik tepat: HAPUS (huruf kapital)</p>
                    )}
                  </div>
                </div>
              )}

              {step === "final" && (
                <div className="flex flex-col gap-3">
                  {["PIN Terverifikasi", `Frasa "HAPUS" Dikonfirmasi`].map((label) => (
                    <div key={label} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <p className="text-xs font-semibold text-green-700">{label}</p>
                    </div>
                  ))}
                  <div className="bg-red-600 text-white rounded-lg p-3">
                    <p className="text-xs font-semibold mb-1">Ini adalah langkah terakhir</p>
                    <p className="text-sm text-red-100">
                      {entityLabel} <strong>&ldquo;{entityNama}&rdquo;</strong>
                      {linkedCount > 0 && <> dan <strong>{linkedCount} {linkedLabel}</strong> terkait</>} akan dihapus permanen.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleClose} disabled={isPending}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-gray-50 transition-all disabled:opacity-50">
                Batal
              </button>

              {step === "pin" && (
                <button onClick={handleVerifyPin} disabled={pin.length === 0 || isPending}
                  className={`flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    pin.length > 0 && !isPending ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}>
                  {isPending ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memverifikasi...</span> : "Verifikasi PIN →"}
                </button>
              )}

              {step === "confirm" && (
                <button onClick={() => { if (isPhraseConfirmed) setStep("final"); }} disabled={!isPhraseConfirmed}
                  className={`flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    isPhraseConfirmed ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}>
                  Lanjutkan →
                </button>
              )}

              {step === "final" && (
                <button onClick={handleDelete} disabled={isPending}
                  className={`flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    !isPending ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}>
                  {isPending ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menghapus...</span> : "Hapus Permanen"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
