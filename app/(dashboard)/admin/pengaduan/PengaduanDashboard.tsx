"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquareWarning,
  Search,
  Filter,
  Paperclip,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  STATUS_LIST,
  STATUS_META,
  PRIORITAS_META,
  KATEGORI_LIST,
  formatTicket,
  formatSlaRemaining,
  getSlaStatus,
  type StatusPengaduan,
  type PrioratasPengaduan,
} from "@/lib/pengaduan";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Lampiran = { id: string; mimeType: string; nama: string; urutan: number };

type Complaint = {
  id: string;
  nomorUrut: number;
  nama: string;
  email: string;
  telepon: string | null;
  judul: string;
  isi: string;
  kategori: string | null;
  prioritas: string;
  status: string;
  createdAt: Date;
  lampiran: Lampiran[];
  petugas: { id: string; nama: string } | null;
  _count: { log: number };
};

// ---------------------------------------------------------------------------
// Module-level constants (hoisted to avoid new object refs per render)
// ---------------------------------------------------------------------------

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const STATUS_META_FALLBACK = {
  label: "",
  color: "text-slate-700",
  bg: "bg-slate-100",
  border: "border-slate-200",
};

// ---------------------------------------------------------------------------
// Prioritas dot colors (explicit hex, not dynamic Tailwind classes)
// ---------------------------------------------------------------------------

const PRIORITAS_DOT_COLOR: Record<string, string> = {
  RENDAH:   "#94a3b8",
  NORMAL:   "#3b82f6",
  TINGGI:   "#f59e0b",
  MENDESAK: "#ef4444",
};

// ---------------------------------------------------------------------------
// SLA chip
// ---------------------------------------------------------------------------

