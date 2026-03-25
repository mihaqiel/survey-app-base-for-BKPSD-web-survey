"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Paperclip,
  FileText,
  X,
  ZoomIn,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  ChevronRight,
} from "lucide-react";
import {
  STATUS_LIST,
  STATUS_META,
  PRIORITAS_LIST,
  PRIORITAS_META,
  formatTicket,
  formatSlaRemaining,
  getSlaStatus,
  AKSI_META,
} from "@/lib/pengaduan";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Lampiran = { id: string; mimeType: string; nama: string; urutan: number };
type LogEntry = {
  id: string;
  aksi: string;
  deskripsi: string | null;
  oleh: string;
  createdAt: Date;
};
type Petugas = { id: string; nama: string } | null;
type ComplaintDetail = {
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
  petugasId: string | null;
  createdAt: Date;
  lampiran: Lampiran[];
  log: LogEntry[];
  petugas: Petugas;
};
type PegawaiItem = { id: string; nama: string };

interface Props {
  data: ComplaintDetail;
  pegawaiList: PegawaiItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 30) return `${diffDays} hari lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} bulan lalu`;
  return `${Math.floor(diffMonths / 12)} tahun lalu`;
}

// Map aksi keys to lucide-react icon components for the timeline
function AksiIcon({ aksi }: { aksi: string }) {
  switch (aksi) {
    case "DIBUAT":
      return <FileText className="w-3.5 h-3.5" />;
    case "STATUS_BERUBAH":
      return <ChevronRight className="w-3.5 h-3.5" />;
    case "PRIORITAS_BERUBAH":
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case "PETUGAS_DITUGASKAN":
      return <User className="w-3.5 h-3.5" />;
    case "CATATAN":
      return <Tag className="w-3.5 h-3.5" />;
    default:
      return <Clock className="w-3.5 h-3.5" />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PengaduanDetailClient({ data, pegawaiList }: Props) {
  const router = useRouter();
  const [complaint, setComplaint] = useState(data);
  const [log, setLog] = useState(data.log);
  const [updating, setUpdating] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  // Close lightbox on Escape — depend on truthiness only; handler doesn't close over lightbox content
  const lightboxOpen = !!lightbox;
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen]);

  const patchComplaint = useCallback(async (patch: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: complaint.id, ...patch }),
      });
      if (res.ok) {
        setComplaint((prev) => ({ ...prev, ...patch }));
        // Refresh log from GET /api/pengaduan/[id]
        const fresh = await fetch(`/api/pengaduan/${complaint.id}`);
        if (fresh.ok) {
          const freshData = await fresh.json();
          setLog(freshData.log);
        }
      }
    } catch (err) {
      console.error("[PengaduanDetailClient] patch error:", err);
    } finally {
      setUpdating(false);
    }
  }, [complaint.id]);

  const ticket = formatTicket(complaint.nomorUrut, complaint.createdAt);
  const slaStatus = getSlaStatus(complaint.createdAt, complaint.prioritas, complaint.status);
  const slaText = formatSlaRemaining(complaint.createdAt, complaint.prioritas, complaint.status);
  const prioritasMeta = PRIORITAS_META[complaint.prioritas as keyof typeof PRIORITAS_META];
  const statusMeta = STATUS_META[complaint.status as keyof typeof STATUS_META];

  const slaChipStyle =
    slaStatus === "overdue"
      ? "bg-red-50 text-red-600 border-red-200"
      : slaStatus === "warning"
        ? "bg-amber-50 text-amber-600 border-amber-200"
        : "bg-green-50 text-green-600 border-green-200";

  const imageAttachments = complaint.lampiran.filter((l) => l.mimeType.startsWith("image/"));
  const fileAttachments = complaint.lampiran.filter((l) => !l.mimeType.startsWith("image/"));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* ── Back button ── */}
        <button
          type="button"
          onClick={() => router.push("/admin/pengaduan")}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </button>

        {/* ── Title area ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-semibold text-slate-400 mb-1">{ticket}</p>
              <h1 className="text-xl font-bold text-slate-900 leading-snug">{complaint.judul}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Priority badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${prioritasMeta.color} bg-white border-gray-200`}
              >
                <span className={`w-2 h-2 rounded-full ${prioritasMeta.dot}`} />
                {prioritasMeta.label}
              </span>
              {/* SLA chip */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${slaChipStyle}`}
              >
                {slaStatus === "overdue" ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {slaText}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main two-column layout ── */}
        <div className="flex gap-5 items-start flex-col lg:flex-row">

          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Pelapor card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Data Pelapor
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Nama</p>
                    <p className="text-sm font-medium text-slate-800">{complaint.nama}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-slate-800 break-all">{complaint.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Telepon</p>
                    <p className="text-sm font-medium text-slate-800">{complaint.telepon ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Tanggal Masuk</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(complaint.createdAt).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {complaint.kategori && (
                  <div className="flex items-start gap-2.5">
                    <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Kategori</p>
                      <p className="text-sm font-medium text-slate-800">{complaint.kategori}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Isi Pengaduan card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Isi Pengaduan
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.isi}
              </div>
            </div>

            {/* Lampiran card */}
            {complaint.lampiran.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    Lampiran Bukti ({complaint.lampiran.length})
                  </span>
                </p>

                {/* Image grid */}
                {imageAttachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {imageAttachments.map((l) => {
                      const src = `/api/pengaduan/${complaint.id}/gambar?lid=${l.id}`;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setLightbox({ src, alt: l.nama })}
                          className="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-slate-50 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={l.nama}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                          </div>
                          <p className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] text-white bg-black/50 truncate translate-y-full group-hover:translate-y-0 transition-transform">
                            {l.nama}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Non-image files */}
                {fileAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {fileAttachments.map((l) => (
                      <a
                        key={l.id}
                        href={`/api/pengaduan/${complaint.id}/gambar?lid=${l.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{l.nama}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">

            {/* Status card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Status
              </p>
              {/* Current status badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.color} ${statusMeta.bg} ${statusMeta.border}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              {/* Status buttons */}
              <div className="grid grid-cols-2 gap-2">
                {STATUS_LIST.map((s) => {
                  const meta = STATUS_META[s];
                  const isActive = complaint.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={updating || isActive}
                      onClick={() => patchComplaint({ status: s })}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        isActive
                          ? `${meta.color} ${meta.bg} ${meta.border} cursor-default`
                          : "border-gray-200 text-slate-500 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              {updating && (
                <p className="text-xs text-slate-400 mt-2 text-center">Menyimpan...</p>
              )}
            </div>

            {/* Prioritas & Petugas card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              {/* Prioritas */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Prioritas
                </p>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${prioritasMeta.dot}`}
                  />
                  <select
                    value={complaint.prioritas}
                    disabled={updating}
                    onChange={(e) => patchComplaint({ prioritas: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    {PRIORITAS_LIST.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITAS_META[p].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Petugas */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Petugas
                </p>
                <select
                  value={complaint.petugasId ?? ""}
                  disabled={updating}
                  onChange={(e) => patchComplaint({ petugasId: e.target.value || null })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                >
                  <option value="">— Tidak ditugaskan —</option>
                  {pegawaiList.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      {pg.nama}
                    </option>
                  ))}
                </select>
                {complaint.petugas && (
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Ditugaskan ke: {complaint.petugas.nama}
                  </p>
                )}
              </div>
            </div>

            {/* Riwayat Aktivitas card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Riwayat Aktivitas
              </p>

              {log.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">
                  Belum ada aktivitas tercatat.
                </p>
              ) : (
                <ol className="relative space-y-0">
                  {log.map((entry, idx) => {
                    const meta = AKSI_META[entry.aksi] ?? { label: entry.aksi, icon: "•" };
                    const isLast = idx === log.length - 1;
                    return (
                      <li key={entry.id} className="flex gap-3">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ background: "#009CC5" }}
                          >
                            <AksiIcon aksi={entry.aksi} />
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 bg-gray-200 my-1" />
                          )}
                        </div>

                        {/* Entry content */}
                        <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-4"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700 leading-snug">
                              {meta.label}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                              {formatRelativeTime(entry.createdAt)}
                            </span>
                          </div>
                          {entry.deskripsi && (
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {entry.deskripsi}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-0.5">oleh {entry.oleh}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="mt-2 text-center text-xs text-white/60 truncate">{lightbox.alt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
