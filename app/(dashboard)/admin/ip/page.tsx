"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw, ShieldCheck, ShieldOff, Globe,
  CheckCircle, AlertTriangle, Loader2, Mail, MessageSquare,
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
  if (blocked)    return <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full"><ShieldOff className="w-3 h-3" />Blocked</span>;
  if (suspicious) return <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full"><AlertTriangle className="w-3 h-3" />Mencurigakan</span>;
  return               <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full"><CheckCircle className="w-3 h-3" />Normal</span>;
}

export default function IpLogsPage() {
  const [entries, setEntries]       = useState<IpEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionIp, setActionIp]     = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/admin/ip");
      if (res.ok) setEntries(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (ip: string, blocked: boolean) => {
    setActionIp(ip);
    await fetch("/api/admin/ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, action: blocked ? "unblock" : "block" }),
    });
    await fetchData();
    setActionIp(null);
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
          Refresh
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total IP Unik",      value: entries.length, color: "#3b82f6", icon: <Globe className="w-5 h-5" /> },
            { label: "IP Diblokir",         value: blocked.length, color: "#dc2626", icon: <ShieldOff className="w-5 h-5" /> },
            { label: "Permintaan Unblock",  value: withMessages.length, color: "#d97706", icon: <MessageSquare className="w-5 h-5" /> },
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
                Permintaan Pembukaan Blokir ({withMessages.length})
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
                          : (e.message?.length ?? 0) > 80 ? `${e.message?.slice(0, 80)}... (klik untuk lihat)` : e.message
                        }
                      </div>
                    </div>
                    <button onClick={() => handleToggle(e.ip, true)} disabled={actionIp === e.ip}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all shrink-0">
                      {actionIp === e.ip ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ShieldCheck className="w-3 h-3" />Unblock</>}
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

        {/* Main IP table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Semua Aktivitas IP</h3>
            <span className="text-xs text-slate-400">{entries.length} IP terdaftar</span>
          </div>

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
                    return (
                      <tr key={e.ip} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-mono text-sm font-medium text-slate-900">{e.ip}</p>
                          {e.hasMessage && <p className="text-xs text-amber-500 font-medium mt-0.5">Ada permintaan unblock</p>}
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
                          <button onClick={() => handleToggle(e.ip, e.blocked)} disabled={actionIp === e.ip}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all disabled:opacity-50 ${
                              e.blocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                            }`}>
                            {actionIp === e.ip
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : e.blocked
                                ? <><ShieldCheck className="w-3 h-3" />Unblock</>
                                : <><ShieldOff className="w-3 h-3" />Block</>
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
  );
}
