"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldOff, AlertTriangle, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { submitUnblockRequest } from "@/app/action/submit";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm font-medium text-white outline-none transition-all";
const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
};
const labelCls =
  "block text-[10px] font-semibold uppercase tracking-[0.22em] mb-1.5";

export default function BlockedPage() {
  const [reason,  setReason]  = useState("duplicate");
  const [ip,      setIp]      = useState("");
  const [message, setMessage] = useState("");
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReason(params.get("reason") ?? "duplicate");
    const serverIp = params.get("ip");
    if (serverIp) {
      setIp(serverIp);
    } else {
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

  const accentColor = isDuplicate ? "#FAE705" : "#f87171";
  const accentBg    = isDuplicate ? "rgba(250,231,5,0.10)" : "rgba(239,68,68,0.12)";

  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden`}
      style={{ background: "#0d1b2a", fontFamily: "var(--font-body, sans-serif)" }}
    >
      {/* Orb A — yellow top-left */}
      <div className="pointer-events-none" style={{ position:"fixed", top:"-180px", left:"-180px", width:"560px", height:"560px", borderRadius:"50%", background:"rgba(250,231,5,0.07)", filter:"blur(160px)", zIndex:0 }} />
      {/* Orb B — cyan bottom-right */}
      <div className="pointer-events-none" style={{ position:"fixed", bottom:"-120px", right:"-120px", width:"480px", height:"480px", borderRadius:"50%", background:"rgba(56,189,248,0.09)", filter:"blur(140px)", zIndex:0 }} />
      {/* Dot grid */}
      <div className="pointer-events-none" style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize:"28px 28px", zIndex:0 }} />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>

          {/* Header */}
          <div className="px-8 py-6" style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: accentBg, color: accentColor }}>
                {isDuplicate
                  ? <AlertTriangle className="w-6 h-6" />
                  : <ShieldOff className="w-6 h-6" />
                }
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 rounded-full"
                style={{ background: accentBg, color: accentColor }}>
                {isDuplicate ? "Duplikasi Terdeteksi" : "Akses Diblokir"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily:"var(--font-display)" }}>
              {isDuplicate ? "Survei Sudah Diisi" : "IP Anda Diblokir"}
            </h1>
          </div>

          {/* Body */}
          <div className="px-8 py-7 space-y-5">

            {/* Message strip */}
            <div className="px-4 py-4 rounded-xl flex items-start gap-3"
              style={{ background: accentBg, border:`1px solid ${accentBg}` }}>
              <div className="w-1 min-h-[20px] rounded-full shrink-0 mt-0.5" style={{ background: accentColor }} />
              <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.70)" }}>
                {isDuplicate
                  ? "Sistem mendeteksi bahwa perangkat ini sudah mengisi survei untuk layanan yang sama hari ini. Setiap perangkat hanya dapat mengisi 1 survei per layanan per hari."
                  : "IP address Anda telah diblokir secara manual oleh administrator. Jika Anda merasa ini adalah kesalahan, silakan kirim permintaan pembukaan blokir di bawah."
                }
              </p>
            </div>

            {/* Duplicate: back button only */}
            {isDuplicate && (
              <Link href="/"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.70)" }}>
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            )}

            {/* Manual block: unblock request form */}
            {isManual && !sent && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color:"rgba(255,255,255,0.40)" }}>
                  Kirim Permintaan Pembukaan Blokir
                </p>

                {/* IP display */}
                <div className="px-4 py-3 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>IP Address Anda</p>
                  <p className="text-sm font-mono font-bold text-white">{ip || "Memuat..."}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>
                      Pesan <span style={{ color:"#f87171" }}>*</span>
                    </label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Jelaskan mengapa IP Anda harus dibuka blokirnya..."
                      title="Pesan permintaan" rows={4}
                      className={`${inputCls} resize-none`}
                      style={{ ...inputStyle, fontFamily:"var(--font-body)" }}
                      onFocus={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.30)"; }}
                      onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; }}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color:"rgba(255,255,255,0.45)" }}>Email (opsional)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@contoh.com" title="Email untuk balasan"
                      className={inputCls}
                      style={{ ...inputStyle, fontFamily:"var(--font-body)" }}
                      onFocus={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.30)"; }}
                      onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-lg px-4 py-3"
                    style={{ background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.25)" }}>
                    <div className="w-1 min-h-[20px] rounded-full shrink-0" style={{ background:"#ef4444" }} />
                    <p className="text-sm font-medium" style={{ color:"#f87171" }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background:"#FAE705", color:"#0d1b2a" }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:"rgba(13,27,42,0.25)", borderTopColor:"#0d1b2a" }} />Mengirim...</>
                    : <><Send className="w-4 h-4" />Kirim Permintaan</>
                  }
                </button>

                <Link href="/"
                  className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium transition-colors"
                  style={{ color:"rgba(255,255,255,0.35)" }}>
                  <ArrowLeft className="w-3 h-3" />
                  Kembali ke Beranda
                </Link>
              </form>
            )}

            {/* Sent confirmation */}
            {isManual && sent && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl"
                  style={{ background:"rgba(34,197,94,0.10)", border:"1px solid rgba(34,197,94,0.20)" }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color:"#4ade80" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color:"#4ade80" }}>Permintaan Terkirim</p>
                    <p className="text-sm mt-0.5" style={{ color:"rgba(255,255,255,0.50)" }}>Administrator akan meninjau permintaan Anda.</p>
                  </div>
                </div>
                <Link href="/"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.70)" }}>
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Beranda
                </Link>
              </div>
            )}

          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color:"rgba(255,255,255,0.22)" }}>
          BKPSDM Kabupaten Kepulauan Anambas
        </p>
      </div>

      <style>{`
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.20); }
      `}</style>
    </div>
  );
}
