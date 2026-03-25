/**
 * Shared constants and utilities for the Pengaduan (complaint) system.
 * Used by both the admin dashboard and public form.
 */

export const STATUS_LIST = [
  "BARU",
  "PENDING_VERIFIKASI",
  "DIPROSES",
  "PERLU_DATA",
  "SELESAI",
  "DITOLAK",
] as const;

export type StatusPengaduan = (typeof STATUS_LIST)[number];

export const STATUS_META: Record<
  StatusPengaduan,
  { label: string; color: string; bg: string; border: string }
> = {
  BARU:               { label: "Baru",        color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  PENDING_VERIFIKASI: { label: "Verifikasi",   color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  DIPROSES:           { label: "Diproses",     color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
  PERLU_DATA:         { label: "Perlu Data",   color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  SELESAI:            { label: "Selesai",      color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  DITOLAK:            { label: "Ditolak",      color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
};

export const PRIORITAS_LIST = ["RENDAH", "NORMAL", "TINGGI", "MENDESAK"] as const;
export type PrioratasPengaduan = (typeof PRIORITAS_LIST)[number];

export const PRIORITAS_META: Record<
  PrioratasPengaduan,
  { label: string; color: string; dot: string; border: string; slaDays: number }
> = {
  RENDAH:   { label: "Rendah",   color: "text-slate-500",  dot: "bg-slate-400",  border: "border-l-slate-300", slaDays: 7     },
  NORMAL:   { label: "Normal",   color: "text-blue-600",   dot: "bg-blue-500",   border: "border-l-blue-400",  slaDays: 3     },
  TINGGI:   { label: "Tinggi",   color: "text-amber-600",  dot: "bg-amber-500",  border: "border-l-amber-400", slaDays: 1     },
  MENDESAK: { label: "Mendesak", color: "text-red-600",    dot: "bg-red-500",    border: "border-l-red-500",   slaDays: 0.167 }, // 4 hours
};

export const KATEGORI_LIST = [
  "Layanan",
  "Kepegawaian",
  "Infrastruktur",
  "Fasilitas",
  "Lainnya",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sequential ticket number: PGD-2026-00023 */
export function formatTicket(nomorUrut: number, createdAt: Date | string): string {
  const year = new Date(createdAt).getFullYear();
  return `PGD-${year}-${String(nomorUrut).padStart(5, "0")}`;
}

/** Compute SLA deadline from createdAt + prioritas */
export function getSlaDeadline(createdAt: Date | string, prioritas: string): Date {
  const slaDays =
    PRIORITAS_META[prioritas as PrioratasPengaduan]?.slaDays ?? 3;
  return new Date(new Date(createdAt).getTime() + slaDays * 24 * 60 * 60 * 1000);
}

/** "ok" | "warning" | "overdue" — warning = <25% time remaining */
export function getSlaStatus(
  createdAt: Date | string,
  prioritas: string,
  status: string,
): "ok" | "warning" | "overdue" {
  if (status === "SELESAI" || status === "DITOLAK") return "ok";
  const slaDays =
    PRIORITAS_META[prioritas as PrioratasPengaduan]?.slaDays ?? 3;
  const deadline = getSlaDeadline(createdAt, prioritas);
  const now = new Date();
  const hoursLeft = (deadline.getTime() - now.getTime()) / 3_600_000;
  const totalHours = slaDays * 24;
  if (hoursLeft < 0) return "overdue";
  if (totalHours > 0 && hoursLeft / totalHours < 0.25) return "warning";
  return "ok";
}

/** Human-readable SLA remaining/overdue string */
export function formatSlaRemaining(
  createdAt: Date | string,
  prioritas: string,
  status: string,
): string {
  if (status === "SELESAI" || status === "DITOLAK") return "Selesai";
  const deadline = getSlaDeadline(createdAt, prioritas);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const absHours = Math.abs(diffMs) / 3_600_000;
  const overdue = diffMs < 0;

  if (absHours < 1) {
    const mins = Math.round(Math.abs(diffMs) / 60_000);
    return overdue ? `Terlambat ${mins}m` : `${mins}m lagi`;
  }
  if (absHours < 24) {
    const h = Math.floor(absHours);
    const m = Math.round((absHours - h) * 60);
    const str = m > 0 ? `${h}j ${m}m` : `${h}j`;
    return overdue ? `Terlambat ${str}` : `${str} lagi`;
  }
  const days = Math.floor(absHours / 24);
  return overdue ? `Terlambat ${days}h` : `${days}h lagi`;
}

/** Label + icon key for each aksi type in activity log */
export const AKSI_META: Record<string, { label: string; icon: string }> = {
  DIBUAT:             { label: "Pengaduan diterima",  icon: "📋" },
  STATUS_BERUBAH:     { label: "Status diperbarui",   icon: "🔄" },
  PRIORITAS_BERUBAH:  { label: "Prioritas diperbarui",icon: "⚡" },
  PETUGAS_DITUGASKAN: { label: "Petugas ditugaskan",  icon: "👤" },
  CATATAN:            { label: "Catatan",              icon: "📝" },
};
