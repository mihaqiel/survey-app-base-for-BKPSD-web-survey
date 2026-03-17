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
        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-3 transition-all duration-200 ${
          active
            ? danger
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-blue-50 text-blue-700 border border-blue-100"
            : danger
              ? "text-slate-500 hover:text-red-600 hover:bg-red-50/50"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        }`}
      >
        <span
          className={`shrink-0 ${active ? (danger ? "text-red-600" : "text-blue-600") : danger ? "text-slate-400" : "text-slate-400"}`}
        >
          {icon}
        </span>
        <span>{label}</span>
      </Link>
    );
  };

  const sidebarContent = (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-gray-100">
      {/* HEADER */}
      <div className="px-5 py-5 border-b border-gray-100 shrink-0 flex items-start justify-between">
        <div>
          <Image
            src="/logo-bkpsdm.png"
            alt="BKPSDM"
            width={100}
            height={40}
            className="h-10 w-auto object-contain mb-3"
          />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-medium text-slate-500">
              Admin Portal
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 pl-4">
            Kab. Kepulauan Anambas
          </p>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          title="Tutup Menu"
          aria-label="Tutup Menu"
          className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-all duration-200 mt-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* USER INDICATOR */}
      <div className="px-5 py-3 border-b border-gray-50 shrink-0 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-slate-400">
            Masuk sebagai
          </p>
          <p className="text-sm font-medium text-slate-700">Administrator</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      </div>

      <div className="px-5 pt-5 pb-2 shrink-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto pb-6 space-y-1">
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
        <div className="mx-5 my-3 border-t border-gray-100" />
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
        <div className="mx-5 my-3 border-t border-gray-100" />
        <div className="px-5 pb-2">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
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
      <div className="px-4 pb-3 pt-1 shrink-0 border-t border-gray-100">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
            Keluar
          </button>
        </form>
      </div>

      <div className="px-5 py-3 border-t border-gray-50 shrink-0">
        <p className="text-xs text-slate-400">
          SKM System v1.0
        </p>
        <p className="text-xs text-slate-300 mt-0.5">
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
        className="lg:hidden fixed top-3 left-4 z-40 w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-slate-600 hover:bg-slate-50 rounded-lg shadow-sm transition-colors duration-200"
        title="Buka Menu"
        aria-label="Buka Menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40 animate-fade-in"
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
