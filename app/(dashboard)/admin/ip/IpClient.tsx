"use client";

import { useEffect, useRef, useState } from "react";
import {
  RefreshCw, ShieldCheck, ShieldOff, Globe,
  CheckCircle, AlertTriangle, Loader2, Mail, MessageSquare,
  X, AlertCircle, Fingerprint, Activity, Plus, Trash2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface IpEntry {
  ip: string;
  count: number;
  layananCount: number;
  blocked: boolean;
  blockedAt: string | null;
  reason: string | null;
  hasMessage: boolean;
  message: string | null;
  messageAt: string | null;
  messageEmail: string | null;
}

interface FpEntry {
  id: string;
  fingerprintHash: string;
  reason: string;
  blockedAt: string;
  note: string | null;
}

interface FeedEntry {
  id: string;
  responStatus: string;
  weight: number;
  similarityScore: number | null;
  fingerprintHash: string | null;
  fingerprintFull: string | null;
  layananNama: string;
  createdAt: string;
}

// ── Client-safe constants ────────────────────────────────────────────────────
const RESP_STATUS_LABELS: Record<string, string> = {
  normal:      "Valid",
  suspicious:  "Mencurigakan",
  low_quality: "Kualitas Rendah",
  spam:        "Spam",
};
const RESP_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  normal:      { bg: "#dcfce7", text: "#14532d" },
  suspicious:  { bg: "#fef3c7", text: "#92400e" },
  low_quality: { bg: "#fee2e2", text: "#7f1d1d" },
  spam:        { bg: "#f1f5f9", text: "#64748b" },
};

type TabId = "ip" | "fingerprint" | "feed";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "ip",          label: "Blokir IP",            icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "fingerprint", label: "Blacklist Fingerprint", icon: <Fingerprint className="w-3.5 h-3.5" /> },
  { id: "feed",        label: "Aktivitas Mencurigakan", icon: <Activity className="w-3.5 h-3.5" /> },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function IpStatusBadge({ blocked, suspicious }: { blocked: boolean; suspicious: boolean }) {
  if (blocked)    return <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full"><ShieldOff className="w-3 h-3" />Diblokir</span>;
  if (suspicious) return <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"><AlertTriangle className="w-3 h-3" />Mencurigakan</span>;
  return               <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full"><CheckCircle className="w-3 h-3" />Normal</span>;
}

