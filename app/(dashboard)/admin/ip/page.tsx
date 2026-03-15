"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw, ShieldCheck, ShieldOff, ShieldAlert,
  Globe, CheckCircle, AlertTriangle, Loader2, Bell, Search,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface IpEntry {
  ip: string;
  count: number;
  layananCount: number;
  firstSeen: number;
  lastSeen: number;
  blocked: boolean;
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 60_000)     return "baru saja";
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)} mnt lalu`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} jam lalu`;
  return `${Math.floor(diff / 86_400_000)} hr lalu`;
}

function StatusBadge({ blocked, suspicious }: { blocked: boolean; suspicious: boolean }) {
  if (blocked)    return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest"><ShieldOff className="w-3 h-3" />Blocked</span>;
  if (suspicious) return <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest"><AlertTriangle className="w-3 h-3" />Mencurigakan</span>;
  return               <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest"><CheckCircle className="w-3 h-3" />Normal</span>;
}

export default function IpLogsPage() {
  const [entries, setEntries]   = useState<IpEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionIp, setActionIp] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const blocked          = entries.filter(e => e.blocked);
  const totalSubmissions = entries.reduce((s, e) => s + e.count, 0);

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* GLOBAL HEADER */}
      <div className="animate-fade-down bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#FAE705]" />
          <div className="animate-slide-left">
            <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "IP Spam Block" }]} />
            <h1 className="text-base lg:text-lg font-black uppercase tracking-tight text-[#132B4F] leading-none mt-0.5">IP Spam Monitor</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 animate-slide-right">
          <div className="hidden md:flex items-center gap-2 bg-[#F0F4F8] border border-gray-200 px-3 py-1.5 w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-400 font-medium">Search Global...</span>
          </div>
          <button aria-label="Notifikasi" className="w-8 h-8 flex items-center justify-center bg-[#F0F4F8] border border-gray-200 hover:bg-white transition-colors">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button aria-label="Refresh data" onClick={() => fetchData(true)} disabled={refreshing}
            className="btn-shimmer flex items-center gap-2 px-3 py-1.5 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { accent: "#009CC5", label: "Total IP Unik",                val: entries.length,     valColor: "#132B4F", icon: <Globe className="w-4 h-4" />,        delay: "delay-75"  },
            { accent: "#16a34a", label: "Total Pengiriman Berhasil",    val: totalSubmissions,   valColor: "#16a34a", icon: <CheckCircle className="w-4 h-4" />,   delay: "delay-150" },
            { accent: "#dc2626", label: "IP Diblokir Manual",           val: blocked.length,     valColor: "#dc2626", icon: <ShieldOff className="w-4 h-4" />,     delay: "delay-225" },
          ].map(card => (
            <div key={card.label} className={`animate-fade-up ${card.delay} bg-white border border-gray-200 overflow-hidden card-hover`}>
              <div className="h-1 animate-draw-line" style={{ backgroundColor: card.accent }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: card.accent }}>{card.label}</p>
                  <span style={{ color: card.accent }} className="opacity-40">{card.icon}</span>
                </div>
                <p className="text-4xl font-black animate-count-up" style={{ color: card.valColor }}>{card.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RULE INFO */}
        <div className="animate-fade-up delay-150 bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 bg-[#009CC5] animate-draw-line" />
          <div className="px-5 py-4 flex items-start gap-4">
            <div className="w-8 h-8 bg-[#FAE705]/20 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-[#132B4F]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F] mb-1">Aturan Proteksi Duplikat</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Setiap IP hanya diizinkan mengisi <strong className="text-[#132B4F]">1 survei per layanan per hari</strong> (zona waktu WIB).
                Percobaan kedua dialihkan ke halaman <em>"Survei Telah Diisi Sebelumnya"</em>.
                Admin dapat memblokir IP sepenuhnya menggunakan tombol Block di bawah.
              </p>
            </div>
          </div>
        </div>

        {/* BLOCKED IPs */}
        {blocked.length > 0 && (
          <div className="animate-fade-up bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-red-500 animate-draw-line" />
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
              <ShieldOff className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">IP Diblokir Manual ({blocked.length})</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#132B4F]">
                    {["IP Address", "Pengiriman", "Layanan Diisi", "Terakhir Aktif", "Aksi"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blocked.map((e, i) => (
                    <tr key={e.ip} className="bg-red-50/60 border-b border-red-100 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-5 py-3 font-mono font-bold text-red-700">{e.ip}</td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 font-black">{e.count}x</span></td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-black">{e.layananCount} layanan</span></td>
                      <td className="px-5 py-3 text-gray-500 font-medium">{timeAgo(e.lastSeen)}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggle(e.ip, true)} disabled={actionIp === e.ip}
                          className="btn-shimmer flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:scale-[1.03] transition-all duration-200 active:scale-[0.97] disabled:opacity-50">
                          {actionIp === e.ip ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ShieldCheck className="w-3 h-3" />Unblock</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MAIN TABLE */}
        <div className="animate-fade-up delay-225 bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 animate-draw-line" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-1 h-5 bg-[#009CC5]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Semua Aktivitas IP</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#009CC5] animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Globe className="w-8 h-8 text-gray-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#132B4F]">
                    {["IP Address", "Pengiriman Berhasil", "Layanan Diisi (DB)", "Pertama", "Terakhir", "Status", "Aksi"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((e, i) => {
                    const suspicious = !e.blocked && e.layananCount > 5;
                    return (
                      <tr key={e.ip} className={`transition-colors hover:bg-[#F0F4F8]/50 animate-fade-up ${i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"}`} style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}>
                        <td className="px-5 py-3 font-mono font-bold text-[#132B4F]">{e.ip}</td>
                        <td className="px-5 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 font-black">{e.count}x</span></td>
                        <td className="px-5 py-3"><span className="px-2 py-0.5 bg-[#009CC5]/10 text-[#009CC5] font-black">{e.layananCount} layanan</span></td>
                        <td className="px-5 py-3 text-gray-400 font-medium">{timeAgo(e.firstSeen)}</td>
                        <td className="px-5 py-3 text-gray-400 font-medium">{timeAgo(e.lastSeen)}</td>
                        <td className="px-5 py-3"><StatusBadge blocked={e.blocked} suspicious={suspicious} /></td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleToggle(e.ip, e.blocked)} disabled={actionIp === e.ip}
                            className={`btn-shimmer flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 ${
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