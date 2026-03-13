"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { logout } from "@/app/action/auth";

interface Layanan {
  id: string;
  nama: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isLayananOpen, setIsLayananOpen]   = useState(false);
  const [isMobileOpen, setIsMobileOpen]     = useState(false);
  const [query, setQuery]                   = useState("");
  const [services, setServices]             = useState<Layanan[]>([]);
  const [filtered, setFiltered]             = useState<Layanan[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => pathname.startsWith(path);

  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

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

  const navItem = (
    href: string,
    label: string,
    exact: boolean,
    icon: React.ReactNode,
    danger?: boolean
  ) => {
    const active = exact ? pathname === href : isActive(href);
    return (
      <Link
        href={href}
        className={`nav-hover-fill relative flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
          active
            ? danger
              ? "bg-red-600 text-white"
              : "bg-[#FAE705] text-[#132B4F]"
            : danger
            ? "text-red-400/70 hover:text-red-300"
            : "text-white/50 hover:text-white"
        }`}
      >
        {/* Active indicator bar */}
        {active && (
          <span
            className={`absolute left-0 top-0 bottom-0 w-0.5 animate-fade-in ${
              danger ? "bg-white" : "bg-[#132B4F]"
            }`}
          />
        )}
        <span
          className={`relative shrink-0 transition-colors ${
            active
              ? danger ? "text-white" : "text-[#132B4F]"
              : danger ? "text-red-400/50" : "text-white/40"
          }`}
        >
          {icon}
        </span>
        <span className="relative">{label}</span>
        {active && (
          <div
            className={`relative ml-auto w-1 h-4 animate-fade-in ${
              danger ? "bg-white" : "bg-[#132B4F]"
            }`}
          />
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <aside className="w-64 h-full flex flex-col animate-slide-left" style={{ backgroundColor: "#0D1F38" }}>

      {/* TOP COLOR STRIPE */}
      <div
        className="h-1 shrink-0"
        style={{ background: "linear-gradient(to right, #FAE705 33%, #009CC5 33% 66%, #0D1F38 66%)" }}
      />

      {/* HEADER */}
      <div className="px-5 py-5 border-b border-white/10 shrink-0 flex items-start justify-between">
        <div>
          <img
            src="/logo-bkpsdm.png"
            alt="BKPSDM"
            className="h-10 w-auto object-contain brightness-0 invert mb-3 transition-transform duration-200 hover:scale-105"
          />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#FAE705] animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Admin Portal</p>
          </div>
          <p className="text-[8px] font-bold text-white/20 mt-0.5 pl-3.5">Kab. Kepulauan Anambas</p>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          title="Tutup Menu"
          aria-label="Tutup Menu"
          className="lg:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 mt-1 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* LOGGED IN USER INDICATOR */}
      <div className="px-5 py-3 border-b border-white/5 shrink-0 flex items-center gap-3">
        <div className="w-7 h-7 bg-[#FAE705]/20 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-[#FAE705]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Masuk sebagai</p>
          <p className="text-[10px] font-black text-white/60">Administrator</p>
        </div>
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" title="Online" />
      </div>

      {/* MENU LABEL */}
      <div className="px-5 pt-5 pb-2 shrink-0">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Menu Utama</p>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto pb-6">

        {navItem("/admin", "Dashboard", true,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )}

        {/* LAYANAN DROPDOWN — smooth accordion */}
        <div>
          <button
            onClick={() => setIsLayananOpen(!isLayananOpen)}
            className={`nav-hover-fill w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
              isActive("/admin/layanan")
                ? "text-white bg-white/10 border-l-2 border-[#FAE705]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4 shrink-0 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Layanan SKM
            <svg
              className={`w-3 h-3 ml-auto transition-transform duration-300 text-white/30 ${isLayananOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Animated accordion body */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: isLayananOpen ? "600px" : "0px", opacity: isLayananOpen ? 1 : 0 }}
          >
            <div className="bg-black/20 px-3 py-3 space-y-2">
              <Link
                href="/admin/layanan?action=add"
                className="btn-shimmer flex items-center gap-2 px-3 py-2.5 bg-[#009CC5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#007FA3] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Layanan
              </Link>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Cari layanan..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-glow w-full pl-8 pr-3 py-2 bg-white/10 border border-white/10 text-[10px] font-bold placeholder-white/25 text-white focus:outline-none transition-all duration-200"
                />
              </div>
              <div className="max-h-44 overflow-y-auto space-y-0.5">
                {filtered.length === 0 && (
                  <p className="text-[10px] text-white/30 font-bold px-3 py-2">Tidak ditemukan</p>
                )}
                {filtered.map((s) => {
                  const active = pathname === `/admin/layanan/${s.id}`;
                  return (
                    <Link
                      key={s.id}
                      href={`/admin/layanan/${s.id}`}
                      className={`block px-3 py-2 text-[10px] font-bold transition-all duration-150 truncate hover:scale-[1.01] ${
                        active ? "bg-[#009CC5] text-white" : "text-white/45 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {s.nama}
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/admin/layanan"
                className="block text-center text-[9px] font-black uppercase tracking-widest py-1.5 text-[#009CC5] hover:text-white transition-colors duration-200"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>
        </div>

        {navItem("/admin/pegawai", "Data Pegawai", false,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}

        <div className="mx-4 my-3 border-t border-white/10" />

        {navItem("/admin/ip", "IP Spam Block", false,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}

        {navItem("/admin/logs", "Audit Log", false,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}

        {navItem("/admin/settings", "Settings & QR", false,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}

        {/* DANGER ZONE */}
        <div className="mx-4 my-3 border-t border-red-900/40" />
        <div className="px-5 pb-2">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-red-900/60">Danger Zone</p>
        </div>

        {navItem("/admin/hapus-data", "Hapus Data Survei", false,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>,
          true
        )}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="px-4 pb-3 pt-1 shrink-0 border-t border-white/10">
        <form action={logout}>
          <button
            type="submit"
            className="btn-shimmer w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-red-600/80 transition-all duration-200 group"
          >
            <svg className="w-4 h-4 shrink-0 text-white/30 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar
          </button>
        </form>
      </div>

      {/* VERSION FOOTER */}
      <div className="px-5 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 bg-[#FAE705]" />
          <div className="w-1.5 h-1.5 bg-[#009CC5]" />
          <p className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-0.5">SKM System v1.0</p>
        </div>
        <p className="text-[8px] text-white/15 font-medium pl-5">Permenpan RB 14/2017</p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-50">
        {sidebarContent}
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-40 w-9 h-9 flex items-center justify-center bg-[#0D1F38] text-white hover:bg-[#132B4F] transition-colors duration-200 hover:scale-105"
        title="Buka Menu"
        aria-label="Buka Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay + drawer */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 h-screen z-50 w-64">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}