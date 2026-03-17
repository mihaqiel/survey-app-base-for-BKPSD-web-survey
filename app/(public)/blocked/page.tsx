"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldOff, AlertTriangle, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { submitUnblockRequest } from "@/app/action/submit";

export default function BlockedPage() {
  const [reason, setReason] = useState("duplicate");
  const [ip, setIp]         = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReason(params.get("reason") ?? "duplicate");
    // Get client IP via public API
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(d => setIp(d.ip))
      .catch(() => setIp("unknown"));
  }, []);

  const isDuplicate = reason === "duplicate";
  const isManual    = reason === "manual";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { setError("Pesan wajib diisi."); return; }
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("ip", ip);
    fd.append("message", message);
    fd.append("email", email);
    const result = await submitUnblockRequest(fd);
    if (result?.error) { setError(result.error); setLoading(false); }
    else { setSent(true); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-up">

        {/* Card */}
        <div className="bg-white border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-[#132B4F] px-8 py-7">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 flex items-center justify-center shrink-0 ${
                isDuplicate ? "bg-[#d97706]" : "bg-red-500"
              }`}>
                {isDuplicate
                  ? <AlertTriangle className="w-7 h-7 text-white" />
                  : <ShieldOff className="w-7 h-7 text-white" />
                }
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5] mb-1">
                  {isDuplicate ? "Duplikasi Terdeteksi" : "Akses Diblokir"}
                </p>
                <h1 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
                  {isDuplicate ? "Survei Sudah Diisi" : "IP Anda Diblokir"}
                </h1>
              </div>
            </div>
          </div>

          <div className="h-1" style={{
            backgroundColor: isDuplicate ? "#d97706" : "#dc2626"
          }} />

          <div className="px-8 py-7 space-y-5">

            {/* Message */}
            <div className={`flex items-start gap-3 border px-4 py-4 ${
              isDuplicate
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="w-1 min-h-[20px] shrink-0 mt-0.5"
                style={{ backgroundColor: isDuplicate ? "#d97706" : "#dc2626" }} />
              <p className="text-sm font-medium leading-relaxed text-gray-700">
                {isDuplicate
                  ? "Sistem mendeteksi bahwa perangkat ini sudah mengisi survei untuk layanan yang sama hari ini. Setiap perangkat hanya dapat mengisi 1 survei per layanan per hari."
                  : "IP address Anda telah diblokir secara manual oleh administrator. Jika Anda merasa ini adalah kesalahan, silakan kirim permintaan pembukaan blokir di bawah."
                }
              </p>
            </div>

            {/* Duplicate: just go back */}
            {isDuplicate && (
              <Link href="/"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] transition-all">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            )}

            {/* Manual block: show unblock request form */}
            {isManual && !sent && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">
                    Kirim Permintaan Pembukaan Blokir
                  </p>

                  <div className="bg-[#F0F4F8] px-3 py-2 mb-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">IP Address Anda</p>
                    <p className="text-sm font-mono font-bold text-[#132B4F] mt-0.5">{ip || "Memuat..."}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                        Pesan <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Jelaskan mengapa IP Anda harus dibuka blokirnya..."
                        title="Pesan permintaan"
                        rows={4}
                        className="w-full px-3 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-medium text-[#132B4F] placeholder-gray-300 outline-none resize-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                        Email (opsional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="email@contoh.com"
                        title="Email untuk balasan"
                        className="w-full px-3 py-3 bg-[#F0F4F8] border-2 border-transparent focus:border-[#009CC5] text-sm font-medium text-[#132B4F] placeholder-gray-300 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-[10px] font-bold text-red-500 mt-2">{error}</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim...</>
                    : <><Send className="w-4 h-4" />Kirim Permintaan</>
                  }
                </button>

                <Link href="/"
                  className="flex items-center justify-center gap-2 w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#132B4F] transition-colors">
                  <ArrowLeft className="w-3 h-3" />
                  Kembali ke Beranda
                </Link>
              </form>
            )}

            {/* Sent confirmation */}
            {isManual && sent && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Permintaan Terkirim</p>
                    <p className="text-sm text-green-600 mt-0.5">Administrator akan meninjau permintaan Anda.</p>
                  </div>
                </div>
                <Link href="/"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#132B4F] text-white font-black text-sm uppercase tracking-widest hover:bg-[#009CC5] transition-all">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Beranda
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-medium mt-4 uppercase tracking-widest">
          BKPSDM Kabupaten Kepulauan Anambas
        </p>
      </div>
    </div>
  );
}