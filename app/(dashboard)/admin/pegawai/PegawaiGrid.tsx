"use client";

import { useState } from "react";
import Link from "next/link";

interface Employee {
  id: string;
  nama: string;
}

export default function PegawaiGrid({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState("");

  const filtered = employees.filter((e) =>
    e.nama.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SEARCH BAR */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search staff by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition text-xs font-black">
            ✕ Clear
          </button>
        )}
      </div>

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"` : `Showing all ${employees.length} staff`}
        </p>
        <Link
          href="/admin/hapus-data?tab=pegawai"
          className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
        >
          🗑 Hapus Pegawai
        </Link>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center">
          <p className="text-sm font-bold text-gray-300">No staff found matching &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((emp) => (
            <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-4 hover:border-gray-300 hover:shadow-md transition-all">
              <p className="text-xs font-black text-gray-800 leading-snug">{emp.nama}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}