"use client";

import { deletePegawai } from "@/app/action/admin";
import { useState } from "react";

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
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
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
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition text-xs font-black"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {query ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"` : `Showing all ${employees.length} staff`}
        </p>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center">
          <p className="text-sm font-bold text-gray-300">No staff found matching "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="group relative bg-white rounded-2xl border border-gray-100 px-4 py-4 hover:border-gray-300 hover:shadow-md transition-all"
            >
              {/* Name */}
              <p className="text-xs font-black text-gray-800 leading-snug pr-6">{emp.nama}</p>

              {/* Delete button — visible on hover */}
              <form action={deletePegawai.bind(null, emp.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="submit"
                  title="Delete"
                  className="w-5 h-5 flex items-center justify-center bg-red-50 rounded-md text-red-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black"
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}