"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// You can fetch this dynamically, but for UI speed, we list top ones or use a "Search" approach in the dropdown
// For now, let's list the first few and a "View All" link
const MENU_LAYANAN = [
  { id: "all", label: "Semua Layanan" },
  { id: "top5", label: "Top 5 Services" }, // Placeholder logic
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isLayananOpen, setIsLayananOpen] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 overflow-y-auto z-50 flex flex-col shadow-sm">
      <div className="p-8">
        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-xs font-black mb-4">
          GOV
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Admin Portal</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 pb-10">
        {/* 1. DASHBOARD HOME */}
        <Link 
          href="/admin" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
        </Link>

        {/* 2. LAYANAN DROPDOWN */}
        <div>
          <button 
            onClick={() => setIsLayananOpen(!isLayananOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive('/admin/layanan') ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">Layanan SKM</span>
            <svg className={`w-4 h-4 transition-transform ${isLayananOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {/* Dropdown Menu */}
          {isLayananOpen && (
            <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link href="/admin/layanan" className="block px-4 py-2 text-[10px] font-bold uppercase text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                Overview (All 22)
              </Link>
            </div>
          )}
        </div>

        {/* 3. PEGAWAI */}
        <Link 
          href="/admin/pegawai" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/pegawai') ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="text-xs font-bold uppercase tracking-widest">Data Pegawai</span>
        </Link>

        {/* 4. SETTINGS (QR Code Here) */}
        <Link 
          href="/admin/settings" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/settings') ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="text-xs font-bold uppercase tracking-widest">Settings & QR</span>
        </Link>
      </nav>
    </aside>
  );
}