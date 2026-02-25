"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface Layanan {
  id: string;
  nama: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isLayananOpen, setIsLayananOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<Layanan[]>([]);
  const [filtered, setFiltered] = useState<Layanan[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => pathname.startsWith(path);

  useEffect(() => {
    if (!isLayananOpen) return;
    fetch("/api/layanan")
      .then((r) => r.json())
      .then((data) => { setServices(data); setFiltered(data); })
      .catch(() => {});
    setTimeout(() => searchRef.current?.focus(), 100);
  }, [isLayananOpen]);

  useEffect(() => {
    if (!query) { setFiltered(services); return; }
    setFiltered(services.filter((s) => s.nama.toLowerCase().includes(query.toLowerCase())));
  }, [query, services]);

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 overflow-y-auto z-50 flex flex-col" style={{ backgroundColor: "#132B4F" }}>

      {/* TOP ACCENT STRIPE */}
      <div className="h-1 w-full shrink-0" style={{ background: "linear-gradient(to right, #FAE705, #009CC5)" }} />

      {/* LOGO AREA */}
      <div className="px-6 py-5 shrink-0 border-b border-white/10">
        <img
          src="/logo-bkpsdm.png"
          alt="BKPSDM Anambas"
          className="h-12 w-auto object-contain mb-3 brightness-0 invert"
        />
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">Admin Portal</p>
        <p className="text-[8px] font-bold text-white/25 mt-0.5">Kab. Kepulauan Anambas</p>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-1 pb-10">

        {/* HOME */}
        <Link href="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
            pathname === "/admin"
              ? "text-[#132B4F] font-black shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
          style={pathname === "/admin" ? { backgroundColor: "#FAE705" } : {}}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>

        {/* LAYANAN SKM */}
        <div>
          <button
            onClick={() => setIsLayananOpen(!isLayananOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
              isActive("/admin/layanan")
                ? "text-white bg-white/15"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Layanan SKM
            </div>
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isLayananOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLayananOpen && (
            <div className="mt-1 ml-3 space-y-1.5 py-1">
              <Link href="/admin/layanan?action=add"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                style={{ backgroundColor: "#009CC5", color: "white" }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Layanan
              </Link>

              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input ref={searchRef} type="text" placeholder="Cari layanan..."
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-[10px] font-bold placeholder:text-white/25 focus:outline-none transition border border-white/10"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
                />
              </div>

              <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
                {filtered.length === 0 && (
                  <p className="text-[10px] text-white/30 font-bold px-3 py-2">Tidak ditemukan</p>
                )}
                {filtered.map((s) => (
                  <Link key={s.id} href={`/admin/layanan/${s.id}`}
                    className={`block px-3 py-2 rounded-lg text-[10px] font-bold transition-all truncate ${
                      pathname === `/admin/layanan/${s.id}`
                        ? "text-[#132B4F] font-black"
                        : "text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                    style={pathname === `/admin/layanan/${s.id}` ? { backgroundColor: "#009CC5", color: "white" } : {}}
                  >{s.nama}</Link>
                ))}
              </div>

              <Link href="/admin/layanan"
                className="block text-center text-[9px] font-black uppercase tracking-widest py-1 transition-colors"
                style={{ color: "#009CC5" }}
              >Lihat Semua →</Link>
            </div>
          )}
        </div>

        {/* PEGAWAI */}
        <Link href="/admin/pegawai"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
            isActive("/admin/pegawai")
              ? "text-[#132B4F] font-black shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
          style={isActive("/admin/pegawai") ? { backgroundColor: "#FAE705" } : {}}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Data Pegawai
        </Link>

        {/* SETTINGS */}
        <Link href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
            isActive("/admin/settings")
              ? "text-[#132B4F] font-black shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
          style={isActive("/admin/settings") ? { backgroundColor: "#FAE705" } : {}}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings & QR
        </Link>
      </nav>

      {/* BOTTOM TAG */}
      <div className="px-5 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#FAE705" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#009CC5" }} />
          <p className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">SKM System v1.0</p>
        </div>
      </div>
    </aside>
  );
}