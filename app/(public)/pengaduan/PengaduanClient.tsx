"use client";

import { useActionState, useRef } from "react";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { submitPengaduan } from "@/app/action/pengaduan";
import {
  MessageSquareWarning,
  Upload,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--pf",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--dm",
});

const initialState = { success: undefined as true | undefined, error: undefined as string | undefined };

export default function PengaduanClient() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(submitPengaduan, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form after success
  if (state.success && formRef.current) {
    formRef.current.reset();
  }

  return (
    <div className={`${playfair.variable} ${dmSans.variable}`} style={{ fontFamily: "var(--dm)" }}>

      {/* ── HERO ───────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d1b2a 0%, #0d2d58 60%, #0d3d7a 100%)",
          minHeight: 340,
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute", top: -60, right: -60,
            width: 340, height: 340, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(250,231,5,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: -80, left: -40,
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          {/* overline */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div style={{ height: 1, width: 48, background: "rgba(250,231,5,0.5)" }} />
            <span
              className="text-xs font-semibold tracking-[0.22em] uppercase"
              style={{ color: "#FAE705", fontFamily: "var(--dm)" }}
            >
              BKPSDM Kab. Kepulauan Anambas
            </span>
            <div style={{ height: 1, width: 48, background: "rgba(250,231,5,0.5)" }} />
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--pf)" }}
          >
            Pengaduan Masyarakat
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Sampaikan pengaduan, saran, atau masukan Anda terkait pelayanan BKPSDM.
            Setiap laporan akan ditindaklanjuti dengan serius.
          </p>
        </div>
      </section>

      {/* ── INFO STRIP ─────────────────────────────── */}
      <section
        className="py-8 px-6"
        style={{ background: "#0d2d58" }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Respons Cepat", desc: "Pengaduan ditinjau dalam 1×24 jam" },
            { label: "Terverifikasi", desc: "Setiap laporan diverifikasi tim kami" },
            { label: "Rahasia", desc: "Identitas pelapor dijaga kerahasiaannya" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs text-blue-300 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORM SECTION ───────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "#f8f7f3" }}>
        <div className="max-w-2xl mx-auto">

          {/* Section heading */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#0d2d58" }}
            >
              <MessageSquareWarning className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: "#0d2d58", fontFamily: "var(--pf)" }}
              >
                Formulir Pengaduan
              </h2>
              <p className="text-sm text-slate-500">Isi semua kolom yang bertanda wajib (*)</p>
            </div>
          </div>

          {/* Success state */}
          {state.success && (
            <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">Pengaduan Berhasil Dikirim</p>
                <p className="text-sm text-green-700 mt-1">
                  Terima kasih. Pengaduan Anda telah kami terima. Konfirmasi akan dikirim ke email Anda.
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {state.error && (
            <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} action={action} encType="multipart/form-data" className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                No. Telepon <span className="text-slate-400 font-normal normal-case">(opsional)</span>
              </label>
              <input
                name="telepon"
                type="tel"
                maxLength={30}
                placeholder="08xx-xxxx-xxxx"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Judul Pengaduan <span className="text-red-500">*</span>
              </label>
              <input
                name="judul"
                type="text"
                required
                maxLength={200}
                placeholder="Ringkasan singkat pengaduan Anda"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Isi Pengaduan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="isi"
                required
                maxLength={2000}
                rows={6}
                placeholder="Jelaskan pengaduan Anda secara detail — apa yang terjadi, kapan, dan di mana..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">Maksimal 2.000 karakter</p>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Foto Bukti <span className="text-slate-400 font-normal normal-case">(opsional, maks. 5 MB)</span>
              </label>
              <label
                htmlFor="gambar-input"
                className="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
              >
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <p className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
                  Klik untuk unggah gambar
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, WEBP — maks. 5 MB</p>
              </label>
              <input
                id="gambar-input"
                ref={fileInputRef}
                name="gambar"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("Ukuran file terlalu besar. Maksimal 5 MB.");
                    e.target.value = "";
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isPending ? "#6b7280" : "#0d2d58",
                color: "#ffffff",
              }}
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Pengaduan
                </>
              )}
            </button>
          </form>

          {/* Note */}
          <div
            className="mt-6 p-4 rounded-xl border text-sm text-slate-600 leading-relaxed"
            style={{ background: "#fffbeb", borderColor: "#fde68a" }}
          >
            <strong style={{ color: "#92400e" }}>Catatan:</strong> Pastikan informasi yang Anda berikan
            akurat dan dapat dipertanggungjawabkan. Pengaduan palsu atau tidak berdasar dapat
            dikenakan sanksi sesuai ketentuan yang berlaku.
          </div>
        </div>
      </section>
    </div>
  );
}
