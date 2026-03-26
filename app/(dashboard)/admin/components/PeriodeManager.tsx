"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Plus, Check, Power, PowerOff, Loader2, Copy, ExternalLink,
  Lock, Archive, FileDown, AlertCircle, X,
} from "lucide-react";

interface Periode {
  id: string;
  label: string;
  token: string;
  status: string;
  createdAt?: string;
}

interface Props {
  activePeriode: Periode | null;
  allPeriodes: Periode[];
}

function generateToken(label: string): string {
  const slug = label.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 20);
  const random = Math.random().toString(36).slice(2, 8);
  const year = new Date().getFullYear();
  return `skm-${slug}-${year}-${random}`;
}

// ── 4-state status pill ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  AKTIF:     { label: "Aktif",     bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  NONAKTIF:  { label: "Nonaktif",  bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400" },
  LOCKED:    { label: "Dikunci",   bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500" },
  ARCHIVED:  { label: "Diarsipkan",bg: "bg-slate-100",  text: "text-slate-500",  dot: "bg-slate-400" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NONAKTIF;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const inputClass = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-slate-900 placeholder-gray-300 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

// ── Main component ────────────────────────────────────────────────────────────

export default function PeriodeManager({ activePeriode, allPeriodes }: Props) {
  const [periodes, setPeriodes]       = useState<Periode[]>(allPeriodes);
  const [active, setActive]           = useState<Periode | null>(activePeriode);
  const [showForm, setShowForm]       = useState(false);
  const [label, setLabel]             = useState("");
  const [copied, setCopied]           = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();
  const [error, setError]             = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "lock" | "archive" } | null>(null);

  const [surveyBase, setSurveyBase] = useState("/enter?token=");
  useEffect(() => {
    setSurveyBase(`${window.location.origin}/enter?token=`);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = () => {
    if (!label.trim()) return;
    const token = generateToken(label);
    startTransition(async () => {
      const res = await fetch("/api/periode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), token }),
      });
      if (res.ok) window.location.reload();
    });
  };

  const handleToggle = (id: string, currentStatus: string) => {
    setError(null);
    startTransition(async () => {
      if (currentStatus === "AKTIF") {
        await fetch(`/api/periode/${id}/deactivate`, { method: "POST" });
      } else {
        await fetch(`/api/periode/${id}/activate`, { method: "POST" });
      }
      window.location.reload();
    });
  };

  const handleLock = async (id: string) => {
    setConfirmAction(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/periode/${id}/lock`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Gagal mengunci periode.");
        return;
      }
      window.location.reload();
    });
  };

  const handleArchive = async (id: string) => {
    setConfirmAction(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/periode/${id}/archive`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Gagal mengarsipkan periode.");
        return;
      }
      window.location.reload();
    });
  };

  const handleExportPdf = async (id: string, periodeLabel: string) => {
    setDownloading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/report/${id}/pdf`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan-IKM-${periodeLabel.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message ?? "Gagal mengunduh laporan PDF.");
    } finally {
      setDownloading(null);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 space-y-4">

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs font-medium text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} aria-label="Tutup">
            <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* Period list */}
      {periodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <p className="text-sm text-slate-400">Belum ada periode</p>
        </div>
      ) : (
        <div className="space-y-2">
          {periodes.map(p => {
            const isActive   = p.status === "AKTIF";
            const isNonaktif = p.status === "NONAKTIF";
            const isLocked   = p.status === "LOCKED";
            const isArchived = p.status === "ARCHIVED";
            const surveyUrl  = `${surveyBase}${p.token}`;

            return (
              <div key={p.id} className={`border rounded-lg overflow-hidden transition-all ${
                isActive   ? "border-blue-200 bg-blue-50" :
                isLocked   ? "border-amber-200 bg-amber-50/30" :
                isArchived ? "border-slate-200 bg-slate-50/50 opacity-75" :
                             "border-gray-200 bg-white"
              }`}>
                <div className="px-4 py-3">
                  {/* Top row — label + status + actions */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 truncate">{p.label}</p>
                        <StatusPill status={p.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-slate-400 truncate max-w-[160px]">{p.token}</p>
                        <button onClick={() => copyToClipboard(p.token, `token-${p.id}`)}
                          className="text-slate-300 hover:text-blue-600 transition-colors" title="Salin token">
                          {copied === `token-${p.id}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">

                      {/* Copy link — only for active */}
                      {isActive && (
                        <button onClick={() => copyToClipboard(surveyUrl, `link-${p.id}`)} title="Salin link survei"
                          className="flex items-center gap-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-slate-500 hover:bg-gray-50 transition-all">
                          {copied === `link-${p.id}` ? <Check className="w-3 h-3 text-green-500" /> : <ExternalLink className="w-3 h-3" />}
                          Link
                        </button>
                      )}

                      {/* Activate / Deactivate — only for AKTIF and NONAKTIF */}
                      {(isActive || isNonaktif) && (
                        <button onClick={() => handleToggle(p.id, p.status)} disabled={isPending}
                          className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold border rounded-lg transition-all disabled:opacity-40 ${
                            isActive
                              ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                              : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                          }`}>
                          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> :
                            isActive
                              ? <><PowerOff className="w-3 h-3" />Nonaktifkan</>
                              : <><Power className="w-3 h-3" />Aktifkan</>
                          }
                        </button>
                      )}

                      {/* Lock — only for NONAKTIF */}
                      {isNonaktif && (
                        <button
                          onClick={() => setConfirmAction({ id: p.id, action: "lock" })}
                          disabled={isPending}
                          title="Kunci periode — hentikan pengisian baru"
                          className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-all disabled:opacity-40">
                          <Lock className="w-3 h-3" />Kunci
                        </button>
                      )}

                      {/* Archive — only for LOCKED */}
                      {isLocked && (
                        <button
                          onClick={() => setConfirmAction({ id: p.id, action: "archive" })}
                          disabled={isPending}
                          title="Arsipkan periode"
                          className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-40">
                          <Archive className="w-3 h-3" />Arsipkan
                        </button>
                      )}

                      {/* Export PDF — for NONAKTIF, LOCKED, ARCHIVED */}
                      {!isActive && (
                        <button
                          onClick={() => handleExportPdf(p.id, p.label)}
                          disabled={downloading === p.id}
                          title="Unduh laporan IKM dalam format PDF"
                          className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-40">
                          {downloading === p.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <FileDown className="w-3 h-3" />
                          }
                          PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Survey URL bar — only for active */}
                  {isActive && (
                    <div className="mt-2 px-3 py-2 bg-slate-900 rounded-lg flex items-center gap-2">
                      <p className="text-xs font-mono text-white/50 truncate flex-1">{surveyUrl}</p>
                      <a href={surveyUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-400 hover:text-white transition-colors shrink-0">
                        Buka &rarr;
                      </a>
                    </div>
                  )}

                  {/* Locked info banner */}
                  {isLocked && (
                    <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Dikunci — tidak ada pengisian baru yang diterima. Gunakan PDF untuk ekspor laporan.
                    </p>
                  )}

                  {/* Archived info */}
                  {isArchived && (
                    <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      Diarsipkan — data tersimpan, tidak ditampilkan di dashboard utama.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new period */}
      {showForm ? (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <p className="text-xs font-semibold text-slate-500">Periode Baru</p>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Label Periode <span className="text-red-400">*</span>
            </label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)}
              title="Label Periode" placeholder="e.g. SKM Semester 1 2026" className={inputClass} />
            {label && (
              <p className="text-xs font-mono text-slate-400 mt-1.5">
                Token otomatis: <span className="text-blue-600">{generateToken(label)}</span>
              </p>
            )}
          </div>
          <p className="text-xs text-slate-400">Token akses akan dibuat otomatis oleh sistem.</p>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!label.trim() || isPending}
              className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Membuat...</> : <><Plus className="w-3.5 h-3.5" />Buat Periode</>}
            </button>
            <button onClick={() => { setShowForm(false); setLabel(""); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-slate-400 text-xs font-semibold hover:bg-white transition-all">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-slate-400 text-xs font-semibold hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
          <Plus className="w-3.5 h-3.5" />Tambah Periode Baru
        </button>
      )}

      {/* ── Confirmation modal — Lock / Archive ─── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmAction.action === "lock" ? "bg-amber-50" : "bg-slate-100"
              }`}>
                {confirmAction.action === "lock"
                  ? <Lock className="w-5 h-5 text-amber-500" />
                  : <Archive className="w-5 h-5 text-slate-500" />
                }
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {confirmAction.action === "lock" ? "Konfirmasi Kunci Periode" : "Konfirmasi Arsipkan Periode"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {periodes.find(p => p.id === confirmAction.id)?.label}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              {confirmAction.action === "lock"
                ? "Periode akan dikunci. Pengisian survei baru tidak akan diterima. Tindakan ini tidak bisa dibatalkan langsung — hubungi administrator untuk membuka kunci."
                : "Periode akan diarsipkan dan disembunyikan dari dashboard utama. Data tetap tersimpan dan bisa diekspor sebagai PDF."
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                Batal
              </button>
              <button
                onClick={() => confirmAction.action === "lock"
                  ? handleLock(confirmAction.id)
                  : handleArchive(confirmAction.id)
                }
                className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${
                  confirmAction.action === "lock"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-slate-600 hover:bg-slate-700"
                }`}>
                {confirmAction.action === "lock" ? "Ya, Kunci" : "Ya, Arsipkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
