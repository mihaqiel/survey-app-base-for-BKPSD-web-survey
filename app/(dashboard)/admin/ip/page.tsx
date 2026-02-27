"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  if (diff < 60_000) return "baru saja";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} mnt lalu`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} jam lalu`;
  return `${Math.floor(diff / 86_400_000)} hr lalu`;
}

export default function IpLogsPage() {
  const [entries, setEntries] = useState<IpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionIp, setActionIp] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ip");
      if (res.ok) setEntries(await res.json());
    } finally {
      setLoading(false);
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

  const blocked = entries.filter(e => e.blocked);
  const totalSubmissions = entries.reduce((s, e) => s + e.count, 0);

  return (
    <div className="min-h-screen font-sans bg-[#F0F4F8]">

      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-7 bg-[#FAE705]" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#009CC5]">Admin · Keamanan</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#132B4F] leading-none">IP Spam Monitor</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin"
            className="px-4 py-2 bg-white border border-gray-200 text-[#132B4F] text-[10px] font-black uppercase tracking-widest hover:bg-[#F0F4F8] transition-colors">
            ← Dashboard
          </Link>
          <button onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#132B4F] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { accent: "#009CC5", label: "Total IP Unik", val: entries.length, valColor: "#132B4F" },
            { accent: "#16a34a", label: "Total Pengiriman Berhasil", val: totalSubmissions, valColor: "#16a34a" },
            { accent: "#dc2626", label: "IP Diblokir Manual", val: blocked.length, valColor: "#dc2626" },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-gray-200 overflow-hidden">
              <div className="h-1" style={{ backgroundColor: card.accent }} />
              <div className="p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: card.accent }}>
                  {card.label}
                </p>
                <p className="text-4xl font-black" style={{ color: card.valColor }}>{card.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RULE INFO */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5 bg-[#009CC5]" />
          <div className="px-5 py-4 flex items-start gap-4">
            <div className="w-8 h-8 bg-[#FAE705]/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#132B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="h-0.5 bg-red-500" />
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
                  {blocked.map(e => (
                    <tr key={e.ip} className="bg-red-50/60 border-b border-red-100">
                      <td className="px-5 py-3 font-mono font-bold text-red-700">{e.ip}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 font-black">{e.count}x</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-black">{e.layananCount} layanan</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-medium">{timeAgo(e.lastSeen)}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggle(e.ip, true)} disabled={actionIp === e.ip}
                          className="px-3 py-1.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors disabled:opacity-50">
                          {actionIp === e.ip ? "..." : "Unblock"}
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
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-0.5" style={{ background: "linear-gradient(to right, #132B4F, #009CC5, #FAE705)" }} />
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-1 h-5 bg-[#009CC5]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#132B4F]">Semua Aktivitas IP</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#009CC5]/20 border-t-[#009CC5] rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
                      <tr key={e.ip} className={i % 2 === 0 ? "bg-white" : "bg-[#F0F4F8]/50"}>
                        <td className="px-5 py-3 font-mono font-bold text-[#132B4F]">{e.ip}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 font-black">{e.count}x</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-[#009CC5]/10 text-[#009CC5] font-black">{e.layananCount} layanan</span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 font-medium">{timeAgo(e.firstSeen)}</td>
                        <td className="px-5 py-3 text-gray-400 font-medium">{timeAgo(e.lastSeen)}</td>
                        <td className="px-5 py-3">
                          {e.blocked ? (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest">Blocked</span>
                          ) : suspicious ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest">⚠ Mencurigakan</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest">Normal</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleToggle(e.ip, e.blocked)} disabled={actionIp === e.ip}
                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 text-white
                              ${e.blocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
                            {actionIp === e.ip ? "..." : e.blocked ? "Unblock" : "Block"}
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


