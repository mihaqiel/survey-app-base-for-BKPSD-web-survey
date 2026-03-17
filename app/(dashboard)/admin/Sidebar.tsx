"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/action/auth";
import {
  LayoutDashboard,
  Layers,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  Trash2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItem = (
    href: string,
    label: string,
    exact: boolean,
    icon: React.ReactNode,
    danger?: boolean,
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
        {active && (
          <span
            className={`absolute left-0 top-0 bottom-0 w-0.5 animate-fade-in ${danger ? "bg-white" : "bg-[#132B4F]"}`}
          />
        )}
        <span
          className={`relative shrink-0 ${active ? (danger ? "text-white" : "text-[#132B4F]") : danger ? "text-red-400/50" : "text-white/40"}`}
        >
          {icon}
        </span>
        <span className="relative">{label}</span>
        {active && (
          <div
            className={`relative ml-auto w-1 h-4 ${danger ? "bg-white" : "bg-[#132B4F]"}`}
          />
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <aside
      className="w-64 h-full flex flex-col"
      style={{ backgroundColor: "#0D1F38" }}
    >
      <div
        className="h-1 shrink-0"
        style={{
          background:
            "linear-gradient(to right, #FAE705 33%, #009CC5 33% 66%, #0D1F38 66%)",
        }}
      />

      {/* HEADER */}
      <div className="px-5 py-5 border-b border-white/10 shrink-0 flex items-start justify-between">
        <div>
          <Image
            src="/logo-bkpsdm.png"
            alt="BKPSDM"
            width={100}
            height={40}
            className="h-10 w-auto object-contain brightness-0 invert mb-3 hover:scale-105 transition-transform duration-200"
          />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#FAE705] animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">
              Admin Portal
            </p>
          </div>
          <p className="text-[8px] font-bold text-white/20 mt-0.5 pl-3.5">
            Kab. Kepulauan Anambas
          </p>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          title="Tutup Menu"
          aria-label="Tutup Menu"
          className="lg:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 mt-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* USER INDICATOR */}
      <div className="px-5 py-3 border-b border-white/5 shrink-0 flex items-center gap-3">
        <div className="w-7 h-7 bg-[#FAE705]/20 flex items-center justify-center shrink-0">
          <Users className="w-3.5 h-3.5 text-[#FAE705]" />
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
            Masuk sebagai
          </p>
          <p className="text-[10px] font-black text-white/60">Administrator</p>
        </div>
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
      </div>

      <div className="px-5 pt-5 pb-2 shrink-0">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
          Menu Utama
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto pb-6">
        {navItem(
          "/admin",
          "Dashboard",
          true,
          <LayoutDashboard className="w-4 h-4" />,
        )}
        {navItem(
          "/admin/layanan",
          "Layanan SKM",
          false,
          <Layers className="w-4 h-4" />,
        )}
        {navItem(
          "/admin/pegawai",
          "Data Pegawai",
          false,
          <Users className="w-4 h-4" />,
        )}
        <div className="mx-4 my-3 border-t border-white/10" />
        {navItem(
          "/admin/ip",
          "IP Spam Block",
          false,
          <ShieldCheck className="w-4 h-4" />,
        )}
        {navItem(
          "/admin/logs",
          "Audit Log",
          false,
          <FileText className="w-4 h-4" />,
        )}
        {navItem(
          "/admin/settings",
          "Settings & QR",
          false,
          <Settings className="w-4 h-4" />,
        )}
        <div className="mx-4 my-3 border-t border-red-900/40" />
        <div className="px-5 pb-2">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-red-900/60">
            Danger Zone
          </p>
        </div>
        {navItem(
          "/admin/hapus-data",
          "Hapus Data Survei",
          false,
          <Trash2 className="w-4 h-4" />,
          true,
        )}
      </nav>

      {/* LOGOUT */}
      <div className="px-4 pb-3 pt-1 shrink-0 border-t border-white/10">
        <form action={logout}>
          <button
            type="submit"
            className="btn-shimmer w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-red-600/80 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-white/30 group-hover:text-white transition-colors" />
            Keluar
          </button>
        </form>
      </div>

      <div className="px-5 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 bg-[#FAE705]" />
          <div className="w-1.5 h-1.5 bg-[#009CC5]" />
          <p className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-0.5">
            SKM System v1.0
          </p>
        </div>
        <p className="text-[8px] text-white/15 font-medium pl-5">
          Permenpan RB 14/2017
        </p>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-50">
        {sidebarContent}
      </div>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-40 w-9 h-9 flex items-center justify-center bg-[#0D1F38] text-white hover:bg-[#132B4F] transition-colors duration-200"
        title="Buka Menu"
        aria-label="Buka Menu"
      >
        <Menu className="w-5 h-5" />
      </button>
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
