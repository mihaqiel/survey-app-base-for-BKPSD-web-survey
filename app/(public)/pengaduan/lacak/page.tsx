"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  FileText,
  AlertCircle,
  Tag,
} from "lucide-react";

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
// Display status config (citizen-facing labels only)
// ---------------------------------------------------------------------------

const DISPLAY_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  MENUNGGU: {
    label: "Menunggu Verifikasi",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    Icon: Clock,
  },
  DIPROSES: {
    label: "Sedang Diproses",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    Icon: Loader2,
  },
  SELESAI: {
    label: "Selesai",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    Icon: CheckCircle,
  },
  DITOLAK: {
    label: "Ditolak",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    Icon: XCircle,
  },
};

// Aksi label map for public log entries
const AKSI_LABEL: Record<string, string> = {
  DIBUAT: "Pengaduan diterima",
  STATUS_BERUBAH: "Status diperbarui",
  CATATAN: "Pesan dari petugas",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTicketDisplay(nomorUrut: number, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  return `PGD-${year}-${String(nomorUrut).padStart(5, "0")}`;
}

function formatDate(dateStr: string): string {
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
// Component
// ---------------------------------------------------------------------------

function LacakContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [ticketInput, setTicketInput] = useState(
    searchParams.get("ticket") ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (ticket: string) => {
    const trimmed = ticket.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    // Update URL param without navigation
    router.replace(`/pengaduan/lacak?ticket=${encodeURIComponent(trimmed)}`, {
      scroll: false,
    });

    try {
      const res = await fetch(
        `/api/pengaduan/public?ticket=${encodeURIComponent(trimmed)}`
      );
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
  }, [router]);

  // Auto-search if ticket param is present on mount
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
    doSearch(ticketInput);
  };

  const statusConfig =
    result ? (DISPLAY_STATUS_CONFIG[result.displayStatus] ?? DISPLAY_STATUS_CONFIG.MENUNGGU) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: "#009CC5" }}
          >
            <Search className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lacak Status Pengaduan
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Masukkan nomor tiket pengaduan Anda untuk melihat status terkini.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Search form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Contoh: PGD-2026-00003"
                className="w-full pl-9 pr-4 py-2.5 text-sm font-mono border border-gray-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent uppercase"
                style={{ "--tw-ring-color": "#009CC5" } as React.CSSProperties}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              disabled={!ticketInput.trim() || loading}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#009CC5" }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Lacak"
              )}
            </button>
          </form>
          <p className="text-[11px] text-slate-400 mt-2">
            Nomor tiket dikirimkan ke email Anda saat pengaduan berhasil diajukan.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-slate-500">Mencari pengaduan…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && searched && error && (
          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Pengaduan tidak ditemukan
                </p>
                <p className="text-sm text-slate-500 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Result card */}
        {!loading && result && statusConfig && (
          <div className="space-y-4">
            {/* Ticket header */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-slate-400 mb-1">
                    {formatTicketDisplay(result.nomorUrut, result.createdAt)}
                  </p>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {result.judul}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {result.kategori && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Tag className="w-3 h-3" />
                        {result.kategori}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Diajukan: {formatDate(result.createdAt)}
                    </span>
                  </div>
                </div>
                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color} ${statusConfig.bg} ${statusConfig.border} shrink-0`}
                >
                  <statusConfig.Icon
                    className={`w-3.5 h-3.5 ${result.displayStatus === "DIPROSES" ? "animate-spin" : ""}`}
                  />
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Public activity timeline */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Riwayat Pengaduan
              </p>

              {result.log.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Belum ada pembaruan yang tersedia.
                </p>
              ) : (
                <ol className="relative space-y-0">
                  {result.log.map((entry, idx) => {
                    const isLast = idx === result.log.length - 1;
                    const label =
                      AKSI_LABEL[entry.aksi] ?? entry.aksi;

                    // For STATUS_BERUBAH entries, extract the message part after the arrow
                    // Format: "PREV → NEXT\nOptional message"
                    let displayDesc = entry.deskripsi;
                    if (
                      entry.aksi === "STATUS_BERUBAH" &&
                      entry.deskripsi?.includes("\n")
                    ) {
                      displayDesc = entry.deskripsi.split("\n").slice(1).join("\n").trim();
                    } else if (
                      entry.aksi === "STATUS_BERUBAH" &&
                      entry.deskripsi?.includes("→")
                    ) {
                      // Hide raw "PREV → NEXT" from citizens — they see the status badge instead
                      displayDesc = null;
                    }

                    return (
                      <li key={entry.id} className="flex gap-3">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ background: "#009CC5" }}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 bg-gray-200 my-1" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-4"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700 leading-snug">
                              {label}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                          {displayDesc && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">
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
            <div className="bg-slate-100 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi BKPSDM Kabupaten Kepulauan Anambas secara langsung atau melalui email resmi kami.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Suspense wrapper required because LacakContent calls useSearchParams(),
// which opts out of static prerendering and must be inside a Suspense boundary.
export default function LacakPengaduanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      }
    >
      <LacakContent />
    </Suspense>
  );
}
