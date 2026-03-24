"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw, ShieldCheck, ShieldOff, Globe,
  CheckCircle, AlertTriangle, Loader2, Mail, MessageSquare,
  X, AlertCircle,
} from "lucide-react";

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

function IpStatusBadge({ blocked, suspicious }: { blocked: boolean; suspicious: boolean }) {
  if (blocked)    return <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full"><ShieldOff className="w-3 h-3" />Diblokir</span>;
  if (suspicious) return <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"><AlertTriangle className="w-3 h-3" />Mencurigakan</span>;
  return               <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full"><CheckCircle className="w-3 h-3" />Normal</span>;
}

export default function IpLogsPage() {
  const [entries, setEntries]             = useState<IpEntry[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [actionIp, setActionIp]           = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [confirmIp, setConfirmIp]         = useState<string | null>(null); // S3 — pending block confirmation
  const [successIp, setSuccessIp]         = useState<string | null>(null); // M1 — post-toggle success
  const [error, setError]                 = useState<string | null>(null); // C1 — API error

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/admin/ip");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEntries(await res.json());
    } catch (err) {
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // S3 — "Block" shows confirmation first; "Unblock" (less destructive) runs directly
  const handleBlockClick = (ip: string) => {
    setConfirmIp(ip);
  };

  const handleToggle = async (ip: string, blocked: boolean) => {
    setConfirmIp(null);
    setActionIp(ip);
    setError(null);
    try {
      const res = await fetch("/api/admin/ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, action: blocked ? "unblock" : "block" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchData();
      setSuccessIp(ip); // M1 — brief success signal
      setTimeout(() => setSuccessIp(null), 2500);
    } catch {
      setError(`Gagal ${blocked ? "membuka blokir" : "memblokir"} IP ${ip}. Silakan coba lagi.`);
    } finally {
      setActionIp(null);
    }
  };

  const blocked        = entries.filter(e => e.blocked);
  const withMessages   = entries.filter(e => e.hasMessage && e.blocked);

  return (
    <div className="min-h-screen font-sans bg-gray-50/50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">IP Spam Monitor</h1>
          <p className="text-xs text-slate-500">Kelola aktivitas IP dan blokir</p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Segarkan
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* C1 — API error banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} aria-label="Tutup pesan error">
              <X className="w-4 h-4 text-red-400 hover:text-red-600" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total IP Unik",      value: entries.length, color: "#3b82f6", icon: <Globe className="w-5 h-5" /> },
            { label: "IP Diblokir",         value: blocked.length, color: "#dc2626", icon: <ShieldOff className="w-5 h-5" /> },
            { label: "Permintaan Buka Blokir", value: withMessages.length, color: "#d97706", icon: <MessageSquare className="w-5 h-5" /> },
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
                        onClick={() => setExpandedMessage(expandedMessage === e.ip ? null : e.ip)}
                      >
                        {expandedMessage === e.ip
                          ? e.message
                          : (e.message?.length ?? 0) > 80 ? `${e.message?.slice(0, 80)}… (klik untuk lihat)` : e.message
                        }
                      </div>
                    </div>
                    <button onClick={() => handleToggle(e.ip, true)} disabled={actionIp === e.ip}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all shrink-0">
                      {actionIp === e.ip ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ShieldCheck className="w-3 h-3" />Buka Blokir</>}
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

        {/* S3 — Block confirmation dialog */}
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
                <button
                  onClick={() => setConfirmIp(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                  Batal
                </button>
                <button
                  onClick={() => handleToggle(confirmIp, false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all">
                  Ya, Blokir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main IP table — S5: aria-live */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Semua Aktivitas IP</h3>
            <span className="text-xs text-slate-400">{entries.length} IP terdaftar</span>
          </div>

          <div aria-live="polite" aria-atomic="false">
            {loading ? (
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
                      const isSuccess  = successIp === e.ip; // M1
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
      </div>
    </div>
  );
}
