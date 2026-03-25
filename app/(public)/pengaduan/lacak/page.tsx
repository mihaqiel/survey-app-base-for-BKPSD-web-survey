"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Playfair_Display, DM_Sans } from "next/font/google";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Tag,
  Calendar,
  Mail,
  ChevronRight,
  FileText,
} from "lucide-react";

/* ── Fonts ─────────────────────────────────────── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--lk-display",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--lk-body",
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PublicLogEntry = {
  id: string;
  aksi: string;
  deskripsi: string | null;
  createdAt: string;
};

type TrackingResult = {
  id: string;
  nomorUrut: number;
  judul: string;
  kategori: string | null;
  status: string;
  displayStatus: string;
  createdAt: string;
  log: PublicLogEntry[];
};

// ---------------------------------------------------------------------------
// Display status config
// ---------------------------------------------------------------------------

type StatusCfg = {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const STATUS_CFG: Record<string, StatusCfg> = {
  MENUNGGU: {
    label: "Menunggu Verifikasi",
    textColor: "#92400e",
    bgColor: "#fef3c7",
    borderColor: "#fcd34d",
    dotColor: "#f59e0b",
    Icon: Clock,
  },
  DIPROSES: {
    label: "Sedang Diproses",
    textColor: "#0c4a6e",
    bgColor: "#e0f2fe",
    borderColor: "#7dd3fc",
    dotColor: "#38bdf8",
    Icon: Loader2,
  },
  SELESAI: {
    label: "Selesai",
    textColor: "#14532d",
    bgColor: "#dcfce7",
    borderColor: "#86efac",
    dotColor: "#22c55e",
    Icon: CheckCircle,
  },
  DITOLAK: {
    label: "Ditolak",
    textColor: "#7f1d1d",
    bgColor: "#fee2e2",
    borderColor: "#fca5a5",
    dotColor: "#ef4444",
    Icon: XCircle,
  },
};

const AKSI_LABEL: Record<string, string> = {
  DIBUAT: "Pengaduan Diterima",
  STATUS_BERUBAH: "Status Diperbarui",
  CATATAN: "Pesan dari Petugas",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTicketStr(nomorUrut: number, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  return `PGD-${year}-${String(nomorUrut).padStart(5, "0")}`;
}

function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Inner component (uses useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------

function LacakContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [ticketInput, setTicketInput] = useState(searchParams.get("ticket") ?? "");
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const doSearch = useCallback(
    async (ticket: string, email?: string) => {
      const trimmed = ticket.trim().toUpperCase();
      if (!trimmed) return;

      setLoading(true);
      setError(null);
      setResult(null);
      setSearched(true);

      // Reflect ticket in URL (for deep-linking) but don't expose email
      router.replace(`/pengaduan/lacak?ticket=${encodeURIComponent(trimmed)}`, {
        scroll: false,
      });

      try {
        const params = new URLSearchParams({ ticket: trimmed });
        if (email?.trim()) params.set("email", email.trim().toLowerCase());

        const res = await fetch(`/api/pengaduan/public?${params}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
        } else {
          setResult(data as TrackingResult);
        }
      } catch {
        setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Auto-search if ?ticket= is present on mount
  useEffect(() => {
    const ticketParam = searchParams.get("ticket");
    if (ticketParam) {
      setTicketInput(ticketParam);
      doSearch(ticketParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(ticketInput, emailInput);
  };

  const handleCopy = () => {
    if (!result) return;
    const ticket = formatTicketStr(result.nomorUrut, result.createdAt);
    navigator.clipboard.writeText(ticket).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const statusCfg =
    result ? (STATUS_CFG[result.displayStatus] ?? STATUS_CFG.MENUNGGU) : null;

  return (
    <div
      className={`${playfair.variable} ${dmSans.variable}`}
      style={{ fontFamily: "var(--lk-body, DM Sans, sans-serif)" }}
    >
      {/* ── KEYFRAMES + GRADIENT CLASSES ── */}
      <style>{`
        @keyframes lacakHeroGrad {
          0%   { background-position: 0%   50%; }
          25%  { background-position: 100% 50%; }
          50%  { background-position: 100% 0%;  }
          75%  { background-position: 0%  100%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes lacakOrbA {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(28px,-20px) scale(1.09); }
          70%     { transform: translate(-16px,26px) scale(0.92); }
        }
        @keyframes lacakOrbB {
          0%,100% { transform: translate(0,0) scale(1); }
          35%     { transform: translate(-26px,22px) scale(1.07); }
          75%     { transform: translate(24px,-14px) scale(0.93); }
        }
        @keyframes lacakOrbC {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(18px,30px) scale(1.11); }
        }
        @keyframes lacakPulse {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.5; }
        }

        .lacak-hero-grad {
          background: linear-gradient(-45deg,
            #0d2d58, #1565c0, #38bdf8, #FAE705, #38bdf8, #0d2d58, #091a33
          );
          background-size: 400% 400%;
          animation: lacakHeroGrad 18s ease infinite;
          will-change: background-position;
        }
        .lacak-dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 36px 36px;
        }
        .lacak-orb-a { animation: lacakOrbA 10s ease-in-out infinite; }
        .lacak-orb-b { animation: lacakOrbB 13s ease-in-out infinite; animation-delay: -5s; }
        .lacak-orb-c { animation: lacakOrbC  8s ease-in-out infinite; animation-delay: -3s; }
        .lacak-skeleton { animation: lacakPulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="lacak-hero-grad"
        style={{
          padding: "4rem 1rem 5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid overlay */}
        <div
          className="lacak-dot-grid"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />

        {/* Orb A — top-right */}
        <div
          className="lacak-orb-a"
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, rgba(56,189,248,0.18), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Orb B — bottom-left */}
        <div
          className="lacak-orb-b"
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 60% 60%, rgba(250,231,5,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Orb C — centre-right */}
        <div
          className="lacak-orb-c"
          style={{
            position: "absolute",
            top: "30%",
            right: "10%",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 50%, rgba(21,101,192,0.15), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* Icon badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(56,189,248,0.15)",
              border: "1.5px solid rgba(56,189,248,0.35)",
              marginBottom: "1.5rem",
            }}
          >
            <Search className="w-6 h-6" style={{ color: "#38bdf8" }} />
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--lk-display, Playfair Display, Georgia, serif)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: "0.75rem",
            }}
          >
            Lacak Status Pengaduan
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.65)",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
            }}
          >
            Masukkan nomor tiket untuk melihat perkembangan terkini pengaduan Anda.
          </p>

          {/* Search card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "1.75rem",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              textAlign: "left",
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Ticket input */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    marginBottom: "0.5rem",
                  }}
                >
                  Nomor Tiket Pengaduan
                </label>
                <div style={{ position: "relative" }}>
                  <FileText
                    className="w-4 h-4"
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: PGD-2026-00003"
                    autoComplete="off"
                    spellCheck={false}
                    style={{
                      width: "100%",
                      paddingLeft: "40px",
                      paddingRight: "16px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      fontSize: "0.9rem",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      background: "#f8f7f3",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#38bdf8")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>

              {/* Email input (optional) */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    marginBottom: "0.5rem",
                  }}
                >
                  Email Pelapor{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: "normal",
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                    }}
                  >
                    (opsional — untuk verifikasi)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    className="w-4 h-4"
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="email@contoh.com"
                    autoComplete="email"
                    style={{
                      width: "100%",
                      paddingLeft: "40px",
                      paddingRight: "16px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      fontSize: "0.9rem",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      background: "#f8f7f3",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#38bdf8")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!ticketInput.trim() || loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "13px 24px",
                  borderRadius: "10px",
                  border: "none",
                  background: ticketInput.trim() && !loading ? "#38bdf8" : "#cbd5e1",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: ticketInput.trim() && !loading ? "pointer" : "not-allowed",
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (ticketInput.trim() && !loading)
                    e.currentTarget.style.background = "#0ea5e9";
                }}
                onMouseLeave={(e) => {
                  if (ticketInput.trim() && !loading)
                    e.currentTarget.style.background = "#38bdf8";
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? "Mencari…" : "Lacak Pengaduan"}
              </button>
            </form>

            <p
              style={{
                fontSize: "0.72rem",
                color: "#94a3b8",
                marginTop: "0.75rem",
                lineHeight: 1.5,
              }}
            >
              Nomor tiket dikirimkan ke email Anda setelah pengaduan berhasil diajukan.
            </p>
          </div>
        </div>
      </section>

      {/* ── RESULTS ──
          No minHeight — section only grows when there is actual content.
          This prevents the scroll jump that occurred when results loaded
          into a pre-reserved empty space. ── */}
      {searched && (
        <section style={{ background: "#f8f7f3", padding: "2.5rem 1rem 4rem" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* ── Loading skeleton ──
                Holds page height stable while the API fetch is in-flight,
                preventing layout shift when the real result card appears. ── */}
            {loading && (
              <div
                className="lacak-skeleton"
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ height: "4px", background: "#e2e8f0" }} />
                <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div style={{ height: "13px", width: "140px", background: "#f1f5f9", borderRadius: "6px" }} />
                  <div style={{ height: "22px", width: "75%", background: "#f1f5f9", borderRadius: "6px" }} />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ height: "12px", width: "160px", background: "#f1f5f9", borderRadius: "6px" }} />
                    <div style={{ height: "12px", width: "100px", background: "#f1f5f9", borderRadius: "6px" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1.5px solid #fca5a5",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "0.875rem",
                  alignItems: "flex-start",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <AlertCircle className="w-5 h-5 shrink-0" style={{ color: "#ef4444", marginTop: "1px" }} />
                <div>
                  <p style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9rem", marginBottom: "4px" }}>
                    Pengaduan tidak ditemukan
                  </p>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: 1.5 }}>{error}</p>
                </div>
              </div>
            )}

            {/* Result */}
            {!loading && result && statusCfg && (
              <>
                {/* Ticket summary card */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Card header accent bar */}
                  <div
                    style={{
                      height: "4px",
                      background: `linear-gradient(90deg, ${statusCfg.dotColor}, ${statusCfg.borderColor})`,
                    }}
                  />
                  <div style={{ padding: "1.25rem 1.5rem" }}>
                    {/* Ticket number + copy */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.75rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "ui-monospace, SFMono-Regular, monospace",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#475569",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {formatTicketStr(result.nomorUrut, result.createdAt)}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button
                          onClick={handleCopy}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            background: copied ? "#f0fdf4" : "#f8f7f3",
                            color: copied ? "#15803d" : "#64748b",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {copied ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {copied ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
                    </div>

                    {/* Title + status */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: "var(--lk-display, Playfair Display, Georgia, serif)",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 1.35,
                          flex: 1,
                          minWidth: "180px",
                        }}
                      >
                        {result.judul}
                      </h2>

                      {/* Status badge */}
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          borderRadius: "99px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: statusCfg.textColor,
                          background: statusCfg.bgColor,
                          border: `1.5px solid ${statusCfg.borderColor}`,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        <statusCfg.Icon
                          className={`w-3.5 h-3.5 ${result.displayStatus === "DIPROSES" ? "animate-spin" : ""}`}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.875rem",
                        marginTop: "0.875rem",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Diajukan: {formatDateLong(result.createdAt)}
                      </span>
                      {result.kategori && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "0.75rem",
                            color: "#64748b",
                          }}
                        >
                          <Tag className="w-3.5 h-3.5" />
                          {result.kategori}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline card */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    padding: "1.5rem",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: "#94a3b8",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Riwayat Pengaduan
                  </p>

                  {result.log.length === 0 ? (
                    <p style={{ fontSize: "0.83rem", color: "#94a3b8", textAlign: "center", padding: "1rem 0" }}>
                      Belum ada pembaruan yang tersedia.
                    </p>
                  ) : (
                    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {result.log.map((entry, idx) => {
                        const isLast = idx === result.log.length - 1;
                        const label = AKSI_LABEL[entry.aksi] ?? entry.aksi;

                        // For STATUS_BERUBAH: strip "PREV → NEXT\n" — show only the admin message
                        let displayDesc = entry.deskripsi;
                        if (entry.aksi === "STATUS_BERUBAH" && entry.deskripsi?.includes("\n")) {
                          displayDesc = entry.deskripsi.split("\n").slice(1).join("\n").trim() || null;
                        } else if (entry.aksi === "STATUS_BERUBAH" && entry.deskripsi?.includes("→")) {
                          displayDesc = null; // hide raw "PREV → NEXT" from citizens
                        }

                        return (
                          <li key={entry.id} style={{ display: "flex", gap: "12px" }}>
                            {/* Timeline dot + connector */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: "26px",
                                  height: "26px",
                                  borderRadius: "50%",
                                  background: "#38bdf8",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <ChevronRight className="w-3.5 h-3.5" style={{ color: "#ffffff" }} />
                              </div>
                              {!isLast && (
                                <div
                                  style={{
                                    width: "1px",
                                    flex: 1,
                                    background: "#e2e8f0",
                                    margin: "4px 0",
                                  }}
                                />
                              )}
                            </div>

                            {/* Content */}
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                paddingBottom: isLast ? 0 : "1.25rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: "0.5rem",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: "0.83rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {label}
                                </p>
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "#94a3b8",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    marginTop: "1px",
                                  }}
                                >
                                  {formatDateLong(entry.createdAt)}
                                </span>
                              </div>
                              {displayDesc && (
                                <p
                                  style={{
                                    fontSize: "0.82rem",
                                    color: "#475569",
                                    marginTop: "6px",
                                    lineHeight: 1.6,
                                    whiteSpace: "pre-wrap",
                                    background:
                                      entry.aksi === "CATATAN"
                                        ? "rgba(56,189,248,0.06)"
                                        : "transparent",
                                    borderLeft:
                                      entry.aksi === "CATATAN"
                                        ? "3px solid #38bdf8"
                                        : "none",
                                    padding: entry.aksi === "CATATAN" ? "8px 12px" : "0",
                                    borderRadius: entry.aksi === "CATATAN" ? "0 6px 6px 0" : "0",
                                  }}
                                >
                                  {displayDesc}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>

                {/* Help note */}
                <div
                  style={{
                    background: "rgba(13,29,88,0.05)",
                    borderRadius: "12px",
                    padding: "0.875rem 1.125rem",
                    border: "1px solid rgba(13,45,88,0.08)",
                  }}
                >
                  <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                    Jika ada pertanyaan lebih lanjut, silakan hubungi BKPSDM Kabupaten Kepulauan Anambas
                    secara langsung atau melalui email{" "}
                    <a
                      href="mailto:bkpsdm@anambaskab.go.id"
                      style={{ color: "#0d2d58", fontWeight: 600 }}
                    >
                      bkpsdm@anambaskab.go.id
                    </a>
                    .
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — Suspense wrapper required for useSearchParams()
// The fallback uses the same padding as the real hero section so that
// hydration causes no height jump (previously it was minHeight:100vh).
// ---------------------------------------------------------------------------

export default function LacakPengaduanPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: "linear-gradient(-45deg, #0d2d58, #38bdf8, #FAE705, #0d2d58)",
            padding: "4rem 1rem 5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#38bdf8" }} />
        </div>
      }
    >
      <LacakContent />
    </Suspense>
  );
}
