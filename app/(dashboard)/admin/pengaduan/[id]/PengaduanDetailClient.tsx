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
  Lock,
  Users,
} from "lucide-react";
import {
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
  visibility: string;
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
// Status modal configuration
// ---------------------------------------------------------------------------

type ModalConfig = {
  title: string;
  subtitle: string;
  label: string;
  required: boolean;
  placeholder: string;
  headerBg: string;
  confirmLabel: string;
  confirmBg: string;
  warningText?: string;
};

const STATUS_MODAL_CONFIG: Record<string, ModalConfig> = {
  PENDING_VERIFIKASI: {
    title: "Mulai Verifikasi",
    subtitle: "Tandai pengaduan ini sedang dalam tahap verifikasi.",
    label: "Catatan Verifikasi",
    required: false,
    placeholder: "Contoh: Pengaduan valid, akan ditindaklanjuti oleh tim terkait.",
    headerBg: "bg-slate-600",
    confirmLabel: "Mulai Verifikasi",
    confirmBg: "bg-slate-600 hover:bg-slate-700",
  },
  PERLU_DATA: {
    title: "Minta Data Tambahan",
    subtitle: "Informasikan data apa yang diperlukan dari pelapor.",
    label: "Data yang Dibutuhkan",
    required: false,
    placeholder: "Contoh: Mohon lampirkan surat keterangan RT/RW dan foto kondisi terkini.",
    headerBg: "bg-amber-600",
    confirmLabel: "Minta Data",
    confirmBg: "bg-amber-600 hover:bg-amber-700",
  },
  DIPROSES: {
    title: "Proses Pengaduan",
    subtitle: "Pesan ini akan dikirimkan ke pelapor melalui email.",
    label: "Pesan untuk Pelapor ★",
    required: true,
    placeholder: "Contoh: Pengaduan Anda sedang kami tindaklanjuti. Tim kami akan menghubungi Anda dalam 3 hari kerja.",
    headerBg: "bg-cyan-600",
    confirmLabel: "Proses Sekarang",
    confirmBg: "bg-cyan-600 hover:bg-cyan-700",
    warningText: "Pesan ini akan dikirim melalui email ke pelapor.",
  },
  SELESAI: {
    title: "Selesaikan Pengaduan",
    subtitle: "Ringkasan penyelesaian akan dikirimkan ke pelapor melalui email.",
    label: "Ringkasan Penyelesaian ★",
    required: true,
    placeholder: "Contoh: Pengaduan telah diselesaikan. Perbaikan jalan di Jl. Merdeka telah dilaksanakan pada 20 Maret 2026.",
    headerBg: "bg-green-600",
    confirmLabel: "Tandai Selesai",
    confirmBg: "bg-green-600 hover:bg-green-700",
    warningText: "Ringkasan ini akan dikirim melalui email ke pelapor.",
  },
  DITOLAK: {
    title: "Tolak Pengaduan",
    subtitle: "Alasan penolakan akan dikirimkan ke pelapor melalui email.",
    label: "Alasan Penolakan ★",
    required: true,
    placeholder: "Contoh: Pengaduan ini di luar kewenangan BKPSDM. Mohon sampaikan ke instansi terkait.",
    headerBg: "bg-red-600",
    confirmLabel: "Tolak Pengaduan",
    confirmBg: "bg-red-600 hover:bg-red-700",
    warningText: "Tindakan ini akan mengirimkan notifikasi email kepada pelapor.",
  },
};

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

  // Generic status-change modal (replaces ditolakModal)
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    targetStatus: string;
    reason: string;
  }>({ open: false, targetStatus: "", reason: "" });

  // Admin note state
  const [noteText, setNoteText] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<"internal" | "public">("internal");
  const [savingNote, setSavingNote] = useState(false);

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

  // Close status modal on Escape
  const modalOpen = statusModal.open;
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStatusModal({ open: false, targetStatus: "", reason: "" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const refreshLog = useCallback(async () => {
    const fresh = await fetch(`/api/pengaduan/${complaint.id}`);
    if (fresh.ok) {
      const freshData = await fresh.json();
      setLog(freshData.log);
    }
  }, [complaint.id]);

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
        await refreshLog();
      }
    } catch (err) {
      console.error("[PengaduanDetailClient] patch error:", err);
    } finally {
      setUpdating(false);
    }
  }, [complaint.id, refreshLog]);

  const saveNote = useCallback(async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: complaint.id,
          catatan: noteText.trim(),
          catatanVisibility: noteVisibility,
        }),
      });
      if (res.ok) {
        setNoteText("");
        await refreshLog();
      }
    } catch (err) {
      console.error("[PengaduanDetailClient] note error:", err);
    } finally {
      setSavingNote(false);
    }
  }, [complaint.id, noteText, noteVisibility, refreshLog]);

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

  // Current modal config
  const modalConfig = statusModal.targetStatus
    ? STATUS_MODAL_CONFIG[statusModal.targetStatus]
    : null;
  const canConfirm =
    !modalConfig?.required || statusModal.reason.trim().length > 0;

  // Reusable status button — used in both internal and public groups below
  const renderStatusButton = (s: string) => {
    const meta = STATUS_META[s as keyof typeof STATUS_META];
    const isActive = complaint.status === s;
    return (
      <button
        key={s}
        type="button"
        disabled={updating || isActive}
        onClick={() => setStatusModal({ open: true, targetStatus: s, reason: "" })}
        className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center ${
          isActive
            ? `${meta.color} ${meta.bg} ${meta.border} cursor-default`
            : "border-gray-200 text-slate-500 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        }`}
      >
        {meta.label}
      </button>
    );
  };

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
          <div className="w-full lg:w-80 shrink-0 space-y-4 lg:sticky lg:top-6 lg:self-start">

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
              {/* Internal workflow statuses — no email sent */}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                Alur Internal
              </p>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {["BARU", "PENDING_VERIFIKASI", "PERLU_DATA"].map(renderStatusButton)}
              </div>
              <div className="border-t border-slate-100 my-2" />
              {/* Public-facing statuses — triggers email to citizen */}
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-600">
                  Update ke Pelapor
                </p>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Mail className="w-3 h-3" /> Email otomatis
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {["DIPROSES", "SELESAI", "DITOLAK"].map(renderStatusButton)}
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

          </div>
        </div>

        {/* ── Bottom section: Riwayat Aktivitas (left) + Tambah Catatan (right) ── */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* Riwayat Aktivitas — full remaining width */}
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
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
                  const isPublic = entry.visibility === "public";
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-400">oleh {entry.oleh}</p>
                          {/* Visibility badge */}
                          {isPublic ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              <Users className="w-2.5 h-2.5" />
                              Publik
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              <Lock className="w-2.5 h-2.5" />
                              Internal
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Tambah Catatan — fixed sidebar width, stays anchored while log scrolls */}
          <div className="w-full lg:w-80 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tambah Catatan
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Tulis catatan internal atau pesan publik untuk pelapor…"
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none leading-relaxed"
            />
            {/* Visibility toggle */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setNoteVisibility("internal")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  noteVisibility === "internal"
                    ? "bg-slate-800 text-white border-slate-800"
                    : "border-gray-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Lock className="w-3 h-3" />
                Internal
              </button>
              <button
                type="button"
                onClick={() => setNoteVisibility("public")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  noteVisibility === "public"
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "border-gray-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Users className="w-3 h-3" />
                Publik
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {noteVisibility === "internal"
                ? "Hanya terlihat oleh admin, tidak ditampilkan ke pelapor."
                : "Akan ditampilkan di halaman lacak pengaduan pelapor."}
            </p>
            <button
              type="button"
              disabled={!noteText.trim() || savingNote}
              onClick={saveNote}
              className="mt-3 w-full px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {savingNote ? "Menyimpan…" : "Simpan Catatan"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Generic status-change modal ── */}
      {statusModal.open && modalConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setStatusModal({ open: false, targetStatus: "", reason: "" })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colored header */}
            <div className={`${modalConfig.headerBg} px-6 py-4 flex items-start justify-between gap-3`}>
              <div>
                <h2 className="text-base font-bold text-white">{modalConfig.title}</h2>
                <p className="text-xs text-white/80 mt-0.5">{modalConfig.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, targetStatus: "", reason: "" })}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  {modalConfig.label}
                  {!modalConfig.required && (
                    <span className="text-slate-400 normal-case tracking-normal font-normal ml-1">(opsional)</span>
                  )}
                </label>
                <textarea
                  value={statusModal.reason}
                  onChange={(e) =>
                    setStatusModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder={modalConfig.placeholder}
                  rows={4}
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none leading-relaxed"
                />
                {modalConfig.required && !statusModal.reason.trim() && (
                  <p className="text-[10px] text-red-500 mt-1">
                    ★ Pesan wajib diisi sebelum mengubah status ini.
                  </p>
                )}
              </div>

              {/* Warning note (only for email-triggering statuses) */}
              {modalConfig.warningText && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {modalConfig.warningText}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStatusModal({ open: false, targetStatus: "", reason: "" })}
                  className="flex-1 px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={updating || !canConfirm}
                  onClick={() => {
                    patchComplaint({
                      status: statusModal.targetStatus,
                      ...(statusModal.reason.trim()
                        ? { catatan: statusModal.reason.trim() }
                        : {}),
                    });
                    setStatusModal({ open: false, targetStatus: "", reason: "" });
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${modalConfig.confirmBg}`}
                >
                  {updating ? "Menyimpan…" : modalConfig.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
