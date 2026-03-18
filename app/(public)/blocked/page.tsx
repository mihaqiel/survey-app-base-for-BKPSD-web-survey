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
    // Use server-provided IP from redirect URL — this matches exactly what is
    // stored in the blockedIp table (server-detected, not public/NAT IP).
    const serverIp = params.get("ip");
    if (serverIp) {
      setIp(serverIp);
    } else {
      // Fallback only when no ip param present (legacy URLs)
      fetch("https://api.ipify.org?format=json")
        .then(r => r.json())
        .then(d => setIp(d.ip))
        .catch(() => setIp("unknown"));
    }
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
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isDuplicate ? "bg-amber-50" : "bg-red-50"
              }`}>
                {isDuplicate
                  ? <AlertTriangle className="w-6 h-6 text-amber-600" />
                  : <ShieldOff className="w-6 h-6 text-red-600" />
                }
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  {isDuplicate ? "Duplikasi Terdeteksi" : "Akses Diblokir"}
                </p>
                <h1 className="text-lg font-bold text-slate-900">
                  {isDuplicate ? "Survei Sudah Diisi" : "IP Anda Diblokir"}
                </h1>
              </div>
            </div>
          </div>

          <div className="px-8 py-7 space-y-5">

            {/* Message */}
            <div className={`flex items-start gap-3 border rounded-lg px-4 py-4 ${
              isDuplicate ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"
            }`}>
              <p className="text-sm leading-relaxed text-slate-700">
                {isDuplicate
                  ? "Sistem mendeteksi bahwa perangkat ini sudah mengisi survei untuk layanan yang sama hari ini. Setiap perangkat hanya dapat mengisi 1 survei per layanan per hari."
                  : "IP address Anda telah diblokir secara manual oleh administrator. Jika Anda merasa ini adalah kesalahan, silakan kirim permintaan pembukaan blokir di bawah."
                }
              </p>
            </div>

            {/* Duplicate: just go back */}
            {isDuplicate && (
              <Link href="/"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 transition-all">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            )}

            {/* Manual block: show unblock request form */}
            {isManual && !sent && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-3">Kirim Permintaan Pembukaan Blokir</p>

                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs font-medium text-slate-500">IP Address Anda</p>
                    <p className="text-sm font-mono font-semibold text-slate-900 mt-0.5">{ip || "Memuat..."}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                        Pesan <span className="text-red-400">*</span>
                      </label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Jelaskan mengapa IP Anda harus dibuka blokirnya..." title="Pesan permintaan" rows={4}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none resize-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email (opsional)</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="email@contoh.com" title="Email untuk balasan"
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
                    </div>
                  </div>

                  {error && <p className="text-sm font-medium text-red-500 mt-2">{error}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengirim...</>
                    : <><Send className="w-4 h-4" />Kirim Permintaan</>
                  }
                </button>

                <Link href="/"
                  className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
                  <ArrowLeft className="w-3 h-3" />
                  Kembali ke Beranda
                </Link>
              </form>
            )}

            {/* Sent confirmation */}
            {isManual && sent && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-lg px-4 py-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Permintaan Terkirim</p>
                    <p className="text-sm text-green-600 mt-0.5">Administrator akan meninjau permintaan Anda.</p>
                  </div>
                </div>
                <Link href="/"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Beranda
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">BKPSDM Kabupaten Kepulauan Anambas</p>
      </div>
    </div>
  );
}