function SlaChip({
  createdAt,
  prioritas,
  status,
}: {
  createdAt: Date;
  prioritas: string;
  status: string;
}) {
  // Hide for terminal statuses
  if (status === "SELESAI" || status === "DITOLAK") return null;

  const slaState = getSlaStatus(createdAt, prioritas, status);
  const label = formatSlaRemaining(createdAt, prioritas, status);

  const classes =
    slaState === "overdue"
      ? "bg-red-50 text-red-600 border border-red-200"
      : slaState === "warning"
      ? "bg-amber-50 text-amber-600 border border-amber-200"
      : "bg-green-50 text-green-600 border border-green-200";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${classes}`}
    >
      <Clock className="w-3 h-3 shrink-0" />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PengaduanDashboardProps {
  initialData: Complaint[];
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PengaduanDashboard({ initialData }: PengaduanDashboardProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterPrioritas, setFilterPrioritas] = useState("");

  // -------------------------------------------------------------------------
  // Filtered list
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialData.filter((p) => {
      if (q) {
        const ticket = formatTicket(p.nomorUrut, p.createdAt).toLowerCase();
        const matchSearch =
          p.nama.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          ticket.includes(q);
        if (!matchSearch) return false;
      }
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterKategori && p.kategori !== filterKategori) return false;
      if (filterPrioritas && p.prioritas !== filterPrioritas) return false;
      return true;
    });
  }, [initialData, search, filterStatus, filterKategori, filterPrioritas]);

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_LIST) counts[s] = 0;
    for (const p of initialData) {
      if (counts[p.status] !== undefined) counts[p.status]++;
    }
    return counts;
  }, [initialData]);

  const overdueCount = useMemo(
    () =>
      initialData.filter(
        (p) => getSlaStatus(p.createdAt, p.prioritas, p.status) === "overdue",
      ).length,
    [initialData],
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="px-6 py-8 animate-fade-up"
        style={{ background: "var(--navy, #132B4F)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: "rgba(0,156,197,0.20)" }}
            >
              <MessageSquareWarning
                className="w-6 h-6"
                style={{ color: "var(--cyan, #009CC5)" }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight tracking-tight">
                Pengaduan Masyarakat
              </h1>
              <p className="mt-0.5 text-sm text-slate-300">
                {initialData.length} pengaduan terdaftar
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Stats bar                                                         */}
          {/* ---------------------------------------------------------------- */}
          <div className="mt-6 flex flex-wrap gap-2">
            {STATUS_LIST.map((s) => {
              const meta = STATUS_META[s];
              const active = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus((prev) => (prev === s ? "" : s))}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${
                      active
                        ? `${meta.bg} ${meta.color} ${meta.border} ring-2 ring-white/30`
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  {meta.label}
                  <span className={`ml-0.5 font-bold tabular-nums ${active ? meta.color : "text-white/80"}`}>
                    {statusCounts[s]}
                  </span>
                </button>
              );
            })}

            {/* Terlambat pill */}
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-red-500/20 text-red-200 border-red-400/30">
                <AlertTriangle className="w-3 h-3" />
                Terlambat
                <span className="ml-0.5 font-bold tabular-nums text-red-100">
                  {overdueCount}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search + filter bar                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-3 items-center">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau nomor tiket…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <Filter className="w-4 h-4" />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition cursor-pointer"
          >
            <option value="">Semua Status</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>

          {/* Kategori filter */}
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {KATEGORI_LIST.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          {/* Prioritas filter */}
          <select
            value={filterPrioritas}
            onChange={(e) => setFilterPrioritas(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition cursor-pointer"
          >
            <option value="">Semua Prioritas</option>
            {(["RENDAH", "NORMAL", "TINGGI", "MENDESAK"] as PrioratasPengaduan[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITAS_META[p].label}
              </option>
            ))}
          </select>

          {(search || filterStatus || filterKategori || filterPrioritas) && (
            <span className="text-xs text-slate-500 tabular-nums shrink-0">
              {filtered.length} hasil
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Complaint list                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-3 animate-fade-up">
        {filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-5 rounded-full bg-slate-100 mb-4">
              <MessageSquareWarning className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-600">
              Tidak ada pengaduan ditemukan
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Coba ubah filter atau kata kunci pencarian Anda.
            </p>
            {(search || filterStatus || filterKategori || filterPrioritas) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatus("");
                  setFilterKategori("");
                  setFilterPrioritas("");
                }}
                className="mt-4 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          filtered.map((p) => {
            const ticketNo = formatTicket(p.nomorUrut, p.createdAt);
            const statusMeta = STATUS_META[p.status as StatusPengaduan] ?? {
              ...STATUS_META_FALLBACK,
              label: p.status,
            };
            const dotColor = PRIORITAS_DOT_COLOR[p.prioritas] ?? "#94a3b8";

            return (
              <article
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/pengaduan/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/admin/pengaduan/${p.id}`);
                  }
                }}
                aria-label={`Lihat detail pengaduan ${ticketNo}: ${p.judul}`}
                className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: dotColor,
                }}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* -------------------------------------------------------- */}
                  {/* LEFT: priority dot + ticket number + attachment count      */}
                  {/* -------------------------------------------------------- */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0 w-[84px]">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      {ticketNo}
                    </span>
                    {p.lampiran.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
                        <Paperclip className="w-3 h-3" />
                        {p.lampiran.length}
                      </span>
                    )}
                    {p._count.log > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 rounded px-1 py-0.5">
                        <MessageSquare className="w-2.5 h-2.5" />
                        {p._count.log}
                      </span>
                    )}
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* CENTER: title + complainant meta                           */}
                  {/* -------------------------------------------------------- */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate leading-snug">
                      {p.judul}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 truncate">
                      {p.nama}
                      {" · "}
                      {p.email}
                      {" · "}
                      {new Date(p.createdAt).toLocaleDateString("id-ID", DATE_FORMAT_OPTIONS)}
                    </p>
                    {p.petugas && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        Petugas:{" "}
                        <span className="text-slate-600 font-medium">{p.petugas.nama}</span>
                      </p>
                    )}
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* RIGHT: category pill + SLA chip + status badge + CTA       */}
                  {/* -------------------------------------------------------- */}
                  <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                    {p.kategori && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {p.kategori}
                      </span>
                    )}

                    <SlaChip
                      createdAt={p.createdAt}
                      prioritas={p.prioritas}
                      status={p.status}
                    />

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap
                        ${statusMeta.color} ${statusMeta.bg} ${statusMeta.border}`}
                    >
                      {statusMeta.label}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/pengaduan/${p.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                      style={{ background: "var(--navy, #132B4F)" }}
                    >
                      Lihat Detail
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