function StatusPill({ status }: { status: string }) {
  const cfg = RESP_STATUS_COLORS[status] ?? { bg: "#f1f5f9", text: "#64748b" };
  return (
    <span style={{ background: cfg.bg, color: cfg.text }}
      className="px-2 py-0.5 rounded-full text-xs font-semibold">
      {RESP_STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IpLogsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("ip");

  // ── IP tab state ──────────────────────────────────────────────────────────
  const [entries, setEntries]             = useState<IpEntry[]>([]);
  const [loadingIp, setLoadingIp]         = useState(true);
  const [refreshingIp, setRefreshingIp]   = useState(false);
  const [actionIp, setActionIp]           = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [confirmIp, setConfirmIp]         = useState<string | null>(null);
  const [successIp, setSuccessIp]         = useState<string | null>(null);
  const [ipError, setIpError]             = useState<string | null>(null);

  // ── Fingerprint tab state ─────────────────────────────────────────────────
  const [fpList, setFpList]               = useState<FpEntry[]>([]);
  const [loadingFp, setLoadingFp]         = useState(false);
  const [fpLoaded, setFpLoaded]           = useState(false);
  const [fpError, setFpError]             = useState<string | null>(null);
  const [addOpen, setAddOpen]             = useState(false);
  const [addHash, setAddHash]             = useState("");
  const [addNote, setAddNote]             = useState("");
  const [addSaving, setAddSaving]         = useState(false);
  const [addError, setAddError]           = useState<string | null>(null);
  const [removingFp, setRemovingFp]       = useState<string | null>(null);

  // ── Feed tab state ────────────────────────────────────────────────────────
  const [feed, setFeed]                   = useState<FeedEntry[]>([]);
  const [loadingFeed, setLoadingFeed]     = useState(false);
  const [feedLoaded, setFeedLoaded]       = useState(false);
  const [feedError, setFeedError]         = useState<string | null>(null);
  const feedPollRef                       = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── IP data fetching ──────────────────────────────────────────────────────
  const fetchIpData = async (isRefresh = false) => {
    if (isRefresh) setRefreshingIp(true);
    else setLoadingIp(true);
    try {
      const res = await fetch("/api/admin/ip");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEntries(await res.json());
    } catch {
      setIpError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoadingIp(false);
      setRefreshingIp(false);
    }
  };

  useEffect(() => { fetchIpData(); }, []);

  // ── Fingerprint data fetching ─────────────────────────────────────────────
  const fetchFpData = async () => {
    setLoadingFp(true);
    setFpError(null);
    try {
      const res = await fetch("/api/admin/fingerprint");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFpList(await res.json());
      setFpLoaded(true);
    } catch {
      setFpError("Gagal memuat daftar fingerprint. Silakan coba lagi.");
    } finally {
      setLoadingFp(false);
    }
  };

  // ── Feed data fetching ────────────────────────────────────────────────────
  const fetchFeed = async () => {
    setFeedError(null);
    try {
      const res = await fetch("/api/admin/security/feed");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFeed(await res.json());
      setFeedLoaded(true);
    } catch {
      setFeedError("Gagal memuat feed aktivitas. Silakan coba lagi.");
    } finally {
      setLoadingFeed(false);
    }
  };

  // Lazy-load tab data on first visit; feed also starts polling
  useEffect(() => {
    if (activeTab === "fingerprint" && !fpLoaded) {
      fetchFpData();
    }
    if (activeTab === "feed") {
      if (!feedLoaded) {
        setLoadingFeed(true);
        fetchFeed();
      }
      // Start 30s polling
      feedPollRef.current = setInterval(fetchFeed, 30_000);
      return () => {
        if (feedPollRef.current) clearInterval(feedPollRef.current);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── IP block handlers ─────────────────────────────────────────────────────
  const handleBlockClick = (ip: string) => setConfirmIp(ip);

  const handleToggle = async (ip: string, blocked: boolean) => {
    setConfirmIp(null);
    setActionIp(ip);
    setIpError(null);
    try {
      const res = await fetch("/api/admin/ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, action: blocked ? "unblock" : "block" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchIpData();
      setSuccessIp(ip);
      setTimeout(() => setSuccessIp(null), 2500);
    } catch {
      setIpError(`Gagal ${blocked ? "membuka blokir" : "memblokir"} IP ${ip}. Silakan coba lagi.`);
    } finally {
      setActionIp(null);
    }
  };

  // ── Fingerprint handlers ──────────────────────────────────────────────────
  const handleAddFingerprint = async () => {
    setAddError(null);
    if (addHash.trim().length !== 64) {
      setAddError("Hash harus tepat 64 karakter hex.");
      return;
    }
    setAddSaving(true);
    try {
      const res = await fetch("/api/admin/fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprintHash: addHash.trim(), note: addNote.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setAddHash("");
      setAddNote("");
      setAddOpen(false);
      await fetchFpData();
    } catch (err: any) {
      setAddError(err.message ?? "Gagal menambahkan fingerprint.");
    } finally {
      setAddSaving(false);
    }
  };

  const handleRemoveFingerprint = async (hash: string) => {
    setRemovingFp(hash);
    setFpError(null);
    try {
      const res = await fetch("/api/admin/fingerprint", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprintHash: hash }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchFpData();
    } catch {
      setFpError("Gagal menghapus fingerprint dari blacklist.");
    } finally {
      setRemovingFp(null);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const blockedIps    = entries.filter(e => e.blocked);
  const withMessages  = entries.filter(e => e.hasMessage && e.blocked);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans bg-gray-50/50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Keamanan &amp; Monitoring</h1>
          <p className="text-xs text-slate-500">Kelola blokir IP, fingerprint, dan aktivitas mencurigakan</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === "ip")          fetchIpData(true);
            else if (activeTab === "fingerprint") fetchFpData();
            else                             fetchFeed();
          }}
          disabled={refreshingIp || loadingFp || loadingFeed}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${(refreshingIp || loadingFp || loadingFeed) ? "animate-spin" : ""}`} />
          Segarkan
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="bg-white border-b border-gray-100 px-6">
        <nav className="flex gap-0" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}>
              {tab.icon}
              {tab.label}
              {tab.id === "ip" && blockedIps.length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  {blockedIps.length}
                </span>
              )}
              {tab.id === "fingerprint" && fpList.length > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  {fpList.length}
                </span>
              )}
              {tab.id === "feed" && feed.length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  {feed.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1 — IP BLOCKS
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "ip" && (
          <>
            {ipError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700 flex-1">{ipError}</p>
                <button onClick={() => setIpError(null)} aria-label="Tutup pesan error">
                  <X className="w-4 h-4 text-red-400 hover:text-red-600" />
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total IP Unik",           value: entries.length,       color: "#3b82f6", icon: <Globe className="w-5 h-5" /> },
                { label: "IP Diblokir",              value: blockedIps.length,    color: "#dc2626", icon: <ShieldOff className="w-5 h-5" /> },
                { label: "Permintaan Buka Blokir",   value: withMessages.length,  color: "#d97706", icon: <MessageSquare className="w-5 h-5" /> },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
                    <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10", color: s.color }}>
                    {s.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Unblock requests */}
            {withMessages.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-amber-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-700">
                    Permintaan Buka Blokir ({withMessages.length})
                  </p>
                </div>
                <div className="divide-y divide-amber-50">
                  {withMessages.map(e => (
                    <div key={e.ip} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-mono font-semibold text-slate-900">{e.ip}</p>
                            {e.messageEmail && (
                              <a href={`mailto:${e.messageEmail}`}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                <Mail className="w-3 h-3" />{e.messageEmail}
                              </a>
                            )}
                            {e.messageAt && (
                              <span className="text-xs text-slate-400">
                                {new Date(e.messageAt).toLocaleDateString("id-ID")}
                              </span>
                            )}
                          </div>
                          <div
                            className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-sm text-slate-700 cursor-pointer"
                            onClick={() => setExpandedMessage(expandedMessage === e.ip ? null : e.ip)}>
                            {expandedMessage === e.ip
                              ? e.message
                              : (e.message?.length ?? 0) > 80
                                ? `${e.message?.slice(0, 80)}… (klik untuk lihat)`
                                : e.message
                            }
                          </div>
                        </div>
                        <button onClick={() => handleToggle(e.ip, true)} disabled={actionIp === e.ip}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all shrink-0">
                          {actionIp === e.ip
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><ShieldCheck className="w-3 h-3" />Buka Blokir</>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Protection rule info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">Aturan Proteksi</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Setiap IP hanya diizinkan mengisi <strong className="text-slate-700">1 survei per layanan per hari</strong> (WIB).
                  Percobaan duplikat dialihkan ke halaman blokir.
                  IP yang diblokir manual tidak bisa mengakses survei sama sekali.
                </p>
              </div>
            </div>

            {/* Block confirmation dialog */}
            {confirmIp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                      <ShieldOff className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Konfirmasi Blokir IP</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{confirmIp}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                    IP ini akan langsung diblokir dan tidak bisa mengakses survei. Tindakan ini bisa dibatalkan kapan saja.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmIp(null)}
                      className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                      Batal
                    </button>
                    <button onClick={() => handleToggle(confirmIp, false)}
                      className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all">
                      Ya, Blokir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main IP table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Semua Aktivitas IP</h3>
                <span className="text-xs text-slate-400">{entries.length} IP terdaftar</span>
              </div>
              <div aria-live="polite" aria-atomic="false">
                {loadingIp ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <p className="text-sm text-slate-400">Memuat...</p>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <Globe className="w-8 h-8 text-slate-200" />
                    <p className="text-sm text-slate-400">Belum ada aktivitas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          {["IP Address", "Survei Berhasil", "Layanan Diisi", "Status", "Aksi"].map(h => (
                            <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {entries.map((e) => {
                          const suspicious = !e.blocked && e.layananCount > 5;
                          const isSuccess  = successIp === e.ip;
                          return (
                            <tr key={e.ip} className={`hover:bg-gray-50/80 transition-colors ${isSuccess ? "bg-green-50/60" : ""}`}>
                              <td className="px-5 py-3">
                                <p className="font-mono text-sm font-medium text-slate-900">{e.ip}</p>
                                {e.hasMessage && <p className="text-xs text-amber-500 font-medium mt-0.5">Ada permintaan buka blokir</p>}
                                {isSuccess && <p className="text-xs text-green-600 font-semibold mt-0.5">✓ Berhasil diperbarui</p>}
                              </td>
                              <td className="px-5 py-3">
                                <span className="px-2.5 py-0.5 bg-green-50 text-green-700 font-semibold text-xs rounded-full">{e.count}x</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full">{e.layananCount} layanan</span>
                              </td>
                              <td className="px-5 py-3">
                                <IpStatusBadge blocked={e.blocked} suspicious={suspicious} />
                              </td>
                              <td className="px-5 py-3">
                                <button
                                  onClick={() => e.blocked ? handleToggle(e.ip, true) : handleBlockClick(e.ip)}
                                  disabled={actionIp === e.ip}
                                  aria-label={e.blocked ? `Buka blokir IP ${e.ip}` : `Blokir IP ${e.ip}`}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all disabled:opacity-50 ${
                                    e.blocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                  }`}>
                                  {actionIp === e.ip
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : e.blocked
                                      ? <><ShieldCheck className="w-3 h-3" />Buka Blokir</>
                                      : <><ShieldOff className="w-3 h-3" />Blokir</>
                                  }
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2 — FINGERPRINT BLACKLIST
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "fingerprint" && (
          <>
            {fpError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700 flex-1">{fpError}</p>
                <button onClick={() => setFpError(null)} aria-label="Tutup pesan error">
                  <X className="w-4 h-4 text-red-400 hover:text-red-600" />
                </button>
              </div>
            )}

            {/* Stats + action */}
            <div className="flex items-center justify-between gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between flex-1 max-w-xs">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Fingerprint Diblokir</p>
                  <p className="text-3xl font-bold text-slate-900">{fpList.length}</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <button
                onClick={() => { setAddOpen(o => !o); setAddError(null); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-900 transition-all">
                <Plus className="w-4 h-4" />
                Tambah ke Blacklist
              </button>
            </div>

            {/* Add form */}
            {addOpen && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                <p className="text-sm font-semibold text-slate-900">Tambah Fingerprint ke Blacklist</p>
                {addError && (
                  <p className="text-xs text-red-600 font-medium">{addError}</p>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Hash Fingerprint <span className="text-slate-400">(64 karakter hex SHA-256)</span>
                    </label>
                    <input
                      type="text"
                      value={addHash}
                      onChange={e => setAddHash(e.target.value)}
                      maxLength={64}
                      placeholder="e.g. a3f1b2c4d5e6…"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">{addHash.length}/64 karakter</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Catatan <span className="text-slate-400">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={addNote}
                      onChange={e => setAddNote(e.target.value)}
                      placeholder="Alasan pemblokiran…"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setAddOpen(false); setAddHash(""); setAddNote(""); setAddError(null); }}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                    Batal
                  </button>
                  <button
                    onClick={handleAddFingerprint}
                    disabled={addSaving || addHash.trim().length !== 64}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition-all">
                    {addSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                    Blokir Fingerprint
                  </button>
                </div>
              </div>
            )}

            {/* Fingerprint list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-slate-900">Daftar Fingerprint Diblokir</h3>
              </div>
              {loadingFp ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-sm text-slate-400">Memuat...</p>
                </div>
              ) : fpList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Fingerprint className="w-8 h-8 text-slate-200" />
                  <p className="text-sm text-slate-400">Belum ada fingerprint yang diblokir</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {["Hash (disingkat)", "Alasan", "Tanggal Blokir", "Catatan", "Aksi"].map(h => (
                          <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {fpList.map(fp => (
                        <tr key={fp.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-3">
                            <span className="font-mono text-sm text-slate-700">
                              {fp.fingerprintHash.slice(0, 8)}…
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              fp.reason === "admin"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}>
                              {fp.reason === "admin" ? "Manual" : "Otomatis"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500">
                            {new Date(fp.blockedAt).toLocaleDateString("id-ID", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                            {fp.note ?? <span className="text-slate-300 italic">—</span>}
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => handleRemoveFingerprint(fp.fingerprintHash)}
                              disabled={removingFp === fp.fingerprintHash}
                              aria-label={`Hapus fingerprint ${fp.fingerprintHash.slice(0, 8)} dari blacklist`}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg transition-all">
                              {removingFp === fp.fingerprintHash
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <><Trash2 className="w-3 h-3" />Hapus</>
                              }
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4">
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                <Fingerprint className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">Tentang Fingerprint</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Fingerprint dihitung dari kombinasi <strong className="text-slate-700">IP + User-Agent</strong> menggunakan SHA-256.
                  Memblokir fingerprint mencegah perangkat yang sama mengisi survei meskipun menggunakan IP berbeda (misalnya VPN).
                  Fingerprint yang diblokir akan diarahkan ke halaman <code className="text-xs bg-slate-100 px-1 rounded">/blocked?reason=fingerprint</code>.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3 — SUSPICIOUS ACTIVITY FEED
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "feed" && (
          <>
            {feedError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700 flex-1">{feedError}</p>
                <button onClick={() => setFeedError(null)} aria-label="Tutup pesan error">
                  <X className="w-4 h-4 text-red-400 hover:text-red-600" />
                </button>
              </div>
            )}

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Flagged",
                  value: feed.length,
                  color: "#f59e0b",
                  icon: <AlertTriangle className="w-5 h-5" />,
                },
                {
                  label: "Spam",
                  value: feed.filter(f => f.responStatus === "spam").length,
                  color: "#64748b",
                  icon: <ShieldOff className="w-5 h-5" />,
                },
                {
                  label: "Mencurigakan",
                  value: feed.filter(f => f.responStatus === "suspicious").length,
                  color: "#d97706",
                  icon: <Activity className="w-5 h-5" />,
                },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
                    <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "15", color: s.color }}>
                    {s.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-poll notice */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Feed diperbarui otomatis setiap 30 detik
            </div>

            {/* Feed table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">50 Respons Mencurigakan Terbaru</h3>
                <span className="text-xs text-slate-400">{feed.length} entri</span>
              </div>
              {loadingFeed ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-sm text-slate-400">Memuat...</p>
                </div>
              ) : feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <CheckCircle className="w-8 h-8 text-green-200" />
                  <p className="text-sm text-slate-400">Tidak ada aktivitas mencurigakan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {["Waktu", "Layanan", "Status", "Kemiripan", "Bobot", "Fingerprint"].map(h => (
                          <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {feed.map(f => (
                        <tr key={f.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(f.createdAt).toLocaleString("id-ID", {
                              day: "2-digit", month: "short",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-700 max-w-[180px] truncate">
                            {f.layananNama}
                          </td>
                          <td className="px-5 py-3">
                            <StatusPill status={f.responStatus} />
                          </td>
                          <td className="px-5 py-3 text-xs font-mono text-slate-600">
                            {f.similarityScore !== null
                              ? `${(f.similarityScore * 100).toFixed(0)}%`
                              : <span className="text-slate-300">—</span>
                            }
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-mono font-semibold ${f.weight < 1 ? "text-amber-600" : "text-slate-500"}`}>
                              ×{f.weight.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {f.fingerprintHash
                              ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-slate-600">{f.fingerprintHash}</span>
                                  {f.fingerprintFull && (
                                    <button
                                      onClick={() => {
                                        if (f.fingerprintFull) {
                                          setActiveTab("fingerprint");
                                          // Pre-fill the add form
                                          setAddHash(f.fingerprintFull);
                                          setAddOpen(true);
                                        }
                                      }}
                                      title="Tambahkan ke blacklist fingerprint"
                                      className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                      <ShieldOff className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )
                              : <span className="text-slate-300 text-xs">—</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
